// app/components/Footer.tsx
// Pied de page — refonte du 18/11/2026. Les liens viennent de lib/navigation.ts,
// comme le menu du haut : une page marquée `pret: false` n'apparaît nulle part.

import Link from "next/link";
import {
  A_PROPOS, COURS_COLLECTIFS, LIENS_DIRECTS, LIENS_LEGAUX, LIEN_INSCRIPTION,
  groupesPrets, liensPrets, type LienNav,
} from "@/lib/navigation";

function Colonne({ titre, liens }: { titre: string; liens: LienNav[] }) {
  if (liens.length === 0) return null;
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/86">{titre}</p>
      <ul className="mt-4 space-y-2 text-sm text-white/62">
        {liens.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="transition hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const aPropos = groupesPrets(A_PROPOS).flatMap((g) => g.liens);
  const notreOffre = [
    ...groupesPrets(COURS_COLLECTIFS).flatMap((g) => g.liens),
    ...liensPrets(LIENS_DIRECTS),
  ];
  const legaux = liensPrets(LIENS_LEGAUX);

  return (
    <footer className="relative overflow-hidden bg-black/90 text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(185,151,83,0.38),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(185,151,83,0.08),transparent_24%),radial-gradient(circle_at_right_center,rgba(22,92,71,0.16),transparent_28%)]" />

      <div className="relative site-shell-wide px-6 py-16 md:px-10 lg:px-14 lg:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.1fr_1.4fr_0.9fr] lg:items-start">
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

            <Link
              href={LIEN_INSCRIPTION.href}
              className="mt-6 inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
              style={{ background: "rgb(185,151,83)" }}
            >
              {LIEN_INSCRIPTION.label}
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-10">
            <Colonne titre="À propos" liens={aPropos} />
            <Colonne titre="Notre offre" liens={notreOffre} />
          </div>

          <div className="text-sm text-white/62 lg:text-right">
            <p className="font-semibold uppercase tracking-[0.14em] text-white/86">
              Coordonnées
            </p>

            <div className="mt-4 space-y-1 leading-7">
              <p>Grand'Route, 550</p>
              <p>1428 Braine l'Alleud</p>
              <p className="pt-2">+32 (0) 471 01 61 81</p>
            </div>
          </div>
        </div>

        <div className="my-10 h-px w-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)]" />

        <div className="flex flex-col gap-4 text-xs text-white/46 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p>© {new Date().getFullYear()} CREA’STAR</p>
          </div>

          {legaux.length > 0 && (
            <div className="flex gap-6 sm:justify-end">
              {legaux.map((l) => (
                <Link key={l.href} href={l.href} className="transition hover:text-white">
                  {l.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}