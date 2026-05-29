-- 🧹 NETTOYAGE COMPLET du tenant 'cerdia' : sous-classes, postes, employés, comptes
-- ⚠️ DESTRUCTIF — Vérifiez le tenant_id avant d'exécuter !
-- Préserve : Eric Dufort (eric.dufort@cerdia.ai) et toutes les autres données du tenant

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. ÉVALUATIONS & HISTORIQUE (dépendent de personnel)
-- ──────────────────────────────────────────────────────────────────────────────
DELETE FROM employee_evaluations WHERE tenant_id = 'cerdia';
DELETE FROM employee_profiles    WHERE tenant_id = 'cerdia';
DELETE FROM project_commissions  WHERE tenant_id = 'cerdia';

-- ──────────────────────────────────────────────────────────────────────────────
-- 2. PALIERS & GRILLES SALARIALES (dépendent des postes)
-- ──────────────────────────────────────────────────────────────────────────────
DELETE FROM poste_salary_tiers WHERE tenant_id = 'cerdia';
DELETE FROM poste_salary_grids WHERE tenant_id = 'cerdia';

-- ──────────────────────────────────────────────────────────────────────────────
-- 3. CATALOGUE DE COMPÉTENCES & SOUS-CLASSES
-- ──────────────────────────────────────────────────────────────────────────────
DELETE FROM poste_skills_catalog      WHERE tenant_id = 'cerdia';
DELETE FROM poste_subclasses_catalog  WHERE tenant_id = 'cerdia';

-- ──────────────────────────────────────────────────────────────────────────────
-- 4. POSTES
-- ──────────────────────────────────────────────────────────────────────────────
DELETE FROM planner_postes WHERE tenant_id = 'cerdia';

-- ──────────────────────────────────────────────────────────────────────────────
-- 5. PERSONNEL (employés)
-- ──────────────────────────────────────────────────────────────────────────────
DELETE FROM planner_personnel WHERE tenant_id = 'cerdia';

-- ──────────────────────────────────────────────────────────────────────────────
-- 6. COMPTES D'ACCÈS — préserver Eric Dufort (super_admin) et toi-même
-- ──────────────────────────────────────────────────────────────────────────────
DELETE FROM users
WHERE (tenant_id = 'cerdia' OR "tenantId" = 'cerdia')
  AND lower(email) NOT IN (
    'eric.dufort@cerdia.ai',
    'eric.dufort@cerdia.ca',
    'admin@cerdia.ca'
  )
  AND role != 'super_admin';

-- ──────────────────────────────────────────────────────────────────────────────
-- 7. VÉRIFICATION
-- ──────────────────────────────────────────────────────────────────────────────
SELECT 'planner_personnel' AS table_name, COUNT(*) AS remaining FROM planner_personnel WHERE tenant_id = 'cerdia'
UNION ALL SELECT 'planner_postes',           COUNT(*) FROM planner_postes             WHERE tenant_id = 'cerdia'
UNION ALL SELECT 'poste_subclasses_catalog', COUNT(*) FROM poste_subclasses_catalog   WHERE tenant_id = 'cerdia'
UNION ALL SELECT 'poste_salary_grids',       COUNT(*) FROM poste_salary_grids         WHERE tenant_id = 'cerdia'
UNION ALL SELECT 'poste_salary_tiers',       COUNT(*) FROM poste_salary_tiers         WHERE tenant_id = 'cerdia'
UNION ALL SELECT 'poste_skills_catalog',     COUNT(*) FROM poste_skills_catalog       WHERE tenant_id = 'cerdia'
UNION ALL SELECT 'employee_profiles',        COUNT(*) FROM employee_profiles          WHERE tenant_id = 'cerdia'
UNION ALL SELECT 'employee_evaluations',     COUNT(*) FROM employee_evaluations       WHERE tenant_id = 'cerdia'
UNION ALL SELECT 'project_commissions',      COUNT(*) FROM project_commissions        WHERE tenant_id = 'cerdia'
UNION ALL SELECT 'users (cerdia)',           COUNT(*) FROM users WHERE tenant_id = 'cerdia' OR "tenantId" = 'cerdia';
