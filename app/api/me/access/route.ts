// Renvoie le niveau d'accès de la personne CONNECTÉE (résolu côté serveur depuis la session — jamais
// le client). Sert à l'UI (launcher de modules, sidebar) pour masquer/verrouiller selon la matrice.
import { NextRequest, NextResponse } from 'next/server';
import { resolveAccess } from '@/lib/hrAccess';
import { tierFromLevel } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  const acc = await resolveAccess(req);
  if (!acc) return NextResponse.json({ level: null, tier: 0 }, { status: 200 });
  return NextResponse.json({ level: acc.level, tier: tierFromLevel(acc.level), tenant: acc.tenant });
}
