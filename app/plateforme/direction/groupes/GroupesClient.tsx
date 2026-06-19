"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, CheckCircle2, X, Send, ArrowLeft, ExternalLink, Users, Calendar, Clock } from "lucide-react";
import AnneeScolaireSelector from "@/app/components/plateforme/AnneeScolaireSelector";

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Groupe {
  id: string;
  nom: string;
  parcours: string;
  places_max: number;
  annee_scolaire: string;
  note?: string | null;
  jour_semaine?: string | null;
  heure_debut?: string | null;
  heure_fin?: string | null;
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
  { id: "eveil-musical",    label: "Éveil musical" },
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

function joursRestants(expireAt?: string | null): number | null {
  if (!expireAt) return null;
  const diff = new Date(expireAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function statutLabel(statut?: string, expireAt?: string | null) {
  const j = joursRestants(expireAt);
  if (statut === "inscrit")
    return { label: "Inscrit", bg: "rgba(22,92,71,0.1)", color: "rgb(22,92,71)", dot: "rgb(99,153,34)" };
  if (statut === "place_proposee")
    return { label: j !== null ? `J-${j}` : "En attente", bg: "rgba(185,151,83,0.12)", color: "rgb(146,95,14)", dot: j !== null && j <= 1 ? "rgb(220,38,38)" : "rgb(186,117,23)" };
  return { label: "À proposer", bg: "rgba(24,95,165,0.08)", color: "rgb(24,95,165)", dot: "rgb(24,95,165)" };
}

function formatHeure(h?: string | null) {
  if (!h) return "";
  return h.slice(0, 5);
}

// ── VUE ÉVEIL MUSICAL ────────────────────────────────────────────────────────
// Vue spécifique éveil : pas de kanban, juste des cartes groupes avec inscrits
function VueEveil({
  groupes,
  inscrits,
  anneeId,
  onCreer,
  onEditer,
  onSupprimer,
}: {
  groupes: Groupe[];
  inscrits: Candidature[];
  anneeId: string;
  onCreer: () => void;
  onEditer: (g: Groupe) => void;
  onSupprimer: (g: { id: string; nom: string }) => void;
}) {
  const groupesEveil = groupes.filter(g => g.parcours === "eveil-musical");
  const inscritsDuGroupe = (groupeId: string) =>
    inscrits.filter(c => c.groupe_inscription_id === groupeId);

  return (
    <div style={{ padding: "0 40px 40px" }}>

      {/* Aucun groupe */}
      {groupesEveil.length === 0 && (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", padding: "80px 0",
          borderRadius: 20, border: "1px dashed rgba(0,0,0,0.12)",
          background: "white",
        }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>🎵</p>
          <p style={{ fontSize: 15, fontWeight: 600, color: "rgba(0,0,0,0.5)", marginBottom: 6 }}>
            Aucun groupe d'éveil ouvert
          </p>
          <p style={{ fontSize: 13, color: "rgba(0,0,0,0.35)", marginBottom: 20 }}>
            Crée un groupe pour qu'il apparaisse sur la page d'inscription.
          </p>
          <button onClick={onCreer} style={{
            padding: "10px 24px", borderRadius: 100, border: "none",
            background: "rgb(22,92,71)", color: "white",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            Créer le premier groupe →
          </button>
        </div>
      )}

      {/* Grille des groupes */}
      {groupesEveil.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 14,
        }}>
          {groupesEveil.map(g => {
            const membres = inscritsDuGroupe(g.id);
            const libres  = g.places_max - membres.length;
            const pct     = Math.round((membres.length / g.places_max) * 100);
            const complet = libres <= 0;
            const aPlanning = g.jour_semaine && g.heure_debut;

            return (
              <div key={g.id} style={{
                background: "white", borderRadius: 20,
                border: "1px solid rgba(0,0,0,0.07)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                overflow: "hidden",
              }}>
                {/* Header */}
                <div style={{
                  padding: "14px 16px 10px",
                  borderBottom: "1px solid rgba(0,0,0,0.05)",
                  background: "rgb(248,250,248)",
                  display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "rgb(8,20,14)", margin: "0 0 4px" }}>
                      {g.nom}
                    </p>
                    {aPlanning ? (
                      <p style={{ fontSize: 12, color: "rgb(22,92,71)", fontWeight: 500, margin: 0 }}>
                        {g.jour_semaine} · {formatHeure(g.heure_debut)}–{formatHeure(g.heure_fin)}
                      </p>
                    ) : (
                      <p style={{ fontSize: 12, color: "rgba(0,0,0,0.35)", fontStyle: "italic", margin: 0 }}>
                        Horaire non défini
                      </p>
                    )}
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    padding: "3px 10px", borderRadius: 100, marginLeft: 8, flexShrink: 0,
                    background: complet ? "rgba(220,38,38,0.08)" : "rgba(22,92,71,0.08)",
                    color: complet ? "rgb(185,28,28)" : "rgb(15,75,57)",
                  }}>
                    {complet ? "Complet" : `${libres} pl. libres`}
                  </span>
                </div>

                {/* Barre remplissage */}
                <div style={{ height: 3, background: "rgba(0,0,0,0.05)" }}>
                  <div style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: complet ? "rgb(220,38,38)" : pct >= 80 ? "rgb(185,151,83)" : "rgb(22,92,71)",
                    transition: "width 0.3s",
                  }} />
                </div>

                {/* Liste inscrits */}
                <div style={{ padding: "10px 16px" }}>
                  <p style={{
                    fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.14em", color: "rgba(0,0,0,0.35)", marginBottom: 8,
                  }}>
                    Inscrits · {membres.length}/{g.places_max}
                  </p>
                  {membres.length === 0 ? (
                    <p style={{ fontSize: 12, color: "rgba(0,0,0,0.3)", fontStyle: "italic", padding: "8px 0" }}>
                      Aucun élève inscrit pour l'instant
                    </p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {membres.map(c => (
                        <div key={c.id} style={{
                          display: "flex", alignItems: "center", gap: 8,
                          padding: "5px 8px", borderRadius: 10,
                          background: "rgb(248,250,248)",
                          border: "1px solid rgba(0,0,0,0.05)",
                        }}>
                          <div style={{
                            width: 24, height: 24, borderRadius: "50%",
                            background: "rgb(22,92,71)", color: "white",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 9, fontWeight: 700, flexShrink: 0,
                          }}>
                            {c.prenom[0]}{c.nom[0]}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: "rgb(8,20,14)", margin: 0 }}>
                              {c.prenom} {c.nom}
                            </p>
                            {c.age && (
                              <p style={{ fontSize: 10, color: "rgba(0,0,0,0.4)", margin: 0 }}>{c.age} ans</p>
                            )}
                          </div>
                          <a href={`/plateforme/direction/candidatures/${c.id}`} style={{
                            fontSize: 10, color: "rgba(0,0,0,0.35)", textDecoration: "none",
                            padding: "3px 8px", borderRadius: 6,
                            border: "1px solid rgba(0,0,0,0.07)", background: "white",
                          }}>
                            Voir →
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer actions */}
                <div style={{
                  display: "flex", gap: 6, padding: "10px 16px",
                  borderTop: "1px solid rgba(0,0,0,0.05)",
                }}>
                  <button onClick={() => onEditer(g)} style={{
                    flex: 1, padding: "7px 0", borderRadius: 100,
                    border: "1px solid rgba(0,0,0,0.1)", background: "white",
                    fontSize: 12, fontWeight: 500, color: "rgba(0,0,0,0.6)", cursor: "pointer",
                  }}>
                    Modifier
                  </button>
                  <button
                    onClick={() => onSupprimer({ id: g.id, nom: g.nom })}
                    disabled={membres.length > 0}
                    title={membres.length > 0 ? "Retire d'abord tous les inscrits" : "Supprimer"}
                    style={{
                      flex: 1, padding: "7px 0", borderRadius: 100,
                      border: "1px solid rgba(220,38,38,0.2)",
                      background: membres.length > 0 ? "rgba(0,0,0,0.03)" : "rgba(220,38,38,0.06)",
                      fontSize: 12, fontWeight: 500,
                      color: membres.length > 0 ? "rgba(0,0,0,0.25)" : "rgb(200,40,40)",
                      cursor: membres.length > 0 ? "not-allowed" : "pointer",
                    }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── NOTE GROUPE ───────────────────────────────────────────────────────────────
function NoteGroupe({ groupeId, noteInitiale }: { groupeId: string; noteInitiale?: string | null }) {
  const [note, setNote]       = useState(noteInitiale ?? "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await fetch(`/api/direction/groupes/${groupeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    finally { setSaving(false); }
  };

  if (editing) {
    return (
      <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "6px 10px" }}>
        <input
          autoFocus value={note}
          onChange={e => setNote(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
          placeholder="Ex: Profils confirmés, mixte chant/danse..."
          style={{ flex: 1, fontSize: 12, padding: "5px 8px", borderRadius: 8, border: "1px solid rgba(22,92,71,0.3)", background: "white", outline: "none", color: "rgba(0,0,0,0.7)" }}
        />
        <button onClick={save} disabled={saving} style={{ padding: "5px 10px", borderRadius: 8, border: "none", background: "rgb(22,92,71)", color: "white", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
          {saving ? "…" : "OK"}
        </button>
        <button onClick={() => setEditing(false)} style={{ padding: "5px 8px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)", background: "white", fontSize: 11, cursor: "pointer", color: "rgba(0,0,0,0.5)" }}>
          ✕
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setEditing(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", width: "100%", textAlign: "left", background: "transparent", border: "none", cursor: "pointer" }}>
      <span style={{ fontSize: 12, color: note ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.3)", fontStyle: note ? "normal" : "italic" }}>
        {saved ? "✓ Enregistré" : note || "Ajouter une note sur ce groupe…"}
      </span>
    </button>
  );
}

// ── PLANNING GROUPE ───────────────────────────────────────────────────────────
function PlanningGroupe({ groupe }: { groupe: Groupe }) {
  const aPlanning = groupe.jour_semaine && groupe.heure_debut;
  return (
    <Link href={`/plateforme/direction/planning?groupe=${groupe.id}`}
      style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", textDecoration: "none" }}>
      <Calendar size={13} style={{ color: aPlanning ? "rgb(22,92,71)" : "rgba(0,0,0,0.25)", flexShrink: 0 }} />
      {aPlanning ? (
        <span style={{ fontSize: 12, color: "rgb(22,92,71)", fontWeight: 500 }}>
          {groupe.jour_semaine} · {formatHeure(groupe.heure_debut)}–{formatHeure(groupe.heure_fin)}
        </span>
      ) : (
        <span style={{ fontSize: 12, color: "rgba(0,0,0,0.35)", fontStyle: "italic" }}>
          Planning à définir
          <span style={{ marginLeft: 6, fontSize: 11, color: "rgb(22,92,71)", fontStyle: "normal", fontWeight: 600 }}>+ Créer</span>
        </span>
      )}
    </Link>
  );
}

// ── MINI FICHE ────────────────────────────────────────────────────────────────
function MiniFiche({ candidature, mode, groupePreselectionne, groupes, parcours, elevesParGroupe, loadingAction, onClose, onAssigner, onChangerGroupe, onRetirerDuGroupe, onProposerPlace }: {
  candidature: Candidature; mode: "aplacer" | "place"; groupePreselectionne: string;
  groupes: Groupe[]; parcours: string; elevesParGroupe: (id: string) => Candidature[];
  loadingAction: string | null; onClose: () => void; onAssigner: (groupeId: string) => void;
  onChangerGroupe: (groupeId: string) => void; onRetirerDuGroupe: () => void; onProposerPlace: () => void;
}) {
  const [groupeChoisi, setGroupeChoisi] = useState(groupePreselectionne);
  const [vuChanger, setVuChanger]       = useState(false);
  const groupesDispo   = groupes.filter(g => g.parcours === parcours);
  const groupeActuelId = candidature.groupe_inscription_id;
  const isLoading      = loadingAction === candidature.id;
  const j              = joursRestants(candidature.place_expire_at);

  return (
    <div style={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: 20, overflow: "hidden", background: "white", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
      <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.07)", background: "rgb(12,50,38)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(185,151,83,0.2)", color: "rgb(185,151,83)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, flexShrink: 0 }}>
            {initiales(candidature.prenom, candidature.nom)}
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 500, color: "white" }}>{candidature.prenom} {candidature.nom}</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{candidature.age} ans · {candidature.ville} · {candidature.email}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Link href={`/plateforme/direction/candidatures/${candidature.id}`} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, padding: "5px 10px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>
            <ExternalLink size={11} /> Fiche complète
          </Link>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)" }}>
            <X size={13} />
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ padding: "16px 18px", borderRight: "1px solid rgba(0,0,0,0.06)" }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(0,0,0,0.35)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>Auto-évaluation</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {DISCIPLINES.map(d => {
              const val = (candidature as any)[d.key] ?? 0;
              return (
                <div key={d.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "rgba(0,0,0,0.5)", width: 64, flexShrink: 0 }}>{d.label}</span>
                  <div style={{ flex: 1, height: 4, borderRadius: 100, background: "rgba(0,0,0,0.07)", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 100, width: `${(val / 5) * 100}%`, background: val >= 4 ? "rgb(22,92,71)" : val >= 3 ? "rgb(185,151,83)" : "rgb(220,38,38)" }} />
                  </div>
                  <span style={{ fontSize: 11, color: "rgba(0,0,0,0.35)", width: 24, textAlign: "right", flexShrink: 0 }}>{val}/5</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ padding: "16px 18px" }}>
          {mode === "aplacer" && (
            <>
              <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(0,0,0,0.35)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>Assigner à un groupe</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                {groupesDispo.map(g => {
                  const places = elevesParGroupe(g.id).length;
                  const libres = g.places_max - places;
                  return (
                    <label key={g.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 12, cursor: libres <= 0 ? "not-allowed" : "pointer", background: groupeChoisi === g.id ? "rgb(239,244,239)" : "rgb(248,250,248)", border: `1px solid ${groupeChoisi === g.id ? "rgba(22,92,71,0.25)" : "rgba(0,0,0,0.07)"}`, opacity: libres <= 0 ? 0.4 : 1 }}>
                      <input type="radio" name="groupe-aplacer" value={g.id} checked={groupeChoisi === g.id} disabled={libres <= 0} onChange={() => setGroupeChoisi(g.id)} />
                      <span style={{ fontSize: 13, color: "rgba(0,0,0,0.75)", flex: 1 }}>{g.nom}</span>
                      <span style={{ fontSize: 11, color: libres <= 0 ? "rgb(220,38,38)" : "rgba(0,0,0,0.35)" }}>{libres <= 0 ? "Complet" : `${libres} libre${libres > 1 ? "s" : ""}`}</span>
                    </label>
                  );
                })}
              </div>
              <button onClick={() => groupeChoisi && onAssigner(groupeChoisi)} disabled={!groupeChoisi || isLoading} style={{ width: "100%", padding: "10px 0", borderRadius: 100, border: "none", cursor: groupeChoisi ? "pointer" : "not-allowed", background: groupeChoisi ? "rgb(22,92,71)" : "rgba(0,0,0,0.06)", color: groupeChoisi ? "white" : "rgba(0,0,0,0.3)", fontSize: 13, fontWeight: 600 }}>
                {isLoading ? "Assignation…" : groupeChoisi ? `Assigner au ${groupesDispo.find(g => g.id === groupeChoisi)?.nom ?? "groupe"}` : "Sélectionne un groupe"}
              </button>
            </>
          )}

          {mode === "place" && !vuChanger && (
            <>
              <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(0,0,0,0.35)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>Actions</p>
              <div style={{ padding: "8px 12px", borderRadius: 12, marginBottom: 12, background: candidature.statut === "inscrit" ? "rgba(22,92,71,0.08)" : candidature.statut === "place_proposee" ? "rgba(185,151,83,0.1)" : "rgba(24,95,165,0.08)", border: `1px solid ${candidature.statut === "inscrit" ? "rgba(22,92,71,0.2)" : candidature.statut === "place_proposee" ? "rgba(185,151,83,0.25)" : "rgba(24,95,165,0.2)"}` }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: candidature.statut === "inscrit" ? "rgb(22,92,71)" : candidature.statut === "place_proposee" ? "rgb(146,95,14)" : "rgb(24,95,165)" }}>
                  {candidature.statut === "inscrit" ? "✓ Inscrit confirmé" : candidature.statut === "place_proposee" ? `Place proposée${j !== null ? ` · ${j === 0 ? "expire aujourd'hui" : `J-${j}`}` : ""}` : "Placé — proposition à envoyer"}
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {candidature.statut !== "place_proposee" && candidature.statut !== "inscrit" && (
                  <button onClick={onProposerPlace} disabled={isLoading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRadius: 100, border: "none", cursor: "pointer", background: "rgb(22,92,71)", color: "white", fontSize: 13, fontWeight: 600 }}>
                    <Send size={13} />{isLoading ? "Envoi…" : "Proposer une place"}
                  </button>
                )}
                {candidature.statut !== "inscrit" && (
                  <button onClick={() => setVuChanger(true)} style={{ padding: "10px 0", borderRadius: 100, border: "1px solid rgba(0,0,0,0.1)", background: "rgb(248,250,248)", color: "rgba(0,0,0,0.65)", fontSize: 13, cursor: "pointer" }}>
                    Changer de groupe
                  </button>
                )}
                {candidature.statut !== "inscrit" && (
                  <button onClick={onRetirerDuGroupe} disabled={isLoading} style={{ padding: "10px 0", borderRadius: 100, border: "1px solid rgba(220,38,38,0.2)", background: "rgba(220,38,38,0.06)", color: "rgb(200,40,40)", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <ArrowLeft size={13} /> Retirer du groupe
                  </button>
                )}
              </div>
            </>
          )}

          {mode === "place" && vuChanger && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <button onClick={() => setVuChanger(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "rgba(0,0,0,0.4)", padding: 0 }}>← Retour</button>
                <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(0,0,0,0.35)", textTransform: "uppercase", letterSpacing: "0.15em" }}>Changer de groupe</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                {groupesDispo.filter(g => g.id !== groupeActuelId).map(g => {
                  const libres = g.places_max - elevesParGroupe(g.id).length;
                  return (
                    <label key={g.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 12, cursor: libres <= 0 ? "not-allowed" : "pointer", background: groupeChoisi === g.id ? "rgb(239,244,239)" : "rgb(248,250,248)", border: `1px solid ${groupeChoisi === g.id ? "rgba(22,92,71,0.25)" : "rgba(0,0,0,0.07)"}`, opacity: libres <= 0 ? 0.4 : 1 }}>
                      <input type="radio" name="groupe-changer" value={g.id} checked={groupeChoisi === g.id} disabled={libres <= 0} onChange={() => setGroupeChoisi(g.id)} />
                      <span style={{ fontSize: 13, color: "rgba(0,0,0,0.75)", flex: 1 }}>{g.nom}</span>
                      <span style={{ fontSize: 11, color: libres <= 0 ? "rgb(220,38,38)" : "rgba(0,0,0,0.35)" }}>{libres <= 0 ? "Complet" : `${libres} libre${libres > 1 ? "s" : ""}`}</span>
                    </label>
                  );
                })}
              </div>
              <button onClick={() => { if (groupeChoisi) { onChangerGroupe(groupeChoisi); setVuChanger(false); } }} disabled={!groupeChoisi || isLoading} style={{ width: "100%", padding: "10px 0", borderRadius: 100, border: "none", background: groupeChoisi ? "rgb(22,92,71)" : "rgba(0,0,0,0.06)", color: groupeChoisi ? "white" : "rgba(0,0,0,0.3)", fontSize: 13, fontWeight: 600, cursor: groupeChoisi ? "pointer" : "not-allowed" }}>
                {isLoading ? "Déplacement…" : "Confirmer le changement"}
              </button>
            </>
          )}
        </div>
      </div>

      {candidature.pourquoi && (
        <div style={{ padding: "12px 18px", borderTop: "1px solid rgba(0,0,0,0.06)", background: "rgb(248,250,248)" }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(0,0,0,0.35)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>Motivation</p>
          <p style={{ fontSize: 12, color: "rgba(0,0,0,0.55)", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {candidature.pourquoi}
          </p>
        </div>
      )}
    </div>
  );
}

// ── CHIP CANDIDAT ─────────────────────────────────────────────────────────────
function CandidatChip({ candidature, isSelected, onClick }: { candidature: Candidature; isSelected: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 12px 7px 8px", borderRadius: 100, cursor: "pointer", background: isSelected ? "rgb(12,50,38)" : "white", border: `1px solid ${isSelected ? "rgb(185,151,83)" : "rgba(0,0,0,0.08)"}`, transition: "all .12s" }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, background: isSelected ? "rgba(185,151,83,0.2)" : "rgb(239,244,239)", color: isSelected ? "rgb(185,151,83)" : "rgb(22,92,71)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 600 }}>
        {initiales(candidature.prenom, candidature.nom)}
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: isSelected ? "white" : "rgb(8,20,14)", whiteSpace: "nowrap" }}>{candidature.prenom} {candidature.nom}</p>
        <p style={{ fontSize: 11, color: isSelected ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)", whiteSpace: "nowrap" }}>{candidature.age} ans · {candidature.ville}</p>
      </div>
    </div>
  );
}

// ── PILL ÉLÈVE ────────────────────────────────────────────────────────────────
function ElevePill({ candidature, onClick }: { candidature: Candidature; onClick: () => void }) {
  const st = statutLabel(candidature.statut, candidature.place_expire_at);
  return (
    <div onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px 5px 6px", borderRadius: 100, border: "1px solid rgba(0,0,0,0.07)", background: "white", cursor: "pointer", margin: 3 }}>
      <div style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, background: st.bg, color: st.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 600 }}>
        {initiales(candidature.prenom, candidature.nom)}
      </div>
      <span style={{ fontSize: 12, color: "rgba(0,0,0,0.7)" }}>{candidature.prenom} {candidature.nom}</span>
      {candidature.statut === "place_proposee" && <span style={{ fontSize: 10, fontWeight: 600, color: st.color }}>{st.label}</span>}
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: st.dot, flexShrink: 0 }} />
    </div>
  );
}

// ── COLONNE GROUPE ────────────────────────────────────────────────────────────
function GroupeColonne({ groupe, eleves, selectedId, onEleveClick, onAssignerDirect, onEditer, onSupprimer }: {
  groupe: Groupe; eleves: Candidature[]; selectedId: string | null;
  onEleveClick: (c: Candidature) => void; onAssignerDirect: (groupeId: string) => void;
  onEditer: () => void; onSupprimer: () => void;
}) {
  const places    = eleves.length;
  const libres    = groupe.places_max - places;
  const pct       = Math.round((places / groupe.places_max) * 100);
  const isComplet = libres <= 0;
  const barColor  = isComplet ? "rgb(220,38,38)" : pct > 80 ? "rgb(186,117,23)" : "rgb(22,92,71)";

  return (
    <div style={{ border: "1px solid rgba(0,0,0,0.07)", borderRadius: 20, overflow: "hidden", background: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px 14px 0", background: "rgb(248,250,248)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: "rgb(8,20,14)" }}>{groupe.nom}</p>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={onEditer} title="Modifier" style={{ padding: "3px 7px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)", background: "white", cursor: "pointer", color: "rgba(0,0,0,0.45)", fontSize: 12 }}>✏</button>
            <button onClick={onSupprimer} title="Supprimer" style={{ padding: "3px 7px", borderRadius: 8, border: "1px solid rgba(220,38,38,0.15)", background: "rgba(220,38,38,0.04)", cursor: "pointer", color: "rgb(220,38,38)", fontSize: 12 }}>🗑</button>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 100, background: isComplet ? "rgba(220,38,38,0.08)" : pct > 80 ? "rgba(186,117,23,0.1)" : "rgba(22,92,71,0.08)", color: isComplet ? "rgb(180,40,40)" : pct > 80 ? "rgb(146,85,14)" : "rgb(22,92,71)" }}>
            {places}/{groupe.places_max}
          </span>
        </div>
        <div style={{ height: 3, borderRadius: 100, background: "rgba(0,0,0,0.07)", overflow: "hidden", marginBottom: 6 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 100, transition: "width .3s" }} />
        </div>
        <p style={{ fontSize: 11, color: "rgba(0,0,0,0.4)", marginBottom: 8 }}>
          {isComplet ? "Complet" : `${libres} place${libres > 1 ? "s" : ""} libre${libres > 1 ? "s" : ""}`}
        </p>
        <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", marginLeft: -14, marginRight: -14 }}>
          <PlanningGroupe groupe={groupe} />
        </div>
        <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", marginLeft: -14, marginRight: -14 }}>
          <NoteGroupe groupeId={groupe.id} noteInitiale={groupe.note} />
        </div>
      </div>
      <div style={{ padding: "10px 8px", minHeight: 64, flex: 1 }}>
        {eleves.length === 0 ? (
          <p style={{ fontSize: 11, color: "rgba(0,0,0,0.3)", textAlign: "center", padding: "14px 0" }}>Aucun élève</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {eleves.map(e => <ElevePill key={e.id} candidature={e} onClick={() => onEleveClick(e)} />)}
          </div>
        )}
      </div>
      <div style={{ padding: "6px 10px 10px" }}>
        {!isComplet ? (
          <button onClick={() => { if (selectedId) onAssignerDirect(groupe.id); }} disabled={!selectedId} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 0", borderRadius: 12, border: selectedId ? "1px dashed rgba(22,92,71,0.4)" : "1px dashed rgba(0,0,0,0.15)", background: selectedId ? "rgb(239,244,239)" : "transparent", color: selectedId ? "rgb(22,92,71)" : "rgba(0,0,0,0.35)", fontSize: 12, fontWeight: selectedId ? 600 : 400, cursor: selectedId ? "pointer" : "not-allowed" }}>
            {selectedId ? "Déposer ici" : "Sélectionne un candidat"}
          </button>
        ) : (
          <div style={{ padding: "8px 0", borderRadius: 12, textAlign: "center", border: "1px solid rgba(220,38,38,0.15)", background: "rgba(220,38,38,0.05)", color: "rgb(200,40,40)", fontSize: 12 }}>
            Groupe complet
          </div>
        )}
      </div>
    </div>
  );
}

// ── MODALE CRÉER / MODIFIER ───────────────────────────────────────────────────
interface AnneeScolaire { id: string; libelle: string; active: boolean; }
const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

function ModaleGroupe({ anneeId, parcours, groupe, onClose, onSaved }: {
  anneeId: string; parcours: string;
  groupe?: { id: string; nom: string; places_max: number; jour_semaine?: string | null; heure_debut?: string | null; heure_fin?: string | null };
  onClose: () => void; onSaved: () => void;
}) {
  const isEdit = !!groupe;
  const [nom, setNom]             = useState(groupe?.nom ?? "");
  const [placesMax, setPlacesMax] = useState(String(groupe?.places_max ?? "12"));
  const [jour, setJour]           = useState(groupe?.jour_semaine ?? "");
  const [debut, setDebut]         = useState(groupe?.heure_debut?.slice(0, 5) ?? "");
  const [fin, setFin]             = useState(groupe?.heure_fin?.slice(0, 5) ?? "");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  // Libellé parcours dans le header de la modale
  const parcoursLabel = parcours === "full-artist" ? "Full Artist"
    : parcours === "comedie-musicale" ? "Comédie Musicale"
    : "Éveil musical";

  const handleSubmit = async () => {
    if (!nom.trim()) { setError("Le nom est obligatoire."); return; }
    if (!placesMax || parseInt(placesMax) < 1) { setError("Places invalides."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/direction/groupes", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit
          ? { id: groupe.id, nom, places_max: placesMax, jour_semaine: jour, heure_debut: debut, heure_fin: fin }
          : { nom, parcours, places_max: placesMax, annee_id: anneeId, jour_semaine: jour, heure_debut: debut, heure_fin: fin }
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      onSaved();
    } catch (e: any) {
      setError(e.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <div style={{ position: "relative", width: "100%", maxWidth: 420, background: "white", borderRadius: 24, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.2)" }}>
        <div style={{ padding: "20px 24px", background: "rgb(12,50,38)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)", margin: "0 0 4px" }}>
              {isEdit ? "Modifier le groupe" : "Nouveau groupe"}
            </p>
            <p style={{ fontSize: 15, fontWeight: 600, color: "white", margin: 0 }}>
              {isEdit ? groupe.nom : `Parcours ${parcoursLabel}`}
            </p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)", background: "transparent", cursor: "pointer", color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(0,0,0,0.5)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Nom du groupe *</label>
            <input value={nom} onChange={e => setNom(e.target.value)} placeholder={parcours === "eveil-musical" ? "ex : Éveil — Mercredi matin" : "ex : Groupe A · Full Artist"} style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.12)", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(0,0,0,0.5)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Places maximum *</label>
            <input type="number" min={1} max={30} value={placesMax} onChange={e => setPlacesMax(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.12)", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(0,0,0,0.5)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Planning (optionnel)</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              <select value={jour} onChange={e => setJour(e.target.value)} style={{ padding: "10px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.12)", fontSize: 13, outline: "none", gridColumn: "1 / -1" }}>
                <option value="">Jour —</option>
                {JOURS.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
              <input type="time" value={debut} onChange={e => setDebut(e.target.value)} style={{ padding: "10px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.12)", fontSize: 13, outline: "none" }} />
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "rgba(0,0,0,0.35)" }}>→</span>
              <input type="time" value={fin} onChange={e => setFin(e.target.value)} style={{ padding: "10px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.12)", fontSize: 13, outline: "none" }} />
            </div>
          </div>
          {error && <p style={{ fontSize: 13, color: "rgb(220,38,38)", padding: "10px 14px", background: "rgba(220,38,38,0.06)", borderRadius: 10, margin: 0 }}>{error}</p>}
          <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: "12px 0", borderRadius: 100, border: "none", background: loading ? "rgba(22,92,71,0.4)" : "rgb(22,92,71)", color: "white", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Enregistrement…" : isEdit ? "Enregistrer les modifications" : "Créer le groupe"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MODALE SUPPRESSION ────────────────────────────────────────────────────────
function ModaleSupprimer({ groupe, onClose, onDeleted }: { groupe: { id: string; nom: string }; onClose: () => void; onDeleted: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleDelete = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/direction/groupes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: groupe.id }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      onDeleted();
    } catch (e: any) { setError(e.message); setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} onClick={onClose} />
      <div style={{ position: "relative", width: "100%", maxWidth: 380, background: "white", borderRadius: 24, padding: 28, boxShadow: "0 24px 80px rgba(0,0,0,0.2)", textAlign: "center" }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(220,38,38,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 22 }}>🗑️</div>
        <h2 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 8px" }}>Supprimer ce groupe ?</h2>
        <p style={{ fontSize: 13, color: "rgba(0,0,0,0.5)", margin: "0 0 6px", lineHeight: 1.6 }}><strong>{groupe.nom}</strong> sera définitivement supprimé.</p>
        <p style={{ fontSize: 12, color: "rgba(0,0,0,0.4)", margin: "0 0 20px", lineHeight: 1.6 }}>Le groupe doit être vide pour pouvoir être supprimé.</p>
        {error && <p style={{ fontSize: 13, color: "rgb(220,38,38)", padding: "10px 14px", background: "rgba(220,38,38,0.06)", borderRadius: 10, marginBottom: 16, textAlign: "left" }}>{error}</p>}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "11px 0", borderRadius: 100, border: "1px solid rgba(0,0,0,0.12)", background: "white", fontSize: 13, fontWeight: 500, cursor: "pointer", color: "rgba(0,0,0,0.6)" }}>Annuler</button>
          <button onClick={handleDelete} disabled={loading} style={{ flex: 1, padding: "11px 0", borderRadius: 100, border: "none", background: loading ? "rgba(220,38,38,0.4)" : "rgb(220,38,38)", color: "white", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Suppression…" : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── BANDEAU PLACES EXPIRÉES ───────────────────────────────────────────────────
const PARCOURS_LABELS_BANDEAU: Record<string, string> = {
  "full-artist": "Full Artist", "comedie-musicale": "Comédie Musicale", "eveil-musical": "Éveil Musical",
};

function BandeauPlacesExpirees({ expirees, loadingId, onLiberer }: { expirees: Candidature[]; loadingId: string | null; onLiberer: (id: string) => void }) {
  if (expirees.length === 0) return null;
  return (
    <div style={{ margin: "0 0 20px", borderRadius: 16, border: "1px solid rgba(220,38,38,0.2)", background: "rgba(254,242,242,0.8)", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", borderBottom: "1px solid rgba(220,38,38,0.12)", background: "rgba(220,38,38,0.06)" }}>
        <span style={{ fontSize: 16 }}>⏰</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "rgb(185,28,28)", margin: 0 }}>{expirees.length} place{expirees.length > 1 ? "s" : ""} expirée{expirees.length > 1 ? "s" : ""} — action requise</p>
          <p style={{ fontSize: 11, color: "rgba(185,28,28,0.7)", margin: "2px 0 0" }}>Ces candidats n'ont pas répondu dans le délai imparti. Libère la place pour la proposer au suivant.</p>
        </div>
      </div>
      <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        {expirees.map(c => {
          const joursDepuis = c.place_expire_at ? Math.floor((Date.now() - new Date(c.place_expire_at).getTime()) / (1000 * 60 * 60 * 24)) : null;
          return (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "white", borderRadius: 12, padding: "10px 14px", border: "1px solid rgba(220,38,38,0.1)" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: "rgba(220,38,38,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "rgb(185,28,28)" }}>
                {c.prenom?.[0]}{c.nom?.[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "rgb(8,20,14)", margin: 0 }}>{c.prenom} {c.nom}</p>
                <p style={{ fontSize: 11, color: "rgba(0,0,0,0.45)", margin: "2px 0 0" }}>
                  {PARCOURS_LABELS_BANDEAU[c.parcours] ?? c.parcours}
                  {joursDepuis !== null && <span style={{ color: "rgb(185,28,28)", fontWeight: 600, marginLeft: 6 }}>· expiré il y a {joursDepuis === 0 ? "aujourd'hui" : `${joursDepuis}j`}</span>}
                </p>
              </div>
              <a href={`/plateforme/direction/candidatures/${c.id}`} style={{ fontSize: 11, color: "rgba(0,0,0,0.4)", textDecoration: "none", padding: "5px 10px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)", background: "rgb(249,248,245)", flexShrink: 0 }}>Voir la fiche →</a>
              <button onClick={() => onLiberer(c.id)} disabled={loadingId === c.id} style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 100, border: "none", background: loadingId === c.id ? "rgba(220,38,38,0.4)" : "rgb(220,38,38)", color: "white", cursor: loadingId === c.id ? "not-allowed" : "pointer", flexShrink: 0, transition: "background 0.15s" }}>
                {loadingId === c.id ? "Libération…" : "Libérer la place"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── COMPOSANT PRINCIPAL ───────────────────────────────────────────────────────
export default function GroupesClient({ groupes, aPlacerRaw, placesRaw, parametres, annees, anneeActiveId }: {
  groupes: Groupe[]; aPlacerRaw: Candidature[]; placesRaw: Candidature[];
  parametres: Record<string, string>; annees: AnneeScolaire[]; anneeActiveId: string;
}) {
  const router = useRouter();
  const [parcours, setParcours]           = useState("full-artist");
  const [selectedId, setSelectedId]       = useState<string | null>(null);
  const [ficheOuverte, setFicheOuverte]   = useState<Candidature | null>(null);
  const [ficheMode, setFicheMode]         = useState<"aplacer" | "place">("aplacer");
  const [groupePresel, setGroupePresel]   = useState("");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [toast, setToast]                 = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [anneeId, setAnneeId]             = useState(anneeActiveId);
  const [showCreer, setShowCreer]         = useState(false);
  const [groupeAEditer, setGroupeAEditer] = useState<Groupe | null>(null);
  const [groupeASuppr, setGroupeASuppr]   = useState<{ id: string; nom: string } | null>(null);
  const [loadingLiberer, setLoadingLiberer] = useState<string | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500);
  };
  const closeFiche = () => { setFicheOuverte(null); setSelectedId(null); setGroupePresel(""); };

  const groupesParcours = groupes.filter(g => g.parcours === parcours);
  const aPlacerParcours = aPlacerRaw.filter(c => c.parcours === parcours);
  const elevesParGroupe = (gId: string) => placesRaw.filter(c => c.groupe_inscription_id === gId && c.parcours === parcours);
  const placesExpirees  = placesRaw.filter(c => c.statut === "place_proposee" && c.place_expire_at && new Date(c.place_expire_at) < new Date());

  const handleSelectChip = (c: Candidature) => {
    if (selectedId === c.id) { closeFiche(); return; }
    setSelectedId(c.id); setFicheOuverte(c); setFicheMode("aplacer"); setGroupePresel("");
  };
  const handleEleveClick = (c: Candidature) => { setFicheOuverte(c); setFicheMode("place"); setSelectedId(null); setGroupePresel(""); };
  const handleAssignerDirect = async (groupeId: string) => {
    if (!selectedId) return;
    const candidat = aPlacerParcours.find(c => c.id === selectedId);
    if (!candidat) return;
    setLoadingAction(selectedId);
    try {
      const res = await fetch(`/api/direction/candidatures/${selectedId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "assigner_groupe", groupeId }) });
      let data: any = {}; try { const t = await res.text(); if (t) data = JSON.parse(t); } catch {}
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      showToast(`${candidat.prenom} assigné(e) au groupe ✓`); closeFiche(); router.refresh();
    } catch (e: any) { showToast(e.message, "error"); } finally { setLoadingAction(null); }
  };
  const callApi = async (id: string, body: object, successMsg: string) => {
    setLoadingAction(id);
    try {
      const res = await fetch(`/api/direction/candidatures/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      let data: any = {}; try { const t = await res.text(); if (t) data = JSON.parse(t); } catch {}
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      showToast(successMsg); closeFiche(); router.refresh();
    } catch (e: any) { showToast(e.message, "error"); } finally { setLoadingAction(null); }
  };
  const handleAssigner       = (gId: string) => callApi(ficheOuverte!.id, { action: "assigner_groupe", groupeId: gId }, `${ficheOuverte!.prenom} assigné(e) ✓`);
  const handleChangerGroupe  = (gId: string) => callApi(ficheOuverte!.id, { action: "assigner_groupe", groupeId: gId }, `${ficheOuverte!.prenom} déplacé(e) ✓`);
  const handleRetirerDuGroupe = () => callApi(ficheOuverte!.id, { action: "retirer_groupe" }, `${ficheOuverte!.prenom} retiré(e) du groupe`);
  const handleProposerPlace  = () => {
    const delaiJours = parseInt(parametres.delai_reponse_candidat_jours ?? "5");
    callApi(ficheOuverte!.id, { action: "proposer_place", delaiJours }, `Proposition envoyée à ${ficheOuverte!.prenom} · ${delaiJours}j ✓`);
  };
  const handleLibererPlace = async (id: string) => {
    setLoadingLiberer(id);
    try {
      const res = await fetch(`/api/direction/candidatures/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "liste_attente" }) });
      let data: any = {}; try { const t = await res.text(); if (t) data = JSON.parse(t); } catch {}
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      showToast("Place libérée — candidat remis en liste d'attente ✓"); router.refresh();
    } catch (e: any) { showToast(e.message, "error"); } finally { setLoadingLiberer(null); }
  };

  // ── Stats selon parcours ─────────────────────────────────────────────────
  const inscritsEveil = placesRaw.filter(c => c.parcours === "eveil-musical");
  const groupesEveil  = groupes.filter(g => g.parcours === "eveil-musical");

  const statsBlocs = parcours === "eveil-musical"
    ? [
        { label: "Groupes ouverts", val: groupesEveil.length },
        { label: "Places total",    val: groupesEveil.reduce((a, g) => a + g.places_max, 0) },
        { label: "Inscrits",        val: inscritsEveil.length },
        { label: "Places libres",   val: groupesEveil.reduce((a, g) => a + g.places_max, 0) - inscritsEveil.length },
      ]
    : [
        { label: "À placer",      val: aPlacerParcours.length },
        { label: "Places total",  val: groupesParcours.reduce((a, g) => a + g.places_max, 0) },
        { label: "Déjà placés",   val: placesRaw.filter(c => c.parcours === parcours).length },
        { label: "Places libres", val: groupesParcours.reduce((a, g) => a + g.places_max, 0) - placesRaw.filter(c => c.parcours === parcours).length },
      ];

  const sousTitre = parcours === "eveil-musical"
    ? "Inscription directe — pas de candidatures à valider"
    : "Sélectionne un candidat · Dépose dans un groupe · Envoie la proposition manuellement";

  // ── Rendu unifié ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: "rgb(239,244,239)" }}>
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-[14px] shadow-lg text-sm font-semibold"
          style={{ background: toast.type === "success" ? "rgb(22,92,71)" : "rgb(220,38,38)", color: "white" }}>
          {toast.type === "success" ? <CheckCircle2 size={15} /> : <X size={15} />}
          {toast.msg}
        </div>
      )}

      {/* ── Header identique pour les 3 parcours ── */}
      <div className="px-10 lg:px-14" style={{ paddingTop: "calc(88px + 24px)", paddingBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgb(185,151,83)", marginBottom: 6 }}>Direction · Groupes</p>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: 30, fontWeight: 600, color: "rgb(8,20,14)", margin: 0 }}>Composition des groupes</h1>
              <AnneeScolaireSelector annees={annees} anneeActiveId={anneeId} onChange={setAnneeId} />
            </div>
            <p style={{ fontSize: 13, color: "rgba(0,0,0,0.45)", marginTop: 6 }}>{sousTitre}</p>
          </div>
          {/* Sélecteur parcours — centré, identique pour les 3 */}
          <div style={{ display: "flex", padding: 4, gap: 2, borderRadius: 100, background: "white", border: "1px solid rgba(0,0,0,0.08)" }}>
            {PARCOURS_LIST.map(p => (
              <button key={p.id} onClick={() => { setParcours(p.id); closeFiche(); }} style={{ padding: "8px 20px", borderRadius: 100, border: "none", background: parcours === p.id ? "rgb(22,92,71)" : "transparent", color: parcours === p.id ? "white" : "rgba(0,0,0,0.5)", fontSize: 13, fontWeight: parcours === p.id ? 600 : 400, cursor: "pointer" }}>
                {p.label}
              </button>
            ))}
          </div>
          {/* Bouton créer — toujours à droite */}
          <button onClick={() => setShowCreer(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 100, border: "none", background: "rgb(22,92,71)", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <Plus size={14} /> Créer un groupe
          </button>
        </div>

        {/* Bandeau expirations — uniquement pour parcours annuels */}
        {parcours !== "eveil-musical" && (
          <BandeauPlacesExpirees expirees={placesExpirees} loadingId={loadingLiberer} onLiberer={handleLibererPlace} />
        )}

        {/* 4 blocs chiffres — labels adaptés selon parcours */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {statsBlocs.map(s => (
            <div key={s.label} style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 16, padding: "14px 18px" }}>
              <p style={{ fontSize: 26, fontWeight: 600, color: "rgb(22,92,71)", margin: 0 }}>{s.val}</p>
              <p style={{ fontSize: 12, color: "rgba(0,0,0,0.45)", marginTop: 3 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Contenu selon parcours ── */}
      {parcours === "eveil-musical" ? (
        <VueEveil
          groupes={groupes}
          inscrits={inscritsEveil}
          anneeId={anneeId}
          onCreer={() => setShowCreer(true)}
          onEditer={g => setGroupeAEditer(g)}
          onSupprimer={g => setGroupeASuppr(g)}
        />
      ) : (
      <div className="px-10 lg:px-14" style={{ paddingBottom: 40 }}>
        <div style={{ background: "white", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 20, overflow: "hidden", marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(0,0,0,0.06)", background: "rgb(248,250,248)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,0,0,0.4)", textTransform: "uppercase", letterSpacing: "0.15em" }}>Candidats à placer</p>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100, background: "rgba(185,151,83,0.15)", color: "rgb(146,95,14)" }}>{aPlacerParcours.length}</span>
            </div>
            <p style={{ fontSize: 11, color: "rgba(0,0,0,0.35)" }}>Clique pour sélectionner · Dépose ensuite dans un groupe</p>
          </div>
          <div style={{ padding: "12px 14px" }}>
            {aPlacerParcours.length === 0 ? (
              <div style={{ padding: "18px 0", textAlign: "center" }}>
                <CheckCircle2 size={20} style={{ color: "rgba(0,0,0,0.2)", margin: "0 auto 8px", display: "block" }} />
                <p style={{ fontSize: 12, color: "rgba(0,0,0,0.35)" }}>Tous les candidats sont placés</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {aPlacerParcours.map(c => <CandidatChip key={c.id} candidature={c} isSelected={selectedId === c.id} onClick={() => handleSelectChip(c)} />)}
              </div>
            )}
          </div>
        </div>

        {groupesParcours.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", borderRadius: 20, border: "1px solid rgba(0,0,0,0.07)", background: "white" }}>
            <Users size={28} style={{ color: "rgba(0,0,0,0.2)", marginBottom: 10 }} />
            <p style={{ fontSize: 13, color: "rgba(0,0,0,0.4)" }}>Aucun groupe créé pour ce parcours</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${groupesParcours.length}, minmax(0, 1fr))`, gap: 12 }}>
            {groupesParcours.map(g => (
              <GroupeColonne key={g.id} groupe={g} eleves={elevesParGroupe(g.id)} selectedId={selectedId}
                onEleveClick={handleEleveClick} onAssignerDirect={handleAssignerDirect}
                onEditer={() => setGroupeAEditer(g)} onSupprimer={() => setGroupeASuppr({ id: g.id, nom: g.nom })} />
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 20, marginTop: 14, flexWrap: "wrap" }}>
          {[{ color: "rgb(99,153,34)", label: "Inscrit confirmé" }, { color: "rgb(186,117,23)", label: "Place proposée — en attente" }, { color: "rgb(24,95,165)", label: "Placé — proposition à envoyer" }].map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: l.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: "rgba(0,0,0,0.45)" }}>{l.label}</span>
            </div>
          ))}
        </div>

        {ficheOuverte && (
          <div style={{ marginTop: 20 }}>
            <MiniFiche candidature={ficheOuverte} mode={ficheMode} groupePreselectionne={groupePresel} groupes={groupes} parcours={parcours} elevesParGroupe={elevesParGroupe} loadingAction={loadingAction} onClose={closeFiche} onAssigner={handleAssigner} onChangerGroupe={handleChangerGroupe} onRetirerDuGroupe={handleRetirerDuGroupe} onProposerPlace={handleProposerPlace} />
          </div>
        )}
      </div>

      )}

      {showCreer && <ModaleGroupe anneeId={anneeId} parcours={parcours} onClose={() => setShowCreer(false)} onSaved={() => { setShowCreer(false); router.refresh(); }} />}
      {groupeAEditer && <ModaleGroupe anneeId={anneeId} parcours={parcours} groupe={groupeAEditer} onClose={() => setGroupeAEditer(null)} onSaved={() => { setGroupeAEditer(null); router.refresh(); }} />}
      {groupeASuppr && <ModaleSupprimer groupe={groupeASuppr} onClose={() => setGroupeASuppr(null)} onDeleted={() => { setGroupeASuppr(null); router.refresh(); }} />}
    </div>
  );
}