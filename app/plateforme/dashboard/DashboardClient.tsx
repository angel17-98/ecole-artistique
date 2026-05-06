"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import PlatformShell, { ShellProfile, ShellEleve, ShellNotification } from "@/app/components/plateforme/PlatformShell";
import { Home, CalendarDays, FolderOpen, UserCircle, MessageCircle, Bell, Zap, Clock, GraduationCap, BookOpen, Star, DoorOpen, Users } from "lucide-react";

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Foyer { id: string; nom_famille: string; }
interface Fidelite { id: string; type_carte: string; compteur: number; total_offerts: number; }

interface CoursData {
  id: string;
  discipline: string;
  date_heure_debut: string;
  date_heure_fin: string;
  prof_prenom?: string;
  prof_nom?: string;
  salle?: string;
  statut: string;
  parcours_nom?: string;
}

interface NoteData {
  id: string;
  contenu: string;
  created_at: string;
  cours_discipline?: string;
  prof_prenom?: string;
  prof_nom?: string;
}

interface StatCoursData {
  total: number;
  disciplines: string[];
}

interface EleveData {
  prochainCours: CoursData | null;
  derniereNote: NoteData | null;
  statCours: StatCoursData;
}

// ── NOUVEAU ───────────────────────────────────────────────────────────────────
interface CandidatureResume {
  id: string;
  statut: string;
  parcours: string;
  place_expire_at?: string | null;
}

interface Props {
  profile: ShellProfile;
  foyer: Foyer;
  eleves: ShellEleve[];
  fidelite: Fidelite[];
  eleveData: Record<string, EleveData>;
  candidature: CandidatureResume | null; // ← NOUVEAU
  candidaturesArrondies: number;
  initialNotifications: ShellNotification[];
  unreadDiscussions: number;
}

// ─── UTILS ───────────────────────────────────────────────────────────────────
function formatHeure(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" });
}

function formatDateCourt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-BE", {
    weekday: "long", day: "numeric", month: "long",
  });
}

function formatDateNote(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-BE", {
    day: "numeric", month: "long",
  });
}

function getDeltaHeures(dateStr: string): number {
  return (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60);
}

const DISCIPLINE_COLORS: Record<string, string> = {
  "Chant":   "bg-emerald-100 text-emerald-700",
  "Danse":   "bg-violet-100 text-violet-700",
  "Théâtre": "bg-amber-100 text-amber-700",
  "Studio":  "bg-cyan-100 text-cyan-700",
  "Scène":   "bg-orange-100 text-orange-700",
};
function getDisciplineColor(d: string) {
  return DISCIPLINE_COLORS[d] ?? "bg-[rgb(239,244,239)] text-[rgb(22,92,71)]";
}

// ─── STAT PREMIUM : cours effectués cette année ───────────────────────────────
function BlocStatPremium({ stat }: { stat: StatCoursData }) {
  if (stat.total === 0) return null;

  return (
    <Link
      href="/plateforme/dossier"
      className="rounded-[20px] border border-black/6 bg-white p-5 shadow-[0_2px_12px_rgba(16,16,16,0.04)] flex items-center gap-5 hover:border-[rgb(22,92,71)]/20 hover:shadow-[0_4px_16px_rgba(22,92,71,0.08)] transition-all group"
    >
      <div className="shrink-0 text-center">
        <p className="text-4xl font-bold text-[rgb(22,92,71)] leading-none tabular-nums">{stat.total}</p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35 mt-1">cours effectués</p>
      </div>

      <div className="w-px self-stretch bg-black/6 shrink-0" />

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-black/50 mb-2">Cette année scolaire</p>
        <div className="flex flex-wrap gap-1.5">
          {stat.disciplines.map(d => (
            <span key={d} className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${getDisciplineColor(d)}`}>
              {d}
            </span>
          ))}
        </div>
      </div>

      <span className="shrink-0 text-[rgb(22,92,71)] opacity-30 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-sm">→</span>
    </Link>
  );
}

// ─── STAT NON-PREMIUM : candidatures déposées ────────────────────────────────
function BlocStatNonPremium({ candidaturesArrondies }: { candidaturesArrondies: number }) {
  const label = candidaturesArrondies > 0
    ? `+${candidaturesArrondies} candidats déjà inscrits`
    : "Les premières candidatures arrivent";
  const sousTitre = candidaturesArrondies > 0
    ? "Les places sont limitées à 15 élèves par groupe."
    : "Sois parmi les premiers à déposer ta candidature.";

  return (
    <Link
      href="/candidature"
      className="rounded-[20px] border border-[rgb(22,92,71)]/15 bg-[rgb(239,244,239)] p-5 flex items-center gap-5 hover:border-[rgb(22,92,71)]/30 hover:bg-[rgb(229,240,234)] transition-all group"
    >
      <div className="shrink-0 text-center min-w-[56px]">
        {candidaturesArrondies > 0 ? (
          <>
            <p className="text-4xl font-bold text-[rgb(22,92,71)] leading-none tabular-nums">+{candidaturesArrondies}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[rgb(22,92,71)]/50 mt-1">candidats</p>
          </>
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-[rgb(22,92,71)]/10 text-2xl">✦</div>
        )}
      </div>

      <div className="w-px self-stretch bg-[rgb(22,92,71)]/12 shrink-0" />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[rgb(22,92,71)] leading-snug">{label}</p>
        <p className="text-xs text-[rgb(22,92,71)]/55 mt-1 leading-5">{sousTitre}</p>
        <p className="mt-2.5 text-xs font-semibold text-[rgb(22,92,71)] group-hover:underline">Déposer ma candidature →</p>
      </div>
    </Link>
  );
}

// ─── BLOC STATUT CANDIDATURE (NOUVEAU) ───────────────────────────────────────
function BlocStatutCandidature({ candidature, candidaturesArrondies }: {
  candidature: CandidatureResume | null;
  candidaturesArrondies: number;
}) {
  if (!candidature) {
    return <BlocStatNonPremium candidaturesArrondies={candidaturesArrondies} />;
  }

  const PARCOURS_LABELS: Record<string, string> = {
    "full-artist": "Full Artist",
    "comedie-musicale": "Comédie Musicale",
    "eveil-musical": "Éveil Musical",
  };
  const parcoursLabel = PARCOURS_LABELS[candidature.parcours] ?? candidature.parcours;

  let joursRestants: number | null = null;
  if (candidature.statut === "place_proposee" && candidature.place_expire_at) {
    const diff = new Date(candidature.place_expire_at).getTime() - Date.now();
    joursRestants = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  type Config = {
    bg: string; border: string; icon: string;
    titre: string; message: string;
    cta?: string; ctaHref?: string; urgent?: boolean;
  };

  const configs: Record<string, Config> = {
    en_attente: {
      bg: "bg-amber-50", border: "border-amber-200", icon: "⏳",
      titre: "Dossier en cours d'examen",
      message: `Ta candidature pour le parcours ${parcoursLabel} est en cours de lecture. Tu recevras une réponse dans la semaine.`,
    },
    info_complementaire: {
      bg: "bg-purple-50", border: "border-purple-200", icon: "📬",
      titre: "Action requise — vérifie tes emails",
      message: "La direction t'a contacté pour des informations complémentaires. Réponds directement à l'email reçu.",
      urgent: true,
    },
    validee: {
      bg: "bg-green-50", border: "border-green-200", icon: "✅",
      titre: "Profil validé — en attente d'une place",
      message: `Ton profil pour le parcours ${parcoursLabel} a été retenu ! On t'informera dès qu'une place est disponible.`,
    },
    acceptee: {
      bg: "bg-green-50", border: "border-green-200", icon: "✅",
      titre: "Profil validé — en attente d'une place",
      message: `Ton profil pour le parcours ${parcoursLabel} a été retenu ! On t'informera dès qu'une place est disponible.`,
    },
    liste_attente: {
      bg: "bg-blue-50", border: "border-blue-200", icon: "🕐",
      titre: "Tu es sur liste d'attente",
      message: `Tu es sur liste d'attente pour le parcours ${parcoursLabel}. On te prévient dès qu'une place se libère.`,
    },
    place_proposee: {
      bg: "bg-red-50", border: "border-red-300", icon: "🔥",
      titre: joursRestants !== null && joursRestants <= 1
        ? "⚠️ Dernière chance — place disponible !"
        : "Une place t'est proposée !",
      message: joursRestants !== null
        ? `Il te reste ${joursRestants === 0 ? "moins d'un jour" : `${joursRestants} jour${joursRestants > 1 ? "s" : ""}`} pour confirmer ta place dans le parcours ${parcoursLabel}. Après ce délai, la place sera proposée à quelqu'un d'autre.`
        : `Une place est disponible pour toi dans le parcours ${parcoursLabel}. Confirme vite !`,
      cta: "Confirmer ma place →",
      ctaHref: "/plateforme/inscription",
      urgent: true,
    },
    refusee: {
      bg: "bg-gray-50", border: "border-gray-200", icon: "—",
      titre: "Candidature non retenue",
      message: "Ta candidature n'a pas été retenue pour cette session. Tu peux repostuler lors d'une prochaine ouverture.",
      cta: "Repostuler →",
      ctaHref: "/candidature",
    },
  };

  const config = configs[candidature.statut];
  if (!config) return <BlocStatNonPremium candidaturesArrondies={candidaturesArrondies} />;

  return (
    <div className={`rounded-[20px] border ${config.border} ${config.bg} p-5 ${config.urgent ? "shadow-[0_0_0_3px_rgba(239,68,68,0.12)]" : ""}`}>
      <div className="flex items-start gap-4">
        <div className="text-2xl shrink-0 mt-0.5">{config.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-black leading-snug">{config.titre}</p>
          <p className="text-xs text-black/60 mt-1.5 leading-5">{config.message}</p>

          {candidature.statut === "place_proposee" && joursRestants !== null && (
            <div className="mt-3">
              <div className="h-1.5 w-full rounded-full bg-red-200 overflow-hidden">
                <div className="h-full rounded-full bg-red-500 transition-all"
                  style={{ width: `${Math.min(100, (joursRestants / 5) * 100)}%` }} />
              </div>
              <p className="text-[10px] text-red-600 font-semibold mt-1">
                {joursRestants === 0 ? "Expire aujourd'hui" : `${joursRestants}j restants`}
              </p>
            </div>
          )}

          {config.cta && config.ctaHref && (
            <Link href={config.ctaHref}
              className={`mt-3 inline-flex items-center text-xs font-bold px-4 py-2 rounded-full transition ${
                config.urgent
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-[rgb(22,92,71)] text-white hover:bg-[rgb(18,75,58)]"
              }`}>
              {config.cta}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PROCHAIN COURS — 4 états ─────────────────────────────────────────────────
function BlocProchainCours({ cours, isPremium }: { cours: CoursData | null; isPremium: boolean }) {
  if (!isPremium) {
    return (
      <div className="rounded-[20px] border border-black/6 bg-white p-5 shadow-[0_2px_12px_rgba(16,16,16,0.04)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.20em] text-black/30 mb-4">Prochain cours</p>
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-black/4 text-xl">🎓</div>
          <div>
            <p className="text-sm font-semibold text-black">Aucun parcours actif</p>
            <p className="text-xs text-black/40 mt-0.5">Inscris-toi à un parcours pour voir ton planning ici.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!cours) {
    return (
      <div className="rounded-[20px] border border-black/6 bg-white p-5 shadow-[0_2px_12px_rgba(16,16,16,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.20em] text-black/30">Prochain cours</p>
          <Link href="/plateforme/planning" className="text-xs text-[rgb(22,92,71)] font-medium hover:underline">Voir le planning →</Link>
        </div>
        <div className="flex items-center gap-4">
          <CalendarDays size={22} className="text-[rgb(22,92,71)]" />
          <div>
            <p className="text-sm font-semibold text-black">Planning en cours de préparation</p>
            <p className="text-xs text-black/40 mt-0.5">Tu seras notifié dès que les cours sont planifiés.</p>
          </div>
        </div>
      </div>
    );
  }

  const delta = getDeltaHeures(cours.date_heure_debut);
  const isAujourdhui = delta <= 24 && delta >= 0;
  const isUrgent = delta <= 48 && delta > 24;

  if (isAujourdhui) {
    return (
      <div className="rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(22,92,71,0.15)]">
        <div className="bg-[rgb(22,92,71)] px-5 pt-5 pb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">● Aujourd'hui</span>
            <Link href="/plateforme/planning" className="text-xs text-white/60 hover:text-white transition">Voir le planning →</Link>
          </div>
          <p className="text-xl font-bold text-white mb-1">{cours.discipline}</p>
          <p className="text-sm text-white/70">
            {formatHeure(cours.date_heure_debut)} → {formatHeure(cours.date_heure_fin)}
            {cours.salle && <span className="ml-2 opacity-60">· {cours.salle}</span>}
          </p>
        </div>
        <div className="bg-[rgb(18,75,58)] px-5 py-3 flex items-center gap-3">
          <span className="text-sm text-white/60">Avec</span>
          <span className="text-sm font-semibold text-white">{cours.prof_prenom} {cours.prof_nom}</span>
          {cours.parcours_nom && (<><span className="text-white/30">·</span><span className="text-xs text-white/50">{cours.parcours_nom}</span></>)}
        </div>
      </div>
    );
  }

  if (isUrgent) {
    return (
      <div className="rounded-[20px] border border-[rgb(185,151,83)]/30 bg-[rgb(185,151,83)]/6 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.20em] text-[rgb(185,151,83)]">Prochain cours</span>
            <span className="rounded-full bg-[rgb(185,151,83)]/15 px-2 py-0.5 text-[10px] font-bold text-[rgb(185,151,83)]">Demain</span>
          </div>
          <Link href="/plateforme/planning" className="text-xs text-[rgb(22,92,71)] font-medium hover:underline">Planning →</Link>
        </div>
        <div className="flex items-center gap-4">
          <Clock size={22} className="text-[rgb(22,92,71)]" />
          <div>
            <p className="text-sm font-bold text-black">{cours.discipline}</p>
            <p className="text-xs text-black/55 mt-0.5">{formatDateCourt(cours.date_heure_debut)} · {formatHeure(cours.date_heure_debut)}–{formatHeure(cours.date_heure_fin)}</p>
            {cours.prof_prenom && <p className="text-xs text-black/35 mt-0.5">avec {cours.prof_prenom} {cours.prof_nom}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] border border-black/6 bg-white p-5 shadow-[0_2px_12px_rgba(16,16,16,0.04)]">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.20em] text-black/30">Prochain cours</p>
        <Link href="/plateforme/planning" className="text-xs text-[rgb(22,92,71)] font-medium hover:underline">Voir le planning →</Link>
      </div>
      <div className="flex items-center gap-4">
        <CalendarDays size={22} className="text-[rgb(22,92,71)]" />
        <div>
          <p className="text-sm font-semibold text-black">{cours.discipline}</p>
          <p className="text-xs text-black/55 mt-0.5 capitalize">{formatDateCourt(cours.date_heure_debut)} · {formatHeure(cours.date_heure_debut)}–{formatHeure(cours.date_heure_fin)}</p>
          {cours.prof_prenom && <p className="text-xs text-black/35 mt-0.5">avec {cours.prof_prenom} {cours.prof_nom}</p>}
        </div>
      </div>
    </div>
  );
}

// ─── CARTE FIDÉLITÉ ───────────────────────────────────────────────────────────
function CarteFidelite({ carte, label, icon }: { carte: Fidelite | undefined; label: string; icon: string }) {
  const compteur = carte?.compteur ?? 0;
  const total = 10;
  const isFull = compteur >= total;

  return (
    <Link
      href="/plateforme/dossier?tab=fidelite"
      className="rounded-[20px] border bg-white p-5 flex flex-col transition-all hover:shadow-[0_4px_20px_rgba(22,92,71,0.10)] hover:border-[rgb(22,92,71)]/25 hover:-translate-y-0.5 duration-200"
      style={{ borderColor: isFull ? "rgb(185,151,83)" : "rgba(0,0,0,0.06)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/35">Fidélité</p>
          <p className="mt-0.5 text-sm font-semibold text-black">{label}</p>
        </div>
        <span className={`text-lg ${isFull ? "text-[rgb(185,151,83)]" : "text-[rgb(22,92,71)]"}`}>{icon}</span>
      </div>

      <div className="grid grid-cols-5 gap-1.5 mb-3">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={`h-8 rounded-[8px] flex items-center justify-center text-xs font-bold transition-all ${
            i < compteur
              ? isFull ? "bg-[rgb(185,151,83)] text-white shadow-[0_2px_6px_rgba(185,151,83,0.35)]" : "bg-[rgb(22,92,71)] text-white shadow-[0_2px_6px_rgba(22,92,71,0.25)]"
              : "bg-black/4 text-black/15"
          }`}>
            {i < compteur ? "★" : "·"}
          </div>
        ))}
      </div>

      <div className="h-1.5 rounded-full bg-black/6 mb-3 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${isFull ? "bg-[rgb(185,151,83)]" : "bg-[rgb(22,92,71)]"}`} style={{ width: `${Math.min((compteur / total) * 100, 100)}%` }} />
      </div>

      {isFull ? (
        <div className="rounded-[10px] bg-[rgb(185,151,83)]/10 border border-[rgb(185,151,83)]/25 px-3 py-2 text-center">
          <p className="text-xs font-bold text-[rgb(185,151,83)]">🎉 Séance gratuite disponible !</p>
        </div>
      ) : (
        <p className="text-xs font-medium text-black/40 text-center">{total - compteur} séance{total - compteur > 1 ? "s" : ""} avant la gratuite</p>
      )}
    </Link>
  );
}

// ─── DERNIÈRE NOTE ────────────────────────────────────────────────────────────
function BlocDerniereNote({ note }: { note: NoteData | null }) {
  return (
    <div className="rounded-[20px] border border-black/6 bg-white p-5 shadow-[0_2px_12px_rgba(16,16,16,0.04)]">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.20em] text-black/30">Dernière note de prof</p>
        <Link href="/plateforme/dossier" className="text-xs text-[rgb(22,92,71)] font-medium hover:underline">Voir tout →</Link>
      </div>
      {!note ? (
        <div className="flex items-center gap-4">
          <BookOpen size={22} className="text-[rgb(22,92,71)]" />
          <div>
            <p className="text-sm font-semibold text-black">Aucune note pour le moment</p>
            <p className="text-xs text-black/40 mt-0.5">Les notes apparaîtront ici après chaque cours.</p>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {note.prof_prenom && <span className="text-xs font-semibold text-black">{note.prof_prenom} {note.prof_nom}</span>}
            {note.cours_discipline && (<><span className="text-black/20">·</span><span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgb(22,92,71)]">{note.cours_discipline}</span></>)}
            <span className="text-black/20">·</span>
            <span className="text-[10px] text-black/35">{formatDateNote(note.created_at)}</span>
          </div>
          <div className="rounded-[12px] bg-[rgb(247,249,247)] px-4 py-3 border-l-2 border-[rgb(22,92,71)]/30">
            <p className="text-sm text-black/70 leading-6 line-clamp-3">{note.contenu}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── INCENTIVE CANDIDATURE ────────────────────────────────────────────────────
function BlocIncentive() {
  return (
    <div className="rounded-[20px] overflow-hidden border border-black/6 shadow-[0_2px_12px_rgba(16,16,16,0.04)]">
      <div className="grid grid-cols-2 h-44 sm:h-52">
        <div className="relative overflow-hidden">
          <Image src="/programmes/full-artist.jpg" alt="Full Artist" fill unoptimized className="object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-3 left-3">
            <span className="rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">Full Artist</span>
          </div>
        </div>
        <div className="relative overflow-hidden border-l border-white/10">
          <Image src="/programmes/comedie-musicale.jpg" alt="Comédie Musicale" fill unoptimized className="object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-3 left-3">
            <span className="rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">Comédie Musicale</span>
          </div>
        </div>
      </div>
      <div className="bg-[rgb(22,92,71)] px-5 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgb(185,151,83)] mb-1">Prochaine édition — 2028</p>
            <p className="text-sm font-semibold text-white">Ta place chez Crea'Star t'attend.</p>
            <p className="text-xs text-white/55 mt-0.5 leading-5">Dépose ta candidature maintenant pour être contacté en priorité.</p>
          </div>
          <Link href="/candidature" className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[rgb(185,151,83)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[rgb(165,131,63)]">
            Déposer ma candidature →
          </Link>
        </div>
      </div>
    </div>
  );
}

function BlocServices() {
  return (
    <Link
      href="/inscriptions"
      className="relative rounded-[20px] overflow-hidden h-20 group block"
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgb(22,92,71)_0%,rgb(12,50,38)_40%,rgb(185,151,83)_100%)]" />
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,white,transparent_60%)]" />
      <div className="absolute inset-0 p-5 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.20em] text-white/60 mb-1">
            Réserve un créneau
          </p>
          <p className="text-base font-bold text-white leading-tight">
            Cours individuels & location de salles
          </p>
        </div>
        <span className="shrink-0 ml-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white text-sm transition group-hover:bg-white/25 group-hover:translate-x-0.5 duration-200">
          →
        </span>
      </div>
    </Link>
  );
}

// ─── DASHBOARD PRINCIPAL ──────────────────────────────────────────────────────
export default function DashboardClient({
  profile, foyer, eleves, fidelite, eleveData, candidature, candidaturesArrondies,
  initialNotifications, unreadDiscussions,
}: Props) {
  const [activeEleveId, setActiveEleveId] = useState<string>(eleves[0]?.id ?? "");
  const activeEleve = eleves.find(e => e.id === activeEleveId) ?? eleves[0];
  const isPremium = activeEleve?.statut_premium ?? false;
  const activeData = eleveData[activeEleveId] ?? { prochainCours: null, derniereNote: null, statCours: { total: 0, disciplines: [] } };
  const carteCours = fidelite.find(f => f.type_carte === "cours_individuels");
  const carteLocation = fidelite.find(f => f.type_carte === "location_salles");

  return (
    <PlatformShell profile={profile} eleves={eleves} initialNotifications={initialNotifications} unreadDiscussions={unreadDiscussions}>
      <div className="space-y-5">

        {/* ── 1. BARRE CONTEXTE ── */}
        <div className="rounded-[20px] border border-black/6 bg-white px-5 py-4 shadow-[0_2px_12px_rgba(16,16,16,0.04)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.20em] text-black/30">Foyer {foyer?.nom_famille}</p>
              <p className="mt-0.5 text-base font-semibold text-black">Bonjour{profile?.prenom ? `, ${profile.prenom}` : ""} 👋</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {eleves.length > 1 && eleves.map(e => (
                <button key={e.id} onClick={() => setActiveEleveId(e.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${activeEleveId === e.id ? "bg-[rgb(22,92,71)] text-white" : "border border-black/10 text-black/50 hover:border-[rgb(22,92,71)]/30"}`}>
                  {e.prenom}
                </button>
              ))}
              <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${isPremium ? "bg-[rgb(22,92,71)] text-white" : "bg-black/6 text-black/40"}`}>
                {isPremium ? "★ Premium" : "Sans parcours"}
              </span>
            </div>
          </div>
        </div>

        {/* ── 2. INCENTIVE VISUELLE (non premium) ── */}
        {!isPremium && <BlocIncentive />}

        {/* ── 3. STAT / STATUT CANDIDATURE ── */}
        {isPremium
          ? <BlocStatPremium stat={activeData.statCours} />
          : <BlocStatutCandidature candidature={candidature} candidaturesArrondies={candidaturesArrondies} />
        }

        {/* ── 4. PROCHAIN COURS ── */}
        <BlocProchainCours cours={activeData.prochainCours} isPremium={isPremium} />

        {/* ── 5. FIDÉLITÉ ── */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.20em] text-black/30 mb-3">Mes cartes fidélité</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CarteFidelite carte={carteCours} label="Cours individuels" icon="★" />
            <CarteFidelite carte={carteLocation} label="Location de salles" icon="★" />
          </div>
        </div>

        <BlocServices />

        {/* ── 6. DERNIÈRE NOTE (premium) ── */}
        {isPremium && <BlocDerniereNote note={activeData.derniereNote} />}

      </div>
    </PlatformShell>
  );
}