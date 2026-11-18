"use client";
// app/cours/parcours/ParcoursClient.tsx
// Page unique des parcours (18/11/2026). Tout le contenu est dans les constantes
// PARCOURS, COMPARATIF et FAQ ci-dessous : pour modifier un texte, un prix ou
// ajouter la vidéo bande-annonce, c'est là.

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/app/components/Reveal";
import { TRANCHES, JOURS_PARCOURS, type ParcoursAnnuel } from "@/lib/grille";
import { A_PROPOS } from "@/lib/navigation";

const VERT = "rgb(22,92,71)";
const VERT_FONCE = "rgb(12,50,38)";
const OR = "rgb(185,151,83)";

// ─── CONTENU ─────────────────────────────────────────────────────────────────

interface Periode {
  numero: string;
  titre: string;
  contenu: string[];
  texte: string;
}

interface InfosParcours {
  id: ParcoursAnnuel;
  nom: string;
  role: string;          // ce que l'élève crée
  accroche: string;
  intro: string;
  photo: string;
  prix: number;
  prixNote: string;
  chiffres: { valeur: string; label: string }[];
  semaineTitre: string;
  semaineTexte: string;
  periodes: Periode[];
  /** Adresse YouTube/Vimeo « embed » de la bande-annonce. null = bloc caché. */
  video: string | null;
}

const PARCOURS: Record<ParcoursAnnuel, InfosParcours> = {
  "full-artist": {
    id: "full-artist",
    nom: "Full Artist",
    role: "Tu crées ton identité d'artiste",
    accroche: "Ta musique, tes chansons, ta façon d'être sur scène.",
    intro:
      "Le parcours de celles et ceux qui veulent construire leur identité artistique : trouver leur voix, écrire et composer leur musique, l'enregistrer en studio et découvrir leur propre façon d'être sur scène.",
    photo: "/programmes/full-artist.jpg",
    prix: 1650,
    prixNote: "studio d'enregistrement et artistes invités inclus",
    chiffres: [
      { valeur: "2h", label: "de cours par semaine (incl. 1h de chant)" },
      { valeur: "+ 2h", label: "de création collective toutes les 2 semaines" },
      { valeur: "4", label: "périodes dans l'année" },
      { valeur: "2", label: "artistes invités par an" },
    ],
    semaineTitre: "1h de chant + 1h d'une discipline qui change à chaque période",
    semaineTexte:
      "Le chant est le fil rouge de toute l'année. La deuxième heure change de discipline au fil des périodes, dans un ordre pensé pour le spectacle : on crée d'abord, on apprend ensuite à habiter la scène.",
    periodes: [
      {
        numero: "01 · 02 (Septembre à Décembre)",
        titre: "Écrire et composer",
        contenu: ["Chant", "Écriture & Composition"],
        texte: "Tu écris tes textes et tes mélodies. Les meilleures idées peuvent déjà devenir des chansons du spectacle.",
      },
      {
        numero: "03 (Janvier à Février)",
        titre: "Être à l'aise dans son corps",
        contenu: ["Chant", "Théâtre, impro & expression corporelle"],
        texte: "Se sentir bien en jouant et en étant mis en avant. Du mouvement, pas de la danse technique.",
      },
      {
        numero: "04 (Mars à Mai)",
        titre: "Monter sur scène",
        contenu: ["Chant", "Expression scénique"],
        texte: "Présence, regard, intention : tout converge vers le spectacle et les prestations de fin d'année.",
      },
    ],
    video: null,
  },
  "comedie-musicale": {
    id: "comedie-musicale",
    nom: "Comédie musicale",
    role: "Tu crées ta comédie musicale",
    accroche: "Le texte, l'histoire, la mise en scène, puis l'interprétation.",
    intro:
      "Le parcours de celles et ceux qui veulent créer leur propre comédie musicale : écrire le texte et l'histoire avec le groupe, la mettre en scène, puis l'interpréter en chantant, en dansant et en jouant, du premier au dernier cours.",
    photo: "/programmes/comedie-musicale.jpg",
    prix: 1450,
    prixNote: "studio et artistes invités en option",
    chiffres: [
      { valeur: "2h", label: "de cours par semaine" },
      { valeur: "4", label: "disciplines en alternance" },
      { valeur: "+ 2h", label: "de création collective toutes les 2 semaines" },
      { valeur: "1", label: "spectacle créé ensemble" },
    ],
    semaineTitre: "Deux semaines qui alternent, pour avancer sur tous les fronts",
    semaineTexte:
      "Une semaine sur deux, tu travailles la technique : chant et danse. L'autre semaine, tu construis le spectacle : écriture, mise en scène et théâtre. La création avance ainsi tout au long de l'année.",
    periodes: [
      {
        numero: "Semaine 1",
        titre: "La technique",
        contenu: ["1h de chant", "1h de danse"],
        texte: "Voix, justesse, chorégraphies : les bases pour tenir un rôle chanté et dansé.",
      },
      {
        numero: "Semaine 2",
        titre: "La création",
        contenu: ["1h d'écriture & mise en scène", "1h de théâtre"],
        texte: "Écrire les scènes, construire les personnages, mettre le spectacle en place.",
      },
    ],
    video: null,
  },
};

const ORDRE: ParcoursAnnuel[] = ["full-artist", "comedie-musicale"];

/** Comparatif : une ligne = un critère, [Full Artist, Comédie musicale] */
const COMPARATIF: { critere: string; valeurs: Record<ParcoursAnnuel, string> }[] = [
  { critere: "Le cœur du parcours", valeurs: { "full-artist": "Créer son identité artistique : sa musique, sa façon d'être sur scène", "comedie-musicale": "Créer sa comédie musicale : le texte, l'histoire, et l'interpréter" } },
  { critere: "Chaque semaine",      valeurs: { "full-artist": "1h de chant + 1h de discipline complémentaire", "comedie-musicale": "En alternance : chant + danse, puis écriture & mise en scène + théâtre" } },
  { critere: "Disciplines",         valeurs: { "full-artist": "Chant, écriture & composition, théâtre & expression corporelle, expression scénique", "comedie-musicale": "Chant, danse, théâtre, écriture & mise en scène, expression scénique" } },
  { critere: "Studio d'enregistrement", valeurs: { "full-artist": "Inclus", "comedie-musicale": "En option, avec le Pack Studio & Artistes (+200 €)" } },
  { critere: "Artistes invités",    valeurs: { "full-artist": "min. 2 interventions par an", "comedie-musicale": "En option, avec le Pack Studio & Artistes (+200 €)" } },
  { critere: "Samedis collectifs et spectacle", valeurs: { "full-artist": "Inclus", "comedie-musicale": "Inclus" } },
  { critere: "Jours",               valeurs: { "full-artist": "Mardi ou vendredi", "comedie-musicale": "Lundi ou jeudi" } },
  { critere: "Prix de l'année",     valeurs: { "full-artist": "1 650 €", "comedie-musicale": "1 450 €" } },
];

/** Option de la Comédie musicale : le studio et les artistes invités du Full Artist */
const PACK_STUDIO_ARTISTES = {
  nom: "Pack Studio & Artistes",
  supplement: 200,
  texte: "Ajoute à ta Comédie musicale le studio d'enregistrement et les deux interventions d'artistes invités du Full Artist.",
  places: "Places limitées",
};

/**
 * La Bourse Crea'Star. Tant que la page /bourse n'est pas en ligne
 * (pret: false dans lib/navigation.ts), les liens mènent à la page Contact.
 */
const BOURSE = {
  accroche: "Le prix ne doit pas arrêter un talent.",
  lienPage: "Découvrir la Bourse Crea'Star",
  lienContact: "Parle-nous de la Bourse Crea'Star",
};

const AVANTAGES_PREMIUM = [
  { valeur: "−30 %", texte: "sur la location des salles et du studio" },
  { valeur: "−15 %", texte: "sur les cours individuels" },
  { valeur: "−10 %", texte: "pour les membres du ménage", note: "composition de ménage demandée" },
];

const FAQ: { question: string; reponse: string; lien?: "bourse" }[] = [
  {
    question: "Faut-il déjà avoir de l'expérience ?",
    reponse:
      "Non. Les deux parcours sont ouverts à tous les niveaux, sur candidature : on te demande ta motivation et une courte vidéo, pour bien te placer dans un groupe.",
  },
  {
    question: "Comment choisir entre les deux ?",
    reponse:
      "Les deux parcours sont des parcours de création. Si tu as envie de construire ton univers d'artiste (ta voix, tes chansons, ta présence sur scène), c'est le Full Artist. Si tu as envie d'inventer une histoire avec un groupe, de l'écrire, de la mettre en scène et de la jouer en chantant et en dansant, c'est la Comédie musicale. Dans les deux cas, tu montes sur la même scène au spectacle de fin d'année. Tu hésites encore ? Écris-nous, on en parle.",
  },
  {
    question: "Et si j'arrête en cours d'année ?",
    reponse:
      "L'inscription vaut pour toute l'année, parce que chaque élève a sa place dans le spectacle. Tu peux arrêter à la fin de la 1re ou de la 2e période en nous prévenant par écrit. Après, les rôles sont distribués et l'année est due.",
  },
  {
    question: "Comment se passe le paiement ?",
    reponse:
      "Tu choisis entre un paiement en 4 fois (une fois par période) ou en une seule fois, avec une réduction. Les détails sont dans les conditions générales.",
  },
  {
    question: "Je fais la Comédie musicale : est-ce que je peux aussi aller en studio ?",
    reponse:
      "Oui, avec le Pack Studio & Artistes : pour 200 € de plus sur l'année, tu as accès au studio d'enregistrement et aux deux interventions d'artistes invités, comme en Full Artist. Les places sont limitées.",
  },
  {
    question: "Je n'ai pas les moyens : est-ce que je peux quand même m'inscrire ?",
    reponse:
      "Oui, parles-en avec nous. La Bourse Crea'Star soutient les élèves motivés et talentueux pour qui le prix serait un frein. Elle est financée en partie par nos partenaires.",
    lien: "bourse",
  },
];

// ─── PETITS COMPOSANTS ───────────────────────────────────────────────────────

const euros = (n: number) => `${n.toLocaleString("fr-BE")} €`;

function Selecteur({ actif, onChange, sombre = false }: { actif: ParcoursAnnuel; onChange: (p: ParcoursAnnuel) => void; sombre?: boolean }) {
  return (
    <div
      role="tablist"
      aria-label="Choisir un parcours"
      className={`inline-flex rounded-full p-1 ${sombre ? "bg-white/10" : "bg-black/[0.05]"}`}
    >
      {ORDRE.map((id) => {
        const selectionne = id === actif;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={selectionne}
            onClick={() => onChange(id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition sm:px-5 ${
              selectionne
                ? "text-white shadow-[0_4px_14px_rgba(0,0,0,0.15)]"
                : sombre ? "text-white/70 hover:text-white" : "text-black/55 hover:text-black"
            }`}
            style={selectionne ? { background: id === "full-artist" ? VERT : OR } : undefined}
          >
            {PARCOURS[id].nom}
          </button>
        );
      })}
    </div>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function ParcoursClient({ initial }: { initial: ParcoursAnnuel }) {
  const [actif, setActif] = useState<ParcoursAnnuel>(initial);
  const p = PARCOURS[actif];
  const couleur = actif === "full-artist" ? VERT : OR;

  // La Bourse n'apparaît que quand sa page est en ligne (lib/navigation.ts)
  const pageBoursePrete = A_PROPOS.flatMap((g) => g.liens).some((l) => l.href === "/bourse" && l.pret);
  const lienBourse = pageBoursePrete
    ? { href: "/bourse", label: BOURSE.lienPage }
    : { href: "/contact", label: BOURSE.lienContact };

  const choisir = (id: ParcoursAnnuel) => {
    setActif(id);
    // Met à jour l'adresse (lien partageable) sans recharger la page
    const url = new URL(window.location.href);
    url.searchParams.set("p", id);
    window.history.replaceState(null, "", url.toString());
  };

  const lienInscription = `/candidature?parcours=${actif}`;

  return (
    <main className="min-h-screen text-foreground">

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="relative -mt-24 overflow-hidden pt-24" style={{ background: VERT_FONCE }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(185,151,83,0.22),transparent_55%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.05),transparent_45%)]" />
        <div className="relative site-shell-wide px-6 pb-14 pt-12 md:px-10 md:pb-16 md:pt-16 lg:px-14">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.28em] text-white/50">Cours collectifs · Parcours annuels</p>
            <div className="my-5 h-px w-12" style={{ background: OR }} />
            <h1 className="max-w-8xl text-4xl font-semibold leading-[1.05] tracking-tight text-white text-balance sm:text-5xl lg:text-[3.4rem]">
              Un même spectacle, deux façons d&apos;y participer
            </h1>
            <p className="mt-6 max-w-8xl text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
              Deux parcours d&apos;un an, 2h par semaine, tous les deux tournés vers la création. Le Full Artist crée son
              identité d&apos;artiste, la Comédie musicale crée sa pièce. Un samedi sur deux, les deux groupes se retrouvent
              pour construire un seul et même spectacle de fin d&apos;année.
            </p>
          </Reveal>

          {/* Les deux cartes servent aussi de sélecteur */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {ORDRE.map((id) => {
              const c = PARCOURS[id];
              const selectionne = id === actif;
              return (
                <button
                  key={id}
                  onClick={() => choisir(id)}
                  aria-pressed={selectionne}
                  className={`group relative min-h-[240px] overflow-hidden rounded-[28px] text-left transition duration-300 ${
                    selectionne ? "ring-2 ring-[rgb(185,151,83)]" : "opacity-75 hover:opacity-100"
                  }`}
                >
                  <Image src={c.photo} alt={`Parcours ${c.nom}`} fill unoptimized className="object-cover object-top transition duration-500 group-hover:scale-[1.03]" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05)_20%,rgba(0,0,0,0.82)_100%)]" />
                  <div className="relative flex h-full min-h-[240px] flex-col justify-end p-6 sm:p-7">
                    <span className="mb-3 inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white" style={{ background: id === "full-artist" ? VERT : OR }}>
                      {c.role}
                    </span>
                    <p className="text-2xl font-semibold text-white sm:text-3xl">{c.nom}</p>
                    <p className="mt-1 text-sm text-white/75">{c.accroche}</p>
                    <p className="mt-3 text-sm font-semibold text-white/90">{euros(c.prix)} · l&apos;année</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ BARRE DE SÉLECTION (reste visible en défilant) ═══════════════════ */}
      <div className="sticky top-[88px] z-30 border-b border-black/6 bg-white/90 backdrop-blur-md">
        <div className="site-shell-wide flex items-center justify-between gap-4 px-6 py-3 md:px-10 lg:px-14">
          <Selecteur actif={actif} onChange={choisir} />
          <Link
            href={lienInscription}
            className="hidden rounded-full px-5 py-2.5 text-sm font-semibold !text-white transition hover:brightness-110 sm:inline-flex"
            style={{ background: couleur }}
          >
            S&apos;inscrire en {p.nom}
          </Link>
        </div>
      </div>

      {/* ══ L'ESSENTIEL ═══════════════════════════════════════════════════════ */}
      <section className="relative bg-background">
        <div className="site-shell-wide px-6 py-14 md:px-10 lg:px-14 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
            <div key={`intro-${actif}`}>
              <p className="text-xs uppercase tracking-[0.26em]" style={{ color: couleur }}>{p.role}</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
                Parcours {p.nom}
              </h2>
              <p className="mt-5 text-base leading-8 text-black/65">{p.intro}</p>
              <p className="mt-4 text-sm leading-7 text-black/50">
                Un parcours qui se poursuit sur 1 à 4 ans : chaque année, le niveau et les projets évoluent avec toi.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {p.chiffres.map((c) => (
                <div key={c.label} className="rounded-[22px] border border-black/6 bg-white px-5 py-6 shadow-[0_4px_16px_rgba(16,16,16,0.04)]">
                  <p className="text-3xl font-semibold" style={{ color: couleur }}>{c.valeur}</p>
                  <p className="mt-1 text-sm leading-6 text-black/55">{c.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ TON ANNÉE ═════════════════════════════════════════════════════════ */}
      <section className="relative bg-[rgb(239,244,239)]">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(22,92,71,0.12),transparent)]" />
        <div className="site-shell-wide px-6 py-14 md:px-10 lg:px-14 lg:py-20">
          <p className="text-xs uppercase tracking-[0.26em] text-primary/80">Ta semaine, ton année</p>
          <h2 className="mt-4 max-w-8xl text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
            {p.semaineTitre}
          </h2>
          <p className="mt-4 max-w-8xl text-sm leading-7 text-black/60 sm:text-base">{p.semaineTexte}</p>

          <div className={`mt-10 grid gap-4 ${p.periodes.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
            {p.periodes.map((per) => (
              <div key={per.numero} className="rounded-[24px] border border-black/6 bg-white p-6 shadow-[0_4px_16px_rgba(16,16,16,0.04)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: couleur }}>
                  {actif === "full-artist" ? `Période ${per.numero}` : per.numero}
                </p>
                <p className="mt-3 text-xl font-semibold">{per.titre}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {per.contenu.map((c) => (
                    <span key={c} className="rounded-full bg-black/[0.04] px-3 py-1 text-xs font-medium text-black/70">{c}</span>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-6 text-black/58">{per.texte}</p>
              </div>
            ))}
          </div>

          {actif === "comedie-musicale" && (
            <div className="mt-4 rounded-[24px] p-6 text-white sm:flex sm:items-center sm:justify-between sm:gap-8" style={{ background: VERT_FONCE }}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: OR }}>En option</p>
                <p className="mt-2 text-lg font-semibold">{PACK_STUDIO_ARTISTES.nom}</p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                  {PACK_STUDIO_ARTISTES.texte} Enregistre en studio les chansons de ta comédie musicale.
                </p>
              </div>
              <p className="mt-4 shrink-0 text-2xl font-semibold sm:mt-0" style={{ color: OR }}>
                +{euros(PACK_STUDIO_ARTISTES.supplement)}
                <span className="block text-xs font-medium text-white/55">{PACK_STUDIO_ARTISTES.places.toLowerCase()}</span>
              </p>
            </div>
          )}

          {actif === "full-artist" && (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] p-6 text-white" style={{ background: VERT }}>
                <p className="text-lg font-semibold">Le studio d&apos;enregistrement</p>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  Chaque année, le groupe enregistre son hymne. Plus le niveau avance, plus tu enregistres tes propres sons et maquettes.
                </p>
              </div>
              <div className="rounded-[24px] p-6 text-white" style={{ background: VERT_FONCE }}>
                <p className="text-lg font-semibold">Deux artistes invités par an</p>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  Des artistes et des professionnels du métier viennent partager leur expérience avec le groupe. Les dates seront annoncées dans le calendrier.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══ VIDÉO (visible dès qu'une adresse est renseignée dans PARCOURS) ══ */}
      {p.video && (
        <section className="relative bg-background">
          <div className="site-shell-wide px-6 py-14 md:px-10 lg:px-14 lg:py-20">
            <div className="mx-auto max-w-4xl overflow-hidden rounded-[28px] bg-black shadow-[0_18px_60px_rgba(16,16,16,0.12)]">
              <div className="relative aspect-video">
                <iframe
                  src={p.video}
                  title={`Le parcours ${p.nom} en vidéo`}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══ LE SPECTACLE, ENSEMBLE ════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ background: VERT_FONCE }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(185,151,83,0.16),transparent_40%)]" />
        <div className="relative site-shell-wide px-6 py-14 md:px-10 lg:px-14 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-white/50">Commun aux deux parcours</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white text-balance sm:text-4xl">
                Le spectacle, on le crée ensemble
              </h2>
              <p className="mt-5 text-base leading-8 text-white/68">
                Un samedi sur deux, les élèves Full Artist et Comédie musicale de la même tranche d&apos;âge se retrouvent
                pour construire le spectacle de A à Z, en sous-groupes, chacun avec ses compétences.
              </p>
            </div>
            <ul className="space-y-3">
              {[
                { titre: "Dès la première semaine", texte: "Les samedis collectifs commencent tout de suite : on apprend à se connaître et on forme un vrai groupe." },
                { titre: "Un seul spectacle, deux univers", texte: "La comédie musicale créée par le groupe et les prestations des Full Artist se mêlent dans un même spectacle. Les chansons écrites et composées en Full Artist peuvent même rejoindre la pièce de la Comédie musicale." },
                { titre: "Un vrai spectacle public", texte: "Fin mai, dans une salle, devant un public : l'aboutissement de toute l'année." },
              ].map((item) => (
                <li key={item.titre} className="rounded-[20px] border border-white/10 bg-white/[0.06] px-5 py-4">
                  <p className="text-sm font-semibold text-white">{item.titre}</p>
                  <p className="mt-1 text-sm leading-6 text-white/62">{item.texte}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ══ COMPARATIF ════════════════════════════════════════════════════════ */}
      <section className="relative bg-background">
        <div className="site-shell-wide px-6 py-14 md:px-10 lg:px-14 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-[0.26em] text-primary/80">Comparer</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
              Les deux parcours côte à côte
            </h2>
          </div>

          <div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-[28px] border border-black/6 bg-white shadow-[0_18px_60px_rgba(16,16,16,0.06)]">
            {/* En-têtes */}
            <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)] border-b border-black/6">
              <div className="p-4 sm:p-5" />
              {ORDRE.map((id) => (
                <button
                  key={id}
                  onClick={() => choisir(id)}
                  className={`p-4 text-left transition sm:p-5 ${id === actif ? "bg-black/[0.03]" : "hover:bg-black/[0.02]"}`}
                >
                  <span className="hidden text-xs font-semibold uppercase tracking-[0.14em] sm:block" style={{ color: id === "full-artist" ? VERT : OR }}>
                    {PARCOURS[id].role}
                  </span>
                  <span className="mt-1 block text-base font-semibold sm:text-lg">{PARCOURS[id].nom}</span>
                </button>
              ))}
            </div>
            {/* Lignes */}
            {COMPARATIF.map((ligne, i) => (
              <div
                key={ligne.critere}
                className={`grid grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)] ${i < COMPARATIF.length - 1 ? "border-b border-black/5" : ""}`}
              >
                <div className="p-4 text-xs font-medium text-black/45 [overflow-wrap:anywhere] hyphens-auto sm:p-5 sm:text-sm">{ligne.critere}</div>
                {ORDRE.map((id) => (
                  <div key={id} className={`p-4 text-xs leading-5 text-black/75 sm:p-5 sm:text-sm sm:leading-6 ${id === actif ? "bg-black/[0.03] font-medium text-black" : ""}`}>
                    {ligne.valeurs[id]}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HORAIRES ══════════════════════════════════════════════════════════ */}
      <section className="relative bg-[rgb(239,244,239)]">
        <div className="site-shell-wide px-6 py-14 md:px-10 lg:px-14 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start lg:gap-16">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-primary/80">Horaires</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
                {p.nom} : le {JOURS_PARCOURS[actif].map((j) => j.label.toLowerCase()).join(" ou le ")}
              </h2>
              <p className="mt-4 text-sm leading-7 text-black/60 sm:text-base">
                À l&apos;inscription, tu indiques le ou les jours où tu peux venir. Le groupe est confirmé une fois
                les inscriptions connues. L&apos;âge conseille un groupe, mais tu peux en choisir un autre :
                la direction confirme.
              </p>
              <Link href="/cours/calendrier" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:gap-3">
                Voir le calendrier de l&apos;année <span aria-hidden>→</span>
              </Link>
            </div>
            <div className="overflow-hidden rounded-[24px] border border-black/6 bg-white">
              {TRANCHES.map((t, i) => (
                <div key={t.id} className={`flex items-center justify-between px-6 py-4 ${i < TRANCHES.length - 1 ? "border-b border-black/5" : ""}`}>
                  <span className="text-sm font-medium text-black/75">{t.label}</span>
                  <span className="text-sm font-semibold" style={{ color: couleur }}>{t.horaire}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ PRIX ══════════════════════════════════════════════════════════════ */}
      <section className="relative bg-background">
        <div className="site-shell-wide px-6 py-14 md:px-10 lg:px-14 lg:py-20">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-[32px] border border-black/6 bg-white shadow-[0_18px_60px_rgba(16,16,16,0.06)]">
            <div className="px-8 py-10 text-center sm:px-12 sm:py-12">
              <p className="text-xs uppercase tracking-[0.22em] text-primary/76">Parcours {p.nom}</p>
              <p className="mt-4 text-5xl font-semibold tracking-tight" style={{ color: couleur }}>{euros(p.prix)}</p>
              <p className="mt-2 text-sm text-black/55">pour l&apos;année · {p.prixNote}</p>
              <p className="mx-auto mt-6 max-w-xl rounded-full bg-black/[0.04] px-5 py-2.5 text-sm font-medium text-black/70">
                Inscription pour l&apos;année · paiement en 4 fois ou en une fois avec réduction
              </p>
              {actif === "comedie-musicale" && (
                <div className="mx-auto mt-6 max-w-xl rounded-[20px] border px-5 py-4 text-left" style={{ borderColor: "rgba(185,151,83,0.35)", background: "rgba(185,151,83,0.07)" }}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-black/85">Option · {PACK_STUDIO_ARTISTES.nom}</p>
                    <p className="text-sm font-semibold" style={{ color: OR }}>
                      +{euros(PACK_STUDIO_ARTISTES.supplement)} · {euros(p.prix + PACK_STUDIO_ARTISTES.supplement)} au total
                    </p>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-black/60">{PACK_STUDIO_ARTISTES.texte}</p>
                  <p className="mt-1 text-xs text-black/45">{PACK_STUDIO_ARTISTES.places}</p>
                </div>
              )}
              <p className="mt-5 text-sm text-black/55">
                {BOURSE.accroche}{" "}
                <Link href={lienBourse.href} className="font-semibold text-primary underline-offset-4 hover:underline">
                  {lienBourse.label} →
                </Link>
              </p>
              <Link
                href={lienInscription}
                className="mt-8 inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-semibold !text-white transition hover:brightness-110"
                style={{ background: couleur }}
              >
                S&apos;inscrire en {p.nom}
              </Link>
            </div>
            <div className="border-t border-black/6 bg-[rgb(247,249,247)] px-8 py-8 sm:px-10">
              <p className="text-center text-xs uppercase tracking-[0.22em] text-primary/76">
                Inclus avec ton parcours : le statut Premium
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {AVANTAGES_PREMIUM.map((a) => (
                  <div key={a.texte} className="rounded-[18px] border border-black/6 bg-white px-5 py-4 text-center">
                    <p className="text-2xl font-semibold text-primary">{a.valeur}</p>
                    <p className="mt-1 text-sm leading-6 text-black/62">{a.texte}</p>
                    {a.note && <p className="mt-1 text-xs text-black/40">{a.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ QUESTIONS ═════════════════════════════════════════════════════════ */}
      <section className="relative bg-[rgb(239,244,239)]">
        <div className="site-shell-wide px-6 py-14 md:px-10 lg:px-14 lg:py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">Questions fréquentes</h2>
            <div className="mt-8 space-y-3">
              {FAQ.map((q) => (
                <details key={q.question} className="group rounded-[20px] border border-black/6 bg-white px-6 py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold">
                    {q.question}
                    <span className="text-black/35 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-black/62">{q.reponse}</p>
                  {q.lien === "bourse" && (
                    <Link href={lienBourse.href} className="mt-2 inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline">
                      {lienBourse.label} →
                    </Link>
                  )}
                </details>
              ))}
            </div>
            <p className="mt-8 text-sm text-black/55">
              D&apos;autres questions ?{" "}
              <Link href="/faq" className="font-semibold text-primary underline-offset-4 hover:underline">Toute la FAQ</Link>
              {" · "}
              <Link href="/contact" className="font-semibold text-primary underline-offset-4 hover:underline">Nous écrire</Link>
            </p>
          </div>
        </div>
      </section>

      {/* ══ BOUTON D'INSCRIPTION FIXE SUR MOBILE ═════════════════════════════ */}
      <div className="sticky bottom-0 z-30 border-t border-black/6 bg-white/95 px-4 py-3 backdrop-blur-md sm:hidden">
        <Link
          href={lienInscription}
          className="flex w-full items-center justify-center rounded-full py-3.5 text-sm font-semibold !text-white"
          style={{ background: couleur }}
        >
          S&apos;inscrire en {p.nom} · {euros(p.prix)}
        </Link>
      </div>
    </main>
  );
}