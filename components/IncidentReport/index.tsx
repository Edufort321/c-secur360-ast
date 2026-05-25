'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';
import {
  FileText, MapPin, User, Heart, AlignLeft, Truck, Search,
  CheckSquare, Scale, PenLine, ArrowLeft, Save, Send, Plus,
  Trash2, ChevronDown, ChevronUp, AlertTriangle, Shield,
  RotateCcw, CheckCircle, Clock, Car, Building2, Activity,
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// ── Types ────────────────────────────────────────────────────────────────────

export type IncidentType = 'accident' | 'near_miss' | 'vehicle' | 'property' | 'medical';
export type IncidentStatus = 'draft' | 'submitted' | 'closed';
export type Province = 'QC' | 'ON' | 'BC' | 'AB' | 'SK' | 'MB' | 'NB' | 'NS' | 'PE' | 'NL' | 'YT' | 'NT' | 'NU';

// Dynamic import du modèle corporel (MIT — react-body-highlighter)
const BodyModel = dynamic<{
  data: Array<{ name: string; muscles: string[]; frequency?: number }>;
  onClick?: (p: { muscle: string }) => void;
  type?: 'anterior' | 'posterior';
  highlightedColors?: string[];
  bodyColor?: string;
  style?: React.CSSProperties;
}>(
  () => import('react-body-highlighter').then(m => ({ default: m.default || (m as any) })),
  { ssr: false, loading: () => <div className="w-40 h-64 bg-gray-100 rounded-xl animate-pulse mx-auto" /> }
);

interface InjuredPerson {
  id: string;
  name: string;
  jobTitle: string;
  company: string;
  employeeId: string;
  phone: string;
  bodyRegions: string[];
  injuryType: string;
  injuryDescription: string;
  medicalTreatment: 'none' | 'first_aid' | 'clinic' | 'hospital' | 'emergency';
  lostTime: boolean;
  lostTimeDays: number;
  returnToWorkDate: string;
}

interface WitnessInfo {
  id: string;
  name: string;
  jobTitle: string;
  company: string;
  phone: string;
  statement: string;
}

interface CorrectiveAction {
  id: string;
  description: string;
  responsible: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface IncidentReportData {
  incidentType: IncidentType;
  province: Province;
  incidentDate: string;
  incidentTime: string;
  reportedDate: string;
  reportedBy: string;
  reportedByTitle: string;
  reportedByPhone: string;
  address: string;
  department: string;
  exactLocation: string;
  weatherConditions: string;
  lighting: string;
  injuredPersons: InjuredPerson[];
  witnesses: WitnessInfo[];
  description: string;
  immediateAction: string;
  workType: string;
  contributingFactors: string[];
  vehicleInvolved: boolean;
  vehicle: {
    vehicleId: string;
    licensePlate: string;
    make: string;
    model: string;
    year: string;
    kmAtIncident: string;
    collisionType: string;
    otherVehicle: boolean;
    otherVehicleDesc: string;
    policeReport: boolean;
    policeReportNumber: string;
    damageDescription: string;
  };
  propertyDamageInvolved: boolean;
  propertyDamage: {
    description: string;
    estimatedCost: string;
    location: string;
  };
  whyAnalysis: Array<{ question: string; answer: string }>;
  rootCause: string;
  correctiveActions: CorrectiveAction[];
  regulatoryNotified: boolean;
  regulatoryNotifiedDate: string;
  regulatoryReferenceNumber: string;
  supervisorName: string;
  supervisorDate: string;
  supervisorSigned: boolean;
  hseReviewerName: string;
  hseReviewerDate: string;
  hseReviewerSigned: boolean;
  managementName: string;
  managementDate: string;
  managementSigned: boolean;
}

export interface IncidentReportFormProps {
  tenant: string;
  reportId?: string;
  defaultType?: IncidentType;
  defaultProvince?: Province;
  onClose?: () => void;
  onSaved?: (id: string) => void;
  embedded?: boolean;
}

export interface DayCounter {
  tenant_id: string;
  last_accident_date: string | null;
  last_near_miss_date: string | null;
  accident_record_days: number;
  near_miss_record_days: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

// Libellés FR pour chaque zone anatomique (slugs de react-body-highlighter)
const MUSCLE_LABELS: Record<string, string> = {
  'head':            'Tête',
  'neck':            'Cou',
  'trapezius':       'Trapèze / Épaules',
  'front-deltoids':  'Épaule — avant',
  'back-deltoids':   'Épaule — arrière',
  'chest':           'Poitrine / Thorax',
  'biceps':          'Biceps (bras avant)',
  'triceps':         'Triceps (bras arrière)',
  'forearm':         'Avant-bras',
  'abs':             'Abdomen',
  'obliques':        'Flancs / Obliques',
  'upper-back':      'Haut du dos',
  'lower-back':      'Bas du dos',
  'gluteal':         'Fessier',
  'adductor':        'Adducteurs (intérieur cuisse)',
  'abductors':       'Abducteurs (hanche / extérieur)',
  'quadriceps':      'Quadriceps (cuisse avant)',
  'hamstring':       'Ischio-jambiers (cuisse arrière)',
  'knees':           'Genoux',
  'left-soleus':     'Mollet gauche',
  'right-soleus':    'Mollet droit',
};

const PROVINCE_INFO: Record<Province, {
  name: string; authority: string; deadline: string; form: string; requirements: string[]; territory?: boolean;
}> = {
  QC: {
    name: 'Québec', authority: 'CNESST',
    deadline: '48h (lésion avec arrêt) / 4h (blessure grave ou décès)',
    form: 'Avis de lésion professionnelle + Rapport d\'enquête d\'accident',
    requirements: [
      'Déclaration obligatoire à la CNESST pour toute lésion professionnelle (art. 267 LSST)',
      'Rapport d\'enquête requis dans les 15 jours suivant l\'accident',
      'Conserver les lieux pour enquête en cas d\'accident grave',
      'Offrir assignation temporaire dès que possible',
    ],
  },
  ON: {
    name: 'Ontario', authority: 'WSIB',
    deadline: '3 jours ouvrables (Form 7)',
    form: 'WSIB Form 7 — Employer\'s Report of Injury/Disease',
    requirements: [
      'Form 7 à soumettre dans les 3 jours ouvrables suivant la connaissance de la blessure',
      'Blessure critique ou décès : aviser le ministère du Travail dans 1 jour ouvrable',
      'Plan de retour au travail requis pour absences >7 jours',
      'Conformité à la Loi sur la sécurité professionnelle et l\'assurance contre les accidents du travail (LSPAAT)',
    ],
  },
  BC: {
    name: 'Colombie-Britannique', authority: 'WorkSafeBC',
    deadline: '3 jours (rapport employeur) / immédiat (blessure grave)',
    form: 'Form 7 — Employer\'s Report of Injury or Occupational Disease',
    requirements: [
      'Rapport à WorkSafeBC dans les 3 jours pour tout traitement médical requis',
      'Blessure grave ou décès : avis verbal immédiat à WorkSafeBC',
      'Enquête d\'incident dans les 24h pour incidents graves',
      'Conformité à la Workers Compensation Act',
    ],
  },
  AB: {
    name: 'Alberta', authority: 'WCB Alberta',
    deadline: '72 heures',
    form: 'C040 — Employer\'s Report of Injury/Illness',
    requirements: [
      'Rapport au WCB dans les 72h suivant la connaissance de la blessure',
      'Blessure grave ou décès : notifier OHS dans les 24h',
      'Décès au travail : notifier OHS immédiatement',
      'Conformité à l\'Occupational Health and Safety Act (OHSA)',
    ],
  },
  SK: {
    name: 'Saskatchewan', authority: 'WCB Saskatchewan',
    deadline: '5 jours ouvrables',
    form: 'Employer\'s Initial Report',
    requirements: [
      'Rapport dans les 5 jours ouvrables suivant la blessure',
      'Blessures graves : notifier OHS immédiatement',
      'Conformité à The Workers\' Compensation Act, 2013',
    ],
  },
  MB: {
    name: 'Manitoba', authority: 'WCB Manitoba',
    deadline: '5 jours ouvrables',
    form: 'Employer\'s Report of Injury',
    requirements: [
      'Rapport dans les 5 jours ouvrables',
      'Décès ou blessure critique : aviser la Division STST dans les 24h',
      'Conformité à The Workers Compensation Act',
    ],
  },
  NB: {
    name: 'Nouveau-Brunswick', authority: 'WorkSafeNB',
    deadline: '3 jours ouvrables',
    form: 'Employer\'s Report of Accident',
    requirements: [
      'Rapport dans les 3 jours ouvrables',
      'Blessure grave : notification immédiate',
      'Conformité à la Loi sur l\'indemnisation des accidents du travail',
    ],
  },
  NS: {
    name: 'Nouvelle-Écosse', authority: 'WCB Nova Scotia',
    deadline: '5 jours ouvrables',
    form: 'Employer\'s Injury Report',
    requirements: [
      'Rapport dans les 5 jours ouvrables',
      'Blessure grave : notification immédiate à NS Labour Standards',
      'Conformité à la Workers\' Compensation Act',
    ],
  },
  PE: {
    name: 'Île-du-Prince-Édouard', authority: 'WCB PEI',
    deadline: '5 jours ouvrables',
    form: 'Employer\'s Report of Injury',
    requirements: [
      'Rapport dans les 5 jours ouvrables',
      'Conformité à la Workers Compensation Act de l\'Î.-P.-É.',
    ],
  },
  NL: {
    name: 'Terre-Neuve-et-Labrador', authority: 'WorkplaceNL',
    deadline: '3 jours ouvrables',
    form: 'Employer\'s Report of Injury/Illness',
    requirements: [
      'Rapport dans les 3 jours ouvrables',
      'Blessure grave : notification immédiate',
      'Conformité à la Workplace Health, Safety and Compensation Act',
    ],
  },
  YT: {
    name: 'Yukon', authority: 'YWCHSB (Yukon Workers\' Compensation Health and Safety Board)',
    deadline: '3 jours ouvrables',
    form: 'Employer\'s Report of Injury or Occupational Disease',
    territory: true,
    requirements: [
      'Rapport à la YWCHSB dans les 3 jours ouvrables suivant la blessure',
      'Blessure grave ou décès : notification immédiate',
      'Conformité à la Workers\' Compensation Act (Yukon)',
      'Enquête d\'incident requise pour tout accident grave',
    ],
  },
  NT: {
    name: 'Territoires du Nord-Ouest', authority: 'WSCC (Workers\' Safety and Compensation Commission)',
    deadline: '3 jours ouvrables',
    form: 'Employer\'s Report of Accident/Injury (Form W1)',
    territory: true,
    requirements: [
      'Rapport à la WSCC dans les 3 jours ouvrables',
      'Blessure grave : aviser OHS dans les 24h (Sécurité au travail et indemnisation des travailleurs)',
      'Conformité à la Safety Act (T.N.-O.)',
      'Formulaire W1 à compléter pour toute blessure nécessitant des soins médicaux',
    ],
  },
  NU: {
    name: 'Nunavut', authority: 'WSCC (Workers\' Safety and Compensation Commission)',
    deadline: '3 jours ouvrables',
    form: 'Employer\'s Report of Accident/Injury (Form W1)',
    territory: true,
    requirements: [
      'Rapport à la WSCC dans les 3 jours ouvrables',
      'Blessure grave : aviser OHS dans les 24h',
      'Conformité à la Safety Act (Nunavut)',
      'Même commission que les T.N.-O. (WSCC) — wscc.nu.ca',
    ],
  },
};

const CONTRIBUTING_FACTORS = [
  'Comportement / acte dangereux',
  'Défaillance d\'équipement / outil',
  'Conditions environnementales',
  'Procédure absente ou non suivie',
  'Formation insuffisante',
  'Équipement de protection manquant',
  'Éclairage insuffisant',
  'Fatigue / stress',
  'Pression de temps',
  'Communication déficiente',
  'Entretien préventif insuffisant',
  'Autre',
];

const INJURY_TYPES = [
  'Fracture', 'Entorse / Foulure', 'Lacération / Coupure', 'Contusion',
  'Brûlure thermique', 'Brûlure chimique', 'Choc électrique', 'Commotion cérébrale',
  'Dislocation', 'Hernie', 'Intoxication / Empoisonnement', 'Corps étranger',
  'Écrasement', 'Amputation', 'Égratignure / Abrasion', 'Autre',
];

const WEATHER_CONDITIONS = [
  'Clair / ensoleillé', 'Nuageux', 'Pluie', 'Neige', 'Verglas',
  'Brouillard', 'Vent fort', 'Chaleur extrême', 'Froid extrême', 'Intérieur',
];

const COLLISION_TYPES = [
  'Collision frontale', 'Collision arrière', 'Collision latérale',
  'Renversement / tonneau', 'Collision avec piéton', 'Collision avec objet fixe',
  'Dommages au stationnement', 'Autre',
];

type SectionId = 'general' | 'location' | 'persons' | 'body' | 'description' | 'vehicle' | 'analysis' | 'actions' | 'compliance' | 'approval';

// ── Shared UI ────────────────────────────────────────────────────────────────

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-5 ${className}`}>{children}</div>;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, readOnly, type = 'text', className = '' }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  readOnly?: boolean; type?: string; className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent ${readOnly ? 'bg-gray-50 cursor-default' : 'bg-white'} ${className}`}
    />
  );
}

function SelectInput({ value, onChange, options, readOnly }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  readOnly?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={readOnly}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white disabled:bg-gray-50"
    >
      <option value="">— Sélectionner —</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Textarea({ value, onChange, placeholder, readOnly, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  readOnly?: boolean; rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      rows={rows}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-y ${readOnly ? 'bg-gray-50 cursor-default' : 'bg-white'}`}
    />
  );
}

function Toggle({ checked, onChange, label, disabled }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
        checked ? 'bg-red-50 border-red-300 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-600'
      } ${disabled ? 'opacity-50 cursor-default' : 'cursor-pointer hover:border-red-300'}`}
    >
      <div className={`w-8 h-4 rounded-full transition-colors relative ${checked ? 'bg-red-500' : 'bg-gray-300'}`}>
        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${checked ? 'left-4' : 'left-0.5'}`} />
      </div>
      {label}
    </button>
  );
}

// ── Body Diagram (react-body-highlighter — MIT) ───────────────────────────────

function BodyDiagram({ selected, onChange, readOnly }: {
  selected: string[];
  onChange: (sel: string[]) => void;
  readOnly: boolean;
}) {
  const [view, setView] = useState<'anterior' | 'posterior'>('anterior');

  // Construire le dataset pour surligner les zones sélectionnées
  const modelData = selected.length > 0
    ? [{ name: 'Blessures', muscles: selected, frequency: 2 }]
    : [];

  function handleClick({ muscle }: { muscle: string }) {
    if (readOnly) return;
    onChange(
      selected.includes(muscle)
        ? selected.filter(m => m !== muscle)
        : [...selected, muscle]
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Vue toggle */}
      <div className="flex gap-2 mb-4">
        {(['anterior', 'posterior'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              view === v
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-red-400'
            }`}
          >
            {v === 'anterior' ? 'Vue avant' : 'Vue arrière'}
          </button>
        ))}
      </div>

      {/* Modèle corporel SVG */}
      <div
        className="w-44 select-none"
        style={{ cursor: readOnly ? 'default' : 'pointer' }}
      >
        <BodyModel
          data={modelData}
          onClick={handleClick}
          type={view}
          highlightedColors={['#ef4444']}
          bodyColor="#dde3ea"
          style={{ width: '100%' }}
        />
      </div>

      {/* Indication */}
      {!readOnly && selected.length === 0 && (
        <p className="mt-3 text-xs text-gray-400 text-center">
          Cliquer sur les zones blessées du schéma
        </p>
      )}

      {/* Badges zones sélectionnées */}
      {selected.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5 justify-center max-w-xs">
          {selected.map(muscle => (
            <span
              key={muscle}
              className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs border border-red-200 font-medium"
            >
              {MUSCLE_LABELS[muscle] || muscle}
              {!readOnly && (
                <button
                  onClick={() => onChange(selected.filter(m => m !== muscle))}
                  className="hover:text-red-900 font-bold text-sm leading-none ml-0.5"
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Day Safety Counter (exported for use in list page) ────────────────────────

export function DaySafetyCounter({ label, lastDate, recordDays, onReset, readOnly, color = 'green' }: {
  label: string;
  lastDate: string | null;
  recordDays: number;
  onReset: () => void;
  readOnly?: boolean;
  color?: 'green' | 'orange';
}) {
  const days = lastDate
    ? Math.max(0, Math.floor((Date.now() - new Date(lastDate).getTime()) / 86400000))
    : 0;
  const isRecord = days > 0 && days >= recordDays && recordDays > 0;
  const colorCls = color === 'green' ? 'text-green-600' : 'text-orange-500';
  const bgCls = color === 'green' ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50';

  function fmt(d: string) {
    return new Date(d).toLocaleDateString('fr-CA', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  return (
    <div className={`rounded-xl border p-5 flex flex-col items-center text-center ${bgCls}`}>
      <div className={`text-6xl font-black leading-none mb-1 ${colorCls}`}>{days}</div>
      <div className="text-sm font-semibold text-gray-700 mb-1">{label}</div>
      {isRecord && (
        <div className="text-xs font-bold text-yellow-600 bg-yellow-100 border border-yellow-300 px-2 py-0.5 rounded-full mb-1">
          NOUVEAU RECORD !
        </div>
      )}
      <div className="text-xs text-gray-500 mb-3">
        Record : {Math.max(days, recordDays)} j
        {lastDate && <> &nbsp;·&nbsp; Dernier : {fmt(lastDate)}</>}
      </div>
      {!readOnly && (
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 border border-gray-300 hover:border-red-300 px-3 py-1 rounded-lg transition-colors"
        >
          <RotateCcw size={12} />
          Réinitialiser
        </button>
      )}
    </div>
  );
}

// ── Helper ───────────────────────────────────────────────────────────────────

function emptyPerson(): InjuredPerson {
  return {
    id: crypto.randomUUID(),
    name: '', jobTitle: '', company: '', employeeId: '', phone: '',
    bodyRegions: [], injuryType: '', injuryDescription: '',
    medicalTreatment: 'none', lostTime: false, lostTimeDays: 0, returnToWorkDate: '',
  };
}

function emptyWitness(): WitnessInfo {
  return { id: crypto.randomUUID(), name: '', jobTitle: '', company: '', phone: '', statement: '' };
}

function emptyAction(): CorrectiveAction {
  return { id: crypto.randomUUID(), description: '', responsible: '', dueDate: '', status: 'pending' };
}

function emptyReport(defaultType: IncidentType = 'accident', defaultProvince: Province = 'QC'): IncidentReportData {
  const today = new Date().toISOString().split('T')[0];
  return {
    incidentType: defaultType,
    province: defaultProvince,
    incidentDate: today,
    incidentTime: '',
    reportedDate: today,
    reportedBy: '',
    reportedByTitle: '',
    reportedByPhone: '',
    address: '',
    department: '',
    exactLocation: '',
    weatherConditions: '',
    lighting: '',
    injuredPersons: [],
    witnesses: [],
    description: '',
    immediateAction: '',
    workType: '',
    contributingFactors: [],
    vehicleInvolved: false,
    vehicle: {
      vehicleId: '', licensePlate: '', make: '', model: '', year: '',
      kmAtIncident: '', collisionType: '', otherVehicle: false, otherVehicleDesc: '',
      policeReport: false, policeReportNumber: '', damageDescription: '',
    },
    propertyDamageInvolved: false,
    propertyDamage: { description: '', estimatedCost: '', location: '' },
    whyAnalysis: [
      { question: 'Pourquoi l\'incident s\'est-il produit ?', answer: '' },
      { question: 'Pourquoi cette cause existe-t-elle ?', answer: '' },
      { question: 'Pourquoi cette cause fondamentale ?', answer: '' },
      { question: 'Pourquoi ce facteur systémique ?', answer: '' },
      { question: 'Cause racine ultime ?', answer: '' },
    ],
    rootCause: '',
    correctiveActions: [],
    regulatoryNotified: false,
    regulatoryNotifiedDate: '',
    regulatoryReferenceNumber: '',
    supervisorName: '', supervisorDate: '', supervisorSigned: false,
    hseReviewerName: '', hseReviewerDate: '', hseReviewerSigned: false,
    managementName: '', managementDate: '', managementSigned: false,
  };
}

function genReportNumber(type: IncidentType) {
  const prefix = type === 'near_miss' ? 'PP' : type === 'accident' ? 'AT' : type === 'vehicle' ? 'VH' : 'INC';
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `${prefix}-${year}-${seq}`;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function IncidentReportForm({
  tenant,
  reportId,
  defaultType = 'accident',
  defaultProvince = 'QC',
  onClose,
  onSaved,
  embedded = false,
}: IncidentReportFormProps) {
  const [section, setSection] = useState<SectionId>('general');
  const [report, setReport] = useState<IncidentReportData>(emptyReport(defaultType, defaultProvince));
  const [dbId, setDbId] = useState<string | null>(reportId ?? null);
  const [reportNumber, setReportNumber] = useState(genReportNumber(defaultType));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [status, setStatus] = useState<IncidentStatus>('draft');
  const [submitConfirm, setSubmitConfirm] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const readOnly = status === 'submitted' || status === 'closed';

  useEffect(() => {
    if (reportId) loadReport(reportId);
  }, [reportId]);

  async function loadReport(id: string) {
    if (!supabase) return;
    const { data } = await supabase
      .from('incident_reports')
      .select('*')
      .eq('id', id)
      .single();
    if (data) {
      setDbId(data.id);
      setReportNumber(data.report_number);
      setStatus(data.status);
      setReport(data.data as IncidentReportData);
    }
  }

  function updateReport(updater: (prev: IncidentReportData) => IncidentReportData) {
    setReport(prev => {
      const next = updater(prev);
      scheduleAutoSave(next);
      return next;
    });
  }

  function scheduleAutoSave(data: IncidentReportData) {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => doSave(data, false), 2000);
  }

  async function doSave(data: IncidentReportData, submit: boolean) {
    if (!supabase) return null;
    setSaving(true);
    const now = new Date().toISOString();
    const payload = {
      tenant_id: tenant,
      report_number: reportNumber,
      incident_type: data.incidentType,
      province: data.province,
      status: submit ? 'submitted' : status,
      data,
      updated_at: now,
      ...(submit ? { submitted_at: now } : {}),
    };

    let id = dbId;
    if (!id) {
      const { data: row, error } = await supabase
        .from('incident_reports')
        .insert({ ...payload, created_at: now })
        .select('id')
        .single();
      if (!error && row) {
        id = row.id;
        setDbId(id);
        onSaved?.(id!);
      }
    } else {
      await supabase.from('incident_reports').update(payload).eq('id', id);
    }

    if (submit && id) {
      await resetDayCounter(data.incidentType);
      setStatus('submitted');
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    return id;
  }

  async function resetDayCounter(type: IncidentType) {
    if (!supabase) return;
    const today = new Date().toISOString().split('T')[0];
    const field = type === 'near_miss' ? 'last_near_miss_date' : 'last_accident_date';
    const recordField = type === 'near_miss' ? 'near_miss_record_days' : 'accident_record_days';

    const { data: existing } = await supabase
      .from('incident_day_counters')
      .select('*')
      .eq('tenant_id', tenant)
      .single();

    if (existing) {
      const lastDate: string | null = existing[field];
      const prevRecord: number = existing[recordField] ?? 0;
      const daysSinceReset = lastDate
        ? Math.floor((Date.now() - new Date(lastDate).getTime()) / 86400000)
        : 0;
      const newRecord = Math.max(prevRecord, daysSinceReset);
      await supabase.from('incident_day_counters').update({
        [field]: today,
        [recordField]: newRecord,
        updated_at: new Date().toISOString(),
      }).eq('tenant_id', tenant);
    } else {
      await supabase.from('incident_day_counters').insert({
        tenant_id: tenant,
        [field]: today,
        [recordField]: 0,
        updated_at: new Date().toISOString(),
      });
    }
  }

  const SECTIONS: { id: SectionId; label: string; icon: React.ReactNode }[] = [
    { id: 'general',     label: 'Général',        icon: <FileText size={16} /> },
    { id: 'location',    label: 'Lieu',            icon: <MapPin size={16} /> },
    { id: 'persons',     label: 'Blessés',         icon: <User size={16} /> },
    { id: 'body',        label: 'Schéma corporel', icon: <Heart size={16} /> },
    { id: 'description', label: 'Description',     icon: <AlignLeft size={16} /> },
    { id: 'vehicle',     label: 'Véhicule',        icon: <Truck size={16} /> },
    { id: 'analysis',    label: 'Analyse',         icon: <Search size={16} /> },
    { id: 'actions',     label: 'Actions',         icon: <CheckSquare size={16} /> },
    { id: 'compliance',  label: 'Réglementation',  icon: <Scale size={16} /> },
    { id: 'approval',    label: 'Approbation',     icon: <PenLine size={16} /> },
  ];

  function renderSection() {
    switch (section) {
      case 'general':     return <GeneralSection     report={report} onChange={updateReport} readOnly={readOnly} />;
      case 'location':    return <LocationSection    report={report} onChange={updateReport} readOnly={readOnly} />;
      case 'persons':     return <PersonsSection     report={report} onChange={updateReport} readOnly={readOnly} />;
      case 'body':        return <BodySection        report={report} onChange={updateReport} readOnly={readOnly} />;
      case 'description': return <DescriptionSection report={report} onChange={updateReport} readOnly={readOnly} />;
      case 'vehicle':     return <VehicleSection     report={report} onChange={updateReport} readOnly={readOnly} />;
      case 'analysis':    return <AnalysisSection    report={report} onChange={updateReport} readOnly={readOnly} />;
      case 'actions':     return <ActionsSection     report={report} onChange={updateReport} readOnly={readOnly} />;
      case 'compliance':  return <ComplianceSection  report={report} onChange={updateReport} readOnly={readOnly} />;
      case 'approval':    return <ApprovalSection    report={report} onChange={updateReport} readOnly={readOnly} />;
    }
  }

  const typeLabels: Record<IncidentType, string> = {
    accident:  'Accident de travail',
    near_miss: 'Passé proche',
    vehicle:   'Accident de véhicule',
    property:  'Dommages matériels',
    medical:   'Maladie professionnelle',
  };

  const typeColors: Record<IncidentType, string> = {
    accident:  'bg-red-100 text-red-700 border-red-200',
    near_miss: 'bg-orange-100 text-orange-700 border-orange-200',
    vehicle:   'bg-blue-100 text-blue-700 border-blue-200',
    property:  'bg-purple-100 text-purple-700 border-purple-200',
    medical:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`bg-white border-b border-gray-200 sticky z-20 ${embedded ? 'top-20' : 'top-0'}`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {onClose && (
              <button onClick={onClose} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
                <ArrowLeft size={16} />
                Retour
              </button>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-gray-900 truncate">
                  {typeLabels[report.incidentType]}
                </h1>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${typeColors[report.incidentType]}`}>
                  {report.incidentType === 'near_miss' ? 'Passé proche' : report.incidentType.toUpperCase()}
                </span>
                <span className="text-xs text-gray-400">{reportNumber}</span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {status === 'draft' && 'Brouillon'}
                {status === 'submitted' && 'Soumis — lecture seule'}
                {status === 'closed' && 'Fermé'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {saving && <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12} />Enregistrement…</span>}
            {saved && !saving && <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle size={12} />Enregistré</span>}

            {!readOnly && (
              <>
                <button
                  onClick={() => doSave(report, false)}
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:border-gray-400 text-gray-600"
                >
                  <Save size={15} />
                  Sauvegarder
                </button>

                {!submitConfirm ? (
                  <button
                    onClick={() => setSubmitConfirm(true)}
                    className="flex items-center gap-1.5 text-sm px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                  >
                    <Send size={15} />
                    Soumettre
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-300 rounded-lg px-3 py-1.5">
                    <span className="text-xs text-red-700 font-medium">Confirmer la soumission ?</span>
                    <button
                      onClick={() => { doSave(report, true); setSubmitConfirm(false); }}
                      className="text-xs px-2 py-0.5 bg-red-600 text-white rounded font-medium"
                    >
                      Oui
                    </button>
                    <button onClick={() => setSubmitConfirm(false)} className="text-xs text-gray-500">Annuler</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar */}
        <div className="w-48 shrink-0">
          <nav className={`sticky space-y-1 ${embedded ? 'top-36' : 'top-20'}`}>
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                  section === s.id
                    ? 'bg-red-600 text-white font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}

// ── Section Components ────────────────────────────────────────────────────────

function GeneralSection({ report, onChange, readOnly }: {
  report: IncidentReportData;
  onChange: (u: (p: IncidentReportData) => IncidentReportData) => void;
  readOnly: boolean;
}) {
  const up = <K extends keyof IncidentReportData>(k: K, v: IncidentReportData[K]) =>
    onChange(p => ({ ...p, [k]: v }));

  const incidentTypes = [
    { value: 'accident',  label: 'Accident de travail' },
    { value: 'near_miss', label: 'Passé proche (sans blessure)' },
    { value: 'vehicle',   label: 'Accident de véhicule' },
    { value: 'property',  label: 'Dommages matériels' },
    { value: 'medical',   label: 'Maladie professionnelle' },
  ];

  const provinces: { value: Province; label: string; group?: string }[] = [
    // ─ Provinces
    { value: 'QC', label: 'Québec (CNESST)' },
    { value: 'ON', label: 'Ontario (WSIB)' },
    { value: 'BC', label: 'Colombie-Britannique (WorkSafeBC)' },
    { value: 'AB', label: 'Alberta (WCB)' },
    { value: 'SK', label: 'Saskatchewan (WCB-SK)' },
    { value: 'MB', label: 'Manitoba (WCB-MB)' },
    { value: 'NB', label: 'Nouveau-Brunswick (WorkSafeNB)' },
    { value: 'NS', label: 'Nouvelle-Écosse (WCB-NS)' },
    { value: 'PE', label: 'Île-du-Prince-Édouard (WCB-PEI)' },
    { value: 'NL', label: 'Terre-Neuve-et-Labrador (WorkplaceNL)' },
    // ─ Territoires
    { value: 'YT', label: 'Yukon (YWCHSB)' },
    { value: 'NT', label: 'Territoires du Nord-Ouest (WSCC)' },
    { value: 'NU', label: 'Nunavut (WSCC)' },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FileText size={18} className="text-red-500" />
          Informations générales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <Field label="Type d'incident" required>
            <SelectInput
              value={report.incidentType}
              onChange={v => up('incidentType', v as IncidentType)}
              options={incidentTypes}
              readOnly={readOnly}
            />
          </Field>
          <Field label="Province / territoire" required>
            <SelectInput
              value={report.province}
              onChange={v => up('province', v as Province)}
              options={provinces}
              readOnly={readOnly}
            />
          </Field>
          <Field label="Date de l'incident" required>
            <TextInput type="date" value={report.incidentDate} onChange={v => up('incidentDate', v)} readOnly={readOnly} />
          </Field>
          <Field label="Heure de l'incident">
            <TextInput type="time" value={report.incidentTime} onChange={v => up('incidentTime', v)} readOnly={readOnly} />
          </Field>
          <Field label="Date du rapport">
            <TextInput type="date" value={report.reportedDate} onChange={v => up('reportedDate', v)} readOnly={readOnly} />
          </Field>
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-gray-800 mb-4">Responsable du rapport</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6">
          <Field label="Nom" required>
            <TextInput value={report.reportedBy} onChange={v => up('reportedBy', v)} placeholder="Prénom Nom" readOnly={readOnly} />
          </Field>
          <Field label="Titre / Poste">
            <TextInput value={report.reportedByTitle} onChange={v => up('reportedByTitle', v)} placeholder="Contremaître, HSE..." readOnly={readOnly} />
          </Field>
          <Field label="Téléphone">
            <TextInput value={report.reportedByPhone} onChange={v => up('reportedByPhone', v)} placeholder="514-xxx-xxxx" readOnly={readOnly} />
          </Field>
        </div>
      </Card>

      {/* Province callout */}
      {report.province && PROVINCE_INFO[report.province] && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-blue-600 mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-blue-800 mb-1">
                {PROVINCE_INFO[report.province].authority} — Délai de déclaration : {PROVINCE_INFO[report.province].deadline}
              </div>
              <div className="text-xs text-blue-700">Formulaire requis : {PROVINCE_INFO[report.province].form}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LocationSection({ report, onChange, readOnly }: {
  report: IncidentReportData;
  onChange: (u: (p: IncidentReportData) => IncidentReportData) => void;
  readOnly: boolean;
}) {
  const up = <K extends keyof IncidentReportData>(k: K, v: IncidentReportData[K]) =>
    onChange(p => ({ ...p, [k]: v }));

  const weatherOpts = WEATHER_CONDITIONS.map(w => ({ value: w, label: w }));
  const lightingOpts = [
    { value: 'Bon éclairage', label: 'Bon éclairage' },
    { value: 'Éclairage insuffisant', label: 'Éclairage insuffisant' },
    { value: 'Absence de lumière', label: 'Absence de lumière' },
    { value: 'Lumière naturelle seulement', label: 'Lumière naturelle seulement' },
    { value: 'Éblouissement', label: 'Éblouissement' },
  ];

  return (
    <Card>
      <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <MapPin size={18} className="text-red-500" />
        Lieu de l'incident
      </h2>
      <div className="space-y-0">
        <Field label="Adresse complète" required>
          <TextInput value={report.address} onChange={v => up('address', v)} placeholder="123, rue Principale, Ville, QC" readOnly={readOnly} />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <Field label="Département / Unité">
            <TextInput value={report.department} onChange={v => up('department', v)} placeholder="Atelier, Chantier A, Bureau..." readOnly={readOnly} />
          </Field>
          <Field label="Emplacement précis">
            <TextInput value={report.exactLocation} onChange={v => up('exactLocation', v)} placeholder="Escalier nord, zone de chargement..." readOnly={readOnly} />
          </Field>
          <Field label="Conditions météo">
            <SelectInput value={report.weatherConditions} onChange={v => up('weatherConditions', v)} options={weatherOpts} readOnly={readOnly} />
          </Field>
          <Field label="Éclairage">
            <SelectInput value={report.lighting} onChange={v => up('lighting', v)} options={lightingOpts} readOnly={readOnly} />
          </Field>
        </div>
      </div>
    </Card>
  );
}

function PersonsSection({ report, onChange, readOnly }: {
  report: IncidentReportData;
  onChange: (u: (p: IncidentReportData) => IncidentReportData) => void;
  readOnly: boolean;
}) {
  function updatePerson(id: string, updater: (p: InjuredPerson) => InjuredPerson) {
    onChange(r => ({
      ...r,
      injuredPersons: r.injuredPersons.map(p => p.id === id ? updater(p) : p),
    }));
  }

  function addPerson() {
    onChange(r => ({ ...r, injuredPersons: [...r.injuredPersons, emptyPerson()] }));
  }

  function removePerson(id: string) {
    onChange(r => ({ ...r, injuredPersons: r.injuredPersons.filter(p => p.id !== id) }));
  }

  function updateWitness(id: string, updater: (w: WitnessInfo) => WitnessInfo) {
    onChange(r => ({
      ...r,
      witnesses: r.witnesses.map(w => w.id === id ? updater(w) : w),
    }));
  }

  const treatmentOpts = [
    { value: 'none',       label: 'Aucun traitement' },
    { value: 'first_aid',  label: 'Premiers soins sur place' },
    { value: 'clinic',     label: 'Clinique / médecin' },
    { value: 'hospital',   label: 'Hospitalisation' },
    { value: 'emergency',  label: 'Urgence / ambulance' },
  ];

  const injuryOpts = INJURY_TYPES.map(t => ({ value: t, label: t }));

  return (
    <div className="space-y-4">
      {/* Injured persons */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <User size={18} className="text-red-500" />
            Personnes blessées
          </h2>
          {!readOnly && (
            <button onClick={addPerson} className="flex items-center gap-1.5 text-sm text-red-600 border border-red-300 hover:bg-red-50 px-3 py-1.5 rounded-lg">
              <Plus size={14} />
              Ajouter
            </button>
          )}
        </div>

        {report.injuredPersons.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">
            {report.incidentType === 'near_miss' ? 'Aucune blessure (passé proche)' : 'Aucune personne blessée enregistrée'}
          </p>
        )}

        {report.injuredPersons.map((person, idx) => (
          <div key={person.id} className="border border-gray-200 rounded-lg p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Blessé #{idx + 1}</span>
              {!readOnly && (
                <button onClick={() => removePerson(person.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <Field label="Nom complet" required>
                <TextInput value={person.name} onChange={v => updatePerson(person.id, p => ({ ...p, name: v }))} placeholder="Prénom Nom" readOnly={readOnly} />
              </Field>
              <Field label="Titre / Poste">
                <TextInput value={person.jobTitle} onChange={v => updatePerson(person.id, p => ({ ...p, jobTitle: v }))} readOnly={readOnly} />
              </Field>
              <Field label="Employeur">
                <TextInput value={person.company} onChange={v => updatePerson(person.id, p => ({ ...p, company: v }))} readOnly={readOnly} />
              </Field>
              <Field label="# Employé">
                <TextInput value={person.employeeId} onChange={v => updatePerson(person.id, p => ({ ...p, employeeId: v }))} readOnly={readOnly} />
              </Field>
              <Field label="Téléphone">
                <TextInput value={person.phone} onChange={v => updatePerson(person.id, p => ({ ...p, phone: v }))} readOnly={readOnly} />
              </Field>
              <Field label="Type de blessure">
                <SelectInput value={person.injuryType} onChange={v => updatePerson(person.id, p => ({ ...p, injuryType: v }))} options={injuryOpts} readOnly={readOnly} />
              </Field>
              <Field label="Traitement médical">
                <SelectInput value={person.medicalTreatment} onChange={v => updatePerson(person.id, p => ({ ...p, medicalTreatment: v as InjuredPerson['medicalTreatment'] }))} options={treatmentOpts} readOnly={readOnly} />
              </Field>
            </div>
            <Field label="Description de la blessure">
              <Textarea value={person.injuryDescription} onChange={v => updatePerson(person.id, p => ({ ...p, injuryDescription: v }))} placeholder="Décrire la nature et la localisation de la blessure…" readOnly={readOnly} rows={2} />
            </Field>
            <div className="flex items-center gap-4 mt-2">
              <Toggle
                checked={person.lostTime}
                onChange={v => updatePerson(person.id, p => ({ ...p, lostTime: v }))}
                label="Perte de temps"
                disabled={readOnly}
              />
              {person.lostTime && (
                <div className="flex items-center gap-2">
                  <TextInput
                    type="number"
                    value={String(person.lostTimeDays)}
                    onChange={v => updatePerson(person.id, p => ({ ...p, lostTimeDays: parseInt(v) || 0 }))}
                    placeholder="Jours"
                    readOnly={readOnly}
                    className="w-20"
                  />
                  <span className="text-xs text-gray-500">jours d'absence</span>
                  <TextInput
                    type="date"
                    value={person.returnToWorkDate}
                    onChange={v => updatePerson(person.id, p => ({ ...p, returnToWorkDate: v }))}
                    readOnly={readOnly}
                    className="w-36"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </Card>

      {/* Witnesses */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Témoins</h2>
          {!readOnly && (
            <button
              onClick={() => onChange(r => ({ ...r, witnesses: [...r.witnesses, emptyWitness()] }))}
              className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded-lg"
            >
              <Plus size={14} />
              Ajouter
            </button>
          )}
        </div>
        {report.witnesses.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">Aucun témoin enregistré</p>
        )}
        {report.witnesses.map((w, idx) => (
          <div key={w.id} className="border border-gray-200 rounded-lg p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Témoin #{idx + 1}</span>
              {!readOnly && (
                <button onClick={() => onChange(r => ({ ...r, witnesses: r.witnesses.filter(x => x.id !== w.id) }))} className="text-red-400 hover:text-red-600">
                  <Trash2 size={15} />
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 mb-2">
              <Field label="Nom">
                <TextInput value={w.name} onChange={v => updateWitness(w.id, x => ({ ...x, name: v }))} readOnly={readOnly} />
              </Field>
              <Field label="Poste">
                <TextInput value={w.jobTitle} onChange={v => updateWitness(w.id, x => ({ ...x, jobTitle: v }))} readOnly={readOnly} />
              </Field>
              <Field label="Téléphone">
                <TextInput value={w.phone} onChange={v => updateWitness(w.id, x => ({ ...x, phone: v }))} readOnly={readOnly} />
              </Field>
            </div>
            <Field label="Déclaration">
              <Textarea value={w.statement} onChange={v => updateWitness(w.id, x => ({ ...x, statement: v }))} placeholder="Déclaration du témoin…" readOnly={readOnly} rows={2} />
            </Field>
          </div>
        ))}
      </Card>
    </div>
  );
}

function BodySection({ report, onChange, readOnly }: {
  report: IncidentReportData;
  onChange: (u: (p: IncidentReportData) => IncidentReportData) => void;
  readOnly: boolean;
}) {
  const [personIdx, setPersonIdx] = useState(0);

  if (report.injuredPersons.length === 0) {
    return (
      <Card>
        <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Heart size={18} className="text-red-500" />
          Schéma corporel
        </h2>
        <p className="text-sm text-gray-400 text-center py-8">
          Aucune personne blessée — ajoutez une personne dans l'onglet «Blessés» pour localiser les blessures.
        </p>
      </Card>
    );
  }

  const safeIdx = Math.min(personIdx, report.injuredPersons.length - 1);
  const person = report.injuredPersons[safeIdx];

  return (
    <Card>
      <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Heart size={18} className="text-red-500" />
        Schéma corporel
      </h2>

      {report.injuredPersons.length > 1 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {report.injuredPersons.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setPersonIdx(i)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                personIdx === i ? 'bg-red-600 text-white border-red-600' : 'border-gray-300 text-gray-600 hover:border-red-300'
              }`}
            >
              {p.name || `Blessé #${i + 1}`}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col items-center">
        <p className="text-sm text-gray-600 mb-4 text-center">
          Cliquer sur les zones blessées pour <strong>{person.name || `Blessé #${safeIdx + 1}`}</strong>
        </p>
        <BodyDiagram
          selected={person.bodyRegions}
          onChange={sel => onChange(r => ({
            ...r,
            injuredPersons: r.injuredPersons.map((p, i) =>
              i === safeIdx ? { ...p, bodyRegions: sel } : p
            ),
          }))}
          readOnly={readOnly}
        />
      </div>
    </Card>
  );
}

function DescriptionSection({ report, onChange, readOnly }: {
  report: IncidentReportData;
  onChange: (u: (p: IncidentReportData) => IncidentReportData) => void;
  readOnly: boolean;
}) {
  const up = <K extends keyof IncidentReportData>(k: K, v: IncidentReportData[K]) =>
    onChange(p => ({ ...p, [k]: v }));

  function toggleFactor(f: string) {
    onChange(r => ({
      ...r,
      contributingFactors: r.contributingFactors.includes(f)
        ? r.contributingFactors.filter(x => x !== f)
        : [...r.contributingFactors, f],
    }));
  }

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <AlignLeft size={18} className="text-red-500" />
          Description de l'événement
        </h2>
        <Field label="Type de travail effectué au moment de l'incident">
          <TextInput value={report.workType} onChange={v => up('workType', v)} placeholder="Entretien, installation, conduite, manutention…" readOnly={readOnly} />
        </Field>
        <Field label="Narration de l'incident" required>
          <Textarea
            value={report.description}
            onChange={v => up('description', v)}
            placeholder="Décrire chronologiquement et précisément les événements. Inclure ce qui s'est passé, comment et où…"
            readOnly={readOnly}
            rows={6}
          />
        </Field>
        <Field label="Actions immédiates prises">
          <Textarea
            value={report.immediateAction}
            onChange={v => up('immediateAction', v)}
            placeholder="Premiers secours, évacuation, mise hors service de l'équipement, appel d'urgence…"
            readOnly={readOnly}
            rows={3}
          />
        </Field>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-gray-800 mb-3">Facteurs contributifs</h2>
        <div className="flex flex-wrap gap-2">
          {CONTRIBUTING_FACTORS.map(f => {
            const active = report.contributingFactors.includes(f);
            return (
              <button
                key={f}
                onClick={() => !readOnly && toggleFactor(f)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  active ? 'bg-red-100 border-red-400 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-400'
                } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function VehicleSection({ report, onChange, readOnly }: {
  report: IncidentReportData;
  onChange: (u: (p: IncidentReportData) => IncidentReportData) => void;
  readOnly: boolean;
}) {
  const upV = <K extends keyof IncidentReportData['vehicle']>(k: K, v: IncidentReportData['vehicle'][K]) =>
    onChange(r => ({ ...r, vehicle: { ...r.vehicle, [k]: v } }));
  const upP = <K extends keyof IncidentReportData['propertyDamage']>(k: K, v: IncidentReportData['propertyDamage'][K]) =>
    onChange(r => ({ ...r, propertyDamage: { ...r.propertyDamage, [k]: v } }));

  const collisionOpts = COLLISION_TYPES.map(c => ({ value: c, label: c }));

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Truck size={18} className="text-red-500" />
          <h2 className="text-base font-semibold text-gray-800">Véhicule impliqué</h2>
          <Toggle
            checked={report.vehicleInvolved}
            onChange={v => onChange(r => ({ ...r, vehicleInvolved: v }))}
            label={report.vehicleInvolved ? 'Oui' : 'Non'}
            disabled={readOnly}
          />
        </div>

        {report.vehicleInvolved && (
          <div className="space-y-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
              <Field label="Plaque d'immatriculation">
                <TextInput value={report.vehicle.licensePlate} onChange={v => upV('licensePlate', v)} readOnly={readOnly} />
              </Field>
              <Field label="Marque">
                <TextInput value={report.vehicle.make} onChange={v => upV('make', v)} readOnly={readOnly} />
              </Field>
              <Field label="Modèle">
                <TextInput value={report.vehicle.model} onChange={v => upV('model', v)} readOnly={readOnly} />
              </Field>
              <Field label="Année">
                <TextInput value={report.vehicle.year} onChange={v => upV('year', v)} readOnly={readOnly} />
              </Field>
              <Field label="Kilométrage au moment">
                <TextInput value={report.vehicle.kmAtIncident} onChange={v => upV('kmAtIncident', v)} placeholder="km" readOnly={readOnly} />
              </Field>
              <Field label="Type de collision">
                <SelectInput value={report.vehicle.collisionType} onChange={v => upV('collisionType', v)} options={collisionOpts} readOnly={readOnly} />
              </Field>
            </div>
            <div className="flex flex-wrap gap-3 mt-2 mb-3">
              <Toggle checked={report.vehicle.otherVehicle} onChange={v => upV('otherVehicle', v)} label="Autre véhicule impliqué" disabled={readOnly} />
              <Toggle checked={report.vehicle.policeReport} onChange={v => upV('policeReport', v)} label="Rapport de police" disabled={readOnly} />
            </div>
            {report.vehicle.otherVehicle && (
              <Field label="Description de l'autre véhicule">
                <TextInput value={report.vehicle.otherVehicleDesc} onChange={v => upV('otherVehicleDesc', v)} readOnly={readOnly} />
              </Field>
            )}
            {report.vehicle.policeReport && (
              <Field label="Numéro du rapport de police">
                <TextInput value={report.vehicle.policeReportNumber} onChange={v => upV('policeReportNumber', v)} readOnly={readOnly} />
              </Field>
            )}
            <Field label="Description des dommages">
              <Textarea value={report.vehicle.damageDescription} onChange={v => upV('damageDescription', v)} readOnly={readOnly} rows={3} />
            </Field>
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Building2 size={18} className="text-red-500" />
          <h2 className="text-base font-semibold text-gray-800">Dommages matériels</h2>
          <Toggle
            checked={report.propertyDamageInvolved}
            onChange={v => onChange(r => ({ ...r, propertyDamageInvolved: v }))}
            label={report.propertyDamageInvolved ? 'Oui' : 'Non'}
            disabled={readOnly}
          />
        </div>

        {report.propertyDamageInvolved && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Field label="Localisation des dommages">
              <TextInput value={report.propertyDamage.location} onChange={v => upP('location', v)} readOnly={readOnly} />
            </Field>
            <Field label="Coût estimé ($)">
              <TextInput value={report.propertyDamage.estimatedCost} onChange={v => upP('estimatedCost', v)} placeholder="0.00" readOnly={readOnly} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Description des dommages">
                <Textarea value={report.propertyDamage.description} onChange={v => upP('description', v)} readOnly={readOnly} rows={3} />
              </Field>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function AnalysisSection({ report, onChange, readOnly }: {
  report: IncidentReportData;
  onChange: (u: (p: IncidentReportData) => IncidentReportData) => void;
  readOnly: boolean;
}) {
  const up = <K extends keyof IncidentReportData>(k: K, v: IncidentReportData[K]) =>
    onChange(p => ({ ...p, [k]: v }));

  function updateWhy(idx: number, answer: string) {
    onChange(r => {
      const newWhy = [...r.whyAnalysis];
      newWhy[idx] = { ...newWhy[idx], answer };
      return { ...r, whyAnalysis: newWhy };
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-base font-semibold text-gray-800 mb-1 flex items-center gap-2">
          <Search size={18} className="text-red-500" />
          Méthode des 5 Pourquoi
        </h2>
        <p className="text-xs text-gray-500 mb-4">Remonter la chaîne causale jusqu'à la cause racine en répondant à chaque «Pourquoi».</p>

        {report.whyAnalysis.map((why, idx) => (
          <div key={idx} className="mb-3">
            <div className="flex items-start gap-2">
              <div className={`mt-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                why.answer ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {idx + 1}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700 mb-1">{why.question}</div>
                <Textarea
                  value={why.answer}
                  onChange={v => updateWhy(idx, v)}
                  placeholder="Réponse…"
                  readOnly={readOnly}
                  rows={2}
                />
              </div>
            </div>
            {idx < report.whyAnalysis.length - 1 && (
              <div className="ml-9 text-gray-300 text-lg leading-none my-1">↓</div>
            )}
          </div>
        ))}
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-gray-800 mb-3">Cause racine identifiée</h2>
        <Textarea
          value={report.rootCause}
          onChange={v => up('rootCause', v)}
          placeholder="Suite à l'analyse des 5 Pourquoi, la cause racine est…"
          readOnly={readOnly}
          rows={3}
        />
      </Card>
    </div>
  );
}

function ActionsSection({ report, onChange, readOnly }: {
  report: IncidentReportData;
  onChange: (u: (p: IncidentReportData) => IncidentReportData) => void;
  readOnly: boolean;
}) {
  function updateAction(id: string, updater: (a: CorrectiveAction) => CorrectiveAction) {
    onChange(r => ({
      ...r,
      correctiveActions: r.correctiveActions.map(a => a.id === id ? updater(a) : a),
    }));
  }

  const statusOpts = [
    { value: 'pending',     label: 'En attente' },
    { value: 'in_progress', label: 'En cours' },
    { value: 'completed',   label: 'Complété' },
  ];

  const statusColors: Record<string, string> = {
    pending:     'bg-gray-100 text-gray-600',
    in_progress: 'bg-orange-100 text-orange-700',
    completed:   'bg-green-100 text-green-700',
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <CheckSquare size={18} className="text-red-500" />
          Actions correctives
        </h2>
        {!readOnly && (
          <button
            onClick={() => onChange(r => ({ ...r, correctiveActions: [...r.correctiveActions, emptyAction()] }))}
            className="flex items-center gap-1.5 text-sm text-red-600 border border-red-300 hover:bg-red-50 px-3 py-1.5 rounded-lg"
          >
            <Plus size={14} />
            Ajouter
          </button>
        )}
      </div>

      {report.correctiveActions.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">Aucune action corrective enregistrée</p>
      )}

      {report.correctiveActions.map((action, idx) => (
        <div key={action.id} className="border border-gray-200 rounded-lg p-3 mb-2 grid grid-cols-1 md:grid-cols-4 gap-3 items-start">
          <div className="md:col-span-2">
            <div className="text-xs text-gray-500 mb-1">Action #{idx + 1}</div>
            <Textarea
              value={action.description}
              onChange={v => updateAction(action.id, a => ({ ...a, description: v }))}
              placeholder="Décrire l'action corrective…"
              readOnly={readOnly}
              rows={2}
            />
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Responsable</div>
            <TextInput value={action.responsible} onChange={v => updateAction(action.id, a => ({ ...a, responsible: v }))} readOnly={readOnly} />
            <div className="text-xs text-gray-500 mb-1 mt-2">Échéance</div>
            <TextInput type="date" value={action.dueDate} onChange={v => updateAction(action.id, a => ({ ...a, dueDate: v }))} readOnly={readOnly} />
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-xs text-gray-500">Statut</div>
            <div className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${statusColors[action.status]}`}>
              {statusOpts.find(s => s.value === action.status)?.label}
            </div>
            {!readOnly && (
              <select
                value={action.status}
                onChange={e => updateAction(action.id, a => ({ ...a, status: e.target.value as CorrectiveAction['status'] }))}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
              >
                {statusOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            )}
            {!readOnly && (
              <button
                onClick={() => onChange(r => ({ ...r, correctiveActions: r.correctiveActions.filter(a => a.id !== action.id) }))}
                className="text-red-400 hover:text-red-600 text-xs flex items-center gap-1"
              >
                <Trash2 size={12} />
                Retirer
              </button>
            )}
          </div>
        </div>
      ))}
    </Card>
  );
}

function ComplianceSection({ report, onChange, readOnly }: {
  report: IncidentReportData;
  onChange: (u: (p: IncidentReportData) => IncidentReportData) => void;
  readOnly: boolean;
}) {
  const up = <K extends keyof IncidentReportData>(k: K, v: IncidentReportData[K]) =>
    onChange(p => ({ ...p, [k]: v }));

  const info = PROVINCE_INFO[report.province];

  return (
    <div className="space-y-4">
      {info && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <Scale size={20} className="text-red-600 mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-bold text-red-800 mb-2">
                {info.authority} — {info.name}
              </div>
              <div className="text-xs font-semibold text-red-700 mb-1">
                Délai de déclaration : {info.deadline}
              </div>
              <div className="text-xs text-red-700 mb-2">
                Formulaire : {info.form}
              </div>
              <ul className="space-y-1">
                {info.requirements.map((r, i) => (
                  <li key={i} className="text-xs text-red-700 flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <Card>
        <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Scale size={18} className="text-red-500" />
          Notification réglementaire
        </h2>
        <div className="flex items-center gap-3 mb-4">
          <Toggle
            checked={report.regulatoryNotified}
            onChange={v => up('regulatoryNotified', v)}
            label={report.regulatoryNotified ? 'Autorité notifiée' : 'Autorité non encore notifiée'}
            disabled={readOnly}
          />
        </div>
        {report.regulatoryNotified && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <Field label="Date de notification">
              <TextInput type="date" value={report.regulatoryNotifiedDate} onChange={v => up('regulatoryNotifiedDate', v)} readOnly={readOnly} />
            </Field>
            <Field label="Numéro de référence">
              <TextInput value={report.regulatoryReferenceNumber} onChange={v => up('regulatoryReferenceNumber', v)} placeholder="Ex : CNESST-2026-XXXXX" readOnly={readOnly} />
            </Field>
          </div>
        )}
      </Card>
    </div>
  );
}

function ApprovalSection({ report, onChange, readOnly }: {
  report: IncidentReportData;
  onChange: (u: (p: IncidentReportData) => IncidentReportData) => void;
  readOnly: boolean;
}) {
  const up = <K extends keyof IncidentReportData>(k: K, v: IncidentReportData[K]) =>
    onChange(p => ({ ...p, [k]: v }));

  interface Signatory {
    nameKey: keyof IncidentReportData;
    dateKey: keyof IncidentReportData;
    signedKey: keyof IncidentReportData;
    label: string;
  }

  const signatories: Signatory[] = [
    { nameKey: 'supervisorName', dateKey: 'supervisorDate', signedKey: 'supervisorSigned', label: 'Superviseur immédiat' },
    { nameKey: 'hseReviewerName', dateKey: 'hseReviewerDate', signedKey: 'hseReviewerSigned', label: 'Responsable HSE' },
    { nameKey: 'managementName', dateKey: 'managementDate', signedKey: 'managementSigned', label: 'Direction' },
  ];

  return (
    <Card>
      <h2 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
        <PenLine size={18} className="text-red-500" />
        Approbation
      </h2>

      <div className="space-y-4">
        {signatories.map(s => {
          const signed = report[s.signedKey] as boolean;
          return (
            <div key={s.nameKey} className={`border rounded-xl p-4 transition-colors ${signed ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">{s.label}</span>
                <div className="flex items-center gap-2">
                  {signed && <CheckCircle size={16} className="text-green-600" />}
                  <Toggle
                    checked={signed}
                    onChange={v => up(s.signedKey, v)}
                    label={signed ? 'Approuvé' : 'En attente'}
                    disabled={readOnly}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <Field label="Nom">
                  <TextInput value={report[s.nameKey] as string} onChange={v => up(s.nameKey, v)} readOnly={readOnly} />
                </Field>
                <Field label="Date">
                  <TextInput type="date" value={report[s.dateKey] as string} onChange={v => up(s.dateKey, v)} readOnly={readOnly} />
                </Field>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
