/**
 * Générateur PDF professionnel pour le module Projets.
 * Utilise jsPDF directement — aucun screenshot, données structurées.
 */

// ── Constantes de mise en page ──────────────────────────────────────────────
const PAGE_W = 210;
const PAGE_H = 297;
const ML = 15;        // marge gauche
const MR = 15;        // marge droite
const MT = 14;        // marge haute (après header)
const CW = PAGE_W - ML - MR;  // largeur contenu

const COL = {
  primary:   [15, 82, 186]  as [number,number,number],   // bleu
  dark:      [15, 23, 42]   as [number,number,number],   // slate-900
  gray:      [100, 116, 139] as [number,number,number],  // slate-500
  light:     [241, 245, 249] as [number,number,number],  // slate-100
  white:     [255, 255, 255] as [number,number,number],
  emerald:   [5, 150, 105]  as [number,number,number],
  amber:     [217, 119, 6]  as [number,number,number],
  red:       [220, 38, 38]  as [number,number,number],
};

type Doc = any; // jsPDF instance
const $ = (n: number) =>
  `${(Math.round(n * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $`;

// ── Chargement du logo en base64 ────────────────────────────────────────────
async function loadLogo(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch { return null; }
}

// ── En-tête de page ──────────────────────────────────────────────────────────
function drawHeader(doc: Doc, logo: string | null, title: string, subtitle: string) {
  // Bande bleue
  doc.setFillColor(...COL.dark);
  doc.rect(0, 0, PAGE_W, 22, 'F');

  // Logo
  if (logo) {
    try { doc.addImage(logo, 'PNG', ML, 4, 0, 14); } catch { /* ignore */ }
  }
  // Fallback texte si pas de logo
  else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...COL.white);
    doc.text('C-Secur360', ML, 14);
  }

  // Titre à droite
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COL.white);
  doc.text(title, PAGE_W - MR, 11, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(subtitle, PAGE_W - MR, 17, { align: 'right' });

  // Ligne fine sous le header
  doc.setDrawColor(...COL.primary);
  doc.setLineWidth(0.5);
  doc.line(0, 22, PAGE_W, 22);
}

// ── Pied de page ─────────────────────────────────────────────────────────────
function drawFooter(doc: Doc, pageNum: number, totalPages: number) {
  doc.setDrawColor(...COL.light);
  doc.setLineWidth(0.3);
  doc.line(ML, PAGE_H - 10, PAGE_W - MR, PAGE_H - 10);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COL.gray);
  doc.text('C-Secur360 · Document généré le ' + new Date().toLocaleDateString('fr-CA'), ML, PAGE_H - 6);
  doc.text(`Page ${pageNum} / ${totalPages}`, PAGE_W - MR, PAGE_H - 6, { align: 'right' });
}

// ── Titre de section ──────────────────────────────────────────────────────────
function sectionTitle(doc: Doc, label: string, y: number): number {
  doc.setFillColor(...COL.light);
  doc.rect(ML, y, CW, 6.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...COL.dark);
  doc.text(label.toUpperCase(), ML + 3, y + 4.5);
  return y + 6.5 + 2;
}

// ── Ligne clé/valeur ──────────────────────────────────────────────────────────
function kvRow(doc: Doc, label: string, value: string, x: number, y: number, colW: number) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COL.gray);
  doc.text(label, x, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COL.dark);
  doc.text(value || '—', x, y + 4);
  return y + 10;
}

// ── Ligne de tableau ──────────────────────────────────────────────────────────
function tableRow(
  doc: Doc, cells: { text: string; w: number; align?: 'left' | 'right' | 'center' }[],
  y: number, bg?: [number,number,number], textColor?: [number,number,number], bold?: boolean
) {
  const rowH = 6.5;
  if (bg) { doc.setFillColor(...bg); doc.rect(ML, y, CW, rowH, 'F'); }
  doc.setFont('helvetica', bold ? 'bold' : 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...(textColor ?? COL.dark));
  let x = ML;
  for (const c of cells) {
    const align = c.align || 'left';
    const tx = align === 'right' ? x + c.w - 2 : align === 'center' ? x + c.w / 2 : x + 2;
    doc.text(c.text, tx, y + 4.3, { align });
    x += c.w;
  }
  return y + rowH;
}

// ── Vérification nouvelle page ────────────────────────────────────────────────
function checkPage(doc: Doc, y: number, needed = 12): { doc: Doc; y: number; newPage: boolean } {
  if (y + needed > PAGE_H - 15) {
    doc.addPage();
    return { doc, y: 28, newPage: true };
  }
  return { doc, y, newPage: false };
}

// ══════════════════════════════════════════════════════════════════════════════
// ── ONGLET PROJET ─────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function buildProjet(doc: Doc, p: any, linkedAst: any[]): void {
  let y = 28;
  const statuses: Record<string, string> = { soumission: 'Soumission', 'en-cours': 'En cours', facture: 'Facturé' };

  y = sectionTitle(doc, 'Informations du projet', y);

  const cols = [CW / 3, CW / 3, CW / 3];
  const fields = [
    ['N° projet', p.project_number], ['Titre', p.title], ['Client', p.client_name],
    ['Lieu', p.location], ['N° dossier', p.dossier], ['N° soumission', p.submission_number],
    ['N° BC', p.po_number], ['Montant BC', p.po_amount != null ? $(Number(p.po_amount)) : null],
    ['Statut', statuses[p.status] || p.status], ['Type', p.project_type],
    ['Date soumission', p.date_submission], ['Début des travaux', p.date_work_start],
  ];

  let col = 0;
  let rowY = y;
  let maxY = y;
  fields.forEach(([label, val]) => {
    const x = ML + col * cols[0];
    kvRow(doc, label, val || '—', x, rowY, cols[0]);
    maxY = Math.max(maxY, rowY + 10);
    col++;
    if (col >= 3) { col = 0; rowY = maxY; maxY = rowY; }
  });
  y = maxY + 4;

  // AST liés
  if (linkedAst.length > 0) {
    ({ y } = checkPage(doc, y, 20));
    y = sectionTitle(doc, `AST liés (${linkedAst.length})`, y);
    const colW = [50, 30, CW - 80];
    y = tableRow(doc, [
      { text: 'N° AST', w: colW[0] }, { text: 'Statut', w: colW[1] }, { text: 'Date', w: colW[2] },
    ], y, COL.primary, COL.white, true);
    linkedAst.forEach((a, i) => {
      ({ y } = checkPage(doc, y));
      y = tableRow(doc, [
        { text: a.ast_number || a.id, w: colW[0] },
        { text: a.status || 'draft', w: colW[1] },
        { text: (a.created_at || '').slice(0, 10), w: colW[2] },
      ], y, i % 2 === 0 ? COL.white : COL.light);
    });
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// ── ONGLET SOUMISSION ─────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
async function buildSoumission(doc: Doc, p: any, tenant: string): Promise<void> {
  const { supabase } = await import('@/lib/supabase');
  const [{ data: ratesData }, { data: settingsData }] = await Promise.all([
    supabase.from('labor_rates').select('code, rate_regular, rate_overtime, rate_premium').eq('tenant_id', tenant).order('code'),
    supabase.from('rate_settings').select('category, key, value').eq('tenant_id', tenant),
  ]);
  const rates: any[] = ratesData || [];
  const settings: any[] = settingsData || [];
  const rateMap = Object.fromEntries(rates.map(r => [r.code, r]));
  const getSetting = (cat: string, key: string) => { const r = settings.find(s => s.category === cat && s.key === key); return r ? Number(r.value) : 0; };
  const sub = { h5: getSetting('subsistance', 'h5'), h12: getSetting('subsistance', 'h12'), h15: getSetting('subsistance', 'h15'), nuitee: getSetting('subsistance', 'nuitee') };
  const km = { camion: getSetting('km', 'camion'), remorque: getSetting('km', 'remorque'), degazeur: getSetting('km', 'degazeur') };
  const heb = getSetting('hebergement', 'vendant');

  const laborCost = (l: any, code: string) => {
    const r = rateMap[code]; if (!r) return 0;
    return (l.nbTech || 0) * ((l.hrsReg || 0) * Number(r.rate_regular) + (l.hrsSupp || 0) * Number(r.rate_overtime) + (l.hrsMaj || 0) * Number(r.rate_premium));
  };
  const voyCost = (l: any) => (l.nbTech || 0) * (l.km || 0) * (km[l.type as keyof typeof km] || 0);
  const subCost = (l: any) => (l.nbTech || 0) * ((l.h5 || 0) * sub.h5 + (l.h12 || 0) * sub.h12 + (l.h15 || 0) * sub.h15 + (l.nuitee || 0) * sub.nuitee);
  const hebCost = (l: any) => (l.nbTech || 0) * (l.nuits || 0) * heb;
  const matCost = (l: any) => (l.qte || 0) * (l.prixUnitaire || 0);
  const bureauT = (it: any) => laborCost(it.bureau.prepa, it.tauxType) + laborCost(it.bureau.gestion, it.tauxType) + laborCost(it.bureau.redaction, it.tauxType);
  const chantierT = (it: any) => (it.chantier || []).reduce((s: number, l: any) => s + laborCost(l, it.tauxType), 0);
  const voyT = (it: any) => (it.voyagement || []).reduce((s: number, l: any) => s + voyCost(l), 0);
  const subT = (it: any) => (it.subsistance || []).reduce((s: number, l: any) => s + subCost(l), 0);
  const hebT = (it: any) => (it.hebergement || []).reduce((s: number, l: any) => s + hebCost(l), 0);
  const matT = (it: any) => (it.materiaux || []).reduce((s: number, l: any) => s + matCost(l), 0);
  const itemSomme = (it: any) => bureauT(it) + chantierT(it) + voyT(it) + subT(it) + hebT(it) + matT(it);
  const itemFinal = (it: any) => it.prixSoumissionne != null ? it.prixSoumissionne : itemSomme(it);

  const estimate = p.estimate;
  const items: any[] = estimate?.items || [];
  const grand = items.reduce((s: number, it: any) => s + itemFinal(it), 0);

  const totals = items.reduce((acc: any, it: any) => {
    acc.bureau += bureauT(it); acc.chantier += chantierT(it);
    acc.voyagement += voyT(it); acc.subsistance += subT(it);
    acc.hebergement += hebT(it); acc.materiaux += matT(it);
    return acc;
  }, { bureau: 0, chantier: 0, voyagement: 0, subsistance: 0, hebergement: 0, materiaux: 0 });

  let y = 28;

  // ── Synthèse par type ────────────────────────────────────────────────────
  y = sectionTitle(doc, 'Synthèse par type de coût', y);
  const typeRows = [
    { label: "Main-d'œuvre — bureau",    value: totals.bureau,      color: [109, 40, 217] as [number,number,number] },
    { label: "Main-d'œuvre — chantier",  value: totals.chantier,    color: [37, 99, 235] as [number,number,number] },
    { label: 'Voyagement',               value: totals.voyagement,  color: [217, 119, 6] as [number,number,number] },
    { label: 'Subsistance',              value: totals.subsistance, color: [234, 88, 12] as [number,number,number] },
    { label: 'Hébergement',              value: totals.hebergement, color: [219, 39, 119] as [number,number,number] },
    { label: 'Matériaux',                value: totals.materiaux,   color: [5, 150, 105] as [number,number,number] },
  ];
  const barSum = Object.values(totals).reduce((a: number, b: any) => a + (Number(b) || 0), 0);

  typeRows.forEach((row, i) => {
    ({ y } = checkPage(doc, y));
    const bg = i % 2 === 0 ? COL.white : COL.light;
    doc.setFillColor(...bg);
    doc.rect(ML, y, CW, 6.5, 'F');
    // Barre colorée sur le côté gauche
    doc.setFillColor(...row.color);
    doc.rect(ML, y, 3, 6.5, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COL.dark);
    doc.text(row.label, ML + 5, y + 4.3);
    doc.setFont('helvetica', 'bold');
    doc.text($(row.value), PAGE_W - MR - 2, y + 4.3, { align: 'right' });
    if (barSum > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COL.gray);
      doc.text(`${((row.value / barSum) * 100).toFixed(0)}%`, PAGE_W - MR - 26, y + 4.3, { align: 'right' });
    }
    y += 6.5;
  });

  // Total synthèse
  doc.setFillColor(...COL.dark);
  doc.rect(ML, y, CW, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COL.white);
  doc.text('TOTAL SOUMISSION', ML + 3, y + 4.8);
  doc.text($(grand), PAGE_W - MR - 2, y + 4.8, { align: 'right' });
  y += 7 + 6;

  // ── Détail par item ──────────────────────────────────────────────────────
  if (items.length > 0) {
    ({ y } = checkPage(doc, y, 20));
    y = sectionTitle(doc, 'Détail par item', y);

    // En-tête tableau
    const cw = [CW - 100, 20, 20, 20, 20, 20] as const;
    y = tableRow(doc, [
      { text: 'Item', w: cw[0] },
      { text: 'MO Bur.', w: cw[1], align: 'right' },
      { text: 'MO Chan.', w: cw[2], align: 'right' },
      { text: 'Voy.', w: cw[3], align: 'right' },
      { text: 'Sub.+Héb.', w: cw[4], align: 'right' },
      { text: 'Total', w: cw[5], align: 'right' },
    ], y, COL.primary, COL.white, true);

    items.forEach((it: any, i: number) => {
      ({ y } = checkPage(doc, y));
      const final = itemFinal(it);
      const override = it.prixSoumissionne != null;
      y = tableRow(doc, [
        { text: it.nom + (override ? ' *' : ''), w: cw[0] },
        { text: bureauT(it) > 0 ? $(bureauT(it)) : '—', w: cw[1], align: 'right' },
        { text: chantierT(it) > 0 ? $(chantierT(it)) : '—', w: cw[2], align: 'right' },
        { text: voyT(it) > 0 ? $(voyT(it)) : '—', w: cw[3], align: 'right' },
        { text: (subT(it) + hebT(it)) > 0 ? $((subT(it) + hebT(it))) : '—', w: cw[4], align: 'right' },
        { text: $(final), w: cw[5], align: 'right' },
      ], y, i % 2 === 0 ? COL.white : COL.light, undefined, false);
    });

    // Total
    doc.setFillColor(...COL.dark);
    doc.rect(ML, y, CW, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...COL.white);
    doc.text('TOTAL', ML + 3, y + 4.8);
    doc.text($(grand), PAGE_W - MR - 2, y + 4.8, { align: 'right' });
    y += 7;

    if (items.some((it: any) => it.prixSoumissionne != null)) {
      y += 4;
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...COL.gray);
      doc.text('* Prix soumissionné (override manuel appliqué)', ML, y);
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// ── ONGLET FEUILLE DE TEMPS ───────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
async function buildTemps(doc: Doc, p: any, tenant: string): Promise<void> {
  const { supabase } = await import('@/lib/supabase');
  const [{ data: ratesData }, { data: settingsData }] = await Promise.all([
    supabase.from('labor_rates').select('code, rate_regular, rate_overtime, rate_premium').eq('tenant_id', tenant),
    supabase.from('rate_settings').select('value').eq('tenant_id', tenant).eq('category', 'km').limit(1),
  ]);
  const rateMap = Object.fromEntries((ratesData || []).map((r: any) => [r.code, r]));
  const kmRate = settingsData?.[0] ? Number(settingsData[0].value) : 0;

  const laborCost = (e: any) => {
    const r = rateMap[e.rateCode]; if (!r) return 0;
    return (e.hrsReg || 0) * Number(r.rate_regular) + (e.hrsSupp || 0) * Number(r.rate_overtime) + (e.hrsMaj || 0) * Number(r.rate_premium);
  };
  const rowCost = (e: any) => laborCost(e) + (e.km || 0) * kmRate + (e.materiel || 0);

  const actuals = p.actuals;
  const entries: any[] = actuals?.entries || [];
  const total = entries.reduce((s: number, e: any) => s + rowCost(e), 0);

  let y = 28;
  y = sectionTitle(doc, 'Feuille de temps — coûts réels', y);

  if (entries.length === 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...COL.gray);
    doc.text('Aucune entrée enregistrée.', ML + 3, y + 5);
    return;
  }

  const cw = [28, CW - 28 - 16 - 12 - 12 - 12 - 14 - 20, 16, 12, 12, 12, 14, 20] as const;
  y = tableRow(doc, [
    { text: 'Date', w: cw[0] },
    { text: 'Description', w: cw[1] },
    { text: 'Taux', w: cw[2] },
    { text: 'Rég', w: cw[3], align: 'right' },
    { text: 'Supp', w: cw[4], align: 'right' },
    { text: 'Maj', w: cw[5], align: 'right' },
    { text: 'Km', w: cw[6], align: 'right' },
    { text: 'Montant', w: cw[7], align: 'right' },
  ], y, COL.primary, COL.white, true);

  entries.forEach((e: any, i: number) => {
    ({ y } = checkPage(doc, y));
    y = tableRow(doc, [
      { text: e.date || '—', w: cw[0] },
      { text: e.desc || '—', w: cw[1] },
      { text: e.rateCode || '—', w: cw[2] },
      { text: String(e.hrsReg || 0), w: cw[3], align: 'right' },
      { text: String(e.hrsSupp || 0), w: cw[4], align: 'right' },
      { text: String(e.hrsMaj || 0), w: cw[5], align: 'right' },
      { text: String(e.km || 0), w: cw[6], align: 'right' },
      { text: $(rowCost(e)), w: cw[7], align: 'right' },
    ], y, i % 2 === 0 ? COL.white : COL.light);
  });

  doc.setFillColor(...COL.dark);
  doc.rect(ML, y, CW, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COL.white);
  doc.text('TOTAL RÉEL', ML + 3, y + 4.8);
  doc.text($(total), PAGE_W - MR - 2, y + 4.8, { align: 'right' });
}

// ══════════════════════════════════════════════════════════════════════════════
// ── ONGLET COÛTS ──────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function buildCouts(doc: Doc, p: any): void {
  const est = Number(p.estimate?.total || 0);
  const real = Number(p.actuals?.total || 0);
  const facture = Number(p.po_amount || 0);
  const ecart = real - est;
  const ecartPct = est > 0 ? (ecart / est) * 100 : 0;
  const marge = facture - real;
  const margePct = facture > 0 ? (marge / facture) * 100 : 0;

  let y = 28;
  y = sectionTitle(doc, 'Analyse des coûts', y);
  y += 3;

  const cardW = (CW - 6) / 2;
  const cards = [
    { label: 'Estimé (soumission)', value: $(est), note: '', color: COL.primary },
    { label: 'Réel (feuille de temps)', value: $(real), note: '', color: COL.primary },
    { label: 'Écart réel vs estimé', value: (ecart >= 0 ? '+' : '') + $(ecart), note: `${ecartPct >= 0 ? '+' : ''}${ecartPct.toFixed(1)} %`, color: ecart > 0 ? COL.red : COL.emerald },
    { label: 'Montant facturé (BC)', value: $(facture), note: '', color: COL.primary },
  ];

  const startX = [ML, ML + cardW + 3];
  let row = 0;
  cards.forEach((c, i) => {
    const x = startX[i % 2];
    const cy = y + row * 32;
    doc.setFillColor(...COL.light);
    doc.rect(x, cy, cardW, 28, 'F');
    doc.setFillColor(...c.color);
    doc.rect(x, cy, 3, 28, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COL.gray);
    doc.text(c.label, x + 6, cy + 8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...c.color);
    doc.text(c.value, x + 6, cy + 18);
    if (c.note) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...COL.gray);
      doc.text(c.note, x + 6, cy + 24);
    }
    if (i % 2 === 1) row++;
  });
  y += row * 32 + 32 + 8;

  // Marge
  ({ y } = checkPage(doc, y, 30));
  y = sectionTitle(doc, 'Marge du projet', y);
  y += 3;
  doc.setFillColor(...COL.light);
  doc.rect(ML, y, CW, 20, 'F');
  doc.setFillColor(...(marge >= 0 ? COL.emerald : COL.red));
  doc.rect(ML, y, 3, 20, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COL.gray);
  doc.text('Facturé − Réel' + (facture > 0 ? ` · ${margePct.toFixed(1)} %` : ''), ML + 6, y + 7);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...(marge >= 0 ? COL.emerald : COL.red));
  doc.text($(marge), ML + 6, y + 15);
}

// ══════════════════════════════════════════════════════════════════════════════
// ── ONGLET FACTURE ────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function buildFacture(doc: Doc, p: any, logo: string | null): void {
  const f = p.facture || {};
  const TPS = f.tps ? 0.05 : 0;
  const TVQ = f.tvq ? 0.09975 : 0;

  // Mode : soumission ou temps
  const base = f.mode === 'soumission'
    ? Number(p.estimate?.total || 0)
    : Number(p.actuals?.total || 0);
  const extras: any[] = f.extras || [];
  const extrasTotal = extras.reduce((s: number, e: any) => s + Number(e.amount || 0), 0);
  const subtotal = base + extrasTotal;
  const tpsMnt = subtotal * TPS;
  const tvqMnt = subtotal * TVQ;
  const total = subtotal + tpsMnt + tvqMnt;

  let y = 28;

  // Logo dans la facture
  if (logo) {
    try { doc.addImage(logo, 'PNG', ML, y, 0, 16); } catch {}
  }

  // Métadonnées facture (droite)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...COL.dark);
  doc.text('FACTURE', PAGE_W - MR, y + 10, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COL.gray);
  if (f.invoice_number) { doc.text('N° ' + f.invoice_number, PAGE_W - MR, y + 17, { align: 'right' }); }
  doc.text('Date : ' + (f.invoice_date || new Date().toISOString().slice(0, 10)), PAGE_W - MR, y + 23, { align: 'right' });
  if (f.approved) {
    doc.setFontSize(8);
    doc.setTextColor(...COL.emerald);
    doc.text('✓ APPROUVÉE', PAGE_W - MR, y + 29, { align: 'right' });
  }
  y += 30;

  // Séparateur
  doc.setDrawColor(...COL.light);
  doc.setLineWidth(0.4);
  doc.line(ML, y, PAGE_W - MR, y);
  y += 5;

  // Infos projet/client côte à côte
  const halfW = CW / 2 - 5;
  doc.setFillColor(...COL.light);
  doc.rect(ML, y, halfW, 28, 'F');
  doc.rect(ML + halfW + 5, y, halfW, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COL.gray);
  doc.text('PROJET', ML + 3, y + 6);
  doc.text('CLIENT', ML + halfW + 8, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COL.dark);
  doc.text(`#${p.project_number || '—'} — ${p.title || 'Sans titre'}`, ML + 3, y + 13);
  doc.text(p.client_name || '—', ML + halfW + 8, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COL.gray);
  if (p.location) doc.text(p.location, ML + 3, y + 19);
  if (p.po_number) doc.text('BC : ' + p.po_number, ML + halfW + 8, y + 19);
  if (p.date_work_start) doc.text('Début : ' + p.date_work_start, ML + 3, y + 25);
  if (p.submission_number) doc.text('Soum. : ' + p.submission_number, ML + halfW + 8, y + 25);
  y += 33;

  // Tableau des lignes
  const cw = [CW - 38, 38];
  y = tableRow(doc, [
    { text: 'Description', w: cw[0] },
    { text: 'Montant', w: cw[1], align: 'right' },
  ], y, COL.dark, COL.white, true);

  // Ligne de base (soumission ou temps)
  const baseLabel = f.mode === 'soumission' ? 'Soumission approuvée' : 'Feuille de temps (coût réel)';
  y = tableRow(doc, [
    { text: baseLabel, w: cw[0] },
    { text: $(base), w: cw[1], align: 'right' },
  ], y, COL.white);

  // Extras
  extras.forEach((ex: any, i: number) => {
    ({ y } = checkPage(doc, y));
    y = tableRow(doc, [
      { text: ex.desc || `Extra ${i + 1}`, w: cw[0] },
      { text: $(Number(ex.amount || 0)), w: cw[1], align: 'right' },
    ], y, COL.light);
  });

  if (extras.length > 0) {
    ({ y } = checkPage(doc, y));
    y = tableRow(doc, [
      { text: 'Sous-total', w: cw[0] },
      { text: $(subtotal), w: cw[1], align: 'right' },
    ], y, COL.light, COL.gray, false);
  }

  // Totaux
  y += 4;
  const totW = 80;
  const totX = PAGE_W - MR - totW;
  const totRows = [
    { label: 'Sous-total', value: $(subtotal), bold: false },
    ...(f.tps ? [{ label: 'TPS (5%)', value: $(tpsMnt), bold: false }] : []),
    ...(f.tvq ? [{ label: 'TVQ (9,975%)', value: $(tvqMnt), bold: false }] : []),
    { label: 'TOTAL', value: $(total), bold: true },
  ];
  totRows.forEach(row => {
    ({ y } = checkPage(doc, y));
    if (row.bold) doc.setFillColor(...COL.dark); else doc.setFillColor(...COL.light);
    doc.rect(totX, y, totW, 7, 'F');
    doc.setFont('helvetica', row.bold ? 'bold' : 'normal');
    doc.setFontSize(row.bold ? 9 : 8);
    if (row.bold) doc.setTextColor(...COL.white); else doc.setTextColor(...COL.dark);
    doc.text(row.label, totX + 3, y + 4.7);
    doc.text(row.value, PAGE_W - MR - 2, y + 4.7, { align: 'right' });
    y += 7;
  });

  // Notes
  if (f.notes) {
    y += 8;
    ({ y } = checkPage(doc, y, 20));
    doc.setDrawColor(...COL.light);
    doc.setLineWidth(0.3);
    doc.line(ML, y, PAGE_W - MR, y);
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...COL.gray);
    doc.text('NOTES / CONDITIONS', ML, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...COL.dark);
    const lines = doc.splitTextToSize(f.notes, CW) as string[];
    doc.text(lines, ML, y);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// ── POINT D'ENTRÉE PUBLIC ──────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
export async function exportProjectPdf(options: {
  tab: 'projet' | 'soumission' | 'temps' | 'couts' | 'facture';
  project: any;
  tenant: string;
  tenantLogoUrl?: string | null;
  linkedAst?: any[];
}) {
  const { default: jsPDF } = await import('jspdf');
  const doc: Doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const logoUrl = options.tenantLogoUrl || '/logo.png';
  const logo = await loadLogo(logoUrl);

  const p = options.project;
  const tabLabels: Record<string, string> = {
    projet: 'Détails du projet', soumission: 'Soumission', temps: 'Feuille de temps',
    couts: 'Analyse des coûts', facture: 'Facture',
  };

  const subtitle = `Projet #${p?.project_number || '—'}  ·  ${p?.client_name || options.tenant}  ·  ${new Date().toLocaleDateString('fr-CA')}`;

  // Dessiner contenu selon onglet
  if (options.tab === 'facture') {
    // La facture a son propre header intégré
    drawHeader(doc, logo, tabLabels[options.tab], subtitle);
    buildFacture(doc, p, logo);
  } else {
    drawHeader(doc, logo, tabLabels[options.tab], subtitle);
    if (options.tab === 'projet') buildProjet(doc, p, options.linkedAst || []);
    else if (options.tab === 'soumission') await buildSoumission(doc, p, options.tenant);
    else if (options.tab === 'temps') await buildTemps(doc, p, options.tenant);
    else if (options.tab === 'couts') buildCouts(doc, p);
  }

  // Numérotation des pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc, i, totalPages);
  }

  const fname = `${options.tab}-projet-${p?.project_number || 'draft'}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fname);
}

// ══════════════════════════════════════════════════════════════════════════════
// ── RAPPORT COMPLET (toutes sections) ────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
export async function exportFullReportPdf(options: {
  project: any;
  tenant: string;
  tenantLogoUrl?: string | null;
  linkedAst?: any[];
}): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const doc: Doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const p = options.project;
  const logo = await loadLogo(options.tenantLogoUrl || '/logo.png');
  const subtitle = `Projet #${p?.project_number || '—'} · ${p?.client_name || options.tenant} · ${new Date().toLocaleDateString('fr-CA')}`;

  // ── Page 1 — Couverture / Sommaire exécutif ────────────────────────────────
  drawHeader(doc, logo, 'Rapport de projet', subtitle);

  // Zone titre projet (rectangle foncé + texte blanc)
  let y = 35;
  doc.setFillColor(...COL.dark);
  doc.rect(0, y, PAGE_W, 18, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COL.white);
  doc.text(p?.title || 'Sans titre', PAGE_W / 2, y + 11.5, { align: 'center' });
  y += 22;

  // Infos client / lieu / dates (2 colonnes)
  const halfW = CW / 2;
  const col2 = [
    ['Client', p?.client_name || '—'],
    ['Lieu', p?.location || '—'],
  ];
  const col2R = [
    ['Date soumission', p?.date_submission || '—'],
    ['Début des travaux', p?.date_work_start || '—'],
  ];
  col2.forEach(([label, val], i) => {
    kvRow(doc, label, val, ML, y + i * 11, halfW);
  });
  col2R.forEach(([label, val], i) => {
    kvRow(doc, label, val, ML + halfW, y + i * 11, halfW);
  });
  y += 28;

  // ── 4 cartes statistiques ──────────────────────────────────────────────────
  y = Math.max(y, 85);
  const cardW4 = (CW - 9) / 4;
  const estTotal = Number(p?.estimate?.total || 0);
  const realTotal = Number(p?.actuals?.total || 0);
  const poAmount = Number(p?.po_amount || 0);
  const marge4 = poAmount - realTotal;
  const cards4 = [
    { label: 'Total soumission', value: estTotal != null ? $(estTotal) : '—', color: COL.primary },
    { label: 'Coût réel',        value: realTotal != null ? $(realTotal) : '—', color: COL.primary },
    { label: 'Montant BC',       value: poAmount ? $(poAmount) : '—', color: COL.primary },
    { label: 'Marge',            value: $(marge4), color: marge4 >= 0 ? COL.emerald : COL.red },
  ];
  cards4.forEach((c, i) => {
    const x = ML + i * (cardW4 + 3);
    doc.setFillColor(...COL.light);
    doc.rect(x, y, cardW4, 22, 'F');
    doc.setFillColor(...c.color);
    doc.rect(x, y, cardW4, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...c.color);
    doc.text(c.value, x + cardW4 / 2, y + 14, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...COL.gray);
    doc.text(c.label, x + cardW4 / 2, y + 19.5, { align: 'center' });
  });
  y += 30;

  // ── Table des matières ─────────────────────────────────────────────────────
  y = Math.max(y, 130);
  y = sectionTitle(doc, 'Table des matières', y);
  const tocSections = [
    '1.  Détails du projet',
    '2.  Soumission',
    '3.  Feuille de temps',
    '4.  Analyse des coûts',
    ...(p?.facture?.approved === true ? ['5.  Facture'] : []),
  ];
  tocSections.forEach((s, i) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COL.dark);
    doc.text(s, ML + 5, y + 6 + i * 8);
  });

  // ── Page 2 — Détails du projet ────────────────────────────────────────────
  doc.addPage();
  drawHeader(doc, logo, 'Détails du projet', subtitle);
  buildProjet(doc, p, options.linkedAst || []);

  // ── Page 3+ — Soumission ──────────────────────────────────────────────────
  doc.addPage();
  drawHeader(doc, logo, 'Soumission', subtitle);
  await buildSoumission(doc, p, options.tenant);

  // ── Page suivante — Feuille de temps ─────────────────────────────────────
  doc.addPage();
  drawHeader(doc, logo, 'Feuille de temps', subtitle);
  await buildTemps(doc, p, options.tenant);

  // ── Page suivante — Analyse des coûts ────────────────────────────────────
  doc.addPage();
  drawHeader(doc, logo, 'Analyse des coûts', subtitle);
  buildCouts(doc, p);

  // ── Page suivante — Facture (seulement si approuvée) ─────────────────────
  if (p?.facture?.approved === true) {
    doc.addPage();
    buildFacture(doc, p, logo);
  }

  // ── Numérotation des pages ────────────────────────────────────────────────
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc, i, totalPages);
  }

  const fname = `rapport-complet-${p?.project_number || 'draft'}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fname);
}

// ══════════════════════════════════════════════════════════════════════════════
// ── LISTE DES PROJETS ────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
export async function exportProjectListPdf(options: {
  projects: any[];
  tenant: string;
  tenantLogoUrl?: string | null;
}) {
  const { default: jsPDF } = await import('jspdf');
  const doc: Doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const logo = await loadLogo(options.tenantLogoUrl || '/logo.png');
  const { projects, tenant } = options;

  const stats = {
    total: projects.length,
    soumission: projects.filter(p => p.status === 'soumission').length,
    encours: projects.filter(p => p.status === 'en-cours').length,
    facture: projects.filter(p => p.status === 'facture').length,
  };

  drawHeader(doc, logo, 'Liste des projets', `${tenant} · ${projects.length} projet(s) · ${new Date().toLocaleDateString('fr-CA')}`);

  let y = 28;

  // Statistiques
  y = sectionTitle(doc, 'Statistiques', y);
  const cardW = (CW - 9) / 4;
  [
    { label: 'Total', value: stats.total, color: COL.dark },
    { label: 'Soumissions', value: stats.soumission, color: COL.amber },
    { label: 'En cours', value: stats.encours, color: COL.primary },
    { label: 'Facturés', value: stats.facture, color: COL.emerald },
  ].forEach((s, i) => {
    const x = ML + i * (cardW + 3);
    doc.setFillColor(...COL.light);
    doc.rect(x, y, cardW, 18, 'F');
    doc.setFillColor(...s.color);
    doc.rect(x, y, cardW, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...s.color);
    doc.text(String(s.value), x + cardW / 2, y + 12, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COL.gray);
    doc.text(s.label, x + cardW / 2, y + 16.5, { align: 'center' });
  });
  y += 22;

  // Tableau projets
  y = sectionTitle(doc, 'Projets', y);
  const STATUS_LABELS: Record<string, string> = { soumission: 'Soumission', 'en-cours': 'En cours', facture: 'Facturé' };
  const cw = [22, CW - 22 - 35 - 28 - 28 - 25, 35, 28, 28, 25];
  y = tableRow(doc, [
    { text: 'N°', w: cw[0] },
    { text: 'Titre', w: cw[1] },
    { text: 'Client', w: cw[2] },
    { text: 'Statut', w: cw[3] },
    { text: 'BC ($)', w: cw[4], align: 'right' },
    { text: 'Début', w: cw[5] },
  ], y, COL.primary, COL.white, true);

  projects.forEach((p, i) => {
    ({ y } = checkPage(doc, y));
    y = tableRow(doc, [
      { text: p.project_number || '—', w: cw[0] },
      { text: p.title || 'Sans titre', w: cw[1] },
      { text: p.client_name || '—', w: cw[2] },
      { text: STATUS_LABELS[p.status || 'soumission'] || '—', w: cw[3] },
      { text: p.po_amount != null ? $(Number(p.po_amount)) : '—', w: cw[4], align: 'right' },
      { text: p.date_work_start || '—', w: cw[5] },
    ], y, i % 2 === 0 ? COL.white : COL.light);
  });

  if (projects.length === 0) {
    doc.setFontSize(9); doc.setFont('helvetica', 'italic'); doc.setTextColor(...COL.gray);
    doc.text('Aucun projet.', ML + 3, y + 6);
  }

  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc, i, totalPages);
  }

  doc.save(`projets-${tenant}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
