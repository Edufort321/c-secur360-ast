-- 184: « Transmettre au comptable » — jetons d'accès READ-ONLY pour le comptable externe.
-- Un jeton (par tenant) donne accès en LECTURE SEULE au grand livre via /api/accounting/export
-- (journal d'écritures + balance de vérification, CSV ou JSON). AUCUN accès en écriture, aucune
-- autre donnée. Table SENSIBLE : RLS activée + REVOKE anon/authenticated -> seules les routes
-- serveur service_role peuvent la lire/écrire (génération/révocation par un admin, validation du
-- jeton à l'appel). Idempotent.

CREATE TABLE IF NOT EXISTS accountant_tokens (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    text NOT NULL,
  token        text NOT NULL UNIQUE,
  label        text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz,
  revoked      boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS accountant_tokens_tenant_idx ON accountant_tokens(tenant_id);

ALTER TABLE accountant_tokens ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON accountant_tokens FROM anon, authenticated;

insert into schema_migrations (version) values ('184') on conflict (version) do nothing;
