'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Camera, Trash2, Save, ArrowLeft, Loader2, QrCode, ClipboardCopy, Download, ClipboardCheck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  INSPECTION_TYPE_OPTIONS, FREQUENCY_OPTIONS, CANADIAN_PROVINCES,
  type InspectionType, type InspectionFrequency, type ProvinceCode,
} from '@/components/InspectionForm/checklists';
import { PortalHeader } from '@/components/PortalHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import { uploadPhoto } from '@/lib/utils/photo';
import { getSitesTree, siteLabel, type SiteNode } from '@/lib/sites';

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
  site_id: string | null;
  department_id: string | null;
  equipment_photos: string[];
  inspection_frequency: InspectionFrequency | null;
  inspection_shifts: string[];
  province: ProvinceCode;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface FormState {
  equipmentType: InspectionType;
  equipmentName: string;
  equipmentSerial: string;
  equipmentLocation: string;
  siteId: string;
  departmentId: string;
  equipmentPhotos: string[];
  inspectionFrequency: InspectionFrequency | null;
  inspectionShifts: string[];
  province: ProvinceCode;
  notes: string;
}

const EMPTY: FormState = {
  equipmentType:       'harness',
  equipmentName:       '',
  equipmentSerial:     '',
  equipmentLocation:   '',
  siteId:              '',
  departmentId:        '',
  equipmentPhotos:     [],
  inspectionFrequency: null,
  inspectionShifts:    [],
  province:            'QC',
  notes:               '',
};

interface Props {
  tenant: string;
  equipmentId?: string;
  onClose: () => void;
  onSaved?: (id: string, type?: string) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function EquipmentForm({ tenant, equipmentId, onClose, onSaved }: Props) {
  const { lang } = useLanguage();
  const fr = lang === 'fr';

  const [form,      setForm]      = useState<FormState>(EMPTY);
  const [saving,    setSaving]    = useState(false);
  const [msg,       setMsg]       = useState('');
  const [logoUrl,   setLogoUrl]   = useState<string | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(equipmentId ?? null);
  const [copied,    setCopied]    = useState(false);
  const [lightbox,  setLightbox]  = useState<string | null>(null);
  const [sites,     setSites]     = useState<SiteNode[]>([]);

  // Load logo
  useEffect(() => {
    if (!supabase || !tenant) return;
    supabase.from('tenants').select('logo_url').eq('subdomain', tenant).maybeSingle()
      .then(({ data }) => { if (data?.logo_url) setLogoUrl(data.logo_url); }, () => {});
  }, [tenant]);

  // Sites/Départements gérés par l'admin (source unique) -> alimente le sélecteur d'emplacement.
  useEffect(() => { if (tenant) getSitesTree(tenant).then(setSites); }, [tenant]);

  const deptOptions = sites.find(s => s.id === form.siteId)?.departments ?? [];

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
          siteId:              r.site_id ?? '',
          departmentId:        r.department_id ?? '',
          equipmentPhotos:     r.equipment_photos ?? [],
          inspectionFrequency: r.inspection_frequency ?? null,
          inspectionShifts:    r.inspection_shifts ?? [],
          province:            r.province ?? 'QC',
          notes:               r.notes ?? '',
        });
      });
  }, [equipmentId]);

  async function handleSave() {
    if (saving || !supabase) return;
    setSaving(true);
    setMsg('');
    try {
      const payload = {
        tenant_id:            tenant,
        equipment_type:       form.equipmentType,
        equipment_name:       form.equipmentName  || null,
        equipment_serial:     form.equipmentSerial || null,
        site_id:              form.siteId || null,
        department_id:        form.departmentId || null,
        // Libellé lisible (Site · Département) conservé dans equipment_location pour les vues/listes existantes.
        equipment_location:   form.siteId ? siteLabel(sites, form.siteId, form.departmentId) : (form.equipmentLocation || null),
        equipment_photos:     form.equipmentPhotos,
        inspection_frequency: form.inspectionFrequency || null,
        inspection_shifts:    form.inspectionFrequency === 'par_quart' ? form.inspectionShifts : [],
        province:             form.province,
        notes:                form.notes || null,
        updated_at:           new Date().toISOString(),
      };

      let savedId: string | null = equipmentId ?? null;

      if (!equipmentId) {
        const { data, error } = await supabase.from('equipment').insert(payload).select('id').single();
        if (error) throw error;
        savedId = data?.id ?? null;
      } else {
        const { error } = await supabase.from('equipment').update(payload).eq('id', equipmentId);
        if (error) throw error;
        savedId = equipmentId;
      }

      if (savedId) {
        setCurrentId(savedId);
        setMsg(fr ? 'Enregistré ✓' : 'Saved ✓');
        setTimeout(() => setMsg(''), 2500);
        onSaved?.(savedId, form.equipmentType);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setMsg(fr ? `Erreur : ${msg}` : `Error: ${msg}`);
      setTimeout(() => setMsg(''), 6000);
    } finally {
      setSaving(false);
    }
  }

  function handleCopyLink() {
    if (!currentId) return;
    const url = `${window.location.origin}/${tenant}/equipment/${currentId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownloadQR() {
    if (!currentId) return;
    const svg = document.getElementById('equipment-qr-svg');
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([xml], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `qr-${form.equipmentName || currentId}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{fr ? 'Site' : 'Site'}</label>
                {sites.length > 0 ? (
                  <select value={form.siteId}
                    onChange={e => setForm(f => ({ ...f, siteId: e.target.value, departmentId: '' }))}
                    className={fieldClass}>
                    <option value="">{fr ? '— Aucun —' : '— None —'}</option>
                    {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                ) : (
                  // Repli : aucun site configuré dans l'admin -> texte libre (rétrocompatible).
                  <input type="text" value={form.equipmentLocation} onChange={e => setForm(f => ({ ...f, equipmentLocation: e.target.value }))}
                    placeholder={fr ? 'Créez des sites dans Admin › Sites/Départements' : 'Create sites in Admin › Sites/Departments'} className={fieldClass} />
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{fr ? 'Département' : 'Department'}</label>
                <select value={form.departmentId}
                  onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))}
                  disabled={!form.siteId || deptOptions.length === 0}
                  className={fieldClass + (!form.siteId || deptOptions.length === 0 ? ' opacity-50' : '')}>
                  <option value="">{fr ? '— Tout le site —' : '— Whole site —'}</option>
                  {deptOptions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">{fr ? 'Province' : 'Province'}</label>
                <select
                  value={form.province}
                  onChange={e => setForm(f => ({ ...f, province: e.target.value as ProvinceCode }))}
                  className={fieldClass}
                >
                  {CANADIAN_PROVINCES.map(p => (
                    <option key={p.code} value={p.code}>{p.code} — {fr ? p.fr : p.en}</option>
                  ))}
                </select>
              </div>
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
                    onClick={() => setLightbox(src)} />
                  <button onClick={() => setForm(f => ({ ...f, equipmentPhotos: f.equipmentPhotos.filter((_, i) => i !== idx) }))}
                    className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow text-gray-500 hover:text-red-500">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center gap-1 cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-3 hover:border-teal-400 text-xs text-gray-500 h-24 w-24">
                <Camera size={18} className="text-teal-500" />
                {fr ? 'Ajouter' : 'Add'}
                <input type="file" accept="image/*,image/heic,image/heif" multiple className="hidden"
                  onChange={async (e) => {
                    if (!supabase) return;
                    const files = Array.from(e.target.files ?? []);
                    let errCount = 0;
                    const results = await Promise.all(files.map(async f => {
                      try { return await uploadPhoto(f, tenant, supabase); }
                      catch (err) {
                        errCount++;
                        console.warn('Photo upload failed:', f.name, err);
                        return null;
                      }
                    }));
                    if (errCount > 0) {
                      setMsg(fr
                        ? `${errCount} photo(s) non ajoutée(s) — format non supporté ou photo trop volumineuse`
                        : `${errCount} photo(s) not added — unsupported format or too large`);
                      setTimeout(() => setMsg(''), 5000);
                    }
                    const valid = results.filter(Boolean) as string[];
                    if (valid.length > 0) setForm(f => ({ ...f, equipmentPhotos: [...f.equipmentPhotos, ...valid] }));
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

        {/* Code QR — visible dès qu'un ID existe */}
        {currentId && (
          <section className="bg-white rounded-xl border border-teal-200 overflow-hidden">
            <div className="px-5 py-3 bg-teal-50 border-b border-teal-100 flex items-center gap-2">
              <QrCode size={15} className="text-teal-600" />
              <span className="text-sm font-semibold text-teal-800">
                {fr ? 'Code QR de l\'équipement' : 'Equipment QR code'}
              </span>
            </div>
            <div className="p-5 flex flex-col items-center gap-4">
              <p className="text-xs text-gray-500 text-center">
                {fr
                  ? 'Imprimez ce code et collez-le sur l\'équipement. Il donne accès à la fiche publique et permet de démarrer une inspection directement.'
                  : 'Print and attach this code to the equipment. It gives access to the public sheet and allows starting an inspection directly.'}
              </p>

              <div className="p-4 bg-white border-2 border-gray-200 rounded-2xl shadow-sm">
                <QRCodeSVG
                  id="equipment-qr-svg"
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/${tenant}/equipment/${currentId}`}
                  size={180}
                  level="M"
                  includeMargin={false}
                />
              </div>

              <div className="flex gap-2 w-full max-w-xs">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ClipboardCopy size={14} />
                  {copied ? (fr ? 'Copié ✓' : 'Copied ✓') : (fr ? 'Copier le lien' : 'Copy link')}
                </button>
                <button
                  onClick={handleDownloadQR}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Download size={14} />
                  {fr ? 'Télécharger' : 'Download'}
                </button>
              </div>

              <a
                href={`/${tenant}/equipment/${currentId}/inspect`}
                className="flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-800"
              >
                <ClipboardCheck size={13} />
                {fr ? 'Démarrer une inspection →' : 'Start inspection →'}
              </a>
            </div>
          </section>
        )}

      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="" className="max-h-full max-w-full rounded-xl object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
