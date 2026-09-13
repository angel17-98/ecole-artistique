// app/plateforme/planning/page.tsx
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { redirect } from "next/navigation";
import PlanningClient from "./PlanningClient";

// Un cours individuel dure réellement 45 minutes (cf. DUREE_COURS_MIN dans
// OngletCoursIndividuels.tsx). Le créneau, lui, bloque 60 minutes dans
// l'agenda (marge de battement pour le prof) — "fin_blocage" ne doit jamais
// être montré comme heure de fin du cours affichée à la famille. Bug repéré
// le 20/08/2026 par Angélie.
const DUREE_COURS_MIN = 45;
function finCoursIndividuel(debut: string): string {
  return new Date(new Date(debut).getTime() + DUREE_COURS_MIN * 60000).toISOString();
}

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
  // Cours individuels reconnectés via reservations_indiv (même pattern que
  // app/plateforme/dossier/page.tsx). Les locations (phase 7) restent vides
  // en attendant que le back-office de réservation de salles existe.

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
    type_cours?: "parcours" | "individuel" | "location";
    tarif_final?: number;
    origine_tarif?: "decouverte" | "fidelite" | null;
  };

  const STATUT_RESERVATION_VERS_COURS: Record<string, CoursItem["statut"]> = {
    confirmee: "planifie",
    effectuee: "effectue",
    annulee_eleve: "annule",
    annulee_prof: "annule",
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
          .select(`*, prof:profs(profile:profiles!profs_user_id_fkey(prenom, nom)), salle:salles(nom), parcours:parcours(nom)`)
          .in("parcours_id", parcoursIds)
          .order("date_heure_debut", { ascending: true });

        const coursParcoursFormates = (coursData ?? []).map((c: any) => ({
          id: c.id,
          discipline: c.discipline,
          date_heure_debut: c.date_heure_debut,
          date_heure_fin: c.date_heure_fin,
          prof_prenom: c.prof?.profile?.prenom,
          prof_nom: c.prof?.profile?.nom,
          salle: c.salle?.nom,
          statut: c.statut,
          parcours_nom: c.parcours?.nom,
          type_cours: "parcours" as const,
        }));

        cours = [...cours, ...coursParcoursFormates];
      }
    }

    // ── 2. Cours individuels réservés (table reservations_indiv) ───────────
    // IMPORTANT : supabaseAdmin (service role), pas "supabase" (soumis aux
    // RLS) — sinon la requête renvoie un tableau vide. Bug corrigé le
    // 20/08/2026. La table "profs" n'a pas de colonnes prenom/nom (vivent
    // sur "profiles", reliée via profs.user_id).
    const { data: reservationsData, error: reservationsErr } = await supabaseAdmin
      .from("reservations_indiv")
      .select(`
        id, statut, tarif_final, origine_tarif,
        creneau:creneaux(discipline, debut, fin_blocage, prof:profs(profile:profiles!profs_user_id_fkey(prenom, nom)))
      `)
      .eq("eleve_id", eleve.id);

    if (reservationsErr) {
      console.error(
        `[Planning] Erreur requête reservations_indiv pour élève ${eleve.id} :`,
        reservationsErr
      );
    }

    const coursIndividuelsFormates = (reservationsData ?? [])
      .filter((r: any) => r.creneau)
      .map((r: any) => ({
        id: r.id,
        discipline: r.creneau.discipline,
        date_heure_debut: r.creneau.debut,
        date_heure_fin: finCoursIndividuel(r.creneau.debut),
        prof_prenom: r.creneau.prof?.profile?.prenom,
        prof_nom: r.creneau.prof?.profile?.nom,
        statut: STATUT_RESERVATION_VERS_COURS[r.statut] ?? "planifie",
        type_cours: "individuel" as const,
        tarif_final: r.tarif_final ?? undefined,
        origine_tarif: r.origine_tarif ?? null,
      }));

    cours = [...cours, ...coursIndividuelsFormates];

    // ── 3. Locations de salles (phase 7) — TODO quand back-office existe ────

    cours.sort((a, b) =>
      new Date(a.date_heure_debut).getTime() - new Date(b.date_heure_debut).getTime()
    );

    eleveData[eleve.id] = cours;
  }

  // ── Créneaux individuels disponibles (pour le "+" du calendrier) ─────────
  // Chantier "Calendrier complet" : le Planning doit pouvoir montrer, sur un
  // jour vide, qu'il existe des créneaux à réserver ce jour-là — pas
  // seulement les cours déjà pris. Requête foyer-indépendante (les créneaux
  // disponibles sont les mêmes pour tout le monde), donc faite une seule
  // fois, hors de la boucle par élève. Même structure que la requête
  // équivalente dans app/plateforme/inscription/page.tsx.
  type CreneauDispo = {
    id: string;
    discipline: string;
    date_heure_debut: string;
    prof_prenom?: string;
    prof_nom?: string;
  };

  const { data: creneauxDispoRaw, error: creneauxDispoErr } = await supabaseAdmin
    .from("creneaux")
    .select(`
      id, discipline, debut,
      prof:profs(profile:profiles!profs_user_id_fkey(prenom, nom))
    `)
    .eq("statut", "disponible")
    .gte("debut", new Date().toISOString())
    .order("debut", { ascending: true })
    .limit(500); // garde-fou : évite de charger un historique infini de créneaux ouverts

  if (creneauxDispoErr) {
    console.error("[Planning] Erreur requête créneaux disponibles :", creneauxDispoErr);
  }

  const creneauxDisponibles: CreneauDispo[] = (creneauxDispoRaw ?? []).map((c: any) => ({
    id: c.id,
    discipline: c.discipline,
    date_heure_debut: c.debut,
    prof_prenom: c.prof?.profile?.prenom,
    prof_nom: c.prof?.profile?.nom,
  }));

  return (
    <PlanningClient
      profile={profile}
      eleves={eleves}
      eleveData={eleveData}
      initialEleveId={eleves[0]?.id ?? ""}
      creneauxDisponibles={creneauxDisponibles}
    />
  );
}