import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getValidTenants } from './lib/tenants'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''

  // Extraire le sous-domaine
  const subdomain = hostname.split('.')[0]

  // Liste des sous-domaines valides
  const validTenants = await getValidTenants()
  
  // Si c'est un sous-domaine valide, rediriger vers la route tenant
  if (validTenants.includes(subdomain) || hostname.includes('localhost')) {
    const currentTenant = hostname.includes('localhost') ? 'demo' : subdomain
    
    // Si l'URL ne commence pas déjà par le tenant
    if (!url.pathname.startsWith(`/${currentTenant}`)) {
      url.pathname = `/${currentTenant}${url.pathname}`
      return NextResponse.rewrite(url)
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
