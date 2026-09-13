"use client";
// app/plateforme/planning/VueHistorique.tsx
// Historique des cours (passés + annulés) avec un graphique de fréquentation
// mensuelle. Remplace la tentative d'historique dans Mon Compte — plus
// logique ici, à côté des vues Liste/Semaine du Planning.
//
// Pas de nouvelle dépendance (pas de recharts/chart.js) : le graphique est un
// simple bar chart en SVG, cohérent avec le reste du code de la plateforme
// qui n'utilise pas de librairie de graphiques ailleurs.

interface CoursHistorique {
  id: string;
  discipline: string;
  date_heure_debut: string;
  date_heure_fin: string;
  prof_prenom?: string;
  prof_nom?: string;
  salle?: string;
  statut: "planifie" | "annule" | "effectue";
  parcours_nom?: string;
  type_cours?: "parcours" | "individuel" | "location";
  tarif_final?: number;
  origine_tarif?: "decouverte" | "fidelite" | null;
}

function isPasse(c: CoursHistorique) {
  return new Date(c.date_heure_fin).getTime() < Date.now();
}

// Un cours appartient à l'historique s'il est déjà passé OU annulé — un
// cours annulé mais dont la date était dans le futur ne doit pas rester dans
// "à venir".
function estDansHistorique(c: CoursHistorique) {
  return c.statut === "annule" || isPasse(c);
}

function formatDateCourt(iso: string) {
  return new Date(iso).toLocaleDateString("fr-BE", { day: "numeric", month: "short", year: "numeric" });
}

function formatMoisLabel(iso: string) {
  return new Date(iso).toLocaleDateString("fr-BE", { month: "short" });
}

function formatMontant(m: number) {
  return m === 0 ? "Gratuit" : `${m.toFixed(2).replace(/\.00$/, "")} €`;
}

// ─── STATUT BADGE ─────────────────────────────────────────────────────────────
function StatutBadge({ statut }: { statut: CoursHistorique["statut"] }) {
  if (statut === "annule") {
    return (
      <span className="rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-red-500">
        Annulé
      </span>
    );
  }
  return (
    <span className="rounded-full bg-[rgb(239,244,239)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[rgb(22,92,71)]">
      Effectué
    </span>
  );
}

// ─── GRAPHIQUE : FRÉQUENTATION PAR MOIS (SVG, sans dépendance) ────────────────
function GraphiqueFrequentation({ cours }: { cours: CoursHistorique[] }) {
  const NB_MOIS = 6;
  const maintenant = new Date();

  // Construit les 6 derniers mois (le plus ancien en premier), avec le
  // décompte de cours effectués (annulés exclus) sur chacun.
  const mois = Array.from({ length: NB_MOIS }, (_, i) => {
    const d = new Date(maintenant.getFullYear(), maintenant.getMonth() - (NB_MOIS - 1 - i), 1);
    const count = cours.filter(c => {
      if (c.statut === "annule") return false;
      const cd = new Date(c.date_heure_debut);
      return cd.getFullYear() === d.getFullYear() && cd.getMonth() === d.getMonth();
    }).length;
    return { label: formatMoisLabel(d.toISOString()), count, isCurrent: d.getMonth() === maintenant.getMonth() && d.getFullYear() === maintenant.getFullYear() };
  });

  const max = Math.max(1, ...mois.map(m => m.count));

  return (
    <div className="rounded-[20px] border border-black/6 bg-white p-5 shadow-[0_2px_12px_rgba(16,16,16,0.04)]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/30 mb-4">
        Cours suivis · 6 derniers mois
      </p>
      <div className="flex items-end justify-between gap-3 h-28">
        {mois.map((m, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
            <span className="text-[11px] font-semibold text-black/50">{m.count > 0 ? m.count : ""}</span>
            <div
              className="w-full rounded-t-[6px] transition-all"
              style={{
                height: `${Math.max(4, (m.count / max) * 72)}px`,
                background: m.isCurrent ? "rgb(22,92,71)" : "rgba(22,92,71,0.18)",
              }}
            />
            <span className={`text-[10px] font-medium capitalize ${m.isCurrent ? "text-[rgb(22,92,71)]" : "text-black/35"}`}>
              {m.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── STATS RÉSUMÉ ─────────────────────────────────────────────────────────────
function StatsResume({ cours }: { cours: CoursHistorique[] }) {
  const effectues = cours.filter(c => c.statut !== "annule");
  const totalSeances = effectues.length;
  const totalDepense = effectues.reduce((sum, c) => sum + (c.tarif_final ?? 0), 0);
  const nbOfferts = effectues.filter(c => c.origine_tarif === "fidelite").length;

  const stats = [
    { label: "Séances suivies", value: totalSeances },
    { label: "Total dépensé", value: `${totalDepense.toFixed(2).replace(/\.00$/, "")} €` },
    { label: "Cours offerts (fidélité)", value: nbOfferts },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(s => (
        <div key={s.label} className="rounded-[16px] border border-black/6 bg-white px-4 py-3 text-center">
          <p className="text-lg font-bold text-black">{s.value}</p>
          <p className="text-[10px] text-black/40 mt-0.5 leading-4">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function VueHistorique({ cours }: { cours: CoursHistorique[] }) {
  const historique = cours
    .filter(estDansHistorique)
    .sort((a, b) => new Date(b.date_heure_debut).getTime() - new Date(a.date_heure_debut).getTime());

  if (historique.length === 0) {
    return (
      <div className="rounded-[20px] border border-black/6 bg-white p-12 text-center">
        <p className="text-2xl mb-3">📖</p>
        <p className="text-sm font-medium text-black/60">Pas encore d'historique</p>
        <p className="text-xs text-black/35 mt-1">Tes cours passés apparaîtront ici une fois suivis.</p>
      </div>
    );
  }

  // Un cours individuel a un montant à afficher ; un cours de parcours n'en a
  // pas (facturé globalement via l'abonnement annuel, pas à la séance).
  const aDesMontants = historique.some(c => c.type_cours === "individuel");

  return (
    <div className="space-y-4">
      <GraphiqueFrequentation cours={historique} />
      {aDesMontants && <StatsResume cours={historique} />}

      <div className="rounded-[20px] border border-black/6 bg-white divide-y divide-black/5 overflow-hidden shadow-[0_2px_12px_rgba(16,16,16,0.04)]">
        {historique.map(c => {
          const profNom = [c.prof_prenom, c.prof_nom].filter(Boolean).join(" ");
          return (
            <div key={c.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-black truncate">
                  {c.discipline}
                  {profNom ? <span className="text-black/40"> · {profNom}</span> : null}
                  {c.parcours_nom ? <span className="text-black/40"> · {c.parcours_nom}</span> : null}
                </p>
                <p className="text-xs text-black/40 mt-0.5">{formatDateCourt(c.date_heure_debut)}</p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <StatutBadge statut={c.statut} />
                {c.type_cours === "individuel" && (
                  <span className="text-sm font-semibold text-black w-16 text-right">
                    {formatMontant(c.tarif_final ?? 0)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}