// app/api/auth/lien-connexion/route.ts
// « Recevoir un lien de connexion » (18/11/2026) : pour les comptes créés sans
// mot de passe par l'inscription en deux temps (et pour ceux qui l'ont oublié).
// Répond toujours la même chose, que le compte existe ou non : on ne révèle
// jamais quelles adresses ont un compte.

import { NextRequest, NextResponse } from "next/server";
import { cheminSur, envoyerLienConnexion } from "@/lib/lien-connexion";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 160) : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "Adresse mail invalide" }, { status: 400 });
  }
  if (typeof body.site_web === "string" && body.site_web.trim()) return NextResponse.json({ ok: true });

  await envoyerLienConnexion({
    email,
    next: cheminSur(body.next),
    sujet: "Ton lien de connexion Crea'Star",
    titre: "Connexion à ton espace",
    texte: "Voici ton lien pour te connecter à ton espace Crea'Star, sans mot de passe.",
    bouton: "Me connecter",
  });

  return NextResponse.json({ ok: true });
}