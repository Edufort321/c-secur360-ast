-- ===============================================
-- MIGRATION 044 - CORRIGE RLS ast_permits (et work_permits)
-- ===============================================
-- Problème : 032 a créé des policies basées sur current_setting('app.tenant_id'),
-- jamais défini côté client (l'app utilise la clé anon sans SET app.tenant_id).
-- Résultat : aucune ligne n'était lisible NI insérable ->
--   - l'AST ne se sauvegardait pas dans ast_permits
--   - le QR code (lecture seule, sans login) affichait "AST introuvable"
--
-- On aligne ast_permits sur le modèle d'accès réel de l'app : clé anon + filtrage
-- applicatif par tenant. Le QR exige une lecture publique (read-only, no login).
-- Idempotent / non destructif.
-- ===============================================

-- ─── ast_permits ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "tenant_select" ON ast_permits;
DROP POLICY IF EXISTS "tenant_insert" ON ast_permits;
DROP POLICY IF EXISTS "tenant_update" ON ast_permits;

-- Lecture publique : nécessaire pour l'accès QR en lecture seule sans connexion.
DROP POLICY IF EXISTS "ast_permits_public_read" ON ast_permits;
CREATE POLICY "ast_permits_public_read" ON ast_permits
  FOR SELECT USING (true);

-- Écriture via clé anon (sauvegarde de l'AST depuis l'app).
DROP POLICY IF EXISTS "ast_permits_anon_insert" ON ast_permits;
CREATE POLICY "ast_permits_anon_insert" ON ast_permits
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "ast_permits_anon_update" ON ast_permits;
CREATE POLICY "ast_permits_anon_update" ON ast_permits
  FOR UPDATE USING (true) WITH CHECK (true);

-- ─── work_permits (même défaut RLS — corrigé pour cohérence) ────────────────
DROP POLICY IF EXISTS "tenant_select" ON work_permits;
DROP POLICY IF EXISTS "tenant_insert" ON work_permits;
DROP POLICY IF EXISTS "tenant_update" ON work_permits;

DROP POLICY IF EXISTS "work_permits_public_read" ON work_permits;
CREATE POLICY "work_permits_public_read" ON work_permits
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "work_permits_anon_insert" ON work_permits;
CREATE POLICY "work_permits_anon_insert" ON work_permits
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "work_permits_anon_update" ON work_permits;
CREATE POLICY "work_permits_anon_update" ON work_permits
  FOR UPDATE USING (true) WITH CHECK (true);
