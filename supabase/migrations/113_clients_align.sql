-- 113 — Alignement table `clients` : la migration 010 (core_projects_hub) cree `clients` avec
-- address JSONB + is_active et SANS les colonnes plates utilisees par l'admin (contact_*, phone,
-- email, city, province, postal_code, active). Comme 010 < 028, le CREATE de 028 est un no-op et
-- l'enregistrement client echoue silencieusement. On ajoute les colonnes manquantes (idempotent)
-- et on convertit address en TEXT si elle est JSONB.

ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_name  TEXT NOT NULL DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_email TEXT NOT NULL DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_phone TEXT NOT NULL DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS phone         TEXT NOT NULL DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS email         TEXT NOT NULL DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS city          TEXT NOT NULL DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS province      TEXT NOT NULL DEFAULT 'QC';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS postal_code   TEXT NOT NULL DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS notes         TEXT NOT NULL DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS active        BOOLEAN NOT NULL DEFAULT true;

-- address : si JSONB (schema 010), convertir en TEXT (le code envoie une chaine).
DO $$
DECLARE t TEXT;
BEGIN
  SELECT data_type INTO t FROM information_schema.columns
   WHERE table_name = 'clients' AND column_name = 'address';
  IF t = 'jsonb' THEN
    ALTER TABLE clients ALTER COLUMN address DROP DEFAULT;
    ALTER TABLE clients ALTER COLUMN address TYPE TEXT USING COALESCE(address::text, '');
    ALTER TABLE clients ALTER COLUMN address SET DEFAULT '';
  ELSIF t IS NULL THEN
    ALTER TABLE clients ADD COLUMN address TEXT NOT NULL DEFAULT '';
  END IF;
END $$;

-- Si is_active existe (schema 010) mais pas synchronise avec active : aligner.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='is_active') THEN
    UPDATE clients SET active = is_active WHERE active IS DISTINCT FROM is_active;
  END IF;
END $$;

-- RLS : autoriser explicitement l'ecriture (USING + WITH CHECK).
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS clients_access ON clients;
CREATE POLICY clients_access ON clients FOR ALL USING (true) WITH CHECK (true);
