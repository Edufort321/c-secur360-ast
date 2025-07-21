// =================== COMPONENTS/STEPS/STEP4PERMITS/TYPES/ATMOSPHERIC.TS ===================
// Types TypeScript pour données atmosphériques et tests de qualité de l'air
"use client";

// =================== TYPES DE BASE ===================

export type GasType = 
  | 'oxygen'           // Oxygène (O₂)
  | 'carbon_monoxide'  // Monoxyde de carbone (CO)
  | 'hydrogen_sulfide' // Sulfure d'hydrogène (H₂S)
  | 'methane'          // Méthane (CH₄)
  | 'propane'          // Propane (C₃H₈)
  | 'carbon_dioxide'   // Dioxyde de carbone (CO₂)
  | 'ammonia'          // Ammoniac (NH₃)
  | 'chlorine'         // Chlore (Cl₂)
  | 'nitrogen_dioxide' // Dioxyde d'azote (NO₂)
  | 'sulfur_dioxide'   // Dioxyde de soufre (SO₂)
  | 'benzene'          // Benzène (C₆H₆)
  | 'toluene'          // Toluène (C₇H₈)
  | 'xylene'           // Xylène (C₈H₁₀)
  | 'acetone'          // Acétone (C₃H₆O)
  | 'formaldehyde'     // Formaldéhyde (CH₂O)
  | 'lel'              // Lower Explosive Limit (combustible)
  | 'uel'              // Upper Explosive Limit (combustible)
  | 'voc'              // Volatile Organic Compounds
  | 'dust'             // Particules en suspension
  | 'radiation'        // Radiation ionisante
  | 'noise';           // Niveau sonore

export type MeasurementUnit = 
  | '%'                // Pourcentage (O₂, LEL)
  | 'ppm'              // Parts per million
  | 'ppb'              // Parts per billion
  | 'mg/m³'            // Milligrammes par mètre cube
  | 'µg/m³'            // Microgrammes par mètre cube
  | 'g/m³'             // Grammes par mètre cube
  | 'Vol%'             // Pourcentage volumique
  | 'mbar'             // Millibar (pression)
  | 'kPa'              // Kilopascal (pression)
  | 'mmHg'             // Millimètres de mercure
  | '°C'               // Degrés Celsius
  | '°F'               // Degrés Fahrenheit
  | 'K'                // Kelvin
  | '%RH'              // Pourcentage humidité relative
  | 'dB'               // Décibels (bruit)
  | 'dBA'              // Décibels pondérés A
  | 'µSv/h'            // Microsieverts par heure (radiation)
  | 'mSv/h'            // Millisieverts par heure
  | 'cpm'              // Counts per minute (radiation)
  | 'Bq/m³'            // Becquerels par mètre cube
  | 'fibers/cm³'       // Fibres par centimètre cube (amiante)
  | 'particles/cm³';   // Particules par centimètre cube

export type AlarmLevel = 
  | 'safe'             // Niveau sécuritaire
  | 'caution'          // Prudence recommandée
  | 'warning'          // Avertissement
  | 'danger'           // Danger immédiat
  | 'critical'         // Critique - évacuation
  | 'extreme';         // Extrême - urgence

export type TestStatus = 
  | 'pending'          // En attente
  | 'in_progress'      // En cours
  | 'completed'        // Terminé
  | 'failed'           // Échec
  | 'expired'          // Expiré
  | 'invalid'          // Invalide
  | 'calibration_due'  // Calibration requise
  | 'maintenance_due'; // Maintenance requise

// =================== INTERFACES PRINCIPALES ===================

export interface AtmosphericReading {
  id: string;                              // ID unique lecture
  timestamp: number;                       // Timestamp Unix (ms)
  location: {                             // Localisation précise
    spaceId: string;                      // ID espace confiné
    point: string;                        // Point de mesure (entrée, centre, fond)
    coordinates?: {                       // Coordonnées GPS optionnelles
      latitude: number;
      longitude: number;
      altitude?: number;
    };
    depth?: number;                       // Profondeur si applicable (m)
    description?: string;                 // Description textuelle
  };
  gasType: GasType;                       // Type de gaz mesuré
  value: number;                          // Valeur mesurée
  unit: MeasurementUnit;                  // Unité de mesure
  alarmLevel: AlarmLevel;                 // Niveau d'alarme calculé
  confidence: number;                     // Confiance mesure (0-1)
  deviceInfo: {                          // Informations équipement
    deviceId: string;                     // ID unique appareil
    model: string;                        // Modèle détecteur
    manufacturer: string;                 // Fabricant
    serialNumber: string;                 // Numéro série
    calibrationDate: number;              // Dernière calibration
    batteryLevel?: number;                // Niveau batterie (%)
    firmwareVersion?: string;             // Version firmware
  };
  environmental: {                       // Conditions environnementales
    temperature: number;                  // Température (°C)
    humidity: number;                     // Humidité relative (%)
    pressure: number;                     // Pression atmosphérique (kPa)
    windSpeed?: number;                   // Vitesse vent (km/h)
    windDirection?: number;               // Direction vent (degrés)
  };
  metadata: {                            // Métadonnées
    operator: string;                     // Opérateur test
    testType: 'initial' | 'continuous' | 'verification' | 'emergency';
    method: 'manual' | 'automatic' | 'bluetooth' | 'wireless';
    duration?: number;                    // Durée test (secondes)
    notes?: string;                       // Notes additionnelles
    photos?: string[];                    // URLs photos
    correctionFactors?: {                 // Facteurs correction
      temperature: number;
      pressure: number;
      humidity: number;
    };
  };
}

export interface AtmosphericLimits {
  gasType: GasType;                       // Type de gaz
  safeRange: {                           // Plage sécuritaire
    min: number;                          // Minimum acceptable
    max: number;                          // Maximum acceptable
    unit: MeasurementUnit;                // Unité
  };
  alarmLevels: {                         // Seuils d'alarme
    caution: number;                      // Seuil prudence
    warning: number;                      // Seuil avertissement
    danger: number;                       // Seuil danger
    critical: number;                     // Seuil critique
    extreme?: number;                     // Seuil extrême
  };
  regulatory: {                          // Références réglementaires
    standard: string;                     // Standard (ACGIH, OSHA, CNESST)
    jurisdiction: string;                 // Juridiction (QC, ON, BC, etc.)
    twa?: number;                         // Time Weighted Average (8h)
    stel?: number;                        // Short Term Exposure Limit (15min)
    ceiling?: number;                     // Ceiling limit (instantané)
    idlh?: number;                        // Immediately Dangerous to Life/Health
    lc50?: number;                        // Lethal Concentration 50%
    effectiveDate: string;                // Date entrée vigueur
  };
  physicalProperties: {                  // Propriétés physiques
    molecularWeight: number;              // Poids moléculaire (g/mol)
    density?: number;                     // Densité relative air
    boilingPoint?: number;                // Point ébullition (°C)
    meltingPoint?: number;                // Point fusion (°C)
    vaporPressure?: number;               // Pression vapeur (kPa à 20°C)
    solubility?: string;                  // Solubilité dans eau
    odorThreshold?: number;               // Seuil olfactif (ppm)
    flammabilityLimits?: {               // Limites inflammabilité
      lel: number;                        // Lower Explosive Limit (%)
      uel: number;                        // Upper Explosive Limit (%)
    };
  };
}

export interface AtmosphericTest {
  id: string;                            // ID unique test
  permitId: string;                      // ID permis associé
  spaceId: string;                       // ID espace confiné
  status: TestStatus;                    // Statut test
  type: 'pre_entry' | 'continuous' | 'exit' | 'emergency' | 'maintenance';
  scheduledTime: number;                 // Heure programmée
  startTime?: number;                    // Heure début réelle
  endTime?: number;                      // Heure fin
  duration?: number;                     // Durée réelle (secondes)
  operator: {                           // Opérateur
    id: string;                          // ID utilisateur
    name: string;                        // Nom complet
    role: string;                        // Rôle (safety_officer, supervisor)
    certifications: string[];            // Certifications pertinentes
  };
  readings: AtmosphericReading[];        // Lectures atmosphériques
  summary: {                            // Résumé test
    totalReadings: number;               // Nombre total lectures
    gasesDetected: GasType[];            // Gaz détectés
    highestAlarmLevel: AlarmLevel;       // Niveau alarme max
    averageConfidence: number;           // Confiance moyenne
    testPassed: boolean;                 // Test réussi/échoué
    criticalReadings: number;            // Lectures critiques
    anomalies: string[];                 // Anomalies détectées
  };
  equipment: {                          // Équipements utilisés
    primary: {                          // Détecteur principal
      deviceId: string;
      model: string;
      calibrationStatus: 'valid' | 'due' | 'overdue';
      lastCalibration: number;
      nextCalibration: number;
    };
    backup?: {                          // Détecteur backup
      deviceId: string;
      model: string;
      calibrationStatus: 'valid' | 'due' | 'overdue';
    };
    ventilation?: {                     // Équipement ventilation
      type: 'natural' | 'mechanical' | 'forced';
      capacity?: number;                 // CFM ou m³/h
      runtime?: number;                  // Temps fonctionnement (min)
    };
  };
  conditions: {                         // Conditions test
    weather: {                          // Météo
      temperature: number;
      humidity: number;
      pressure: number;
      windSpeed?: number;
      precipitation?: boolean;
    };
    workspace: {                        // Espace travail
      ventilated: boolean;              // Ventilation active
      lighting: 'natural' | 'artificial' | 'both' | 'none';
      accessibility: 'easy' | 'moderate' | 'difficult';
      hazardsSuppressed: boolean;       // Dangers maîtrisés
    };
  };
  compliance: {                         // Conformité réglementaire
    standard: string;                    // Standard appliqué
    requirements: string[];              // Exigences respectées
    deviations?: string[];               // Déviations identifiées
    corrective_actions?: string[];       // Actions correctives
    approver?: {                        // Approbateur
      id: string;
      name: string;
      role: string;
      timestamp: number;
    };
  };
  results: {                           // Résultats finaux
    recommendation: 'entry_approved' | 'entry_denied' | 'conditional_entry' | 'retest_required';
    conditions?: string[];               // Conditions entry si applicables
    restrictions?: string[];             // Restrictions imposées
    monitoringRequired?: {              // Surveillance continue requise
      frequency: number;                 // Fréquence (minutes)
      parameters: GasType[];             // Paramètres à surveiller
      duration: number;                  // Durée surveillance (heures)
    };
    validUntil?: number;                // Validité jusqu'à (timestamp)
    nextTestDue?: number;               // Prochain test requis
  };
}

export interface AtmosphericAlert {
  id: string;                           // ID unique alerte
  timestamp: number;                    // Moment déclenchement
  level: AlarmLevel;                    // Niveau gravité
  gasType: GasType;                     // Gaz concerné
  reading: AtmosphericReading;          // Lecture déclenchante
  location: {                          // Localisation
    spaceId: string;
    point: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  thresholds: {                        // Seuils dépassés
    exceeded: number;                   // Valeur seuil dépassée
    current: number;                    // Valeur actuelle
    unit: MeasurementUnit;              // Unité
  };
  response: {                          // Réponse déclenchée
    automatic: string[];                // Actions automatiques
    required: string[];                 // Actions requises
    personnel: string[];                // Personnel à notifier
    evacuation?: {                     // Évacuation si requise
      ordered: boolean;
      timestamp?: number;
      completed?: boolean;
      duration?: number;
    };
  };
  status: 'active' | 'acknowledged' | 'resolved' | 'escalated';
  acknowledgment?: {                   // Accusé réception
    by: string;                        // Par qui
    timestamp: number;                 // Quand
    action: string;                    // Action prise
  };
  resolution?: {                       // Résolution
    by: string;                        // Par qui
    timestamp: number;                 // Quand
    method: string;                    // Méthode résolution
    verified: boolean;                 // Vérification effectuée
  };
}

export interface AtmosphericTrend {
  gasType: GasType;                     // Type de gaz
  timeRange: {                         // Période analyse
    start: number;                      // Début (timestamp)
    end: number;                        // Fin (timestamp)
    duration: number;                   // Durée (ms)
  };
  dataPoints: Array<{                  // Points de données
    timestamp: number;
    value: number;
    confidence: number;
  }>;
  statistics: {                        // Statistiques
    count: number;                      // Nombre mesures
    min: number;                        // Minimum
    max: number;                        // Maximum
    average: number;                    // Moyenne
    median: number;                     // Médiane
    standardDeviation: number;          // Écart type
    trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
    correlation?: number;               // Corrélation temporelle (-1 à 1)
  };
  forecasting?: {                      // Prédiction (si applicable)
    nextHour: {                        // Prochaine heure
      predicted: number;
      confidence: number;
      range: { min: number; max: number; };
    };
    riskAssessment: {                  // Évaluation risque
      probability: number;             // Probabilité dépassement seuil
      timeToExceedance?: number;       // Temps avant dépassement (min)
      recommendedAction: string;       // Action recommandée
    };
  };
  anomalies: Array<{                   // Anomalies détectées
    timestamp: number;
    type: 'spike' | 'drop' | 'plateau' | 'oscillation';
    severity: 'low' | 'medium' | 'high';
    description: string;
    possibleCauses: string[];
  }>;
}

// =================== TYPES UTILITAIRES ===================

export interface GasProperties {
  [key: string]: {
    name: { fr: string; en: string; };   // Nom bilingue
    formula: string;                     // Formule chimique
    casNumber: string;                   // Numéro CAS
    synonyms: string[];                  // Synonymes
    category: 'toxic' | 'explosive' | 'asphyxiant' | 'corrosive' | 'irritant';
    defaultUnit: MeasurementUnit;        // Unité par défaut
    detectionMethods: string[];          // Méthodes détection
    symptoms: string[];                  // Symptômes exposition
    firstAid: string[];                  // Premiers secours
    sources: string[];                   // Sources communes
  };
}

export interface CalibrationRecord {
  id: string;                          // ID calibration
  deviceId: string;                    // ID équipement
  timestamp: number;                   // Date calibration
  technician: {                       // Technicien
    id: string;
    name: string;
    certification: string;
  };
  gasesCalibrated: Array<{             // Gaz calibrés
    gasType: GasType;
    referenceValue: number;             // Valeur référence
    measuredValue: number;              // Valeur mesurée
    deviation: number;                  // Écart (%)
    passed: boolean;                    // Calibration réussie
  }>;
  environment: {                       // Conditions calibration
    temperature: number;
    humidity: number;
    pressure: number;
  };
  results: {                          // Résultats
    overall: 'passed' | 'failed' | 'conditional';
    accuracy: number;                   // Précision globale (%)
    drift: number;                      // Dérive depuis dernière calibration
    nextDue: number;                    // Prochaine calibration due
    certificate?: string;               // Numéro certificat
  };
}

export interface AtmosphericReport {
  id: string;                          // ID rapport
  type: 'daily' | 'weekly' | 'monthly' | 'incident' | 'compliance';
  period: {                           // Période couverte
    start: number;
    end: number;
  };
  scope: {                            // Portée
    spaces: string[];                   // Espaces inclus
    gasTypes: GasType[];               // Gaz analysés
    testTypes: string[];               // Types tests
  };
  summary: {                          // Résumé exécutif
    totalTests: number;                // Tests effectués
    totalReadings: number;             // Lectures prises
    alertsGenerated: number;           // Alertes générées
    complianceRate: number;            // Taux conformité (%)
    averageTestDuration: number;       // Durée moyenne tests (min)
  };
  trends: AtmosphericTrend[];          // Tendances identifiées
  alerts: AtmosphericAlert[];          // Alertes période
  recommendations: Array<{             // Recommandations
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: 'equipment' | 'procedure' | 'training' | 'compliance';
    description: string;
    dueDate?: number;
    assignedTo?: string;
  }>;
  compliance: {                       // Conformité réglementaire
    standards: string[];               // Standards appliqués
    violations: Array<{                // Violations identifiées
      standard: string;
      requirement: string;
      violation: string;
      severity: 'minor' | 'major' | 'critical';
      corrective_action: string;
    }>;
    certifications: Array<{            // Certifications requises
      type: string;
      status: 'valid' | 'expired' | 'missing';
      dueDate?: number;
    }>;
  };
}

// =================== EXPORTS (SANS CONFLIT) ===================
// Note: Les types sont déjà exportés individuellement ci-dessus
// Pas besoin de re-export groupé qui cause des conflits
