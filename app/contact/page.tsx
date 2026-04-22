"use client";

import { useState } from "react";
import Link from "next/link";
import Reveal from "../components/Reveal";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const subjects = [
  "Informations sur les parcours",
  "Candidature & inscriptions",
  "Éveil musical & cours individuels",
  "Stages & événements",
  "Location de salles & studio",
  "Devenir intervenant·e à Crea'Star",
  "Partenariat & collaboration",
  "Autre",
];

const headerInfos = [
  { label: "Adresse", value: "Grand'Route, 550", sub: "1428 Braine l'Alleud" },
  { label: "Téléphone", value: "+32 (0) 471 01 61 81", sub: "Lun–Ven, 18h–20h" },
  { label: "Délai de réponse", value: "48h en semaine", sub: "Candidatures : 1" },
  { label: "Comment écrire", value: "Via le formulaire", sub: "↓ Juste en dessous" },
];

// ─── COMPOSANTS ───────────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-2 block text-sm font-medium text-black/78">
      {children}
      {required && <span className="ml-1 text-primary">*</span>}
    </label>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [form, setForm] = useState({
    nom: "",
    email: "",
    sujet: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const canSubmit =
    form.nom.trim() &&
    form.email.trim() &&
    form.sujet &&
    form.message.trim().length >= 20;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Erreur lors de l'envoi");
      setSubmitted(true);
    } catch {
      setError("Une erreur s'est produite. Vérifie ta connexion et réessaie.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen text-foreground">

      {/* ── HERO — éditorial typographique ── */}
      <section className="relative bg-background pt-20 md:pt-20">
        <div className="site-shell-wide px-6 md:px-10 lg:px-14">
          <Reveal>
            {/* Ligne dorée signature */}
            <div className="mb-6 h-0.5 w-12 bg-[rgb(185,151,83)]" />

            {/* Titre massif */}
            <h1 className="text-5xl font-semibold leading-[1.06] tracking-tight text-balance sm:text-6xl lg:text-7xl">
              Une{" "}
              <span className="text-primary">question ?</span>
            </h1>

            {/* Grille d'infos — 2 col mobile, 4 col desktop */}
            <div className="mt-10 grid grid-cols-2 border-t border-black/8 lg:grid-cols-4">
              {headerInfos.map((item, i) => (
                <div
                  key={item.label}
                  className={`
                    border-b border-black/8 py-5
                    ${i % 2 === 0 ? "pr-5 border-r border-black/8" : "pl-5"}
                    lg:border-r lg:px-6 lg:last:border-r-0 lg:first:pl-0 lg:last:pr-0
                  `}
                >
                  <p className="mb-1.5 text-[10px] uppercase tracking-[0.18em] text-black/36">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold leading-snug text-black/80">
                    {item.value}
                  </p>
                  <p className="mt-0.5 text-xs text-black/42">{item.sub}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CONTENU PRINCIPAL ── */}
      <section className="relative bg-background">
        <div className="site-shell-wide px-6 py-16 md:px-10 lg:px-14 lg:py-20">
          <div className="grid gap-14 lg:grid-cols-[1fr_1.4fr] lg:items-start lg:gap-20">

            {/* Colonne gauche — liens rapides */}
            <Reveal>
              <div className="space-y-6">

                <div>
                  <p className="mb-4 text-xs uppercase tracking-[0.22em] text-primary/76">
                    Accès rapide
                  </p>
                  <div className="space-y-2">
                    {[
                      { label: "Déposer une candidature", href: "/candidature" },
                      { label: "Voir nos parcours", href: "/cours/full-artist" },
                      { label: "Réserver une salle ou studio", href: "/locations" },
                      { label: "Consulter la FAQ", href: "/faq" },
                    ].map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center justify-between rounded-[16px] border border-black/6 bg-white/80 px-5 py-3.5 text-sm font-medium text-black/70 transition hover:border-primary/20 hover:text-primary"
                      >
                        {link.label}
                        <span className="text-black/28">→</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Note candidatures */}
                <div className="rounded-[18px] bg-[rgb(239,244,239)] px-5 py-5">
                  <p className="mb-1 text-xs font-semibold text-black/70">
                    Tu veux rejoindre un parcours ?
                  </p>
                  <p className="text-sm leading-6 text-black/58">
                    Les inscriptions se font par candidature — pas via ce formulaire.
                  </p>
                  <Link
                    href="/candidature"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition hover:gap-2.5"
                  >
                    Déposer une candidature <span aria-hidden>→</span>
                  </Link>
                </div>

              </div>
            </Reveal>

            {/* Colonne droite — formulaire */}
            <Reveal delay={1}>
              {submitted ? (
                /* ── Confirmation ── */
                <div className="rounded-[24px] border border-black/6 bg-white/90 px-8 py-12 text-center shadow-[0_12px_40px_rgba(16,16,16,0.06)]">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-2xl text-primary">✓</span>
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight">Message envoyé !</h2>
                  <p className="mt-4 text-sm leading-7 text-black/60">
                    Merci {form.nom.split(" ")[0]}. On a bien reçu ton message
                    concernant{" "}
                    <strong className="text-black/80">"{form.sujet}"</strong> et
                    on te répond dans les 48 heures.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ nom: "", email: "", sujet: "", message: "" });
                    }}
                    className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:gap-3"
                  >
                    Envoyer un autre message <span aria-hidden>→</span>
                  </button>
                </div>
              ) : (
                /* ── Formulaire ── */
                <form
                  onSubmit={handleSubmit}
                  className="overflow-hidden rounded-[24px] border border-black/6 bg-white/90 shadow-[0_12px_40px_rgba(16,16,16,0.06)]"
                >
                  <div className="space-y-5 px-6 py-8 sm:px-8">
                    <div>
                      <h2 className="text-xl font-semibold">Envoie-nous un message</h2>
                      <p className="mt-1 text-sm text-black/50">
                        On te répond sous 48h en semaine.
                      </p>
                    </div>

                    {/* Nom */}
                    <div>
                      <Label required>Nom complet</Label>
                      <input
                        type="text"
                        value={form.nom}
                        onChange={(e) => set("nom", e.target.value)}
                        placeholder="Marie Dupont"
                        required
                        className="w-full rounded-[14px] border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/36 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/12 transition"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <Label required>Email</Label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        placeholder="marie@exemple.com"
                        required
                        className="w-full rounded-[14px] border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/36 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/12 transition"
                      />
                    </div>

                    {/* Sujet */}
                    <div>
                      <Label required>Sujet</Label>
                      <select
                        value={form.sujet}
                        onChange={(e) => set("sujet", e.target.value)}
                        required
                        className="w-full rounded-[14px] border border-black/10 bg-white px-4 py-3 text-sm text-black focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/12 transition appearance-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "right 1rem center",
                          paddingRight: "2.5rem",
                        }}
                      >
                        <option value="" disabled>Sélectionne un sujet…</option>
                        {subjects.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <Label required>Message</Label>
                      <textarea
                        value={form.message}
                        onChange={(e) => set("message", e.target.value)}
                        placeholder="Dis-nous en quoi on peut t'aider…"
                        rows={5}
                        required
                        className="w-full resize-none rounded-[14px] border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/36 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/12 transition"
                      />
                      <p className="mt-1 text-right text-xs text-black/36">
                        {form.message.length} / 20 min.
                      </p>
                    </div>

                    {error && (
                      <p className="rounded-[12px] bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                      </p>
                    )}
                  </div>

                  {/* Footer formulaire */}
                  <div className="flex items-center justify-between border-t border-black/6 px-6 py-5 sm:px-8">
                    <p className="max-w-3xl text-xs leading-5 text-black/36">
                      Tes données ne sont jamais partagées avec des tiers.
                    </p>
                    <button
                      type="submit"
                      disabled={!canSubmit || submitting}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {submitting ? "Envoi…" : "Envoyer →"}
                    </button>
                  </div>
                </form>
              )}
            </Reveal>

          </div>
        </div>
      </section>

    </main>
  );
}