'use client';
// Réglage du mode DIFFUSION EN VEILLE (kiosque) — Admin › Système. Après N s d'inactivité, le dashboard
// fait défiler en boucle les relevés des widgets en plein écran. Persisté dans company_settings (migration 219).
import { useEffect, useState } from 'react';
import { Loader2, Save, MonitorPlay } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { KIOSK_CARDS } from '@/lib/kioskCards';

type Tr = (f: string, e: string) => string;

export function KioskSettings({ tenant, tr, canEdit }: { tenant: string; tr: Tr; canEdit: boolean }) {
  const [on, setOn] = useState(false);
  const [idle, setIdle] = useState(60);
  // Cartes à diffuser : null = toutes (défaut rétrocompatible) ; sinon liste de clés cochées.
  const [cards, setCards] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    // Champs 219 fiables ; kiosk_cards (224) en best-effort pour ne pas casser si la migration manque.
    supabase.from('company_settings').select('kiosk_broadcast, kiosk_idle_seconds').eq('tenant_id', tenant).maybeSingle()
      .then(({ data }) => { if (data) { setOn(!!(data as any).kiosk_broadcast); setIdle(Number((data as any).kiosk_idle_seconds) || 60); } setLoading(false); }, () => setLoading(false));
    supabase.from('company_settings').select('kiosk_cards').eq('tenant_id', tenant).maybeSingle()
      .then(({ data }) => { if (data && Array.isArray((data as any).kiosk_cards)) setCards((data as any).kiosk_cards); }, () => {});
  }, [tenant]);

  // Une carte est diffusée si cards=null (toutes) ou si sa clé y figure.
  const isOn = (k: string) => cards == null || cards.includes(k);
  const toggleCard = (k: string) => setCards(prev => {
    const base = prev == null ? KIOSK_CARDS.map(c => c.key) : [...prev]; // null -> matérialise « toutes » puis on retire
    const next = base.includes(k) ? base.filter(x => x !== k) : [...base, k];
    return next;
  });
  const allOn = cards == null || cards.length === KIOSK_CARDS.length;
  const setAll = (v: boolean) => setCards(v ? null : []);

  async function save() {
    setSaving(true); setNotice(null);
    const base = { tenant_id: tenant, kiosk_broadcast: on, kiosk_idle_seconds: Math.max(15, Number(idle) || 60), updated_at: new Date().toISOString() };
    try {
      const { error } = await supabase.from('company_settings').upsert({ ...base, kiosk_cards: cards }, { onConflict: 'tenant_id' });
      if (!error) { setNotice(tr('Réglage enregistré ✓', 'Setting saved ✓')); return; }
      // Repli si la colonne kiosk_cards n'existe pas encore (migration 224 non appliquée) : on sauve au moins on/délai.
      const { error: e2 } = await supabase.from('company_settings').upsert(base, { onConflict: 'tenant_id' });
      if (e2) throw e2;
      setNotice(tr('Activation/délai enregistrés ✓ — appliquez la migration 224 pour mémoriser le choix des cartes.', 'On/delay saved ✓ — apply migration 224 to persist the card selection.'));
    } catch (e: any) { setNotice('Erreur (migration 219 ?) : ' + (e?.message || 'DB')); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="grid place-items-center py-16 text-gray-400"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
        {tr('Quand un écran du dashboard reste inactif, il bascule automatiquement en plein écran et fait défiler en boucle les relevés (ex. « X jours sans accident ») — idéal pour un écran d’atelier/chantier. Tout mouvement revient au dashboard.', 'When a dashboard screen stays idle, it switches to full screen and loops through the readings (e.g. “X days without accident”) — ideal for a shop/site display. Any movement returns to the dashboard.')}
      </div>
      {notice && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">{notice}</div>}

      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <label className="flex items-center gap-3">
          <input type="checkbox" disabled={!canEdit} checked={on} onChange={e => setOn(e.target.checked)} className="h-4 w-4 accent-emerald-600" />
          <span className="inline-flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-100"><MonitorPlay size={16} className="text-emerald-600" /> {tr('Activer la diffusion en veille (kiosque)', 'Enable idle broadcast (kiosk)')}</span>
        </label>
        <label className="mt-4 block text-xs font-semibold text-gray-600 dark:text-gray-300">
          {tr('Délai d’inactivité avant diffusion', 'Idle delay before broadcast')} : {idle} s
          <input type="range" min={15} max={300} step={5} disabled={!canEdit || !on} value={idle} onChange={e => setIdle(Number(e.target.value))} className="mt-1 w-full max-w-md" />
        </label>
        <p className="mt-2 text-[11px] text-gray-400">{tr('S’applique aux écrans qui ouvrent le tableau de bord (page d’accueil des modules).', 'Applies to screens showing the dashboard (modules home).')}</p>
      </div>

      {/* Sélection des CARTES à diffuser (défilent une après l'autre). */}
      <div className={`rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 ${on ? '' : 'opacity-50'}`}>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{tr('Cartes à diffuser', 'Cards to broadcast')}</span>
          <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500">
            <input type="checkbox" disabled={!canEdit || !on} checked={allOn} onChange={e => setAll(e.target.checked)} className="h-3.5 w-3.5 accent-emerald-600" />
            {tr('Tout cocher', 'Select all')}
          </label>
        </div>
        <p className="mb-3 text-[11px] text-gray-400">{tr('Cochez les cartes du tableau de bord à faire défiler en plein écran. Seules celles avec des données s’affichent.', 'Check the dashboard cards to rotate in full screen. Only those with data appear.')}</p>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {KIOSK_CARDS.map(c => (
            <label key={c.key} className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm dark:border-gray-700/60">
              <input type="checkbox" disabled={!canEdit || !on} checked={isOn(c.key)} onChange={() => toggleCard(c.key)} className="h-4 w-4 accent-emerald-600" />
              <span className="text-gray-700 dark:text-gray-200">{tr(c.fr, c.en)}</span>
            </label>
          ))}
        </div>
        {on && cards != null && cards.length === 0 && <p className="mt-2 text-[11px] text-amber-600">{tr('Aucune carte cochée — rien ne sera diffusé.', 'No card selected — nothing will broadcast.')}</p>}
      </div>

      {canEdit && <div className="flex justify-end"><button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {tr('Enregistrer', 'Save')}</button></div>}
    </div>
  );
}
