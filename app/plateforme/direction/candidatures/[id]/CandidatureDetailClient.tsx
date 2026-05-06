// app/plateforme/direction/candidatures/[id]/CandidatureDetailClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, XCircle, Hourglass, AlertCircle,
  Mail, Phone, MapPin, Calendar, User, Music,
  FileVideo, ExternalLink, Users, Send,
  Clock, Save, Trash2, UserCheck, Info, ChevronDown, ChevronUp
} from "lucide-react";

// ── TYPES ─────────────────────────────────────────────────────────────────────
const PARCOURS_LABELS: Record<string, string> = {
  "full-artist": "Full Artist",
  "comedie-musicale": "Comédie musicale",
  "eveil-musical": "Éveil musical",
};

const EVAL_LABELS: Record<string, string[]> = {
  eval_chant:    ["Dans ma douche", "J'apprends seul·e", "Cours depuis peu", "Scène associative", "Concerts & projets"],
  eval_danse:    ["Jamais pratiqué", "J'explore", "Cours réguliers", "Spectacles", "Formations pro"],
  eval_theatre:  ["Jamais monté", "Timide sur scène", "Impro & ateliers", "Pièces & rôles", "Formations & planches"],
  eval_ecriture: ["Je n'écris pas", "Quelques textes", "Compositions perso", "Projets aboutis", "Publications & scènes"],
  eval_scenique: ["Inconnu pour moi", "Je découvre", "Je travaille ça", "À l'aise sur scène", "Présence affirmée"],
  eval_studio:   ["Jamais enregistré", "Enregistrements maison", "Sessions studio", "Productions perso", "Projets professionnels"],
};

const DISCIPLINES = [
  { key: "eval_chant",    label: "Chant",                  icon: "🎤" },
  { key: "eval_danse",    label: "Danse",                  icon: "💃" },
  { key: "eval_theatre",  label: "Théâtre & Impro",        icon: "🎭" },
  { key: "eval_ecriture", label: "Écriture & Composition", icon: "✍️" },
  { key: "eval_scenique", label: "Expression scénique",    icon: "🎬" },
  { key: "eval_studio",   label: "Studio",                 icon: "🎙️" },
];

// ── STATUTS ───────────────────────────────────────────────────────────────────
type Statut = "en_attente" | "info_complementaire" | "validee" | "acceptee" | "liste_attente" | "place_proposee" | "inscrit" | "refusee" | "expiree";

function statutConfig(statut: string) {
  switch (statut) {
    case "en_attente":          return { label: "En attente",        bg: "rgba(185,151,83,0.1)", color: "rgb(185,151,83)",  icon: <Clock size={14} /> };
    case "info_complementaire": return { label: "Info demandée",     bg: "rgba(139,92,246,0.08)",color: "rgb(139,92,246)",  icon: <AlertCircle size={14} /> };
    case "validee":
    case "acceptee":            return { label: "Profil validé",     bg: "rgba(22,92,71,0.1)",   color: "rgb(22,92,71)",    icon: <CheckCircle2 size={14} /> };
    case "liste_attente":       return { label: "Liste d'attente",   bg: "rgba(59,130,246,0.08)",color: "rgb(59,130,246)",  icon: <Hourglass size={14} /> };
    case "place_proposee":      return { label: "Place proposée",    bg: "rgba(16,185,129,0.1)", color: "rgb(16,185,129)",  icon: <Send size={14} /> };
    case "inscrit":             return { label: "Inscrit ✓",         bg: "rgba(22,92,71,0.15)",  color: "rgb(22,92,71)",    icon: <CheckCircle2 size={14} /> };
    case "refusee":             return { label: "Refusée",           bg: "rgba(220,38,38,0.08)", color: "rgb(220,38,38)",   icon: <XCircle size={14} /> };
    case "expiree":             return { label: "Délai expiré",      bg: "rgba(0,0,0,0.05)",     color: "rgba(0,0,0,0.4)",  icon: <Clock size={14} /> };
    default: return { label: statut, bg: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.5)", icon: null };
  }
}

// ── BOUTONS CONTEXTUELS PAR STATUT ────────────────────────────────────────────
// Retourne les actions disponibles selon le statut actuel
function getActions(statut: string, hasPlaces: boolean) {
  switch (statut) {
    case "en_attente":
    case "info_complementaire":
      return [
        { id: "valider_avec_place",    label: hasPlaces ? "Valider & proposer une place" : "Valider le profil",  style: "primary",  icon: "check" },
        { id: "liste_attente",         label: "Valider → Liste d'attente",                                        style: "secondary", icon: "hourglass" },
        { id: "email",                 label: "Demander une info",                                                 style: "ghost",    icon: "mail" },
        { id: "refuser",               label: "Refuser",                                                           style: "danger",   icon: "x" },
      ];
    case "validee":
    case "acceptee":
      return [
        { id: "proposer_place",        label: "Proposer une place",                                               style: "primary",  icon: "send" },
        { id: "liste_attente",         label: "Mettre en liste d'attente",                                        style: "secondary", icon: "hourglass" },
        { id: "email",                 label: "Envoyer un email",                                                  style: "ghost",    icon: "mail" },
        { id: "refuser",               label: "Refuser",                                                           style: "danger",   icon: "x" },
      ];
    case "liste_attente":
      return [
        { id: "proposer_place",        label: "Proposer une place",                                               style: "primary",  icon: "send" },
        { id: "email",                 label: "Envoyer un email",                                                  style: "ghost",    icon: "mail" },
        { id: "refuser",               label: "Refuser",                                                           style: "danger",   icon: "x" },
      ];
    case "place_proposee":
      return [
        { id: "email",                 label: "Relancer par email",                                                style: "ghost",    icon: "mail" },
        { id: "liste_attente",         label: "Remettre en liste d'attente",                                      style: "secondary", icon: "hourglass" },
      ];
    case "expiree":
      return [
        { id: "proposer_place",        label: "Reproposer une place",                                             style: "primary",  icon: "send" },
        { id: "liste_attente",         label: "Remettre en liste d'attente",                                      style: "secondary", icon: "hourglass" },
        { id: "refuser",               label: "Refuser définitivement",                                           style: "danger",   icon: "x" },
      ];
    case "refusee":
      return [
        { id: "valider_avec_place",    label: "Reconsidérer — Valider le profil",                                 style: "secondary", icon: "check" },
      ];
    case "inscrit":
      return []; // Aucune action possible
    default:
      return [];
  }
}

// ── MODALE EMAIL ──────────────────────────────────────────────────────────────
function EmailModal({ candidature, onClose, onSent }: {
  candidature: any; onClose: () => void;
  onSent: (objet: string, contenu: string) => void;
}) {
  const [objet, setObjet]     = useState(`Votre candidature Crea'Star — ${PARCOURS_LABELS[candidature.parcours] ?? candidature.parcours}`);
  const [contenu, setContenu] = useState(`Bonjour ${candidature.prenom},\n\n`);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const send = async () => {
    if (!objet.trim() || !contenu.trim()) { setError("L'objet et le contenu sont obligatoires."); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/direction/candidatures/${candidature.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "info_complementaire", emailObjet: objet, emailContenu: contenu }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Erreur envoi");
      onSent(objet, contenu);
      onClose();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-2xl rounded-[24px] overflow-hidden shadow-2xl bg-white">
        <div className="px-6 py-5 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.07)", background: "rgb(248,250,248)" }}>
          <div className="flex items-center gap-3">
            <Mail size={18} style={{ color: "rgb(22,92,71)" }} />
            <div>
              <p className="text-sm font-semibold text-black">Email à {candidature.prenom} {candidature.nom}</p>
              <p className="text-[11px]" style={{ color: "rgba(0,0,0,0.4)" }}>{candidature.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-black/30 hover:text-black/60 text-xl">✕</button>
        </div>
        <div className="p-6 space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-[12px] text-sm text-red-600"
              style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.15)" }}>{error}</div>
          )}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(0,0,0,0.4)" }}>Objet</label>
            <input type="text" value={objet} onChange={e => setObjet(e.target.value)}
              className="w-full px-4 py-3 rounded-[12px] text-sm outline-none"
              style={{ background: "rgb(248,250,248)", border: "1px solid rgba(0,0,0,0.08)", color: "black" }} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.15em] mb-1.5" style={{ color: "rgba(0,0,0,0.4)" }}>Message</label>
            <textarea value={contenu} onChange={e => setContenu(e.target.value)} rows={10}
              className="w-full px-4 py-3 rounded-[12px] text-sm outline-none resize-none"
              style={{ background: "rgb(248,250,248)", border: "1px solid rgba(0,0,0,0.08)", color: "black", fontFamily: "inherit", lineHeight: "1.7" }} />
            <p className="text-[10px] mt-1" style={{ color: "rgba(0,0,0,0.35)" }}>
              Le candidat pourra répondre via info@creastar.be · Le statut passera à "Info demandée"
            </p>
          </div>
        </div>
        <div className="px-6 py-4 flex items-center justify-between"
          style={{ borderTop: "1px solid rgba(0,0,0,0.07)", background: "rgb(248,250,248)" }}>
          <button onClick={onClose} className="text-sm font-medium px-4 py-2.5 rounded-full hover:bg-black/5" style={{ color: "rgba(0,0,0,0.5)" }}>Annuler</button>
          <button onClick={send} disabled={loading}
            className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full hover:brightness-110 disabled:opacity-50"
            style={{ background: "rgb(22,92,71)", color: "white" }}>
            <Send size={14} />
            {loading ? "Envoi..." : "Envoyer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── COMPOSANT PRINCIPAL ───────────────────────────────────────────────────────
export default function CandidatureDetailClient({
  candidature, groupes, hasAccount, rang, totalParcours, notesDiri,
  currentUserPrenom, currentUserNom,
}: {
  candidature: any; groupes: any[]; hasAccount: boolean;
  rang: number; totalParcours: number;
  notesDiri: { id: string; contenu: string; created_at: string; auteur_prenom: string; auteur_nom: string }[];
  currentUserPrenom: string; currentUserNom: string;
}) {
  const router = useRouter();
  const [loading, setLoading]             = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [notes, setNotes]                 = useState("");
  const [notesSaved, setNotesSaved]       = useState(false);
  const [currentStatut, setCurrentStatut] = useState(candidature.statut as Statut);
  const [currentGroupeId, setCurrentGroupeId] = useState(candidature.groupe_id ?? null);
  const [localNotesDiri, setLocalNotesDiri] = useState(notesDiri);
  const [expandedEmails, setExpandedEmails] = useState<Set<string>>(new Set());
  const [toast, setToast]                 = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const toggleEmail = (id: string) => {
    setExpandedEmails(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Places disponibles dans les groupes du même parcours
  const hasPlaces = groupes.some(g =>
    g.parcours?.type === candidature.parcours &&
    (g.places_max - (g.inscrits_count ?? 0)) > 0
  ) || groupes.length === 0; // si pas de groupes encore, on considère places dispo

  const doAction = async (actionId: string) => {
    setLoading(actionId);
    try {
      let apiAction = actionId;
      let extra: Record<string, any> = {};

      // Mapper les actions UI vers les actions API
      if (actionId === "valider_avec_place") {
        apiAction = hasPlaces ? "valider_et_proposer" : "accepter";
      }

      const res = await fetch(`/api/direction/candidatures/${candidature.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: apiAction, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");

      // Mettre à jour le statut local
      const newStatuts: Record<string, Statut> = {
        valider_et_proposer: "place_proposee",
        accepter:            "validee",
        proposer_place:      "place_proposee",
        liste_attente:       "liste_attente",
        refuser:             "refusee",
      };
      if (newStatuts[apiAction]) setCurrentStatut(newStatuts[apiAction]);

      const msgs: Record<string, string> = {
        valider_et_proposer: "Profil validé · Place proposée · Email envoyé",
        accepter:            "Profil validé · Email envoyé",
        proposer_place:      "Place proposée · Email envoyé",
        liste_attente:       "Mis en liste d'attente · Email envoyé",
        refuser:             "Candidature refusée · Email envoyé",
        assigner_groupe:     "Groupe assigné",
        envoyer_planning:    "Planning envoyé",
      };
      showToast(msgs[apiAction] ?? "Action effectuée");
      router.refresh();
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setLoading(null);
    }
  };

  const saveNotes = async () => {
    if (!notes.trim()) return;
    setLoading("notes");
    try {
      const res = await fetch(`/api/direction/candidatures/${candidature.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "notes_internes", notes }),
      });
      if (!res.ok) throw new Error("Erreur sauvegarde");
      setLocalNotesDiri(prev => [{
        id: crypto.randomUUID(),
        contenu: notes.trim(),
        created_at: new Date().toISOString(),
        auteur_prenom: currentUserPrenom,
        auteur_nom: currentUserNom,
      }, ...prev]);
      setNotes("");
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2500);
    } catch (e: any) { showToast(e.message, "error"); }
    finally { setLoading(null); }
  };

  const st = statutConfig(currentStatut);
  const actions = getActions(currentStatut, hasPlaces);
  const dateArrivee = new Date(candidature.created_at);
  const jours = Math.floor((Date.now() - dateArrivee.getTime()) / (1000 * 60 * 60 * 24));
  const groupeAssigne = groupes.find(g => g.id === currentGroupeId);

  return (
    <div className="min-h-screen" style={{ background: "rgb(239,244,239)" }}>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-[14px] shadow-lg text-sm font-medium"
          style={{ background: toast.type === "success" ? "rgb(22,92,71)" : "rgb(220,38,38)", color: "white" }}>
          {toast.type === "success" ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
          {toast.msg}
        </div>
      )}

      {showEmailModal && (
        <EmailModal
          candidature={candidature}
          onClose={() => setShowEmailModal(false)}
          onSent={(objet, contenu) => {
            setCurrentStatut("info_complementaire");
            // Ajouter immédiatement dans les notes locales
            setLocalNotesDiri(prev => [{
              id: crypto.randomUUID(),
              contenu: `📧 EMAIL ENVOYÉ\n\nObjet : ${objet}\n\n${contenu}`,
              created_at: new Date().toISOString(),
              auteur_prenom: currentUserPrenom,
              auteur_nom: currentUserNom,
            }, ...prev]);
            showToast("Email envoyé · Statut mis à jour");
            router.refresh();
          }}
        />
      )}

      {/* ── HEADER ── */}
      <div className="px-10 lg:px-14 pb-6" style={{ paddingTop: "calc(88px + 24px)" }}>
        <Link href="/plateforme/direction/candidatures"
          className="inline-flex items-center gap-2 text-sm font-medium mb-6 transition-colors hover:text-black"
          style={{ color: "rgba(0,0,0,0.4)" }}>
          <ArrowLeft size={14} /> Retour aux candidatures
        </Link>

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="text-[9px] font-bold uppercase tracking-[0.3em]" style={{ color: "rgb(185,151,83)" }}>
                #{String(rang).padStart(2, "0")} sur {totalParcours} · {PARCOURS_LABELS[candidature.parcours] ?? candidature.parcours}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold"
                style={{ background: st.bg, color: st.color }}>
                {st.icon} {st.label}
              </span>
              {hasAccount && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold"
                  style={{ background: "rgba(22,92,71,0.08)", color: "rgb(22,92,71)" }}>
                  <UserCheck size={11} /> A un compte
                </span>
              )}
            </div>
            <h1 className="text-3xl font-semibold" style={{ color: "rgb(8,20,14)" }}>
              {candidature.prenom} {candidature.nom}
            </h1>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-sm" style={{ color: "rgba(0,0,0,0.5)" }}>
                <Calendar size={13} />
                {dateArrivee.toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                {" à "}
                {dateArrivee.toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" })}
              </span>
              {jours >= 3 && ["en_attente", "info_complementaire"].includes(currentStatut) && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(185,151,83,0.15)", color: "rgb(185,151,83)" }}>
                  ⚠ {jours}j sans décision
                </span>
              )}
            </div>
          </div>

          {/* ── BOUTONS CONTEXTUELS ── */}
          {actions.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {actions.map(a => (
                <button
                  key={a.id}
                  onClick={() => a.id === "email" ? setShowEmailModal(true) : doAction(a.id)}
                  disabled={!!loading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition disabled:opacity-50"
                  style={{
                    background: a.style === "primary"   ? "rgb(22,92,71)"
                              : a.style === "secondary" ? "white"
                              : a.style === "danger"    ? "rgba(220,38,38,0.08)"
                              : "white",
                    color:      a.style === "primary"   ? "white"
                              : a.style === "secondary" ? "rgba(0,0,0,0.7)"
                              : a.style === "danger"    ? "rgb(220,38,38)"
                              : "rgba(0,0,0,0.6)",
                    border:     a.style === "primary"   ? "none"
                              : a.style === "secondary" ? "1px solid rgba(0,0,0,0.12)"
                              : a.style === "danger"    ? "1px solid rgba(220,38,38,0.2)"
                              : "1px solid rgba(0,0,0,0.1)",
                  }}
                >
                  {loading === a.id ? "..." : a.label}
                </button>
              ))}
            </div>
          )}
          {currentStatut === "inscrit" && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold"
              style={{ background: "rgba(22,92,71,0.08)", color: "rgb(22,92,71)" }}>
              <CheckCircle2 size={15} /> Élève inscrit — aucune action requise
            </div>
          )}
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="px-10 lg:px-14 pb-10 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

        {/* ── GAUCHE ── */}
        <div className="space-y-6">

          <Card title="Informations personnelles">
            <div className="grid grid-cols-2 gap-4">
              <InfoField icon={<User size={13} />} label="Âge" value={`${candidature.age} ans`} />
              <InfoField icon={<Mail size={13} />} label="Email" value={candidature.email} />
              {candidature.telephone && <InfoField icon={<Phone size={13} />} label="Téléphone" value={candidature.telephone} />}
              {candidature.ville && <InfoField icon={<MapPin size={13} />} label="Ville" value={candidature.ville} />}
              <InfoField icon={<Music size={13} />} label="Parcours demandé" value={PARCOURS_LABELS[candidature.parcours] ?? candidature.parcours} />
            </div>
          </Card>

          <Card title="Motivations & projet">
            <div className="space-y-5">
              {candidature.pourquoi && <TextBlock label="Pourquoi Crea'Star ?" content={candidature.pourquoi} />}
              {candidature.projet && <TextBlock label="Projet artistique" content={candidature.projet} />}
              {candidature.esprit_creastar && <TextBlock label="Ce que Crea'Star représente" content={candidature.esprit_creastar} />}
            </div>
          </Card>

          {DISCIPLINES.some(d => candidature[d.key] != null) && (
            <Card title="Auto-évaluation artistique">
              <p className="text-[11px] mb-4" style={{ color: "rgba(0,0,0,0.4)" }}>
                Évaluation renseignée par le candidat lors de sa candidature.
              </p>
              <div className="space-y-4">
                {DISCIPLINES.map(d => candidature[d.key] != null ? (
                  <div key={d.key} className="flex items-center gap-4">
                    <div className="flex items-center gap-2 w-40 flex-shrink-0">
                      <span className="text-base">{d.icon}</span>
                      <span className="text-xs font-medium" style={{ color: "rgba(0,0,0,0.6)" }}>{d.label}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.08)" }}>
                          <div className="h-full rounded-full" style={{
                            width: `${(candidature[d.key] / 5) * 100}%`,
                            background: candidature[d.key] >= 4 ? "rgb(22,92,71)" : candidature[d.key] >= 3 ? "rgb(185,151,83)" : "rgb(220,38,38)",
                          }} />
                        </div>
                        <span className="text-[10px] font-semibold w-6 flex-shrink-0" style={{ color: "rgba(0,0,0,0.4)" }}>{candidature[d.key]}/5</span>
                        <span className="text-[11px] italic min-w-[140px] flex-shrink-0" style={{ color: "rgba(0,0,0,0.45)" }}>
                          {EVAL_LABELS[d.key]?.[candidature[d.key] - 1] ?? ""}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null)}
              </div>
            </Card>
          )}

          <Card title="Vidéo de candidature">
            {candidature.drive_video_url ? (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[12px] flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(22,92,71,0.08)" }}>
                  <FileVideo size={20} style={{ color: "rgb(22,92,71)" }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-black mb-1">Vidéo sur Google Drive</p>
                  <a href={candidature.drive_video_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
                    style={{ color: "rgb(22,92,71)" }}>
                    <ExternalLink size={13} /> Visionner la vidéo
                  </a>
                </div>
              </div>
            ) : candidature.video_url ? (
              <a href={candidature.video_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium hover:underline" style={{ color: "rgb(22,92,71)" }}>
                <FileVideo size={16} /><ExternalLink size={13} /> Vidéo Supabase Storage
              </a>
            ) : candidature.video_link ? (
              <a href={candidature.video_link} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium hover:underline" style={{ color: "rgb(22,92,71)" }}>
                <FileVideo size={16} /><ExternalLink size={13} /> Lien vidéo externe
              </a>
            ) : (
              <p className="text-sm" style={{ color: "rgba(0,0,0,0.35)" }}>Aucune vidéo fournie</p>
            )}
          </Card>
        </div>

        {/* ── DROITE ── */}
        <div className="space-y-5">

          {/* Groupe assigné */}
          {["validee","acceptee","place_proposee","inscrit"].includes(currentStatut) && (
            <Card title="Groupe assigné">
              {!hasAccount ? (
                <div className="flex items-start gap-2 py-1">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: "rgba(185,151,83,0.8)" }} />
                  <p className="text-sm" style={{ color: "rgba(0,0,0,0.5)" }}>
                    L'élève doit créer son compte avec l'email d'invitation reçu.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {groupeAssigne && (
                    <div className="px-3 py-2.5 rounded-[12px]"
                      style={{ background: "rgba(22,92,71,0.07)", border: "1px solid rgba(22,92,71,0.15)" }}>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-1" style={{ color: "rgb(22,92,71)" }}>Groupe actuel</p>
                      <p className="text-sm font-semibold text-black">{groupeAssigne.nom}</p>
                      {groupeAssigne.parcours?.nom && (
                        <p className="text-[11px] mt-0.5" style={{ color: "rgba(0,0,0,0.45)" }}>
                          {groupeAssigne.parcours.nom}{groupeAssigne.jour_semaine ? ` · ${groupeAssigne.jour_semaine}` : ""}
                        </p>
                      )}
                    </div>
                  )}
                  <Link href="/plateforme/direction/groupes"
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[12px] text-sm font-semibold hover:brightness-110"
                    style={{ background: "rgb(22,92,71)", color: "white" }}>
                    <Users size={14} />
                    {groupeAssigne ? "Changer de groupe" : "Assigner à un groupe"}
                  </Link>
                  {currentGroupeId && (
                    <button onClick={() => doAction("envoyer_planning")} disabled={!!loading}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[12px] text-sm font-semibold hover:brightness-105 disabled:opacity-40"
                      style={{ background: "rgba(185,151,83,0.1)", color: "rgb(185,151,83)", border: "1px solid rgba(185,151,83,0.25)" }}>
                      <Send size={14} />
                      {loading === "envoyer_planning" ? "Envoi..." : "Envoyer le planning"}
                    </button>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* Notes internes */}
          <Card title="Notes & échanges (direction uniquement)">
            {/* Historique */}
            {localNotesDiri.length > 0 && (
              <div className="mb-4 space-y-2 max-h-80 overflow-y-auto pr-1">
                {localNotesDiri.map(n => {
                  const isEmail = n.contenu.startsWith("📧 EMAIL ENVOYÉ");
                  const isExpanded = expandedEmails.has(n.id);

                  if (isEmail) {
                    const parts = n.contenu.split("\n\n");
                    const objet = parts[1]?.replace("Objet : ", "") ?? "";
                    const corps = parts.slice(2).join("\n\n");
                    return (
                      <div key={n.id} className="rounded-[12px] overflow-hidden"
                        style={{ border: "1px solid rgba(59,130,246,0.25)", background: "rgba(59,130,246,0.03)" }}>
                        <button
                          onClick={() => toggleEmail(n.id)}
                          className="w-full flex items-center gap-2.5 p-3 text-left hover:bg-blue-50/50 transition-colors"
                        >
                          <Mail size={12} className="flex-shrink-0" style={{ color: "rgb(59,130,246)" }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-semibold truncate" style={{ color: "rgb(59,130,246)" }}>
                              Email · {objet}
                            </p>
                            <p className="text-[10px]" style={{ color: "rgba(0,0,0,0.4)" }}>
                              {n.auteur_prenom} {n.auteur_nom} · {new Date(n.created_at).toLocaleDateString("fr-BE", { day: "numeric", month: "short" })} à {new Date(n.created_at).toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          {isExpanded ? <ChevronUp size={13} style={{ color: "rgba(59,130,246,0.6)", flexShrink: 0 }} /> : <ChevronDown size={13} style={{ color: "rgba(59,130,246,0.6)", flexShrink: 0 }} />}
                        </button>
                        {isExpanded && (
                          <div className="px-3 pb-3">
                            <div className="rounded-[8px] p-3" style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)" }}>
                              <p className="text-[11px] font-semibold mb-2" style={{ color: "rgba(0,0,0,0.4)" }}>Objet : {objet}</p>
                              <p className="text-[12px] leading-relaxed" style={{ color: "rgba(0,0,0,0.7)", whiteSpace: "pre-wrap" }}>{corps}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div key={n.id} className="rounded-[12px] p-3"
                      style={{ background: "rgb(248,250,248)", border: "1px solid rgba(0,0,0,0.06)" }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-semibold" style={{ color: "rgb(22,92,71)" }}>
                          {n.auteur_prenom} {n.auteur_nom}
                        </span>
                        <span className="text-[10px]" style={{ color: "rgba(0,0,0,0.35)" }}>
                          {new Date(n.created_at).toLocaleDateString("fr-BE", { day: "numeric", month: "short" })} à {new Date(n.created_at).toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-[12px] leading-relaxed" style={{ color: "rgba(0,0,0,0.7)", whiteSpace: "pre-wrap" }}>{n.contenu}</p>
                    </div>
                  );
                })}
              </div>
            )}

            <textarea value={notes} onChange={e => { setNotes(e.target.value); setNotesSaved(false); }} rows={3}
              placeholder="Ajouter une observation, un échange téléphonique..."
              className="w-full px-4 py-3 rounded-[12px] text-sm outline-none resize-none"
              style={{ background: "white", border: "1px solid rgba(0,0,0,0.1)", color: "black", fontFamily: "inherit", lineHeight: "1.6" }} />
            <button onClick={saveNotes} disabled={loading === "notes" || !notes.trim()}
              className="mt-2 flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-[10px] transition hover:brightness-110 disabled:opacity-40"
              style={{ background: notesSaved ? "rgba(22,92,71,0.1)" : "rgb(22,92,71)", color: notesSaved ? "rgb(22,92,71)" : "white" }}>
              <Save size={11} />
              {loading === "notes" ? "Sauvegarde..." : notesSaved ? "Note ajoutée ✓" : "Ajouter la note"}
            </button>
          </Card>

          {/* Historique timeline */}
          <Card title="Historique">
            <HistoRow icon={<Calendar size={11} />} label="Candidature reçue"
              sub={`Parcours ${PARCOURS_LABELS[candidature.parcours] ?? candidature.parcours}`}
              date={dateArrivee.toLocaleDateString("fr-BE", { day: "numeric", month: "long", year: "numeric" })}
              time={dateArrivee.toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" })}
              color="rgb(22,92,71)" first />
            {candidature.traite_at && (
              <HistoRow icon={<CheckCircle2 size={11} />}
                label={`Dossier traité : ${statutConfig(candidature.statut).label}`}
                sub="Email de réponse envoyé"
                date={new Date(candidature.traite_at).toLocaleDateString("fr-BE", { day: "numeric", month: "long" })}
                time={new Date(candidature.traite_at).toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" })}
                color={candidature.statut === "refusee" ? "rgb(220,38,38)" : "rgb(22,92,71)"} />
            )}
            {candidature.place_proposee_at && (
              <HistoRow icon={<Send size={11} />} label="Place proposée"
                sub={candidature.place_expire_at ? `Expire le ${new Date(candidature.place_expire_at).toLocaleDateString("fr-BE", { day: "numeric", month: "long" })}` : ""}
                date={new Date(candidature.place_proposee_at).toLocaleDateString("fr-BE", { day: "numeric", month: "long" })}
                time={new Date(candidature.place_proposee_at).toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" })}
                color="rgb(16,185,129)" />
            )}
            {currentGroupeId && (
              <HistoRow icon={<Users size={11} />} label="Assigné à un groupe"
                sub={groupeAssigne?.nom ?? "Groupe"} date="" time="" color="rgb(185,151,83)" />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── UTILITAIRES ───────────────────────────────────────────────────────────────
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[20px] bg-white p-6" style={{ border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
      <p className="text-[9px] font-bold uppercase tracking-[0.25em] mb-4" style={{ color: "rgba(0,0,0,0.3)" }}>{title}</p>
      {children}
    </div>
  );
}

function InfoField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1" style={{ color: "rgba(0,0,0,0.35)" }}>
        {icon}
        <span className="text-[10px] uppercase tracking-[0.15em] font-semibold">{label}</span>
      </div>
      <p className="text-sm font-medium text-black">{value}</p>
    </div>
  );
}

function TextBlock({ label, content }: { label: string; content: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-2" style={{ color: "rgba(0,0,0,0.35)" }}>{label}</p>
      <p className="text-sm leading-7" style={{ color: "rgba(0,0,0,0.75)", whiteSpace: "pre-wrap" }}>{content}</p>
    </div>
  );
}

function HistoRow({ icon, label, sub, date, time, color, first }: {
  icon: React.ReactNode; label: string; sub?: string; date: string; time: string; color: string; first?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-3" style={{ borderTop: first ? "none" : "1px solid rgba(0,0,0,0.05)" }}>
      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18`, color }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-black">{label}</p>
        {sub && <p className="text-[10px] mt-0.5" style={{ color: "rgba(0,0,0,0.4)" }}>{sub}</p>}
        {date && <p className="text-[10px] mt-1" style={{ color: "rgba(0,0,0,0.35)" }}>{date}{time ? ` à ${time}` : ""}</p>}
      </div>
    </div>
  );
}