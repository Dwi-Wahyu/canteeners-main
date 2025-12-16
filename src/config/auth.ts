import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compareSync } from "bcryptjs";
import {
  CreateGuestSessionSchema,
  LoginSchema,
} from "@/features/auth/lib/auth-type";
import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/lib/firebase/admin";

async function getFirebaseToken({ uid }: { uid: string }) {
  try {
    return await adminAuth.createCustomToken(uid);
  } catch (error) {
    console.error("Error creating firebase token:", error);
    return null;
  }
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

        const parsedCreateGuestSession =
          CreateGuestSessionSchema.safeParse(credentials);
        if (!parsedCreateGuestSession.success) return null;

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

          return {
            id: firebaseUid,
            username: "",
            name,
            role: "CUSTOMER",
            avatar: "avatars/default-avatar.jpeg",
            cartId: guestCustomer.customer?.cart?.id,
            customerId: guestCustomer.customer?.id,
            shopId: undefined,
            shopName: undefined,
            ownerId: undefined,
          };
        }

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

        if (firebaseToken) {
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
            cartId: user.customer?.id,

            firebaseToken,
          };
        } else {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/",
    signOut: "/logout",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
        session.user.avatar = token.avatar as string;

        // Owner payload
        session.user.shopName = token.shopName as string;
        session.user.shopId = token.shopId as string;
        session.user.ownerId = token.ownerId as string;
        session.user.firebaseToken = token.firebaseToken as string;

        // Customer payload
        session.user.customerId = token.customerId as string;
        session.user.cartId = token.cartId as string;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
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

        // Customer payload
        token.customerId = user.customerId;
        token.cartId = user.cartId;
      }

      return token;
    },
  },
  trustHost: true,
};

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
