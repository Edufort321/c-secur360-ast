import { NextRequest, NextResponse } from 'next/server';
import { resolveAccess, canShareholders, effectiveTenant } from '@/lib/hrAccess';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAccountMap, createEntryAdmin, entryExists } from '@/lib/accountingServer';

// Dividendes : déclaration (répartie au prorata des actions détenues) + versement, le tout
// comptabilisé au GL. Déclaration : DR 3300 Dividendes déclarés / CR 2350 Dividendes à payer.
// Versement : DR 2350 Dividendes à payer / CR 1000 Banque. Données sensibles (direction/super_user).
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function guard(req: NextRequest, reqTenant?: string | null) {
  const acc = await resolveAccess(req);
  if (!acc) return { err: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) };
  if (!canShareholders(acc.level)) return { err: NextResponse.json({ error: 'Accès refusé (dividendes)' }, { status: 403 }) };
  const tenant = effectiveTenant(acc, reqTenant);
  if (!tenant) return { err: NextResponse.json({ error: 'Tenant introuvable' }, { status: 400 }) };
  return { acc, tenant };
}

export async function GET(req: NextRequest) {
  const g = await guard(req, new URL(req.url).searchParams.get('tenant')); if (g.err) return g.err;
  const tenant = g.tenant!;
  const [{ data: decl }, { data: pays }, { data: sh }] = await Promise.all([
    supabaseAdmin.from('dividend_declarations').select('*').eq('tenant_id', tenant).order('declaration_date', { ascending: false }),
    supabaseAdmin.from('dividend_payments').select('*').eq('tenant_id', tenant),
    supabaseAdmin.from('shareholders').select('id, full_name').eq('tenant_id', tenant),
  ]);
  const nameMap: Record<string, string> = {}; (sh || []).forEach((s: any) => { nameMap[s.id] = s.full_name; });
  const payments = (pays || []).map((p: any) => ({ ...p, shareholder_name: nameMap[p.shareholder_id] || '—' }));
  return NextResponse.json({ declarations: decl || [], payments });
}

export async function POST(req: NextRequest) {
  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const g = await guard(req, body.tenant); if (g.err) return g.err;
  const tenant = g.tenant!;

  if (body.kind === 'declare') return declare(tenant, body.declaration || {});
  if (body.kind === 'pay') return settle(tenant, body.declarationId);
  if (body.kind === 'cancel') return cancel(tenant, body.declarationId);
  return NextResponse.json({ error: 'kind inconnu' }, { status: 400 });
}

// Déclare un dividende : calcule la détention par actionnaire (option : par catégorie),
// répartit le montant au prorata, crée les versements (pending) et poste l'écriture de déclaration.
async function declare(tenant: string, d: any) {
  if (!d.declaration_date) return NextResponse.json({ error: 'Date de déclaration requise' }, { status: 400 });
  const total = Number(d.total_amount) || 0;
  const perShareIn = Number(d.per_share) || 0;
  if (total <= 0 && perShareIn <= 0) return NextResponse.json({ error: 'Montant total ou par action requis' }, { status: 400 });

  // détention par actionnaire (filtrée par catégorie si fournie)
  let q = supabaseAdmin.from('share_transactions').select('shareholder_id, shares, share_class_id').eq('tenant_id', tenant);
  if (d.share_class_id) q = q.eq('share_class_id', d.share_class_id);
  const { data: txns } = await q;
  const hold: Record<string, number> = {};
  (txns || []).forEach((t: any) => { hold[t.shareholder_id] = (hold[t.shareholder_id] || 0) + (Number(t.shares) || 0); });
  const holders = Object.entries(hold).filter(([, s]) => (s as number) > 0);
  const totalShares = holders.reduce((s, [, n]) => s + (n as number), 0);
  if (totalShares <= 0) return NextResponse.json({ error: 'Aucune action en circulation pour répartir le dividende.' }, { status: 400 });

  const perShare = perShareIn > 0 ? perShareIn : total / totalShares;
  const totalAmount = total > 0 ? total : perShare * totalShares;

  const { data: declRow, error: de } = await supabaseAdmin.from('dividend_declarations').insert({
    tenant_id: tenant, declaration_date: d.declaration_date, record_date: d.record_date || null,
    payment_date: d.payment_date || null, share_class_id: d.share_class_id || null,
    dividend_type: d.dividend_type || 'eligible', total_amount: totalAmount, per_share: perShare,
    status: 'declared', notes: d.notes || null, updated_at: new Date().toISOString(),
  }).select('id').single();
  if (de) return NextResponse.json({ error: de.message }, { status: 400 });
  const declId = (declRow as any).id;

  const payRows = holders.map(([shareholder_id, shares]) => ({
    tenant_id: tenant, declaration_id: declId, shareholder_id, shares: shares as number,
    amount: Math.round((shares as number) * perShare * 100) / 100, status: 'pending',
  }));
  if (payRows.length) await supabaseAdmin.from('dividend_payments').insert(payRows);

  // Écriture de déclaration : DR 3300 / CR 2350 (best-effort).
  try {
    const m = await getAccountMap(tenant);
    if (m['3300'] && m['2350'] && !(await entryExists(tenant, 'dividend_decl', declId))) {
      const entryId = await createEntryAdmin(tenant, {
        entry_date: d.declaration_date, description: `Déclaration de dividende`, journal_code: 'OD',
        source_type: 'dividend_decl', source_id: declId,
        lines: [{ account_id: m['3300'], debit: totalAmount, credit: 0, description: 'Dividendes déclarés' }, { account_id: m['2350'], debit: 0, credit: totalAmount, description: 'Dividendes à payer' }],
      });
      await supabaseAdmin.from('dividend_declarations').update({ gl_entry_id: entryId }).eq('id', declId);
    }
  } catch { /* écriture best-effort */ }
  return NextResponse.json({ ok: true, id: declId, per_share: perShare, total: totalAmount, count: payRows.length });
}

// Verse le dividende : marque déclaration + versements payés et poste DR 2350 / CR 1000.
async function settle(tenant: string, declId: string) {
  if (!declId) return NextResponse.json({ error: 'declarationId requis' }, { status: 400 });
  const { data: decl } = await supabaseAdmin.from('dividend_declarations').select('*').eq('id', declId).eq('tenant_id', tenant).maybeSingle();
  if (!decl) return NextResponse.json({ error: 'Déclaration introuvable' }, { status: 404 });
  if ((decl as any).status === 'cancelled') return NextResponse.json({ error: 'Déclaration annulée.' }, { status: 400 });
  const today = new Date().toISOString().slice(0, 10);
  const payDate = (decl as any).payment_date || today;
  await supabaseAdmin.from('dividend_payments').update({ status: 'paid', paid_date: payDate }).eq('declaration_id', declId).eq('tenant_id', tenant);
  await supabaseAdmin.from('dividend_declarations').update({ status: 'paid', payment_date: payDate, updated_at: new Date().toISOString() }).eq('id', declId);
  try {
    const m = await getAccountMap(tenant);
    const total = Number((decl as any).total_amount) || 0;
    if (m['2350'] && m['1000'] && total > 0 && !(await entryExists(tenant, 'dividend_pay', declId))) {
      await createEntryAdmin(tenant, {
        entry_date: payDate, description: `Versement de dividende`, journal_code: 'BNK',
        source_type: 'dividend_pay', source_id: declId,
        lines: [{ account_id: m['2350'], debit: total, credit: 0, description: 'Dividendes à payer' }, { account_id: m['1000'], debit: 0, credit: total, description: 'Banque' }],
      });
    }
  } catch { /* best-effort */ }
  return NextResponse.json({ ok: true });
}

// Annule une déclaration NON versée + contre-passe l'écriture de déclaration.
async function cancel(tenant: string, declId: string) {
  if (!declId) return NextResponse.json({ error: 'declarationId requis' }, { status: 400 });
  const { data: decl } = await supabaseAdmin.from('dividend_declarations').select('*').eq('id', declId).eq('tenant_id', tenant).maybeSingle();
  if (!decl) return NextResponse.json({ error: 'Déclaration introuvable' }, { status: 404 });
  if ((decl as any).status === 'paid') return NextResponse.json({ error: 'Déjà versé — impossible d\'annuler.' }, { status: 400 });
  await supabaseAdmin.from('dividend_declarations').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', declId);
  // Contre-passation de la déclaration (DR 2350 / CR 3300).
  try {
    const m = await getAccountMap(tenant);
    const total = Number((decl as any).total_amount) || 0;
    if ((decl as any).gl_entry_id && m['3300'] && m['2350'] && total > 0 && !(await entryExists(tenant, 'dividend_cancel', declId))) {
      await createEntryAdmin(tenant, {
        entry_date: new Date().toISOString().slice(0, 10), description: `Annulation de déclaration de dividende`, journal_code: 'OD',
        source_type: 'dividend_cancel', source_id: declId,
        lines: [{ account_id: m['2350'], debit: total, credit: 0, description: 'Dividendes à payer' }, { account_id: m['3300'], debit: 0, credit: total, description: 'Dividendes déclarés' }],
      });
    }
  } catch { /* best-effort */ }
  return NextResponse.json({ ok: true });
}
