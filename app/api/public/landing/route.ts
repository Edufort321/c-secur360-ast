import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Route publique consolidée pour la page d'accueil : regroupe en UNE requête les 6 lectures
// (diapos, témoignages, prix des modules, prix par site, forfaits IA, captures de modules)
// qui étaient auparavant 6 allers-retours Supabase depuis le navigateur. Mise en cache (ISR ~5 min).
export const revalidate = 300;

export async function GET() {
  try {
    const [slides, testimonials, modules, billing, aiPlans, moduleSlides] = await Promise.all([
      supabaseAdmin.from('landing_slides').select('*').eq('active', true).order('sort_order'),
      supabaseAdmin.from('landing_testimonials').select('*').eq('active', true).order('sort_order'),
      supabaseAdmin.from('modules').select('key, name_fr, name_en, monthly_price, sort_order').eq('is_active', true).order('sort_order'),
      supabaseAdmin.from('billing_config').select('per_site_monthly').eq('id', 'default').maybeSingle(),
      supabaseAdmin.from('ai_plans').select('id, name_fr, name_en, price_cents, note_fr, note_en, sort_order, active').eq('active', true).order('sort_order'),
      supabaseAdmin.from('module_slides').select('module_key, image_url, sort_order').order('sort_order'),
    ]);

    return NextResponse.json({
      slides: slides.data || [],
      testimonials: testimonials.data || [],
      modules: (modules.data || []).map((m: any) => ({ ...m, monthly_price: Number(m.monthly_price || 0) })),
      perSitePrice: (billing.data as any)?.per_site_monthly != null ? Number((billing.data as any).per_site_monthly) : null,
      aiPlans: (aiPlans.data || []).map((p: any) => ({ ...p, price_cents: Number(p.price_cents || 0) })),
      moduleSlides: moduleSlides.data || [],
    });
  } catch {
    // Dégradation gracieuse : la page a des replis statiques pour chaque champ.
    return NextResponse.json({ slides: [], testimonials: [], modules: [], perSitePrice: null, aiPlans: [], moduleSlides: [] });
  }
}
