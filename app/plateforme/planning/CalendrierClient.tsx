"use client";
// app/plateforme/planning/CalendrierClient.tsx
// Calendrier unifié (remplace Liste / Semaine / Historique séparés) : deux
// niveaux de zoom (Semaine / Mois), navigation ← →, couleur = statut du
// cours, icône = discipline, "+" sur les jours vides à venir pour montrer
// les créneaux disponibles à réserver ce jour-là.
//
// Décisions prises avec Angélie (session du 13/09/2026) :
// - Couleur de fond = statut (à venir / effectué / annulé), icône = discipline
//   — pas l'inverse, pour que le calendrier réponde d'abord à "est-ce que
//   j'ai bien suivi mes cours ?" au premier coup d'œil.
// - Cliquer un jour en vue Mois bascule en vue Semaine centrée sur ce jour
//   (drill-down) plutôt que d'essayer d'afficher le détail dans une case de
//   90px.
// - Le "+" n'ouvre PAS directement le tunnel de réservation (OngletCoursIndividuels
//   gère son propre état interne, pas de prop de préselection par date
//   aujourd'hui) — il ouvre une liste des créneaux dispo ce jour-là, avec un
//   lien vers la page d'inscription. Pré-remplir le tunnel à partir d'une
//   date est un chantier séparé si souhaité.

import Link from "next/link";
import { useState } from "react";
import {
  ChevronLeft, ChevronRight, Plus, X, Mic, Music, Footprints,
  Users, Sparkles, PenLine, Disc,
  Theater,
  SportShoe,
  MicVocal,
  EyeIcon,
  PencilIcon,
  CirclePlayIcon,
} from "lucide-react";
// ─── TYPES ────────────────────────────────────────────────────────────────────
export interface Cours {
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

export interface CreneauDispo {
  id: string;
  discipline: string;
  date_heure_debut: string;
  prof_prenom?: string;
  prof_nom?: string;
}

export type StatutAffiche = "a_venir" | "effectue" | "annule";

// ─── ICÔNES PAR DISCIPLINE ─────────────────────────────────────────────────────
// Si un de ces noms n'existe pas dans la version de lucide-react installée
// (`npm ls lucide-react`), remplace-le par une icône proche disponible sur
// https://lucide.dev/icons — Music (générique) est le choix le plus sûr en
// dépannage.
const DISCIPLINE_ICONS: Record<string, any> = {
  "Chant": MicVocal,
  "Coaching vocal": MicVocal,
  "Danse": SportShoe,
  "Théâtre": Theater,
  "Expression scénique": EyeIcon,
  "Écriture": PencilIcon,
  "Studio": CirclePlayIcon,
};
export function DisciplineIcon({ discipline, size = 12, className = "" }: { discipline: string; size?: number; className?: string }) {
  const Icon = DISCIPLINE_ICONS[discipline] ?? Music;
  return <Icon size={size} className={className} />;
}

// ─── COULEURS PAR STATUT ───────────────────────────────────────────────────────
export const STATUT_STYLE: Record<StatutAffiche, { bg: string; text: string; label: string; dot: string }> = {
  a_venir:  { bg: "rgba(185,151,83,0.14)", text: "rgb(140,108,50)", label: "À venir",  dot: "rgb(185,151,83)" },
  effectue: { bg: "rgba(22,92,71,0.10)",   text: "rgb(22,92,71)",   label: "Effectué", dot: "rgb(22,92,71)"   },
  annule:   { bg: "rgba(239,68,68,0.08)",  text: "rgb(220,38,38)",  label: "Annulé",   dot: "rgb(220,38,38)"  },
};

// Le statut stocké en base ("planifie") ne se met jamais à jour tout seul
// après la date du cours — on calcule donc le statut AFFICHÉ à partir de la
// date réelle plutôt que de faire confiance uniquement au champ "statut" :
// un cours "planifie" dont la date est passée est affiché "effectué".
export function statutAffiche(c: Cours): StatutAffiche {
  if (c.statut === "annule") return "annule";
  return new Date(c.date_heure_fin).getTime() < Date.now() ? "effectue" : "a_venir";
}

// ─── UTILS DATE ────────────────────────────────────────────────────────────────
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function isPastDay(d: Date) {
  const end = new Date(d); end.setHours(23, 59, 59, 999);
  return end.getTime() < Date.now();
}
function formatHeure(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" });
}
function mondayOf(d: Date) {
  const day = d.getDay() || 7;
  const m = new Date(d);
  m.setDate(d.getDate() - day + 1);
  m.setHours(0, 0, 0, 0);
  return m;
}
function getWeekDays(ref: Date) {
  const start = mondayOf(ref);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}
function getMonthGridDays(ref: Date) {
  const year = ref.getFullYear(), month = ref.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const gridStart = mondayOf(firstOfMonth);
  const gridEndBase = mondayOf(lastOfMonth);
  const gridEnd = new Date(gridEndBase);
  gridEnd.setDate(gridEndBase.getDate() + 6);

  const days: Date[] = [];
  const cursor = new Date(gridStart);
  while (cursor <= gridEnd) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}
const JOURS_COURTS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

// ─── GRAPHIQUE DE FRÉQUENTATION (visible directement, 6 derniers mois) ───────
// SVG/CSS fait main, pas de nouvelle dépendance (recharts, chart.js...).
function GraphiqueFrequentation({ cours }: { cours: Cours[] }) {
  const NB_MOIS = 6;
  const maintenant = new Date();

  const mois = Array.from({ length: NB_MOIS }, (_, i) => {
    const d = new Date(maintenant.getFullYear(), maintenant.getMonth() - (NB_MOIS - 1 - i), 1);
    const count = cours.filter((c) => {
      if (c.statut === "annule") return false;
      const cd = new Date(c.date_heure_debut);
      return cd.getFullYear() === d.getFullYear() && cd.getMonth() === d.getMonth();
    }).length;
    return {
      label: d.toLocaleDateString("fr-BE", { month: "short" }),
      count,
      isCurrent: d.getMonth() === maintenant.getMonth() && d.getFullYear() === maintenant.getFullYear(),
    };
  });

  const max = Math.max(1, ...mois.map((m) => m.count));

  return (
    <div className="rounded-[16px] border border-black/6 bg-white p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/30 mb-3">
        Fréquentation · 6 derniers mois
      </p>
      <div className="flex items-end justify-between gap-2 h-20">
        {mois.map((m, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
            <span className="text-[10px] font-semibold text-black/50">{m.count > 0 ? m.count : ""}</span>
            <div
              className="w-full rounded-t-[5px] transition-all"
              style={{
                height: `${Math.max(4, (m.count / max) * 52)}px`,
                background: m.isCurrent ? "rgb(22,92,71)" : "rgba(22,92,71,0.18)",
              }}
            />
            <span className={`text-[9px] font-medium capitalize ${m.isCurrent ? "text-[rgb(22,92,71)]" : "text-black/35"}`}>
              {m.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── STATS RÉSUMÉ (visible directement) ───────────────────────────────────────
function StatsResume({ cours }: { cours: Cours[] }) {
  const effectues = cours.filter((c) => c.statut !== "annule");
  const totalSeances = effectues.length;
  const individuels = effectues.filter((c) => c.type_cours === "individuel");
  const totalDepense = individuels.reduce((sum, c) => sum + (c.tarif_final ?? 0), 0);
  const nbOfferts = individuels.filter((c) => c.origine_tarif === "fidelite").length;

  const stats = [
    { label: "Séances suivies", value: totalSeances },
    ...(individuels.length > 0
      ? [
          { label: "Total dépensé", value: `${totalDepense.toFixed(2).replace(/\.00$/, "")} €` },
          { label: "Cours offerts", value: nbOfferts },
        ]
      : []),
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-1 gap-2 h-full">
      {stats.map((s) => (
        <div key={s.label} className="rounded-[16px] border border-black/6 bg-white px-3 py-2.5 text-center sm:text-left flex-1 flex sm:flex-col sm:justify-center">
          <p className="text-base font-bold text-black">{s.value}</p>
          <p className="text-[9px] text-black/40 mt-0.5 leading-3.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── POPOVER DÉTAIL D'UN COURS ─────────────────────────────────────────────────
function PopoverCours({ cours, onClose }: { cours: Cours; onClose: () => void }) {
  const [annulation, setAnnulation] = useState<"idle" | "loading">("idle");
  const statut = statutAffiche(cours);
  const style = STATUT_STYLE[statut];
  const peutAnnuler = cours.type_cours === "individuel" && cours.statut === "planifie" && statut === "a_venir";

  const handleAnnuler = async () => {
    if (!confirm("Annuler ce cours individuel ? Le créneau redevient disponible pour quelqu'un d'autre.")) return;
    setAnnulation("loading");
    try {
      const res = await fetch("/api/reservation/cours-individuel/annuler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId: cours.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur lors de l'annulation");
      window.location.reload();
    } catch (e: any) {
      alert(e.message ?? "Erreur lors de l'annulation");
      setAnnulation("idle");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-[20px] bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-[12px] shrink-0"
              style={{ background: style.bg, color: style.text }}
            >
              <DisciplineIcon discipline={cours.discipline} size={22} />
            </span>
            <div>
              <p className="text-sm font-semibold text-black">{cours.discipline}</p>
              {cours.parcours_nom && <p className="text-xs text-black/40">{cours.parcours_nom}</p>}
            </div>
          </div>
          <button onClick={onClose} className="text-black/30 hover:text-black/60 transition">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-1.5 text-sm text-black/60 mb-4">
          <p>
            {new Date(cours.date_heure_debut).toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <p>{formatHeure(cours.date_heure_debut)} – {formatHeure(cours.date_heure_fin)}</p>
          {(cours.prof_prenom || cours.prof_nom) && <p>{cours.prof_prenom} {cours.prof_nom}</p>}
          {cours.salle && <p>Salle : {cours.salle}</p>}
          {cours.type_cours === "individuel" && cours.tarif_final !== undefined && (
            <p>
              {cours.tarif_final === 0 ? "Gratuit" : `${cours.tarif_final.toFixed(2).replace(/\.00$/, "")} €`}
              {cours.origine_tarif === "fidelite" && " · carte fidélité"}
              {cours.origine_tarif === "decouverte" && " · 1er cours -50%"}
            </p>
          )}
        </div>

        <span
          className="inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] mb-4"
          style={{ background: style.bg, color: style.text }}
        >
          {style.label}
        </span>

        {peutAnnuler && (
          <button
            onClick={handleAnnuler}
            disabled={annulation === "loading"}
            className="w-full rounded-full border border-red-200 text-red-500 py-2.5 text-sm font-semibold hover:bg-red-50 transition disabled:opacity-50"
          >
            {annulation === "loading" ? "Annulation en cours…" : "Annuler ce cours"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── POPOVER CRÉNEAUX DISPONIBLES (jour vide, "+") ────────────────────────────
function PopoverDispo({ date, slots, onClose }: { date: Date; slots: CreneauDispo[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-[20px] bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 mb-1">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/30">Créneaux disponibles</p>
            <p className="text-sm font-semibold text-black">
              {date.toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          <button onClick={onClose} className="text-black/30 hover:text-black/60 transition">
            <X size={18} />
          </button>
        </div>

        {slots.length === 0 ? (
          <p className="text-sm text-black/40 py-6 text-center">
            Rien de disponible ce jour-là pour l'instant.
          </p>
        ) : (
          <div className="mt-4 space-y-2 max-h-[50vh] overflow-y-auto">
            {slots.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-[14px] border border-black/6 px-3.5 py-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[rgb(239,244,239)] text-[rgb(22,92,71)] shrink-0">
                  <DisciplineIcon discipline={s.discipline} size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-black">{s.discipline}</p>
                  <p className="text-xs text-black/40">
                    {formatHeure(s.date_heure_debut)}
                    {(s.prof_prenom || s.prof_nom) ? ` · ${s.prof_prenom ?? ""} ${s.prof_nom ?? ""}`.trim() : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <Link
          href="/plateforme/inscription?onglet=cours"
          className="mt-4 flex items-center justify-center rounded-full bg-[rgb(22,92,71)] text-white py-3 text-sm font-semibold hover:bg-[rgb(18,75,58)] transition"
        >
          Voir les créneaux et réserver →
        </Link>
        <p className="mt-2 text-[11px] text-black/30 text-center">
          Le lien t'amène à la page de réservation générale — le créneau exact n'est pas encore présélectionné automatiquement.
        </p>
      </div>
    </div>
  );
}

// ─── CHIP COURS (vue semaine) ──────────────────────────────────────────────────
function ChipCours({ cours, onClick }: { cours: Cours; onClick: () => void }) {
  const statut = statutAffiche(cours);
  const style = STATUT_STYLE[statut];
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 rounded-[10px] px-2 py-2 text-left transition hover:brightness-95"
      style={{ background: style.bg, color: style.text }}
    >
      <DisciplineIcon discipline={cours.discipline} size={18} className="shrink-0" />
      <span className="text-xs font-semibold truncate flex-1">{formatHeure(cours.date_heure_debut)}</span>
    </button>
  );
}

// ─── VUE SEMAINE ──────────────────────────────────────────────────────────────
function VueSemaineCalendrier({
  refDate, cours, dispo, onCoursClick, onDispoClick,
}: {
  refDate: Date;
  cours: Cours[];
  dispo: CreneauDispo[];
  onCoursClick: (c: Cours) => void;
  onDispoClick: (date: Date, slots: CreneauDispo[]) => void;
}) {
  const days = getWeekDays(refDate);

  function coursOfDay(d: Date) {
    return cours
      .filter((c) => sameDay(new Date(c.date_heure_debut), d))
      .sort((a, b) => new Date(a.date_heure_debut).getTime() - new Date(b.date_heure_debut).getTime());
  }
  function dispoOfDay(d: Date) {
    return dispo.filter((s) => sameDay(new Date(s.date_heure_debut), d));
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
      {days.map((day, idx) => {
        const isToday = sameDay(day, new Date());
        const dayCours = coursOfDay(day);
        const daySlots = dispoOfDay(day);
        const past = isPastDay(day);
        const peutReserver = !past && dayCours.length === 0;

        return (
          <div
            key={idx}
            className={`rounded-[16px] border overflow-hidden flex flex-col min-h-[150px] ${
              isToday ? "border-[rgb(22,92,71)]/30 shadow-[0_2px_12px_rgba(22,92,71,0.08)]" : "border-black/6"
            }`}
          >
            <div className={`px-2 py-2 text-center ${isToday ? "bg-[rgb(22,92,71)]" : "bg-black/2"}`}>
              <p className={`text-[9px] font-semibold uppercase tracking-[0.12em] ${isToday ? "text-white/70" : "text-black/40"}`}>
                {JOURS_COURTS[idx]}
              </p>
              <p className={`text-base font-bold leading-tight ${isToday ? "text-white" : "text-black"}`}>{day.getDate()}</p>
            </div>

            <div className="flex-1 bg-white p-1.5 space-y-1.5">
              {dayCours.map((c) => (
                <ChipCours key={c.id} cours={c} onClick={() => onCoursClick(c)} />
              ))}

              {peutReserver && (
                <button
                  onClick={() => onDispoClick(day, daySlots)}
                  className="w-full flex flex-col items-center justify-center gap-0.5 rounded-[10px] border border-dashed border-black/10 py-2.5 text-black/25 hover:border-[rgb(22,92,71)]/40 hover:text-[rgb(22,92,71)] transition"
                >
                  <Plus size={14} />
                  {daySlots.length > 0 && (
                    <span className="text-[9px] font-semibold">{daySlots.length} dispo</span>
                  )}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── VUE MOIS ─────────────────────────────────────────────────────────────────
function VueMoisCalendrier({
  refDate, cours, onDrillDown,
}: {
  refDate: Date;
  cours: Cours[];
  onDrillDown: (day: Date) => void;
}) {
  const days = getMonthGridDays(refDate);
  const currentMonth = refDate.getMonth();

  function coursOfDay(d: Date) {
    return cours.filter((c) => sameDay(new Date(c.date_heure_debut), d));
  }

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {JOURS_COURTS.map((j) => (
          <p key={j} className="text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-black/30 py-1">
            {j}
          </p>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const inMonth = day.getMonth() === currentMonth;
          const isToday = sameDay(day, new Date());
          const dayCours = coursOfDay(day);
          const visibles = dayCours.slice(0, 3);
          const reste = dayCours.length - visibles.length;

          return (
            <button
              key={idx}
              onClick={() => onDrillDown(day)}
              className={`rounded-[10px] border p-1.5 min-h-[72px] sm:min-h-[88px] flex flex-col items-center transition hover:border-[rgb(22,92,71)]/30 ${
                isToday ? "border-[rgb(22,92,71)]/40 bg-[rgb(239,244,239)]/40" : "border-black/6 bg-white"
              } ${!inMonth ? "opacity-35" : ""}`}
            >
              <span className={`text-xs font-semibold ${isToday ? "text-[rgb(22,92,71)]" : "text-black/60"}`}>
                {day.getDate()}
              </span>
              <div className="flex flex-wrap items-center justify-center gap-0.5 mt-1">
                {visibles.map((c) => {
                  const style = STATUT_STYLE[statutAffiche(c)];
                  return (
                    <span
                      key={c.id}
                      className="flex h-5 w-5 items-center justify-center rounded-full"
                      style={{ background: style.dot }}
                    >
                      <DisciplineIcon discipline={c.discipline} size={12} className="text-white" />
                    </span>
                  );
                })}
                {reste > 0 && <span className="text-[9px] font-bold text-black/35">+{reste}</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function CalendrierClient({
  cours, creneauxDisponibles, isPremium,
}: {
  cours: Cours[];
  creneauxDisponibles: CreneauDispo[];
  isPremium: boolean;
}) {
  const [vue, setVue] = useState<"semaine" | "mois">("semaine");
  const [refDate, setRefDate] = useState(new Date());
  const [popoverCours, setPopoverCours] = useState<Cours | null>(null);
  const [popoverDispo, setPopoverDispo] = useState<{ date: Date; slots: CreneauDispo[] } | null>(null);

  function navigate(direction: -1 | 1) {
    const d = new Date(refDate);
    if (vue === "semaine") {
      d.setDate(d.getDate() + direction * 7);
    } else {
      d.setMonth(d.getMonth() + direction);
    }
    setRefDate(d);
  }

  const label = vue === "semaine"
    ? (() => {
        const days = getWeekDays(refDate);
        const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
        return `${days[0].toLocaleDateString("fr-BE", opts)} – ${days[6].toLocaleDateString("fr-BE", { ...opts, year: "numeric" })}`;
      })()
    : refDate.toLocaleDateString("fr-BE", { month: "long", year: "numeric" });

  return (
    <div className="space-y-4">
      {/* ── Fréquentation, visible directement (plus besoin de cliquer nulle part) ── */}
      {cours.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-stretch">
          <GraphiqueFrequentation cours={cours} />
          <div className="sm:w-40">
            <StatsResume cours={cours} />
          </div>
        </div>
      )}

      {/* ── Barre de navigation ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[16px] bg-white border border-black/6 px-4 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5 transition text-black/50">
            <ChevronLeft size={16} />
          </button>
          <div className="text-center min-w-[160px]">
            <p className="text-xs font-semibold text-black capitalize">{label}</p>
          </div>
          <button onClick={() => navigate(1)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5 transition text-black/50">
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => setRefDate(new Date())}
            className="ml-1 rounded-full border border-black/10 px-3 py-1.5 text-[11px] font-semibold text-black/50 hover:border-[rgb(22,92,71)]/30 hover:text-[rgb(22,92,71)] transition"
          >
            Aujourd'hui
          </button>
        </div>

        <div className="flex rounded-full border border-black/10 overflow-hidden bg-white">
          {(["semaine", "mois"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setVue(v)}
              className={`px-3.5 py-1.5 text-xs font-medium transition capitalize ${
                vue === v ? "bg-[rgb(22,92,71)] text-white" : "text-black/50 hover:text-black"
              }`}
            >
              {v === "semaine" ? "Semaine" : "Mois"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Légende ── */}
      <div className="flex flex-wrap items-center gap-3 px-1">
        {(Object.keys(STATUT_STYLE) as StatutAffiche[]).map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUT_STYLE[s].dot }} />
            <span className="text-[11px] text-black/40">{STATUT_STYLE[s].label}</span>
          </div>
        ))}
      </div>

      {/* ── Grille ── */}
      {vue === "semaine" ? (
        <VueSemaineCalendrier
          refDate={refDate}
          cours={cours}
          dispo={creneauxDisponibles}
          onCoursClick={setPopoverCours}
          onDispoClick={(date, slots) => setPopoverDispo({ date, slots })}
        />
      ) : (
        <VueMoisCalendrier
          refDate={refDate}
          cours={cours}
          onDrillDown={(day) => { setRefDate(day); setVue("semaine"); }}
        />
      )}

      {popoverCours && <PopoverCours cours={popoverCours} onClose={() => setPopoverCours(null)} />}
      {popoverDispo && (
        <PopoverDispo date={popoverDispo.date} slots={popoverDispo.slots} onClose={() => setPopoverDispo(null)} />
      )}
    </div>
  );
}