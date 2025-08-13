import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'
import { NEXTAUTH_SECRET } from '@/lib/env'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function ensureUser(request: NextRequest, tenantSubdomain: string) {
  const token = await getToken({ req: request, secret: NEXTAUTH_SECRET })
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

  return { tenant, user }
}

export async function POST(request: NextRequest, { params }: { params: { tenant: string } }) {
  const auth = await ensureUser(request, params.tenant)
  if ('error' in auth) return auth.error
  try {
    const data = await request.json()
    if (!data?.id) {
      return NextResponse.json({ error: 'AST id required' }, { status: 400 })
    }

    await prisma.aSTForm.upsert({
      where: { id: data.id },
      update: {
        tenantId: auth.tenant.id,
        userId: auth.user.id,
        generalInfo: data.generalInfo ?? {},
        teamDiscussion: data.teamDiscussion ?? [],
        isolation: data.isolation ?? {},
        hazards: data.hazards ?? {},
        controlMeasures: data.controlMeasures ?? {},
        workers: data.workers ?? {},
        photos: data.photos ?? {},
        projectNumber: data.projectNumber ?? '',
        clientName: data.clientName ?? '',
        workLocation: data.workLocation ?? '',
        astMdlNumber: data.astMdlNumber ?? '',
        astClientNumber: data.astClientNumber ?? '',
        workDescription: data.workDescription ?? ''
      },
      create: {
        id: data.id,
        tenantId: auth.tenant.id,
        userId: auth.user.id,
        projectNumber: data.projectNumber ?? '',
        clientName: data.clientName ?? '',
        workLocation: data.workLocation ?? '',
        clientRep: data.clientRep,
        emergencyNumber: data.emergencyNumber,
        astMdlNumber: data.astMdlNumber ?? '',
        astClientNumber: data.astClientNumber,
        workDescription: data.workDescription ?? '',
        status: 'draft',
        generalInfo: data.generalInfo ?? {},
        teamDiscussion: data.teamDiscussion ?? [],
        isolation: data.isolation ?? {},
        hazards: data.hazards ?? {},
        controlMeasures: data.controlMeasures ?? {},
        workers: data.workers ?? {},
        photos: data.photos ?? {}
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
