'use client';

import React, { useState } from 'react';
import {
  Shield, Plus, Trash2, Phone, MapPin, Users, AlertTriangle,
  Clock, Wrench, ChevronDown, ChevronUp, Building
} from 'lucide-react';
import {
  ConfinedSpacePermit, ProvinceCode, EmergencyContact,
  RescueTeamMember, EquipmentItem, generateId
} from './SafetyManager';

type Language = 'fr' | 'en';

interface Props {
  language: Language;
  permitData: ConfinedSpacePermit;
  selectedProvince: ProvinceCode;
  readOnly?: boolean;
  onUpdate: (data: Partial<ConfinedSpacePermit['rescuePlan']>) => void;
}

// ── Translations ───────────────────────────────────────────────────────────
const T = {
  fr: {
    sections: {
      contacts: "Contacts d'urgence",
      team: 'Équipe de sauvetage',
      equipment: 'Équipement de sauvetage',
      procedure: "Procédure d'évacuation",
      hospital: 'Hôpital le plus proche',
      compliance: 'Conformité réglementaire',
    },
    name: 'Nom complet',
    namePh: 'Prénom et nom',
    role: 'Rôle / Poste',
    rolePh: 'ex. Pompier, Infirmier, Responsable sécurité',
    phone: 'Téléphone',
    phonePh: '514-555-0100',
    email: 'Courriel',
    emailPh: 'exemple@domain.com',
    isPrimary: 'Contact principal',
    addContact: 'Ajouter contact',
    addMember: 'Ajouter membre',
    addEquipment: 'Ajouter équipement',
    noContacts: "Aucun contact d'urgence",
    noTeam: 'Aucun membre enregistré',
    noEquipment: 'Aucun équipement',
    certification: 'Certification',
    certificationPh: 'ex. NFPA 1006, CSA Z1006',
    isOnCall: 'En service / Sur appel',
    equipmentName: "Nom de l'équipement",
    equipmentNamePh: 'ex. Harnais de sauvetage, SCBA',
    equipmentType: "Type d'équipement",
    equipmentTypes: {
      harness: 'Harnais',
      scba: 'SCBA / ARI',
      tripod: 'Trépied / Treuil',
      retrieval: 'Système de récupération',
      communication: 'Communication',
      first_aid: 'Premiers secours',
      other: 'Autre',
    },
    serialNumber: 'Numéro de série',
    lastInspection: 'Dernière inspection',
    nextInspection: 'Prochaine inspection',
    isAvailable: 'Disponible',
    evacuationProcedure: "Procédure d'évacuation",
    evacuationPh: "Décrivez les étapes d'évacuation, les responsabilités et les contacts à notifier en cas d'urgence…",
    communicationPlan: 'Plan de communication',
    communicationPh: "Protocole de communication entre le superviseur, le surveillant et l'équipe de sauvetage…",
    responseTime: 'Délai de réponse (minutes)',
    hospitalName: "Nom de l'hôpital",
    hospitalAddress: 'Adresse',
    hospitalPhone: 'Téléphone urgences',
    hospitalDistance: 'Distance (km)',
    cancel: 'Annuler',
    save: 'Enregistrer',
    delete: 'Supprimer',
    available: 'Disponible',
    unavailable: 'Indisponible',
    compliance: {
      csa_z1006_certified: 'Équipe certifiée CSA Z1006',
      first_aid_level2: 'Premiers soins niveau 2',
      cpr_certified: 'RCR certifié',
      response_time_verified: 'Délai de réponse vérifié',
      rescue_plan_validated: 'Plan de sauvetage validé',
      annual_drill_required: "Exercice annuel complété",
      regulatory_compliance_verified: "Conformité réglementaire vérifiée",
    },
  },
  en: {
    sections: {
      contacts: 'Emergency contacts',
      team: 'Rescue team',
      equipment: 'Rescue equipment',
      procedure: 'Evacuation procedure',
      hospital: 'Nearest hospital',
      compliance: 'Regulatory compliance',
    },
    name: 'Full name',
    namePh: 'First and last name',
    role: 'Role / Position',
    rolePh: 'e.g. Firefighter, Nurse, Safety officer',
    phone: 'Phone',
    phonePh: '514-555-0100',
    email: 'Email',
    emailPh: 'example@domain.com',
    isPrimary: 'Primary contact',
    addContact: 'Add contact',
    addMember: 'Add member',
    addEquipment: 'Add equipment',
    noContacts: 'No emergency contacts',
    noTeam: 'No members registered',
    noEquipment: 'No equipment',
    certification: 'Certification',
    certificationPh: 'e.g. NFPA 1006, CSA Z1006',
    isOnCall: 'On duty / On call',
    equipmentName: 'Equipment name',
    equipmentNamePh: 'e.g. Rescue harness, SCBA',
    equipmentType: 'Equipment type',
    equipmentTypes: {
      harness: 'Harness',
      scba: 'SCBA',
      tripod: 'Tripod / Winch',
      retrieval: 'Retrieval system',
      communication: 'Communication',
      first_aid: 'First aid',
      other: 'Other',
    },
    serialNumber: 'Serial number',
    lastInspection: 'Last inspection',
    nextInspection: 'Next inspection',
    isAvailable: 'Available',
    evacuationProcedure: 'Evacuation procedure',
    evacuationPh: 'Describe the evacuation steps, responsibilities, and contacts to notify in an emergency…',
    communicationPlan: 'Communication plan',
    communicationPh: 'Communication protocol between supervisor, attendant, and rescue team…',
    responseTime: 'Response time (minutes)',
    hospitalName: 'Hospital name',
    hospitalAddress: 'Address',
    hospitalPhone: 'Emergency phone',
    hospitalDistance: 'Distance (km)',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    available: 'Available',
    unavailable: 'Unavailable',
    compliance: {
      csa_z1006_certified: 'CSA Z1006 certified team',
      first_aid_level2: 'Level 2 first aid',
      cpr_certified: 'CPR certified',
      response_time_verified: 'Response time verified',
      rescue_plan_validated: 'Rescue plan validated',
      annual_drill_required: 'Annual drill completed',
      regulatory_compliance_verified: 'Regulatory compliance verified',
    },
  },
} as const;

// ── UI primitives ──────────────────────────────────────────────────────────
const inputClass = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors disabled:bg-slate-50';
const labelClass = 'block text-xs font-medium text-slate-500 mb-1';

function Card({
  title, icon, children, collapsible = false,
}: { title: string; icon: React.ReactNode; children: React.ReactNode; collapsible?: boolean }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <button
        type="button"
        onClick={() => collapsible && setOpen(v => !v)}
        className={`w-full flex items-center gap-3 px-5 py-4 border-b border-slate-100 text-left ${collapsible ? 'hover:bg-slate-50 transition-colors' : ''}`}
      >
        <span className="text-blue-600">{icon}</span>
        <h3 className="font-semibold text-slate-800 flex-1">{title}</h3>
        {collapsible && (open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />)}
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function RescuePlan({
  language, permitData, selectedProvince, readOnly = false, onUpdate,
}: Props) {
  const t = T[language];
  const rp = permitData.rescuePlan;
  const [showContactForm, setShowContactForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);

  const [contactForm, setContactForm] = useState({ name: '', role: '', phone: '', email: '', isPrimary: false });
  const [memberForm, setMemberForm] = useState({ name: '', role: '', certification: '', phone: '', isOnCall: true });
  const [equipForm, setEquipForm] = useState({ name: '', type: 'harness', serialNumber: '', lastInspection: '', nextInspection: '', isAvailable: true });

  const save = (patch: Partial<typeof rp>) =>
    onUpdate({ ...patch, lastUpdated: new Date().toISOString() });

  const addContact = () => {
    const c: EmergencyContact = {
      id: generateId(), name: contactForm.name, role: contactForm.role,
      phone: contactForm.phone, email: contactForm.email, isPrimary: contactForm.isPrimary,
    };
    save({ emergencyContacts: [...(rp.emergencyContacts ?? []), c] });
    setContactForm({ name: '', role: '', phone: '', email: '', isPrimary: false });
    setShowContactForm(false);
  };

  const addMember = () => {
    const m: RescueTeamMember = {
      id: generateId(), name: memberForm.name, role: memberForm.role,
      certification: memberForm.certification ? [memberForm.certification] : [],
      phone: memberForm.phone, isOnCall: memberForm.isOnCall,
    };
    save({ rescueTeam: [...(rp.rescueTeam ?? []), m] });
    setMemberForm({ name: '', role: '', certification: '', phone: '', isOnCall: true });
    setShowMemberForm(false);
  };

  const addEquipment = () => {
    const e: EquipmentItem = {
      id: generateId(), name: equipForm.name, type: equipForm.type,
      serialNumber: equipForm.serialNumber, lastInspection: equipForm.lastInspection,
      nextInspection: equipForm.nextInspection, isAvailable: equipForm.isAvailable,
    };
    save({ rescueEquipment: [...(rp.rescueEquipment ?? []), e] });
    setEquipForm({ name: '', type: 'harness', serialNumber: '', lastInspection: '', nextInspection: '', isAvailable: true });
    setShowEquipmentForm(false);
  };

  const complianceKeys = Object.keys(t.compliance) as (keyof typeof t.compliance)[];

  return (
    <div>
      {/* Emergency contacts */}
      <Card title={t.sections.contacts} icon={<Phone className="w-5 h-5" />}>
        {!readOnly && (
          <button type="button" onClick={() => setShowContactForm(v => !v)}
            className="flex items-center gap-2 mb-5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />{t.addContact}
          </button>
        )}
        {showContactForm && (
          <div className="mb-5 border border-slate-200 rounded-xl bg-slate-50 p-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {([
                ['name', t.name, t.namePh, 'text'],
                ['role', t.role, t.rolePh, 'text'],
                ['phone', t.phone, t.phonePh, 'tel'],
                ['email', t.email, t.emailPh, 'email'],
              ] as [string, string, string, string][]).map(([field, label, ph, type]) => (
                <div key={field}>
                  <label className={labelClass}>{label}</label>
                  <input type={type} value={(contactForm as any)[field]} placeholder={ph}
                    onChange={e => setContactForm(f => ({ ...f, [field]: e.target.value }))}
                    className={inputClass} />
                </div>
              ))}
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={contactForm.isPrimary}
                onChange={e => setContactForm(f => ({ ...f, isPrimary: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-300 text-blue-600" />
              <span className="text-sm text-slate-700">{t.isPrimary}</span>
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={addContact} disabled={!contactForm.name || !contactForm.phone}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium">
                {t.save}
              </button>
              <button type="button" onClick={() => setShowContactForm(false)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium">
                {t.cancel}
              </button>
            </div>
          </div>
        )}
        {(rp.emergencyContacts ?? []).length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-400">{t.noContacts}</div>
        ) : (
          <div className="space-y-3">
            {(rp.emergencyContacts ?? []).map(c => (
              <div key={c.id} className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${c.isPrimary ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-slate-800">{c.name}</span>
                    {c.isPrimary && (
                      <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                        {t.isPrimary}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {c.role && <span className="mr-3">{c.role}</span>}
                    {c.phone && <span><Phone className="w-3 h-3 inline mr-0.5" />{c.phone}</span>}
                  </div>
                </div>
                {!readOnly && (
                  <button type="button"
                    onClick={() => save({ emergencyContacts: rp.emergencyContacts.filter(x => x.id !== c.id) })}
                    className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Rescue team */}
      <Card title={t.sections.team} icon={<Users className="w-5 h-5" />} collapsible>
        {!readOnly && (
          <button type="button" onClick={() => setShowMemberForm(v => !v)}
            className="flex items-center gap-2 mb-5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />{t.addMember}
          </button>
        )}
        {showMemberForm && (
          <div className="mb-5 border border-slate-200 rounded-xl bg-slate-50 p-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {([
                ['name', t.name, t.namePh, 'text'],
                ['role', t.role, t.rolePh, 'text'],
                ['certification', t.certification, t.certificationPh, 'text'],
                ['phone', t.phone, t.phonePh, 'tel'],
              ] as [string, string, string, string][]).map(([field, label, ph, type]) => (
                <div key={field}>
                  <label className={labelClass}>{label}</label>
                  <input type={type} value={(memberForm as any)[field]} placeholder={ph}
                    onChange={e => setMemberForm(f => ({ ...f, [field]: e.target.value }))}
                    className={inputClass} />
                </div>
              ))}
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={memberForm.isOnCall}
                onChange={e => setMemberForm(f => ({ ...f, isOnCall: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-300 text-blue-600" />
              <span className="text-sm text-slate-700">{t.isOnCall}</span>
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={addMember} disabled={!memberForm.name}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium">
                {t.save}
              </button>
              <button type="button" onClick={() => setShowMemberForm(false)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium">
                {t.cancel}
              </button>
            </div>
          </div>
        )}
        {(rp.rescueTeam ?? []).length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-400">{t.noTeam}</div>
        ) : (
          <div className="space-y-2">
            {(rp.rescueTeam ?? []).map(m => (
              <div key={m.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-white">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-slate-800">{m.name}</span>
                    {m.isOnCall && (
                      <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                        {t.isOnCall}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {m.role && <span className="mr-3">{m.role}</span>}
                    {m.phone && <span><Phone className="w-3 h-3 inline mr-0.5" />{m.phone}</span>}
                    {m.certification?.length > 0 && <span className="ml-3">{m.certification.join(', ')}</span>}
                  </div>
                </div>
                {!readOnly && (
                  <button type="button"
                    onClick={() => save({ rescueTeam: rp.rescueTeam.filter(x => x.id !== m.id) })}
                    className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Rescue equipment */}
      <Card title={t.sections.equipment} icon={<Wrench className="w-5 h-5" />} collapsible>
        {!readOnly && (
          <button type="button" onClick={() => setShowEquipmentForm(v => !v)}
            className="flex items-center gap-2 mb-5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />{t.addEquipment}
          </button>
        )}
        {showEquipmentForm && (
          <div className="mb-5 border border-slate-200 rounded-xl bg-slate-50 p-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>{t.equipmentName}</label>
                <input type="text" value={equipForm.name} placeholder={t.equipmentNamePh}
                  onChange={e => setEquipForm(f => ({ ...f, name: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t.equipmentType}</label>
                <select value={equipForm.type}
                  onChange={e => setEquipForm(f => ({ ...f, type: e.target.value }))} className={inputClass}>
                  {Object.entries(t.equipmentTypes).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t.serialNumber}</label>
                <input type="text" value={equipForm.serialNumber}
                  onChange={e => setEquipForm(f => ({ ...f, serialNumber: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t.lastInspection}</label>
                <input type="date" value={equipForm.lastInspection}
                  onChange={e => setEquipForm(f => ({ ...f, lastInspection: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t.nextInspection}</label>
                <input type="date" value={equipForm.nextInspection}
                  onChange={e => setEquipForm(f => ({ ...f, nextInspection: e.target.value }))} className={inputClass} />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={equipForm.isAvailable}
                onChange={e => setEquipForm(f => ({ ...f, isAvailable: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-300 text-blue-600" />
              <span className="text-sm text-slate-700">{t.isAvailable}</span>
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={addEquipment} disabled={!equipForm.name}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium">
                {t.save}
              </button>
              <button type="button" onClick={() => setShowEquipmentForm(false)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium">
                {t.cancel}
              </button>
            </div>
          </div>
        )}
        {(rp.rescueEquipment ?? []).length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-400">{t.noEquipment}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-slate-500 border-b border-slate-200">
                  <th className="pb-2 pr-4">{t.equipmentName}</th>
                  <th className="pb-2 pr-4">{t.equipmentType}</th>
                  <th className="pb-2 pr-4">{t.nextInspection}</th>
                  <th className="pb-2">{t.isAvailable}</th>
                  {!readOnly && <th className="pb-2" />}
                </tr>
              </thead>
              <tbody>
                {(rp.rescueEquipment ?? []).map(e => (
                  <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 pr-4 font-medium text-slate-700">{e.name}</td>
                    <td className="py-2 pr-4 text-slate-500">{(t.equipmentTypes as any)[e.type] ?? e.type}</td>
                    <td className="py-2 pr-4 text-slate-500 text-xs">{e.nextInspection || '—'}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${e.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {e.isAvailable ? t.available : t.unavailable}
                      </span>
                    </td>
                    {!readOnly && (
                      <td className="py-2 pl-2">
                        <button type="button"
                          onClick={() => save({ rescueEquipment: rp.rescueEquipment.filter(x => x.id !== e.id) })}
                          className="p-1 rounded hover:bg-red-100 text-red-400 hover:text-red-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Evacuation procedure */}
      <Card title={t.sections.procedure} icon={<AlertTriangle className="w-5 h-5" />}>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>{t.evacuationProcedure}</label>
            <textarea
              value={rp.evacuationProcedure ?? ''}
              onChange={e => save({ evacuationProcedure: e.target.value })}
              placeholder={t.evacuationPh}
              rows={5}
              disabled={readOnly}
              className={`${inputClass} resize-y`}
            />
          </div>
          <div>
            <label className={labelClass}>{t.communicationPlan}</label>
            <textarea
              value={rp.communicationPlan ?? ''}
              onChange={e => save({ communicationPlan: e.target.value })}
              placeholder={t.communicationPh}
              rows={3}
              disabled={readOnly}
              className={`${inputClass} resize-y`}
            />
          </div>
          <div className="w-40">
            <label className={labelClass}>{t.responseTime}</label>
            <input
              type="number" min={1} max={120}
              value={rp.responseTime ?? ''}
              onChange={e => save({ responseTime: parseInt(e.target.value) || undefined })}
              disabled={readOnly}
              className={inputClass}
            />
          </div>
        </div>
      </Card>

      {/* Hospital */}
      <Card title={t.sections.hospital} icon={<Building className="w-5 h-5" />} collapsible>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>{t.hospitalName}</label>
            <input type="text" value={rp.hospitalInfo?.name ?? ''} disabled={readOnly}
              onChange={e => save({ hospitalInfo: { ...rp.hospitalInfo, name: e.target.value } })}
              className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{t.hospitalPhone}</label>
            <input type="tel" value={rp.hospitalInfo?.phone ?? ''} disabled={readOnly}
              onChange={e => save({ hospitalInfo: { ...rp.hospitalInfo, phone: e.target.value } })}
              className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{t.hospitalAddress}</label>
            <input type="text" value={rp.hospitalInfo?.address ?? ''} disabled={readOnly}
              onChange={e => save({ hospitalInfo: { ...rp.hospitalInfo, address: e.target.value } })}
              className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{t.hospitalDistance}</label>
            <input type="number" min={0} step={0.1} value={rp.hospitalInfo?.distance ?? ''} disabled={readOnly}
              onChange={e => save({ hospitalInfo: { ...rp.hospitalInfo, distance: parseFloat(e.target.value) || 0 } })}
              className={inputClass} />
          </div>
        </div>
      </Card>

      {/* Compliance checklist */}
      <Card title={t.sections.compliance} icon={<Shield className="w-5 h-5" />} collapsible>
        <div className="grid sm:grid-cols-2 gap-2">
          {complianceKeys.map(key => {
            const checked = !!(rp as any)[key];
            return (
              <label key={key} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-50 cursor-pointer select-none">
                <input type="checkbox" checked={checked} disabled={readOnly}
                  onChange={e => save({ [key]: e.target.checked } as any)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                <span className={`text-sm ${checked ? 'text-slate-700' : 'text-slate-500'}`}>{t.compliance[key]}</span>
              </label>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
