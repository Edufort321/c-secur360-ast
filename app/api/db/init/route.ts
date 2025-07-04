import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔄 Testing database connection...')
    
    // Test simple de connexion
    await prisma.$connect()
    console.log('✅ Connected to database')
    
    // Vérifier si les tenants existent déjà
    const existingTenants = await prisma.tenant.findMany()
    console.log('📊 Existing tenants:', existingTenants.length)
    
    // Créer tenant démo seulement s'il n'existe pas
    const demoTenant = await prisma.tenant.upsert({
      where: { subdomain: 'demo' },
      update: {},
      create: {
        subdomain: 'demo',
        companyName: 'Démo AST MDL',
        plan: 'demo'
      }
    })
    
    // Créer tenant C-Secur360 seulement s'il n'existe pas
    const csecurTenant = await prisma.tenant.upsert({
      where: { subdomain: 'c-secur360' },
      update: {},
      create: {
        subdomain: 'c-secur360',
        companyName: 'C-Secur360',
        plan: 'premium'
      }
    })
    
    await prisma.$disconnect()
    
    return NextResponse.json({ 
      success: true, 
      message: '🎉 Base de données connectée et tenants créés!',
      tenants: [demoTenant, csecurTenant],
      totalTenants: existingTenants.length + 2
    })
    
  } catch (error: any) {
    console.error('❌ Database error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      code: error.code
    }, { status: 500 })
  }
}
