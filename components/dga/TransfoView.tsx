'use client';

// ============================================================================
// FICHE TRANSFORMATEUR — port fidèle de TransfoView (dga-oil-app.jsx ~l.1229).
// Reproduit : en-tête + condition globale, sélecteur de prélèvement, bannière de
// tendance, grille 2 colonnes (graphe d'évolution recharts + tableaux IEEE/huile/
// furanes Δ% + historique EN COLONNES) | (Duval + Rogers + DP + interprétations +
// prochaine analyse/intervalle + suivi ciblé/complet + catalogue + photos + reco/IA).
// Données Supabase ; IA serveur (/api/dga/analyze) ; shell commun (jour/nuit, FR/EN) conservé.
// ============================================================================
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { getPhotos, savePhotos, getAnomalies, saveAnomalies, getDocs, saveDocs, getInspections, saveInspections, EQUIP_GROUPS, EQUIP_FIELDS, type Dossier, type Measure, type Anomaly, type DgaDoc, type Inspection } from '@/lib/dga/dossiers';
import {
  GAS_FIELDS, COMBUSTIBLE, IEEE_ROWS, OIL_FIELDS, FURAN_FIELDS, gl, fl,
  ieeeCondition, worstCondition, rogersRatios, COND_LABELS, COND_COLORS, numOrNull, pcbStatus, latestPcb, lastGasMeasure, type Lang,
} from '@/lib/dga/fields';
import { duvalPct, duvalZone, ZONE_COLORS } from '@/lib/dga/duval';
import { evalOil, furanInterpret, trendAnalysis, voltageClass } from '@/lib/dga/oil';
import { generationRates, computeHealthIndex, overThreshold, transformerType, type GasRate } from '@/lib/dga/severity2019';
import { interpret, globalAnalysis } from '@/lib/dga/interpret';
import {
  ANALYSIS_CATALOG, ANALYSIS_GROUPS, INTERVAL_OPTIONS, al, addInterval, addMonths, addDays, autoNextDate, dueStatusByDate,
} from '@/lib/dga/catalog';
import { EntitySearch } from '@/components/ui/EntitySearch';
import { getEquipmentList, saveMaintAction } from '@/lib/maintenance';
import { DuvalTriangle } from '@/components/dga/DuvalTriangle';
import { AnomalySection } from '@/components/dga/AnomalySection';
import { InspectionSection } from '@/components/dga/InspectionSection';
import { DocsSection } from '@/components/dga/DocsSection';
import { PrintReport } from '@/components/dga/PrintReport';
import { getSitesTree, siteLabel, type SiteNode } from '@/lib/sites';

const CARD = 'rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800';
const H2 = 'mb-2 text-sm font-bold text-gray-900 dark:text-gray-100';
const BTN_DARK = 'inline-flex items-center gap-1 rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600';
const BTN_PRIMARY = 'inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50';
const BTN_GHOST = 'inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200';
const INP = 'w-full rounded-lg border border-gray-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-rose-500 dark:border-gray-600';

const arrow = (tt: number | null) => (tt == null ? '—' : (tt > 0 ? '▲' : tt < 0 ? '▼' : '') + ' ' + Math.abs(tt).toFixed(0) + '%');
const arrowColor = (tt: number | null) => (tt == null ? 'text-gray-400' : tt > 0 ? 'text-red-600' : tt < 0 ? 'text-emerald-600' : 'text-gray-500');

// Compression d'image avant stockage (max ~1000px, JPEG 0.7) — repris du prototype.
function compressImage(file: File, maxDim = 1000, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxDim || h > maxDim) { const r = Math.min(maxDim / w, maxDim / h); w = Math.round(w * r); h = Math.round(h * r); }
        const c = document.createElement('canvas'); c.width = w; c.height = h;
        c.getContext('2d')!.drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject; img.src = reader.result as string;
    };
    reader.onerror = reject; reader.readAsDataURL(file);
  });
}

export function TransfoView(props: {
  tenant: string; tenantName?: string; siteText?: string; lang: Lang; tr: (fr: string, en: string) => string;
  dossier: Dossier; measures: Measure[]; logoUrl: string | null; allDossiers?: Dossier[];
  onSave: (d: Dossier) => Promise<void> | void;            // enregistre le dossier (équipement + extra)
  onNewMeasure: () => void; onEditMeasure?: (m: Measure) => void; onDeleteMeasure: (id?: string) => void; onDeleteDossier: () => void;
  setNotice: (s: string | null) => void;
}) {
  const { tenant, tenantName, siteText, lang, tr, dossier, measures, logoUrl, allDossiers = [], onSave, onNewMeasure, onEditMeasure, onDeleteMeasure, onDeleteDossier, setNotice } = props;
  const extra = dossier.extra || {};

  const data = measures; // déjà triées asc par date
  const [selIdx, setSelIdx] = useState(Math.max(0, data.length - 1));
  const [visible, setVisible] = useState<Record<string, boolean>>(() => COMBUSTIBLE.reduce((a, k) => ({ ...a, [k]: true }), {}));
  const [showExport, setShowExport] = useState(false);
  const [pages, setPages] = useState({ titlePage: true, cover: true, results: true, analysis: true, trends: true, coverChart: true, photos: false, anomalies: false, inspections: false });
  const [globalNote, setGlobalNote] = useState('');
  const [projectNo, setProjectNo] = useState(extra.project_no || '');
  // Interconnexion DGA → maintenance : registre d'équipement pour lier le transfo (extra.equipment_id).
  const [equipOpts, setEquipOpts] = useState<{ id: string; label: string; sub?: string }[]>([]);
  const [eqText, setEqText] = useState(extra.equipment_name || '');
  useEffect(() => { if (!tenant) return; getEquipmentList(tenant).then(list => setEquipOpts((list || []).map(e => ({ id: e.id, label: e.equipment_name || e.equipment_serial || e.equipment_type || 'Équipement', sub: e.equipment_serial || undefined }))), () => {}); }, [tenant]);
  const [recoDraft, setRecoDraft] = useState(extra.manual_reco || '');
  const [dateDraft, setDateDraft] = useState(extra.next_date_manual || '');
  const [aiBusy, setAiBusy] = useState(false);
  const [autoTrans, setAutoTrans] = useState(false); // mode traduction auto FR<->EN du texte IA
  const [photos, setPhotos] = useState<{ id: string; data: string; name?: string }[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [docs, setDocs] = useState<DgaDoc[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState<Dossier>(dossier);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => { setSelIdx(Math.max(0, data.length - 1)); }, [data.length]);
  useEffect(() => {
    setForm(dossier); setDateDraft(extra.next_date_manual || ''); setProjectNo(extra.project_no || '');
    setRecoDraft(extra['manual_reco_' + lang] ?? extra.manual_reco ?? '');
    if (dossier.id) { getPhotos(dossier.id).then(setPhotos); getAnomalies(dossier.id).then(setAnomalies); getDocs(dossier.id).then(setDocs); getInspections(dossier.id).then(setInspections); } else { setPhotos([]); setAnomalies([]); setDocs([]); setInspections([]); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dossier.id]);
  const updateDocs = (next: DgaDoc[]) => {
    setDocs(next);
    if (dossier.id) saveDocs(dossier.id, next).then(r => { if (r.error) setNotice(tr('Documents non sauvegardés (migration 122 « docs » manquante ?) : ', 'Documents not saved (missing migration 122 "docs"?): ') + r.error); });
  };
  // La reco IA est stockée par langue (manual_reco_fr/en) -> on rafraîchit le texte affiché au changement de langue.
  useEffect(() => {
    const ex = dossier.extra || {};
    setRecoDraft(ex['manual_reco_' + lang] ?? ex.manual_reco ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);
  const updateAnomalies = (next: Anomaly[]) => {
    setAnomalies(next);
    if (dossier.id) saveAnomalies(dossier.id, next).then(r => { if (r.error) setNotice(tr('Anomalies non sauvegardées (migration 121 « anomalies » manquante ?) : ', 'Anomalies not saved (missing migration 121 "anomalies"?): ') + r.error); });
  };
  const updateInspections = (next: Inspection[]) => {
    setInspections(next);
    if (dossier.id) saveInspections(dossier.id, next).then(r => { if (r.error) setNotice(tr('Inspections non sauvegardées (migration 123 « inspections » manquante ?) : ', 'Inspections not saved (missing migration 123 "inspections"?): ') + r.error); });
  };
  // Anomalies issues d'une inspection -> ajoutées à la section Anomalies.
  const addAnomaliesFromInspection = (created: Anomaly[]) => { if (created.length) updateAnomalies([...anomalies, ...created]); };
  // Séquence de reprise (rappel) -> stockée dans extra (flaggée au dashboard) : prochaine échéance + fréquence.
  const setInspectionReminder = (nextDate: string | null, intervalId?: string) =>
    updateExtra({ next_inspection: nextDate, ...(intervalId != null ? { insp_interval_id: intervalId } : {}) });
  // Note globale par défaut (recalculée ici pour rester AVANT tout retour anticipé — règles des hooks).
  useEffect(() => {
    if (!data.length) { setGlobalNote(''); return; }
    const c = data[selIdx] || data[data.length - 1];
    const z = duvalZone(duvalPct({ ch4: +(c.ch4 || 0), c2h4: +(c.c2h4 || 0), c2h2: +(c.c2h2 || 0) }), lang);
    const oe = evalOil(c.oil_quality || {}, dossier.kv, lang);
    const f2 = numOrNull(c.oil_quality?.f_2fal);
    const fu = furanInterpret(f2 != null ? f2 / 1000 : null, lang);
    setGlobalNote(globalAnalysis(c as any, oe, fu, worstCondition(c), lang).main);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selIdx, lang, data, dossier.kv]);

  // Sauvegardes (définies avant tout retour anticipé) ───────────────────────
  const updateExtra = (patch: any) => onSave({ ...dossier, extra: { ...(dossier.extra || {}), ...patch } });

  if (data.length === 0) {
    return (
      <div className="space-y-4">
        <div className={CARD}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <TransfoHead dossier={dossier} lang={lang} />
            <div className="flex gap-2">
              <button className={BTN_GHOST} onClick={() => setShowEdit(true)}>✎ {tr('Éditer les infos', 'Edit info')}</button>
              <button className={BTN_GHOST + ' !text-red-600 !border-red-300'} onClick={onDeleteDossier}>🗑</button>
            </div>
          </div>
        </div>
        <div className={CARD}>
          <div className="py-6 text-center text-sm text-gray-400">{tr('Aucune mesure.', 'No measurement.')}</div>
          <button className={BTN_PRIMARY} onClick={onNewMeasure}>+ {tr('Nouveau prélèvement', 'New sample')}</button>
        </div>
        {showEdit && <EditInfoModal dossier={dossier} lang={lang} tr={tr} tenant={tenant} allDossiers={allDossiers} onSave={onSave} onClose={() => setShowEdit(false)} />}
      </div>
    );
  }

  const cur = data[selIdx] || data[data.length - 1];
  const prev = selIdx > 0 ? data[selIdx - 1] : null;
  const zone = duvalZone(duvalPct({ ch4: +(cur.ch4 || 0), c2h4: +(cur.c2h4 || 0), c2h2: +(cur.c2h2 || 0) }), lang);
  const worst = worstCondition(cur);
  const isOltc = !!dossier.extra?.is_oltc;
  // Série C₂H₂ (date+valeur) → garde anti-« stabilisé » (≥2 points après le dernier saut).
  const c2h2Series = data.map(m => ({ date: m.sample_date as string, value: +(m.c2h2 || 0) }));
  const { items, reco } = interpret(cur as any, prev as any, zone, worst, lang, isOltc, c2h2Series);
  const oilEval = evalOil(cur.oil_quality || {}, dossier.kv, lang);
  // Furanes : saisie en ppb (prototype) → furanInterpret attend des ppm (= ppb/1000).
  const fal2ppb = numOrNull(cur.oil_quality?.f_2fal);
  const furan = furanInterpret(fal2ppb != null ? fal2ppb / 1000 : null, lang);
  const hasOil = OIL_FIELDS.some(f => cur.oil_quality?.[f.key] != null) || FURAN_FIELDS.some(f => cur.oil_quality?.[f.key] != null);
  const trendA = trendAnalysis(data.map(m => ({ date: m.sample_date, c2h2: +(m.c2h2 || 0), tdcg: +(m.tdcg || 0) })), lang);
  const gAna = globalAnalysis(cur as any, oilEval, furan, worst, lang);
  const rogers = rogersRatios(cur);
  // Taux de génération par gaz (ppm/jour) — défaut actif vs historique (IEEE C57.104-2019).
  const genRates: GasRate[] = prev ? generationRates(prev as any, cur as any) : [];
  // Indice de santé global (0–100) — lecture immédiate (indicatif, à valider).
  const health = computeHealthIndex({
    c2h2Over: overThreshold(+(cur.c2h2 || 0), 'c2h2', transformerType((cur as any).o2, (cur as any).n2)),
    worstCondition: worst, genRates,
    oilPoor: oilEval.filter(o => o.status === 'poor').length,
    oilFair: oilEval.filter(o => o.status === 'fair').length,
    dp: furan?.dp ?? null,
  });
  const pcbVerdict = pcbStatus(latestPcb(data), lang);

  // QR public du transformateur (lecture seule hors connexion ; édition si connecté).
  const publicUrl = mounted && dossier.id ? `${window.location.origin}/scan/dga/${tenant}/${dossier.id}` : '';
  const esc = (s: string) => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
  const copyQR = () => { if (publicUrl) navigator.clipboard?.writeText(publicUrl).then(() => setNotice(tr('Lien copié.', 'Link copied.')), () => {}); };
  // Affiche QR centrée (copiée de l'AST / inspection d'équipement) : logo en haut, QR dans une boîte
  // arrondie, légende, site, badge BPC, URL. Le SVG (id dga-qr-svg) est mis à l'échelle à 260px en CSS.
  const printQR = () => {
    const svgEl = document.getElementById('dga-qr-svg');
    if (!svgEl) return;
    const svg = new XMLSerializer().serializeToString(svgEl);
    const logoSrc = logoUrl || '/c-secur360-logo.png';
    const sub = [dossier.serie ? 'SN ' + dossier.serie : '', dossier.kv ? dossier.kv + ' kV' : '', dossier.client || ''].filter(Boolean).join(' · ');
    const pcbBadge = pcbVerdict.code !== 'unknown'
      ? `<div class="pcb" style="background:${pcbVerdict.color}">BPC : ${esc(pcbVerdict.label)}${pcbVerdict.value != null ? ' (' + pcbVerdict.value + ' ppm)' : ''}</div>` : '';
    const w = window.open('', '_blank', 'width=800,height=1000');
    if (!w) { setNotice(tr('Autorise les fenêtres pop-up pour imprimer.', 'Allow pop-ups to print.')); return; }
    w.document.write(
      `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>QR — ${esc(dossier.ident)}</title>` +
      `<style>` +
      `html,body{height:100%}` +
      `body{font-family:system-ui,-apple-system,sans-serif;margin:0;padding:48px;color:#0f172a;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;text-align:center}` +
      `.logo{max-height:90px;width:auto;margin-bottom:28px}` +
      `.qrbox{padding:20px;border:2px solid #e2e8f0;border-radius:20px;box-shadow:0 1px 3px rgba(0,0,0,.08)}` +
      `.qrbox svg{width:260px;height:260px;display:block}` +
      `.name{font-size:26px;font-weight:800;margin-top:28px}` +
      `.sub{margin-top:6px;font-size:14px;color:#475569}` +
      `.site{margin-top:4px;font-size:13px;color:#0e7490;font-weight:600}` +
      `.pcb{display:inline-block;margin-top:14px;color:#fff;border-radius:8px;padding:6px 12px;font-weight:700;font-size:14px}` +
      `.url{margin-top:14px;font-size:13px;color:#64748b;word-break:break-all;max-width:340px}` +
      `</style></head>` +
      `<body>` +
      `<img class="logo" src="${esc(logoSrc)}" alt="logo" />` +
      `<div class="qrbox">${svg}</div>` +
      `<div class="name">${esc(dossier.ident)}</div>` +
      (sub ? `<div class="sub">${esc(sub)}</div>` : '') +
      (siteText ? `<div class="site">📍 ${esc(siteText)}</div>` : '') +
      pcbBadge +
      `<div class="url">${esc(publicUrl)}</div>` +
      `</body></html>`,
    );
    w.document.close(); w.focus(); setTimeout(() => { try { w.print(); } catch { /* ignore */ } }, 500);
  };

  const lastMeasure = data[data.length - 1];
  // Reprise : on se base sur la dernière mesure CONTENANT DES GAZ (l'état de gaz courant ; un relevé
  // BPC/huile seul ne doit pas piloter la reprise DGA, et après réparation le dernier gaz fait foi).
  const lastGas = lastGasMeasure(data) || lastMeasure;
  // « Auto » = on suit d'ABORD la RECOMMANDATION de l'analyseur (targeted_months / full_next_date),
  // sinon l'intervalle IEEE selon la condition de la dernière mesure de gaz.
  const recoDays = Number(extra.targeted_days) || null;   // reprise URGENTE en jours (Condition 4 / arc)
  const recoMonths = Number(extra.targeted_months) || null;
  const recoBase = lastGas?.sample_date;
  const recoNext = (recoDays && recoBase) ? addDays(recoBase, recoDays)
    : (recoMonths && recoBase) ? addMonths(recoBase, recoMonths)
    : (extra.full_next_date || null);
  const autoNext = recoNext || autoNextDate(lastGas.sample_date, worstCondition(lastGas));
  const effNext = extra.next_date_manual || autoNext;
  const due = dueStatusByDate(effNext);
  const dueColor = due.code === 'overdue' ? '#e63946' : due.code === 'soon' ? '#f4a261' : '#2a9d8f';

  // Δ% gaz entre cur et prev (clé de mesure minuscule).
  const trend = (k: keyof Measure): number | null => {
    if (!prev) return null; const pv = Number((prev as any)[k]) || 0; if (pv === 0) return null;
    return ((Number((cur as any)[k]) || 0) - pv) / pv * 100;
  };
  // Données du graphe recharts (une ligne par gaz combustible visible).
  const chartData = data.map(m => { const o: any = { date: m.sample_date || '' }; GAS_FIELDS.forEach(g => { o[g.key] = Number((m as any)[g.key]) || 0; }); return o; });

  // Photos / IA ─────────────────────────────────────────────────────────────
  async function addPhotos(files: FileList | null) {
    if (!files || !dossier.id) return;
    const next = [...photos];
    for (const f of Array.from(files)) {
      try { const data = await compressImage(f); next.push({ id: 'p_' + Date.now() + Math.random().toString(36).slice(2, 6), data, name: f.name }); }
      catch { setNotice(tr('Image trop volumineuse.', 'Image too large.')); }
    }
    setPhotos(next);
    const r = await savePhotos(dossier.id, next);
    if (r.error) setNotice(tr('Photos non sauvegardées (migration 120 « photos » manquante ?) : ', 'Photos not saved (missing migration 120 "photos"?): ') + r.error);
    else setNotice(null);
  }
  async function delPhoto(id: string) {
    if (!dossier.id || !confirm(tr('Supprimer cette photo ?', 'Delete this photo?'))) return;
    const next = photos.filter(p => p.id !== id); setPhotos(next); await savePhotos(dossier.id, next);
  }

  // Traduit le texte courant vers l'autre langue et enregistre les deux versions (mode auto).
  async function translateOther(currentText: string) {
    const other = lang === 'fr' ? 'en' : 'fr';
    if (!currentText.trim() || !dossier.id) return;
    try {
      const r = await fetch('/api/dga/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: currentText, target: other, tenant }) });
      const j = await r.json();
      if (r.ok && typeof j.text === 'string') updateExtra({ ['manual_reco_' + lang]: currentText, ['manual_reco_' + other]: j.text, manual_reco: currentText });
      else if (j.error) setNotice(tr('Traduction impossible : ', 'Translation failed: ') + j.error);
    } catch (e: any) { setNotice(tr('Traduction impossible : ', 'Translation failed: ') + (e?.message || e)); }
  }

  // Analyse IA serveur → reco éditable + suivi ciblé/complet.
  async function runAI() {
    if (!dossier.id) return;
    setAiBusy(true); setNotice(null);
    try {
      const resp = await fetch('/api/dga/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dossier: form, measures: data, tenant }) });
      const j = await resp.json();
      if (!resp.ok || j.error) throw new Error(j.error || 'IA');
      const a = j.analysis;
      const just = a.recheckJustification ? `\n\n— ${a.recheckJustification}` : '';
      // Stockage bilingue : le rapport/écran affiche la langue courante et se traduit au toggle FR/EN.
      const fullFr = (a.summaryFr || a.summary || '') + just;
      const fullEn = (a.summaryEn || a.summary || '') + just;
      setRecoDraft(lang === 'en' ? fullEn : fullFr);
      const patch: any = { manual_reco_fr: fullFr, manual_reco_en: fullEn, manual_reco: lang === 'en' ? fullEn : fullFr };
      // Reprise ciblée : l'urgence en JOURS (Condition 4 / arc / acétylène) PRIME sur les mois.
      const base = lastMeasure?.sample_date || '';
      const tDays = Number(a.targetedDays) > 0 ? Math.round(a.targetedDays) : null;
      const tMonths = Number(a.targetedMonths) > 0 ? Math.round(a.targetedMonths) : null;
      patch.targeted_days = tDays;
      patch.targeted_months = tMonths;
      patch.targeted_analyses = (tDays || tMonths) && Array.isArray(a.targetedAnalyses) ? a.targetedAnalyses : [];
      const targetedDate = tDays ? addDays(base, tDays) : (tMonths ? addMonths(base, tMonths) : null);
      if (targetedDate) { patch.next_date_manual = targetedDate; patch.interval_id = 'custom'; setDateDraft(targetedDate); }
      const fullMonths = a.fullMonths ?? a.retestMonths;
      if (fullMonths && base) {
        const fd = addMonths(base, Math.round(fullMonths));
        if (fd) patch.full_next_date = fd;
        if (!targetedDate && fd) { patch.next_date_manual = fd; patch.interval_id = 'custom'; setDateDraft(fd); }
      }
      // Interconnexion DGA → MAINTENANCE : diagnostic sérieux sur un transfo LIÉ à un équipement -> action corrective.
      const eqId = (dossier.extra || {}).equipment_id;
      if (eqId && (Number(a.severity) >= 3 || tDays)) {
        try {
          await saveMaintAction(tenant, {
            equipment_id: eqId, status: 'todo',
            priority: Number(a.severity) >= 4 ? 'critical' : 'high',
            description: `[DGA ${form.ident || form.serie || ''}] ${a.faultType || 'Anomalie'} — sévérité ${a.severity}${tDays ? ` · reprise ${tDays} j` : ''}. ${(fullFr || '').slice(0, 200)}`.slice(0, 500),
          });
        } catch { /* best-effort */ }
      }
      await updateExtra(patch);
    } catch (e: any) { setNotice(tr('Analyse IA impossible : ', 'AI analysis failed: ') + (e?.message || e)); }
    finally { setAiBusy(false); }
  }

  // Export : nom de fichier PDF par défaut = DGA-{n° série} (sinon ident). Le titre du document
  // pilote aussi le libellé de l'en-tête navigateur ; restauré après impression.
  // IMPORTANT : on précharge/décode les images (photos transfo + photos d'anomalie) AVANT
  // d'imprimer — le rapport est en display:none (portail) et Chrome peut sinon imprimer avant
  // d'avoir décodé les photos base64 (les graphes SVG, eux, sortent toujours).
  async function doExport() {
    setShowExport(false);
    const base = (dossier.serie || dossier.ident || 'rapport').toString().trim().replace(/[^\w.-]+/g, '_');
    const name = `DGA-${base}`;
    const prev = document.title;
    const urls = [
      ...(pages.photos ? photos.map(p => p.data) : []),
      ...(pages.anomalies ? anomalies.filter(a => !a.archived).flatMap(a => (a.photos || []).map(p => p.data)) : []),
    ];
    await Promise.all(urls.map(u => new Promise<void>(res => { const im = new Image(); im.onload = () => res(); im.onerror = () => res(); im.src = u; })));
    document.title = name;
    const restore = () => { document.title = prev; window.removeEventListener('afterprint', restore); };
    window.addEventListener('afterprint', restore);
    // petit délai pour laisser le portail refléter pages/photos avant le rendu d'impression
    setTimeout(() => window.print(), 150);
  }

  return (
    <div className="space-y-4">
      <style>{PRINT_CSS}</style>

      {/* ENTÊTE (écran) */}
      <div className="dga-screen-only space-y-4">
        <div className={CARD}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <TransfoHead dossier={dossier} lang={lang} />
            <div className="flex flex-wrap items-center gap-2">
              {isOltc ? (
                <div className="flex flex-col items-center rounded-xl bg-indigo-600 px-3 py-1.5 text-white">
                  <span className="text-sm font-extrabold">OLTC</span>
                  <span className="text-[10px] uppercase tracking-wide opacity-90">{tr('Changeur de prises', 'Tap changer')}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center rounded-xl px-3 py-1.5 text-white" style={{ background: COND_COLORS[worst] }}>
                  <span className="text-sm font-extrabold">{COND_LABELS[worst]}</span>
                  <span className="text-[10px] uppercase tracking-wide opacity-90">{tr('DGA GLOBAL', 'DGA OVERALL')}</span>
                </div>
              )}
              {pcbVerdict.code !== 'unknown' && (
                <div className="flex flex-col items-center rounded-xl px-3 py-1.5 text-white" style={{ background: pcbVerdict.color }}>
                  <span className="text-sm font-extrabold">{pcbVerdict.label}</span>
                  <span className="text-[10px] uppercase tracking-wide opacity-90">BPC / PCB{pcbVerdict.value != null ? ` · ${pcbVerdict.value} ppm` : ''}</span>
                </div>
              )}
              <button className={BTN_GHOST} onClick={() => setShowEdit(true)}>✎ <span className="hidden sm:inline">{tr('Éditer les infos', 'Edit info')}</span></button>
              <button className={BTN_DARK} onClick={() => setShowExport(true)}>🖨 <span className="hidden sm:inline">{tr('Exporter PDF', 'Export PDF')}</span></button>
              <button className={BTN_PRIMARY} onClick={onNewMeasure}>+ <span className="hidden sm:inline">{tr('Nouveau prélèvement', 'New sample')}</span><span className="sm:hidden">{tr('Prélèv.', 'Sample')}</span></button>
              <button className={BTN_GHOST + ' !text-red-600 !border-red-300'} onClick={onDeleteDossier}>🗑</button>
            </div>
          </div>
        </div>

        {/* SÉLECTEUR DE PRÉLÈVEMENT */}
        <div className="flex flex-wrap gap-2">
          {data.map((d, i) => (
            <button key={d.id || i} onClick={() => setSelIdx(i)} className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${i === selIdx ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300' : 'border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-300'}`}>
              <span className="mr-1 inline-grid h-4 w-4 place-items-center rounded-full bg-gray-200 text-[9px] text-gray-700 dark:bg-gray-600 dark:text-gray-100">{i + 1}</span>{d.sample_date || '—'}{d.source === 'pdf' ? ' 📄' : ''}
            </button>
          ))}
        </div>

        {/* INDICE DE SANTÉ GLOBAL (0–100) */}
        {(() => {
          const col = health.band === 'excellent' ? '#2a9d8f' : health.band === 'bon' ? '#5a9e3f' : health.band === 'a_surveiller' ? '#c0651a' : '#9d0208';
          const label = health.band === 'excellent' ? tr('Excellent', 'Excellent') : health.band === 'bon' ? tr('Bon', 'Good') : health.band === 'a_surveiller' ? tr('À surveiller', 'Watch') : tr('Critique', 'Critical');
          return (
            <section className={CARD} style={{ borderLeft: `6px solid ${col}` }}>
              <div className="flex flex-wrap items-center gap-4">
                <div className="text-center">
                  <div className="text-4xl font-black tabular-nums" style={{ color: col }}>{health.score}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400">/ 100</div>
                </div>
                <div className="min-w-[180px] flex-1">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{tr('INDICE DE SANTÉ', 'HEALTH INDEX')}</div>
                  <div className="text-base font-extrabold" style={{ color: col }}>{label}</div>
                  <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div className="h-full rounded-full" style={{ width: `${health.score}%`, background: col }} />
                  </div>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-gray-400">{tr('Agrège gaz combustibles, taux de génération, qualité d’huile et papier (DP). Indicatif — à valider par une personne qualifiée.', 'Aggregates combustible gases, generation rate, oil quality and paper (DP). Indicative — to be validated by a qualified person.')}</p>
            </section>
          );
        })()}

        {/* BANNIÈRE TENDANCE */}
        <section className={CARD} style={{ borderLeft: `6px solid ${trendA.lvl === 'crit' ? '#9d0208' : trendA.lvl === 'fair' ? '#f4a261' : trendA.lvl === 'good' ? '#2a9d8f' : '#577590'}` }}>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-2xl">{trendA.lvl === 'crit' ? '⛔' : trendA.lvl === 'fair' ? '⚠️' : trendA.lvl === 'good' ? '✓' : 'ℹ️'}</span>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{tr('ANALYSE DE TENDANCE', 'TREND ANALYSIS')}</div>
              <div className="text-base font-extrabold text-gray-900 dark:text-gray-100">{trendA.verdict}</div>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{trendA.txt}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">{trendA.detail.map((d, i) => <span key={i} className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600 dark:bg-gray-700 dark:text-gray-300">{d}</span>)}</div>
        </section>

        {/* ÉVOLUTION DES GAZ — PLEINE LARGEUR */}
        {data.length > 1 && (
          <section className={CARD}>
            <h2 className={H2}>{tr('Évolution des gaz combustibles', 'Combustible gas evolution')}</h2>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {GAS_FIELDS.filter(g => COMBUSTIBLE.includes(g.key)).map(g => (
                <button key={g.u} onClick={() => setVisible(v => ({ ...v, [g.key]: !v[g.key as string] }))}
                  className="rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                  style={{ borderColor: g.color, background: visible[g.key as string] ? g.color : 'transparent', color: visible[g.key as string] ? '#fff' : g.color }}>
                  {gl(g.u, lang)}
                </button>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={chartData} margin={{ top: 10, right: 24, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8ddd0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} /><Legend wrapperStyle={{ fontSize: 11 }} />
                {GAS_FIELDS.filter(g => COMBUSTIBLE.includes(g.key) && visible[g.key as string]).map(g => (
                  <Line key={g.u} type="monotone" dataKey={g.key as string} name={gl(g.u, lang)} stroke={g.color} strokeWidth={2} dot={{ r: 3 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* CARTES ANALYTIQUES — flux multi-colonnes équilibré : remplit l'espace sur desktop
            (1 col mobile · 2 col ≥lg · 3 col ≥xl), au lieu de 2 colonnes fixes déséquilibrées. */}
        <div className="gap-4 [column-fill:balance] columns-1 lg:columns-2 xl:columns-3 [&>section]:mb-4 [&>section]:break-inside-avoid">
            {/* TABLEAU IEEE (Δ% + condition) */}
            <section className={CARD}>
              <div className="flex items-center justify-between">
                <h2 className={H2}>{tr('DGA ·', 'DGA ·')} {cur.sample_date} {tr('· statut IEEE', '· IEEE status')}</h2>
                <div className="flex items-center gap-3">
                  {onEditMeasure && <button className="text-xs text-cyan-600 hover:text-cyan-800" onClick={() => onEditMeasure(cur)}>✎ {tr('Éditer', 'Edit')}</button>}
                  <button className="text-xs text-gray-400 hover:text-red-500" onClick={() => onDeleteMeasure(cur.id)}>{tr('Suppr. mesure', 'Delete measurement')}</button>
                </div>
              </div>
              <Tbl>
                <thead><Tr><Th>{tr('Gaz', 'Gas')}</Th><ThR>ppm</ThR><ThR>{tr('Δ préc.', 'Δ prev.')}</ThR><Th>{tr('Condition', 'Condition')}</Th></Tr></thead>
                <tbody>{IEEE_ROWS.map(({ key, u }) => { const c = ieeeCondition(key as string, (cur as any)[key]); const tt = trend(key as keyof Measure); return (
                  <Tr key={u}><Td>{gl(u, lang)}</Td><TdR><b>{(cur as any)[key] ?? 0}</b></TdR><TdR><span className={arrowColor(tt)}>{arrow(tt)}</span></TdR>
                    <Td>{c != null && <span className="rounded px-1.5 py-0.5 text-xs font-bold text-white" style={{ background: COND_COLORS[c] }}>{COND_LABELS[c]}</span>}</Td></Tr>
                ); })}</tbody>
              </Tbl>
            </section>

            {/* TABLEAU QUALITÉ HUILE + FURANES */}
            {hasOil && (
              <section className={CARD}>
                <h2 className={H2}>{tr("Qualité de l'huile ·", 'Oil quality ·')} {cur.sample_date}</h2>
                <Tbl>
                  <thead><Tr><Th>{tr('Paramètre', 'Parameter')}</Th><ThR>{tr('Valeur', 'Value')}</ThR><ThR>{tr('Δ préc.', 'Δ prev.')}</ThR></Tr></thead>
                  <tbody>{OIL_FIELDS.filter(f => cur.oil_quality?.[f.key] != null).map(f => {
                    const v = cur.oil_quality[f.key]; const pv = prev?.oil_quality?.[f.key];
                    const tt = (!f.text && pv) ? ((Number(v) - Number(pv)) / Number(pv)) * 100 : null;
                    return <Tr key={f.key}><Td>{fl(f, lang)}</Td><TdR><b>{v}</b></TdR><TdR><span className={arrowColor(tt)}>{f.text ? '—' : arrow(tt)}</span></TdR></Tr>;
                  })}</tbody>
                </Tbl>
                {FURAN_FIELDS.some(f => cur.oil_quality?.[f.key] != null) && (
                  <Tbl className="mt-3">
                    <thead><Tr><Th>{tr('Furanes (ppb)', 'Furans (ppb)')}</Th><ThR>{tr('Valeur', 'Value')}</ThR></Tr></thead>
                    <tbody>{FURAN_FIELDS.filter(f => cur.oil_quality?.[f.key] != null).map(f => (
                      <Tr key={f.key}><Td>{fl(f, lang)}</Td><TdR><b>{cur.oil_quality[f.key]}</b></TdR></Tr>
                    ))}</tbody>
                  </Tbl>
                )}
              </section>
            )}

            {/* HISTORIQUE EN COLONNES (paramètres × dates) — mode fusion */}
            <section className={CARD}>
              <h2 className={H2}>{tr('Historique complet', 'Full history')}</h2>
              <Tbl>
                  <thead><Tr><Th>{tr('Paramètre', 'Parameter')}</Th>{data.map((d, i) => <ThR key={d.id || i}>{d.sample_date}{d.source === 'pdf' ? ' 📄' : ''}</ThR>)}</Tr></thead>
                  <tbody>
                    {GAS_FIELDS.map(g => <Tr key={g.u}><Td>{gl(g.u, lang)}</Td>{data.map((d, i) => <TdR key={d.id || i}>{(d as any)[g.key] ?? '—'}</TdR>)}</Tr>)}
                    <Tr><Td className="font-semibold">TDCG</Td>{data.map((d, i) => <TdR key={d.id || i}>{Math.round(Number(d.tdcg) || 0)}</TdR>)}</Tr>
                    {OIL_FIELDS.filter(f => data.some(d => d.oil_quality?.[f.key] != null)).map(f => (
                      <Tr key={f.key}><Td className="italic">{fl(f, lang)}</Td>{data.map((d, i) => <TdR key={d.id || i}>{d.oil_quality?.[f.key] ?? '—'}</TdR>)}</Tr>
                    ))}
                    {FURAN_FIELDS.filter(f => data.some(d => d.oil_quality?.[f.key] != null)).map(f => (
                      <Tr key={f.key}><Td className="italic">{fl(f, lang)}</Td>{data.map((d, i) => <TdR key={d.id || i}>{d.oil_quality?.[f.key] ?? '—'}</TdR>)}</Tr>
                    ))}
                  </tbody>
                </Tbl>
            </section>

            <section className={CARD}>
              <h2 className={H2}>{tr('Triangle de Duval 1', 'Duval Triangle 1')}</h2>
              <DuvalTriangle points={data.map(m => ({ ch4: +(m.ch4 || 0), c2h2: +(m.c2h2 || 0), c2h4: +(m.c2h4 || 0), date: m.sample_date || undefined }))} selIdx={selIdx} lang={lang} />
            </section>

            <section className={CARD}>
              <h2 className={H2}>{tr('Ratios de Rogers', 'Rogers Ratios')}</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {Object.entries(rogers).map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-gray-200 p-2 text-center dark:border-gray-700">
                    <div className="text-lg font-extrabold text-gray-900 dark:text-gray-100">{(v as number).toFixed(2)}</div>
                    <div className="text-[10px] text-gray-500">{k}</div>
                  </div>
                ))}
              </div>
            </section>

            {genRates.length > 0 && genRates.some(r => r.perDay != null) && (
              <section className={CARD}>
                <h2 className={H2}>{tr('Taux de génération (ppm/jour)', 'Generation rate (ppm/day)')}</h2>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                  {genRates.map(r => {
                    const lbl = ({ h2: 'H₂', ch4: 'CH₄', c2h6: 'C₂H₆', c2h4: 'C₂H₄', c2h2: 'C₂H₂', co: 'CO', co2: 'CO₂' } as Record<string, string>)[r.gas] || r.gas;
                    const col = r.level === 'crit' ? '#9d0208' : r.level === 'warn' ? '#c0651a' : '#2a9d8f';
                    return (
                      <div key={r.gas} className="rounded-lg border border-gray-200 p-2 text-center dark:border-gray-700" style={{ borderLeft: `4px solid ${col}` }}>
                        <div className="text-base font-extrabold" style={{ color: col }}>{r.perDay == null ? '—' : r.perDay.toFixed(r.perDay >= 10 ? 0 : 2)}</div>
                        <div className="text-[10px] text-gray-500">{lbl}</div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 text-[11px] text-gray-400">{tr('Vert sous le seuil 90e pct (ppm/an), ambre ≤ 3×, rouge au-delà — IEEE C57.104-2019 (à valider). Le taux distingue un défaut actif d’un défaut historique.', 'Green below 90th-pct rate, amber ≤ 3×, red beyond — IEEE C57.104-2019 (to validate).')}</p>
              </section>
            )}

            {furan && (
              <section className={CARD}>
                <h2 className={H2}>{tr("État de l'isolation papier", 'Paper insulation condition')}</h2>
                <div className="text-center">
                  <div className="text-3xl font-extrabold" style={{ color: furan.lvl === 'poor' ? '#9d0208' : furan.lvl === 'fair' ? '#c0651a' : '#2a9d8f' }}>DP ≈ {furan.dp}</div>
                  <div className="mt-0.5 text-sm font-semibold text-gray-700 dark:text-gray-200">{furan.state}</div>
                  <div className="mt-0.5 text-[11px] text-gray-400">2-FAL = {fal2ppb} ppb · {tr('estimation Chendong', 'Chendong estimate')}</div>
                </div>
              </section>
            )}

            {/* INTERPRÉTATION DGA */}
            <section className={CARD} style={{ borderTop: '4px solid #9d0208' }}>
              <h2 className={H2}>🔍 {tr('Interprétation DGA', 'DGA interpretation')}</h2>
              {items.map((it, i) => <InterpRow key={i} lvl={it.lvl} txt={it.txt} />)}
              <div className="mt-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
                <div className="text-xs font-bold text-gray-800 dark:text-gray-100">{reco.title}</div>
                <ol className="mt-1 list-decimal pl-5 text-xs text-gray-600 dark:text-gray-300">{reco.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
              </div>
            </section>

            {/* INTERPRÉTATION HUILE */}
            {oilEval.length > 0 && (
              <section className={CARD} style={{ borderTop: '4px solid #277da1' }}>
                <h2 className={H2}>🛢️ {tr('Interprétation qualité huile', 'Oil quality interpretation')}{dossier.kv ? ` · ${tr('seuils classe', 'class thresholds')} ${voltageClass(dossier.kv, lang).label}` : ''}</h2>
                {oilEval.map((it, i) => <InterpRow key={i} lvl={it.status === 'poor' ? 'crit' : it.status === 'fair' ? 'warn' : 'ok'} txt={it.txt} />)}
              </section>
            )}

            {/* PROCHAINE ANALYSE + INTERVALLE */}
            <section className={CARD} style={{ borderTop: `4px solid ${dueColor}` }}>
              <h2 className={H2}>📅 {tr('Prochaine analyse', 'Next analysis')}</h2>
              <div className="mb-1 text-[11px] font-semibold text-gray-500">{tr('Intervalle de reprise', 'Recheck interval')}</div>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {INTERVAL_OPTIONS.map(opt => {
                  const on = extra.interval_id === opt.id || (!extra.interval_id && opt.id === '1y' && !extra.next_date_manual);
                  return <button key={opt.id} onClick={() => {
                    if (opt.id === 'custom') { updateExtra({ interval_id: 'custom' }); return; }
                    const nd = addInterval(lastMeasure.sample_date || '', opt); setDateDraft(nd || ''); updateExtra({ next_date_manual: nd, interval_id: opt.id });
                  }} className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${on ? 'border-rose-500 bg-rose-600 text-white' : 'border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-300'}`}>{al(opt, lang)}</button>;
                })}
              </div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <input type="date" className={INP + ' !w-44'} value={dateDraft || autoNext || ''} onChange={e => { setDateDraft(e.target.value); updateExtra({ next_date_manual: e.target.value, interval_id: 'custom' }); }} />
                {extra.next_date_manual && <button className="text-xs text-gray-400 hover:text-rose-600" onClick={() => { setDateDraft(''); updateExtra({ next_date_manual: '', interval_id: '' }); }}>↺ {tr('(auto selon la recommandation)', '(auto by recommendation)')}</button>}
                <span className="rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: dueColor + '22', color: dueColor }}>
                  {due.code === 'overdue' ? '⚠ ' + tr('En retard', 'Overdue') : due.code === 'soon' ? '◷ ' + tr('Bientôt dû', 'Due soon') : '✓ ' + tr('À jour', 'Up to date')}
                  {due.days != null && ` (${due.days < 0 ? `${-due.days} ${tr('j. de retard', 'days late')}` : `${due.days} ${tr('j. restants', 'days left')}`})`}
                </span>
              </div>
              {((extra.targeted_analyses && extra.targeted_analyses.length > 0) || extra.full_next_date) && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {extra.targeted_analyses && extra.targeted_analyses.length > 0 && (
                    <div className="flex-1 rounded-lg border border-rose-300 bg-rose-50 p-2.5 dark:border-rose-500/40 dark:bg-rose-500/10" style={{ minWidth: 220 }}>
                      <div className="text-xs font-bold text-rose-700 dark:text-rose-300">🎯 {tr('Suivi ciblé rapproché', 'Targeted close follow-up')}{extra.targeted_days ? ` ⚠ ${tr('URGENT', 'URGENT')}` : ''}</div>
                      {extra.next_date_manual && <div className="mt-0.5 text-xs">{extra.next_date_manual}{extra.targeted_days ? ` · ${tr('dans', 'in')} ${extra.targeted_days} ${tr('jour(s)', 'day(s)')}` : extra.targeted_months ? ` · ${extra.targeted_months} ${tr('mois', 'months')}` : ''}</div>}
                      <div className="mt-1 text-[11px] text-gray-600 dark:text-gray-300">{tr('Analyses à reprendre', 'Analyses to repeat')} : <b>{extra.targeted_analyses.join(', ')}</b></div>
                    </div>
                  )}
                  {extra.full_next_date && (
                    <div className="flex-1 rounded-lg border border-gray-300 bg-gray-50 p-2.5 dark:border-gray-600 dark:bg-gray-900/40" style={{ minWidth: 180 }}>
                      <div className="text-xs font-bold text-gray-700 dark:text-gray-200">🗓 {tr('Suivi complet (annuel)', 'Full follow-up (annual)')}</div>
                      <div className="mt-0.5 text-xs">{extra.full_next_date}</div>
                      <div className="mt-1 text-[11px] text-gray-500">{tr('Toutes les analyses', 'All analyses')}</div>
                    </div>
                  )}
                </div>
              )}
              {/* Lien vers le registre d'équipement (interconnexion maintenance) */}
              <div className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-700">
                <div className="mb-1 text-[11px] font-semibold text-gray-500">{tr('Équipement lié (maintenance)', 'Linked equipment (maintenance)')}</div>
                <EntitySearch value={eqText} options={equipOpts}
                  onText={v => setEqText(v)}
                  onPick={o => { setEqText(o.label); updateExtra({ equipment_id: o.id, equipment_name: o.label }); }}
                  placeholder={tr('Lier à un équipement du registre…', 'Link to a registered equipment…')} />
                <p className="mt-1 text-[10px] text-gray-400">{extra.equipment_id ? tr('Un diagnostic de sévérité ≥ 3 créera une action corrective de maintenance sur cet équipement.', 'A severity ≥ 3 diagnosis will create a maintenance corrective action on this equipment.') : tr('Choisissez un équipement pour relier ce transfo au module Maintenance.', 'Pick an equipment to link this transformer to Maintenance.')}</p>
              </div>
            </section>

            {/* CATALOGUE D'ANALYSES */}
            <section className={CARD}>
              <h2 className={H2}>🧪 {tr('Analyses à effectuer / effectuées', 'Analyses to perform / performed')}</h2>
              {ANALYSIS_GROUPS.map(grp => (
                <div key={grp.id} className="mb-2">
                  <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-cyan-700 dark:text-cyan-400">{al(grp, lang)}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {ANALYSIS_CATALOG.filter(a => a.group === grp.id).map(a => {
                      const chosen: string[] = extra.analyses || []; const on = chosen.includes(a.key);
                      return <button key={a.key} onClick={() => { const next = on ? chosen.filter(k => k !== a.key) : [...chosen, a.key]; updateExtra({ analyses: next }); }}
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${on ? 'border-cyan-600 bg-cyan-600 text-white' : 'border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-300'}`}>{on ? '✓ ' : ''}{al(a, lang)}</button>;
                    })}
                  </div>
                </div>
              ))}
            </section>

            {/* PHOTOS */}
            <section className={CARD}>
              <div className="flex items-center justify-between">
                <h2 className={H2 + ' !mb-0'}>📷 {tr('Photos du transformateur', 'Transformer photos')}</h2>
                <label className={BTN_DARK + ' cursor-pointer !px-3 !py-1.5 text-xs'}>
                  + {tr('Ajouter une photo', 'Add a photo')}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={e => { addPhotos(e.target.files); e.currentTarget.value = ''; }} />
                </label>
              </div>
              {photos.length === 0
                ? <div className="py-4 text-center text-xs text-gray-400">{tr('Aucune photo.', 'No photo.')}</div>
                : <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">{photos.map(ph => (
                  <div key={ph.id} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ph.data} alt={ph.name || ''} className="h-20 w-full cursor-pointer rounded-lg object-cover" onClick={() => setLightbox(ph.data)} />
                    <button className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-xs text-white" onClick={() => delPhoto(ph.id)}>×</button>
                  </div>
                ))}</div>}
            </section>

            {/* QR PUBLIC DU TRANSFORMATEUR */}
            <section className={CARD}>
              <h2 className={H2}>🔳 {tr('QR public du transformateur', 'Transformer public QR')}</h2>
              {dossier.id ? (
                <div className="flex flex-col items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoUrl || '/c-secur360-logo.png'} alt="logo" className="mb-1 h-10 w-auto object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/c-secur360-logo.png'; }} />
                  <div className="rounded-2xl border-2 border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700"><QRCodeSVG id="dga-qr-svg" value={publicUrl || ' '} size={148} level="M" /></div>
                  <a href={publicUrl || undefined} target="_blank" rel="noopener noreferrer" className="max-w-full break-all text-center text-[11px] font-medium text-rose-600 underline decoration-dotted hover:text-rose-700">{publicUrl}</a>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button className={BTN_GHOST + ' !px-3 !py-1.5 text-xs'} onClick={copyQR}>📋 {tr('Copier le lien', 'Copy link')}</button>
                    <button className={BTN_DARK + ' !px-3 !py-1.5 text-xs'} onClick={printQR}>🖨 {tr("Imprimer l'étiquette", 'Print label')}</button>
                  </div>
                  <p className="text-center text-[11px] text-gray-400">{tr('Scanné sans compte : fiche en lecture seule (BPC en premier). Connecté : édition.', 'Scanned without an account: read-only sheet (PCB first). Logged in: editing.')}</p>
                </div>
              ) : <p className="text-xs text-gray-400">{tr('Enregistre le transformateur pour générer le QR.', 'Save the transformer to generate the QR.')}</p>}
            </section>

            {/* RECOMMANDATION / IA */}
            <section className={CARD}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className={H2 + ' !mb-0'}>✍️ {tr('Recommandation manuelle', 'Manual recommendation')}</h2>
                <div className="flex items-center gap-2">
                  <label className="flex cursor-pointer items-center gap-1 text-[11px] text-gray-500" title={tr('Traduit automatiquement le texte dans l’autre langue (selon le header)', 'Auto-translate the text into the other language (per header)')}>
                    <input type="checkbox" className="accent-violet-600" checked={autoTrans} onChange={() => { const v = !autoTrans; setAutoTrans(v); if (v) translateOther(recoDraft); }} />
                    🌐 {tr('Trad. auto', 'Auto-translate')}
                  </label>
                  <button className={BTN_DARK + ' !px-3 !py-1.5 text-xs'} disabled={aiBusy} onClick={runAI}>{aiBusy ? tr('Génération…', 'Generating…') : '✨ ' + tr("Générer avec l'IA", 'Generate with AI')}</button>
                </div>
              </div>
              <textarea className={INP + ' mt-2'} rows={5} value={recoDraft} onChange={e => setRecoDraft(e.target.value)} onBlur={() => { updateExtra({ ['manual_reco_' + lang]: recoDraft, manual_reco: recoDraft }); if (autoTrans) translateOther(recoDraft); }} placeholder={tr('Ajoute ta recommandation ici…', 'Add your recommendation here…')} />
              {autoTrans && <p className="mt-1 text-[11px] text-violet-500">🌐 {tr('Traduction auto activée : le texte sera traduit dans l’autre langue à l’enregistrement.', 'Auto-translate on: text will be translated to the other language on save.')}</p>}
            </section>
        </div>

        {/* INSPECTION DE ROUTINE (au-dessus des anomalies) */}
        <InspectionSection
          dossier={dossier} inspections={inspections} lang={lang} tr={tr} logoUrl={logoUrl} tenant={tenant}
          onChange={updateInspections} onCreateAnomalies={addAnomaliesFromInspection} onSetReminder={setInspectionReminder} setNotice={setNotice}
        />

        {/* RAPPORT D'ANOMALIE (pleine largeur) */}
        <AnomalySection anomalies={anomalies} onChange={updateAnomalies} lang={lang} tr={tr} setNotice={setNotice} />

        {/* DOCUMENTS : documentation technique + rapports d'essais (PDF ou lien) */}
        <DocsSection docs={docs} onChange={updateDocs} lang={lang} tr={tr} setNotice={setNotice} />
      </div>

      {/* MODALE ÉDITION DES INFOS (commande / équipement / échantillonnage + n° projet) */}
      {showEdit && <EditInfoModal dossier={dossier} lang={lang} tr={tr} tenant={tenant} allDossiers={allDossiers} onSave={onSave} onClose={() => setShowEdit(false)} />}

      {/* LIGHTBOX */}
      {lightbox && (
        <div className="dga-screen-only fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={() => setLightbox(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" className="max-h-[92vh] max-w-[92vw] rounded-lg shadow-2xl" />
        </div>
      )}

      {/* MODALE EXPORT */}
      {showExport && (
        <div className="dga-screen-only fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setShowExport(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 dark:bg-gray-800" onClick={e => e.stopPropagation()}>
            <h2 className="mb-2 text-lg font-bold">{tr('Exporter le rapport', 'Export report')}</h2>
            <div className="mb-1 text-[11px] font-semibold text-gray-500">{tr('Pages à inclure', 'Pages to include')}</div>
            {([['titlePage', tr('Page de garde', 'Title page')], ['cover', tr('Page de présentation', 'Cover page')], ['results', tr('Résultats (mesures)', 'Results (measurements)')], ['analysis', tr('Analyse & interprétation', 'Analysis & interpretation')], ['trends', tr('Graphiques de tendances', 'Trend charts')], ['photos', tr('Photos', 'Photos') + (photos.length ? ` (${photos.length})` : '')], ['anomalies', tr("Rapport d'anomalie", 'Anomaly report') + (anomalies.filter(a => !a.archived).length ? ` (${anomalies.filter(a => !a.archived).length})` : '')], ['inspections', tr('Inspection de routine', 'Routine inspection') + (inspections.length ? ` (${inspections.length})` : '')]] as [string, string][]).map(([k, lbl]) => (
              <label key={k} className="flex cursor-pointer items-center gap-2 py-1 text-sm">
                <input type="checkbox" className="accent-rose-600" checked={(pages as any)[k]} onChange={() => setPages(p => ({ ...p, [k]: !(p as any)[k] }))} />{lbl}
              </label>
            ))}
            {pages.cover && (
              <div className="mt-2">
                <label className="mb-2 flex cursor-pointer items-center gap-2 text-sm">
                  <input type="checkbox" className="accent-rose-600" checked={pages.coverChart} onChange={() => setPages(p => ({ ...p, coverChart: !p.coverChart }))} />
                  {tr("Inclure le graphique d'évolution sous la description", 'Include the evolution chart below the description')}
                </label>
                <div className="mb-1 text-[11px] font-semibold text-gray-500">{tr('Note globale (modifiable)', 'Global note (editable)')}</div>
                <textarea className={INP} rows={3} value={globalNote} onChange={e => setGlobalNote(e.target.value)} />
              </div>
            )}
            <div className="mt-2">
              <div className="mb-1 text-[11px] font-semibold text-gray-500">{tr('N° de projet', 'Project No.')}</div>
              <input className={INP + ' !w-60'} value={projectNo} onChange={e => setProjectNo(e.target.value)} onBlur={() => updateExtra({ project_no: projectNo })} placeholder={tr('ex. P-2026-0142', 'e.g. P-2026-0142')} />
            </div>
            <p className="mt-2 text-[11px] text-gray-400">{tr("Le PDF s'ouvre via la fenêtre d'impression — choisis « Enregistrer en PDF ».", 'The PDF opens via the print dialog — choose "Save as PDF".')}</p>
            <div className="mt-3 flex gap-2">
              <button className={BTN_PRIMARY} disabled={!Object.values(pages).some(Boolean)} onClick={doExport}>{tr('Générer le PDF', 'Generate PDF')}</button>
              <button className={BTN_GHOST} onClick={() => setShowExport(false)}>{tr('Annuler', 'Cancel')}</button>
            </div>
          </div>
        </div>
      )}

      {/* RAPPORT IMPRIMABLE — porté dans document.body (hors ancêtre transformé) pour que
          l'en-tête/pied de page répétés (position: fixed) fonctionnent à l'impression. */}
      {mounted && createPortal(
        <PrintReport
          dossier={dossier} data={data} cur={cur} prev={prev} zone={zone} worst={worst}
          items={items} reco={reco} oilEval={oilEval} furan={furan} trendA={trendA} rogers={rogers}
          globalNote={globalNote} manualReco={recoDraft} nextDate={effNext} due={due}
          projectNo={projectNo} pages={pages} logoUrl={logoUrl} tenantName={tenantName} siteText={siteText} lang={lang} fal2ppb={fal2ppb}
          photos={photos} anomalies={anomalies} inspections={inspections}
        />, document.body)}
    </div>
  );
}

// ── Sous-composants ─────────────────────────────────────────────────────────
function TransfoHead({ dossier, lang }: { dossier: Dossier; lang: Lang }) {
  const EN = lang === 'en';
  const specs: string[] = [];
  if (dossier.kv) specs.push(`${dossier.kv} kV`);
  if (dossier.mva) specs.push(`${dossier.mva} MVA`);
  if (dossier.year) { const y = parseInt(String(dossier.year)); if (!isNaN(y)) specs.push(`${new Date().getFullYear() - y} ${EN ? 'yrs' : 'ans'} (${dossier.year})`); }
  if (dossier.oil_type) specs.push(dossier.oil_type);
  const vc = dossier.kv ? voltageClass(dossier.kv, lang) : null;
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{dossier.client || (EN ? 'LOCATION NOT SET' : 'LOCALISATION NON RENSEIGNÉE')}</div>
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">{dossier.ident}</h1>
      <div className="text-sm text-gray-500">{[dossier.serie ? `SN ${dossier.serie}` : '', dossier.apparatus, dossier.description].filter(Boolean).join(' · ')}</div>
      {specs.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {specs.map((s, i) => <span key={i} className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">{s}</span>)}
          {vc && <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[11px] font-semibold text-white">{EN ? 'Class' : 'Classe'} {vc.label}</span>}
        </div>
      )}
    </div>
  );
}

// Modale d'édition des infos du rapport (commande / équipement / échantillonnage + n° projet + flag).
// Port fidèle de EditInfoModal (dga-oil-app.jsx) ; projectNo -> extra.project_no ; champs num convertis.
function EditInfoModal({ dossier, lang, tr, tenant, allDossiers = [], onSave, onClose }: { dossier: Dossier; lang: Lang; tr: (fr: string, en: string) => string; tenant: string; allDossiers?: Dossier[]; onSave: (d: Dossier) => void | Promise<void>; onClose: () => void }) {
  const [d, setD] = useState<Record<string, any>>(() => {
    const o: Record<string, any> = {};
    EQUIP_FIELDS.forEach(f => { o[f.key as string] = (dossier as any)[f.key] != null ? (dossier as any)[f.key] : ''; });
    o.flag = dossier.flag || '';
    o.projectNo = dossier.extra?.project_no || '';
    return o;
  });
  // Rattachement Site/Département (source admin planner_succursales), stocké dans extra.
  const [sites, setSites] = useState<SiteNode[]>([]);
  const [siteId, setSiteId] = useState<string>(dossier.extra?.site_id || '');
  const [departmentId, setDepartmentId] = useState<string>(dossier.extra?.department_id || '');
  // Type Cuve/OLTC + transformateur parent (par n° de série).
  const [isOltc, setIsOltc] = useState<boolean>(!!dossier.extra?.is_oltc);
  const [parentSerie, setParentSerie] = useState<string>(dossier.extra?.parent_serie || '');
  const parentCandidates = allDossiers.filter(x => x.id !== dossier.id && !x.extra?.is_oltc && x.serie); // cuves avec n° de série
  useEffect(() => { if (tenant) getSitesTree(tenant).then(setSites); }, [tenant]);
  const deptOptions = sites.find(s => s.id === siteId)?.departments ?? [];
  const set = (k: string, v: any) => setD(p => ({ ...p, [k]: v }));
  function submit() {
    if (!String(d.ident || '').trim()) { alert(tr("Le nom de l'équipement est requis.", 'Equipment name is required.')); return; }
    const patch: any = { ...dossier };
    EQUIP_FIELDS.forEach(f => { const v = d[f.key as string]; patch[f.key] = f.num ? (v === '' || v == null ? null : Number(v)) : v; });
    patch.flag = d.flag;
    patch.extra = { ...(dossier.extra || {}), project_no: d.projectNo, site_id: siteId || null, department_id: departmentId || null, is_oltc: isOltc, parent_serie: isOltc ? (parentSerie || null) : null };
    onSave(patch); onClose();
  }
  return (
    <div className="dga-screen-only fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl bg-white p-5 dark:bg-gray-800" onClick={e => e.stopPropagation()}>
        <h2 className="mb-3 text-lg font-bold">✎ {tr('Informations du rapport', 'Report information')}</h2>
        <div className="mb-3 grid gap-2 sm:grid-cols-3">
          <label className="block"><span className="mb-1 block text-[11px] font-semibold text-gray-500">{tr('N° de projet', 'Project No.')}</span>
            <input className={INP} value={d.projectNo} onChange={e => set('projectNo', e.target.value)} /></label>
          <label className="block"><span className="mb-1 block text-[11px] font-semibold text-gray-500">{tr('Site', 'Site')}</span>
            <select className={INP} value={siteId} onChange={e => { setSiteId(e.target.value); setDepartmentId(''); }} disabled={sites.length === 0}>
              <option value="">{sites.length === 0 ? tr('(Créez des sites dans Admin)', '(Create sites in Admin)') : tr('— Aucun —', '— None —')}</option>
              {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select></label>
          <label className="block"><span className="mb-1 block text-[11px] font-semibold text-gray-500">{tr('Département', 'Department')}</span>
            <select className={INP} value={departmentId} onChange={e => setDepartmentId(e.target.value)} disabled={!siteId || deptOptions.length === 0}>
              <option value="">{tr('— Tout le site —', '— Whole site —')}</option>
              {deptOptions.map(dp => <option key={dp.id} value={dp.id}>{dp.name}</option>)}
            </select></label>
        </div>
        {/* Type d'équipement : cuve principale ou changeur de prises (OLTC) -> interprétation adaptée */}
        <div className="mb-3 grid gap-2 sm:grid-cols-2">
          <label className="block"><span className="mb-1 block text-[11px] font-semibold text-gray-500">{tr("Type d'équipement", 'Equipment type')}</span>
            <select className={INP} value={isOltc ? 'oltc' : 'tank'} onChange={e => setIsOltc(e.target.value === 'oltc')}>
              <option value="tank">{tr('Cuve principale', 'Main tank')}</option>
              <option value="oltc">{tr('Changeur de prises (OLTC)', 'Tap changer (OLTC)')}</option>
            </select></label>
          {isOltc && (
            <label className="block"><span className="mb-1 block text-[11px] font-semibold text-gray-500">{tr('Transformateur parent', 'Parent transformer')}</span>
              <select className={INP} value={parentSerie} onChange={e => setParentSerie(e.target.value)}>
                <option value="">{tr('— Aucun —', '— None —')}</option>
                {parentCandidates.map(p => <option key={p.id} value={p.serie}>{p.ident}{p.serie ? ` · SN ${p.serie}` : ''}</option>)}
              </select></label>
          )}
        </div>
        {EQUIP_GROUPS.map(g => (
          <div key={g.id} className="mb-3">
            <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-cyan-700 dark:text-cyan-400">{lang === 'en' ? g.en : g.fr}</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {EQUIP_FIELDS.filter(f => f.group === g.id).map(f => (
                <label key={f.key as string} className="block"><span className="mb-1 block text-[11px] text-gray-500">{lang === 'en' ? f.en : f.fr}</span>
                  <input className={INP} type={f.num ? 'number' : 'text'} value={d[f.key as string] ?? ''} onChange={e => set(f.key as string, e.target.value)} /></label>
              ))}
            </div>
          </div>
        ))}
        <label className="mb-3 block sm:w-48"><span className="mb-1 block text-[11px] text-gray-500">Flag</span>
          <select className={INP} value={d.flag || ''} onChange={e => set('flag', e.target.value)}>
            <option value="">—</option><option value="surveillance">{tr('En surveillance', 'Monitoring')}</option><option value="critique">{tr('Critique', 'Critical')}</option><option value="ok">OK</option>
          </select></label>
        <div className="flex gap-2">
          <button className={BTN_PRIMARY} onClick={submit}>{tr('Enregistrer', 'Save')}</button>
          <button className={BTN_GHOST} onClick={onClose}>{tr('Annuler', 'Cancel')}</button>
        </div>
      </div>
    </div>
  );
}

function InterpRow({ lvl, txt }: { lvl: 'crit' | 'warn' | 'info' | 'ok'; txt: string }) {
  const style = lvl === 'crit' ? 'border-l-[#9d0208] bg-rose-50 dark:bg-rose-500/10' : lvl === 'warn' ? 'border-l-[#f4a261] bg-amber-50 dark:bg-amber-500/10' : lvl === 'ok' ? 'border-l-[#2a9d8f] bg-emerald-50 dark:bg-emerald-500/10' : 'border-l-[#577590] bg-sky-50 dark:bg-sky-500/10';
  const icon = lvl === 'crit' ? '⛔' : lvl === 'warn' ? '⚠️' : lvl === 'ok' ? '✓' : 'ℹ️';
  return <div className={`mb-1.5 flex items-start gap-2 rounded border-l-4 p-2 text-sm text-gray-700 dark:text-gray-200 ${style}`}><span>{icon}</span><span>{txt}</span></div>;
}

// Tableaux compacts
// Toujours scrollable horizontalement : sur mobile, un tableau plus large que l'écran scrolle
// dans sa carte au lieu d'élargir toute la page (sinon la colonne de droite passe hors champ).
const Tbl = ({ children, className = '' }: any) => <div className={`-mx-1 overflow-x-auto px-1 ${className}`}><table className="w-full min-w-[15rem] text-sm">{children}</table></div>;
const Tr = ({ children }: any) => <tr className="border-t border-gray-100 dark:border-gray-700/50">{children}</tr>;
const Th = ({ children }: any) => <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-500">{children}</th>;
const ThR = ({ children }: any) => <th className="px-2 py-1.5 text-right text-xs font-semibold text-gray-500">{children}</th>;
const Td = ({ children, className = '' }: any) => <td className={`px-2 py-1.5 text-gray-700 dark:text-gray-200 ${className}`}>{children}</td>;
const TdR = ({ children }: any) => <td className="px-2 py-1.5 text-right text-gray-700 dark:text-gray-200">{children}</td>;

// CSS d'impression : masque l'écran, affiche le rapport (port fidèle du CSS @media print du prototype).
const PRINT_CSS = `
@media screen { .dga-print-only { display: none !important; } .run-head, .run-foot { display: none; } }
@media print {
  @page { size: letter portrait; margin: 12mm; @bottom-right { content: counter(page); font-family: Arial, sans-serif; font-size: 9px; color: #888; } }
  html, body { background: #fff !important; margin: 0 !important; padding: 0 !important; }
  /* Le rapport est porté en enfant direct de <body> : on RETIRE du flux tout le reste
     (sinon l'app en min-h-screen, juste masquée en visibility, réserve une page blanche en tête). */
  body > *:not(.dga-print-only) { display: none !important; }
  body * { visibility: hidden !important; }
  .dga-screen-only { display: none !important; }
  .dga-print-only, .dga-print-only * { visibility: visible !important; }
  .dga-print-only { display: block !important; position: static; left: auto; top: auto; width: 100%; color: #1a1a1a; }
  .title-page { min-height: 245mm; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 0 16px 30mm !important; }
  .title-page.has-break { page-break-after: always; break-after: page; }
  .rpt-content { counter-reset: page 0; }
  /* Les sections s'ENCHAÎNENT pour bien occuper l'espace (pas une page forcée par section).
     On évite seulement de COUPER une section/tableau en deux. */
  .rpt-page { padding: 0 !important; margin-top: 12px; }
  .rpt-page table, .rpt-avoid { break-inside: avoid; page-break-inside: avoid; }
  /* Table porteuse : thead/tfoot se répètent ET réservent l'espace (anti-chevauchement) */
  .rpt-runtable { width: 100%; border-collapse: collapse; }
  .rpt-runtable thead { display: table-header-group; }
  .rpt-runtable tfoot { display: table-footer-group; }
  .rpt-runtable > tbody > tr > td, .rpt-runtable > thead > tr > td, .rpt-runtable > tfoot > tr > td { padding: 0; border: none; }
  .run-head { display: flex !important; align-items: center; justify-content: space-between; padding: 0 1mm 4px; margin-bottom: 8px; height: 12mm; border-bottom: 1.5px solid #277da1; background: #fff; }
  .run-foot { display: flex !important; align-items: center; justify-content: space-between; padding: 4px 1mm 0; margin-top: 8px; height: 8mm; font-size: 8.5px; color: #888; border-top: 1px solid #d8cdbb; background: #fff; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
}
`;

export default TransfoView;
