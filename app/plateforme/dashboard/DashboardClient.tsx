// // ── EXPORT PAR DÉFAUT ─────────────────────────────────────────────────────────
// export default BlocStatutCandidature;

// app/plateforme/dashboard/DashboardClient.tsx
// FIX : statut "acceptee" supprimé — seul "validee" subsiste
"use client";

import Link from "next/link";
import {
  CalendarDays, Users, Star, FolderOpen, UserCircle, MessageSquare,
} from "lucide-react";

// ── TYPES ─────────────────────────────────────────────────────────────────────
interface CandidatureResume {
  id: string;
  parcours: string;
  statut: string;
  place_expire_at?: string | null;
}

interface Profile {
  prenom?: string | null;
  nom?: string | null;
}

// ── BLOC SANS CANDIDATURE ─────────────────────────────────────────────────────
function BlocStatNonPremium({ candidaturesArrondies }: { candidaturesArrondies: number }) {
  const label =
    candidaturesArrondies > 0
      ? `+${candidaturesArrondies} candidats nous ont déjà fait confiance`
      : "Rejoins la prochaine promotion";

  const sousTitre =
    candidaturesArrondies > 0
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
            <p className="text-4xl font-bold text-[rgb(22,92,71)] leading-none tabular-nums">
              +{candidaturesArrondies}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[rgb(22,92,71)]/50 mt-1">
              candidats
            </p>
          </>
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-[rgb(22,92,71)]/10 text-2xl">
            ✦
          </div>
        )}
      </div>

      <div className="w-px self-stretch bg-[rgb(22,92,71)]/12 shrink-0" />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[rgb(22,92,71)] leading-snug">{label}</p>
        <p className="text-xs text-[rgb(22,92,71)]/55 mt-1 leading-5">{sousTitre}</p>
        <p className="mt-2.5 text-xs font-semibold text-[rgb(22,92,71)] group-hover:underline">
          Déposer ma candidature →
        </p>
      </div>
    </Link>
  );
}

// ── BLOC STATUT CANDIDATURE ───────────────────────────────────────────────────
function BlocStatutCandidature({
  candidature,
  candidaturesArrondies,
}: {
  candidature: CandidatureResume | null;
  candidaturesArrondies: number;
}) {
  if (!candidature) {
    return <BlocStatNonPremium candidaturesArrondies={candidaturesArrondies} />;
  }

  const PARCOURS_LABELS: Record<string, string> = {
    "full-artist":      "Full Artist",
    "comedie-musicale": "Comédie Musicale",
    "eveil-musical":    "Éveil Musical",
  };
  const parcoursLabel = PARCOURS_LABELS[candidature.parcours] ?? candidature.parcours;

  let joursRestants: number | null = null;
  if (candidature.statut === "place_proposee" && candidature.place_expire_at) {
    const diff = new Date(candidature.place_expire_at).getTime() - Date.now();
    joursRestants = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  type Config = {
    bg: string;
    border: string;
    icon: string;
    titre: string;
    message: string;
    cta?: string;
    ctaHref?: string;
    urgent?: boolean;
  };

  // ── FIX : "acceptee" supprimé — "validee" est l'unique statut de validation ─
  const configs: Record<string, Config> = {
    en_attente: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      icon: "⏳",
      titre: "Dossier en cours d'examen",
      message: `Ta candidature pour le parcours ${parcoursLabel} est en cours de lecture. Tu recevras une réponse dans la semaine.`,
    },
    info_complementaire: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      icon: "📬",
      titre: "Action requise — vérifie tes emails",
      message:
        "La direction t'a contacté pour des informations complémentaires. Réponds directement à l'email reçu.",
      urgent: true,
    },
    validee: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: "✅",
      titre: "Profil validé — en attente d'une place",
      message: `Ton profil pour le parcours ${parcoursLabel} a été retenu ! On t'informera dès qu'une place est disponible.`,
    },
    liste_attente: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "🕐",
      titre: "Tu es sur liste d'attente",
      message: `Tu es sur liste d'attente pour le parcours ${parcoursLabel}. On te prévient dès qu'une place se libère.`,
    },
    place_proposee: {
      bg: "bg-red-50",
      border: "border-red-300",
      icon: "🔥",
      titre:
        joursRestants !== null && joursRestants <= 1
          ? "⚠️ Dernière chance — place disponible !"
          : "Une place t'est proposée !",
      message:
        joursRestants !== null
          ? `Il te reste ${
              joursRestants === 0
                ? "moins d'un jour"
                : `${joursRestants} jour${joursRestants > 1 ? "s" : ""}`
            } pour confirmer ta place dans le parcours ${parcoursLabel}. Après ce délai, la place sera proposée à quelqu'un d'autre.`
          : `Une place est disponible pour toi dans le parcours ${parcoursLabel}. Confirme vite !`,
      cta: "Confirmer ma place →",
      ctaHref: "/plateforme/inscription",
      urgent: true,
    },
    refusee: {
      bg: "bg-gray-50",
      border: "border-gray-200",
      icon: "—",
      titre: "Candidature non retenue",
      message:
        "Ta candidature n'a pas été retenue pour cette session. Tu peux repostuler lors d'une prochaine ouverture.",
      cta: "Repostuler →",
      ctaHref: "/candidature",
    },
  };

  const config = configs[candidature.statut];
  if (!config) return <BlocStatNonPremium candidaturesArrondies={candidaturesArrondies} />;

  return (
    <div
      className={`rounded-[20px] border ${config.border} ${config.bg} p-5 ${
        config.urgent ? "shadow-[0_0_0_3px_rgba(239,68,68,0.12)]" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="text-2xl shrink-0 mt-0.5">{config.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-black leading-snug">{config.titre}</p>
          <p className="text-xs text-black/60 mt-1.5 leading-5">{config.message}</p>

          {candidature.statut === "place_proposee" && joursRestants !== null && (
            <div className="mt-3">
              <div className="h-1.5 w-full rounded-full bg-red-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-red-500 transition-all"
                  style={{ width: `${Math.min(100, (joursRestants / 5) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-red-600 font-semibold mt-1">
                {joursRestants === 0 ? "Expire aujourd'hui" : `${joursRestants}j restants`}
              </p>
            </div>
          )}

          {config.cta && config.ctaHref && (
            <Link
              href={config.ctaHref}
              className={`mt-3 inline-flex items-center text-xs font-bold px-4 py-2 rounded-full transition ${
                config.urgent
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-[rgb(22,92,71)] text-white hover:bg-[rgb(18,76,58)]"
              }`}
            >
              {config.cta}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ── SECTION LABEL ──────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] font-bold uppercase tracking-[0.25em] mb-3" style={{ color: "rgba(0,0,0,0.3)" }}>
      {children}
    </p>
  );
}

function formatDateCourt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-BE", { day: "numeric", month: "short" });
}

// ── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function DashboardClient({
  profile, nbEleves, nbPremium, prochaineSeance, candidature, candidaturesArrondies,
}: {
  profile: Profile | null;
  nbEleves: number;
  nbPremium: number;
  prochaineSeance: string | null;
  candidature: CandidatureResume | null;
  candidaturesArrondies: number;
}) {
  const heure = new Date().getHours();
  const salutation = heure < 12 ? "Bonjour" : heure < 18 ? "Bon après-midi" : "Bonsoir";
  const todayFull = new Date().toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="min-h-screen" style={{ background: "rgb(239,244,239)" }}>

      {/* ══ HERO ═════════════════════════════════════════════════════════════ */}
      <div className="px-10 lg:px-14"
        style={{
          paddingTop: "calc(96px + 0px)",
          minHeight: "280px",
          background: "linear-gradient(135deg, rgb(8,20,14) 0%, rgb(12,40,28) 60%, rgb(18,55,38) 100%)",
        }}>
        <div className="relative flex items-end justify-between py-8 gap-6">

          {/* Pattern géométrique décoratif */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full opacity-10"
              style={{ background: "radial-gradient(circle, rgb(185,151,83) 0%, transparent 70%)" }} />
            <div className="absolute right-40 bottom-0 w-48 h-48 rounded-full opacity-5"
              style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />
          </div>

          <div className="flex-1 min-w-0 mt-10">
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(185,151,83,0.7)", marginBottom: 8 }}>
              {todayFull}
            </p>
            <h1 style={{ fontSize: 32, fontWeight: 600, color: "white", margin: "0 0 4px", lineHeight: 1.2 }}>
              {salutation}{profile?.prenom ? `, ${profile.prenom}` : ""} 👋
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: "0 0 28px" }}>
              Espace élève · {nbEleves} élève{nbEleves > 1 ? "s" : ""} dans le foyer
            </p>

            {/* Stats clés */}
            <div className="flex items-end gap-10 flex-wrap">
              {[
                { value: nbEleves, label: nbEleves > 1 ? "élèves" : "élève", icon: <Users size={13} /> },
                { value: nbPremium, label: "en parcours premium", icon: <Star size={13} /> },
                { value: prochaineSeance ? formatDateCourt(prochaineSeance) : "—", label: "prochaine séance", icon: <CalendarDays size={13} /> },
              ].map(s => (
                <div key={s.label} className="flex flex-col">
                  <div className="flex items-center gap-1.5 mb-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {s.icon}
                    <span className="text-[10px] uppercase tracking-[0.18em]">{s.label}</span>
                  </div>
                  <span className="text-3xl font-semibold text-white leading-none">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ GRILLE PRINCIPALE ════════════════════════════════════════════════ */}
      <div className="flex-1 px-10 lg:px-14 py-6 space-y-6">

        {/* Statut candidature */}
        <section>
          <SectionLabel>Ma candidature</SectionLabel>
          <BlocStatutCandidature candidature={candidature} candidaturesArrondies={candidaturesArrondies} />
        </section>

        {/* Modules */}
        <section>
          <SectionLabel>Espace élève</SectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: "/plateforme/dossier", icon: <FolderOpen size={20} />, label: "Dossier", sub: "Notes & progression" },
              { href: "/plateforme/planning", icon: <CalendarDays size={20} />, label: "Planning", sub: "Tes cours à venir" },
              { href: "/plateforme/mon-compte", icon: <UserCircle size={20} />, label: "Mon compte", sub: "Foyer & élèves" },
              { href: "/plateforme/messages", icon: <MessageSquare size={20} />, label: "Messages", sub: "Profs & direction" },
            ].map(m => (
              <Link key={m.href} href={m.href}
                className="group rounded-[18px] border border-black/6 bg-white p-5 flex flex-col gap-3 transition-all hover:-translate-y-px hover:shadow-md"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center"
                  style={{ background: "rgb(239,244,239)", color: "rgb(22,92,71)" }}>
                  {m.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-black group-hover:text-[rgb(22,92,71)] transition-colors">{m.label}</p>
                  <p className="text-xs text-black/40 mt-0.5 leading-4">{m.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}