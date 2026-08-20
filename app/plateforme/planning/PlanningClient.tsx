"use client";

import { useState } from "react";
import Link from "next/link";
import { ShellProfile, ShellEleve, BadgePremium } from "@/app/components/plateforme/PlatformShell";
import { useRouter } from "next/navigation";

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
  type_cours?: "parcours" | "individuel" | "location";
}

interface PlanningProps {
  profile: ShellProfile;
  eleves: ShellEleve[];
  eleveData: Record<string, Cours[]>;
  initialEleveId: string;
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
const JOURS_COURTS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const DISCIPLINE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Chant":            { bg: "bg-emerald-50",          text: "text-emerald-700",  border: "border-emerald-200" },
  "Danse":            { bg: "bg-violet-50",            text: "text-violet-700",   border: "border-violet-200"  },
  "Théâtre":          { bg: "bg-amber-50",             text: "text-amber-700",    border: "border-amber-200"   },
  "Comédie musicale": { bg: "bg-rose-50",              text: "text-rose-700",     border: "border-rose-200"    },
  "Studio":           { bg: "bg-cyan-50",              text: "text-cyan-700",     border: "border-cyan-200"    },
  "Scène":            { bg: "bg-orange-50",            text: "text-orange-700",   border: "border-orange-200"  },
  "default":          { bg: "bg-[rgb(239,244,239)]",   text: "text-[rgb(22,92,71)]", border: "border-[rgb(22,92,71)]/20" },
};

function getDisciplineColor(discipline: string) {
  return DISCIPLINE_COLORS[discipline] ?? DISCIPLINE_COLORS["default"];
}

function formatHeure(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" });
}

function formatDuree(debut: string, fin: string) {
  return Math.round((new Date(fin).getTime() - new Date(debut).getTime()) / 60000) + "min";
}

function isToday(dateStr: string) {
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

function isUpcoming(dateStr: string) {
  return new Date(dateStr) > new Date();
}

function isPast(dateStr: string) {
  return new Date(dateStr) < new Date();
}

function getWeekDays(offset: number = 0) {
  const now = new Date();
  const day = now.getDay() || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + 1 + offset * 7);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function getWeekLabel(offset: number) {
  if (offset === 0) return "Cette semaine";
  if (offset === 1) return "Semaine prochaine";
  if (offset === -1) return "Semaine dernière";
  if (offset > 0) return `Dans ${offset} semaines`;
  return `Il y a ${Math.abs(offset)} semaines`;
}

function getWeekRange(offset: number) {
  const days = getWeekDays(offset);
  const first = days[0];
  const last = days[6];
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
  return `${first.toLocaleDateString("fr-BE", opts)} – ${last.toLocaleDateString("fr-BE", { ...opts, year: "numeric" })}`;
}

// ─── CARTE COURS ──────────────────────────────────────────────────────────────
function CarteCours({ cours, compact = false }: { cours: Cours; compact?: boolean }) {
  const router = useRouter();
  const [annulation, setAnnulation] = useState<"idle" | "loading">("idle");
  const color = getDisciplineColor(cours.discipline);
  const annule = cours.statut === "annule";
  const today = isToday(cours.date_heure_debut);
  const past = isPast(cours.date_heure_fin);

  const peutAnnuler =
    cours.type_cours === "individuel" &&
    cours.statut === "planifie" &&
    !past;

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
      router.refresh();
    } catch (e: any) {
      alert(e.message ?? "Erreur lors de l'annulation");
    } finally {
      setAnnulation("idle");
    }
  };

  return (
    <div className={`rounded-[16px] border p-4 transition ${
      annule
        ? "border-red-100 bg-red-50/40 opacity-60"
        : today
          ? "border-[rgb(22,92,71)]/25 bg-white shadow-[0_2px_12px_rgba(22,92,71,0.08)]"
          : past
            ? "border-black/5 bg-black/2 opacity-70"
            : `${color.border} ${color.bg}`
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Discipline + badges */}
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
            {cours.statut === "effectue" && (
              <span className="rounded-full bg-black/6 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-black/35">
                Effectué
              </span>
            )}
          </div>

          {/* Heure */}
          <p className="text-sm font-semibold text-black">
            {formatHeure(cours.date_heure_debut)} – {formatHeure(cours.date_heure_fin)}
          </p>

          {/* Prof + salle (vue non compacte) */}
          {!compact && (
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
              {cours.prof_prenom && (
                <p className="text-xs text-black/50">
                  {cours.prof_prenom} {cours.prof_nom}
                </p>
              )}
              {cours.salle && (
                <p className="text-xs text-black/40">· {cours.salle}</p>
              )}
            </div>
          )}

          {/* Annulation — cours individuels à venir uniquement */}
          {peutAnnuler && !compact && (
            <button
              onClick={handleAnnuler}
              disabled={annulation === "loading"}
              className="mt-2.5 text-[11px] font-semibold text-red-500/80 hover:text-red-600 underline underline-offset-2 disabled:opacity-40"
            >
              {annulation === "loading" ? "Annulation en cours..." : "Annuler ce cours"}
            </button>
          )}
        </div>

        {/* Durée */}
        <p className="text-[10px] text-black/30 shrink-0">
          {formatDuree(cours.date_heure_debut, cours.date_heure_fin)}
        </p>
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
  const days = getWeekDays(weekOffset);

  // Index du jour actuel dans la semaine (0=lundi…6=dimanche), -1 si hors semaine
  const todayIdx = days.findIndex(d => d.toDateString() === new Date().toDateString());

  // Sur mobile : centrer sur aujourd'hui (ou lundi par défaut), afficher 3 jours
  const [mobileStartIdx, setMobileStartIdx] = useState<number>(() =>
    todayIdx >= 0 ? Math.min(todayIdx, 4) : 0
  );
  const mobileEnd = Math.min(mobileStartIdx + 3, 7);
  const mobileDays = days.slice(mobileStartIdx, mobileEnd);

  // Cours par jour
  function coursOfDay(date: Date) {
    return cours.filter(c => {
      const d = new Date(c.date_heure_debut);
      return d.toDateString() === date.toDateString();
    }).sort((a, b) => new Date(a.date_heure_debut).getTime() - new Date(b.date_heure_debut).getTime());
  }

  const totalCoursWeek = days.reduce((acc, d) => acc + coursOfDay(d).length, 0);

  // Prochain cours de la semaine (pour le message semaine vide)
  const prochainHorsSemaine = cours
    .filter(c => isUpcoming(c.date_heure_debut) && c.statut !== "annule")
    .sort((a, b) => new Date(a.date_heure_debut).getTime() - new Date(b.date_heure_debut).getTime())[0];

  return (
    <div className="space-y-4">

      {/* Navigation semaine */}
      <div className="flex items-center justify-between rounded-[16px] bg-white border border-black/6 px-4 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <button
          onClick={onPrev}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5 transition text-sm text-black/50"
        >←</button>
        <div className="text-center">
          <p className="text-xs font-semibold text-black">{getWeekLabel(weekOffset)}</p>
          <p className="text-[10px] text-black/35 mt-0.5">{getWeekRange(weekOffset)}</p>
        </div>
        <button
          onClick={onNext}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5 transition text-sm text-black/50"
        >→</button>
      </div>

      {/* Semaine sans cours */}
      {totalCoursWeek === 0 ? (
        <div className="rounded-[20px] border border-black/6 bg-white p-8 text-center shadow-[0_2px_12px_rgba(16,16,16,0.04)]">
          <p className="text-2xl mb-3">🗓</p>
          <p className="text-sm font-semibold text-black mb-1">Pas de cours cette semaine</p>
          {prochainHorsSemaine ? (
            <p className="text-xs text-black/40 leading-5">
              Prochain cours :{" "}
              <span className="font-semibold text-[rgb(22,92,71)]">
                {new Date(prochainHorsSemaine.date_heure_debut).toLocaleDateString("fr-BE", {
                  weekday: "long", day: "numeric", month: "long",
                })}
              </span>
              {" "}· {prochainHorsSemaine.discipline}
            </p>
          ) : (
            <p className="text-xs text-black/40">Le planning sera mis à jour par la direction.</p>
          )}
        </div>
      ) : (
        <>
          {/* ── MOBILE : 3 jours avec navigation latérale ── */}
          <div className="lg:hidden space-y-3">
            {/* Sélecteur jours mobile */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {days.map((day, idx) => {
                const isActive = idx >= mobileStartIdx && idx < mobileEnd;
                const isTodayDay = day.toDateString() === new Date().toDateString();
                const hasCours = coursOfDay(day).length > 0;
                return (
                  <button
                    key={idx}
                    onClick={() => setMobileStartIdx(Math.min(idx, 4))}
                    className={`shrink-0 flex flex-col items-center rounded-[12px] px-3 py-2 transition ${
                      isTodayDay
                        ? "bg-[rgb(22,92,71)] text-white"
                        : isActive
                          ? "bg-[rgb(239,244,239)] text-[rgb(22,92,71)]"
                          : "text-black/40"
                    }`}
                  >
                    <span className="text-[9px] font-semibold uppercase tracking-[0.12em]">
                      {JOURS_COURTS[idx]}
                    </span>
                    <span className="text-sm font-bold leading-tight mt-0.5">{day.getDate()}</span>
                    {hasCours && (
                      <span className={`mt-1 h-1 w-1 rounded-full ${isTodayDay ? "bg-white/60" : "bg-[rgb(22,92,71)]"}`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Colonnes 3 jours */}
            <div className="grid grid-cols-3 gap-2">
              {mobileDays.map((day, i) => {
                const isTodayDay = day.toDateString() === new Date().toDateString();
                const dayCours = coursOfDay(day);
                return (
                  <div key={i} className={`rounded-[14px] border overflow-hidden ${isTodayDay ? "border-[rgb(22,92,71)]/25" : "border-black/6"}`}>
                    {/* Header jour */}
                    <div className={`px-2 py-2 text-center ${isTodayDay ? "bg-[rgb(22,92,71)]" : "bg-black/2"}`}>
                      <p className={`text-[9px] font-semibold uppercase tracking-[0.12em] ${isTodayDay ? "text-white/70" : "text-black/40"}`}>
                        {JOURS_COURTS[(day.getDay() + 6) % 7]}
                      </p>
                      <p className={`text-base font-bold leading-tight ${isTodayDay ? "text-white" : "text-black"}`}>
                        {day.getDate()}
                      </p>
                    </div>
                    {/* Cours */}
                    <div className="bg-white p-2 space-y-1.5 min-h-[60px]">
                      {dayCours.length === 0 ? (
                        <p className="text-[10px] text-black/20 text-center py-2 italic">—</p>
                      ) : (
                        dayCours.map(c => {
                          const col = getDisciplineColor(c.discipline);
                          return (
                            <div key={c.id} className={`rounded-[8px] px-2 py-1.5 border ${col.border} ${col.bg}`}>
                              <p className={`text-[10px] font-semibold truncate ${col.text}`}>{c.discipline}</p>
                              <p className="text-[9px] text-black/50 mt-0.5">{formatHeure(c.date_heure_debut)}</p>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── DESKTOP : 7 jours ── */}
          <div className="hidden lg:grid grid-cols-7 gap-2">
            {days.map((day, idx) => {
              const isTodayDay = day.toDateString() === new Date().toDateString();
              const dayCours = coursOfDay(day);
              return (
                <div key={idx} className={`rounded-[14px] border overflow-hidden ${isTodayDay ? "border-[rgb(22,92,71)]/30 shadow-[0_2px_12px_rgba(22,92,71,0.08)]" : "border-black/6"}`}>
                  <div className={`px-2 py-2.5 text-center ${isTodayDay ? "bg-[rgb(22,92,71)]" : "bg-black/2"}`}>
                    <p className={`text-[9px] font-semibold uppercase tracking-[0.12em] ${isTodayDay ? "text-white/70" : "text-black/40"}`}>
                      {JOURS_COURTS[idx]}
                    </p>
                    <p className={`text-base font-bold leading-tight ${isTodayDay ? "text-white" : "text-black"}`}>
                      {day.getDate()}
                    </p>
                    <p className={`text-[9px] ${isTodayDay ? "text-white/50" : "text-black/25"}`}>
                      {day.toLocaleDateString("fr-BE", { month: "short" })}
                    </p>
                    {isTodayDay && (
                      <span className="mt-1 inline-block text-[8px] font-bold uppercase tracking-[0.14em] text-white/70">
                        Auj.
                      </span>
                    )}
                  </div>
                  <div className={`p-2 space-y-1.5 min-h-[80px] ${isTodayDay ? "bg-[rgb(239,244,239)]/30" : "bg-white"}`}>
                    {dayCours.length === 0 ? (
                      <p className="text-[10px] text-black/20 text-center py-3 italic">—</p>
                    ) : (
                      dayCours.map(c => <CarteCours key={c.id} cours={c} compact />)
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── VUE LISTE ────────────────────────────────────────────────────────────────
function VueListe({ cours }: { cours: Cours[] }) {
  const [showAll, setShowAll] = useState(false);
  const INITIAL_LIMIT = 15;

  // Séparer passés et à venir
  const upcoming = cours
    .filter(c => isUpcoming(c.date_heure_debut))
    .sort((a, b) => new Date(a.date_heure_debut).getTime() - new Date(b.date_heure_debut).getTime());

  if (upcoming.length === 0) {
    return (
      <div className="rounded-[20px] border border-black/6 bg-white p-12 text-center">
        <p className="text-2xl mb-3">📅</p>
        <p className="text-sm font-medium text-black/60">Aucun cours à venir</p>
        <p className="text-xs text-black/35 mt-1">Le planning sera mis à jour par la direction.</p>
      </div>
    );
  }

  const visible = showAll ? upcoming : upcoming.slice(0, INITIAL_LIMIT);
  const hasMore = upcoming.length > INITIAL_LIMIT && !showAll;

  // Grouper par semaine
  const grouped: { label: string; cours: Cours[] }[] = [];
  const { monday: thisMonday } = (() => {
    const now = new Date();
    const day = now.getDay() || 7;
    const m = new Date(now);
    m.setDate(now.getDate() - day + 1);
    m.setHours(0, 0, 0, 0);
    return { monday: m };
  })();

  visible.forEach(c => {
    const d = new Date(c.date_heure_debut);
    const diffWeeks = Math.floor((d.getTime() - thisMonday.getTime()) / (1000 * 60 * 60 * 24 * 7));
    const label = diffWeeks === 0
      ? "Cette semaine"
      : diffWeeks === 1
        ? "Semaine prochaine"
        : `Dans ${diffWeeks} semaines`;

    const existing = grouped.find(g => g.label === label);
    if (existing) {
      existing.cours.push(c);
    } else {
      grouped.push({ label, cours: [c] });
    }
  });

  return (
    <div className="space-y-6">
      {grouped.map(({ label, cours: groupCours }) => (
        <div key={label}>
          {/* Label semaine avec ligne */}
          <div className="flex items-center gap-3 mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.20em] text-black/35 whitespace-nowrap">
              {label}
            </p>
            <div className="flex-1 h-px bg-black/6" />
          </div>

          <div className="space-y-2.5">
            {groupCours.map(c => {
              const today = isToday(c.date_heure_debut);
              return (
                <div key={c.id} className="flex gap-3 items-start">
                  {/* Pastille date — ancrage visuel fort si aujourd'hui */}
                  <div className={`shrink-0 w-14 text-center rounded-[12px] py-2 ${
                    today
                      ? "bg-[rgb(22,92,71)] shadow-[0_2px_8px_rgba(22,92,71,0.25)]"
                      : "bg-white border border-black/6"
                  }`}>
                    <p className={`text-[9px] font-semibold uppercase tracking-[0.12em] ${today ? "text-white/70" : "text-black/35"}`}>
                      {JOURS_COURTS[(new Date(c.date_heure_debut).getDay() + 6) % 7]}
                    </p>
                    <p className={`text-base font-bold leading-tight ${today ? "text-white" : "text-black"}`}>
                      {new Date(c.date_heure_debut).getDate()}
                    </p>
                    <p className={`text-[9px] ${today ? "text-white/55" : "text-black/30"}`}>
                      {new Date(c.date_heure_debut).toLocaleDateString("fr-BE", { month: "short" })}
                    </p>
                    {today && (
                      <p className="text-[8px] font-bold uppercase tracking-[0.10em] text-white/70 mt-0.5">Auj.</p>
                    )}
                  </div>

                  {/* Carte */}
                  <div className="flex-1 min-w-0">
                    <CarteCours cours={c} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Voir plus */}
      {hasMore && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full rounded-[14px] border border-black/8 bg-white py-3 text-xs font-semibold text-black/50 transition hover:border-[rgb(22,92,71)]/25 hover:text-[rgb(22,92,71)]"
        >
          Voir les {upcoming.length - INITIAL_LIMIT} cours suivants →
        </button>
      )}
    </div>
  );
}

// ─── ÉTAT AUCUNE RÉSERVATION ──────────────────────────────────────────────────
// Affiché uniquement si l'élève n'a aucun cours — quel que soit son statut.
function EtatAucunCours({ isPremium }: { isPremium: boolean }) {
  return (
    <div className="space-y-5">
      <div className="rounded-[20px] border border-black/6 bg-white p-8 text-center shadow-[0_2px_12px_rgba(16,16,16,0.04)]">
        <div className="w-16 h-16 rounded-full bg-[rgb(239,244,239)] flex items-center justify-center text-2xl mx-auto mb-4">
          🗓
        </div>
        <h2 className="text-base font-semibold text-black mb-2">Aucun cours planifié</h2>
        <p className="text-sm text-black/50 leading-6 max-w-xs mx-auto">
          {isPremium
            ? "Le planning de ton parcours sera visible ici dès que les cours sont planifiés."
            : "Tu n'as pas encore de cours réservés. Tu peux réserver un cours individuel, une salle, ou candidater à un parcours annuel."}
        </p>
      </div>

      {/* CTA adapté au statut */}
      {!isPremium && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/plateforme/inscription?onglet=cours"
            className="rounded-[18px] border border-black/6 bg-white px-5 py-4 hover:border-[rgb(22,92,71)]/25 hover:shadow-[0_2px_12px_rgba(22,92,71,0.07)] transition group"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[rgb(22,92,71)] mb-1">Sur mesure</p>
            <p className="text-sm font-semibold text-black">Cours individuels</p>
            <p className="text-xs text-black/40 mt-1 leading-5">Réserve un créneau à ton rythme avec un intervenant.</p>
            <p className="mt-3 text-xs font-semibold text-[rgb(22,92,71)] group-hover:underline">Voir les créneaux →</p>
          </Link>

          <Link
            href="/candidature"
            className="rounded-[18px] border border-black/6 bg-white px-5 py-4 hover:border-[rgb(22,92,71)]/25 hover:shadow-[0_2px_12px_rgba(22,92,71,0.07)] transition group"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[rgb(22,92,71)] mb-1">Parcours annuel</p>
            <p className="text-sm font-semibold text-black">Candidater — 2028</p>
            <p className="text-xs text-black/40 mt-1 leading-5">Full Artist · Comédie Musicale</p>
            <p className="mt-3 text-xs font-semibold text-[rgb(22,92,71)] group-hover:underline">Déposer ma candidature →</p>
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function PlanningClient({
  profile, eleves, eleveData, initialEleveId,
}: PlanningProps) {
  const [activeEleveId, setActiveEleveId] = useState(initialEleveId);
  const [vue, setVue] = useState<"liste" | "semaine">("liste");
  const [weekOffset, setWeekOffset] = useState(0);

  const activeEleve = eleves.find(e => e.id === activeEleveId) ?? eleves[0];
  const isPremium = activeEleve?.statut_premium ?? false;
  const cours = eleveData[activeEleveId] ?? [];

  return (
    <div className="min-h-screen" style={{ background: "rgb(239,244,239)" }}>
      <div className="px-10 lg:px-14" style={{ paddingTop: "calc(96px + 24px)", paddingBottom: 40 }}>
        <div className="space-y-5">

          {/* ── EN-TÊTE ── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgb(185,151,83)] mb-2">
                Espace élève
              </p>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-black mb-1 flex items-center gap-2">
                Planning
                {isPremium && <BadgePremium mini />}
              </h1>
              <p className="text-sm text-black/50">Tes cours à venir et leur historique.</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Sélecteur élève */}
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

              {/* Toggle vue */}
              {isPremium && (
                <div className="flex rounded-full border border-black/10 overflow-hidden bg-white">
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

          {/* ── CONTENU ── */}
          {cours.length === 0 ? (
            <EtatAucunCours isPremium={isPremium} />
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

        </div>
      </div>
    </div>
  );
}