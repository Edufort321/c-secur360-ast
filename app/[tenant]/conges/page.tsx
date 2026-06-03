'use client';

// #72 — Module Congés (self-service). Nouvelle route autonome, hors components/planner/**.
// Réutilise la table planner_conges (data partagée avec le planner). L'employé fait une demande,
// le superviseur (client_admin/super_admin) approuve ou refuse. Temps réel + bilingue FR/EN.
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Check, X, Trash2, Loader2, CalendarDays, Clock, Users, Send } from 'lucide-react';
import { PortalHeader } from '@/components/PortalHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRealtime } from '@/lib/useRealtime';
import {
  getConges, getPersonnel, createConge, decideConge, cancelConge, deleteConge,
  dayCount, CONGE_TYPES, type Conge, type CongeType, type Personnel,
} from '@/lib/conges';

const STATUS = {
  pending:   { fr: 'En attente', en: 'Pending',  cls: 'bg-amber-100 text-amber-700' },
  approved:  { fr: 'Approuvé',   en: 'Approved', cls: 'bg-emerald-100 text-emerald-700' },
  rejected:  { fr: 'Refusé',     en: 'Rejected', cls: 'bg-red-100 text-red-600' },
  cancelled: { fr: 'Annulé',     en: 'Cancelled', cls: 'bg-gray-100 text-gray-500' },
} as const;

export default function CongesPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || 'demo';
  const { lang } = useLanguage();
  const L = (fr: string, en: string) => (lang === 'en' ? en : fr);

  const [me, setMe] = useState<{ email: string; role: string } | null>(null);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [conges, setConges] = useState<Conge[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [tab, setTab] = useState<'mine' | 'team'>('mine');

  // Formulaire de demande
  const [personId, setPersonId] = useState('');
  const [type, setType] = useState<CongeType>('conge');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isSupervisor = me?.role === 'client_admin' || me?.role === 'super_admin';
  const persById = useMemo(() => Object.fromEntries(personnel.map(p => [p.id, p])), [personnel]);
  const myPerson = useMemo(
    () => personnel.find(p => p.email && me?.email && p.email.toLowerCase() === me.email.toLowerCase()) || null,
    [personnel, me],
  );

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d?.user) setMe({ email: d.user.email || '', role: d.user.role || 'user' }); }).catch(() => {});
  }, []);

  async function load() {
    try {
      const [pers, cgs] = await Promise.all([getPersonnel(tenant), getConges(tenant)]);
      setPersonnel(pers); setConges(cgs);
    } catch { setNotice(L('Exécutez la migration 128, puis rechargez.', 'Run migration 128, then reload.')); }
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);
  useRealtime(['planner_conges'], tenant, () => { getConges(tenant).then(setConges).catch(() => { /* noop */ }); });

  // Présélectionne l'employé courant pour la demande.
  useEffect(() => { if (myPerson && !personId) setPersonId(myPerson.id); }, [myPerson]); // eslint-disable-line

  const mine = useMemo(() => (myPerson ? conges.filter(c => c.personnel_id === myPerson.id) : []), [conges, myPerson]);
  const pendingTeam = useMemo(() => conges.filter(c => c.status === 'pending'), [conges]);

  // Solde de l'année courante (jours approuvés par type) pour la personne sélectionnée/soi.
  const balancePersonId = isSupervisor ? personId : (myPerson?.id || '');
  const balance = useMemo(() => {
    const year = new Date().getFullYear();
    const out: Record<string, number> = {};
    conges.filter(c => c.personnel_id === balancePersonId && c.status === 'approved' && new Date(c.start_date).getFullYear() === year)
      .forEach(c => { out[c.type] = (out[c.type] || 0) + dayCount(c.start_date, c.end_date); });
    return out;
  }, [conges, balancePersonId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!personId || !startDate || !endDate) { setNotice(L('Employé et dates requis.', 'Employee and dates required.')); return; }
    if (endDate < startDate) { setNotice(L('La date de fin précède le début.', 'End date is before start.')); return; }
    setSubmitting(true); setNotice(null);
    try {
      await createConge(tenant, { personnel_id: personId, start_date: startDate, end_date: endDate, type, notes, requested_by: me?.email });
      setStartDate(''); setEndDate(''); setNotes('');
      await load();
      setNotice(L('Demande envoyée.', 'Request submitted.'));
    } catch (err: any) { setNotice('Erreur : ' + (err?.message || 'DB')); }
    setSubmitting(false);
  }

  async function decide(c: Conge, approve: boolean) {
    try { await decideConge(tenant, c.id!, approve, me?.email || 'admin'); await load(); }
    catch (err: any) { setNotice(err?.message); }
  }
  async function cancel(c: Conge) {
    try { await cancelConge(tenant, c.id!); await load(); } catch (err: any) { setNotice(err?.message); }
  }
  async function remove(c: Conge) {
    try { await deleteConge(tenant, c.id!); await load(); } catch (err: any) { setNotice(err?.message); }
  }

  const typeLabel = (t: string) => { const x = CONGE_TYPES.find(y => y.value === t); return x ? `${x.emoji} ${L(x.fr, x.en)}` : t; };
  const fmt = (d: string) => new Date(d + 'T00:00').toLocaleDateString(lang === 'en' ? 'en-CA' : 'fr-CA', { month: 'short', day: 'numeric', year: 'numeric' });

  function CongeRow({ c, canManage }: { c: Conge; canManage: boolean }) {
    const st = STATUS[c.status] || STATUS.pending;
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <span className="text-sm font-semibold text-slate-700">{persById[c.personnel_id]?.name || '—'}</span>
        <span className="text-xs text-slate-500">{typeLabel(c.type)}</span>
        <span className="text-xs text-slate-600"><CalendarDays size={12} className="mr-1 inline" />{fmt(c.start_date)} → {fmt(c.end_date)}</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{dayCount(c.start_date, c.end_date)} {L('j', 'd')}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${st.cls}`}>{L(st.fr, st.en)}</span>
        {c.notes && <span className="text-xs italic text-slate-400">{c.notes}</span>}
        <div className="ml-auto flex items-center gap-2">
          {canManage && c.status === 'pending' && (
            <>
              <button onClick={() => decide(c, true)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"><Check size={12} /> {L('Approuver', 'Approve')}</button>
              <button onClick={() => decide(c, false)} className="inline-flex items-center gap-1 rounded-lg border border-red-300 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"><X size={12} /> {L('Refuser', 'Reject')}</button>
            </>
          )}
          {c.status === 'pending' && !canManage && (
            <button onClick={() => cancel(c)} className="text-xs font-semibold text-slate-400 hover:text-slate-600 hover:underline">{L('Annuler', 'Cancel')}</button>
          )}
          {canManage && <button onClick={() => remove(c)} className="rounded-lg p-1 text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>}
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50"><PortalHeader tenant={tenant} />
      <div className="grid place-items-center py-32"><Loader2 className="animate-spin text-slate-400" /></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <PortalHeader tenant={tenant} />
      <div className="mx-auto w-full max-w-5xl px-4 pb-10 pt-5 lg:px-6">
        <h1 className="mb-1 text-xl font-bold text-slate-900">{L('Congés', 'Time off')}</h1>
        <p className="mb-4 text-sm text-slate-500">{L('Demandez vos congés ; votre superviseur les approuve.', 'Request your time off; your supervisor approves it.')}</p>

        {notice && <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-800">{notice}</div>}

        {/* Onglets */}
        <div className="mb-4 flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <button onClick={() => setTab('mine')} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${tab === 'mine' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Clock size={15} /> {L('Mes congés', 'My time off')}</button>
          {isSupervisor && <button onClick={() => setTab('team')} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${tab === 'team' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Users size={15} /> {L('Équipe', 'Team')}{pendingTeam.length > 0 && <span className="ml-1 rounded-full bg-amber-500 px-1.5 text-xs text-white">{pendingTeam.length}</span>}</button>}
        </div>

        {/* Formulaire de demande */}
        <form onSubmit={submit} className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-600"><Plus size={15} /> {L('Nouvelle demande', 'New request')}</div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-xs font-semibold text-slate-500">{L('Employé', 'Employee')}
              <select value={personId} disabled={!isSupervisor && !!myPerson} onChange={e => setPersonId(e.target.value)} className="inp mt-1 w-full">
                <option value="">{L('— Choisir —', '— Select —')}</option>
                {personnel.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-500">{L('Type', 'Type')}
              <select value={type} onChange={e => setType(e.target.value as CongeType)} className="inp mt-1 w-full">
                {CONGE_TYPES.map(t => <option key={t.value} value={t.value}>{t.emoji} {L(t.fr, t.en)}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-500">{L('Du', 'From')}
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="inp mt-1 w-full" />
            </label>
            <label className="text-xs font-semibold text-slate-500">{L('Au', 'To')}
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="inp mt-1 w-full" />
            </label>
          </div>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <label className="flex-1 text-xs font-semibold text-slate-500">{L('Note (facultatif)', 'Note (optional)')}
              <input value={notes} onChange={e => setNotes(e.target.value)} className="inp mt-1 w-full" placeholder={L('Motif, détails…', 'Reason, details…')} />
            </label>
            <div className="flex items-center gap-3">
              {startDate && endDate && endDate >= startDate && <span className="text-sm font-semibold text-slate-600">{dayCount(startDate, endDate)} {L('jour(s)', 'day(s)')}</span>}
              <button type="submit" disabled={submitting} className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
                {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} {L('Envoyer la demande', 'Submit request')}
              </button>
            </div>
          </div>
        </form>

        {/* Solde année courante */}
        {balancePersonId && Object.keys(balance).length > 0 && (
          <div className="mb-6 flex flex-wrap gap-3">
            {CONGE_TYPES.filter(t => balance[t.value]).map(t => (
              <div key={t.value} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm">
                <div className="text-lg font-bold text-slate-800">{balance[t.value]} {L('j', 'd')}</div>
                <div className="text-xs text-slate-500">{t.emoji} {L(t.fr, t.en)} · {new Date().getFullYear()}</div>
              </div>
            ))}
          </div>
        )}

        {/* Listes */}
        {tab === 'mine' ? (
          <div className="space-y-2">
            {!myPerson && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{L('Aucun profil employé lié à votre courriel — choisissez votre nom dans le formulaire.', 'No employee profile linked to your email — pick your name in the form.')}</div>}
            {mine.length === 0 ? <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-400">{L('Aucune demande.', 'No request yet.')}</div>
              : mine.map(c => <CongeRow key={c.id} c={c} canManage={false} />)}
          </div>
        ) : (
          <div className="space-y-4">
            {pendingTeam.length > 0 && (
              <div>
                <div className="mb-2 text-sm font-bold text-amber-700">{L('À approuver', 'To approve')} ({pendingTeam.length})</div>
                <div className="space-y-2">{pendingTeam.map(c => <CongeRow key={c.id} c={c} canManage />)}</div>
              </div>
            )}
            <div>
              <div className="mb-2 text-sm font-bold text-slate-600">{L('Toutes les demandes', 'All requests')}</div>
              <div className="space-y-2">
                {conges.length === 0 ? <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-400">{L('Aucune demande.', 'No request yet.')}</div>
                  : conges.map(c => <CongeRow key={c.id} c={c} canManage />)}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .inp { border-radius: 0.5rem; border: 1px solid rgb(226 232 240); background: transparent; padding: 0.4rem 0.6rem; font-size: 0.85rem; outline: none; }
        .inp:focus { border-color: rgb(124 58 237); box-shadow: 0 0 0 2px rgb(124 58 237 / 0.15); }
        .inp:disabled { background: rgb(248 250 252); color: rgb(100 116 139); }
      `}</style>
    </div>
  );
}
