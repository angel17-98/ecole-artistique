// app/api/direction/create-prof/route.ts
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // ── 1. Vérifier que c'est bien la direction ───────────────────────────────
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

  // ── 2. Données du formulaire ──────────────────────────────────────────────
  const { prenom, nom, email, telephone, typeContrat, disciplines } = await req.json();

  if (!prenom || !nom || !email || !typeContrat || !disciplines?.length) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const role = typeContrat === "independant" ? "prof_independant" : "prof_salarie";

  // ── 3. Vérifier si l'email existe déjà ───────────────────────────────────
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  const existingAuthUser = existingUsers?.users?.find(u => u.email === email);

  if (existingAuthUser) {
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, role")
      .eq("id", existingAuthUser.id)
      .maybeSingle();

    if (existingProfile && existingProfile.role !== "eleve") {
      return NextResponse.json(
        { error: `Un compte existe déjà pour ${email} (rôle : ${existingProfile.role})` },
        { status: 409 }
      );
    }
  }

  // ── 4. Créer le compte Auth ───────────────────────────────────────────────
  // Le trigger handle_new_user va automatiquement créer profiles(id, role='eleve')
  // On fera ensuite un UPDATE pour corriger le rôle et ajouter les infos
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { prenom, nom },
  });

  if (authError || !authData.user) {
    console.error("Erreur création Auth:", authError);
    return NextResponse.json(
      { error: authError?.message || "Erreur création compte" },
      { status: 500 }
    );
  }

  const newUserId = authData.user.id;

  // ── 5. UPDATE profiles (le trigger a déjà fait l'INSERT avec role='eleve') ─
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({
      role,
      prenom,
      nom,
      telephone: telephone || null,
      is_active: true,
    })
    .eq("id", newUserId);

  if (profileError) {
    console.error("Erreur profiles update:", profileError);
    await supabaseAdmin.auth.admin.deleteUser(newUserId);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // ── 6. Insérer dans profs ─────────────────────────────────────────────────
  const { error: profError } = await supabaseAdmin
    .from("profs")
    .insert({
      user_id: newUserId,
      type_contrat: typeContrat,
      disciplines,
      actif: true,
    });

  if (profError) {
    console.error("Erreur profs:", profError);
    await supabaseAdmin.auth.admin.deleteUser(newUserId);
    return NextResponse.json({ error: profError.message }, { status: 500 });
  }

  // ── 7. Générer lien reset password + envoyer email ────────────────────────
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/plateforme/prof`,
    },
  });

  if (linkError || !linkData?.properties?.action_link) {
    console.error("Erreur génération lien:", linkError);
    return NextResponse.json({ success: true, emailEnvoye: false });
  }

  const actionLink = linkData.properties.action_link;

  const emailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: "Bienvenue chez Crea'Star — Crée ton mot de passe",
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
          <div style="background: rgb(12,50,38); padding: 24px 28px; border-radius: 12px 12px 0 0;">
            <p style="color: rgba(255,255,255,0.5); font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 6px;">
              Crea'Star · Plateforme
            </p>
            <h1 style="color: white; font-size: 20px; margin: 0; font-weight: 600;">
              Bienvenue, ${prenom} 👋
            </h1>
          </div>
          <div style="background: white; padding: 24px 28px; border: 1px solid rgba(0,0,0,0.07); border-radius: 0 0 12px 12px;">
            <p style="font-size: 14px; line-height: 1.7; color: rgba(0,0,0,0.65);">
              Ton compte professeur Crea'Star vient d'être créé par la direction.
              Clique sur le bouton ci-dessous pour définir ton mot de passe et accéder à ton espace.
            </p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${actionLink}"
                style="background: rgb(22,92,71); color: white; padding: 14px 32px;
                       border-radius: 100px; text-decoration: none; font-size: 14px;
                       font-weight: 600; display: inline-block;">
                Accéder à mon espace →
              </a>
            </div>
            <p style="font-size: 12px; color: rgba(0,0,0,0.35); line-height: 1.6;">
              Ce lien est valable 24 heures. Contacte la direction si tu as besoin d'un nouveau lien.
            </p>
            <hr style="border: none; border-top: 1px solid rgba(0,0,0,0.07); margin: 20px 0;" />
            <table style="font-size: 13px; color: rgba(0,0,0,0.5); width: 100%;">
              <tr>
                <td style="padding: 4px 0; width: 120px;">Rôle</td>
                <td style="padding: 4px 0; font-weight: 500; color: #111;">
                  ${typeContrat === "independant" ? "Professeur indépendant" : "Professeur salarié"}
                </td>
              </tr>
              <tr>
                <td style="padding: 4px 0;">Disciplines</td>
                <td style="padding: 4px 0; font-weight: 500; color: #111;">${disciplines.join(", ")}</td>
              </tr>
            </table>
          </div>
        </div>
      `,
    }),
  });

  if (!emailRes.ok) {
    console.error("Erreur envoi email:", await emailRes.text());
    return NextResponse.json({ success: true, emailEnvoye: false });
  }

  return NextResponse.json({ success: true, emailEnvoye: true });
}