import type { NextAuthConfig } from "next-auth";

// Edge-compatible auth config (no Prisma — used by middleware)
export default {
  pages: {
    signIn: "/login",
    newUser: "/dashboard",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.includes("/login") || nextUrl.pathname.includes("/register");
      const isVerifyPage = nextUrl.pathname.includes("/verify-email");
      const isWaitlistPage = nextUrl.pathname.includes("/waitlist");
      const isDashboard = nextUrl.pathname.includes("/model/") ||
        nextUrl.pathname.includes("/scout/") ||
        nextUrl.pathname.includes("/studio/") ||
        nextUrl.pathname.includes("/admin/") ||
        nextUrl.pathname.includes("/dashboard");

      if (isDashboard) {
        if (!isLoggedIn) return false;

        // Email verification gate: redirect to verify-email if not verified
        const emailVerified = (auth?.user as any)?.emailVerified;
        if (!emailVerified) {
          const email = auth?.user?.email;
          const redirectUrl = email
            ? `/verify-email?email=${encodeURIComponent(email)}`
            : "/verify-email";
          return Response.redirect(new URL(redirectUrl, nextUrl));
        }

        // Role-based route protection
        const role = auth?.user?.role;
        if (nextUrl.pathname.includes("/model/") && role !== "MODEL") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        if (nextUrl.pathname.includes("/scout/") && role !== "SCOUT") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        if (nextUrl.pathname.includes("/studio/") && role !== "STUDIO") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        if (nextUrl.pathname.includes("/admin/") && role !== "ADMIN") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      // Allow verify-email and waitlist pages even when logged in
      if (isVerifyPage || isWaitlistPage) {
        return true;
      }

      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
  providers: [], // Populated in full auth.ts
} satisfies NextAuthConfig;
