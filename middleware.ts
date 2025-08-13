import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''
  
  // Extraire le sous-domaine
  const subdomain = hostname.split('.')[0]
  
  // Récupérer dynamiquement la liste des sous-domaines valides via une variable d'environnement
  const validTenantsEnv = process.env.VALID_TENANTS || ''
  const validTenants = validTenantsEnv
    .split(',')
    .map((tenant) => tenant.trim())
    .filter(Boolean)

  // Gérer les tenants inconnus
  if (!validTenants.includes(subdomain) && !hostname.includes('localhost')) {
    return NextResponse.json({ error: 'Unknown tenant' }, { status: 404 })
  }

  const currentTenant = hostname.includes('localhost')
    ? validTenants[0] || 'demo'
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
