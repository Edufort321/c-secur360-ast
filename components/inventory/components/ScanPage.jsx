// ============== PAGE DE SCAN MOBILE ==============
// Page optimisée pour mobile permettant d'ajuster l'inventaire via QR code

import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Minus,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  MapPin,
  Hash
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export function ScanPage() {
  const { t } = useLanguage();
  const { isDarkMode } = useTheme();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [action, setAction] = useState('add'); // 'add' ou 'remove'
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Récupérer les paramètres de l'URL
    const params = new URLSearchParams(window.location.search);
    const itemId = params.get('id');
    const itemCode = params.get('code');

    if (!itemId && !itemCode) {
      setError(t('scanner.itemNotFound'));
      setLoading(false);
      return;
    }

    // Charger l'article depuis localStorage
    loadItem(itemId, itemCode);
  }, []);

  const loadItem = async (id, code) => {
    try {
      // Essayer d'abord depuis Supabase
      try {
        const { itemsAPI } = await import('../lib/supabase');
        const supabaseItem = await itemsAPI.getById(id);

        if (supabaseItem) {
          // Transformer le format Supabase
          const transformedItem = {
            ...supabaseItem,
            locations: supabaseItem.item_locations || []
          };
          setItem(transformedItem);
          setLoading(false);
          return;
        }
      } catch (supabaseError) {
        console.warn('Supabase non disponible, utilisation de localStorage:', supabaseError);
      }

      // Fallback sur localStorage
      const storedInventory = localStorage.getItem('c-secur360-inventory');
      if (!storedInventory) {
        setError(t('scanner.itemNotFound'));
        setLoading(false);
        return;
      }

      const inventory = JSON.parse(storedInventory);
      const foundItem = inventory.find(i => i.id === id || i.code === code);

      if (!foundItem) {
        setError(t('scanner.itemNotFound'));
        setLoading(false);
        return;
      }

      setItem(foundItem);
      setLoading(false);
    } catch (err) {
      setError(t('common.error') + ': ' + err.message);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const newQuantity = action === 'add'
        ? item.quantity + quantity
        : Math.max(0, item.quantity - quantity);

      // Essayer de mettre à jour dans Supabase d'abord
      try {
        const { itemsAPI } = await import('../lib/supabase');
        await itemsAPI.update(item.id, { quantity: newQuantity });
      } catch (supabaseError) {
        console.warn('Mise à jour Supabase échouée, utilisation de localStorage:', supabaseError);
      }

      // Mettre à jour localStorage également
      const storedInventory = localStorage.getItem('c-secur360-inventory');
      if (storedInventory) {
        const inventory = JSON.parse(storedInventory);
        const updatedInventory = inventory.map(i => {
          if (i.id === item.id) {
            return { ...i, quantity: newQuantity };
          }
          return i;
        });
        localStorage.setItem('c-secur360-inventory', JSON.stringify(updatedInventory));
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        loadItem(item.id, item.code);
        setQuantity(1);
      }, 2000);
    } catch (err) {
      setError(t('common.error') + ': ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-red-500" size={32} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('common.error')}</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
          >
            <ArrowLeft size={20} />
            {t('actions.backToHome')}
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="text-green-500 mx-auto mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('scanner.success')}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('scanner.successMessage')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md mx-auto py-8">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-slate-700 to-red-600 text-white rounded-t-xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <Package size={32} />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{item.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Hash size={16} />
                <span className="text-sm opacity-90">{t('common.codeWith')} {item.code}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="bg-white dark:bg-gray-800 rounded-b-xl shadow-xl p-6 space-y-6">
          {/* Informations actuelles */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              {t('articles.currentInventory')}
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">{t('articles.quantity')}:</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {item.quantity}
                </span>
              </div>
              {item.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin size={14} />
                  <span>{item.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Sélection de l'action */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              {t('scanner.action')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setAction('add')}
                className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 font-semibold transition-all ${
                  action === 'add'
                    ? 'bg-green-500 border-green-600 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-green-400'
                }`}
              >
                <Plus size={24} />
                {t('actions.addAction')}
              </button>
              <button
                onClick={() => setAction('remove')}
                className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 font-semibold transition-all ${
                  action === 'remove'
                    ? 'bg-red-500 border-red-600 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-red-400'
                }`}
              >
                <Minus size={24} />
                {t('actions.removeAction')}
              </button>
            </div>
          </div>

          {/* Quantité */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              {t('common.quantity')}
            </h3>
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 sm:p-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors flex-shrink-0"
              >
                <Minus size={20} className="sm:w-6 sm:h-6" />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 min-w-0 text-center text-2xl sm:text-3xl font-bold bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg py-2 sm:py-3 focus:outline-none focus:border-slate-700"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 sm:p-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors flex-shrink-0"
              >
                <Plus size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          {/* Bouton de validation */}
          <button
            onClick={handleSubmit}
            className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-bold text-lg text-white shadow-lg transition-all ${
              action === 'add'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'
            }`}
          >
            <CheckCircle size={24} />
            {action === 'add' ? t('actions.addAction') : t('actions.removeAction')} {quantity} {item.unit || t('articles.units.units')}
          </button>

          {/* Lien retour */}
          <button
            onClick={() => window.location.href = '/'}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors"
          >
            <ArrowLeft size={20} />
            {t('actions.backToInventory')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScanPage;
