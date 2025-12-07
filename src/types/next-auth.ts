import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      username: string;
      name: string;
      avatar: string;
      role: string;
      owner_id?: string;
      shop_id?: string;
    };
  }

  interface User {
    id: string;
    username: string;
    name: string;
    avatar: string;
    role: string;
    owner_id?: string;
    shop_id?: string;
  }
}
