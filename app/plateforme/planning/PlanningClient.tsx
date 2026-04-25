"use client";

import { useState } from "react";
import Link from "next/link";
import PlatformShell, { ShellProfile, ShellEleve, BadgePremium } from "@/app/components/plateforme/PlatformShell";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Cours {
  id: string;
  discipline: string;
  date_heure_debut: string;
  date_heure_fin: string;
  prof_prenom?: string;
  prof_nom?: string;
  salle?: string;
  statut: "planifie" | "annule" | "effectue";
  parcours_nom?: string;
}

interface PlanningProps {
  profile: ShellProfile;
  eleves: ShellEleve[];
  cours: Cours[];
  activeEleveId: string;
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const JOURS_COURTS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const DISCIPLINE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Chant":       { bg: "bg-emerald-50",  text: "text-emerald-700",  border: "border-emerald-200" },
  "Danse":       { bg: "bg-violet-50",   text: "text-violet-700",   border: "border-violet-200"  },
  "Théâtre":     { bg: "bg-amber-50",    text: "text-amber-700",    border: "border-amber-200"   },
  "Comédie musicale": { bg: "bg-rose-50", text: "text-rose-700",    border: "border-rose-200"    },
  "Studio":      { bg: "bg-cyan-50",     text: "text-cyan-700",     border: "border-cyan-200"    },
  "Scène":       { bg: "bg-orange-50",   text: "text-orange-700",   border: "border-orange-200"  },
  "default":     { bg: "bg-[rgb(239,244,239)]", text: "text-[rgb(22,92,71)]", border: "border-[rgb(22,92,71)]/20" },
};

function getDisciplineColor(discipline: string) {
  return DISCIPLINE_COLORS[discipline] ?? DISCIPLINE_COLORS["default"];
}

function formatHeure(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" });
}

function formatDateCourt(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-BE", { weekday: "short", day: "numeric", month: "short" });
}

function getWeekRange(offset: number = 0) {
  const now = new Date();
  const day = now.getDay() || 7; // Lundi = 1
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + 1 + offset * 7);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { monday, sunday };
}

function getCoursOfWeek(cours: Cours[], weekOffset: number) {
  const { monday, sunday } = getWeekRange(weekOffset);
  return cours.filter(c => {
    const d = new Date(c.date_heure_debut);
    return d >= monday && d <= sunday && c.statut !== "annule";
  });
}

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

function isUpcoming(dateStr: string) {
  return new Date(dateStr) > new Date();
}

// ─── CARTE COURS ──────────────────────────────────────────────────────────────
function CarteCours({ cours, compact = false }: { cours: Cours; compact?: boolean }) {
  const color = getDisciplineColor(cours.discipline);
  const annule = cours.statut === "annule";
  const aVenir = isUpcoming(cours.date_heure_debut);
  const today = isToday(cours.date_heure_debut);

  return (
    <div className={`rounded-[16px] border p-4 transition ${
      annule
        ? "border-red-100 bg-red-50/50 opacity-60"
        : today
          ? "border-[rgb(22,92,71)]/30 bg-white shadow-[0_2px_12px_rgba(22,92,71,0.08)]"
          : `${color.border} ${color.bg}`
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Discipline + statut */}
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className={`text-xs font-semibold ${annule ? "text-red-500" : color.text}`}>
              {cours.discipline}
            </span>
            {today && !annule && (
              <span className="rounded-full bg-[rgb(22,92,71)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white">
                Aujourd'hui
              </span>
            )}
            {annule && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-red-500">
                Annulé
              </span>
            )}
          </div>

          {/* Heure */}
          <p className="text-sm font-semibold text-black">
            {formatHeure(cours.date_heure_debut)} – {formatHeure(cours.date_heure_fin)}
          </p>

          {/* Prof + salle */}
          {!compact && (
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {cours.prof_prenom && (
                <p className="text-xs text-black/50">
                  👤 {cours.prof_prenom} {cours.prof_nom}
                </p>
              )}
              {cours.salle && (
                <p className="text-xs text-black/50">📍 {cours.salle}</p>
              )}
            </div>
          )}
        </div>

        {/* Durée */}
        <div className="shrink-0 text-right">
          <p className="text-[10px] text-black/35">
            {Math.round((new Date(cours.date_heure_fin).getTime() - new Date(cours.date_heure_debut).getTime()) / 60000)}min
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── VUE SEMAINE ──────────────────────────────────────────────────────────────
function VueSemaine({ cours, weekOffset, onPrev, onNext }: {
  cours: Cours[];
  weekOffset: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const { monday, sunday } = getWeekRange(weekOffset);
  const coursOfWeek = getCoursOfWeek(cours, weekOffset);

  const formatRange = () => {
    const opt: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
    const m = monday.toLocaleDateString("fr-BE", opt);
    const s = sunday.toLocaleDateString("fr-BE", { ...opt, year: "numeric" });
    return `${m} – ${s}`;
  };

  // Grouper par jour
  const byDay: Record<number, Cours[]> = {};
  coursOfWeek.forEach(c => {
    const dayIdx = (new Date(c.date_heure_debut).getDay() + 6) % 7; // 0=lundi
    if (!byDay[dayIdx]) byDay[dayIdx] = [];
    byDay[dayIdx].push(c);
  });

  return (
    <div className="space-y-4">
      {/* Navigation semaine */}
      <div className="flex items-center justify-between rounded-[16px] bg-white border border-black/6 px-4 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <button onClick={onPrev} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5 transition text-sm text-black/50">←</button>
        <div className="text-center">
          <p className="text-xs font-semibold text-black/50 uppercase tracking-[0.12em]">
            {weekOffset === 0 ? "Cette semaine" : weekOffset === 1 ? "Semaine prochaine" : weekOffset === -1 ? "Semaine passée" : `Semaine ${weekOffset > 0 ? "+" : ""}${weekOffset}`}
          </p>
          <p className="text-sm font-medium text-black mt-0.5">{formatRange()}</p>
        </div>
        <button onClick={onNext} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5 transition text-sm text-black/50">→</button>
      </div>

      {/* Jours */}
      {Array.from({ length: 7 }, (_, i) => {
        const dayCours = byDay[i] ?? [];
        const dayDate = new Date(monday);
        dayDate.setDate(monday.getDate() + i);
        const todayBool = dayDate.toDateString() === new Date().toDateString();

        return (
          <div key={i} className={`rounded-[16px] border overflow-hidden ${todayBool ? "border-[rgb(22,92,71)]/25 shadow-[0_2px_12px_rgba(22,92,71,0.06)]" : "border-black/5"}`}>
            {/* Header jour */}
            <div className={`px-4 py-2.5 flex items-center gap-3 ${todayBool ? "bg-[rgb(22,92,71)] text-white" : "bg-white"}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${todayBool ? "text-white/80" : "text-black/35"}`}>
                {JOURS[i]}
              </p>
              <p className={`text-sm font-semibold ${todayBool ? "text-white" : "text-black"}`}>
                {dayDate.toLocaleDateString("fr-BE", { day: "numeric", month: "short" })}
              </p>
              {todayBool && <span className="ml-auto text-[10px] font-bold uppercase tracking-[0.14em] text-white/80">Aujourd'hui</span>}
            </div>

            {/* Cours du jour */}
            <div className={`${todayBool ? "bg-[rgb(239,244,239)]/40" : "bg-white"} p-3 space-y-2`}>
              {dayCours.length === 0 ? (
                <p className="text-xs text-black/25 py-1 text-center italic">Pas de cours</p>
              ) : (
                dayCours
                  .sort((a, b) => new Date(a.date_heure_debut).getTime() - new Date(b.date_heure_debut).getTime())
                  .map(c => <CarteCours key={c.id} cours={c} compact />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── VUE LISTE ────────────────────────────────────────────────────────────────
function VueListe({ cours }: { cours: Cours[] }) {
  const upcoming = cours
    .filter(c => isUpcoming(c.date_heure_debut))
    .sort((a, b) => new Date(a.date_heure_debut).getTime() - new Date(b.date_heure_debut).getTime())
    .slice(0, 20);

  if (upcoming.length === 0) {
    return (
      <div className="rounded-[20px] border border-black/6 bg-white p-12 text-center">
        <p className="text-3xl mb-3">📅</p>
        <p className="text-sm font-medium text-black/60">Aucun cours à venir</p>
        <p className="text-xs text-black/35 mt-1">Le planning sera mis à jour par la direction.</p>
      </div>
    );
  }

  // Grouper par semaine
  const grouped: Record<string, { label: string; cours: Cours[] }> = {};
  upcoming.forEach(c => {
    const d = new Date(c.date_heure_debut);
    const { monday } = getWeekRange(0);
    const diffDays = Math.floor((d.getTime() - monday.getTime()) / (1000 * 60 * 60 * 24 * 7));
    const key = `week_${diffDays}`;
    if (!grouped[key]) {
      grouped[key] = {
        label: diffDays === 0 ? "Cette semaine" : diffDays === 1 ? "Semaine prochaine" : `Dans ${diffDays} semaines`,
        cours: [],
      };
    }
    grouped[key].cours.push(c);
  });

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([key, { label, cours: groupCours }]) => (
        <div key={key}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.20em] text-black/35 mb-3 px-1">
            {label}
          </p>
          <div className="space-y-2.5">
            {groupCours.map(c => (
              <div key={c.id} className="flex gap-4 items-start">
                {/* Date sidebar */}
                <div className={`shrink-0 w-14 text-center rounded-[12px] py-2 ${isToday(c.date_heure_debut) ? "bg-[rgb(22,92,71)] text-white" : "bg-white border border-black/6"}`}>
                  <p className={`text-[9px] font-semibold uppercase tracking-[0.12em] ${isToday(c.date_heure_debut) ? "text-white/70" : "text-black/35"}`}>
                    {JOURS_COURTS[(new Date(c.date_heure_debut).getDay() + 6) % 7]}
                  </p>
                  <p className={`text-base font-bold leading-tight ${isToday(c.date_heure_debut) ? "text-white" : "text-black"}`}>
                    {new Date(c.date_heure_debut).getDate()}
                  </p>
                  <p className={`text-[9px] ${isToday(c.date_heure_debut) ? "text-white/60" : "text-black/30"}`}>
                    {new Date(c.date_heure_debut).toLocaleDateString("fr-BE", { month: "short" })}
                  </p>
                </div>
                {/* Carte */}
                <div className="flex-1 min-w-0">
                  <CarteCours cours={c} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ÉTAT NON PREMIUM ─────────────────────────────────────────────────────────
function EtatNonPremium() {
  return (
    <div className="space-y-5">
      {/* Message principal */}
      <div className="rounded-[20px] border border-black/6 bg-white p-8 text-center shadow-[0_2px_12px_rgba(16,16,16,0.04)]">
        <div className="w-16 h-16 rounded-full bg-[rgb(239,244,239)] flex items-center justify-center text-3xl mx-auto mb-4">
          📅
        </div>
        <h2 className="text-base font-semibold text-black mb-2">Planning non disponible</h2>
        <p className="text-sm text-black/50 leading-6 max-w-xs mx-auto">
          Le planning est accessible uniquement aux élèves inscrits dans un parcours annuel Crea'Star.
        </p>
      </div>

      {/* Invite à candidater */}
      <div className="rounded-[20px] overflow-hidden border border-black/6 shadow-[0_2px_12px_rgba(16,16,16,0.04)]">
        <div className="bg-[rgb(22,92,71)] px-5 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgb(185,151,83)] mb-1">Ouverture 2028</p>
          <p className="text-sm font-semibold text-white mb-1">Rejoignez un parcours Crea'Star</p>
          <p className="text-xs text-white/60 leading-5">
            Full Artist · Comédie Musicale · Éveil Musical
          </p>
        </div>
        <div className="bg-white px-5 py-4">
          <Link
            href="/inscriptions"
            className="flex items-center justify-center gap-2 rounded-full bg-[rgb(22,92,71)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[rgb(18,75,58)]"
          >
            Déposer ma candidature →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function PlanningClient({ profile, eleves, cours, activeEleveId: initialEleveId }: PlanningProps) {
  const [activeEleveId, setActiveEleveId] = useState(initialEleveId);
  const [vue, setVue] = useState<"semaine" | "liste">("liste");
  const [weekOffset, setWeekOffset] = useState(0);

  const activeEleve = eleves.find(e => e.id === activeEleveId) ?? eleves[0];
  const isPremium = activeEleve?.statut_premium ?? false;

  return (
    <PlatformShell profile={profile} eleves={eleves}>
      <div className="space-y-5">

        {/* ── EN-TÊTE ── */}
        <div className="rounded-[20px] border border-black/6 bg-white px-5 py-4 shadow-[0_2px_12px_rgba(16,16,16,0.04)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.20em] text-black/30">Espace élève</p>
              <h1 className="mt-0.5 text-base font-semibold text-black flex items-center gap-2">
                Planning
                {isPremium && <BadgePremium mini />}
              </h1>
            </div>

            {/* Sélecteur élève + vue */}
            <div className="flex items-center gap-2 flex-wrap">
              {eleves.length > 1 && eleves.map(e => (
                <button
                  key={e.id}
                  onClick={() => setActiveEleveId(e.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                    activeEleveId === e.id
                      ? "bg-[rgb(22,92,71)] text-white"
                      : "border border-black/10 text-black/50 hover:border-[rgb(22,92,71)]/30"
                  }`}
                >
                  {e.prenom}
                </button>
              ))}

              {isPremium && (
                <div className="flex rounded-full border border-black/10 overflow-hidden">
                  {(["liste", "semaine"] as const).map(v => (
                    <button
                      key={v}
                      onClick={() => setVue(v)}
                      className={`px-3.5 py-1.5 text-xs font-medium transition capitalize ${
                        vue === v ? "bg-[rgb(22,92,71)] text-white" : "text-black/50 hover:text-black"
                      }`}
                    >
                      {v === "liste" ? "Liste" : "Semaine"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── CONTENU ── */}
        {!isPremium ? (
          <EtatNonPremium />
        ) : cours.length === 0 ? (
          <div className="rounded-[20px] border border-black/6 bg-white p-10 text-center shadow-[0_2px_12px_rgba(16,16,16,0.04)]">
            <p className="text-3xl mb-3">📅</p>
            <p className="text-sm font-semibold text-black mb-1">Planning en cours de préparation</p>
            <p className="text-xs text-black/40 leading-5">
              La direction publiera votre planning avant l'ouverture. Vous serez notifié dès qu'il est disponible.
            </p>
          </div>
        ) : vue === "liste" ? (
          <VueListe cours={cours} />
        ) : (
          <VueSemaine
            cours={cours}
            weekOffset={weekOffset}
            onPrev={() => setWeekOffset(o => o - 1)}
            onNext={() => setWeekOffset(o => o + 1)}
          />
        )}

        {/* ── STATS PREMIUM ── */}
        {isPremium && cours.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Cours total", value: cours.length },
              { label: "À venir", value: cours.filter(c => isUpcoming(c.date_heure_debut)).length },
              { label: "Effectués", value: cours.filter(c => c.statut === "effectue").length },
            ].map(stat => (
              <div key={stat.label} className="rounded-[16px] border border-black/6 bg-white px-4 py-3 text-center shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
                <p className="text-lg font-bold text-[rgb(22,92,71)]">{stat.value}</p>
                <p className="text-[10px] text-black/40 mt-0.5 uppercase tracking-[0.12em]">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </PlatformShell>
  );
}