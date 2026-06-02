-- 104 — Profils de paie : activer/désactiver le temps supplémentaire (OT) et double (DT) par employé.
-- Désactivé => le multiplicateur ne s'applique pas (heures payées au taux régulier).
ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS ot_enabled boolean NOT NULL DEFAULT true;
ALTER TABLE employee_profiles ADD COLUMN IF NOT EXISTS dt_enabled boolean NOT NULL DEFAULT true;
