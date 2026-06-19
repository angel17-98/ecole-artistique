"use client";
// app/plateforme/inscription/OngletEveil.tsx — layout dense avec photo hero

import Link from "next/link";
import { useState } from "react";

const PHOTO = "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&q=80";

interface GroupeEveil {
  id: string; nom: string;
  jour_semaine?: string | null; heure_debut?: string | null; heure_fin?: string | null;
  places_max: number; places_restantes: number; complet: boolean;
}
interface Eleve { id: string; prenom: string; nom: string; date_naissance?: string | null; statut_premium: boolean; }
interface Props { user: { id: string; email: string } | null; eleves: Eleve[]; groupes: GroupeEveil[]; }

function calcAge(d?: string | null) {
  if (!d) return null;
  return Math.floor((Date.now() - new Date(d).getTime()) / (365.25 * 86400000));
}
function formatH(g: GroupeEveil) {
  if (!g.jour_semaine) return "Horaire à définir";
  return [g.jour_semaine, g.heure_debut ? `${g.heure_debut}${g.heure_fin ? ` → ${g.heure_fin}` : ""}` : ""].filter(Boolean).join(" · ");
}

function PlaceBadge({ g }: { g: GroupeEveil }) {
  if (g.complet) return <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-black/6 text-black/40">Complet</span>;
  const u = g.places_restantes <= 2;
  return <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
    style={{ background: u ? "rgba(220,38,38,0.08)" : "rgba(22,92,71,0.08)", color: u ? "rgb(185,28,28)" : "rgb(15,75,57)" }}>
    {g.places_restantes} pl.
  </span>;
}

export default function OngletEveil({ user, eleves, groupes }: Props) {
  const [eleveId, setEleveId] = useState<string | null>(null);
  const [groupeId, setGroupeId] = useState<string | null>(null);
  const [etape, setEtape] = useState<"selection" | "confirm">("selection");
  const [loading, setLoading] = useState(false);

  const eleve = eleves.find(e => e.id === eleveId);
  const groupe = groupes.find(g => g.id === groupeId);

  return (
    <div className="space-y-8">

      {/* ── Hero photo + info côte à côte ── */}
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        {/* Photo */}
        <div className="relative rounded-[20px] overflow-hidden h-56 lg:h-auto">
          <img src={PHOTO} alt="Enfants faisant de l'éveil musical" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,0.65)_100%)]" />
          <div className="absolute bottom-5 left-5 right-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/55 mb-1">Éveil musical · 3 à 8 ans</p>
            <p className="text-xl font-semibold text-white leading-snug">La musique avant les règles</p>
          </div>
        </div>

        {/* Info + groupes */}
        <div className="rounded-[20px] overflow-hidden border border-black/8">
          <div className="px-5 py-4 border-b border-black/6" style={{ background: "rgb(22,92,71)" }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Groupes disponibles</p>
          </div>
          <div className="bg-white">
            {groupes.length === 0 ? (
              <p className="px-5 py-5 text-xs text-black/40 italic">Aucun groupe ouvert pour le moment.</p>
            ) : (
              <div className="divide-y divide-black/5">
                {groupes.map(g => (
                  <div key={g.id} className="flex items-center justify-between px-5 py-3 gap-3">
                    <div>
                      <p className="text-xs font-semibold text-black">{g.nom}</p>
                      <p className="text-[10px] text-black/40 mt-0.5">{formatH(g)}</p>
                    </div>
                    <PlaceBadge g={g} />
                  </div>
                ))}
              </div>
            )}
            <div className="px-5 py-3 border-t border-black/5"
              style={{ background: "rgba(185,151,83,0.04)" }}>
              <p className="text-[10px] text-black/45 leading-4">
                <span style={{ color: "rgb(185,151,83)" }}>◈ </span>
                Conçu pour les <strong className="text-black/60">3 à 8 ans</strong>. Exceptions gérées par la direction.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Non connecté ── */}
      {!user && (
        <div className="rounded-[20px] px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ background: "rgb(22,92,71)" }}>
          <div>
            <p className="text-sm font-semibold text-white">Un compte est nécessaire pour s'inscrire</p>
            <p className="text-xs text-white/50 mt-0.5">Carte fidélité, réductions famille, suivi des cours.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href="/plateforme/login?redirect=/plateforme/inscription?onglet=eveil"
              className="rounded-full px-4 py-2.5 text-xs font-semibold text-white border border-white/20 hover:border-white/40 transition">
              Se connecter
            </Link>
            <Link href="/plateforme/register?source=eveil"
              className="rounded-full px-4 py-2.5 text-xs font-semibold hover:brightness-105 transition"
              style={{ background: "rgb(185,151,83)", color: "white" }}>
              Créer un compte →
            </Link>
          </div>
        </div>
      )}

      {/* ── Connecté — sélection ── */}
      {user && etape === "selection" && (
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Sélection élève */}
          <div className="rounded-[20px] overflow-hidden border border-black/8">
            <div className="px-5 py-3 border-b border-black/6" style={{ background: "rgb(247,249,246)" }}>
              <p className="text-xs font-semibold text-black">Pour quel enfant ?</p>
            </div>
            <div className="bg-white p-3 space-y-2">
              {eleves.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-xs text-black/45 mb-3">Aucun élève dans le foyer.</p>
                  <Link href="/plateforme/dashboard?action=ajouter-eleve"
                    className="text-xs font-semibold" style={{ color: "rgb(22,92,71)" }}>
                    Ajouter un élève →
                  </Link>
                </div>
              ) : eleves.map(e => {
                const a = calcAge(e.date_naissance);
                const sel = eleveId === e.id;
                const hors = a !== null && (a < 3 || a > 8);
                return (
                  <button key={e.id} onClick={() => setEleveId(e.id)}
                    className="w-full text-left rounded-[12px] p-3 transition border-2"
                    style={{
                      background: sel ? "rgba(22,92,71,0.05)" : "rgb(249,250,249)",
                      borderColor: sel ? "rgb(22,92,71)" : "rgba(0,0,0,0.06)",
                    }}>
                    <p className="text-sm font-semibold text-black">{e.prenom} {e.nom}</p>
                    <p className="text-[10px] text-black/40 mt-0.5">
                      {a !== null ? `${a} ans` : "Âge non renseigné"}
                      {hors && <span className="ml-1.5 text-amber-600 font-medium">⚠ Hors tranche</span>}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sélection groupe */}
          <div className="rounded-[20px] overflow-hidden border border-black/8">
            <div className="px-5 py-3 border-b border-black/6" style={{ background: "rgb(247,249,246)" }}>
              <p className="text-xs font-semibold text-black">Choisir un groupe</p>
            </div>
            <div className="bg-white p-3 space-y-2">
              {groupes.length === 0 ? (
                <p className="p-4 text-xs text-black/40 italic">Aucun groupe disponible.</p>
              ) : groupes.map(g => {
                const sel = groupeId === g.id;
                return (
                  <button key={g.id} disabled={g.complet} onClick={() => !g.complet && setGroupeId(g.id)}
                    className="w-full text-left rounded-[12px] p-3 transition border-2 disabled:opacity-40"
                    style={{
                      background: sel ? "rgba(22,92,71,0.05)" : "rgb(249,250,249)",
                      borderColor: sel ? "rgb(22,92,71)" : "rgba(0,0,0,0.06)",
                    }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-semibold text-black">{g.nom}</p>
                        <p className="text-[10px] text-black/40 mt-0.5">{formatH(g)}</p>
                      </div>
                      <PlaceBadge g={g} />
                    </div>
                  </button>
                );
              })}
              {groupes.length > 0 && groupes.every(g => g.complet) && (
                <div className="rounded-[12px] p-3 mt-1" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
                  <p className="text-[10px] font-semibold text-blue-700 mb-1">Tout est complet.</p>
                  <Link href="/contact" className="text-[10px] text-blue-600 underline">Me mettre sur liste d'attente →</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {user && etape === "selection" && (
        <button disabled={!eleveId || !groupeId} onClick={() => setEtape("confirm")}
          className="w-full rounded-full py-3.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-30 transition"
          style={{ background: "rgb(22,92,71)" }}>
          Confirmer la sélection →
        </button>
      )}

      {/* ── Confirmation ── */}
      {user && etape === "confirm" && (
        <div className="rounded-[24px] overflow-hidden border border-black/8">
          <div className="px-6 py-4 sm:px-8" style={{ background: "rgb(22,92,71)" }}>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Récapitulatif · Éveil musical</p>
          </div>
          <div className="bg-white divide-y divide-black/5">
            {[
              { l: "Élève",   v: `${eleve?.prenom} ${eleve?.nom}` },
              { l: "Âge",     v: calcAge(eleve?.date_naissance) !== null ? `${calcAge(eleve?.date_naissance)} ans` : "Non renseigné" },
              { l: "Groupe",  v: groupe?.nom ?? "—" },
              { l: "Horaire", v: groupe ? formatH(groupe) : "—" },
            ].map(row => (
              <div key={row.l} className="flex justify-between px-6 py-3 sm:px-8 text-sm">
                <span className="text-black/45">{row.l}</span>
                <span className="font-semibold text-black">{row.v}</span>
              </div>
            ))}
          </div>
          <div className="bg-white px-6 py-4 sm:px-8 border-t border-black/6 flex gap-3">
            <button onClick={() => setEtape("selection")}
              className="flex-1 rounded-full py-3 text-sm font-medium text-black/55 border border-black/10 hover:bg-black/4 transition">
              ← Retour
            </button>
            <button onClick={() => { setLoading(true); alert("Mollie à brancher ✓"); setLoading(false); }}
              disabled={loading}
              className="flex-[2] rounded-full py-3 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50 transition"
              style={{ background: "rgb(22,92,71)" }}>
              {loading ? "Redirection..." : "Confirmer et payer →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}