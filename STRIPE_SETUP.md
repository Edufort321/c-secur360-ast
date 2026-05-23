# 🚀 Configuration Stripe pour C-Secur360

Guide complet pour configurer le système de facturation automatisé avec Stripe.

## 📋 Vue d'ensemble

L'intégration Stripe pour C-Secur360 permet :
- **Abonnements automatisés** (mensuel/annuel)
- **Gestion multi-sites** avec facturation par site additionnel
- **Conformité fiscale canadienne** (TPS/TVQ automatique)
- **Prélèvements bancaires PAD/ACSS** pour entreprises
- **Interface admin complète** pour gestion clients/abonnements

## 💰 Structure de Pricing

### Plans Disponibles
- **Plan Mensuel** : 250$ CAD/mois
- **Plan Annuel** : 3000$ CAD/année (économie de 1000$/an)
- **Sites additionnels** : 500$ CAD/année par site

### Taxes Automatiques
- **Québec** : TPS 5% + TVQ 9.975% = **14.975%**
- **Ontario** : HST 13%
- **Autres provinces** : Calcul automatique selon Stripe Tax

## 🔧 Configuration étape par étape

### 1. Configuration Stripe Dashboard

#### A. Créer le compte Stripe
```bash
# 1. Aller sur https://dashboard.stripe.com
# 2. Créer compte avec email CERDIA : eric.dufort@cerdia.ai
# 3. Activer mode Test au départ
```

#### B. Créer les produits et prix
```javascript
// Dans Stripe Dashboard > Products, créer :

// Produit 1: Plan Mensuel C-Secur360
{
  name: "C-Secur360 Plan Mensuel",
  description: "Plateforme AST - Facturation mensuelle",
  price: 25000, // 250$ CAD en centimes
  currency: "cad",
  interval: "month"
}

// Produit 2: Plan Annuel C-Secur360  
{
  name: "C-Secur360 Plan Annuel",
  description: "Plateforme AST - Facturation annuelle",
  price: 300000, // 3000$ CAD en centimes
  currency: "cad", 
  interval: "year"
}

// Produit 3: Site Additionnel
{
  name: "Site Additionnel C-Secur360",
  description: "Site supplémentaire - Facturation annuelle",
  price: 50000, // 500$ CAD en centimes
  currency: "cad",
  interval: "year"
}
```

#### C. Configurer Stripe Tax
```bash
# 1. Aller dans Settings > Tax
# 2. Activer "Stripe Tax"
# 3. Configurer adresse entreprise CERDIA au Québec
# 4. Ajouter numéro TPS/TVQ si disponible
```

#### D. Configurer Webhooks
```bash
# URL Webhook: https://votre-domaine.com/api/webhooks/stripe
# Événements à écouter :
# - checkout.session.completed
# - invoice.paid
# - invoice.payment_failed  
# - customer.subscription.created
# - customer.subscription.updated
# - customer.subscription.deleted
# - mandate.updated (pour PAD/ACSS)
```

### 2. Configuration Supabase

#### A. Exécuter les migrations SQL
```sql
-- Exécuter le fichier supabase/migrations/001_billing_tables.sql
-- dans Supabase Dashboard > SQL Editor
```

#### B. Configurer Row Level Security (RLS)
```sql
-- Les politiques RLS sont incluses dans la migration
-- Vérifier que RLS est activé sur toutes les tables
```

### 3. Variables d'environnement

#### A. Copier .env.example vers .env.local
```bash
cp .env.example .env.local
```

#### B. Remplir les valeurs Stripe
```bash
# === STRIPE CONFIGURATION ===
STRIPE_SECRET_KEY=sk_test_... # Récupérer depuis Stripe Dashboard
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... 
STRIPE_WEBHOOK_SECRET=whsec_... # Généré lors création webhook

# === PRODUITS STRIPE ===
STRIPE_MONTHLY_PRICE_ID=price_... # ID du prix mensuel
STRIPE_ANNUAL_PRICE_ID=price_... # ID du prix annuel
STRIPE_ADDITIONAL_SITE_PRICE_ID=price_... # ID site additionnel

# === SUPABASE ===
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ... # Clé service role

# === APPLICATION ===
NEXT_PUBLIC_APP_URL=https://c-secur360.ca
```

### 4. Installation des dépendances

```bash
npm install stripe@16.12.0
# (Déjà ajouté dans package.json)
```

## 🚀 Utilisation

### Interface Admin

#### Accéder à l'administration facturation
```bash
# URL: https://votre-domaine.com/admin/billing
# Login: eric.dufort@cerdia.ai
# Password: CGestion321$
```

#### Fonctionnalités disponibles
- ✅ **Vue d'ensemble** : Statistiques MRR, clients actifs, etc.
- ✅ **Gestion clients** : Créer, voir, gérer abonnements
- ✅ **Abonnements** : Statuts, renouvellements, modifications
- ✅ **Factures** : Historique, paiements, relances
- ✅ **Portail client** : Lien vers interface Stripe cliente

### Composant Checkout

#### Intégrer le composant de checkout
```tsx
import StripeCheckout from '@/components/billing/StripeCheckout';

// Utilisation
<StripeCheckout
  customerEmail="client@entreprise.ca"
  companyName="Entreprise ABC"
  onSuccess={(sessionId) => console.log('Succès:', sessionId)}
  onError={(error) => console.error('Erreur:', error)}
/>
```

#### Flux utilisateur
1. **Sélection plan** : Mensuel vs Annuel
2. **Sites additionnels** : Nombre de sites supplémentaires
3. **Méthode paiement** : Carte bancaire ou PAD/ACSS
4. **Checkout Stripe** : Interface sécurisée hébergée
5. **Retour application** : Confirmation et activation

## 🔄 Webhooks et Automatisation

### Événements gérés automatiquement

#### Checkout complété
```javascript
// checkout.session.completed
// → Créer abonnement Supabase
// → Activer accès client
// → Envoyer email confirmation
```

#### Paiement réussi
```javascript
// invoice.paid
// → Marquer facture payée
// → Prolonger période abonnement
// → Maintenir accès actif
```

#### Échec de paiement
```javascript
// invoice.payment_failed
// → Déclencher relances automatiques
// → Suspendre accès après 3 échecs
// → Notifier équipe CERDIA
```

### Gestion des relances automatiques

#### Configuration Stripe
```javascript
// Dans Stripe Dashboard > Settings > Billing
// Smart Retries activé :
// - Tentative 1 : Immédiate
// - Tentative 2 : +3 jours  
// - Tentative 3 : +5 jours
// - Tentative 4 : +7 jours
// Puis annulation ou suspension
```

## 📊 Monitoring et Rapports

### Métriques disponibles

#### Dashboard admin
- **MRR (Monthly Recurring Revenue)** : Revenus récurrents mensuels
- **Taux de conversion** : Essais → Abonnements payants
- **Taux d'attrition (Churn)** : Annulations mensuelles
- **LTV (Lifetime Value)** : Valeur vie client moyenne
- **CAC (Customer Acquisition Cost)** : Coût acquisition client

#### Rapports Stripe
- **Revenue Recognition** : Comptabilité revenus différés
- **Tax Reports** : Rapports fiscaux pour Revenu Québec
- **Dunning Reports** : Suivi échecs paiements

## 🛡️ Sécurité et Conformité

### Mesures de sécurité
- ✅ **Clés API sécurisées** : Variables d'environnement uniquement
- ✅ **Webhooks signés** : Vérification signatures Stripe
- ✅ **RLS Supabase** : Isolation données par client
- ✅ **HTTPS obligatoire** : Toutes communications chiffrées
- ✅ **PCI Compliance** : Stripe gère conformité cartes

### Conformité fiscale canadienne
- ✅ **TPS/TVQ automatique** : Calcul selon province client
- ✅ **Factures conformes** : Format requis Revenu Québec
- ✅ **Rapports fiscaux** : Export pour comptabilité
- ✅ **Numéros d'entreprise** : Stockage TPS/TVQ clients

## 🚨 Résolution de problèmes

### Erreurs communes

#### Webhook non reçu
```bash
# Vérifier signature webhook
# Logs : Stripe Dashboard > Webhooks > Endpoints
# Test local : stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

#### Taxe incorrecte
```bash
# Vérifier adresse client dans Stripe
# Confirm configuration Stripe Tax
# Vérifier province client dans Supabase
```

#### Abonnement non activé
```bash
# Vérifier webhook checkout.session.completed reçu
# Vérifier customer_id dans metadata session
# Logs : Supabase Dashboard > Logs
```

### Support et maintenance

#### Logs à surveiller
- **Stripe Dashboard** : Paiements, webhooks, disputes
- **Supabase Logs** : Erreurs base de données, RLS
- **Vercel Logs** : Erreurs API routes, webhooks

#### Alertes recommandées
- **Échecs paiement répétés** : Plus de 5 par jour
- **Webhooks échoués** : Plus de 10% d'échec
- **MRR en baisse** : Diminution >5% mensuelle

## 📞 Contact Support

**Équipe CERDIA**
- Email : eric.dufort@cerdia.ai
- Téléphone : 514-603-4519

**Support Stripe**
- Documentation : https://stripe.com/docs
- Support : Dashboard Stripe > Support

---

## ✅ Checklist de mise en production

### Avant activation live
- [ ] **Tests complets** : Tous les flux en mode test
- [ ] **Stripe Tax configuré** : Numéros fiscaux entreprise
- [ ] **Webhooks testés** : Tous événements fonctionnels
- [ ] **RLS Supabase** : Accès données sécurisé
- [ ] **Variables prod** : Clés live configurées
- [ ] **Monitoring** : Alertes configurées
- [ ] **Backup** : Procédures sauvegarde
- [ ] **Documentation** : Équipe formée utilisation

### Activation production
- [ ] **Stripe Live** : Passage mode live
- [ ] **DNS configuré** : Webhooks pointent bon domaine  
- [ ] **SSL certificat** : HTTPS fonctionnel
- [ ] **Tests paiement** : Vrais paiements petit montant
- [ ] **Monitoring actif** : Surveillance 24/7
- [ ] **Support client** : Procédures assistance

---

*Guide créé par Claude Code pour CERDIA - C-Secur360*
*Dernière mise à jour : 21 août 2024*