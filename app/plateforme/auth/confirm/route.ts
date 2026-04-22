import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (token_hash && type) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_PLATEFORME_URL!,
      process.env.NEXT_PUBLIC_PLATEFORME_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as any });

    if (!error) {
      // Confirmation réussie → dashboard
      return NextResponse.redirect(new URL("/plateforme/login?confirmed=true", request.url));
    }
  }

  // Erreur → login avec message
  return NextResponse.redirect(
    new URL("/plateforme/login?error=confirmation_invalide", request.url)
  );
}