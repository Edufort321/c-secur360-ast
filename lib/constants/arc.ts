// Taux ARC / Revenu Québec 2026 — source unique de vérité.
// À mettre à jour chaque année (sources : canada.ca + revenuquebec.ca).
// Utilisé par l'admin véhicules (simulateur, grille) ET par les feuilles de temps
// (déduction véhicule), pour garantir la cohérence des calculs jusqu'à la paie.
export const ARC_2026 = {
  standby_monthly:          0.02,         // 2 %/mois — droit d'usage (federal + QC)
  standby_lease_frac:       2 / 3,        // 2/3 du coût bail — droit d'usage bail
  operating_per_km:         0.34,         // avantage fonctionnement fédéral $/km
  operating_per_km_qc:      0.33,         // avantage fonctionnement Revenu Québec $/km
  operating_sales:          0.31,         // vendeur/loueur d'autos (fédéral)
  operating_sales_qc:       0.30,         // vendeur/loueur d'autos (QC)
  half_method_fraction:     0.50,         // méthode de la moitié
  km_t1_rate:               0.73,         // remb. perso palier 1 (2026)
  km_t2_rate:               0.67,         // remb. perso palier 2 (2026)
  km_t1_threshold:          5000,
  reduced_standby_km_30d:   1667,         // seuil km perso / 30 j (droit d'usage réduit)
  reduced_standby_km_annual: 20004,       // seuil annuel équivalent
  bail_cap:                 1100,         // plafond bail/mois 2026 (hors taxes)
  interest_cap:             300,          // plafond intérêts financement/mois
  cca10_rate:               0.30,         // Cat. 10/10.1 thermique — 30 %/an dégressif
  cca10_cap:                39000,        // plafond coût Cat. 10.1 (2026, hors taxes)
  cca54_rate:               1.00,         // Cat. 54 ZEV — 100 % an 1
  cca54_cap:                61000,        // plafond coût Cat. 54
  perso_km_utilitaire:      1000,         // km perso max/an pour exemption utilitaire
  reimb_delay_days:         45,           // délai remboursement après fin d'année (jours)
} as const;
