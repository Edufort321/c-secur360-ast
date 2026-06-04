-- 119 — DGA : champs additionnels du dossier (ordre/groupes identiques au prototype).
ALTER TABLE dga_dossiers ADD COLUMN IF NOT EXISTS preservation  TEXT;
ALTER TABLE dga_dossiers ADD COLUMN IF NOT EXISTS paper_at      TEXT;
ALTER TABLE dga_dossiers ADD COLUMN IF NOT EXISTS category      TEXT;
ALTER TABLE dga_dossiers ADD COLUMN IF NOT EXISTS cooling       TEXT;
ALTER TABLE dga_dossiers ADD COLUMN IF NOT EXISTS sample_point  TEXT;
ALTER TABLE dga_dossiers ADD COLUMN IF NOT EXISTS reason        TEXT;
ALTER TABLE dga_dossiers ADD COLUMN IF NOT EXISTS authorized_by TEXT;
ALTER TABLE dga_dossiers ADD COLUMN IF NOT EXISTS analyzed_by   TEXT;
