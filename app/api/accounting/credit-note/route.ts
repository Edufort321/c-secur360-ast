// Note de crédit (P2-1) : annule tout/partie d'une facture + contre-écriture GL. canHr.
// body { tenant?, invoiceId, mode:'full'|'partial', subtotal?, reason?, refunded?, treasuryCode? }
//  - Contre-passation : DR 4000 (revenu) + DR 2100/2110 (taxes) / CR 1100 (clients).
//  - Si refunded : écriture additionnelle DR 1100 / CR banque (remboursement en argent).
import { NextRequest, NextResponse } from 'next/server';
import { resolveAccess, canHr, effectiveTenant, effectiveLevelFor } from '@/lib/hrAccess';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createEntryAdmin, getAccountMap } from '@/lib/accountingServer';
import { TAX_BY_PROVINCE } from '@/lib/invoicing';
import { nextCreditNoteNumber } from '@/lib/creditNotes';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const r2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

export async function POST(req: NextRequest) {
  const acc = await resolveAccess(req);
  if (!acc) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const tenant = effectiveTenant(acc, body.tenant);
  if (!canHr(await effectiveLevelFor(acc, tenant))) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  if (!body.invoiceId) return NextResponse.json({ error: 'invoiceId requis' }, { status: 400 });

  const { data: inv } = await supabaseAdmin.from('commerce_invoices').select('*').eq('id', body.invoiceId).eq('tenant_id', tenant).maybeSingle();
  if (!inv) return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 });
  const province = (inv as any).province || 'QC';

  // Montants crédités : facture complète, ou partiel (sous-total saisi → taxes recalculées par province).
  let subtotal: number, gst: number, qst: number, pst: number;
  if (body.mode === 'partial') {
    subtotal = r2(Math.abs(Number(body.subtotal) || 0));
    if (subtotal <= 0) return NextResponse.json({ error: 'Montant partiel invalide.' }, { status: 400 });
    const rate = TAX_BY_PROVINCE[province] || TAX_BY_PROVINCE.QC;
    gst = r2(subtotal * rate.gst); qst = r2(subtotal * rate.qst); pst = r2(subtotal * rate.pst);
  } else {
    subtotal = r2(Number((inv as any).subtotal) || 0); gst = r2(Number((inv as any).gst_amount) || 0);
    qst = r2(Number((inv as any).qst_amount) || 0); pst = r2(Number((inv as any).pst_amount) || 0);
  }
  const total = r2(subtotal + gst + qst + pst);
  if (total <= 0) return NextResponse.json({ error: 'Montant nul.' }, { status: 400 });

  const m = await getAccountMap(tenant);
  if (!m['1100'] || !m['4000']) return NextResponse.json({ error: 'Plan comptable non initialisé (1100/4000).' }, { status: 400 });

  // 1) Crée la note de crédit (pour obtenir l'id = clé d'idempotence des écritures).
  const number = await nextCreditNoteNumber(tenant);
  const { data: cnRow, error: cnErr } = await supabaseAdmin.from('commerce_credit_notes').insert({
    tenant_id: tenant, credit_note_number: number, invoice_id: (inv as any).id, invoice_number: (inv as any).invoice_number,
    client_name: (inv as any).client_snapshot?.name || null, issue_date: new Date().toISOString().slice(0, 10),
    reason: body.reason || null, province, subtotal, gst_amount: gst, qst_amount: qst, pst_amount: pst, total, refunded: !!body.refunded,
  }).select('id').single();
  if (cnErr) return NextResponse.json({ error: cnErr.message + ' (migration 245 ?)' }, { status: 400 });
  const cnId = (cnRow as any).id;

  try {
    // 2) Contre-passation de la vente : DR 4000 + DR 2100/2110 / CR 1100.
    const taxFed = r2(gst + pst);
    const lines = [
      { account_id: m['4000'], debit: subtotal, credit: 0, description: 'Annulation ventes (note de crédit)' },
      ...(taxFed > 0 && m['2100'] ? [{ account_id: m['2100'], debit: taxFed, credit: 0, description: 'TPS/TVH annulée' }] : []),
      ...(qst > 0 && m['2110'] ? [{ account_id: m['2110'], debit: qst, credit: 0, description: 'TVQ annulée' }] : []),
      { account_id: m['1100'], debit: 0, credit: total, description: 'Clients (réduction)' },
    ];
    const entryId = await createEntryAdmin(tenant, {
      entry_date: new Date().toISOString().slice(0, 10),
      description: `Note de crédit ${number} — facture ${(inv as any).invoice_number}`,
      reference: number, journal_code: 'VEN', source_type: 'credit_note', source_id: cnId, lines,
    });
    const patch: any = { gl_entry_id: entryId };

    // 3) Remboursement en argent (optionnel) : DR 1100 / CR banque.
    if (body.refunded) {
      const bank = (body.treasuryCode && m[body.treasuryCode]) || m['1000'];
      if (bank) {
        const refundId = await createEntryAdmin(tenant, {
          entry_date: new Date().toISOString().slice(0, 10),
          description: `Remboursement note de crédit ${number}`,
          reference: number, journal_code: 'BNK', source_type: 'credit_note_refund', source_id: cnId,
          lines: [{ account_id: m['1100'], debit: total, credit: 0, description: 'Clients (remboursement)' }, { account_id: bank, debit: 0, credit: total, description: 'Banque' }],
        });
        patch.refund_gl_entry_id = refundId;
      }
    }
    await supabaseAdmin.from('commerce_credit_notes').update(patch).eq('id', cnId);
    return NextResponse.json({ ok: true, id: cnId, number, total, subtotal, gst, qst, pst, refunded: !!body.refunded });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur de comptabilisation', id: cnId, number }, { status: 400 });
  }
}
