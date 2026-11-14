const fs = require('fs');

let content = fs.readFileSync('EntryRegistry.tsx', 'utf8');

// Tableau de remplacements pour tous les emojis problématiques
const replacements = [
  ['âš ï¸', '⚠'],
  ['ðŸ'·', ''],
  ['ðŸ'ï¸', ''],
  ['ðŸ'¨â€ðŸ'¼', ''],
  ['ðŸš'', ''],
  ['ðŸ"»', ''],
  ['ðŸ"¥', ''],
  ['ðŸ"¤', ''],
  ['â±ï¸', ''],
  ['ðŸ›¡ï¸', ''],
  ['ðŸ'¥', ''],
  ['ðŸ"ž', ''],
  ['ðŸ¢', ''],
  ['ðŸ'¤', ''],
  ['ðŸ"¡', ''],
  ['ðŸ"¶', ''],
  ['ðŸ"', ''],
  ['ðŸ"…', ''],
  ['ðŸ"', '']
];

// Appliquer tous les remplacements
replacements.forEach(([malformed, correct]) => {
  const regex = new RegExp(malformed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  content = content.replace(regex, correct);
});

fs.writeFileSync('EntryRegistry.tsx', content, 'utf8');
console.log('Correction finale de tous les emojis terminée');