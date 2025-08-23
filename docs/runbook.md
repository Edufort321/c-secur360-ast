# C-Secur360 — Carnet de bord (Runbook)
_Mis à jour : 2025-01-22_

## Sommaire
- [Domaine & DNS](#domaine--dns)
- [Vercel – Variables (Prod)](#vercel--variables-prod)
- [Stripe](#stripe)
- [Twilio](#twilio)
- [Supabase](#supabase)
- [Cron Vercel](#cron-vercel)
- [Procédures](#procédures)
- [Surveillance & Monitoring](#surveillance--monitoring)

## Domaine & DNS
- **Domaine principal** : c-secur360.ca
- **DNS** : A @ → 76.76.21.21 ; CNAME www → c-secur360.vercel.app
- **Vercel** : www → 308 Permanent Redirect vers c-secur360.ca
- **SSL** : Let's Encrypt (auto)

## Vercel – Variables (Prod)
- **NEXT_PUBLIC_APP_URL** : https://c-secur360.ca
- **Supabase** : 
  - NEXT_PUBLIC_SUPABASE_URL (présent)
  - NEXT_PUBLIC_SUPABASE_ANON_KEY (présent)
  - SUPABASE_SERVICE_ROLE_KEY (présent)
- **Stripe** : 
  - STRIPE_SECRET_KEY (présent)
  - STRIPE_WEBHOOK_SECRET (présent)
  - STRIPE_PRICE_MONTHLY (présent)
  - STRIPE_PRICE_ANNUAL (présent)
  - STRIPE_PRICE_ADDON_SITE_MONTHLY (présent)
  - STRIPE_PRICE_ADDON_SITE_ANNUAL (présent)
  - STRIPE_ACCOUNT_COUNTRY=CA
- **Twilio** : 
  - TWILIO_ACCOUNT_SID (présent)
  - TWILIO_AUTH_TOKEN (présent)
  - TWILIO_MESSAGING_SERVICE_SID (présent)
  - TWILIO_PHONE_NUMBER (présent)
- **Contact** : 
  - OWNER_MOBILE=+15146034519
  - PUBLIC_CONTACT_NUMBER=<numéro Twilio>

## Stripe
- **Plans** : Mensuel/Annuel
- **Add-on** : Site additionnel (50$/mois ; 600$/an)
- **Checkout** : mode subscription, automatic_tax ON
- **Webhooks** : 
  - checkout.session.completed
  - customer.subscription.*
  - invoice.*

## Twilio
- **Numéro** : +1 XXX XXX XXXX (CA)
- **Messaging Service** : C-Secur360 Notifications (SID: MG…)
- **Inbound SMS** : /api/sms/inbound
- **Delivery Status** : /api/sms/status
- **Voice Inbound** : /api/voice/inbound → forward vers OWNER_MOBILE

## Supabase
- **Tables clés** : 
  - customers, subscriptions, invoices
  - workers (phone, phone_verified, sms_consent)
  - sms_alerts, billing_events
  - system_audit_logs (audit trail)
- **RLS** : admins du tenant uniquement (à confirmer)

## Cron Vercel
- **/api/billing/sync** (quotidien 04:00)
- **/api/sms/cleanup** (hebdo)

## Procédures

### Test SMS sortant
```bash
POST /api/send-sms 
{
  "to": "+15146034519",
  "body": "Test"
}
```

### Test inbound STOP/START
- Envoyer "STOP" au numéro Twilio
- Vérifier consentement retiré
- Envoyer "START" pour réactiver

### Test appel entrant
- Appeler le numéro Twilio
- Vérifier forward vers OWNER_MOBILE

### Test Checkout Stripe
- Tester en mode test puis production
- Vérifier sync en base après paiement

### Health Check
- Accéder à `/api/system/status`
- Vérifier présence variables d'environnement
- Consulter `/admin/runbook` pour monitoring

## Surveillance & Monitoring

### Endpoints de surveillance
- **Health Check** : `/api/system/status`
- **Admin Monitoring** : `/admin/runbook`
- **Database Status** : `/api/db/init`

### Logs d'audit
- Table `system_audit_logs` pour traçabilité
- Zones surveillées : stripe, twilio, vercel, supabase, dns
- Actions trackées : update_env, webhook_event, send_sms, inbound

### Métriques importantes
- Taux de livraison SMS
- Temps de réponse API
- Erreurs de webhook Stripe
- Utilisation base de données

## Contacts d'urgence
- **Développeur** : eric.dufort@cerdia.ai
- **Téléphone** : +1 (514) 603-4519
- **Support Technique** : Disponible 24/7

---
_Ce runbook est maintenu à jour automatiquement. Dernière révision du système : 2025-01-22_