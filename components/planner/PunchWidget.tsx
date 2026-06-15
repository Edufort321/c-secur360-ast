'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Poinçon du travailleur connecté : il choisit sa tâche planifiée du jour et pointe (entrée/sortie).
// À la sortie, le temps (arrondi 15 min) part automatiquement dans SA feuille de temps + le projet
// (via /api/planner/punch). Composant autonome monté au-dessus du planificateur — n'édite pas l'app Vite.
type Job = { id: string; title: string; project_id: string | null; project_number: string | null; site_id?: string | null };

export default function PunchWidget({ tenant }: { tenant: string }) {
  const [open, setOpen] = useState<any | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pick, setPick] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  async function loadOpen() {
    try { const r = await fetch('/api/planner/punch', { credentials: 'include' }).then(x => x.ok ? x.json() : { open: [] }); setOpen((r.open || [])[0] || null); }
    catch { setOpen(null); }
  }
  async function loadJobs() {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase.from('planner_jobs').select('*').eq('tenant_id', tenant);
      const list = ((data as any[]) || [])
        .filter(j => !j.date || String(j.date).slice(0, 10) === today) // tâches du jour (ou sans date)
        .map(j => ({ id: j.id, title: j.title || j.nom || j.numeroJob || 'Tâche', project_id: j.project_id || j.projectId || null, project_number: j.project_number || j.numeroProjet || null, site_id: j.site_id || null }));
      setJobs(list);
    } catch { setJobs([]); }
  }
  useEffect(() => { loadOpen(); loadJobs(); /* eslint-disable-next-line */ }, [tenant]);

  async function punchIn() {
    const job = jobs.find(j => j.id === pick); if (!job) { setMsg('Choisis une tâche.'); return; }
    setBusy(true); setMsg(null);
    try {
      const r = await fetch('/api/planner/punch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ action: 'in', jobId: job.id, projectId: job.project_id, projectNumber: job.project_number, siteId: job.site_id }) });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Erreur');
      await loadOpen(); setMsg('⏱ Poinçon démarré.');
    } catch (e: any) { setMsg('Erreur : ' + (e?.message || 'poinçon')); } finally { setBusy(false); }
  }
  async function punchOut() {
    if (!open) return;
    setBusy(true); setMsg(null);
    try {
      const r = await fetch('/api/planner/punch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ action: 'out', punchId: open.id }) });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Erreur');
      setOpen(null); setMsg(`✓ ${j.hours} h ajoutées à ta feuille de temps${open.project_number ? ` (projet ${open.project_number})` : ''}.`);
    } catch (e: any) { setMsg('Erreur : ' + (e?.message || 'poinçon')); } finally { setBusy(false); }
  }

  const elapsed = open ? Math.max(0, Math.floor((now - new Date(open.punched_in_at).getTime()) / 1000)) : 0;
  const hh = Math.floor(elapsed / 3600), mm = Math.floor((elapsed % 3600) / 60), ss = elapsed % 60;
  const clock = `${hh}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;

  return (
    <div style={{ maxWidth: 1100, margin: '12px auto', padding: '0 16px' }}>
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 14, padding: 14, background: open ? '#ecfdf5' : '#fff', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, color: '#111827' }}>⏱ Poinçon</span>
        {open ? (
          <>
            <span style={{ color: '#065f46' }}>En cours{open.project_number ? ` · projet ${open.project_number}` : ''} — <b style={{ fontFamily: 'monospace' }}>{clock}</b></span>
            <button onClick={punchOut} disabled={busy} style={{ marginLeft: 'auto', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontWeight: 600, cursor: 'pointer' }}>Poinçon sortie</button>
          </>
        ) : (
          <>
            <select value={pick} onChange={e => setPick(e.target.value)} style={{ flex: 1, minWidth: 220, border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 10px' }}>
              <option value="">— Choisir ma tâche planifiée du jour —</option>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.title}{j.project_number ? ` · ${j.project_number}` : ''}</option>)}
            </select>
            <button onClick={punchIn} disabled={busy || !pick} style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontWeight: 600, cursor: pick ? 'pointer' : 'not-allowed', opacity: pick ? 1 : 0.6 }}>Poinçon entrée</button>
          </>
        )}
      </div>
      {msg && <p style={{ fontSize: 13, color: msg.startsWith('Erreur') ? '#dc2626' : '#059669', margin: '6px 4px 0' }}>{msg}</p>}
    </div>
  );
}
