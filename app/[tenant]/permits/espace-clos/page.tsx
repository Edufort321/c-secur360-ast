'use client';

// Espace clos — TABLEAU DE BORD + création (avec conseiller IA). Liste des espaces clos du tenant avec
// niveau de risque, permis actif, nombre d'entrées, dernier état atmosphérique. Le QR vit sur la fiche.
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Wind, Plus, Loader2, ShieldAlert, Users, Activity, ChevronRight, Sparkles, X, MapPin,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PortalHeader } from '@/components/PortalHeader';
import { PROVINCE_NORMS, getNorm, type RiskLevel } from '@/lib/confinedSpace/norms';

type Space = {
  id: string; space_code?: string; name: string; location?: string; space_type?: string;
  province?: string; risk_level?: string; status?: string; characteristics?: any; hazards?: any;
  emergency?: any; retest_minutes?: number; created_at?: string;
};

const SPACE_TYPES = [
  ['tank', 'Réservoir / cuve'], ['vessel', 'Capacité sous pression'], ['sewer', 'Égout / collecteur'],
  ['silo', 'Silo'], ['pit', 'Fosse / puisard'], ['vault', 'Chambre / voûte'], ['trench', 'Tranchée'],
  ['duct', 'Conduit / gaine'], ['tunnel', 'Tunnel'], ['manhole', 'Regard / trou d’homme'], ['other', 'Autre'],
] as const;

const RISK_COLOR: Record<string, string> = {
  'faible': 'bg-emerald-100 text-emerald-700', 'moyen': 'bg-amber-100 text-amber-700',
  'élevé': 'bg-orange-100 text-orange-700', 'critique': 'bg-red-100 text-red-700',
};

export default function EspaceClosDashboard() {
  const { tenant } = useParams() as { tenant: string };
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [permits, setPermits] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openNew, setOpenNew] = useState(false);

  async function load() {
    setLoading(true);
    const [sp, pm, en] = await Promise.all([
      supabase.from('confined_spaces').select('*').eq('tenant_id', tenant).eq('status', 'active').order('created_at', { ascending: false }),
      supabase.from('cs_permits').select('id, space_id, status').eq('tenant_id', tenant),
      supabase.from('cs_entries').select('permit_id, exited_at').eq('tenant_id', tenant),
    ]);
    setSpaces((sp.data as Space[]) || []);
    setPermits(pm.data || []);
    setEntries(en.data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, [tenant]);

  // Agrégats par espace.
  const bySpace = useMemo(() => {
    const permitToSpace: Record<string, string> = {};
    const map: Record<string, { activePermit: boolean; entries: number; openEntries: number }> = {};
    for (const s of spaces) map[s.id] = { activePermit: false, entries: 0, openEntries: 0 };
    for (const p of permits) { if (p.space_id) { permitToSpace[p.id] = p.space_id; if ((p.status === 'active' || p.status === 'approved') && map[p.space_id]) map[p.space_id].activePermit = true; } }
    for (const e of entries) { const sid = permitToSpace[e.permit_id]; if (sid && map[sid]) { map[sid].entries++; if (!e.exited_at) map[sid].openEntries++; } }
    return map;
  }, [spaces, permits, entries]);

  const stats = useMemo(() => {
    const total = spaces.length;
    const active = permits.filter(p => p.status === 'active' || p.status === 'approved').length;
    const openEntries = entries.filter(e => !e.exited_at).length;
    const critical = spaces.filter(s => s.risk_level === 'critique' || s.risk_level === 'élevé').length;
    return { total, active, openEntries, critical };
  }, [spaces, permits, entries]);

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalHeader tenant={tenant} />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900"><Wind className="text-cyan-600" /> Espaces clos</h1>
            <p className="text-sm text-gray-500">Registre des espaces clos · permis intelligents · normes par province (CSA Z1006).</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/${tenant}/permits`} className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100">← Permis</Link>
            <button onClick={() => setOpenNew(true)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-lg"><Plus size={16} /> Nouvel espace clos</button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Kpi icon={<Wind size={16} />} label="Espaces clos" value={stats.total} color="text-cyan-600" />
          <Kpi icon={<Activity size={16} />} label="Permis actifs" value={stats.active} color="text-emerald-600" />
          <Kpi icon={<Users size={16} />} label="Entrants à l’intérieur" value={stats.openEntries} color="text-amber-600" />
          <Kpi icon={<ShieldAlert size={16} />} label="Risque élevé/critique" value={stats.critical} color="text-red-600" />
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm"><Loader2 className="animate-spin" size={16} /> Chargement…</div>
        ) : spaces.length === 0 ? (
          <div className="text-center text-gray-400 py-16">Aucun espace clos. Clique « Nouvel espace clos ».</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {spaces.map(s => {
              const agg = bySpace[s.id] || { activePermit: false, entries: 0, openEntries: 0 };
              return (
                <Link key={s.id} href={`/${tenant}/permits/espace-clos/${s.id}`} className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{s.name}</div>
                      <div className="text-xs text-gray-400 font-mono">{s.space_code || '—'}</div>
                    </div>
                    <span className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${RISK_COLOR[s.risk_level || ''] || 'bg-gray-100 text-gray-500'}`}>{s.risk_level || 'à évaluer'}</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 flex items-center gap-1.5"><MapPin size={12} /> {s.location || '—'}</div>
                  <div className="mt-3 flex items-center gap-3 text-xs">
                    {agg.activePermit && <span className="inline-flex items-center gap-1 text-emerald-600 font-medium"><Activity size={12} /> Permis actif</span>}
                    {agg.openEntries > 0 && <span className="inline-flex items-center gap-1 text-amber-600 font-medium"><Users size={12} /> {agg.openEntries} à l’intérieur</span>}
                    <span className="text-gray-400 ml-auto">{agg.entries} entrée(s)</span>
                    <ChevronRight size={14} className="text-gray-300" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {openNew && <NewSpaceModal tenant={tenant} onClose={() => setOpenNew(false)} onCreated={() => { setOpenNew(false); load(); }} />}
    </div>
  );
}

function Kpi({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3">
      <div className={`flex items-center gap-1.5 text-xs font-medium ${color}`}>{icon} {label}</div>
      <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
    </div>
  );
}

// ── Modal de création + conseiller IA ──
function NewSpaceModal({ tenant, onClose, onCreated }: { tenant: string; onClose: () => void; onCreated: () => void }) {
  const [f, setF] = useState({ name: '', space_type: 'tank', location: '', province: 'QC', description: '' });
  const [advice, setAdvice] = useState<any>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  async function runAi() {
    if (!f.name.trim()) { setErr('Donne au moins un nom.'); return; }
    setAiBusy(true); setErr('');
    try {
      const r = await fetch('/api/permits/espace-clos/ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ action: 'advise', province: f.province, tenant, space: f }),
      });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Échec IA');
      setAdvice(j.advice);
    } catch (e: any) { setErr('IA : ' + (e?.message || '')); }
    finally { setAiBusy(false); }
  }

  async function create() {
    if (!f.name.trim()) { setErr('Le nom est requis.'); return; }
    setSaving(true); setErr('');
    try {
      const code = 'EC-' + Math.random().toString(36).slice(2, 7).toUpperCase();
      const norm = getNorm(f.province);
      const payload: any = {
        tenant_id: tenant, space_code: code, name: f.name.trim(), location: f.location || null,
        space_type: f.space_type, province: f.province, description: f.description || null,
        characteristics: advice?.characteristics || {}, hazards: advice?.hazards || [],
        emergency: advice?.rescue || {}, risk_level: advice?.risk_level || null,
        retest_minutes: Number(advice?.recommended_retest_minutes) || norm.defaultRetestMinutes,
        data: advice ? { controls: advice.controls, atmospheric_focus: advice.atmospheric_focus, rationale: advice.rationale_fr } : {},
        status: 'active',
      };
      const { error } = await supabase.from('confined_spaces').insert(payload);
      if (error) throw error;
      onCreated();
    } catch (e: any) { setErr('Erreur : ' + (e?.message || 'enregistrement')); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl my-8 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900"><Wind className="text-cyan-600" size={20} /> Nouvel espace clos</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
        </div>
        {err && <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{err}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Nom *</label>
            <input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="ex. Réservoir T‑12" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
            <select value={f.space_type} onChange={e => setF({ ...f, space_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">{SPACE_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Emplacement</label>
            <input value={f.location} onChange={e => setF({ ...f, location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
          <div><label className="block text-xs font-medium text-gray-600 mb-1">Province (norme)</label>
            <select value={f.province} onChange={e => setF({ ...f, province: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">{Object.values(PROVINCE_NORMS).map(n => <option key={n.province} value={n.province}>{n.label}</option>)}</select></div>
          <div className="sm:col-span-2"><label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea value={f.description} onChange={e => setF({ ...f, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
        </div>

        <div className="mt-3">
          <button onClick={runAi} disabled={aiBusy} className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg disabled:opacity-60">
            {aiBusy ? <Loader2 className="animate-spin" size={15} /> : <Sparkles size={15} />} {aiBusy ? 'Analyse…' : '✦ Conseiller IA (dangers, contrôles, sauvetage)'}
          </button>
        </div>

        {advice && (
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center gap-2"><span className="text-xs text-gray-500">Risque estimé :</span><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${RISK_COLOR[advice.risk_level] || 'bg-gray-100'}`}>{advice.risk_level}</span><span className="text-xs text-gray-400">· reprise {advice.recommended_retest_minutes} min</span></div>
            {advice.rationale_fr && <p className="text-xs text-gray-500 italic">{advice.rationale_fr}</p>}
            {Array.isArray(advice.hazards) && <Section title="Dangers identifiés" items={advice.hazards} cls="text-red-700 bg-red-50" />}
            {Array.isArray(advice.controls) && <Section title="Mesures de maîtrise" items={advice.controls} cls="text-emerald-700 bg-emerald-50" />}
            {advice.rescue?.strategy && <div className="rounded-lg bg-cyan-50 p-3 text-xs text-cyan-800"><b>Plan de sauvetage : </b>{advice.rescue.strategy}{Array.isArray(advice.rescue.equipment) && advice.rescue.equipment.length ? ` — Équipement : ${advice.rescue.equipment.join(', ')}` : ''}</div>}
            <p className="text-[11px] text-gray-400">Tu peux ajuster ces éléments plus tard sur la fiche. Ils sont enregistrés avec l’espace.</p>
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg">Annuler</button>
          <button onClick={create} disabled={saving} className="inline-flex items-center gap-1.5 px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-lg disabled:opacity-60">{saving ? 'Création…' : 'Créer l’espace clos'}</button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, items, cls }: { title: string; items: string[]; cls: string }) {
  return (
    <div>
      <div className="text-xs font-semibold text-gray-600 mb-1">{title}</div>
      <div className="flex flex-wrap gap-1.5">{items.map((it, i) => <span key={i} className={`text-[11px] px-2 py-1 rounded ${cls}`}>{it}</span>)}</div>
    </div>
  );
}
