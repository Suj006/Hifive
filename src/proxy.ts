import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

// Assets the login page itself needs, reachable before authentication.
const PUBLIC_PATHS = new Set(["/logo.jpeg"]);
// Only the login attempt itself has to work with no session yet. Every other
// /api/auth/* route (me, logout, change-password) self-checks the session and
// is fine falling through to the normal "not signed in" handling below.
const PUBLIC_API_PATH = "/api/auth/login";

// Admin-only surface — Viewer accounts must never reach these, not even to
// read the list of other users.
const ADMIN_ONLY_API_PREFIX = "/api/users";
const ADMIN_ONLY_PAGE_PREFIX = "/users";

function forbidden() {
  return NextResponse.json(
    { error: "Your account has view-only access." },
    { status: 403 }
  );
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.has(pathname) || pathname === PUBLIC_API_PATH) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (pathname === "/login") {
    // Already signed in — no reason to see the login screen again.
    if (session) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  if (!session) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Viewer accounts are enforced here, once, at the edge — not by trusting
  // every route handler (or every future one) to remember its own check.
  if (session.role === "VIEWER") {
    if (pathname.startsWith(ADMIN_ONLY_API_PREFIX)) return forbidden();
    if (pathname.startsWith("/api")) {
      const method = request.method.toUpperCase();
      const isReadOnly = method === "GET" || method === "HEAD" || method === "OPTIONS";
      const isSelfService =
        pathname === "/api/auth/logout" || pathname === "/api/auth/change-password";
      if (!isReadOnly && !isSelfService) return forbidden();
    } else if (pathname.startsWith(ADMIN_ONLY_PAGE_PREFIX)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png).*)"],
};
