import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      username: string;
      name: string;
      avatar: string;
      role: string;
      ownerId?: string;
      shopName?: string;
      shopId?: string;
      firebaseToken?: string;
    };
  }

  interface User {
    id: string;
    username: string;
    name: string;
    avatar: string;
    role: string;
    ownerId?: string;
    shopName?: string;
    shopId?: string;
    firebaseToken?: string;
  }
}
