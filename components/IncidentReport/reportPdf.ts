// Rapport d'accident/incident en PDF (jsPDF) — MÊME SOCLE PRO que le rapport DGA / terrain :
// logo tenant, couleur de marque (Modèles PDF, module 'rapports'), en-tête + pieds de page numérotés,
// lettre de présentation optionnelle. Couvre TOUT ce qui est saisi (blessés + zones du schéma, témoins,
// véhicule, dommages, 5-pourquoi, photos, CAPA, réglementation, signatures).
import { BODY_REGIONS, FACE_REGIONS, HAND_L_REGIONS, HAND_R_REGIONS, FOOT_L_REGIONS, FOOT_R_REGIONS } from './BodyMap';

const BODY_LABELS: Record<string, { fr: string; en: string }> = {};
for (const r of [...BODY_REGIONS, ...FACE_REGIONS, ...HAND_L_REGIONS, ...HAND_R_REGIONS, ...FOOT_L_REGIONS, ...FOOT_R_REGIONS]) BODY_LABELS[r.id] = { fr: r.labelFr, en: r.labelEn };

const TREATMENT: Record<string, { fr: string; en: string }> = {
  none: { fr: 'Aucun', en: 'None' }, first_aid: { fr: 'Premiers soins', en: 'First aid' },
  clinic: { fr: 'Clinique / médecin', en: 'Clinic / doctor' }, hospital: { fr: 'Hospitalisation', en: 'Hospital' }, emergency: { fr: 'Urgence / ambulance', en: 'Emergency / ambulance' },
};
const ASTATUS: Record<string, { fr: string; en: string }> = {
  pending: { fr: 'En attente', en: 'Pending' }, in_progress: { fr: 'En cours', en: 'In progress' }, completed: { fr: 'Complétée', en: 'Completed' },
};

// Schéma corporel (silhouette AVANT + ARRIÈRE, homme) avec les zones sélectionnées en rouge → SVG string.
// Les vues avant/arrière partagent le repère (avant x 0–724, arrière x 724–1448) → un seul SVG.
function bodySvg(selected: Set<string>): string {
  const regs = BODY_REGIONS.filter((r: any) => r.gender === 'male'); // avant + arrière
  const paths = regs.flatMap((r: any) => (r.paths || []).map((d: string) => {
    const sel = selected.has(r.id);
    return `<path d="${d}" fill="${sel ? '#dc2626' : '#dbe2ea'}" stroke="${sel ? '#991b1b' : '#9aa6b2'}" stroke-width="1.4" stroke-linejoin="round"/>`;
  })).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1448 1448">${paths}</svg>`;
}

// SVG → PNG (data URL) via canvas. Client-side. Best-effort (null si échec).
async function svgToPng(svg: string, w: number, h: number): Promise<string | null> {
  if (typeof document === 'undefined') return null;
  return new Promise(res => {
    try {
      const img = new Image();
      img.onload = () => {
        try {
          const c = document.createElement('canvas'); c.width = w; c.height = h;
          const ctx = c.getContext('2d'); if (!ctx) { res(null); return; }
          ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h); ctx.drawImage(img, 0, 0, w, h);
          res(c.toDataURL('image/png'));
        } catch { res(null); }
      };
      img.onerror = () => res(null);
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    } catch { res(null); }
  });
}

async function loadImg(url?: string | null): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:')) return url;
  try { const r = await fetch(url); const b = await r.blob(); return await new Promise(res => { const fr = new FileReader(); fr.onloadend = () => res(fr.result as string); fr.onerror = () => res(null); fr.readAsDataURL(b); }); }
  catch { return null; }
}

export async function generateIncidentReportPdf(opts: {
  report: any; reportNumber: string; lang: 'fr' | 'en'; typeLabel: string;
  tenant?: string; logoUrl?: string | null; coverLetter?: import('@/lib/pdf/letterhead').CoverLetterData | null;
}) {
  const { report: rep, reportNumber, lang } = opts;
  const fr = lang !== 'en';
  const tr = (f: string, e: string) => (fr ? f : e);
  const lbl = (m: Record<string, { fr: string; en: string }>, k: string) => (m[k] ? (fr ? m[k].fr : m[k].en) : (k || ''));

  const { default: jsPDF } = await import('jspdf');
  let accent: [number, number, number] = [185, 28, 28]; // rouge accident par défaut
  try {
    const { getPdfStyles, resolveKnobs, hexToRgb, DEFAULT_ACCENT } = await import('@/lib/pdfStyle');
    const k = resolveKnobs(await getPdfStyles(opts.tenant || ''), 'rapports');
    if (k.accent && k.accent.toLowerCase() !== DEFAULT_ACCENT.toLowerCase()) accent = hexToRgb(k.accent);
  } catch { /* défaut */ }
  const logo = await loadImg(opts.logoUrl || '/c-secur360-logo.png');

  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const W = doc.internal.pageSize.getWidth(); const Hp = doc.internal.pageSize.getHeight(); const M = 42;

  // Lettre de présentation optionnelle (même socle que DGA / terrain).
  if (opts.coverLetter) {
    try { const { drawCoverLetterPage } = await import('@/lib/pdf/letterhead'); drawCoverLetterPage(doc, { logo, ...opts.coverLetter } as any); doc.addPage(); } catch { /* ignore */ }
  }

  const header = () => {
    if (logo) { try { doc.addImage(logo, 'PNG', M, 22, 0, 26); } catch { /* */ } }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(60);
    doc.text(`${tr('Rapport', 'Report')}: ${reportNumber}`, W - M, 30, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.text(`${tr('Généré le', 'Generated')}: ${new Date().toISOString().slice(0, 10)}`, W - M, 42, { align: 'right' });
    doc.setDrawColor(...accent); doc.setLineWidth(0.8); doc.line(M, 50, W - M, 50);
  };
  let y = 64;
  const ensure = (h: number) => { if (y + h > Hp - 46) { doc.addPage(); header(); y = 64; } };
  const sectionTitle = (s: string) => { ensure(22); doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...accent); doc.text(s.toUpperCase(), M, y); y += 6; doc.setDrawColor(...accent); doc.setLineWidth(0.4); doc.line(M, y, W - M, y); y += 10; };
  const rowKV = (label: string, value: any) => { const val = (value === null || value === undefined || value === '') ? '—' : String(value); ensure(13); doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(90); doc.text(label, M, y); doc.setFont('helvetica', 'normal'); doc.setTextColor(40); const lines = doc.splitTextToSize(val, W - 2 * M - 150); doc.text(lines, M + 150, y); y += Math.max(13, lines.length * 12); };
  const para = (txt: string) => { if (!txt) return; doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(40); for (const ln of doc.splitTextToSize(String(txt), W - 2 * M)) { ensure(12); doc.text(ln, M, y); y += 12; } };
  const has = (v: any) => v !== null && v !== undefined && v !== '';

  header();
  doc.setFont('helvetica', 'bold'); doc.setFontSize(17); doc.setTextColor(...accent);
  doc.text(tr("Rapport d'incident / accident", 'Incident / accident report'), M, y); y += 18;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(90);
  doc.text(`${opts.typeLabel} · ${tr('Gravité', 'Severity')} ${rep.severityLevel ?? '—'}/5 · ${tr('Date', 'Date')} ${rep.incidentDate || '—'} ${rep.incidentTime || ''}`, M, y); y += 16;

  sectionTitle(tr('Informations générales', 'General information'));
  rowKV(tr('Type', 'Type'), opts.typeLabel);
  rowKV(tr('Province', 'Province'), rep.province);
  rowKV(tr('Date du rapport', 'Report date'), rep.reportedDate);
  rowKV(tr('Déclaré par', 'Reported by'), rep.reportedBy);
  rowKV(tr('Titre / poste', 'Title / position'), rep.reportedByTitle);
  rowKV(tr('Téléphone', 'Phone'), rep.reportedByPhone);

  sectionTitle(tr('Lieu', 'Location'));
  rowKV(tr('Adresse', 'Address'), rep.address);
  rowKV(tr('Département / unité', 'Department / unit'), rep.department);
  rowKV(tr('Emplacement précis', 'Exact location'), rep.exactLocation);
  rowKV(tr('Conditions météo', 'Weather'), rep.weatherConditions);
  rowKV(tr('Éclairage', 'Lighting'), rep.lighting);

  const persons: any[] = Array.isArray(rep.injuredPersons) ? rep.injuredPersons : [];
  if (persons.length) {
    sectionTitle(tr('Personnes blessées', 'Injured persons'));
    for (let i = 0; i < persons.length; i++) {
      const p = persons[i];
      ensure(16); doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(20); doc.text(`${tr('Blessé', 'Injured')} #${i + 1} — ${p.name || '—'}`, M, y); y += 13;
      rowKV(tr('Poste', 'Position'), p.jobTitle);
      rowKV(tr('Employeur', 'Employer'), p.company);
      rowKV(tr('Type de blessure', 'Injury type'), p.injuryType);
      rowKV(tr('Traitement médical', 'Medical treatment'), p.medicalTreatment ? lbl(TREATMENT, p.medicalTreatment) : '');
      if (p.injuryDescription) rowKV(tr('Description', 'Description'), p.injuryDescription);
      if (p.lostTime) rowKV(tr('Arrêt de travail', 'Lost time'), `${p.lostTimeDays || 0} ${tr('jour(s)', 'day(s)')}`);
      if (p.restricted) rowKV(tr('Travail restreint / mutation', 'Restricted / transfer'), '✔');
      if (p.fatality) rowKV(tr('Décès', 'Fatality'), '✔');
      if (Array.isArray(p.bodyRegions) && p.bodyRegions.length) {
        rowKV(tr('Zones blessées', 'Injured areas'), p.bodyRegions.map((id: string) => (BODY_LABELS[id] ? (fr ? BODY_LABELS[id].fr : BODY_LABELS[id].en) : id)).join(', '));
        // Schéma corporel (avant + arrière) avec les zones touchées en rouge — joint au rapport.
        try {
          const png = await svgToPng(bodySvg(new Set(p.bodyRegions)), 760, 760);
          if (png) { const dim = 150; ensure(dim + 8); doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(120); doc.text(tr('Schéma corporel (avant / arrière)', 'Body diagram (front / back)'), M, y); y += 4; try { doc.addImage(png, 'PNG', M, y, dim, dim); } catch { /* skip */ } y += dim + 6; }
        } catch { /* best-effort */ }
      }
      y += 4;
    }
  }

  const witnesses: any[] = Array.isArray(rep.witnesses) ? rep.witnesses : [];
  if (witnesses.length) {
    sectionTitle(tr('Témoins', 'Witnesses'));
    witnesses.forEach((w, i) => { rowKV(`${tr('Témoin', 'Witness')} #${i + 1}`, w.name); if (w.jobTitle) rowKV(tr('Poste', 'Position'), w.jobTitle); if (w.phone) rowKV(tr('Téléphone', 'Phone'), w.phone); if (w.statement) para(w.statement); y += 2; });
  }

  sectionTitle(tr('Description', 'Description'));
  rowKV(tr('Type de travail', 'Work type'), rep.workType);
  if (rep.description) { para(rep.description); y += 2; }
  if (rep.immediateAction) { rowKV(tr('Action immédiate', 'Immediate action'), rep.immediateAction); }
  if (Array.isArray(rep.contributingFactors) && rep.contributingFactors.length) rowKV(tr('Facteurs contributifs', 'Contributing factors'), rep.contributingFactors.join(', '));

  if (rep.vehicleInvolved && rep.vehicle) {
    sectionTitle(tr('Véhicule impliqué', 'Vehicle involved'));
    rowKV(tr('Plaque', 'Plate'), rep.vehicle.licensePlate); rowKV(tr('Marque', 'Make'), rep.vehicle.make); rowKV(tr('Modèle', 'Model'), rep.vehicle.model);
    rowKV(tr('Année', 'Year'), rep.vehicle.year); rowKV('km', rep.vehicle.kmAtIncident); rowKV(tr('Type de collision', 'Collision type'), rep.vehicle.collisionType);
    if (rep.vehicle.damageDescription) para(rep.vehicle.damageDescription);
  }
  if (rep.propertyDamageInvolved && rep.propertyDamage) {
    sectionTitle(tr('Dommages matériels', 'Property damage'));
    rowKV(tr('Emplacement', 'Location'), rep.propertyDamage.location); rowKV(tr('Coût estimé', 'Estimated cost'), rep.propertyDamage.estimatedCost);
    if (rep.propertyDamage.description) para(rep.propertyDamage.description);
  }

  const whys = (Array.isArray(rep.whyAnalysis) ? rep.whyAnalysis : []).filter((w: any) => w.answer);
  if (rep.immediateCauses || rep.basicCauses || whys.length || rep.rootCause) {
    sectionTitle(tr('Analyse & enquête', 'Analysis & investigation'));
    if (rep.immediateCauses) rowKV(tr('Causes immédiates', 'Immediate causes'), rep.immediateCauses);
    if (rep.basicCauses) rowKV(tr('Causes fondamentales', 'Basic causes'), rep.basicCauses);
    whys.forEach((w: any, i: number) => rowKV(`${i + 1}. ${w.question || tr('Pourquoi', 'Why')}`, w.answer));
    if (rep.rootCause) rowKV(tr('Cause racine', 'Root cause'), rep.rootCause);
  }

  const actions: any[] = Array.isArray(rep.correctiveActions) ? rep.correctiveActions : [];
  if (actions.length) {
    sectionTitle(tr('Actions correctives', 'Corrective actions'));
    actions.forEach((a, i) => { rowKV(`#${i + 1}`, a.description); if (a.responsible) rowKV(tr('Responsable', 'Responsible'), a.responsible); if (a.dueDate) rowKV(tr('Échéance', 'Due date'), a.dueDate); rowKV(tr('Statut', 'Status'), a.status ? lbl(ASTATUS, a.status) : ''); y += 2; });
  }

  // Photos (images) — best-effort (téléchargées et intégrées).
  const photos: any[] = Array.isArray(rep.photos) ? rep.photos : [];
  if (photos.length) {
    sectionTitle(tr('Photos', 'Photos'));
    const cw = (W - 2 * M - 16) / 2; const ch = 130; let col = 0;
    for (const ph of photos) {
      const data = await loadImg(ph.url);
      if (y + ch > Hp - 46) { doc.addPage(); header(); y = 64; col = 0; }
      const x = M + col * (cw + 16);
      if (data) { try { doc.addImage(data, 'JPEG', x, y, cw, ch - 14); } catch { try { doc.addImage(data, 'PNG', x, y, cw, ch - 14); } catch { /* skip */ } } }
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(110); doc.text(String(ph.name || ''), x, y + ch - 2, { maxWidth: cw } as any);
      col++; if (col === 2) { col = 0; y += ch; }
    }
    if (col === 1) y += ch;
  }

  // Signatures
  sectionTitle(tr('Signatures', 'Signatures'));
  const sigRow = (label: string, name: any, date: any, signed: boolean) => { ensure(26); doc.setDrawColor(150); doc.setLineWidth(0.5); doc.line(M, y + 12, M + 200, y + 12); doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(110); doc.text(label, M, y); doc.setFontSize(9); doc.setTextColor(30); doc.text(String(name || '—'), M, y + 24); doc.setFontSize(8); doc.setTextColor(110); doc.text(signed ? `${tr('Signé le', 'Signed on')} ${date || ''}` : tr('Non signé', 'Not signed'), M + 220, y + 24); y += 34; };
  sigRow(tr('Enquêteur', 'Investigator'), rep.investigatorName, rep.investigatorSignedAt, !!rep.investigatorSignedAt);
  sigRow(tr('Superviseur', 'Supervisor'), rep.supervisorName, rep.supervisorDate, !!rep.supervisorSigned);
  sigRow(tr('Réviseur SST', 'HSE reviewer'), rep.hseReviewerName, rep.hseReviewerDate, !!rep.hseReviewerSigned);
  sigRow(tr('Direction', 'Management'), rep.managementName, rep.managementDate, !!rep.managementSigned);

  // Pieds de page numérotés + avertissement (même esprit que DGA).
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p); doc.setFontSize(7); doc.setTextColor(150);
    doc.text(tr("C-Secur360 — Rapport d'incident. Données fournies par le déclarant ; présentation à titre indicatif.", 'C-Secur360 — Incident report. Data provided by the reporter; presented for information only.'), M, Hp - 24, { maxWidth: W - 2 * M } as any);
    doc.text(`${p} / ${total}`, W - M, Hp - 14, { align: 'right' });
  }

  const base = String(reportNumber || 'rapport').trim().replace(/[^\w.-]+/g, '_');
  doc.save(`Rapport-accident-${base}.pdf`);
}
