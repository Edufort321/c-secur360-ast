// Rapport DGA en PDF (jsPDF) — structure type rapport de labo : en-tête équipement par page,
// évaluation AGD (Rogers / IEC 60599 / gaz clés), état IEEE C57.104 (TDCG, taux, intervalle, procédure),
// page Tendances (courbes auto par paramètre), avertissement. Logo tenant (sinon C-Secur360).
// Contact / courriel / téléphone du client ne figurent JAMAIS dans le rapport.
import type { Dossier, Measure } from './dossiers';
import { diagnose, rogers, iec60599, keyGas } from './diagnose';

const IEEE: Record<string, [number, number, number]> = {
  h2: [100, 700, 1800], ch4: [120, 400, 1000], c2h6: [65, 100, 150], c2h4: [50, 100, 200],
  c2h2: [35, 50, 80], co: [350, 570, 1400], co2: [2500, 4000, 10000],
};
const GAS_ROWS: [keyof Measure, string][] = [['h2', 'H2'], ['ch4', 'CH4'], ['c2h6', 'C2H6'], ['c2h4', 'C2H4'], ['c2h2', 'C2H2'], ['co', 'CO'], ['co2', 'CO2']];

// Paramètres tracés (gaz + qualité d'huile).
const TREND_PARAMS: { label: string; get: (m: Measure) => number | null }[] = [
  { label: 'TDCG (ppm)', get: m => num(m.tdcg) }, { label: 'H2 (ppm)', get: m => num(m.h2) }, { label: 'CH4 (ppm)', get: m => num(m.ch4) },
  { label: 'C2H6 (ppm)', get: m => num(m.c2h6) }, { label: 'C2H4 (ppm)', get: m => num(m.c2h4) }, { label: 'C2H2 (ppm)', get: m => num(m.c2h2) },
  { label: 'CO (ppm)', get: m => num(m.co) }, { label: 'CO2 (ppm)', get: m => num(m.co2) },
  { label: 'Humidite (ppm)', get: m => num(m.oil_quality?.moisture) }, { label: 'Rigidite D1816 (kV)', get: m => num(m.oil_quality?.dielectric) },
  { label: 'IFT (mN/m)', get: m => num(m.oil_quality?.ift) }, { label: 'Acidite (mgKOH/g)', get: m => num(m.oil_quality?.acid) },
  { label: 'Couleur (ASTM)', get: m => num(m.oil_quality?.color) }, { label: 'PF 25C (%)', get: m => num(m.oil_quality?.pf25) },
];
function num(v: any): number | null { return v === null || v === undefined || v === '' || isNaN(Number(v)) ? null : Number(v); }
const insufficient = (m: Measure) => (Number(m.ch4 || 0) + Number(m.c2h2 || 0) + Number(m.c2h4 || 0)) < 1;
const gi = (m: Measure) => ({ h2: +(m.h2 || 0), ch4: +(m.ch4 || 0), c2h6: +(m.c2h6 || 0), c2h4: +(m.c2h4 || 0), c2h2: +(m.c2h2 || 0), co: +(m.co || 0), co2: +(m.co2 || 0) });

const INTERVAL = ['Annuel', 'Annuel', 'Trimestriel', 'Mensuel', 'Hebdomadaire'];
const PROC: Record<number, string> = {
  1: 'Continuer les operations normales.',
  2: 'Faire preuve de prudence. Analyser les gaz individuels pour trouver la cause; surveiller la tendance.',
  3: 'Anomalie elevee. Echantillonnage rapproche; planifier une inspection.',
  4: 'Echantillonnage immediat; envisager le retrait de service; expertise.',
};

async function loadLogo(url?: string | null): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:')) return url;
  try { const r = await fetch(url); const b = await r.blob(); return await new Promise(res => { const fr = new FileReader(); fr.onloadend = () => res(fr.result as string); fr.onerror = () => res(null); fr.readAsDataURL(b); }); }
  catch { return null; }
}

export async function generateDgaReport(opts: { dossier: Dossier; measures: Measure[]; ai?: any; logoUrl?: string | null; lang?: 'fr' | 'en'; reportType?: 'full' | 'dga' | 'summary' }) {
  const { default: jsPDF } = await import('jspdf');
  const fr = (opts.lang || 'fr') === 'fr';
  const rtype = opts.reportType || 'full';
  const d = opts.dossier; const ms = (opts.measures || []).slice().sort((a, b) => String(a.sample_date).localeCompare(String(b.sample_date)));
  const last = ms[ms.length - 1];
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const W = doc.internal.pageSize.getWidth(); const Hp = doc.internal.pageSize.getHeight(); const M = 42;
  const logo = await loadLogo(opts.logoUrl || '/c-secur360-logo.png');

  const header = () => {
    if (logo) { try { doc.addImage(logo, 'PNG', M, 24, 80, 24); } catch { /* ignore */ } }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(60);
    doc.text(`Equipement: ${d.ident || '—'}   No de serie: ${d.serie || '—'}   No d'equip.: ${d.equip_no || '—'}`, W - M, 30, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text(`Sous-station/Client: ${d.client || '—'}   Type: ${d.description || d.apparatus || '—'}`, W - M, 42, { align: 'right' });
    doc.setDrawColor(210); doc.line(M, 50, W - M, 50);
  };
  const footer = (page: number, total: number) => {
    doc.setFontSize(7); doc.setTextColor(150);
    doc.text('C-Secur360 — Diagnostic DGA. Donnees fournies par le client; presentation des resultats a titre indicatif, sans garantie. La conduite et la securite de l equipement demeurent sous la responsabilite du client.', M, Hp - 24, { maxWidth: W - 2 * M } as any);
    doc.text(`${page} / ${total}`, W - M, Hp - 14, { align: 'right' });
  };
  let y = 60;
  const ensure = (h: number) => { if (y + h > Hp - 50) { doc.addPage(); header(); y = 60; } };

  header();
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(20);
  doc.text(fr ? 'Rapport de diagnostic DGA' : 'DGA Diagnostic Report', M, y); y += 20;

  // ── Évaluation AGD : Rogers / IEC 60599 / gaz clés ──
  doc.setFontSize(11); doc.text(fr ? "Evaluation de l'etat AGD" : 'DGA state evaluation', M, y); y += 6;
  doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(80); y += 10;
  const cols = [M, M + 80, M + 230, M + 380];
  doc.text('Date', cols[0], y); doc.text('Ratios Rogers', cols[1], y); doc.text('Ratios IEC 60599', cols[2], y); doc.text('Gaz cles', cols[3], y); y += 4;
  doc.setDrawColor(225); doc.line(M, y, W - M, y); y += 10;
  doc.setFont('helvetica', 'normal'); doc.setTextColor(60);
  for (const m of ms) {
    ensure(14); const g = gi(m); const ins = insufficient(m);
    doc.text(String(m.sample_date || '—'), cols[0], y);
    doc.text(ins ? 'Quantite de gaz insuffisante' : (fr ? rogers(g).fault.fr : rogers(g).fault.en), cols[1], y, { maxWidth: 145 } as any);
    doc.text(ins ? 'Quantite de gaz insuffisante' : (fr ? iec60599(g).fault.fr : iec60599(g).fault.en), cols[2], y, { maxWidth: 145 } as any);
    doc.text(fr ? keyGas(g).fault.fr : keyGas(g).fault.en, cols[3], y, { maxWidth: 150 } as any); y += 15;
  }
  y += 8;

  // ── État IEEE C57.104 (TDCG, taux, intervalle, procédure) ──
  ensure(40);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(20);
  doc.text(fr ? "Etat selon les gaz cles — IEEE C57.104" : 'Key-gas state — IEEE C57.104', M, y); y += 12;
  doc.setFontSize(7.5); doc.setTextColor(80);
  const c2 = [M, M + 70, M + 110, M + 165, M + 230, M + 300];
  doc.text('Date', c2[0], y); doc.text('Cond.', c2[1], y); doc.text('TDCG', c2[2], y); doc.text('Taux/j', c2[3], y); doc.text('Intervalle', c2[4], y); doc.text('Procedure', c2[5], y); y += 4;
  doc.setDrawColor(225); doc.line(M, y, W - M, y); y += 10;
  doc.setFont('helvetica', 'normal'); doc.setTextColor(60);
  for (let i = 0; i < ms.length; i++) {
    ensure(16); const m = ms[i]; const dg = diagnose(gi(m)); const cond = m.condition || dg.condition;
    let rate = 'N/A';
    if (i > 0 && ms[i - 1].sample_date && m.sample_date) { const days = (new Date(m.sample_date).getTime() - new Date(ms[i - 1].sample_date as string).getTime()) / 86400000; if (days > 0) rate = (((m.tdcg || dg.tdcg) - (ms[i - 1].tdcg || 0)) / days).toFixed(3); }
    doc.text(String(m.sample_date || '—'), c2[0], y); doc.text(String(cond), c2[1], y);
    doc.text(String(Math.round(m.tdcg || dg.tdcg)), c2[2], y); doc.text(rate, c2[3], y);
    doc.text(INTERVAL[cond] || 'Annuel', c2[4], y); doc.text(PROC[cond] || '', c2[5], y, { maxWidth: W - M - c2[5] } as any); y += 16;
  }
  y += 6;

  // ── Dernière mesure : gaz vs limites (sauf sommaire) ──
  if (rtype !== 'summary' && last) {
    ensure(24); doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(20);
    doc.text(fr ? 'Derniere mesure — gaz vs IEEE C57.104' : 'Latest — gases vs IEEE C57.104', M, y); y += 13;
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(60);
    for (const [k, label] of GAS_ROWS) { ensure(13); const v = Number((last as any)?.[k] ?? 0); const lim = IEEE[k as string]; doc.text(`${label}: ${v}  (C1/C2/C3 = ${lim[0]}/${lim[1]}/${lim[2]})`, M, y); y += 12; }
    y += 4; doc.setFont('helvetica', 'bold'); doc.setTextColor(20);
    doc.text(`TDCG: ${Math.round(last.tdcg || 0)}    ${fr ? 'Condition' : 'Condition'}: ${last.condition || '—'}/4    Duval: ${last.duval || '—'}`, M, y); y += 16;
  }

  // ── Analyse experte ──
  if (last?.ai_summary || opts.ai) {
    ensure(30); doc.setFont('helvetica', 'bold'); doc.setTextColor(20); doc.text(fr ? 'Analyse experte' : 'Expert analysis', M, y); y += 14;
    doc.setFont('helvetica', 'normal'); doc.setTextColor(60); doc.setFontSize(9.5);
    const summary = last?.ai_summary || (fr ? opts.ai?.summaryFr : opts.ai?.summaryEn) || '';
    for (const ln of doc.splitTextToSize(String(summary), W - 2 * M)) { ensure(13); doc.text(ln, M, y); y += 13; }
    const recos = (fr ? opts.ai?.recommendationsFr : opts.ai?.recommendationsEn) || [];
    for (const r of recos) { for (const ln of doc.splitTextToSize('- ' + r, W - 2 * M)) { ensure(13); doc.text(ln, M, y); y += 13; } }
  }

  // ── Page TENDANCES : courbes auto par paramètre ──
  const dated = ms.filter(m => m.sample_date);
  const series = TREND_PARAMS.map(p => ({ p, pts: dated.map(m => ({ d: String(m.sample_date), v: p.get(m) })).filter(x => x.v != null) as { d: string; v: number }[] })).filter(s => s.pts.length >= 2);
  if (series.length) {
    doc.addPage(); header(); y = 60;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(20); doc.text('TENDANCES', M, y); y += 14;
    const cw = (W - 2 * M - 16) / 2, ch = 90; let col = 0;
    for (const s of series) {
      if (y + ch > Hp - 50) { doc.addPage(); header(); y = 60; doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.text('TENDANCES', M, y); y += 14; col = 0; }
      const x0 = M + col * (cw + 16);
      drawChart(doc, x0, y, cw, ch, s.p.label, s.pts);
      col++; if (col === 2) { col = 0; y += ch + 14; }
    }
  }

  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) { doc.setPage(p); footer(p, total); }
  doc.save(`rapport-dga-${(d.ident || 'transfo').replace(/\s+/g, '_')}.pdf`);
}

// Mini-graphique de tendance dans le PDF.
function drawChart(doc: any, x: number, y: number, w: number, h: number, title: string, pts: { d: string; v: number }[]) {
  const padL = 30, padB = 14, padT = 14, padR = 6;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(60); doc.text(title, x, y + 8);
  const vals = pts.map(p => p.v); let min = Math.min(...vals), max = Math.max(...vals); if (min === max) { min -= 1; max += 1; }
  const span = max - min;
  const px = (i: number) => x + padL + (i * (w - padL - padR)) / Math.max(1, pts.length - 1);
  const py = (v: number) => y + padT + (h - padT - padB) * (1 - (v - min) / span);
  doc.setDrawColor(210); doc.line(x + padL, y + padT, x + padL, y + h - padB); doc.line(x + padL, y + h - padB, x + w - padR, y + h - padB);
  doc.setFontSize(6); doc.setTextColor(120); doc.setFont('helvetica', 'normal');
  doc.text(String(Math.round(max * 100) / 100), x + padL - 2, py(max) + 2, { align: 'right' }); doc.text(String(Math.round(min * 100) / 100), x + padL - 2, py(min) + 2, { align: 'right' });
  doc.setDrawColor(220, 38, 38); doc.setLineWidth(1);
  for (let i = 1; i < pts.length; i++) doc.line(px(i - 1), py(pts[i - 1].v), px(i), py(pts[i].v));
  doc.setLineWidth(0.2);
  const every = Math.max(1, Math.ceil(pts.length / 3));
  pts.forEach((p, i) => { if (i % every === 0) { doc.setTextColor(120); doc.text(p.d.slice(2), px(i), y + h - padB + 9, { align: 'center' } as any); } });
}
