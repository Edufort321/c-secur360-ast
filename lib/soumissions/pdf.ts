// Générateur PDF de SOUMISSION (présentation client). jsPDF dynamique, logo en haut à gauche
// (tenant ou défaut C-Secur360), même esprit que le reste du site. Export par ITEM (sélection)
// et/ou SOMMAIRE global. Montant d'une colonne vide = 0 $.
import {
  computeLigneMontant, computeItemTotal, computeSoumissionTotal, applyMarkup, hoursByCategory,
  CATEGORIE_LABELS, catLabel, type CatalogueTaux, type Soumission, type SoumissionItem, type Categorie,
} from '@/lib/soumissions';
import { drawCoverLetterPage, applyFooters, drawLogo, type CoverLetterData } from '@/lib/pdf/letterhead';
import { formatMoney } from '@/lib/currency';

const CATS: Categorie[] = ['mo_bureau', 'mo_chantier', 'voyagement', 'subsistance', 'hebergement', 'materiaux'];

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
  coverLetter?: CoverLetterData | null; // lettre de présentation (page jointe en tête)
  breakdownMode?: 'detaille' | 'par_item' | 'global_desc'; // ventilation des coûts
  includeTaux?: boolean;             // joindre une page « Liste de taux » (catalogue)
  conditions?: { titre: string; contenu: string }[]; // conditions & modalités cochées (page jointe)
  attachments?: { url: string; filename?: string }[]; // PDF supplémentaires à annexer (fusion pdf-lib)
  headerColor?: string | null;       // couleur de la bande d'en-tête (hex), paramétrable par tenant
  tenant?: string;                   // pour résoudre le style du module « soumission » (Modèles PDF)
  filename?: string;
};

// #rrggbb -> [r,g,b] (défaut bleu C-Secur si invalide).
function hexRgb(hex?: string | null): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return [15, 82, 186];
  const i = parseInt(m[1], 16);
  return [(i >> 16) & 255, (i >> 8) & 255, i & 255];
}

export async function exportSoumissionPdf(s: Soumission, items: SoumissionItem[], opts: SoumissionPdfOpts = {}): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const cat = opts.cat || null;
  // Multi-devise (#43) : montants formatés avec le symbole de la devise de la soumission (défaut CAD).
  const money = (n: number) => formatMoney(Number(n) || 0, s.currency || 'CAD');
  // Libellé d'une catégorie en respectant le RENOMMAGE des postes du catalogue (catLabel) — #48.
  const catName = (c: Categorie) => catLabel(cat, c === 'voyagement' ? 'km' : c, CATEGORIE_LABELS[c]);
  const logo = await loadImg(opts.logoUrl || '/c-secur360-logo.png');
  const doc = new jsPDF({ unit: 'pt', format: 'letter' }); // 612 x 792
  const M = 42, W = 612, R = W - M; // marge DGA
  const BAND = hexRgb(opts.headerColor); // couleur de la bande d'en-tête (paramétrable)
  // Style du module « soumission » (Modèles PDF) — accent + épaisseur du filet. L'accent prime pour
  // le titre/filet ; la bande supérieure reste la couleur d'en-tête du tenant (headerColor) si définie.
  const st = opts.tenant ? await import('@/lib/pdfStyle').then(m => m.pdfStyleFor(opts.tenant!, 'soumission')).catch(() => undefined) : undefined;
  const ACCENT: [number, number, number] = st?.accent || BAND;
  const RW = st?.ruleWidth ?? 1.2;
  let y = M;

  const ensure = (need: number) => { if (y + need > 792 - 50) { doc.addPage(); drawHeader(); } };
  const line = (x1: number, x2: number, yy: number) => { doc.setDrawColor(210); doc.setLineWidth(0.6); doc.line(x1, yy, x2, yy); };

  // En-tête de page FIDÈLE DGA : logo (ratio préservé, hauteur 24) + métadonnées à droite + filet à y=50.
  function drawHeader() {
    // Bande d'en-tête colorée (couleur paramétrable par tenant) — look « rapport » DGA/chantier.
    doc.setFillColor(BAND[0], BAND[1], BAND[2]); doc.rect(0, 0, W, 8, 'F');
    drawLogo(doc, logo, M, 22, 24);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(BAND[0], BAND[1], BAND[2]);
    doc.text(opts.companyName || 'C-Secur360', R, 30, { align: 'right' });
    doc.setFont('helvetica', 'normal'); doc.setTextColor(90);
    doc.text(`Soumission ${s.numero || ''}${s.revision && s.revision > 1 ? ` · rév. ${s.revision}` : ''}`, R, 42, { align: 'right' });
    doc.setDrawColor(ACCENT[0], ACCENT[1], ACCENT[2]); doc.setLineWidth(RW); doc.line(M, 50, R, 50);
    y = 60;
  }

  // Lettre de présentation (page de tête, look pro partagé) — si fournie.
  if (opts.coverLetter) {
    drawCoverLetterPage(doc, { ...opts.coverLetter, logo, numero: opts.coverLetter.numero || s.numero });
    doc.addPage(); y = M;
  }

  drawHeader();
  // Titre du document (corps), façon DGA.
  doc.setFont('helvetica', 'bold'); doc.setFontSize(st?.titleSize ?? 14); doc.setTextColor(ACCENT[0], ACCENT[1], ACCENT[2]);
  doc.text('SOUMISSION', M, y); doc.setTextColor(20); y += 18;
  // Bloc client
  doc.setTextColor(20, 20, 20); doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
  doc.text(String(s.client_snapshot?.name || '—'), M, y + 4);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(107, 114, 128);
  const meta = [s.client_snapshot?.lieu, s.year ? `Année ${s.year}` : '', opts.companyName].filter(Boolean).join('  ·  ');
  if (meta) doc.text(meta, M, y + 18);
  y += 30; line(M, R, y); y += 14;

  const wanted = (opts.itemIndexes && opts.itemIndexes.length) ? items.filter((_, i) => opts.itemIndexes!.includes(i)) : items;
  // Mode de ventilation des coûts : 'detaille' (toutes les lignes + montants), 'par_item' (un prix
  // par item, sans le détail), 'global_desc' (descriptions des items seulement, prix GLOBAL en bas).
  const mode = opts.breakdownMode || 'detaille';

  // Calcul lisible d'une ligne (inline) : « 1 tech × 2 h rég × 120,00 $/h », « 5 × 12,00 $ + marge 20 % », etc.
  const ligneCalcul = (l: any): string => {
    const c = l.categorie;
    if (c === 'mo_bureau' || c === 'mo_chantier') {
      const taux = c === 'mo_bureau' ? (cat?.taux_mo_bureau || 0) : (cat?.taux_mo_chantier || 0);
      const parts: string[] = [];
      if (Number(l.reg)) parts.push(`${l.reg} h rég`);
      if (Number(l.supp)) parts.push(`${l.supp} h supp`);
      if (Number(l.maj)) parts.push(`${l.maj} h maj`);
      return `${Number(l.tech) || 1} tech × ${parts.join(' + ') || '0 h'} × ${money(taux)}/h`;
    }
    if (c === 'voyagement') return `${Number(l.tech) || 1} véh × ${Number(l.quantity) || 0} km × ${money(Number(l.unit_cost) || 0)}/km`;
    if (c === 'materiaux') return `${Number(l.quantity) || 0} × ${money(Number(l.unit_cost) || 0)}${Number(l.maj) ? ` + marge ${l.maj} %` : ''}`;
    return `${Number(l.quantity) || 0} × ${money(Number(l.unit_cost) || 0)}`;
  };
  // Une ligne est « remplie » si elle a un montant ou une description.
  const ligneRemplie = (l: any) => computeLigneMontant(l, cat) > 0 || (l.description && l.description.trim());

  // Détail par item
  for (const it of wanted) {
    ensure(40);
    doc.setTextColor(20, 20, 20); doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
    doc.text(it.name || 'Item', M, y);
    if (mode !== 'global_desc') { // prix par item masqué en mode « global »
      doc.setTextColor(17, 24, 39);
      doc.text(money(computeItemTotal(it, cat)), R, y, { align: 'right' });
    }
    y += 8; line(M, R, y); y += 14;

    // PRIX PAR ITEM : descriptions des lignes remplies (sans prix) ; le sous-total est en en-tête.
    if (mode === 'par_item') {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(90, 90, 90);
      for (const l of (it.lignes || [])) {
        if (!ligneRemplie(l)) continue;
        const d = l.description || catName(l.categorie);
        if (!d) continue;
        ensure(12); const dl = doc.splitTextToSize('• ' + String(d), R - M - 8); doc.text(dl, M + 8, y); y += 12 * dl.length;
      }
      y += 10; continue;
    }

    for (const c of CATS) {
      // Détaillé : seulement les lignes REMPLIES. global_desc : seulement celles avec description.
      const ls = (it.lignes || []).filter(l => l.categorie === c && (mode === 'global_desc' ? (l.description && l.description.trim()) : ligneRemplie(l)));
      if (!ls.length) continue;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(120, 120, 120);
      ensure(16); doc.text(String(catName(c) || c).toUpperCase(), M, y); y += 12;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(40, 40, 40);
      for (const l of ls) {
        const desc = l.description || catName(c);
        if (mode === 'global_desc') {
          ensure(13); const dl = doc.splitTextToSize(String(desc), R - M - 8); doc.text(dl, M + 8, y); y += 13 * Math.max(1, dl.length); continue;
        }
        // Détaillé : description + calcul inline + sous-total, sur la MÊME ligne.
        ensure(14);
        doc.setTextColor(40, 40, 40); doc.text(doc.splitTextToSize(String(desc), 190)[0] || '', M + 8, y);
        doc.setTextColor(120, 120, 120); doc.text(ligneCalcul(l), M + 205, y, { maxWidth: R - (M + 205) - 72 } as any);
        doc.setTextColor(20, 20, 20); doc.text(money(computeLigneMontant(l, cat)), R, y, { align: 'right' });
        y += 14;
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

  // Liste de taux (catalogue) — page optionnelle, mise en page pro.
  if (opts.includeTaux && cat) {
    doc.addPage(); y = M; drawHeader();
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(17, 24, 39);
    doc.text('Liste de taux', M, y); y += 8; line(M, R, y); y += 16;
    const row = (label: string, val: string) => {
      ensure(14); doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(31, 41, 55);
      doc.text(String(label), M, y); doc.text(String(val), R, y, { align: 'right' }); y += 14;
    };
    const head = (t: string) => { y += 6; ensure(16); doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(107, 114, 128); doc.text(t, M, y); y += 12; };
    row('Main-d’œuvre bureau', money(cat.taux_mo_bureau || 0) + ' /h');
    row('Main-d’œuvre chantier', money(cat.taux_mo_chantier || 0) + ' /h');
    row('Majoration temps supplémentaire', '× ' + (cat.mult_supp ?? 1.5));
    row('Majoration temps double', '× ' + (cat.mult_maj ?? 2));
    const ex: any = cat.extras || {};
    const exLabels: Record<string, string> = { km: 'Kilométrage (/km)', sub_h5: 'Subsistance 5h', sub_h12: 'Subsistance 12h', sub_h15: 'Subsistance 15h', sub_nuitee: 'Subsistance nuitée', hebergement: 'Hébergement', fuel_price: 'Carburant (/L)' };
    const exEntries = Object.keys(exLabels).filter(k => ex[k] != null);
    if (exEntries.length) { head('AUTRES TAUX'); for (const k of exEntries) row(exLabels[k], money(Number(ex[k]) || 0)); }
    const cr: any[] = (cat as any).custom_rates || [];
    if (cr.length) { head('TAUX PERSONNALISÉS'); for (const r of cr) row(r.label || '—', money(Number(r.value) || 0)); }
    y += 10;
  }

  // Total final (majoration appliquée)
  ensure(40); line(M, R, y); y += 16;
  const raw = computeSoumissionTotal(items, cat);
  const final = applyMarkup(raw, s.markup_pct);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(17, 24, 39);
  doc.text('TOTAL', M, y); doc.setTextColor(5, 150, 105); doc.text(money(final), R, y, { align: 'right' });
  y += 24;
  // Conditions & Modalités (page jointe) — seulement celles cochées à l'export.
  if (opts.conditions && opts.conditions.length) {
    doc.addPage(); y = M; drawHeader();
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(17, 24, 39);
    doc.text('Conditions et modalités', M, y); y += 8; line(M, R, y); y += 16;
    let n = 1;
    for (const c of opts.conditions) {
      ensure(28);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(17, 24, 39);
      const tl = doc.splitTextToSize(`${n}. ${c.titre || ''}`, R - M); doc.text(tl, M, y); y += 13 * tl.length + 2;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(55, 65, 81);
      const cl = doc.splitTextToSize(String(c.contenu || ''), R - M);
      for (const ln of cl) { ensure(13); doc.text(ln, M, y); y += 13; }
      y += 8; n++;
    }
  }

  // Pied de page numéroté sur toutes les pages (socle partagé).
  applyFooters(doc, `${opts.companyName || 'C-Secur360'} · ${s.numero || ''}`);

  const fname = opts.filename || `${s.numero || 'soumission'}.pdf`;

  // Pièces jointes PDF : fusionnées en fin de document via pdf-lib (jsPDF ne sait pas annexer).
  if (opts.attachments && opts.attachments.length) {
    try {
      const { PDFDocument } = await import('pdf-lib');
      const merged = await PDFDocument.load(doc.output('arraybuffer'));
      for (const a of opts.attachments) {
        try {
          const res = await fetch(a.url); const ab = await res.arrayBuffer();
          const ext = await PDFDocument.load(ab);
          const pages = await merged.copyPages(ext, ext.getPageIndices());
          pages.forEach(p => merged.addPage(p));
        } catch { /* pièce illisible : ignorée */ }
      }
      const out = await merged.save();
      const blob = new Blob([out], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = fname; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      return;
    } catch { /* échec fusion : on retombe sur l'export simple ci-dessous */ }
  }

  doc.save(fname);
}
