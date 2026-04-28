import { createClient } from "@/lib/plateforme/supabase/server";
import { redirect } from "next/navigation";
import DossierClient from "./DossierClient";

export default async function DossierPage() {
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

  // ── Fidélité (liée au foyer, pas à l'élève) ──────────────────────────────
  const { data: fidelite } = await supabase
    .from("fidelite")
    .select("*")
    .eq("foyer_id", foyer?.id ?? "");

  // ── Données par élève ─────────────────────────────────────────────────────
  type NoteCours = {
    id: string;
    contenu: string;
    created_at: string;
    cours_discipline?: string;
    cours_date?: string;
    prof_prenom?: string;
    prof_nom?: string;
  };

  type ProgressionNiveau = {
    id: string;
    periode: string;
    date_evaluation: string;
    eval_chant: number;
    eval_danse: number;
    eval_theatre: number;
    eval_ecriture: number;
    eval_scenique: number;
    eval_studio: number;
    commentaire_global?: string;
  };

  type CoursIndividuel = {
    id: string;
    discipline: string;
    date_heure_debut: string;
    date_heure_fin: string;
    prof_prenom?: string;
    prof_nom?: string;
    statut: string;
    note?: string;
  };

  type LocationSalle = {
    id: string;
    salle_nom?: string;
    date_heure_debut: string;
    date_heure_fin: string;
    statut: string;
  };

  type EleveData = {
    notes: NoteCours[];
    niveaux: ProgressionNiveau[];
    niveauInitial: ProgressionNiveau | null; // depuis candidatures
    coursIndividuels: CoursIndividuel[];
    locations: LocationSalle[];
  };

  const eleveData: Record<string, EleveData> = {};

  for (const eleve of eleves) {
    // ── Notes de cours (parcours annuel) ────────────────────────────────────
    const { data: notesData } = await supabase
      .from("notes_cours")
      .select(`*, cours(discipline, date_heure_debut), prof:profs(prenom, nom)`)
      .eq("eleve_id", eleve.id)
      .eq("visible_eleve", true)
      .order("created_at", { ascending: false });

    const notes: NoteCours[] = (notesData ?? []).map((n: any) => ({
      id: n.id,
      contenu: n.contenu,
      created_at: n.created_at,
      cours_discipline: n.cours?.discipline,
      cours_date: n.cours?.date_heure_debut,
      prof_prenom: n.prof?.prenom,
      prof_nom: n.prof?.nom,
    }));

    // ── Progression semestrielle ─────────────────────────────────────────────
    const { data: niveauxData } = await supabase
      .from("progression_niveaux")
      .select("*")
      .eq("eleve_id", eleve.id)
      .order("date_evaluation", { ascending: true });

    const niveaux: ProgressionNiveau[] = (niveauxData ?? []).map((n: any) => ({
      id: n.id,
      periode: n.periode,
      date_evaluation: n.date_evaluation,
      eval_chant: n.eval_chant ?? 0,
      eval_danse: n.eval_danse ?? 0,
      eval_theatre: n.eval_theatre ?? 0,
      eval_ecriture: n.eval_ecriture ?? 0,
      eval_scenique: n.eval_scenique ?? 0,
      eval_studio: n.eval_studio ?? 0,
      commentaire_global: n.commentaire_global,
    }));

    // ── Niveau initial depuis candidatures (email matching) ──────────────────
    // On cherche la candidature acceptée correspondant à cet élève
    // via email du foyer — lien indirect car pas de FK directe
    let niveauInitial: ProgressionNiveau | null = null;

    // Récupérer l'email du foyer pour matcher la candidature
    const { data: profileData } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (profileData) {
      // Chercher via auth.users l'email
      const { data: authUser } = await supabase.auth.getUser();
      const email = authUser?.user?.email;

      if (email) {
        const { data: candidature } = await supabase
          .from("candidatures")
          .select("eval_chant, eval_danse, eval_theatre, eval_ecriture, eval_scenique, eval_studio, created_at")
          .eq("email", email)
          .eq("statut", "acceptee")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (candidature) {
          niveauInitial = {
            id: "initial",
            periode: "Entrée",
            date_evaluation: candidature.created_at,
            eval_chant: candidature.eval_chant ?? 0,
            eval_danse: candidature.eval_danse ?? 0,
            eval_theatre: candidature.eval_theatre ?? 0,
            eval_ecriture: candidature.eval_ecriture ?? 0,
            eval_scenique: candidature.eval_scenique ?? 0,
            eval_studio: candidature.eval_studio ?? 0,
          };
        }
      }
    }

    // ── Cours individuels (phase 5 — désactivé pour l'instant) ───────────────
    // TODO: brancher à la phase 5
    // const { data: creneaux } = await supabase
    //   .from("creneaux_individuels")
    //   .select(`*, prof:profs(prenom, nom)`)
    //   .eq("eleve_id", eleve.id)
    //   .order("date_heure_debut", { ascending: false });
    const coursIndividuels: CoursIndividuel[] = [];

    // ── Locations de salles (phase 7 — désactivé pour l'instant) ─────────────
    // TODO: brancher à la phase 7
    // const { data: locs } = await supabase
    //   .from("reservations_salles")
    //   .select(`*, salle:salles(nom)`)
    //   .eq("user_id", user.id)
    //   .order("date_heure_debut", { ascending: false });
    const locations: LocationSalle[] = [];

    eleveData[eleve.id] = { notes, niveaux, niveauInitial, coursIndividuels, locations };
  }

  return (
    <DossierClient
      profile={profile}
      foyer={{ id: foyer?.id, nom_famille: foyer?.nom_famille }}
      eleves={eleves}
      eleveData={eleveData}
      fidelite={fidelite ?? []}
      initialEleveId={eleves[0]?.id ?? ""}
    />
  );
}