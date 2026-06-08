'use client';

// #82 — Fiche produit PUBLIQUE (cible du QR d'un article). Ouvrable sans application ni connexion
// (route publique, lecture anon de inventory_state via RLS permissive). Présentation pro + logo tenant.
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Package, MapPin, DollarSign, Boxes, AlertTriangle, ShieldCheck, Loader2, Plus, Minus, LogIn, CheckCircle2, X, ClipboardCheck } from 'lucide-react';

type Item = any;

function availableQty(item: Item): number {
  if (typeof item.quantity === 'number') return item.quantity;
  const locs = item.locations || item.item_locations || [];
  if (Array.isArray(locs) && locs.length) return locs.reduce((s: number, l: any) => s + (Number(l.quantity ?? l.qty ?? 0) || 0), 0);
  return Number(item.quantity || 0) || 0;
}
function firstPhoto(item: Item): string | null {
  const p = (item.photos && item.photos[0]) || item.photo || null;
  if (!p) return null;
  return typeof p === 'string' ? p : (p.url || p.dataUrl || p.src || null);
}
const money = (n: any) => `${(Number(n) || 0).toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;

export default function PublicScanPage() {
  const params = useParams<{ tenant: string; id: string }>();
  const tenant = String(params?.tenant || '');
  const id = String(params?.id || '');
  const [item, setItem] = useState<Item | null>(null);
  const [logo, setLogo] = useState<string>('/c-secur360-logo.png');
  const [tenantName, setTenantName] = useState<string>('');
  const [state, setState] = useState<'loading' | 'ok' | 'notfound'>('loading');

  // Session app (pour autoriser les mouvements de stock depuis la fiche scannee).
  const [authUser, setAuthUser] = useState<{ name?: string; email?: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Etat du panneau mouvement. 'count' = MODE INVENTAIRE (quantite reelle comptee vs affichee).
  const [moveType, setMoveType] = useState<'entry' | 'exit' | 'count'>('exit');
  const [moveQty, setMoveQty] = useState<number>(1);
  const [countedQty, setCountedQty] = useState<string>(''); // quantite reelle comptee (mode inventaire)
  const [moveDept, setMoveDept] = useState<string>('');
  // RAISON OBLIGATOIRE (entrée/sortie) : projet OU code interne (mêmes choix que le scanner in-app).
  const [reasonSource, setReasonSource] = useState<'project' | 'internal'>('project');
  const [reasonProject, setReasonProject] = useState<string>('');
  const [reasonInternal, setReasonInternal] = useState<string>('');
  const [projects, setProjects] = useState<any[]>([]);
  const [reasonCodes, setReasonCodes] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [moveMsg, setMoveMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  // Bouton X : ressortir vite (referme l'onglet ouvert par la camera native, sinon retour arriere).
  const closeAndScanNext = () => { try { window.close(); } catch { /* ignore */ } try { window.history.back(); } catch { /* ignore */ } };

  // Quantite systeme de l'emplacement courant (pour l'ecart du mode inventaire).
  const currentLocQty = (): number => {
    if (!item) return 0;
    if (item.isMultiLocation && Array.isArray(item.locations) && moveDept) {
      const l = item.locations.find((x: any) => String(x.departmentCode) === moveDept);
      if (l) return Number(l.quantity ?? l.qty ?? 0) || 0;
    }
    return availableQty(item);
  };

  const reloadItem = async () => {
    try {
      const { data } = await supabase.from('inventory_state').select('data').eq('tenant_id', tenant).maybeSingle();
      const list: Item[] = (data?.data?.items) || [];
      const found = list.find(i => String(i.id) === id || i.code === id);
      if (found) setItem(found);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    (async () => {
      // Logo + nom du tenant (best-effort).
      try {
        const { data: cs } = await supabase.from('company_settings').select('logo_url, legal_name').eq('tenant_id', tenant).maybeSingle();
        if (cs?.logo_url) setLogo(cs.logo_url);
        if (cs?.legal_name) setTenantName(cs.legal_name);
      } catch { /* défaut */ }
      // Session app (best-effort) : si connecte, on affichera les boutons +/-.
      try {
        const r = await fetch('/api/auth/me', { credentials: 'include' });
        if (r.ok) { const j = await r.json(); if (j?.user) setAuthUser({ name: j.user.name, email: j.user.email }); }
      } catch { /* anon */ } finally { setAuthChecked(true); }
      // Projets (raison) — best-effort.
      try { const { data: pr } = await supabase.from('projects').select('project_number, title, submission_number').eq('tenant_id', tenant).order('project_number', { ascending: false }); if (Array.isArray(pr)) setProjects(pr.filter((p: any) => p.project_number)); } catch { /* ignore */ }
      // Article + codes internes depuis l'instantané inventaire.
      try {
        const { data } = await supabase.from('inventory_state').select('data').eq('tenant_id', tenant).maybeSingle();
        const snap: any = data?.data || {};
        if (Array.isArray(snap.reasonCodes)) setReasonCodes(snap.reasonCodes);
        const list: Item[] = snap.items || [];
        const found = list.find((i: any) => String(i.id) === id || i.code === id);
        if (found) { setItem(found); setState('ok'); return; }
      } catch { /* ignore */ }
      setState('notfound');
    })();
  }, [tenant, id]);

  // Pre-selection de la succursale (article multi-emplacement) : on prend d'abord le ?dept=
  // de l'etiquette scannee, sinon le premier emplacement. (window.location pour eviter useSearchParams/Suspense.)
  useEffect(() => {
    if (!item || moveDept) return;
    if (item.isMultiLocation && Array.isArray(item.locations) && item.locations.length) {
      let fromUrl = '';
      try { fromUrl = new URLSearchParams(window.location.search).get('dept') || ''; } catch { /* ignore */ }
      const match = fromUrl && item.locations.find((l: any) => String(l.departmentCode) === fromUrl);
      const chosen = match ? fromUrl : (item.locations[0]?.departmentCode ? String(item.locations[0].departmentCode) : '');
      if (chosen) setMoveDept(chosen);
    }
  }, [item]); // eslint-disable-line react-hooks/exhaustive-deps

  const submitMovement = async () => {
    if (!item || busy) return;
    setMoveMsg(null);
    const isCount = moveType === 'count';
    const qty = Math.abs(Number(moveQty) || 0);
    const counted = Math.max(0, Math.round(Number(countedQty) || 0));
    if (!isCount && !(qty > 0)) { setMoveMsg({ kind: 'err', text: 'Entre une quantité valide.' }); return; }
    if (isCount && countedQty === '') { setMoveMsg({ kind: 'err', text: 'Entre la quantité réelle comptée.' }); return; }
    // RAISON OBLIGATOIRE pour entrée/sortie (pas pour le comptage d'inventaire).
    let reason = '';
    if (!isCount) {
      if (reasonSource === 'project') {
        if (!reasonProject) { setMoveMsg({ kind: 'err', text: 'Sélectionne un projet (raison obligatoire).' }); return; }
        reason = `${moveType === 'exit' ? 'Sortie' : 'Entrée'} — Projet ${reasonProject}`;
      } else {
        if (!reasonInternal) { setMoveMsg({ kind: 'err', text: 'Sélectionne un code interne (raison obligatoire).' }); return; }
        const rc = reasonCodes.find((c: any) => c.code === reasonInternal);
        reason = `${moveType === 'exit' ? 'Sortie' : 'Entrée'} — Code ${reasonInternal}${rc?.label ? ` (${rc.label})` : ''}`;
      }
    }
    setBusy(true);
    try {
      const payload: any = { tenant, itemId: String(item.id), departmentCode: moveDept || null, type: isCount ? 'adjustment' : moveType, reason, projectCode: reasonSource === 'project' ? reasonProject : '' };
      if (isCount) payload.countedQuantity = counted; else payload.quantity = qty;
      const res = await fetch('/api/inventory/movement', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.success) {
        const extra = j?.available != null ? ` (disponible : ${j.available})` : '';
        setMoveMsg({ kind: 'err', text: (j?.error || 'Échec du mouvement') + extra });
      } else if (isCount) {
        const d = Number(j.discrepancy || 0);
        setMoveMsg({ kind: 'ok', text: d === 0
          ? `Inventaire confirmé : ${counted} — aucun écart. ✅`
          : `Inventaire ajusté : écart ${d > 0 ? '+' : ''}${d} (système → compté). Nouveau stock : ${j.quantity}. Écart enregistré (balancement).` });
        setReasonProject(''); setReasonInternal('');
        await reloadItem();
      } else {
        setMoveMsg({ kind: 'ok', text: `${moveType === 'exit' ? 'Sortie' : 'Entrée'} de ${qty} enregistrée. Nouveau stock : ${j.quantity}.` });
        setReasonProject(''); setReasonInternal('');
        await reloadItem();
      }
    } catch (e: any) {
      setMoveMsg({ kind: 'err', text: 'Réseau indisponible : ' + (e?.message || e) });
    } finally { setBusy(false); }
  };

  if (state === 'loading') {
    return <div className="min-h-screen grid place-items-center bg-slate-50 text-slate-400"><Loader2 className="animate-spin" /></div>;
  }
  if (state === 'notfound' || !item) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 p-6">
        <div className="max-w-sm w-full rounded-2xl bg-white p-6 text-center shadow">
          <AlertTriangle className="mx-auto text-amber-500" size={36} />
          <h1 className="mt-3 text-lg font-bold text-slate-800">Article introuvable</h1>
          <p className="mt-1 text-sm text-slate-500">Ce code QR ne correspond à aucun article actif.</p>
        </div>
      </div>
    );
  }

  const qty = availableQty(item);
  const photo = firstPhoto(item);
  const min = item.minQuantity != null ? Number(item.minQuantity) : null;
  const max = item.maxQuantity != null ? Number(item.maxQuantity) : null;
  const low = min != null && qty <= min;
  const locations = item.locations || item.item_locations || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 p-4">
      <div className="mx-auto max-w-md">
        {/* En-tête de marque */}
        <div className="flex items-center justify-between rounded-t-2xl bg-white px-5 py-4 shadow">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} alt="logo" className="h-9 w-auto object-contain" onError={(e) => { (e.target as HTMLImageElement).src = '/c-secur360-logo.png'; }} />
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{tenantName || tenant}</span>
            {/* X : ressortir vite vers la camera pour le prochain scan */}
            <button onClick={closeAndScanNext} aria-label="Fermer" title="Fermer / scanner le suivant" className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-4 rounded-b-2xl bg-white px-5 pb-6 pt-2 shadow">
          {/* Identité produit */}
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-400">
              <Package size={15} />
              <span className="font-mono text-xs">{item.code || '—'}</span>
              {item.category && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">{item.category}</span>}
            </div>
            <h1 className="mt-1 text-2xl font-extrabold leading-tight text-slate-900">{item.name}</h1>
          </div>

          {photo && <img src={photo} alt={item.name} className="h-48 w-full rounded-xl border border-slate-200 object-cover" />}

          {/* Prix + dispo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3 text-center">
              <DollarSign className="mx-auto text-emerald-600" size={18} />
              <div className="mt-1 text-xl font-extrabold text-emerald-700">{money(item.salePrice ?? item.sale_price)}</div>
              <div className="text-[11px] text-slate-500">Prix vendant</div>
            </div>
            <div className={`rounded-xl border-2 p-3 text-center ${low ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
              <Boxes className={`mx-auto ${low ? 'text-red-600' : 'text-blue-600'}`} size={18} />
              <div className={`mt-1 text-xl font-extrabold ${low ? 'text-red-700' : 'text-blue-700'}`}>{qty} {item.unit || ''}</div>
              <div className="text-[11px] text-slate-500">Disponible{low ? ' ⚠️' : ''}</div>
            </div>
          </div>

          {/* Min / Max — détails internes : visibles UNIQUEMENT pour un utilisateur connecté. */}
          {authUser && (min != null || max != null) && (
            <div className="flex items-center justify-center gap-6 rounded-lg bg-slate-50 py-2 text-sm">
              <span className="text-slate-500">Min : <strong className="text-slate-800">{min ?? '—'}</strong></span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">Max : <strong className="text-slate-800">{max ?? '—'}</strong></span>
            </div>
          )}

          {/* Description (info produit, publique) */}
          {item.description && <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{item.description}</p>}

          {/* Emplacement(s) — interne : visible UNIQUEMENT pour un utilisateur connecté. */}
          {authUser && (item.location || locations.length > 0) && (
            <div className="flex items-start gap-2 text-sm text-slate-600">
              <MapPin size={16} className="mt-0.5 flex-shrink-0 text-slate-400" />
              <span>{item.location || locations.map((l: any) => `${l.location || l.name || l.department || ''}${(l.quantity ?? l.qty) != null ? ` (${l.quantity ?? l.qty})` : ''}`).filter(Boolean).join(' · ')}</span>
            </div>
          )}

          {/* ===== Mouvement de stock (connecte uniquement) ===== */}
          {authChecked && (authUser ? (
            <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">Mouvement de stock</span>
                <span className="truncate pl-2 text-[11px] text-slate-400">{authUser.name || authUser.email}</span>
              </div>

              {/* Entree / Sortie / Inventaire */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setMoveType('entry')}
                  className={`flex items-center justify-center gap-1 rounded-lg border-2 py-2 text-xs font-bold transition ${moveType === 'entry' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-emerald-200 bg-white text-emerald-700'}`}
                >
                  <Plus size={14} /> Entrée
                </button>
                <button
                  onClick={() => setMoveType('exit')}
                  className={`flex items-center justify-center gap-1 rounded-lg border-2 py-2 text-xs font-bold transition ${moveType === 'exit' ? 'border-red-500 bg-red-500 text-white' : 'border-red-200 bg-white text-red-700'}`}
                >
                  <Minus size={14} /> Sortie
                </button>
                <button
                  onClick={() => { setMoveType('count'); setCountedQty(String(currentLocQty())); }}
                  className={`flex items-center justify-center gap-1 rounded-lg border-2 py-2 text-xs font-bold transition ${moveType === 'count' ? 'border-purple-500 bg-purple-500 text-white' : 'border-purple-200 bg-white text-purple-700'}`}
                >
                  <ClipboardCheck size={14} /> Inventaire
                </button>
              </div>

              {/* Succursale (si multi-emplacement) */}
              {item.isMultiLocation && Array.isArray(item.locations) && item.locations.length > 0 && (
                <select
                  value={moveDept}
                  onChange={(e) => setMoveDept(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
                >
                  {item.locations.map((l: any, i: number) => (
                    <option key={i} value={String(l.departmentCode || '')}>
                      {(l.department || l.location || `Emplacement ${i + 1}`)}{l.quantity != null ? ` — ${l.quantity} dispo` : ''}
                    </option>
                  ))}
                </select>
              )}

              {moveType === 'count' ? (
                /* MODE INVENTAIRE : quantite reelle comptee (selectionnee au focus pour ecraser vite) + ecart */
                <>
                  <div className="mt-2">
                    <label className="text-[11px] font-semibold text-purple-700">Quantité réelle comptée</label>
                    <input
                      type="number" min={0} inputMode="numeric" autoFocus
                      value={countedQty}
                      onFocus={(e) => e.currentTarget.select()}
                      onChange={(e) => setCountedQty(e.target.value)}
                      className="mt-1 h-12 w-full rounded-lg border-2 border-purple-300 bg-purple-50 px-3 text-center text-2xl font-extrabold text-purple-900"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-4 rounded-lg bg-slate-50 py-2 text-sm">
                    <span className="text-slate-500">Système : <strong className="text-slate-800">{currentLocQty()}</strong></span>
                    <span className="text-slate-300">→</span>
                    {(() => { const d = (Math.max(0, Math.round(Number(countedQty) || 0))) - currentLocQty(); return (
                      <span className={d === 0 ? 'text-slate-500' : d > 0 ? 'text-emerald-700 font-bold' : 'text-red-700 font-bold'}>Écart : {d > 0 ? '+' : ''}{countedQty === '' ? '—' : d}</span>
                    ); })()}
                  </div>
                </>
              ) : (
                /* ENTREE / SORTIE : +/- (selection au focus pour ecraser vite) */
                <div className="mt-2 flex items-center gap-2">
                  <button onClick={() => setMoveQty(q => Math.max(1, (Number(q) || 1) - 1))} className="h-10 w-10 flex-shrink-0 rounded-lg border border-slate-300 bg-white text-lg font-bold text-slate-600">−</button>
                  <input
                    type="number" min={1} inputMode="numeric"
                    value={moveQty}
                    onFocus={(e) => e.currentTarget.select()}
                    onChange={(e) => setMoveQty(Math.max(1, parseInt(e.target.value || '1', 10) || 1))}
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-center text-lg font-bold text-slate-900"
                  />
                  <button onClick={() => setMoveQty(q => (Number(q) || 1) + 1)} className="h-10 w-10 flex-shrink-0 rounded-lg border border-slate-300 bg-white text-lg font-bold text-slate-600">+</button>
                </div>
              )}

              {/* Raison OBLIGATOIRE (entrée/sortie) : Projet ou Code interne. Pas pour le comptage. */}
              {moveType !== 'count' && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-2">
                    <button onClick={() => { setReasonSource('project'); setReasonInternal(''); }} className={`flex-1 rounded-lg border-2 py-1.5 text-xs font-bold ${reasonSource === 'project' ? 'border-yellow-500 bg-yellow-50 text-yellow-800' : 'border-slate-200 bg-white text-slate-600'}`}>Projet</button>
                    <button onClick={() => { setReasonSource('internal'); setReasonProject(''); }} className={`flex-1 rounded-lg border-2 py-1.5 text-xs font-bold ${reasonSource === 'internal' ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white text-slate-600'}`}>Code interne</button>
                  </div>
                  {reasonSource === 'project' ? (
                    <>
                      <select value={reasonProject} onChange={(e) => setReasonProject(e.target.value)} className="w-full rounded-lg border-2 border-yellow-400 bg-white px-3 py-2 text-sm text-slate-800">
                        <option value="">— Projet (raison obligatoire) —</option>
                        {projects.map((p: any) => <option key={p.project_number} value={p.project_number}>{p.project_number}{p.title ? ` — ${p.title}` : ''}{p.submission_number ? ` (soum. ${p.submission_number})` : ''}</option>)}
                      </select>
                      {projects.length === 0 && <p className="text-[11px] text-amber-700">Aucun projet — utilise un code interne.</p>}
                    </>
                  ) : (
                    <>
                      <select value={reasonInternal} onChange={(e) => setReasonInternal(e.target.value)} className="w-full rounded-lg border-2 border-blue-400 bg-white px-3 py-2 text-sm text-slate-800">
                        <option value="">— Code interne (raison obligatoire) —</option>
                        {reasonCodes.map((c: any) => <option key={c.id} value={c.code}>{c.code}{c.label ? ` — ${c.label}` : ''}</option>)}
                      </select>
                      {reasonCodes.length === 0 && <p className="text-[11px] text-amber-700">Aucun code interne — à créer dans Administration → Codes internes.</p>}
                    </>
                  )}
                </div>
              )}

              {/* Valider */}
              <button
                onClick={submitMovement}
                disabled={busy}
                className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-base font-extrabold text-white shadow transition disabled:opacity-60 ${moveType === 'exit' ? 'bg-red-600 hover:bg-red-700' : moveType === 'count' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              >
                {busy ? <Loader2 className="animate-spin" size={18} /> : (moveType === 'exit' ? <Minus size={18} /> : moveType === 'count' ? <ClipboardCheck size={18} /> : <Plus size={18} />)}
                {busy ? 'Enregistrement…' : moveType === 'count' ? `Confirmer l'inventaire (compté : ${countedQty || '—'})` : `Confirmer la ${moveType === 'exit' ? 'sortie' : 'entrée'} de ${moveQty}`}
              </button>

              {moveMsg && (
                <div className={`mt-2 flex items-start gap-2 rounded-lg p-2 text-sm ${moveMsg.kind === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                  {moveMsg.kind === 'ok' ? <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" /> : <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />}
                  <span>{moveMsg.text}</span>
                </div>
              )}
            </div>
          ) : (
            <a
              href={`/${tenant}/login?redirect=${encodeURIComponent(`/scan/${tenant}/${id}`)}`}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-blue-200 bg-blue-50 py-3 text-sm font-bold text-blue-700"
            >
              <LogIn size={16} /> Se connecter pour faire une entrée / sortie
            </a>
          ))}

          <div className="flex items-center justify-center gap-1.5 pt-2 text-[11px] text-slate-400">
            <ShieldCheck size={13} /> Fiche officielle · C-Secur360
          </div>
        </div>
      </div>
    </div>
  );
}
