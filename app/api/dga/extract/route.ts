import { NextRequest, NextResponse } from 'next/server';
import { getAiBudget } from '@/lib/aiBudget';
import { aiGuard } from '@/lib/aiGuard';
import { extractDgaFromPdf, DgaExtractError } from '@/lib/dga/importServer';

// #DGA — Extraction IA d'un rapport PDF de labo (DGA + qualité huile) vers JSON structuré.
// Proxy SERVEUR de l'appel Anthropic : la clé (ANTHROPIC_API_KEY) reste côté serveur — jamais
// exposée au navigateur. La logique d'extraction est factorisée dans lib/dga/importServer
// (extractDgaFromPdf), partagée avec le webhook d'import par courriel.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300; // PDF dense -> appel Anthropic plus long ; evite FUNCTION_INVOCATION_TIMEOUT

export async function POST(req: NextRequest) {
  const guard = await aiGuard(req); if (guard.err) return guard.err; // auth + anti-abus

  // Accepte le fichier BRUT en multipart (préféré, plus léger) ou l'ancien JSON base64 (compat).
  let pdfBase64 = '';
  let tenant = '';
  const ctype = req.headers.get('content-type') || '';
  if (ctype.includes('multipart/form-data')) {
    try {
      const fd = await req.formData();
      const file = fd.get('file') as File | null;
      tenant = String(fd.get('tenant') || '').trim();
      if (file) { const buf = Buffer.from(await file.arrayBuffer()); pdfBase64 = buf.toString('base64'); }
    } catch { return NextResponse.json({ error: 'Fichier invalide' }, { status: 400 }); }
  } else {
    let body: any = {};
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
    pdfBase64 = body.pdfBase64 || '';
    tenant = String(body.tenant || '').trim();
  }
  if (!pdfBase64) return NextResponse.json({ error: 'pdfBase64 requis' }, { status: 400 });
  if (guard.user?.tenant_id) tenant = guard.user.tenant_id; // budget scopé au tenant de session
  if (tenant) { const budget = await getAiBudget(tenant); if (budget.exhausted) return NextResponse.json({ error: 'Forfait IA épuisé — demandez un renouvellement.', exhausted: true }, { status: 402 }); }

  try {
    const { transformers } = await extractDgaFromPdf(pdfBase64, tenant);
    return NextResponse.json({ ok: true, transformers, equipment: transformers[0]?.equipment, measurements: transformers[0]?.measurements });
  } catch (e: any) {
    if (e instanceof DgaExtractError) return NextResponse.json({ error: e.message, ...(e.info ? { raw: e.info } : {}) }, { status: e.status });
    return NextResponse.json({ error: e?.message || 'Erreur extraction' }, { status: 500 });
  }
}
