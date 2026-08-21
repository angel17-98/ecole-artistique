"use client";
// app/plateforme/inscription/OngletCoursIndividuels.tsx
// v3 — profs en héros, créneaux filtrés, tunnel réservation (séance + annuel, solo + duo)

import Link from "next/link";
import React from "react";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Prof {
  id: string;
  prenom: string;
  nom: string;
  disciplines: string[];
  photo_url?: string | null;
  bio_courte?: string | null;
  tarif_horaire?: number | null;
  tarif_duo?: number | null;
  accepte_duo?: boolean;
  accepte_trio?: boolean;
  accepte_abonnement?: boolean;
}

interface Eleve { id: string; prenom: string; nom: string; }

interface Creneau {
  id: string;
  prof_id: string;
  date_heure_debut: string;
  date_heure_fin: string;
  discipline: string;
  tarif_solo: number;
  tarif_duo?: number | null;
  tarif_trio?: number | null;
  places_max: number;
  places_restantes: number;
  disponible: boolean;
  recurrent?: boolean;
  accepte_abonnement?: boolean;
}

interface CarteFidelite {
  nb_cours_valides: number; // depuis la dernière carte complète
  cours_pour_gratuit: number; // = 10
}

interface Props {
  user: { id: string; email: string } | null;
  profs: Prof[];
  creneaux: Creneau[];
  carteFidelite?: CarteFidelite | null;
  eleves: Eleve[];
  disciplinesADecouvrir: { discipline: string; prochainCreneau: Creneau | null }[];
}

// ─── COULEURS DISCIPLINES ─────────────────────────────────────────────────────
const COLS: Record<string, { bg: string; text: string; border: string }> = {
  "Chant":               { bg: "rgba(22,92,71,0.08)",   text: "rgb(15,75,57)",    border: "rgba(22,92,71,0.2)"   },
  "Coaching vocal":      { bg: "rgba(22,92,71,0.06)",   text: "rgb(15,75,57)",    border: "rgba(22,92,71,0.15)"  },
  "Danse":               { bg: "rgba(185,151,83,0.10)", text: "rgb(110,80,20)",   border: "rgba(185,151,83,0.25)"},
  "Théâtre":             { bg: "rgba(59,130,246,0.08)", text: "rgb(30,64,175)",   border: "rgba(59,130,246,0.2)" },
  "Piano":               { bg: "rgba(147,51,234,0.08)", text: "rgb(88,28,135)",   border: "rgba(147,51,234,0.2)" },
  "Guitare":             { bg: "rgba(239,68,68,0.07)",  text: "rgb(153,27,27)",   border: "rgba(239,68,68,0.18)" },
  "Expression scénique": { bg: "rgba(245,158,11,0.08)", text: "rgb(120,80,0)",    border: "rgba(245,158,11,0.2)" },
  "Studio":              { bg: "rgba(16,16,16,0.06)",   text: "rgba(0,0,0,0.65)", border: "rgba(0,0,0,0.12)"    },
};
const getCol = (d: string) => COLS[d] ?? { bg: "rgba(0,0,0,0.04)", text: "rgba(0,0,0,0.6)", border: "rgba(0,0,0,0.1)" };

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function groupByDay(creneaux: Creneau[]) {
  const map = new Map<string, Creneau[]>();
  for (const c of creneaux) {
    const key = new Date(c.date_heure_debut).toDateString();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(c);
  }
  return Array.from(map.values())
    .map(jour => jour.sort((a, b) => new Date(a.date_heure_debut).getTime() - new Date(b.date_heure_debut).getTime()))
    .sort((a, b) => new Date(a[0].date_heure_debut).getTime() - new Date(b[0].date_heure_debut).getTime());
}

function dureeMin(debut: string, fin: string): number {
  return Math.round((new Date(fin).getTime() - new Date(debut).getTime()) / 60000);
}
function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long" });
}
function formatHeure(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" });
}

const DUREE_COURS_MIN = 45;

function addMinutes(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60000).toISOString();
}

// ─── CARTE FIDÉLITÉ ───────────────────────────────────────────────────────────
function CarteFideliteWidget({ carte }: { carte: CarteFidelite }) {
  const { nb_cours_valides, cours_pour_gratuit } = carte;
  const pct = Math.min(100, Math.round((nb_cours_valides / cours_pour_gratuit) * 100));
  const restants = cours_pour_gratuit - nb_cours_valides;
  const complet = nb_cours_valides >= cours_pour_gratuit;

  return (
    <div className="rounded-[20px] overflow-hidden border border-black/8 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
      <div className="relative px-5 py-4 overflow-hidden" style={{ background: "rgb(18,56,44)" }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(185,151,83,0.15),transparent_55%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(185,151,83,0.4),transparent)]" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-base" style={{ color: "rgb(185,151,83)" }}>✦</span>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/50">Carte fidélité</p>
            </div>
            <p className="text-white font-semibold text-sm">
              {complet
                ? "🎉 1 cours gratuit disponible !"
                : `${restants} cours avant ton prochain gratuit`}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-3xl font-bold text-white tabular-nums">{nb_cours_valides}</p>
            <p className="text-[10px] text-white/35">/ {cours_pour_gratuit}</p>
          </div>
        </div>

        {/* Barre progression */}
        <div className="relative mt-3 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
          <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: complet
                ? "rgb(185,151,83)"
                : "linear-gradient(90deg, rgba(185,151,83,0.6), rgb(185,151,83))",
            }} />
        </div>

        {/* Pastilles */}
        <div className="relative flex justify-between mt-2">
          {Array.from({ length: cours_pour_gratuit }).map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-full border"
              style={{
                background: i < nb_cours_valides ? "rgb(185,151,83)" : "rgba(255,255,255,0.1)",
                borderColor: i < nb_cours_valides ? "rgb(185,151,83)" : "rgba(255,255,255,0.15)",
              }} />
          ))}
        </div>
      </div>

      {complet && (
        <div className="px-5 py-3 bg-white border-t border-black/6">
          <p className="text-xs text-black/50 leading-5">
            Ton prochain cours est <strong className="text-black">offert</strong>. Réserve un créneau — la réduction s'applique automatiquement.
          </p>
        </div>
      )}
    </div>
  );
}

function CarteFideliteCompacte({ carte }: { carte: CarteFidelite }) {
  const { nb_cours_valides, cours_pour_gratuit } = carte;
  const pct = Math.min(100, Math.round((nb_cours_valides / cours_pour_gratuit) * 100));
  const complet = nb_cours_valides >= cours_pour_gratuit;

  return (
    <div className="rounded-[14px] border border-black/8 bg-white px-4 py-2.5 shrink-0" style={{ width: 300 }}>
      <div className="flex items-center gap-2">
        <span className="text-sm shrink-0" style={{ color: "rgb(185,151,83)" }}>✦</span>
        <p className="text-[13px] font-semibold text-black truncate">
          {complet ? "🎉 Cours gratuit !" : "Carte de fidélité"}
        </p>
        <span className="ml-auto text-[10px] font-bold text-black/40 shrink-0">{nb_cours_valides}/{cours_pour_gratuit}</span>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: complet ? "rgb(185,151,83)" : "rgba(22,92,71,0.5)" }} />
      </div>
    </div>
  );
}



// ─── CARTE PROF ───────────────────────────────────────────────────────────────
function CarteProfHero({
  prof, selected, onClick, nbCreneaux,
}: {
  prof: Prof; selected: boolean; onClick: () => void; nbCreneaux: number;
}) {
  return (
    <button onClick={onClick}
      className="w-full text-left rounded-[16px] border-2 transition-all duration-200 flex items-center gap-3 px-3 py-2.5"
      style={{
        borderColor: selected ? "rgb(22,92,71)" : "rgba(0,0,0,0.07)",
        boxShadow:   selected ? "0 0 0 3px rgba(22,92,71,0.08)" : "0 1px 6px rgba(0,0,0,0.04)",
        background:  "white",
      }}>

      {/* Avatar */}
      <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0">
        {prof.photo_url ? (
          <img src={prof.photo_url} alt={`${prof.prenom} ${prof.nom}`}
            className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white"
            style={{ background: "linear-gradient(135deg, rgb(18,56,44), rgb(22,92,71))" }}>
            {prof.prenom[0]}{prof.nom[0]}
          </div>
        )}
        {selected && (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: "rgb(22,92,71)", border: "2px solid white" }}>
            <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Infos */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-black leading-tight truncate">
          {prof.prenom} {prof.nom}
        </p>
        <div className="flex flex-wrap gap-1 mt-1">
          {prof.disciplines.slice(0, 2).map(d => {
            const c = getCol(d);
            return (
              <span key={d} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: c.bg, color: c.text }}>
                {d}
              </span>
            );
          })}
        </div>
      </div>

      {/* Tarif + créneaux */}
      <div className="text-right shrink-0">
        {prof.tarif_horaire && (
          <p className="text-xs font-bold" style={{ color: "rgb(22,92,71)" }}>
            {prof.tarif_horaire} €
          </p>
        )}
        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full inline-block mt-0.5"
          style={{ background: nbCreneaux > 0 ? "rgba(22,92,71,0.08)" : "rgba(0,0,0,0.05)", color: nbCreneaux > 0 ? "rgb(15,75,57)" : "rgba(0,0,0,0.35)" }}>
          {nbCreneaux > 0 ? nbCreneaux : "Complet"}
        </span>
      </div>
    </button>
  );
}

// ─── MODAL CONNEXION ──────────────────────────────────────────────────────────
function ModalConnexion({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-5"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-sm rounded-[28px] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.3)]">
        <div className="relative px-7 py-6 overflow-hidden" style={{ background: "rgb(18,56,44)" }}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(185,151,83,0.15),transparent_55%)]" />
          <div className="relative">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/50 mb-1">Compte requis</p>
            <p className="text-xl font-semibold text-white mb-1">Connecte-toi pour réserver</p>
            <p className="text-sm text-white/50 leading-5">Et débloquer ta carte fidélité — 10 cours = 1 gratuit.</p>
          </div>
        </div>
        <div className="bg-white px-7 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: "✦", label: "Carte fidélité" },
              { icon: "👨‍👩‍👧", label: "Réductions famille" },
              { icon: "📅", label: "Historique cours" },
              { icon: "🔔", label: "Rappels & annulations" },
            ].map(b => (
              <div key={b.label} className="rounded-[12px] px-3 py-2.5 text-xs text-black/60 flex items-center gap-2"
                style={{ background: "rgb(247,249,246)", border: "1px solid rgba(0,0,0,0.06)" }}>
                <span>{b.icon}</span>{b.label}
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/plateforme/login?redirect=/plateforme/inscription?onglet=cours"
              className="w-full text-center rounded-full py-3 text-sm font-semibold !text-white hover:brightness-110 transition"
              style={{ background: "rgb(22,92,71)" }}>
              Se connecter →
            </Link>
            <Link href="/plateforme/register?source=cours-individuels"
              className="w-full text-center rounded-full py-3 text-sm font-medium text-black/55 border border-black/10 hover:bg-black/4 transition">
              Créer un compte
            </Link>
            <button onClick={onClose} className="text-xs text-black/30 hover:text-black/55 transition mt-1 py-1">
              Continuer à parcourir →
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function PlanningHebdo({ creneaux, onReserver, disciplinesDecouverte }: {
  creneaux: Creneau[]; onReserver: (c: Creneau) => void; disciplinesDecouverte: Set<string>;
}) {
    const lundiSemaine = (offset: number) => {
    const d = new Date();
    const jour = d.getDay();
    const diffLundi = jour === 0 ? -6 : 1 - jour;
    d.setDate(d.getDate() + diffLundi + offset * 7);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // Décale automatiquement sur la première semaine qui contient un créneau
  const offsetInitial = useMemo(() => {
    if (creneaux.length === 0) return 0;
    const premiereDate = new Date(Math.min(...creneaux.map(c => new Date(c.date_heure_debut).getTime())));
    const lundiCourant = lundiSemaine(0);
    const diff = Math.floor((premiereDate.getTime() - lundiCourant.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return Math.max(0, diff);
  }, [creneaux]);

  const [semaineOffset, setSemaineOffset] = useState(offsetInitial);
  useEffect(() => { setSemaineOffset(offsetInitial); }, [offsetInitial]);

  const debutSemaine = lundiSemaine(semaineOffset);
  const finSemaine = new Date(debutSemaine.getTime() + 7 * 24 * 60 * 60 * 1000);

  const creneauxSemaine = creneaux.filter(c => {
    const d = new Date(c.date_heure_debut);
    return d >= debutSemaine && d < finSemaine;
  });

  const heures = Array.from(new Set(creneauxSemaine.map(c => {
    const d = new Date(c.date_heure_debut);
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  }))).sort();

  const jours = Array.from({ length: 7 }, (_, i) => new Date(debutSemaine.getTime() + i * 24 * 60 * 60 * 1000));
  const JOURS_LABEL = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  const getCreneau = (jour: Date, heure: string) =>
    creneauxSemaine.find(c => {
      const d = new Date(c.date_heure_debut);
      return d.toDateString() === jour.toDateString() && `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}` === heure;
    });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setSemaineOffset(s => s - 1)} className="text-xs text-black/40 hover:text-black/70 px-2 py-1">← Sem. préc.</button>
        <p className="text-xs font-semibold text-black/50">
          {debutSemaine.toLocaleDateString("fr-BE", { day: "numeric", month: "short" })} — {new Date(finSemaine.getTime() - 86400000).toLocaleDateString("fr-BE", { day: "numeric", month: "short" })}
        </p>
        <button onClick={() => setSemaineOffset(s => s + 1)} className="text-xs text-black/40 hover:text-black/70 px-2 py-1">Sem. suiv. →</button>
      </div>

      {heures.length === 0 ? (
        <p className="text-sm text-black/40 py-6 text-center">Aucun créneau cette semaine.</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="grid gap-1 text-xs" style={{ gridTemplateColumns: "44px repeat(7, minmax(64px,1fr))" }}>
            <div />
            {jours.map((j, i) => (
              <div key={i} className="text-center text-black/40 pb-1">
                {JOURS_LABEL[i]} <span className="text-black/25">{j.getDate()}</span>
              </div>
            ))}
            {heures.map(h => (
              <React.Fragment key={h}>
                <div className="text-black/35 flex items-center">{h}</div>
                {jours.map((j, i) => {
                  const c = getCreneau(j, h);
                  if (!c) return <div key={i} className="h-9 rounded-[6px]" style={{ background: "rgb(249,250,249)" }} />;
                  
                  const enDecouverte = disciplinesDecouverte.has(c.discipline);
                  const prixDecouverte = Math.round(c.tarif_solo / 2);
                  
                  return (
                    <button key={i} onClick={() => onReserver(c)}
                      className="h-9 rounded-[6px] text-[13px] font-semibold flex items-center justify-center transition hover:brightness-95 relative overflow-hidden"
                      style={{
                        background: "rgb(15,75,57)",
                        color: "rgb(202, 219, 214)",
                        boxShadow: enDecouverte ? "inset 0 0 0 2px rgb(185,151,83)" : undefined,
                      }}>
                      {c.accepte_abonnement && (
                        <span className="absolute top-0 right-0"
                          style={{ width: 0, height: 0, borderStyle: "solid", borderWidth: "0 30px 30px 0",
                            borderColor: "transparent rgb(185,151,83) transparent transparent" }} />
                      )}
                      {enDecouverte ? (
                        <span className="flex flex-col items-center leading-[11px]">
                          <span className="text-[9px] line-through opacity-60">{c.tarif_solo}€</span>
                          <span>{prixDecouverte}€</span>
                        </span>
                      ) : (
                        <span>{c.tarif_solo}€</span>
                      )}
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4 mt-3 text-[11px] text-black/45">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-[3px]" style={{ background: "rgb(15,75,57)" }} /> Réservable une fois
        </span>
        <span className="flex items-center gap-1.5">
          <span className="relative w-2.5 h-2.5 rounded-[3px] overflow-hidden" style={{ background: "rgb(15,75,57)" }}>
            <span className="absolute top-0 right-0" style={{ width: 0, height: 0, borderStyle: "solid", borderWidth: "0 10px 10px 0", borderColor: "transparent rgb(185,151,83) transparent transparent" }} />
          </span>
          + réservable à l'année
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-[3px]" style={{ background: "rgb(15,75,57)", boxShadow: "inset 0 0 0 2px rgb(185,151,83)" }} />
          1er cours -50% (découverte)
        </span>
      </div>
    </div>
  );
}

function PitchAbonnementAnnuel({ onEnSavoirPlus }: { onEnSavoirPlus: () => void }) {
  return (
    <div className="rounded-[20px] overflow-hidden border border-black/8 shadow-[0_4px_24px_rgba(22,92,71,0.08)]">
      <div className="relative px-6 py-6 sm:px-8 sm:py-7 overflow-hidden" style={{ background: "rgb(18,56,44)" }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(185,151,83,0.18),transparent_55%)]" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/50">Formule recommandée</span>
              <span className="text-[15px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgb(185,151,83)", color: "rgb(18,56,44)" }}>
                -10%
              </span>
            </div>
            <p className="text-lg sm:text-xl font-semibold text-white leading-snug">
              Réserve à l'année, garde ta place chaque semaine
            </p>
            <p className="text-sm text-white/55 mt-1.5 max-w-3xl">
              Même créneau, même prof, toute l'année — sans avoir à réserver chaque semaine. 10% moins cher qu'à la séance.
            </p>
          </div>
          <button onClick={onEnSavoirPlus}
            className="shrink-0 rounded-full px-6 py-3 text-sm font-semibold hover:brightness-110 transition"
            style={{ background: "rgb(185,151,83)", color: "rgb(18,56,44)" }}>
            Comment ça marche →
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalAbonnementInfo({ onClose }: { onClose: () => void }) {
  const points = [
    { t: "35 séances", d: "Placées sur les 35 prochaines semaines disponibles. Si une date est déjà prise, ton cours est automatiquement décalé d'une semaine." },
    { t: "Horaires modifiables", d: "Tu peux changer l'horaire de ton cours selon les disponibilités du prof, jusqu'à 24h avant la séance." },
    { t: "Absence du prof", d: "Si un cours est annulé pour vacances ou maladie du professeur, un crédit te sera automatiquement octroyé." },
    { t: "Paiement", d: "Une année payée d'avance, en une fois ou trimestriellement." },
  ];
 
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-5"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="w-full sm:max-w-md rounded-t-[28px] sm:rounded-[28px] overflow-hidden bg-white shadow-[0_24px_80px_rgba(0,0,0,0.3)]">
        <div className="relative px-6 py-6 overflow-hidden" style={{ background: "rgb(18,56,44)" }}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(185,151,83,0.2),transparent_55%)]" />
          <div className="relative flex items-start justify-between gap-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">Abonnement annuel</p>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition shrink-0" aria-label="Fermer">✕</button>
          </div>
          <div className="relative flex items-end gap-3 mt-2">
            <p className="text-5xl font-bold tracking-tight" style={{ color: "rgb(185,151,83)" }}>-10%</p>
            <p className="text-sm text-white/60 mb-1.5">sur toutes tes séances, toute l'année</p>
          </div>
          <p className="relative text-sm text-white/70 mt-2">Ta place réservée, chaque semaine, au même horaire.</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          {points.map((item, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: "rgba(185,151,83,0.12)", color: "rgb(110,80,20)" }}>{i + 1}</div>
              <div>
                <p className="text-sm font-semibold text-black">{item.t}</p>
                <p className="text-xs text-black/50 leading-5 mt-0.5">{item.d}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 pb-6">
          <button onClick={onClose}
            className="w-full rounded-full py-3 text-sm font-semibold text-white hover:brightness-110 transition"
            style={{ background: "rgb(22,92,71)" }}>
            J'ai compris
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── TUNNEL RÉSERVATION ───────────────────────────────────────────────────────
function TunnelReservation({
  creneau, prof, user, carteFidelite, eleves, estDecouverte, onClose,
}: {
  creneau: Creneau; prof: Prof; user: { id: string; email: string };
  carteFidelite?: CarteFidelite | null; eleves: Eleve[]; estDecouverte?: boolean; onClose: () => void;
}) {
  const router = useRouter();
  const [etape, setEtape]         = useState<"options" | "recap" | "paiement">("options");
  const [mode, setMode]           = useState<"seance" | "annuel" | null>(null);
  const [participants, setParticipants] = useState<1 | 2 | 3>(1);
  const [eleveId, setEleveId]     = useState<string | null>(eleves[0]?.id ?? null);
  const [loading, setLoading]     = useState(false);
  const [erreur, setErreur]       = useState<string | null>(null);
  const [note, setNote] = useState("");

  const finCours = addMinutes(creneau.date_heure_debut, DUREE_COURS_MIN);
  const duree    = DUREE_COURS_MIN;  
  const coursGratuit = carteFidelite && carteFidelite.nb_cours_valides >= carteFidelite.cours_pour_gratuit;

  const tarif = participants === 3 && creneau.tarif_trio ? creneau.tarif_trio
    : participants === 2 && creneau.tarif_duo ? creneau.tarif_duo
    : creneau.tarif_solo;
  
  const tarifAnnuel = Math.round(tarif * 35 * 0.9);

  // Même règle que côté serveur : la remise "1er cours" ne s'applique jamais à l'abonnement annuel
  const remiseDecouverteApplicable = !!estDecouverte;
  const remiseDecouverteActive = remiseDecouverteApplicable && mode !== "annuel";
  const tarifSeance = remiseDecouverteActive
    ? Math.round(tarif * participants * 0.5 * 100) / 100
    : tarif * participants;

  const handlePayer = async () => {
    if (!eleveId) { setErreur("Sélectionne un élève."); return; }
    setLoading(true);
    setErreur(null);
    try {
      const res = await fetch("/api/reservation/cours-individuel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creneauId: creneau.id, eleveId, participants, mode, note: note.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur lors de la réservation");

      // Cours payant : l'API renvoie l'URL de paiement Mollie au lieu de
      // confirmer directement — redirection complète du navigateur (le
      // checkout Mollie est hébergé, pas un simple appel AJAX).
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      // Cours gratuit (fidélité) : déjà confirmé côté serveur, comme avant.
      onClose();
      router.refresh();
    } catch (e: any) {
      setErreur(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-5"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="w-full sm:max-w-md max-h-[90vh] flex flex-col rounded-t-[28px] sm:rounded-[28px] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.3)]">

        {/* Header */}
        <div className="relative px-6 py-5 overflow-hidden" style={{ background: "rgb(18,56,44)" }}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(185,151,83,0.15),transparent_55%)]" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45 mb-1">
                Réservation · {creneau.discipline}
              </p>
              <p className="text-lg font-semibold text-white leading-tight">
                {prof.prenom} {prof.nom}
              </p>
              <p className="text-sm text-white/55 mt-1">
                {formatDate(creneau.date_heure_debut)} · {formatHeure(creneau.date_heure_debut)} → {formatHeure(finCours)}
                <span className="ml-1.5 text-white/35">· {duree} min</span>
              </p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition shrink-0"
              aria-label="Fermer">✕</button>
          </div>

          {/* Stepper */}
          <div className="relative flex gap-1.5 mt-4">
            {(["options", "recap", "paiement"] as const).map((s, i) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className="h-1 rounded-full transition-all duration-300"
                  style={{
                    width: 32,
                    background: etape === s ? "rgb(185,151,83)"
                      : (["options", "recap", "paiement"].indexOf(etape) > i) ? "rgba(185,151,83,0.5)"
                      : "rgba(255,255,255,0.15)",
                  }} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white px-6 py-5 overflow-y-auto flex-1">

          {/* ── Étape 1 : options ── */}
          {etape === "options" && (
            <div className="space-y-5">

              {remiseDecouverteActive && (
                <div className="rounded-[14px] px-4 py-3 flex items-center gap-3"
                  style={{ background: "rgba(185,151,83,0.08)", border: "1px solid rgba(185,151,83,0.25)" }}>
                  <span className="text-lg shrink-0" style={{ color: "rgb(185,151,83)" }}>✦</span>
                  <p className="text-sm font-semibold" style={{ color: "rgb(110,80,20)" }}>
                    1er cours dans cette discipline : -50% appliqué automatiquement.
                  </p>
                </div>
              )}
              {coursGratuit && !remiseDecouverteActive && (
                <div className="rounded-[14px] px-4 py-3 flex items-center gap-3"
                  style={{ background: "rgba(185,151,83,0.08)", border: "1px solid rgba(185,151,83,0.25)" }}>
                  <span className="text-lg shrink-0" style={{ color: "rgb(185,151,83)" }}>✦</span>
                  <p className="text-sm font-semibold" style={{ color: "rgb(110,80,20)" }}>
                    Ton prochain cours est gratuit ! La réduction s'applique automatiquement.
                  </p>
                </div>
              )}

              {eleves.length === 0 && (
                <div className="rounded-[14px] px-4 py-3 text-sm text-black/60" style={{ background: "rgb(249,250,249)" }}>
                  Ajoute d'abord un élève à ton foyer depuis <Link href="/plateforme/mon-compte" className="underline">ton compte</Link>.
                </div>
              )}

              {eleves.length > 1 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/35 mb-3">Élève</p>
                  <div className="flex flex-wrap gap-2">
                    {eleves.map(e => (
                      <button key={e.id} onClick={() => setEleveId(e.id)}
                        className="rounded-full px-4 py-2 text-sm font-medium border transition"
                        style={{
                          borderColor: eleveId === e.id ? "rgb(22,92,71)" : "rgba(0,0,0,0.1)",
                          background:  eleveId === e.id ? "rgba(22,92,71,0.06)" : "white",
                        }}>
                        {e.prenom}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-black/35 mt-2 leading-4">
                    Ce cours sera enregistré dans le dossier de {eleves.find(e => e.id === eleveId)?.prenom ?? "l'élève sélectionné"} — c'est lui/elle qui apparaîtra dans le suivi, même en duo ou trio.
                  </p>
                </div>
              )}

              {/* Mode séance / annuel */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/35 mb-3">
                  Type de réservation
                </p>
                <div className="space-y-2">
                  <button onClick={() => setMode("seance")}
                    className="w-full text-left rounded-[14px] p-4 border-2 transition"
                    style={{
                      borderColor: mode === "seance" ? "rgb(22,92,71)" : "rgba(0,0,0,0.08)",
                      background: mode === "seance" ? "rgba(22,92,71,0.04)" : "rgb(249,250,249)",
                    }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-black">À la séance</p>
                        <p className="text-xs text-black/45 mt-0.5">
                          {remiseDecouverteApplicable ? "1er cours -50% · Paiement immédiat" : "Ce créneau uniquement · Paiement immédiat"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-base font-bold" style={{ color: "rgb(22,92,71)" }}>
                          {remiseDecouverteApplicable ? Math.round(tarif * 0.5 * 100) / 100 : tarif} €
                        </p>
                        {remiseDecouverteApplicable && (
                          <p className="text-[11px] text-black/35 line-through leading-none mt-0.5">{tarif} €</p>
                        )}
                      </div>
                    </div>
                  </button>

                  {creneau.accepte_abonnement ? (
                    <button onClick={() => setMode("annuel")}
                      className="w-full text-left rounded-[14px] p-4 border-2 transition"
                      style={{
                        borderColor: mode === "annuel" ? "rgb(22,92,71)" : "rgba(185,151,83,0.35)",
                        background: mode === "annuel" ? "rgba(22,92,71,0.04)" : "rgba(185,151,83,0.05)",
                      }}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <p className="text-sm font-semibold text-black">Abonnement annuel</p>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                              style={{ background: "rgba(185,151,83,0.18)", color: "rgb(110,80,20)" }}>
                              Recommandé
                            </span>
                            <span className="text-[13px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: "rgba(77, 92, 22, 0.1)", color: "rgb(54, 75, 15)" }}>
                              −10%
                            </span>
                          </div>
                          <p className="text-xs text-black/45">Même créneau chaque semaine · 35 séances</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-base font-bold" style={{ color: "rgb(22,92,71)" }}>{tarifAnnuel} €</p>
                          <p className="text-[10px] text-black/30">/an</p>
                        </div>
                      </div>
                    </button>
                  ) : (
                    <div className="w-full rounded-[14px] p-4 border border-dashed border-black/10 opacity-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-black/50">Abonnement annuel</p>
                          <p className="text-xs text-black/35 mt-0.5">Non disponible pour ce créneau</p>
                        </div>
                        <span className="text-[10px] text-black/30 border border-black/10 rounded-full px-2.5 py-1">
                          Bientôt
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Participants (si duo/trio possible) */}
              {creneau.places_max >= 2 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/35 mb-3">
                    Nombre de participants
                  </p>
                  <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${creneau.places_max}, 1fr)` }}>
                    {Array.from({ length: creneau.places_max }, (_, i) => (i + 1) as 1 | 2 | 3).map(n => {
                      const t = n === 3 && creneau.tarif_trio ? creneau.tarif_trio
                        : n === 2 && creneau.tarif_duo ? creneau.tarif_duo
                        : creneau.tarif_solo;
                      const sel = participants === n;
                      const label = n === 1 ? "Solo" : n === 2 ? "Duo" : "Trio";

                      const prixAffiche = mode === "annuel"
                        ? Math.round(t * 35 * 0.9)
                        : remiseDecouverteApplicable ? Math.round(t * 0.5 * 100) / 100 : t;
                      const suffixe = mode === "annuel" ? "/an" : "/cours";

                      return (
                        <button key={n} onClick={() => setParticipants(n)}
                          className="rounded-[14px] p-3 border-2 transition text-left"
                          style={{
                            borderColor: sel ? "rgb(22,92,71)" : "rgba(0,0,0,0.08)",
                            background: sel ? "rgba(22,92,71,0.04)" : "rgb(249,250,249)",
                          }}>
                          <p className="text-sm font-semibold text-black mb-0.5">{label}</p>
                          <p className="text-base font-bold" style={{ color: "rgb(22,92,71)" }}>
                            {prixAffiche} €<span className="text-xs font-normal text-black/35 ml-1">{suffixe}</span>
                          </p>
                          {mode !== "annuel" && remiseDecouverteApplicable && (
                            <p className="text-[11px] text-black/35 line-through leading-none">{t} €</p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Note pour le prof */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/35 mb-2">
                  Note pour le prof (optionnel)
                </p>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Ex : premier cours, niveau débutant, objectifs..."
                  rows={2}
                  className="w-full rounded-[12px] border border-black/10 px-3 py-2 text-sm resize-none"
                />
              </div>

              <button
                disabled={!mode || !eleveId}
                onClick={() => setEtape("recap")}
                className="w-full rounded-full py-3.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-30 transition"
                style={{ background: "rgb(22,92,71)" }}>
                Continuer →
              </button>
            </div>
          )}

          {/* ── Étape 2 : récap ── */}
          {etape === "recap" && mode && (
            <div className="space-y-4">
              <p className="text-base font-semibold text-black">Récapitulatif</p>
              <div className="rounded-[16px] overflow-hidden border border-black/8">
                {[
                  { l: "Prof",        v: `${prof.prenom} ${prof.nom}` },
                  { l: "Discipline",  v: creneau.discipline },
                  { l: "Date",        v: formatDate(creneau.date_heure_debut) },
                  { l: "Horaire",     v: `${formatHeure(creneau.date_heure_debut)} → ${formatHeure(finCours)}` },
                  { l: "Durée",       v: `${duree} min` },
                  { l: "Format",      v: mode === "annuel" ? "Abonnement annuel (−10%)" : "À la séance" },
                  { l: "Participants",v: participants === 1 ? "Solo" : "Duo (2 pers.)" },
                  ...(coursGratuit && mode === "seance" && !remiseDecouverteActive
                    ? [{ l: "Cours gratuit", v: "Appliqué ✓", accent: true }]
                    : []
                  ),
                  ...(remiseDecouverteActive
                    ? [{ l: "1er cours · discipline", v: "-50% appliqué ✓", accent: true }]
                    : []
                  ),
                  {
                    l: "Total",
                    v: coursGratuit && mode === "seance" && !remiseDecouverteActive
                      ? "0 € 🎉"
                      : mode === "annuel"
                        ? `${tarifAnnuel} €/an`
                        : `${tarifSeance} €`,
                    accent: true,
                  },
                ].map((row: any, i, arr) => (
                  <div key={i} className="flex justify-between text-sm px-5 py-3"
                    style={{
                      background: row.accent ? "rgba(22,92,71,0.04)" : i % 2 === 0 ? "white" : "rgb(249,250,249)",
                      borderBottom: i < arr.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
                    }}>
                    <span className="text-black/45">{row.l}</span>
                    <span className="font-semibold" style={{ color: row.accent ? "rgb(22,92,71)" : "black" }}>
                      {row.v}
                    </span>
                  </div>
                ))}
              </div>

              {mode === "annuel" && (
                <div className="rounded-[12px] p-4 text-xs text-black/50 leading-5"
                  style={{ background: "rgb(249,250,249)", border: "1px solid rgba(0,0,0,0.07)" }}>
                  <strong className="text-black/65">Engagement annuel.</strong> Annulation possible jusqu'à 7 jours avant le premier cours. Au-delà, l'acompte du premier trimestre reste dû.
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setEtape("options")}
                  className="flex-1 rounded-full py-3 text-sm font-medium text-black/50 border border-black/10 hover:bg-black/4 transition">
                  ← Retour
                </button>
                <button onClick={() => setEtape("paiement")}
                  className="flex-[2] rounded-full py-3 text-sm font-semibold text-white hover:brightness-110 transition"
                  style={{ background: "rgb(22,92,71)" }}>
                  Confirmer →
                </button>
              </div>
            </div>
          )}

          {/* ── Étape 3 : paiement ── */}
          {etape === "paiement" && mode && (
            <div className="space-y-5">
              <p className="text-base font-semibold text-black">Paiement</p>
              <div className="rounded-[20px] py-8 text-center space-y-1"
                style={{ background: "rgba(22,92,71,0.04)", border: "1.5px solid rgba(22,92,71,0.12)" }}>
                <p className="text-5xl font-bold tracking-tight" style={{ color: "rgb(22,92,71)" }}>
                  {coursGratuit && mode === "seance" && !remiseDecouverteActive
                    ? "0 €"
                    : mode === "annuel" ? `${tarifAnnuel} €` : `${tarifSeance} €`}
                </p>
                <p className="text-sm text-black/40">
                  {coursGratuit && mode === "seance" && !remiseDecouverteActive
                    ? "Cours offert · Carte fidélité"
                    : remiseDecouverteActive
                      ? "1er cours -50% · Bancontact"
                      : "Bancontact · Sécurisé par Mollie"}
                </p>
              </div>
              <button onClick={handlePayer} disabled={loading}
                className="w-full rounded-full py-4 text-base font-semibold text-white flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-50 transition"
                style={{ background: "rgb(22,92,71)" }}>
                {loading ? "Redirection…"
                  : coursGratuit && mode === "seance" && !remiseDecouverteActive ? "Confirmer la réservation gratuite →"
                  : `Payer par Bancontact →`}
              </button>
              <button onClick={() => setEtape("recap")}
                className="w-full text-center text-sm text-black/30 hover:text-black/55 transition py-1">
                ← Retour
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function OngletCoursIndividuels({ user, profs, creneaux, carteFidelite, eleves, disciplinesADecouvrir }: Props) {
  const [disc, setDisc] = useState<string | null>(() => {
    const dispo = Array.from(new Set(profs.flatMap(p => p.disciplines))).sort();
    return dispo.includes("Danse") ? "Danse" : dispo[0] ?? null;
  });  const [profId, setProfId] = useState<string | null>(null);
  const [modalConnexion, setModalConnexion] = useState(false);
  const [creneauReserv, setCreneauReserv] = useState<Creneau | null>(null);
  const [showInfoAbonnement, setShowInfoAbonnement] = useState(false);

  const disciplines = Array.from(new Set(profs.flatMap(p => p.disciplines))).sort();

  const disciplinesDisponibles = profId
    ? profs.find(p => p.id === profId)?.disciplines ?? []
    : disciplines;

  const profsDisponibles = disc
    ? profs.filter(p => p.disciplines.includes(disc))
    : profs;

  const creneauxFiltres = creneaux.filter(c =>
    c.disponible && (!profId || c.prof_id === profId) && (!disc || c.discipline === disc)
  );

  const disciplinesDecouverte = useMemo(
    () => new Set(disciplinesADecouvrir.map(d => d.discipline)),
    [disciplinesADecouvrir]
  );

  const handleDisc = (d: string | null) => {
    setDisc(d);
    if (d && profId) {
      const p = profs.find(pr => pr.id === profId);
      if (p && !p.disciplines.includes(d)) setProfId(null);
    }
  };

  const handleProf = (id: string | null) => {
    setProfId(id);
    if (id) {
      const p = profs.find(pr => pr.id === id);
      if (p && disc && !p.disciplines.includes(disc)) setDisc(null);
    }
  };

  const ouvrirReservation = (c: Creneau) => {
    if (!user) { setModalConnexion(true); return; }
    setCreneauReserv(c);
  };

  return (
    <div className="space-y-8">

      {!user && (
        <div className="rounded-[16px] px-5 py-4 flex items-center justify-between gap-4"
          style={{ background: "rgba(22,92,71,0.05)", border: "1px solid rgba(22,92,71,0.1)" }}>
          <div className="flex items-center gap-3">
            <span className="text-lg shrink-0" style={{ color: "rgb(185,151,83)" }}>✦</span>
            <div>
              <p className="text-sm font-semibold text-black">Carte fidélité · 10 cours = 1 gratuit</p>
              <p className="text-xs text-black/45 leading-5 mt-0.5">Connecte-toi pour suivre ta progression et débloquer tes récompenses.</p>
            </div>
          </div>
          <Link href="/plateforme/login?redirect=/plateforme/inscription?onglet=cours"
            className="shrink-0 rounded-full px-4 py-2 text-xs font-semibold !text-white hover:brightness-110 transition"
            style={{ background: "rgb(22,92,71)" }}>
            Se connecter →
          </Link>
        </div>
      )}

      {user && disciplinesADecouvrir.length > 0 && (
        <div>
          <p className="text-base font-semibold text-black mb-1">Découvre une nouvelle discipline</p>
          <p className="text-xs text-black/40 mb-3">Ton premier cours dans ces disciplines est à moitié prix</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {disciplinesADecouvrir
              .filter(d => d.prochainCreneau) // garde-fou côté client, en plus du filtre côté serveur
              .map(d => (
              <div key={d.discipline} className="rounded-[16px] border-2 p-4" style={{ borderColor: "rgba(185,151,83,0.4)" }}>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(185,151,83,0.12)", color: "rgb(110,80,20)" }}>
                  1er cours -50%
                </span>
                <p className="text-sm font-semibold text-black mt-2">{d.discipline}</p>
                <p className="text-xs text-black/45 mt-1">
                  La réduction s'applique automatiquement, quel que soit le créneau choisi
                </p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-sm font-bold" style={{ color: "rgb(22,92,71)" }}>
                    dès {Math.round(d.prochainCreneau!.tarif_solo / 2)} €
                    <span className="text-xs font-normal text-black/35 ml-1 line-through">{d.prochainCreneau!.tarif_solo} €</span>
                  </p>
                  <button
                    onClick={() => {
                      handleDisc(d.discipline);
                      document.getElementById("planning-cours")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110 transition"
                    style={{ background: "rgb(22,92,71)" }}>
                    Choisir mon créneau →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <PitchAbonnementAnnuel onEnSavoirPlus={() => setShowInfoAbonnement(true)} />

      <div>
        <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
          <p className="text-base font-semibold text-black">Réserver un créneau</p>
          {user && carteFidelite && <CarteFideliteCompacte carte={carteFidelite} />}
        </div>

        {/* Discipline (gauche) + Professeur (droite), même ligne à partir de lg */}
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 mb-6 items-start">

          {/* Colonne gauche — Discipline */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wide text-black/35 mb-1">Type de cours</label>
            <select value={disc ?? ""} onChange={e => handleDisc(e.target.value || null)}
              className="w-full rounded-[10px] border border-black/10 px-3 py-2 text-sm bg-white">
              <option value="">Choisir une discipline</option>
              {disciplinesDisponibles.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {(disc || profId) && (
              <button onClick={() => { setDisc(null); setProfId(null); }}
                className="mt-2 text-xs text-black/40 hover:text-black/70 underline underline-offset-2">
                Réinitialiser
              </button>
            )}
          </div>

          {/* Colonne droite — Professeur */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-black/35 mb-2">Professeur</p>
            {profsDisponibles.length === 0 ? (
              <p className="text-sm text-black/40 py-6 text-center rounded-[16px]" style={{ background: "rgb(249,250,249)" }}>
                Aucun professeur pour cette discipline.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {profsDisponibles.map(p => {
                  const nbCreneaux = creneaux.filter(c =>
                    c.disponible && c.prof_id === p.id && (!disc || c.discipline === disc)
                  ).length;
                  return (
                    <CarteProfHero key={p.id} prof={p} selected={profId === p.id}
                      onClick={() => handleProf(profId === p.id ? null : p.id)} nbCreneaux={nbCreneaux} />
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {!disc ? (
          <p className="text-sm text-black/40 py-8 text-center rounded-[16px]" style={{ background: "rgb(249,250,249)" }}>
            Choisis une discipline pour voir le planning.
          </p>
        ) : (
          <PlanningHebdo creneaux={creneauxFiltres} onReserver={ouvrirReservation} disciplinesDecouverte={disciplinesDecouverte} />
        )}
      </div>


      {modalConnexion && <ModalConnexion onClose={() => setModalConnexion(false)} />}
      {showInfoAbonnement && <ModalAbonnementInfo onClose={() => setShowInfoAbonnement(false)} />}
      {creneauReserv && user && (
        <TunnelReservation
          creneau={creneauReserv}
          prof={profs.find(p => p.id === creneauReserv.prof_id)!}
          user={user}
          carteFidelite={carteFidelite}
          eleves={eleves}
          estDecouverte={disciplinesDecouverte.has(creneauReserv.discipline)}
          onClose={() => setCreneauReserv(null)}
        />
      )}
    </div>
  );
}