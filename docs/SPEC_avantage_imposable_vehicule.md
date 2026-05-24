# SPEC — Moteur de calcul fiscal véhicule (2 régimes)

> Document de référence — C-Secur360  
> Dernière mise à jour : 2026-05-24  
> ⚠️ Les formules sont officielles (ARC fédéral + Revenu Québec) mais tout résultat doit être validé par un comptable.  
> Ne jamais scanner la réglementation automatiquement — les taux sont saisis/maintenus comme données paramétrables et versionnées.

---

## Vue d'ensemble — Deux régimes distincts

| | RÉGIME A — Fourni | RÉGIME B — Personnel |
|---|---|---|
| Qui possède le véhicule | Employeur | Employé |
| Sens du calcul | Avantage **ajouté** au revenu | Remboursement **versé** à l'employé |
| Composantes | Droit d'usage + fonctionnement | Allocation au km (2 paliers) |
| Taux clé 2026 | 2 %/mois ; 0,34 $/km | 0,73 / 0,67 $/km |
| Saisie km | Odomètre hebdo + km job (Logbook) | Km affaires par trajet |
| Résultat | Réconciliation fin d'année (employé ↔ tenant) | Montant à payer à l'employé |
| Imposable ? | Oui (c'est un avantage) | Non si conforme (sinon drapeau) |

⚠️ **Ne JAMAIS confondre les deux** : l'un AJOUTE au revenu, l'autre REMBOURSE. Un même employé peut relever d'un régime ou de l'autre selon le véhicule.

---

## RÉGIME A — Véhicule fourni par l'employeur (avantage imposable)

### 1. Principe d'architecture : séparer le moteur des paramètres

- **Le moteur** (code, stable) — les formules changent rarement.
- **Les paramètres** (données, annuels) — taux, plafonds, seuils changent chaque année.

Quand l'ARC/RQ publie de nouveaux taux → on ajoute une ligne dans `tax_benefit_rates` pour la nouvelle année. Le code n'est pas touché. Chaque calcul stocke la version de paramètres utilisée → auditabilité totale.

---

### 2. Modèle de données (Supabase)

#### Table `tax_benefit_rates` (paramètres annuels, versionnés)

| colonne | type | description |
|---|---|---|
| id | uuid | PK |
| tax_year | int | année d'imposition (ex. 2026) |
| jurisdiction | text | 'federal', 'QC', 'territories', etc. |
| standby_monthly_rate | numeric | taux frais droit d'usage / mois (défaut 0.02 = 2 %) |
| standby_lease_fraction | numeric | fraction du coût de location (défaut 0.6667 = 2/3) |
| operating_rate_per_km | numeric | avantage fonctionnement $/km (2026 : 0.34) |
| operating_rate_per_km_sales | numeric | taux réduit vendeurs auto (2026 : 0.31) |
| reduced_standby_km_per_30days | int | seuil km perso/30 j pour droit d'usage réduit (1667) |
| reduced_standby_km_annual | int | seuil annuel équivalent (20004) |
| operating_half_rule_fraction | numeric | option « moitié des frais droit d'usage » (0.5) |
| effective_from | date | début de validité |
| source_url | text | lien officiel ARC/RQ (traçabilité) |
| notes | text | remarques de conformité |

> ⚠️ Le taux de fonctionnement **0.34 $/km** est la valeur prescrite 2026 confirmée fédéral ET Revenu Québec. Le 0.25 $/km cité parfois provient d'une annonce de 2017 — NE PAS utiliser.  
> Vendeurs/loueurs d'autos : **0.31 $/km**.

#### Table `vehicle_assignments` (affectation véhicule ↔ employé)

| colonne | type | description |
|---|---|---|
| id | uuid | PK |
| vehicle_id | uuid | FK véhicule |
| employee_id | uuid | FK employé |
| tenant_id | uuid | FK tenant |
| purchase_cost | numeric | coût initial de l'auto pour l'employeur (taxes incl.) |
| is_leased | bool | true si location |
| monthly_lease_cost | numeric | coût mensuel de location si is_leased |
| odometer_initial | int | km à la prise de possession (le passé n'est pas assigné) |
| assigned_from | date | début d'affectation |
| assigned_to | date | fin (null si en cours) |
| is_sales_employee | bool | emploi principal = vente/location d'autos |

#### Table `vehicle_km_logs` (alimentée par Logbook / feuille de temps)

| colonne | type | description |
|---|---|---|
| id | uuid | PK |
| assignment_id | uuid | FK |
| week_start | date | semaine de saisie |
| odometer_reading | int | odomètre relevé (1×/semaine) |
| business_km | int | km affaires de la semaine |
| personal_km | int | calculé : Δodomètre − business_km |
| reimbursed_amount | numeric | montant remboursé par l'employé cette période |

#### Table `tax_benefit_calculations` (résultats, audit)

| colonne | type | description |
|---|---|---|
| id | uuid | PK |
| assignment_id | uuid | FK |
| tax_year | int | année |
| rates_version_id | uuid | FK vers la ligne tax_benefit_rates utilisée |
| months_available | int | nb de mois où l'auto était disponible |
| total_personal_km | int | km perso de l'année |
| total_business_km | int | km affaires de l'année |
| standby_charge | numeric | frais pour droit d'usage calculés |
| operating_benefit | numeric | avantage relatif au fonctionnement |
| total_benefit | numeric | total avant remboursements |
| reimbursements | numeric | total remboursé par l'employé |
| net_taxable_benefit | numeric | avantage net imposable |
| amount_charged_per_pay | numeric | déjà prélevé sur les paies |
| year_end_settlement | numeric | + = employé doit / − = tenant doit |
| calculated_at | timestamptz | horodatage |
| requires_accountant_review | bool | toujours true (disclaimer) |

---

### 3. Les deux composantes de l'avantage (formules officielles)

**Avantage imposable total = frais pour droit d'usage + avantage relatif au fonctionnement − remboursements de l'employé**

#### 3.1 Frais pour droit d'usage (standby charge)

**Véhicule acheté :**
```
standby_regular = purchase_cost × standby_monthly_rate × months_available
               = purchase_cost × 0.02 × months_available
```

**Véhicule loué :**
```
standby_regular = monthly_lease_cost × months_available × standby_lease_fraction
               = monthly_lease_cost × months_available × (2/3)
```

**Réduction possible (droit d'usage réduit)** — applicable SI :
- l'auto est utilisée principalement (> 50 %) pour les fonctions de l'employé, ET
- km perso ≤ `reduced_standby_km_per_30days × months_available` (1667 × mois)

```
si éligible :
  reduction_factor = total_personal_km / (1667 × months_available)
  reduction_factor = min(reduction_factor, 1)   // jamais > 1
  standby_charge = standby_regular × reduction_factor
sinon :
  standby_charge = standby_regular
```

#### 3.2 Avantage relatif au fonctionnement (operating benefit)

**Méthode standard (par km perso) :**
```
rate = is_sales_employee ? operating_rate_per_km_sales : operating_rate_per_km
operating_standard = total_personal_km × rate
```

**Méthode optionnelle « moitié »** — admissible SI l'auto est utilisée principalement pour affaires ET l'employé en fait la demande :
```
operating_half = standby_charge × 0.5

si éligible_option_half :
  operating_benefit = min(operating_standard, operating_half)
sinon :
  operating_benefit = operating_standard
```

#### 3.3 Total et remboursements

```
total_benefit       = standby_charge + operating_benefit
net_taxable_benefit = max(0, total_benefit − reimbursements)
```

> ⚠️ Remboursements de fonctionnement valables seulement si versés dans les **45 jours** suivant la fin de l'année. Stocker la date de remboursement et appliquer cette règle.

---

### 4. Réconciliation de fin d'année

```
year_end_settlement = amount_charged_per_pay_total − net_taxable_benefit

year_end_settlement > 0 → trop prélevé → le tenant doit de l'argent à l'employé
year_end_settlement < 0 → pas assez prélevé → l'employé doit de l'argent au tenant
```

**Exemple Paul** (illustratif, validation comptable requise) :
- 10 000 km perso/an, auto achetée 40 000 $, disponible 12 mois, non-vendeur, pas d'option « moitié », 0 remboursement
```
standby_regular = 40000 × 0.02 × 12 = 9600 $
km perso (10000) ≤ 1667 × 12 = 20004 → éligible réduction
  reduction_factor = 10000 / 20004 = 0.4999
  standby_charge = 9600 × 0.4999 ≈ 4799 $
operating = 10000 × 0.34 = 3400 $
total_benefit = 4799 + 3400 = 8199 $
```

---

### 5. Calcul des km perso (lien Logbook)

```
Δodomètre_semaine = odometer_reading[n] − odometer_reading[n-1]
personal_km_semaine = Δodomètre_semaine − business_km_semaine
```

- Premier relevé : base = `odometer_initial` (prise de possession) → le km passé n'est jamais assigné.
- ⚠️ Le trajet domicile ↔ travail est **personnel** selon l'ARC. Préciser dans la saisie.
- `business_km` doit idéalement provenir des trajets liés aux projets (Planner).

---

### 6. Règles d'évolutivité (à respecter dans le code)

1. Aucune valeur de taux en dur dans le code — tout vient de `tax_benefit_rates`.
2. Chaque calcul référence la ligne de taux utilisée (`rates_version_id`) → reproductible.
3. Une UI admin permet d'ajouter les taux d'une nouvelle année (champ + `source_url` + date).
4. La jurisdiction est choisie selon la région du tenant (fédéral + provincial).
5. Le moteur est une **fonction pure** : `computeBenefit(assignment, kmLogs, rates) → résultat`.
6. Facilement testable avec des cas connus (golden tests = exemples ARC officiels).
7. Tout résultat affiché porte la mention **« Estimation — à valider par votre comptable »**.

---

### 7. Tests à coder — Régime A (golden tests)

1. Auto achetée, usage mixte, sans réduction → `standby = coût × 2 % × mois`.
2. Auto achetée, usage principalement affaires, km perso < seuil → réduction appliquée.
3. Vendeur d'autos → taux fonctionnement 0.31 au lieu de 0.34.
4. Option « moitié » admissible et plus avantageuse → `operating = standby × 0.5`.
5. Remboursement après 45 jours → non déductible de l'avantage.
6. Affectation en cours d'année (ex. 7 mois) → `months_available = 7`.
7. Changement d'année de taux → même véhicule, deux ans, deux `rates_version_id` distincts.

---

### 8. Taux de référence 2026 (valeurs par défaut à insérer)

| paramètre | fédéral 2026 | QC 2026 |
|---|---|---|
| Frais droit d'usage / mois | 2 % du coût | 2 % du coût |
| Location | 2/3 du coût | 2/3 du coût |
| Fonctionnement $/km | 0.34 | 0.34 |
| Fonctionnement vendeurs $/km | 0.31 | 0.31 |
| Seuil km perso / 30 j | 1667 | 1667 |
| Seuil annuel | 20004 | 20004 |

---

## RÉGIME B — Véhicule personnel utilisé pour le travail (allocation / remboursement)

L'employé utilise **son propre véhicule**. L'employeur verse une allocation au km. Si elle respecte le taux ARC basé uniquement sur km affaires → **non imposable**. On calcule un montant à rembourser, PAS un avantage.

---

### B.1 Données de référence

Table `mileage_allowance_rates` (ou extension de `tax_benefit_rates`) :

| colonne | type | 2026 fédéral / QC |
|---|---|---|
| allowance_rate_tier1 | numeric | 0.73 $/km (premiers 5000 km) |
| allowance_rate_tier2 | numeric | 0.67 $/km (au-delà de 5000 km) |
| allowance_tier1_threshold | int | 5000 km |
| allowance_rate_tier1_territories | numeric | 0.77 (Yukon, T.N.-O., Nunavut) |
| allowance_rate_tier2_territories | numeric | 0.71 |

---

### B.2 Table `personal_vehicle_km_logs`

| colonne | type | description |
|---|---|---|
| id | uuid | PK |
| employee_id | uuid | FK |
| tenant_id | uuid | FK |
| trip_date | date | date du déplacement |
| business_km | int | km affaires (uniquement) |
| project_id | uuid | FK projet (Planner) si rattaché — recommandé pour preuve |
| description | text | motif du déplacement |

> ⚠️ Seuls les km **affaires** comptent. Le trajet domicile↔travail est personnel et N'EST PAS remboursable.

---

### B.3 Calcul de l'allocation (par employé, par année)

```
total_business_km = Σ business_km de l'année (par employé)
seuil = allowance_tier1_threshold   // 5000

si territoires :
  r1 = 0.77 ; r2 = 0.71
sinon :
  r1 = 0.73 ; r2 = 0.67

si total_business_km <= seuil :
  allocation = total_business_km × r1
sinon :
  allocation = (seuil × r1) + ((total_business_km − seuil) × r2)
```

---

### B.4 Test de « caractère raisonnable » (conformité non imposable)

```
est_non_imposable =
     basee_sur_km_seulement          // pas de montant fixe mensuel
  && taux_applique <= taux_prescrit  // ≤ taux ARC
  && pas_allocation_forfaitaire      // aucun autre forfait pour le même véhicule
```

Si une condition échoue → allocation **imposable** → drapeau + alerte UI.

> Note : si l'employeur verse à la fois un montant fixe ET un taux/km pour le même véhicule, l'ARC traite généralement le tout comme imposable.

---

### B.5 Tests à coder — Régime B

1. 4000 km affaires → allocation = `4000 × 0.73`.
2. 8000 km affaires → `(5000 × 0.73) + (3000 × 0.67)`.
3. Employé en territoire → taux 0.77 / 0.71.
4. Taux versé > taux ARC → drapeau imposable.
5. Présence d'une allocation forfaitaire en plus → drapeau imposable.

---

## Notes d'implémentation

- Le module véhicule doit demander, pour chaque affectation, quel régime s'applique (fourni vs personnel) et router vers le bon moteur.
- Sources officielles à conserver dans `source_url` : pages ARC (canada.ca) et Revenu Québec.
- Disclaimer obligatoire dans l'UI : **« Estimation — à valider par votre comptable »**.
