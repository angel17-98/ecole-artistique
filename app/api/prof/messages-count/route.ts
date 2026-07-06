// app/api/prof/messages-count/route.ts
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { data: convs } = await supabaseAdmin
    .from("conversations")
    .select("messages(id, lu_par, sender_id)")
    .contains("participants", [user.id]);

  const messagesNonLus = (convs ?? []).reduce((acc: number, conv: any) => {
    return acc + (conv.messages ?? []).filter(
      (m: any) => !m.lu_par?.includes(user.id) && m.sender_id !== user.id
    ).length;
  }, 0);

  return NextResponse.json({ messagesNonLus });
}