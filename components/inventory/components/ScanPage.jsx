// ============== PAGE DE SCAN MOBILE (FICHE PRODUIT — LECTURE SEULE) ==============
// #56 — Ouverte par une CAMERA / un lecteur "stand" via le QR de l'article.
// Affiche la fiche du produit : nom, photo, description, PRIX VENDANT et QUANTITE DISPONIBLE.
// Aucune modification ici. Pour faire un mouvement (entree/sortie), on utilise le scanner
// INTEGRE de l'application (bouton "Ouvrir dans l'application").

import React, { useState, useEffect } from 'react';
import { Package, AlertCircle, ArrowLeft, MapPin, Hash, DollarSign, Boxes, Tag } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';

// Quantite disponible : champ plat `quantity` sinon somme des localisations.
function availableQty(item) {
  if (typeof item.quantity === 'number') return item.quantity;
  const locs = item.locations || item.item_locations || [];
  if (Array.isArray(locs) && locs.length) {
    return locs.reduce((s, l) => s + (Number(l.quantity ?? l.qty ?? 0) || 0), 0);
  }
  return Number(item.quantity || 0) || 0;
}
function firstPhoto(item) {
  const p = (item.photos && item.photos[0]) || item.photo || null;
  if (!p) return null;
  return typeof p === 'string' ? p : (p.url || p.dataUrl || p.src || null);
}
const money = (n) => `${(Number(n) || 0).toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;

export function ScanPage() {
  const { t } = useLanguage();
  const { isDarkMode } = useTheme();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tenant = (typeof window !== 'undefined' ? (window.location.pathname.split('/').filter(Boolean)[0] || 'cerdia') : 'cerdia');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const itemId = params.get('id');
    const itemCode = params.get('code');
    if (!itemId && !itemCode) { setError(t('scanner.itemNotFound')); setLoading(false); return; }

    const findIn = (list) => (list || []).find(i => String(i.id) === String(itemId) || (itemCode && i.code === itemCode));

    (async () => {
      // 1) Source de verite : instantane inventory_state par tenant.
      try {
        const { data, error: e } = await supabase.from('inventory_state').select('data').eq('tenant_id', tenant).maybeSingle();
        if (!e && data && data.data && Array.isArray(data.data.items)) {
          const found = findIn(data.data.items);
          if (found) { setItem(found); setLoading(false); return; }
        }
      } catch (err) {
        console.warn('inventory_state indisponible:', err?.message || err);
      }
      // 2) Repli cache local.
      try {
        const saved = localStorage.getItem('c-secur360-inventory-items');
        if (saved) {
          const found = findIn(JSON.parse(saved));
          if (found) { setItem(found); setLoading(false); return; }
        }
      } catch { /* ignore */ }
      setError(t('scanner.itemNotFound'));
      setLoading(false);
    })();
  }, [tenant, t]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-red-500" size={32} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('common.error')}</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{error || t('scanner.itemNotFound')}</p>
          <a href={`/${tenant}/inventory`} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors">
            <ArrowLeft size={20} /> {t('actions.backToInventory')}
          </a>
        </div>
      </div>
    );
  }

  const qty = availableQty(item);
  const photo = firstPhoto(item);
  const low = item.minQuantity != null && qty <= Number(item.minQuantity);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md mx-auto py-6">
        {/* En-tete */}
        <div className="bg-gradient-to-r from-slate-700 to-blue-700 text-white rounded-t-2xl p-5 shadow-xl">
          <div className="flex items-center gap-3">
            <Package size={28} />
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold truncate">{item.name}</h1>
              <div className="flex items-center gap-1.5 mt-0.5 opacity-90">
                <Hash size={14} /><span className="text-sm">{item.code || '—'}</span>
                {item.category && <><span className="opacity-50">·</span><Tag size={13} /><span className="text-xs">{item.category}</span></>}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-b-2xl shadow-xl p-5 space-y-4">
          {/* Photo */}
          {photo && (
            <img src={photo} alt={item.name} className="w-full h-44 object-cover rounded-xl border border-gray-200 dark:border-gray-700" />
          )}

          {/* Prix vendant + Quantite disponible */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-3 text-center">
              <DollarSign className="mx-auto text-emerald-600 dark:text-emerald-400" size={18} />
              <div className="mt-1 text-lg font-extrabold text-emerald-700 dark:text-emerald-300">{money(item.salePrice ?? item.sale_price)}</div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('scanner.salePrice') || 'Prix vendant'}</div>
            </div>
            <div className={`rounded-xl border-2 p-3 text-center ${low ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20' : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'}`}>
              <Boxes className={`mx-auto ${low ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`} size={18} />
              <div className={`mt-1 text-lg font-extrabold ${low ? 'text-red-700 dark:text-red-300' : 'text-blue-700 dark:text-blue-300'}`}>{qty} {item.unit || ''}</div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('scanner.available') || 'Disponible'}{low ? ' ⚠️' : ''}</div>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <div className="rounded-lg bg-gray-50 dark:bg-gray-900/40 p-3 text-sm text-gray-700 dark:text-gray-300">
              {item.description}
            </div>
          )}

          {/* Emplacement(s) */}
          {(item.location || (item.locations && item.locations.length > 0)) && (
            <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin size={15} className="mt-0.5 flex-shrink-0" />
              <span>
                {item.location || (item.locations || []).map(l => `${l.name || l.department || ''}${(l.quantity ?? l.qty) != null ? ` (${l.quantity ?? l.qty})` : ''}`).filter(Boolean).join(' · ')}
              </span>
            </div>
          )}

          {/* Action : ouvrir dans l'app pour faire un mouvement */}
          <a href={`/${tenant}/inventory`} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors">
            <ArrowLeft size={18} /> {t('actions.backToInventory')}
          </a>
          <p className="text-center text-[11px] text-gray-400">{t('scanner.readOnlyHint') || 'Fiche en lecture seule. Pour une entrée/sortie, utilisez le scanner dans l’application.'}</p>
        </div>
      </div>
    </div>
  );
}

export default ScanPage;
