// app/plateforme/direction/profs/ProfsListClient.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronRight, Plus, Users, UserCheck, UserX, FileWarning,
  Search, X, CalendarDays, Clock, MailWarning,
} from "lucide-react";
import type { ProfRow } from "./types";

type FiltreContrat = "tous" | "Salarié" | "Indépendant" | "Mixte" | "sans_contrat";

export default function ProfsListClient({
  profs,
  toutesDisciplines,
}: {
  profs: ProfRow[];
  toutesDisciplines: string[];
}) {
  const [recherche, setRecherche] = useState("");
  const [disciplinesFiltre, setDisciplinesFiltre] = useState<string[]>([]);
  const [contratFiltre, setContratFiltre] = useState<FiltreContrat>("tous");
  const [onboardingSeul, setOnboardingSeul] = useState(false);

  const toggleDisciplineFiltre = (d: string) => {
    setDisciplinesFiltre((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const resetFiltres = () => {
    setRecherche("");
    setDisciplinesFiltre([]);
    setContratFiltre("tous");
    setOnboardingSeul(false);
  };

  const filtresActifs = recherche || disciplinesFiltre.length > 0 || contratFiltre !== "tous" || onboardingSeul;

  // ── Stats globales (toujours sur l'ensemble, pas sur le filtré) ──────────
  const stats = useMemo(() => {
    const actifs = profs.filter(p => p.actif);
    const sansContrat = profs.filter(p => p.actif && !p.typeContratLabel);
    const salaries = profs.filter(p => p.typeContratLabel === "Salarié");
    const independants = profs.filter(p => p.typeContratLabel === "Indépendant");
    const enAttente = profs.filter(p => p.actif && p.onboardingEnAttente);
    return [
      { label: "Total profs", value: profs.length, icon: <Users size={14} /> },
      { label: "Actifs", value: actifs.length, icon: <UserCheck size={14} /> },
      { label: "Salariés", value: salaries.length, icon: <Users size={14} /> },
      { label: "Indépendants", value: independants.length, icon: <Users size={14} /> },
      { label: "Sans contrat", value: sansContrat.length, icon: <FileWarning size={14} />, warn: sansContrat.length > 0 },
      { label: "Invitation en attente", value: enAttente.length, icon: <MailWarning size={14} />, warn: enAttente.length > 0 },
    ];
  }, [profs]);

  // ── Filtrage + tri alphabétique ────────────────────────────────────────────
  const parNomAlpha = (a: ProfRow, b: ProfRow) => {
    const n = a.nom.localeCompare(b.nom, "fr", { sensitivity: "base" });
    if (n !== 0) return n;
    return a.prenom.localeCompare(b.prenom, "fr", { sensitivity: "base" });
  };

  const profsFiltres = useMemo(() => {
    const rechercheNorm = recherche.trim().toLowerCase();
    return profs.filter((p) => {
      if (rechercheNorm) {
        const nomComplet = `${p.prenom} ${p.nom}`.toLowerCase();
        if (!nomComplet.includes(rechercheNorm)) return false;
      }
      if (disciplinesFiltre.length > 0) {
        const match = p.disciplines.some((d) => disciplinesFiltre.includes(d));
        if (!match) return false;
      }
      if (contratFiltre === "sans_contrat") {
        if (p.typeContratLabel) return false;
      } else if (contratFiltre !== "tous") {
        if (p.typeContratLabel !== contratFiltre) return false;
      }
      if (onboardingSeul && !p.onboardingEnAttente) return false;
      return true;
    });
  }, [profs, recherche, disciplinesFiltre, contratFiltre, onboardingSeul]);

  const profsActifs = profsFiltres.filter(p => p.actif).sort(parNomAlpha);
  const profsInactifs = profsFiltres.filter(p => !p.actif).sort(parNomAlpha);

  const CONTRAT_OPTIONS: { value: FiltreContrat; label: string }[] = [
    { value: "tous", label: "Tous" },
    { value: "Salarié", label: "Salarié" },
    { value: "Indépendant", label: "Indépendant" },
    { value: "Mixte", label: "Mixte" },
    { value: "sans_contrat", label: "Sans contrat" },
  ];

  // ── Carte prof ───────────────────────────────────────────────────────────
  const ProfCard = ({ prof, compact }: { prof: ProfRow; compact?: boolean }) => {
    const initiales = `${prof.prenom[0] ?? ""}${prof.nom[0] ?? ""}`.toUpperCase();

    return (
      <Link
        href={`/plateforme/direction/profs/${prof.id}`}
        className="group flex items-center gap-4 rounded-[18px] border border-black/6 bg-white px-5 py-3.5 transition-all hover:-translate-y-px hover:shadow-md"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
      >
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{
            background: prof.actif ? "rgba(22,92,71,0.1)" : "rgba(0,0,0,0.06)",
            color: prof.actif ? "rgb(22,92,71)" : "rgba(0,0,0,0.35)",
          }}
        >
          {initiales || "?"}
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-black truncate">
              {prof.prenom} {prof.nom}
            </p>
            {prof.typeContratLabel ? (
              <span
                className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: "rgba(22,92,71,0.1)", color: "rgb(22,92,71)" }}
              >
                {prof.typeContratLabel}
              </span>
            ) : (
              <span
                className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: "rgba(185,151,83,0.12)", color: "rgb(146,95,14)" }}
              >
                Sans contrat
              </span>
            )}
            {prof.onboardingEnAttente && (
              <span
                className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1"
                style={{ background: "rgba(220,38,38,0.08)", color: "rgb(220,38,38)" }}
                title="N'a jamais ouvert de session — l'invitation n'a probablement pas été activée"
              >
                <MailWarning size={9} /> Invitation en attente
              </span>
            )}
          </div>
          <p className="text-xs text-black/40 mt-0.5 truncate">
            {prof.disciplines.join(", ") || "Aucune discipline"}
            {!compact && prof.telephone ? ` · ${prof.telephone}` : ""}
          </p>
        </div>

        {/* Charge de la semaine — masqué en mode compact */}
        {!compact && (
          <div className="text-right flex-shrink-0 hidden md:flex flex-col items-end gap-0.5">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-black/60">
              <CalendarDays size={11} /> {prof.coursPlanifiesSemaine} cette semaine
            </span>
            {prof.creneauxOuvertsSemaine > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-black/35">
                <Clock size={10} /> {prof.creneauxOuvertsSemaine} créneau{prof.creneauxOuvertsSemaine > 1 ? "x" : ""} ouvert{prof.creneauxOuvertsSemaine > 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        <ChevronRight
          size={16}
          className="text-black/20 group-hover:text-black/50 transition-colors flex-shrink-0"
        />
      </Link>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: "rgb(239,244,239)" }}>
      <div className="px-10 lg:px-14" style={{ paddingTop: "calc(96px + 24px)", paddingBottom: 40 }}>

        {/* En-tête */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgb(185,151,83)", marginBottom: 6 }}>
              Direction · Professeurs
            </p>
            <h1 style={{ fontSize: 30, fontWeight: 600, color: "rgb(8,20,14)", margin: "0 0 4px" }}>
              Professeurs
            </h1>
            <p style={{ fontSize: 13, color: "rgba(0,0,0,0.45)", margin: 0 }}>
              {profs.length} prof{profs.length > 1 ? "s" : ""} enregistré{profs.length > 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/plateforme/direction/profs/nouveau"
            className="inline-flex items-center gap-2 rounded-full text-sm font-semibold !text-white transition hover:bg-[rgb(18,75,58)]"
            style={{ background: "rgb(22,92,71)", padding: "12px 24px" }}
          >
            <Plus size={14} /> Ajouter un prof
          </Link>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {stats.map((s) => (
            <div key={s.label} className="rounded-[16px] border border-black/6 bg-white px-4 py-3.5"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center gap-1.5 mb-1"
                style={{ color: s.warn ? "rgb(185,151,83)" : "rgba(0,0,0,0.3)" }}>
                {s.icon}
                <span className="text-[9px] uppercase tracking-[0.14em] font-semibold">{s.label}</span>
              </div>
              <p className="text-xl font-semibold" style={{ color: s.warn ? "rgb(146,95,14)" : "rgb(8,20,14)" }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Recherche + filtres ── */}
        <div className="rounded-[18px] border border-black/6 bg-white p-4 mb-6"
          style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div className="flex flex-col gap-3">

            {/* Recherche */}
            <div className="relative">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
              <input
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher un professeur par nom..."
                className="w-full rounded-[12px] border border-black/10 bg-[rgb(247,250,247)] pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/20 focus:border-[rgb(22,92,71)]"
              />
            </div>

            {/* Filtre type de contrat */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wide text-black/30 mr-1">Contrat</span>
              {CONTRAT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setContratFiltre(opt.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    contratFiltre === opt.value
                      ? "border-[rgb(22,92,71)] bg-[rgb(22,92,71)] text-white"
                      : "border-black/10 bg-[rgb(247,250,247)] text-black/50 hover:border-black/20"
                  }`}
                >
                  {opt.label}
                </button>
              ))}

              <button
                onClick={() => setOnboardingSeul((v) => !v)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1 ml-1 ${
                  onboardingSeul
                    ? "border-red-300 bg-red-500 text-white"
                    : "border-black/10 bg-[rgb(247,250,247)] text-black/50 hover:border-black/20"
                }`}
              >
                <MailWarning size={11} /> Invitation en attente
              </button>
            </div>

            {/* Filtre disciplines */}
            {toutesDisciplines.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wide text-black/30 mr-1">Disciplines</span>
                {toutesDisciplines.map((d) => (
                  <button
                    key={d}
                    onClick={() => toggleDisciplineFiltre(d)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      disciplinesFiltre.includes(d)
                        ? "border-[rgb(185,151,83)] bg-[rgb(185,151,83)] text-white"
                        : "border-black/10 bg-[rgb(247,250,247)] text-black/50 hover:border-black/20"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}

            {filtresActifs && (
              <button
                onClick={resetFiltres}
                className="self-start inline-flex items-center gap-1 text-xs font-semibold text-black/40 hover:text-black/60 transition"
              >
                <X size={12} /> Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>

        {profs.length === 0 ? (
          <div className="rounded-[20px] border border-black/6 bg-white p-10 text-center text-sm text-black/40">
            Aucun professeur pour l'instant. Commence par en ajouter un.
          </div>
        ) : profsFiltres.length === 0 ? (
          <div className="rounded-[20px] border border-black/6 bg-white p-10 text-center text-sm text-black/40">
            Aucun professeur ne correspond à ces filtres.
          </div>
        ) : (
          /* ── Split Actifs (large) / Inactifs (colonne latérale) ── */
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

            {/* ACTIFS */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <UserCheck size={14} style={{ color: "rgb(22,92,71)" }} />
                <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: "rgb(22,92,71)" }}>
                  Actifs — {profsActifs.length}
                </p>
              </div>
              {profsActifs.length === 0 ? (
                <div className="rounded-[18px] border border-black/6 bg-white p-8 text-center text-sm text-black/35">
                  Aucun professeur actif ne correspond à ces filtres.
                </div>
              ) : (
                <div className="space-y-2">
                  {profsActifs.map((prof) => (
                    <ProfCard key={prof.id} prof={prof} />
                  ))}
                </div>
              )}
            </div>

            {/* INACTIFS — colonne latérale, scrollable si longue */}
            <div
              className="rounded-[20px] border border-black/6 bg-white/60 p-4"
              style={{
                position: "sticky",
                top: 24,
                maxHeight: "calc(100vh - 200px)",
                overflowY: "auto",
              }}
            >
              <div className="flex items-center gap-2 mb-3 px-1">
                <UserX size={14} style={{ color: "rgba(0,0,0,0.35)" }} />
                <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: "rgba(0,0,0,0.35)" }}>
                  Inactifs — {profsInactifs.length}
                </p>
              </div>
              {profsInactifs.length === 0 ? (
                <p className="text-xs text-black/30 px-1 py-4 text-center">Aucun professeur inactif.</p>
              ) : (
                <div className="space-y-2">
                  {profsInactifs.map((prof) => (
                    <ProfCard key={prof.id} prof={prof} compact />
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}