"use client";

import { useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Parcours = "full-artist" | "comedie-musicale";
type VideoMode = "upload" | "link" | "both";

interface FormData {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  age: string;
  ville: string;
  parcours: Parcours;
  pourquoi: string;
  projet: string;
  esprit_creastar: string;
  eval_chant: number;
  eval_danse: number;
  eval_theatre: number;
  eval_ecriture: number;
  eval_scenique: number;
  eval_studio: number;
  video: File | null;
  video_link: string;
  video_mode: VideoMode;
}

// ─── DATA ─────────────────────────────────────────────────────────────────────

const disciplines = [
  {
    id: "eval_chant" as const,
    name: "Chant",
    levels: ["Dans ma douche", "J'apprends seul·e", "Cours depuis peu", "Scène associative", "Concerts & projets"],
  },
  {
    id: "eval_danse" as const,
    name: "Danse",
    levels: ["Jamais pratiqué", "J'explore", "Cours réguliers", "Spectacles", "Formations pro"],
  },
  {
    id: "eval_theatre" as const,
    name: "Théâtre & Impro",
    levels: ["Jamais monté", "Timide sur scène", "Impro & ateliers", "Pièces & rôles", "Formations & planches"],
  },
  {
    id: "eval_ecriture" as const,
    name: "Écriture & Composition",
    levels: ["Je n'écris pas", "Quelques textes", "Compositions perso", "Projets aboutis", "Publications & scènes"],
  },
  {
    id: "eval_scenique" as const,
    name: "Expression scénique",
    levels: ["Inconnu pour moi", "Je découvre", "Je travaille ça", "À l'aise sur scène", "Présence affirmée"],
  },
  {
    id: "eval_studio" as const,
    name: "Studio d'enregistrement",
    levels: ["Jamais enregistré", "Enregistrements maison", "Sessions studio", "Productions perso", "Projets professionnels"],
  },
];

const parcoursLabels: Record<Parcours, string> = {
  "full-artist": "Full Artist",
  "comedie-musicale": "Comédie Musicale",
};

const steps = [
  { number: 1, label: "Identité" },
  { number: 2, label: "Intention" },
  { number: 3, label: "Niveau" },
  { number: 4, label: "Vidéo" },
];

// ─── SOUS-COMPOSANTS ──────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-2 block text-sm font-medium text-black/78">
      {children}
      {required && <span className="ml-1 text-primary">*</span>}
    </label>
  );
}

function Input({ value, onChange, placeholder, type = "text", required }: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <input
      type={type} value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} required={required}
      className="w-full rounded-[14px] border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/36 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/12 transition"
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 4, required }: {
  value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number; required?: boolean;
}) {
  return (
    <textarea
      value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} rows={rows} required={required}
      className="w-full resize-none rounded-[14px] border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/36 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/12 transition"
    />
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function CandidaturePage() {
  const searchParams = useSearchParams();
  const parcoursParam = searchParams.get("parcours") as Parcours | null;

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "done">("idle");
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>({
    prenom: "", nom: "", email: "", telephone: "",
    age: "", ville: "",
    parcours: parcoursParam ?? "full-artist",
    pourquoi: "", projet: "", esprit_creastar: "",
    eval_chant: 0, eval_danse: 0, eval_theatre: 0,
    eval_ecriture: 0, eval_scenique: 0, eval_studio: 0,
    video: null,
    video_link: "",
    video_mode: "upload",
  });

  const set = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Validation étape 4 — au moins une vidéo (fichier OU lien)
  const videoValid = () => {
    if (form.video_mode === "upload") return form.video !== null;
    if (form.video_mode === "link") return form.video_link.trim().length > 10;
    if (form.video_mode === "both") return form.video !== null && form.video_link.trim().length > 10;
    return false;
  };

  const canProceed = () => {
    if (step === 1) return form.prenom.trim() && form.nom.trim() && form.email.trim() && form.age.trim();
    if (step === 2) return form.pourquoi.trim().length >= 80 && form.projet.trim().length >= 40 && form.esprit_creastar.trim().length >= 40;
    if (step === 3) return disciplines.every((d) => form[d.id] > 0);
    if (step === 4) return videoValid();
    return false;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxSize = 200 * 1024 * 1024;
    const allowed = ["video/mp4", "video/quicktime", "video/avi", "video/x-msvideo"];
    if (!allowed.includes(file.type)) {
      setError("Format non supporté. Utilise MP4, MOV ou AVI.");
      return;
    }
    if (file.size > maxSize) {
      setError("Le fichier dépasse 200 MB. Compresse-le avant de l'envoyer.");
      return;
    }
    setError(null);
    set("video", file);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      let videoUrl = "";

      // Upload fichier si présent
      if (form.video) {
        // Obtenir URL signée
        const presignRes = await fetch("/api/candidature/presign-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            parcours: form.parcours,
            filename: form.video.name,
            contentType: form.video.type,
            fileSize: form.video.size, // ← ajout : taille pour vérif côté serveur
          }),
        });

        // 507 = storage plein → basculer en mode lien sans bloquer le candidat
        if (presignRes.status === 507) {
          setSubmitting(false);
          setForm((prev) => ({ ...prev, video_mode: "link", video: null }));
          if (fileRef.current) fileRef.current.value = "";
          setError(
            "L'envoi de fichier vidéo est temporairement indisponible dû à un nombre de candidatures important aujourd'hui. " +
            "Tu peux envoyer ta candidature avec un lien YouTube ou Google Drive — " +
            "ça fonctionne exactement pareil !"
          );
          return;
        }

        if (!presignRes.ok) throw new Error("Impossible de préparer l'upload");
        const { uploadUrl, readUrl } = await presignRes.json();

        // Upload direct navigateur → Supabase (bypass limite Vercel)
        setUploadStatus("uploading");
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
          });
          xhr.addEventListener("load", () => {
            xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload échoué (${xhr.status})`));
          });
          xhr.addEventListener("error", () => reject(new Error("Erreur réseau pendant l'upload")));
          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader("Content-Type", form.video!.type);
          xhr.send(form.video);
        });

        setUploadStatus("done");
        videoUrl = readUrl;
      }

      // Soumettre la candidature complète
      const submitRes = await fetch("/api/candidature/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenom: form.prenom, nom: form.nom,
          email: form.email, telephone: form.telephone,
          age: form.age, ville: form.ville,
          parcours: form.parcours,
          pourquoi: form.pourquoi, projet: form.projet,
          esprit_creastar: form.esprit_creastar,
          eval_chant: form.eval_chant, eval_danse: form.eval_danse,
          eval_theatre: form.eval_theatre, eval_ecriture: form.eval_ecriture,
          eval_scenique: form.eval_scenique, eval_studio: form.eval_studio,
          video_url: videoUrl,
          video_link: form.video_link,
        }),
      });

      if (!submitRes.ok) throw new Error("Erreur lors de l'envoi de la candidature");
      setSubmitted(true);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setError(`Une erreur s'est produite : ${msg}. Vérifie ta connexion et réessaie.`);
      setUploadStatus("idle");
      setUploadProgress(0);
    } finally {
      setSubmitting(false);
    }
  };

  // ── CONFIRMATION ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[rgb(239,244,239)] px-6 py-24">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <span className="text-3xl text-primary">✓</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Candidature envoyée !</h1>
          <p className="mt-5 text-base leading-8 text-black/64">
            Merci {form.prenom}. On a bien reçu ta candidature pour le parcours{" "}
            <strong className="text-primary">{parcoursLabels[form.parcours]}</strong>.
            Tu vas recevoir un email de confirmation. On te répond sous 1 semaine.
          </p>
          <div className="mt-6 rounded-[18px] border border-black/6 bg-white/80 px-6 py-4 text-sm leading-7 text-black/58">
            <strong className="text-black">Et maintenant ?</strong> Rien à faire — on s'occupe de tout. Si tu as des questions, contacte-nous.
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/" className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white transition hover:bg-primary-strong">
              Retour à l'accueil
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center rounded-full border border-black/12 px-8 py-3 text-sm font-medium text-black/70 transition hover:border-black/22">
              Nous contacter
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── FORMULAIRE ────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[rgb(239,244,239)] px-5 py-12 md:px-6 lg:py-16">
      <div className="mx-auto max-w-2xl">

        {/* En-tête */}
        <div className="mb-8">
          <Link href={`/cours/${form.parcours}`} className="inline-flex items-center gap-2 text-sm text-black/50 transition hover:text-black/80">
            ← Retour au parcours
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Candidature — <span className="text-primary">{parcoursLabels[form.parcours]}</span>
          </h1>
          <p className="mt-2 text-sm leading-6 text-black/56">
            Pas d'audition, pas de niveau requis. Juste de la motivation et l'envie de créer.
          </p>
        </div>

        {/* Indicateur d'étapes */}
        <div className="mb-8 flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s.number} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition ${
                  step === s.number ? "bg-primary text-white"
                  : step > s.number ? "bg-primary/20 text-primary"
                  : "bg-black/8 text-black/40"
                }`}>
                  {step > s.number ? "✓" : s.number}
                </div>
                <span className={`hidden text-xs font-medium sm:block ${step === s.number ? "text-black/80" : "text-black/40"}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-px min-w-[1.5rem] flex-1 transition ${step > s.number ? "bg-primary/30" : "bg-black/10"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Carte formulaire */}
        <div className="rounded-[24px] border border-black/6 bg-white/90 shadow-[0_12px_40px_rgba(16,16,16,0.06)]">

          {/* ── ÉTAPE 1 ── */}
          {step === 1 && (
            <div className="px-6 py-8 sm:px-8">
              <h2 className="text-xl font-semibold">Qui es-tu ?</h2>
              <p className="mt-1 text-sm text-black/50">Quelques infos de base pour commencer.</p>
              <div className="mt-7 space-y-5">
                <div>
                  <Label required>Parcours souhaité</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["full-artist", "comedie-musicale"] as Parcours[]).map((p) => (
                      <button key={p} type="button" onClick={() => set("parcours", p)}
                        className={`rounded-[14px] border px-4 py-3 text-left text-sm font-medium transition ${
                          form.parcours === p ? "border-primary bg-primary/6 text-primary" : "border-black/10 bg-white text-black/64 hover:border-black/20"
                        }`}
                      >
                        {parcoursLabels[p]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label required>Prénom</Label><Input value={form.prenom} onChange={(v) => set("prenom", v)} placeholder="Marie" required /></div>
                  <div><Label required>Nom</Label><Input value={form.nom} onChange={(v) => set("nom", v)} placeholder="Dupont" required /></div>
                </div>
                <div><Label required>Email</Label><Input type="email" value={form.email} onChange={(v) => set("email", v)} placeholder="marie@exemple.com" required /></div>
                <div><Label>Téléphone</Label><Input type="tel" value={form.telephone} onChange={(v) => set("telephone", v)} placeholder="+32 470 00 00 00" /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><Label required>Âge</Label><Input type="number" value={form.age} onChange={(v) => set("age", v)} placeholder="16" required /></div>
                  <div><Label>Ville</Label><Input value={form.ville} onChange={(v) => set("ville", v)} placeholder="Waterloo" /></div>
                </div>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 2 ── */}
          {step === 2 && (
            <div className="px-6 py-8 sm:px-8">
              <h2 className="text-xl font-semibold">Ta lettre d'intention</h2>
              <p className="mt-1 text-sm text-black/50">Pas besoin d'être parfait — sois sincère.</p>
              <div className="mt-7 space-y-6">
                <div>
                  <Label required>Pourquoi tu veux rejoindre Crea'Star ?</Label>
                  <p className="mb-2 text-xs text-black/42">Qu'est-ce qui t'attire dans ce projet ? Qu'est-ce que tu espères vivre ?</p>
                  <Textarea value={form.pourquoi} onChange={(v) => set("pourquoi", v)} placeholder="Depuis que j'ai découvert Crea'Star..." rows={5} required />
                  <p className="mt-1 text-right text-xs text-black/36">{form.pourquoi.length} / 80 min.</p>
                </div>
                <div>
                  <Label required>Qu'est-ce que tu veux créer cette année ?</Label>
                  <p className="mb-2 text-xs text-black/42">Un projet, une idée, un univers — même vague, dis-nous.</p>
                  <Textarea value={form.projet} onChange={(v) => set("projet", v)} placeholder="J'aimerais écrire et interpréter..." rows={4} required />
                  <p className="mt-1 text-right text-xs text-black/36">{form.projet.length} / 40 min.</p>
                </div>
                <div>
                  <Label required>Qu'est-ce qui t'attire dans l'esprit Crea'Star ?</Label>
                  <p className="mb-2 text-xs text-black/42">La pluridisciplinarité, le collectif, la scène, le studio...</p>
                  <Textarea value={form.esprit_creastar} onChange={(v) => set("esprit_creastar", v)} placeholder="Ce qui me touche c'est l'idée que..." rows={4} required />
                  <p className="mt-1 text-right text-xs text-black/36">{form.esprit_creastar.length} / 40 min.</p>
                </div>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 3 ── */}
          {step === 3 && (
            <div className="px-6 py-8 sm:px-8">
              <h2 className="text-xl font-semibold">Où tu en es aujourd'hui ?</h2>
              <p className="mt-1 text-sm text-black/50">Sois honnête — pas de bonne ou mauvaise réponse.</p>
              <div className="mt-7 space-y-8">
                {disciplines.map((discipline) => (
                  <div key={discipline.id}>
                    <p className="mb-3 text-sm font-semibold text-black">{discipline.name}</p>
                    <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                      {discipline.levels.map((levelLabel, i) => {
                        const val = i + 1;
                        const isSelected = form[discipline.id] === val;
                        return (
                          <button key={val} type="button" onClick={() => set(discipline.id, val)}
                            className={`flex flex-col items-center gap-1.5 rounded-[12px] border px-1 py-3 text-center transition sm:px-2 sm:rounded-[14px] ${
                              isSelected ? "border-primary bg-primary/6" : "border-black/8 bg-white/60 hover:border-black/16"
                            }`}
                          >
                            <span className={`text-base font-semibold sm:text-lg ${isSelected ? "text-primary" : "text-black/30"}`}>{val}</span>
                            <span className={`text-[9px] leading-tight sm:text-[10px] ${isSelected ? "text-primary/80" : "text-black/44"}`}>{levelLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ÉTAPE 4 — VIDÉO ── */}
          {step === 4 && (
            <div className="px-6 py-8 sm:px-8">
              <h2 className="text-xl font-semibold">Ta vidéo de présentation</h2>
              <p className="mt-1 text-sm text-black/50">Montre-nous qui tu es artistiquement — 2 à 3 minutes max.</p>

              <div className="mt-4 rounded-[14px] bg-[rgb(239,244,239)] px-5 py-4">
                <p className="text-sm leading-6 text-[rgb(15,65,48)]">
                  <strong className="font-semibold">Qu'est-ce qu'on veut voir ?</strong>{" "}
                  Chante un couplet, danse, joue une scène, parle de ton projet. Ou un peu de tout.
                </p>
              </div>

              {/* Choix du mode vidéo */}
              <div className="mt-6">
                <Label required>Comment envoies-tu ta vidéo ?</Label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: "upload", label: "Fichier", sub: "MP4, MOV, AVI" },
                    { value: "link", label: "Lien", sub: "YouTube, Drive…" },
                    { value: "both", label: "Les deux", sub: "Fichier + lien" },
                  ] as { value: VideoMode; label: string; sub: string }[]).map((opt) => (
                    <button key={opt.value} type="button" onClick={() => { set("video_mode", opt.value); setError(null); }}
                      className={`flex flex-col items-center rounded-[14px] border px-3 py-3 text-center transition ${
                        form.video_mode === opt.value ? "border-primary bg-primary/6" : "border-black/10 bg-white hover:border-black/20"
                      }`}
                    >
                      <span className={`text-sm font-semibold ${form.video_mode === opt.value ? "text-primary" : "text-black/70"}`}>{opt.label}</span>
                      <span className="mt-0.5 text-xs text-black/40">{opt.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Zone upload fichier */}
              {(form.video_mode === "upload" || form.video_mode === "both") && (
                <div className="mt-5">
                  <Label required={form.video_mode === "upload" || form.video_mode === "both"}>
                    {form.video_mode === "both" ? "Fichier vidéo" : "Fichier vidéo"}
                  </Label>
                  <input ref={fileRef} type="file" accept="video/mp4,video/quicktime,video/avi,video/x-msvideo" onChange={handleFileChange} className="hidden" />

                  {!form.video ? (
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="w-full rounded-[18px] border-2 border-dashed border-black/14 bg-white/60 px-6 py-8 text-center transition hover:border-primary/30 hover:bg-white"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/8 text-xl text-primary">↑</div>
                        <p className="text-sm font-medium text-black/70">Clique pour choisir ta vidéo</p>
                        <p className="text-xs text-black/40">MP4, MOV ou AVI · 200 MB maximum</p>
                      </div>
                    </button>
                  ) : (
                    <div className="rounded-[18px] border border-primary/20 bg-primary/4 px-5 py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/12 text-sm text-primary">▶</div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-black">{form.video.name}</p>
                            <p className="text-xs text-black/50">{(form.video.size / 1024 / 1024).toFixed(1)} MB</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => { set("video", null); if (fileRef.current) fileRef.current.value = ""; }}
                          className="shrink-0 text-xs text-black/42 underline hover:text-black/70"
                        >
                          Changer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Zone lien vidéo */}
              {(form.video_mode === "link" || form.video_mode === "both") && (
                <div className="mt-5">
                  <Label required={form.video_mode === "link" || form.video_mode === "both"}>
                    {form.video_mode === "both" ? "Lien vidéo (en complément)" : "Lien vers ta vidéo"}
                  </Label>
                  <Input
                    type="url"
                    value={form.video_link}
                    onChange={(v) => set("video_link", v)}
                    placeholder="https://youtube.com/watch?v=... ou https://drive.google.com/..."
                  />
                  <p className="mt-1.5 text-xs text-black/42">
                    YouTube, Google Drive, Dropbox, Vimeo… Assure-toi que le lien est accessible sans connexion.
                  </p>
                </div>
              )}

              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

              {/* Récapitulatif */}
              <div className="mt-8 rounded-[18px] border border-black/6 bg-white/60 px-5 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/44">Récapitulatif</p>
                <div className="mt-3 space-y-2">
                  {[
                    { label: "Parcours", value: parcoursLabels[form.parcours] },
                    { label: "Candidat·e", value: `${form.prenom} ${form.nom}` },
                    { label: "Email", value: form.email },
                    { label: "Âge", value: form.age ? `${form.age} ans` : "—" },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between text-sm">
                      <span className="text-black/50">{item.label}</span>
                      <span className="font-medium text-black">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Barre de progression upload */}
          {submitting && uploadStatus === "uploading" && (
            <div className="border-t border-black/6 px-6 py-4 sm:px-8">
              <div className="mb-2 flex items-center justify-between text-xs text-black/56">
                <span>Upload de la vidéo en cours…</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/8">
                <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}
          {submitting && uploadStatus === "done" && (
            <div className="border-t border-black/6 px-6 py-3 text-center text-sm text-black/56 sm:px-8">
              Vidéo envoyée — finalisation de la candidature…
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between border-t border-black/6 px-6 py-5 sm:px-8">
            {step > 1 ? (
              <button type="button" onClick={() => setStep((s) => s - 1)} disabled={submitting}
                className="text-sm font-medium text-black/54 transition hover:text-black/80 disabled:opacity-40"
              >
                ← Étape précédente
              </button>
            ) : <div />}

            {step < 4 ? (
              <button type="button" onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-40"
              >
                Étape suivante →
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={!canProceed() || submitting}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? "Envoi en cours…" : "Envoyer ma candidature →"}
              </button>
            )}
          </div>

        </div>

        <p className="mt-6 text-center text-xs leading-6 text-black/40">
          Tes données sont utilisées uniquement pour traiter ta candidature et ne sont jamais partagées avec des tiers.
        </p>

      </div>
    </main>
  );
}