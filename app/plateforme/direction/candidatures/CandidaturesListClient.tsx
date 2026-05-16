// app/plateforme/direction/candidatures/CandidaturesListClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText, Clock, CheckCircle2, XCircle, AlertCircle,
  Hourglass, Search, ArrowUpDown
} from "lucide-react";
import AnneeScolaireSelector from "@/app/components/plateforme/AnneeScolaireSelector";

// ── TYPES ─────────────────────────────────────────────────────────────────────
interface AnneeScolaire {
  id: string;
  libelle: string;
  active: boolean;
}

// ── FILTRES ───────────────────────────────────────────────────────────────────
const STATUTS = [
  { id: "tous",        label: "Toutes"      },
  { id: "a_traiter",  label: "À traiter"   },
  { id: "acceptable", label: "Acceptables" },
  { id: "refusee",    label: "Refusées"    },
];

function matchFiltre(candidature: any, filtre: string): boolean {
  if (filtre === "tous")        return true;
  if (filtre === "a_traiter")  return ["en_attente", "info_complementaire"].includes(candidature.statut);
  if (filtre === "acceptable") return ["validee", "acceptee"].includes(candidature.statut);
  return candidature.statut === filtre;
}

const PARCOURS_LABELS: Record<string, string> = {
  "full-artist":      "Full Artist",
  "comedie-musicale": "Comédie musicale",
  "eveil-musical":    "Éveil musical",
};

function statutConfig(statut: string) {
  switch (statut) {
    case "en_attente":          return { label: "En attente",      bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   icon: <Clock size={11} /> };
    case "info_complementaire": return { label: "Info demandée",   bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200",  icon: <AlertCircle size={11} /> };
    case "validee":
    case "acceptee":            return { label: "Acceptable",      bg: "bg-green-50",   text: "text-green-700",   border: "border-green-200",   icon: <CheckCircle2 size={11} /> };
    case "liste_attente":       return { label: "Liste d'attente", bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    icon: <Hourglass size={11} /> };
    case "place_proposee":      return { label: "Place proposée",  bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: <CheckCircle2 size={11} /> };
    case "sans_reponse":
    case "expiree":             return { label: "Sans réponse",    bg: "bg-gray-50",    text: "text-gray-500",    border: "border-gray-200",    icon: <Clock size={11} /> };
    case "inscrit":             return { label: "Inscrit",         bg: "bg-green-100",  text: "text-green-800",   border: "border-green-300",   icon: <CheckCircle2 size={11} /> };
    case "refusee":             return { label: "Refusée",         bg: "bg-red-50",     text: "text-red-600",     border: "border-red-200",     icon: <XCircle size={11} /> };
    default: return { label: statut, bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", icon: null };
  }
}

function joursDepuis(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Hier";
  return `Il y a ${diff}j`;
}

// ── COMPOSANT PRINCIPAL ───────────────────────────────────────────────────────
export default function CandidaturesListClient({
  candidatures,
  annees,
  anneeActiveId: initialAnneeActiveId,
}: {
  candidatures: any[];
  annees: AnneeScolaire[];
  anneeActiveId: string;
}) {
  const [filtre, setFiltre]           = useState("a_traiter");
  const [search, setSearch]           = useState("");
  const [parcoursFilt, setParcoursFilt] = useState("tous");
  const [tri, setTri]                 = useState<"asc" | "desc">("asc");
  const [anneeId, setAnneeId]         = useState(initialAnneeActiveId);

  // ── Filtrage ──────────────────────────────────────────────────────────────
  const candidaturesFiltreesAnnee = anneeId
    ? candidatures.filter(c => c.annee_id === anneeId || !c.annee_id) // inclure les sans-année (legacy)
    : candidatures;

  const filtered = candidaturesFiltreesAnnee
    .filter(c => {
      if (!matchFiltre(c, filtre)) return false;
      if (parcoursFilt !== "tous" && c.parcours !== parcoursFilt) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          c.prenom?.toLowerCase().includes(q) ||
          c.nom?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.ville?.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return tri === "asc" ? da - db : db - da;
    });

  const counts = STATUTS.reduce((acc, s) => {
    acc[s.id] = candidaturesFiltreesAnnee.filter(c => matchFiltre(c, s.id)).length;
    return acc;
  }, {} as Record<string, number>);

  const aTraiter = candidaturesFiltreesAnnee.filter(c =>
    ["en_attente", "info_complementaire"].includes(c.statut)
  ).length;

  return (
    <div className="min-h-screen" style={{ background: "rgb(239,244,239)" }}>

      {/* ── HEADER ── */}
      <div className="px-10 lg:px-14 pb-6" style={{ paddingTop: "calc(88px + 24px)" }}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: "rgb(185,151,83)" }}>
              Direction · Candidatures
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-semibold" style={{ color: "rgb(8,20,14)" }}>Candidatures</h1>
              <AnneeScolaireSelector
                annees={annees}
                anneeActiveId={anneeId}
                onChange={setAnneeId}
              />
            </div>
            <p className="text-sm mt-1" style={{ color: "rgba(0,0,0,0.4)" }}>
              {candidaturesFiltreesAnnee.length} candidature{candidaturesFiltreesAnnee.length > 1 ? "s" : ""} · triées par ordre d'arrivée
            </p>
          </div>
          {aTraiter > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-[14px]"
              style={{ background: "rgba(185,151,83,0.12)", border: "1px solid rgba(185,151,83,0.25)" }}>
              <Clock size={14} style={{ color: "rgb(185,151,83)" }} />
              <span className="text-sm font-semibold" style={{ color: "rgb(185,151,83)" }}>
                {aTraiter} à traiter
              </span>
            </div>
          )}
        </div>

        {/* ── FILTRES STATUT ── */}
        <div className="flex items-center gap-2 mt-6 flex-wrap">
          {STATUTS.map(s => (
            <button
              key={s.id}
              onClick={() => setFiltre(s.id)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all"
              style={{
                background: filtre === s.id ? "rgb(22,92,71)" : "white",
                color:      filtre === s.id ? "white" : "rgba(0,0,0,0.5)",
                border:     filtre === s.id ? "1px solid rgb(22,92,71)" : "1px solid rgba(0,0,0,0.08)",
              }}
            >
              {s.label}
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                style={{
                  background: filtre === s.id ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.06)",
                  color:      filtre === s.id ? "white" : "rgba(0,0,0,0.4)",
                }}>
                {counts[s.id]}
              </span>
            </button>
          ))}
        </div>

        {/* ── RECHERCHE + PARCOURS + TRI ── */}
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(0,0,0,0.3)" }} />
            <input
              type="text"
              placeholder="Rechercher un candidat..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-[12px] text-sm outline-none"
              style={{ background: "white", border: "1px solid rgba(0,0,0,0.08)", color: "black" }}
            />
          </div>

          <select
            value={parcoursFilt}
            onChange={e => setParcoursFilt(e.target.value)}
            className="px-4 py-2.5 rounded-[12px] text-sm outline-none"
            style={{ background: "white", border: "1px solid rgba(0,0,0,0.08)", color: "rgba(0,0,0,0.7)" }}
          >
            <option value="tous">Tous les parcours</option>
            {Object.entries(PARCOURS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>

          <button
            onClick={() => setTri(t => t === "asc" ? "desc" : "asc")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] text-sm font-medium transition hover:bg-white"
            style={{ background: "white", border: "1px solid rgba(0,0,0,0.08)", color: "rgba(0,0,0,0.6)" }}
          >
            <ArrowUpDown size={13} />
            {tri === "asc" ? "Plus ancienne d'abord ↑" : "Plus récente d'abord ↓"}
          </button>
        </div>
      </div>

      {/* ── LISTE ── */}
      <div className="px-10 lg:px-14 pb-10">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-[24px] bg-white"
            style={{ border: "1px solid rgba(0,0,0,0.07)" }}>
            <FileText size={32} style={{ color: "rgba(0,0,0,0.2)" }} />
            <p className="mt-3 text-sm font-medium" style={{ color: "rgba(0,0,0,0.4)" }}>
              Aucune candidature trouvée
            </p>
          </div>
        ) : (
          <div className="rounded-[24px] overflow-hidden bg-white"
            style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>

            {/* Header table */}
            <div className="grid px-6 py-3 border-b"
              style={{
                gridTemplateColumns: "32px 1fr 140px 120px 100px 80px 40px",
                borderColor: "rgba(0,0,0,0.06)",
                background: "rgb(248,250,248)",
              }}>
              {["#", "Candidat", "Parcours", "Statut", "Date", "Délai", ""].map((h, i) => (
                <span key={i} className="text-[9px] font-bold uppercase tracking-[0.2em]"
                  style={{ color: "rgba(0,0,0,0.3)" }}>{h}</span>
              ))}
            </div>

            {/* Rows */}
            {filtered.map((c, idx) => {
              const st = statutConfig(c.statut);
              const jours = Math.floor((Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24));
              const isUrgent = c.statut === "en_attente" && jours >= 3;

              return (
                <Link
                  key={c.id}
                  href={`/plateforme/direction/candidatures/${c.id}`}
                  className="grid items-center px-6 py-4 transition-colors hover:bg-[rgb(239,244,239)] group"
                  style={{
                    gridTemplateColumns: "32px 1fr 140px 120px 100px 80px 40px",
                    borderTop: idx > 0 ? "1px solid rgba(0,0,0,0.05)" : "none",
                    background: isUrgent ? "rgba(254,243,199,0.3)" : "transparent",
                  }}
                >
                  {/* # */}
                  <span className="text-[11px] font-bold tabular-nums"
                    style={{ color: isUrgent ? "rgb(185,151,83)" : "rgba(0,0,0,0.25)" }}>
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  {/* Candidat */}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "rgb(8,20,14)" }}>
                      {c.prenom} {c.nom}
                      {isUrgent && (
                        <span className="ml-2 text-[10px] font-bold text-amber-600">⚠ urgent</span>
                      )}
                    </p>
                    <p className="text-xs truncate" style={{ color: "rgba(0,0,0,0.4)" }}>{c.email}</p>
                  </div>

                  {/* Parcours */}
                  <span className="text-xs font-medium truncate" style={{ color: "rgba(0,0,0,0.55)" }}>
                    {PARCOURS_LABELS[c.parcours] ?? c.parcours}
                  </span>

                  {/* Statut */}
                  <div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold border ${st.bg} ${st.text} ${st.border}`}>
                      {st.icon}
                      {st.label}
                    </span>
                  </div>

                  {/* Date */}
                  <span className="text-xs" style={{ color: "rgba(0,0,0,0.4)" }}>
                    {joursDepuis(c.created_at)}
                  </span>

                  {/* Délai */}
                  <span className="text-xs font-semibold tabular-nums"
                    style={{ color: jours >= 5 ? "rgb(220,38,38)" : jours >= 3 ? "rgb(185,151,83)" : "rgba(0,0,0,0.3)" }}>
                    {jours}j
                  </span>

                  {/* Flèche */}
                  <div className="flex justify-end">
                    <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: "rgb(22,92,71)" }}>→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}