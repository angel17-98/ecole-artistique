// app/api/direction/candidatures/[id]/route.ts
// FIX A : statut "acceptee" supprimé — action "accepter" pose uniquement "validee"
// FIX B : "proposer_place" envoie un email différent si le candidat n'a pas encore de compte
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(params: Parameters<typeof resend.emails.send>[0]) {
  try {
    const result = await resend.emails.send(params);
    if (result.error) console.error("Resend error:", result.error);
    return result;
  } catch (err) {
    console.error("sendEmail exception:", err);
  }
}

const PARCOURS_LABELS: Record<string, string> = {
  "full-artist":      "Full Artist",
  "comedie-musicale": "Comédie musicale",
  "eveil-musical":    "Éveil musical",
};

async function sendNotification(
  supabase: any, userId: string, type: string,
  titre: string, contenu: string, lien?: string
) {
  await supabase.from("notifications").insert({
    user_id: userId, type, titre, contenu, lu: false, lien,
  });
}

async function logAction(
  candidatureId: string,
  auteurId: string | null,
  type: "action" | "email" | "systeme" | "note",
  contenu: string
) {
  try {
    await supabaseAdmin.from("notes_direction").insert({
      candidature_id: candidatureId,
      auteur_id: auteurId,
      type,
      contenu,
    });
  } catch (err) {
    console.error("logAction error:", err);
  }
}

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "direction")
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { data: candidature } = await supabaseAdmin
    .from("candidatures").select("*").eq("id", id).single();
  if (!candidature)
    return NextResponse.json({ error: "Candidature introuvable" }, { status: 404 });

  const { data: existingProfile } = await supabaseAdmin
    .from("profiles").select("id, prenom, nom, role")
    .eq("id",
      (await supabaseAdmin.auth.admin.listUsers()).data.users
        .find(u => u.email === candidature.email)?.id ?? ""
    ).maybeSingle();

  return NextResponse.json({ candidature, hasAccount: !!existingProfile });
}

// ── PATCH ─────────────────────────────────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { data: directionProfile } = await supabase
    .from("profiles").select("role, prenom, nom").eq("id", user.id).single();
  if (directionProfile?.role !== "direction")
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const body = await req.json();
  const { action, emailObjet, emailContenu, groupeId } = body;

  const { data: candidature } = await supabaseAdmin
    .from("candidatures").select("*").eq("id", id).single();
  if (!candidature)
    return NextResponse.json({ error: "Candidature introuvable" }, { status: 404 });

  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = users.find(u => u.email === candidature.email);
  const parcoursLabel = PARCOURS_LABELS[candidature.parcours] ?? candidature.parcours;
  const auteurNom = `${directionProfile.prenom} ${directionProfile.nom}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;

  // ── ACTION : ACCEPTER ─────────────────────────────────────────────────────
  if (action === "accepter") {
    // FIX A : uniquement "validee", jamais "acceptee"
    await supabaseAdmin.from("candidatures").update({
      statut: "validee",
      traite_par: user.id,
      traite_at: new Date().toISOString(),
    }).eq("id", id);

    const registerUrl = `${siteUrl}/plateforme/register?email=${encodeURIComponent(candidature.email)}&source=candidature`;

    if (existingUser) {
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
              <p style="font-size: 15px; color: #111; line-height: 1.7;">
                Ta candidature pour le parcours <strong>${parcoursLabel}</strong> a été
                <strong style="color: rgb(22,92,71);">retenue</strong> par la direction de Crea'Star.
              </p>
              <p style="font-size: 14px; color: rgba(0,0,0,0.6); line-height: 1.7;">
                Tu seras assigné(e) à un groupe très prochainement. On te contactera dès qu'une place est disponible.
              </p>
              <a href="${siteUrl}/plateforme/dashboard"
                style="display: inline-block; background: rgb(22,92,71); color: white; padding: 12px 24px; border-radius: 100px; text-decoration: none; font-size: 14px; font-weight: 600; margin-top: 12px;">
                Voir mon espace →
              </a>
              <p style="font-size: 13px; color: rgba(0,0,0,0.4); margin-top: 24px;">L'équipe Crea'Star</p>
            </div>
          </div>
        `,
      });

      await sendNotification(supabase, existingUser.id, "systeme",
        "Candidature retenue ! 🎉",
        `Ton profil pour le parcours ${parcoursLabel} a été retenu. On te contactera dès qu'une place est disponible.`,
        "/plateforme/dashboard");
      await logAction(id, user.id, "systeme", "📱 Notification in-app envoyée au candidat");

    } else {
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
              <p style="font-size: 15px; color: #111; line-height: 1.7;">
                Ta candidature pour le parcours <strong>${parcoursLabel}</strong> a été
                <strong style="color: rgb(22,92,71);">retenue</strong> par la direction de Crea'Star.
              </p>
              <p style="font-size: 14px; color: rgba(0,0,0,0.6); line-height: 1.7;">
                Tu seras assigné(e) à un groupe très prochainement. On te contactera dès qu'une place est disponible.
              </p>
              <div style="background: rgb(239,244,239); border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid rgba(22,92,71,0.15);">
                <p style="font-size: 13px; font-weight: 600; color: rgb(22,92,71); margin: 0 0 8px;">
                  📱 Crée ton espace pour suivre ta candidature
                </p>
                <p style="font-size: 13px; color: rgba(0,0,0,0.6); margin: 0 0 14px; line-height: 1.6;">
                  Ton espace personnel te permettra de suivre l'avancement de ta candidature,
                  recevoir les notifications importantes et confirmer ta place dès qu'elle est disponible.
                </p>
                <a href="${registerUrl}"
                  style="display: inline-block; background: rgb(22,92,71); color: white; padding: 12px 24px; border-radius: 100px; text-decoration: none; font-size: 13px; font-weight: 600;">
                  Créer mon espace →
                </a>
                <p style="font-size: 12px; color: rgba(0,0,0,0.4); margin: 10px 0 0;">
                  Tu préfères attendre par email ? Pas de problème, on te tient au courant quoi qu'il arrive.
                </p>
              </div>
              <p style="font-size: 13px; color: rgba(0,0,0,0.4);">L'équipe Crea'Star</p>
            </div>
          </div>
        `,
      });
    }

    await logAction(id, user.id, "action", `✅ Candidature marquée acceptable par ${auteurNom}`);
    return NextResponse.json({ success: true, action: "accepter" });
  }

  // ── ACTION : REFUSER ──────────────────────────────────────────────────────
  if (action === "refuser") {
    await supabaseAdmin.from("candidatures").update({
      statut: "refusee",
      traite_par: user.id,
      traite_at: new Date().toISOString(),
    }).eq("id", id);

    await sendEmail({
      from: process.env.RESEND_FROM_EMAIL!,
      to: candidature.email,
      subject: `Ta candidature Crea'Star`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: rgb(60,60,60); padding: 32px; border-radius: 16px 16px 0 0;">
            <p style="color: rgba(255,255,255,0.6); font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; margin: 0 0 8px;">Crea'Star</p>
            <h1 style="color: white; font-size: 22px; margin: 0; font-weight: 600;">Bonjour ${candidature.prenom}</h1>
          </div>
          <div style="background: white; padding: 32px; border: 1px solid rgba(0,0,0,0.06); border-radius: 0 0 16px 16px;">
            <p style="font-size: 15px; color: #111; line-height: 1.7;">
              Après examen attentif de ton dossier, nous ne sommes pas en mesure de te proposer
              une place dans le parcours <strong>${parcoursLabel}</strong> pour cette session.
            </p>
            <p style="font-size: 14px; color: rgba(0,0,0,0.6); line-height: 1.7;">
              Cette décision ne remet pas en cause ta valeur ou ton talent — les places sont limitées
              et le choix est difficile. Tu peux repostuler lors d'une prochaine ouverture.
            </p>
            <a href="${siteUrl}/candidature"
              style="display: inline-block; background: rgb(22,92,71); color: white; padding: 12px 24px; border-radius: 100px; text-decoration: none; font-size: 14px; font-weight: 600; margin-top: 12px;">
              Repostuler →
            </a>
            <p style="font-size: 13px; color: rgba(0,0,0,0.4); margin-top: 24px;">L'équipe Crea'Star</p>
          </div>
        </div>
      `,
    });

    await logAction(id, user.id, "action", `❌ Candidature refusée par ${auteurNom}`);

    if (existingUser) {
      await sendNotification(supabase, existingUser.id, "systeme",
        "Résultat de ta candidature",
        `Ta candidature pour le parcours ${parcoursLabel} n'a pas été retenue pour cette session.`,
        "/plateforme/dashboard");
    }

    return NextResponse.json({ success: true, action: "refuser" });
  }

  // ── ACTION : LISTE D'ATTENTE ───────────────────────────────────────────────
  if (action === "liste_attente") {
    await supabaseAdmin.from("candidatures").update({
      statut: "liste_attente",
    }).eq("id", id);

    await sendEmail({
      from: process.env.RESEND_FROM_EMAIL!,
      to: candidature.email,
      subject: `Ta candidature Crea'Star — Liste d'attente`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: rgb(24,95,165); padding: 32px; border-radius: 16px 16px 0 0;">
            <p style="color: rgba(255,255,255,0.6); font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; margin: 0 0 8px;">Crea'Star</p>
            <h1 style="color: white; font-size: 22px; margin: 0; font-weight: 600;">Tu es sur liste d'attente 🕐</h1>
          </div>
          <div style="background: white; padding: 32px; border: 1px solid rgba(0,0,0,0.06); border-radius: 0 0 16px 16px;">
            <p style="font-size: 15px; color: #111; line-height: 1.7;">Bonjour ${candidature.prenom},</p>
            <p style="font-size: 14px; color: rgba(0,0,0,0.6); line-height: 1.7;">
              Ton profil pour le parcours <strong>${parcoursLabel}</strong> a retenu notre attention,
              mais nous ne disposons pas de place disponible pour le moment.
              Tu es placé(e) en liste d'attente prioritaire.
            </p>
            <p style="font-size: 14px; color: rgba(0,0,0,0.6); line-height: 1.7;">
              Tu seras contacté(e) en priorité dès qu'une place se libère ou qu'un nouveau groupe est ouvert.
            </p>
            <p style="font-size: 13px; color: rgba(0,0,0,0.4); margin-top: 24px;">L'équipe Crea'Star</p>
          </div>
        </div>
      `,
    });

    await logAction(id, user.id, "action", `🕐 Mis en liste d'attente par ${auteurNom}`);

    if (existingUser) {
      await sendNotification(supabase, existingUser.id, "systeme",
        "Liste d'attente",
        `Ta candidature pour le parcours ${parcoursLabel} est en liste d'attente.`,
        "/plateforme/dashboard");
      await logAction(id, user.id, "systeme", "📱 Notification in-app envoyée au candidat");
    }

    return NextResponse.json({ success: true, action: "liste_attente" });
  }

  // ── ACTION : INFO COMPLÉMENTAIRE ──────────────────────────────────────────
  if (action === "info_complementaire") {
    if (!emailObjet || !emailContenu)
      return NextResponse.json({ error: "Objet et contenu requis" }, { status: 400 });

    await supabaseAdmin.from("candidatures").update({
      statut: "info_complementaire",
    }).eq("id", id);

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
            <p style="font-size: 13px; color: rgba(0,0,0,0.4);">
              Tu peux répondre directement à cet email.<br/>L'équipe Crea'Star
            </p>
          </div>
        </div>
      `,
    });

    await supabaseAdmin.from("notes_direction").insert({
      candidature_id: id,
      auteur_id: user.id,
      type: "email",
      contenu: `📧 EMAIL ENVOYÉ\n\nObjet : ${emailObjet}\n\n${emailContenu}`,
    });

    await logAction(id, user.id, "action", `📬 Demande d'info envoyée par ${auteurNom}`);

    if (existingUser) {
      await sendNotification(supabase, existingUser.id, "systeme",
        "Information demandée pour ta candidature",
        `La direction de Crea'Star t'a envoyé un email concernant ta candidature. Vérifie ta boîte mail.`,
        "/plateforme/dashboard");
      await logAction(id, user.id, "systeme", "📱 Notification in-app envoyée au candidat");
    }

    return NextResponse.json({ success: true, action: "info_complementaire" });
  }

  // ── ACTION : PROPOSER UNE PLACE ───────────────────────────────────────────
  if (action === "proposer_place") {
    const delaiJours = body.delaiJours ?? 5;
    const expireAt = new Date(Date.now() + delaiJours * 24 * 60 * 60 * 1000).toISOString();

    await supabaseAdmin.from("candidatures").update({
      statut: "place_proposee",
      place_proposee_at: new Date().toISOString(),
      place_expire_at: expireAt,
    }).eq("id", id);

    const expireLabel = new Date(expireAt).toLocaleDateString("fr-BE", {
      day: "numeric", month: "long",
    });

    // ── FIX B : email bifurqué selon si le candidat a un compte ou non ────────
    if (existingUser) {
      // ── Candidat AVEC compte → email standard + notification in-app ──────
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
                  ⚠️ <strong>Attention :</strong> Si tu ne t'inscris pas avant le ${expireLabel},
                  la place sera proposée au prochain candidat sur liste d'attente.
                </p>
              </div>
              <a href="${siteUrl}/plateforme/dashboard"
                style="display: inline-block; background: rgb(22,92,71); color: white; padding: 14px 28px; border-radius: 100px; text-decoration: none; font-size: 14px; font-weight: 600;">
                Confirmer mon inscription →
              </a>
              <p style="font-size: 13px; color: rgba(0,0,0,0.4); margin-top: 24px;">L'équipe Crea'Star</p>
            </div>
          </div>
        `,
      });

      await sendNotification(supabase, existingUser.id, "systeme",
        "Une place est disponible ! 🎉",
        `Une place se libère dans le parcours ${parcoursLabel}. Tu as ${delaiJours} jours pour t'inscrire.`,
        "/plateforme/dashboard");
      await logAction(id, user.id, "systeme", "📱 Notification in-app envoyée au candidat");

    } else {
      // ── FIX B : Candidat SANS compte → email urgent avec CTA création ──────
      // Pas de notification in-app possible → l'email doit tout porter
      const registerUrl = `${siteUrl}/plateforme/register`
        + `?email=${encodeURIComponent(candidature.email)}&source=place_proposee`;

      await sendEmail({
        from: process.env.RESEND_FROM_EMAIL!,
        to: candidature.email,
        subject: `⚠️ Action requise — Une place t'attend chez Crea'Star (${delaiJours} jours)`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: rgb(146,64,14); padding: 32px; border-radius: 16px 16px 0 0;">
              <p style="color: rgba(255,255,255,0.7); font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 8px;">
                Action requise · Place disponible
              </p>
              <h1 style="color: white; font-size: 22px; margin: 0; font-weight: 600;">
                ${candidature.prenom}, une place t'attend !
              </h1>
            </div>
            <div style="background: white; padding: 32px; border: 1px solid rgba(0,0,0,0.06); border-radius: 0 0 16px 16px;">
              <p style="font-size: 15px; color: #111; line-height: 1.7;">
                Une place vient de se libérer dans le parcours
                <strong style="color: rgb(22,92,71);">${parcoursLabel}</strong>.
              </p>
              <div style="background: rgb(254,243,199); border-radius: 12px; padding: 18px; margin: 20px 0; border: 1px solid rgba(220,120,0,0.2);">
                <p style="font-size: 14px; color: rgb(146,64,14); margin: 0; font-weight: 600;">
                  ⚠️ Tu as ${delaiJours} jours pour confirmer — avant le ${expireLabel}
                </p>
                <p style="font-size: 13px; color: rgba(0,0,0,0.55); margin: 6px 0 0;">
                  Passé ce délai, la place sera automatiquement proposée au prochain candidat.
                </p>
              </div>
              <div style="background: rgb(239,244,239); border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid rgba(22,92,71,0.15);">
                <p style="font-size: 14px; font-weight: 600; color: rgb(22,92,71); margin: 0 0 8px;">
                  Étape 1 — Crée ton espace (2 minutes)
                </p>
                <p style="font-size: 13px; color: rgba(0,0,0,0.6); margin: 0 0 14px; line-height: 1.6;">
                  Ton espace est nécessaire pour confirmer ta place et finaliser ton inscription.
                </p>
                <a href="${registerUrl}"
                  style="display: inline-block; background: rgb(22,92,71); color: white; padding: 12px 24px;
                         border-radius: 100px; text-decoration: none; font-size: 14px; font-weight: 600;">
                  Créer mon espace maintenant →
                </a>
              </div>
              <p style="font-size: 13px; color: rgba(0,0,0,0.45); line-height: 1.6;">
                Une fois ton compte créé, ta candidature sera automatiquement liée et tu pourras
                confirmer ta place directement depuis ton tableau de bord.
              </p>
              <p style="font-size: 13px; color: rgba(0,0,0,0.4); margin-top: 24px;">L'équipe Crea'Star</p>
            </div>
          </div>
        `,
      });

      await logAction(id, user.id, "systeme",
        `📧 Email "place proposée" envoyé au candidat sans compte (${candidature.email})`);
    }

    await logAction(id, user.id, "action",
      `🎯 Place proposée par ${auteurNom} — délai ${delaiJours}j (expire le ${expireLabel})`);

    return NextResponse.json({ success: true, action: "proposer_place" });
  }

  // ── ACTION : ASSIGNER GROUPE ──────────────────────────────────────────────
  if (action === "assigner_groupe") {
    if (!groupeId)
      return NextResponse.json({ error: "groupeId requis" }, { status: 400 });

    await supabaseAdmin.from("candidatures").update({
      groupe_inscription_id: groupeId,
    }).eq("id", id);

    const { data: groupe } = await supabaseAdmin
      .from("groupes_inscription").select("nom").eq("id", groupeId).single();

    await logAction(id, user.id, "action",
      `👥 Assigné au groupe "${groupe?.nom ?? groupeId}" par ${auteurNom}`);

    return NextResponse.json({ success: true, action: "assigner_groupe" });
  }

  // ── ACTION : NOTES INTERNES ───────────────────────────────────────────────
  if (action === "notes_internes") {
    const { notes } = body;
    if (!notes?.trim())
      return NextResponse.json({ error: "Note vide" }, { status: 400 });

    await supabaseAdmin.from("notes_direction").insert({
      candidature_id: id,
      auteur_id: user.id,
      type: "note",
      contenu: notes.trim(),
    });

    return NextResponse.json({ success: true, action: "notes_internes" });
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}