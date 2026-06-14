'use client';

// Formulaire de PERMIS moderne GÉNÉRIQUE (réutilisé par tous les types : travail à chaud, hauteur,
// excavation, chimique, pression, électrique). Identification + sections spécifiques (config) +
// conseiller IA (/api/permits/advisor) + check-list normalisée (lib/permits/norms) + travailleurs
// (annuaire + statut formation RH) + signature superviseur. Écrit dans work_permits (visible dashboard).
import { useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Loader2, Plus, Trash2, Save, Users, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PortalHeader } from '@/components/PortalHeader';
import { getPermitNorm, PROV_LABELS, type Prov } from '@/lib/permits/norms';

export type FieldDef = { key: string; label: string; type?: 'text' | 'textarea' | 'checkbox' | 'select' | 'number'; options?: string[]; placeholder?: string; full?: boolean };
export type PermitConfig = {
  type: string; title: string; color: string;             // ex. 'text-orange-600'
  btn: string;                                             // ex. 'bg-orange-600 hover:bg-orange-700'
  intro?: string;
  sections?: { title: string; fields: FieldDef[] }[];      // sections spécifiques au type
  prefix?: string;                                         // préfixe n° permis (ex. HW, HT)
};

export default function ModernPermitForm({ config }: { config: PermitConfig }) {
  const { tenant } = useParams() as { tenant: string };
  const router = useRouter();
  const norm = getPermitNorm(config.type)!;

  const [f, setF] = useState<any>({ work: '', equipment: '', location: '', supervisor: '', project: '', province: 'QC' });
  const [extra, setExtra] = useState<Record<string, any>>({});
  const [checklist, setChecklist] = useState<Record<number, boolean>>({});
  const [workers, setWorkers] = useState<any[]>([]);
  const [people, setPeople] = useState<any[]>([]);
  const [advice, setAdvice] = useState<any>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const sigRef = useRef<{ get: () => string }>(null);

  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));
  const setX = (k: string, v: any) => setExtra(p => ({ ...p, [k]: v }));
  useEffect(() => { fetch(`/api/permits/espace-clos/people?tenant=${encodeURIComponent(tenant)}`, { credentials: 'include' }).then(r => r.ok ? r.json() : { people: [] }).then(j => setPeople(j.people || [])).catch(() => {}); }, [tenant]);

  const RISK: Record<string, string> = { 'faible': 'bg-emerald-100 text-emerald-700', 'moyen': 'bg-amber-100 text-amber-700', 'élevé': 'bg-orange-100 text-orange-700', 'critique': 'bg-red-100 text-red-700' };

  async function runAi() {
    setAiBusy(true); setErr('');
    try {
      const r = await fetch('/api/permits/advisor', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ action: 'advise', type: config.type, province: f.province, tenant, context: { work: f.work, equipment: f.equipment, location: f.location, ...extra } }),
      });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Échec IA');
      setAdvice(j.advice);
    } catch (e: any) { setErr('IA : ' + (e?.message || '')); }
    finally { setAiBusy(false); }
  }

  async function save() {
    if (!f.work.trim() && !f.equipment.trim()) { setErr('Décris au moins les travaux.'); return; }
    setSaving(true); setErr('');
    try {
      const num = `${config.prefix || 'PT'}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      const cl = norm.checklist.map((l, i) => ({ item: l, done: !!checklist[i] }));
      const done = cl.every(c => c.done);
      const data = {
        status: 'active', province: f.province,
        siteInfo: { workLocation: f.location, contractor: '', supervisor: f.supervisor },
        work_description: f.work, equipmentName: f.equipment, project_number: f.project,
        extra, checklist: cl, workers, advice,
        supervisor_signature: sigRef.current?.get() || '', signed_at: new Date().toISOString(),
        validation: { isComplete: done, percentage: done ? 100 : 70 },
        norm: { type: config.type, references: norm.references },
      };
      const { error } = await supabase.from('work_permits').insert({ permit_number: num, tenant_id: tenant, type: config.type, data });
      if (error) throw error;
      router.push(`/${tenant}/permits`);
    } catch (e: any) { setErr('Erreur : ' + (e?.message || 'enregistrement')); setSaving(false); }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalHeader tenant={tenant} />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <button onClick={() => router.push(`/${tenant}/permits`)} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"><ArrowLeft size={14} /> Permis</button>
        <h1 className={`text-2xl font-bold text-gray-900 mt-1 mb-1`}>{config.title}</h1>
        <p className="text-sm text-gray-500 mb-5">{config.intro || norm.references[0]}</p>
        {err && <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{err}</div>}

        <Sec title="1 · Identification">
          <Grid>
            <F l="Travaux à effectuer" full><textarea className="inp" rows={2} value={f.work} onChange={e => set('work', e.target.value)} /></F>
            <F l="Équipement / ouvrage concerné"><input className="inp" value={f.equipment} onChange={e => set('equipment', e.target.value)} /></F>
            <F l="Emplacement"><input className="inp" value={f.location} onChange={e => set('location', e.target.value)} /></F>
            <F l="Superviseur"><input className="inp" value={f.supervisor} onChange={e => set('supervisor', e.target.value)} /></F>
            <F l="N° de projet"><input className="inp" value={f.project} onChange={e => set('project', e.target.value)} /></F>
            <F l="Province (norme)"><select className="inp" value={f.province} onChange={e => set('province', e.target.value)}>{Object.keys(PROV_LABELS).map(p => <option key={p} value={p}>{PROV_LABELS[p as Prov]}</option>)}</select></F>
          </Grid>
        </Sec>

        {(config.sections || []).map((sec, si) => (
          <Sec key={si} title={`${si + 2} · ${sec.title}`}>
            <Grid>
              {sec.fields.map(fd => (
                <F key={fd.key} l={fd.label} full={fd.full || fd.type === 'textarea'}>
                  {fd.type === 'textarea' ? <textarea className="inp" rows={2} value={extra[fd.key] || ''} onChange={e => setX(fd.key, e.target.value)} placeholder={fd.placeholder} />
                    : fd.type === 'checkbox' ? <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={!!extra[fd.key]} onChange={e => setX(fd.key, e.target.checked)} /> {fd.placeholder || 'Oui'}</label>
                      : fd.type === 'select' ? <select className="inp" value={extra[fd.key] || ''} onChange={e => setX(fd.key, e.target.value)}><option value="">—</option>{(fd.options || []).map(o => <option key={o}>{o}</option>)}</select>
                        : <input className="inp" type={fd.type === 'number' ? 'number' : 'text'} value={extra[fd.key] || ''} onChange={e => setX(fd.key, e.target.value)} placeholder={fd.placeholder} />}
                </F>
              ))}
            </Grid>
          </Sec>
        ))}

        <Sec title={`${(config.sections?.length || 0) + 2} · Conseiller IA (dangers, contrôles, EPI, plan d’action)`} icon={<Sparkles size={16} />}>
          <button onClick={runAi} disabled={aiBusy} className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg disabled:opacity-60">{aiBusy ? <Loader2 className="animate-spin" size={15} /> : <Sparkles size={15} />} {aiBusy ? 'Analyse…' : '✦ Analyser les risques'}</button>
          {advice && (
            <div className="mt-3 space-y-3 text-sm">
              <div className="flex items-center gap-2"><span className="text-xs text-gray-500">Risque :</span><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${RISK[advice.risk_level] || 'bg-gray-100'}`}>{advice.risk_level}</span></div>
              {Array.isArray(advice.risk_evaluation) && advice.risk_evaluation.length > 0 && (
                <div className="overflow-x-auto"><table className="w-full text-xs border border-gray-200 rounded"><thead><tr className="bg-gray-50 text-gray-500"><th className="text-left p-2">Danger</th><th className="p-2">Prob.</th><th className="p-2">Gravité</th><th className="p-2">Niveau</th><th className="text-left p-2">Maîtrise</th></tr></thead><tbody>{advice.risk_evaluation.map((r: any, i: number) => <tr key={i} className="border-t border-gray-100"><td className="p-2">{r.hazard}</td><td className="p-2 text-center">{r.probability}</td><td className="p-2 text-center">{r.severity}</td><td className="p-2 text-center"><span className={`px-1.5 py-0.5 rounded ${RISK[r.level] || ''}`}>{r.level}</span></td><td className="p-2">{r.control}</td></tr>)}</tbody></table></div>
              )}
              {Array.isArray(advice.controls) && <Block title="Contrôles" items={advice.controls} cls="text-emerald-700 bg-emerald-50" />}
              {Array.isArray(advice.ppe) && <Block title="EPI" items={advice.ppe} cls="text-blue-700 bg-blue-50" />}
              {Array.isArray(advice.action_plan) && advice.action_plan.length > 0 && <div><div className="text-xs font-semibold text-gray-600 mb-1">Plan d’action</div><ol className="list-decimal ml-5 text-xs text-gray-700">{advice.action_plan.map((a: string, i: number) => <li key={i}>{a}</li>)}</ol></div>}
              {Array.isArray(advice.missing_info) && advice.missing_info.length > 0 && <div className="rounded bg-amber-50 p-2 text-xs text-amber-800">⚠ À compléter : {advice.missing_info.join(' · ')}</div>}
            </div>
          )}
        </Sec>

        <Sec title={`${(config.sections?.length || 0) + 3} · Travailleurs (annuaire + formation RH)`} icon={<Users size={16} />}>
          <WorkerPicker people={people} workers={workers} setWorkers={setWorkers} btn={config.btn} />
        </Sec>

        <Sec title={`${(config.sections?.length || 0) + 4} · Check-list pré-travaux (${norm.authorities.join('/')})`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {norm.checklist.map((c, i) => <label key={i} className="flex items-start gap-2 text-sm text-gray-700"><input type="checkbox" className="mt-0.5" checked={!!checklist[i]} onChange={e => setChecklist(p => ({ ...p, [i]: e.target.checked }))} /> {c}</label>)}
          </div>
        </Sec>

        <Sec title={`${(config.sections?.length || 0) + 5} · Signature du superviseur`} icon={<ShieldCheck size={16} />}>
          <SignaturePad ref={sigRef} />
        </Sec>

        <div className="flex justify-end gap-2 mt-6 pb-10">
          <button onClick={() => router.push(`/${tenant}/permits`)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg">Annuler</button>
          <button onClick={save} disabled={saving} className={`inline-flex items-center gap-1.5 px-5 py-2.5 ${config.btn} text-white text-sm font-semibold rounded-lg disabled:opacity-60`}><Save size={16} /> {saving ? 'Enregistrement…' : 'Émettre le permis'}</button>
        </div>
      </div>
      <style jsx>{`:global(.inp){ width:100%; padding:8px 11px; border:1px solid #d1d5db; border-radius:8px; font-size:13px; }`}</style>
    </div>
  );
}

function Sec({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) { return <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4"><h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">{icon} {title}</h2>{children}</div>; }
function Grid({ children }: { children: React.ReactNode }) { return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>; }
function F({ l, children, full }: { l: string; children: React.ReactNode; full?: boolean }) { return <div className={full ? 'sm:col-span-2' : ''}><label className="block text-xs font-medium text-gray-600 mb-1">{l}</label>{children}</div>; }
function Block({ title, items, cls }: { title: string; items: string[]; cls: string }) { return <div><div className="text-xs font-semibold text-gray-600 mb-1">{title}</div><div className="flex flex-wrap gap-1.5">{items.map((it, i) => <span key={i} className={`text-[11px] px-2 py-1 rounded ${cls}`}>{it}</span>)}</div></div>; }

function WorkerPicker({ people, workers, setWorkers, btn }: any) {
  const [sel, setSel] = useState('');
  const chosen = (people || []).find((p: any) => p.id === sel);
  const FORM: any = { ok: 'bg-emerald-100 text-emerald-700', expiring: 'bg-amber-100 text-amber-700', expired: 'bg-red-100 text-red-700', none: 'bg-gray-100 text-gray-500' };
  return (
    <div>
      <div className="flex gap-2 items-end">
        <div className="flex-1"><label className="block text-xs font-medium text-gray-600 mb-1">Ajouter un travailleur</label>
          <select className="inp" value={sel} onChange={e => setSel(e.target.value)}><option value="">— annuaire —</option>{(people || []).map((p: any) => <option key={p.id} value={p.id}>{p.name}{p.formation_status === 'expired' ? ' ⚠' : ''}</option>)}</select></div>
        <button onClick={() => { if (!chosen) return; setWorkers((w: any[]) => [...w, { name: chosen.name, id: chosen.id, formation: chosen.formation_status }]); setSel(''); }} className={`inline-flex items-center gap-1 px-3 py-2 ${btn} text-white text-sm rounded-lg`}><Plus size={14} /></button>
      </div>
      {chosen && <div className="mt-1 text-xs"><span className={`px-2 py-0.5 rounded-full ${FORM[chosen.formation_status]}`}>{chosen.formation_status === 'expired' ? `Formation EXPIRÉE : ${chosen.expired?.join(', ')}` : chosen.formation_status === 'ok' ? 'Formation à jour' : chosen.formation_status === 'expiring' ? 'Formation bientôt expirée' : 'Aucune formation au dossier'}</span></div>}
      <div className="mt-2 space-y-1">{workers.map((w: any, i: number) => <div key={i} className="flex items-center gap-2 text-sm border-b border-gray-100 py-1"><span className="font-medium">{w.name}</span>{w.formation === 'expired' && <span className="text-[10px] text-red-600">formation expirée</span>}<button onClick={() => setWorkers((arr: any[]) => arr.filter((_, j) => j !== i))} className="ml-auto text-red-500"><Trash2 size={13} /></button></div>)}</div>
      <style jsx>{`:global(.inp){ width:100%; padding:8px 11px; border:1px solid #d1d5db; border-radius:8px; font-size:13px; }`}</style>
    </div>
  );
}

const SignaturePad = forwardRef<{ get: () => string }, {}>(function SignaturePad(_p, ref) {
  const cv = useRef<HTMLCanvasElement | null>(null); const draw = useRef(false); const last = useRef<{ x: number; y: number } | null>(null);
  useImperativeHandle(ref, () => ({ get: () => cv.current?.toDataURL('image/png') || '' }));
  useEffect(() => { const c = cv.current!; const x = c.getContext('2d')!; x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); }, []);
  const pos = (e: React.PointerEvent) => { const c = cv.current!; const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) * (c.width / r.width), y: (e.clientY - r.top) * (c.height / r.height) }; };
  return (<div><canvas ref={cv} width={380} height={110} className="w-full rounded-lg border border-gray-300 bg-white touch-none" style={{ height: 110, cursor: 'crosshair' }}
    onPointerDown={e => { draw.current = true; last.current = pos(e); (e.target as Element).setPointerCapture?.(e.pointerId); }}
    onPointerMove={e => { if (!draw.current) return; const x = cv.current!.getContext('2d')!; const p = pos(e); x.strokeStyle = '#111827'; x.lineWidth = 2.2; x.lineCap = 'round'; x.beginPath(); x.moveTo(last.current!.x, last.current!.y); x.lineTo(p.x, p.y); x.stroke(); last.current = p; }}
    onPointerUp={() => { draw.current = false; }} />
    <button type="button" onClick={() => { const c = cv.current!; const x = c.getContext('2d')!; x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); }} className="mt-1 text-xs text-gray-500">Effacer</button></div>);
});
