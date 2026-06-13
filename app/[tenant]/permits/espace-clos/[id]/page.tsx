'use client';

// Espace clos — FICHE de gestion. QR permanent + mesures d'urgence + permis (cycle de vie/approbation)
// + MOTEUR ATMOSPHÉRIQUE (relevés ordonnés O2->LIE->toxiques, voyant vert/rouge, minuterie de reprise
// customisable, état VENTILER/DANGER) + REGISTRE D'ENTRÉES (timer in/out, check-list matériel, surveillants).
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import {
  Wind, ArrowLeft, Loader2, ShieldAlert, ShieldCheck, Wind as Vent, Plus, Download,
  Clock, Users, LogIn, LogOut, CheckCircle2, AlertTriangle, FileSignature, Activity,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PortalHeader } from '@/components/PortalHeader';
import { getNorm, evaluateAtmosphere, type AtmReading } from '@/lib/confinedSpace/norms';

export default function EspaceClosFiche() {
  const { tenant, id } = useParams() as { tenant: string; id: string };
  const [space, setSpace] = useState<any>(null);
  const [permits, setPermits] = useState<any[]>([]);
  const [permit, setPermit] = useState<any>(null);       // permis sélectionné (actif)
  const [readings, setReadings] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const [people, setPeople] = useState<any[]>([]);

  // Annuaire du personnel + statut de formation (module RH) pour pré-remplir les entrants.
  useEffect(() => {
    fetch(`/api/permits/espace-clos/people?tenant=${encodeURIComponent(tenant)}`, { credentials: 'include' })
      .then(r => (r.ok ? r.json() : { people: [] })).then(j => setPeople(j.people || [])).catch(() => {});
  }, [tenant]);

  const norm = useMemo(() => getNorm(space?.province), [space?.province]);
  const retestMin = permit?.retest_minutes || space?.retest_minutes || norm.defaultRetestMinutes;

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  async function load() {
    setLoading(true);
    const { data: sp } = await supabase.from('confined_spaces').select('*').eq('id', id).maybeSingle();
    setSpace(sp);
    const { data: pm } = await supabase.from('cs_permits').select('*').eq('space_id', id).order('created_at', { ascending: false });
    setPermits(pm || []);
    const active = (pm || []).find((p: any) => ['active', 'approved', 'pending_approval', 'draft'].includes(p.status)) || (pm || [])[0] || null;
    setPermit(active);
    if (active) await loadPermitChildren(active.id);
    else { setReadings([]); setEntries([]); }
    setLoading(false);
  }
  async function loadPermitChildren(pid: string) {
    const [{ data: rd }, { data: en }] = await Promise.all([
      supabase.from('cs_atm_readings').select('*').eq('permit_id', pid).order('taken_at', { ascending: false }),
      supabase.from('cs_entries').select('*').eq('permit_id', pid).order('created_at', { ascending: false }),
    ]);
    setReadings(rd || []); setEntries(en || []);
  }
  useEffect(() => { load(); }, [id]);

  if (loading) return <Shell tenant={tenant}><div className="flex items-center gap-2 text-gray-400 text-sm"><Loader2 className="animate-spin" size={16} /> Chargement…</div></Shell>;
  if (!space) return <Shell tenant={tenant}><div className="text-gray-400">Espace clos introuvable. <Link className="text-cyan-600 underline" href={`/${tenant}/permits/espace-clos`}>Retour</Link></div></Shell>;

  const scanUrl = typeof window !== 'undefined' ? `${window.location.origin}/scan/espace-clos/${tenant}/${id}` : '';
  const lastReading = readings[0];
  const lastEval = lastReading ? { ok: lastReading.result === 'safe', failures: lastReading.failures || [] } : null;
  const dueAt = lastReading?.next_due_at ? new Date(lastReading.next_due_at).getTime() : null;
  const overdue = dueAt != null && now > dueAt;
  const secsLeft = dueAt != null ? Math.max(0, Math.round((dueAt - now) / 1000)) : null;
  const openEntrants = entries.filter(e => e.entered_at && !e.exited_at);
  const attendants = entries.filter(e => e.role === 'attendant' || e.role === 'surveillant');

  // État global de l'atmosphère (pilote le gros voyant).
  const atmState: 'none' | 'safe' | 'danger' | 'recheck' =
    !lastReading ? 'none' : (lastReading.result === 'danger' ? 'danger' : (overdue ? 'recheck' : 'safe'));

  async function createPermit() {
    const num = `EC-${(space.space_code || 'P')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const { data, error } = await supabase.from('cs_permits').insert({
      tenant_id: tenant, space_id: id, permit_number: num, province: space.province, status: 'draft',
      retest_minutes: space.retest_minutes || norm.defaultRetestMinutes, work_description: '',
    }).select('*').single();
    if (!error && data) { setPermit(data); setPermits(p => [data, ...p]); await loadPermitChildren(data.id); }
  }
  async function setPermitStatus(patch: any) {
    if (!permit) return;
    const { data } = await supabase.from('cs_permits').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', permit.id).select('*').single();
    if (data) { setPermit(data); setPermits(ps => ps.map(p => p.id === data.id ? data : p)); }
  }

  return (
    <Shell tenant={tenant}>
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div>
          <Link href={`/${tenant}/permits/espace-clos`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"><ArrowLeft size={14} /> Espaces clos</Link>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 mt-1"><Wind className="text-cyan-600" /> {space.name}</h1>
          <p className="text-sm text-gray-500 font-mono">{space.space_code} · {space.location || '—'} · {norm.label}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Colonne gauche : moteur atmosphérique + entrées (cœur opérationnel) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Permis */}
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2"><FileSignature size={16} /> Permis d’entrée</h2>
              {permit ? <StatusBadge status={permit.status} /> : <button onClick={createPermit} className="inline-flex items-center gap-1 px-3 py-1.5 bg-cyan-600 text-white text-sm rounded-lg"><Plus size={14} /> Ouvrir un permis</button>}
            </div>
            {permit && (
              <div className="mt-3 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Description des travaux"><input defaultValue={permit.work_description || ''} onBlur={e => setPermitStatus({ work_description: e.target.value })} className="inp" placeholder="Travaux à effectuer…" /></Field>
                  <Field label="Superviseur"><input defaultValue={permit.supervisor_name || ''} onBlur={e => setPermitStatus({ supervisor_name: e.target.value })} className="inp" /></Field>
                  <Field label={`Reprise atmosphérique (min) — défaut ${norm.defaultRetestMinutes}`}><input type="number" min={1} defaultValue={retestMin} onBlur={e => setPermitStatus({ retest_minutes: Number(e.target.value) || norm.defaultRetestMinutes })} className="inp" /></Field>
                  <Field label="Entrants prévus"><input type="number" min={1} defaultValue={permit.entrants_expected || ''} onBlur={e => setPermitStatus({ entrants_expected: Number(e.target.value) || null })} className="inp" /></Field>
                </div>
                <div className="flex flex-wrap gap-2">
                  {permit.status === 'draft' && <button onClick={() => setPermitStatus({ status: 'pending_approval' })} className="btn-amber">Soumettre à l’approbation</button>}
                  {(permit.status === 'pending_approval' || permit.status === 'draft') && <button onClick={() => { const by = prompt('Nom du superviseur qui approuve :'); if (by) setPermitStatus({ status: 'approved', approved_by: by, approved_at: new Date().toISOString() }); }} className="btn-emerald"><ShieldCheck size={14} /> Approuver (superviseur)</button>}
                  {permit.status === 'approved' && <button onClick={() => setPermitStatus({ status: 'active', valid_from: new Date().toISOString() })} className="btn-cyan"><Activity size={14} /> Activer le permis</button>}
                  {permit.status === 'active' && <button onClick={() => { if (openEntrants.length) { alert('Tous les entrants doivent être sortis avant de fermer.'); return; } setPermitStatus({ status: 'closed', closed_at: new Date().toISOString() }); }} className="btn-gray">Fermer le permis</button>}
                </div>
                {permit.approved_by && <p className="text-xs text-emerald-600">✓ Approuvé par {permit.approved_by} le {fmt(permit.approved_at)}</p>}
              </div>
            )}
          </Card>

          {/* MOTEUR ATMOSPHÉRIQUE */}
          {permit && permit.status === 'active' && (
            <AtmPanel
              norm={norm} retestMin={retestMin} atmState={atmState} secsLeft={secsLeft} lastReading={lastReading} lastEval={lastEval}
              readings={readings}
              onAdd={async (r: any) => {
                const ev = evaluateAtmosphere(r.reading, norm, space.custom_limits || undefined);
                const taken = new Date();
                const next = new Date(taken.getTime() + retestMin * 60000);
                await supabase.from('cs_atm_readings').insert({
                  permit_id: permit.id, tenant_id: tenant, taken_by: r.takenBy || null, point: r.point,
                  o2: r.reading.o2 ?? null, lel: r.reading.lel ?? null, h2s: r.reading.h2s ?? null, co: r.reading.co ?? null,
                  result: ev.status, failures: ev.failures, taken_at: taken.toISOString(), next_due_at: next.toISOString(),
                });
                await loadPermitChildren(permit.id);
              }}
            />
          )}

          {/* REGISTRE D'ENTRÉES */}
          {permit && permit.status === 'active' && (
            <EntriesPanel
              norm={norm} entries={entries} openEntrants={openEntrants} attendants={attendants} atmState={atmState} people={people}
              onAdd={async (e: any) => { await supabase.from('cs_entries').insert({ permit_id: permit.id, tenant_id: tenant, person_name: e.name, person_user_id: e.personId || null, role: e.role, equipment_in: e.equipment, entered_at: e.role === 'entrant' ? new Date().toISOString() : null }); await loadPermitChildren(permit.id); }}
              onIn={async (id2: string) => { await supabase.from('cs_entries').update({ entered_at: new Date().toISOString() }).eq('id', id2); await loadPermitChildren(permit.id); }}
              onOut={async (id2: string, returned: boolean) => { await supabase.from('cs_entries').update({ exited_at: new Date().toISOString(), equipment_returned: returned }).eq('id', id2); await loadPermitChildren(permit.id); }}
              now={now}
            />
          )}
        </div>

        {/* Colonne droite : QR + risques + mesures d'urgence */}
        <div className="space-y-5">
          <Card>
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><svg width="0" height="0" /> Code QR de l’espace</h2>
            <div className="flex flex-col items-center gap-3">
              <div id="ec-qr" className="bg-white p-3 rounded-xl border"><QRCodeSVG value={scanUrl} size={170} level="M" /></div>
              <p className="text-[11px] text-gray-500 text-center">Colle ce QR sur l’accès. Scanné (connecté ou non), il montre l’état live, les dernières mesures, l’historique des entrées et les mesures d’urgence.</p>
              <button onClick={() => downloadQR('ec-qr', space.space_code)} className="inline-flex items-center gap-1.5 text-sm text-cyan-700 hover:underline"><Download size={14} /> Télécharger le QR</button>
              <a href={scanUrl} target="_blank" rel="noreferrer" className="text-xs text-gray-400 hover:underline break-all">{scanUrl}</a>
            </div>
          </Card>

          {/* Caractérisation complète */}
          <Card>
            <h2 className="font-semibold text-gray-900 mb-2">Caractérisation</h2>
            {space.photo_url && <img src={space.photo_url} alt="" className="w-full h-36 object-cover rounded-lg border mb-2" />}
            <div className="text-xs text-gray-600 space-y-1">
              {space.characteristics?.usage && <p><b>Usage :</b> {space.characteristics.usage}</p>}
              {space.characteristics?.synthese && <p>{space.characteristics.synthese}</p>}
              {space.characteristics?.dimensions?.volume_m3 ? <p><b>Volume :</b> {space.characteristics.dimensions.volume_m3} m³</p> : null}
              {space.characteristics?.contents?.previous && <p><b>Dernier contenu :</b> {space.characteristics.contents.previous}</p>}
              {space.characteristics?.ventilation && <p><b>Ventilation :</b> {space.characteristics.ventilation}</p>}
            </div>
            {Array.isArray(space.characteristics?.risk_evaluation) && space.characteristics.risk_evaluation.length > 0 && (
              <div className="mt-2 overflow-x-auto"><table className="w-full text-[11px] border border-gray-200 rounded"><thead><tr className="bg-gray-50 text-gray-500"><th className="text-left p-1.5">Danger</th><th className="p-1.5">Niveau</th></tr></thead><tbody>{space.characteristics.risk_evaluation.map((r: any, i: number) => <tr key={i} className="border-t border-gray-100"><td className="p-1.5">{r.hazard}</td><td className="p-1.5 text-center">{r.level}</td></tr>)}</tbody></table></div>
            )}
            {Array.isArray(space.characteristics?.action_plan) && space.characteristics.action_plan.length > 0 && (
              <details className="mt-2"><summary className="text-xs font-semibold text-gray-600 cursor-pointer">Plan d’action ({space.characteristics.action_plan.length})</summary><ol className="list-decimal ml-5 text-[11px] text-gray-600 mt-1 space-y-0.5">{space.characteristics.action_plan.map((a: string, i: number) => <li key={i}>{a}</li>)}</ol></details>
            )}
            {Array.isArray(space.characteristics?.missing_info) && space.characteristics.missing_info.length > 0 && (
              <div className="mt-2 text-[11px] text-amber-700 bg-amber-50 rounded p-2">⚠ À compléter : {space.characteristics.missing_info.join(' · ')}</div>
            )}
          </Card>

          <Card>
            <h2 className="font-semibold text-gray-900 mb-2">Dangers & contrôles</h2>
            {Array.isArray(space.hazards) && space.hazards.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mb-2">{space.hazards.map((h: string, i: number) => <span key={i} className="text-[11px] px-2 py-1 rounded bg-red-50 text-red-700">{h}</span>)}</div>
            ) : <p className="text-xs text-gray-400">Aucun danger renseigné.</p>}
            {Array.isArray(space.characteristics?.controls) && space.characteristics.controls.length > 0 && (
              <div className="flex flex-wrap gap-1.5">{space.characteristics.controls.map((c: string, i: number) => <span key={i} className="text-[11px] px-2 py-1 rounded bg-emerald-50 text-emerald-700">{c}</span>)}</div>
            )}
          </Card>

          <Card>
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-2"><ShieldAlert size={16} className="text-red-600" /> Mesures d’urgence / sauvetage</h2>
            {space.emergency?.strategy || space.emergency?.type ? (
              <div className="text-sm text-gray-700 space-y-1">
                {space.emergency.type && <p className="text-xs"><b>Type : </b>{space.emergency.type}{space.emergency.response_min ? ` · délai visé ${space.emergency.response_min} min` : ''}</p>}
                {space.emergency.strategy && <p>{space.emergency.strategy}</p>}
                {Array.isArray(space.emergency.equipment) && space.emergency.equipment.length > 0 && <p className="text-xs text-gray-500"><b>Équipement : </b>{space.emergency.equipment.join(', ')}</p>}
                {space.emergency.team && <p className="text-xs text-gray-500"><b>Équipe : </b>{space.emergency.team}</p>}
                {space.emergency.communication_plan && <p className="text-xs text-gray-500"><b>Communication : </b>{space.emergency.communication_plan}</p>}
                {space.emergency.contacts && <p className="text-xs text-gray-500"><b>Contacts : </b>{space.emergency.contacts}</p>}
                {space.emergency.hospital?.name && <p className="text-xs text-gray-500"><b>Hôpital : </b>{space.emergency.hospital.name}{space.emergency.hospital.phone ? ` · ${space.emergency.hospital.phone}` : ''}{space.emergency.hospital.distance_km ? ` · ${space.emergency.hospital.distance_km} km` : ''}</p>}
              </div>
            ) : <p className="text-xs text-gray-400">À compléter (utilise le conseiller IA à la création).</p>}
            <p className="text-[11px] text-gray-400 mt-2">Norme : {norm.regulations[0]}</p>
          </Card>
        </div>
      </div>

      <style jsx>{`
        :global(.inp){ width:100%; padding:8px 11px; border:1px solid #d1d5db; border-radius:8px; font-size:13px; }
        :global(.btn-amber),:global(.btn-emerald),:global(.btn-cyan),:global(.btn-gray){ display:inline-flex; align-items:center; gap:6px; padding:8px 14px; border-radius:8px; font-size:13px; font-weight:600; color:#fff; }
        :global(.btn-amber){ background:#d97706; } :global(.btn-emerald){ background:#059669; } :global(.btn-cyan){ background:#0891b2; } :global(.btn-gray){ background:#6b7280; }
      `}</style>
    </Shell>
  );
}

// ── Moteur atmosphérique ──
function AtmPanel({ norm, retestMin, atmState, secsLeft, lastReading, lastEval, readings, onAdd }: any) {
  const [r, setR] = useState<{ o2?: string; lel?: string; h2s?: string; co?: string }>({});
  const [point, setPoint] = useState(norm.samplingPoints[0]);
  const [takenBy, setTakenBy] = useState('');
  const [busy, setBusy] = useState(false);
  const num = (v?: string) => (v == null || v === '' ? null : Number(v));

  const banner = atmState === 'danger'
    ? { bg: 'bg-red-600', txt: '⚠ DANGER — NE PAS ENTRER · VENTILER ET REPRENDRE', icon: <AlertTriangle /> }
    : atmState === 'recheck'
      ? { bg: 'bg-amber-500', txt: '⏱ REPRISE REQUISE — refaire un relevé avant d’entrer', icon: <Clock /> }
      : atmState === 'safe'
        ? { bg: 'bg-emerald-600', txt: '✓ ATMOSPHÈRE CONFORME — entrée permise', icon: <ShieldCheck /> }
        : { bg: 'bg-gray-400', txt: 'Aucun relevé — effectuer le premier test avant toute entrée', icon: <Wind /> };

  return (
    <Card>
      <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Vent size={16} /> Conditions atmosphériques</h2>
      <div className={`mt-3 rounded-xl ${banner.bg} text-white px-4 py-3 flex items-center gap-3`}>
        <div className="shrink-0">{banner.icon}</div>
        <div className="font-semibold text-sm flex-1">{banner.txt}</div>
        {atmState === 'safe' && secsLeft != null && <div className="text-right"><div className="text-2xl font-bold tabular-nums">{mmss(secsLeft)}</div><div className="text-[10px] opacity-80">avant reprise</div></div>}
      </div>

      {lastReading && (
        <div className="mt-3 text-xs text-gray-600">
          Dernier relevé {fmt(lastReading.taken_at)} · {lastReading.point} ·
          {' '}O₂ {fmtN(lastReading.o2)}% · LIE {fmtN(lastReading.lel)}% · H₂S {fmtN(lastReading.h2s)} · CO {fmtN(lastReading.co)}
          {lastEval && !lastEval.ok && <span className="text-red-600 font-medium"> — Hors limites : {lastEval.failures.map((f: any) => `${f.label} ${f.value} (${f.limit})`).join(', ')}</span>}
        </div>
      )}

      <div className="mt-4 rounded-lg border border-gray-200 p-3">
        <div className="text-xs font-semibold text-gray-600 mb-2">Nouveau relevé — ordre : {norm.testOrder.join(' → ')}</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <L l="O₂ (%)"><input className="inp" inputMode="decimal" value={r.o2 || ''} onChange={e => setR({ ...r, o2: e.target.value })} /></L>
          <L l="LIE (%)"><input className="inp" inputMode="decimal" value={r.lel || ''} onChange={e => setR({ ...r, lel: e.target.value })} /></L>
          <L l="H₂S (ppm)"><input className="inp" inputMode="decimal" value={r.h2s || ''} onChange={e => setR({ ...r, h2s: e.target.value })} /></L>
          <L l="CO (ppm)"><input className="inp" inputMode="decimal" value={r.co || ''} onChange={e => setR({ ...r, co: e.target.value })} /></L>
          <L l="Point de prélèvement"><select className="inp" value={point} onChange={e => setPoint(e.target.value)}>{norm.samplingPoints.map((p: string) => <option key={p}>{p}</option>)}</select></L>
          <L l="Mesuré par"><input className="inp" value={takenBy} onChange={e => setTakenBy(e.target.value)} /></L>
        </div>
        <button disabled={busy} onClick={async () => { setBusy(true); await onAdd({ reading: { o2: num(r.o2), lel: num(r.lel), h2s: num(r.h2s), co: num(r.co) }, point, takenBy }); setR({}); setBusy(false); }}
          className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-600 text-white text-sm font-medium rounded-lg disabled:opacity-60">{busy ? 'Enregistrement…' : 'Enregistrer le relevé'}</button>
      </div>

      {readings.length > 1 && (
        <details className="mt-3"><summary className="text-xs text-gray-500 cursor-pointer">Historique ({readings.length})</summary>
          <div className="mt-2 space-y-1 max-h-48 overflow-auto">{readings.map((rd: any) => (
            <div key={rd.id} className="text-[11px] flex items-center gap-2 border-b border-gray-100 py-1">
              <span className={`w-2 h-2 rounded-full ${rd.result === 'safe' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className="text-gray-500">{fmt(rd.taken_at)}</span><span className="text-gray-400">{rd.point}</span>
              <span>O₂ {fmtN(rd.o2)} · LIE {fmtN(rd.lel)} · H₂S {fmtN(rd.h2s)} · CO {fmtN(rd.co)}</span>
            </div>
          ))}</div>
        </details>
      )}
      <style jsx>{`:global(.inp){ width:100%; padding:7px 9px; border:1px solid #d1d5db; border-radius:8px; font-size:13px; }`}</style>
    </Card>
  );
}

// ── Registre d'entrées (interconnecté annuaire + RH formations + cumuls de temps) ──
function EntriesPanel({ norm, entries, openEntrants, attendants, atmState, people, onAdd, onIn, onOut, now }: any) {
  const [sel, setSel] = useState('');        // id personnel sélectionné, ou '' (custom)
  const [name, setName] = useState('');
  const [role, setRole] = useState('entrant');
  const [equip, setEquip] = useState('');
  const [personId, setPersonId] = useState<string | null>(null);
  const needAttendants = Math.ceil(openEntrants.length / (norm.attendantPerEntrants || 2));
  const attendantOk = attendants.length >= needAttendants;

  const chosen = (people || []).find((p: any) => p.id === sel);
  function pick(v: string) {
    setSel(v);
    const p = (people || []).find((x: any) => x.id === v);
    if (p) { setName(p.name); setPersonId(p.id); } else { setPersonId(null); }
  }

  // Cumuls de temps : par personne (toutes ses entrées) + total général. min(entrée->sortie/now).
  const totals = useMemo(() => {
    const per: Record<string, number> = {}; let grand = 0;
    for (const e of entries) {
      if (!e.entered_at) continue;
      const end = e.exited_at ? new Date(e.exited_at).getTime() : now;
      const m = Math.max(0, Math.round((end - new Date(e.entered_at).getTime()) / 60000));
      per[e.person_name] = (per[e.person_name] || 0) + m; grand += m;
    }
    return { per, grand };
  }, [entries, now]);

  const FORM = { ok: { c: 'bg-emerald-100 text-emerald-700', t: 'Formation à jour' }, expiring: { c: 'bg-amber-100 text-amber-700', t: 'Formation bientôt expirée' }, expired: { c: 'bg-red-100 text-red-700', t: 'Formation EXPIRÉE' }, none: { c: 'bg-gray-100 text-gray-500', t: 'Aucune formation au dossier' } } as const;

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Users size={16} /> Registre des entrants</h2>
        <span className="text-xs text-gray-500">{openEntrants.length} à l’intérieur · {attendants.length} surveillant(s)</span>
      </div>
      {!attendantOk && openEntrants.length > 0 && <div className="mt-2 text-xs text-amber-700 bg-amber-50 rounded p-2">⚠ Surveillance insuffisante : {needAttendants} surveillant(s) requis pour {openEntrants.length} entrant(s) ({norm.label}).</div>}
      {atmState !== 'safe' && <div className="mt-2 text-xs text-red-700 bg-red-50 rounded p-2">⚠ L’atmosphère n’est pas confirmée conforme — aucune entrée ne devrait avoir lieu.</div>}

      <div className="mt-3 rounded-lg border border-gray-200 p-3 grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
        <L l="Personne (annuaire)">
          <select className="inp" value={sel} onChange={e => pick(e.target.value)}>
            <option value="">— Saisir un nom —</option>
            {(people || []).map((p: any) => <option key={p.id} value={p.id}>{p.name}{p.formation_status === 'expired' ? ' ⚠' : ''}</option>)}
          </select>
        </L>
        <L l="Nom"><input className="inp" value={name} onChange={e => { setName(e.target.value); setSel(''); setPersonId(null); }} /></L>
        <L l="Rôle"><select className="inp" value={role} onChange={e => setRole(e.target.value)}><option value="entrant">Entrant</option><option value="attendant">Surveillant</option></select></L>
        <L l="Matériel entré (,)"><input className="inp" value={equip} onChange={e => setEquip(e.target.value)} placeholder="détecteur, harnais…" /></L>
      </div>
      {/* Pré-remplissage formation RH */}
      {chosen && (
        <div className="mt-2 flex items-center gap-2 flex-wrap text-xs">
          <span className={`px-2 py-0.5 rounded-full font-semibold ${FORM[chosen.formation_status as keyof typeof FORM].c}`}>{FORM[chosen.formation_status as keyof typeof FORM].t}</span>
          {chosen.expired?.length > 0 && <span className="text-red-600">Expiré : {chosen.expired.join(', ')}</span>}
          {chosen.expiring?.length > 0 && <span className="text-amber-600">Bientôt : {chosen.expiring.join(', ')}</span>}
          {chosen.certifications?.length > 0 && <span className="text-gray-400">({chosen.certifications.length} formation(s) au dossier RH)</span>}
        </div>
      )}
      <div className="mt-2">
        <button onClick={async () => { if (!name.trim()) return; await onAdd({ name: name.trim(), personId, role, equipment: equip.split(',').map(s => s.trim()).filter(Boolean) }); setName(''); setEquip(''); setSel(''); setPersonId(null); }} className="inline-flex justify-center items-center gap-1 px-3 py-2 bg-cyan-600 text-white text-sm rounded-lg"><Plus size={14} /> Ajouter au registre</button>
      </div>

      <div className="mt-3 space-y-1.5">
        {entries.length === 0 && <p className="text-xs text-gray-400">Aucun entrant.</p>}
        {entries.map((e: any) => {
          const inside = e.entered_at && !e.exited_at;
          const dur = e.entered_at ? Math.round(((e.exited_at ? new Date(e.exited_at).getTime() : now) - new Date(e.entered_at).getTime()) / 60000) : 0;
          return (
            <div key={e.id} className="flex items-center gap-2 text-sm border-b border-gray-100 py-1.5">
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${e.role === 'entrant' ? 'bg-cyan-100 text-cyan-700' : 'bg-violet-100 text-violet-700'}`}>{e.role === 'entrant' ? 'Entrant' : 'Surveillant'}</span>
              <span className="font-medium text-gray-800">{e.person_name}</span>
              {Array.isArray(e.equipment_in) && e.equipment_in.length > 0 && <span className="text-[11px] text-gray-400 truncate">🧰 {e.equipment_in.join(', ')}</span>}
              <span className="ml-auto text-xs text-gray-500">
                {!e.entered_at ? '—' : inside ? <span className="text-emerald-600 font-medium"><Clock size={11} className="inline" /> {dur} min</span> : <span className="text-gray-400">sorti ({dur} min)</span>}
              </span>
              {e.role === 'entrant' && !e.entered_at && <button onClick={() => onIn(e.id)} className="text-xs text-emerald-600 inline-flex items-center gap-0.5"><LogIn size={13} /> Entrer</button>}
              {inside && <button onClick={() => onOut(e.id, confirm('Tout le matériel entré est-il ressorti ? OK = oui'))} className="text-xs text-red-600 inline-flex items-center gap-0.5"><LogOut size={13} /> Sortir</button>}
              {e.exited_at && (e.equipment_returned ? <CheckCircle2 size={14} className="text-emerald-500" /> : <AlertTriangle size={14} className="text-amber-500" />)}
            </div>
          );
        })}
      </div>

      {/* Cumuls de temps */}
      {Object.keys(totals.per).length > 0 && (
        <div className="mt-3 rounded-lg bg-gray-50 p-3">
          <div className="text-xs font-semibold text-gray-600 mb-1">Temps cumulé par personne</div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-700">
            {Object.entries(totals.per).map(([n, m]) => <span key={n}><b>{n}</b> : {fmtDur(m as number)}</span>)}
          </div>
          <div className="mt-2 text-sm font-semibold text-gray-900">Cumul total des entrées : {fmtDur(totals.grand)}</div>
        </div>
      )}
      <style jsx>{`:global(.inp){ width:100%; padding:7px 9px; border:1px solid #d1d5db; border-radius:8px; font-size:13px; }`}</style>
    </Card>
  );
}

function fmtDur(min: number) { const h = Math.floor(min / 60), m = min % 60; return h > 0 ? `${h} h ${m} min` : `${m} min`; }

// ── Petits utilitaires UI ──
function Shell({ tenant, children }: { tenant: string; children: React.ReactNode }) {
  return <div className="min-h-screen bg-gray-50"><PortalHeader tenant={tenant} /><div className="max-w-6xl mx-auto px-4 py-6">{children}</div></div>;
}
function Card({ children }: { children: React.ReactNode }) { return <div className="bg-white rounded-xl border border-gray-200 p-4">{children}</div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div><label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>{children}</div>; }
function L({ l, children }: { l: string; children: React.ReactNode }) { return <div><label className="block text-[11px] font-medium text-gray-500 mb-1">{l}</label>{children}</div>; }
function StatusBadge({ status }: { status: string }) {
  const m: Record<string, string> = { draft: 'bg-gray-100 text-gray-600', pending_approval: 'bg-amber-100 text-amber-700', approved: 'bg-blue-100 text-blue-700', active: 'bg-emerald-100 text-emerald-700', closed: 'bg-gray-200 text-gray-500', cancelled: 'bg-red-100 text-red-700' };
  const l: Record<string, string> = { draft: 'Brouillon', pending_approval: 'En attente', approved: 'Approuvé', active: 'Actif', closed: 'Fermé', cancelled: 'Annulé' };
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${m[status] || 'bg-gray-100'}`}>{l[status] || status}</span>;
}
function fmt(s?: string) { return s ? new Date(s).toLocaleString('fr-CA', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'; }
function fmtN(v: any) { return v == null ? '—' : v; }
function mmss(s: number) { const m = Math.floor(s / 60), ss = s % 60; return `${m}:${String(ss).padStart(2, '0')}`; }
function downloadQR(id: string, code?: string) {
  const svg = document.getElementById(id)?.querySelector('svg'); if (!svg) return;
  const xml = new XMLSerializer().serializeToString(svg); const blob = new Blob([xml], { type: 'image/svg+xml' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `qr-espace-clos-${code || ''}.svg`; a.click(); URL.revokeObjectURL(a.href);
}
