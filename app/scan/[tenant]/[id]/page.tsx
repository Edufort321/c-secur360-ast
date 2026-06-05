'use client';

// #82 — Fiche produit PUBLIQUE (cible du QR d'un article). Ouvrable sans application ni connexion
// (route publique, lecture anon de inventory_state via RLS permissive). Présentation pro + logo tenant.
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Package, MapPin, DollarSign, Boxes, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';

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

  useEffect(() => {
    (async () => {
      // Logo + nom du tenant (best-effort).
      try {
        const { data: cs } = await supabase.from('company_settings').select('logo_url, legal_name').eq('tenant_id', tenant).maybeSingle();
        if (cs?.logo_url) setLogo(cs.logo_url);
        if (cs?.legal_name) setTenantName(cs.legal_name);
      } catch { /* défaut */ }
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

          <div className="flex items-center justify-center gap-1.5 pt-2 text-[11px] text-slate-400">
            <ShieldCheck size={13} /> Fiche officielle · C-Secur360
          </div>
        </div>
      </div>
    </div>
  );
}
