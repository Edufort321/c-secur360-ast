-- 151 — Partage d'un rapport terrain à un VÉRIFICATEUR externe via un lien tokenisé (lecture ou
-- révision). Surface PUBLIQUE : accès UNIQUEMENT par token, validé côté serveur (service role) ;
-- les tables restent fermées à l'anon. Le token ne donne accès qu'au rapport ciblé (jamais au tenant).
CREATE TABLE IF NOT EXISTS rapport_shares (
  token       text PRIMARY KEY,            -- jeton aléatoire (URL)
  report_id   text NOT NULL,               -- rapports.id ciblé
  tenant_id   text NOT NULL,               -- tenant propriétaire (jamais exposé au public)
  mode        text NOT NULL DEFAULT 'view' CHECK (mode IN ('view','review')), -- lecture | révision
  created_by  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz,                 -- NULL = sans expiration
  revoked     boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS rapport_shares_report_idx ON rapport_shares (report_id);

-- Commentaires de révision laissés par le vérificateur (mode 'review'). Rattachés au rapport.
CREATE TABLE IF NOT EXISTS rapport_reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id   text NOT NULL,
  tenant_id   text NOT NULL,
  token       text,                        -- partage d'origine (traçabilité)
  author      text DEFAULT '',             -- nom saisi par le vérificateur
  comment     text NOT NULL DEFAULT '',
  block_ref   text,                        -- section/bloc visé (optionnel)
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS rapport_reviews_report_idx ON rapport_reviews (report_id, created_at DESC);

-- Sécurité : accès via routes serveur (service role) uniquement.
ALTER TABLE rapport_shares  ENABLE ROW LEVEL SECURITY;
ALTER TABLE rapport_reviews ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON rapport_shares  FROM anon, authenticated;
REVOKE ALL ON rapport_reviews FROM anon, authenticated;
