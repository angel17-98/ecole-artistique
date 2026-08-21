/* proxy.ts — protection site + auth plateforme */
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "site_unlock";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ─── Injecter le pathname dans les headers pour app/layout.tsx ─────────────
  // Sans ça, headers().get("x-pathname") est vide de façon imprévisible
  // et le footer s'affiche/disparaît au hasard sur /plateforme
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  // ─── Routes statiques toujours autorisées ─────────────────
  const isStaticPath =
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/unlock") ||
    pathname.startsWith("/api/unlock")||
    pathname.startsWith("/api/webhooks");

  if (isStaticPath) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

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
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // ─── Auth plateforme ───────────────────────────────────────
  let supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } });

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
          supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Routes accessibles sans connexion
  const publicRoutes = [
    "/plateforme/login",
    "/plateforme/register",
    "/plateforme/forgot-password",
    "/plateforme/reset-password",
    "/plateforme/inscription",
    "/plateforme/candidature",
  ];

  const isPublicRoute = publicRoutes.some(r => pathname.startsWith(r));

  if (!isPublicRoute && !user) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/plateforme/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicRoute && user) {
    const authOnlyRoutes = [
      "/plateforme/login",
      "/plateforme/register",
      "/plateforme/forgot-password",
      "/plateforme/reset-password",
    ];
    const isAuthOnlyRoute = authOnlyRoutes.some(r => pathname.startsWith(r));

    if (isAuthOnlyRoute) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const dashboardUrl = req.nextUrl.clone();

      if (profile?.role === "direction") {
        dashboardUrl.pathname = "/plateforme/direction";
      } else if (
        profile?.role === "prof_salarie" ||
        profile?.role === "prof_independant"
      ) {
        dashboardUrl.pathname = "/plateforme/prof";
      } else {
        dashboardUrl.pathname = "/plateforme/dashboard";
      }

      return NextResponse.redirect(dashboardUrl);
    }
  }

  // ─── Protéger /plateforme/prof contre les non-profs ───────
  if (pathname.startsWith("/plateforme/prof")) {
    if (!user) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/plateforme/login";
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (
      profile?.role !== "prof_salarie" &&
      profile?.role !== "prof_independant" &&
      profile?.role !== "direction"
    ) {
      const dashboardUrl = req.nextUrl.clone();
      dashboardUrl.pathname = "/plateforme/dashboard";
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // ─── Rediriger les profs/direction hors de /plateforme/dashboard ──────────
  if (pathname === "/plateforme/dashboard" || pathname === "/plateforme") {
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "prof_salarie" || profile?.role === "prof_independant") {
        const profUrl = req.nextUrl.clone();
        profUrl.pathname = "/plateforme/prof";
        return NextResponse.redirect(profUrl);
      }

      if (profile?.role === "direction") {
        const dirUrl = req.nextUrl.clone();
        dirUrl.pathname = "/plateforme/direction";
        return NextResponse.redirect(dirUrl);
      }
    }
  }

  return supabaseResponse;
}