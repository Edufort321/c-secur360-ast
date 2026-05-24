'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Users, Plus, Trash2, LogIn, LogOut, Clock, Phone, Building,
  AlertTriangle, CheckCircle, UserCheck, Shield, ChevronDown, ChevronUp
} from 'lucide-react';
import { ConfinedSpacePermit, ProvinceCode, PersonnelEntry, EntryLogEntry, generateId } from './SafetyManager';

type Language = 'fr' | 'en';

interface Props {
  language: Language;
  permitData: ConfinedSpacePermit;
  selectedProvince: ProvinceCode;
  readOnly?: boolean;
  onUpdate: (data: Partial<ConfinedSpacePermit['entryRegistry']>) => void;
}

// ── Translations ───────────────────────────────────────────────────────────
const T = {
  fr: {
    title: "Registre d'entrée",
    personnel: 'Personnel autorisé',
    addPerson: 'Ajouter une personne',
    entryLog: "Journal d'entrée/sortie",
    noPersonnel: 'Aucun personnel enregistré',
    noLog: 'Aucun mouvement enregistré',
    name: 'Nom complet',
    namePh: 'Prénom et nom',
    role: 'Rôle',
    roles: {
      entrant: 'Entrant',
      attendant: 'Surveillant',
      supervisor: 'Superviseur',
      rescue: 'Sauveteur',
    },
    certification: 'Certification',
    certificationPh: 'N° certificat ou formation',
    company: 'Entreprise',
    companyPh: "Nom de l'entreprise",
    phone: 'Téléphone',
    phonePh: '514-555-0100',
    emergencyContact: "Contact d'urgence",
    emergencyName: 'Nom du contact',
    emergencyPhone: 'Téléphone urgence',
    emergencyRel: 'Lien',
    medicalFitness: 'Aptitude médicale valide',
    medicalExpiry: 'Expiration aptitude',
    notes: 'Notes',
    notesPh: 'Observations…',
    inside: "Dans l'espace",
    outside: 'Sorti',
    emergency: 'Urgence',
    recordEntry: 'Enregistrer entrée',
    recordExit: 'Enregistrer sortie',
    recordEmergency: 'Sortie urgence',
    elapsed: 'Temps écoulé',
    authorizedBy: 'Autorisé par',
    cancel: 'Annuler',
    save: 'Enregistrer',
    newPerson: 'Nouvelle personne',
    edit: 'Modifier',
    delete: 'Supprimer',
    maxOccupancy: 'Occupation maximale',
    currentOccupancy: 'Occupation actuelle',
    entryAt: 'Entrée',
    exitAt: 'Sortie',
    action: 'Action',
    status: 'Statut',
    communication: 'Communication',
    checkInterval: 'Intervalle de vérification (min)',
    communicationTypes: { radio: 'Radio', cellular: 'Cellulaire', hardline: 'Filaire' },
    pre_entry_checklist: "Liste de contrôle pré-entrée",
    checklist: {
      attendant_present: 'Surveillant présent au poste',
      communication_tested: 'Communication testée',
      atmospheric_testing_current: 'Tests atmosphériques à jour',
      equipment_inspected: 'Équipement inspecté',
      safety_briefing_completed: 'Briefing sécurité complété',
      emergency_equipment_available: 'Équipement urgence disponible',
      rescue_team_notified: 'Équipe de sauvetage informée',
      permit_reviewed: 'Permis révisé et signé',
    },
  },
  en: {
    title: 'Entry registry',
    personnel: 'Authorized personnel',
    addPerson: 'Add person',
    entryLog: 'Entry/exit log',
    noPersonnel: 'No personnel registered',
    noLog: 'No movements recorded',
    name: 'Full name',
    namePh: 'First and last name',
    role: 'Role',
    roles: {
      entrant: 'Entrant',
      attendant: 'Attendant',
      supervisor: 'Supervisor',
      rescue: 'Rescue',
    },
    certification: 'Certification',
    certificationPh: 'Certificate or training number',
    company: 'Company',
    companyPh: 'Company name',
    phone: 'Phone',
    phonePh: '514-555-0100',
    emergencyContact: 'Emergency contact',
    emergencyName: 'Contact name',
    emergencyPhone: 'Emergency phone',
    emergencyRel: 'Relationship',
    medicalFitness: 'Valid medical fitness',
    medicalExpiry: 'Fitness expiry',
    notes: 'Notes',
    notesPh: 'Observations…',
    inside: 'Inside',
    outside: 'Outside',
    emergency: 'Emergency',
    recordEntry: 'Record entry',
    recordExit: 'Record exit',
    recordEmergency: 'Emergency exit',
    elapsed: 'Elapsed time',
    authorizedBy: 'Authorized by',
    cancel: 'Cancel',
    save: 'Save',
    newPerson: 'New person',
    edit: 'Edit',
    delete: 'Delete',
    maxOccupancy: 'Maximum occupancy',
    currentOccupancy: 'Current occupancy',
    entryAt: 'Entry',
    exitAt: 'Exit',
    action: 'Action',
    status: 'Status',
    communication: 'Communication',
    checkInterval: 'Check interval (min)',
    communicationTypes: { radio: 'Radio', cellular: 'Cellular', hardline: 'Hardline' },
    pre_entry_checklist: 'Pre-entry checklist',
    checklist: {
      attendant_present: 'Attendant present at post',
      communication_tested: 'Communication tested',
      atmospheric_testing_current: 'Atmospheric testing current',
      equipment_inspected: 'Equipment inspected',
      safety_briefing_completed: 'Safety briefing completed',
      emergency_equipment_available: 'Emergency equipment available',
      rescue_team_notified: 'Rescue team notified',
      permit_reviewed: 'Permit reviewed and signed',
    },
  },
} as const;

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
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

// ── Person form ────────────────────────────────────────────────────────────
interface PersonForm {
  name: string; role: string; certification: string; company: string; phone: string;
  emergencyName: string; emergencyPhone: string; emergencyRel: string;
  medicalFitnessValid: boolean; medicalExpiry: string; notes: string;
}

const emptyPersonForm = (): PersonForm => ({
  name: '', role: 'entrant', certification: '', company: '', phone: '',
  emergencyName: '', emergencyPhone: '', emergencyRel: '',
  medicalFitnessValid: true, medicalExpiry: '', notes: '',
});

// ── Entry timer hook ───────────────────────────────────────────────────────
function useEntryTimer(entryTime: string | undefined) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!entryTime) { setElapsed(0); return; }
    const tick = () => setElapsed(Date.now() - new Date(entryTime).getTime());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [entryTime]);
  return elapsed;
}

// ── Personnel row component ────────────────────────────────────────────────
function PersonRow({
  person, isInside, t, readOnly,
  onEntry, onExit, onEmergency, onDelete,
}: {
  person: PersonnelEntry;
  isInside: boolean;
  t: typeof T[keyof typeof T];
  readOnly: boolean;
  onEntry: () => void;
  onExit: () => void;
  onEmergency: () => void;
  onDelete: () => void;
}) {
  const elapsed = useEntryTimer(isInside ? person.entryTime : undefined);
  const isOvertime = elapsed > 4 * 3600 * 1000;

  return (
    <div className={`rounded-xl border p-4 transition-colors ${isInside ? (isOvertime ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50') : 'border-slate-200 bg-white'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900 dark:text-white text-sm">{person.name || '—'}</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:text-slate-400 dark:text-slate-500">{(t.roles as any)[person.role] ?? person.role}</span>
            {isInside && (
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${isOvertime ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                <Clock className="w-3 h-3" />
                {formatDuration(elapsed)}
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">
            {person.company && <span><Building className="w-3 h-3 inline mr-0.5" />{person.company}</span>}
            {person.phone && <span><Phone className="w-3 h-3 inline mr-0.5" />{person.phone}</span>}
            {person.certification && <span><UserCheck className="w-3 h-3 inline mr-0.5" />{person.certification}</span>}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!readOnly && (
            <>
              {!isInside ? (
                <button type="button" onClick={onEntry}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors">
                  <LogIn className="w-3.5 h-3.5" />{t.recordEntry}
                </button>
              ) : (
                <>
                  <button type="button" onClick={onExit}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors">
                    <LogOut className="w-3.5 h-3.5" />{t.recordExit}
                  </button>
                  <button type="button" onClick={onEmergency}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors">
                    <AlertTriangle className="w-3.5 h-3.5" />{t.recordEmergency}
                  </button>
                </>
              )}
              <button type="button" onClick={onDelete}
                className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors ml-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function EntryRegistry({ language, permitData, selectedProvince, readOnly = false, onUpdate }: Props) {
  const t = T[language];
  const reg = permitData.entryRegistry;
  const [showForm, setShowForm] = useState(false);
  const [personForm, setPersonForm] = useState<PersonForm>(emptyPersonForm);

  const updateReg = (partial: Partial<typeof reg>) =>
    onUpdate({ ...partial, lastUpdated: new Date().toISOString() });

  const addPerson = () => {
    const entry: PersonnelEntry = {
      id: generateId(),
      name: personForm.name,
      role: personForm.role as any,
      certification: personForm.certification ? [personForm.certification] : [],
      company: personForm.company,
      phone: personForm.phone,
      emergencyContact: {
        name: personForm.emergencyName,
        phone: personForm.emergencyPhone,
        relationship: personForm.emergencyRel,
      },
      medicalFitness: {
        valid: personForm.medicalFitnessValid,
        expiryDate: personForm.medicalExpiry,
      },
      notes: personForm.notes,
      status: 'outside',
    };
    updateReg({ personnel: [...(reg.personnel ?? []), entry] });
    setPersonForm(emptyPersonForm());
    setShowForm(false);
  };

  const deletePerson = (id: string) =>
    updateReg({
      personnel: reg.personnel.filter(p => p.id !== id),
      activeEntrants: reg.activeEntrants.filter(a => a !== id),
    });

  const recordAction = (personId: string, action: 'entry' | 'exit' | 'emergency_exit') => {
    const now = new Date().toISOString();
    const logEntry: EntryLogEntry = {
      id: generateId(),
      personnelId: personId,
      action,
      timestamp: now,
      authorizedBy: permitData.siteInformation.supervisor ?? '',
    };
    const updatedPersonnel = reg.personnel.map(p =>
      p.id === personId ? {
        ...p,
        status: action === 'entry' ? 'inside' as const : 'outside' as const,
        entryTime: action === 'entry' ? now : p.entryTime,
        exitTime: action !== 'entry' ? now : p.exitTime,
      } : p
    );
    const activeEntrants = action === 'entry'
      ? [...(reg.activeEntrants ?? []), personId]
      : (reg.activeEntrants ?? []).filter(id => id !== personId);

    updateReg({
      personnel: updatedPersonnel,
      entryLog: [...(reg.entryLog ?? []), logEntry],
      activeEntrants,
    });
  };

  const toggleChecklist = (key: string, val: boolean) =>
    updateReg({ [key]: val } as any);

  const checklistKeys = Object.keys(t.checklist) as (keyof typeof t.checklist)[];

  return (
    <div>
      {/* Occupancy overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: language === 'fr' ? "Dans l'espace" : 'Inside', value: (reg.activeEntrants ?? []).length, color: 'text-green-600 bg-green-50 border-green-200' },
          { label: language === 'fr' ? 'Total autorisés' : 'Total authorized', value: (reg.personnel ?? []).length, color: 'text-blue-600 bg-blue-50 border-blue-200' },
          { label: t.maxOccupancy, value: reg.maxOccupancy ?? 2, color: 'text-slate-600 bg-slate-50 border-slate-200', editable: true },
          { label: language === 'fr' ? 'Mouvements' : 'Movements', value: (reg.entryLog ?? []).length, color: 'text-slate-600 bg-slate-50 border-slate-200' },
        ].map(({ label, value, color, editable }) => (
          <div key={label} className={`rounded-xl border p-4 ${color}`}>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs mt-1 font-medium opacity-80">{label}</div>
          </div>
        ))}
      </div>

      {/* Pre-entry checklist */}
      <Card title={t.pre_entry_checklist} icon={<CheckCircle className="w-5 h-5" />} collapsible>
        <div className="grid sm:grid-cols-2 gap-2">
          {checklistKeys.map(key => {
            const checked = !!(reg as any)[key];
            return (
              <label key={key} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer select-none">
                <input type="checkbox" checked={checked}
                  onChange={e => !readOnly && toggleChecklist(key, e.target.checked)}
                  disabled={readOnly}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                <span className={`text-sm ${checked ? 'text-slate-700' : 'text-slate-500'}`}>{t.checklist[key]}</span>
                {checked && <CheckCircle className="w-4 h-4 text-green-500 ml-auto shrink-0" />}
              </label>
            );
          })}
        </div>
      </Card>

      {/* Personnel */}
      <Card title={t.personnel} icon={<Users className="w-5 h-5" />}>
        {!readOnly && (
          <button type="button" onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 mb-5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            {t.addPerson}
          </button>
        )}

        {/* Add person form */}
        {showForm && (
          <div className="mb-6 border border-slate-200 rounded-xl bg-slate-50 dark:bg-slate-700/50 p-5 space-y-4">
            <h4 className="font-medium text-slate-800 dark:text-slate-100">{t.newPerson}</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>{t.name}</label>
                <input type="text" value={personForm.name} placeholder={t.namePh}
                  onChange={e => setPersonForm(f => ({ ...f, name: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t.role}</label>
                <select value={personForm.role}
                  onChange={e => setPersonForm(f => ({ ...f, role: e.target.value }))} className={inputClass}>
                  {Object.entries(t.roles).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t.company}</label>
                <input type="text" value={personForm.company} placeholder={t.companyPh}
                  onChange={e => setPersonForm(f => ({ ...f, company: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t.phone}</label>
                <input type="tel" value={personForm.phone} placeholder={t.phonePh}
                  onChange={e => setPersonForm(f => ({ ...f, phone: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t.certification}</label>
                <input type="text" value={personForm.certification} placeholder={t.certificationPh}
                  onChange={e => setPersonForm(f => ({ ...f, certification: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t.medicalExpiry}</label>
                <input type="date" value={personForm.medicalExpiry}
                  onChange={e => setPersonForm(f => ({ ...f, medicalExpiry: e.target.value }))} className={inputClass} />
              </div>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 grid gap-3 sm:grid-cols-3">
              <div>
                <label className={labelClass}>{t.emergencyName}</label>
                <input type="text" value={personForm.emergencyName}
                  onChange={e => setPersonForm(f => ({ ...f, emergencyName: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t.emergencyPhone}</label>
                <input type="tel" value={personForm.emergencyPhone} placeholder={t.phonePh}
                  onChange={e => setPersonForm(f => ({ ...f, emergencyPhone: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t.emergencyRel}</label>
                <input type="text" value={personForm.emergencyRel}
                  onChange={e => setPersonForm(f => ({ ...f, emergencyRel: e.target.value }))} className={inputClass} />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={personForm.medicalFitnessValid}
                onChange={e => setPersonForm(f => ({ ...f, medicalFitnessValid: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-300 text-blue-600" />
              <span className="text-sm text-slate-700 dark:text-slate-200">{t.medicalFitness}</span>
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={addPerson} disabled={!personForm.name}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium transition-colors">
                {t.save}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setPersonForm(emptyPersonForm()); }}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors">
                {t.cancel}
              </button>
            </div>
          </div>
        )}

        {(reg.personnel ?? []).length === 0 ? (
          <div className="text-center py-10 text-sm text-slate-400 dark:text-slate-500">{t.noPersonnel}</div>
        ) : (
          <div className="space-y-3">
            {(reg.personnel ?? []).map(person => (
              <PersonRow
                key={person.id}
                person={person}
                isInside={(reg.activeEntrants ?? []).includes(person.id)}
                t={t}
                readOnly={readOnly}
                onEntry={() => recordAction(person.id, 'entry')}
                onExit={() => recordAction(person.id, 'exit')}
                onEmergency={() => recordAction(person.id, 'emergency_exit')}
                onDelete={() => deletePerson(person.id)}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Entry log */}
      <Card title={t.entryLog} icon={<Clock className="w-5 h-5" />} collapsible>
        {(reg.entryLog ?? []).length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-400 dark:text-slate-500">{t.noLog}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <th className="pb-2 pr-4">{language === 'fr' ? 'Horodatage' : 'Timestamp'}</th>
                  <th className="pb-2 pr-4">{language === 'fr' ? 'Personne' : 'Person'}</th>
                  <th className="pb-2 pr-4">{t.action}</th>
                  <th className="pb-2">{t.authorizedBy}</th>
                </tr>
              </thead>
              <tbody>
                {(reg.entryLog ?? []).slice().reverse().map(entry => {
                  const person = reg.personnel.find(p => p.id === entry.personnelId);
                  return (
                    <tr key={entry.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td className="py-2 pr-4 text-slate-500 text-xs">
                        {new Date(entry.timestamp).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA')}
                      </td>
                      <td className="py-2 pr-4 font-medium text-slate-700 dark:text-slate-200">{person?.name ?? '—'}</td>
                      <td className="py-2 pr-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          entry.action === 'entry' ? 'bg-green-100 text-green-700' :
                          entry.action === 'emergency_exit' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {entry.action === 'entry' ? <LogIn className="w-3 h-3" /> : entry.action === 'emergency_exit' ? <AlertTriangle className="w-3 h-3" /> : <LogOut className="w-3 h-3" />}
                          {entry.action === 'entry' ? t.entryAt : entry.action === 'emergency_exit' ? t.recordEmergency : t.exitAt}
                        </span>
                      </td>
                      <td className="py-2 text-slate-500 text-xs">{entry.authorizedBy || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Communication settings */}
      <Card title={t.communication} icon={<Shield className="w-5 h-5" />} collapsible>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>{language === 'fr' ? 'Type' : 'Type'}</label>
            <select value={reg.communicationProtocol?.type ?? 'radio'}
              onChange={e => updateReg({ communicationProtocol: { ...reg.communicationProtocol, type: e.target.value as any } })}
              disabled={readOnly} className={inputClass}>
              {Object.entries(t.communicationTypes).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>{t.checkInterval}</label>
            <input type="number" min={5} max={60} value={reg.communicationProtocol?.checkInterval ?? 15}
              onChange={e => updateReg({ communicationProtocol: { ...reg.communicationProtocol, checkInterval: parseInt(e.target.value) || 15 } })}
              disabled={readOnly} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{t.maxOccupancy}</label>
            <input type="number" min={1} max={20} value={reg.maxOccupancy ?? 2}
              onChange={e => updateReg({ maxOccupancy: parseInt(e.target.value) || 2 })}
              disabled={readOnly} className={inputClass} />
          </div>
        </div>
      </Card>
    </div>
  );
}
