import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compareSync } from "bcryptjs";
import {
  CreateGuestSessionSchema,
  LoginSchema,
} from "@/features/auth/types/auth-schemas";
import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/lib/firebase/admin";
import GoogleProvider from "next-auth/providers/google";
import { processEventParticipation } from "@/features/user/lib/event-actions";
import { cookies } from "next/headers";
import { syncUserNameInFirestore } from "@/lib/firebase/sync-user-name";

async function getFirebaseToken({
  uid,
  email,
  displayName,
  photoURL,
}: {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
}) {
  try {
    const updateData: any = {};

    // Validate email format
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      updateData.email = email;
      updateData.emailVerified = true; // Google and regular logins in this app are considered verified
    }

    if (displayName && displayName.trim() !== "") {
      updateData.displayName = displayName;
    }

    // Validate photoURL (must be an absolute URL)
    if (photoURL && photoURL.startsWith("http")) {
      updateData.photoURL = photoURL;
    }

    // Sync user profile to Firebase Auth if we have valid data
    if (Object.keys(updateData).length > 0) {
      try {
        await adminAuth.updateUser(uid, updateData);
      } catch (error: any) {
        if (error.code === "auth/user-not-found") {
          try {
            await adminAuth.createUser({
              uid,
              ...updateData,
            });
          } catch (createError) {
            console.error("Error creating firebase user:", createError);
          }
        } else if (error.code === "auth/email-already-exists") {
          // If email belongs to another UID, we skip updating email but still try to generate token
          console.warn(
            `Email ${email} already exists for another UID in Firebase.`,
          );
          // Optionally update displayName/photoURL without email
          const { email: _, emailVerified: __, ...otherData } = updateData;
          if (Object.keys(otherData).length > 0) {
            try {
              await adminAuth.updateUser(uid, otherData);
            } catch (e) {
              console.error("Error updating user without email:", e);
            }
          }
        } else {
          console.error("Error updating firebase user:", error);
        }
      }
    }
    return await adminAuth.createCustomToken(uid);
  } catch (error) {
    console.error("Error creating firebase token:", error);
    return undefined;
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
              },
              select: {
                role: true,
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

            if (!guestCustomer || guestCustomer.role !== "CUSTOMER") {
              return null;
            }

            const firebaseToken = await getFirebaseToken({ uid: firebaseUid });

            return {
              id: firebaseUid,
              username: "",
              name: guestCustomer.name || name,
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

        // console.log(user);

        if (!user) return null;

        if (!user.password) return null;

        const isValid = compareSync(password, user.password);

        if (!isValid) {
          return null;
        }

        const firebaseToken = await getFirebaseToken({
          uid: user.id,
          email: user.username ?? undefined,
          displayName: user.name,
          photoURL: user.avatar,
        });

        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            last_login: new Date(),
          },
        });

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
          cartId: user.customer?.cart?.id || user.customer?.id,

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
        const userEmail = user.email as string;
        const cookieStore = await cookies();
        const guestId = cookieStore.get("guestId")?.value;

        const existingUser = await prisma.user.findUnique({
          where: { username: userEmail },
          include: {
            customer: {
              include: {
                cart: true,
              },
            },
          },
        });

        if (guestId) {
          const guestUser = await prisma.user.findUnique({
            where: { id: guestId, role: "CUSTOMER" },
            include: {
              customer: {
                include: {
                  cart: true,
                },
              },
            },
          });

          if (guestUser && !guestUser.username) {
            if (!existingUser) {
              // CASE 1: New user, convert guest to full user
              const newName = user.name as string;
              const newAvatar = user.image || "avatars/default-avatar.jpg";

              await prisma.user.update({
                where: { id: guestId },
                data: {
                  username: userEmail,
                  name: newName,
                  avatar: newAvatar,
                  last_login: new Date(),
                },
              });

              try {
                await processEventParticipation(guestId);
              } catch (error) {
                console.error("Error triggering event participation:", error);
              }

              cookieStore.delete("guestId");
              try {
                await syncUserNameInFirestore(guestId, newName, newAvatar);
              } catch (error) {
                // Non-fatal: Prisma sudah terupdate, Firestore sync bisa retry manual
                console.error(
                  "Failed to sync user name to Firestore (CASE 1):",
                  error,
                );
              }
              return true;
            } else {
              // CASE 2: Existing user, merge guest data into existing account
              const guestCustomer = guestUser.customer;
              const existingCustomer = existingUser.customer;
              const newName = user.name as string;
              const newAvatar = user.image || "avatars/default-avatar.jpg";

              if (guestCustomer && existingCustomer) {
                await prisma.$transaction(async (tx) => {
                  // 1. Transfer Orders
                  await tx.order.updateMany({
                    where: { customer_id: guestCustomer.id },
                    data: { customer_id: existingCustomer.id },
                  });

                  // 2. Transfer Discounts
                  await tx.customerDiscount.updateMany({
                    where: { customer_id: guestCustomer.id },
                    data: { customer_id: existingCustomer.id },
                  });

                  // 3. Transfer Violations
                  await tx.customerViolation.updateMany({
                    where: { customer_id: guestCustomer.id },
                    data: { customer_id: existingCustomer.id },
                  });

                  // 4. Update table location if existing doesn't have it
                  if (
                    !existingCustomer.table_number &&
                    guestCustomer.canteen_id
                  ) {
                    await tx.customer.update({
                      where: { id: existingCustomer.id },
                      data: {
                        canteen_id: guestCustomer.canteen_id,
                        floor: guestCustomer.floor,
                        table_number: guestCustomer.table_number,
                      },
                    });
                  }

                  // 4. Handle Cart (Simplified: move shop carts if existing cart is empty)
                  if (guestCustomer.cart) {
                    if (!existingCustomer.cart) {
                      await tx.cart.update({
                        where: { id: guestCustomer.cart.id },
                        data: { customer_id: existingCustomer.id },
                      });
                    } else {
                      // Move shop carts to existing cart
                      await tx.shopCart.updateMany({
                        where: { cart_id: guestCustomer.cart.id },
                        data: { cart_id: existingCustomer.cart.id },
                      });
                    }
                  }

                  // 5. Delete guest user (cascades to customer and leftover cart)
                  await tx.user.delete({
                    where: { id: guestId },
                  });
                });
              }

              try {
                // userId yang dipakai di Firestore adalah existingUser.id (bukan guestId yang sudah didelete)
                await syncUserNameInFirestore(
                  existingUser.id,
                  newName,
                  newAvatar,
                );
              } catch (error) {
                console.error(
                  "Failed to sync user name to Firestore (CASE 2):",
                  error,
                );
              }

              cookieStore.delete("guestId");
              return true;
            }
          }
        }

        // CASE 3: No guest session
        if (!existingUser) {
          // Create brand new user
          await prisma.user.create({
            data: {
              id: user.id as string,
              name: user.name as string,
              username: userEmail,
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
          // Update existing user profile if name is missing
          const newName = user.name as string;
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { name: newName },
          });

          try {
            await syncUserNameInFirestore(existingUser.id, newName);
          } catch (error) {
            console.error("Failed to sync missing user name to Firestore:", error);
          }
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
        token.username = user.username || (user as any).email;
        token.name = user.name;
        token.role = user.role;
        token.avatar = user.avatar || (user as any).image;

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
      const userEmail = token.email || (user as any)?.email;
      if (account?.provider === "google" && userEmail) {
        const dbUser = await prisma.user.findUnique({
          where: { username: userEmail },
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
          token.username = dbUser.username;
          token.role = dbUser.role;
          token.avatar = dbUser.avatar;
          token.customerId = dbUser.customer?.id;
          token.cartId = dbUser.customer?.cart?.id;

          if (!token.firebaseToken || !token.firebaseTokenCreatedAt) {
            const firebaseToken = await getFirebaseToken({
              uid: dbUser.id,
              email: dbUser.username ?? undefined,
              displayName: dbUser.name,
              photoURL: dbUser.avatar,
            });
            if (firebaseToken) {
              token.firebaseToken = firebaseToken;
              token.firebaseTokenCreatedAt = Math.floor(Date.now() / 1000);
            }
          }
        }
      }

      // Refresh Firebase Token if it's older than 50 minutes (3000 seconds)
      const now = Math.floor(Date.now() / 1000);
      const tokenCreatedAt = (token.firebaseTokenCreatedAt as number) || 0;

      if (token.id && token.firebaseToken && now - tokenCreatedAt > 3000) {
        // console.log("Refreshing Firebase token for user:", token.id);
        const newFirebaseToken = await getFirebaseToken({
          uid: token.id as string,
          email: token.username as string,
          displayName: token.name as string,
          photoURL: token.avatar as string,
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
