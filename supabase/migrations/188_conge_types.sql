-- 188: TYPES DE CONGÉ configurables par tenant (gérés dans Admin/RH). Chaque type peut exiger une
-- JUSTIFICATION (ex. billet du médecin pour maladie prolongée au-delà de N jours) et désigner le POSTE
-- qui doit APPROUVER. Si la table est vide, l'app retombe sur les types par défaut (lib/conges).
-- Idempotent.

CREATE TABLE IF NOT EXISTS conge_types (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                text NOT NULL,
  value                    text NOT NULL,                 -- clé (conge, maladie, parental, …)
  label_fr                 text NOT NULL,
  label_en                 text,
  emoji                    text,
  requires_justification   boolean NOT NULL DEFAULT false, -- pièce justificative obligatoire
  justification_label      text,                          -- ex. « Billet du médecin »
  justification_after_days int NOT NULL DEFAULT 0,        -- justification requise seulement au-delà de N jours (0 = toujours)
  approval_poste_id        uuid,                          -- poste qui approuve (planner_postes)
  active                   boolean NOT NULL DEFAULT true,
  sort_order               int NOT NULL DEFAULT 0,
  created_at               timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, value)
);
CREATE INDEX IF NOT EXISTS conge_types_tenant_idx ON conge_types(tenant_id);

ALTER TABLE conge_types ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conge_types' AND policyname = 'conge_types_all') THEN
    CREATE POLICY conge_types_all ON conge_types FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

insert into schema_migrations (version) values ('188') on conflict (version) do nothing;
