# Worker courriel DGA (Cloudflare) — réception gratuite

Reçoit les courriels envoyés à `dga.<tenant>@in.c-secur360.ca` et POST les pièces jointes
(PDF / Excel / CSV) vers `/api/dga/email-inbound`.

## Déploiement
```bash
cd docs/cloudflare-email-worker
npm install
# Pose le secret (MÊME valeur que DGA_INBOUND_WEBHOOK_SECRET côté Vercel) :
npx wrangler secret put INBOUND_SECRET
npx wrangler deploy
```

## Brancher la réception
Cloudflare Dashboard → **Email → Email Routing** → règle **catch-all** de `in.c-secur360.ca`
→ **Send to a Worker** → `csecur360-dga-email`.

## Alignement payload (ne pas modifier sans la route)
La route `/api/dga/email-inbound` (branche passerelle) lit dans le body JSON :
- `to` (string ou array), `from`, `subject` ; `text`/`html` sont **ignorés**.
- `attachments[]` : `content` (**base64**), `contentType`, `filename`.

Le Worker mappe `att.mimeType` → `contentType` en conséquence.
