// app/components/plateforme/prof/DuoTrioToggle.tsx
// À insérer dans app/plateforme/prof/profil/page.tsx (ou équivalent).
// Le prof active/désactive lui-même duo et trio ; le tarif reste fixé par la direction (lecture seule ici).

"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

interface Preferences {
  accepte_duo: boolean;
  accepte_trio: boolean;
}

export default function DuoTrioToggle() {
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/prof/preferences")
      .then((res) => res.json())
      .then((data) => setPrefs(data.preferences ?? { accepte_duo: false, accepte_trio: false }))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (key: keyof Preferences) => {
    if (!prefs) return;
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setSaving(true);
    try {
      const res = await fetch("/api/prof/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: next[key] }),
      });
      if (!res.ok) throw new Error();
      setToast("Préférence enregistrée.");
    } catch {
      setPrefs(prefs); // rollback
      setToast("Erreur, réessaie.");
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 2500);
    }
  };

  if (loading || !prefs) {
    return (
      <div className="rounded-[20px] border border-black/6 bg-white p-6 animate-pulse h-24" />
    );
  }

  return (
    <div className="rounded-[20px] border border-black/6 bg-white p-6"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <p className="text-sm font-semibold text-black mb-1">Cours duo / trio</p>
      <p className="text-xs text-black/40 mb-4 leading-5">
        Le tarif de ces formats est fixé par la direction dans ton contrat — active ici uniquement
        si tu es d'accord pour enseigner à plusieurs élèves en même temps.
      </p>

      <div className="space-y-3">
        {([
          { key: "accepte_duo" as const, label: "Cours duo (2 élèves)" },
          { key: "accepte_trio" as const, label: "Cours trio (3 élèves)" },
        ]).map((item) => (
          <div key={item.key} className="flex items-center justify-between rounded-[14px] px-4 py-3"
            style={{ background: "rgb(247,250,247)" }}>
            <span className="text-sm text-black/70">{item.label}</span>
            <button
              onClick={() => toggle(item.key)}
              disabled={saving}
              className="rounded-full px-4 py-1.5 text-xs font-semibold transition disabled:opacity-50"
              style={{
                background: prefs[item.key] ? "rgb(22,92,71)" : "rgba(0,0,0,0.06)",
                color: prefs[item.key] ? "white" : "rgba(0,0,0,0.4)",
              }}
            >
              {prefs[item.key] ? "Activé" : "Désactivé"}
            </button>
          </div>
        ))}
      </div>

      {toast && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-[rgb(22,92,71)]">
          <CheckCircle2 size={12} /> {toast}
        </div>
      )}
    </div>
  );
}