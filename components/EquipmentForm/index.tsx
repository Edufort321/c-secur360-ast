'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Camera, Trash2, Save, ArrowLeft, Loader2 } from 'lucide-react';
import {
  INSPECTION_TYPE_OPTIONS, FREQUENCY_OPTIONS,
  type InspectionType, type InspectionFrequency,
} from '@/components/InspectionForm/checklists';
import { PortalHeader } from '@/components/PortalHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import { compressPhoto } from '@/lib/utils/photo';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface EquipmentRow {
  id: string;
  tenant_id: string;
  equipment_type: InspectionType;
  equipment_name: string | null;
  equipment_serial: string | null;
  equipment_location: string | null;
  equipment_photos: string[];
  inspection_frequency: InspectionFrequency | null;
  inspection_shifts: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface FormState {
  equipmentType: InspectionType;
  equipmentName: string;
  equipmentSerial: string;
  equipmentLocation: string;
  equipmentPhotos: string[];
  inspectionFrequency: InspectionFrequency | null;
  inspectionShifts: string[];
  notes: string;
}

const EMPTY: FormState = {
  equipmentType:       'harness',
  equipmentName:       '',
  equipmentSerial:     '',
  equipmentLocation:   '',
  equipmentPhotos:     [],
  inspectionFrequency: null,
  inspectionShifts:    [],
  notes:               '',
};

interface Props {
  tenant: string;
  equipmentId?: string;
  onClose: () => void;
  onSaved?: (id: string) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function EquipmentForm({ tenant, equipmentId, onClose, onSaved }: Props) {
  const { lang } = useLanguage();
  const fr = lang === 'fr';

  const [form,    setForm]    = useState<FormState>(EMPTY);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Load logo
  useEffect(() => {
    if (!supabase || !tenant) return;
    supabase.from('tenants').select('logo_url').eq('subdomain', tenant).maybeSingle()
      .then(({ data }) => { if (data?.logo_url) setLogoUrl(data.logo_url); }, () => {});
  }, [tenant]);

  // Load existing equipment
  useEffect(() => {
    if (!equipmentId || !supabase) return;
    supabase.from('equipment').select('*').eq('id', equipmentId).maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        const r = data as EquipmentRow;
        setForm({
          equipmentType:       r.equipment_type,
          equipmentName:       r.equipment_name ?? '',
          equipmentSerial:     r.equipment_serial ?? '',
          equipmentLocation:   r.equipment_location ?? '',
          equipmentPhotos:     r.equipment_photos ?? [],
          inspectionFrequency: r.inspection_frequency ?? null,
          inspectionShifts:    r.inspection_shifts ?? [],
          notes:               r.notes ?? '',
        });
      });
  }, [equipmentId]);

  async function handleSave() {
    if (saving || !supabase) return;
    setSaving(true);
    const payload = {
      tenant_id:            tenant,
      equipment_type:       form.equipmentType,
      equipment_name:       form.equipmentName  || null,
      equipment_serial:     form.equipmentSerial || null,
      equipment_location:   form.equipmentLocation || null,
      equipment_photos:     form.equipmentPhotos,
      inspection_frequency: form.inspectionFrequency || null,
      inspection_shifts:    form.inspectionFrequency === 'par_quart' ? form.inspectionShifts : [],
      notes:                form.notes || null,
      updated_at:           new Date().toISOString(),
    };

    let savedId = equipmentId ?? null;

    if (!equipmentId) {
      const { data } = await supabase.from('equipment').insert(payload).select('id').single();
      savedId = data?.id ?? null;
    } else {
      await supabase.from('equipment').update(payload).eq('id', equipmentId);
    }

    setSaving(false);
    if (savedId) {
      setMsg(fr ? 'Enregistré ✓' : 'Saved ✓');
      setTimeout(() => setMsg(''), 2500);
      onSaved?.(savedId);
    }
  }

  const fieldClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400';

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalHeader tenant={tenant} />

      {/* Header */}
      <div className="sticky top-[80px] z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button onClick={onClose} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
            <ArrowLeft size={16} />
            {fr ? 'Retour' : 'Back'}
          </button>
          <h1 className="text-sm font-semibold text-gray-800">
            {equipmentId ? (fr ? 'Modifier l\'équipement' : 'Edit equipment') : (fr ? 'Nouvel équipement' : 'New equipment')}
          </h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg disabled:opacity-60"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {msg || (saving ? (fr ? 'Sauvegarde…' : 'Saving…') : (fr ? 'Enregistrer' : 'Save'))}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* Identification */}
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-700">
            {fr ? 'Identification de l\'équipement' : 'Equipment identification'}
          </div>
          <div className="p-5 space-y-4">

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{fr ? 'Type d\'équipement' : 'Equipment type'} *</label>
              <select
                value={form.equipmentType}
                onChange={e => setForm(f => ({ ...f, equipmentType: e.target.value as InspectionType }))}
                className={fieldClass}
              >
                {INSPECTION_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{fr ? 'Nom / Désignation' : 'Name / Description'}</label>
                <input type="text" value={form.equipmentName} onChange={e => setForm(f => ({ ...f, equipmentName: e.target.value }))}
                  placeholder={fr ? 'ex. Chariot #12' : 'e.g. Forklift #12'} className={fieldClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{fr ? 'N° de série' : 'Serial #'}</label>
                <input type="text" value={form.equipmentSerial} onChange={e => setForm(f => ({ ...f, equipmentSerial: e.target.value }))}
                  placeholder={fr ? 'ex. SN-2024-ABC' : 'e.g. SN-2024-ABC'} className={fieldClass} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{fr ? 'Emplacement / Chantier' : 'Location / Site'}</label>
              <input type="text" value={form.equipmentLocation} onChange={e => setForm(f => ({ ...f, equipmentLocation: e.target.value }))}
                placeholder={fr ? 'ex. Site A, Zone 3' : 'e.g. Site A, Zone 3'} className={fieldClass} />
            </div>
          </div>
        </section>

        {/* Fréquence */}
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-700">
            {fr ? 'Fréquence d\'inspection' : 'Inspection frequency'}
          </div>
          <div className="p-5 space-y-3">
            <select
              value={form.inspectionFrequency ?? ''}
              onChange={e => setForm(f => ({ ...f, inspectionFrequency: (e.target.value || null) as InspectionFrequency | null }))}
              className={fieldClass}
            >
              <option value="">{fr ? '— Sélectionner —' : '— Select —'}</option>
              {FREQUENCY_OPTIONS.map(o => <option key={o.value} value={o.value}>{fr ? o.label : o.labelEn}</option>)}
            </select>

            {form.inspectionFrequency === 'par_quart' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-medium text-blue-700 mb-2">{fr ? 'Quarts de travail applicables' : 'Applicable work shifts'}</p>
                <div className="flex flex-wrap gap-4">
                  {([['jour', fr ? 'Jour' : 'Day'], ['soir', fr ? 'Soir' : 'Evening'], ['nuit', fr ? 'Nuit' : 'Night']] as [string,string][]).map(([val, lbl]) => (
                    <label key={val} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input type="checkbox"
                        checked={form.inspectionShifts.includes(val)}
                        onChange={e => setForm(f => ({
                          ...f,
                          inspectionShifts: e.target.checked
                            ? [...f.inspectionShifts, val]
                            : f.inspectionShifts.filter(s => s !== val),
                        }))}
                        className="w-4 h-4 rounded accent-teal-600" />
                      {lbl}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Photos */}
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-700">
            {fr ? 'Photos de l\'équipement' : 'Equipment photos'}
          </div>
          <div className="p-5">
            <div className="flex flex-wrap gap-2">
              {form.equipmentPhotos.map((src, idx) => (
                <div key={idx} className="relative">
                  <img src={src} alt={`Photo ${idx + 1}`}
                    className="h-24 w-24 rounded-xl border border-gray-200 object-cover cursor-pointer"
                    onClick={() => window.open(src, '_blank')} />
                  <button onClick={() => setForm(f => ({ ...f, equipmentPhotos: f.equipmentPhotos.filter((_, i) => i !== idx) }))}
                    className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow text-gray-500 hover:text-red-500">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center gap-1 cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-3 hover:border-teal-400 text-xs text-gray-500 h-24 w-24">
                <Camera size={18} className="text-teal-500" />
                {fr ? 'Ajouter' : 'Add'}
                <input type="file" accept="image/*" multiple className="hidden"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files ?? []);
                    const compressed = await Promise.all(files.map(f => compressPhoto(f).catch(() => null)));
                    const valid = compressed.filter(Boolean) as string[];
                    setForm(f => ({ ...f, equipmentPhotos: [...f.equipmentPhotos, ...valid] }));
                    e.target.value = '';
                  }} />
              </label>
            </div>
          </div>
        </section>

        {/* Notes */}
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-700">
            {fr ? 'Notes' : 'Notes'}
          </div>
          <div className="p-5">
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3}
              placeholder={fr ? 'Informations supplémentaires sur l\'équipement…' : 'Additional equipment information…'}
              className={`${fieldClass} resize-none`}
            />
          </div>
        </section>

      </div>
    </div>
  );
}
