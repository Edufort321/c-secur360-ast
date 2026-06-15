import { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { SiteProvider } from '@/contexts/SiteContext'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { computeSubState } from '@/lib/subscription'
import { AssistantWidget } from '@/components/AssistantWidget'
import { DemoCountdownBanner } from '@/components/DemoCountdownBanner'

// Métadonnées tenant-aware : le manifest pointe vers /{tenant}/manifest.webmanifest
// (start_url = /{tenant}/login) -> le PWA installe ici s'ouvre sur l'auth du tenant.
// Override le manifest du layout racine ('/manifest.json') pour les pages de tenant.
export function generateMetadata({ params }: { params: { tenant: string } }): Metadata {
  return {
    title: 'CSécur360 - AST',
    description: 'Analyse Sécuritaire de Tâches - Plateforme multi-tenant',
    // Securite/SEO (#25) : espace tenant prive -> jamais indexe.
    robots: { index: false, follow: false },
    manifest: `/${params.tenant}/manifest.webmanifest`,
    // Icône PWA = pastille navy générée (logo bien gros), PAS le logo brut (sinon iOS affiche un
    // petit logo carré). Doit rester cohérent avec /{tenant}/manifest.webmanifest. v= : anti-cache.
    icons: {
      icon: '/icon-pwa?size=192&v=2',
      apple: '/icon-pwa?size=180&v=2',
      shortcut: '/icon-pwa?size=192&v=2',
    },
  }
}

// Portail multi-tenant authentifié : JAMAIS de cache de page. La validation du tenant et
// l'état d'abonnement doivent être lus en DIRECT à chaque requête — sinon Next.js met en
// cache le résultat « tenant introuvable » (notFound) et un client fraîchement créé reste
// en 404 même après sa création. force-dynamic garantit que ça fonctionne à tout coup.
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface TenantLayoutProps {
  children: ReactNode
  params: { tenant: string }
}

export default async function TenantLayout({
  children,
  params,
}: TenantLayoutProps) {
  const t = params.tenant
  // Tenants connus (fast-path) + validation dynamique via la table `tenants`
  // 'demo' = bac a sable public (acces demo limite) ; valide meme sans ligne en base.
  let valid = t === 'cerdia' || t === 'demo'
  if (!valid) {
    try {
      const { data } = await supabaseAdmin.from('tenants').select('id').eq('id', t).maybeSingle()
      valid = !!data
    } catch { /* en cas d'erreur DB, on bloque par défaut */ }
  }
  if (!valid) {
    notFound()
  }

  // Blocage si abonnement impayé au-delà du délai de grâce
  try {
    const { data: sub } = await supabaseAdmin
      .from('tenant_subscriptions')
      .select('next_billing_date, grace_days, reminder_days, status')
      .eq('tenant_id', t).maybeSingle()
    if (computeSubState(sub).blocked) {
      return (
        <div className="grid min-h-screen place-items-center bg-gray-100 px-4 text-center text-gray-900">
          <div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 shadow">
            <h1 className="text-xl font-bold text-red-600">Abonnement suspendu</h1>
            <p className="mt-2 text-sm text-gray-600">
              L&apos;accès à cet espace est bloqué (paiement en souffrance au-delà du délai de grâce de 30 jours).
              Veuillez régulariser l&apos;abonnement pour rétablir l&apos;accès.
            </p>
          </div>
        </div>
      )
    }
  } catch { /* ignore */ }

  return (
    <SiteProvider tenant={params.tenant}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <DemoCountdownBanner />
        {children}
        <AssistantWidget />
      </div>
    </SiteProvider>
  )
}
