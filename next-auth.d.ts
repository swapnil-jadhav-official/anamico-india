import NextAuth, { DefaultSession } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isNewUser?: boolean;
      phone?: string;
      address?: string;
      role?: string;
    } & DefaultSession["user"];
  }

  interface User {
    isNewUser?: boolean;
    phone?: string;
    address?: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    isNewUser?: boolean;
    phone?: string;
    address?: string;
    role?: string;
  }
}
