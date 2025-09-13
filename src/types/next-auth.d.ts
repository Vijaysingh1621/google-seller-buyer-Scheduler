import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      calendarConnected: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    calendarConnected: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    userId: string;
    calendarConnected: boolean;
  }
}