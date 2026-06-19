// // "use client";
// // // app/plateforme/inscription/OngletEveil.tsx — layout dense avec photo hero

// // import Link from "next/link";
// // import { useState } from "react";

// // const PHOTO = "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&q=80";

// // interface GroupeEveil {
// //   id: string; nom: string;
// //   jour_semaine?: string | null; heure_debut?: string | null; heure_fin?: string | null;
// //   places_max: number; places_restantes: number; complet: boolean;
// // }
// // interface Eleve { id: string; prenom: string; nom: string; date_naissance?: string | null; statut_premium: boolean; }
// // interface Props { user: { id: string; email: string } | null; eleves: Eleve[]; groupes: GroupeEveil[]; }

// // function calcAge(d?: string | null) {
// //   if (!d) return null;
// //   return Math.floor((Date.now() - new Date(d).getTime()) / (365.25 * 86400000));
// // }
// // function formatH(g: GroupeEveil) {
// //   if (!g.jour_semaine) return "Horaire à définir";
// //   return [g.jour_semaine, g.heure_debut ? `${g.heure_debut}${g.heure_fin ? ` → ${g.heure_fin}` : ""}` : ""].filter(Boolean).join(" · ");
// // }

// // function PlaceBadge({ g }: { g: GroupeEveil }) {
// //   if (g.complet) return <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-black/6 text-black/40">Complet</span>;
// //   const u = g.places_restantes <= 2;
// //   return <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
// //     style={{ background: u ? "rgba(220,38,38,0.08)" : "rgba(22,92,71,0.08)", color: u ? "rgb(185,28,28)" : "rgb(15,75,57)" }}>
// //     {g.places_restantes} pl.
// //   </span>;
// // }

// // export default function OngletEveil({ user, eleves, groupes }: Props) {
// //   const [eleveId, setEleveId] = useState<string | null>(null);
// //   const [groupeId, setGroupeId] = useState<string | null>(null);
// //   const [etape, setEtape] = useState<"selection" | "confirm">("selection");
// //   const [loading, setLoading] = useState(false);

// //   const eleve = eleves.find(e => e.id === eleveId);
// //   const groupe = groupes.find(g => g.id === groupeId);

// //   return (
// //     <div className="space-y-8">

// //       {/* ── Hero photo + info côte à côte ── */}
// //       <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
// //         {/* Photo */}
// //         <div className="relative rounded-[20px] overflow-hidden h-56 lg:h-auto">
// //           <img src={PHOTO} alt="Enfants faisant de l'éveil musical" className="w-full h-full object-cover" />
// //           <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,0.65)_100%)]" />
// //           <div className="absolute bottom-5 left-5 right-5">
// //             <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/55 mb-1">Éveil musical · 3 à 8 ans</p>
// //             <p className="text-xl font-semibold text-white leading-snug">La musique avant les règles</p>
// //           </div>
// //         </div>

// //         {/* Info + groupes */}
// //         <div className="rounded-[20px] overflow-hidden border border-black/8">
// //           <div className="px-5 py-4 border-b border-black/6" style={{ background: "rgb(22,92,71)" }}>
// //             <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Groupes disponibles</p>
// //           </div>
// //           <div className="bg-white">
// //             {groupes.length === 0 ? (
// //               <p className="px-5 py-5 text-xs text-black/40 italic">Aucun groupe ouvert pour le moment.</p>
// //             ) : (
// //               <div className="divide-y divide-black/5">
// //                 {groupes.map(g => (
// //                   <div key={g.id} className="flex items-center justify-between px-5 py-3 gap-3">
// //                     <div>
// //                       <p className="text-xs font-semibold text-black">{g.nom}</p>
// //                       <p className="text-[10px] text-black/40 mt-0.5">{formatH(g)}</p>
// //                     </div>
// //                     <PlaceBadge g={g} />
// //                   </div>
// //                 ))}
// //               </div>
// //             )}
// //             <div className="px-5 py-3 border-t border-black/5"
// //               style={{ background: "rgba(185,151,83,0.04)" }}>
// //               <p className="text-[10px] text-black/45 leading-4">
// //                 <span style={{ color: "rgb(185,151,83)" }}>◈ </span>
// //                 Conçu pour les <strong className="text-black/60">3 à 8 ans</strong>. Exceptions gérées par la direction.
// //               </p>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* ── Non connecté ── */}
// //       {!user && (
// //         <div className="rounded-[20px] px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
// //           style={{ background: "rgb(22,92,71)" }}>
// //           <div>
// //             <p className="text-sm font-semibold text-white">Un compte est nécessaire pour s'inscrire</p>
// //             <p className="text-xs text-white/50 mt-0.5">Carte fidélité, réductions famille, suivi des cours.</p>
// //           </div>
// //           <div className="flex gap-2 shrink-0">
// //             <Link href="/plateforme/login?redirect=/plateforme/inscription?onglet=eveil"
// //               className="rounded-full px-4 py-2.5 text-xs font-semibold text-white border border-white/20 hover:border-white/40 transition">
// //               Se connecter
// //             </Link>
// //             <Link href="/plateforme/register?source=eveil"
// //               className="rounded-full px-4 py-2.5 text-xs font-semibold hover:brightness-105 transition"
// //               style={{ background: "rgb(185,151,83)", color: "white" }}>
// //               Créer un compte →
// //             </Link>
// //           </div>
// //         </div>
// //       )}

// //       {/* ── Connecté — sélection ── */}
// //       {user && etape === "selection" && (
// //         <div className="grid gap-5 sm:grid-cols-2">
// //           {/* Sélection élève */}
// //           <div className="rounded-[20px] overflow-hidden border border-black/8">
// //             <div className="px-5 py-3 border-b border-black/6" style={{ background: "rgb(247,249,246)" }}>
// //               <p className="text-xs font-semibold text-black">Pour quel enfant ?</p>
// //             </div>
// //             <div className="bg-white p-3 space-y-2">
// //               {eleves.length === 0 ? (
// //                 <div className="p-4 text-center">
// //                   <p className="text-xs text-black/45 mb-3">Aucun élève dans le foyer.</p>
// //                   <Link href="/plateforme/dashboard?action=ajouter-eleve"
// //                     className="text-xs font-semibold" style={{ color: "rgb(22,92,71)" }}>
// //                     Ajouter un élève →
// //                   </Link>
// //                 </div>
// //               ) : eleves.map(e => {
// //                 const a = calcAge(e.date_naissance);
// //                 const sel = eleveId === e.id;
// //                 const hors = a !== null && (a < 3 || a > 8);
// //                 return (
// //                   <button key={e.id} onClick={() => setEleveId(e.id)}
// //                     className="w-full text-left rounded-[12px] p-3 transition border-2"
// //                     style={{
// //                       background: sel ? "rgba(22,92,71,0.05)" : "rgb(249,250,249)",
// //                       borderColor: sel ? "rgb(22,92,71)" : "rgba(0,0,0,0.06)",
// //                     }}>
// //                     <p className="text-sm font-semibold text-black">{e.prenom} {e.nom}</p>
// //                     <p className="text-[10px] text-black/40 mt-0.5">
// //                       {a !== null ? `${a} ans` : "Âge non renseigné"}
// //                       {hors && <span className="ml-1.5 text-amber-600 font-medium">⚠ Hors tranche</span>}
// //                     </p>
// //                   </button>
// //                 );
// //               })}
// //             </div>
// //           </div>

// //           {/* Sélection groupe */}
// //           <div className="rounded-[20px] overflow-hidden border border-black/8">
// //             <div className="px-5 py-3 border-b border-black/6" style={{ background: "rgb(247,249,246)" }}>
// //               <p className="text-xs font-semibold text-black">Choisir un groupe</p>
// //             </div>
// //             <div className="bg-white p-3 space-y-2">
// //               {groupes.length === 0 ? (
// //                 <p className="p-4 text-xs text-black/40 italic">Aucun groupe disponible.</p>
// //               ) : groupes.map(g => {
// //                 const sel = groupeId === g.id;
// //                 return (
// //                   <button key={g.id} disabled={g.complet} onClick={() => !g.complet && setGroupeId(g.id)}
// //                     className="w-full text-left rounded-[12px] p-3 transition border-2 disabled:opacity-40"
// //                     style={{
// //                       background: sel ? "rgba(22,92,71,0.05)" : "rgb(249,250,249)",
// //                       borderColor: sel ? "rgb(22,92,71)" : "rgba(0,0,0,0.06)",
// //                     }}>
// //                     <div className="flex justify-between items-start">
// //                       <div>
// //                         <p className="text-xs font-semibold text-black">{g.nom}</p>
// //                         <p className="text-[10px] text-black/40 mt-0.5">{formatH(g)}</p>
// //                       </div>
// //                       <PlaceBadge g={g} />
// //                     </div>
// //                   </button>
// //                 );
// //               })}
// //               {groupes.length > 0 && groupes.every(g => g.complet) && (
// //                 <div className="rounded-[12px] p-3 mt-1" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
// //                   <p className="text-[10px] font-semibold text-blue-700 mb-1">Tout est complet.</p>
// //                   <Link href="/contact" className="text-[10px] text-blue-600 underline">Me mettre sur liste d'attente →</Link>
// //                 </div>
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {user && etape === "selection" && (
// //         <button disabled={!eleveId || !groupeId} onClick={() => setEtape("confirm")}
// //           className="w-full rounded-full py-3.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-30 transition"
// //           style={{ background: "rgb(22,92,71)" }}>
// //           Confirmer la sélection →
// //         </button>
// //       )}

// //       {/* ── Confirmation ── */}
// //       {user && etape === "confirm" && (
// //         <div className="rounded-[24px] overflow-hidden border border-black/8">
// //           <div className="px-6 py-4 sm:px-8" style={{ background: "rgb(22,92,71)" }}>
// //             <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Récapitulatif · Éveil musical</p>
// //           </div>
// //           <div className="bg-white divide-y divide-black/5">
// //             {[
// //               { l: "Élève",   v: `${eleve?.prenom} ${eleve?.nom}` },
// //               { l: "Âge",     v: calcAge(eleve?.date_naissance) !== null ? `${calcAge(eleve?.date_naissance)} ans` : "Non renseigné" },
// //               { l: "Groupe",  v: groupe?.nom ?? "—" },
// //               { l: "Horaire", v: groupe ? formatH(groupe) : "—" },
// //             ].map(row => (
// //               <div key={row.l} className="flex justify-between px-6 py-3 sm:px-8 text-sm">
// //                 <span className="text-black/45">{row.l}</span>
// //                 <span className="font-semibold text-black">{row.v}</span>
// //               </div>
// //             ))}
// //           </div>
// //           <div className="bg-white px-6 py-4 sm:px-8 border-t border-black/6 flex gap-3">
// //             <button onClick={() => setEtape("selection")}
// //               className="flex-1 rounded-full py-3 text-sm font-medium text-black/55 border border-black/10 hover:bg-black/4 transition">
// //               ← Retour
// //             </button>
// //             <button onClick={() => { setLoading(true); alert("Mollie à brancher ✓"); setLoading(false); }}
// //               disabled={loading}
// //               className="flex-[2] rounded-full py-3 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50 transition"
// //               style={{ background: "rgb(22,92,71)" }}>
// //               {loading ? "Redirection..." : "Confirmer et payer →"}
// //             </button>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// "use client";
// // app/plateforme/inscription/OngletEveil.tsx
// // v2 — sans photo hero (déjà dans le hero principal), focus sélection groupe
// // Tarif : mettre à jour TARIF_EVEIL quand fixé

// import Link from "next/link";
// import { useState } from "react";

// const TARIF_EVEIL = null; // ← À renseigner quand fixé (ex: 45, 350, etc.)
// const TARIF_UNITE = "€/mois"; // ← adapter selon logique tarifaire

// interface GroupeEveil {
//   id: string;
//   nom: string;
//   jour_semaine?: string | null;
//   heure_debut?: string | null;
//   heure_fin?: string | null;
//   places_restantes: number;
//   complet: boolean;
// }

// interface Eleve {
//   id: string;
//   prenom: string;
//   nom: string;
//   date_naissance?: string | null;
// }

// interface Props {
//   user: { id: string; email: string } | null;
//   eleves: Eleve[];
//   groupes: GroupeEveil[];
// }

// function calcAge(dateNaissance?: string | null): number | null {
//   if (!dateNaissance) return null;
//   const today = new Date();
//   const born = new Date(dateNaissance);
//   let age = today.getFullYear() - born.getFullYear();
//   const m = today.getMonth() - born.getMonth();
//   if (m < 0 || (m === 0 && today.getDate() < born.getDate())) age--;
//   return age;
// }

// function formatH(g: GroupeEveil): string {
//   if (!g.jour_semaine) return "Horaire à confirmer";
//   const parts = [g.jour_semaine];
//   if (g.heure_debut) {
//     const h = g.heure_debut.slice(0, 5);
//     const f = g.heure_fin ? ` → ${g.heure_fin.slice(0, 5)}` : "";
//     parts.push(`${h}${f}`);
//   }
//   return parts.join(" · ");
// }

// // Badge places restantes
// function PlaceBadge({ g }: { g: GroupeEveil }) {
//   if (g.complet) return (
//     <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-black/6 text-black/40">
//       Complet
//     </span>
//   );
//   const urgent = g.places_restantes <= 2;
//   return (
//     <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
//       style={{
//         background: urgent ? "rgba(220,38,38,0.08)" : "rgba(22,92,71,0.08)",
//         color: urgent ? "rgb(185,28,28)" : "rgb(15,75,57)",
//       }}>
//       {g.places_restantes} place{g.places_restantes > 1 ? "s" : ""} libre{g.places_restantes > 1 ? "s" : ""}
//     </span>
//   );
// }

// // État vide — aucun groupe ouvert
// function AucunGroupe() {
//   return (
//     <div className="rounded-[24px] border border-black/8 bg-white px-8 py-14 text-center">
//       <p className="text-3xl mb-4">🎵</p>
//       <p className="text-base font-semibold text-black mb-2">
//         Aucun groupe ouvert pour le moment
//       </p>
//       <p className="text-sm text-black/45 leading-6 max-w-sm mx-auto mb-6">
//         La direction n'a pas encore ouvert de groupe d'éveil musical pour cette année.
//         Laisse-nous tes coordonnées, on te prévient dès l'ouverture.
//       </p>
//       <Link
//         href="/contact?sujet=eveil-musical"
//         className="inline-flex rounded-full px-6 py-3 text-sm font-semibold text-white hover:brightness-110 transition"
//         style={{ background: "rgb(22,92,71)" }}
//       >
//         Me faire notifier →
//       </Link>
//     </div>
//   );
// }

// export default function OngletEveil({ user, eleves, groupes }: Props) {
//   const [eleveId, setEleveId] = useState<string | null>(null);
//   const [groupeId, setGroupeId] = useState<string | null>(null);
//   const [etape, setEtape] = useState<"selection" | "confirm">("selection");
//   const [loading, setLoading] = useState(false);
//   const [success, setSuccess] = useState(false);

//   const eleve = eleves.find(e => e.id === eleveId);
//   const groupe = groupes.find(g => g.id === groupeId);
//   const tousComplets = groupes.length > 0 && groupes.every(g => g.complet);

//   const handleInscrire = async () => {
//     if (!eleveId || !groupeId) return;
//     setLoading(true);
//     try {
//       // TODO: appel API /api/inscription/eveil
//       await new Promise(r => setTimeout(r, 800)); // placeholder
//       setSuccess(true);
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Succès ───────────────────────────────────────────────────────────────
//   if (success) {
//     return (
//       <div className="rounded-[24px] overflow-hidden border border-black/8 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
//         <div className="relative px-7 py-10 text-center overflow-hidden" style={{ background: "rgb(18,56,44)" }}>
//           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(185,151,83,0.15),transparent_55%)]" />
//           <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(185,151,83,0.4),transparent)]" />
//           <div className="relative">
//             <p className="text-4xl mb-4">🎉</p>
//             <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/40 mb-3">
//               Éveil musical · {groupe?.nom}
//             </p>
//             <h3 className="text-2xl font-semibold text-white mb-3">Inscription enregistrée !</h3>
//             <p className="text-sm text-white/60 leading-6 max-w-sm mx-auto">
//               La direction va confirmer la place de <strong className="text-white/80">{eleve?.prenom}</strong>.
//               Tu recevras un email de confirmation dans les 24 heures.
//             </p>
//           </div>
//         </div>
//         <div className="bg-white px-7 py-5 flex flex-col sm:flex-row gap-3 justify-center">
//           <Link
//             href="/plateforme/dashboard"
//             className="rounded-full px-6 py-3 text-sm font-semibold text-white text-center hover:brightness-110 transition"
//             style={{ background: "rgb(22,92,71)" }}
//           >
//             Voir mon espace →
//           </Link>
//           <button
//             onClick={() => { setSuccess(false); setEleveId(null); setGroupeId(null); setEtape("selection"); }}
//             className="rounded-full px-6 py-3 text-sm font-medium text-black/50 border border-black/10 hover:bg-black/4 transition"
//           >
//             Inscrire un autre enfant
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">

//       {/* ── Bandeau informatif compact ── */}
//       <div className="rounded-[16px] px-5 py-4 flex items-start gap-3"
//         style={{ background: "rgba(22,92,71,0.05)", border: "1px solid rgba(22,92,71,0.1)" }}>
//         <span className="text-lg shrink-0">🎵</span>
//         <div className="flex-1 min-w-0">
//           <p className="text-sm font-semibold text-black mb-0.5">Éveil musical · 3 à 8 ans</p>
//           <p className="text-sm text-black/55 leading-5">
//             Pas de candidature, pas de sélection — les places sont attribuées par ordre d'inscription.
//             Groupes de 8 à 10 enfants maximum · 45 min par séance.
//             {TARIF_EVEIL && (
//               <span className="ml-1 font-semibold" style={{ color: "rgb(22,92,71)" }}>
//                 · {TARIF_EVEIL} {TARIF_UNITE}
//               </span>
//             )}
//           </p>
//         </div>
//       </div>

//       {/* ── Aucun groupe ── */}
//       {groupes.length === 0 && <AucunGroupe />}

//       {/* ── Tous complets ── */}
//       {tousComplets && (
//         <div className="rounded-[16px] px-5 py-4 flex items-start gap-3"
//           style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
//           <span className="text-base shrink-0">🕐</span>
//           <div>
//             <p className="text-sm font-semibold text-blue-800 mb-0.5">Tous les groupes sont complets</p>
//             <p className="text-sm text-blue-700/70 leading-5">
//               Tu peux te mettre sur liste d'attente — on te prévient dès qu'une place se libère.
//             </p>
//             <Link href="/contact?sujet=eveil-attente"
//               className="inline-block mt-2 text-xs font-semibold text-blue-700 underline underline-offset-2">
//               Rejoindre la liste d'attente →
//             </Link>
//           </div>
//         </div>
//       )}

//       {/* ── Contenu principal : groupes + sélection ── */}
//       {groupes.length > 0 && (
//         <div className="grid gap-6 lg:grid-cols-[1fr_380px]">

//           {/* Col gauche — liste des groupes */}
//           <div>
//             <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/35 mb-3">
//               Groupes disponibles
//             </p>
//             <div className="space-y-2">
//               {groupes.map(g => {
//                 const sel = groupeId === g.id;
//                 return (
//                   <button
//                     key={g.id}
//                     disabled={g.complet}
//                     onClick={() => !g.complet && setGroupeId(g.id)}
//                     className="w-full text-left rounded-[16px] p-4 transition border-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                     style={{
//                       background: sel ? "rgba(22,92,71,0.05)" : "white",
//                       borderColor: sel ? "rgb(22,92,71)" : "rgba(0,0,0,0.08)",
//                       boxShadow: sel ? "0 0 0 3px rgba(22,92,71,0.06)" : "none",
//                     }}
//                   >
//                     <div className="flex items-center justify-between gap-3">
//                       <div className="flex items-center gap-3 min-w-0">
//                         {/* Indicateur sélectionné */}
//                         <div className="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center"
//                           style={{
//                             borderColor: sel ? "rgb(22,92,71)" : "rgba(0,0,0,0.2)",
//                             background: sel ? "rgb(22,92,71)" : "transparent",
//                           }}>
//                           {sel && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
//                         </div>
//                         <div className="min-w-0">
//                           <p className="text-sm font-semibold text-black">{g.nom}</p>
//                           <p className="text-[11px] text-black/40 mt-0.5">{formatH(g)}</p>
//                         </div>
//                       </div>
//                       <PlaceBadge g={g} />
//                     </div>
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Col droite — sélection élève + action */}
//           <div className="space-y-4">

//             {/* Non connecté */}
//             {!user && (
//               <div className="rounded-[20px] overflow-hidden">
//                 <div className="px-5 py-5" style={{ background: "rgb(22,92,71)" }}>
//                   <p className="text-sm font-semibold text-white mb-1">Un compte est nécessaire pour s'inscrire</p>
//                   <p className="text-xs text-white/50 leading-5 mb-4">
//                     Carte fidélité, réductions famille, suivi des cours.
//                   </p>
//                   <div className="flex flex-col gap-2">
//                     <Link href="/plateforme/login?redirect=/plateforme/inscription?onglet=eveil"
//                       className="rounded-full px-4 py-2.5 text-xs font-semibold text-center text-white border border-white/25 hover:border-white/50 transition">
//                       Se connecter
//                     </Link>
//                     <Link href="/plateforme/register?source=eveil"
//                       className="rounded-full px-4 py-2.5 text-xs font-semibold text-center hover:brightness-105 transition"
//                       style={{ background: "rgb(185,151,83)", color: "white" }}>
//                       Créer un compte →
//                     </Link>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Connecté — étape sélection */}
//             {user && etape === "selection" && (
//               <div className="rounded-[20px] overflow-hidden border border-black/8">
//                 <div className="px-5 py-3.5 border-b border-black/6" style={{ background: "rgb(247,249,246)" }}>
//                   <p className="text-xs font-semibold text-black">Pour quel enfant ?</p>
//                 </div>
//                 <div className="bg-white p-3 space-y-2">
//                   {eleves.length === 0 ? (
//                     <div className="p-4 text-center">
//                       <p className="text-xs text-black/45 mb-3">Aucun élève dans le foyer.</p>
//                       <Link href="/plateforme/dashboard?action=ajouter-eleve"
//                         className="text-xs font-semibold" style={{ color: "rgb(22,92,71)" }}>
//                         Ajouter un enfant →
//                       </Link>
//                     </div>
//                   ) : eleves.map(e => {
//                     const age = calcAge(e.date_naissance);
//                     const sel = eleveId === e.id;
//                     const hors = age !== null && (age < 3 || age > 8);
//                     return (
//                       <button key={e.id} onClick={() => setEleveId(e.id)}
//                         className="w-full text-left rounded-[12px] p-3 transition border-2"
//                         style={{
//                           background: sel ? "rgba(22,92,71,0.05)" : "rgb(249,250,249)",
//                           borderColor: sel ? "rgb(22,92,71)" : "rgba(0,0,0,0.06)",
//                         }}>
//                         <div className="flex items-center justify-between">
//                           <div>
//                             <p className="text-sm font-semibold text-black">{e.prenom} {e.nom}</p>
//                             <p className="text-[10px] text-black/40 mt-0.5">
//                               {age !== null ? `${age} ans` : "Âge non renseigné"}
//                             </p>
//                           </div>
//                           {hors && (
//                             <span className="text-[10px] font-medium px-2 py-1 rounded-full"
//                               style={{ background: "rgba(245,158,11,0.1)", color: "rgb(146,95,14)" }}>
//                               Hors tranche
//                             </span>
//                           )}
//                         </div>
//                         {hors && sel && (
//                           <p className="text-[10px] text-amber-700 mt-2 leading-4">
//                             L'éveil musical est conçu pour les 3–8 ans. Une exception peut être accordée par la direction.
//                           </p>
//                         )}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}

//             {/* Bouton continuer */}
//             {user && etape === "selection" && (
//               <button
//                 disabled={!eleveId || !groupeId}
//                 onClick={() => setEtape("confirm")}
//                 className="w-full rounded-full py-3.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-30 transition"
//                 style={{ background: "rgb(22,92,71)" }}
//               >
//                 Confirmer la sélection →
//               </button>
//             )}

//             {/* Connecté — étape confirmation */}
//             {user && etape === "confirm" && (
//               <div className="rounded-[20px] overflow-hidden border border-black/8">
//                 <div className="px-5 py-4" style={{ background: "rgb(22,92,71)" }}>
//                   <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-1">
//                     Récapitulatif · Éveil musical
//                   </p>
//                   <p className="text-base font-semibold text-white">Confirme l'inscription</p>
//                 </div>

//                 <div className="bg-white divide-y divide-black/5">
//                   {[
//                     { l: "Enfant",  v: `${eleve?.prenom} ${eleve?.nom}` },
//                     { l: "Âge",    v: calcAge(eleve?.date_naissance) !== null ? `${calcAge(eleve?.date_naissance)} ans` : "Non renseigné" },
//                     { l: "Groupe", v: groupe?.nom ?? "—" },
//                     { l: "Horaire", v: groupe ? formatH(groupe) : "—" },
//                     ...(TARIF_EVEIL ? [{ l: "Tarif", v: `${TARIF_EVEIL} ${TARIF_UNITE}` }] : []),
//                   ].map(row => (
//                     <div key={row.l} className="flex justify-between text-sm px-5 py-3">
//                       <span className="text-black/45">{row.l}</span>
//                       <span className="font-medium text-black">{row.v}</span>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="px-5 py-4 border-t border-black/6 bg-white space-y-2">
//                   <button
//                     onClick={handleInscrire}
//                     disabled={loading}
//                     className="w-full rounded-full py-3.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50 transition flex items-center justify-center gap-2"
//                     style={{ background: "rgb(22,92,71)" }}
//                   >
//                     {loading ? "Inscription en cours…" : "Valider l'inscription →"}
//                   </button>
//                   <button
//                     onClick={() => setEtape("selection")}
//                     className="w-full rounded-full py-2.5 text-sm text-black/35 hover:text-black/55 transition"
//                   >
//                     ← Modifier
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";
// app/plateforme/inscription/OngletEveil.tsx
// v2 — sans photo hero (déjà dans le hero principal), focus sélection groupe
// Tarif : mettre à jour TARIF_EVEIL quand fixé

import Link from "next/link";
import { useState } from "react";

const TARIF_EVEIL = 500; // ← À renseigner quand fixé (ex: 45, 350, etc.)
const TARIF_UNITE = "€/an";

interface GroupeEveil {
  id: string;
  nom: string;
  jour_semaine?: string | null;
  heure_debut?: string | null;
  heure_fin?: string | null;
  places_restantes: number;
  complet: boolean;
}

interface Eleve {
  id: string;
  prenom: string;
  nom: string;
  date_naissance?: string | null;
}

interface Props {
  user: { id: string; email: string } | null;
  eleves: Eleve[];
  groupes: GroupeEveil[];
}

function calcAge(dateNaissance?: string | null): number | null {
  if (!dateNaissance) return null;
  const today = new Date();
  const born = new Date(dateNaissance);
  let age = today.getFullYear() - born.getFullYear();
  const m = today.getMonth() - born.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < born.getDate())) age--;
  return age;
}

function formatH(g: GroupeEveil): string {
  if (!g.jour_semaine) return "Horaire à confirmer";
  const parts = [g.jour_semaine];
  if (g.heure_debut) {
    const h = g.heure_debut.slice(0, 5);
    const f = g.heure_fin ? ` → ${g.heure_fin.slice(0, 5)}` : "";
    parts.push(`${h}${f}`);
  }
  return parts.join(" · ");
}

// Badge places restantes
function PlaceBadge({ g }: { g: GroupeEveil }) {
  if (g.complet) return (
    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-black/6 text-black/40">
      Complet
    </span>
  );
  const urgent = g.places_restantes <= 2;
  return (
    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
      style={{
        background: urgent ? "rgba(220,38,38,0.08)" : "rgba(22,92,71,0.08)",
        color: urgent ? "rgb(185,28,28)" : "rgb(15,75,57)",
      }}>
      {g.places_restantes} place{g.places_restantes > 1 ? "s" : ""} libre{g.places_restantes > 1 ? "s" : ""}
    </span>
  );
}

// État vide — aucun groupe ouvert
function AucunGroupe() {
  return (
    <div className="rounded-[24px] border border-black/8 bg-white px-8 py-14 text-center">
      <p className="text-3xl mb-4">🎵</p>
      <p className="text-base font-semibold text-black mb-2">
        Aucun groupe ouvert pour le moment
      </p>
      <p className="text-sm text-black/45 leading-6 max-w-sm mx-auto mb-6">
        La direction n'a pas encore ouvert de groupe d'éveil musical pour cette année.
        Laisse-nous tes coordonnées, on te prévient dès l'ouverture.
      </p>
      <Link
        href="/contact?sujet=eveil-musical"
        className="inline-flex rounded-full px-6 py-3 text-sm font-semibold text-white hover:brightness-110 transition"
        style={{ background: "rgb(22,92,71)" }}
      >
        Me faire notifier →
      </Link>
    </div>
  );
}

export default function OngletEveil({ user, eleves, groupes }: Props) {
  const [eleveId, setEleveId] = useState<string | null>(null);
  const [groupeId, setGroupeId] = useState<string | null>(null);
  const [etape, setEtape] = useState<"selection" | "confirm">("selection");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const eleve = eleves.find(e => e.id === eleveId);
  const groupe = groupes.find(g => g.id === groupeId);
  const tousComplets = groupes.length > 0 && groupes.every(g => g.complet);

  const handleInscrire = async () => {
    if (!eleveId || !groupeId) return;
    setLoading(true);
    try {
      // TODO: appel API /api/inscription/eveil
      await new Promise(r => setTimeout(r, 800)); // placeholder
      setSuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ── Succès ───────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="rounded-[24px] overflow-hidden border border-black/8 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
        <div className="relative px-7 py-10 text-center overflow-hidden" style={{ background: "rgb(18,56,44)" }}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(185,151,83,0.15),transparent_55%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(185,151,83,0.4),transparent)]" />
          <div className="relative">
            <p className="text-4xl mb-4">🎉</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/40 mb-3">
              Éveil musical · {groupe?.nom}
            </p>
            <h3 className="text-2xl font-semibold text-white mb-3">Inscription enregistrée !</h3>
            <p className="text-sm text-white/60 leading-6 max-w-sm mx-auto">
              La direction va confirmer la place de <strong className="text-white/80">{eleve?.prenom}</strong>.
              Tu recevras un email de confirmation dans les 24 heures.
            </p>
          </div>
        </div>
        <div className="bg-white px-7 py-5 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/plateforme/dashboard"
            className="rounded-full px-6 py-3 text-sm font-semibold text-white text-center hover:brightness-110 transition"
            style={{ background: "rgb(22,92,71)" }}
          >
            Voir mon espace →
          </Link>
          <button
            onClick={() => { setSuccess(false); setEleveId(null); setGroupeId(null); setEtape("selection"); }}
            className="rounded-full px-6 py-3 text-sm font-medium text-black/50 border border-black/10 hover:bg-black/4 transition"
          >
            Inscrire un autre enfant
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Bandeau informatif compact ── */}
      <div className="rounded-[16px] px-5 py-4 flex items-start gap-3"
        style={{ background: "rgba(22,92,71,0.05)", border: "1px solid rgba(22,92,71,0.1)" }}>
        <span className="text-lg shrink-0">🎵</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-black mb-0.5">Éveil musical · 3 à 8 ans</p>
          <p className="text-sm text-black/55 leading-5">
            Pas de candidature, pas de sélection — les places sont attribuées par ordre d'inscription.
            Groupes de 8 à 10 enfants maximum · 45 min par séance.
            {TARIF_EVEIL && (
              <span className="ml-1 font-semibold" style={{ color: "rgb(22,92,71)" }}>
                · {TARIF_EVEIL} {TARIF_UNITE}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* ── Pas de place disponible : aucun groupe OU tous complets ── */}
      {(groupes.length === 0 || tousComplets) && (
        <div className="rounded-[24px] overflow-hidden border border-black/8">
          <div className="px-6 py-5" style={{ background: "rgb(18,56,44)" }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🎵</span>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/40">
                Éveil musical · 3 à 8 ans
              </p>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">
              {groupes.length === 0
                ? "Aucun groupe ouvert pour le moment"
                : "Tous les groupes sont complets"}
            </h3>
            <p className="text-sm text-white/55 leading-5">
              {groupes.length === 0
                ? "La direction n'a pas encore ouvert de groupe d'éveil musical. Laisse-nous tes coordonnées, on te prévient dès l'ouverture."
                : "Il n'y a plus de place disponible pour le moment. Laisse-nous tes coordonnées, on te prévient dès qu'une place se libère."}
            </p>
          </div>
          <div className="bg-white px-6 py-4 flex flex-col sm:flex-row gap-3">
            <Link
              href="/contact?sujet=eveil-musical"
              className="inline-flex rounded-full px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition"
              style={{ background: "rgb(22,92,71)" }}
            >
              Me faire notifier →
            </Link>
            <Link
              href="/contact"
              className="inline-flex rounded-full px-5 py-2.5 text-sm font-medium text-black/50 border border-black/10 hover:bg-black/4 transition"
            >
              Poser une question
            </Link>
          </div>
        </div>
      )}

      {/* ── Contenu principal : groupes + sélection ── */}
      {groupes.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">

          {/* Col gauche — liste des groupes */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/35 mb-3">
              Groupes disponibles
            </p>
            <div className="space-y-2">
              {groupes.map(g => {
                const sel = groupeId === g.id;
                return (
                  <button
                    key={g.id}
                    disabled={g.complet}
                    onClick={() => !g.complet && setGroupeId(g.id)}
                    className="w-full text-left rounded-[16px] p-4 transition border-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: sel ? "rgba(22,92,71,0.05)" : "white",
                      borderColor: sel ? "rgb(22,92,71)" : "rgba(0,0,0,0.08)",
                      boxShadow: sel ? "0 0 0 3px rgba(22,92,71,0.06)" : "none",
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Indicateur sélectionné */}
                        <div className="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center"
                          style={{
                            borderColor: sel ? "rgb(22,92,71)" : "rgba(0,0,0,0.2)",
                            background: sel ? "rgb(22,92,71)" : "transparent",
                          }}>
                          {sel && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-black">{g.nom}</p>
                          <p className="text-[11px] text-black/40 mt-0.5">{formatH(g)}</p>
                        </div>
                      </div>
                      <PlaceBadge g={g} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Col droite — sélection élève + action */}
          <div className="space-y-4">

            {/* Non connecté */}
            {!user && (
              <div className="rounded-[20px] overflow-hidden">
                <div className="px-5 py-5" style={{ background: "rgb(22,92,71)" }}>
                  <p className="text-sm font-semibold text-white mb-1">Un compte est nécessaire pour s'inscrire</p>
                  <p className="text-xs text-white/50 leading-5 mb-4">
                    Carte fidélité, réductions famille, suivi des cours.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Link href="/plateforme/login?redirect=/plateforme/inscription?onglet=eveil"
                      className="rounded-full px-4 py-2.5 text-xs font-semibold text-center text-white border border-white/25 hover:border-white/50 transition">
                      Se connecter
                    </Link>
                    <Link href="/plateforme/register?source=eveil"
                      className="rounded-full px-4 py-2.5 text-xs font-semibold text-center hover:brightness-105 transition"
                      style={{ background: "rgb(185,151,83)", color: "white" }}>
                      Créer un compte →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Connecté — étape sélection */}
            {user && etape === "selection" && (
              <div className="rounded-[20px] overflow-hidden border border-black/8">
                <div className="px-5 py-3.5 border-b border-black/6" style={{ background: "rgb(247,249,246)" }}>
                  <p className="text-xs font-semibold text-black">Pour quel enfant ?</p>
                </div>
                <div className="bg-white p-3 space-y-2">
                  {eleves.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-xs text-black/45 mb-3">Aucun élève dans le foyer.</p>
                      <Link href="/plateforme/dashboard?action=ajouter-eleve"
                        className="text-xs font-semibold" style={{ color: "rgb(22,92,71)" }}>
                        Ajouter un enfant →
                      </Link>
                    </div>
                  ) : eleves.map(e => {
                    const age = calcAge(e.date_naissance);
                    const sel = eleveId === e.id;
                    const hors = age !== null && (age < 3 || age > 8);
                    return (
                      <button key={e.id} onClick={() => setEleveId(e.id)}
                        className="w-full text-left rounded-[12px] p-3 transition border-2"
                        style={{
                          background: sel ? "rgba(22,92,71,0.05)" : "rgb(249,250,249)",
                          borderColor: sel ? "rgb(22,92,71)" : "rgba(0,0,0,0.06)",
                        }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-black">{e.prenom} {e.nom}</p>
                            <p className="text-[10px] text-black/40 mt-0.5">
                              {age !== null ? `${age} ans` : "Âge non renseigné"}
                            </p>
                          </div>
                          {hors && (
                            <span className="text-[10px] font-medium px-2 py-1 rounded-full"
                              style={{ background: "rgba(245,158,11,0.1)", color: "rgb(146,95,14)" }}>
                              Hors tranche
                            </span>
                          )}
                        </div>
                        {hors && sel && (
                          <p className="text-[10px] text-amber-700 mt-2 leading-4">
                            L'éveil musical est conçu pour les 3–8 ans. Une exception peut être accordée par la direction.
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bouton continuer */}
            {user && etape === "selection" && (
              <button
                disabled={!eleveId || !groupeId}
                onClick={() => setEtape("confirm")}
                className="w-full rounded-full py-3.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-30 transition"
                style={{ background: "rgb(22,92,71)" }}
              >
                Confirmer la sélection →
              </button>
            )}

            {/* Connecté — étape confirmation */}
            {user && etape === "confirm" && (
              <div className="rounded-[20px] overflow-hidden border border-black/8">
                <div className="px-5 py-4" style={{ background: "rgb(22,92,71)" }}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-1">
                    Récapitulatif · Éveil musical
                  </p>
                  <p className="text-base font-semibold text-white">Confirme l'inscription</p>
                </div>

                <div className="bg-white divide-y divide-black/5">
                  {[
                    { l: "Enfant",  v: `${eleve?.prenom} ${eleve?.nom}` },
                    { l: "Âge",    v: calcAge(eleve?.date_naissance) !== null ? `${calcAge(eleve?.date_naissance)} ans` : "Non renseigné" },
                    { l: "Groupe", v: groupe?.nom ?? "—" },
                    { l: "Horaire", v: groupe ? formatH(groupe) : "—" },
                    ...(TARIF_EVEIL ? [{ l: "Tarif", v: `${TARIF_EVEIL} ${TARIF_UNITE}` }] : []),
                  ].map(row => (
                    <div key={row.l} className="flex justify-between text-sm px-5 py-3">
                      <span className="text-black/45">{row.l}</span>
                      <span className="font-medium text-black">{row.v}</span>
                    </div>
                  ))}
                </div>

                <div className="px-5 py-4 border-t border-black/6 bg-white space-y-2">
                  <button
                    onClick={handleInscrire}
                    disabled={loading}
                    className="w-full rounded-full py-3.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50 transition flex items-center justify-center gap-2"
                    style={{ background: "rgb(22,92,71)" }}
                  >
                    {loading ? "Inscription en cours…" : "Valider l'inscription →"}
                  </button>
                  <button
                    onClick={() => setEtape("selection")}
                    className="w-full rounded-full py-2.5 text-sm text-black/35 hover:text-black/55 transition"
                  >
                    ← Modifier
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}