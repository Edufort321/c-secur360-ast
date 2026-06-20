-- 260 — HSE : registre SIMDUT/FDS (légal WHMIS) + registre des dangers/risques.
-- (1) Colonnes FDS sur l'inventaire (`items`) pour alimenter le registre SIMDUT depuis les produits chimiques.
-- (2) Nouveau type de registre RISK_REGISTER (dangers/risques), nourri par les AST/JSA.
-- Idempotent. À coller dans l'éditeur SQL Supabase du BON projet (nzjjgcccxlqhbtpitmpo), puis Run.

-- (1) FDS / classe de danger sur les articles d'inventaire (produits chimiques SIMDUT).
alter table if exists public.items
  add column if not exists fds_url text,
  add column if not exists fds_date date,
  add column if not exists hazard_class text;
comment on column public.items.fds_url is 'Lien vers la fiche de données de sécurité (FDS/SDS) — obligation WHMIS/SIMDUT.';
comment on column public.items.hazard_class is 'Classe de danger SIMDUT 2015 (ex. inflammable, corrosif…).';

-- (2) Registre des dangers/risques (générique, hors cadre national). Nourri par les AST (ast_forms.hazards).
insert into public.hse_register_type (code, name_fr, name_en, framework_id, default_review_months, field_schema, icon) values
  ('RISK_REGISTER', 'Registre des dangers / risques', 'Hazard / risk register', null, 12,
   '[{"key":"hazard","label_fr":"Danger","label_en":"Hazard","type":"text"},{"key":"risk_level","label_fr":"Niveau de risque","label_en":"Risk level","type":"select"},{"key":"controls","label_fr":"Mesures de contrôle","label_en":"Control measures","type":"text"},{"key":"source","label_fr":"Source (AST)","label_en":"Source (JSA)","type":"text"}]'::jsonb, 'alert-octagon')
on conflict (code) do nothing;

insert into schema_migrations (version) values ('260') on conflict (version) do nothing;
