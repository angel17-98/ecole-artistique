import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-black/90 text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(185,151,83,0.38),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(185,151,83,0.08),transparent_24%),radial-gradient(circle_at_right_center,rgba(22,92,71,0.16),transparent_28%)]" />

      <div className="relative site-shell-wide px-6 py-16 md:px-10 lg:px-14 lg:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1fr] lg:items-start">
          <div>
            <img
              src="/Logo-footer.png"
              alt="Logo CREA'STAR"
              className="block w-[180px] h-auto"
            />

            <p className="mt-6 max-w-[300px] text-xl font-semibold leading-relaxed text-white/82">
              La création au cœur
              <br />
              de l&apos;apprentissage
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/86">
                À propos
              </p>

              <ul className="mt-4 space-y-2 text-sm text-white/62">
                <li>
                  <Link href="/a-propos/notre-ecole" className="transition hover:text-white">
                    Notre école
                  </Link>
                </li>
                <li>
                  <Link href="/a-propos/notre-equipe" className="transition hover:text-white">
                    Notre équipe
                  </Link>
                </li>
                <li>
                  <Link href="/actualites" className="transition hover:text-white">
                    Actualités
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="transition hover:text-white">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/86">
                Notre offre
              </p>

              <ul className="mt-4 space-y-2 text-sm text-white/62">
                <li>
                  <Link href="/cours/full-artist" className="transition hover:text-white">
                    Full Artist
                  </Link>
                </li>
                <li>
                  <Link href="/cours/comedie-musicale" className="transition hover:text-white">
                    Comédie musicale
                  </Link>
                </li>
                <li>
                  <Link href="/cours/eveil-musical" className="transition hover:text-white">
                    Éveil musical
                  </Link>
                </li>
                <li>
                  <Link href="/cours/cours-individuels" className="transition hover:text-white">
                    Cours individuels
                  </Link>
                </li>
                <li>
                  <Link href="/locations" className="transition hover:text-white">
                    Location studio & salles
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-sm text-white/62 lg:text-right">
            <p className="font-semibold uppercase tracking-[0.14em] text-white/86">
              Coordonnées
            </p>

            <div className="mt-4 space-y-1 leading-7">
              <p>Chaussée de Bruxelles, 258</p>
              <p>1410 Waterloo</p>
              <p className="pt-2">+32 (0) 471 01 61 81</p>
            </div>
          </div>
        </div>

        <div className="my-10 h-px w-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)]" />

        <div className="flex flex-col gap-4 text-xs text-white/46 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p>© {new Date().getFullYear()} CREA’STAR</p>
          </div>

          <div className="flex gap-6 sm:justify-end">
            <Link href="/confidentialite" className="transition hover:text-white">
              Confidentialité
            </Link>
            <Link href="/mentions-legales" className="transition hover:text-white">
              Mentions légales
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}