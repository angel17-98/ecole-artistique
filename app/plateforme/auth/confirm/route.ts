// import { createServerClient } from "@supabase/ssr";
// import { cookies } from "next/headers";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(request: NextRequest) {
//   const { searchParams } = new URL(request.url);
//   const token_hash = searchParams.get("token_hash");
//   const type = searchParams.get("type");

//   if (token_hash && type) {
//     const cookieStore = await cookies();
//     const supabase = createServerClient(
//       process.env.NEXT_PUBLIC_PLATEFORME_URL!,
//       process.env.NEXT_PUBLIC_PLATEFORME_ANON_KEY!,
//       {
//         cookies: {
//           getAll() { return cookieStore.getAll(); },
//           setAll(cookiesToSet) {
//             cookiesToSet.forEach(({ name, value, options }) =>
//               cookieStore.set(name, value, options)
//             );
//           },
//         },
//       }
//     );

//     const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as any });

//     if (!error) {
//       // Confirmation réussie → dashboard
//       return NextResponse.redirect(new URL("/plateforme/login?confirmed=true", request.url));
//     }
//   }

//   // Erreur → login avec message
//   return NextResponse.redirect(
//     new URL("/plateforme/login?error=confirmation_invalide", request.url)
//   );
// }

// app/plateforme/auth/confirm/route.ts
// Ouvre la session à partir d'un lien reçu par mail (confirmation de compte ou
// lien de connexion sans mot de passe).
// 18/11/2026 : ajout du paramètre « next » → après connexion, on va directement
// à la page demandée (ex. le dossier de candidature). Sans « next », le
// comportement d'avant est conservé (retour à la page de connexion).

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/** N'accepte que des adresses internes au site (« /… »), jamais « //autre-site » */
function cheminSur(next: string | null): string | null {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = cheminSur(searchParams.get("next"));

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
      return NextResponse.redirect(new URL(next ?? "/plateforme/login?confirmed=true", request.url));
    }
  }

  // Lien expiré ou déjà utilisé
  if (next) {
    return NextResponse.redirect(
      new URL(`/connexion?expire=1&next=${encodeURIComponent(next)}`, request.url)
    );
  }
  return NextResponse.redirect(
    new URL("/plateforme/login?error=confirmation_invalide", request.url)
  );
}