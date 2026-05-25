-- ===============================================
-- MIGRATION 046 - tenant_ast_options : contrôles par danger + RLS anon
-- ===============================================
-- Permet aux moyens de contrôle "standard" d'un tenant de rester disponibles
-- dans les AST suivantes, associés à un danger précis.
--
-- 1) Ajoute une colonne `hazard` (le danger auquel le contrôle est rattaché).
-- 2) Remplace les policies RLS de 033 (basées sur auth.users) par des policies
--    permissives : l'AST (y compris la page publique /ast/nouveau) utilise la clé
--    anon sans session, donc les policies basées sur auth.uid() bloquaient tout.
-- Idempotent.
-- ===============================================

ALTER TABLE public.tenant_ast_options ADD COLUMN IF NOT EXISTS hazard text;

CREATE INDEX IF NOT EXISTS idx_tenant_ast_options_cat_hazard
  ON public.tenant_ast_options (tenant_id, category, hazard);

-- Remplace les policies restrictives de 033 par des policies permissives (clé anon).
DROP POLICY IF EXISTS "tenant_ast_options_select" ON public.tenant_ast_options;
DROP POLICY IF EXISTS "tenant_ast_options_insert" ON public.tenant_ast_options;
DROP POLICY IF EXISTS "tenant_ast_options_delete" ON public.tenant_ast_options;

DROP POLICY IF EXISTS "tenant_ast_options_anon_select" ON public.tenant_ast_options;
CREATE POLICY "tenant_ast_options_anon_select" ON public.tenant_ast_options
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "tenant_ast_options_anon_insert" ON public.tenant_ast_options;
CREATE POLICY "tenant_ast_options_anon_insert" ON public.tenant_ast_options
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "tenant_ast_options_anon_update" ON public.tenant_ast_options;
CREATE POLICY "tenant_ast_options_anon_update" ON public.tenant_ast_options
  FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "tenant_ast_options_anon_delete" ON public.tenant_ast_options;
CREATE POLICY "tenant_ast_options_anon_delete" ON public.tenant_ast_options
  FOR DELETE USING (true);
