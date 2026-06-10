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

export default {
  async email(message, env, ctx) {
    const rawEmail = new Response(message.raw);
    const arrayBuffer = await rawEmail.arrayBuffer();
    const parser = new PostalMime();
    const email = await parser.parse(arrayBuffer);

    const payload = {
      to: message.to,        // destinataire d'enveloppe = dga.<tenant>@in.c-secur360.ca
      from: message.from,    // expediteur d'enveloppe (verifie contre la liste blanche)
      subject: email.subject || "",
      text: email.text || "",
      html: email.html || "",
      attachments: (email.attachments || []).map((att) => ({
        filename: att.filename,
        contentType: att.mimeType, // <-- la route lit `contentType` (et non `mimeType`)
        content: arrayBufferToBase64(att.content), // <-- la route lit `content` en base64
      })),
    };

    const resp = await fetch(env.IMPORT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cs-inbound-secret": env.INBOUND_SECRET,
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      throw new Error(`API a repondu ${resp.status}`);
    }
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
