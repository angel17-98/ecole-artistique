// // app/plateforme/direction/profs/[id]/ProfFicheClient.tsx
// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import {
//   ChevronLeft, CheckCircle2, X, Plus, Pencil,
//   CalendarDays, Clock, Wallet, FileText,
// } from "lucide-react";

// const DISCIPLINES_DISPO = [
//   "Chant", "Danse", "Théâtre", "Écriture",
//   "Expression scénique", "Studio / production",
// ];

// const PERIODES = ["1 mois", "2 mois", "3 mois", "6 mois", "1 an"];
// const DEADLINES = ["2h", "12h", "24h", "48h"];

// interface Contrat {
//   id: string;
//   type: string;
//   salaire_fixe?: number;
//   tarif_cours_indiv?: number;
//   avantages?: string;
//   heures_min_periode?: number;
//   periode_engagement?: string;
//   date_debut: string;
//   date_fin?: string;
//   created_at: string;
// }

// export default function ProfFicheClient({
//   prof,
//   contratActif,
//   contrats,
//   stats,
// }: {
//   prof: any;
//   contratActif: Contrat | null;
//   contrats: Contrat[];
//   stats: {
//     coursEffectuesMois: number;
//     creneauxDisponibles: number;
//     montantMois: number | null;
//     statutPaiement: string | null;
//   };
// }) {
//   const router = useRouter();
//   const p = prof.profile as any;
//   const [onglet, setOnglet] = useState<"contrat" | "historique" | "parametres">("contrat");
//   const [showForm, setShowForm] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [confirmText, setConfirmText] = useState("");
//   const [deleting, setDeleting] = useState(false);

//   // ── Formulaire nouveau contrat ────────────────────────────────────────────
//   const [typeContrat, setTypeContrat] = useState<"salarie" | "independant" | "mixte">(
//     contratActif?.type as any ?? prof.type_contrat ?? "salarie"
//   );
//   const [salaireFixe, setSalaireFixe] = useState(contratActif?.salaire_fixe?.toString() ?? "");
//   const [tarifCours, setTarifCours] = useState(contratActif?.tarif_cours_indiv?.toString() ?? "");
//   const [avantages, setAvantages] = useState(contratActif?.avantages ?? "");
//   const [heuresMin, setHeuresMin] = useState(contratActif?.heures_min_periode?.toString() ?? "");
//   const [periode, setPeriode] = useState(contratActif?.periode_engagement ?? "3 mois");
//   const [dateDebut, setDateDebut] = useState(new Date().toISOString().split("T")[0]);
//   const [dateFin, setDateFin] = useState("");

//   const showToast = (type: "success" | "error", msg: string) => {
//     setToast({ type, msg });
//     setTimeout(() => setToast(null), 3500);
//   };

//   const handleSaveContrat = async () => {
//     if (!dateDebut) { showToast("error", "La date de début est obligatoire."); return; }
//     if (typeContrat !== "independant" && !salaireFixe) {
//       showToast("error", "Le salaire fixe est obligatoire pour un salarié.");
//       return;
//     }
//     setLoading(true);
//     try {
//       const res = await fetch(`/api/direction/profs/${prof.id}/contrats`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           type: typeContrat,
//           salaire_fixe: salaireFixe ? parseFloat(salaireFixe) : null,
//           tarif_cours_indiv: tarifCours ? parseFloat(tarifCours) : null,
//           avantages: avantages || null,
//           heures_min_periode: heuresMin ? parseInt(heuresMin) : null,
//           periode_engagement: periode || null,
//           date_debut: dateDebut,
//           date_fin: dateFin || null,
//         }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error ?? "Erreur");
//       showToast("success", "Contrat créé avec succès.");
//       setShowForm(false);
//       router.refresh();
//     } catch (e: any) {
//       showToast("error", e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCloturerContrat = async (contratId: string) => {
//     if (!confirm("Clôturer ce contrat aujourd'hui ?")) return;
//     setLoading(true);
//     try {
//       const res = await fetch(`/api/direction/profs/${prof.id}/contrats`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ id: contratId, date_fin: new Date().toISOString().split("T")[0] }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error ?? "Erreur");
//       showToast("success", "Contrat clôturé.");
//       router.refresh();
//     } catch (e: any) {
//       showToast("error", e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (force = false) => {
//     setDeleting(true);
//     try {
//       const res = await fetch(`/api/direction/profs/${prof.id}${force ? "?force=true" : ""}`, {
//         method: "DELETE",
//       });
//       const data = await res.json();

//       if (!res.ok) {
//         if (!force && (data.creneauxReserves > 0 || data.coursFuturs > 0)) {
//           const ok = confirm(
//             `${data.error}\n\nForcer la suppression quand même ? Les créneaux/cours liés seront supprimés avec le professeur.`
//           );
//           if (ok) { await handleDelete(true); return; }
//         } else {
//           showToast("error", data.error ?? "Erreur lors de la suppression");
//         }
//         setDeleting(false);
//         return;
//       }

//       router.push("/plateforme/direction/profs");
//       router.refresh();
//     } catch (e: any) {
//       showToast("error", e.message);
//       setDeleting(false);
//     }
//   };

//   const initiales = `${p?.prenom?.[0] ?? ""}${p?.nom?.[0] ?? ""}`.toUpperCase();

//   const typeLabel = (t: string) =>
//     t === "salarie" ? "Salarié" : t === "independant" ? "Indépendant" : "Mixte";

//   const formatDate = (d: string) =>
//     new Date(d).toLocaleDateString("fr-BE", { day: "numeric", month: "long", year: "numeric" });

//   return (
//     <div className="min-h-screen" style={{ background: "rgb(239,244,239)" }}>

//       {/* Modale de confirmation suppression */}
//       {showDeleteModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
//           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
//           <div className="relative w-full max-w-sm rounded-[24px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.20)] p-6">
//             <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
//               <span className="text-xl">⚠️</span>
//             </div>
//             <h2 className="text-center text-base font-semibold text-black mb-2">
//               Supprimer {p?.prenom} {p?.nom} ?
//             </h2>
//             <p className="text-center text-sm text-black/55 leading-6 mb-4">
//               Compte, contrats, créneaux, cours et messages liés seront supprimés définitivement.
//             </p>
//             <p className="text-center text-xs text-black/40 mb-2">
//               Tape <strong>{p?.prenom}</strong> pour confirmer
//             </p>
//             <input
//               value={confirmText}
//               onChange={(e) => setConfirmText(e.target.value)}
//               placeholder={p?.prenom}
//               className="w-full rounded-[12px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3 text-sm text-center mb-4 focus:outline-none focus:ring-2 focus:ring-red-200"
//             />
//             <div className="flex flex-col gap-2">
//               <button
//                 onClick={() => handleDelete(false)}
//                 disabled={deleting || confirmText !== p?.prenom}
//                 className="w-full rounded-full py-3 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed bg-red-500 hover:bg-red-600"
//               >
//                 {deleting ? "Suppression..." : "Supprimer définitivement"}
//               </button>
//               <button
//                 onClick={() => { setShowDeleteModal(false); setConfirmText(""); }}
//                 disabled={deleting}
//                 className="w-full rounded-full border border-black/10 py-3 text-sm font-medium text-black/60 transition hover:bg-black/4 disabled:opacity-50"
//               >
//                 Annuler
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Toast */}
//       {toast && (
//         <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-[14px] shadow-lg text-sm font-semibold"
//           style={{ background: toast.type === "success" ? "rgb(22,92,71)" : "rgb(220,38,38)", color: "white" }}>
//           {toast.type === "success" ? <CheckCircle2 size={15} /> : <X size={15} />}
//           {toast.msg}
//         </div>
//       )}

//       {/* ── En-tête ── */}
//       <div className="px-10 lg:px-14" style={{ paddingTop: "calc(96px + 24px)", paddingBottom: 24 }}>
//         <Link href="/plateforme/direction/profs"
//           className="inline-flex items-center gap-1.5 text-xs text-black/40 hover:text-black/60 transition mb-6">
//           <ChevronLeft size={14} /> Retour aux professeurs
//         </Link>

//         <div className="flex items-start gap-6">
//           {/* Avatar */}
//           <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
//             style={{ background: "rgba(22,92,71,0.12)", color: "rgb(22,92,71)" }}>
//             {p?.photo_url
//               ? <img src={p.photo_url} alt="" className="w-full h-full object-cover rounded-2xl" />
//               : initiales}
//           </div>
//           <div className="flex-1">
//             <div className="flex items-center gap-3 flex-wrap">
//               <h1 style={{ fontSize: 28, fontWeight: 600, color: "rgb(8,20,14)", margin: 0 }}>
//                 {p?.prenom} {p?.nom}
//               </h1>
//               <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
//                 style={{
//                   background: prof.actif ? "rgba(22,92,71,0.1)" : "rgba(0,0,0,0.06)",
//                   color: prof.actif ? "rgb(22,92,71)" : "rgba(0,0,0,0.4)",
//                 }}>
//                 {prof.actif ? "Actif" : "Inactif"}
//               </span>
//               {contratActif && (
//                 <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
//                   style={{ background: "rgba(185,151,83,0.12)", color: "rgb(146,95,14)" }}>
//                   {typeLabel(contratActif.type)}
//                 </span>
//               )}
//             </div>
//             <p style={{ fontSize: 13, color: "rgba(0,0,0,0.45)", marginTop: 4 }}>
//               {prof.disciplines?.join(", ") || "Aucune discipline renseignée"}
//               {p?.telephone ? ` · ${p.telephone}` : ""}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* ── Stats rapides ── */}
//       <div className="px-10 lg:px-14 mb-5">
//         <div className="grid grid-cols-3 gap-3">
//           {[
//             { label: "Cours ce mois", value: stats.coursEffectuesMois, icon: <CalendarDays size={14} /> },
//             { label: "Créneaux ouverts", value: stats.creneauxDisponibles, icon: <Clock size={14} /> },
//             {
//               label: "Rémunération mois",
//               value: stats.montantMois !== null ? `${stats.montantMois} €` : "—",
//               icon: <Wallet size={14} />,
//               sub: stats.statutPaiement === "vire" ? "Viré ✓"
//                 : stats.statutPaiement === "valide" ? "Validé"
//                 : stats.statutPaiement === "en_attente" ? "En attente"
//                 : null,
//             },
//           ].map((s) => (
//             <div key={s.label} className="rounded-[16px] border border-black/6 bg-white px-5 py-4"
//               style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
//               <div className="flex items-center gap-2 mb-1" style={{ color: "rgba(0,0,0,0.3)" }}>
//                 {s.icon}
//                 <span className="text-[10px] uppercase tracking-[0.16em]">{s.label}</span>
//               </div>
//               <p className="text-2xl font-semibold text-black">{s.value}</p>
//               {s.sub && <p className="text-[11px] text-black/35 mt-0.5">{s.sub}</p>}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* ── Onglets ── */}
//       <div className="px-10 lg:px-14 mb-5">
//         <div className="flex gap-1 p-1 rounded-full w-fit"
//           style={{ background: "white", border: "1px solid rgba(0,0,0,0.08)" }}>
//           {([
//             { key: "contrat", label: "Contrat actif" },
//             { key: "historique", label: "Historique" },
//             { key: "parametres", label: "Paramètres" },
//           ] as const).map((o) => (
//             <button key={o.key} onClick={() => setOnglet(o.key)}
//               className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
//               style={{
//                 background: onglet === o.key ? "rgb(22,92,71)" : "transparent",
//                 color: onglet === o.key ? "white" : "rgba(0,0,0,0.5)",
//               }}>
//               {o.label}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* ── Contenu onglets ── */}
//       <div className="px-10 lg:px-14 pb-10">

//         {/* CONTRAT ACTIF */}
//         {onglet === "contrat" && (
//           <div className="max-w-2xl space-y-4">
//             {contratActif ? (
//               <div className="rounded-[20px] border border-black/6 bg-white overflow-hidden"
//                 style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
//                 {/* Header contrat */}
//                 <div className="px-6 py-4 flex items-center justify-between"
//                   style={{ background: "rgb(12,40,28)" }}>
//                   <div>
//                     <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-1">
//                       Contrat actif
//                     </p>
//                     <p className="text-base font-semibold text-white">
//                       {typeLabel(contratActif.type)} · depuis le {formatDate(contratActif.date_debut)}
//                     </p>
//                   </div>
//                   <button
//                     onClick={() => handleCloturerContrat(contratActif.id)}
//                     className="px-4 py-2 rounded-full text-xs font-semibold transition hover:bg-white/10"
//                     style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)" }}>
//                     Clôturer
//                   </button>
//                 </div>

//                 {/* Détails */}
//                 <div className="divide-y divide-black/5">
//                   {[
//                     { label: "Type de contrat", value: typeLabel(contratActif.type) },
//                     contratActif.salaire_fixe != null
//                       ? { label: "Salaire fixe mensuel", value: `${contratActif.salaire_fixe} €` }
//                       : null,
//                     contratActif.tarif_cours_indiv != null
//                       ? { label: "Tarif par cours individuel", value: `${contratActif.tarif_cours_indiv} €` }
//                       : null,
//                     contratActif.heures_min_periode != null
//                       ? { label: "Heures min. par période", value: `${contratActif.heures_min_periode}h / ${contratActif.periode_engagement ?? "3 mois"}` }
//                       : null,
//                     contratActif.avantages
//                       ? { label: "Avantages", value: contratActif.avantages }
//                       : null,
//                     contratActif.date_fin
//                       ? { label: "Date de fin prévue", value: formatDate(contratActif.date_fin) }
//                       : { label: "Durée", value: "Indéterminée" },
//                   ].filter(Boolean).map((row: any) => (
//                     <div key={row.label} className="px-6 py-3.5 flex items-center justify-between">
//                       <p className="text-sm text-black/45">{row.label}</p>
//                       <p className="text-sm font-semibold text-black">{row.value}</p>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             ) : (
//               <div className="rounded-[20px] border border-black/6 bg-white p-10 text-center">
//                 <p className="text-2xl mb-3">📋</p>
//                 <p className="text-sm font-semibold text-black/60 mb-1">Aucun contrat actif</p>
//                 <p className="text-xs text-black/35 leading-5 mb-4">
//                   Ce professeur n'a pas encore de contrat. Crée-en un pour débloquer le suivi de rémunération.
//                 </p>
//               </div>
//             )}

//             {/* Bouton nouveau contrat */}
//             {!showForm && (
//               <button onClick={() => setShowForm(true)}
//                 className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition hover:-translate-y-px"
//                 style={{ background: "white", border: "1px solid rgba(0,0,0,0.1)", color: "rgb(22,92,71)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
//                 <Plus size={14} />
//                 {contratActif ? "Créer un avenant / nouveau contrat" : "Créer un contrat"}
//               </button>
//             )}

//             {/* Formulaire nouveau contrat */}
//             {showForm && (
//               <div className="rounded-[20px] border border-black/6 bg-white overflow-hidden"
//                 style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
//                 <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
//                   <p className="text-sm font-semibold text-black">Nouveau contrat</p>
//                   <button onClick={() => setShowForm(false)}
//                     className="w-7 h-7 rounded-full flex items-center justify-center transition hover:bg-black/5"
//                     style={{ color: "rgba(0,0,0,0.4)" }}>
//                     <X size={14} />
//                   </button>
//                 </div>

//                 <div className="p-6 space-y-5">

//                   {/* Type */}
//                   <div>
//                     <Label>Type de contrat</Label>
//                     <div className="flex gap-2 mt-2">
//                       {(["salarie", "independant", "mixte"] as const).map((t) => (
//                         <button key={t} onClick={() => setTypeContrat(t)}
//                           className="flex-1 rounded-[12px] border py-2.5 text-sm font-semibold transition"
//                           style={{
//                             background: typeContrat === t ? "rgb(22,92,71)" : "rgb(247,250,247)",
//                             border: typeContrat === t ? "1px solid rgb(22,92,71)" : "1px solid rgba(0,0,0,0.1)",
//                             color: typeContrat === t ? "white" : "rgba(0,0,0,0.5)",
//                           }}>
//                           {typeLabel(t)}
//                         </button>
//                       ))}
//                     </div>
//                   </div>

//                   {/* Salaire fixe — salarié ou mixte */}
//                   {(typeContrat === "salarie" || typeContrat === "mixte") && (
//                     <div>
//                       <Label>Salaire fixe mensuel (€)</Label>
//                       <Input
//                         type="number" placeholder="ex: 1800"
//                         value={salaireFixe} onChange={e => setSalaireFixe(e.target.value)}
//                       />
//                     </div>
//                   )}

//                   {/* Tarif par cours */}
//                   {(typeContrat === "independant" || typeContrat === "mixte") && (
//                     <div>
//                       <Label>Tarif par cours individuel (€)</Label>
//                       <Input
//                         type="number" placeholder="ex: 35"
//                         value={tarifCours} onChange={e => setTarifCours(e.target.value)}
//                       />
//                     </div>
//                   )}

//                   {/* Heures min + période */}
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <Label>Heures min. à ouvrir</Label>
//                       <Input
//                         type="number" placeholder="ex: 10"
//                         value={heuresMin} onChange={e => setHeuresMin(e.target.value)}
//                       />
//                     </div>
//                     <div>
//                       <Label>Par période de</Label>
//                       <select value={periode} onChange={e => setPeriode(e.target.value)}
//                         className="w-full rounded-[12px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/20"
//                         style={{ color: "rgb(8,20,14)" }}>
//                         {PERIODES.map(p => <option key={p} value={p}>{p}</option>)}
//                       </select>
//                     </div>
//                   </div>

//                   {/* Avantages */}
//                   <div>
//                     <Label>Avantages <span className="text-black/30 normal-case font-normal">(optionnel)</span></Label>
//                     <textarea
//                       placeholder="Ex : remboursement transport, mutuelle, etc."
//                       value={avantages} onChange={e => setAvantages(e.target.value)}
//                       rows={2}
//                       className="w-full rounded-[12px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/20 resize-none"
//                     />
//                   </div>

//                   {/* Dates */}
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <Label>Date de début</Label>
//                       <Input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} />
//                     </div>
//                     <div>
//                       <Label>Date de fin <span className="text-black/30 normal-case font-normal">(optionnel)</span></Label>
//                       <Input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} />
//                     </div>
//                   </div>

//                   {/* Actions */}
//                   <div className="flex gap-3 pt-2">
//                     <button onClick={handleSaveContrat} disabled={loading}
//                       className="flex-1 rounded-full py-3 text-sm font-semibold text-white transition disabled:opacity-40"
//                       style={{ background: "rgb(22,92,71)" }}>
//                       {loading ? "Enregistrement..." : "Enregistrer le contrat"}
//                     </button>
//                     <button onClick={() => setShowForm(false)}
//                       className="px-6 rounded-full py-3 text-sm font-semibold transition"
//                       style={{ background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.5)" }}>
//                       Annuler
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {/* HISTORIQUE */}
//         {onglet === "historique" && (
//           <div className="max-w-2xl space-y-3">
//             {contrats.length === 0 ? (
//               <div className="rounded-[20px] border border-black/6 bg-white p-10 text-center">
//                 <p className="text-sm text-black/40">Aucun contrat dans l'historique.</p>
//               </div>
//             ) : (
//               contrats.map((c) => {
//                 const isActif = !c.date_fin || c.date_fin >= new Date().toISOString().split("T")[0];
//                 return (
//                   <div key={c.id}
//                     className="rounded-[16px] border bg-white px-6 py-4 flex items-center justify-between gap-4"
//                     style={{
//                       borderColor: isActif ? "rgba(22,92,71,0.2)" : "rgba(0,0,0,0.06)",
//                       boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
//                     }}>
//                     <div>
//                       <div className="flex items-center gap-2 mb-1">
//                         <p className="text-sm font-semibold text-black">{typeLabel(c.type)}</p>
//                         {isActif && (
//                           <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
//                             style={{ background: "rgba(22,92,71,0.1)", color: "rgb(22,92,71)" }}>
//                             Actif
//                           </span>
//                         )}
//                       </div>
//                       <p className="text-xs text-black/40">
//                         Du {formatDate(c.date_debut)}
//                         {c.date_fin ? ` au ${formatDate(c.date_fin)}` : " · Durée indéterminée"}
//                       </p>
//                       <div className="flex gap-3 mt-1.5 flex-wrap">
//                         {c.salaire_fixe != null && (
//                           <span className="text-[11px] text-black/50">{c.salaire_fixe} € fixe/mois</span>
//                         )}
//                         {c.tarif_cours_indiv != null && (
//                           <span className="text-[11px] text-black/50">{c.tarif_cours_indiv} €/cours</span>
//                         )}
//                         {c.heures_min_periode != null && (
//                           <span className="text-[11px] text-black/50">
//                             {c.heures_min_periode}h min / {c.periode_engagement ?? "3 mois"}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                     {isActif && (
//                       <button onClick={() => handleCloturerContrat(c.id)}
//                         className="shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition hover:bg-red-50"
//                         style={{ border: "1px solid rgba(220,38,38,0.2)", color: "rgb(220,38,38)" }}>
//                         Clôturer
//                       </button>
//                     )}
//                   </div>
//                 );
//               })
//             )}
//           </div>
//         )}

//         {/* PARAMÈTRES */}
//         {onglet === "parametres" && (
//           <div className="max-w-2xl space-y-4">
//             <div className="rounded-[20px] border border-black/6 bg-white overflow-hidden"
//               style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
//               <div className="px-6 py-4 border-b border-black/5">
//                 <p className="text-sm font-semibold text-black">Paramètres du compte</p>
//                 <p className="text-xs text-black/40 mt-0.5">Modifiables par la direction uniquement</p>
//               </div>
//               <div className="divide-y divide-black/5">
//                 {[
//                   { label: "Disciplines", value: prof.disciplines?.join(", ") || "—" },
//                   { label: "Deadline annulation par défaut", value: prof.deadline_defaut ?? "24h" },
//                   { label: "Abonnement annuel activé", value: prof.abonnement_possible_defaut ? "Oui" : "Non" },
//                   { label: "Compte actif", value: prof.actif ? "Oui" : "Non" },
//                   { label: "Membre depuis", value: new Date(prof.created_at).toLocaleDateString("fr-BE", { month: "long", year: "numeric" }) },
//                 ].map((row) => (
//                   <div key={row.label} className="px-6 py-3.5 flex items-center justify-between">
//                     <p className="text-sm text-black/45">{row.label}</p>
//                     <p className="text-sm font-semibold text-black">{row.value}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* ZONE DE DANGER — visible uniquement dans Paramètres */}
//             <div className="rounded-[20px] border border-red-100 bg-red-50/40 overflow-hidden">
//               <div className="px-6 py-4 border-b border-red-100">
//                 <p className="text-sm font-semibold text-red-700">Zone de danger</p>
//                 <p className="text-xs text-red-700/60 mt-0.5">Suppression définitive et irréversible</p>
//               </div>
//               <div className="px-6 py-4 flex items-center justify-between gap-4">
//                 <p className="text-xs text-black/45 leading-5 max-w-xs">
//                   Pour un vrai départ de professeur, préfère clôturer le contrat plutôt que supprimer — ça garde l'historique. Réserve la suppression aux comptes de test ou créés par erreur.
//                 </p>
//                 <button
//                   onClick={() => setShowDeleteModal(true)}
//                   className="shrink-0 px-5 py-2.5 rounded-full text-xs font-semibold transition hover:bg-red-100"
//                   style={{ border: "1px solid rgba(220,38,38,0.3)", color: "rgb(220,38,38)" }}
//                 >
//                   Supprimer le professeur
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ── Helpers UI ────────────────────────────────────────────────────────────────
// function Label({ children }: { children: React.ReactNode }) {
//   return (
//     <label className="block text-xs font-semibold uppercase tracking-[0.18em] mb-2"
//       style={{ color: "rgba(0,0,0,0.4)" }}>
//       {children}
//     </label>
//   );
// }

// function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
//   return (
//     <input
//       {...props}
//       className="w-full rounded-[12px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/20 focus:border-[rgb(22,92,71)]"
//       style={{ color: "rgb(8,20,14)" }}
//     />
//   );
// }

// app/plateforme/direction/profs/[id]/ProfFicheClient.tsx
"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, CheckCircle2, X, Plus, Pencil,
  CalendarDays, Clock, Wallet, FileText, Users, Upload,
  Trash2, Download, Save,
} from "lucide-react";

const DISCIPLINES_DISPO = [
  "Chant", "Danse", "Théâtre", "Écriture",
  "Expression scénique", "Studio / production",
];

const PERIODES = ["1 mois", "2 mois", "3 mois", "6 mois", "1 an"];
const DEADLINES = ["2h", "12h", "24h", "48h"];
const TYPES_DOCUMENT = [
  { value: "contrat_signe", label: "Contrat signé" },
  { value: "assurance", label: "Assurance" },
  { value: "diplome", label: "Diplôme" },
  { value: "autre", label: "Autre" },
];

interface Contrat {
  id: string;
  type: string;
  salaire_fixe?: number;
  tarif_cours_indiv?: number;
  tarif_duo?: number;
  tarif_trio?: number;
  avantages?: string;
  heures_min_periode?: number;
  periode_engagement?: string;
  date_debut: string;
  date_fin?: string;
  created_at: string;
}

interface Groupe {
  id: string;
  nom: string;
  nbEleves: number;
}

interface EleveIndividuel {
  id: string;
  prenom: string;
  nom: string;
}

interface DocumentProf {
  id: string;
  nom: string;
  type: string;
  taille_octets: number | null;
  created_at: string;
  url: string | null;
}

export default function ProfFicheClient({
  prof,
  contratActif,
  contrats,
  stats,
  groupes,
  elevesIndividuels,
  documents,
}: {
  prof: any;
  contratActif: Contrat | null;
  contrats: Contrat[];
  stats: {
    coursEffectuesMois: number;
    creneauxDisponibles: number;
    montantMois: number | null;
    statutPaiement: string | null;
  };
  groupes: Groupe[];
  elevesIndividuels: EleveIndividuel[];
  documents: DocumentProf[];
}) {
  const router = useRouter();
  const p = prof.profile as any;
  const [onglet, setOnglet] = useState<"contrat" | "historique" | "eleves" | "documents" | "parametres">("contrat");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  // ── Formulaire nouveau contrat ────────────────────────────────────────────
  const [typeContrat, setTypeContrat] = useState<"salarie" | "independant" | "mixte">(
    contratActif?.type as any ?? prof.type_contrat ?? "salarie"
  );
  const [salaireFixe, setSalaireFixe] = useState(contratActif?.salaire_fixe?.toString() ?? "");
  const [tarifCours, setTarifCours] = useState(contratActif?.tarif_cours_indiv?.toString() ?? "");
  const [tarifDuo, setTarifDuo] = useState(contratActif?.tarif_duo?.toString() ?? "");
  const [tarifTrio, setTarifTrio] = useState(contratActif?.tarif_trio?.toString() ?? "");
  const [avantages, setAvantages] = useState(contratActif?.avantages ?? "");
  const [heuresMin, setHeuresMin] = useState(contratActif?.heures_min_periode?.toString() ?? "");
  const [periode, setPeriode] = useState(contratActif?.periode_engagement ?? "3 mois");
  const [dateDebut, setDateDebut] = useState(new Date().toISOString().split("T")[0]);
  const [dateFin, setDateFin] = useState("");

  // ── Paramètres éditables ───────────────────────────────────────────────────
  const [editMode, setEditMode] = useState(false);
  const [editPrenom, setEditPrenom] = useState(p?.prenom ?? "");
  const [editNom, setEditNom] = useState(p?.nom ?? "");
  const [editTelephone, setEditTelephone] = useState(p?.telephone ?? "");
  const [editBio, setEditBio] = useState(prof.bio ?? "");
  const [editTarifHoraire, setEditTarifHoraire] = useState(prof.tarif_horaire?.toString() ?? "");
  const [editDisciplines, setEditDisciplines] = useState<string[]>(prof.disciplines ?? []);
  const [editDeadline, setEditDeadline] = useState(prof.deadline_defaut ?? "24h");
  const [editAbonnement, setEditAbonnement] = useState(!!prof.abonnement_possible_defaut);
  const [customDiscipline, setCustomDiscipline] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [savingParams, setSavingParams] = useState(false);

  // ── Documents ────────────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState("contrat_signe");
  const [uploading, setUploading] = useState(false);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveContrat = async () => {
    if (!dateDebut) { showToast("error", "La date de début est obligatoire."); return; }
    if (typeContrat !== "independant" && !salaireFixe) {
      showToast("error", "Le salaire fixe est obligatoire pour un salarié.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/direction/profs/${prof.id}/contrats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: typeContrat,
          salaire_fixe: salaireFixe ? parseFloat(salaireFixe) : null,
          tarif_cours_indiv: tarifCours ? parseFloat(tarifCours) : null,
          tarif_duo: tarifDuo ? parseFloat(tarifDuo) : null,
          tarif_trio: tarifTrio ? parseFloat(tarifTrio) : null,
          avantages: avantages || null,
          heures_min_periode: heuresMin ? parseInt(heuresMin) : null,
          periode_engagement: periode || null,
          date_debut: dateDebut,
          date_fin: dateFin || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      showToast("success", "Contrat créé avec succès.");
      setShowForm(false);
      router.refresh();
    } catch (e: any) {
      showToast("error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloturerContrat = async (contratId: string) => {
    if (!confirm("Clôturer ce contrat aujourd'hui ?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/direction/profs/${prof.id}/contrats`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: contratId, date_fin: new Date().toISOString().split("T")[0] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      showToast("success", "Contrat clôturé.");
      router.refresh();
    } catch (e: any) {
      showToast("error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (force = false) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/direction/profs/${prof.id}${force ? "?force=true" : ""}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        if (!force && (data.creneauxReserves > 0 || data.coursFuturs > 0)) {
          const ok = confirm(
            `${data.error}\n\nForcer la suppression quand même ? Les créneaux/cours liés seront supprimés avec le professeur.`
          );
          if (ok) { await handleDelete(true); return; }
        } else {
          showToast("error", data.error ?? "Erreur lors de la suppression");
        }
        setDeleting(false);
        return;
      }

      router.push("/plateforme/direction/profs");
      router.refresh();
    } catch (e: any) {
      showToast("error", e.message);
      setDeleting(false);
    }
  };

  const toggleEditDiscipline = (d: string) => {
    setEditDisciplines((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const addCustomEditDiscipline = () => {
    const trimmed = customDiscipline.trim();
    if (!trimmed) return;
    if (!editDisciplines.includes(trimmed)) setEditDisciplines((prev) => [...prev, trimmed]);
    setCustomDiscipline("");
  };

  const disciplinesPersonnalisees = editDisciplines.filter((d) => !DISCIPLINES_DISPO.includes(d));

  const handleSaveParams = async () => {
    setSavingParams(true);
    try {
      const res = await fetch(`/api/direction/profs/${prof.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenom: editPrenom,
          nom: editNom,
          telephone: editTelephone || null,
          bio: editBio || null,
          tarif_horaire: editTarifHoraire || null,
          disciplines: editDisciplines,
          deadline_defaut: editDeadline,
          abonnement_possible_defaut: editAbonnement,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      showToast("success", "Informations mises à jour.");
      setEditMode(false);
      router.refresh();
    } catch (e: any) {
      showToast("error", e.message);
    } finally {
      setSavingParams(false);
    }
  };

  const handleUploadDocument = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) { showToast("error", "Choisis un fichier d'abord."); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", docType);
      const res = await fetch(`/api/direction/profs/${prof.id}/documents`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      showToast("success", "Document ajouté.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();
    } catch (e: any) {
      showToast("error", e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm("Supprimer ce document ?")) return;
    try {
      const res = await fetch(`/api/direction/profs/${prof.id}/documents?docId=${docId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      showToast("success", "Document supprimé.");
      router.refresh();
    } catch (e: any) {
      showToast("error", e.message);
    }
  };

  const formatTaille = (octets: number | null) => {
    if (!octets) return "";
    if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} Ko`;
    return `${(octets / 1024 / 1024).toFixed(1)} Mo`;
  };

  const initiales = `${p?.prenom?.[0] ?? ""}${p?.nom?.[0] ?? ""}`.toUpperCase();

  const typeLabel = (t: string) =>
    t === "salarie" ? "Salarié" : t === "independant" ? "Indépendant" : "Mixte";

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-BE", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen" style={{ background: "rgb(239,244,239)" }}>

      {/* Modale de confirmation suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative w-full max-w-sm rounded-[24px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.20)] p-6">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <span className="text-xl">⚠️</span>
            </div>
            <h2 className="text-center text-base font-semibold text-black mb-2">
              Supprimer {p?.prenom} {p?.nom} ?
            </h2>
            <p className="text-center text-sm text-black/55 leading-6 mb-4">
              Compte, contrats, créneaux, cours, documents et messages liés seront supprimés définitivement.
            </p>
            <p className="text-center text-xs text-black/40 mb-2">
              Tape <strong>{p?.prenom}</strong> pour confirmer
            </p>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={p?.prenom}
              className="w-full rounded-[12px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3 text-sm text-center mb-4 focus:outline-none focus:ring-2 focus:ring-red-200"
            />
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleDelete(false)}
                disabled={deleting || confirmText !== p?.prenom}
                className="w-full rounded-full py-3 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed bg-red-500 hover:bg-red-600"
              >
                {deleting ? "Suppression..." : "Supprimer définitivement"}
              </button>
              <button
                onClick={() => { setShowDeleteModal(false); setConfirmText(""); }}
                disabled={deleting}
                className="w-full rounded-full border border-black/10 py-3 text-sm font-medium text-black/60 transition hover:bg-black/4 disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-[14px] shadow-lg text-sm font-semibold"
          style={{ background: toast.type === "success" ? "rgb(22,92,71)" : "rgb(220,38,38)", color: "white" }}>
          {toast.type === "success" ? <CheckCircle2 size={15} /> : <X size={15} />}
          {toast.msg}
        </div>
      )}

      {/* ── En-tête ── */}
      <div className="px-10 lg:px-14" style={{ paddingTop: "calc(96px + 24px)", paddingBottom: 24 }}>
        <Link href="/plateforme/direction/profs"
          className="inline-flex items-center gap-1.5 text-xs text-black/40 hover:text-black/60 transition mb-6">
          <ChevronLeft size={14} /> Retour aux professeurs
        </Link>

        <div className="flex items-start gap-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
            style={{ background: "rgba(22,92,71,0.12)", color: "rgb(22,92,71)" }}>
            {p?.photo_url
              ? <img src={p.photo_url} alt="" className="w-full h-full object-cover rounded-2xl" />
              : initiales}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 style={{ fontSize: 28, fontWeight: 600, color: "rgb(8,20,14)", margin: 0 }}>
                {p?.prenom} {p?.nom}
              </h1>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
                style={{
                  background: prof.actif ? "rgba(22,92,71,0.1)" : "rgba(0,0,0,0.06)",
                  color: prof.actif ? "rgb(22,92,71)" : "rgba(0,0,0,0.4)",
                }}>
                {prof.actif ? "Actif" : "Inactif"}
              </span>
              {contratActif && (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
                  style={{ background: "rgba(185,151,83,0.12)", color: "rgb(146,95,14)" }}>
                  {typeLabel(contratActif.type)}
                </span>
              )}
            </div>
            <p style={{ fontSize: 13, color: "rgba(0,0,0,0.45)", marginTop: 4 }}>
              {prof.disciplines?.join(", ") || "Aucune discipline renseignée"}
              {p?.telephone ? ` · ${p.telephone}` : ""}
            </p>
            {prof.bio && (
              <p style={{ fontSize: 13, color: "rgba(0,0,0,0.55)", marginTop: 8, maxWidth: 560, lineHeight: 1.6 }}>
                {prof.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats rapides ── */}
      <div className="px-10 lg:px-14 mb-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Cours ce mois", value: stats.coursEffectuesMois, icon: <CalendarDays size={14} /> },
            { label: "Créneaux ouverts", value: stats.creneauxDisponibles, icon: <Clock size={14} /> },
            {
              label: "Rémunération mois",
              value: stats.montantMois !== null ? `${stats.montantMois} €` : "—",
              icon: <Wallet size={14} />,
              sub: stats.statutPaiement === "vire" ? "Viré ✓"
                : stats.statutPaiement === "valide" ? "Validé"
                : stats.statutPaiement === "en_attente" ? "En attente"
                : null,
            },
          ].map((s) => (
            <div key={s.label} className="rounded-[16px] border border-black/6 bg-white px-5 py-4"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center gap-2 mb-1" style={{ color: "rgba(0,0,0,0.3)" }}>
                {s.icon}
                <span className="text-[10px] uppercase tracking-[0.16em]">{s.label}</span>
              </div>
              <p className="text-2xl font-semibold text-black">{s.value}</p>
              {s.sub && <p className="text-[11px] text-black/35 mt-0.5">{s.sub}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Onglets ── */}
      <div className="px-10 lg:px-14 mb-5">
        <div className="flex gap-1 p-1 rounded-full w-fit flex-wrap"
          style={{ background: "white", border: "1px solid rgba(0,0,0,0.08)" }}>
          {([
            { key: "contrat", label: "Contrat actif" },
            { key: "historique", label: "Historique" },
            { key: "eleves", label: `Élèves${groupes.length + elevesIndividuels.length > 0 ? ` (${groupes.reduce((a, g) => a + g.nbEleves, 0) + elevesIndividuels.length})` : ""}` },
            { key: "documents", label: `Documents${documents.length > 0 ? ` (${documents.length})` : ""}` },
            { key: "parametres", label: "Paramètres" },
          ] as const).map((o) => (
            <button key={o.key} onClick={() => setOnglet(o.key)}
              className="px-5 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap"
              style={{
                background: onglet === o.key ? "rgb(22,92,71)" : "transparent",
                color: onglet === o.key ? "white" : "rgba(0,0,0,0.5)",
              }}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Contenu onglets ── */}
      <div className="px-10 lg:px-14 pb-10">

        {/* CONTRAT ACTIF */}
        {onglet === "contrat" && (
          <div className="max-w-2xl space-y-4">
            {contratActif ? (
              <div className="rounded-[20px] border border-black/6 bg-white overflow-hidden"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div className="px-6 py-4 flex items-center justify-between"
                  style={{ background: "rgb(12,40,28)" }}>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-1">
                      Contrat actif
                    </p>
                    <p className="text-base font-semibold text-white">
                      {typeLabel(contratActif.type)} · depuis le {formatDate(contratActif.date_debut)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCloturerContrat(contratActif.id)}
                    className="px-4 py-2 rounded-full text-xs font-semibold transition hover:bg-white/10"
                    style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)" }}>
                    Clôturer
                  </button>
                </div>

                <div className="divide-y divide-black/5">
                  {[
                    { label: "Type de contrat", value: typeLabel(contratActif.type) },
                    contratActif.salaire_fixe != null
                      ? { label: "Salaire fixe mensuel", value: `${contratActif.salaire_fixe} €` }
                      : null,
                    contratActif.tarif_cours_indiv != null
                      ? { label: "Tarif cours solo (1 élève)", value: `${contratActif.tarif_cours_indiv} €` }
                      : null,
                    contratActif.tarif_duo != null
                      ? { label: "Tarif cours duo (2 élèves)", value: `${contratActif.tarif_duo} €` }
                      : null,
                    contratActif.tarif_trio != null
                      ? { label: "Tarif cours trio (3 élèves)", value: `${contratActif.tarif_trio} €` }
                      : null,
                    contratActif.heures_min_periode != null
                      ? { label: "Heures min. par période", value: `${contratActif.heures_min_periode}h / ${contratActif.periode_engagement ?? "3 mois"}` }
                      : null,
                    contratActif.avantages
                      ? { label: "Avantages", value: contratActif.avantages }
                      : null,
                    contratActif.date_fin
                      ? { label: "Date de fin prévue", value: formatDate(contratActif.date_fin) }
                      : { label: "Durée", value: "Indéterminée" },
                  ].filter(Boolean).map((row: any) => (
                    <div key={row.label} className="px-6 py-3.5 flex items-center justify-between">
                      <p className="text-sm text-black/45">{row.label}</p>
                      <p className="text-sm font-semibold text-black">{row.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-[20px] border border-black/6 bg-white p-10 text-center">
                <p className="text-2xl mb-3">📋</p>
                <p className="text-sm font-semibold text-black/60 mb-1">Aucun contrat actif</p>
                <p className="text-xs text-black/35 leading-5 mb-4">
                  Ce professeur n'a pas encore de contrat. Crée-en un pour débloquer le suivi de rémunération.
                </p>
              </div>
            )}

            {!showForm && (
              <button onClick={() => setShowForm(true)}
                className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition hover:-translate-y-px"
                style={{ background: "white", border: "1px solid rgba(0,0,0,0.1)", color: "rgb(22,92,71)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <Plus size={14} />
                {contratActif ? "Créer un avenant / nouveau contrat" : "Créer un contrat"}
              </button>
            )}

            {showForm && (
              <div className="rounded-[20px] border border-black/6 bg-white overflow-hidden"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
                  <p className="text-sm font-semibold text-black">Nouveau contrat</p>
                  <button onClick={() => setShowForm(false)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition hover:bg-black/5"
                    style={{ color: "rgba(0,0,0,0.4)" }}>
                    <X size={14} />
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  <div>
                    <Label>Type de contrat</Label>
                    <div className="flex gap-2 mt-2">
                      {(["salarie", "independant", "mixte"] as const).map((t) => (
                        <button key={t} onClick={() => setTypeContrat(t)}
                          className="flex-1 rounded-[12px] border py-2.5 text-sm font-semibold transition"
                          style={{
                            background: typeContrat === t ? "rgb(22,92,71)" : "rgb(247,250,247)",
                            border: typeContrat === t ? "1px solid rgb(22,92,71)" : "1px solid rgba(0,0,0,0.1)",
                            color: typeContrat === t ? "white" : "rgba(0,0,0,0.5)",
                          }}>
                          {typeLabel(t)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(typeContrat === "salarie" || typeContrat === "mixte") && (
                    <div>
                      <Label>Salaire fixe mensuel (€)</Label>
                      <Input type="number" placeholder="ex: 1800" value={salaireFixe} onChange={e => setSalaireFixe(e.target.value)} />
                    </div>
                  )}

                  {(typeContrat === "independant" || typeContrat === "mixte") && (
                    <div className="rounded-[14px] border border-black/8 p-4 space-y-4" style={{ background: "rgb(250,251,250)" }}>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/35">
                        Tarifs cours privés — par taille de groupe
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label>Solo (1)</Label>
                          <Input type="number" placeholder="35" value={tarifCours} onChange={e => setTarifCours(e.target.value)} />
                        </div>
                        <div>
                          <Label>Duo (2)</Label>
                          <Input type="number" placeholder="50" value={tarifDuo} onChange={e => setTarifDuo(e.target.value)} />
                        </div>
                        <div>
                          <Label>Trio (3)</Label>
                          <Input type="number" placeholder="65" value={tarifTrio} onChange={e => setTarifTrio(e.target.value)} />
                        </div>
                      </div>
                      <p className="text-[11px] text-black/35 leading-4">
                        Laisse vide si le prof ne propose pas ce format de cours.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Heures min. à ouvrir</Label>
                      <Input type="number" placeholder="ex: 10" value={heuresMin} onChange={e => setHeuresMin(e.target.value)} />
                    </div>
                    <div>
                      <Label>Par période de</Label>
                      <select value={periode} onChange={e => setPeriode(e.target.value)}
                        className="w-full rounded-[12px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/20"
                        style={{ color: "rgb(8,20,14)" }}>
                        {PERIODES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label>Avantages <span className="text-black/30 normal-case font-normal">(optionnel)</span></Label>
                    <textarea
                      placeholder="Ex : remboursement transport, mutuelle, etc."
                      value={avantages} onChange={e => setAvantages(e.target.value)}
                      rows={2}
                      className="w-full rounded-[12px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/20 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date de début</Label>
                      <Input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} />
                    </div>
                    <div>
                      <Label>Date de fin <span className="text-black/30 normal-case font-normal">(optionnel)</span></Label>
                      <Input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button onClick={handleSaveContrat} disabled={loading}
                      className="flex-1 rounded-full py-3 text-sm font-semibold text-white transition disabled:opacity-40"
                      style={{ background: "rgb(22,92,71)" }}>
                      {loading ? "Enregistrement..." : "Enregistrer le contrat"}
                    </button>
                    <button onClick={() => setShowForm(false)}
                      className="px-6 rounded-full py-3 text-sm font-semibold transition"
                      style={{ background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.5)" }}>
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* HISTORIQUE */}
        {onglet === "historique" && (
          <div className="max-w-2xl space-y-3">
            {contrats.length === 0 ? (
              <div className="rounded-[20px] border border-black/6 bg-white p-10 text-center">
                <p className="text-sm text-black/40">Aucun contrat dans l'historique.</p>
              </div>
            ) : (
              contrats.map((c) => {
                const isActif = !c.date_fin || c.date_fin >= new Date().toISOString().split("T")[0];
                return (
                  <div key={c.id}
                    className="rounded-[16px] border bg-white px-6 py-4 flex items-center justify-between gap-4"
                    style={{
                      borderColor: isActif ? "rgba(22,92,71,0.2)" : "rgba(0,0,0,0.06)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                    }}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-black">{typeLabel(c.type)}</p>
                        {isActif && (
                          <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(22,92,71,0.1)", color: "rgb(22,92,71)" }}>
                            Actif
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-black/40">
                        Du {formatDate(c.date_debut)}
                        {c.date_fin ? ` au ${formatDate(c.date_fin)}` : " · Durée indéterminée"}
                      </p>
                      <div className="flex gap-3 mt-1.5 flex-wrap">
                        {c.salaire_fixe != null && (
                          <span className="text-[11px] text-black/50">{c.salaire_fixe} € fixe/mois</span>
                        )}
                        {c.tarif_cours_indiv != null && (
                          <span className="text-[11px] text-black/50">{c.tarif_cours_indiv} €/solo</span>
                        )}
                        {c.tarif_duo != null && (
                          <span className="text-[11px] text-black/50">{c.tarif_duo} €/duo</span>
                        )}
                        {c.tarif_trio != null && (
                          <span className="text-[11px] text-black/50">{c.tarif_trio} €/trio</span>
                        )}
                        {c.heures_min_periode != null && (
                          <span className="text-[11px] text-black/50">
                            {c.heures_min_periode}h min / {c.periode_engagement ?? "3 mois"}
                          </span>
                        )}
                      </div>
                    </div>
                    {isActif && (
                      <button onClick={() => handleCloturerContrat(c.id)}
                        className="shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition hover:bg-red-50"
                        style={{ border: "1px solid rgba(220,38,38,0.2)", color: "rgb(220,38,38)" }}>
                        Clôturer
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ÉLÈVES / GROUPES */}
        {onglet === "eleves" && (
          <div className="max-w-2xl space-y-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/30 mb-3">
                Groupes / parcours enseignés
              </p>
              {groupes.length === 0 ? (
                <div className="rounded-[18px] border border-black/6 bg-white p-6 text-center text-sm text-black/35">
                  Aucun cours collectif assigné à ce prof pour l'instant.
                </div>
              ) : (
                <div className="space-y-2">
                  {groupes.map((g) => (
                    <div key={g.id} className="rounded-[16px] border border-black/6 bg-white px-5 py-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users size={15} style={{ color: "rgb(22,92,71)" }} />
                        <p className="text-sm font-semibold text-black">{g.nom}</p>
                      </div>
                      <span className="text-xs text-black/40">{g.nbEleves} élève{g.nbEleves > 1 ? "s" : ""}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/30 mb-3">
                Élèves en cours individuel
              </p>
              {elevesIndividuels.length === 0 ? (
                <div className="rounded-[18px] border border-black/6 bg-white p-6 text-center text-sm text-black/35">
                  Aucun élève n'a encore réservé de cours individuel avec ce prof.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {elevesIndividuels.map((e) => (
                    <span key={e.id} className="rounded-full border border-black/8 bg-white px-4 py-2 text-xs font-medium text-black/60">
                      {e.prenom} {e.nom}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* DOCUMENTS */}
        {onglet === "documents" && (
          <div className="max-w-2xl space-y-4">
            <div className="rounded-[20px] border border-black/6 bg-white p-5">
              <p className="text-sm font-semibold text-black mb-3">Ajouter un document</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <select value={docType} onChange={(e) => setDocType(e.target.value)}
                  className="rounded-[12px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/20"
                  style={{ color: "rgb(8,20,14)" }}>
                  {TYPES_DOCUMENT.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
                  className="flex-1 text-xs text-black/50 file:mr-3 file:rounded-full file:border-0 file:bg-[rgb(22,92,71)]/8 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-[rgb(22,92,71)]" />
                <button onClick={handleUploadDocument} disabled={uploading}
                  className="rounded-full px-5 py-2.5 text-xs font-semibold text-white transition disabled:opacity-40 flex items-center gap-2 justify-center"
                  style={{ background: "rgb(22,92,71)" }}>
                  <Upload size={13} /> {uploading ? "Envoi..." : "Envoyer"}
                </button>
              </div>
            </div>

            {documents.length === 0 ? (
              <div className="rounded-[20px] border border-black/6 bg-white p-8 text-center text-sm text-black/35">
                Aucun document pour l'instant.
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="rounded-[16px] border border-black/6 bg-white px-5 py-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText size={16} style={{ color: "rgb(22,92,71)" }} className="flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-black truncate">{doc.nom}</p>
                        <p className="text-[11px] text-black/35">
                          {TYPES_DOCUMENT.find((t) => t.value === doc.type)?.label ?? doc.type}
                          {doc.taille_octets ? ` · ${formatTaille(doc.taille_octets)}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {doc.url && (
                        <a href={doc.url} target="_blank" rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full flex items-center justify-center transition hover:bg-black/5"
                          style={{ color: "rgb(22,92,71)" }}>
                          <Download size={14} />
                        </a>
                      )}
                      <button onClick={() => handleDeleteDocument(doc.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition hover:bg-red-50"
                        style={{ color: "rgb(220,38,38)" }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PARAMÈTRES */}
        {onglet === "parametres" && (
          <div className="max-w-2xl space-y-4">
            <div className="rounded-[20px] border border-black/6 bg-white overflow-hidden"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-black">Paramètres du compte</p>
                  <p className="text-xs text-black/40 mt-0.5">Modifiables par la direction uniquement</p>
                </div>
                {!editMode ? (
                  <button onClick={() => setEditMode(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition hover:bg-black/5"
                    style={{ border: "1px solid rgba(0,0,0,0.1)", color: "rgb(22,92,71)" }}>
                    <Pencil size={12} /> Modifier
                  </button>
                ) : (
                  <button onClick={() => setEditMode(false)}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-black/40 hover:bg-black/5 transition">
                    Annuler
                  </button>
                )}
              </div>

              {!editMode ? (
                <div className="divide-y divide-black/5">
                  {[
                    { label: "Prénom / Nom", value: `${p?.prenom ?? ""} ${p?.nom ?? ""}` },
                    { label: "Téléphone", value: p?.telephone || "—" },
                    { label: "Bio", value: prof.bio || "—" },
                    { label: "Tarif horaire de référence", value: prof.tarif_horaire ? `${prof.tarif_horaire} €/h` : "—" },
                    { label: "Disciplines", value: prof.disciplines?.join(", ") || "—" },
                    { label: "Deadline annulation par défaut", value: prof.deadline_defaut ?? "24h" },
                    { label: "Abonnement annuel activé", value: prof.abonnement_possible_defaut ? "Oui" : "Non" },
                    { label: "Compte actif", value: prof.actif ? "Oui" : "Non" },
                    { label: "Membre depuis", value: new Date(prof.created_at).toLocaleDateString("fr-BE", { month: "long", year: "numeric" }) },
                  ].map((row) => (
                    <div key={row.label} className="px-6 py-3.5 flex items-center justify-between gap-4">
                      <p className="text-sm text-black/45 flex-shrink-0">{row.label}</p>
                      <p className="text-sm font-semibold text-black text-right">{row.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Prénom</Label>
                      <Input value={editPrenom} onChange={(e) => setEditPrenom(e.target.value)} />
                    </div>
                    <div>
                      <Label>Nom</Label>
                      <Input value={editNom} onChange={(e) => setEditNom(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <Label>Téléphone</Label>
                    <Input value={editTelephone} onChange={(e) => setEditTelephone(e.target.value)} />
                  </div>

                  <div>
                    <Label>Bio <span className="text-black/30 normal-case font-normal">(visible sur le profil public)</span></Label>
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={3}
                      placeholder="Parcours, spécialités, expérience..."
                      className="w-full rounded-[12px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/20 resize-none"
                    />
                  </div>

                  <div>
                    <Label>Tarif horaire de référence (€)</Label>
                    <Input type="number" value={editTarifHoraire} onChange={(e) => setEditTarifHoraire(e.target.value)} />
                  </div>

                  <div>
                    <Label>Disciplines</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {DISCIPLINES_DISPO.map((d) => (
                        <button key={d} onClick={() => toggleEditDiscipline(d)}
                          className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                            editDisciplines.includes(d)
                              ? "border-[rgb(22,92,71)] bg-[rgb(22,92,71)] text-white"
                              : "border-black/10 bg-[rgb(247,250,247)] text-black/50"
                          }`}>
                          {d}
                        </button>
                      ))}
                      {disciplinesPersonnalisees.map((d) => (
                        <button key={d} onClick={() => toggleEditDiscipline(d)}
                          className="rounded-full border px-4 py-2 text-xs font-semibold transition border-[rgb(22,92,71)] bg-[rgb(22,92,71)] text-white flex items-center gap-1.5">
                          {d} <X size={11} />
                        </button>
                      ))}
                      {!showCustomInput && (
                        <button onClick={() => setShowCustomInput(true)}
                          className="rounded-full border border-dashed border-black/20 px-4 py-2 text-xs font-semibold text-black/40 flex items-center gap-1">
                          <Plus size={11} /> Autre
                        </button>
                      )}
                    </div>
                    {showCustomInput && (
                      <div className="flex gap-2 mt-3">
                        <input
                          value={customDiscipline}
                          onChange={(e) => setCustomDiscipline(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomEditDiscipline(); } }}
                          placeholder="Ex : Piano, Beatbox..."
                          autoFocus
                          className="flex-1 rounded-[12px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/20"
                        />
                        <button onClick={addCustomEditDiscipline}
                          className="rounded-[12px] px-4 py-2.5 text-xs font-semibold text-white"
                          style={{ background: "rgb(22,92,71)" }}>
                          Ajouter
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Deadline annulation</Label>
                      <select value={editDeadline} onChange={(e) => setEditDeadline(e.target.value)}
                        className="w-full rounded-[12px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/20"
                        style={{ color: "rgb(8,20,14)" }}>
                        {DEADLINES.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button onClick={() => setEditAbonnement((v) => !v)}
                        className="w-full rounded-[12px] border py-3 text-sm font-semibold transition"
                        style={{
                          background: editAbonnement ? "rgb(22,92,71)" : "rgb(247,250,247)",
                          border: editAbonnement ? "1px solid rgb(22,92,71)" : "1px solid rgba(0,0,0,0.1)",
                          color: editAbonnement ? "white" : "rgba(0,0,0,0.5)",
                        }}>
                        Abonnement {editAbonnement ? "activé" : "désactivé"}
                      </button>
                    </div>
                  </div>

                  <button onClick={handleSaveParams} disabled={savingParams}
                    className="w-full rounded-full py-3 text-sm font-semibold text-white transition disabled:opacity-40 flex items-center justify-center gap-2"
                    style={{ background: "rgb(22,92,71)" }}>
                    <Save size={14} /> {savingParams ? "Enregistrement..." : "Enregistrer les modifications"}
                  </button>
                </div>
              )}
            </div>

            {/* ZONE DE DANGER */}
            <div className="rounded-[20px] border border-red-100 bg-red-50/40 overflow-hidden">
              <div className="px-6 py-4 border-b border-red-100">
                <p className="text-sm font-semibold text-red-700">Zone de danger</p>
                <p className="text-xs text-red-700/60 mt-0.5">Suppression définitive et irréversible</p>
              </div>
              <div className="px-6 py-4 flex items-center justify-between gap-4">
                <p className="text-xs text-black/45 leading-5 max-w-xs">
                  Pour un vrai départ de professeur, préfère clôturer le contrat plutôt que supprimer — ça garde l'historique. Réserve la suppression aux comptes de test ou créés par erreur.
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="shrink-0 px-5 py-2.5 rounded-full text-xs font-semibold transition hover:bg-red-100"
                  style={{ border: "1px solid rgba(220,38,38,0.3)", color: "rgb(220,38,38)" }}
                >
                  Supprimer le professeur
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helpers UI ────────────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-[0.18em] mb-2"
      style={{ color: "rgba(0,0,0,0.4)" }}>
      {children}
    </label>
  );
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-[12px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/20 focus:border-[rgb(22,92,71)]"
      style={{ color: "rgb(8,20,14)" }}
    />
  );
}