// Socle PDF de MARQUE partagé — FIDÈLE au module DGA (lib/dga/report.ts) : même marge (M=42),
// même palette GRIS (pas de couleur d'accent), logo à RATIO PRÉSERVÉ (largeur auto), en-tête
// logo+métadonnées+filet, pied de page numéroté. Réutilisé par Soumission, Feuille de temps,
// Facture et Rapports pour un rendu identique. jsPDF passé en paramètre (import dynamique côté appelant).

export const PDF = {
  W: 612, H: 792, M: 42,                       // lettre (points), marge DGA
  colors: {
    ink: [20, 20, 20] as [number, number, number],
    gray: [60, 60, 60] as [number, number, number],
    grayMid: [80, 80, 80] as [number, number, number],
    grayLight: [120, 120, 120] as [number, number, number],
    line: [210, 210, 210] as [number, number, number],
    lineSoft: [225, 225, 225] as [number, number, number],
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

// Logo À RATIO PRÉSERVÉ : on fixe la HAUTEUR et on laisse jsPDF calculer la largeur (width = 0).
// C'est la méthode DGA (addImage(logo,'PNG',M,22,0,24)) — ne déforme jamais le logo.
export function drawLogo(doc: any, logo: string | null | undefined, x: number, y: number, height = 24): void {
  if (!logo) return;
  try { doc.addImage(logo, 'PNG', x, y, 0, height); } catch { /* ignore */ }
}

// En-tête de page façon DGA : logo (gauche, ratio préservé) + lignes de métadonnées alignées à
// DROITE (1re en gras) + filet. Retourne le y du contenu (60). Appeler en haut de CHAQUE page.
export function drawHeader(doc: any, opts: { logo?: string | null; rightLines?: string[]; accent?: [number, number, number] }): number {
  const { M, W, colors } = PDF;
  drawLogo(doc, opts.logo, M, 22, 24);
  const lines = (opts.rightLines || []).filter(Boolean);
  doc.setFontSize(8); doc.setTextColor(...colors.gray);
  let ry = 30;
  lines.forEach((ln, i) => { doc.setFont('helvetica', i === 0 ? 'bold' : 'normal'); doc.text(String(ln), W - M, ry, { align: 'right' }); ry += 12; });
  doc.setFont('helvetica', 'normal');
  // Filet d'en-tête : teinté à la COULEUR D'ACCENT du module si fournie (sinon gris sobre DGA).
  doc.setDrawColor(...(opts.accent || colors.line)); doc.setLineWidth(opts.accent ? 1 : 0.6); doc.line(M, 50, W - M, 50);
  return 60;
}

// Titre de document (corps), façon DGA : titre gras 14 (encre) + sous-titre 11 (gris). Retourne le y suivant.
export function drawTitle(doc: any, y: number, title: string, subtitle?: string, accent?: [number, number, number]): number {
  const { M, colors } = PDF;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor(...(accent || colors.ink));
  doc.text(title, M, y); y += subtitle ? 18 : 22;
  if (subtitle) { doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(...colors.gray); doc.text(subtitle, M, y); y += 18; }
  return y;
}

// Pieds de page numérotés + mention, sur TOUTES les pages (façon DGA). À appeler en fin de génération.
export function applyFooters(doc: any, note: string): void {
  const { M, W, H, colors } = PDF; const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(...colors.grayLight);
    if (note) doc.text(note, M, H - 24, { maxWidth: W - 2 * M } as any);
    doc.text(`${p} / ${total}`, W - M, H - 14, { align: 'right' });
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

// Rend UNE page de lettre de présentation pro, style DGA (gris, logo à ratio préservé).
export function drawCoverLetterPage(doc: any, d: CoverLetterData): void {
  const { M, W, H, colors } = PDF; const R = W - M;
  let y = drawHeader(doc, { logo: d.logo, rightLines: [d.companyName || '', d.numero ? `Réf. : ${d.numero}` : ''] });
  y += 6;

  // Lieu + date (droite)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...colors.ink);
  doc.text(d.date || frLongDate(new Date(), d.ville), R, y, { align: 'right' });
  y += 26;

  // Bloc destinataire
  doc.setFontSize(10.5); doc.setTextColor(...colors.ink);
  for (const ln of (d.destinataire || []).filter(Boolean)) { doc.text(String(ln), M, y); y += 14; }
  y += 12;

  // Objet / Votre client / Notre dossier
  const meta: [string, string | undefined][] = [['Objet', d.objet], ['Votre client', d.votreClient], ['Notre dossier', d.notreDossier]];
  for (const [k, v] of meta) {
    if (!v) continue;
    doc.setFont('helvetica', 'bold'); doc.setTextColor(...colors.ink); doc.text(`${k} : `, M, y);
    const kw = doc.getTextWidth(`${k} : `);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(String(v), R - M - kw);
    doc.text(lines, M + kw, y); y += 14 * Math.max(1, lines.length);
  }
  y += 12;

  // Corps (canevas)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); doc.setTextColor(...colors.ink);
  for (const para of String(d.body || '').split('\n')) {
    if (para.trim() === '') { y += 8; continue; }
    for (const ln of doc.splitTextToSize(para, R - M)) {
      if (y > H - 140) { doc.addPage(); y = PDF.M; }
      doc.text(ln, M, y); y += 15;
    }
    y += 6;
  }

  // Salutation + signature
  y += 8;
  if (d.salutation) { const sl = doc.splitTextToSize(d.salutation, R - M); doc.text(sl, M, y); y += 15 * sl.length + 10; }
  if (d.signatureUrl) { drawLogo(doc, d.signatureUrl, M, y, 40); y += 44; } else { y += 30; }
  doc.setDrawColor(...colors.line); doc.line(M, y, M + 200, y); y += 14;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10.5); doc.setTextColor(...colors.ink);
  if (d.signataireNom) doc.text(d.signataireNom, M, y);
  if (d.signataireTitre) { doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5); doc.setTextColor(...colors.gray); doc.text(d.signataireTitre, M, y + 13); }
}
