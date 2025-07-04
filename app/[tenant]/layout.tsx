import { ReactNode } from 'react'
import { notFound } from 'next/navigation'

interface TenantLayoutProps {
  children: ReactNode
  params: { tenant: string }
}

export default function TenantLayout({
  children,
  params,
}: TenantLayoutProps) {
  const validTenants = ['demo', 'c-secur360']
  
  if (!validTenants.includes(params.tenant)) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {children}
    </div>
  )
}
