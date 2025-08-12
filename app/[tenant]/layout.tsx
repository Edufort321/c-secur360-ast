import { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getValidTenants } from '@/lib/tenants'

// ⭐ AJOUT : Métadonnées avec votre logo
export const metadata: Metadata = {
  title: 'CSécur360 - AST',
  description: 'Analyse Sécuritaire de Tâches - Plateforme multi-tenant',
  icons: {
    icon: '/c-secur360-logo.png',
    apple: '/c-secur360-logo.png',
    shortcut: '/c-secur360-logo.png',
  },
}

interface TenantLayoutProps {
  children: ReactNode
  params: { tenant: string }
}

export default async function TenantLayout({
  children,
  params,
}: TenantLayoutProps) {
  const validTenants = await getValidTenants()

  if (!validTenants.includes(params.tenant)) {
    notFound()
  }
  
  // ... reste du code identique
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {children}
    </div>
  )
}
