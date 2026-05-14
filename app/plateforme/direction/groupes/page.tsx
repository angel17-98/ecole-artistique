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

  const { data: groupes } = await supabaseAdmin
    .from("groupes_inscription")
    .select("id, nom, parcours, places_max, annee_scolaire, note, jour_semaine, heure_debut, heure_fin")
    .order("parcours").order("nom");

  const { data: aPlacerRaw } = await supabaseAdmin
    .from("candidatures")
    .select("id, prenom, nom, email, age, ville, parcours, pourquoi, eval_chant, eval_danse, eval_theatre, eval_ecriture, eval_scenique, eval_studio, created_at")
    .in("statut", ["validee", "acceptee"])
    .is("groupe_inscription_id", null)
    .order("created_at", { ascending: true });

  const { data: placesRaw } = await supabaseAdmin
    .from("candidatures")
    .select("id, prenom, nom, email, age, ville, parcours, statut, groupe_inscription_id, place_proposee_at, place_expire_at, eval_chant, eval_danse, eval_theatre, eval_ecriture, eval_scenique, eval_studio")
    .in("statut", ["validee", "acceptee", "place_proposee", "inscrit"])
    .not("groupe_inscription_id", "is", null);

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
    />
  );
}