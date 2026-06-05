'use client';

// Fiche transformateur PUBLIQUE (cible du QR DGA). Ouvrable sans application ni connexion
// (route publique /scan/(.*), lecture anon via RLS permissive). La conformité BPC est affichée
// EN PREMIER. Le bouton « Ouvrir dans l'app » mène au module (édition réservée aux utilisateurs connectés).
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AlertTriangle, Loader2, ShieldCheck, Pencil, Droplet } from 'lucide-react';
import { IEEE_ROWS, OIL_FIELDS, FURAN_FIELDS, gl, fl, ieeeCondition, worstCondition, COND_LABELS, COND_COLORS, pcbStatus, latestPcb, effectiveNextDate } from '@/lib/dga/fields';
import { dueStatusByDate } from '@/lib/dga/catalog';
import type { Dossier, Measure } from '@/lib/dga/dossiers';

export default function PublicDgaPage() {
  const params = useParams<{ tenant: string; id: string }>();
  const tenant = String(params?.tenant || '');
  const id = String(params?.id || '');
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [measures, setMeasures] = useState<Measure[]>([]);
  const [logo, setLogo] = useState<string>('/c-secur360-logo.png');
  const [tenantName, setTenantName] = useState<string>('');
  const [state, setState] = useState<'loading' | 'ok' | 'notfound'>('loading');

  useEffect(() => {
    (async () => {
      try {
        const { data: cs } = await supabase.from('company_settings').select('logo_url, company_name, name').eq('tenant_id', tenant).maybeSingle();
        if (cs?.logo_url) setLogo(cs.logo_url);
        if (cs?.company_name || cs?.name) setTenantName(cs.company_name || cs.name);
      } catch { /* défaut */ }
      try {
        const { data: d } = await supabase.from('dga_dossiers').select('*').eq('id', id).maybeSingle();
        if (!d) { setState('notfound'); return; }
        setDossier(d as Dossier);
        const { data: ms } = await supabase.from('dga_measures').select('*').eq('dossier_id', id).order('sample_date', { ascending: true });
        setMeasures((ms as Measure[]) || []);
        setState('ok');
      } catch { setState('notfound'); }
    })();
  }, [tenant, id]);

  if (state === 'loading') return <div className="min-h-screen grid place-items-center bg-slate-50 text-slate-400"><Loader2 className="animate-spin" /></div>;
  if (state === 'notfound' || !dossier) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 p-6">
        <div className="max-w-sm w-full rounded-2xl bg-white p-6 text-center shadow">
          <AlertTriangle className="mx-auto text-amber-500" size={36} />
          <h1 className="mt-3 text-lg font-bold text-slate-800">Transformateur introuvable</h1>
          <p className="mt-1 text-sm text-slate-500">Ce code QR ne correspond à aucun transformateur actif.</p>
        </div>
      </div>
    );
  }

  const cur = measures.length ? measures[measures.length - 1] : null;
  const worst = cur ? worstCondition(cur) : null;
  const pcb = pcbStatus(latestPcb(measures), 'fr');
  const nextDate = effectiveNextDate(dossier.extra, cur);
  const due = dueStatusByDate(nextDate);
  const dueColor = due.code === 'overdue' ? '#e63946' : due.code === 'soon' ? '#f4a261' : due.code === 'ok' ? '#2a9d8f' : '#999';
  const dueLabel = due.code === 'overdue' ? 'En retard' : due.code === 'soon' ? 'Bientôt dû' : due.code === 'ok' ? 'À jour' : '—';
  const hasOil = cur && (OIL_FIELDS.some(f => cur.oil_quality?.[f.key] != null) || FURAN_FIELDS.some(f => cur.oil_quality?.[f.key] != null));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 p-4">
      <div className="mx-auto max-w-lg">
        {/* En-tête de marque */}
        <div className="flex items-center justify-between rounded-t-2xl bg-white px-5 py-4 shadow">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt="logo" className="h-9 w-auto object-contain" onError={(e) => { (e.target as HTMLImageElement).src = '/c-secur360-logo.png'; }} />
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{tenantName || tenant}</span>
        </div>

        <div className="space-y-4 rounded-b-2xl bg-white px-5 pb-6 pt-3 shadow">
          {/* ── MENTION BPC EN PREMIER ── */}
          <div className="rounded-xl border-2 p-3 text-center" style={{ borderColor: pcb.color, background: pcb.color + '14' }}>
            <div className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: pcb.color }}>
              <Droplet size={13} /> Conformité BPC / PCB
            </div>
            <div className="mt-0.5 text-xl font-extrabold" style={{ color: pcb.color }}>{pcb.label}</div>
            <div className="text-[11px] text-slate-500">
              {pcb.value != null ? `${pcb.value} ppm — ` : ''}
              {pcb.code === 'present' ? 'Huile réglementée (≥ 50 ppm).' : pcb.code === 'trace' ? 'Faible teneur (2–49 ppm).' : pcb.code === 'none' ? 'Huile non-BPC (< 2 ppm).' : 'Non testé.'}
            </div>
          </div>

          {/* Identité */}
          <div className="border-b border-slate-100 pb-3">
            <h1 className="text-2xl font-extrabold leading-tight text-slate-900">{dossier.ident}</h1>
            <div className="mt-0.5 text-xs text-slate-500">
              {dossier.client || '—'}{dossier.serie ? ` · SN ${dossier.serie}` : ''}{dossier.kv ? ` · ${dossier.kv} kV` : ''}{dossier.manufacturer ? ` · ${dossier.manufacturer}` : ''}
            </div>
          </div>

          {/* Verdicts globaux */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3 text-center text-white" style={{ background: worst != null ? COND_COLORS[worst] : '#94a3b8' }}>
              <div className="text-lg font-extrabold">{worst != null ? COND_LABELS[worst] : '—'}</div>
              <div className="text-[11px] uppercase tracking-wide opacity-90">DGA global</div>
            </div>
            <div className="rounded-xl border-2 p-3 text-center" style={{ borderColor: dueColor, background: dueColor + '14' }}>
              <div className="text-sm font-extrabold" style={{ color: dueColor }}>{dueLabel}</div>
              <div className="text-[11px] text-slate-500">Prochaine analyse{nextDate ? ` · ${nextDate}` : ''}</div>
            </div>
          </div>

          {/* Dernière mesure : gaz + condition IEEE */}
          {cur && (
            <div>
              <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">Derniers gaz dissous · {cur.sample_date || '—'}</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-[11px] text-slate-400"><th className="px-2 py-1 text-left font-semibold">Gaz</th><th className="px-2 py-1 text-right font-semibold">ppm</th><th className="px-2 py-1 text-left font-semibold">Condition</th></tr></thead>
                  <tbody>
                    {IEEE_ROWS.map(({ key, u }) => {
                      const c = ieeeCondition(key as string, (cur as any)[key]);
                      return (
                        <tr key={u} className="border-t border-slate-100">
                          <td className="px-2 py-1 text-slate-700">{gl(u, 'fr')}</td>
                          <td className="px-2 py-1 text-right font-semibold text-slate-800">{(cur as any)[key] ?? '—'}</td>
                          <td className="px-2 py-1">{c != null && <span className="rounded px-1.5 py-0.5 text-[11px] font-bold text-white" style={{ background: COND_COLORS[c] }}>{COND_LABELS[c]}</span>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Qualité d'huile (synthèse) */}
          {hasOil && cur && (
            <div>
              <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">Qualité de l'huile</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    {OIL_FIELDS.filter(f => cur.oil_quality?.[f.key] != null).map(f => (
                      <tr key={f.key} className="border-t border-slate-100"><td className="px-2 py-1 text-slate-600">{fl(f, 'fr')}</td><td className="px-2 py-1 text-right font-semibold text-slate-800">{cur.oil_quality[f.key]}</td></tr>
                    ))}
                    {FURAN_FIELDS.filter(f => cur.oil_quality?.[f.key] != null).map(f => (
                      <tr key={f.key} className="border-t border-slate-100"><td className="px-2 py-1 italic text-slate-600">{fl(f, 'fr')} (ppb)</td><td className="px-2 py-1 text-right font-semibold text-slate-800">{cur.oil_quality[f.key]}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Édition (réservée aux utilisateurs connectés — sinon redirigé vers la connexion) */}
          <a href={`/${tenant}/dga`} className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black">
            <Pencil size={15} /> Ouvrir dans l'application
          </a>
          <p className="text-center text-[11px] text-slate-400">L'édition nécessite un compte. Sans connexion, cette fiche reste en lecture seule.</p>

          <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-slate-400">
            <ShieldCheck size={13} /> Fiche officielle · C-Secur360
          </div>
        </div>
      </div>
    </div>
  );
}
