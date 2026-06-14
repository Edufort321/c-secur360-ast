'use client';

// Module MARKETING IA du TENANT. (1) PROFIL D'ENTREPRISE qui nourrit l'IA (la plateforme ne connaît pas
// l'activité du tenant). (2) Génération de contenu marketing conforme. (3) Toute la conso IA est
// plafonnée par le FORFAIT du tenant (jauge affichée). Le studio vidéo (avatar/vidéo réelle + slides)
// arrive ensuite ; la vidéo réelle + montage est gratuite, l'avatar parlant consomme le forfait.
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Megaphone, Save, Sparkles, Loader2, Copy, Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PortalHeader } from '@/components/PortalHeader';

export default function TenantMarketing() {
  const { tenant } = useParams() as { tenant: string };
  const [p, setP] = useState<any>({ company_name: '', sector: '', description: '', offer: '', audience: '', tone: 'Professionnel', key_points: '', website: '', province: 'QC', lang: 'fr' });
  const [loaded, setLoaded] = useState(false);
  const [savingP, setSavingP] = useState(false);
  const [budget, setBudget] = useState<any>(null);
  const [objective, setObjective] = useState('');
  const [pack, setPack] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ t: string; ok: boolean } | null>(null);

  async function loadBudget() {
    try { const r = await fetch('/api/marketing/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ action: 'budget', tenant }) }); const j = await r.json(); if (r.ok) setBudget(j.budget); } catch {}
  }
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('tenant_marketing_profile').select('*').eq('tenant_id', tenant).maybeSingle();
      if (data) setP((prev: any) => ({ ...prev, ...data }));
      setLoaded(true);
    })();
    loadBudget();
  }, [tenant]);

  const set = (k: string, v: any) => setP((x: any) => ({ ...x, [k]: v }));

  async function saveProfile() {
    if (!p.description?.trim()) { setMsg({ t: 'Décris ce que fait ton entreprise (champ essentiel).', ok: false }); return; }
    setSavingP(true); setMsg(null);
    try {
      const { error } = await supabase.from('tenant_marketing_profile').upsert({ tenant_id: tenant, ...p, updated_at: new Date().toISOString() }, { onConflict: 'tenant_id' });
      if (error) throw error;
      setMsg({ t: '✓ Profil enregistré — l’IA l’utilisera.', ok: true });
    } catch (e: any) { setMsg({ t: 'Erreur : ' + (e?.message || ''), ok: false }); }
    finally { setSavingP(false); }
  }

  async function generate() {
    setBusy(true); setMsg(null); setPack(null);
    try {
      const r = await fetch('/api/marketing/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ tenant, objective }) });
      const j = await r.json();
      if (!r.ok) { setMsg({ t: j.error || 'Échec', ok: false }); return; }
      setPack(j.pack); loadBudget();
    } catch (e: any) { setMsg({ t: 'Erreur : ' + (e?.message || ''), ok: false }); }
    finally { setBusy(false); }
  }

  const copy = (t: string) => navigator.clipboard?.writeText(t);
  const pct = budget?.unlimited ? 100 : (budget?.remainingPct ?? 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalHeader tenant={tenant} />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900"><Megaphone className="text-pink-600" /> Marketing IA</h1>
        <p className="text-sm text-gray-500 mb-4">L’IA produit ton contenu marketing à partir de TON profil d’entreprise. La consommation est incluse dans ton forfait IA.</p>

        {/* Jauge de forfait IA */}
        {budget && (
          <div className="bg-white rounded-xl border border-gray-200 p-3 mb-4">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Forfait IA {budget.unlimited ? '(illimité)' : `— ${pct}% restant`}</span>
              {!budget.unlimited && <span>{(budget.remainingCents / 100).toFixed(2)} $ / {(budget.budgetCents / 100).toFixed(2)} $</span>}
            </div>
            {!budget.unlimited && <div className="h-2 rounded-full bg-gray-100 overflow-hidden"><div className={`h-full ${pct <= 10 ? 'bg-red-500' : pct <= 30 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} /></div>}
            {budget.exhausted && <p className="text-xs text-red-600 mt-1">Forfait épuisé — augmente ton forfait pour continuer à générer.</p>}
            {budget.lowBalance && !budget.exhausted && <p className="text-xs text-amber-600 mt-1">Forfait bientôt épuisé.</p>}
          </div>
        )}

        {msg && <div className={`mb-3 p-2.5 rounded-lg text-sm ${msg.ok ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{msg.t}</div>}

        {/* Profil d'entreprise */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-3"><Building2 size={16} /> Profil d’entreprise <span className="text-xs font-normal text-gray-400">(nourrit l’IA)</span></h2>
          {!loaded ? <p className="text-sm text-gray-400">Chargement…</p> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <F l="Nom de l’entreprise"><input className="inp" value={p.company_name || ''} onChange={e => set('company_name', e.target.value)} /></F>
              <F l="Secteur d’activité"><input className="inp" value={p.sector || ''} onChange={e => set('sector', e.target.value)} placeholder="ex. construction, restauration…" /></F>
              <F l="Ce que vous faites (activité) *" full><textarea className="inp" rows={2} value={p.description || ''} onChange={e => set('description', e.target.value)} placeholder="Décrivez votre activité, votre mission…" /></F>
              <F l="Produits / services"><input className="inp" value={p.offer || ''} onChange={e => set('offer', e.target.value)} /></F>
              <F l="Clientèle cible"><input className="inp" value={p.audience || ''} onChange={e => set('audience', e.target.value)} /></F>
              <F l="Arguments clés / différenciateurs" full><textarea className="inp" rows={2} value={p.key_points || ''} onChange={e => set('key_points', e.target.value)} /></F>
              <F l="Ton de marque"><select className="inp" value={p.tone || 'Professionnel'} onChange={e => set('tone', e.target.value)}><option>Professionnel</option><option>Chaleureux</option><option>Premium</option><option>Dynamique</option><option>Technique</option></select></F>
              <F l="Site web"><input className="inp" value={p.website || ''} onChange={e => set('website', e.target.value)} /></F>
              <F l="Langue"><select className="inp" value={p.lang || 'fr'} onChange={e => set('lang', e.target.value)}><option value="fr">Français</option><option value="en">English</option></select></F>
            </div>
          )}
          <button onClick={saveProfile} disabled={savingP} className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded-lg disabled:opacity-60"><Save size={15} /> {savingP ? 'Enregistrement…' : 'Enregistrer le profil'}</button>
        </div>

        {/* Génération */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-3"><Sparkles size={16} /> Générer du contenu</h2>
          <F l="Objectif / sujet de la campagne"><input className="inp" value={objective} onChange={e => setObjective(e.target.value)} placeholder="ex. promouvoir notre nouveau service, recruter, offre saisonnière…" /></F>
          <button onClick={generate} disabled={busy || budget?.exhausted} className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium rounded-lg disabled:opacity-60">{busy ? <Loader2 className="animate-spin" size={15} /> : <Sparkles size={15} />} {busy ? 'Génération…' : '✦ Générer le pack marketing'}</button>

          {pack && (
            <div className="mt-4 space-y-4 text-sm">
              {Array.isArray(pack.hooks) && <Out title="Accroches" onCopy={() => copy(pack.hooks.join('\n'))}><ul className="list-disc ml-5">{pack.hooks.map((h: string, i: number) => <li key={i}>{h}</li>)}</ul></Out>}
              {pack.script && <Out title="Script vidéo" onCopy={() => copy(pack.script)}><p className="whitespace-pre-wrap">{pack.script}</p></Out>}
              {pack.captions && <Out title="Sous-titres" onCopy={() => copy(pack.captions)}><pre className="whitespace-pre-wrap text-xs">{pack.captions}</pre></Out>}
              {Array.isArray(pack.social_posts) && pack.social_posts.map((s: any, i: number) => (
                <Out key={i} title={`Post — ${s.platform}`} onCopy={() => copy(`${s.caption}\n\n${(s.hashtags || []).join(' ')}`)}><p className="whitespace-pre-wrap">{s.caption}</p>{Array.isArray(s.hashtags) && <p className="text-xs text-pink-600 mt-1">{s.hashtags.join(' ')}</p>}</Out>
              ))}
              {pack.follow_up_email && <Out title="Courriel de suivi" onCopy={() => copy(`${pack.follow_up_email.subject}\n\n${pack.follow_up_email.body}`)}><p className="font-medium">{pack.follow_up_email.subject}</p><pre className="whitespace-pre-wrap text-xs mt-1">{pack.follow_up_email.body}</pre></Out>}
              {Array.isArray(pack.warnings) && pack.warnings.length > 0 && <div className="rounded bg-amber-50 p-2 text-xs text-amber-800">⚠ {pack.warnings.join(' · ')}</div>}
            </div>
          )}
        </div>
      </div>
      <style jsx>{`:global(.inp){ width:100%; padding:8px 11px; border:1px solid #d1d5db; border-radius:8px; font-size:13px; }`}</style>
    </div>
  );
}

function F({ l, children, full }: { l: string; children: React.ReactNode; full?: boolean }) { return <div className={full ? 'sm:col-span-2' : ''}><label className="block text-xs font-medium text-gray-600 mb-1">{l}</label>{children}</div>; }
function Out({ title, onCopy, children }: { title: string; onCopy: () => void; children: React.ReactNode }) {
  return <div className="rounded-lg border border-gray-200 p-3"><div className="flex items-center justify-between mb-1"><span className="text-xs font-semibold text-gray-600">{title}</span><button onClick={onCopy} className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700"><Copy size={12} /> copier</button></div>{children}</div>;
}
