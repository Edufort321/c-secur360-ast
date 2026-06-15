// Socle PDF de MARQUE partagé (style DGA) — réutilisé par Soumission, Feuille de temps et Facture
// pour un look uniforme : logo, en-tête, filet, pied de page numéroté, palette, et une page de
// LETTRE DE PRÉSENTATION pro. jsPDF est passé en paramètre (import dynamique côté appelant).

export const PDF = {
  W: 612, H: 792, M: 40,                  // format lettre (points)
  colors: {
    ink: [17, 24, 39] as [number, number, number],
    gray: [107, 114, 128] as [number, number, number],
    line: [225, 225, 225] as [number, number, number],
    brand: [39, 125, 161] as [number, number, number],   // #277da1 (cohérent DGA)
    green: [5, 150, 105] as [number, number, number],
  },
};

// Charge une image (URL ou data:) en data-URL base64 pour jsPDF.addImage. null si échec.
export async function loadImg(url?: string | null): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:')) return url;
  try {
    const res = await fetch(url); const blob = await res.blob();
    return await new Promise(r => { const fr = new FileReader(); fr.onloadend = () => r(fr.result as string); fr.onerror = () => r(null); fr.readAsDataURL(blob); });
  } catch { return null; }
}

// Date française longue : « Sherbrooke, le 15 juin 2026 » (ville optionnelle).
export function frLongDate(d: Date = new Date(), ville?: string): string {
  const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const jour = d.getDate();
  const txt = `le ${jour === 1 ? '1er' : jour} ${mois[d.getMonth()]} ${d.getFullYear()}`;
  return ville ? `${ville}, ${txt}` : txt;
}

// En-tête de marque : logo (gauche) + titre/sous-titre (droite) + filet. Retourne le y sous l'en-tête.
export function drawLetterhead(doc: any, opts: { logo?: string | null; title?: string; subtitle?: string; y?: number }): number {
  const { M, W, colors } = PDF; const R = W - M; let y = opts.y ?? M;
  if (opts.logo) { try { doc.addImage(opts.logo, 'PNG', M, y, 120, 36); } catch { /* ignore */ } }
  if (opts.title) {
    doc.setTextColor(...colors.ink); doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
    doc.text(opts.title, R, y + 16, { align: 'right' });
  }
  if (opts.subtitle) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...colors.gray);
    doc.text(opts.subtitle, R, y + 32, { align: 'right' });
  }
  y += 50;
  doc.setDrawColor(...colors.line); doc.setLineWidth(0.6); doc.line(M, y, R, y);
  return y + 14;
}

// Pieds de page numérotés + mention, sur TOUTES les pages. À appeler en fin de génération.
export function applyFooters(doc: any, note: string): void {
  const { M, W, H, colors } = PDF; const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...colors.gray);
    if (note) doc.text(note, M, H - 24, { maxWidth: W - 2 * M });
    doc.text(`${p} / ${total}`, W - M, H - 24, { align: 'right' });
  }
}

export type CoverLetterData = {
  logo?: string | null;
  ville?: string;
  date?: string;                 // texte déjà formaté ; sinon frLongDate(today, ville)
  destinataire?: string[];       // lignes (nom, compagnie, adresse, ville/CP)
  objet?: string;
  votreClient?: string;
  notreDossier?: string;
  numero?: string;               // n° de soumission (référence)
  body?: string;                 // canevas multi-paragraphes (\n entre paragraphes)
  salutation?: string;
  signataireNom?: string;
  signataireTitre?: string;
  signatureUrl?: string | null;  // image de signature (data/URL déjà chargée en base64)
  companyName?: string;
};

// Rend UNE page de lettre de présentation pro (sur la page courante du doc).
export function drawCoverLetterPage(doc: any, d: CoverLetterData): void {
  const { M, W, H, colors } = PDF; const R = W - M;
  let y = drawLetterhead(doc, { logo: d.logo, title: 'OFFRE DE SERVICE', subtitle: d.numero || '' });

  // Lieu + date (droite)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...colors.ink);
  doc.text(d.date || frLongDate(new Date(), d.ville), R, y + 6, { align: 'right' });
  y += 28;

  // Bloc destinataire
  doc.setFontSize(10.5); doc.setTextColor(...colors.ink);
  for (const ln of (d.destinataire || []).filter(Boolean)) { doc.text(String(ln), M, y); y += 14; }
  y += 10;

  // Objet / Votre client / Notre dossier
  const meta: [string, string | undefined][] = [['Objet', d.objet], ['Votre client', d.votreClient], ['Notre dossier', d.notreDossier]];
  for (const [k, v] of meta) {
    if (!v) continue;
    doc.setFont('helvetica', 'bold'); doc.text(`${k} : `, M, y);
    const kw = doc.getTextWidth(`${k} : `);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(String(v), R - M - kw);
    doc.text(lines, M + kw, y); y += 14 * Math.max(1, lines.length);
  }
  y += 12;

  // Corps (canevas)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); doc.setTextColor(...colors.ink);
  const parags = String(d.body || '').split('\n').filter(p => p.trim() !== '' || true);
  for (const para of parags) {
    if (para.trim() === '') { y += 8; continue; }
    const lines = doc.splitTextToSize(para, R - M);
    for (const ln of lines) {
      if (y > H - 140) { doc.addPage(); y = PDF.M; }
      doc.text(ln, M, y); y += 15;
    }
    y += 6;
  }

  // Salutation + signature
  y += 8;
  if (d.salutation) { const sl = doc.splitTextToSize(d.salutation, R - M); doc.text(sl, M, y); y += 15 * sl.length + 10; }
  if (d.signatureUrl) { try { doc.addImage(d.signatureUrl, 'PNG', M, y, 120, 40); y += 44; } catch { /* ignore */ } }
  else { y += 30; }
  doc.setDrawColor(...colors.line); doc.line(M, y, M + 200, y); y += 14;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(...colors.ink);
  if (d.signataireNom) doc.text(d.signataireNom, M, y);
  if (d.signataireTitre) { doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(...colors.gray); doc.text(d.signataireTitre, M, y + 13); }
}
