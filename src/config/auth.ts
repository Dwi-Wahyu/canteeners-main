import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compareSync } from "bcryptjs";
import { LoginSchema } from "@/features/auth/lib/auth-type";
import { prisma } from "@/lib/prisma";

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials) return null;

        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { username, password } = parsed.data;

        const user = await prisma.user.findFirst({
          where: { username },
          include: {
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

        console.log(user);

        if (!user) return null;

        if (!user.password) return null;

        const isValid = compareSync(password, user.password);

        if (!isValid) {
          return null;
        }

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
          shopId: user.owner?.shop?.id,
          shopName: user.owner?.shop?.name,
          ownerId: user.owner?.id,
        };
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
        session.user.shopName = token.shopName as string;
        session.user.shopId = token.shopId as string;
        session.user.ownerId = token.ownerId as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.name = user.name;
        token.role = user.role;
        token.avatar = user.avatar;
        token.shopName = user.shopName;
        token.shopId = user.shopId;
        token.ownerId = user.ownerId;
      }
      return token;
    },
  },
  trustHost: true,
};

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);
