-- 250 — NORMES DE RÉFÉRENCE centralisées : seuils/valeurs de norme saisis en arrière-plan par l'admin,
-- lus PARTOUT par les moteurs (DGA en tête). Permet de remplacer les placeholders (ex. percentiles IEEE
-- C57.104-2019, valeurs de la norme payante) par les vraies valeurs validées, sans toucher au code.
-- Stocké par tenant dans company_settings.reference_standards (jsonb). Idempotent + auto-enregistré.
--
-- Forme attendue (exemple) :
-- { "dga_percentiles": { "C2H2": { "_default": {"p90":1,"p95":35}, "low_le10": {"p90":1,"p95":2} }, ... },
--   "_meta": { "validated_by": "...", "validated_at": "2026-..." } }

alter table public.company_settings add column if not exists reference_standards jsonb not null default '{}'::jsonb;

insert into schema_migrations (version) values ('250') on conflict (version) do nothing;
