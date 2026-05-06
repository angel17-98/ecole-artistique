// app/api/direction/candidatures/[id]/route.ts
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(params: Parameters<typeof resend.emails.send>[0]) {
  const result = await resend.emails.send(params);
  if (result.error) {
    console.error("Resend error:", result.error);
    throw new Error(`Email failed: ${result.error.message}`);
  }
  return result;
}

const PARCOURS_LABELS: Record<string, string> = {
  "full-artist": "Full Artist",
  "comedie-musicale": "Comédie musicale",
  "eveil-musical": "Éveil musical",
};

// ── Envoyer une notification in-app ──────────────────────────────────────────
async function sendNotification(
  supabase: any,
  userId: string,
  type: string,
  titre: string,
  contenu: string,
  lien?: string
) {
  await supabase.from("notifications").insert({
    user_id: userId,
    type,
    titre,
    contenu,
    lu: false,
    lien,
  });
}

// ── GET — détail d'une candidature ───────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "direction") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { data: candidature } = await supabaseAdmin
    .from("candidatures")
    .select("*")
    .eq("id", id)
    .single();

  if (!candidature) {
    return NextResponse.json({ error: "Candidature introuvable" }, { status: 404 });
  }

  // Chercher si un compte existe avec cet email


  const { data: existingProfile } = await supabaseAdmin
    .from("profiles")
    .select("id, prenom, nom, role")
    .eq("id",
      (await supabaseAdmin.auth.admin.listUsers()).data.users
        .find(u => u.email === candidature.email)?.id ?? ""
    )
    .maybeSingle();

  return NextResponse.json({ candidature, hasAccount: !!existingProfile });
}

// ── PATCH — changer le statut + actions ──────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { data: directionProfile } = await supabase
    .from("profiles")
    .select("role, prenom, nom")
    .eq("id", user.id)
    .single();

  if (directionProfile?.role !== "direction") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const { action, emailObjet, emailContenu, groupeId } = body;

  // Récupérer la candidature
  const { data: candidature } = await supabaseAdmin
    .from("candidatures")
    .select("*")
    .eq("id", id)
    .single();

  if (!candidature) {
    return NextResponse.json({ error: "Candidature introuvable" }, { status: 404 });
  }



  // Trouver si un compte existe
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = users.find(u => u.email === candidature.email);

  // ── ACTION : VALIDER ARTISTIQUEMENT ──────────────────────────────────────
  // Valide le profil artistique — ne garantit pas encore une place
  if (action === "accepter") {
    await supabaseAdmin
      .from("candidatures")
      .update({
        statut: "validee",
        traite_par: user.id,
        traite_at: new Date().toISOString(),
      })
      .eq("id", id);

    // Envoyer email d'acceptation
    await sendEmail({
      from: process.env.RESEND_FROM_EMAIL!,
      to: candidature.email,
      subject: `Ta candidature Crea'Star est retenue 🎉`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: rgb(22,92,71); padding: 32px; border-radius: 16px 16px 0 0;">
            <p style="color: rgba(255,255,255,0.6); font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; margin: 0 0 8px;">Crea'Star</p>
            <h1 style="color: white; font-size: 24px; margin: 0; font-weight: 600;">Félicitations, ${candidature.prenom} ! 🎉</h1>
          </div>
          <div style="background: white; padding: 32px; border: 1px solid rgba(0,0,0,0.06); border-radius: 0 0 16px 16px;">
            <p style="font-size: 15px; color: #111; line-height: 1.7;">Ta candidature pour le parcours <strong>${PARCOURS_LABELS[candidature.parcours] ?? candidature.parcours}</strong> a été <strong style="color: rgb(22,92,71);">acceptée</strong> par la direction de Crea'Star.</p>
            <p style="font-size: 14px; color: rgba(0,0,0,0.6); line-height: 1.7;">Tu seras assigné(e) à un groupe très prochainement. Tu recevras ton planning complet directement dans ton espace personnel.</p>
            ${!existingUser ? `
            <div style="background: rgb(239,244,239); border-radius: 12px; padding: 20px; margin: 24px 0;">
              <p style="font-size: 14px; color: rgb(22,92,71); font-weight: 600; margin: 0 0 8px;">Créer ton compte Crea'Star</p>
              <p style="font-size: 13px; color: rgba(0,0,0,0.6); margin: 0 0 16px;">Pour accéder à ton espace élève et consulter ton planning, crée ton compte en cliquant ci-dessous.</p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/plateforme/login" style="display: inline-block; background: rgb(22,92,71); color: white; padding: 12px 24px; border-radius: 100px; text-decoration: none; font-size: 14px; font-weight: 600;">Créer mon compte →</a>
            </div>
            ` : `
            <div style="background: rgb(239,244,239); border-radius: 12px; padding: 20px; margin: 24px 0;">
              <p style="font-size: 14px; color: rgb(22,92,71); font-weight: 600; margin: 0 0 8px;">Accéder à mon espace</p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/plateforme/dashboard" style="display: inline-block; background: rgb(22,92,71); color: white; padding: 12px 24px; border-radius: 100px; text-decoration: none; font-size: 14px; font-weight: 600;">Mon espace Crea'Star →</a>
            </div>
            `}
            <p style="font-size: 13px; color: rgba(0,0,0,0.4); margin-top: 24px;">L'équipe Crea'Star</p>
          </div>
        </div>
      `,
    });

    // Notification in-app si compte existant
    if (existingUser) {
      await sendNotification(
        supabase,
        existingUser.id,
        "systeme",
        "Candidature acceptée 🎉",
        `Ta candidature pour le parcours ${PARCOURS_LABELS[candidature.parcours] ?? candidature.parcours} a été acceptée ! Tu seras assigné(e) à un groupe prochainement.`,
        "/plateforme/dashboard"
      );
    }

    return NextResponse.json({ success: true, action: "accepter" });
  }

  // ── ACTION : REFUSER ──────────────────────────────────────────────────────
  if (action === "refuser") {
    await supabaseAdmin
      .from("candidatures")
      .update({
        statut: "refusee",
        traite_par: user.id,
        traite_at: new Date().toISOString(),
      })
      .eq("id", id);

    await sendEmail({
      from: process.env.RESEND_FROM_EMAIL!,
      to: candidature.email,
      subject: `Réponse à ta candidature Crea'Star`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: rgb(22,92,71); padding: 32px; border-radius: 16px 16px 0 0;">
            <p style="color: rgba(255,255,255,0.6); font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; margin: 0 0 8px;">Crea'Star</p>
            <h1 style="color: white; font-size: 22px; margin: 0; font-weight: 600;">Bonjour ${candidature.prenom}</h1>
          </div>
          <div style="background: white; padding: 32px; border: 1px solid rgba(0,0,0,0.06); border-radius: 0 0 16px 16px;">
            <p style="font-size: 15px; color: #111; line-height: 1.7;">Nous avons étudié attentivement ta candidature pour le parcours <strong>${PARCOURS_LABELS[candidature.parcours] ?? candidature.parcours}</strong>.</p>
            <p style="font-size: 14px; color: rgba(0,0,0,0.6); line-height: 1.7;">Après examen, nous ne sommes malheureusement pas en mesure de donner suite à ta candidature pour cette session.</p>
            <p style="font-size: 14px; color: rgba(0,0,0,0.6); line-height: 1.7;">Nous t'encourageons à repostuler lors d'une prochaine session. N'hésite pas à nous contacter si tu as des questions.</p>
            <p style="font-size: 13px; color: rgba(0,0,0,0.4); margin-top: 24px;">L'équipe Crea'Star</p>
          </div>
        </div>
      `,
    });

    if (existingUser) {
      await sendNotification(
        supabase,
        existingUser.id,
        "systeme",
        "Réponse à ta candidature",
        `Suite à l'examen de ta candidature pour le parcours ${PARCOURS_LABELS[candidature.parcours] ?? candidature.parcours}, nous ne pouvons pas y donner suite pour cette session.`,
        "/plateforme/dashboard"
      );
    }

    return NextResponse.json({ success: true, action: "refuser" });
  }

  // ── ACTION : LISTE D'ATTENTE ───────────────────────────────────────────────
  if (action === "liste_attente") {
    await supabaseAdmin
      .from("candidatures")
      .update({
        statut: "liste_attente",
        traite_par: user.id,
        traite_at: new Date().toISOString(),
      })
      .eq("id", id);

    await sendEmail({
      from: process.env.RESEND_FROM_EMAIL!,
      to: candidature.email,
      subject: `Ta candidature Crea'Star — Liste d'attente`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: rgb(185,151,83); padding: 32px; border-radius: 16px 16px 0 0;">
            <p style="color: rgba(255,255,255,0.7); font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; margin: 0 0 8px;">Crea'Star</p>
            <h1 style="color: white; font-size: 22px; margin: 0; font-weight: 600;">Bonjour ${candidature.prenom}</h1>
          </div>
          <div style="background: white; padding: 32px; border: 1px solid rgba(0,0,0,0.06); border-radius: 0 0 16px 16px;">
            <p style="font-size: 15px; color: #111; line-height: 1.7;">Ta candidature pour le parcours <strong>${PARCOURS_LABELS[candidature.parcours] ?? candidature.parcours}</strong> a bien été reçue et étudiée.</p>
            <p style="font-size: 14px; color: rgba(0,0,0,0.6); line-height: 1.7;">Les groupes actuels sont complets, mais ta candidature est <strong style="color: rgb(185,151,83);">placée en liste d'attente</strong>. Tu seras contacté(e) en priorité dès qu'une place se libère ou qu'un nouveau groupe est ouvert.</p>
            <p style="font-size: 13px; color: rgba(0,0,0,0.4); margin-top: 24px;">L'équipe Crea'Star</p>
          </div>
        </div>
      `,
    });

    if (existingUser) {
      await sendNotification(
        supabase,
        existingUser.id,
        "systeme",
        "Liste d'attente",
        `Ta candidature pour le parcours ${PARCOURS_LABELS[candidature.parcours] ?? candidature.parcours} est en liste d'attente. Tu seras contacté(e) dès qu'une place se libère.`,
        "/plateforme/dashboard"
      );
    }

    return NextResponse.json({ success: true, action: "liste_attente" });
  }

  // ── ACTION : INFO COMPLÉMENTAIRE ──────────────────────────────────────────
  if (action === "info_complementaire") {
    if (!emailObjet || !emailContenu) {
      return NextResponse.json({ error: "Objet et contenu requis" }, { status: 400 });
    }

    await supabaseAdmin
      .from("candidatures")
      .update({
        statut: "info_complementaire",
      })
      .eq("id", id);

    await sendEmail({
      from: process.env.RESEND_FROM_EMAIL!,
      to: candidature.email,
      replyTo: process.env.RESEND_TO_EMAIL!,
      subject: emailObjet,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: rgb(22,92,71); padding: 32px; border-radius: 16px 16px 0 0;">
            <p style="color: rgba(255,255,255,0.6); font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; margin: 0 0 8px;">Crea'Star · Candidature</p>
            <h1 style="color: white; font-size: 20px; margin: 0; font-weight: 600;">${emailObjet}</h1>
          </div>
          <div style="background: white; padding: 32px; border: 1px solid rgba(0,0,0,0.06); border-radius: 0 0 16px 16px;">
            <p style="font-size: 15px; color: #111; line-height: 1.8; white-space: pre-wrap;">${emailContenu}</p>
            <hr style="border: none; border-top: 1px solid rgba(0,0,0,0.06); margin: 24px 0;">
            <p style="font-size: 13px; color: rgba(0,0,0,0.4);">Tu peux répondre directement à cet email.<br/>L'équipe Crea'Star</p>
          </div>
        </div>
      `,
    });

    if (existingUser) {
      await sendNotification(
        supabase,
        existingUser.id,
        "systeme",
        "Information demandée pour ta candidature",
        `La direction de Crea'Star t'a envoyé un email concernant ta candidature. Vérifie ta boîte mail.`,
        "/plateforme/dashboard"
      );
    }

    // Sauvegarder automatiquement le message envoyé dans les notes direction
    await supabaseAdmin.from("notes_direction").insert({
      candidature_id: id,
      auteur_id: user.id,
      contenu: `📧 EMAIL ENVOYÉ\n\nObjet : ${emailObjet}\n\n${emailContenu}`,
    });

    return NextResponse.json({ success: true, action: "info_complementaire" });
  }

  // ── ACTION : ASSIGNER GROUPE ──────────────────────────────────────────────
  if (action === "assigner_groupe") {
    if (!groupeId) {
      return NextResponse.json({ error: "groupeId requis" }, { status: 400 });
    }

    // Vérifier que la candidature est acceptée
    if (candidature.statut !== "acceptee") {
      return NextResponse.json({ error: "La candidature doit être acceptée avant l'assignation" }, { status: 400 });
    }

    // Vérifier que l'élève a un compte
    if (!existingUser) {
      return NextResponse.json({ error: "L'élève doit avoir un compte pour être assigné à un groupe" }, { status: 400 });
    }

    // Trouver l'élève lié au compte
    const { data: foyer } = await supabaseAdmin
      .from("foyers")
      .select("id, eleves(id)")
      .eq("user_id", existingUser.id)
      .single();

    const eleveId = (foyer?.eleves as any[])?.[0]?.id;
    if (!eleveId) {
      return NextResponse.json({ error: "Aucun profil élève trouvé pour ce compte" }, { status: 400 });
    }

    // Insérer dans groupe_eleves (upsert)
    const { error: assignError } = await supabase
      .from("groupe_eleves")
      .upsert({
        groupe_id: groupeId,
        eleve_id: eleveId,
        candidature_id: id,
        date_assignation: new Date().toISOString(),
      }, { onConflict: "groupe_id,eleve_id" });

    if (assignError) {
      return NextResponse.json({ error: assignError.message }, { status: 500 });
    }

    // Mettre à jour groupe_id dans candidature
    await supabaseAdmin
      .from("candidatures")
      .update({ groupe_id: groupeId })
      .eq("id", id);

    return NextResponse.json({ success: true, action: "assigner_groupe" });
  }

  // ── ACTION : ENVOYER PLANNING ─────────────────────────────────────────────
  if (action === "envoyer_planning") {
    if (!existingUser) {
      return NextResponse.json({ error: "L'élève n'a pas de compte" }, { status: 400 });
    }

    if (!candidature.groupe_id) {
      return NextResponse.json({ error: "L'élève n'est pas encore assigné à un groupe" }, { status: 400 });
    }

    // Récupérer les infos du groupe
    const { data: groupe } = await supabase
      .from("groupes")
      .select("*, parcours(nom), salle:salles(nom)")
      .eq("id", candidature.groupe_id)
      .single();

    const groupeInfo = groupe
      ? `${groupe.parcours?.nom ?? ""} — ${groupe.nom} · ${groupe.jour_semaine ?? ""} ${groupe.heure_debut ?? ""}-${groupe.heure_fin ?? ""}`
      : "Ton groupe";

    // Notification in-app
    await sendNotification(
      supabase,
      existingUser.id,
      "systeme",
      "Ton planning est disponible ! 📅",
      `Ton planning pour ${groupeInfo} est maintenant disponible dans ton espace. Connecte-toi pour le consulter.`,
      "/plateforme/planning"
    );

    // Email
    await sendEmail({
      from: process.env.RESEND_FROM_EMAIL!,
      to: candidature.email,
      subject: "Ton planning Crea'Star est disponible 📅",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: rgb(22,92,71); padding: 32px; border-radius: 16px 16px 0 0;">
            <p style="color: rgba(255,255,255,0.6); font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; margin: 0 0 8px;">Crea'Star</p>
            <h1 style="color: white; font-size: 22px; margin: 0; font-weight: 600;">Ton planning est prêt 📅</h1>
          </div>
          <div style="background: white; padding: 32px; border: 1px solid rgba(0,0,0,0.06); border-radius: 0 0 16px 16px;">
            <p style="font-size: 15px; color: #111; line-height: 1.7;">Bonjour ${candidature.prenom},</p>
            <p style="font-size: 14px; color: rgba(0,0,0,0.6); line-height: 1.7;">Ton planning pour l'année est maintenant disponible dans ton espace Crea'Star.</p>
            <div style="background: rgb(239,244,239); border-radius: 12px; padding: 20px; margin: 20px 0;">
              <p style="font-size: 13px; color: rgb(22,92,71); font-weight: 600; margin: 0 0 4px;">Ton groupe</p>
              <p style="font-size: 15px; color: #111; margin: 0; font-weight: 500;">${groupeInfo}</p>
            </div>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/plateforme/planning" style="display: inline-block; background: rgb(22,92,71); color: white; padding: 12px 24px; border-radius: 100px; text-decoration: none; font-size: 14px; font-weight: 600;">Voir mon planning →</a>
            <p style="font-size: 13px; color: rgba(0,0,0,0.4); margin-top: 24px;">L'équipe Crea'Star</p>
          </div>
        </div>
      `,
    });

    // Marquer planning comme envoyé
    await supabase
      .from("groupe_eleves")
      .update({ planning_envoye: true, planning_envoye_at: new Date().toISOString() })
      .eq("eleve_id",
        ((await supabase.from("foyers").select("eleves(id)").eq("user_id", existingUser.id).single())
          .data?.eleves as any[])?.[0]?.id
      )
      .eq("groupe_id", candidature.groupe_id);

    return NextResponse.json({ success: true, action: "envoyer_planning" });
  }

  // ── ACTION : PROPOSER UNE PLACE ──────────────────────────────────────────
  if (action === "proposer_place") {
    const delaiJours = body.delaiJours ?? 5;
    const expireAt = new Date(Date.now() + delaiJours * 24 * 60 * 60 * 1000).toISOString();

    await supabaseAdmin
      .from("candidatures")
      .update({
        statut: "place_proposee",
        place_proposee_at: new Date().toISOString(),
        place_expire_at: expireAt,
      })
      .eq("id", id);

    const parcoursLabel = PARCOURS_LABELS[candidature.parcours] ?? candidature.parcours;

    await sendEmail({
      from: process.env.RESEND_FROM_EMAIL!,
      to: candidature.email,
      subject: `Une place est disponible pour toi chez Crea'Star ! 🎉`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: rgb(22,92,71); padding: 32px; border-radius: 16px 16px 0 0;">
            <h1 style="color: white; font-size: 22px; margin: 0;">Une place t'attend ! 🎉</h1>
          </div>
          <div style="background: white; padding: 32px; border: 1px solid rgba(0,0,0,0.06); border-radius: 0 0 16px 16px;">
            <p style="font-size: 15px; color: #111; line-height: 1.7;">Bonjour ${candidature.prenom},</p>
            <p style="font-size: 14px; color: rgba(0,0,0,0.6); line-height: 1.7;">
              Une place vient de se libérer dans le parcours <strong>${parcoursLabel}</strong>.
              Tu as <strong style="color: rgb(22,92,71);">${delaiJours} jours</strong> pour confirmer ton inscription.
            </p>
            <div style="background: rgb(254,243,199); border-radius: 12px; padding: 16px; margin: 20px 0;">
              <p style="font-size: 13px; color: rgb(146,64,14); margin: 0;">
                ⚠️ <strong>Attention :</strong> Si tu ne t'inscris pas avant le
                ${new Date(expireAt).toLocaleDateString("fr-BE", { day: "numeric", month: "long" })},
                la place sera proposée au prochain candidat sur liste d'attente.
              </p>
            </div>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/plateforme/dashboard"
              style="display: inline-block; background: rgb(22,92,71); color: white; padding: 14px 28px; border-radius: 100px; text-decoration: none; font-size: 14px; font-weight: 600;">
              Confirmer mon inscription →
            </a>
          </div>
        </div>
      `,
    });

    if (existingUser) {
      await sendNotification(supabase, existingUser.id, "systeme",
        "Une place est disponible ! 🎉",
        `Une place se libère dans le parcours ${parcoursLabel}. Tu as ${delaiJours} jours pour t'inscrire avant qu'elle soit proposée au suivant.`,
        "/plateforme/dashboard"
      );
    }

    return NextResponse.json({ success: true, action: "proposer_place" });
  }

  // ── ACTION : NOTES INTERNES ───────────────────────────────────────────────
  if (action === "notes_internes") {
    if (!body.notes?.trim()) {
      return NextResponse.json({ error: "Note vide" }, { status: 400 });
    }

    const { error: noteError } = await supabase
      .from("notes_direction")
      .insert({
        candidature_id: id,
        auteur_id: user.id,
        contenu: body.notes.trim(),
      });

    if (noteError) {
      return NextResponse.json({ error: noteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, action: "notes_internes" });
  }

  // ── ACTION : SUPPRIMER NOTE ────────────────────────────────────────────────
  if (action === "supprimer_note") {
    await supabase
      .from("notes_direction")
      .delete()
      .eq("id", body.noteId)
      .eq("auteur_id", user.id); // sécurité : seulement l'auteur

    return NextResponse.json({ success: true, action: "supprimer_note" });
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}