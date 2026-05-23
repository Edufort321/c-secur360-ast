'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, Send, Loader2, Plus, Trash2,
  Search, Briefcase, Settings2, Wrench, MoreHorizontal, Car, Building2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PortalHeader } from '@/components/PortalHeader';

type Entry = {
  id: string; date: string;
  category: 'project' | 'admin' | 'atelier' | 'autre';
  project_id: string; project_number: string; project_title: string; client_name: string;
  description: string; hrs_regular: number; hrs_overtime: number; hrs_premium: number;
  km: number; vehicle_id: string; vehicle_type: string; vehicle_name: string; materiel: number;
};
type Project = { id: string; project_number: string; title: string | null; client_name: string | null };
type Rate    = { code: string; rate_regular: number; rate_overtime: number; rate_premium: number };
type Vehicle = { id: string; name: string; make: string; model: string; type: string };
type Sheet   = { id: string; tenant_id: string; employee_name: string; employee_email: string; period_start: string; period_end: string; status: string; notes: string };

const CATS = [
  { k: 'project', label: 'Projet',          icon: Briefcase },
  { k: 'admin',   label: 'Administration',   icon: Settings2 },
  { k: 'atelier', label: 'Atelier',          icon: Wrench },
  { k: 'autre',   label: 'Autre',            icon: MoreHorizontal },
] as const;

const money = (n: number) => `${(Math.round(n * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $`;

function newEntry(date: string, rateCode: string): Entry {
  return { id: `e_${Date.now()}_${Math.random()}`, date, category: 'project', project_id: '', project_number: '', project_title: '', client_name: '', description: '', hrs_regular: 0, hrs_overtime: 0, hrs_premium: 0, km: 0, vehicle_id: '', vehicle_type: '', vehicle_name: '', materiel: 0 };
}

export default function TimesheetDetailPage() {
  const params  = useParams();
  const router  = useRouter();
  const tenant  = (params?.tenant as string) || 'demo';
  const sheetId = params?.id as string;

  const [sheet, setSheet]     = useState<Sheet | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [rates, setRates]     = useState<Rate[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [kmRate, setKmRate]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [notice, setNotice]   = useState<string | null>(null);

  // Project search state per row
  const [projSearch, setProjSearch] = useState<Record<string, string>>({});
  const [projOpen, setProjOpen]     = useState<Record<string, boolean>>({});
  const projRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    let active = true;
    (async () => {
      const [{ data: sh }, { data: ents }, { data: r }, { data: p }, { data: v }, { data: s }] = await Promise.all([
        supabase.from('timesheets').select('*').eq('id', sheetId).single(),
        supabase.from('timesheet_entries').select('*').eq('timesheet_id', sheetId).order('sort_order').order('date'),
        supabase.from('labor_rates').select('code,rate_regular,rate_overtime,rate_premium').eq('tenant_id', tenant).order('code'),
        supabase.from('projects').select('id,project_number,title,client_name').eq('tenant_id', tenant).order('created_at', { ascending: false }),
        supabase.from('vehicles').select('id,name,make,model,type').eq('tenant_id', tenant).eq('active', true),
        supabase.from('rate_settings').select('category,key,value').eq('tenant_id', tenant),
      ]);
      if (!active) return;
      setSheet(sh);
      setEntries(ents?.length ? ents : []);
      setRates(r || []);
      setProjects(p || []);
      setVehicles(v || []);
      const kmRow = (s || []).find((x: any) => x.category === 'km');
      setKmRate(kmRow ? Number(kmRow.value) : 0);

      // Initialise project search labels
      const init: Record<string, string> = {};
      (ents || []).forEach((e: Entry) => { if (e.project_number) init[e.id] = `${e.project_number}${e.project_title ? ' — ' + e.project_title : ''}`; });
      setProjSearch(init);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [sheetId, tenant]);

  // Close dropdowns on outside click
  useEffect(() => {
    function close(e: MouseEvent) {
      Object.entries(projRefs.current).forEach(([id, el]) => {
        if (el && !el.contains(e.target as Node)) setProjOpen(o => ({ ...o, [id]: false }));
      });
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const rateMap = useMemo(() => Object.fromEntries(rates.map(r => [r.code, r])), [rates]);
  const vehicleMap = useMemo(() => Object.fromEntries(vehicles.map(v => [v.id, v])), [vehicles]);

  function filteredProjects(search: string) {
    const q = (search || '').trim().toLowerCase();
    if (!q) return projects.slice(0, 8);
    return projects.filter(p =>
      [p.project_number, p.title, p.client_name]
        .some(v => v?.toLowerCase().includes(q))
    ).slice(0, 10);
  }

  function pickProject(entryId: string, p: Project) {
    setEntries(prev => prev.map(e => e.id !== entryId ? e : {
      ...e,
      project_id: p.id,
      project_number: p.project_number,
      project_title: p.title || '',
      client_name: p.client_name || '',
      description: e.description || p.title || '',
    }));
    setProjSearch(s => ({ ...s, [entryId]: `${p.project_number}${p.title ? ' — ' + p.title : ''}` }));
    setProjOpen(o => ({ ...o, [entryId]: false }));
  }

  function updEntry(id: string, k: keyof Entry, v: any) {
    setEntries(prev => prev.map(e => e.id !== id ? e : { ...e, [k]: v }));
  }

  function updVehicle(id: string, vehicleId: string) {
    const v = vehicleMap[vehicleId];
    setEntries(prev => prev.map(e => e.id !== id ? e : {
      ...e, vehicle_id: vehicleId,
      vehicle_type: v?.type || '',
      vehicle_name: v ? (`${v.make} ${v.model}`.trim() || v.name) : '',
    }));
  }

  function addEntry() {
    const date = sheet ? sheet.period_start : new Date().toISOString().slice(0, 10);
    setEntries(p => [...p, newEntry(date, rates[0]?.code || '')]);
  }

  function entryKmRate(e: Entry) {
    if (e.vehicle_type === 'company') return 0;
    return kmRate;
  }

  function entryCost(e: Entry, rCode?: string) {
    const r = rateMap[rCode || ''] || rates[0];
    if (!r) return 0;
    const labor = Number(e.hrs_regular) * Number(r.rate_regular)
      + Number(e.hrs_overtime) * Number(r.rate_overtime)
      + Number(e.hrs_premium)  * Number(r.rate_premium);
    return labor + Number(e.km) * entryKmRate(e) + Number(e.materiel);
  }

  const totals = useMemo(() => entries.reduce((acc, e) => ({
    hrs_regular:  acc.hrs_regular  + Number(e.hrs_regular),
    hrs_overtime: acc.hrs_overtime + Number(e.hrs_overtime),
    hrs_premium:  acc.hrs_premium  + Number(e.hrs_premium),
    km_personal:  acc.km_personal  + (e.vehicle_type !== 'company' ? Number(e.km) : 0),
    km_company:   acc.km_company   + (e.vehicle_type === 'company' ? Number(e.km) : 0),
    amount:       acc.amount       + entryCost(e),
  }), { hrs_regular: 0, hrs_overtime: 0, hrs_premium: 0, km_personal: 0, km_company: 0, amount: 0 }), [entries, rateMap, kmRate]);

  async function save(submit = false) {
    if (!sheet) return;
    setSaving(true); setNotice(null);
    try {
      // Upsert entries
      await supabase.from('timesheet_entries').delete().eq('timesheet_id', sheetId);
      if (entries.length) {
        await supabase.from('timesheet_entries').insert(
          entries.map((e, i) => ({ ...e, timesheet_id: sheetId, tenant_id: tenant, sort_order: i }))
        );
      }
      const update: any = {
        total_regular: totals.hrs_regular, total_overtime: totals.hrs_overtime,
        total_premium: totals.hrs_premium, total_km: totals.km_personal + totals.km_company,
        total_km_personal: totals.km_personal, total_amount: totals.amount,
        updated_at: new Date().toISOString(),
      };
      if (submit) { update.status = 'submitted'; update.submitted_at = new Date().toISOString(); }
      await supabase.from('timesheets').update(update).eq('id', sheetId);
      setNotice(submit ? 'Feuille soumise au superviseur ✓' : 'Enregistré ✓');
      if (submit) router.push(`/${tenant}/timesheets`);
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); }
    finally { setSaving(false); }
  }

  const isReadOnly = sheet?.status === 'approved' || sheet?.status === 'paid';
  const canSubmit  = sheet?.status === 'draft' || sheet?.status === 'rejected';

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
        <button onClick={() => router.push(`/${tenant}/timesheets`)}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
          <ArrowLeft size={16} /> Feuilles de temps
        </button>

        {/* En-tête feuille */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{sheet?.employee_name}</h1>
            <p className="text-sm text-slate-500">
              {sheet?.period_start && `${new Date(sheet.period_start + 'T00:00').toLocaleDateString('fr-CA', { weekday:'long', month:'long', day:'numeric' })} → ${new Date(sheet!.period_end + 'T00:00').toLocaleDateString('fr-CA', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}`}
            </p>
          </div>
          {!isReadOnly && (
            <div className="flex gap-2">
              <button onClick={() => save(false)} disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Enregistrer
              </button>
              {canSubmit && (
                <button onClick={() => save(true)} disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60">
                  <Send size={15} /> Soumettre au superviseur
                </button>
              )}
            </div>
          )}
        </div>

        {notice && <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-800">{notice}</div>}
        {isReadOnly && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800 font-medium">Feuille approuvée — lecture seule.</div>}

        {/* Totaux rapides */}
        <div className="mb-5 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {[
            { k: 'Rég',   v: `${totals.hrs_regular.toFixed(1)} h`, c: 'text-slate-900' },
            { k: 'Supp',  v: `${totals.hrs_overtime.toFixed(1)} h`,c: 'text-amber-600' },
            { k: 'Maj',   v: `${totals.hrs_premium.toFixed(1)} h`, c: 'text-orange-600' },
            { k: 'Km pers.', v: `${totals.km_personal.toFixed(0)}`,c: 'text-emerald-600' },
            { k: 'Total', v: money(totals.amount),                  c: 'text-violet-700' },
          ].map(s => (
            <div key={s.k} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm text-center">
              <div className={`text-lg font-bold ${s.c}`}>{s.v}</div>
              <div className="text-xs text-slate-500">{s.k}</div>
            </div>
          ))}
        </div>

        {/* Entrées */}
        <div className="space-y-3">
          {entries.map((e) => {
            const CatIcon = CATS.find(c => c.k === e.category)?.icon || Briefcase;
            const fps = filteredProjects(projSearch[e.id] || '');
            return (
              <div key={e.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                {/* Ligne 1: date + catégorie + projet/description */}
                <div className="mb-3 flex flex-wrap items-start gap-3">
                  <input type="date" value={e.date} disabled={isReadOnly}
                    onChange={ev => updEntry(e.id, 'date', ev.target.value)}
                    className="inp w-36 shrink-0" />

                  {/* Catégorie */}
                  <div className="flex gap-1">
                    {CATS.map(c => {
                      const Icon = c.icon;
                      return (
                        <button key={c.k} type="button" disabled={isReadOnly}
                          onClick={() => updEntry(e.id, 'category', c.k)}
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${e.category === c.k ? 'bg-violet-600 text-white' : 'border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                          <Icon size={12} /> {c.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Recherche projet (si catégorie = project) */}
                  {e.category === 'project' && (
                    <div ref={el => { projRefs.current[e.id] = el; }} className="relative min-w-[200px] flex-1">
                      <div className="relative">
                        <Search size={13} className="pointer-events-none absolute left-2.5 top-2.5 text-slate-400" />
                        <input
                          value={projSearch[e.id] || ''}
                          disabled={isReadOnly}
                          onChange={ev => { setProjSearch(s => ({ ...s, [e.id]: ev.target.value })); setProjOpen(o => ({ ...o, [e.id]: true })); }}
                          onFocus={() => setProjOpen(o => ({ ...o, [e.id]: true }))}
                          className="inp w-full pl-7"
                          placeholder="Rechercher projet, client…"
                        />
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

                {/* Ligne 2: heures + km + véhicule + matériel + coût */}
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex flex-col items-center">
                    <span className="mb-1 text-xs text-slate-400">Rég</span>
                    <input type="number" step="0.5" disabled={isReadOnly} onFocus={ev => ev.target.select()}
                      value={e.hrs_regular} onChange={ev => updEntry(e.id, 'hrs_regular', +ev.target.value)}
                      className="inp w-16 text-center" />
                  </label>
                  <label className="flex flex-col items-center">
                    <span className="mb-1 text-xs text-slate-400">Supp</span>
                    <input type="number" step="0.5" disabled={isReadOnly} onFocus={ev => ev.target.select()}
                      value={e.hrs_overtime} onChange={ev => updEntry(e.id, 'hrs_overtime', +ev.target.value)}
                      className="inp w-16 text-center" />
                  </label>
                  <label className="flex flex-col items-center">
                    <span className="mb-1 text-xs text-slate-400">Maj</span>
                    <input type="number" step="0.5" disabled={isReadOnly} onFocus={ev => ev.target.select()}
                      value={e.hrs_premium} onChange={ev => updEntry(e.id, 'hrs_premium', +ev.target.value)}
                      className="inp w-16 text-center" />
                  </label>
                  <label className="flex flex-col items-center">
                    <span className="mb-1 text-xs text-slate-400">Km</span>
                    <input type="number" disabled={isReadOnly} onFocus={ev => ev.target.select()}
                      value={e.km} onChange={ev => updEntry(e.id, 'km', +ev.target.value)}
                      className="inp w-16 text-center" />
                  </label>

                  {/* Véhicule */}
                  <label className="flex flex-col">
                    <span className="mb-1 text-xs text-slate-400">Véhicule</span>
                    <div className="flex items-center gap-1">
                      <select value={e.vehicle_id} disabled={isReadOnly}
                        onChange={ev => updVehicle(e.id, ev.target.value)}
                        className="inp w-36">
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

                  <label className="flex flex-col items-center">
                    <span className="mb-1 text-xs text-slate-400">Matériel $</span>
                    <input type="number" step="0.01" disabled={isReadOnly} onFocus={ev => ev.target.select()}
                      value={e.materiel} onChange={ev => updEntry(e.id, 'materiel', +ev.target.value)}
                      className="inp w-24 text-right" />
                  </label>

                  <div className="ml-auto flex items-end gap-2">
                    <span className="text-base font-bold text-slate-700">{money(entryCost(e))}</span>
                    {!isReadOnly && (
                      <button onClick={() => setEntries(p => p.filter(x => x.id !== e.id))}
                        className="rounded-lg p-1.5 text-slate-300 hover:text-red-500"><Trash2 size={15} /></button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {!isReadOnly && (
            <button onClick={addEntry}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 py-4 text-sm font-semibold text-slate-400 transition hover:border-violet-400 hover:text-violet-600">
              <Plus size={18} /> Ajouter une ligne
            </button>
          )}
        </div>

        {/* Footer total */}
        {entries.length > 0 && (
          <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="text-sm text-slate-500">
              {totals.km_company > 0 && <span className="mr-4"><Building2 size={13} className="mr-1 inline text-blue-500" />{totals.km_company} km ent.</span>}
              {totals.km_personal > 0 && <span><Car size={13} className="mr-1 inline text-emerald-600" />{totals.km_personal} km pers. → {money(totals.km_personal * kmRate)}</span>}
            </div>
            <div className="text-xl font-bold text-violet-700">{money(totals.amount)}</div>
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
