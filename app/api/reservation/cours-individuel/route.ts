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