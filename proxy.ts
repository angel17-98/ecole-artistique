/*fichier pour bloquer le site */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "site_unlock";

export function proxy(req: NextRequest) {
  // Active/désactive la protection via .env.local
  const isProtected = process.env.SITE_PASSWORD_ENABLED === "true";
  if (!isProtected) return NextResponse.next();

  const { pathname } = req.nextUrl;

  // Routes publiques (sinon le site casse)
  const isPublicPath =
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/unlock") ||
    pathname.startsWith("/api/unlock");

  if (isPublicPath) return NextResponse.next();

  // Si déjà déverrouillé
  const cookieValue = req.cookies.get(COOKIE_NAME)?.value;
  if (cookieValue === "ok") return NextResponse.next();

  // Sinon → redirection vers /unlock
  const url = req.nextUrl.clone();
  url.pathname = "/unlock";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
