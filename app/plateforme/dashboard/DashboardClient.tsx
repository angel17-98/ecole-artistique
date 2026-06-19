// app/plateforme/dashboard/DashboardClient.tsx
// FIX : statut "acceptee" supprimé — seul "validee" subsiste
"use client";

import Link from "next/link";

// ── TYPES ─────────────────────────────────────────────────────────────────────
interface CandidatureResume {
  id: string;
  parcours: string;
  statut: string;
  place_expire_at?: string | null;
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

// ── EXPORT PAR DÉFAUT ─────────────────────────────────────────────────────────
export default BlocStatutCandidature;