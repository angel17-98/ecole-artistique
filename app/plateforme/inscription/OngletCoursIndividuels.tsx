// "use client";
// // app/plateforme/inscription/OngletCoursIndividuels.tsx — layout dense avec photo

// import Link from "next/link";
// import { useState } from "react";

// const PHOTO = "https://images.unsplash.com/photo-1543428529-6a2e6b1b4b1f?w=1200&q=80";

// interface Prof { id: string; prenom: string; nom: string; disciplines: string[]; photo_url?: string | null; tarif_horaire?: number | null; }
// interface Creneau { id: string; prof_id: string; date_heure_debut: string; date_heure_fin: string; discipline: string; tarif: number; disponible: boolean; }
// interface Props { user: { id: string; email: string } | null; profs: Prof[]; creneaux: Creneau[]; }

// const COLS: Record<string, { bg: string; text: string; border: string }> = {
//   "Chant":               { bg: "rgba(22,92,71,0.08)",   text: "rgb(15,75,57)",   border: "rgba(22,92,71,0.2)" },
//   "Coaching vocal":      { bg: "rgba(22,92,71,0.06)",   text: "rgb(15,75,57)",   border: "rgba(22,92,71,0.15)" },
//   "Danse":               { bg: "rgba(185,151,83,0.10)", text: "rgb(110,80,20)",  border: "rgba(185,151,83,0.25)" },
//   "Théâtre":             { bg: "rgba(59,130,246,0.08)", text: "rgb(30,64,175)",  border: "rgba(59,130,246,0.2)" },
//   "Piano":               { bg: "rgba(147,51,234,0.08)", text: "rgb(88,28,135)",  border: "rgba(147,51,234,0.2)" },
//   "Guitare":             { bg: "rgba(239,68,68,0.07)",  text: "rgb(153,27,27)",  border: "rgba(239,68,68,0.18)" },
//   "Expression scénique": { bg: "rgba(245,158,11,0.08)", text: "rgb(120,80,0)",   border: "rgba(245,158,11,0.2)" },
//   "Studio":              { bg: "rgba(16,16,16,0.06)",   text: "rgba(0,0,0,0.65)",border: "rgba(0,0,0,0.12)" },
// };
// const getCol = (d: string) => COLS[d] ?? { bg: "rgba(0,0,0,0.04)", text: "rgba(0,0,0,0.6)", border: "rgba(0,0,0,0.1)" };

// function ModalConnexion({ onClose }: { onClose: () => void }) {
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-5"
//       style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
//       <div className="w-full max-w-sm rounded-[28px] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.3)]">
//         <div className="px-7 py-5" style={{ background: "rgb(22,92,71)" }}>
//           <p className="text-[10px] uppercase tracking-[0.22em] text-white/50 mb-1">Compte requis</p>
//           <p className="text-lg font-semibold text-white">Connecte-toi pour réserver</p>
//         </div>
//         <div className="bg-white px-7 py-5 space-y-4">
//           <div className="grid grid-cols-2 gap-2">
//             {["🎴 Carte fidélité", "👨‍👩‍👧 Réductions famille", "📅 Historique", "🔔 Rappels"].map(b => (
//               <div key={b} className="rounded-[12px] px-3 py-2.5 text-xs text-black/60"
//                 style={{ background: "rgb(247,249,246)", border: "1px solid rgba(0,0,0,0.06)" }}>
//                 {b}
//               </div>
//             ))}
//           </div>
//           <div className="flex flex-col gap-2">
//             <Link href="/plateforme/login?redirect=/plateforme/inscription?onglet=cours"
//               className="w-full text-center rounded-full py-3 text-sm font-semibold text-white hover:brightness-110 transition"
//               style={{ background: "rgb(22,92,71)" }}>
//               Se connecter →
//             </Link>
//             <Link href="/plateforme/register?source=cours-individuels"
//               className="w-full text-center rounded-full py-3 text-sm font-medium text-black/55 border border-black/10 hover:bg-black/4 transition">
//               Créer un compte
//             </Link>
//             <button onClick={onClose} className="text-xs text-black/30 hover:text-black/55 transition mt-1">
//               Continuer à parcourir →
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function OngletCoursIndividuels({ user, profs, creneaux }: Props) {
//   const [disc, setDisc] = useState<string | null>(null);
//   const [profId, setProfId] = useState<string | null>(null);
//   const [modal, setModal] = useState(false);

//   const disciplines = Array.from(new Set(profs.flatMap(p => p.disciplines))).sort();
//   const profsFiltres = profs.filter(p => !disc || p.disciplines.includes(disc));
//   const creneauxFiltres = creneaux.filter(c => {
//     if (disc && c.discipline !== disc) return false;
//     if (profId && c.prof_id !== profId) return false;
//     return c.disponible;
//   });

//   return (
//     <>
//       {modal && <ModalConnexion onClose={() => setModal(false)} />}
//       <div className="space-y-8">

//         {/* ── Hero photo + intro ── */}
//         <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
//           <div className="relative rounded-[20px] overflow-hidden h-52 lg:h-auto">
//             <img src={PHOTO} alt="Cours individuel de chant" className="w-full h-full object-cover" />
//             <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(0,0,0,0.68)_100%)]" />
//             <div className="absolute bottom-5 left-5 right-5">
//               <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-1">À la séance · Sur mesure</p>
//               <p className="text-xl font-semibold text-white">Cours avec un intervenant validé</p>
//             </div>
//           </div>

//           <div className="rounded-[20px] overflow-hidden border border-black/8">
//             <div className="px-5 py-3 border-b border-black/6" style={{ background: "rgb(22,92,71)" }}>
//               <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Comment ça marche</p>
//             </div>
//             <div className="bg-white divide-y divide-black/5">
//               {[
//                 { n: "01", t: "Filtre", d: "Choisis ta discipline et ton intervenant." },
//                 { n: "02", t: "Réserve", d: "Sélectionne un créneau disponible." },
//                 { n: "03", t: "Paye", d: "Paiement en ligne sécurisé par Mollie." },
//                 { n: "04", t: "Viens", d: "La salle est prête, l'intervenant t'attend." },
//               ].map(s => (
//                 <div key={s.n} className="flex gap-3 px-4 py-2.5">
//                   <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 mt-0.5"
//                     style={{ background: "rgb(22,92,71)" }}>{s.n}</span>
//                   <div>
//                     <p className="text-xs font-semibold text-black">{s.t}</p>
//                     <p className="text-[10px] text-black/40">{s.d}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             {!user && (
//               <div className="bg-white px-4 py-3 border-t border-black/6">
//                 <button onClick={() => setModal(true)}
//                   className="w-full rounded-full py-2 text-xs font-semibold text-white hover:brightness-110 transition"
//                   style={{ background: "rgb(22,92,71)" }}>
//                   Se connecter pour réserver →
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* ── Filtres ── */}
//         {disciplines.length > 0 && (
//           <div>
//             <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/35 mb-3">Discipline</p>
//             <div className="flex flex-wrap gap-2">
//               <button onClick={() => { setDisc(null); setProfId(null); }}
//                 className="rounded-full px-4 py-1.5 text-xs font-semibold transition"
//                 style={{
//                   background: !disc ? "rgb(22,92,71)" : "rgba(255,255,255,0.8)",
//                   color: !disc ? "white" : "rgba(0,0,0,0.55)",
//                   border: !disc ? "none" : "1px solid rgba(0,0,0,0.1)",
//                 }}>
//                 Toutes
//               </button>
//               {disciplines.map(d => {
//                 const c = getCol(d); const act = disc === d;
//                 return <button key={d} onClick={() => { setDisc(act ? null : d); setProfId(null); }}
//                   className="rounded-full px-4 py-1.5 text-xs font-semibold transition border"
//                   style={{
//                     background: act ? c.bg : "rgba(255,255,255,0.8)",
//                     color: act ? c.text : "rgba(0,0,0,0.55)",
//                     borderColor: act ? c.border : "rgba(0,0,0,0.08)",
//                   }}>{d}</button>;
//               })}
//             </div>
//           </div>
//         )}

//         {/* ── Profs ── */}
//         {profsFiltres.length > 0 && (
//           <div>
//             <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/35 mb-3">Intervenants</p>
//             <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
//               {profsFiltres.map(p => {
//                 const sel = profId === p.id;
//                 return (
//                   <button key={p.id} onClick={() => setProfId(sel ? null : p.id)}
//                     className="text-left rounded-[16px] p-4 transition border-2"
//                     style={{
//                       background: sel ? "rgba(22,92,71,0.05)" : "white",
//                       borderColor: sel ? "rgb(22,92,71)" : "rgba(0,0,0,0.08)",
//                     }}>
//                     <div className="flex items-center gap-3 mb-2">
//                       <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
//                         style={{ background: "rgb(22,92,71)" }}>
//                         {p.prenom[0]}{p.nom[0]}
//                       </div>
//                       <div className="min-w-0 flex-1">
//                         <p className="text-xs font-semibold text-black truncate">{p.prenom} {p.nom}</p>
//                         {p.tarif_horaire && <p className="text-[10px] text-black/40">{p.tarif_horaire} €/h</p>}
//                       </div>
//                     </div>
//                     <div className="flex flex-wrap gap-1">
//                       {p.disciplines.slice(0, 2).map(d => {
//                         const c = getCol(d);
//                         return <span key={d} className="text-[9px] px-2 py-0.5 rounded-full border"
//                           style={{ background: c.bg, color: c.text, borderColor: c.border }}>{d}</span>;
//                       })}
//                     </div>
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//         )}

//         {/* ── Créneaux ── */}
//         <div>
//           <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/35 mb-3">
//             Créneaux
//             {creneauxFiltres.length > 0 && <span className="ml-1.5 font-normal text-black/20">({creneauxFiltres.length})</span>}
//           </p>

//           {creneaux.length === 0 && (
//             <div className="rounded-[20px] p-10 text-center border-2 border-dashed border-black/8">
//               <p className="text-2xl mb-3">🎵</p>
//               <p className="text-sm font-semibold text-black/50 mb-1">Créneaux à venir</p>
//               <p className="text-xs text-black/35 leading-5 max-w-xs mx-auto mb-4">
//                 Les intervenants publient leurs disponibilités. Reviens bientôt.
//               </p>
//               {!user && (
//                 <button onClick={() => setModal(true)}
//                   className="inline-flex rounded-full px-5 py-2.5 text-xs font-semibold text-white hover:brightness-110 transition"
//                   style={{ background: "rgb(22,92,71)" }}>
//                   Me faire notifier →
//                 </button>
//               )}
//             </div>
//           )}

//           <div className="grid gap-2 sm:grid-cols-2">
//             {creneauxFiltres.map(c => {
//               const prof = profs.find(p => p.id === c.prof_id);
//               const col = getCol(c.discipline);
//               const d = new Date(c.date_heure_debut);
//               const f = new Date(c.date_heure_fin);
//               return (
//                 <div key={c.id} className="rounded-[14px] p-4 flex items-center justify-between gap-3 border border-black/8 bg-white">
//                   <div className="flex items-center gap-3 min-w-0">
//                     <span className="text-[10px] font-semibold px-2 py-1 rounded-full border shrink-0"
//                       style={{ background: col.bg, color: col.text, borderColor: col.border }}>
//                       {c.discipline}
//                     </span>
//                     <div className="min-w-0">
//                       <p className="text-xs font-semibold text-black truncate">
//                         {d.toLocaleDateString("fr-BE", { weekday: "short", day: "numeric", month: "short" })}
//                       </p>
//                       <p className="text-[10px] text-black/40 mt-0.5">
//                         {d.toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" })} → {f.toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" })}
//                         {prof && ` · ${prof.prenom}`}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-2.5 shrink-0">
//                     <p className="text-xs font-bold text-black">{c.tarif} €</p>
//                     <button onClick={() => !user ? setModal(true) : alert("Flux 4")}
//                       className="rounded-full px-3 py-1.5 text-[10px] font-semibold text-white hover:brightness-110 transition"
//                       style={{ background: "rgb(22,92,71)" }}>
//                       Réserver
//                     </button>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {/* Carte fidélité + CTA intervenant côte à côte */}
//         <div className="grid gap-4 sm:grid-cols-2">
//           <div className="rounded-[16px] p-4 flex items-center gap-3 border border-black/8"
//             style={{ background: "rgba(185,151,83,0.06)" }}>
//             <span className="text-xl">🎴</span>
//             <div>
//               <p className="text-xs font-semibold text-black">Carte fidélité</p>
//               <p className="text-[10px] text-black/45 mt-0.5">10 cours = 1 offert automatiquement.</p>
//             </div>
//           </div>
//           <div className="rounded-[16px] p-4 flex items-center justify-between gap-3 border border-black/8 bg-white">
//             <div>
//               <p className="text-xs font-semibold text-black">Tu es intervenant ?</p>
//               <p className="text-[10px] text-black/45 mt-0.5">Rejoins le réseau Crea'Star.</p>
//             </div>
//             <Link href="/cours/cours-individuels"
//               className="rounded-full px-3 py-1.5 text-[10px] font-semibold text-white hover:brightness-110 shrink-0"
//               style={{ background: "rgb(22,92,71)" }}>
//               En savoir plus →
//             </Link>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

"use client";
// app/plateforme/inscription/OngletCoursIndividuels.tsx
// v3 — profs en héros, créneaux filtrés, tunnel réservation (séance + annuel, solo + duo)

import Link from "next/link";
import { useState, useEffect } from "react";

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
  accepte_abonnement?: boolean;
}

interface Creneau {
  id: string;
  prof_id: string;
  date_heure_debut: string;
  date_heure_fin: string;
  discipline: string;
  tarif_solo: number;
  tarif_duo?: number | null;
  places_max: number;       // 1 = solo uniquement, 2 = duo possible
  places_restantes: number;
  disponible: boolean;
  recurrent?: boolean;      // true = ce créneau se répète chaque semaine
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

// ─── CARTE PROF ───────────────────────────────────────────────────────────────
function CarteProfHero({
  prof, selected, onClick, nbCreneaux,
}: {
  prof: Prof; selected: boolean; onClick: () => void; nbCreneaux: number;
}) {
  return (
    <button onClick={onClick}
      className="w-full text-left rounded-[20px] overflow-hidden border-2 transition-all duration-200"
      style={{
        borderColor:  selected ? "rgb(22,92,71)" : "rgba(0,0,0,0.07)",
        boxShadow:    selected ? "0 0 0 4px rgba(22,92,71,0.08)" : "0 2px 12px rgba(0,0,0,0.05)",
        background:   "white",
      }}>

      {/* Photo */}
      <div className="relative overflow-hidden" style={{ height: 180 }}>
        {prof.photo_url ? (
          <img src={prof.photo_url} alt={`${prof.prenom} ${prof.nom}`}
            className="absolute inset-0 w-full h-full object-cover object-top" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-white"
            style={{ background: "linear-gradient(135deg, rgb(18,56,44), rgb(22,92,71))" }}>
            {prof.prenom[0]}{prof.nom[0]}
          </div>
        )}

        {/* Overlay gradient bas */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(8,20,14,0.7)_100%)]" />

        {/* Nom sur la photo */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-lg font-semibold text-white leading-tight">
            {prof.prenom} {prof.nom}
          </p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {prof.disciplines.slice(0, 3).map(d => {
              const c = getCol(d);
              return (
                <span key={d} className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.15)", color: "white", backdropFilter: "blur(4px)" }}>
                  {d}
                </span>
              );
            })}
          </div>
        </div>

        {/* Badge sélectionné */}
        {selected && (
          <div className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "rgb(22,92,71)", border: "2px solid white" }}>
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Infos bas */}
      <div className="px-4 py-3">
        {prof.bio_courte && (
          <p className="text-xs text-black/50 leading-5 mb-2 line-clamp-2">{prof.bio_courte}</p>
        )}
        <div className="flex items-center justify-between">
          <div>
            {prof.tarif_horaire && (
              <p className="text-sm font-bold" style={{ color: "rgb(22,92,71)" }}>
                {prof.tarif_horaire} €
                <span className="text-xs font-normal text-black/30 ml-1">/h · solo</span>
              </p>
            )}
            {prof.tarif_duo && (
              <p className="text-[11px] text-black/40">
                {prof.tarif_duo} €/pers. à deux
              </p>
            )}
          </div>
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
            style={{ background: nbCreneaux > 0 ? "rgba(22,92,71,0.08)" : "rgba(0,0,0,0.05)", color: nbCreneaux > 0 ? "rgb(15,75,57)" : "rgba(0,0,0,0.35)" }}>
            {nbCreneaux > 0 ? `${nbCreneaux} créneau${nbCreneaux > 1 ? "x" : ""}` : "Complet"}
          </span>
        </div>
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5"
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
              className="w-full text-center rounded-full py-3 text-sm font-semibold text-white hover:brightness-110 transition"
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
    </div>
  );
}

// ─── TUNNEL RÉSERVATION ───────────────────────────────────────────────────────
function TunnelReservation({
  creneau, prof, user, carteFidelite, onClose,
}: {
  creneau: Creneau; prof: Prof; user: { id: string; email: string };
  carteFidelite?: CarteFidelite | null; onClose: () => void;
}) {
  const [etape, setEtape]         = useState<"options" | "recap" | "paiement">("options");
  const [mode, setMode]           = useState<"seance" | "annuel" | null>(null);
  const [participants, setParticipants] = useState<1 | 2>(1);
  const [loading, setLoading]     = useState(false);

  const duree   = dureeMin(creneau.date_heure_debut, creneau.date_heure_fin);
  const tarif   = participants === 2 && creneau.tarif_duo ? creneau.tarif_duo : creneau.tarif_solo;
  const tarifAnnuel = mode === "annuel" ? Math.round(tarif * 36 * 0.9) : 0; // ~36 semaines, -10% abonnement
  const coursGratuit = carteFidelite && carteFidelite.nb_cours_valides >= carteFidelite.cours_pour_gratuit;

  const handlePayer = async () => {
    setLoading(true);
    try {
      // TODO: POST /api/reservation/cours-individuel
      // body: { creneauId, mode, participants, eleveId }
      await new Promise(r => setTimeout(r, 800));
      alert("Mollie à brancher ✓");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="w-full sm:max-w-md rounded-t-[28px] sm:rounded-[28px] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.3)]">

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
                {formatDate(creneau.date_heure_debut)} · {formatHeure(creneau.date_heure_debut)} → {formatHeure(creneau.date_heure_fin)}
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

        <div className="bg-white px-6 py-5">

          {/* ── Étape 1 : options ── */}
          {etape === "options" && (
            <div className="space-y-5">

              {/* Cours gratuit dispo */}
              {coursGratuit && (
                <div className="rounded-[14px] px-4 py-3 flex items-center gap-3"
                  style={{ background: "rgba(185,151,83,0.08)", border: "1px solid rgba(185,151,83,0.25)" }}>
                  <span className="text-lg shrink-0" style={{ color: "rgb(185,151,83)" }}>✦</span>
                  <p className="text-sm font-semibold" style={{ color: "rgb(110,80,20)" }}>
                    Ton prochain cours est gratuit ! La réduction s'applique automatiquement.
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
                        <p className="text-xs text-black/45 mt-0.5">Ce créneau uniquement · Paiement immédiat</p>
                      </div>
                      <p className="text-base font-bold" style={{ color: "rgb(22,92,71)" }}>
                        {tarif} €
                      </p>
                    </div>
                  </button>

                  {creneau.accepte_abonnement ? (
                    <button onClick={() => setMode("annuel")}
                      className="w-full text-left rounded-[14px] p-4 border-2 transition"
                      style={{
                        borderColor: mode === "annuel" ? "rgb(22,92,71)" : "rgba(0,0,0,0.08)",
                        background: mode === "annuel" ? "rgba(22,92,71,0.04)" : "rgb(249,250,249)",
                      }}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-semibold text-black">Abonnement annuel</p>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: "rgba(22,92,71,0.1)", color: "rgb(15,75,57)" }}>
                              −10%
                            </span>
                          </div>
                          <p className="text-xs text-black/45">Même créneau chaque semaine · ~36 séances</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-base font-bold" style={{ color: "rgb(22,92,71)" }}>
                            {tarifAnnuel} €
                          </p>
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

              {/* Participants (si duo possible) */}
              {creneau.places_max >= 2 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/35 mb-3">
                    Nombre de participants
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {([1, 2] as const).map(n => {
                      const t = n === 2 && creneau.tarif_duo ? creneau.tarif_duo : creneau.tarif_solo;
                      const sel = participants === n;
                      return (
                        <button key={n} onClick={() => setParticipants(n)}
                          className="rounded-[14px] p-4 border-2 transition text-left"
                          style={{
                            borderColor: sel ? "rgb(22,92,71)" : "rgba(0,0,0,0.08)",
                            background: sel ? "rgba(22,92,71,0.04)" : "rgb(249,250,249)",
                          }}>
                          <p className="text-sm font-semibold text-black mb-0.5">
                            {n === 1 ? "Solo" : "Duo"}
                          </p>
                          <p className="text-base font-bold" style={{ color: "rgb(22,92,71)" }}>
                            {t} €
                            <span className="text-xs font-normal text-black/35 ml-1">/pers.</span>
                          </p>
                          {n === 2 && (
                            <p className="text-[10px] text-black/40 mt-0.5">Toi + 1 ami(e)</p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                disabled={!mode}
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
                  { l: "Horaire",     v: `${formatHeure(creneau.date_heure_debut)} → ${formatHeure(creneau.date_heure_fin)}` },
                  { l: "Durée",       v: `${duree} min` },
                  { l: "Format",      v: mode === "annuel" ? "Abonnement annuel (−10%)" : "À la séance" },
                  { l: "Participants",v: participants === 1 ? "Solo" : "Duo (2 pers.)" },
                  ...(coursGratuit && mode === "seance"
                    ? [{ l: "Cours gratuit", v: "Appliqué ✓", accent: true }]
                    : []
                  ),
                  {
                    l: "Total",
                    v: coursGratuit && mode === "seance"
                      ? "0 € 🎉"
                      : mode === "annuel"
                        ? `${tarifAnnuel} €/an`
                        : `${tarif * participants} €`,
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
                  {coursGratuit && mode === "seance" ? "0 €" : mode === "annuel" ? `${tarifAnnuel} €` : `${tarif * participants} €`}
                </p>
                <p className="text-sm text-black/40">
                  {coursGratuit && mode === "seance"
                    ? "Cours offert · Carte fidélité"
                    : "Bancontact · Sécurisé par Mollie"}
                </p>
              </div>
              <button onClick={handlePayer} disabled={loading}
                className="w-full rounded-full py-4 text-base font-semibold text-white flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-50 transition"
                style={{ background: "rgb(22,92,71)" }}>
                {loading ? "Redirection…"
                  : coursGratuit && mode === "seance" ? "Confirmer la réservation gratuite →"
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
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function OngletCoursIndividuels({ user, profs, creneaux, carteFidelite }: Props) {
  const [disc,          setDisc]         = useState<string | null>(null);
  const [profId,        setProfId]       = useState<string | null>(null);
  const [modalConnexion, setModalConnexion] = useState(false);
  const [creneauReserv, setCreneauReserv] = useState<Creneau | null>(null);

  const disciplines   = Array.from(new Set(profs.flatMap(p => p.disciplines))).sort();
  const profsFiltres  = profs.filter(p => !disc || p.disciplines.includes(disc));
  const profSelec     = profs.find(p => p.id === profId);

  const creneauxDuProf = creneaux.filter(c =>
    c.disponible &&
    (!profId || c.prof_id === profId) &&
    (!disc    || c.discipline === disc)
  );

  // Nb créneaux dispo par prof
  const nbCreneauxParProf = (id: string) =>
    creneaux.filter(c => c.disponible && c.prof_id === id && (!disc || c.discipline === disc)).length;

  return (
    <div className="space-y-6">

      {/* ── Carte fidélité (connecté seulement) ── */}
      {user && carteFidelite && (
        <CarteFideliteWidget carte={carteFidelite} />
      )}

      {/* ── Bandeau invitation connexion si non connecté ── */}
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
            className="shrink-0 rounded-full px-4 py-2 text-xs font-semibold text-white hover:brightness-110 transition"
            style={{ background: "rgb(22,92,71)" }}>
            Se connecter →
          </Link>
        </div>
      )}

      {/* ── Filtres disciplines ── */}
      {disciplines.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setDisc(null); }}
            className="rounded-full px-4 py-1.5 text-xs font-semibold transition border"
            style={{
              background: !disc ? "rgb(22,92,71)" : "rgba(255,255,255,0.8)",
              color: !disc ? "white" : "rgba(0,0,0,0.55)",
              borderColor: !disc ? "transparent" : "rgba(0,0,0,0.1)",
            }}>
            Toutes
          </button>
          {disciplines.map(d => {
            const c = getCol(d); const act = disc === d;
            return (
              <button key={d} onClick={() => { setDisc(act ? null : d); setProfId(null); }}
                className="rounded-full px-4 py-1.5 text-xs font-semibold transition border"
                style={{
                  background: act ? c.bg : "rgba(255,255,255,0.8)",
                  color: act ? c.text : "rgba(0,0,0,0.55)",
                  borderColor: act ? c.border : "rgba(0,0,0,0.08)",
                }}>
                {d}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Aucun prof ── */}
      {profs.length === 0 && (
        <div className="rounded-[20px] py-16 text-center border border-dashed border-black/10 bg-white">
          <p className="text-3xl mb-4">🎵</p>
          <p className="text-sm font-semibold text-black/50 mb-2">Intervenants à venir</p>
          <p className="text-xs text-black/35 leading-5 max-w-xs mx-auto mb-5">
            Les profs publient leurs disponibilités prochainement. Reviens bientôt ou laisse-nous ton email.
          </p>
          <Link href="/contact?sujet=cours-individuels"
            className="inline-flex rounded-full px-5 py-2.5 text-xs font-semibold text-white hover:brightness-110 transition"
            style={{ background: "rgb(22,92,71)" }}>
            Me prévenir →
          </Link>
        </div>
      )}

      {/* ── Layout principal : profs + créneaux ── */}
      {profs.length > 0 && (
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* Col gauche — grille profs en héros */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/35 mb-4">
              Intervenants
              {profId && (
                <button onClick={() => setProfId(null)}
                  className="ml-3 font-normal text-black/40 normal-case hover:text-black/60 transition">
                  ← Voir tous
                </button>
              )}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {profsFiltres.map(p => (
                <CarteProfHero
                  key={p.id}
                  prof={p}
                  selected={profId === p.id}
                  onClick={() => setProfId(profId === p.id ? null : p.id)}
                  nbCreneaux={nbCreneauxParProf(p.id)}
                />
              ))}
            </div>
          </div>

          {/* Col droite — créneaux du prof sélectionné */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[20px] overflow-hidden border border-black/8 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)]">

              {/* Header */}
              <div className="px-5 py-4 border-b border-black/6" style={{ background: "rgb(248,250,248)" }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/35">
                  {profSelec
                    ? `Créneaux · ${profSelec.prenom} ${profSelec.nom}`
                    : "Créneaux disponibles"}
                </p>
                {!profSelec && (
                  <p className="text-xs text-black/35 mt-0.5">Sélectionne un intervenant pour filtrer</p>
                )}
              </div>

              {/* Liste créneaux */}
              <div className="divide-y divide-black/5 max-h-[600px] overflow-y-auto">
                {creneauxDuProf.length === 0 ? (
                  <div className="py-12 px-5 text-center">
                    <p className="text-2xl mb-3">📅</p>
                    <p className="text-sm font-semibold text-black/40 mb-1">
                      {profSelec ? "Aucun créneau disponible" : "Sélectionne un intervenant"}
                    </p>
                    <p className="text-xs text-black/30 leading-5">
                      {profSelec ? "Ce prof n'a pas de créneau libre pour le moment." : "Ou filtre par discipline pour voir les disponibilités."}
                    </p>
                  </div>
                ) : creneauxDuProf.map(c => {
                  const p    = profs.find(p => p.id === c.prof_id);
                  const col  = getCol(c.discipline);
                  const dur  = dureeMin(c.date_heure_debut, c.date_heure_fin);
                  const duoOk = c.places_max >= 2 && c.tarif_duo;

                  return (
                    <div key={c.id} className="px-5 py-4 hover:bg-black/[0.015] transition">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          {/* Discipline + dur */}
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full border"
                              style={{ background: col.bg, color: col.text, borderColor: col.border }}>
                              {c.discipline}
                            </span>
                            <span className="text-[10px] text-black/30">{dur} min</span>
                            {c.accepte_abonnement && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                style={{ background: "rgba(22,92,71,0.08)", color: "rgb(15,75,57)" }}>
                                Abonnement ✓
                              </span>
                            )}
                          </div>
                          {/* Date + heure */}
                          <p className="text-sm font-semibold text-black">
                            {formatDate(c.date_heure_debut)}
                          </p>
                          <p className="text-xs text-black/40 mt-0.5">
                            {formatHeure(c.date_heure_debut)} → {formatHeure(c.date_heure_fin)}
                            {!profSelec && p && ` · ${p.prenom} ${p.nom}`}
                          </p>
                        </div>

                        {/* Tarifs + bouton */}
                        <div className="text-right shrink-0">
                          <p className="text-base font-bold" style={{ color: "rgb(22,92,71)" }}>
                            {c.tarif_solo} €
                          </p>
                          {duoOk && (
                            <p className="text-[10px] text-black/35">{c.tarif_duo} €/pers. duo</p>
                          )}
                          <button
                            onClick={() => {
                              if (!user) { setModalConnexion(true); return; }
                              setCreneauReserv(c);
                            }}
                            className="mt-2 rounded-full px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110 transition"
                            style={{ background: "rgb(22,92,71)" }}>
                            Réserver
                          </button>
                        </div>
                      </div>

                      {/* Places restantes si créneau partageable */}
                      {c.places_max > 1 && c.places_restantes < c.places_max && (
                        <p className="text-[10px] text-black/35 mt-1">
                          {c.places_restantes} place{c.places_restantes > 1 ? "s" : ""} restante{c.places_restantes > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {modalConnexion && <ModalConnexion onClose={() => setModalConnexion(false)} />}

      {creneauReserv && user && (
        <TunnelReservation
          creneau={creneauReserv}
          prof={profs.find(p => p.id === creneauReserv.prof_id)!}
          user={user}
          carteFidelite={carteFidelite}
          onClose={() => setCreneauReserv(null)}
        />
      )}
    </div>
  );
}