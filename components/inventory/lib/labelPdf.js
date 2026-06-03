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
    try { d = await QRCode.toDataURL(url || ' ', { margin: 0, width: 240, errorCorrectionLevel: 'M' }); } catch { d = null; }
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
    const qrSize = Math.min(fmt.labelH - 2 * pad, isSmall ? fmt.labelH - 2 * pad : fmt.labelW * 0.42);
    // QR à gauche
    const qrImg = await qrFor(label.url);
    if (qrImg) doc.addImage(qrImg, 'PNG', x + pad, y + pad, qrSize, qrSize);

    const tx = x + pad + qrSize + 6;
    const tw = x + fmt.labelW - pad - tx;
    let ty = y + pad + 9;
    // Logo en haut a droite (si place et grande etiquette)
    if (logo && !isSmall) {
      try { doc.addImage(logo, 'PNG', x + fmt.labelW - pad - 46, y + pad, 46, 14); } catch { /* ignore */ }
    }
    doc.setTextColor(20);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(isSmall ? 8 : 11);
    doc.text(truncate(doc, label.name, tw), tx, ty); ty += isSmall ? 9 : 13;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(isSmall ? 7 : 9); doc.setTextColor(80);
    if (label.code) { doc.text(truncate(doc, 'Code: ' + label.code, tw), tx, ty); ty += isSmall ? 8 : 11; }
    const mm = [];
    if (label.min != null && label.min !== '') mm.push('Min ' + label.min);
    if (label.max != null && label.max !== '') mm.push('Max ' + label.max);
    if (mm.length) { doc.text(truncate(doc, mm.join('  ·  '), tw), tx, ty); ty += isSmall ? 8 : 11; }
    if (label.location) { doc.text(truncate(doc, '📍 ' + label.location, tw), tx, ty); ty += isSmall ? 8 : 11; }
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

  doc.save(opts.filename || 'etiquettes-inventaire.pdf');
  return { placed, pages: page };
}
