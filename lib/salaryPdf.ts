// Génération PDF — fiches de poste (grille salariale) et fiches d'évaluation.
// Importé dynamiquement (await import('@/lib/salaryPdf')) pour garder jspdf
// hors du bundle initial des pages admin.
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const money = (n: number) => `${(Math.round((n || 0) * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2 })} $`;
const lastY = (doc: jsPDF, fallback: number) => (doc as any).lastAutoTable?.finalY ?? fallback;

type Tr = (fr: string, en: string) => string;
type Logo = { data: string; w: number; h: number };

// Charge une image (URL locale ou distante) en dataURL pour jsPDF. null si échec/CORS.
async function loadImageData(url: string): Promise<Logo | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const data: string = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
    const dims = await new Promise<{ w: number; h: number }>(resolve => {
      const img = new Image();
      img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
      img.onerror = () => resolve({ w: 0, h: 0 });
      img.src = data;
    });
    return dims.w ? { data, w: dims.w, h: dims.h } : null;
  } catch { return null; }
}

// Logo en haut à gauche : tenant si fourni, sinon logo C-Secur360 par défaut.
// Retourne l'abscisse à laquelle commencer le titre.
async function drawLogo(doc: jsPDF, logoUrl: string | undefined, x: number, topY: number): Promise<number> {
  let logo = logoUrl ? await loadImageData(logoUrl) : null;
  if (!logo) logo = await loadImageData('/c-secur360-logo.png');
  if (!logo) return x;
  const h = 36;
  const w = Math.min((logo.w / logo.h) * h, 150);
  const fmt = logo.data.includes('image/png') ? 'PNG' : 'JPEG';
  try { doc.addImage(logo.data, fmt, x, topY, w, h); } catch { return x; }
  return x + w + 14;
}

// ─── Fiche de poste : config, paliers, formulaire de compétences, primes ──────
export async function exportPostePdf(opts: {
  tr: Tr; dateStr: string; posteName: string; logoUrl?: string;
  grid: any; tiers: any[]; skillForm: { types: any[] } | null;
  bonuses: { label: string; amount: number; unit: 'fixed' | 'pct' }[];
}) {
  const { tr, dateStr, posteName, logoUrl, grid, tiers, skillForm, bonuses } = opts;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const M = 40;
  let y = 48;

  const tx = await drawLogo(doc, logoUrl, M, y - 16);
  doc.setFontSize(16); doc.setTextColor(30);
  doc.text(tr('Fiche de poste', 'Position sheet'), tx, y);
  doc.setFontSize(13); doc.setTextColor(37, 99, 235);
  doc.text(posteName || '—', tx, y + 18);
  doc.setFontSize(9); doc.setTextColor(120);
  doc.text(`${tr('Généré le', 'Generated on')} ${dateStr}`, tx, y + 32);
  y += 50;

  const useGrid = grid?.use_skill_grid !== false;
  const modeLbl = useGrid
    ? (grid?.mode === 'percentage' ? tr('% annuel', '% annual') : grid?.mode === 'fixed' ? tr('$ fixe', 'Fixed $') : tr('Personnalisé', 'Custom'))
    : tr('Salaire fixe (sans grille)', 'Fixed salary (no grid)');

  autoTable(doc, {
    startY: y,
    theme: 'grid', styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [59, 130, 246] },
    head: [[tr('Paramètre', 'Parameter'), tr('Valeur', 'Value')]],
    body: [
      [tr('Nom de la grille', 'Grid name'), grid?.name || '—'],
      [tr('Type', 'Type'), modeLbl],
      [tr('Salaire de base', 'Base salary'), `${money(grid?.base_salary || 0)} (${money((grid?.base_salary || 0) / (grid?.hours_per_year || 2080))}/h)`],
      [tr('Coût de la vie', 'Cost of living'), `${grid?.cola_pct || 0} %`],
      [tr('Heures / an', 'Hours / yr'), String(grid?.hours_per_year || 2080)],
    ],
  });
  y = lastY(doc, y) + 18;

  // Paliers (uniquement si grille de compétences)
  if (useGrid && tiers?.length) {
    doc.setFontSize(11); doc.setTextColor(30);
    doc.text(tr('Paliers de progression', 'Progression tiers'), M, y); y += 6;
    autoTable(doc, {
      startY: y, theme: 'striped', styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [16, 185, 129] },
      head: [['#', tr('Palier', 'Tier'), tr('Salaire annuel', 'Annual salary'), tr('Taux/h', 'Hourly'), tr('Note min', 'Min score'), tr('Min mois', 'Min months')]],
      body: tiers.map((t: any) => [t.tier_level, t.tier_name || '—', money(t.annual_salary || 0), `${(t.hourly_rate || 0).toFixed(2)} $`, `${t.min_score ?? 0} %`, String(t.min_months_experience ?? 0)]),
    });
    y = lastY(doc, y) + 18;
  }

  // Formulaire de compétences
  if (useGrid && skillForm?.types?.length) {
    doc.setFontSize(11); doc.setTextColor(30);
    doc.text(tr("Formulaire d'évaluation des compétences", 'Skill evaluation form'), M, y); y += 6;
    const body: any[] = [];
    skillForm.types.forEach((ty: any) => {
      body.push([{ content: `${ty.name}  —  ${tr('pond.', 'weight')} ${ty.weight}%  ·  ${ty.mode === 'pct' ? '%' : '/' + ty.max}`, colSpan: 2, styles: { fontStyle: 'bold', fillColor: [243, 232, 255] } }]);
      (ty.skills || []).forEach((s: any) => body.push([`   ${s.name || '—'}`, `${s.weight || 1} %`]));
    });
    autoTable(doc, {
      startY: y, theme: 'grid', styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [139, 92, 246] },
      head: [[tr('Compétence', 'Skill'), tr('Poids', 'Weight')]],
      body,
    });
    y = lastY(doc, y) + 18;
  }

  // Primes discrétionnaires
  if (bonuses?.length) {
    doc.setFontSize(11); doc.setTextColor(30);
    doc.text(tr('Primes discrétionnaires', 'Discretionary bonuses'), M, y); y += 6;
    autoTable(doc, {
      startY: y, theme: 'grid', styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [124, 58, 237] },
      head: [[tr('Prime', 'Bonus'), tr('Montant', 'Amount')]],
      body: bonuses.map(b => [b.label, b.unit === 'pct' ? `${b.amount} %` : money(b.amount)]),
    });
    y = lastY(doc, y) + 18;
  }

  // Commission
  if (grid?.commission_enabled) {
    doc.setFontSize(11); doc.setTextColor(30);
    doc.text(tr('Commission sur ventes', 'Sales commission'), M, y); y += 6;
    autoTable(doc, {
      startY: y, theme: 'grid', styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [217, 119, 6] },
      head: [[tr('Paramètre', 'Parameter'), tr('Valeur', 'Value')]],
      body: [
        [tr('% par défaut', 'Default %'), `${grid.commission_pct || 0} %`],
        [tr('Base de calcul', 'Basis'), String(grid.commission_basis || 'gross')],
        [tr('Seuil min.', 'Min threshold'), money(grid.commission_threshold || 0)],
        [tr('Plafond annuel', 'Annual cap'), grid.commission_cap ? money(grid.commission_cap) : tr('Aucun', 'None')],
      ],
    });
  }

  doc.save(`${tr('fiche-poste', 'position-sheet')}-${(posteName || 'poste').replace(/\s+/g, '_')}.pdf`);
}

// ─── Fiche d'évaluation d'un employé ──────────────────────────────────────────
export async function exportEvaluationPdf(opts: {
  tr: Tr; dateStr: string; employeeName: string; posteName: string; evaluatedBy: string; logoUrl?: string;
  useGrid: boolean; globalScore: number; tierName: string; tierMinScore: number;
  skillForm: { types: any[] } | null; scores: Record<string, number>; byType: Record<string, number>;
  salaryBefore: number; salaryAfter: number; targetSalary: number; colaPct: number; colaAmt: number; objectives: string;
}) {
  const { tr, dateStr, employeeName, posteName, evaluatedBy, logoUrl, useGrid, globalScore, tierName, tierMinScore, skillForm, scores, byType, salaryBefore, salaryAfter, targetSalary, colaPct, colaAmt, objectives } = opts;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const M = 40; let y = 48;

  const tx = await drawLogo(doc, logoUrl, M, y - 16);
  doc.setFontSize(16); doc.setTextColor(30);
  doc.text(tr("Fiche d'évaluation", 'Evaluation sheet'), tx, y);
  doc.setFontSize(13); doc.setTextColor(37, 99, 235);
  doc.text(employeeName || '—', tx, y + 18);
  doc.setFontSize(9); doc.setTextColor(120);
  doc.text(`${posteName || '—'}  ·  ${tr('Évalué par', 'Evaluated by')} ${evaluatedBy || '—'}  ·  ${dateStr}`, tx, y + 32);
  y += 52;

  if (useGrid) {
    doc.setFontSize(22); doc.setTextColor(globalScore >= 80 ? 16 : globalScore >= 50 ? 217 : 220, globalScore >= 80 ? 185 : globalScore >= 50 ? 119 : 38, globalScore >= 80 ? 129 : globalScore >= 50 ? 6 : 38);
    doc.text(`${globalScore.toFixed(0)} %`, M, y);
    doc.setFontSize(10); doc.setTextColor(80);
    doc.text(`${tr('Note globale', 'Global score')}  ·  ${tr('Palier justifié', 'Justified tier')} : ${tierName || '—'} (≥${tierMinScore} %)`, M + 70, y - 4);
    y += 20;

    if (skillForm?.types?.length) {
      const body: any[] = [];
      skillForm.types.forEach((ty: any) => {
        body.push([{ content: `${ty.name}  (${tr('note type', 'type score')} ${(byType[ty.id] || 0).toFixed(0)} %  ·  ${tr('pond.', 'weight')} ${ty.weight}%)`, colSpan: 3, styles: { fontStyle: 'bold', fillColor: [243, 232, 255] } }]);
        (ty.skills || []).forEach((s: any) => {
          const v = scores[s.id] || 0;
          body.push([`   ${s.name || '—'}`, ty.mode === 'pct' ? `${v} %` : `${v}/${ty.max}`, `${s.weight || 1} %`]);
        });
      });
      autoTable(doc, {
        startY: y, theme: 'grid', styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [139, 92, 246] },
        head: [[tr('Compétence', 'Skill'), tr('Note', 'Score'), tr('Poids', 'Weight')]],
        body,
      });
      y = lastY(doc, y) + 18;
    }
  }

  // Cascade salariale
  doc.setFontSize(11); doc.setTextColor(30);
  doc.text(tr('Ajustement salarial', 'Salary adjustment'), M, y); y += 6;
  const rows: any[] = [[tr('Salaire actuel', 'Current salary'), money(salaryBefore)]];
  if (useGrid) rows.push([tr('Salaire cible du palier', 'Tier target salary'), money(targetSalary)]);
  rows.push([`${tr('Coût de la vie', 'Cost of living')} (${colaPct} %)`, `+ ${money(colaAmt)}`]);
  rows.push([{ content: tr('Salaire recommandé', 'Recommended salary'), styles: { fontStyle: 'bold' } }, { content: money(salaryAfter), styles: { fontStyle: 'bold' } }]);
  autoTable(doc, {
    startY: y, theme: 'grid', styles: { fontSize: 10, cellPadding: 5 },
    headStyles: { fillColor: [59, 130, 246] },
    head: [[tr('Élément', 'Item'), tr('Montant', 'Amount')]],
    body: rows,
  });
  y = lastY(doc, y) + 18;

  // Objectifs
  if (objectives?.trim()) {
    doc.setFontSize(11); doc.setTextColor(30);
    doc.text(tr("Objectifs pour la prochaine année", 'Objectives for next year'), M, y); y += 14;
    doc.setFontSize(9); doc.setTextColor(60);
    doc.text(doc.splitTextToSize(objectives, 515), M, y);
  }

  doc.save(`${tr('evaluation', 'evaluation')}-${(employeeName || 'employe').replace(/\s+/g, '_')}-${dateStr}.pdf`);
}
