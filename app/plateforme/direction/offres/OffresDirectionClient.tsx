"use client";
// app/plateforme/direction/offres/OffresDirectionClient.tsx
// Espace direction → Offres (13/11/2026).
//   Onglet « Offres »           : créer, modifier, masquer, supprimer les offres de /stages
//   Onglet « Demandes reçues »  : liste d'intérêt, demandes d'inscription, liste d'attente

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Plus, Trash2, Check, Eye, EyeOff, ImagePlus, Copy, ChevronDown, Mail, Phone } from "lucide-react";
import {
  TYPES_OFFRE, ETATS_INSCRIPTIONS, TYPES_DEMANDE,
  datesOffre, prixTexte, estAVenir,
  type Offre, type Demande, type TypeOffre, type EtatInscriptions,
} from "@/lib/offres";

const VERT = "rgb(22,92,71)";
const champ = "w-full rounded-[10px] border border-black/10 bg-white px-3 py-2 text-[13px] text-black outline-none focus:border-[rgb(22,92,71)]/50 focus:ring-2 focus:ring-[rgb(22,92,71)]/10";

type Brouillon = Omit<Offre, "id" | "prix" | "places_restantes"> & { id?: string; prix: string; places_restantes: string };

const versBrouillon = (o: Offre): Brouillon => ({
  ...o,
  prix: o.prix === null ? "" : String(o.prix),
  places_restantes: o.places_restantes === null ? "" : String(o.places_restantes),
});

const NOUVELLE: Brouillon = {
  type: "stage", titre: "", description: null, public_vise: null,
  date_debut: new Date().toISOString().slice(0, 10), date_fin: null, horaires: null,
  prix: "", places_restantes: "", inscriptions: "bientot", lien_inscription: null, image_url: null, visible: true,
};

async function appeler(corps: object) {
  const r = await fetch("/api/direction/offres", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corps),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error ?? `Erreur ${r.status}`);
  return d;
}

function Libelle({ children }: { children: React.ReactNode }) {
  return <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-black/40">{children}</span>;
}

// ─── FICHE D'UNE OFFRE ────────────────────────────────────────────────────────

function FicheOffre({
  initial, nbDemandes, ouverteParDefaut, onFini, onErreur,
}: {
  initial: Brouillon; nbDemandes: number; ouverteParDefaut: boolean;
  onFini: () => void; onErreur: (m: string) => void;
}) {
  const [o, setO] = useState(initial);
  const [ouverte, setOuverte] = useState(ouverteParDefaut);
  const [chargement, setChargement] = useState<string | null>(null);
  const [confirmer, setConfirmer] = useState(false);
  const fichier = useRef<HTMLInputElement>(null);
  const nouvelle = !initial.id;
  const modifiee = JSON.stringify(o) !== JSON.stringify(initial);
  const maj = <K extends keyof Brouillon>(k: K, v: Brouillon[K]) => setO((x) => ({ ...x, [k]: v }));
  const passee = !nouvelle && !estAVenir(o);

  const executer = async (cle: string, corps: object) => {
    setChargement(cle);
    try { await appeler(corps); onFini(); }
    catch (e: any) { onErreur(e.message); }
    finally { setChargement(null); }
  };

  const envoyerPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setChargement("photo");
    try {
      const fd = new FormData();
      fd.append("file", f);
      const r = await fetch("/api/direction/offres/photo", { method: "POST", body: fd });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error ?? "Envoi impossible");
      maj("image_url", d.url);
    } catch (err: any) {
      onErreur(err.message);
    } finally {
      setChargement(null);
      if (fichier.current) fichier.current.value = "";
    }
  };

  const type = TYPES_OFFRE[o.type];
  const etat = ETATS_INSCRIPTIONS[o.inscriptions];

  return (
    <div className="overflow-hidden rounded-[16px] border bg-white" style={{ borderColor: modifiee || nouvelle ? "rgba(185,151,83,0.55)" : "rgba(0,0,0,0.07)", opacity: o.visible ? 1 : 0.65 }}>
      {/* Résumé */}
      <button type="button" onClick={() => setOuverte((v) => !v)} className="flex w-full items-center gap-4 px-4 py-3 text-left transition hover:bg-black/[0.015]">
        <div className="h-12 w-16 shrink-0 overflow-hidden rounded-[10px]" style={{ background: `linear-gradient(135deg, rgb(12,50,38), ${type.couleur})` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {o.image_url && <img src={o.image_url} alt="" className="h-full w-full object-cover" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: type.couleur }}>{type.label}</span>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: etat.fond, color: etat.texte }}>{etat.label}</span>
            {passee && <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-black/45">Passée · plus affichée</span>}
            {!o.visible && <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold text-black/45">Masquée</span>}
          </div>
          <p className="truncate text-sm font-semibold text-black/85">{o.titre || "Nouvelle offre"}</p>
          <p className="truncate text-xs text-black/45">{datesOffre(o)} · {prixTexte(o.prix === "" ? null : Number(o.prix))}</p>
        </div>
        {!nouvelle && (
          <span className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: "rgb(239,244,239)", color: VERT }}>
            {nbDemandes} demande{nbDemandes > 1 ? "s" : ""}
          </span>
        )}
        <ChevronDown size={16} className={`shrink-0 text-black/30 transition ${ouverte ? "rotate-180" : ""}`} />
      </button>

      {/* Formulaire */}
      {ouverte && (
        <div className="space-y-4 border-t border-black/6 px-4 py-4">
          <div className="grid gap-3 md:grid-cols-[180px_1fr]">
            <label><Libelle>Type</Libelle>
              <select className={champ} value={o.type} onChange={(e) => maj("type", e.target.value as TypeOffre)}>
                {(Object.keys(TYPES_OFFRE) as TypeOffre[]).map((k) => <option key={k} value={k}>{TYPES_OFFRE[k].label}</option>)}
              </select>
            </label>
            <label><Libelle>Titre</Libelle>
              <input className={champ} placeholder="ex. Stage de Toussaint · Comédie musicale" value={o.titre} onChange={(e) => maj("titre", e.target.value)} />
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <label><Libelle>Date de début</Libelle>
              <input type="date" className={champ} value={o.date_debut} onChange={(e) => maj("date_debut", e.target.value)} />
            </label>
            <label><Libelle>Date de fin</Libelle>
              <input type="date" className={champ} value={o.date_fin ?? ""} onChange={(e) => maj("date_fin", e.target.value || null)} title="Vide = un seul jour" />
            </label>
            <label><Libelle>Horaires</Libelle>
              <input className={champ} placeholder="ex. 10h–16h" value={o.horaires ?? ""} onChange={(e) => maj("horaires", e.target.value || null)} />
            </label>
            <label><Libelle>Public visé</Libelle>
              <input className={champ} placeholder="ex. Dès 12 ans · tous niveaux" value={o.public_vise ?? ""} onChange={(e) => maj("public_vise", e.target.value || null)} />
            </label>
          </div>

          <label className="block"><Libelle>Description</Libelle>
            <textarea rows={4} className={`${champ} resize-y`} placeholder="Ce qu'on y fait, avec qui, ce qu'il faut apporter…" value={o.description ?? ""} onChange={(e) => maj("description", e.target.value || null)} />
          </label>

          <div className="grid gap-3 md:grid-cols-4">
            <label><Libelle>Prix (€)</Libelle>
              <input inputMode="decimal" className={champ} placeholder="vide = « Prix à venir »" value={o.prix} onChange={(e) => maj("prix", e.target.value.replace(",", "."))} />
            </label>
            <label><Libelle>Places restantes</Libelle>
              <input inputMode="numeric" className={champ} placeholder="vide = non affiché" value={o.places_restantes} onChange={(e) => maj("places_restantes", e.target.value.replace(/\D/g, ""))} />
            </label>
            <label><Libelle>Inscriptions</Libelle>
              <select className={champ} value={o.inscriptions} onChange={(e) => maj("inscriptions", e.target.value as EtatInscriptions)}>
                {(Object.keys(ETATS_INSCRIPTIONS) as EtatInscriptions[]).map((k) => <option key={k} value={k}>{ETATS_INSCRIPTIONS[k].label}</option>)}
              </select>
            </label>
            <label><Libelle>Lien d'inscription</Libelle>
              <input className={champ} placeholder="vide = formulaire du site" value={o.lien_inscription ?? ""} onChange={(e) => maj("lien_inscription", e.target.value || null)} />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input ref={fichier} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={envoyerPhoto} />
            <button type="button" onClick={() => fichier.current?.click()} disabled={chargement === "photo"}
              className="inline-flex items-center gap-2 rounded-full border border-black/12 px-4 py-2 text-xs font-semibold text-black/65 transition hover:border-black/25 disabled:opacity-50">
              <ImagePlus size={14} /> {chargement === "photo" ? "Envoi…" : o.image_url ? "Changer la photo" : "Ajouter une photo"}
            </button>
            {o.image_url && (
              <button type="button" onClick={() => maj("image_url", null)} className="text-xs text-black/40 hover:text-red-600">Retirer la photo</button>
            )}
            <span className="text-xs text-black/35">JPG, PNG ou WEBP · 5 MB max · format paysage conseillé</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/6 pt-4">
            <button type="button" onClick={() => maj("visible", !o.visible)}
              className="inline-flex items-center gap-2 text-xs font-medium" style={{ color: o.visible ? VERT : "rgba(0,0,0,0.45)" }}>
              {o.visible ? <Eye size={14} /> : <EyeOff size={14} />} {o.visible ? "Visible sur le site" : "Masquée du site"}
            </button>
            <div className="flex items-center gap-2">
              {nouvelle ? (
                <button onClick={onFini} className="rounded-full px-4 py-2 text-xs text-black/50 hover:bg-black/5">Annuler</button>
              ) : confirmer ? (
                <>
                  <span className="text-xs text-black/50">Supprimer définitivement ?</span>
                  <button onClick={() => { setConfirmer(false); executer("supprimer", { action: "supprimer_offre", id: o.id }); }}
                    className="rounded-full px-4 py-2 text-xs font-semibold text-white" style={{ background: "rgb(200,40,40)" }}>Supprimer</button>
                  <button onClick={() => setConfirmer(false)} className="rounded-full px-3 py-2 text-xs text-black/50 hover:bg-black/5">Non</button>
                </>
              ) : (
                <button onClick={() => setConfirmer(true)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs text-black/40 transition hover:bg-red-50 hover:text-red-600">
                  <Trash2 size={13} /> Supprimer
                </button>
              )}
              {(modifiee || nouvelle) && (
                <button onClick={() => executer("enregistrer", { action: "enregistrer_offre", offre: o })} disabled={!!chargement}
                  className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-50" style={{ background: VERT }}>
                  <Check size={13} /> {chargement === "enregistrer" ? "…" : "Enregistrer"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function OffresDirectionClient({
  offres, demandes, ongletInitial,
}: { offres: Offre[]; demandes: Demande[]; ongletInitial: "offres" | "demandes" }) {
  const router = useRouter();
  const [onglet, setOnglet] = useState(ongletInitial);
  const [nouvelle, setNouvelle] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [filtreOffre, setFiltreOffre] = useState<string>("toutes");
  const [masquerTraitees, setMasquerTraitees] = useState(true);
  const [copie, setCopie] = useState(false);

  const fini = () => { setErreur(null); setNouvelle(false); router.refresh(); };

  const parOffre = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of demandes) if (d.offre_id) m.set(d.offre_id, (m.get(d.offre_id) ?? 0) + 1);
    return m;
  }, [demandes]);

  const aVenir = offres.filter((o) => estAVenir(o));
  const passees = offres.filter((o) => !estAVenir(o));
  const nonTraitees = demandes.filter((d) => !d.traite).length;

  // Filtre des demandes : par offre, ou « général » (sans offre)
  const demandesFiltrees = demandes.filter((d) =>
    (!masquerTraitees || !d.traite) &&
    (filtreOffre === "toutes" || (filtreOffre === "general" ? !d.offre_id : d.offre_id === filtreOffre))
  );

  const copierEmails = async () => {
    const emails = [...new Set(demandesFiltrees.map((d) => d.email))].join(", ");
    try { await navigator.clipboard.writeText(emails); setCopie(true); setTimeout(() => setCopie(false), 2000); }
    catch { setErreur("Copie impossible : sélectionne les adresses à la main."); }
  };

  const basculer = async (d: Demande) => {
    try { await appeler({ action: "marquer_demande", id: d.id, traite: !d.traite }); router.refresh(); }
    catch (e: any) { setErreur(e.message); }
  };

  return (
    <div className="px-10 pb-16 lg:px-14" style={{ paddingTop: "calc(96px + 24px)" }}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black/35">Direction</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-black">Offres · Stages & Workshops</h1>
          <p className="mt-1 text-sm text-black/50">Stages, masterclass, workshops et modules à la carte affichés sur la page publique.</p>
        </div>
        <Link href="/stages" target="_blank" className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black/70 transition hover:border-black/20">
          <ExternalLink size={14} /> Voir la page publique
        </Link>
      </div>

      <div className="mb-5 inline-flex rounded-full border border-black/10 bg-white p-1">
        {([
          { id: "offres", label: `Offres (${aVenir.length})` },
          { id: "demandes", label: `Demandes reçues${nonTraitees ? ` · ${nonTraitees} à traiter` : ""}` },
        ] as const).map((o) => (
          <button key={o.id} onClick={() => setOnglet(o.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${onglet === o.id ? "text-white" : "text-black/55 hover:text-black"}`}
            style={onglet === o.id ? { background: VERT } : undefined}>
            {o.label}
          </button>
        ))}
      </div>

      {erreur && <p className="mb-4 rounded-[12px] bg-red-50 px-4 py-3 text-sm text-red-700">{erreur}</p>}

      {/* ── Offres ── */}
      {onglet === "offres" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-8xl text-sm leading-6 text-black/50">
              Une offre disparaît toute seule de la page publique après son dernier jour. Sans lien d'inscription, le bouton ouvre le formulaire du site
              et les demandes arrivent dans l'onglet « Demandes reçues ».
            </p>
            {!nouvelle && (
              <button onClick={() => setNouvelle(true)} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ background: VERT }}>
                <Plus size={14} /> Nouvelle offre
              </button>
            )}
          </div>

          {nouvelle && <FicheOffre key="nouvelle" initial={NOUVELLE} nbDemandes={0} ouverteParDefaut onFini={fini} onErreur={setErreur} />}

          {aVenir.length === 0 && !nouvelle && (
            <p className="rounded-[16px] border border-dashed border-black/12 bg-white px-6 py-10 text-center text-sm text-black/45">
              Aucune offre à venir. La page publique affiche « Les premiers stages arrivent bientôt ».
            </p>
          )}
          <div className="space-y-2">
            {[...aVenir].reverse().map((o) => (
              <FicheOffre key={`${o.id}-${JSON.stringify(o)}`} initial={versBrouillon(o)} nbDemandes={parOffre.get(o.id) ?? 0} ouverteParDefaut={false} onFini={fini} onErreur={setErreur} />
            ))}
          </div>

          {passees.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-black/35">Passées</p>
              <div className="space-y-2">
                {passees.map((o) => (
                  <FicheOffre key={`${o.id}-${JSON.stringify(o)}`} initial={versBrouillon(o)} nbDemandes={parOffre.get(o.id) ?? 0} ouverteParDefaut={false} onFini={fini} onErreur={setErreur} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Demandes reçues ── */}
      {onglet === "demandes" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <select className="w-auto max-w-full rounded-[10px] border border-black/10 bg-white px-3 py-2 text-[13px] text-black outline-none focus:border-[rgb(22,92,71)]/50" value={filtreOffre} onChange={(e) => setFiltreOffre(e.target.value)}>
              <option value="toutes">Toutes les demandes</option>
              <option value="general">Intérêt général (modules à la carte)</option>
              {offres.map((o) => <option key={o.id} value={o.id}>{o.titre}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-black/55">
              <input type="checkbox" checked={masquerTraitees} onChange={(e) => setMasquerTraitees(e.target.checked)} className="accent-[rgb(22,92,71)]" />
              Masquer les demandes traitées
            </label>
            <button onClick={copierEmails} disabled={demandesFiltrees.length === 0}
              className="ml-auto inline-flex items-center gap-2 rounded-full border border-black/12 bg-white px-4 py-2 text-xs font-semibold text-black/65 transition hover:border-black/25 disabled:opacity-40">
              <Copy size={13} /> {copie ? "Copié !" : `Copier les ${new Set(demandesFiltrees.map((d) => d.email)).size} emails`}
            </button>
          </div>

          {demandesFiltrees.length === 0 ? (
            <p className="rounded-[16px] border border-dashed border-black/12 bg-white px-6 py-10 text-center text-sm text-black/45">Aucune demande pour ce filtre.</p>
          ) : (
            <div className="overflow-hidden rounded-[16px] border border-black/7 bg-white">
              {demandesFiltrees.map((d, i) => (
                <div key={d.id} className="flex flex-wrap items-start gap-4 px-4 py-3.5" style={{ borderTop: i ? "1px solid rgba(0,0,0,0.05)" : undefined, opacity: d.traite ? 0.55 : 1 }}>
                  <input type="checkbox" checked={d.traite} onChange={() => basculer(d)} title="Traitée" className="mt-1 h-4 w-4 accent-[rgb(22,92,71)]" />
                  <div className="min-w-[200px] flex-1">
                    <p className="text-sm font-semibold text-black/85">
                      {d.prenom} {d.nom}
                      {d.age && <span className="font-normal text-black/45"> · {d.age}</span>}
                    </p>
                    <p className="text-xs text-black/50">
                      <span className="font-medium" style={{ color: VERT }}>{TYPES_DEMANDE[d.type_demande].label}</span> · {d.offre_titre ?? "—"}
                    </p>
                    {d.message && <p className="mt-1.5 whitespace-pre-line text-sm text-black/65">{d.message}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1 text-xs">
                    <a href={`mailto:${d.email}`} className="inline-flex items-center gap-1.5 font-medium hover:underline" style={{ color: VERT }}><Mail size={12} /> {d.email}</a>
                    {d.telephone && <a href={`tel:${d.telephone}`} className="inline-flex items-center gap-1.5 text-black/55 hover:underline"><Phone size={12} /> {d.telephone}</a>}
                    <span className="text-black/35">{new Date(d.created_at).toLocaleDateString("fr-BE", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}