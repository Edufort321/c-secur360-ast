import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Resolveur PUBLIC d'organisation : l'accueil envoie ce que l'utilisateur tape
// (nom d'organisation, sous-domaine OU id) et on retourne l'id CANONIQUE du tenant
// vers lequel rediriger (/{id}/login). Evite le 404 brut quand la saisie ne
// correspond pas exactement a l'id (point, majuscules, nom complet, etc.).
// Server-only (service_role) : on n'expose qu'un id de tenant, jamais de donnees sensibles.
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const raw = (new URL(req.url).searchParams.get('q') || '').trim();
  if (!raw) return NextResponse.json({ error: 'Organisation requise' }, { status: 400 });

  const q = raw.toLowerCase();
  // Formes SUREES pour le filtre .or() (jamais l'entree brute : eviter une injection
  // dans le filtre PostgREST via virgule/parenthese). slug = id canonique (creation),
  // dotted = sous-domaine avec point conserve (ex. "c-secur360.ca").
  const slug = q.replace(/[^a-z0-9-]/g, '');
  const dotted = q.replace(/[^a-z0-9.-]/g, '');

  // 'demo' = bac a sable public (pas forcement une ligne en base).
  if (slug === 'demo') return NextResponse.json({ id: 'demo' });

  try {
    // 1) Match direct par id ou sous-domaine (formes slug + dotted, deja assainies).
    const variants = Array.from(new Set([slug, dotted].filter(Boolean)));
    const orFilter = variants.flatMap(v => [`id.eq.${v}`, `subdomain.eq.${v}`]).join(',');
    const { data: direct } = await supabaseAdmin
      .from('tenants')
      .select('id, subdomain, companyName, isActive, archived')
      .or(orFilter)
      .limit(1)
      .maybeSingle();

    let hit = direct;

    // 2) Sinon, match souple par nom d'organisation (companyName).
    if (!hit) {
      const { data: byName } = await supabaseAdmin
        .from('tenants')
        .select('id, subdomain, companyName, isActive, archived')
        .ilike('companyName', `%${raw}%`)
        .limit(2);
      // On ne redirige automatiquement que si UN seul tenant correspond (pas d'ambiguite).
      if (byName && byName.length === 1) hit = byName[0];
    }

    if (!hit) {
      return NextResponse.json({ error: 'Organisation introuvable' }, { status: 404 });
    }
    if (hit.archived) {
      return NextResponse.json({ error: 'Organisation desactivee' }, { status: 403 });
    }
    return NextResponse.json({ id: hit.id });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
