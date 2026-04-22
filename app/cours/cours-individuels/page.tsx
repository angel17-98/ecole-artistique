"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Reveal from "../../components/Reveal";

// ─── DATA ────────────────────────────────────────────────────────────────────

const disciplines = [
  { name: "Chant", desc: "Technique vocale, placement, justesse, interprétation — du débutant au niveau avancé.", icon: "♪" },
  { name: "Coaching vocal", desc: "Travail approfondi sur la voix — souffle, timbre, puissance, endurance et santé vocale.", icon: "◎" },
  { name: "Danse", desc: "Selon l'intervenant : contemporain, jazz, urbain, classique, expression corporelle.", icon: "◈" },
  { name: "Théâtre", desc: "Jeu d'acteur, texte, présence, improvisation, construction de personnage.", icon: "◉" },
  { name: "Instrument", desc: "Selon disponibilité — guitare, piano, batterie et autres. Nous contacter pour la liste à jour.", icon: "◆" },
  { name: "Expression scénique", desc: "Présence sur scène, regard, intention, gestion du trac — pour quiconque se produit en public.", icon: "◇" },
  { name: "Studio", desc: "Initiation à l'enregistrement, prise de son, production et écoute critique en studio.", icon: "◐" },
];

const howItWorks = [
  {
    step: "01",
    title: "Tu crées ton compte",
    text: "Un compte élève sur la plateforme Crea'Star. Gratuit, en 2 minutes. Accès immédiat aux profils des intervenants et à leurs créneaux disponibles.",
  },
  {
    step: "02",
    title: "Tu choisis ton intervenant",
    text: "Filtre par discipline, niveau ou disponibilité. Chaque intervenant a un profil détaillé — parcours, approche pédagogique, tarif par séance.",
  },
  {
    step: "03",
    title: "Tu réserves en ligne",
    text: "Sélectionne un créneau dans l'agenda de l'intervenant. La salle est automatiquement réservée. Confirmation par email.",
  },
  {
    step: "04",
    title: "Tu viens au centre",
    text: "Le jour J, tu viens à Crea'Star. La salle individuelle est prête, l'intervenant t'y attend. Pas de logistique — tout est géré.",
  },
];

const whyIntervenants = [
  {
    title: "Des salles professionnelles incluses",
    text: "3 salles individuelles insonorisées, équipées et prêtes à l'usage. Tu enseignes, on gère l'espace.",
    icon: "◈",
  },
  {
    title: "Une infrastructure de réservation gérée",
    text: "Agenda en ligne, paiements, confirmations — tout est automatisé par la plateforme Crea'Star. Zéro admin pour toi.",
    icon: "◎",
  },
  {
    title: "Une visibilité qualifiée",
    text: "Accès aux élèves de l'école et à leur réseau. Ta fiche intervenant est mise en avant auprès d'un public déjà engagé dans l'artistique.",
    icon: "◇",
  },
  {
    title: "Un contrat clair et annuel",
    text: "Tarifs fixés ensemble, conditions transparentes, renouvellement annuel. Pas de surprises, pas de négociation au cas par cas.",
    icon: "◆",
  },
];

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface IntervenantForm {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  ville: string;
  discipline: string;
  experience: string;
  motivation: string;
  cv: File | null;
}

// ─── MODALE INTERVENANT ───────────────────────────────────────────────────────

function IntervenantModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<IntervenantForm>({
    prenom: "", nom: "", email: "", telephone: "",
    ville: "", discipline: "", experience: "", motivation: "",
    cv: null,
  });

  const set = <K extends keyof IntervenantForm>(key: K, value: IntervenantForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const steps = [
    { number: 1, label: "Identité" },
    { number: 2, label: "Discipline" },
    { number: 3, label: "Motivation" },
    { number: 4, label: "CV" },
  ];

  const canProceed = () => {
    if (step === 1) return form.prenom.trim() && form.nom.trim() && form.email.trim() && form.ville.trim();
    if (step === 2) return form.discipline.trim() && form.experience.trim().length >= 60;
    if (step === 3) return form.motivation.trim().length >= 80;
    if (step === 4) return form.cv !== null;
    return false;
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type)) {
      setError("Format non supporté. Utilise PDF ou Word (.docx).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Le fichier dépasse 10 MB.");
      return;
    }
    setError(null);
    set("cv", file);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const data = new FormData();
      data.append("prenom", form.prenom);
      data.append("nom", form.nom);
      data.append("email", form.email);
      data.append("telephone", form.telephone);
      data.append("ville", form.ville);
      data.append("discipline", form.discipline);
      data.append("experience", form.experience);
      data.append("motivation", form.motivation);
      if (form.cv) data.append("cv", form.cv);

      const res = await fetch("/api/intervenant/submit", {
        method: "POST",
        body: data,
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
    <div className="fixed inset-0 z-[999] flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <button
        aria-label="Fermer"
        className="absolute inset-0 bg-black/54 backdrop-blur-[3px]"
        onClick={onClose}
      />

      {/* Panneau */}
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-t-[28px] bg-white shadow-[0_-20px_60px_rgba(0,0,0,0.18)] sm:rounded-[28px] sm:shadow-[0_24px_80px_rgba(0,0,0,0.22)]">

        {submitted ? (
          /* ── Confirmation ── */
          <div className="px-8 py-12 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <span className="text-2xl text-primary">✓</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">Demande envoyée !</h2>
            <p className="mt-4 text-sm leading-7 text-black/60">
              Merci <strong className="text-black">{form.prenom}</strong>. On a bien reçu
              ta demande et on te répond sous 48h. Si ton profil correspond à ce qu'on
              cherche, on organise un échange pour en discuter.
            </p>
            <button
              onClick={onClose}
              className="mt-8 inline-flex items-center justify-center rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[rgb(15,75,57)]"
            >
              Fermer
            </button>
          </div>
        ) : (
          <>
            {/* ── Header ── */}
            <div className="flex items-center justify-between border-b border-black/6 px-6 py-5">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-black/40">
                  Rejoindre le réseau
                </p>
                <h2 className="mt-0.5 text-base font-semibold">Devenir intervenant Crea'Star</h2>
              </div>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-sm text-black/50 transition hover:bg-black/5"
              >
                ✕
              </button>
            </div>

            {/* ── Progress ── */}
            <div className="flex gap-0 border-b border-black/6">
              {steps.map((s) => (
                <div
                  key={s.number}
                  className={`flex flex-1 flex-col items-center gap-1 px-2 py-3 text-center transition ${
                    s.number === step ? "border-b-2 border-primary" : ""
                  }`}
                >
                  <span className={`text-xs font-semibold ${s.number === step ? "text-primary" : s.number < step ? "text-primary/50" : "text-black/28"}`}>
                    {s.number < step ? "✓" : `0${s.number}`}
                  </span>
                  <span className={`hidden text-[10px] uppercase tracking-[0.14em] sm:block ${s.number === step ? "text-black/70" : "text-black/32"}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            {/* ── Contenu par étape ── */}
            <div className="max-h-[60vh] overflow-y-auto px-6 py-7 sm:px-8">

              {/* Étape 1 — Identité */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-semibold">Qui es-tu ?</h3>
                    <p className="mt-1 text-sm text-black/50">Les informations de base pour qu'on puisse te recontacter.</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      { label: "Prénom", key: "prenom" as const, placeholder: "Marie" },
                      { label: "Nom", key: "nom" as const, placeholder: "Dupont" },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="mb-1.5 block text-sm font-medium text-black/78">
                          {f.label} <span className="text-primary">*</span>
                        </label>
                        <input
                          type="text"
                          value={form[f.key]}
                          onChange={(e) => set(f.key, e.target.value)}
                          placeholder={f.placeholder}
                          className="w-full rounded-[14px] border border-black/10 bg-[rgb(249,248,245)] px-4 py-3 text-sm text-black placeholder:text-black/30 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10 transition"
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-black/78">
                      Email <span className="text-primary">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="marie@exemple.com"
                      className="w-full rounded-[14px] border border-black/10 bg-[rgb(249,248,245)] px-4 py-3 text-sm text-black placeholder:text-black/30 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10 transition"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-black/78">Téléphone</label>
                      <input
                        type="tel"
                        value={form.telephone}
                        onChange={(e) => set("telephone", e.target.value)}
                        placeholder="+32 470 00 00 00"
                        className="w-full rounded-[14px] border border-black/10 bg-[rgb(249,248,245)] px-4 py-3 text-sm text-black placeholder:text-black/30 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10 transition"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-black/78">
                        Ville / Région <span className="text-primary">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.ville}
                        onChange={(e) => set("ville", e.target.value)}
                        placeholder="Braine-l'Alleud"
                        className="w-full rounded-[14px] border border-black/10 bg-[rgb(249,248,245)] px-4 py-3 text-sm text-black placeholder:text-black/30 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10 transition"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 2 — Discipline & expérience */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-semibold">Ta discipline</h3>
                    <p className="mt-1 text-sm text-black/50">Ce que tu enseignes et ton parcours dans cette discipline.</p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-black/78">
                      Discipline(s) enseignée(s) <span className="text-primary">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {disciplines.map((d) => (
                        <button
                          key={d.name}
                          type="button"
                          onClick={() => set("discipline", d.name)}
                          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                            form.discipline === d.name
                              ? "bg-primary text-white"
                              : "border border-black/10 text-black/60 hover:border-primary/30 hover:text-primary"
                          }`}
                        >
                          {d.name}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={form.discipline}
                      onChange={(e) => set("discipline", e.target.value)}
                      placeholder="Autre discipline ? Précise ici…"
                      className="mt-3 w-full rounded-[14px] border border-black/10 bg-[rgb(249,248,245)] px-4 py-3 text-sm text-black placeholder:text-black/30 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10 transition"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-black/78">
                      Ton parcours dans cette discipline <span className="text-primary">*</span>
                    </label>
                    <textarea
                      value={form.experience}
                      onChange={(e) => set("experience", e.target.value)}
                      rows={5}
                      placeholder="Formation, scènes, projets, années d'expérience, approche pédagogique…"
                      className="w-full resize-none rounded-[14px] border border-black/10 bg-[rgb(249,248,245)] px-4 py-3 text-sm text-black placeholder:text-black/30 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10 transition"
                    />
                    <p className="mt-1 text-right text-xs text-black/36">
                      {form.experience.trim().length} / 60 min.
                    </p>
                  </div>
                </div>
              )}

              {/* Étape 3 — Motivation */}
              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-semibold">Pourquoi Crea'Star ?</h3>
                    <p className="mt-1 text-sm text-black/50">
                      Qu'est-ce qui t'attire dans le projet Crea'Star et comment tu imagines y contribuer ?
                    </p>
                  </div>
                  <div className="rounded-[14px] bg-[rgb(239,244,239)] px-5 py-4">
                    <p className="text-sm leading-6 text-primary">
                      <strong className="font-semibold">Ce qu'on cherche :</strong>{" "}
                      des praticiens actifs dans leur discipline, capables d'un
                      accompagnement individualisé sérieux, qui s'inscrivent dans
                      l'esprit artistique de Crea'Star.
                    </p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-black/78">
                      Ta motivation <span className="text-primary">*</span>
                    </label>
                    <textarea
                      value={form.motivation}
                      onChange={(e) => set("motivation", e.target.value)}
                      rows={7}
                      placeholder="Dis-nous pourquoi tu souhaites rejoindre le réseau, comment tu travailles avec tes élèves, ce que tu apporterais…"
                      className="w-full resize-none rounded-[14px] border border-black/10 bg-[rgb(249,248,245)] px-4 py-3 text-sm text-black placeholder:text-black/30 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10 transition"
                    />
                    <p className="mt-1 text-right text-xs text-black/36">
                      {form.motivation.trim().length} / 80 min.
                    </p>
                  </div>
                </div>
              )}

              {/* Étape 4 — CV */}
              {step === 4 && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-semibold">Ton CV</h3>
                    <p className="mt-1 text-sm text-black/50">
                      Un document qui résume ton parcours artistique et pédagogique.
                    </p>
                  </div>
                  <div className="rounded-[14px] bg-[rgb(239,244,239)] px-5 py-4">
                    <p className="text-sm leading-6 text-black/68">
                      <strong className="font-semibold text-black/80">Format accepté :</strong>{" "}
                      PDF ou Word (.docx), 10 MB max.
                      Inutile de le mettre en page — ce qui compte, c'est le contenu.
                    </p>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFile}
                    className="hidden"
                  />
                  {!form.cv ? (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex w-full flex-col items-center gap-3 rounded-[18px] border-2 border-dashed border-black/14 bg-white px-6 py-10 text-center transition hover:border-primary/30 hover:bg-primary/3"
                    >
                      <span className="text-3xl text-black/20">↑</span>
                      <span className="text-sm font-medium text-black/60">
                        Clique pour choisir ton CV
                      </span>
                      <span className="text-xs text-black/36">PDF ou Word · 10 MB max</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-4 rounded-[16px] border border-primary/20 bg-primary/5 px-5 py-4">
                      <span className="text-xl text-primary">✓</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-black">{form.cv.name}</p>
                        <p className="text-xs text-black/46">
                          {(form.cv.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => { set("cv", null); if (fileRef.current) fileRef.current.value = ""; }}
                        className="text-sm text-black/36 transition hover:text-black/70"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {error && <p className="text-sm text-red-600">{error}</p>}

                  {/* Récapitulatif */}
                  <div className="rounded-[16px] border border-black/6 bg-white px-5 py-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">Récapitulatif</p>
                    <div className="mt-3 space-y-2">
                      {[
                        { label: "Identité", value: `${form.prenom} ${form.nom}` },
                        { label: "Email", value: form.email },
                        { label: "Discipline", value: form.discipline },
                      ].map((item) => (
                        <div key={item.label} className="flex justify-between text-sm">
                          <span className="text-black/46">{item.label}</span>
                          <span className="font-medium text-black">{item.value || "—"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Navigation ── */}
            <div className="flex items-center justify-between border-t border-black/6 px-6 py-5 sm:px-8">
              {step > 1 ? (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="text-sm font-medium text-black/50 transition hover:text-black"
                >
                  ← Retour
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="text-sm font-medium text-black/50 transition hover:text-black"
                >
                  Annuler
                </button>
              )}
              {step < 4 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canProceed()}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white transition hover:bg-[rgb(15,75,57)] disabled:opacity-38 disabled:cursor-not-allowed"
                >
                  Continuer →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canProceed() || submitting}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white transition hover:bg-[rgb(15,75,57)] disabled:opacity-38 disabled:cursor-not-allowed"
                >
                  {submitting ? "Envoi…" : "Envoyer ma demande →"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}


// ─── PAGE ────────────────────────────────────────────────────────────────────

type View = "eleve" | "intervenant";

export default function CoursIndividuelsPage() {
  const [view, setView] = useState<View>("eleve");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <main className="min-h-screen text-foreground">

      {/* Modale intervenant */}
      {modalOpen && <IntervenantModal onClose={() => setModalOpen(false)} />}
      {/* ══ HERO — split 60/40 ══════════════════════════════════════════════ */}
      <section className="relative bg-background pt-15 pb-0 md:pt-20 lg:pt-5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(185,151,83,0.06),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(22,92,71,0.05),transparent_40%)]" />

        <div className="relative site-shell-wide px-6 md:px-10 lg:px-20">
          <div className="grid gap-0 lg:grid-cols-[1fr_420px] lg:items-end xl:grid-cols-[1fr_480px]">

            {/* ── Gauche : texte + toggle ── */}
            <div className="pb-14 md:pb-16 lg:pb-20 lg:pr-16">
              <Reveal>
                <p className="text-xs uppercase tracking-[0.28em] text-primary/78">
                  Nos cours · Sur mesure
                </p>
                <div className="my-5 h-px w-12 bg-[rgb(185,151,83)]" />
                <h1 className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-[3.2rem]">
                  Cours individuels
                  <br />
                  <span className="text-primary">Des intervenants validés, des créneaux réservables en ligne</span>
                </h1>
                <p className="mt-6 max-w-4xl text-sm leading-7 text-black/56 sm:text-base sm:leading-8">
                  Crea'Star joue le rôle d'intermédiaire entre des intervenants artistiques
                  sélectionnés et des élèves qui cherchent un accompagnement sur mesure —
                  dans les salles de l'école, avec des créneaux réservables directement en ligne.
                </p>
              </Reveal>

              {/* ── TOGGLE ── */}
              <Reveal delay={1}>
                <div className="mt-10">
                  <p className="mb-4 text-xs uppercase tracking-[0.22em] text-black/40">
                    Je suis…
                  </p>
                  <div className="inline-flex rounded-full border border-black/10 bg-white/60 p-1 shadow-[0_2px_12px_rgba(16,16,16,0.06)] backdrop-blur-sm">
                    <button
                      onClick={() => setView("eleve")}
                      className={`relative rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 ${
                        view === "eleve"
                          ? "bg-[rgb(22,92,71)] text-white shadow-[0_2px_12px_rgba(22,92,71,0.30)]"
                          : "text-black/54 hover:text-black"
                      }`}
                    >
                      Élève — je cherche un cours
                    </button>
                    <button
                      onClick={() => setView("intervenant")}
                      className={`relative rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 ${
                        view === "intervenant"
                          ? "bg-[rgb(22,92,71)] text-white shadow-[0_2px_12px_rgba(22,92,71,0.30)]"
                          : "text-black/54 hover:text-black"
                      }`}
                    >
                      Intervenant — j'enseigne
                    </button>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* ── Droite : photo ── */}
            <Reveal delay={1}>
              <div className="hidden lg:block relative h-[540px] xl:h-[600px] w-full overflow-hidden rounded-t-[32px]">
                <Image
                  src="/offres/cours-individuels.jpg"
                  alt="Cours individuel Crea'Star — salle équipée, accompagnement personnalisé"
                  fill
                  priority
                  unoptimized
                  className="object-cover object-[30%_center]"
                  sizes="(min-width: 1280px) 480px, 420px"
                />
                {/* Overlay léger en bas pour ancrer visuellement */}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgba(4,4,4,0.18)_100%)]" />
                {/* Badge flottant */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="rounded-[18px] border border-white/20 bg-black/40 px-5 py-4 backdrop-blur-md">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                      3 salles de cours disponibles
                    </p>
                    <p className="mt-1 text-sm font-medium text-white">
                      Insonorisées · Équipées · Réservables en ligne
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ══ VUE ÉLÈVE ═══════════════════════════════════════════════════════ */}
      {view === "eleve" && (
        <>
          {/* ── Fidélité highlight ── */}
          <section className="relative bg-[rgb(22,92,71)] overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(185,151,83,0.12),transparent_50%)]" />
            <div className="relative site-shell-wide px-6 py-10 md:px-10 lg:px-14">
              <Reveal>
                <div className="flex flex-col gap-6 px-10 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[rgb(185,151,83)]/30 bg-[rgb(185,151,83)]/15 text-[rgb(185,151,83)] text-xl font-light">
                      ★
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Programme fidélité — 10 cours prestés = 1 cours offert
                      </p>
                      <p className="mt-0.5 text-sm text-white/62">
                        Automatique sur ton compte, sans condition. Un compte élève suffit.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/login"
                    className="shrink-0 inline-flex items-center justify-center rounded-full border border-white/60 bg-white/50 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/40"
                  >
                    Créer mon compte →
                  </Link>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── Comment ça marche ── */}
          <section className="relative bg-[rgb(239,244,239)] overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(22,92,71,0.10),transparent)]" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(185,151,83,0.10),transparent)]" />

            <div className="site-shell-wide px-6 py-10 md:px-10 lg:px-14 lg:py-15">
              <Reveal>
                <div className="mb-14">
                  <p className="text-xs uppercase tracking-[0.28em] text-primary/80">
                    Pour les élèves
                  </p>
                  <h2 className="mt-4 text-5xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl lg:text-5xl">
                    Réserver un cours en 4 étapes
                  </h2>
                  <p className="mt-4 max-w-5xl text-sm leading-7 text-black/56 sm:text-base">
                    Un compte élève est nécessaire pour accéder aux créneaux et bénéficier
                    du programme de fidélité.
                  </p>
                </div>
              </Reveal>

              <div className="relative">
                <div className="absolute top-[1.5rem] left-0 right-0 hidden h-px bg-[linear-gradient(90deg,transparent,rgba(22,92,71,0.15)_8%,rgba(22,92,71,0.15)_92%,transparent)] lg:block" />
                <div className="grid gap-8 lg:grid-cols-4 lg:gap-6">
                  {howItWorks.map((s, i) => (
                    <Reveal key={s.step} delay={(i % 4) as 0 | 1 | 2}>
                      <div className="relative flex flex-col">
                        <div className="mb-5 flex items-center gap-4 lg:flex-col lg:items-start lg:gap-3">
                          <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-black/8 bg-white shadow-[0_4px_16px_rgba(16,16,16,0.06)] text-sm font-semibold text-primary">
                            {s.step}
                          </div>
                        </div>
                        <div className="rounded-[20px] border border-black/6 bg-white p-6 shadow-[0_4px_24px_rgba(16,16,16,0.04)]">
                          <h3 className="text-base font-semibold leading-snug sm:text-lg">
                            {s.title}
                          </h3>
                          <p className="mt-3 text-sm leading-7 text-black/60">
                            {s.text}
                          </p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>

              <Reveal>
                <div className="mt-12 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-full bg-[rgb(22,92,71)] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[rgb(15,75,57)]"
                  >
                    Créer mon compte élève →
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-full border border-black/12 px-7 py-3.5 text-sm font-medium text-black/70 transition hover:border-black/24 hover:text-black"
                  >
                    J'ai déjà un compte — me connecter
                  </Link>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── Disciplines ── */}
          <section className="relative bg-background">
            <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(16,16,16,0.08),transparent)]" />

            <div className="site-shell-wide px-6 py-10 md:px-10 lg:px-14 lg:py-15">
              <Reveal>
                <div className="mb-12">
                  <p className="text-xs uppercase tracking-[0.28em] text-primary/80">
                    Disciplines disponibles
                  </p>
                  <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl lg:text-5xl">
                    7 disciplines, des intervenants pour chacune
                  </h2>
                  <p className="mt-4 max-w-8xl text-sm leading-7 text-black/56 sm:text-base">
                    Chaque discipline est couverte par un ou plusieurs intervenants
                    validés par Crea'Star. Le catalogue évolue à mesure que le réseau
                    s'agrandit.
                  </p>
                </div>
              </Reveal>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {disciplines.map((d, i) => (
                  <Reveal key={d.name} delay={(i % 3) as 0 | 1 | 2}>
                    <div className="group rounded-[20px] border border-black/6 bg-white p-6 transition hover:border-primary/20 hover:shadow-[0_8px_32px_rgba(22,92,71,0.08)]">
                      <span className="text-2xl text-primary/60">{d.icon}</span>
                      <h3 className="mt-4 text-base font-semibold">{d.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-black/56">{d.desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ── Fidélité détail ── */}
          <section className="relative bg-[rgb(239,244,239)] overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(22,92,71,0.10),transparent)]" />

            <div className="site-shell-wide px-6 py-10 md:px-10 lg:px-14 lg:py-15">
              <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
                <Reveal>
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-primary/80">
                      Programme de fidélité
                    </p>
                    <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
                      10 cours prestés, le 11<sup>e</sup> est offert
                    </h2>
                    <p className="mt-6 text-sm leading-7 text-black/60 sm:text-base sm:leading-8">
                      Chaque cours réservé et effectué chez Crea'Star compte dans ton
                      programme de fidélité — quelle que soit la discipline ou
                      l'intervenant. Le suivi est automatique sur ton compte élève,
                      sans carte à tamponner ni formulaire à remplir.
                    </p>
                    <p className="mt-4 text-sm leading-7 text-black/60 sm:text-base sm:leading-8">
                      Tu n'as pas besoin d'être inscrit dans un parcours annuel pour en
                      bénéficier. Un compte élève suffit.
                    </p>
                    <div className="mt-8">
                      <Link
                        href="/login"
                        className="inline-flex items-center justify-center rounded-full bg-[rgb(22,92,71)] px-7 py-3.5 text-sm font-semibold !text-white transition hover:bg-[rgb(15,75,57)]"
                      >
                        Créer mon compte →
                      </Link>
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={1}>
                  <div className="rounded-[28px] border border-black/6 bg-white p-8 shadow-[0_8px_40px_rgba(16,16,16,0.06)] lg:p-10">
                    <div className="flex items-center justify-between">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgb(22,92,71)] text-white text-xs font-semibold sm:h-9 sm:w-9"
                        >
                          ✓
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex items-center gap-4 rounded-[18px] border border-[rgb(185,151,83)]/30 bg-[rgb(185,151,83)]/8 p-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgb(185,151,83)] text-white text-lg">
                        ★
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-black">
                          Cours n°11 — offert
                        </p>
                        <p className="mt-0.5 text-sm text-black/56">
                          Utilisable sur n'importe quelle discipline disponible
                        </p>
                      </div>
                    </div>
                    <p className="mt-5 text-xs text-black/36 text-center">
                      Compteur visible et mis à jour en temps réel sur ton compte élève
                    </p>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* ── Renvoi parcours ── */}
          <section className="relative bg-primary">
            <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(16,16,16,0.08),transparent)]" />

            <div className="site-shell-wide px-6 py-16 md:px-10 lg:px-14 lg:py-20">
              <Reveal>
                <div className="rounded-[28px] text-center border border-black/6 bg-[rgb(239,244,239)] p-8 lg:p-12">
                  {/* <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center"> */}
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-primary/80">
                        Tu veux aller plus loin ?
                      </p>
                      <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-balance sm:text-3xl">
                        Les parcours annuels — de la première heure au spectacle
                      </h2>
                      <p className="mt-4 max-w-8xl text-sm leading-7 text-black/60 sm:text-base">
                        Les cours individuels sont parfaits pour progresser sur un point précis.
                        Les parcours annuels sont faits pour vivre une expérience artistique
                        complète — jusqu'à la scène, en groupe, sur toute une année.
                        Les élèves inscrits bénéficient aussi du statut Premium (−15% sur
                        les cours individuels).
                      </p>
                      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link
                          href="/cours/full-artist"
                          className="inline-flex items-center justify-center rounded-full border border-black/20 px-8 py-4 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                        >
                          Découvrir Full Artist →
                        </Link>
                        <Link
                          href="/cours/comedie-musicale"
                          className="inline-flex items-center justify-center rounded-full border border-black/20 px-8 py-4 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                        >
                          Découvrir Comédie Musicale →
                        </Link>
                      </div>
                    </div>
                  {/* </div> */}
                </div>
              </Reveal>
            </div>
          </section>
        </>
      )}

      {/* ══ VUE INTERVENANT ═════════════════════════════════════════════════ */}
      {view === "intervenant" && (
        <>
          {/* ── Pitch dark ── */}
          <section className="relative bg-primary overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(185,151,83,0.08),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(22,92,71,0.12),transparent_40%)]" />

            <div className="relative site-shell-wide px-6 py-10 md:px-10 lg:px-14 lg:py-15">
              <Reveal>
                <p className="text-xs uppercase tracking-[0.28em] text-[rgb(185,151,83)]/80">
                  Pour les intervenants
                </p>
                <h2 className="mt-5 max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-balance text-white sm:text-4xl lg:text-5xl">
                  Tu enseignes ?<br />
                  Rejoins le réseau Crea'Star.
                </h2>
                <p className="mt-6 max-w-6xl text-sm leading-7 text-white/58 sm:text-base sm:leading-8">
                  Crea'Star sélectionne et contractualise des intervenants artistiques
                  indépendants pour proposer des cours individuels dans les salles de l'école. 
                  <br />
                  Tu enseignes dans un cadre professionnel, on gère le reste.
                </p>
              </Reveal>

              <Reveal delay={1}>
                <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {whyIntervenants.map((item, i) => (
                    <div
                      key={item.title}
                      className="rounded-[22px] border border-white/10 bg-white/6 p-7 backdrop-blur-sm"
                    >
                      <span className="text-2xl text-[rgb(185,151,83)]/70">{item.icon}</span>
                      <h3 className="mt-5 text-base font-semibold leading-snug text-white">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-white/54">{item.text}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── Comment ça fonctionne ── */}
          <section className="relative bg-[rgb(239,244,239)]">
            <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(22,92,71,0.10),transparent)]" />

            <div className="site-shell-wide px-6 py-20 md:px-10 lg:px-14 lg:py-24">
              <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 lg:items-start">
                <Reveal>
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-primary/80">
                      Le modèle
                    </p>
                    <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
                      Comment ça fonctionne
                    </h2>
                    <div className="mt-8 space-y-6">
                      {[
                        {
                          n: "01",
                          title: "Tu es sélectionné et contractualisé",
                          text: "Crea'Star initie le processus de sélection. Si ton profil correspond à ce qu'on cherche, on discute des conditions et on signe un contrat annuel ensemble.",
                        },
                        {
                          n: "02",
                          title: "Tu définis tes créneaux",
                          text: "Tu renseignes tes disponibilités dans l'outil. Les élèves voient tes créneaux libres et réservent directement en ligne — tu n'as pas à gérer ça.",
                        },
                        {
                          n: "03",
                          title: "Tu utilises les salles du centre",
                          text: "3 salles individuelles insonorisées et équipées à disposition. La salle est automatiquement réservée lors de chaque booking élève.",
                        },
                        {
                          n: "04",
                          title: "50 € / mois + 5 € par cours effectué",
                          text: "Ce sont les frais de mise en relation et de location de salle. Plus tu donnes de cours dans le mois, plus le coût par cours devient marginal — et rentable.",
                        },
                      ].map((step) => (
                        <div key={step.n} className="flex gap-5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-white text-xs font-semibold text-primary shadow-[0_2px_8px_rgba(22,92,71,0.08)]">
                            {step.n}
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-black sm:text-base">
                              {step.title}
                            </h3>
                            <p className="mt-1.5 text-sm leading-6 text-black/58">
                              {step.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={1}>
                  <div className="rounded-[28px] border border-primary/12 bg-white p-8 shadow-[0_8px_40px_rgba(16,16,16,0.06)] lg:sticky lg:top-28 lg:p-10">
                    <p className="text-xs uppercase tracking-[0.22em] text-black/40">
                      La sélection est exigeante
                    </p>
                    <h3 className="mt-3 text-xl font-semibold leading-snug">
                      On cherche des praticiens actifs, pas des CV
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-black/60">
                      Chaque intervenant est évalué sur son parcours, sa pratique
                      actuelle et sa capacité à accompagner individuellement. La
                      sélection est faite par Crea'Star selon les disciplines qu'on
                      souhaite proposer au catalogue.
                    </p>

                    {/* Tarif visuel */}
                    <div className="mt-6 rounded-[18px] border border-primary/14 bg-[rgb(239,244,239)] p-5">
                      <p className="text-xs uppercase tracking-[0.18em] text-primary/70 font-semibold">Frais de la plateforme</p>
                      <div className="mt-3 flex items-end gap-2">
                        <span className="text-3xl font-semibold text-black">50 €</span>
                        <span className="mb-1 text-sm text-black/50">/ mois</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-lg font-semibold text-black">+ 5 €</span>
                        <span className="text-sm text-black/50">par cours effectué</span>
                      </div>
                      <p className="mt-3 text-xs leading-5 text-black/48">
                        Inclut la mise en relation, la réservation automatisée et l'accès aux 3 salles. Plus tu enseigne, plus le coût fixe devient marginal.
                      </p>
                    </div>

                    <div className="mt-8">
                      <button
                        onClick={() => setModalOpen(true)}
                        className="inline-flex w-full items-center justify-center rounded-full bg-[rgb(22,92,71)] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[rgb(15,75,57)]"
                      >
                        Déposer ma demande →
                      </button>
                    </div>

                    <p className="mt-4 text-center text-xs text-black/36">
                      On revient vers toi sous 48h. Aucun engagement avant la signature du contrat.
                    </p>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* ── Disciplines recherchées ── */}
          <section className="relative bg-background">
            <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(16,16,16,0.08),transparent)]" />

            <div className="site-shell-wide px-6 py-10 md:px-10 lg:px-14 lg:py-15">
              <Reveal>
                <div className="mb-12">
                  <p className="text-xs uppercase tracking-[0.28em] text-primary/80">
                    Disciplines au catalogue
                  </p>
                  <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
                    7 disciplines, en cours de déploiement
                  </h2>
                  <p className="mt-4 max-w-8xl text-sm leading-7 text-black/56 sm:text-base">
                    Ce sont les disciplines actuellement proposées ou en cours de
                    déploiement sur la plateforme. Si la tienne n'y figure pas,
                    contacte-nous quand même — on est ouverts aux propositions
                    pertinentes.
                  </p>
                </div>
              </Reveal>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {disciplines.map((d, i) => (
                  <Reveal key={d.name} delay={(i % 3) as 0 | 1 | 2}>
                    <div className="rounded-[20px] border border-black/6 bg-white p-6">
                      <span className="text-2xl text-primary/60">{d.icon}</span>
                      <h3 className="mt-4 text-base font-semibold">{d.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-black/56">{d.desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal>
                <div className="mt-10">
                  <button
                    onClick={() => setModalOpen(true)}
                    className="inline-flex items-center justify-center rounded-full bg-[rgb(22,92,71)] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[rgb(15,75,57)]"
                  >
                    Déposer ma demande pour rejoindre le réseau →
                  </button>
                </div>
              </Reveal>
            </div>
          </section>
        </>
      )}

    </main>
  );
}

