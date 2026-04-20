"use client";

import Link from "next/link";
import Reveal from "../../components/Reveal";

// ─── DATA ────────────────────────────────────────────────────────────────────

const disciplines = [
  {
    name: "Chant",
    desc: "Technique vocale, placement, justesse, interprétation, style — du débutant au niveau avancé.",
    icon: "♪",
  },
  {
    name: "Coaching vocal",
    desc: "Travail approfondi sur la voix — souffle, timbre, puissance, endurance et santé vocale.",
    icon: "◎",
  },
  {
    name: "Danse",
    desc: "Selon l'intervenant : contemporain, jazz, urbain, classique, expression corporelle.",
    icon: "◈",
  },
  {
    name: "Théâtre",
    desc: "Jeu d'acteur, texte, présence, improvisation, construction de personnage.",
    icon: "◉",
  },
  {
    name: "Instrument",
    desc: "Selon disponibilité des intervenants — guitare, piano, batterie et autres. Nous contacter pour la liste à jour.",
    icon: "◆",
  },
  {
    name: "Expression scénique",
    desc: "Présence sur scène, regard, intention, gestion du trac — pour quiconque se produit en public.",
    icon: "◇",
  },
  {
    name: "Studio",
    desc: "Initiation à l'enregistrement, prise de son, production et écoute critique en studio.",
    icon: "◐",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Tu crées ton compte",
    text: "Un compte élève sur la plateforme Crea'Star. Gratuit, en 2 minutes. Ça te donne accès aux profils de tous les intervenants disponibles et à leurs créneaux.",
  },
  {
    step: "02",
    title: "Tu choisis ton intervenant",
    text: "Filtre par discipline, par niveau ou par disponibilité. Chaque intervenant a un profil détaillé — parcours, approche pédagogique, tarif par séance.",
  },
  {
    step: "03",
    title: "Tu réserves et tu paies en ligne",
    text: "Tu sélectionnes un créneau dans l'agenda de l'intervenant et tu paies directement en ligne. La salle est automatiquement réservée. Confirmation par email.",
  },
  {
    step: "04",
    title: "Tu viens au centre",
    text: "Le jour J, tu viens à Crea'Star. La salle individuelle est prête, l'intervenant t'y attend. Pas de logistique — tout est préparé.",
  },
];

const whyCreastar = [
  {
    title: "Des intervenants sélectionnés",
    text: "Chaque intervenant passe par un processus de validation avant d'être accepté sur la plateforme. On ne prend pas tout le monde — on prend les bons.",
  },
  {
    title: "Des tarifs négociés",
    text: "Les tarifs sont définis en accord entre Crea'Star et chaque intervenant via un contrat annuel. Pas de surprises, pas de négociation au cas par cas.",
  },
  {
    title: "Des salles professionnelles incluses",
    text: "La réservation inclut automatiquement une salle individuelle du centre — équipée, insonorisée, prête à l'usage. L'intervenant n'a pas à gérer ça de son côté.",
  },
];

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function CoursIndividuelsPage() {
  return (
    <main className="min-h-screen text-foreground">

      {/* ══ HERO — typographique ════════════════════════════════════════════ */}
      <section className="relative bg-background pt-28 pb-14 md:pt-36 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(185,151,83,0.07),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(22,92,71,0.06),transparent_40%)]" />

        <div className="relative site-shell-wide px-6 md:px-10 lg:px-14">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.28em] text-primary/78">
              Nos cours · Sur mesure
            </p>
            <div className="my-5 h-px w-12 bg-[rgb(185,151,83)]" />
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-[3.6rem]">
              Cours individuels
              <br />
              <span className="text-primary">Des intervenants validés, des salles réservées en ligne</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-black/56 sm:text-base sm:leading-8">
              Crea'Star met en relation des élèves avec des intervenants artistiques
              sélectionnés — dans les salles du centre, avec des tarifs négociés,
              réservables directement en ligne.
            </p>
          </Reveal>

          {/* Deux entrées visuelles */}
          <Reveal delay={1}>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 max-w-2xl">
              <Link
                href="/login"
                className="group flex flex-col gap-3 rounded-[22px] border border-black/8 bg-white px-6 py-6 shadow-[0_6px_24px_rgba(16,16,16,0.05)] transition hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_12px_36px_rgba(22,92,71,0.08)]"
              >
                <span className="text-2xl text-primary/60">◈</span>
                <p className="font-semibold">Je cherche un cours</p>
                <p className="text-sm text-black/50 leading-6">
                  Créer un compte élève et réserver une séance
                </p>
                <span className="mt-1 text-sm font-medium text-primary group-hover:translate-x-0.5 transition-transform">
                  Accéder à la plateforme →
                </span>
              </Link>

              <Link
                href="/contact"
                className="group flex flex-col gap-3 rounded-[22px] border border-black/8 bg-white px-6 py-6 shadow-[0_6px_24px_rgba(16,16,16,0.05)] transition hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-[0_12px_36px_rgba(22,92,71,0.08)]"
              >
                <span className="text-2xl text-[rgb(185,151,83)]/70">◉</span>
                <p className="font-semibold">Je suis intervenant</p>
                <p className="text-sm text-black/50 leading-6">
                  Rejoindre le réseau Crea'Star et proposer mes cours
                </p>
                <span className="mt-1 text-sm font-medium text-primary group-hover:translate-x-0.5 transition-transform">
                  Nous contacter →
                </span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ COMMENT ÇA MARCHE ════════════════════════════════════════════════ */}
      <section className="relative bg-[rgb(239,244,239)] overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(22,92,71,0.10),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(185,151,83,0.10),transparent)]" />

        <div className="site-shell-wide px-6 py-20 md:px-10 lg:px-14 lg:py-24">
          <Reveal>
            <div className="mb-14">
              <p className="text-xs uppercase tracking-[0.28em] text-primary/80">
                Pour les élèves
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl lg:text-5xl">
                Réserver un cours en 4 étapes
              </h2>
            </div>
          </Reveal>

          <div className="relative">
            <div className="absolute top-[1.5rem] left-0 right-0 hidden h-px bg-[linear-gradient(90deg,transparent,rgba(22,92,71,0.15)_8%,rgba(22,92,71,0.15)_92%,transparent)] lg:block" />
            <div className="grid gap-8 lg:grid-cols-4 lg:gap-6">
              {howItWorks.map((s, i) => (
                <Reveal key={s.step} delay={(i % 4) as 0 | 1 | 2}>
                  <div className="relative flex flex-col">
                    <div className="mb-5 flex items-center gap-4 lg:flex-col lg:items-start lg:gap-3">
                      <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-black/8 bg-white shadow-[0_4px_16px_rgba(16,16,16,0.06)] text-sm font-semibold text-primary">
                        {s.step}
                      </div>
                    </div>
                    <div className="rounded-[20px] border border-black/6 bg-white p-6 shadow-[0_4px_24px_rgba(16,16,16,0.04)]">
                      <h3 className="text-base font-semibold leading-snug sm:text-lg">
                        {s.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-black/60">
                        {s.text}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal>
            <div className="mt-10">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full bg-[rgb(22,92,71)] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[rgb(15,75,57)]"
              >
                Créer mon compte élève →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ DISCIPLINES ══════════════════════════════════════════════════════ */}
      <section className="relative bg-background">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(16,16,16,0.08),transparent)]" />

        <div className="site-shell-wide px-6 py-20 md:px-10 lg:px-14 lg:py-24">
          <Reveal>
            <div className="mb-12">
              <p className="text-xs uppercase tracking-[0.28em] text-primary/80">
                Disciplines disponibles
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl lg:text-5xl">
                7 disciplines, des intervenants pour chacune
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-black/56 sm:text-base">
                Chaque discipline est couverte par un ou plusieurs intervenants validés
                par Crea'Star. Le catalogue évolue à mesure que le réseau s'agrandit.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {disciplines.map((d, i) => (
              <Reveal key={d.name} delay={(i % 3) as 0 | 1 | 2}>
                <div className="group rounded-[22px] border border-black/6 bg-white p-6 shadow-[0_6px_24px_rgba(16,16,16,0.04)] transition hover:-translate-y-0.5 hover:border-primary/18 hover:shadow-[0_12px_32px_rgba(22,92,71,0.07)]">
                  <span className="text-xl text-primary/40">{d.icon}</span>
                  <h3 className="mt-3 text-base font-semibold">{d.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-black/56">{d.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ POURQUOI CREA'STAR — vert émeraude ═══════════════════════════════ */}
      <section className="relative overflow-hidden text-white" style={{ background: "rgb(22,92,71)" }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(185,151,83,0.14),transparent_52%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(15,75,57,0.65),transparent_55%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)]" />

        <div className="relative site-shell-wide px-6 py-20 md:px-10 lg:px-14 lg:py-24">
          <Reveal>
            <div className="mb-14">
              <p className="text-xs uppercase tracking-[0.28em] text-white/55">
                La différence Crea'Star
              </p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
                Pas une marketplace ouverte. Un réseau validé.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
                N'importe qui ne peut pas proposer des cours sur la plateforme Crea'Star.
                Chaque intervenant est sélectionné, évalué et contractualisé annuellement.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-5 lg:grid-cols-3">
            {whyCreastar.map((item, i) => (
              <Reveal key={item.title} delay={(i % 3) as 0 | 1 | 2}>
                <div className="rounded-[22px] border border-white/15 bg-white/8 p-8">
                  <h3 className="text-lg font-semibold leading-snug">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/65">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SECTION INTERVENANTS ════════════════════════════════════════════ */}
      <section className="relative bg-[rgb(239,244,239)]">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(22,92,71,0.10),transparent)]" />

        <div className="site-shell-wide px-6 py-20 md:px-10 lg:px-14 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-20">
            <Reveal>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-primary/80">
                  Pour les intervenants
                </p>
                <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
                  Tu enseignes ? Rejoins le réseau.
                </h2>
                <div className="mt-6 space-y-4 text-base leading-8 text-black/68">
                  <p>
                    Crea'Star propose aux intervenants indépendants validés d'utiliser
                    les salles du centre pour leurs cours particuliers — avec une
                    infrastructure de réservation et de paiement entièrement gérée.
                  </p>
                  <p>
                    Le tarif de tes cours est fixé en accord avec Crea'Star via un contrat
                    annuel. En échange, tu bénéficies de l'accès aux salles, de la
                    visibilité auprès des élèves du centre et d'une mise en relation qualifiée.
                  </p>
                  <p>
                    La sélection est exigeante — on cherche des praticiens actifs dans
                    leur discipline, capables d'un accompagnement individualisé sérieux.
                  </p>
                </div>

                <div className="mt-8 rounded-[20px] border border-primary/14 bg-white/80 p-6 shadow-[0_8px_24px_rgba(16,16,16,0.05)]">
                  <p className="text-sm font-semibold text-black">
                    Intéressé·e ? On s'appelle.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-black/62">
                    Envoie-nous un message via le formulaire de contact en précisant
                    ta discipline, ton parcours et la façon dont tu travailles.
                    On revient vers toi sous 48h.
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
                  { label: "Salles disponibles", value: "3 salles individuelles" },
                  { label: "Réservation", value: "En ligne, automatisée" },
                  { label: "Paiement", value: "En ligne, sécurisé" },
                  { label: "Tarif", value: "Négocié annuellement" },
                  { label: "Sélection", value: "Sur dossier & entretien" },
                  { label: "Contrat", value: "Annuel, renouvelable" },
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
                  className="mt-2 w-full inline-flex items-center justify-center rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-strong"
                >
                  Rejoindre le réseau →
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ CTA FINAL ═══════════════════════════════════════════════════════ */}
      <section className="relative px-6 py-12 md:px-10 lg:px-14 lg:py-16">
        <div className="site-shell-wide">
          <Reveal>
            <div className="relative overflow-hidden rounded-[28px] border border-black/6 bg-[linear-gradient(135deg,rgb(255,253,249)_0%,rgb(237,244,237)_100%)] px-8 py-12 shadow-[0_20px_64px_rgba(16,16,16,0.07)] lg:px-14 lg:py-14">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(185,151,83,0.08),transparent_28%),radial-gradient(circle_at_right_bottom,rgba(22,92,71,0.08),transparent_30%)]" />

              <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-primary/78">
                    Envie d'un engagement plus complet ?
                  </p>
                  <h2 className="mt-4 max-w-xl text-2xl font-semibold leading-tight tracking-tight text-balance sm:text-3xl">
                    Les parcours annuels — de la première heure au spectacle
                  </h2>
                  <p className="mt-4 max-w-lg text-sm leading-7 text-black/60 sm:text-base">
                    Les cours individuels sont parfaits pour progresser sur un point précis.
                    Les parcours annuels sont faits pour vivre une expérience artistique
                    complète — jusqu'à la scène, en groupe, sur toute une année.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
                  <Link
                    href="/cours/full-artist"
                    className="inline-flex items-center justify-center rounded-full bg-[rgb(22,92,71)] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[rgb(15,75,57)]"
                  >
                    Full Artist →
                  </Link>
                  <Link
                    href="/cours/comedie-musicale"
                    className="inline-flex items-center justify-center rounded-full border border-black/12 px-7 py-3.5 text-sm font-medium text-black/70 transition hover:border-black/24 hover:text-black"
                  >
                    Comédie Musicale
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