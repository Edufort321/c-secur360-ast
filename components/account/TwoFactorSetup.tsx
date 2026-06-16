'use client';
// Enrôlement 2FA (TOTP) self-service : configurer (QR), activer (code), codes de secours, désactiver.
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Loader2, ShieldCheck, ShieldOff, Copy } from 'lucide-react';

export function TwoFactorSetup() {
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [step, setStep] = useState<'idle' | 'setup' | 'done'>('idle');
  const [uri, setUri] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [backup, setBackup] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function load() { setLoading(true); try { const r = await fetch('/api/auth/2fa', { credentials: 'include' }); const j = await r.json(); setEnabled(!!j.enabled); } catch { /* noop */ } setLoading(false); }
  useEffect(() => { load(); }, []);

  async function setup() {
    setBusy(true); setMsg(null);
    try { const r = await fetch('/api/auth/2fa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ action: 'setup' }) }); const j = await r.json(); if (!r.ok) throw new Error(j.error); setUri(j.uri); setSecret(j.secret); setStep('setup'); }
    catch (e: any) { setMsg({ ok: false, text: e?.message || 'Erreur' }); } finally { setBusy(false); }
  }
  async function enable() {
    setBusy(true); setMsg(null);
    try { const r = await fetch('/api/auth/2fa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ action: 'enable', code }) }); const j = await r.json(); if (!r.ok) throw new Error(j.error); setBackup(j.backupCodes || []); setStep('done'); setEnabled(true); setCode(''); }
    catch (e: any) { setMsg({ ok: false, text: e?.message || 'Code invalide' }); } finally { setBusy(false); }
  }
  async function disable() {
    const c = window.prompt('Pour désactiver le 2FA, entrez un code de votre application (ou un code de secours) :') || '';
    if (!c) return;
    setBusy(true); setMsg(null);
    try { const r = await fetch('/api/auth/2fa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ action: 'disable', code: c }) }); const j = await r.json(); if (!r.ok) throw new Error(j.error); setEnabled(false); setStep('idle'); setMsg({ ok: true, text: '2FA désactivé.' }); }
    catch (e: any) { setMsg({ ok: false, text: e?.message || 'Erreur' }); } finally { setBusy(false); }
  }

  if (loading) return <div className="flex items-center gap-2 p-4 text-slate-400"><Loader2 className="animate-spin" size={16} /> Chargement…</div>;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-2">
        {enabled ? <ShieldCheck className="text-emerald-600" size={18} /> : <ShieldOff className="text-slate-400" size={18} />}
        <h2 className="font-bold text-slate-900 dark:text-white">Authentification à deux facteurs (2FA)</h2>
        {enabled && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">Activé</span>}
      </div>
      <p className="mt-1 text-sm text-slate-500">Ajoute un code temporaire (application d'authentification) à votre connexion — fortement recommandé pour les accès finance/RH.</p>
      {msg && <div className={`mt-3 rounded-lg px-3 py-2 text-sm ${msg.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{msg.text}</div>}

      {enabled ? (
        step === 'done' && backup.length > 0 ? (
          <div className="mt-4">
            <p className="text-sm font-semibold text-amber-700">Conservez ces codes de secours (usage unique) en lieu sûr :</p>
            <div className="mt-2 grid grid-cols-2 gap-1.5 rounded-lg bg-slate-50 p-3 font-mono text-sm dark:bg-slate-900/40">
              {backup.map((c, i) => <span key={i} className="text-slate-700 dark:text-slate-200">{c}</span>)}
            </div>
            <button onClick={() => { navigator.clipboard.writeText(backup.join('\n')).catch(() => {}); }} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"><Copy size={12} /> Copier les codes</button>
            <div className="mt-3"><button onClick={() => setStep('idle')} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">J'ai sauvegardé mes codes</button></div>
          </div>
        ) : (
          <button onClick={disable} disabled={busy} className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-500/40 dark:text-red-400">{busy ? <Loader2 size={14} className="animate-spin" /> : <ShieldOff size={14} />} Désactiver le 2FA</button>
        )
      ) : step === 'setup' ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">1. Scannez ce QR avec Google Authenticator, Microsoft Authenticator, Authy…</p>
          <div className="inline-block rounded-xl bg-white p-3"><QRCodeSVG value={uri} size={168} /></div>
          <p className="text-xs text-slate-500">Ou entrez la clé manuellement : <span className="font-mono text-slate-700 dark:text-slate-200">{secret}</span></p>
          <p className="text-sm text-slate-600 dark:text-slate-300">2. Entrez le code à 6 chiffres généré :</p>
          <div className="flex gap-2">
            <input value={code} onChange={e => setCode(e.target.value.replace(/\s/g, '').slice(0, 6))} placeholder="123456" inputMode="numeric" className="w-40 rounded-lg border border-slate-300 bg-white px-3 py-2 text-center font-mono text-lg tracking-[0.3em] dark:border-slate-600 dark:bg-slate-900" />
            <button onClick={enable} disabled={busy || code.length < 6} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{busy ? <Loader2 size={14} className="animate-spin" /> : 'Activer'}</button>
          </div>
        </div>
      ) : (
        <button onClick={setup} disabled={busy} className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{busy ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />} Configurer le 2FA</button>
      )}
    </div>
  );
}
