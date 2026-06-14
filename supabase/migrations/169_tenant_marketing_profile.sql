-- 169 — Module Marketing TENANT : profil d'entreprise qui NOURRIT l'IA marketing du tenant (la
-- plateforme ne connaît pas l'activité de chaque tenant). Toute la conso IA reste plafonnée par le
-- FORFAIT du tenant (ai_budgets / ai_usage, lib/aiBudget). Les actifs marketing réutilisent
-- marketing_assets (déjà tenant_id). Idempotent.

create table if not exists public.tenant_marketing_profile (
  tenant_id    text primary key,
  company_name text,
  sector       text,                          -- secteur d'activité
  description  text,                          -- CE QUE FAIT l'entreprise (cœur du contexte IA)
  offer        text,                          -- produits / services
  audience     text,                          -- clientèle cible
  tone         text,                          -- ton de marque (pro, chaleureux, premium…)
  key_points   text,                          -- arguments clés / différenciateurs
  website      text,
  province     text default 'QC',
  lang         text default 'fr',
  updated_at   timestamptz not null default now()
);

alter table public.tenant_marketing_profile enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='tenant_marketing_profile' and policyname='tmp_all') then
    create policy "tmp_all" on public.tenant_marketing_profile for all using (true) with check (true);
  end if;
end $$;

notify pgrst, 'reload schema';
