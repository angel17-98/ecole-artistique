// // // app/plateforme/prof/page.tsx
// // import { createClient } from "@/lib/plateforme/supabase/server";
// // import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
// // import { redirect } from "next/navigation";
// // import Link from "next/link";
// // import { CalendarDays, Clock, Users, Wallet, Plus, ChevronRight, UserCircle  } from "lucide-react";

// // export default async function ProfDashboardPage() {
// //   const supabase = await createClient();
// //   const { data: { user } } = await supabase.auth.getUser();
// //   if (!user) redirect("/plateforme/login");

// //   const { data: profile } = await supabase
// //     .from("profiles")
// //     .select("id, role, prenom, nom")
// //     .eq("id", user.id)
// //     .single();

// //   if (!profile || (profile.role !== "prof_salarie" && profile.role !== "prof_independant" && profile.role !== "direction")) {
// //     redirect("/plateforme/dashboard");
// //   }

// //   // Récupérer les données du prof
// //   const { data: prof } = await supabaseAdmin
// //     .from("profs")
// //     .select("id, type_contrat, disciplines, actif")
// //     .eq("user_id", user.id)
// //     .maybeSingle();

// //   // Contrat actif
// //   const { data: contrat } = prof ? await supabaseAdmin
// //     .from("contrats")
// //     .select("*")
// //     .eq("prof_id", prof.id)
// //     .or("date_fin.is.null,date_fin.gte." + new Date().toISOString().split("T")[0])
// //     .order("date_debut", { ascending: false })
// //     .limit(1)
// //     .maybeSingle() : { data: null };

// //   // Cours collectifs à venir (assignés par la direction)
// //   const { data: coursCollectifs } = prof ? await supabaseAdmin
// //     .from("cours")
// //     .select("id, discipline, date_heure_debut, date_heure_fin, statut, salle:salles(nom)")
// //     .eq("prof_id", prof.id)
// //     .gte("date_heure_debut", new Date().toISOString())
// //     .order("date_heure_debut", { ascending: true })
// //     .limit(5) : { data: [] };

// //   // Créneaux individuels à venir (créés par le prof)
// //   const { data: creneauxAVenir } = prof ? await supabaseAdmin
// //     .from("creneaux")
// //     .select("id, discipline, debut, fin_blocage, statut, salle:salles(nom)")
// //     .eq("prof_id", prof.id)
// //     .eq("statut", "reserve")
// //     .gte("debut", new Date().toISOString())
// //     .order("debut", { ascending: true })
// //     .limit(5) : { data: [] };

// //   // Stats du mois en cours
// //   const debutMois = new Date();
// //   debutMois.setDate(1);
// //   debutMois.setHours(0, 0, 0, 0);

// //   const { count: coursEffectuesMois } = prof ? await supabaseAdmin
// //     .from("creneaux")
// //     .select("id", { count: "exact", head: true })
// //     .eq("prof_id", prof.id)
// //     .eq("statut", "effectue")
// //     .gte("debut", debutMois.toISOString()) : { count: 0 };

// //   const { count: creneauxDisponibles } = prof ? await supabaseAdmin
// //     .from("creneaux")
// //     .select("id", { count: "exact", head: true })
// //     .eq("prof_id", prof.id)
// //     .eq("statut", "disponible")
// //     .gte("debut", new Date().toISOString()) : { count: 0 };

// //   // Rémunération du mois
// //   const moisCourant = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`;
// //   const { data: remuneration } = prof ? await supabaseAdmin
// //     .from("remuneration_mensuelle")
// //     .select("montant_calcule, ajustement, statut")
// //     .eq("prof_id", prof.id)
// //     .eq("mois", moisCourant)
// //     .maybeSingle() : { data: null };

// //   const montantTotal = remuneration
// //     ? (remuneration.montant_calcule ?? 0) + (remuneration.ajustement ?? 0)
// //     : null;

// //   const prochainCours = [
// //     ...(coursCollectifs ?? []).map((c: any) => ({
// //       id: c.id,
// //       type: "collectif" as const,
// //       discipline: c.discipline,
// //       debut: c.date_heure_debut,
// //       fin: c.date_heure_fin,
// //       salle: c.salle?.nom,
// //     })),
// //     ...(creneauxAVenir ?? []).map((c: any) => ({
// //       id: c.id,
// //       type: "individuel" as const,
// //       discipline: c.discipline,
// //       debut: c.debut,
// //       fin: c.fin_blocage,
// //       salle: c.salle?.nom,
// //     })),
// //   ].sort((a, b) => new Date(a.debut).getTime() - new Date(b.debut).getTime()).slice(0, 6);

// //   const typeContratLabel = contrat?.type === "salarie"
// //     ? "Salarié"
// //     : contrat?.type === "independant"
// //       ? "Indépendant"
// //       : contrat?.type === "mixte"
// //         ? "Salarié + Indépendant"
// //         : "—";

// //   return (
// //     <div className="min-h-screen bg-[rgb(239,244,239)]">
// //       <div className="max-w-5xl mx-auto px-6 py-10 lg:px-10">

// //         {/* En-tête */}
// //         <div className="mb-8">
// //           <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgb(185,151,83)] mb-2">
// //             Espace professeur
// //           </p>
// //           <h1 className="text-3xl font-semibold tracking-tight text-black">
// //             Bonjour, {profile.prenom} 👋
// //           </h1>
// //           <p className="mt-1 text-sm text-black/50">
// //             {typeContratLabel}
// //             {prof?.disciplines?.length
// //               ? ` · ${prof.disciplines.join(", ")}`
// //               : ""}
// //           </p>
// //         </div>

// //         {/* Stats */}
// //         <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
// //           {[
// //             {
// //               label: "Cours ce mois",
// //               value: coursEffectuesMois ?? 0,
// //               icon: <CalendarDays size={16} />,
// //               href: "/plateforme/prof/planning",
// //             },
// //             {
// //               label: "Créneaux ouverts",
// //               value: creneauxDisponibles ?? 0,
// //               icon: <Clock size={16} />,
// //               href: "/plateforme/prof/creneaux",
// //             },
// //             {
// //               label: "Revenus estimés",
// //               value: montantTotal !== null ? `${montantTotal} €` : "—",
// //               icon: <Wallet size={16} />,
// //               href: "/plateforme/prof/remuneration",
// //             },
// //             {
// //               label: "Disciplines",
// //               value: prof?.disciplines?.length ?? 0,
// //               icon: <Users size={16} />,
// //               href: "/plateforme/prof/profil",
// //             },
// //           ].map((stat) => (
// //             <Link
// //               key={stat.label}
// //               href={stat.href}
// //               className="rounded-[20px] border border-black/6 bg-white p-5 flex flex-col gap-3 transition hover:-translate-y-px hover:shadow-sm"
// //               style={{ boxShadow: "0 2px 12px rgba(16,16,16,0.04)" }}
// //             >
// //               <div
// //                 className="w-8 h-8 rounded-[10px] flex items-center justify-center"
// //                 style={{ background: "rgb(239,244,239)", color: "rgb(22,92,71)" }}
// //               >
// //                 {stat.icon}
// //               </div>
// //               <div>
// //                 <p className="text-2xl font-semibold text-black">{stat.value}</p>
// //                 <p className="text-xs text-black/45 mt-0.5">{stat.label}</p>
// //               </div>
// //             </Link>
// //           ))}
// //         </div>

// //         <div className="grid gap-4 lg:grid-cols-3">
// //           {/* Prochains cours */}
// //           <div
// //             className="lg:col-span-2 rounded-[20px] border border-black/6 bg-white overflow-hidden"
// //             style={{ boxShadow: "0 2px 12px rgba(16,16,16,0.04)" }}
// //           >
// //             <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
// //               <p className="text-sm font-semibold text-black">Prochains cours</p>
// //               <Link
// //                 href="/plateforme/prof/planning"
// //                 className="text-xs font-medium text-[rgb(22,92,71)] hover:underline"
// //               >
// //                 Voir le planning →
// //               </Link>
// //             </div>

// //             {prochainCours.length === 0 ? (
// //               <div className="p-10 text-center">
// //                 <p className="text-2xl mb-3">📅</p>
// //                 <p className="text-sm font-medium text-black/50 mb-1">Aucun cours à venir</p>
// //                 <p className="text-xs text-black/35 leading-5 mb-4">
// //                   Crée des créneaux pour que tes élèves puissent réserver.
// //                 </p>
// //                 <Link
// //                   href="/plateforme/prof/creneaux"
// //                   className="inline-flex items-center gap-1.5 rounded-full bg-[rgb(22,92,71)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[rgb(18,75,58)]"
// //                 >
// //                   <Plus size={12} /> Ouvrir des créneaux
// //                 </Link>
// //               </div>
// //             ) : (
// //               <div className="divide-y divide-black/5">
// //                 {prochainCours.map((cours) => {
// //                   const debut = new Date(cours.debut);
// //                   const fin = new Date(cours.fin);
// //                   return (
// //                     <div key={cours.id} className="px-5 py-3.5 flex items-center gap-4">
// //                       {/* Date */}
// //                       <div className="w-10 shrink-0 text-center">
// //                         <p className="text-[10px] font-bold uppercase tracking-wide text-black/35">
// //                           {debut.toLocaleDateString("fr-BE", { weekday: "short" })}
// //                         </p>
// //                         <p className="text-lg font-semibold text-black leading-none mt-0.5">
// //                           {debut.getDate()}
// //                         </p>
// //                       </div>
// //                       {/* Infos */}
// //                       <div className="flex-1 min-w-0">
// //                         <div className="flex items-center gap-2">
// //                           <p className="text-sm font-medium text-black truncate">
// //                             {cours.discipline}
// //                           </p>
// //                           <span
// //                             className="shrink-0 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
// //                             style={{
// //                               background: cours.type === "collectif"
// //                                 ? "rgba(185,151,83,0.15)"
// //                                 : "rgba(22,92,71,0.1)",
// //                               color: cours.type === "collectif"
// //                                 ? "rgb(146,95,14)"
// //                                 : "rgb(22,92,71)",
// //                             }}
// //                           >
// //                             {cours.type === "collectif" ? "Collectif" : "Individuel"}
// //                           </span>
// //                         </div>
// //                         <p className="text-xs text-black/40 mt-0.5">
// //                           {debut.toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" })}
// //                           {" → "}
// //                           {fin.toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" })}
// //                           {cours.salle ? ` · ${cours.salle}` : ""}
// //                         </p>
// //                       </div>
// //                     </div>
// //                   );
// //                 })}
// //               </div>
// //             )}
// //           </div>

// //           {/* Actions rapides */}
// //           <div
// //             className="rounded-[20px] border border-black/6 bg-white overflow-hidden"
// //             style={{ boxShadow: "0 2px 12px rgba(16,16,16,0.04)" }}
// //           >
// //             <div className="px-5 py-4 border-b border-black/5">
// //               <p className="text-sm font-semibold text-black">Actions rapides</p>
// //             </div>
// //             <div className="p-3 space-y-1">
// //               {[
// //                 { label: "Ouvrir des créneaux", href: "/plateforme/prof/creneaux/nouveau", icon: <Plus size={14} /> },
// //                 { label: "Voir mon planning", href: "/plateforme/prof/planning", icon: <CalendarDays size={14} /> },
// //                 { label: "Mes élèves", href: "/plateforme/prof/eleves", icon: <Users size={14} /> },
// //                 { label: "Ma rémunération", href: "/plateforme/prof/remuneration", icon: <Wallet size={14} /> },
// //                 { label: "Mon profil public", href: "/plateforme/prof/profil", icon: <UserCircle size={14} /> },
// //               ].map((action) => (
// //                 <Link
// //                   key={action.href}
// //                   href={action.href}
// //                   className="flex items-center gap-3 px-4 py-3 rounded-[14px] transition-all hover:-translate-y-px group"
// //                   style={{ border: "1px solid rgba(0,0,0,0.06)", background: "white" }}
// //                 >
// //                   <span style={{ color: "rgb(22,92,71)" }}>{action.icon}</span>
// //                   <span className="text-sm font-medium flex-1 text-black/70 group-hover:text-black transition-colors">
// //                     {action.label}
// //                   </span>
// //                   <ChevronRight size={14} className="text-black/20 group-hover:text-black/50 transition-colors" />
// //                 </Link>
// //               ))}
// //             </div>
// //           </div>
// //         </div>

// //         {/* Alerte si pas de contrat */}
// //         {!contrat && (
// //           <div
// //             className="mt-4 rounded-[16px] border px-5 py-4 flex items-center gap-3"
// //             style={{ background: "rgba(185,151,83,0.08)", borderColor: "rgba(185,151,83,0.3)" }}
// //           >
// //             <span className="text-base">⚠️</span>
// //             <p className="text-sm text-black/70">
// //               Aucun contrat actif trouvé. Contacte la direction pour régulariser ta situation.
// //             </p>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// // app/plateforme/prof/page.tsx
// import { createClient } from "@/lib/plateforme/supabase/server";
// import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
// import { redirect } from "next/navigation";
// import Link from "next/link";
// import { CalendarDays, Clock, Users, Wallet, Plus, ChevronRight, UserCircle } from "lucide-react";

// export default async function ProfDashboardPage() {
//   const supabase = await createClient();
//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) redirect("/plateforme/login");

//   const { data: profile } = await supabase
//     .from("profiles")
//     .select("id, role, prenom, nom")
//     .eq("id", user.id)
//     .single();

//   if (!profile || (profile.role !== "prof_salarie" && profile.role !== "prof_independant" && profile.role !== "direction")) {
//     redirect("/plateforme/dashboard");
//   }

//   const { data: prof } = await supabaseAdmin
//     .from("profs")
//     .select("id, type_contrat, disciplines, actif")
//     .eq("user_id", user.id)
//     .maybeSingle();

//   const { data: contrat } = prof ? await supabaseAdmin
//     .from("contrats")
//     .select("*")
//     .eq("prof_id", prof.id)
//     .or("date_fin.is.null,date_fin.gte." + new Date().toISOString().split("T")[0])
//     .order("date_debut", { ascending: false })
//     .limit(1)
//     .maybeSingle() : { data: null };

//   const { data: coursCollectifs } = prof ? await supabaseAdmin
//     .from("cours")
//     .select("id, discipline, date_heure_debut, date_heure_fin, statut, salle:salles(nom)")
//     .eq("prof_id", prof.id)
//     .gte("date_heure_debut", new Date().toISOString())
//     .order("date_heure_debut", { ascending: true })
//     .limit(5) : { data: [] };

//   const { data: creneauxAVenir } = prof ? await supabaseAdmin
//     .from("creneaux")
//     .select("id, discipline, debut, fin_blocage, statut, salle:salles(nom)")
//     .eq("prof_id", prof.id)
//     .eq("statut", "reserve")
//     .gte("debut", new Date().toISOString())
//     .order("debut", { ascending: true })
//     .limit(5) : { data: [] };

//   const debutMois = new Date();
//   debutMois.setDate(1);
//   debutMois.setHours(0, 0, 0, 0);

//   const { count: coursEffectuesMois } = prof ? await supabaseAdmin
//     .from("creneaux")
//     .select("id", { count: "exact", head: true })
//     .eq("prof_id", prof.id)
//     .eq("statut", "effectue")
//     .gte("debut", debutMois.toISOString()) : { count: 0 };

//   const { count: creneauxDisponibles } = prof ? await supabaseAdmin
//     .from("creneaux")
//     .select("id", { count: "exact", head: true })
//     .eq("prof_id", prof.id)
//     .eq("statut", "disponible")
//     .gte("debut", new Date().toISOString()) : { count: 0 };

//   const moisCourant = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`;
//   const { data: remuneration } = prof ? await supabaseAdmin
//     .from("remuneration_mensuelle")
//     .select("montant_calcule, ajustement, statut")
//     .eq("prof_id", prof.id)
//     .eq("mois", moisCourant)
//     .maybeSingle() : { data: null };

//   const montantTotal = remuneration
//     ? (remuneration.montant_calcule ?? 0) + (remuneration.ajustement ?? 0)
//     : null;

//   const prochainCours = [
//     ...(coursCollectifs ?? []).map((c: any) => ({
//       id: c.id, type: "collectif" as const,
//       discipline: c.discipline,
//       debut: c.date_heure_debut, fin: c.date_heure_fin,
//       salle: c.salle?.nom,
//     })),
//     ...(creneauxAVenir ?? []).map((c: any) => ({
//       id: c.id, type: "individuel" as const,
//       discipline: c.discipline,
//       debut: c.debut, fin: c.fin_blocage,
//       salle: c.salle?.nom,
//     })),
//   ].sort((a, b) => new Date(a.debut).getTime() - new Date(b.debut).getTime()).slice(0, 6);

//   const typeContratLabel = contrat?.type === "salarie" ? "Salarié"
//     : contrat?.type === "independant" ? "Indépendant"
//     : contrat?.type === "mixte" ? "Salarié + Indépendant"
//     : prof?.type_contrat === "salarie" ? "Salarié"
//     : prof?.type_contrat === "independant" ? "Indépendant"
//     : "—";

//   return (
//     <div className="min-h-screen" style={{ background: "rgb(239,244,239)" }}>

//       {/* ── En-tête ── */}
//       <div className="px-10 lg:px-14" style={{ paddingTop: "calc(88px + 24px)", paddingBottom: 24 }}>
//         <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgb(185,151,83)", marginBottom: 6 }}>
//           Espace professeur
//         </p>
//         <h1 style={{ fontSize: 30, fontWeight: 600, color: "rgb(8,20,14)", margin: "0 0 4px" }}>
//           Bonjour, {profile.prenom} 👋
//         </h1>
//         <p style={{ fontSize: 13, color: "rgba(0,0,0,0.45)", margin: 0 }}>
//           {typeContratLabel}
//           {prof?.disciplines?.length ? ` · ${prof.disciplines.join(", ")}` : ""}
//         </p>
//       </div>

//       {/* ── Contenu ── */}
//       <div className="px-10 lg:px-14 pb-10">

//         {/* Alerte pas de contrat */}
//         {!contrat && (
//           <div className="mb-5 rounded-[16px] border px-5 py-4 flex items-center gap-3"
//             style={{ background: "rgba(185,151,83,0.08)", borderColor: "rgba(185,151,83,0.3)" }}>
//             <span className="text-base">⚠️</span>
//             <p className="text-sm text-black/70">
//               Aucun contrat actif trouvé. Contacte la direction pour régulariser ta situation.
//             </p>
//           </div>
//         )}

//         {/* Stats */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
//           {[
//             { label: "Cours ce mois", value: coursEffectuesMois ?? 0, icon: <CalendarDays size={16} />, href: "/plateforme/prof/planning" },
//             { label: "Créneaux ouverts", value: creneauxDisponibles ?? 0, icon: <Clock size={16} />, href: "/plateforme/prof/creneaux" },
//             { label: "Revenus estimés", value: montantTotal !== null ? `${montantTotal} €` : "—", icon: <Wallet size={16} />, href: "/plateforme/prof/remuneration" },
//             { label: "Disciplines", value: prof?.disciplines?.length ?? 0, icon: <Users size={16} />, href: "/plateforme/prof/profil" },
//           ].map((stat) => (
//             <Link key={stat.label} href={stat.href}
//               className="rounded-[20px] border border-black/6 bg-white p-5 flex flex-col gap-3 transition hover:-translate-y-px"
//               style={{ boxShadow: "0 2px 12px rgba(16,16,16,0.04)" }}>
//               <div className="w-8 h-8 rounded-[10px] flex items-center justify-center"
//                 style={{ background: "rgb(239,244,239)", color: "rgb(22,92,71)" }}>
//                 {stat.icon}
//               </div>
//               <div>
//                 <p className="text-2xl font-semibold text-black">{stat.value}</p>
//                 <p className="text-xs text-black/45 mt-0.5">{stat.label}</p>
//               </div>
//             </Link>
//           ))}
//         </div>

//         <div className="grid gap-4 lg:grid-cols-3">

//           {/* Prochains cours */}
//           <div className="lg:col-span-2 rounded-[20px] border border-black/6 bg-white overflow-hidden"
//             style={{ boxShadow: "0 2px 12px rgba(16,16,16,0.04)" }}>
//             <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
//               <p className="text-sm font-semibold text-black">Prochains cours</p>
//               <Link href="/plateforme/prof/planning" className="text-xs font-medium text-[rgb(22,92,71)] hover:underline">
//                 Voir le planning →
//               </Link>
//             </div>

//             {prochainCours.length === 0 ? (
//               <div className="p-10 text-center">
//                 <p className="text-2xl mb-3">📅</p>
//                 <p className="text-sm font-medium text-black/50 mb-1">Aucun cours à venir</p>
//                 <p className="text-xs text-black/35 leading-5 mb-4">
//                   Crée des créneaux pour que tes élèves puissent réserver.
//                 </p>
//                 <Link href="/plateforme/prof/creneaux"
//                   className="inline-flex items-center gap-1.5 rounded-full bg-[rgb(22,92,71)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[rgb(18,75,58)]">
//                   <Plus size={12} /> Ouvrir des créneaux
//                 </Link>
//               </div>
//             ) : (
//               <div className="divide-y divide-black/5">
//                 {prochainCours.map((cours) => {
//                   const debut = new Date(cours.debut);
//                   const fin = new Date(cours.fin);
//                   return (
//                     <div key={cours.id} className="px-5 py-3.5 flex items-center gap-4">
//                       <div className="w-10 shrink-0 text-center">
//                         <p className="text-[10px] font-bold uppercase tracking-wide text-black/35">
//                           {debut.toLocaleDateString("fr-BE", { weekday: "short" })}
//                         </p>
//                         <p className="text-lg font-semibold text-black leading-none mt-0.5">
//                           {debut.getDate()}
//                         </p>
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-center gap-2">
//                           <p className="text-sm font-medium text-black truncate">{cours.discipline}</p>
//                           <span className="shrink-0 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
//                             style={{
//                               background: cours.type === "collectif" ? "rgba(185,151,83,0.15)" : "rgba(22,92,71,0.1)",
//                               color: cours.type === "collectif" ? "rgb(146,95,14)" : "rgb(22,92,71)",
//                             }}>
//                             {cours.type === "collectif" ? "Collectif" : "Individuel"}
//                           </span>
//                         </div>
//                         <p className="text-xs text-black/40 mt-0.5">
//                           {debut.toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" })}
//                           {" → "}
//                           {fin.toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" })}
//                           {cours.salle ? ` · ${cours.salle}` : ""}
//                         </p>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           {/* Actions rapides */}
//           <div className="rounded-[20px] border border-black/6 bg-white overflow-hidden"
//             style={{ boxShadow: "0 2px 12px rgba(16,16,16,0.04)" }}>
//             <div className="px-5 py-4 border-b border-black/5">
//               <p className="text-sm font-semibold text-black">Actions rapides</p>
//             </div>
//             <div className="p-3 space-y-1">
//               {[
//                 { label: "Ouvrir des créneaux", href: "/plateforme/prof/creneaux/nouveau", icon: <Plus size={14} /> },
//                 { label: "Voir mon planning", href: "/plateforme/prof/planning", icon: <CalendarDays size={14} /> },
//                 { label: "Mes élèves", href: "/plateforme/prof/eleves", icon: <Users size={14} /> },
//                 { label: "Ma rémunération", href: "/plateforme/prof/remuneration", icon: <Wallet size={14} /> },
//                 { label: "Mon profil public", href: "/plateforme/prof/profil", icon: <UserCircle size={14} /> },
//               ].map((action) => (
//                 <Link key={action.href} href={action.href}
//                   className="flex items-center gap-3 px-4 py-3 rounded-[14px] transition-all hover:-translate-y-px group bg-white"
//                   style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
//                   <span style={{ color: "rgb(22,92,71)" }}>{action.icon}</span>
//                   <span className="text-sm font-medium flex-1 text-black/70 group-hover:text-black transition-colors">
//                     {action.label}
//                   </span>
//                   <ChevronRight size={14} className="text-black/20 group-hover:text-black/50 transition-colors" />
//                 </Link>
//               ))}
//             </div>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }

// app/plateforme/prof/page.tsx
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { redirect } from "next/navigation";
import ProfDashboardClient from "./ProfDashboardClient";

export default async function ProfDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/plateforme/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, prenom, nom, photo_url")
    .eq("id", user.id)
    .single();

  if (!profile || (
    profile.role !== "prof_salarie" &&
    profile.role !== "prof_independant" &&
    profile.role !== "direction"
  )) redirect("/plateforme/dashboard");

  const { data: prof } = await supabaseAdmin
    .from("profs")
    .select("id, type_contrat, disciplines, actif")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: contrat } = prof
    ? await supabaseAdmin
        .from("contrats")
        .select("*")
        .eq("prof_id", prof.id)
        .or("date_fin.is.null,date_fin.gte." + new Date().toISOString().split("T")[0])
        .order("date_debut", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };

  // Cours collectifs à venir
  const { data: coursCollectifs } = prof
    ? await supabaseAdmin
        .from("cours")
        .select("id, discipline, date_heure_debut, date_heure_fin, salle:salles(nom)")
        .eq("prof_id", prof.id)
        .gte("date_heure_debut", new Date().toISOString())
        .order("date_heure_debut", { ascending: true })
        .limit(4)
    : { data: [] };

  // Créneaux individuels réservés à venir
  const { data: creneauxAVenir } = prof
    ? await supabaseAdmin
        .from("creneaux")
        .select("id, discipline, debut, fin_blocage, salle:salles(nom)")
        .eq("prof_id", prof.id)
        .eq("statut", "reserve")
        .gte("debut", new Date().toISOString())
        .order("debut", { ascending: true })
        .limit(4)
    : { data: [] };

  // Stats mois courant
  const debutMois = new Date();
  debutMois.setDate(1);
  debutMois.setHours(0, 0, 0, 0);

  const { count: coursEffectuesMois } = prof
    ? await supabaseAdmin
        .from("creneaux")
        .select("id", { count: "exact", head: true })
        .eq("prof_id", prof.id)
        .eq("statut", "effectue")
        .gte("debut", debutMois.toISOString())
    : { count: 0 };

  const { count: creneauxDisponibles } = prof
    ? await supabaseAdmin
        .from("creneaux")
        .select("id", { count: "exact", head: true })
        .eq("prof_id", prof.id)
        .eq("statut", "disponible")
        .gte("debut", new Date().toISOString())
    : { count: 0 };

  // Rémunération mois courant
  const moisCourant = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`;
  const { data: remuneration } = prof
    ? await supabaseAdmin
        .from("remuneration_mensuelle")
        .select("montant_calcule, ajustement")
        .eq("prof_id", prof.id)
        .eq("mois", moisCourant)
        .maybeSingle()
    : { data: null };

  const montantEstime = remuneration
    ? (remuneration.montant_calcule ?? 0) + (remuneration.ajustement ?? 0)
    : null;

  // Messages non lus
  const { data: convs } = await supabaseAdmin
    .from("conversations")
    .select("messages(id, lu_par, sender_id)")
    .contains("participants", [user.id]);

  const messagesNonLus = (convs ?? []).reduce((acc: number, conv: any) => {
    return acc + (conv.messages ?? []).filter(
      (m: any) => !m.lu_par?.includes(user.id) && m.sender_id !== user.id
    ).length;
  }, 0);

  // Fusionner et trier les prochains cours
  const prochainsCours = [
    ...(coursCollectifs ?? []).map((c: any) => ({
      id: c.id, type: "collectif" as const,
      discipline: c.discipline,
      debut: c.date_heure_debut, fin: c.date_heure_fin,
      salle: c.salle?.nom,
    })),
    ...(creneauxAVenir ?? []).map((c: any) => ({
      id: c.id, type: "individuel" as const,
      discipline: c.discipline,
      debut: c.debut, fin: c.fin_blocage,
      salle: c.salle?.nom,
    })),
  ].sort((a, b) => new Date(a.debut).getTime() - new Date(b.debut).getTime()).slice(0, 6);

  // Photo — utilise photo_url ou fallback par prénom
  const photoMap: Record<string, string> = {};
  const photoSrc = profile.photo_url ?? photoMap[profile.prenom ?? ""] ?? null;

  return (
    <ProfDashboardClient
      profile={profile}
      prof={prof}
      contrat={contrat}
      stats={{
        coursEffectuesMois: coursEffectuesMois ?? 0,
        creneauxDisponibles: creneauxDisponibles ?? 0,
        montantEstime,
        nbDisciplines: prof?.disciplines?.length ?? 0,
        messagesNonLus,
      }}
      prochainsCours={prochainsCours}
      photoSrc={photoSrc}
    />
  );
}