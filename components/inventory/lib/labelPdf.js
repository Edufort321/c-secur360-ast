// #83 — Générateur PDF d'étiquettes d'inventaire (jsPDF + QR image).
// - 1..N étiquettes, copies par article, formats Avery (la quantité et la grille s'ajustent au format)
// - positions vides : on peut sauter des cases déjà utilisées sur une feuille entamée (page 1)
// - chaque étiquette : logo (tenant/défaut) + QR (URL publique /scan) + identification + min/max + emplacement
// Unités en points PDF (1 po = 72 pt). Page Lettre = 612 x 792.

import QRCode from 'qrcode';

const IN = 72;

// Géométrie des formats (mesures Avery standard, Lettre).
export const LABEL_FORMATS = {
  avery5160: {
    name: 'Avery 5160 / 8160', desc: '2,625 x 1 po — 30/feuille (3 x 10)',
    cols: 3, rows: 10, labelW: 2.625 * IN, labelH: 1 * IN,
    marginLeft: 0.18 * IN, marginTop: 0.5 * IN, pitchX: 2.75 * IN, pitchY: 1 * IN,
  },
  avery5163: {
    name: 'Avery 5163 / 8163', desc: '4 x 2 po — 10/feuille (2 x 5)',
    cols: 2, rows: 5, labelW: 4 * IN, labelH: 2 * IN,
    marginLeft: 0.156 * IN, marginTop: 0.5 * IN, pitchX: 4.19 * IN, pitchY: 2 * IN,
  },
  avery22806: {
    name: 'Avery 22806', desc: '2 x 2 po carré — 12/feuille (3 x 4)',
    cols: 3, rows: 4, labelW: 2 * IN, labelH: 2 * IN,
    marginLeft: 0.31 * IN, marginTop: 0.5 * IN, pitchX: 2.5 * IN, pitchY: 2.5 * IN,
  },
  avery5161: {
    name: 'Avery 5161 / 8161', desc: '4 x 1 po — 20/feuille (2 x 10)',
    cols: 2, rows: 10, labelW: 4 * IN, labelH: 1 * IN,
    marginLeft: 0.18 * IN, marginTop: 0.5 * IN, pitchX: 4.19 * IN, pitchY: 1 * IN,
  },
};

export function formatList() {
  return Object.entries(LABEL_FORMATS).map(([key, f]) => ({ key, name: f.name, desc: f.desc, perPage: f.cols * f.rows }));
}

// Charge une image (logo) en dataURL pour jsPDF. Retourne null si échec.
async function loadImageDataUrl(url) {
  if (!url) return null;
  if (url.startsWith('data:')) return url;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const r = new FileReader();
      r.onloadend = () => resolve(r.result);
      r.onerror = () => resolve(null);
      r.readAsDataURL(blob);
    });
  } catch { return null; }
}

function truncate(doc, text, maxW) {
  let t = String(text || '');
  if (doc.getTextWidth(t) <= maxW) return t;
  while (t.length > 1 && doc.getTextWidth(t + '…') > maxW) t = t.slice(0, -1);
  return t + '…';
}

// labels: [{ name, code, min, max, location, url }] (déjà étendu par copies)
// opts: { formatKey, skipPositions:Set<number>(page 1), logoUrl }
export async function generateLabelsPdf(labels, opts = {}) {
  const { default: jsPDF } = await import('jspdf');
  const fmt = LABEL_FORMATS[opts.formatKey] || LABEL_FORMATS.avery5160;
  const skip = opts.skipPositions instanceof Set ? opts.skipPositions : new Set(opts.skipPositions || []);
  const logo = await loadImageDataUrl(opts.logoUrl);

  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const perPage = fmt.cols * fmt.rows;

  // Pré-génère les QR en dataURL (un par étiquette).
  const qrCache = new Map();
  const qrFor = async (url) => {
    if (qrCache.has(url)) return qrCache.get(url);
    let d = null;
    // width plus élevé = image plus nette à l'impression (taille physique inchangée, ne déborde pas).
    // Quiet zone modeste (margin:2) ; EC 'M' garde des modules assez gros. Les bons scanners lisent déjà ces étiquettes.
    try { d = await QRCode.toDataURL(url || ' ', { margin: 2, width: 512, errorCorrectionLevel: 'M' }); } catch { d = null; }
    qrCache.set(url, d);
    return d;
  };

  let cell = 0;                 // index global de case (à travers les pages)
  let placed = 0;               // étiquettes posées
  let i = 0;                    // index dans labels
  let page = 0;

  const drawCellLabel = async (slotOnPage, label) => {
    const col = slotOnPage % fmt.cols;
    const row = Math.floor(slotOnPage / fmt.cols);
    const x = fmt.marginLeft + col * fmt.pitchX;
    const y = fmt.marginTop + row * fmt.pitchY;
    const pad = 6;
    const isSmall = fmt.labelH <= 1.05 * IN;     // 1 po de haut -> compact
    // Cadre « carte » (comme la carte QR Équipement) : léger rectangle arrondi autour de l'étiquette.
    doc.setDrawColor(203); doc.setLineWidth(0.7);
    doc.roundedRect(x + 1.5, y + 1.5, fmt.labelW - 3, fmt.labelH - 3, 6, 6, 'S');

    const qrBox = Math.min(fmt.labelH - 2 * pad, isSmall ? fmt.labelH - 2 * pad : fmt.labelW * 0.42);
    const qrInner = 4; // marge intérieure de la boîte QR (taille du QR inchangée -> ne déborde pas de l'étiquette)
    const qrSize = qrBox - 2 * qrInner;
    // Boîte blanche bordée autour du QR (style Équipement)
    doc.setDrawColor(180); doc.setLineWidth(0.6);
    doc.roundedRect(x + pad, y + pad, qrBox, qrBox, 3, 3, 'S');
    const qrImg = await qrFor(label.url);
    if (qrImg) doc.addImage(qrImg, 'PNG', x + pad + qrInner, y + pad + qrInner, qrSize, qrSize);

    const tx = x + pad + qrBox + 8;
    const tw = x + fmt.labelW - pad - tx;
    let ty = y + pad + 10;
    // Logo en haut a droite (si place et grande etiquette)
    if (logo && !isSmall) {
      try { doc.addImage(logo, 'PNG', x + fmt.labelW - pad - 46, y + pad, 46, 14); } catch { /* ignore */ }
    }
    doc.setTextColor(17, 24, 39);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(isSmall ? 8.5 : 12);
    doc.text(truncate(doc, label.name, tw), tx, ty); ty += isSmall ? 9.5 : 14;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(isSmall ? 7 : 9); doc.setTextColor(107, 114, 128);
    if (label.code) { doc.text(truncate(doc, 'Code : ' + label.code, tw), tx, ty); ty += isSmall ? 8.5 : 12; }
    if (label.location) { doc.text(truncate(doc, 'Emplacement : ' + label.location, tw), tx, ty); ty += isSmall ? 8.5 : 12; }
    const mm = [];
    if (label.min != null && label.min !== '') mm.push('Min ' + label.min);
    if (label.max != null && label.max !== '') mm.push('Max ' + label.max);
    if (mm.length) {
      // Pastille min/max façon badge
      doc.setTextColor(37, 99, 235); doc.setFont('helvetica', 'bold');
      doc.text(truncate(doc, mm.join('   ·   '), tw), tx, ty); ty += isSmall ? 8.5 : 12;
      doc.setFont('helvetica', 'normal');
    }
  };

  while (i < labels.length) {
    const slotOnPage = cell % perPage;
    if (slotOnPage === 0) { if (page > 0) doc.addPage(); page += 1; }
    // Sauter les cases marquées vides UNIQUEMENT sur la 1re page.
    const isFirstPage = page === 1;
    if (isFirstPage && skip.has(slotOnPage)) { cell += 1; continue; }
    await drawCellLabel(slotOnPage, labels[i]);
    placed += 1; i += 1; cell += 1;
  }

  // opts.print : ouvre directement le dialogue d'impression du navigateur sur le PDF (cadre + min/max
  // + nombre de copies EXACT), au lieu de window.print() de la page (qui imprimait en boucle).
  if (opts.print) {
    try {
      doc.autoPrint();
      const url = doc.output('bloburl');
      const w = window.open(url, '_blank');
      if (!w) { doc.save(opts.filename || 'etiquettes-inventaire.pdf'); } // popup bloqué -> repli téléchargement
    } catch { doc.save(opts.filename || 'etiquettes-inventaire.pdf'); }
  } else {
    doc.save(opts.filename || 'etiquettes-inventaire.pdf');
  }
  return { placed, pages: page };
}
