'use client';

import React, { useState } from 'react';
import { LogIn, Mail, Lock, Loader2, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Identifiants invalides');
        setLoading(false);
        return;
      }
      const redirect = new URLSearchParams(window.location.search).get('redirect');
      window.location.href = redirect || '/admin/dashboard';
    } catch {
      setError('Erreur réseau');
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gray-100 px-4 text-gray-900">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* En-tête sombre (style planner/inventaire) */}
        <div className="flex items-center gap-3 bg-gray-900 px-6 py-5 text-white">
          <img src="/logo.png" alt="C-Secur360" className="h-10 w-auto" />
          <div>
            <h1 className="text-lg font-bold leading-tight">Connexion C-Secur360</h1>
            <p className="text-xs text-gray-300">Accès sécurisé à la plateforme</p>
          </div>
        </div>

        {/* Corps clair */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-gray-700">Courriel</span>
            <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/30">
              <Mail size={16} className="text-gray-400" />
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="vous@entreprise.com" autoComplete="email"
                className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-gray-700">Mot de passe</span>
            <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/30">
              <Lock size={16} className="text-gray-400" />
              <input
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" autoComplete="current-password"
                className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />
            </div>
          </label>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
            Se connecter
          </button>

          <p className="pt-1 text-center text-xs text-gray-400">
            C-Secur360 · Plateforme modulaire
          </p>
        </form>
      </div>
    </div>
  );
}
