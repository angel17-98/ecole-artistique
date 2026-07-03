// app/components/ProcessusCandidature.tsx
// Composant réutilisable pour les pages Full Artist et Comédie Musicale
"use client";

import Link from "next/link";
import { useState } from "react";

interface Props {
  parcours: "full-artist" | "comedie-musicale";
  onClose?: () => void;
}

const PARCOURS_LABELS = {
  "full-artist": "Full Artist",
  "comedie-musicale": "Comédie musicale",
};

export default function ProcessusCandidature({ parcours, onClose }: Props) {
  const label = PARCOURS_LABELS[parcours];

  return (
    <div className="w-full">
      {/* Intro */}
      <div className="mb-6 rounded-[16px] p-4"
        style={{ background: "rgba(185,151,83,0.08)", border: "1px solid rgba(185,151,83,0.2)" }}>
        <p className="text-sm font-semibold mb-1" style={{ color: "rgb(185,151,83)" }}>
          ⚠ Places limitées — premier arrivé, premier servi à l'inscription
        </p>
        <p className="text-sm leading-6" style={{ color: "rgba(0,0,0,0.65)" }}>
          Les groupes sont limités à <strong>10 à 15 élèves maximum</strong>. Les dossiers sont examinés dans l'ordre d'arrivée, mais l'inscription se fait par ordre de réaction — ne tarde pas si ta candidature est retenue.
        </p>
      </div>

      {/* Étapes */}
      <div className="space-y-0">
        {[
          {
            num: "1",
            titre: "Tu déposes ta candidature",
            desc: "Un formulaire en ligne, quelques questions sur qui tu es et ce que tu veux créer, et une courte vidéo de 2 à 3 minutes. Pas d'audition en présentiel, pas de niveau requis. Tu peux candidater avec ou sans compte — créer un compte te permet de suivre ta candidature en temps réel.",
            color: "rgb(22,92,71)",
          },
          {
            num: "2",
            titre: "On examine ton dossier",
            desc: "Chaque candidature est lue attentivement par la direction. Tu reçois une réponse dans la semaine. On peut te contacter si on a des questions avant de décider.",
            color: "rgb(22,92,71)",
          },
          {
            num: "3a",
            titre: "Profil retenu → place disponible",
            desc: "Si ton dossier est retenu et qu'une place est disponible, tu reçois un email avec un lien pour t'inscrire et régler le premier versement. Attention : les places partent vite. Si tu attends trop longtemps, la place peut être proposée à quelqu'un d'autre sur liste d'attente.",
            color: "rgb(22,92,71)",
            highlight: true,
          },
          {
            num: "3b",
            titre: "Profil retenu → liste d'attente",
            desc: "Si les groupes sont complets au moment où ton dossier est retenu, tu es placé·e sur liste d'attente. Tu es prévenu·e dès qu'une place se libère, dans l'ordre d'attente.",
            color: "rgb(22,92,71)",
          },
          {
            num: "4",
            titre: "Inscription et groupes",
            desc: "Une fois inscrit·e, les créneaux et groupes ne sont pas encore définis à ce stade. On te contactera pour te proposer un créneau en tenant compte de tes disponibilités — mais aucun créneau ni groupe ne peut être garanti à l'avance. Si le créneau proposé ne te convient pas, on cherche une solution ensemble.",
            color: "rgb(185,151,83)",
          },
        ].map((step, i) => (
          <div key={step.num} className="flex gap-4 pb-5"
            style={{ borderLeft: i < 4 ? `2px solid rgba(0,0,0,0.06)` : "none", marginLeft: "14px", paddingLeft: "20px" }}>
            <div className="relative -ml-[34px] flex-shrink-0">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                style={{ background: step.highlight ? "rgb(22,92,71)" : step.color }}>
                {step.num}
              </div>
            </div>
            <div className={`flex-1 rounded-[14px] p-4 ${step.highlight ? "border" : ""}`}
              style={step.highlight ? { background: "rgba(22,92,71,0.05)", border: "1px solid rgba(22,92,71,0.15)" } : {}}>
              <p className="text-sm font-semibold text-black mb-1.5">{step.titre}</p>
              <p className="text-sm leading-6" style={{ color: "rgba(0,0,0,0.6)" }}>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <Link
          href={`/candidature?parcours=${parcours}`}
          onClick={onClose}
          className="flex-1 flex items-center justify-center rounded-full py-3 text-sm font-semibold !text-white transition hover:brightness-110"
          style={{ background: "rgb(22,92,71)" }}
        >
          Déposer ma candidature →
        </Link>
        <Link
          href="/plateforme/login"
          onClick={onClose}
          className="flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition hover:bg-black/5"
          style={{ border: "1px solid rgba(0,0,0,0.12)", color: "rgba(0,0,0,0.7)" }}
        >
          J'ai déjà un compte
        </Link>
      </div>
    </div>
  );
}