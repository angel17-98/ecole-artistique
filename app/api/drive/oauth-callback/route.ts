// app/api/drive/oauth-callback/route.ts
// Reçoit le code d'autorisation Google et stocke le refresh token en base
// Google redirige ici après autorisation

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const userId = searchParams.get("state"); // user_id passé dans oauth-connect
  const error = searchParams.get("error");

  // Erreur côté Google (ex: utilisateur a annulé)
  if (error) {
    return NextResponse.redirect(
      new URL(`/plateforme/direction?drive_error=${error}`, req.url)
    );
  }

  if (!code || !userId) {
    return NextResponse.redirect(
      new URL("/plateforme/direction?drive_error=missing_params", req.url)
    );
  }

  try {
    // Échanger le code contre access_token + refresh_token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
        client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URI!,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.refresh_token) {
      console.error("Pas de refresh_token dans la réponse:", tokenData);
      return NextResponse.redirect(
        new URL("/plateforme/direction?drive_error=no_refresh_token", req.url)
      );
    }

    // Calculer l'expiration de l'access token
    const expiresAt = new Date(Date.now() + (tokenData.expires_in ?? 3600) * 1000);

    // Stocker en base (upsert — un seul token par user)
    const { error: dbError } = await supabaseAdmin
      .from("drive_tokens")
      .upsert({
        user_id: userId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (dbError) {
      console.error("Erreur stockage token:", dbError);
      return NextResponse.redirect(
        new URL("/plateforme/direction?drive_error=db_error", req.url)
      );
    }

    // Succès → retour dashboard direction
    return NextResponse.redirect(
      new URL("/plateforme/direction?drive_connected=true", req.url)
    );

  } catch (err: any) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(
      new URL(`/plateforme/direction?drive_error=${encodeURIComponent(err.message)}`, req.url)
    );
  }
}