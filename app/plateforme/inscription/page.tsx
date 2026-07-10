// app/plateforme/inscription/page.tsx
// Page unifiée d'inscription — visible sans connexion, actions derrière auth
// Gère 3 onglets : Parcours annuels · Éveil musical · Cours individuels

import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import InscriptionClient from "./InscriptionClient";

const COURS_POUR_GRATUIT = 10;

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
    const { data: profsActifsRaw } = await supabaseAdmin
    .from("profs")
    .select(`
      id, disciplines, bio, tarif_horaire, type_contrat, accepte_duo, accepte_trio,
      profile:profiles!profs_user_id_fkey(prenom, nom, photo_url)
    `)
    .eq("actif", true)
    .in("type_contrat", ["independant", "salarie"]);

    const profsActifs = (profsActifsRaw ?? [])
      .map((p: any) => ({
        id: p.id,
        prenom: p.profile?.prenom ?? "",
        nom: p.profile?.nom ?? "",
        disciplines: p.disciplines,
        photo_url: p.profile?.photo_url ?? null,
        bio: p.bio,
        tarif_horaire: p.tarif_horaire,
        type_contrat: p.type_contrat,
        accepte_duo: p.accepte_duo,
        accepte_trio: p.accepte_trio,
      }))
      .sort((a, b) => a.nom.localeCompare(b.nom));

    const profIds = (profsActifs ?? []).map((p) => p.id);
    const todayStr = new Date().toISOString().split("T")[0];

    // Contrats actifs — tarifs solo/duo par prof
    const { data: contratsActifs } = profIds.length > 0
    ? await supabaseAdmin
        .from("contrats")
        .select("prof_id, tarif_cours_indiv, tarif_duo, tarif_trio")
        .in("prof_id", profIds)
        .or(`date_fin.is.null,date_fin.gte.${todayStr}`)
    : { data: [] };

    const tarifParProf = Object.fromEntries((contratsActifs ?? []).map((c) => [c.prof_id, c]));

    // Créneaux disponibles à venir
    const { data: creneauxRaw, error: creneauxErr } = profIds.length > 0
      ? await supabaseAdmin
          .from("creneaux")
          .select("id, prof_id, discipline, debut, fin_blocage, statut, abonnement_possible")
          .in("prof_id", profIds)
          .eq("statut", "disponible")
          .gte("debut", new Date().toISOString())
          .order("debut", { ascending: true })
      : { data: [], error: null  };

    const creneauxIndividuels = (creneauxRaw ?? []).map((c) => {
      const t = tarifParProf[c.prof_id];
      const prof = profsActifs.find((p) => p.id === c.prof_id);
      return {
        id: c.id,
        prof_id: c.prof_id,
        date_heure_debut: c.debut,
        date_heure_fin: c.fin_blocage,
        discipline: c.discipline,
        tarif_solo: t?.tarif_cours_indiv ?? 0,
        tarif_duo: t?.tarif_duo ?? null,
        tarif_trio: t?.tarif_trio ?? null,
        places_max: prof?.accepte_trio ? 3 : prof?.accepte_duo ? 2 : 1,
        places_restantes: 1,
        disponible: true,
        accepte_abonnement: c.abonnement_possible,
      };
    });

    // ── Disciplines jamais essayées par ce foyer (incentive découverte) ──────
    let disciplinesADecouvrir: { discipline: string; prochainCreneau: any | null }[] = [];

    if (foyer?.id) {
      const eleveIdsFoyer = eleves.map((e: any) => e.id);
      const { data: historique } = eleveIdsFoyer.length > 0
        ? await supabaseAdmin
            .from("reservations_indiv")
            .select("creneau:creneaux(discipline)")
            .in("eleve_id", eleveIdsFoyer)
            .in("statut", ["confirmee", "effectuee"])
        : { data: [] };

      const disciplinesDejaEssayees = new Set(
        (historique ?? []).map((h: any) => h.creneau?.discipline).filter(Boolean)
      );
      const toutesDisciplines = Array.from(new Set((profsActifs ?? []).flatMap((p) => p.disciplines)));

      disciplinesADecouvrir = toutesDisciplines
        .filter((d) => !disciplinesDejaEssayees.has(d))
        .map((d) => ({
          discipline: d,
          prochainCreneau: creneauxIndividuels.find((c) => c.discipline === d) ?? null,
        }));
    }

    // Carte fidélité "cours individuel" du foyer connecté
    let carteFidelite = null;
    if (foyer?.id) {
      const { data: carte } = await supabaseAdmin
        .from("fidelite")
        .select("compteur, total_offerts")
        .eq("foyer_id", foyer.id)
        .eq("type_carte", "cours_individuel")
        .maybeSingle();
      if (carte) {
        carteFidelite = { nb_cours_valides: carte.compteur, cours_pour_gratuit: COURS_POUR_GRATUIT };
      }
    }
  
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
      carteFidelite={carteFidelite}
      disciplinesADecouvrir={disciplinesADecouvrir}
      profs={profsActifs ?? []}
    />
  );
}