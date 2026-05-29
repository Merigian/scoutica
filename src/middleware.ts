import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  // Pass pathname to server components via header
  response.headers.set("x-pathname", request.nextUrl.pathname);
  return response;
}

export const config = {
  // Match all pathnames except for API routes, static files, etc.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
