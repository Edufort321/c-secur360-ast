'use client';

// Gestion des TÉMOIGNAGES de la page publique (dashboard super-admin). Comme les slides : on ajoute
// les VRAIS témoignages ici ; tant que la liste est vide, la section « Témoignages » du site est masquée.
import React, { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, Save, Star, MessageSquareQuote } from 'lucide-react';
// Écritures via route serveur protégée (requireAdmin + service_role) — plus d'accès anon à landing_testimonials.

type Testimonial = { id?: string; name: string; title_fr?: string; title_en?: string; company?: string; text_fr?: string; text_en?: string; rating?: number; sort_order?: number; active?: boolean };

export default function TestimonialsTab() {
  const [rows, setRows] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/testimonials');
      const data = await res.json();
      if (!res.ok) setNotice('Erreur : ' + (data?.error || res.status));
      else setRows(Array.isArray(data) ? (data as Testimonial[]) : []);
    } catch (e: any) { setNotice('Erreur réseau : ' + (e?.message || '')); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const upd = (i: number, patch: Partial<Testimonial>) => setRows(p => p.map((r, j) => j === i ? { ...r, ...patch } : r));
  const add = () => setRows(p => [...p, { name: '', title_fr: '', company: '', text_fr: '', text_en: '', rating: 5, sort_order: p.length, active: true }]);

  async function saveOne(t: Testimonial) {
    setSaving(true); setNotice(null);
    const row: any = { name: t.name.trim(), title_fr: t.title_fr || null, title_en: t.title_en || t.title_fr || null, company: t.company || null, text_fr: t.text_fr || null, text_en: t.text_en || t.text_fr || null, rating: Number(t.rating) || 5, sort_order: Number(t.sort_order) || 0, active: t.active !== false, updated_at: new Date().toISOString() };
    try {
      const res = t.id
        ? await fetch('/api/admin/testimonials', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: t.id, ...row }) })
        : await fetch('/api/admin/testimonials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(row) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setNotice('Erreur : ' + (data?.error || res.status)); return; }
      setNotice('Enregistré ✓'); await load();
    } catch (e: any) { setNotice('Erreur : ' + (e?.message || 'DB')); }
    finally { setSaving(false); }
  }
  async function del(t: Testimonial, i: number) {
    if (!t.id) { setRows(p => p.filter((_, j) => j !== i)); return; }
    if (!window.confirm('Supprimer ce témoignage ?')) return;
    const res = await fetch(`/api/admin/testimonials?id=${t.id}`, { method: 'DELETE' });
    if (!res.ok) { const d = await res.json().catch(() => ({})); setNotice('Erreur : ' + (d?.error || res.status)); return; }
    await load();
  }

  if (loading) return <div className="flex items-center gap-2 p-6 text-gray-500"><Loader2 className="animate-spin" size={18} /> Chargement…</div>;

  const inp = 'w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-bold text-gray-700 dark:text-gray-200"><MessageSquareQuote size={16} /> Témoignages (page publique)</h3>
        <button onClick={add} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"><Plus size={15} /> Ajouter</button>
      </div>
      <p className="text-xs text-gray-500">Ajoutez ici vos VRAIS témoignages clients. Tant que la liste est vide, la section « Témoignages » du site public reste masquée (aucun avis inventé).</p>
      {notice && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">{notice}</div>}
      {rows.length === 0 && <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800">Aucun témoignage. La section reste masquée sur le site jusqu'à l'ajout d'un premier témoignage.</div>}
      <div className="space-y-3">
        {rows.map((t, i) => (
          <div key={t.id || i} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <label className="text-xs text-gray-500">Nom<input className={`mt-1 ${inp}`} value={t.name} onChange={e => upd(i, { name: e.target.value })} placeholder="Martin Lavoie" /></label>
              <label className="text-xs text-gray-500">Titre (FR)<input className={`mt-1 ${inp}`} value={t.title_fr || ''} onChange={e => upd(i, { title_fr: e.target.value })} placeholder="Directeur sécurité" /></label>
              <label className="text-xs text-gray-500">Entreprise<input className={`mt-1 ${inp}`} value={t.company || ''} onChange={e => upd(i, { company: e.target.value })} placeholder="Constructions BFL inc." /></label>
            </div>
            <label className="mt-2 block text-xs text-gray-500">Témoignage (FR)<textarea rows={2} className={`mt-1 ${inp}`} value={t.text_fr || ''} onChange={e => upd(i, { text_fr: e.target.value })} /></label>
            <label className="mt-2 block text-xs text-gray-500">Témoignage (EN, optionnel)<textarea rows={2} className={`mt-1 ${inp}`} value={t.text_en || ''} onChange={e => upd(i, { text_en: e.target.value })} placeholder="(laisser vide = même texte qu'en FR)" /></label>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-1 text-xs text-gray-500">Note
                <select className="rounded-lg border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800" value={t.rating || 5} onChange={e => upd(i, { rating: Number(e.target.value) })}>
                  {[5, 4, 3].map(n => <option key={n} value={n}>{'★'.repeat(n)}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-1 text-xs text-gray-500">Ordre<input type="number" className="w-16 rounded-lg border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800" value={t.sort_order || 0} onChange={e => upd(i, { sort_order: Number(e.target.value) })} /></label>
              <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300"><input type="checkbox" checked={t.active !== false} onChange={e => upd(i, { active: e.target.checked })} /> Actif (visible)</label>
              <div className="ml-auto flex gap-2">
                <button onClick={() => saveOne(t)} disabled={saving || !t.name.trim()} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Enregistrer</button>
                <button onClick={() => del(t, i)} className="rounded-lg border border-red-300 px-2 py-1.5 text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
