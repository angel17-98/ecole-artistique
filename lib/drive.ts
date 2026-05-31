// lib/drive.ts
// Helper partagé pour toutes les interactions Google Drive
// Utilise GOOGLE_CLIENT_EMAIL + GOOGLE_PRIVATE_KEY + GOOGLE_DRIVE_FOLDER_ID

const SCOPES = ["https://www.googleapis.com/auth/drive"];

/**
 * Génère un access token OAuth2 via JWT (Service Account)
 */
export async function getAccessToken(): Promise<string> {
  const email = process.env.GOOGLE_CLIENT_EMAIL!;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY!;
  const privateKey = rawKey.replace(/\\n/g, "\n");

  const now = Math.floor(Date.now() / 1000);

  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj))
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  const header64 = encode({ alg: "RS256", typ: "JWT" });
  const payload64 = encode({
    iss: email,
    scope: SCOPES.join(" "),
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  });

  const signingInput = `${header64}.${payload64}`;

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
    throw new Error(`Drive token error: ${JSON.stringify(tokenData)}`);
  }
  return tokenData.access_token;
}

/**
 * Cherche un dossier par nom dans un parent donné.
 * Le crée s'il n'existe pas. Retourne l'ID du dossier.
 */
export async function getOrCreateFolder(
  token: string,
  name: string,
  parentId: string
): Promise<string> {
  // Chercher d'abord si le dossier existe déjà
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=` +
      encodeURIComponent(
        `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
      ) +
      `&fields=files(id,name)`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Créer le dossier s'il n'existe pas
  const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    }),
  });

  const createData = await createRes.json();
  if (!createData.id) {
    throw new Error(`Impossible de créer le dossier "${name}": ${JSON.stringify(createData)}`);
  }
  return createData.id;
}

/**
 * Upload un fichier (Buffer ou Uint8Array) vers Drive via multipart.
 * Retourne { id, webViewLink }
 */
export async function uploadFileToDrive(
  token: string,
  file: {
    name: string;
    mimeType: string;
    buffer: Uint8Array;
  },
  parentId: string
): Promise<{ id: string; webViewLink: string }> {
  const boundary = "creastar_" + Date.now();
  const metadata = JSON.stringify({ name: file.name, parents: [parentId] });

  const metaPart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`;
  const filePart = `--${boundary}\r\nContent-Type: ${file.mimeType}\r\n\r\n`;
  const ending = `\r\n--${boundary}--`;

  const metaBytes = new TextEncoder().encode(metaPart);
  const filePartBytes = new TextEncoder().encode(filePart);
  const endingBytes = new TextEncoder().encode(ending);

  const totalLength =
    metaBytes.length + filePartBytes.length + file.buffer.length + endingBytes.length;
  const body = new Uint8Array(totalLength);
  let offset = 0;
  body.set(metaBytes, offset); offset += metaBytes.length;
  body.set(filePartBytes, offset); offset += filePartBytes.length;
  body.set(file.buffer, offset); offset += file.buffer.length;
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
      body,
    }
  );

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`Drive upload failed: ${err}`);
  }

  const driveFile = await uploadRes.json();
  return { id: driveFile.id, webViewLink: driveFile.webViewLink };
}

/**
 * Rend un fichier Drive accessible en lecture à tous (lien public).
 */
export async function makeFilePublic(token: string, fileId: string): Promise<void> {
  await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role: "reader", type: "anyone" }),
  });
}

/**
 * Initialise la structure de dossiers Crea'Star complète.
 * Crée les dossiers manquants, ne touche pas à ceux qui existent.
 *
 * Structure :
 * 📁 Crea'Star/                     ← GOOGLE_DRIVE_FOLDER_ID
 *    📁 Candidatures/               ← GOOGLE_DRIVE_CANDIDATURES_FOLDER_ID
 *       📁 2025-2026/
 *          📁 Full Artist/
 *          📁 Comédie Musicale/
 *          📁 Éveil Musical/
 *    📁 Élèves/
 *       📁 2025-2026/
 *          📁 [Groupe A]/
 *             📁 [Prénom Nom]/
 *    📁 Spectacles/
 *       📁 2025-2026/
 */
export async function initDriveStructure(
  annee: string,
  groupes: string[] = []
): Promise<{
  candidaturesAnneeId: string;
  elevesAnneeId: string;
  spectaclesAnneeId: string;
}> {
  const token = await getAccessToken();
  const rootId = process.env.GOOGLE_DRIVE_FOLDER_ID!;
  const candidaturesRootId = process.env.GOOGLE_DRIVE_CANDIDATURES_FOLDER_ID!;

  // Candidatures/[année]
  const candidaturesAnneeId = await getOrCreateFolder(token, annee, candidaturesRootId);

  // Candidatures/[année]/[parcours]
  for (const parcours of ["Full Artist", "Comédie Musicale", "Éveil Musical"]) {
    await getOrCreateFolder(token, parcours, candidaturesAnneeId);
  }

  // Élèves/
  const elevesRootId = await getOrCreateFolder(token, "Élèves", rootId);
  const elevesAnneeId = await getOrCreateFolder(token, annee, elevesRootId);

  // Élèves/[année]/[groupes]
  for (const groupe of groupes) {
    await getOrCreateFolder(token, groupe, elevesAnneeId);
  }

  // Spectacles/
  const spectaclesRootId = await getOrCreateFolder(token, "Spectacles", rootId);
  const spectaclesAnneeId = await getOrCreateFolder(token, annee, spectaclesRootId);

  return { candidaturesAnneeId, elevesAnneeId, spectaclesAnneeId };
}