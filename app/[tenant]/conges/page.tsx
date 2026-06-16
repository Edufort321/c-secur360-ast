'use client';

// #72 — Module Congés (self-service). Nouvelle route autonome, hors components/planner/**.
// Réutilise la table planner_conges (data partagée avec le planner). L'employé fait une demande,
// le superviseur (client_admin/super_admin) approuve ou refuse. Temps réel + bilingue FR/EN.
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, X, Check, Trash2, Loader2, CalendarDays, Clock, Send, ArrowLeft, Users } from 'lucide-react';
import { PortalHeader } from '@/components/PortalHeader';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRealtime } from '@/lib/useRealtime';
import {
  getConges, getPersonnel, createConge, decideConge, cancelConge,
  dayCount, type Conge, type CongeType, type Personnel,
} from '@/lib/conges';
import { getCongeTypes, DEFAULT_CONGE_TYPES, getPostes, type CongeTypeDef, type Poste } from '@/lib/congeTypes';
import { uploadReceipt } from '@/lib/transactions';
import { getCompanySettings } from '@/lib/invoicing';
import { getLeaveRules, isParentalType } from '@/lib/leaveRules';

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
  const [postes, setPostes] = useState<Poste[]>([]);
  const [tab, setTab] = useState<'mine' | 'approve'>('mine');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  // Formulaire de demande
  const [personId, setPersonId] = useState('');
  const [type, setType] = useState<CongeType>('conge');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // Types configurés par le tenant (Admin/RH) — justification requise, etc. Repli sur défauts.
  const [typeDefs, setTypeDefs] = useState<CongeTypeDef[]>(DEFAULT_CONGE_TYPES);
  const [justifFile, setJustifFile] = useState<File | null>(null);
  const [province, setProvince] = useState('QC'); // province du tenant (règles RQAP/AE)
  useEffect(() => { getCongeTypes(tenant).then(setTypeDefs).catch(() => {}); getCompanySettings(tenant).then(s => s?.province && setProvince(s.province)).catch(() => {}); }, [tenant]);
  const selType = useMemo(() => typeDefs.find(t => t.value === type), [typeDefs, type]);
  const days = startDate && endDate && endDate >= startDate ? dayCount(startDate, endDate) : 0;
  const justifRequired = !!selType?.requires_justification && days >= (selType?.justification_after_days || 0);
  const parental = isParentalType(type) || isParentalType(selType?.label_fr);
  const rules = useMemo(() => getLeaveRules(province), [province]);

  // Module Congés = LIBRE-SERVICE : l'utilisateur courant voit/gère SES demandes seulement. La vue
  // « toutes les demandes » + filtres (site/département) vit dans le planner (onglet Congés), pas ici.
  const persById = useMemo(() => Object.fromEntries(personnel.map(p => [p.id, p])), [personnel]);
  const myPerson = useMemo(
    () => personnel.find(p => p.email && me?.email && p.email.toLowerCase() === me.email.toLowerCase()) || null,
    [personnel, me],
  );

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d?.user) setMe({ email: d.user.email || '', role: d.user.role || 'user' }); }).catch(() => {});
  }, []);

  // Routage d'approbation par POSTE : chaque type a un poste approbateur (Admin/RH). Un utilisateur
  // dont le poste correspond — ou un superviseur (client_admin/super_admin) pour les types sans poste —
  // voit la file « À approuver ».
  const isSupervisor = me?.role === 'client_admin' || me?.role === 'super_admin';
  const myPosteId = useMemo(() => postes.find(p => myPerson?.role && p.name === myPerson.role)?.id || null, [postes, myPerson]);
  const approvalPosteByType = useMemo(() => Object.fromEntries(typeDefs.map(t => [t.value, t.approval_poste_id || null])), [typeDefs]);
  const canApprove = (c: Conge) => {
    const ap = approvalPosteByType[c.type] || null;
    if (ap) return myPosteId === ap;        // poste désigné -> seul ce poste approuve
    return isSupervisor;                     // aucun poste désigné -> superviseur
  };
  const toApprove = useMemo(() => conges.filter(c => c.status === 'pending' && canApprove(c)), [conges, approvalPosteByType, myPosteId, isSupervisor]); // eslint-disable-line
  const isApprover = isSupervisor || typeDefs.some(t => t.approval_poste_id && t.approval_poste_id === myPosteId);

  async function decide(c: Conge, approve: boolean) {
    try { await decideConge(tenant, c.id!, approve, me?.email || 'approbateur'); await load(); setNotice(L(approve ? 'Demande approuvée.' : 'Demande refusée.', approve ? 'Request approved.' : 'Request rejected.')); }
    catch (e: any) { setNotice(e?.message); }
  }

  async function load() {
    try {
      const [pers, cgs, pos] = await Promise.all([getPersonnel(tenant), getConges(tenant), getPostes(tenant).catch(() => [])]);
      setPersonnel(pers); setConges(cgs); setPostes(pos);
    } catch { setNotice(L('Exécutez la migration 128, puis rechargez.', 'Run migration 128, then reload.')); }
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);
  useRealtime(['planner_conges'], tenant, () => { getConges(tenant).then(setConges).catch(() => { /* noop */ }); });

  // Présélectionne l'employé courant pour la demande.
  useEffect(() => { if (myPerson && !personId) setPersonId(myPerson.id); }, [myPerson]); // eslint-disable-line

  const mine = useMemo(() => (myPerson ? conges.filter(c => c.personnel_id === myPerson.id) : []), [conges, myPerson]);

  // Solde de l'année courante (jours approuvés par type) pour soi.
  const balancePersonId = myPerson?.id || personId || '';
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
    if (!notes.trim()) { setNotice(L('La note (motif) est obligatoire.', 'The note (reason) is required.')); return; }
    if (endDate < startDate) { setNotice(L('La date de fin précède le début.', 'End date is before start.')); return; }
    if (justifRequired && !justifFile) { setNotice(L(`Pièce justificative requise (${selType?.justification_label || 'justificatif'}).`, `Justification required (${selType?.justification_label || 'document'}).`)); return; }
    setSubmitting(true); setNotice(null);
    try {
      // Justificatif (billet du médecin, doc RQAP…) -> téléversé et joint à la note pour l'approbateur.
      let fullNotes = notes;
      if (justifFile) { try { const url = await uploadReceipt(tenant, justifFile); fullNotes = `${notes} | ${selType?.justification_label || 'Justificatif'}: ${url}`; } catch { /* upload échoué -> on garde la note */ } }
      await createConge(tenant, { personnel_id: personId, start_date: startDate, end_date: endDate, type, notes: fullNotes, requested_by: me?.email });
      setStartDate(''); setEndDate(''); setNotes(''); setJustifFile(null);
      await load();
      setNotice(L('Demande envoyée.', 'Request submitted.'));
    } catch (err: any) { setNotice('Erreur : ' + (err?.message || 'DB')); }
    setSubmitting(false);
  }

  async function cancel(c: Conge) {
    try { await cancelConge(tenant, c.id!); await load(); } catch (err: any) { setNotice(err?.message); }
  }

  const typeLabel = (t: string) => { const x = typeDefs.find(y => y.value === t); return x ? `${x.emoji || ''} ${L(x.label_fr, x.label_en || x.label_fr)}`.trim() : t; };
  const fmt = (d: string) => new Date(d + 'T00:00').toLocaleDateString(lang === 'en' ? 'en-CA' : 'fr-CA', { month: 'short', day: 'numeric', year: 'numeric' });

  function CongeRow({ c, manage }: { c: Conge; manage?: boolean }) {
    const st = STATUS[c.status] || STATUS.pending;
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        {manage && <span className="text-sm font-semibold text-slate-700">{persById[c.personnel_id]?.name || '—'}</span>}
        <span className="text-xs text-slate-500">{typeLabel(c.type)}</span>
        <span className="text-xs text-slate-600"><CalendarDays size={12} className="mr-1 inline" />{fmt(c.start_date)} → {fmt(c.end_date)}</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{dayCount(c.start_date, c.end_date)} {L('j', 'd')}</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${st.cls}`}>{L(st.fr, st.en)}</span>
        {c.notes && <span className="text-xs italic text-slate-400">{c.notes}</span>}
        <div className="ml-auto flex items-center gap-2">
          {manage && c.status === 'pending' ? (
            <>
              <button onClick={() => decide(c, true)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"><Check size={12} /> {L('Approuver', 'Approve')}</button>
              <button onClick={() => decide(c, false)} className="inline-flex items-center gap-1 rounded-lg border border-red-300 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"><X size={12} /> {L('Refuser', 'Reject')}</button>
            </>
          ) : c.status === 'pending' && !manage && (
            <button onClick={() => cancel(c)} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-red-600 hover:underline"><X size={12} /> {L('Annuler', 'Cancel')}</button>
          )}
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
        {/* Flèche retour vers les modules (comme les autres modules) */}
        <Link href={`/${tenant}/modules`} className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-violet-700">
          <ArrowLeft size={16} /> {L('Modules', 'Modules')}
        </Link>
        <h1 className="mb-1 flex items-center gap-2 text-xl font-bold text-slate-900"><Clock size={20} /> {L('Mes congés', 'My time off')}</h1>
        <p className="mb-4 text-sm text-slate-500">{L('Demandez vos congés et suivez leur statut. Votre superviseur les approuve.', 'Request your time off and track its status. Your supervisor approves it.')}</p>

        {notice && <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-800">{notice}</div>}

        {/* Onglets : Mes congés (libre-service) + À approuver (si je suis approbateur d'un poste/superviseur) */}
        {isApprover && (
          <div className="mb-4 flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button onClick={() => setTab('mine')} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${tab === 'mine' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Clock size={15} /> {L('Mes congés', 'My time off')}</button>
            <button onClick={() => setTab('approve')} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${tab === 'approve' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}><Users size={15} /> {L('À approuver', 'To approve')}{toApprove.length > 0 && <span className="ml-1 rounded-full bg-amber-500 px-1.5 text-xs text-white">{toApprove.length}</span>}</button>
          </div>
        )}

        {tab === 'approve' ? (
          <div className="space-y-2">
            <div className="mb-1 text-sm font-bold text-slate-600">{L('Demandes à approuver (routées vers votre poste)', 'Requests to approve (routed to your position)')}</div>
            {toApprove.length === 0
              ? <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-400">{L('Aucune demande en attente pour vous.', 'No pending request for you.')}</div>
              : toApprove.map(c => <CongeRow key={c.id} c={c} manage />)}
          </div>
        ) : (<>
        {/* Formulaire de demande */}
        <form onSubmit={submit} className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-600"><Plus size={15} /> {L('Nouvelle demande', 'New request')}</div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-xs font-semibold text-slate-500">{L('Employé', 'Employee')}
              <select value={personId} disabled={!!myPerson} onChange={e => setPersonId(e.target.value)} className="inp mt-1 w-full">
                <option value="">{L('— Choisir —', '— Select —')}</option>
                {personnel.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-500">{L('Type', 'Type')}
              <select value={type} onChange={e => setType(e.target.value as CongeType)} className="inp mt-1 w-full">
                {typeDefs.map(t => <option key={t.value} value={t.value}>{t.emoji || ''} {L(t.label_fr, t.label_en || t.label_fr)}</option>)}
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
            <label className="flex-1 text-xs font-semibold text-slate-500">{L('Note (motif)', 'Note (reason)')} <span className="text-red-500">*</span>
              <input value={notes} onChange={e => setNotes(e.target.value)} required className="inp mt-1 w-full" placeholder={L('Motif, détails… (obligatoire)', 'Reason, details… (required)')} />
            </label>
            {justifRequired && (
              <label className="text-xs font-semibold text-amber-700">📎 {selType?.justification_label || L('Justificatif', 'Justification')} <span className="text-red-500">*</span>
                <input type="file" accept="image/*,application/pdf,.pdf" onChange={e => setJustifFile(e.target.files?.[0] || null)} className="mt-1 block w-full text-xs" />
                {justifFile && <span className="text-[11px] text-emerald-600">✓ {justifFile.name}</span>}
              </label>
            )}
            <div className="flex items-center gap-3">
              {startDate && endDate && endDate >= startDate && <span className="text-sm font-semibold text-slate-600">{dayCount(startDate, endDate)} {L('jour(s)', 'day(s)')}</span>}
              <button type="submit" disabled={submitting} className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
                {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} {L('Envoyer la demande', 'Submit request')}
              </button>
            </div>
          </div>
          {/* Cadre CONGÉ PARENTAL selon la PROVINCE du tenant (RQAP au QC / AE ailleurs) + Relevé d'emploi */}
          {parental && (
            <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-xs text-indigo-900 dark:border-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-200">
              <div className="mb-1 font-bold">👶 {L('Congé parental', 'Parental leave')} — {province} · {rules.plan === 'RQAP' ? 'RQAP' : L('Assurance-emploi (AE)', 'Employment Insurance (EI)')}</div>
              <ul className="ml-4 list-disc space-y-0.5">
                <li>{L(`Maternité ≈ ${rules.maternityWeeks} sem.`, `Maternity ≈ ${rules.maternityWeeks} wk`)}{rules.paternityWeeks ? L(`, paternité ≈ ${rules.paternityWeeks} sem.`, `, paternity ≈ ${rules.paternityWeeks} wk`) : ''} · {L(`parental ≈ ${rules.parentalWeeks} sem.`, `parental ≈ ${rules.parentalWeeks} wk`)}{rules.parentalWeeksExtended ? L(` (ou ${rules.parentalWeeksExtended} sem. prolongé)`, ` (or ${rules.parentalWeeksExtended} wk extended)`) : ''}</li>
                <li>{L(`Prestation ≈ ${rules.benefitRatePct} % du revenu (max assurable ${rules.maxInsurableAnnual.toLocaleString('fr-CA')} $).`, `Benefit ≈ ${rules.benefitRatePct}% of income (max insurable $${rules.maxInsurableAnnual.toLocaleString('en-CA')}).`)}</li>
                <li className="font-semibold">{L(`📄 Relevé d'emploi requis (cessation temporaire, code « ${rules.roeCode} ») → la paie est interrompue pendant le congé.`, `📄 Record of Employment required (temporary stop, code “${rules.roeCode}”) → payroll is interrupted during the leave.`)}</li>
                <li className="italic opacity-80">{rules.note}</li>
              </ul>
            </div>
          )}
        </form>

        {/* Solde année courante */}
        {balancePersonId && Object.keys(balance).length > 0 && (
          <div className="mb-6 flex flex-wrap gap-3">
            {typeDefs.filter(t => balance[t.value]).map(t => (
              <div key={t.value} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm">
                <div className="text-lg font-bold text-slate-800">{balance[t.value]} {L('j', 'd')}</div>
                <div className="text-xs text-slate-500">{t.emoji} {L(t.label_fr, t.label_en || t.label_fr)} · {new Date().getFullYear()}</div>
              </div>
            ))}
          </div>
        )}

        {/* Mes demandes (libre-service) — toutes mes demandes + leur statut */}
        <div className="space-y-2">
          <div className="mb-1 text-sm font-bold text-slate-600">{L('Mes demandes', 'My requests')}</div>
          {!myPerson && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{L('Aucun profil employé lié à votre courriel — choisissez votre nom dans le formulaire.', 'No employee profile linked to your email — pick your name in the form.')}</div>}
          {mine.length === 0 ? <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-400">{L('Aucune demande.', 'No request yet.')}</div>
            : mine.map(c => <CongeRow key={c.id} c={c} />)}
        </div>
        </>)}
      </div>

      <style jsx>{`
        .inp { border-radius: 0.5rem; border: 1px solid rgb(226 232 240); background: transparent; padding: 0.4rem 0.6rem; font-size: 0.85rem; outline: none; }
        .inp:focus { border-color: rgb(124 58 237); box-shadow: 0 0 0 2px rgb(124 58 237 / 0.15); }
        .inp:disabled { background: rgb(248 250 252); color: rgb(100 116 139); }
      `}</style>
    </div>
  );
}
