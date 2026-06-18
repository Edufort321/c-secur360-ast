'use client';
// Réglage du mode DIFFUSION EN VEILLE (kiosque) — Admin › Système. Après N s d'inactivité, le dashboard
// fait défiler en boucle les relevés des widgets en plein écran. Persisté dans company_settings (migration 219).
import { useEffect, useState } from 'react';
import { Loader2, Save, MonitorPlay } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Tr = (f: string, e: string) => string;

export function KioskSettings({ tenant, tr, canEdit }: { tenant: string; tr: Tr; canEdit: boolean }) {
  const [on, setOn] = useState(false);
  const [idle, setIdle] = useState(60);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('company_settings').select('kiosk_broadcast, kiosk_idle_seconds').eq('tenant_id', tenant).maybeSingle()
      .then(({ data }) => { if (data) { setOn(!!(data as any).kiosk_broadcast); setIdle(Number((data as any).kiosk_idle_seconds) || 60); } setLoading(false); }, () => setLoading(false));
  }, [tenant]);

  async function save() {
    setSaving(true); setNotice(null);
    try {
      const { error } = await supabase.from('company_settings').upsert({ tenant_id: tenant, kiosk_broadcast: on, kiosk_idle_seconds: Math.max(15, Number(idle) || 60), updated_at: new Date().toISOString() }, { onConflict: 'tenant_id' });
      if (error) throw error;
      setNotice(tr('Réglage enregistré ✓', 'Setting saved ✓'));
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

      {canEdit && <div className="flex justify-end"><button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {tr('Enregistrer', 'Save')}</button></div>}
    </div>
  );
}
