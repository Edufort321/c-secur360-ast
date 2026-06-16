'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, KeyRound, ShieldCheck } from 'lucide-react';
import { PortalHeader } from '@/components/PortalHeader';
import { TwoFactorSetup } from '@/components/account/TwoFactorSetup';

// Changement de mot de passe par l'utilisateur connecté (1re connexion ou en tout temps).
export default function ChangePasswordPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || '';
  const router = useRouter();
  const [first, setFirst] = useState(false);
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' }).then(r => r.ok ? r.json() : null).then(j => { if (j?.user?.firstLogin) setFirst(true); }, () => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (next.length < 6) { setMsg({ ok: false, text: 'Au moins 6 caractères.' }); return; }
    if (next !== confirm) { setMsg({ ok: false, text: 'Les deux mots de passe ne correspondent pas.' }); return; }
    setBusy(true);
    try {
      const r = await fetch('/api/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ currentPassword: cur, newPassword: next }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j.error) { setMsg({ ok: false, text: j.error || 'Erreur.' }); setBusy(false); return; }
      setMsg({ ok: true, text: 'Mot de passe changé ✓' });
      setTimeout(() => router.push(`/${tenant}/modules`), 900);
    } catch { setMsg({ ok: false, text: 'Erreur réseau.' }); setBusy(false); }
  }

  const inp = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <PortalHeader tenant={tenant} />
      <div className="mx-auto max-w-md px-4 py-10">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-white"><KeyRound size={22} /></div>
          <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mot de passe</h1><p className="text-sm text-slate-500">Changez votre mot de passe</p></div>
        </div>
        {first && <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">🔐 Première connexion : pour votre sécurité, choisissez un nouveau mot de passe personnel (différent de celui fourni par votre administrateur).</div>}
        <form onSubmit={submit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <label className="block text-xs font-semibold text-slate-500">Mot de passe actuel<input type="password" className={`mt-1 ${inp}`} value={cur} onChange={e => setCur(e.target.value)} autoComplete="current-password" required /></label>
          <label className="block text-xs font-semibold text-slate-500">Nouveau mot de passe<input type="password" className={`mt-1 ${inp}`} value={next} onChange={e => setNext(e.target.value)} autoComplete="new-password" required /></label>
          <label className="block text-xs font-semibold text-slate-500">Confirmer le nouveau mot de passe<input type="password" className={`mt-1 ${inp}`} value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" required /></label>
          {msg && <div className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'}`}>{msg.text}</div>}
          <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{busy ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />} Enregistrer</button>
        </form>
        <p className="mt-3 text-center text-xs text-slate-400">Mot de passe oublié ? Déconnectez-vous puis utilisez « Mot de passe oublié » sur la page de connexion.</p>
        <div className="mt-6"><TwoFactorSetup /></div>
      </div>
    </div>
  );
}
