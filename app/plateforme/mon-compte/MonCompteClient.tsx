"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/plateforme/supabase/client";
import { useRouter } from "next/navigation";
import { ShellProfile } from "@/app/components/plateforme/PlatformShell";
import {
  Home as HomeIcon, Mail, Lock, Trash2, GraduationCap, AlertTriangle,
  Pencil, Plus, Phone,
} from "lucide-react";

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Eleve {
  id: string;
  prenom: string;
  nom: string;
  date_naissance: string | null;
  statut_premium: boolean;
  photo_url: string | null;
}
interface Foyer {
  id: string;
  nom_famille: string;
  telephone: string | null;
  adresse: string | null;
  ville: string | null;
}
interface Props {
  profile: ShellProfile & { telephone?: string | null; photo_url?: string | null };
  foyer: Foyer;
  eleves: Eleve[];
  email: string;
}

// ─── MODALE DE CONFIRMATION GÉNÉRIQUE ────────────────────────────────────────
function ModalConfirmation({
  titre, message, labelConfirm, danger, loading, onConfirm, onCancel,
}: {
  titre: string; message: string; labelConfirm: string;
  danger?: boolean; loading: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-[24px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.20)] p-6">
        <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${danger ? "bg-red-50" : "bg-[rgb(239,244,239)]"}`}>
          <AlertTriangle size={20} className={danger ? "text-red-500" : "text-[rgb(22,92,71)]"} />
        </div>
        <h2 className="text-center text-base font-semibold text-black mb-2">{titre}</h2>
        <p className="text-center text-sm text-black/55 leading-6 mb-6">{message}</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`w-full rounded-full py-3 text-sm font-semibold text-white transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
              danger ? "bg-red-500 hover:bg-red-600" : "bg-[rgb(22,92,71)] hover:bg-[rgb(18,75,58)]"
            }`}
          >
            {loading ? "En cours…" : labelConfirm}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="w-full rounded-full border border-black/10 py-3 text-sm font-medium text-black/60 transition hover:bg-black/4 disabled:opacity-50"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── BADGE STATUT ─────────────────────────────────────────────────────────────
function BadgeStatut({ premium }: { premium: boolean }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
      premium ? "bg-[rgb(22,92,71)] text-white" : "bg-black/6 text-black/40"
    }`}>
      {premium ? "★ Premium" : "Sans parcours"}
    </span>
  );
}

// ─── CARTE IDENTITÉ (colonne gauche, sticky) ─────────────────────────────────
function IdentiteCompte({ profile, foyer, email }: {
  profile: Props["profile"]; foyer: Foyer; email: string;
}) {
  return (
    <div className="rounded-[20px] border border-black/6 bg-white p-6 text-center"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 overflow-hidden"
        style={{ background: "rgba(22,92,71,0.12)", color: "rgb(22,92,71)" }}>
        {profile.photo_url
          ? <img src={profile.photo_url} className="w-full h-full object-cover" alt="" />
          : `${profile.prenom?.[0] ?? ""}${profile.nom?.[0] ?? ""}`}
      </div>
      <h1 className="text-lg font-semibold text-black">{profile.prenom} {profile.nom}</h1>
      <p className="text-xs text-black/40 mt-0.5">Foyer {foyer?.nom_famille || "—"}</p>

      <div className="mt-4 pt-4 border-t border-black/6 space-y-2 text-left">
        <p className="flex items-center gap-2 text-xs text-black/55">
          <Mail size={13} className="text-black/30 shrink-0" />
          <span className="truncate">{email}</span>
        </p>
        {(profile.telephone || foyer?.telephone) && (
          <p className="flex items-center gap-2 text-xs text-black/55">
            <Phone size={13} className="text-black/30 shrink-0" />
            {profile.telephone || foyer?.telephone}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── CARTE STATS (colonne gauche) ────────────────────────────────────────────
function StatsCompte({ nbEleves, ville }: { nbEleves: number; ville: string | null }) {
  const stats = [
    { label: "Élève" + (nbEleves > 1 ? "s" : ""), value: nbEleves, icon: <GraduationCap size={13} /> },
    { label: "Ville", value: ville || "—", icon: <HomeIcon size={13} /> },
  ];
  return (
    <div className="rounded-[20px] border border-black/6 bg-white divide-y divide-black/5"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      {stats.map(s => (
        <div key={s.label} className="px-4 py-3 flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs text-black/45">{s.icon} {s.label}</span>
          <span className="text-sm font-semibold text-black">{s.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── SECTION FOYER ────────────────────────────────────────────────────────────
function SectionFoyer({ foyer }: { foyer: Foyer }) {
  const [nom, setNom] = useState(foyer.nom_famille ?? "");
  const [telephone, setTelephone] = useState(foyer.telephone ?? "");
  const [ville, setVille] = useState(foyer.ville ?? "");
  const [adresse, setAdresse] = useState(foyer.adresse ?? "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true); setError(null); setSuccess(false);
    const supabase = createClient();
    const { error: err } = await supabase
      .from("foyers")
      .update({ nom_famille: nom, telephone, ville, adresse })
      .eq("id", foyer.id);
    setSaving(false);
    if (err) { setError("Erreur lors de la sauvegarde."); return; }
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const dirty =
    nom !== (foyer.nom_famille ?? "") ||
    telephone !== (foyer.telephone ?? "") ||
    ville !== (foyer.ville ?? "") ||
    adresse !== (foyer.adresse ?? "");

  return (
    <div className="rounded-[20px] border border-black/6 bg-white p-6 shadow-[0_2px_12px_rgba(16,16,16,0.04)]">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[rgb(239,244,239)]">
          <HomeIcon size={16} className="text-[rgb(22,92,71)]" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.20em] text-black/30">Informations</p>
          <p className="text-sm font-semibold text-black">Mon foyer</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-1.5">Nom du foyer</label>
            <input
              type="text" value={nom} onChange={e => setNom(e.target.value)}
              className="w-full rounded-[12px] border border-black/10 bg-[rgb(247,250,247)] px-3.5 py-2.5 text-sm text-black focus:border-[rgb(22,92,71)] focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/10 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-1.5">Téléphone</label>
            <input
              type="tel" value={telephone} onChange={e => setTelephone(e.target.value)}
              className="w-full rounded-[12px] border border-black/10 bg-[rgb(247,250,247)] px-3.5 py-2.5 text-sm text-black focus:border-[rgb(22,92,71)] focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/10 transition"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-1.5">Adresse</label>
          <input
            type="text" value={adresse} onChange={e => setAdresse(e.target.value)}
            className="w-full rounded-[12px] border border-black/10 bg-[rgb(247,250,247)] px-3.5 py-2.5 text-sm text-black focus:border-[rgb(22,92,71)] focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/10 transition"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-1.5">Ville</label>
          <input
            type="text" value={ville} onChange={e => setVille(e.target.value)}
            className="w-full rounded-[12px] border border-black/10 bg-[rgb(247,250,247)] px-3.5 py-2.5 text-sm text-black focus:border-[rgb(22,92,71)] focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/10 transition"
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className="rounded-full bg-[rgb(22,92,71)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[rgb(18,75,58)] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {saving ? "Sauvegarde…" : "Sauvegarder"}
          </button>
          {success && <span className="text-sm text-[rgb(22,92,71)] font-medium">✓ Modifications enregistrées</span>}
        </div>
      </div>
    </div>
  );
}

// ─── CARTE ÉLÈVE ──────────────────────────────────────────────────────────────
function CarteEleve({
  eleve, isActive, isSeul, onSelect, onUpdated, onDeleted,
}: {
  eleve: Eleve; isActive: boolean; isSeul: boolean;
  onSelect: () => void;
  onUpdated: (updated: Eleve) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [prenom, setPrenom] = useState(eleve.prenom);
  const [nom, setNom] = useState(eleve.nom);
  const [dateNaissance, setDateNaissance] = useState(eleve.date_naissance ?? "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("eleves")
      .update({ prenom, nom, date_naissance: dateNaissance || null })
      .eq("id", eleve.id)
      .select()
      .single();
    setSaving(false);
    if (!error && data) {
      onUpdated(data as Eleve);
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    const res = await fetch("/api/plateforme/delete-eleve", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eleveId: eleve.id }),
    });
    setDeleting(false);
    if (res.ok) { setConfirmDelete(false); onDeleted(eleve.id); }
  };

  const age = eleve.date_naissance
    ? Math.floor((Date.now() - new Date(eleve.date_naissance).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null;

  return (
    <>
      {confirmDelete && (
        <ModalConfirmation
          titre={`Supprimer ${eleve.prenom} ?`}
          message={`Le profil de ${eleve.prenom} ${eleve.nom} sera définitivement supprimé. Cette action est irréversible.`}
          labelConfirm={`Supprimer ${eleve.prenom}`}
          danger
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}

      <div className={`rounded-[20px] border-2 transition-all duration-200 ${
        isActive
          ? "border-[rgb(22,92,71)] bg-white shadow-[0_4px_20px_rgba(22,92,71,0.10)]"
          : "border-black/6 bg-white shadow-[0_2px_12px_rgba(16,16,16,0.04)]"
      }`}>
        <button onClick={onSelect} className="w-full flex items-center gap-4 p-5 text-left">
          <div className="relative">
            <div className="h-12 w-12 rounded-full bg-[rgb(22,92,71)] flex items-center justify-center font-semibold text-white shrink-0 text-sm overflow-hidden">
              {eleve.photo_url
                ? <img src={eleve.photo_url} className="w-full h-full object-cover" alt="" />
                : `${eleve.prenom[0] ?? ""}${eleve.nom[0] ?? ""}`.toUpperCase()}
            </div>
            {isActive && (
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(22,92,71)] text-white text-[10px] font-bold shadow-sm">✓</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-base font-semibold text-black">{eleve.prenom} {eleve.nom}</p>
              <BadgeStatut premium={eleve.statut_premium} />
              {success && <span className="text-xs text-[rgb(22,92,71)] font-medium">✓ Mis à jour</span>}
            </div>
            <p className="mt-0.5 text-xs text-black/40">
              {age !== null ? `${age} ans` : "Âge non renseigné"}
              {eleve.date_naissance && ` · né(e) le ${new Date(eleve.date_naissance).toLocaleDateString("fr-BE")}`}
            </p>
          </div>
          <span className={`text-xs font-medium shrink-0 ${isActive ? "text-[rgb(22,92,71)]" : "text-black/25"}`}>
            {isActive ? "Actif" : "Sélectionner"}
          </span>
        </button>

        {isActive && (
          <div className="px-5 pb-5">
            <div className="h-px bg-black/6 mb-4" />
            {!editing ? (
              <div className="flex items-center justify-between">
                <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-xs font-medium text-[rgb(22,92,71)] hover:underline">
                  <Pencil size={12} /> Modifier les informations
                </button>
                {!isSeul ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-600 transition"
                  >
                    <Trash2 size={12} /> Supprimer ce profil
                  </button>
                ) : (
                  <span className="text-xs text-black/25 italic">Profil principal — non supprimable</span>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-1.5">Prénom</label>
                    <input
                      type="text" value={prenom} onChange={e => setPrenom(e.target.value)}
                      className="w-full rounded-[12px] border border-black/10 bg-[rgb(247,250,247)] px-3.5 py-2.5 text-sm text-black focus:border-[rgb(22,92,71)] focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/10 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-1.5">Nom</label>
                    <input
                      type="text" value={nom} onChange={e => setNom(e.target.value)}
                      className="w-full rounded-[12px] border border-black/10 bg-[rgb(247,250,247)] px-3.5 py-2.5 text-sm text-black focus:border-[rgb(22,92,71)] focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/10 transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-1.5">Date de naissance</label>
                  <input
                    type="date" value={dateNaissance} onChange={e => setDateNaissance(e.target.value)}
                    className="w-full rounded-[12px] border border-black/10 bg-[rgb(247,250,247)] px-3.5 py-2.5 text-sm text-black focus:border-[rgb(22,92,71)] focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/10 transition"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleSave} disabled={saving}
                    className="rounded-full bg-[rgb(22,92,71)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[rgb(18,75,58)] disabled:opacity-50"
                  >
                    {saving ? "Sauvegarde…" : "Sauvegarder"}
                  </button>
                  <button
                    onClick={() => { setEditing(false); setPrenom(eleve.prenom); setNom(eleve.nom); setDateNaissance(eleve.date_naissance ?? ""); }}
                    className="rounded-full border border-black/10 px-4 py-2 text-xs font-medium text-black/50 transition hover:bg-black/4"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ─── AJOUTER UN ÉLÈVE ─────────────────────────────────────────────────────────
function AjouterEleve({ foyerId, onAdded }: { foyerId: string; onAdded: (e: Eleve) => void }) {
  const [open, setOpen] = useState(false);
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!prenom.trim() || !nom.trim()) return;
    setSaving(true); setError(null);
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("eleves")
      .insert({ foyer_id: foyerId, prenom: prenom.trim(), nom: nom.trim(), date_naissance: dateNaissance || null, statut_premium: false })
      .select()
      .single();
    setSaving(false);
    if (err) { setError("Erreur lors de l'ajout."); return; }
    onAdded(data as Eleve);
    setOpen(false); setPrenom(""); setNom(""); setDateNaissance("");
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 w-full rounded-[20px] border-2 border-dashed border-black/10 py-4 text-sm font-medium text-black/40 transition hover:border-[rgb(22,92,71)]/30 hover:text-[rgb(22,92,71)]"
      >
        <Plus size={16} />
        Ajouter un élève au foyer
      </button>
    );
  }

  return (
    <div className="rounded-[20px] border-2 border-[rgb(22,92,71)]/30 bg-white p-5 shadow-[0_2px_12px_rgba(22,92,71,0.08)]">
      <p className="text-sm font-semibold text-black mb-4">Nouveau profil élève</p>
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-1.5">Prénom *</label>
            <input
              type="text" value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Emma"
              className="w-full rounded-[12px] border border-black/10 bg-white px-3.5 py-2.5 text-sm text-black placeholder:text-black/25 focus:border-[rgb(22,92,71)] focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/10 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-1.5">Nom *</label>
            <input
              type="text" value={nom} onChange={e => setNom(e.target.value)} placeholder="Dupont"
              className="w-full rounded-[12px] border border-black/10 bg-white px-3.5 py-2.5 text-sm text-black placeholder:text-black/25 focus:border-[rgb(22,92,71)] focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/10 transition"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-1.5">
            Date de naissance <span className="normal-case tracking-normal font-normal text-black/25">(optionnel)</span>
          </label>
          <input
            type="date" value={dateNaissance} onChange={e => setDateNaissance(e.target.value)}
            className="w-full rounded-[12px] border border-black/10 bg-white px-3.5 py-2.5 text-sm text-black focus:border-[rgb(22,92,71)] focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/10 transition"
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleAdd} disabled={!prenom.trim() || !nom.trim() || saving}
            className="rounded-full bg-[rgb(22,92,71)] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[rgb(18,75,58)] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {saving ? "Ajout…" : "Ajouter l'élève"}
          </button>
          <button
            onClick={() => { setOpen(false); setPrenom(""); setNom(""); setDateNaissance(""); }}
            className="rounded-full border border-black/10 px-5 py-2.5 text-xs font-medium text-black/50 transition hover:bg-black/4"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SECTION ÉLÈVES ───────────────────────────────────────────────────────────
function SectionEleves({
  eleves, activeEleveId, foyerId, onSelect, onUpdated, onDeleted, onAdded,
}: {
  eleves: Eleve[]; activeEleveId: string; foyerId: string;
  onSelect: (id: string) => void;
  onUpdated: (e: Eleve) => void;
  onDeleted: (id: string) => void;
  onAdded: (e: Eleve) => void;
}) {
  return (
    <div className="rounded-[20px] border border-black/6 bg-white p-5 shadow-[0_2px_12px_rgba(16,16,16,0.04)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[rgb(239,244,239)]">
          <GraduationCap size={16} className="text-[rgb(22,92,71)]" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.20em] text-black/30">Élèves</p>
          <p className="text-sm font-semibold text-black">
            {eleves.length === 1 ? "Profil élève du foyer" : `${eleves.length} élèves dans ce foyer`}
          </p>
        </div>
      </div>

      {eleves.length > 1 && (
        <div className="flex gap-2 flex-wrap mb-4 p-3 rounded-[16px] bg-[rgb(247,249,247)]">
          {eleves.map(e => {
            const isChipActive = e.id === activeEleveId;
            return (
              <button
                key={e.id}
                onClick={() => onSelect(e.id)}
                className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-150 ${
                  isChipActive
                    ? "bg-[rgb(22,92,71)] text-white shadow-sm"
                    : "bg-white border border-black/10 text-black/60 hover:border-[rgb(22,92,71)]/30 hover:text-[rgb(22,92,71)]"
                }`}
              >
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${isChipActive ? "bg-white/20" : "bg-black/6"}`}>
                  {e.prenom[0]}{e.nom[0]}
                </span>
                {e.prenom}
                {e.statut_premium && <span className={`text-[9px] ${isChipActive ? "text-white/70" : "text-[rgb(22,92,71)]"}`}>★</span>}
              </button>
            );
          })}
        </div>
      )}

      <div className="space-y-3">
        {eleves.map(e => (
          <CarteEleve
            key={e.id}
            eleve={e}
            isActive={e.id === activeEleveId}
            isSeul={eleves.length === 1}
            onSelect={() => onSelect(e.id)}
            onUpdated={onUpdated}
            onDeleted={onDeleted}
          />
        ))}
        <AjouterEleve foyerId={foyerId} onAdded={onAdded} />
      </div>
    </div>
  );
}

// ─── SECTION SÉCURITÉ ────────────────────────────────────────────────────────
function SectionSecurite() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async () => {
    if (next !== confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    if (next.length < 8) { setError("Minimum 8 caractères requis."); return; }
    setSaving(true); setError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) { setError("Impossible de récupérer l'utilisateur."); setSaving(false); return; }
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email: user.email, password: current });
    if (signInErr) { setError("Mot de passe actuel incorrect."); setSaving(false); return; }
    const { error: updateErr } = await supabase.auth.updateUser({ password: next });
    setSaving(false);
    if (updateErr) { setError(updateErr.message); return; }
    setCurrent(""); setNext(""); setConfirm("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  };

  const passwordStrength = next.length === 0 ? 0 : next.length < 8 ? 1 : next.length < 12 ? 2 : 3;
  const strengthColors = ["", "bg-red-400", "bg-[rgb(185,151,83)]", "bg-[rgb(22,92,71)]"];
  const strengthLabels = ["", "Faible", "Moyen", "Fort"];

  return (
    <div className="rounded-[20px] border border-black/6 bg-white p-6 shadow-[0_2px_12px_rgba(16,16,16,0.04)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[rgb(239,244,239)]">
          <Lock size={16} className="text-[rgb(22,92,71)]" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.20em] text-black/30">Sécurité</p>
          <p className="text-sm font-semibold text-black">Changer le mot de passe</p>
        </div>
      </div>
      <div className="space-y-4 max-w-sm">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">Mot de passe actuel</label>
          <input
            type="password" value={current} onChange={e => setCurrent(e.target.value)} placeholder="••••••••"
            className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3 text-sm text-black placeholder:text-black/25 focus:border-[rgb(22,92,71)] focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/10 transition"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">Nouveau mot de passe</label>
          <input
            type="password" value={next} onChange={e => setNext(e.target.value)} placeholder="••••••••"
            className="w-full rounded-[14px] border border-black/10 bg-[rgb(247,250,247)] px-4 py-3 text-sm text-black placeholder:text-black/25 focus:border-[rgb(22,92,71)] focus:outline-none focus:ring-2 focus:ring-[rgb(22,92,71)]/10 transition"
          />
          {next.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex gap-1 flex-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= passwordStrength ? strengthColors[passwordStrength] : "bg-black/8"}`} />
                ))}
              </div>
              <span className="text-xs text-black/40">{strengthLabels[passwordStrength]}</span>
            </div>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-black/40 mb-2">Confirmer</label>
          <input
            type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••"
            className={`w-full rounded-[14px] border px-4 py-3 text-sm text-black placeholder:text-black/25 focus:outline-none focus:ring-2 transition ${
              confirm && next !== confirm
                ? "border-red-200 bg-red-50 focus:border-red-300 focus:ring-red-100"
                : "border-black/10 bg-[rgb(247,250,247)] focus:border-[rgb(22,92,71)] focus:ring-[rgb(22,92,71)]/10"
            }`}
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleChange} disabled={!current || !next || !confirm || saving}
            className="rounded-full bg-[rgb(22,92,71)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[rgb(18,75,58)] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {saving ? "Mise à jour…" : "Modifier le mot de passe"}
          </button>
          {success && <span className="text-sm text-[rgb(22,92,71)] font-medium">✓ Mis à jour</span>}
        </div>
      </div>
    </div>
  );
}

// ─── SECTION ZONE DANGER ──────────────────────────────────────────────────────
function SectionSupprimerCompte() {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteAccount = async () => {
    setDeleting(true);
    const res = await fetch("/api/plateforme/delete-account", { method: "DELETE" });
    if (res.ok) {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/?compte=supprime");
    } else {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <>
      {confirmDelete && (
        <ModalConfirmation
          titre="Supprimer votre compte ?"
          message="Cette action supprimera définitivement votre compte, votre foyer et tous vos profils élèves. Elle est irréversible."
          labelConfirm="Oui, supprimer mon compte"
          danger
          loading={deleting}
          onConfirm={handleDeleteAccount}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
      <div className="rounded-[20px] border border-red-100 bg-white p-6 shadow-[0_2px_12px_rgba(16,16,16,0.04)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-red-50">
            <Trash2 size={16} className="text-red-500" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.20em] text-red-400">Zone danger</p>
            <p className="text-sm font-semibold text-black">Supprimer mon compte</p>
          </div>
        </div>
        <p className="text-sm text-black/50 leading-6 mb-5">
          La suppression de votre compte est définitive et irréversible. Tous vos profils élèves,
          votre historique et vos cartes fidélité seront effacés.
        </p>
        <button
          onClick={() => setConfirmDelete(true)}
          className="rounded-full border border-red-200 px-5 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50 hover:border-red-300"
        >
          Supprimer mon compte
        </button>
      </div>
    </>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function MonCompteClient({ profile, foyer, eleves: initialEleves, email }: Props) {
  const [eleves, setEleves] = useState<Eleve[]>(initialEleves);
  const [activeEleveId, setActiveEleveId] = useState<string>(initialEleves[0]?.id ?? "");

  const handleEleveAdded = (nouvelEleve: Eleve) => {
    setEleves(prev => [...prev, nouvelEleve]);
    setActiveEleveId(nouvelEleve.id);
  };

  const handleEleveUpdated = (updated: Eleve) => {
    setEleves(prev => prev.map(e => e.id === updated.id ? updated : e));
  };

  const handleEleveDeleted = (id: string) => {
    const remaining = eleves.filter(e => e.id !== id);
    setEleves(remaining);
    if (activeEleveId === id && remaining.length > 0) {
      setActiveEleveId(remaining[0].id);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "rgb(239,244,239)" }}>
    <div className="px-10 lg:px-14" style={{ paddingTop: "calc(96px + 24px)", paddingBottom: 40 }}>
      <div className="space-y-5">

        {/* ── EN-TÊTE ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[rgb(185,151,83)] mb-2">
            Espace élève
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-black mb-1">
            Mon compte
          </h1>
          <p className="text-sm text-black/50">
            Infos du foyer, élèves, sécurité et gestion du compte.
          </p>
        </div>

        {/* ── LAYOUT DEUX COLONNES ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">

          {/* Colonne gauche : identité, sticky */}
          <aside className="space-y-4 lg:sticky lg:self-start" style={{ top: "calc(96px + 24px)" }}>
            <IdentiteCompte profile={profile} foyer={foyer} email={email} />
            <StatsCompte nbEleves={eleves.length} ville={foyer?.ville ?? null} />
          </aside>

          {/* Colonne droite : contenu */}
          <div className="min-w-0 space-y-5">
            <SectionEleves
              eleves={eleves}
              activeEleveId={activeEleveId}
              foyerId={foyer.id}
              onSelect={setActiveEleveId}
              onUpdated={handleEleveUpdated}
              onDeleted={handleEleveDeleted}
              onAdded={handleEleveAdded}
            />

            <SectionFoyer foyer={foyer} />

            <div className="rounded-[20px] border border-black/6 bg-white p-6 shadow-[0_2px_12px_rgba(16,16,16,0.04)]">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[rgb(239,244,239)]">
                  <Mail size={16} className="text-[rgb(22,92,71)]" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.20em] text-black/30">Connexion</p>
                  <p className="text-sm font-semibold text-black">Adresse email</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-[14px] bg-[rgb(247,249,247)] border border-black/6 px-4 py-3">
                <span className="text-sm text-black/70 flex-1">{email}</span>
                <span className="text-xs text-black/30">Non modifiable en ligne</span>
              </div>
              <p className="mt-2 text-xs text-black/35 pl-1">
                Pour modifier votre adresse email, {" "}
                <Link href="/contact" className="text-[rgb(22,92,71)] hover:underline font-medium">
                  contactez la direction
                </Link>.
              </p>
            </div>

            <SectionSecurite />
            <SectionSupprimerCompte />
          </div>
        </div>

      </div>
    </div>
    </div>
  );
}