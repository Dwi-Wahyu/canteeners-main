import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      username: string;
      name: string;
      avatar: string;
      role: string;
      firebaseToken?: string;
      // Owner payload
      ownerId?: string;
      shopName?: string;
      shopId?: string;
      // Customer payload
      customerId?: string;
      cartId?: string;
    };
  }

  interface User {
    id: string;
    username: string;
    name: string;
    avatar: string;
    role: string;
    firebaseToken?: string;
    // Owner payload
    ownerId?: string;
    shopName?: string;
    shopId?: string;
    // Customer payload
    customerId?: string;
    cartId?: string;
  }
}
