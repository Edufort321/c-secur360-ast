'use client';

import { useEffect, useState } from 'react';

// Vue admin des leads démo (nom + courriel des personnes ayant démarré une démo).
// Protégée par /api/demo/leads (requireAdmin : cookie du tableau de bord admin).
type Lead = {
  email: string; name: string | null; status: string; attempts: number;
  total_seconds: number; first_seen: string | null; last_start: string | null; session_expires_at: string | null;
};

const fmtH = (s: number) => {
  const h = Math.floor((s || 0) / 3600); const m = Math.round(((s || 0) % 3600) / 60);
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
};
const fmtDate = (d: string | null) => (d ? new Date(d).toLocaleString('fr-CA') : '—');

export default function DemoLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [state, setState] = useState<'loading' | 'ok' | 'unauth' | 'error'>('loading');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/demo/leads', { credentials: 'include' });
        if (res.status === 401 || res.status === 403) { setState('unauth'); return; }
        if (!res.ok) { setState('error'); return; }
        const json = await res.json();
        setLeads(json.leads || []); setState('ok');
      } catch { setState('error'); }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-black">Leads démo</h1>
        <p className="mt-1 text-sm text-slate-500">Personnes ayant démarré une session démo (nom + courriel + usage du chrono de 4 h).</p>

        {state === 'loading' && <p className="mt-6 text-slate-400">Chargement…</p>}
        {state === 'unauth' && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Accès réservé à l&apos;admin. Connectez-vous d&apos;abord au tableau de bord :
            <a href="/auth/admin" className="ml-1 font-semibold underline">/auth/admin</a>.
          </div>
        )}
        {state === 'error' && <p className="mt-6 text-red-600">Erreur de chargement.</p>}

        {state === 'ok' && (
          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Nom</th>
                  <th className="px-3 py-2">Courriel</th>
                  <th className="px-3 py-2">Statut</th>
                  <th className="px-3 py-2">Démarrages</th>
                  <th className="px-3 py-2">Temps utilisé</th>
                  <th className="px-3 py-2">1re visite</th>
                  <th className="px-3 py-2">Dernier démarrage</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 && (
                  <tr><td colSpan={7} className="px-3 py-6 text-center text-slate-400">Aucun lead pour l&apos;instant.</td></tr>
                )}
                {leads.map((l) => (
                  <tr key={l.email} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-medium">{l.name || '—'}</td>
                    <td className="px-3 py-2"><a href={`mailto:${l.email}`} className="text-blue-600 hover:underline">{l.email}</a></td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${l.status === 'converted' ? 'bg-emerald-100 text-emerald-700' : l.status === 'locked' ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-700'}`}>{l.status}</span>
                    </td>
                    <td className="px-3 py-2">{l.attempts}</td>
                    <td className="px-3 py-2">{fmtH(l.total_seconds)}</td>
                    <td className="px-3 py-2 text-slate-500">{fmtDate(l.first_seen)}</td>
                    <td className="px-3 py-2 text-slate-500">{fmtDate(l.last_start)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
