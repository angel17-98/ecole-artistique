// app/plateforme/prof/creneaux/CreneauxClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, X, CheckCircle2, Clock, CalendarDays,
  Repeat, Calendar, ChevronRight, Trash2, ToggleLeft, ToggleRight,
  TrendingUp, DoorOpen, Settings2, Loader2, Pencil,
} from "lucide-react";
import { heuresOuvertes } from "@/lib/plateforme/heures-ouvertes";

const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const DEADLINES = ["2h", "12h", "24h", "48h"];

interface Intervalle {
  id: string; discipline: string; heure_debut: string; heure_fin: string;
  recurrence: string; date_unique?: string; jour_semaine?: number;
  recurrence_fin?: string; deadline_annulation: string;
  abonnement_possible: boolean; actif: boolean;
}

interface Creneau {
  id: string; debut: string; fin_blocage: string; statut: string;
  salle?: { nom: string } | null; intervalle_id: string;
}

export default function CreneauxClient({
  prof, intervalles, creneaux, salles,
}: {
  prof: { id: string; disciplines: string[]; deadline_defaut: string; abonnement_possible_defaut: boolean };
  intervalles: Intervalle[];
  creneaux: Creneau[];
  salles: { id: string; nom: string; capacite: number }[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [vue, setVue] = useState<"intervalles" | "creneaux">("intervalles");

  // Formulaire
  const [discipline, setDiscipline] = useState(prof.disciplines[0] ?? "");
  const [recurrence, setRecurrence] = useState<"aucune" | "hebdomadaire">("hebdomadaire");
  const [heureDebut, setHeureDebut] = useState("10:00");
  const [heureFin, setHeureFin] = useState("12:00");
  const [dateUnique, setDateUnique] = useState("");
  const [jourSemaine, setJourSemaine] = useState(1);
  const [recurrenceFin, setRecurrenceFin] = useState("");
  const [deadline, setDeadline] = useState(prof.deadline_defaut ?? "24h");
  const [abonnement, setAbonnement] = useState(prof.abonnement_possible_defaut ?? false);

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // Valider les heures
  const heuresValides = () => {
    if (!heureDebut || !heureFin) return false;
    const [dh, dm] = heureDebut.split(":").map(Number);
    const [fh, fm] = heureFin.split(":").map(Number);
    return fh * 60 + fm > dh * 60 + dm + 30; // minimum 30min d'écart
  };

  // Calculer le nombre de slots qui seront générés
  const nbSlots = () => {
    if (!heuresValides()) return 0;
    const [dh, dm] = heureDebut.split(":").map(Number);
    const [fh, fm] = heureFin.split(":").map(Number);
    const dureeMin = (fh * 60 + fm) - (dh * 60 + dm);
    return Math.max(0, Math.floor((dureeMin - 60) / 30) + 1);
  };

  const openCreate = () => {
    setEditingId(null);
    setDiscipline(prof.disciplines[0] ?? "");
    setRecurrence("hebdomadaire");
    setHeureDebut("10:00");
    setHeureFin("12:00");
    setDateUnique("");
    setJourSemaine(1);
    setRecurrenceFin("");
    setDeadline(prof.deadline_defaut ?? "24h");
    setAbonnement(prof.abonnement_possible_defaut ?? false);
    setShowForm(true);
  };

  const openEdit = (iv: Intervalle) => {
    setEditingId(iv.id);
    setDiscipline(iv.discipline);
    setRecurrence(iv.recurrence === "hebdomadaire" ? "hebdomadaire" : "aucune");
    setHeureDebut(iv.heure_debut.slice(0, 5));
    setHeureFin(iv.heure_fin.slice(0, 5));
    setDateUnique(iv.date_unique ? iv.date_unique.slice(0, 10) : "");
    setJourSemaine(iv.jour_semaine ?? 1);
    setRecurrenceFin(iv.recurrence_fin ? iv.recurrence_fin.slice(0, 10) : "");
    setDeadline(iv.deadline_annulation ?? prof.deadline_defaut ?? "24h");
    setAbonnement(iv.abonnement_possible ?? false);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!discipline) { showToast("error", "Choisis une discipline."); return; }
    if (!heuresValides()) { showToast("error", "L'intervalle doit couvrir au moins 1h30 (pour générer au moins un slot de 45min)."); return; }
    if (recurrence === "aucune" && !dateUnique) { showToast("error", "Choisis une date."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/prof/creneaux", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingId ? { intervalle_id: editingId } : {}),
          prof_id: prof.id,
          discipline,
          heure_debut: heureDebut,
          heure_fin: heureFin,
          recurrence,
          date_unique: recurrence === "aucune" ? dateUnique : null,
          jour_semaine: recurrence === "hebdomadaire" ? jourSemaine : null,
          recurrence_fin: recurrence === "hebdomadaire" && recurrenceFin ? recurrenceFin : null,
          deadline_annulation: deadline,
          abonnement_possible: abonnement,
        }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.error ?? `Erreur ${res.status}`);

      showToast("success",
        editingId
          ? "Intervalle mis à jour avec succès."
          : `${data.creneaux_crees} créneau${data.creneaux_crees > 1 ? "x" : ""} créé${data.creneaux_crees > 1 ? "s" : ""} avec succès.`
      );
      closeForm();
      router.refresh();
    } catch (e: any) {
      showToast("error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSupprimerIntervalle = async (intervalleId: string) => {
    if (!confirm("Supprimer cet intervalle et tous ses créneaux futurs non réservés ?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/prof/creneaux?intervalle_id=${intervalleId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      showToast("success", "Intervalle supprimé.");
      router.refresh();
    } catch (e: any) {
      showToast("error", e.message);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer UNE occurrence précise (une seule date) sans toucher à la récurrence
  const handleSupprimerCreneau = async (creneauId: string) => {
    if (!confirm("Annuler ce créneau précis ? Les autres dates de la récurrence ne sont pas affectées.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/prof/creneaux?creneau_id=${creneauId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      showToast("success", "Créneau supprimé.");
      router.refresh();
    } catch (e: any) {
      showToast("error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const formatHeure = (ts: string) =>
    new Date(ts).toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" });

  const formatDate = (ts: string) =>
    new Date(ts).toLocaleDateString("fr-BE", { weekday: "short", day: "numeric", month: "short" });

  const statutStyle = (s: string) => ({
    disponible: { bg: "rgba(22,92,71,0.1)", color: "rgb(22,92,71)", label: "Disponible" },
    reserve: { bg: "rgba(185,151,83,0.15)", color: "rgb(146,95,14)", label: "Réservé" },
    effectue: { bg: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.4)", label: "Effectué" },
    annule: { bg: "rgba(220,38,38,0.08)", color: "rgb(220,38,38)", label: "Annulé" },
    indisponible: { bg: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.35)", label: "Indisponible" },
  }[s] ?? { bg: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.4)", label: s });

  // Grouper les créneaux par intervalle pour la vue "intervalles"
  const creneauxParIntervalle: Record<string, Creneau[]> = {};
  creneaux.forEach(c => {
    if (!creneauxParIntervalle[c.intervalle_id]) creneauxParIntervalle[c.intervalle_id] = [];
    creneauxParIntervalle[c.intervalle_id].push(c);
  });

  // ── Stats globales pour la colonne de droite ──────────────────────────────
  // Heures d'ouverture réelles sur les 30 prochains jours, calculées à partir
  // des INTERVALLES — pas du comptage de créneaux, qui se chevauchent par
  // construction (un slot toutes les 30min, bloquant 1h) et ne représentent
  // donc pas un volume d'heures fiable.
  const heuresDispo30j = heuresOuvertes(
    intervalles,
    new Date(),
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );

  const nbReserveTotal = creneaux.filter(c => c.statut === "reserve").length;

  const prochainReserve = creneaux
    .filter(c => c.statut === "reserve")
    .sort((a, b) => new Date(a.debut).getTime() - new Date(b.debut).getTime())[0];

  // ── Répartition par discipline (via les intervalles) ──────────────────────
  const disciplineStats: Record<string, { dispo: number; reserve: number }> = {};
  intervalles.forEach(iv => {
    const slots = creneauxParIntervalle[iv.id] ?? [];
    if (!disciplineStats[iv.discipline]) disciplineStats[iv.discipline] = { dispo: 0, reserve: 0 };
    slots.forEach(s => {
      if (s.statut === "disponible") disciplineStats[iv.discipline].dispo += 1;
      if (s.statut === "reserve") disciplineStats[iv.discipline].reserve += 1;
    });
  });

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
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgb(185,151,83)", marginBottom: 6 }}>
              Mon espace · Créneaux
            </p>
            <h1 style={{ fontSize: 30, fontWeight: 600, color: "rgb(8,20,14)", margin: "0 0 4px" }}>
              Mes créneaux
            </h1>
            <p style={{ fontSize: 13, color: "rgba(0,0,0,0.45)", margin: 0 }}>
              {intervalles.length} intervalle{intervalles.length > 1 ? "s" : ""} actif{intervalles.length > 1 ? "s" : ""}
              {" · "}
              {heuresDispo30j}h disponibles sur les 30 prochains jours
            </p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-full text-sm font-semibold text-white transition hover:bg-[rgb(18,75,58)]"
            style={{ background: "rgb(22,92,71)", padding: "12px 24px" }}
          >
            <Plus size={14} /> Ouvrir des créneaux
          </button>
        </div>
      </div>

      {/* ── Formulaire création intervalle ── */}
      {showForm && (
        <div className="px-10 lg:px-14 mb-6">
          <div className="rounded-[20px] border border-black/6 bg-white overflow-hidden"
            style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>

            {/* Header formulaire */}
            <div className="px-6 py-4 flex items-center justify-between"
              style={{ background: "rgb(12,40,28)" }}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-1">
                  {editingId ? "Modifier l'intervalle" : "Nouvel intervalle"}
                </p>
                <p className="text-base font-semibold text-white">
                  {editingId ? "Ajuster mes disponibilités" : "Définir mes disponibilités"}
                </p>
              </div>
              <button onClick={closeForm}
                className="w-8 h-8 rounded-full flex items-center justify-center transition hover:bg-white/10"
                style={{ color: "rgba(255,255,255,0.5)" }}>
                <X size={15} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px]">

              {/* ── Colonne champs ── */}
              <div className="p-6 space-y-5 border-b lg:border-b-0 lg:border-r border-black/6">

                {/* Discipline */}
                <div>
                  <Label>Discipline</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {prof.disciplines.map(d => (
                      <button key={d} onClick={() => setDiscipline(d)}
                        className="rounded-full px-4 py-2 text-sm font-semibold transition"
                        style={{
                          background: discipline === d ? "rgb(22,92,71)" : "rgb(247,250,247)",
                          color: discipline === d ? "white" : "rgba(0,0,0,0.5)",
                          border: discipline === d ? "1px solid rgb(22,92,71)" : "1px solid rgba(0,0,0,0.1)",
                        }}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type récurrence */}
                <div>
                  <Label>Type de disponibilité</Label>
                  <div className="flex gap-3 mt-2">
                    {([
                      { key: "hebdomadaire", label: "Récurrent", icon: <Repeat size={14} />, sub: "Tous les X jours" },
                      { key: "aucune", label: "Date unique", icon: <Calendar size={14} />, sub: "Une seule fois" },
                    ] as const).map(opt => (
                      <button key={opt.key} onClick={() => setRecurrence(opt.key)}
                        className="flex-1 flex items-center gap-3 rounded-[14px] border px-4 py-3 text-left transition"
                        style={{
                          background: recurrence === opt.key ? "rgba(22,92,71,0.06)" : "rgb(247,250,247)",
                          borderColor: recurrence === opt.key ? "rgb(22,92,71)" : "rgba(0,0,0,0.1)",
                        }}>
                        <span style={{ color: recurrence === opt.key ? "rgb(22,92,71)" : "rgba(0,0,0,0.35)" }}>
                          {opt.icon}
                        </span>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: recurrence === opt.key ? "rgb(22,92,71)" : "rgba(0,0,0,0.7)" }}>
                            {opt.label}
                          </p>
                          <p className="text-xs text-black/35">{opt.sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Jour de la semaine — si récurrent */}
                {recurrence === "hebdomadaire" && (
                  <div>
                    <Label>Jour de la semaine</Label>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {JOURS.map((j, i) => (
                        <button key={j} onClick={() => setJourSemaine(i + 1)}
                          className="w-10 h-10 rounded-full text-xs font-bold transition"
                          style={{
                            background: jourSemaine === i + 1 ? "rgb(22,92,71)" : "rgb(247,250,247)",
                            color: jourSemaine === i + 1 ? "white" : "rgba(0,0,0,0.5)",
                            border: jourSemaine === i + 1 ? "1px solid rgb(22,92,71)" : "1px solid rgba(0,0,0,0.1)",
                          }}>
                          {j.slice(0, 2)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Date unique */}
                {recurrence === "aucune" && (
                  <div>
                    <Label>Date</Label>
                    <Input type="date" value={dateUnique}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={e => setDateUnique(e.target.value)} />
                  </div>
                )}

                {/* Heures */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Début</Label>
                    <Input type="time" value={heureDebut} onChange={e => setHeureDebut(e.target.value)} />
                  </div>
                  <div>
                    <Label>Fin</Label>
                    <Input type="time" value={heureFin} onChange={e => setHeureFin(e.target.value)} />
                  </div>
                </div>

                {/* Fin de récurrence */}
                {recurrence === "hebdomadaire" && (
                  <div>
                    <Label>Arrêter la récurrence le <span className="text-black/30 normal-case font-normal">(optionnel)</span></Label>
                    <Input type="date" value={recurrenceFin}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={e => setRecurrenceFin(e.target.value)} />
                    <p className="text-xs text-black/35 mt-1.5">
                      Sans date de fin, les créneaux sont générés sur 3 mois glissants.
                    </p>
                  </div>
                )}

                {/* Deadline + Abonnement */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Délai d'annulation</Label>
                    <select value={deadline} onChange={e => setDeadline(e.target.value)}
                      className="w-full rounded-[12px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3 text-sm focus:outline-none"
                      style={{ color: "rgb(8,20,14)" }}>
                      {DEADLINES.map(d => <option key={d} value={d}>{d} avant le cours</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Abonnement annuel</Label>
                    <button
                      onClick={() => setAbonnement(!abonnement)}
                      className="w-full flex items-center justify-between rounded-[12px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3 text-sm transition"
                      style={{ color: abonnement ? "rgb(22,92,71)" : "rgba(0,0,0,0.4)" }}>
                      <span className="font-semibold">{abonnement ? "Activé" : "Désactivé"}</span>
                      {abonnement
                        ? <ToggleRight size={20} style={{ color: "rgb(22,92,71)" }} />
                        : <ToggleLeft size={20} style={{ color: "rgba(0,0,0,0.25)" }} />
                      }
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button onClick={handleSubmit} disabled={loading || !heuresValides()}
                    className="flex-1 flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-white transition disabled:opacity-40"
                    style={{ background: "rgb(22,92,71)" }}>
                    {loading && <Loader2 size={14} className="animate-spin" />}
                    {loading
                      ? (editingId ? "Mise à jour en cours..." : "Génération en cours...")
                      : editingId
                        ? "Enregistrer les modifications"
                        : `Créer ${nbSlots() > 0 ? nbSlots() + " créneau" + (nbSlots() > 1 ? "x" : "") : "les créneaux"}`}
                  </button>
                  <button onClick={closeForm}
                    className="px-6 rounded-full py-3.5 text-sm font-semibold transition"
                    style={{ background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.5)" }}>
                    Annuler
                  </button>
                </div>

                {/* Message d'attente — évite l'impression de blocage sur les récurrences longues */}
                {loading && (
                  <p className="text-[11px] text-black/35 text-center leading-4 -mt-2">
                    {editingId
                      ? "Les créneaux futurs non réservés sont régénérés avec les nouveaux horaires."
                      : "Ça peut prendre quelques secondes pour un intervalle récurrent — la page se réactualise automatiquement une fois terminé."}
                  </p>
                )}
              </div>

              {/* ── Colonne récap live ── */}
              <div className="p-6" style={{ background: "rgb(247,250,247)" }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/35 mb-4">
                  Récapitulatif
                </p>

                <div className="space-y-3">
                  <RecapRow label="Discipline" value={discipline || "—"} />
                  <RecapRow label="Type" value={recurrence === "hebdomadaire" ? "Récurrent" : "Date unique"} />
                  {recurrence === "hebdomadaire" ? (
                    <RecapRow label="Jour" value={JOURS[jourSemaine - 1]} />
                  ) : (
                    <RecapRow label="Date" value={dateUnique ? formatDate(new Date(dateUnique).toISOString()) : "—"} />
                  )}
                  <RecapRow label="Plage horaire" value={heuresValides() ? `${heureDebut} → ${heureFin}` : "—"} />
                  <RecapRow label="Délai d'annulation" value={deadline} />
                  <RecapRow label="Abonnement" value={abonnement ? "Activé" : "Désactivé"} />
                  {recurrence === "hebdomadaire" && (
                    <RecapRow label="Fin de récurrence" value={recurrenceFin ? formatDate(new Date(recurrenceFin).toISOString()) : "3 mois glissants"} />
                  )}
                </div>

                {/* Nombre de créneaux généré — mis en avant */}
                <div className="mt-5 rounded-[14px] px-4 py-4 text-center"
                  style={{
                    background: heuresValides() ? "rgba(22,92,71,0.08)" : "rgba(0,0,0,0.04)",
                    border: `1px solid ${heuresValides() ? "rgba(22,92,71,0.2)" : "rgba(0,0,0,0.08)"}`,
                  }}>
                  <p className="text-2xl font-bold" style={{ color: heuresValides() ? "rgb(22,92,71)" : "rgba(0,0,0,0.25)" }}>
                    {nbSlots()}
                  </p>
                  <p className="text-[11px] text-black/40 mt-0.5">
                    créneau{nbSlots() > 1 ? "x" : ""} de 45min {recurrence === "hebdomadaire" ? "par semaine" : "au total"}
                  </p>
                </div>

                {!heuresValides() && (
                  <p className="text-[11px] text-black/30 mt-3 leading-4">
                    Renseigne une plage d'au moins 1h30 pour voir apparaître les créneaux générés.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tabs vue ── */}
      <div className="px-10 lg:px-14 mb-5">
        <div className="flex gap-1 p-1 rounded-full w-fit"
          style={{ background: "white", border: "1px solid rgba(0,0,0,0.08)" }}>
          {([
            { key: "intervalles", label: "Intervalles", icon: <Repeat size={13} /> },
            { key: "creneaux", label: "Créneaux", icon: <Clock size={13} /> },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setVue(t.key)}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                background: vue === t.key ? "rgb(22,92,71)" : "transparent",
                color: vue === t.key ? "white" : "rgba(0,0,0,0.5)",
              }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grille principale : contenu + colonne latérale ── */}
      <div className="px-10 lg:px-14 pb-10 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

        {/* ── Colonne principale ── */}
        <div className="min-w-0">

          {/* VUE INTERVALLES */}
          {vue === "intervalles" && (
            <div className="space-y-3">
              {intervalles.length === 0 ? (
                <Vide
                  titre="Aucun intervalle"
                  texte="Crée ton premier intervalle pour ouvrir des créneaux à tes élèves."
                  action={{ label: "Ouvrir des créneaux", onClick: openCreate }}
                />
              ) : (
                intervalles.map(iv => {
                  const slots = creneauxParIntervalle[iv.id] ?? [];

                  return (
                    <div key={iv.id}
                      className="rounded-[18px] border border-black/6 bg-white overflow-hidden"
                      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                      <div className="px-5 py-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          {/* Icône récurrence */}
                          <div className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
                            style={{ background: "rgb(239,244,239)", color: "rgb(22,92,71)" }}>
                            {iv.recurrence === "hebdomadaire" ? <Repeat size={16} /> : <Calendar size={16} />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-black">
                              {iv.discipline} · {iv.heure_debut.slice(0, 5)}–{iv.heure_fin.slice(0, 5)}
                              {iv.recurrence === "hebdomadaire" && iv.jour_semaine ? ` · ${JOURS[iv.jour_semaine - 1]}s` : ""}
                            </p>
                            <p className="text-xs text-black/35">{slots.length} créneaux à venir</p>
                          </div>
                        </div>
                        {/* Modifier + Supprimer */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={() => openEdit(iv)}
                            className="w-8 h-8 rounded-full flex items-center justify-center transition hover:bg-black/5"
                            style={{ color: "rgba(0,0,0,0.35)" }}
                            title="Modifier l'intervalle">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleSupprimerIntervalle(iv.id)}
                            className="w-8 h-8 rounded-full flex items-center justify-center transition hover:bg-red-50"
                            style={{ color: "rgba(220,38,38,0.5)" }}
                            title="Supprimer l'intervalle">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Aperçu des 3 prochains créneaux */}
                      {slots.length > 0 && (
                        <div className="border-t border-black/5 divide-y divide-black/5">
                          {slots.slice(0, 3).map(c => {
                            const st = statutStyle(c.statut);
                            return (
                              <div key={c.id} className="px-5 py-2.5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <CalendarDays size={12} style={{ color: "rgba(0,0,0,0.3)", flexShrink: 0 }} />
                                  <p className="text-xs text-black/60">
                                    {formatDate(c.debut)} · {formatHeure(c.debut)} → {formatHeure(c.fin_blocage)}
                                  </p>
                                  {(c.salle as any)?.nom && (
                                    <p className="text-xs text-black/30">{(c.salle as any).nom}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                                    style={{ background: st.bg, color: st.color }}>
                                    {st.label}
                                  </span>
                                  {c.statut === "disponible" && (
                                    <button onClick={() => handleSupprimerCreneau(c.id)}
                                      className="w-6 h-6 rounded-full flex items-center justify-center transition hover:bg-red-50 flex-shrink-0"
                                      style={{ color: "rgba(220,38,38,0.4)" }}
                                      title="Annuler ce créneau précis">
                                      <X size={11} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          {slots.length > 3 && (
                            <div className="px-5 py-2.5">
                              <button onClick={() => setVue("creneaux")}
                                className="text-xs font-semibold transition hover:underline"
                                style={{ color: "rgb(22,92,71)" }}>
                                + {slots.length - 3} créneaux supplémentaires →
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* VUE CRÉNEAUX */}
          {vue === "creneaux" && (
            <div>
              {creneaux.length === 0 ? (
                <Vide
                  titre="Aucun créneau à venir"
                  texte="Crée un intervalle pour générer des créneaux réservables."
                  action={{ label: "Ouvrir des créneaux", onClick: openCreate }}
                />
              ) : (
                <div className="rounded-[20px] border border-black/6 bg-white overflow-hidden"
                  style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <div className="divide-y divide-black/5">
                    {creneaux.map(c => {
                      const st = statutStyle(c.statut);
                      return (
                        <div key={c.id} className="px-6 py-3.5 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            {/* Date */}
                            <div className="w-10 text-center flex-shrink-0">
                              <p className="text-[10px] font-bold uppercase tracking-wide text-black/30">
                                {new Date(c.debut).toLocaleDateString("fr-BE", { weekday: "short" })}
                              </p>
                              <p className="text-lg font-semibold text-black leading-none mt-0.5">
                                {new Date(c.debut).getDate()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-black">
                                {formatHeure(c.debut)} → {formatHeure(c.fin_blocage)}
                              </p>
                              <p className="text-xs text-black/40 mt-0.5">
                                {new Date(c.debut).toLocaleDateString("fr-BE", { month: "long", year: "numeric" })}
                                {(c.salle as any)?.nom ? ` · ${(c.salle as any).nom}` : " · Salle à attribuer"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-[9px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
                              style={{ background: st.bg, color: st.color }}>
                              {st.label}
                            </span>
                            {c.statut === "disponible" && (
                              <button onClick={() => handleSupprimerCreneau(c.id)}
                                className="w-7 h-7 rounded-full flex items-center justify-center transition hover:bg-red-50"
                                style={{ color: "rgba(220,38,38,0.45)" }}
                                title="Annuler ce créneau précis">
                                <X size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Colonne latérale ── */}
        <aside className="space-y-4 lg:sticky lg:top-[calc(96px+24px)] lg:self-start">

          {/* Vue d'ensemble */}
          <div className="rounded-[20px] border border-black/6 bg-white overflow-hidden"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div className="px-4 py-3 flex items-center gap-2 border-b border-black/5">
              <TrendingUp size={13} style={{ color: "rgb(22,92,71)" }} />
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/40">Vue d'ensemble</p>
            </div>
            <div className="divide-y divide-black/5">
              {[
                { label: "Heures disponibles (30j)", value: `${heuresDispo30j}h` },
                { label: "Cours réservés à venir", value: nbReserveTotal },
              ].map(s => (
                <div key={s.label} className="px-4 py-3 flex items-center justify-between">
                  <span className="text-xs text-black/45">{s.label}</span>
                  <span className="text-sm font-semibold text-black">{s.value}</span>
                </div>
              ))}
            </div>
            {prochainReserve && (
              <div className="px-4 py-3 border-t border-black/5" style={{ background: "rgba(185,151,83,0.06)" }}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: "rgb(146,95,14)" }}>
                  Prochain cours réservé
                </p>
                <p className="text-xs text-black/60">
                  {formatDate(prochainReserve.debut)} · {formatHeure(prochainReserve.debut)}
                </p>
              </div>
            )}
          </div>

          {/* Répartition par discipline */}
          {Object.keys(disciplineStats).length > 0 && (
            <div className="rounded-[20px] border border-black/6 bg-white overflow-hidden"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div className="px-4 py-3 border-b border-black/5">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/40">Par discipline</p>
              </div>
              <div className="divide-y divide-black/5">
                {Object.entries(disciplineStats).map(([disc, s]) => (
                  <div key={disc} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-black/70">{disc}</span>
                      <span className="text-[10px] text-black/35">
                        {s.dispo + s.reserve} créneau{s.dispo + s.reserve > 1 ? "x" : ""}
                      </span>
                    </div>
                    {/* Mini barre dispo / réservé */}
                    <div className="h-1.5 w-full rounded-full overflow-hidden flex" style={{ background: "rgba(0,0,0,0.06)" }}>
                      {s.dispo + s.reserve > 0 && (
                        <>
                          <div style={{ width: `${(s.reserve / (s.dispo + s.reserve)) * 100}%`, background: "rgb(185,151,83)" }} />
                          <div style={{ width: `${(s.dispo / (s.dispo + s.reserve)) * 100}%`, background: "rgb(22,92,71)" }} />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Salles compatibles */}
          {salles.length > 0 && (
            <div className="rounded-[20px] border border-black/6 bg-white overflow-hidden"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div className="px-4 py-3 flex items-center gap-2 border-b border-black/5">
                <DoorOpen size={13} style={{ color: "rgb(22,92,71)" }} />
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/40">Salles du centre</p>
              </div>
              <div className="divide-y divide-black/5">
                {salles.map(s => (
                  <div key={s.id} className="px-4 py-2.5 flex items-center justify-between">
                    <span className="text-xs text-black/60">{s.nom}</span>
                    <span className="text-[10px] text-black/35">{s.capacite} pers.</span>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5" style={{ background: "rgba(0,0,0,0.02)" }}>
                <p className="text-[10px] text-black/35 leading-4">
                  La salle est attribuée automatiquement à la réservation d'un élève.
                </p>
              </div>
            </div>
          )}

          {/* Réglages par défaut */}
          <div className="rounded-[20px] border border-black/6 bg-white overflow-hidden"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div className="px-4 py-3 flex items-center gap-2 border-b border-black/5">
              <Settings2 size={13} style={{ color: "rgb(22,92,71)" }} />
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/40">Réglages par défaut</p>
            </div>
            <div className="divide-y divide-black/5">
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-black/45">Délai d'annulation</span>
                <span className="text-sm font-semibold text-black">{prof.deadline_defaut ?? "24h"}</span>
              </div>
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-black/45">Abonnement annuel</span>
                <span className="text-sm font-semibold" style={{ color: prof.abonnement_possible_defaut ? "rgb(22,92,71)" : "rgba(0,0,0,0.35)" }}>
                  {prof.abonnement_possible_defaut ? "Activé" : "Désactivé"}
                </span>
              </div>
            </div>
            <div className="px-4 py-2.5" style={{ background: "rgba(0,0,0,0.02)" }}>
              <p className="text-[10px] text-black/35 leading-4">
                Ces valeurs pré-remplissent chaque nouvel intervalle — modifiables au cas par cas.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ── Helpers UI ─────────────────────────────────────────────────────────────────
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
    <input {...props}
      className="w-full rounded-[12px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/20 focus:border-[rgb(22,92,71)]"
      style={{ color: "rgb(8,20,14)" }} />
  );
}

function RecapRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-black/40">{label}</span>
      <span className="text-xs font-semibold text-black/75 text-right">{value}</span>
    </div>
  );
}

function Vide({ titre, texte, action }: {
  titre: string; texte: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="rounded-[20px] border border-black/6 bg-white p-12 text-center"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <p className="text-3xl mb-4">📅</p>
      <p className="text-sm font-semibold text-black/60 mb-1">{titre}</p>
      <p className="text-xs text-black/35 leading-5 max-w-xs mx-auto mb-5">{texte}</p>
      {action && (
        <button onClick={action.onClick}
          className="inline-flex items-center gap-2 rounded-full text-sm font-semibold text-white px-6 py-3 transition hover:bg-[rgb(18,75,58)]"
          style={{ background: "rgb(22,92,71)" }}>
          <Plus size={14} /> {action.label}
        </button>
      )}
    </div>
  );
}