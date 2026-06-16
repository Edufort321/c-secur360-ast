// Namespacing par tenant du cache localStorage du module Inventaire.
// SÉCURITÉ : sans préfixe, le cache (items, mouvements, départements, catégories, unités,
// personnel, EBITDA…) d'un tenant resterait visible sous un AUTRE tenant dans le même
// navigateur — fuite inter-tenant côté client (le serveur, lui, scope déjà par tenant_id).
// Le tenant = 1er segment de l'URL (cohérent avec App.jsx).
export function invTenant() {
  // ISOLATION : jamais de repli 'cerdia' (sinon un tenant non résolu partage le cache de cerdia).
  try { return (window.location.pathname.split('/').filter(Boolean)[0]) || ''; }
  catch { return ''; }
}
export function invKey(name) { return invTenant() + '::' + name; }
