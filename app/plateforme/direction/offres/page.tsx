// app/plateforme/direction/offres/page.tsx
// Espace direction → Offres : stages, masterclass, workshops, modules à la carte
// et demandes reçues (13/11/2026). L'accès est déjà réservé à la direction par
// app/plateforme/direction/layout.tsx.

import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import type { Offre, Demande } from "@/lib/offres";
import OffresDirectionClient from "./OffresDirectionClient";

export const dynamic = "force-dynamic";

export default async function OffresDirectionPage({
  searchParams,
}: {
  searchParams: Promise<{ onglet?: string }>;
}) {
  const params = await searchParams;

  const [{ data: offres }, { data: demandes }] = await Promise.all([
    supabaseAdmin
      .from("offres")
      .select("id, type, titre, description, public_vise, date_debut, date_fin, horaires, prix, places_restantes, inscriptions, lien_inscription, image_url, visible")
      .order("date_debut", { ascending: false }),
    supabaseAdmin
      .from("interets")
      .select("id, offre_id, offre_titre, type_demande, prenom, nom, email, telephone, age, message, traite, created_at")
      .order("created_at", { ascending: false })
      .limit(1000),
  ]);

  return (
    <OffresDirectionClient
      offres={(offres ?? []) as Offre[]}
      demandes={(demandes ?? []) as Demande[]}
      ongletInitial={params?.onglet === "demandes" ? "demandes" : "offres"}
    />
  );
}