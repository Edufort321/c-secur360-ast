// Scorecard HSE « board-ready » (PDF). Réutilise le style PDF unifié de la plateforme (pdfStyleFor 'rapports').
// Indicatif — à valider par une personne qualifiée. Bilingue FR/EN.
import type { HseKpiRow } from '@/lib/hse/kpi';

export async function exportHseScorecard(opts: {
  tenant: string; lang: 'fr' | 'en'; rateBase: number;
  agg: Omit<HseKpiRow, 'month'>; rows: HseKpiRow[]; tenantName?: string; logoUrl?: string | null;
}) {
  const { lang, rateBase, agg, rows } = opts;
  const fr = lang !== 'en';
  const tr = (f: string, e: string) => (fr ? f : e);
  const { default: jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default as any;
  let accent: [number, number, number] = [60, 96, 122];
  try { const { pdfStyleFor } = await import('@/lib/pdfStyle'); const st = await pdfStyleFor(opts.tenant, 'rapports'); if (st?.accent) accent = st.accent as any; } catch { /* défaut */ }

  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const W = doc.internal.pageSize.getWidth(); const M = 40; let y = 50;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.setTextColor(...accent);
  doc.text(tr('Tableau de bord SST — Scorecard', 'HSE Scorecard'), M, y); y += 18;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(110);
  doc.text(`${opts.tenantName || opts.tenant} · ${tr('généré le', 'generated')} ${new Date().toISOString().slice(0, 10)} · ${tr('base', 'base')} ${rateBase.toLocaleString()} h`, M, y); y += 8;
  doc.setDrawColor(...accent); doc.setLineWidth(0.8); doc.line(M, y, W - M, y); y += 20;

  // Cartes KPI principales
  const cards: [string, string | number, [number, number, number]][] = [
    ['LTIFR / TF1', agg.ltifr, [192, 0, 32]],
    ['TRIR / TF2', agg.trir, [180, 83, 9]],
    [tr('Taux DART', 'DART rate'), (agg as any).dartRate ?? 0, [225, 29, 72]],
    [tr('Taux de gravité', 'Severity rate'), agg.severityRate, [194, 65, 12]],
  ];
  const cw = (W - 2 * M - 30) / 4;
  cards.forEach((c, i) => {
    const x = M + i * (cw + 10);
    doc.setFillColor(247, 248, 250); doc.roundedRect(x, y, cw, 56, 4, 4, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.setTextColor(...c[2]); doc.text(String(c[1]), x + 8, y + 26);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(90); doc.text(String(c[0]), x + 8, y + 44, { maxWidth: cw - 12 } as any);
  });
  y += 74;

  // Bandeau exposition
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(70);
  doc.text(`${tr('Heures travaillées', 'Hours worked')}: ${agg.hours.toLocaleString()}   ·   ${tr('Accidents avec arrêt', 'Lost-time')}: ${agg.ltiCount}   ·   ${tr('Enregistrables', 'Recordables')}: ${agg.recordableCount}   ·   ${tr('Jours perdus', 'Lost days')}: ${agg.lostDays}`, M, y);
  y += 13;
  doc.text(`${tr('Passés proches', 'Near-misses')}: ${agg.nearMissCount}   ·   ${tr('Cas DART', 'DART cases')}: ${(agg as any).dartCount ?? 0}   ·   ${tr('Décès', 'Fatalities')}: ${(agg as any).fatalityCount ?? 0}`, M, y);
  y += 16;

  // Tableau mensuel
  autoTable(doc, {
    startY: y, margin: { left: M, right: M },
    head: [[tr('Mois', 'Month'), tr('Heures', 'Hours'), 'LTIFR', 'TRIR', 'DART', tr('Gravité', 'Severity'), tr('Presqu’acc.', 'Near-miss')]],
    body: rows.map(r => [r.month, r.hours.toLocaleString(), r.ltifr, r.trir, (r as any).dartRate ?? 0, r.severityRate, r.nearMissCount]),
    styles: { fontSize: 8, cellPadding: 3 }, headStyles: { fillColor: accent, textColor: 255 },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' }, 6: { halign: 'right' } },
  });

  const Hp = doc.internal.pageSize.getHeight();
  doc.setFontSize(7.5); doc.setTextColor(140);
  doc.text(tr('LTIFR = accidents avec arrêt × base / heures. TRIR = enregistrables × base / heures. Indicatif — à valider par une personne qualifiée.', 'LTIFR = lost-time × base / hours. TRIR = recordables × base / hours. Indicative — validate with a qualified person.'), M, Hp - 30, { maxWidth: W - 2 * M } as any);

  doc.save(`HSE-scorecard-${opts.tenant}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
