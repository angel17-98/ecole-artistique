import { createClient } from "@/lib/plateforme/supabase/server";
import { redirect } from "next/navigation";
import PlanningClient from "./PlanningClient";

export default async function PlanningPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/plateforme/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: foyer } = await supabase
    .from("foyers")
    .select("*, eleves(*)")
    .eq("user_id", user.id)
    .single();

  const eleves = foyer?.eleves ?? [];

  // ── Cours par élève ───────────────────────────────────────────────────────
  // Toutes les sources de cours sont agrégées ici, quel que soit le statut.
  // Les tables creneaux_individuels et reservations_salles seront branchées
  // aux phases 5 et 7 — pour l'instant elles retournent [] silencieusement.

  type CoursItem = {
    id: string;
    discipline: string;
    date_heure_debut: string;
    date_heure_fin: string;
    prof_prenom?: string;
    prof_nom?: string;
    salle?: string;
    statut: "planifie" | "annule" | "effectue";
    parcours_nom?: string;
    type_cours?: "parcours" | "individuel" | "location"; // pour affichage futur
  };

  const eleveData: Record<string, CoursItem[]> = {};

  for (const eleve of eleves) {
    let cours: CoursItem[] = [];

    // ── 1. Cours de parcours annuel (premium uniquement) ──────────────────
    if (eleve.statut_premium) {
      const { data: inscriptions } = await supabase
        .from("inscriptions")
        .select("reference_id")
        .eq("eleve_id", eleve.id)
        .eq("type_inscription", "parcours");

      const parcoursIds = (inscriptions ?? []).map((i: any) => i.reference_id);

      if (parcoursIds.length > 0) {
        const { data: coursData } = await supabase
          .from("cours")
          .select(`*, prof:profs(prenom, nom), salle:salles(nom), parcours:parcours(nom)`)
          .in("parcours_id", parcoursIds)
          .order("date_heure_debut", { ascending: true });

        const coursParcoursFormates = (coursData ?? []).map((c: any) => ({
          id: c.id,
          discipline: c.discipline,
          date_heure_debut: c.date_heure_debut,
          date_heure_fin: c.date_heure_fin,
          prof_prenom: c.prof?.prenom,
          prof_nom: c.prof?.nom,
          salle: c.salle?.nom,
          statut: c.statut,
          parcours_nom: c.parcours?.nom,
          type_cours: "parcours" as const,
        }));

        cours = [...cours, ...coursParcoursFormates];
      }
    }

    // ── 2. Cours individuels réservés (phase 5 — table creneaux_individuels)
    // TODO: brancher quand la phase 5 est construite
    // const { data: creneaux } = await supabase
    //   .from("creneaux_individuels")
    //   .select(`*, prof:profs(prenom, nom), salle:salles(nom)`)
    //   .eq("eleve_id", eleve.id)
    //   .in("statut", ["reserve", "effectue"])
    //   .order("date_heure_debut", { ascending: true });
    // cours = [...cours, ...(creneaux ?? []).map(formatCreneau)];

    // ── 3. Locations de salles (phase 7 — table reservations_salles)
    // TODO: brancher quand la phase 7 est construite
    // const { data: locations } = await supabase
    //   .from("reservations_salles")
    //   .select(`*, salle:salles(nom)`)
    //   .eq("user_id", user.id)
    //   .in("statut", ["confirmee", "effectuee"])
    //   .order("date_heure_debut", { ascending: true });
    // cours = [...cours, ...(locations ?? []).map(formatLocation)];

    // Trier tous les cours par date croissante
    cours.sort((a, b) =>
      new Date(a.date_heure_debut).getTime() - new Date(b.date_heure_debut).getTime()
    );

    eleveData[eleve.id] = cours;
  }

  return (
    <PlanningClient
      profile={profile}
      eleves={eleves}
      eleveData={eleveData}
      initialEleveId={eleves[0]?.id ?? ""}
    />
  );
}