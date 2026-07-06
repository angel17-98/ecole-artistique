// app/components/plateforme/prof/ProfilDocuments.tsx
"use client";

import { useEffect, useState } from "react";
import { FileText, Search, ExternalLink, Loader2 } from "lucide-react";

interface DocumentProf {
  id: string;
  nom: string;
  label: string | null;
  type: string;
  drive_url: string | null;
  taille_octets: number | null;
  created_at: string;
}

const TYPES_DOCUMENT: { value: string; label: string }[] = [
  { value: "tous", label: "Tous" },
  { value: "contrat_signe", label: "Contrat signé" },
  { value: "assurance", label: "Assurance" },
  { value: "diplome", label: "Diplôme" },
  { value: "autre", label: "Autre" },
];

function formatTaille(octets: number | null): string {
  if (!octets) return "";
  if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
}

export default function ProfilDocuments() {
  const [documents, setDocuments] = useState<DocumentProf[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFiltre, setTypeFiltre] = useState("tous");

  useEffect(() => {
    fetch("/api/prof/documents")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setDocuments(data.documents ?? []);
      })
      .catch(() => setError("Impossible de charger les documents."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = documents.filter((d) => {
    const matchType = typeFiltre === "tous" || d.type === typeFiltre;
    const matchSearch = (d.label ?? d.nom).toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="rounded-[20px] border border-black/6 bg-white overflow-hidden"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <div className="px-6 py-4 border-b border-black/5">
        <p className="text-sm font-semibold text-black">Mes documents</p>
        <p className="text-xs text-black/40 mt-0.5">Partagés par la direction — contrats, assurance, diplômes.</p>
      </div>

      <div className="p-6 space-y-4">
        {documents.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-1 p-1 rounded-full bg-[rgb(247,250,247)] border border-black/6 flex-wrap">
              {TYPES_DOCUMENT.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTypeFiltre(t.value)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: typeFiltre === t.value ? "rgb(22,92,71)" : "transparent",
                    color: typeFiltre === t.value ? "white" : "rgba(0,0,0,0.5)",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="relative ml-auto">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" />
              <input
                type="text"
                placeholder="Rechercher…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-full text-xs border border-black/10 bg-white outline-none focus:border-black/20 w-48"
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-10 text-black/30">
            <Loader2 size={18} className="animate-spin" />
          </div>
        ) : error ? (
          <div className="rounded-[14px] border border-red-100 bg-red-50/40 p-5 text-center text-sm text-red-600">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[14px] border border-black/6 bg-[rgb(247,250,247)] p-6 text-center">
            <p className="text-xl mb-2">📄</p>
            <p className="text-xs text-black/40">
              {documents.length === 0
                ? "La direction n'a pas encore partagé de document."
                : "Aucun résultat pour ce filtre."}
            </p>
          </div>
        ) : (
          <div className="rounded-[14px] border border-black/6 divide-y divide-black/5 overflow-hidden">
            {filtered.map((doc) => (
              <a
                key={doc.id}
                href={doc.drive_url ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 px-4 py-3.5 hover:bg-black/[0.02] transition"
              >
                <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(22,92,71,0.08)", color: "rgb(22,92,71)" }}>
                  <FileText size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black truncate">{doc.label ?? doc.nom}</p>
                  <p className="text-xs text-black/40 mt-0.5">
                    {new Date(doc.created_at).toLocaleDateString("fr-BE", { day: "numeric", month: "long", year: "numeric" })}
                    {doc.taille_octets ? ` · ${formatTaille(doc.taille_octets)}` : ""}
                  </p>
                </div>
                <ExternalLink size={13} className="text-black/20 flex-shrink-0" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}