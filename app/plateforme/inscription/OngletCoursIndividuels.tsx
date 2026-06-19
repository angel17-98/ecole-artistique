"use client";
// app/plateforme/inscription/OngletCoursIndividuels.tsx — layout dense avec photo

import Link from "next/link";
import { useState } from "react";

const PHOTO = "https://images.unsplash.com/photo-1543428529-6a2e6b1b4b1f?w=1200&q=80";

interface Prof { id: string; prenom: string; nom: string; disciplines: string[]; photo_url?: string | null; tarif_horaire?: number | null; }
interface Creneau { id: string; prof_id: string; date_heure_debut: string; date_heure_fin: string; discipline: string; tarif: number; disponible: boolean; }
interface Props { user: { id: string; email: string } | null; profs: Prof[]; creneaux: Creneau[]; }

const COLS: Record<string, { bg: string; text: string; border: string }> = {
  "Chant":               { bg: "rgba(22,92,71,0.08)",   text: "rgb(15,75,57)",   border: "rgba(22,92,71,0.2)" },
  "Coaching vocal":      { bg: "rgba(22,92,71,0.06)",   text: "rgb(15,75,57)",   border: "rgba(22,92,71,0.15)" },
  "Danse":               { bg: "rgba(185,151,83,0.10)", text: "rgb(110,80,20)",  border: "rgba(185,151,83,0.25)" },
  "Théâtre":             { bg: "rgba(59,130,246,0.08)", text: "rgb(30,64,175)",  border: "rgba(59,130,246,0.2)" },
  "Piano":               { bg: "rgba(147,51,234,0.08)", text: "rgb(88,28,135)",  border: "rgba(147,51,234,0.2)" },
  "Guitare":             { bg: "rgba(239,68,68,0.07)",  text: "rgb(153,27,27)",  border: "rgba(239,68,68,0.18)" },
  "Expression scénique": { bg: "rgba(245,158,11,0.08)", text: "rgb(120,80,0)",   border: "rgba(245,158,11,0.2)" },
  "Studio":              { bg: "rgba(16,16,16,0.06)",   text: "rgba(0,0,0,0.65)",border: "rgba(0,0,0,0.12)" },
};
const getCol = (d: string) => COLS[d] ?? { bg: "rgba(0,0,0,0.04)", text: "rgba(0,0,0,0.6)", border: "rgba(0,0,0,0.1)" };

function ModalConnexion({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-sm rounded-[28px] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.3)]">
        <div className="px-7 py-5" style={{ background: "rgb(22,92,71)" }}>
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/50 mb-1">Compte requis</p>
          <p className="text-lg font-semibold text-white">Connecte-toi pour réserver</p>
        </div>
        <div className="bg-white px-7 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {["🎴 Carte fidélité", "👨‍👩‍👧 Réductions famille", "📅 Historique", "🔔 Rappels"].map(b => (
              <div key={b} className="rounded-[12px] px-3 py-2.5 text-xs text-black/60"
                style={{ background: "rgb(247,249,246)", border: "1px solid rgba(0,0,0,0.06)" }}>
                {b}
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/plateforme/login?redirect=/plateforme/inscription?onglet=cours"
              className="w-full text-center rounded-full py-3 text-sm font-semibold text-white hover:brightness-110 transition"
              style={{ background: "rgb(22,92,71)" }}>
              Se connecter →
            </Link>
            <Link href="/plateforme/register?source=cours-individuels"
              className="w-full text-center rounded-full py-3 text-sm font-medium text-black/55 border border-black/10 hover:bg-black/4 transition">
              Créer un compte
            </Link>
            <button onClick={onClose} className="text-xs text-black/30 hover:text-black/55 transition mt-1">
              Continuer à parcourir →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OngletCoursIndividuels({ user, profs, creneaux }: Props) {
  const [disc, setDisc] = useState<string | null>(null);
  const [profId, setProfId] = useState<string | null>(null);
  const [modal, setModal] = useState(false);

  const disciplines = Array.from(new Set(profs.flatMap(p => p.disciplines))).sort();
  const profsFiltres = profs.filter(p => !disc || p.disciplines.includes(disc));
  const creneauxFiltres = creneaux.filter(c => {
    if (disc && c.discipline !== disc) return false;
    if (profId && c.prof_id !== profId) return false;
    return c.disponible;
  });

  return (
    <>
      {modal && <ModalConnexion onClose={() => setModal(false)} />}
      <div className="space-y-8">

        {/* ── Hero photo + intro ── */}
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="relative rounded-[20px] overflow-hidden h-52 lg:h-auto">
            <img src={PHOTO} alt="Cours individuel de chant" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(0,0,0,0.68)_100%)]" />
            <div className="absolute bottom-5 left-5 right-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-1">À la séance · Sur mesure</p>
              <p className="text-xl font-semibold text-white">Cours avec un intervenant validé</p>
            </div>
          </div>

          <div className="rounded-[20px] overflow-hidden border border-black/8">
            <div className="px-5 py-3 border-b border-black/6" style={{ background: "rgb(22,92,71)" }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Comment ça marche</p>
            </div>
            <div className="bg-white divide-y divide-black/5">
              {[
                { n: "01", t: "Filtre", d: "Choisis ta discipline et ton intervenant." },
                { n: "02", t: "Réserve", d: "Sélectionne un créneau disponible." },
                { n: "03", t: "Paye", d: "Paiement en ligne sécurisé par Mollie." },
                { n: "04", t: "Viens", d: "La salle est prête, l'intervenant t'attend." },
              ].map(s => (
                <div key={s.n} className="flex gap-3 px-4 py-2.5">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 mt-0.5"
                    style={{ background: "rgb(22,92,71)" }}>{s.n}</span>
                  <div>
                    <p className="text-xs font-semibold text-black">{s.t}</p>
                    <p className="text-[10px] text-black/40">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
            {!user && (
              <div className="bg-white px-4 py-3 border-t border-black/6">
                <button onClick={() => setModal(true)}
                  className="w-full rounded-full py-2 text-xs font-semibold text-white hover:brightness-110 transition"
                  style={{ background: "rgb(22,92,71)" }}>
                  Se connecter pour réserver →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Filtres ── */}
        {disciplines.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/35 mb-3">Discipline</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { setDisc(null); setProfId(null); }}
                className="rounded-full px-4 py-1.5 text-xs font-semibold transition"
                style={{
                  background: !disc ? "rgb(22,92,71)" : "rgba(255,255,255,0.8)",
                  color: !disc ? "white" : "rgba(0,0,0,0.55)",
                  border: !disc ? "none" : "1px solid rgba(0,0,0,0.1)",
                }}>
                Toutes
              </button>
              {disciplines.map(d => {
                const c = getCol(d); const act = disc === d;
                return <button key={d} onClick={() => { setDisc(act ? null : d); setProfId(null); }}
                  className="rounded-full px-4 py-1.5 text-xs font-semibold transition border"
                  style={{
                    background: act ? c.bg : "rgba(255,255,255,0.8)",
                    color: act ? c.text : "rgba(0,0,0,0.55)",
                    borderColor: act ? c.border : "rgba(0,0,0,0.08)",
                  }}>{d}</button>;
              })}
            </div>
          </div>
        )}

        {/* ── Profs ── */}
        {profsFiltres.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/35 mb-3">Intervenants</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {profsFiltres.map(p => {
                const sel = profId === p.id;
                return (
                  <button key={p.id} onClick={() => setProfId(sel ? null : p.id)}
                    className="text-left rounded-[16px] p-4 transition border-2"
                    style={{
                      background: sel ? "rgba(22,92,71,0.05)" : "white",
                      borderColor: sel ? "rgb(22,92,71)" : "rgba(0,0,0,0.08)",
                    }}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                        style={{ background: "rgb(22,92,71)" }}>
                        {p.prenom[0]}{p.nom[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-black truncate">{p.prenom} {p.nom}</p>
                        {p.tarif_horaire && <p className="text-[10px] text-black/40">{p.tarif_horaire} €/h</p>}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {p.disciplines.slice(0, 2).map(d => {
                        const c = getCol(d);
                        return <span key={d} className="text-[9px] px-2 py-0.5 rounded-full border"
                          style={{ background: c.bg, color: c.text, borderColor: c.border }}>{d}</span>;
                      })}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Créneaux ── */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/35 mb-3">
            Créneaux
            {creneauxFiltres.length > 0 && <span className="ml-1.5 font-normal text-black/20">({creneauxFiltres.length})</span>}
          </p>

          {creneaux.length === 0 && (
            <div className="rounded-[20px] p-10 text-center border-2 border-dashed border-black/8">
              <p className="text-2xl mb-3">🎵</p>
              <p className="text-sm font-semibold text-black/50 mb-1">Créneaux à venir</p>
              <p className="text-xs text-black/35 leading-5 max-w-xs mx-auto mb-4">
                Les intervenants publient leurs disponibilités. Reviens bientôt.
              </p>
              {!user && (
                <button onClick={() => setModal(true)}
                  className="inline-flex rounded-full px-5 py-2.5 text-xs font-semibold text-white hover:brightness-110 transition"
                  style={{ background: "rgb(22,92,71)" }}>
                  Me faire notifier →
                </button>
              )}
            </div>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            {creneauxFiltres.map(c => {
              const prof = profs.find(p => p.id === c.prof_id);
              const col = getCol(c.discipline);
              const d = new Date(c.date_heure_debut);
              const f = new Date(c.date_heure_fin);
              return (
                <div key={c.id} className="rounded-[14px] p-4 flex items-center justify-between gap-3 border border-black/8 bg-white">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[10px] font-semibold px-2 py-1 rounded-full border shrink-0"
                      style={{ background: col.bg, color: col.text, borderColor: col.border }}>
                      {c.discipline}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-black truncate">
                        {d.toLocaleDateString("fr-BE", { weekday: "short", day: "numeric", month: "short" })}
                      </p>
                      <p className="text-[10px] text-black/40 mt-0.5">
                        {d.toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" })} → {f.toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" })}
                        {prof && ` · ${prof.prenom}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <p className="text-xs font-bold text-black">{c.tarif} €</p>
                    <button onClick={() => !user ? setModal(true) : alert("Flux 4")}
                      className="rounded-full px-3 py-1.5 text-[10px] font-semibold text-white hover:brightness-110 transition"
                      style={{ background: "rgb(22,92,71)" }}>
                      Réserver
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carte fidélité + CTA intervenant côte à côte */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[16px] p-4 flex items-center gap-3 border border-black/8"
            style={{ background: "rgba(185,151,83,0.06)" }}>
            <span className="text-xl">🎴</span>
            <div>
              <p className="text-xs font-semibold text-black">Carte fidélité</p>
              <p className="text-[10px] text-black/45 mt-0.5">10 cours = 1 offert automatiquement.</p>
            </div>
          </div>
          <div className="rounded-[16px] p-4 flex items-center justify-between gap-3 border border-black/8 bg-white">
            <div>
              <p className="text-xs font-semibold text-black">Tu es intervenant ?</p>
              <p className="text-[10px] text-black/45 mt-0.5">Rejoins le réseau Crea'Star.</p>
            </div>
            <Link href="/cours/cours-individuels"
              className="rounded-full px-3 py-1.5 text-[10px] font-semibold text-white hover:brightness-110 shrink-0"
              style={{ background: "rgb(22,92,71)" }}>
              En savoir plus →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}