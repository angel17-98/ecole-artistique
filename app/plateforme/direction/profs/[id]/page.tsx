// // app/plateforme/direction/profs/[id]/page.tsx
// import { createClient } from "@/lib/plateforme/supabase/server";
// import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
// import { redirect } from "next/navigation";
// import Link from "next/link";
// import ProfFicheClient from "./ProfFicheClient";

// export default async function DirectionProfFichePage({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }) {
//   const { id } = await params;

//   const supabase = await createClient();
//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) redirect("/plateforme/login");

//   const { data: profile } = await supabase
//     .from("profiles")
//     .select("role")
//     .eq("id", user.id)
//     .single();

//   if (profile?.role !== "direction") redirect("/plateforme/direction");

//   // Données du prof
//   const { data: prof } = await supabaseAdmin
//     .from("profs")
//     .select(`
//       id, user_id, type_contrat, disciplines, actif,
//       bio, tarif_horaire, deadline_defaut, abonnement_possible_defaut,
//       created_at,
//       profile:profiles!profs_user_id_fkey(
//         id, prenom, nom, telephone, photo_url, is_active, created_at
//       )
//     `)
//     .eq("id", id)
//     .single();

//   if (!prof) redirect("/plateforme/direction/profs");

//   // Historique des contrats
//   const { data: contrats } = await supabaseAdmin
//     .from("contrats")
//     .select("*")
//     .eq("prof_id", id)
//     .order("date_debut", { ascending: false });

//   // Contrat actif
//   const today = new Date().toISOString().split("T")[0];
//   const contratActif = (contrats ?? []).find(
//     (c) => !c.date_fin || c.date_fin >= today
//   ) ?? null;

//   // Stats du prof
//   const debutMois = new Date();
//   debutMois.setDate(1);
//   debutMois.setHours(0, 0, 0, 0);

//   const { count: coursEffectuesMois } = await supabaseAdmin
//     .from("creneaux")
//     .select("id", { count: "exact", head: true })
//     .eq("prof_id", id)
//     .eq("statut", "effectue")
//     .gte("debut", debutMois.toISOString());

//   const { count: creneauxTotal } = await supabaseAdmin
//     .from("creneaux")
//     .select("id", { count: "exact", head: true })
//     .eq("prof_id", id)
//     .eq("statut", "disponible")
//     .gte("debut", new Date().toISOString());

//   // Rémunération mois courant
//   const moisCourant = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`;
//   const { data: remunMois } = await supabaseAdmin
//     .from("remuneration_mensuelle")
//     .select("montant_calcule, ajustement, statut, date_virement")
//     .eq("prof_id", id)
//     .eq("mois", moisCourant)
//     .maybeSingle();

//   return (
//     <ProfFicheClient
//       prof={prof}
//       contratActif={contratActif}
//       contrats={contrats ?? []}
//       stats={{
//         coursEffectuesMois: coursEffectuesMois ?? 0,
//         creneauxDisponibles: creneauxTotal ?? 0,
//         montantMois: remunMois
//           ? (remunMois.montant_calcule ?? 0) + (remunMois.ajustement ?? 0)
//           : null,
//         statutPaiement: remunMois?.statut ?? null,
//       }}
//     />
//   );
// }

// app/plateforme/direction/profs/[id]/page.tsx
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { redirect } from "next/navigation";
import ProfFicheClient from "./ProfFicheClient";

const DOCS_BUCKET = "profs-documents";

export default async function DirectionProfFichePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/plateforme/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "direction") redirect("/plateforme/direction");

  // Données du prof
  const { data: prof } = await supabaseAdmin
    .from("profs")
    .select(`
      id, user_id, type_contrat, disciplines, actif,
      bio, tarif_horaire, deadline_defaut, abonnement_possible_defaut,
      created_at,
      profile:profiles!profs_user_id_fkey(
        id, prenom, nom, telephone, photo_url, is_active, created_at
      )
    `)
    .eq("id", id)
    .single();

  if (!prof) redirect("/plateforme/direction/profs");

  // Historique des contrats
  const { data: contrats } = await supabaseAdmin
    .from("contrats")
    .select("*")
    .eq("prof_id", id)
    .order("date_debut", { ascending: false });

  // Contrat actif
  const today = new Date().toISOString().split("T")[0];
  const contratActif = (contrats ?? []).find(
    (c) => !c.date_fin || c.date_fin >= today
  ) ?? null;

  // Stats du prof
  const debutMois = new Date();
  debutMois.setDate(1);
  debutMois.setHours(0, 0, 0, 0);

  const { count: coursEffectuesMois } = await supabaseAdmin
    .from("creneaux")
    .select("id", { count: "exact", head: true })
    .eq("prof_id", id)
    .eq("statut", "effectue")
    .gte("debut", debutMois.toISOString());

  const { count: creneauxTotal } = await supabaseAdmin
    .from("creneaux")
    .select("id", { count: "exact", head: true })
    .eq("prof_id", id)
    .eq("statut", "disponible")
    .gte("debut", new Date().toISOString());

  // Rémunération mois courant
  const moisCourant = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`;
  const { data: remunMois } = await supabaseAdmin
    .from("remuneration_mensuelle")
    .select("montant_calcule, ajustement, statut, date_virement")
    .eq("prof_id", id)
    .eq("mois", moisCourant)
    .maybeSingle();

  // ── Groupes / parcours enseignés par ce prof ──────────────────────────────
  const { data: coursParcours } = await supabaseAdmin
    .from("cours")
    .select("parcours_id, parcours:parcours(id, nom)")
    .eq("prof_id", id)
    .not("parcours_id", "is", null);

  const parcoursUniques = Array.from(
    new Map(
      (coursParcours ?? [])
        .filter((c: any) => c.parcours)
        .map((c: any) => [c.parcours.id, c.parcours])
    ).values()
  ) as { id: string; nom: string }[];

  const parcoursIds = parcoursUniques.map((p) => p.id);

  const { data: inscriptionsParcours } = parcoursIds.length > 0
    ? await supabaseAdmin
        .from("inscriptions")
        .select("reference_id")
        .eq("type_inscription", "parcours")
        .in("reference_id", parcoursIds)
    : { data: [] };

  const countParParcours: Record<string, number> = {};
  for (const i of inscriptionsParcours ?? []) {
    countParParcours[i.reference_id] = (countParParcours[i.reference_id] ?? 0) + 1;
  }

  const groupes = parcoursUniques.map((p) => ({
    id: p.id,
    nom: p.nom,
    nbEleves: countParParcours[p.id] ?? 0,
  }));

  // ── Élèves en cours individuel avec ce prof ───────────────────────────────
  const { data: creneauxEleves } = await supabaseAdmin
    .from("creneaux")
    .select("eleve_id, eleve:eleves(id, prenom, nom)")
    .eq("prof_id", id)
    .not("eleve_id", "is", null);

  const elevesMap = new Map<string, { id: string; prenom: string; nom: string }>();
  for (const c of (creneauxEleves ?? []) as any[]) {
    if (c.eleve) elevesMap.set(c.eleve.id, c.eleve);
  }
  const elevesIndividuels = Array.from(elevesMap.values());

  // ── Documents ──────────────────────────────────────────────────────────────
  const { data: documentsRaw } = await supabaseAdmin
    .from("documents_profs")
    .select("id, nom, type, storage_path, taille_octets, created_at")
    .eq("prof_id", id)
    .order("created_at", { ascending: false });

  const documents = await Promise.all(
    (documentsRaw ?? []).map(async (doc) => {
      const { data: signedUrl } = await supabaseAdmin.storage
        .from(DOCS_BUCKET)
        .createSignedUrl(doc.storage_path, 3600);
      return { ...doc, url: signedUrl?.signedUrl ?? null };
    })
  );

  return (
    <ProfFicheClient
      prof={prof}
      contratActif={contratActif}
      contrats={contrats ?? []}
      stats={{
        coursEffectuesMois: coursEffectuesMois ?? 0,
        creneauxDisponibles: creneauxTotal ?? 0,
        montantMois: remunMois
          ? (remunMois.montant_calcule ?? 0) + (remunMois.ajustement ?? 0)
          : null,
        statutPaiement: remunMois?.statut ?? null,
      }}
      groupes={groupes}
      elevesIndividuels={elevesIndividuels}
      documents={documents}
    />
  );
}