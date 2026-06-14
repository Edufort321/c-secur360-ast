'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { TrendingUp } from 'lucide-react';

const money = (n: number) => `${(Math.round(n * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;

// Revenu récurrent annuel calculé : Σ (modules activés × prix) − escompte cumulatif, par tenant.
export default function RevenueForecast() {
  const [arr, setArr] = useState(0);
  const [view, setView] = useState<'day' | 'week' | 'month' | 'year'>('year');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: tm }, { data: mods }, { data: bc }, { data: subs }] = await Promise.all([
          supabase.from('tenant_modules').select('tenant_id, module_key, enabled'),
          supabase.from('modules').select('key, monthly_price'),
          supabase.from('billing_config').select('discount_per_module, discount_cap').eq('id', 'default').maybeSingle(),
          supabase.from('tenant_subscriptions').select('tenant_id, billable'),
        ]);
        // Ne compter QUE les tenants avec un abonnement FACTURABLE explicite (billable !== false).
        // Exclut donc : démo, CERDIA interne, et tout tenant sans abonnement (ex. 'demo' orphelin) — qui
        // gonflaient le revenu à tort.
        const billableSet = new Set((subs || []).filter((s: any) => s.billable !== false).map((s: any) => s.tenant_id));
        const INTERNAL = new Set(['cerdia', 'demo', 'entreprisedemo']); // jamais facturés
        const price: Record<string, number> = Object.fromEntries((mods || []).map((m: any) => [m.key, Number(m.monthly_price) || 0]));
        const per = Number(bc?.discount_per_module ?? 5);
        const cap = Number(bc?.discount_cap ?? 30);
        const byTenant: Record<string, string[]> = {};
        (tm || []).filter((x: any) => x.enabled).forEach((x: any) => { (byTenant[x.tenant_id] ||= []).push(x.module_key); });
        let total = 0;
        for (const t of Object.keys(byTenant)) {
          if (INTERNAL.has(t) || !billableSet.has(t)) continue;
          const keys = byTenant[t];
          const subtotal = keys.reduce((s, k) => s + (price[k] || 0), 0);
          const disc = Math.min(Math.max(keys.length - 1, 0) * per, cap);
          total += subtotal * (1 - disc / 100);
        }
        setArr(total);
      } catch { /* dégradé */ } finally { setLoading(false); }
    })();
  }, []);

  const values = { day: arr / 365, week: arr / 52, month: arr / 12, year: arr };
  const tabs: { k: typeof view; label: string }[] = [
    { k: 'day', label: 'Quotidien' }, { k: 'week', label: 'Hebdo' }, { k: 'month', label: 'Mensuel' }, { k: 'year', label: 'Annuel' },
  ];

  return (
    <section style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={18} color="#16a34a" />
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Prévisions de revenu</h2>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>· récurrent (tous les tenants)</span>
        </div>
        <div style={{ display: 'flex', overflow: 'hidden', borderRadius: '8px', border: '1px solid #d1d5db' }}>
          {tabs.map(t => (
            <button key={t.k} onClick={() => setView(t.k)}
              style={{ padding: '6px 12px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer',
                background: view === t.k ? '#2563eb' : 'transparent', color: view === t.k ? '#fff' : '#374151' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize: '32px', fontWeight: 800, color: '#111827' }}>
        {loading ? '…' : money(values[view])}
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#6b7280', marginLeft: '8px' }}>
          / {view === 'day' ? 'jour' : view === 'week' ? 'semaine' : view === 'month' ? 'mois' : 'an'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '14px' }}>
        {tabs.map(t => (
          <div key={t.k} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '8px 10px' }}>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>{t.label}</div>
            <div style={{ fontSize: '15px', fontWeight: 700 }}>{loading ? '…' : money(values[t.k])}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
