import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Configuration des clients avec domaines personnalisés
const CLIENT_DOMAINS: Record<string, string> = {
  'entrepriseabc.csecur360.ca': 'entrepriseabc',
  'companyxyz.csecur360.ca': 'companyxyz',
  'corpdef.csecur360.ca': 'corpdef',
  'demo.csecur360.ca': 'demo'
};

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''
  
  // Gestion des domaines personnalisés clients
  if (CLIENT_DOMAINS[hostname]) {
    const tenant = CLIENT_DOMAINS[hostname];
    
    // Rediriger vers le dashboard du tenant si c'est la racine
    if (url.pathname === '/') {
      url.pathname = `/${tenant}/dashboard`;
      return NextResponse.rewrite(url);
    }
    
    // Ajouter le tenant au début du path si pas déjà présent
    if (!url.pathname.startsWith(`/${tenant}`)) {
      url.pathname = `/${tenant}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
    
    return NextResponse.next();
  }
  
  // Gestion des sous-domaines classiques
  const subdomain = hostname.split('.')[0];
  const validTenants = ['demo', 'c-secur360', 'admin', 'localhost', 'entrepriseabc', 'companyxyz', 'corpdef'];
  
  // Admin access
  if (url.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }
  
  // Si c'est un sous-domaine valide
  if (validTenants.includes(subdomain) || hostname.includes('localhost')) {
    const currentTenant = hostname.includes('localhost') ? 'demo' : subdomain;
    
    // Si l'URL ne commence pas déjà par le tenant
    if (!url.pathname.startsWith(`/${currentTenant}`) && !url.pathname.startsWith('/admin')) {
      url.pathname = `/${currentTenant}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
