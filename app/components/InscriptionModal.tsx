// app/components/InscriptionModal.tsx
"use client";

import { useEffect } from "react";
import ProcessusCandidature from "./ProcessusCandidature";

type Props = {
  parcours: "full-artist" | "comedie-musicale";
  onClose: () => void;
};

const PARCOURS_LABELS = {
  "full-artist": "Full Artist",
  "comedie-musicale": "Comédie musicale",
};

export default function InscriptionModal({ parcours, onClose }: Props) {
  const label = PARCOURS_LABELS[parcours];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Comment rejoindre le parcours ${label}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/58 backdrop-blur-[3px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modale */}
      <div className="relative z-10 w-full max-w-[600px] max-h-[90vh] overflow-y-auto rounded-[24px] border border-black/8 bg-white shadow-[0_32px_80px_rgba(0,0,0,0.22)]">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-[rgb(22,92,71)] px-7 pb-5 pt-6 sm:px-8">
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/14 text-sm text-white/80 transition hover:bg-white/22"
          >
            ✕
          </button>
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/50 mb-1">
            Parcours {label}
          </p>
          <h2 className="text-xl font-semibold leading-snug text-white sm:text-2xl">
            Comment rejoindre le parcours ?
          </h2>
          <p className="mt-1.5 text-sm leading-6 text-white/64">
            Pas d'audition, pas de niveau requis — juste l'envie sincère de créer.
          </p>
        </div>

        {/* Corps */}
        <div className="px-7 py-6 sm:px-8">
          <ProcessusCandidature parcours={parcours} onClose={onClose} />
        </div>
      </div>
    </div>
  );
}
