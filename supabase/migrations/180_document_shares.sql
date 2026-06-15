-- 180: Transmission au client pour APPROBATION (soumission / facture / feuille de temps).
-- Lien tokenisé : le client ouvre une page publique (sans login), consulte le document et
-- APPROUVE/SIGNE. Le statut remonte dans l'app. Calqué sur rapport_shares (migration 151).
-- SÉCURITÉ : table FERMÉE à l'anon (REVOKE) — accès uniquement via la route serveur service_role
-- (la résolution publique par token passe par le serveur, jamais par la clé anon du navigateur).

CREATE TABLE IF NOT EXISTS document_shares (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     TEXT NOT NULL,
  token         TEXT UNIQUE NOT NULL,
  doc_type      TEXT NOT NULL,                 -- 'soumission' | 'invoice' | 'timesheet'
  doc_id        TEXT NOT NULL,
  doc_number    TEXT,
  status        TEXT DEFAULT 'pending',        -- 'pending' | 'approved' | 'declined'
  approver_name TEXT,
  approver_email TEXT,
  signature     TEXT,                          -- nom signé (ou data URL d'une signature dessinée)
  note          TEXT,
  decided_at    TIMESTAMPTZ,
  starts_at     TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ,
  revoked       BOOLEAN DEFAULT FALSE,
  created_by    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_document_shares_tenant ON document_shares(tenant_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_doc    ON document_shares(doc_type, doc_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_token  ON document_shares(token);

-- RLS activée SANS politique permissive -> seul le service_role (route serveur) y accède.
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON document_shares FROM anon;

-- Auto-enregistrement dans le journal des migrations (convention depuis 177).
insert into schema_migrations (version) values ('180') on conflict (version) do nothing;
