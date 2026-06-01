// app/api/cron/expire-places/route.ts
//
// Cron Vercel — s'exécute toutes les heures (configurer dans vercel.json)
// Rôle :
//   1. Trouve toutes les candidatures "place_proposee" dont place_expire_at est dépassé
//   2. Les repasse en "liste_attente" (place libérée)
//   3. Notifie la direction par email + notification in-app
//   4. Notifie le candidat par email que sa place est perdue
//
// Sécurité : protégé par CRON_SECRET (header Authorization)

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/plateforme/supabase/admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const PARCOURS_LABELS: Record<string, string> = {
  "full-artist":      "Full Artist",
  "comedie-musicale": "Comédie Musicale",
  "eveil-musical":    "Éveil Musical",
};

export async function GET(req: NextRequest) {
  // ── Sécurité : vérifier le secret Vercel Cron ─────────────────────────────
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date().toISOString();

  // ── 1. Trouver les places expirées ────────────────────────────────────────
  const { data: expirees, error } = await supabaseAdmin
    .from("candidatures")
    .select("id, prenom, nom, email, parcours, groupe_inscription_id, user_id")
    .eq("statut", "place_proposee")
    .lt("place_expire_at", now);

  if (error) {
    console.error("Cron expire-places — fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!expirees || expirees.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  const results: { id: string; prenom: string; nom: string; status: string }[] = [];

  for (const candidature of expirees) {
    try {
      const parcoursLabel = PARCOURS_LABELS[candidature.parcours] ?? candidature.parcours;

      // ── 2. Remettre en liste d'attente, libérer le groupe ─────────────────
      await supabaseAdmin
        .from("candidatures")
        .update({
          statut: "liste_attente",
          groupe_inscription_id: null,       // place libérée
          place_proposee_at: null,
          place_expire_at: null,
        })
        .eq("id", candidature.id);

      // ── 3. Log dans notes_direction ───────────────────────────────────────
      await supabaseAdmin.from("notes_direction").insert({
        candidature_id: candidature.id,
        auteur_id: null,                     // action système
        type: "systeme",
        contenu: `⏰ Place expirée automatiquement — remis en liste d'attente`,
      });

      // ── 4. Email au candidat ──────────────────────────────────────────────
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: candidature.email,
        subject: `Ta place chez Crea'Star a expiré`,
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
            <div style="background: rgb(80,80,80); padding: 24px 28px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; font-size: 18px; margin: 0;">Ta place n'est plus disponible</h1>
            </div>
            <div style="background: #f9f8f5; padding: 24px 28px; border: 1px solid rgba(0,0,0,0.06); border-radius: 0 0 12px 12px;">
              <p style="font-size: 15px; line-height: 1.7;">
                Bonjour ${candidature.prenom},
              </p>
              <p style="font-size: 14px; color: rgba(0,0,0,0.6); line-height: 1.7;">
                La place qui t'était proposée dans le parcours
                <strong>${parcoursLabel}</strong> n'a pas été confirmée dans le délai imparti.
                Elle a été proposée à un autre candidat sur liste d'attente.
              </p>
              <p style="font-size: 14px; color: rgba(0,0,0,0.6); line-height: 1.7;">
                Tu restes sur liste d'attente — on te recontacte dès qu'une nouvelle place se libère.
              </p>
              <p style="font-size: 13px; color: rgba(0,0,0,0.4); margin-top: 24px;">
                L'équipe Crea'Star
              </p>
            </div>
          </div>
        `,
      }).catch(console.error);

      // ── 5. Notification in-app si le candidat a un compte ─────────────────
      if (candidature.user_id) {
        await supabaseAdmin.from("notifications").insert({
          user_id: candidature.user_id,
          type: "systeme",
          titre: "Ta place a expiré",
          contenu: `La place proposée dans le parcours ${parcoursLabel} a expiré. Tu es toujours sur liste d'attente.`,
          lu: false,
          lien: "/plateforme/dashboard",
        }).catch(console.error);
      }

      // ── 6. Email direction ────────────────────────────────────────────────
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: process.env.RESEND_TO_EMAIL!,
        subject: `[Place expirée] ${candidature.prenom} ${candidature.nom} — ${parcoursLabel}`,
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #111;">
            <div style="background: rgb(146,64,14); padding: 20px 28px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; font-size: 17px; margin: 0;">⏰ Place expirée — action requise</h1>
            </div>
            <div style="background: white; padding: 24px 28px; border: 1px solid rgba(0,0,0,0.06); border-radius: 0 0 12px 12px;">
              <p style="font-size: 14px; line-height: 1.7;">
                <strong>${candidature.prenom} ${candidature.nom}</strong> n'a pas confirmé sa place
                dans le parcours <strong>${parcoursLabel}</strong> dans le délai imparti.
              </p>
              <p style="font-size: 14px; color: rgba(0,0,0,0.6); line-height: 1.7;">
                Le candidat a été remis en liste d'attente. La place est de nouveau disponible
                dans le module Groupes — tu peux la proposer au prochain candidat.
              </p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/plateforme/direction/groupes"
                style="display: inline-block; background: rgb(22,92,71); color: white; text-decoration: none;
                       padding: 10px 20px; border-radius: 100px; font-size: 13px; font-weight: 600; margin-top: 8px;">
                Voir les groupes →
              </a>
            </div>
          </div>
        `,
      }).catch(console.error);

      results.push({
        id: candidature.id,
        prenom: candidature.prenom,
        nom: candidature.nom,
        status: "expired",
      });

    } catch (err) {
      console.error(`Cron: erreur sur candidature ${candidature.id}:`, err);
      results.push({
        id: candidature.id,
        prenom: candidature.prenom,
        nom: candidature.nom,
        status: "error",
      });
    }
  }

  console.log(`Cron expire-places — ${results.length} candidature(s) traitée(s)`);
  return NextResponse.json({ processed: results.length, results });
}