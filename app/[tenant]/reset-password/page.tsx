'use client';

import { Suspense, useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Loader2, Lock, ArrowLeft, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

function ResetPasswordForm() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tenant = (params?.tenant as string) || 'cerdia';
  const token = searchParams?.get('token') || '';

  const [tokenState, setTokenState] = useState<'checking' | 'valid' | 'invalid'>('checking');
  const [tokenError, setTokenError] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { setTokenState('invalid'); setTokenError('Token manquant.'); return; }
    fetch(`/api/auth/reset-password?token=${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.valid) { setTokenState('valid'); setUserEmail(d.email || ''); }
        else { setTokenState('invalid'); setTokenError(d.error || 'Lien invalide.'); }
      })
      .catch(() => { setTokenState('invalid'); setTokenError('Erreur réseau.'); });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    if (password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erreur'); return; }
      setDone(true);
      setTimeout(() => router.replace(`/${tenant}/login`), 3000);
    } catch {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1728] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, #F26522 0, #F26522 1px, transparent 0, transparent 50%)',
        backgroundSize: '30px 30px'
      }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        <Link href={`/${tenant}/login`} className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-xs mb-8 transition">
          <ArrowLeft size={13} /> Retour à la connexion
        </Link>

        <div className="flex justify-center mb-8">
          <Image src="/logo.png" alt="C-Secur360" width={56} height={56} className="h-14 w-auto object-contain" priority />
        </div>

        <div className="bg-[#0D1F3C] border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/40">
          <div className="flex justify-center mb-5">
            <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/30 rounded-full px-3 py-1">
              <Shield size={11} className="text-orange-400" />
              <span className="text-orange-300 text-xs font-semibold uppercase tracking-widest truncate max-w-[180px]">{tenant}</span>
            </div>
          </div>

          {tokenState === 'checking' && (
            <div className="flex flex-col items-center gap-3 py-6 text-slate-400">
              <Loader2 size={28} className="animate-spin" />
              <p className="text-sm">Vérification du lien…</p>
            </div>
          )}

          {tokenState === 'invalid' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center"><AlertCircle size={48} className="text-red-400" /></div>
              <h1 className="text-xl font-black text-white">Lien invalide</h1>
              <p className="text-sm text-slate-400">{tokenError}</p>
              <Link href={`/${tenant}/forgot-password`}
                className="inline-block mt-2 rounded-xl bg-orange-500 hover:bg-orange-600 px-5 py-2.5 text-sm font-bold text-white transition">
                Redemander un lien
              </Link>
            </div>
          )}

          {tokenState === 'valid' && done && (
            <div className="text-center space-y-4">
              <div className="flex justify-center"><CheckCircle size={48} className="text-emerald-400" /></div>
              <h1 className="text-xl font-black text-white">Mot de passe mis à jour</h1>
              <p className="text-sm text-slate-400">Vous allez être redirigé vers la page de connexion…</p>
            </div>
          )}

          {tokenState === 'valid' && !done && (
            <>
              <h1 className="text-center text-xl font-black text-white mb-1">Nouveau mot de passe</h1>
              {userEmail && <p className="text-center text-xs text-slate-500 mb-5">{userEmail}</p>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Nouveau mot de passe</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required minLength={6}
                      placeholder="Min. 6 caractères"
                      className="w-full bg-[#0B1728] border border-white/10 rounded-xl py-2.5 pl-9 pr-16 text-sm text-white placeholder-slate-600 outline-none transition focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30"
                    />
                    <button type="button" onClick={() => setShowPwd(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300 font-semibold">
                      {showPwd ? 'Cacher' : 'Voir'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Confirmer</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      required
                      placeholder="Répétez le mot de passe"
                      className="w-full bg-[#0B1728] border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-600 outline-none transition focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30"
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{error}</div>
                )}

                <button type="submit" disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 py-3 font-bold text-white transition disabled:opacity-60 shadow-lg shadow-orange-500/20">
                  {loading && <Loader2 size={15} className="animate-spin" />}
                  Enregistrer le mot de passe
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">C-Secur360 · Securite industrielle</p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#0B1728]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
