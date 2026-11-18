// app/cours/calendrier/page.tsx
// Page publique « Nos cours · Calendrier » (11/11/2026).
// Les données sont lues dans Supabase à chaque visite : une modification faite
// par la direction (espace direction → Calendrier) est visible tout de suite.

import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import type { CreneauPlanning, EvenementCalendrier } from "@/lib/calendrier";
import CalendrierPublic from "./CalendrierPublic";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Calendrier & horaires — Crea'Star",
  description: "La semaine type des cours et le calendrier de l'année : congés, sessions de travail collectif et spectacle.",
};

export default async function CalendrierPage() {
  const [{ data: creneaux }, { data: evenements }] = await Promise.all([
    supabaseAdmin
      .from("planning_creneaux")
      .select("id, jour, heure_debut, heure_fin, titre, sous_titre, categorie, frequence, note, ordre, visible, seances_max, date_debut, date_fin, libelle_reserve")
      .eq("visible", true),
    supabaseAdmin
      .from("calendrier_evenements")
      .select("id, titre, type, date_debut, date_fin, description, visible")
      .eq("visible", true)
      // Stages et masterclass vivent maintenant dans la page Stages & Workshops
      .not("type", "in", '("stage","masterclass")')
      .order("date_debut"),
  ]);

  return (
    <CalendrierPublic
      creneaux={(creneaux ?? []) as CreneauPlanning[]}
      evenements={(evenements ?? []) as EvenementCalendrier[]}
    />
  );
}