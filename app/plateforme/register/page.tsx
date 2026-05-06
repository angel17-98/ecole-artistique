// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { createClient } from "@/lib/plateforme/supabase/client";

// type Step = 1 | 2 | 3;

// export default function RegisterPage() {
//   const router = useRouter();
//   const [step, setStep] = useState<Step>(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [passwordConfirm, setPasswordConfirm] = useState("");

//   const [nomFamille, setNomFamille] = useState("");
//   const [telephone, setTelephone] = useState("");
//   const [ville, setVille] = useState("");

//   const [prenomEleve, setPrenomEleve] = useState("");
//   const [nomEleve, setNomEleve] = useState("");
//   const [dateNaissance, setDateNaissance] = useState("");

//   const canProceedStep1 =
//     email.trim() &&
//     password.length >= 8 &&
//     password === passwordConfirm;

//   const canProceedStep2 =
//     nomFamille.trim() &&
//     telephone.trim();

//   const canProceedStep3 =
//     prenomEleve.trim() &&
//     nomEleve.trim();

//   const handleSubmit = async () => {
//     setLoading(true);
//     setError(null);

//     const supabase = createClient();

//     const { data: authData, error: authError } = await supabase.auth.signUp({
//         email,
//         password,
//     });

//     console.log("authData:", authData);
//     console.log("authError:", authError);

//     if (authError) {
//         setError("Erreur auth : " + authError.message);
//         setLoading(false);
//         return;
//     }

//     // Supabase peut retourner user null si email déjà utilisé
//     const userId = authData.user?.id ?? authData.session?.user?.id;

//     if (!userId) {
//         setError("Impossible de récupérer l'identifiant utilisateur. Email déjà utilisé ?");
//         setLoading(false);
//         return;
//     }

//     const res = await fetch("/api/plateforme/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//         userId,
//         telephone,
//         nomFamille,
//         ville,
//         prenomEleve,
//         nomEleve,
//         dateNaissance: dateNaissance || null,
//         }),
//     });

//     if (!res.ok) {
//         const data = await res.json();
//         setError(data.error || "Erreur lors de la création du compte.");
//         setLoading(false);
//         return;
//     }

//     setSubmitted(true);
//     setLoading(false);
//     };

//   const steps = [
//     { number: 1, label: "Compte" },
//     { number: 2, label: "Foyer" },
//     { number: 3, label: "Élève" },
//   ];

//   const [submitted, setSubmitted] = useState(false);

//   return (
//     <main className="min-h-[20%] flex">

//       {/* ── PANNEAU GAUCHE — Photo + branding ── */}
//       <div className="hidden lg:flex lg:w-[52%] xl:w-[50%] relative flex-col">

//         {/* Photo de fond */}
//         <div
//           className="absolute inset-0 bg-cover bg-center"
//           style={{ backgroundImage: "url('/hero-studio.jpg')" }}
//         />

//         <div className="relative z-10 mt-75 mb-25 flex flex-col justify-between h-full p-10 xl:p-20">
//           <div>
//             <div className="w-8 h-px bg-[rgb(185,151,83)] mb-6" />
//             <blockquote className="text-2xl xl:text-3xl font-semibold leading-tight text-white text-balance">
//               Rejoins l'aventure Crea'Star.
//             </blockquote>
//             <p className="mt-4 text-sm leading-7 text-white/70 max-w-xl">
//               Crée ton compte en 3 étapes. Ton espace est prêt
//               en moins de 2 minutes.
//             </p>
//           </div>

//           <div className="flex flex-wrap gap-2">
//             {["Parcours annuels", "Cours individuels", "Studio", "Scène"].map((tag) => (
//               <span
//                 key={tag}
//                 className="rounded-full border border-white/14 bg-white/8 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-white/60 backdrop-blur-sm"
//               >
//                 {tag}
//               </span>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* ── PANNEAU DROIT ── */}
//       <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-14 xl:px-20 bg-white">

//         <div className="w-full max-w-sm mx-auto">

//         {submitted ? (
//             <div className="text-center">
//             <div className="w-16 h-16 rounded-full bg-[rgb(239,244,239)] flex items-center justify-center mx-auto mb-6">
//                 <span className="text-3xl">✉️</span>
//             </div>
//             <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgb(185,151,83)] mb-3">
//                 Compte créé
//             </p>
//             <h2 className="text-2xl font-semibold tracking-tight text-black mb-3">
//                 Confirme ton email
//             </h2>
//             <p className="text-sm text-black/50 leading-7 mb-6">
//                 Un email de confirmation a été envoyé à{" "}
//                 <span className="font-semibold text-black">{email}</span>.
//                 Clique sur le lien dans l'email pour activer ton compte.
//             </p>
//             <p className="text-xs text-black/35">
//                 Vérifie tes courriers indésirables si tu ne le vois pas.
//             </p>
//             <div className="mt-8 pt-8 border-t border-black/6">
//                 <Link
//                 href="/plateforme/login"
//                 className="text-sm text-[rgb(22,92,71)] font-semibold hover:underline"
//                 >
//                 Aller à la connexion →
//                 </Link>
//             </div>
//             </div>

//         ) : (
//             <>
//             {/* En-tête */}
//             <div className="mb-8">
//                 <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgb(185,151,83)] mb-3">
//                 Créer un compte
//                 </p>
//                 <h1 className="text-3xl font-semibold tracking-tight text-black">
//                 Bienvenue
//                 </h1>
//                 <p className="mt-2 text-sm text-black/45 leading-6">
//                 Ton espace Crea'Star en 3 étapes
//                 </p>
//             </div>

//             {/* Indicateur d'étapes */}
//             <div className="flex items-center gap-2 mb-8">
//                 {steps.map((s, i) => (
//                 <div key={s.number} className="flex items-center gap-2">
//                     <div className="flex items-center gap-2">
//                     <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all ${
//                         step === s.number
//                         ? "bg-[rgb(22,92,71)] text-white"
//                         : step > s.number
//                         ? "bg-[rgb(185,151,83)] text-white"
//                         : "bg-black/6 text-black/30"
//                     }`}>
//                         {step > s.number ? "✓" : s.number}
//                     </div>
//                     <span className={`text-xs font-medium hidden sm:block ${
//                         step === s.number ? "text-black" : "text-black/35"
//                     }`}>
//                         {s.label}
//                     </span>
//                     </div>
//                     {i < steps.length - 1 && (
//                     <div className={`h-px w-6 ${
//                         step > s.number ? "bg-[rgb(185,151,83)]" : "bg-black/10"
//                     }`} />
//                     )}
//                 </div>
//                 ))}
//             </div>

//             {/* ── ÉTAPE 1 : Compte ── */}
//             {step === 1 && (
//                 <div className="space-y-5">
//                 <div>
//                     <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">
//                     Email
//                     </label>
//                     <input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     placeholder="ton@email.com"
//                     className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3.5 text-sm text-black placeholder:text-black/25 focus:border-[rgb(22,92,71)] focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/10 transition"
//                     />
//                 </div>

//                 <div>
//                     <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">
//                     Mot de passe
//                     </label>
//                     <input
//                     type="password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     placeholder="8 caractères minimum"
//                     className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3.5 text-sm text-black placeholder:text-black/25 focus:border-[rgb(22,92,71)] focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/10 transition"
//                     />
//                     {password.length > 0 && (
//                     <div className="mt-2 flex gap-1">
//                         {[1, 2, 3, 4].map((i) => (
//                         <div
//                             key={i}
//                             className={`h-1 flex-1 rounded-full transition-all ${
//                             password.length >= i * 3
//                                 ? i <= 2 ? "bg-[rgb(185,151,83)]" : "bg-[rgb(22,92,71)]"
//                                 : "bg-black/8"
//                             }`}
//                         />
//                         ))}
//                     </div>
//                     )}
//                 </div>

//                 <div>
//                     <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">
//                     Confirmer le mot de passe
//                     </label>
//                     <input
//                     type="password"
//                     value={passwordConfirm}
//                     onChange={(e) => setPasswordConfirm(e.target.value)}
//                     placeholder="••••••••"
//                     className={`w-full rounded-[14px] border px-4 py-3.5 text-sm text-black placeholder:text-black/25 focus:outline-none focus:ring-2 transition ${
//                         passwordConfirm && password !== passwordConfirm
//                         ? "border-red-200 bg-red-50 focus:border-red-300 focus:ring-red-100"
//                         : "border-black/10 bg-[rgb(247,250,247)] focus:border-[rgb(22,92,71)] focus:ring-[rgb(22,92,71)]/10"
//                     }`}
//                     />
//                     {passwordConfirm && password !== passwordConfirm && (
//                     <p className="mt-1.5 text-xs text-red-500">Les mots de passe ne correspondent pas</p>
//                     )}
//                 </div>

//                 <button
//                     onClick={() => setStep(2)}
//                     disabled={!canProceedStep1}
//                     className="w-full rounded-full bg-[rgb(22,92,71)] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[rgb(18,75,58)] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
//                 >
//                     Continuer →
//                 </button>

//                 <p className="text-center text-sm text-black/40 pt-2">
//                     Déjà un compte ?{" "}
//                     <Link
//                     href="/plateforme/login"
//                     className="text-[rgb(22,92,71)] font-semibold hover:underline"
//                     >
//                     Se connecter
//                     </Link>
//                 </p>
//                 </div>
//             )}

//             {/* ── ÉTAPE 2 : Foyer ── */}
//             {step === 2 && (
//                 <div className="space-y-5">
//                 <div className="rounded-[14px] bg-[rgb(239,244,239)] px-4 py-3 text-sm text-[rgb(22,92,71)]">
//                     Un compte foyer permet de gérer plusieurs élèves de la même famille.
//                 </div>

//                 <div>
//                     <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">
//                     Nom de famille <span className="text-[rgb(22,92,71)]">*</span>
//                     </label>
//                     <input
//                     type="text"
//                     value={nomFamille}
//                     onChange={(e) => setNomFamille(e.target.value)}
//                     placeholder="Dupont"
//                     className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3.5 text-sm text-black placeholder:text-black/25 focus:border-[rgb(22,92,71)] focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/10 transition"
//                     />
//                 </div>

//                 <div>
//                     <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">
//                     Téléphone <span className="text-[rgb(22,92,71)]">*</span>
//                     </label>
//                     <input
//                     type="tel"
//                     value={telephone}
//                     onChange={(e) => setTelephone(e.target.value)}
//                     placeholder="+32 471 00 00 00"
//                     className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3.5 text-sm text-black placeholder:text-black/25 focus:border-[rgb(22,92,71)] focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/10 transition"
//                     />
//                 </div>

//                 <div>
//                     <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">
//                     Ville{" "}
//                     <span className="text-black/25 normal-case tracking-normal font-normal">(optionnel)</span>
//                     </label>
//                     <input
//                     type="text"
//                     value={ville}
//                     onChange={(e) => setVille(e.target.value)}
//                     placeholder="Braine l'Alleud"
//                     className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3.5 text-sm text-black placeholder:text-black/25 focus:border-[rgb(22,92,71)] focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/10 transition"
//                     />
//                 </div>

//                 <div className="flex gap-3">
//                     <button
//                     onClick={() => setStep(1)}
//                     className="flex-1 rounded-full border border-black/10 px-6 py-4 text-sm font-medium text-black/60 transition hover:bg-black/4"
//                     >
//                     ← Retour
//                     </button>
//                     <button
//                     onClick={() => setStep(3)}
//                     disabled={!canProceedStep2}
//                     className="flex-[2] rounded-full bg-[rgb(22,92,71)] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[rgb(18,75,58)] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
//                     >
//                     Continuer →
//                     </button>
//                 </div>
//                 </div>
//             )}

//             {/* ── ÉTAPE 3 : Premier élève ── */}
//             {step === 3 && (
//                 <div className="space-y-5">
//                 <div className="rounded-[14px] bg-[rgb(239,244,239)] px-4 py-3 text-sm text-[rgb(22,92,71)]">
//                     Tu pourras ajouter d'autres élèves depuis ton espace après l'inscription.
//                 </div>

//                 <div className="grid grid-cols-2 gap-3">
//                     <div>
//                     <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">
//                         Prénom <span className="text-[rgb(22,92,71)]">*</span>
//                     </label>
//                     <input
//                         type="text"
//                         value={prenomEleve}
//                         onChange={(e) => setPrenomEleve(e.target.value)}
//                         placeholder="Léa"
//                         className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3.5 text-sm text-black placeholder:text-black/25 focus:border-[rgb(22,92,71)] focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/10 transition"
//                     />
//                     </div>
//                     <div>
//                     <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">
//                         Nom <span className="text-[rgb(22,92,71)]">*</span>
//                     </label>
//                     <input
//                         type="text"
//                         value={nomEleve}
//                         onChange={(e) => setNomEleve(e.target.value)}
//                         placeholder="Dupont"
//                         className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3.5 text-sm text-black placeholder:text-black/25 focus:border-[rgb(22,92,71)] focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/10 transition"
//                     />
//                     </div>
//                 </div>

//                 <div>
//                     <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">
//                     Date de naissance{" "}
//                     <span className="text-black/25 normal-case tracking-normal font-normal">(optionnel)</span>
//                     </label>
//                     <input
//                     type="date"
//                     value={dateNaissance}
//                     onChange={(e) => setDateNaissance(e.target.value)}
//                     className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3.5 text-sm text-black focus:border-[rgb(22,92,71)] focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/10 transition"
//                     />
//                 </div>

//                 {error && (
//                     <div className="rounded-[12px] bg-red-50 border border-red-100 px-4 py-3">
//                     <p className="text-sm text-red-600">{error}</p>
//                     </div>
//                 )}

//                 <div className="flex gap-3">
//                     <button
//                     onClick={() => setStep(2)}
//                     className="flex-1 rounded-full border border-black/10 px-6 py-4 text-sm font-medium text-black/60 transition hover:bg-black/4"
//                     >
//                     ← Retour
//                     </button>
//                     <button
//                     onClick={handleSubmit}
//                     disabled={!canProceedStep3 || loading}
//                     className="flex-[2] rounded-full bg-[rgb(22,92,71)] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[rgb(18,75,58)] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
//                     >
//                     {loading ? "Création…" : "Créer mon compte"}
//                     </button>
//                 </div>
//                 </div>
//             )}
//             </>
//         )}

//         </div>

//         {/* Lien retour site */}
//         <div className="mt-auto pt-10 w-full max-w-sm mx-auto">
//           <Link
//             href="/"
//             className="inline-flex items-center gap-2 text-xs text-black/35 hover:text-black/60 transition"
//           >
//             <span>←</span>
//             <span>Retour au site</span>
//           </Link>
//         </div>
//       </div>

//     </main>
//   );
// }

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/plateforme/supabase/client";

type Step = 1 | 2 | 3;

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pré-remplissage si on vient de l'email de candidature
  const emailFromUrl = searchParams.get("email") ?? "";
  const sourceFromUrl = searchParams.get("source") ?? "";
  const fromCandidature = sourceFromUrl === "candidature";

  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState(emailFromUrl);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [nomFamille, setNomFamille] = useState("");
  const [telephone, setTelephone] = useState("");
  const [ville, setVille] = useState("");

  const [prenomEleve, setPrenomEleve] = useState("");
  const [nomEleve, setNomEleve] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");

  const canProceedStep1 = email.trim() && password.length >= 8 && password === passwordConfirm;
  const canProceedStep2 = nomFamille.trim() && telephone.trim();
  const canProceedStep3 = prenomEleve.trim() && nomEleve.trim();

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

    if (authError) {
      setError("Erreur auth : " + authError.message);
      setLoading(false);
      return;
    }

    const userId = authData.user?.id ?? authData.session?.user?.id;

    if (!userId) {
      setError("Impossible de récupérer l'identifiant utilisateur. Email déjà utilisé ?");
      setLoading(false);
      return;
    }

    // ── Créer profil + foyer + élève ─────────────────────────────────────────
    const res = await fetch("/api/plateforme/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId, telephone, nomFamille, ville,
        prenomEleve, nomEleve,
        dateNaissance: dateNaissance || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erreur lors de la création du compte.");
      setLoading(false);
      return;
    }

    // ── Matching candidature → user_id via email ──────────────────────────────
    // Si une candidature existe avec cet email et sans user_id, on lie
    try {
      await fetch("/api/plateforme/link-candidature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email }),
      });
    } catch (e) {
      // Non bloquant — la liaison peut échouer sans bloquer l'inscription
      console.error("Link candidature error:", e);
    }

    setSubmitted(true);
    setLoading(false);
  };

  const steps = [
    { number: 1, label: "Compte" },
    { number: 2, label: "Foyer" },
    { number: 3, label: "Élève" },
  ];

  return (
    <main className="min-h-[20%] flex">

      {/* ── PANNEAU GAUCHE ── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[50%] relative flex-col">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/hero-studio.jpg')" }} />
        <div className="relative z-10 mt-75 mb-25 flex flex-col justify-between h-full p-10 xl:p-20">
          <div>
            <div className="w-8 h-px bg-[rgb(185,151,83)] mb-6" />
            <blockquote className="text-2xl xl:text-3xl font-semibold leading-tight text-white text-balance">
              {fromCandidature ? "Suis ta candidature en temps réel." : "Rejoins l'aventure Crea'Star."}
            </blockquote>
            <p className="mt-4 text-sm leading-7 text-white/70 max-w-xl">
              {fromCandidature
                ? "Crée ton compte pour voir l'état de ta candidature et t'inscrire dès qu'une place est disponible."
                : "Crée ton compte en 3 étapes. Ton espace est prêt en moins de 2 minutes."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Parcours annuels", "Cours individuels", "Studio", "Scène"].map((tag) => (
              <span key={tag} className="rounded-full border border-white/14 bg-white/8 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-white/60 backdrop-blur-sm">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── PANNEAU DROIT ── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-14 xl:px-20 bg-white">
        <div className="w-full max-w-sm mx-auto">

          {submitted ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[rgb(239,244,239)] flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">✉️</span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgb(185,151,83)] mb-3">Compte créé</p>
              <h2 className="text-2xl font-semibold tracking-tight text-black mb-3">Confirme ton email</h2>
              <p className="text-sm text-black/50 leading-7 mb-6">
                Un email de confirmation a été envoyé à{" "}
                <span className="font-semibold text-black">{email}</span>.
                Clique sur le lien dans l'email pour activer ton compte.
              </p>
              {fromCandidature && (
                <div className="rounded-[14px] bg-[rgb(239,244,239)] px-4 py-3 text-sm text-[rgb(22,92,71)] mb-6">
                  Ta candidature sera automatiquement liée à ton compte dès la confirmation de ton email.
                </div>
              )}
              <p className="text-xs text-black/35">Vérifie tes courriers indésirables si tu ne le vois pas.</p>
              <div className="mt-8 pt-8 border-t border-black/6">
                <Link href="/plateforme/login" className="text-sm text-[rgb(22,92,71)] font-semibold hover:underline">
                  Aller à la connexion →
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgb(185,151,83)] mb-3">
                  {fromCandidature ? "Suivi candidature" : "Créer un compte"}
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-black">
                  {fromCandidature ? "Ton espace Crea'Star" : "Bienvenue"}
                </h1>
                <p className="mt-2 text-sm text-black/45 leading-6">
                  {fromCandidature
                    ? "Crée ton compte pour suivre ta candidature."
                    : "Ton espace Crea'Star en 3 étapes"}
                </p>
              </div>

              {/* Bandeau candidature si applicable */}
              {fromCandidature && (
                <div className="mb-6 rounded-[14px] bg-[rgb(239,244,239)] px-4 py-3 text-sm text-[rgb(22,92,71)] border border-[rgb(22,92,71)]/15">
                  🎯 Ta candidature sera automatiquement liée à ce compte.
                </div>
              )}

              {/* Indicateur d'étapes */}
              <div className="flex items-center gap-2 mb-8">
                {steps.map((s, i) => (
                  <div key={s.number} className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                        step === s.number ? "bg-[rgb(22,92,71)] text-white"
                        : step > s.number ? "bg-[rgb(185,151,83)] text-white"
                        : "bg-black/6 text-black/30"
                      }`}>
                        {step > s.number ? "✓" : s.number}
                      </div>
                      <span className={`text-xs font-medium hidden sm:block ${step === s.number ? "text-black" : "text-black/35"}`}>
                        {s.label}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`h-px w-6 ${step > s.number ? "bg-[rgb(185,151,83)]" : "bg-black/10"}`} />
                    )}
                  </div>
                ))}
              </div>

              {/* ── ÉTAPE 1 : Compte ── */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="ton@email.com"
                      className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3.5 text-sm text-black placeholder:text-black/25 focus:border-[rgb(22,92,71)] focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/10 transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">Mot de passe</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="8 caractères minimum"
                      className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3.5 text-sm text-black placeholder:text-black/25 focus:border-[rgb(22,92,71)] focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/10 transition" />
                    {password.length > 0 && (
                      <div className="mt-2 flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                            password.length >= i * 3
                              ? i <= 2 ? "bg-[rgb(185,151,83)]" : "bg-[rgb(22,92,71)]"
                              : "bg-black/8"
                          }`} />
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">Confirmer le mot de passe</label>
                    <input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full rounded-[14px] border px-4 py-3.5 text-sm text-black placeholder:text-black/25 focus:outline-none focus:ring-2 transition ${
                        passwordConfirm && password !== passwordConfirm
                          ? "border-red-200 bg-red-50 focus:border-red-300 focus:ring-red-100"
                          : "border-black/10 bg-[rgb(247,250,247)] focus:border-[rgb(22,92,71)] focus:ring-[rgb(22,92,71)]/10"
                      }`} />
                    {passwordConfirm && password !== passwordConfirm && (
                      <p className="mt-1.5 text-xs text-red-500">Les mots de passe ne correspondent pas</p>
                    )}
                  </div>
                  <button onClick={() => setStep(2)} disabled={!canProceedStep1}
                    className="w-full rounded-full bg-[rgb(22,92,71)] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[rgb(18,75,58)] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed">
                    Continuer →
                  </button>
                  <p className="text-center text-sm text-black/40 pt-2">
                    Déjà un compte ?{" "}
                    <Link href="/plateforme/login" className="text-[rgb(22,92,71)] font-semibold hover:underline">Se connecter</Link>
                  </p>
                </div>
              )}

              {/* ── ÉTAPE 2 : Foyer ── */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="rounded-[14px] bg-[rgb(239,244,239)] px-4 py-3 text-sm text-[rgb(22,92,71)]">
                    Un compte foyer permet de gérer plusieurs élèves de la même famille.
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">Nom de famille</label>
                    <input type="text" value={nomFamille} onChange={(e) => setNomFamille(e.target.value)}
                      placeholder="Dupont"
                      className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3.5 text-sm text-black placeholder:text-black/25 focus:border-[rgb(22,92,71)] focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/10 transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">Téléphone</label>
                    <input type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)}
                      placeholder="+32 471 00 00 00"
                      className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3.5 text-sm text-black placeholder:text-black/25 focus:border-[rgb(22,92,71)] focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/10 transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">
                      Ville <span className="text-black/25 normal-case tracking-normal font-normal">(optionnel)</span>
                    </label>
                    <input type="text" value={ville} onChange={(e) => setVille(e.target.value)}
                      placeholder="Waterloo"
                      className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3.5 text-sm text-black placeholder:text-black/25 focus:border-[rgb(22,92,71)] focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/10 transition" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="flex-1 rounded-full border border-black/10 px-6 py-4 text-sm font-medium text-black/60 transition hover:bg-black/4">← Retour</button>
                    <button onClick={() => setStep(3)} disabled={!canProceedStep2}
                      className="flex-[2] rounded-full bg-[rgb(22,92,71)] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[rgb(18,75,58)] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed">
                      Continuer →
                    </button>
                  </div>
                </div>
              )}

              {/* ── ÉTAPE 3 : Élève ── */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="rounded-[14px] bg-[rgb(239,244,239)] px-4 py-3 text-sm text-[rgb(22,92,71)]">
                    Tu pourras ajouter d'autres élèves depuis ton espace.
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">Prénom</label>
                      <input type="text" value={prenomEleve} onChange={(e) => setPrenomEleve(e.target.value)}
                        placeholder="Sophie"
                        className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3.5 text-sm text-black placeholder:text-black/25 focus:border-[rgb(22,92,71)] focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/10 transition" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">Nom</label>
                      <input type="text" value={nomEleve} onChange={(e) => setNomEleve(e.target.value)}
                        placeholder="Dupont"
                        className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3.5 text-sm text-black placeholder:text-black/25 focus:border-[rgb(22,92,71)] focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/10 transition" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">
                      Date de naissance <span className="text-black/25 normal-case tracking-normal font-normal">(optionnel)</span>
                    </label>
                    <input type="date" value={dateNaissance} onChange={(e) => setDateNaissance(e.target.value)}
                      className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3.5 text-sm text-black focus:border-[rgb(22,92,71)] focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/10 transition" />
                  </div>
                  {error && (
                    <div className="rounded-[12px] bg-red-50 border border-red-100 px-4 py-3">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button onClick={() => setStep(2)} className="flex-1 rounded-full border border-black/10 px-6 py-4 text-sm font-medium text-black/60 transition hover:bg-black/4">← Retour</button>
                    <button onClick={handleSubmit} disabled={!canProceedStep3 || loading}
                      className="flex-[2] rounded-full bg-[rgb(22,92,71)] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[rgb(18,75,58)] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed">
                      {loading ? "Création…" : "Créer mon compte"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-auto pt-10 w-full max-w-sm mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-black/35 hover:text-black/60 transition">
            <span>←</span><span>Retour au site</span>
          </Link>
        </div>
      </div>
    </main>
  );
}