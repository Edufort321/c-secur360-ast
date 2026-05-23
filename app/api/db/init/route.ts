import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Test de connexion DB UNIQUEMENT — ne crée plus de tenants de démo/test.
// (Politique : aucune donnée artificielle. Les tenants se créent via /api/admin/tenants.)
export async function GET() {
  try {
    await prisma.$connect()
    const count = (await prisma.tenant.findMany()).length
    await prisma.$disconnect()
    return NextResponse.json({ success: true, message: 'DB connectée', totalTenants: count })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
