"use client";

import { useState } from "react";
import Link from "next/link";
import PlatformShell, { ShellProfile, ShellEleve, BadgePremium, Avatar } from "@/app/components/plateforme/PlatformShell";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Foyer { id: string; nom_famille: string; }

interface NoteCours {
  id: string;
  contenu: string;
  created_at: string;
  cours_discipline?: string;
  cours_date?: string;
  prof_prenom?: string;
  prof_nom?: string;
}

interface ProgressionNiveau {
  id: string;
  periode: string;
  date_evaluation: string;
  eval_chant: number;
  eval_danse: number;
  eval_theatre: number;
  eval_ecriture: number;
  eval_scenique: number;
  eval_studio: number;
  commentaire_global?: string;
}

interface CoursIndividuel {
  id: string;
  discipline: string;
  date_heure_debut: string;
  date_heure_fin: string;
  prof_prenom?: string;
  prof_nom?: string;
  statut: string;
  note?: string;
}

interface LocationSalle {
  id: string;
  salle_nom?: string;
  date_heure_debut: string;
  date_heure_fin: string;
  statut: string;
}

interface Fidelite {
  id: string;
  type_carte: string;
  compteur: number;
  total_offerts: number;
}

interface EleveData {
  notes: NoteCours[];
  niveaux: ProgressionNiveau[];
  niveauInitial: ProgressionNiveau | null;
  coursIndividuels: CoursIndividuel[];
  locations: LocationSalle[];
}

interface DossierProps {
  profile: ShellProfile;
  foyer: Foyer;
  eleves: ShellEleve[];
  eleveData: Record<string, EleveData>;
  fidelite: Fidelite[];
  initialEleveId: string;
}

// ─── CONSTANTES DISCIPLINES ───────────────────────────────────────────────────
const DISCIPLINES_CONFIG = [
  {
    key: "eval_chant" as const,
    label: "Chant",
    color: "rgb(16,185,129)",
    colorLight: "rgb(209,250,229)",
    levels: ["Dans ma douche", "J'apprends seul·e", "Cours depuis peu", "Scène associative", "Concerts & projets"],
  },
  {
    key: "eval_danse" as const,
    label: "Danse",
    color: "rgb(139,92,246)",
    colorLight: "rgb(237,233,254)",
    levels: ["Jamais pratiqué", "J'explore", "Cours réguliers", "Spectacles", "Formations pro"],
  },
  {
    key: "eval_theatre" as const,
    label: "Théâtre & Impro",
    color: "rgb(245,158,11)",
    colorLight: "rgb(254,243,199)",
    levels: ["Jamais monté", "Timide sur scène", "Impro & ateliers", "Pièces & rôles", "Formations & planches"],
  },
  {
    key: "eval_ecriture" as const,
    label: "Écriture",
    color: "rgb(239,68,68)",
    colorLight: "rgb(254,226,226)",
    levels: ["Je n'écris pas", "Quelques textes", "Compositions perso", "Projets aboutis", "Publications & scènes"],
  },
  {
    key: "eval_scenique" as const,
    label: "Expression scénique",
    color: "rgb(249,115,22)",
    colorLight: "rgb(255,237,213)",
    levels: ["Inconnu pour moi", "Je découvre", "Je travaille ça", "À l'aise sur scène", "Présence affirmée"],
  },
  {
    key: "eval_studio" as const,
    label: "Studio",
    color: "rgb(6,182,212)",
    colorLight: "rgb(207,250,254)",
    levels: ["Jamais enregistré", "Enregistrements maison", "Sessions studio", "Productions perso", "Projets professionnels"],
  },
] as const;

type DisciplineKey = typeof DISCIPLINES_CONFIG[number]["key"];

// ─── UTILS ────────────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-BE", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function formatDateCourt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-BE", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function formatHeure(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" });
}

// ─── ONGLETS DYNAMIQUES ───────────────────────────────────────────────────────
type OngletId = "parcours" | "individuels" | "locations" | "medias";

function getOnglets(data: EleveData, isPremium: boolean) {
  const onglets: { id: OngletId; label: string; count?: number }[] = [];

  if (isPremium) {
    onglets.push({ id: "parcours", label: "Parcours", count: data.notes.length });
  }
  if (data.coursIndividuels.length > 0) {
    onglets.push({ id: "individuels", label: "Cours individuels", count: data.coursIndividuels.length });
  }
  if (data.locations.length > 0) {
    onglets.push({ id: "locations", label: "Locations", count: data.locations.length });
  }
  if (isPremium) {
    onglets.push({ id: "medias", label: "Médias" });
  }

  return onglets;
}

// ─── COURBE DE PROGRESSION SVG ────────────────────────────────────────────────
function CourbeProgression({
  niveaux,
  niveauInitial,
}: {
  niveaux: ProgressionNiveau[];
  niveauInitial: ProgressionNiveau | null;
}) {
  const [hoveredPeriode, setHoveredPeriode] = useState<string | null>(null);

  // Construire la liste complète des points dans le temps
  const tousLesPoints: ProgressionNiveau[] = [
    ...(niveauInitial ? [niveauInitial] : []),
    ...niveaux,
  ];

  if (tousLesPoints.length === 0) {
    return (
      <div className="rounded-[16px] border border-black/6 bg-[rgb(247,249,247)] p-6 text-center">
        <p className="text-sm text-black/40">
          La progression sera visible ici après la première évaluation semestrielle.
        </p>
      </div>
    );
  }

  const WIDTH = 320;
  const HEIGHT = 120;
  const PADDING_X = 32;
  const PADDING_Y = 16;
  const innerW = WIDTH - PADDING_X * 2;
  const innerH = HEIGHT - PADDING_Y * 2;
  const MAX_LEVEL = 4;

  function xPos(idx: number) {
    if (tousLesPoints.length === 1) return PADDING_X + innerW / 2;
    return PADDING_X + (idx / (tousLesPoints.length - 1)) * innerW;
  }

  function yPos(val: number) {
    return PADDING_Y + innerH - (val / MAX_LEVEL) * innerH;
  }

  function buildPath(key: DisciplineKey) {
    return tousLesPoints
      .map((p, i) => `${i === 0 ? "M" : "L"} ${xPos(i).toFixed(1)} ${yPos(p[key]).toFixed(1)}`)
      .join(" ");
  }

  const pointActif = hoveredPeriode
    ? tousLesPoints.find(p => p.periode === hoveredPeriode)
    : tousLesPoints[tousLesPoints.length - 1];

  return (
    <div className="space-y-4">
      {/* Graphique SVG */}
      <div className="rounded-[16px] border border-black/6 bg-white p-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full"
          style={{ minWidth: 240, maxWidth: 480 }}
        >
          {/* Grilles horizontales */}
          {[0, 1, 2, 3, 4].map(v => (
            <line
              key={v}
              x1={PADDING_X} y1={yPos(v)}
              x2={WIDTH - PADDING_X} y2={yPos(v)}
              stroke="rgba(0,0,0,0.05)" strokeWidth="1"
            />
          ))}

          {/* Courbes par discipline */}
          {DISCIPLINES_CONFIG.map(disc => (
            <g key={disc.key}>
              <path
                d={buildPath(disc.key)}
                fill="none"
                stroke={disc.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.8"
              />
              {/* Points */}
              {tousLesPoints.map((p, i) => (
                <circle
                  key={i}
                  cx={xPos(i)}
                  cy={yPos(p[disc.key])}
                  r="3"
                  fill={disc.color}
                  opacity="0.9"
                />
              ))}
            </g>
          ))}

          {/* Labels périodes en bas */}
          {tousLesPoints.map((p, i) => (
            <text
              key={i}
              x={xPos(i)}
              y={HEIGHT - 2}
              textAnchor="middle"
              fontSize="7"
              fill="rgba(0,0,0,0.35)"
              style={{ cursor: "pointer" }}
              onClick={() => setHoveredPeriode(p.periode === hoveredPeriode ? null : p.periode)}
            >
              {p.periode}
            </text>
          ))}
        </svg>

        {/* Légende */}
        <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-black/5">
          {DISCIPLINES_CONFIG.map(disc => (
            <div key={disc.key} className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: disc.color }} />
              <span className="text-[10px] text-black/50">{disc.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Détail du point sélectionné */}
      {pointActif && (
        <div className="rounded-[16px] border border-black/6 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-black">
              {pointActif.periode === "Entrée" ? "Niveau à l'entrée" : `Évaluation — ${pointActif.periode}`}
            </p>
            <p className="text-[10px] text-black/35">{formatDateCourt(pointActif.date_evaluation)}</p>
          </div>

          <div className="space-y-2.5">
            {DISCIPLINES_CONFIG.map(disc => {
              const val = pointActif[disc.key];
              const label = disc.levels[val] ?? disc.levels[0];
              const pct = (val / 4) * 100;

              // Trouver le niveau initial pour comparer
              const initial = niveauInitial?.[disc.key] ?? 0;
              const delta = pointActif.id === "initial" ? null : val - initial;

              return (
                <div key={disc.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium text-black/70">{disc.label}</span>
                    <div className="flex items-center gap-2">
                      {delta !== null && delta !== 0 && (
                        <span className={`text-[10px] font-bold ${delta > 0 ? "text-emerald-600" : "text-red-500"}`}>
                          {delta > 0 ? `+${delta}` : delta}
                        </span>
                      )}
                      <span className="text-[10px] text-black/40">{label}</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-black/6 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: disc.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {pointActif.commentaire_global && (
            <div className="mt-3 pt-3 border-t border-black/5">
              <p className="text-xs text-black/50 leading-5 italic">"{pointActif.commentaire_global}"</p>
            </div>
          )}
        </div>
      )}

      {/* Hint navigation */}
      {tousLesPoints.length > 1 && (
        <p className="text-[10px] text-black/30 text-center">
          Appuie sur une période dans le graphe pour voir le détail
        </p>
      )}
    </div>
  );
}

// ─── SECTION PARCOURS ─────────────────────────────────────────────────────────
function SectionParcours({
  notes,
  niveaux,
  niveauInitial,
}: {
  notes: NoteCours[];
  niveaux: ProgressionNiveau[];
  niveauInitial: ProgressionNiveau | null;
}) {
  const [vue, setVue] = useState<"notes" | "progression">("notes");
  const [filter, setFilter] = useState("Toutes");

  const disciplines = ["Toutes", ...Array.from(new Set(notes.map(n => n.cours_discipline ?? "Autre")))];
  const filtered = filter === "Toutes" ? notes : notes.filter(n => (n.cours_discipline ?? "Autre") === filter);

  const hasProgression = niveaux.length > 0 || niveauInitial !== null;

  return (
    <div className="space-y-4">
      {/* Toggle notes / progression */}
      <div className="flex rounded-full border border-black/10 overflow-hidden w-fit">
        {[
          { id: "notes" as const, label: `Notes (${notes.length})` },
          { id: "progression" as const, label: "Progression" },
        ].map(v => (
          <button
            key={v.id}
            onClick={() => setVue(v.id)}
            className={`px-4 py-2 text-xs font-medium transition ${
              vue === v.id ? "bg-[rgb(22,92,71)] text-white" : "text-black/50 hover:text-black"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* ── VUE NOTES ── */}
      {vue === "notes" && (
        <div className="space-y-3">
          {notes.length === 0 ? (
            <div className="rounded-[20px] border border-black/6 bg-white p-10 text-center">
              <p className="text-2xl mb-3">📝</p>
              <p className="text-sm font-medium text-black/60 mb-1">Aucune note pour l'instant</p>
              <p className="text-xs text-black/35 leading-5">
                Les retours de tes professeurs après chaque cours apparaîtront ici.
              </p>
            </div>
          ) : (
            <>
              {/* Filtres disciplines */}
              {disciplines.length > 2 && (
                <div className="flex gap-2 flex-wrap">
                  {disciplines.map(d => (
                    <button
                      key={d}
                      onClick={() => setFilter(d)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                        filter === d
                          ? "bg-[rgb(22,92,71)] text-white"
                          : "border border-black/10 text-black/50 hover:border-[rgb(22,92,71)]/30"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}

              {filtered.map(note => (
                <div key={note.id} className="rounded-[18px] border border-black/6 bg-white p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {note.prof_prenom && (
                      <span className="text-xs font-semibold text-black">
                        {note.prof_prenom} {note.prof_nom}
                      </span>
                    )}
                    {note.cours_discipline && (
                      <>
                        <span className="text-black/20">·</span>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgb(22,92,71)]">
                          {note.cours_discipline}
                        </span>
                      </>
                    )}
                    <span className="text-black/20">·</span>
                    <span className="text-[10px] text-black/35">
                      {note.cours_date ? formatDateCourt(note.cours_date) : formatDateCourt(note.created_at)}
                    </span>
                  </div>
                  <div className="rounded-[12px] bg-[rgb(247,249,247)] px-4 py-3 border-l-2 border-[rgb(22,92,71)]/30">
                    <p className="text-sm text-black/75 leading-6">{note.contenu}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── VUE PROGRESSION ── */}
      {vue === "progression" && (
        <div className="space-y-4">
          {!hasProgression ? (
            <div className="rounded-[20px] border border-black/6 bg-white p-10 text-center">
              <p className="text-2xl mb-3">📈</p>
              <p className="text-sm font-medium text-black/60 mb-1">Progression en attente</p>
              <p className="text-xs text-black/35 leading-5 max-w-xs mx-auto">
                La direction effectue une évaluation semestrielle en accord avec les professeurs. 
                Elle apparaîtra ici après la première session.
              </p>
            </div>
          ) : (
            <CourbeProgression niveaux={niveaux} niveauInitial={niveauInitial} />
          )}
        </div>
      )}
    </div>
  );
}

// ─── SECTION COURS INDIVIDUELS ────────────────────────────────────────────────
function SectionCoursIndividuels({ cours }: { cours: CoursIndividuel[] }) {
  if (cours.length === 0) {
    return (
      <div className="rounded-[20px] border border-black/6 bg-white p-10 text-center">
        <p className="text-2xl mb-3">🎵</p>
        <p className="text-sm font-medium text-black/60 mb-1">Aucun cours individuel</p>
        <p className="text-xs text-black/35 leading-5">
          Tes cours individuels réservés apparaîtront ici avec les retours de ton intervenant.
        </p>
        <Link
          href="/cours/cours-individuels"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[rgb(22,92,71)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[rgb(18,75,58)]"
        >
          Voir les créneaux disponibles →
        </Link>
      </div>
    );
  }

  // Grouper par prof
  const byProf: Record<string, CoursIndividuel[]> = {};
  cours.forEach(c => {
    const key = `${c.prof_prenom ?? ""} ${c.prof_nom ?? ""}`.trim() || "Intervenant";
    if (!byProf[key]) byProf[key] = [];
    byProf[key].push(c);
  });

  return (
    <div className="space-y-4">
      {Object.entries(byProf).map(([profNom, profCours]) => {
        const effectues = profCours.filter(c => c.statut === "effectue").length;
        const premier = profCours.sort((a, b) =>
          new Date(a.date_heure_debut).getTime() - new Date(b.date_heure_debut).getTime()
        )[0];

        return (
          <div key={profNom} className="rounded-[20px] border border-black/6 bg-white overflow-hidden shadow-[0_2px_12px_rgba(16,16,16,0.04)]">
            {/* Header prof */}
            <div className="px-5 py-4 border-b border-black/5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgb(22,92,71)]/10 text-sm font-bold text-[rgb(22,92,71)]">
                {profNom[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-black">{profNom}</p>
                <p className="text-[10px] text-black/40 mt-0.5">
                  {effectues} cours effectué{effectues > 1 ? "s" : ""} · depuis {new Date(premier.date_heure_debut).toLocaleDateString("fr-BE", { month: "long", year: "numeric" })}
                </p>
              </div>
              <span className="text-[10px] font-bold text-[rgb(22,92,71)] bg-[rgb(239,244,239)] rounded-full px-2.5 py-1">
                {profCours.length} séance{profCours.length > 1 ? "s" : ""}
              </span>
            </div>

            {/* Liste des cours */}
            <div className="divide-y divide-black/4">
              {profCours
                .sort((a, b) => new Date(b.date_heure_debut).getTime() - new Date(a.date_heure_debut).getTime())
                .map(c => (
                  <div key={c.id} className="px-5 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold text-black">{c.discipline}</p>
                        <p className="text-[10px] text-black/40 mt-0.5">
                          {formatDateCourt(c.date_heure_debut)} · {formatHeure(c.date_heure_debut)}–{formatHeure(c.date_heure_fin)}
                        </p>
                      </div>
                      <span className={`text-[9px] font-semibold uppercase tracking-[0.12em] rounded-full px-2 py-0.5 ${
                        c.statut === "effectue"
                          ? "bg-[rgb(239,244,239)] text-[rgb(22,92,71)]"
                          : c.statut === "annule"
                            ? "bg-red-50 text-red-500"
                            : "bg-black/5 text-black/40"
                      }`}>
                        {c.statut === "effectue" ? "Effectué" : c.statut === "annule" ? "Annulé" : "À venir"}
                      </span>
                    </div>
                    {c.note && (
                      <div className="mt-2 rounded-[10px] bg-[rgb(247,249,247)] px-3 py-2 border-l-2 border-[rgb(22,92,71)]/20">
                        <p className="text-xs text-black/65 leading-5">{c.note}</p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── SECTION LOCATIONS ────────────────────────────────────────────────────────
function SectionLocations({ locations }: { locations: LocationSalle[] }) {
  if (locations.length === 0) {
    return (
      <div className="rounded-[20px] border border-black/6 bg-white p-10 text-center">
        <p className="text-2xl mb-3">🏠</p>
        <p className="text-sm font-medium text-black/60 mb-1">Aucune location</p>
        <p className="text-xs text-black/35 leading-5">
          Tes réservations de salles et de studio apparaîtront ici.
        </p>
        <Link
          href="/locations"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[rgb(22,92,71)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[rgb(18,75,58)]"
        >
          Voir les espaces disponibles →
        </Link>
      </div>
    );
  }

  // Grouper par salle
  const bySalle: Record<string, LocationSalle[]> = {};
  locations.forEach(l => {
    const key = l.salle_nom ?? "Salle";
    if (!bySalle[key]) bySalle[key] = [];
    bySalle[key].push(l);
  });

  return (
    <div className="space-y-4">
      {Object.entries(bySalle).map(([salleNom, salleLocs]) => {
        const effectuees = salleLocs.filter(l => l.statut === "effectuee").length;
        return (
          <div key={salleNom} className="rounded-[20px] border border-black/6 bg-white overflow-hidden shadow-[0_2px_12px_rgba(16,16,16,0.04)]">
            <div className="px-5 py-4 border-b border-black/5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[rgb(239,244,239)] text-lg">🏠</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-black">{salleNom}</p>
                <p className="text-[10px] text-black/40 mt-0.5">{effectuees} session{effectuees > 1 ? "s" : ""} effectuée{effectuees > 1 ? "s" : ""}</p>
              </div>
              <span className="text-[10px] font-bold text-[rgb(22,92,71)] bg-[rgb(239,244,239)] rounded-full px-2.5 py-1">
                {salleLocs.length} réservation{salleLocs.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="divide-y divide-black/4">
              {salleLocs
                .sort((a, b) => new Date(b.date_heure_debut).getTime() - new Date(a.date_heure_debut).getTime())
                .map(l => (
                  <div key={l.id} className="px-5 py-3 flex items-center justify-between gap-2">
                    <p className="text-xs text-black/70">
                      {formatDateCourt(l.date_heure_debut)} · {formatHeure(l.date_heure_debut)}–{formatHeure(l.date_heure_fin)}
                    </p>
                    <span className={`text-[9px] font-semibold uppercase tracking-[0.12em] rounded-full px-2 py-0.5 ${
                      l.statut === "effectuee"
                        ? "bg-[rgb(239,244,239)] text-[rgb(22,92,71)]"
                        : l.statut === "annulee"
                          ? "bg-red-50 text-red-500"
                          : "bg-black/5 text-black/40"
                    }`}>
                      {l.statut === "effectuee" ? "Effectuée" : l.statut === "annulee" ? "Annulée" : "À venir"}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── SECTION MÉDIAS ───────────────────────────────────────────────────────────
function SectionMedias() {
  return (
    <div className="rounded-[20px] border border-black/6 bg-white p-8 text-center shadow-[0_2px_12px_rgba(16,16,16,0.04)]">
      <div className="w-16 h-16 rounded-full bg-[rgb(239,244,239)] flex items-center justify-center text-2xl mx-auto mb-4">
        🖼
      </div>
      <p className="text-sm font-semibold text-black mb-2">Médias — Bientôt disponible</p>
      <p className="text-sm text-black/50 leading-6 max-w-xs mx-auto">
        Tes photos et vidéos de cours, répétitions et spectacles seront partagées ici par tes professeurs au fil de l'année.
      </p>
    </div>
  );
}

// ─── ÉTAT VIDE DOSSIER ────────────────────────────────────────────────────────
function EtatDossierVide({ isPremium }: { isPremium: boolean }) {
  return (
    <div className="space-y-5">
      <div className="rounded-[20px] border border-black/6 bg-white p-8 text-center">
        <p className="text-2xl mb-3">📂</p>
        <p className="text-sm font-semibold text-black mb-2">Dossier vide pour l'instant</p>
        <p className="text-sm text-black/50 leading-6 max-w-xs mx-auto">
          {isPremium
            ? "Ton dossier se remplira au fil des cours — notes de profs, progression, médias."
            : "Reserve un cours individuel ou une salle pour commencer à construire ton historique."}
        </p>
      </div>
      {!isPremium && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/cours/cours-individuels" className="rounded-[18px] border border-black/6 bg-white px-5 py-4 hover:border-[rgb(22,92,71)]/25 transition group">
            <p className="text-sm font-semibold text-black mb-1">Cours individuels</p>
            <p className="text-xs text-black/40 leading-5">Réserve un créneau avec un intervenant.</p>
            <p className="mt-2 text-xs font-semibold text-[rgb(22,92,71)] group-hover:underline">Voir les créneaux →</p>
          </Link>
          <Link href="/candidature" className="rounded-[18px] border border-black/6 bg-white px-5 py-4 hover:border-[rgb(22,92,71)]/25 transition group">
            <p className="text-sm font-semibold text-black mb-1">Parcours annuel</p>
            <p className="text-xs text-black/40 leading-5">Full Artist · Comédie Musicale</p>
            <p className="mt-2 text-xs font-semibold text-[rgb(22,92,71)] group-hover:underline">Déposer ma candidature →</p>
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function DossierClient({
  profile, foyer, eleves, eleveData, fidelite, initialEleveId,
}: DossierProps) {
  const [activeEleveId, setActiveEleveId] = useState(initialEleveId);
  const [onglet, setOnglet] = useState<OngletId>("parcours");

  const activeEleve = eleves.find(e => e.id === activeEleveId) ?? eleves[0];
  const isPremium = activeEleve?.statut_premium ?? false;
  const data = eleveData[activeEleveId] ?? {
    notes: [], niveaux: [], niveauInitial: null, coursIndividuels: [], locations: [],
  };

  const onglets = getOnglets(data, isPremium);
  const ongletActif = onglets.find(o => o.id === onglet) ? onglet : onglets[0]?.id ?? "parcours";

  const dossierVide = onglets.length === 0;

  return (
    <PlatformShell profile={profile} eleves={eleves}>
      <div className="space-y-5">

        {/* ── EN-TÊTE ── */}
        <div className="rounded-[20px] border border-black/6 bg-white px-5 py-4 shadow-[0_2px_12px_rgba(16,16,16,0.04)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.20em] text-black/30">Espace élève</p>
              <h1 className="mt-0.5 text-base font-semibold text-black flex items-center gap-2">
                Mon dossier
                {isPremium && <BadgePremium mini />}
              </h1>
            </div>

            {eleves.length > 1 && (
              <div className="flex items-center gap-2 flex-wrap">
                {eleves.map(e => (
                  <button
                    key={e.id}
                    onClick={() => {
                      setActiveEleveId(e.id);
                      // Reset onglet au premier disponible pour ce nouvel élève
                      const newOnglets = getOnglets(eleveData[e.id] ?? { notes: [], niveaux: [], niveauInitial: null, coursIndividuels: [], locations: [] }, e.statut_premium);
                      setOnglet(newOnglets[0]?.id ?? "parcours");
                    }}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                      activeEleveId === e.id
                        ? "bg-[rgb(22,92,71)] text-white"
                        : "border border-black/10 text-black/50 hover:border-[rgb(22,92,71)]/30"
                    }`}
                  >
                    {e.prenom}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── CONTENU ── */}
        {dossierVide ? (
          <EtatDossierVide isPremium={isPremium} />
        ) : (
          <>
            {/* Onglets dynamiques */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {onglets.map(o => (
                <button
                  key={o.id}
                  onClick={() => setOnglet(o.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
                    ongletActif === o.id
                      ? "bg-[rgb(22,92,71)] text-white"
                      : "bg-white border border-black/10 text-black/55 hover:border-[rgb(22,92,71)]/30"
                  }`}
                >
                  {o.label}
                  {o.count !== undefined && o.count > 0 && (
                    <span className={`flex h-4 min-w-[1rem] px-1 items-center justify-center rounded-full text-[9px] font-bold ${
                      ongletActif === o.id ? "bg-white/20 text-white" : "bg-black/8 text-black/50"
                    }`}>
                      {o.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Contenu onglet */}
            {ongletActif === "parcours" && (
              <SectionParcours
                notes={data.notes}
                niveaux={data.niveaux}
                niveauInitial={data.niveauInitial}
              />
            )}
            {ongletActif === "individuels" && (
              <SectionCoursIndividuels cours={data.coursIndividuels} />
            )}
            {ongletActif === "locations" && (
              <SectionLocations locations={data.locations} />
            )}
            {ongletActif === "medias" && <SectionMedias />}
          </>
        )}

      </div>
    </PlatformShell>
  );
}