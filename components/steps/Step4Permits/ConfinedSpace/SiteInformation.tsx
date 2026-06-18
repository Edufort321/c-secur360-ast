'use client';

import React, { useState } from 'react';
import {
  MapPin, Building, Calendar, Clock, Users, FileText, Layers,
  Ruler, AlertTriangle, Wind, Flame, Zap, Droplets, ChevronDown, ChevronUp, Plus, X
} from 'lucide-react';
import { ConfinedSpacePermit, ProvinceCode } from './SafetyManager';
import { EntitySearch, type EntityOption } from '@/components/ui/EntitySearch';

// ── Types ──────────────────────────────────────────────────────────────────
type Language = 'fr' | 'en';

interface Props {
  language: Language;
  permitData: ConfinedSpacePermit;
  selectedProvince: ProvinceCode;
  readOnly?: boolean;
  personnel?: EntityOption[];
  projects?: EntityOption[];
  suppliers?: EntityOption[];
  onUpdate: (data: Partial<ConfinedSpacePermit['siteInformation']>) => void;
}

// ── Translations ───────────────────────────────────────────────────────────
const T = {
  fr: {
    sections: {
      project: 'Informations du projet',
      space: "Identification de l'espace clos",
      dimensions: 'Dimensions et volume',
      hazards: 'Évaluation des dangers',
      safety: 'Mesures de sécurité',
    },
    projectNumber: 'Numéro de projet',
    projectNumberPh: 'EX-2024-001',
    workLocation: 'Lieu des travaux',
    workLocationPh: 'Adresse ou description du lieu',
    contractor: 'Entrepreneur',
    contractorPh: "Nom de l'entreprise",
    supervisor: 'Superviseur responsable',
    supervisorPh: 'Prénom et nom',
    entryDate: "Date d'entrée prévue",
    duration: 'Durée estimée',
    durationPh: 'ex. 4h, 2 jours',
    workerCount: 'Nombre de travailleurs',
    workDescription: 'Description des travaux',
    workDescriptionPh: "Décrivez les travaux à effectuer dans l'espace clos…",
    spaceType: "Type d'espace clos",
    spaceTypes: {
      tank: 'Réservoir',
      vessel: 'Cuve / Récipient',
      silo: 'Silo',
      pit: 'Fosse',
      vault: 'Voûte',
      tunnel: 'Tunnel',
      trench: 'Tranchée',
      manhole: "Regard d'égout",
      storage: 'Espace de stockage',
      boiler: 'Chaudière',
      pipeline: 'Canalisation',
      other: 'Autre',
    },
    csaClass: 'Classe CSA Z1006',
    csaClasses: {
      A: 'Classe A — Danger immédiat pour la vie',
      B: 'Classe B — Danger potentiel',
      C: 'Classe C — Danger faible',
    },
    entryMethod: "Méthode d'entrée",
    entryMethods: { vertical: 'Verticale', horizontal: 'Horizontale', restricted: 'Restreinte' },
    spaceDescription: "Description de l'espace",
    spaceDescriptionPh: 'Dimensions, caractéristiques, accès…',
    spaceShape: "Forme de l'espace",
    shapes: { rectangular: 'Rectangulaire', cylindrical: 'Cylindrique', spherical: 'Sphérique', irregular: 'Irrégulier' },
    unitSystem: "Système d'unités",
    metric: 'Métrique (m)',
    imperial: 'Impérial (pi)',
    length: 'Longueur',
    width: 'Largeur',
    height: 'Hauteur',
    diameter: 'Diamètre',
    volume: 'Volume calculé',
    atmosphericHazards: 'Dangers atmosphériques',
    physicalHazards: 'Dangers physiques',
    atmoHazardList: {
      oxygen_deficiency: 'Déficience en oxygène',
      oxygen_enrichment: 'Enrichissement en oxygène',
      flammable_gas: 'Gaz inflammable',
      toxic_gas: 'Gaz toxique',
      combustible_dust: 'Poussière combustible',
      vapors: 'Vapeurs',
      asphyxiation: 'Asphyxie',
    },
    physHazardList: {
      engulfment: 'Ensevelissement',
      entrapment: 'Piégeage',
      falls: 'Chutes',
      electrical: 'Électricité',
      mechanical: 'Mécanique',
      thermal: 'Thermique',
      noise: 'Bruit',
      radiation: 'Rayonnement',
    },
    communicationMethod: 'Méthode de communication',
    communicationMethods: { radio: 'Radio', cellular: 'Cellulaire', hardline: 'Filaire', visual: 'Visuelle' },
    emergencyEgress: "Sortie de secours",
    emergencyEgressPh: "Procédure et voie d'évacuation",
    ventilationEquipment: 'Ventilation',
    emergencyEquipment: "Équipement d'urgence",
    addHazard: 'Ajouter',
    remove: 'Retirer',
    collapse: 'Réduire',
    expand: 'Développer',
  },
  en: {
    sections: {
      project: 'Project information',
      space: 'Confined space identification',
      dimensions: 'Dimensions and volume',
      hazards: 'Hazard assessment',
      safety: 'Safety measures',
    },
    projectNumber: 'Project number',
    projectNumberPh: 'EX-2024-001',
    workLocation: 'Work location',
    workLocationPh: 'Address or location description',
    contractor: 'Contractor',
    contractorPh: 'Company name',
    supervisor: 'Responsible supervisor',
    supervisorPh: 'First and last name',
    entryDate: 'Planned entry date',
    duration: 'Estimated duration',
    durationPh: 'e.g. 4h, 2 days',
    workerCount: 'Number of workers',
    workDescription: 'Work description',
    workDescriptionPh: 'Describe the work to be performed in the confined space…',
    spaceType: 'Confined space type',
    spaceTypes: {
      tank: 'Tank',
      vessel: 'Vessel / Container',
      silo: 'Silo',
      pit: 'Pit',
      vault: 'Vault',
      tunnel: 'Tunnel',
      trench: 'Trench',
      manhole: 'Manhole',
      storage: 'Storage space',
      boiler: 'Boiler',
      pipeline: 'Pipeline',
      other: 'Other',
    },
    csaClass: 'CSA Z1006 Class',
    csaClasses: {
      A: 'Class A — Immediate danger to life',
      B: 'Class B — Potential danger',
      C: 'Class C — Low danger',
    },
    entryMethod: 'Entry method',
    entryMethods: { vertical: 'Vertical', horizontal: 'Horizontal', restricted: 'Restricted' },
    spaceDescription: 'Space description',
    spaceDescriptionPh: 'Dimensions, features, access…',
    spaceShape: 'Space shape',
    shapes: { rectangular: 'Rectangular', cylindrical: 'Cylindrical', spherical: 'Spherical', irregular: 'Irregular' },
    unitSystem: 'Unit system',
    metric: 'Metric (m)',
    imperial: 'Imperial (ft)',
    length: 'Length',
    width: 'Width',
    height: 'Height',
    diameter: 'Diameter',
    volume: 'Calculated volume',
    atmosphericHazards: 'Atmospheric hazards',
    physicalHazards: 'Physical hazards',
    atmoHazardList: {
      oxygen_deficiency: 'Oxygen deficiency',
      oxygen_enrichment: 'Oxygen enrichment',
      flammable_gas: 'Flammable gas',
      toxic_gas: 'Toxic gas',
      combustible_dust: 'Combustible dust',
      vapors: 'Vapors',
      asphyxiation: 'Asphyxiation',
    },
    physHazardList: {
      engulfment: 'Engulfment',
      entrapment: 'Entrapment',
      falls: 'Falls',
      electrical: 'Electrical',
      mechanical: 'Mechanical',
      thermal: 'Thermal',
      noise: 'Noise',
      radiation: 'Radiation',
    },
    communicationMethod: 'Communication method',
    communicationMethods: { radio: 'Radio', cellular: 'Cellular', hardline: 'Hardline', visual: 'Visual' },
    emergencyEgress: 'Emergency egress',
    emergencyEgressPh: 'Evacuation path and procedure',
    ventilationEquipment: 'Ventilation',
    emergencyEquipment: 'Emergency equipment',
    addHazard: 'Add',
    remove: 'Remove',
    collapse: 'Collapse',
    expand: 'Expand',
  },
} as const;

// ── Shared UI primitives ───────────────────────────────────────────────────
const inputClass = 'w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400';
const labelClass = 'block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function Card({
  title, icon, children, collapsible = false,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  collapsible?: boolean;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-6">
      <button
        type="button"
        onClick={() => collapsible && setOpen(v => !v)}
        className={`w-full flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700 text-left ${collapsible ? 'hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors' : ''}`}
      >
        <span className="text-blue-600">{icon}</span>
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-100 flex-1">{title}</h3>
        {collapsible && (open ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500" />)}
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────
export default function SiteInformation({ language, permitData, selectedProvince, readOnly = false, personnel = [], projects = [], suppliers = [], onUpdate }: Props) {
  const t = T[language];
  const si = permitData.siteInformation;

  const update = (field: string, value: any) => onUpdate({ [field]: value } as any);
  const updateDim = (field: string, value: number) =>
    onUpdate({ dimensions: { ...si.dimensions, [field]: value } } as any);
  const updateEnv = (field: string, value: any) =>
    onUpdate({ environmentalConditions: { ...si.environmentalConditions, [field]: value } } as any);
  const updateSafety = (field: string, value: any) =>
    onUpdate({ safetyMeasures: { ...si.safetyMeasures, [field]: value } } as any);

  // Volume auto-calculation
  const calcVolume = (dim: typeof si.dimensions): number => {
    if (dim.spaceShape === 'cylindrical') return Math.round(Math.PI * (dim.diameter / 2) ** 2 * dim.height * 100) / 100;
    if (dim.spaceShape === 'spherical') return Math.round((4 / 3) * Math.PI * (dim.diameter / 2) ** 3 * 100) / 100;
    return Math.round(dim.length * dim.width * dim.height * 100) / 100;
  };

  const toggleHazard = (list: 'atmosphericHazards' | 'physicalHazards', val: string) => {
    const current: string[] = (si[list] as string[]) ?? [];
    const next = current.includes(val) ? current.filter(h => h !== val) : [...current, val];
    onUpdate({ [list]: next } as any);
  };

  const HazardChip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={readOnly}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
        active
          ? 'bg-red-600 border-red-600 text-white'
          : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-red-400 hover:text-red-600'
      } disabled:opacity-50`}
    >
      {label}
    </button>
  );

  const dim = si.dimensions;
  const volume = calcVolume(dim);

  return (
    <div>
      {/* Project info */}
      <Card title={t.sections.project} icon={<Building className="w-5 h-5" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.projectNumber}>
            <EntitySearch value={si.projectNumber ?? ''} readOnly={readOnly} options={projects}
              onText={v => update('projectNumber', v)} onPick={o => update('projectNumber', o.label)} placeholder={t.projectNumberPh} />
          </Field>
          <Field label={t.workLocation}>
            <input type="text" value={si.workLocation ?? ''} onChange={e => update('workLocation', e.target.value)}
              placeholder={t.workLocationPh} disabled={readOnly} className={inputClass} />
          </Field>
          <Field label={t.contractor}>
            <EntitySearch value={si.contractor ?? ''} readOnly={readOnly} options={suppliers}
              onText={v => update('contractor', v)} onPick={o => update('contractor', o.label)} placeholder={t.contractorPh} />
          </Field>
          <Field label={t.supervisor}>
            <EntitySearch value={si.supervisor ?? ''} readOnly={readOnly} options={personnel}
              onText={v => update('supervisor', v)} onPick={o => update('supervisor', o.label)} placeholder={t.supervisorPh} />
          </Field>
          <Field label={t.entryDate}>
            <input type="datetime-local" value={si.entryDate ?? ''} onChange={e => update('entryDate', e.target.value)}
              disabled={readOnly} className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t.duration}>
              <input type="text" value={si.duration ?? ''} onChange={e => update('duration', e.target.value)}
                placeholder={t.durationPh} disabled={readOnly} className={inputClass} />
            </Field>
            <Field label={t.workerCount}>
              <input type="number" min={1} max={99} value={si.workerCount ?? 1}
                onChange={e => update('workerCount', parseInt(e.target.value) || 1)}
                disabled={readOnly} className={inputClass} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label={t.workDescription}>
              <textarea value={si.workDescription ?? ''} onChange={e => update('workDescription', e.target.value)}
                placeholder={t.workDescriptionPh} rows={3} disabled={readOnly}
                className={`${inputClass} resize-none`} />
            </Field>
          </div>
        </div>
      </Card>

      {/* Space identification */}
      <Card title={t.sections.space} icon={<Layers className="w-5 h-5" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.spaceType}>
            <select value={si.spaceType ?? ''} onChange={e => update('spaceType', e.target.value)}
              disabled={readOnly} className={inputClass}>
              <option value="">{language === 'fr' ? '— Sélectionner —' : '— Select —'}</option>
              {Object.entries(t.spaceTypes).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label={t.csaClass}>
            <select value={si.csaClass ?? ''} onChange={e => update('csaClass', e.target.value)}
              disabled={readOnly} className={inputClass}>
              <option value="">{language === 'fr' ? '— Sélectionner —' : '— Select —'}</option>
              {Object.entries(t.csaClasses).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label={t.entryMethod}>
            <select value={si.entryMethod ?? ''} onChange={e => update('entryMethod', e.target.value)}
              disabled={readOnly} className={inputClass}>
              <option value="">{language === 'fr' ? '— Sélectionner —' : '— Select —'}</option>
              {Object.entries(t.entryMethods).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label={t.unitSystem}>
            <select value={si.unitSystem ?? 'metric'} onChange={e => update('unitSystem', e.target.value)}
              disabled={readOnly} className={inputClass}>
              <option value="metric">{t.metric}</option>
              <option value="imperial">{t.imperial}</option>
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label={t.spaceDescription}>
              <textarea value={si.spaceDescription ?? ''} onChange={e => update('spaceDescription', e.target.value)}
                placeholder={t.spaceDescriptionPh} rows={2} disabled={readOnly}
                className={`${inputClass} resize-none`} />
            </Field>
          </div>
        </div>
      </Card>

      {/* Dimensions */}
      <Card title={t.sections.dimensions} icon={<Ruler className="w-5 h-5" />} collapsible>
        <div className="space-y-4">
          <Field label={t.spaceShape}>
            <div className="flex flex-wrap gap-2">
              {Object.entries(t.shapes).map(([k, v]) => (
                <button key={k} type="button"
                  onClick={() => !readOnly && onUpdate({ dimensions: { ...dim, spaceShape: k as any } } as any)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${dim.spaceShape === k ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 text-slate-600 hover:border-blue-400'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </Field>

          {dim.spaceShape === 'cylindrical' || dim.spaceShape === 'spherical' ? (
            <div className="grid grid-cols-2 gap-4">
              <Field label={`${t.diameter} (${si.unitSystem === 'imperial' ? 'pi' : 'm'})`}>
                <input type="number" min={0} step={0.01} value={dim.diameter || ''}
                  onChange={e => { const v = parseFloat(e.target.value) || 0; const newDim = { ...dim, diameter: v }; onUpdate({ dimensions: { ...newDim, volume: calcVolume(newDim) } } as any); }}
                  disabled={readOnly} className={inputClass} />
              </Field>
              {dim.spaceShape === 'cylindrical' && (
                <Field label={`${t.height} (${si.unitSystem === 'imperial' ? 'pi' : 'm'})`}>
                  <input type="number" min={0} step={0.01} value={dim.height || ''}
                    onChange={e => { const v = parseFloat(e.target.value) || 0; const newDim = { ...dim, height: v }; onUpdate({ dimensions: { ...newDim, volume: calcVolume(newDim) } } as any); }}
                    disabled={readOnly} className={inputClass} />
                </Field>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {[['length', t.length], ['width', t.width], ['height', t.height]].map(([field, label]) => (
                <Field key={field} label={`${label} (${si.unitSystem === 'imperial' ? 'pi' : 'm'})`}>
                  <input type="number" min={0} step={0.01} value={(dim as any)[field] || ''}
                    onChange={e => { const v = parseFloat(e.target.value) || 0; const newDim = { ...dim, [field]: v }; onUpdate({ dimensions: { ...newDim, volume: calcVolume(newDim) } } as any); }}
                    disabled={readOnly} className={inputClass} />
                </Field>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg px-4 py-3 text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-400 dark:text-slate-500">{t.volume}:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {volume > 0 ? `${volume} ${si.unitSystem === 'imperial' ? 'pi³' : 'm³'}` : '—'}
            </span>
          </div>
        </div>
      </Card>

      {/* Hazards */}
      <Card title={t.sections.hazards} icon={<AlertTriangle className="w-5 h-5" />}>
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-slate-600 mb-3">{t.atmosphericHazards}</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(t.atmoHazardList).map(([k, v]) => (
                <HazardChip key={k} label={v}
                  active={(si.atmosphericHazards ?? []).includes(k)}
                  onClick={() => toggleHazard('atmosphericHazards', k)} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 mb-3">{t.physicalHazards}</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(t.physHazardList).map(([k, v]) => (
                <HazardChip key={k} label={v}
                  active={(si.physicalHazards ?? []).includes(k)}
                  onClick={() => toggleHazard('physicalHazards', k)} />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Safety measures */}
      <Card title={t.sections.safety} icon={<Wind className="w-5 h-5" />} collapsible>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.communicationMethod}>
            <select value={si.safetyMeasures?.communicationMethod ?? ''} onChange={e => updateSafety('communicationMethod', e.target.value)}
              disabled={readOnly} className={inputClass}>
              <option value="">{language === 'fr' ? '— Sélectionner —' : '— Select —'}</option>
              {Object.entries(t.communicationMethods).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label={t.emergencyEgress}>
              <textarea value={si.safetyMeasures?.emergencyEgress ?? ''} onChange={e => updateSafety('emergencyEgress', e.target.value)}
                placeholder={t.emergencyEgressPh} rows={2} disabled={readOnly}
                className={`${inputClass} resize-none`} />
            </Field>
          </div>
        </div>
      </Card>
    </div>
  );
}
