import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json();
    if (!userId || !email) return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });

    // Lier toutes les candidatures sans user_id ayant cet email
    const { error } = await supabaseAdmin
      .from("candidatures")
      .update({ user_id: userId })
      .eq("email", email)
      .is("user_id", null);

    if (error) {
      console.error("Link candidature error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Link candidature error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}