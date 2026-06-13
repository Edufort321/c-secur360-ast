'use client';

// Page PUBLIQUE d'un espace clos (scan QR) — accessible connecté OU NON (secouristes/intervenants).
// Montre l'état atmosphérique live (vert/rouge), les dernières mesures, l'historique des entrées et les
// MESURES D'URGENCE / plan de sauvetage. Lecture seule (RLS lecture publique sur les tables cs_*).
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Wind, ShieldAlert, ShieldCheck, AlertTriangle, Clock, Users, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getNorm } from '@/lib/confinedSpace/norms';

export default function EspaceClosScan() {
  const { tenant, id } = useParams() as { tenant: string; id: string };
  const [space, setSpace] = useState<any>(null);
  const [permit, setPermit] = useState<any>(null);
  const [readings, setReadings] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => {
    (async () => {
      const { data: sp } = await supabase.from('confined_spaces').select('*').eq('id', id).maybeSingle();
      setSpace(sp);
      const { data: pm } = await supabase.from('cs_permits').select('*').eq('space_id', id).order('created_at', { ascending: false }).limit(1);
      const p = (pm || [])[0]; setPermit(p || null);
      if (p) {
        const [{ data: rd }, { data: en }] = await Promise.all([
          supabase.from('cs_atm_readings').select('*').eq('permit_id', p.id).order('taken_at', { ascending: false }).limit(20),
          supabase.from('cs_entries').select('*').eq('permit_id', p.id).order('created_at', { ascending: false }).limit(50),
        ]);
        setReadings(rd || []); setEntries(en || []);
      }
      setLoading(false);
    })();
  }, [id]);

  const norm = useMemo(() => getNorm(space?.province), [space?.province]);
  const last = readings[0];
  const dueAt = last?.next_due_at ? new Date(last.next_due_at).getTime() : null;
  const overdue = dueAt != null && now > dueAt;
  const openEntrants = entries.filter(e => e.entered_at && !e.exited_at);
  const active = permit && permit.status === 'active';
  const state: 'none' | 'safe' | 'danger' | 'recheck' = !active || !last ? 'none' : (last.result === 'danger' ? 'danger' : overdue ? 'recheck' : 'safe');

  if (loading) return <div className="min-h-screen grid place-items-center bg-gray-900 text-gray-300"><Loader2 className="animate-spin" /></div>;
  if (!space) return <div className="min-h-screen grid place-items-center bg-gray-900 text-gray-300 p-6 text-center">Espace clos introuvable.</div>;

  const banner = state === 'danger' ? { bg: '#dc2626', t: '⚠ DANGER — NE PAS ENTRER', s: 'Atmosphère hors limites. Ventiler et reprendre les mesures.', I: AlertTriangle }
    : state === 'recheck' ? { bg: '#d97706', t: '⏱ REPRISE REQUISE', s: 'Le délai de validité des mesures est dépassé. Refaire un relevé.', I: Clock }
    : state === 'safe' ? { bg: '#059669', t: '✓ ENTRÉE PERMISE', s: 'Atmosphère conforme au dernier relevé.', I: ShieldCheck }
    : { bg: '#6b7280', t: 'PERMIS NON ACTIF', s: 'Aucun permis d’entrée actif sur cet espace.', I: Wind };
  const BI = banner.I;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-lg mx-auto p-4">
        <div className="flex items-center gap-2 text-cyan-700 mb-2"><Wind /><div><div className="font-bold text-gray-900 text-lg leading-tight">{space.name}</div><div className="text-xs text-gray-500 font-mono">{space.space_code} · {space.location || ''}</div></div></div>

        {/* Bannière d'état */}
        <div className="rounded-2xl text-white p-5 flex items-center gap-4 shadow" style={{ background: banner.bg }}>
          <BI size={40} className="shrink-0" />
          <div className="flex-1"><div className="text-xl font-extrabold">{banner.t}</div><div className="text-sm opacity-90">{banner.s}</div></div>
        </div>

        {/* Dernières mesures */}
        {last && (
          <Card title="Dernières mesures atmosphériques">
            <div className="grid grid-cols-4 gap-2 text-center">
              {[['O₂', last.o2, '%'], ['LIE', last.lel, '%'], ['H₂S', last.h2s, 'ppm'], ['CO', last.co, 'ppm']].map(([l, v, u]: any) => (
                <div key={l} className="rounded-lg bg-gray-50 py-2"><div className="text-[11px] text-gray-500">{l}</div><div className="font-bold text-gray-900">{v ?? '—'}</div><div className="text-[10px] text-gray-400">{u}</div></div>
              ))}
            </div>
            <div className="text-[11px] text-gray-500 mt-2">Relevé {fmt(last.taken_at)} · {last.point}</div>
            {Array.isArray(last.failures) && last.failures.length > 0 && <div className="text-xs text-red-600 mt-1">Hors limites : {last.failures.map((f: any) => f.label).join(', ')}</div>}
          </Card>
        )}

        {/* Entrants à l'intérieur */}
        <Card title={<span className="flex items-center gap-1.5"><Users size={15} /> Personnes à l’intérieur ({openEntrants.length})</span>}>
          {openEntrants.length === 0 ? <p className="text-sm text-gray-400">Personne à l’intérieur.</p> : (
            <div className="space-y-1">{openEntrants.map(e => { const dur = Math.round((now - new Date(e.entered_at).getTime()) / 60000); return <div key={e.id} className="flex items-center justify-between text-sm"><span className="font-medium text-gray-800">{e.person_name}</span><span className="text-emerald-600 text-xs"><Clock size={11} className="inline" /> {dur} min</span></div>; })}</div>
          )}
        </Card>

        {/* Mesures d'urgence */}
        <Card title={<span className="flex items-center gap-1.5 text-red-600"><ShieldAlert size={15} /> Mesures d’urgence / sauvetage</span>}>
          {space.emergency?.strategy || space.emergency?.type ? (
            <div className="text-sm text-gray-700 space-y-1">
              {space.emergency.type && <p className="text-xs font-medium">{space.emergency.type}</p>}
              {space.emergency.strategy && <p>{space.emergency.strategy}</p>}
              {Array.isArray(space.emergency.equipment) && space.emergency.equipment.length > 0 && <p className="text-xs text-gray-500"><b>Équipement : </b>{space.emergency.equipment.join(', ')}</p>}
              {space.emergency.communication_plan && <p className="text-xs text-gray-500"><b>Communication : </b>{space.emergency.communication_plan}</p>}
              {space.emergency.contacts && <p className="text-xs text-gray-500"><b>Contacts : </b>{space.emergency.contacts}</p>}
              {space.emergency.hospital?.name && <p className="text-xs text-gray-500"><b>Hôpital : </b>{space.emergency.hospital.name}{space.emergency.hospital.phone ? ` · ${space.emergency.hospital.phone}` : ''}{space.emergency.hospital.distance_km ? ` · ${space.emergency.hospital.distance_km} km` : ''}</p>}
            </div>
          ) : <p className="text-sm text-gray-400">En cas d’urgence, composez le 911. Ne pas tenter de sauvetage sans équipement et formation.</p>}
        </Card>

        {/* Historique des entrées */}
        <Card title="Historique des entrées">
          {entries.length === 0 ? <p className="text-sm text-gray-400">Aucune entrée enregistrée.</p> : (
            <div className="space-y-1 max-h-64 overflow-auto">{entries.map(e => (
              <div key={e.id} className="flex items-center gap-2 text-xs border-b border-gray-100 py-1">
                <span className={`px-1.5 py-0.5 rounded ${e.role === 'entrant' ? 'bg-cyan-100 text-cyan-700' : 'bg-violet-100 text-violet-700'}`}>{e.role === 'entrant' ? 'Entrant' : 'Surv.'}</span>
                <span className="font-medium text-gray-800">{e.person_name}</span>
                <span className="ml-auto text-gray-400">{e.entered_at ? fmt(e.entered_at) : '—'} → {e.exited_at ? fmt(e.exited_at) : (e.entered_at ? 'à l’intérieur' : '')}</span>
              </div>
            ))}</div>
          )}
        </Card>

        <p className="text-center text-[11px] text-gray-400 mt-4">Norme : {norm.regulations[0]} · C-Secur360</p>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return <div className="bg-white rounded-xl border border-gray-200 p-4 mt-3"><div className="font-semibold text-gray-900 text-sm mb-2">{title}</div>{children}</div>;
}
function fmt(s?: string) { return s ? new Date(s).toLocaleString('fr-CA', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'; }
