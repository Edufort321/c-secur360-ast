// Contrôle « aucun émoji dans l'interface » (même règle qu'IPS C-360, Eric 2026-11-14 : site plus professionnel).
// Permis : 📷 (caméra) et 📎 (pièce jointe), et les symboles techniques ou typographiques (✓ ✕ ⚠ ☰ ✎ ★ ▲ ▼ ◀ ▶ ↗ ↔ Ω µ ° ± Δ …).
// Une ligne qui TRAITE des émojis sans en afficher (ex. expression régulière de nettoyage) peut porter le commentaire « emoji-ok ».
// Usage : node scripts/check_emoji.mjs          -> code de sortie 1 s'il en reste (bloque le build)
//         node scripts/check_emoji.mjs --liste  -> liste chaque ligne fautive
import fs from 'node:fs';
import path from 'node:path';

const RACINE = process.cwd();
const DOSSIERS = ['app', 'components', 'lib', 'hooks', 'contexts'];
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2300}-\u{23FF}]/u;
const PERMIS = new Set(['📷', '📎', '✓', '✕', '⚠', '☰', '✎', '★', '☆', '⌀', '⌘', '⏎']);
const liste = process.argv.includes('--liste');
const fautes = [];

function parcourir(d) {
  if (!fs.existsSync(d)) return;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (!['node_modules', '.next', '.git'].includes(e.name)) parcourir(p); continue; }
    if (!/\.(tsx?|jsx?)$/.test(e.name)) continue;
    fs.readFileSync(p, 'utf8').split(/\r?\n/).forEach((ligne, i) => {
      if (ligne.includes('emoji-ok')) return;
      for (const ch of ligne) if (EMOJI.test(ch) && !PERMIS.has(ch)) { fautes.push(`${path.relative(RACINE, p)}:${i + 1}  « ${ch} »`); break; }
    });
  }
}
DOSSIERS.forEach((d) => parcourir(path.join(RACINE, d)));
if (fautes.length) {
  console.error(`Émojis interdits dans l'interface : ${fautes.length} ligne(s).` + (liste ? '\n' + fautes.join('\n') : ' (--liste pour le détail)'));
  process.exit(1);
}
console.log('Contrôle émojis : OK');
