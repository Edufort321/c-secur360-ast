import PostalMime from "postal-mime";

// Cloudflare Email Worker — reception GRATUITE des rapports DGA -> POST vers C-Secur360.
//
// Pre-requis (gratuit) :
//   1. Domaine c-secur360.ca (ou sous-domaine in.c-secur360.ca) gere par Cloudflare (DNS).
//   2. Cloudflare -> Email -> Email Routing : active, puis regle CATCH-ALL de in.c-secur360.ca
//      -> "Send to a Worker" -> ce Worker.
//   3. Deploiement (voir README.md de ce dossier) ; dependance npm : postal-mime.
//
// Variables :
//   IMPORT_URL     = https://www.c-secur360.ca/api/dga/email-inbound
//   INBOUND_SECRET = (MEME valeur que DGA_INBOUND_WEBHOOK_SECRET cote Vercel)  [a poser en SECRET]
//
// IMPORTANT — alignement avec /api/dga/email-inbound (branche passerelle) :
//   - body : { to, from, subject, attachments }  (text/html sont ignores par la route)
//   - attachment : la route lit `content` (BASE64) et `contentType` (PAS `mimeType`) et `filename`.
//     -> on mappe donc att.mimeType -> contentType.

// Limite de corps Vercel ~4,5 Mo. On reste sous ~3 Mo de base64 par POST (et on envoie en
// PLUSIEURS POST si besoin) pour eviter le 413 quand il y a plusieurs/grosses pieces jointes.
const MAX_BATCH_B64 = 3_000_000;
const isDgaDoc = (a) =>
  /pdf|spreadsheet|excel|sheet|csv|ms-excel/i.test(a.contentType || "") ||
  /\.(pdf|xlsx|xls|csv)$/i.test(a.filename || "");

export default {
  async email(message, env, ctx) {
    const rawEmail = new Response(message.raw);
    const arrayBuffer = await rawEmail.arrayBuffer();
    const parser = new PostalMime();
    const email = await parser.parse(arrayBuffer);

    // 1) Ne garder QUE les rapports (PDF / Excel / CSV) ; ignorer logos, signatures, images...
    const docs = (email.attachments || [])
      .map((att) => ({ filename: att.filename, contentType: att.mimeType, content: arrayBufferToBase64(att.content) }))
      .filter(isDgaDoc);
    if (docs.length === 0) return; // rien d'exploitable -> on laisse tomber

    const meta = { to: message.to, from: message.from, subject: email.subject || "" };

    // 2) Envoi par LOTS sous la limite (text/html volontairement omis : la route les ignore).
    const post = async (attachments) => {
      const resp = await fetch(env.IMPORT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-cs-inbound-secret": env.INBOUND_SECRET },
        body: JSON.stringify({ ...meta, attachments }),
      });
      if (!resp.ok) throw new Error(`API a repondu ${resp.status}`);
    };

    let batch = [], size = 0;
    for (const d of docs) {
      // Une piece seule trop grosse part quand meme dans son propre POST (cas limite).
      if (batch.length && size + d.content.length > MAX_BATCH_B64) { await post(batch); batch = []; size = 0; }
      batch.push(d); size += d.content.length;
    }
    if (batch.length) await post(batch);
  },
};

// Encodage base64 (stack-safe : concatenation octet par octet, pas de spread sur gros tableau).
function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
