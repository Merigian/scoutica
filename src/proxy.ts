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

  // Keep users on the domain they requested. next-intl builds the
  // `/` → `/{locale}` redirect against Vercel's canonical `*.vercel.app`
  // host, which would bounce visitors off the custom domain. If the redirect
  // Location points at a different host than the one requested, rewrite it
  // back to the incoming (forwarded) host so the address bar stays put.
  const location = response.headers.get("location");
  if (location) {
    const forwardedHost =
      request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    if (forwardedHost) {
      try {
        const target = new URL(location, request.url);
        if (target.host !== forwardedHost) {
          target.host = forwardedHost;
          const proto = request.headers.get("x-forwarded-proto");
          if (proto) target.protocol = `${proto}:`;
          response.headers.set("location", target.toString());
        }
      } catch {
        // Ignore malformed Location values and leave the response untouched.
      }
    }
  }

  // Pass pathname to server components via header
  response.headers.set("x-pathname", request.nextUrl.pathname);
  return response;
});

export const config = {
  // Match all pathnames except for API routes, static files, etc.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
