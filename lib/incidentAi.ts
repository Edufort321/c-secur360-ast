// Helpers client pour l'IA du module Accidents (correction, traduction, recommandations).
// Appellent la route serveur /api/incidents/ai (clé Anthropic côté serveur). Lèvent une Error en cas d'échec.
type Lang = 'fr' | 'en';

async function call(payload: any): Promise<any> {
  const res = await fetch('/api/incidents/ai', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
    body: JSON.stringify(payload),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j?.error || `IA ${res.status}`);
  return j;
}

/** Corrige orthographe/grammaire/style d'un texte (même langue). */
export async function aiCorrect(text: string, lang: Lang): Promise<string> {
  if (!text.trim()) return text;
  const j = await call({ action: 'correct', text, lang });
  return (j.result || '').trim() || text;
}

/** Traduit un texte unique vers la langue cible. */
export async function aiTranslateText(text: string, target: Lang): Promise<string> {
  if (!text.trim()) return text;
  const j = await call({ action: 'translate', text, target });
  return (j.result || '').trim() || text;
}

/** Traduit un dictionnaire de champs vers la langue cible (retourne les mêmes clés). */
export async function aiTranslateFields(fields: Record<string, string>, target: Lang): Promise<Record<string, string>> {
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(fields)) if (v && String(v).trim()) clean[k] = String(v);
  if (!Object.keys(clean).length) return {};
  const j = await call({ action: 'translate', fields: clean, target });
  return (j && typeof j === 'object') ? j : {};
}

/** Construit l'analyse 5 Pourquoi + cause racine organisationnelle à partir du contexte. */
export async function aiFiveWhys(context: string, lang: Lang): Promise<{ whys: string[]; rootCause: string }> {
  const j = await call({ action: 'fivewhys', context, lang });
  return { whys: Array.isArray(j?.whys) ? j.whys.map((x: any) => String(x || '')) : [], rootCause: j?.rootCause || '' };
}

/** Suggère des actions correctives/préventives à partir du contexte de l'incident. */
export async function aiRecommend(context: string, lang: Lang): Promise<{ actions: { description: string; priority?: string }[]; rootCauseHint?: string }> {
  const j = await call({ action: 'recommend', context, lang });
  return { actions: Array.isArray(j?.actions) ? j.actions : [], rootCauseHint: j?.rootCauseHint || '' };
}
