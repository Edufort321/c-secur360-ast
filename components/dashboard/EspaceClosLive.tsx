'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Wind, Users, Eye, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Surveillance espace clos EN DIRECT, remontée au dashboard principal : d'un coup d'œil on voit les
// permis ouverts, les entrants à l'intérieur (timer live), les surveillants en poste, le matériel
// encore dedans et le cumul total des présences. Lecture anon scopée au tenant (cs_permits/cs_entries),
// rafraîchie à la seconde. Le panneau ne s'affiche que s'il y a au moins un permis actif.
function fmtClock(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  const p = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${p(m)}:${p(ss)}` : `${m}:${p(ss)}`;
}

type Permit = { id: string; space_id: string; permit_number: string; valid_from: string | null };
type Entry = { id: string; permit_id: string; person_name: string; role: string; entered_at: string | null; exited_at: string | null; equipment_in: string[] | null };
type Space = { id: string; name: string; space_code: string; location: string | null };

export default function EspaceClosLive({ tenant }: { tenant: string }) {
  const [permits, setPermits] = useState<Permit[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [spaces, setSpaces] = useState<Record<string, Space>>({});
  const [now, setNow] = useState(() => Date.now());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  async function load() {
    try {
      const { data: pm } = await supabase.from('cs_permits')
        .select('id, space_id, permit_number, valid_from').eq('tenant_id', tenant).eq('status', 'active');
      const ps = (pm || []) as Permit[];
      setPermits(ps);
      if (ps.length) {
        const [{ data: en }, { data: sp }] = await Promise.all([
          supabase.from('cs_entries').select('id, permit_id, person_name, role, entered_at, exited_at, equipment_in').in('permit_id', ps.map(p => p.id)),
          supabase.from('confined_spaces').select('id, name, space_code, location').in('id', ps.map(p => p.space_id)),
        ]);
        setEntries((en || []) as Entry[]);
        const map: Record<string, Space> = {};
        (sp || []).forEach((s: any) => { map[s.id] = s; });
        setSpaces(map);
      } else { setEntries([]); setSpaces({}); }
    } catch { /* module espace clos indisponible */ } finally { setLoaded(true); }
  }
  // Recharge la structure (permis/entrées) toutes les 20 s ; les timers, eux, tournent à la seconde.
  useEffect(() => { load(); const t = setInterval(load, 20000); return () => clearInterval(t); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [tenant]);

  const agg = useMemo(() => {
    const insideEntrants = entries.filter(e => e.role === 'entrant' && e.entered_at && !e.exited_at);
    const activeAttendants = entries.filter(e => e.role !== 'entrant' && e.entered_at && !e.exited_at);
    let grandSec = 0;
    for (const e of entries) {
      if (!e.entered_at) continue;
      const end = e.exited_at ? new Date(e.exited_at).getTime() : now;
      grandSec += Math.max(0, Math.round((end - new Date(e.entered_at).getTime()) / 1000));
    }
    const equipInside = insideEntrants.flatMap(e => (Array.isArray(e.equipment_in) ? e.equipment_in : []));
    return { insideEntrants, activeAttendants, grandSec, equipInside };
  }, [entries, now]);

  if (!loaded || permits.length === 0) return null; // rien à montrer s'il n'y a aucun permis ouvert

  const noWatch = agg.insideEntrants.length > 0 && agg.activeAttendants.length === 0;

  return (
    <div className="slide-in-up" style={{ marginBottom: '40px' }}>
      <div style={{
        background: noWatch ? 'rgba(127, 29, 29, 0.35)' : 'rgba(8, 47, 73, 0.45)',
        border: `1px solid ${noWatch ? 'rgba(239,68,68,0.5)' : 'rgba(34,211,238,0.3)'}`,
        borderRadius: '20px', padding: '24px', backdropFilter: 'blur(12px)',
      }}>
        {/* En-tête + KPIs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wind style={{ width: 22, height: 22, color: '#22d3ee' }} className="pulse-animation" />
            <div>
              <h3 style={{ color: 'white', fontSize: '18px', fontWeight: 700, margin: 0 }}>Espace clos — surveillance en direct</h3>
              <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>Permis ouverts, entrants à l’intérieur et durées en temps réel</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <Kpi label="Permis ouverts" value={String(permits.length)} color="#22d3ee" />
            <Kpi label="Entrants à l’intérieur" value={String(agg.insideEntrants.length)} color="#34d399" />
            <Kpi label="Surveillants en poste" value={String(agg.activeAttendants.length)} color="#a78bfa" />
            <Kpi label="Cumul présences" value={fmtClock(agg.grandSec)} color="#f8fafc" mono />
          </div>
        </div>

        {noWatch && (
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, color: '#fecaca', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 12, padding: '8px 12px', fontSize: 13, fontWeight: 600 }}>
            <AlertTriangle style={{ width: 16, height: 16 }} /> {agg.insideEntrants.length} entrant(s) à l’intérieur SANS surveillant en poste — intervention requise.
          </div>
        )}

        {/* Détail par permis ouvert */}
        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {permits.map(p => {
            const sp = spaces[p.space_id];
            const pe = entries.filter(e => e.permit_id === p.id);
            const inside = pe.filter(e => e.role === 'entrant' && e.entered_at && !e.exited_at);
            const watch = pe.filter(e => e.role !== 'entrant' && e.entered_at && !e.exited_at);
            const openSec = p.valid_from ? Math.max(0, Math.round((now - new Date(p.valid_from).getTime()) / 1000)) : 0;
            return (
              <Link key={p.id} href={`/${tenant}/permits/espace-clos/${p.space_id}`} style={{ textDecoration: 'none' }}>
                <div className="card-hover" style={{ background: 'rgba(15,23,42,0.55)', border: '1px solid rgba(148,163,184,0.18)', borderRadius: 14, padding: 16, height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{sp?.name || 'Espace clos'}</div>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#22d3ee', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Clock style={{ width: 12, height: 12 }} /> {fmtClock(openSec)}</span>
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: 11, fontFamily: 'monospace', marginTop: 2 }}>{sp?.space_code}{sp?.location ? ` · ${sp.location}` : ''} · {p.permit_number}</div>

                  <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: 12 }}>
                    <span style={{ color: '#34d399', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Users style={{ width: 13, height: 13 }} /> {inside.length} entrant(s)</span>
                    <span style={{ color: watch.length ? '#a78bfa' : '#f87171', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Eye style={{ width: 13, height: 13 }} /> {watch.length} surveillant(s)</span>
                  </div>

                  {inside.length > 0 && (
                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {inside.map(e => {
                        const sec = e.entered_at ? Math.max(0, Math.round((now - new Date(e.entered_at).getTime()) / 1000)) : 0;
                        return (
                          <div key={e.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                            <span style={{ color: '#e2e8f0' }}>{e.person_name}</span>
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#34d399' }}>{fmtClock(sec)}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, color, mono }: { label: string; value: string; color: string; mono?: boolean }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ color, fontSize: 22, fontWeight: 800, fontFamily: mono ? 'monospace' : undefined, lineHeight: 1.1 }}>{value}</div>
      <div style={{ color: '#94a3b8', fontSize: 11 }}>{label}</div>
    </div>
  );
}
