-- 063: Véhicules — classe du véhicule (tourisme / utilitaire / spécialisé)
-- Exécuter dans le SQL Editor de Supabase Dashboard

-- Classe du véhicule selon la LIR — détermine si l'avantage standby s'applique
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS vehicle_class TEXT NOT NULL DEFAULT 'tourisme';
-- Valeurs: 'tourisme' | 'utilitaire' | 'specialise'
-- tourisme     → Plein avantage (2 %/mois) — voiture, VUS, minivan ≤ 8 places
-- utilitaire   → Exemption possible si ≥ 90 % affaires ET km perso ≤ 1 000/an
-- specialise   → Généralement exempt (nacelle, grue, camion lourd)

-- Indicateur vendeur d'automobiles (taux fonctionnement réduit : 0,31 au lieu de 0,34 $/km)
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS is_sales_employee BOOLEAN NOT NULL DEFAULT false;
