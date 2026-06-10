# Intégration DGA — Import par courriel & analyseurs en continu

Ce module permet d'alimenter le **Diagnostic DGA** de deux façons, en plus de l'import manuel :

1. **Import par courriel (Phase 1 — livré)** : chaque tenant a une **adresse dédiée**. Les rapports
   envoyés à cette adresse sont **analysés et importés automatiquement, en temps réel**.
2. **Analyseurs de gaz en continu (Phase 2 — à venir)** : ingestion de la télémétrie des moniteurs
   DGA en ligne (Modbus / DNP3 / IEC 61850) via passerelle. Voir la fin du document.

L'import manuel et l'import par courriel acceptent **les PDF de labo** (extraction IA) **et les
exports Excel/CSV LIMS InsideView / Morgan Schaffer** (mappage déterministe, sans IA).

---

## A. Configuration OPÉRATEUR (une seule fois)

**Une adresse par tenant = automatique.** Le domaine de réception est en **catch-all** : *toute*
adresse `dga.<tenant>@<domaine>` arrive au même webhook, qui résout le tenant depuis l'adresse.
Aucune boîte à créer par tenant (la config s'auto-crée quand le tenant ouvre le panneau « Import
par courriel » dans l'app).

### A.1 Migration base de données
Appliquer `supabase/migrations/153_dga_email_inbound.sql` dans le **bon** projet Supabase
(`NEXT_PUBLIC_SUPABASE_URL`). Elle crée `dga_inbound` + `dga_inbound_log`, ajoute la colonne
`seen` à `dga_measures`, et publie `dga_dossiers`/`dga_measures` en temps réel.

### A.2 Réception — Option 1 : Cloudflare Email Routing (GRATUIT, recommandé)
Le webhook accepte une **passerelle générique** (pièces jointes en ligne + secret partagé) : aucune
dépendance payante pour recevoir.
1. Domaine `c-secur360.ca` (ou au moins le sous-domaine `in.c-secur360.ca`) géré par **Cloudflare**
   (DNS sur Cloudflare — gratuit).
2. Cloudflare → **Email → Email Routing** : activer, puis règle **catch-all** de `in.c-secur360.ca`
   → **Send to a Worker**.
3. Déployer le Worker du dossier **`docs/cloudflare-email-worker/`** (`npm install` + `wrangler deploy` ;
   voir son `README.md`). Variables : `IMPORT_URL=https://www.c-secur360.ca/api/dga/email-inbound`
   (dans `wrangler.toml`) et `INBOUND_SECRET` en **secret** (`wrangler secret put`, = même valeur que
   `DGA_INBOUND_WEBHOOK_SECRET`).

Le Worker parse le courriel et **POST** les pièces jointes (PDF/Excel/CSV) en base64 au webhook avec
l'en-tête `x-cs-inbound-secret`. Gratuit (Email Routing + Workers free tier).

### A.2 bis — Option 2 : Resend Inbound (alternative)
1. Resend → **Receiving** : ajouter le domaine `in.c-secur360.ca` + enregistrements **MX**.
2. Webhook Resend (event **`email.received`**) → `https://www.c-secur360.ca/api/dga/email-inbound`.
3. `DGA_INBOUND_WEBHOOK_SECRET` = secret de signature Svix (`whsec_…`).

### A.3 Variables d'environnement (Vercel)
| Variable | Rôle |
|---|---|
| `DGA_INBOUND_WEBHOOK_SECRET` | **Obligatoire.** Cloudflare : secret partagé (valeur libre, même que `INBOUND_SECRET` du Worker). Resend : secret de signature Svix (`whsec_…`). |
| `DGA_INBOUND_DOMAIN` | Domaine de réception, ex. `in.c-secur360.ca`. Détermine l'adresse de chaque tenant : `dga.<tenant>@<domaine>`. |
| `RESEND_API_KEY` | Clé API Resend — **uniquement pour ENVOYER** les courriels de confirmation (gratuit ≤ 3 000/mois). Aussi nécessaire si on utilise Resend pour la réception (Option 2). |
| `EMAIL_FROM` | Expéditeur des courriels de confirmation. |

### A.4 Sécurité (intégrée)
- **Signature Svix** vérifiée sur chaque appel (HMAC-SHA256). En prod, secret absent ⇒ 401/503.
- **Tenant résolu par la config** (adresse `To`), jamais par le corps du courriel.
- **Liste blanche d'expéditeurs** par tenant (anti-usurpation).
- Écritures en **service_role** côté serveur ; tables de config/journal **fermées à l'anon** (RLS).
- **Budget IA** par tenant respecté (les PDF consomment ; les Excel/CSV LIMS sont gratuits).
- Courriel **sans DGA** (pas de PDF/Excel exploitable) ⇒ **ignoré** (trace au journal, sans réponse).

---

## B. Installation côté TENANT (libre-service)

Dans le module **DGA → bouton « Import par courriel »** :

1. **Copier l'adresse d'import** dédiée (`dga.<tenant>@<domaine>`).
2. **Ajouter les expéditeurs autorisés** (courriel précis ou `@domaine`). *Vide = accepter tous
   (déconseillé).*
3. **Activer** l'import par courriel.
4. **Envoyer / faire suivre** un rapport DGA :
   - depuis le **logiciel de labo** (InsideView, Morgan Schaffer, ou autre) en ajoutant l'adresse
     comme destinataire des rapports ;
   - ou en **transférant** simplement le courriel du rapport à cette adresse.
5. Les transformateurs et mesures apparaissent **en quelques secondes** dans la liste, avec un
   **badge « Nouveau »** ; les diagnostics IEEE C57.104 / Duval sont calculés automatiquement.
   Le badge disparaît à l'ouverture de la fiche.

**Formats acceptés** : PDF de labo (tous fournisseurs) ; **Excel/CSV LIMS** InsideView / Morgan
Schaffer (colonnes du gabarit `template.ms` : `h2, c2h2, …, sampledate, AssetName, d877, acidnum,
furfural, totalpcb, …`). L'Excel est mappé **directement** (déterministe, sans IA).

---

## C. Phase 2 — Analyseurs de gaz en continu (conception)

Les moniteurs DGA en ligne (GE Kelman/Hydran, Vaisala OPT100, Doble/Morgan Schaffer Calisto,
MR MSENSE, Camlin TOTUS, Qualitrol/Serveron…) exposent tous **Modbus (RTU/TCP)**, souvent **DNP3**
et **IEC 61850** (parfois en option), plus une interface web. Une app cloud ne peut pas parler ces
protocoles directement (réseau OT du poste, pare-feu) : l'industrie utilise une **passerelle edge**
qui pousse la donnée normalisée vers le cloud.

Architecture cible (rampes convergeant vers **un endpoint d'ingestion normalisé** `/api/dga/ingest`) :
- **Agent edge C-Secur360** (fourni) : lit Modbus/DNP3/IEC 61850 et pousse en HTTPS/MQTT signé.
- **Push depuis le SCADA/passerelle du client** vers le même endpoint.
- **Pull planifié** des plateformes constructeur (GE Perception, Doble doblePRIME, Qualitrol QDMS).

Ingestion → table série temporelle `dga_online_readings` + registre `dga_devices`, alarmes locales
(IEEE C57.104 seuils + C57.143 taux de variation), notifications, et **temps réel** sur la fiche.
Les instructions de raccordement par appareil seront publiées dans le panneau « Import par courriel ».
