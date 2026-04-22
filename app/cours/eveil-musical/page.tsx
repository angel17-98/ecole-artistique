import Image from "next/image";
import Link from "next/link";
import Reveal from "../../components/Reveal";

// ─── DATA ────────────────────────────────────────────────────────────────────

const whatWeDo = [
  {
    eyebrow: "Écouter",
    title: "Découvrir les sons et le rythme",
    text: "Percussions corporelles, instruments simples, comptines rhythmées — l'enfant explore le monde sonore avec curiosité, sans pression et sans résultat attendu.",
  },
  {
    eyebrow: "Bouger",
    title: "Relier musique et mouvement",
    text: "La musique, ça se ressent dans le corps avant de se comprendre dans la tête. On travaille la coordination, le tempo et l'expression corporelle par le jeu et le plaisir.",
  },
  {
    eyebrow: "Chanter",
    title: "Poser la voix, ensemble",
    text: "Chansons, rondes, jeux vocaux — l'enfant découvre sa voix comme instrument naturel. Le chant collectif installe confiance en soi et écoute des autres dès le plus jeune âge.",
  },
  {
    eyebrow: "Créer",
    title: "Imaginer et s'exprimer librement",
    text: "Petites improvisations, inventions de mélodies, jeux d'expression — l'éveil musical chez Crea'Star n'est pas un cours de solfège déguisé. C'est un espace de liberté créative.",
  },
];

const forParents = [
  {
    question: "Est-ce que mon enfant a besoin de savoir lire pour suivre ?",
    answer: "Non. L'éveil musical est pensé pour des enfants en bas âge — tout passe par l'oral, le jeu et l'imitation. Zéro lecture, zéro écriture, zéro pression.",
  },
  {
    question: "Est-ce que les parents restent pendant le cours ?",
    answer: "Cela dépend de l'âge et de la formule. Pour les tout-petits, la présence d'un parent peut être encouragée. On vous indiquera le fonctionnement exact à l'inscription.",
  },
  {
    question: "Quel est le lien avec les parcours annuels Crea'Star ?",
    answer: "L'éveil musical est une porte d'entrée naturelle. Les enfants qui le souhaitent pourront rejoindre un parcours Full Artist ou Comédie Musicale dès l'âge requis — avec une base solide et un rapport à la création déjà installé.",
  },
];

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function EvelMusicalPage() {
  return (
    <main className="min-h-screen text-foreground">

      {/* ══ HERO ════════════════════════════════════════════════════════════ */}
      <section className="relative -mt-24 min-h-[68vh] overflow-hidden pt-24 lg:min-h-[64svh]">
        <div className="absolute inset-0">
          <Image
            src="/offres/eveil-musical.jpg"
            alt="Éveil musical pour enfants — Crea'Star"
            fill
            priority
            unoptimized
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,10,0.80)_0%,rgba(10,10,10,0.54)_34%,rgba(10,10,10,0.18)_68%,rgba(10,10,10,0.06)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(185,151,83,0.10),transparent_24%),radial-gradient(circle_at_right_center,rgba(22,92,71,0.12),transparent_26%)]" />
        </div>

        <div className="relative z-10 flex min-h-[68svh] items-end lg:min-h-[64svh]">
          <div className="site-shell-wide w-full px-6 pb-16 pt-36 md:px-10 lg:px-14 lg:pb-24 lg:pt-40">
            <div className="max-w-4xl">
              <Reveal>
                <p className="text-sm uppercase tracking-[0.24em] text-white/70">
                  Nos cours · Dès 4 ans
                </p>
              </Reveal>

              <Reveal delay={1}>
                <h1 className="mt-6 text-4xl font-semibold leading-[1.03] tracking-tight text-white text-balance sm:text-5xl lg:text-6xl">
                  <span className="text-[rgb(var(--accent))]">Éveil musical</span>
                  <br />
                  La musique avant les règles
                </h1>
              </Reveal>

              <Reveal delay={2}>
                <p className="mt-8 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
                  Un espace où les enfants découvrent la musique, le rythme et
                  l'expression artistique par le jeu — sans solfège, sans pression,
                  avec beaucoup de plaisir.
                </p>
              </Reveal>

              <Reveal delay={3}>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-[rgb(var(--background-soft))]"
                  >
                    Inscrire mon enfant
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-full border border-white/22 bg-white/60 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/40"
                  >
                    Poser une question
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={3}>
                <div className="mt-10 flex flex-wrap gap-x-3 gap-y-2 text-sm text-white/80">
                  <span>4 à 8 ans</span>
                  <span>•</span>
                  <span>Groupes ≤ 10 enfants</span>
                  <span>•</span>
                  <span>Aucun prérequis</span>
                  <span>•</span>
                  <span>45 min par séance</span>
                </div>
              </Reveal>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(180deg,transparent,rgba(247,244,238,0.12))]" />
      </section>

      {/* ══ ACCROCHE ════════════════════════════════════════════════════════ */}
      <section className="relative bg-[rgb(239,244,239)]">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(22,92,71,0.12),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(185,151,83,0.10),transparent)]" />

        <div className="site-shell-wide px-6 py-10 md:px-10 lg:px-14 lg:py-15">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">
            <Reveal>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-primary/82">
                  Le concept
                </p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                  Pas un cours de solfège. Une première aventure artistique.
                </h2>
                <p className="mt-6 text-base leading-8 text-black/68 sm:text-lg">
                  L'éveil musical chez Crea'Star ne cherche pas à former des petits musiciens
                  parfaits. Il cherche à installer chez l'enfant un rapport naturel, joyeux
                  et confiant à la musique, au rythme et à l'expression de soi.
                </p>
                <p className="mt-5 text-base leading-8 text-black/68 sm:text-lg">
                  Tout passe par le jeu, l'imitation, le mouvement et l'exploration collective.
                  L'enfant écoute, ressent, imite, invente — sans jamais avoir l'impression
                  d'être évalué ou comparé.
                </p>
              </div>
            </Reveal>

            <Reveal delay={1}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "4 à 8", label: "ans" },
                  { value: "≤ 15", label: "enfants par groupe" },
                  { value: "45 min", label: "par séance" },
                  { value: "0", label: "prérequis" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[24px] border border-black/6 bg-white/80 p-6 shadow-[0_10px_30px_rgba(16,16,16,0.05)] text-center"
                  >
                    <p className="text-4xl font-semibold tracking-tight text-primary">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-black/62">{stat.label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ CE QU'ON FAIT ════════════════════════════════════════════════════ */}
      <section className="relative bg-background">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(16,16,16,0.08),transparent)]" />

        <div className="site-shell-wide px-6 py-10 md:px-10 lg:px-14 lg:py-15">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm uppercase tracking-[0.24em] text-primary/82">
                Au programme
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                Ce qu'on explore ensemble, séance après séance
              </h2>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {whatWeDo.map((item, index) => (
              <Reveal key={item.title} delay={(index % 3) as 0 | 1 | 2 | 3}>
                <div className="soft-card relative h-full overflow-hidden rounded-[26px] p-8">
                  <p className="text-xs uppercase tracking-[0.22em] text-primary/76">
                    {item.eyebrow}
                  </p>
                  <h3 className="mt-4 text-xl font-semibold leading-snug">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-black/66 sm:text-base">
                    {item.text}
                  </p>
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(22,92,71,0.06),transparent_65%)]" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ QUESTIONS PARENTS — vert émeraude ═══════════════════════════════ */}
      <section className="relative overflow-hidden text-white" style={{ background: "rgb(22,92,71)" }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(185,151,83,0.14),transparent_52%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(15,75,57,0.65),transparent_55%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)]" />

        <div className="relative site-shell-wide px-6 py-10 md:px-10 lg:px-14 lg:py-15">
          <Reveal>
            <div className="mb-12">
              <p className="text-xs uppercase tracking-[0.28em] text-white/55">
                Questions fréquentes
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
                Ce que les parents nous demandent souvent
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-5 lg:grid-cols-3">
            {forParents.map((item, i) => (
              <Reveal key={i} delay={(i % 3) as 0 | 1 | 2}>
                <div className="rounded-[22px] border border-white/15 bg-white/8 p-7">
                  <p className="text-base font-semibold leading-snug">{item.question}</p>
                  <p className="mt-4 text-sm leading-7 text-white/65">{item.answer}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/faq"
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-3.5 text-sm font-medium text-white/90 transition hover:border-white/50 hover:text-white"
              >
                Voir toutes les FAQ →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ TARIF + INSCRIPTION ══════════════════════════════════════════════ */}
      <section className="relative bg-[rgb(239,244,239)]">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(22,92,71,0.10),transparent)]" />

        <div className="site-shell-wide px-6 py-10 md:px-10 lg:px-14 lg:py-15">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-20">
            <Reveal>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-primary/82">
                  Infos pratiques
                </p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl text-balance">
                  Comment inscrire son enfant ?
                </h2>
                <div className="mt-6 space-y-4 text-base leading-8 text-black/68 sm:text-lg">
                  <p>
                    L'inscription à l'éveil musical se fait directement via notre
                    formulaire de contact. Pas de candidature vidéo, pas de sélection —
                    les places sont attribuées par ordre d'arrivée.
                  </p>
                  <p>
                    Les groupes sont volontairement petits pour garantir une attention
                    réelle à chaque enfant. Si le groupe de ton enfant est complet,
                    on te place sur liste d'attente et on te prévient dès qu'une place
                    se libère.
                  </p>
                </div>

                <div className="mt-8 rounded-[20px] border border-primary/14 bg-white/80 p-6 shadow-[0_8px_24px_rgba(16,16,16,0.05)]">
                  <p className="text-sm font-semibold text-black">
                    Une question sur l'éveil musical ?
                  </p>
                  <p className="mt-2 text-sm leading-6 text-black/62">
                    Âge, contenu des séances, disponibilités, tarifs — on répond à tout
                    via le formulaire de contact.
                  </p>
                  <Link
                    href="/contact"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:gap-3"
                  >
                    Nous contacter <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            </Reveal>

            <Reveal delay={1}>
              <div className="space-y-3 lg:mt-[4.5rem]">
                {[
                  { label: "Âge", value: "4 à 8 ans" },
                  { label: "Format", value: "Groupe ≤ 15 enfants" },
                  { label: "Durée séance", value: "45 min" },
                  { label: "Tarif", value: "500 euros / an" },
                  { label: "Prérequis", value: "Aucun" },
                  { label: "Inscription", value: "Sur demande" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-[18px] border border-black/6 bg-white/80 px-5 py-3.5 shadow-[0_4px_16px_rgba(16,16,16,0.04)]"
                  >
                    <span className="text-sm text-black/56">{item.label}</span>
                    <span className="text-sm font-semibold text-primary">{item.value}</span>
                  </div>
                ))}

                <Link
                  href="/contact"
                  className="mt-2 w-full inline-flex items-center justify-center rounded-full bg-primary px-6 py-3.5 text-sm font-semibold !text-white transition hover:bg-primary-strong"
                >
                  Inscrire mon enfant
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ CTA FINAL ═══════════════════════════════════════════════════════ */}
      <section className="relative px-15 py-12 md:px-10 lg:px-20 lg:py-16">
        <div className="site-shell-wide">
          <Reveal>
            <div className="relative overflow-hidden rounded-[28px] border border-black/6 bg-[linear-gradient(135deg,rgb(255,253,249)_0%,rgb(237,244,237)_100%)] px-8 py-12 shadow-[0_20px_64px_rgba(16,16,16,0.07)] lg:px-14 lg:py-14">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(185,151,83,0.08),transparent_28%),radial-gradient(circle_at_right_bottom,rgba(22,92,71,0.08),transparent_30%)]" />

              <div className="relative grid gap-0 lg:grid-cols-[1fr_auto] lg:items-center text-center">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-primary/78">
                    Prochaine étape
                  </p>
                  <h2 className="mt-4 max-w-8xl text-2xl font-semibold leading-tight tracking-tight text-balance sm:text-3xl">
                    Ton enfant grandit — les parcours Crea'Star aussi
                  </h2>
                  <p className="mt-4 max-w-8xl text-sm leading-7 text-black/60 sm:text-base">
                    Quand il sera prêt, l'éveil musical est le premier pas naturel vers
                    les parcours Full Artist ou Comédie Musicale. Une progression pensée
                    pour grandir avec lui.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

    </main>
  );
}