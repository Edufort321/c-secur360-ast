// Rapport DGA en PDF (jsPDF). En-tête logo tenant (sinon C-Secur360), info équipement, tableau des gaz
// vs limites IEEE C57.104 + condition, zone Duval + méthodes, synthèse IA et recommandations.
import type { Dossier, Measure } from './dossiers';

const IEEE: Record<string, [number, number, number]> = {
  h2: [100, 700, 1800], ch4: [120, 400, 1000], c2h6: [65, 100, 150], c2h4: [50, 100, 200],
  c2h2: [35, 50, 80], co: [350, 570, 1400], co2: [2500, 4000, 10000],
};
const GAS_ROWS: [keyof Measure, string][] = [['h2', 'H2'], ['ch4', 'CH4'], ['c2h6', 'C2H6'], ['c2h4', 'C2H4'], ['c2h2', 'C2H2'], ['co', 'CO'], ['co2', 'CO2']];

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
  const d = opts.dossier; const ms = opts.measures || [];
  const last = ms[ms.length - 1];
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const W = doc.internal.pageSize.getWidth(); const M = 48; let y = 50;

  const logo = await loadLogo(opts.logoUrl || '/c-secur360-logo.png');
  if (logo) { try { doc.addImage(logo, 'PNG', M, y - 14, 90, 28); } catch { /* ignore */ } }
  doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.setTextColor(20);
  doc.text(fr ? 'Rapport de diagnostic DGA' : 'DGA Diagnostic Report', W - M, y, { align: 'right' }); y += 26;
  doc.setDrawColor(210); doc.line(M, y, W - M, y); y += 16;

  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(60);
  const info = [
    `${fr ? 'Équipement' : 'Equipment'} : ${d.ident || '—'}`,
    `${fr ? 'Client / Localisation' : 'Client / Location'} : ${d.client || '—'}`,
    `${fr ? 'N° de série' : 'Serial No.'} : ${d.serie || '—'}    ${fr ? 'Fabricant' : 'Manufacturer'} : ${d.manufacturer || '—'}`,
    `kV : ${d.kv ?? '—'}    MVA : ${d.mva ?? '—'}    ${fr ? "Type d'huile" : 'Oil type'} : ${d.oil_type || '—'}`,
    `${fr ? 'Date échantillon' : 'Sample date'} : ${last?.sample_date || '—'}`,
  ];
  for (const l of info) { doc.text(l, M, y); y += 14; } y += 6;

  // Tableau gaz vs limites (sauf rapport sommaire)
  if (rtype !== 'summary') {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(20);
    doc.text(fr ? 'Gaz dissous (ppm) vs limites IEEE C57.104' : 'Dissolved gases (ppm) vs IEEE C57.104 limits', M, y); y += 14;
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text('Gaz', M, y); doc.text(fr ? 'Valeur' : 'Value', M + 90, y); doc.text('C1 / C2 / C3', M + 160, y); y += 12;
    doc.setDrawColor(230); doc.line(M, y - 8, W - M, y - 8);
    for (const [k, label] of GAS_ROWS) {
      const v = Number((last as any)?.[k] ?? 0); const lim = IEEE[k as string];
      doc.setTextColor(60); doc.text(label, M, y); doc.text(String(v), M + 90, y);
      doc.text(`${lim[0]} / ${lim[1]} / ${lim[2]}`, M + 160, y); y += 13;
    }
    y += 4;
  }
  // Qualité d'huile (rapport complet seulement)
  if (rtype === 'full' && last?.oil_quality && Object.keys(last.oil_quality).length) {
    const oq = last.oil_quality as any;
    const labels: Record<string, string> = { moisture: fr ? 'Eau (ppm)' : 'Moisture', acid: fr ? 'Acidité' : 'Acidity', ift: 'IFT', dielectric: 'D1816 (kV)', dbd877: 'D877 (kV)', color: fr ? 'Couleur' : 'Color', pf25: 'PF 25', pf100: 'PF 100', f_2fal: '2-FAL' };
    const entries = Object.entries(labels).filter(([k]) => oq[k] != null && oq[k] !== '');
    if (entries.length) {
      doc.setFont('helvetica', 'bold'); doc.setTextColor(20); doc.text(fr ? "Qualité d'huile" : 'Oil quality', M, y); y += 13;
      doc.setFont('helvetica', 'normal'); doc.setTextColor(60); doc.setFontSize(9);
      doc.text(entries.map(([k, lab]) => `${lab}: ${oq[k]}`).join('    '), M, y); y += 16;
    }
  }
  doc.setFont('helvetica', 'bold'); doc.setTextColor(20);
  doc.text(`TDCG : ${Math.round(last?.tdcg || 0)} ppm    ${fr ? 'Condition IEEE' : 'IEEE Condition'} : ${last?.condition || '—'}/4    Duval : ${last?.duval || '—'}`, M, y); y += 16;
  if (last?.fault) { doc.setFont('helvetica', 'normal'); doc.setTextColor(60); doc.text(`${fr ? 'Défaut' : 'Fault'} : ${last.fault}`, M, y); y += 16; }

  // Synthèse IA / recommandations
  if (opts.ai) {
    doc.setFont('helvetica', 'bold'); doc.setTextColor(20); doc.text(fr ? 'Analyse experte' : 'Expert analysis', M, y); y += 14;
    doc.setFont('helvetica', 'normal'); doc.setTextColor(60); doc.setFontSize(9.5);
    const summary = fr ? opts.ai.summaryFr : opts.ai.summaryEn;
    for (const ln of doc.splitTextToSize(String(summary || ''), W - 2 * M)) { doc.text(ln, M, y); y += 13; }
    const recos = (fr ? opts.ai.recommendationsFr : opts.ai.recommendationsEn) || [];
    for (const r of recos) { for (const ln of doc.splitTextToSize('• ' + r, W - 2 * M)) { doc.text(ln, M, y); y += 13; } }
  }

  doc.setFontSize(8); doc.setTextColor(150);
  doc.text(fr ? 'Indicatif — à confirmer par laboratoire. Genere par C-Secur360.' : 'Indicative — confirm with lab. Generated by C-Secur360.', M, doc.internal.pageSize.getHeight() - 30);
  doc.save(`rapport-dga-${(d.ident || 'transfo').replace(/\s+/g, '_')}.pdf`);
}
