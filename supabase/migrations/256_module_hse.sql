-- 256 — Enregistrer le module « Registres & KPI (SST) » (clé `hse`) comme module VENDABLE/ACTIVABLE.
-- Sans cette ligne, le module n'apparaît pas dans le catalogue (table `modules`) → il s'affiche
-- VERROUILLÉ (cadenas) et n'est pas activable par tenant. Idempotent + auto-enregistré.
-- ⚠️ `monthly_price` = prix ANNUEL en dollars (nom de colonne trompeur, convention du projet).

insert into modules (key, name_fr, name_en, monthly_price, sort_order, is_active) values
  ('hse', 'Registres & KPI (SST)', 'Registers & KPIs (HSE)', 500, 35, true)
on conflict (key) do update
  set name_fr = excluded.name_fr, name_en = excluded.name_en, is_active = true, updated_at = now();

-- Activer pour le tenant de démonstration cerdia (les autres tenants l'activent via l'admin).
insert into tenant_modules (tenant_id, module_key)
select 'cerdia', 'hse'
where not exists (select 1 from tenant_modules where tenant_id = 'cerdia' and module_key = 'hse');

insert into schema_migrations (version) values ('256') on conflict (version) do nothing;
