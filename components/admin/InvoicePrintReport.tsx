'use client';

// Facture imprimable (HTML) — même qualité/présentation que les rapports Soumission/DGA :
// en-tête société (logo + coordonnées), bloc « Facturé à », tableau des items, taxes (TPS/TVQ), total,
// conditions de paiement. Visible uniquement à l'impression (.inv-print-only) -> window.print() -> PDF.
import React from 'react';
import type { Invoice, InvoiceItem, CompanySettings } from '@/lib/invoicing';

const money = (n: number) => (Math.round((Number(n) || 0) * 100) / 100).toLocaleString('fr-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' $';

export function InvoicePrintReport(props: {
  invoice: Invoice; items: InvoiceItem[]; settings: CompanySettings; logo: string | null; headerColor?: string; clientName?: string;
}) {
  const { invoice: inv, items, settings: s, logo, headerColor, clientName } = props;
  const band = headerColor || '#0f52ba';
  const cs = inv.client_snapshot || {};
  const company = s.legal_name || 'C-Secur360';
  const compLines = [s.address, [s.city, s.province, s.postal_code].filter(Boolean).join(', '), s.phone, s.email, s.website].filter(Boolean) as string[];
  const taxLines = [s.gst_number ? `TPS/GST : ${s.gst_number}` : '', s.qst_number ? `TVQ/QST : ${s.qst_number}` : ''].filter(Boolean);

  const SP: Record<string, React.CSSProperties> = {
    wrap: { fontFamily: 'Arial, Helvetica, sans-serif', color: '#1a1a1a', fontSize: 11 },
    th: { textAlign: 'left', padding: '6px 8px', background: band, color: '#fff', fontSize: 10, fontWeight: 700 },
    thR: { textAlign: 'right', padding: '6px 8px', background: band, color: '#fff', fontSize: 10, fontWeight: 700 },
    td: { padding: '5px 8px', borderBottom: '0.5px solid #eee', fontSize: 10.5 },
    tdR: { padding: '5px 8px', borderBottom: '0.5px solid #eee', fontSize: 10.5, textAlign: 'right' },
    totRow: { display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 11 },
  };

  return (
    <div className="inv-print-only" style={SP.wrap}>
      <div style={{ height: 10, background: band }} />
      {/* En-tête : société (gauche) + FACTURE (droite) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '14px 0 10px', borderBottom: `2px solid ${band}` }}>
        <div>
          {logo && <img src={logo} alt="" style={{ height: 46, marginBottom: 6 }} />}
          <div style={{ fontWeight: 800, fontSize: 14 }}>{company}</div>
          {compLines.map((l, i) => <div key={i} style={{ fontSize: 10, color: '#555' }}>{l}</div>)}
          {taxLines.map((l, i) => <div key={i} style={{ fontSize: 9.5, color: '#888' }}>{l}</div>)}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 30, fontWeight: 900, color: band }}>FACTURE</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>N° {inv.invoice_number}</div>
          <div style={{ fontSize: 10, color: '#555', marginTop: 4 }}>Date : {inv.issue_date}</div>
          {inv.due_date && <div style={{ fontSize: 10, color: '#555' }}>Échéance : {inv.due_date}</div>}
          {inv.status === 'paid' && <div style={{ marginTop: 4, fontWeight: 800, color: '#059669' }}>✓ PAYÉE</div>}
        </div>
      </div>

      {/* Facturé à */}
      <div style={{ margin: '14px 0 10px' }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: band, letterSpacing: 1 }}>FACTURÉ À</div>
        <div style={{ fontWeight: 700, fontSize: 12 }}>{clientName || cs.name || '—'}</div>
        {cs.address && <div style={{ fontSize: 10, color: '#555' }}>{cs.address}</div>}
        {(cs.city || cs.lieu) && <div style={{ fontSize: 10, color: '#555' }}>{cs.lieu || [cs.city, cs.province, cs.postal_code].filter(Boolean).join(', ')}</div>}
        {cs.projet && <div style={{ fontSize: 10, color: '#777', marginTop: 2 }}>Projet : {cs.projet}</div>}
      </div>

      {/* Items */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 6 }}>
        <thead><tr><th style={SP.th}>Description</th><th style={SP.thR}>Qté</th><th style={SP.thR}>Prix unit.</th><th style={SP.thR}>Montant</th></tr></thead>
        <tbody>
          {(items || []).filter(it => it.description || it.subtotal).map((it, i) => (
            <tr key={i}>
              <td style={SP.td}>{it.description || '—'}{it.taxable === false ? <span style={{ color: '#999', fontSize: 9 }}> (non taxable)</span> : ''}</td>
              <td style={SP.tdR}>{Number(it.quantity) || 0}</td>
              <td style={SP.tdR}>{money(Number(it.unit_price) || 0)}</td>
              <td style={SP.tdR}>{money((Number(it.quantity) || 0) * (Number(it.unit_price) || 0))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totaux */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <div style={{ width: 260 }}>
          <div style={SP.totRow}><span>Sous-total</span><span>{money(inv.subtotal)}</span></div>
          {Number(inv.gst_amount) > 0 && <div style={SP.totRow}><span>TPS ({((inv.gst_rate || 0) * 100).toFixed(3).replace(/\.?0+$/, '')} %)</span><span>{money(inv.gst_amount)}</span></div>}
          {Number(inv.qst_amount) > 0 && <div style={SP.totRow}><span>TVQ ({((inv.qst_rate || 0) * 100).toFixed(3).replace(/\.?0+$/, '')} %)</span><span>{money(inv.qst_amount)}</span></div>}
          {Number(inv.pst_amount) > 0 && <div style={SP.totRow}><span>PST</span><span>{money(inv.pst_amount)}</span></div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, padding: '8px 10px', background: '#0f172a', color: '#fff', borderRadius: 6, fontWeight: 800, fontSize: 14 }}>
            <span>TOTAL</span><span>{money(inv.total)}</span>
          </div>
        </div>
      </div>

      {/* Conditions + notes */}
      {(inv.payment_terms || inv.notes || s.bank_details) && (
        <div style={{ marginTop: 22, borderTop: '0.5px solid #ddd', paddingTop: 10, fontSize: 10, color: '#444' }}>
          {inv.payment_terms && <div style={{ marginBottom: 4 }}><strong>Conditions :</strong> {inv.payment_terms}</div>}
          {inv.notes && <div style={{ marginBottom: 4, whiteSpace: 'pre-wrap' }}>{inv.notes}</div>}
          {s.bank_details && <div style={{ color: '#666', whiteSpace: 'pre-wrap' }}>{s.bank_details}</div>}
        </div>
      )}
      <div style={{ marginTop: 18, textAlign: 'center', fontSize: 9, color: '#999' }}>{company} · Merci de votre confiance</div>
    </div>
  );
}

export const INV_PRINT_CSS = `
@media screen { .inv-print-only { display: none !important; } }
@media print {
  @page { size: letter portrait; margin: 14mm; }
  html, body { background: #fff !important; margin: 0 !important; padding: 0 !important; }
  body > *:not(.inv-print-only) { display: none !important; }
  body * { visibility: hidden !important; }
  .inv-print-only, .inv-print-only * { visibility: visible !important; }
  .inv-print-only { display: block !important; position: static; width: 100%; color: #1a1a1a; }
  .inv-print-only table { break-inside: auto; }
  .inv-print-only tr { break-inside: avoid; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
}
`;
