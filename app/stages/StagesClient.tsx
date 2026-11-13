"use client";
// app/stages/StagesClient.tsx
// Page publique Stages & Workshops (13/11/2026).

import { useEffect, useState } from "react";
import Link from "next/link";
import Reveal from "@/app/components/Reveal";
import {
  TYPES_OFFRE, ETATS_INSCRIPTIONS, actionOffre, datesOffre, prixTexte,
  type Offre, type TypeOffre, type TypeDemande,
} from "@/lib/offres";

const VERT = "rgb(22,92,71)";
const OR = "rgb(185,151,83)";

type Filtre = "tous" | TypeOffre;

const champ =
  "w-full rounded-[14px] border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/36 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/12 transition";

// ─── FORMULAIRE (fenêtre) ─────────────────────────────────────────────────────

function FenetreDemande({
  offre, typeDemande, onFermer,
}: { offre: Offre | null; typeDemande: TypeDemande; onFermer: () => void }) {
  const [f, setF] = useState({ prenom: "", nom: "", email: "", telephone: "", age: "", message: "", site_web: "" });
  const [envoi, setEnvoi] = useState(false);
  const [ok, setOk] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const maj = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v }));

  useEffect(() => {
    const echap = (e: KeyboardEvent) => e.key === "Escape" && onFermer();
    window.addEventListener("keydown", echap);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", echap); document.body.style.overflow = ""; };
  }, [onFermer]);

  const titre = offre ? offre.titre : "Modules à la carte";
  const intro =
    typeDemande === "attente" ? "C'est complet pour l'instant. Laisse tes coordonnées : on te prévient si une place se libère."
    : typeDemande === "inscription" ? "Laisse tes coordonnées : on revient vers toi pour finaliser ton inscription."
    : offre ? "Les inscriptions ne sont pas encore ouvertes. Laisse tes coordonnées : tu seras parmi les premiers prévenus."
    : "Tu aimerais suivre un module du Full Artist sans t'engager pour l'année ? Laisse tes coordonnées : on te prévient dès que les places s'ouvrent.";

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnvoi(true); setErreur(null);
    try {
      const r = await fetch("/api/interet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, offreId: offre?.id ?? null, typeDemande }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error ?? "Envoi impossible");
      setOk(true);
    } catch (err: any) {
      setErreur(err.message);
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={titre}>
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onFermer} />
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-[28px] bg-white p-6 shadow-2xl sm:rounded-[28px] sm:p-8">
        <button onClick={onFermer} aria-label="Fermer" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-black/40 transition hover:bg-black/5 hover:text-black">✕</button>

        {ok ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl text-primary">✓</div>
            <p className="text-lg font-semibold text-black">C'est noté, merci !</p>
            <p className="mt-2 text-sm leading-6 text-black/55">Un mail de confirmation t'a été envoyé.</p>
            <button onClick={onFermer} className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white">Fermer</button>
          </div>
        ) : (
          <form onSubmit={envoyer} className="space-y-4">
            <div className="pr-8">
              <p className="text-xs uppercase tracking-[0.2em] text-primary/80">
                {offre ? TYPES_OFFRE[offre.type].label : "Liste d'intérêt"}
              </p>
              <h3 className="mt-1 text-xl font-semibold tracking-tight text-black">{titre}</h3>
              <p className="mt-2 text-sm leading-6 text-black/55">{intro}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input className={champ} placeholder="Prénom *" required value={f.prenom} onChange={(e) => maj("prenom", e.target.value)} />
              <input className={champ} placeholder="Nom *" required value={f.nom} onChange={(e) => maj("nom", e.target.value)} />
            </div>
            <input className={champ} type="email" placeholder="Email *" required value={f.email} onChange={(e) => maj("email", e.target.value)} />
            <div className="grid gap-3 sm:grid-cols-2">
              <input className={champ} type="tel" placeholder="Téléphone" value={f.telephone} onChange={(e) => maj("telephone", e.target.value)} />
              <input className={champ} placeholder="Âge de la personne inscrite" value={f.age} onChange={(e) => maj("age", e.target.value)} />
            </div>
            <textarea className={`${champ} resize-none`} rows={3}
              placeholder={offre ? "Un message ? (facultatif)" : "Quel(s) module(s) t'intéresse(nt) ? (chant, danse, écriture, studio…)"}
              value={f.message} onChange={(e) => maj("message", e.target.value)} />

            {/* Champ piège pour les robots, invisible pour les humains */}
            <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" value={f.site_web} onChange={(e) => maj("site_web", e.target.value)} />

            {erreur && <p className="rounded-[12px] bg-red-50 px-4 py-3 text-sm text-red-700">{erreur}</p>}

            <button type="submit" disabled={envoi}
              className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-white transition hover:bg-primary-strong disabled:opacity-50">
              {envoi ? "Envoi…" : "Envoyer"}
            </button>
            <p className="text-center text-xs text-black/40">Sans engagement. Tes coordonnées servent uniquement à te recontacter.</p>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── CARTE D'OFFRE ────────────────────────────────────────────────────────────

function CarteOffre({ o, onDemande }: { o: Offre; onDemande: (o: Offre, t: TypeDemande) => void }) {
  const type = TYPES_OFFRE[o.type];
  const action = actionOffre(o);
  const complet = o.inscriptions === "complet" || o.places_restantes === 0;
  const etat = ETATS_INSCRIPTIONS[complet ? "complet" : o.inscriptions];

  return (
    <article className="group flex flex-col overflow-hidden rounded-[24px] border border-black/6 bg-white shadow-[0_6px_28px_rgba(16,16,16,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(16,16,16,0.09)]">
      <div className="relative aspect-[4/3] overflow-hidden" style={{ background: `linear-gradient(135deg, rgb(12,50,38), ${type.couleur})` }}>
        {o.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={o.image_url} alt={o.titre} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl font-semibold tracking-tight text-white/25">{type.label}</span>
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.45)" }}>
          {type.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: etat.fond, color: etat.texte }}>{etat.label}</span>
          {o.places_restantes !== null && o.places_restantes > 0 && !complet && (
            <span className="text-xs font-medium" style={{ color: "rgb(146,95,14)" }}>
              {o.places_restantes} place{o.places_restantes > 1 ? "s" : ""} restante{o.places_restantes > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold leading-snug tracking-tight text-black">{o.titre}</h3>
        <p className="mt-1.5 text-sm font-medium text-primary first-letter:uppercase">{datesOffre(o)}</p>
        {(o.horaires || o.public_vise) && (
          <p className="mt-0.5 text-sm text-black/50">{[o.horaires, o.public_vise].filter(Boolean).join(" · ")}</p>
        )}
        {o.description && <p className="mt-3 line-clamp-4 whitespace-pre-line text-sm leading-6 text-black/60">{o.description}</p>}

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <p className="text-base font-semibold text-black/80">{prixTexte(o.prix)}</p>
          {action.lien ? (
            <a href={action.lien} target="_blank" rel="noopener noreferrer"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-strong">
              {action.libelle} ↗
            </a>
          ) : (
            <button onClick={() => onDemande(o, action.demande!)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${o.inscriptions === "ouvertes" && !complet ? "bg-primary text-white hover:bg-primary-strong" : "border border-black/12 text-black/70 hover:border-black/25"}`}>
              {action.libelle}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function StagesClient({ offres }: { offres: Offre[] }) {
  const [filtre, setFiltre] = useState<Filtre>("tous");
  const [fenetre, setFenetre] = useState<{ offre: Offre | null; type: TypeDemande } | null>(null);

  const typesPresents = (Object.keys(TYPES_OFFRE) as TypeOffre[]).filter((t) => offres.some((o) => o.type === t));
  const visibles = offres.filter((o) => filtre === "tous" || o.type === filtre);

  return (
    <main className="min-h-screen text-foreground">
      {fenetre && <FenetreDemande offre={fenetre.offre} typeDemande={fenetre.type} onFermer={() => setFenetre(null)} />}

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ background: "rgb(12,50,38)" }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(185,151,83,0.22),transparent_55%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.05),transparent_45%)]" />
        <div className="relative site-shell-wide px-6 pb-14 pt-12 md:px-10 md:pb-16 md:pt-16 lg:px-14">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.28em] text-white/50">Événements · Formats courts</p>
            <div className="my-5 h-px w-12" style={{ background: OR }} />
            <h1 className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-white text-balance sm:text-5xl lg:text-[3.4rem]">
              Stages &amp; Workshops
            </h1>
            <p className="mt-6 max-w-8xl text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
              Stages pendant les vacances, masterclass avec des artistes invités, workshops et modules à la carte&nbsp;:
              des formats courts et intensifs pour s'immerger, progresser et rencontrer.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══ OFFRES ════════════════════════════════════════════════════════════ */}
      <section className="relative bg-background">
        <div className="site-shell-wide px-6 py-12 md:px-10 lg:px-14 lg:py-16">
          {offres.length > 0 ? (
            <>
              {typesPresents.length > 1 && (
                <div className="mb-8 flex flex-wrap gap-2">
                  {(["tous", ...typesPresents] as Filtre[]).map((f) => (
                    <button key={f} onClick={() => setFiltre(f)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${filtre === f ? "bg-primary text-white" : "border border-black/10 bg-white text-black/60 hover:border-black/20"}`}>
                      {f === "tous" ? "Tout voir" : TYPES_OFFRE[f].pluriel}
                    </button>
                  ))}
                </div>
              )}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visibles.map((o) => (
                  <CarteOffre key={o.id} o={o} onDemande={(offre, type) => setFenetre({ offre, type })} />
                ))}
              </div>
            </>
          ) : (
            <Reveal>
              <div className="rounded-[28px] border border-dashed border-black/12 bg-white/70 px-6 py-14 text-center">
                <p className="text-lg font-semibold text-black/80">Les premiers stages arrivent bientôt</p>
                <p className="mx-auto mt-2 max-w-3xl text-sm leading-6 text-black/55">
                  Inscris-toi à notre newsletter ou laisse-nous tes coordonnées : tu seras prévenu·e dès qu'une date est annoncée.
                </p>
                <button onClick={() => setFenetre({ offre: null, type: "interet" })}
                  className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-strong">
                  Me prévenir
                </button>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ══ MODULES À LA CARTE ════════════════════════════════════════════════ */}
      <section className="relative bg-[rgb(239,244,239)]">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(22,92,71,0.12),transparent)]" />
        <div className="site-shell-wide px-6 py-14 md:px-10 lg:px-14 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start lg:gap-16">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.26em] text-primary/80">Modules à la carte · Full Artist</p>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
                Un module, sans t'engager pour l'année
              </h2>
              <p className="mt-4 text-sm leading-7 text-black/60 sm:text-base">
                Chaque période de l'année, le Full Artist propose un module de 7 semaines, avec un certificat à la clé.
                Quand il reste des places dans un groupe, le module s'ouvre aux personnes extérieures.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button onClick={() => setFenetre({ offre: null, type: "interet" })}
                  className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-strong">
                  Je suis intéressé·e
                </button>
                <Link href="/cours/full-artist" className="rounded-full border border-black/12 bg-white px-6 py-3 text-center text-sm font-medium text-black/70 transition hover:border-black/25">
                  Découvrir le Full Artist
                </Link>
              </div>
            </Reveal>

            <Reveal delay={1}>
              <ol className="space-y-3">
                {[
                  { n: "01", titre: "Dès maintenant : la liste d'intérêt", texte: "Sans engagement. Tu indiques le ou les modules qui t'intéressent, on te prévient en premier." },
                  { n: "02", titre: "Fin août : ouverture des places", texte: "Une fois les groupes de l'année composés, les places libres s'ouvrent module par module, environ trois semaines avant chaque période." },
                  { n: "03", titre: "Envie de continuer ?", texte: "Tu peux rejoindre le parcours Full Artist complet à la période suivante : le prix de ton module est déduit." },
                ].map((e) => (
                  <li key={e.n} className="flex gap-4 rounded-[20px] bg-white px-5 py-5" style={{ border: "1px solid rgba(0,0,0,0.05)" }}>
                    <span className="text-2xl font-semibold tracking-tight" style={{ color: "rgba(22,92,71,0.25)" }}>{e.n}</span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: VERT }}>{e.titre}</p>
                      <p className="mt-1 text-sm leading-6 text-black/55">{e.texte}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}