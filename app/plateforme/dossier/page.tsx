import { createClient } from "@/lib/plateforme/supabase/server";
import { redirect } from "next/navigation";
import DossierClient from "./DossierClient";

export default async function DossierPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/plateforme/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const { data: foyer } = await supabase.from("foyers").select("*, eleves(*)").eq("user_id", user.id).single();
  const eleves = foyer?.eleves ?? [];
  const activeEleve = eleves[0];

  const { data: notes } = await supabase
    .from("notes_cours")
    .select(`*, cours(discipline, date_heure_debut), prof:profs(prenom, nom)`)
    .eq("eleve_id", activeEleve?.id ?? "")
    .eq("visible_eleve", true)
    .order("created_at", { ascending: false });

  const { data: progressions } = await supabase
    .from("progression")
    .select("*, parcours(nom)")
    .eq("eleve_id", activeEleve?.id ?? "");

  const { data: fidelite } = await supabase
    .from("fidelite")
    .select("*")
    .eq("foyer_id", foyer?.id ?? "");

  // TODO: médias via Google Drive API
  const medias: any[] = [];

  return (
    <DossierClient
      profile={profile}
      eleves={eleves}
      notes={notes ?? []}
      progressions={(progressions ?? []).map((p: any) => ({ ...p, parcours_nom: p.parcours?.nom }))}
      medias={medias}
      fidelite={fidelite ?? []}
      activeEleveId={activeEleve?.id ?? ""}
    />
  );
}
