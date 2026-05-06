// app/api/drive/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/plateforme/supabase/server";

const SCOPES = ["https://www.googleapis.com/auth/drive"];

async function getAccessToken(): Promise<string> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY!;
  const privateKey = rawKey.replace(/\\n/g, "\n");

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: email,
    scope: SCOPES.join(" "),
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj))
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  const header64 = encode(header);
  const payload64 = encode(payload);
  const signingInput = `${header64}.${payload64}`;

  // Import de la clé privée RSA
  const keyData = privateKey
    .replace("-----BEGIN RSA PRIVATE KEY-----", "")
    .replace("-----END RSA PRIVATE KEY-----", "")
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");

  const binaryKey = Buffer.from(keyData, "base64");
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    Buffer.from(signingInput)
  );

  const sig64 = Buffer.from(signature)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const jwt = `${signingInput}.${sig64}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error(`Token error: ${JSON.stringify(tokenData)}`);
  }
  return tokenData.access_token;
}

export async function POST(req: NextRequest) {
  // Vérifier que c'est la direction
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "direction") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const candidatureId = formData.get("candidatureId") as string;
    const candidatNom = formData.get("candidatNom") as string;

    if (!file || !candidatureId) {
      return NextResponse.json({ error: "Fichier ou ID manquant" }, { status: 400 });
    }

    const token = await getAccessToken();
    const folderId = process.env.GOOGLE_DRIVE_CANDIDATURES_FOLDER_ID!;

    // Nom du fichier sur Drive
    const ext = file.name.split(".").pop() ?? "mp4";
    const fileName = `${candidatNom}_${candidatureId}.${ext}`;

    // Upload multipart vers Drive
    const boundary = "creastar_boundary_" + Date.now();
    const metadata = JSON.stringify({
      name: fileName,
      parents: [folderId],
    });

    const fileBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(fileBuffer);

    // Construire le body multipart manuellement
    const metaPart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`;
    const filePart = `--${boundary}\r\nContent-Type: ${file.type || "video/mp4"}\r\n\r\n`;
    const ending = `\r\n--${boundary}--`;

    const metaBytes = new TextEncoder().encode(metaPart);
    const filePartBytes = new TextEncoder().encode(filePart);
    const endingBytes = new TextEncoder().encode(ending);

    const totalLength = metaBytes.length + filePartBytes.length + fileBytes.length + endingBytes.length;
    const body = new Uint8Array(totalLength);
    let offset = 0;
    body.set(metaBytes, offset); offset += metaBytes.length;
    body.set(filePartBytes, offset); offset += filePartBytes.length;
    body.set(fileBytes, offset); offset += fileBytes.length;
    body.set(endingBytes, offset);

    const uploadRes = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
          "Content-Length": totalLength.toString(),
        },
        body: body,
      }
    );

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      return NextResponse.json({ error: `Drive upload failed: ${err}` }, { status: 500 });
    }

    const driveFile = await uploadRes.json();

    // Rendre le fichier accessible en lecture (anyone with link)
    await fetch(`https://www.googleapis.com/drive/v3/files/${driveFile.id}/permissions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: "reader", type: "anyone" }),
    });

    // Mettre à jour la candidature avec l'URL Drive
    await supabase
      .from("candidatures")
      .update({
        drive_video_url: driveFile.webViewLink,
        drive_file_id: driveFile.id,
        video_url: null,
      })
      .eq("id", candidatureId);

    return NextResponse.json({
      success: true,
      fileId: driveFile.id,
      url: driveFile.webViewLink,
    });
  } catch (err: any) {
    console.error("Drive upload error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Supprimer un fichier Drive
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { fileId, candidatureId } = await req.json();

  try {
    const token = await getAccessToken();

    await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (candidatureId) {
      await supabase
        .from("candidatures")
        .update({ drive_video_url: null, drive_file_id: null })
        .eq("id", candidatureId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}