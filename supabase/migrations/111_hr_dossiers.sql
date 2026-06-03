-- 111 — Module RH (hub 360) : ce qui MANQUE seulement (le reste est agrégé depuis les modules existants).
-- Documents employé, certifications/formations (avec expiration), checklist onboarding.
CREATE TABLE IF NOT EXISTS hr_documents (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    text NOT NULL,
  personnel_id uuid NOT NULL,
  type         text NOT NULL DEFAULT 'document', -- contrat|cv|certification|attestation|autre
  name         text NOT NULL DEFAULT '',
  url          text,
  expiry_date  date,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hr_documents_pers_idx ON hr_documents (tenant_id, personnel_id);

CREATE TABLE IF NOT EXISTS hr_certifications (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    text NOT NULL,
  personnel_id uuid NOT NULL,
  name         text NOT NULL DEFAULT '',       -- ex. Cadenassage, SIMDUT, Espace clos, Secourisme
  issuer       text,
  issued_date  date,
  expiry_date  date,                            -- alerte si proche/dépassée
  doc_url      text,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hr_certifications_pers_idx ON hr_certifications (tenant_id, personnel_id);
CREATE INDEX IF NOT EXISTS hr_certifications_exp_idx ON hr_certifications (tenant_id, expiry_date);

CREATE TABLE IF NOT EXISTS hr_onboarding (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    text NOT NULL,
  personnel_id uuid NOT NULL,
  phase        text NOT NULL DEFAULT 'onboarding', -- onboarding|offboarding
  item         text NOT NULL DEFAULT '',
  done         boolean NOT NULL DEFAULT false,
  sort_order   int NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hr_onboarding_pers_idx ON hr_onboarding (tenant_id, personnel_id);

ALTER TABLE hr_documents      ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_onboarding     ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS hr_documents_access ON hr_documents;
DROP POLICY IF EXISTS hr_certifications_access ON hr_certifications;
DROP POLICY IF EXISTS hr_onboarding_access ON hr_onboarding;
CREATE POLICY hr_documents_access      ON hr_documents      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY hr_certifications_access ON hr_certifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY hr_onboarding_access     ON hr_onboarding     FOR ALL USING (true) WITH CHECK (true);
