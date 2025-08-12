import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔄 Testing database connection...')

    // Test de connexion à la base et lecture des tenants existants
    await prisma.$connect()
    console.log('✅ Connected to database')

    const tenants = await prisma.tenant.findMany()
    const totalTenants = tenants.length

    await prisma.$disconnect()

    return NextResponse.json({
      success: true,
      message: '🎉 Base de données connectée',
      tenants,
      totalTenants
    })
    
  } catch (error: unknown) {
    console.error('❌ Database error:', error)

    if (error instanceof Error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: (error as { code?: string }).code,
        details: "Vérifiez les variables d'environnement Supabase"
      }, { status: 500 })
    }

    return NextResponse.json({
      success: false,
      error: 'Unknown error',
      details: "Vérifiez les variables d'environnement Supabase"
    }, { status: 500 })
  }
}
