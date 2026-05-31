'use client';

import { usePathname, useRouter, useParams } from 'next/navigation';

// Bouton « Retour » en haut de chaque page de fonction d'un tenant.
// Auto-masqué sur : la page publique (hors /[tenant]), le tableau de bord / portail du tenant,
// et les pages d'authentification. Retour via l'historique, repli vers le portail des modules.
const HIDE_ON_FIRST_SEGMENT = new Set([
  '', 'dashboard', 'new-dashboard', 'modules', 'login', 'forgot-password', 'reset-password', 'bienvenue',
]);

export function BackButton() {
  const pathname = usePathname() || '';
  const router = useRouter();
  const params = useParams();
  const tenant = (params?.tenant as string) || '';

  const segs = pathname.split('/').filter(Boolean); // [tenant, fonction, ...]
  const first = segs[1] || ''; // segment après le tenant
  // Masquer sur la racine du tenant + dashboard/portail/auth.
  if (segs.length <= 1 || HIDE_ON_FIRST_SEGMENT.has(first)) return null;

  return (
    <button
      onClick={() => { if (window.history.length > 1) router.back(); else router.push(`/${tenant}/modules`); }}
      className="fixed left-3 top-3 z-[75] inline-flex items-center gap-1 rounded-lg border border-white/15 bg-black/40 px-3 py-1.5 text-sm font-semibold text-white shadow backdrop-blur hover:bg-black/60"
      aria-label="Retour"
    >
      ← Retour
    </button>
  );
}
