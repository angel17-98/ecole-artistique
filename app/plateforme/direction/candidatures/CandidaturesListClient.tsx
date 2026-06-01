// app/plateforme/direction/candidatures/CandidaturesListClient.tsx
// FIX : "acceptee" supprimé de matchFiltre et statutConfig — seul "validee" subsiste
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock, CheckCircle2, XCircle, AlertCircle,
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

// FIX : "acceptee" retiré — seul "validee" compte comme acceptable
function matchFiltre(candidature: any, filtre: string): boolean {
  if (filtre === "tous")        return true;
  if (filtre === "a_traiter")  return ["en_attente", "info_complementaire"].includes(candidature.statut);
  if (filtre === "acceptable") return candidature.statut === "validee";
  return candidature.statut === filtre;
}

const PARCOURS_LABELS: Record<string, string> = {
  "full-artist":      "Full Artist",
  "comedie-musicale": "Comédie musicale",
  "eveil-musical":    "Éveil musical",
};

// FIX : "acceptee" retiré de statutConfig
function statutConfig(statut: string) {
  switch (statut) {
    case "en_attente":          return { label: "En attente",      bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   icon: <Clock size={11} /> };
    case "info_complementaire": return { label: "Info demandée",   bg: "bg-purple-50",  text: "text-purple-700",  border: "border-purple-200",  icon: <AlertCircle size={11} /> };
    case "validee":             return { label: "Acceptable",      bg: "bg-green-50",   text: "text-green-700",   border: "border-green-200",   icon: <CheckCircle2 size={11} /> };
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
  const [filtre, setFiltre]             = useState("a_traiter");
  const [search, setSearch]             = useState("");
  const [parcoursFilt, setParcoursFilt] = useState("tous");
  const [tri, setTri]                   = useState<"asc" | "desc">("asc");
  const [anneeId, setAnneeId]           = useState(initialAnneeActiveId);

  // ── Filtrage par année ────────────────────────────────────────────────────
  const candidaturesFiltreesAnnee = anneeId
    ? candidatures.filter(c => c.annee_id === anneeId || !c.annee_id)
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
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] mb-2"
              style={{ color: "rgb(185,151,83)" }}>
              Direction · Candidatures
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-semibold" style={{ color: "rgb(8,20,14)" }}>
                Candidatures
              </h1>
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
                  color:      filtre === s.id ? "white" : "rgba(0,0,0,0.45)",
                }}>
                {counts[s.id]}
              </span>
            </button>
          ))}
        </div>

        {/* ── FILTRES PARCOURS + RECHERCHE ── */}
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          {["tous", "full-artist", "comedie-musicale", "eveil-musical"].map(p => (
            <button
              key={p}
              onClick={() => setParcoursFilt(p)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: parcoursFilt === p ? "rgb(8,20,14)" : "rgba(0,0,0,0.04)",
                color:      parcoursFilt === p ? "white" : "rgba(0,0,0,0.5)",
              }}
            >
              {p === "tous" ? "Tous parcours" : PARCOURS_LABELS[p]}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" />
              <input
                type="text"
                placeholder="Rechercher…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-full text-xs border border-black/10 bg-white outline-none focus:border-black/20 w-44"
              />
            </div>
            <button
              onClick={() => setTri(t => t === "asc" ? "desc" : "asc")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-black/10 hover:border-black/20 transition"
              style={{ color: "rgba(0,0,0,0.5)" }}
            >
              <ArrowUpDown size={11} />
              {tri === "asc" ? "Plus anciens" : "Plus récents"}
            </button>
          </div>
        </div>
      </div>

      {/* ── LISTE ── */}
      <div className="px-10 lg:px-14 pb-20">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm" style={{ color: "rgba(0,0,0,0.35)" }}>
              Aucune candidature pour ce filtre.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(c => {
              const sc = statutConfig(c.statut);
              return (
                <Link
                  key={c.id}
                  href={`/plateforme/direction/candidatures/${c.id}`}
                  className="flex items-center gap-4 bg-white rounded-[16px] px-5 py-4 border border-black/[0.04] hover:border-black/10 hover:shadow-sm transition-all group"
                >
                  {/* Initiales */}
                  <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: "rgb(22,92,71)" }}>
                    {c.prenom?.[0]}{c.nom?.[0]}
                  </div>

                  {/* Identité */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-black leading-tight">
                      {c.prenom} {c.nom}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(0,0,0,0.4)" }}>
                      {c.age} ans · {c.ville || "—"} · {PARCOURS_LABELS[c.parcours] ?? c.parcours}
                    </p>
                  </div>

                  {/* Statut */}
                  <div className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${sc.bg} ${sc.text} ${sc.border}`}>
                    {sc.icon}
                    {sc.label}
                  </div>

                  {/* Date */}
                  <div className="shrink-0 text-right hidden sm:block">
                    <p className="text-xs" style={{ color: "rgba(0,0,0,0.35)" }}>
                      {joursDepuis(c.created_at)}
                    </p>
                  </div>

                  {/* Flèche */}
                  <span className="shrink-0 text-black/20 group-hover:text-black/40 transition text-sm">→</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}