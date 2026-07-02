'use client';

import { useEffect, useRef, useState } from 'react';

// Bouton "Démarrer maintenant" : capture Nom + courriel, démarre une session démo limitée
// (notif propriétaire par SMS côté serveur), puis donne accès au bac à sable /demo.
export function DemoStartButton({ fr = true, className = '', label }: { fr?: boolean; className?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; status: string; message: string } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Accessibilité : quand la modale est ouverte — focus le 1er champ, piège le focus (Tab),
  // ferme avec Échap, et restaure le focus au déclencheur à la fermeture.
  useEffect(() => {
    if (!open) return;
    const prev = (typeof document !== 'undefined' ? document.activeElement : null) as HTMLElement | null;
    const focusables = () => Array.from(
      contentRef.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])') || []
    );
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); return; }
      if (e.key !== 'Tab') return;
      const f = focusables();
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); prev?.focus?.(); };
  }, [open]);

  // Lien de partage : ouverture automatique du formulaire si l'URL contient ?demo=1 ou #demo.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    if (p.get('demo') === '1' || window.location.hash === '#demo') { setOpen(true); setResult(null); }
  }, []);

  // Formate le temps restant en h/min (la démo est un chrono TOTAL de 4 h, repris entre les sessions).
  const remSecs = (result as any)?.remainingSeconds || 0;
  const remH = Math.floor(remSecs / 3600);
  const remM = Math.round((remSecs % 3600) / 60);
  const remStr = remH > 0 ? `${remH} h${remM ? ` ${remM} min` : ''}` : `${remM} min`;

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
      // Mémorise l'échéance pour le compte à rebours affiché sur l'espace /demo.
      if (data?.ok && data?.remainingSeconds) {
        try { localStorage.setItem('demoExpiresAt', String(Date.now() + data.remainingSeconds * 1000)); } catch { /* ignore */ }
      }
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
        {label || (fr ? '🚀 Démarrer maintenant' : '🚀 Start now')}
      </button>

      {open && (
        <div onClick={() => setOpen(false)} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
          <div ref={contentRef} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true"
            aria-label={fr ? 'Démarrer la démo gratuite' : 'Start the free demo'}
            className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0D1F3C] p-6 text-white">
            <button onClick={() => setOpen(false)} aria-label="Fermer" className="absolute right-3 top-3 text-2xl text-slate-400 hover:text-white">×</button>

            {!result?.ok ? (
              <>
                <h3 className="text-xl font-black">{fr ? 'Essayez C-Secur360 gratuitement' : 'Try C-Secur360 free'}</h3>
                <p className="mt-1 text-sm text-slate-300">
                  {fr ? 'Accès démo de 4 h pour tester la plateforme. Entrez vos coordonnées pour commencer.' : 'A 4-hour demo to explore the platform. Enter your details to begin.'}
                </p>
                <form onSubmit={submit} className="mt-4 space-y-3">
                  <input value={name} onChange={e => setName(e.target.value)} placeholder={fr ? 'Votre nom' : 'Your name'} required
                    className="w-full rounded-lg border border-white/10 bg-[#0B1728] px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-orange-500/60 focus:outline-none" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={fr ? 'Votre courriel' : 'Your email'} required
                    className="w-full rounded-lg border border-white/10 bg-[#0B1728] px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-orange-500/60 focus:outline-none" />
                  {result && !result.ok && (
                    <div className="rounded-lg bg-amber-500/15 px-3 py-2 text-xs text-amber-300">{result.message}</div>
                  )}
                  <p className="text-[10px] leading-tight text-slate-400">
                    {fr ? (
                      <>
                        En soumettant, vous acceptez que votre nom et votre courriel soient utilisés
                        pour activer et faire le suivi de votre démo. Aucune revente.{' '}
                        <a href="/confidentialite" target="_blank" rel="noopener noreferrer" className="text-orange-400 underline hover:text-orange-300">
                          Politique de confidentialité
                        </a>.
                      </>
                    ) : (
                      <>
                        By submitting, you agree that your name and email will be used to activate and
                        follow up on your demo. No resale.{' '}
                        <a href="/confidentialite" target="_blank" rel="noopener noreferrer" className="text-orange-400 underline hover:text-orange-300">
                          Privacy policy
                        </a>.
                      </>
                    )}
                  </p>
                  <button type="submit" disabled={loading} className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50">
                    {loading ? '…' : (fr ? 'Démarrer la démo' : 'Start the demo')}
                  </button>
                  {result && !result.ok && (result.status === 'locked' || result.status === 'converted') && (
                    <div className="flex gap-2 pt-1">
                      <a href="/#pricing" onClick={() => setOpen(false)} className="flex-1 rounded-lg border border-white/20 px-3 py-2 text-center text-xs font-bold hover:bg-white/5">{fr ? 'Voir les forfaits' : 'See plans'}</a>
                      <a href="mailto:info@cerdia.ai?subject=Abonnement C-Secur360" className="flex-1 rounded-lg border border-white/20 px-3 py-2 text-center text-xs font-bold hover:bg-white/5">{fr ? 'S\'abonner' : 'Subscribe'}</a>
                    </div>
                  )}
                </form>
                <p className="mt-3 text-[10px] leading-tight text-slate-500">{fr ? 'Données de démonstration partagées et temporaires. 4 h de chrono au total.' : 'Shared, temporary demo data. 4-hour total timer.'}</p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-black text-emerald-400">{fr ? 'Démo de 4 heures activée ! 🎉' : '4-hour demo activated! 🎉'}</h3>
                <p className="mt-2 text-sm text-slate-300">
                  {fr ? `Accès démo de 4 heures au total. Temps restant : ${remStr}.` : `4-hour total demo access. Time left: ${remStr}.`}
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
