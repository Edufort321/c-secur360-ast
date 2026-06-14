'use client';

// Module MARKETING IA du TENANT. (1) PROFIL D'ENTREPRISE qui nourrit l'IA (la plateforme ne connaît pas
// l'activité du tenant). (2) Génération de contenu marketing conforme. (3) Toute la conso IA est
// plafonnée par le FORFAIT du tenant (jauge affichée). Le studio vidéo (avatar/vidéo réelle + slides)
// arrive ensuite ; la vidéo réelle + montage est gratuite, l'avatar parlant consomme le forfait.
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Megaphone, Save, Sparkles, Loader2, Copy, Building2, Video, KeyRound, ExternalLink, Image as ImageIcon, Film, Trash2, Mic } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PortalHeader } from '@/components/PortalHeader';
import MarketingComposer from '@/components/admin/MarketingComposer';
import CameraRecorder from '@/components/admin/CameraRecorder';

const AVA_VOICES = [
  { v: 'fr-CA-SylvieNeural', l: 'FR-CA · Sylvie' }, { v: 'fr-CA-AntoineNeural', l: 'FR-CA · Antoine' },
  { v: 'fr-FR-DeniseNeural', l: 'FR · Denise' }, { v: 'fr-FR-HenriNeural', l: 'FR · Henri' },
  { v: 'en-US-JennyNeural', l: 'EN · Jenny' }, { v: 'en-US-GuyNeural', l: 'EN · Guy' },
];

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
  // Clé vidéo D-ID du tenant (BYOK) — il gère/paie sa propre conso vidéo avatar.
  const [didConfigured, setDidConfigured] = useState(false);
  const [didKey, setDidKey] = useState('');
  const [savingDid, setSavingDid] = useState(false);
  const [showProc, setShowProc] = useState(false);

  async function loadDid() {
    try { const r = await fetch('/api/marketing/secrets', { credentials: 'include' }); const j = await r.json(); if (r.ok) setDidConfigured(!!j.hasDid); } catch {}
  }

  // ── Studio vidéo (médiathèque + avatar + caméra + assembleur), scopé tenant ──
  const [assets, setAssets] = useState<{ avatars: any[]; library: any[]; bgVideos: any[]; videos: any[]; compositions: any[] }>({ avatars: [], library: [], bgVideos: [], videos: [], compositions: [] });
  const [upBusy, setUpBusy] = useState(false);
  const [avaSel, setAvaSel] = useState('');
  const [avaText, setAvaText] = useState('');
  const [avaVoice, setAvaVoice] = useState('fr-CA-SylvieNeural');
  const [avaBusy, setAvaBusy] = useState(false);

  function mapAssets(j: any) {
    const m = (arr: any[]) => (arr || []).map((a: any) => ({ id: a.id, url: a.data?.url, name: a.data?.name, created_at: a.created_at })).filter((x: any) => x.url);
    setAssets({ avatars: m(j.avatars), library: m(j.library), bgVideos: m(j.bgVideos), videos: m(j.videos), compositions: m(j.compositions) });
  }
  async function loadAssets() { try { const r = await fetch('/api/marketing/data', { credentials: 'include' }); const j = await r.json(); if (r.ok) mapAssets(j); } catch {} }

  async function uploadTenant(file: File, prefix: string): Promise<string> {
    const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
    const r = await fetch('/api/marketing/sign-upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ prefix, ext }) });
    const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Upload');
    const { error } = await supabase.storage.from('marketing').uploadToSignedUrl(j.path, j.token, file, { contentType: file.type || undefined });
    if (error) throw new Error(error.message);
    return j.publicUrl as string;
  }
  async function saveAsset(kind: string, data: any) { await fetch('/api/marketing/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ action: 'save-asset', kind, data }) }); loadAssets(); }
  async function delAsset(id: string) { await fetch('/api/marketing/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ action: 'delete-asset', id }) }); loadAssets(); }
  const saveClip = async (url: string) => saveAsset('avatar_video', { url });
  const saveComposition = async (url: string) => saveAsset('composition_video', { url });

  async function uploadKind(file: File, prefix: string, kind: string) {
    setUpBusy(true); setMsg(null);
    try { const url = await uploadTenant(file, prefix); await saveAsset(kind, { url, name: file.name }); }
    catch (e: any) { setMsg({ t: 'Upload : ' + (e?.message || ''), ok: false }); }
    finally { setUpBusy(false); }
  }

  async function generateAvatar() {
    const ava = assets.avatars.find(a => a.id === avaSel);
    if (!ava) { setMsg({ t: 'Choisis d’abord un avatar (image de visage) dans la médiathèque.', ok: false }); return; }
    if (!avaText.trim()) { setMsg({ t: 'Écris le texte à narrer.', ok: false }); return; }
    if (!didConfigured) { setMsg({ t: 'Configure ta clé D-ID (section Vidéo IA) pour générer un avatar.', ok: false }); return; }
    setAvaBusy(true); setMsg(null);
    try {
      const r = await fetch('/api/marketing/avatar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ image: ava.url, text: avaText, voice: avaVoice }) });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Échec');
      if (j.status === 'done') { setMsg({ t: '✓ Avatar généré — disponible dans l’assembleur.', ok: true }); loadAssets(); }
      else setMsg({ t: 'Rendu en cours (réessaie dans un instant pour le voir).', ok: true });
    } catch (e: any) { setMsg({ t: 'Avatar : ' + (e?.message || ''), ok: false }); }
    finally { setAvaBusy(false); }
  }
  async function saveDid() {
    setSavingDid(true); setMsg(null);
    try {
      const r = await fetch('/api/marketing/secrets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ did_api_key: didKey }) });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Échec');
      setDidConfigured(!!j.hasDid); setDidKey('');
      setMsg({ t: j.hasDid ? '✓ Clé vidéo D-ID enregistrée.' : 'Clé retirée.', ok: true });
    } catch (e: any) { setMsg({ t: 'Erreur : ' + (e?.message || ''), ok: false }); }
    finally { setSavingDid(false); }
  }

  async function loadBudget() {
    try { const r = await fetch('/api/marketing/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ action: 'budget', tenant }) }); const j = await r.json(); if (r.ok) setBudget(j.budget); } catch {}
  }
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('tenant_marketing_profile').select('*').eq('tenant_id', tenant).maybeSingle();
      if (data) setP((prev: any) => ({ ...prev, ...data }));
      setLoaded(true);
    })();
    loadBudget(); loadDid(); loadAssets();
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

        {/* Vidéo IA — clé D-ID du tenant (BYOK). Le texte IA est sur le forfait ; la vidéo avatar est gérée/payée par le tenant. */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-1"><Video size={16} className="text-pink-600" /> Vidéo IA — avatar parlant <span className={`text-[11px] px-2 py-0.5 rounded-full ${didConfigured ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{didConfigured ? 'Clé configurée' : 'Non configurée'}</span></h2>
          <p className="text-xs text-gray-500 mb-2">La <b>génération d’avatars parlants</b> utilise le service D-ID. Tu fournis <b>ta propre clé D-ID</b> et gères ta consommation/facturation vidéo directement (indépendant de ton forfait texte). 💡 La <b>vidéo réelle (caméra) + slides</b> reste <b>gratuite</b>.</p>
          <div className="flex gap-2 items-end">
            <div className="flex-1"><label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1"><KeyRound size={12} /> Clé API D-ID</label>
              <input className="inp" type="password" value={didKey} onChange={e => setDidKey(e.target.value)} placeholder={didConfigured ? '•••••••• (configurée — entre une nouvelle pour remplacer)' : 'colle ta clé D-ID ici'} /></div>
            <button onClick={saveDid} disabled={savingDid} className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-sm rounded-lg disabled:opacity-60">{savingDid ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Enregistrer</button>
          </div>
          <button onClick={() => setShowProc(s => !s)} className="mt-2 text-xs text-pink-600 hover:underline">{showProc ? '▲ Masquer' : '▼ Comment obtenir ma clé D-ID ?'}</button>
          {showProc && (
            <div className="mt-2 rounded-lg bg-pink-50 p-3 text-xs text-gray-700 space-y-1">
              <p><b>Procédure :</b></p>
              <ol className="list-decimal ml-5 space-y-0.5">
                <li>Crée un compte sur <a href="https://www.d-id.com" target="_blank" rel="noreferrer" className="text-pink-600 underline inline-flex items-center gap-0.5">d-id.com <ExternalLink size={10} /></a> (essai gratuit 14 j — 3 min de vidéo).</li>
                <li>Choisis un forfait. ⚠ Pour un usage <b>commercial</b>, il faut au minimum le forfait <b>Launch</b> (licence commerciale). Build (16 min/mois) suffit pour tester sans usage commercial.</li>
                <li>Dans D-ID : <b>Studio → Account Settings (réglages du compte) → API</b>.</li>
                <li><b>Copie ta clé API</b> (format <code>identifiant:motdepasse</code> ou clé fournie) et colle-la ci-dessus.</li>
              </ol>
              <p className="text-gray-500">Tarifs indicatifs D-ID : Build 14,40 $/mois (≈16 min), Launch 69,30 $/mois (≈90 min, commercial), Scale 208 $/mois (≈300 min).</p>
            </div>
          )}
        </div>

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

        {/* ───────── STUDIO VIDÉO ───────── */}
        <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mt-8 mb-2"><Film className="text-pink-600" /> Studio vidéo</h2>

        {/* Médiathèque */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">🗂 Médiathèque {upBusy && <Loader2 className="inline animate-spin" size={13} />}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MediaCol title="🧑 Avatars (visage)" items={assets.avatars} onDel={delAsset} accept="image/*" label="avatar" onPick={f => uploadKind(f, 'avatar', 'avatar_model')} />
            <MediaCol title="📷 Photos / images" items={assets.library} onDel={delAsset} accept="image/*" label="image" onPick={f => uploadKind(f, 'library', 'library_image')} />
            <MediaCol title="🎞 Vidéos de fond" items={assets.bgVideos} onDel={delAsset} accept="video/*" video label="vidéo de fond" onPick={f => uploadKind(f, 'bg', 'bg_video')} />
          </div>
        </div>

        {/* Avatar parlant (BYOK D-ID) */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-1 text-sm"><Mic size={15} /> Avatar parlant (via ta clé D-ID)</h3>
          {!didConfigured && <p className="text-xs text-amber-700 mb-2">Configure ta clé D-ID (section « Vidéo IA » plus haut) pour générer un avatar.</p>}
          {assets.avatars.length === 0 && <p className="text-xs text-gray-500 mb-2">Ajoute d’abord une image d’avatar (visage) dans la médiathèque.</p>}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <F l="Avatar"><select className="inp" value={avaSel} onChange={e => setAvaSel(e.target.value)}><option value="">— choisir —</option>{assets.avatars.map(a => <option key={a.id} value={a.id}>{a.name || 'avatar'}</option>)}</select></F>
            <F l="Voix"><select className="inp" value={avaVoice} onChange={e => setAvaVoice(e.target.value)}>{AVA_VOICES.map(v => <option key={v.v} value={v.v}>{v.l}</option>)}</select></F>
            <div className="flex items-end">{avaSel && assets.avatars.find(a => a.id === avaSel)?.url && <img src={assets.avatars.find(a => a.id === avaSel)!.url} alt="" className="w-12 h-12 rounded-lg object-cover border" />}</div>
          </div>
          <F l="Texte à narrer"><textarea className="inp" rows={2} value={avaText} onChange={e => setAvaText(e.target.value)} /></F>
          <button onClick={generateAvatar} disabled={avaBusy} className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-sm rounded-lg disabled:opacity-60">{avaBusy ? <Loader2 className="animate-spin" size={14} /> : <Mic size={14} />} {avaBusy ? 'Génération (10-40 s)…' : 'Générer l’avatar parlant'}</button>
        </div>

        {/* Vidéo réelle (gratuite) */}
        <div className="mb-4"><CameraRecorder uploadFile={uploadTenant} saveClip={saveClip} onNotice={(m: any) => setMsg({ t: m.msg, ok: m.ok })} /></div>

        {/* Assembleur (montage avec slides) */}
        <MarketingComposer avatarVideos={assets.videos} library={assets.library} bgVideos={assets.bgVideos} storyboard={pack?.storyboard} onNotice={(m: any) => setMsg({ t: m.msg, ok: m.ok })} uploadFile={uploadTenant} saveVideoToGallery={saveComposition} />

        {/* Galerie */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mt-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-2">📁 Mes vidéos enregistrées</h3>
          {[...assets.compositions.map(v => ({ ...v, tag: 'Montage' })), ...assets.videos.map(v => ({ ...v, tag: 'Avatar/clip' }))].length === 0 ? <p className="text-sm text-gray-400">Aucune vidéo.</p> : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[...assets.compositions.map(v => ({ ...v, tag: 'Montage' })), ...assets.videos.map(v => ({ ...v, tag: 'Clip' }))].map(v => (
                <div key={v.id} className="border border-gray-200 rounded-lg p-1.5"><video src={v.url} controls preload="metadata" className="w-full rounded" style={{ aspectRatio: '16/9', objectFit: 'cover', background: '#000' }} /><div className="flex items-center justify-between mt-1"><span className="text-[10px] text-gray-400">{v.tag}</span><button onClick={() => delAsset(v.id)} className="text-red-500"><Trash2 size={12} /></button></div></div>
              ))}
            </div>
          )}
        </div>
      </div>
      <style jsx>{`:global(.inp){ width:100%; padding:8px 11px; border:1px solid #d1d5db; border-radius:8px; font-size:13px; }`}</style>
    </div>
  );
}

function MediaCol({ title, items, onDel, onPick, accept, label, video }: { title: string; items: any[]; onDel: (id: string) => void; onPick: (f: File) => void; accept: string; label: string; video?: boolean }) {
  return (
    <div>
      <div className="text-xs font-semibold text-gray-600 mb-1">{title}</div>
      <div className="flex flex-wrap gap-1.5 mb-2 min-h-[1rem]">
        {items.length === 0 && <span className="text-[11px] text-gray-400">Vide.</span>}
        {items.map(it => (
          <div key={it.id} className="relative w-14 h-14">
            {video ? <video src={it.url} muted className="w-14 h-14 object-cover rounded border" /> : <img src={it.url} alt="" className="w-14 h-14 object-cover rounded border" />}
            <button onClick={() => onDel(it.id)} className="absolute -top-1.5 -right-1.5 bg-white rounded-full border text-red-500 leading-none">×</button>
          </div>
        ))}
      </div>
      <label className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs cursor-pointer hover:bg-gray-50">＋ Ajouter {label}<input type="file" accept={accept} hidden onChange={e => { const f = e.target.files?.[0]; if (f) onPick(f); e.currentTarget.value = ''; }} /></label>
    </div>
  );
}
function F({ l, children, full }: { l: string; children: React.ReactNode; full?: boolean }) { return <div className={full ? 'sm:col-span-2' : ''}><label className="block text-xs font-medium text-gray-600 mb-1">{l}</label>{children}</div>; }
function Out({ title, onCopy, children }: { title: string; onCopy: () => void; children: React.ReactNode }) {
  return <div className="rounded-lg border border-gray-200 p-3"><div className="flex items-center justify-between mb-1"><span className="text-xs font-semibold text-gray-600">{title}</span><button onClick={onCopy} className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700"><Copy size={12} /> copier</button></div>{children}</div>;
}
