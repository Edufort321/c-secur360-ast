-- ===============================================
-- MIGRATION 045 - Policy DELETE pour ast_permits
-- ===============================================
-- Le dashboard AST du tenant permet la suppression multiple d'AST. L'app utilise
-- la clé anon ; 044 n'avait ajouté que SELECT/INSERT/UPDATE. Sans policy DELETE,
-- la suppression est refusée par RLS. On ajoute une policy DELETE.
--
-- NOTE sécurité : comme le reste de l'app (clé anon + filtrage applicatif par
-- tenant), cette policy est permissive. Le dashboard est protégé par le
-- middleware (login requis). À durcir si une vraie auth Supabase est mise en place.
-- Idempotent.
-- ===============================================

DROP POLICY IF EXISTS "ast_permits_anon_delete" ON ast_permits;
CREATE POLICY "ast_permits_anon_delete" ON ast_permits
  FOR DELETE USING (true);
