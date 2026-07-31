import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ROLE_HOME } from "@/lib/constants";
import { IRole } from "@/lib/types";
import { jwtUtils } from "@/utils/jwt";

/**
 * Route protection (Next.js 16 renamed `middleware.ts` to `proxy.ts`).
 *
 * Three jobs, all of them about sending people to the right place:
 *   1. anonymous visitor hits a private route  → /auth/login?redirectTo=…
 *   2. signed-in user hits /auth/*             → their own dashboard
 *   3. signed-in user hits another role's area → their own dashboard
 *
 * This is navigation, not authorization. Every byte of data is fetched
 * server-side from an API that re-checks the token and the user's current
 * role and ban status, so a tampered cookie buys nothing but an empty page.
 */

const AUTH_ROUTES = ["/auth/login", "/auth/register"];

/** Everything under these prefixes needs a session. */
const PROTECTED_PREFIXES = ["/dashboard", "/payment"];

/** Dashboard areas that belong to exactly one role. */
const ROLE_AREAS: { prefix: string; role: IRole }[] = [
  { prefix: "/dashboard/customer", role: "CUSTOMER" },
  { prefix: "/dashboard/technician", role: "TECHNICIAN" },
  { prefix: "/dashboard/admin", role: "ADMIN" },
];

const startsWith = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("accessToken")?.value;
  const user = jwtUtils.getUserFromToken(token);

  const isAuthRoute = AUTH_ROUTES.some((route) => startsWith(pathname, route));
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    startsWith(pathname, prefix),
  );

  // Signed in and staring at the login form — go somewhere useful instead.
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL(ROLE_HOME[user.role], request.url));
  }

  if (!user) {
    if (!isProtected) return NextResponse.next();

    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    const response = NextResponse.redirect(loginUrl);
    // A stale or malformed cookie shouldn't linger.
    if (token) response.cookies.delete("accessToken");
    return response;
  }

  // `/dashboard` is a shortcut to whichever dashboard this user owns.
  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL(ROLE_HOME[user.role], request.url));
  }

  const area = ROLE_AREAS.find(({ prefix }) => startsWith(pathname, prefix));
  if (area && area.role !== user.role) {
    return NextResponse.redirect(new URL(ROLE_HOME[user.role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|webp)$).*)"],
};
