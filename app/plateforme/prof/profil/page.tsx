// // app/plateforme/prof/profil/page.tsx
// import { createClient } from "@/lib/plateforme/supabase/server";
// import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
// import { redirect } from "next/navigation";
// import DuoTrioToggle from "@/app/components/plateforme/prof/DuoTrioToggle";
// import ProfilDocuments from "@/app/components/plateforme/prof/ProfilDocuments";

// export default async function ProfProfilPage() {
//   const supabase = await createClient();
//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) redirect("/plateforme/login");

//   const { data: profile } = await supabase
//     .from("profiles")
//     .select("prenom, nom, telephone, photo_url")
//     .eq("id", user.id)
//     .single();

//   const { data: prof } = await supabaseAdmin
//     .from("profs")
//     .select("bio, tarif_horaire, disciplines, type_contrat, actif")
//     .eq("user_id", user.id)
//     .maybeSingle();

//   return (
//     <main
//       className="min-h-screen bg-[rgb(239,244,239)] px-6"
//       style={{ paddingTop: "calc(96px + 24px)", paddingBottom: 40 }}
//     >
//       <div className="max-w-2xl mx-auto space-y-4">
//         <div className="mb-4">
//           <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgb(185,151,83)] mb-2">
//             Espace prof
//           </p>
//           <h1 className="text-3xl font-semibold tracking-tight text-black mb-1">
//             Mon profil
//           </h1>
//           <p className="text-sm text-black/50">
//             Les informations générales sont gérées par la direction. Contacte-la pour toute modification.
//           </p>
//         </div>

//         {/* Infos en lecture */}
//         <div className="rounded-[20px] border border-black/6 bg-white overflow-hidden"
//           style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
//           <div className="px-6 py-4 border-b border-black/5">
//             <p className="text-sm font-semibold text-black">Informations</p>
//           </div>
//           <div className="divide-y divide-black/5">
//             {[
//               { label: "Prénom / Nom", value: `${profile?.prenom ?? ""} ${profile?.nom ?? ""}` },
//               { label: "Téléphone", value: profile?.telephone || "—" },
//               { label: "Bio", value: prof?.bio || "—" },
//               { label: "Tarif horaire de référence", value: prof?.tarif_horaire ? `${prof.tarif_horaire} €/h` : "—" },
//               { label: "Disciplines", value: prof?.disciplines?.join(", ") || "—" },
//             ].map((row) => (
//               <div key={row.label} className="px-6 py-3.5 flex items-center justify-between gap-4">
//                 <p className="text-sm text-black/45 flex-shrink-0">{row.label}</p>
//                 <p className="text-sm font-semibold text-black text-right">{row.value}</p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Préférences que le prof gère lui-même */}
//         <DuoTrioToggle />

//         {/* Documents partagés par la direction */}
//         <ProfilDocuments />
//       </div>
//     </main>
//   );
// }

// app/plateforme/prof/profil/page.tsx
import { createClient } from "@/lib/plateforme/supabase/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { redirect } from "next/navigation";
import DuoTrioToggle from "@/app/components/plateforme/prof/DuoTrioToggle";
import ProfilDocuments from "@/app/components/plateforme/prof/ProfilDocuments";

export default async function ProfProfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/plateforme/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("prenom, nom, telephone, photo_url")
    .eq("id", user.id)
    .single();

  const { data: prof } = await supabaseAdmin
    .from("profs")
    .select("bio, tarif_horaire, disciplines, type_contrat, actif")
    .eq("user_id", user.id)
    .maybeSingle();

  const typeContratLabel = prof?.type_contrat === "salarie"
    ? "Professeur salarié"
    : prof?.type_contrat === "independant"
      ? "Professeur indépendant"
      : prof?.type_contrat === "mixte"
        ? "Salarié & indépendant"
        : "Professeur";

  return (
    <main className="min-h-screen bg-[rgb(239,244,239)] px-10 lg:px-14"
      style={{ paddingTop: "calc(96px + 24px)", paddingBottom: 40 }}>

      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgb(185,151,83)] mb-2">
          Espace prof
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-black mb-1">
          Mon profil
        </h1>
        <p className="text-sm text-black/50">
          Les informations générales sont gérées par la direction — contacte-la pour toute modification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">

        {/* ── Colonne gauche : identité + préférences ── */}
        <aside className="space-y-4 lg:sticky lg:top-[calc(96px+24px)] lg:self-start">

          {/* Carte identité */}
          <div className="rounded-[20px] border border-black/6 bg-white p-6 text-center"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 overflow-hidden"
              style={{ background: "rgba(22,92,71,0.12)", color: "rgb(22,92,71)" }}>
              {profile?.photo_url
                ? <img src={profile.photo_url} className="w-full h-full object-cover" alt="" />
                : `${profile?.prenom?.[0] ?? ""}${profile?.nom?.[0] ?? ""}`}
            </div>
            <h2 className="text-lg font-semibold text-black">{profile?.prenom} {profile?.nom}</h2>
            <p className="text-xs text-black/40 mt-0.5">{profile?.telephone || "Pas de téléphone"}</p>

            <div className="flex items-center justify-center gap-1.5 mt-3">
              <span className={`w-1.5 h-1.5 rounded-full ${prof?.actif ? "bg-emerald-500" : "bg-black/20"}`} />
              <span className="text-xs font-medium text-black/50">{typeContratLabel}</span>
            </div>

            {prof?.disciplines?.length ? (
              <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                {prof.disciplines.map((d: string) => (
                  <span key={d} className="rounded-full px-2.5 py-1 text-[10px] font-medium"
                    style={{ background: "rgba(22,92,71,0.08)", color: "rgb(22,92,71)" }}>
                    {d}
                  </span>
                ))}
              </div>
            ) : null}

            {prof?.bio && (
              <p className="text-xs text-black/45 leading-5 mt-4 text-left">
                {prof.bio}
              </p>
            )}
          </div>

          {/* Tarif horaire */}
          <div className="rounded-[20px] border border-black/6 bg-white px-5 py-4 flex items-center justify-between"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <span className="text-xs text-black/45">Tarif horaire de référence</span>
            <span className="text-sm font-semibold text-black">
              {prof?.tarif_horaire ? `${prof.tarif_horaire} €/h` : "—"}
            </span>
          </div>

          {/* Préférences duo/trio */}
          <DuoTrioToggle />
        </aside>

        {/* ── Colonne droite : documents ── */}
        <div className="min-w-0">
          <ProfilDocuments />
        </div>
      </div>
    </main>
  );
}