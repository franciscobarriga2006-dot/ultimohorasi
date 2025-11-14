// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC = [
  "/auth/homepublic",
  "/auth/login",
  "/auth/register",
  "/reset",
  "/_next",
  "/_next/image",
  "/favicon.ico",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const devAuth = req.cookies.get("dev_auth")?.value === "1";
  const cookieUid = Number(req.cookies.get("uid")?.value || 0);
  const headerUid = Number(req.headers.get("x-user-id") || 0);

  if (devAuth) {
    const actorId = cookieUid || headerUid || 0;

    if (cookieUid && headerUid && cookieUid !== headerUid) {
      console.warn(
        `[middleware] uid mismatch -> cookie=${cookieUid} header=${headerUid} path=${pathname}`
      );
    }

    if (actorId) {
      console.log(
        `[middleware] auth OK -> actorId=${actorId} source=${cookieUid ? "cookie" : headerUid ? "header" : "none"} path=${pathname}`
      );
    } else {
      console.log(`[middleware] auth OK -> sin actorId path=${pathname}`);
    }

    return NextResponse.next();
  }

  console.log(`[middleware] sin auth -> redirect /auth/homepublic path=${pathname}`);
  return NextResponse.redirect(new URL("/auth/homepublic", req.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)"],
};
