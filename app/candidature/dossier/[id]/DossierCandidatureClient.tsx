"use client";
// app/candidature/dossier/[id]/DossierCandidatureClient.tsx
// Compléter le dossier (18/11/2026) : 4 parties qui s'enregistrent séparément
// (motivation, niveau, vidéo, infos pratiques), puis « Envoyer mon dossier ».

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PARCOURS_LABELS, TRANCHES, JOURS_PARCOURS, horaireDeTranche, estParcoursAnnuel, estTranche, type EvalKey } from "@/lib/grille";
import {
  SECTIONS, MIN_POURQUOI, MIN_PROJET, MIN_ESPRIT, VIDEO_MAX, VIDEO_TYPES, JUSTIF_MAX, JUSTIF_TYPES,
  LIEN_VIDEO_VALIDE, STATUT_DOSSIER_INCOMPLET,
  disciplinesDuParcours, etatDossier, nbSectionsCompletes,
  type DonneesDossier, type SectionDossier,
} from "@/lib/dossier";

interface Props {
  candidature: {
    id: string;
    statut: string;
    prenom: string;
    nom: string;
    email: string;
    telephone: string;
    tranche: string | null;
    jours: string[];
    pack: boolean;
    dossier: DonneesDossier;
  };
}

// ─── PETITS COMPOSANTS ────────────────────────────────────────────────────────

const champ =
  "w-full rounded-[14px] border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/36 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/12 transition";

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-2 block text-sm font-medium text-black/78">
      {children}
      {required && <span className="ml-1 text-primary">*</span>}
    </label>
  );
}

function Compteur({ valeur, min }: { valeur: string; min: number }) {
  const n = valeur.trim().length;
  return (
    <p className={`mt-1.5 text-xs ${n >= min ? "text-primary" : "text-black/40"}`}>
      {n >= min ? "✓" : `${n} / ${min} caractères minimum`}
    </p>
  );
}

function Choix({ actif, onClick, titre }: { actif: boolean; onClick: () => void; titre: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={actif}
      className={`w-full rounded-[16px] border px-4 py-3 text-left text-sm font-semibold transition ${
        actif ? "border-primary bg-primary/6 text-primary ring-2 ring-primary/15" : "border-black/10 bg-white text-black/80 hover:border-black/20"
      }`}>
      {titre}
    </button>
  );
}

function BoutonEnregistrer({ enCours, onClick }: { enCours: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} disabled={enCours}
      className="rounded-full bg-primary px-6 py-3 text-sm font-semibold !text-white transition hover:bg-primary-strong disabled:opacity-50">
      {enCours ? "Enregistrement…" : "Enregistrer"}
    </button>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────

export default function DossierCandidatureClient({ candidature }: Props) {
  const router = useRouter();
  const [dossier, setDossier] = useState<DonneesDossier>(candidature.dossier);
  const etat = etatDossier(dossier);
  const premiereIncomplete = SECTIONS.find((s) => !etat[s.id])?.id ?? null;
  const [ouverte, setOuverte] = useState<SectionDossier | null>(premiereIncomplete);
  const [enCours, setEnCours] = useState<string | null>(null);
  const [erreur, setErreur] = useState<{ section: string; message: string } | null>(null);
  const [envoye, setEnvoye] = useState(candidature.statut !== STATUT_DOSSIER_INCOMPLET);

  const parcoursLabel = PARCOURS_LABELS[dossier.parcours] ?? dossier.parcours;
  const tranche = estTranche(candidature.tranche) ? candidature.tranche : null;
  const joursLabel = estParcoursAnnuel(dossier.parcours)
    ? JOURS_PARCOURS[dossier.parcours].filter((j) => candidature.jours.includes(j.id)).map((j) => j.label.toLowerCase()).join(" ou ")
    : "";
  const nbFaites = nbSectionsCompletes(dossier);
  const complet = nbFaites === SECTIONS.length;

  // ── Champs locaux ──
  const [pourquoi, setPourquoi] = useState(dossier.pourquoi ?? "");
  const [projet, setProjet] = useState(dossier.projet ?? "");
  const [esprit, setEsprit] = useState(dossier.esprit_creastar ?? "");
  const disciplines = disciplinesDuParcours(dossier.parcours);
  const [evals, setEvals] = useState<Record<EvalKey, number>>({
    eval_chant: dossier.eval_chant ?? 0, eval_danse: dossier.eval_danse ?? 0, eval_theatre: dossier.eval_theatre ?? 0,
    eval_ecriture: dossier.eval_ecriture ?? 0, eval_scenique: dossier.eval_scenique ?? 0, eval_studio: dossier.eval_studio ?? 0,
  });
  const [videoMode, setVideoMode] = useState<"upload" | "link">(dossier.video_link ? "link" : "upload");
  const [video, setVideo] = useState<File | null>(null);
  const [videoLink, setVideoLink] = useState(dossier.video_link ?? "");
  const [progression, setProgression] = useState(0);
  const videoRef = useRef<HTMLInputElement>(null);
  const [telephone, setTelephone] = useState(candidature.telephone);
  const [infosSante, setInfosSante] = useState(dossier.infos_sante ?? "");
  const [droitImage, setDroitImage] = useState<boolean | null>(dossier.droit_image);
  const [reduction, setReduction] = useState(!!dossier.reduction_menage_demandee);
  const [justificatif, setJustificatif] = useState<File | null>(null);
  const justifRef = useRef<HTMLInputElement>(null);

  // ── Appel API commun ──
  const enregistrer = async (section: SectionDossier, corps: object) => {
    const r = await fetch(`/api/candidature/dossier/${candidature.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, ...corps }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error ?? "Enregistrement impossible");
    return d;
  };

  const sauver = async (section: SectionDossier, preparer: () => Promise<Partial<DonneesDossier> & Record<string, unknown>>) => {
    setEnCours(section);
    setErreur(null);
    try {
      const corps = await preparer();
      await enregistrer(section, corps);
      const nouveau = { ...dossier, ...pick(corps) };
      setDossier(nouveau);
      // On ouvre la partie suivante qui reste à faire
      const suivante = SECTIONS.find((s) => s.id !== section && !etatDossier(nouveau)[s.id])?.id ?? null;
      setOuverte(suivante);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setErreur({ section, message: e instanceof Error ? e.message : "Erreur inconnue" });
    } finally {
      setEnCours(null);
    }
  };

  // Ne garde que les champs du dossier dans la réponse (pour la mise à jour locale)
  const pick = (corps: Record<string, unknown>): Partial<DonneesDossier> => {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(dossier)) if (k in corps) out[k] = corps[k];
    if ("reduction_menage" in corps) {
      out.reduction_menage_demandee = corps.reduction_menage;
      out.justificatif_menage_path = corps.reduction_menage ? (corps.justificatif_path ?? dossier.justificatif_menage_path) : null;
    }
    return out as Partial<DonneesDossier>;
  };

  // ── Préparation de chaque partie ──
  const sauverMotivation = () => sauver("motivation", async () => ({ pourquoi, projet, esprit_creastar: esprit }));

  const sauverNiveau = () => sauver("niveau", async () => {
    if (!disciplines.every((d) => evals[d.id] > 0)) throw new Error("Choisis un niveau pour chaque discipline");
    return Object.fromEntries(disciplines.map((d) => [d.id, evals[d.id]]));
  });

  const sauverVideo = () => sauver("video", async () => {
    if (videoMode === "link") {
      if (!LIEN_VIDEO_VALIDE.test(videoLink.trim())) throw new Error("Colle un lien valide (https://…)");
      return { video_link: videoLink.trim(), video_url: null };
    }
    if (!video) throw new Error("Choisis une vidéo");
    setProgression(0);
    const presign = await fetch("/api/candidature/presign-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: candidature.email, parcours: dossier.parcours, filename: video.name, contentType: video.type, fileSize: video.size }),
    });
    if (presign.status === 507) {
      setVideo(null);
      setVideoMode("link");
      throw new Error("L'envoi de fichiers vidéo est momentanément saturé. Envoie plutôt un lien YouTube ou Google Drive : ça fonctionne exactement pareil.");
    }
    if (!presign.ok) throw new Error("Impossible de préparer l'envoi de la vidéo");
    const { uploadUrl, storagePath } = await presign.json();
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (ev) => { if (ev.lengthComputable) setProgression(Math.round((ev.loaded / ev.total) * 100)); });
      xhr.addEventListener("load", () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Envoi de la vidéo échoué (${xhr.status})`))));
      xhr.addEventListener("error", () => reject(new Error("Erreur réseau pendant l'envoi de la vidéo")));
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", video.type);
      xhr.send(video);
    });
    const sign = await fetch("/api/candidature/sign-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storagePath }),
    });
    if (!sign.ok) throw new Error("Impossible de finaliser la vidéo");
    const { readUrl } = await sign.json();
    return { video_url: readUrl, video_link: null };
  });

  const sauverInfos = () => sauver("infos", async () => {
    if (droitImage === null) throw new Error("Réponds à la question du droit à l'image");
    let justificatifPath: string | null = null;
    if (reduction && justificatif) {
      const fd = new FormData();
      fd.append("file", justificatif);
      const r = await fetch("/api/candidature/justificatif", { method: "POST", body: fd });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error ?? "Envoi du justificatif impossible");
      justificatifPath = d.path;
    } else if (reduction && !dossier.justificatif_menage_path) {
      throw new Error("Joins la composition de ménage pour demander la réduction");
    }
    return {
      droit_image: droitImage, infos_sante: infosSante, telephone,
      reduction_menage: reduction, justificatif_path: justificatifPath,
    };
  });

  const envoyerDossier = async () => {
    setEnCours("envoi");
    setErreur(null);
    try {
      const r = await fetch(`/api/candidature/dossier/${candidature.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "envoyer" }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error ?? "Envoi impossible");
      setEnvoye(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      router.refresh();
    } catch (e) {
      setErreur({ section: "envoi", message: e instanceof Error ? e.message : "Envoi impossible" });
    } finally {
      setEnCours(null);
    }
  };

  // ─── DOSSIER DÉJÀ ENVOYÉ ────────────────────────────────────────────────────
  if (envoye) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[rgb(239,244,239)] px-6 py-24">
        <div className="w-full max-w-lg rounded-[28px] border border-black/8 bg-white p-8 text-center shadow-[0_8px_40px_rgba(0,0,0,0.06)] sm:p-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary">✓</div>
          <h1 className="text-2xl font-semibold tracking-tight text-black">Dossier envoyé !</h1>
          <p className="mt-3 text-sm leading-7 text-black/60">
            Le dossier de <strong className="text-black">{candidature.prenom}</strong> pour le parcours{" "}
            <strong className="text-primary">{parcoursLabel}</strong> est entre nos mains. On lit chaque dossier avec
            attention : tu reçois une réponse par mail dans la semaine.
          </p>
          <div className="mt-6 rounded-[16px] bg-[rgb(239,244,239)] px-5 py-4 text-left text-sm leading-6 text-black/65">
            <p className="font-semibold text-black/80">Et ensuite ?</p>
            <p className="mt-1">
              Si la candidature est acceptée, tu paies un acompte pour réserver la place. Le jour définitif est
              confirmé une fois les groupes composés, puis tu reçois la facture.
            </p>
          </div>
          <Link href="/plateforme/dashboard" className="mt-7 inline-flex rounded-full bg-primary px-7 py-3 text-sm font-semibold !text-white transition hover:bg-primary-strong">
            Aller à mon espace
          </Link>
        </div>
      </main>
    );
  }

  // ─── DOSSIER À COMPLÉTER ────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[rgb(239,244,239)] px-6 pb-20 pt-12 md:px-10">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs uppercase tracking-[0.26em] text-primary/80">Inscription · Étape 2 sur 2</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-black sm:text-4xl">
          Le dossier de {candidature.prenom}
        </h1>
        <p className="mt-2 text-sm leading-7 text-black/60">
          Parcours {parcoursLabel}
          {tranche ? ` · ${TRANCHES.find((t) => t.id === tranche)?.label} · ${joursLabel} de ${horaireDeTranche(tranche)}` : ""}
          {candidature.pack ? " · Pack Studio & Artistes" : ""}
        </p>
        <p className="mt-1 text-sm text-black/50">Chaque partie s&apos;enregistre à part : tu peux t&apos;arrêter et revenir quand tu veux.</p>

        {/* Progression */}
        <div className="mt-6 rounded-[20px] bg-white px-5 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-black/80">{nbFaites} partie{nbFaites > 1 ? "s" : ""} sur {SECTIONS.length}</span>
            <span className="text-black/45">{complet ? "Prêt à envoyer" : "En cours"}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/[0.06]">
            <div className="h-2 rounded-full bg-primary transition-all duration-500" style={{ width: `${(nbFaites / SECTIONS.length) * 100}%` }} />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {SECTIONS.map((s) => {
            const fait = etat[s.id];
            const estOuverte = ouverte === s.id;
            return (
              <section key={s.id} className="overflow-hidden rounded-[22px] border border-black/6 bg-white shadow-[0_4px_16px_rgba(16,16,16,0.04)]">
                <button type="button" onClick={() => setOuverte(estOuverte ? null : s.id)} aria-expanded={estOuverte}
                  className="flex w-full items-center gap-4 px-6 py-5 text-left">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    fait ? "bg-primary !text-white" : "bg-black/[0.05] text-black/45"
                  }`}>{fait ? "✓" : SECTIONS.indexOf(s) + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold text-black">{s.titre}</span>
                    <span className="block text-xs text-black/45">{fait ? "Complété · tu peux encore modifier" : s.description}</span>
                  </span>
                  <span className={`text-black/35 transition ${estOuverte ? "rotate-180" : ""}`}>▾</span>
                </button>

                {estOuverte && (
                  <div className="space-y-6 border-t border-black/5 px-6 pb-6 pt-5">

                    {s.id === "motivation" && (
                      <>
                        <p className="text-sm leading-6 text-black/50">
                          Réponds avec tes mots, sans chercher à bien faire. Idéalement, c&apos;est {candidature.prenom} qui répond, pas un parent.
                        </p>
                        <div>
                          <Label required>Pourquoi as-tu envie de rejoindre ce parcours ?</Label>
                          <textarea rows={5} className={`${champ} resize-none`} value={pourquoi} onChange={(e) => setPourquoi(e.target.value)} />
                          <Compteur valeur={pourquoi} min={MIN_POURQUOI} />
                        </div>
                        <div>
                          <Label required>Qu&apos;aimerais-tu avoir accompli à la fin de l&apos;année ?</Label>
                          <textarea rows={4} className={`${champ} resize-none`} value={projet} onChange={(e) => setProjet(e.target.value)} />
                          <Compteur valeur={projet} min={MIN_PROJET} />
                        </div>
                        <div>
                          <Label required>Le travail de groupe et la régularité, ça représente quoi pour toi ?</Label>
                          <textarea rows={4} className={`${champ} resize-none`} value={esprit} onChange={(e) => setEsprit(e.target.value)} />
                          <Compteur valeur={esprit} min={MIN_ESPRIT} />
                        </div>
                        <BoutonEnregistrer enCours={enCours === "motivation"} onClick={sauverMotivation} />
                      </>
                    )}

                    {s.id === "niveau" && (
                      <>
                        <p className="text-sm leading-6 text-black/50">
                          Aucune bonne ou mauvaise réponse : ça nous aide à composer des groupes équilibrés.
                        </p>
                        {disciplines.map((d) => (
                          <div key={d.id}>
                            <p className="mb-2 text-sm font-semibold text-black/80">{d.name}</p>
                            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-5">
                              {d.levels.map((lvl, i) => (
                                <button key={lvl} type="button" onClick={() => setEvals((x) => ({ ...x, [d.id]: i + 1 }))}
                                  aria-pressed={evals[d.id] === i + 1}
                                  className={`rounded-[12px] border px-2.5 py-2 text-xs leading-4 transition ${
                                    evals[d.id] === i + 1 ? "border-primary bg-primary/8 font-semibold text-primary" : "border-black/10 bg-white text-black/60 hover:border-black/20"
                                  }`}>
                                  {lvl}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                        <BoutonEnregistrer enCours={enCours === "niveau"} onClick={sauverNiveau} />
                      </>
                    )}

                    {s.id === "video" && (
                      <>
                        <p className="text-sm leading-6 text-black/50">
                          Une à deux minutes, filmée au téléphone, ça suffit : présente-toi, chante, danse ou joue ce que tu veux.
                          On ne cherche pas la perfection, on veut faire ta connaissance.
                        </p>
                        {(dossier.video_url || dossier.video_link) && (
                          <p className="rounded-[14px] bg-primary/6 px-4 py-3 text-sm text-primary">
                            ✓ Vidéo reçue{dossier.video_link ? " (lien)" : ""}. Tu peux la remplacer ci-dessous si tu veux.
                          </p>
                        )}
                        <div className="grid gap-2.5 sm:grid-cols-2">
                          <Choix actif={videoMode === "upload"} onClick={() => setVideoMode("upload")} titre="Envoyer un fichier" />
                          <Choix actif={videoMode === "link"} onClick={() => setVideoMode("link")} titre="Coller un lien (YouTube, Drive…)" />
                        </div>
                        {videoMode === "upload" ? (
                          <div>
                            <input ref={videoRef} type="file" accept={VIDEO_TYPES.join(",")} className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (!f) return;
                                if (!VIDEO_TYPES.includes(f.type)) return setErreur({ section: "video", message: "Format vidéo non supporté. Utilise MP4, MOV ou AVI." });
                                if (f.size > VIDEO_MAX) return setErreur({ section: "video", message: "La vidéo dépasse 200 MB. Compresse-la, ou envoie plutôt un lien." });
                                setErreur(null);
                                setVideo(f);
                              }} />
                            <button type="button" onClick={() => videoRef.current?.click()}
                              className="w-full rounded-[18px] border-2 border-dashed border-black/12 bg-[rgb(249,250,249)] px-6 py-9 text-center transition hover:border-primary/40">
                              {video ? (
                                <>
                                  <span className="block text-sm font-semibold text-primary">✓ {video.name}</span>
                                  <span className="mt-1 block text-xs text-black/45">{(video.size / 1024 / 1024).toFixed(1)} MB · cliquer pour changer</span>
                                </>
                              ) : (
                                <>
                                  <span className="block text-sm font-semibold text-black/70">Choisir une vidéo</span>
                                  <span className="mt-1 block text-xs text-black/40">MP4, MOV ou AVI · 200 MB maximum</span>
                                </>
                              )}
                            </button>
                            {enCours === "video" && video && (
                              <div className="mt-3">
                                <div className="h-2 overflow-hidden rounded-full bg-black/[0.06]">
                                  <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${progression}%` }} />
                                </div>
                                <p className="mt-1 text-xs text-black/45">Envoi de la vidéo… {progression} %</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <Label required>Lien de la vidéo</Label>
                            <input className={champ} placeholder="https://…" value={videoLink} onChange={(e) => setVideoLink(e.target.value)} />
                            <p className="mt-1.5 text-xs text-black/40">Vérifie que le lien est accessible sans connexion.</p>
                          </div>
                        )}
                        <BoutonEnregistrer enCours={enCours === "video"} onClick={sauverVideo} />
                      </>
                    )}

                    {s.id === "infos" && (
                      <>
                        <div>
                          <Label>Téléphone de contact</Label>
                          <input type="tel" className={champ} placeholder="+32 4XX XX XX XX" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
                        </div>
                        <div>
                          <Label>Santé : quelque chose qu&apos;on doit savoir ?</Label>
                          <textarea rows={3} className={`${champ} resize-none`} value={infosSante} onChange={(e) => setInfosSante(e.target.value)}
                            placeholder="Allergie, asthme, blessure, besoin particulier… Laisse vide si rien à signaler." />
                        </div>
                        <div>
                          <Label required>Droit à l&apos;image</Label>
                          <p className="mb-3 text-xs leading-5 text-black/50">
                            Photos et vidéos prises pendant les cours et les spectacles, partagées dans le groupe WhatsApp
                            de l&apos;école et sur nos réseaux.
                          </p>
                          <div className="grid gap-2.5 sm:grid-cols-2">
                            <Choix actif={droitImage === true} onClick={() => setDroitImage(true)} titre="J'accepte" />
                            <Choix actif={droitImage === false} onClick={() => setDroitImage(false)} titre="Je refuse" />
                          </div>
                        </div>
                        <div className="rounded-[18px] border border-black/8 p-5">
                          <label className="flex cursor-pointer items-start gap-3">
                            <input type="checkbox" className="mt-1 h-4 w-4 accent-[rgb(22,92,71)]" checked={reduction}
                              onChange={(e) => { setReduction(e.target.checked); if (!e.target.checked) setJustificatif(null); }} />
                            <span>
                              <span className="block text-sm font-semibold text-black/80">Demander la réduction « membres du ménage »</span>
                              <span className="mt-0.5 block text-xs leading-5 text-black/50">
                                Si une autre personne de ton foyer est inscrite à Crea&apos;Star. Joins une composition de ménage
                                (à demander à ta commune ou via MonDossier). La direction la valide avant la facture.
                              </span>
                            </span>
                          </label>
                          {reduction && (
                            <div className="mt-4">
                              <input ref={justifRef} type="file" accept={JUSTIF_TYPES.join(",")} className="hidden"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (!f) return;
                                  if (!JUSTIF_TYPES.includes(f.type)) return setErreur({ section: "infos", message: "Justificatif : PDF, JPG, PNG ou WEBP uniquement." });
                                  if (f.size > JUSTIF_MAX) return setErreur({ section: "infos", message: "Le justificatif dépasse 10 MB." });
                                  setErreur(null);
                                  setJustificatif(f);
                                }} />
                              <button type="button" onClick={() => justifRef.current?.click()}
                                className="w-full rounded-[14px] border border-dashed border-black/15 px-4 py-4 text-sm transition hover:border-primary/40">
                                {justificatif
                                  ? <span className="font-semibold text-primary">✓ {justificatif.name}</span>
                                  : dossier.justificatif_menage_path
                                    ? <span className="font-semibold text-primary">✓ Justificatif déjà reçu · cliquer pour le remplacer</span>
                                    : <span className="text-black/55">Joindre la composition de ménage (PDF ou photo)</span>}
                              </button>
                            </div>
                          )}
                        </div>
                        <BoutonEnregistrer enCours={enCours === "infos"} onClick={sauverInfos} />
                      </>
                    )}

                    {erreur?.section === s.id && (
                      <p className="rounded-[14px] bg-red-50 px-4 py-3 text-sm text-red-600">{erreur.message}</p>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Envoi final */}
        <div className="mt-6 rounded-[24px] bg-white p-6 text-center shadow-[0_4px_16px_rgba(16,16,16,0.04)]">
          {complet ? (
            <>
              <p className="text-base font-semibold text-black">Tout est prêt !</p>
              <p className="mt-1 text-sm text-black/55">Envoie le dossier à la direction : tu reçois une réponse dans la semaine.</p>
            </>
          ) : (
            <p className="text-sm text-black/55">
              Encore {SECTIONS.length - nbFaites} partie{SECTIONS.length - nbFaites > 1 ? "s" : ""} à compléter avant de pouvoir envoyer le dossier.
            </p>
          )}
          <button type="button" onClick={envoyerDossier} disabled={!complet || enCours === "envoi"}
            className="mt-4 w-full rounded-full bg-primary px-6 py-4 text-sm font-semibold !text-white transition hover:bg-primary-strong disabled:opacity-40 sm:w-auto sm:px-12">
            {enCours === "envoi" ? "Envoi…" : "Envoyer mon dossier"}
          </button>
          {erreur?.section === "envoi" && <p className="mt-3 text-sm text-red-600">{erreur.message}</p>}
        </div>
      </div>
    </main>
  );
}