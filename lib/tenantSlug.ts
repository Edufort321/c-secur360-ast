// Slug du tenant courant côté CLIENT (1er segment de l'URL /[tenant]/...). Sert à NAMESPACER les
// clés localStorage par tenant (anti-fuite en navigateur partagé). Retourne '' hors navigateur.
export function currentTenantSlug(): string {
  if (typeof window === 'undefined') return '';
  return window.location.pathname.split('/').filter(Boolean)[0] || '';
}
