'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Loader2, Tag, MapPin } from 'lucide-react';

export default function PriceManager() {
  const [mods, setMods] = useState<any[]>([]);
  const [perSite, setPerSite] = useState<number>(0);
  const [aiPlans, setAiPlans] = useState<any[]>([]); // forfaits Assistant IA (table ai_plans)
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [modsRes, configRes, aiRes] = await Promise.all([
      supabase.from('modules').select('key, name_fr, monthly_price, sort_order').order('sort_order'),
      supabase.from('billing_config').select('per_site_monthly').eq('id', 'default').maybeSingle(),
      supabase.from('ai_plans').select('id, name_fr, name_en, price_cents, note_fr, sort_order, active').order('sort_order'),
    ]);
    setMods((modsRes.data || []).map((m: any) => ({ ...m, monthly_price: Number(m.monthly_price) })));
    if (configRes.data?.per_site_monthly != null) setPerSite(Number(configRes.data.per_site_monthly));
    setAiPlans((aiRes.data || []).map((p: any) => ({ ...p, price_cents: Number(p.price_cents) || 0, active: p.active !== false })));
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true); setNotice(null);
    try {
      for (const m of mods) {
        await supabase.from('modules').update({ monthly_price: m.monthly_price }).eq('key', m.key);
      }
      await supabase.from('billing_config')
        .upsert({ id: 'default', per_site_monthly: perSite }, { onConflict: 'id' });
      // Forfaits IA : ecriture via l'API admin (cle service) car ai_plans n'autorise que la lecture publique.
      for (const p of aiPlans) {
        await fetch('/api/admin/ai-plans', {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: p.id, name_fr: p.name_fr, price_cents: p.price_cents, note_fr: p.note_fr, active: p.active }),
        });
      }
      setNotice('Prix enregistres avec succes');
    } catch {
      setNotice('Erreur DB — migrations 011, 052 et 132 executees ?');
    } finally {
      setSaving(false);
    }
  }

  // Calcul annuel avec rabais (monthly_price = prix annuel dans la DB)
  // Tout module à 0 $ est gratuit ; mettre un prix > 0 le rend payant (y compris Administration / To-Do).
  const paidMods = mods.filter(m => m.monthly_price > 0);
  const subtotal = paidMods.reduce((s, m) => s + Number(m.monthly_price || 0), 0);
  const discountPct = Math.min(Math.max(paidMods.length - 1, 0) * 5, 30);
  const totalAnnual = Math.round(subtotal * (1 - discountPct / 100));

  return (
    <section style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Tag size={18} color="#2563eb" />
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Gestion des prix des modules</h2>
        </div>
        <button onClick={save} disabled={saving}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Enregistrer
        </button>
      </div>

      {notice && <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#2563eb' }}>{notice}</p>}

      {loading ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>Chargement…</div>
      ) : (
        <>
          {/* Prix par site supplementaire */}
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '14px 16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <MapPin size={16} color="#2563eb" />
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e40af' }}>Prix par site supplementaire</span>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>— ex: Montreal + Sherbrooke = +1 site</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                min={0}
                value={perSite}
                onChange={e => setPerSite(Number(e.target.value))}
                onFocus={e => e.target.select()}
                style={{ width: '110px', textAlign: 'right', border: '1px solid #93c5fd', borderRadius: '8px', padding: '6px 10px', fontSize: '15px', fontWeight: 600, color: '#1e40af' }}
              />
              <span style={{ fontSize: '14px', color: '#6b7280' }}>$/an par site additionnel (1 site inclus)</span>
            </div>
          </div>

          {/* Prix par module */}
          {mods.length === 0 ? (
            <div style={{ padding: '16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', fontSize: '14px', color: '#92400e' }}>
              Catalogue vide — executez la migration 011 dans le SQL editor.
            </div>
          ) : (
            <>
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px' }}>
                Note : les prix ci-dessous sont des <strong>prix annuels</strong> (colonne <code>monthly_price</code> dans la DB — nom de colonne historique).
                Laissez un module à <strong>0 $</strong> pour qu'il reste gratuit (ex. Administration, To-Do), ou donnez-lui un prix pour le rendre payant.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                {mods.map((m, i) => {
                  const isFree = (m.monthly_price || 0) === 0;
                  return (
                    <div key={m.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', border: `1px solid ${isFree ? '#fed7aa' : '#e5e7eb'}`, borderRadius: '10px', padding: '8px 12px', background: isFree ? '#fff7ed' : '#fff' }}>
                      <span style={{ fontSize: '14px', fontWeight: 500 }}>
                        {m.name_fr}
                        {isFree && <span style={{ fontSize: '11px', color: '#f97316', marginLeft: '6px', fontWeight: 700 }}>GRATUIT</span>}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          min={0}
                          value={m.monthly_price}
                          onChange={e => setMods(p => p.map((x, j) => j === i ? { ...x, monthly_price: Number(e.target.value) } : x))}
                          onFocus={e => e.target.select()}
                          style={{ width: '90px', textAlign: 'right', border: '1px solid #d1d5db', borderRadius: '6px', padding: '4px 6px', fontSize: '14px' }}
                        />
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>$/an</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total avec rabais */}
              <div style={{ marginTop: '16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontSize: '13px', color: '#166534' }}>
                    <span>Sous-total brut : <strong>{subtotal}$/an</strong></span>
                    {discountPct > 0 && (
                      <span style={{ marginLeft: '12px', color: '#16a34a' }}>
                        Rabais cascade -{discountPct}% (-5 %/module, du + gros au + petit, max -30 %) · {paidMods.length} modules payants
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>Total plan complet :</span>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>{totalAnnual}$/an</span>
                    {discountPct > 0 && (
                      <span style={{ fontSize: '12px', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>
                        -{discountPct}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Forfaits Assistant IA (jetons) — memes cartes que la page publique, prix ajustable ici */}
          <div style={{ marginTop: '18px', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Tag size={16} color="#a21caf" />
              <span style={{ fontSize: '15px', fontWeight: 700 }}>Forfaits Assistant IA (jetons)</span>
            </div>
            <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px' }}>
              Cartes de prix affichees sur la page publique. Prix payE par le client ; le budget de cout IA reel (×70 %, marge 30 %) reste interne et n&apos;est jamais montre au client.
            </p>
            {aiPlans.length === 0 ? (
              <div style={{ padding: '12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', fontSize: '13px', color: '#92400e' }}>
                Aucun forfait IA — executez la migration 132 dans le SQL editor.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
                {aiPlans.map((p, i) => (
                  <div key={p.id} style={{ border: `1px solid ${p.active ? '#f5d0fe' : '#e5e7eb'}`, borderRadius: '10px', padding: '10px 12px', background: p.active ? '#fdf4ff' : '#fff' }}>
                    <input
                      value={p.name_fr}
                      onChange={e => setAiPlans(prev => prev.map((x, j) => j === i ? { ...x, name_fr: e.target.value } : x))}
                      style={{ width: '100%', border: '1px solid #e9d5ff', borderRadius: '6px', padding: '4px 8px', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <input
                        type="number" min={0} step={50}
                        value={Math.round(p.price_cents / 100)}
                        onChange={e => setAiPlans(prev => prev.map((x, j) => j === i ? { ...x, price_cents: Math.max(0, Math.round(Number(e.target.value) || 0)) * 100 } : x))}
                        onFocus={e => e.target.select()}
                        style={{ width: '90px', textAlign: 'right', border: '1px solid #d8b4fe', borderRadius: '6px', padding: '4px 6px', fontSize: '14px' }}
                      />
                      <span style={{ fontSize: '13px', color: '#6b7280' }}>$/an</span>
                      <label style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6b7280' }}>
                        <input type="checkbox" checked={p.active} onChange={e => setAiPlans(prev => prev.map((x, j) => j === i ? { ...x, active: e.target.checked } : x))} /> Actif
                      </label>
                    </div>
                    <input
                      value={p.note_fr || ''}
                      onChange={e => setAiPlans(prev => prev.map((x, j) => j === i ? { ...x, note_fr: e.target.value } : x))}
                      placeholder="Note affichee sur la carte"
                      style={{ width: '100%', border: '1px solid #f3e8ff', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', color: '#6b7280' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
