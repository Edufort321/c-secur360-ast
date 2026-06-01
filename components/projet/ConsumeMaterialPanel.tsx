'use client';

import React, { useEffect, useState } from 'react';
import { Package, Loader2, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';

// R6 — Lien intermodule Projet -> Inventaire : sortie de stock MANUELLE depuis le projet.
// Crée un mouvement 'exit' + décrémente item_locations.quantity. Le mouvement référence le projet.

type Loc = { id: string; department: string; location?: string | null; quantity: number };
type Item = { id: string; code: string; name: string; unit?: string | null; cost_price?: number | null; item_locations: Loc[] };
type Mvt = { id: string; item_id: string; quantity: number; from_location?: string | null; reason?: string | null; created_at: string };

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
  const [dept, setDept] = useState('');
  const [qty, setQty] = useState(1);

  const projectTag = `Projet ${projectNumber}`;
  const itemMap = Object.fromEntries(items.map(i => [i.id, i]));
  const selItem = itemMap[itemId];
  const selLoc = selItem?.item_locations?.find(l => l.department === dept);
  const avail = selLoc?.quantity ?? 0;

  async function load() {
    setLoading(true); setUnavailable(false);
    try {
      const [{ data: it, error: e1 }, { data: mv }] = await Promise.all([
        supabase.from('items').select('id, code, name, unit, cost_price, item_locations(id, department, location, quantity)').eq('tenant_id', tenant).order('name'),
        supabase.from('movements').select('id, item_id, quantity, from_location, reason, created_at').eq('tenant_id', tenant).eq('type', 'exit').order('created_at', { ascending: false }).limit(100),
      ]);
      if (e1) throw e1;
      setItems((it as any) || []);
      setMoves(((mv as any) || []).filter((m: Mvt) => (m.reason || '').includes(projectNumber)));
    } catch { setUnavailable(true); }
    setLoading(false);
  }
  useEffect(() => { if (tenant && projectNumber) load(); /* eslint-disable-next-line */ }, [tenant, projectNumber]);

  async function consume() {
    if (!selItem || !selLoc || qty <= 0) return;
    if (qty > avail) { setNotice(tr('Quantité supérieure au stock disponible.', 'Quantity exceeds available stock.')); return; }
    setBusy(true); setNotice(null);
    try {
      let userId: string | null = null;
      try { const { data } = await supabase.auth.getUser(); userId = data?.user?.id || null; } catch { /* anonyme */ }
      // 1. Mouvement de sortie (historique) référencé au projet
      const { error: me } = await supabase.from('movements').insert([{
        tenant_id: tenant, item_id: selItem.id, type: 'exit', quantity: qty,
        from_location: selLoc.department, reason: `${projectTag} — consommation`, user_id: userId,
      }]);
      if (me) throw me;
      // 2. Décrément du stock à cet emplacement
      const { error: ue } = await supabase.from('item_locations').update({ quantity: Math.max(0, avail - qty), updated_at: new Date().toISOString() }).eq('id', selLoc.id);
      if (ue) throw ue;
      setNotice(tr(`Sortie enregistrée : ${qty} ${selItem.unit || ''} de « ${selItem.name} ».`, `Stock-out recorded: ${qty} ${selItem.unit || ''} of "${selItem.name}".`));
      setOpen(false); setItemId(''); setDept(''); setQty(1);
      await load();
    } catch (e: any) { setNotice(tr('Erreur : ', 'Error: ') + (e?.message || 'DB')); }
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
        <button type="button" onClick={() => { setOpen(o => !o); setNotice(null); }} className="text-xs font-semibold text-blue-600 hover:underline">
          {open ? tr('Fermer', 'Close') : `+ ${tr('Consommer du matériel', 'Consume material')}`}
        </button>
      </div>

      {notice && <div className="mb-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">{notice}</div>}

      {open && (
        <div className="mb-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/40">
          <div className="grid gap-2 sm:grid-cols-4">
            <label className="text-xs font-semibold text-gray-500 sm:col-span-2">{tr('Article', 'Item')}
              <select value={itemId} onChange={e => { setItemId(e.target.value); setDept(''); }} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800">
                <option value="">{tr('— Choisir —', '— Select —')}</option>
                {items.map(i => <option key={i.id} value={i.id}>{i.code ? `${i.code} · ` : ''}{i.name}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-gray-500">{tr('Emplacement', 'Location')}
              <select value={dept} onChange={e => setDept(e.target.value)} disabled={!selItem} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800">
                <option value="">{tr('— Choisir —', '— Select —')}</option>
                {(selItem?.item_locations || []).map(l => <option key={l.id} value={l.department}>{l.department}{l.location ? ` (${l.location})` : ''} — {l.quantity} {tr('dispo', 'avail')}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-gray-500">{tr('Quantité', 'Quantity')}
              <input type="number" min={1} max={avail || undefined} value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800" />
            </label>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {selLoc ? tr(`Stock disponible : ${avail}`, `Available stock: ${avail}`) : tr('Choisis un article et un emplacement.', 'Pick an item and a location.')}
              {selItem?.cost_price ? ` · ${tr('valeur', 'value')} ${money((selItem.cost_price || 0) * qty)}` : ''}
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
          {moves.map(m => {
            const it = itemMap[m.item_id];
            return (
              <div key={m.id} className="flex items-center justify-between py-1.5 text-sm">
                <span className="font-medium">{it ? (it.code ? `${it.code} · ` : '') + it.name : m.item_id}</span>
                <span className="flex items-center gap-3 text-xs text-gray-500">
                  <span>−{m.quantity}{it?.unit ? ` ${it.unit}` : ''}</span>
                  {m.from_location && <span className="rounded-full bg-gray-100 px-2 py-0.5 dark:bg-gray-700">{m.from_location}</span>}
                  <span>{(m.created_at || '').slice(0, 10)}</span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
