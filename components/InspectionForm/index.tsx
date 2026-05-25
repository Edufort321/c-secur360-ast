'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  ClipboardCheck, ArrowLeft, AlertTriangle, CheckCircle, XCircle,
  Camera, Trash2, ChevronDown, ChevronUp, AlertOctagon, Info, FileText,
  Printer, QrCode, History, Share2, CalendarCheck, Check, ChevronRight,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import QRCode from 'qrcode';
import {
  EQUIPMENT_CHECKLISTS, INSPECTION_TYPE_OPTIONS, FREQUENCY_OPTIONS,
  calcOverallResult, getNonConformities,
  type InspectionType, type ItemResult, type OverallResult, type InspectionFrequency,
} from './checklists';
import { PortalHeader } from '@/components/PortalHeader';
import { useLanguage } from '@/contexts/LanguageContext';

// ─── Supabase ────────────────────────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// ─── Types ───────────────────────────────────────────────────────────────────

interface CorrectiveAction {
  note: string;
  deadline: string;
  assigned: string;
  usable: boolean;
}

interface CustomItem {
  id: string;
  label: string;
}

interface InspectionRow {
  id: string;
  inspection_number: string;
  equipment_type: InspectionType;
  equipment_name: string | null;
  equipment_serial: string | null;
  equipment_location: string | null;
  equipment_photo: string | null;
  equipment_photos: string[] | null;
  inspector_name: string | null;
  inspection_date: string | null;
  inspection_frequency: InspectionFrequency | null;
  status: 'draft' | 'submitted' | 'closed';
  overall_result: OverallResult | null;
  results: Record<string, ItemResult>;
  item_photos: Record<string, string>;
  item_notes: Record<string, string>;
  corrective_actions: Record<string, CorrectiveAction>;
  non_conformities: { id: string; label: string; critical: boolean; withdrawal: boolean }[];
  notes: string | null;
  usable_with_conditions: boolean;
  usable_until_date: string | null;
  custom_items: CustomItem[] | null;
  inspection_shifts: string[] | null;
}

interface FormState {
  equipmentType: InspectionType;
  equipmentName: string;
  equipmentSerial: string;
  equipmentLocation: string;
  equipmentPhoto: string | null;
  equipmentPhotos: string[];
  inspectorName: string;
  inspectionDate: string;
  inspectionFrequency: InspectionFrequency | null;
  inspectionShifts: string[];
  results: Record<string, ItemResult>;
  itemPhotos: Record<string, string>;
  itemNotes: Record<string, string>;
  correctiveActions: Record<string, CorrectiveAction>;
  notes: string;
  customItems: CustomItem[];
}

type TabId = 'form' | 'qr' | 'history';

interface HistoryRow {
  id: string;
  inspection_number: string;
  inspection_date: string | null;
  overall_result: OverallResult | null;
  inspector_name: string | null;
  status: 'draft' | 'submitted' | 'closed';
}

const EMPTY_FORM: FormState = {
  equipmentType: 'harness',
  equipmentName: '',
  equipmentSerial: '',
  equipmentLocation: '',
  equipmentPhoto: null,
  equipmentPhotos: [],
  inspectorName: '',
  inspectionDate: new Date().toISOString().split('T')[0],
  inspectionFrequency: null,
  inspectionShifts: [],
  results: {},
  itemPhotos: {},
  itemNotes: {},
  correctiveActions: {},
  notes: '',
  customItems: [],
};

// ─── Visual helpers ──────────────────────────────────────────────────────────

const RESULT_CONFIG: Record<OverallResult, { label: string; color: string; bgColor: string; Icon: React.ElementType }> = {
  conforme:     { label: 'Conforme',         color: 'text-green-700',  bgColor: 'bg-green-100 border-green-300',   Icon: CheckCircle },
  conditionnel: { label: 'Conditionnel',     color: 'text-yellow-700', bgColor: 'bg-yellow-100 border-yellow-300', Icon: AlertTriangle },
  non_conforme: { label: 'Non conforme',     color: 'text-red-700',    bgColor: 'bg-red-100 border-red-300',       Icon: XCircle },
  retrait:      { label: 'RETRAIT IMMÉDIAT', color: 'text-white',      bgColor: 'bg-red-600 border-red-700',       Icon: AlertOctagon },
  incomplete:   { label: 'En cours',         color: 'text-gray-600',   bgColor: 'bg-gray-100 border-gray-300',     Icon: ClipboardCheck },
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
            <button type="button" onClick={() => onChange(null)} className="text-gray-400 hover:text-red-500">
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

// ─── AddCustomItemRow ────────────────────────────────────────────────────────

function AddCustomItemRow({ onAdd, placeholder, addLabel }: { onAdd: (label: string) => void; placeholder: string; addLabel: string }) {
  const [label, setLabel] = useState('');
  function submit() {
    const t = label.trim();
    if (!t) return;
    onAdd(t);
    setLabel('');
  }
  return (
    <div className="flex items-center gap-2 px-5 py-3 border-t border-gray-100">
      <input
        type="text"
        value={label}
        onChange={e => setLabel(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
        placeholder={placeholder}
        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
      />
      <button
        type="button"
        onClick={submit}
        disabled={!label.trim()}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium disabled:opacity-40"
      >
        <Check size={13} />
        {addLabel}
      </button>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  tenant: string;
  inspectionId?: string;
  onClose: () => void;
  onSaved?: () => void;
  readOnly?: boolean;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InspectionForm({ tenant, inspectionId, onClose, onSaved: _onSaved, readOnly }: Props) {
  const { lang } = useLanguage();

  const I = useMemo(() => ({
    fr: lang === 'fr',
    tabForm:       lang === 'fr' ? 'Formulaire'       : 'Form',
    tabQR:         lang === 'fr' ? 'Code QR'          : 'QR Code',
    tabHistory:    lang === 'fr' ? 'Historique'       : 'History',
    newInspection: lang === 'fr' ? 'Nouvelle inspection' : 'New inspection',
    draft:         lang === 'fr' ? 'Brouillon'        : 'Draft',
    submit:        lang === 'fr' ? 'Soumettre'        : 'Submit',
    saving:        lang === 'fr' ? 'Sauvegarde…'      : 'Saving…',
    saved:         lang === 'fr' ? 'Enregistré'       : 'Saved',
    submitted:     lang === 'fr' ? 'Inspection soumise' : 'Inspection submitted',
    printQR:       lang === 'fr' ? 'Imprimer QR'      : 'Print QR',
    print:         lang === 'fr' ? 'Imprimer'         : 'Print',
    share:         lang === 'fr' ? 'Partager'         : 'Share',
    delete:        lang === 'fr' ? 'Supprimer cette inspection' : 'Delete this inspection',
    confirmDelete: lang === 'fr' ? 'Supprimer cette inspection ? Cette action est irréversible.' : 'Delete this inspection? This action cannot be undone.',
    // Section 1
    equipInfo:     lang === 'fr' ? 'Informations équipement' : 'Equipment information',
    eqType:        lang === 'fr' ? 'Type d\'équipement'      : 'Equipment type',
    standard:      lang === 'fr' ? 'Norme'                   : 'Standard',
    eqName:        lang === 'fr' ? 'Nom / Désignation'       : 'Name / Description',
    eqSerial:      lang === 'fr' ? 'N° de série'             : 'Serial #',
    eqLocation:    lang === 'fr' ? 'Emplacement / Chantier'  : 'Location / Site',
    inspDate:      lang === 'fr' ? 'Date d\'inspection'      : 'Inspection date',
    inspector:     lang === 'fr' ? 'Inspecteur'              : 'Inspector',
    frequency:     lang === 'fr' ? 'Fréquence d\'inspection' : 'Inspection frequency',
    selectFreq:    lang === 'fr' ? '— Sélectionner —'        : '— Select —',
    shiftsLabel:   lang === 'fr' ? 'Quarts de travail applicables' : 'Applicable work shifts',
    shiftDay:      lang === 'fr' ? 'Jour'                    : 'Day',
    shiftEvening:  lang === 'fr' ? 'Soir'                    : 'Evening',
    shiftNight:    lang === 'fr' ? 'Nuit'                    : 'Night',
    photos:        lang === 'fr' ? 'Photos de l\'équipement' : 'Equipment photos',
    addPhoto:      lang === 'fr' ? 'Ajouter'                 : 'Add',
    noPhoto:       lang === 'fr' ? 'Aucune photo'            : 'No photo',
    // Section 2
    checklist:     lang === 'fr' ? 'Liste de vérification'   : 'Checklist',
    itemsAnswered: lang === 'fr' ? 'items répondus'          : 'items answered',
    withdrawal:    lang === 'fr' ? 'retrait'                 : 'withdrawal',
    nonConformes:  lang === 'fr' ? 'non-conforme'            : 'non-conforming',
    addPoints:     lang === 'fr' ? 'Points additionnels'     : 'Additional points',
    pointCount:    (n: number) => lang === 'fr' ? `${n} point${n !== 1 ? 's' : ''}` : `${n} point${n !== 1 ? 's' : ''}`,
    newPoint:      lang === 'fr' ? 'Nouveau point d\'inspection…' : 'New inspection point…',
    add:           lang === 'fr' ? 'Ajouter'                 : 'Add',
    // Section 3 — NC
    ncDetected:    (n: number) => lang === 'fr' ? `Non-conformités détectées (${n})` : `Non-conformities detected (${n})`,
    caTitle:       lang === 'fr' ? 'Action corrective'       : 'Corrective action',
    caDesc:        lang === 'fr' ? 'Description de l\'action' : 'Action description',
    caPlaceholder: lang === 'fr' ? 'Mesure corrective prévue ou prise…' : 'Corrective measure planned or taken…',
    caAssigned:    lang === 'fr' ? 'Responsable'             : 'Responsible',
    caDeadline:    lang === 'fr' ? 'Échéance'                : 'Deadline',
    caUsable:      (d: string) => lang === 'fr' ? `Utilisation autorisée jusqu'à l'échéance${d ? ` (${d})` : ''}` : `Use authorized until deadline${d ? ` (${d})` : ''}`,
    caAction:      lang === 'fr' ? 'Action :'                : 'Action:',
    caResponsible: lang === 'fr' ? 'Responsable :'           : 'Responsible:',
    caDeadlineLabel: lang === 'fr' ? 'Échéance :'            : 'Deadline:',
    caUsableConfirm: lang === 'fr' ? '✓ Utilisation autorisée jusqu\'à l\'échéance' : '✓ Use authorized until deadline',
    // Section 4
    notes:         lang === 'fr' ? 'Notes et observations'  : 'Notes and observations',
    notesPlaceholder: lang === 'fr' ? 'Observations générales, actions correctives prévues…' : 'General observations, planned corrective actions…',
    // Section 5
    overallResult: lang === 'fr' ? 'Résultat global'        : 'Overall result',
    // QR tab
    qrSubmitFirst: lang === 'fr' ? 'Soumettez l\'inspection pour générer le code QR.' : 'Submit the inspection to generate the QR code.',
    qrInstruction: lang === 'fr' ? 'Imprimez ce QR et fixez-le sur l\'équipement.\nScannez pour accéder à la dernière inspection.' : 'Print this QR and attach it to the equipment.\nScan to access the latest inspection.',
    // History tab
    prevInspections: lang === 'fr' ? 'Historique des inspections' : 'Inspection history',
    serie:           lang === 'fr' ? '— série'               : '— serial',
    noHistory:       lang === 'fr' ? 'Aucune inspection précédente trouvée.' : 'No previous inspections found.',
    // eqType options
    eqTypePlaceholder: lang === 'fr' ? 'ex. Chariot #12'    : 'e.g. Forklift #12',
    serialPlaceholder: lang === 'fr' ? 'ex. SN-2024-ABC'    : 'e.g. SN-2024-ABC',
    locationPlaceholder: lang === 'fr' ? 'ex. Site A, Zone 3' : 'e.g. Site A, Zone 3',
    inspectorPlaceholder: lang === 'fr' ? 'Nom complet'     : 'Full name',
    defectPlaceholder: lang === 'fr' ? 'Description du défaut (optionnel)' : 'Defect description (optional)',
    photoBtn:      lang === 'fr' ? 'Prendre ou sélectionner une photo' : 'Take or select a photo',
    photoDefect:   lang === 'fr' ? 'Photo du bris'          : 'Damage photo',
  }), [lang]);

  const [existingRow, setExistingRow]     = useState<InspectionRow | null>(null);
  const [internalId, setInternalId]       = useState<string | undefined>(inspectionId);
  const [form, setForm]                   = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving]               = useState(false);
  const [saveMsg, setSaveMsg]             = useState('');
  const [shareMsg, setShareMsg]           = useState('');
  const [activeTab, setActiveTab]         = useState<TabId>(inspectionId ? 'qr' : 'form');
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [expandedNCs, setExpandedNCs]     = useState<Set<string>>(new Set());
  const [historyRows, setHistoryRows]     = useState<HistoryRow[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [logoUrl, setLogoUrl]             = useState<string | null>(null);
  const [deletingInspection, setDeletingInspection] = useState(false);

  const savingRef = useRef(false);

  // ── Tenant logo ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!supabase || !tenant) return;
    supabase.from('tenants').select('logo_url').eq('subdomain', tenant).maybeSingle()
      .then(({ data }) => { if (data?.logo_url) setLogoUrl(data.logo_url); }, () => {});
  }, [tenant]);

  // ── Load existing inspection ─────────────────────────────────────────────
  useEffect(() => {
    if (!inspectionId || !supabase) return;
    supabase
      .from('equipment_inspections')
      .select('*')
      .eq('id', inspectionId)
      .single()
      .then(({ data }) => {
        if (!data) return;
        const row = data as InspectionRow;
        setExistingRow(row);
        setInternalId(row.id);
        setForm({
          equipmentType:      row.equipment_type,
          equipmentName:      row.equipment_name ?? '',
          equipmentSerial:    row.equipment_serial ?? '',
          equipmentLocation:  row.equipment_location ?? '',
          equipmentPhoto:     row.equipment_photo,
          equipmentPhotos:    row.equipment_photos ?? (row.equipment_photo ? [row.equipment_photo] : []),
          inspectorName:      row.inspector_name ?? '',
          inspectionDate:     row.inspection_date ?? new Date().toISOString().split('T')[0],
          inspectionFrequency: row.inspection_frequency ?? null,
          results:            row.results ?? {},
          itemPhotos:         row.item_photos ?? {},
          itemNotes:          row.item_notes ?? {},
          correctiveActions:  row.corrective_actions ?? {},
          notes:              row.notes ?? '',
          customItems:        row.custom_items ?? [],
          inspectionShifts:   row.inspection_shifts ?? [],
        });
      });
  }, [inspectionId]);

  // ── Reset history cache when equipment identifier changes ────────────────
  useEffect(() => {
    setHistoryLoaded(false);
  }, [form.equipmentSerial, form.equipmentType, form.equipmentName]);

  // ── History — charge en arrière-plan dès que internalId est disponible ──
  useEffect(() => {
    if (!supabase || historyLoaded || !internalId) return;
    setHistoryLoading(true);
    (async () => {
      let q = supabase!
        .from('equipment_inspections')
        .select('id, inspection_number, inspection_date, overall_result, inspector_name, status')
        .eq('tenant_id', tenant)
        .order('inspection_date', { ascending: false })
        .limit(30);
      if (form.equipmentSerial) {
        q = q.eq('equipment_serial', form.equipmentSerial);
      } else {
        q = q.eq('equipment_type', form.equipmentType);
        if (form.equipmentName) q = q.eq('equipment_name', form.equipmentName);
      }
      const { data } = await q;
      setHistoryRows((data as HistoryRow[]) ?? []);
      setHistoryLoaded(true);
      setHistoryLoading(false);
    })();
  }, [historyLoaded, form.equipmentSerial, form.equipmentType, form.equipmentName, internalId, tenant]);

  // ── Derived values ────────────────────────────────────────────────────────
  const isReadOnly      = readOnly ?? (existingRow?.status === 'closed');
  const checklist       = EQUIPMENT_CHECKLISTS[form.equipmentType];
  const baseResult      = checklist ? calcOverallResult(form.equipmentType, form.results) : 'incomplete';
  const customNCs       = form.customItems.filter(ci => form.results[ci.id] === 'fail').map(ci => ({ id: ci.id, label: ci.label, critical: false, withdrawal: false }));
  const overallResult: OverallResult = customNCs.length > 0 && baseResult === 'conforme' ? 'conditionnel' : baseResult;
  const stdNCs          = checklist ? getNonConformities(form.equipmentType, form.results) : [];
  const nonConformities = [...stdNCs, ...customNCs];
  const hasWithdrawal   = nonConformities.some(nc => nc.withdrawal);
  const isSaved         = !!internalId;

  // ── Auto-expand NCs (surtout retrait) ────────────────────────────────────
  const ncIds = nonConformities.map(nc => nc.id).join(',');
  useEffect(() => {
    if (!ncIds) return;
    setExpandedNCs(prev => {
      const next = new Set(prev);
      ncIds.split(',').filter(Boolean).forEach(id => next.add(id));
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ncIds]);

  // ── Helpers ───────────────────────────────────────────────────────────────

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

  function setCA(itemId: string, patch: Partial<CorrectiveAction>) {
    setForm(f => {
      const existing = f.correctiveActions[itemId];
      return {
        ...f,
        correctiveActions: {
          ...f.correctiveActions,
          [itemId]: {
            note:     existing?.note     ?? '',
            deadline: existing?.deadline ?? '',
            assigned: existing?.assigned ?? '',
            usable:   existing?.usable   ?? false,
            ...patch,
          },
        },
      };
    });
  }

  function toggleSection(sectionId: string) {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId); else next.add(sectionId);
      return next;
    });
  }

  function toggleNC(ncId: string) {
    setExpandedNCs(prev => {
      const next = new Set(prev);
      if (next.has(ncId)) next.delete(ncId); else next.add(ncId);
      return next;
    });
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  async function handleSave(status: 'draft' | 'submitted') {
    if (!supabase || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);

    const baseCalcResult = calcOverallResult(form.equipmentType, form.results);
    const customNcsSave  = form.customItems.filter(ci => form.results[ci.id] === 'fail').map(ci => ({ id: ci.id, label: ci.label, critical: false, withdrawal: false }));
    const result: OverallResult = customNcsSave.length > 0 && baseCalcResult === 'conforme' ? 'conditionnel' : baseCalcResult;
    const ncs    = [...getNonConformities(form.equipmentType, form.results), ...customNcsSave];
    const usableDeadlines = ncs
      .filter(nc => form.correctiveActions[nc.id]?.usable && form.correctiveActions[nc.id]?.deadline)
      .map(nc => form.correctiveActions[nc.id].deadline)
      .sort();
    const hasUsable = ncs.some(nc => form.correctiveActions[nc.id]?.usable);

    const payload = {
      tenant_id:            tenant,
      equipment_type:       form.equipmentType,
      equipment_name:       form.equipmentName || null,
      equipment_serial:     form.equipmentSerial || null,
      equipment_location:   form.equipmentLocation || null,
      equipment_photo:      form.equipmentPhotos[0] ?? form.equipmentPhoto ?? null,
      equipment_photos:     form.equipmentPhotos,
      inspector_name:       form.inspectorName || null,
      inspection_date:      form.inspectionDate || null,
      inspection_frequency: form.inspectionFrequency || null,
      status,
      overall_result:       result,
      results:              form.results,
      item_photos:          form.itemPhotos,
      item_notes:           form.itemNotes,
      corrective_actions:   form.correctiveActions,
      non_conformities:     ncs,
      notes:                form.notes || null,
      usable_with_conditions: hasUsable,
      usable_until_date:    usableDeadlines.length > 0 ? usableDeadlines[0] : null,
      custom_items:         form.customItems,
      inspection_shifts:    form.inspectionFrequency === 'par_quart' ? form.inspectionShifts : [],
      updated_at:           new Date().toISOString(),
      ...(status === 'submitted' ? { submitted_at: new Date().toISOString() } : {}),
    };

    let savedId = internalId ?? null;

    if (!internalId) {
      const year = new Date().getFullYear();
      const { count } = await supabase
        .from('equipment_inspections')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', tenant);
      const inspNumber = `INS-${year}-${String((count ?? 0) + 1).padStart(3, '0')}`;
      const { data: inserted } = await supabase
        .from('equipment_inspections')
        .insert({ ...payload, inspection_number: inspNumber })
        .select('id')
        .single();
      savedId = inserted?.id ?? null;
      if (savedId) setInternalId(savedId);
      if (savedId) {
        const { data } = await supabase
          .from('equipment_inspections')
          .select('*')
          .eq('id', savedId)
          .single();
        if (data) setExistingRow(data as InspectionRow);
      }
    } else {
      await supabase
        .from('equipment_inspections')
        .update(payload)
        .eq('id', internalId);
      const { data } = await supabase
        .from('equipment_inspections')
        .select('*')
        .eq('id', internalId)
        .single();
      if (data) setExistingRow(data as InspectionRow);
    }

    setSaving(false);
    savingRef.current = false;
    setSaveMsg(status === 'draft' ? 'Brouillon enregistré' : 'Inspection soumise');
    setTimeout(() => setSaveMsg(''), 3000);
    setHistoryLoaded(false);

    if (status === 'submitted') {
      setActiveTab('qr');
    }
  }

  // ── Delete self ───────────────────────────────────────────────────────────

  async function handleDeleteSelf() {
    if (!internalId || !supabase) return;
    if (!confirm(I.confirmDelete)) return;
    setDeletingInspection(true);
    await supabase.from('equipment_inspections').delete().eq('id', internalId);
    onClose();
  }

  // ── Share ─────────────────────────────────────────────────────────────────

  function handleShare() {
    const lines = [
      `INSPECTION ${existingRow?.inspection_number ?? 'NOUVELLE'} — ${form.equipmentName || form.equipmentType}${form.equipmentSerial ? ` (${form.equipmentSerial})` : ''}`,
      `Date : ${form.inspectionDate} | Inspecteur : ${form.inspectorName || 'N/A'}`,
      `Résultat : ${RESULT_CONFIG[overallResult]?.label ?? overallResult}`,
      '',
      'NON-CONFORMITÉS :',
      ...nonConformities.flatMap(nc => {
        const ca  = form.correctiveActions[nc.id];
        const sev = nc.withdrawal ? '[RETRAIT]' : nc.critical ? '[CRITIQUE]' : '[STANDARD]';
        return [
          `  ${sev} ${nc.label}`,
          ...(ca?.note     ? [`    → Correctif : ${ca.note}`]                                        : []),
          ...(ca?.deadline ? [`    → Échéance : ${ca.deadline}`]                                     : []),
          ...(ca?.assigned ? [`    → Responsable : ${ca.assigned}`]                                  : []),
          ...(ca?.usable   ? [`    → ✓ Utilisation autorisée jusqu'au ${ca.deadline || 'N/A'}`]      : []),
        ];
      }),
    ];
    navigator.clipboard
      .writeText(lines.join('\n'))
      .then(() => { setShareMsg('Copié !'); setTimeout(() => setShareMsg(''), 2500); })
      .catch(() => window.prompt('Copiez ce texte :', lines.join('\n')));
  }

  // ── Print QR ──────────────────────────────────────────────────────────────

  async function handlePrintQR() {
    if (!internalId) return;
    const url     = `${window.location.origin}/${tenant}/inspections/${internalId}`;
    const qrData  = await QRCode.toDataURL(url, { width: 400, margin: 2 });
    const win     = window.open('', '_blank', 'width=520,height=720');
    if (!win) return;
    const esc        = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const num        = existingRow?.inspection_number ?? '';
    const equipLabel = INSPECTION_TYPE_OPTIONS.find(o => o.value === form.equipmentType)?.label ?? form.equipmentType;
    const logoSrc    = logoUrl || `${window.location.origin}/c-secur360-logo.png`;
    const scanLabel  = I.fr ? 'Scannez pour voir la dernière inspection' : 'Scan to view the latest inspection';
    win.document.write(
      `<!DOCTYPE html><html lang="${I.fr ? 'fr' : 'en'}"><head><meta charset="utf-8"><title>QR – ${esc(num)}</title>` +
      `<style>body{font-family:system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;padding:32px;background:#fff;gap:0}` +
      `.logo{height:56px;width:auto;margin-bottom:4px}.site{color:#94a3b8;font-size:11px;margin-bottom:16px}` +
      `.qr{width:260px;height:260px;margin-bottom:16px}` +
      `h2{margin:0 0 4px;font-size:20px;font-weight:800;text-align:center;color:#0f172a}` +
      `p{margin:2px 0;color:#64748b;font-size:13px;text-align:center}.sub{color:#94a3b8;font-size:11px;margin-top:10px}` +
      `@media print{button{display:none}}</style>` +
      `</head><body>` +
      `<img class="logo" src="${logoSrc}" alt="Logo"/>` +
      `<p class="site">c-secur360.ca</p>` +
      `<img class="qr" src="${qrData}" alt="QR"/>` +
      `<h2>${esc(num)}</h2>` +
      `<p>${esc(equipLabel)}${form.equipmentName ? ' — ' + esc(form.equipmentName) : ''}</p>` +
      (form.equipmentSerial ? `<p>${esc(form.equipmentSerial)}</p>` : '') +
      `<p class="sub">${scanLabel}</p>` +
      `<script>window.onload=()=>window.print();<\/script></body></html>`
    );
    win.document.close();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  const tabs: { id: TabId; label: string; Icon: React.ElementType }[] = [
    { id: 'form',    label: I.tabForm,    Icon: FileText  },
    { id: 'qr',      label: I.tabQR,      Icon: QrCode    },
    { id: 'history', label: I.tabHistory, Icon: History   },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      <PortalHeader tenant={tenant} />

      {/* ── Sticky sub-header (below PortalHeader) ────────────────────────── */}
      <div className="bg-white border-b border-gray-200 sticky top-[80px] z-20">
        <div className="max-w-3xl mx-auto px-4">

          {/* Row 1: back | title+badge | action buttons */}
          <div className="py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700 shrink-0">
                <ArrowLeft size={20} />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900 truncate">
                    {!internalId ? I.newInspection : existingRow?.inspection_number ?? '…'}
                  </span>
                  {existingRow?.overall_result && (
                    <ResultBadge result={existingRow.overall_result} />
                  )}
                </div>
                {internalId && (
                  <p className="text-xs text-gray-400">
                    {INSPECTION_TYPE_OPTIONS.find(o => o.value === form.equipmentType)?.label}
                  </p>
                )}
              </div>
            </div>

            {/* Header right buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Toast */}
              {saveMsg && (
                <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-2 py-1 font-medium">
                  <Check size={12} />
                  {saveMsg}
                </span>
              )}
              {/* Form tab save buttons */}
              {activeTab === 'form' && !isReadOnly && (
                <>
                  <button
                    disabled={saving}
                    onClick={() => handleSave('draft')}
                    className="px-3 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    {I.draft}
                  </button>
                  <button
                    disabled={saving}
                    onClick={() => handleSave('submitted')}
                    className="px-4 py-1.5 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium disabled:opacity-50"
                  >
                    {saving ? I.saving : I.submit}
                  </button>
                </>
              )}
              {/* QR tab print button */}
              {activeTab === 'qr' && internalId && (
                <button
                  onClick={handlePrintQR}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium"
                >
                  <Printer size={14} />
                  {I.printQR}
                </button>
              )}
              {/* Delete button — visible when editing an existing record */}
              {internalId && (
                <button
                  onClick={handleDeleteSelf}
                  disabled={deletingInspection}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title={I.delete}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Row 2: tab bar */}
          <div className="border-t border-gray-100 flex">
            {tabs.map(tab => {
              const disabled = (tab.id === 'qr' || tab.id === 'history') && !isSaved;
              const active   = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  disabled={disabled}
                  onClick={() => !disabled && setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    active
                      ? 'border-teal-600 text-teal-600'
                      : disabled
                        ? 'border-transparent text-gray-300 cursor-not-allowed'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Alerts (only on form tab) ──────────────────────────────────────── */}
      {activeTab === 'form' && (
        <>
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
          {existingRow?.usable_with_conditions && (
            <div className="bg-amber-50 border-b border-amber-200 text-amber-800 px-4 py-2.5 flex items-center gap-2 max-w-3xl mx-auto mt-2 rounded-lg">
              <CalendarCheck size={16} className="shrink-0 text-amber-600" />
              <span className="text-sm">
                <strong>Utilisation conditionnelle</strong>
                {existingRow.usable_until_date
                  ? ` — autorisée jusqu'au ${existingRow.usable_until_date}`
                  : ' — conditions d\'utilisation appliquées'}
              </span>
            </div>
          )}
        </>
      )}

      {/* ── Tab content ────────────────────────────────────────────────────── */}

      {/* FORM TAB */}
      {activeTab === 'form' && (
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

          {/* Section 1 — Info équipement */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
              <FileText size={16} className="text-teal-600" />
              <span className="text-sm font-semibold text-gray-700">{I.equipInfo}</span>
            </div>
            <div className="p-5 space-y-4">

              {/* Type d'équipement */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{I.eqType} *</label>
                <select
                  value={form.equipmentType}
                  disabled={!!internalId || isReadOnly}
                  onChange={e => setForm(f => ({ ...f, equipmentType: e.target.value as InspectionType, results: {}, itemPhotos: {}, itemNotes: {}, correctiveActions: {} }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:bg-gray-50"
                >
                  {INSPECTION_TYPE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {checklist && (
                  <p className="mt-1 text-xs text-gray-400">{I.standard} : {checklist.standard} · {checklist.frequency}</p>
                )}
              </div>

              {/* Nom / Série */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{I.eqName}</label>
                  <input type="text" value={form.equipmentName} disabled={isReadOnly}
                    onChange={e => setForm(f => ({ ...f, equipmentName: e.target.value }))}
                    placeholder={I.eqTypePlaceholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{I.eqSerial}</label>
                  <input type="text" value={form.equipmentSerial} disabled={isReadOnly}
                    onChange={e => setForm(f => ({ ...f, equipmentSerial: e.target.value }))}
                    placeholder={I.serialPlaceholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:bg-gray-50" />
                </div>
              </div>

              {/* Emplacement / Date / Inspecteur / Fréquence */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{I.eqLocation}</label>
                  <input type="text" value={form.equipmentLocation} disabled={isReadOnly}
                    onChange={e => setForm(f => ({ ...f, equipmentLocation: e.target.value }))}
                    placeholder={I.locationPlaceholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{I.inspDate}</label>
                  <input type="date" value={form.inspectionDate} disabled={isReadOnly}
                    onChange={e => setForm(f => ({ ...f, inspectionDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:bg-gray-50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{I.inspector}</label>
                  <input type="text" value={form.inspectorName} disabled={isReadOnly}
                    onChange={e => setForm(f => ({ ...f, inspectorName: e.target.value }))}
                    placeholder={I.inspectorPlaceholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{I.frequency}</label>
                  <select
                    value={form.inspectionFrequency ?? ''}
                    disabled={isReadOnly}
                    onChange={e => setForm(f => ({ ...f, inspectionFrequency: (e.target.value || null) as InspectionFrequency | null }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:bg-gray-50"
                  >
                    <option value="">{I.selectFreq}</option>
                    {FREQUENCY_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{I.fr ? opt.label : opt.labelEn}</option>
                    ))}
                  </select>
                  {form.inspectionFrequency === 'par_quart' && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs font-medium text-blue-700 mb-2">{I.shiftsLabel}</p>
                      <div className="flex flex-wrap gap-4">
                        {([['jour', I.shiftDay], ['soir', I.shiftEvening], ['nuit', I.shiftNight]] as [string, string][]).map(([val, lbl]) => (
                          <label key={val} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input
                              type="checkbox"
                              disabled={isReadOnly}
                              checked={form.inspectionShifts.includes(val)}
                              onChange={e => setForm(f => ({
                                ...f,
                                inspectionShifts: e.target.checked
                                  ? [...f.inspectionShifts, val]
                                  : f.inspectionShifts.filter(s => s !== val),
                              }))}
                              className="w-4 h-4 rounded accent-teal-600 disabled:opacity-50"
                            />
                            {lbl}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Photos équipement (multiple) */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">{I.photos}</label>
                <div className="flex flex-wrap gap-2">
                  {form.equipmentPhotos.map((src, idx) => (
                    <div key={idx} className="relative">
                      <img src={src} alt={`Équipement ${idx + 1}`}
                        className="h-24 w-24 rounded-xl border border-gray-200 object-cover cursor-pointer"
                        onClick={() => window.open(src, '_blank')} />
                      {!isReadOnly && (
                        <button
                          onClick={() => setForm(f => ({ ...f, equipmentPhotos: f.equipmentPhotos.filter((_, i) => i !== idx) }))}
                          className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow text-gray-500 hover:text-red-500">
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                  {!isReadOnly && (
                    <label className="flex flex-col items-center justify-center gap-1 cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-3 hover:border-teal-400 text-xs text-gray-500 h-24 w-24">
                      <Camera size={18} className="text-teal-500" />
                      Ajouter
                      <input type="file" accept="image/*" capture="environment" className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const b64 = await compressPhoto(file);
                            setForm(f => ({ ...f, equipmentPhotos: [...f.equipmentPhotos, b64] }));
                          } catch { /* ignore */ }
                          e.target.value = '';
                        }}
                      />
                    </label>
                  )}
                  {isReadOnly && form.equipmentPhotos.length === 0 && (
                    <p className="text-xs text-gray-400">{I.noPhoto}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 — Checklist */}
          {checklist && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <ClipboardCheck size={16} className="text-teal-600" />
                {I.checklist}
                <span className="text-xs font-normal text-gray-400 ml-1">
                  ({Object.keys(form.results).length} / {(checklist?.sections.flatMap(s => s.items).length ?? 0) + form.customItems.length} {I.itemsAnswered})
                </span>
              </h2>

              {checklist?.sections.map(section => {
                const sectionFails     = section.items.filter(i => form.results[i.id] === 'fail').length;
                const sectionWithdraws = section.items.filter(i => form.results[i.id] === 'fail' && i.withdrawal).length;
                const collapsed        = collapsedSections.has(section.id);

                return (
                  <div key={section.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <button
                      className="w-full px-5 py-3 flex items-center justify-between gap-3 text-left bg-gray-50 border-b border-gray-100 hover:bg-gray-100"
                      onClick={() => toggleSection(section.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">{section.title}</span>
                        {sectionWithdraws > 0 && (
                          <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold border border-red-200">
                            <AlertOctagon size={10} /> {sectionWithdraws} {I.withdrawal}
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

                    {!collapsed && (
                      <div className="divide-y divide-gray-50">
                        {section.items.map(item => {
                          const result = form.results[item.id];
                          const isFail = result === 'fail';
                          const rowBg  = isFail && item.withdrawal ? 'bg-red-50' : isFail ? 'bg-orange-50' : '';

                          return (
                            <div key={item.id} className={`px-5 py-3 ${rowBg}`}>
                              <div className="flex items-start gap-3">
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
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm ${isFail ? 'font-medium' : 'text-gray-700'}`}>
                                    {item.label}
                                  </p>
                                  {item.helpText && (
                                    <p className="text-xs text-gray-400 mt-0.5 italic">{item.helpText}</p>
                                  )}
                                  {isFail && !isReadOnly && (
                                    <div className="mt-2 flex flex-col gap-2">
                                      <input
                                        type="text"
                                        value={form.itemNotes[item.id] ?? ''}
                                        onChange={e => setItemNote(item.id, e.target.value)}
                                        placeholder={I.defectPlaceholder}
                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-400"
                                      />
                                      <PhotoInput
                                        value={form.itemPhotos[item.id] ?? null}
                                        onChange={v => setItemPhoto(item.id, v)}
                                        label="Photo du bris"
                                      />
                                    </div>
                                  )}
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

              {/* Points d'inspection personnalisés */}
              {(!isReadOnly || form.customItems.length > 0) && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">{I.addPoints}</span>
                  <span className="text-xs text-gray-400">{I.pointCount(form.customItems.length)}</span>
                </div>
                {form.customItems.length > 0 && (
                  <div className="divide-y divide-gray-50">
                    {form.customItems.map(ci => (
                      <div key={ci.id} className="px-5 py-3 flex items-center gap-3">
                        <div className="flex-1 text-sm text-gray-700">{ci.label}</div>
                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={() => setForm(f => ({
                              ...f,
                              customItems: f.customItems.filter(x => x.id !== ci.id),
                              results: Object.fromEntries(Object.entries(f.results).filter(([k]) => k !== ci.id)),
                            }))}
                            className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                        <ResultToggle
                          value={form.results[ci.id]}
                          onChange={v => setResult(ci.id, v)}
                          disabled={isReadOnly}
                        />
                      </div>
                    ))}
                  </div>
                )}
                {!isReadOnly && (
                  <AddCustomItemRow
                    placeholder={I.newPoint}
                    addLabel={I.add}
                    onAdd={label => {
                      const id = `custom_${Date.now()}`;
                      setForm(f => ({ ...f, customItems: [...f.customItems, { id, label }] }));
                    }}
                  />
                )}
              </div>
              )}
            </div>
          )}

          {/* Section 3 — Non-conformités + actions correctives */}
          {nonConformities.length > 0 && (
            <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-red-100 bg-red-50 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-600" />
                  <span className="text-sm font-semibold text-red-700">
                    {I.ncDetected(nonConformities.length)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {shareMsg && (
                    <span className="text-xs text-teal-700 bg-teal-50 border border-teal-200 rounded px-2 py-0.5 font-medium">
                      {shareMsg}
                    </span>
                  )}
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg px-2 py-1 hover:bg-gray-50"
                  >
                    <Share2 size={12} />
                    {I.share}
                  </button>
                </div>
              </div>

              <div className="divide-y divide-red-50">
                {nonConformities.map(nc => {
                  const ca       = form.correctiveActions[nc.id] ?? { note: '', deadline: '', assigned: '', usable: false };
                  const expanded = expandedNCs.has(nc.id);
                  const showUsable = nc.withdrawal || nc.critical;

                  return (
                    <div key={nc.id}>
                      {/* NC header row */}
                      <button
                        className="w-full px-5 py-3 flex items-start gap-3 text-left hover:bg-red-50/50"
                        onClick={() => toggleNC(nc.id)}
                      >
                        <div className="shrink-0 mt-0.5">
                          {nc.withdrawal
                            ? <AlertOctagon size={16} className="text-red-600" />
                            : <XCircle size={16} className="text-orange-500" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800">{nc.label}</p>
                          {form.itemNotes[nc.id] && (
                            <p className="text-xs text-gray-500 mt-0.5">{form.itemNotes[nc.id]}</p>
                          )}
                          {ca.note && (
                            <p className="text-xs text-teal-700 mt-0.5 italic">↳ {ca.note}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {nc.withdrawal && (
                            <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded font-bold">RETRAIT</span>
                          )}
                          {nc.critical && !nc.withdrawal && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-semibold border border-orange-200">CRITIQUE</span>
                          )}
                          <ChevronRight
                            size={14}
                            className={`text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
                          />
                        </div>
                      </button>

                      {/* Corrective action panel */}
                      {expanded && !isReadOnly && (
                        <div className="px-5 pb-4 bg-orange-50/40 border-t border-orange-100 space-y-3">
                          <p className="text-xs font-semibold text-gray-500 pt-3">{I.caTitle}</p>

                          <div>
                            <label className="block text-xs text-gray-500 mb-1">{I.caDesc}</label>
                            <textarea
                              rows={2}
                              value={ca.note}
                              onChange={e => setCA(nc.id, { note: e.target.value })}
                              placeholder={I.caPlaceholder}
                              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-400 resize-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">{I.caAssigned}</label>
                              <input
                                type="text"
                                value={ca.assigned}
                                onChange={e => setCA(nc.id, { assigned: e.target.value })}
                                placeholder={I.caAssigned}
                                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-400"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">{I.caDeadline}</label>
                              <input
                                type="date"
                                value={ca.deadline}
                                onChange={e => setCA(nc.id, { deadline: e.target.value })}
                                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-400"
                              />
                            </div>
                          </div>

                          {showUsable && (
                            <label className="flex items-start gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={ca.usable}
                                onChange={e => setCA(nc.id, { usable: e.target.checked })}
                                className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-teal-600 focus:ring-teal-400"
                              />
                              <span className="text-xs text-gray-600">
                                {I.caUsable(ca.deadline)}
                              </span>
                            </label>
                          )}
                        </div>
                      )}

                      {/* Read-only corrective action display */}
                      {expanded && isReadOnly && (ca.note || ca.assigned || ca.deadline) && (
                        <div className="px-5 pb-4 bg-orange-50/40 border-t border-orange-100 space-y-1 pt-3">
                          {ca.note     && <p className="text-xs text-gray-700"><strong>{I.caAction}</strong> {ca.note}</p>}
                          {ca.assigned && <p className="text-xs text-gray-500"><strong>{I.caResponsible}</strong> {ca.assigned}</p>}
                          {ca.deadline && <p className="text-xs text-gray-500"><strong>{I.caDeadlineLabel}</strong> {ca.deadline}</p>}
                          {ca.usable   && <p className="text-xs text-teal-700 font-medium">{I.caUsableConfirm}</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 4 — Notes */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="block text-xs font-medium text-gray-600 mb-2">{I.notes}</label>
            <textarea
              value={form.notes}
              disabled={isReadOnly}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3}
              placeholder={I.notesPlaceholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:bg-gray-50 resize-none"
            />
          </div>

          {/* Section 5 — Résultat global + save bottom */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-medium text-gray-600 mb-3">{I.overallResult}</p>
            <div className="flex items-center justify-between gap-4">
              <ResultBadge result={overallResult} size="md" />
              <div className="text-xs text-gray-400 text-right">
                <p><span className="inline-flex items-center gap-1 text-red-500"><AlertOctagon size={10} /> Retrait</span> = retrait immédiat obligatoire</p>
                <p><span className="inline-flex items-center gap-1 text-orange-400"><AlertTriangle size={10} /> Critique</span> = non-conforme</p>
                <p><span className="inline-flex items-center gap-1 text-gray-400"><Info size={10} /> Standard</span> = conditionnel si fail</p>
              </div>
            </div>

            {!isReadOnly && (
              <div className="mt-4 flex gap-3 justify-end">
                <button onClick={onClose}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                  {I.fr ? 'Retour' : 'Back'}
                </button>
                <button
                  disabled={saving}
                  onClick={() => handleSave('draft')}
                  className="px-4 py-2 text-sm border border-teal-300 text-teal-700 rounded-lg hover:bg-teal-50 disabled:opacity-50">
                  {I.fr ? 'Sauvegarder brouillon' : 'Save draft'}
                </button>
                <button
                  disabled={saving}
                  onClick={() => handleSave('submitted')}
                  className="px-5 py-2 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium disabled:opacity-50">
                  {saving ? I.saving : (I.fr ? "Soumettre l'inspection" : 'Submit inspection')}
                </button>
              </div>
            )}
          </div>

        </div>
      )}

      {/* QR TAB */}
      {activeTab === 'qr' && (
        <div className="max-w-3xl mx-auto px-4 py-10 flex flex-col items-center gap-6">
          {!internalId ? (
            <div className="text-center space-y-3 py-16">
              <QrCode size={48} className="text-gray-300 mx-auto" />
              <p className="text-gray-500 text-sm">{I.qrSubmitFirst}</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 flex flex-col items-center gap-4 w-full max-w-xs">
                <div className="flex flex-col items-center gap-0.5">
                  <img src={logoUrl || '/c-secur360-logo.png'} alt="Logo" className="h-14 w-auto object-contain" />
                  <span className="text-xs text-gray-400">c-secur360.ca</span>
                </div>
                <QRCodeSVG
                  value={`${window.location.origin}/${tenant}/inspections/${internalId}`}
                  size={220}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#0f172a"
                />
                <div className="text-center">
                  <p className="font-bold text-gray-900 text-lg">{existingRow?.inspection_number ?? ''}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {INSPECTION_TYPE_OPTIONS.find(o => o.value === form.equipmentType)?.label ?? form.equipmentType}
                    {form.equipmentName ? ` — ${form.equipmentName}` : ''}
                  </p>
                  {form.equipmentSerial && (
                    <p className="text-xs text-gray-400 mt-0.5">{form.equipmentSerial}</p>
                  )}
                </div>
                <p className="text-xs text-gray-400 text-center whitespace-pre-line">{I.qrInstruction}</p>
                <button
                  onClick={handlePrintQR}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium"
                >
                  <Printer size={15} />
                  {I.print}
                </button>
              </div>
              {existingRow?.overall_result && (
                <ResultBadge result={existingRow.overall_result} size="md" />
              )}
            </>
          )}
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="max-w-3xl mx-auto px-4 py-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <History size={16} className="text-teal-600" />
            {I.prevInspections}
            {form.equipmentSerial
              ? <span className="text-xs font-normal text-gray-400">{I.serie} {form.equipmentSerial}</span>
              : form.equipmentName
                ? <span className="text-xs font-normal text-gray-400">— {form.equipmentName}</span>
                : null
            }
          </h2>

          {historyLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
            </div>
          ) : historyRows.length === 0 ? (
            <div className="text-center py-16 text-gray-400 space-y-2">
              <History size={40} className="mx-auto text-gray-200" />
              <p className="text-sm">{I.noHistory}</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
              {historyRows.map(row => {
                const isCurrent = row.id === internalId;
                return (
                  <a
                    key={row.id}
                    href={`/${tenant}/inspections/${row.id}/edit`}
                    className={`flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors ${isCurrent ? 'bg-teal-50' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{row.inspection_number}</span>
                        {row.overall_result && <ResultBadge result={row.overall_result} />}
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-teal-600 text-white">
                            {I.fr ? 'Actuelle' : 'Current'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                        {row.inspection_date && <span>{row.inspection_date}</span>}
                        {row.inspector_name  && <span>· {row.inspector_name}</span>}
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                          row.status === 'submitted' ? 'bg-teal-50 text-teal-700' :
                          row.status === 'closed'    ? 'bg-gray-100 text-gray-500' :
                          'bg-yellow-50 text-yellow-700'
                        }`}>{row.status}</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 shrink-0" />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
