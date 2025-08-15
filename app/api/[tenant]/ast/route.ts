import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'
import { serverEnv } from '@/lib/env.server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const bodySchema = z.object({
  formData: z.any()
})

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

  return { token, tenant, user }
}

export async function GET(request: NextRequest, { params }: { params: { tenant: string } }) {
  const auth = await ensureUser(request, params.tenant)
  if ('error' in auth) return auth.error
  try {
    const astForms = await prisma.aSTForm.findMany({
      where: { tenantId: auth.tenant.id },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ astForms })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { tenant: string } }) {
  const auth = await ensureUser(request, params.tenant)
  if ('error' in auth) return auth.error
  try {
    const body = await request.json()
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 })
    }
    const { formData } = parsed.data

    const astCount = await prisma.aSTForm.count({ where: { tenantId: auth.tenant.id } })
    const astNumber = `AST-${new Date().getFullYear()}-${String(astCount + 1).padStart(3, '0')}`

    const astForm = await prisma.aSTForm.create({
      data: {
        tenantId: auth.tenant.id,
        userId: auth.user.id,
        projectNumber: formData.projectNumber || '',
        clientName: formData.client || '',
        workLocation: formData.workLocation || '',
        clientRep: formData.clientRep,
        emergencyNumber: formData.emergencyNumber,
        astMdlNumber: astNumber,
        astClientNumber: formData.astClientNumber,
        workDescription: formData.workDescription || '',
        status: 'completed',
        generalInfo: {
          datetime: formData.datetime,
          language: formData.language
        },
        teamDiscussion: formData.teamDiscussion,
        isolation: formData.isolation,
        hazards: formData.hazards,
        controlMeasures: formData.controlMeasures,
        workers: formData.workers,
        photos: formData.photos
      }
    })

    return NextResponse.json({ success: true, astForm, message: 'AST sauvegardé avec succès!' })
  } catch (error: unknown) {
    console.error('Error saving AST:', error)
    const message = error instanceof Error ? error.message : 'An unexpected error occurred'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
