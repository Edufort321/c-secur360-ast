'use client';

import { useState } from 'react';

// Bouton "Démarrer maintenant" : capture Nom + courriel, démarre une session démo limitée
// (notif propriétaire par SMS côté serveur), puis donne accès au bac à sable /demo.
export function DemoStartButton({ fr = true, className = '' }: { fr?: boolean; className?: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; status: string; message: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true); setResult(null);
    try {
      const res = await fetch('/api/demo/start', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json().catch(() => ({ ok: false, status: 'invalid', message: 'Erreur.' }));
      setResult(data);
    } catch {
      setResult({ ok: false, status: 'invalid', message: fr ? 'Erreur de connexion.' : 'Connection error.' });
    }
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); setResult(null); }}
        className={className || 'rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-orange-600'}
      >
        {fr ? '🚀 Démarrer maintenant' : '🚀 Start now'}
      </button>

      {open && (
        <div onClick={() => setOpen(false)} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
          <div onClick={e => e.stopPropagation()} className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0D1F3C] p-6 text-white">
            <button onClick={() => setOpen(false)} aria-label="Fermer" className="absolute right-3 top-3 text-2xl text-slate-400 hover:text-white">×</button>

            {!result?.ok ? (
              <>
                <h3 className="text-xl font-black">{fr ? 'Essayez C-Secur360 gratuitement' : 'Try C-Secur360 free'}</h3>
                <p className="mt-1 text-sm text-slate-300">
                  {fr ? 'Session démo de 1 h pour tester la plateforme. Entrez vos coordonnées pour commencer.' : 'A 1-hour demo session to explore the platform. Enter your details to begin.'}
                </p>
                <form onSubmit={submit} className="mt-4 space-y-3">
                  <input value={name} onChange={e => setName(e.target.value)} placeholder={fr ? 'Votre nom' : 'Your name'} required
                    className="w-full rounded-lg border border-white/10 bg-[#0B1728] px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-orange-500/60 focus:outline-none" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={fr ? 'Votre courriel' : 'Your email'} required
                    className="w-full rounded-lg border border-white/10 bg-[#0B1728] px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-orange-500/60 focus:outline-none" />
                  {result && !result.ok && (
                    <div className="rounded-lg bg-amber-500/15 px-3 py-2 text-xs text-amber-300">{result.message}</div>
                  )}
                  <button type="submit" disabled={loading} className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50">
                    {loading ? '…' : (fr ? 'Démarrer la démo' : 'Start the demo')}
                  </button>
                  {result && !result.ok && (result.status === 'locked' || result.status === 'converted') && (
                    <div className="flex gap-2 pt-1">
                      <a href="/#pricing" onClick={() => setOpen(false)} className="flex-1 rounded-lg border border-white/20 px-3 py-2 text-center text-xs font-bold hover:bg-white/5">{fr ? 'Voir les forfaits' : 'See plans'}</a>
                      <a href="mailto:eric.dufort@cerdia.ai?subject=Abonnement C-Secur360" className="flex-1 rounded-lg border border-white/20 px-3 py-2 text-center text-xs font-bold hover:bg-white/5">{fr ? 'S\'abonner' : 'Subscribe'}</a>
                    </div>
                  )}
                </form>
                <p className="mt-3 text-[10px] leading-tight text-slate-500">{fr ? 'Données de démonstration partagées et temporaires. 1 h/session, 4 h au total.' : 'Shared, temporary demo data. 1h/session, 4h total.'}</p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-black text-emerald-400">{fr ? 'Démo activée ! 🎉' : 'Demo activated! 🎉'}</h3>
                <p className="mt-2 text-sm text-slate-300">
                  {fr ? `Vous avez ${Math.round((result as any).remainingSeconds / 60 || 60)} min pour explorer la plateforme.` : `You have ${Math.round((result as any).remainingSeconds / 60 || 60)} min to explore.`}
                </p>
                <a href="/demo" className="mt-4 block w-full rounded-lg bg-orange-500 px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-orange-600">
                  {fr ? 'Accéder à la démo →' : 'Go to the demo →'}
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
