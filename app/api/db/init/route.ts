import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔄 Connecting to database...')
    
    // Test de connexion
    await prisma.$connect()
    console.log('✅ Connected to database')
    
    // Créer tenant démo
    const demoTenant = await prisma.tenant.upsert({
      where: { subdomain: 'demo' },
      update: {},
      create: {
        subdomain: 'demo',
        companyName: 'Démo AST MDL',
        plan: 'demo'
      }
    })
    
    // Créer tenant C-Secur360
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
      message: '🎉 Tables créées avec succès! Vérifiez Supabase Table Editor maintenant.',
      tenants: [demoTenant, csecurTenant]
    })
    
  } catch (error: any) {
    console.error('❌ Database error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      details: error.stack
    }, { status: 500 })
  }
}
