// Robot de CAPTURE D'ÉCRAN marketing — pilote la vraie UI C-Secur360 via Playwright.
//
// Principe SÉCURITÉ : le robot se connecte comme un UTILISATEUR NORMAL (compte démo) et ne voit que ce
// que ce compte voit (RLS + niveaux d'accès respectés, aucun contournement service-role pour LIRE des
// données). Tenant = CERDIA (tenant démo d'Eric, données fictives).
//
// Prérequis (une fois) :
//   npm i -D playwright   &&   npx playwright install chromium
//
// Utilisation :
//   1) Génère le plan dans le Studio (« Plan de capture ») et enregistre-le en capture-plan.json
//   2) Configure les variables d'env (.env ou ligne de commande) :
//        MKT_BASE_URL   = https://www.cerdia.ai (ou http://localhost:3000)
//        MKT_TENANT     = cerdia
//        MKT_DEMO_EMAIL / MKT_DEMO_PASSWORD = compte démo (login normal)
//        (option upload) SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + MKT_BUCKET=marketing
//   3) node scripts/marketing-capture.mjs --plan capture-plan.json
//
// Sortie : images dans ./marketing-captures/ + capture-results.json (chemins + URLs si upload).

import { chromium } from 'playwright';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { Buffer } from 'node:buffer';

const arg = (name, def) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : def; };
const env = (k, def) => process.env[k] || def;

const BASE = (env('MKT_BASE_URL', 'http://localhost:3000')).replace(/\/+$/, '');
const TENANT = env('MKT_TENANT', 'cerdia');
const EMAIL = env('MKT_DEMO_EMAIL');
const PASSWORD = env('MKT_DEMO_PASSWORD');
const PLAN_FILE = arg('--plan', 'capture-plan.json');
const OUT_DIR = arg('--out', 'marketing-captures');
const SB_URL = env('SUPABASE_URL') || env('NEXT_PUBLIC_SUPABASE_URL');
const SB_KEY = env('SUPABASE_SERVICE_ROLE_KEY');
const BUCKET = env('MKT_BUCKET', 'marketing');

if (!EMAIL || !PASSWORD) { console.error('✗ MKT_DEMO_EMAIL et MKT_DEMO_PASSWORD requis (compte démo).'); process.exit(1); }

async function uploadToStorage(path, buffer) {
  if (!SB_URL || !SB_KEY) return null;
  const url = `${SB_URL.replace(/\/+$/, '')}/storage/v1/object/${BUCKET}/${path}`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SB_KEY}`, apikey: SB_KEY, 'Content-Type': 'image/png', 'x-upsert': 'true' },
    body: buffer,
  });
  if (!r.ok) { console.warn(`  ⚠ upload échoué (${r.status}) — image gardée localement`); return null; }
  return `${SB_URL.replace(/\/+$/, '')}/storage/v1/object/public/${BUCKET}/${path}`;
}

async function run() {
  const plan = JSON.parse(await readFile(PLAN_FILE, 'utf8'));
  const steps = Array.isArray(plan.steps) ? plan.steps : [];
  if (!steps.length) { console.error('✗ Aucune étape dans le plan.'); process.exit(1); }
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();

  // 1) Connexion comme utilisateur normal (sécurité respectée)
  console.log(`→ Connexion à ${BASE}/${TENANT} …`);
  await page.goto(`${BASE}/${TENANT}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"], input[name="email"]', EMAIL);
  await page.fill('input[type="password"], input[name="password"]', PASSWORD);
  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.click('button[type="submit"], button:has-text("Connexion"), button:has-text("Se connecter")'),
  ]).catch(() => {});
  await page.waitForTimeout(1500);

  const results = [];
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    const file = (s.filename || `${String(i + 1).padStart(2, '0')}-scene.png`).replace(/[^a-z0-9._-]/gi, '_');
    try {
      const route = s.route?.startsWith('/') ? s.route : `/${s.route || ''}`;
      console.log(`→ [${i + 1}/${steps.length}] ${s.scene || route}`);
      await page.goto(`${BASE}/${TENANT}${route}`, { waitUntil: 'networkidle' });
      for (const a of (s.actions || [])) {
        try {
          if (a.type === 'click' && a.selector) await page.click(a.selector, { timeout: 4000 });
          else if (a.type === 'fill' && a.selector) await page.fill(a.selector, a.value || '');
          else if (a.type === 'wait') await page.waitForTimeout(Number(a.ms) || 500);
        } catch { /* action optionnelle — on continue */ }
      }
      await page.waitForTimeout(500);
      if (s.highlight) {
        await page.evaluate((sel) => { const el = document.querySelector(sel); if (el) { el.style.outline = '3px solid #ff7a45'; el.style.outlineOffset = '2px'; } }, s.highlight).catch(() => {});
      }
      const buf = await page.screenshot({ fullPage: !!s.full_page });
      const localPath = `${OUT_DIR}/${file}`;
      await writeFile(localPath, buf);
      const uploaded = await uploadToStorage(`captures/${file}`, Buffer.from(buf));
      results.push({ scene: s.scene, route, file: localPath, url: uploaded });
      console.log(`  ✓ ${localPath}${uploaded ? ' → ' + uploaded : ''}`);
    } catch (e) {
      console.warn(`  ✗ ${s.scene || file} : ${e.message}`);
      results.push({ scene: s.scene, error: e.message });
    }
  }

  await writeFile('capture-results.json', JSON.stringify({ tenant: TENANT, base: BASE, results }, null, 2));
  await browser.close();
  const ok = results.filter(r => !r.error).length;
  console.log(`\n✓ Terminé : ${ok}/${steps.length} captures. Détails → capture-results.json`);
}

run().catch(e => { console.error('✗ Échec :', e); process.exit(1); });
