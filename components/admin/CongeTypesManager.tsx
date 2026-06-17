'use client';

// Gestion des TYPES DE CONGÉ (Admin/RH) : ajout, justification requise (billet du médecin), poste qui
// approuve. Persisté par tenant (migration 188). Repli sur des défauts si la table est vide.
import { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { getCongeTypesAdmin, saveCongeType, deleteCongeType, getPostes, type CongeTypeDef, type Poste } from '@/lib/congeTypes';

export function CongeTypesManager({ tenant, tr, canEdit }: { tenant: string; tr: (f: string, e: string) => string; canEdit: boolean }) {
  const [types, setTypes] = useState<CongeTypeDef[]>([]);
  const [postes, setPostes] = useState<Poste[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [neu, setNeu] = useState<CongeTypeDef>({ value: '', label_fr: '', emoji: '🌴', requires_justification: false });

  async function load() {
    try { const [t, p] = await Promise.all([getCongeTypesAdmin(tenant), getPostes(tenant)]); setTypes(t); setPostes(p); }
    catch { setNotice(tr('Exécutez la migration 188, puis rechargez.', 'Run migration 188, then reload.')); }
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tenant]);

  async function patch(t: CongeTypeDef, p: Partial<CongeTypeDef>) {
    const next = { ...t, ...p };
    setTypes(prev => prev.map(x => x.id === t.id ? next : x));
    setSavingKey(t.id || t.value); setNotice(null);
    const r = await saveCongeType(tenant, next);
    if (r.error) setNotice(r.error); else setNotice(tr('Enregistré ✓', 'Saved ✓'));
    setSavingKey(null);
  }
  async function add() {
    if (!neu.label_fr.trim()) { setNotice(tr('Libellé requis.', 'Label required.')); return; }
    // Slug UNIQUE dérivé du libellé COMPLET (sans accents) + suffixe si collision -> ne JAMAIS écraser un type existant.
    const base = neu.label_fr.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'type';
    const existing = new Set(types.map(t => t.value));
    let value = base, i = 2;
    while (existing.has(value)) value = `${base}_${i++}`;
    const r = await saveCongeType(tenant, { ...neu, value, label_fr: neu.label_fr.trim(), sort_order: types.length });
    if (r.error) { setNotice(r.error); return; }
    setNeu({ value: '', label_fr: '', emoji: '🌴', requires_justification: false }); await load(); setNotice(tr('Type ajouté.', 'Type added.'));
  }
  async function remove(t: CongeTypeDef) { if (t.id) { await deleteCongeType(tenant, t.id); await load(); } }

  if (loading) return <div className="flex items-center gap-2 p-4 text-gray-500"><Loader2 className="animate-spin" size={16} /> {tr('Chargement…', 'Loading…')}</div>;

  const inp = 'rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800';
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
        {tr('Définissez les types de congé. Par type : une PIÈCE JUSTIFICATIVE peut être exigée (ex. billet du médecin pour une maladie au-delà de N jours) et un POSTE désigné pour APPROUVER.', 'Define leave types. Per type: a JUSTIFICATION can be required (e.g. doctor’s note for sick leave beyond N days) and a POSITION assigned to APPROVE.')}
      </div>
      {notice && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">{notice}</div>}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500 dark:bg-gray-900/40">
            <tr>
              <th className="px-3 py-2">{tr('Type', 'Type')}</th>
              <th className="px-3">{tr('Justification', 'Justification')}</th>
              <th className="px-3">{tr('Au-delà de (jours)', 'Beyond (days)')}</th>
              <th className="px-3 flex items-center gap-1"><ShieldCheck size={13} /> {tr('Approbation (poste)', 'Approval (position)')}</th>
              <th className="px-3">{tr('Actif', 'Active')}</th>
              <th className="px-3"></th>
            </tr>
          </thead>
          <tbody>
            {types.map(t => (
              <tr key={t.id || t.value} className="border-t border-gray-100 dark:border-gray-700/50">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <input value={t.emoji || ''} onChange={e => setTypes(p => p.map(x => x === t ? { ...x, emoji: e.target.value } : x))} onBlur={e => patch(t, { emoji: e.target.value })} disabled={!canEdit} className={`w-10 text-center ${inp}`} />
                    <input value={t.label_fr} onChange={e => setTypes(p => p.map(x => x === t ? { ...x, label_fr: e.target.value } : x))} onBlur={e => patch(t, { label_fr: e.target.value })} disabled={!canEdit} className={`${inp}`} />
                  </div>
                  <span className="ml-1 text-[10px] text-gray-400">{t.value}</span>
                </td>
                <td className="px-3">
                  <label className="flex items-center gap-1.5 text-xs">
                    <input type="checkbox" checked={!!t.requires_justification} disabled={!canEdit} onChange={e => patch(t, { requires_justification: e.target.checked })} />
                    {t.requires_justification && <input value={t.justification_label || ''} onChange={e => setTypes(p => p.map(x => x === t ? { ...x, justification_label: e.target.value } : x))} onBlur={e => patch(t, { justification_label: e.target.value })} disabled={!canEdit} placeholder={tr('ex. Billet du médecin', 'e.g. Doctor’s note')} className={`${inp} text-xs`} />}
                  </label>
                </td>
                <td className="px-3"><input type="number" min={0} value={t.justification_after_days || 0} disabled={!canEdit || !t.requires_justification} onChange={e => setTypes(p => p.map(x => x === t ? { ...x, justification_after_days: Number(e.target.value) } : x))} onBlur={e => patch(t, { justification_after_days: Number(e.target.value) })} className={`w-16 text-center ${inp}`} /></td>
                <td className="px-3">
                  <select value={t.approval_poste_id || ''} disabled={!canEdit} onChange={e => patch(t, { approval_poste_id: e.target.value || null })} className={`${inp} text-xs`}>
                    <option value="">{tr('— Superviseur —', '— Supervisor —')}</option>
                    {postes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </td>
                <td className="px-3"><input type="checkbox" checked={t.active !== false} disabled={!canEdit} onChange={e => patch(t, { active: e.target.checked })} /></td>
                <td className="px-3 text-right">{canEdit && <button onClick={() => remove(t)} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>}{savingKey === (t.id || t.value) && <Loader2 size={13} className="ml-1 inline animate-spin text-gray-400" />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {canEdit && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
          <input value={neu.emoji || ''} onChange={e => setNeu(n => ({ ...n, emoji: e.target.value }))} className={`w-12 text-center ${inp}`} placeholder="🌴" />
          <input value={neu.label_fr} onChange={e => setNeu(n => ({ ...n, label_fr: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') add(); }} className={inp} placeholder={tr('Nouveau type (ex. Sans solde)', 'New type (e.g. Unpaid)')} />
          <label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={!!neu.requires_justification} onChange={e => setNeu(n => ({ ...n, requires_justification: e.target.checked }))} /> {tr('Justification', 'Justification')}</label>
          <button onClick={add} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"><Plus size={15} /> {tr('Ajouter', 'Add')}</button>
        </div>
      )}
    </div>
  );
}
