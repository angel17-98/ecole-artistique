// // // app/plateforme/dossier/page.tsx
// // import { createClient } from "@/lib/plateforme/supabase/server";
// // import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
// // import { redirect } from "next/navigation";
// // import DossierClient from "./DossierClient";
// // import { ShellProfile, ShellEleve } from "@/app/components/plateforme/PlatformShell";

// // interface ProgressionNiveau {
// //   id: string;
// //   periode: string;
// //   date_evaluation: string;
// //   eval_chant: number;
// //   eval_danse: number;
// //   eval_theatre: number;
// //   eval_ecriture: number;
// //   eval_scenique: number;
// //   eval_studio: number;
// //   commentaire_global?: string;
// // }

// // interface NoteCours {
// //   id: string;
// //   contenu: string;
// //   created_at: string;
// //   cours_discipline?: string;
// //   cours_date?: string;
// //   prof_prenom?: string;
// //   prof_nom?: string;
// // }

// // interface CoursIndividuel {
// //   id: string;
// //   discipline: string;
// //   date_heure_debut: string;
// //   date_heure_fin: string;
// //   prof_prenom?: string;
// //   prof_nom?: string;
// //   statut: string;
// //   note?: string;
// // }

// // interface LocationSalle {
// //   id: string;
// //   salle_nom?: string;
// //   date_heure_debut: string;
// //   date_heure_fin: string;
// //   statut: string;
// // }

// // interface Fidelite {
// //   id: string;
// //   type_carte: string;
// //   compteur: number;
// //   total_offerts: number;
// // }

// // export default async function DossierPage() {
// //   const supabase = await createClient();
// //   const { data: { user } } = await supabase.auth.getUser();
// //   if (!user) redirect("/plateforme/login");

// //   // ── Profil & foyer ────────────────────────────────────────────────────────
// //   const { data: profile } = await supabase
// //     .from("profiles")
// //     .select("id, prenom, nom, role, photo_url")
// //     .eq("id", user.id)
// //     .single();

// //   if (!profile || profile.role === "direction" || profile.role === "prof_salarie" || profile.role === "prof_independant") {
// //     redirect("/plateforme");
// //   }

// //   const { data: foyer } = await supabase
// //     .from("foyers")
// //     .select("id, nom_famille")
// //     .eq("user_id", user.id)
// //     .single();

// //   const { data: elevesData } = await supabase
// //     .from("eleves")
// //     .select("id, prenom, nom, statut_premium, photo_url")
// //     .eq("foyer_id", foyer?.id ?? "");

// //   const eleves: ShellEleve[] = (elevesData ?? []).map((e: any) => ({
// //     id: e.id,
// //     prenom: e.prenom,
// //     nom: e.nom,
// //     statut_premium: e.statut_premium ?? false,
// //     photo_url: e.photo_url ?? null,
// //   }));

// //   const { data: fidelite } = await supabase
// //     .from("fidelite")
// //     .select("*")
// //     .eq("foyer_id", foyer?.id ?? "");

// //   // ── Données par élève ─────────────────────────────────────────────────────
// //   const eleveData: Record<string, {
// //     notes: NoteCours[];
// //     niveaux: ProgressionNiveau[];
// //     niveauInitial: ProgressionNiveau | null;
// //     coursIndividuels: CoursIndividuel[];
// //     locations: LocationSalle[];
// //   }> = {};

// //   for (const eleve of eleves) {
// //     // ── Notes de cours ───────────────────────────────────────────────────────
// //     const { data: notesData } = await supabase
// //       .from("notes_cours")
// //       .select(`
// //         id, contenu, created_at,
// //         cours:cours_id(discipline, date_heure_debut),
// //         prof:prof_id(prenom, nom)
// //       `)
// //       .eq("eleve_id", eleve.id)
// //       .order("created_at", { ascending: false });

// //     const notes: NoteCours[] = (notesData ?? []).map((n: any) => ({
// //       id: n.id,
// //       contenu: n.contenu,
// //       created_at: n.created_at,
// //       cours_discipline: n.cours?.discipline,
// //       cours_date: n.cours?.date_heure_debut,
// //       prof_prenom: n.prof?.prenom,
// //       prof_nom: n.prof?.nom,
// //     }));

// //     // ── Progression semestrielle ─────────────────────────────────────────────
// //     const { data: niveauxData } = await supabase
// //       .from("progression_niveaux")
// //       .select("*")
// //       .eq("eleve_id", eleve.id)
// //       .order("date_evaluation", { ascending: true });

// //     const niveaux: ProgressionNiveau[] = (niveauxData ?? []).map((n: any) => ({
// //       id: n.id,
// //       periode: n.periode,
// //       date_evaluation: n.date_evaluation,
// //       eval_chant: n.eval_chant ?? 0,
// //       eval_danse: n.eval_danse ?? 0,
// //       eval_theatre: n.eval_theatre ?? 0,
// //       eval_ecriture: n.eval_ecriture ?? 0,
// //       eval_scenique: n.eval_scenique ?? 0,
// //       eval_studio: n.eval_studio ?? 0,
// //       commentaire_global: n.commentaire_global,
// //     }));

// //     // ── Niveau initial depuis candidatures (UUID, plus d'email matching) ─────
// //     // On cherche la candidature liée au user_id directement.
// //     // Fallback sur email uniquement pour les comptes créés avant la migration.
// //     let niveauInitial: ProgressionNiveau | null = null;

// //     // 1. Recherche prioritaire par user_id (propre, rapide)
// //     const { data: candidatureParUserId } = await supabaseAdmin
// //       .from("candidatures")
// //       .select("eval_chant, eval_danse, eval_theatre, eval_ecriture, eval_scenique, eval_studio, created_at")
// //       .eq("user_id", user.id)
// //       .in("statut", ["acceptee", "inscrit"])
// //       .order("created_at", { ascending: false })
// //       .limit(1)
// //       .maybeSingle();

// //     if (candidatureParUserId) {
// //       niveauInitial = {
// //         id: "initial",
// //         periode: "Entrée",
// //         date_evaluation: candidatureParUserId.created_at,
// //         eval_chant: candidatureParUserId.eval_chant ?? 0,
// //         eval_danse: candidatureParUserId.eval_danse ?? 0,
// //         eval_theatre: candidatureParUserId.eval_theatre ?? 0,
// //         eval_ecriture: candidatureParUserId.eval_ecriture ?? 0,
// //         eval_scenique: candidatureParUserId.eval_scenique ?? 0,
// //         eval_studio: candidatureParUserId.eval_studio ?? 0,
// //       };
// //     } else {
// //       // 2. Fallback email — pour les comptes créés avant qu'on ajoute user_id
// //       // On en profite pour lier rétroactivement si trouvé
// //       const { data: candidatureParEmail } = await supabaseAdmin
// //         .from("candidatures")
// //         .select("id, eval_chant, eval_danse, eval_theatre, eval_ecriture, eval_scenique, eval_studio, created_at")
// //         .eq("email", user.email ?? "")
// //         .in("statut", ["acceptee", "inscrit"])
// //         .is("user_id", null)
// //         .order("created_at", { ascending: false })
// //         .limit(1)
// //         .maybeSingle();

// //       if (candidatureParEmail) {
// //         // Lier rétroactivement pour que ce fallback ne soit plus nécessaire
// //         await supabaseAdmin
// //           .from("candidatures")
// //           .update({ user_id: user.id })
// //           .eq("id", candidatureParEmail.id);

// //         niveauInitial = {
// //           id: "initial",
// //           periode: "Entrée",
// //           date_evaluation: candidatureParEmail.created_at,
// //           eval_chant: candidatureParEmail.eval_chant ?? 0,
// //           eval_danse: candidatureParEmail.eval_danse ?? 0,
// //           eval_theatre: candidatureParEmail.eval_theatre ?? 0,
// //           eval_ecriture: candidatureParEmail.eval_ecriture ?? 0,
// //           eval_scenique: candidatureParEmail.eval_scenique ?? 0,
// //           eval_studio: candidatureParEmail.eval_studio ?? 0,
// //         };
// //       }
// //     }

// //     // ── Cours individuels (phase 5 — désactivé pour l'instant) ───────────────
// //     const coursIndividuels: CoursIndividuel[] = [];

// //     // ── Locations de salles (phase 7 — désactivé pour l'instant) ─────────────
// //     const locations: LocationSalle[] = [];

// //     eleveData[eleve.id] = { notes, niveaux, niveauInitial, coursIndividuels, locations };
// //   }

// //   return (
// //     <DossierClient
// //       profile={profile as ShellProfile}
// //       foyer={{ id: foyer?.id ?? "", nom_famille: foyer?.nom_famille ?? "" }}
// //       eleves={eleves}
// //       eleveData={eleveData}
// //       fidelite={(fidelite ?? []) as Fidelite[]}
// //       initialEleveId={eleves[0]?.id ?? ""}
// //     />
// //   );
// // }

// // app/plateforme/dossier/page.tsx
// import { createClient } from "@/lib/plateforme/supabase/server";
// import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
// import { redirect } from "next/navigation";
// import DossierClient from "./DossierClient";
// import { ShellProfile, ShellEleve } from "@/app/components/plateforme/PlatformShell";

// interface ProgressionNiveau {
//   id: string;
//   periode: string;
//   date_evaluation: string;
//   eval_chant: number;
//   eval_danse: number;
//   eval_theatre: number;
//   eval_ecriture: number;
//   eval_scenique: number;
//   eval_studio: number;
//   commentaire_global?: string;
// }

// interface NoteCours {
//   id: string;
//   contenu: string;
//   created_at: string;
//   cours_discipline?: string;
//   cours_date?: string;
//   prof_prenom?: string;
//   prof_nom?: string;
// }

// interface CoursIndividuel {
//   id: string;
//   discipline: string;
//   date_heure_debut: string;
//   date_heure_fin: string;
//   prof_prenom?: string;
//   prof_nom?: string;
//   statut: string;
//   note?: string;
// }

// interface LocationSalle {
//   id: string;
//   salle_nom?: string;
//   date_heure_debut: string;
//   date_heure_fin: string;
//   statut: string;
// }

// interface Fidelite {
//   id: string;
//   type_carte: string;
//   compteur: number;
//   total_offerts: number;
// }

// export default async function DossierPage() {
//   const supabase = await createClient();
//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) redirect("/plateforme/login");

//   // ── Profil & foyer ────────────────────────────────────────────────────────
//   const { data: profile } = await supabase
//     .from("profiles")
//     .select("id, prenom, nom, role, photo_url")
//     .eq("id", user.id)
//     .single();

//   if (!profile || profile.role === "direction" || profile.role === "prof_salarie" || profile.role === "prof_independant") {
//     redirect("/plateforme");
//   }

//   const { data: foyer } = await supabase
//     .from("foyers")
//     .select("id, nom_famille")
//     .eq("user_id", user.id)
//     .single();

//   const { data: elevesData } = await supabase
//     .from("eleves")
//     .select("id, prenom, nom, statut_premium, photo_url, date_naissance")
//     .eq("foyer_id", foyer?.id ?? "");

//   const eleves: (ShellEleve & { photo_url: string | null; date_naissance: string | null })[] =
//     (elevesData ?? []).map((e: any) => ({
//       id: e.id,
//       prenom: e.prenom,
//       nom: e.nom,
//       statut_premium: e.statut_premium ?? false,
//       photo_url: e.photo_url ?? null,
//       date_naissance: e.date_naissance ?? null,
//     }));

//   const { data: fidelite } = await supabase
//     .from("fidelite")
//     .select("*")
//     .eq("foyer_id", foyer?.id ?? "");

//   // ── Données par élève ─────────────────────────────────────────────────────
//   const eleveData: Record<string, {
//     notes: NoteCours[];
//     niveaux: ProgressionNiveau[];
//     niveauInitial: ProgressionNiveau | null;
//     coursIndividuels: CoursIndividuel[];
//     locations: LocationSalle[];
//   }> = {};

//   for (const eleve of eleves) {
//     // ── Notes de cours ───────────────────────────────────────────────────────
//     const { data: notesData } = await supabase
//       .from("notes_cours")
//       .select(`
//         id, contenu, created_at,
//         cours:cours_id(discipline, date_heure_debut),
//         prof:prof_id(prenom, nom)
//       `)
//       .eq("eleve_id", eleve.id)
//       .order("created_at", { ascending: false });

//     const notes: NoteCours[] = (notesData ?? []).map((n: any) => ({
//       id: n.id,
//       contenu: n.contenu,
//       created_at: n.created_at,
//       cours_discipline: n.cours?.discipline,
//       cours_date: n.cours?.date_heure_debut,
//       prof_prenom: n.prof?.prenom,
//       prof_nom: n.prof?.nom,
//     }));

//     // ── Progression semestrielle ─────────────────────────────────────────────
//     const { data: niveauxData } = await supabase
//       .from("progression_niveaux")
//       .select("*")
//       .eq("eleve_id", eleve.id)
//       .order("date_evaluation", { ascending: true });

//     const niveaux: ProgressionNiveau[] = (niveauxData ?? []).map((n: any) => ({
//       id: n.id,
//       periode: n.periode,
//       date_evaluation: n.date_evaluation,
//       eval_chant: n.eval_chant ?? 0,
//       eval_danse: n.eval_danse ?? 0,
//       eval_theatre: n.eval_theatre ?? 0,
//       eval_ecriture: n.eval_ecriture ?? 0,
//       eval_scenique: n.eval_scenique ?? 0,
//       eval_studio: n.eval_studio ?? 0,
//       commentaire_global: n.commentaire_global,
//     }));

//     // ── Niveau initial depuis candidatures (UUID, plus d'email matching) ─────
//     // On cherche la candidature liée au user_id directement.
//     // Fallback sur email uniquement pour les comptes créés avant la migration.
//     let niveauInitial: ProgressionNiveau | null = null;

//     // 1. Recherche prioritaire par user_id (propre, rapide)
//     const { data: candidatureParUserId } = await supabaseAdmin
//       .from("candidatures")
//       .select("eval_chant, eval_danse, eval_theatre, eval_ecriture, eval_scenique, eval_studio, created_at")
//       .eq("user_id", user.id)
//       .in("statut", ["validee", "inscrit"])
//       .order("created_at", { ascending: false })
//       .limit(1)
//       .maybeSingle();

//     if (candidatureParUserId) {
//       niveauInitial = {
//         id: "initial",
//         periode: "Entrée",
//         date_evaluation: candidatureParUserId.created_at,
//         eval_chant: candidatureParUserId.eval_chant ?? 0,
//         eval_danse: candidatureParUserId.eval_danse ?? 0,
//         eval_theatre: candidatureParUserId.eval_theatre ?? 0,
//         eval_ecriture: candidatureParUserId.eval_ecriture ?? 0,
//         eval_scenique: candidatureParUserId.eval_scenique ?? 0,
//         eval_studio: candidatureParUserId.eval_studio ?? 0,
//       };
//     } else {
//       // 2. Fallback email — pour les comptes créés avant qu'on ajoute user_id
//       // On en profite pour lier rétroactivement si trouvé
//       const { data: candidatureParEmail } = await supabaseAdmin
//         .from("candidatures")
//         .select("id, eval_chant, eval_danse, eval_theatre, eval_ecriture, eval_scenique, eval_studio, created_at")
//         .eq("email", user.email ?? "")
//         .in("statut", ["validee", "inscrit"])
//         .is("user_id", null)
//         .order("created_at", { ascending: false })
//         .limit(1)
//         .maybeSingle();

//       if (candidatureParEmail) {
//         // Lier rétroactivement pour que ce fallback ne soit plus nécessaire
//         await supabaseAdmin
//           .from("candidatures")
//           .update({ user_id: user.id })
//           .eq("id", candidatureParEmail.id);

//         niveauInitial = {
//           id: "initial",
//           periode: "Entrée",
//           date_evaluation: candidatureParEmail.created_at,
//           eval_chant: candidatureParEmail.eval_chant ?? 0,
//           eval_danse: candidatureParEmail.eval_danse ?? 0,
//           eval_theatre: candidatureParEmail.eval_theatre ?? 0,
//           eval_ecriture: candidatureParEmail.eval_ecriture ?? 0,
//           eval_scenique: candidatureParEmail.eval_scenique ?? 0,
//           eval_studio: candidatureParEmail.eval_studio ?? 0,
//         };
//       }
//     }

//     // ── Cours individuels réservés (table reservations_indiv) ────────────────
//     // Reconnecté — jusqu'ici les données existaient déjà en base (écrites par
//     // /api/reservation/cours-individuel) mais n'étaient jamais relues ici.
//     const { data: reservationsData } = await supabaseAdmin
//       .from("reservations_indiv")
//       .select(`
//         id, statut, note_eleve,
//         creneau:creneaux(discipline, debut, fin_blocage, prof:profs(prenom, nom))
//       `)
//       .eq("eleve_id", eleve.id);

//     const coursIndividuels: CoursIndividuel[] = (reservationsData ?? [])
//       .filter((r: any) => r.creneau)
//       .map((r: any) => ({
//         id: r.id,
//         discipline: r.creneau.discipline,
//         date_heure_debut: r.creneau.debut,
//         date_heure_fin: r.creneau.fin_blocage,
//         prof_prenom: r.creneau.prof?.prenom,
//         prof_nom: r.creneau.prof?.nom,
//         statut: r.statut,
//         note: r.note_eleve ?? undefined,
//       }))
//       .sort((a, b) => new Date(b.date_heure_debut).getTime() - new Date(a.date_heure_debut).getTime());

//     // ── Locations de salles (phase 7 — pas encore construite côté back-office) ─
//     const locations: LocationSalle[] = [];

//     eleveData[eleve.id] = { notes, niveaux, niveauInitial, coursIndividuels, locations };
//   }

//   return (
//     <DossierClient
//       profile={profile as ShellProfile}
//       foyer={{ id: foyer?.id ?? "", nom_famille: foyer?.nom_famille ?? "" }}
//       eleves={eleves}
//       eleveData={eleveData}
//       fidelite={(fidelite ?? []) as Fidelite[]}
//       initialEleveId={eleves[0]?.id ?? ""}
//     />
//   );
// }

// app/plateforme/dossier/page.tsx
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { redirect } from "next/navigation";
import DossierClient from "./DossierClient";
import { ShellProfile, ShellEleve } from "@/app/components/plateforme/PlatformShell";

interface ProgressionNiveau {
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
}

interface NoteCours {
  id: string;
  contenu: string;
  created_at: string;
  cours_discipline?: string;
  cours_date?: string;
  prof_prenom?: string;
  prof_nom?: string;
}

interface CoursIndividuel {
  id: string;
  discipline: string;
  date_heure_debut: string;
  date_heure_fin: string;
  prof_prenom?: string;
  prof_nom?: string;
  statut: string;
  note?: string;
}

interface LocationSalle {
  id: string;
  salle_nom?: string;
  date_heure_debut: string;
  date_heure_fin: string;
  statut: string;
}

interface Fidelite {
  id: string;
  type_carte: string;
  compteur: number;
  total_offerts: number;
}

export default async function DossierPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/plateforme/login");

  // ── Profil & foyer ────────────────────────────────────────────────────────
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, prenom, nom, role, photo_url")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role === "direction" || profile.role === "prof_salarie" || profile.role === "prof_independant") {
    redirect("/plateforme");
  }

  const { data: foyer } = await supabase
    .from("foyers")
    .select("id, nom_famille")
    .eq("user_id", user.id)
    .single();

  const { data: elevesData } = await supabase
    .from("eleves")
    .select("id, prenom, nom, statut_premium, photo_url, date_naissance")
    .eq("foyer_id", foyer?.id ?? "");

  const eleves: (ShellEleve & { photo_url: string | null; date_naissance: string | null })[] =
    (elevesData ?? []).map((e: any) => ({
      id: e.id,
      prenom: e.prenom,
      nom: e.nom,
      statut_premium: e.statut_premium ?? false,
      photo_url: e.photo_url ?? null,
      date_naissance: e.date_naissance ?? null,
    }));

  const { data: fidelite } = await supabase
    .from("fidelite")
    .select("*")
    .eq("foyer_id", foyer?.id ?? "");

  // ── Données par élève ─────────────────────────────────────────────────────
  const eleveData: Record<string, {
    notes: NoteCours[];
    niveaux: ProgressionNiveau[];
    niveauInitial: ProgressionNiveau | null;
    coursIndividuels: CoursIndividuel[];
    locations: LocationSalle[];
  }> = {};

  for (const eleve of eleves) {
    // ── Notes de cours ───────────────────────────────────────────────────────
    const { data: notesData } = await supabase
      .from("notes_cours")
      .select(`
        id, contenu, created_at,
        cours:cours_id(discipline, date_heure_debut),
        prof:prof_id(prenom, nom)
      `)
      .eq("eleve_id", eleve.id)
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

    // ── Niveau initial depuis candidatures (UUID, plus d'email matching) ─────
    // On cherche la candidature liée au user_id directement.
    // Fallback sur email uniquement pour les comptes créés avant la migration.
    let niveauInitial: ProgressionNiveau | null = null;

    // 1. Recherche prioritaire par user_id (propre, rapide)
    const { data: candidatureParUserId } = await supabaseAdmin
      .from("candidatures")
      .select("eval_chant, eval_danse, eval_theatre, eval_ecriture, eval_scenique, eval_studio, created_at")
      .eq("user_id", user.id)
      .in("statut", ["validee", "inscrit"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (candidatureParUserId) {
      niveauInitial = {
        id: "initial",
        periode: "Entrée",
        date_evaluation: candidatureParUserId.created_at,
        eval_chant: candidatureParUserId.eval_chant ?? 0,
        eval_danse: candidatureParUserId.eval_danse ?? 0,
        eval_theatre: candidatureParUserId.eval_theatre ?? 0,
        eval_ecriture: candidatureParUserId.eval_ecriture ?? 0,
        eval_scenique: candidatureParUserId.eval_scenique ?? 0,
        eval_studio: candidatureParUserId.eval_studio ?? 0,
      };
    } else {
      // 2. Fallback email — pour les comptes créés avant qu'on ajoute user_id
      // On en profite pour lier rétroactivement si trouvé
      const { data: candidatureParEmail } = await supabaseAdmin
        .from("candidatures")
        .select("id, eval_chant, eval_danse, eval_theatre, eval_ecriture, eval_scenique, eval_studio, created_at")
        .eq("email", user.email ?? "")
        .in("statut", ["validee", "inscrit"])
        .is("user_id", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (candidatureParEmail) {
        // Lier rétroactivement pour que ce fallback ne soit plus nécessaire
        await supabaseAdmin
          .from("candidatures")
          .update({ user_id: user.id })
          .eq("id", candidatureParEmail.id);

        niveauInitial = {
          id: "initial",
          periode: "Entrée",
          date_evaluation: candidatureParEmail.created_at,
          eval_chant: candidatureParEmail.eval_chant ?? 0,
          eval_danse: candidatureParEmail.eval_danse ?? 0,
          eval_theatre: candidatureParEmail.eval_theatre ?? 0,
          eval_ecriture: candidatureParEmail.eval_ecriture ?? 0,
          eval_scenique: candidatureParEmail.eval_scenique ?? 0,
          eval_studio: candidatureParEmail.eval_studio ?? 0,
        };
      }
    }

    // ── Cours individuels réservés (table reservations_indiv) ────────────────
    // Reconnecté — jusqu'ici les données existaient déjà en base (écrites par
    // /api/reservation/cours-individuel) mais n'étaient jamais relues ici.
    const { data: reservationsData } = await supabaseAdmin
      .from("reservations_indiv")
      .select(`
        id, statut, note_eleve,
        creneau:creneaux(discipline, debut, fin_blocage, prof:profs(prenom, nom))
      `)
      .eq("eleve_id", eleve.id);

    const coursIndividuels: CoursIndividuel[] = (reservationsData ?? [])
      .filter((r: any) => r.creneau)
      .map((r: any) => ({
        id: r.id,
        discipline: r.creneau.discipline,
        date_heure_debut: r.creneau.debut,
        date_heure_fin: r.creneau.fin_blocage,
        prof_prenom: r.creneau.prof?.prenom,
        prof_nom: r.creneau.prof?.nom,
        statut: r.statut,
        note: r.note_eleve ?? undefined,
      }))
      .sort((a, b) => new Date(b.date_heure_debut).getTime() - new Date(a.date_heure_debut).getTime());

    // ── Locations de salles (phase 7 — pas encore construite côté back-office) ─
    const locations: LocationSalle[] = [];

    eleveData[eleve.id] = { notes, niveaux, niveauInitial, coursIndividuels, locations };
  }

  return (
    <DossierClient
      profile={profile as ShellProfile}
      foyer={{ id: foyer?.id ?? "", nom_famille: foyer?.nom_famille ?? "" }}
      eleves={eleves}
      eleveData={eleveData}
      fidelite={(fidelite ?? []) as Fidelite[]}
      initialEleveId={eleves[0]?.id ?? ""}
    />
  );
}