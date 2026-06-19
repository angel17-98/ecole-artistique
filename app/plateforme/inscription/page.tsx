// app/plateforme/inscription/page.tsx
// Page unifiée d'inscription — visible sans connexion, actions derrière auth
// Gère 3 onglets : Parcours annuels · Éveil musical · Cours individuels

import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import InscriptionClient from "./InscriptionClient";

export const metadata = {
  title: "Inscriptions — Crea'Star",
  description: "Rejoins un parcours annuel, l'éveil musical ou réserve un cours individuel.",
};

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ onglet?: string }>;
}) {
  const params = await searchParams;
  const ongletInitial = params?.onglet ?? "parcours";

  // ── Auth (optionnel — page accessible sans connexion) ────────────────────
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  let candidature = null;
  let foyer = null;
  let eleves: any[] = [];

  if (user) {
    // Profil
    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, role, prenom, nom")
      .eq("id", user.id)
      .single();
    profile = profileData;

    // Foyer + élèves
    const { data: foyerData } = await supabase
      .from("foyers")
      .select("id, nom_famille, eleves(id, prenom, nom, date_naissance, statut_premium)")
      .eq("user_id", user.id)
      .single();
    foyer = foyerData;
    eleves = foyerData?.eleves ?? [];

    // Candidature active (la plus récente non terminée)
    const { data: candidatureData } = await supabase
      .from("candidatures")
      .select("id, prenom, nom, parcours, statut, place_expire_at, place_proposee_at, created_at, groupe_inscription_id")
      .eq("user_id", user.id)
      .not("statut", "in", '("refusee","sans_reponse","expiree")')
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    candidature = candidatureData;
  }

  // ── Données publiques — Éveil musical ────────────────────────────────────
  // Récupère les groupes d'éveil pour afficher les places restantes
  const { data: groupesEveil } = await supabaseAdmin
    .from("groupes_inscription")
    .select("id, nom, parcours, places_max, jour_semaine, heure_debut, heure_fin")
    .eq("parcours", "eveil-musical")
    .order("nom");

  // Compter les inscrits par groupe d'éveil
  const groupesEveilAvecPlaces = await Promise.all(
    (groupesEveil ?? []).map(async (g) => {
      const { count } = await supabaseAdmin
        .from("candidatures")
        .select("id", { count: "exact", head: true })
        .eq("groupe_inscription_id", g.id)
        .in("statut", ["place_proposee", "inscrit"]);
      return {
        ...g,
        places_restantes: Math.max(0, g.places_max - (count ?? 0)),
        complet: (count ?? 0) >= g.places_max,
      };
    })
  );

  // ── Données publiques — Cours individuels ────────────────────────────────
  // Créneaux disponibles des profs indépendants (Flux 4 — structure à venir)
  // Pour l'instant on retourne un tableau vide — sera branché en Flux 4
  const creneauxIndividuels: any[] = [];

  // Profs actifs avec disciplines (pour les filtres)
  const { data: profsActifs } = await supabaseAdmin
    .from("profs")
    .select("id, prenom, nom, disciplines, photo_url, tarif_horaire, type_contrat")
    .eq("actif", true)
    .eq("type_contrat", "independant")
    .order("nom");

  return (
    <InscriptionClient
      ongletInitial={ongletInitial}
      user={user ? { id: user.id, email: user.email ?? "" } : null}
      profile={profile}
      candidature={candidature}
      foyer={foyer}
      eleves={eleves}
      groupesEveil={groupesEveilAvecPlaces}
      creneauxIndividuels={creneauxIndividuels}
      profs={profsActifs ?? []}
    />
  );
}