-- 183: Verrouillage de PÉRIODE comptable (anti back-dating). Une écriture ne peut PAS être créée
-- ni datée dans une période FERMÉE (gl_periods.status='closed'). Contrôle au niveau BASE (trigger) —
-- impossible à contourner depuis l'app. Conforme aux meilleures pratiques (verrouiller les périodes
-- fermées/rapprochées). Idempotent.

CREATE OR REPLACE FUNCTION gl_block_closed_period() RETURNS trigger AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM gl_periods p
    WHERE p.tenant_id = NEW.tenant_id
      AND p.status = 'closed'
      AND NEW.entry_date BETWEEN p.start_date AND p.end_date
  ) THEN
    RAISE EXCEPTION 'Période comptable fermée : aucune écriture ne peut être comptabilisée au % (anti back-dating). Rouvrez la période pour corriger.', NEW.entry_date
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_gl_block_closed_period ON gl_entries;
CREATE TRIGGER trg_gl_block_closed_period
  BEFORE INSERT OR UPDATE OF entry_date, tenant_id ON gl_entries
  FOR EACH ROW EXECUTE FUNCTION gl_block_closed_period();

insert into schema_migrations (version) values ('183') on conflict (version) do nothing;
