// app/components/plateforme/AnneeScolaireSelector.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, CalendarRange } from "lucide-react";

interface AnneeScolaire {
  id: string;
  libelle: string;
  active: boolean;
}

interface Props {
  annees: AnneeScolaire[];
  anneeActiveId: string;
  onChange: (anneeId: string) => void;
  compact?: boolean; // version réduite pour les headers
}

export default function AnneeScolaireSelector({
  annees,
  anneeActiveId,
  onChange,
  compact = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const anneeSelectionnee = annees.find(a => a.id === anneeActiveId) ?? annees[0];

  // Fermer si clic extérieur
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (annees.length <= 1) {
    // Une seule année → pas de sélecteur, juste un badge
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: compact ? "4px 10px" : "6px 12px",
          borderRadius: 100,
          background: "rgba(22,92,71,0.08)",
          border: "1px solid rgba(22,92,71,0.15)",
        }}
      >
        <CalendarRange size={compact ? 11 : 13} style={{ color: "rgb(22,92,71)" }} />
        <span style={{
          fontSize: compact ? 11 : 12,
          fontWeight: 600,
          color: "rgb(22,92,71)",
        }}>
          {anneeSelectionnee?.libelle ?? "—"}
        </span>
      </div>
    );
  }

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: compact ? "4px 10px" : "7px 14px",
          borderRadius: 100,
          background: open ? "rgba(22,92,71,0.12)" : "rgba(22,92,71,0.08)",
          border: "1px solid rgba(22,92,71,0.2)",
          cursor: "pointer",
          transition: "background 0.15s",
        }}
      >
        <CalendarRange size={compact ? 11 : 13} style={{ color: "rgb(22,92,71)" }} />
        <span style={{
          fontSize: compact ? 11 : 12,
          fontWeight: 600,
          color: "rgb(22,92,71)",
          whiteSpace: "nowrap",
        }}>
          {anneeSelectionnee?.libelle ?? "Année"}
        </span>
        <ChevronDown
          size={12}
          style={{
            color: "rgb(22,92,71)",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          left: 0,
          zIndex: 50,
          minWidth: 160,
          background: "white",
          borderRadius: 14,
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          overflow: "hidden",
          padding: "4px",
        }}>
          {annees.map(annee => {
            const isSelected = annee.id === anneeActiveId;
            return (
              <button
                key={annee.id}
                onClick={() => { onChange(annee.id); setOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: 10,
                  background: isSelected ? "rgba(22,92,71,0.06)" : "transparent",
                  cursor: "pointer",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    fontSize: 13,
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? "rgb(22,92,71)" : "rgba(0,0,0,0.75)",
                  }}>
                    {annee.libelle}
                  </span>
                  {annee.active && (
                    <span style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      padding: "2px 6px",
                      borderRadius: 100,
                      background: "rgba(22,92,71,0.1)",
                      color: "rgb(22,92,71)",
                    }}>
                      Active
                    </span>
                  )}
                </div>
                {isSelected && (
                  <Check size={13} style={{ color: "rgb(22,92,71)", flexShrink: 0 }} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}