// app/plateforme/direction/profs/page.tsx
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { redirect } from "next/navigation";
import ProfsListClient from "./ProfsListClient";
import type { ProfRow } from "./types";

export default async function DirectionProfsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/plateforme/login");

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "direction") redirect("/plateforme/direction");

  // ── Profs avec leur profil ────────────────────────────────────────────────
  const { data: profs } = await supabaseAdmin
    .from("profs")
    .select(`
      id, user_id, type_contrat, disciplines, actif, created_at,
      profile:profiles!profs_user_id_fkey(prenom, nom, telephone, is_active)
    `);

  const profIds = (profs ?? []).map(p => p.id);
  const today = new Date().toISOString().split("T")[0];
  const now = new Date();
  const dans7jours = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // ── Contrats actifs ────────────────────────────────────────────────────────
  const { data: contratsActifs } = profIds.length > 0
    ? await supabaseAdmin
        .from("contrats")
        .select("prof_id, type, salaire_fixe, tarif_cours_indiv, date_fin")
        .in("prof_id", profIds)
        .or(`date_fin.is.null,date_fin.gte.${today}`)
    : { data: [] };
  const contratParProf = Object.fromEntries((contratsActifs ?? []).map(c => [c.prof_id, c]));

  // ── Disponibilités / charge des 7 prochains jours ─────────────────────────
  const { data: creneauxSemaine } = profIds.length > 0
    ? await supabaseAdmin
        .from("creneaux")
        .select("prof_id, statut")
        .in("prof_id", profIds)
        .gte("debut", now.toISOString())
        .lte("debut", dans7jours.toISOString())
    : { data: [] };

  const { data: coursSemaine } = profIds.length > 0
    ? await supabaseAdmin
        .from("cours")
        .select("prof_id, statut")
        .in("prof_id", profIds)
        .gte("date_heure_debut", now.toISOString())
        .lte("date_heure_debut", dans7jours.toISOString())
        .neq("statut", "annule")
    : { data: [] };

  const chargeParProf: Record<string, { coursPlanifies: number; creneauxOuverts: number }> = {};
  for (const id of profIds) chargeParProf[id] = { coursPlanifies: 0, creneauxOuverts: 0 };
  for (const c of creneauxSemaine ?? []) {
    if (!chargeParProf[c.prof_id]) continue;
    if (c.statut === "reserve") chargeParProf[c.prof_id].coursPlanifies += 1;
    if (c.statut === "disponible") chargeParProf[c.prof_id].creneauxOuverts += 1;
  }
  for (const c of coursSemaine ?? []) {
    if (!chargeParProf[c.prof_id]) continue;
    chargeParProf[c.prof_id].coursPlanifies += 1;
  }

  // ── Statut d'onboarding — dernière connexion via l'API Auth ──────────────
  // Un seul appel groupé plutôt qu'un appel par prof (perf).
  const { data: authList } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000, page: 1 });
  const lastSignInParUser = Object.fromEntries(
    (authList?.users ?? []).map(u => [u.id, u.last_sign_in_at])
  );

  const typeLabel = (t: string) =>
    t === "independant" ? "Indépendant" : t === "mixte" ? "Mixte" : "Salarié";

  // ── Assemblage final pour le client ───────────────────────────────────────
  const profsData: ProfRow[] = (profs ?? []).map((prof) => {
    const p = prof.profile as any;
    const contrat = contratParProf[prof.id];
    const charge = chargeParProf[prof.id] ?? { coursPlanifies: 0, creneauxOuverts: 0 };
    return {
      id: prof.id,
      prenom: p?.prenom ?? "",
      nom: p?.nom ?? "",
      telephone: p?.telephone ?? null,
      disciplines: prof.disciplines ?? [],
      actif: prof.actif,
      typeContratLabel: contrat ? typeLabel(contrat.type) : null,
      salaireFixe: contrat?.salaire_fixe ?? null,
      tarifCoursIndiv: contrat?.tarif_cours_indiv ?? null,
      coursPlanifiesSemaine: charge.coursPlanifies,
      creneauxOuvertsSemaine: charge.creneauxOuverts,
      onboardingEnAttente: !lastSignInParUser[prof.user_id],
    };
  });

  const toutesDisciplines = Array.from(
    new Set(profsData.flatMap((p) => p.disciplines))
  ).sort((a, b) => a.localeCompare(b, "fr"));

  return <ProfsListClient profs={profsData} toutesDisciplines={toutesDisciplines} />;
}