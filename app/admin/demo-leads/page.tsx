'use client';

import { useEffect, useState } from 'react';

// Vue admin des leads démo (nom + courriel des personnes ayant démarré une démo) + suivi de relance.
// Protégée par /api/demo/leads (requireAdmin : cookie du tableau de bord admin).
type Lead = {
  email: string; name: string | null; phone?: string | null; status: string; attempts: number;
  total_seconds: number; first_seen: string | null; last_start: string | null; session_expires_at: string | null;
  contacted_at?: string | null; contact_count?: number | null; contact_notes?: string | null;
};

const fmtH = (s: number) => {
  const h = Math.floor((s || 0) / 3600); const m = Math.round(((s || 0) % 3600) / 60);
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
};
const fmtDate = (d: string | null | undefined) => (d ? new Date(d).toLocaleString('fr-CA') : '—');

export default function DemoLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [state, setState] = useState<'loading' | 'ok' | 'unauth' | 'error'>('loading');
  const [busy, setBusy] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [onlyTodo, setOnlyTodo] = useState(false);

  async function load() {
    try {
      const res = await fetch('/api/demo/leads', { credentials: 'include' });
      if (res.status === 401 || res.status === 403) { setState('unauth'); return; }
      if (!res.ok) { setState('error'); return; }
      const json = await res.json();
      setLeads(json.leads || []); setState('ok');
    } catch { setState('error'); }
  }
  useEffect(() => { load(); }, []);

  async function relancer(l: Lead) {
    setBusy(l.email);
    const notes = window.prompt(`Relance de ${l.name || l.email}\nNote (optionnel) :`, l.contact_notes || '') ?? undefined;
    // Ouvre le client courriel pré-rempli
    const subject = encodeURIComponent('C-Secur360 — votre essai de la plateforme');
    const body = encodeURIComponent(`Bonjour ${l.name || ''},\n\nVous avez récemment essayé C-Secur360. Puis-je répondre à vos questions ou prolonger votre accès ?\n\nAu plaisir,\n`);
    window.open(`mailto:${l.email}?subject=${subject}&body=${body}`, '_blank');
    try {
      await fetch('/api/demo/leads', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: l.email, notes }),
      });
      await load();
    } finally { setBusy(null); }
  }

  const filtered = leads.filter(l => {
    if (onlyTodo && l.contacted_at) return false;
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    return (l.name || '').toLowerCase().includes(s) || l.email.toLowerCase().includes(s) || (l.phone || '').includes(s);
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black">Leads démo</h1>
            <p className="mt-1 text-sm text-slate-500">Historique des personnes ayant démarré une démo (nom + courriel + usage du chrono 4 h). Relancez-les en un clic.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher nom / courriel / tél."
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500" />
            <label className="flex items-center gap-1.5 text-sm text-slate-600">
              <input type="checkbox" checked={onlyTodo} onChange={e => setOnlyTodo(e.target.checked)} /> À relancer seulement
            </label>
          </div>
        </div>

        {state === 'loading' && <p className="mt-6 text-slate-400">Chargement…</p>}
        {state === 'unauth' && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Accès réservé à l&apos;admin. Connectez-vous d&apos;abord au tableau de bord :
            <a href="/auth/admin" className="ml-1 font-semibold underline">/auth/admin</a>.
          </div>
        )}
        {state === 'error' && <p className="mt-6 text-red-600">Erreur de chargement.</p>}

        {state === 'ok' && (
          <>
            <p className="mt-4 text-xs text-slate-500">{filtered.length} lead(s){onlyTodo ? ' à relancer' : ''} · {leads.filter(l => !l.contacted_at).length} jamais relancé(s)</p>
            <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Nom</th>
                    <th className="px-3 py-2">Courriel</th>
                    <th className="px-3 py-2">Tél.</th>
                    <th className="px-3 py-2">Statut</th>
                    <th className="px-3 py-2">Démarr.</th>
                    <th className="px-3 py-2">Temps</th>
                    <th className="px-3 py-2">1re visite</th>
                    <th className="px-3 py-2">Dernier</th>
                    <th className="px-3 py-2">Relance</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={10} className="px-3 py-6 text-center text-slate-400">Aucun lead.</td></tr>
                  )}
                  {filtered.map((l) => (
                    <tr key={l.email} className="border-t border-slate-100 align-top">
                      <td className="px-3 py-2 font-medium">{l.name || '—'}</td>
                      <td className="px-3 py-2"><a href={`mailto:${l.email}`} className="text-blue-600 hover:underline">{l.email}</a></td>
                      <td className="px-3 py-2 text-slate-500">{l.phone ? <a href={`tel:${l.phone}`} className="text-blue-600 hover:underline">{l.phone}</a> : '—'}</td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${l.status === 'converted' ? 'bg-emerald-100 text-emerald-700' : l.status === 'locked' ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-700'}`}>{l.status}</span>
                      </td>
                      <td className="px-3 py-2">{l.attempts}</td>
                      <td className="px-3 py-2">{fmtH(l.total_seconds)}</td>
                      <td className="px-3 py-2 text-slate-500">{fmtDate(l.first_seen)}</td>
                      <td className="px-3 py-2 text-slate-500">{fmtDate(l.last_start)}</td>
                      <td className="px-3 py-2 text-slate-500">
                        {l.contacted_at ? (
                          <span title={l.contact_notes || ''}>✓ {fmtDate(l.contacted_at)}{(l.contact_count || 0) > 1 ? ` (${l.contact_count}×)` : ''}</span>
                        ) : <span className="text-amber-600">à relancer</span>}
                      </td>
                      <td className="px-3 py-2">
                        <button onClick={() => relancer(l)} disabled={busy === l.email}
                          className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                          {busy === l.email ? '…' : 'Relancer'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
