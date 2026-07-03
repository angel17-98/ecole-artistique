// app/plateforme/direction/profs/nouveau/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, X } from "lucide-react";

const DISCIPLINES_DISPONIBLES = [
  "Chant", "Danse", "Théâtre", "Écriture", "Expression scénique", "Studio / production",
];

const PERIODES = ["1 mois", "2 mois", "3 mois", "6 mois", "1 an"];

export default function NouveauProfPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ── Infos compte ───────────────────────────────────────────────────────────
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [disciplines, setDisciplines] = useState<string[]>([]);

  // ── Discipline personnalisée ────────────────────────────────────────────
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customDiscipline, setCustomDiscipline] = useState("");

  // ── Infos contrat ────────────────────────────────────────────────────────
  const [typeContrat, setTypeContrat] = useState<"salarie" | "independant">("salarie");
  const [salaireFixe, setSalaireFixe] = useState("");
  const [tarifCoursIndiv, setTarifCoursIndiv] = useState("");
  const [heuresMinPeriode, setHeuresMinPeriode] = useState("");
  const [periodeEngagement, setPeriodeEngagement] = useState("3 mois");
  const [avantages, setAvantages] = useState("");
  const [dateDebut, setDateDebut] = useState(new Date().toISOString().split("T")[0]);

  const toggleDiscipline = (d: string) => {
    setDisciplines((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const addCustomDiscipline = () => {
    const trimmed = customDiscipline.trim();
    if (!trimmed) return;
    if (!disciplines.includes(trimmed)) {
      setDisciplines((prev) => [...prev, trimmed]);
    }
    setCustomDiscipline("");
  };

  const disciplinesPersonnalisees = disciplines.filter(
    (d) => !DISCIPLINES_DISPONIBLES.includes(d)
  );

  const canSubmit =
    prenom && nom && email && disciplines.length > 0 && dateDebut &&
    (typeContrat === "salarie" ? !!salaireFixe : !!tarifCoursIndiv);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    const res = await fetch("/api/direction/create-prof", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prenom, nom, email, telephone, typeContrat, disciplines,
        salaireFixe: salaireFixe || null,
        tarifCoursIndiv: tarifCoursIndiv || null,
        avantages: avantages || null,
        heuresMinPeriode: heuresMinPeriode || null,
        periodeEngagement,
        dateDebut,
      }),
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
      <main
        className="min-h-screen bg-[rgb(239,244,239)] flex items-center justify-center px-6"
        style={{ paddingTop: 96 }}
      >
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-[rgb(22,92,71)]/10 flex items-center justify-center mx-auto mb-6 text-3xl">
            ✓
          </div>
          <h2 className="text-2xl font-semibold text-black mb-2">Compte créé</h2>
          <p className="text-sm text-black/50 mb-8">
            {prenom} {nom} va recevoir un email avec son lien de connexion. Son contrat est déjà actif.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setSuccess(false);
                setPrenom(""); setNom(""); setEmail(""); setTelephone("");
                setDisciplines([]); setCustomDiscipline(""); setShowCustomInput(false);
                setSalaireFixe(""); setTarifCoursIndiv(""); setHeuresMinPeriode("");
                setAvantages(""); setPeriodeEngagement("3 mois");
                setDateDebut(new Date().toISOString().split("T")[0]);
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
    <main
      className="min-h-screen bg-[rgb(239,244,239)] px-6"
      style={{ paddingTop: "calc(96px + 24px)", paddingBottom: 40 }}
    >
      <div className="max-w-4xl mx-auto">

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
            Compte et contrat sont créés ensemble — un email de connexion sera envoyé automatiquement.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-black/8 p-6 space-y-5">

          {/* ═══ SECTION COMPTE ═══ */}
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30">
            Informations personnelles
          </p>

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
              placeholder="angelie@example.com"
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
              placeholder="+32 4XX XX XX XX"
              className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/20 focus:border-[rgb(22,92,71)]"
            />
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

              {disciplinesPersonnalisees.map((d) => (
                <button
                  key={d}
                  onClick={() => toggleDiscipline(d)}
                  className="rounded-full border px-4 py-2 text-xs font-semibold transition border-[rgb(22,92,71)] bg-[rgb(22,92,71)] text-white flex items-center gap-1.5"
                >
                  {d}
                  <X size={11} />
                </button>
              ))}

              {!showCustomInput && (
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="rounded-full border border-dashed border-black/20 px-4 py-2 text-xs font-semibold text-black/40 hover:border-black/35 hover:text-black/60 transition flex items-center gap-1"
                >
                  <Plus size={11} /> Autre
                </button>
              )}
            </div>

            {showCustomInput && (
              <div className="flex gap-2 mt-3">
                <input
                  value={customDiscipline}
                  onChange={(e) => setCustomDiscipline(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomDiscipline(); } }}
                  placeholder="Ex : Piano, Beatbox, Cirque…"
                  autoFocus
                  className="flex-1 rounded-[12px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/20 focus:border-[rgb(22,92,71)]"
                />
                <button
                  onClick={addCustomDiscipline}
                  disabled={!customDiscipline.trim()}
                  className="rounded-[12px] px-4 py-2.5 text-xs font-semibold text-white transition disabled:opacity-30"
                  style={{ background: "rgb(22,92,71)" }}
                >
                  Ajouter
                </button>
                <button
                  onClick={() => { setShowCustomInput(false); setCustomDiscipline(""); }}
                  className="rounded-[12px] px-3 py-2.5 text-xs font-semibold text-black/40 hover:bg-black/5 transition"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="h-px bg-black/6 -mx-6" />

          {/* ═══ SECTION CONTRAT ═══ */}
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30">
            Contrat
          </p>

          {/* Type de contrat */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-3">
              Type de contrat
            </label>
            <div className="flex gap-2">
              {(["salarie", "independant"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeContrat(type)}
                  className={`flex-1 rounded-[12px] border py-3 text-sm font-semibold transition ${
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

          {/* Salaire fixe — salarié */}
          {typeContrat === "salarie" && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">
                Salaire fixe mensuel (€)
              </label>
              <input
                type="number"
                value={salaireFixe}
                onChange={(e) => setSalaireFixe(e.target.value)}
                placeholder="ex: 1800"
                className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/20 focus:border-[rgb(22,92,71)]"
              />
            </div>
          )}

          {/* Tarif par cours — indépendant */}
          {typeContrat === "independant" && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">
                Tarif par cours individuel (€)
              </label>
              <input
                type="number"
                value={tarifCoursIndiv}
                onChange={(e) => setTarifCoursIndiv(e.target.value)}
                placeholder="ex: 35"
                className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/20 focus:border-[rgb(22,92,71)]"
              />
            </div>
          )}

          {/* Heures min + période */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">
                Heures min. <span className="text-black/25 normal-case font-normal">(optionnel)</span>
              </label>
              <input
                type="number"
                value={heuresMinPeriode}
                onChange={(e) => setHeuresMinPeriode(e.target.value)}
                placeholder="ex: 10"
                className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/20 focus:border-[rgb(22,92,71)]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">
                Par période de
              </label>
              <select
                value={periodeEngagement}
                onChange={(e) => setPeriodeEngagement(e.target.value)}
                className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/20"
                style={{ color: "rgb(8,20,14)" }}
              >
                {PERIODES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Avantages */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">
              Avantages <span className="text-black/25 normal-case font-normal">(optionnel)</span>
            </label>
            <textarea
              value={avantages}
              onChange={(e) => setAvantages(e.target.value)}
              placeholder="Ex : remboursement transport, mutuelle, etc."
              rows={2}
              className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/20 resize-none"
            />
          </div>

          {/* Date de début */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">
              Date de début du contrat
            </label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/20 focus:border-[rgb(22,92,71)]"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-[14px] px-4 py-3">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className="w-full rounded-full bg-[rgb(22,92,71)] px-6 py-4 text-sm font-semibold text-white hover:bg-[rgb(18,75,58)] transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? "Création en cours..." : "Créer le compte et le contrat →"}
          </button>

        </div>
      </div>
    </main>
  );
}