// Générateur PDF de SOUMISSION (présentation client). jsPDF dynamique, logo en haut à gauche
// (tenant ou défaut C-Secur360), même esprit que le reste du site. Export par ITEM (sélection)
// et/ou SOMMAIRE global. Montant d'une colonne vide = 0 $.
import {
  computeLigneMontant, computeItemTotal, computeSoumissionTotal, applyMarkup, hoursByCategory,
  CATEGORIE_LABELS, type CatalogueTaux, type Soumission, type SoumissionItem, type Categorie,
} from '@/lib/soumissions';

const CATS: Categorie[] = ['mo_bureau', 'mo_chantier', 'voyagement', 'subsistance', 'hebergement', 'materiaux'];
const money = (n: number) => (Math.round((Number(n) || 0) * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' $';

async function loadImg(url?: string | null): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:')) return url;
  try {
    const res = await fetch(url); const blob = await res.blob();
    return await new Promise(r => { const fr = new FileReader(); fr.onloadend = () => r(fr.result as string); fr.onerror = () => r(null); fr.readAsDataURL(blob); });
  } catch { return null; }
}

export type SoumissionPdfOpts = {
  cat?: CatalogueTaux | null;
  logoUrl?: string | null;
  companyName?: string;
  includeSummary?: boolean;          // inclure la page Sommaire
  itemIndexes?: number[] | null;     // items à inclure (null = tous)
  filename?: string;
};

export async function exportSoumissionPdf(s: Soumission, items: SoumissionItem[], opts: SoumissionPdfOpts = {}): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const cat = opts.cat || null;
  const logo = await loadImg(opts.logoUrl || '/c-secur360-logo.png');
  const doc = new jsPDF({ unit: 'pt', format: 'letter' }); // 612 x 792
  const M = 40, W = 612, R = W - M;
  let y = M;

  const ensure = (need: number) => { if (y + need > 792 - M) { doc.addPage(); y = M; drawHeader(); } };
  const line = (x1: number, x2: number, yy: number) => { doc.setDrawColor(225); doc.setLineWidth(0.6); doc.line(x1, yy, x2, yy); };

  function drawHeader() {
    if (logo) { try { doc.addImage(logo, 'PNG', M, y, 120, 36); } catch { /* ignore */ } }
    doc.setTextColor(17, 24, 39); doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
    doc.text('SOUMISSION', R, y + 16, { align: 'right' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(107, 114, 128);
    doc.text(`${s.numero || ''}${s.revision && s.revision > 1 ? ` · rév. ${s.revision}` : ''}`, R, y + 32, { align: 'right' });
    y += 50;
  }

  drawHeader();
  // Bloc client
  doc.setTextColor(17, 24, 39); doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
  doc.text(String(s.client_snapshot?.name || '—'), M, y + 4);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(107, 114, 128);
  const meta = [s.client_snapshot?.lieu, s.year ? `Année ${s.year}` : '', opts.companyName].filter(Boolean).join('  ·  ');
  if (meta) doc.text(meta, M, y + 18);
  y += 30; line(M, R, y); y += 14;

  const wanted = (opts.itemIndexes && opts.itemIndexes.length) ? items.filter((_, i) => opts.itemIndexes!.includes(i)) : items;

  // Détail par item
  for (const it of wanted) {
    ensure(40);
    doc.setTextColor(37, 99, 235); doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
    doc.text(it.name || 'Item', M, y);
    doc.setTextColor(17, 24, 39);
    doc.text(money(computeItemTotal(it, cat)), R, y, { align: 'right' });
    y += 8; line(M, R, y); y += 14;

    for (const c of CATS) {
      const ls = (it.lignes || []).filter(l => l.categorie === c);
      if (!ls.length) continue;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(107, 114, 128);
      ensure(16); doc.text(String(CATEGORIE_LABELS[c] || c).toUpperCase(), M, y); y += 12;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(31, 41, 55);
      for (const l of ls) {
        ensure(13);
        const desc = l.description || (CATEGORIE_LABELS[c] || '');
        let detail = '';
        if (c === 'mo_bureau' || c === 'mo_chantier') detail = `${l.tech || 1} × ${(Number(l.reg) || 0) + (Number(l.supp) || 0) + (Number(l.maj) || 0)} h`;
        else if (c === 'voyagement') detail = `${l.tech || 1} véh. × ${l.quantity || 0} km`;
        else detail = `${l.quantity || 0} × ${money(Number(l.unit_cost) || 0)}`;
        doc.text(doc.splitTextToSize(String(desc), 300)[0] || '', M + 8, y);
        doc.setTextColor(150); doc.text(detail, M + 320, y);
        doc.setTextColor(31, 41, 55); doc.text(money(computeLigneMontant(l, cat)), R, y, { align: 'right' });
        y += 13;
      }
      y += 4;
    }
    y += 8;
  }

  // Sommaire global par item (optionnel)
  if (opts.includeSummary) {
    ensure(60);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(17, 24, 39);
    doc.text('Sommaire par item', M, y); y += 8; line(M, R, y); y += 14;
    doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    for (const it of items) {
      ensure(14);
      const h = hoursByCategory([it]);
      doc.setTextColor(31, 41, 55); doc.text(it.name || 'Item', M, y);
      doc.setTextColor(150); doc.text(`${h.total} h`, M + 320, y);
      doc.setTextColor(31, 41, 55); doc.text(money(computeItemTotal(it, cat)), R, y, { align: 'right' });
      y += 13;
    }
    y += 6;
  }

  // Total final (majoration appliquée)
  ensure(40); line(M, R, y); y += 16;
  const raw = computeSoumissionTotal(items, cat);
  const final = applyMarkup(raw, s.markup_pct);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(17, 24, 39);
  doc.text('TOTAL', M, y); doc.setTextColor(5, 150, 105); doc.text(money(final), R, y, { align: 'right' });
  y += 24;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(160);
  doc.text(`C-Secur360 · ${s.numero || ''}`, M, 792 - 24);

  doc.save(opts.filename || `${s.numero || 'soumission'}.pdf`);
}
