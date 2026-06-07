'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Settings, 
  AlertTriangle, 
  CheckCircle,
  History,
  Calculator
} from 'lucide-react';

// =================== INTERFACES ===================
interface PriceConfig {
  monthly_price_cents: number;
  annual_price_cents: number;
  additional_site_price_cents: number;
  monthly_price_cad: number;
  annual_price_cad: number;
  additional_site_price_cad: number;
  effective_date: string;
  next_adjustment_date: string;
  auto_adjustment_enabled: boolean;
}

interface PricePreview {
  current_monthly_price: number;
  current_annual_price: number;
  current_additional_site_price: number;
  projected_monthly_price: number;
  projected_annual_price: number;
  projected_additional_site_price: number;
  adjustment_percentage: number;
  next_adjustment_date: string;
  revenue_impact_monthly: number;
  revenue_impact_annual: number;
}

interface PriceAdjustment {
  id: string;
  adjustment_date: string;
  adjustment_percentage: number;
  previous_monthly_price: number;
  previous_annual_price: number;
  new_monthly_price: number;
  new_annual_price: number;
  applied: boolean;
  applied_by: string;
  notes: string;
}

const PriceManagementPage: React.FC = () => {
  // =================== ÉTATS ===================
  const [currentPricing, setCurrentPricing] = useState<PriceConfig | null>(null);
  const [pricePreview, setPricePreview] = useState<PricePreview | null>(null);
  const [adjustmentHistory, setAdjustmentHistory] = useState<PriceAdjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [customPercentage, setCustomPercentage] = useState('');
  const [autoAdjustmentEnabled, setAutoAdjustmentEnabled] = useState(true);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // =================== EFFETS ===================
  useEffect(() => {
    loadPricingData();
  }, []);

  // =================== FONCTIONS ===================
  const loadPricingData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/price-adjustment');
      const data = await response.json();

      if (data.success) {
        setCurrentPricing(data.currentPricing);
        setPricePreview(data.preview);
        setAdjustmentHistory(data.history);
        setAutoAdjustmentEnabled(data.currentPricing?.auto_adjustment_enabled || true);
      } else {
        showMessage('error', data.error || 'Erreur lors du chargement');
      }
    } catch (error) {
      showMessage('error', 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const applyAutomaticAdjustment = async () => {
    setApplying(true);
    try {
      const response = await fetch('/api/admin/price-adjustment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply_automatic',
          appliedBy: 'admin'
        })
      });

      const data = await response.json();
      if (data.success) {
        showMessage('success', data.message);
        loadPricingData();
      } else {
        showMessage('error', data.error);
      }
    } catch (error) {
      showMessage('error', 'Erreur lors de l\'application');
    } finally {
      setApplying(false);
    }
  };

  const applyCustomAdjustment = async () => {
    const percentage = parseFloat(customPercentage);
    if (!percentage || percentage < 0 || percentage > 50) {
      showMessage('error', 'Pourcentage invalide (0-50%)');
      return;
    }

    setApplying(true);
    try {
      const response = await fetch('/api/admin/price-adjustment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply_custom',
          customPercentage: percentage,
          appliedBy: 'admin'
        })
      });

      const data = await response.json();
      if (data.success) {
        showMessage('success', data.message);
        setCustomPercentage('');
        loadPricingData();
      } else {
        showMessage('error', data.error);
      }
    } catch (error) {
      showMessage('error', 'Erreur lors de l\'application');
    } finally {
      setApplying(false);
    }
  };

  const updateAutoAdjustmentConfig = async () => {
    try {
      const response = await fetch('/api/admin/price-adjustment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autoAdjustmentEnabled
        })
      });

      const data = await response.json();
      if (data.success) {
        showMessage('success', 'Configuration mise à jour');
        loadPricingData();
      } else {
        showMessage('error', data.error);
      }
    } catch (error) {
      showMessage('error', 'Erreur lors de la mise à jour');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestion des Prix - C-Secur360
        </h1>
        <p className="text-gray-600">
          Gérez les prix, ajustements automatiques et historique des modifications
        </p>
      </div>

      {/* Messages */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
          'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? 
              <CheckCircle className="mr-2" size={20} /> : 
              <AlertTriangle className="mr-2" size={20} />
            }
            {message.text}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Prix actuels */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-6">
            <DollarSign className="text-green-600 mr-3" size={24} />
            <h2 className="text-xl font-semibold">Prix Actuels</h2>
          </div>

          {currentPricing && (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                <span className="font-medium">Plan Mensuel</span>
                <span className="text-2xl font-bold text-green-600">
                  {currentPricing.monthly_price_cad}$ CAD
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                <span className="font-medium">Plan Annuel</span>
                <span className="text-2xl font-bold text-green-600">
                  {currentPricing.annual_price_cad}$ CAD
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                <span className="font-medium">Site Additionnel</span>
                <span className="text-2xl font-bold text-green-600">
                  {currentPricing.additional_site_price_cad}$ CAD/an
                </span>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Date d'entrée en vigueur</span>
                  <span className="font-medium">
                    {new Date(currentPricing.effective_date).toLocaleDateString('fr-CA')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Prochain ajustement</span>
                  <span className="font-medium">
                    {new Date(currentPricing.next_adjustment_date).toLocaleDateString('fr-CA')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ajustement automatique */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-6">
            <TrendingUp className="text-blue-600 mr-3" size={24} />
            <h2 className="text-xl font-semibold">Ajustement Automatique</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded">
              <span className="font-medium">Ajustement annuel automatique</span>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoAdjustmentEnabled}
                  onChange={(e) => setAutoAdjustmentEnabled(e.target.checked)}
                  className="sr-only"
                />
                <div className={`relative w-10 h-6 transition-colors duration-200 ease-in-out rounded-full ${
                  autoAdjustmentEnabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${
                    autoAdjustmentEnabled ? 'transform translate-x-4' : ''
                  }`}></div>
                </div>
              </label>
            </div>

            {pricePreview && (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Prévisualisation (+3.5%)</h3>
                
                <div className="flex justify-between text-sm">
                  <span>Plan Mensuel</span>
                  <span className="font-medium">
                    {(pricePreview.projected_monthly_price / 100).toFixed(2)}$ CAD
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Plan Annuel</span>
                  <span className="font-medium">
                    {(pricePreview.projected_annual_price / 100).toFixed(2)}$ CAD
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Site Additionnel</span>
                  <span className="font-medium">
                    {(pricePreview.projected_additional_site_price / 100).toFixed(2)}$ CAD/an
                  </span>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Impact revenus mensuels</span>
                    <span className="font-medium text-green-600">
                      +{pricePreview.revenue_impact_monthly.toFixed(2)}$ CAD
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Impact revenus annuels</span>
                    <span className="font-medium text-green-600">
                      +{pricePreview.revenue_impact_annual.toFixed(2)}$ CAD
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={updateAutoAdjustmentConfig}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                <Settings className="inline mr-2" size={16} />
                Sauvegarder Config
              </button>
              
              <button
                onClick={applyAutomaticAdjustment}
                disabled={applying}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {applying ? 'Application...' : 'Appliquer +3.5%'}
              </button>
            </div>
          </div>
        </div>

        {/* Ajustement personnalisé */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-6">
            <Calculator className="text-purple-600 mr-3" size={24} />
            <h2 className="text-xl font-semibold">Ajustement Personnalisé</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pourcentage d'augmentation (0-50%)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.1"
                value={customPercentage}
                onChange={(e) => setCustomPercentage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Ex: 5.5"
              />
            </div>

            <button
              onClick={applyCustomAdjustment}
              disabled={applying || !customPercentage}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {applying ? 'Application...' : `Appliquer +${customPercentage}%`}
            </button>

            <div className="text-xs text-gray-500">
              ⚠️ L'ajustement personnalisé remplacera les prix actuels immédiatement et 
              sera enregistré dans l'historique.
            </div>
          </div>
        </div>

        {/* Historique des ajustements */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-6">
            <History className="text-gray-600 mr-3" size={24} />
            <h2 className="text-xl font-semibold">Historique des Ajustements</h2>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {adjustmentHistory.length > 0 ? (
              adjustmentHistory.map((adjustment) => (
                <div key={adjustment.id} className="border rounded p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">
                        +{adjustment.adjustment_percentage}% appliqué
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(adjustment.adjustment_date).toLocaleDateString('fr-CA')}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div>Par: {adjustment.applied_by}</div>
                      <div className={`px-2 py-1 rounded ${
                        adjustment.applied ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {adjustment.applied ? 'Appliqué' : 'En attente'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Mensuel:</span>
                      <span>
                        {(adjustment.previous_monthly_price / 100).toFixed(2)}$ → {(adjustment.new_monthly_price / 100).toFixed(2)}$
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Annuel:</span>
                      <span>
                        {(adjustment.previous_annual_price / 100).toFixed(2)}$ → {(adjustment.new_annual_price / 100).toFixed(2)}$
                      </span>
                    </div>
                  </div>

                  {adjustment.notes && (
                    <div className="text-xs text-gray-500 mt-2 italic">
                      {adjustment.notes}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                Aucun ajustement dans l'historique
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Forfaits Assistant IA (jetons) — cartes de prix publiques ajustables */}
      <AiPlansEditor onMessage={showMessage} />
    </div>
  );
};

type AiPlan = { id: string; name_fr: string; name_en: string; price_cents: number; note_fr: string; note_en: string; sort_order: number; active: boolean };

const AiPlansEditor: React.FC<{ onMessage: (t: 'success' | 'error', m: string) => void }> = ({ onMessage }) => {
  const [plans, setPlans] = useState<AiPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/ai-plans');
      const d = await r.json();
      if (r.ok && Array.isArray(d.plans)) setPlans(d.plans);
      else onMessage('error', d.error || 'Forfaits IA indisponibles (migration 132 ?)');
    } catch { onMessage('error', 'Erreur de connexion (forfaits IA)'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const upd = (id: string, patch: Partial<AiPlan>) => setPlans(p => p.map(x => x.id === id ? { ...x, ...patch } : x));

  const save = async (plan: AiPlan) => {
    setSavingId(plan.id);
    try {
      const r = await fetch('/api/admin/ai-plans', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: plan.id, name_fr: plan.name_fr, name_en: plan.name_en, price_cents: plan.price_cents, note_fr: plan.note_fr, note_en: plan.note_en, active: plan.active, sort_order: plan.sort_order }),
      });
      const d = await r.json();
      if (r.ok) onMessage('success', `Forfait « ${plan.name_fr} » enregistré`);
      else onMessage('error', d.error || 'Échec de l\'enregistrement');
    } catch { onMessage('error', 'Erreur réseau'); }
    finally { setSavingId(null); }
  };

  return (
    <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-2">
        <DollarSign className="text-fuchsia-600 mr-3" size={24} />
        <h2 className="text-xl font-semibold">Forfaits Assistant IA (jetons)</h2>
      </div>
      <p className="text-sm text-gray-500 mb-4">Ces forfaits apparaissent comme cartes de prix sur la page publique. Le prix payé est public ; le budget de coût IA réel (×70 %, marge 30 %) reste interne.</p>
      {loading ? (
        <div className="text-gray-400 py-6 text-center">Chargement…</div>
      ) : plans.length === 0 ? (
        <div className="text-gray-400 py-6 text-center">Aucun forfait. Exécute la migration 132.</div>
      ) : (
        <div className="space-y-3">
          {plans.map(p => (
            <div key={p.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center border border-gray-100 rounded-lg p-3">
              <input className="md:col-span-3 border rounded px-2 py-1.5 text-sm" value={p.name_fr} onChange={e => upd(p.id, { name_fr: e.target.value })} placeholder="Nom (FR)" />
              <input className="md:col-span-3 border rounded px-2 py-1.5 text-sm" value={p.name_en} onChange={e => upd(p.id, { name_en: e.target.value })} placeholder="Name (EN)" />
              <div className="md:col-span-2 flex items-center gap-1">
                <input type="number" min={0} step={50} className="w-full border rounded px-2 py-1.5 text-sm" value={Math.round(p.price_cents / 100)} onChange={e => upd(p.id, { price_cents: Math.max(0, Math.round(Number(e.target.value) || 0)) * 100 })} />
                <span className="text-xs text-gray-400">$/an</span>
              </div>
              <label className="md:col-span-2 flex items-center gap-1.5 text-sm text-gray-700">
                <input type="checkbox" checked={p.active} onChange={e => upd(p.id, { active: e.target.checked })} /> Actif
              </label>
              <button onClick={() => save(p)} disabled={savingId === p.id} className="md:col-span-2 rounded-lg bg-fuchsia-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-fuchsia-700 disabled:opacity-50">
                {savingId === p.id ? '…' : 'Enregistrer'}
              </button>
              <input className="md:col-span-12 border rounded px-2 py-1.5 text-xs text-gray-600" value={p.note_fr} onChange={e => upd(p.id, { note_fr: e.target.value })} placeholder="Note descriptive (FR) affichée sur la carte" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PriceManagementPage;