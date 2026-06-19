// // import { createClient } from "@/lib/plateforme/supabase/server";
// // import { redirect } from "next/navigation";
// // import DashboardClient from "./DashboardClient";

// // export default async function DashboardPage() {
// //   const supabase = await createClient();
// //   const { data: { user } } = await supabase.auth.getUser();
// //   if (!user) redirect("/plateforme/login");

// //   const { data: profile } = await supabase
// //     .from("profiles")
// //     .select("*")
// //     .eq("id", user.id)
// //     .single();

// //   const { data: foyer } = await supabase
// //     .from("foyers")a
// //     .select("*, eleves(*)")
// //     .eq("user_id", user.id)
// //     .single();

// //   const eleves = foyer?.eleves ?? [];

// //   const { data: fidelite } = await supabase
// //     .from("fidelite")
// //     .select("*")
// //     .eq("foyer_id", foyer?.id ?? "");

// //   // ── Notifications ────────────────────────────────────────────────────────
// //   const { data: notifications } = await supabase
// //     .from("notifications")
// //     .select("*")
// //     .eq("user_id", user.id)
// //     .order("created_at", { ascending: false })
// //     .limit(20);

// //   // ── Messages non lus ─────────────────────────────────────────────────────
// //   const { data: convs } = await supabase
// //     .from("conversations")
// //     .select("id")
// //     .contains("participants", [user.id]);

// //   let unreadDiscussions = 0;
// //   if (convs && convs.length > 0) {
// //     for (const conv of convs) {
// //       const { count } = await supabase
// //         .from("messages")
// //         .select("id", { count: "exact", head: true })
// //         .eq("conversation_id", conv.id)
// //         .not("lu_par", "cs", `{${user.id}}`);
// //       unreadDiscussions += count ?? 0;
// //     }
// //   }

// //   // ── Stat non-premium : candidatures (arrondi à la dizaine inférieure) ────
// //   const { count: totalCandidatures } = await supabase
// //     .from("candidatures")
// //     .select("id", { count: "exact", head: true });

// //   const candidaturesArrondies = totalCandidatures
// //     ? Math.floor(totalCandidatures / 10) * 10
// //     : 0;

// //   // ── Données par élève ─────────────────────────────────────────────────────
// //   type CoursData = {
// //     id: string;
// //     discipline: string;
// //     date_heure_debut: string;
// //     date_heure_fin: string;
// //     prof_prenom?: string;
// //     prof_nom?: string;
// //     salle?: string;
// //     statut: string;
// //     parcours_nom?: string;
// //   };

// //   type NoteData = {
// //     id: string;
// //     contenu: string;
// //     created_at: string;
// //     cours_discipline?: string;
// //     prof_prenom?: string;
// //     prof_nom?: string;
// //   };

// //   type StatCoursData = {
// //     total: number;
// //     disciplines: string[];
// //   };

// //   const eleveData: Record<string, {
// //     prochainCours: CoursData | null;
// //     derniereNote: NoteData | null;
// //     statCours: StatCoursData;
// //   }> = {};

// //   // Début de l'année scolaire courante (1er septembre)
// //   const now = new Date();
// //   const debutAnnee = new Date(
// //     now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1,
// //     8, 1
// //   ).toISOString();

// //   for (const eleve of eleves) {
// //     let prochainCours: CoursData | null = null;
// //     let derniereNote: NoteData | null = null;
// //     let statCours: StatCoursData = { total: 0, disciplines: [] };

// //     if (eleve.statut_premium) {
// //       const { data: inscriptions } = await supabase
// //         .from("inscriptions")
// //         .select("reference_id")
// //         .eq("eleve_id", eleve.id)
// //         .eq("type_inscription", "parcours");

// //       const parcoursIds = (inscriptions ?? []).map((i: any) => i.reference_id);

// //       if (parcoursIds.length > 0) {
// //         const nowIso = new Date().toISOString();

// //         // Prochain cours planifié
// //         const { data: coursData } = await supabase
// //           .from("cours")
// //           .select(`*, prof:profs(prenom, nom), salle:salles(nom), parcours:parcours(nom)`)
// //           .in("parcours_id", parcoursIds)
// //           .eq("statut", "planifie")
// //           .gte("date_heure_debut", nowIso)
// //           .order("date_heure_debut", { ascending: true })
// //           .limit(1)
// //           .maybeSingle();

// //         if (coursData) {
// //           prochainCours = {
// //             id: coursData.id,
// //             discipline: coursData.discipline,
// //             date_heure_debut: coursData.date_heure_debut,
// //             date_heure_fin: coursData.date_heure_fin,
// //             prof_prenom: coursData.prof?.prenom,
// //             prof_nom: coursData.prof?.nom,
// //             salle: coursData.salle?.nom,
// //             statut: coursData.statut,
// //             parcours_nom: coursData.parcours?.nom,
// //           };
// //         }

// //         // Cours effectués cette année scolaire
// //         const { data: coursEffectues } = await supabase
// //           .from("cours")
// //           .select("discipline")
// //           .in("parcours_id", parcoursIds)
// //           .eq("statut", "effectue")
// //           .gte("date_heure_debut", debutAnnee);

// //         if (coursEffectues && coursEffectues.length > 0) {
// //           statCours = {
// //             total: coursEffectues.length,
// //             disciplines: [...new Set(coursEffectues.map((c: any) => c.discipline as string))],
// //           };
// //         }
// //       }

// //       // Dernière note visible
// //       const { data: noteData } = await supabase
// //         .from("notes_cours")
// //         .select(`*, cours(discipline), prof:profs(prenom, nom)`)
// //         .eq("eleve_id", eleve.id)
// //         .eq("visible_eleve", true)
// //         .order("created_at", { ascending: false })
// //         .limit(1)
// //         .maybeSingle();

// //       if (noteData) {
// //         derniereNote = {
// //           id: noteData.id,
// //           contenu: noteData.contenu,
// //           created_at: noteData.created_at,
// //           cours_discipline: noteData.cours?.discipline,
// //           prof_prenom: noteData.prof?.prenom,
// //           prof_nom: noteData.prof?.nom,
// //         };
// //       }
// //     }

// //     eleveData[eleve.id] = { prochainCours, derniereNote, statCours };
// //   }

// //   return (
// //     <DashboardClient
// //       profile={profile}
// //       foyer={foyer}
// //       eleves={eleves}
// //       fidelite={fidelite || []}
// //       eleveData={eleveData}
// //       candidaturesArrondies={candidaturesArrondies}
// //       initialNotifications={notifications || []}
// //       unreadDiscussions={unreadDiscussions}
// //     />
// //   );
// // }

// import { createClient } from "@/lib/plateforme/supabase/server";
// import { redirect } from "next/navigation";
// import DashboardClient from "./DashboardClient";

// export default async function DashboardPage() {
//   const supabase = await createClient();
//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) redirect("/plateforme/login");

//   const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
//   const { data: foyer } = await supabase.from("foyers").select("*, eleves(*)").eq("user_id", user.id).single();
//   const eleves = foyer?.eleves ?? [];

//   const { data: fidelite } = await supabase.from("fidelite").select("*").eq("foyer_id", foyer?.id ?? "");

//   // ── Notifications ─────────────────────────────────────────────────────────
//   const { data: notifications } = await supabase
//     .from("notifications").select("*").eq("user_id", user.id)
//     .order("created_at", { ascending: false }).limit(20);

//   // ── Messages non lus ──────────────────────────────────────────────────────
//   const { data: convs } = await supabase.from("conversations").select("id").contains("participants", [user.id]);
//   let unreadDiscussions = 0;
//   if (convs && convs.length > 0) {
//     for (const conv of convs) {
//       const { count } = await supabase.from("messages")
//         .select("id", { count: "exact", head: true })
//         .eq("conversation_id", conv.id)
//         .not("lu_par", "cs", `{${user.id}}`);
//       unreadDiscussions += count ?? 0;
//     }
//   }

//   // ── Candidature liée au compte (via user_id) ──────────────────────────────
//   // Fallback sur l'email si user_id pas encore lié (compte créé avant la migration)
//   let candidature = null;

//   const { data: candidatureParUserId } = await supabase
//     .from("candidatures")
//     .select("id, statut, parcours, prenom, place_proposee_at, place_expire_at, created_at")
//     .eq("user_id", user.id)
//     .order("created_at", { ascending: false })
//     .limit(1)
//     .maybeSingle();

//   if (candidatureParUserId) {
//     candidature = candidatureParUserId;
//   } else {
//     // Fallback email — pour les comptes créés avant qu'on ajoute user_id
//     const { data: candidatureParEmail } = await supabase
//       .from("candidatures")
//       .select("id, statut, parcours, prenom, place_proposee_at, place_expire_at, created_at")
//       .eq("email", user.email ?? "")
//       .order("created_at", { ascending: false })
//       .limit(1)
//       .maybeSingle();

//     if (candidatureParEmail) {
//       candidature = candidatureParEmail;
//       // On en profite pour lier rétroactivement
//       await supabase.from("candidatures")
//         .update({ user_id: user.id })
//         .eq("id", candidatureParEmail.id);
//     }
//   }

//   // ── Stat non-premium : candidatures (arrondi à la dizaine) ───────────────
//   const { count: totalCandidatures } = await supabase
//     .from("candidatures").select("id", { count: "exact", head: true });
//   const candidaturesArrondies = totalCandidatures ? Math.floor(totalCandidatures / 10) * 10 : 0;

//   // ── Données par élève ─────────────────────────────────────────────────────
//   type CoursData = { id: string; discipline: string; date_heure_debut: string; date_heure_fin: string; prof_prenom?: string; prof_nom?: string; salle?: string; statut: string; parcours_nom?: string; };
//   type NoteData = { id: string; contenu: string; created_at: string; cours_discipline?: string; prof_prenom?: string; prof_nom?: string; };
//   type StatCoursData = { total: number; disciplines: string[]; };

//   const eleveData: Record<string, { prochainCours: CoursData | null; derniereNote: NoteData | null; statCours: StatCoursData; }> = {};

//   const now = new Date();
//   const debutAnnee = new Date(now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1, 8, 1).toISOString();

//   for (const eleve of eleves) {
//     let prochainCours: CoursData | null = null;
//     let derniereNote: NoteData | null = null;
//     let statCours: StatCoursData = { total: 0, disciplines: [] };

//     if (eleve.statut_premium) {
//       const { data: inscriptions } = await supabase.from("inscriptions")
//         .select("reference_id").eq("eleve_id", eleve.id).eq("type_inscription", "parcours");
//       const parcoursIds = (inscriptions ?? []).map((i: any) => i.reference_id);

//       if (parcoursIds.length > 0) {
//         const nowIso = new Date().toISOString();
//         const { data: coursData } = await supabase.from("cours")
//           .select(`*, prof:profs(prenom, nom), salle:salles(nom), parcours:parcours(nom)`)
//           .in("parcours_id", parcoursIds).eq("statut", "planifie")
//           .gte("date_heure_debut", nowIso).order("date_heure_debut", { ascending: true })
//           .limit(1).maybeSingle();

//         if (coursData) {
//           prochainCours = {
//             id: coursData.id, discipline: coursData.discipline,
//             date_heure_debut: coursData.date_heure_debut, date_heure_fin: coursData.date_heure_fin,
//             prof_prenom: coursData.prof?.prenom, prof_nom: coursData.prof?.nom,
//             salle: coursData.salle?.nom, statut: coursData.statut, parcours_nom: coursData.parcours?.nom,
//           };
//         }

//         const { data: coursEffectues } = await supabase.from("cours")
//           .select("discipline").in("parcours_id", parcoursIds)
//           .eq("statut", "effectue").gte("date_heure_debut", debutAnnee);
//         if (coursEffectues && coursEffectues.length > 0) {
//           statCours = { total: coursEffectues.length, disciplines: [...new Set(coursEffectues.map((c: any) => c.discipline as string))] };
//         }
//       }

//       const { data: noteData } = await supabase.from("notes_cours")
//         .select(`*, cours(discipline), prof:profs(prenom, nom)`)
//         .eq("eleve_id", eleve.id).eq("visible_eleve", true)
//         .order("created_at", { ascending: false }).limit(1).maybeSingle();
//       if (noteData) {
//         derniereNote = { id: noteData.id, contenu: noteData.contenu, created_at: noteData.created_at, cours_discipline: noteData.cours?.discipline, prof_prenom: noteData.prof?.prenom, prof_nom: noteData.prof?.nom };
//       }
//     }

//     eleveData[eleve.id] = { prochainCours, derniereNote, statCours };
//   }

//   return (
//     <DashboardClient
//       profile={profile}
//       foyer={foyer}
//       eleves={eleves}
//       fidelite={fidelite || []}
//       eleveData={eleveData}
//       candidature={candidature}
//       candidaturesArrondies={candidaturesArrondies}
//       initialNotifications={notifications || []}
//       unreadDiscussions={unreadDiscussions}
//     />
//   );
// }

// app/plateforme/dashboard/page.tsx
import { createClient } from "@/lib/plateforme/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/plateforme/login");

  const { data: foyer } = await supabase
    .from("foyers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  // Candidature active (la plus récente non terminée)
  const { data: candidature } = await supabase
    .from("candidatures")
    .select("id, parcours, statut, place_expire_at")
    .eq("user_id", user.id)
    .not("statut", "in", '("refusee","sans_reponse","expiree")')
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Stat candidatures pour les non-premium
  const { count: totalCandidatures } = await supabase
    .from("candidatures")
    .select("id", { count: "exact", head: true });

  const candidaturesArrondies = totalCandidatures
    ? Math.floor(totalCandidatures / 10) * 10
    : 0;

  return (
    <DashboardClient
      candidature={candidature ?? null}
      candidaturesArrondies={candidaturesArrondies}
    />
  );
}