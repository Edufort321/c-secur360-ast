-- =====================================================
-- EXTRACTION COMPLÈTE STRUCTURE SUPABASE C-SECUR360
-- À exécuter dans Supabase SQL Editor
-- =====================================================

-- 1. LISTER TOUTES LES TABLES AVEC DÉTAILS
SELECT 
    'TABLE: ' || t.table_name || ' (' || 
    CASE 
        WHEN t.table_type = 'BASE TABLE' THEN 'Table'
        ELSE t.table_type 
    END || ')' as table_info,
    t.table_name,
    t.table_type,
    COALESCE(tc.constraint_type, 'No constraints') as constraints
FROM information_schema.tables t
LEFT JOIN information_schema.table_constraints tc ON t.table_name = tc.table_name
WHERE t.table_schema = 'public'
ORDER BY t.table_name;

-- 2. STRUCTURE COMPLÈTE DE CHAQUE TABLE
SELECT 
    t.table_name,
    array_agg(
        c.column_name || ' ' || 
        UPPER(c.data_type) || 
        CASE 
            WHEN c.character_maximum_length IS NOT NULL 
            THEN '(' || c.character_maximum_length || ')'
            WHEN c.numeric_precision IS NOT NULL 
            THEN '(' || c.numeric_precision || ',' || c.numeric_scale || ')'
            ELSE ''
        END ||
        CASE 
            WHEN c.is_nullable = 'NO' THEN ' NOT NULL' 
            ELSE ' NULLABLE' 
        END ||
        CASE 
            WHEN c.column_default IS NOT NULL 
            THEN ' DEFAULT ' || c.column_default
            ELSE ''
        END
        ORDER BY c.ordinal_position
    ) as column_definitions,
    COUNT(c.column_name) as column_count
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' AND c.table_schema = 'public'
GROUP BY t.table_name
ORDER BY t.table_name;

-- 3. INDEX ET CONTRAINTES
SELECT 
    t.table_name,
    array_agg(DISTINCT tc.constraint_type) as constraint_types,
    array_agg(DISTINCT kcu.column_name) as key_columns
FROM information_schema.tables t
LEFT JOIN information_schema.table_constraints tc ON t.table_name = tc.table_name
LEFT JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
WHERE t.table_schema = 'public'
GROUP BY t.table_name
ORDER BY t.table_name;

-- 4. POLITIQUES RLS (Row Level Security)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. FONCTIONS ET TRIGGERS
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_catalog.pg_get_function_result(p.oid) as return_type,
    pg_catalog.pg_get_function_arguments(p.oid) as arguments
FROM pg_catalog.pg_proc p
LEFT JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
ORDER BY function_name;

-- 6. STATISTIQUES PAR TABLE (avec comptage)
SELECT 
    t.table_name,
    CASE 
        WHEN t.table_name = 'users' THEN (SELECT COUNT(*) FROM users)
        WHEN t.table_name = 'profiles' THEN (SELECT COUNT(*) FROM profiles)
        WHEN t.table_name = 'tenants' THEN (SELECT COUNT(*) FROM tenants)
        WHEN t.table_name = 'customers' THEN (SELECT COUNT(*) FROM customers)
        WHEN t.table_name = 'ast_forms' THEN (SELECT COUNT(*) FROM ast_forms)
        WHEN t.table_name = 'audit_logs' THEN (SELECT COUNT(*) FROM audit_logs)
        WHEN t.table_name = 'entitlements' THEN (SELECT COUNT(*) FROM entitlements)
        WHEN t.table_name = 'price_config' THEN (SELECT COUNT(*) FROM price_config)
        WHEN t.table_name = 'invoices' THEN (SELECT COUNT(*) FROM invoices)
        WHEN t.table_name = 'timesheets' THEN (SELECT COUNT(*) FROM timesheets)
        WHEN t.table_name = 'confined_space_permits' THEN (SELECT COUNT(*) FROM confined_space_permits)
        WHEN t.table_name = 'price_adjustments' THEN (SELECT COUNT(*) FROM price_adjustments)
        -- Ajouter d'autres tables si elles existent
        ELSE -1
    END as row_count
FROM information_schema.tables t
WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
ORDER BY row_count DESC, t.table_name;

-- 7. RELATIONS ENTRE TABLES (Foreign Keys)
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- 8. RÉSUMÉ GLOBAL
SELECT 
    'RÉSUMÉ STRUCTURE C-SECUR360' as title,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public') as total_columns,
    (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = 'public') as total_constraints,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_rls_policies;

-- =====================================================
-- FIN EXTRACTION - RÉSULTATS À COPIER/SAUVEGARDER
-- =====================================================