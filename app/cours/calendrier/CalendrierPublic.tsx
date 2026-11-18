"use client";
// app/cours/calendrier/CalendrierPublic.tsx
// Page publique : semaine type + calendrier de l'année (11/11/2026).
// Tout est calculé à partir des tables planning_creneaux et
// calendrier_evenements (voir lib/calendrier.ts).

import { useMemo, useState } from "react";
import Link from "next/link";
import Reveal from "@/app/components/Reveal";
import {
  CATEGORIES, TYPES_EVENEMENT, JOURS, JOURS_COURTS, MOIS,
  construireAnnee, trierCreneaux, libelleAnnee, estReserve, lundiDe, FREQUENCES,
  libelleReserve, datesPropres, estTypeCalendrier,
  ajouterJours, jourSemaine, versTexte, dateLongue, dateCourte, periodeTexte,
  heureCourte, enMinutes,
  type CreneauPlanning, type EvenementCalendrier, type CategorieCreneau, type Annee, type Frequence,
} from "@/lib/calendrier";

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const VERT = "rgb(22,92,71)";
const OR = "rgb(185,151,83)";
const SABLE = "rgba(196,180,150,0.38)";
const PX_HEURE = 54;

type Filtre = "tous" | "comedie-musicale" | "full-artist" | "jeunes" | "session" | "specifique";

const FILTRES: { id: Filtre; label: string; categories: CategorieCreneau[] }[] = [
  { id: "tous",             label: "Tout voir",            categories: [] },
  { id: "comedie-musicale", label: "Comédie musicale",     categories: ["comedie-musicale"] },
  { id: "full-artist",      label: "Full Artist",          categories: ["full-artist"] },
  { id: "jeunes",           label: "Éveil & initiation",   categories: ["eveil", "initiation"] },
  { id: "session",          label: "Sessions collectives", categories: ["session"] },
  { id: "specifique",       label: "Cours spécifiques",    categories: ["cours-specifique"] },
];

// Types d'événements signalés par un point dans le calendrier
const TYPES_PONCTUELS = ["evenement"] as const;

const correspond = (c: CreneauPlanning, f: Filtre) =>
  f === "tous" || FILTRES.find((x) => x.id === f)!.categories.includes(c.categorie);

// Deux créneaux identiques (même jour, mêmes heures, même titre) en semaine A et
// en semaine B sont affichés comme une seule carte « A / B » dans la semaine type.
type CreneauAffiche = CreneauPlanning & { alterne?: { a: string | null; b: string | null } };

function fusionnerAB(liste: CreneauPlanning[]): CreneauAffiche[] {
  const res: CreneauAffiche[] = [];
  const utilises = new Set<string>();
  for (const c of liste) {
    if (utilises.has(c.id)) continue;
    if (c.frequence !== "hebdo") {
      const autre = liste.find((x) =>
        !utilises.has(x.id) && x.id !== c.id && x.frequence !== "hebdo" && x.frequence !== c.frequence &&
        x.jour === c.jour && x.heure_debut === c.heure_debut && x.heure_fin === c.heure_fin &&
        x.titre === c.titre && x.categorie === c.categorie &&
        x.date_debut === c.date_debut && x.date_fin === c.date_fin
      );
      if (autre) {
        const a = c.frequence === "semaine_a" ? c : autre;
        const b = c.frequence === "semaine_a" ? autre : c;
        const age = (x: CreneauPlanning) => (x.sous_titre ?? "").split(" · ")[0];
        utilises.add(c.id); utilises.add(autre.id);
        res.push({
          ...a,
          sous_titre: age(a) === age(b) ? age(a) || null : [age(a), age(b)].filter(Boolean).join(" / ") || null,
          note: [a.note, b.note].find(Boolean) ?? null,
          alterne: { a: a.sous_titre, b: b.sous_titre },
        });
        continue;
      }
    }
    utilises.add(c.id);
    res.push(c);
  }
  return res;
}

// ─── PETITS COMPOSANTS ────────────────────────────────────────────────────────

function Surtitre({ children }: { children: React.ReactNode }) {
  return <p className="text-xs uppercase tracking-[0.26em] text-primary/80">{children}</p>;
}

function PastilleSemaine({ frequence, claire, alterne }: { frequence: Frequence; claire?: boolean; alterne?: boolean }) {
  if (frequence === "hebdo" && !alterne) return null;
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-full px-1.5 py-px text-[9px] font-bold uppercase tracking-wider"
      style={{ background: claire ? "rgba(185,151,83,0.25)" : "rgba(185,151,83,0.18)", color: claire ? "rgb(230,205,150)" : "rgb(120,90,30)" }}
    >
      {alterne ? "A / B" : FREQUENCES[frequence].court}
    </span>
  );
}

// ─── SEMAINE TYPE : GRILLE (ordinateur) ───────────────────────────────────────

function CarteCreneau({ c, attenue, compacte }: { c: CreneauAffiche; attenue: boolean; compacte: boolean }) {
  const style = CATEGORIES[c.categorie];
  const individuel = c.categorie === "individuel";
  const session = c.categorie === "session";

  return (
    <div
      title={[
        `${c.titre}${c.sous_titre ? ` · ${c.sous_titre}` : ""}`,
        `${heureCourte(c.heure_debut)} – ${heureCourte(c.heure_fin)}`,
        c.alterne ? `Semaine A : ${c.alterne.a ?? ""}\nSemaine B : ${c.alterne.b ?? ""}` : "",
        c.note ?? "",
      ].filter(Boolean).join("\n")}
      className="h-full overflow-hidden rounded-[10px] transition-opacity duration-300"
      style={{
        opacity: attenue ? 0.22 : 1,
        background: individuel
          ? "repeating-linear-gradient(135deg, rgba(0,0,0,0.025) 0 8px, transparent 8px 16px)"
          : style.fond,
        border: individuel ? "1px dashed rgba(0,0,0,0.12)" : "none",
        borderLeft: individuel ? undefined : `3px solid ${style.trait}`,
        padding: compacte ? "4px 7px" : "7px 9px",
        color: style.texte,
      }}
    >
      {individuel ? (
        <div className="flex h-full flex-col items-center justify-center text-center">
          <p className="text-[11px] font-medium leading-4">{c.titre}</p>
          {c.sous_titre && <p className="mt-0.5 text-[10px] opacity-75">{c.sous_titre}</p>}
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-1">
            <p className={`font-semibold leading-tight ${compacte ? "text-[11px]" : "text-[12px]"}`}>{c.titre}</p>
            <PastilleSemaine frequence={c.frequence} claire={session} alterne={!!c.alterne} />
          </div>
          {c.sous_titre && (
            <p className={`mt-0.5 leading-tight ${compacte ? "text-[10px]" : "text-[11px]"}`} style={{ opacity: session ? 0.75 : 0.85 }}>
              {c.sous_titre}
            </p>
          )}
          {!compacte && (
            <p className="mt-1 text-[10px] tabular-nums" style={{ opacity: 0.6 }}>
              {heureCourte(c.heure_debut)} – {heureCourte(c.heure_fin)}
            </p>
          )}
          {datesPropres(c) && (
            <p className="mt-1 text-[10px] font-semibold" style={{ opacity: 0.75 }}>{datesPropres(c)}</p>
          )}
        </>
      )}
    </div>
  );
}

function GrilleSemaine({ creneaux: bruts, filtre }: { creneaux: CreneauPlanning[]; filtre: Filtre }) {
  const creneaux = useMemo(() => fusionnerAB(trierCreneaux(bruts)), [bruts]);
  const jours = [1, 2, 3, 4, 5, 6, 7].filter((j) => creneaux.some((c) => c.jour === j));
  const hMin = Math.min(9, ...creneaux.map((c) => Math.floor(enMinutes(c.heure_debut) / 60)));
  const hMax = Math.max(21, ...creneaux.map((c) => Math.ceil(enMinutes(c.heure_fin) / 60)));
  const heures = Array.from({ length: hMax - hMin + 1 }, (_, i) => hMin + i);
  const hauteur = (hMax - hMin) * PX_HEURE;

  // Répartition en colonnes si deux créneaux se chevauchent le même jour
  const placement = useMemo(() => {
    const res = new Map<string, { voie: number; voies: number }>();
    for (const j of jours) {
      const duJour = trierCreneaux(creneaux.filter((c) => c.jour === j));
      const finsVoies: number[] = [];
      const voies = new Map<string, number>();
      for (const c of duJour) {
        const d = enMinutes(c.heure_debut);
        let v = finsVoies.findIndex((f) => f <= d);
        if (v === -1) { v = finsVoies.length; finsVoies.push(0); }
        finsVoies[v] = enMinutes(c.heure_fin);
        voies.set(c.id, v);
      }
      for (const c of duJour) {
        const d = enMinutes(c.heure_debut), f = enMinutes(c.heure_fin);
        const chevauchants = duJour.filter((x) => enMinutes(x.heure_debut) < f && enMinutes(x.heure_fin) > d);
        res.set(c.id, { voie: voies.get(c.id)!, voies: Math.max(...chevauchants.map((x) => voies.get(x.id)!)) + 1 });
      }
    }
    return res;
  }, [creneaux]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="overflow-hidden rounded-[24px] border border-black/6 bg-white shadow-[0_8px_40px_rgba(16,16,16,0.05)]">
      {/* En-têtes des jours */}
      <div className="grid border-b border-black/6" style={{ gridTemplateColumns: `56px repeat(${jours.length}, minmax(0,1fr))` }}>
        <div />
        {jours.map((j) => (
          <div key={j} className="border-l border-black/5 px-3 py-3.5 text-center">
            <p className="text-[13px] font-semibold text-black/80">{JOURS[j - 1]}</p>
          </div>
        ))}
      </div>

      {/* Corps */}
      <div className="grid" style={{ gridTemplateColumns: `56px repeat(${jours.length}, minmax(0,1fr))` }}>
        {/* Heures */}
        <div className="relative" style={{ height: hauteur }}>
          {heures.slice(0, -1).map((h, i) => (
            <span key={h} className="absolute right-2 -translate-y-1/2 text-[10px] tabular-nums text-black/35" style={{ top: i * PX_HEURE + (i === 0 ? 8 : 0) }}>
              {h}h
            </span>
          ))}
        </div>

        {jours.map((j) => (
          <div key={j} className="relative border-l border-black/5" style={{ height: hauteur }}>
            {heures.slice(1, -1).map((h, i) => (
              <div key={h} className="absolute inset-x-0 border-t border-black/[0.045]" style={{ top: (i + 1) * PX_HEURE }} />
            ))}
            {creneaux.filter((c) => c.jour === j).map((c) => {
              const top = ((enMinutes(c.heure_debut) - hMin * 60) / 60) * PX_HEURE;
              const h = ((enMinutes(c.heure_fin) - enMinutes(c.heure_debut)) / 60) * PX_HEURE;
              const p = placement.get(c.id) ?? { voie: 0, voies: 1 };
              const attenue = c.categorie === "individuel" ? filtre !== "tous" : !correspond(c, filtre);
              return (
                <div
                  key={c.id}
                  className="absolute p-[3px]"
                  style={{ top, height: h, left: `${(p.voie / p.voies) * 100}%`, width: `${100 / p.voies}%` }}
                >
                  <CarteCreneau c={c} attenue={attenue} compacte={h < PX_HEURE * 1.5} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SEMAINE TYPE : LISTE (téléphone) ─────────────────────────────────────────

function ListeSemaine({ creneaux, filtre }: { creneaux: CreneauPlanning[]; filtre: Filtre }) {
  const jours = [1, 2, 3, 4, 5, 6, 7].filter((j) => creneaux.some((c) => c.jour === j));
  const [jour, setJour] = useState(jours[0] ?? 1);
  const duJour = fusionnerAB(trierCreneaux(creneaux.filter((c) => c.jour === jour && correspond(c, filtre))));

  return (
    <div>
      <div className="-mx-1 mb-4 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {jours.map((j) => (
          <button
            key={j}
            onClick={() => setJour(j)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${jour === j ? "bg-primary text-white" : "border border-black/10 bg-white text-black/60"}`}
          >
            {JOURS[j - 1].slice(0, 3)}.
          </button>
        ))}
      </div>
      <div className="space-y-2.5">
        {duJour.length === 0 && <p className="rounded-[16px] bg-white px-4 py-6 text-center text-sm text-black/45">Rien de prévu ce jour-là pour ce filtre.</p>}
        {duJour.map((c) => {
          const s = CATEGORIES[c.categorie];
          return (
            <div key={c.id} className="flex gap-3 rounded-[16px] bg-white p-3.5" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
              <div className="w-14 shrink-0 text-xs font-semibold tabular-nums text-black/60">
                {heureCourte(c.heure_debut)}<br /><span className="font-normal text-black/35">{heureCourte(c.heure_fin)}</span>
              </div>
              <div className="min-w-0 flex-1 border-l-[3px] pl-3" style={{ borderColor: s.trait }}>
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-sm font-semibold text-black/85">{c.titre}</p>
                  <PastilleSemaine frequence={c.frequence} alterne={!!c.alterne} />
                </div>
                {c.sous_titre && <p className="text-[13px] text-black/55">{c.sous_titre}</p>}
                {c.alterne && (
                  <p className="mt-1 text-xs leading-5 text-black/50">
                    Semaine A : {c.alterne.a}<br />Semaine B : {c.alterne.b}
                  </p>
                )}
                {datesPropres(c) && <p className="mt-0.5 text-xs font-medium text-black/60">{datesPropres(c)}</p>}
                {c.note && <p className="mt-1 text-xs text-black/40">{c.note}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ANNÉE : RUBAN DES PÉRIODES ───────────────────────────────────────────────

function RubanPeriodes({ annee, evenements }: { annee: Annee; evenements: EvenementCalendrier[] }) {
  const conges = evenements.filter((e) => e.type === "conge");
  const nomPause = (apres: string, avant: string) =>
    conges.find((e) => e.date_debut <= avant && (e.date_fin ?? e.date_debut) >= apres)?.titre.replace(/^Vacances (d'|de )/i, "") ?? "Pause";

  const segments: { type: "periode" | "pause"; jours: number; label: string; sous: string; numero?: number }[] = [];
  annee.periodes.forEach((p, i) => {
    if (i > 0) {
      const prec = annee.periodes[i - 1];
      const debutPause = ajouterJours(prec.fin, 1);
      const finPause = ajouterJours(p.debut, -1);
      const jours = Math.round((Date.parse(p.debut) - Date.parse(prec.fin)) / 86400000) - 1;
      segments.push({ type: "pause", jours, label: nomPause(debutPause, finPause), sous: "" });
    }
    const jours = Math.round((Date.parse(p.fin) - Date.parse(p.debut)) / 86400000) + 1;
    segments.push({
      type: "periode", jours, numero: p.numero,
      label: `Période ${p.numero}`,
      sous: `${p.nbSemaines} sem. · ${dateCourte(p.debut)} → ${dateCourte(p.fin)}`,
    });
  });

  return (
    <>
      {/* Ordinateur : ruban horizontal proportionnel */}
      <div className="hidden overflow-hidden rounded-[20px] border border-black/6 bg-white p-2 md:flex">
        {segments.map((s, i) =>
          s.type === "periode" ? (
            <div key={i} className="min-w-0 rounded-[14px] px-3.5 py-3" style={{ flex: s.jours, background: "rgba(22,92,71,0.08)" }}>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-semibold" style={{ color: VERT }}>{s.label}</p>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ background: "rgba(185,151,83,0.18)", color: "rgb(120,90,30)" }}>
                  Module {s.numero}
                </span>
              </div>
              <p className="mt-1 truncate text-[11px] text-black/50">{s.sous}</p>
            </div>
          ) : (
            <div key={i} className="mx-1 flex min-w-[54px] items-center justify-center rounded-[14px] px-1" style={{ flex: s.jours, background: `repeating-linear-gradient(135deg, ${SABLE} 0 6px, rgba(196,180,150,0.18) 6px 12px)` }}>
              <p className="text-center text-[10px] font-medium leading-tight text-black/50">{s.label}</p>
            </div>
          )
        )}
      </div>

      {/* Téléphone : liste */}
      <div className="space-y-2 md:hidden">
        {segments.map((s, i) =>
          s.type === "periode" ? (
            <div key={i} className="flex items-center justify-between rounded-[16px] px-4 py-3" style={{ background: "rgba(22,92,71,0.08)" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: VERT }}>{s.label}</p>
                <p className="text-xs text-black/50">{s.sous}</p>
              </div>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ background: "rgba(185,151,83,0.18)", color: "rgb(120,90,30)" }}>
                Module {s.numero}
              </span>
            </div>
          ) : (
            <p key={i} className="px-4 text-xs text-black/40">↓ {s.label}</p>
          )
        )}
      </div>
    </>
  );
}

// ─── ANNÉE : MOIS ─────────────────────────────────────────────────────────────

function Mois({
  annee, a, m, selection, onChoisir,
}: { annee: Annee; a: number; m: number; selection: string | null; onChoisir: (d: string) => void }) {
  const premier = versTexte(new Date(Date.UTC(a, m, 1)));
  const nbJours = new Date(Date.UTC(a, m + 1, 0)).getUTCDate();
  const decalage = jourSemaine(premier) - 1;
  const cases: (string | null)[] = [
    ...Array(decalage).fill(null),
    ...Array.from({ length: nbJours }, (_, i) => ajouterJours(premier, i)),
  ];

  return (
    <div className="rounded-[20px] border border-black/6 bg-white p-4">
      <p className="mb-3 text-sm font-semibold capitalize text-black/80">
        {MOIS[m]} <span className="font-normal text-black/35">{a}</span>
      </p>
      <div className="grid gap-[3px] text-center" style={{ gridTemplateColumns: "14px repeat(7, minmax(0, 1fr))" }}>
        <span />
        {JOURS_COURTS.map((j, i) => (
          <span key={i} className="pb-1 text-[10px] font-medium text-black/30">{j}</span>
        ))}
        {cases.map((d, i) => {
          // Lettre de la semaine (A/B) en début de chaque ligne
          const debutLigne = i % 7 === 0;
          const jourRef = debutLigne ? cases.slice(i, i + 7).find((x) => x) ?? null : null;
          const lettre = jourRef ? annee.infoJour(lundiDe(jourRef)).semaine?.lettre ?? null : null;
          const cellLettre = debutLigne ? (
            <span key={`l${i}`} className="flex items-center justify-center text-[9px] font-bold" style={{ color: lettre === "A" ? VERT : OR }}>
              {lettre ?? ""}
            </span>
          ) : null;
          if (!d) return cellLettre ? [cellLettre, <span key={i} />] : <span key={i} />;
          const info = annee.infoJour(d);
          const types = info.evenements.map((e) => e.type);
          const ferie = types.includes("ferie");
          const spectacle = types.includes("spectacle");
          const borne = types.includes("debut_cours") || types.includes("fin_cours");
          const essai = types.includes("essai");
          const ponctuel = info.evenements.find((e) => (TYPES_PONCTUELS as readonly string[]).includes(e.type));
          const choisi = selection === d;

          let fond = "transparent", texte = "rgba(0,0,0,0.25)";
          if (info.statut === "cours") { fond = "rgba(22,92,71,0.11)"; texte = "rgba(0,0,0,0.75)"; }
          else if (info.statut === "libre") { texte = "rgba(0,0,0,0.5)"; }
          else if (info.statut === "ferme") { fond = ferie ? "rgba(200,80,60,0.12)" : SABLE; texte = ferie ? "rgb(170,60,45)" : "rgba(0,0,0,0.4)"; }
          if (spectacle) { fond = OR; texte = "white"; }
          if (borne) { fond = VERT; texte = "white"; }

          const bouton = (
            <button
              key={i}
              onClick={() => onChoisir(d)}
              className="relative flex aspect-square items-center justify-center rounded-[7px] text-[11px] font-medium tabular-nums transition hover:ring-2 hover:ring-black/15"
              style={{ background: fond, color: texte, boxShadow: choisi ? `0 0 0 2px ${OR}` : undefined }}
              aria-label={dateLongue(d)}
            >
              {Number(d.slice(8))}
              {info.session && !spectacle && (
                <span className="absolute bottom-[3px] h-[4px] w-[4px] rounded-full" style={{ background: OR }} />
              )}
              {essai && info.statut !== "hors" && (
                <span className="absolute inset-x-[3px] top-[2px] h-[2px] rounded-full" style={{ background: "rgba(84,132,170,0.7)" }} />
              )}
              {ponctuel && !spectacle && !borne && (
                <span className="absolute right-[3px] top-[3px] h-[6px] w-[6px] rounded-full ring-1 ring-white" style={{ background: TYPES_EVENEMENT[ponctuel.type].couleur }} />
              )}
            </button>
          );
          return cellLettre ? [cellLettre, bouton] : bouton;
        })}
      </div>
    </div>
  );
}

function DetailJour({ annee, date, creneaux }: { annee: Annee; date: string; creneaux: CreneauPlanning[] }) {
  const info = annee.infoJour(date);
  const js = jourSemaine(date);
  const duJour = info.statut === "cours" || info.statut === "libre"
    ? trierCreneaux(creneaux.filter((c) =>
        c.jour === js && c.categorie !== "individuel" && annee.rangSeance(c, date) !== null
      ))
    : [];
  const avecCours = !!info.semaine && info.statut !== "ferme" && info.statut !== "hors";

  return (
    <div className="rounded-[20px] p-5" style={{ background: "rgb(12,50,38)" }}>
      <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Jour sélectionné</p>
      <p className="mt-1 text-lg font-semibold capitalize text-white">{dateLongue(date)}</p>
      {info.semaine && info.statut !== "hors" && (
        <p className="mt-1 text-xs text-white/55">
          Semaine {info.semaine.numero} ({info.semaine.lettre}) · Période {info.semaine.periode}
        </p>
      )}

      <div className="mt-4 space-y-2">
        {info.evenements.map((e) => (
          <div key={e.id} className="flex items-start gap-2">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: TYPES_EVENEMENT[e.type].couleur }} />
            <div>
              <p className="text-sm font-medium text-white">{e.titre}</p>
              {e.description && <p className="text-xs text-white/50">{e.description}</p>}
            </div>
          </div>
        ))}
        {info.statut === "hors" && info.evenements.length === 0 && <p className="text-sm text-white/55">En dehors de l'année de cours.</p>}
        {info.statut === "ferme" && <p className="text-sm text-white/55">Pas de cours ce jour-là.</p>}
        {avecCours && duJour.map((c) => {
          const rang = annee.rangSeance(c, date);
          const reserve = estReserve(c, rang);
          return (
            <div key={c.id} className="flex items-center gap-2.5 rounded-[12px] bg-white/[0.06] px-3 py-2">
              <span className="h-6 w-[3px] shrink-0 rounded-full" style={{ background: reserve ? "rgba(255,255,255,0.25)" : CATEGORIES[c.categorie].trait }} />
              <p className="min-w-0 flex-1 text-sm text-white/85">
                <span className="font-medium">{c.titre}</span>
                {c.sous_titre && <span className="text-white/50"> · {c.sous_titre}</span>}
                {reserve ? (
                  <span className="ml-1.5 rounded-full px-1.5 py-px text-[10px] font-semibold" style={{ background: "rgba(185,151,83,0.25)", color: "rgb(230,205,150)" }}>
                    {libelleReserve(c)}
                  </span>
                ) : rang !== null && c.seances_max ? (
                  <span className="text-white/40"> · cours {rang}/{c.seances_max}</span>
                ) : null}
              </p>
              <span className="shrink-0 text-xs tabular-nums text-white/45">{heureCourte(c.heure_debut)}–{heureCourte(c.heure_fin)}</span>
            </div>
          );
        })}
        {avecCours && duJour.length === 0 && info.evenements.length === 0 && (
          <p className="text-sm text-white/55">Pas de cours collectif ce jour-là.</p>
        )}
      </div>
    </div>
  );
}

function Legende() {
  const items: { rendu: React.ReactNode; label: string }[] = [
    { rendu: <span className="h-3.5 w-3.5 rounded-[4px]" style={{ background: "rgba(22,92,71,0.14)" }} />, label: "Jour de cours" },
    { rendu: <span className="h-3.5 w-3.5 rounded-[4px]" style={{ background: SABLE }} />, label: "Congé" },
    { rendu: <span className="h-3.5 w-3.5 rounded-[4px]" style={{ background: "rgba(200,80,60,0.14)" }} />, label: "Jour férié" },
    { rendu: <span className="flex h-3.5 w-3.5 items-end justify-center pb-[2px]"><span className="h-1 w-1 rounded-full" style={{ background: OR }} /></span>, label: "Session collective" },
    { rendu: <span className="w-3.5 text-center text-[10px] font-bold" style={{ color: VERT }}>A</span>, label: "Semaine A · sessions des groupes lun./mar." },
    { rendu: <span className="w-3.5 text-center text-[10px] font-bold" style={{ color: OR }}>B</span>, label: "Semaine B · sessions des groupes jeu./ven." },
    { rendu: <span className="h-3.5 w-3.5 rounded-[4px]" style={{ background: OR }} />, label: "Spectacle" },
    { rendu: <span className="h-3.5 w-3.5 rounded-[4px]" style={{ background: VERT }} />, label: "Début / fin des cours" },
    { rendu: <span className="flex h-3.5 w-3.5 items-start"><span className="mt-[1px] h-[2px] w-full rounded-full" style={{ background: "rgba(84,132,170,0.7)" }} /></span>, label: "Mois d'essai" },
  ];
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-2 text-xs text-black/55">{i.rendu}{i.label}</span>
      ))}
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function CalendrierPublic({
  creneaux, evenements,
}: { creneaux: CreneauPlanning[]; evenements: EvenementCalendrier[] }) {
  const [filtre, setFiltre] = useState<Filtre>("tous");
  const annee = useMemo(() => construireAnnee(evenements, creneaux), [evenements, creneaux]);
  const [selection, setSelection] = useState<string | null>(annee?.debut ?? null);

  const spectacle = evenements.find((e) => e.type === "spectacle");
  const premiereSession = creneaux.find((c) => c.categorie === "session");
  const sessionsParGroupe = annee && premiereSession ? annee.seances(premiereSession).comptees : null;

  // Nombre de cours sur l'année, par parcours et par jour
  const comptes = useMemo(() => {
    if (!annee) return [];
    const vus = new Map<string, { label: string; jour: string; seances: number; reserve: number; libelleReserve: string; dates: string | null; couleur: string }>();
    for (const c of trierCreneaux(creneaux)) {
      if (c.categorie === "individuel" || c.categorie === "autre") continue;
      const cle = `${c.categorie}-${c.jour}-${c.frequence}-${c.date_debut}-${c.date_fin}`;
      if (vus.has(cle)) continue;
      const s = annee.seances(c);
      vus.set(cle, {
        label: c.categorie === "session" ? "Session collective" : CATEGORIES[c.categorie].label,
        jour: JOURS[c.jour - 1] + (c.frequence === "hebdo" ? "" : ` · ${FREQUENCES[c.frequence].court}`),
        seances: s.comptees,
        reserve: s.reserve,
        libelleReserve: libelleReserve(c),
        dates: datesPropres(c),
        couleur: CATEGORIES[c.categorie].trait,
      });
    }
    return [...vus.values()];
  }, [annee, creneaux]);

  // Le calendrier ne montre que l'année des parcours (stages & co : page /stages)
  const datesCles = evenements.filter((e) => estTypeCalendrier(e.type)); // déjà triés par date côté serveur

  return (
    <main className="min-h-screen text-foreground">

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-background pb-14 pt-12 md:pb-16 md:pt-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(185,151,83,0.07),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(22,92,71,0.05),transparent_40%)]" />
        <div className="relative site-shell-wide px-6 md:px-10 lg:px-14">
          <Reveal>
            <Surtitre>Nos cours · {annee ? `Année ${libelleAnnee(annee)}` : "Calendrier"}</Surtitre>
            <div className="my-5 h-px w-12 bg-[rgb(185,151,83)]" />
            <h1 className="max-w-8xl text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-[3.4rem]">
              Une semaine, une année&nbsp;:{" "}
              <span className="text-primary">le rythme Crea'Star</span>
            </h1>
            <p className="mt-6 max-w-8xl text-sm leading-7 text-black/58 sm:text-base sm:leading-8">
              Les horaires sont connus dès l'inscription. Chaque parcours a ses deux soirées dans la semaine,
              et l'année suit les congés scolaires de la Fédération Wallonie-Bruxelles.
            </p>
          </Reveal>

          {annee && (
            <Reveal delay={1}>
              <div className="mt-10 grid grid-cols-2 border-t border-black/8 lg:grid-cols-4">
                {[
                  { val: `${annee.semaines.length}`, label: "semaines de cours", sous: periodeTexte(annee.debut, annee.fin) },
                  { val: `${annee.periodes.length}`, label: "périodes", sous: "une par module Full Artist" },
                  { val: sessionsParGroupe !== null ? `${sessionsParGroupe}` : "—", label: "sessions collectives", sous: "par groupe d'âge, 1 semaine sur 2" },
                  { val: spectacle ? dateCourte(spectacle.date_debut) : "Juin", label: "spectacle de fin d'année", sous: spectacle?.description ?? "" },
                ].map((s, i) => (
                  <div key={s.label} className={`border-b border-black/8 py-5 ${i % 2 === 0 ? "pr-5" : "pl-5 lg:pl-6"} lg:border-r lg:px-6 lg:first:pl-0 lg:last:border-r-0`}>
                    <p className="text-3xl font-semibold tracking-tight text-primary">{s.val}</p>
                    <p className="mt-1 text-sm font-medium text-black/75">{s.label}</p>
                    <p className="mt-0.5 text-xs text-black/40">{s.sous}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ══ SEMAINE TYPE ══════════════════════════════════════════════════════ */}
      <section className="relative bg-[rgb(239,244,239)]">
        <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(22,92,71,0.12),transparent)]" />
        <div className="site-shell-wide px-6 py-14 md:px-10 lg:px-14 lg:py-20">
          <Reveal>
            <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-5xl">
                <Surtitre>La semaine type</Surtitre>
                <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
                  Deux soirées par parcours
                </h2>
                <p className="mt-4 text-sm leading-7 text-black/60 sm:text-base">
                  Lundi ou jeudi pour la Comédie musicale, mardi ou vendredi pour le Full Artist. <br />
                  L'ouverture des deux jours par parcours dépendra du nombre d'inscriptions. Les groupes seront validés avant le paiement annuel / trimestriel.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {FILTRES.filter((f) => f.id === "tous" || creneaux.some((c) => correspond(c, f.id))).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFiltre(f.id)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${filtre === f.id ? "bg-primary text-white" : "border border-black/10 bg-white text-black/60 hover:border-black/20"}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={1}>
            {creneaux.length === 0 ? (
              <p className="rounded-[20px] bg-white px-6 py-10 text-center text-sm text-black/45">Les horaires seront publiés prochainement.</p>
            ) : (
              <>
                <div className="hidden md:block"><GrilleSemaine creneaux={creneaux} filtre={filtre} /></div>
                <div className="md:hidden"><ListeSemaine creneaux={creneaux} filtre={filtre} /></div>
              </>
            )}
          </Reveal>

          <Reveal delay={2}>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                { titre: "2 heures consécutives par semaine", texte: "Chaque groupe possède 2 heures de cours techniques par semaine selon le parcours choisi." },
                { titre: "Sessions de travail collectives", texte: "Une semaine sur deux, Comédie musicale et Full Artist du même âge préparent ensemble leurs projets annuels et/ou spectacle. Semaine A : groupes du lundi et du mardi. Semaine B : groupes du jeudi et du vendredi." },
                { titre: "Flexibilité des créneaux", texte: "Si un créneau manque d'inscriptions, deux jours du même programme peuvent être regroupés en un seul. Selon tes disponibilités reçues lors de ta candidature, nous trouverons une solution ensemble ou nous procèderons à un éventuel remboursement si aucune solution n'est possible. " },
              ].map((b) => (
                <div key={b.titre} className="rounded-[20px] bg-white/70 px-5 py-5" style={{ border: "1px solid rgba(0, 0, 0, 0.05)" }}>
                  <p className="text-sm font-semibold text-primary">{b.titre}</p>
                  <p className="mt-1.5 text-sm leading-6 text-black/55">{b.texte}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ L'ANNÉE ═══════════════════════════════════════════════════════════ */}
      <section className="relative bg-background">
        <div className="site-shell-wide px-6 py-14 md:px-10 lg:px-14 lg:py-20">
          <Reveal>
            <div className="mb-8 max-w-8xl">
              <Surtitre>Le calendrier de l'année</Surtitre>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
                {annee ? `${annee.periodes.length} périodes, ${annee.periodes.length} modules, un spectacle` : "Le calendrier arrive bientôt"}
              </h2>
              {annee && (
                <p className="mt-4 text-sm leading-7 text-black/60 sm:text-base">
                  Les congés scolaires découpent l'année en périodes de 6 à 7 semaines. <br />
                  Chaque période correspond à un module Full Artist, avec son certificat, ou à un cycle chant, danse et théâtre en Comédie musicale.
                </p>
              )}
            </div>
          </Reveal>

          {annee && (
            <>
              <Reveal delay={1}><RubanPeriodes annee={annee} evenements={evenements} /></Reveal>

              <div className="mt-10">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <Legende />
                  <p className="text-xs text-black/40">Clique sur un jour pour voir le détail.</p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                  {annee.mois.map(([a, m]) => (
                    <Mois key={`${a}-${m}`} annee={annee} a={a} m={m} selection={selection} onChoisir={setSelection} />
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
                <div className="lg:self-start">
                  {selection && <DetailJour annee={annee} date={selection} creneaux={creneaux} />}
                </div>
                <div>

                  <div className="rounded-[20px] border border-black/6 bg-white p-5">
                    <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">Dates clés</p>
                    <div className="space-y-3.5">
                      {datesCles.map((e) => (
                        <button key={e.id} onClick={() => setSelection(e.date_debut)} className="flex w-full items-start gap-3 text-left">
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: TYPES_EVENEMENT[e.type].couleur }} />
                          <span className="min-w-0">
                            <span className="block text-sm font-medium text-black/80">{e.titre}</span>
                            <span className="block text-xs text-black/45">{periodeTexte(e.date_debut, e.date_fin)}</span>
                            {e.description && <span className="block text-xs text-black/40">{e.description}</span>}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {comptes.length > 0 && (
                <Reveal>
                  <div className="mt-12">
                    <p className="mb-4 text-sm font-semibold text-black/75">Combien de cours sur l'année ?</p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                      {comptes.map((c) => (
                        <div key={c.label + c.jour} className="rounded-[18px] bg-white px-4 py-4" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
                          <div className="mb-2 h-1 w-8 rounded-full" style={{ background: c.couleur }} />
                          <p className="text-2xl font-semibold tabular-nums text-black/85">{c.seances}</p>
                          <p className="text-xs font-medium text-black/65">{c.label}</p>
                          <p className="text-xs text-black/40">{c.jour}</p>
                          {c.dates && <p className="text-xs text-black/40">{c.dates}</p>}
                          {c.reserve > 0 && (
                            <p className="mt-1.5 text-[11px] font-medium leading-4" style={{ color: "rgb(146,95,14)" }}>
                              + {c.reserve} séance{c.reserve > 1 ? "s" : ""} · {c.libelleReserve.toLowerCase().startsWith("séance") ? "de réserve" : c.libelleReserve}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-xs leading-5 text-black/40">
                      Calculé automatiquement : jours de cours, moins les congés et les jours fériés.
                      {comptes.some((c) => c.reserve > 0) && (
                        <> Les séances au-delà du nombre de cours prévu, en fin d'année, servent aux rattrapages, aux répétitions ou au studio.</>
                      )}
                    </p>
                  </div>
                </Reveal>
              )}
            </>
          )}

          <p className="mt-10 text-xs leading-6 text-black/40">
            Calendrier indicatif, aligné sur les congés scolaires de la Fédération Wallonie-Bruxelles.
            Les dates marquées « à confirmer » peuvent encore évoluer.
          </p>
        </div>
      </section>

      {/* ══ APPEL À L'ACTION ═════════════════════════════════════════════════ */}
      <section className="relative" style={{ background: "rgb(12,50,38)" }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(185,151,83,0.16),transparent_55%)]" />
        <div className="relative site-shell-wide flex flex-col gap-6 px-6 py-14 md:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-14 lg:py-16">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Un créneau te convient ?</h2>
            <p className="mt-2 text-sm text-white/60">Dépose ta candidature : tu choisis tes jours possibles dès le formulaire.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/plateforme/inscription" className="inline-flex items-center justify-center rounded-full border !border-white/25 px-6 py-3 bg-white text-l font-medium ttext-white transition hover:bg-white/80">
              Inscriptions
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}