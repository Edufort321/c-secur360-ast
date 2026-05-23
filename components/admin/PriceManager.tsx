'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Loader2, Tag } from 'lucide-react';

// Gestion globale des prix des modules (super-admin). Abonnement ANNUEL.
export default function PriceManager() {
  const [mods, setMods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('modules').select('key, name_fr, monthly_price, sort_order').order('sort_order');
    setMods((data || []).map((m: any) => ({ ...m, monthly_price: Number(m.monthly_price) })));
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true); setNotice(null);
    try {
      for (const m of mods) await supabase.from('modules').update({ monthly_price: m.monthly_price }).eq('key', m.key);
      setNotice('Prix enregistrés ✓');
    } catch { setNotice('Erreur DB — migration 011 exécutée ?'); }
    finally { setSaving(false); }
  }

  return (
    <section style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Tag size={18} color="#2563eb" />
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Gestion des prix des modules</h2>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>· abonnement annuel</span>
        </div>
        <button onClick={save} disabled={saving}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Enregistrer
        </button>
      </div>
      {notice && <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#2563eb' }}>{notice}</p>}
      {loading ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>Chargement…</div>
      ) : mods.length === 0 ? (
        <div style={{ padding: '16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', fontSize: '14px', color: '#92400e' }}>
          Catalogue vide — exécute la migration 011 dans le SQL editor.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
          {mods.map((m, i) => (
            <div key={m.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '8px 12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>{m.name_fr}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input type="number" value={m.monthly_price}
                  onChange={e => setMods(p => p.map((x, j) => j === i ? { ...x, monthly_price: Number(e.target.value) } : x))}
                  style={{ width: '90px', textAlign: 'right', border: '1px solid #d1d5db', borderRadius: '6px', padding: '4px 6px', fontSize: '14px' }} />
                <span style={{ fontSize: '13px', color: '#6b7280' }}>$/an</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
