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
  const activeEleve = eleves[0];

  // Récupérer les cours de l'élève actif (via inscriptions → parcours → cours)
  let cours = [];
  if (activeEleve?.statut_premium && activeEleve?.id) {
    const { data: inscriptions } = await supabase
      .from("inscriptions")
      .select("reference_id")
      .eq("eleve_id", activeEleve.id)
      .eq("type_inscription", "parcours");

    const parcoursIds = (inscriptions ?? []).map((i: any) => i.reference_id);

    if (parcoursIds.length > 0) {
      const { data: coursData } = await supabase
        .from("cours")
        .select(`
          *,
          prof:profs(prenom, nom),
          salle:salles(nom),
          parcours:parcours(nom)
        `)
        .in("parcours_id", parcoursIds)
        .order("date_heure_debut", { ascending: true });

      cours = (coursData ?? []).map((c: any) => ({
        id: c.id,
        discipline: c.discipline,
        date_heure_debut: c.date_heure_debut,
        date_heure_fin: c.date_heure_fin,
        prof_prenom: c.prof?.prenom,
        prof_nom: c.prof?.nom,
        salle: c.salle?.nom,
        statut: c.statut,
        parcours_nom: c.parcours?.nom,
      }));
    }
  }

  return (
    <PlanningClient
      profile={profile}
      eleves={eleves}
      cours={cours}
      activeEleveId={activeEleve?.id ?? ""}
    />
  );
}
