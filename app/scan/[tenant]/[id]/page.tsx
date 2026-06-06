'use client';

// #82 — Fiche produit PUBLIQUE (cible du QR d'un article). Ouvrable sans application ni connexion
// (route publique, lecture anon de inventory_state via RLS permissive). Présentation pro + logo tenant.
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Package, MapPin, DollarSign, Boxes, AlertTriangle, ShieldCheck, Loader2, Plus, Minus, LogIn, CheckCircle2 } from 'lucide-react';

type Item = any;

function availableQty(item: Item): number {
  if (typeof item.quantity === 'number') return item.quantity;
  const locs = item.locations || item.item_locations || [];
  if (Array.isArray(locs) && locs.length) return locs.reduce((s: number, l: any) => s + (Number(l.quantity ?? l.qty ?? 0) || 0), 0);
  return Number(item.quantity || 0) || 0;
}
function firstPhoto(item: Item): string | null {
  const p = (item.photos && item.photos[0]) || item.photo || null;
  if (!p) return null;
  return typeof p === 'string' ? p : (p.url || p.dataUrl || p.src || null);
}
const money = (n: any) => `${(Number(n) || 0).toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;

export default function PublicScanPage() {
  const params = useParams<{ tenant: string; id: string }>();
  const tenant = String(params?.tenant || '');
  const id = String(params?.id || '');
  const [item, setItem] = useState<Item | null>(null);
  const [logo, setLogo] = useState<string>('/c-secur360-logo.png');
  const [tenantName, setTenantName] = useState<string>('');
  const [state, setState] = useState<'loading' | 'ok' | 'notfound'>('loading');

  // Session app (pour autoriser les mouvements de stock depuis la fiche scannee).
  const [authUser, setAuthUser] = useState<{ name?: string; email?: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Etat du panneau mouvement.
  const [moveType, setMoveType] = useState<'entry' | 'exit'>('exit');
  const [moveQty, setMoveQty] = useState<number>(1);
  const [moveDept, setMoveDept] = useState<string>('');
  const [moveReason, setMoveReason] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [moveMsg, setMoveMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const reloadItem = async () => {
    try {
      const { data } = await supabase.from('inventory_state').select('data').eq('tenant_id', tenant).maybeSingle();
      const list: Item[] = (data?.data?.items) || [];
      const found = list.find(i => String(i.id) === id || i.code === id);
      if (found) setItem(found);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    (async () => {
      // Logo + nom du tenant (best-effort).
      try {
        const { data: cs } = await supabase.from('company_settings').select('logo_url, legal_name').eq('tenant_id', tenant).maybeSingle();
        if (cs?.logo_url) setLogo(cs.logo_url);
        if (cs?.legal_name) setTenantName(cs.legal_name);
      } catch { /* défaut */ }
      // Session app (best-effort) : si connecte, on affichera les boutons +/-.
      try {
        const r = await fetch('/api/auth/me', { credentials: 'include' });
        if (r.ok) { const j = await r.json(); if (j?.user) setAuthUser({ name: j.user.name, email: j.user.email }); }
      } catch { /* anon */ } finally { setAuthChecked(true); }
      // Article depuis l'instantané inventaire.
      try {
        const { data } = await supabase.from('inventory_state').select('data').eq('tenant_id', tenant).maybeSingle();
        const list: Item[] = (data?.data?.items) || [];
        const found = list.find(i => String(i.id) === id || i.code === id);
        if (found) { setItem(found); setState('ok'); return; }
      } catch { /* ignore */ }
      setState('notfound');
    })();
  }, [tenant, id]);

  // Pre-selection de la succursale par defaut (article multi-emplacement).
  useEffect(() => {
    if (!item) return;
    if (item.isMultiLocation && Array.isArray(item.locations) && item.locations.length && !moveDept) {
      const first = item.locations[0];
      if (first?.departmentCode) setMoveDept(String(first.departmentCode));
    }
  }, [item]); // eslint-disable-line react-hooks/exhaustive-deps

  const submitMovement = async () => {
    if (!item || busy) return;
    setMoveMsg(null);
    const qty = Math.abs(Number(moveQty) || 0);
    if (!(qty > 0)) { setMoveMsg({ kind: 'err', text: 'Entre une quantité valide.' }); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/inventory/movement', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant, itemId: String(item.id), departmentCode: moveDept || null, type: moveType, quantity: qty, reason: moveReason }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.success) {
        const extra = j?.available != null ? ` (disponible : ${j.available})` : '';
        setMoveMsg({ kind: 'err', text: (j?.error || 'Échec du mouvement') + extra });
      } else {
        setMoveMsg({ kind: 'ok', text: `${moveType === 'exit' ? 'Sortie' : 'Entrée'} de ${qty} enregistrée. Nouveau stock : ${j.quantity}.` });
        setMoveReason('');
        await reloadItem();
      }
    } catch (e: any) {
      setMoveMsg({ kind: 'err', text: 'Réseau indisponible : ' + (e?.message || e) });
    } finally { setBusy(false); }
  };

  if (state === 'loading') {
    return <div className="min-h-screen grid place-items-center bg-slate-50 text-slate-400"><Loader2 className="animate-spin" /></div>;
  }
  if (state === 'notfound' || !item) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 p-6">
        <div className="max-w-sm w-full rounded-2xl bg-white p-6 text-center shadow">
          <AlertTriangle className="mx-auto text-amber-500" size={36} />
          <h1 className="mt-3 text-lg font-bold text-slate-800">Article introuvable</h1>
          <p className="mt-1 text-sm text-slate-500">Ce code QR ne correspond à aucun article actif.</p>
        </div>
      </div>
    );
  }

  const qty = availableQty(item);
  const photo = firstPhoto(item);
  const min = item.minQuantity != null ? Number(item.minQuantity) : null;
  const max = item.maxQuantity != null ? Number(item.maxQuantity) : null;
  const low = min != null && qty <= min;
  const locations = item.locations || item.item_locations || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 p-4">
      <div className="mx-auto max-w-md">
        {/* En-tête de marque */}
        <div className="flex items-center justify-between rounded-t-2xl bg-white px-5 py-4 shadow">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt="logo" className="h-9 w-auto object-contain" onError={(e) => { (e.target as HTMLImageElement).src = '/c-secur360-logo.png'; }} />
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{tenantName || tenant}</span>
        </div>

        <div className="space-y-4 rounded-b-2xl bg-white px-5 pb-6 pt-2 shadow">
          {/* Identité produit */}
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-400">
              <Package size={15} />
              <span className="font-mono text-xs">{item.code || '—'}</span>
              {item.category && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">{item.category}</span>}
            </div>
            <h1 className="mt-1 text-2xl font-extrabold leading-tight text-slate-900">{item.name}</h1>
          </div>

          {photo && <img src={photo} alt={item.name} className="h-48 w-full rounded-xl border border-slate-200 object-cover" />}

          {/* Prix + dispo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3 text-center">
              <DollarSign className="mx-auto text-emerald-600" size={18} />
              <div className="mt-1 text-xl font-extrabold text-emerald-700">{money(item.salePrice ?? item.sale_price)}</div>
              <div className="text-[11px] text-slate-500">Prix vendant</div>
            </div>
            <div className={`rounded-xl border-2 p-3 text-center ${low ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
              <Boxes className={`mx-auto ${low ? 'text-red-600' : 'text-blue-600'}`} size={18} />
              <div className={`mt-1 text-xl font-extrabold ${low ? 'text-red-700' : 'text-blue-700'}`}>{qty} {item.unit || ''}</div>
              <div className="text-[11px] text-slate-500">Disponible{low ? ' ⚠️' : ''}</div>
            </div>
          </div>

          {/* Min / Max */}
          {(min != null || max != null) && (
            <div className="flex items-center justify-center gap-6 rounded-lg bg-slate-50 py-2 text-sm">
              <span className="text-slate-500">Min : <strong className="text-slate-800">{min ?? '—'}</strong></span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">Max : <strong className="text-slate-800">{max ?? '—'}</strong></span>
            </div>
          )}

          {/* Description */}
          {item.description && <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{item.description}</p>}

          {/* Emplacement(s) */}
          {(item.location || locations.length > 0) && (
            <div className="flex items-start gap-2 text-sm text-slate-600">
              <MapPin size={16} className="mt-0.5 flex-shrink-0 text-slate-400" />
              <span>{item.location || locations.map((l: any) => `${l.location || l.name || l.department || ''}${(l.quantity ?? l.qty) != null ? ` (${l.quantity ?? l.qty})` : ''}`).filter(Boolean).join(' · ')}</span>
            </div>
          )}

          {/* ===== Mouvement de stock (connecte uniquement) ===== */}
          {authChecked && (authUser ? (
            <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">Mouvement de stock</span>
                <span className="truncate pl-2 text-[11px] text-slate-400">{authUser.name || authUser.email}</span>
              </div>

              {/* Entree / Sortie */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMoveType('entry')}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border-2 py-2 text-sm font-bold transition ${moveType === 'entry' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-emerald-200 bg-white text-emerald-700'}`}
                >
                  <Plus size={16} /> Entrée
                </button>
                <button
                  onClick={() => setMoveType('exit')}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border-2 py-2 text-sm font-bold transition ${moveType === 'exit' ? 'border-red-500 bg-red-500 text-white' : 'border-red-200 bg-white text-red-700'}`}
                >
                  <Minus size={16} /> Sortie
                </button>
              </div>

              {/* Succursale (si multi-emplacement) */}
              {item.isMultiLocation && Array.isArray(item.locations) && item.locations.length > 0 && (
                <select
                  value={moveDept}
                  onChange={(e) => setMoveDept(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                >
                  {item.locations.map((l: any, i: number) => (
                    <option key={i} value={String(l.departmentCode || '')}>
                      {(l.department || l.location || `Emplacement ${i + 1}`)}{l.quantity != null ? ` — ${l.quantity} dispo` : ''}
                    </option>
                  ))}
                </select>
              )}

              {/* Quantite */}
              <div className="mt-2 flex items-center gap-2">
                <button onClick={() => setMoveQty(q => Math.max(1, (Number(q) || 1) - 1))} className="h-10 w-10 flex-shrink-0 rounded-lg border border-slate-300 bg-white text-lg font-bold text-slate-600">−</button>
                <input
                  type="number" min={1} inputMode="numeric"
                  value={moveQty}
                  onChange={(e) => setMoveQty(Math.max(1, parseInt(e.target.value || '1', 10) || 1))}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-center text-lg font-bold text-slate-900"
                />
                <button onClick={() => setMoveQty(q => (Number(q) || 1) + 1)} className="h-10 w-10 flex-shrink-0 rounded-lg border border-slate-300 bg-white text-lg font-bold text-slate-600">+</button>
              </div>

              {/* Raison (optionnel) */}
              <input
                type="text" value={moveReason} maxLength={300}
                onChange={(e) => setMoveReason(e.target.value)}
                placeholder="Raison (optionnel)"
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
              />

              {/* Valider */}
              <button
                onClick={submitMovement}
                disabled={busy}
                className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-base font-extrabold text-white shadow transition disabled:opacity-60 ${moveType === 'exit' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              >
                {busy ? <Loader2 className="animate-spin" size={18} /> : (moveType === 'exit' ? <Minus size={18} /> : <Plus size={18} />)}
                {busy ? 'Enregistrement…' : `Confirmer la ${moveType === 'exit' ? 'sortie' : 'entrée'} de ${moveQty}`}
              </button>

              {moveMsg && (
                <div className={`mt-2 flex items-start gap-2 rounded-lg p-2 text-sm ${moveMsg.kind === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                  {moveMsg.kind === 'ok' ? <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" /> : <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />}
                  <span>{moveMsg.text}</span>
                </div>
              )}
            </div>
          ) : (
            <a
              href={`/${tenant}/login?redirect=${encodeURIComponent(`/scan/${tenant}/${id}`)}`}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-blue-200 bg-blue-50 py-3 text-sm font-bold text-blue-700"
            >
              <LogIn size={16} /> Se connecter pour faire une entrée / sortie
            </a>
          ))}

          <div className="flex items-center justify-center gap-1.5 pt-2 text-[11px] text-slate-400">
            <ShieldCheck size={13} /> Fiche officielle · C-Secur360
          </div>
        </div>
      </div>
    </div>
  );
}
