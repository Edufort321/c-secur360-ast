-- 070: Sous-classes (spécialisations) par poste + assignation employé
-- Exécuter dans le SQL Editor de Supabase Dashboard

-- ─── Sous-classes sur planner_postes (array JSONB) ──────────────────────────
-- Format : [{ "name": "Électrique", "code": "EL", "color": "#3b82f6" }, ...]
ALTER TABLE planner_postes ADD COLUMN IF NOT EXISTS subclasses JSONB NOT NULL DEFAULT '[]'::jsonb;

-- ─── Sous-classe choisie par employé ─────────────────────────────────────────
ALTER TABLE planner_personnel ADD COLUMN IF NOT EXISTS subclass TEXT;

-- Index pour filtrage rapide planner par sous-classe
CREATE INDEX IF NOT EXISTS pp_subclass_idx ON planner_personnel (tenant_id, subclass) WHERE subclass IS NOT NULL;
