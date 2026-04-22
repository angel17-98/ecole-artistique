"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/plateforme/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/plateforme/dashboard";
  const confirmed = searchParams.get("confirmed");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  };

  {confirmed && (
    <div className="rounded-[14px] bg-[rgb(239,244,239)] border border-[rgb(22,92,71)]/15 px-4 py-4 mb-6 flex items-start gap-3">
      <span className="text-[rgb(22,92,71)] mt-0.5">✓</span>
      <div>
        <p className="text-sm font-semibold text-[rgb(22,92,71)]">
          Email confirmé !
        </p>
        <p className="text-xs text-[rgb(22,92,71)]/70 mt-0.5">
          Ton compte est activé. Tu peux maintenant te connecter.
        </p>
      </div>
    </div>
  )}

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ton@email.com"
          required
          className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3.5 text-sm text-black placeholder:text-black/25 focus:border-[rgb(22,92,71)] focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/10 transition"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
            Mot de passe
          </label>
          <Link
            href="/plateforme/forgot-password"
            className="text-xs text-[rgb(22,92,71)] hover:underline"
          >
            Oublié ?
          </Link>
        </div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3.5 text-sm text-black placeholder:text-black/25 focus:border-[rgb(22,92,71)] focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/10 transition"
        />
      </div>

      {error && (
        <div className="rounded-[12px] bg-red-50 border border-red-100 px-4 py-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-[rgb(22,92,71)] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[rgb(18,75,58)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Connexion…" : "Se connecter"}
      </button>

      <p className="text-center text-sm text-black/40 pt-2">
        Pas encore de compte ?{" "}
        <Link
          href="/plateforme/register"
          className="text-[rgb(22,92,71)] font-semibold hover:underline"
        >
          Créer un compte
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-[40%] flex">

      {/* ── PANNEAU GAUCHE — Photo + branding ── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[50%] relative flex-col">

        {/* Photo de fond */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/home-page-2.jpg')" }}
        />

        {/* Contenu gauche */}
        <div className="relative z-10 mt-40 flex flex-col justify-between h-full p-10 xl:p-20">

          {/* Citation centrale */}
          <div>
            <div className="w-8 h-px bg-[rgb(185,151,83)] mb-6" />
            <blockquote className="text-2xl xl:text-3xl font-semibold leading-tight text-white text-balance">
              Ton centre artistique, tout au même endroit.
            </blockquote>
            <p className="mt-4 text-sm leading-7 text-white/55 max-w-sm">
              Planning, progression, notes de tes profs, médias — 
              tout ce qui compose ton parcours chez Crea'Star.
            </p>
          </div>

          {/* Badges bas */}
          <div className="flex flex-wrap gap-2">
            {["Parcours annuels", "Cours individuels", "Studio", "Scène"].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/14 bg-white/8 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-white/60 backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── PANNEAU DROIT — Formulaire ── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-14 xl:px-20 bg-white">

        <div className="w-full max-w-sm mx-auto">

          {/* En-tête */}
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgb(185,151,83)] mb-3">
              Espace membres
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-black">
              Connexion
            </h1>
            <p className="mt-2 text-sm text-black/45 leading-6">
              Accède à ton espace Crea'Star
            </p>
          </div>

          {/* Formulaire */}
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>

        </div>

        {/* Lien retour site */}
        <div className="mt-auto pt-10 w-full max-w-sm mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-black/35 hover:text-black/60 transition"
          >
            <span>←</span>
            <span>Retour au site</span>
          </Link>
        </div>
      </div>

    </main>
  );
}