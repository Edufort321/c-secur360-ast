-- 170 — Secrets par tenant (ex. clé API D-ID pour la VIDÉO avatar « bring-your-own-key »). Le tenant
-- gère et paie sa propre conso vidéo (ne touche pas le quota plateforme). SÉCURITÉ : table accessible
-- UNIQUEMENT par les routes serveur (service_role). RLS activée, AUCUNE policy + REVOKE anon : la clé
-- anon ne peut JAMAIS lire les clés. (Le texte IA reste géré par le forfait plateforme, voir aiBudget.)

create table if not exists public.tenant_secrets (
  tenant_id    text primary key,
  did_api_key  text,                         -- clé API D-ID (vidéo avatar). Optionnelle.
  updated_at   timestamptz not null default now()
);

alter table public.tenant_secrets enable row level security;
revoke all on public.tenant_secrets from anon;

notify pgrst, 'reload schema';
