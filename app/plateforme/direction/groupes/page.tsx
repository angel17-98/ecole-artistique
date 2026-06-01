// // app/plateforme/direction/groupes/page.tsx
// import { createClient } from "@/lib/plateforme/supabase/server";
// import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
// import { redirect } from "next/navigation";
// import GroupesClient from "./GroupesClient";

// export default async function GroupesPage() {
//   const supabase = await createClient();
//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) redirect("/plateforme/login");

//   const { data: profile } = await supabase
//     .from("profiles").select("role").eq("id", user.id).single();
//   if (profile?.role !== "direction") redirect("/plateforme");

//   // ── Années scolaires ──────────────────────────────────────────────────────
//   const { data: annees } = await supabaseAdmin
//     .from("annees_scolaires")
//     .select("id, libelle, active")
//     .order("date_debut", { ascending: false });

//   const anneeActive = (annees ?? []).find(a => a.active) ?? annees?.[0] ?? null;

//   // ── Groupes filtrés par année active ─────────────────────────────────────
//   let groupesQuery = supabaseAdmin
//     .from("groupes_inscription")
//     .select("id, nom, parcours, places_max, annee_scolaire, annee_id, note, jour_semaine, heure_debut, heure_fin")
//     .order("parcours").order("nom");

//   if (anneeActive) {
//     groupesQuery = groupesQuery.eq("annee_id", anneeActive.id);
//   }

//   const { data: groupes } = await groupesQuery;

//   // ── Candidatures à placer — filtrées sur l'année active ──────────────────
//   let aPlacerQuery = supabaseAdmin
//     .from("candidatures")
//     .select("id, prenom, nom, email, age, ville, parcours, pourquoi, eval_chant, eval_danse, eval_theatre, eval_ecriture, eval_scenique, eval_studio, created_at")
//     .in("statut", ["validee"])
//     .is("groupe_inscription_id", null)
//     .order("created_at", { ascending: true });

//   if (anneeActive) {
//     aPlacerQuery = aPlacerQuery.eq("annee_id", anneeActive.id);
//   }

//   const { data: aPlacerRaw } = await aPlacerQuery;

//   // ── Candidatures déjà placées — filtrées sur l'année active ──────────────
//   let placesQuery = supabaseAdmin
//     .from("candidatures")
//     .select("id, prenom, nom, email, age, ville, parcours, statut, groupe_inscription_id, place_proposee_at, place_expire_at, eval_chant, eval_danse, eval_theatre, eval_ecriture, eval_scenique, eval_studio")
//     .in("statut", ["validee", "place_proposee", "inscrit"])
//     .not("groupe_inscription_id", "is", null);

//   if (anneeActive) {
//     placesQuery = placesQuery.eq("annee_id", anneeActive.id);
//   }

//   const { data: placesRaw } = await placesQuery;

//   // ── Paramètres ────────────────────────────────────────────────────────────
//   const { data: params } = await supabaseAdmin
//     .from("parametres")
//     .select("cle, valeur")
//     .in("cle", ["delai_reponse_candidat_jours", "places_par_groupe"]);

//   const parametres = Object.fromEntries((params ?? []).map(p => [p.cle, p.valeur]));

//   return (
//     <GroupesClient
//       groupes={groupes ?? []}
//       aPlacerRaw={aPlacerRaw ?? []}
//       placesRaw={placesRaw ?? []}
//       parametres={parametres}
//       annees={annees ?? []}
//       anneeActiveId={anneeActive?.id ?? ""}
//     />
//   );
// }

// app/plateforme/direction/groupes/page.tsx
// FIX : "acceptee" retiré de toutes les requêtes Supabase — seul "validee" subsiste
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { redirect } from "next/navigation";
import GroupesClient from "./GroupesClient";

export default async function GroupesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/plateforme/login");

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "direction") redirect("/plateforme");

  // ── Années scolaires ──────────────────────────────────────────────────────
  const { data: annees } = await supabaseAdmin
    .from("annees_scolaires")
    .select("id, libelle, active")
    .order("date_debut", { ascending: false });

  const anneeActive = (annees ?? []).find(a => a.active) ?? annees?.[0] ?? null;

  // ── Groupes filtrés par année active ─────────────────────────────────────
  let groupesQuery = supabaseAdmin
    .from("groupes_inscription")
    .select("id, nom, parcours, places_max, annee_scolaire, annee_id, note, jour_semaine, heure_debut, heure_fin")
    .order("parcours").order("nom");

  if (anneeActive) {
    groupesQuery = groupesQuery.eq("annee_id", anneeActive.id);
  }

  const { data: groupes } = await groupesQuery;

  // ── Candidatures à placer — FIX : "acceptee" retiré ──────────────────────
  let aPlacerQuery = supabaseAdmin
    .from("candidatures")
    .select("id, prenom, nom, email, age, ville, parcours, pourquoi, eval_chant, eval_danse, eval_theatre, eval_ecriture, eval_scenique, eval_studio, created_at")
    .in("statut", ["validee"])         // FIX : était ["validee", "acceptee"]
    .is("groupe_inscription_id", null)
    .order("created_at", { ascending: true });

  if (anneeActive) {
    aPlacerQuery = aPlacerQuery.eq("annee_id", anneeActive.id);
  }

  const { data: aPlacerRaw } = await aPlacerQuery;

  // ── Candidatures déjà placées — FIX : "acceptee" retiré ──────────────────
  let placesQuery = supabaseAdmin
    .from("candidatures")
    .select("id, prenom, nom, email, age, ville, parcours, statut, groupe_inscription_id, place_proposee_at, place_expire_at, eval_chant, eval_danse, eval_theatre, eval_ecriture, eval_scenique, eval_studio")
    .in("statut", ["validee", "place_proposee", "inscrit"]) // FIX : "acceptee" retiré
    .not("groupe_inscription_id", "is", null);

  if (anneeActive) {
    placesQuery = placesQuery.eq("annee_id", anneeActive.id);
  }

  const { data: placesRaw } = await placesQuery;

  // ── Paramètres ────────────────────────────────────────────────────────────
  const { data: params } = await supabaseAdmin
    .from("parametres")
    .select("cle, valeur")
    .in("cle", ["delai_reponse_candidat_jours", "places_par_groupe"]);

  const parametres = Object.fromEntries((params ?? []).map(p => [p.cle, p.valeur]));

  return (
    <GroupesClient
      groupes={groupes ?? []}
      aPlacerRaw={aPlacerRaw ?? []}
      placesRaw={placesRaw ?? []}
      parametres={parametres}
      annees={annees ?? []}
      anneeActiveId={anneeActive?.id ?? ""}
    />
  );
}