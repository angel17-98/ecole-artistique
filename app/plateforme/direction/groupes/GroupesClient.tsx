"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users, CheckCircle2, ExternalLink,
  Plus, X, ChevronRight, Send, ArrowLeft,
} from "lucide-react";

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Groupe {
  id: string;
  nom: string;
  parcours: string;
  places_max: number;
  annee_scolaire: string;
}

interface Candidature {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  age: number;
  ville: string;
  parcours: string;
  statut?: string;
  groupe_inscription_id?: string | null;
  place_proposee_at?: string | null;
  place_expire_at?: string | null;
  pourquoi?: string;
  eval_chant?: number | null;
  eval_danse?: number | null;
  eval_theatre?: number | null;
  eval_ecriture?: number | null;
  eval_scenique?: number | null;
  eval_studio?: number | null;
}

const PARCOURS_LIST = [
  { id: "full-artist",      label: "Full Artist" },
  { id: "comedie-musicale", label: "Comédie Musicale" },
];

const DISCIPLINES = [
  { key: "eval_chant",    label: "Chant"    },
  { key: "eval_danse",    label: "Danse"    },
  { key: "eval_theatre",  label: "Théâtre"  },
  { key: "eval_ecriture", label: "Écriture" },
  { key: "eval_scenique", label: "Scénique" },
  { key: "eval_studio",   label: "Studio"   },
];

function initiales(prenom: string, nom: string) {
  return `${prenom[0] ?? ""}${nom[0] ?? ""}`.toUpperCase();
}

function joursRestants(expireAt: string | null | undefined): number | null {
  if (!expireAt) return null;
  const diff = new Date(expireAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function StatutDot({ statut, expireAt }: { statut?: string; expireAt?: string | null }) {
  const j = joursRestants(expireAt);
  if (statut === "inscrit")
    return <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "rgb(99,153,34)" }} />;
  if (statut === "place_proposee")
    return <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: j !== null && j <= 1 ? "rgb(226,75,74)" : "rgb(186,117,23)" }} />;
  return <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "rgb(24,95,165)" }} />;
}

// ── MINI FICHE ────────────────────────────────────────────────────────────────
// mode "aplacer"   → candidat de la zone tampon, groupePreselectionne optionnel
// mode "place"     → candidat déjà dans un groupe, actions changer/retirer/proposer
function MiniFiche({
  candidature,
  mode,
  groupePreselectionne,
  groupes,
  parcours,
  loadingAction,
  onClose,
  onAssigner,
  onChangerGroupe,
  onRetirerDuGroupe,
  onProposerPlace,
}: {
  candidature: Candidature;
  mode: "aplacer" | "place";
  groupePreselectionne: string;
  groupes: Groupe[];
  parcours: string;
  loadingAction: string | null;
  onClose: () => void;
  onAssigner: (groupeId: string) => void;
  onChangerGroupe: (groupeId: string) => void;
  onRetirerDuGroupe: () => void;
  onProposerPlace: () => void;
}) {
  const [groupeChoisi, setGroupeChoisi] = useState(groupePreselectionne);
  const [vuChanger, setVuChanger]       = useState(false);

  const groupesDispo   = groupes.filter(g => g.parcours === parcours);
  const groupeActuelId = candidature.groupe_inscription_id;
  const j              = joursRestants(candidature.place_expire_at);
  const isLoading      = loadingAction === candidature.id;

  return (
    <div className="rounded-[20px] overflow-hidden"
      style={{ border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 8px 40px rgba(0,0,0,0.10)" }}>

      {/* Header vert */}
      <div className="flex items-center justify-between px-5 py-4"
        style={{ background: "rgb(12,50,38)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
            style={{ background: "rgba(185,151,83,0.2)", color: "rgb(185,151,83)" }}>
            {initiales(candidature.prenom, candidature.nom)}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{candidature.prenom} {candidature.nom}</p>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>
              {candidature.age} ans · {candidature.ville} · {candidature.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/plateforme/direction/candidatures/${candidature.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium"
            style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.65)" }}>
            <ExternalLink size={11} /> Fiche complète
          </Link>
          <button onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }}>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Corps */}
      <div style={{ background: "white" }}>
        <div className="grid grid-cols-2 gap-0">

          {/* Évaluations */}
          <div className="p-5" style={{ borderRight: "1px solid rgba(0,0,0,0.06)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-3"
              style={{ color: "rgba(0,0,0,0.35)" }}>Auto-évaluation</p>
            <div className="space-y-2.5">
              {DISCIPLINES.map(d => {
                const val = (candidature as any)[d.key] ?? 0;
                return (
                  <div key={d.key} className="flex items-center gap-3">
                    <span className="text-[11px] w-16 flex-shrink-0" style={{ color: "rgba(0,0,0,0.5)" }}>{d.label}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
                      <div className="h-full rounded-full" style={{
                        width: `${(val / 5) * 100}%`,
                        background: val >= 4 ? "rgb(22,92,71)" : val >= 3 ? "rgb(185,151,83)" : "rgb(180,80,80)",
                      }} />
                    </div>
                    <span className="text-[10px] w-6 text-right flex-shrink-0" style={{ color: "rgba(0,0,0,0.35)" }}>{val}/5</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions selon le mode */}
          <div className="p-5">

            {/* ── MODE À PLACER ── */}
            {mode === "aplacer" && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-3"
                  style={{ color: "rgba(0,0,0,0.35)" }}>Assigner à un groupe</p>
                <div className="space-y-2 mb-4">
                  {groupesDispo.map(g => (
                    <label key={g.id}
                      className="flex items-center gap-2.5 cursor-pointer p-2 rounded-[10px] transition-all"
                      style={{
                        background: groupeChoisi === g.id ? "rgb(239,244,239)" : "transparent",
                        border: groupeChoisi === g.id ? "1px solid rgba(22,92,71,0.2)" : "1px solid transparent",
                      }}>
                      <input type="radio" name="groupe-choix" value={g.id}
                        checked={groupeChoisi === g.id}
                        onChange={() => setGroupeChoisi(g.id)}
                        className="accent-[rgb(22,92,71)]" />
                      <span className="text-sm font-medium" style={{ color: "rgba(0,0,0,0.7)" }}>{g.nom}</span>
                      <span className="text-[11px] ml-auto" style={{ color: "rgba(0,0,0,0.35)" }}>
                        {g.places_max} places
                      </span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={() => groupeChoisi && onAssigner(groupeChoisi)}
                  disabled={!groupeChoisi || isLoading}
                  className="w-full py-2.5 rounded-full text-sm font-semibold transition disabled:opacity-40"
                  style={{ background: "rgb(22,92,71)", color: "white" }}>
                  {isLoading ? "Assignation…" : groupeChoisi ? `Assigner au ${groupesDispo.find(g => g.id === groupeChoisi)?.nom ?? "groupe"}` : "Sélectionne un groupe"}
                </button>
              </div>
            )}

            {/* ── MODE DÉJÀ PLACÉ ── */}
            {mode === "place" && !vuChanger && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-3"
                  style={{ color: "rgba(0,0,0,0.35)" }}>Actions</p>

                {/* Statut actuel */}
                <div className="rounded-[12px] px-3 py-2.5 mb-4"
                  style={{
                    background: candidature.statut === "inscrit"       ? "rgba(22,92,71,0.08)"
                               : candidature.statut === "place_proposee" ? "rgba(186,117,23,0.08)"
                               : "rgba(24,95,165,0.08)",
                    border: `1px solid ${
                      candidature.statut === "inscrit"       ? "rgba(22,92,71,0.15)"
                    : candidature.statut === "place_proposee" ? "rgba(186,117,23,0.2)"
                    : "rgba(24,95,165,0.15)"}`,
                  }}>
                  <p className="text-xs font-semibold"
                    style={{
                      color: candidature.statut === "inscrit"       ? "rgb(22,92,71)"
                           : candidature.statut === "place_proposee" ? "rgb(186,117,23)"
                           : "rgb(24,95,165)",
                    }}>
                    {candidature.statut === "inscrit"        ? "✓ Inscrit confirmé"
                   : candidature.statut === "place_proposee" ? `Place proposée${j !== null ? ` · J-${j}` : ""}`
                   :                                           "Placé — proposition à envoyer"}
                  </p>
                </div>

                <div className="space-y-2">
                  {/* Proposer une place — uniquement si pas encore proposé ni inscrit */}
                  {candidature.statut !== "place_proposee" && candidature.statut !== "inscrit" && (
                    <button
                      onClick={onProposerPlace}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition disabled:opacity-40"
                      style={{ background: "rgb(22,92,71)", color: "white" }}>
                      <Send size={13} />
                      {isLoading ? "Envoi…" : "Proposer une place"}
                    </button>
                  )}

                  {/* Changer de groupe — si pas inscrit */}
                  {candidature.statut !== "inscrit" && (
                    <button
                      onClick={() => setVuChanger(true)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition"
                      style={{ background: "rgb(239,244,239)", color: "rgb(22,92,71)", border: "1px solid rgba(22,92,71,0.15)" }}>
                      Changer de groupe
                    </button>
                  )}

                  {/* Retirer du groupe — retour zone tampon */}
                  {candidature.statut !== "inscrit" && (
                    <button
                      onClick={onRetirerDuGroupe}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition disabled:opacity-40"
                      style={{ background: "rgba(220,38,38,0.06)", color: "rgb(180,50,50)", border: "1px solid rgba(220,38,38,0.15)" }}>
                      <ArrowLeft size={13} />
                      Retirer du groupe
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── MODE CHANGER DE GROUPE ── */}
            {mode === "place" && vuChanger && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <button onClick={() => setVuChanger(false)}
                    className="text-[11px] font-medium hover:underline"
                    style={{ color: "rgba(0,0,0,0.4)" }}>
                    ← Retour
                  </button>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                    style={{ color: "rgba(0,0,0,0.35)" }}>Changer de groupe</p>
                </div>
                <div className="space-y-2 mb-4">
                  {groupesDispo.filter(g => g.id !== groupeActuelId).map(g => (
                    <label key={g.id}
                      className="flex items-center gap-2.5 cursor-pointer p-2 rounded-[10px] transition-all"
                      style={{
                        background: groupeChoisi === g.id ? "rgb(239,244,239)" : "transparent",
                        border: groupeChoisi === g.id ? "1px solid rgba(22,92,71,0.2)" : "1px solid transparent",
                      }}>
                      <input type="radio" name="groupe-changer" value={g.id}
                        checked={groupeChoisi === g.id}
                        onChange={() => setGroupeChoisi(g.id)}
                        className="accent-[rgb(22,92,71)]" />
                      <span className="text-sm font-medium" style={{ color: "rgba(0,0,0,0.7)" }}>{g.nom}</span>
                      <span className="text-[11px] ml-auto" style={{ color: "rgba(0,0,0,0.35)" }}>
                        {g.places_max} places
                      </span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={() => { if (groupeChoisi) { onChangerGroupe(groupeChoisi); setVuChanger(false); } }}
                  disabled={!groupeChoisi || isLoading}
                  className="w-full py-2.5 rounded-full text-sm font-semibold transition disabled:opacity-40"
                  style={{ background: "rgb(22,92,71)", color: "white" }}>
                  {isLoading ? "Déplacement…" : "Confirmer le changement"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Motivation */}
        {candidature.pourquoi && (
          <div className="px-5 py-4" style={{ borderTop: "1px solid rgba(0,0,0,0.06)", background: "rgb(248,250,248)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-2"
              style={{ color: "rgba(0,0,0,0.35)" }}>Motivation</p>
            <p className="text-xs leading-5 line-clamp-3" style={{ color: "rgba(0,0,0,0.6)" }}>
              {candidature.pourquoi}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── CHIP CANDIDAT (zone tampon) ───────────────────────────────────────────────
function CandidatChip({ candidature, isSelected, onClick }: {
  candidature: Candidature;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div onClick={onClick} className="rounded-[14px] px-4 py-3 cursor-pointer transition-all"
      style={{
        background: isSelected ? "rgb(12,50,38)" : "white",
        border: isSelected ? "1px solid rgb(185,151,83)" : "1px solid rgba(0,0,0,0.08)",
        transform: isSelected ? "scale(1.01)" : "scale(1)",
      }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
          style={{
            background: isSelected ? "rgba(185,151,83,0.2)" : "rgb(239,244,239)",
            color: isSelected ? "rgb(185,151,83)" : "rgb(22,92,71)",
          }}>
          {initiales(candidature.prenom, candidature.nom)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate"
            style={{ color: isSelected ? "white" : "rgb(22,92,71)" }}>
            {candidature.prenom} {candidature.nom}
          </p>
          <p className="text-[11px] truncate"
            style={{ color: isSelected ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)" }}>
            {candidature.age} ans · {candidature.ville}
          </p>
        </div>
        <ChevronRight size={14} style={{ color: isSelected ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)", flexShrink: 0 }} />
      </div>
    </div>
  );
}

// ── ÉLÈVE PILL (dans un groupe) ───────────────────────────────────────────────
function ElevePill({ candidature, onClick }: {
  candidature: Candidature;
  onClick: () => void;
}) {
  const j = joursRestants(candidature.place_expire_at);
  return (
    <div onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer transition-all"
      style={{ background: "rgb(248,250,248)", border: "1px solid rgba(0,0,0,0.07)" }}>
      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-semibold flex-shrink-0"
        style={{
          background: candidature.statut === "inscrit"        ? "rgb(239,244,239)"
                    : candidature.statut === "place_proposee"  ? "rgb(254,243,199)"
                    : "rgb(219,234,254)",
          color:     candidature.statut === "inscrit"        ? "rgb(22,92,71)"
                    : candidature.statut === "place_proposee"  ? "rgb(146,64,14)"
                    : "rgb(29,78,216)",
        }}>
        {initiales(candidature.prenom, candidature.nom)}
      </div>
      <span className="text-xs font-medium" style={{ color: "rgba(0,0,0,0.7)" }}>
        {candidature.prenom} {candidature.nom}
      </span>
      {candidature.statut === "place_proposee" && j !== null && (
        <span className="text-[10px] font-semibold" style={{ color: j <= 1 ? "rgb(220,38,38)" : "rgb(186,117,23)" }}>
          J-{j}
        </span>
      )}
      <StatutDot statut={candidature.statut} expireAt={candidature.place_expire_at} />
    </div>
  );
}

// ── CARTE GROUPE ──────────────────────────────────────────────────────────────
function GroupeCard({ groupe, eleves, selectedId, onEleveClick, onAssignerDirect }: {
  groupe: Groupe;
  eleves: Candidature[];
  selectedId: string | null;
  onEleveClick: (c: Candidature) => void;
  onAssignerDirect: (groupeId: string) => void; // ← CORRIGÉ : passe directement l'id du groupe
}) {
  const inscrits  = eleves.filter(e => e.statut === "inscrit").length;
  const proposes  = eleves.filter(e => e.statut === "place_proposee").length;
  const places    = eleves.length;
  const libres    = groupe.places_max - places;
  const pct       = Math.round((places / groupe.places_max) * 100);
  const isComplet = libres <= 0;
  const barColor  = isComplet ? "rgb(220,38,38)" : pct > 80 ? "rgb(186,117,23)" : "rgb(22,92,71)";

  return (
    <div className="rounded-[20px] overflow-hidden"
      style={{ background: "white", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>

      {/* Header vert */}
      <div className="px-5 pt-5 pb-4" style={{ background: "rgb(22,92,71)" }}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: "rgba(255,255,255,0.5)" }}>Groupe</p>
            <p className="text-xl font-semibold text-white mt-0.5">{groupe.nom}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold text-white">
              {places}<span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>/{groupe.places_max}</span>
            </p>
            <p className="text-[10px]" style={{ color: isComplet ? "rgb(252,200,200)" : "rgba(255,255,255,0.45)" }}>
              {isComplet ? "Complet" : `${libres} libre${libres > 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
          <div className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: isComplet ? "rgb(252,165,165)" : "white" }} />
        </div>
        <div className="flex gap-4 mt-2.5">
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>
            <span style={{ color: "rgb(134,239,172)" }}>●</span> {inscrits} inscrits
          </span>
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>
            <span style={{ color: "rgb(253,230,138)" }}>●</span> {proposes} en attente
          </span>
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>
            <span style={{ color: "rgb(147,197,253)" }}>●</span> {places - inscrits - proposes} à proposer
          </span>
        </div>
      </div>

      {/* Liste élèves */}
      <div className="p-4">
        {eleves.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: "rgba(0,0,0,0.3)" }}>
            Aucun élève assigné
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 mb-3">
            {eleves.map(e => (
              <ElevePill key={e.id} candidature={e} onClick={() => onEleveClick(e)} />
            ))}
          </div>
        )}

        {/* Zone d'assignation — CORRIGÉE : appelle onAssignerDirect avec l'id du groupe */}
        {!isComplet ? (
          <button
            onClick={() => selectedId && onAssignerDirect(groupe.id)}
            disabled={!selectedId}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-[12px] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: selectedId ? "rgb(239,244,239)" : "rgb(248,250,248)",
              border: selectedId ? "1px dashed rgb(22,92,71)" : "1px dashed rgba(0,0,0,0.15)",
            }}>
            <div className="w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0"
              style={{ background: selectedId ? "rgba(22,92,71,0.1)" : "rgba(0,0,0,0.04)" }}>
              <Plus size={14} style={{ color: selectedId ? "rgb(22,92,71)" : "rgba(0,0,0,0.25)" }} />
            </div>
            <span className="text-xs font-medium"
              style={{ color: selectedId ? "rgb(22,92,71)" : "rgba(0,0,0,0.35)" }}>
              {selectedId ? "Déposer ici" : "Sélectionne d'abord un candidat"}
            </span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-3 rounded-[12px]"
            style={{ background: "rgba(220,38,38,0.04)", border: "1px solid rgba(220,38,38,0.1)" }}>
            <X size={13} style={{ color: "rgb(220,38,38)", flexShrink: 0 }} />
            <span className="text-xs" style={{ color: "rgba(220,38,38,0.8)" }}>Groupe complet</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── COMPOSANT PRINCIPAL ───────────────────────────────────────────────────────
export default function GroupesClient({
  groupes, aPlacerRaw, placesRaw, parametres,
}: {
  groupes: Groupe[];
  aPlacerRaw: Candidature[];
  placesRaw: Candidature[];
  parametres: Record<string, string>;
}) {
  const router = useRouter();
  const [parcours, setParcours]               = useState("full-artist");
  const [selectedId, setSelectedId]           = useState<string | null>(null);
  const [ficheOuverte, setFicheOuverte]       = useState<Candidature | null>(null);
  const [ficheMode, setFicheMode]             = useState<"aplacer" | "place">("aplacer");
  const [groupePreselectionne, setGroupePreselectionne] = useState("");
  const [loadingAction, setLoadingAction]     = useState<string | null>(null);
  const [toast, setToast]                     = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const closeFiche = () => {
    setFicheOuverte(null);
    setSelectedId(null);
    setGroupePreselectionne("");
  };

  const groupesParcours = groupes.filter(g => g.parcours === parcours);
  const aPlacerParcours = aPlacerRaw.filter(c => c.parcours === parcours);
  const elevesParGroupe = (groupeId: string) =>
    placesRaw.filter(c => c.groupe_inscription_id === groupeId && c.parcours === parcours);

  // Sélectionner un candidat dans la zone tampon
  const handleSelectChip = (c: Candidature) => {
    if (selectedId === c.id) {
      closeFiche();
    } else {
      setSelectedId(c.id);
      setFicheOuverte(c);
      setFicheMode("aplacer");
      setGroupePreselectionne("");
    }
  };

  // Cliquer sur un élève déjà dans un groupe
  const handleEleveClick = (c: Candidature) => {
    setFicheOuverte(c);
    setFicheMode("place");
    setSelectedId(null);
    setGroupePreselectionne("");
  };

  // ← CORRIGÉ : cliquer sur "Déposer ici" dans un groupe pré-sélectionne ce groupe
  const handleAssignerDirect = (groupeId: string) => {
    if (!selectedId) return;
    const candidat = aPlacerParcours.find(c => c.id === selectedId);
    if (!candidat) return;
    setFicheOuverte(candidat);
    setFicheMode("aplacer");
    setGroupePreselectionne(groupeId); // ← le groupe est pré-coché dans la mini fiche
  };

  // API : assigner à un groupe
  const handleAssigner = async (groupeId: string) => {
    if (!ficheOuverte) return;
    setLoadingAction(ficheOuverte.id);
    try {
      const res = await fetch(`/api/direction/candidatures/${ficheOuverte.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "assigner_groupe", groupeId }),
      });
      let data: any = {};
      try { const t = await res.text(); if (t) data = JSON.parse(t); } catch {}
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      showToast(`${ficheOuverte.prenom} assigné(e) au groupe ✓`);
      closeFiche();
      router.refresh();
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setLoadingAction(null);
    }
  };

  // API : changer de groupe
  const handleChangerGroupe = async (groupeId: string) => {
    if (!ficheOuverte) return;
    setLoadingAction(ficheOuverte.id);
    try {
      const res = await fetch(`/api/direction/candidatures/${ficheOuverte.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "assigner_groupe", groupeId }),
      });
      let data: any = {};
      try { const t = await res.text(); if (t) data = JSON.parse(t); } catch {}
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      showToast(`${ficheOuverte.prenom} déplacé(e) vers le nouveau groupe ✓`);
      closeFiche();
      router.refresh();
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setLoadingAction(null);
    }
  };

  // API : retirer du groupe → remet en zone tampon (statut validee, groupe_inscription_id = null)
  const handleRetirerDuGroupe = async () => {
    if (!ficheOuverte) return;
    setLoadingAction(ficheOuverte.id);
    try {
      const res = await fetch(`/api/direction/candidatures/${ficheOuverte.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "retirer_groupe" }),
      });
      let data: any = {};
      try { const t = await res.text(); if (t) data = JSON.parse(t); } catch {}
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      showToast(`${ficheOuverte.prenom} retiré(e) du groupe — retour en zone tampon`);
      closeFiche();
      router.refresh();
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setLoadingAction(null);
    }
  };

  // API : proposer une place → envoie l'email et passe à place_proposee
  const handleProposerPlace = async () => {
    if (!ficheOuverte) return;
    setLoadingAction(ficheOuverte.id);
    try {
      const delaiJours = parseInt(parametres.delai_reponse_candidat_jours ?? "5");
      const res = await fetch(`/api/direction/candidatures/${ficheOuverte.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "proposer_place", delaiJours }),
      });
      let data: any = {};
      try { const t = await res.text(); if (t) data = JSON.parse(t); } catch {}
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      showToast(`Proposition envoyée à ${ficheOuverte.prenom} · ${delaiJours}j pour répondre ✓`);
      closeFiche();
      router.refresh();
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "rgb(239,244,239)" }}>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-[14px] shadow-lg text-sm font-semibold"
          style={{ background: toast.type === "success" ? "rgb(22,92,71)" : "rgb(220,38,38)", color: "white" }}>
          {toast.type === "success" ? <CheckCircle2 size={15} /> : <X size={15} />}
          {toast.msg}
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="px-10 lg:px-14 pb-6" style={{ paddingTop: "calc(88px + 24px)" }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] mb-2"
              style={{ color: "rgb(185,151,83)" }}>Direction · Groupes</p>
            <h1 className="text-3xl font-semibold" style={{ color: "rgb(22,92,71)" }}>
              Composition des groupes
            </h1>
            <p className="text-sm mt-1" style={{ color: "rgba(0,0,0,0.4)" }}>
              Sélectionne un candidat · Dépose dans un groupe · Envoie la proposition manuellement
            </p>
          </div>

          {/* Switch parcours */}
          <div className="flex rounded-full p-1 gap-1" style={{ background: "rgb(22,92,71)" }}>
            {PARCOURS_LIST.map(p => (
              <button key={p.id}
                onClick={() => { setParcours(p.id); closeFiche(); }}
                className="px-5 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  background: parcours === p.id ? "white" : "transparent",
                  color:      parcours === p.id ? "rgb(22,92,71)" : "rgba(255,255,255,0.55)",
                }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mt-6">
          {[
            { label: "À placer",      val: aPlacerParcours.length,                                                                                        color: "rgb(185,151,83)" },
            { label: "Places total",  val: groupesParcours.reduce((a, g) => a + g.places_max, 0),                                                         color: "rgba(0,0,0,0.6)" },
            { label: "Déjà placés",   val: placesRaw.filter(c => c.parcours === parcours).length,                                                         color: "rgb(22,92,71)" },
            { label: "Places libres", val: groupesParcours.reduce((a, g) => a + g.places_max, 0) - placesRaw.filter(c => c.parcours === parcours).length, color: "rgb(24,95,165)" },
          ].map(s => (
            <div key={s.label} className="rounded-[16px] px-5 py-4"
              style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)" }}>
              <p className="text-3xl font-semibold" style={{ color: s.color }}>{s.val}</p>
              <p className="text-xs mt-1" style={{ color: "rgba(0,0,0,0.4)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── LAYOUT PRINCIPAL ── */}
      <div className="px-10 lg:px-14 pb-10">
        <div className="grid gap-6" style={{ gridTemplateColumns: "220px 1fr" }}>

          {/* Zone tampon */}
          <div>
            <div className="rounded-[20px] overflow-hidden sticky top-28"
              style={{ background: "white", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
              <div className="px-4 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: "rgb(239,244,239)" }}>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                    style={{ color: "rgba(0,0,0,0.4)" }}>À placer</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "rgb(185,151,83)", color: "rgb(65,36,2)" }}>
                    {aPlacerParcours.length}
                  </span>
                </div>
                <p className="text-[11px] mt-1.5" style={{ color: "rgba(0,0,0,0.35)" }}>
                  Clique pour sélectionner puis dépose dans un groupe
                </p>
              </div>
              <div className="p-3 space-y-2">
                {aPlacerParcours.length === 0 ? (
                  <div className="py-8 text-center">
                    <CheckCircle2 size={24} className="mx-auto mb-2" style={{ color: "rgba(0,0,0,0.15)" }} />
                    <p className="text-xs" style={{ color: "rgba(0,0,0,0.35)" }}>
                      Tous les candidats<br />sont placés
                    </p>
                  </div>
                ) : (
                  aPlacerParcours.map(c => (
                    <CandidatChip
                      key={c.id}
                      candidature={c}
                      isSelected={selectedId === c.id}
                      onClick={() => handleSelectChip(c)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Groupes */}
          <div className="space-y-5">
            {groupesParcours.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 rounded-[20px]"
                style={{ background: "white", border: "1px solid rgba(0,0,0,0.07)" }}>
                <Users size={32} style={{ color: "rgba(0,0,0,0.15)" }} className="mb-3" />
                <p className="text-sm" style={{ color: "rgba(0,0,0,0.4)" }}>Aucun groupe créé pour ce parcours</p>
              </div>
            ) : (
              groupesParcours.map(g => (
                <GroupeCard
                  key={g.id}
                  groupe={g}
                  eleves={elevesParGroupe(g.id)}
                  selectedId={selectedId}
                  onEleveClick={handleEleveClick}
                  onAssignerDirect={handleAssignerDirect}
                />
              ))
            )}

            {/* Légende */}
            <div className="flex gap-6 flex-wrap px-1">
              {[
                { color: "rgb(99,153,34)",  label: "Inscrit confirmé" },
                { color: "rgb(186,117,23)", label: "Place proposée — en attente de réponse" },
                { color: "rgb(24,95,165)",  label: "Placé — proposition à envoyer" },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: l.color }} />
                  <span className="text-[11px]" style={{ color: "rgba(0,0,0,0.4)" }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mini fiche */}
        {ficheOuverte && (
          <div className="mt-6">
            <MiniFiche
              candidature={ficheOuverte}
              mode={ficheMode}
              groupePreselectionne={groupePreselectionne}
              groupes={groupes}
              parcours={parcours}
              loadingAction={loadingAction}
              onClose={closeFiche}
              onAssigner={handleAssigner}
              onChangerGroupe={handleChangerGroupe}
              onRetirerDuGroupe={handleRetirerDuGroupe}
              onProposerPlace={handleProposerPlace}
            />
          </div>
        )}
      </div>
    </div>
  );
}