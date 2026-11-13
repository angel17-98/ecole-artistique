"use client";
// app/candidature/CandidatureClient.tsx
// Formulaire de candidature aux parcours annuels — 6 étapes (10/11/2026)
//   1. Élève & parcours   2. Créneau   3. Motivation
//   4. Niveau             5. Vidéo     6. Infos pratiques & envoi

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  PARCOURS_ANNUELS, TRANCHES, JOURS_PARCOURS, EVALS_PAR_PARCOURS,
  ageAu, trancheConseillee, horaireDeTranche, estParcoursAnnuel,
  type ParcoursAnnuel, type Tranche, type EvalKey,
} from "@/lib/grille";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Eleve {
  id: string;
  prenom: string;
  nom: string;
  date_naissance: string | null;
}

type VideoMode = "upload" | "link";

interface Props {
  email: string;
  nomFamille: string;
  telephoneFoyer: string;
  eleves: Eleve[];
  candidaturesEnCours: { eleve_id: string; parcours: string }[];
  parcoursInitial: string | null;
}

// ─── DONNÉES ──────────────────────────────────────────────────────────────────

const DISCIPLINES: { id: EvalKey; name: string; levels: string[] }[] = [
  { id: "eval_chant",    name: "Chant",                   levels: ["Dans ma douche", "J'apprends seul·e", "Cours depuis peu", "Scène associative", "Concerts & projets"] },
  { id: "eval_danse",    name: "Danse",                   levels: ["Jamais pratiqué", "J'explore", "Cours réguliers", "Spectacles", "Formations pro"] },
  { id: "eval_theatre",  name: "Théâtre & Impro",         levels: ["Jamais monté", "Timide sur scène", "Impro & ateliers", "Pièces & rôles", "Formations & planches"] },
  { id: "eval_ecriture", name: "Écriture & Composition",  levels: ["Je n'écris pas", "Quelques textes", "Compositions perso", "Projets aboutis", "Publications & scènes"] },
  { id: "eval_scenique", name: "Expression scénique",     levels: ["Inconnu pour moi", "Je découvre", "Je travaille ça", "À l'aise sur scène", "Présence affirmée"] },
  { id: "eval_studio",   name: "Studio d'enregistrement", levels: ["Jamais enregistré", "Enregistrements maison", "Sessions studio", "Productions perso", "Projets professionnels"] },
];

const ETAPES = ["Élève", "Créneau", "Motivation", "Niveau", "Vidéo", "Infos"];

const MIN_POURQUOI = 80;
const MIN_PROJET = 40;
const MIN_ESPRIT = 40;
const VIDEO_MAX = 200 * 1024 * 1024;
const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/avi", "video/x-msvideo"];
const JUSTIF_MAX = 10 * 1024 * 1024;
const JUSTIF_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

// ─── PETITS COMPOSANTS ────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-2 block text-sm font-medium text-black/78">
      {children}
      {required && <span className="ml-1 text-primary">*</span>}
    </label>
  );
}

const champ =
  "w-full rounded-[14px] border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/36 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/12 transition";

function Choix({
  actif, onClick, titre, sousTitre, disabled,
}: { actif: boolean; onClick: () => void; titre: string; sousTitre?: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-[16px] border px-4 py-3.5 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
        actif ? "border-primary bg-primary/6 ring-2 ring-primary/15" : "border-black/10 bg-white hover:border-black/20"
      }`}
    >
      <span className={`block text-sm font-semibold ${actif ? "text-primary" : "text-black/80"}`}>{titre}</span>
      {sousTitre && <span className="mt-0.5 block text-xs leading-5 text-black/45">{sousTitre}</span>}
    </button>
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

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────

export default function CandidatureClient({
  email, nomFamille, telephoneFoyer, eleves, candidaturesEnCours, parcoursInitial,
}: Props) {
  const [etape, setEtape] = useState(1);
  const [envoi, setEnvoi] = useState<"idle" | "justificatif" | "video" | "candidature">("idle");
  const [progression, setProgression] = useState(0);
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const justifRef = useRef<HTMLInputElement>(null);

  // ── Étape 1 : élève & parcours ──
  const [eleveId, setEleveId] = useState<string | "nouveau" | null>(eleves.length === 1 ? eleves[0].id : null);
  const [nouvelEleve, setNouvelEleve] = useState({ prenom: "", nom: nomFamille });
  const [dateNaissance, setDateNaissance] = useState("");
  const [parcours, setParcours] = useState<ParcoursAnnuel | null>(
    estParcoursAnnuel(parcoursInitial) ? parcoursInitial : null
  );

  // ── Étape 2 : créneau ──
  const [tranche, setTranche] = useState<Tranche | null>(null);
  const [jours, setJours] = useState<string[]>([]);

  // ── Étapes 3 et 4 : motivation & niveau ──
  const [pourquoi, setPourquoi] = useState("");
  const [projet, setProjet] = useState("");
  const [esprit, setEsprit] = useState("");
  const [evals, setEvals] = useState<Record<EvalKey, number>>({
    eval_chant: 0, eval_danse: 0, eval_theatre: 0, eval_ecriture: 0, eval_scenique: 0, eval_studio: 0,
  });

  // ── Étape 5 : vidéo ──
  const [videoMode, setVideoMode] = useState<VideoMode>("upload");
  const [video, setVideo] = useState<File | null>(null);
  const [videoLink, setVideoLink] = useState("");

  // ── Étape 6 : infos pratiques ──
  const [telephone, setTelephone] = useState(telephoneFoyer);
  const [infosSante, setInfosSante] = useState("");
  const [droitImage, setDroitImage] = useState<boolean | null>(null);
  const [reduction, setReduction] = useState(false);
  const [justificatif, setJustificatif] = useState<File | null>(null);

  // ── Dérivés ──
  const eleve = eleves.find((e) => e.id === eleveId) ?? null;
  const dateEffective = eleveId === "nouveau" ? dateNaissance : eleve?.date_naissance ?? dateNaissance;
  const doitSaisirDate = eleveId === "nouveau" || (eleve !== null && !eleve.date_naissance);
  const age = dateEffective ? ageAu(dateEffective) : null;
  const conseillee = trancheConseillee(age);
  const prenomEleve = eleveId === "nouveau" ? nouvelEleve.prenom : eleve?.prenom ?? "";

  // Disciplines de l'auto-évaluation selon le parcours choisi
  const disciplinesParcours = parcours
    ? DISCIPLINES.filter((d) => EVALS_PAR_PARCOURS[parcours].includes(d.id))
    : DISCIPLINES;

  const dejaEnCours = (id: string, p: ParcoursAnnuel) =>
    candidaturesEnCours.some((c) => c.eleve_id === id && c.parcours === p);

  const parcoursBloque = useMemo(() => {
    if (!parcours || !eleveId || eleveId === "nouveau") return false;
    return dejaEnCours(eleveId, parcours);
  }, [parcours, eleveId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Passage à l'étape 2 : on pré-sélectionne la tranche conseillée
  const allerEtape2 = () => {
    if (!tranche && conseillee) setTranche(conseillee);
    // Les jours dépendent du parcours : on retire ceux qui ne s'appliquent plus
    if (parcours) setJours((j) => j.filter((x) => JOURS_PARCOURS[parcours].some((d) => d.id === x)));
    setEtape(2);
  };

  const toggleJour = (id: string) =>
    setJours((j) => (j.includes(id) ? j.filter((x) => x !== id) : [...j, id]));

  // ── Validation par étape ──
  const etapeValide = (n: number): boolean => {
    switch (n) {
      case 1:
        if (!parcours || !eleveId || parcoursBloque) return false;
        if (eleveId === "nouveau" && (!nouvelEleve.prenom.trim() || !nouvelEleve.nom.trim())) return false;
        return !!dateEffective && age !== null;
      case 2:
        return !!tranche && jours.length > 0;
      case 3:
        return pourquoi.trim().length >= MIN_POURQUOI && projet.trim().length >= MIN_PROJET && esprit.trim().length >= MIN_ESPRIT;
      case 4:
        return disciplinesParcours.every((d) => evals[d.id] > 0);
      case 5:
        return videoMode === "upload" ? video !== null : /^https?:\/\/\S{6,}$/.test(videoLink.trim());
      case 6:
        return droitImage !== null && (!reduction || justificatif !== null);
      default:
        return false;
    }
  };

  // ── Fichiers ──
  const choisirVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!VIDEO_TYPES.includes(f.type)) return setErreur("Format vidéo non supporté. Utilise MP4, MOV ou AVI.");
    if (f.size > VIDEO_MAX) return setErreur("La vidéo dépasse 200 MB. Compresse-la, ou envoie plutôt un lien.");
    setErreur(null);
    setVideo(f);
  };

  const choisirJustificatif = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!JUSTIF_TYPES.includes(f.type)) return setErreur("Justificatif : PDF, JPG, PNG ou WEBP uniquement.");
    if (f.size > JUSTIF_MAX) return setErreur("Le justificatif dépasse 10 MB.");
    setErreur(null);
    setJustificatif(f);
  };

  // ── Envoi ──
  const envoyer = async () => {
    if (!parcours || !tranche || !eleveId) return;
    setErreur(null);

    try {
      // 1. Justificatif de ménage (stockage privé)
      let justificatifPath: string | null = null;
      if (reduction && justificatif) {
        setEnvoi("justificatif");
        const fd = new FormData();
        fd.append("file", justificatif);
        const r = await fetch("/api/candidature/justificatif", { method: "POST", body: fd });
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error ?? "Envoi du justificatif impossible");
        justificatifPath = d.path;
      }

      // 2. Vidéo (même circuit qu'avant : URL signée Supabase, puis URL de lecture)
      let videoUrl: string | null = null;
      if (videoMode === "upload" && video) {
        setEnvoi("video");
        setProgression(0);
        const presign = await fetch("/api/candidature/presign-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email, parcours,
            filename: video.name, contentType: video.type, fileSize: video.size,
          }),
        });
        if (presign.status === 507) {
          setVideo(null);
          setVideoMode("link");
          if (videoRef.current) videoRef.current.value = "";
          setEtape(5);
          setEnvoi("idle");
          setErreur(
            "L'envoi de fichiers vidéo est momentanément saturé. Envoie plutôt un lien YouTube ou Google Drive : ça fonctionne exactement pareil."
          );
          return;
        }
        if (!presign.ok) throw new Error("Impossible de préparer l'envoi de la vidéo");
        const { uploadUrl, storagePath } = await presign.json();

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.addEventListener("progress", (ev) => {
            if (ev.lengthComputable) setProgression(Math.round((ev.loaded / ev.total) * 100));
          });
          xhr.addEventListener("load", () =>
            xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Envoi de la vidéo échoué (${xhr.status})`))
          );
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
        videoUrl = (await sign.json()).readUrl;
      }

      // 3. Candidature
      setEnvoi("candidature");
      const r = await fetch("/api/candidature/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eleveId: eleveId === "nouveau" ? null : eleveId,
          nouvelEleve: eleveId === "nouveau" ? nouvelEleve : null,
          dateNaissance: doitSaisirDate ? dateNaissance : null,
          parcours, tranche, jours,
          pourquoi, projet, esprit_creastar: esprit,
          // Seulement les disciplines du parcours choisi
          ...Object.fromEntries(disciplinesParcours.map((d) => [d.id, evals[d.id]])),
          video_url: videoUrl,
          video_link: videoMode === "link" ? videoLink.trim() : null,
          telephone, infos_sante: infosSante,
          droit_image: droitImage,
          reduction_menage: reduction,
          justificatif_path: justificatifPath,
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error ?? "Erreur lors de l'envoi de la candidature");

      setEnvoye(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setEnvoi("idle");
    }
  };

  // ─── ÉCRAN DE CONFIRMATION ──────────────────────────────────────────────────
  if (envoye) {
    const label = PARCOURS_ANNUELS.find((p) => p.id === parcours)?.label ?? "";
    return (
      <main className="flex min-h-screen items-center justify-center bg-[rgb(239,244,239)] px-6 py-24">
        <div className="w-full max-w-lg rounded-[28px] border border-black/8 bg-white p-8 text-center shadow-[0_8px_40px_rgba(0,0,0,0.06)] sm:p-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary">✓</div>
          <h1 className="text-2xl font-semibold tracking-tight text-black">Candidature envoyée !</h1>
          <p className="mt-3 text-sm leading-7 text-black/60">
            La candidature de <strong className="text-black">{prenomEleve}</strong> pour le parcours{" "}
            <strong className="text-primary">{label}</strong> est bien arrivée. On lit chaque dossier avec
            attention : tu reçois une réponse par mail dans la semaine.
          </p>
          <div className="mt-6 rounded-[16px] bg-[rgb(239,244,239)] px-5 py-4 text-left text-sm leading-6 text-black/65">
            <p className="font-semibold text-black/80">Et ensuite ?</p>
            <p className="mt-1">
              Si la candidature est acceptée, tu paies un acompte pour réserver la place. Le jour définitif
              est confirmé une fois les groupes composés, et c'est seulement à ce moment-là que tu reçois la
              facture du trimestre ou de l'année.
            </p>
          </div>
          <Link
            href="/plateforme/dashboard"
            className="mt-7 inline-flex rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white transition hover:bg-primary-strong"
          >
            Suivre ma candidature →
          </Link>
        </div>
      </main>
    );
  }

  // ─── FORMULAIRE ─────────────────────────────────────────────────────────────
  const enCours = envoi !== "idle";

  return (
    <main className="min-h-screen bg-[rgb(239,244,239)] px-4 pb-20 pt-28 sm:px-6">
      <div className="mx-auto w-full max-w-2xl">

        {/* En-tête */}
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/40">Candidature · Parcours annuels</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black sm:text-4xl">Rejoindre Crea'Star</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/55">
            Pas d'audition, pas de niveau minimum. On cherche des personnes motivées, prêtes à travailler.
          </p>
        </div>

        {/* Progression */}
        <div className="mb-6 flex items-center gap-1.5">
          {ETAPES.map((nom, i) => {
            const n = i + 1;
            return (
              <div key={nom} className="flex-1">
                <div className={`h-1.5 rounded-full transition ${n <= etape ? "bg-primary" : "bg-black/10"}`} />
                <p className={`mt-2 hidden text-[11px] font-medium sm:block ${n === etape ? "text-primary" : "text-black/35"}`}>
                  {n}. {nom}
                </p>
              </div>
            );
          })}
        </div>

        <div className="rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_8px_40px_rgba(0,0,0,0.05)] sm:p-9">

          {/* ── ÉTAPE 1 : ÉLÈVE & PARCOURS ── */}
          {etape === 1 && (
            <div className="space-y-7">
              <div>
                <h2 className="text-lg font-semibold text-black">Qui inscris-tu ?</h2>
                <p className="mt-1 text-sm text-black/50">Toi-même ou un membre de ton foyer.</p>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                {eleves.map((e) => (
                  <Choix
                    key={e.id}
                    actif={eleveId === e.id}
                    onClick={() => setEleveId(e.id)}
                    titre={`${e.prenom} ${e.nom}`}
                    sousTitre={e.date_naissance ? `${ageAu(e.date_naissance)} ans à la rentrée` : "Date de naissance à compléter"}
                  />
                ))}
                <Choix
                  actif={eleveId === "nouveau"}
                  onClick={() => setEleveId("nouveau")}
                  titre="+ Une autre personne"
                  sousTitre="Ajouter un élève à ton foyer"
                />
              </div>

              {eleveId === "nouveau" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label required>Prénom</Label>
                    <input className={champ} value={nouvelEleve.prenom}
                      onChange={(e) => setNouvelEleve((x) => ({ ...x, prenom: e.target.value }))} />
                  </div>
                  <div>
                    <Label required>Nom</Label>
                    <input className={champ} value={nouvelEleve.nom}
                      onChange={(e) => setNouvelEleve((x) => ({ ...x, nom: e.target.value }))} />
                  </div>
                </div>
              )}

              {doitSaisirDate && (
                <div className="sm:max-w-[50%]">
                  <Label required>Date de naissance</Label>
                  <input type="date" className={champ} value={dateNaissance}
                    onChange={(e) => setDateNaissance(e.target.value)} />
                </div>
              )}

              <div>
                <h2 className="text-lg font-semibold text-black">Quel parcours ?</h2>
                <div className="mt-3 grid gap-2.5">
                  {PARCOURS_ANNUELS.map((p) => (
                    <Choix key={p.id} actif={parcours === p.id} onClick={() => setParcours(p.id)}
                      titre={p.label} sousTitre={p.accroche} />
                  ))}
                </div>
              </div>

              {parcoursBloque && (
                <p className="rounded-[14px] bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
                  Une candidature est déjà en cours pour {prenomEleve} dans ce parcours. Tu peux suivre son
                  avancement depuis <Link href="/plateforme/dashboard" className="font-semibold underline">ton espace</Link>.
                </p>
              )}

              {age !== null && age < 12 && (
                <p className="rounded-[14px] bg-[rgb(239,244,239)] px-4 py-3 text-sm leading-6 text-black/65">
                  À {age} ans à la rentrée, {prenomEleve || "l'élève"} est plus jeune que les groupes des parcours
                  (dès 12 ans). Pour les 8–12 ans, on propose l'<strong>initiation</strong> le mercredi après-midi,
                  et l'<strong>éveil musical</strong> pour les 4–8 ans. Tu peux tout de même candidater :
                  la direction en discutera avec toi.
                </p>
              )}
            </div>
          )}

          {/* ── ÉTAPE 2 : CRÉNEAU ── */}
          {etape === 2 && parcours && (
            <div className="space-y-7">
              <div>
                <h2 className="text-lg font-semibold text-black">Dans quel groupe d'âge ?</h2>
                <p className="mt-1 text-sm leading-6 text-black/50">
                  {conseillee
                    ? <>On te conseille le groupe <strong className="text-black/75">{TRANCHES.find((t) => t.id === conseillee)?.label}</strong>. Tu peux en choisir un autre si {prenomEleve} s'y sentira mieux : la direction confirmera.</>
                    : <>Choisis le groupe dans lequel {prenomEleve} se sentira le mieux : la direction confirmera.</>}
                </p>
                <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {TRANCHES.map((t) => (
                    <Choix key={t.id} actif={tranche === t.id} onClick={() => setTranche(t.id)}
                      titre={t.label + (t.id === conseillee ? " · conseillé" : "")}
                      sousTitre={t.horaire} />
                  ))}
                </div>
              </div>

              {tranche && (
                <div>
                  <h2 className="text-lg font-semibold text-black">Quels jours sont possibles ?</h2>
                  <p className="mt-1 text-sm leading-6 text-black/50">
                    Coche <strong className="text-black/70">tous</strong> les jours où {prenomEleve} peut venir, de{" "}
                    {horaireDeTranche(tranche)}. Plus tu en coches, plus on a de chances de te trouver une place.
                  </p>
                  <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                    {JOURS_PARCOURS[parcours].map((j) => (
                      <button
                        key={j.id}
                        type="button"
                        onClick={() => toggleJour(j.id)}
                        className={`flex items-center gap-3 rounded-[16px] border px-4 py-3.5 text-left transition ${
                          jours.includes(j.id) ? "border-primary bg-primary/6 ring-2 ring-primary/15" : "border-black/10 bg-white hover:border-black/20"
                        }`}
                      >
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${
                          jours.includes(j.id) ? "border-primary bg-primary text-white" : "border-black/20"
                        }`}>
                          {jours.includes(j.id) ? "✓" : ""}
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-black/80">{j.label}</span>
                          <span className="block text-xs text-black/45">{horaireDeTranche(tranche)}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-4 rounded-[14px] bg-[rgb(239,244,239)] px-4 py-3 text-xs leading-5 text-black/55">
                    Les groupes sont composés une fois les inscriptions clôturées. Si deux jours sont proposés mais
                    qu'il n'y a pas assez d'inscrits, ils peuvent être regroupés sur un seul jour. Si ce jour n'est
                    pas possible pour toi, ton acompte t'est remboursé.
                  </p>
                </div>
              )}

              <div className="rounded-[14px] border border-black/8 px-4 py-3 text-xs leading-5 text-black/55">
                <strong className="text-black/70">Sessions spectacle :</strong> en plus du cours de la semaine, une
                session de travail collectif a lieu une semaine sur deux (le samedi, ou le mercredi soir pour les 25 ans et +).
              </div>
            </div>
          )}

          {/* ── ÉTAPE 3 : MOTIVATION ── */}
          {etape === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-black">Ta motivation</h2>
                <p className="mt-1 text-sm leading-6 text-black/50">
                  Réponds avec tes mots, sans chercher à bien faire. C'est ce qui nous aide le plus à te connaître.
                  {prenomEleve ? ` Idéalement, c'est ${prenomEleve} qui répond, pas un parent.` : ""}
                </p>
              </div>
              <div>
                <Label required>Pourquoi as-tu envie de rejoindre ce parcours ?</Label>
                <textarea rows={5} className={`${champ} resize-none`} value={pourquoi} onChange={(e) => setPourquoi(e.target.value)} />
                <Compteur valeur={pourquoi} min={MIN_POURQUOI} />
              </div>
              <div>
                <Label required>Qu'aimerais-tu avoir accompli à la fin de l'année ?</Label>
                <textarea rows={4} className={`${champ} resize-none`} value={projet} onChange={(e) => setProjet(e.target.value)} />
                <Compteur valeur={projet} min={MIN_PROJET} />
              </div>
              <div>
                <Label required>Le travail de groupe et la régularité, ça représente quoi pour toi ?</Label>
                <textarea rows={4} className={`${champ} resize-none`} value={esprit} onChange={(e) => setEsprit(e.target.value)} />
                <Compteur valeur={esprit} min={MIN_ESPRIT} />
              </div>
            </div>
          )}

          {/* ── ÉTAPE 4 : NIVEAU ── */}
          {etape === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-black">Où en es-tu aujourd'hui ?</h2>
                <p className="mt-1 text-sm leading-6 text-black/50">
                  Aucune bonne ou mauvaise réponse : ça nous aide à composer des groupes équilibrés.
                </p>
              </div>
              {disciplinesParcours.map((d) => (
                <div key={d.id}>
                  <p className="mb-2 text-sm font-semibold text-black/80">{d.name}</p>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-5">
                    {d.levels.map((lvl, i) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setEvals((x) => ({ ...x, [d.id]: i + 1 }))}
                        className={`rounded-[12px] border px-2.5 py-2 text-xs leading-4 transition ${
                          evals[d.id] === i + 1
                            ? "border-primary bg-primary text-white"
                            : "border-black/10 bg-white text-black/60 hover:border-black/25"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── ÉTAPE 5 : VIDÉO ── */}
          {etape === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-black">Ta vidéo de présentation</h2>
                <p className="mt-1 text-sm leading-6 text-black/50">
                  1 à 3 minutes : présente-toi, puis chante, danse ou joue ce que tu veux. Un téléphone suffit,
                  on ne juge pas la qualité de l'image. Elle sert à te placer dans le groupe qui te convient.
                </p>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <Choix actif={videoMode === "upload"} onClick={() => setVideoMode("upload")}
                  titre="Envoyer un fichier" sousTitre="MP4, MOV ou AVI · 200 MB max" />
                <Choix actif={videoMode === "link"} onClick={() => setVideoMode("link")}
                  titre="Partager un lien" sousTitre="YouTube (non répertorié) ou Google Drive" />
              </div>

              {videoMode === "upload" ? (
                <div>
                  <input ref={videoRef} type="file" accept={VIDEO_TYPES.join(",")} onChange={choisirVideo} className="hidden" />
                  <button
                    type="button"
                    onClick={() => videoRef.current?.click()}
                    className="w-full rounded-[18px] border-2 border-dashed border-black/12 bg-[rgb(249,250,249)] px-6 py-10 text-center transition hover:border-primary/40"
                  >
                    {video ? (
                      <>
                        <span className="block text-sm font-semibold text-primary">✓ {video.name}</span>
                        <span className="mt-1 block text-xs text-black/45">
                          {(video.size / 1024 / 1024).toFixed(1)} MB · cliquer pour changer
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="block text-sm font-semibold text-black/70">Choisir une vidéo</span>
                        <span className="mt-1 block text-xs text-black/40">Elle sera envoyée au moment de valider la candidature</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div>
                  <Label required>Lien de la vidéo</Label>
                  <input className={champ} placeholder="https://…" value={videoLink} onChange={(e) => setVideoLink(e.target.value)} />
                  <p className="mt-1.5 text-xs text-black/40">Vérifie que le lien est accessible sans connexion.</p>
                </div>
              )}
            </div>
          )}

          {/* ── ÉTAPE 6 : INFOS PRATIQUES ── */}
          {etape === 6 && (
            <div className="space-y-7">
              <div>
                <h2 className="text-lg font-semibold text-black">Dernières infos</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Téléphone de contact</Label>
                  <input type="tel" className={champ} placeholder="+32 4XX XX XX XX" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
                </div>
                <div>
                  <Label>Email</Label>
                  <input className={`${champ} bg-black/[0.03] text-black/50`} value={email} disabled />
                </div>
              </div>

              <div>
                <Label>Santé : quelque chose qu'on doit savoir ?</Label>
                <textarea rows={3} className={`${champ} resize-none`} value={infosSante}
                  placeholder="Allergie, asthme, blessure, besoin particulier… Laisse vide si rien à signaler."
                  onChange={(e) => setInfosSante(e.target.value)} />
              </div>

              <div>
                <Label required>Droit à l'image</Label>
                <p className="mb-3 text-xs leading-5 text-black/50">
                  Photos et vidéos prises pendant les cours et les spectacles, partagées dans le groupe WhatsApp
                  de l'école et sur nos réseaux.
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
                      Si une autre personne de ton foyer est inscrite à Crea'Star. Joins une composition de ménage
                      (à demander à ta commune ou via MonDossier). La direction la valide avant la facture.
                    </span>
                  </span>
                </label>
                {reduction && (
                  <div className="mt-4">
                    <input ref={justifRef} type="file" accept={JUSTIF_TYPES.join(",")} onChange={choisirJustificatif} className="hidden" />
                    <button type="button" onClick={() => justifRef.current?.click()}
                      className="w-full rounded-[14px] border border-dashed border-black/15 px-4 py-4 text-sm transition hover:border-primary/40">
                      {justificatif
                        ? <span className="font-semibold text-primary">✓ {justificatif.name}</span>
                        : <span className="text-black/55">Joindre la composition de ménage (PDF ou photo)</span>}
                    </button>
                  </div>
                )}
              </div>

              {/* Récapitulatif */}
              <div className="rounded-[18px] bg-[rgb(239,244,239)] p-5 text-sm leading-7 text-black/65">
                <p className="mb-1 font-semibold text-black/80">Récapitulatif</p>
                <p>Élève : <strong className="text-black/80">{prenomEleve}</strong>{age !== null ? ` · ${age} ans à la rentrée` : ""}</p>
                <p>Parcours : <strong className="text-black/80">{PARCOURS_ANNUELS.find((p) => p.id === parcours)?.label}</strong></p>
                <p>Groupe : <strong className="text-black/80">{TRANCHES.find((t) => t.id === tranche)?.label}</strong>{tranche ? ` · ${horaireDeTranche(tranche)}` : ""}</p>
                <p>Jours possibles : <strong className="text-black/80">
                  {parcours ? JOURS_PARCOURS[parcours].filter((j) => jours.includes(j.id)).map((j) => j.label).join(" et ") : ""}
                </strong></p>
                <p>Vidéo : <strong className="text-black/80">{videoMode === "upload" ? video?.name : "lien"}</strong></p>
              </div>
            </div>
          )}

          {/* Erreur */}
          {erreur && (
            <p className="mt-6 rounded-[14px] bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{erreur}</p>
          )}

          {/* Progression de l'envoi */}
          {enCours && (
            <div className="mt-6 rounded-[14px] bg-[rgb(239,244,239)] px-4 py-3 text-sm text-black/65">
              {envoi === "justificatif" && "Envoi du justificatif…"}
              {envoi === "video" && (
                <>
                  <p>Envoi de la vidéo… {progression}% · ne ferme pas cette page</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/10">
                    <div className="h-full bg-primary transition-all" style={{ width: `${progression}%` }} />
                  </div>
                </>
              )}
              {envoi === "candidature" && "Enregistrement de la candidature…"}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between border-t border-black/6 pt-6">
            {etape > 1 ? (
              <button type="button" onClick={() => { setErreur(null); setEtape((s) => s - 1); }} disabled={enCours}
                className="text-sm font-medium text-black/54 transition hover:text-black/80 disabled:opacity-40">
                ← Retour
              </button>
            ) : <span />}

            {etape < 6 ? (
              <button
                type="button"
                disabled={!etapeValide(etape)}
                onClick={() => { setErreur(null); if (etape === 1) allerEtape2(); else setEtape((s) => s + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continuer →
              </button>
            ) : (
              <button
                type="button"
                disabled={!etapeValide(6) || enCours}
                onClick={envoyer}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-40"
              >
                {enCours ? "Envoi en cours…" : "Envoyer ma candidature →"}
              </button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs leading-6 text-black/40">
          Tes données servent uniquement à traiter ta candidature et ne sont jamais partagées avec des tiers.
        </p>
      </div>
    </main>
  );
}