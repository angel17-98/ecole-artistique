import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-200 text-zinc-900 dark:bg-black dark:text-zinc-50"/*min-h-screen pour s'adapapter à la taille de la fenêtre ensuite background et couleur texte puis fonction dark = si on passe en mode sombre*/> 
      {/* Barre du haut */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6"/* mx-auto c'est marge auto gauche et droite + sans flex empilage des textes + items-center c'est aligmenet des textes vertical + justify-between pour avoir un élément à gauche et à droite + padding c'est espacement gauche droite et haut bas*/>
        <div className="text-lg font-semibold tracking-tight"/*text-lg c'est la taille du texte + tracking tight permet de rapporcher les lettres*/>
          École artistique musicale
        </div>

        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10"
          >
            Connexion
          </Link>
        </nav>
      </header>

      {/* Contenu principal */}
      <section className="mx-auto grid max-w-5xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center">
        <div className="space-y-5">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            Apprends, crée, progresse.
            <br />
            Avec des professeurs professionnels.
          </h1>

          <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Cours individuels, cours collectifs et location de grandes salles.
            Réservation en ligne et planning clair.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/prof"
              className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-5 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
            >
              Espace professeur
            </Link>

            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-full border border-black/10 px-5 py-3 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
            >
              Espace admin
            </Link>
          </div>
        </div>

        {/* Bloc “cartes” */}
        <div className="grid gap-4">
          <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
            <div className="text-sm font-medium">Réservations</div>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Créneaux de 60 minutes, gestion des salles, et confirmation
              automatique.
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
            <div className="text-sm font-medium">Avantages annuel</div>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              -30% sur location de grande salle, -10% sur cours collectifs (pas
              sur cours individuels).
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950">
            <div className="text-sm font-medium">Professionnel</div>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Une expérience simple et élégante, pensée pour les élèves et les
              profs.
            </p>
          </div>
        </div>
      </section>

      {/* Pied de page */}
      <footer className="mx-auto max-w-5xl px-6 py-10 text-sm text-zinc-500 dark:text-zinc-400">
        © {new Date().getFullYear()} École artistique & musicale
      </footer>
    </main>
  );
}
