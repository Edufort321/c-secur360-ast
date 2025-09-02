import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔍 Test API Supabase');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Variables d\'environnement manquantes',
        details: {
          url: !!supabaseUrl,
          key: !!supabaseKey
        }
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test de lecture ast_forms
    const { data: astData, error: astError } = await supabase
      .from('ast_forms')
      .select('*')
      .limit(3);
    
    if (astError) {
      return NextResponse.json({
        success: false,
        error: 'Erreur lecture ast_forms',
        details: {
          message: astError.message,
          code: astError.code,
          hint: astError.hint
        }
      });
    }
    
    // Test d'insertion simple
    const testAST = {
      tenantId: 'api-test',
      userId: 'test-api-user',
      projectNumber: `API-TEST-${Date.now()}`,
      clientName: '🧪 Test API Endpoint',
      workLocation: 'Test via API',
      astMdlNumber: `AST-API-2025-${Date.now()}`,
      workDescription: 'Test de l\'endpoint API Supabase',
      status: 'draft'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('ast_forms')
      .insert(testAST)
      .select('*')
      .single();
    
    if (insertError) {
      return NextResponse.json({
        success: false,
        error: 'Erreur insertion test',
        read_success: true,
        read_count: astData?.length || 0,
        insert_details: {
          message: insertError.message,
          code: insertError.code,
          hint: insertError.hint
        }
      });
    }
    
    // Nettoyer le test
    await supabase
      .from('ast_forms')
      .delete()
      .eq('id', insertData.id);
    
    return NextResponse.json({
      success: true,
      message: 'Supabase fonctionne parfaitement !',
      details: {
        read_count: astData?.length || 0,
        test_ast_created: insertData?.astMdlNumber || 'créé',
        test_cleaned: true
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Exception API',
      message: error.message
    });
  }
}