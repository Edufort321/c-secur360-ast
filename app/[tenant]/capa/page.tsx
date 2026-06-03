'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ClipboardCheck, Search, Trash2, AlertTriangle, Clock } from 'lucide-react';
import { PortalHeader } from '@/components/PortalHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRealtime } from '@/lib/useRealtime';
import {
  listIncidentActions, updateIncidentAction, deleteIncidentAction, isActionOverdue,
  ACTION_STATUSES, type IncidentAction, type IncidentActionStatus,
} from '@/lib/incidentActions';

const STATUS_COLOR: Record<IncidentActionStatus, string> = {
  a_faire:  'bg-gray-100 text-gray-600',
  en_cours: 'bg-blue-100 text-blue-700',
  fait:     'bg-green-100 text-green-700',
  verifie:  'bg-emerald-100 text-emerald-700',
};
const PRIORITY_COLOR: Record<string, string> = {
  basse:    'bg-gray-100 text-gray-500',
  normale:  'bg-slate-100 text-slate-600',
  haute:    'bg-orange-100 text-orange-700',
  critique: 'bg-red-100 text-red-700',
};

const T = {
  fr: {
    title: 'Actions correctives (CAPA)', subtitle: 'Suivi des actions liees aux incidents',
    search: 'Rechercher (description, responsable)...', allStatuses: 'Tous statuts', allDue: 'Toutes echeances',
    overdue: 'En retard', dueSoon: 'A venir (7 j)', noDue: 'Sans echeance',
    total: 'Total', late: 'En retard', open: 'Ouvertes', done: 'Faites',
    loading: 'Chargement...', empty: 'Aucune action enregistree', noResult: 'Aucun resultat',
    assignee: 'Responsable', due: 'Echeance', none: '—', confirmDel: 'Supprimer cette action ?',
    statusLabel: { a_faire: 'A faire', en_cours: 'En cours', fait: 'Fait', verifie: 'Verifie' } as Record<string, string>,
    priorityLabel: { basse: 'Basse', normale: 'Normale', haute: 'Haute', critique: 'Critique' } as Record<string, string>,
    locale: 'fr-CA',
  },
  en: {
    title: 'Corrective actions (CAPA)', subtitle: 'Tracking of incident-related actions',
    search: 'Search (description, assignee)...', allStatuses: 'All statuses', allDue: 'All due dates',
    overdue: 'Overdue', dueSoon: 'Due soon (7 d)', noDue: 'No due date',
    total: 'Total', late: 'Overdue', open: 'Open', done: 'Done',
    loading: 'Loading...', empty: 'No action recorded', noResult: 'No result',
    assignee: 'Assignee', due: 'Due', none: '—', confirmDel: 'Delete this action?',
    statusLabel: { a_faire: 'To do', en_cours: 'In progress', fait: 'Done', verifie: 'Verified' } as Record<string, string>,
    priorityLabel: { basse: 'Low', normale: 'Normal', haute: 'High', critique: 'Critical' } as Record<string, string>,
    locale: 'en-CA',
  },
} as const;

export default function CapaPage() {
  const params = useParams();
  const router = useRouter();
  const tenant = params.tenant as string;
  const { lang } = useLanguage();
  const t = T[lang];

  const [actions, setActions] = useState<IncidentAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | IncidentActionStatus>('all');
  const [dueFilter, setDueFilter] = useState<'all' | 'overdue' | 'soon' | 'none'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setActions(await listIncidentActions(tenant));
    setLoading(false);
  }, [tenant]);

  useEffect(() => { load(); }, [load]);
  useRealtime(['incident_actions'], tenant, load);

  async function setStatus(id: string, status: IncidentActionStatus) {
    setActions(prev => prev.map(a => a.id === id ? { ...a, status } : a)); // optimiste
    await updateIncidentAction(id, { status });
  }
  async function remove(id: string) {
    if (typeof window !== 'undefined' && !window.confirm(t.confirmDel)) return;
    setActions(prev => prev.filter(a => a.id !== id));
    await deleteIncidentAction(id);
  }

  function dueBucket(a: IncidentAction): 'overdue' | 'soon' | 'none' | 'later' {
    if (!a.due_date) return 'none';
    if (isActionOverdue(a)) return 'overdue';
    const days = (new Date(a.due_date).getTime() - Date.now()) / 86400000;
    return days <= 7 ? 'soon' : 'later';
  }

  const filtered = actions
    .filter(a => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (dueFilter !== 'all' && dueBucket(a) !== dueFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (a.description ?? '').toLowerCase().includes(q) || (a.assignee ?? '').toLowerCase().includes(q);
    })
    .sort((a, b) =>
      (isActionOverdue(b) ? 1 : 0) - (isActionOverdue(a) ? 1 : 0) ||
      String(a.due_date ?? '9999').localeCompare(String(b.due_date ?? '9999')),
    );

  const filtersActive = !!search || statusFilter !== 'all' || dueFilter !== 'all';
  const openCount = actions.filter(a => a.status === 'a_faire' || a.status === 'en_cours').length;
  const lateCount = actions.filter(isActionOverdue).length;
  const doneCount = actions.filter(a => a.status === 'fait' || a.status === 'verifie').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalHeader tenant={tenant} />

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <button type="button" onClick={() => router.back()} aria-label="Retour" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ClipboardCheck size={22} className="text-red-500" />
              {t.title}
            </h1>
            <p className="text-xs text-gray-400">{t.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: t.total, value: actions.length, color: 'text-gray-700' },
            { label: t.open, value: openCount, color: 'text-blue-600' },
            { label: t.late, value: lateCount, color: 'text-red-600' },
            { label: t.done, value: doneCount, color: 'text-green-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-100 px-4 py-3 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t.search}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400" aria-label="Statut">
              <option value="all">{t.allStatuses}</option>
              {ACTION_STATUSES.map(s => <option key={s} value={s}>{t.statusLabel[s]}</option>)}
            </select>
            <select value={dueFilter} onChange={e => setDueFilter(e.target.value as typeof dueFilter)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400" aria-label="Echeance">
              <option value="all">{t.allDue}</option>
              <option value="overdue">{t.overdue}</option>
              <option value="soon">{t.dueSoon}</option>
              <option value="none">{t.noDue}</option>
            </select>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm text-gray-400">{t.loading}</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <ClipboardCheck size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-400">{filtersActive ? t.noResult : t.empty}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map(a => {
                const overdue = isActionOverdue(a);
                return (
                  <div key={a.id} className="px-5 py-4 flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLOR[a.priority] ?? 'bg-slate-100 text-slate-600'}`}>
                          {t.priorityLabel[a.priority] ?? a.priority}
                        </span>
                        {overdue && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                            <AlertTriangle size={11} /> {t.overdue}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-900 break-words">{a.description || t.none}</p>
                      <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-3 flex-wrap">
                        <span>{t.assignee}: {a.assignee || t.none}</span>
                        <span className={`flex items-center gap-1 ${overdue ? 'text-red-600 font-medium' : ''}`}>
                          <Clock size={12} /> {t.due}: {a.due_date
                            ? new Date(a.due_date).toLocaleDateString(t.locale, { year: 'numeric', month: 'short', day: 'numeric' })
                            : t.none}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <select
                        value={a.status}
                        onChange={e => setStatus(a.id, e.target.value as IncidentActionStatus)}
                        className={`text-xs px-2 py-1 rounded-lg border-0 font-medium ${STATUS_COLOR[a.status]}`}
                        aria-label="Statut"
                      >
                        {ACTION_STATUSES.map(s => <option key={s} value={s}>{t.statusLabel[s]}</option>)}
                      </select>
                      <button onClick={() => remove(a.id)} className="text-red-400 hover:text-red-600" aria-label="Supprimer">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
