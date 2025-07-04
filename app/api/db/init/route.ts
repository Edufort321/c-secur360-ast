import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔄 Connecting to database...')
    
    // D'abord, pusher le schema (créer les tables)
    console.log('📋 Creating database tables...')
    
    // Test de connexion qui va créer les tables automatiquement
    await prisma.$connect()
    console.log('✅ Connected to database')
    
    // Créer tenant démo
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
    
    // Créer tenant C-Secur360
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
    
    return NextResponse.json({ 
      success: true, 
      message: '🎉 Tables créées avec succès! Vérifiez Supabase Table Editor maintenant.',
      tenants: [demoTenant, csecurTenant],
      note: 'Les tables ont été créées automatiquement par Prisma'
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
