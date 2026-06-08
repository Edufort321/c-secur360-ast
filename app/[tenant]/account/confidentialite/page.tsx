'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Shield, Download, Send, Loader2, ArrowLeft } from 'lucide-react';

const KINDS = [
  { value: 'access', label: 'Accéder à mes renseignements' },
  { value: 'rectification', label: 'Rectifier des renseignements inexacts' },
  { value: 'deletion', label: 'Supprimer mes renseignements (droit à l’oubli)' },
  { value: 'withdrawal', label: 'Retirer mon consentement' },
  { value: 'portability', label: 'Obtenir mes données (portabilité)' },
];

export default function AccountPrivacyPage() {
  const params = useParams();
  const tenant = (params?.tenant as string) || '';
  const [kind, setKind] = useState('access');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true); setResult(null); setError(null);
    try {
      const resp = await fetch('/api/account/privacy-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, message, tenant }),
      });
      const j = await resp.json();
      if (!resp.ok || j.error) throw new Error(j.error || 'Erreur');
      setResult(j.message || 'Demande reçue.');
      setMessage('');
    } catch (e: any) { setError(e?.message || 'Erreur'); }
    finally { setSending(false); }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href={`/${tenant}/modules`} className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={15} /> Retour aux modules
      </Link>

      <div className="mb-6 flex items-center gap-2">
        <Shield className="text-emerald-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mes renseignements personnels</h1>
      </div>
      <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
        Conformément à la <b>Loi 25</b> (Québec), vous pouvez consulter, rectifier, faire supprimer vos
        renseignements, retirer votre consentement ou en obtenir une copie. Nous répondons dans un délai de 30 jours.
      </p>

      {/* Export immédiat */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-1 font-semibold text-gray-900 dark:text-white">Télécharger mes données</h2>
        <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">Exporte immédiatement, en format JSON, les renseignements que nous détenons à votre sujet (compte, sessions, fiche personnel, journal d’activité).</p>
        <a href="/api/account/export" className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
          <Download size={16} /> Exporter mes données (JSON)
        </a>
      </div>

      {/* Demande formelle */}
      <form onSubmit={submit} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-3 font-semibold text-gray-900 dark:text-white">Déposer une demande</h2>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">Type de demande</label>
        <select value={kind} onChange={e => setKind(e.target.value)} className="mb-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900">
          {KINDS.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
        </select>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">Précisions (facultatif)</label>
        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} className="mb-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900" placeholder="Ex. : quelle information rectifier, motif…" />
        <button type="submit" disabled={sending} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Envoyer la demande
        </button>
        {result && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">{result}</p>}
        {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{error}</p>}
      </form>

      <p className="mt-6 text-xs text-gray-400">
        Vous pouvez aussi écrire au responsable de la protection des renseignements personnels, ou porter plainte
        à la Commission d’accès à l’information du Québec. Voir la <Link href="/confidentialite" className="underline">politique de confidentialité</Link>.
      </p>
    </div>
  );
}
