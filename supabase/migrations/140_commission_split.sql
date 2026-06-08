-- 140 — Partage de commission entre PLUSIEURS vendeurs (2-3) sur une soumission/un projet.
-- sellers_split = [{ "seller_id": "<planner_personnel.id>", "pct": 60 }, ...] (somme idéalement 100).
-- Chaque vendeur touche sa commission sur SA PART du projet, à SON % de grille (voir lib/commission.ts).
ALTER TABLE soumissions ADD COLUMN IF NOT EXISTS sellers_split JSONB;
ALTER TABLE projects    ADD COLUMN IF NOT EXISTS sellers_split JSONB;
