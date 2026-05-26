'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
  Plus, ChevronDown, List, LayoutGrid, Search, Download,
  Trash2, Archive, RotateCcw, X, Camera, Image, Link2,
  User, MapPin, CheckSquare, Square, CalendarDays, Paperclip, Loader2,
  ListChecks,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSite } from '@/contexts/SiteContext';

// ─── Types ────────────────────────────────────────────────────────────────────
type TStatus = 'todo' | 'in_progress' | 'blocked' | 'done' | 'archived';
type TPriority = 'urgent' | 'high' | 'normal' | 'low';

interface Step {
  id: string;
  task_id: string;
  tenant_id: string;
  label: string;
  done: boolean;
  assignee: string;
  order_index: number;
}

interface Task {
  id: string;
  tenant_id: string;
  title: string;
  description: string;
  status: TStatus;
  priority: TPriority;
  assignee: string;
  site: string;
  due_date: string | null;
  photo_urls: string[];
  steps_total: number;
  steps_done: number;
  created_at: string;
  updated_at: string;
}

// ─── Status / Priority config ─────────────────────────────────────────────────
const S: Record<TStatus, { labelFr: string; labelEn: string; pill: string; dot: string; border: string }> = {
  todo:        { labelFr: 'À faire',    labelEn: 'To do',       pill: 'bg-gray-100 text-gray-700',    dot: 'bg-gray-400',   border: 'border-gray-300' },
  in_progress: { labelFr: 'En cours',   labelEn: 'In progress', pill: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-500',   border: 'border-blue-400' },
  blocked:     { labelFr: 'Bloqué',     labelEn: 'Blocked',     pill: 'bg-red-100 text-red-700',      dot: 'bg-red-500',    border: 'border-red-400' },
  done:        { labelFr: 'Terminé',    labelEn: 'Done',        pill: 'bg-green-100 text-green-700',  dot: 'bg-green-500',  border: 'border-green-400' },
  archived:    { labelFr: 'Archivé',    labelEn: 'Archived',    pill: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500', border: 'border-yellow-400' },
};

const STATUS_CYCLE: TStatus[] = ['todo', 'in_progress', 'blocked', 'done'];

const P: Record<TPriority, { labelFr: string; labelEn: string; sym: string; color: string }> = {
  urgent: { labelFr: 'Urgent',  labelEn: 'Urgent', sym: '↑↑', color: 'text-red-600' },
  high:   { labelFr: 'Élevée',  labelEn: 'High',   sym: '↑',  color: 'text-orange-500' },
  normal: { labelFr: 'Normale', labelEn: 'Normal', sym: '—',  color: 'text-blue-500' },
  low:    { labelFr: 'Basse',   labelEn: 'Low',    sym: '↓',  color: 'text-gray-400' },
};

// ─── Templates ───────────────────────────────────────────────────────────────
const TEMPLATES = [
  {
    key: 'corrective',
    labelFr: 'Mesure corrective',     labelEn: 'Corrective measure',
    priority: 'high' as TPriority,   status: 'todo' as TStatus,
    steps: [
      { labelFr: 'Identifier la cause racine',             labelEn: 'Identify root cause' },
      { labelFr: 'Documenter le problème',                 labelEn: 'Document the problem' },
      { labelFr: 'Mettre en place la correction immédiate', labelEn: 'Implement immediate correction' },
      { labelFr: "Vérifier l'efficacité de la mesure",    labelEn: 'Verify measure effectiveness' },
      { labelFr: 'Clôturer et archiver',                   labelEn: 'Close and archive' },
    ],
  },
  {
    key: 'safety',
    labelFr: 'Inspection sécurité',   labelEn: 'Safety inspection',
    priority: 'normal' as TPriority, status: 'todo' as TStatus,
    steps: [
      { labelFr: 'Préparer la liste de vérification', labelEn: 'Prepare checklist' },
      { labelFr: 'Inspecter les équipements EPI',     labelEn: 'Inspect PPE equipment' },
      { labelFr: "Vérifier les dégagements d'urgence", labelEn: 'Check emergency exits' },
      { labelFr: 'Contrôler les fiches de données (FDS)', labelEn: 'Review SDS sheets' },
      { labelFr: "Rédiger le rapport d'inspection",   labelEn: 'Write inspection report' },
    ],
  },
  {
    key: 'preventive',
    labelFr: 'Action préventive',     labelEn: 'Preventive action',
    priority: 'normal' as TPriority, status: 'todo' as TStatus,
    steps: [
      { labelFr: 'Évaluer le risque potentiel',        labelEn: 'Assess potential risk' },
      { labelFr: 'Définir les mesures préventives',    labelEn: 'Define preventive measures' },
      { labelFr: 'Assigner les responsabilités',       labelEn: 'Assign responsibilities' },
      { labelFr: 'Suivre la mise en œuvre',            labelEn: 'Track implementation' },
    ],
  },
  {
    key: 'equipment',
    labelFr: 'Suivi équipement',      labelEn: 'Equipment follow-up',
    priority: 'normal' as TPriority, status: 'todo' as TStatus,
    steps: [
      { labelFr: "Vérifier l'état de l'équipement",   labelEn: 'Check equipment condition' },
      { labelFr: 'Effectuer la maintenance requise',   labelEn: 'Perform required maintenance' },
      { labelFr: 'Documenter les travaux effectués',   labelEn: 'Document work done' },
      { labelFr: 'Mettre à jour la fiche équipement',  labelEn: 'Update equipment sheet' },
      { labelFr: 'Planifier la prochaine inspection',  labelEn: 'Schedule next inspection' },
    ],
  },
  {
    key: 'urgent',
    labelFr: 'Tâche urgente',         labelEn: 'Urgent task',
    priority: 'urgent' as TPriority, status: 'in_progress' as TStatus,
    steps: [],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isOverdue(due: string | null) {
  if (!due) return false;
  return new Date(due) < new Date(new Date().toDateString());
}

function fmtDate(d: string | null, lang: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}

function initials(name: string) {
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

// ─── TaskCard ─────────────────────────────────────────────────────────────────
function TaskCard({ task, selected, onClick, onStatusCycle, lang }: {
  task: Task; selected: boolean; onClick: () => void;
  onStatusCycle: (e: React.MouseEvent) => void; lang: string;
}) {
  const overdue = isOverdue(task.due_date) && task.status !== 'done' && task.status !== 'archived';
  const sc = S[task.status];
  const pc = P[task.priority];

  return (
    <div
      onClick={onClick}
      className={`group relative cursor-pointer rounded-xl border bg-white dark:bg-gray-800 p-3.5 shadow-sm transition-all hover:shadow-md
        ${selected ? 'ring-2 ring-indigo-500 border-indigo-300' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-200'}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className={`text-xs font-bold ${pc.color} shrink-0`}>{pc.sym}</span>
          <p className={`text-sm font-semibold leading-tight truncate text-gray-900 dark:text-gray-100 ${task.status === 'done' ? 'line-through opacity-60' : ''}`}>
            {task.title || (lang === 'fr' ? '(sans titre)' : '(untitled)')}
          </p>
        </div>
        <button onClick={onStatusCycle} title={lang === 'fr' ? 'Changer le statut' : 'Change status'} className="shrink-0">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${sc.dot} ring-2 ring-white dark:ring-gray-800`} />
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-2">
        {task.site && (
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <MapPin size={11} />{task.site}
          </span>
        )}
        {task.assignee && (
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-[9px] font-bold">{initials(task.assignee)}</span>
            {task.assignee}
          </span>
        )}
      </div>

      {task.steps_total > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-0.5">
            <span className="flex items-center gap-1"><CheckSquare size={11} />{task.steps_done}/{task.steps_total}</span>
            <span>{Math.round((task.steps_done / task.steps_total) * 100)}%</span>
          </div>
          <div className="h-1 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
            <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${(task.steps_done / task.steps_total) * 100}%` }} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${sc.pill}`}>
          {lang === 'fr' ? sc.labelFr : sc.labelEn}
        </span>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {task.photo_urls.length > 0 && (
            <span className="flex items-center gap-0.5"><Image size={11} />{task.photo_urls.length}</span>
          )}
          {task.due_date && (
            <span className={`flex items-center gap-0.5 ${overdue ? 'text-red-500 font-semibold' : ''}`}>
              <CalendarDays size={11} />{fmtDate(task.due_date, lang)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function TodoPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || '';
  const searchParams = useSearchParams();
  const { lang } = useLanguage();
  const { siteId } = useSite();

  const tr = (fr: string, en: string) => lang === 'fr' ? fr : en;

  const [tasks, setTasks]               = useState<Task[]>([]);
  const [loading, setLoading]           = useState(true);
  const [view, setView]                 = useState<'list' | 'kanban'>('list');
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState<TStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TPriority | 'all'>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedId, setSelectedId]     = useState<string | null>(null);
  const [panelOpen, setPanelOpen]       = useState(false);
  const [tmplOpen, setTmplOpen]         = useState(false);
  const [saving, setSaving]             = useState(false);

  const [panel, setPanel]               = useState<Task | null>(null);
  const [steps, setSteps]               = useState<Step[]>([]);
  const [newStep, setNewStep]           = useState('');
  const [uploading, setUploading]       = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load tasks ──────────────────────────────────────────────────────────────
  const loadTasks = useCallback(async () => {
    if (!tenant) return;
    const { data } = await supabase
      .from('todo_tasks')
      .select('*')
      .eq('tenant_id', tenant)
      .order('updated_at', { ascending: false });
    setTasks((data as Task[]) || []);
    setLoading(false);
  }, [tenant]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  // Restore task from URL param
  useEffect(() => {
    const tid = searchParams?.get('task');
    if (tid && tasks.length > 0) {
      const found = tasks.find(t => t.id === tid);
      if (found) openPanel(found);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, tasks.length]);

  // ── Panel ───────────────────────────────────────────────────────────────────
  const openPanel = useCallback(async (task: Task) => {
    setSelectedId(task.id);
    setPanel({ ...task });
    setPanelOpen(true);
    setDeleteConfirm(false);
    const { data } = await supabase
      .from('todo_steps')
      .select('*')
      .eq('task_id', task.id)
      .order('order_index');
    setSteps((data as Step[]) || []);
  }, []);

  const closePanel = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setPanelOpen(false);
    setSelectedId(null);
    setPanel(null);
    setSteps([]);
    setNewStep('');
    setDeleteConfirm(false);
  }, []);

  // ── Auto-save ───────────────────────────────────────────────────────────────
  const scheduleAutoSave = useCallback((updated: Task) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      await supabase.from('todo_tasks').update({
        title: updated.title, description: updated.description,
        status: updated.status, priority: updated.priority,
        assignee: updated.assignee, site: updated.site,
        due_date: updated.due_date || null,
        updated_at: new Date().toISOString(),
      }).eq('id', updated.id);
      setTasks(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated } : t));
      setSaving(false);
    }, 700);
  }, []);

  const updatePanel = useCallback((patch: Partial<Task>) => {
    setPanel(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...patch };
      scheduleAutoSave(updated);
      return updated;
    });
  }, [scheduleAutoSave]);

  // ── Create task ─────────────────────────────────────────────────────────────
  const createTask = useCallback(async (template?: typeof TEMPLATES[0]) => {
    if (!tenant) return;
    const now = new Date().toISOString();
    const { data, error } = await supabase.from('todo_tasks').insert({
      tenant_id: tenant,
      title: template ? (lang === 'fr' ? template.labelFr : template.labelEn) : '',
      description: '',
      status: template?.status || 'todo',
      priority: template?.priority || 'normal',
      assignee: '',
      site: siteId !== 'all' ? siteId : '',
      due_date: null,
      photo_urls: [],
      steps_total: template?.steps.length || 0,
      steps_done: 0,
      created_at: now, updated_at: now,
    }).select().single();
    if (error || !data) return;
    const newTask = data as Task;
    if (template && template.steps.length > 0) {
      await supabase.from('todo_steps').insert(
        template.steps.map((s, i) => ({
          task_id: newTask.id, tenant_id: tenant,
          label: lang === 'fr' ? s.labelFr : s.labelEn,
          done: false, assignee: '', order_index: i,
        }))
      );
    }
    setTasks(prev => [newTask, ...prev]);
    setTmplOpen(false);
    openPanel(newTask);
  }, [tenant, lang, siteId, openPanel]);

  // ── Steps CRUD ──────────────────────────────────────────────────────────────
  const addStep = useCallback(async () => {
    if (!newStep.trim() || !panel) return;
    const { data } = await supabase.from('todo_steps').insert({
      task_id: panel.id, tenant_id: tenant,
      label: newStep.trim(), done: false, assignee: '', order_index: steps.length,
    }).select().single();
    if (!data) return;
    setSteps(prev => [...prev, data as Step]);
    setNewStep('');
    const newTotal = steps.length + 1;
    await supabase.from('todo_tasks').update({ steps_total: newTotal, updated_at: new Date().toISOString() }).eq('id', panel.id);
    setTasks(prev => prev.map(t => t.id === panel.id ? { ...t, steps_total: newTotal } : t));
  }, [newStep, panel, steps.length, tenant]);

  const toggleStep = useCallback(async (step: Step) => {
    const nowDone = !step.done;
    await supabase.from('todo_steps').update({ done: nowDone }).eq('id', step.id);
    const updated = steps.map(s => s.id === step.id ? { ...s, done: nowDone } : s);
    setSteps(updated);
    const doneCnt = updated.filter(s => s.done).length;
    await supabase.from('todo_tasks').update({ steps_done: doneCnt, updated_at: new Date().toISOString() }).eq('id', panel!.id);
    setTasks(prev => prev.map(t => t.id === panel!.id ? { ...t, steps_done: doneCnt } : t));
  }, [steps, panel]);

  const deleteStep = useCallback(async (stepId: string) => {
    await supabase.from('todo_steps').delete().eq('id', stepId);
    const remaining = steps.filter(s => s.id !== stepId);
    setSteps(remaining);
    const doneCnt = remaining.filter(s => s.done).length;
    await supabase.from('todo_tasks').update({ steps_total: remaining.length, steps_done: doneCnt, updated_at: new Date().toISOString() }).eq('id', panel!.id);
    setTasks(prev => prev.map(t => t.id === panel!.id ? { ...t, steps_total: remaining.length, steps_done: doneCnt } : t));
  }, [steps, panel]);

  // ── Photo upload ─────────────────────────────────────────────────────────────
  const uploadPhoto = useCallback(async (file: File) => {
    if (!panel) return;
    setUploading(true);
    const path = `${tenant}/${panel.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { error } = await supabase.storage.from('todo-attachments').upload(path, file, { upsert: false });
    if (!error) {
      const { data: urlData } = supabase.storage.from('todo-attachments').getPublicUrl(path);
      const newUrls = [...(panel.photo_urls || []), urlData.publicUrl];
      await supabase.from('todo_tasks').update({ photo_urls: newUrls, updated_at: new Date().toISOString() }).eq('id', panel.id);
      setPanel(prev => prev ? { ...prev, photo_urls: newUrls } : prev);
      setTasks(prev => prev.map(t => t.id === panel.id ? { ...t, photo_urls: newUrls } : t));
    }
    setUploading(false);
  }, [panel, tenant]);

  const removePhoto = useCallback(async (url: string) => {
    if (!panel) return;
    const newUrls = panel.photo_urls.filter(u => u !== url);
    await supabase.from('todo_tasks').update({ photo_urls: newUrls, updated_at: new Date().toISOString() }).eq('id', panel.id);
    setPanel(prev => prev ? { ...prev, photo_urls: newUrls } : prev);
    setTasks(prev => prev.map(t => t.id === panel.id ? { ...t, photo_urls: newUrls } : t));
  }, [panel]);

  // ── Status cycle ─────────────────────────────────────────────────────────────
  const cycleStatus = useCallback(async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.status === 'archived') return;
    const idx = STATUS_CYCLE.indexOf(task.status);
    const next: TStatus = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    await supabase.from('todo_tasks').update({ status: next, updated_at: new Date().toISOString() }).eq('id', task.id);
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: next } : t));
    if (panel?.id === task.id) setPanel(prev => prev ? { ...prev, status: next } : prev);
  }, [panel]);

  // ── Archive / delete ─────────────────────────────────────────────────────────
  const archiveTask = useCallback(async () => {
    if (!panel) return;
    const newStatus: TStatus = panel.status === 'archived' ? 'todo' : 'archived';
    await supabase.from('todo_tasks').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', panel.id);
    setTasks(prev => prev.map(t => t.id === panel.id ? { ...t, status: newStatus } : t));
    setPanel(prev => prev ? { ...prev, status: newStatus } : prev);
  }, [panel]);

  const deleteTask = useCallback(async () => {
    if (!panel) return;
    await supabase.from('todo_tasks').delete().eq('id', panel.id);
    setTasks(prev => prev.filter(t => t.id !== panel.id));
    closePanel();
  }, [panel, closePanel]);

  // ── Shareable link ───────────────────────────────────────────────────────────
  const copyLink = useCallback(() => {
    if (!panel) return;
    navigator.clipboard.writeText(`${window.location.origin}/${tenant}/todo?task=${panel.id}`).catch(() => {});
  }, [panel, tenant]);

  // ── Export CSV ───────────────────────────────────────────────────────────────
  const exportCSV = useCallback(() => {
    const rows = tasks.filter(t => t.status !== 'archived');
    const header = lang === 'fr'
      ? ['ID', 'Titre', 'Statut', 'Priorité', 'Responsable', 'Site', 'Échéance', 'Étapes total', 'Étapes faites', 'Créé le', 'Modifié le']
      : ['ID', 'Title', 'Status', 'Priority', 'Assignee', 'Site', 'Due date', 'Steps total', 'Steps done', 'Created at', 'Updated at'];
    const csvRows = [
      header.join(','),
      ...rows.map(t => [
        t.id, `"${t.title.replace(/"/g, '""')}"`,
        lang === 'fr' ? S[t.status].labelFr : S[t.status].labelEn,
        lang === 'fr' ? P[t.priority].labelFr : P[t.priority].labelEn,
        t.assignee, t.site, t.due_date || '',
        t.steps_total, t.steps_done, t.created_at, t.updated_at,
      ].join(','))
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `todo-${tenant}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }, [tasks, lang, tenant]);

  // ── Filtered tasks ───────────────────────────────────────────────────────────
  const filtered = tasks.filter(t => {
    if (!showArchived && t.status === 'archived') return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    const q = search.toLowerCase();
    if (q && !t.title.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q) && !t.assignee.toLowerCase().includes(q)) return false;
    return true;
  });

  const active = tasks.filter(t => t.status !== 'archived');
  const stats = {
    total:       active.length,
    todo:        active.filter(t => t.status === 'todo').length,
    in_progress: active.filter(t => t.status === 'in_progress').length,
    blocked:     active.filter(t => t.status === 'blocked').length,
    done:        active.filter(t => t.status === 'done').length,
    overdue:     active.filter(t => isOverdue(t.due_date) && t.status !== 'done').length,
  };

  const KANBAN_COLS: { status: TStatus; label: string }[] = [
    { status: 'todo',        label: tr('À faire', 'To do') },
    { status: 'in_progress', label: tr('En cours', 'In progress') },
    { status: 'blocked',     label: tr('Bloqué', 'Blocked') },
    { status: 'done',        label: tr('Terminé', 'Done') },
  ];
  if (showArchived) KANBAN_COLS.push({ status: 'archived', label: tr('Archivé', 'Archived') });

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-4.5rem)] overflow-hidden bg-gray-50 dark:bg-gray-900">

      {/* Main content */}
      <div className={`flex flex-col flex-1 min-w-0 overflow-hidden ${panelOpen ? 'hidden lg:flex' : 'flex'}`}>

        {/* Top bar */}
        <div className="flex-none bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 mr-2">
              <ListChecks size={20} className="text-indigo-600" />
              <h1 className="text-base font-bold text-gray-900 dark:text-gray-100">{tr('Tâches', 'Tasks')}</h1>
            </div>

            <div className="relative flex-1 min-w-[160px] max-w-xs">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder={tr('Rechercher…', 'Search…')}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 pl-8 pr-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </div>

            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as TStatus | 'all')}
              className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-2.5 py-1.5 text-sm text-gray-700 dark:text-gray-200 outline-none">
              <option value="all">{tr('Tous les statuts', 'All statuses')}</option>
              {(Object.keys(S) as TStatus[]).map(s => (
                <option key={s} value={s}>{lang === 'fr' ? S[s].labelFr : S[s].labelEn}</option>
              ))}
            </select>

            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value as TPriority | 'all')}
              className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-2.5 py-1.5 text-sm text-gray-700 dark:text-gray-200 outline-none">
              <option value="all">{tr('Toutes les priorités', 'All priorities')}</option>
              {(Object.keys(P) as TPriority[]).map(p => (
                <option key={p} value={p}>{lang === 'fr' ? P[p].labelFr : P[p].labelEn}</option>
              ))}
            </select>

            <button onClick={() => setShowArchived(v => !v)}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm font-medium transition
                ${showArchived ? 'border-yellow-400 bg-yellow-50 text-yellow-700' : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
              <Archive size={14} />{tr('Archivées', 'Archived')}
            </button>

            <div className="flex-1" />

            <div className="flex overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600">
              <button onClick={() => setView('list')} className={`px-2.5 py-1.5 ${view === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}><List size={15} /></button>
              <button onClick={() => setView('kanban')} className={`px-2.5 py-1.5 ${view === 'kanban' ? 'bg-indigo-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}><LayoutGrid size={15} /></button>
            </div>

            <button onClick={exportCSV}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-2.5 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
              <Download size={14} /> CSV
            </button>

            {/* New task split button */}
            <div className="relative flex overflow-hidden rounded-lg">
              <button onClick={() => createTask()}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-sm font-semibold">
                <Plus size={15} />{tr('Nouvelle tâche', 'New task')}
              </button>
              <button onClick={() => setTmplOpen(v => !v)}
                className="bg-indigo-700 hover:bg-indigo-800 text-white px-2 py-1.5 border-l border-indigo-500">
                <ChevronDown size={14} />
              </button>
              {tmplOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setTmplOpen(false)} />
                  <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl overflow-hidden">
                    <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-700">
                      {tr('Modèles', 'Templates')}
                    </div>
                    {TEMPLATES.map(t => (
                      <button key={t.key} onClick={() => createTask(t)}
                        className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <span className={`text-xs font-bold ${P[t.priority].color}`}>{P[t.priority].sym}</span>
                        {lang === 'fr' ? t.labelFr : t.labelEn}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex-none bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 overflow-x-auto">
          <div className="flex items-center gap-4 text-xs min-w-max">
            {[
              { label: tr('Total', 'Total'),          val: stats.total,       color: 'text-gray-700 dark:text-gray-300' },
              { label: tr('À faire', 'To do'),         val: stats.todo,        color: 'text-gray-500' },
              { label: tr('En cours', 'In progress'), val: stats.in_progress, color: 'text-blue-600' },
              { label: tr('Bloqué', 'Blocked'),        val: stats.blocked,     color: 'text-red-500' },
              { label: tr('Terminé', 'Done'),          val: stats.done,        color: 'text-green-600' },
              { label: tr('En retard', 'Overdue'),     val: stats.overdue,     color: 'text-red-600 font-bold' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-1">
                <span className="text-gray-400">{s.label}</span>
                <span className={`font-semibold ${s.color}`}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-400">
              <Loader2 size={24} className="animate-spin mr-2" />{tr('Chargement…', 'Loading…')}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-3">
              <ListChecks size={36} className="opacity-30" />
              <p className="text-sm">{tr('Aucune tâche', 'No tasks')}</p>
              <button onClick={() => createTask()} className="text-indigo-600 text-sm font-semibold hover:underline">
                {tr('+ Créer une tâche', '+ Create a task')}
              </button>
            </div>
          ) : view === 'list' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map(t => (
                <TaskCard key={t.id} task={t} selected={selectedId === t.id} lang={lang}
                  onClick={() => openPanel(t)} onStatusCycle={e => cycleStatus(t, e)} />
              ))}
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {KANBAN_COLS.map(col => {
                const colTasks = filtered.filter(t => t.status === col.status);
                return (
                  <div key={col.status} className={`flex-none w-72 rounded-xl border-t-4 ${S[col.status].border} bg-gray-100 dark:bg-gray-800/50`}>
                    <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{col.label}</span>
                      <span className="text-xs font-bold text-gray-400 bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5">{colTasks.length}</span>
                    </div>
                    <div className="p-2 space-y-2 max-h-[calc(100vh-18rem)] overflow-y-auto">
                      {colTasks.map(t => (
                        <TaskCard key={t.id} task={t} selected={selectedId === t.id} lang={lang}
                          onClick={() => openPanel(t)} onStatusCycle={e => cycleStatus(t, e)} />
                      ))}
                      {colTasks.length === 0 && (
                        <p className="text-center text-xs text-gray-400 py-6">{tr('Aucune tâche', 'No tasks')}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {panelOpen && panel && (
        <div className="flex flex-col w-full lg:w-[440px] flex-none border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">

          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-none">
            <div className="flex items-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin text-indigo-400" />}
              <button onClick={archiveTask}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition
                  ${panel.status === 'archived'
                    ? 'border-yellow-400 bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                    : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                {panel.status === 'archived' ? <RotateCcw size={13} /> : <Archive size={13} />}
                {panel.status === 'archived' ? tr('Restaurer', 'Restore') : tr('Archiver', 'Archive')}
              </button>
              <button onClick={copyLink} title={tr('Copier le lien', 'Copy link')}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Link2 size={15} />
              </button>
            </div>
            <div className="flex items-center gap-1">
              {!deleteConfirm ? (
                <button onClick={() => setDeleteConfirm(true)}
                  className="rounded-lg p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <Trash2 size={15} />
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-red-600 font-medium">{tr('Supprimer?', 'Delete?')}</span>
                  <button onClick={deleteTask} className="rounded px-2 py-1 text-xs bg-red-600 text-white font-semibold hover:bg-red-700">{tr('Oui', 'Yes')}</button>
                  <button onClick={() => setDeleteConfirm(false)} className="rounded px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold">{tr('Non', 'No')}</button>
                </div>
              )}
              <button onClick={closePanel} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Panel body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">

            <input value={panel.title} onChange={e => updatePanel({ title: e.target.value })}
              placeholder={tr('Titre de la tâche', 'Task title')}
              className="w-full text-base font-bold bg-transparent text-gray-900 dark:text-gray-100 border-0 border-b border-gray-200 dark:border-gray-600 pb-1 outline-none focus:border-indigo-400" />

            <div className="flex flex-wrap gap-2">
              <select value={panel.status} onChange={e => updatePanel({ status: e.target.value as TStatus })}
                className="flex-1 min-w-[120px] rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-2.5 py-1.5 text-sm text-gray-700 dark:text-gray-200 outline-none">
                {(Object.keys(S) as TStatus[]).map(s => (
                  <option key={s} value={s}>{lang === 'fr' ? S[s].labelFr : S[s].labelEn}</option>
                ))}
              </select>
              <select value={panel.priority} onChange={e => updatePanel({ priority: e.target.value as TPriority })}
                className="flex-1 min-w-[120px] rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-2.5 py-1.5 text-sm text-gray-700 dark:text-gray-200 outline-none">
                {(Object.keys(P) as TPriority[]).map(p => (
                  <option key={p} value={p}>{P[p].sym} {lang === 'fr' ? P[p].labelFr : P[p].labelEn}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex-1 min-w-[140px] relative">
                <User size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={panel.assignee} onChange={e => updatePanel({ assignee: e.target.value })}
                  placeholder={tr('Responsable', 'Assignee')}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 pl-8 pr-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 outline-none focus:ring-1 focus:ring-indigo-400" />
              </div>
              <div className="flex-1 min-w-[140px] relative">
                <MapPin size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={panel.site} onChange={e => updatePanel({ site: e.target.value })}
                  placeholder="Site"
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 pl-8 pr-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 outline-none focus:ring-1 focus:ring-indigo-400" />
              </div>
            </div>

            <div className="relative">
              <CalendarDays size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="date" value={panel.due_date || ''} onChange={e => updatePanel({ due_date: e.target.value || null })}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 pl-8 pr-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 outline-none focus:ring-1 focus:ring-indigo-400" />
            </div>

            <textarea value={panel.description} onChange={e => updatePanel({ description: e.target.value })}
              placeholder={tr('Description…', 'Description…')} rows={3}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 resize-none outline-none focus:ring-1 focus:ring-indigo-400" />

            {/* Steps */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <CheckSquare size={14} className="text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {tr('Étapes', 'Steps')} {steps.length > 0 && `(${steps.filter(s => s.done).length}/${steps.length})`}
                </h3>
              </div>
              <div className="space-y-1.5 mb-2">
                {steps.map(s => (
                  <div key={s.id} className="flex items-center gap-2 group/step">
                    <button onClick={() => toggleStep(s)} className="shrink-0 text-gray-400 hover:text-indigo-600">
                      {s.done ? <CheckSquare size={16} className="text-indigo-600" /> : <Square size={16} />}
                    </button>
                    <span className={`flex-1 text-sm ${s.done ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>{s.label}</span>
                    <button onClick={() => deleteStep(s.id)} className="opacity-0 group-hover/step:opacity-100 text-gray-400 hover:text-red-500"><X size={13} /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input value={newStep} onChange={e => setNewStep(e.target.value)} onKeyDown={e => e.key === 'Enter' && addStep()}
                  placeholder={tr('Nouvelle étape…', 'New step…')}
                  className="flex-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 outline-none focus:ring-1 focus:ring-indigo-400" />
                <button onClick={addStep} className="rounded-lg bg-indigo-600 text-white px-3 py-1.5 text-sm font-semibold hover:bg-indigo-700"><Plus size={15} /></button>
              </div>
            </div>

            {/* Photos */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Image size={14} className="text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {tr('Photos', 'Photos')} {panel.photo_urls.length > 0 && `(${panel.photo_urls.length})`}
                </h3>
              </div>
              {panel.photo_urls.length > 0 && (
                <div className="grid grid-cols-3 gap-1.5 mb-2">
                  {panel.photo_urls.map(url => (
                    <div key={url} className="relative group/photo aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => removePhoto(url)}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover/photo:opacity-100 text-white">
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600 transition">
                {uploading ? <Loader2 size={13} className="animate-spin" /> : <Paperclip size={13} />}
                {tr('Ajouter une photo', 'Add photo')}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); e.target.value = ''; }} />
            </div>

            {/* Meta */}
            <div className="text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-3 space-y-0.5">
              <p>{tr('Créé le', 'Created')} {fmtDate(panel.created_at, lang)}</p>
              <p>{tr('Modifié le', 'Updated')} {fmtDate(panel.updated_at, lang)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
