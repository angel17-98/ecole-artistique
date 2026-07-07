// app/plateforme/prof/page.tsx
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { redirect } from "next/navigation";
import ProfDashboardClient from "./ProfDashboardClient";
import { heuresOuvertes, periodeEngagementCourante } from "@/lib/plateforme/heures-ouvertes";

export default async function ProfDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/plateforme/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, prenom, nom, photo_url")
    .eq("id", user.id)
    .single();

  if (!profile || (
    profile.role !== "prof_salarie" &&
    profile.role !== "prof_independant" &&
    profile.role !== "direction"
  )) redirect("/plateforme/dashboard");

  const { data: prof } = await supabaseAdmin
    .from("profs")
    .select("id, type_contrat, disciplines, actif")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: contrat } = prof
    ? await supabaseAdmin
        .from("contrats")
        .select("*")
        .eq("prof_id", prof.id)
        .or("date_fin.is.null,date_fin.gte." + new Date().toISOString().split("T")[0])
        .order("date_debut", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };

  // Cours collectifs à venir
  const { data: coursCollectifs } = prof
    ? await supabaseAdmin
        .from("cours")
        .select("id, discipline, date_heure_debut, date_heure_fin, salle:salles(nom)")
        .eq("prof_id", prof.id)
        .gte("date_heure_debut", new Date().toISOString())
        .order("date_heure_debut", { ascending: true })
        .limit(4)
    : { data: [] };

  // Créneaux individuels réservés à venir
  const { data: creneauxAVenir } = prof
    ? await supabaseAdmin
        .from("creneaux")
        .select("id, discipline, debut, fin_blocage, salle:salles(nom)")
        .eq("prof_id", prof.id)
        .eq("statut", "reserve")
        .gte("debut", new Date().toISOString())
        .order("debut", { ascending: true })
        .limit(4)
    : { data: [] };

  // Stats mois courant
  const debutMois = new Date();
  debutMois.setDate(1);
  debutMois.setHours(0, 0, 0, 0);

  const { count: coursEffectuesMois } = prof
    ? await supabaseAdmin
        .from("creneaux")
        .select("id", { count: "exact", head: true })
        .eq("prof_id", prof.id)
        .eq("statut", "effectue")
        .gte("debut", debutMois.toISOString())
    : { count: 0 };

  // Rémunération mois courant
  const moisCourant = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`;
  const { data: remuneration } = prof
    ? await supabaseAdmin
        .from("remuneration_mensuelle")
        .select("montant_calcule, ajustement")
        .eq("prof_id", prof.id)
        .eq("mois", moisCourant)
        .maybeSingle()
    : { data: null };

  const montantEstime = remuneration
    ? (remuneration.montant_calcule ?? 0) + (remuneration.ajustement ?? 0)
    : null;

  // Messages non lus
  const { data: convs } = await supabaseAdmin
    .from("conversations")
    .select("messages(id, lu_par, sender_id)")
    .contains("participants", [user.id]);

  const messagesNonLus = (convs ?? []).reduce((acc: number, conv: any) => {
    return acc + (conv.messages ?? []).filter(
      (m: any) => !m.lu_par?.includes(user.id) && m.sender_id !== user.id
    ).length;
  }, 0);

  // ── Heures d'ouverture réelles ─────────────────────────────────────────────
  // Calculées à partir des INTERVALLES (pas des créneaux générés, qui se
  // chevauchent) — utilisées à la fois pour la stat "30 prochains jours" et,
  // si un contrat a des heures minimum, pour la barre de progression.
  const { data: intervallesActifs } = prof
    ? await supabaseAdmin
        .from("intervalles_prof")
        .select("heure_debut, heure_fin, recurrence, date_unique, jour_semaine, recurrence_fin, actif")
        .eq("prof_id", prof.id)
        .eq("actif", true)
    : { data: [] };

  const heuresDisponibles30j = heuresOuvertes(
    intervallesActifs ?? [],
    new Date(),
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );

  // ── Objectif du contrat : heures ouvertes vs heures_min_periode ───────────
  let heuresOuvertesPeriode: number | undefined;
  let joursRestantsPeriode: number | undefined;

  if (prof && contrat?.heures_min_periode) {
    const { debut: periodeDebut, fin: periodeFin } = periodeEngagementCourante(
      new Date(contrat.date_debut),
      contrat.periode_engagement
    );

    heuresOuvertesPeriode = heuresOuvertes(intervallesActifs ?? [], periodeDebut, periodeFin);
    joursRestantsPeriode = Math.max(
      0,
      Math.ceil((periodeFin.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    );
  }

  // Fusionner et trier les prochains cours
  const prochainsCours = [
    ...(coursCollectifs ?? []).map((c: any) => ({
      id: c.id, type: "collectif" as const,
      discipline: c.discipline,
      debut: c.date_heure_debut, fin: c.date_heure_fin,
      salle: c.salle?.nom,
    })),
    ...(creneauxAVenir ?? []).map((c: any) => ({
      id: c.id, type: "individuel" as const,
      discipline: c.discipline,
      debut: c.debut, fin: c.fin_blocage,
      salle: c.salle?.nom,
    })),
  ].sort((a, b) => new Date(a.debut).getTime() - new Date(b.debut).getTime()).slice(0, 6);

  // Photo — utilise photo_url ou fallback par prénom
  const photoMap: Record<string, string> = {};
  const photoSrc = profile.photo_url ?? photoMap[profile.prenom ?? ""] ?? null;

  return (
    <ProfDashboardClient
      profile={profile}
      prof={prof}
      contrat={contrat}
      stats={{
        coursEffectuesMois: coursEffectuesMois ?? 0,
        heuresDisponibles30j,
        montantEstime,
        nbDisciplines: prof?.disciplines?.length ?? 0,
        messagesNonLus,
        heuresOuvertesPeriode,
        joursRestantsPeriode,
      }}
      prochainsCours={prochainsCours}
      photoSrc={photoSrc}
    />
  );
}