-- 091: Vendeur de la soumission (createur) -> commission au transfert en projet
-- Le createur de la soumission est le vendeur ; a l'acceptation, projects.primary_seller_id est pose
-- et la commission est calculee via lib/commission.ts (poste avec commission_enabled).
-- Executer dans le SQL Editor de Supabase Dashboard.

ALTER TABLE soumissions ADD COLUMN IF NOT EXISTS seller_id TEXT;  -- planner_personnel.id du vendeur (createur)
