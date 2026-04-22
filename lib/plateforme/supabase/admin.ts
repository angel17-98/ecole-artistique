import { createClient } from "@supabase/supabase-js";

// Client admin — uniquement côté serveur (API routes)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_PLATEFORME_URL!,
  process.env.PLATEFORME_SERVICE_ROLE_KEY!
);