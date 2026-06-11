import NextAuth from "next-auth";
import createMiddleware from "next-intl/middleware";
import authConfig from "@/lib/auth.config";
import { routing } from "@/i18n/routing";

const { auth } = NextAuth(authConfig);
const intlMiddleware = createMiddleware(routing);

// `auth()` runs the `authorized` callback in auth.config.ts first.
// If it returns true (or no redirect), we delegate to next-intl middleware
// which handles locale negotiation/rewriting.
export default auth((request) => {
  const response = intlMiddleware(request);
  // Pass pathname to server components via header
  response.headers.set("x-pathname", request.nextUrl.pathname);
  return response;
});

export const config = {
  // Match all pathnames except for API routes, static files, etc.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
