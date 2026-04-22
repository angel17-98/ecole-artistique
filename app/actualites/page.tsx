import Link from "next/link";
import Reveal from "../components/Reveal";

// ─── DATA ────────────────────────────────────────────────────────────────────

type MilestoneStatus = "done" | "current" | "upcoming";

const milestones: {
  date: string;
  title: string;
  description: string;
  status: MilestoneStatus;
}[] = [
  {
    date: "Décembre 2025",
    title: "Naissance du projet",
    description: "Angélie et Mélissa formalisent l'idée de Crea'Star — une école artistique de création musicale complète, ancré dans le Brabant Wallon, qui réunit scène, studio et formation sous un même toit.",
    status: "done",
  },
  {
    date: "Mars 2026",
    title: "Construction du premier centre Crea'Star",
    description: "L'infrastructure Crea'Star est pensée pour être complète avec tout sous le même toit. L'architecte établi les premiers plan pour la construction de la première école Crea'Star",
    status: "current",
  },
  {
    date: "Décembre 2026",
    title: "Lancement du site & premières pré-inscriptions",
    description: "Le site Crea'Star est en ligne. Les premières personnes expriment leur intérêt via la pré-inscription. L'équipe pédagogique commence à prendre forme.",
    status: "upcoming",
  },
  {
    date: "Janvier 2027",
    title: "Construction de l'équipe pédagogique",
    description: "Recrutement des formateurs, finalisation du programme pédagogique, et premiers contacts avec des partenaires locaux. Le projet prend sa forme définitive.",
    status: "upcoming",
  },
  {
    date: "Juillet 2027",
    title: "Ouverture officielle des candidatures",
    description: "Les tarifs sont publiés. Les candidatures pour l'année d'ouverture sont ouvertes. Les pré-inscrits sont contactés en priorité.",
    status: "upcoming",
  },
  {
    date: "Été 2028",
    title: "Aménagement & finalisation de l'école",
    description: "Les espaces sont aménagés — scène, studio, salles de danse et de coaching. Tout est prêt pour accueillir les premiers élèves.",
    status: "upcoming",
  },
  {
    date: "Septembre 2028",
    title: "Premier cours — Ouverture officielle",
    description: "Crea'Star ouvre ses portes. Les premiers groupes démarrent leur parcours. L'aventure commence.",
    status: "upcoming",
  },
];

const articles = [
  {
    slug: "pourquoi-creastar",
    date: "Avril 2025",
    category: "Le projet",
    title: "Pourquoi Crea'Star — l'histoire de deux fondatrices et ce qui manquait",
    excerpt: "Il existait des cours de chant, de danse, de théâtre. Mais pas de lieu qui réunissait tout ça dans une seule expérience cohérente. Voilà d'où vient Crea'Star.",
    readTime: "4 min",
    featured: true,
  },
  {
    slug: "spectacle-fin-annee",
    date: "Juin 2025",
    category: "Pédagogie",
    title: "Ce que sera le spectacle de fin d'année — et pourquoi ce n'est pas une démonstration",
    excerpt: "Un vrai spectacle, devant un vrai public, dans une vraie salle. Voici pourquoi c'est au cœur de tout ce qu'on fait chez Crea'Star.",
    readTime: "5 min",
    featured: false,
  },
  {
    slug: "espaces-de-ecole",
    date: "Septembre 2025",
    category: "L'école",
    title: "Comment on a pensé les espaces de l'école — de la salle de danse au studio",
    excerpt: "Scène, studio, salles individuelles, espace de vie. Chaque espace a été pensé pour que l'artiste n'ait jamais à choisir entre deux endroits.",
    readTime: "6 min",
    featured: false,
  },
];

// ─── PAGE ────────────────────────────────────────────────────────────────────

const statusConfig: Record<MilestoneStatus, { dot: string; label: string; labelStyle: string }> = {
  done: {
    dot: "bg-[rgb(22,92,71)]",
    label: "Accompli",
    labelStyle: "bg-[rgb(239,244,239)] text-[rgb(22,92,71)]",
  },
  current: {
    dot: "bg-[rgb(185,151,83)]",
    label: "En cours",
    labelStyle: "bg-[rgba(185,151,83,0.12)] text-[rgb(140,108,50)]",
  },
  upcoming: {
    dot: "bg-black/14 border border-black/10",
    label: "À venir",
    labelStyle: "bg-black/5 text-black/40",
  },
};

export default function ActualitesPage() {
  return (
    <main className="min-h-screen text-foreground">

      {/* ══ HERO ════════════════════════════════════════════════════════════ */}
      <section className="relative bg-background pt-15 pb-14 md:pt-15 md:pb-16">
        <div className="site-shell-wide px-6 md:px-10 lg:px-14">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.28em] text-primary/78">
              À propos · Actualités
            </p>
            <div className="my-5 h-px w-12 bg-[rgb(185,151,83)]" />
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Le projet, en direct
            </h1>
            <p className="mt-5 max-w-8xl text-sm leading-7 text-black/56 sm:text-base sm:leading-8">
              Crea'Star ouvre en 2028. En attendant, on construit — et on raconte. 
              Suivez l'avancement du projet, les décisions qu'on prend et les étapes 
              qui nous rapprochent du premier cours.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══ TIMELINE ════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden text-white" style={{ background: "rgb(22,92,71)" }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(185,151,83,0.14),transparent_52%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(15,75,57,0.65),transparent_55%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)]" />

        <div className="relative site-shell-wide px-6 py-10 md:px-10 lg:px-14 lg:py-15">
          <Reveal>
            <div className="mb-14">
              <p className="text-xs uppercase tracking-[0.28em] text-white/55">
                Avancement
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
                De l'idée à l'ouverture
              </h2>
            </div>
          </Reveal>

          <div className="relative">
            {/* Ligne verticale */}
            <div className="absolute left-[0.6rem] top-2 bottom-2 hidden w-px bg-white/12 sm:block" />

            <div className="space-y-0">
              {milestones.map((m, i) => {
                const cfg = statusConfig[m.status];
                const isLast = i === milestones.length - 1;
                return (
                  <Reveal key={m.date} delay={(i % 3) as 0 | 1 | 2}>
                    <div className={`relative grid gap-4 pb-10 sm:grid-cols-[2rem_1fr] sm:gap-8 ${isLast ? "pb-0" : ""}`}>
                      {/* Point */}
                      <div className="hidden sm:flex sm:flex-col sm:items-center sm:pt-1">
                        <div className={`relative z-10 h-5 w-5 rounded-full ${cfg.dot} ring-4 ring-[rgb(22,92,71)]`} />
                      </div>

                      {/* Contenu */}
                      <div className={`rounded-[20px] border p-6 transition ${
                        m.status === "done"
                          ? "border-white/15 bg-white/8"
                          : m.status === "current"
                          ? "border-[rgba(185,151,83,0.35)] bg-[rgba(185,151,83,0.08)]"
                          : "border-white/8 bg-white/4"
                      }`}>
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <span className={`rounded-full px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${cfg.labelStyle}`}>
                            {cfg.label}
                          </span>
                          <span className="text-xs text-white/45">{m.date}</span>
                        </div>
                        <h3 className={`text-base font-semibold leading-snug sm:text-lg ${m.status === "upcoming" ? "text-white/50" : "text-white"}`}>
                          {m.title}
                        </h3>
                        <p className={`mt-2 text-sm leading-7 ${m.status === "upcoming" ? "text-white/35" : "text-white/65"}`}>
                          {m.description}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══ ARTICLES ════════════════════════════════════════════════════════ */}
      <section className="relative bg-[rgb(239,244,239)] overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(22,92,71,0.10),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(185,151,83,0.10),transparent)]" />

        <div className="site-shell-wide px-6 py-10 md:px-10 lg:px-14 lg:py-15">
          <Reveal>
            <div className="mb-12">
              <p className="text-xs uppercase tracking-[0.28em] text-primary/80">
                À lire
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
                Dans les coulisses du projet
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-5 lg:grid-cols-3">
            {articles.map((a, i) => (
              <Reveal key={a.slug} delay={(i % 3) as 0 | 1 | 2}>
                <Link
                  href={`/actualites/${a.slug}`}
                  className="group flex flex-col rounded-[24px] border border-black/6 bg-white shadow-[0_6px_24px_rgba(16,16,16,0.05)] overflow-hidden transition hover:-translate-y-1 hover:border-primary/18 hover:shadow-[0_14px_40px_rgba(22,92,71,0.08)]"
                >
                  {/* Placeholder image — zone colorée en attendant les vraies photos */}
                  <div
                    className="relative h-44 w-full overflow-hidden"
                    style={{
                      background: i === 0
                        ? "linear-gradient(135deg, rgb(22,92,71), rgb(12,50,38))"
                        : i === 1
                        ? "linear-gradient(135deg, rgb(185,151,83), rgb(140,108,50))"
                        : "linear-gradient(135deg, rgb(239,244,239), rgb(210,228,210))",
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl opacity-20">
                        {i === 0 ? "★" : i === 1 ? "◎" : "◈"}
                      </span>
                    </div>
                    {a.featured && (
                      <div className="absolute top-4 left-4">
                        <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgb(22,92,71)]">
                          À la une
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="rounded-full bg-[rgb(239,244,239)] px-3 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-primary/80">
                        {a.category}
                      </span>
                      <span className="text-xs text-black/36">{a.date}</span>
                    </div>
                    <h3 className="text-base font-semibold leading-snug tracking-tight group-hover:text-primary transition sm:text-lg">
                      {a.title}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-7 text-black/56">
                      {a.excerpt}
                    </p>
                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-xs text-black/34">{a.readTime} de lecture</span>
                      <span className="text-sm font-medium text-primary opacity-0 transition group-hover:opacity-100 group-hover:translate-x-1 duration-200">
                        Lire →
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          {/* Note éditoriale */}
          <Reveal>
            <div className="mt-10 rounded-[18px] border border-primary/12 bg-white/60 px-6 py-5">
              <p className="text-sm leading-6 text-black/56">
                <span className="font-semibold text-primary">D'autres articles à venir.</span>{" "}
                On publie régulièrement sur le projet, la pédagogie et la construction de l'école.{" "}
                <Link href="/contact" className="font-medium text-primary underline underline-offset-2 hover:no-underline">
                  Une question ou une suggestion de sujet ? Écrivez-nous.
                </Link>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ CTA PRÉINSCRIPTION ══════════════════════════════════════════════ */}
      <section className="relative bg-background">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(16,16,16,0.06),transparent)]" />

        <div className="site-shell-wide px-20 py-10 md:px-10 lg:px-25 lg:py-10">
          <Reveal>
            <div className="relative overflow-hidden rounded-[28px] border border-black/6 bg-[linear-gradient(135deg,rgb(255,253,249)_0%,rgb(237,244,237)_100%)] px-8 py-12 shadow-[0_20px_64px_rgba(16,16,16,0.07)] lg:px-14 lg:py-14">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(185,151,83,0.08),transparent_28%),radial-gradient(circle_at_right_bottom,rgba(22,92,71,0.08),transparent_30%)]" />

              <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-primary/78">
                    Ouverture · Septembre 2028
                  </p>
                  <h2 className="mt-4 max-w-8xl text-2xl font-semibold leading-tight tracking-tight text-balance sm:text-3xl">
                    Tu veux être là dès le premier jour ?
                  </h2>
                  <p className="mt-4 max-w-8xl text-sm leading-7 text-black/60 sm:text-base">
                    Laisse-nous tes coordonnées. On te contacte en priorité à l'ouverture des candidatures en 2027 — bien avant la communication générale.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
                  <Link
                    href="/candidature"
                    className="inline-flex items-center justify-center rounded-full bg-[rgb(22,92,71)] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[rgb(15,75,57)]"
                  >
                    Pré-inscription →
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-full border border-black/12 px-7 py-3.5 text-sm font-medium text-black/70 transition hover:border-black/24 hover:text-black"
                  >
                    Poser une question
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

    </main>
  );
}