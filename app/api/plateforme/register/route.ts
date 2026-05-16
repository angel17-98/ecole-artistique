// app/api/plateforme/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { userId, telephone, nomFamille, ville, prenomEleve, nomEleve, dateNaissance } =
      await req.json();

    if (!userId || !nomFamille || !prenomEleve || !nomEleve) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    // ── 1. Mettre à jour le profil ────────────────────────────────────────────
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ telephone: telephone || null })
      .eq("id", userId);

    if (profileError) {
      return NextResponse.json({ error: "Erreur profil : " + profileError.message }, { status: 500 });
    }

    // ── 2. Créer le foyer ─────────────────────────────────────────────────────
    const { data: foyerData, error: foyerError } = await supabaseAdmin
      .from("foyers")
      .insert({
        user_id: userId,
        nom_famille: nomFamille,
        telephone: telephone || null,
        ville: ville || null,
      })
      .select("id")
      .single();

    if (foyerError || !foyerData) {
      return NextResponse.json({ error: "Erreur foyer : " + foyerError?.message }, { status: 500 });
    }

    // ── 3. Créer le premier élève ─────────────────────────────────────────────
    const { error: eleveError } = await supabaseAdmin
      .from("eleves")
      .insert({
        foyer_id: foyerData.id,
        prenom: prenomEleve,
        nom: nomEleve,
        date_naissance: dateNaissance || null,
      });

    if (eleveError) {
      return NextResponse.json({ error: "Erreur élève : " + eleveError.message }, { status: 500 });
    }

    // ── 4. Récupérer l'email depuis auth.users pour la notification ───────────
    const { data: { user: authUser } } = await supabaseAdmin.auth.admin.getUserById(userId);
    const email = authUser?.email ?? "";

    // ── 5. Vérifier si une candidature existe pour cet email ──────────────────
    // Si oui → link-candidature s'en occupera via le register client
    // Si non → notifier la direction qu'un nouveau compte existe sans candidature
    const { data: candidatureExistante } = await supabaseAdmin
      .from("candidatures")
      .select("id")
      .eq("email", email)
      .limit(1)
      .maybeSingle();

    if (!candidatureExistante && email) {
      // Nouveau compte sans candidature → la direction doit le savoir
      const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/plateforme/direction`;

      resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: process.env.RESEND_TO_EMAIL!,
        subject: `👤 Nouveau compte créé — ${prenomEleve} ${nomEleve} (sans candidature)`,
        html: `
          <div style="font-family: sans-serif; max-width: 580px; margin: 0 auto; color: #111;">
            <div style="background: rgb(12,50,38); padding: 24px 28px; border-radius: 12px 12px 0 0;">
              <p style="color: rgba(255,255,255,0.6); font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 6px;">Crea'Star · Plateforme</p>
              <h1 style="color: white; font-size: 18px; margin: 0; font-weight: 600;">
                Nouveau compte créé — sans candidature associée
              </h1>
            </div>
            <div style="background: white; padding: 24px 28px; border: 1px solid rgba(0,0,0,0.07); border-radius: 0 0 12px 12px;">
              <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 7px 0; color: rgba(0,0,0,0.45); width: 140px;">Foyer</td>
                  <td style="padding: 7px 0; font-weight: 500;">Famille ${nomFamille}</td>
                </tr>
                <tr>
                  <td style="padding: 7px 0; color: rgba(0,0,0,0.45);">Élève</td>
                  <td style="padding: 7px 0;">${prenomEleve} ${nomEleve}</td>
                </tr>
                ${email ? `
                <tr>
                  <td style="padding: 7px 0; color: rgba(0,0,0,0.45);">Email</td>
                  <td style="padding: 7px 0;"><a href="mailto:${email}" style="color: rgb(22,92,71);">${email}</a></td>
                </tr>` : ""}
                ${ville ? `
                <tr>
                  <td style="padding: 7px 0; color: rgba(0,0,0,0.45);">Ville</td>
                  <td style="padding: 7px 0;">${ville}</td>
                </tr>` : ""}
              </table>

              <div style="background: rgb(255,248,230); border-radius: 10px; padding: 14px 18px; margin-bottom: 20px; border: 1px solid rgba(185,151,83,0.25);">
                <p style="font-size: 13px; color: rgb(120,80,0); margin: 0; line-height: 1.6;">
                  ⚠️ Ce compte n'est lié à aucune candidature. Il peut s'agir d'un parent intéressé
                  par les cours individuels ou la location de salle — ou d'une candidature déposée
                  sous un email différent.
                </p>
              </div>

              <a href="${dashboardUrl}"
                style="display: inline-block; background: rgb(22,92,71); color: white; text-decoration: none; padding: 10px 20px; border-radius: 100px; font-size: 13px; font-weight: 600;">
                Voir le tableau de bord →
              </a>
            </div>
          </div>
        `,
      }).catch(err => console.error("Email direction (register sans candidature) error:", err));
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}