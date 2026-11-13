// app/stages/page.tsx
// Page publique « Stages & Workshops » (13/11/2026) : stages, masterclass,
// workshops et modules à la carte à venir. Gérés depuis Espace direction → Offres.

import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { aujourdhui, estAVenir, type Offre } from "@/lib/offres";
import StagesClient from "./StagesClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Stages & Workshops — Crea'Star",
  description: "Stages, masterclass, workshops et modules à la carte : des formats courts pour s'immerger, progresser et rencontrer.",
};

export default async function StagesPage() {
  const { data } = await supabaseAdmin
    .from("offres")
    .select("id, type, titre, description, public_vise, date_debut, date_fin, horaires, prix, places_restantes, inscriptions, lien_inscription, image_url, visible")
    .eq("visible", true)
    .order("date_debut");

  const jour = aujourdhui();
  const offres = ((data ?? []) as Offre[]).filter((o) => estAVenir(o, jour));

  return <StagesClient offres={offres} />;
}