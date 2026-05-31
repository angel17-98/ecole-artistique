// app/api/drive/oauth-connect/route.ts
// Génère le lien d'autorisation Google OAuth2
// Accessible uniquement par la direction

import { NextResponse } from "next/server";
import { createClient } from "@/lib/plateforme/supabase/server";

export async function GET() {
  // Vérifier direction
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "direction") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID!;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI!;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/drive",
    access_type: "offline",
    prompt: "consent", // force refresh_token à chaque fois
    state: user.id,    // on passe le user_id pour le callback
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  return NextResponse.json({ url: authUrl });
}