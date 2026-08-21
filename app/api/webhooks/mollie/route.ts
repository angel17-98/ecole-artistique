// // app/api/webhooks/mollie/route.ts
// //
// // Point d'entrée UNIQUE pour tous les webhooks Mollie, quel que soit le
// // tunnel de paiement (cours individuel pour l'instant, parcours/éveil plus
// // tard) — on distingue via metadata.type posé à la création du paiement.
// //
// // Règle d'or : on ne fait JAMAIS confiance au contenu brut envoyé par Mollie
// // au webhook (qui ne contient qu'un id de paiement) — on revérifie toujours
// // le statut réel en interrogeant l'API Mollie directement avant d'agir.
// //
// // Mollie appelle cette URL en POST, corps "application/x-www-form-urlencoded"
// // avec un seul champ "id". Il faut TOUJOURS répondre 2xx une fois le paiement
// // lu avec succès, sinon Mollie réessaiera indéfiniment.
// //
// // ⚠️ Cette route doit être joignable publiquement pour que Mollie puisse
// // l'appeler — elle ne fonctionnera jamais en local (localhost) sans un tunnel
// // (ex. ngrok). Pour tester en conditions réelles, il faut que
// // NEXT_PUBLIC_SITE_URL pointe vers le déploiement réel (Vercel), même en
// // mode test Mollie.

// import { NextResponse } from "next/server";
// import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
// import { mollieClient } from "@/lib/mollie";
// import { confirmerReservationCoursIndividuel } from "@/lib/reservation-cours-individuel";

// export async function POST(req: Request) {
//   const bodyText = await req.text();
//   const params = new URLSearchParams(bodyText);
//   const paymentId = params.get("id");

//   if (!paymentId) {
//     return NextResponse.json({ error: "id manquant" }, { status: 400 });
//   }

//   let payment;
//   try {
//     payment = await mollieClient.payments.get(paymentId);
//   } catch (err) {
//     console.error("Webhook Mollie : impossible de récupérer le paiement", paymentId, err);
//     // Erreur potentiellement transitoire (réseau, Mollie down) → 500 pour que
//     // Mollie réessaie plus tard, plutôt que d'abandonner silencieusement.
//     return NextResponse.json({ error: "Erreur lors de la récupération du paiement" }, { status: 500 });
//   }

//   const metadata = (payment.metadata ?? {}) as Record<string, any>;

//   if (metadata.type === "cours_individuel") {
//     await handleCoursIndividuel(payment, metadata);
//   } else {
//     console.warn("Webhook Mollie : metadata.type inconnu ou absent pour le paiement", paymentId, metadata);
//   }

//   return NextResponse.json({ received: true });
// }

// async function handleCoursIndividuel(payment: any, metadata: Record<string, any>) {
//   const creneauId = metadata.creneauId as string | undefined;
//   if (!creneauId) {
//     console.error("Webhook Mollie (cours individuel) : creneauId manquant dans les métadonnées", metadata);
//     return;
//   }

//   if (payment.status === "paid") {
//     // Idempotence : Mollie peut appeler ce webhook plusieurs fois pour le
//     // même paiement. Si une réservation "confirmee" existe déjà pour ce
//     // créneau, elle a déjà été créée par un appel précédent — on ne rejoue
//     // jamais la confirmation (email en double, fidélité comptée deux fois...).
//     const { data: dejaConfirmee } = await supabaseAdmin
//       .from("reservations_indiv")
//       .select("id")
//       .eq("creneau_id", creneauId)
//       .eq("statut", "confirmee")
//       .maybeSingle();

//     if (dejaConfirmee) return;

//     const result = await confirmerReservationCoursIndividuel({
//       creneauId,
//       eleveId: metadata.eleveId,
//       eleve: { prenom: metadata.elevePrenom ?? "" },
//       participants: metadata.participants,
//       mode: metadata.mode,
//       tarifFinal: metadata.tarifFinal,
//       origineTarif: metadata.origineTarif ?? null,
//       note: metadata.note ?? null,
//       userId: metadata.userId,
//       userEmail: metadata.userEmail ?? null,
//     });

//     if ("error" in result) {
//       console.error("Webhook Mollie (cours individuel) : confirmation a échoué", result.error);
//     }
//     return;
//   }

//   if (["expired", "canceled", "failed"].includes(payment.status)) {
//     // Paiement non abouti → on relibère le créneau pour qu'une autre famille
//     // puisse le réserver. Garde-fou : on ne touche que s'il est toujours au
//     // statut "reserve" posé à la création du paiement (on ne doit jamais
//     // écraser une réservation confirmée par ailleurs).
//     await supabaseAdmin
//       .from("creneaux")
//       .update({ statut: "disponible" })
//       .eq("id", creneauId)
//       .eq("statut", "reserve");
//     return;
//   }

//   // Statuts intermédiaires ("open", "pending", "authorized"...) → rien à
//   // faire pour l'instant, on attend le prochain appel webhook de Mollie.
// }

// app/api/webhooks/mollie/route.ts
//
// Point d'entrée UNIQUE pour tous les webhooks Mollie, quel que soit le
// tunnel de paiement (cours individuel pour l'instant, parcours/éveil plus
// tard) — on distingue via metadata.type posé à la création du paiement.
//
// Règle d'or : on ne fait JAMAIS confiance au contenu brut envoyé par Mollie
// au webhook (qui ne contient qu'un id de paiement) — on revérifie toujours
// le statut réel en interrogeant l'API Mollie directement avant d'agir.
//
// Mollie appelle cette URL en POST, corps "application/x-www-form-urlencoded"
// avec un seul champ "id". Il faut TOUJOURS répondre 2xx une fois le paiement
// lu avec succès, sinon Mollie réessaiera indéfiniment.
//
// ⚠️ Cette route doit être joignable publiquement pour que Mollie puisse
// l'appeler — elle ne fonctionnera jamais en local (localhost) sans un tunnel
// (ex. ngrok). Pour tester en conditions réelles, il faut que
// NEXT_PUBLIC_SITE_URL pointe vers le déploiement réel (Vercel), même en
// mode test Mollie.

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { getMollieClient } from "@/lib/mollie";
import { confirmerReservationCoursIndividuel } from "@/lib/reservation-cours-individuel";

export async function POST(req: Request) {
  const bodyText = await req.text();
  const params = new URLSearchParams(bodyText);
  const paymentId = params.get("id");

  if (!paymentId) {
    return NextResponse.json({ error: "id manquant" }, { status: 400 });
  }

  let payment;
  try {
    payment = await getMollieClient().payments.get(paymentId);
  } catch (err) {
    console.error("Webhook Mollie : impossible de récupérer le paiement", paymentId, err);
    // Erreur potentiellement transitoire (réseau, Mollie down) → 500 pour que
    // Mollie réessaie plus tard, plutôt que d'abandonner silencieusement.
    return NextResponse.json({ error: "Erreur lors de la récupération du paiement" }, { status: 500 });
  }

  const metadata = (payment.metadata ?? {}) as Record<string, any>;

  if (metadata.type === "cours_individuel") {
    await handleCoursIndividuel(payment, metadata);
  } else {
    console.warn("Webhook Mollie : metadata.type inconnu ou absent pour le paiement", paymentId, metadata);
  }

  return NextResponse.json({ received: true });
}

async function handleCoursIndividuel(payment: any, metadata: Record<string, any>) {
  const creneauId = metadata.creneauId as string | undefined;
  if (!creneauId) {
    console.error("Webhook Mollie (cours individuel) : creneauId manquant dans les métadonnées", metadata);
    return;
  }

  if (payment.status === "paid") {
    // Idempotence : Mollie peut appeler ce webhook plusieurs fois pour le
    // même paiement. Si une réservation "confirmee" existe déjà pour ce
    // créneau, elle a déjà été créée par un appel précédent — on ne rejoue
    // jamais la confirmation (email en double, fidélité comptée deux fois...).
    const { data: dejaConfirmee } = await supabaseAdmin
      .from("reservations_indiv")
      .select("id")
      .eq("creneau_id", creneauId)
      .eq("statut", "confirmee")
      .maybeSingle();

    if (dejaConfirmee) return;

    const result = await confirmerReservationCoursIndividuel({
      creneauId,
      eleveId: metadata.eleveId,
      eleve: { prenom: metadata.elevePrenom ?? "" },
      participants: metadata.participants,
      mode: metadata.mode,
      tarifFinal: metadata.tarifFinal,
      origineTarif: metadata.origineTarif ?? null,
      note: metadata.note ?? null,
      userId: metadata.userId,
      userEmail: metadata.userEmail ?? null,
    });

    if ("error" in result) {
      console.error("Webhook Mollie (cours individuel) : confirmation a échoué", result.error);
    }
    return;
  }

  if (["expired", "canceled", "failed"].includes(payment.status)) {
    // Paiement non abouti → on relibère le créneau pour qu'une autre famille
    // puisse le réserver. Garde-fou : on ne touche que s'il est toujours au
    // statut "reserve" posé à la création du paiement (on ne doit jamais
    // écraser une réservation confirmée par ailleurs).
    await supabaseAdmin
      .from("creneaux")
      .update({ statut: "disponible" })
      .eq("id", creneauId)
      .eq("statut", "reserve");
    return;
  }

  // Statuts intermédiaires ("open", "pending", "authorized"...) → rien à
  // faire pour l'instant, on attend le prochain appel webhook de Mollie.
}