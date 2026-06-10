// Cloudflare Email Worker — reception GRATUITE des rapports DGA -> POST vers C-Secur360.
//
// Pre-requis (gratuit) :
//   1. Le domaine c-secur360.ca (ou au moins le sous-domaine in.c-secur360.ca) est gere par
//      Cloudflare (DNS sur Cloudflare).
//   2. Cloudflare Dashboard -> Email -> Email Routing : active, puis regle CATCH-ALL de
//      in.c-secur360.ca -> "Send to a Worker" -> ce Worker.
//   3. Deploie ce Worker (Wrangler). Dependance npm : postal-mime.
//
// Variables du Worker (wrangler.toml [vars] + secret) :
//   IMPORT_URL     = https://www.c-secur360.ca/api/dga/email-inbound
//   INBOUND_SECRET = (MEME valeur que DGA_INBOUND_WEBHOOK_SECRET sur Vercel)
//
// Resultat : tout courriel recu a dga.<tenant>@in.c-secur360.ca est parse ; ses pieces jointes
// (PDF / Excel / CSV) sont envoyees en base64 a notre webhook, qui resout le tenant, verifie la
// liste blanche et importe. Aucune dependance payante.

import PostalMime from 'postal-mime';

// Encodage base64 sur gros binaires (par tranches, evite le debordement de pile).
function toBase64(buf) {
  const bytes = new Uint8Array(buf);
  let bin = '';
  const CH = 0x8000;
  for (let i = 0; i < bytes.length; i += CH) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
  return btoa(bin);
}

export default {
  async email(message, env) {
    const raw = await new Response(message.raw).arrayBuffer();
    const email = await PostalMime.parse(raw);
    const attachments = (email.attachments || []).map((a) => ({
      filename: a.filename || 'file',
      contentType: a.mimeType || '',
      contentBase64: toBase64(a.content),
    }));
    await fetch(env.IMPORT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-cs-inbound-secret': env.INBOUND_SECRET },
      body: JSON.stringify({
        to: [message.to], // destinataire d'enveloppe = dga.<tenant>@in.c-secur360.ca
        from: message.from || (email.from && email.from.address) || '',
        subject: email.subject || '',
        attachments,
      }),
    });
  },
};
