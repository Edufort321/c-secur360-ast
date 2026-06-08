'use client';

import React, { useEffect, useState } from 'react';
import { Package, Loader2, Check, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';

// R6 — Lien intermodule Projet -> Inventaire RÉEL (snapshot inventory_state.data, même source que le
// module Inventaire et la fiche scannée). On lit les articles du snapshot ; la consommation passe par
// /api/inventory/movement (sortie 'exit' référencée au projet) qui décrémente la bonne succursale et
// append le mouvement dans inventory_state. Plus de dépendance aux tables items/item_locations/movements.

type Loc = { department: string; departmentCode: string | null; location?: string | null; quantity: number };
type Item = { id: string; code: string; name: string; unit?: string | null; costPrice?: number | null; quantity: number; isMultiLocation?: boolean; locations: Loc[] };
type Mvt = { id?: string; itemId: string; itemName?: string; quantity: number; department?: string | null; reason?: string | null; date?: string; timestamp?: string; projectCode?: string };

const money = (n: number) => `${(Math.round((n || 0) * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $`;

export function ConsumeMaterialPanel({ tenant, projectNumber }: { tenant: string; projectNumber: string }) {
  const { lang } = useLanguage();
  const tr = (fr: string, en: string) => (lang === 'fr' ? fr : en);

  const [items, setItems] = useState<Item[]>([]);
  const [moves, setMoves] = useState<Mvt[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [itemId, setItemId] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [qty, setQty] = useState(1);

  const itemMap = Object.fromEntries(items.map(i => [i.id, i]));
  const selItem = itemMap[itemId];
  const selLoc = selItem?.locations?.find(l => String(l.departmentCode || l.department) === deptCode);
  const avail = selLoc?.quantity ?? 0;

  // Normalise un article du snapshot en {id, code, name, unit, costPrice, quantity, locations[]}.
  function toItem(i: any): Item {
    const locs: Loc[] = (i.isMultiLocation && Array.isArray(i.locations) && i.locations.length)
      ? i.locations.map((l: any) => ({ department: l.department || l.location || '', departmentCode: l.departmentCode != null ? String(l.departmentCode) : null, location: l.location, quantity: Number(l.quantity) || 0 }))
      : [{ department: i.department || '', departmentCode: i.departmentCode != null ? String(i.departmentCode) : null, location: i.location, quantity: Number(i.quantity) || 0 }];
    return { id: String(i.id), code: i.code || '', name: i.name || '', unit: i.unit || null, costPrice: i.costPrice ?? i.cost_price ?? null, quantity: Number(i.quantity) || 0, isMultiLocation: !!i.isMultiLocation, locations: locs };
  }

  async function load() {
    setLoading(true); setUnavailable(false);
    try {
      const { data, error } = await supabase.from('inventory_state').select('data').eq('tenant_id', tenant).maybeSingle();
      if (error) throw error;
      const snap: any = data?.data || {};
      if (!Array.isArray(snap.items)) { setUnavailable(true); setLoading(false); return; }
      setItems((snap.items || []).map(toItem));
      const mvs: Mvt[] = Array.isArray(snap.movements) ? snap.movements : [];
      setMoves(mvs.filter(m => m.type === 'exit' as any && (m.projectCode === projectNumber || String(m.reason || '').includes(projectNumber))));
    } catch { setUnavailable(true); }
    setLoading(false);
  }
  useEffect(() => { if (tenant && projectNumber) load(); /* eslint-disable-next-line */ }, [tenant, projectNumber]);

  async function consume() {
    if (!selItem || !selLoc || qty <= 0) return;
    if (qty > avail) { setNotice(tr('Quantité supérieure au stock disponible.', 'Quantity exceeds available stock.')); return; }
    setBusy(true); setNotice(null);
    try {
      const res = await fetch('/api/inventory/movement', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant, itemId: selItem.id, type: 'exit', quantity: qty,
          departmentCode: selItem.isMultiLocation ? (selLoc.departmentCode || null) : (selLoc.departmentCode || null),
          projectCode: projectNumber, reason: `Projet ${projectNumber} — consommation`,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.success) { setNotice((j?.error || tr('Échec de la sortie', 'Stock-out failed')) + (j?.available != null ? ` (dispo ${j.available})` : '')); setBusy(false); return; }
      setNotice(tr(`Sortie enregistrée dans l'inventaire : ${qty} ${selItem.unit || ''} de « ${selItem.name} ».`, `Stock-out recorded in inventory: ${qty} ${selItem.unit || ''} of "${selItem.name}".`));
      setOpen(false); setItemId(''); setDeptCode(''); setQty(1);
      await load();
    } catch (e: any) { setNotice(tr('Erreur : ', 'Error: ') + (e?.message || 'réseau')); }
    setBusy(false);
  }

  if (loading) return (
    <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
      <div className="flex items-center gap-2 text-sm text-gray-400"><Loader2 size={16} className="animate-spin" /> {tr('Chargement de l’inventaire…', 'Loading inventory…')}</div>
    </div>
  );
  if (unavailable) return null; // module inventaire non initialisé sur ce tenant

  return (
    <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold flex items-center gap-1.5"><Package size={15} /> {tr('Matériel consommé (inventaire)', 'Material consumed (inventory)')}</h3>
        <div className="flex items-center gap-3">
          <button type="button" onClick={load} className="text-xs text-gray-400 hover:text-gray-600" title={tr('Actualiser', 'Refresh')}><RefreshCw size={13} /></button>
          <button type="button" onClick={() => { setOpen(o => !o); setNotice(null); }} className="text-xs font-semibold text-blue-600 hover:underline">
            {open ? tr('Fermer', 'Close') : `+ ${tr('Consommer du matériel', 'Consume material')}`}
          </button>
        </div>
      </div>

      {notice && <div className="mb-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">{notice}</div>}

      {open && (
        <div className="mb-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/40">
          <div className="grid gap-2 sm:grid-cols-4">
            <label className="text-xs font-semibold text-gray-500 sm:col-span-2">{tr('Article', 'Item')}
              <select value={itemId} onChange={e => { setItemId(e.target.value); setDeptCode(''); }} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800">
                <option value="">{tr('— Choisir —', '— Select —')}</option>
                {items.map(i => <option key={i.id} value={i.id}>{i.code ? `${i.code} · ` : ''}{i.name} ({i.quantity})</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-gray-500">{tr('Emplacement', 'Location')}
              <select value={deptCode} onChange={e => setDeptCode(e.target.value)} disabled={!selItem} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800">
                <option value="">{tr('— Choisir —', '— Select —')}</option>
                {(selItem?.locations || []).map((l, k) => <option key={k} value={String(l.departmentCode || l.department)}>{l.department || l.location || tr('Emplacement', 'Location')}{l.location ? ` (${l.location})` : ''} — {l.quantity} {tr('dispo', 'avail')}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-gray-500">{tr('Quantité', 'Quantity')}
              <input type="number" min={1} max={avail || undefined} value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800" />
            </label>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {selLoc ? tr(`Stock disponible : ${avail}`, `Available stock: ${avail}`) : tr('Choisis un article et un emplacement.', 'Pick an item and a location.')}
              {selItem?.costPrice ? ` · ${tr('valeur', 'value')} ${money((selItem.costPrice || 0) * qty)}` : ''}
            </span>
            <button type="button" onClick={consume} disabled={busy || !selItem || !selLoc || qty <= 0 || qty > avail}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} {tr('Confirmer la sortie', 'Confirm stock-out')}
            </button>
          </div>
        </div>
      )}

      {moves.length === 0 ? (
        <p className="text-sm text-gray-400">{tr('Aucune sortie de matériel pour ce projet.', 'No material consumed for this project.')}</p>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {moves.map((m, k) => (
            <div key={m.id || k} className="flex items-center justify-between py-1.5 text-sm">
              <span className="font-medium">{m.itemName || itemMap[m.itemId]?.name || m.itemId}</span>
              <span className="flex items-center gap-3 text-xs text-gray-500">
                <span>−{m.quantity}</span>
                {m.department && <span className="rounded-full bg-gray-100 px-2 py-0.5 dark:bg-gray-700">{m.department}</span>}
                <span>{String(m.date || m.timestamp || '').slice(0, 10)}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
