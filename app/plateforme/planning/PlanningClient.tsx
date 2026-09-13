"use client";

import { ShellProfile, ShellEleve, BadgePremium } from "@/app/components/plateforme/PlatformShell";
import { useState } from "react";
import CalendrierClient, { Cours, CreneauDispo } from "./CalendrierClient";

interface PlanningProps {
  profile: ShellProfile;
  eleves: ShellEleve[];
  eleveData: Record<string, Cours[]>;
  initialEleveId: string;
  creneauxDisponibles: CreneauDispo[];
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
// Remplace l'ancien système à 3 vues (Liste / Semaine / Historique séparées)
// par un calendrier unique (Semaine / Mois) — décision prise avec Angélie le
// 13/09/2026 : passé et futur doivent cohabiter dans la même vue, comme un
// vrai calendrier, plutôt que forcer un choix entre "à venir" et "historique".
export default function PlanningClient({
  profile, eleves, eleveData, initialEleveId, creneauxDisponibles,
}: PlanningProps) {
  const [activeEleveId, setActiveEleveId] = useState(initialEleveId);

  const activeEleve = eleves.find((e) => e.id === activeEleveId) ?? eleves[0];
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
              <p className="text-sm text-black/50">Tous tes cours, passés et à venir, au même endroit.</p>
            </div>

            {/* Sélecteur élève */}
            {eleves.length > 1 && (
              <div className="flex items-center gap-2 flex-wrap">
                {eleves.map((e) => (
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
              </div>
            )}
          </div>

          {/* ── CALENDRIER ── */}
          <CalendrierClient
            cours={cours}
            creneauxDisponibles={creneauxDisponibles}
            isPremium={isPremium}
          />

        </div>
      </div>
    </div>
  );
}