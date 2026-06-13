import { NextRequest, NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
import { chromium as pw } from 'playwright-core';
import { requireAdmin } from '@/lib/apiAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// CAPTURE D'ÉCRAN RÉELLE du tenant démo (CERDIA) — exécute Playwright CÔTÉ SERVEUR (chromium serverless).
// Sécurité (inchangée) : le robot se connecte comme un UTILISATEUR NORMAL via le compte démo
// (MKT_DEMO_EMAIL/MKT_DEMO_PASSWORD) -> ne voit que ce que la RLS/les accès autorisent, AUCUN
// contournement service-role pour LIRE des données. Les images (écrans publics, données fictives) sont
// ensuite rangées dans le bucket « marketing » via service_role (écriture serveur) et listées comme
// images de bibliothèque -> piochables dans l'assembleur vidéo.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const BUCKET = 'marketing';
const TENANT_DB = 'cerdia'; // namespacing des actifs (tenant plateforme du studio)

export async function POST(req: NextRequest) {
  const gate = await requireAdmin(req); if (!gate.ok) return gate.res;

  let body: any = {};
  try { body = await req.json(); } catch { /* */ }

  // Identifiants du compte démo : variables d'env Vercel OU, à défaut, saisis dans le studio par le
  // super-admin (transmis uniquement pour CETTE capture, jamais stockés). Le robot se connecte avec un
  // compte NORMAL (RLS/accès respectés) — aucune lecture privilégiée.
  const email = process.env.MKT_DEMO_EMAIL || (typeof body.demoEmail === 'string' ? body.demoEmail.trim() : '');
  const password = process.env.MKT_DEMO_PASSWORD || (typeof body.demoPassword === 'string' ? body.demoPassword : '');
  if (!email || !password) {
    return NextResponse.json({ error: 'Compte démo requis : saisis l\'email et le mot de passe d\'un compte démo CERDIA dans le studio (ou définis MKT_DEMO_EMAIL/MKT_DEMO_PASSWORD sur Vercel).' }, { status: 503 });
  }
  const steps: any[] = Array.isArray(body?.plan?.steps) ? body.plan.steps : (Array.isArray(body?.steps) ? body.steps : []);
  if (!steps.length) return NextResponse.json({ error: 'Plan de capture vide (génère-le d\'abord).' }, { status: 400 });
  const urlTenant = String(body?.tenant || 'cerdia').replace(/[^a-z0-9_-]/gi, '') || 'cerdia';
  const base = (process.env.MKT_BASE_URL || req.nextUrl.origin).replace(/\/+$/, '');
  const limited = steps.slice(0, 8); // borne le temps d'exécution (timeout serverless)

  let browser: any = null;
  try {
    browser = await pw.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();

    // 1) Connexion (utilisateur normal — RLS/accès respectés).
    await page.goto(`${base}/${urlTenant}/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.fill('input[type="email"], input[name="email"]', email).catch(() => {});
    await page.fill('input[type="password"], input[name="password"]', password).catch(() => {});
    await Promise.all([
      page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {}),
      page.click('button[type="submit"], button:has-text("Connexion"), button:has-text("Se connecter")').catch(() => {}),
    ]);
    await page.waitForTimeout(1500);

    const captured: { scene?: string; url: string }[] = [];
    const errors: { scene?: string; error: string }[] = [];

    for (let i = 0; i < limited.length; i++) {
      const s = limited[i];
      const fname = (s.filename || `${String(i + 1).padStart(2, '0')}-scene.png`).replace(/[^a-z0-9._-]/gi, '_');
      try {
        const route = String(s.route || '').startsWith('/') ? s.route : `/${s.route || ''}`;
        await page.goto(`${base}/${urlTenant}${route}`, { waitUntil: 'networkidle', timeout: 20000 });
        for (const a of (s.actions || [])) {
          try {
            if (a.type === 'click' && a.selector) await page.click(a.selector, { timeout: 4000 });
            else if (a.type === 'fill' && a.selector) await page.fill(a.selector, a.value || '');
            else if (a.type === 'wait') await page.waitForTimeout(Math.min(Number(a.ms) || 500, 3000));
          } catch { /* action optionnelle */ }
        }
        await page.waitForTimeout(500);
        if (s.highlight) {
          await page.evaluate((sel: string) => { const el = document.querySelector(sel) as HTMLElement | null; if (el) { el.style.outline = '3px solid #ff7a45'; el.style.outlineOffset = '2px'; } }, s.highlight).catch(() => {});
        }
        const buf: Buffer = await page.screenshot({ fullPage: !!s.full_page, type: 'png' });
        const dest = `captures/${crypto.randomUUID()}-${fname}`;
        const up = await supabaseAdmin.storage.from(BUCKET).upload(dest, buf, { contentType: 'image/png', upsert: true });
        if (up.error) { errors.push({ scene: s.scene, error: up.error.message }); continue; }
        const publicUrl = supabaseAdmin.storage.from(BUCKET).getPublicUrl(dest).data.publicUrl;
        await supabaseAdmin.from('marketing_assets').insert({ tenant_id: TENANT_DB, kind: 'library_image', data: { url: publicUrl, name: s.scene || fname } });
        captured.push({ scene: s.scene, url: publicUrl });
      } catch (e: any) {
        errors.push({ scene: s.scene, error: e?.message || String(e) });
      }
    }

    await browser.close(); browser = null;
    if (!captured.length) {
      return NextResponse.json({ error: 'Aucune capture réussie. Vérifie le compte démo et les pages du plan.', errors }, { status: 502 });
    }
    return NextResponse.json({ ok: true, captured, errors, total: limited.length });
  } catch (e: any) {
    const msg = e?.message || String(e);
    return NextResponse.json({ error: 'Robot de capture : ' + (/executablePath|Executable|browserType|Protocol/i.test(msg) ? 'chromium serverless indisponible sur cet environnement.' : msg) }, { status: 500 });
  } finally {
    if (browser) { try { await browser.close(); } catch { /* */ } }
  }
}
