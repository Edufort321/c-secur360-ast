import 'server-only'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { clientEnv } from '@/lib/env.client'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const requestHost = request.headers.get('host') || ''
  const hostname = requestHost.split(':')[0]

  // Récupérer dynamiquement la liste des sous-domaines valides via une variable d'environnement
  const validTenantsEnv = process.env.VALID_TENANTS || ''
  const validTenants = validTenantsEnv
    .split(',')
    .map((tenant) => tenant.trim())
    .filter(Boolean)

  const defaultTenant =
    clientEnv.NEXT_PUBLIC_DEFAULT_TENANT || validTenants[0] || 'demo'

  // Extraire le sous-domaine sans le port
  const subdomain = hostname.split('.')[0]

  // Déterminer le tenant courant ou retomber sur le tenant par défaut
  const currentTenant =
    hostname.includes('localhost') ||
    !subdomain ||
    !validTenants.includes(subdomain)
      ? defaultTenant
      : subdomain

  // Si l'URL ne commence pas déjà par le tenant
  if (!url.pathname.startsWith(`/${currentTenant}`)) {
    url.pathname = `/${currentTenant}${url.pathname}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|c-secur360-logo.png).*)',
  ],
}
