import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔄 Testing database connection...')

    // Test de connexion à la base et création des tenants de démonstration
    await prisma.$connect()
    console.log('✅ Connected to database')

    // Vérifier combien de tenants existent déjà
    const initialTenantCount = await prisma.tenant.count()
    console.log('📊 Existing tenants:', initialTenantCount)

    // Créer tenant démo seulement s'il n'existe pas
    const demoTenant = await prisma.tenant.upsert({
      where: { subdomain: 'demo' },
      update: {},
      create: {
        subdomain: 'demo',
        companyName: 'Version Démo C-Secur360',
        plan: 'demo'
      }
    })

    // Créer tenant futureclient seulement s'il n'existe pas
    const futureClientTenant = await prisma.tenant.upsert({
      where: { subdomain: 'futureclient' },
      update: {},
      create: {
        subdomain: 'futureclient',
        companyName: 'Client Potentiel',
        plan: 'trial'
      }
    })

    // Garder le tenant c-secur360 pour usage interne si nécessaire
    const csecurTenant = await prisma.tenant.upsert({
      where: { subdomain: 'c-secur360' },
      update: {},
      create: {
        subdomain: 'c-secur360',
        companyName: 'C-Secur360 (Admin)',
        plan: 'admin'
      }
    })

    // Recompter le nombre total de tenants après création/upsert
    const totalTenants = await prisma.tenant.count()

    await prisma.$disconnect()

    return NextResponse.json({
      success: true,
      message: '🎉 Base de données connectée et tenants créés!',
      tenants: [demoTenant, futureClientTenant, csecurTenant],
      totalTenants,
      created: {
        demo: demoTenant.companyName,
        futureclient: futureClientTenant.companyName,
        admin: csecurTenant.companyName
      }
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
