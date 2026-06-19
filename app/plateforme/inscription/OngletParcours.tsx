// "use client";
// // app/plateforme/inscription/OngletParcours.tsx
// // Layout desktop : col gauche (cartes + premium) / col droite (infographie étapes)
// // Tailles de texte alignées sur le reste du site

// import Link from "next/link";
// import { useState } from "react";
// import CandidatureTracker from "./CandidatureTracker";

// const PARCOURS_LABELS: Record<string, string> = {
//   "full-artist":      "Full Artist",
//   "comedie-musicale": "Comédie musicale",
// };

// const ACOMPTE = 150;

// const PARCOURS = [
//   {
//     slug: "full-artist",
//     label: "Full Artist",
//     tag: "Projet individuel / groupe",
//     desc: "Chant, danse, théâtre, écriture, composition, studio et scène.",
//     tarif: 1650,
//     photo: "/programmes/full-artist.jpg",
//     disciplines: ["Chant", "Danse", "Théâtre", "Écriture", "Studio", "Scène"],
//   },
//   {
//     slug: "comedie-musicale",
//     label: "Comédie musicale",
//     tag: "Projet collectif",
//     desc: "Chant, danse, théâtre, écriture et mise en scène .",
//     tarif: 1450,
//     photo: "/programmes/comedie-musicale.jpg",
//     disciplines: ["Chant", "Danse", "Mise en scène", "Expression"],
//   },
// ];

// const PREMIUM_AVANTAGES = [
//   { icon: "◈", val: "30%",           label: "salles & studio" },
//   { icon: "◉", val: "15%",           label: "cours individuels" },
//   { icon: "◇", val: "10%",           label: "réduction famille" },
// ];

// const ETAPES = [
//   {
//     n: "01",
//     titre: "Candidature",
//     desc: "Tu remplis le formulaire en ligne — pas d'audition, pas de niveau requis. Une vidéo courte et de la motivation.",
//     color: "rgb(185,151,83)",
//   },
//   {
//     n: "02",
//     titre: "Examen du dossier",
//     desc: "La direction lit chaque candidature avec attention. Tu reçois une réponse dans la semaine.",
//     color: "rgb(22,92,71)",
//   },
//   {
//     n: "03",
//     titre: "Place proposée",
//     desc: "Ton profil est retenu. On t'envoie une place disponible avec un délai de réponse. À toi de jouer.",
//     color: "rgb(185,151,83)",
//   },
//   {
//     n: "04",
//     titre: "Inscription confirmée",
//     desc: "Tu paies l'acompte de 150 €. Ta place est sécurisée. Bienvenue chez Crea'Star.",
//     color: "rgb(22,92,71)",
//   },
// ];

// function calcTarifs(slug: string) {
//   const base = slug === "full-artist" ? 1650 : 1450;
//   const tri = Math.ceil(base * 1.04);
//   return { annuel: base, trimestriel: tri, parTrimestre: Math.ceil((tri - ACOMPTE) / 3) };
// }

// // ── Bloc CTA connexion — dans la zone verte via position sticky/flottant ──────
// function CTAConnexion() {
//   return (
//     <div
//       className="rounded-[18px] overflow-hidden border border-white/10 mb-8"
//       style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" }}
//     >
//       {/* On est dans la zone de contenu blanc/vert-pâle, donc adapter les couleurs */}
//       <div className="rounded-[18px] overflow-hidden" style={{ background: "rgb(22,92,71)" }}>
//         <div className="px-5 py-4 flex items-center justify-between gap-4">
//           <div>
//             <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50 mb-5">
//               Pour s'inscrire (Non obligatoire pour une candidature)
//             </p>
//             <p className="text-base font-semibold text-white leading-snug">
//               Connecte-toi ou crée un compte
//             </p>
//             <p className="text-sm text-white/55 mt-1 leading-5">
//               Suivi de candidature en temps réel · Réductions famille · Carte de fidélité pour cours / locations
//             </p>
//           </div>
//           <div className="flex flex-col gap-2 shrink-0">
//             <Link
//               href="/plateforme/login?redirect=/plateforme/inscription?onglet=parcours"
//               className="rounded-full px-5 py-2.5 text-sm font-semibold !text-white border border-white/25 bg-white/10 hover:border-white/50 transition text-center whitespace-nowrap"
//             >
//               Se connecter
//             </Link>
//             <Link
//               href="/plateforme/register?source=inscription"
//               className="rounded-full px-5 py-2.5 text-sm font-semibold text-center transition hover:brightness-105 whitespace-nowrap"
//               style={{ background: "rgb(185,151,83)", color: "white" }}
//             >
//               Créer un compte →
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Infographie "Comment ça marche" ──────────────────────────────────────────
// function Infographie() {
//   return (
//     <div className="relative">
//       {/* Titre */}
//       <div className="mb-8">
//         <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/40 mb-2">
//           Le processus
//         </p>
//         <h3 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">
//           De la candidature <span style={{ color: "rgb(22,92,71)" }}>à la scène</span>
//         </h3>
//       </div>

//       {/* Timeline verticale */}
//       <div className="relative">
//         {/* Ligne centrale */}
//         <div
//           className="absolute left-6 top-6 bottom-6 w-px"
//           style={{ background: "linear-gradient(180deg, rgb(185,151,83), rgb(22,92,71), rgb(185,151,83), rgb(22,92,71))" }}
//         />

//         <div className="space-y-0">
//           {ETAPES.map((etape, i) => (
//             <div key={etape.n} className="relative flex gap-5 pb-8 last:pb-0">
//               {/* Nœud */}
//               <div className="relative z-10 shrink-0">
//                 <div
//                   className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-white shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
//                   style={{ background: etape.color }}
//                 >
//                   <span className="text-white text-base font-bold">{etape.n}</span>
//                 </div>
//               </div>

//               {/* Contenu */}
//               <div className="pt-2 flex-1">
//                 <div className="flex items-start gap-3 mb-1.5">
//                   <span className="text-lg leading-none" style={{ color: etape.color }}>{etape.icon}</span>
//                   <h4 className="text-base font-semibold text-black leading-tight">{etape.titre}</h4>
//                 </div>
//                 <p className="text-sm leading-6 text-black/55 ml-8">{etape.desc}</p>

//                 {/* Élément visuel spécifique à chaque étape */}
//                 {i === 0 && (
//                   <div className="ml-8 mt-3 flex gap-2 flex-wrap">
//                     {["Formulaire en ligne", "Vidéo courte", "Sans audition"].map(t => (
//                       <span key={t} className="text-[11px] font-medium px-2.5 py-1 rounded-full"
//                         style={{ background: "rgba(185,151,83,0.1)", color: "rgb(110,80,20)", border: "1px solid rgba(185,151,83,0.2)" }}>
//                         {t}
//                       </span>
//                     ))}
//                   </div>
//                 )}
//                 {i === 2 && (
//                   <div className="ml-8 mt-3 flex items-center gap-2">
//                     <div className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ background: "rgba(22,92,71,0.1)" }}>
//                       <div className="h-full w-3/4 rounded-full" style={{ background: "rgb(22,92,71)" }} />
//                     </div>
//                     <span className="text-[11px] font-semibold shrink-0" style={{ color: "rgb(22,92,71)" }}>
//                       Délai à respecter
//                     </span>
//                   </div>
//                 )}
//                 {i === 3 && (
//                   <div className="ml-8 mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5"
//                     style={{ background: "rgba(22,92,71,0.08)", border: "1px solid rgba(22,92,71,0.15)" }}>
//                     <span className="text-base">🎓</span>
//                     <span className="text-xs font-semibold" style={{ color: "rgb(22,92,71)" }}>
//                       Statut Premium activé
//                     </span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Pied — montants */}
//       <div
//         className="mt-8 rounded-[20px] p-5"
//         style={{ background: "rgba(22,92,71,0.05)", border: "1px solid rgba(22,92,71,0.12)" }}
//       >
//         <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40 mb-4">Tarifs</p>
//         <div className="space-y-3">
//           {PARCOURS.map(p => {
//             const t = calcTarifs(p.slug);
//             return (
//               <div key={p.slug} className="flex items-center justify-between gap-3">
//                 <span className="text-sm font-medium text-black/70">{p.label}</span>
//                 <div className="flex items-center gap-3">
//                   <span className="text-sm text-black/40">annuel</span>
//                   <span className="text-base font-bold" style={{ color: "rgb(22,92,71)" }}>
//                     {t.annuel.toLocaleString("fr-BE")} €
//                   </span>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//         <p className="text-xs text-black/35 mt-3 pt-3 border-t border-black/6">
//           Acompte de 150 € à la confirmation · reste en annuel ou 3× trimestriel (+4%)
//         </p>
//       </div>
//     </div>
//   );
// }

// // ── Bloc Premium — visuel différent, pas une liste plate ─────────────────────
// function BlocPremium() {
//   return (
//     <div
//       className="relative rounded-[20px] overflow-hidden mt-5"
//       style={{ background: "rgb(18,56,44)" }}
//     >
//       {/* Deco */}
//       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(185,151,83,0.18),transparent_55%)]" />
//       <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(185,151,83,0.4),transparent)]" />

//       <div className="relative px-5 py-5">
//         <div className="flex items-center gap-2 mb-4">
//           <span className="text-lg" style={{ color: "rgb(185,151,83)" }}>✦</span>
//           <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/50">
//             Inclus automatiquement
//           </p>
//         </div>
//         <p className="text-xl font-semibold text-white mb-1">Statut Premium</p>
//         <p className="text-sm text-white/50 mb-5 leading-5">
//           Tout élève inscrit à un parcours annuel bénéficie automatiquement du statut Premium.
//         </p>

//         {/* Avantages en grille 3 cases */}
//         <div className="grid grid-cols-3 gap-2">
//           {PREMIUM_AVANTAGES.map(a => (
//             <div
//               key={a.val}
//               className="rounded-[14px] px-3 py-3 text-center"
//               style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
//             >
//               <p className="text-xl font-bold text-white mb-0.5">{a.val}</p>
//               <p className="text-[10px] text-white/45 leading-[1.3]">{a.label}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Tunnel de confirmation ────────────────────────────────────────────────────
// function TunnelConfirmation({ candidature }: { candidature: any }) {
//   const [etape, setEtape] = useState<"rythme" | "recap" | "paiement">("rythme");
//   const [rythme, setRythme] = useState<"annuel" | "trimestriel" | null>(null);
//   const [conditions, setConditions] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const tarifs = calcTarifs(candidature.parcours);
//   const label = PARCOURS_LABELS[candidature.parcours] ?? candidature.parcours;
//   const jours = candidature.place_expire_at
//     ? Math.max(0, Math.ceil((new Date(candidature.place_expire_at).getTime() - Date.now()) / 86400000))
//     : null;
//   const urgence = jours !== null && jours <= 2;

//   return (
//     <div className="rounded-[24px] overflow-hidden border border-black/10 shadow-[0_4px_32px_rgba(0,0,0,0.08)]">
//       {/* Header */}
//       <div
//         className="px-6 py-5 sm:px-8 flex items-center justify-between gap-4"
//         style={{ background: urgence ? "rgb(153,27,27)" : "rgb(22,92,71)" }}
//       >
//         <div>
//           <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">
//             {urgence ? "⚠ Dernière chance" : "Place confirmée · " + label}
//           </p>
//           <p className="text-lg font-semibold text-white mt-0.5">Confirme ton inscription</p>
//         </div>
//         {jours !== null && (
//           <div className="text-center rounded-[10px] border border-white/20 bg-white/10 px-4 py-2 shrink-0">
//             <p className="text-2xl font-bold text-white leading-none">{jours}</p>
//             <p className="text-[9px] text-white/55 mt-0.5 uppercase tracking-[0.15em]">
//               jour{jours > 1 ? "s" : ""}
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Stepper */}
//       <div className="flex gap-2 px-6 py-3 sm:px-8 border-b border-black/6 bg-white">
//         {(["rythme", "recap", "paiement"] as const).map((s, i) => (
//           <div key={s} className="flex items-center gap-2">
//             <span
//               className="text-sm font-semibold px-4 py-1.5 rounded-full transition"
//               style={{
//                 background: etape === s ? "rgb(22,92,71)" : "rgba(0,0,0,0.06)",
//                 color: etape === s ? "white" : "rgba(0,0,0,0.45)",
//               }}
//             >
//               {i + 1} {s === "rythme" ? "Rythme" : s === "recap" ? "Récap" : "Paiement"}
//             </span>
//             {i < 2 && <span className="text-black/15">›</span>}
//           </div>
//         ))}
//       </div>

//       <div className="bg-white px-6 py-6 sm:px-8">
//         {/* Étape 1 */}
//         {etape === "rythme" && (
//           <div className="space-y-5">
//             <p className="text-base font-semibold text-black">Choisis ton rythme de paiement</p>
//             <div className="grid sm:grid-cols-2 gap-3">
//               {[
//                 {
//                   id: "annuel" as const,
//                   titre: "Annuel",
//                   badge: "Base",
//                   badgeBg: "rgba(22,92,71,0.1)",
//                   badgeColor: "rgb(15,75,57)",
//                   montant: tarifs.annuel,
//                   detail: "Un seul règlement · Zéro supplément",
//                 },
//                 {
//                   id: "trimestriel" as const,
//                   titre: "Trimestriel",
//                   badge: "+4%",
//                   badgeBg: "rgba(185,151,83,0.12)",
//                   badgeColor: "rgb(110,80,20)",
//                   montant: tarifs.parTrimestre,
//                   detail: `3× /trimestre après acompte`,
//                 },
//               ].map(opt => (
//                 <button
//                   key={opt.id}
//                   onClick={() => setRythme(opt.id)}
//                   className="text-left rounded-[16px] p-5 transition border-2"
//                   style={{
//                     background: rythme === opt.id ? "rgba(22,92,71,0.04)" : "rgb(247,249,246)",
//                     borderColor: rythme === opt.id ? "rgb(22,92,71)" : "rgba(0,0,0,0.08)",
//                   }}
//                 >
//                   <div className="flex justify-between items-start mb-3">
//                     <p className="text-base font-semibold text-black">{opt.titre}</p>
//                     <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
//                       style={{ background: opt.badgeBg, color: opt.badgeColor }}>
//                       {opt.badge}
//                     </span>
//                   </div>
//                   <p className="text-2xl font-bold" style={{ color: "rgb(22,92,71)" }}>
//                     {opt.montant.toLocaleString("fr-BE")} €
//                   </p>
//                   <p className="text-xs text-black/40 mt-1">{opt.detail}</p>
//                 </button>
//               ))}
//             </div>

//             <p className="text-sm text-black/40 rounded-[12px] p-4 border border-black/6 leading-6"
//               style={{ background: "rgb(249,250,249)" }}>
//               Acompte de <strong className="text-black/60">{ACOMPTE} €</strong> prélevé immédiatement par Bancontact pour sécuriser ta place.
//             </p>

//             <button
//               disabled={!rythme}
//               onClick={() => setEtape("recap")}
//               className="w-full rounded-full py-4 text-base font-semibold text-white transition hover:brightness-110 disabled:opacity-30"
//               style={{ background: "rgb(22,92,71)" }}
//             >
//               Continuer →
//             </button>
//           </div>
//         )}

//         {/* Étape 2 */}
//         {etape === "recap" && rythme && (
//           <div className="space-y-5">
//             <p className="text-base font-semibold text-black">Récapitulatif</p>
//             <div className="rounded-[16px] overflow-hidden border border-black/8">
//               {[
//                 { l: "Parcours", v: label },
//                 { l: "Rythme",   v: rythme === "annuel" ? "Annuel" : "Trimestriel (+4%)" },
//                 { l: "Acompte aujourd'hui", v: `${ACOMPTE} €`, accent: true },
//                 ...(rythme === "annuel"
//                   ? [{ l: "Solde restant", v: `${(tarifs.annuel - ACOMPTE).toLocaleString("fr-BE")} €` }]
//                   : [
//                       { l: "Trimestre 1 — sept.", v: `${tarifs.parTrimestre.toLocaleString("fr-BE")} €` },
//                       { l: "Trimestre 2 — jan.",  v: `${tarifs.parTrimestre.toLocaleString("fr-BE")} €` },
//                       { l: "Trimestre 3 — avr.",  v: `${tarifs.parTrimestre.toLocaleString("fr-BE")} €` },
//                     ]
//                 ),
//               ].map((row: any, i, arr) => (
//                 <div key={i}
//                   className="flex justify-between text-sm px-5 py-3.5"
//                   style={{
//                     background: row.accent ? "rgba(22,92,71,0.04)" : i % 2 === 0 ? "white" : "rgb(249,250,249)",
//                     borderBottom: i < arr.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
//                   }}
//                 >
//                   <span className="text-black/50">{row.l}</span>
//                   <span className="font-semibold" style={{ color: row.accent ? "rgb(22,92,71)" : "black" }}>{row.v}</span>
//                 </div>
//               ))}
//               <div className="flex justify-between text-base font-bold px-5 py-4 border-t border-black/8"
//                 style={{ background: "rgba(22,92,71,0.04)" }}>
//                 <span>Total annuel</span>
//                 <span style={{ color: "rgb(22,92,71)" }}>
//                   {(rythme === "annuel" ? tarifs.annuel : tarifs.trimestriel).toLocaleString("fr-BE")} €
//                 </span>
//               </div>
//             </div>

//             <div className="rounded-[14px] p-4 text-sm leading-6 text-black/50 space-y-1.5"
//               style={{ background: "rgb(249,250,249)", border: "1px solid rgba(0,0,0,0.07)" }}>
//               <p><strong className="text-black/65">Engagement annuel ferme.</strong> L'année commencée est due dans son intégralité.</p>
//               <p><strong className="text-black/65">Sans remboursement</strong> sauf exception validée par la direction.</p>
//             </div>

//             <label className="flex items-start gap-3 cursor-pointer rounded-[14px] p-4 border border-black/8 bg-white hover:border-black/15 transition">
//               <input
//                 type="checkbox"
//                 checked={conditions}
//                 onChange={e => setConditions(e.target.checked)}
//                 className="mt-0.5 w-4 h-4 shrink-0"
//                 style={{ accentColor: "rgb(22,92,71)" }}
//               />
//               <span className="text-sm text-black/60 leading-6">
//                 J'ai lu et j'accepte les conditions générales d'inscription de Crea'Star.
//               </span>
//             </label>

//             <div className="flex gap-3">
//               <button
//                 onClick={() => setEtape("rythme")}
//                 className="flex-1 rounded-full py-3.5 text-sm font-medium text-black/55 border border-black/10 hover:bg-black/4 transition"
//               >
//                 ← Retour
//               </button>
//               <button
//                 disabled={!conditions}
//                 onClick={() => setEtape("paiement")}
//                 className="flex-[2] rounded-full py-3.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-30 transition"
//                 style={{ background: "rgb(22,92,71)" }}
//               >
//                 Continuer →
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Étape 3 */}
//         {etape === "paiement" && (
//           <div className="space-y-5">
//             <p className="text-base font-semibold text-black">Paiement de l'acompte</p>
//             <div className="rounded-[20px] py-10 text-center space-y-2"
//               style={{ background: "rgba(22,92,71,0.04)", border: "1.5px solid rgba(22,92,71,0.12)" }}>
//               <p className="text-5xl font-bold tracking-tight" style={{ color: "rgb(22,92,71)" }}>{ACOMPTE} €</p>
//               <p className="text-sm text-black/40">Bancontact · Sécurisé par Mollie · Non remboursable</p>
//             </div>
//             <button
//               onClick={() => { setLoading(true); alert("Mollie à brancher ✓"); setLoading(false); }}
//               disabled={loading}
//               className="w-full rounded-full py-4 text-base font-semibold text-white flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-50 transition"
//               style={{ background: "rgb(22,92,71)" }}
//             >
//               {loading ? "Redirection..." : `Payer ${ACOMPTE} € par Bancontact →`}
//             </button>
//             <button
//               onClick={() => setEtape("recap")}
//               className="w-full text-center text-sm text-black/30 hover:text-black/55 transition py-2"
//             >
//               ← Retour au récapitulatif
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ── Composant principal ───────────────────────────────────────────────────────
// export default function OngletParcours({ user, candidature, eleves }: {
//   user: { id: string; email: string } | null;
//   candidature: any | null;
//   eleves: any[];
// }) {

//   // ── Non connecté ─────────────────────────────────────────────────────────
//   if (!user) {
//     return (
//       <div className="space-y-8">
//         {/* CTA connexion — en tête, bien visible */}
//         <CTAConnexion />

//         {/* Layout principal : gauche + droite */}
//         <div className="grid gap-10 lg:grid-cols-[400px_1fr] xl:grid-cols-[600px_1fr]">

//           {/* ── COL GAUCHE ── */}
//           <div>
//             {/* Cartes parcours compactes */}
//             <div className="space-y-3">
//               {PARCOURS.map(p => (
//                 <div
//                   key={p.slug}
//                   className="rounded-[20px] overflow-hidden border border-black/8 shadow-[0_2px_12px_rgba(0,0,0,0.05)] flex"
//                   style={{ height: "140px" }}
//                 >
//                   {/* Photo à gauche */}
//                   <div className="relative w-36 shrink-0 overflow-hidden">
//                     <img
//                       src={p.photo}
//                       alt={p.label}
//                       className="absolute inset-0 w-full h-full object-cover"
//                     />
//                     <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_60%,rgba(255,255,255,0.08)_100%)]" />
//                   </div>

//                   {/* Contenu à droite */}
//                   <div className="bg-white flex flex-col justify-between px-4 py-3.5 flex-1 min-w-0">
//                     <div>
//                       <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/35 mb-0.5">{p.tag}</p>
//                       <p className="text-base font-semibold text-black leading-tight">{p.label}</p>
//                       <p className="text-xs text-black/50 mt-1 leading-4">{p.desc}</p>
//                     </div>
//                     <div className="flex items-center justify-between mt-2">
//                       <span className="text-base font-bold" style={{ color: "rgb(22,92,71)" }}>
//                         {p.tarif.toLocaleString("fr-BE")} €
//                         <span className="text-xs font-normal text-black/30 ml-1">/an</span>
//                       </span>
//                       <Link
//                         href={`/candidature?parcours=${p.slug}`}
//                         className="rounded-full px-4 py-1.5 text-xs font-semibold !text-white transition hover:brightness-110"
//                         style={{ background: "rgb(22,92,71)" }}
//                       >
//                         Candidater →
//                       </Link>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Bloc Premium */}
//             <BlocPremium />
//           </div>

//           {/* ── COL DROITE — Infographie ── */}
//           <div className="lg:sticky lg:top-28 lg:self-start">
//             <Infographie />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ── Connecté, aucune candidature ─────────────────────────────────────────
//   if (!candidature) {
//     return (
//       <div className="space-y-8">
//         <div className="grid gap-8 lg:grid-cols-[480px_1fr] xl:grid-cols-[520px_1fr]">
//           <div className="space-y-3">
//             <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black/35 mb-4">
//               Choisir un parcours
//             </p>
//             {PARCOURS.map(p => (
//               <div
//                 key={p.slug}
//                 className="rounded-[20px] overflow-hidden border border-black/8 shadow-[0_2px_12px_rgba(0,0,0,0.05)] flex"
//                 style={{ height: "140px" }}
//               >
//                 <div className="relative w-36 shrink-0 overflow-hidden">
//                   <img src={p.photo} alt={p.label} className="absolute inset-0 w-full h-full object-cover" />
//                 </div>
//                 <div className="bg-white flex flex-col justify-between px-4 py-3.5 flex-1 min-w-0">
//                   <div>
//                     <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/35 mb-0.5">{p.tag}</p>
//                     <p className="text-base font-semibold text-black leading-tight">{p.label}</p>
//                     <p className="text-xs text-black/50 mt-1 leading-4">{p.desc}</p>
//                   </div>
//                   <div className="flex items-center justify-between mt-2">
//                     <span className="text-base font-bold" style={{ color: "rgb(22,92,71)" }}>
//                       {p.tarif.toLocaleString("fr-BE")} €
//                     </span>
//                     <Link
//                       href={`/candidature?parcours=${p.slug}`}
//                       className="rounded-full px-4 py-1.5 text-xs font-semibold text-white hover:brightness-110 transition"
//                       style={{ background: "rgb(22,92,71)" }}
//                     >
//                       Candidater →
//                     </Link>
//                   </div>
//                 </div>
//               </div>
//             ))}
//             <BlocPremium />
//           </div>
//           <div className="lg:sticky lg:top-28 lg:self-start">
//             <Infographie />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ── Connecté avec candidature ────────────────────────────────────────────
//   return (
//     <div className="space-y-8">
//       <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
//         {/* Tracker + tunnel */}
//         <div className="space-y-8">
//           <div className="rounded-[24px] overflow-hidden border border-black/8 bg-white">
//             <div className="px-6 py-5 sm:px-8 border-b border-black/6" style={{ background: "rgb(247,249,246)" }}>
//               <p className="text-xs uppercase tracking-[0.2em] text-black/35 mb-0.5">Ta candidature</p>
//               <p className="text-xl font-semibold text-black">
//                 Parcours <span style={{ color: "rgb(22,92,71)" }}>
//                   {PARCOURS_LABELS[candidature.parcours] ?? candidature.parcours}
//                 </span>
//               </p>
//             </div>
//             <div className="px-6 py-6 sm:px-8">
//               <CandidatureTracker candidature={candidature} compact={false} />
//             </div>
//           </div>

//           {candidature.statut === "place_proposee" && (
//             <TunnelConfirmation candidature={candidature} />
//           )}
//         </div>

//         {/* Infographie à droite même quand connecté */}
//         <div className="lg:sticky lg:top-28 lg:self-start">
//           <Infographie />
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
// app/plateforme/inscription/OngletParcours.tsx

import Link from "next/link";
import { useState, useEffect } from "react";
import CandidatureTracker from "./CandidatureTracker";

const PARCOURS_LABELS: Record<string, string> = {
  "full-artist":      "Full Artist",
  "comedie-musicale": "Comédie musicale",
};

const ACOMPTE = 150;

const PARCOURS = [
  {
    slug: "full-artist",
    label: "Full Artist",
    tag: "Pluridisciplinaire",
    desc: "Chant, danse, théâtre, écriture, studio et scène.",
    tarif: 1650,
    photo: "/programmes/full-artist.jpg",
  },
  {
    slug: "comedie-musicale",
    label: "Comédie musicale",
    tag: "Spectacle collectif",
    desc: "Chant, danse et théâtre jusqu'au spectacle.",
    tarif: 1450,
    photo: "/programmes/comedie-musicale.jpg",
  },
];

const PREMIUM_AVANTAGES = [
  { val: "−30%", label: "salles & studio" },
  { val: "−15%", label: "cours individuels" },
  { val: "−10%", label: "réduction famille" },
];

const ETAPES_PROCESS = [
  {
    n: "01", titre: "Candidature", icon: "✦", color: "rgb(185,151,83)",
    desc: "Formulaire en ligne — pas d'audition, pas de niveau requis. Une vidéo courte et de la motivation.",
    pills: ["Formulaire en ligne", "Vidéo courte", "Sans audition"],
  },
  {
    n: "02", titre: "Examen du dossier", icon: "◎", color: "rgb(22,92,71)",
    desc: "La direction lit chaque candidature avec attention. Tu reçois une réponse dans la semaine.",
    pills: [],
  },
  {
    n: "03", titre: "Place proposée", icon: "◈", color: "rgb(185,151,83)",
    desc: "Ton profil est retenu. On t'envoie une place avec un délai de réponse.",
    pills: ["Délai à respecter"],
  },
  {
    n: "04", titre: "Inscription confirmée", icon: "★", color: "rgb(22,92,71)",
    desc: "Tu paies l'acompte de 150 € par Bancontact. Ta place est sécurisée.",
    pills: ["Statut Premium activé"],
  },
];

// Statuts → index d'étape active
const STATUT_TO_STEP: Record<string, number> = {
  en_attente: 1,
  info_complementaire: 1,
  validee: 2,
  liste_attente: 2,
  place_proposee: 3,
  inscrit: 4,
};

function calcTarifs(slug: string) {
  const base = slug === "full-artist" ? 1650 : 1450;
  const tri = Math.ceil(base * 1.04);
  return { annuel: base, trimestriel: tri, parTrimestre: Math.ceil((tri - ACOMPTE) / 3) };
}

// ── Modal conditions générales ────────────────────────────────────────────────
function ModalConditions({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-[24px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.25)]">
        {/* Header */}
        <div className="px-7 py-5 flex items-center justify-between shrink-0"
          style={{ background: "rgb(22,92,71)" }}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/50 mb-0.5">
              Crea'Star · Règlement intérieur
            </p>
            <h2 className="text-lg font-semibold text-white">Conditions générales d'inscription</h2>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition text-base"
            aria-label="Fermer">
            ✕
          </button>
        </div>

        {/* Corps scrollable */}
        <div className="overflow-y-auto bg-white px-7 py-6 space-y-6 flex-1">
          {/* Bandeau "document en cours de rédaction" */}
          <div className="rounded-[14px] px-4 py-3 flex items-center gap-3"
            style={{ background: "rgba(185,151,83,0.08)", border: "1px solid rgba(185,151,83,0.2)" }}>
            <span className="text-lg shrink-0" style={{ color: "rgb(185,151,83)" }}>◈</span>
            <p className="text-sm text-black/60 leading-5">
              Ce document est en cours de finalisation. Le règlement complet sera disponible avant l'ouverture des inscriptions.
            </p>
          </div>

          {/* Sections placeholder */}
          {[
            { titre: "1. Engagement annuel", contenu: "L'inscription à un parcours annuel Crea'Star constitue un engagement ferme pour l'année scolaire complète. [À compléter]" },
            { titre: "2. Politique de remboursement", contenu: "L'acompte versé à l'inscription n'est pas remboursable. En cas d'arrêt en cours d'année... [À compléter]" },
            { titre: "3. Paiement et échéances", contenu: "Les modalités de paiement (annuel ou trimestriel) sont choisies lors de l'inscription. [À compléter]" },
            { titre: "4. Règlement intérieur", contenu: "Les élèves s'engagent à respecter les règles de vie en communauté de l'école. [À compléter]" },
            { titre: "5. Droit à l'image", contenu: "Crea'Star peut être amenée à photographier ou filmer les élèves dans le cadre des activités pédagogiques. [À compléter]" },
            { titre: "6. Résiliation", contenu: "En cas de manquement grave aux règles, la direction se réserve le droit de résilier l'inscription. [À compléter]" },
          ].map(s => (
            <div key={s.titre}>
              <h3 className="text-base font-semibold text-black mb-2">{s.titre}</h3>
              <p className="text-sm leading-6 text-black/55">{s.contenu}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-black/8 bg-white shrink-0">
          <button onClick={onClose}
            className="w-full rounded-full py-3 text-sm font-semibold text-white hover:brightness-110 transition"
            style={{ background: "rgb(22,92,71)" }}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Compte à rebours ─────────────────────────────────────────────────────────
function ComptaRebours({ expireAt }: { expireAt: string }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const calc = () => Math.max(0, new Date(expireAt).getTime() - Date.now());
    setRemaining(calc());
    const id = setInterval(() => setRemaining(calc()), 1000);
    return () => clearInterval(id);
  }, [expireAt]);

  const totalSec = Math.floor(remaining / 1000);
  const jours    = Math.floor(totalSec / 86400);
  const heures   = Math.floor((totalSec % 86400) / 3600);
  const minutes  = Math.floor((totalSec % 3600) / 60);
  const secondes = totalSec % 60;

  const urgent  = jours === 0 && heures < 6;
  const warning = jours <= 1;
  const expired = remaining <= 0;

  const color = expired ? "rgb(153,27,27)" : urgent ? "rgb(185,28,28)" : warning ? "rgb(185,151,83)" : "rgb(22,92,71)";
  const bgColor = expired ? "rgba(153,27,27,0.06)" : urgent ? "rgba(220,38,38,0.06)" : warning ? "rgba(185,151,83,0.06)" : "rgba(22,92,71,0.04)";
  const borderColor = expired ? "rgba(153,27,27,0.2)" : urgent ? "rgba(220,38,38,0.2)" : warning ? "rgba(185,151,83,0.25)" : "rgba(22,92,71,0.12)";

  if (expired) {
    return (
      <div className="rounded-[16px] p-4 text-center" style={{ background: bgColor, border: `1px solid ${borderColor}` }}>
        <p className="text-base font-bold" style={{ color }}>Délai expiré</p>
        <p className="text-sm text-black/50 mt-1 leading-5">
          Ta place a été libérée. Tu as été replacé·e en liste d'attente — on te contactera si une nouvelle place se libère.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] p-5" style={{ background: bgColor, border: `1.5px solid ${borderColor}` }}>
      {(urgent || warning) && (
        <div className="flex items-center gap-2 mb-3 rounded-[10px] px-3 py-2"
          style={{ background: urgent ? "rgba(220,38,38,0.08)" : "rgba(185,151,83,0.1)" }}>
          <span className="text-base">{urgent ? "🔥" : "⚠️"}</span>
          <p className="text-sm font-semibold" style={{ color }}>
            {urgent
              ? "Dernière chance — confirme maintenant avant expiration !"
              : "Délai bientôt expiré — si tu ne confirmes pas, ta place sera libérée et tu seras remis·e en liste d'attente."}
          </p>
        </div>
      )}

      <p className="text-xs font-bold uppercase tracking-[0.22em] text-black/35 mb-3 text-center">
        Temps restant pour confirmer
      </p>

      <div className="grid grid-cols-4 gap-2">
        {[
          { val: jours,    label: "jours" },
          { val: heures,   label: "heures" },
          { val: minutes,  label: "min" },
          { val: secondes, label: "sec" },
        ].map(u => (
          <div key={u.label} className="rounded-[14px] py-3 text-center"
            style={{ background: "white", border: "1px solid rgba(0,0,0,0.07)" }}>
            <p className="text-3xl font-bold tabular-nums leading-none" style={{ color }}>
              {String(u.val).padStart(2, "0")}
            </p>
            <p className="text-[10px] text-black/35 mt-1 uppercase tracking-[0.12em]">{u.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Vue statut candidature — grand format graphique ─────────────────────────
function VueStatutCandidature({ candidature }: { candidature: any }) {
  const step = STATUT_TO_STEP[candidature.statut] ?? 1;
  const parcLabel = PARCOURS_LABELS[candidature.parcours] ?? candidature.parcours;

  // Message contextuel selon statut
  const MSG: Record<string, { emoji: string; titre: string; texte: string; couleur: string }> = {
    en_attente: {
      emoji: "⏳",
      titre: "Dossier en cours d'examen",
      texte: "Ta candidature est entre les mains de la direction. Tu recevras une réponse dans la semaine. Garde un œil sur ta boîte mail.",
      couleur: "rgb(185,151,83)",
    },
    info_complementaire: {
      emoji: "📬",
      titre: "Action requise",
      texte: "La direction t'a contacté pour des informations complémentaires. Réponds directement à l'email reçu.",
      couleur: "rgb(147,51,234)",
    },
    validee: {
      emoji: "✅",
      titre: "Profil retenu !",
      texte: "Bonne nouvelle — ton profil a été sélectionné. On finalise la composition des groupes et on te propose une place très bientôt.",
      couleur: "rgb(22,92,71)",
    },
    liste_attente: {
      emoji: "🕐",
      titre: "Sur liste d'attente",
      texte: "Les groupes sont complets pour le moment. Tu es sur liste d'attente — on te prévient dès qu'une place se libère.",
      couleur: "rgb(59,130,246)",
    },
    place_proposee: {
      emoji: "🎉",
      titre: "Une place t'attend !",
      texte: "Ta place est réservée. Confirme-la en réglant l'acompte ci-dessous avant expiration du délai.",
      couleur: "rgb(22,92,71)",
    },
    inscrit: {
      emoji: "🎓",
      titre: "Inscrit·e !",
      texte: "Tu fais officiellement partie de Crea'Star. Les détails de ton groupe te seront communiqués prochainement.",
      couleur: "rgb(22,92,71)",
    },
  };

  const msg = MSG[candidature.statut] ?? MSG["en_attente"];

  return (
    <div className="space-y-6">

      {/* ── Grande carte statut ── */}
      <div className="rounded-[24px] overflow-hidden border border-black/8 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
        {/* Header coloré avec emoji grand + texte */}
        <div className="relative px-7 py-8 overflow-hidden"
          style={{ background: "rgb(18,56,44)" }}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(185,151,83,0.15),transparent_55%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(185,151,83,0.4),transparent)]" />

          <div className="relative flex items-start gap-5">
            {/* Grand emoji */}
            <div className="w-16 h-16 rounded-[18px] flex items-center justify-center text-3xl shrink-0"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
              {msg.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/40 mb-2">
                Parcours {parcLabel}
              </p>
              <h3 className="text-2xl font-semibold text-white leading-tight mb-2">
                {msg.titre}
              </h3>
              <p className="text-sm text-white/60 leading-6">{msg.texte}</p>
            </div>
          </div>

          {/* Date de dépôt */}
          <p className="relative mt-5 text-xs text-white/25">
            Candidature déposée le {new Date(candidature.created_at).toLocaleDateString("fr-BE", {
              day: "numeric", month: "long", year: "numeric"
            })}
          </p>
        </div>

        {/* Barre de progression des étapes */}
        <div className="bg-white px-7 py-5">
          <div className="relative flex items-center">
            {/* Ligne de fond */}
            <div className="absolute left-6 right-6 top-4 h-px" style={{ background: "rgba(0,0,0,0.08)" }} />
            {/* Ligne de progression */}
            <div className="absolute left-6 top-4 h-px transition-all duration-700"
              style={{
                background: `linear-gradient(90deg, rgb(185,151,83), rgb(22,92,71))`,
                width: step >= 4 ? "calc(100% - 3rem)" : `calc((100% - 3rem) * ${(step - 1) / 3})`,
              }} />

            {/* Étapes */}
            <div className="relative flex justify-between w-full">
              {ETAPES_PROCESS.map((e, i) => {
                const done = i + 1 < step;
                const active = i + 1 === step;
                return (
                  <div key={e.n} className="flex flex-col items-center gap-2" style={{ width: "25%" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10"
                      style={{
                        background: done ? "rgb(22,92,71)" : active ? e.color : "white",
                        borderColor: done ? "rgb(22,92,71)" : active ? e.color : "rgba(0,0,0,0.12)",
                        boxShadow: active ? `0 0 0 4px ${e.color}22` : "none",
                      }}>
                      {done
                        ? <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        : <span className="text-[10px] font-bold" style={{ color: active ? "white" : "rgba(0,0,0,0.2)" }}>{e.n}</span>
                      }
                    </div>
                    <p className="text-[10px] font-semibold text-center leading-[1.2] whitespace-pre-line"
                      style={{ color: done || active ? "rgb(22,92,71)" : "rgba(0,0,0,0.3)" }}>
                      {e.titre}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Compte à rebours si place proposée ── */}
      {candidature.statut === "place_proposee" && candidature.place_expire_at && (
        <ComptaRebours expireAt={candidature.place_expire_at} />
      )}
    </div>
  );
}

// ── Infographie "Comment ça marche" ─────────────────────────────────────────
function Infographie() {
  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/35 mb-2">Le processus</p>
        <h3 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">
          De la candidature<br /><span style={{ color: "rgb(22,92,71)" }}>à la scène</span>
        </h3>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-6 bottom-6 w-px"
          style={{ background: "linear-gradient(180deg, rgb(185,151,83), rgb(22,92,71), rgb(185,151,83), rgb(22,92,71))" }} />

        <div className="space-y-0">
          {ETAPES_PROCESS.map((e, i) => (
            <div key={e.n} className="relative flex gap-5 pb-7 last:pb-0">
              <div className="relative z-10 shrink-0">
                <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-white shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
                  style={{ background: e.color }}>
                  <span className="text-white text-sm font-bold">{e.n}</span>
                </div>
              </div>
              <div className="pt-2.5 flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-base leading-none" style={{ color: e.color }}>{e.icon}</span>
                  <h4 className="text-base font-semibold text-black">{e.titre}</h4>
                </div>
                <p className="text-sm leading-6 text-black/50 ml-7">{e.desc}</p>
                {e.pills.length > 0 && (
                  <div className="ml-7 mt-2 flex flex-wrap gap-1.5">
                    {e.pills.map(pill => (
                      <span key={pill} className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                        style={{
                          background: e.color === "rgb(185,151,83)" ? "rgba(185,151,83,0.1)" : "rgba(22,92,71,0.08)",
                          color: e.color === "rgb(185,151,83)" ? "rgb(110,80,20)" : "rgb(15,75,57)",
                          border: `1px solid ${e.color === "rgb(185,151,83)" ? "rgba(185,151,83,0.2)" : "rgba(22,92,71,0.15)"}`,
                        }}>
                        {pill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tarifs compacts */}
      <div className="mt-7 rounded-[18px] p-4"
        style={{ background: "rgba(22,92,71,0.04)", border: "1px solid rgba(22,92,71,0.1)" }}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/35 mb-3">Tarifs</p>
        <div className="space-y-2">
          {PARCOURS.map(p => {
            const t = calcTarifs(p.slug);
            return (
              <div key={p.slug} className="flex items-center justify-between text-sm">
                <span className="text-black/65 font-medium">{p.label}</span>
                <span className="font-bold" style={{ color: "rgb(22,92,71)" }}>
                  {t.annuel.toLocaleString("fr-BE")} €
                  <span className="text-xs font-normal text-black/30 ml-1">/an</span>
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-black/30 mt-3 pt-3 border-t border-black/6 leading-5">
          Acompte 150 € à la confirmation · annuel ou 3× trimestriel (+4%)
        </p>
      </div>
    </div>
  );
}

// ── Bloc Premium ─────────────────────────────────────────────────────────────
function BlocPremium() {
  return (
    <div className="relative rounded-[20px] overflow-hidden mt-4"
      style={{ background: "rgb(18,56,44)" }}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(185,151,83,0.18),transparent_55%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(185,151,83,0.4),transparent)]" />
      <div className="relative px-5 py-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base" style={{ color: "rgb(185,151,83)" }}>✦</span>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/50">Inclus automatiquement</p>
        </div>
        <p className="text-lg font-semibold text-white mb-0.5">Statut Premium</p>
        <p className="text-sm text-white/45 mb-4 leading-5">
          Tout élève inscrit à un parcours annuel en bénéficie automatiquement.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {PREMIUM_AVANTAGES.map(a => (
            <div key={a.val} className="rounded-[12px] px-2 py-3 text-center"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-xl font-bold text-white mb-0.5">{a.val}</p>
              <p className="text-[10px] text-white/40 leading-[1.3]">{a.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── CTA connexion ─────────────────────────────────────────────────────────────
function CTAConnexion() {
  return (
    <div className="rounded-[20px] overflow-hidden mb-8" style={{ background: "rgb(22,92,71)" }}>
      <div className="px-6 py-5 flex items-center justify-between gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/45 mb-1.5">
            Pour candidater ou s'inscrire
          </p>
          <p className="text-lg font-semibold text-white leading-snug mb-1">
            Connecte-toi ou crée un compte
          </p>
          <p className="text-sm text-white/50 leading-5">
            Suivi en temps réel · Réductions famille · Carte fidélité
          </p>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <Link href="/plateforme/login?redirect=/plateforme/inscription?onglet=parcours"
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-white border border-white/25 hover:border-white/50 transition text-center whitespace-nowrap">
            Se connecter
          </Link>
          <Link href="/plateforme/register?source=inscription"
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-center hover:brightness-105 transition whitespace-nowrap"
            style={{ background: "rgb(185,151,83)", color: "white" }}>
            Créer un compte →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Cartes parcours horizontales ─────────────────────────────────────────────
function CartesParcours() {
  return (
    <div className="space-y-3">
      {PARCOURS.map(p => (
        <div key={p.slug}
          className="rounded-[18px] overflow-hidden border border-black/8 shadow-[0_2px_12px_rgba(0,0,0,0.05)] flex"
          style={{ height: "130px" }}>
          <div className="relative w-32 shrink-0 overflow-hidden">
            <img src={p.photo} alt={p.label} className="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div className="bg-white flex flex-col justify-between px-4 py-3 flex-1 min-w-0">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/30 mb-0.5">{p.tag}</p>
              <p className="text-base font-semibold text-black leading-tight">{p.label}</p>
              <p className="text-xs text-black/45 mt-1 leading-4">{p.desc}</p>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-bold" style={{ color: "rgb(22,92,71)" }}>
                {p.tarif.toLocaleString("fr-BE")} €
                <span className="text-xs font-normal text-black/30 ml-1">/an</span>
              </span>
              <Link href={`/candidature?parcours=${p.slug}`}
                className="rounded-full px-4 py-1.5 text-xs font-semibold text-white hover:brightness-110 transition"
                style={{ background: "rgb(22,92,71)" }}>
                Candidater →
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Tunnel confirmation ───────────────────────────────────────────────────────
function TunnelConfirmation({ candidature }: { candidature: any }) {
  const [etape, setEtape] = useState<"rythme" | "recap" | "paiement">("rythme");
  const [rythme, setRythme] = useState<"annuel" | "trimestriel" | null>(null);
  const [conditions, setConditions] = useState(false);
  const [showConditions, setShowConditions] = useState(false);
  const [loading, setLoading] = useState(false);
  const tarifs = calcTarifs(candidature.parcours);
  const label = PARCOURS_LABELS[candidature.parcours] ?? candidature.parcours;

  return (
    <>
      {showConditions && <ModalConditions onClose={() => setShowConditions(false)} />}

      <div className="rounded-[24px] overflow-hidden border border-black/10 shadow-[0_4px_32px_rgba(0,0,0,0.08)]">
        {/* Header */}
        <div className="px-6 py-5 sm:px-8" style={{ background: "rgb(22,92,71)" }}>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/45 mb-1">
            Inscription · {label}
          </p>
          <p className="text-xl font-semibold text-white">Finalise ton inscription</p>
        </div>

        {/* Stepper */}
        <div className="flex gap-2 px-6 py-3 sm:px-8 border-b border-black/6 bg-white">
          {(["rythme", "recap", "paiement"] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span className="text-sm font-semibold px-4 py-1.5 rounded-full transition"
                style={{
                  background: etape === s ? "rgb(22,92,71)" : "rgba(0,0,0,0.06)",
                  color: etape === s ? "white" : "rgba(0,0,0,0.4)",
                }}>
                {i + 1} {s === "rythme" ? "Rythme" : s === "recap" ? "Récap" : "Paiement"}
              </span>
              {i < 2 && <span className="text-black/15">›</span>}
            </div>
          ))}
        </div>

        <div className="bg-white px-6 py-6 sm:px-8">
          {/* Étape 1 — Rythme */}
          {etape === "rythme" && (
            <div className="space-y-5">
              <p className="text-base font-semibold text-black">Choisis ton rythme de paiement</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { id: "annuel" as const,      titre: "Annuel",      badge: "Base", badgeBg: "rgba(22,92,71,0.1)",    badgeC: "rgb(15,75,57)",  montant: tarifs.annuel,      detail: "Un seul règlement · Zéro supplément" },
                  { id: "trimestriel" as const, titre: "Trimestriel", badge: "+4%",  badgeBg: "rgba(185,151,83,0.12)", badgeC: "rgb(110,80,20)", montant: tarifs.parTrimestre, detail: "3× /trimestre après acompte · sept. / jan. / avr." },
                ].map(opt => (
                  <button key={opt.id} onClick={() => setRythme(opt.id)}
                    className="text-left rounded-[16px] p-5 transition border-2"
                    style={{
                      background: rythme === opt.id ? "rgba(22,92,71,0.04)" : "rgb(247,249,246)",
                      borderColor: rythme === opt.id ? "rgb(22,92,71)" : "rgba(0,0,0,0.08)",
                    }}>
                    <div className="flex justify-between items-start mb-3">
                      <p className="text-base font-semibold text-black">{opt.titre}</p>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: opt.badgeBg, color: opt.badgeC }}>{opt.badge}</span>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: "rgb(22,92,71)" }}>
                      {opt.montant.toLocaleString("fr-BE")} €
                    </p>
                    <p className="text-xs text-black/40 mt-1">{opt.detail}</p>
                  </button>
                ))}
              </div>
              <p className="text-sm text-black/40 rounded-[12px] p-4 border border-black/6 leading-6"
                style={{ background: "rgb(249,250,249)" }}>
                Acompte de <strong className="text-black/60">{ACOMPTE} €</strong> prélevé immédiatement par Bancontact pour sécuriser ta place.
              </p>
              <button disabled={!rythme} onClick={() => setEtape("recap")}
                className="w-full rounded-full py-4 text-base font-semibold text-white hover:brightness-110 disabled:opacity-30 transition"
                style={{ background: "rgb(22,92,71)" }}>
                Continuer →
              </button>
            </div>
          )}

          {/* Étape 2 — Récap */}
          {etape === "recap" && rythme && (
            <div className="space-y-5">
              <p className="text-base font-semibold text-black">Récapitulatif</p>
              <div className="rounded-[16px] overflow-hidden border border-black/8">
                {[
                  { l: "Parcours", v: label },
                  { l: "Rythme",   v: rythme === "annuel" ? "Annuel" : "Trimestriel (+4%)" },
                  { l: "Acompte aujourd'hui", v: `${ACOMPTE} €`, accent: true },
                  ...(rythme === "annuel"
                    ? [{ l: "Solde restant", v: `${(tarifs.annuel - ACOMPTE).toLocaleString("fr-BE")} €` }]
                    : [
                        { l: "Trimestre 1 — sept.", v: `${tarifs.parTrimestre.toLocaleString("fr-BE")} €` },
                        { l: "Trimestre 2 — jan.",  v: `${tarifs.parTrimestre.toLocaleString("fr-BE")} €` },
                        { l: "Trimestre 3 — avr.",  v: `${tarifs.parTrimestre.toLocaleString("fr-BE")} €` },
                      ]
                  ),
                ].map((row: any, i, arr) => (
                  <div key={i} className="flex justify-between text-sm px-5 py-3.5"
                    style={{
                      background: row.accent ? "rgba(22,92,71,0.04)" : i % 2 === 0 ? "white" : "rgb(249,250,249)",
                      borderBottom: i < arr.length - 1 ? "1px solid rgba(0,0,0,0.05)" : "none",
                    }}>
                    <span className="text-black/50">{row.l}</span>
                    <span className="font-semibold" style={{ color: row.accent ? "rgb(22,92,71)" : "black" }}>{row.v}</span>
                  </div>
                ))}
                <div className="flex justify-between text-base font-bold px-5 py-4 border-t border-black/8"
                  style={{ background: "rgba(22,92,71,0.04)" }}>
                  <span>Total annuel</span>
                  <span style={{ color: "rgb(22,92,71)" }}>
                    {(rythme === "annuel" ? tarifs.annuel : tarifs.trimestriel).toLocaleString("fr-BE")} €
                  </span>
                </div>
              </div>

              <div className="rounded-[14px] p-4 text-sm leading-6 text-black/50 space-y-1.5"
                style={{ background: "rgb(249,250,249)", border: "1px solid rgba(0,0,0,0.07)" }}>
                <p><strong className="text-black/65">Engagement annuel ferme.</strong> L'année commencée est due dans son intégralité.</p>
                <p><strong className="text-black/65">Sans remboursement</strong> sauf exception validée par la direction.</p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer rounded-[14px] p-4 border border-black/8 bg-white hover:border-black/15 transition">
                <input type="checkbox" checked={conditions} onChange={e => setConditions(e.target.checked)}
                  className="mt-0.5 w-4 h-4 shrink-0" style={{ accentColor: "rgb(22,92,71)" }} />
                <span className="text-sm text-black/60 leading-6">
                  J'ai lu et j'accepte les{" "}
                  <button
                    onClick={e => { e.preventDefault(); setShowConditions(true); }}
                    className="underline transition hover:opacity-70"
                    style={{ color: "rgb(22,92,71)" }}
                  >
                    conditions générales d'inscription
                  </button>
                  {" "}de Crea'Star.
                </span>
              </label>

              <div className="flex gap-3">
                <button onClick={() => setEtape("rythme")}
                  className="flex-1 rounded-full py-3.5 text-sm font-medium text-black/55 border border-black/10 hover:bg-black/4 transition">
                  ← Retour
                </button>
                <button disabled={!conditions} onClick={() => setEtape("paiement")}
                  className="flex-[2] rounded-full py-3.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-30 transition"
                  style={{ background: "rgb(22,92,71)" }}>
                  Continuer →
                </button>
              </div>
            </div>
          )}

          {/* Étape 3 — Paiement */}
          {etape === "paiement" && (
            <div className="space-y-5">
              <p className="text-base font-semibold text-black">Paiement de l'acompte</p>
              <div className="rounded-[20px] py-10 text-center space-y-2"
                style={{ background: "rgba(22,92,71,0.04)", border: "1.5px solid rgba(22,92,71,0.12)" }}>
                <p className="text-5xl font-bold tracking-tight" style={{ color: "rgb(22,92,71)" }}>{ACOMPTE} €</p>
                <p className="text-sm text-black/40">Bancontact · Sécurisé par Mollie · Non remboursable</p>
              </div>
              <button
                onClick={() => { setLoading(true); alert("Mollie à brancher ✓"); setLoading(false); }}
                disabled={loading}
                className="w-full rounded-full py-4 text-base font-semibold text-white flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-50 transition"
                style={{ background: "rgb(22,92,71)" }}>
                {loading ? "Redirection..." : `Payer ${ACOMPTE} € par Bancontact →`}
              </button>
              <button onClick={() => setEtape("recap")}
                className="w-full text-center text-sm text-black/30 hover:text-black/55 transition py-2">
                ← Retour au récapitulatif
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function OngletParcours({ user, candidature, eleves }: {
  user: { id: string; email: string } | null;
  candidature: any | null;
  eleves: any[];
}) {

  // ── Non connecté ─────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="space-y-8">
        <CTAConnexion />
        <div className="grid gap-10 lg:grid-cols-[480px_1fr] xl:grid-cols-[520px_1fr]">
          <div>
            <CartesParcours />
            <BlocPremium />
          </div>
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Infographie />
          </div>
        </div>
      </div>
    );
  }

  // ── Connecté, aucune candidature (ou foyer multi-élèves) ─────────────────
  // On affiche les cartes + possibilité de candidater pour un élève du foyer
  if (!candidature) {
    return (
      <div className="space-y-8">
        {/* Explication multi-élèves si le foyer a des élèves */}
        {eleves.length > 0 && (
          <div className="rounded-[16px] px-5 py-4 flex items-start gap-3"
            style={{ background: "rgba(22,92,71,0.05)", border: "1px solid rgba(22,92,71,0.12)" }}>
            <span className="text-xl shrink-0">👨‍👩‍👧</span>
            <div>
              <p className="text-sm font-semibold text-black mb-0.5">Foyer avec plusieurs élèves</p>
              <p className="text-sm text-black/55 leading-5">
                Chaque élève peut avoir sa propre candidature. Sélectionne le parcours souhaité — la candidature sera liée au bon profil.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[480px_1fr] xl:grid-cols-[520px_1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black/35 mb-4">
              Choisir un parcours
            </p>
            <CartesParcours />
            <BlocPremium />
          </div>
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Infographie />
          </div>
        </div>
      </div>
    );
  }

  // ── Connecté avec candidature active ────────────────────────────────────
  return (
    <div className="space-y-8">
      {/* Bandeau "ajouter une candidature pour un autre élève" si multi-élèves */}
      {eleves.length > 1 && (
        <div className="rounded-[16px] px-5 py-4 flex items-center justify-between gap-4"
          style={{ background: "rgba(22,92,71,0.05)", border: "1px solid rgba(22,92,71,0.12)" }}>
          <div className="flex items-center gap-3">
            <span className="text-lg">👨‍👩‍👧</span>
            <p className="text-sm text-black/60">
              <strong className="text-black">Autre élève dans ton foyer ?</strong>{" "}
              Tu peux déposer une candidature supplémentaire.
            </p>
          </div>
          <Link href="/candidature"
            className="shrink-0 rounded-full px-4 py-2 text-xs font-semibold text-white hover:brightness-110 transition"
            style={{ background: "rgb(22,92,71)" }}>
            Nouvelle candidature →
          </Link>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Col gauche : statut graphique + tunnel si place proposée */}
        <div className="space-y-8">
          <VueStatutCandidature candidature={candidature} />
          {candidature.statut === "place_proposee" && (
            <TunnelConfirmation candidature={candidature} />
          )}
        </div>

        {/* Col droite : infographie sticky */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Infographie />
        </div>
      </div>
    </div>
  );
}