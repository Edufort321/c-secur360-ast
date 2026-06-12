'use client';

import { useEffect, useState } from 'react';

// Studio MARKETING IA (espace /admin). Porté du prototype C:\C-Secur360\Marketing.
// 3 sections : Studio vidéo · Prospection · Conformité. Les actions génératives appellent la VRAIE
// route IA serveur /api/admin/marketing/ai (clé côté serveur, prompt légal imposé). Le verrou de
// conformité (consentement LCAP) bloque toute programmation d'envoi.

type View = 'studio' | 'prospect' | 'compliance';

const MODULES = ['Rapports terrain (QR + IA)', 'DGA transformateurs', 'Permis espaces clos', 'Inventaire'];
const CLBL = { expres: 'Exprès', tacite: 'Tacite', bloque: 'Bloqué' } as const;
const PLAT_ICON: Record<string, string> = { LinkedIn: '💼', Facebook: '📘', Instagram: '📸', TikTok: '🎵', 'X (Twitter)': '𝕏', X: '𝕏', Twitter: '𝕏', YouTube: '▶️' };

export default function MarketingTab() {
  const [view, setView] = useState<View>('studio');

  const [notice, setNotice] = useState<{ msg: string; ok: boolean } | null>(null);

  // ── Studio : atelier « 1 brief → N livrables » (script, hooks, sous-titres, post, courriel, miniature)
  const ALL_FORMATS = [
    { k: '16:9', label: '16:9 · LinkedIn/YouTube' },
    { k: '9:16', label: '9:16 · Reels/TikTok' },
    { k: '1:1', label: '1:1 · Carré' },
  ];
  const [sModule, setSModule] = useState(MODULES[0]);
  const [sAudience, setSAudience] = useState('responsables SST / maintenance');
  const [sMsg, setSMsg] = useState('');
  const [sCta, setSCta] = useState('Réserver une démo');
  const [sLang, setSLang] = useState<'fr' | 'en'>('fr');
  const [sFormats, setSFormats] = useState<Record<string, boolean>>({ '16:9': true, '9:16': true, '1:1': false });
  const [pack, setPack] = useState<any>(null);
  const [genPack, setGenPack] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [savingAsset, setSavingAsset] = useState(false);

  async function generatePack() {
    setGenPack(true); setNotice(null); setPack(null);
    try {
      const formats = Object.entries(sFormats).filter(([, v]) => v).map(([k]) => k);
      const r = await fetch('/api/admin/marketing/ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ action: 'studio-pack', module: sModule, audience: sAudience, message: sMsg, cta: sCta, formats, lang: sLang }),
      });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Échec IA');
      setPack(j.pack || null);
      setNotice({ msg: '✓ Pack marketing généré (script, hooks, sous-titres, post, courriel, miniature).', ok: true });
    } catch (e: any) { setNotice({ msg: 'Erreur IA : ' + (e?.message || 'inconnue') + (String(e?.message || '').includes('web') ? '' : ''), ok: false }); }
    finally { setGenPack(false); }
  }
  async function translatePack() {
    if (!pack) return;
    const target = sLang === 'fr' ? 'en' : 'fr';
    setTranslating(true);
    try {
      const r = await fetch('/api/admin/marketing/ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ action: 'translate-pack', pack, target }),
      });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Échec');
      setPack(j.pack || pack); setSLang(target);
      setNotice({ msg: `✓ Pack traduit (${target.toUpperCase()}).`, ok: true });
    } catch (e: any) { setNotice({ msg: 'Traduction : ' + (e?.message || ''), ok: false }); }
    finally { setTranslating(false); }
  }
  async function saveAsset() {
    if (!pack) return;
    setSavingAsset(true);
    try {
      const r = await fetch('/api/admin/marketing/data', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ action: 'save-asset', kind: 'script', module: sModule, data: { ...pack, lang: sLang, audience: sAudience, cta: sCta } }),
      });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Échec');
      setNotice({ msg: '✓ Pack enregistré dans les actifs marketing.', ok: true });
    } catch (e: any) { setNotice({ msg: 'Erreur : ' + (e?.message || ''), ok: false }); }
    finally { setSavingAsset(false); }
  }
  function copyText(t: string) { try { navigator.clipboard?.writeText(t); setNotice({ msg: '✓ Copié.', ok: true }); } catch { /* */ } }

  // ── Prospection ────────────────────────────────────────────────────────
  const [segment, setSegment] = useState('Mutuelles SST');
  const [pModule, setPModule] = useState('Rapports terrain');
  const [angle, setAngle] = useState('');
  const [seuil, setSeuil] = useState(55);
  const [checks, setChecks] = useState({ c1: false, c2: false, c3: false, c4: false });
  const [emailDraft, setEmailDraft] = useState<any>(null);
  const [genEmail, setGenEmail] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const allChecks = checks.c1 && checks.c2 && checks.c3 && checks.c4;

  // Prospects RÉELS (base marketing_prospects via la route serveur). Aucune donnée de démo.
  type Row = { company: string; email: string; consent: 'expres' | 'tacite' | 'bloque'; score: number; blocked: boolean };
  const [rows, setRows] = useState<Row[]>([]);
  const [unsubCount, setUnsubCount] = useState(0);
  const [loadingProspects, setLoadingProspects] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [np, setNp] = useState({ company: '', email: '', segment: '', consent_type: 'express', consent_source: '', score: 60 });

  async function loadProspects() {
    setLoadingProspects(true);
    try {
      const j = await fetch('/api/admin/marketing/data?resource=prospects', { credentials: 'include' }).then(r => r.json());
      if (Array.isArray(j.prospects)) {
        setRows(j.prospects.map((p: any) => ({
          company: p.company || '—', email: p.email,
          consent: (p._blocked ? 'bloque' : p.consent_type === 'express' ? 'expres' : p.consent_type === 'tacit' ? 'tacite' : 'bloque') as Row['consent'],
          score: Number(p.score) || 0, blocked: !!p._blocked,
        })));
        setUnsubCount(Number(j.unsubscribes) || 0);
      }
    } catch { /* base indisponible -> liste vide */ }
    finally { setLoadingProspects(false); }
  }
  useEffect(() => { loadProspects(); }, []);

  const hasProspects = rows.length > 0;
  const aboveSeuil = rows.filter(p => !p.blocked && p.score >= seuil).length;

  // ── Recherche de prospection légale par IA (QC -> Canada) ──────────────
  const [researchRegion, setResearchRegion] = useState<'QC' | 'Canada'>('QC');
  const [researchSector, setResearchSector] = useState('Mutuelles de prévention SST');
  const [researching, setResearching] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [importing, setImporting] = useState(false);

  async function runResearch() {
    setResearching(true); setNotice(null); setCandidates([]);
    try {
      const r = await fetch('/api/admin/marketing/ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ action: 'research', region: researchRegion === 'Canada' ? 'Canada' : 'QC', sector: researchSector, count: 8 }),
      });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Échec recherche');
      const list = Array.isArray(j.candidates) ? j.candidates : [];
      setCandidates(list);
      setPicked(Object.fromEntries(list.map((c: any) => [String(c.email).toLowerCase(), true])));
      setNotice({ msg: list.length ? `✓ ${list.length} entreprises trouvées (adresses publiées vérifiables).` : 'Aucune adresse publiée vérifiable trouvée pour ce secteur/région.', ok: list.length > 0 });
    } catch (e: any) { setNotice({ msg: 'Recherche IA : ' + (e?.message || '') + ' (l\'outil de recherche web doit être activé sur la clé Anthropic).', ok: false }); }
    finally { setResearching(false); }
  }
  async function importSelected() {
    const chosen = candidates.filter(c => picked[String(c.email).toLowerCase()]);
    if (!chosen.length) { setNotice({ msg: 'Sélectionne au moins une entreprise.', ok: false }); return; }
    setImporting(true);
    try {
      const r = await fetch('/api/admin/marketing/data', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ action: 'import-candidates', candidates: chosen, segment: researchSector }),
      });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Échec import');
      setNotice({ msg: `✓ ${j.imported} prospect(s) importé(s) avec consentement tacite (source publiée conservée).`, ok: true });
      setCandidates([]); loadProspects();
    } catch (e: any) { setNotice({ msg: 'Erreur : ' + (e?.message || ''), ok: false }); }
    finally { setImporting(false); }
  }

  async function addProspect() {
    if (!np.email.trim()) { setNotice({ msg: 'Courriel requis.', ok: false }); return; }
    try {
      const r = await fetch('/api/admin/marketing/data', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ action: 'upsert-prospect', ...np }),
      });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Échec');
      setNotice({ msg: `✓ Prospect ${np.email} enregistré avec son consentement.`, ok: true });
      setNp({ company: '', email: '', segment: '', consent_type: 'express', consent_source: '', score: 60 });
      setAddOpen(false); loadProspects();
    } catch (e: any) { setNotice({ msg: 'Erreur : ' + (e?.message || ''), ok: false }); }
  }

  async function generateEmail() {
    setGenEmail(true); setNotice(null);
    try {
      const r = await fetch('/api/admin/marketing/ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ action: 'email', module: pModule, segment, angle }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Échec IA');
      setEmailDraft(j);
      setNotice({ msg: '✓ Courriel conforme LCAP généré par l\'IA.', ok: true });
    } catch (e: any) { setNotice({ msg: 'Erreur IA : ' + (e?.message || 'inconnue'), ok: false }); }
    finally { setGenEmail(false); }
  }
  async function scheduleCampaign() {
    if (!allChecks) { setNotice({ msg: '⚠ Le verrou de conformité bloque l\'envoi : active les 4 conditions.', ok: false }); return; }
    if (!emailDraft) { setNotice({ msg: '⚠ Génère d\'abord le courriel (IA) — c\'est lui qui sera envoyé.', ok: false }); return; }
    if (!hasProspects) { setNotice({ msg: '⚠ Aucun prospect en base. Ajoute (ou recherche via l\'IA) des prospects consentants avant d\'envoyer.', ok: false }); return; }
    if (!confirm(`Programmer et ENVOYER la campagne aux destinataires consentants au-dessus du seuil (${aboveSeuil}) ?`)) return;
    setScheduling(true); setNotice(null);
    try {
      const r = await fetch('/api/admin/marketing/data', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({
          action: 'save-campaign', module: pModule, segment, angle, min_score: seuil,
          sequence: [{ day: 0 }, { day: 4 }, { day: 9 }], content: emailDraft,
          compliance_ack: checks,
        }),
      });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Échec');
      const msg = j.mailConfigured
        ? `✓ Campagne programmée — ${j.sent} courriel(s) envoyé(s), ${j.queued} en file (sur ${j.recipients} éligibles).`
        : `✓ Campagne enregistrée — ${j.recipients} destinataires en file. ⚠ Envoi inactif : configure RESEND_API_KEY pour l'envoi réel.`;
      setNotice({ msg, ok: true });
      loadProspects();
    } catch (e: any) { setNotice({ msg: 'Erreur : ' + (e?.message || ''), ok: false }); }
    finally { setScheduling(false); }
  }

  const TABS: { k: View; ico: string; label: string }[] = [
    { k: 'studio', ico: '🎬', label: 'Studio vidéo' },
    { k: 'prospect', ico: '✉', label: 'Prospection' },
    { k: 'compliance', ico: '⚖', label: 'Conformité' },
  ];

  return (
    <div className="mktwrap">
      <header className="mkt-top">
        <div>
          <div className="eyebrow"><span className="live" /> Studio marketing · IA + conformité</div>
          <h1>Studio <span>marketing IA</span></h1>
          <p className="sub">Vidéos promo réalistes et prospection performante — l'IA rédige et monte ; le verrou de conformité décide ce qui peut partir.</p>
        </div>
        <div className="guard">
          <strong>◇ Verrou de conformité</strong> — Aucun envoi sans consentement prouvé. Aucune vidéo avec données client réelles.
          <span className="law">LCAP · Loi 25 · Loi sur la concurrence</span>
        </div>
      </header>

      <div className="mkt-tabs">
        {TABS.map(t => (
          <button key={t.k} className={`mkt-tab ${view === t.k ? 'active' : ''}`} onClick={() => setView(t.k)}>
            <span className="ico">{t.ico}</span> {t.label}
          </button>
        ))}
      </div>

      {notice && <div className={`mkt-notice ${notice.ok ? 'ok' : 'err'}`}>{notice.msg}</div>}

      {/* ================= STUDIO (1 brief -> N livrables) ================= */}
      {view === 'studio' && (
        <>
          <div className="card">
            <h2>Brief créatif <span className="chip">IA · multi-livrables</span></h2>
            <p className="hint">Un seul brief → l'IA produit un <b>pack complet</b> : accroches, storyboard adapté à chaque format, sous-titres, post LinkedIn, courriel de suivi et concept de miniature. Démo fictive crédible ; allégations chiffrées signalées si non sourcées.</p>
            <div className="row2">
              <div><label>Module</label><select value={sModule} onChange={e => setSModule(e.target.value)}>{MODULES.map(m => <option key={m}>{m}</option>)}</select></div>
              <div><label>Public cible</label><input value={sAudience} onChange={e => setSAudience(e.target.value)} placeholder="Ex. : responsables SST, chefs de maintenance…" /></div>
            </div>
            <label>Message clé (doit être démontrable à l'écran)</label>
            <textarea value={sMsg} onChange={e => setSMsg(e.target.value)} placeholder="Ex. : Un rapport d'inspection produit en scannant le QR de l'équipement, photos et résumé d'anomalies générés par l'IA." />
            <div className="row2">
              <div><label>Appel à l'action (CTA)</label><input value={sCta} onChange={e => setSCta(e.target.value)} /></div>
              <div><label>Langue</label><select value={sLang} onChange={e => setSLang(e.target.value as any)}><option value="fr">Français</option><option value="en">English</option></select></div>
            </div>
            <label>Formats à produire</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ALL_FORMATS.map(f => (
                <label key={f.k} className={`fmtchip ${sFormats[f.k] ? 'on' : ''}`}>
                  <input type="checkbox" checked={!!sFormats[f.k]} onChange={e => setSFormats(s => ({ ...s, [f.k]: e.target.checked }))} style={{ width: 'auto' }} /> {f.label}
                </label>
              ))}
            </div>
            <div className="actions">
              <button className="btn btn-violet" onClick={generatePack} disabled={genPack}>{genPack ? '✦ Génération du pack…' : '✦ Générer le pack marketing (IA)'}</button>
              {pack && <button className="btn btn-ghost" onClick={() => setPack(null)}>Vider</button>}
            </div>
          </div>

          {pack && (
            <>
              <div className="packbar">
                <span className="chip">Langue : {sLang.toUpperCase()}</span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn btn-ghost" onClick={translatePack} disabled={translating}>{translating ? 'Traduction…' : `🌐 Traduire en ${sLang === 'fr' ? 'EN' : 'FR'}`}</button>
                  <button className="btn btn-signal" onClick={saveAsset} disabled={savingAsset}>{savingAsset ? 'Enregistrement…' : '💾 Enregistrer dans les actifs'}</button>
                </div>
              </div>

              {Array.isArray(pack.warnings) && pack.warnings.length > 0 && (
                <div className="warnbox"><strong>⚠ Allégations à sourcer (Loi sur la concurrence)</strong><ul>{pack.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}</ul></div>
              )}

              <div className="grid">
                {/* Hooks */}
                {Array.isArray(pack.hooks) && (
                  <div className="card"><h2>Accroches <span className="chip">{pack.hooks.length}</span></h2>
                    {pack.hooks.map((h: string, i: number) => (
                      <div key={i} className="hookrow"><span>{h}</span><button className="copy" onClick={() => copyText(h)}>copier</button></div>
                    ))}
                  </div>
                )}
                {/* Sous-titres */}
                {pack.captions && (
                  <div className="card"><h2>Sous-titres <span className="chip">prêts</span></h2>
                    <pre className="ebody">{pack.captions}</pre>
                    <button className="btn btn-ghost" onClick={() => copyText(pack.captions)}>Copier les sous-titres</button>
                  </div>
                )}
              </div>

              {/* Storyboard */}
              {Array.isArray(pack.storyboard) && (
                <div className="card">
                  <h2>Storyboard <span className="chip">{pack.storyboard.reduce((s: number, x: any) => s + (Number(x.seconds) || 0), 0)} s</span></h2>
                  <div className="tablewrap"><table>
                    <thead><tr><th>#</th><th>Scène</th><th>s</th><th>Plan</th><th>Texte écran</th><th>Voix off</th></tr></thead>
                    <tbody>{pack.storyboard.map((sc: any, i: number) => (
                      <tr key={i}><td>{i + 1}</td><td>{sc.scene}</td><td>{sc.seconds}</td><td>{sc.shot}</td><td>{sc.onscreen_text}</td><td>{sc.voiceover}</td></tr>
                    ))}</tbody>
                  </table></div>
                </div>
              )}

              {/* Formats */}
              {Array.isArray(pack.formats) && pack.formats.length > 0 && (
                <div className="card"><h2>Déclinaisons par format <span className="chip">{pack.formats.length}</span></h2>
                  <div className="grid">{pack.formats.map((f: any, i: number) => (
                    <div key={i} className="fmtcard"><div className="fmttop"><b>{f.ratio}</b> · {f.platform} · {f.duration_s}s</div><div className="fmtnotes">{f.edit_notes}</div></div>
                  ))}</div>
                </div>
              )}

              {/* Publications prêtes à pousser — une version par plateforme */}
              {Array.isArray(pack.social_posts) && pack.social_posts.length > 0 && (
                <div className="card">
                  <h2>Publications par plateforme <span className="chip">copier &amp; pousser</span></h2>
                  <p className="hint">Chaque réseau a sa version adaptée (ton, longueur, hashtags). Copie celle que tu veux et publie-la.</p>
                  <div className="grid">
                    {pack.social_posts.map((sp: any, i: number) => {
                      const full = `${sp.caption}${Array.isArray(sp.hashtags) && sp.hashtags.length ? `\n\n${sp.hashtags.join(' ')}` : ''}`;
                      return (
                        <div key={i} className="platcard">
                          <div className="plathead"><b>{PLAT_ICON[sp.platform] || '◆'} {sp.platform}</b><button className="copy" onClick={() => copyText(full)}>copier</button></div>
                          <pre className="ebody">{sp.caption}</pre>
                          {Array.isArray(sp.hashtags) && sp.hashtags.length > 0 && <div className="tags-row">{sp.hashtags.map((t: string, j: number) => <span key={j} className="htag">{t}</span>)}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid">
                {/* Courriel de suivi -> interconnexion prospection */}
                {pack.follow_up_email && (
                  <div className="card"><h2>Courriel de suivi <span className="chip">→ prospection</span></h2>
                    <div className="er"><span>Objet</span><b>{pack.follow_up_email.subject}</b></div>
                    <pre className="ebody">{pack.follow_up_email.body}</pre>
                    <div className="actions">
                      <button className="btn btn-ghost" onClick={() => copyText(`${pack.follow_up_email.subject}\n\n${pack.follow_up_email.body}`)}>Copier</button>
                      <button className="btn btn-violet" onClick={() => {
                        setEmailDraft({ subjectA: pack.follow_up_email.subject, subjectB: pack.follow_up_email.subject, body: pack.follow_up_email.body, footer: 'C-Secur360 · [Adresse postale C-Secur360] · [Lien de désabonnement]', compliance: ['Vérifier le consentement avant envoi (LCAP).'] });
                        setView('prospect');
                        setNotice({ msg: '✓ Courriel chargé dans Prospection — vérifie le consentement avant d\'envoyer.', ok: true });
                      }}>↗ Utiliser dans Prospection</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Miniature */}
              {pack.thumbnail && (
                <div className="card"><h2>Concept de miniature</h2><p className="hint" style={{ marginBottom: 0 }}>{pack.thumbnail}</p></div>
              )}

              <div className="note">Production : le pack (script, sous-titres, posts, courriel) est prêt à l'emploi. Le rendu vidéo final (capture compte démo + voix + montage) se fait avec ton outil de montage à partir de ce storyboard.</div>
            </>
          )}
        </>
      )}

      {/* ================= PROSPECTION ================= */}
      {view === 'prospect' && (
        <>
          <div className="kpis">
            <Kpi n={String(rows.length)} l="Prospects en base" />
            <Kpi n={String(rows.filter(p => !p.blocked).length)} l="Éligibles à l'envoi" c="var(--signal)" />
            <Kpi n={String(aboveSeuil)} l="Au-dessus du seuil" c="var(--violet)" />
            <Kpi n={String(unsubCount)} l="Bloqués / désab." c="var(--rust)" />
          </div>

          {/* Recherche de prospection LÉGALE par IA (QC -> Canada) */}
          <div className="card" style={{ marginBottom: 16 }}>
            <h2>Recherche de prospects <span className="chip">IA · web</span></h2>
            <p className="hint">L'IA cherche sur le web des entreprises pertinentes et ne retient que les <b>adresses d'affaires publiées publiquement</b> (base du consentement tacite CASL), avec l'<b>URL source</b> comme preuve. Aucune adresse devinée, aucun scraping.</p>
            <div className="row3" style={{ display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: 11, alignItems: 'end' }}>
              <div><label>Région</label>
                <select value={researchRegion} onChange={e => setResearchRegion(e.target.value as any)}>
                  <option value="QC">Québec</option>
                  <option value="Canada">Canada</option>
                </select>
              </div>
              <div><label>Secteur ciblé</label><input value={researchSector} onChange={e => setResearchSector(e.target.value)} placeholder="Ex. : mutuelles SST, location d'équipement, manufacturiers MT…" /></div>
              <button className="btn btn-violet" onClick={runResearch} disabled={researching}>{researching ? '✦ Recherche…' : '✦ Rechercher (IA)'}</button>
            </div>

            {candidates.length > 0 && (
              <div className="candbox">
                <div className="candhead">
                  <span>{candidates.length} entreprises — adresses publiées vérifiables</span>
                  <button className="btn btn-signal" style={{ padding: '7px 12px' }} onClick={importSelected} disabled={importing}>{importing ? 'Import…' : '↧ Importer les sélectionnées (consentement tacite)'}</button>
                </div>
                {candidates.map((c, i) => {
                  const key = String(c.email).toLowerCase();
                  return (
                    <label key={i} className="cand">
                      <input type="checkbox" checked={!!picked[key]} onChange={e => setPicked(p => ({ ...p, [key]: e.target.checked }))} />
                      <div className="candinfo">
                        <div className="candc">{c.company} <span className="candcity">{c.city ? `· ${c.city}` : ''} · {c.region || researchRegion}</span></div>
                        <div className="mono candmail">{c.email}</div>
                        {c.relevance && <div className="candrel">{c.relevance}</div>}
                        {c.source_url && <a className="candsrc" href={c.source_url} target="_blank" rel="noreferrer">⚖ source publiée</a>}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          <div className="grid">
            <div className="card">
              <h2>Campagne <span className="chip">module + angle</span></h2>
              <p className="hint">« Recherche » = enrichir des fiches <b>déjà consentantes</b>, jamais scraper au hasard.</p>
              <div className="row2">
                <div><label>Module promu</label><select value={pModule} onChange={e => setPModule(e.target.value)}><option>Rapports terrain</option><option>DGA transformateurs</option><option>Espaces clos</option></select></div>
                <div><label>Segment</label><select value={segment} onChange={e => setSegment(e.target.value)}><option>Mutuelles SST</option><option>Location équipement</option><option>Manufacturiers MT</option></select></div>
              </div>
              <label>Angle d'accroche</label>
              <textarea value={angle} onChange={e => setAngle(e.target.value)} placeholder="Ex. : Réduire le temps de production des rapports terrain grâce au workflow QR + IA." />
              <label>Seuil de score minimum pour l'envoi : <b style={{ color: 'var(--reel)' }}>{seuil}</b></label>
              <input type="range" min={0} max={90} step={5} value={seuil} onChange={e => setSeuil(+e.target.value)} style={{ accentColor: 'var(--reel)' }} />

              <div className="gate">
                <div className="gate-title">⚠ Verrou de conformité — requis pour activer l'envoi</div>
                {[
                  ['c1', 'Consentement valide vérifié par destinataire', 'Exprès, ou tacite < 24 mois'],
                  ['c2', 'Désabonnés & plaintes exclus', 'Synchro temps réel'],
                  ['c3', 'Identité + adresse + désabonnement injectés', 'Dans chaque courriel (LCAP)'],
                  ['c4', 'Validation humaine de la 1re campagne du segment', 'Tu approuves avant automatisation'],
                ].map(([k, t, s]) => (
                  <label key={k} className="check">
                    <input type="checkbox" checked={(checks as any)[k]} onChange={e => setChecks(c => ({ ...c, [k]: e.target.checked }))} />
                    <span>{t}<small>{s}</small></span>
                  </label>
                ))}
              </div>
              <div className="actions">
                <button className="btn btn-violet" onClick={generateEmail} disabled={genEmail}>{genEmail ? '✦ Génération…' : '✦ Générer le courriel (IA)'}</button>
                <button className="btn btn-signal" onClick={scheduleCampaign} disabled={!allChecks || scheduling} title={allChecks ? '' : 'Active les 4 conditions de conformité'}>{scheduling ? '▶ Envoi…' : '▶ Programmer & envoyer'}</button>
              </div>

              {emailDraft && (
                <div className="emailbox">
                  <div className="er"><span>Objet A</span><b>{emailDraft.subjectA}</b></div>
                  <div className="er"><span>Objet B</span><b>{emailDraft.subjectB}</b></div>
                  <pre className="ebody">{emailDraft.body}</pre>
                  <div className="efoot">{emailDraft.footer}</div>
                  {Array.isArray(emailDraft.compliance) && emailDraft.compliance.length > 0 && (
                    <ul className="ecomp">{emailDraft.compliance.map((c: string, i: number) => <li key={i}>⚖ {c}</li>)}</ul>
                  )}
                </div>
              )}
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <h2>File de prospects <span className="chip">base réelle</span></h2>
                <button className="btn btn-ghost" style={{ padding: '6px 11px' }} onClick={() => setAddOpen(o => !o)}>＋ Prospect</button>
              </div>
              <p className="hint">Score d'intérêt par prospect. Sous le seuil, bloqué ou désabonné = exclu automatiquement.</p>

              {addOpen && (
                <div className="addbox">
                  <div className="row2">
                    <div><label>Entreprise</label><input value={np.company} onChange={e => setNp(s => ({ ...s, company: e.target.value }))} /></div>
                    <div><label>Courriel *</label><input value={np.email} onChange={e => setNp(s => ({ ...s, email: e.target.value }))} /></div>
                  </div>
                  <div className="row2">
                    <div><label>Type de consentement</label>
                      <select value={np.consent_type} onChange={e => setNp(s => ({ ...s, consent_type: e.target.value }))}>
                        <option value="express">Exprès (opt-in)</option>
                        <option value="tacit">Tacite (relation &lt; 24 mois)</option>
                        <option value="none">Aucun (jamais d'envoi)</option>
                      </select>
                    </div>
                    <div><label>Source du consentement</label><input value={np.consent_source} onChange={e => setNp(s => ({ ...s, consent_source: e.target.value }))} placeholder="formulaire, salon, relation d'affaires…" /></div>
                  </div>
                  <div className="row2">
                    <div><label>Segment</label><input value={np.segment} onChange={e => setNp(s => ({ ...s, segment: e.target.value }))} /></div>
                    <div><label>Score ({np.score})</label><input type="range" min={0} max={100} value={np.score} onChange={e => setNp(s => ({ ...s, score: +e.target.value }))} /></div>
                  </div>
                  <div className="actions"><button className="btn btn-violet" onClick={addProspect}>Enregistrer le prospect</button></div>
                </div>
              )}

              <div className="tablewrap">
                <table>
                  <thead><tr><th>Entreprise</th><th>Courriel</th><th>Consent.</th><th>Score</th><th>Statut</th></tr></thead>
                  <tbody>
                    {rows.length === 0 && (
                      <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--steel)', padding: '22px 8px' }}>
                        {loadingProspects ? 'Chargement…' : 'Aucun prospect en base. Ajoute-en un, ou lance la recherche IA ci-dessous.'}
                      </td></tr>
                    )}
                    {rows.map((p, i) => {
                      const under = !p.blocked && p.score < seuil; const elig = !p.blocked && !under;
                      return (
                        <tr key={i}>
                          <td>{p.company}</td><td className="mono">{p.email}</td>
                          <td><span className={`tag ${p.consent}`}>{CLBL[p.consent]}</span></td>
                          <td>{p.blocked ? <span style={{ color: 'var(--rust)' }}>—</span> : <span className="scoredot" style={{ background: p.score >= 70 ? 'var(--signal)' : p.score >= 45 ? 'var(--amber)' : 'var(--rust)' }}>{p.score}</span>}</td>
                          <td style={{ color: elig ? 'var(--signal)' : 'var(--rust)' }}>{p.blocked ? 'Bloqué/désab.' : under ? 'Sous seuil' : 'Éligible'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="note">Base réelle protégée (Loi 25, RLS). Chaque envoi fige un <b>instantané de consentement</b> (horodatage, type, source), conservé comme preuve (CRTC / Commission d'accès à l'information).</div>
            </div>
          </div>
        </>
      )}

      {/* ================= CONFORMITÉ ================= */}
      {view === 'compliance' && (
        <>
          <div className="grid">
            <LawCard title="✉ Prospection courriel" tag="LCAP / CASL" rules={[
              ['!', 'Consentement par destinataire', 'Exprès (opt-in) ou tacite (relation < 24 mois, ou adresse publiée sans mention « pas de sollicitation »).'],
              ['!', 'Identité + adresse physique', 'Nom et adresse postale valides dans chaque courriel.'],
              ['!', 'Désabonnement fonctionnel', 'Lien clair, traité sous 10 jours ouvrables.'],
              ['✓', 'Registre de preuve', 'Source et date de consentement conservées. Amendes jusqu\'à 10 M$ par violation.'],
            ]} />
            <LawCard title="🛡 Données personnelles" tag="Loi 25 — QC" rules={[
              ['!', 'Courriel nominatif = renseignement personnel', 'marc.tremblay@… est protégé ; info@… reste encadré.'],
              ['!', 'Finalité documentée', 'Pouvoir dire d\'où vient chaque contact et pourquoi.'],
              ['✓', 'Politique de confidentialité + responsable (PRP)', 'Publiée, accessible, responsable désigné.'],
              ['✓', 'Droit d\'accès et de retrait', 'Consultation et suppression sur demande.'],
            ]} />
            <LawCard title="🎬 Vidéos promo" tag="Concurrence / LPC" rules={[
              ['!', 'Pas de données client réelles à l\'écran', 'Compte démo à données fictives. Une vraie capture = fuite de renseignements.'],
              ['!', 'Allégations démontrables', '« −70 % de temps » doit reposer sur une mesure réelle.'],
              ['✓', 'Autorisation pour témoignage', 'Un témoignage client exige son accord écrit.'],
            ]} />
            <LawCard title="🤖 Agent autonome" tag="bonnes pratiques" rules={[
              ['!', 'Validation humaine au départ', 'L\'IA prépare ; tu approuves la 1re campagne de chaque segment.'],
              ['!', 'Pas de scraping aveugle', 'Enrichir des fiches légitimes, jamais collecter sans base de consentement.'],
              ['✓', 'Cadence + warm-up', 'Envoi étalé pour la délivrabilité et sous les seuils de plainte.'],
            ]} />
          </div>
          <div className="note">Guide opérationnel, pas un avis juridique. Pour une campagne d'envergure, fais valider ton processus de consentement par un conseiller juridique au fait de la LCAP et de la Loi 25.</div>
        </>
      )}

      <style jsx>{`
        .mktwrap{--bg:#0a0e14;--panel:#11161f;--panel2:#161d28;--line:#232c3a;--steel:#5b7185;--mist:#8b9bad;--paper:#eef2f6;--reel:#ff7a45;--signal:#2ee6a6;--signal-dim:#1c8c66;--violet:#7c8cff;--amber:#f5b945;--rust:#ff6b5e;
          background:radial-gradient(1100px 560px at 82% -12%,rgba(255,122,69,.06),transparent 60%),var(--bg);color:var(--paper);border-radius:16px;padding:22px;font-family:Inter,system-ui,sans-serif;line-height:1.5;}
        .mkt-top{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-bottom:18px;}
        .eyebrow{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--mist);display:flex;align-items:center;gap:9px;}
        .live{width:9px;height:9px;border-radius:50%;background:var(--signal);box-shadow:0 0 0 0 rgba(46,230,166,.6);}
        h1{font-size:26px;font-weight:700;letter-spacing:-.02em;margin-top:5px;} h1 span{color:var(--reel);}
        .sub{color:var(--mist);font-size:13px;margin-top:6px;max-width:560px;}
        .guard{border:1px solid var(--signal-dim);background:rgba(46,230,166,.07);border-radius:10px;padding:11px 15px;font-size:12px;max-width:270px;}
        .guard strong{color:var(--signal);} .guard .law{font-size:10px;color:var(--mist);display:block;margin-top:4px;}
        .mkt-tabs{display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap;}
        .mkt-tab{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:10px;border:1px solid var(--line);background:var(--panel);color:var(--mist);font-weight:600;font-size:14px;cursor:pointer;}
        .mkt-tab:hover{color:var(--paper);} .mkt-tab.active{background:rgba(255,122,69,.12);color:var(--paper);border-color:var(--reel);}
        .mkt-notice{margin-bottom:14px;border-radius:10px;padding:10px 14px;font-size:13px;font-weight:500;}
        .mkt-notice.ok{background:rgba(46,230,166,.1);border:1px solid var(--signal-dim);color:var(--signal);}
        .mkt-notice.err{background:rgba(255,107,94,.1);border:1px solid var(--rust);color:var(--rust);}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
        @media(max-width:880px){.grid{grid-template-columns:1fr;}}
        .card{background:var(--panel);border:1px solid var(--line);border-radius:13px;padding:18px;}
        .card h2{font-size:15px;font-weight:600;display:flex;align-items:center;gap:9px;margin-bottom:3px;}
        .card .hint{font-size:12px;color:var(--mist);margin-bottom:12px;}
        .chip{font-size:10px;padding:2px 8px;border-radius:5px;border:1px solid var(--line);color:var(--mist);}
        label{display:block;font-size:11.5px;color:var(--mist);margin:11px 0 5px;font-weight:500;}
        :global(.mktwrap) input,:global(.mktwrap) select,:global(.mktwrap) textarea{width:100%;background:var(--bg);border:1px solid var(--line);color:var(--paper);border-radius:8px;padding:9px 11px;font-size:13px;font-family:inherit;}
        textarea{resize:vertical;min-height:64px;}
        .row2{display:grid;grid-template-columns:1fr 1fr;gap:11px;}
        .togs{margin-top:13px;border-top:1px solid rgba(35,44,58,.5);}
        .actions{margin-top:14px;display:flex;gap:10px;flex-wrap:wrap;}
        .btn{border:none;border-radius:8px;padding:10px 15px;font-size:13px;font-weight:600;cursor:pointer;display:inline-flex;align-items:center;gap:7px;}
        .btn:disabled{opacity:.5;cursor:not-allowed;}
        .btn-reel{background:var(--reel);color:#2a1006;} .btn-violet{background:var(--violet);color:#0a1030;}
        .btn-signal{background:var(--signal);color:#04241a;} .btn-ghost{background:transparent;border:1px solid var(--line);color:var(--paper);}
        .warnbox{margin-top:13px;border:1px solid var(--amber);background:rgba(245,185,69,.08);border-radius:9px;padding:10px 13px;font-size:12px;color:var(--amber);}
        .warnbox ul{margin:6px 0 0 16px;color:var(--paper);}
        .ruler{display:flex;height:20px;border:1px solid var(--line);border-radius:7px 7px 0 0;border-bottom:none;background:var(--panel2);align-items:center;padding:0 10px;justify-content:space-between;font-size:10px;color:var(--steel);margin-top:16px;}
        .track{border:1px solid var(--line);border-radius:0 0 7px 7px;background:var(--panel2);padding:10px;display:flex;gap:8px;overflow-x:auto;min-height:92px;}
        .track-empty{color:var(--steel);font-size:12px;align-self:center;padding:0 8px;}
        .clip{flex:0 0 auto;border-radius:8px;border:1px solid var(--line);background:linear-gradient(180deg,var(--panel2),var(--panel));padding:9px 10px;cursor:pointer;text-align:left;color:var(--paper);}
        .clip.sel{border-color:var(--reel);box-shadow:0 0 0 1px var(--reel);}
        .clip .num{font-size:9px;color:var(--steel);} .clip .cttl{font-size:12px;font-weight:600;margin:3px 0;} .clip .cfx{font-size:9.5px;color:var(--violet);} .clip .cdur{font-size:10px;color:var(--reel);margin-top:4px;}
        .vstage{background:var(--bg);border:1px solid var(--line);border-radius:10px;min-height:140px;display:grid;place-items:center;padding:14px;}
        .vmock{width:100%;min-height:110px;border-radius:8px;background:linear-gradient(180deg,var(--panel2),var(--panel));border:1px solid var(--line);position:relative;padding:10px;}
        .vmock.muted{display:grid;place-items:center;color:var(--steel);font-size:12px;}
        .vscene{font-size:10px;color:var(--mist);} .vsub{position:absolute;bottom:10px;left:10px;right:10px;background:rgba(0,0,0,.6);border-radius:6px;padding:6px 9px;font-size:12px;}
        .pipeline{margin-top:14px;display:flex;flex-direction:column;gap:7px;}
        .stage{display:flex;align-items:center;gap:10px;border:1px solid var(--line);border-radius:9px;padding:8px 11px;background:var(--panel2);}
        .sico{width:26px;height:26px;border-radius:7px;background:rgba(124,140,255,.15);color:var(--violet);display:grid;place-items:center;font-size:14px;}
        .snm{font-size:12.5px;font-weight:600;} .stool{font-size:10.5px;color:var(--mist);}
        .progress{margin-top:12px;height:7px;border-radius:5px;background:var(--panel2);overflow:hidden;} .progress i{display:block;height:100%;background:var(--reel);transition:width .1s;}
        .progmeta{display:flex;justify-content:space-between;font-size:11px;color:var(--mist);margin-top:5px;}
        .note{margin-top:14px;font-size:11px;color:var(--steel);line-height:1.5;border-left:2px solid var(--line);padding-left:10px;}
        .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:11px;margin-bottom:16px;}
        @media(max-width:680px){.kpis{grid-template-columns:1fr 1fr;}}
        .kpi{background:var(--panel);border:1px solid var(--line);border-radius:11px;padding:13px 15px;} .kpi .n{font-size:24px;font-weight:700;} .kpi .l{font-size:11px;color:var(--mist);margin-top:2px;}
        .addbox{margin:6px 0 12px;border:1px solid var(--line);background:var(--panel2);border-radius:10px;padding:12px;}
        .fmtchip{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);background:var(--bg);border-radius:8px;padding:7px 11px;font-size:12px;color:var(--mist);cursor:pointer;}
        .fmtchip.on{border-color:var(--reel);color:var(--paper);background:rgba(255,122,69,.08);}
        .packbar{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:14px 0;padding:10px 14px;border:1px solid var(--line);border-radius:10px;background:var(--panel);}
        .hookrow{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px solid rgba(35,44,58,.5);font-size:13px;}
        .hookrow:last-child{border-bottom:none;}
        .copy{background:none;border:1px solid var(--line);color:var(--mist);border-radius:6px;padding:3px 9px;font-size:11px;cursor:pointer;flex:0 0 auto;}
        .copy:hover{color:var(--paper);border-color:var(--steel);}
        .fmtcard{border:1px solid var(--line);border-radius:9px;background:var(--panel2);padding:11px;}
        .fmttop{font-size:12.5px;margin-bottom:5px;} .fmtnotes{font-size:11.5px;color:var(--mist);}
        .tags-row{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0;} .htag{font-size:11px;color:var(--violet);background:rgba(124,140,255,.1);border-radius:5px;padding:1px 7px;}
        .platcard{border:1px solid var(--line);border-radius:10px;background:var(--panel2);padding:12px;}
        .plathead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;font-size:13px;}
        .candbox{margin-top:14px;border:1px solid var(--line);border-radius:10px;background:var(--panel2);overflow:hidden;}
        .candhead{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-bottom:1px solid var(--line);font-size:12px;color:var(--mist);flex-wrap:wrap;}
        .cand{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-bottom:1px solid rgba(35,44,58,.5);cursor:pointer;}
        .cand:last-child{border-bottom:none;} .cand input{width:auto;margin-top:3px;}
        .candinfo{min-width:0;} .candc{font-size:13px;font-weight:600;} .candcity{color:var(--mist);font-weight:400;font-size:11px;}
        .candmail{font-size:12px;color:var(--signal);margin:2px 0;} .candrel{font-size:11px;color:var(--mist);}
        .candsrc{font-size:11px;color:var(--violet);text-decoration:none;}
        .gate{margin-top:14px;border:1px solid var(--amber);background:rgba(245,185,69,.06);border-radius:10px;padding:12px;}
        .gate-title{font-size:12px;font-weight:600;color:var(--amber);margin-bottom:8px;}
        .check{display:flex;gap:9px;align-items:flex-start;padding:6px 0;font-size:12.5px;color:var(--paper);cursor:pointer;}
        .check input{width:auto;margin-top:2px;} .check small{display:block;color:var(--mist);font-size:10.5px;}
        .emailbox{margin-top:14px;border:1px solid var(--line);border-radius:10px;background:var(--panel2);padding:12px;font-size:12.5px;}
        .er{display:flex;gap:8px;margin-bottom:5px;} .er span{color:var(--mist);min-width:54px;font-size:11px;}
        .ebody{white-space:pre-wrap;background:var(--bg);border:1px solid var(--line);border-radius:7px;padding:10px;margin:8px 0;font-family:inherit;font-size:12.5px;color:var(--paper);}
        .efoot{font-size:11px;color:var(--mist);border-top:1px solid var(--line);padding-top:8px;}
        .ecomp{margin:8px 0 0 0;list-style:none;font-size:11px;color:var(--signal);} .ecomp li{margin-top:3px;}
        .tablewrap{overflow-x:auto;} table{width:100%;border-collapse:collapse;font-size:12px;}
        th{text-align:left;color:var(--mist);font-weight:600;font-size:10.5px;padding:6px 8px;border-bottom:1px solid var(--line);}
        td{padding:8px;border-bottom:1px solid rgba(35,44,58,.5);} .mono{font-size:11px;color:var(--mist);}
        .tag{font-size:10px;padding:2px 7px;border-radius:5px;} .tag.expres{background:rgba(46,230,166,.15);color:var(--signal);} .tag.tacite{background:rgba(245,185,69,.15);color:var(--amber);} .tag.bloque{background:rgba(255,107,94,.15);color:var(--rust);}
        .scoredot{display:inline-block;min-width:26px;text-align:center;border-radius:5px;padding:1px 6px;font-weight:700;font-size:11px;color:#04241a;}
        .law-card{background:var(--panel);border:1px solid var(--line);border-radius:13px;padding:16px;}
        .law-card h3{font-size:14px;font-weight:600;display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;}
        .tagx{font-size:10px;color:var(--mist);border:1px solid var(--line);border-radius:5px;padding:2px 7px;}
        .rule{display:flex;gap:10px;align-items:flex-start;padding:7px 0;border-top:1px solid rgba(35,44,58,.5);}
        .mk{width:18px;height:18px;border-radius:5px;display:grid;place-items:center;font-size:11px;font-weight:700;flex:0 0 auto;}
        .mk.req{background:rgba(255,107,94,.15);color:var(--rust);} .mk.ok{background:rgba(46,230,166,.15);color:var(--signal);}
        .rule b{font-size:12.5px;} .rule small{display:block;color:var(--mist);font-size:11px;margin-top:2px;}
      `}</style>
    </div>
  );
}

function Kpi({ n, l, c }: { n: string; l: string; c?: string }) {
  return <div className="kpi"><div className="n" style={{ color: c || 'var(--paper)' }}>{n}</div><div className="l">{l}</div></div>;
}
function LawCard({ title, tag, rules }: { title: string; tag: string; rules: string[][] }) {
  return (
    <div className="law-card">
      <h3>{title} <span className="tagx">{tag}</span></h3>
      {rules.map((r, i) => (
        <div className="rule" key={i}><div className={`mk ${r[0] === '✓' ? 'ok' : 'req'}`}>{r[0]}</div><div><b>{r[1]}</b><small>{r[2]}</small></div></div>
      ))}
    </div>
  );
}
