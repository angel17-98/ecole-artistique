// app/components/plateforme/direction/BlocInscription.tsx
// Fiche candidature (direction) — infos du nouveau formulaire + réductions.
// Ajouté le 10/11/2026. Se charge tout seul : il suffit de lui passer la
// candidature, il va chercher le justificatif et les réductions via
// /api/direction/candidatures/[id]/reduction.

"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Camera, HeartPulse, FileText, Percent, Trash2, Plus } from "lucide-react";
import { TRANCHES, JOURS_PARCOURS, horaireDeTranche, estParcoursAnnuel, estTranche } from "@/lib/grille";

interface Remise {
  id: string;
  type: "menage" | "geste_commercial" | "autre";
  mode: "pourcentage" | "montant";
  valeur: number;
  motif: string | null;
  created_at: string;
}

interface Etat {
  menageDemandee: boolean;
  menageStatut: "en_attente" | "validee" | "refusee" | null;
  justificatifUrl: string | null;
  remises: Remise[];
  pourcentageMenage: number;
}

const VERT = "rgb(22,92,71)";
const OR = "rgb(185,151,83)";

const TYPE_LABEL: Record<Remise["type"], string> = {
  menage: "Membres du ménage",
  geste_commercial: "Geste commercial",
  autre: "Autre",
};

function Carte({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[20px] bg-white p-6" style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: "rgba(0,0,0,0.4)" }}>{titre}</p>
      {children}
    </div>
  );
}

function Ligne({ icone, label, children }: { icone: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0" style={{ color: "rgba(0,0,0,0.35)" }}>{icone}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium" style={{ color: "rgba(0,0,0,0.4)" }}>{label}</p>
        <div className="text-sm" style={{ color: "rgba(0,0,0,0.8)" }}>{children}</div>
      </div>
    </div>
  );
}

const formatRemise = (r: Pick<Remise, "mode" | "valeur">) =>
  `−${Number(r.valeur).toLocaleString("fr-BE")}${r.mode === "pourcentage" ? " %" : " €"}`;

export default function BlocInscription({ candidature }: { candidature: any }) {
  const [etat, setEtat] = useState<Etat | null>(null);
  const [chargement, setChargement] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  // Formulaire « ajouter une réduction »
  const [ouvert, setOuvert] = useState(false);
  const [type, setType] = useState<"geste_commercial" | "autre">("geste_commercial");
  const [mode, setMode] = useState<"pourcentage" | "montant">("pourcentage");
  const [valeur, setValeur] = useState("");
  const [motif, setMotif] = useState("");

  const url = `/api/direction/candidatures/${candidature.id}/reduction`;

  useEffect(() => {
    fetch(url)
      .then(async (r) => (r.ok ? setEtat(await r.json()) : setErreur((await r.json().catch(() => ({}))).error ?? "Chargement impossible")))
      .catch(() => setErreur("Chargement impossible"));
  }, [url]);

  const action = async (corps: object, cle: string) => {
    setChargement(cle);
    setErreur(null);
    try {
      const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corps) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error ?? "Erreur");
      setEtat(d);
      return true;
    } catch (e: any) {
      setErreur(e.message);
      return false;
    } finally {
      setChargement(null);
    }
  };

  const ajouter = async () => {
    const ok = await action({ action: "ajouter_remise", type, mode, valeur: valeur.replace(",", "."), motif }, "ajouter");
    if (ok) { setOuvert(false); setValeur(""); setMotif(""); }
  };

  // ── Infos du nouveau formulaire (absentes des anciennes candidatures) ──────
  const parcours = candidature.parcours;
  const tranche = candidature.tranche;
  const jours: string[] = candidature.jours_possibles ?? [];
  const nouveauFormulaire = estTranche(tranche);

  const joursLabel = estParcoursAnnuel(parcours)
    ? JOURS_PARCOURS[parcours].filter((j) => jours.includes(j.id)).map((j) => j.label)
    : jours;

  const statutMenage = etat?.menageStatut;
  const badgeMenage =
    statutMenage === "validee" ? { txt: "Validée", bg: "rgba(22,92,71,0.1)", c: VERT }
    : statutMenage === "refusee" ? { txt: "Refusée", bg: "rgba(220,38,38,0.08)", c: "rgb(200,40,40)" }
    : { txt: "À valider", bg: "rgba(185,151,83,0.14)", c: "rgb(146,95,14)" };

  return (
    <div className="space-y-6">

      {nouveauFormulaire && (
        <Carte titre="Créneau & infos pratiques">
          <div className="grid gap-4 sm:grid-cols-2">
            <Ligne icone={<CalendarDays size={14} />} label="Groupe choisi">
              {TRANCHES.find((t) => t.id === tranche)?.label} · {horaireDeTranche(tranche)}
            </Ligne>
            <Ligne icone={<CalendarDays size={14} />} label="Jours possibles">
              <strong>{joursLabel.length ? joursLabel.join(" et ") : "—"}</strong>
              {joursLabel.length === 1 && (
                <span className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "rgba(185,151,83,0.14)", color: "rgb(146,95,14)" }}>
                  un seul jour
                </span>
              )}
            </Ligne>
            <Ligne icone={<Camera size={14} />} label="Droit à l'image">
              {candidature.droit_image === true ? "Accepté" : candidature.droit_image === false
                ? <strong style={{ color: "rgb(200,40,40)" }}>Refusé</strong> : "—"}
            </Ligne>
            <Ligne icone={<HeartPulse size={14} />} label="Santé">
              <span style={{ whiteSpace: "pre-wrap" }}>{candidature.infos_sante || "Rien à signaler"}</span>
            </Ligne>
          </div>
        </Carte>
      )}

      <Carte titre="Réductions">
        {!etat && !erreur && <p className="text-sm" style={{ color: "rgba(0,0,0,0.4)" }}>Chargement…</p>}

        {etat && (
          <div className="space-y-5">

            {/* ── Réduction ménage ── */}
            {etat.menageDemandee && (
              <div className="rounded-[14px] p-4" style={{ background: "rgb(248,250,248)", border: "1px solid rgba(0,0,0,0.06)" }}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold" style={{ color: "rgba(0,0,0,0.8)" }}>
                    Réduction membres du ménage demandée
                  </p>
                  <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: badgeMenage.bg, color: badgeMenage.c }}>
                    {badgeMenage.txt}
                  </span>
                </div>

                {etat.justificatifUrl ? (
                  <a href={etat.justificatifUrl} target="_blank" rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium hover:underline" style={{ color: VERT }}>
                    <FileText size={14} /> Voir la composition de ménage
                  </a>
                ) : (
                  <p className="mt-3 text-sm" style={{ color: "rgba(0,0,0,0.4)" }}>Aucun justificatif trouvé.</p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {statutMenage !== "validee" && (
                    <button onClick={() => action({ action: "valider_menage" }, "valider")} disabled={!!chargement}
                      className="rounded-full px-4 py-2 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
                      style={{ background: VERT }}>
                      {chargement === "valider" ? "…" : `Valider (−${etat.pourcentageMenage} %)`}
                    </button>
                  )}
                  {statutMenage !== "refusee" && (
                    <button onClick={() => action({ action: "refuser_menage" }, "refuser")} disabled={!!chargement}
                      className="rounded-full px-4 py-2 text-xs font-semibold transition disabled:opacity-50"
                      style={{ background: "rgba(220,38,38,0.06)", color: "rgb(200,40,40)", border: "1px solid rgba(220,38,38,0.2)" }}>
                      {chargement === "refuser" ? "…" : "Refuser"}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ── Liste des réductions accordées ── */}
            {etat.remises.length > 0 ? (
              <div className="space-y-2">
                {etat.remises.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 rounded-[12px] px-3 py-2.5" style={{ border: "1px solid rgba(0,0,0,0.07)" }}>
                    <Percent size={14} style={{ color: OR, flexShrink: 0 }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold" style={{ color: "rgba(0,0,0,0.8)" }}>
                        {formatRemise(r)} <span className="font-normal" style={{ color: "rgba(0,0,0,0.45)" }}>· {TYPE_LABEL[r.type]}</span>
                      </p>
                      {r.motif && <p className="truncate text-xs" style={{ color: "rgba(0,0,0,0.45)" }}>{r.motif}</p>}
                    </div>
                    {r.type !== "menage" && (
                      <button onClick={() => action({ action: "supprimer_remise", remiseId: r.id }, r.id)} disabled={!!chargement}
                        title="Retirer cette réduction" className="rounded-full p-1.5 transition hover:bg-red-50 disabled:opacity-50"
                        style={{ color: "rgba(200,40,40,0.7)" }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <p className="text-[11px]" style={{ color: "rgba(0,0,0,0.4)" }}>
                  Appliquées automatiquement sur la facture.
                </p>
              </div>
            ) : (
              !etat.menageDemandee && <p className="text-sm" style={{ color: "rgba(0,0,0,0.4)" }}>Aucune réduction.</p>
            )}

            {/* ── Ajouter une réduction ── */}
            {!ouvert ? (
              <button onClick={() => setOuvert(true)}
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition hover:bg-black/5"
                style={{ border: "1px dashed rgba(0,0,0,0.2)", color: "rgba(0,0,0,0.6)" }}>
                <Plus size={13} /> Ajouter une réduction
              </button>
            ) : (
              <div className="space-y-3 rounded-[14px] p-4" style={{ background: "rgb(248,250,248)", border: "1px solid rgba(0,0,0,0.06)" }}>
                <div className="grid grid-cols-2 gap-2">
                  <select value={type} onChange={(e) => setType(e.target.value as typeof type)}
                    className="rounded-[10px] px-3 py-2 text-sm" style={{ border: "1px solid rgba(0,0,0,0.12)", background: "white" }}>
                    <option value="geste_commercial">Geste commercial</option>
                    <option value="autre">Autre</option>
                  </select>
                  <div className="flex overflow-hidden rounded-[10px]" style={{ border: "1px solid rgba(0,0,0,0.12)", background: "white" }}>
                    <input value={valeur} onChange={(e) => setValeur(e.target.value)} inputMode="decimal" placeholder="10"
                      className="w-full min-w-0 px-3 py-2 text-sm outline-none" />
                    <select value={mode} onChange={(e) => setMode(e.target.value as typeof mode)}
                      className="px-2 text-sm outline-none" style={{ borderLeft: "1px solid rgba(0,0,0,0.08)", background: "white" }}>
                      <option value="pourcentage">%</option>
                      <option value="montant">€</option>
                    </select>
                  </div>
                </div>
                <input value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Motif (ex. : inscription précoce, ambassadeur…)"
                  className="w-full rounded-[10px] px-3 py-2 text-sm outline-none" style={{ border: "1px solid rgba(0,0,0,0.12)", background: "white" }} />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setOuvert(false)} className="rounded-full px-4 py-2 text-xs font-medium hover:bg-black/5" style={{ color: "rgba(0,0,0,0.5)" }}>
                    Annuler
                  </button>
                  <button onClick={ajouter} disabled={!!chargement || !valeur || !motif.trim()}
                    className="rounded-full px-4 py-2 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-40"
                    style={{ background: VERT }}>
                    {chargement === "ajouter" ? "…" : "Ajouter"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {erreur && <p className="mt-4 rounded-[10px] px-3 py-2 text-sm" style={{ background: "rgba(220,38,38,0.06)", color: "rgb(200,40,40)" }}>{erreur}</p>}
      </Carte>
    </div>
  );
}