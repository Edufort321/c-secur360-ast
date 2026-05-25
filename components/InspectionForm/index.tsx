'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  ClipboardCheck, ChevronRight, Clock, Search, Plus, ArrowLeft,
  AlertTriangle, CheckCircle, XCircle, Camera, Trash2, ChevronDown,
  ChevronUp, AlertOctagon, Info, FileText,
} from 'lucide-react';
import {
  EQUIPMENT_CHECKLISTS, INSPECTION_TYPE_OPTIONS,
  calcOverallResult, getNonConformities,
  type InspectionType, type ItemResult, type OverallResult,
} from './checklists';

// ─── Supabase ────────────────────────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// ─── Types ───────────────────────────────────────────────────────────────────

interface InspectionRow {
  id: string;
  inspection_number: string;
  equipment_type: InspectionType;
  equipment_name: string | null;
  equipment_serial: string | null;
  equipment_location: string | null;
  equipment_photo: string | null;
  inspector_name: string | null;
  inspection_date: string | null;
  status: 'draft' | 'submitted' | 'closed';
  overall_result: OverallResult | null;
  results: Record<string, ItemResult>;
  item_photos: Record<string, string>;
  item_notes: Record<string, string>;
  non_conformities: { id: string; label: string; critical: boolean; withdrawal: boolean }[];
  notes: string | null;
  created_at: string;
}

interface FormState {
  equipmentType: InspectionType;
  equipmentName: string;
  equipmentSerial: string;
  equipmentLocation: string;
  equipmentPhoto: string | null;
  inspectorName: string;
  inspectionDate: string;
  results: Record<string, ItemResult>;
  itemPhotos: Record<string, string>;
  itemNotes: Record<string, string>;
  notes: string;
}

const EMPTY_FORM: FormState = {
  equipmentType: 'harness',
  equipmentName: '',
  equipmentSerial: '',
  equipmentLocation: '',
  equipmentPhoto: null,
  inspectorName: '',
  inspectionDate: new Date().toISOString().split('T')[0],
  results: {},
  itemPhotos: {},
  itemNotes: {},
  notes: '',
};

// ─── Visual helpers ──────────────────────────────────────────────────────────

const RESULT_CONFIG: Record<OverallResult, { label: string; color: string; bgColor: string; Icon: React.ElementType }> = {
  conforme:     { label: 'Conforme',       color: 'text-green-700',  bgColor: 'bg-green-100 border-green-300',  Icon: CheckCircle },
  conditionnel: { label: 'Conditionnel',   color: 'text-yellow-700', bgColor: 'bg-yellow-100 border-yellow-300', Icon: AlertTriangle },
  non_conforme: { label: 'Non conforme',   color: 'text-red-700',    bgColor: 'bg-red-100 border-red-300',      Icon: XCircle },
  retrait:      { label: 'RETRAIT IMMÉDIAT', color: 'text-white',    bgColor: 'bg-red-600 border-red-700',      Icon: AlertOctagon },
  incomplete:   { label: 'En cours',       color: 'text-gray-600',   bgColor: 'bg-gray-100 border-gray-300',    Icon: ClipboardCheck },
};

const STATUS_LABEL: Record<string, string> = { draft: 'Brouillon', submitted: 'Soumis', closed: 'Fermé' };
const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600', submitted: 'bg-teal-100 text-teal-700', closed: 'bg-slate-100 text-slate-600',
};

// ─── Utilities ───────────────────────────────────────────────────────────────

async function compressPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 900;
      let w = img.width, h = img.height;
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
        else { w = Math.round(w * MAX / h); h = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Erreur chargement image')); };
    img.src = url;
  });
}

function genInspectionNumber(rows: InspectionRow[]): string {
  const year = new Date().getFullYear();
  const prefix = `INS-${year}-`;
  const nums = rows.filter(r => r.inspection_number.startsWith(prefix))
    .map(r => parseInt(r.inspection_number.replace(prefix, ''), 10))
    .filter(n => !isNaN(n));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `${prefix}${String(next).padStart(3, '0')}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ResultBadge({ result, size = 'sm' }: { result: OverallResult | null; size?: 'sm' | 'md' }) {
  if (!result) return null;
  const cfg = RESULT_CONFIG[result];
  const cls = size === 'md'
    ? 'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold border'
    : 'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border';
  return (
    <span className={`${cls} ${cfg.bgColor} ${cfg.color}`}>
      <cfg.Icon size={size === 'md' ? 16 : 12} />
      {cfg.label}
    </span>
  );
}

function ResultToggle({ value, onChange, disabled }: {
  value: ItemResult | undefined;
  onChange: (v: ItemResult | null) => void;
  disabled?: boolean;
}) {
  const options: { v: ItemResult; label: string; active: string }[] = [
    { v: 'pass', label: '✓', active: 'bg-green-100 text-green-700 border-green-400 font-bold' },
    { v: 'fail', label: '✗', active: 'bg-red-100 text-red-700 border-red-400 font-bold' },
    { v: 'na',   label: 'N/A', active: 'bg-gray-200 text-gray-600 border-gray-400 font-semibold' },
  ];
  return (
    <div className="flex gap-1 shrink-0">
      {options.map(({ v, label, active }) => (
        <button
          key={v}
          type="button"
          disabled={disabled}
          onClick={() => onChange(value === v ? null : v)}
          className={`px-2 py-0.5 text-xs rounded border transition-colors ${
            value === v ? active : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-default' : 'cursor-pointer'}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function PhotoInput({ value, onChange, disabled, label }: {
  value: string | null;
  onChange: (v: string | null) => void;
  disabled?: boolean;
  label?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center gap-2">
      <input
        ref={ref} type="file" accept="image/*" capture="environment"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          try { onChange(await compressPhoto(file)); } catch { /* ignore */ }
          e.target.value = '';
        }}
        disabled={disabled}
      />
      {value ? (
        <div className="flex items-center gap-1.5">
          <img src={value} alt="" className="h-10 w-10 rounded object-cover border border-gray-200 cursor-pointer"
            onClick={() => window.open(value, '_blank')} />
          {!disabled && (
            <button type="button" onClick={() => onChange(null)}
              className="text-gray-400 hover:text-red-500">
              <Trash2 size={13} />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => ref.current?.click()}
          className="flex items-center gap-1 text-xs text-teal-600 border border-teal-300 rounded px-2 py-1 hover:bg-teal-50 disabled:opacity-40"
        >
          <Camera size={12} />
          {label ?? 'Photo'}
        </button>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  tenant: string;
  inspectionId?: string;
  onClose: () => void;
  onSaved?: () => void;
  embedded?: boolean;
  readOnly?: boolean;
}

export default function InspectionForm({ tenant, inspectionId, onClose, onSaved, embedded, readOnly }: Props) {
  const [inspections, setInspections] = useState<InspectionRow[]>([]);
  const [activeId, setActiveId] = useState<string | null | 'new'>(inspectionId ?? null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<InspectionType | 'all'>('all');
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  // ── Load list ──────────────────────────────
  const load = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from('equipment_inspections').select('*')
      .eq('tenant_id', tenant)
      .order('created_at', { ascending: false });
    setInspections((data as InspectionRow[]) ?? []);
    setLoading(false);
  }, [tenant]);

  useEffect(() => { load(); }, [load]);

  // ── Open existing inspection ───────────────
  useEffect(() => {
    if (!activeId || activeId === 'new') return;
    const row = inspections.find(r => r.id === activeId);
    if (!row) return;
    setForm({
      equipmentType: row.equipment_type,
      equipmentName: row.equipment_name ?? '',
      equipmentSerial: row.equipment_serial ?? '',
      equipmentLocation: row.equipment_location ?? '',
      equipmentPhoto: row.equipment_photo,
      inspectorName: row.inspector_name ?? '',
      inspectionDate: row.inspection_date ?? new Date().toISOString().split('T')[0],
      results: row.results ?? {},
      itemPhotos: row.item_photos ?? {},
      itemNotes: row.item_notes ?? {},
      notes: row.notes ?? '',
    });
  }, [activeId, inspections]);

  // ── Derived state ──────────────────────────
  const checklist = EQUIPMENT_CHECKLISTS[form.equipmentType];
  const overallResult = checklist ? calcOverallResult(form.equipmentType, form.results) : 'incomplete';
  const nonConformities = checklist ? getNonConformities(form.equipmentType, form.results) : [];
  const hasWithdrawal = nonConformities.some(nc => nc.withdrawal);

  // ── Form helpers ───────────────────────────
  function setResult(itemId: string, value: ItemResult | null) {
    setForm(f => {
      const r = { ...f.results };
      if (value === null) delete r[itemId]; else r[itemId] = value;
      return { ...f, results: r };
    });
  }

  function setItemPhoto(itemId: string, value: string | null) {
    setForm(f => {
      const p = { ...f.itemPhotos };
      if (value === null) delete p[itemId]; else p[itemId] = value;
      return { ...f, itemPhotos: p };
    });
  }

  function setItemNote(itemId: string, value: string) {
    setForm(f => ({ ...f, itemNotes: { ...f.itemNotes, [itemId]: value } }));
  }

  function toggleSection(sectionId: string) {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId); else next.add(sectionId);
      return next;
    });
  }

  // ── Save ───────────────────────────────────
  async function handleSave(status: 'draft' | 'submitted') {
    if (!supabase) return;
    setSaving(true);
    const ncs = getNonConformities(form.equipmentType, form.results);
    const payload = {
      tenant_id: tenant,
      equipment_type: form.equipmentType,
      equipment_name: form.equipmentName || null,
      equipment_serial: form.equipmentSerial || null,
      equipment_location: form.equipmentLocation || null,
      equipment_photo: form.equipmentPhoto,
      inspector_name: form.inspectorName || null,
      inspection_date: form.inspectionDate || null,
      status,
      overall_result: calcOverallResult(form.equipmentType, form.results),
      results: form.results,
      item_photos: form.itemPhotos,
      item_notes: form.itemNotes,
      non_conformities: ncs,
      notes: form.notes || null,
      updated_at: new Date().toISOString(),
      ...(status === 'submitted' ? { submitted_at: new Date().toISOString() } : {}),
    };

    if (activeId === 'new' || !activeId) {
      const number = genInspectionNumber(inspections);
      await supabase.from('equipment_inspections').insert({ ...payload, inspection_number: number });
    } else {
      await supabase.from('equipment_inspections').update(payload).eq('id', activeId);
    }
    setSaving(false);
    onSaved?.();
    await load();
    setActiveId(null);
  }

  // ── Filtered list ──────────────────────────
  const filtered = inspections.filter(r => {
    if (filterType !== 'all' && r.equipment_type !== filterType) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.inspection_number.toLowerCase().includes(q) ||
      (r.equipment_name ?? '').toLowerCase().includes(q) ||
      (r.equipment_serial ?? '').toLowerCase().includes(q) ||
      (r.inspector_name ?? '').toLowerCase().includes(q)
    );
  });

  // ────────────────────────────────────────────
  // LIST VIEW
  // ────────────────────────────────────────────
  if (activeId === null) {
    const stats = {
      total: inspections.length,
      conforme: inspections.filter(r => r.overall_result === 'conforme').length,
      nonConforme: inspections.filter(r => r.overall_result === 'non_conforme' || r.overall_result === 'retrait').length,
      retrait: inspections.filter(r => r.overall_result === 'retrait').length,
    };

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ClipboardCheck size={22} className="text-teal-600" />
                  Inspections d&apos;équipements
                </h1>
                <p className="text-xs text-gray-400">Listes de vérification normalisées — CNESST / CSA</p>
              </div>
            </div>
            <button
              onClick={() => { setForm(EMPTY_FORM); setActiveId('new'); }}
              className="flex items-center gap-1.5 text-sm px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium"
            >
              <Plus size={15} />
              Nouvelle inspection
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Total', value: stats.total, color: 'text-gray-700' },
              { label: 'Conformes', value: stats.conforme, color: 'text-green-600' },
              { label: 'Non conformes', value: stats.nonConforme, color: 'text-red-600' },
              { label: 'Retraits', value: stats.retrait, color: 'text-red-700' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  filterType === 'all' ? 'bg-teal-600 text-white border-teal-600' : 'border-gray-200 text-gray-600 hover:border-gray-400'
                }`}
              >
                Tous
              </button>
              {INSPECTION_TYPE_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setFilterType(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    filterType === opt.value ? 'bg-teal-600 text-white border-teal-600' : 'border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}>
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher par numéro, nom, série, inspecteur…"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
          </div>

          {/* List */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-sm text-gray-400">Chargement…</div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center">
                <ClipboardCheck size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-400">{search || filterType !== 'all' ? 'Aucun résultat' : 'Aucune inspection enregistrée'}</p>
                {!search && filterType === 'all' && (
                  <button onClick={() => { setForm(EMPTY_FORM); setActiveId('new'); }}
                    className="mt-4 text-sm text-teal-600 hover:underline">
                    Créer la première inspection
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filtered.map(r => {
                  const opt = INSPECTION_TYPE_OPTIONS.find(o => o.value === r.equipment_type);
                  return (
                    <button key={r.id} onClick={() => setActiveId(r.id)}
                      className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0 text-lg">
                        {opt?.icon ?? '🔍'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="text-sm font-semibold text-gray-900">{r.inspection_number}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[r.status]}`}>
                            {STATUS_LABEL[r.status]}
                          </span>
                          {r.overall_result && <ResultBadge result={r.overall_result} />}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {opt?.label} {r.equipment_name ? `· ${r.equipment_name}` : ''} {r.equipment_serial ? `· ${r.equipment_serial}` : ''}
                        </div>
                        <div className="text-xs text-gray-400">
                          {r.inspector_name ? `Inspecté par : ${r.inspector_name}` : ''}
                          {r.inspection_date ? ` · ${new Date(r.inspection_date).toLocaleDateString('fr-CA')}` : ''}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 shrink-0">
                        <Clock size={13} />
                        <span className="text-xs">
                          {new Date(r.created_at).toLocaleDateString('fr-CA', { month: 'short', day: 'numeric' })}
                        </span>
                        <ChevronRight size={15} className="ml-1" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────
  // FORM VIEW
  // ────────────────────────────────────────────
  const isNew = activeId === 'new';
  const existingRow = !isNew ? inspections.find(r => r.id === activeId) : null;
  const isReadOnly = readOnly ?? (existingRow?.status === 'closed');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setActiveId(null)} className="text-gray-500 hover:text-gray-700 shrink-0">
              <ArrowLeft size={20} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900 truncate">
                  {isNew ? 'Nouvelle inspection' : existingRow?.inspection_number}
                </span>
                {!isNew && existingRow?.overall_result && (
                  <ResultBadge result={existingRow.overall_result} />
                )}
              </div>
              {!isNew && <p className="text-xs text-gray-400">{INSPECTION_TYPE_OPTIONS.find(o => o.value === form.equipmentType)?.label}</p>}
            </div>
          </div>
          {!isReadOnly && (
            <div className="flex gap-2 shrink-0">
              <button
                disabled={saving}
                onClick={() => handleSave('draft')}
                className="px-3 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Brouillon
              </button>
              <button
                disabled={saving}
                onClick={() => handleSave('submitted')}
                className="px-4 py-1.5 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {saving ? 'Sauvegarde…' : 'Soumettre'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Withdrawal alert banner */}
      {hasWithdrawal && (
        <div className="bg-red-600 text-white px-4 py-3 flex items-center gap-3">
          <AlertOctagon size={20} className="shrink-0" />
          <div>
            <div className="font-bold text-sm">RETRAIT DE SERVICE IMMÉDIAT REQUIS</div>
            <div className="text-xs text-red-100">
              {nonConformities.filter(nc => nc.withdrawal).length} point(s) critique(s) — cet équipement ne doit pas être utilisé.
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* ── Section 1: Info équipement ── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <FileText size={16} className="text-teal-600" />
            <span className="text-sm font-semibold text-gray-700">Informations sur l&apos;équipement</span>
          </div>
          <div className="p-5 space-y-4">
            {/* Type */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type d&apos;équipement *</label>
              <select
                value={form.equipmentType}
                disabled={!isNew || isReadOnly}
                onChange={e => setForm(f => ({ ...f, equipmentType: e.target.value as InspectionType, results: {}, itemPhotos: {}, itemNotes: {} }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:bg-gray-50"
              >
                {INSPECTION_TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
                ))}
              </select>
              {checklist && (
                <p className="mt-1 text-xs text-gray-400">
                  Norme : {checklist.standard} · {checklist.frequency}
                </p>
              )}
            </div>
            {/* Row: name + serial */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nom / Désignation</label>
                <input type="text" value={form.equipmentName} disabled={isReadOnly}
                  onChange={e => setForm(f => ({ ...f, equipmentName: e.target.value }))}
                  placeholder="ex. Chariot #12"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">N° de série</label>
                <input type="text" value={form.equipmentSerial} disabled={isReadOnly}
                  onChange={e => setForm(f => ({ ...f, equipmentSerial: e.target.value }))}
                  placeholder="ex. SN-2024-ABC"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:bg-gray-50" />
              </div>
            </div>
            {/* Row: location + date + inspector */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Emplacement / Chantier</label>
                <input type="text" value={form.equipmentLocation} disabled={isReadOnly}
                  onChange={e => setForm(f => ({ ...f, equipmentLocation: e.target.value }))}
                  placeholder="ex. Site A, Zone 3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date d&apos;inspection</label>
                <input type="date" value={form.inspectionDate} disabled={isReadOnly}
                  onChange={e => setForm(f => ({ ...f, inspectionDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Inspecteur</label>
                <input type="text" value={form.inspectorName} disabled={isReadOnly}
                  onChange={e => setForm(f => ({ ...f, inspectorName: e.target.value }))}
                  placeholder="Nom complet"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:bg-gray-50" />
              </div>
            </div>
            {/* Equipment photo */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Photo de l&apos;équipement</label>
              {form.equipmentPhoto ? (
                <div className="relative inline-block">
                  <img src={form.equipmentPhoto} alt="Équipement"
                    className="h-32 rounded-xl border border-gray-200 object-cover cursor-pointer"
                    onClick={() => window.open(form.equipmentPhoto!, '_blank')} />
                  {!isReadOnly && (
                    <button onClick={() => setForm(f => ({ ...f, equipmentPhoto: null }))}
                      className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow text-gray-500 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ) : !isReadOnly ? (
                <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-teal-400 text-sm text-gray-500 w-fit">
                  <Camera size={18} className="text-teal-500" />
                  Prendre ou sélectionner une photo
                  <input type="file" accept="image/*" capture="environment" className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const b64 = await compressPhoto(file);
                        setForm(f => ({ ...f, equipmentPhoto: b64 }));
                      } catch { /* ignore */ }
                      e.target.value = '';
                    }}
                  />
                </label>
              ) : (
                <p className="text-xs text-gray-400">Aucune photo</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Section 2: Checklist ── */}
        {checklist && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <ClipboardCheck size={16} className="text-teal-600" />
              Liste de vérification
              <span className="text-xs font-normal text-gray-400 ml-1">
                ({Object.keys(form.results).length} / {checklist.sections.flatMap(s => s.items).length} items répondus)
              </span>
            </h2>

            {checklist.sections.map(section => {
              const sectionFails = section.items.filter(i => form.results[i.id] === 'fail').length;
              const sectionWithdraws = section.items.filter(i => form.results[i.id] === 'fail' && i.withdrawal).length;
              const collapsed = collapsedSections.has(section.id);

              return (
                <div key={section.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Section header */}
                  <button
                    className="w-full px-5 py-3 flex items-center justify-between gap-3 text-left bg-gray-50 border-b border-gray-100 hover:bg-gray-100"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800">{section.title}</span>
                      {sectionWithdraws > 0 && (
                        <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold border border-red-200">
                          <AlertOctagon size={10} /> {sectionWithdraws} retrait
                        </span>
                      )}
                      {sectionFails > sectionWithdraws && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold border border-orange-200">
                          {sectionFails} non-conforme{sectionFails > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    {collapsed ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronUp size={16} className="text-gray-400" />}
                  </button>

                  {/* Items */}
                  {!collapsed && (
                    <div className="divide-y divide-gray-50">
                      {section.items.map(item => {
                        const result = form.results[item.id];
                        const isFail = result === 'fail';
                        const rowBg = isFail && item.withdrawal
                          ? 'bg-red-50'
                          : isFail
                            ? 'bg-orange-50'
                            : '';

                        return (
                          <div key={item.id} className={`px-5 py-3 ${rowBg}`}>
                            <div className="flex items-start gap-3">
                              {/* Critical badge */}
                              <div className="shrink-0 mt-0.5">
                                {item.withdrawal ? (
                                  <span title="Retrait immédiat si non-conforme">
                                    <AlertOctagon size={14} className="text-red-400" />
                                  </span>
                                ) : item.critical ? (
                                  <span title="Critique">
                                    <AlertTriangle size={14} className="text-orange-400" />
                                  </span>
                                ) : (
                                  <span title="Standard">
                                    <Info size={14} className="text-gray-300" />
                                  </span>
                                )}
                              </div>
                              {/* Label */}
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${isFail ? 'font-medium' : 'text-gray-700'}`}>
                                  {item.label}
                                </p>
                                {item.helpText && (
                                  <p className="text-xs text-gray-400 mt-0.5 italic">{item.helpText}</p>
                                )}
                                {/* Fail extras: photo + notes */}
                                {isFail && !isReadOnly && (
                                  <div className="mt-2 flex flex-col gap-2">
                                    <input
                                      type="text"
                                      value={form.itemNotes[item.id] ?? ''}
                                      onChange={e => setItemNote(item.id, e.target.value)}
                                      placeholder="Description du défaut (optionnel)"
                                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-400"
                                    />
                                    <PhotoInput
                                      value={form.itemPhotos[item.id] ?? null}
                                      onChange={v => setItemPhoto(item.id, v)}
                                      label="Photo du bris"
                                    />
                                  </div>
                                )}
                                {/* Read-only: show saved note + photo */}
                                {isFail && isReadOnly && (form.itemNotes[item.id] || form.itemPhotos[item.id]) && (
                                  <div className="mt-2 space-y-1">
                                    {form.itemNotes[item.id] && (
                                      <p className="text-xs text-gray-600">{form.itemNotes[item.id]}</p>
                                    )}
                                    {form.itemPhotos[item.id] && (
                                      <img src={form.itemPhotos[item.id]} alt="Bris"
                                        className="h-16 rounded object-cover border border-gray-200 cursor-pointer"
                                        onClick={() => window.open(form.itemPhotos[item.id], '_blank')} />
                                    )}
                                  </div>
                                )}
                              </div>
                              {/* Toggle */}
                              <ResultToggle
                                value={form.results[item.id]}
                                onChange={v => setResult(item.id, v)}
                                disabled={isReadOnly}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Section 3: Non-conformités ── */}
        {nonConformities.length > 0 && (
          <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-red-100 bg-red-50 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-600" />
              <span className="text-sm font-semibold text-red-700">
                Non-conformités détectées ({nonConformities.length})
              </span>
            </div>
            <div className="divide-y divide-red-50">
              {nonConformities.map(nc => (
                <div key={nc.id} className="px-5 py-3 flex items-start gap-3">
                  {nc.withdrawal
                    ? <AlertOctagon size={16} className="text-red-600 shrink-0 mt-0.5" />
                    : <XCircle size={16} className="text-orange-500 shrink-0 mt-0.5" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800">{nc.label}</p>
                    {form.itemNotes[nc.id] && (
                      <p className="text-xs text-gray-500 mt-0.5">{form.itemNotes[nc.id]}</p>
                    )}
                  </div>
                  {nc.withdrawal && (
                    <span className="shrink-0 text-xs bg-red-600 text-white px-2 py-0.5 rounded font-bold">
                      RETRAIT
                    </span>
                  )}
                  {nc.critical && !nc.withdrawal && (
                    <span className="shrink-0 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-semibold border border-orange-200">
                      CRITIQUE
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Section 4: Notes ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <label className="block text-xs font-medium text-gray-600 mb-2">Notes et observations</label>
          <textarea
            value={form.notes}
            disabled={isReadOnly}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={3}
            placeholder="Observations générales, actions correctives prévues…"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:bg-gray-50 resize-none"
          />
        </div>

        {/* ── Section 5: Résultat global ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-600 mb-3">Résultat global</p>
          <div className="flex items-center justify-between gap-4">
            <ResultBadge result={overallResult} size="md" />
            <div className="text-xs text-gray-400 text-right">
              <p>
                <span className="inline-flex items-center gap-1 text-orange-500"><AlertOctagon size={10} /> Retrait</span> = retrait immédiat obligatoire
              </p>
              <p>
                <span className="inline-flex items-center gap-1 text-orange-400"><AlertTriangle size={10} /> Critique</span> = non-conforme
              </p>
              <p>
                <span className="inline-flex items-center gap-1 text-gray-400"><Info size={10} /> Standard</span> = conditionnel si fail
              </p>
            </div>
          </div>

          {!isReadOnly && (
            <div className="mt-4 flex gap-3 justify-end">
              <button onClick={() => setActiveId(null)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                Annuler
              </button>
              <button
                disabled={saving}
                onClick={() => handleSave('draft')}
                className="px-4 py-2 text-sm border border-teal-300 text-teal-700 rounded-lg hover:bg-teal-50 disabled:opacity-50">
                Sauvegarder brouillon
              </button>
              <button
                disabled={saving}
                onClick={() => handleSave('submitted')}
                className="px-5 py-2 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium disabled:opacity-50">
                {saving ? 'Sauvegarde…' : 'Soumettre l\'inspection'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
