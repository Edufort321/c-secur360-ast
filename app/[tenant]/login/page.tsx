'use client';

import { Suspense, useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Lock, Mail, Shield, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

function LoginForm() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenant = (params?.tenant as string) || 'cerdia';
  const redirectTo = searchParams?.get('redirect') || `/${tenant}/modules`;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const { user } = await res.json();
          if (user) { router.replace(redirectTo); return; }
        }
      } finally {
        setCheckingSession(false);
      }
    })();
  }, [router, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur de connexion');
        return;
      }
      router.replace(redirectTo);
    } catch {
      setError('Erreur réseau — réessaie dans un instant');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1728]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1728] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background geometric pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, #F26522 0, #F26522 1px, transparent 0, transparent 50%)',
        backgroundSize: '30px 30px'
      }} />
      {/* Radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-xs mb-8 transition">
          <ArrowLeft size={13} /> Retour
        </Link>

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/logo.png"
            alt="C-Secur360"
            width={56}
            height={56}
            className="h-14 w-auto object-contain"
            priority
          />
        </div>

        {/* Card */}
        <div className="bg-[#0D1F3C] border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/40">
          {/* Badge tenant */}
          <div className="flex justify-center mb-5">
            <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/30 rounded-full px-3 py-1">
              <Shield size={11} className="text-orange-400" />
              <span className="text-orange-300 text-xs font-semibold uppercase tracking-widest truncate max-w-[180px]">
                {tenant}
              </span>
            </div>
          </div>

          <h1 className="text-center text-xl font-black text-white mb-1">Connexion</h1>
          <p className="text-center text-sm text-slate-400 mb-6">
            Acces a votre espace securitaire
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Courriel
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="nom@entreprise.com"
                  className="w-full bg-[#0B1728] border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-600 outline-none transition focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-[#0B1728] border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-600 outline-none transition focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30"
                />
              </div>
            </div>

            <label className="flex cursor-pointer select-none items-center gap-2.5">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 accent-orange-500"
              />
              <span className="text-sm text-slate-400">Se souvenir 7 jours</span>
            </label>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 py-3 font-bold text-white transition disabled:opacity-60 shadow-lg shadow-orange-500/20"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              Se connecter
            </button>

            <div className="text-center">
              <Link href={`/${tenant}/forgot-password`}
                className="text-xs text-slate-500 hover:text-slate-300 transition">
                Mot de passe oublié?
              </Link>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          C-Secur360 · Securite industrielle
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#0B1728]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
