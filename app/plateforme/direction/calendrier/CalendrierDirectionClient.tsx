"use client";
// app/plateforme/direction/calendrier/CalendrierDirectionClient.tsx
// Édition de la semaine type et du calendrier de l'année (11/11/2026).
// Chaque ligne s'enregistre séparément ; la page publique /cours/calendrier
// se met à jour immédiatement.

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock, ExternalLink, Plus, Trash2, Check, Eye, EyeOff, AlertTriangle } from "lucide-react";
import {
  CATEGORIES, TYPES_EVENEMENT, TYPES_CALENDRIER, JOURS, FREQUENCES,
  construireAnnee, trierCreneaux, periodeTexte, libelleAnnee,
  type CreneauPlanning, type EvenementCalendrier, type CategorieCreneau, type TypeEvenement, type Annee, type Frequence,
} from "@/lib/calendrier";

const VERT = "rgb(22,92,71)";

const champ = "rounded-[10px] border border-black/10 bg-white px-2.5 py-2 text-[13px] text-black outline-none focus:border-[rgb(22,92,71)]/50 focus:ring-2 focus:ring-[rgb(22,92,71)]/10";

type BrouillonCreneau = Omit<CreneauPlanning, "id"> & { id?: string };
type BrouillonEvenement = Omit<EvenementCalendrier, "id"> & { id?: string };

async function appeler(corps: object) {
  const r = await fetch("/api/direction/calendrier", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corps),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error ?? `Erreur ${r.status}`);
  return d;
}

// ─── BOUTONS DE LIGNE ─────────────────────────────────────────────────────────

function ActionsLigne({
  modifie, nouveau, chargement, onEnregistrer, onSupprimer, onAnnuler,
}: {
  modifie: boolean; nouveau: boolean; chargement: boolean;
  onEnregistrer: () => void; onSupprimer: () => void; onAnnuler: () => void;
}) {
  const [confirmer, setConfirmer] = useState(false);
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {(modifie || nouveau) && (
        <button onClick={onEnregistrer} disabled={chargement}
          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
          style={{ background: VERT }}>
          <Check size={12} /> {chargement ? "…" : "Enregistrer"}
        </button>
      )}
      {nouveau ? (
        <button onClick={onAnnuler} className="rounded-full px-3 py-1.5 text-xs text-black/50 hover:bg-black/5">Annuler</button>
      ) : confirmer ? (
        <>
          <button onClick={() => { setConfirmer(false); onSupprimer(); }} disabled={chargement}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50" style={{ background: "rgb(200,40,40)" }}>
            Supprimer
          </button>
          <button onClick={() => setConfirmer(false)} className="rounded-full px-2 py-1.5 text-xs text-black/50 hover:bg-black/5">Non</button>
        </>
      ) : (
        <button onClick={() => setConfirmer(true)} title="Supprimer" className="rounded-full p-2 text-black/30 transition hover:bg-red-50 hover:text-red-600">
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}

function BoutonVisible({ visible, onChange }: { visible: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!visible)} title={visible ? "Visible sur le site" : "Masqué du site"}
      className="shrink-0 rounded-full p-2 transition hover:bg-black/5" style={{ color: visible ? VERT : "rgba(0,0,0,0.3)" }}>
      {visible ? <Eye size={15} /> : <EyeOff size={15} />}
    </button>
  );
}

// ─── LIGNE : CRÉNEAU ──────────────────────────────────────────────────────────

function LigneCreneau({
  initial, annee, onFini, onErreur,
}: { initial: BrouillonCreneau; annee: Annee | null; onFini: () => void; onErreur: (m: string) => void }) {
  const [c, setC] = useState(initial);
  const [chargement, setChargement] = useState(false);
  const nouveau = !initial.id;
  const modifie = JSON.stringify(c) !== JSON.stringify(initial);
  const maj = <K extends keyof BrouillonCreneau>(k: K, v: BrouillonCreneau[K]) => setC((x) => ({ ...x, [k]: v }));
  const compte = annee && c.categorie !== "individuel" ? annee.seances(c) : null;

  const executer = async (corps: object) => {
    setChargement(true);
    try { await appeler(corps); onFini(); }
    catch (e: any) { onErreur(e.message); }
    finally { setChargement(false); }
  };

  return (
    <div className="rounded-[14px] border bg-white p-3" style={{ borderColor: modifie || nouveau ? "rgba(185,151,83,0.5)" : "rgba(0,0,0,0.07)", opacity: c.visible ? 1 : 0.6 }}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="h-8 w-1 shrink-0 rounded-full" style={{ background: CATEGORIES[c.categorie].trait }} />
        <select className={champ} value={c.jour} onChange={(e) => maj("jour", Number(e.target.value))}>
          {JOURS.map((j, i) => <option key={j} value={i + 1}>{j}</option>)}
        </select>
        <input type="time" className={`${champ} w-[104px]`} value={c.heure_debut.slice(0, 5)} onChange={(e) => maj("heure_debut", e.target.value)} />
        <span className="text-xs text-black/30">→</span>
        <input type="time" className={`${champ} w-[104px]`} value={c.heure_fin.slice(0, 5)} onChange={(e) => maj("heure_fin", e.target.value)} />
        <input className={`${champ} min-w-[160px] flex-1`} placeholder="Titre" value={c.titre} onChange={(e) => maj("titre", e.target.value)} />
        <input className={`${champ} min-w-[160px] flex-1`} placeholder="Sous-titre (âges, groupes…)" value={c.sous_titre ?? ""} onChange={(e) => maj("sous_titre", e.target.value)} />
        <select className={champ} value={c.categorie} onChange={(e) => maj("categorie", e.target.value as CategorieCreneau)}>
          {(Object.keys(CATEGORIES) as CategorieCreneau[]).map((k) => <option key={k} value={k}>{CATEGORIES[k].label}</option>)}
        </select>
        <select className={champ} value={c.frequence} onChange={(e) => maj("frequence", e.target.value as BrouillonCreneau["frequence"])}>
          {(Object.keys(FREQUENCES) as Frequence[]).map((k) => <option key={k} value={k}>{FREQUENCES[k].label}</option>)}
        </select>
        <BoutonVisible visible={c.visible} onChange={(v) => maj("visible", v)} />
        <ActionsLigne
          modifie={modifie} nouveau={nouveau} chargement={chargement}
          onEnregistrer={() => executer({ action: "enregistrer_creneau", creneau: c })}
          onSupprimer={() => executer({ action: "supprimer_creneau", id: c.id })}
          onAnnuler={onFini}
        />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input className={`${champ} min-w-[240px] flex-1`} placeholder="Note affichée au survol (facultatif)" value={c.note ?? ""} onChange={(e) => maj("note", e.target.value)} />
        {c.categorie !== "individuel" && (
          <label className="flex items-center gap-2 text-xs text-black/50">
            Séances max / an
            <input type="number" min={1} max={60} placeholder="—" className={`${champ} w-[72px]`}
              value={c.seances_max ?? ""}
              onChange={(e) => maj("seances_max", e.target.value ? Number(e.target.value) : null)} />
          </label>
        )}
        {compte && (
          <span className="rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ background: "rgb(239,244,239)", color: VERT }}>
            {compte.comptees} cours cette année
            {compte.reserve > 0 && <span style={{ color: "rgb(146,95,14)" }}> + {compte.reserve} au-delà</span>}
          </span>
        )}
      </div>
      {c.categorie !== "individuel" && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-black/50">
          <span>Dates propres</span>
          <input type="date" className={champ} value={c.date_debut ?? ""} onChange={(e) => maj("date_debut", e.target.value || null)} title="Vide = début de l'année de cours" />
          <span className="text-black/30">→</span>
          <input type="date" className={champ} value={c.date_fin ?? ""} onChange={(e) => maj("date_fin", e.target.value || null)} title="Vide = fin de l'année de cours" />
          <span className="text-black/35">(vide = toute l'année)</span>
          {c.seances_max && (
            <input className={`${champ} min-w-[220px] flex-1`} placeholder="Nom des séances au-delà du max (ex. Studio · finalisation de la maquette)"
              value={c.libelle_reserve ?? ""} onChange={(e) => maj("libelle_reserve", e.target.value || null)} />
          )}
        </div>
      )}
    </div>
  );
}

// ─── LIGNE : ÉVÉNEMENT ────────────────────────────────────────────────────────

function LigneEvenement({
  initial, onFini, onErreur,
}: { initial: BrouillonEvenement; onFini: () => void; onErreur: (m: string) => void }) {
  const [e, setE] = useState(initial);
  const [chargement, setChargement] = useState(false);
  const nouveau = !initial.id;
  const modifie = JSON.stringify(e) !== JSON.stringify(initial);
  const maj = <K extends keyof BrouillonEvenement>(k: K, v: BrouillonEvenement[K]) => setE((x) => ({ ...x, [k]: v }));
  const unJour = e.type === "debut_cours" || e.type === "fin_cours" || e.type === "spectacle";

  const executer = async (corps: object) => {
    setChargement(true);
    try { await appeler(corps); onFini(); }
    catch (err: any) { onErreur(err.message); }
    finally { setChargement(false); }
  };

  return (
    <div className="rounded-[14px] border bg-white p-3" style={{ borderColor: modifie || nouveau ? "rgba(185,151,83,0.5)" : "rgba(0,0,0,0.07)", opacity: e.visible ? 1 : 0.6 }}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: TYPES_EVENEMENT[e.type].couleur }} />
        <select className={champ} value={e.type} onChange={(ev) => maj("type", ev.target.value as TypeEvenement)}>
          {[...TYPES_CALENDRIER, ...(TYPES_CALENDRIER.includes(e.type) ? [] : [e.type])].map((k) => (
            <option key={k} value={k}>{TYPES_EVENEMENT[k].label}{TYPES_CALENDRIER.includes(k) ? "" : " (à déplacer dans Offres)"}</option>
          ))}
        </select>
        <input className={`${champ} min-w-[200px] flex-1`} placeholder="Titre" value={e.titre} onChange={(ev) => maj("titre", ev.target.value)} />
        <input type="date" className={champ} value={e.date_debut} onChange={(ev) => maj("date_debut", ev.target.value)} />
        {!unJour && (
          <>
            <span className="text-xs text-black/30">→</span>
            <input type="date" className={champ} value={e.date_fin ?? ""} onChange={(ev) => maj("date_fin", ev.target.value || null)} title="Laisser vide pour un seul jour" />
          </>
        )}
        <BoutonVisible visible={e.visible} onChange={(v) => maj("visible", v)} />
        <ActionsLigne
          modifie={modifie} nouveau={nouveau} chargement={chargement}
          onEnregistrer={() => executer({ action: "enregistrer_evenement", evenement: unJour ? { ...e, date_fin: null } : e })}
          onSupprimer={() => executer({ action: "supprimer_evenement", id: e.id })}
          onAnnuler={onFini}
        />
      </div>
      <input className={`${champ} mt-2 w-full`} placeholder="Description (facultatif, ex. « À confirmer »)" value={e.description ?? ""} onChange={(ev) => maj("description", ev.target.value)} />
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function CalendrierDirectionClient({
  creneaux, evenements,
}: { creneaux: CreneauPlanning[]; evenements: EvenementCalendrier[] }) {
  const router = useRouter();
  const [onglet, setOnglet] = useState<"semaine" | "annee">("semaine");
  const [nouveauCreneau, setNouveauCreneau] = useState<BrouillonCreneau | null>(null);
  const [nouvelEvenement, setNouvelEvenement] = useState<BrouillonEvenement | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const annee = useMemo(() => construireAnnee(evenements, creneaux), [evenements, creneaux]);
  const tries = trierCreneaux(creneaux);

  const fini = () => { setErreur(null); setNouveauCreneau(null); setNouvelEvenement(null); router.refresh(); };

  return (
    <div className="px-10 pb-16 lg:px-14" style={{ paddingTop: "calc(96px + 24px)" }}>

      {/* En-tête */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black/35">Direction</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-black">Calendrier & semaine type</h1>
          <p className="mt-1 text-sm text-black/50">Ce que tu modifies ici s'affiche tout de suite sur la page publique.</p>
        </div>
        <Link href="/cours/calendrier" target="_blank"
          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black/70 transition hover:border-black/20">
          <ExternalLink size={14} /> Voir la page publique
        </Link>
      </div>

      {/* Résumé calculé */}
      {annee ? (
        <div className="mb-6 flex flex-wrap gap-x-8 gap-y-2 rounded-[16px] px-5 py-4 text-sm" style={{ background: "rgb(239,244,239)" }}>
          <span><strong style={{ color: VERT }}>Année {libelleAnnee(annee)}</strong> · {periodeTexte(annee.debut, annee.fin)}</span>
          <span><strong>{annee.semaines.length}</strong> semaines de cours</span>
          <span><strong>{annee.periodes.length}</strong> périodes ({annee.periodes.map((p) => p.nbSemaines).join(" · ")} sem.)</span>
          <span><strong>{annee.semaines.filter((s) => s.lettre === "A").length}</strong> semaines A · <strong>{annee.semaines.filter((s) => s.lettre === "B").length}</strong> semaines B</span>
        </div>
      ) : (
        <div className="mb-6 flex items-start gap-3 rounded-[16px] bg-amber-50 px-5 py-4 text-sm text-amber-800">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          Le calendrier de l'année ne s'affiche pas encore : il faut un événement « Début des cours » et un « Fin des cours » visibles, la fin après le début.
        </div>
      )}

      {/* Onglets */}
      <div className="mb-5 inline-flex rounded-full border border-black/10 bg-white p-1">
        {([
          { id: "semaine", label: "Semaine type", icone: <Clock size={14} /> },
          { id: "annee", label: "Calendrier de l'année", icone: <CalendarDays size={14} /> },
        ] as const).map((o) => (
          <button key={o.id} onClick={() => setOnglet(o.id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${onglet === o.id ? "text-white" : "text-black/55 hover:text-black"}`}
            style={onglet === o.id ? { background: VERT } : undefined}>
            {o.icone}{o.label}
          </button>
        ))}
      </div>

      {erreur && <p className="mb-4 rounded-[12px] bg-red-50 px-4 py-3 text-sm text-red-700">{erreur}</p>}

      {/* ── Semaine type ── */}
      {onglet === "semaine" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-8xl text-sm leading-6 text-black/50">
              Semaine A = 1re, 3e, 5e semaine de cours… (sessions des groupes du lundi et du mardi). Semaine B = 2e, 4e, 6e… (sessions des groupes du jeudi et du vendredi). <br />
              L'œil masque un créneau du site sans le supprimer. <br />
              « Séances max / an » fixe le nombre de cours comptés : les séances en trop, en fin d'année, prennent le nom que tu choisis (par défaut « Séance de réserve »).
              « Dates propres » limite un créneau à une partie de l'année (ex. la Comédie musicale qui s'arrête après le spectacle, un module d'une période).
            </p>
            {!nouveauCreneau && (
              <button
                onClick={() => setNouveauCreneau({ jour: 1, heure_debut: "17:00", heure_fin: "19:00", titre: "", sous_titre: null, categorie: "comedie-musicale", frequence: "hebdo", note: null, ordre: 0, visible: true, seances_max: null, date_debut: null, date_fin: null, libelle_reserve: null })}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ background: VERT }}>
                <Plus size={14} /> Ajouter un créneau
              </button>
            )}
          </div>

          {nouveauCreneau && <LigneCreneau key="nouveau" initial={nouveauCreneau} annee={annee} onFini={fini} onErreur={setErreur} />}

          {JOURS.map((nomJour, i) => {
            const duJour = tries.filter((c) => c.jour === i + 1);
            if (duJour.length === 0) return null;
            return (
              <div key={nomJour}>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-black/40">{nomJour}</p>
                <div className="space-y-2">
                  {duJour.map((c) => (
                    <LigneCreneau key={`${c.id}-${JSON.stringify(c)}`} initial={c} annee={annee} onFini={fini} onErreur={setErreur} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Calendrier de l'année ── */}
      {onglet === "annee" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-8xl text-sm leading-6 text-black/50">
              <strong className="text-black/65">Congé</strong> et <strong className="text-black/65">jour férié</strong> suppriment les cours de ces jours-là.
              Les semaines A/B, les périodes et le nombre de séances se recalculent automatiquement. <br />
              Le calendrier ne montre que l'année des parcours. Stages, masterclass, workshops et modules à la carte se gèrent dans <Link href="/plateforme/direction/offres" className="font-semibold underline">Offres</Link>.
            </p>
            {!nouvelEvenement && (
              <button
                onClick={() => setNouvelEvenement({ titre: "", type: "evenement", date_debut: annee?.debut ?? new Date().toISOString().slice(0, 10), date_fin: null, description: null, visible: true })}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ background: VERT }}>
                <Plus size={14} /> Ajouter une date
              </button>
            )}
          </div>

          {nouvelEvenement && <LigneEvenement key="nouveau" initial={nouvelEvenement} onFini={fini} onErreur={setErreur} />}

          <div className="space-y-2">
            {evenements.map((e) => (
              <LigneEvenement key={`${e.id}-${JSON.stringify(e)}`} initial={e} onFini={fini} onErreur={setErreur} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}