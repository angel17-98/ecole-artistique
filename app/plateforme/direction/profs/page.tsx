// // app/plateforme/direction/profs/page.tsx
// import { createClient } from "@/lib/plateforme/supabase/server";
// import Link from "next/link";

// export default async function DirectionProfsPage() {
//   const supabase = await createClient();

//   // Récupérer tous les profs avec leur profil
//   const { data: profs } = await supabase
//     .from("profs")
//     .select(`
//       id,
//       type_contrat,
//       disciplines,
//       actif,
//       created_at,
//       profile:profiles!profs_user_id_fkey(prenom, nom, telephone, is_active)
//     `)
//     .order("created_at", { ascending: false });

//   return (
//     <main className="min-h-screen bg-[rgb(239,244,239)] px-6 py-10">
//       <div className="max-w-4xl mx-auto">

//         {/* En-tête */}
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgb(185,151,83)] mb-2">
//               Espace direction
//             </p>
//             <h1 className="text-3xl font-semibold tracking-tight text-black">
//               Professeurs
//             </h1>
//             <p className="mt-1 text-sm text-black/50">
//               {profs?.length ?? 0} prof{(profs?.length ?? 0) > 1 ? "s" : ""} enregistré{(profs?.length ?? 0) > 1 ? "s" : ""}
//             </p>
//           </div>
//           <Link
//             href="/plateforme/direction/profs/nouveau"
//             className="inline-flex items-center gap-2 rounded-full bg-[rgb(22,92,71)] px-6 py-3 text-sm font-semibold text-white hover:bg-[rgb(18,75,58)] transition"
//           >
//             + Ajouter un prof
//           </Link>
//         </div>

//         {/* Liste */}
//         <div className="space-y-3">
//           {profs?.length === 0 && (
//             <div className="rounded-2xl border border-black/8 bg-white p-10 text-center text-sm text-black/40">
//               Aucun professeur pour l'instant. Commence par en ajouter un.
//             </div>
//           )}

//           {profs?.map((prof) => {
//             const p = prof.profile as any;
//             return (
//               <div
//                 key={prof.id}
//                 className="rounded-2xl border border-black/8 bg-white px-6 py-4 flex items-center justify-between"
//               >
//                 <div className="flex items-center gap-4">
//                   {/* Avatar initiales */}
//                   <div className="w-10 h-10 rounded-full bg-[rgb(22,92,71)]/10 flex items-center justify-center text-sm font-semibold text-[rgb(22,92,71)]">
//                     {p?.prenom?.[0]}{p?.nom?.[0]}
//                   </div>
//                   <div>
//                     <p className="font-semibold text-black text-sm">
//                       {p?.prenom} {p?.nom}
//                     </p>
//                     <p className="text-xs text-black/45 mt-0.5">
//                       {prof.type_contrat === "independant" ? "Indépendant" : "Salarié"} · {prof.disciplines?.join(", ")}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-3">
//                   <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
//                     prof.actif
//                       ? "bg-[rgb(22,92,71)]/10 text-[rgb(22,92,71)]"
//                       : "bg-black/8 text-black/40"
//                   }`}>
//                     {prof.actif ? "Actif" : "Inactif"}
//                   </span>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//       </div>
//     </main>
//   );
// }

// app/plateforme/direction/profs/nouveau/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const DISCIPLINES_DISPONIBLES = [
  "Chant", "Danse", "Théâtre", "Écriture", "Expression scénique", "Studio / production",
];

export default function NouveauProfPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [typeContrat, setTypeContrat] = useState<"salarie" | "independant">("salarie");
  const [disciplines, setDisciplines] = useState<string[]>([]);

  const toggleDiscipline = (d: string) => {
    setDisciplines((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const canSubmit = prenom && nom && email && disciplines.length > 0;

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/direction/create-prof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prenom, nom, email, telephone, typeContrat, disciplines }),
      });

      // Lire le texte brut d'abord pour éviter le crash si la réponse est vide
      const text = await res.text();
      console.log("Réponse API brute:", res.status, text);

      let data: any = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          setError(`Réponse invalide du serveur (${res.status}): ${text.slice(0, 200)}`);
          setLoading(false);
          return;
        }
      }

      if (!res.ok) {
        setError(data.error || `Erreur serveur (${res.status})`);
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err: any) {
      setError(`Erreur réseau : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-[rgb(239,244,239)] flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-[rgb(22,92,71)]/10 flex items-center justify-center mx-auto mb-6 text-3xl">
            ✓
          </div>
          <h2 className="text-2xl font-semibold text-black mb-2">Compte créé</h2>
          <p className="text-sm text-black/50 mb-8">
            {prenom} {nom} va recevoir un email avec son lien de connexion.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setSuccess(false);
                setPrenom(""); setNom(""); setEmail("");
                setTelephone(""); setDisciplines([]);
              }}
              className="rounded-full bg-[rgb(22,92,71)] px-6 py-3 text-sm font-semibold text-white hover:bg-[rgb(18,75,58)] transition"
            >
              Ajouter un autre prof
            </button>
            <Link
              href="/plateforme/direction/profs"
              className="rounded-full border border-black/15 px-6 py-3 text-sm font-semibold text-black/70 hover:bg-black/5 transition text-center"
            >
              Retour à la liste
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[rgb(239,244,239)] px-6 py-10">
      <div className="max-w-lg mx-auto">

        <Link
          href="/plateforme/direction/profs"
          className="inline-flex items-center gap-2 text-xs text-black/40 hover:text-black/60 transition mb-8"
        >
          ← Retour à la liste
        </Link>

        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgb(185,151,83)] mb-2">
            Espace direction
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-black">
            Nouveau professeur
          </h1>
          <p className="mt-1 text-sm text-black/50">
            Un email de connexion sera envoyé automatiquement.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-black/8 p-6 space-y-5">

          {/* Prénom + Nom */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">
                Prénom
              </label>
              <input
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Marie"
                className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/20 focus:border-[rgb(22,92,71)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">
                Nom
              </label>
              <input
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Dubois"
                className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/20 focus:border-[rgb(22,92,71)]"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="marie.dubois@email.com"
              className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/20 focus:border-[rgb(22,92,71)]"
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">
              Téléphone <span className="text-black/25 normal-case font-normal">(optionnel)</span>
            </label>
            <input
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="+32 470 00 00 00"
              className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/20 focus:border-[rgb(22,92,71)]"
            />
          </div>

          {/* Type de contrat */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-3">
              Type de contrat
            </label>
            <div className="flex gap-3">
              {(["salarie", "independant"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeContrat(type)}
                  className={`flex-1 rounded-[14px] border py-3 text-sm font-semibold transition ${
                    typeContrat === type
                      ? "border-[rgb(22,92,71)] bg-[rgb(22,92,71)]/8 text-[rgb(22,92,71)]"
                      : "border-black/10 bg-[rgb(247,250,247)] text-black/50"
                  }`}
                >
                  {type === "salarie" ? "Salarié" : "Indépendant"}
                </button>
              ))}
            </div>
          </div>

          {/* Disciplines */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-3">
              Disciplines <span className="text-black/25 normal-case font-normal">(plusieurs possibles)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {DISCIPLINES_DISPONIBLES.map((d) => (
                <button
                  key={d}
                  onClick={() => toggleDiscipline(d)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                    disciplines.includes(d)
                      ? "border-[rgb(22,92,71)] bg-[rgb(22,92,71)] text-white"
                      : "border-black/10 bg-[rgb(247,250,247)] text-black/50 hover:border-black/20"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className="w-full rounded-full bg-[rgb(22,92,71)] px-6 py-4 text-sm font-semibold text-white hover:bg-[rgb(18,75,58)] transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? "Création en cours..." : "Créer le compte →"}
          </button>

        </div>
      </div>
    </main>
  );
}