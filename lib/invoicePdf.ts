// Génération du PDF d'une facture de commerce (jsPDF + autotable).
// Reprend le logo du tenant (company_settings.logo_url) ou le logo par défaut.
import { getInvoiceItems, getCompanySettings, TAX_BY_PROVINCE, type Invoice } from '@/lib/invoicing';
import { applyFooters } from '@/lib/pdf/letterhead';

const mny = (n: number) => `${(Number(n) || 0).toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;

async function toDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise(resolve => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = () => resolve(null);
      fr.readAsDataURL(blob);
    });
  } catch { return null; }
}

export async function exportInvoicePdf(tenant: string, invoice: Invoice): Promise<void> {
  const [items, company] = await Promise.all([getInvoiceItems(tenant, invoice.id!), getCompanySettings(tenant)]);
  const { default: jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const W = doc.internal.pageSize.getWidth();
  const M = 40;
  let y = 40;
  // Style du module « facture » (Modèles PDF) — accent + épaisseur, défaut accent DGA #277da1.
  const st = await import('@/lib/pdfStyle').then(m => m.pdfStyleFor(tenant, 'facture')).catch(() => null);
  const ACCENT: [number, number, number] = st?.accent || [39, 125, 161];

  // Logo (tenant ou défaut)
  const logo = await toDataUrl(company?.logo_url || '/c-secur360-logo.png');
  // Logo à RATIO PRÉSERVÉ (largeur auto via 0) — ne pas déformer (cohérent DGA).
  if (logo) { try { doc.addImage(logo, 'PNG', M, y, 0, 38); } catch { /* ignore */ } }

  // Coordonnées entreprise (à droite)
  doc.setFontSize(10); doc.setTextColor(40);
  const right = (txt: string, dy: number) => { doc.text(txt, W - M, dy, { align: 'right' }); };
  let ry = y + 6;
  if (company?.legal_name) { doc.setFont('helvetica', 'bold'); right(company.legal_name, ry); doc.setFont('helvetica', 'normal'); ry += 14; }
  for (const line of [company?.address, [company?.city, company?.province, company?.postal_code].filter(Boolean).join(', '), company?.phone, company?.email].filter(Boolean) as string[]) { right(line, ry); ry += 13; }
  if (company?.gst_number) { right(`TPS/TVH : ${company.gst_number}`, ry); ry += 13; }
  if (company?.qst_number) { right(`TVQ : ${company.qst_number}`, ry); ry += 13; }

  y = Math.max(y + 56, ry) + 16;

  // Titre + métadonnées
  doc.setFontSize(20); doc.setFont('helvetica', 'bold'); doc.setTextColor(...ACCENT); // accent du module
  doc.text('FACTURE', M, y);
  doc.setTextColor(20);
  doc.setFontSize(10); doc.setFont('helvetica', 'normal'); doc.setTextColor(60);
  doc.text(`N° ${invoice.invoice_number}`, M, y + 16);
  doc.text(`Date : ${invoice.issue_date}`, M, y + 30);
  if (invoice.due_date) doc.text(`Échéance : ${invoice.due_date}`, M, y + 44);

  // Bloc client
  doc.setFont('helvetica', 'bold'); doc.setTextColor(40);
  doc.text('Facturé à', W - M - 200, y, { align: 'left' });
  doc.setFont('helvetica', 'normal'); doc.setTextColor(60);
  doc.text(invoice.client_snapshot?.name || '—', W - M - 200, y + 16);

  y += 60;

  // Lignes
  autoTable(doc, {
    startY: y,
    head: [['Description', 'Qté', 'Prix unitaire', 'Montant']],
    body: items.map(it => [it.description, String(it.quantity), mny(it.unit_price), mny((Number(it.quantity) || 0) * (Number(it.unit_price) || 0))]),
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: ACCENT, textColor: 255 },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
    margin: { left: M, right: M },
  });

  let ty = (doc as any).lastAutoTable.finalY + 16;
  const tax = TAX_BY_PROVINCE[invoice.province] || TAX_BY_PROVINCE.QC;
  const totLine = (label: string, val: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 12 : 10);
    doc.text(label, W - M - 160, ty, { align: 'left' });
    doc.text(val, W - M, ty, { align: 'right' });
    ty += bold ? 20 : 15;
  };
  totLine('Sous-total', mny(invoice.subtotal));
  if (Number(invoice.gst_amount) > 0) totLine(`TPS (${(tax.gst * 100).toFixed(0)} %)`, mny(invoice.gst_amount));
  if (Number(invoice.qst_amount) > 0) totLine(`TVQ (${(tax.qst * 100).toFixed(3)} %)`, mny(invoice.qst_amount));
  if (Number(invoice.pst_amount) > 0) totLine(`${tax.pstLabel || 'Taxe'} (${(tax.pst * 100).toFixed(0)} %)`, mny(invoice.pst_amount));
  totLine('TOTAL', mny(invoice.total), true);

  // Conditions + paiement + notes
  ty += 10;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(90);
  if (invoice.payment_terms) { doc.text(`Conditions : ${invoice.payment_terms}`, M, ty); ty += 13; }
  if (company?.bank_details) { doc.text(`Paiement : ${company.bank_details}`, M, ty); ty += 13; }
  if (invoice.notes) { doc.text(`Notes : ${invoice.notes}`, M, ty, { maxWidth: W - 2 * M }); }

  // Pied de page numéroté (socle partagé — cohérent avec soumission/feuille de temps).
  applyFooters(doc, `${company?.legal_name || 'C-Secur360'} · Facture ${invoice.invoice_number}`);
  doc.save(`Facture-${invoice.invoice_number}.pdf`);
}
