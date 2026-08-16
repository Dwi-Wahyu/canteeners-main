import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compareSync } from "bcryptjs";
import { sign } from "jsonwebtoken";
import {
  CreateGuestSessionSchema,
  LoginSchema,
} from "@/features/auth/types/auth-schemas";
import { prisma } from "@/lib/prisma";
import GoogleProvider from "next-auth/providers/google";
import { processEventParticipation } from "@/features/user/lib/event-actions";

async function getFirebaseToken({ uid }: { uid: string }) {
  return undefined;
}

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        name: { label: "Name" },
        isGuest: { label: "Is Guest" },
        firebaseUid: { label: "Firebase UID" },
      },
      authorize: async (credentials) => {
        if (!credentials) {
          return null;
        }

        // 1. Coba parse sebagai Guest Session
        const parsedCreateGuestSession =
          CreateGuestSessionSchema.safeParse(credentials);
        
        if (parsedCreateGuestSession.success) {
          const { isGuest, firebaseUid, name } = parsedCreateGuestSession.data;

          if (isGuest === "true") {
            if (!firebaseUid) {
              return null;
            }

            const guestCustomer = await prisma.user.findUnique({
              where: {
                id: firebaseUid,
                role: "CUSTOMER",
              },
              select: {
                name: true,
                customer: {
                  select: {
                    id: true,
                    cart: {
                      select: {
                        id: true,
                      },
                    },
                  },
                },
              },
            });

            if (!guestCustomer) {
              return null;
            }

            const firebaseToken = await getFirebaseToken({ uid: firebaseUid });

            return {
              id: firebaseUid,
              username: "",
              name,
              role: "CUSTOMER",
              avatar: "default-avatar.jpeg",
              cartId: guestCustomer.customer?.cart?.id,
              customerId: guestCustomer.customer?.id,
              shopId: undefined,
              shopName: undefined,
              ownerId: undefined,
              firebaseToken,
              firebaseTokenCreatedAt: Math.floor(Date.now() / 1000),
            };
          }
        }

        // 2. Jika bukan guest, coba parse sebagai Login Normal
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { username, password } = parsed.data;

        const user = await prisma.user.findFirst({
          where: { username },
          include: {
            customer: {
              select: {
                id: true,
                cart: {
                  select: {
                    id: true,
                  },
                },
              },
            },
            owner: {
              select: {
                id: true,
                shop: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        });

        if (!user) return null;

        if (!user.password) return null;

        const isValid = compareSync(password, user.password);

        if (!isValid) {
          return null;
        }

        const firebaseToken = await getFirebaseToken({ uid: user.id });

        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            last_login: new Date(),
          },
        });

        let cartId = user.customer?.cart?.id;
        if (user.customer && !cartId) {
          const newCart = await prisma.cart.create({
            data: {
              customer_id: user.customer.id,
              status: "ACTIVE",
            },
          });
          cartId = newCart.id;
        }

        return {
          id: user.id,
          username: user.username ?? "",
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          // Owner payload
          ownerId: user.owner?.id,
          shopId: user.owner?.shop?.id,
          shopName: user.owner?.shop?.name,
          // Customer payload
          customerId: user.customer?.id,
          cartId: cartId,

          firebaseToken,
          firebaseTokenCreatedAt: Math.floor(Date.now() / 1000),
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/",
    signOut: "/logout",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { username: user.email as string },
        });

        if (!existingUser) {
          // Buat user baru jika belum ada
          await prisma.user.create({
            data: {
              id: user.id as string,
              name: user.name as string,
              username: user.email as string,
              role: "CUSTOMER",
              avatar: user.image || "avatars/default-avatar.jpg",
              customer: {
                create: {
                  cart: {
                    create: {
                      status: "ACTIVE",
                    },
                  },
                },
              },
            },
          });

          try {
            await processEventParticipation(user.id as string);
          } catch (error) {
            console.error("Error triggering event participation:", error);
          }
        } else if (!existingUser.name || existingUser.name === "") {
          // Update nama jika kosong di database
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { name: user.name as string },
          });
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
        session.user.avatar = token.avatar as string;
        session.user.accessToken = token.accessToken as string;

        // Owner payload
        session.user.shopName = token.shopName as string;
        session.user.shopId = token.shopId as string;
        session.user.ownerId = token.ownerId as string;
        session.user.firebaseToken = token.firebaseToken as string;
        session.user.firebaseTokenCreatedAt =
          token.firebaseTokenCreatedAt as number;

        // Customer payload
        session.user.customerId = token.customerId as string;
        session.user.cartId = token.cartId as string;
      }
      return session;
    },
    async jwt({ token, user, trigger, session, account }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.name = user.name;
        token.role = user.role;
        token.avatar = user.avatar;

        // Owner payload
        token.shopName = user.shopName;
        token.shopId = user.shopId;
        token.ownerId = user.ownerId;
        token.firebaseToken = user.firebaseToken;
        token.firebaseTokenCreatedAt = user.firebaseTokenCreatedAt;

        // Customer payload
        token.customerId = user.customerId;
        token.cartId = user.cartId;
      }

      // If social login (Google), fetch role and other data from DB
      if (account?.provider === "google" && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { username: token.email },
          include: {
            customer: {
              select: {
                id: true,
                cart: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.name = dbUser.name;
          token.role = dbUser.role;
          token.avatar = dbUser.avatar;
          token.customerId = dbUser.customer?.id;

          let cartId = dbUser.customer?.cart?.id;
          if (dbUser.customer && !cartId) {
            const newCart = await prisma.cart.create({
              data: {
                customer_id: dbUser.customer.id,
                status: "ACTIVE",
              },
            });
            cartId = newCart.id;
          }
          token.cartId = cartId;

          if (!token.firebaseToken || !token.firebaseTokenCreatedAt) {
            const firebaseToken = await getFirebaseToken({ uid: dbUser.id });
            token.firebaseToken = firebaseToken;
            token.firebaseTokenCreatedAt = Math.floor(Date.now() / 1000);
          }
        }
      }

      // Generate WebSocket JWT accessToken
      if (token.id) {
        const secret = process.env.NEXTAUTH_SECRET || "secret";
        token.accessToken = sign(
          { sub: token.id, role: token.role, email: token.email },
          secret
        );
      }

      // Refresh Firebase Token if it's older than 50 minutes (3000 seconds)
      const now = Math.floor(Date.now() / 1000);
      const tokenCreatedAt = (token.firebaseTokenCreatedAt as number) || 0;

      if (token.id && token.firebaseToken && now - tokenCreatedAt > 3000) {
        console.log("Refreshing Firebase token for user:", token.id);
        const newFirebaseToken = await getFirebaseToken({
          uid: token.id as string,
        });
        if (newFirebaseToken) {
          token.firebaseToken = newFirebaseToken;
          token.firebaseTokenCreatedAt = now;
        }
      }

      if (trigger === "update" && session) {
        token.name = session.user.name;
      }

      return token;
    },
  },
  trustHost: true,
};

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
