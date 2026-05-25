'use client';

import React, { useState } from 'react';
import {
  Wind, Plus, Trash2, AlertTriangle, CheckCircle, Clock,
  Settings, Activity, ChevronDown, ChevronUp, Info
} from 'lucide-react';
import { ConfinedSpacePermit, ProvinceCode, AtmosphericReading, generateId } from './SafetyManager';

type Language = 'fr' | 'en';

interface Props {
  language: Language;
  permitData: ConfinedSpacePermit;
  selectedProvince: ProvinceCode;
  readOnly?: boolean;
  onUpdate: (data: Partial<ConfinedSpacePermit['atmosphericTesting']>) => void;
}

// ── Provincial limits ──────────────────────────────────────────────────────
const LIMITS: Record<ProvinceCode, { name: string; o2min: number; o2max: number; lelMax: number; h2sMax: number; coMax: number; ref: string }> = {
  QC: { name: 'RSST QC', o2min: 19.5, o2max: 23.0, lelMax: 10, h2sMax: 10, coMax: 35, ref: 'LSST / RSST art. 297–310' },
  ON: { name: 'O.Reg 632/05', o2min: 19.5, o2max: 23.0, lelMax: 10, h2sMax: 10, coMax: 35, ref: 'Ontario Reg. 632/05' },
  BC: { name: 'OHS BC', o2min: 19.5, o2max: 23.0, lelMax: 10, h2sMax: 10, coMax: 35, ref: 'BC OHS Reg. Part 9' },
  AB: { name: 'OHS AB', o2min: 19.5, o2max: 23.0, lelMax: 10, h2sMax: 10, coMax: 35, ref: 'AB OHS Code Part 5' },
  SK: { name: 'OHS SK', o2min: 19.5, o2max: 23.0, lelMax: 10, h2sMax: 10, coMax: 35, ref: 'SK OHS Reg. Part 6' },
  MB: { name: 'WSH MB', o2min: 19.5, o2max: 23.0, lelMax: 10, h2sMax: 10, coMax: 35, ref: 'MB WSH Reg. Part 13' },
  NB: { name: 'OHS NB', o2min: 19.5, o2max: 23.0, lelMax: 10, h2sMax: 10, coMax: 35, ref: 'NB OHS Reg.' },
  NS: { name: 'OHS NS', o2min: 19.5, o2max: 23.0, lelMax: 10, h2sMax: 10, coMax: 35, ref: 'NS OHS Act Part 11' },
  PE: { name: 'OHS PE', o2min: 19.5, o2max: 23.0, lelMax: 10, h2sMax: 10, coMax: 35, ref: 'PEI OHS Act' },
  NL: { name: 'OHS NL', o2min: 19.5, o2max: 23.0, lelMax: 10, h2sMax: 10, coMax: 35, ref: 'NL OHS Act' },
};

// ── Translations ───────────────────────────────────────────────────────────
const T = {
  fr: {
    title: 'Tests atmosphériques',
    regulations: 'Réglementation applicable',
    limits: 'Limites réglementaires',
    equipment: 'Équipement de détection',
    deviceModel: 'Modèle de détecteur',
    deviceModelPh: 'ex. BW MicroClip XL',
    serialNumber: 'Numéro de série',
    serialNumberPh: 'S/N…',
    calibrationDate: 'Date de calibration',
    nextCalibration: 'Prochaine calibration',
    readings: 'Mesures atmosphériques',
    addReading: 'Ajouter une mesure',
    noReadings: 'Aucune mesure enregistrée',
    location: 'Emplacement',
    locationPh: 'ex. Fond, mi-hauteur, accès…',
    testedBy: 'Testé par',
    testedByPh: 'Nom du technicien',
    notes: 'Notes',
    notesPh: 'Observations…',
    oxygen: 'O₂ (%)',
    lel: 'LEL (%)',
    h2s: 'H₂S (ppm)',
    co: 'CO (ppm)',
    temp: 'Temp (°C)',
    humidity: 'Humidité (%)',
    status: { safe: 'Sécuritaire', caution: 'Attention', danger: 'DANGER' },
    reference: 'Référence',
    oxygenRange: 'Oxygène',
    lelRange: 'Gaz combustible',
    h2sRange: 'H₂S',
    coRange: 'CO',
    continuousMonitoring: 'Surveillance continue activée',
    readingAt: 'Mesure du',
    delete: 'Supprimer',
    cancel: 'Annuler',
    save: 'Enregistrer',
    newReading: 'Nouvelle mesure',
    timestamp: 'Horodatage',
  },
  en: {
    title: 'Atmospheric testing',
    regulations: 'Applicable regulations',
    limits: 'Regulatory limits',
    equipment: 'Detection equipment',
    deviceModel: 'Detector model',
    deviceModelPh: 'e.g. BW MicroClip XL',
    serialNumber: 'Serial number',
    serialNumberPh: 'S/N…',
    calibrationDate: 'Calibration date',
    nextCalibration: 'Next calibration',
    readings: 'Atmospheric readings',
    addReading: 'Add reading',
    noReadings: 'No readings recorded',
    location: 'Location',
    locationPh: 'e.g. Bottom, mid-level, access…',
    testedBy: 'Tested by',
    testedByPh: 'Technician name',
    notes: 'Notes',
    notesPh: 'Observations…',
    oxygen: 'O₂ (%)',
    lel: 'LEL (%)',
    h2s: 'H₂S (ppm)',
    co: 'CO (ppm)',
    temp: 'Temp (°C)',
    humidity: 'Humidity (%)',
    status: { safe: 'Safe', caution: 'Caution', danger: 'DANGER' },
    reference: 'Reference',
    oxygenRange: 'Oxygen',
    lelRange: 'Combustible gas',
    h2sRange: 'H₂S',
    coRange: 'CO',
    continuousMonitoring: 'Continuous monitoring enabled',
    readingAt: 'Reading at',
    delete: 'Delete',
    cancel: 'Cancel',
    save: 'Save',
    newReading: 'New reading',
    timestamp: 'Timestamp',
  },
} as const;

function readingStatus(r: AtmosphericReading['readings'], limits: typeof LIMITS[ProvinceCode]): 'safe' | 'caution' | 'danger' {
  if (r.oxygen < limits.o2min || r.oxygen > limits.o2max) return 'danger';
  if (r.hydrogenSulfide > limits.h2sMax || r.carbonMonoxide > limits.coMax) return 'danger';
  if (r.combustibleGas > limits.lelMax) return 'danger';
  // Caution: within 1% of O2 danger threshold, or > 50% of LEL/H2S/CO limits
  if (r.oxygen < (limits.o2min + 1) || r.combustibleGas > limits.lelMax * 0.5 || r.hydrogenSulfide > limits.h2sMax * 0.5 || r.carbonMonoxide > limits.coMax * 0.5) return 'caution';
  return 'safe';
}

const inputClass = 'w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400';
const labelClass = 'block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1';

function Card({ title, icon, children, collapsible = false }: { title: string; icon: React.ReactNode; children: React.ReactNode; collapsible?: boolean }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-6">
      <button type="button" onClick={() => collapsible && setOpen(v => !v)}
        className={`w-full flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700 text-left ${collapsible ? 'hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors' : ''}`}>
        <span className="text-blue-600">{icon}</span>
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 dark:text-slate-100 flex-1">{title}</h3>
        {collapsible && (open ? <ChevronUp className="w-4 h-4 text-slate-400 dark:text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500" />)}
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  );
}

// ── New reading form ───────────────────────────────────────────────────────
interface ReadingFormState {
  location: string;
  testedBy: string;
  notes: string;
  oxygen: string;
  combustibleGas: string;
  hydrogenSulfide: string;
  carbonMonoxide: string;
  temperature: string;
  humidity: string;
}

const emptyForm = (): ReadingFormState => ({
  location: '', testedBy: '', notes: '',
  oxygen: '', combustibleGas: '', hydrogenSulfide: '',
  carbonMonoxide: '', temperature: '', humidity: '',
});

// ── Main component ─────────────────────────────────────────────────────────
export default function AtmosphericTesting({ language, permitData, selectedProvince, readOnly = false, onUpdate }: Props) {
  const t = T[language];
  const at = permitData.atmosphericTesting;
  const limits = LIMITS[selectedProvince];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ReadingFormState>(emptyForm);

  const updateEquipment = (field: string, val: string) =>
    onUpdate({ equipment: { ...at.equipment, [field]: val } });

  const formNum = (s: string) => (s === '' ? 0 : parseFloat(s) || 0);

  const submitReading = () => {
    const readings = {
      oxygen: formNum(form.oxygen),
      combustibleGas: formNum(form.combustibleGas),
      hydrogenSulfide: formNum(form.hydrogenSulfide),
      carbonMonoxide: formNum(form.carbonMonoxide),
      temperature: formNum(form.temperature),
      humidity: formNum(form.humidity),
    };
    const newReading: AtmosphericReading = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      location: form.location,
      readings,
      status: readingStatus(readings, limits),
      testedBy: form.testedBy,
      notes: form.notes,
    };
    onUpdate({ readings: [...(at.readings ?? []), newReading], lastUpdated: new Date().toISOString() });
    setForm(emptyForm());
    setShowForm(false);
  };

  const deleteReading = (id: string) =>
    onUpdate({ readings: (at.readings ?? []).filter(r => r.id !== id) });

  const statusColor = (s: 'safe' | 'caution' | 'danger') => ({
    safe: 'bg-green-100 text-green-700 border-green-200',
    caution: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    danger: 'bg-red-100 text-red-700 border-red-200',
  }[s]);

  const GasRow = ({ label, value, min, max, unit = '' }: { label: string; value: number; min?: number; max: number; unit?: string }) => {
    const bad = (min !== undefined && value < min) || value > max;
    return (
      <div className="flex items-center justify-between py-1 text-sm">
        <span className="text-slate-600 dark:text-slate-400 dark:text-slate-500">{label}</span>
        <span className={`font-semibold ${bad ? 'text-red-600' : 'text-green-700'}`}>
          {value}{unit}
        </span>
      </div>
    );
  };

  return (
    <div>
      {/* Regulatory limits card */}
      <Card title={t.limits} icon={<Info className="w-5 h-5" />} collapsible>
        <div className="text-xs text-slate-500 mb-3">{limits.name} — {limits.ref}</div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400 dark:text-slate-500">{t.oxygenRange}</span><span className="font-medium">{limits.o2min}–{limits.o2max}%</span></div>
            <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400 dark:text-slate-500">{t.lelRange}</span><span className="font-medium">&lt; {limits.lelMax}% LEL</span></div>
            <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400 dark:text-slate-500">{t.h2sRange}</span><span className="font-medium">&lt; {limits.h2sMax} ppm</span></div>
            <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400 dark:text-slate-500">{t.coRange}</span><span className="font-medium">&lt; {limits.coMax} ppm</span></div>
          </div>
          <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-300">
            <Info className="w-5 h-5 shrink-0 text-blue-500" />
            <span>{language === 'fr' ? 'Tests requis avant toute entrée et en continu si détecteurs présents.' : 'Testing required before any entry and continuously if detectors are present.'}</span>
          </div>
        </div>
      </Card>

      {/* Equipment */}
      <Card title={t.equipment} icon={<Settings className="w-5 h-5" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ['deviceModel', t.deviceModel, t.deviceModelPh, 'text'],
            ['serialNumber', t.serialNumber, t.serialNumberPh, 'text'],
            ['calibrationDate', t.calibrationDate, '', 'date'],
            ['nextCalibration', t.nextCalibration, '', 'date'],
          ].map(([field, label, ph, type]) => (
            <div key={field}>
              <label className={labelClass}>{label}</label>
              <input type={type} value={(at.equipment as any)[field] ?? ''} placeholder={ph}
                onChange={e => updateEquipment(field, e.target.value)}
                disabled={readOnly} className={inputClass} />
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={at.continuousMonitoring ?? false}
              onChange={e => onUpdate({ continuousMonitoring: e.target.checked })}
              disabled={readOnly}
              className="w-4 h-4 rounded border-slate-300 text-blue-600" />
            <span className="text-sm text-slate-700 dark:text-slate-200">{t.continuousMonitoring}</span>
          </label>
        </div>
      </Card>

      {/* Readings */}
      <Card title={t.readings} icon={<Activity className="w-5 h-5" />}>
        {!readOnly && (
          <button type="button" onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 mb-5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            {t.addReading}
          </button>
        )}

        {/* Form */}
        {showForm && (
          <div className="mb-6 border border-slate-200 rounded-xl bg-slate-50 dark:bg-slate-700/50 p-5 space-y-4">
            <h4 className="font-medium text-slate-800 dark:text-slate-100">{t.newReading}</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>{t.location}</label>
                <input type="text" value={form.location} placeholder={t.locationPh}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t.testedBy}</label>
                <input type="text" value={form.testedBy} placeholder={t.testedByPh}
                  onChange={e => setForm(f => ({ ...f, testedBy: e.target.value }))} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                ['oxygen', t.oxygen], ['combustibleGas', t.lel], ['hydrogenSulfide', t.h2s],
                ['carbonMonoxide', t.co], ['temperature', t.temp], ['humidity', t.humidity],
              ].map(([field, label]) => (
                <div key={field}>
                  <label className={labelClass}>{label}</label>
                  <input type="number" step="0.1" value={(form as any)[field]}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} className={inputClass} />
                </div>
              ))}
            </div>
            <div>
              <label className={labelClass}>{t.notes}</label>
              <input type="text" value={form.notes} placeholder={t.notesPh}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className={inputClass} />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={submitReading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                {t.save}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm()); }}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors">
                {t.cancel}
              </button>
            </div>
          </div>
        )}

        {/* Reading list */}
        {(at.readings ?? []).length === 0 ? (
          <div className="text-center py-10 text-sm text-slate-400 dark:text-slate-500">{t.noReadings}</div>
        ) : (
          <div className="space-y-4">
            {(at.readings ?? []).slice().reverse().map(r => (
              <div key={r.id} className={`rounded-xl border p-4 ${statusColor(r.status)}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColor(r.status)}`}>
                      {r.status === 'danger' ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                      {t.status[r.status]}
                    </span>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 mt-1">{r.location || '—'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(r.timestamp).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}
                      {r.testedBy && ` — ${r.testedBy}`}
                    </p>
                  </div>
                  {!readOnly && (
                    <button type="button" onClick={() => deleteReading(r.id)}
                      className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 bg-white/60 dark:bg-slate-800/60 rounded-lg px-3 py-2">
                  <GasRow label={t.oxygen} value={r.readings.oxygen} min={limits.o2min} max={limits.o2max} unit="%" />
                  <GasRow label={t.lel} value={r.readings.combustibleGas} max={limits.lelMax} unit="%" />
                  <GasRow label={t.h2s} value={r.readings.hydrogenSulfide} max={limits.h2sMax} unit=" ppm" />
                  <GasRow label={t.co} value={r.readings.carbonMonoxide} max={limits.coMax} unit=" ppm" />
                  <GasRow label={t.temp} value={r.readings.temperature} max={9999} unit="°C" />
                  <GasRow label={t.humidity} value={r.readings.humidity} max={100} unit="%" />
                </div>
                {r.notes && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">{r.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
