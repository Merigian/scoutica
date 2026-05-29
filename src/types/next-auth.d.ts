import type { UserRole } from "@prisma/client";

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
      locale: string;
      emailVerified: boolean;
    };
  }

  interface User {
    role: UserRole;
    locale: string;
    emailVerified: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    locale: string;
    emailVerified: boolean;
  }
}
