-- 075: Formulaire d'évaluation des compétences (types pondérés) + seuils de palier
-- Exécuter dans le SQL Editor de Supabase Dashboard
--
-- Remplace l'ancien système « compétences requises par palier » par un
-- formulaire structuré défini sur la grille du poste :
--   - types de compétences (catégories) avec pondération globale et mode de notation
--   - liste de compétences dans chaque type
--   - chaque palier porte une note minimale (seuil) à atteindre
--   - l'employé est noté → note globale pondérée → palier automatique
--
-- skill_form (sur la grille) :
--   { "types": [
--       { "id":"t1", "name":"Technique", "weight":50, "mode":"note", "max":5,
--         "skills":[ {"id":"s1","name":"Soudure"}, {"id":"s2","name":"Électricité"} ] },
--       { "id":"t2", "name":"Sécurité", "weight":30, "mode":"pct", "skills":[ ... ] }
--   ] }
--
-- skill_scores (sur l'employé) : { "s1": 4, "s2": 3, ... }  (note par compétence)

ALTER TABLE poste_salary_grids
  ADD COLUMN IF NOT EXISTS skill_form JSONB DEFAULT '{"types":[]}'::jsonb;

ALTER TABLE poste_salary_tiers
  ADD COLUMN IF NOT EXISTS min_score NUMERIC(5,2) DEFAULT 0;

ALTER TABLE planner_personnel
  ADD COLUMN IF NOT EXISTS skill_scores JSONB DEFAULT '{}'::jsonb;
