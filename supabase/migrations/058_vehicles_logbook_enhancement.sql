-- 058: Logbook véhicules — prix d'achat + km début d'année
-- Exécuter dans le SQL Editor de Supabase Dashboard

-- Prix d'achat du véhicule (pour calcul avantage imposable ARC)
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS purchase_price numeric(12,2);

-- Odomètre au début de l'année (ou à la prise de possession)
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS km_at_year_start numeric(10,0) DEFAULT 0;

-- Année de référence du km_at_year_start
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS km_year_start_year int DEFAULT EXTRACT(YEAR FROM now())::int;
