-- 078: Limite de sites par tenant (abonnement)
-- Exécuter dans le SQL Editor de Supabase Dashboard
--
-- Le super-admin (admin public) configure le nombre de sites inclus dans
-- l'abonnement du client. Quand le tenant atteint cette limite, la création
-- de sites supplémentaires est bloquée avec invitation à réviser l'abonnement.

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS max_sites INTEGER DEFAULT 1;
