import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    console.log('🔄 Connecting to database...')
    
    // Test de connexion
    await prisma.$connect()
    console.log('✅ Connected to database')
    
    // Créer un tenant de test pour forcer la création des tables
    console.log('📋 Creating demo tenant...')
    const demoTenant = await prisma.tenant.upsert({
      where: { subdomain: 'demo' },
      update: {},
      create: {
        subdomain: 'demo',
        companyName: 'Démo AST MDL',
        plan: 'demo'
      }
    })
    
    // Créer le tenant C-Secur360
    console.log('📋 Creating C-Secur360 tenant...')
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
    console.log('✅ Database initialized successfully')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database initialized successfully! Check Supabase Table Editor now.',
      tenants: [demoTenant, csecurTenant]
    })
    
  } catch (error: any) {
    console.error('❌ Database error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      details: 'Check that all environment variables are set correctly'
    }, { status: 500 })
  }
}
