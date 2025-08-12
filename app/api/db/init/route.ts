import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔄 Testing database connection...')

    // Vérifier si les tenants existent déjà
    const { data: existingTenants, error: fetchError } = await supabase
      .from('tenants')
      .select('*')

    if (fetchError) throw fetchError

    console.log('📊 Existing tenants:', existingTenants.length)

    // Helper pour upsert un tenant
    const upsertTenant = async (tenant: any) => {
      const { data, error } = await supabase
        .from('tenants')
        .upsert(tenant, { onConflict: 'subdomain' })
        .select()
        .single()
      if (error) throw error
      return data
    }

    // Créer tenant démo seulement s'il n'existe pas
    const demoTenant = await upsertTenant({
      subdomain: 'demo',
      companyName: 'Version Démo C-Secur360',
      plan: 'demo'
    })

    // Créer tenant futureclient seulement s'il n'existe pas
    const futureClientTenant = await upsertTenant({
      subdomain: 'futureclient',
      companyName: 'Client Potentiel',
      plan: 'trial'
    })

    // Garder le tenant c-secur360 pour usage interne si nécessaire
    const csecurTenant = await upsertTenant({
      subdomain: 'c-secur360',
      companyName: 'C-Secur360 (Admin)',
      plan: 'admin'
    })

    return NextResponse.json({
      success: true,
      message: '🎉 Base de données connectée et tenants créés!',
      tenants: [demoTenant, futureClientTenant, csecurTenant],
      totalTenants: existingTenants.length,
      created: {
        demo: demoTenant.companyName,
        futureclient: futureClientTenant.companyName,
        admin: csecurTenant.companyName
      }
    })
    
  } catch (error: any) {
    console.error('❌ Database error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
