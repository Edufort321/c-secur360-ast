-- 215 — Alertes de maintenance PUBLIQUES (scan QR par un externe). Sur la fiche d'équipement, un toggle
-- active/désactive la réception d'alertes via le QR (off pour les lieux publics). Le tenant configure un
-- NUMÉRO DE SUPPORT affiché sur la page publique. Les alertes reçues s'affichent au tableau de bord.
-- Idempotent + auto-enregistré.

ALTER TABLE equipment ADD COLUMN IF NOT EXISTS public_alerts_enabled BOOLEAN NOT NULL DEFAULT false;

-- Numéro/courriel de support affichés sur la page publique (réutilise company_settings, paramètres tenant).
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS support_phone TEXT;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS support_email TEXT;

CREATE TABLE IF NOT EXISTS maintenance_alerts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      TEXT NOT NULL,
  equipment_id   UUID,
  equipment_name TEXT,
  alert_type     TEXT DEFAULT 'bris',        -- 'bris' | 'maintenance' | 'autre'
  reporter_name  TEXT,
  reporter_phone TEXT,
  description    TEXT NOT NULL DEFAULT '',
  status         TEXT NOT NULL DEFAULT 'new', -- 'new' | 'acknowledged' | 'resolved'
  internal_note  TEXT,
  resolved_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS maintenance_alerts_tenant_idx ON maintenance_alerts (tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS maintenance_alerts_equip_idx  ON maintenance_alerts (equipment_id);

ALTER TABLE maintenance_alerts ENABLE ROW LEVEL SECURITY;
-- Lecture/maj par le tenant (RLS permissive, isolation applicative) ; l'INSERTION publique passe par la
-- route service_role /api/maintenance/alert (qui vérifie que l'équipement autorise les alertes).
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'maintenance_alerts' AND policyname = 'maintenance_alerts_all') THEN
    CREATE POLICY maintenance_alerts_all ON maintenance_alerts FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

insert into schema_migrations (version) values ('215') on conflict (version) do nothing;
