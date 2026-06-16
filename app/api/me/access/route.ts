// Renvoie le niveau d'accès de la personne CONNECTÉE (résolu côté serveur depuis la session — jamais
// le client). Sert à l'UI (launcher de modules, sidebar) pour masquer/verrouiller selon la matrice.
import { NextRequest, NextResponse } from 'next/server';
import { resolveAccess, effectiveTenant, effectiveLevelFor, isPlatformOwner } from '@/lib/hrAccess';
import { tierFromLevel } from '@/lib/permissions';

// ?tenant=<tenant de la page> : applique l'« accès restreint » → un super-admin plateforme non
// invité (et non propriétaire) est ramené à 'consultation' sur un tenant restreint.
export async function GET(req: NextRequest) {
  const acc = await resolveAccess(req);
  if (!acc) return NextResponse.json({ level: null, tier: 0 }, { status: 200 });
  const reqTenant = new URL(req.url).searchParams.get('tenant');
  const target = effectiveTenant(acc, reqTenant);
  const level = await effectiveLevelFor(acc, target);
  return NextResponse.json({ level, tier: tierFromLevel(level), tenant: target, owner: isPlatformOwner(acc.email), restrictedDowngrade: acc.role === 'super_admin' && level !== 'super_user' });
}
