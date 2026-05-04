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

    const res = await fetch("/api/direction/create-prof", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prenom, nom, email, telephone, typeContrat, disciplines }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Une erreur est survenue.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
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
              onClick={() => { setSuccess(false); setPrenom(""); setNom(""); setEmail(""); setTelephone(""); setDisciplines([]); }}
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

        <Link href="/plateforme/direction/profs" className="inline-flex items-center gap-2 text-xs text-black/40 hover:text-black/60 transition mb-8">
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
              <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">Prénom</label>
              <input
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Angélie"
                className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/20 focus:border-[rgb(22,92,71)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">Nom</label>
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
            <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="prof@exemple.com"
              className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/20 focus:border-[rgb(22,92,71)]"
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">
              Téléphone <span className="text-black/25 normal-case font-normal">(optionnel)</span>
            </label>
            <input
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="+32 470 00 00 00"
              className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/20 focus:border-[rgb(22,92,71)]"
            />
          </div>

          {/* Type de contrat */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-3">Type de contrat</label>
            <div className="grid grid-cols-2 gap-3">
              {(["salarie", "independant"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeContrat(type)}
                  className={`rounded-[14px] border px-4 py-3 text-sm font-semibold transition ${
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
            <p className="text-sm text-red-500 bg-red-50 rounded-[14px] px-4 py-3">{error}</p>
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