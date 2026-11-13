// app/plateforme/dashboard/page.tsx
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/plateforme/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, prenom, nom, role, telephone, photo_url")
    .eq("id", user.id)
    .single();

  const { data: foyer } = await supabase
    .from("foyers")
    .select("id, eleves(id, prenom, nom, statut_premium)")
    .eq("user_id", user.id)
    .single();

  const eleves = foyer?.eleves ?? [];
  const nbPremium = eleves.filter((e: any) => e.statut_premium).length;

  const { data: candidature } = await supabase
    .from("candidatures")
    .select("id, parcours, statut, place_expire_at")
    .eq("user_id", user.id)
    .not("statut", "in", '("refusee","sans_reponse","expiree","annulee)')
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { count: totalCandidatures } = await supabase
    .from("candidatures")
    .select("id", { count: "exact", head: true });

  const candidaturesArrondies = totalCandidatures
    ? Math.floor(totalCandidatures / 10) * 10
    : 0;

  // ── Mini-widget Planning (remplace la tuile "Planning" du dashboard) ──────
  // Chantier du 13/09/2026 : au lieu d'une simple tuile de lien, le dashboard
  // montre maintenant un aperçu réel de la semaine (mêmes couleurs de statut
  // que la page Planning) + le prochain cours en détail, avec un bouton vers
  // le Planning complet.
  //
  // Limite connue : ne couvre que les cours individuels (reservations_indiv).
  // Les cours de parcours annuel (élèves premium) ne sont pas encore inclus
  // dans cet aperçu — à ajouter si besoin, sur le même modèle que
  // app/plateforme/planning/page.tsx.
  type CoursMini = {
    id: string;
    discipline: string;
    date_heure_debut: string;
    date_heure_fin: string;
    statut: "planifie" | "annule" | "effectue";
  };

  const STATUT_RESERVATION_VERS_COURS: Record<string, CoursMini["statut"]> = {
    confirmee: "planifie",
    effectuee: "effectue",
    annulee_eleve: "annule",
    annulee_prof: "annule",
  };

  const DUREE_COURS_MIN = 45;

  const eleveIds = eleves.map((e: any) => e.id);
  let coursSemaine: CoursMini[] = [];
  let prochainCours: { discipline: string; date_heure_debut: string; prof_prenom?: string; prof_nom?: string } | null = null;

  if (eleveIds.length > 0) {
    const { data: reservations } = await supabaseAdmin
      .from("reservations_indiv")
      .select(`
        id, statut,
        creneau:creneaux(discipline, debut, prof:profs(profile:profiles!profs_user_id_fkey(prenom, nom)))
      `)
      .in("eleve_id", eleveIds);

    const toutes = (reservations ?? [])
      .filter((r: any) => r.creneau)
      .map((r: any) => ({
        id: r.id,
        discipline: r.creneau.discipline,
        date_heure_debut: r.creneau.debut,
        date_heure_fin: new Date(new Date(r.creneau.debut).getTime() + DUREE_COURS_MIN * 60000).toISOString(),
        statut: STATUT_RESERVATION_VERS_COURS[r.statut] ?? "planifie",
        prof_prenom: r.creneau.prof?.profile?.prenom,
        prof_nom: r.creneau.prof?.profile?.nom,
      }));

    // 7 prochains jours à partir d'aujourd'hui (pas la semaine civile
    // lundi-dimanche — un dimanche, ça ne montrerait que le jour même).
    // Décision d'Angélie le 13/09/2026.
    const debutFenetre = new Date();
    debutFenetre.setHours(0, 0, 0, 0);
    const finFenetre = new Date(debutFenetre);
    finFenetre.setDate(debutFenetre.getDate() + 6);
    finFenetre.setHours(23, 59, 59, 999);

    coursSemaine = toutes
      .filter((c) => {
        const d = new Date(c.date_heure_debut);
        return d >= debutFenetre && d <= finFenetre;
      })
      .map(({ id, discipline, date_heure_debut, date_heure_fin, statut }) => ({ id, discipline, date_heure_debut, date_heure_fin, statut }));

    const prochaines = toutes
      .filter((c) => c.statut !== "annule" && new Date(c.date_heure_debut).getTime() > Date.now())
      .sort((a, b) => new Date(a.date_heure_debut).getTime() - new Date(b.date_heure_debut).getTime());

    prochainCours = prochaines[0]
      ? {
          discipline: prochaines[0].discipline,
          date_heure_debut: prochaines[0].date_heure_debut,
          prof_prenom: prochaines[0].prof_prenom,
          prof_nom: prochaines[0].prof_nom,
        }
      : null;
  }

  return (
    <DashboardClient
      profile={profile}
      nbEleves={eleves.length}
      nbPremium={nbPremium}
      candidature={candidature ?? null}
      candidaturesArrondies={candidaturesArrondies}
      coursSemaine={coursSemaine}
      prochainCours={prochainCours}
    />
  );
}