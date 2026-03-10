import Image from "next/image";
import Link from "next/link";

const spaces = [
  {
    title: "Salle de danse — 100 m²",
    description:
      "Un grand espace de mouvement, de chorégraphie et de travail collectif, pensé pour explorer le corps, l’énergie scénique et la création en groupe.",
  },
  {
    title: "Salle avec scène de spectacle",
    description:
      "Un lieu dédié à la présence scénique, aux répétitions, aux présentations et à la mise en situation artistique dans des conditions concrètes.",
  },
  {
    title: "3 salles individuelles",
    description:
      "Des espaces plus intimistes pour les cours personnalisés, le coaching, le travail vocal, instrumental ou l’accompagnement ciblé.",
  },
  {
    title: "Studio d’enregistrement",
    description:
      "Un espace pour poser la voix, enregistrer, expérimenter, affiner une interprétation et découvrir le travail de création en studio.",
  },
  {
    title: "Espace accueil & repos",
    description:
      "Un lieu de respiration, d’échange et de pause pour les élèves, pensé comme un espace vivant au cœur du centre.",
  },
];

export default function NotreEcolePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* Espace structurel pour le header fixe */}
        <div aria-hidden className="h-20" />

        {/* Image de fond */}
        <div className="absolute inset-0">
          <Image
            src="/Photo générale 2-test.png"
            alt="Univers artistique CREA'STAR"
            fill
            priority
            unoptimized
            className="object-cover object-center"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/55 to-background/25" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(218,180,90,0.08),transparent_55%)]" />
        </div>

        {/* Contenu */}
        <div className="relative z-10 mx-auto max-w-6xl px-6 pt-24 pb-28 sm:pt-28 sm:pb-32 lg:pt-36 lg:pb-40">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.22em] text-foreground/70">
              À propos • Notre école
            </p>

            <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Un lieu dédié à la création,
              <span className="block text-foreground">
                à l’expression et à l’artiste complet
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-base leading-relaxed text-foreground/85 sm:text-lg">
              Crea'Star est un centre artistique musical pensé comme un lieu
              vivant, où les artistes apprennent, créent, expérimentent et
              grandissent ensemble dans une dynamique profondément humaine.
            </p>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background" />
      </section>

        {/* NOTRE HISTOIRE */}
        <section className="bg-background text-foreground">
        <div className="mx-auto max-w-6xl px-6 pt-8 pb-24 sm:pt-8 sm:pb-20 lg:pt-8 lg:pb-28">
            <div className="mx-auto max-w-3xl text-center">
            <h2 className="relative inline-block text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Notre histoire
                <span
                aria-hidden
                className="absolute left-1/2 top-full mt-4 h-px w-[130%] -translate-x-1/2 bg-accent/70"
                />
            </h2>
            </div>

            <div className="mx-auto mt-14 max-w-5xl space-y-6 text-base leading-relaxed text-foreground/80 sm:text-lg lg:text-[1.15rem]">
            <p>
                Crea&apos;Star a été créée en 2027 avec une intention simple mais forte :
                dédier un lieu aux artistes, un lieu où l’on ne forme pas seulement par
                la technique ou l’interprétation, mais avant tout par la création.
            </p>

            <p>
                L’idée de départ était profondément humaine : offrir un espace où
                chacun puisse chercher, essayer, construire, se révéler et créer
                librement, sans être enfermé dans une seule manière d’apprendre ou de
                s’exprimer.
            </p>

            <p>
                À travers cette vision, Crea&apos;Star accompagne l’émergence d’une
                nouvelle génération d’artistes, plus pluridisciplinaires, plus
                autonomes, plus ouverts à la collaboration et à la création
                collective.
            </p>

            <p>
                Nous avons voulu imaginer un centre vivant, où les artistes puissent
                non seulement apprendre, mais aussi se rencontrer, travailler ensemble
                et faire naître des projets dans un cadre inspirant, exigeant et
                profondément bienveillant.
            </p>
            </div>
        </div>
        </section>

    {/* CE QUI NOUS ANIME */}
    <section className="bg-background">
    <div className="mx-auto max-w-6xl px-6 pt-8 pb-24 sm:pt-8 sm:pb-20 lg:pt-8 lg:pb-24">
        
        {/* Titre */}
        <div className="mx-auto max-w-3xl text-center">
        <h2 className="relative inline-block text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Ce qui nous anime
            <span
            aria-hidden
            className="absolute left-1/2 top-full mt-4 h-px w-[140%] -translate-x-1/2 bg-accent/70"
            />
        </h2>

        <p className="mt-10 text-base leading-relaxed text-foreground/80 sm:text-lg">
            L’école repose sur quelques convictions simples : créer avant de reproduire,
            apprendre ensemble, explorer plusieurs formes d’expression et évoluer dans
            un cadre artistique exigeant et humain.
        </p>
        </div>

        {/* Piliers */}
        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8">
            <h3 className="text-lg font-semibold">Créer avant de reproduire</h3>
            <p className="mt-4 text-sm leading-relaxed text-foreground/75">
            L’apprentissage commence par l’exploration, l’imaginaire et la création
            personnelle plutôt que par la simple reproduction de modèles.
            </p>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(218,180,90,0.08),transparent_60%)]" />
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8">
            <h3 className="text-lg font-semibold">Pluridisciplinarité</h3>
            <p className="mt-4 text-sm leading-relaxed text-foreground/75">
            La musique, la scène, le mouvement et l’expression artistique dialoguent
            pour permettre l’émergence d’artistes complets.
            </p>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(5,102,79,0.10),transparent_60%)]" />
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8">
            <h3 className="text-lg font-semibold">Créer ensemble</h3>
            <p className="mt-4 text-sm leading-relaxed text-foreground/75">
            Le collectif est une force créative : les artistes se rencontrent,
            collaborent et construisent des projets communs.
            </p>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(218,180,90,0.08),transparent_60%)]" />
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8">
            <h3 className="text-lg font-semibold">Un cadre humain et exigeant</h3>
            <p className="mt-4 text-sm leading-relaxed text-foreground/75">
            Offrir un environnement artistique stimulant, où l’exigence s’accompagne
            d’écoute, de respect et de confiance.
            </p>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(218,180,90,0.08),transparent_60%)]" />
        </div>

        </div>
    </div>
    </section>      

    {/* LES ESPACES */}
    <section className="relative bg-background text-foreground">
    <div className="mx-auto max-w-6xl px-6 pt-8 pb-24 sm:pt-8 sm:pb-20 lg:pt-8 lg:pb-24">
        <div className="mx-auto max-w-3xl text-center">
        <h2 className="relative inline-block text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Les espaces du centre
            <span
            aria-hidden
            className="absolute left-1/2 top-full mt-4 h-px w-[140%] -translate-x-1/2 bg-accent/70"
            />
        </h2>

        <p className="mt-10 text-base leading-relaxed text-foreground/80 sm:text-lg">
            Crea&apos;Star a été pensé comme un lieu complet, avec différents espaces
            dédiés au mouvement, à la scène, au travail individuel, à
            l’enregistrement et aux temps de pause.
        </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {/* Salle de danse */}
        <div className="group relative overflow-hidden rounded-2xl border border-foreground/10 bg-background/40 backdrop-blur-sm transition hover:border-accent/40">
            <div className="relative aspect-[4/3] w-full">
            <Image
                src="/espaces/eveil-musical.jpg"
                alt="Salle de danse de 100 m²"
                fill
                unoptimized
                className="object-cover transition duration-700 group-hover:scale-[1.02]"
                sizes="(min-width: 1024px) 33vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/20 to-transparent" />
            </div>

            <div className="p-6">
            <h3 className="text-lg font-semibold">Salle de danse — 100 m²</h3>
            <p className="mt-3 text-sm leading-relaxed text-foreground/75">
                Un grand espace pour le mouvement, la chorégraphie, l’énergie
                scénique et le travail collectif.
            </p>
            </div>
        </div>

        {/* Salle avec scène */}
        <div className="group relative overflow-hidden rounded-2xl border border-foreground/10 bg-background/40 backdrop-blur-sm transition hover:border-accent/40">
            <div className="relative aspect-[4/3] w-full">
            <Image
                src="/espaces/salle-spectacle.jpg"
                alt="Salle avec scène de spectacle"
                fill
                unoptimized
                className="object-cover transition duration-700 group-hover:scale-[1.02]"
                sizes="(min-width: 1024px) 33vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/20 to-transparent" />
            </div>

            <div className="p-6">
            <h3 className="text-lg font-semibold">Salle avec scène de spectacle</h3>
            <p className="mt-3 text-sm leading-relaxed text-foreground/75">
                Un lieu pour répéter, présenter, expérimenter la scène et vivre la
                création dans des conditions concrètes.
            </p>
            </div>
        </div>

        {/* 3 salles individuelles */}
        <div className="group relative overflow-hidden rounded-2xl border border-foreground/10 bg-background/40 backdrop-blur-sm transition hover:border-accent/40">
            <div className="relative aspect-[4/3] w-full">
            <Image
                src="/espaces/cours-individuels.jpg"
                alt="Trois salles individuelles"
                fill
                unoptimized
                className="object-cover transition duration-700 group-hover:scale-[1.02]"
                sizes="(min-width: 1024px) 33vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/20 to-transparent" />
            </div>

            <div className="p-6">
            <h3 className="text-lg font-semibold">3 salles individuelles</h3>
            <p className="mt-3 text-sm leading-relaxed text-foreground/75">
                Des espaces plus intimistes pour le coaching, les cours
                personnalisés et le travail ciblé.
            </p>
            </div>
        </div>

        {/* Studio */}
        <div className="group relative overflow-hidden rounded-2xl border border-foreground/10 bg-background/40 backdrop-blur-sm transition hover:border-accent/40">
            <div className="relative aspect-[4/3] w-full">
            <Image
                src="/espaces/studio.jpg"
                alt="Studio d’enregistrement"
                fill
                unoptimized
                className="object-cover transition duration-700 group-hover:scale-[1.02]"
                sizes="(min-width: 1024px) 33vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/20 to-transparent" />
            </div>

            <div className="p-6">
            <h3 className="text-lg font-semibold">Studio d’enregistrement</h3>
            <p className="mt-3 text-sm leading-relaxed text-foreground/75">
                Un espace pour enregistrer, expérimenter, poser la voix et
                découvrir le travail de création en studio.
            </p>
            </div>
        </div>

        {/* Accueil */}
        <div className="group relative overflow-hidden rounded-2xl border border-foreground/10 bg-background/40 backdrop-blur-sm transition hover:border-accent/40">
            <div className="relative aspect-[4/3] w-full">
            <Image
                src="/espaces/eveil-musical.jpg"
                alt="Espace accueil et repos"
                fill
                unoptimized
                className="object-cover transition duration-700 group-hover:scale-[1.02]"
                sizes="(min-width: 1024px) 33vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/20 to-transparent" />
            </div>

            <div className="p-6">
            <h3 className="text-lg font-semibold">Espace accueil & repos</h3>
            <p className="mt-3 text-sm leading-relaxed text-foreground/75">
                Un lieu de respiration, d’échange et de pause, pensé comme un espace
                vivant au cœur du centre.
            </p>
            </div>
        </div>
        </div>
    </div>
    </section>

    {/* DÉCOUVRIR LES PARCOURS / CTA */}
    <section className="relative overflow-hidden bg-background text-foreground">
    {/* Image de fond */}
    <div className="absolute inset-0">
        <Image
        src="/spectacles/salle-spectacle.jpg"
        alt="Scène de spectacle CREA'STAR"
        fill
        unoptimized
        className="object-cover object-center"
        sizes="100vw"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/55 to-background/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(218,180,90,0.10),transparent_60%)]" />
    </div>

    {/* Contenu */}
    <div className="relative z-10 mx-auto max-w-6xl px-6 pt-32 pb-36 text-center sm:pt-36 sm:pb-40 lg:pt-40 lg:pb-48">
        <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
        Découvrir les parcours CREA&apos;STAR
        </h2>

        <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-foreground/80 sm:text-lg">
        Explore les programmes proposés par l’école et découvre un parcours
        construit autour de la création, de la progression et de l’expérience
        artistique.
        </p>

        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Link
            href="/cours/full-artist"
            className="inline-flex items-center justify-center rounded-xl bg-primary border border-accent/60 px-10 py-4 text-base font-semibold text-foreground transition hover:border-accent"
        >
            Voir les parcours
        </Link>

        <Link
            href="/inscriptions"
            className="inline-flex items-center justify-center rounded-xl bg-background border border-accent/60 px-10 py-4 text-base font-medium text-foreground/90 transition hover:border-accent"
        >
            S’inscrire
        </Link>
        </div>
    </div>
    </section>

      {/* FOOTER */}
      <footer className="relative bg-background text-foreground">
        {/* Ligne signature */}
        <div className="h-px w-full bg-accent/50" />

        <div className="mx-auto max-w-7xl px-6 py-12">
          {/* Haut du footer */}
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:items-start">
            {/* LOGO — identique au header */}
            <div className="lg:col-span-2">
              <img
                src="/Logo-footer.png"
                alt="Logo CREA'STAR"
                className="block w-[180px] h-auto"
              />

              <p className="mt-4 max-w-[260px] font-bold text-xl leading-relaxed text-foreground/80">
                La création au cœur<br />
                du parcours artistique
              </p>
            </div>            
          {/* Colonne vide pour respiration (desktop) */}
            <div className="hidden lg:block" />

            {/* À propos */}
            <div>
              <p className="text-sm font-semibold text-foreground">À propos</p>
              <ul className="mt-4 space-y-1 text-sm text-foreground/70">
                <li>
                  <a href="/a-propos/notre-ecole" className="transition hover:text-foreground">
                    Notre école
                  </a>
                </li>
                <li>
                  <a href="/a-propos/notre-equipe" className="transition hover:text-foreground">
                    Notre équipe
                  </a>
                </li>
                <li>
                  <a href="/actualites" className="transition hover:text-foreground">
                    Actualités
                  </a>
                </li>
                <li>
                  <a href="/FAQ" className="transition hover:text-foreground">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Notre offre */}
            <div>
              <p className="text-sm font-semibold text-foreground">Notre offre</p>
              <ul className="mt-4 space-y-1 text-sm text-foreground/70">
                <li>
                  <a href="/cours/full-artist" className="transition hover:text-foreground">
                    Full Artist
                  </a>
                </li>
                <li>
                  <a href="/cours/comedie-musicale" className="transition hover:text-foreground">
                    Comédie musicale
                  </a>
                </li>
                <li>
                  <a href="/cours/eveil-musical" className="transition hover:text-foreground">
                    Éveil musical
                  </a>
                </li>
                <li>
                  <a href="/cours/cours-individuels" className="transition hover:text-foreground">
                    Cours individuels
                  </a>
                </li>
                <li>
                  <a href="/locations" className="transition hover:text-foreground">
                    Location studio & salles
                  </a>
                </li>
              </ul>
            </div>

            {/* Adresse */}
            <div className="text-sm text-foreground/70 lg:text-right">
              <p>Chaussée de Bruxelles, 258</p>
              <p>1410 Waterloo</p>
              <p className="invisible">—</p>
              <p>+32 (0) 471 01 61 81</p>
            </div>
          </div>

          {/* Bas du footer */}
          <div className="mt-10 flex flex-col gap-4 border-t border-foreground/10 pt-6 text-xs text-foreground/60 sm:flex-row sm:items-center sm:justify-between">
            {/* Gauche : copyright + slogan */}
            <div className="leading-relaxed">
              <p>© {new Date().getFullYear()} CREA’STAR</p>
            </div>

            {/* Droite : liens légaux */}
            <div className="flex gap-6 sm:justify-end">
              <a href="/confidentialite" className="transition hover:text-foreground">
                Confidentialité
              </a>
              <a href="/mentions-legales" className="transition hover:text-foreground">
                Mentions légales
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}