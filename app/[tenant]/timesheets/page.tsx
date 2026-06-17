'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSite } from '@/contexts/SiteContext';
import {
  Clock, Plus, ChevronRight, CheckCircle, XCircle,
  AlertCircle, DollarSign, Loader2, Calendar, User, Send,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRealtime } from '@/lib/useRealtime';
import { PortalHeader } from '@/components/PortalHeader';
import { BackButton } from '@/components/BackButton';

type Sheet = {
  id: string; employee_id?: string; employee_name: string; employee_email: string;
  period_start: string; period_end: string; status: string;
  total_regular: number; total_overtime: number; total_premium: number;
  total_km: number; total_km_personal: number; total_amount: number;
  submitted_at: string | null; approved_at: string | null;
  approved_by: string | null; rejection_note: string | null;
};

const STATUS: Record<string, { label: string; cls: string; icon: any }> = {
  draft:     { label: 'En cours',  cls: 'bg-slate-100 text-slate-600',    icon: Clock },
  submitted: { label: 'Soumise',   cls: 'bg-amber-100 text-amber-700',    icon: Send },
  approved:  { label: 'Validée',   cls: 'bg-emerald-100 text-emerald-700',icon: CheckCircle },
  verified:  { label: 'Vérifiée',  cls: 'bg-teal-100 text-teal-700',      icon: CheckCircle },
  rejected:  { label: 'Refusée',   cls: 'bg-red-100 text-red-700',        icon: XCircle },
  paid:      { label: 'Payée',     cls: 'bg-blue-100 text-blue-700',      icon: DollarSign },
  exported:  { label: 'Payée',     cls: 'bg-blue-100 text-blue-700',      icon: DollarSign },
};

const money = (n: number) => `${(Math.round(n * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $`;
const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('fr-CA', { month: 'short', day: 'numeric' });

function weekStart(d = new Date()) {
  const day = d.getDay(); const diff = (day === 0 ? -6 : 1 - day);
  const mon = new Date(d); mon.setDate(d.getDate() + diff);
  return mon.toISOString().slice(0, 10);
}
function weekEnd(start: string) {
  const d = new Date(start + 'T00:00:00'); d.setDate(d.getDate() + 6);
  return d.toISOString().slice(0, 10);
}
function isoWeek(dateStr: string): number {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const w1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - w1.getTime()) / 86400000 - 3 + ((w1.getDay() + 6) % 7)) / 7);
}
// Année ISO de la semaine (le jeudi décide l'année). Une semaine débutant le 29 déc. 2025 appartient à
// l'année ISO 2026 -> on filtre là-dessus (et non sur l'année civile du lundi) pour rester cohérent
// avec la grille des semaines, sinon les feuilles de fin/début d'année « disparaissent » du dashboard.
function isoWeekYear(dateStr: string): number {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  return d.getFullYear();
}
function isoW1Monday(year: number): Date {
  const jan4 = new Date(year, 0, 4);
  const dow = jan4.getDay();
  const d = new Date(jan4);
  d.setDate(jan4.getDate() - (dow === 0 ? 6 : dow - 1));
  return d;
}
function generatePeriods(year: number): { week: number; start: string; end: string }[] {
  const periods: { week: number; start: string; end: string }[] = [];
  const d = isoW1Monday(year);
  for (;;) {
    const start = d.toISOString().slice(0, 10);
    const wn = isoWeek(start);
    if (periods.length > 0 && wn === 1) break;
    const endD = new Date(d); endD.setDate(d.getDate() + 6);
    periods.push({ week: wn, start, end: endD.toISOString().slice(0, 10) });
    d.setDate(d.getDate() + 7);
    if (periods.length > 53) break;
  }
  return periods;
}

export default function TimesheetsPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || 'demo';
  const { siteId } = useSite(); // sélecteur de site global (en-tête)

  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  // Superviseur : bascule entre sa propre grille de semaines (« mine ») et la table d'équipe (« team »).
  // Défaut « mine » pour que la grille des semaines ne disparaisse pas au chargement.
  const [svView, setSvView] = useState<'mine' | 'team'>('mine');

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(({ user }) => {
      if (!user) return;
      setCurrentUserId(user.id);
      setCurrentUserEmail(user.email || '');
      setCurrentUserName(user.name || user.email || 'Employé');
      setIsSupervisor(user.role === 'client_admin' || user.role === 'super_admin');
    }).catch(() => {});
  }, []);

  async function load() {
    setLoading(true);
    let q = supabase.from('timesheets').select('*').eq('tenant_id', tenant);
    if (!isSupervisor && currentUserId) q = q.eq('employee_id', currentUserId);
    const { data } = await q.order('period_start', { ascending: false });
    setSheets(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [tenant, isSupervisor, currentUserId]); // eslint-disable-line
  // Synchro temps réel : la liste se met à jour quand une feuille change (soumise/approuvée par un autre).
  useRealtime(['timesheets'], tenant, () => load()); // eslint-disable-line

  // Auto-generate next week's draft 7 days in advance
  useEffect(() => {
    if (!currentUserId || isSupervisor) return;
    (async () => {
      const today = new Date();
      const day = today.getDay();
      const daysToNextMon = day === 0 ? 1 : 8 - day;
      const nextMon = new Date(today); nextMon.setDate(today.getDate() + daysToNextMon);
      const start = nextMon.toISOString().slice(0, 10);
      const end = new Date(nextMon.getTime() + 6 * 86400000).toISOString().slice(0, 10);
      const { data: exists } = await supabase.from('timesheets').select('id')
        .eq('tenant_id', tenant).eq('employee_id', currentUserId).eq('period_start', start).maybeSingle();
      if (!exists) {
        await supabase.from('timesheets').insert({
          tenant_id: tenant, site_id: siteId !== 'all' ? siteId : null, employee_id: currentUserId,
          employee_email: currentUserEmail, employee_name: currentUserName,
          period_start: start, period_end: end, status: 'draft',
        });
        load();
      }
    })();
  }, [currentUserId, tenant, isSupervisor]); // eslint-disable-line

  async function createNew() {
    if (!currentUserId) { alert('Session expirée — reconnectez-vous.'); return; }
    setCreating(true);
    try {
      const start = weekStart(); const end = weekEnd(start);
      const { data: existing } = await supabase.from('timesheets')
        .select('id').eq('tenant_id', tenant).eq('employee_id', currentUserId)
        .eq('period_start', start).maybeSingle();
      if (existing) { window.location.href = `/${tenant}/timesheets/${existing.id}`; return; }
      const { data, error } = await supabase.from('timesheets').insert({
        tenant_id: tenant, site_id: siteId !== 'all' ? siteId : null, employee_id: currentUserId,
        employee_email: currentUserEmail, employee_name: currentUserName,
        period_start: start, period_end: end, status: 'draft',
      }).select().single();
      if (error) throw error;
      window.location.href = `/${tenant}/timesheets/${data.id}`;
    } catch (e: any) { setCreating(false); alert('Erreur : ' + (e?.message || 'création impossible')); }
  }

  const employees = useMemo(() => [...new Set(sheets.map(s => s.employee_name))].sort(), [sheets]);
  const years = useMemo(() => [...new Set(sheets.map(s => isoWeekYear(s.period_start)))].sort((a, b) => b - a), [sheets]);

  const filtered = useMemo(() => sheets.filter(s => {
    if (siteId && siteId !== 'all' && (s as any).site_id !== siteId) return false;
    if (isoWeekYear(s.period_start) !== yearFilter) return false;
    if (employeeFilter && s.employee_name !== employeeFilter) return false;
    return true;
  }), [sheets, yearFilter, employeeFilter, siteId]);

  const ytd = useMemo(() => filtered.reduce((acc, s) => ({
    hrs: acc.hrs + Number(s.total_regular) + Number(s.total_overtime) + Number(s.total_premium),
    km:  acc.km  + Number(s.total_km_personal),
    amt: acc.amt + Number(s.total_amount),
    pending: acc.pending + (s.status === 'submitted' ? 1 : 0),
  }), { hrs: 0, km: 0, amt: 0, pending: 0 }), [filtered]);

  const pendingApproval = useMemo(() => sheets.filter(s => s.status === 'submitted'), [sheets]);

  const allPeriods = useMemo(() => generatePeriods(yearFilter), [yearFilter]);
  const fullGrid = useMemo(() => {
    const byStart: Record<string, Sheet> = {};
    // Grille PERSONNELLE : seulement les feuilles de l'utilisateur courant (un superviseur charge toutes
    // les feuilles de l'équipe, mais sa grille ne doit montrer que les siennes).
    sheets.forEach(s => {
      if (isoWeekYear(s.period_start) !== yearFilter) return;
      if (currentUserId && s.employee_id && String(s.employee_id) !== String(currentUserId)) return;
      byStart[s.period_start] = s;
    });
    return allPeriods.map(p => ({ ...p, sheet: byStart[p.start] as Sheet | undefined }));
  }, [allPeriods, sheets, yearFilter, currentUserId]);

  async function createForPeriod(start: string, end: string) {
    if (!currentUserId) { alert('Session expirée — reconnectez-vous.'); return; }
    try {
      const { data: existing } = await supabase.from('timesheets').select('id')
        .eq('tenant_id', tenant).eq('employee_id', currentUserId).eq('period_start', start).maybeSingle();
      if (existing) { window.location.href = `/${tenant}/timesheets/${existing.id}`; return; }
      const { data, error } = await supabase.from('timesheets').insert({
        tenant_id: tenant, site_id: siteId !== 'all' ? siteId : null, employee_id: currentUserId,
        employee_email: currentUserEmail, employee_name: currentUserName,
        period_start: start, period_end: end, status: 'draft',
      }).select().single();
      if (error) throw error;
      window.location.href = `/${tenant}/timesheets/${data.id}`;
    } catch (e: any) { alert('Erreur : ' + (e?.message || 'création impossible')); }
  }

  async function approve(id: string) {
    const approver = currentUserName || currentUserEmail || 'Superviseur';
    await supabase.from('timesheets').update({ status: 'approved', approved_at: new Date().toISOString(), approved_by: approver }).eq('id', id);
    load();
  }
  async function reject(id: string) {
    const note = prompt('Motif de refus :') || '';
    if (!note) return;
    await supabase.from('timesheets').update({ status: 'rejected', rejection_note: note }).eq('id', id);
    load();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <PortalHeader tenant={tenant} />
      <div className="w-full px-4 py-8 lg:px-6">
        <BackButton fallback={`/${tenant}/modules`} className="mb-4" />
        {/* En-tête */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-violet-600 text-white shadow-sm"><Clock size={22} /></div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Feuilles de temps</h1>
              <p className="text-sm text-slate-500">Espace <span className="font-medium text-slate-700">{tenant}</span> · saisie, approbation, export paie</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={createNew} disabled={creating}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-60">
              {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={18} />} Nouvelle feuille
            </button>
          </div>
        </div>

        {/* Approbations en attente (vue Équipe) */}
        {isSupervisor && svView === 'team' && pendingApproval.length > 0 && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50">
            <div className="border-b border-amber-200 px-4 py-3">
              <h2 className="flex items-center gap-2 font-bold text-amber-800">
                <AlertCircle size={16} /> {pendingApproval.length} feuille{pendingApproval.length > 1 ? 's' : ''} en attente d&apos;approbation
              </h2>
            </div>
            <div className="divide-y divide-amber-100">
              {pendingApproval.map(s => (
                <div key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <User size={14} className="text-amber-600" />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-amber-900">{s.employee_name}</span>
                    <span className="ml-2 text-xs text-amber-700">{fmt(s.period_start)} – {fmt(s.period_end)}</span>
                  </div>
                  <span className="text-sm font-medium text-amber-800">{money(Number(s.total_amount))}</span>
                  <div className="flex gap-1.5">
                    <button onClick={() => approve(s.id)} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">Approuver</button>
                    <button onClick={() => reject(s.id)} className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Refuser</button>
                    <Link href={`/${tenant}/timesheets/${s.id}`} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Voir</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats annuelles */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { k: 'Heures totales',        v: `${ytd.hrs.toFixed(1)} h`, c: 'text-slate-900' },
            { k: 'Km remboursables',      v: `${ytd.km.toFixed(0)} km`, c: 'text-emerald-600' },
            // Montant $ visible seulement pour superviseur/admin ; l'employé ne voit pas de $.
            ...(isSupervisor ? [{ k: 'Montant total', v: money(ytd.amt), c: 'text-violet-600' }] : []),
            { k: 'En attente approbation', v: String(ytd.pending),       c: 'text-amber-600' },
          ].map(s => (
            <div key={s.k} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className={`text-2xl font-bold ${s.c}`}>{s.v}</div>
              <div className="text-xs text-slate-500">{s.k}</div>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {(years.length ? years : [new Date().getFullYear()]).map(y => (
              <button key={y} onClick={() => setYearFilter(y)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${yearFilter === y ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                {y}
              </button>
            ))}
          </div>
          {isSupervisor && employees.length > 1 && (
            <select value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
              <option value="">Tous les employés</option>
              {employees.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          )}
        </div>

        {/* Bascule superviseur : Mes feuilles (grille) / Équipe (table) */}
        {isSupervisor && (
          <div className="mb-4 inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button onClick={() => setSvView('mine')} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${svView === 'mine' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>👤 Mes feuilles</button>
            <button onClick={() => setSvView('team')} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${svView === 'team' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>👥 Équipe{pendingApproval.length > 0 ? ` (${pendingApproval.length})` : ''}</button>
          </div>
        )}

        {/* Liste */}
        {loading ? (
          <div className="grid place-items-center rounded-2xl border border-slate-200 bg-white py-16"><Loader2 className="animate-spin text-slate-400" /></div>
        ) : (isSupervisor && svView === 'team') ? (
          /* Supervisor (vue Équipe) : table plate de toutes les feuilles filtrées */
          filtered.length === 0 ? (
            <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400"><Clock size={26} /></div>
              <p className="font-medium text-slate-700">Aucune feuille de temps</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500">
                    <th className="px-4 py-3">Employé</th><th className="px-4 py-3">Période</th>
                    <th className="px-4 py-3">Heures</th><th className="px-4 py-3">Km pers.</th>
                    <th className="px-4 py-3">Montant</th><th className="px-4 py-3">Statut</th><th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => {
                    const st = STATUS[s.status] || STATUS.draft;
                    const Icon = st.icon;
                    const hrs = Number(s.total_regular) + Number(s.total_overtime) + Number(s.total_premium);
                    return (
                      <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="grid h-7 w-7 place-items-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
                              {(s.employee_name || '?')[0].toUpperCase()}
                            </div>
                            <span className="font-medium">{s.employee_name || s.employee_email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          <div className="text-xs font-semibold text-violet-500 mb-0.5">P.{isoWeek(s.period_start)}</div>
                          <div className="flex items-center gap-1.5"><Calendar size={13} className="text-slate-400" />{fmt(s.period_start)} – {fmt(s.period_end)}</div>
                        </td>
                        <td className="px-4 py-3 font-medium">{hrs.toFixed(1)} h</td>
                        <td className="px-4 py-3 text-slate-600">{Number(s.total_km_personal).toFixed(0)} km</td>
                        <td className="px-4 py-3 font-semibold text-violet-700">{money(Number(s.total_amount))}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${st.cls}`}>
                            <Icon size={11} /> {st.label}
                          </span>
                          {s.rejection_note && <div className="mt-0.5 text-xs text-red-500">{s.rejection_note}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/${tenant}/timesheets/${s.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                            Ouvrir <ChevronRight size={12} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* Employé : grille complète des 52 périodes de l'année */
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[640px] text-sm sm:min-w-0">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold text-slate-500">
                  <th className="px-4 py-3">Période</th>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-3 py-3">Heures</th>
                  <th className="px-3 py-3 hidden sm:table-cell">Km pers.</th>
                  {isSupervisor && <th className="px-3 py-3 hidden sm:table-cell">Montant</th>}
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const today = new Date().toISOString().slice(0, 10);
                  return fullGrid.map(({ week, start, end, sheet }) => {
                    const isPast = end < today;
                    const isFuture = start > today;
                    const st = sheet ? (STATUS[sheet.status] || STATUS.draft) : null;
                    const Icon = st?.icon;
                    const hrs = sheet ? Number(sheet.total_regular) + Number(sheet.total_overtime) + Number(sheet.total_premium) : 0;
                    const isCurrentWeek = start <= today && today <= end;
                    return (
                      <tr key={week}
                        className={`border-t border-slate-100 ${isFuture && !sheet ? 'opacity-70' : 'hover:bg-slate-50'} ${isCurrentWeek ? 'bg-violet-50/40 dark:bg-violet-900/10' : ''}`}>
                        <td className="px-4 py-2.5">
                          <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ${isCurrentWeek ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            P.{week}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-600 text-xs whitespace-nowrap">
                          <div className="flex items-center gap-1"><Calendar size={11} className="text-slate-400" />{fmt(start)} – {fmt(end)}</div>
                        </td>
                        <td className="px-3 py-2.5 font-medium text-xs">{sheet ? `${hrs.toFixed(1)} h` : '—'}</td>
                        <td className="px-3 py-2.5 text-slate-600 text-xs hidden sm:table-cell">{sheet ? `${Number(sheet.total_km_personal).toFixed(0)} km` : '—'}</td>
                        {isSupervisor && <td className="px-3 py-2.5 font-semibold text-violet-700 text-xs hidden sm:table-cell">{sheet ? money(Number(sheet.total_amount)) : '—'}</td>}
                        <td className="px-4 py-2.5">
                          {st && Icon ? (
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${st.cls}`}>
                              <Icon size={10} /> {st.label}
                            </span>
                          ) : isPast ? (
                            <span className="text-xs text-orange-500 font-medium">Non soumise</span>
                          ) : isCurrentWeek ? (
                            <span className="text-xs text-violet-500 font-medium">Semaine courante</span>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                          {sheet?.rejection_note && <div className="mt-0.5 text-xs text-red-500">{sheet.rejection_note}</div>}
                        </td>
                        <td className="px-4 py-2.5">
                          {sheet ? (
                            <Link href={`/${tenant}/timesheets/${sheet.id}`}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                              Ouvrir <ChevronRight size={11} />
                            </Link>
                          ) : (
                            /* Toute période est accessible (passée, courante ou à venir) : on peut toujours la créer/ouvrir. */
                            <button onClick={() => createForPeriod(start, end)}
                              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-white ${isFuture ? 'bg-slate-400 hover:bg-slate-500' : 'bg-violet-600 hover:bg-violet-700'}`}>
                              <Plus size={11} /> {isFuture ? 'Préparer' : 'Créer'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
