import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { SupabaseClient } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CardForExport {
  equipment: {
    id: string;
    equipment_type: string;
    equipment_name: string | null;
    equipment_serial: string | null;
    equipment_location: string | null;
    inspection_frequency: string | null;
    province: string;
    notes: string | null;
  };
  latest: {
    overall_result: string | null;
    inspection_date: string | null;
    inspector_name: string | null;
  } | null;
  urgency: 'overdue' | 'soon' | 'ok' | 'unknown';
  inspectionCount: number;
}

export interface ExportOptions {
  tenant: string;
  typeFilter: string;
  typeLabel: string;
  cards: CardForExport[];
  supabase: SupabaseClient;
  stats: { total: number; overdue: number; soon: number; nonConforme: number };
  logoUrl?: string;
}

// Charge une image (logo) en dataURL pour jsPDF. null si échec/CORS.
async function loadLogoData(url: string): Promise<{ data: string; w: number; h: number } | null> {
  try {
    const res = await fetch(url); if (!res.ok) return null;
    const blob = await res.blob();
    const data: string = await new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result as string); r.onerror = reject; r.readAsDataURL(blob); });
    const dims = await new Promise<{ w: number; h: number }>(resolve => { const img = new Image(); img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight }); img.onerror = () => resolve({ w: 0, h: 0 }); img.src = data; });
    return dims.w ? { data, w: dims.w, h: dims.h } : null;
  } catch { return null; }
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const RESULT_FR: Record<string, string> = {
  conforme:     'Conforme',
  conditionnel: 'Conditionnel',
  non_conforme: 'Non conforme',
  retrait:      'RETRAIT IMMÉDIAT',
  incomplete:   'En cours',
};

const RESULT_RGB: Record<string, [number, number, number]> = {
  conforme:     [22,  163,  74],
  conditionnel: [202, 138,   4],
  non_conforme: [220,  38,  38],
  retrait:      [153,  27,  27],
  incomplete:   [107, 114, 128],
};

const URGENCY_RGB: Record<string, [number, number, number]> = {
  overdue: [239, 68,  68],
  soon:    [245, 158, 11],
  ok:      [20,  184, 166],
  unknown: [203, 213, 225],
};

const FREQ_FR: Record<string, string> = {
  quotidien:    'Quotidienne',
  hebdomadaire: 'Hebdomadaire',
  mensuel:      'Mensuelle',
  trimestriel:  'Trimestrielle',
  semestriel:   'Semestrielle',
  annuel:       'Annuelle',
  par_quart:    'Par quart de travail',
};

const PAGE_W   = 210;
const MARGIN   = 14;
const CONTENT_W = PAGE_W - 2 * MARGIN;

// ─── Helper ───────────────────────────────────────────────────────────────────

function ensureY(doc: jsPDF, y: number, need: number): number {
  if (y + need > 282) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

// ─── Export principal ─────────────────────────────────────────────────────────

export async function exportInspectionsPDF(opts: ExportOptions): Promise<void> {
  const { tenant, typeFilter, typeLabel, cards, supabase, stats, logoUrl } = opts;

  // Récupérer tout l'historique d'un coup
  const ids = cards.map(c => c.equipment.id);
  const { data: allInsps } = await supabase
    .from('equipment_inspections')
    .select('equipment_id, inspection_number, inspection_date, inspector_name, overall_result, status, non_conformities')
    .in('equipment_id', ids)
    .eq('tenant_id', tenant)
    .order('inspection_date', { ascending: false });

  const historyMap: Record<string, any[]> = {};
  for (const row of (allInsps ?? []) as any[]) {
    (historyMap[row.equipment_id] ??= []).push(row);
  }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const now   = new Date();
  const dateStr = now.toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  let y = MARGIN;

  // ── BANDEAU EN-TÊTE ──────────────────────────────────────────────────────

  doc.setFillColor(17, 24, 39);
  doc.rect(0, 0, PAGE_W, 24, 'F');

  // Logo (tenant si fourni, sinon C-Secur360 par défaut) en haut à gauche
  let logo = logoUrl ? await loadLogoData(logoUrl) : null;
  if (!logo) logo = await loadLogoData('/c-secur360-logo.png');
  let tx = MARGIN;
  if (logo) {
    const lh = 14; const lw = Math.min((logo.w / logo.h) * lh, 50);
    const fmt = logo.data.includes('image/png') ? 'PNG' : 'JPEG';
    try { doc.addImage(logo.data, fmt as any, MARGIN, 5, lw, lh); tx = MARGIN + lw + 4; } catch { /* ignore */ }
  }
  doc.setTextColor(255, 255, 255);
  if (tx === MARGIN) {
    doc.setFontSize(15); doc.setFont('helvetica', 'bold');
    doc.text('C-Secur360', tx, 10);
  }
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text("Rapport d'inspections d'équipements", tx, 16);

  doc.setFontSize(8);
  doc.text(tenant.toUpperCase(), PAGE_W - MARGIN, 10, { align: 'right' });
  doc.text(dateStr, PAGE_W - MARGIN, 15.5, { align: 'right' });

  y = 30;

  // ── FILTRE ───────────────────────────────────────────────────────────────

  doc.setFillColor(240, 253, 250);
  doc.setDrawColor(20, 184, 166);
  doc.roundedRect(MARGIN, y, CONTENT_W, 8, 2, 2, 'FD');
  doc.setTextColor(15, 118, 110);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `Filtre : ${typeFilter === 'all' ? "Tous les types d'équipements" : typeLabel}`,
    MARGIN + 3, y + 5.5,
  );
  y += 12;

  // ── STATISTIQUES ─────────────────────────────────────────────────────────

  const statW = CONTENT_W / 4;
  const statItems: { label: string; value: number; rgb: [number, number, number] }[] = [
    { label: 'Équipements',   value: stats.total,       rgb: [30, 41, 59] },
    { label: 'En retard',     value: stats.overdue,     rgb: [220, 38, 38] },
    { label: 'Bientôt dûs',   value: stats.soon,        rgb: [202, 138, 4] },
    { label: 'Non conformes', value: stats.nonConforme, rgb: [220, 38, 38] },
  ];
  statItems.forEach((s, i) => {
    const x = MARGIN + i * statW;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, statW - 2, 14, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...s.rgb);
    doc.text(String(s.value), x + (statW - 2) / 2, y + 8.5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(s.label, x + (statW - 2) / 2, y + 12.5, { align: 'center' });
  });
  y += 19;

  // ── FICHES ÉQUIPEMENT ────────────────────────────────────────────────────

  for (const card of cards) {
    const { equipment: eq, latest, urgency } = card;
    const history = historyMap[eq.id] ?? [];

    y = ensureY(doc, y, 32);

    // Barre de couleur urgence (gauche)
    doc.setFillColor(...URGENCY_RGB[urgency]);
    doc.rect(MARGIN, y, 2.5, 26, 'F');

    // Bloc équipement
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.rect(MARGIN + 2.5, y, CONTENT_W - 2.5, 26, 'FD');

    // Puce type
    const typeChip = eq.equipment_type.replace(/_/g, ' ').toUpperCase();
    const chipW = Math.min(typeChip.length * 1.7 + 5, 48);
    doc.setFillColor(17, 24, 39);
    doc.roundedRect(MARGIN + 5, y + 2.5, chipW, 5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text(typeChip, MARGIN + 5 + chipW / 2, y + 6, { align: 'center' });

    // Badge résultat (droite)
    if (latest?.overall_result) {
      const label = RESULT_FR[latest.overall_result] ?? latest.overall_result;
      const [rr, rg, rb] = RESULT_RGB[latest.overall_result] ?? [107, 114, 128];
      const bW = label.length * 1.65 + 5;
      doc.setFillColor(rr, rg, rb);
      doc.roundedRect(PAGE_W - MARGIN - bW - 2, y + 2.5, bW, 5, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.text(label, PAGE_W - MARGIN - bW / 2 - 2, y + 6, { align: 'center' });
    } else {
      doc.setFillColor(203, 213, 225);
      const bW = 26;
      doc.roundedRect(PAGE_W - MARGIN - bW - 2, y + 2.5, bW, 5, 1, 1, 'F');
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.text('Non inspecté', PAGE_W - MARGIN - bW / 2 - 2, y + 6, { align: 'center' });
    }

    // Nom équipement
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(eq.equipment_name || typeChip, MARGIN + 5, y + 14);

    // Infos secondaires
    const parts: string[] = [];
    if (eq.equipment_serial) parts.push(`#${eq.equipment_serial}`);
    if (eq.equipment_location) parts.push(eq.equipment_location);
    if (eq.province) parts.push(eq.province);
    if (eq.inspection_frequency) parts.push(FREQ_FR[eq.inspection_frequency] ?? eq.inspection_frequency);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(parts.join('  ·  '), MARGIN + 5, y + 19.5);

    // Dernière inspection
    doc.setFontSize(7);
    if (latest?.inspection_date) {
      const lastParts = [`Dernière: ${new Date(latest.inspection_date).toLocaleDateString('fr-CA')}`];
      if (latest.inspector_name) lastParts.push(latest.inspector_name);
      doc.setTextColor(100, 116, 139);
      doc.text(lastParts.join('  ·  '), MARGIN + 5, y + 24);
    } else {
      doc.setTextColor(148, 163, 184);
      doc.text('Aucune inspection enregistrée', MARGIN + 5, y + 24);
    }

    y += 28;

    // ── Tableau historique ─────────────────────────────────────────────────

    if (history.length > 0) {
      y = ensureY(doc, y, 20);

      const rows = history.slice(0, 20).map((h: any) => [
        h.inspection_number ?? '—',
        h.inspection_date ? new Date(h.inspection_date).toLocaleDateString('fr-CA') : '—',
        h.inspector_name ?? '—',
        RESULT_FR[h.overall_result ?? ''] ?? (h.overall_result ?? '—'),
        String((h.non_conformities as any[] | null)?.length ?? 0),
      ]);

      autoTable(doc, {
        startY: y,
        margin: { left: MARGIN + 2.5, right: MARGIN },
        head: [['# Inspection', 'Date', 'Inspecteur', 'Résultat', 'NC']],
        body: rows,
        theme: 'grid',
        headStyles: {
          fillColor: [15, 118, 110],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 7.5,
          cellPadding: 2,
        },
        bodyStyles: {
          fontSize: 7.5,
          cellPadding: 2,
          textColor: [30, 41, 59],
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 28 },
          1: { cellWidth: 24 },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 32 },
          4: { cellWidth: 12, halign: 'center' },
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 3 && data.cell.text[0]) {
            const key = Object.entries(RESULT_FR).find(([, v]) => v === data.cell.text[0])?.[0];
            if (key && RESULT_RGB[key]) {
              data.cell.styles.textColor = RESULT_RGB[key];
              data.cell.styles.fontStyle = 'bold';
            }
          }
        },
      });

      y = (doc as any).lastAutoTable.finalY + 5;
    }

    y += 5; // espace entre équipements
  }

  // ── PIED DE PAGE ─────────────────────────────────────────────────────────

  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFillColor(17, 24, 39);
    doc.rect(0, 290, PAGE_W, 7, 'F');
    doc.setFontSize(6.5);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `C-Secur360 · ${tenant} · ${dateStr} · Page ${p} / ${total}`,
      PAGE_W / 2, 294.5, { align: 'center' },
    );
  }

  const filename = `inspections-${tenant}-${typeFilter === 'all' ? 'tous' : typeFilter}-${now.toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
