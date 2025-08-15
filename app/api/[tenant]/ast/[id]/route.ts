import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'
import { serverEnv } from '@/lib/env.server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function ensureUser(request: NextRequest, tenantSubdomain: string) {
  const token = await getToken({ req: request, secret: serverEnv.NEXTAUTH_SECRET })
  if (!token?.sub) {
    return { error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) }
  }

  const tenant = await prisma.tenant.findUnique({ where: { subdomain: tenantSubdomain } })
  if (!tenant) {
    return { error: NextResponse.json({ error: 'Tenant not found' }, { status: 404 }) }
  }

  const user = await prisma.user.findUnique({ where: { id: token.sub } })
  if (!user || user.tenantId !== tenant.id) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { tenant }
}

export async function GET(request: NextRequest, { params }: { params: { tenant: string; id: string } }) {
  const auth = await ensureUser(request, params.tenant)
  if ('error' in auth) return auth.error
  try {
    const astForm = await prisma.aSTForm.findFirst({
      where: { id: params.id, tenantId: auth.tenant.id }
    })
    if (!astForm) {
      return NextResponse.json({ error: 'AST not found' }, { status: 404 })
    }
    return NextResponse.json(astForm)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
