import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client for auth
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configuration des clients avec domaines personnalisés
const CLIENT_DOMAINS: Record<string, string> = {
  'entrepriseabc.csecur360.ca': 'entrepriseabc',
  'companyxyz.csecur360.ca': 'companyxyz',
  'corpdef.csecur360.ca': 'corpdef',
  'demo.csecur360.ca': 'demo'
};

// Protected routes configuration
const protectedRoutes = {
  // Super admin routes (accès administrateur principal)
  '/admin': ['super_admin'],
  '/admin/(.*)': ['super_admin'],
  
  // Client tenant routes (pour chaque entreprise)
  '/entrepriseabc': ['super_admin', 'client_admin'],
  '/entrepriseabc/(.*)': ['super_admin', 'client_admin'],
  '/companyxyz': ['super_admin', 'client_admin'],
  '/companyxyz/(.*)': ['super_admin', 'client_admin'],
  '/corpdef': ['super_admin', 'client_admin'],
  '/corpdef/(.*)': ['super_admin', 'client_admin'],
  
  // Legacy client routes (à migrer graduellement)
  '/client/(.*)': ['super_admin', 'client_admin'],
  
  // API routes that need authentication
  '/api/admin/(.*)': ['super_admin'],
  '/api/system/(.*)': ['super_admin'],
};

// Public routes (no authentication needed)
const publicRoutes = [
  '/',
  '/demo',           // Accès demo public
  '/demo/(.*)',      // Toutes les pages demo publiques
  '/auth/admin',     // Accès super admin principal
  '/auth/client',    // Accès client admin
  '/pricing',
  '/contact', 
  '/about',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/totp-setup',
  '/api/sms/inbound', // Twilio webhooks
  '/api/voice/inbound',
  // Assets statiques
  '/logo.png',
  '/favicon.ico',
  '/manifest.json',
  '/c-secur360-logo.png',
  '/csecur360-logo-v2025.png'
];

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  const { pathname } = request.nextUrl;
  
  // First, handle domain/tenant routing
  await handleTenantRouting(request, url, hostname);
  
  // Then, handle authentication
  return await handleAuthentication(request, pathname, url);
}

async function handleTenantRouting(request: NextRequest, url: URL, hostname: string) {
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
  const validTenants = ['demo', 'entrepriseabc', 'companyxyz', 'corpdef'];
  
  // Si c'est un sous-domaine valide (pas localhost ni admin principal)
  if (validTenants.includes(subdomain) && !hostname.includes('localhost')) {
    const currentTenant = subdomain;
    
    // Si l'URL ne commence pas déjà par le tenant
    if (!url.pathname.startsWith(`/${currentTenant}`) && !url.pathname.startsWith('/admin') && !url.pathname.startsWith('/auth')) {
      url.pathname = `/${currentTenant}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }
  
  // Pour localhost et admin principal: pas de rewrite automatique vers tenant
}

async function handleAuthentication(request: NextRequest, pathname: string, url: URL) {
  // Check if route is public
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Get auth token from cookies
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) {
    return redirectToLogin(request, pathname);
  }

  try {
    // Verify session and get user
    const { data: session, error } = await supabase
      .from('auth_sessions')
      .select(`
        expires_at,
        users!inner (
          id, email, role, tenant_id, totp_enabled
        )
      `)
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !session || !session.users) {
      return redirectToLogin(request, pathname);
    }

    const user = session.users as any;

    // Check if route requires specific role
    const requiredRoles = getRequiredRoles(pathname);
    if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
      return new NextResponse('Accès refusé', { status: 403 });
    }

    // For client admin, check tenant access
    if (user.role === 'client_admin' && pathname.startsWith('/client/')) {
      const tenantFromPath = pathname.split('/')[2];
      if (tenantFromPath && tenantFromPath !== user.tenant_id) {
        return new NextResponse('Accès refusé à ce tenant', { status: 403 });
      }
    }

    // Update last activity (non-blocking) - fire and forget
    try {
      supabase
        .from('auth_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('token', token);
    } catch {
      // Ignore errors for last activity update
    }

    // Add user info to headers for API routes
    const response = NextResponse.next();
    response.headers.set('x-user-id', user.id);
    response.headers.set('x-user-role', user.role);
    response.headers.set('x-user-email', user.email);
    if (user.tenant_id) {
      response.headers.set('x-user-tenant', user.tenant_id);
    }

    return response;

  } catch (error) {
    console.error('Middleware auth error:', error);
    return redirectToLogin(request, pathname);
  }
}

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route.endsWith('(.*)')) {
      const baseRoute = route.replace('(.*)', '');
      return pathname.startsWith(baseRoute);
    }
    return pathname === route || pathname.startsWith(route + '/');
  });
}

function getRequiredRoles(pathname: string): string[] {
  for (const [route, roles] of Object.entries(protectedRoutes)) {
    const regex = new RegExp(`^${route.replace(/\(\.\*\)/g, '.*')}$`);
    if (regex.test(pathname)) {
      return roles;
    }
  }
  return [];
}

function redirectToLogin(request: NextRequest, originalPath: string): NextResponse {
  const loginUrl = new URL('/auth/admin', request.url);
  
  // Add redirect parameter for post-login navigation
  if (originalPath !== '/' && !originalPath.startsWith('/auth')) {
    loginUrl.searchParams.set('redirect', originalPath);
  }
  
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|logo.png|manifest.json|.*\\.(png|jpg|jpeg|gif|svg|ico|css|js|woff|woff2|ttf|eot)).*)',
  ],
}
