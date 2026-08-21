// // import { createClient } from "@/lib/plateforme/supabase/server";
// // import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
// // import { NextResponse } from "next/server";
// // import { Resend } from "resend";

// // const COURS_POUR_GRATUIT = 10;

// // // Un cours dure réellement 45 minutes (cf. DUREE_COURS_MIN dans
// // // OngletCoursIndividuels.tsx) — le créneau, lui, bloque 60 minutes dans
// // // l'agenda pour laisser une marge de battement/changement de salle au prof.
// // // Ce "fin_blocage" est un détail d'implémentation interne : il ne doit
// // // jamais être montré à la famille comme heure de fin du cours, sous peine
// // // de lui faire croire à un cours de 60min. Bug repéré le 20/08/2026 par
// // // Angélie (l'email affichait l'heure de fin du blocage, pas celle du cours).
// // const DUREE_COURS_MIN = 45;

// // const resend = new Resend(process.env.RESEND_API_KEY);

// // // Même pattern défensif que app/api/direction/candidatures/[id]/route.ts :
// // // un échec d'envoi d'email ne doit jamais faire échouer la réservation,
// // // qui est déjà écrite en base à ce stade.
// // async function sendEmail(params: Parameters<typeof resend.emails.send>[0]) {
// //   try {
// //     const result = await resend.emails.send(params);
// //     if (result.error) console.error("Resend error (réservation cours individuel):", result.error);
// //     return result;
// //   } catch (err) {
// //     console.error("sendEmail exception (réservation cours individuel):", err);
// //   }
// // }

// // async function sendNotification(
// //   userId: string, type: string, titre: string, contenu: string, lien?: string
// // ) {
// //   try {
// //     await supabaseAdmin.from("notifications").insert({
// //       user_id: userId, type, titre, contenu, lu: false, lien,
// //     });
// //   } catch (err) {
// //     console.error("sendNotification exception (réservation cours individuel):", err);
// //   }
// // }

// // function formatDateFr(iso: string) {
// //   return new Date(iso).toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long" });
// // }
// // function formatHeureFr(iso: string) {
// //   return new Date(iso).toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" });
// // }

// // export async function POST(req: Request) {
// //   const supabase = await createClient();
// //   const { data: { user } } = await supabase.auth.getUser();
// //   if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

// //   const { creneauId, eleveId, participants, mode, note } = await req.json();

// //   if (!creneauId || !eleveId || !participants || !mode) {
// //     return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
// //   }
// //   if (![1, 2, 3].includes(participants)) {
// //     return NextResponse.json({ error: "Participants invalide" }, { status: 400 });
// //   }

// //   if (!["seance", "annuel"].includes(mode)) {
// //     return NextResponse.json({ error: "Mode invalide" }, { status: 400 });
// //   }

// //   // 1. Vérifier que l'élève appartient au foyer de l'utilisateur connecté
// //   const { data: foyer } = await supabase
// //     .from("foyers")
// //     .select("id, eleves(id, prenom)")
// //     .eq("user_id", user.id)
// //     .single();

// //   const eleve = foyer?.eleves?.find((e: any) => e.id === eleveId);
// //   if (!foyer || !eleve) {
// //     return NextResponse.json({ error: "Élève introuvable dans ton foyer" }, { status: 403 });
// //   }

// //   // 2. Récupérer le créneau
// //   const { data: creneau } = await supabaseAdmin
// //     .from("creneaux")
// //     .select("id, prof_id, statut, debut, fin_blocage, abonnement_possible, discipline")
// //     .eq("id", creneauId)
// //     .maybeSingle();

// //   if (!creneau) return NextResponse.json({ error: "Créneau introuvable" }, { status: 404 });
// //   if (creneau.statut !== "disponible") {
// //     return NextResponse.json({ error: "Ce créneau n'est plus disponible" }, { status: 409 });
// //   }
// //   if (new Date(creneau.debut) <= new Date()) {
// //     return NextResponse.json({ error: "Ce créneau est déjà passé" }, { status: 409 });
// //   }
// //   if (mode === "annuel" && !creneau.abonnement_possible) {
// //     return NextResponse.json({ error: "Abonnement non proposé pour ce créneau" }, { status: 400 });
// //   }

// //   // 3. Vérifier que le prof accepte le duo/trio si besoin
// //   if (participants >= 2) {
// //     const { data: prof } = await supabaseAdmin
// //       .from("profs")
// //       .select("accepte_duo, accepte_trio")
// //       .eq("id", creneau.prof_id)
// //       .single();
// //     if (participants === 2 && !prof?.accepte_duo) {
// //       return NextResponse.json({ error: "Ce professeur n'accepte pas les cours duo" }, { status: 400 });
// //     }
// //     if (participants === 3 && !prof?.accepte_trio) {
// //       return NextResponse.json({ error: "Ce professeur n'accepte pas les cours trio" }, { status: 400 });
// //     }
// //   }

// //   // 4. Tarif — contrat actif du prof
// //   const today = new Date().toISOString().split("T")[0];
// //   const { data: contrat } = await supabaseAdmin
// //     .from("contrats")
// //     .select("tarif_cours_indiv, tarif_duo, tarif_trio")
// //     .eq("prof_id", creneau.prof_id)
// //     .or(`date_fin.is.null,date_fin.gte.${today}`)
// //     .order("date_debut", { ascending: false })
// //     .limit(1)
// //     .maybeSingle();

// //   const tarifBase = participants === 3 ? (contrat?.tarif_trio ?? contrat?.tarif_cours_indiv ?? 0)
// //     : participants === 2 ? (contrat?.tarif_duo ?? contrat?.tarif_cours_indiv ?? 0)
// //     : (contrat?.tarif_cours_indiv ?? 0);

// //   let tarifFinal = mode === "annuel" ? Math.round(tarifBase * 36 * 0.9) : tarifBase * participants;
// //   let origineTarif: "decouverte" | "fidelite" | null = null;

// //   // 4bis. Réduction "premier cours" — scopée au foyer, via reservations_indiv
// //   if (mode === "seance") {
// //     const { data: creneauxDiscipline } = await supabaseAdmin
// //       .from("creneaux")
// //       .select("id")
// //       .eq("discipline", creneau.discipline);

// //     const creneauIdsDiscipline = (creneauxDiscipline ?? []).map((c) => c.id);

// //     const { count: dejaPrisDiscipline } = creneauIdsDiscipline.length > 0
// //       ? await supabaseAdmin
// //           .from("reservations_indiv")
// //           .select("id", { count: "exact", head: true })
// //           .in("eleve_id", foyer.eleves.map((e: any) => e.id))
// //           .in("creneau_id", creneauIdsDiscipline)
// //           .in("statut", ["confirmee", "effectuee"])
// //       : { count: 0 };

// //     if ((dejaPrisDiscipline ?? 0) === 0) {
// //       tarifFinal = Math.round(tarifFinal * 0.5 * 100) / 100;
// //       origineTarif = "decouverte";
// //     }
// //   }

// //   // 5. Carte fidélité — seulement si pas déjà en tarif découverte
// //   let coursGratuit = false;
// //   if (mode === "seance" && origineTarif !== "decouverte") {
// //     const { data: carte } = await supabaseAdmin
// //       .from("fidelite")
// //       .select("id, compteur, total_offerts")
// //       .eq("foyer_id", foyer.id)
// //       .eq("type_carte", "cours_individuel")
// //       .maybeSingle();

// //     if (carte && carte.compteur >= COURS_POUR_GRATUIT) {
// //       coursGratuit = true;
// //       tarifFinal = 0;
// //       origineTarif = "fidelite";
// //       await supabaseAdmin
// //         .from("fidelite")
// //         .update({ compteur: 0, total_offerts: (carte.total_offerts ?? 0) + 1 })
// //         .eq("id", carte.id);
// //     } else if (carte) {
// //       await supabaseAdmin.from("fidelite").update({ compteur: carte.compteur + 1 }).eq("id", carte.id);
// //     } else {
// //       await supabaseAdmin.from("fidelite").insert({ foyer_id: foyer.id, type_carte: "cours_individuel", compteur: 1, total_offerts: 0 });
// //     }
// //   }

// //   // 6. Verrouiller le créneau — garde-fou anti double-réservation
// //   const { data: locked, error: lockErr } = await supabaseAdmin
// //     .from("creneaux")
// //     .update({ statut: "reserve" })
// //     .eq("id", creneauId)
// //     .eq("statut", "disponible")
// //     .select("id")
// //     .maybeSingle();

// //   if (lockErr) return NextResponse.json({ error: lockErr.message }, { status: 500 });
// //   if (!locked) {
// //     return NextResponse.json({ error: "Ce créneau vient d'être réservé par quelqu'un d'autre" }, { status: 409 });
// //   }

// //   // 7. Créer la réservation
// //   // La colonne "type" a sa propre contrainte en base (reservations_indiv_type_check),
// //   // distincte de "mode" ("seance"/"annuel") : elle n'accepte que "ponctuel" ou
// //   // "abonnement". L'ancien code y insérait "mode" tel quel ("seance"/"annuel"),
// //   // ce qui viole systématiquement la contrainte et fait échouer TOUTE réservation
// //   // avec un 500 — bug préexistant, jamais détecté avant ce test.
// //   const typeReservation = mode === "annuel" ? "abonnement" : "ponctuel";

// //   const { error: resErr } = await supabaseAdmin
// //     .from("reservations_indiv")
// //     .insert({
// //       creneau_id: creneauId,
// //       eleve_id: eleveId,
// //       type: typeReservation,
// //       statut: "confirmee",
// //       participants,
// //       mode_reservation: mode,
// //       tarif_final: tarifFinal,
// //       origine_tarif: origineTarif,
// //       note_eleve: note ?? null,
// //     });

// //   if (resErr) {
// //     // Rollback : libérer le créneau si la réservation n'a pas pu être créée
// //     await supabaseAdmin.from("creneaux").update({ statut: "disponible" }).eq("id", creneauId);
// //     return NextResponse.json({ error: resErr.message }, { status: 500 });
// //   }

// //   // 8. Confirmation — email + notification in-app
// //   // Avant, aucune trace écrite n'était envoyée à la famille après une réservation.
// //   // Non bloquant : si l'email ou la notif échouent, la réservation reste valide.
// //   if (user.email) {
// //     const { data: profData } = await supabaseAdmin
// //       .from("profs")
// //       .select("profile:profiles!profs_user_id_fkey(prenom, nom)")
// //       .eq("id", creneau.prof_id)
// //       .maybeSingle();

// //     const profNomComplet = profData?.profile
// //       ? `${(profData.profile as any).prenom ?? ""} ${(profData.profile as any).nom ?? ""}`.trim()
// //       : null;

// //     const finCours = new Date(new Date(creneau.debut).getTime() + DUREE_COURS_MIN * 60000).toISOString();

// //     const dateLabel = formatDateFr(creneau.debut);
// //     const heureLabel = `${formatHeureFr(creneau.debut)} – ${formatHeureFr(finCours)}`;
// //     const modeLabel = mode === "annuel" ? "Abonnement annuel" : "À la séance";

// //     await sendEmail({
// //       from: process.env.RESEND_FROM_EMAIL!,
// //       to: user.email,
// //       subject: `Réservation confirmée — ${creneau.discipline} le ${dateLabel}`,
// //       html: `
// //         <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
// //           <div style="background: rgb(22,92,71); padding: 28px 32px; border-radius: 16px 16px 0 0;">
// //             <p style="color: rgba(255,255,255,0.6); font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; margin: 0 0 8px;">
// //               Crea'Star · Cours individuel
// //             </p>
// //             <h1 style="color: white; font-size: 20px; margin: 0; font-weight: 600;">
// //               Réservation confirmée pour ${eleve.prenom} 🎉
// //             </h1>
// //           </div>
// //           <div style="background: white; padding: 28px 32px; border: 1px solid rgba(0,0,0,0.06); border-radius: 0 0 16px 16px;">
// //             <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 20px;">
// //               <tr>
// //                 <td style="padding: 6px 0; color: rgba(0,0,0,0.45); width: 120px;">Discipline</td>
// //                 <td style="padding: 6px 0; font-weight: 500;">${creneau.discipline}</td>
// //               </tr>
// //               ${profNomComplet ? `
// //               <tr>
// //                 <td style="padding: 6px 0; color: rgba(0,0,0,0.45);">Intervenant</td>
// //                 <td style="padding: 6px 0;">${profNomComplet}</td>
// //               </tr>` : ""}
// //               <tr>
// //                 <td style="padding: 6px 0; color: rgba(0,0,0,0.45);">Date</td>
// //                 <td style="padding: 6px 0; text-transform: capitalize;">${dateLabel}</td>
// //               </tr>
// //               <tr>
// //                 <td style="padding: 6px 0; color: rgba(0,0,0,0.45);">Horaire</td>
// //                 <td style="padding: 6px 0;">${heureLabel}</td>
// //               </tr>
// //               <tr>
// //                 <td style="padding: 6px 0; color: rgba(0,0,0,0.45);">Formule</td>
// //                 <td style="padding: 6px 0;">${modeLabel}</td>
// //               </tr>
// //               <tr>
// //                 <td style="padding: 6px 0; color: rgba(0,0,0,0.45);">Tarif</td>
// //                 <td style="padding: 6px 0; font-weight: 600; color: rgb(22,92,71);">
// //                   ${tarifFinal === 0 ? "Offert (carte fidélité)" : `${tarifFinal} €`}
// //                 </td>
// //               </tr>
// //             </table>
// //             <a href="${process.env.NEXT_PUBLIC_SITE_URL}/plateforme/planning"
// //               style="display: inline-block; background: rgb(22,92,71); color: white; padding: 12px 26px; border-radius: 100px; text-decoration: none; font-size: 14px; font-weight: 600;">
// //               Voir dans mon planning →
// //             </a>
// //             <p style="font-size: 12px; color: rgba(0,0,0,0.35); margin-top: 24px;">
// //               Une question ou besoin de modifier ce créneau ? Contacte la direction.<br/>L'équipe Crea'Star
// //             </p>
// //           </div>
// //         </div>
// //       `,
// //     });

// //     await sendNotification(
// //       user.id,
// //       "systeme",
// //       "Réservation confirmée",
// //       `${creneau.discipline} le ${dateLabel} à ${formatHeureFr(creneau.debut)} pour ${eleve.prenom}.`,
// //       "/plateforme/planning"
// //     );
// //   }

// //   return NextResponse.json({ success: true, coursGratuit, tarifFinal });
// // }

// // app/api/reservation/cours-individuel/route.ts
// //
// // ⚠️ FICHIER DE REMPLACEMENT COMPLET — branchement Mollie (21/08/2026).
// // Reconstruit à partir du fichier existant (je n'avais pas d'accès direct au
// // repo pour éditer en place) : toute la logique de validation/tarif/duo-trio
// // des étapes 1 à 6 est IDENTIQUE à l'ancien fichier. Ce qui change :
// //
// //   - Le cours GRATUIT (fidélité au max) est confirmé immédiatement, comme
// //     avant — mais via la fonction partagée confirmerReservationCoursIndividuel().
// //   - Le cours PAYANT (tarifFinal > 0) n'est PLUS confirmé directement ici :
// //     un paiement Mollie est créé, et le front est redirigé vers son
// //     checkout. La réservation en base + l'email + la fidélité ne sont
// //     désormais écrits qu'après confirmation réelle du paiement, dans
// //     app/api/webhooks/mollie/route.ts.
// //   - L'incrément du compteur fidélité pour un cours payant classique
// //     (compteur pas encore au max) ne se fait donc plus ici, mais seulement
// //     sur paiement confirmé (cf. commentaire dans reservation-cours-individuel.ts).
// //
// // Avant de déployer : vérifier que le reste du fichier (imports, éventuels
// // ajouts faits après le 20/08 que je n'aurais pas vus) correspond bien à ce
// // remplacement — dis-le-moi si `npm run build`/`tsc --noEmit` remonte une
// // erreur d'import ou de type ici, je corrige.

// import { createClient } from "@/lib/plateforme/supabase/server";
// import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
// import { NextResponse } from "next/server";
// import { mollieClient } from "@/lib/mollie";
// import { confirmerReservationCoursIndividuel } from "@/lib/reservation-cours-individuel";

// const COURS_POUR_GRATUIT = 10;

// export async function POST(req: Request) {
//   const supabase = await createClient();
//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

//   const { creneauId, eleveId, participants, mode, note } = await req.json();

//   if (!creneauId || !eleveId || !participants || !mode) {
//     return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
//   }
//   if (![1, 2, 3].includes(participants)) {
//     return NextResponse.json({ error: "Participants invalide" }, { status: 400 });
//   }
//   if (!["seance", "annuel"].includes(mode)) {
//     return NextResponse.json({ error: "Mode invalide" }, { status: 400 });
//   }

//   // 1. Vérifier que l'élève appartient au foyer de l'utilisateur connecté
//   const { data: foyer } = await supabase
//     .from("foyers")
//     .select("id, eleves(id, prenom)")
//     .eq("user_id", user.id)
//     .single();

//   const eleve = foyer?.eleves?.find((e: any) => e.id === eleveId);
//   if (!foyer || !eleve) {
//     return NextResponse.json({ error: "Élève introuvable dans ton foyer" }, { status: 403 });
//   }

//   // 2. Récupérer le créneau
//   const { data: creneau } = await supabaseAdmin
//     .from("creneaux")
//     .select("id, prof_id, statut, debut, fin_blocage, abonnement_possible, discipline")
//     .eq("id", creneauId)
//     .maybeSingle();

//   if (!creneau) return NextResponse.json({ error: "Créneau introuvable" }, { status: 404 });
//   if (creneau.statut !== "disponible") {
//     return NextResponse.json({ error: "Ce créneau n'est plus disponible" }, { status: 409 });
//   }
//   if (new Date(creneau.debut) <= new Date()) {
//     return NextResponse.json({ error: "Ce créneau est déjà passé" }, { status: 409 });
//   }
//   if (mode === "annuel" && !creneau.abonnement_possible) {
//     return NextResponse.json({ error: "Abonnement non proposé pour ce créneau" }, { status: 400 });
//   }

//   // 3. Vérifier que le prof accepte le duo/trio si besoin
//   if (participants >= 2) {
//     const { data: prof } = await supabaseAdmin
//       .from("profs")
//       .select("accepte_duo, accepte_trio")
//       .eq("id", creneau.prof_id)
//       .single();
//     if (participants === 2 && !prof?.accepte_duo) {
//       return NextResponse.json({ error: "Ce professeur n'accepte pas les cours duo" }, { status: 400 });
//     }
//     if (participants === 3 && !prof?.accepte_trio) {
//       return NextResponse.json({ error: "Ce professeur n'accepte pas les cours trio" }, { status: 400 });
//     }
//   }

//   // 4. Tarif — contrat actif du prof
//   const today = new Date().toISOString().split("T")[0];
//   const { data: contrat } = await supabaseAdmin
//     .from("contrats")
//     .select("tarif_cours_indiv, tarif_duo, tarif_trio")
//     .eq("prof_id", creneau.prof_id)
//     .or(`date_fin.is.null,date_fin.gte.${today}`)
//     .order("date_debut", { ascending: false })
//     .limit(1)
//     .maybeSingle();

//   const tarifBase = participants === 3 ? (contrat?.tarif_trio ?? contrat?.tarif_cours_indiv ?? 0)
//     : participants === 2 ? (contrat?.tarif_duo ?? contrat?.tarif_cours_indiv ?? 0)
//     : (contrat?.tarif_cours_indiv ?? 0);

//   let tarifFinal = mode === "annuel" ? Math.round(tarifBase * 36 * 0.9) : tarifBase * participants;
//   let origineTarif: "decouverte" | "fidelite" | null = null;

//   // 4bis. Réduction "premier cours" — scopée au foyer, via reservations_indiv
//   if (mode === "seance") {
//     const { data: creneauxDiscipline } = await supabaseAdmin
//       .from("creneaux")
//       .select("id")
//       .eq("discipline", creneau.discipline);

//     const creneauIdsDiscipline = (creneauxDiscipline ?? []).map((c) => c.id);

//     const { count: dejaPrisDiscipline } = creneauIdsDiscipline.length > 0
//       ? await supabaseAdmin
//           .from("reservations_indiv")
//           .select("id", { count: "exact", head: true })
//           .in("eleve_id", foyer.eleves.map((e: any) => e.id))
//           .in("creneau_id", creneauIdsDiscipline)
//           .in("statut", ["confirmee", "effectuee"])
//       : { count: 0 };

//     if ((dejaPrisDiscipline ?? 0) === 0) {
//       tarifFinal = Math.round(tarifFinal * 0.5 * 100) / 100;
//       origineTarif = "decouverte";
//     }
//   }

//   // 5. Carte fidélité — LECTURE seule ici désormais (cf. en-tête du fichier).
//   // Si le compteur est déjà au max, le cours est gratuit immédiatement : rien
//   // à payer, donc rien à attendre d'un webhook — on remet le compteur à 0
//   // tout de suite, comme avant. Sinon, l'incrément est différé (voir
//   // reservation-cours-individuel.ts), pour ne compter que les cours
//   // réellement payés.
//   let coursGratuit = false;
//   if (mode === "seance" && origineTarif !== "decouverte") {
//     const { data: carte } = await supabaseAdmin
//       .from("fidelite")
//       .select("id, compteur, total_offerts")
//       .eq("foyer_id", foyer.id)
//       .eq("type_carte", "cours_individuel")
//       .maybeSingle();

//     if (carte && carte.compteur >= COURS_POUR_GRATUIT) {
//       coursGratuit = true;
//       tarifFinal = 0;
//       origineTarif = "fidelite";
//       await supabaseAdmin
//         .from("fidelite")
//         .update({ compteur: 0, total_offerts: (carte.total_offerts ?? 0) + 1 })
//         .eq("id", carte.id);
//     }
//   }

//   // 6. Verrouiller le créneau — garde-fou anti double-réservation.
//   // Se fait AVANT le paiement (gratuit ou non) pour qu'aucune autre famille
//   // ne puisse réserver/payer le même créneau pendant qu'un paiement est en cours.
//   const { data: locked, error: lockErr } = await supabaseAdmin
//     .from("creneaux")
//     .update({ statut: "reserve" })
//     .eq("id", creneauId)
//     .eq("statut", "disponible")
//     .select("id")
//     .maybeSingle();

//   if (lockErr) return NextResponse.json({ error: lockErr.message }, { status: 500 });
//   if (!locked) {
//     return NextResponse.json({ error: "Ce créneau vient d'être réservé par quelqu'un d'autre" }, { status: 409 });
//   }

//   // 7a. Cours gratuit (fidélité) → confirmation immédiate, pas de paiement.
//   if (tarifFinal === 0) {
//     const result = await confirmerReservationCoursIndividuel({
//       creneauId,
//       eleveId,
//       eleve,
//       participants,
//       mode,
//       tarifFinal: 0,
//       origineTarif,
//       note: note ?? null,
//       userId: user.id,
//       userEmail: user.email ?? null,
//     });

//     if ("error" in result) {
//       return NextResponse.json({ error: result.error }, { status: 500 });
//     }
//     return NextResponse.json({ success: true, coursGratuit, tarifFinal: 0 });
//   }

//   // 7b. Cours payant → création du paiement Mollie, redirection vers son
//   // checkout. Restreint à Bancontact (décision prise avec Angélie le
//   // 21/08/2026 : seul moyen de paiement compatible avec un verrouillage de
//   // créneau immédiat — le virement bancaire prend 1 à 3 jours ouvrés).
//   //
//   // La réservation n'est PAS créée ici : elle ne le sera que si le paiement
//   // est réellement confirmé, via le webhook /api/webhooks/mollie.
//   try {
//     const payment = await mollieClient.payments.create({
//       amount: { currency: "EUR", value: tarifFinal.toFixed(2) },
//       description: `Cours individuel — ${creneau.discipline} — ${eleve.prenom}`,
//       redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/plateforme/planning?paiement=verification`,
//       webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/mollie`,
//       method: "bancontact",
//       metadata: {
//         type: "cours_individuel",
//         creneauId,
//         eleveId,
//         elevePrenom: eleve.prenom,
//         participants,
//         mode,
//         tarifFinal,
//         origineTarif,
//         note: note ?? null,
//         userId: user.id,
//         userEmail: user.email ?? null,
//       },
//     } as any);

//     const checkoutUrl = (payment as any)?._links?.checkout?.href;
//     if (!checkoutUrl) {
//       throw new Error("Mollie n'a pas renvoyé d'URL de paiement (checkout href manquant)");
//     }

//     return NextResponse.json({ success: true, checkoutUrl });
//   } catch (err: any) {
//     // Rollback : libérer le créneau si la création du paiement échoue, sinon
//     // il resterait bloqué "reserve" pour rien.
//     await supabaseAdmin.from("creneaux").update({ statut: "disponible" }).eq("id", creneauId);
//     console.error("Erreur création paiement Mollie (cours individuel):", err);
//     return NextResponse.json(
//       { error: "Impossible de créer le paiement pour l'instant. Réessaie dans un instant." },
//       { status: 500 }
//     );
//   }
// }

// app/api/reservation/cours-individuel/route.ts
//
// ⚠️ FICHIER DE REMPLACEMENT COMPLET — branchement Mollie (21/08/2026).
// Reconstruit à partir du fichier existant (je n'avais pas d'accès direct au
// repo pour éditer en place) : toute la logique de validation/tarif/duo-trio
// des étapes 1 à 6 est IDENTIQUE à l'ancien fichier. Ce qui change :
//
//   - Le cours GRATUIT (fidélité au max) est confirmé immédiatement, comme
//     avant — mais via la fonction partagée confirmerReservationCoursIndividuel().
//   - Le cours PAYANT (tarifFinal > 0) n'est PLUS confirmé directement ici :
//     un paiement Mollie est créé, et le front est redirigé vers son
//     checkout. La réservation en base + l'email + la fidélité ne sont
//     désormais écrits qu'après confirmation réelle du paiement, dans
//     app/api/webhooks/mollie/route.ts.
//   - L'incrément du compteur fidélité pour un cours payant classique
//     (compteur pas encore au max) ne se fait donc plus ici, mais seulement
//     sur paiement confirmé (cf. commentaire dans reservation-cours-individuel.ts).
//
// Avant de déployer : vérifier que le reste du fichier (imports, éventuels
// ajouts faits après le 20/08 que je n'aurais pas vus) correspond bien à ce
// remplacement — dis-le-moi si `npm run build`/`tsc --noEmit` remonte une
// erreur d'import ou de type ici, je corrige.

import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { NextResponse } from "next/server";
import { getMollieClient } from "@/lib/mollie";
import { confirmerReservationCoursIndividuel } from "@/lib/reservation-cours-individuel";

const COURS_POUR_GRATUIT = 10;

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { creneauId, eleveId, participants, mode, note } = await req.json();

  if (!creneauId || !eleveId || !participants || !mode) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }
  if (![1, 2, 3].includes(participants)) {
    return NextResponse.json({ error: "Participants invalide" }, { status: 400 });
  }
  if (!["seance", "annuel"].includes(mode)) {
    return NextResponse.json({ error: "Mode invalide" }, { status: 400 });
  }

  // 1. Vérifier que l'élève appartient au foyer de l'utilisateur connecté
  const { data: foyer } = await supabase
    .from("foyers")
    .select("id, eleves(id, prenom)")
    .eq("user_id", user.id)
    .single();

  const eleve = foyer?.eleves?.find((e: any) => e.id === eleveId);
  if (!foyer || !eleve) {
    return NextResponse.json({ error: "Élève introuvable dans ton foyer" }, { status: 403 });
  }

  // 2. Récupérer le créneau
  const { data: creneau } = await supabaseAdmin
    .from("creneaux")
    .select("id, prof_id, statut, debut, fin_blocage, abonnement_possible, discipline")
    .eq("id", creneauId)
    .maybeSingle();

  if (!creneau) return NextResponse.json({ error: "Créneau introuvable" }, { status: 404 });
  if (creneau.statut !== "disponible") {
    return NextResponse.json({ error: "Ce créneau n'est plus disponible" }, { status: 409 });
  }
  if (new Date(creneau.debut) <= new Date()) {
    return NextResponse.json({ error: "Ce créneau est déjà passé" }, { status: 409 });
  }
  if (mode === "annuel" && !creneau.abonnement_possible) {
    return NextResponse.json({ error: "Abonnement non proposé pour ce créneau" }, { status: 400 });
  }

  // 3. Vérifier que le prof accepte le duo/trio si besoin
  if (participants >= 2) {
    const { data: prof } = await supabaseAdmin
      .from("profs")
      .select("accepte_duo, accepte_trio")
      .eq("id", creneau.prof_id)
      .single();
    if (participants === 2 && !prof?.accepte_duo) {
      return NextResponse.json({ error: "Ce professeur n'accepte pas les cours duo" }, { status: 400 });
    }
    if (participants === 3 && !prof?.accepte_trio) {
      return NextResponse.json({ error: "Ce professeur n'accepte pas les cours trio" }, { status: 400 });
    }
  }

  // 4. Tarif — contrat actif du prof
  const today = new Date().toISOString().split("T")[0];
  const { data: contrat } = await supabaseAdmin
    .from("contrats")
    .select("tarif_cours_indiv, tarif_duo, tarif_trio")
    .eq("prof_id", creneau.prof_id)
    .or(`date_fin.is.null,date_fin.gte.${today}`)
    .order("date_debut", { ascending: false })
    .limit(1)
    .maybeSingle();

  const tarifBase = participants === 3 ? (contrat?.tarif_trio ?? contrat?.tarif_cours_indiv ?? 0)
    : participants === 2 ? (contrat?.tarif_duo ?? contrat?.tarif_cours_indiv ?? 0)
    : (contrat?.tarif_cours_indiv ?? 0);

  let tarifFinal = mode === "annuel" ? Math.round(tarifBase * 36 * 0.9) : tarifBase * participants;
  let origineTarif: "decouverte" | "fidelite" | null = null;

  // 4bis. Réduction "premier cours" — scopée au foyer, via reservations_indiv
  if (mode === "seance") {
    const { data: creneauxDiscipline } = await supabaseAdmin
      .from("creneaux")
      .select("id")
      .eq("discipline", creneau.discipline);

    const creneauIdsDiscipline = (creneauxDiscipline ?? []).map((c) => c.id);

    const { count: dejaPrisDiscipline } = creneauIdsDiscipline.length > 0
      ? await supabaseAdmin
          .from("reservations_indiv")
          .select("id", { count: "exact", head: true })
          .in("eleve_id", foyer.eleves.map((e: any) => e.id))
          .in("creneau_id", creneauIdsDiscipline)
          .in("statut", ["confirmee", "effectuee"])
      : { count: 0 };

    if ((dejaPrisDiscipline ?? 0) === 0) {
      tarifFinal = Math.round(tarifFinal * 0.5 * 100) / 100;
      origineTarif = "decouverte";
    }
  }

  // 5. Carte fidélité — LECTURE seule ici désormais (cf. en-tête du fichier).
  // Si le compteur est déjà au max, le cours est gratuit immédiatement : rien
  // à payer, donc rien à attendre d'un webhook — on remet le compteur à 0
  // tout de suite, comme avant. Sinon, l'incrément est différé (voir
  // reservation-cours-individuel.ts), pour ne compter que les cours
  // réellement payés.
  let coursGratuit = false;
  if (mode === "seance" && origineTarif !== "decouverte") {
    const { data: carte } = await supabaseAdmin
      .from("fidelite")
      .select("id, compteur, total_offerts")
      .eq("foyer_id", foyer.id)
      .eq("type_carte", "cours_individuel")
      .maybeSingle();

    if (carte && carte.compteur >= COURS_POUR_GRATUIT) {
      coursGratuit = true;
      tarifFinal = 0;
      origineTarif = "fidelite";
      await supabaseAdmin
        .from("fidelite")
        .update({ compteur: 0, total_offerts: (carte.total_offerts ?? 0) + 1 })
        .eq("id", carte.id);
    }
  }

  // 6. Verrouiller le créneau — garde-fou anti double-réservation.
  // Se fait AVANT le paiement (gratuit ou non) pour qu'aucune autre famille
  // ne puisse réserver/payer le même créneau pendant qu'un paiement est en cours.
  const { data: locked, error: lockErr } = await supabaseAdmin
    .from("creneaux")
    .update({ statut: "reserve" })
    .eq("id", creneauId)
    .eq("statut", "disponible")
    .select("id")
    .maybeSingle();

  if (lockErr) return NextResponse.json({ error: lockErr.message }, { status: 500 });
  if (!locked) {
    return NextResponse.json({ error: "Ce créneau vient d'être réservé par quelqu'un d'autre" }, { status: 409 });
  }

  // 7a. Cours gratuit (fidélité) → confirmation immédiate, pas de paiement.
  if (tarifFinal === 0) {
    const result = await confirmerReservationCoursIndividuel({
      creneauId,
      eleveId,
      eleve,
      participants,
      mode,
      tarifFinal: 0,
      origineTarif,
      note: note ?? null,
      userId: user.id,
      userEmail: user.email ?? null,
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ success: true, coursGratuit, tarifFinal: 0 });
  }

  // 7b. Cours payant → création du paiement Mollie, redirection vers son
  // checkout. Restreint à Bancontact (décision prise avec Angélie le
  // 21/08/2026 : seul moyen de paiement compatible avec un verrouillage de
  // créneau immédiat — le virement bancaire prend 1 à 3 jours ouvrés).
  //
  // La réservation n'est PAS créée ici : elle ne le sera que si le paiement
  // est réellement confirmé, via le webhook /api/webhooks/mollie.
  try {
    const payment = await getMollieClient().payments.create({
      amount: { currency: "EUR", value: tarifFinal.toFixed(2) },
      description: `Cours individuel — ${creneau.discipline} — ${eleve.prenom}`,
      redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/plateforme/planning?paiement=verification`,
      webhookUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/mollie`,
      method: "bancontact",
      metadata: {
        type: "cours_individuel",
        creneauId,
        eleveId,
        elevePrenom: eleve.prenom,
        participants,
        mode,
        tarifFinal,
        origineTarif,
        note: note ?? null,
        userId: user.id,
        userEmail: user.email ?? null,
      },
    } as any);

    const checkoutUrl = (payment as any)?._links?.checkout?.href;
    if (!checkoutUrl) {
      throw new Error("Mollie n'a pas renvoyé d'URL de paiement (checkout href manquant)");
    }

    return NextResponse.json({ success: true, checkoutUrl });
  } catch (err: any) {
    // Rollback : libérer le créneau si la création du paiement échoue, sinon
    // il resterait bloqué "reserve" pour rien.
    await supabaseAdmin.from("creneaux").update({ statut: "disponible" }).eq("id", creneauId);
    console.error("Erreur création paiement Mollie (cours individuel):", err);
    return NextResponse.json(
      { error: "Impossible de créer le paiement pour l'instant. Réessaie dans un instant." },
      { status: 500 }
    );
  }
}