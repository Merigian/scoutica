import type { NextAuthConfig } from "next-auth";

// Edge-compatible auth config (no Prisma, no Node-only modules).
// Used both by the full server-side NextAuth instance (`src/lib/auth.ts`)
// AND by the edge middleware (`src/middleware.ts`).
export default {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/dashboard",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as { role?: string }).role;
        token.locale = (user as { locale?: string }).locale;
        token.emailVerified = !!(user as { emailVerified?: Date | boolean | null }).emailVerified;
      }

      // Handle session updates (e.g., locale change, email verification)
      if (trigger === "update" && session) {
        const s = session as { locale?: string; role?: string; emailVerified?: boolean };
        if (s.locale) token.locale = s.locale;
        if (s.role) token.role = s.role;
        if (s.emailVerified !== undefined) token.emailVerified = s.emailVerified;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string | undefined;
        (session.user as { locale?: string }).locale = token.locale as string | undefined;
        (session.user as { emailVerified?: boolean }).emailVerified = !!token.emailVerified;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;

      const isAuthPage = path.includes("/login") || path.includes("/register");
      const isVerifyPage = path.includes("/verify-email");
      const isWaitlistPage = path.includes("/waitlist");
      const isForgotPwd = path.includes("/forgot-password") || path.includes("/reset-password");
      const isCompleteSetup = path.includes("/complete-setup");

      // Match dashboard paths only at the start of the path (after optional locale prefix).
      // Avoids matching e.g. /it/register/scout as a "scout" dashboard.
      const isDashboard =
        /^(?:\/[a-z]{2})?\/(model|scout|studio|admin|dashboard)(?:\/|$)/.test(path);

      if (isDashboard) {
        if (!isLoggedIn) {
          const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
          return Response.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
        }

        // Email verification gate
        const user = auth?.user as { email?: string | null; emailVerified?: boolean; role?: string };
        if (!user.emailVerified) {
          const email = user.email;
          const redirectUrl = email
            ? `/verify-email?email=${encodeURIComponent(email)}`
            : "/verify-email";
          return Response.redirect(new URL(redirectUrl, nextUrl));
        }

        // Role-based route protection
        const role = user.role;
        if (/\/model(\/|$)/.test(path) && role !== "MODEL" && role !== "ADMIN") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        if (/\/scout(\/|$)/.test(path) && role !== "SCOUT" && role !== "ADMIN") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        if (/\/studio(\/|$)/.test(path) && role !== "STUDIO" && role !== "ADMIN") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        if (/\/admin(\/|$)/.test(path) && role !== "ADMIN") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      // Public auxiliary pages: always allowed
      if (isVerifyPage || isWaitlistPage || isForgotPwd || isCompleteSetup) {
        return true;
      }

      // Redirect logged-in users away from auth pages
      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
  providers: [], // Populated in full auth.ts
} satisfies NextAuthConfig;
