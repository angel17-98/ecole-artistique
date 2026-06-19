"use client";
// app/plateforme/inscription/CandidatureTracker.tsx
// Barre de progression du statut de candidature
// Utilisé dans la page inscription (version complète) et dashboard (version compacte)

import Link from "next/link";

type Statut =
  | "en_attente"
  | "info_complementaire"
  | "validee"
  | "liste_attente"
  | "place_proposee"
  | "inscrit"
  | "refusee"
  | "sans_reponse"
  | "expiree";

interface CandidatureTrackerProps {
  candidature: {
    id: string;
    prenom: string;
    nom: string;
    parcours: string;
    statut: Statut;
    place_expire_at?: string | null;
    place_proposee_at?: string | null;
    created_at: string;
  };
  compact?: boolean; // version dashboard = true
}

const PARCOURS_LABELS: Record<string, string> = {
  "full-artist": "Full Artist",
  "comedie-musicale": "Comédie musicale",
  "eveil-musical": "Éveil musical",
};

const ETAPES = [
  { id: "envoyee",       label: "Candidature\nenvoyée",       statuts: ["en_attente", "info_complementaire"] },
  { id: "examen",        label: "En cours\nd'examen",         statuts: ["en_attente"] },
  { id: "validee",       label: "Profil\nvalidé",             statuts: ["validee", "liste_attente"] },
  { id: "place",         label: "Place\nproposée",            statuts: ["place_proposee"] },
  { id: "inscrit",       label: "Inscrit·e",                  statuts: ["inscrit"] },
];

function getEtapeActive(statut: Statut): number {
  switch (statut) {
    case "en_attente":
    case "info_complementaire":
      return 1;
    case "validee":
      return 2;
    case "liste_attente":
      return 2;
    case "place_proposee":
      return 3;
    case "inscrit":
      return 4;
    default:
      return 0;
  }
}

function getStatutMessage(statut: Statut, parcours: string, expireAt?: string | null) {
  const parcoursLabel = PARCOURS_LABELS[parcours] ?? parcours;

  switch (statut) {
    case "en_attente":
      return {
        bg: "bg-amber-50",
        border: "border-amber-200",
        icon: "⏳",
        titre: "Dossier en cours d'examen",
        texte: `Ta candidature pour le parcours ${parcoursLabel} est en cours d'examen. Tu recevras une réponse dans la semaine.`,
        urgent: false,
      };
    case "info_complementaire":
      return {
        bg: "bg-purple-50",
        border: "border-purple-200",
        icon: "📬",
        titre: "Action requise — vérifie tes emails",
        texte: "La direction t'a contacté pour des informations complémentaires. Réponds directement à l'email reçu.",
        urgent: true,
      };
    case "validee":
      return {
        bg: "bg-green-50",
        border: "border-green-200",
        icon: "✅",
        titre: "Profil retenu — en attente d'une place",
        texte: `Ton profil pour le parcours ${parcoursLabel} a été retenu ! On t'informera dès qu'une place est disponible.`,
        urgent: false,
      };
    case "liste_attente":
      return {
        bg: "bg-blue-50",
        border: "border-blue-200",
        icon: "🕐",
        titre: "Sur liste d'attente",
        texte: `Tu es sur liste d'attente pour le parcours ${parcoursLabel}. On te prévient dès qu'une place se libère.`,
        urgent: false,
      };
    case "place_proposee": {
      const joursRestants = expireAt
        ? Math.max(0, Math.ceil((new Date(expireAt).getTime() - Date.now()) / 86400000))
        : null;
      const urgent = joursRestants !== null && joursRestants <= 2;
      return {
        bg: urgent ? "bg-red-50" : "bg-emerald-50",
        border: urgent ? "border-red-300" : "border-emerald-300",
        icon: urgent ? "🔥" : "🎉",
        titre: urgent ? "⚠️ Dernière chance !" : "Une place t'est proposée !",
        texte: joursRestants !== null
          ? `Il te reste ${joursRestants === 0 ? "moins d'un jour" : `${joursRestants} jour${joursRestants > 1 ? "s" : ""}`} pour confirmer ta place dans le parcours ${parcoursLabel}.`
          : `Une place est disponible pour toi dans le parcours ${parcoursLabel}. Confirme vite !`,
        urgent,
        cta: { label: "Confirmer ma place →", href: "/plateforme/inscription?onglet=parcours" },
      };
    }
    case "inscrit":
      return {
        bg: "bg-green-50",
        border: "border-green-200",
        icon: "🎓",
        titre: `Inscrit·e en ${parcoursLabel}`,
        texte: "Bienvenue chez Crea'Star ! Tu es officiellement inscrit·e. Les détails de ton groupe te seront communiqués prochainement.",
        urgent: false,
      };
    default:
      return null;
  }
}

export default function CandidatureTracker({ candidature, compact = false }: CandidatureTrackerProps) {
  const etapeActive = getEtapeActive(candidature.statut);
  const message = getStatutMessage(candidature.statut, candidature.parcours, candidature.place_expire_at);
  const parcoursLabel = PARCOURS_LABELS[candidature.parcours] ?? candidature.parcours;

  if (!message) return null;

  if (compact) {
    // ── VERSION COMPACTE pour le dashboard ──────────────────────────────────
    return (
      <div className={`rounded-[16px] border p-4 ${message.bg} ${message.border}`}>
        <div className="flex items-start gap-3">
          <span className="text-xl leading-none mt-0.5">{message.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-black">{message.titre}</p>
            <p className="text-xs leading-5 text-black/60 mt-1">{message.texte}</p>
            {(message as any).cta && (
              <Link
                href={(message as any).cta.href}
                className="inline-flex items-center mt-2 text-xs font-semibold text-white rounded-full px-4 py-1.5 transition hover:brightness-110"
                style={{ background: "rgb(22,92,71)" }}
              >
                {(message as any).cta.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── VERSION COMPLÈTE pour la page inscription ────────────────────────────
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/40 mb-1">
          Ta candidature
        </p>
        <h2 className="text-xl font-semibold tracking-tight text-black">
          Parcours <span style={{ color: "rgb(22,92,71)" }}>{parcoursLabel}</span>
        </h2>
      </div>

      {/* Barre de progression */}
      <div className="relative">
        {/* Ligne de progression */}
        <div className="absolute top-3.5 left-0 right-0 h-px bg-black/8" />
        <div
          className="absolute top-3.5 left-0 h-px transition-all duration-700"
          style={{
            background: "rgb(22,92,71)",
            width: `${(etapeActive / (ETAPES.length - 1)) * 100}%`,
          }}
        />

        {/* Points d'étape */}
        <div className="relative flex justify-between">
          {ETAPES.map((etape, i) => {
            const done = i < etapeActive;
            const active = i === etapeActive;
            return (
              <div key={etape.id} className="flex flex-col items-center gap-2" style={{ width: `${100 / ETAPES.length}%` }}>
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10"
                  style={{
                    background: done || active ? "rgb(22,92,71)" : "white",
                    borderColor: done || active ? "rgb(22,92,71)" : "rgba(0,0,0,0.12)",
                  }}
                >
                  {done ? (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : active ? (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-black/12" />
                  )}
                </div>
                <p
                  className="text-center text-[10px] leading-[1.3] font-medium whitespace-pre-line"
                  style={{ color: done || active ? "rgb(22,92,71)" : "rgba(0,0,0,0.35)" }}
                >
                  {etape.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Message contextuel */}
      <div className={`rounded-[16px] border p-4 sm:p-5 ${message.bg} ${message.border}`}>
        <div className="flex items-start gap-3">
          <span className="text-2xl leading-none">{message.icon}</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-black mb-1">{message.titre}</p>
            <p className="text-sm leading-6 text-black/65">{message.texte}</p>
            {(message as any).cta && (
              <Link
                href={(message as any).cta.href}
                className="inline-flex items-center mt-3 text-sm font-semibold text-white rounded-full px-5 py-2.5 transition hover:brightness-110"
                style={{ background: "rgb(22,92,71)" }}
              >
                {(message as any).cta.label}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Date de candidature */}
      <p className="text-xs text-black/35">
        Candidature envoyée le{" "}
        {new Date(candidature.created_at).toLocaleDateString("fr-BE", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
    </div>
  );
}