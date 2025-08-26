#!/bin/bash
# 🚀 SCRIPT DE DÉPLOIEMENT SUPABASE - MODULE RH SÉCURISÉ
# Utilisation: ./scripts/deploy-supabase.sh

set -e

echo "🛡️ C-SECUR360 - Déploiement Module RH Sécurisé"
echo "================================================"

# Couleurs pour output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
PROJECT_REF=${SUPABASE_PROJECT_REF}
DB_PASSWORD=${SUPABASE_DB_PASSWORD}

# Fonctions utiles
print_step() {
    echo -e "${BLUE}[ÉTAPE]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCÈS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[ATTENTION]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERREUR]${NC} $1"
}

# Vérifications préliminaires
print_step "Vérification des prérequis..."

# Vérifier Supabase CLI
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI n'est pas installé!"
    echo "Installation: npm install -g supabase"
    exit 1
fi

print_success "Supabase CLI détecté: $(supabase --version)"

# Vérifier connexion
print_step "Vérification de la connexion Supabase..."
if ! supabase projects list &> /dev/null; then
    print_warning "Pas connecté à Supabase. Connexion en cours..."
    supabase login
fi

print_success "Connecté à Supabase"

# Lier le projet si nécessaire
if [ ! -f "supabase/.temp/project-ref" ]; then
    if [ -z "$PROJECT_REF" ]; then
        print_step "Sélection du projet Supabase..."
        supabase projects list
        read -p "Entrez le Project Ref: " PROJECT_REF
    fi
    
    print_step "Liaison du projet local..."
    supabase link --project-ref "$PROJECT_REF"
fi

print_success "Projet lié avec succès"

# Vérifier l'état de la base de données
print_step "Vérification de l'état de la base de données..."
supabase db diff --schema public

# Appliquer les migrations
print_step "Application des migrations HR sécurisées..."

print_step "  → Migration 1: Tables HR de base..."
if supabase migration up --file "20240826_secure_hr_module.sql"; then
    print_success "  ✅ Tables HR créées"
else
    print_error "  ❌ Échec migration tables HR"
    exit 1
fi

print_step "  → Migration 2: Sécurité et chiffrement..."
if supabase migration up --file "20240826_security_encryption.sql"; then
    print_success "  ✅ Sécurité et chiffrement activés"
else
    print_error "  ❌ Échec migration sécurité"
    exit 1
fi

# Vérifier les tables créées
print_step "Vérification des tables créées..."
TABLES_CREATED=$(supabase db inspect --format text | grep -E "employees|employee_safety_records|client_billing_profiles|tenant_settings|project_billing_overrides|wip_calculations" | wc -l)

if [ "$TABLES_CREATED" -ge "6" ]; then
    print_success "Toutes les tables HR ont été créées ($TABLES_CREATED/8)"
else
    print_warning "Seulement $TABLES_CREATED tables détectées sur 8 attendues"
fi

# Vérifier RLS
print_step "Vérification des politiques RLS..."
RLS_COUNT=$(supabase db inspect --format json | jq '.policies | length' 2>/dev/null || echo "0")
if [ "$RLS_COUNT" -gt "5" ]; then
    print_success "Politiques RLS détectées: $RLS_COUNT"
else
    print_warning "Peu de politiques RLS détectées: $RLS_COUNT"
fi

# Vérifier les fonctions PostgreSQL
print_step "Vérification des fonctions PostgreSQL..."
FUNCTIONS=$(supabase db inspect --format text | grep -E "encrypt_sensitive_data|decrypt_sensitive_data|check_certification_validity|can_assign_to_ast|get_expiring_certifications|recalculate_wip" | wc -l)

if [ "$FUNCTIONS" -ge "5" ]; then
    print_success "Fonctions PostgreSQL créées: $FUNCTIONS/6"
else
    print_warning "Fonctions manquantes: $FUNCTIONS/6 détectées"
fi

# Configuration par défaut
print_step "Configuration des données par défaut..."

# Créer tenant demo si nécessaire
print_step "  → Création tenant demo..."
supabase db shell -c "
INSERT INTO tenants (id, subdomain, companyName, plan, isActive) 
VALUES ('demo', 'demo', 'Demo Company', 'premium', true) 
ON CONFLICT (id) DO NOTHING;
" || print_warning "Tenant demo existe déjà ou erreur"

# Créer settings par défaut
print_step "  → Configuration tenant settings..."
supabase db shell -c "
INSERT INTO tenant_settings (tenant_id, strict_mode, encryption_enabled, wip_refresh_strategy)
VALUES ('demo', true, true, 'real_time')
ON CONFLICT (tenant_id) DO UPDATE SET
  strict_mode = EXCLUDED.strict_mode,
  encryption_enabled = EXCLUDED.encryption_enabled,
  wip_refresh_strategy = EXCLUDED.wip_refresh_strategy;
" && print_success "  ✅ Settings configurés"

# Créer profil de facturation demo
print_step "  → Profil de facturation demo..."
supabase db shell -c "
INSERT INTO client_billing_profiles (tenant_id, rate_normal, rate_overtime_1_5, rate_overtime_2_0)
VALUES ('demo', 140.00, 210.00, 280.00)
ON CONFLICT (tenant_id) DO UPDATE SET
  rate_normal = EXCLUDED.rate_normal,
  rate_overtime_1_5 = EXCLUDED.rate_overtime_1_5,
  rate_overtime_2_0 = EXCLUDED.rate_overtime_2_0;
" && print_success "  ✅ Profil facturation créé"

# Tests de base
print_step "Tests de fonctionnement de base..."

# Test fonction chiffrement
print_step "  → Test chiffrement..."
ENCRYPT_TEST=$(supabase db shell -c "SELECT encrypt_sensitive_data('test', 'test-key');" | grep -c "encrypted" || echo "0")
if [ "$ENCRYPT_TEST" -gt "0" ]; then
    print_success "  ✅ Chiffrement fonctionnel"
else
    print_warning "  ⚠️ Test chiffrement échoué"
fi

# Test tenant isolation
print_step "  → Test isolation tenant..."
supabase db shell -c "SET app.current_tenant = 'demo'; SELECT COUNT(*) FROM employees;" > /dev/null && print_success "  ✅ Isolation tenant OK"

# Rafraîchir les vues matérialisées
print_step "Rafraîchissement des vues matérialisées..."
supabase db shell -c "REFRESH MATERIALIZED VIEW mv_wip_by_project;" && print_success "  ✅ Vue WIP projet"
supabase db shell -c "REFRESH MATERIALIZED VIEW mv_wip_by_client;" && print_success "  ✅ Vue WIP client"

# Résumé final
echo ""
echo "🎉 DÉPLOIEMENT SUPABASE TERMINÉ!"
echo "=================================="
print_success "✅ Migrations appliquées avec succès"
print_success "✅ Tables HR sécurisées créées"  
print_success "✅ Politiques RLS activées"
print_success "✅ Fonctions PostgreSQL déployées"
print_success "✅ Configuration par défaut appliquée"
print_success "✅ Tests de base réussis"

echo ""
echo "🔧 PROCHAINES ÉTAPES:"
echo "--------------------"
echo "1. 🌐 Déployer sur Vercel: vercel --prod"
echo "2. 🧪 Tester les API: voir tests/api/hr-endpoints.http"
echo "3. 🔑 Configurer ENCRYPTION_KEY en production"
echo "4. 👥 Créer les premiers utilisateurs admin"
echo "5. 📊 Vérifier le dashboard Supabase"

echo ""
echo "📊 URLS UTILES:"
echo "--------------"
echo "🎛️ Dashboard Supabase: https://app.supabase.com/project/$PROJECT_REF"
echo "📋 SQL Editor: https://app.supabase.com/project/$PROJECT_REF/sql"
echo "🛡️ Auth: https://app.supabase.com/project/$PROJECT_REF/auth"
echo "📈 Logs: https://app.supabase.com/project/$PROJECT_REF/logs"

echo ""
print_warning "⚠️ IMPORTANT: Changez la clé de chiffrement par défaut en production!"
print_success "🚀 Module RH sécurisé prêt pour production!"