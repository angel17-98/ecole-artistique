// app/plateforme/direction/profs/[id]/ProfFicheClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, CheckCircle2, X, Plus, Pencil,
  CalendarDays, Clock, Wallet, FileText,
} from "lucide-react";

const DISCIPLINES_DISPO = [
  "Chant", "Danse", "Théâtre", "Écriture",
  "Expression scénique", "Studio / production",
];

const PERIODES = ["1 mois", "2 mois", "3 mois", "6 mois", "1 an"];
const DEADLINES = ["2h", "12h", "24h", "48h"];

interface Contrat {
  id: string;
  type: string;
  salaire_fixe?: number;
  tarif_cours_indiv?: number;
  avantages?: string;
  heures_min_periode?: number;
  periode_engagement?: string;
  date_debut: string;
  date_fin?: string;
  created_at: string;
}

export default function ProfFicheClient({
  prof,
  contratActif,
  contrats,
  stats,
}: {
  prof: any;
  contratActif: Contrat | null;
  contrats: Contrat[];
  stats: {
    coursEffectuesMois: number;
    creneauxDisponibles: number;
    montantMois: number | null;
    statutPaiement: string | null;
  };
}) {
  const router = useRouter();
  const p = prof.profile as any;
  const [onglet, setOnglet] = useState<"contrat" | "historique" | "parametres">("contrat");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // ── Formulaire nouveau contrat ────────────────────────────────────────────
  const [typeContrat, setTypeContrat] = useState<"salarie" | "independant" | "mixte">(
    contratActif?.type as any ?? prof.type_contrat ?? "salarie"
  );
  const [salaireFixe, setSalaireFixe] = useState(contratActif?.salaire_fixe?.toString() ?? "");
  const [tarifCours, setTarifCours] = useState(contratActif?.tarif_cours_indiv?.toString() ?? "");
  const [avantages, setAvantages] = useState(contratActif?.avantages ?? "");
  const [heuresMin, setHeuresMin] = useState(contratActif?.heures_min_periode?.toString() ?? "");
  const [periode, setPeriode] = useState(contratActif?.periode_engagement ?? "3 mois");
  const [dateDebut, setDateDebut] = useState(new Date().toISOString().split("T")[0]);
  const [dateFin, setDateFin] = useState("");

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveContrat = async () => {
    if (!dateDebut) { showToast("error", "La date de début est obligatoire."); return; }
    if (typeContrat !== "independant" && !salaireFixe) {
      showToast("error", "Le salaire fixe est obligatoire pour un salarié.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/direction/profs/${prof.id}/contrats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: typeContrat,
          salaire_fixe: salaireFixe ? parseFloat(salaireFixe) : null,
          tarif_cours_indiv: tarifCours ? parseFloat(tarifCours) : null,
          avantages: avantages || null,
          heures_min_periode: heuresMin ? parseInt(heuresMin) : null,
          periode_engagement: periode || null,
          date_debut: dateDebut,
          date_fin: dateFin || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      showToast("success", "Contrat créé avec succès.");
      setShowForm(false);
      router.refresh();
    } catch (e: any) {
      showToast("error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloturerContrat = async (contratId: string) => {
    if (!confirm("Clôturer ce contrat aujourd'hui ?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/direction/profs/${prof.id}/contrats`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: contratId, date_fin: new Date().toISOString().split("T")[0] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      showToast("success", "Contrat clôturé.");
      router.refresh();
    } catch (e: any) {
      showToast("error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const initiales = `${p?.prenom?.[0] ?? ""}${p?.nom?.[0] ?? ""}`.toUpperCase();

  const typeLabel = (t: string) =>
    t === "salarie" ? "Salarié" : t === "independant" ? "Indépendant" : "Mixte";

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("fr-BE", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen" style={{ background: "rgb(239,244,239)" }}>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-[14px] shadow-lg text-sm font-semibold"
          style={{ background: toast.type === "success" ? "rgb(22,92,71)" : "rgb(220,38,38)", color: "white" }}>
          {toast.type === "success" ? <CheckCircle2 size={15} /> : <X size={15} />}
          {toast.msg}
        </div>
      )}

      {/* ── En-tête ── */}
      <div className="px-10 lg:px-14" style={{ paddingTop: "calc(96px + 24px)", paddingBottom: 24 }}>
        <Link href="/plateforme/direction/profs"
          className="inline-flex items-center gap-1.5 text-xs text-black/40 hover:text-black/60 transition mb-6">
          <ChevronLeft size={14} /> Retour aux professeurs
        </Link>

        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
            style={{ background: "rgba(22,92,71,0.12)", color: "rgb(22,92,71)" }}>
            {p?.photo_url
              ? <img src={p.photo_url} alt="" className="w-full h-full object-cover rounded-2xl" />
              : initiales}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 style={{ fontSize: 28, fontWeight: 600, color: "rgb(8,20,14)", margin: 0 }}>
                {p?.prenom} {p?.nom}
              </h1>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
                style={{
                  background: prof.actif ? "rgba(22,92,71,0.1)" : "rgba(0,0,0,0.06)",
                  color: prof.actif ? "rgb(22,92,71)" : "rgba(0,0,0,0.4)",
                }}>
                {prof.actif ? "Actif" : "Inactif"}
              </span>
              {contratActif && (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
                  style={{ background: "rgba(185,151,83,0.12)", color: "rgb(146,95,14)" }}>
                  {typeLabel(contratActif.type)}
                </span>
              )}
            </div>
            <p style={{ fontSize: 13, color: "rgba(0,0,0,0.45)", marginTop: 4 }}>
              {prof.disciplines?.join(", ") || "Aucune discipline renseignée"}
              {p?.telephone ? ` · ${p.telephone}` : ""}
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats rapides ── */}
      <div className="px-10 lg:px-14 mb-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Cours ce mois", value: stats.coursEffectuesMois, icon: <CalendarDays size={14} /> },
            { label: "Créneaux ouverts", value: stats.creneauxDisponibles, icon: <Clock size={14} /> },
            {
              label: "Rémunération mois",
              value: stats.montantMois !== null ? `${stats.montantMois} €` : "—",
              icon: <Wallet size={14} />,
              sub: stats.statutPaiement === "vire" ? "Viré ✓"
                : stats.statutPaiement === "valide" ? "Validé"
                : stats.statutPaiement === "en_attente" ? "En attente"
                : null,
            },
          ].map((s) => (
            <div key={s.label} className="rounded-[16px] border border-black/6 bg-white px-5 py-4"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div className="flex items-center gap-2 mb-1" style={{ color: "rgba(0,0,0,0.3)" }}>
                {s.icon}
                <span className="text-[10px] uppercase tracking-[0.16em]">{s.label}</span>
              </div>
              <p className="text-2xl font-semibold text-black">{s.value}</p>
              {s.sub && <p className="text-[11px] text-black/35 mt-0.5">{s.sub}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Onglets ── */}
      <div className="px-10 lg:px-14 mb-5">
        <div className="flex gap-1 p-1 rounded-full w-fit"
          style={{ background: "white", border: "1px solid rgba(0,0,0,0.08)" }}>
          {([
            { key: "contrat", label: "Contrat actif" },
            { key: "historique", label: "Historique" },
            { key: "parametres", label: "Paramètres" },
          ] as const).map((o) => (
            <button key={o.key} onClick={() => setOnglet(o.key)}
              className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                background: onglet === o.key ? "rgb(22,92,71)" : "transparent",
                color: onglet === o.key ? "white" : "rgba(0,0,0,0.5)",
              }}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Contenu onglets ── */}
      <div className="px-10 lg:px-14 pb-10">

        {/* CONTRAT ACTIF */}
        {onglet === "contrat" && (
          <div className="max-w-2xl space-y-4">
            {contratActif ? (
              <div className="rounded-[20px] border border-black/6 bg-white overflow-hidden"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                {/* Header contrat */}
                <div className="px-6 py-4 flex items-center justify-between"
                  style={{ background: "rgb(12,40,28)" }}>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-1">
                      Contrat actif
                    </p>
                    <p className="text-base font-semibold text-white">
                      {typeLabel(contratActif.type)} · depuis le {formatDate(contratActif.date_debut)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCloturerContrat(contratActif.id)}
                    className="px-4 py-2 rounded-full text-xs font-semibold transition hover:bg-white/10"
                    style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)" }}>
                    Clôturer
                  </button>
                </div>

                {/* Détails */}
                <div className="divide-y divide-black/5">
                  {[
                    { label: "Type de contrat", value: typeLabel(contratActif.type) },
                    contratActif.salaire_fixe != null
                      ? { label: "Salaire fixe mensuel", value: `${contratActif.salaire_fixe} €` }
                      : null,
                    contratActif.tarif_cours_indiv != null
                      ? { label: "Tarif par cours individuel", value: `${contratActif.tarif_cours_indiv} €` }
                      : null,
                    contratActif.heures_min_periode != null
                      ? { label: "Heures min. par période", value: `${contratActif.heures_min_periode}h / ${contratActif.periode_engagement ?? "3 mois"}` }
                      : null,
                    contratActif.avantages
                      ? { label: "Avantages", value: contratActif.avantages }
                      : null,
                    contratActif.date_fin
                      ? { label: "Date de fin prévue", value: formatDate(contratActif.date_fin) }
                      : { label: "Durée", value: "Indéterminée" },
                  ].filter(Boolean).map((row: any) => (
                    <div key={row.label} className="px-6 py-3.5 flex items-center justify-between">
                      <p className="text-sm text-black/45">{row.label}</p>
                      <p className="text-sm font-semibold text-black">{row.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-[20px] border border-black/6 bg-white p-10 text-center">
                <p className="text-2xl mb-3">📋</p>
                <p className="text-sm font-semibold text-black/60 mb-1">Aucun contrat actif</p>
                <p className="text-xs text-black/35 leading-5 mb-4">
                  Ce professeur n'a pas encore de contrat. Crée-en un pour débloquer le suivi de rémunération.
                </p>
              </div>
            )}

            {/* Bouton nouveau contrat */}
            {!showForm && (
              <button onClick={() => setShowForm(true)}
                className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition hover:-translate-y-px"
                style={{ background: "white", border: "1px solid rgba(0,0,0,0.1)", color: "rgb(22,92,71)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <Plus size={14} />
                {contratActif ? "Créer un avenant / nouveau contrat" : "Créer un contrat"}
              </button>
            )}

            {/* Formulaire nouveau contrat */}
            {showForm && (
              <div className="rounded-[20px] border border-black/6 bg-white overflow-hidden"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
                  <p className="text-sm font-semibold text-black">Nouveau contrat</p>
                  <button onClick={() => setShowForm(false)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition hover:bg-black/5"
                    style={{ color: "rgba(0,0,0,0.4)" }}>
                    <X size={14} />
                  </button>
                </div>

                <div className="p-6 space-y-5">

                  {/* Type */}
                  <div>
                    <Label>Type de contrat</Label>
                    <div className="flex gap-2 mt-2">
                      {(["salarie", "independant", "mixte"] as const).map((t) => (
                        <button key={t} onClick={() => setTypeContrat(t)}
                          className="flex-1 rounded-[12px] border py-2.5 text-sm font-semibold transition"
                          style={{
                            background: typeContrat === t ? "rgb(22,92,71)" : "rgb(247,250,247)",
                            border: typeContrat === t ? "1px solid rgb(22,92,71)" : "1px solid rgba(0,0,0,0.1)",
                            color: typeContrat === t ? "white" : "rgba(0,0,0,0.5)",
                          }}>
                          {typeLabel(t)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Salaire fixe — salarié ou mixte */}
                  {(typeContrat === "salarie" || typeContrat === "mixte") && (
                    <div>
                      <Label>Salaire fixe mensuel (€)</Label>
                      <Input
                        type="number" placeholder="ex: 1800"
                        value={salaireFixe} onChange={e => setSalaireFixe(e.target.value)}
                      />
                    </div>
                  )}

                  {/* Tarif par cours */}
                  {(typeContrat === "independant" || typeContrat === "mixte") && (
                    <div>
                      <Label>Tarif par cours individuel (€)</Label>
                      <Input
                        type="number" placeholder="ex: 35"
                        value={tarifCours} onChange={e => setTarifCours(e.target.value)}
                      />
                    </div>
                  )}

                  {/* Heures min + période */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Heures min. à ouvrir</Label>
                      <Input
                        type="number" placeholder="ex: 10"
                        value={heuresMin} onChange={e => setHeuresMin(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Par période de</Label>
                      <select value={periode} onChange={e => setPeriode(e.target.value)}
                        className="w-full rounded-[12px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/20"
                        style={{ color: "rgb(8,20,14)" }}>
                        {PERIODES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Avantages */}
                  <div>
                    <Label>Avantages <span className="text-black/30 normal-case font-normal">(optionnel)</span></Label>
                    <textarea
                      placeholder="Ex : remboursement transport, mutuelle, etc."
                      value={avantages} onChange={e => setAvantages(e.target.value)}
                      rows={2}
                      className="w-full rounded-[12px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/20 resize-none"
                    />
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date de début</Label>
                      <Input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} />
                    </div>
                    <div>
                      <Label>Date de fin <span className="text-black/30 normal-case font-normal">(optionnel)</span></Label>
                      <Input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button onClick={handleSaveContrat} disabled={loading}
                      className="flex-1 rounded-full py-3 text-sm font-semibold text-white transition disabled:opacity-40"
                      style={{ background: "rgb(22,92,71)" }}>
                      {loading ? "Enregistrement..." : "Enregistrer le contrat"}
                    </button>
                    <button onClick={() => setShowForm(false)}
                      className="px-6 rounded-full py-3 text-sm font-semibold transition"
                      style={{ background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.5)" }}>
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* HISTORIQUE */}
        {onglet === "historique" && (
          <div className="max-w-2xl space-y-3">
            {contrats.length === 0 ? (
              <div className="rounded-[20px] border border-black/6 bg-white p-10 text-center">
                <p className="text-sm text-black/40">Aucun contrat dans l'historique.</p>
              </div>
            ) : (
              contrats.map((c) => {
                const isActif = !c.date_fin || c.date_fin >= new Date().toISOString().split("T")[0];
                return (
                  <div key={c.id}
                    className="rounded-[16px] border bg-white px-6 py-4 flex items-center justify-between gap-4"
                    style={{
                      borderColor: isActif ? "rgba(22,92,71,0.2)" : "rgba(0,0,0,0.06)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                    }}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-black">{typeLabel(c.type)}</p>
                        {isActif && (
                          <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(22,92,71,0.1)", color: "rgb(22,92,71)" }}>
                            Actif
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-black/40">
                        Du {formatDate(c.date_debut)}
                        {c.date_fin ? ` au ${formatDate(c.date_fin)}` : " · Durée indéterminée"}
                      </p>
                      <div className="flex gap-3 mt-1.5 flex-wrap">
                        {c.salaire_fixe != null && (
                          <span className="text-[11px] text-black/50">{c.salaire_fixe} € fixe/mois</span>
                        )}
                        {c.tarif_cours_indiv != null && (
                          <span className="text-[11px] text-black/50">{c.tarif_cours_indiv} €/cours</span>
                        )}
                        {c.heures_min_periode != null && (
                          <span className="text-[11px] text-black/50">
                            {c.heures_min_periode}h min / {c.periode_engagement ?? "3 mois"}
                          </span>
                        )}
                      </div>
                    </div>
                    {isActif && (
                      <button onClick={() => handleCloturerContrat(c.id)}
                        className="shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition hover:bg-red-50"
                        style={{ border: "1px solid rgba(220,38,38,0.2)", color: "rgb(220,38,38)" }}>
                        Clôturer
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* PARAMÈTRES */}
        {onglet === "parametres" && (
          <div className="max-w-2xl">
            <div className="rounded-[20px] border border-black/6 bg-white overflow-hidden"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div className="px-6 py-4 border-b border-black/5">
                <p className="text-sm font-semibold text-black">Paramètres du compte</p>
                <p className="text-xs text-black/40 mt-0.5">Modifiables par la direction uniquement</p>
              </div>
              <div className="divide-y divide-black/5">
                {[
                  { label: "Disciplines", value: prof.disciplines?.join(", ") || "—" },
                  { label: "Deadline annulation par défaut", value: prof.deadline_defaut ?? "24h" },
                  { label: "Abonnement annuel activé", value: prof.abonnement_possible_defaut ? "Oui" : "Non" },
                  { label: "Compte actif", value: prof.actif ? "Oui" : "Non" },
                  { label: "Membre depuis", value: new Date(prof.created_at).toLocaleDateString("fr-BE", { month: "long", year: "numeric" }) },
                ].map((row) => (
                  <div key={row.label} className="px-6 py-3.5 flex items-center justify-between">
                    <p className="text-sm text-black/45">{row.label}</p>
                    <p className="text-sm font-semibold text-black">{row.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helpers UI ────────────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-[0.18em] mb-2"
      style={{ color: "rgba(0,0,0,0.4)" }}>
      {children}
    </label>
  );
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-[12px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/20 focus:border-[rgb(22,92,71)]"
      style={{ color: "rgb(8,20,14)" }}
    />
  );
}