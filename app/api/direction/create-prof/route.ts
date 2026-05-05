// app/api/direction/create-prof/route.ts
import { createClient } from "@/lib/plateforme/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
  // Client admin — uniquement côté serveur, jamais exposé au frontend
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Vérifier que c'est bien la direction qui appelle
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

  // 2. Récupérer les données du formulaire
  const { prenom, nom, email, telephone, typeContrat, disciplines } = await req.json();

  if (!prenom || !nom || !email || !typeContrat || !disciplines?.length) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const role = typeContrat === "independant" ? "prof_independant" : "prof_salarie";

  // 3. Créer le compte Supabase Auth + envoyer l'email de bienvenue
  // generateLink crée un lien magique — le prof choisit lui-même son mot de passe
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/plateforme/login`,
    },
  });

  if (authError || !authData.user) {
    return NextResponse.json(
      { error: authError?.message || "Erreur création compte" },
      { status: 500 }
    );
  }

  const newUserId = authData.user.id;

  // 4. Insérer dans profiles
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .insert({
      id: newUserId,
      role,
      prenom,
      nom,
      telephone: telephone || null,
      is_active: true,
    });

  if (profileError) {
    // Nettoyer le compte Auth si profiles échoue
    await supabaseAdmin.auth.admin.deleteUser(newUserId);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // 5. Insérer dans profs
  const { error: profError } = await supabaseAdmin
    .from("profs")
    .insert({
      user_id: newUserId,
      type_contrat: typeContrat,
      disciplines,
      actif: true,
    });

  if (profError) {
    await supabaseAdmin.auth.admin.deleteUser(newUserId);
    return NextResponse.json({ error: profError.message }, { status: 500 });
  }

  // 6. Envoyer l'email de bienvenue avec le lien magique via Resend
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Crea'Star <no-reply@creastar.be>",
      to: email,
      subject: "Bienvenue chez Crea'Star — Accède à ton espace",
      html: `
        <p>Bonjour ${prenom},</p>
        <p>Ton compte prof Crea'Star vient d'être créé.</p>
        <p>Clique sur le lien ci-dessous pour accéder à ton espace et définir ton mot de passe :</p>
        <p><a href="${authData.properties?.action_link}" style="background:#165c47;color:white;padding:12px 24px;border-radius:24px;text-decoration:none;display:inline-block;">
          Accéder à mon espace →
        </a></p>
        <p>Ce lien est valable 24 heures.</p>
        <p>À bientôt,<br/>L'équipe Crea'Star</p>
      `,
    }),
  });

  return NextResponse.json({ success: true });
}