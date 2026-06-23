// Export PDF d'une causerie de sécurité (TBM) / observation — MÊME SOCLE PRO que le rapport DGA/terrain :
// logo tenant, couleur de marque (Admin › Modèles PDF, module 'hse'), en-tête + pieds numérotés.
// Couvre : infos séance, points abordés (multi-lignes), transcription, notes, médias, et une FEUILLE DE
// PRÉSENCE avec ligne de signature par participant (signature image rendue si déjà capturée).
import { PDF, drawHeader, drawTitle, applyFooters } from '@/lib/pdf/letterhead';
import type { HseSafetyMeeting } from '@/lib/hse/safetyMeetings';

async function loadImg(url?: string | null): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:')) return url;
  try { const r = await fetch(url); const b = await r.blob(); return await new Promise(res => { const fr = new FileReader(); fr.onloadend = () => res(fr.result as string); fr.onerror = () => res(null); fr.readAsDataURL(b); }); }
  catch { return null; }
}

export async function generateCauseriePdf(opts: { meeting: HseSafetyMeeting; lang?: 'fr' | 'en'; tenant?: string; logoUrl?: string | null; }) {
  const m = opts.meeting;
  const fr = (opts.lang || 'fr') !== 'en';
  const tr = (a: string, b: string) => (fr ? a : b);

  const { default: jsPDF } = await import('jspdf');
  // Couleur depuis Admin › Modèles PDF (clé 'hse') ; repli bleu sécurité si non personnalisé (gris DGA).
  let accent: [number, number, number] = [37, 99, 235];
  let ruleWidth = 1, titleSize = 14, subtitleSize = 11, showRule = true;
  try {
    const { pdfStyleFor } = await import('@/lib/pdfStyle');
    const isGray = (a: [number, number, number]) => a[0] === 60 && a[1] === 60 && a[2] === 60;
    const st = await pdfStyleFor(opts.tenant || '', 'hse');
    ruleWidth = st.ruleWidth; titleSize = st.titleSize; subtitleSize = st.subtitleSize; showRule = st.showRule;
    if (!isGray(st.accent)) accent = st.accent;
  } catch { /* défaut */ }
  const logo = await loadImg(opts.logoUrl || '/c-secur360-logo.png');

  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const W = PDF.W, Hp = PDF.H, M = PDF.M;
  const kindLabel = m.kind === 'observation' ? tr('Observation de sécurité (BBS)', 'Safety observation (BBS)') : tr('Causerie de sécurité (TBM)', 'Toolbox talk (TBM)');

  const header = () => drawHeader(doc, { logo, rightLines: [kindLabel, `${tr('Généré le', 'Generated')} ${new Date().toISOString().slice(0, 10)}`], accent, ruleWidth, showRule });
  let y = header();
  const ensure = (h: number) => { if (y + h > Hp - 46) { doc.addPage(); y = header(); } };
  const sectionTitle = (s: string) => { ensure(24); doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...accent); doc.text(s.toUpperCase(), M, y); y += 6; doc.setDrawColor(...accent); doc.setLineWidth(0.4); doc.line(M, y, W - M, y); y += 12; };
  const rowKV = (label: string, value: any) => {
    const val = (value === null || value === undefined || value === '') ? '—' : String(value);
    ensure(14); doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(90); doc.text(label, M, y);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(40);
    const lines = doc.splitTextToSize(val, W - 2 * M - 150); doc.text(lines, M + 150, y); y += Math.max(14, lines.length * 12);
  };
  const para = (txt: string) => { if (!txt) return; doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(40); for (const ln of doc.splitTextToSize(String(txt), W - 2 * M)) { ensure(12); doc.text(ln, M, y); y += 12; } };

  // Titre
  y = drawTitle(doc, y, kindLabel, `${m.meeting_date || ''}${m.location ? ' · ' + m.location : ''}`, accent, titleSize, subtitleSize);

  // Informations
  sectionTitle(tr('Informations', 'Information'));
  rowKV(tr('Date', 'Date'), m.meeting_date);
  rowKV(tr('Lieu / chantier', 'Location / site'), m.location);
  rowKV(tr('Sujet', 'Topic'), m.topic);
  if (m.duration_min != null) rowKV(tr('Durée', 'Duration'), `${m.duration_min} min`);
  if (m.meeting_url) rowKV(tr('Lien de séance', 'Session link'), m.meeting_url);
  rowKV(tr('Animé / déclaré par', 'Led / reported by'), m.created_by);

  // Points abordés
  const points = (m.points || []).filter(p => (p.text || '').trim());
  if (points.length) {
    sectionTitle(tr('Points abordés', 'Topics covered'));
    points.forEach((p, i) => { ensure(13); doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(40); for (const ln of doc.splitTextToSize(`${i + 1}.  ${p.text}`, W - 2 * M - 6)) { ensure(12); doc.text(ln, M + 4, y); y += 13; } });
  }

  // Transcription
  if (m.transcript && m.transcript.trim()) { sectionTitle(tr('Transcription', 'Transcript')); para(m.transcript); }
  // Notes
  if (m.notes && m.notes.trim()) { sectionTitle(tr('Notes', 'Notes')); para(m.notes); }

  // Médias (liens)
  const media = m.media || [];
  if (media.length) {
    sectionTitle(tr('Enregistrements & médias', 'Recordings & media'));
    media.forEach(md => { ensure(12); doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(37, 99, 235); const tag = md.kind === 'video' ? '🎥' : md.kind === 'audio' ? '🎙️' : '🔗'; const lines = doc.splitTextToSize(`${tag} ${md.label || md.url}`, W - 2 * M); doc.text(lines, M, y); y += Math.max(12, lines.length * 11); });
  }

  // Feuille de présence (avec ligne de signature)
  const parts = (m.participants && m.participants.length)
    ? m.participants
    : String(m.attendees || '').split(',').map(s => s.trim()).filter(Boolean).map(name => ({ name, role: '', present: true } as any));
  sectionTitle(tr('Feuille de présence', 'Attendance sheet'));
  // En-têtes de colonnes
  ensure(18); doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(110);
  const cN = M + 16, cR = M + 250, cP = M + 360, cS = M + 410;
  doc.text('#', M, y); doc.text(tr('Nom', 'Name'), cN, y); doc.text(tr('Poste', 'Role'), cR, y); doc.text(tr('Prés.', 'Pres.'), cP, y); doc.text(tr('Signature', 'Signature'), cS, y);
  y += 4; doc.setDrawColor(200); doc.setLineWidth(0.5); doc.line(M, y, W - M, y); y += 14;
  for (let i = 0; i < parts.length; i++) {
    const p: any = parts[i];
    ensure(26);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(40);
    doc.text(String(i + 1), M, y);
    doc.text(doc.splitTextToSize(p.name || '—', 225), cN, y);
    doc.text(doc.splitTextToSize(p.role || '', 100), cR, y);
    doc.text(p.present === false ? '—' : '☑', cP, y);
    // Signature : image si capturée, sinon ligne à signer.
    if (p.signature && String(p.signature).startsWith('data:')) {
      try { doc.addImage(p.signature, 'PNG', cS, y - 12, 120, 22); } catch { doc.setDrawColor(170); doc.line(cS, y, W - M, y); }
    } else { doc.setDrawColor(170); doc.setLineWidth(0.5); doc.line(cS, y + 1, W - M, y + 1); }
    y += 22; doc.setDrawColor(240); doc.line(M, y - 6, W - M, y - 6);
  }
  if (!parts.length) para(tr('Aucun participant inscrit.', 'No attendee recorded.'));

  applyFooters(doc, tr('C-Secur360 — Causerie de sécurité. Présentation à titre indicatif.', 'C-Secur360 — Safety talk. Presented for information only.'));
  const safe = (m.topic || kindLabel).replace(/[^\w\-]+/g, '_').slice(0, 40);
  doc.save(`causerie-${m.meeting_date || ''}-${safe}.pdf`);
}
