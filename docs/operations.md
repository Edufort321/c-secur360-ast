# Guide d'Opérations — C-Secur360

Guide pratique pour les opérations quotidiennes, tests et maintenance de la plateforme C-Secur360.

## Sommaire
- [Tests de communication](#tests-de-communication)
- [Tests de paiement](#tests-de-paiement)
- [Surveillance système](#surveillance-système)
- [Maintenance préventive](#maintenance-préventive)
- [Dépannage courant](#dépannage-courant)
- [Contacts d'urgence](#contacts-durgence)

## Tests de communication

### Test SMS sortant
```bash
# Test d'envoi SMS via API
curl -X POST https://c-secur360.ca/api/send-sms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "to": "+15146034519",
    "body": "Test SMS C-Secur360 - ' $(date) '"
  }'
```

**Résultat attendu :**
- Status 200 avec message_sid retourné
- SMS reçu sur +15146034519 dans les 30 secondes
- Log dans system_audit_logs avec area="twilio"

### Test SMS entrant (STOP/START)

**Procédure :**
1. Envoyer "STOP" au numéro Twilio depuis +15146034519
2. Vérifier dans la table `workers` que `sms_consent = false`
3. Envoyer "START" pour réactiver
4. Vérifier que `sms_consent = true`

**Webhook endpoint :** `/api/sms/inbound`

### Test appel entrant

**Procédure :**
1. Appeler le numéro Twilio : `+1 XXX XXX XXXX`
2. L'appel doit être automatiquement transféré vers +15146034519
3. Vérifier les logs d'audit pour l'action "voice_forward"

**Webhook endpoint :** `/api/voice/inbound`

## Tests de paiement

### Mode Test Stripe

**Cartes de test :**
```bash
# Visa réussie
4242424242424242

# Visa échec
4000000000000002

# Visa nécessite 3D Secure
4000002500003155
```

**Test checkout :**
1. Aller sur `/demo/pricing`
2. Cliquer "Commencer maintenant"
3. Utiliser carte test 4242424242424242
4. Vérifier webhook reçu dans `/api/webhooks/stripe`
5. Vérifier création dans table `subscriptions`

### Mode Production

**Procédure de test mensuel :**
1. Créer un abonnement test avec carte réelle
2. Vérifier facture dans Stripe Dashboard
3. Confirmer sync automatique via `/api/billing/sync`
4. Annuler immédiatement pour éviter charges

## Surveillance système

### Health Checks quotidiens

**URLs à vérifier :**
```bash
# Status système
curl https://c-secur360.ca/api/system/status

# Base de données
curl https://c-secur360.ca/api/db/init

# Monitoring admin
https://c-secur360.ca/admin/runbook
```

**Métriques importantes :**
- Variables d'environnement : 17/17 présentes
- Taux de livraison SMS : > 95%
- Temps de réponse API : < 2s
- Erreurs Stripe webhooks : < 1%

### Logs d'audit

**Requête courante :**
```sql
-- Erreurs des dernières 24h
SELECT * FROM system_audit_logs 
WHERE created_at > NOW() - INTERVAL '24 hours'
AND details->>'error' IS NOT NULL
ORDER BY created_at DESC;

-- SMS envoyés aujourd'hui
SELECT COUNT(*) FROM system_audit_logs 
WHERE area = 'twilio' 
AND action = 'sms_send'
AND created_at::date = CURRENT_DATE;
```

### Alertes automatiques

**Créer des alertes pour :**
- Variables d'environnement manquantes
- Taux d'erreur SMS > 5%
- Webhooks Stripe en échec
- Espace disque > 80%
- CPU > 90% pendant 5min

## Maintenance préventive

### Hebdomadaire

**Dimanche 03:00 (automatique) :**
- Nettoyage SMS > 180 jours via `/api/sms/cleanup`
- Nettoyage logs audit > 1 an
- Vérification espace base de données

**À faire manuellement :**
- Vérifier backups Supabase
- Tester restoration d'une sauvegarde
- Mettre à jour dépendances npm (si nécessaire)

### Quotidien

**04:00 (automatique) :**
- Synchronisation billing Stripe → Supabase via `/api/billing/sync`
- Réconciliation abonnements

**À vérifier :**
- Logs d'erreur dans Vercel
- Métriques Stripe Dashboard
- Utilisation Twilio (SMS/Voice)

### Mensuel

**Premier dimanche du mois :**
- Audit sécurité complet
- Test de tous les webhooks
- Vérification conformité RGPD
- Mise à jour documentation

## Dépannage courant

### Problème : SMS ne s'envoient pas

**Diagnostic :**
```bash
# 1. Vérifier config Twilio
curl https://c-secur360.ca/api/system/status | grep -i twilio

# 2. Vérifier logs récents
SELECT * FROM system_audit_logs 
WHERE area = 'twilio' AND action LIKE 'sms_%'
ORDER BY created_at DESC LIMIT 10;

# 3. Tester manuellement
curl -X POST https://c-secur360.ca/api/send-sms \
  -H "Content-Type: application/json" \
  -d '{"to": "+15146034519", "body": "Test manuel"}'
```

**Solutions courantes :**
- Vérifier TWILIO_AUTH_TOKEN dans Vercel
- Confirmer que le numéro est vérifié
- Vérifier crédits Twilio restants

### Problème : Webhooks Stripe en échec

**Diagnostic :**
1. Aller dans Stripe Dashboard → Webhooks
2. Vérifier les tentatives échouées
3. Examiner les logs dans `/api/webhooks/stripe`

**Solutions :**
- Re-signer webhook endpoint
- Vérifier STRIPE_WEBHOOK_SECRET
- Tester manuellement avec Stripe CLI

### Problème : Site inaccessible

**Diagnostic :**
```bash
# 1. Tester DNS
nslookup c-secur360.ca

# 2. Tester HTTPS
curl -I https://c-secur360.ca

# 3. Vérifier Vercel
https://vercel.com/cerdia/c-secur360-ast/deployments
```

## Variables d'environnement critiques

### Production (Vercel)

**Obligatoires :**
```bash
NEXT_PUBLIC_APP_URL=https://c-secur360.ca
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_MESSAGING_SERVICE_SID=MG...
TWILIO_PHONE_NUMBER=+1...
OWNER_MOBILE=+15146034519
```

**Optionnelles :**
```bash
CRON_SECRET=... (pour sécuriser les crons)
STRIPE_ACCOUNT_COUNTRY=CA
PUBLIC_CONTACT_NUMBER=... (numéro affiché publiquement)
```

## Procédures d'urgence

### Incident critique (site down)

1. **Diagnostic rapide (< 2 min)**
   - Vérifier status Vercel
   - Tester https://c-secur360.ca/api/system/status
   - Vérifier Supabase dashboard

2. **Communication (< 5 min)**
   - Poster update sur status page (si disponible)
   - Notifier clients critiques par SMS
   - Documenter incident dans system_audit_logs

3. **Résolution**
   - Rollback dernier déploiement si nécessaire
   - Vérifier logs Vercel/Supabase
   - Corriger problème identifié

### Fuite de données suspectée

1. **Sécurisation immédiate**
   - Révoquer clés API compromises
   - Changer STRIPE_WEBHOOK_SECRET
   - Réinitialiser TWILIO_AUTH_TOKEN

2. **Audit**
   - Examiner system_audit_logs pour accès suspects
   - Vérifier logs Supabase RLS
   - Identifier scope de la fuite

3. **Notification**
   - Informer clients affectés (< 72h)
   - Documenter incident pour conformité
   - Mettre à jour procédures sécurité

## Contacts d'urgence

**Développeur principal :**
- Eric Dufort
- Email : eric.dufort@cerdia.ai  
- Téléphone : +1 (514) 603-4519
- Disponibilité : 24/7 pour incidents critiques

**Services tiers :**
- **Vercel Support** : vercel.com/support
- **Stripe Support** : support.stripe.com
- **Twilio Support** : support.twilio.com
- **Supabase Support** : supabase.com/support

**Escalation :**
- Incident critique : Appeler +1 (514) 603-4519
- Incident majeur : Email eric.dufort@cerdia.ai
- Incident mineur : GitHub Issues

---
_Document mis à jour : 2025-01-22_  
_Prochaine révision : 2025-02-22_