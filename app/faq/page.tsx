"use client";

import Link from "next/link";
import { useState } from "react";
import Reveal from "../components/Reveal";

// ─── DATA ────────────────────────────────────────────────────────────────────

const categories = [
  {
    id: "admissions",
    label: "Admissions",
    icon: "◈",
    questions: [
      {
        q: "Faut-il un niveau minimum pour postuler ?",
        a: "Non. On ne cherche pas des élèves qui savent déjà tout faire — on cherche des personnes qui ont vraiment envie de créer et de s'investir. Le niveau technique aujourd'hui n'est pas le critère. C'est l'élan de demain qui compte. Des élèves débutants et des élèves confirmés peuvent tout à fait suivre le même parcours, dans des groupes adaptés.",
      },
      {
        q: "Comment se déroule le processus de candidature ?",
        a: "Tu remplis un formulaire de candidature en ligne avec quelques questions sur qui tu es et ce que tu veux créer. Tu y joints une courte vidéo de 2 à 3 minutes — chanter, danser, jouer, ou simplement parler de ta démarche. Pas d'audition en présentiel, pas de jury. On te répond sous 2 semaines. Si ta candidature est retenue, on te contacte pour finaliser l'inscription.",
      },
      {
        q: "À partir de quel âge peut-on rejoindre un parcours ?",
        a: "Les parcours Full Artist et Comédie Musicale sont ouverts à partir de [âge à confirmer]. L'éveil musical accueille les enfants dès 4 ans. Il n'y a pas d'âge maximum — adultes bienvenus.",
      },
      {
        q: "Combien de places sont disponibles par groupe ?",
        a: "10 à 15 élèves maximum par groupe, sans exception. Ce n'est pas un argument marketing — c'est une condition. Au-delà de 15, le suivi individuel disparaît. Chaque élève est connu, challengé et accompagné nommément.",
      },
      {
        q: "Peut-on intégrer le centre en cours d'année ?",
        a: "En principe non. Les parcours annuels démarrent en septembre et construisent une progression cohérente du premier cours jusqu'au spectacle de fin d'année. Intégrer un groupe en cours de route fragiliserait à la fois l'élève et la dynamique collective. Des exceptions peuvent être étudiées au cas par cas.",
      },
    ],
  },
  {
    id: "parcours",
    label: "Les parcours",
    icon: "◉",
    questions: [
      {
        q: "Quelle est la différence entre Full Artist et Comédie Musicale ?",
        a: "Les deux parcours incluent chant, danse et théâtre, et aboutissent à un spectacle public en fin d'année. La différence est dans l'orientation : le Full Artist est centré sur la création personnelle — chaque élève construit un projet qui lui appartient, avec une forte composante studio et écriture. La Comédie Musicale est davantage axée sur un projet collectif fort, le jeu d'ensemble et l'interprétation d'un répertoire. Si tu hésites, contacte-nous — on t'aide à choisir.",
      },
      {
        q: "Qu'est-ce que le spectacle de fin d'année exactement ?",
        a: "Un vrai spectacle public, dans une vraie salle, devant un vrai public. Pas une démonstration de fin de trimestre ou un showcase interne. Les élèves ont imaginé et construit le spectacle tout au long de l'année — mise en scène, chorégraphie, textes, studio. Le soir de la première, c'est leur œuvre collective qu'ils défendent sur scène.",
      },
      {
        q: "Est-ce que le studio d'enregistrement est inclus dans les parcours ?",
        a: "Oui. Le studio fait partie intégrante de l'expérience. Chaque groupe produit un hymne collectif annuel. Les niveaux avancés explorent leurs propres compositions. Ce n'est pas une option payante — c'est une composante du parcours.",
      },
      {
        q: "Y a-t-il des niveaux dans les parcours ?",
        a: "Oui. Les parcours Full Artist et Comédie Musicale sont organisés en 4 niveaux de progression : Fondation, Développement, Production & Performance, et Autonomie. Les élèves avancent à leur rythme, mais dans un cadre structuré qui garantit une vraie progression d'une année à l'autre.",
      },
      {
        q: "Peut-on suivre plusieurs parcours en parallèle ?",
        a: "Non. Chaque parcours demande un investissement réel — 2 heures de cours par semaine plus les répétitions et le travail personnel. Cumuler deux parcours diluerait l'engagement et la qualité du suivi. On préfère un élève pleinement investi dans un seul parcours.",
      },
    ],
  },
  {
    id: "pratique",
    label: "Organisation",
    icon: "◆",
    questions: [
      {
        q: "Quand commencent les cours ?",
        a: "Crea'Star ouvre en septembre 2028. Les premiers cours démarrent à cette date. Les candidatures pour l'année d'ouverture seront ouvertes officiellement en 2027. Les pré-inscrits dès maintenant seront contactés en priorité.",
      },
      {
        q: "Combien d'heures de cours par semaine ?",
        a: "2 heures de cours par semaine, soit environ 60 heures de formation sur l'année — hors répétitions du spectacle de fin d'année. Les sessions de répétition collective s'intensifient au printemps dans les semaines qui précèdent la première.",
      },
      {
        q: "Les cours ont-ils lieu en semaine, le week-end, ou les deux ?",
        a: "Les horaires définitifs seront communiqués en 2027. Notre intention est de proposer des créneaux qui permettent de combiner Crea'Star avec une scolarité ou une activité professionnelle. Si tu as des contraintes particulières, note-les dans ta pré-inscription.",
      },
      {
        q: "Que se passe-t-il si je dois rater un cours ?",
        a: "La vie, ça arrive. On demande un engagement sérieux — pas une présence parfaite. En cas d'absence, l'élève reste responsable de rattraper ce qui a été travaillé, avec l'aide des formateurs. Les absences répétées non justifiées peuvent compromettre la participation au spectacle de fin d'année.",
      },
      {
        q: "Crea'Star est-il reconnu ou agréé officiellement ?",
        a: "Crea'Star est un centre de formation artistique privé. Il ne délivre pas de diplôme homologué par la Fédération Wallonie-Bruxelles. Ce n'est pas notre objectif — notre objectif est de former des artistes complets et confiants, capables de créer leur propre univers. Ce que les élèves retirent de l'expérience Crea'Star, c'est une progression réelle, une présence scénique et un spectacle dont ils sont fiers.",
      },
    ],
  },
  {
    id: "tarifs",
    label: "Tarifs",
    icon: "◇",
    questions: [
      {
        q: "Quels sont les tarifs des parcours ?",
        a: "Les tarifs définitifs seront publiés en 2027, en même temps que l'ouverture officielle des candidatures. Notre intention est de proposer un tarif qui reflète la qualité de l'encadrement et des espaces — tout en restant accessible. Les pré-inscrits seront informés en avant-première.",
      },
      {
        q: "Y a-t-il des réductions famille ou fratrie ?",
        a: "Oui. Des avantages sont prévus pour les familles qui inscrivent plusieurs membres. Les détails seront communiqués avec la grille tarifaire en 2027.",
      },
      {
        q: "Qu'est-ce que le statut Premium ?",
        a: "Toute inscription à un parcours annuel inclut automatiquement le statut Premium. Il donne accès à des réductions sur la location des salles et du studio (30%), sur les cours individuels (15%) et sur les inscriptions d'autres membres de la famille (10%). C'est une façon de récompenser l'engagement des élèves qui font de Crea'Star leur centre artistique principal.",
      },
      {
        q: "Comment fonctionne la pré-inscription ?",
        a: "La pré-inscription permet d'exprimer ton intérêt pour un parcours et d'être contacté en priorité à l'ouverture des candidatures en 2027. Elle ne garantit pas ta place et n'implique aucun paiement. C'est simplement une façon de dire : je suis là, tenez-moi au courant.",
      },
    ],
  },
  {
    id: "centre",
    label: "Le centre",
    icon: "◎",
    questions: [
      {
        q: "Où est situé Crea'Star ?",
        a: "Le centre est situé dans le Brabant Wallon, à Waterloo. L'adresse exacte et les accès seront communiqués à l'approche de l'ouverture en 2028.",
      },
      {
        q: "Peut-on louer les salles et le studio sans être élève ?",
        a: "Oui. Les espaces de Crea'Star — salle de danse, scène polyvalente, salles individuelles et studio d'enregistrement — sont disponibles à la location pour les artistes, groupes et compagnies extérieurs. Consulte la page Location pour en savoir plus.",
      },
      {
        q: "Y a-t-il un parking ou comment venir ?",
        a: "Les informations pratiques d'accès seront communiquées avec l'adresse définitive du centre en 2027-2028.",
      },
    ],
  },
];

// ─── COMPOSANT ACCORDÉON ─────────────────────────────────────────────────────

function AccordionItem({ q, a, isOpen, onToggle }: {
  q: string;
  a: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-black/6 last:border-0">
      <button
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-6 py-5 text-left transition hover:text-primary"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold leading-snug sm:text-base">{q}</span>
        <span
          className={`mt-0.5 shrink-0 text-lg font-light text-black/30 transition-transform duration-300 ${isOpen ? "rotate-45 text-primary" : ""}`}
        >
          +
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <p className="pb-6 text-sm leading-7 text-black/60 sm:text-base sm:leading-8">
          {a}
        </p>
      </div>
    </div>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("admissions");
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const currentCategory = categories.find((c) => c.id === activeCategory)!;

  const filteredQuestions = search.trim().length > 1
    ? categories.flatMap((c) =>
        c.questions
          .filter(
            (q) =>
              q.q.toLowerCase().includes(search.toLowerCase()) ||
              q.a.toLowerCase().includes(search.toLowerCase())
          )
          .map((q) => ({ ...q, categoryLabel: c.label }))
      )
    : currentCategory.questions.map((q) => ({ ...q, categoryLabel: currentCategory.label }));

  const isSearching = search.trim().length > 1;

  return (
    <main className="min-h-screen text-foreground">

      {/* ══ HERO — typographique ════════════════════════════════════════════ */}
      <section className="relative bg-background pt-15 pb-14 md:pt-15 md:pb-16">
        <div className="site-shell-wide px-6 md:px-10 lg:px-14">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.28em] text-primary/78">
              À propos · FAQ
            </p>
            <div className="my-5 h-px w-12 bg-[rgb(185,151,83)]" />
            <h1 className="max-w-8xl text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Les questions qu'on nous pose le plus
            </h1>
            <p className="mt-5 max-w-8xl text-sm leading-7 text-black/56 sm:text-base sm:leading-8">
              Candidature, parcours, tarifs, organisation du centre — tout ce que tu veux
              savoir avant de te lancer. Si ta question n'est pas là, écris-nous.
            </p>
          </Reveal>

          {/* Barre de recherche */}
          <Reveal delay={1}>
            <div className="relative mt-8 max-w-lg">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 text-sm select-none">
                ⌕
              </span>
              <input
                type="search"
                placeholder="Chercher une question…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setOpenQuestion(null);
                }}
                className="w-full rounded-full border border-black/10 bg-white py-3 pl-10 pr-5 text-sm text-black placeholder:text-black/34 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10 transition"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ CONTENU ════════════════════════════════════════════════════════ */}
      <section className="relative bg-background pb-20 md:pb-24">
        <div className="site-shell-wide px-6 md:px-10 lg:px-14">
          <div className="grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-16 lg:items-start">

            {/* ── Navigation catégories — sidebar desktop, tabs mobile ── */}
            {!isSearching && (
              <Reveal>
                {/* Mobile : tabs horizontaux */}
                <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { setActiveCategory(c.id); setOpenQuestion(null); }}
                      className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                        activeCategory === c.id
                          ? "bg-[rgb(22,92,71)] text-white"
                          : "border border-black/10 text-black/60 hover:border-primary/30 hover:text-primary"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                {/* Desktop : liste verticale sticky */}
                <nav className="sticky top-28 hidden lg:block">
                  <p className="mb-4 text-[10px] uppercase tracking-[0.22em] text-black/36">
                    Catégories
                  </p>
                  <ul className="space-y-1">
                    {categories.map((c) => (
                      <li key={c.id}>
                        <button
                          onClick={() => { setActiveCategory(c.id); setOpenQuestion(null); }}
                          className={`flex w-full items-center gap-3 rounded-[14px] px-4 py-2.5 text-sm font-medium text-left transition ${
                            activeCategory === c.id
                              ? "bg-[rgb(22,92,71)] text-white"
                              : "text-black/60 hover:bg-[rgb(239,244,239)] hover:text-primary"
                          }`}
                        >
                          <span className={`text-xs ${activeCategory === c.id ? "text-white/60" : "text-black/28"}`}>
                            {c.icon}
                          </span>
                          {c.label}
                          <span className={`ml-auto text-xs ${activeCategory === c.id ? "text-white/50" : "text-black/24"}`}>
                            {c.questions.length}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>

                </nav>
              </Reveal>
            )}

            {/* ── Questions ── */}
            <div className={isSearching ? "lg:col-span-2" : ""}>
              {isSearching ? (
                <Reveal>
                  <p className="mb-6 text-sm text-black/44">
                    {filteredQuestions.length} résultat{filteredQuestions.length !== 1 ? "s" : ""} pour «&nbsp;{search}&nbsp;»
                  </p>
                  {filteredQuestions.length === 0 ? (
                    <div className="rounded-[20px] border border-black/6 bg-white p-8 text-center">
                      <p className="text-base font-medium text-black/60">Aucune question trouvée.</p>
                      <p className="mt-2 text-sm text-black/40">
                        Essaie d'autres mots-clés ou{" "}
                        <Link href="/contact" className="text-primary underline underline-offset-2">
                          contacte-nous directement
                        </Link>.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-[20px] border border-black/6 bg-white px-6 py-2 shadow-[0_6px_24px_rgba(16,16,16,0.04)]">
                      {filteredQuestions.map((item, i) => (
                        <div key={i}>
                          {i > 0 && <div className="text-[10px] uppercase tracking-[0.18em] text-black/28 py-2">{item.categoryLabel}</div>}
                          <AccordionItem
                            q={item.q}
                            a={item.a}
                            isOpen={openQuestion === `search-${i}`}
                            onToggle={() => setOpenQuestion(openQuestion === `search-${i}` ? null : `search-${i}`)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </Reveal>
              ) : (
                <Reveal>
                  <div className="mb-6 flex items-baseline gap-3">
                    <h2 className="text-xl font-semibold sm:text-2xl">
                      {currentCategory.label}
                    </h2>
                    <span className="text-sm text-black/34">
                      {currentCategory.questions.length} questions
                    </span>
                  </div>
                  <div className="rounded-[20px] border border-black/6 bg-white px-6 py-2 shadow-[0_6px_24px_rgba(16,16,16,0.04)]">
                    {currentCategory.questions.map((item, i) => (
                      <AccordionItem
                        key={i}
                        q={item.q}
                        a={item.a}
                        isOpen={openQuestion === `${activeCategory}-${i}`}
                        onToggle={() =>
                          setOpenQuestion(
                            openQuestion === `${activeCategory}-${i}` ? null : `${activeCategory}-${i}`
                          )
                        }
                      />
                    ))}
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA CONTACT — vert émeraude ════════════════════════════════════ */}
      <section className="relative text-white overflow-hidden" style={{ background: "rgb(22,92,71)" }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(185,151,83,0.14),transparent_52%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(15,75,57,0.65),transparent_55%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)]" />

        <div className="relative site-shell-wide px-30 py-10 md:px-10 lg:px-50 lg:py-10">
          <div className="grid gap-0 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-white/55">
                Une autre question ?
              </p>
              <h2 className="mt-4 max-w-5xl text-2xl font-semibold leading-tight tracking-tight text-balance sm:text-3xl">
                On répond à tout.
              </h2>
              <p className="mt-3 max-w-5xl text-sm leading-7 text-white/65">
                Candidature, tarifs, organisation, visite du centre — si tu veux en savoir plus avant de te décider, c'est le bon endroit.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-semibold !text-[rgb(22,92,71)] transition hover:bg-white/90"
              >
                Nous écrire →
              </Link>
              <Link
                href="/candidature"
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-3.5 text-sm font-medium text-white/90 transition hover:border-white/50 hover:text-white"
              >
                Déposer une candidature
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}