'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, Send, Loader2, Plus, Trash2,
  Search, Briefcase, Settings2, Wrench, MoreHorizontal, Car, Building2,
  Gauge, AlertTriangle, CheckCircle2, Gift, Timer, ChevronDown, DollarSign, Paperclip, Receipt, Download,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PortalHeader } from '@/components/PortalHeader';
import { ARC_2026 } from '@/lib/constants/arc';
import { uploadReceipt } from '@/lib/transactions';
import { listRecurringTasks, type RecurringTask } from '@/lib/recurringTasks';
import { isLocked } from '@/lib/timesheetStatus';

type Entry = {
  id: string; date: string;
  category: string; // 'project' | 'task' (les tâches viennent du catalogue admin) ; legacy: admin/atelier/autre
  recurring_task_id?: string; recurring_task_name?: string;
  project_id: string; project_number: string; project_title: string; client_name: string;
  description: string; hrs_regular: number; hrs_overtime: number; hrs_premium: number;
  km: number; vehicle_id: string; vehicle_type: string; vehicle_name: string; materiel: number;
  allowances: { id: string; name: string; amount: number }[];
};
type Project  = { id: string; project_number: string; title: string | null; client_name: string | null };
type Rate     = { code: string; rate_regular: number; rate_overtime: number; rate_premium: number };
type Vehicle  = { id: string; name: string; make: string; model: string; type: string };
type Sheet    = { id: string; tenant_id: string; employee_id: string; employee_name: string; employee_email: string; period_start: string; period_end: string; status: string; notes: string; total_commissions?: number; commission_details?: any[]; adjustment_note?: string | null; rejection_note?: string | null; adjustment_flag?: boolean };
type Allowance = { id: string; name: string; amount: number; is_taxable: boolean };
type HourBonus = { id: string; name: string; trigger_hours: number; bonus_amount: number };
type EmployeeProfile = { hourly_rate: number; ot_multiplier: number; dt_multiplier: number };
type AssignedVehicle = { id: string; name: string; make: string; model: string; regime?: string; km_rate_override?: number | null; is_sales_employee?: boolean };
type LogEntry = { id?: string; odometer_start: number; odometer_end: number; km_personal: number };
type Expense = { id: string; entry_id?: string; date: string; category: string; supplier: string; description: string; subtotal: number; gst: number; qst: number; total: number; receipt_url: string; reimbursable: boolean; project_id: string; project_number?: string; recurring_task_id?: string; recurring_task_name?: string };

const EXPENSE_CATS = [
  { k: 'carburant',    label: 'Carburant' },
  { k: 'repas',        label: 'Repas' },
  { k: 'hebergement',  label: 'Hébergement' },
  { k: 'materiel',     label: 'Matériel' },
  { k: 'outils',       label: 'Outils' },
  { k: 'stationnement',label: 'Stationnement' },
  { k: 'peage',        label: 'Péage' },
  { k: 'autre',        label: 'Autre' },
];
// TPS 5 % + TVQ 9,975 % (QC) — pré-remplissage par défaut, ajustable selon le reçu.
const TPS = 0.05, TVQ = 0.09975;
function newExpense(date: string, entryId = ''): Expense {
  return { id: `x_${Date.now()}_${Math.random()}`, entry_id: entryId, date, category: 'autre', supplier: '', description: '', subtotal: 0, gst: 0, qst: 0, total: 0, receipt_url: '', reimbursable: true, project_id: '', project_number: '', recurring_task_id: '', recurring_task_name: '' };
}

const CATS = [
  { k: 'project', label: 'Projet',          icon: Briefcase },
  { k: 'admin',   label: 'Administration',   icon: Settings2 },
  { k: 'atelier', label: 'Atelier',          icon: Wrench },
  { k: 'autre',   label: 'Autre',            icon: MoreHorizontal },
] as const;

// Taux centralisés ARC 2026 (cohérence avec l'admin véhicules) — voir lib/constants/arc.ts

const money = (n: number) => `${(Math.round(n * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $`;

// Champ numérique à BROUILLON LOCAL : on garde la saisie texte telle quelle pendant la frappe
// (permet « 7. », « 0.5 », champ vidé…) et on ne convertit en nombre qu'au blur. Évite le glitch
// d'un input number contrôlé où `value={nombre}` réécrit la valeur à chaque frappe.
function NumCell({ value, disabled, step, onCommit }: { value: number; disabled?: boolean; step?: string; onCommit: (n: number) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft !== null ? draft : (value === 0 ? '' : String(value));
  return (
    <input type="number" step={step || '0.5'} disabled={disabled} inputMode="decimal" placeholder="0"
      onFocus={ev => ev.target.select()}
      value={shown}
      onChange={ev => setDraft(ev.target.value)}
      onBlur={() => { onCommit(draft === null || draft.trim() === '' ? 0 : (Number(draft) || 0)); setDraft(null); }}
      className="w-16 rounded-lg border-2 border-slate-300 bg-white px-2 py-1.5 text-center text-sm font-bold text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100" />
  );
}

// Écriture TOLÉRANTE : si une colonne n'existe pas dans le schéma Supabase (migrations incomplètes),
// on la retire du payload et on réessaie -> l'enregistrement persiste ce que le schéma supporte au
// lieu d'échouer en bloc (et, avec le DELETE-puis-INSERT, de perdre les lignes).
async function writeStripRetry(table: string, op: 'insert' | 'update' | 'upsert', payload: any, eq?: { col: string; val: any }, keep: string[] = []): Promise<{ error?: string }> {
  let body: any = Array.isArray(payload) ? payload.map((r: any) => ({ ...r })) : { ...payload };
  for (let guard = 0; guard < 18; guard++) {
    let q: any = op === 'insert' ? supabase.from(table).insert(body)
      : op === 'upsert' ? supabase.from(table).upsert(body, { onConflict: 'id' })
      : supabase.from(table).update(body);
    if (op === 'update' && eq) q = q.eq(eq.col, eq.val);
    const { error } = await q;
    if (!error) return {};
    const m = (error.message || '').match(/column "?([a-z_0-9]+)"?.*does not exist|could not find the '([a-z_0-9]+)'|'([a-z_0-9]+)' column/i);
    const col = m ? (m[1] || m[2] || m[3]) : null;
    if (col && !keep.includes(col)) {
      if (Array.isArray(body)) body = body.map((r: any) => { const c = { ...r }; delete c[col]; return c; });
      else delete body[col];
      continue;
    }
    // Cache de schéma PostgREST périmé (PGRST204) sur une colonne pourtant essentielle (date…) :
    // message explicite et actionnable plutôt qu'un échec opaque.
    if (col && keep.includes(col) && /schema cache/i.test(error.message || '')) {
      return { error: `Cache de schéma Supabase périmé (colonne « ${col} »). Dans Supabase → SQL : NOTIFY pgrst, 'reload schema';` };
    }
    return { error: error.message };
  }
  return { error: 'trop de colonnes manquantes (appliquer la migration 156)' };
}

function newEntry(date: string): Entry {
  // UUID stable (et non plus un id temporaire) -> le lien dépense→ligne (entry_id) survit à
  // l'enregistrement (on insère AVEC l'id, voir save()).
  return { id: (globalThis.crypto?.randomUUID?.() || `e_${Date.now()}_${Math.random()}`), date, category: 'project', recurring_task_id: '', recurring_task_name: '', project_id: '', project_number: '', project_title: '', client_name: '', description: '', hrs_regular: 0, hrs_overtime: 0, hrs_premium: 0, km: 0, vehicle_id: '', vehicle_type: '', vehicle_name: '', materiel: 0, allowances: [] };
}

export default function TimesheetDetailPage() {
  const params  = useParams();
  const router  = useRouter();
  const tenant  = (params?.tenant as string) || 'demo';
  const sheetId = params?.id as string;

  const [sheet, setSheet]       = useState<Sheet | null>(null);
  const [forbidden, setForbidden] = useState(false); // feuille d'un AUTRE utilisateur (non superviseur) -> accès refusé
  const [notOwner, setNotOwner]   = useState(false); // superviseur consultant la feuille d'un autre -> lecture seule
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]); // catalogue admin (bureau/atelier/…)
  useEffect(() => { if (tenant) listRecurringTasks(tenant).then(setRecurringTasks).catch(() => {}); }, [tenant]);
  const [entries, setEntries]   = useState<Entry[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [rates, setRates]       = useState<Rate[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  // Projets où les frais de subsistance ne sont PAS applicables (règle interne/externe #49). Best-effort :
  // si la colonne n'existe pas encore (migration 213 non appliquée), on n'affiche simplement pas l'avertissement.
  const [perDiemNA, setPerDiemNA] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!tenant) return;
    let active = true;
    supabase.from('projects').select('project_number, subsistence_applicable').eq('tenant_id', tenant).eq('subsistence_applicable', false)
      .then(({ data, error }) => { if (active && !error && data) setPerDiemNA(new Set(data.map((p: any) => String(p.project_number)).filter(Boolean))); }, () => {});
    return () => { active = false; };
  }, [tenant]);
  const isSubsistenceAllowance = (name?: string) => /subsist/i.test(String(name || ''));
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [kmRate, setKmRate]     = useState(0);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [exporting, setExporting] = useState(false);
  const [notice, setNotice]     = useState<string | null>(null);
  // Auto-enregistrement : toute saisie est persistée automatiquement (débounce), même en quittant la semaine.
  const [autoSaving, setAutoSaving]     = useState(false);
  const [lastAutoSaved, setLastAutoSaved] = useState<Date | null>(null);
  const savingRef      = useRef(false); // une écriture est en cours
  const pendingSaveRef = useRef(false); // une modif est arrivée pendant l'écriture -> relancer
  const lastSavedSig   = useRef<string>(''); // signature de l'état déjà persisté (anti-écriture inutile)
  // La feuille de temps n'affiche AUCUN montant $ (heures seulement) — la paie/les montants se font
  // dans le module Paie. Les totaux restent calculés et enregistrés (pour la paie), mais non affichés ici.
  const canSeeMoney = false;

  // Payroll profile + allowances + bonuses
  const [profile, setProfile]         = useState<EmployeeProfile | null>(null);
  const [allowances, setAllowances]   = useState<Allowance[]>([]);
  const [hourBonuses, setHourBonuses] = useState<HourBonus[]>([]);

  // Vehicle gate
  const [assignedVehicle, setAssignedVehicle] = useState<AssignedVehicle | null>(null);
  const [logEntry, setLogEntry]               = useState<LogEntry | null>(null);
  const [odoInput, setOdoInput]               = useState('');
  const [savingOdo, setSavingOdo]             = useState(false);
  const [showOdoEnd, setShowOdoEnd]           = useState(false);
  const [odoEndInput, setOdoEndInput]         = useState('');

  // Project search state per row
  const [projSearch, setProjSearch] = useState<Record<string, string>>({});
  const [projOpen, setProjOpen]     = useState<Record<string, boolean>>({});
  const projRefs = useRef<Record<string, HTMLDivElement | null>>({});


  useEffect(() => {
    let active = true;
    (async () => {
      // Identité de l'utilisateur courant — pour empêcher la contamination entre utilisateurs.
      const meJson = await fetch('/api/auth/me', { credentials: 'include' }).then(r => r.json()).catch(() => ({}));
      const me = meJson?.user; const isSup = !!me && (me.role === 'client_admin' || me.role === 'super_admin');
      const [{ data: sh }, { data: ents }, { data: r }, { data: p }, { data: v }, { data: s }] = await Promise.all([
        supabase.from('timesheets').select('*').eq('id', sheetId).single(),
        supabase.from('timesheet_entries').select('*').eq('timesheet_id', sheetId).order('date'),
        supabase.from('labor_rates').select('code,rate_regular,rate_overtime,rate_premium').eq('tenant_id', tenant).order('code'),
        supabase.from('projects').select('id,project_number,title,client_name').eq('tenant_id', tenant).order('created_at', { ascending: false }),
        supabase.from('vehicles').select('id,name,make,model,type').eq('tenant_id', tenant).eq('active', true),
        supabase.from('rate_settings').select('category,key,value').eq('tenant_id', tenant),
      ]);
      if (!active) return;
      // Garde de propriété : on ne voit/édite QUE sa propre feuille. Un superviseur peut consulter
      // celle d'un autre, mais en LECTURE SEULE (approbation). Sinon -> accès refusé.
      if (sh && me && String(sh.employee_id) !== String(me.id)) {
        if (!isSup) { setForbidden(true); setLoading(false); return; }
        setNotOwner(true);
      }
      setSheet(sh);
      // Charge les lignes existantes + amorce les 7 jours de la période (lun→dim) manquants,
      // pour que TOUS les jours apparaissent comme lignes. Les jours vides ne sont pas persistés.
      const loaded = (ents || []).map((e: any) => ({ ...e, allowances: Array.isArray(e.allowances) ? e.allowances : [] }));
      if (sh?.period_start && sh?.period_end) {
        const f = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const days: string[] = [];
        let d = new Date(sh.period_start + 'T00:00'); const end = new Date(sh.period_end + 'T00:00');
        let guard = 0;
        while (d <= end && guard < 31) { days.push(f(d)); d = new Date(d.getTime() + 86400000); guard++; }
        const have = new Set(loaded.map((e: any) => e.date));
        const seeded = days.filter(dt => !have.has(dt)).map(dt => newEntry(dt));
        const all = [...loaded, ...seeded].sort((a: any, b: any) => String(a.date).localeCompare(String(b.date)));
        setEntries(all);
      } else {
        setEntries(loaded);
      }
      setRates(r || []);
      setProjects(p || []);
      setVehicles(v || []);
      const kmRow = (s || []).find((x: any) => x.category === 'km');
      setKmRate(kmRow ? Number(kmRow.value) : 0);

      const init: Record<string, string> = {};
      (ents || []).forEach((e: any) => { if (e.project_number) init[e.id] = `${e.project_number}${e.project_title ? ' — ' + e.project_title : ''}`; });
      setProjSearch(init);

      // Load profile + allowances + bonuses
      if (sh) {
        const [{ data: prof }, { data: allws }, { data: bonuses }] = await Promise.all([
          supabase.from('employee_profiles').select('hourly_rate,ot_multiplier,dt_multiplier').eq('tenant_id', tenant).eq('employee_id', sh.employee_id).maybeSingle(),
          supabase.from('timesheet_allowances').select('id,name,amount,is_taxable').eq('tenant_id', tenant).eq('active', true).order('sort_order'),
          supabase.from('timesheet_hour_bonuses').select('id,name,trigger_hours,bonus_amount').eq('tenant_id', tenant).eq('active', true).order('sort_order'),
        ]);
        if (prof) setProfile(prof as EmployeeProfile);
        setHourBonuses(bonuses || []);

        // #46 — Conditions de la grille salariale de l'employé (primes/subsistance définies dans la grille)
        // affichées comme cases à cocher par jour, EN PLUS des avantages globaux du tenant.
        let gridConds: Allowance[] = [];
        try {
          // Conditions de grille via la route SERVEUR (grille salariale fermée à l'anon).
          const gc = await fetch(`/api/hr/salary-grid?gridConditions=${sh.employee_id}`, { credentials: 'include' }).then(r => r.ok ? r.json() : {}).catch(() => ({}));
          const db = Array.isArray((gc as any)?.bonuses) ? (gc as any).bonuses : [];
          gridConds = db.map((b: any, i: number) => ({ id: `grid_${i}`, name: b.label || `Prime ${i + 1}`, amount: b.unit === 'fixed' ? (Number(b.amount) || 0) : 0, is_taxable: true }));
          // Frais/conditions du catalogue applicables à ce poste : l'employé reçoit le PRIX EMPLOYÉ
          // (= vendant −20 % par défaut, défini dans la grille du poste). Cases à cocher par jour.
          const conds = Array.isArray((gc as any)?.conditions) ? (gc as any).conditions : [];
          gridConds = [...gridConds, ...conds.map((c: any, i: number) => ({ id: `cond_${c.key || i}`, name: c.label || `Frais ${i + 1}`, amount: Number(c.employee_price) || 0, is_taxable: false }))];
        } catch { /* grille absente */ }
        // Fusion : conditions de la grille d'abord, puis avantages globaux (sans doublon de nom).
        const globals = (allws || []) as Allowance[];
        const names = new Set(gridConds.map(g => g.name.toLowerCase()));
        setAllowances([...gridConds, ...globals.filter(a => !names.has((a.name || '').toLowerCase()))]);

        // Dépenses avec reçu (migration 108 ; ignore si table absente)
        try {
          const { data: exps } = await supabase.from('timesheet_expenses').select('*').eq('timesheet_id', sheetId).order('date');
          setExpenses((exps || []).map((x: any) => ({
            id: x.id, date: x.date || sh.period_start, category: x.category || 'autre', supplier: x.supplier || '',
            description: x.description || '', subtotal: Number(x.subtotal) || 0, gst: Number(x.gst) || 0, qst: Number(x.qst) || 0,
            total: Number(x.total) || 0, receipt_url: x.receipt_url || '', reimbursable: x.reimbursable !== false, project_id: x.project_id || '',
          })));
        } catch { /* table absente */ }

        // Load assigned company vehicle + logbook entry
        const { data: av } = await supabase.from('vehicles')
          .select('id,name,make,model,regime,km_rate_override,is_sales_employee')
          .eq('tenant_id', tenant)
          .eq('assigned_to', sh.employee_id)
          .eq('active', true)
          .maybeSingle();
        if (av) {
          setAssignedVehicle(av as AssignedVehicle);
          const { data: le } = await supabase.from('vehicle_logbook')
            .select('id,odometer_start,odometer_end,km_personal')
            .eq('vehicle_id', av.id)
            .eq('employee_id', sh.employee_id)
            .eq('week_start', sh.period_start)
            .maybeSingle();
          if (le) {
            setLogEntry(le as LogEntry);
            setOdoInput(String(le.odometer_start || ''));
            setOdoEndInput(String(le.odometer_end || ''));
          }
        }
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [sheetId, tenant]); // eslint-disable-line

  useEffect(() => {
    function close(e: MouseEvent) {
      Object.entries(projRefs.current).forEach(([id, el]) => {
        if (el && !el.contains(e.target as Node)) setProjOpen(o => ({ ...o, [id]: false }));
      });
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const rateMap    = useMemo(() => Object.fromEntries(rates.map(r => [r.code, r])), [rates]);
  const vehicleMap = useMemo(() => Object.fromEntries(vehicles.map(v => [v.id, v])), [vehicles]);

  function filteredProjects(search: string) {
    const q = (search || '').trim().toLowerCase();
    if (!q) return projects.slice(0, 8);
    return projects.filter(p => [p.project_number, p.title, p.client_name].some(v => v?.toLowerCase().includes(q))).slice(0, 10);
  }

  function pickProject(entryId: string, p: Project) {
    setEntries(prev => prev.map(e => e.id !== entryId ? e : { ...e, project_id: p.id, project_number: p.project_number, project_title: p.title || '', client_name: p.client_name || '', description: e.description || p.title || '' }));
    setProjSearch(s => ({ ...s, [entryId]: `${p.project_number}${p.title ? ' — ' + p.title : ''}` }));
    setProjOpen(o => ({ ...o, [entryId]: false }));
  }

  function updEntry(id: string, k: keyof Entry, v: any) {
    setEntries(prev => prev.map(e => e.id !== id ? e : { ...e, [k]: v }));
  }

  // Auto-arrondi au 15 min (0,25 h) : arrondit toutes les heures saisies au quart d'heure le plus proche.
  const round15 = (h: number) => Math.round((Number(h) || 0) * 4) / 4;
  function roundAllTo15() {
    setEntries(prev => prev.map(e => ({ ...e, hrs_regular: round15(e.hrs_regular), hrs_overtime: round15(e.hrs_overtime), hrs_premium: round15(e.hrs_premium) })));
  }

  // Type d'une ligne : PROJET (avec sélecteur de projet) ou TÂCHE récurrente (catalogue admin).
  function setEntryType(id: string, type: 'project' | RecurringTask) {
    setEntries(prev => prev.map(e => {
      if (e.id !== id) return e;
      if (type === 'project') return { ...e, category: 'project', recurring_task_id: '', recurring_task_name: '' };
      return { ...e, category: 'task', recurring_task_id: type.id || '', recurring_task_name: type.name || '', project_id: '', project_number: '', project_title: '', client_name: '' };
    }));
  }

  function updVehicle(id: string, vehicleId: string) {
    const v = vehicleMap[vehicleId];
    setEntries(prev => prev.map(e => e.id !== id ? e : { ...e, vehicle_id: vehicleId, vehicle_type: v?.type || '', vehicle_name: v ? (`${v.make} ${v.model}`.trim() || v.name) : '' }));
  }

  function toggleAllowance(entryId: string, a: Allowance, checked: boolean) {
    setEntries(prev => prev.map(e => {
      if (e.id !== entryId) return e;
      const next = checked
        ? [...e.allowances, { id: a.id, name: a.name, amount: a.amount }]
        : e.allowances.filter(x => x.id !== a.id);
      return { ...e, allowances: next };
    }));
  }

  function addEntry(date?: string) {
    const d = date || (sheet ? sheet.period_start : new Date().toISOString().slice(0, 10));
    setEntries(p => {
      const ne = newEntry(d);
      // Insère la nouvelle ligne JUSTE APRÈS la dernière ligne du MÊME jour (regroupement par jour).
      let lastIdx = -1;
      p.forEach((x, i) => { if (x.date === d) lastIdx = i; });
      const next = [...p];
      if (lastIdx >= 0) { next.splice(lastIdx + 1, 0, ne); return next; }
      // Aucun jour identique : insère en position triée par date.
      const idx = p.findIndex(x => String(x.date) > String(d));
      next.splice(idx < 0 ? p.length : idx, 0, ne);
      return next;
    });
  }

  // Suppression d'une LIGNE : confirmation si elle contient des données. On ne supprime JAMAIS une
  // journée entière — si c'est la dernière ligne du jour, on la VIDE (le jour reste visible).
  function removeEntry(entry: Entry) {
    if (isReadOnly) return;
    const hasData = !!(Number(entry.hrs_regular) || Number(entry.hrs_overtime) || Number(entry.hrs_premium) ||
      Number(entry.km) || Number(entry.materiel) || (entry.allowances && entry.allowances.length) ||
      entry.project_id || (entry.description && entry.description.trim()) || entry.recurring_task_id);
    const sameDay = entries.filter(x => x.date === entry.date);
    const isLastOfDay = sameDay.length <= 1;
    if (hasData || isLastOfDay) {
      const msg = isLastOfDay
        ? 'Vider cette journée ? La ligne sera remise à zéro (la journée reste dans la feuille). Action enregistrée automatiquement.'
        : 'Supprimer cette ligne de temps ? Action définitive (enregistrée automatiquement).';
      if (!confirm(msg)) return;
    }
    if (isLastOfDay) {
      // On garde l'identité de la ligne (id + date) mais on remet tous les champs à vide -> le JOUR reste.
      setEntries(p => p.map(x => x.id === entry.id ? { ...newEntry(entry.date), id: entry.id } : x));
    } else {
      setEntries(p => p.filter(x => x.id !== entry.id));
    }
    // Les dépenses rattachées à cette ligne disparaissent avec elle.
    setExpenses(p => p.filter(x => x.entry_id !== entry.id));
  }

  // ── Dépenses (avec reçu) ───────────────────────────────────────────────────
  function addExpense(entry?: Entry) {
    const d = entry?.date || (sheet ? sheet.period_start : new Date().toISOString().slice(0, 10));
    setExpenses(p => [...p, newExpense(d, entry?.id || '')]);
  }
  function updExpense(id: string, patch: Partial<Expense>) {
    setExpenses(prev => prev.map(x => {
      if (x.id !== id) return x;
      const nx = { ...x, ...patch };
      // Total = sous-total + taxes ; si on saisit le sous-total sans taxes, propose TPS/TVQ QC.
      if (patch.subtotal !== undefined && patch.gst === undefined && patch.qst === undefined && !nx.gst && !nx.qst) {
        nx.gst = Math.round(Number(nx.subtotal) * TPS * 100) / 100;
        nx.qst = Math.round(Number(nx.subtotal) * TVQ * 100) / 100;
      }
      nx.total = Math.round(((Number(nx.subtotal) || 0) + (Number(nx.gst) || 0) + (Number(nx.qst) || 0)) * 100) / 100;
      return nx;
    }));
  }
  function delExpense(id: string) { setExpenses(p => p.filter(x => x.id !== id)); }
  async function onReceiptUpload(id: string, file: File) {
    setUploadingId(id);
    try { const url = await uploadReceipt(tenant, file); updExpense(id, { receipt_url: url }); }
    catch (e: any) { setNotice('Reçu : ' + (e?.message || 'upload impossible')); }
    finally { setUploadingId(null); }
  }
  // Scan IA du reçu d'une dépense -> pré-remplit fournisseur/date/sous-total/TPS/TVQ + joint le reçu.
  async function scanExpenseAI(id: string, file: File) {
    setUploadingId(id); setNotice('Lecture du reçu par l’IA…');
    try {
      const dataUrl: string = await new Promise((res, rej) => { const rd = new FileReader(); rd.onload = () => res(String(rd.result || '')); rd.onerror = rej; rd.readAsDataURL(file); });
      const resp = await fetch('/api/transactions/scan-receipt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ imageBase64: dataUrl, file_name: file.name }) });
      const j = await resp.json();
      if (!resp.ok) { setNotice(j?.error || 'Scan indisponible.'); setUploadingId(null); return; }
      const x = j.extracted || (Array.isArray(j.extractedList) ? j.extractedList[0] : {}) || {};
      const gst = Number(x.gst) || 0, qst = Number(x.qst) || 0;
      const sub = Number(x.subtotal) || (Number(x.total) ? Number(x.total) - gst - qst - (Number(x.pst) || 0) : 0) || 0;
      updExpense(id, { supplier: x.vendor || '', date: x.date || undefined as any, description: x.description || x.category_hint || '', subtotal: Math.round(sub * 100) / 100, gst, qst });
      uploadReceipt(tenant, file).then(url => updExpense(id, { receipt_url: url })).catch(() => {});
      setNotice(`Reçu lu (fiabilité : ${x.confidence || '?'}) — vérifiez les champs pré-remplis.`);
    } catch (e: any) { setNotice('Scan : ' + (e?.message || 'erreur')); }
    finally { setUploadingId(null); }
  }
  const expensesTotal = useMemo(() => expenses.reduce((s, x) => s + (Number(x.total) || 0), 0), [expenses]);

  function entryKmRate(e: Entry) {
    if (e.vehicle_type === 'company') return 0;
    return kmRate;
  }

  function entryCost(e: Entry) {
    let labor = 0;
    if (profile && Number(profile.hourly_rate) > 0) {
      const hr = Number(profile.hourly_rate);
      labor = Number(e.hrs_regular) * hr
        + Number(e.hrs_overtime) * hr * Number(profile.ot_multiplier)
        + Number(e.hrs_premium)  * hr * Number(profile.dt_multiplier);
    } else {
      const r = rates[0];
      if (r) {
        labor = Number(e.hrs_regular) * Number(r.rate_regular)
          + Number(e.hrs_overtime) * Number(r.rate_overtime)
          + Number(e.hrs_premium)  * Number(r.rate_premium);
      }
    }
    const kmCost = Number(e.km) * entryKmRate(e);
    const allowCost = (e.allowances || []).reduce((s, a) => s + Number(a.amount), 0);
    return labor + kmCost + Number(e.materiel) + allowCost;
  }

  // Daily totals for hour bonus triggers
  const dailyHours = useMemo(() => {
    const byDate: Record<string, number> = {};
    entries.forEach(e => {
      byDate[e.date] = (byDate[e.date] || 0) + Number(e.hrs_regular) + Number(e.hrs_overtime) + Number(e.hrs_premium);
    });
    return byDate;
  }, [entries]);

  // Bonuses triggered per day
  const triggeredBonuses = useMemo(() => {
    const result: { date: string; bonuses: HourBonus[] }[] = [];
    Object.entries(dailyHours).forEach(([date, hrs]) => {
      const triggered = hourBonuses.filter(b => hrs >= b.trigger_hours);
      if (triggered.length > 0) result.push({ date, bonuses: triggered });
    });
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }, [dailyHours, hourBonuses]);

  const totalBonuses = useMemo(() =>
    triggeredBonuses.reduce((s, { bonuses }) => s + bonuses.reduce((bs, b) => bs + b.bonus_amount, 0), 0),
    [triggeredBonuses]
  );

  const totals = useMemo(() => entries.reduce((acc, e) => ({
    hrs_regular:  acc.hrs_regular  + Number(e.hrs_regular),
    hrs_overtime: acc.hrs_overtime + Number(e.hrs_overtime),
    hrs_premium:  acc.hrs_premium  + Number(e.hrs_premium),
    km_personal:  acc.km_personal  + (e.vehicle_type !== 'company' ? Number(e.km) : 0),
    km_company:   acc.km_company   + (e.vehicle_type === 'company' ? Number(e.km) : 0),
    amount:       acc.amount       + entryCost(e),
    allowances:   acc.allowances   + (e.allowances || []).reduce((s, a) => s + Number(a.amount), 0),
  }), { hrs_regular: 0, hrs_overtime: 0, hrs_premium: 0, km_personal: 0, km_company: 0, amount: 0, allowances: 0 }),
  [entries, profile, rates, kmRate]); // eslint-disable-line

  // Taux $/km appliqué selon le régime du véhicule assigné (normes ARC 2026 de l'admin)
  const vehicleRate = useMemo(() => {
    const regime = assignedVehicle?.regime || '';
    // Régime A (véhicule de l'employeur, ou ancien véhicule sans régime) : avantage fonctionnement
    if (!regime || regime.startsWith('A_')) {
      return assignedVehicle?.is_sales_employee ? ARC_2026.operating_sales : ARC_2026.operating_per_km;
    }
    return 0; // Régime B (véhicule personnel) : pas de déduction d'usage perso (remboursement km affaires géré séparément)
  }, [assignedVehicle]);
  const vehicleDeduction = useMemo(() => {
    if (!assignedVehicle || !logEntry) return 0;
    return Math.max(0, Number(logEntry.km_personal) || 0) * vehicleRate;
  }, [assignedVehicle, logEntry, vehicleRate]);

  // Commission de vente reportée sur cette feuille (posée par le module Projets)
  const commissions = Number(sheet?.total_commissions) || 0;
  const commissionDetails: any[] = Array.isArray(sheet?.commission_details) ? sheet!.commission_details : [];
  const netTotal = totals.amount + totalBonuses + commissions - vehicleDeduction;

  // Gate: employee has assigned vehicle but no logbook entry with odo_start
  const needsOdometer = assignedVehicle !== null && (!logEntry || Number(logEntry.odometer_start) === 0);
  const needsOdoEnd   = assignedVehicle !== null && logEntry !== null && Number(logEntry.odometer_end) === 0;

  async function saveOdometer() {
    if (!sheet || !assignedVehicle || !odoInput) return;
    const odoStart = parseFloat(odoInput);
    if (isNaN(odoStart) || odoStart <= 0) return;
    setSavingOdo(true);
    try {
      const payload = {
        tenant_id: tenant, employee_id: sheet.employee_id, employee_name: sheet.employee_name,
        vehicle_id: assignedVehicle.id, vehicle_name: `${assignedVehicle.make} ${assignedVehicle.model}`.trim() || assignedVehicle.name,
        vehicle_type: 'company', week_start: sheet.period_start,
        odometer_start: odoStart, odometer_end: logEntry?.odometer_end || 0,
        km_personal: logEntry?.km_personal || 0,
      };
      if (logEntry?.id) {
        await supabase.from('vehicle_logbook').update({ odometer_start: odoStart }).eq('id', logEntry.id);
        setLogEntry(prev => prev ? { ...prev, odometer_start: odoStart } : null);
      } else {
        const { data } = await supabase.from('vehicle_logbook').insert(payload).select('id,odometer_start,odometer_end,km_personal').single();
        if (data) setLogEntry(data as LogEntry);
      }
    } finally { setSavingOdo(false); }
  }

  async function saveOdoEnd() {
    if (!logEntry?.id || !odoEndInput) return;
    const odoEnd = parseFloat(odoEndInput);
    if (isNaN(odoEnd) || odoEnd <= 0) return;
    setSavingOdo(true);
    try {
      // km_personal = max(0, (odo_end - odo_start) - km_from_timesheets)
      const kmTotal = Math.max(0, odoEnd - Number(logEntry.odometer_start));
      const kmJob = entries.filter(e => e.vehicle_id === assignedVehicle?.id).reduce((s, e) => s + Number(e.km), 0);
      const kmPersonal = Math.max(0, kmTotal - kmJob);
      await supabase.from('vehicle_logbook').update({ odometer_end: odoEnd, km_personal: kmPersonal }).eq('id', logEntry.id);
      setLogEntry(prev => prev ? { ...prev, odometer_end: odoEnd, km_personal: kmPersonal } : null);
      setShowOdoEnd(false);
    } finally { setSavingOdo(false); }
  }

  // Signature de l'état saisissable -> détecte s'il y a vraiment quelque chose de neuf à enregistrer.
  function currentSig() { return JSON.stringify({ e: entries, x: expenses }); }

  async function save(submit = false, opts: { silent?: boolean } = {}) {
    const silent = !!opts.silent;
    if (!sheet) return;
    if (isReadOnly) return; // jamais d'écriture en lecture seule (feuille d'un autre / approuvée)
    // Warn if odo_end missing at submission
    if (submit && assignedVehicle && (!logEntry || Number(logEntry.odometer_end) === 0)) {
      const ok = confirm('⚠️ Vous n\'avez pas entré votre odomètre de fin de semaine. La déduction véhicule ne peut pas être calculée. Voulez-vous quand même soumettre ?');
      if (!ok) return;
    }
    if (savingRef.current) { pendingSaveRef.current = true; return; } // évite les sauvegardes concurrentes
    savingRef.current = true;
    if (silent) setAutoSaving(true); else { setSaving(true); setNotice(null); }
    try {
      // Ne persiste que les lignes RENSEIGNÉES (on ignore les 7 jours amorcés restés vides).
      const toKeep = entries.filter(e =>
        Number(e.hrs_regular) || Number(e.hrs_overtime) || Number(e.hrs_premium) ||
        Number(e.km) || Number(e.materiel) || (e.allowances && e.allowances.length) ||
        e.project_id || e.recurring_task_id || (e.description && e.description.trim())
      );
      // Whitelist STRICT des colonnes + coercition des types. CRUCIAL : vehicle_id est une colonne
      // UUID -> une chaine vide '' fait ECHOUER l'INSERT ; on coerce ''→null.
      const rows = toKeep.map((e: any, i) => ({
        id: e.id, // id stable (UUID) -> préserve le lien dépense→ligne + sert de clé d'upsert
        timesheet_id: sheetId, tenant_id: tenant, sort_order: i,
        date: e.date,
        category: e.category || 'project',
        recurring_task_id: e.recurring_task_id || null,
        recurring_task_name: e.recurring_task_name || '',
        project_id: e.project_id || null,
        project_number: e.project_number || '',
        project_title: e.project_title || '',
        client_name: e.client_name || '',
        description: e.description || '',
        hrs_regular: Number(e.hrs_regular) || 0,
        hrs_overtime: Number(e.hrs_overtime) || 0,
        hrs_premium: Number(e.hrs_premium) || 0,
        km: Number(e.km) || 0,
        vehicle_id: e.vehicle_id || null,
        vehicle_type: e.vehicle_type || '',
        vehicle_name: e.vehicle_name || '',
        materiel: Number(e.materiel) || 0,
        allowances: e.allowances || [],
      }));
      // NON DESTRUCTIF : on UPSERT d'abord (si ça échoue, rien n'est perdu), PUIS on supprime
      // seulement les lignes de cette feuille qui ne sont plus présentes (supprimées/vidées).
      if (rows.length) {
        const ins = await writeStripRetry('timesheet_entries', 'upsert', rows, undefined, ['timesheet_id', 'tenant_id', 'date']);
        if (ins.error) throw new Error('Enregistrement des lignes : ' + ins.error);
      }
      const keepIds = rows.map(r => r.id);
      let delQ: any = supabase.from('timesheet_entries').delete().eq('timesheet_id', sheetId);
      if (keepIds.length) delQ = delQ.not('id', 'in', `(${keepIds.join(',')})`);
      const { error: delErr } = await delQ;
      if (delErr) throw new Error('Nettoyage des lignes : ' + delErr.message);
      // Dépenses : rattachées à LEUR ligne (entry_id) et héritant du PROJET/TÂCHE de cette ligne
      // (project_id/number, recurring_task) -> remontée à la facturation du projet. strip-retry pour
      // tolérer un schéma incomplet (migration 158).
      try {
        await supabase.from('timesheet_expenses').delete().eq('timesheet_id', sheetId);
        const expToInsert = expenses.filter(x => Number(x.total) > 0 || (x.description && x.description.trim()) || x.receipt_url);
        if (expToInsert.length) {
          const entryById: Record<string, Entry> = {}; entries.forEach(en => { entryById[en.id] = en; });
          const expRows = expToInsert.map((x: any) => {
            const parent: Entry | undefined = x.entry_id ? entryById[x.entry_id] : undefined;
            return {
              timesheet_id: sheetId, tenant_id: tenant, entry_id: x.entry_id || null,
              date: x.date, category: x.category || 'autre', supplier: x.supplier || '', description: x.description || '',
              subtotal: Number(x.subtotal) || 0, gst: Number(x.gst) || 0, qst: Number(x.qst) || 0, total: Number(x.total) || 0,
              receipt_url: x.receipt_url || '', reimbursable: x.reimbursable !== false,
              project_id: (parent?.project_id || x.project_id) || null,
              project_number: parent?.project_number || x.project_number || '',
              recurring_task_id: (parent?.recurring_task_id || x.recurring_task_id) || null,
              recurring_task_name: parent?.recurring_task_name || x.recurring_task_name || '',
            };
          });
          await writeStripRetry('timesheet_expenses', 'insert', expRows, undefined, ['timesheet_id', 'tenant_id', 'date']);
        }
      } catch { /* table 108 non exécutée */ }
      const update: any = {
        total_regular: totals.hrs_regular, total_overtime: totals.hrs_overtime,
        total_premium: totals.hrs_premium, total_km: totals.km_personal + totals.km_company,
        total_km_personal: totals.km_personal,
        total_allowances: totals.allowances, total_bonuses: totalBonuses,
        vehicle_deduction: vehicleDeduction,
        total_amount: netTotal,
        updated_at: new Date().toISOString(),
      };
      if (submit) { update.status = 'submitted'; update.submitted_at = new Date().toISOString(); }
      const up = await writeStripRetry('timesheets', 'update', update, { col: 'id', val: sheetId });
      if (up.error) throw new Error('Enregistrement des totaux : ' + up.error);
      lastSavedSig.current = currentSig(); // baseline après écriture réussie
      if (silent) { setLastAutoSaved(new Date()); }
      else { setNotice(submit ? 'Feuille soumise au superviseur ✓' : 'Enregistré ✓'); }
      if (submit) router.push(`/${tenant}/timesheets`);
    } catch (e: any) {
      if (silent) setNotice('Auto-enregistrement : ' + (e?.message || 'DB'));
      else setNotice('Erreur : ' + (e?.message || 'DB'));
    }
    finally {
      savingRef.current = false;
      if (silent) setAutoSaving(false); else setSaving(false);
      // Une modif est survenue pendant la sauvegarde -> on relance pour ne rien perdre.
      if (pendingSaveRef.current) { pendingSaveRef.current = false; setTimeout(() => save(false, { silent: true }), 50); }
    }
  }

  async function exportPdf() {
    if (!sheet) return;
    setExporting(true);
    try {
      // Logo du tenant (sinon C-Secur360 par défaut).
      let logoUrl: string | undefined;
      try { const { data } = await supabase.from('tenants').select('logo_url').eq('subdomain', tenant).maybeSingle(); logoUrl = (data as any)?.logo_url || undefined; } catch { /* défaut */ }
      const { exportTimesheetPdf } = await import('@/lib/timesheetPdf');
      const style = await import('@/lib/pdfStyle').then(m => m.pdfStyleFor(tenant, 'feuille_temps')).catch(() => undefined);
      await exportTimesheetPdf({
        tr: (fr) => fr, logoUrl, style,
        sheet: { employee_name: sheet.employee_name, period_start: sheet.period_start, period_end: sheet.period_end, status: sheet.status },
        entries: entries.map(e => ({ date: e.date, category: e.category, project_number: e.project_number, project_title: e.project_title, recurring_task_name: e.recurring_task_name, description: e.description, hrs_regular: e.hrs_regular, hrs_overtime: e.hrs_overtime, hrs_premium: e.hrs_premium, km: e.km, allowances: e.allowances })),
        expenses: expenses.map(x => ({ date: x.date, category: x.category, supplier: x.supplier, description: x.description, total: x.total, reimbursable: x.reimbursable, receipt_url: x.receipt_url })),
      });
    } catch (e: any) { setNotice('Export PDF : ' + (e?.message || 'erreur')); }
    finally { setExporting(false); }
  }

  const isReadOnly = (sheet ? isLocked(sheet.status) : false) || notOwner; // validée/vérifiée/payée = verrouillée
  const canSubmit  = sheet?.status === 'draft' || sheet?.status === 'rejected';

  // Baseline : une fois la feuille chargée, on mémorise l'état initial comme « déjà enregistré »
  // (sinon l'autosave réécrirait inutilement les données chargées au montage).
  useEffect(() => {
    if (!loading && sheet) lastSavedSig.current = currentSig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, sheet?.id]);

  // AUTOSAVE : dès qu'une saisie change, on persiste automatiquement (débounce 1,2 s). Plus besoin de
  // cliquer « Enregistrer » ni de rester sur la semaine — le temps n'est jamais perdu.
  useEffect(() => {
    if (loading || isReadOnly || !sheet) return;
    if (savingRef.current) { pendingSaveRef.current = true; return; }
    if (currentSig() === lastSavedSig.current) return; // rien de neuf
    const t = setTimeout(() => { save(false, { silent: true }); }, 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, expenses, loading, isReadOnly, sheet?.id]);

  // Flush : si on quitte la page/la semaine avant la fin du débounce, on tente une dernière écriture
  // avec l'état le plus récent (flushRef est réassigné à chaque rendu pour éviter une closure périmée).
  const flushRef = useRef<() => void>(() => {});
  flushRef.current = () => {
    if (!isReadOnly && sheet && !savingRef.current && currentSig() !== lastSavedSig.current) save(false, { silent: true });
  };
  useEffect(() => {
    const onHide = () => flushRef.current();
    window.addEventListener('beforeunload', onHide);
    return () => { window.removeEventListener('beforeunload', onHide); flushRef.current(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (forbidden) return (
    <div className="min-h-screen bg-slate-50"><PortalHeader tenant={tenant} />
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="text-4xl">🔒</div>
        <h1 className="mt-3 text-xl font-bold text-slate-800">Accès refusé</h1>
        <p className="mt-2 text-sm text-slate-500">Cette feuille de temps appartient à un autre utilisateur.</p>
        <button onClick={() => router.push(`/${tenant}/timesheets`)} className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
          <ArrowLeft size={16} /> Mes feuilles de temps
        </button>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-slate-50"><PortalHeader tenant={tenant} />
      <div className="grid place-items-center py-32"><Loader2 className="animate-spin text-slate-400" /></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <PortalHeader tenant={tenant} />
      <div className="w-full px-4 pb-10 pt-5 lg:px-6">
        {/* Fil d'Ariane */}
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => router.push(`/${tenant}/timesheets`)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
            <ArrowLeft size={16} /> Feuilles de temps
          </button>
          {sheet?.period_start && (
            <Link href={`/${tenant}/logbook?week=${sheet.period_start}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-100">
              <Car size={13} /> Logbook semaine
            </Link>
          )}
        </div>

        {/* Ajustement demandé par l'administrateur paie — drapeau ROUGE + consigne (feuille déverrouillée) */}
        {sheet?.status === 'rejected' && (sheet?.adjustment_note || sheet?.rejection_note) && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-500" />
            <div>
              <div className="font-bold">⚠ Ajustement requis</div>
              <div className="text-xs">{sheet.adjustment_note || sheet.rejection_note}</div>
              <div className="mt-1 text-[11px] text-red-600/80">Corrigez puis soumettez à nouveau.</div>
            </div>
          </div>
        )}

        {/* En-tête feuille */}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{sheet?.employee_name}</h1>
            <p className="text-sm text-slate-500">
              {sheet?.period_start && `${new Date(sheet.period_start + 'T00:00').toLocaleDateString('fr-CA', { weekday:'long', month:'long', day:'numeric' })} → ${new Date(sheet!.period_end + 'T00:00').toLocaleDateString('fr-CA', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}`}
            </p>
            {canSeeMoney && profile && Number(profile.hourly_rate) > 0 && (
              <p className="mt-0.5 text-xs text-violet-600">{money(Number(profile.hourly_rate))}/h · OT ×{profile.ot_multiplier} · DT ×{profile.dt_multiplier}</p>
            )}
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            {!isReadOnly && (
              <>
                <span className="flex items-center gap-1 text-xs font-medium text-slate-400" title="Vos saisies sont enregistrées automatiquement">
                  {autoSaving
                    ? <><Loader2 size={12} className="animate-spin" /> Enregistrement…</>
                    : lastAutoSaved
                      ? <><CheckCircle2 size={12} className="text-emerald-500" /> Auto ✓ {lastAutoSaved.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}</>
                      : <>Auto-enregistrement activé</>}
                </span>
                <button onClick={roundAllTo15} title="Arrondir toutes les heures au 15 min (0,25 h)"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  ⏱ Arrondir 15 min
                </button>
                <button onClick={() => save(false)} disabled={saving}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Enregistrer
                </button>
                {canSubmit && (
                  <button onClick={() => save(true)} disabled={saving || needsOdometer}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60">
                    <Send size={15} /> <span className="sm:hidden">Soumettre</span><span className="hidden sm:inline">Soumettre au superviseur</span>
                  </button>
                )}
              </>
            )}
            <button onClick={exportPdf} disabled={exporting}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
              {exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />} Export PDF
            </button>
            <button onClick={async () => {
              try {
                const r = await fetch('/api/documents/share', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ docType: 'timesheet', docId: sheetId, tenant }) });
                const j = await r.json();
                if (!r.ok) { alert(j.error || 'Erreur (migration 180 ?)'); return; }
                try { await navigator.clipboard.writeText(j.url); alert('Lien d\'approbation client copié :\n' + j.url); } catch { window.prompt('Lien d\'approbation client :', j.url); }
              } catch { alert('Erreur réseau'); }
            }}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
              ✍️ Transmettre au client
            </button>
          </div>
        </div>

        {/* ── GATE ODOMÈTRE ────────────────────────────────────────────── */}
        {assignedVehicle && (
          <div className={`mb-4 overflow-hidden rounded-2xl border ${needsOdometer ? 'border-amber-300 bg-amber-50' : 'border-teal-200 bg-teal-50'}`}>
            <div className="flex items-start gap-3 px-4 py-3">
              <Gauge size={20} className={`mt-0.5 shrink-0 ${needsOdometer ? 'text-amber-600' : 'text-teal-600'}`} />
              <div className="flex-1">
                <div className="font-semibold text-sm text-slate-800">
                  Véhicule entreprise attitré — {assignedVehicle.make} {assignedVehicle.model}
                </div>
                {needsOdometer ? (
                  <>
                    <p className="text-xs text-amber-700 mb-2">Entrez votre odomètre de début de semaine pour démarrer votre feuille de temps.</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number" min={0} step={1} value={odoInput} onChange={e => setOdoInput(e.target.value)}
                        placeholder="Ex: 42850" className="inp w-32 text-center text-sm"
                      />
                      <span className="text-xs text-slate-500">km</span>
                      <button onClick={saveOdometer} disabled={savingOdo || !odoInput}
                        className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-60">
                        {savingOdo ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />} Confirmer odomètre
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-wrap items-center gap-3 text-xs text-teal-700">
                    <span>Odo début : <strong>{Number(logEntry?.odometer_start).toLocaleString('fr-CA')} km</strong></span>
                    {logEntry && Number(logEntry.odometer_end) > 0 ? (
                      <>
                        <span>Odo fin : <strong>{Number(logEntry.odometer_end).toLocaleString('fr-CA')} km</strong></span>
                        <span>Km pers. : <strong className="text-red-600">{Number(logEntry.km_personal).toFixed(0)} km</strong></span>
                        {canSeeMoney && <span>Déduction : <strong className="text-red-600">-{money(vehicleDeduction)}</strong></span>}
                      </>
                    ) : (
                      <button onClick={() => setShowOdoEnd(!showOdoEnd)}
                        className="inline-flex items-center gap-1 rounded-lg border border-teal-300 px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100">
                        <Gauge size={11} /> Entrer odomètre fin {showOdoEnd ? '▲' : '▼'}
                      </button>
                    )}
                    <button onClick={() => { setOdoInput(String(logEntry?.odometer_start || '')); setShowOdoEnd(false); }}
                      className="text-xs text-slate-400 hover:text-slate-600 underline">modifier début</button>
                  </div>
                )}
                {showOdoEnd && !needsOdometer && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number" min={0} step={1} value={odoEndInput} onChange={e => setOdoEndInput(e.target.value)}
                      placeholder="Ex: 43120" className="inp w-32 text-center text-sm"
                    />
                    <span className="text-xs text-slate-500">km fin</span>
                    <button onClick={saveOdoEnd} disabled={savingOdo || !odoEndInput}
                      className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-60">
                      {savingOdo ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />} Confirmer
                    </button>
                  </div>
                )}
                {/* Edit odo_start when already confirmed */}
                {!needsOdometer && odoInput !== String(logEntry?.odometer_start || '') && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number" min={0} step={1} value={odoInput} onChange={e => setOdoInput(e.target.value)}
                      className="inp w-32 text-center text-sm"
                    />
                    <button onClick={saveOdometer} disabled={savingOdo}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-60">
                      {savingOdo ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Mettre à jour
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {notice && <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-800">{notice}</div>}
        {isReadOnly && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800 font-medium">Feuille approuvée — lecture seule.</div>}
        {needsOdometer && !isReadOnly && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 font-medium flex items-center gap-2">
            <AlertTriangle size={15} /> Entrez votre odomètre de début ci-dessus avant de remplir la feuille.
          </div>
        )}

        {/* Totaux rapides */}
        <div className="mb-5 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {[
            { k: 'Rég',   v: `${totals.hrs_regular.toFixed(1)} h`, c: 'text-slate-900' },
            { k: 'Supp',  v: `${totals.hrs_overtime.toFixed(1)} h`,c: 'text-amber-600' },
            { k: 'Maj',   v: `${totals.hrs_premium.toFixed(1)} h`, c: 'text-orange-600' },
            { k: 'Km pers.', v: `${totals.km_personal.toFixed(0)}`,c: 'text-emerald-600' },
            ...(canSeeMoney ? [{ k: 'Brut', v: money(totals.amount), c: 'text-violet-700' }] : []),
          ].map(s => (
            <div key={s.k} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm text-center">
              <div className={`text-lg font-bold ${s.c}`}>{s.v}</div>
              <div className="text-xs text-slate-500">{s.k}</div>
            </div>
          ))}
        </div>

        {/* Entrées — bloquées si gate odomètre non passé */}
        <div className={`space-y-3 ${needsOdometer && !isReadOnly ? 'pointer-events-none opacity-40' : ''}`}>
          {(() => {
            // Regroupement PAR JOUR : un seul en-tête de date par journée, et plusieurs LIGNES (tâches)
            // dessous. Le « + » d'un jour ajoute une ligne au MÊME jour (plus de fausse « nouvelle journée »).
            const sorted = [...entries].sort((a, b) => String(a.date).localeCompare(String(b.date)));
            const groups: { date: string; items: Entry[] }[] = [];
            sorted.forEach(e => { const g = groups.find(x => x.date === e.date); if (g) g.items.push(e); else groups.push({ date: e.date, items: [e] }); });
            const fmtDay = (d: string) => { try { return new Date(d + 'T00:00').toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long' }); } catch { return d; } };
            return groups.map((group) => {
              const dayHrs = dailyHours[group.date] || 0;
              return (
                <div key={group.date} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {/* En-tête du JOUR (une date par journée) */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                    <span className="text-sm font-bold capitalize text-slate-700">{fmtDay(group.date)}</span>
                    <span className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-500">{dayHrs.toFixed(1)} h</span>
                      {!isReadOnly && (
                        <button onClick={() => addEntry(group.date)} title="Ajouter une ligne pour ce jour"
                          className="inline-flex items-center gap-1 rounded-lg border border-violet-200 px-2 py-1 text-xs font-semibold text-violet-600 hover:bg-violet-50">
                          <Plus size={13} /> Ligne
                        </button>
                      )}
                    </span>
                  </div>
                  {group.items.map((e, idx) => {
                    const fps = filteredProjects(projSearch[e.id] || '');
                    return (
              <div key={e.id} className={`p-4 ${idx > 0 ? 'border-t border-dashed border-slate-200' : ''}`}>
                {/* Ligne 1: catégorie + projet (la date est dans l'en-tête du jour) */}
                <div className="mb-3 flex flex-wrap items-start gap-3">
                  <div className="flex flex-wrap gap-1">
                    {/* PROJET (avec sélecteur) OU une TÂCHE du catalogue admin (Tâches récurrentes). */}
                    <button type="button" disabled={isReadOnly} onClick={() => setEntryType(e.id, 'project')} title="Projet"
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${e.category === 'project' ? 'bg-violet-600 text-white' : 'border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                      <Briefcase size={12} /> <span className="hidden sm:inline">Projet</span>
                    </button>
                    {recurringTasks.map(t => (
                      <button key={t.id} type="button" disabled={isReadOnly} onClick={() => setEntryType(e.id, t)} title={t.name}
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${e.category === 'task' && e.recurring_task_id === t.id ? 'bg-violet-600 text-white' : 'border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                        <Timer size={12} /> <span>{t.name}</span>
                      </button>
                    ))}
                    {recurringTasks.length === 0 && (
                      <Link href={`/${tenant}/admin`} className="inline-flex items-center gap-1 rounded-lg border border-dashed border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-50" title="Créer des tâches dans Admin → Employés & Accès → Tâches récurrentes">
                        + Tâches (admin)
                      </Link>
                    )}
                  </div>
                  {e.category === 'project' && (
                    <div ref={el => { projRefs.current[e.id] = el; }} className="relative min-w-[200px] flex-1">
                      <div className="relative">
                        <Search size={13} className="pointer-events-none absolute left-2.5 top-2.5 text-slate-400" />
                        <input value={projSearch[e.id] || ''} disabled={isReadOnly}
                          onChange={ev => { setProjSearch(s => ({ ...s, [e.id]: ev.target.value })); setProjOpen(o => ({ ...o, [e.id]: true })); }}
                          onFocus={() => setProjOpen(o => ({ ...o, [e.id]: true }))}
                          className="inp w-full pl-7" placeholder="Rechercher projet, client…" />
                      </div>
                      {projOpen[e.id] && fps.length > 0 && (
                        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                          {fps.map(p => (
                            <button key={p.id} type="button" onMouseDown={() => pickProject(e.id, p)}
                              className="flex w-full items-start gap-2 px-3 py-2.5 text-left hover:bg-slate-50">
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono font-semibold text-slate-600 shrink-0">{p.project_number}</span>
                              <div className="min-w-0">
                                <div className="truncate text-sm font-medium text-slate-800">{p.title || '—'}</div>
                                {p.client_name && <div className="truncate text-xs text-slate-400">{p.client_name}</div>}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mb-3">
                  <input value={e.description} disabled={isReadOnly}
                    onChange={ev => updEntry(e.id, 'description', ev.target.value)}
                    className="inp w-full" placeholder="Description du travail effectué…" />
                </div>

                {/* Ligne 2: heures + km + véhicule + matériel */}
                <div className="flex flex-wrap items-end gap-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/40">
                    <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">⏱ Heures travaillées (h)</div>
                    <div className="flex items-end gap-2">
                      {[
                        { label: 'Régulier', k: 'hrs_regular' as keyof Entry },
                        { label: 'Supp.', k: 'hrs_overtime' as keyof Entry },
                        { label: 'Majoré', k: 'hrs_premium' as keyof Entry },
                      ].map(({ label, k }) => (
                        <label key={k} className="flex flex-col items-center">
                          <span className="mb-1 text-[11px] font-semibold text-slate-500">{label}</span>
                          <NumCell value={e[k] as number} disabled={isReadOnly} step="0.5" onCommit={n => updEntry(e.id, k, n)} />
                        </label>
                      ))}
                    </div>
                  </div>
                  <label className="flex flex-col items-center">
                    <span className="mb-1 text-[11px] font-semibold text-slate-500">Km</span>
                    <NumCell value={e.km} disabled={isReadOnly} step="1" onCommit={n => updEntry(e.id, 'km', n)} />
                  </label>
                  <label className="flex flex-col">
                    <span className="mb-1 text-xs text-slate-400">Véhicule</span>
                    <div className="flex items-center gap-1">
                      <select value={e.vehicle_id} disabled={isReadOnly} onChange={ev => updVehicle(e.id, ev.target.value)} className="inp w-36">
                        <option value="">— Aucun —</option>
                        {vehicles.filter(v => v.type === 'company').length > 0 && (
                          <optgroup label="Entreprise">
                            {vehicles.filter(v => v.type === 'company').map(v => <option key={v.id} value={v.id}>{v.name || `${v.make} ${v.model}`}</option>)}
                          </optgroup>
                        )}
                        {vehicles.filter(v => v.type === 'personal').length > 0 && (
                          <optgroup label="Personnel autorisé">
                            {vehicles.filter(v => v.type === 'personal').map(v => <option key={v.id} value={v.id}>{v.name || `${v.make} ${v.model}`}</option>)}
                          </optgroup>
                        )}
                      </select>
                      {e.vehicle_type === 'company'  && <Building2 size={13} className="text-blue-500" />}
                      {e.vehicle_type === 'personal' && <Car        size={13} className="text-emerald-600" />}
                    </div>
                  </label>
                  {/* « Matériel » remplacé par la section Dépenses (avec reçu) ci-dessous. */}
                  <div className="ml-auto flex items-end gap-2">
                    {canSeeMoney && <span className="text-base font-bold text-slate-700">{money(entryCost(e))}</span>}
                    {!isReadOnly && (
                      <button onClick={() => addEntry(e.date)} title="Ajouter une ligne pour ce jour"
                        className="rounded-lg p-1.5 text-slate-400 hover:text-blue-600"><Plus size={15} /></button>
                    )}
                    {!isReadOnly && (
                      <button onClick={() => removeEntry(e)} title={group.items.length <= 1 ? 'Vider cette journée' : 'Supprimer cette ligne'}
                        className="rounded-lg p-1.5 text-slate-300 hover:text-red-500"><Trash2 size={15} /></button>
                    )}
                  </div>
                </div>

                {/* Avantages (si configurés) */}
                {allowances.length > 0 && (
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <Gift size={12} /> Avantages
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {allowances.map(a => {
                        const checked = e.allowances.some(x => x.id === a.id);
                        // Avertissement #49 : subsistance cochée sur un projet où le per diem n'est PAS applicable (interne).
                        const naWarn = checked && isSubsistenceAllowance(a.name) && !!e.project_number && perDiemNA.has(e.project_number);
                        return (
                          <label key={a.id} title={naWarn ? 'Frais de subsistance NON applicables sur ce projet (interne) — selon la règle du tenant.' : undefined}
                            className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition select-none ${naWarn ? 'border-amber-400 bg-amber-50 text-amber-800' : checked ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-500 hover:border-slate-300'} ${isReadOnly ? 'pointer-events-none' : ''}`}>
                            <input type="checkbox" checked={checked} disabled={isReadOnly}
                              onChange={ev => toggleAllowance(e.id, a, ev.target.checked)}
                              className="accent-emerald-600" />
                            {a.name}
                            {canSeeMoney && <span className="font-bold">{money(a.amount)}</span>}
                            {naWarn && <AlertTriangle size={11} className="text-amber-600" />}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Indication primes du jour (une seule fois par journée) */}
                {idx === 0 && hourBonuses.length > 0 && dayHrs > 0 && (
                  <div className="mt-2 text-xs text-slate-400">
                    {dayHrs.toFixed(1)}h ce jour
                    {hourBonuses.filter(b => dayHrs >= b.trigger_hours).map(b => (
                      <span key={b.id} className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-amber-700 font-semibold">
                        <Timer size={10} className="inline mr-0.5" />{b.name}{canSeeMoney ? ` +${money(b.bonus_amount)}` : ''}
                      </span>
                    ))}
                  </div>
                )}

                {/* Dépenses du jour (avec reçu) — sur la ligne de la journée */}
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500"><Receipt size={12} /> Dépenses de cette ligne{e.category === 'project' && e.project_number ? ` · ${e.project_number}` : e.category === 'task' && e.recurring_task_name ? ` · ${e.recurring_task_name}` : ''}</span>
                    {!isReadOnly && <button type="button" onClick={() => addExpense(e)} className="text-xs font-semibold text-violet-600 hover:underline">+ Dépense</button>}
                  </div>
                  {expenses.filter(x => x.entry_id ? x.entry_id === e.id : x.date === e.date).map(x => (
                    <div key={x.id} className="mb-1.5 flex flex-wrap items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2">
                      <select value={x.category} disabled={isReadOnly} onChange={ev => updExpense(x.id, { category: ev.target.value })} className="inp w-32 text-xs">
                        {EXPENSE_CATS.map(c => <option key={c.k} value={c.k}>{c.label}</option>)}
                      </select>
                      <input value={x.supplier} disabled={isReadOnly} onChange={ev => updExpense(x.id, { supplier: ev.target.value })} placeholder="Fournisseur" className="inp flex-1 min-w-[8rem] text-xs" />
                      <input type="number" step="0.01" value={x.subtotal || ''} disabled={isReadOnly} onFocus={ev => ev.target.select()} onChange={ev => updExpense(x.id, { subtotal: +ev.target.value })} placeholder="Sous-total $" className="inp w-28 text-right text-xs" />
                      <span className="text-[11px] text-slate-500" title="TPS + TVQ">+tx {money((x.gst || 0) + (x.qst || 0))}</span>
                      <span className="text-xs font-bold text-slate-700">{money(x.total)}</span>
                      <label className="flex items-center gap-1 text-[11px] text-slate-500"><input type="checkbox" checked={x.reimbursable} disabled={isReadOnly} onChange={ev => updExpense(x.id, { reimbursable: ev.target.checked })} className="accent-violet-600" />rembours.</label>
                      {x.receipt_url ? (
                        <a href={x.receipt_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700"><Paperclip size={11} /> Reçu ✓</a>
                      ) : !isReadOnly && (
                        <label className="inline-flex cursor-pointer items-center gap-1 rounded border border-violet-300 bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700">
                          {uploadingId === x.id ? <Loader2 size={11} className="animate-spin" /> : <Paperclip size={11} />} Reçu
                          <input type="file" accept="image/*,.pdf,.xls,.xlsx,.csv" className="hidden" onChange={ev => { const f = ev.target.files?.[0]; if (f) onReceiptUpload(x.id, f); ev.currentTarget.value = ''; }} />
                        </label>
                      )}
                      {!isReadOnly && (
                        <label className="inline-flex cursor-pointer items-center gap-1 rounded border border-violet-300 bg-violet-100 px-2 py-1 text-[11px] font-semibold text-violet-700" title="L’IA lit le reçu et remplit la dépense">
                          {uploadingId === x.id ? <Loader2 size={11} className="animate-spin" /> : '📷'} IA
                          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,.pdf,.xls,.xlsx,.csv" className="hidden" onChange={ev => { const f = ev.target.files?.[0]; if (f) scanExpenseAI(x.id, f); ev.currentTarget.value = ''; }} />
                        </label>
                      )}
                      {!isReadOnly && <button onClick={() => delExpense(x.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={13} /></button>}
                    </div>
                  ))}
                </div>
              </div>
                    );
                  })}
                </div>
              );
            });
          })()}

          {!isReadOnly && !needsOdometer && (
            <button onClick={() => addEntry()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 py-4 text-sm font-semibold text-slate-400 transition hover:border-violet-400 hover:text-violet-600">
              <Plus size={18} /> Ajouter une journée / ligne
            </button>
          )}
        </div>

        {/* Primes journalières déclenchées */}
        {triggeredBonuses.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50">
            <div className="border-b border-amber-200 px-4 py-2.5 flex items-center gap-2">
              <Timer size={15} className="text-amber-600" />
              <span className="text-sm font-bold text-amber-800">Primes horaires déclenchées</span>
            </div>
            {triggeredBonuses.map(({ date, bonuses }) => (
              <div key={date} className="flex flex-wrap items-center gap-3 border-t border-amber-100 px-4 py-2.5 first:border-t-0">
                <span className="text-xs font-medium text-amber-700">{new Date(date + 'T00:00').toLocaleDateString('fr-CA', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                <span className="text-xs text-amber-600">{(dailyHours[date] || 0).toFixed(1)}h travaillées</span>
                {bonuses.map(b => (
                  <span key={b.id} className="rounded-full bg-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-800">{b.name}{canSeeMoney ? ` +${money(b.bonus_amount)}` : ''}</span>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Footer total — $ visibles seulement pour superviseur/admin (paie). L'employé ne voit aucun montant. */}
        {canSeeMoney && (entries.length > 0 || vehicleDeduction > 0 || totalBonuses > 0 || commissions > 0) && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3">
              <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                {totals.km_company > 0 && <span><Building2 size={13} className="mr-1 inline text-blue-500" />{totals.km_company} km ent.</span>}
                {totals.km_personal > 0 && <span><Car size={13} className="mr-1 inline text-emerald-600" />{totals.km_personal} km pers. → {money(totals.km_personal * kmRate)}</span>}
              </div>
              <div className="text-sm font-semibold text-slate-700">Brut main-d'œuvre : {money(totals.amount)}</div>
            </div>
            {(totals.allowances > 0 || totalBonuses > 0 || vehicleDeduction > 0 || commissions > 0) && (
              <div className="flex flex-col gap-1 border-b border-slate-100 px-5 py-3 text-sm">
                {totals.allowances > 0 && (
                  <div className="flex items-center justify-between text-emerald-700">
                    <span className="flex items-center gap-1.5"><Gift size={13} /> Avantages</span>
                    <span className="font-semibold">+{money(totals.allowances)}</span>
                  </div>
                )}
                {totalBonuses > 0 && (
                  <div className="flex items-center justify-between text-amber-700">
                    <span className="flex items-center gap-1.5"><Timer size={13} /> Primes horaires</span>
                    <span className="font-semibold">+{money(totalBonuses)}</span>
                  </div>
                )}
                {commissions > 0 && (
                  <div className="flex flex-col gap-0.5 text-violet-700">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><DollarSign size={13} /> Commissions de vente</span>
                      <span className="font-semibold">+{money(commissions)}</span>
                    </div>
                    {commissionDetails.map((d: any, i: number) => (
                      <div key={i} className="flex items-center justify-between pl-5 text-[11px] text-violet-500">
                        <span>#{d.project_number}{d.title ? ` — ${d.title}` : ''}</span>
                        <span>+{money(Number(d.amount) || 0)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {vehicleDeduction > 0 && (
                  <div className="flex items-center justify-between text-red-600">
                    <span className="flex items-center gap-1.5"><Car size={13} /> Déduction véhicule ({Number(logEntry?.km_personal || 0).toFixed(0)} km pers. × {vehicleRate.toFixed(2)} $/km · {assignedVehicle?.is_sales_employee ? 'vendeur ' : ''}ARC 2026)</span>
                    <span className="font-semibold">-{money(vehicleDeduction)}</span>
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-sm font-semibold text-slate-700">Net à payer</span>
              <div className="text-xl font-bold text-violet-700">{money(netTotal)}</div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .inp { border-radius: 0.5rem; border: 1px solid rgb(226 232 240); background: transparent; padding: 0.4rem 0.6rem; font-size: 0.8rem; outline: none; }
        .inp:focus { border-color: rgb(124 58 237); box-shadow: 0 0 0 2px rgb(124 58 237 / 0.15); }
        .inp:disabled { background: rgb(248 250 252); color: rgb(100 116 139); }
      `}</style>
    </div>
  );
}
