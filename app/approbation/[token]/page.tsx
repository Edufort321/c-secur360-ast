'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

// Page PUBLIQUE d'approbation client (sans login) : le client ouvre le lien, voit le document
// (soumission / facture / feuille de temps) puis APPROUVE ou REFUSE en signant (nom). Le statut
// remonte dans l'app via la route serveur /api/documents/share (table fermée à l'anon).
type DocLine = { label: string; amount: string };
type Doc = { title: string; number: string; clientName: string; date: string; lines: DocLine[]; total: string; status?: string };
type Share = { status: string; approver_name?: string; signature?: string; decided_at?: string; note?: string };

export default function ApprobationPage() {
  const params = useParams();
  const token = (params?.token as string) || '';
  const [doc, setDoc] = useState<Doc | null>(null);
  const [share, setShare] = useState<Share | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const r = await fetch(`/api/documents/share?token=${encodeURIComponent(token)}`);
      const j = await r.json();
      if (!r.ok) { setError(j.error || 'Lien invalide'); return; }
      setDoc(j.document); setShare(j.share);
    } catch { setError('Erreur réseau'); } finally { setLoading(false); }
  };
  useEffect(() => { if (token) load(); }, [token]); // eslint-disable-line

  const decide = async (decision: 'approved' | 'declined') => {
    if (!name.trim()) { setError('Veuillez inscrire votre nom pour signer.'); return; }
    setBusy(true); setError('');
    try {
      const r = await fetch(`/api/documents/share?token=${encodeURIComponent(token)}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, approverName: name, approverEmail: email, signature: name, note }),
      });
      const j = await r.json();
      if (!r.ok) { setError(j.error || 'Erreur'); return; }
      await load();
    } catch { setError('Erreur réseau'); } finally { setBusy(false); }
  };

  if (loading) return <div className="grid min-h-screen place-items-center text-gray-400">…</div>;
  if (error && !doc) return <div className="grid min-h-screen place-items-center px-4 text-center text-gray-600">{error}</div>;
  const decided = share && share.status !== 'pending';

  return (
    <div className="min-h-screen bg-gray-100 py-8 text-gray-900">
      <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* En-tête style document */}
        <div className="border-b border-gray-200 px-6 py-5">
          <img src="/c-secur360-logo.png" alt="" style={{ height: 36 }} className="mb-3" />
          <h1 className="text-xl font-bold">{doc?.title} {doc?.number}</h1>
          <p className="text-sm text-gray-500">{doc?.clientName}{doc?.date ? ` · ${doc.date}` : ''}</p>
        </div>

        {/* Lignes + total */}
        <div className="px-6 py-4">
          <table className="w-full text-sm">
            <tbody>
              {(doc?.lines || []).map((l, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-1.5 pr-2 text-gray-700">{l.label}</td>
                  <td className="py-1.5 text-right text-gray-900">{l.amount}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 font-bold">
                <td className="py-2">TOTAL</td>
                <td className="py-2 text-right text-emerald-700">{doc?.total}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Approbation */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-5">
          {decided ? (
            <div className={`rounded-xl border px-4 py-3 text-sm ${share!.status === 'approved' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
              <p className="font-bold">{share!.status === 'approved' ? '✓ Document approuvé' : '✗ Document refusé'}</p>
              <p className="mt-1">Par <strong>{share!.approver_name}</strong>{share!.decided_at ? ` le ${new Date(share!.decided_at).toLocaleDateString('fr-CA')}` : ''}.</p>
              {share!.note && <p className="mt-1 italic">« {share!.note} »</p>}
            </div>
          ) : (
            <>
              <h2 className="mb-3 text-sm font-bold text-gray-700">Approbation</h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Votre nom (signature) *" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Votre courriel (optionnel)" className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Note (optionnel)" rows={2} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => decide('approved')} disabled={busy} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{busy ? '…' : '✓ J\'approuve'}</button>
                <button onClick={() => decide('declined')} disabled={busy} className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50">✗ Je refuse</button>
              </div>
              <p className="mt-2 text-[11px] text-gray-400">En cliquant « J'approuve », vous signez électroniquement ce document (nom + date enregistrés).</p>
            </>
          )}
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-gray-400">Propulsé par C-Secur360</p>
    </div>
  );
}
