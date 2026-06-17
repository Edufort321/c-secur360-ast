-- 214 — Ajustement de feuille de temps (paie). L'administrateur peut renvoyer une feuille en
-- « ajustement » avec une note : l'utilisateur voit un drapeau ROUGE et peut corriger. Distinct du
-- simple rejet. Traçabilité de l'ajustement. Idempotent + auto-enregistré.
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS adjustment_flag BOOLEAN DEFAULT false; -- true = ajustement demandé (drapeau rouge chez l'utilisateur)
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS adjustment_note TEXT;                  -- consigne de l'admin
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS rejected_by     TEXT;
ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS rejected_at     TIMESTAMPTZ;

insert into schema_migrations (version) values ('214') on conflict (version) do nothing;
