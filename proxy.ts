/* Proxy — protection site + auth plateforme */
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "site_unlock";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ─── Routes statiques toujours autorisées ─────────────────
  const isStaticPath =
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/unlock") ||
    pathname.startsWith("/api/unlock");

  if (isStaticPath) return NextResponse.next();

  // ─── Protection mot de passe site public ──────────────────
  const isProtected = process.env.SITE_PASSWORD_ENABLED === "true";
  if (isProtected && !pathname.startsWith("/plateforme")) {
    const cookieValue = req.cookies.get(COOKIE_NAME)?.value;
    if (cookieValue !== "ok") {
      const url = req.nextUrl.clone();
      url.pathname = "/unlock";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  // ─── Routes non-plateforme : on passe ─────────────────────
  if (!pathname.startsWith("/plateforme")) {
    return NextResponse.next();
  }

  // ─── Auth plateforme ───────────────────────────────────────
  let supabaseResponse = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_PLATEFORME_URL!,
    process.env.NEXT_PUBLIC_PLATEFORME_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const publicRoutes = [
    "/plateforme/login",
    "/plateforme/register",
    "/plateforme/forgot-password",
    "/plateforme/reset-password",
  ];

  const isPublicRoute = publicRoutes.some(r => pathname.startsWith(r));

  if (!isPublicRoute && !user) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/plateforme/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicRoute && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const dashboardUrl = req.nextUrl.clone();
    dashboardUrl.pathname = profile?.role === "direction"
      ? "/plateforme/direction/profs"
      : "/plateforme/dashboard";

    return NextResponse.redirect(dashboardUrl);
  }

  // ── Injecter le pathname pour masquer Header/Footer ────────
  supabaseResponse.headers.set("x-pathname", pathname);
  return supabaseResponse;
}