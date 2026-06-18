// Sélection du modèle Anthropic + appel résilient (#DGA / IA). Centralise la règle :
//   modèle = process.env.ANTHROPIC_MODEL || défaut connu valide.
// AUTO-GUÉRISON : si ANTHROPIC_MODEL est périmé/erroné, l'API renvoie 404 (« model not found ») et
// TOUTES les routes IA cassent (incident connu). On RÉESSAIE alors une fois avec un modèle de repli
// valide, de sorte qu'une mauvaise variable d'environnement ne mette plus l'IA hors service.
// (Corriger quand même ANTHROPIC_MODEL dans Vercel — le repli n'est qu'un filet de sécurité.)

// Repli toujours valide (cf. IDs de modèles supportés). Ne PAS pointer vers un ID daté.
export const ANTHROPIC_FALLBACK_MODEL = 'claude-sonnet-4-6';

/** Modèle configuré (env) ou repli. */
export function resolveAnthropicModel(): string {
  const m = (process.env.ANTHROPIC_MODEL || '').trim();
  return m || ANTHROPIC_FALLBACK_MODEL;
}

const ENDPOINT = 'https://api.anthropic.com/v1/messages';

/**
 * Appelle l'API « messages » avec repli automatique de modèle sur 404.
 * `payload` = corps complet SAUF `model` (injecté ici ; un `model` explicite dans payload est respecté).
 * Renvoie la Response brute (l'appelant gère .ok / .json comme avant).
 */
export async function anthropicMessages(apiKey: string, payload: Record<string, any>): Promise<Response> {
  const primary = (payload.model as string) || resolveAnthropicModel();
  const call = (model: string) => fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ ...payload, model }),
  });
  let resp = await call(primary);
  // 404 = modèle introuvable (l'endpoint, lui, existe) → repli unique sur un modèle valide connu.
  if (resp.status === 404 && primary !== ANTHROPIC_FALLBACK_MODEL) {
    resp = await call(ANTHROPIC_FALLBACK_MODEL);
  }
  return resp;
}
