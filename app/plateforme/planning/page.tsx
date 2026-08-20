// // app/plateforme/planning/page.tsx
// import { createClient } from "@/lib/plateforme/supabase/server";
// import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
// import { redirect } from "next/navigation";
// import PlanningClient from "./PlanningClient";

// export default async function PlanningPage() {
//   const supabase = await createClient();
//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) redirect("/plateforme/login");

//   const { data: profile } = await supabase
//     .from("profiles")
//     .select("*")
//     .eq("id", user.id)
//     .single();

//   const { data: foyer } = await supabase
//     .from("foyers")
//     .select("*, eleves(*)")
//     .eq("user_id", user.id)
//     .single();

//   const eleves = foyer?.eleves ?? [];

//   // ── Cours par élève ───────────────────────────────────────────────────────
//   // Toutes les sources de cours sont agrégées ici, quel que soit le statut.
//   // Cours individuels reconnectés via reservations_indiv (même pattern que
//   // app/plateforme/dossier/page.tsx). Les locations (phase 7) restent vides
//   // en attendant que le back-office de réservation de salles existe.

//   type CoursItem = {
//     id: string;
//     discipline: string;
//     date_heure_debut: string;
//     date_heure_fin: string;
//     prof_prenom?: string;
//     prof_nom?: string;
//     salle?: string;
//     statut: "planifie" | "annule" | "effectue";
//     parcours_nom?: string;
//     type_cours?: "parcours" | "individuel" | "location"; // pour affichage futur
//   };

//   // reservations_indiv utilise des statuts au féminin — et pour l'annulation,
//   // DEUX valeurs distinctes ("annulee_eleve" / "annulee_prof"), jamais juste
//   // "annulee" (vérifié via la contrainte SQL reservations_indiv_statut_check
//   // le 20/08/2026, en testant le chantier 3 — annulation depuis le compte
//   // élève). On les ramène au masculin utilisé partout ailleurs dans le
//   // Planning (table "cours").
//   const STATUT_RESERVATION_VERS_COURS: Record<string, CoursItem["statut"]> = {
//     confirmee: "planifie",
//     effectuee: "effectue",
//     annulee_eleve: "annule",
//     annulee_prof: "annule",
//   };

//   const eleveData: Record<string, CoursItem[]> = {};

//   for (const eleve of eleves) {
//     let cours: CoursItem[] = [];

//     // ── 1. Cours de parcours annuel (premium uniquement) ──────────────────
//     if (eleve.statut_premium) {
//       const { data: inscriptions } = await supabase
//         .from("inscriptions")
//         .select("reference_id")
//         .eq("eleve_id", eleve.id)
//         .eq("type_inscription", "parcours");

//       const parcoursIds = (inscriptions ?? []).map((i: any) => i.reference_id);

//       if (parcoursIds.length > 0) {
//         const { data: coursData } = await supabase
//           .from("cours")
//           .select(`*, prof:profs(profile:profiles!profs_user_id_fkey(prenom, nom)), salle:salles(nom), parcours:parcours(nom)`)
//           .in("parcours_id", parcoursIds)
//           .order("date_heure_debut", { ascending: true });

//         const coursParcoursFormates = (coursData ?? []).map((c: any) => ({
//           id: c.id,
//           discipline: c.discipline,
//           date_heure_debut: c.date_heure_debut,
//           date_heure_fin: c.date_heure_fin,
//           prof_prenom: c.prof?.profile?.prenom,
//           prof_nom: c.prof?.profile?.nom,
//           salle: c.salle?.nom,
//           statut: c.statut,
//           parcours_nom: c.parcours?.nom,
//           type_cours: "parcours" as const,
//         }));

//         cours = [...cours, ...coursParcoursFormates];
//       }
//     }

//     // ── 2. Cours individuels réservés (table reservations_indiv) ───────────
//     // Les données existent déjà en base (écrites par
//     // /api/reservation/cours-individuel) — reconnecté ici comme dans le
//     // Dossier, qui utilise exactement la même requête.
//     // IMPORTANT : on utilise supabaseAdmin (service role, contourne les RLS)
//     // et non "supabase" (soumis aux RLS de l'utilisateur connecté) — sinon la
//     // requête peut renvoyer un tableau vide selon les règles RLS en place.
//     // Bug corrigé le 20/08/2026.
//     //
//     // La table "profs" n'a pas de colonnes prenom/nom : elles vivent sur
//     // "profiles", reliée via profs.user_id (cf. le même correctif déjà fait
//     // dans app/plateforme/messages/page.tsx). D'où le passage par
//     // profs(profile:profiles!profs_user_id_fkey(prenom, nom)) plutôt que
//     // profs(prenom, nom), qui plantait avec "column profs_2.prenom does not
//     // exist". Bug corrigé le 20/08/2026 (2e correctif du même chantier).
//     const { data: reservationsData, error: reservationsErr } = await supabaseAdmin
//       .from("reservations_indiv")
//       .select(`
//         id, statut,
//         creneau:creneaux(discipline, debut, fin_blocage, prof:profs(profile:profiles!profs_user_id_fkey(prenom, nom)))
//       `)
//       .eq("eleve_id", eleve.id);

//     if (reservationsErr) {
//       console.error(
//         `[Planning] Erreur requête reservations_indiv pour élève ${eleve.id} :`,
//         reservationsErr
//       );
//     }

//     const coursIndividuelsFormates = (reservationsData ?? [])
//       .filter((r: any) => r.creneau)
//       .map((r: any) => ({
//         id: r.id,
//         discipline: r.creneau.discipline,
//         date_heure_debut: r.creneau.debut,
//         date_heure_fin: r.creneau.fin_blocage,
//         prof_prenom: r.creneau.prof?.profile?.prenom,
//         prof_nom: r.creneau.prof?.profile?.nom,
//         statut: STATUT_RESERVATION_VERS_COURS[r.statut] ?? "planifie",
//         type_cours: "individuel" as const,
//       }));

//     cours = [...cours, ...coursIndividuelsFormates];

//     // ── 3. Locations de salles (phase 7 — table reservations_salles)
//     // TODO: brancher quand la phase 7 est construite
//     // const { data: locations } = await supabase
//     //   .from("reservations_salles")
//     //   .select(`*, salle:salles(nom)`)
//     //   .eq("user_id", user.id)
//     //   .in("statut", ["confirmee", "effectuee"])
//     //   .order("date_heure_debut", { ascending: true });
//     // cours = [...cours, ...(locations ?? []).map(formatLocation)];

//     // Trier tous les cours par date croissante
//     cours.sort((a, b) =>
//       new Date(a.date_heure_debut).getTime() - new Date(b.date_heure_debut).getTime()
//     );

//     eleveData[eleve.id] = cours;
//   }

//   return (
//     <PlanningClient
//       profile={profile}
//       eleves={eleves}
//       eleveData={eleveData}
//       initialEleveId={eleves[0]?.id ?? ""}
//     />
//   );
// }

// app/plateforme/planning/page.tsx
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { redirect } from "next/navigation";
import PlanningClient from "./PlanningClient";

// Un cours individuel dure réellement 45 minutes (cf. DUREE_COURS_MIN dans
// OngletCoursIndividuels.tsx). Le créneau, lui, bloque 60 minutes dans
// l'agenda (marge de battement pour le prof) — "fin_blocage" ne doit jamais
// être montré comme heure de fin du cours, sous peine d'afficher un cours de
// 60min au lieu de 45min. Bug repéré le 20/08/2026 par Angélie.
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
    type_cours?: "parcours" | "individuel" | "location"; // pour affichage futur
  };

  // reservations_indiv utilise des statuts au féminin — et pour l'annulation,
  // DEUX valeurs distinctes ("annulee_eleve" / "annulee_prof"), jamais juste
  // "annulee" (vérifié via la contrainte SQL reservations_indiv_statut_check
  // le 20/08/2026, en testant le chantier 3 — annulation depuis le compte
  // élève). On les ramène au masculin utilisé partout ailleurs dans le
  // Planning (table "cours").
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
    // Les données existent déjà en base (écrites par
    // /api/reservation/cours-individuel) — reconnecté ici comme dans le
    // Dossier, qui utilise exactement la même requête.
    // IMPORTANT : on utilise supabaseAdmin (service role, contourne les RLS)
    // et non "supabase" (soumis aux RLS de l'utilisateur connecté) — sinon la
    // requête peut renvoyer un tableau vide selon les règles RLS en place.
    // Bug corrigé le 20/08/2026.
    //
    // La table "profs" n'a pas de colonnes prenom/nom : elles vivent sur
    // "profiles", reliée via profs.user_id (cf. le même correctif déjà fait
    // dans app/plateforme/messages/page.tsx). D'où le passage par
    // profs(profile:profiles!profs_user_id_fkey(prenom, nom)) plutôt que
    // profs(prenom, nom), qui plantait avec "column profs_2.prenom does not
    // exist". Bug corrigé le 20/08/2026 (2e correctif du même chantier).
    const { data: reservationsData, error: reservationsErr } = await supabaseAdmin
      .from("reservations_indiv")
      .select(`
        id, statut,
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
      }));

    cours = [...cours, ...coursIndividuelsFormates];

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