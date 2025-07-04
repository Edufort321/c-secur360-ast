import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔄 Connecting to database...')
    
    // Se connecter à la base de données
    await prisma.$connect()
    console.log('✅ Connected to database')
    
    // Forcer la création des tables avec une requête SQL brute
    console.log('📋 Creating tables...')
    
    // Exécuter les migrations pour créer les tables
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "tenants" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "subdomain" TEXT NOT NULL UNIQUE,
        "companyName" TEXT NOT NULL,
        "plan" TEXT NOT NULL DEFAULT 'basic',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "name" TEXT,
        "password" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'user',
        "tenantId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "ast_forms" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "tenantId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "projectNumber" TEXT NOT NULL,
        "clientName" TEXT NOT NULL,
        "workLocation" TEXT NOT NULL,
        "clientRep" TEXT,
        "emergencyNumber" TEXT,
        "astMdlNumber" TEXT NOT NULL,
        "astClientNumber" TEXT,
        "workDescription" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'draft',
        "generalInfo" JSONB,
        "teamDiscussion" JSONB,
        "isolation" JSONB,
        "hazards" JSONB,
        "controlMeasures" JSONB,
        "workers" JSONB,
        "photos" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    console.log('✅ Tables created successfully')
    
    // Maintenant créer les tenants
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
      message: '🎉 Tables et tenants créés avec succès! Vérifiez Supabase maintenant.',
      tenants: [demoTenant, csecurTenant]
    })
    
  } catch (error: any) {
    console.error('❌ Database error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message
    }, { status: 500 })
  }
}
