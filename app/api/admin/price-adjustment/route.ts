import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Aperçu du prochain ajustement de prix
export async function GET() {
  try {
    // Vérifier les prix actuels
    const { data: currentPricing, error: currentError } = await supabase
      .rpc('get_current_pricing');

    if (currentError) {
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des prix actuels', details: currentError },
        { status: 500 }
      );
    }

    // Prévoir le prochain ajustement
    const { data: preview, error: previewError } = await supabase
      .rpc('preview_next_price_adjustment');

    if (previewError) {
      return NextResponse.json(
        { error: 'Erreur lors de la prévisualisation', details: previewError },
        { status: 500 }
      );
    }

    // Historique des ajustements
    const { data: history, error: historyError } = await supabase
      .from('price_adjustments')
      .select('*')
      .order('adjustment_date', { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      currentPricing: currentPricing?.[0] || null,
      preview: preview?.[0] || null,
      history: history || []
    });

  } catch (error) {
    console.error('Erreur GET price-adjustment:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

// POST - Appliquer l'ajustement automatique ou personnalisé
export async function POST(request: NextRequest) {
  try {
    const { 
      action, 
      appliedBy = 'admin',
      customPercentage 
    } = await request.json();

    if (!action || !['apply_automatic', 'apply_custom'].includes(action)) {
      return NextResponse.json(
        { error: 'Action requise: apply_automatic ou apply_custom' },
        { status: 400 }
      );
    }

    let result;

    if (action === 'apply_automatic') {
      // Appliquer l'ajustement automatique standard (3.5%)
      const { data, error } = await supabase
        .rpc('apply_automatic_price_adjustment', { applied_by_user: appliedBy });

      if (error) {
        return NextResponse.json(
          { error: 'Erreur lors de l\'ajustement automatique', details: error },
          { status: 500 }
        );
      }

      result = data?.[0];

    } else if (action === 'apply_custom') {
      // Appliquer un ajustement personnalisé
      if (!customPercentage || customPercentage < 0 || customPercentage > 50) {
        return NextResponse.json(
          { error: 'Pourcentage personnalisé requis (0-50%)' },
          { status: 400 }
        );
      }

      // Récupérer les prix actuels
      const { data: currentConfig, error: configError } = await supabase
        .from('price_config')
        .select('*')
        .order('effective_date', { ascending: false })
        .limit(1)
        .single();

      if (configError || !currentConfig) {
        return NextResponse.json(
          { error: 'Configuration de prix introuvable' },
          { status: 404 }
        );
      }

      // Calculer les nouveaux prix avec le pourcentage personnalisé
      const { data: adjustedPrices, error: calcError } = await supabase
        .rpc('calculate_adjusted_prices', {
          current_monthly: currentConfig.monthly_price,
          current_annual: currentConfig.annual_price,
          current_additional_site: currentConfig.additional_site_price,
          adjustment_percentage: customPercentage
        });

      if (calcError) {
        return NextResponse.json(
          { error: 'Erreur calcul nouveaux prix', details: calcError },
          { status: 500 }
        );
      }

      const newPrices = adjustedPrices[0];

      // Enregistrer l'ajustement personnalisé
      const { data: adjustmentData, error: insertError } = await supabase
        .from('price_adjustments')
        .insert([
          {
            adjustment_date: new Date().toISOString().split('T')[0],
            adjustment_percentage: customPercentage,
            previous_monthly_price: currentConfig.monthly_price,
            previous_annual_price: currentConfig.annual_price,
            previous_additional_site_price: currentConfig.additional_site_price,
            new_monthly_price: newPrices.new_monthly,
            new_annual_price: newPrices.new_annual,
            new_additional_site_price: newPrices.new_additional_site,
            applied: true,
            applied_at: new Date().toISOString(),
            applied_by: appliedBy,
            notes: `Ajustement personnalisé de ${customPercentage}% appliqué manuellement`
          }
        ])
        .select()
        .single();

      if (insertError) {
        return NextResponse.json(
          { error: 'Erreur enregistrement ajustement', details: insertError },
          { status: 500 }
        );
      }

      // Créer nouvelle configuration de prix
      const { error: newConfigError } = await supabase
        .from('price_config')
        .insert([
          {
            monthly_price: newPrices.new_monthly,
            annual_price: newPrices.new_annual,
            additional_site_price: newPrices.new_additional_site,
            auto_adjustment_enabled: currentConfig.auto_adjustment_enabled,
            adjustment_percentage: currentConfig.adjustment_percentage,
            next_adjustment_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            effective_date: new Date().toISOString().split('T')[0]
          }
        ]);

      if (newConfigError) {
        return NextResponse.json(
          { error: 'Erreur création nouvelle config', details: newConfigError },
          { status: 500 }
        );
      }

      // Log d'audit
      await supabase
        .from('audit_logs')
        .insert([
          {
            actor: appliedBy,
            action: 'custom_price_adjustment_applied',
            target_id: adjustmentData.id,
            meta: {
              previous_monthly: currentConfig.monthly_price,
              previous_annual: currentConfig.annual_price,
              new_monthly: newPrices.new_monthly,
              new_annual: newPrices.new_annual,
              adjustment_percentage: customPercentage,
              custom: true
            }
          }
        ]);

      result = {
        success: true,
        message: `Ajustement personnalisé de ${customPercentage}% appliqué avec succès`,
        adjustment_id: adjustmentData.id,
        new_monthly: newPrices.new_monthly,
        new_annual: newPrices.new_annual,
        new_additional_site: newPrices.new_additional_site
      };
    }

    if (!result || !result.success) {
      return NextResponse.json(
        { error: result?.message || 'Ajustement échoué' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      adjustment: {
        id: result.adjustment_id,
        newPrices: {
          monthly: result.new_monthly,
          annual: result.new_annual,
          additionalSite: result.new_additional_site
        }
      }
    });

  } catch (error) {
    console.error('Erreur POST price-adjustment:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

// PUT - Modifier la configuration d'ajustement automatique
export async function PUT(request: NextRequest) {
  try {
    const { 
      autoAdjustmentEnabled,
      adjustmentPercentage,
      nextAdjustmentDate
    } = await request.json();

    // Validation
    if (typeof autoAdjustmentEnabled !== 'boolean') {
      return NextResponse.json(
        { error: 'autoAdjustmentEnabled doit être un boolean' },
        { status: 400 }
      );
    }

    if (adjustmentPercentage !== undefined && (adjustmentPercentage < 0 || adjustmentPercentage > 50)) {
      return NextResponse.json(
        { error: 'adjustmentPercentage doit être entre 0 et 50' },
        { status: 400 }
      );
    }

    // Récupérer la configuration actuelle
    const { data: currentConfig, error: configError } = await supabase
      .from('price_config')
      .select('*')
      .order('effective_date', { ascending: false })
      .limit(1)
      .single();

    if (configError || !currentConfig) {
      return NextResponse.json(
        { error: 'Configuration actuelle introuvable' },
        { status: 404 }
      );
    }

    // Mettre à jour la configuration
    const { error: updateError } = await supabase
      .from('price_config')
      .update({
        auto_adjustment_enabled: autoAdjustmentEnabled,
        adjustment_percentage: adjustmentPercentage ?? currentConfig.adjustment_percentage,
        next_adjustment_date: nextAdjustmentDate ?? currentConfig.next_adjustment_date,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentConfig.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Erreur mise à jour configuration', details: updateError },
        { status: 500 }
      );
    }

    // Log d'audit
    await supabase
      .from('audit_logs')
      .insert([
        {
          actor: 'admin',
          action: 'price_config_updated',
          target_id: currentConfig.id,
          meta: {
            auto_adjustment_enabled: autoAdjustmentEnabled,
            adjustment_percentage: adjustmentPercentage ?? currentConfig.adjustment_percentage,
            next_adjustment_date: nextAdjustmentDate ?? currentConfig.next_adjustment_date
          }
        }
      ]);

    return NextResponse.json({
      success: true,
      message: 'Configuration mise à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur PUT price-adjustment:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}