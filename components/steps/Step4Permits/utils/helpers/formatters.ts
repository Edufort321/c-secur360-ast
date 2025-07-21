// =================== COMPONENTS/STEPS/STEP4PERMITS/UTILS/HELPERS/FORMATTERS.TS ===================
// Formatters spécialisés pour affichage données atmosphériques et de sécurité
"use client";

// Import uniquement des types existants
import type { ProvinceCode } from '../../constants/provinces';

// Types définis localement pour éviter les dépendances manquantes
export type LocalGasType = 
  | 'oxygen'
  | 'carbon_monoxide'
  | 'hydrogen_sulfide'
  | 'methane'
  | 'carbon_dioxide'
  | 'ammonia'
  | 'chlorine'
  | 'nitrogen_dioxide'
  | 'sulfur_dioxide'
  | 'propane'
  | 'benzene'
  | 'toluene'
  | 'xylene'
  | 'acetone'
  | 'formaldehyde';

export type LocalAlarmLevel = 'safe' | 'low' | 'medium' | 'high' | 'danger' | 'critical' | 'extreme';

export interface LocalBilingualText {
  fr: string;
  en: string;
}

export interface LocalNumericValue {
  value: number;
  unit: string;
  precision?: number;
  range?: { min: number; max: number; };
}

export interface LocalPersonnelData {
  id: string;
  personal: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    employeeId: string;
  };
  role: 'supervisor' | 'safety_officer' | 'entrant' | 'attendant';
  certifications: Array<{
    type: string;
    number: string;
    issuer: string;
    validFrom: number;
    validUntil: number;
  }>;
  medicalClearance: {
    status: 'valid' | 'expired' | 'pending';
    expiryDate: number;
    restrictions: string[];
    doctorName: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
}

export interface LocalElectronicSignature {
  id: string;
  signerId: string;
  signerName: string;
  timestamp: number;
  ipAddress: string;
  userAgent: string;
  biometricData?: {
    fingerprint?: string;
    voiceprint?: string;
    typing_pattern?: Array<{ key: string; duration: number; }>;
  };
  certificate: {
    issuer: string;
    serialNumber: string;
    validFrom: number;
    validUntil: number;
    algorithm: string;
  };
  metadata: {
    documentHash: string;
    signatureHash: string;
    timestampHash: string;
    verificationType: 'standard' | 'advanced' | 'qualified';
    legalCompliance: string[];
  };
}

export type LocalPriorityLevel = 'low' | 'medium' | 'high' | 'critical' | 'emergency';

export interface LocalAtmosphericReading {
  id: string;
  timestamp: number;
  gasType: LocalGasType;
  value: number;
  unit: string;
  alarmLevel: LocalAlarmLevel;
  confidence: number;
  location: {
    coordinates: { latitude: number; longitude: number; };
    point: string;
  };
  environmentalConditions: {
    temperature: number;
    humidity: number;
    pressure: number;
  };
  metadata: {
    equipment: {
      model: string;
      serialNumber: string;
      lastCalibration: number;
      batteryLevel: number;
    };
    operator: string;
    qualityAssurance: {
      validated: boolean;
      flagged: boolean;
      notes: string[];
    };
  };
}

// =================== INTERFACES FORMATAGE ===================

export interface FormattingOptions {
  language: 'fr' | 'en';
  locale?: string;
  precision?: number;
  unit?: string;
  showUnit?: boolean;
  compact?: boolean;
  scientific?: boolean;
  colorCoded?: boolean;
  includeIcon?: boolean;
  includeTooltip?: boolean;
  timezone?: string;
  currency?: string;
}

export interface FormattedValue {
  display: string;
  raw: any;
  unit?: string;
  color?: string;
  icon?: string;
  tooltip?: string;
  accessibility?: string;
  className?: string;
  metadata?: {
    confidence?: number;
    lastUpdated?: number;
    source?: string;
    validated?: boolean;
  };
}

export interface ColorScale {
  name: string;
  ranges: Array<{
    min: number;
    max: number;
    color: string;
    label: LocalBilingualText;
    severity: 'safe' | 'caution' | 'warning' | 'danger' | 'critical';
  }>;
}

export interface IconMapping {
  type: string;
  condition: any;
  icon: string;
  color?: string;
  animation?: 'none' | 'pulse' | 'spin' | 'bounce';
}

export interface UnitConversion {
  from: string;
  to: string;
  factor: number;
  offset?: number;
  formula?: string;
}

// =================== CONSTANTES FORMATAGE ===================

export const LOCALE_MAPPINGS = {
  fr: {
    'fr-CA': 'Quebec French',
    'fr-FR': 'France French'
  },
  en: {
    'en-CA': 'Canadian English',
    'en-US': 'US English'
  }
} as const;

export const CURRENCY_SYMBOLS = {
  'CAD': { symbol: '$', position: 'before' },
  'USD': { symbol: '$', position: 'before' },
  'EUR': { symbol: '€', position: 'after' }
} as const;

export const UNIT_ABBREVIATIONS = {
  // Concentrations
  'parts_per_million': { fr: 'ppm', en: 'ppm' },
  'parts_per_billion': { fr: 'ppb', en: 'ppb' },
  'milligrams_per_cubic_meter': { fr: 'mg/m³', en: 'mg/m³' },
  'micrograms_per_cubic_meter': { fr: 'µg/m³', en: 'µg/m³' },
  'percent': { fr: '%', en: '%' },
  'percent_lel': { fr: '%LIE', en: '%LEL' },
  'percent_uel': { fr: '%LSE', en: '%UEL' },
  
  // Conditions physiques
  'celsius': { fr: '°C', en: '°C' },
  'fahrenheit': { fr: '°F', en: '°F' },
  'kelvin': { fr: 'K', en: 'K' },
  'percent_humidity': { fr: '%HR', en: '%RH' },
  'kilopascals': { fr: 'kPa', en: 'kPa' },
  'millibars': { fr: 'mbar', en: 'mbar' },
  'meters_per_second': { fr: 'm/s', en: 'm/s' },
  
  // Volumes et débits
  'cubic_meters': { fr: 'm³', en: 'm³' },
  'cubic_meters_per_minute': { fr: 'm³/min', en: 'm³/min' },
  'cubic_meters_per_hour': { fr: 'm³/h', en: 'm³/h' },
  'air_changes_per_hour': { fr: 'ACH', en: 'ACH' },
  
  // Temps
  'seconds': { fr: 's', en: 's' },
  'minutes': { fr: 'min', en: 'min' },
  'hours': { fr: 'h', en: 'h' },
  'days': { fr: 'j', en: 'd' },
  
  // Autres
  'decibels': { fr: 'dB', en: 'dB' },
  'kilowatts': { fr: 'kW', en: 'kW' },
  'microsieverts_per_hour': { fr: 'µSv/h', en: 'µSv/h' },
  'fibers_per_cubic_centimeter': { fr: 'fibres/cm³', en: 'fibers/cm³' }
} as const;

// =================== ÉCHELLES COULEURS SPÉCIALISÉES ===================

export const GAS_COLOR_SCALES: Record<LocalGasType, ColorScale> = {
  oxygen: {
    name: 'Oxygen Levels',
    ranges: [
      { min: 0, max: 16, color: '#dc2626', label: { fr: 'Déficient', en: 'Deficient' }, severity: 'critical' },
      { min: 16, max: 19.5, color: '#ea580c', label: { fr: 'Faible', en: 'Low' }, severity: 'danger' },
      { min: 19.5, max: 23.5, color: '#059669', label: { fr: 'Normal', en: 'Normal' }, severity: 'safe' },
      { min: 23.5, max: 25, color: '#d97706', label: { fr: 'Enrichi', en: 'Enriched' }, severity: 'warning' },
      { min: 25, max: 100, color: '#dc2626', label: { fr: 'Dangereux', en: 'Dangerous' }, severity: 'critical' }
    ]
  },
  carbon_monoxide: {
    name: 'Carbon Monoxide',
    ranges: [
      { min: 0, max: 25, color: '#059669', label: { fr: 'Sécuritaire', en: 'Safe' }, severity: 'safe' },
      { min: 25, max: 50, color: '#eab308', label: { fr: 'Attention', en: 'Caution' }, severity: 'caution' },
      { min: 50, max: 200, color: '#ea580c', label: { fr: 'Avertissement', en: 'Warning' }, severity: 'warning' },
      { min: 200, max: 1000, color: '#dc2626', label: { fr: 'Danger', en: 'Danger' }, severity: 'danger' },
      { min: 1000, max: Infinity, color: '#7c2d12', label: { fr: 'Critique', en: 'Critical' }, severity: 'critical' }
    ]
  },
  hydrogen_sulfide: {
    name: 'Hydrogen Sulfide',
    ranges: [
      { min: 0, max: 1, color: '#059669', label: { fr: 'Sécuritaire', en: 'Safe' }, severity: 'safe' },
      { min: 1, max: 5, color: '#eab308', label: { fr: 'Attention', en: 'Caution' }, severity: 'caution' },
      { min: 5, max: 20, color: '#ea580c', label: { fr: 'Avertissement', en: 'Warning' }, severity: 'warning' },
      { min: 20, max: 100, color: '#dc2626', label: { fr: 'Danger', en: 'Danger' }, severity: 'danger' },
      { min: 100, max: Infinity, color: '#7c2d12', label: { fr: 'Critique', en: 'Critical' }, severity: 'critical' }
    ]
  },
  methane: {
    name: 'Methane (%LEL)',
    ranges: [
      { min: 0, max: 10, color: '#059669', label: { fr: 'Sécuritaire', en: 'Safe' }, severity: 'safe' },
      { min: 10, max: 25, color: '#eab308', label: { fr: 'Attention', en: 'Caution' }, severity: 'caution' },
      { min: 25, max: 50, color: '#ea580c', label: { fr: 'Avertissement', en: 'Warning' }, severity: 'warning' },
      { min: 50, max: 100, color: '#dc2626', label: { fr: 'Danger', en: 'Danger' }, severity: 'danger' },
      { min: 100, max: Infinity, color: '#7c2d12', label: { fr: 'Critique', en: 'Critical' }, severity: 'critical' }
    ]
  },
  propane: {
    name: 'Propane (%LEL)',
    ranges: [
      { min: 0, max: 10, color: '#059669', label: { fr: 'Sécuritaire', en: 'Safe' }, severity: 'safe' },
      { min: 10, max: 25, color: '#eab308', label: { fr: 'Attention', en: 'Caution' }, severity: 'caution' },
      { min: 25, max: 50, color: '#ea580c', label: { fr: 'Avertissement', en: 'Warning' }, severity: 'warning' },
      { min: 50, max: 100, color: '#dc2626', label: { fr: 'Danger', en: 'Danger' }, severity: 'danger' },
      { min: 100, max: Infinity, color: '#7c2d12', label: { fr: 'Critique', en: 'Critical' }, severity: 'critical' }
    ]
  },
  carbon_dioxide: {
    name: 'Carbon Dioxide',
    ranges: [
      { min: 0, max: 5000, color: '#059669', label: { fr: 'Sécuritaire', en: 'Safe' }, severity: 'safe' },
      { min: 5000, max: 10000, color: '#eab308', label: { fr: 'Attention', en: 'Caution' }, severity: 'caution' },
      { min: 10000, max: 30000, color: '#ea580c', label: { fr: 'Avertissement', en: 'Warning' }, severity: 'warning' },
      { min: 30000, max: 50000, color: '#dc2626', label: { fr: 'Danger', en: 'Danger' }, severity: 'danger' },
      { min: 50000, max: Infinity, color: '#7c2d12', label: { fr: 'Critique', en: 'Critical' }, severity: 'critical' }
    ]
  },
  ammonia: {
    name: 'Ammonia',
    ranges: [
      { min: 0, max: 25, color: '#059669', label: { fr: 'Sécuritaire', en: 'Safe' }, severity: 'safe' },
      { min: 25, max: 35, color: '#eab308', label: { fr: 'Attention', en: 'Caution' }, severity: 'caution' },
      { min: 35, max: 50, color: '#ea580c', label: { fr: 'Avertissement', en: 'Warning' }, severity: 'warning' },
      { min: 50, max: 300, color: '#dc2626', label: { fr: 'Danger', en: 'Danger' }, severity: 'danger' },
      { min: 300, max: Infinity, color: '#7c2d12', label: { fr: 'Critique', en: 'Critical' }, severity: 'critical' }
    ]
  },
  chlorine: {
    name: 'Chlorine',
    ranges: [
      { min: 0, max: 0.5, color: '#059669', label: { fr: 'Sécuritaire', en: 'Safe' }, severity: 'safe' },
      { min: 0.5, max: 1, color: '#eab308', label: { fr: 'Attention', en: 'Caution' }, severity: 'caution' },
      { min: 1, max: 3, color: '#ea580c', label: { fr: 'Avertissement', en: 'Warning' }, severity: 'warning' },
      { min: 3, max: 10, color: '#dc2626', label: { fr: 'Danger', en: 'Danger' }, severity: 'danger' },
      { min: 10, max: Infinity, color: '#7c2d12', label: { fr: 'Critique', en: 'Critical' }, severity: 'critical' }
    ]
  },
  nitrogen_dioxide: {
    name: 'Nitrogen Dioxide',
    ranges: [
      { min: 0, max: 3, color: '#059669', label: { fr: 'Sécuritaire', en: 'Safe' }, severity: 'safe' },
      { min: 3, max: 5, color: '#eab308', label: { fr: 'Attention', en: 'Caution' }, severity: 'caution' },
      { min: 5, max: 10, color: '#ea580c', label: { fr: 'Avertissement', en: 'Warning' }, severity: 'warning' },
      { min: 10, max: 20, color: '#dc2626', label: { fr: 'Danger', en: 'Danger' }, severity: 'danger' },
      { min: 20, max: Infinity, color: '#7c2d12', label: { fr: 'Critique', en: 'Critical' }, severity: 'critical' }
    ]
  },
  sulfur_dioxide: {
    name: 'Sulfur Dioxide',
    ranges: [
      { min: 0, max: 2, color: '#059669', label: { fr: 'Sécuritaire', en: 'Safe' }, severity: 'safe' },
      { min: 2, max: 5, color: '#eab308', label: { fr: 'Attention', en: 'Caution' }, severity: 'caution' },
      { min: 5, max: 10, color: '#ea580c', label: { fr: 'Avertissement', en: 'Warning' }, severity: 'warning' },
      { min: 10, max: 100, color: '#dc2626', label: { fr: 'Danger', en: 'Danger' }, severity: 'danger' },
      { min: 100, max: Infinity, color: '#7c2d12', label: { fr: 'Critique', en: 'Critical' }, severity: 'critical' }
    ]
  },
  benzene: {
    name: 'Benzene',
    ranges: [
      { min: 0, max: 0.5, color: '#059669', label: { fr: 'Sécuritaire', en: 'Safe' }, severity: 'safe' },
      { min: 0.5, max: 2.5, color: '#eab308', label: { fr: 'Attention', en: 'Caution' }, severity: 'caution' },
      { min: 2.5, max: 25, color: '#ea580c', label: { fr: 'Avertissement', en: 'Warning' }, severity: 'warning' },
      { min: 25, max: 500, color: '#dc2626', label: { fr: 'Danger', en: 'Danger' }, severity: 'danger' },
      { min: 500, max: Infinity, color: '#7c2d12', label: { fr: 'Critique', en: 'Critical' }, severity: 'critical' }
    ]
  },
  toluene: {
    name: 'Toluene',
    ranges: [
      { min: 0, max: 20, color: '#059669', label: { fr: 'Sécuritaire', en: 'Safe' }, severity: 'safe' },
      { min: 20, max: 50, color: '#eab308', label: { fr: 'Attention', en: 'Caution' }, severity: 'caution' },
      { min: 50, max: 200, color: '#ea580c', label: { fr: 'Avertissement', en: 'Warning' }, severity: 'warning' },
      { min: 200, max: 500, color: '#dc2626', label: { fr: 'Danger', en: 'Danger' }, severity: 'danger' },
      { min: 500, max: Infinity, color: '#7c2d12', label: { fr: 'Critique', en: 'Critical' }, severity: 'critical' }
    ]
  },
  xylene: {
    name: 'Xylene',
    ranges: [
      { min: 0, max: 100, color: '#059669', label: { fr: 'Sécuritaire', en: 'Safe' }, severity: 'safe' },
      { min: 100, max: 150, color: '#eab308', label: { fr: 'Attention', en: 'Caution' }, severity: 'caution' },
      { min: 150, max: 500, color: '#ea580c', label: { fr: 'Avertissement', en: 'Warning' }, severity: 'warning' },
      { min: 500, max: 900, color: '#dc2626', label: { fr: 'Danger', en: 'Danger' }, severity: 'danger' },
      { min: 900, max: Infinity, color: '#7c2d12', label: { fr: 'Critique', en: 'Critical' }, severity: 'critical' }
    ]
  },
  acetone: {
    name: 'Acetone',
    ranges: [
      { min: 0, max: 500, color: '#059669', label: { fr: 'Sécuritaire', en: 'Safe' }, severity: 'safe' },
      { min: 500, max: 750, color: '#eab308', label: { fr: 'Attention', en: 'Caution' }, severity: 'caution' },
      { min: 750, max: 1000, color: '#ea580c', label: { fr: 'Avertissement', en: 'Warning' }, severity: 'warning' },
      { min: 1000, max: 2500, color: '#dc2626', label: { fr: 'Danger', en: 'Danger' }, severity: 'danger' },
      { min: 2500, max: Infinity, color: '#7c2d12', label: { fr: 'Critique', en: 'Critical' }, severity: 'critical' }
    ]
  },
  formaldehyde: {
    name: 'Formaldehyde',
    ranges: [
      { min: 0, max: 0.1, color: '#059669', label: { fr: 'Sécuritaire', en: 'Safe' }, severity: 'safe' },
      { min: 0.1, max: 0.3, color: '#eab308', label: { fr: 'Attention', en: 'Caution' }, severity: 'caution' },
      { min: 0.3, max: 2, color: '#ea580c', label: { fr: 'Avertissement', en: 'Warning' }, severity: 'warning' },
      { min: 2, max: 20, color: '#dc2626', label: { fr: 'Danger', en: 'Danger' }, severity: 'danger' },
      { min: 20, max: Infinity, color: '#7c2d12', label: { fr: 'Critique', en: 'Critical' }, severity: 'critical' }
    ]
  }
};

export const ALARM_LEVEL_COLORS = {
  safe: '#059669',
  low: '#84cc16',
  medium: '#eab308',
  high: '#ea580c',
  danger: '#dc2626',
  critical: '#7c2d12',
  extreme: '#450a0a'
} as const;

export const PRIORITY_COLORS = {
  low: '#6b7280',
  medium: '#d97706',
  high: '#dc2626',
  critical: '#7c2d12',
  emergency: '#450a0a'
} as const;

// =================== MAPPINGS ICÔNES ===================

export const GAS_ICONS: Record<LocalGasType, string> = {
  oxygen: '🫁',
  carbon_monoxide: '☠️',
  hydrogen_sulfide: '🧪',
  methane: '🔥',
  propane: '⛽',
  carbon_dioxide: '💨',
  ammonia: '🔵',
  chlorine: '🟢',
  sulfur_dioxide: '🟡',
  nitrogen_dioxide: '🟤',
  benzene: '🧴',
  toluene: '🧴',
  xylene: '🧴',
  acetone: '🧴',
  formaldehyde: '⚠️'
};

export const ALARM_ICONS = {
  safe: '✅',
  low: '🟢',
  medium: '⚠️',
  high: '🟠',
  danger: '🔴',
  critical: '🚨',
  extreme: '💀'
} as const;

export const STATUS_ICONS = {
  draft: '📝',
  pending: '⏳',
  approved: '✅',
  rejected: '❌',
  expired: '⏰',
  suspended: '⏸️',
  completed: '🏁'
} as const;

// =================== CLASSE PRINCIPALE FORMATTERS ===================

export class DataFormatter {
  private static defaultOptions: FormattingOptions = {
    language: 'fr',
    locale: 'fr-CA',
    precision: 2,
    showUnit: true,
    compact: false,
    scientific: false,
    colorCoded: true,
    includeIcon: true,
    includeTooltip: false,
    timezone: 'America/Toronto',
    currency: 'CAD'
  };

  // =================== FORMATAGE NUMÉRIQUE ===================

  /**
   * Formater valeur numérique avec unité
   */
  static formatNumber(
    value: number,
    unit?: string,
    options?: Partial<FormattingOptions>
  ): FormattedValue {
    const opts = { ...this.defaultOptions, ...options };
    const locale = opts.locale || 'fr-CA';

    let formattedNumber: string;
    
    if (opts.scientific && (Math.abs(value) >= 1e6 || Math.abs(value) <= 1e-4)) {
      formattedNumber = value.toExponential(opts.precision);
    } else if (opts.compact && Math.abs(value) >= 1000) {
      formattedNumber = new Intl.NumberFormat(locale, {
        notation: 'compact',
        maximumFractionDigits: opts.precision
      }).format(value);
    } else {
      formattedNumber = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: opts.precision
      }).format(value);
    }

    const unitDisplay = unit && opts.showUnit ? 
      this.formatUnit(unit, opts.language) : '';

    const display = unitDisplay ? 
      `${formattedNumber} ${unitDisplay}` : formattedNumber;

    return {
      display,
      raw: value,
      unit: unitDisplay,
      accessibility: `${value} ${unit || ''}`
    };
  }

  /**
   * Formater lecture atmosphérique
   */
  static formatAtmosphericReading(
    reading: LocalAtmosphericReading,
    options?: Partial<FormattingOptions>
  ): FormattedValue {
    const opts = { ...this.defaultOptions, ...options };
    const gasScale = GAS_COLOR_SCALES[reading.gasType];
    
    // Déterminer couleur selon échelle
    const colorRange = gasScale?.ranges.find(range => 
      reading.value >= range.min && reading.value < range.max
    );

    // Formater valeur numérique
    const numberFormat = this.formatNumber(reading.value, reading.unit, opts);
    
    // Ajouter contexte gaz
    const icon = opts.includeIcon ? GAS_ICONS[reading.gasType] : '';
    const alarmIcon = opts.includeIcon ? ALARM_ICONS[reading.alarmLevel] : '';
    
    const display = opts.includeIcon ? 
      `${icon} ${numberFormat.display} ${alarmIcon}` : 
      numberFormat.display;

    // Tooltip informatif
    const tooltip = opts.includeTooltip ? 
      this.generateAtmosphericTooltip(reading, opts.language) : 
      undefined;

    return {
      display,
      raw: reading.value,
      unit: numberFormat.unit,
      color: opts.colorCoded ? colorRange?.color : undefined,
      icon: `${icon} ${alarmIcon}`.trim(),
      tooltip,
      accessibility: this.generateAtmosphericAccessibility(reading, opts.language),
      className: this.generateAtmosphericClassName(reading),
      metadata: {
        confidence: reading.confidence,
        lastUpdated: reading.timestamp,
        validated: reading.metadata?.qualityAssurance?.validated
      }
    };
  }

  /**
   * Formater niveau d'alarme
   */
  static formatAlarmLevel(
    alarmLevel: LocalAlarmLevel,
    options?: Partial<FormattingOptions>
  ): FormattedValue {
    const opts = { ...this.defaultOptions, ...options };
    
    const labels = {
      safe: { fr: 'Sécuritaire', en: 'Safe' },
      low: { fr: 'Faible', en: 'Low' },
      medium: { fr: 'Moyen', en: 'Medium' },
      high: { fr: 'Élevé', en: 'High' },
      danger: { fr: 'Danger', en: 'Danger' },
      critical: { fr: 'Critique', en: 'Critical' },
      extreme: { fr: 'Extrême', en: 'Extreme' }
    };

    const label = labels[alarmLevel][opts.language];
    const color = ALARM_LEVEL_COLORS[alarmLevel];
    const icon = opts.includeIcon ? ALARM_ICONS[alarmLevel] : '';
    
    const display = icon ? `${icon} ${label}` : label;

    return {
      display,
      raw: alarmLevel,
      color: opts.colorCoded ? color : undefined,
      icon,
      accessibility: `Alarm level: ${label}`,
      className: `alarm-${alarmLevel}`
    };
  }

  // =================== FORMATAGE TEMPOREL ===================

  /**
   * Formater timestamp avec options avancées
   */
  static formatTimestamp(
    timestamp: number,
    format: 'full' | 'date' | 'time' | 'relative' | 'compact' = 'full',
    options?: Partial<FormattingOptions>
  ): FormattedValue {
    const opts = { ...this.defaultOptions, ...options };
    const date = new Date(timestamp);
    const locale = opts.locale || 'fr-CA';
    
    let display: string;
    let accessibility: string;

    switch (format) {
      case 'full':
        display = new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: opts.timezone
        }).format(date);
        break;
        
      case 'date':
        display = new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          timeZone: opts.timezone
        }).format(date);
        break;
        
      case 'time':
        display = new Intl.DateTimeFormat(locale, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: opts.timezone
        }).format(date);
        break;
        
      case 'relative':
        display = this.formatRelativeTime(timestamp, opts.language);
        break;
        
      case 'compact':
        if (this.isToday(date)) {
          display = new Intl.DateTimeFormat(locale, {
            hour: '2-digit',
            minute: '2-digit'
          }).format(date);
        } else {
          display = new Intl.DateTimeFormat(locale, {
            month: 'short',
            day: 'numeric'
          }).format(date);
        }
        break;
        
      default:
        display = date.toISOString();
    }

    accessibility = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: opts.timezone
    }).format(date);

    return {
      display,
      raw: timestamp,
      accessibility,
      metadata: {
        lastUpdated: Date.now()
      }
    };
  }

  /**
   * Formater durée
   */
  static formatDuration(
    milliseconds: number,
    options?: Partial<FormattingOptions>
  ): FormattedValue {
    const opts = { ...this.defaultOptions, ...options };
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let display: string;
    
    if (days > 0) {
      const remainingHours = hours % 24;
      display = opts.language === 'fr' ? 
        `${days}j ${remainingHours}h` : 
        `${days}d ${remainingHours}h`;
    } else if (hours > 0) {
      const remainingMinutes = minutes % 60;
      display = `${hours}h ${remainingMinutes}min`;
    } else if (minutes > 0) {
      const remainingSeconds = seconds % 60;
      display = `${minutes}min ${remainingSeconds}s`;
    } else {
      display = `${seconds}s`;
    }

    return {
      display,
      raw: milliseconds,
      accessibility: display
    };
  }

  // =================== FORMATAGE PERSONNEL ===================

  /**
   * Formater données personnel
   */
  static formatPersonnelData(
    personnel: LocalPersonnelData,
    field: keyof LocalPersonnelData,
    options?: Partial<FormattingOptions>
  ): FormattedValue {
    const opts = { ...this.defaultOptions, ...options };
    const value = personnel[field];

    switch (field) {
      case 'personal':
        return {
          display: `${personnel.personal.firstName} ${personnel.personal.lastName}`,
          raw: value,
          accessibility: `Personnel: ${personnel.personal.firstName} ${personnel.personal.lastName}`
        };
        
      case 'role':
        const roleLabels = {
          supervisor: { fr: 'Superviseur', en: 'Supervisor' },
          safety_officer: { fr: 'Agent sécurité', en: 'Safety Officer' },
          entrant: { fr: 'Entrant', en: 'Entrant' },
          attendant: { fr: 'Surveillant', en: 'Attendant' }
        };
        const roleLabel = roleLabels[personnel.role]?.[opts.language] || personnel.role;
        return {
          display: roleLabel,
          raw: value,
          accessibility: `Role: ${roleLabel}`
        };
        
      default:
        return {
          display: String(value),
          raw: value,
          accessibility: String(value)
        };
    }
  }

  // =================== FORMATAGE POURCENTAGES ET RATIOS ===================

  /**
   * Formater pourcentage
   */
  static formatPercentage(
    value: number,
    options?: Partial<FormattingOptions>
  ): FormattedValue {
    const opts = { ...this.defaultOptions, ...options };
    const locale = opts.locale || 'fr-CA';
    
    const display = new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: opts.precision
    }).format(value / 100);

    return {
      display,
      raw: value,
      unit: '%',
      accessibility: `${value} percent`
    };
  }

  /**
   * Formater score de confiance
   */
  static formatConfidence(
    confidence: number,
    options?: Partial<FormattingOptions>
  ): FormattedValue {
    const opts = { ...this.defaultOptions, ...options };
    const percentage = this.formatPercentage(confidence * 100, opts);
    
    let color: string;
    let icon: string;
    
    if (confidence >= 0.9) {
      color = '#059669';
      icon = '🎯';
    } else if (confidence >= 0.7) {
      color = '#eab308';
      icon = '⚠️';
    } else {
      color = '#dc2626';
      icon = '❌';
    }

    return {
      display: opts.includeIcon ? `${icon} ${percentage.display}` : percentage.display,
      raw: confidence,
      unit: '%',
      color: opts.colorCoded ? color : undefined,
      icon: opts.includeIcon ? icon : undefined,
      accessibility: `Confidence: ${percentage.display}`
    };
  }

  // =================== FORMATAGE ADRESSES ET GÉOLOCALISATION ===================

  /**
   * Formater coordonnées GPS
   */
  static formatCoordinates(
    coordinates: { latitude: number; longitude: number; },
    format: 'decimal' | 'dms' = 'decimal',
    options?: Partial<FormattingOptions>
  ): FormattedValue {
    const opts = { ...this.defaultOptions, ...options };
    
    if (format === 'dms') {
      const latDMS = this.decimalToDMS(coordinates.latitude, 'latitude');
      const lonDMS = this.decimalToDMS(coordinates.longitude, 'longitude');
      const display = `${latDMS}, ${lonDMS}`;
      
      return {
        display,
        raw: coordinates,
        accessibility: `Coordinates: ${display}`
      };
    } else {
      const lat = coordinates.latitude.toFixed(opts.precision);
      const lon = coordinates.longitude.toFixed(opts.precision);
      const display = `${lat}, ${lon}`;
      
      return {
        display,
        raw: coordinates,
        accessibility: `Coordinates: ${lat} latitude, ${lon} longitude`
      };
    }
  }

  // =================== FORMATAGE DEVISES ===================

  /**
   * Formater montant monétaire
   */
  static formatCurrency(
    amount: number,
    currency: string = 'CAD',
    options?: Partial<FormattingOptions>
  ): FormattedValue {
    const opts = { ...this.defaultOptions, ...options };
    const locale = opts.locale || 'fr-CA';
    
    const display = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'CAD' ? 2 : 2,
      maximumFractionDigits: opts.precision
    }).format(amount);

    return {
      display,
      raw: amount,
      unit: currency,
      accessibility: `${amount} ${currency}`
    };
  }

  // =================== MÉTHODES UTILITAIRES PRIVÉES ===================

  private static formatUnit(unit: string, language: 'fr' | 'en'): string {
    const unitKey = unit.toLowerCase().replace(/[^a-z_]/g, '_') as keyof typeof UNIT_ABBREVIATIONS;
    return UNIT_ABBREVIATIONS[unitKey]?.[language] || unit;
  }

  private static generateAtmosphericTooltip(
    reading: LocalAtmosphericReading,
    language: 'fr' | 'en'
  ): string {
    const gasName = {
      oxygen: { fr: 'Oxygène', en: 'Oxygen' },
      carbon_monoxide: { fr: 'Monoxyde de carbone', en: 'Carbon monoxide' },
      hydrogen_sulfide: { fr: 'Sulfure d\'hydrogène', en: 'Hydrogen sulfide' },
      methane: { fr: 'Méthane', en: 'Methane' },
      propane: { fr: 'Propane', en: 'Propane' },
      carbon_dioxide: { fr: 'Dioxyde de carbone', en: 'Carbon dioxide' },
      ammonia: { fr: 'Ammoniac', en: 'Ammonia' },
      chlorine: { fr: 'Chlore', en: 'Chlorine' },
      nitrogen_dioxide: { fr: 'Dioxyde d\'azote', en: 'Nitrogen dioxide' },
      sulfur_dioxide: { fr: 'Dioxyde de soufre', en: 'Sulfur dioxide' },
      benzene: { fr: 'Benzène', en: 'Benzene' },
      toluene: { fr: 'Toluène', en: 'Toluene' },
      xylene: { fr: 'Xylène', en: 'Xylene' },
      acetone: { fr: 'Acétone', en: 'Acetone' },
      formaldehyde: { fr: 'Formaldéhyde', en: 'Formaldehyde' }
    };

    const gas = gasName[reading.gasType]?.[language] || reading.gasType;
    const time = this.formatTimestamp(reading.timestamp, 'time', { language }).display;
    
    if (language === 'fr') {
      return `${gas}: ${reading.value} ${reading.unit}\nMesuré à ${time}\nNiveau: ${reading.alarmLevel}\nConfiance: ${Math.round(reading.confidence * 100)}%`;
    } else {
      return `${gas}: ${reading.value} ${reading.unit}\nMeasured at ${time}\nLevel: ${reading.alarmLevel}\nConfidence: ${Math.round(reading.confidence * 100)}%`;
    }
  }

  private static generateAtmosphericAccessibility(
    reading: LocalAtmosphericReading,
    language: 'fr' | 'en'
  ): string {
    const alarmFormat = this.formatAlarmLevel(reading.alarmLevel, { language });
    
    if (language === 'fr') {
      return `Lecture atmosphérique: ${reading.gasType} ${reading.value} ${reading.unit}, niveau d'alarme ${alarmFormat.display}`;
    } else {
      return `Atmospheric reading: ${reading.gasType} ${reading.value} ${reading.unit}, alarm level ${alarmFormat.display}`;
    }
  }

  private static generateAtmosphericClassName(reading: LocalAtmosphericReading): string {
    return `atmospheric-reading gas-${reading.gasType} alarm-${reading.alarmLevel}`;
  }

  private static formatRelativeTime(timestamp: number, language: 'fr' | 'en'): string {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) {
      return language === 'fr' ? 'À l\'instant' : 'Just now';
    } else if (diffMinutes < 60) {
      return language === 'fr' ? 
        `Il y a ${diffMinutes} min` : 
        `${diffMinutes} min ago`;
    } else if (diffHours < 24) {
      return language === 'fr' ? 
        `Il y a ${diffHours}h` : 
        `${diffHours}h ago`;
    } else {
      return language === 'fr' ? 
        `Il y a ${diffDays}j` : 
        `${diffDays}d ago`;
    }
  }

  private static isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  private static decimalToDMS(decimal: number, type: 'latitude' | 'longitude'): string {
    const direction = decimal >= 0 ? 
      (type === 'latitude' ? 'N' : 'E') : 
      (type === 'latitude' ? 'S' : 'W');
    
    const absolute = Math.abs(decimal);
    const degrees = Math.floor(absolute);
    const minutes = Math.floor((absolute - degrees) * 60);
    const seconds = Math.round(((absolute - degrees) * 60 - minutes) * 60);
    
    return `${degrees}°${minutes}'${seconds}"${direction}`;
  }
}

// =================== FONCTIONS UTILITAIRES RAPIDES ===================

/**
 * Formater rapidement une valeur atmosphérique
 */
export function quickFormatAtmospheric(
  value: number,
  unit: string,
  gasType: LocalGasType,
  alarmLevel: LocalAlarmLevel,
  language: 'fr' | 'en' = 'fr'
): string {
  const reading: LocalAtmosphericReading = {
    id: 'temp',
    timestamp: Date.now(),
    gasType,
    value,
    unit,
    alarmLevel,
    confidence: 1,
    location: { coordinates: { latitude: 0, longitude: 0 }, point: 'temp' },
    environmentalConditions: { temperature: 20, humidity: 50, pressure: 101.3 },
    metadata: {
      equipment: { model: 'temp', serialNumber: 'temp', lastCalibration: 0, batteryLevel: 1 },
      operator: 'temp',
      qualityAssurance: { validated: true, flagged: false, notes: [] }
    }
  };

  return DataFormatter.formatAtmosphericReading(reading, { language }).display;
}

/**
 * Formater rapidement un timestamp
 */
export function quickFormatTime(
  timestamp: number,
  format: 'full' | 'relative' | 'compact' = 'relative',
  language: 'fr' | 'en' = 'fr'
): string {
  return DataFormatter.formatTimestamp(timestamp, format, { language }).display;
}

/**
 * Formater rapidement un pourcentage
 */
export function quickFormatPercent(
  value: number,
  precision: number = 1,
  language: 'fr' | 'en' = 'fr'
): string {
  return DataFormatter.formatPercentage(value, { precision, language }).display;
}

/**
 * Formater rapidement une devise
 */
export function quickFormatMoney(
  amount: number,
  currency: string = 'CAD',
  language: 'fr' | 'en' = 'fr'
): string {
  return DataFormatter.formatCurrency(amount, currency, { language }).display;
}

/**
 * Obtenir couleur pour niveau d'alarme
 */
export function getAlarmColor(alarmLevel: LocalAlarmLevel): string {
  return ALARM_LEVEL_COLORS[alarmLevel];
}

/**
 * Obtenir icône pour type de gaz
 */
export function getGasIcon(gasType: LocalGasType): string {
  return GAS_ICONS[gasType] || '🧪';
}

/**
 * Obtenir classe CSS pour lecture atmosphérique
 */
export function getAtmosphericClassName(
  gasType: LocalGasType,
  alarmLevel: LocalAlarmLevel
): string {
  return `atmospheric-reading gas-${gasType} alarm-${alarmLevel}`;
}

/**
 * Formater plage de valeurs
 */
export function formatRange(
  min: number,
  max: number,
  unit?: string,
  language: 'fr' | 'en' = 'fr'
): string {
  const separator = language === 'fr' ? ' à ' : ' to ';
  const unitDisplay = unit ? ` ${unit}` : '';
  return `${min}${separator}${max}${unitDisplay}`;
}

/**
 * Formater liste bilingue
 */
export function formatBilingualList(
  items: LocalBilingualText[],
  language: 'fr' | 'en' = 'fr',
  separator: string = ', '
): string {
  return items.map(item => item[language]).join(separator);
}

/**
 * Générer tooltip formaté
 */
export function generateTooltip(
  title: string,
  items: Array<{ label: string; value: string; }>
): string {
  const itemsText = items.map(item => `${item.label}: ${item.value}`).join('\n');
  return `${title}\n${itemsText}`;
}

// =================== EXPORTS ===================
export default DataFormatter;
