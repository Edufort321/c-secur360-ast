// Extraction ROBUSTE d'une valeur JSON (objet {…} OU tableau […]) depuis une réponse IA.
// Centralise le durcissement appris sur le DGA : tolère la prose avant/après, les fences ```json,
// la troncature partielle et les accolades/crochets à l'intérieur des chaînes (scan équilibré).
// Remplace les regex gloutonnes `/\{[\s\S]*\}/` fragiles des routes d'import IA.
export function extractJsonValue(rawText: string): any | null {
  if (!rawText) return null;
  const s = String(rawText).trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try { return JSON.parse(s); } catch { /* on tente l'extraction équilibrée */ }
  // Choisit le premier délimiteur rencontré ({ ou [) et fait un scan équilibré jusqu'à sa fermeture.
  const objStart = s.indexOf('{');
  const arrStart = s.indexOf('[');
  if (objStart < 0 && arrStart < 0) return null;
  const useArray = arrStart >= 0 && (objStart < 0 || arrStart < objStart);
  const start = useArray ? arrStart : objStart;
  const open = useArray ? '[' : '{';
  const close = useArray ? ']' : '}';
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true;
    else if (c === open) depth++;
    else if (c === close) { depth--; if (depth === 0) { try { return JSON.parse(s.slice(start, i + 1)); } catch { return null; } } }
  }
  return null; // délimiteur jamais refermé -> JSON tronqué
}
