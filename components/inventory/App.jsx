// ============== APPLICATION PRINCIPALE - GESTION INVENTAIRE C-SECUR360 ==============
// Application complète de gestion d'inventaire avec design professionnel moderne 2024

import React, { useState, useEffect, useMemo, useRef, useCallback, useDeferredValue } from 'react';
import * as XLSX from 'xlsx';
import {
  LayoutDashboard,
  Package,
  Camera,
  TrendingUp,
  FileText,
  Settings,
  LogIn,
  LogOut,
  User,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Box,
  QrCode,
  Save,
  XCircle,
  Eye,
  Calendar,
  Clock,
  MapPin,
  Tag,
  Layers,
  ChevronRight,
  X,
  Menu,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  MoreVertical,
  Grid,
  List,
  Printer,
  FileSpreadsheet,
  ExternalLink,
  ShoppingCart,
  Truck,
  CheckSquare,
  Building,
  ArrowLeft,
  Palette,
  Scale,
  Share,
  Mail,
  ClipboardCheck,
  ClipboardList,
  ScanLine,
  RefreshCw,
  Zap
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

// Contextes
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SearchInput from './components/SearchInput';

// Vues
import DashboardView from './views/DashboardView';
import ArticlesView from './views/ArticlesView';

// Composants UI
import { Logo } from './components/UI/Logo';
// ThemeSelector / LanguageSelector retires : le theme (Jour/Nuit) et la langue (FR/EN) sont
// piloter par le header principal de l'app (SyncHostPrefs dans Root.jsx) — un seul reglage global.
import { InstallPWA } from './components/UI/InstallPWA';
import { PWAInstallButton } from './components/UI/PWAInstallButton';
import { ScanPage } from './components/ScanPage';
import { ShareProductSheet } from './components/ShareProductSheet';
import { LocationSelector } from './components/LocationSelector';

// Composants Admin
import { PersonnelManagement } from './components/Admin/PersonnelManagement';
import { DepartmentManagement } from './components/Admin/DepartmentManagement';
import { CategoryManagement } from './components/Admin/CategoryManagement';

// Composants Auth
import { LoginScreen } from './components/Auth/LoginScreen';

// Configuration
import { getScanUrl } from './config/app';
import { generateLabelsPdf, LABEL_FORMATS } from './lib/labelPdf';

// Hooks
import { supabase } from './lib/supabase';
import { invKey } from './utils/invKey'; // namespacing localStorage par tenant (anti-fuite inter-tenant)

// Catalogue materiel standardise (partage avec Soumissions/Admin)
import { getCatalogues } from '@/lib/soumissions';

// Styles

// Écriture localStorage sûre (ignore les erreurs : mode privé Safari / quota dépassé).
function saveLS(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

// Chargement paresseux du moteur de décodage ZXing (WASM) — décodeur de QR robuste (remplace html5-qrcode).
// Le WASM est HÉBERGÉ DANS L'APP (public/zxing/zxing_reader.wasm) -> aucune dépendance CDN, marche hors-ligne.
// (Si zxing-wasm est mis à jour, recopier dist/reader/zxing_reader.wasm vers public/zxing/.)
let _zxingReaderPromise = null;
function loadZxing() {
  if (!_zxingReaderPromise) {
    _zxingReaderPromise = import('zxing-wasm/reader').then(mod => {
      try {
        mod.prepareZXingModule({
          overrides: { locateFile: (path, prefix) => (path.endsWith('.wasm') ? '/zxing/zxing_reader.wasm' : (prefix || '') + path) },
          fireImmediately: false,
        });
      } catch { /* défaut CDN si l'API change */ }
      return mod;
    });
  }
  return _zxingReaderPromise;
}

// ============== COMPOSANTS UI RÉUTILISABLES ==============

// Badge de statut coloré
const StatusBadge = ({ status, quantity, minQuantity, maxQuantity }) => {
  const { t } = useLanguage();

  let variant = 'success';
  let label = t('status.optimal');

  if (quantity <= minQuantity) {
    variant = 'error';
    label = t('status.low');
  } else if (quantity > maxQuantity) {
    variant = 'warning';
    label = t('status.surplus');
  }

  const variants = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {label}
    </span>
  );
};

// Bouton avec variantes
const Button = ({ children, variant = 'primary', size = 'md', icon: Icon, onClick, disabled, className = '' }) => {
  const variants = {
    primary: 'bg-slate-700 hover:bg-slate-800 text-white shadow-lg shadow-orange-500/30',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/30',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30',
    ghost: 'hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 rounded-lg font-medium
        transition-all duration-200 transform hover:scale-105
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

// Card de statistique moderne
const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue', trend }) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    yellow: 'from-yellow-500 to-yellow-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600'
  };

  const iconColors = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    orange: 'bg-slate-100 text-slate-600 dark:bg-orange-900/30 dark:text-slate-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className={`h-1 bg-gradient-to-r ${colors[color]}`}></div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${iconColors[color]} group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={24} />
          </div>
          {trend && (
            <span className={`text-sm font-semibold ${trend.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>
              {trend}
            </span>
          )}
        </div>
        <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

// Barre de progression
const ProgressBar = ({ value, max, showLabel = true }) => {
  const percentage = (value / max) * 100;
  let colorClass = 'bg-green-500';

  if (percentage <= 30) colorClass = 'bg-red-500';
  else if (percentage <= 60) colorClass = 'bg-yellow-500';

  return (
    <div className="w-full">
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${colorClass} transition-all duration-500 rounded-full`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
      {showLabel && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          {value} / {max} ({percentage.toFixed(0)}%)
        </p>
      )}
    </div>
  );
};

// Boutons d'action
const ActionButtons = ({ onEdit, onDelete, onView, onQR, onShare }) => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-1">
      {onView && (
        <button
          onClick={onView}
          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
          title={t('actions.view')}
        >
          <Eye size={16} />
        </button>
      )}
      {onEdit && (
        <button
          onClick={onEdit}
          className="p-2 text-slate-600 hover:bg-slate-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
          title={t('actions.edit')}
        >
          <Edit size={16} />
        </button>
      )}
      {onShare && (
        <button
          onClick={onShare}
          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          title={t('share.shareProduct')}
        >
          <Share size={16} />
        </button>
      )}
      {onQR && (
        <button
          onClick={onQR}
          className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
          title={t('articles.qrCode')}
        >
          <QrCode size={16} />
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
          title={t('actions.delete')}
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
};

// Empty State
const EmptyState = ({ icon: Icon = Package, title, message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
        <Icon size={48} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      {message && <p className="text-gray-600 dark:text-gray-400 text-sm max-w-sm">{message}</p>}
    </div>
  );
};

// Modal moderne
const Modal = ({ isOpen, onClose, title, children, footer }) => {
  const dialogRef = useRef(null);
  const prevFocus = useRef(null);
  // Accessibilité : Escape pour fermer, focus initial dans la modale, piège à Tab, restauration du focus.
  useEffect(() => {
    if (!isOpen) return;
    prevFocus.current = document.activeElement;
    const el = dialogRef.current;
    const focusables = () => el ? el.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])') : [];
    setTimeout(() => { const f = focusables(); (f.length ? f[0] : el)?.focus?.(); }, 0);
    const onKey = (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose?.(); return; }
      if (e.key === 'Tab') {
        const f = focusables(); if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => { document.removeEventListener('keydown', onKey, true); try { prevFocus.current?.focus?.(); } catch { /* ignore */ } };
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center overflow-y-auto bg-gray-900 bg-opacity-75 sm:p-4" onClick={onClose}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        className="relative bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-xl shadow-2xl w-full max-w-4xl max-h-[94vh] sm:max-h-[90vh] flex flex-col outline-none"
        onClick={(e) => e.stopPropagation()}
      >
          <div className="bg-white dark:bg-gray-800 px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 flex-shrink-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">{title}</h3>
              <button
                onClick={onClose}
                aria-label="Fermer"
                className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          <div className="overflow-y-auto flex-1 px-4 sm:px-6 pb-4">
            {children}
          </div>
          {footer && (
            <div className="bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-end gap-2 sm:gap-3 flex-shrink-0">
              {footer}
            </div>
          )}
      </div>
    </div>
  );
};

// ============== COMPOSANT PRINCIPAL ==============
// ============== COMPOSANT MODAL AJOUT ARTICLE (MÉMORISÉ) ==============
const AddItemModalComponent = React.memo(({
  isOpen,
  onClose,
  addItemMode,
  setAddItemMode,
  newItemData,
  onFieldChange,
  onLocationFieldChange,
  categories,
  departments,
  storageUnits,
  onSubmit,
  importStep,
  ImportExcelContentComponent,
  t,
  showAdvancedFields,
  setShowAdvancedFields,
  baseEbitda,
  targetEbitda,
  editingItem,
  setEditingItem
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? t('articles.editArticle') : t('articles.addArticles')}
    >
      <div className="space-y-6">
        {/* Choix du mode */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setAddItemMode('simple')}
            className={`p-6 rounded-xl border-2 transition-all ${
              addItemMode === 'simple'
                ? 'border-slate-600 bg-slate-50 dark:bg-orange-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-orange-300'
            }`}
          >
            <Package size={32} className={`mx-auto mb-3 ${addItemMode === 'simple' ? 'text-slate-600' : 'text-gray-400'}`} />
            <h3 className={`font-bold mb-1 ${addItemMode === 'simple' ? 'text-orange-700 dark:text-slate-400' : 'text-gray-700 dark:text-gray-300'}`}>
              {t('articles.simpleArticle')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('articles.addSingleManually')}
            </p>
          </button>

          <button
            onClick={() => setAddItemMode('excel')}
            className={`p-6 rounded-xl border-2 transition-all ${
              addItemMode === 'excel'
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-green-300'
            }`}
          >
            <FileSpreadsheet size={32} className={`mx-auto mb-3 ${addItemMode === 'excel' ? 'text-green-600' : 'text-gray-400'}`} />
            <h3 className={`font-bold mb-1 ${addItemMode === 'excel' ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
              {t('articles.existingList')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('articles.importMultipleExcel')}
            </p>
          </button>
        </div>

        {/* Formulaire article simple */}
        {addItemMode === 'simple' && (
          <div className="space-y-4">
            {/* Option Code unique ou codes différents */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border-2 border-purple-200 dark:border-purple-800">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                {t('articles.codeOption')}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-purple-300 dark:hover:border-purple-600 transition-colors">
                  <input
                    type="radio"
                    name="codeOption"
                    value="unique"
                    checked={!newItemData.differentCodes}
                    onChange={() => onFieldChange('differentCodes', false)}
                    className="w-4 h-4 text-purple-600"
                  />
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white block">{t('articles.uniqueCode')}</span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{t('articles.uniqueCodeDescription')}</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-purple-300 dark:hover:border-purple-600 transition-colors">
                  <input
                    type="radio"
                    name="codeOption"
                    value="different"
                    checked={newItemData.differentCodes === true}
                    onChange={() => onFieldChange('differentCodes', true)}
                    className="w-4 h-4 text-purple-600"
                  />
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white block">{t('articles.differentCodes')}</span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{t('articles.differentCodesDescription')}</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {!newItemData.differentCodes && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {t('articles.code')} * <span className="text-red-500">●</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                    value={newItemData.code}
                    onChange={(e) => onFieldChange('code', e.target.value)}
                    placeholder="EPI-001"
                  />
                </div>
              )}
              <div className={newItemData.differentCodes ? 'col-span-2' : ''}>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t('articles.name')} * <span className="text-red-500">●</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                  value={newItemData.name}
                  onChange={(e) => onFieldChange('name', e.target.value)}
                  placeholder="Masque N95"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t('articles.category')} * <span className="text-red-500">●</span>
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                  value={newItemData.category}
                  onChange={(e) => {
                    onFieldChange('category', e.target.value);
                    // Réinitialiser la sous-catégorie quand on change de catégorie
                    onFieldChange('subcategory', '');
                  }}
                >
                  <option value="">{t('actions.select')}...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Sous-catégorie - Apparaît seulement si une catégorie est sélectionnée */}
              {newItemData.category && (() => {
                const selectedCategory = categories.find(cat => cat.name === newItemData.category);
                const subcategories = selectedCategory?.subcategories || [];

                return subcategories.length > 0 ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Sous-catégorie
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                      value={newItemData.subcategory || ''}
                      onChange={(e) => onFieldChange('subcategory', e.target.value)}
                    >
                      <option value="">Aucune</option>
                      {subcategories.map((subcat, idx) => (
                        <option key={idx} value={subcat}>{subcat}</option>
                      ))}
                    </select>
                  </div>
                ) : null;
              })()}
            </div>

            {/* Sélection multiple de succursales */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3 mb-4">
                <Building className="text-blue-600" size={24} />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('articles.departmentsSection')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('articles.selectDepartments')}</p>
                </div>
              </div>

              <div className="space-y-3">
                {departments.map(dept => {
                  const isSelected = newItemData.locations?.some(loc => loc.department === dept.name);
                  const locationData = newItemData.locations?.find(loc => loc.department === dept.name);

                  return (
                    <div key={dept.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                      <label className="flex items-center gap-3 cursor-pointer mb-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const currentLocations = newItemData.locations || [];
                            if (e.target.checked) {
                              onFieldChange('locations', [...currentLocations, {
                                department: dept.name,
                                departmentCode: dept.code,
                                location: '',
                                quantity: 0,
                                minQuantity: 0,
                                maxQuantity: 100
                              }]);
                            } else {
                              onFieldChange('locations', currentLocations.filter(loc => loc.department !== dept.name));
                            }
                          }}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <span className="font-semibold text-gray-900 dark:text-white">{dept.name}</span>
                          <span className="ml-2 text-sm text-gray-500">({dept.code})</span>
                        </div>
                      </label>

                      {isSelected && (
                        <div className="ml-8 space-y-3 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          {/* Code personnalisé si option "codes différents" */}
                          {newItemData.differentCodes && (
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                {t('articles.customCode')} *
                              </label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                                value={locationData?.customCode || ''}
                                onChange={(e) => onLocationFieldChange(dept.name, 'customCode', e.target.value)}
                                placeholder={`${newItemData.code || 'EPI-001'}-${dept.code}`}
                              />
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div className="md:col-span-2">
                              <LocationSelector
                                department={dept}
                                storageUnits={storageUnits}
                                value={locationData?.location || ''}
                                onChange={(newLocation) => onLocationFieldChange(dept.name, 'location', newLocation)}
                                onDepartmentUpdate={(updatedDept) => {
                                  // Cette fonction sera appelée pour mettre à jour les compteurs
                                  updateDepartment(dept.id, updatedDept);
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                {t('articles.quantity')}
                              </label>
                              <input
                                type="text"
                                inputMode="numeric"
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                                value={locationData?.quantity === 0 ? '' : (locationData?.quantity || '')}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === '' || /^\d+$/.test(val)) onLocationFieldChange(dept.name, 'quantity', val === '' ? 0 : parseInt(val));
                                }}
                                placeholder="0"
                              />
                            </div>
                            {newItemData.articleType !== 'unique' && (
                              <>
                                <div className="hidden md:block"></div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    {t('articles.min')}
                                  </label>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                                    value={locationData?.minQuantity === 0 ? '' : (locationData?.minQuantity || '')}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val === '' || /^\d+$/.test(val)) onLocationFieldChange(dept.name, 'minQuantity', val === '' ? 0 : parseInt(val));
                                    }}
                                    placeholder="0"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                    {t('articles.max')}
                                  </label>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                                    value={locationData?.maxQuantity === 0 ? '' : (locationData?.maxQuantity || '')}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val === '' || /^\d+$/.test(val)) onLocationFieldChange(dept.name, 'maxQuantity', val === '' ? 0 : parseInt(val));
                                    }}
                                    placeholder="100"
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {(!newItemData.locations || newItemData.locations.length === 0) && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-3">
                  ⚠️ {t('articles.selectOneDepartment')}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t('articles.supplier')} <span className="text-gray-500 text-xs">{t('articles.optional')}</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                  value={newItemData.supplier || ''}
                  onChange={(e) => onFieldChange('supplier', e.target.value)}
                  placeholder={t('articles.supplierName')}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t('articles.supplierEmail')} <span className="text-gray-500 text-xs">{t('articles.optional')}</span>
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                  value={newItemData.supplierEmail || ''}
                  onChange={(e) => onFieldChange('supplierEmail', e.target.value)}
                  placeholder="fournisseur@example.com"
                />
              </div>
            </div>

            {/* Type d'article */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                {t('articles.articleType')}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-slate-600 transition-colors">
                  <input
                    type="radio"
                    name="articleType"
                    value="sale"
                    checked={newItemData.articleType === 'sale' || !newItemData.articleType}
                    onChange={(e) => onFieldChange('articleType', e.target.value)}
                    className="w-4 h-4 text-slate-600 border-gray-300 focus:ring-orange-500"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-gray-900 dark:text-white block truncate">{t('articles.forSale')}</span>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{t('articles.forSaleDescription')}</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-green-500 transition-colors">
                  <input
                    type="radio"
                    name="articleType"
                    value="consumable"
                    checked={newItemData.articleType === 'consumable'}
                    onChange={(e) => onFieldChange('articleType', e.target.value)}
                    className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-gray-900 dark:text-white block truncate">{t('articles.consumable')}</span>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{t('articles.costOnly')}</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-purple-500 transition-colors">
                  <input
                    type="radio"
                    name="articleType"
                    value="unique"
                    checked={newItemData.articleType === 'unique'}
                    onChange={(e) => onFieldChange('articleType', e.target.value)}
                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-gray-900 dark:text-white block truncate">{t('articles.uniqueSale')}</span>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{t('articles.noRestocking')}</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t('articles.costPriceShort')}
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                  value={newItemData.costPrice}
                  onChange={(e) => {
                    const val = e.target.value.replace(',', '.');
                    if (val === '' || /^\d*\.?\d*$/.test(val)) {
                      onFieldChange('costPrice', val);
                    }
                  }}
                  onBlur={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    onFieldChange('costPrice', val.toFixed(2));
                  }}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t('articles.baseEbitda')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                    value={newItemData.baseEbitda !== undefined ? newItemData.baseEbitda : baseEbitda}
                    onChange={(e) => {
                      const val = e.target.value.replace(',', '.');
                      if (val === '' || /^\d*\.?\d*$/.test(val)) {
                        onFieldChange('baseEbitda', val);
                      }
                    }}
                    onBlur={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      onFieldChange('baseEbitda', val);
                    }}
                    placeholder={baseEbitda.toString()}
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                    %
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('articles.ebitdaHelp')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t('articles.targetEbitda')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                    value={newItemData.targetEbitda !== undefined ? newItemData.targetEbitda : targetEbitda}
                    onChange={(e) => {
                      const val = e.target.value.replace(',', '.');
                      if (val === '' || /^\d*\.?\d*$/.test(val)) {
                        onFieldChange('targetEbitda', val);
                      }
                    }}
                    onBlur={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      onFieldChange('targetEbitda', val);
                    }}
                    placeholder={targetEbitda.toString()}
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                    %
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('articles.ebitdaHelp')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t('articles.baseSalePriceShort')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                    value={(() => {
                      const costPrice = parseFloat(newItemData.costPrice) || 0;
                      const baseEbitdaVal = parseFloat(newItemData.baseEbitda !== undefined ? newItemData.baseEbitda : baseEbitda) || 0;
                      return costPrice > 0 ? (costPrice * (1 + baseEbitdaVal / 100)).toFixed(2) : '0.00';
                    })()}
                    readOnly
                    disabled
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    $
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Calculé avec EBITDA de base
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t('articles.targetSalePriceShort')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                    value={(() => {
                      const costPrice = parseFloat(newItemData.costPrice) || 0;
                      const targetEbitdaVal = parseFloat(newItemData.targetEbitda !== undefined ? newItemData.targetEbitda : targetEbitda) || 0;
                      return costPrice > 0 ? (costPrice * (1 + targetEbitdaVal / 100)).toFixed(2) : '0.00';
                    })()}
                    readOnly
                    disabled
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    $
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Calculé avec EBITDA cible
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t('articles.unit')}
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                  value={newItemData.unit}
                  onChange={(e) => onFieldChange('unit', e.target.value)}
                >
                  <option>{t('articles.units.piece')}</option>
                  <option>{t('articles.units.box')}</option>
                  <option>{t('articles.units.pack')}</option>
                  <option>{t('articles.units.kg')}</option>
                  <option>{t('articles.units.l')}</option>
                </select>
              </div>
            </div>

            {/* Intervalle de mise à jour des prix */}
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-4 rounded-lg border-2 border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="text-yellow-600" size={20} />
                <h4 className="font-semibold text-gray-900 dark:text-white">{t('articles.priceRevision')}</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('articles.revisionFrequency')}
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                    value={newItemData.priceUpdateInterval || '3'}
                    onChange={(e) => onFieldChange('priceUpdateInterval', e.target.value)}
                  >
                    <option value="3">{t('articles.every3Months')}</option>
                    <option value="6">{t('articles.every6Months')}</option>
                    <option value="12">{t('articles.every12Months')}</option>
                    <option value="custom">{t('reports.periods.custom')}</option>
                  </select>
                </div>
                {newItemData.priceUpdateInterval === 'custom' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('articles.numberOfMonths')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                      value={newItemData.customPriceInterval || 1}
                      onChange={(e) => onFieldChange('customPriceInterval', parseInt(e.target.value) || 1)}
                      placeholder={t('articles.customMonths')}
                    />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                💡 {t('articles.priceAlertMessage')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {t('articles.description')}
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                rows="3"
                value={newItemData.description}
                onChange={(e) => onFieldChange('description', e.target.value)}
                placeholder={t('articles.description') + '...'}
              />
            </div>

            {/* Toggle pour champs avancés */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <button
                type="button"
                onClick={() => setShowAdvancedFields(!showAdvancedFields)}
                className="flex items-center justify-between w-full px-4 py-3 bg-gradient-to-r from-orange-50 to-blue-50 dark:from-orange-900/20 dark:to-blue-900/20 rounded-lg hover:from-orange-100 hover:to-blue-100 dark:hover:from-orange-900/30 dark:hover:to-blue-900/30 transition-all"
              >
                <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Package size={20} />
                  {t('articles.advancedFields')}
                </span>
                {showAdvancedFields ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>

            {/* Champs avancés */}
            {showAdvancedFields && (
              <div className="space-y-4 border-2 border-orange-200 dark:border-orange-800 rounded-lg p-4 bg-gradient-to-br from-orange-50/50 to-blue-50/50 dark:from-orange-900/10 dark:to-blue-900/10">

                {/* Carrousel de photos */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Camera size={18} />
                    {t('articles.photos')}
                  </label>

                  {newItemData.photos && newItemData.photos.length > 0 ? (
                    <div className="relative">
                      {/* Image principale */}
                      <div className="relative h-64 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                        <img
                          src={newItemData.photos[newItemData.currentPhotoIndex || 0]?.url}
                          alt={`Photo ${(newItemData.currentPhotoIndex || 0) + 1}`}
                          className="w-full h-full object-contain"
                        />

                        {/* Boutons de navigation */}
                        {newItemData.photos.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                const newIndex = ((newItemData.currentPhotoIndex || 0) - 1 + newItemData.photos.length) % newItemData.photos.length;
                                onFieldChange('currentPhotoIndex', newIndex);
                              }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all"
                            >
                              <ChevronLeft size={24} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const newIndex = ((newItemData.currentPhotoIndex || 0) + 1) % newItemData.photos.length;
                                onFieldChange('currentPhotoIndex', newIndex);
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all"
                            >
                              <ChevronRight size={24} />
                            </button>
                          </>
                        )}

                        {/* Compteur de photos */}
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                          {(newItemData.currentPhotoIndex || 0) + 1} / {newItemData.photos.length}
                        </div>

                        {/* Bouton supprimer */}
                        <button
                          type="button"
                          onClick={() => {
                            const newPhotos = newItemData.photos.filter((_, i) => i !== (newItemData.currentPhotoIndex || 0));
                            onFieldChange('photos', newPhotos);
                            if (newItemData.currentPhotoIndex >= newPhotos.length) {
                              onFieldChange('currentPhotoIndex', Math.max(0, newPhotos.length - 1));
                            }
                          }}
                          className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-full text-white transition-all"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      {/* Miniatures */}
                      {newItemData.photos.length > 1 && (
                        <div className="flex gap-2 mt-2 overflow-x-auto">
                          {newItemData.photos.map((photo, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => onFieldChange('currentPhotoIndex', index)}
                              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                (newItemData.currentPhotoIndex || 0) === index
                                  ? 'border-slate-600 scale-105'
                                  : 'border-gray-300 hover:border-orange-300'
                              }`}
                            >
                              <img src={photo.url} alt={`Miniature ${index + 1}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
                      <Camera size={48} className="mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('articles.noPhotosAdded')}</p>
                    </div>
                  )}

                  <input
                    type="file"
                    id="photo-upload"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      if (files.length === 0) return;

                      files.forEach(file => {
                        if (!file.type.startsWith('image/')) {
                          alert(t('articles.selectOnlyImages'));
                          return;
                        }

                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const currentPhotos = newItemData.photos || [];
                          onFieldChange('photos', [...currentPhotos, { url: reader.result, name: file.name }]);
                        };
                        reader.readAsDataURL(file);
                      });
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-700 text-white rounded-lg cursor-pointer transition-colors"
                  >
                    <Upload size={18} />
                    {t('articles.addPhotos')}
                  </label>
                </div>

                {/* Couleurs */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Palette size={18} />
                    {t('articles.colors')}
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(newItemData.colors || []).map((color, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full"
                      >
                        <span className="text-sm">{color}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newColors = (newItemData.colors || []).filter((_, i) => i !== index);
                            onFieldChange('colors', newColors);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={t('articles.addColor')}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const color = e.target.value.trim();
                          if (color && !(newItemData.colors || []).includes(color)) {
                            onFieldChange('colors', [...(newItemData.colors || []), color]);
                            e.target.value = '';
                          }
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('articles.pressEnterToAdd')}</p>
                </div>

                {/* Dimensions */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Box size={18} />
                    {t('articles.dimensionsLWH')}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder={t('articles.length')}
                      value={newItemData.dimensions?.length || ''}
                      onChange={(e) => onFieldChange('dimensions', { ...newItemData.dimensions, length: e.target.value })}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder={t('articles.width')}
                      value={newItemData.dimensions?.width || ''}
                      onChange={(e) => onFieldChange('dimensions', { ...newItemData.dimensions, width: e.target.value })}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder={t('articles.height')}
                      value={newItemData.dimensions?.height || ''}
                      onChange={(e) => onFieldChange('dimensions', { ...newItemData.dimensions, height: e.target.value })}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                    />
                    <select
                      value={newItemData.dimensions?.unit || 'cm'}
                      onChange={(e) => onFieldChange('dimensions', { ...newItemData.dimensions, unit: e.target.value })}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                    >
                      <option value="cm">cm</option>
                      <option value="m">m</option>
                      <option value="in">po</option>
                    </select>
                  </div>
                </div>

                {/* Poids */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Scale size={18} />
                    {t('articles.weight')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder={t('articles.weight')}
                      value={newItemData.weight?.value || ''}
                      onChange={(e) => onFieldChange('weight', { ...newItemData.weight, value: e.target.value })}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                    />
                    <select
                      value={newItemData.weight?.unit || 'kg'}
                      onChange={(e) => onFieldChange('weight', { ...newItemData.weight, unit: e.target.value })}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="lb">lb</option>
                    </select>
                  </div>
                </div>

                {/* Informations produit */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      {t('articles.brand')}
                    </label>
                    <input
                      type="text"
                      placeholder={t('articles.brandPlaceholder')}
                      value={newItemData.brand || ''}
                      onChange={(e) => onFieldChange('brand', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      {t('articles.model')}
                    </label>
                    <input
                      type="text"
                      placeholder={t('articles.modelPlaceholder')}
                      value={newItemData.model || ''}
                      onChange={(e) => onFieldChange('model', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {t('articles.serialNumber')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('articles.serialNumberPlaceholder')}
                    value={newItemData.serialNumber || ''}
                    onChange={(e) => onFieldChange('serialNumber', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                  />
                </div>

                {/* État/Condition */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {t('articles.condition')}
                  </label>
                  <select
                    value={newItemData.condition || 'new'}
                    onChange={(e) => onFieldChange('condition', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                  >
                    <option value="new">{t('articles.conditionNew')}</option>
                    <option value="like-new">{t('articles.conditionLikeNew')}</option>
                    <option value="good">{t('articles.conditionGood')}</option>
                    <option value="fair">{t('articles.conditionFair')}</option>
                    <option value="poor">{t('articles.conditionPoor')}</option>
                  </select>
                </div>

                {/* Garantie */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {t('articles.warranty')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('articles.warrantyPlaceholder')}
                    value={newItemData.warranty || ''}
                    onChange={(e) => onFieldChange('warranty', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                  />
                </div>

                {/* Prix de location (si article en vente/location) */}
                {newItemData.articleType === 'sale' && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <DollarSign size={18} />
                      {t('articles.rentalOption')}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('articles.rentalPrice')}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={newItemData.rentalPrice || 0}
                          onChange={(e) => onFieldChange('rentalPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {t('articles.rentalPeriod')}
                        </label>
                        <select
                          value={newItemData.rentalPeriod || 'day'}
                          onChange={(e) => onFieldChange('rentalPeriod', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                        >
                          <option value="hour">{t('articles.perHour')}</option>
                          <option value="day">{t('articles.perDay')}</option>
                          <option value="week">{t('articles.perWeek')}</option>
                          <option value="month">{t('articles.perMonth')}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="secondary" onClick={onClose}>
                {t('actions.cancel')}
              </Button>
              <Button variant="primary" icon={Plus} onClick={onSubmit}>
                {editingItem ? t('actions.save') : t('articles.addTheArticle')}
              </Button>
            </div>
          </div>
        )}

        {/* Import Excel */}
        {addItemMode === 'excel' && ImportExcelContentComponent}
      </div>
    </Modal>
  );
});

// Modale de connexion — composant de HAUT NIVEAU (stable) : ne se remonte plus à chaque rendu
// de AppContent (sinon la saisie username/password était perdue). Utilise ses propres hooks.
function LoginModal({ isOpen, onClose }) {
  const { t } = useLanguage();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(username, password);
    if (result.success) { onClose(); setUsername(''); setPassword(''); }
    else setError(result.error);
    setLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('login')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>{t('actions.cancel')}</Button>
          <Button variant="primary" onClick={handleLogin} disabled={loading}>{loading ? t('messages.info.loading') : t('login')}</Button>
        </>
      }
    >
      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 rounded">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-red-600 flex-shrink-0" />
              <span className="text-sm text-red-900 dark:text-red-400">{error}</span>
            </div>
          </div>
        )}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">{t('administration.users.username')}</label>
          <input type="text" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" value={username} onChange={(e) => setUsername(e.target.value)} required autoFocus />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">{t('administration.users.password')}</label>
          <input type="password" className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="font-semibold text-sm text-blue-900 dark:text-blue-400 mb-2">{t('administration.users.title')} :</p>
          <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-300">
            <li><strong>admin</strong> / admin - {t('administration.roles.admin')}</li>
            <li><strong>gestionnaire</strong> / gest123 - {t('administration.roles.manager')}</li>
            <li><strong>technicien</strong> / tech123 - {t('administration.roles.employee')}</li>
            <li><strong>viewer</strong> / view123 - {t('administration.roles.viewer')}</li>
          </ul>
        </div>
      </form>
    </Modal>
  );
}

function AppContent() {
  const { t, language } = useLanguage();
  const { currentUser, isAuthenticated, isAdmin, login, logout } = useAuth();

  // Source unique de vérité = snapshot inventory_state (voir effets de chargement/sauvegarde ci-dessous).
  // L'ancien hook useSupabaseSync (écritures normalisées + realtime) a été retiré : il dupliquait la
  // donnée dans des tables jamais relues et corrompait l'état via le realtime.

  // #55 — Persistance par tenant via un instantané JSON (table inventory_state).
  // Le tenant provient du 1er segment d'URL (cohérent avec importFromCatalogue).
  const tenantId = (typeof window !== 'undefined' ? (window.location.pathname.split('/').filter(Boolean)[0] || '') : ''); // ISOLATION : jamais 'cerdia' par defaut
  const initialLoadDone = useRef(false);   // n'enregistre PAS dans le nuage tant que le chargement initial n'est pas fini
  const cloudSaveTimer = useRef(null);
  const cloudLoadOk = useRef(false);       // le chargement nuage a-t-il REUSSI ? (sinon on n'ecrase PAS le nuage)
  const cloudItemCount = useRef(0);        // nb d'articles charges depuis le nuage (anti-ecrasement par un etat vide)
  // Verrou d'édition : id de l'article en cours d'édition (ou '__new__') tant que la modale est ouverte.
  // Empêche le temps réel d'écraser l'article édité et l'effet de reset du formulaire (bug « les champs sautent »).
  const editingLockRef = useRef(null);

  // États principaux - DOIVENT être appelés avant tout return
  const [view, setView] = useState('dashboard'); // atterrit sur le tableau de bord
  const [navMenuOpen, setNavMenuOpen] = useState(false); // Menu de navigation mobile (déroulant, façon autres modules)
  const [saveError, setSaveError] = useState(null); // Erreur de sauvegarde cloud remontée à l'écran (fini les échecs silencieux)
  // Feedback non bloquant (toasts) + confirmation in-app (window.confirm est inopérant en PWA installée).
  const [toasts, setToasts] = useState([]);
  const notify = (message, type = 'success') => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 4200);
  };
  const [confirmState, setConfirmState] = useState(null);
  const askConfirm = (opts) => setConfirmState(opts); // { message, title?, confirmLabel?, danger?, onConfirm }
  const [isLoading, setIsLoading] = useState(true); // 1er chargement des données (spinner au lieu d'un flash vide)
  const [companyLogo, setCompanyLogo] = useState('/c-secur360-logo.png'); // Logo tenant (repli marque) pour la carte QR
  useEffect(() => {
    let active = true;
    (async () => { try { const { data } = await supabase.from('company_settings').select('logo_url').eq('tenant_id', tenantId).maybeSingle(); if (active && data?.logo_url) setCompanyLogo(data.logo_url); } catch { /* défaut */ } })();
    return () => { active = false; };
  }, [tenantId]);

  // Solde du FORFAIT IA (compteur dashboard). Rafraîchi après chaque mise à jour de prix IA.
  const [aiBudget, setAiBudget] = useState(null);
  const refreshAiBudget = async () => {
    try { const r = await fetch(`/api/inventory/ai-budget?tenant=${encodeURIComponent(tenantId)}`); if (r.ok) setAiBudget(await r.json()); } catch { /* ignore */ }
  };
  useEffect(() => { refreshAiBudget(); }, [tenantId]); // eslint-disable-line react-hooks/exhaustive-deps
  // Utilisateur CONNECTÉ À L'APP (hôte) -> sert d'identité par défaut pour les mouvements du scanner
  // (au lieu des comptes démo internes admin/gestionnaire). Récupéré via /api/auth/me.
  const [hostUserName, setHostUserName] = useState('');
  useEffect(() => {
    let active = true;
    (async () => { try { const r = await fetch('/api/auth/me'); const j = await r.json(); if (active && j?.user?.name) setHostUserName(j.user.name); } catch { /* non connecté / hors ligne */ } })();
    return () => { active = false; };
  }, []);
  const [activeAdminTab, setActiveAdminTab] = useState('departments'); // Onglet actif dans Admin
  const [activeDepartmentTab, setActiveDepartmentTab] = useState('general'); // Onglet actif dans Département
  const [items, setItems] = useState([]);
  const [movements, setMovements] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [storageUnits, setStorageUnits] = useState([]);
  // Raison OBLIGATOIRE des mouvements : projet (avec n° soumission), ou code interne défini en admin.
  const [reasonCodes, setReasonCodes] = useState([]); // [{ id, code, label }] (snapshot inventory_state)
  const [projectsList, setProjectsList] = useState([]); // projets du tenant (projet/soumission) pour la raison
  const [defaultMargin, setDefaultMargin] = useState(0);
  const [baseEbitda, setBaseEbitda] = useState(20);
  const [targetEbitda, setTargetEbitda] = useState(35);
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [filters, setFilters] = useState({
    category: '',
    department: '',
    status: '',
    location: ''
  });

  // État du Mode Inventaire Global (par département)
  const [globalInventoryMode, setGlobalInventoryMode] = useState(() => {
    const saved = localStorage.getItem(invKey('c-secur360-global-inventory-mode'));
    return saved ? JSON.parse(saved) : {
      active: false,
      departmentId: null,
      departmentName: null,
      startedBy: null,
      startedByName: null,
      startDate: null,
      scans: [] // { itemId, itemName, countedQty, systemQty, difference, userId, userName, timestamp }
    };
  });

  // États UI
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    typeof window !== 'undefined' && window.innerWidth < 1024
  );
  const [editingItem, setEditingItem] = useState(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [dashboardDepartment, setDashboardDepartment] = useState('all');
  const [dashboardFilters, setDashboardFilters] = useState({
    category: '',
    subcategory: '',
    department: '',
    status: '',
    location: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showDashboardFilters, setShowDashboardFilters] = useState(false);

  // États pour vues articles et impression
  const [articleViewMode, setArticleViewMode] = useState('list'); // 'list' (tableau, défaut) | 'grid' (cartes) | 'detailed'
  const [selectedItems, setSelectedItems] = useState([]);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printMode, setPrintMode] = useState('single'); // 'single', 'batch'
  // Assistant Prix IA (recherche web du prix coutant a jour) — onglet Articles.
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceProgress, setPriceProgress] = useState(null); // {done,total} lots (grandes listes)
  const [priceRows, setPriceRows] = useState([]); // [{id,code,name,supplierCost,webPrice,source,confidence,note,apply}]
  const [itemToPrint, setItemToPrint] = useState(null);
  const [labelFormat, setLabelFormat] = useState('avery35520'); // Format d'étiquette sélectionné
  const [bulkPrintByLocation, setBulkPrintByLocation] = useState(false); // Impression en volume par emplacement
  const [selectedLocation, setSelectedLocation] = useState(''); // Emplacement sélectionné pour impression en volume
  const [startingPosition, setStartingPosition] = useState(1); // Position de départ sur feuille partiellement utilisée
  const [labelCopies, setLabelCopies] = useState(1); // #83 copies par article pour l'export PDF
  const [labelSkip, setLabelSkip] = useState(() => new Set()); // #83 cases déjà utilisées (page 1) à sauter
  const [pdfBusy, setPdfBusy] = useState(false);
  const printRef = useRef();

  // États pour le scanner
  const [selectedItem, setSelectedItem] = useState(null);
  const [showScannedModal, setShowScannedModal] = useState(false);

  // États pour l'import Excel
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importData, setImportData] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [importStep, setImportStep] = useState('upload'); // 'upload', 'preview', 'complete'
  const fileInputRef = useRef(null);
  const aiFileInputRef = useRef(null);     // input pour l'import IA (colonnes libres)
  const [aiImporting, setAiImporting] = useState(false); // spinner pendant l'analyse IA
  const [aiProgress, setAiProgress] = useState(null);    // {done,total} progression des lots (gros fichiers)
  const aiAbortRef = useRef(null);         // AbortController pour ANNULER l'import IA en cours
  const [aiRefusal, setAiRefusal] = useState(null); // {missing:[...]} quand la feuille n'est PAS conforme

  // Annule l'import IA en cours (interrompt les lots restants).
  const cancelAiImport = () => { try { aiAbortRef.current?.abort(); } catch { /* ignore */ } };

  // États pour le partage de produits
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedItemForShare, setSelectedItemForShare] = useState(null);

  // États pour la visualisation de produit
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItemForView, setSelectedItemForView] = useState(null);

  // États pour le formulaire d'ajout d'article
  const [addItemMode, setAddItemMode] = useState('simple'); // 'simple' ou 'excel'
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [newItemData, setNewItemData] = useState({
    code: '',
    name: '',
    category: '',
    department: '',
    location: '',
    quantity: 0,
    minQuantity: 0,
    maxQuantity: 0,
    costPrice: 0,
    salePrice: 0,
    baseEbitda: baseEbitda,
    targetEbitda: targetEbitda,
    unit: '',
    description: '',
    supplier: '',
    supplierEmail: '',
    articleType: 'sale',
    differentCodes: false,
    locations: [],
    // Champs avancés
    photos: [],
    colors: [],
    dimensions: { length: '', width: '', height: '', unit: 'cm' },
    weight: { value: '', unit: 'kg' },
    serialNumber: '',
    model: '',
    brand: '',
    condition: 'new', // 'new', 'used', 'refurbished'
    warranty: '',
    rentalPrice: 0,
    rentalPeriod: 'day' // 'day', 'week', 'month'
  });
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Handler pour les changements dans le formulaire d'ajout
  const handleNewItemChange = useCallback((field, value) => {
    setNewItemData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Mise à jour d'un champ d'un emplacement (par département) de façon FONCTIONNELLE (depuis prev),
  // pour éviter toute course/perte de saisie sur Quantité/Min/Max/Code/Emplacement.
  const handleLocationFieldChange = useCallback((deptName, field, value) => {
    setNewItemData(prev => ({
      ...prev,
      locations: (prev.locations || []).map(loc => (loc.department === deptName ? { ...loc, [field]: value } : loc)),
    }));
  }, []);

  // Gestion des photos
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        notify(language === 'fr' ? 'Veuillez sélectionner uniquement des images' : 'Please select images only', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItemData(prev => ({
          ...prev,
          photos: [...prev.photos, { url: reader.result, name: file.name }]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setNewItemData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
    if (currentPhotoIndex >= newItemData.photos.length - 1) {
      setCurrentPhotoIndex(Math.max(0, newItemData.photos.length - 2));
    }
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % newItemData.photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + newItemData.photos.length) % newItemData.photos.length);
  };

  const addColor = (color) => {
    if (color && !newItemData.colors.includes(color)) {
      setNewItemData(prev => ({
        ...prev,
        colors: [...prev.colors, color]
      }));
    }
  };

  const removeColor = (color) => {
    setNewItemData(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c !== color)
    }));
  };

  // ============== INITIALISATION DES DONNÉES (#55 persistance par tenant) ==============
  useEffect(() => {
    let alive = true;
    const fromLocal = () => {
      // Repli local (cache navigateur) ou valeurs par défaut.
      const savedItems = localStorage.getItem(invKey('c-secur360-inventory-items'));
      const savedMovements = localStorage.getItem(invKey('c-secur360-inventory-movements'));
      const savedDepartments = localStorage.getItem(invKey('c-secur360-inventory-departments'));
      const savedCategories = localStorage.getItem(invKey('c-secur360-inventory-categories'));
      const savedStorageUnits = localStorage.getItem(invKey('c-secur360-storage-units'));
      const savedBaseEbitda = localStorage.getItem(invKey('app-baseEbitda'));
      const savedTargetEbitda = localStorage.getItem(invKey('app-targetEbitda'));
      if (savedItems) setItems(JSON.parse(savedItems)); else setItems(getDefaultItems());
      if (savedMovements) setMovements(JSON.parse(savedMovements));
      // Departements : source UNIQUE = Administration (planner_succursales, effet dedie). On ne
      // charge PAS depuis le cache local (qui peut contenir d'anciens defauts) -> on part vide et
      // l'effet admin remplit. (savedDepartments volontairement ignore.)
      setDepartments([]);
      // Categories : plus de defauts re-semes (la suppression doit etre definitive).
      if (savedCategories) setCategories(JSON.parse(savedCategories)); else setCategories([]);
      if (savedStorageUnits) setStorageUnits(JSON.parse(savedStorageUnits));
      if (savedBaseEbitda) setBaseEbitda(parseFloat(savedBaseEbitda));
      if (savedTargetEbitda) setTargetEbitda(parseFloat(savedTargetEbitda));
    };

    const initializeData = async () => {
      // 1) Instantané nuage par tenant (source de vérité, multi-appareils).
      try {
        const { data, error } = await supabase.from('inventory_state').select('data').eq('tenant_id', tenantId).maybeSingle();
        if (!alive) return;
        if (!error && data && data.data) {
          const s = data.data || {};
          if (Array.isArray(s.items)) setItems(s.items);
          if (Array.isArray(s.movements)) setMovements(s.movements);
          // DÉPARTEMENTS : PLUS chargés depuis inventory_state (source unique = Administration /
          // planner_succursales, voir l'effet dédié). Évite que d'anciens défauts persistés dans le
          // snapshot nuage (Succursale A/B/Entrepôt) ne ressuscitent. (Isolation multi-tenant assurée
          // par le filtre tenant_id côté admin.)
          // CATEGORIES : plus de re-semis de defauts (sinon les categories supprimees ressuscitent,
          // comme les succursales avant). On charge ce qui est dans le nuage, meme vide.
          if (Array.isArray(s.categories)) setCategories(s.categories);
          if (Array.isArray(s.storageUnits)) setStorageUnits(s.storageUnits);
          if (Array.isArray(s.reasonCodes)) setReasonCodes(s.reasonCodes);
          if (s.baseEbitda != null) setBaseEbitda(Number(s.baseEbitda));
          if (s.targetEbitda != null) setTargetEbitda(Number(s.targetEbitda));
          // Miroir local
          try {
            localStorage.setItem(invKey('c-secur360-inventory-items'), JSON.stringify(s.items || []));
            localStorage.setItem(invKey('c-secur360-inventory-movements'), JSON.stringify(s.movements || []));
            localStorage.setItem(invKey('c-secur360-inventory-departments'), JSON.stringify(s.departments || []));
            localStorage.setItem(invKey('c-secur360-inventory-categories'), JSON.stringify(s.categories || []));
            localStorage.setItem(invKey('c-secur360-storage-units'), JSON.stringify(s.storageUnits || []));
          } catch { /* quota */ }
          console.log('✅ Inventaire chargé depuis inventory_state (tenant ' + tenantId + ')');
          cloudLoadOk.current = true;                                    // chargement nuage REUSSI -> on peut ecrire
          cloudItemCount.current = Array.isArray(s.items) ? s.items.length : 0;
          initialLoadDone.current = true;
          if (alive) setIsLoading(false);
          return;
        }
        // Aucune ligne nuage (PAS d'erreur) : tenant neuf -> on pourra creer la 1ere ligne.
        console.log('ℹ️ Aucun instantané nuage pour ' + tenantId + ' — bascule sur le cache local.');
        cloudLoadOk.current = true; cloudItemCount.current = 0;
      } catch (e) {
        // ERREUR de chargement nuage -> on NE marque PAS cloudLoadOk : l'autosave restera en LECTURE
        // SEULE pour ce chargement, afin de NE PAS ECRASER le nuage avec un etat local vide/perimé.
        console.warn('⚠️ inventory_state indisponible (lecture seule, pas d\'écrasement):', e?.message || e);
      }
      if (!alive) return;
      fromLocal();
      initialLoadDone.current = true;
      if (alive) setIsLoading(false);
    };

    initializeData();
    return () => { alive = false; };
  }, [tenantId]);

  // SOURCE DES DÉPARTEMENTS = ADMINISTRATION (planner_succursales). On charge la hiérarchie
  // Site → Département de l'admin et on en fait la liste `departments` de l'inventaire (sites ET
  // départements). Plus de liste locale modifiable ni de défauts : c'est géré dans l'Administration
  // principale. Si l'admin est indisponible (RLS/offline), on garde ce qui est déjà chargé.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('planner_succursales').select('id,name,code,parent_id').eq('tenant_id', tenantId).order('name');
        if (!alive || error || !Array.isArray(data)) return;
        const byId = new Map(data.map(r => [r.id, r]));
        const sites = data.filter(r => !r.parent_id);
        const depts = data.filter(r => r.parent_id);
        const sitesWithChildren = new Set(depts.map(d => d.parent_id));
        // Une carte = un DÉPARTEMENT (niveau où vivent articles/emplacements), avec son site en
        // contexte. Un site SANS département devient sa propre carte (sinon il serait inutilisable).
        // -> on respecte la hiérarchie Site → Département (plus de doublon site+département).
        const mapped = [
          ...depts.map(r => ({
            id: 'adm-' + r.id, adminId: r.id, name: r.name, code: r.code || '',
            isSite: false, siteName: byId.get(r.parent_id)?.name || '', siteId: r.parent_id,
            locations: [], fromAdmin: true,
          })),
          ...sites.filter(s => !sitesWithChildren.has(s.id)).map(r => ({
            id: 'adm-' + r.id, adminId: r.id, name: r.name, code: r.code || '',
            isSite: true, siteName: r.name, siteId: r.id,
            locations: [], fromAdmin: true,
          })),
        ];
        // L'admin a repondu (succes) : il est la SOURCE -> on remplace, meme si vide (cela efface
        // les anciens defauts locaux Succursale A/B/Entrepot). En cas d'ERREUR reseau, on a deja
        // fait `return` plus haut -> on garde l'existant.
        setDepartments(mapped);
        saveLS(invKey('c-secur360-inventory-departments'), mapped);
      } catch { /* admin indisponible -> on garde l'existant */ }
    })();
    return () => { alive = false; };
  }, [tenantId]);

  // Sauvegarder automatiquement - TOUJOURS sauvegarder, même si vide
  useEffect(() => {
    localStorage.setItem(invKey('c-secur360-inventory-items'), JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(invKey('c-secur360-inventory-movements'), JSON.stringify(movements));
  }, [movements]);

  useEffect(() => {
    localStorage.setItem(invKey('c-secur360-inventory-departments'), JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem(invKey('c-secur360-inventory-categories'), JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(invKey('c-secur360-storage-units'), JSON.stringify(storageUnits));
  }, [storageUnits]);

  useEffect(() => {
    localStorage.setItem(invKey('c-secur360-global-inventory-mode'), JSON.stringify(globalInventoryMode));
  }, [globalInventoryMode]);

  // #55 — Enregistrement nuage débounced par tenant (instantané JSON). Persiste réellement
  // l'inventaire (multi-appareils). N'écrit PAS tant que le chargement initial n'est pas terminé
  // (sinon on écraserait le nuage avec l'état vide initial).
  useEffect(() => {
    if (!initialLoadDone.current) return;
    // GARDE 1 — LECTURE SEULE si le chargement nuage a ECHOUE : ne jamais ecraser le nuage avec un
    // etat local (potentiellement vide/perimé) si on n'a pas pu lire le nuage au depart.
    if (!cloudLoadOk.current) return;
    // GARDE 2 — ANTI-ECRASEMENT : ne JAMAIS remplacer un inventaire nuage PLEIN par un etat VIDE
    // (cause de la perte des 925 articles). Une vidange totale doit etre faite sciemment, pas via
    // l'autosave silencieux.
    if ((items?.length || 0) === 0 && cloudItemCount.current > 0) {
      console.warn('🛑 Autosave ignoré : refus d\'écraser ' + cloudItemCount.current + ' article(s) nuage par un état vide.');
      setSaveError(language === 'fr'
        ? `🛡️ Sauvegarde bloquée (anti-perte) : inventaire vide non enregistré (le nuage garde ${cloudItemCount.current} articles). Recharge la page.`
        : `Save blocked (anti-loss): empty inventory not saved (cloud keeps ${cloudItemCount.current}).`);
      return;
    }
    if (cloudSaveTimer.current) clearTimeout(cloudSaveTimer.current);
    cloudSaveTimer.current = setTimeout(async () => {
      try {
        const { error } = await supabase.from('inventory_state').upsert({
          tenant_id: tenantId,
          // NB: `departments` n'est PLUS persisté ici — source unique = Administration (planner_succursales).
          data: { items, movements, categories, storageUnits, reasonCodes, baseEbitda, targetEbitda },
          updated_at: new Date().toISOString(),
        }, { onConflict: 'tenant_id' });
        if (error) { console.warn('⚠️ Sauvegarde inventory_state échouée:', error.message); setSaveError(error.message || 'Erreur inconnue'); }
        else { setSaveError(null); cloudItemCount.current = items?.length || 0; } // baseline a jour apres ecriture reussie
      } catch (e) {
        console.warn('⚠️ Sauvegarde inventory_state échouée:', e?.message || e);
        setSaveError(e?.message || String(e));
      }
    }, 800);
    return () => { if (cloudSaveTimer.current) clearTimeout(cloudSaveTimer.current); };
  }, [items, movements, departments, categories, storageUnits, reasonCodes, baseEbitda, targetEbitda, tenantId]);

  // Projets du tenant (numéro + n° soumission) -> proposés comme RAISON de mouvement.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await supabase.from('projects').select('project_number, title, submission_number, status').eq('tenant_id', tenantId).order('project_number', { ascending: false });
        if (alive && Array.isArray(data)) setProjectsList(data.filter(p => p.project_number));
      } catch { /* table absente */ }
    })();
    return () => { alive = false; };
  }, [tenantId]);

  // #58 — Règle globale : toute case éditable s'écrase au clic (sélection du contenu au focus).
  // Permet de remplacer directement un 0/une valeur sans devoir effacer, et facilite la saisie
  // multi-chiffres. S'applique a tous les champs du module inventaire (texte, nombre, numérique).
  useEffect(() => {
    const onFocusIn = (e) => {
      const el = e.target;
      if (!el) return;
      const tag = el.tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA') return;
      const type = (el.getAttribute('type') || 'text').toLowerCase();
      const selectable = tag === 'TEXTAREA' || el.inputMode === 'numeric'
        || ['text', 'number', 'search', 'tel', 'url', 'email'].includes(type);
      if (!selectable) return;
      // Laisser le focus se poser puis sélectionner tout le contenu.
      setTimeout(() => { try { el.select(); } catch { /* certains types ne supportent pas select() */ } }, 0);
    };
    document.addEventListener('focusin', onFocusIn);
    return () => document.removeEventListener('focusin', onFocusIn);
  }, []);

  // Souscriptions temps réel Supabase
  useEffect(() => {
    if (!isAuthenticated) return;

    console.log('🔔 Abonnement aux changements temps réel...');

    // Handler pour les changements d'items
    const handleItemChange = ({ type, item }) => {
      setItems(currentItems => {
        const index = currentItems.findIndex(i => i.id === item.id);

        if (type === 'INSERT') {
          if (index === -1) {
            console.log('✅ Nouvel item reçu:', item.name);
            return [...currentItems, { ...item, locations: item.item_locations || [] }];
          }
          return currentItems;
        } else if (type === 'UPDATE') {
          // Ne pas écraser l'article que l'utilisateur est en train d'éditer (la modale gère sa propre sauvegarde).
          if (editingLockRef.current && item.id === editingLockRef.current) {
            return currentItems;
          }
          if (index !== -1) {
            console.log('✅ Item mis à jour:', item.name);
            const updated = [...currentItems];
            updated[index] = { ...item, locations: item.item_locations || [] };
            return updated;
          }
          return currentItems;
        } else if (type === 'DELETE') {
          if (index !== -1) {
            console.log('✅ Item supprimé:', item.name);
            return currentItems.filter(i => i.id !== item.id);
          }
          return currentItems;
        }
        return currentItems;
      });
    };

    // Handler pour les changements de départements
    const handleDepartmentChange = ({ type, department }) => {
      setDepartments(currentDepts => {
        const index = currentDepts.findIndex(d => d.id === department.id);

        if (type === 'INSERT') {
          if (index === -1) {
            console.log('✅ Nouveau département reçu:', department.name);
            return [...currentDepts, department];
          }
          return currentDepts;
        } else if (type === 'UPDATE') {
          if (index !== -1) {
            console.log('✅ Département mis à jour:', department.name);
            const updated = [...currentDepts];
            updated[index] = department;
            return updated;
          }
          return currentDepts;
        } else if (type === 'DELETE') {
          if (index !== -1) {
            console.log('✅ Département supprimé:', department.name);
            return currentDepts.filter(d => d.id !== department.id);
          }
          return currentDepts;
        }
        return currentDepts;
      });
    };

    // Handler pour les changements de catégories
    const handleCategoryChange = ({ type, category }) => {
      setCategories(currentCats => {
        const index = currentCats.findIndex(c => c.id === category.id);

        if (type === 'INSERT') {
          if (index === -1) {
            console.log('✅ Nouvelle catégorie reçue:', category.name);
            return [...currentCats, category];
          }
          return currentCats;
        } else if (type === 'UPDATE') {
          if (index !== -1) {
            console.log('✅ Catégorie mise à jour:', category.name);
            const updated = [...currentCats];
            updated[index] = category;
            return updated;
          }
          return currentCats;
        } else if (type === 'DELETE') {
          if (index !== -1) {
            console.log('✅ Catégorie supprimée:', category.name);
            return currentCats.filter(c => c.id !== category.id);
          }
          return currentCats;
        }
        return currentCats;
      });
    };

    // Realtime DÉSACTIVÉ sur les tables normalisées (items/departments/categories) : ces lignes
    // (snake_case, sans filtre tenant) étaient fusionnées dans le modèle local camelCase, corrompant
    // l'état avant réécriture dans le snapshot. La source unique est désormais inventory_state ; la
    // synchro multi-appareil se fait au rechargement. Handlers conservés mais inactifs (réf. void pour le lint).
    void handleItemChange; void handleDepartmentChange; void handleCategoryChange;
    return undefined;
  }, [isAuthenticated]);

  // Verrou pendant que la modale d'ajout/édition est ouverte (anti-écrasement temps réel/reset).
  useEffect(() => {
    editingLockRef.current = showItemForm ? (editingItem?.id || '__new__') : null;
  }, [showItemForm, editingItem?.id]);

  // Charger les données de l'article en cours d'édition.
  // Dépend UNIQUEMENT de editingItem?.id : ne PAS se relancer si baseEbitda/targetEbitda ou
  // l'identité de l'objet editingItem changent pendant la saisie (sinon le formulaire se réinitialise).
  useEffect(() => {
    if (editingItem) {
      setNewItemData({
        code: editingItem.code || '',
        name: editingItem.name || '',
        category: editingItem.category || '',
        department: editingItem.department || '',
        location: editingItem.location || '',
        quantity: editingItem.quantity || 0,
        minQuantity: editingItem.minQuantity || 0,
        maxQuantity: editingItem.maxQuantity || 0,
        costPrice: editingItem.costPrice || 0,
        salePrice: editingItem.salePrice || 0,
        baseEbitda: editingItem.baseEbitda !== undefined ? editingItem.baseEbitda : baseEbitda,
        targetEbitda: editingItem.targetEbitda !== undefined ? editingItem.targetEbitda : targetEbitda,
        unit: editingItem.unit || '',
        description: editingItem.description || '',
        supplier: editingItem.supplier || '',
        supplierEmail: editingItem.supplierEmail || '',
        articleType: editingItem.articleType || 'sale',
        differentCodes: editingItem.differentCodes || false,
        locations: editingItem.locations || [],
        photos: editingItem.photos || [],
        colors: editingItem.colors || [],
        dimensions: editingItem.dimensions || { length: '', width: '', height: '', unit: 'cm' },
        weight: editingItem.weight || { value: '', unit: 'kg' },
        serialNumber: editingItem.serialNumber || '',
        model: editingItem.model || '',
        brand: editingItem.brand || '',
        condition: editingItem.condition || 'new',
        priceUpdateInterval: editingItem.priceUpdateInterval || '3',
        customPriceInterval: editingItem.customPriceInterval || 0,
        storageLocation: editingItem.storageLocation || null
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingItem?.id]);

  // Mettre à jour dynamiquement la couleur de la barre d'état PWA
  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', '#334155'); // slate-700
    }
  }, []);

  // ============== FILTRAGE ET TRI - DOIVENT être avant les returns ==============
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const q = deferredSearchTerm.toLowerCase();
      const matchesSearch = !deferredSearchTerm ||
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        // Recherche par SUCCURSALE / DÉPARTEMENT / EMPLACEMENT (mono ou multi-emplacement) :
        // permet de retrouver facilement où un article est en stock.
        (item.department && item.department.toLowerCase().includes(q)) ||
        (item.location && item.location.toLowerCase().includes(q)) ||
        (item.locations && item.locations.some(loc =>
          (loc.department && loc.department.toLowerCase().includes(q)) ||
          (loc.location && loc.location.toLowerCase().includes(q))));

      const activeCategory = dashboardFilters.category || filters.category;
      const activeSubcategory = dashboardFilters.subcategory || filters.subcategory;
      const activeDepartment = dashboardFilters.department || filters.department;
      const activeStatus = dashboardFilters.status || filters.status;
      const activeLocation = dashboardFilters.location || filters.location;

      const matchesCategory = !activeCategory || item.category === activeCategory;
      const matchesSubcategory = !activeSubcategory || item.subcategory === activeSubcategory;
      const matchesDepartment = !activeDepartment ||
        item.department === activeDepartment ||
        (item.locations && item.locations.some(loc => loc.department === activeDepartment));

      let matchesStatus = true;
      if (activeStatus) {
        if (activeStatus === 'low') matchesStatus = item.quantity <= item.minQuantity;
        else if (activeStatus === 'optimal') matchesStatus = item.quantity > item.minQuantity && item.quantity <= item.maxQuantity;
        else if (activeStatus === 'surplus') matchesStatus = item.quantity > item.maxQuantity;
      }

      // Filtre par EMPLACEMENT (unité de stockage de l'admin, ex. « A », « CITERNE », « G-H ») :
      // l'adresse d'un article est « EMPLACEMENT-TABLETTE-POSITION », donc on matche l'emplacement
      // exact OU comme préfixe de l'adresse. Couvre aussi les articles multi-emplacement.
      const locMatch = (loc) => { const s = String(loc || ''); return s === activeLocation || s.startsWith(activeLocation + '-'); };
      const matchesLocation = !activeLocation || locMatch(item.location) || (Array.isArray(item.locations) && item.locations.some(l => locMatch(l.location)));

      return matchesSearch && matchesCategory && matchesSubcategory && matchesDepartment && matchesStatus && matchesLocation;
    });
  }, [items, deferredSearchTerm, filters, dashboardFilters]);

  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [filteredItems, sortConfig]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedItems.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedItems, currentPage]);

  const stats = useMemo(() => {
    const total = items.length;
    const lowStock = items.filter(item => item.quantity <= item.minQuantity).length;
    const overStock = items.filter(item => item.quantity > item.maxQuantity).length;
    const optimal = items.filter(item => item.quantity > item.minQuantity && item.quantity <= item.maxQuantity).length;

    const totalCostValue = items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
    const totalSellValue = items.reduce((sum, item) => sum + (item.salePrice * item.quantity), 0);
    const margin = totalSellValue - totalCostValue;
    const marginPercent = totalCostValue > 0 ? ((margin / totalCostValue) * 100) : 0;

    return { total, lowStock, overStock, optimal, totalCostValue, totalSellValue, margin, marginPercent };
  }, [items]);

  // ============== ANALYTIQUE (réappro, ABC, stock dormant/rotation, comptage cyclique) ==============
  // Tout est DÉRIVÉ (aucune donnée stockée en plus, sauf item.lastCountedAt posé au comptage).
  // Bonnes pratiques : méthode Min/Max (PAR) pour le réappro ; ABC par valeur (80/15/5) ;
  // fréquence de comptage selon la classe ABC (A hebdo, B mensuel, C trimestriel).
  const DEAD_STOCK_DAYS = 90; // sans sortie depuis 90 j = dormant
  const inventoryAnalytics = useMemo(() => {
    const now = Date.now();
    const DAY = 86400000;

    // Valeur de stock par article + total (base de l'ABC).
    const valueOf = (it) => (Number(it.costPrice) || 0) * (Number(it.quantity) || 0);
    const totalValue = items.reduce((s, it) => s + valueOf(it), 0);
    const abc = new Map();
    let cum = 0;
    [...items].sort((a, b) => valueOf(b) - valueOf(a)).forEach(it => {
      cum += valueOf(it);
      const pct = totalValue > 0 ? cum / totalValue : 1;
      abc.set(it.id, pct <= 0.8 ? 'A' : pct <= 0.95 ? 'B' : 'C');
    });

    // Dernière SORTIE par article + quantité sortie sur 365 j (rotation).
    const lastExit = new Map();
    const exitQty365 = new Map();
    movements.forEach(m => {
      if (m.type !== 'exit') return;
      const ts = new Date(m.timestamp || m.date).getTime();
      if (isNaN(ts)) return;
      if (!lastExit.has(m.itemId) || ts > lastExit.get(m.itemId)) lastExit.set(m.itemId, ts);
      if (now - ts <= 365 * DAY) exitQty365.set(m.itemId, (exitQty365.get(m.itemId) || 0) + (Number(m.quantity) || 0));
    });

    // RÉAPPRO (par emplacement) : qté ≤ min -> à commander, suggestion = cible(max) − qté.
    const reorder = [];
    items.forEach(it => {
      const locs = (it.isMultiLocation && Array.isArray(it.locations) && it.locations.length)
        ? it.locations
        : [{ department: it.department, location: it.location, quantity: it.quantity, minQuantity: it.minQuantity, maxQuantity: it.maxQuantity }];
      locs.forEach(loc => {
        const qty = Number(loc.quantity) || 0;
        const mn = loc.minQuantity != null ? Number(loc.minQuantity) : (Number(it.minQuantity) || 0);
        const mx = loc.maxQuantity != null ? Number(loc.maxQuantity) : (Number(it.maxQuantity) || 0);
        if (mn > 0 && qty <= mn) {
          const target = mx > mn ? mx : mn;
          reorder.push({ id: it.id, code: it.code, name: it.name, abc: abc.get(it.id), department: loc.department || '—', qty, min: mn, max: mx, suggested: Math.max(1, target - qty), unit: it.unit || '' });
        }
      });
    });
    reorder.sort((a, b) => (a.qty / Math.max(1, a.min)) - (b.qty / Math.max(1, b.min)));

    // STOCK DORMANT + ROTATION.
    const dead = [];
    const turnover = [];
    items.forEach(it => {
      const le = lastExit.get(it.id) || null;
      const qty = Number(it.quantity) || 0;
      const value = valueOf(it);
      if (qty > 0 && (le == null || (now - le) > DEAD_STOCK_DAYS * DAY)) {
        dead.push({ id: it.id, code: it.code, name: it.name, qty, unit: it.unit || '', value, daysSince: le ? Math.floor((now - le) / DAY) : null });
      }
      const exited = exitQty365.get(it.id) || 0;
      turnover.push({ id: it.id, code: it.code, name: it.name, abc: abc.get(it.id), exited, qty, turns: qty > 0 ? exited / qty : 0 });
    });
    dead.sort((a, b) => b.value - a.value);
    turnover.sort((a, b) => b.turns - a.turns);

    // COMPTAGE CYCLIQUE : fréquence selon ABC, dû si jamais compté ou délai dépassé.
    const freqDays = { A: 7, B: 30, C: 90 };
    const cycleDue = [];
    items.forEach(it => {
      const cls = abc.get(it.id) || 'C';
      const fd = freqDays[cls];
      const last = it.lastCountedAt ? new Date(it.lastCountedAt).getTime() : null;
      if (last == null || (now - last) >= fd * DAY) {
        cycleDue.push({ id: it.id, code: it.code, name: it.name, abc: cls, freqDays: fd, lastCountedAt: it.lastCountedAt || null, daysSince: last ? Math.floor((now - last) / DAY) : null });
      }
    });
    cycleDue.sort((a, b) => a.abc.localeCompare(b.abc) || (b.daysSince || 9999) - (a.daysSince || 9999));

    const abcCounts = { A: 0, B: 0, C: 0 };
    abc.forEach(v => { abcCounts[v]++; });

    return { totalValue, abc, abcCounts, reorder, dead, turnover, cycleDue, deadDays: DEAD_STOCK_DAYS };
  }, [items, movements]);

  const dashboardStats = useMemo(() => {
    const filteredItems = items.filter(item => {
      if (dashboardFilters.category && item.category !== dashboardFilters.category) return false;

      if (dashboardFilters.department) {
        const matchesDept = item.department === dashboardFilters.department ||
          (item.locations && item.locations.some(loc => loc.department === dashboardFilters.department));
        if (!matchesDept) return false;
      }

      if (dashboardFilters.status) {
        if (dashboardFilters.status === 'low' && item.quantity > item.minQuantity) return false;
        if (dashboardFilters.status === 'optimal' && (item.quantity <= item.minQuantity || item.quantity > item.maxQuantity)) return false;
        if (dashboardFilters.status === 'surplus' && item.quantity <= item.maxQuantity) return false;
      }

      if (dashboardFilters.location && item.location !== dashboardFilters.location) return false;

      return true;
    });

    const total = filteredItems.length;
    const lowStock = filteredItems.filter(item => item.quantity <= item.minQuantity).length;
    const overStock = filteredItems.filter(item => item.quantity > item.maxQuantity).length;
    const optimal = filteredItems.filter(item => item.quantity > item.minQuantity && item.quantity <= item.maxQuantity).length;

    const totalCostValue = filteredItems.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
    const totalSellValue = filteredItems.reduce((sum, item) => sum + (item.salePrice * item.quantity), 0);
    const margin = totalSellValue - totalCostValue;
    const marginPercent = totalCostValue > 0 ? ((margin / totalCostValue) * 100) : 0;

    return { total, lowStock, overStock, optimal, totalCostValue, totalSellValue, margin, marginPercent };
  }, [items, dashboardFilters]);

  // Vérifier si on est sur la page de scan
  const isScanPage = window.location.pathname === '/scan' || window.location.search.includes('id=');

  // Si c'est la page de scan, afficher uniquement ScanPage
  if (isScanPage) {
    return <ScanPage />;
  }

  // Si l'utilisateur n'est pas authentifié, afficher l'écran de connexion
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // ============== FONCTIONS DE GESTION ==============
  const addItem = (itemData) => {
    const newItem = {
      id: Date.now().toString(),
      ...itemData,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.username || 'system'
    };
    setItems(prev => [...prev, newItem]);
    addMovement({
      type: 'entry',
      itemId: newItem.id,
      itemName: newItem.name,
      quantity: newItem.quantity,
      reason: 'Initial stock',
      user: currentUser?.username || 'system'
    });

    // Incrémenter les compteurs de racking pour chaque emplacement basé sur racking
    // Plus besoin de gérer les compteurs automatiques
  };

  // Importe les articles depuis le « Catalogue matériel standardisé » (module Soumissions/Admin).
  // Reprend code (sku) / désignation / coûtant / prix de vente. Ignore les codes/noms déjà présents.
  const importFromCatalogue = async () => {
    try {
      const tenant = (typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean)[0] : '') || ''; // ISOLATION : jamais 'cerdia'
      const cats = await getCatalogues(tenant);
      const active = cats.find(c => c.preferred && c.status === 'active') || cats.find(c => c.status === 'active') || cats[0];
      const mats = (active && active.materials) || [];
      if (!mats.length) { notify(language === 'fr' ? 'Aucun matériel dans le catalogue standardisé (créez-le dans Admin > Catalogue de taux).' : 'No material in the standardized catalog (create it in Admin > Rate catalog).', 'error'); return; }
      const existingCodes = new Set(items.map(i => (i.code || '').trim()).filter(Boolean));
      const existingNames = new Set(items.map(i => (i.name || '').trim().toLowerCase()));
      const stamp = Date.now();
      const toAdd = [];
      mats.forEach((m, idx) => {
        const code = (m.sku || '').trim();
        const name = (m.name || '').trim();
        if (!name) return;
        if (code && existingCodes.has(code)) return;
        if (!code && existingNames.has(name.toLowerCase())) return;
        toAdd.push({
          id: `cat_${stamp}_${idx}`,
          code: code || `CAT${String(idx + 1).padStart(4, '0')}`,
          name,
          category: 'Catalogue standardisé',
          subcategory: '',
          department: '',
          location: '',
          quantity: 0, minQuantity: 0, maxQuantity: 0,
          unit: 'unité',
          costPrice: Number(m.cost_price) || 0,
          salePrice: Number(m.sale_price != null ? m.sale_price : m.cost_price) || 0,
          createdAt: new Date().toISOString(),
          createdBy: currentUser?.username || 'catalogue',
        });
      });
      if (!toAdd.length) { notify(language === 'fr' ? 'Tous les articles du catalogue sont déjà dans l’inventaire.' : 'All catalog items are already in the inventory.', 'info'); return; }
      setItems(prev => [...prev, ...toAdd]);
      notify(language === 'fr' ? `${toAdd.length} article(s) importé(s) du catalogue standardisé (quantité à 0 — ajustez le stock).` : `${toAdd.length} item(s) imported from the standardized catalog (quantity 0 — adjust stock).`);
    } catch (e) {
      console.error('Import catalogue:', e);
      notify((language === 'fr' ? 'Import du catalogue impossible : ' : 'Catalog import failed: ') + (e?.message || e), 'error');
    }
  };

  // MAJ fonctionnelle (anti lost-update : on lit `prev`, pas l'`items` capturé). Source unique = snapshot.
  const updateItem = (itemId, updates) => {
    setItems(prev => prev.map(item =>
      item.id === itemId
        ? { ...item, ...updates, updatedAt: new Date().toISOString(), updatedBy: currentUser?.username }
        : item
    ));
  };

  // Suppression EN MASSE des articles sélectionnés (une seule confirmation). Utile pour nettoyer
  // un import raté. Irréversible -> confirmation explicite avec le nombre.
  const deleteSelectedItems = () => {
    const count = selectedItems.length;
    if (!count) return;
    askConfirm({
      message: language === 'fr'
        ? `Supprimer ${count} article(s) sélectionné(s) ? Cette action est irréversible.`
        : `Delete ${count} selected article(s)? This cannot be undone.`,
      confirmLabel: language === 'fr' ? `Supprimer ${count}` : `Delete ${count}`,
      onConfirm: () => {
        const ids = new Set(selectedItems);
        const deleted = items.filter(item => ids.has(item.id));
        setItems(prev => { const next = prev.filter(item => !ids.has(item.id)); saveLS(invKey('c-secur360-inventory-items'), next); return next; });
        // TRACE D'AUDIT : une suppression laisse desormais un mouvement (qui/quand/combien) -> on sait
        // si un inventaire a fondu a cause d'une suppression et par qui.
        addMovement({
          type: 'delete', itemName: language === 'fr' ? `Suppression en masse : ${count} article(s)` : `Bulk delete: ${count} item(s)`,
          quantity: count, reason: (language === 'fr' ? 'Suppression en masse — ' : 'Bulk delete — ') + deleted.slice(0, 30).map(i => `${i.code || ''} ${i.name || ''}`.trim()).join(' · ') + (deleted.length > 30 ? ` … (+${deleted.length - 30})` : ''),
          user: currentUser?.username || hostUserName || 'system',
        });
        setSelectedItems([]);
        notify(language === 'fr' ? `${count} article(s) supprimé(s).` : `${count} article(s) deleted.`);
      },
    });
  };

  // Assistant Prix IA : recherche web du prix coûtant. Accepte une liste de N'IMPORTE quelle taille
  // (toute la liste « d'un coup ») -> découpée en LOTS de 15 (la recherche web se fait par paquets),
  // exécutés en parallèle limité (2). Les résultats remplissent la modale au fur et à mesure.
  // PLAFOND DE COÛT IA (demande Eric) : ~0,04 $/article estimé, max 200 $/an. Suivi par année
  // dans localStorage (par tenant). Sert de garde-fou avant chaque recherche de prix.
  const AI_COST_PER_ARTICLE = 0.04;
  const AI_ANNUAL_CAP = 200;
  const aiSpendKey = () => `cs-inv-aiprice-spend-${tenantId}`;
  const readAiSpend = () => {
    try { const j = JSON.parse(localStorage.getItem(aiSpendKey()) || 'null'); const y = new Date().getFullYear(); return (j && j.year === y) ? j : { year: y, total: 0 }; } catch { return { year: new Date().getFullYear(), total: 0 }; }
  };
  const addAiSpend = (amount) => { try { const s = readAiSpend(); localStorage.setItem(aiSpendKey(), JSON.stringify({ year: s.year, total: Math.round((s.total + amount) * 100) / 100 })); } catch { /* ignore */ } };

  const runPriceAssistant = async (list) => {
    const estimate = list.length * AI_COST_PER_ARTICLE;
    setPriceLoading(true);
    setShowPriceModal(true);
    setPriceRows(list.map(it => ({ id: it.id, code: it.code, name: it.name, supplierCost: Number(it.costPrice) || 0, webPrice: null, source: '', confidence: '', note: '', apply: false })));
    const CHUNK = 15;
    const chunks = [];
    for (let i = 0; i < list.length; i += CHUNK) chunks.push(list.slice(i, i + CHUNK));
    let nextIdx = 0, doneChunks = 0;
    let failed = 0;
    let exhausted = false;
    const worker = async () => {
      while (nextIdx < chunks.length) {
        if (exhausted) return; // forfait IA épuisé -> on arrête tout
        const chunk = chunks[nextIdx++];
        try {
          const resp = await fetch('/api/inventory/price-research', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenant: tenantId, items: chunk.map(it => ({ code: it.code, name: it.name, supplier: it.supplier || '', unit: it.unit || '', currentCost: Number(it.costPrice) || 0 })) }),
          });
          const j = await resp.json();
          if (resp.status === 402 || j.exhausted) { exhausted = true; throw new Error(j.error || 'Forfait IA épuisé'); }
          if (!resp.ok || j.error) throw new Error(j.error || 'Recherche IA échouée');
          const byCode = new Map((j.prices || []).map(p => [String(p.code), p]));
          const ids = new Set(chunk.map(c => c.id));
          setPriceRows(prev => prev.map(r => {
            if (!ids.has(r.id)) return r;
            const p = byCode.get(String(r.code));
            const web = p ? Math.max(0, Number(p.webPrice) || 0) : 0;
            return { ...r, webPrice: web, source: p?.source || '', confidence: p?.confidence || '', note: p?.note || '', apply: web > 0 && web !== r.supplierCost };
          }));
        } catch {
          failed++;
          const ids = new Set(chunk.map(c => c.id));
          setPriceRows(prev => prev.map(r => ids.has(r.id) ? { ...r, webPrice: 0, note: language === 'fr' ? 'recherche échouée' : 'search failed' } : r));
        }
        doneChunks++;
        if (chunks.length > 1) setPriceProgress({ done: doneChunks, total: chunks.length });
      }
    };
    try {
      await Promise.all(Array.from({ length: Math.min(2, chunks.length) }, () => worker()));
      if (exhausted) notify(language === 'fr' ? '⛔ Forfait IA épuisé — renouvelez votre forfait (Administration).' : '⛔ AI plan exhausted — renew your plan.', 'error');
      else if (failed) notify((language === 'fr' ? `${failed} lot(s) en échec — réessaie pour ces articles.` : `${failed} batch(es) failed.`), 'warning');
    } finally {
      // Comptabilise la dépense estimée des lots réellement traités (plafond annuel).
      addAiSpend((doneChunks / Math.max(1, chunks.length)) * estimate);
      refreshAiBudget(); // met à jour le compteur de solde IA du dashboard
      setPriceLoading(false);
      setPriceProgress(null);
    }
  };

  // Point d'entrée : confirme si la liste est grande (coût/temps IA), puis lance.
  const handlePriceAssistant = (targetItems) => {
    const list = Array.isArray(targetItems) ? targetItems.filter(Boolean) : [];
    if (!list.length) { notify(language === 'fr' ? 'Aucun article à mettre à jour.' : 'No item to update.', 'info'); return; }
    const spend = readAiSpend();
    const estimate = list.length * AI_COST_PER_ARTICLE;
    const remaining = Math.max(0, AI_ANNUAL_CAP - spend.total);
    // PLAFOND ANNUEL 200 $ : si l'estimation dépasse le reste, on confirme explicitement (le patron décide).
    if (spend.total + estimate > AI_ANNUAL_CAP) {
      askConfirm({
        title: language === 'fr' ? '⚠️ Plafond IA annuel' : '⚠️ Annual AI cap',
        message: language === 'fr'
          ? `Plafond annuel : ${AI_ANNUAL_CAP} $. Déjà dépensé (estimé) cette année : ${spend.total.toFixed(2)} $ · reste ${remaining.toFixed(2)} $.\nCette recherche (${list.length} articles) est estimée à ~${estimate.toFixed(2)} $ et dépasserait le plafond.\nAstuce : utilise « Périmés >3 mois » pour ne payer que le nécessaire. Lancer quand même ?`
          : `Annual cap: $${AI_ANNUAL_CAP}. Spent (est.) this year: $${spend.total.toFixed(2)} · remaining $${remaining.toFixed(2)}.\nThis search (${list.length} items) ≈ $${estimate.toFixed(2)} would exceed the cap. Run anyway?`,
        confirmLabel: language === 'fr' ? 'Lancer quand même' : 'Run anyway',
        onConfirm: () => runPriceAssistant(list),
      });
      return;
    }
    if (list.length > 30) {
      askConfirm({
        title: language === 'fr' ? 'Mettre à jour toute la liste ?' : 'Update the whole list?',
        message: language === 'fr'
          ? `Recherche web IA pour ${list.length} articles (≈ ${estimate.toFixed(2)} $, plafond annuel ${AI_ANNUAL_CAP} $ — déjà ${spend.total.toFixed(2)} $). Continuer ?`
          : `AI web search for ${list.length} items (≈ $${estimate.toFixed(2)}). Continue?`,
        confirmLabel: language === 'fr' ? 'Lancer' : 'Run',
        danger: false,
        onConfirm: () => runPriceAssistant(list),
      });
      return;
    }
    runPriceAssistant(list);
  };

  // Applique les prix choisis (mode IA/web) -> met a jour costPrice ; le dashboard s'ajuste tout seul.
  const applyPriceUpdates = () => {
    const toApply = priceRows.filter(r => r.apply && Number(r.webPrice) > 0);
    if (!toApply.length) { setShowPriceModal(false); return; }
    toApply.forEach(r => updateItem(r.id, {
      costPrice: Number(r.webPrice),
      salePrice: Math.round(Number(r.webPrice) * (1 + (Number(targetEbitda) || 0) / 100) * 100) / 100,
      lastPriceUpdate: new Date().toISOString(),
    }));
    notify(language === 'fr'
      ? `${toApply.length} prix coûtant mis à jour. Le dashboard s'ajuste automatiquement.`
      : `${toApply.length} cost price(s) updated. Dashboard updates automatically.`);
    setPriceRows([]); // résultats consommés -> la pastille flottante disparaît
    setShowPriceModal(false);
  };

  const deleteItem = (itemId) => {
    askConfirm({ message: t('messages.confirm.delete'), confirmLabel: language === 'fr' ? 'Supprimer' : 'Delete', onConfirm: () => {
      const it = items.find(i => i.id === itemId);
      setItems(prev => prev.filter(item => item.id !== itemId));
      // TRACE D'AUDIT : la suppression laisse un mouvement (qui/quand/quoi).
      if (it) addMovement({ type: 'delete', itemId: it.id, itemName: it.name, quantity: it.quantity || 0, reason: (language === 'fr' ? 'Article supprimé' : 'Item deleted') + ` (${it.code || ''})`, user: currentUser?.username || hostUserName || 'system' });
    } });
  };

  // Gestion des départements (MAJ fonctionnelles ; localStorage calculé depuis prev ; source unique = snapshot)
  const addDepartment = (deptData) => {
    const newDept = { id: Date.now().toString(), ...deptData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    setDepartments(prev => { const next = [...prev, newDept]; saveLS(invKey('c-secur360-departments'), next); return next; });
  };

  const updateDepartment = (deptId, updates) => {
    setDepartments(prev => { const next = prev.map(dept => dept.id === deptId ? { ...dept, ...updates, updated_at: new Date().toISOString() } : dept); saveLS(invKey('c-secur360-departments'), next); return next; });
  };

  const deleteDepartment = (deptId) => {
    askConfirm({ message: t('messages.confirm.delete'), confirmLabel: language === 'fr' ? 'Supprimer' : 'Delete', onConfirm: () => setDepartments(prev => { const next = prev.filter(dept => dept.id !== deptId); saveLS(invKey('c-secur360-departments'), next); return next; }) });
  };

  // Gestion des CODES INTERNES (raisons de mouvement sans projet) — persistés dans le snapshot.
  const addReasonCode = (code, label) => {
    const c = String(code || '').trim().toUpperCase(); if (!c) return;
    setReasonCodes(prev => prev.some(x => x.code === c) ? prev : [...prev, { id: Date.now().toString(36), code: c, label: String(label || '').trim() }]);
  };
  const deleteReasonCode = (id) => setReasonCodes(prev => prev.filter(x => x.id !== id));

  // Gestion des catégories
  const addCategory = (catData) => {
    const newCat = { id: Date.now().toString(), ...catData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    setCategories(prev => { const next = [...prev, newCat]; saveLS(invKey('c-secur360-categories'), next); return next; });
  };

  const updateCategory = (catId, updates) => {
    setCategories(prev => { const next = prev.map(cat => cat.id === catId ? { ...cat, ...updates, updated_at: new Date().toISOString() } : cat); saveLS(invKey('c-secur360-categories'), next); return next; });
  };

  const deleteCategory = (catId) => {
    askConfirm({ message: t('messages.confirm.delete'), confirmLabel: language === 'fr' ? 'Supprimer' : 'Delete', onConfirm: () => setCategories(prev => { const next = prev.filter(cat => cat.id !== catId); saveLS(invKey('c-secur360-categories'), next); return next; }) });
  };

  // Gestion des unités de stockage
  const addStorageUnit = (unitData) => {
    const newUnit = {
      id: Date.now().toString(),
      ...unitData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setStorageUnits([...storageUnits, newUnit]);
    localStorage.setItem(invKey('c-secur360-storage-units'), JSON.stringify([...storageUnits, newUnit]));
  };

  const updateStorageUnit = (unitId, updates) => {
    const updatedUnit = { ...storageUnits.find(u => u.id === unitId), ...updates, updated_at: new Date().toISOString() };
    const updatedUnits = storageUnits.map(unit => unit.id === unitId ? updatedUnit : unit);
    setStorageUnits(updatedUnits);
    localStorage.setItem(invKey('c-secur360-storage-units'), JSON.stringify(updatedUnits));
  };

  const deleteStorageUnit = (unitId) => {
    askConfirm({ message: t('messages.confirm.delete'), confirmLabel: language === 'fr' ? 'Supprimer' : 'Delete', onConfirm: () => setStorageUnits(prev => { const next = prev.filter(unit => unit.id !== unitId); saveLS(invKey('c-secur360-storage-units'), next); return next; }) });
  };

  const updateQuantity = (itemId, quantityChange, type = 'adjustment', reason = '', departmentCode = null, projectCode = null, user = null) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    // Déterminer l'utilisateur qui effectue l'opération
    const operationUser = user || currentUser?.username || 'system';

    // Si multi-location ET departmentCode fourni, mettre à jour la location spécifique
    if (item.isMultiLocation && item.locations && departmentCode) {
      const locationIndex = item.locations.findIndex(loc =>
        loc.departmentCode === departmentCode ||
        loc.department === departments.find(d => d.code === departmentCode)?.name
      );

      if (locationIndex === -1) {
        notify((language === 'fr' ? `Succursale ${departmentCode} introuvable pour cet article` : `Branch ${departmentCode} not found for this item`), 'error');
        return;
      }

      const location = item.locations[locationIndex];
      const newLocationQuantity = location.quantity + quantityChange;

      if (newLocationQuantity < 0) {
        notify(t('messages.error.insufficientStock') + ` (${location.department})`, 'error');
        return;
      }

      // Mettre à jour la location spécifique
      const updatedLocations = [...item.locations];
      updatedLocations[locationIndex] = {
        ...location,
        quantity: newLocationQuantity
      };

      // Recalculer la quantité totale
      const totalQuantity = updatedLocations.reduce((sum, loc) => sum + loc.quantity, 0);

      updateItem(itemId, {
        locations: updatedLocations,
        quantity: totalQuantity
      });

      addMovement({
        type,
        itemId: item.id,
        itemName: item.name,
        department: location.department,
        departmentCode: departmentCode,
        quantity: Math.abs(quantityChange),
        reason,
        projectCode: projectCode,
        user: operationUser
      });

      return { success: true, location: location.department };
    }

    // Sinon, mise à jour globale (comportement original)
    const newQuantity = item.quantity + quantityChange;
    if (newQuantity < 0) {
      notify(t('messages.error.insufficientStock'), 'error');
      return;
    }

    updateItem(itemId, { quantity: newQuantity });
    addMovement({
      type,
      itemId: item.id,
      itemName: item.name,
      quantity: Math.abs(quantityChange),
      reason,
      projectCode: projectCode,
      user: operationUser
    });

    return { success: true };
  };

  // Fonction de transfert entre succursales
  const transferBetweenDepartments = (itemId, quantity, sourceDeptCode, targetDeptCode, reason = '') => {
    const item = items.find(i => i.id === itemId);
    if (!item || !item.isMultiLocation || !item.locations) {
      notify(language === 'fr' ? 'Article introuvable ou ne supporte pas les transferts entre succursales' : 'Item not found or does not support inter-branch transfers', 'error');
      return { success: false };
    }

    // Trouver les locations source et cible
    const sourceIndex = item.locations.findIndex(loc =>
      loc.departmentCode === sourceDeptCode ||
      loc.department === departments.find(d => d.code === sourceDeptCode)?.name
    );

    const targetIndex = item.locations.findIndex(loc =>
      loc.departmentCode === targetDeptCode ||
      loc.department === departments.find(d => d.code === targetDeptCode)?.name
    );

    if (sourceIndex === -1 || targetIndex === -1) {
      notify(language === 'fr' ? 'Succursale source ou destination introuvable' : 'Source or destination branch not found', 'error');
      return { success: false };
    }

    const sourceLocation = item.locations[sourceIndex];
    const targetLocation = item.locations[targetIndex];

    // Vérifier stock disponible à la source
    if (sourceLocation.quantity < quantity) {
      notify(language === 'fr' ? `Stock insuffisant dans ${sourceLocation.department} (disponible : ${sourceLocation.quantity})` : `Insufficient stock in ${sourceLocation.department} (available: ${sourceLocation.quantity})`, 'error');
      return { success: false };
    }

    // Mettre à jour les quantités
    const updatedLocations = [...item.locations];
    updatedLocations[sourceIndex] = {
      ...sourceLocation,
      quantity: sourceLocation.quantity - quantity
    };
    updatedLocations[targetIndex] = {
      ...targetLocation,
      quantity: targetLocation.quantity + quantity
    };

    // Recalculer la quantité totale (devrait rester la même)
    const totalQuantity = updatedLocations.reduce((sum, loc) => sum + loc.quantity, 0);

    updateItem(itemId, {
      locations: updatedLocations,
      quantity: totalQuantity
    });

    // Enregistrer le mouvement de transfert
    addMovement({
      type: 'transfer',
      itemId: item.id,
      itemName: item.name,
      quantity: quantity,
      sourceDepartment: sourceLocation.department,
      sourceDepartmentCode: sourceDeptCode,
      targetDepartment: targetLocation.department,
      targetDepartmentCode: targetDeptCode,
      reason,
      user: currentUser?.username || 'system'
    });

    // Retourner les informations pour l'alerte de ré-étiquetage
    return {
      success: true,
      needsRelabeling: true,
      sourceLocation: sourceLocation.department,
      targetLocation: targetLocation.department,
      newQRCode: `${item.code}-${targetDeptCode}`,
      quantity: quantity
    };
  };

  // Fonction d'impression de la vue courante
  const printCurrentView = () => {
    window.print();
  };

  const addMovement = (movementData) => {
    const nowISO = new Date().toISOString();
    const newMovement = {
      id: Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7), // évite la collision d'id en scans rapprochés
      ...movementData,
      // `timestamp` (mini-historique) ET `date` (vue complète, filtres, export, impression)
      // doivent exister : les lecteurs sont répartis sur les deux champs.
      timestamp: nowISO,
      date: nowISO,
      // On garde l'utilisateur transmis par l'appelant (ex. nom saisi dans le scanner) ;
      // repli sur l'utilisateur connecté, puis « system ». NE PAS écraser movementData.user.
      user: movementData.user || currentUser?.username || 'system'
    };
    setMovements(prev => [newMovement, ...prev]); // fonctionnel : ne perd pas un mouvement concurrent
  };

  // ============== FONCTIONS IMPORT/EXPORT EXCEL ==============

  // Télécharger le modèle Excel — GABARIT STRICT identique aux consignes de l'import IA.
  // Colonnes EXACTES (et dans cet ordre) attendues par l'extraction : SITE / DÉPARTEMENT /
  // EMPLACEMENT sont OBLIGATOIRES, le reste est recommandé. Les en-têtes servent de reconnaissance
  // par colonne -> on garde ces libellés canoniques.
  const downloadExcelTemplate = () => {
    const fr = language === 'fr';
    // En-têtes canoniques (ordre du gabarit affiché dans l'UI d'import).
    const H = ['EMPLACEMENT', 'TABLETTE', 'POSITION', 'INVENTAIRE', 'IDENTIFICATION', 'MIN', 'MAX', 'SITE', 'DÉPARTEMENT', 'FOURNISSEUR', 'CATÉGORIE', 'PRIX ($)', 'CODE ITEM'];

    // Exemple réaliste : on prend un vrai SITE / DÉPARTEMENT de l'Administration si disponible.
    const sampleDept = departments.find(d => !d.isSite && d.siteName) || departments[0];
    const exSite = sampleDept?.siteName || sampleDept?.name || 'Sherbrooke';
    const exDept = sampleDept?.isSite ? '' : (sampleDept?.name || 'Bourque');
    const exCat = categories[0]?.name || 'EPI - Respiratoire';

    // 2 lignes d'exemple (mono-tablette + bac sans tablette -> TABLETTE laissée vide = 0).
    const templateData = [
      { 'EMPLACEMENT': 'Étagère A', 'TABLETTE': 2, 'POSITION': 1, 'INVENTAIRE': 100, 'IDENTIFICATION': 'Masque N95', 'MIN': 20, 'MAX': 200, 'SITE': exSite, 'DÉPARTEMENT': exDept, 'FOURNISSEUR': '3M', 'CATÉGORIE': exCat, 'PRIX ($)': 2.50, 'CODE ITEM': 'EPI-001' },
      { 'EMPLACEMENT': 'Bac réception', 'TABLETTE': '', 'POSITION': 1, 'INVENTAIRE': 0, 'IDENTIFICATION': 'Gants nitrile (boîte 100)', 'MIN': 5, 'MAX': 50, 'SITE': exSite, 'DÉPARTEMENT': exDept, 'FOURNISSEUR': 'Uline', 'CATÉGORIE': '', 'PRIX ($)': '', 'CODE ITEM': '' },
    ];

    const colDesc = fr ? [
      ['SITE', 'OBLIGATOIRE — doit correspondre EXACTEMENT à un site de l\'Administration.'],
      ['DÉPARTEMENT', 'OBLIGATOIRE — département du site (ex. Bourque).'],
      ['EMPLACEMENT', 'OBLIGATOIRE — nom du meuble/support (ex. Étagère A, Bac réception). Créé automatiquement s\'il n\'existe pas.'],
      ['TABLETTE', 'No de tablette. Vide = 0 (support sans tablette, ex. bac).'],
      ['POSITION', 'No de position sur la tablette. Vide = 1.'],
      ['INVENTAIRE', 'Quantité comptée. Case vide = 0.'],
      ['IDENTIFICATION', 'Nom / description de l\'article.'],
      ['MIN', 'Seuil de réapprovisionnement (alerte stock bas). Vide = 0.'],
      ['MAX', 'Quantité maximale visée. Vide = 0.'],
      ['FOURNISSEUR', 'Fournisseur (optionnel).'],
      ['CATÉGORIE', 'Catégorie EXACTE de la colonne. Laissée vide si absente — l\'IA n\'invente JAMAIS de catégorie.'],
      ['PRIX ($)', 'Prix coûtant unitaire (optionnel).'],
      ['CODE ITEM', 'Code/SKU de l\'article (optionnel).'],
    ] : [
      ['SITE', 'REQUIRED — must EXACTLY match a site from Administration.'],
      ['DÉPARTEMENT', 'REQUIRED — department of the site (e.g. Bourque).'],
      ['EMPLACEMENT', 'REQUIRED — storage unit name (e.g. Shelf A, Receiving bin). Auto-created if missing.'],
      ['TABLETTE', 'Shelf number. Empty = 0 (units without shelves, e.g. bins).'],
      ['POSITION', 'Position on the shelf. Empty = 1.'],
      ['INVENTAIRE', 'Counted quantity. Empty cell = 0.'],
      ['IDENTIFICATION', 'Item name / description.'],
      ['MIN', 'Reorder threshold (low-stock alert). Empty = 0.'],
      ['MAX', 'Target maximum quantity. Empty = 0.'],
      ['FOURNISSEUR', 'Supplier (optional).'],
      ['CATÉGORIE', 'EXACT category from the column. Left empty if absent — the AI NEVER invents a category.'],
      ['PRIX ($)', 'Unit cost price (optional).'],
      ['CODE ITEM', 'Item code/SKU (optional).'],
    ];

    // Sites / départements valides depuis l'Administration (pour copier-coller sans erreur).
    const adminSites = Array.from(new Set(departments.map(d => d.siteName).filter(Boolean)));
    const adminPairs = departments.filter(d => !d.isSite).map(d => [`• ${d.siteName || '?'} / ${d.name}`]);

    const instructions = [
      [fr ? 'GABARIT D\'IMPORT INVENTAIRE — C-Secur360' : 'INVENTORY IMPORT TEMPLATE — C-Secur360'],
      [''],
      [fr ? '⚠️ COLONNES OBLIGATOIRES : SITE, DÉPARTEMENT, EMPLACEMENT.' : '⚠️ REQUIRED COLUMNS: SITE, DÉPARTEMENT, EMPLACEMENT.'],
      [fr ? 'Sans ces 3 colonnes, la feuille est REFUSÉE à l\'import.' : 'Without these 3 columns, the sheet is REFUSED on import.'],
      [''],
      [fr ? 'COLONNES (ordre recommandé) :' : 'COLUMNS (recommended order):'],
      [H.join('  ·  ')],
      [''],
      [fr ? 'DESCRIPTION DE CHAQUE COLONNE :' : 'COLUMN DESCRIPTIONS:'],
      ...colDesc,
      [''],
      [fr ? 'RÈGLES :' : 'RULES:'],
      [fr ? '• Case vide dans INVENTAIRE/MIN/MAX = 0.' : '• Empty cell in INVENTAIRE/MIN/MAX = 0.'],
      [fr ? '• TABLETTE vide = 0 ; POSITION vide = 1.' : '• Empty TABLETTE = 0; empty POSITION = 1.'],
      [fr ? '• Adresse de rangement = EMPLACEMENT-TABLETTE-POSITION (générée automatiquement).' : '• Storage address = EMPLACEMENT-TABLETTE-POSITION (auto-generated).'],
      [fr ? '• Même IDENTIFICATION sur un autre site -> AJOUT d\'emplacement (pas de doublon).' : '• Same IDENTIFICATION on another site -> location ADDED (no duplicate).'],
      [fr ? '• L\'IA n\'invente JAMAIS de catégorie : elle reprend la colonne CATÉGORIE telle quelle.' : '• The AI NEVER invents categories: it uses the CATÉGORIE column as-is.'],
      [''],
      [fr ? `SITES DISPONIBLES (Administration) : ${adminSites.length ? adminSites.join(', ') : '— configure-les dans l\'Administration —'}` : `AVAILABLE SITES (Administration): ${adminSites.length ? adminSites.join(', ') : '— set them up in Administration —'}`],
      [fr ? 'SITE / DÉPARTEMENT valides :' : 'Valid SITE / DÉPARTEMENT:'],
      ...(adminPairs.length ? adminPairs : [[fr ? '• (aucun département configuré dans l\'Administration)' : '• (no department configured in Administration)']]),
      [''],
      [fr ? 'CATÉGORIES EXISTANTES (optionnel) :' : 'EXISTING CATEGORIES (optional):'],
      ...(categories.length ? categories.map(cat => [`• ${cat.name}`]) : [[fr ? '• (aucune)' : '• (none)']]),
    ];

    const wb = XLSX.utils.book_new();

    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
    wsInstructions['!cols'] = [{ wch: 28 }, { wch: 70 }];
    XLSX.utils.book_append_sheet(wb, wsInstructions, fr ? 'Instructions' : 'Instructions');

    const wsData = XLSX.utils.json_to_sheet(templateData, { header: H });
    wsData['!cols'] = [{ wch: 16 }, { wch: 9 }, { wch: 9 }, { wch: 11 }, { wch: 28 }, { wch: 7 }, { wch: 7 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 20 }, { wch: 10 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsData, fr ? 'Données' : 'Data');

    XLSX.writeFile(wb, 'C-Secur360_Modele_Import_Inventaire.xlsx');
  };

  // Exporter l'inventaire actuel
  const exportToExcel = () => {
    const exportData = items.map(item => ({
      'Code': item.code,
      'Nom': item.name,
      'Catégorie': item.category,
      'Département': item.department,
      'Localisation': item.location,
      'Quantité': item.quantity,
      'Quantité Min': item.minQuantity,
      'Quantité Max': item.maxQuantity,
      'Prix Coût ($)': item.costPrice,
      'Prix Vente ($)': item.salePrice,
      'Unité': item.unit,
      'Description': item.description || '',
      'Statut': item.quantity <= item.minQuantity ? t('common.lowStock') :
                item.quantity > item.maxQuantity ? t('common.surplus') : t('common.optimal'),
      'Valeur Stock ($)': (item.quantity * item.costPrice).toFixed(2),
      'Créé le': new Date(item.createdAt).toLocaleDateString(),
      'Créé par': item.createdBy
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    ws['!cols'] = [
      { wch: 12 }, { wch: 25 }, { wch: 20 }, { wch: 18 }, { wch: 15 },
      { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
      { wch: 10 }, { wch: 40 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Inventaire');
    XLSX.writeFile(wb, `C-Secur360_Inventaire_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Traiter le fichier Excel uploadé
  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Choisir la feuille de DONNÉES : on saute la feuille "Instructions" du gabarit.
        const dataSheet = workbook.SheetNames.find(n => /donn[ée]es|data/i.test(n))
          || workbook.SheetNames.find(n => !/instruction/i.test(n))
          || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[dataSheet];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Valider et convertir les données
        const validatedData = [];
        const errors = [];

        // GABARIT STRICT (identique à l'import IA) : SITE / DÉPARTEMENT / EMPLACEMENT / IDENTIFICATION
        // obligatoires. Case vide = 0 ; TABLETTE vide = 0 ; reconnaissance par NOM (multi-emplacement).
        // On produit la MÊME forme que l'import IA -> `confirmImport` crée les emplacements auto.
        const norm = (s) => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
        const get = (row, ...keys) => { for (const k of keys) { if (row[k] != null && String(row[k]).trim() !== '') return row[k]; } return ''; };
        const existingNames = new Set(items.map(i => norm(i.name)));
        const existingCodes = new Set(items.map(i => i.code));
        const seen = new Set();
        const seenNames = new Set();

        jsonData.forEach((row, index) => {
          const lineNumber = index + 2; // +2 car ligne 1 = headers
          const errors_row = [];

          const name = String(get(row, 'IDENTIFICATION', 'Identification', 'Nom', 'Name')).trim();
          const site = String(get(row, 'SITE', 'Site')).trim();
          const department = String(get(row, 'DÉPARTEMENT', 'DEPARTEMENT', 'Département', 'Departement', 'Department')).trim();
          const empName = String(get(row, 'EMPLACEMENT', 'Emplacement', 'Localisation', 'Location')).trim();
          const category = String(get(row, 'CATÉGORIE', 'CATEGORIE', 'Catégorie', 'Categorie', 'Category')).trim();
          const supplier = String(get(row, 'FOURNISSEUR', 'Fournisseur', 'Supplier')).trim();
          let code = String(get(row, 'CODE ITEM', 'CODE', 'Code', 'SKU')).trim();
          const shelfRaw = get(row, 'TABLETTE', 'Tablette', 'Shelf');
          const posRaw = get(row, 'POSITION', 'Position');
          const qtyRaw = get(row, 'INVENTAIRE', 'Inventaire', 'Quantité', 'Quantite', 'Quantity', 'Qté');
          const minRaw = get(row, 'MIN', 'Min', 'Quantité Min', 'Quantite Min');
          const maxRaw = get(row, 'MAX', 'Max', 'Quantité Max', 'Quantite Max');
          const priceRaw = get(row, 'PRIX ($)', 'PRIX', 'Prix', 'Prix Coût', 'Prix Cout', 'Cost');

          // Obligatoires (gabarit)
          if (!name) errors_row.push(language === 'fr' ? 'Identification (nom) manquante' : 'Missing identification (name)');
          if (!site) errors_row.push(language === 'fr' ? 'Site manquant' : 'Missing site');
          if (!department) errors_row.push(language === 'fr' ? 'Département manquant' : 'Missing department');
          if (!empName) errors_row.push(language === 'fr' ? 'Emplacement manquant' : 'Missing emplacement');
          // DÉPARTEMENT doit exister dans l'Administration (source unique des sites/départements).
          if (department && !departments.find(d => norm(d.name) === norm(department))) {
            errors_row.push(language === 'fr' ? `Département « ${department} » introuvable (Administration)` : `Department "${department}" not found (Administration)`);
          }

          // Case vide = 0 (règle Eric). TABLETTE vide = 0 ; POSITION conservée.
          const shelf = (shelfRaw === '' || shelfRaw == null) ? 0 : (Number(shelfRaw) || 0);
          const position = (posRaw === '' || posRaw == null) ? 0 : (Number(posRaw) || 0);
          const quantity = Math.max(0, Math.round(Number(qtyRaw) || 0));
          const minQuantity = Math.max(0, Math.round(Number(minRaw) || 0));
          const maxQuantity = Math.max(0, Math.round(Number(maxRaw) || 0));
          const costPrice = Math.max(0, Number(priceRaw) || 0);
          const salePrice = costPrice > 0 ? Math.round(costPrice * (1 + (Number(targetEbitda) || 0) / 100) * 100) / 100 : 0;

          const nameKey = norm(name);
          const willMergeByName = !!nameKey && (existingNames.has(nameKey) || seenNames.has(nameKey));
          if (name) seenNames.add(nameKey);

          // CODE ITEM optionnel -> auto-généré si vide.
          if (!code) code = (name ? name.slice(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '') : 'ART') + '-' + lineNumber;
          if (!willMergeByName) {
            if (code && existingCodes.has(code)) errors_row.push(t('articles.excel.validation.codeExists'));
            if (code && seen.has(code)) errors_row.push(t('articles.excel.validation.codeDuplicate'));
          }
          if (code) seen.add(code);

          const parts = [];
          if (empName) parts.push(empName);
          parts.push(String(shelf)); // tablette toujours présente, 0 par défaut
          if (position) parts.push(String(position));

          validatedData.push({
            code, name, site,
            category, // reprise telle quelle (jamais inventée)
            department,
            location: parts.join('-'),
            empName, shelf, position,
            quantity, minQuantity, maxQuantity, costPrice, salePrice,
            unit: 'Pièce', supplier, description: '',
            mergeByName: willMergeByName,
            errors: errors_row, lineNumber,
          });

          if (errors_row.length > 0) {
            errors.push({ line: lineNumber, code: code || 'N/A', errors: errors_row });
          }
        });

        setImportData(validatedData);
        setImportErrors(errors);
        setImportStep('preview');
      } catch (error) {
        notify(t('messages.error.fileRead') + ': ' + error.message, 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Synchronise une liste de succursales vers l'admin Sites/Departements (table planner_succursales)
  // comme SITES de niveau superieur (parent_id = null), en respectant la limite d'abonnement
  // (tenants.max_sites). On cree jusqu'a la limite ; au-dela on BLOQUE (site supplementaire payant
  // requis). Meme client/RLS que l'onglet admin. Best-effort : renvoie {created, blocked, ...} ou {error}.
  const syncSitesToAdmin = async (siteNames) => {
    const norm = (s) => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    try {
      const { data: rows, error } = await supabase
        .from('planner_succursales').select('id,name,parent_id').eq('tenant_id', tenantId);
      if (error) throw error;
      const existingSites = (rows || []).filter(r => !r.parent_id);
      const seen = new Set(existingSites.map(s => norm(s.name)));

      let maxSites = Infinity;
      try {
        const { data: t, error: tErr } = await supabase.from('tenants').select('max_sites').eq('subdomain', tenantId).maybeSingle();
        if (!tErr && t && t.max_sites != null) maxSites = Number(t.max_sites);
      } catch { /* colonne absente (avant migration 078) -> illimite */ }

      const missing = [];
      siteNames.forEach(n => { const name = String(n || '').trim(); if (name && !seen.has(norm(name))) { seen.add(norm(name)); missing.push(name); } });

      const slots = Number.isFinite(maxSites) ? Math.max(0, maxSites - existingSites.length) : Infinity;
      const toCreate = Number.isFinite(slots) ? missing.slice(0, slots) : missing;
      const blocked = Number.isFinite(slots) ? missing.slice(slots) : [];

      let created = [];
      if (toCreate.length) {
        const { data: ins, error: insErr } = await supabase
          .from('planner_succursales').insert(toCreate.map(name => ({ tenant_id: tenantId, name }))).select('id,name');
        if (insErr) throw insErr;
        created = ins || toCreate.map(name => ({ name }));
      }
      // Ensemble des sites VALIDES apres synchro (existants + crees) : sert a refuser les articles
      // dont le site n'existe pas / est bloque par la limite d'abonnement.
      const valid = new Set(existingSites.map(s => norm(s.name)));
      created.forEach(c => valid.add(norm(c.name)));
      return { created, blocked, maxSites, existingCount: existingSites.length, valid };
    } catch (e) {
      // En cas d'echec (RLS, reseau…), on renvoie valid=null -> on n'imposera pas le filtre site.
      return { error: e?.message || String(e), valid: null };
    }
  };

  // Import IA STRICT : le Excel doit respecter le gabarit (min. SITE / DÉPARTEMENT / EMPLACEMENT).
  // 1) l'IA verifie la conformite -> sinon REFUS avec directives ; 2) les Sites sont valides
  // contre l'Administration (planner_succursales, limite d'abonnement) -> les articles d'un site
  // inexistant/bloque sont REFUSES ; 3) on reutilise la previsualisation/validation existante.
  const handleAiFileUpload = async (file) => {
    if (!file) return;
    const controller = new AbortController();
    aiAbortRef.current = controller;
    setAiRefusal(null);
    setAiImporting(true);
    const norm = (s) => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(new Uint8Array(buf), { type: 'array' });
      let rows = [];
      for (const name of wb.SheetNames) {
        const r = XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: '' });
        if (r.length > rows.length) rows = r;
      }
      if (!rows.length) {
        notify(language === 'fr' ? 'Feuille Excel vide ou illisible.' : 'Empty or unreadable Excel sheet.', 'error');
        return;
      }

      const CHUNK = 40;
      const chunks = [];
      for (let i = 0; i < rows.length; i += CHUNK) chunks.push(rows.slice(i, i + CHUNK));
      setAiProgress({ done: 0, total: chunks.length });

      const callChunk = async (idx) => {
        const resp = await fetch('/api/inventory/extract-articles', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rows: chunks[idx], tenant: tenantId }), signal: controller.signal,
        });
        const j = await resp.json();
        if (!resp.ok || j.error) throw new Error((j.error || 'Analyse IA echouee') + (chunks.length > 1 ? ` (lot ${idx + 1}/${chunks.length})` : ''));
        return j;
      };

      // 1) CONFORMITE : on teste le 1er lot. Si non conforme -> refus avec directives, on s'arrete.
      const first = await callChunk(0);
      if (first.conforme === false) {
        setAiRefusal({ missing: Array.isArray(first.missing) ? first.missing : ['SITE', 'DÉPARTEMENT', 'EMPLACEMENT'] });
        return;
      }
      const results = new Array(chunks.length);
      results[0] = Array.isArray(first.articles) ? first.articles : [];
      let done = 1; setAiProgress({ done, total: chunks.length });

      // 2) Lots restants en parallele.
      let nextIdx = 1;
      const worker = async () => {
        while (nextIdx < chunks.length) {
          if (controller.signal.aborted) return;
          const idx = nextIdx++;
          const j = await callChunk(idx);
          results[idx] = Array.isArray(j.articles) ? j.articles : [];
          done++; setAiProgress({ done, total: chunks.length });
        }
      };
      await Promise.all(Array.from({ length: Math.min(4, Math.max(1, chunks.length - 1)) }, () => worker()));
      const aiArticles = results.flat().filter(Boolean);
      if (!aiArticles.length) throw new Error(language === 'fr' ? 'Aucun article detecte dans la feuille.' : 'No article detected in the sheet.');

      // 3) SITES : valides contre l'Administration (cree jusqu'a la limite, bloque le surplus).
      const distinctSites = [];
      const siteSeen = new Set();
      aiArticles.forEach(a => { const n = String(a.site || '').trim(); if (n && !siteSeen.has(norm(n))) { siteSeen.add(norm(n)); distinctSites.push(n); } });
      let siteSync = null;
      if (distinctSites.length) siteSync = await syncSitesToAdmin(distinctSites);
      const validSites = siteSync && siteSync.valid instanceof Set ? siteSync.valid : null; // null = pas de filtre (echec admin)
      const blockedSet = new Set((siteSync?.blocked || []).map(norm));

      // 4) Categories + departements (locaux) absents crees automatiquement (pour confirmImport).
      const catSet = new Set(categories.map(c => norm(c.name)));
      const deptSet = new Set(departments.map(d => norm(d.name)));
      const newCats = [], newDepts = [];
      aiArticles.forEach(a => {
        const c = String(a.category || '').trim();
        if (c && !catSet.has(norm(c))) { catSet.add(norm(c)); newCats.push(c); }
        const d = String(a.department || '').trim();
        if (d && !deptSet.has(norm(d))) { deptSet.add(norm(d)); newDepts.push(d); }
      });
      if (newCats.length) {
        const stamp = Date.now().toString(36);
        setCategories(prev => { const next = [...prev, ...newCats.map((name, i) => ({ id: `ai-${stamp}-c${i}`, name, code: '', subcategories: [], created_at: new Date().toISOString() }))]; saveLS(invKey('c-secur360-categories'), next); return next; });
      }
      if (newDepts.length) {
        const stamp = Date.now().toString(36);
        setDepartments(prev => { const next = [...prev, ...newDepts.map((name, i) => ({ id: `ai-${stamp}-d${i}`, name, code: '', locations: [], created_at: new Date().toISOString() }))]; saveLS(invKey('c-secur360-departments'), next); return next; });
      }

      // 5) Lignes validees. Adresse = EMPLACEMENT-TABLETTE-POSITION (auto-generee sous le
      // site/departement). TABLETTE = 0 si absente (ex. bac/bin dans un support sans tablette) ;
      // on garde quand meme la position.
      const combineLoc = (a) => {
        const emp = String(a.location ?? '').trim();
        const shelf = (a.shelf === '' || a.shelf == null) ? 0 : (Number(a.shelf) || 0);
        const pos = String(a.position ?? '').trim();
        const parts = [];
        if (emp) parts.push(emp);
        parts.push(String(shelf)); // tablette toujours presente, 0 par defaut
        if (pos) parts.push(pos);
        return parts.join('-');
      };
      const existingNames = new Set(items.map(i => norm(i.name)));
      const existingCodes = new Set(items.map(i => i.code));
      const seen = new Set();
      const seenNames = new Set();
      let refusedSiteCount = 0;
      const validatedData = aiArticles.map((a, index) => {
        const errors_row = [];
        const code = String(a.code || '').trim();
        const name = String(a.name || '').trim();
        const site = String(a.site || '').trim();
        const nameKey = norm(name);
        const willMergeByName = !!nameKey && (existingNames.has(nameKey) || seenNames.has(nameKey));
        if (name) seenNames.add(nameKey);
        if (!code) errors_row.push(language === 'fr' ? 'Code manquant' : 'Missing code');
        if (!name) errors_row.push(language === 'fr' ? 'Nom manquant' : 'Missing name');
        if (!site) errors_row.push(language === 'fr' ? 'Site manquant' : 'Missing site');
        // SITE doit exister/etre autorise dans l'Administration (sinon refuse).
        if (site && validSites) {
          if (blockedSet.has(norm(site)) || !validSites.has(norm(site))) {
            errors_row.push(language === 'fr' ? `Site « ${site} » inexistant ou non autorisé (abonnement)` : `Site "${site}" missing or not allowed (subscription)`);
            refusedSiteCount++;
          }
        }
        // Case vide = 0 (regle Eric). Aucun forcage du max.
        const quantity = Math.max(0, Math.round(Number(a.quantity) || 0));
        const minQuantity = Math.max(0, Math.round(Number(a.minQuantity) || 0));
        const maxQuantity = Math.max(0, Math.round(Number(a.maxQuantity) || 0));
        const costPrice = Math.max(0, Number(a.costPrice) || 0);
        // Prix de vente derive du PRIX (cout) via l'EBITDA cible du module (coherent avec le formulaire).
        const salePrice = costPrice > 0 ? Math.round(costPrice * (1 + (Number(targetEbitda) || 0) / 100) * 100) / 100 : 0;
        if (!willMergeByName) {
          if (code && existingCodes.has(code)) errors_row.push(t('articles.excel.validation.codeExists'));
          if (code && seen.has(code)) errors_row.push(t('articles.excel.validation.codeDuplicate'));
        }
        if (code) seen.add(code);
        return {
          code, name, site,
          category: String(a.category || '').trim(),
          department: String(a.department || '').trim(),
          location: combineLoc(a),
          // Composants d'emplacement (pour créer auto les emplacements/tablettes dans la carte) :
          empName: String(a.location || '').trim(),
          shelf: (a.shelf === '' || a.shelf == null) ? 0 : (Number(a.shelf) || 0),
          position: (a.position === '' || a.position == null) ? 0 : (Number(a.position) || 0),
          quantity, minQuantity, maxQuantity, costPrice, salePrice,
          unit: 'Pièce',
          supplier: String(a.supplier || '').trim(),
          description: String(a.description || '').trim(),
          mergeByName: willMergeByName,
          errors: errors_row,
          lineNumber: index + 2,
        };
      });
      const errors = validatedData.filter(d => d.errors.length > 0).map(d => ({ line: d.lineNumber, code: d.code || 'N/A', errors: d.errors }));

      setImportData(validatedData);
      setImportErrors(errors);
      setImportStep('preview');

      const dataRowCount = rows.filter(r => Object.values(r).some(v => String(v ?? '').trim() !== '')).length;
      const createdSitesCount = siteSync && Array.isArray(siteSync.created) ? siteSync.created.length : 0;
      const extra = [
        newCats.length ? (language === 'fr' ? `${newCats.length} catégorie(s) créée(s)` : `${newCats.length} category(ies) created`) : '',
        createdSitesCount ? (language === 'fr' ? `${createdSitesCount} site(s) créé(s) dans l'admin` : `${createdSitesCount} site(s) created in admin`) : '',
      ].filter(Boolean).join(', ');
      notify((language === 'fr' ? `IA : ${aiArticles.length} article(s) détecté(s) sur ${dataRowCount} ligne(s)` : `AI: ${aiArticles.length} article(s) detected from ${dataRowCount} row(s)`) + (extra ? ` — ${extra}` : '') + '.');
      if (refusedSiteCount > 0) {
        notify((language === 'fr'
          ? `⛔ ${refusedSiteCount} article(s) refusé(s) — site inexistant ou non autorisé (limite d'abonnement). Crée le site dans Administration ou ajoute un site payant.`
          : `⛔ ${refusedSiteCount} article(s) refused — site missing or not allowed (subscription limit).`), 'warning');
      }
      if (siteSync && siteSync.error) {
        notify((language === 'fr' ? "⚠️ Sites non vérifiés (admin indisponible) : " : '⚠️ Sites not verified (admin unavailable): ') + siteSync.error, 'warning');
      }
    } catch (e) {
      if (controller.signal.aborted || e?.name === 'AbortError') {
        notify(language === 'fr' ? 'Import IA annulé.' : 'AI import cancelled.', 'info');
      } else {
        notify((language === 'fr' ? 'Import IA échoué : ' : 'AI import failed: ') + (e?.message || e), 'error');
      }
    } finally {
      setAiImporting(false);
      setAiProgress(null);
      aiAbortRef.current = null;
    }
  };

  // Confirmer l'importation. RECONNAISSANCE PAR NOM : si un article du meme nom existe deja (ou
  // revient plusieurs fois dans la feuille, ex. meme produit dans une autre succursale/departement),
  // on NE CREE PAS de doublon -> on ajoute simplement l'EMPLACEMENT (multi-emplacement) a l'article
  // existant et on recalcule la quantite totale. Sinon on cree un nouvel article.
  const confirmImport = () => {
    const validItems = importData.filter(item => item.errors.length === 0);
    if (!validItems.length) { setImportStep('complete'); return; }

    const norm = (s) => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const deptCodeOf = (deptName) => departments.find(d => norm(d.name) === norm(deptName))?.code || '';
    const mkLoc = (it) => ({
      site: it.site || '',
      department: it.department || '',
      departmentCode: deptCodeOf(it.department),
      location: it.location || '',
      quantity: it.quantity || 0,
      minQuantity: it.minQuantity || 0,
      maxQuantity: it.maxQuantity || 0,
    });

    const movementsToAdd = [];
    let createdCount = 0, mergedCount = 0;

    // On calcule le prochain etat HORS de l'updater (a partir de `items` courant) pour ne pas
    // declencher d'effet de bord double en StrictMode. Confirmation = action utilisateur -> `items` a jour.
    {
      const next = items.map(i => ({ ...i })); // clone superficiel (on mute locations/quantity)
      const byName = new Map();
      next.forEach(i => { if (i.name) byName.set(norm(i.name), i); });

      validItems.forEach(itemData => {
        const key = norm(itemData.name);
        const existing = key ? byName.get(key) : null;

        if (existing) {
          // Meme nom -> AJOUT D'EMPLACEMENT (conversion en multi-emplacement au besoin).
          let locs = Array.isArray(existing.locations) ? [...existing.locations] : [];
          if (!existing.isMultiLocation && !locs.length) {
            locs.push({
              department: existing.department || '',
              departmentCode: existing.departmentCode || deptCodeOf(existing.department),
              location: existing.location || '',
              quantity: existing.quantity || 0,
              minQuantity: existing.minQuantity || 0,
              maxQuantity: existing.maxQuantity || 0,
            });
          }
          const di = locs.findIndex(l => norm(l.department) === norm(itemData.department));
          if (di >= 0) locs[di] = { ...locs[di], quantity: (locs[di].quantity || 0) + (itemData.quantity || 0) };
          else locs.push(mkLoc(itemData));
          existing.locations = locs;
          existing.isMultiLocation = true;
          existing.quantity = locs.reduce((s, l) => s + (l.quantity || 0), 0);
          existing.updatedAt = new Date().toISOString();
          mergedCount++;
          movementsToAdd.push({
            type: 'entry', itemId: existing.id, itemName: existing.name, quantity: itemData.quantity || 0,
            department: itemData.department || '', departmentCode: deptCodeOf(itemData.department),
            reason: (language === 'fr' ? 'Import — emplacement ajouté' : 'Import — location added') + (itemData.department ? ` (${itemData.department})` : ''),
            user: currentUser?.username || 'import-excel',
          });
        } else {
          // Nouvel article (avec son 1er emplacement).
          const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
          const created = {
            id,
            code: itemData.code, name: itemData.name, category: itemData.category,
            site: itemData.site || '', supplier: itemData.supplier || '',
            department: itemData.department, departmentCode: deptCodeOf(itemData.department), location: itemData.location,
            quantity: itemData.quantity, minQuantity: itemData.minQuantity, maxQuantity: itemData.maxQuantity,
            costPrice: itemData.costPrice, salePrice: itemData.salePrice, unit: itemData.unit, description: itemData.description,
            createdAt: new Date().toISOString(), createdBy: currentUser?.username || 'import-excel',
          };
          next.push(created);
          if (key) byName.set(key, created);
          createdCount++;
          movementsToAdd.push({
            type: 'entry', itemId: id, itemName: created.name, quantity: created.quantity,
            reason: 'Import Excel', user: currentUser?.username || 'import-excel',
          });
        }
      });

      saveLS(invKey('c-secur360-inventory-items'), next);
      setItems(next);
    }

    // EMPLACEMENTS AUTO : à partir des colonnes EMPLACEMENT / TABLETTE / POSITION, on crée (ou met à
    // jour) les emplacements de stockage dans la carte du département. numberOfShelves = plus grande
    // TABLETTE vue ; numberOfSpaces = plus grande POSITION vue (capacité couvrant l'import).
    const deptIdOf = (deptName) => departments.find(d => norm(d.name) === norm(deptName))?.id || null;
    const empAgg = new Map(); // key deptId|empName -> { deptId, name, shelves, spaces }
    validItems.forEach(it => {
      const empName = String(it.empName || '').trim();
      if (!empName) return;
      const deptId = deptIdOf(it.department);
      if (!deptId) return;
      const key = deptId + '|' + norm(empName);
      const cur = empAgg.get(key) || { deptId, name: empName, shelves: 0, spaces: 0 };
      cur.shelves = Math.max(cur.shelves, Number(it.shelf) || 0);
      cur.spaces = Math.max(cur.spaces, Number(it.position) || 0);
      empAgg.set(key, cur);
    });
    let empCreated = 0, empUpdated = 0;
    if (empAgg.size) {
      setStorageUnits(prev => {
        const nextSU = [...prev];
        empAgg.forEach(({ deptId, name, shelves, spaces }) => {
          const i = nextSU.findIndex(u => u.departmentId === deptId && norm(u.name) === norm(name));
          if (i >= 0) {
            nextSU[i] = { ...nextSU[i], numberOfShelves: Math.max(nextSU[i].numberOfShelves || 0, shelves), numberOfSpaces: Math.max(nextSU[i].numberOfSpaces || 0, spaces), updated_at: new Date().toISOString() };
            empUpdated++;
          } else {
            nextSU.push({ id: `imp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, name, code: '', departmentId: deptId, numberOfShelves: shelves, numberOfSpaces: spaces, shelves: [], created_at: new Date().toISOString() });
            empCreated++;
          }
        });
        saveLS(invKey('c-secur360-storage-units'), nextSU);
        return nextSU;
      });
    }

    movementsToAdd.forEach(m => addMovement(m));
    notify(language === 'fr'
      ? `Import terminé : ${createdCount} article(s) créé(s), ${mergedCount} emplacement(s) fusionné(s)${empCreated || empUpdated ? `, ${empCreated} emplacement(s) créé(s) / ${empUpdated} mis à jour dans les cartes` : ''}.`
      : `Import done: ${createdCount} created, ${mergedCount} merged${empCreated || empUpdated ? `, ${empCreated} storage created / ${empUpdated} updated` : ''}.`);
    setImportStep('complete');
  };

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // ============== COMPOSANT: HEADER ==============
  const Header = () => (
    <header className="bg-gray-900 border-b border-gray-700 px-2 sm:px-4 py-2 sm:py-3 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo size="normal" showText={true} />

          {/* Bouton hamburger mobile - à droite du logo */}
          {isAuthenticated && (
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors"
            >
              <Menu size={24} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {isAuthenticated && (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-white">{currentUser?.username}</div>
                <div className="text-xs text-gray-300">
                  {currentUser?.role === 'admin' && t('administration.roles.admin')}
                  {currentUser?.role === 'manager' && t('administration.roles.manager')}
                  {currentUser?.role === 'employee' && t('administration.roles.employee')}
                  {currentUser?.role === 'viewer' && t('administration.roles.viewer')}
                </div>
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-700 rounded-full flex items-center justify-center">
                <User size={14} className="text-white sm:w-4 sm:h-4" />
              </div>
            </div>
          )}

          <PWAInstallButton />
          {/* Langue/Theme: piloter depuis le header principal de l'app (single source). */}

          {isAuthenticated ? (
            <button
              onClick={logout}
              className="text-gray-300 hover:text-white transition-colors"
              title={t('logout')}
            >
              <LogOut size={16} />
            </button>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="text-gray-300 hover:text-white transition-colors"
              title={t('login')}
            >
              <LogIn size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );

  // ============== COMPOSANT: SIDEBAR NAVIGATION ==============
  const Sidebar = () => {
    const navItems = [
      { id: 'dashboard', icon: LayoutDashboard, label: t('nav.dashboard'), badge: null },
      { id: 'articles', icon: Package, label: t('nav.articles'), badge: stats.total },
      { id: 'scanner', icon: Camera, label: t('nav.scanner'), badge: null },
      { id: 'movements', icon: TrendingUp, label: t('nav.movements'), badge: movements.length },
      { id: 'analytics', icon: Layers, label: language === 'fr' ? 'Analytique' : 'Analytics', badge: inventoryAnalytics.reorder.length || null },
      { id: 'reports', icon: FileText, label: t('nav.reports'), badge: null },
      { id: 'admin', icon: Settings, label: t('nav.administration'), badge: stats.lowStock > 0 ? stats.lowStock : null }
    ];

    return (
      <>
        {/* Overlay pour mobile */}
        {!sidebarCollapsed && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          ${sidebarCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-64'}
          fixed lg:sticky top-0 lg:top-16 left-0 h-screen
          bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transition-all duration-300 flex flex-col z-50
        `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {!sidebarCollapsed && (
            <h2 className="font-semibold text-gray-900 dark:text-white">{t('nav.navigation')}</h2>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = view === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  // Fermer le menu sur mobile après sélection
                  if (window.innerWidth < 1024) {
                    setSidebarCollapsed(true);
                  }
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200 group
                  ${isActive
                    ? 'bg-slate-700 text-white shadow-lg shadow-orange-500/30'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                  ${sidebarCollapsed ? 'justify-center' : ''}
                `}
              >
                <Icon size={20} className={`${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    {item.badge !== null && (
                      <span className={`
                        px-2 py-0.5 rounded-full text-xs font-semibold
                        ${isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-600 dark:bg-orange-900/30 dark:text-slate-400'
                        }
                      `}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {!sidebarCollapsed && isAuthenticated && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                <User size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {currentUser?.username}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {currentUser?.role}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
      </>
    );
  };


  // Fonction d'impression
  const handlePrint = (item = null) => {
    if (item) {
      setItemToPrint(item);
      setPrintMode('single');
    } else {
      setPrintMode('batch');
    }
    setShowPrintModal(true);
  };

  const executePrint = () => {
    window.print();
  };

  // Actualiser depuis le nuage : recharge items/mouvements/catégories/emplacements depuis
  // inventory_state (utile quand un autre appareil a bougé du stock — le temps réel est désactivé).
  const refreshFromCloud = async () => {
    try {
      const { data } = await supabase.from('inventory_state').select('data').eq('tenant_id', tenantId).maybeSingle();
      const s = data?.data || {};
      if (Array.isArray(s.items)) { setItems(s.items); cloudItemCount.current = s.items.length; }
      if (Array.isArray(s.movements)) setMovements(s.movements);
      if (Array.isArray(s.categories)) setCategories(s.categories);
      if (Array.isArray(s.storageUnits)) setStorageUnits(s.storageUnits);
      notify(language === 'fr' ? 'Mouvements et inventaire actualisés ✓' : 'Movements and inventory refreshed ✓');
      return true;
    } catch (e) {
      notify((language === 'fr' ? 'Actualisation impossible : ' : 'Refresh failed: ') + (e?.message || e), 'error');
      return false;
    }
  };

  // Gestion de la sélection multiple
  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleAllItems = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };


  // ============== VUE: SCANNER ==============
  const ScannerView = () => {
    const [scannedCode, setScannedCode] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scannerError, setScannerError] = useState('');
    const [scannedItem, setScannedItem] = useState(null);
    const [scannerMode, setScannerMode] = useState('movement'); // 'movement' ou 'inventory'
    const [adjustmentQuantity, setAdjustmentQuantity] = useState(0);
    const [physicalCount, setPhysicalCount] = useState(''); // Pour le mode inventaire
    const [projectCode, setProjectCode] = useState(''); // Numéro de projet sélectionné (raison projet)
    const [reasonCodeSel, setReasonCodeSel] = useState(''); // code interne sélectionné (raison interne)
    const [withdrawalType, setWithdrawalType] = useState('project'); // source de la raison : 'project' ou 'internal'
    const [scannerUser, setScannerUser] = useState(hostUserName || currentUser?.username || ''); // Identité par défaut = utilisateur connecté à l'app
    // Si le nom de l'utilisateur connecté arrive après le montage, on remplit le champ (sans écraser une saisie).
    useEffect(() => { if (hostUserName && !scannerUser) setScannerUser(hostUserName); }, [hostUserName]); // eslint-disable-line react-hooks/exhaustive-deps
    const videoRef = useRef(null);   // <video> natif (flux caméra net, plein contrôle)
    const canvasRef = useRef(null);  // capture des frames pour ZXing
    const streamRef = useRef(null);  // MediaStream actif
    const trackRef = useRef(null);   // piste vidéo (zoom/torch/focus via applyConstraints)
    const loopRef = useRef(null);    // timer de la boucle de décodage
    const handledRef = useRef(false); // anti double-décodage : on ne traite qu'un code par scan
    const photoInputRef = useRef(null); // input appareil photo natif (capture="environment")
    // Détecteur NATIF live (BarcodeDetector). Sur Android Chrome = moteur ML Kit de Google Play
    // Services -> EXACTEMENT le même que l'appareil photo natif qui lit ces QR instantanément.
    // On le réutilise frame après frame. undefined = pas encore testé ; null = indisponible (iOS
    // Safari, vieux navigateurs) -> on bascule sur ZXing. Sinon : instance BarcodeDetector.
    const liveDetectorRef = useRef(undefined);
    const [zoom, setZoom] = useState(1);
    const [zoomCaps, setZoomCaps] = useState(null); // {min,max,step} si la caméra supporte le zoom (Android Chrome ; pas iOS)
    const [torchSupported, setTorchSupported] = useState(false);
    const [torchOn, setTorchOn] = useState(false);
    // Applique un niveau de zoom à la caméra en cours (aide à lire les petits QR imprimés).
    const applyZoom = async (z) => {
      const tr = trackRef.current; if (!tr || !zoomCaps) return;
      const v = Math.min(zoomCaps.max, Math.max(zoomCaps.min, Number(z) || zoomCaps.min));
      setZoom(v);
      try { await tr.applyConstraints({ advanced: [{ zoom: v }] }); } catch { /* ignore */ }
    };
    // Lampe (torch) : éclaire/réduit les reflets sur un QR imprimé. Android Chrome uniquement.
    const toggleTorch = async () => {
      const tr = trackRef.current; if (!tr || !torchSupported) return;
      const next = !torchOn;
      try { await tr.applyConstraints({ advanced: [{ torch: next }] }); setTorchOn(next); } catch { /* ignore */ }
    };
    // Tap-to-focus : « kick » d'autofocus (single-shot/manual puis continuous force un nouveau cycle d'AF).
    const refocus = async () => {
      const tr = trackRef.current; if (!tr) return;
      try {
        const caps = tr.getCapabilities ? tr.getCapabilities() : {};
        const modes = caps.focusMode || [];
        if (modes.includes('single-shot')) { try { await tr.applyConstraints({ advanced: [{ focusMode: 'single-shot' }] }); } catch { /* ignore */ } }
        else if (modes.includes('manual')) { try { await tr.applyConstraints({ advanced: [{ focusMode: 'manual' }] }); } catch { /* ignore */ } }
        if (modes.includes('continuous')) await tr.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
      } catch { /* ignore */ }
    };

    // Decodeur NATIF du systeme (API BarcodeDetector). Sur Android Chrome c'est le moteur de
    // Google Play Services -> EXACTEMENT le meme que l'appareil photo natif qui lit ces etiquettes
    // instantanement. On l'essaie EN PREMIER ; ZXing (WASM) ne sert que de repli (iOS, vieux navigateurs).
    // Retourne le texte decode, ou null si rien/indisponible.
    const detectNative = async (file) => {
      try {
        if (typeof window === 'undefined' || !('BarcodeDetector' in window)) return null;
        const formats = await window.BarcodeDetector.getSupportedFormats().catch(() => []);
        if (!formats || !formats.includes('qr_code')) return null;
        const det = new window.BarcodeDetector({ formats: ['qr_code'] });
        // createImageBitmap gere Blob JPEG/PNG/WEBP + orientation EXIF, pleine resolution.
        let bitmap = null;
        try { bitmap = await createImageBitmap(file); } catch { bitmap = null; }
        if (!bitmap) return null;
        const codes = await det.detect(bitmap);
        try { bitmap.close && bitmap.close(); } catch { /* ignore */ }
        if (codes && codes.length && codes[0].rawValue) return codes[0].rawValue;
        return null;
      } catch { return null; }
    };

    // Scan via PHOTO (appareil photo natif). Strategie en cascade, du plus fiable au repli :
    //  0) BarcodeDetector natif (= moteur de la camera native qui marche deja) ;
    //  1) ZXing sur le fichier brut ; 2) ZXing sur les pixels a plusieurs echelles.
    const scanFromPhoto = async (file) => {
      setScannerError(''); handledRef.current = false;
      if (!file) {
        // Pas de fichier (capture annulee, ou le navigateur n'a rien renvoye) -> on le dit au lieu du silence.
        setScannerError(language === 'fr'
          ? "Aucune photo recue de la camera. Reessaie : touche le bouton, prends la photo, puis valide."
          : 'No photo received from the camera. Try again: tap the button, take the photo, then confirm.');
        return;
      }

      // 0) DECODEUR NATIF DU TELEPHONE (le plus fiable — meme moteur que la camera native).
      try {
        const native = await detectNative(file);
        if (native) { handleDecoded(native); return; }
      } catch { /* on passe au repli ZXing */ }

      // Repli ZXing (WASM). Si meme le chargement echoue -> message distinct.
      let readBarcodes;
      try {
        ({ readBarcodes } = await loadZxing());
        if (typeof readBarcodes !== 'function') throw new Error('readBarcodes indisponible');
      } catch (e) {
        setScannerError((language === 'fr'
          ? "Moteur de lecture indisponible (WASM non charge). Verifie la connexion puis reessaie. Detail : "
          : 'Reader engine unavailable (WASM not loaded). Check connection and retry. Detail: ') + (e?.message || e));
        return;
      }

      // Options : TOUS formats (pas seulement QRCode), agressif. maxNumberOfSymbols 1 = on s'arrete au 1er.
      const opts = { tryHarder: true, tryInvert: true, tryRotate: true, tryDownscale: true, maxNumberOfSymbols: 1 };
      const hit = (results) => results && results.length && (results[0].text || results[0].bytes);

      try {
        // 1) ZXing sur le fichier BRUT (il decode JPEG/PNG/WEBP nativement, pleine resolution).
        try {
          const r = await readBarcodes(file, opts);
          if (hit(r)) { handleDecoded(r[0].text); return; }
        } catch { /* on tente la voie pixels ci-dessous */ }

        // 2) ZXing sur pixels via <img> + canvas -> ImageData, a PLUSIEURS echelles.
        //    (gere HEIC/orientation EXIF via le decodeur du navigateur ; plusieurs tailles aident les QR petits ou flous.)
        const url = URL.createObjectURL(file);
        let img;
        try {
          img = new Image();
          img.src = url;
          if (img.decode) { try { await img.decode(); } catch { /* fallback onload */ } }
          if (!img.complete || !(img.naturalWidth || img.width)) {
            await new Promise((res, rej) => { img.onload = () => res(); img.onerror = () => rej(new Error('image illisible')); });
          }
          const ow = img.naturalWidth || img.width, oh = img.naturalHeight || img.height;
          if (!ow || !oh) throw new Error('image vide');
          for (const maxDim of [2200, 1400, 900]) {
            const scale = Math.min(1, maxDim / Math.max(ow, oh));
            const w = Math.max(1, Math.round(ow * scale)), h = Math.max(1, Math.round(oh * scale));
            const c = document.createElement('canvas'); c.width = w; c.height = h;
            const ctx = c.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(img, 0, 0, w, h);
            const imgData = ctx.getImageData(0, 0, w, h);
            const r = await readBarcodes(imgData, opts);
            if (hit(r)) { handleDecoded(r[0].text); return; }
          }
        } finally { URL.revokeObjectURL(url); }

        // 3) Rien trouve : le moteur a bien tourne, mais aucun code lisible.
        setScannerError(language === 'fr'
          ? "Aucun code QR n'a ete reconnu sur la photo. Reprends-la bien nette, QR centre et a plat, sans reflet ni ombre, avec un bon eclairage."
          : 'No QR code recognized in the photo. Retake it sharp, centered, flat, glare-free and well lit.');
      } catch (e) {
        setScannerError((language === 'fr' ? "Lecture de la photo impossible : " : 'Photo read failed: ') + (e?.message || e));
      }
    };

    // Traiter un code détecté (QR URL publique, JSON, ou code simple).
    const handleDecoded = (decodedText) => {
      if (handledRef.current) return; // déjà traité ce scan -> on ignore les frames suivantes
      // Ouvre la modale sur l'article trouvé, met la caméra en pause et arme le garde.
      const onHit = (item, departmentCode) => {
        handledRef.current = true;
        setSelectedItem(departmentCode != null ? { ...item, scannedDepartmentCode: departmentCode } : item);
        setShowScannedModal(true);
        if (loopRef.current) { clearTimeout(loopRef.current); loopRef.current = null; } // pause le décodage (la caméra reste prête)
      };
      try {
        const url = new URL(decodedText);
        let itemId = url.searchParams.get('id');
        if (!itemId) {
          const seg = url.pathname.split('/').filter(Boolean);
          const si = seg.indexOf('scan');
          if (si >= 0 && seg[si + 2]) itemId = decodeURIComponent(seg[si + 2]);
        }
        const itemCode = url.searchParams.get('code');
        const departmentCode = url.searchParams.get('dept');
        const item = items.find(i => i.id === itemId || i.code === itemCode);
        if (item) onHit(item, departmentCode); else setScannerError(t('scanner.itemNotFound'));
      } catch (e) {
        try {
          const qrData = JSON.parse(decodedText);
          if (qrData.type === 'C-Secur360-Inventory') {
            const item = items.find(i => i.id === qrData.id || i.code === qrData.code);
            if (item) onHit(item, qrData.departmentCode); else setScannerError(t('scanner.itemNotFound'));
          } else setScannerError(t('scanner.itemNotFound')); // QR JSON non reconnu : feedback au lieu du silence
        } catch (e2) {
          const item = items.find(i => i.code === decodedText);
          if (item) onHit(item, null); else setScannerError(t('scanner.itemNotFound'));
        }
      }
    };

    // Obtient (en le mettant en cache) le détecteur natif live, ou null s'il est indisponible.
    const getLiveDetector = async () => {
      if (liveDetectorRef.current !== undefined) return liveDetectorRef.current;
      try {
        if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
          const formats = await window.BarcodeDetector.getSupportedFormats().catch(() => []);
          if (formats && formats.includes('qr_code')) {
            liveDetectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] });
            return liveDetectorRef.current;
          }
        }
      } catch { /* ignore */ }
      liveDetectorRef.current = null; // indisponible -> on n'essaiera plus, repli ZXing
      return null;
    };

    // Boucle de décodage : lit une frame du <video> (~8 images/s). S'arrête au 1er code.
    // 1) DÉCODEUR NATIF (BarcodeDetector = ML Kit sur Android) directement sur le <video> :
    //    c'est le MÊME moteur que l'appareil photo natif, donc il lit ces QR aussi vite que lui.
    // 2) Repli ZXing (WASM) via canvas pour iOS Safari / navigateurs sans BarcodeDetector.
    const tick = async () => {
      if (!streamRef.current || handledRef.current) return;
      const v = videoRef.current, c = canvasRef.current;
      if (v && v.readyState >= 2 && v.videoWidth) {
        try {
          const det = await getLiveDetector();
          if (det) {
            // Détection native directement sur l'élément vidéo (pleine résolution, sans copie canvas).
            const codes = await det.detect(v);
            if (!handledRef.current && codes && codes.length && codes[0].rawValue) {
              handleDecoded(codes[0].rawValue);
            }
          } else if (c) {
            // Repli ZXing : capture la frame dans un canvas puis décode les pixels.
            const w = v.videoWidth, h = v.videoHeight;
            if (c.width !== w) c.width = w;
            if (c.height !== h) c.height = h;
            const ctx = c.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(v, 0, 0, w, h);
            const img = ctx.getImageData(0, 0, w, h);
            const { readBarcodes } = await loadZxing();
            const results = await readBarcodes(img, { tryHarder: true, formats: ['QRCode'], maxNumberOfSymbols: 1 });
            if (!handledRef.current && results && results.length && results[0].text) handleDecoded(results[0].text);
          }
        } catch { /* frame illisible -> on continue */ }
      }
      if (!handledRef.current && streamRef.current) loopRef.current = setTimeout(tick, 120);
    };

    // Démarrer le scan — appelé DANS le tap (geste utilisateur requis par iOS). getUserMedia + <video>
    // natif (image NETTE + autofocus continu) ; décodage par ZXing (robuste, lit bien les QR imprimés).
    const startScanning = async () => {
      setScannerError('');
      handledRef.current = false;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          // Résolution la plus haute possible : plus de pixels sur un petit QR imprimé = lecture
          // plus fiable (la caméra native, elle, capture en pleine résolution).
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 2560 }, height: { ideal: 1440 }, frameRate: { ideal: 30 }, focusMode: { ideal: 'continuous' } },
          audio: false,
        });
        streamRef.current = stream;
        const track = stream.getVideoTracks()[0];
        trackRef.current = track;
        const v = videoRef.current;
        if (v) { v.srcObject = stream; v.setAttribute('playsinline', 'true'); v.muted = true; try { await v.play(); } catch { /* ignore */ } }
        setIsScanning(true);
        // Capacités caméra : zoom, lampe, autofocus. Pour les ÉTIQUETTES IMPRIMÉES (petit QR), on
        // démarre à ~2x : le QR occupe une plus grande part du cadre -> lecture bien plus fiable
        // (l'utilisateur a confirmé que zoomer aide). Curseur pour ajuster.
        try {
          const caps = track.getCapabilities ? track.getCapabilities() : {};
          if (caps.zoom && typeof caps.zoom.max === 'number' && caps.zoom.max > (caps.zoom.min || 1)) {
            const min = caps.zoom.min || 1, max = caps.zoom.max, step = caps.zoom.step || 0.1;
            setZoomCaps({ min, max, step });
            const z = Math.min(max, Math.max(min, 2)); setZoom(z); // défaut ~2x pour QR imprimés
            try { await track.applyConstraints({ advanced: [{ zoom: z }] }); } catch { /* ignore */ }
          } else setZoomCaps(null);
          setTorchSupported(!!caps.torch);
          // Autofocus continu (on NE force PAS focusDistance, ça figerait la mise au point).
          const fmodes = caps.focusMode || [];
          if (fmodes.includes('continuous')) { try { await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] }); } catch { /* ignore */ } }
        } catch { /* ignore */ }
        loopRef.current = setTimeout(tick, 300);
      } catch (e) {
        setIsScanning(false);
        const denied = e && (e.name === 'NotAllowedError' || /denied|permission|notallowed/i.test(String(e)));
        const noCam = e && (e.name === 'NotFoundError' || /not ?found|no camera/i.test(String(e)));
        setScannerError(
          denied ? "Accès à la caméra refusé. Autorise la caméra (icône cadenas dans la barre d'adresse), puis réessaie."
            : noCam ? "Aucune caméra détectée sur cet appareil. Utilise la recherche manuelle ci-dessous."
              : "Impossible d'ouvrir la caméra : " + (e?.message || e) + ". Sur cellulaire, ouvre la page en HTTPS et autorise la caméra."
        );
      }
    };

    // Arrêter le scan : stoppe la boucle + libère la caméra.
    const stopScanning = () => {
      if (loopRef.current) { clearTimeout(loopRef.current); loopRef.current = null; }
      if (streamRef.current) { try { streamRef.current.getTracks().forEach(tr => tr.stop()); } catch { /* ignore */ } streamRef.current = null; }
      trackRef.current = null;
      const v = videoRef.current; if (v) { try { v.pause(); v.srcObject = null; } catch { /* ignore */ } }
      setIsScanning(false); setZoomCaps(null); setZoom(1); setTorchSupported(false); setTorchOn(false);
    };

    // Forcer le mode inventaire si un inventaire global est actif
    useEffect(() => {
      if (globalInventoryMode.active) {
        setScannerMode('inventory');
      }
    }, [globalInventoryMode.active]);

    // PAS de démarrage automatique : iOS/Safari exige un GESTE utilisateur (tap) pour accéder à la
    // caméra. L'utilisateur démarre via le bouton « Démarrer le scan ». On nettoie au démontage.
    useEffect(() => {
      return () => { stopScanning(); };
    }, []); // Seulement au mount

    // À la fermeture de la modale d'article scanné : reprendre la caméra et ré-armer le garde
    // (sinon la vidéo reste figée après un scan et l'utilisateur est bloqué).
    useEffect(() => {
      if (!showScannedModal && isScanning && streamRef.current && !loopRef.current) {
        handledRef.current = false;
        loopRef.current = setTimeout(tick, 120); // reprend le décodage après fermeture de la modale
      }
    }, [showScannedModal]); // eslint-disable-line react-hooks/exhaustive-deps

    // Recherche manuelle
    const handleManualSearch = () => {
      const item = items.find(i => i.code === scannedCode || i.name.toLowerCase().includes(scannedCode.toLowerCase()));
      if (item) {
        setScannedItem(item);
        setAdjustmentQuantity(0);
      } else {
        notify(t('scanner.itemNotFound'), 'error');
      }
    };

    // Confirmer l'inventaire (quantité OK)
    const handleConfirmInventory = () => {
      if (!scannedItem) return;
      notify(`${t('scanner.inventoryConfirmed')}: ${scannedItem.name} — ${scannedItem.quantity} ${scannedItem.unit || (language === 'fr' ? 'unités' : 'units')}`);
      resetScanner();
    };

    // Ajuster la quantité
    const handleAdjustQuantity = () => {
      if (!scannedItem || adjustmentQuantity === 0) return;

      // Vérifier que l'utilisateur est identifié
      if (!scannerUser || scannerUser.trim() === '') {
        notify(language === 'fr' ? 'Veuillez vous identifier avant d\'effectuer un mouvement' : 'Please identify yourself before making a movement', 'error');
        return;
      }

      // RAISON OBLIGATOIRE pour TOUT mouvement (entrée ET sortie) : projet OU code interne.
      if (withdrawalType === 'project') {
        if (!projectCode || projectCode.trim() === '') {
          notify(language === 'fr' ? 'Sélectionne un projet (raison obligatoire)' : 'Select a project (reason required)', 'error');
          return;
        }
      } else {
        if (!reasonCodeSel) {
          notify(language === 'fr' ? 'Sélectionne un code interne (raison obligatoire)' : 'Select an internal code (reason required)', 'error');
          return;
        }
      }

      const movementType = adjustmentQuantity < 0 ? 'exit' : 'entry';
      const action = adjustmentQuantity < 0 ? (language === 'fr' ? 'Retrait' : 'Out') : (language === 'fr' ? 'Ajout' : 'In');
      let reason = '';
      if (withdrawalType === 'project') {
        reason = `${action} — Projet ${projectCode}`;
      } else {
        const rc = reasonCodes.find(x => x.code === reasonCodeSel);
        reason = `${action} — Code ${reasonCodeSel}${rc?.label ? ` (${rc.label})` : ''}`;
      }

      const result = updateQuantity(
        scannedItem.id,
        adjustmentQuantity,
        movementType,
        reason,
        scannedItem.scannedDepartmentCode, // Code de département scanné
        projectCode || null, // Numéro de projet
        scannerUser // Utilisateur qui effectue l'opération
      );

      if (result && result.success) {
        const locationInfo = result.location ? ` (${result.location})` : '';
        const projectInfo = projectCode ? ` - ${projectCode}` : '';
        const typeInfo = withdrawalType === 'internal' && adjustmentQuantity < 0 ? ' (Consommation interne)' : '';
        notify(`${t('scanner.quantityAdjusted')}: ${adjustmentQuantity > 0 ? '+' : ''}${adjustmentQuantity}${locationInfo}${projectInfo}${typeInfo}`);
        resetScanner();
      }
    };

    // Confirmer l'inventaire physique (mode inventaire)
    const handleInventoryCount = () => {
      if (!scannedItem || physicalCount === '') return;

      // Vérifier que l'utilisateur est identifié
      if (!scannerUser || scannerUser.trim() === '') {
        notify(language === 'fr' ? 'Veuillez vous identifier avant d\'effectuer un contrôle d\'inventaire' : 'Please identify yourself before an inventory count', 'error');
        return;
      }

      const countedQuantity = parseInt(physicalCount);
      if (isNaN(countedQuantity) || countedQuantity < 0) {
        notify(language === 'fr' ? 'Veuillez entrer une quantité valide' : 'Please enter a valid quantity', 'error');
        return;
      }

      const currentQuantity = scannedItem.quantity;
      const difference = countedQuantity - currentQuantity;

      // Horodate le comptage physique sur l'article (alimente le COMPTAGE CYCLIQUE de l'analytique).
      updateItem(scannedItem.id, { lastCountedAt: new Date().toISOString() });

      // Enregistrer le scan dans le mode inventaire global si actif
      if (globalInventoryMode.active) {
        const scanRecord = {
          id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
          itemId: scannedItem.id,
          itemName: scannedItem.name,
          itemCode: scannedItem.code,
          itemUnit: scannedItem.unit || 'unités',
          countedQty: countedQuantity,
          systemQty: currentQuantity,
          difference: difference,
          userId: currentUser?.id || 'unknown',
          userName: scannerUser,
          timestamp: new Date().toISOString(),
          departmentId: scannedItem.departmentId || null,
          departmentName: departments.find(d => d.id === scannedItem.departmentId)?.name || 'N/A',
          location: scannedItem.location || 'N/A'
        };

        setGlobalInventoryMode(prev => ({
          ...prev,
          scans: [...prev.scans, scanRecord]
        }));
      }

      if (difference === 0) {
        notify(language === 'fr' ? `Inventaire confirmé : ${countedQuantity} ${scannedItem.unit || 'unités'} — aucun ajustement nécessaire.` : `Inventory confirmed: ${countedQuantity} ${scannedItem.unit || 'units'} — no adjustment needed.`);
        resetScanner();
        return;
      }

      const movementType = difference > 0 ? 'entry' : 'exit';
      const reason = `Contrôle inventaire: ${currentQuantity} → ${countedQuantity} (${difference > 0 ? '+' : ''}${difference})`;

      const result = updateQuantity(
        scannedItem.id,
        difference,
        'adjustment',
        reason,
        scannedItem.scannedDepartmentCode,
        null, // Pas de code projet pour inventaire
        scannerUser
      );

      if (result && result.success) {
        const locationInfo = result.location ? ` (${result.location})` : '';
        notify(language === 'fr'
          ? `Inventaire ajusté${locationInfo} — Système : ${currentQuantity} · Compté : ${countedQuantity} · Ajustement : ${difference > 0 ? '+' : ''}${difference}`
          : `Inventory adjusted${locationInfo} — System: ${currentQuantity} · Counted: ${countedQuantity} · Adjustment: ${difference > 0 ? '+' : ''}${difference}`);
        resetScanner();
      }
    };

    // Réinitialiser le scanner
    const resetScanner = () => {
      setScannedItem(null);
      setAdjustmentQuantity(0);
      setPhysicalCount('');
      setScannedCode('');
      setProjectCode('');
      setWithdrawalType('project'); // Reset au type par défaut
      // Note: on ne reset PAS scannerUser et scannerMode - restent constants durant la session
    };

    // Nettoyer le scanner au démontage
    useEffect(() => {
      return () => {
        stopScanning();
      };
    }, []);

    return (
      // Pas de wrapper p-6 : on colle au conteneur (plein largeur) comme les autres onglets.
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">{t('scanner.title')}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('scanner.scanQRCode')}</p>
        </div>

        {/* Identification de l'utilisateur */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-lg p-6 border-2 border-blue-300 dark:border-blue-700">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <User size={24} className="text-white" />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {t('scanner.userIdentity')} <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={scannerUser}
                onChange={(e) => setScannerUser(e.target.value)}
                className="w-full px-4 py-3 border-2 border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold text-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600"
                placeholder={t('scanner.enterFullName')}
                required
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {t('scanner.allMovementsAssociated')}
              </p>
            </div>
          </div>
        </div>

        {/* Alerte Mode Inventaire Actif */}
        {globalInventoryMode.active && (
          <div className="bg-orange-50 dark:bg-orange-900/30 border-2 border-orange-500 dark:border-orange-600 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-500 rounded-lg flex-shrink-0">
                <AlertTriangle size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-orange-900 dark:text-orange-200 mb-2">
                  {t('scanner.inventoryModeActive')}
                </h3>
                <p className="text-sm text-orange-800 dark:text-orange-300 mb-2">
                  {t('scanner.inventoryModeActiveMessage').replace('{department}', globalInventoryMode.departmentName)}
                </p>
                <div className="text-xs text-orange-700 dark:text-orange-400">
                  <p><strong>{t('administration.inventoryMode.startedBy')}:</strong> {globalInventoryMode.startedByName}</p>
                  <p><strong>{t('administration.inventoryMode.scansRecorded')}:</strong> {globalInventoryMode.scans.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sélecteur de mode */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('scanner.scanMode')}</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                if (globalInventoryMode.active) {
                  notify(t('scanner.movementModeBlocked').replace('{department}', globalInventoryMode.departmentName), 'error');
                } else {
                  setScannerMode('movement');
                }
              }}
              disabled={globalInventoryMode.active}
              className={`flex flex-col items-center gap-2 px-6 py-4 rounded-lg border-2 transition-all ${
                globalInventoryMode.active
                  ? 'bg-gray-200 dark:bg-gray-800 border-gray-400 dark:border-gray-600 opacity-50 cursor-not-allowed'
                  : scannerMode === 'movement'
                  ? 'bg-orange-50 dark:bg-orange-900/30 border-orange-500 dark:border-orange-600'
                  : 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:border-orange-400'
              }`}
            >
              <div className={`p-3 rounded-lg ${
                globalInventoryMode.active
                  ? 'bg-gray-400 dark:bg-gray-700 text-gray-500'
                  : scannerMode === 'movement'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                <TrendingUp size={24} />
              </div>
              <div className="text-center">
                <p className={`font-bold ${
                  globalInventoryMode.active
                    ? 'text-gray-500 dark:text-gray-500'
                    : scannerMode === 'movement'
                    ? 'text-orange-700 dark:text-orange-300'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {t('scanner.movementMode')}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {globalInventoryMode.active ? t('scanner.blocked') : t('scanner.adjustmentIncrement')}
                </p>
              </div>
            </button>
            <button
              onClick={() => setScannerMode('inventory')}
              className={`flex flex-col items-center gap-2 px-6 py-4 rounded-lg border-2 transition-all ${
                scannerMode === 'inventory'
                  ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-500 dark:border-purple-600'
                  : 'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:border-purple-400'
              }`}
            >
              <div className={`p-3 rounded-lg ${
                scannerMode === 'inventory'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                <CheckCircle size={24} />
              </div>
              <div className="text-center">
                <p className={`font-bold ${
                  scannerMode === 'inventory'
                    ? 'text-purple-700 dark:text-purple-300'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {t('scanner.inventoryMode')}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {t('scanner.physicalControl')}
                </p>
              </div>
            </button>
          </div>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {scannerMode === 'movement' ? (
                <>
                  <strong>{t('scanner.movementMode')}:</strong> {t('scanner.movementModeDescription')}
                </>
              ) : (
                <>
                  <strong>{t('scanner.inventoryMode')}:</strong> {t('scanner.inventoryModeDescription')}
                </>
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="mb-4">
              <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                <ScanLine size={22} className="text-orange-500" /> {t('scanner.scanQRCode')}
              </h2>

              {/* ===== SCAN VIA LA CAMÉRA DE L'APPAREIL (photo) — fiable sur étiquettes imprimées =====
                  L'ancienne caméra live (autofocus déficient sur petites étiquettes) est retirée :
                  on ouvre directement la caméra native de l'appareil, qui fait le focus correctement. */}
              <div className="mt-3 rounded-xl border-2 border-dashed border-orange-300 dark:border-orange-700 bg-orange-50/60 dark:bg-orange-900/10 p-6 text-center">
                <QrCode size={42} className="mx-auto text-orange-400" />
                <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {language === 'fr' ? "Ouvre la caméra de ton appareil et photographie le QR de l'étiquette." : 'Open your device camera and take a photo of the label QR.'}
                </p>
                <button onClick={() => photoInputRef.current?.click()} className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-base font-bold text-white shadow-lg hover:bg-orange-600 active:scale-95 transition-all">
                  <Camera size={20} /> {language === 'fr' ? 'Ouvrir la caméra' : 'Open camera'}
                </button>
                <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-400">
                  {language === 'fr' ? "Astuce : la caméra native de ton téléphone lit aussi ce QR directement (elle ouvre la fiche du produit)." : "Tip: your phone's native camera also reads this QR directly (opens the product sheet)."}
                </p>
              </div>
            </div>
            <input ref={photoInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => { scanFromPhoto(e.target.files?.[0]); e.currentTarget.value = ''; }} />
            <canvas ref={canvasRef} className="hidden" />

            {scannerError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 rounded">
                <p className="text-sm text-red-900 dark:text-red-400 whitespace-pre-line">{scannerError}</p>
              </div>
            )}

            {/* Recherche manuelle */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                {t('scanner.enterQuantity')} {t('articles.code')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  value={scannedCode}
                  onChange={(e) => setScannedCode(e.target.value)}
                  placeholder={t('articles.searchArticles')}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                />
                <Button variant="primary" icon={Search} onClick={handleManualSearch}>
                  {t('actions.search')}
                </Button>
              </div>
            </div>

            {/* Informations article scanné et ajustement */}
            {scannedItem && (
              <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800 space-y-4">
                {/* En-tête article */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {scannedItem.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Code: {scannedItem.code}
                    </p>
                  </div>
                  <button
                    onClick={resetScanner}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Inventaire actuel */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('articles.currentInventory')}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {scannedItem.quantity}
                    </span>
                    <span className="text-lg text-gray-600 dark:text-gray-400">
                      {scannedItem.unit || 'unités'}
                    </span>
                  </div>
                  {scannedItem.location && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin size={14} />
                      <span>{scannedItem.location}</span>
                    </div>
                  )}
                </div>

                {/* Mode Mouvement: Contrôles d'ajustement */}
                {scannerMode === 'movement' && (
                  <>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {t('scanner.adjustQuantity')}
                      </p>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <button
                          onClick={() => setAdjustmentQuantity(Math.max(-scannedItem.quantity, adjustmentQuantity - 1))}
                          className="p-2 sm:p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex-shrink-0"
                        >
                          <Minus size={20} className="sm:w-6 sm:h-6" />
                        </button>
                        <input
                          type="number"
                          value={adjustmentQuantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setAdjustmentQuantity(Math.max(-scannedItem.quantity, val));
                          }}
                          className="flex-1 min-w-0 text-center text-2xl sm:text-3xl font-bold bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg py-2 sm:py-3 focus:outline-none focus:border-slate-600"
                        />
                        <button
                          onClick={() => setAdjustmentQuantity(adjustmentQuantity + 1)}
                          className="p-2 sm:p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex-shrink-0"
                        >
                          <Plus size={20} className="sm:w-6 sm:h-6" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                        {t('scanner.newQuantityLabel')}: <span className="font-bold">{scannedItem.quantity + adjustmentQuantity}</span> {scannedItem.unit || 'unités'}
                      </p>
                    </div>

                    {/* Type de retrait et Numéro de projet - OBLIGATOIRE pour les retraits */}
                    {/* RAISON OBLIGATOIRE pour TOUT mouvement (entrée ET sortie) : Projet ou Code interne. */}
                    {adjustmentQuantity !== 0 && (
                      <div className="space-y-3">
                        <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-400 dark:border-purple-600 rounded-lg p-4">
                          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                            {language === 'fr' ? 'Raison du mouvement' : 'Movement reason'} <span className="text-red-600">*</span>
                          </label>
                          <select
                            value={withdrawalType}
                            onChange={(e) => { setWithdrawalType(e.target.value); setProjectCode(''); setReasonCodeSel(''); }}
                            className="w-full px-4 py-3 border-2 border-purple-400 dark:border-purple-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold text-lg focus:outline-none focus:border-purple-600"
                          >
                            <option value="project">{language === 'fr' ? 'Projet / soumission' : 'Project / quote'}</option>
                            <option value="internal">{language === 'fr' ? 'Code interne' : 'Internal code'}</option>
                          </select>
                        </div>

                        {withdrawalType === 'project' ? (
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-4">
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">{language === 'fr' ? 'Projet (n° + soumission)' : 'Project (# + quote)'} <span className="text-red-600">*</span></label>
                            <select value={projectCode} onChange={(e) => setProjectCode(e.target.value)} className="w-full px-4 py-2 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base focus:outline-none focus:border-yellow-600">
                              <option value="">{language === 'fr' ? '— Choisir un projet —' : '— Select a project —'}</option>
                              {projectsList.map(p => <option key={p.project_number} value={p.project_number}>{p.project_number}{p.title ? ` — ${p.title}` : ''}{p.submission_number ? ` (soum. ${p.submission_number})` : ''}</option>)}
                            </select>
                            {projectsList.length === 0 && <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">{language === 'fr' ? 'Aucun projet — crée un projet, ou utilise un code interne.' : 'No project — create one, or use an internal code.'}</p>}
                          </div>
                        ) : (
                          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400 dark:border-blue-600 rounded-lg p-4">
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">{language === 'fr' ? 'Code interne' : 'Internal code'} <span className="text-red-600">*</span></label>
                            <select value={reasonCodeSel} onChange={(e) => setReasonCodeSel(e.target.value)} className="w-full px-4 py-2 border-2 border-blue-400 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base focus:outline-none focus:border-blue-600">
                              <option value="">{language === 'fr' ? '— Choisir un code —' : '— Select a code —'}</option>
                              {reasonCodes.map(c => <option key={c.id} value={c.code}>{c.code}{c.label ? ` — ${c.label}` : ''}</option>)}
                            </select>
                            {reasonCodes.length === 0 && <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">{language === 'fr' ? 'Aucun code interne — crée-en dans Administration → Codes internes.' : 'No internal code — create one in Administration → Internal codes.'}</p>}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Boutons d'action Mode Mouvement */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleConfirmInventory}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors shadow-md"
                      >
                        <CheckCircle size={20} />
                        OK
                      </button>
                      <button
                        onClick={handleAdjustQuantity}
                        disabled={adjustmentQuantity === 0}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors shadow-md ${
                          adjustmentQuantity === 0
                            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                            : 'bg-slate-700 hover:bg-slate-700 text-white'
                        }`}
                      >
                        <TrendingUp size={20} />
                        Ajuster
                      </button>
                    </div>
                  </>
                )}

                {/* Mode Inventaire: Contrôle physique */}
                {scannerMode === 'inventory' && (
                  <>
                    <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-400 dark:border-purple-600 rounded-lg p-4">
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        {t('scanner.physicalCountedQuantity')} <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        value={physicalCount}
                        onChange={(e) => setPhysicalCount(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-purple-400 dark:border-purple-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-2xl font-bold text-center focus:outline-none focus:border-purple-600"
                        placeholder="0"
                        min="0"
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                        {t('scanner.enterActualStockQuantity')}
                      </p>
                      {physicalCount !== '' && !isNaN(parseInt(physicalCount)) && (
                        <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded-lg border border-purple-300 dark:border-purple-700">
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {t('scanner.difference')}: {' '}
                            <span className={`font-bold ${
                              parseInt(physicalCount) - scannedItem.quantity > 0
                                ? 'text-green-600 dark:text-green-400'
                                : parseInt(physicalCount) - scannedItem.quantity < 0
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              {parseInt(physicalCount) - scannedItem.quantity > 0 ? '+' : ''}
                              {parseInt(physicalCount) - scannedItem.quantity}
                            </span>
                            {' '}{scannedItem.unit || 'unités'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Bouton Confirmer Inventaire */}
                    <button
                      onClick={handleInventoryCount}
                      disabled={physicalCount === ''}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors shadow-md ${
                        physicalCount === ''
                          ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                    >
                      <CheckCircle size={20} />
                      {t('scanner.confirmInventory')}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Historique des scans récents */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('movements.history')}</h2>

            <div className="space-y-3">
              {movements.slice(0, 8).map(movement => {
                const item = items.find(i => i.id === movement.itemId);
                return (
                  <div key={movement.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">{movement.itemName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{movement.reason}</p>
                        {movement.user && (
                          <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <User size={12} className="flex-shrink-0" />
                            <span>{language === 'fr' ? 'Par' : 'By'} <span className="font-semibold text-gray-700 dark:text-gray-300">{movement.user}</span></span>
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          movement.type === 'entry' ? 'bg-green-100 text-green-800' :
                          movement.type === 'exit' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {movement.type === 'entry' ? '+' : '-'}{movement.quantity}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(movement.timestamp || movement.date).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {movements.length === 0 && (
              <EmptyState
                icon={TrendingUp}
                title={t('movements.history')}
                message={t('dashboard.noMovementFound')}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  // ============== VUE: MOUVEMENTS ==============
  const MovementsView = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [filteredMovements, setFilteredMovements] = useState(movements);

    // Filtrer les mouvements selon tous les critères
    useEffect(() => {
      let filtered = [...movements];

      // Filtre par recherche textuelle
      if (searchQuery && searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(movement => {
          if (movement.projectCode && movement.projectCode.toLowerCase().includes(query)) return true;
          if (movement.itemName && movement.itemName.toLowerCase().includes(query)) return true;
          if (movement.reason && movement.reason.toLowerCase().includes(query)) return true;
          if (movement.department && movement.department.toLowerCase().includes(query)) return true;
          if (movement.user && movement.user.toLowerCase().includes(query)) return true;
          return false;
        });
      }

      // Filtre par type
      if (selectedType !== 'all') {
        filtered = filtered.filter(movement => movement.type === selectedType);
      }

      // Filtre par département
      if (selectedDepartment !== 'all') {
        filtered = filtered.filter(movement => movement.department === selectedDepartment);
      }

      // Filtre par plage de dates
      if (dateRange.start) {
        const startDate = new Date(dateRange.start);
        startDate.setHours(0, 0, 0, 0);
        filtered = filtered.filter(movement => new Date(movement.date || movement.timestamp) >= startDate);
      }
      if (dateRange.end) {
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter(movement => new Date(movement.date || movement.timestamp) <= endDate);
      }

      setFilteredMovements(filtered);
    }, [searchQuery, selectedType, selectedDepartment, dateRange, movements]);

    // Exporter vers Excel
    const exportToExcel = () => {
      const dataToExport = filteredMovements.map(movement => ({
        [t('movements.date')]: new Date(movement.date || movement.timestamp).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        [t('movements.type')]: t(`movements.types.${movement.type}`),
        [t('movements.article')]: movement.itemName,
        [t('movements.quantity')]: movement.quantity,
        [t('movements.user')]: movement.user,
        [t('common.department')]: movement.department || '-',
        [t('movements.projectCode')]: movement.projectCode || '-',
        [t('movements.reason')]: movement.reason
      }));

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, t('movements.movementsSheet'));

      const fileName = searchQuery
        ? `${t('movements.movementsFilename')}_${searchQuery}_${new Date().toLocaleDateString('fr-FR')}.xlsx`
        : `${t('movements.movementsFilename')}_${new Date().toLocaleDateString('fr-FR')}.xlsx`;

      XLSX.writeFile(wb, fileName);
    };

    // Imprimer
    const printReport = () => {
      const printWindow = window.open('', '_blank');
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${t('movements.reportTitle')}${searchQuery ? ` - ${searchQuery}` : ''}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; border-bottom: 2px solid #f97316; padding-bottom: 10px; }
            .meta { color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f97316; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .entry { color: #059669; font-weight: bold; }
            .exit { color: #dc2626; font-weight: bold; }
            .adjustment { color: #eab308; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>${t('movements.reportTitle')}${searchQuery ? ` - ${searchQuery}` : ''}</h1>
          <div class="meta">
            <p><strong>${t('movements.reportDate')}:</strong> ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            <p><strong>${t('movements.numberOfMovements')}:</strong> ${filteredMovements.length}</p>
            ${searchQuery ? `<p><strong>${t('movements.appliedFilter')}:</strong> ${searchQuery}</p>` : ''}
          </div>
          <table>
            <thead>
              <tr>
                <th>${t('movements.date')}</th>
                <th>${t('movements.type')}</th>
                <th>${t('movements.article')}</th>
                <th>${t('movements.quantity')}</th>
                <th>${t('movements.user')}</th>
                <th>${t('common.department')}</th>
                <th>${t('movements.projectCode')}</th>
                <th>${t('movements.reason')}</th>
              </tr>
            </thead>
            <tbody>
              ${filteredMovements.map(movement => `
                <tr>
                  <td>${new Date(movement.date || movement.timestamp).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td class="${movement.type}">${t(`movements.types.${movement.type}`)}</td>
                  <td>${movement.itemName}</td>
                  <td>${movement.quantity}</td>
                  <td>${movement.user}</td>
                  <td>${movement.department || '-'}</td>
                  <td>${movement.projectCode || '-'}</td>
                  <td>${movement.reason}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };

    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('movements.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t('movements.fullHistory')}</p>
        </div>

        {/* Barre de recherche, filtres et actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          {/* Recherche et actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            <div className="flex-1 w-full sm:max-w-md">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {t('movements.searchInMovements')}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder={t('movements.searchPlaceholder')}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                icon={RefreshCw}
                onClick={refreshFromCloud}
              >
                {language === 'fr' ? 'Actualiser' : 'Refresh'}
              </Button>
              <Button
                variant="secondary"
                icon={Printer}
                onClick={printReport}
                disabled={filteredMovements.length === 0}
              >
                {t('movements.print')}
              </Button>
              <Button
                variant="primary"
                icon={FileSpreadsheet}
                onClick={exportToExcel}
                disabled={filteredMovements.length === 0}
              >
                {t('movements.exportExcel')}
              </Button>
            </div>
          </div>

          {/* Filtres avancés */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={20} className="text-gray-600 dark:text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('movements.advancedFilters')}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtre par type */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('movements.movementType')}
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">{t('movements.allMovementTypes')}</option>
                  <option value="entry">{t('movements.entries')}</option>
                  <option value="exit">{t('movements.exits')}</option>
                  <option value="adjustment">{t('movements.adjustments')}</option>
                  <option value="transfer">{t('movements.transfers')}</option>
                </select>
              </div>

              {/* Filtre par département */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('common.department')}
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">{t('movements.allDepartmentsFilter')}</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date de début */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('movements.from')}
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Date de fin */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('movements.to')}
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Résumé des filtres actifs */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded text-xs">
                  <Search size={12} />
                  "{searchQuery}"
                </span>
              )}
              {selectedType !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded text-xs">
                  {t('movements.typeLabel')}: {t(`movements.types.${selectedType}`)}
                </span>
              )}
              {selectedDepartment !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded text-xs">
                  {t('movements.departmentLabel')}: {selectedDepartment}
                </span>
              )}
              {(dateRange.start || dateRange.end) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 rounded text-xs">
                  <Calendar size={12} />
                  {dateRange.start && new Date(dateRange.start).toLocaleDateString('fr-FR')}
                  {dateRange.start && dateRange.end && ' → '}
                  {dateRange.end && new Date(dateRange.end).toLocaleDateString('fr-FR')}
                </span>
              )}
              {filteredMovements.length !== movements.length && (
                <span className="text-xs text-gray-600 dark:text-gray-400 ml-auto">
                  {filteredMovements.length} {t('movements.ofLabel')} {movements.length} {t('movements.movementsLabel')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats mouvements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={TrendingUp}
            title={t('movements.totalEntries')}
            value={filteredMovements.filter(m => m.type === 'entry').length}
            color="green"
            subtitle={t('movements.entriesDescription')}
          />
          <StatCard
            icon={TrendingUp}
            title={t('movements.totalExits')}
            value={filteredMovements.filter(m => m.type === 'exit').length}
            color="red"
            subtitle={t('movements.exitsDescription')}
          />
          <StatCard
            icon={AlertTriangle}
            title={t('movements.totalAdjustments')}
            value={filteredMovements.filter(m => m.type === 'adjustment').length}
            color="yellow"
            subtitle={t('movements.adjustmentsDescription')}
          />
          <StatCard
            icon={Layers}
            title={t('movements.totalMovements')}
            value={filteredMovements.length}
            color="blue"
            subtitle={t('movements.allTypes')}
          />
        </div>

      {/* Historique */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('movements.history')}</h2>
        </div>

        {/* MOBILE (< lg) : liste de cartes — le tableau à 7 colonnes déborde sur téléphone. */}
        <div className="lg:hidden divide-y divide-gray-100 dark:divide-gray-700">
          {filteredMovements.map((movement) => (
            <div key={movement.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-900 dark:text-white">{movement.itemName}</p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {new Date(movement.date || movement.timestamp).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={`
                    inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${movement.type === 'entry' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                    ${movement.type === 'exit' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                    ${movement.type === 'adjustment' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                    ${movement.type === 'transfer' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                  `}>
                    {t(`movements.types.${movement.type}`)}
                  </span>
                  <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">{movement.quantity}</span>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <span className="truncate">{movement.user}</span>
                {movement.projectCode && (
                  <span className="inline-flex shrink-0 items-center rounded-md bg-purple-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                    {movement.projectCode}
                  </span>
                )}
              </div>
              {movement.reason && (
                <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">{movement.reason}</p>
              )}
            </div>
          ))}
        </div>

        {/* DESKTOP (lg+) : tableau complet, inchangé. */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-900 dark:text-white">{t('movements.date')}</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900 dark:text-white">{t('movements.type')}</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900 dark:text-white">{t('movements.article')}</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900 dark:text-white">{t('movements.quantity')}</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900 dark:text-white">{t('movements.user')}</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900 dark:text-white">Code Projet</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900 dark:text-white">{t('movements.reason')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredMovements.map((movement, index) => (
                <tr
                  key={movement.id}
                  className={`
                    ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}
                    hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors
                  `}
                >
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(movement.date || movement.timestamp).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${movement.type === 'entry' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                      ${movement.type === 'exit' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                      ${movement.type === 'adjustment' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                      ${movement.type === 'transfer' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                    `}>
                      {t(`movements.types.${movement.type}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{movement.itemName}</td>
                  <td className="px-6 py-4 font-mono text-gray-900 dark:text-white">{movement.quantity}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{movement.user}</td>
                  <td className="px-6 py-4">
                    {movement.projectCode ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 font-mono text-xs font-semibold">
                        {movement.projectCode}
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                    {movement.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMovements.length === 0 && (
          <div className="p-12 text-center">
            <Search size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'Aucun résultat trouvé' : t('dashboard.noMovement')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery ? `Aucun mouvement ne correspond à "${searchQuery}"` : t('messages.info.noData')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

  // ============== VUE: RAPPORTS ==============
  const ReportsView = () => (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('reports.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{t('reports.generateExport')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Génération */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('reports.generateReport')}</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {t('reports.reportType')}
              </label>
              <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all">
                <option>{t('reports.types.inventory')}</option>
                <option>{t('reports.types.movements')}</option>
                <option>{t('reports.types.valuation')}</option>
                <option>{t('reports.types.lowStock')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {t('reports.period')}
              </label>
              <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all">
                <option>{t('reports.periods.today')}</option>
                <option>{t('reports.periods.thisWeek')}</option>
                <option>{t('reports.periods.thisMonth')}</option>
                <option>{t('reports.periods.custom')}</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4">
              <Button variant="primary" icon={FileText} className="w-full">
                {t('reports.exportPDF')}
              </Button>
              <Button variant="success" icon={Download} className="w-full">
                {t('reports.exportExcel')}
              </Button>
            </div>
          </div>
        </div>

        {/* Valorisation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('reports.inventoryValue')}</h2>

          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl">
              <p className="text-sm text-red-800 dark:text-red-400 mb-1">{t('reports.totalCost')}</p>
              <p className="text-2xl sm:text-4xl font-bold text-red-900 dark:text-red-300">${dashboardStats.totalCostValue.toFixed(2)}</p>
            </div>

            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
              <p className="text-sm text-green-800 dark:text-green-400 mb-1">{t('reports.totalSale')}</p>
              <p className="text-2xl sm:text-4xl font-bold text-green-900 dark:text-green-300">${dashboardStats.totalSellValue.toFixed(2)}</p>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
              <p className="text-sm text-purple-800 dark:text-purple-400 mb-1">{t('reports.potentialProfit')}</p>
              <p className="text-2xl sm:text-4xl font-bold text-purple-900 dark:text-purple-300">${dashboardStats.margin.toFixed(2)}</p>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-2 font-semibold">
                +{dashboardStats.marginPercent.toFixed(1)}% marge
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl text-center">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('reports.itemCount')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardStats.total}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl text-center">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('reports.lowStockItems')}</p>
                <p className="text-2xl font-bold text-red-600">{dashboardStats.lowStock}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ============== VUE: ANALYTIQUE (réappro / ABC / dormant-rotation / comptage cyclique) ==============
  const AnalyticsView = () => {
    const a = inventoryAnalytics;
    const fr = language === 'fr';
    const money = (n) => '$' + (Number(n) || 0).toLocaleString(fr ? 'fr-CA' : 'en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const abcBadge = (cls) => (
      <span className={`inline-flex h-5 w-5 items-center justify-center rounded text-[11px] font-bold ${cls === 'A' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : cls === 'B' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>{cls}</span>
    );
    const deadValue = a.dead.reduce((s, d) => s + d.value, 0);

    const exportReorder = () => {
      if (!a.reorder.length) return;
      const rows = a.reorder.map(r => ({
        [fr ? 'Code' : 'Code']: r.code,
        [fr ? 'Article' : 'Item']: r.name,
        ABC: r.abc,
        [fr ? 'Succursale' : 'Branch']: r.department,
        [fr ? 'Stock' : 'Stock']: r.qty,
        Min: r.min, Max: r.max,
        [fr ? 'À commander' : 'To order']: r.suggested,
        [fr ? 'Unité' : 'Unit']: r.unit,
      }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), fr ? 'A_commander' : 'To_order');
      XLSX.writeFile(wb, `C-Secur360_Reappro_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const Card = ({ icon: Icon, color, title, value, sub }) => (
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg p-2 ${color}`}><Icon size={20} className="text-white" /></div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
            {sub && <p className="truncate text-[11px] text-gray-400">{sub}</p>}
          </div>
        </div>
      </div>
    );

    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{fr ? 'Analytique & réappro' : 'Analytics & replenishment'}</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">{fr ? 'Méthode Min/Max, classification ABC, stock dormant, comptage cyclique.' : 'Min/Max method, ABC classification, dead stock, cycle counting.'}</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card icon={DollarSign} color="bg-blue-600" title={fr ? 'Valeur du stock' : 'Stock value'} value={money(a.totalValue)} sub={`A:${a.abcCounts.A} · B:${a.abcCounts.B} · C:${a.abcCounts.C}`} />
          <Card icon={ShoppingCart} color="bg-orange-500" title={fr ? 'À commander' : 'To reorder'} value={a.reorder.length} sub={fr ? 'lignes sous le seuil min' : 'lines below min'} />
          <Card icon={Clock} color="bg-slate-600" title={fr ? 'Stock dormant' : 'Dead stock'} value={a.dead.length} sub={`${money(deadValue)} · ${fr ? `sans sortie >${a.deadDays}j` : `no exit >${a.deadDays}d`}`} />
          <Card icon={CheckCircle} color="bg-purple-600" title={fr ? 'Comptages dûs' : 'Counts due'} value={a.cycleDue.length} sub={fr ? 'selon classe ABC' : 'per ABC class'} />
        </div>

        {/* À COMMANDER */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 dark:border-gray-700">
            <h2 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white"><ShoppingCart size={18} className="text-orange-500" /> {fr ? 'À commander' : 'To reorder'} <span className="text-sm font-normal text-gray-400">({a.reorder.length})</span></h2>
            <button onClick={exportReorder} disabled={!a.reorder.length} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"><FileSpreadsheet size={15} /> {fr ? 'Exporter' : 'Export'}</button>
          </div>
          {a.reorder.length ? (
            <div className="max-h-80 overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 text-left text-xs uppercase text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                  <tr><th className="px-3 py-2">{fr ? 'Article' : 'Item'}</th><th className="px-3 py-2">{fr ? 'Succursale' : 'Branch'}</th><th className="px-3 py-2 text-right">{fr ? 'Stock' : 'Stock'}</th><th className="px-3 py-2 text-right">Min</th><th className="px-3 py-2 text-right">{fr ? 'À cmder' : 'Order'}</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {a.reorder.map((r, i) => (
                    <tr key={`${r.id}-${i}`} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                      <td className="px-3 py-2"><div className="flex items-center gap-2">{abcBadge(r.abc)}<div className="min-w-0"><div className="truncate font-semibold text-gray-900 dark:text-white">{r.name}</div><div className="font-mono text-[11px] text-gray-400">{r.code}</div></div></div></td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{r.department}</td>
                      <td className="px-3 py-2 text-right font-semibold text-red-600">{r.qty}</td>
                      <td className="px-3 py-2 text-right text-gray-400">{r.min}</td>
                      <td className="px-3 py-2 text-right font-bold text-orange-600">+{r.suggested} <span className="text-[10px] font-normal text-gray-400">{r.unit}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="px-4 py-6 text-center text-sm text-gray-400">{fr ? 'Aucun article sous son seuil minimal. ✅' : 'No item below its minimum. ✅'}</p>}
        </div>

        {/* STOCK DORMANT + ROTATION */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-700">
            <h2 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white"><Clock size={18} className="text-slate-500" /> {fr ? 'Stock dormant & rotation' : 'Dead stock & turnover'} <span className="text-sm font-normal text-gray-400">({a.dead.length})</span></h2>
            <p className="text-[11px] text-gray-400">{fr ? `Sans sortie depuis plus de ${a.deadDays} jours. Rotation = sorties sur 365 j / stock.` : `No exit for over ${a.deadDays} days. Turnover = 365-day exits / stock.`}</p>
          </div>
          {a.dead.length ? (
            <div className="max-h-72 overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 text-left text-xs uppercase text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                  <tr><th className="px-3 py-2">{fr ? 'Article' : 'Item'}</th><th className="px-3 py-2 text-right">{fr ? 'Stock' : 'Stock'}</th><th className="px-3 py-2 text-right">{fr ? 'Valeur' : 'Value'}</th><th className="px-3 py-2 text-right">{fr ? 'Dernière sortie' : 'Last exit'}</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {a.dead.slice(0, 100).map(d => (
                    <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                      <td className="px-3 py-2"><div className="truncate font-semibold text-gray-900 dark:text-white">{d.name}</div><div className="font-mono text-[11px] text-gray-400">{d.code}</div></td>
                      <td className="px-3 py-2 text-right text-gray-700 dark:text-gray-200">{d.qty} <span className="text-[10px] text-gray-400">{d.unit}</span></td>
                      <td className="px-3 py-2 text-right font-semibold text-gray-900 dark:text-white">{money(d.value)}</td>
                      <td className="px-3 py-2 text-right text-gray-500">{d.daysSince == null ? (fr ? 'jamais' : 'never') : (fr ? `il y a ${d.daysSince} j` : `${d.daysSince}d ago`)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="px-4 py-6 text-center text-sm text-gray-400">{fr ? 'Aucun stock dormant. ✅' : 'No dead stock. ✅'}</p>}
        </div>

        {/* COMPTAGE CYCLIQUE */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-700">
            <h2 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white"><CheckCircle size={18} className="text-purple-500" /> {fr ? 'Comptage cyclique dû' : 'Cycle count due'} <span className="text-sm font-normal text-gray-400">({a.cycleDue.length})</span></h2>
            <p className="text-[11px] text-gray-400">{fr ? 'Fréquence par classe : A = 7 j, B = 30 j, C = 90 j. Compte un article (mode Inventaire du scanner) pour le sortir de la liste.' : 'Frequency per class: A = 7d, B = 30d, C = 90d. Count an item (scanner Inventory mode) to clear it.'}</p>
          </div>
          {a.cycleDue.length ? (
            <div className="max-h-72 overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 text-left text-xs uppercase text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                  <tr><th className="px-3 py-2">{fr ? 'Article' : 'Item'}</th><th className="px-3 py-2 text-center">ABC</th><th className="px-3 py-2 text-right">{fr ? 'Dernier comptage' : 'Last count'}</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {a.cycleDue.slice(0, 150).map(c => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                      <td className="px-3 py-2"><div className="truncate font-semibold text-gray-900 dark:text-white">{c.name}</div><div className="font-mono text-[11px] text-gray-400">{c.code}</div></td>
                      <td className="px-3 py-2 text-center">{abcBadge(c.abc)}</td>
                      <td className="px-3 py-2 text-right text-gray-500">{c.lastCountedAt ? (fr ? `il y a ${c.daysSince} j` : `${c.daysSince}d ago`) : (fr ? 'jamais' : 'never')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="px-4 py-6 text-center text-sm text-gray-400">{fr ? 'Tous les comptages sont à jour. ✅' : 'All counts up to date. ✅'}</p>}
        </div>
      </div>
    );
  };

  // ============== VUE: ALERTES ==============
  const AlertsView = () => {
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [selectedSupplier, setSelectedSupplier] = useState('all');
    const [selectedItems, setSelectedItems] = useState([]);
    // Quantité à commander AJUSTABLE manuellement (sinon défaut = max − stock).
    const [orderQty, setOrderQty] = useState({}); // { itemId: number }
    const [poWithPrices, setPoWithPrices] = useState(false); // bon de commande : inclure les prix ? (défaut non)
    const suggestedQty = (item) => Math.max((Number(item.maxQuantity) || 0) - (Number(item.quantity) || 0), 0);
    const getOrderQty = (item) => {
      const v = orderQty[item.id];
      return v === undefined || v === '' ? suggestedQty(item) : Math.max(0, Math.round(Number(v) || 0));
    };

    // Get alerts (items with low stock)
    const alerts = items.filter(item => item.quantity <= item.minQuantity);

    // Apply filters
    const filteredAlerts = alerts.filter(item => {
      if (selectedDepartment !== 'all' && item.department !== selectedDepartment) return false;
      if (selectedSupplier !== 'all' && item.supplier !== selectedSupplier) return false;
      return true;
    });

    // Get unique suppliers from alerts
    const suppliers = [...new Set(alerts.map(item => item.supplier).filter(Boolean))];

    // Group alerts by department
    const alertsByDepartment = {};
    filteredAlerts.forEach(item => {
      if (!alertsByDepartment[item.department]) {
        alertsByDepartment[item.department] = [];
      }
      alertsByDepartment[item.department].push(item);
    });

    // Group alerts by supplier
    const alertsBySupplier = {};
    filteredAlerts.forEach(item => {
      const supplier = item.supplier || t('common.notSpecified');
      if (!alertsBySupplier[supplier]) {
        alertsBySupplier[supplier] = [];
      }
      alertsBySupplier[supplier].push(item);
    });

    // Toggle item selection
    const toggleItemSelection = (itemId) => {
      setSelectedItems(prev =>
        prev.includes(itemId)
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    };

    // Select all items in view
    const selectAll = () => {
      setSelectedItems(filteredAlerts.map(item => item.id));
    };

    // Deselect all
    const deselectAll = () => {
      setSelectedItems([]);
    };

    // Generate order (placeholder function)
    const generateOrder = () => {
      if (selectedItems.length === 0) {
        notify(t('messages.error.selectAtLeastOne'), 'error');
        return;
      }

      const selectedAlerts = items.filter(item => selectedItems.includes(item.id));
      let orderText = `=== ${t('reports.purchaseOrder')} ===\n\n`;
      orderText += `${t('common.dateWith')} ${new Date().toLocaleDateString('fr-FR')}\n\n`;

      // Group by supplier
      const orderBySupplier = {};
      selectedAlerts.forEach(item => {
        const supplier = item.supplier || t('common.notSpecified');
        if (!orderBySupplier[supplier]) {
          orderBySupplier[supplier] = [];
        }
        orderBySupplier[supplier].push(item);
      });

      Object.entries(orderBySupplier).forEach(([supplier, items]) => {
        orderText += `\n${t('reports.supplierLabel')} ${supplier}\n`;
        orderText += '─────────────────────────────────\n';
        items.forEach(item => {
          const qtyToOrder = getOrderQty(item);
          orderText += `${item.name}\n`;
          orderText += `  ${t('common.codeWith')} ${item.code}\n`;
          orderText += `  ${t('common.department')}: ${item.department}\n`;
          orderText += `  ${t('common.currentQuantity')}: ${item.quantity}\n`;
          orderText += `  ${t('common.quantityToOrder')}: ${qtyToOrder}\n`;
          orderText += `  ${t('common.unitPrice')}: $${item.costPrice}\n`;
          orderText += `  ${t('reports.subtotal')}: $${(qtyToOrder * item.costPrice).toFixed(2)}\n\n`;
        });
      });

      // Copy to clipboard
      navigator.clipboard.writeText(orderText);
      notify(language === 'fr' ? `Commande générée pour ${selectedItems.length} article(s) et copiée dans le presse-papier` : `Order generated for ${selectedItems.length} item(s) and copied to clipboard`);
      deselectAll();
    };

    // Send order by email to supplier (without internal Ebeda codes)
    const sendOrderEmail = () => {
      if (selectedItems.length === 0) {
        notify(t('messages.error.selectAtLeastOne'), 'error');
        return;
      }

      const selectedAlerts = items.filter(item => selectedItems.includes(item.id));

      // Group by supplier
      const orderBySupplier = {};
      selectedAlerts.forEach(item => {
        const supplier = item.supplier || t('common.notSpecified');
        const supplierEmail = item.supplierEmail || '';
        if (!orderBySupplier[supplier]) {
          orderBySupplier[supplier] = { email: supplierEmail, items: [] };
        }
        orderBySupplier[supplier].items.push(item);
      });

      // Process each supplier
      Object.entries(orderBySupplier).forEach(([supplier, data]) => {
        const { email, items: supplierItems } = data;

        if (!email) {
          notify(`${t('alerts.noSupplierEmail')}: ${supplier}\n${t('alerts.pleaseAddEmail')}`, 'error');
          return;
        }

        // Generate order email body (WITHOUT internal codes)
        let emailBody = `${t('reports.purchaseOrder')}\n\n`;
        emailBody += `${t('common.date')}: ${new Date().toLocaleDateString('fr-FR')}\n`;
        emailBody += `${t('articles.supplier')}: ${supplier}\n\n`;
        emailBody += `${t('alerts.orderItems')}:\n`;
        emailBody += `${'='.repeat(50)}\n\n`;

        let totalOrder = 0;

        supplierItems.forEach((item, index) => {
          const qtyToOrder = getOrderQty(item);
          const subtotal = qtyToOrder * item.costPrice;
          totalOrder += subtotal;

          emailBody += `${index + 1}. ${item.name}\n`;
          // NO CODE EBEDA - Only essential info for supplier
          if (item.description) emailBody += `   ${t('articles.description')}: ${item.description}\n`;
          emailBody += `   ${t('common.quantity')}: ${qtyToOrder} ${item.unit || t('common.units')}\n`;
          emailBody += `   ${t('common.unitPrice')}: $${item.costPrice.toFixed(2)}\n`;
          emailBody += `   ${t('reports.subtotal')}: $${subtotal.toFixed(2)}\n\n`;
        });

        emailBody += `${'='.repeat(50)}\n`;
        emailBody += `${t('reports.totalOrder')}: $${totalOrder.toFixed(2)}\n\n`;
        emailBody += `${t('alerts.thankYou')}\n`;
        emailBody += `C-Secur360`;

        // Create mailto link
        const subject = `${t('reports.purchaseOrder')} - ${new Date().toLocaleDateString('fr-FR')}`;
        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

        // Open email client
        window.location.href = mailtoLink;
      });

      deselectAll();
    };

    // BON DE COMMANDE PDF (impression -> "Enregistrer en PDF"). Groupé par fournisseur, avec
    // description + quantité à commander (ajustée), prix, sous-total par fournisseur et total.
    // Prêt à envoyer au fournisseur.
    const printPurchaseOrder = () => {
      const selected = selectedItems.length ? items.filter(i => selectedItems.includes(i.id)) : filteredAlerts;
      if (!selected.length) { notify(language === 'fr' ? 'Aucun article à commander (sélectionne ou ajuste les filtres).' : 'No item to order.', 'error'); return; }
      const fr = language === 'fr';
      const L = {
        title: fr ? 'Bon de commande' : 'Purchase order', date: fr ? 'Date' : 'Date',
        suppliers: fr ? 'fournisseur(s)' : 'supplier(s)', grand: fr ? 'Total général' : 'Grand total',
        num: '#', item: fr ? 'Article' : 'Item', desc: fr ? 'Description' : 'Description',
        qty: fr ? 'Qté à commander' : 'Qty to order', price: fr ? 'Prix unitaire' : 'Unit price',
        sub: fr ? 'Sous-total' : 'Subtotal', total: fr ? 'Total' : 'Total',
        unspec: fr ? 'Fournisseur non spécifié' : 'Unspecified supplier',
      };
      const esc = (x) => String(x ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
      const dateStr = new Date().toLocaleDateString(fr ? 'fr-CA' : 'en-CA', { day: '2-digit', month: 'long', year: 'numeric' });
      const bySupplier = {};
      selected.forEach(it => { const s = (it.supplier || '').trim() || L.unspec; (bySupplier[s] = bySupplier[s] || []).push(it); });
      // PRIX OPTIONNELS : par défaut on n'imprime QUE les quantités à commander (les prix peuvent
      // être périmés). L'utilisateur peut cocher « Inclure les prix » pour les ajouter.
      const wp = poWithPrices;
      let grand = 0, body = '';
      Object.entries(bySupplier).forEach(([supplier, list]) => {
        const email = (list.find(i => i.supplierEmail)?.supplierEmail) || '';
        let st = 0;
        const rows = list.map((it, i) => {
          const q = getOrderQty(it); const sub = q * (Number(it.costPrice) || 0); st += sub;
          const priceCells = wp ? `<td class="r">$${(Number(it.costPrice) || 0).toFixed(2)}</td><td class="r">$${sub.toFixed(2)}</td>` : '';
          return `<tr><td>${i + 1}</td><td><b>${esc(it.name)}</b><br><span class="muted">${esc(it.code)}</span></td><td>${esc(it.description || '')}</td><td class="r">${q} ${esc(it.unit || '')}</td>${priceCells}</tr>`;
        }).join('');
        grand += st;
        const headPrice = wp ? `<th class="r">${L.price}</th><th class="r">${L.sub}</th>` : '';
        const footRow = wp ? `<tfoot><tr><td colspan="5" class="r"><b>${L.total} — ${esc(supplier)}</b></td><td class="r"><b>$${st.toFixed(2)}</b></td></tr></tfoot>` : '';
        body += `<div class="po"><h2>${L.title} — ${esc(supplier)}</h2>${email ? `<p class="muted">${esc(email)}</p>` : ''}<table><thead><tr><th>${L.num}</th><th>${L.item}</th><th>${L.desc}</th><th class="r">${L.qty}</th>${headPrice}</tr></thead><tbody>${rows}</tbody>${footRow}</table></div>`;
      });
      const w = window.open('', '_blank');
      if (!w) { notify(fr ? 'Autorise les fenêtres pop-up pour imprimer.' : 'Allow pop-ups to print.', 'error'); return; }
      w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${L.title} ${dateStr}</title><style>
        body{font-family:Arial,sans-serif;padding:24px;color:#222}
        h1{color:#0D1F3C;border-bottom:3px solid #f97316;padding-bottom:8px}
        .meta{color:#555;margin-bottom:16px}
        .po{margin-bottom:26px;page-break-inside:avoid}
        h2{color:#0D1F3C;font-size:15px;margin:14px 0 6px}
        table{width:100%;border-collapse:collapse;font-size:12px}
        th,td{border:1px solid #ddd;padding:7px;text-align:left;vertical-align:top}
        th{background:#0D1F3C;color:#fff}
        .r{text-align:right}.muted{color:#888;font-size:11px}
        tfoot td{background:#f4f1ea;font-size:13px}
      </style></head><body>
        <h1>${L.title} — C-Secur360</h1>
        <div class="meta"><b>${L.date} :</b> ${dateStr} · <b>${Object.keys(bySupplier).length}</b> ${L.suppliers}${wp ? ` · <b>${L.grand} :</b> $${grand.toFixed(2)}` : ''}</div>
        ${body}
      </body></html>`);
      w.document.close(); w.focus(); setTimeout(() => { try { w.print(); } catch { /* ignore */ } }, 300);
    };

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{t('alerts.management')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {filteredAlerts.length} alerte{filteredAlerts.length > 1 ? 's' : ''} de stock
            </p>
          </div>
          <Button
            variant="secondary"
            icon={ArrowLeft}
            onClick={() => setView('dashboard')}
          >
            Retour au tableau de bord
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={AlertTriangle}
            title={t('dashboard.totalAlerts')}
            value={alerts.length}
            color="red"
            subtitle={t('dashboard.outOfStock')}
          />
          <StatCard
            icon={Building}
            title={t('articles.departments')}
            value={Object.keys(alertsByDepartment).length}
            color="orange"
            subtitle={t('dashboard.departmentsWithAlerts')}
          />
          <StatCard
            icon={Truck}
            title={t('articles.suppliers')}
            value={suppliers.length}
            color="blue"
            subtitle={t('dashboard.suppliersToContact')}
          />
          <StatCard
            icon={ShoppingCart}
            title={t('articles.selected')}
            value={selectedItems.length}
            color="purple"
            subtitle={t('dashboard.selectedForOrder')}
          />
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('actions.filters')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {t('common.departmentBranch')}
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              >
                <option value="all">{t('common.allDepartments')}</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Fournisseur
              </label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              >
                <option value="all">{t('common.allSuppliers')}</option>
                {suppliers.map(supplier => (
                  <option key={supplier} value={supplier}>
                    {supplier}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        {filteredAlerts.length > 0 && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl shadow-lg p-4 border-2 border-orange-200 dark:border-orange-800">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  onClick={selectAll}
                  disabled={selectedItems.length === filteredAlerts.length}
                >
                  Tout sélectionner
                </Button>
                <Button
                  variant="secondary"
                  onClick={deselectAll}
                  disabled={selectedItems.length === 0}
                >
                  Tout désélectionner
                </Button>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  icon={ShoppingCart}
                  onClick={generateOrder}
                  disabled={selectedItems.length === 0}
                >
                  {t('alerts.generateOrder')} ({selectedItems.length})
                </Button>
                <Button
                  variant="primary"
                  icon={Mail}
                  onClick={sendOrderEmail}
                  disabled={selectedItems.length === 0}
                >
                  {t('alerts.sendOrderEmail')} ({selectedItems.length})
                </Button>
                <Button
                  variant="secondary"
                  icon={FileText}
                  onClick={printPurchaseOrder}
                  disabled={filteredAlerts.length === 0}
                  title={language === 'fr' ? 'Bon de commande détaillé (PDF), groupé par fournisseur — sélection ou toutes les alertes' : 'Detailed purchase order (PDF) by supplier'}
                >
                  {language === 'fr' ? `Bon de commande PDF${selectedItems.length ? ` (${selectedItems.length})` : ''}` : `Purchase order PDF${selectedItems.length ? ` (${selectedItems.length})` : ''}`}
                </Button>
                <label className="flex items-center gap-1.5 px-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                  <input type="checkbox" checked={poWithPrices} onChange={(e) => setPoWithPrices(e.target.checked)} className="h-4 w-4 rounded accent-slate-700" />
                  {language === 'fr' ? 'Inclure les prix' : 'Include prices'}
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Alerts by Department */}
        <div className="space-y-6">
          {Object.entries(alertsByDepartment).map(([deptName, deptAlerts]) => {
            const dept = departments.find(d => d.name === deptName);

            return (
              <div key={deptName} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-orange-600 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building className="text-white" size={24} />
                      <div>
                        <h3 className="text-lg font-bold text-white">{deptName}</h3>
                        <p className="text-sm text-red-100">{dept?.code || ''}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-white">{deptAlerts.length}</p>
                      <p className="text-sm text-red-100">alerte{deptAlerts.length > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>

                {/* MOBILE (< lg) : liste de cartes — le tableau à 9 colonnes déborde sur téléphone.
                    Un seul scroll vertical, mêmes données et mêmes handlers que le tableau. */}
                <div className="lg:hidden divide-y divide-gray-100 dark:divide-gray-700">
                  {deptAlerts.map((item) => {
                    const qtyToOrder = getOrderQty(item);
                    const totalCost = qtyToOrder * item.costPrice;
                    const isSelected = selectedItems.includes(item.id);

                    return (
                      <div
                        key={item.id}
                        className={`p-4 transition-colors ${isSelected ? 'bg-orange-50 dark:bg-orange-900/20' : ''}`}
                        onClick={() => toggleItemSelection(item.id)}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleItemSelection(item.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-slate-600 focus:ring-orange-500"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-gray-900 dark:text-white">{item.name}</p>
                            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                              <span className="font-mono">{item.code}</span>
                              {item.category ? ` · ${item.category}` : ''}
                            </p>
                            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                              {item.supplier || t('common.notSpecified')}
                            </p>
                          </div>
                          <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${
                            item.quantity === 0
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              : 'bg-slate-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                          }`}>
                            {item.quantity}
                          </span>
                        </div>
                        <div className="mt-3 flex items-end justify-between gap-3">
                          <div className="min-w-0 flex-1 text-xs text-gray-600 dark:text-gray-400">
                            <p>{t('articles.minMax')}: {item.minQuantity} / {item.maxQuantity}</p>
                            <p className="mt-0.5">{t('common.unitPrice')}: ${item.costPrice.toFixed(2)} · {t('articles.totalCost')}: <span className="font-bold text-gray-900 dark:text-white">${totalCost.toFixed(2)}</span></p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="mb-1 text-[11px] font-medium text-gray-500 dark:text-gray-400">{t('alerts.toOrder')}</p>
                            <input
                              type="number" min="0"
                              value={orderQty[item.id] !== undefined ? orderQty[item.id] : suggestedQty(item)}
                              onChange={(e) => setOrderQty(prev => ({ ...prev, [item.id]: e.target.value }))}
                              onClick={(e) => e.stopPropagation()}
                              className="w-20 rounded-lg border-2 border-green-300 bg-green-50 px-2 py-1 text-center text-sm font-bold text-green-800 focus:border-green-500 focus:outline-none dark:border-green-700 dark:bg-green-900/20 dark:text-green-300"
                              title={language === 'fr' ? 'Quantité à commander (ajustable)' : 'Quantity to order (adjustable)'}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* DESKTOP (lg+) : tableau complet, inchangé. */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={deptAlerts.every(item => selectedItems.includes(item.id))}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems(prev => [...new Set([...prev, ...deptAlerts.map(i => i.id)])]);
                              } else {
                                setSelectedItems(prev => prev.filter(id => !deptAlerts.map(i => i.id).includes(id)));
                              }
                            }}
                            className="w-4 h-4 text-slate-600 border-gray-300 rounded focus:ring-orange-500"
                          />
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">{t('common.code')}</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">{t('common.article')}</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">{t('common.supplier')}</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">{t('common.quantity')}</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">{t('articles.minMax')}</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">{t('alerts.toOrder')}</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">{t('common.unitPrice')}</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">{t('articles.totalCost')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {deptAlerts.map((item, index) => {
                        const qtyToOrder = getOrderQty(item);
                        const totalCost = qtyToOrder * item.costPrice;

                        return (
                          <tr
                            key={item.id}
                            className={`
                              ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}
                              ${selectedItems.includes(item.id) ? 'ring-2 ring-orange-500' : ''}
                              hover:bg-slate-50 dark:hover:bg-orange-900/20 transition-colors cursor-pointer
                            `}
                            onClick={() => toggleItemSelection(item.id)}
                          >
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(item.id)}
                                onChange={() => toggleItemSelection(item.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-4 h-4 text-slate-600 border-gray-300 rounded focus:ring-orange-500"
                              />
                            </td>
                            <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-400">
                              {item.code}
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                                <p className="text-xs text-gray-500">{item.category}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                              {item.supplier || <span className="text-gray-400 italic">{t('common.notSpecified')}</span>}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                item.quantity === 0
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                  : 'bg-slate-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                              }`}>
                                {item.quantity}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                              {item.minQuantity} / {item.maxQuantity}
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number" min="0"
                                value={orderQty[item.id] !== undefined ? orderQty[item.id] : suggestedQty(item)}
                                onChange={(e) => setOrderQty(prev => ({ ...prev, [item.id]: e.target.value }))}
                                className="w-20 rounded-lg border-2 border-green-300 bg-green-50 px-2 py-1 text-center text-sm font-bold text-green-800 focus:border-green-500 focus:outline-none dark:border-green-700 dark:bg-green-900/20 dark:text-green-300"
                                title={language === 'fr' ? 'Quantité à commander (ajustable)' : 'Quantity to order (adjustable)'}
                              />
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                              ${item.costPrice.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">
                              ${totalCost.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredAlerts.length === 0 && (
          <EmptyState
            icon={AlertTriangle}
            title={t('dashboard.noAlerts')}
            message={
              selectedDepartment !== 'all' || selectedSupplier !== 'all'
                ? t('dashboard.noAlertsFiltered')
                : t('dashboard.allArticlesSufficient')
            }
          />
        )}
      </div>
    );
  };

  // Panneau LECTURE SEULE des Sites/Départements gérés dans l'Administration principale
  // (table planner_succursales). Source de vérité de la hiérarchie Site → Département pour
  // l'inventaire (l'import valide les SITE contre cette liste). Géré dans Administration.
  const AdminSitesPanel = () => {
    const [loading, setLoading] = useState(true);
    const [tree, setTree] = useState([]); // [{id,name,depts:[{id,name}]}]
    useEffect(() => {
      let alive = true;
      (async () => {
        try {
          const { data, error } = await supabase.from('planner_succursales').select('id,name,parent_id').eq('tenant_id', tenantId).order('name');
          if (!alive) return;
          if (error) { setTree([]); setLoading(false); return; }
          const rows = data || [];
          const sites = rows.filter(r => !r.parent_id).map(s => ({ id: s.id, name: s.name, depts: rows.filter(d => d.parent_id === s.id).map(d => ({ id: d.id, name: d.name })) }));
          setTree(sites);
        } catch { if (alive) setTree([]); }
        if (alive) setLoading(false);
      })();
      return () => { alive = false; };
    }, []);
    const fr = language === 'fr';
    return (
      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="mb-2 flex items-center gap-2">
          <Building size={18} className="text-blue-600 dark:text-blue-400" />
          <h3 className="font-bold text-blue-900 dark:text-blue-200">{fr ? 'Sites & Départements (Administration)' : 'Sites & Departments (Administration)'}</h3>
        </div>
        <p className="mb-3 text-xs text-blue-700 dark:text-blue-300">
          {fr ? "Hiérarchie Site → Département gérée dans l'onglet Administration principal (lecture seule ici). C'est la source des SITE/DÉPARTEMENT pour l'import." : 'Site → Department hierarchy managed in the main Administration tab (read-only here). This is the source for SITE/DEPARTMENT on import.'}
        </p>
        {loading ? (
          <p className="text-sm text-gray-500">{fr ? 'Chargement…' : 'Loading…'}</p>
        ) : tree.length === 0 ? (
          <p className="text-sm text-gray-500">{fr ? 'Aucun site défini. Crée-les dans Administration → Sites / Départements.' : 'No site defined. Create them in Administration → Sites / Departments.'}</p>
        ) : (
          <>
            {/* Mini-dashboard : totaux sites / départements */}
            <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <div className="rounded-lg bg-white px-3 py-2 dark:bg-gray-800">
                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{fr ? 'Sites' : 'Sites'}</p>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{tree.length}</p>
              </div>
              <div className="rounded-lg bg-white px-3 py-2 dark:bg-gray-800">
                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{fr ? 'Départements' : 'Departments'}</p>
                <p className="text-xl font-bold text-slate-700 dark:text-slate-200">{tree.reduce((s2, s) => s2 + s.depts.length, 0)}</p>
              </div>
              <div className="rounded-lg bg-white px-3 py-2 dark:bg-gray-800">
                <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">{fr ? 'Moy. dépt/site' : 'Avg dept/site'}</p>
                <p className="text-xl font-bold text-gray-700 dark:text-gray-200">{tree.length ? (tree.reduce((s2, s) => s2 + s.depts.length, 0) / tree.length).toFixed(1) : '0'}</p>
              </div>
            </div>
            <div className="space-y-2">
              {tree.map(s => (
                <div key={s.id} className="rounded-lg bg-white p-2 dark:bg-gray-800">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white"><Building size={14} className="text-blue-500" /> {s.name}</div>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${s.depts.length ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                      {s.depts.length} {fr ? (s.depts.length > 1 ? 'départements' : 'département') : (s.depts.length > 1 ? 'depts' : 'dept')}
                    </span>
                  </div>
                  {s.depts.length > 0 && (
                    <div className="ml-5 mt-1 flex flex-wrap gap-1">
                      {s.depts.map(d => <span key={d.id} className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-200">{d.name}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  // ============== VUE: ADMINISTRATION ==============
  const AdminView = () => {
    // activeAdminTab est maintenant géré par AppContent pour persister entre les re-renders
    const [currency, setCurrency] = useState('CAD ($)');
    const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
    const [newRcCode, setNewRcCode] = useState('');
    const [newRcLabel, setNewRcLabel] = useState('');

    const adminTabs = [
      { id: 'departments', label: t('administration.tabs.departmentsPersonnel'), icon: Building },
      { id: 'categories', label: t('administration.tabs.categories'), icon: Tag },
      { id: 'reason-codes', label: language === 'fr' ? 'Codes internes' : 'Internal codes', icon: ClipboardList },
      { id: 'inventory-mode', label: t('administration.tabs.inventoryMode'), icon: ClipboardCheck },
      { id: 'import-export', label: t('administration.tabs.importExport'), icon: FileSpreadsheet },
      { id: 'settings', label: t('administration.tabs.settings'), icon: Settings }
    ];

    // Sauvegarder les paramètres
    const handleSaveSettings = () => {
      // Sauvegarder dans localStorage
      localStorage.setItem('app-currency', currency);
      localStorage.setItem('app-dateFormat', dateFormat);
      localStorage.setItem(invKey('app-baseEbitda'), baseEbitda.toString());
      localStorage.setItem(invKey('app-targetEbitda'), targetEbitda.toString());
      notify(t('messages.success.saved'));
    };

    return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{t('administration.title')}</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">{t('administration.manageSystemSettings')}</p>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <nav className="flex gap-2 sm:gap-4 min-w-max sm:min-w-0">
          {adminTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveAdminTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 border-b-2 font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
                  activeAdminTab === tab.id
                    ? 'border-slate-700 text-slate-600 dark:text-slate-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="mt-6">
        {/* Onglet Départements & Personnel */}
        {activeAdminTab === 'departments' && (
          <>
          <AdminSitesPanel />
          <DepartmentManagement
            departments={departments}
            articles={items}
            storageUnits={storageUnits}
            onAddDepartment={addDepartment}
            onUpdateDepartment={updateDepartment}
            onDeleteDepartment={deleteDepartment}
            onAddStorageUnit={addStorageUnit}
            onUpdateStorageUnit={updateStorageUnit}
            onDeleteStorageUnit={deleteStorageUnit}
            activeTab={activeDepartmentTab}
            setActiveTab={setActiveDepartmentTab}
            t={t}
          />
          </>
        )}

        {/* Onglet Catégories */}
        {activeAdminTab === 'categories' && (
          <CategoryManagement
            categories={categories}
            articles={items}
            onAddCategory={addCategory}
            onUpdateCategory={updateCategory}
            onDeleteCategory={deleteCategory}
          />
        )}

        {/* Onglet Mode Inventaire */}
        {activeAdminTab === 'inventory-mode' && (
          <div className="space-y-6">
            {/* Status actuel */}
            <div className={`p-6 rounded-xl border-2 ${
              globalInventoryMode.active
                ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700'
                : 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    globalInventoryMode.active
                      ? 'bg-orange-500'
                      : 'bg-green-500'
                  }`}>
                    <ClipboardCheck size={32} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {globalInventoryMode.active
                        ? t('administration.inventoryMode.active')
                        : t('administration.inventoryMode.inactive')}
                    </h2>
                    {globalInventoryMode.active ? (
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-700 dark:text-gray-300">
                          <strong>{t('administration.inventoryMode.department')}:</strong> {globalInventoryMode.departmentName}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                          <strong>{t('administration.inventoryMode.startedBy')}:</strong> {globalInventoryMode.startedByName}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                          <strong>{t('administration.inventoryMode.startDate')}:</strong>{' '}
                          {new Date(globalInventoryMode.startDate).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-US')}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                          <strong>{t('administration.inventoryMode.scansRecorded')}:</strong> {globalInventoryMode.scans.length}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-400">
                        {t('administration.inventoryMode.readyToStart')}
                      </p>
                    )}
                  </div>
                </div>
                {globalInventoryMode.active && (
                  <button
                    onClick={() => {
                      askConfirm({ message: t('administration.inventoryMode.confirmEnd'), confirmLabel: t('administration.inventoryMode.endInventory'), onConfirm: () => {
                        setGlobalInventoryMode({
                          active: false,
                          departmentId: null,
                          departmentName: null,
                          startedBy: null,
                          startedByName: null,
                          startDate: null,
                          scans: []
                        });
                      } });
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    {t('administration.inventoryMode.endInventory')}
                  </button>
                )}
              </div>
            </div>

            {/* Activer le mode inventaire */}
            {!globalInventoryMode.active && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {t('administration.inventoryMode.startInventory')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('administration.inventoryMode.selectDepartment')}
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                      onChange={(e) => {
                        const deptId = e.target.value;
                        if (deptId) {
                          const dept = departments.find(d => d.id === deptId);
                          if (dept) askConfirm({ message: t('administration.inventoryMode.confirmStart').replace('{department}', dept.name), confirmLabel: t('administration.inventoryMode.startInventory'), danger: false, onConfirm: () => {
                            setGlobalInventoryMode({
                              active: true,
                              departmentId: dept.id,
                              departmentName: dept.name,
                              startedBy: currentUser?.id || 'admin',
                              startedByName: currentUser?.displayName || 'Administrator',
                              startDate: new Date().toISOString(),
                              scans: []
                            });
                          } });
                        }
                        e.target.value = '';
                      }}
                      defaultValue=""
                    >
                      <option value="">{t('administration.inventoryMode.chooseDepartment')}</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-900 dark:text-blue-200">
                      <strong>{t('administration.inventoryMode.warning')}:</strong> {t('administration.inventoryMode.warningMessage')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {t('administration.inventoryMode.howItWorks')}
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                <li>{t('administration.inventoryMode.step1')}</li>
                <li>{t('administration.inventoryMode.step2')}</li>
                <li>{t('administration.inventoryMode.step3')}</li>
                <li>{t('administration.inventoryMode.step4')}</li>
              </ol>
            </div>
          </div>
        )}

        {/* Onglet Import/Export */}
        {activeAdminTab === 'import-export' && (
          <div className="space-y-6">

      {/* Section Import/Export Excel */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl shadow-lg p-6 border-2 border-orange-200 dark:border-orange-800">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-slate-700 rounded-lg">
            <FileSpreadsheet size={32} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('administration.excelImportExport')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('administration.excelDescription')}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" icon={Download} onClick={downloadExcelTemplate}>
                {t('articles.excel.downloadTemplate')}
              </Button>
              <Button variant="success" icon={Upload} onClick={() => setShowImportModal(true)}>
                {t('actions.importExcel')}
              </Button>
              <Button variant="secondary" icon={Download} onClick={exportToExcel}>
                {t('administration.exportInventory')}
              </Button>
            </div>
            <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>{t('articles.excel.instructions')}</strong> {t('administration.excelInstructions')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Mise à jour des prix */}
      <div className="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/20 dark:to-amber-800/20 rounded-xl shadow-lg p-6 border-2 border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-yellow-600 rounded-lg">
            <DollarSign size={32} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('administration.priceUpdate')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('administration.priceUpdateDescription')}
            </p>

            {/* Statistiques des articles nécessitant une mise à jour */}
            {(() => {
              const now = new Date();
              const itemsNeedingUpdate = items.filter(item => {
                if (!item.nextPriceUpdate) return false;
                return new Date(item.nextPriceUpdate) <= now;
              });

              const itemsUpcomingUpdate = items.filter(item => {
                if (!item.nextPriceUpdate) return false;
                const nextUpdate = new Date(item.nextPriceUpdate);
                const thirtyDaysFromNow = new Date();
                thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                return nextUpdate > now && nextUpdate <= thirtyDaysFromNow;
              });

              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('administration.toUpdate')}</p>
                    <p className="text-3xl font-bold text-red-600">{itemsNeedingUpdate.length}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('administration.next30Days')}</p>
                    <p className="text-3xl font-bold text-slate-600">{itemsUpcomingUpdate.length}</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('administration.upToDate')}</p>
                    <p className="text-3xl font-bold text-green-600">
                      {items.length - itemsNeedingUpdate.length - itemsUpcomingUpdate.length}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Configuration par catégorie */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">{t('administration.defaultConfigPerCategory')}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded">
                  <span className="text-gray-700 dark:text-gray-300">{t('articles.consumables')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">3 mois</span>
                </div>
                <div className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded">
                  <span className="text-gray-700 dark:text-gray-300">{t('articles.equipment')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">6 mois</span>
                </div>
                <div className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded">
                  <span className="text-gray-700 dark:text-gray-300">{t('articles.uniqueSale')}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">12 mois</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                icon={Calendar}
                onClick={() => {
                  const now = new Date();
                  const itemsToUpdate = items.filter(item => {
                    if (!item.nextPriceUpdate) return false;
                    return new Date(item.nextPriceUpdate) <= now;
                  });
                  if (itemsToUpdate.length === 0) {
                    notify(t('messages.info.noUpdateNeeded'), 'info');
                    return;
                  }
                  notify(`${itemsToUpdate.length} ${t('articles.articlesNeedUpdate')}`, 'info');
                }}
              >
                {t('administration.viewArticlesToUpdate')}
              </Button>
              <Button
                variant="success"
                icon={CheckCircle}
                onClick={() => {
                  const now = new Date();
                  let updated = 0;

                  setItems(prevItems => prevItems.map(item => {
                    if (item.nextPriceUpdate && new Date(item.nextPriceUpdate) <= now) {
                      updated++;
                      const interval = item.priceUpdateInterval === 'custom'
                        ? item.customPriceInterval
                        : parseInt(item.priceUpdateInterval || '3');

                      const nextUpdate = new Date();
                      nextUpdate.setMonth(nextUpdate.getMonth() + interval);

                      return {
                        ...item,
                        lastPriceUpdate: new Date().toISOString(),
                        nextPriceUpdate: nextUpdate.toISOString()
                      };
                    }
                    return item;
                  }));

                  notify(language === 'fr' ? `${updated} article(s) marqué(s) comme mis à jour` : `${updated} item(s) marked as updated`);
                }}
              >
                {t('administration.markAsUpdated')}
              </Button>
            </div>

            <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>{t('administration.priceAdviceLabel')}</strong> {t('administration.priceAdvice')}
              </p>
            </div>
          </div>
        </div>
      </div>
          </div>
        )}

        {/* Onglet Codes internes — raisons de mouvement sans projet (ex. RÉPARATION, PERTE, ÉCHANTILLON) */}
        {activeAdminTab === 'reason-codes' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{language === 'fr' ? 'Codes internes' : 'Internal codes'}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{language === 'fr' ? 'Raisons de mouvement quand il n’y a pas de projet/soumission (ex. RÉPARATION, PERTE, ÉCHANTILLON, RETOUR FOURNISSEUR). Obligatoire au scanner si « Code interne ».' : 'Movement reasons when there is no project/quote (e.g. REPAIR, LOSS, SAMPLE). Required at the scanner when "Internal code".'}</p>
            <div className="flex flex-wrap items-end gap-2 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{language === 'fr' ? 'Code *' : 'Code *'}</label>
                <input value={newRcCode} onChange={e => setNewRcCode(e.target.value.toUpperCase())} placeholder="RÉPARATION" className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm font-mono uppercase" />
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{language === 'fr' ? 'Libellé (optionnel)' : 'Label (optional)'}</label>
                <input value={newRcLabel} onChange={e => setNewRcLabel(e.target.value)} placeholder={language === 'fr' ? 'Description' : 'Description'} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm" />
              </div>
              <button onClick={() => { if (newRcCode.trim()) { addReasonCode(newRcCode, newRcLabel); setNewRcCode(''); setNewRcLabel(''); } }} className="inline-flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"><Plus size={15} /> {language === 'fr' ? 'Ajouter' : 'Add'}</button>
            </div>
            {reasonCodes.length === 0 ? (
              <p className="text-sm text-gray-400">{language === 'fr' ? 'Aucun code interne.' : 'No internal code.'}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {reasonCodes.map(c => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
                    <div className="min-w-0">
                      <div className="font-mono text-sm font-bold truncate">{c.code}</div>
                      {c.label && <div className="text-xs text-gray-500 truncate">{c.label}</div>}
                    </div>
                    <button onClick={() => deleteReasonCode(c.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={15} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Onglet Paramètres */}
        {activeAdminTab === 'settings' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('administration.settings')}</h2>

            {/* Langue (FR/EN) et thème (Jour/Nuit) sont pilotes par le header principal de l'app
                (un seul reglage pour toute la plateforme) — retires d'ici pour eviter les doublons. */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t('administration.currency')}
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                >
                  <option value="USD ($)">USD ($)</option>
                  <option value="CAD ($)">CAD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t('administration.dateFormat')}
                </label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t('administration.baseEbitda')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={baseEbitda}
                    onChange={(e) => setBaseEbitda(parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all pr-12"
                    placeholder="20"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                    %
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('administration.baseEbitdaDescription')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t('administration.targetEbitda')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={targetEbitda}
                    onChange={(e) => setTargetEbitda(parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all pr-12"
                    placeholder="35"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                    %
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('administration.targetEbitdaDescription')}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSaveSettings}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Save size={20} />
                {t('actions.save')}
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Upload size={20} />
                {t('administration.backup')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    );
  };

  // ============== MODAL ARTICLE SCANNÉ ==============
  const ScannedItemModal = () => {
    const [action, setAction] = useState('add'); // 'add', 'remove', 'report'
    const [quantity, setQuantity] = useState(1);
    const [reason, setReason] = useState('');
    const [issueType, setIssueType] = useState('damaged');
    const [issueDescription, setIssueDescription] = useState('');

    const handleQuickAction = (actionType) => {
      if (!selectedItem) return;

      const deptCode = selectedItem.scannedDepartmentCode || null; // cible la succursale scannée (multi-emplacement)
      const who = currentUser?.username || hostUserName || 'system'; // qui effectue le mouvement (enregistré dans l'historique)
      if (actionType === 'add') {
        updateQuantity(selectedItem.id, quantity, 'entry', reason || t('scanner.addStock'), deptCode, null, who);
        setShowScannedModal(false);
        setSelectedItem(null);
        setQuantity(1);
        setReason('');
      } else if (actionType === 'remove') {
        updateQuantity(selectedItem.id, -quantity, 'exit', reason || t('scanner.removeStock'), deptCode, null, who);
        setShowScannedModal(false);
        setSelectedItem(null);
        setQuantity(1);
        setReason('');
      } else if (actionType === 'report') {
        // Ajouter un mouvement de problème signalé
        addMovement({
          type: 'adjustment',
          itemId: selectedItem.id,
          itemName: selectedItem.name,
          quantity: 0,
          reason: `${t('scanner.reportIssue')}: ${t(`scanner.issues.${issueType}`)} - ${issueDescription}`,
          user: currentUser?.username || 'system'
        });
        notify(t('messages.success.saved'));
        setShowScannedModal(false);
        setSelectedItem(null);
        setIssueDescription('');
      }
    };

    if (!selectedItem) return null;

    return (
      <Modal
        isOpen={showScannedModal}
        onClose={() => {
          setShowScannedModal(false);
          setSelectedItem(null);
          setAction('add');
          setQuantity(1);
        }}
        title={t('scanner.itemScanned')}
      >
        <div className="space-y-6">
          {/* Informations article */}
          <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border-2 border-orange-200 dark:border-orange-800">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white rounded-lg">
                <QRCodeSVG
                  value={getScanUrl(selectedItem.id, selectedItem.code)}
                  size={80}
                  level="H"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{selectedItem.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono mb-3">{selectedItem.code}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">{t('articles.category')}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedItem.category}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">{t('articles.location')}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedItem.location}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">{t('articles.currentStock')}</p>
                    <p className="font-bold text-2xl text-slate-600">{selectedItem.quantity} {selectedItem.unit}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">{t('status.title')}</p>
                    <StatusBadge
                      quantity={selectedItem.quantity}
                      minQuantity={selectedItem.minQuantity}
                      maxQuantity={selectedItem.maxQuantity}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{t('scanner.quickActions')}</h4>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <button
                onClick={() => setAction('add')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  action === 'add'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-green-300'
                }`}
              >
                <Plus size={24} className={`mx-auto mb-2 ${action === 'add' ? 'text-green-600' : 'text-gray-400'}`} />
                <p className={`text-sm font-medium ${action === 'add' ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {t('scanner.add')}
                </p>
              </button>

              <button
                onClick={() => setAction('remove')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  action === 'remove'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-red-300'
                }`}
              >
                <Trash2 size={24} className={`mx-auto mb-2 ${action === 'remove' ? 'text-red-600' : 'text-gray-400'}`} />
                <p className={`text-sm font-medium ${action === 'remove' ? 'text-red-700 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {t('scanner.remove')}
                </p>
              </button>

              <button
                onClick={() => setAction('report')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  action === 'report'
                    ? 'border-slate-600 bg-slate-50 dark:bg-orange-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-orange-300'
                }`}
              >
                <AlertTriangle size={24} className={`mx-auto mb-2 ${action === 'report' ? 'text-slate-600' : 'text-gray-400'}`} />
                <p className={`text-sm font-medium ${action === 'report' ? 'text-orange-700 dark:text-slate-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {t('scanner.reportIssue')}
                </p>
              </button>
            </div>

            {/* Formulaire selon l'action */}
            {(action === 'add' || action === 'remove') && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {action === 'add' ? t('scanner.quantityToAdd') : t('scanner.quantityToRemove')}
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-lg font-semibold"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {t('scanner.reason')} ({t('common.optional')})
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={action === 'add' ? 'Réception, Retour...' : 'Vente, Transfert, Utilisation...'}
                  />
                </div>
                <Button
                  variant={action === 'add' ? 'success' : 'danger'}
                  icon={action === 'add' ? Plus : Trash2}
                  onClick={() => handleQuickAction(action)}
                  className="w-full"
                >
                  {action === 'add' ? `${t('scanner.add')} ${quantity}` : `${t('scanner.remove')} ${quantity}`}
                </Button>
              </div>
            )}

            {action === 'report' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {t('scanner.issueType')}
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                  >
                    <option value="damaged">{t('scanner.issues.damaged')}</option>
                    <option value="missing">{t('scanner.issues.missing')}</option>
                    <option value="wrongLocation">{t('scanner.issues.wrongLocation')}</option>
                    <option value="expired">{t('scanner.issues.expired')}</option>
                    <option value="qualityIssue">{t('scanner.issues.qualityIssue')}</option>
                    <option value="other">{t('scanner.issues.other')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {t('scanner.issueDescription')}
                  </label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    rows="3"
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    placeholder={t('administration.problemDetails')}
                  />
                </div>
                <Button
                  variant="primary"
                  icon={AlertTriangle}
                  onClick={() => handleQuickAction('report')}
                  className="w-full"
                  disabled={!issueDescription.trim()}
                >
                  {t('scanner.reportIssue')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Modal>
    );
  };

  // ============== MODAL IMPRESSION ÉTIQUETTE ==============
  const PrintModal = () => {
    const { language } = useLanguage();

    // Expansion des articles multi-localisation en étiquettes individuelles par succursale
    const expandItemsForPrinting = (itemsList) => {
      const expandedItems = [];
      itemsList.forEach(item => {
        if (item.isMultiLocation && item.locations && item.locations.length > 0) {
          // Créer une "version" de l'article pour chaque succursale
          item.locations.forEach(location => {
            expandedItems.push({
              ...item,
              // Surcharger les propriétés spécifiques à cette succursale
              department: location.department,
              departmentCode: location.departmentCode,
              location: location.location,
              quantity: location.quantity,
              minQuantity: location.minQuantity || item.minQuantity,
              maxQuantity: location.maxQuantity || item.maxQuantity,
              qrCode: location.qrCode || `${item.code}-${location.departmentCode}`,
              // Marquer comme étiquette spécifique à une succursale
              isPrintVariant: true,
              originalItemId: item.id
            });
          });
        } else {
          expandedItems.push(item);
        }
      });
      return expandedItems;
    };

    // Obtenir toutes les localisations uniques pour le dropdown
    const uniqueLocations = [...new Set(items.map(item => item.location).filter(Boolean))].sort();

    const baseItems = printMode === 'single' && itemToPrint
      ? [itemToPrint]
      : bulkPrintByLocation && selectedLocation
        ? items.filter(item => item.location === selectedLocation)
        : items.filter(item => selectedItems.includes(item.id));

    const itemsToPrint = expandItemsForPrinting(baseItems);

    // Formats d'étiquettes disponibles
    const labelFormats = {
      avery35520: {
        name: 'Avery 35520',
        description: 'Étiquettes imperméables 1" x 2.625" (30 par page)',
        width: '2.625in',
        height: '1in',
        padding: '0.05in',
        qrSize: 65,
        layout: 'compact'
      },
      avery5160: {
        name: 'Avery 5160',
        description: 'Étiquettes adresse 1" x 2.625" (30 par page)',
        width: '2.625in',
        height: '1in',
        padding: '0.05in',
        qrSize: 65,
        layout: 'compact'
      },
      avery5163: {
        name: 'Avery 5163',
        description: 'Étiquettes expédition 2" x 4" (10 par page)',
        width: '4in',
        height: '2in',
        padding: '0.1in',
        qrSize: 130,
        layout: 'compact'
      },
      avery22806: {
        name: 'Avery 22806',
        description: 'Étiquettes carrées 2" x 2" (12 par page)',
        width: '2in',
        height: '2in',
        padding: '0.08in',
        qrSize: 90,
        layout: 'vertical'
      },
      custom: {
        name: 'Format Personnalisé',
        description: 'Étiquette personnalisée pleine page',
        width: '8.5in',
        height: '11in',
        padding: '0.5in',
        qrSize: 150,
        layout: 'horizontal'
      }
    };

    const currentFormat = labelFormats[labelFormat];

    const getPrintCSS = () => {
      if (labelFormat === 'avery35520' || labelFormat === 'avery5160') {
        // Avery 35520 et 5160 utilisent le même layout (3x10 grid, 30 labels)
        return `
          .label-container {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
          }
          .print-label {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100px;
          }
          @media print {
            @page {
              size: letter;
              margin: 0.5in 0.1875in;
            }
            * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
            }
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .label-container {
              display: grid !important;
              grid-template-columns: repeat(3, 2.625in) !important;
              grid-template-rows: repeat(10, 1in) !important;
              gap: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .print-label {
              width: 2.625in !important;
              height: 1in !important;
              padding: ${currentFormat.padding} !important;
              margin: 0 !important;
              box-sizing: border-box !important;
              overflow: hidden !important;
              border: none !important;
              background: white !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
            }
            .print-placeholder {
              visibility: hidden !important;
            }
            .label-container > div:nth-child(30n) {
              page-break-after: always;
            }
          }
        `;
      } else if (labelFormat === 'avery5163') {
        return `
          .label-container {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
          }
          .print-label {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100px;
          }
          @media print {
            @page {
              size: letter;
              margin: 0.5in 0.1875in;
            }
            * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
            }
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .label-container {
              display: grid !important;
              grid-template-columns: repeat(3, 2.625in) !important;
              grid-template-rows: repeat(10, 1in) !important;
              gap: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .print-label {
              width: 2.625in !important;
              height: 1in !important;
              padding: ${currentFormat.padding} !important;
              margin: 0 !important;
              box-sizing: border-box !important;
              overflow: hidden !important;
              border: none !important;
              background: white !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
            }
            .print-placeholder {
              visibility: hidden !important;
            }
            .label-container > div:nth-child(30n) {
              page-break-after: always;
            }
          }
        `;
      } else if (labelFormat === 'avery5163') {
        return `
          .label-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
          .print-label {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 150px;
          }
          @media print {
            @page {
              size: letter;
              margin: 0.5in;
            }
            * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
            }
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .label-container {
              display: grid !important;
              grid-template-columns: repeat(2, 4in) !important;
              grid-template-rows: repeat(5, 2in) !important;
              gap: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .print-label {
              width: 4in !important;
              height: 2in !important;
              padding: ${currentFormat.padding} !important;
              margin: 0 !important;
              box-sizing: border-box !important;
              overflow: hidden !important;
              border: none !important;
              background: white !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
            }
            .print-placeholder {
              visibility: hidden !important;
            }
            .label-container > div:nth-child(10n) {
              page-break-after: always;
            }
          }
        `;
      } else if (labelFormat === 'avery22806') {
        // Avery 22806: 2"x2" carrés, 12 labels (4 colonnes x 3 rangées)
        return `
          .label-container {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1rem;
          }
          .print-label {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 120px;
          }
          @media print {
            @page {
              size: letter;
              margin: 0.25in;
            }
            * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
            }
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .label-container {
              display: grid !important;
              grid-template-columns: repeat(4, 2in) !important;
              grid-template-rows: repeat(3, 2in) !important;
              gap: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .print-label {
              width: 2in !important;
              height: 2in !important;
              padding: ${currentFormat.padding} !important;
              margin: 0 !important;
              box-sizing: border-box !important;
              overflow: hidden !important;
              border: none !important;
              background: white !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
            }
            .print-placeholder {
              visibility: hidden !important;
            }
            .label-container > div:nth-child(12n) {
              page-break-after: always;
            }
          }
        `;
      } else {
        return `
          .label-container {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          .print-label {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 200px;
            border: 1px solid #ddd;
          }
          @media print {
            @page {
              size: letter;
              margin: 0;
            }
            * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
            }
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 8.5in !important;
              height: 11in !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .print-label {
              page-break-after: always;
              padding: ${currentFormat.padding} !important;
              margin: 0 !important;
              border: none !important;
              background: white !important;
            }
            .print-placeholder {
              visibility: hidden !important;
            }
          }
        `;
      }
    };

    const renderLabelContent = (item) => {
      const showMinMax = item.articleType !== 'unique';
      // Utiliser departmentCode si disponible (pour articles multi-localisation)
      const qrCodeUrl = getScanUrl(item.id, item.code, item.departmentCode);

      if (currentFormat.layout === 'compact') {
        // Vue compacte pour petites étiquettes (Avery 5160)
        return (
          <div className="flex items-center gap-1 h-full w-full p-1">
            <div className="flex-shrink-0">
              <QRCodeSVG
                value={qrCodeUrl}
                size={currentFormat.qrSize}
                level="M"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[10px] leading-tight truncate">{item.name}</p>
              <p className="font-mono text-[9px] leading-tight">{item.code}</p>
              {item.isPrintVariant && (
                <p className="text-[8px] font-semibold text-blue-600 leading-tight">{item.department}</p>
              )}
              <p className="text-[9px] font-semibold leading-tight">{item.location}</p>
              {showMinMax && (
                <p className="text-[8px] text-gray-600 leading-tight">{item.minQuantity}/{item.maxQuantity}</p>
              )}
            </div>
          </div>
        );
      } else if (currentFormat.layout === 'vertical') {
        // Vue verticale pour badges (Avery 22806)
        return (
          <div className="flex flex-col items-center justify-center h-full w-full space-y-1 p-2">
            <QRCodeSVG
              value={qrCodeUrl}
              size={currentFormat.qrSize}
              level="H"
            />
            <div className="text-center w-full">
              <h3 className="font-bold text-sm leading-tight mb-1 truncate">{item.name}</h3>
              <p className="font-mono text-xs text-gray-600 leading-tight">{item.code}</p>
              {item.isPrintVariant && (
                <p className="text-xs font-bold text-blue-600 mt-0.5 leading-tight">{item.department}</p>
              )}
              <p className="text-xs font-semibold mt-0.5 leading-tight truncate">{item.location}</p>
              {showMinMax && (
                <p className="text-xs text-gray-600 mt-0.5 leading-tight">{item.minQuantity}/{item.maxQuantity}</p>
              )}
            </div>
          </div>
        );
      } else {
        // Vue horizontale pour grandes étiquettes (Avery 5163, 35520)
        return (
          <div className="flex items-center gap-4 h-full w-full p-3">
            <div className="flex-shrink-0">
              <div className="p-2 bg-white border-2 border-gray-300 rounded">
                <QRCodeSVG
                  value={qrCodeUrl}
                  size={currentFormat.qrSize}
                  level="H"
                  includeMargin={false}
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="mb-2">
                <h3 className="text-xl font-bold text-gray-900 leading-tight truncate">{item.name}</h3>
                <p className="text-base font-mono text-gray-600 leading-tight">{item.code}</p>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                <div>
                  <p className="text-gray-500 font-semibold leading-tight">{t('common.category')}:</p>
                  <p className="text-gray-900 leading-tight truncate">{item.category}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold leading-tight">{t('common.department')}:</p>
                  <p className="text-gray-900 leading-tight truncate">{item.department}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold leading-tight">{t('articles.location')}:</p>
                  <p className="text-gray-900 font-bold leading-tight truncate">{item.location}</p>
                </div>
                {showMinMax && (
                  <div>
                    <p className="text-gray-500 font-semibold leading-tight">{t('articles.minMax')}:</p>
                    <p className="text-gray-900 font-bold leading-tight">{item.minQuantity} / {item.maxQuantity}</p>
                  </div>
                )}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-300">
                <p className="text-[10px] text-gray-500 leading-tight">C-Secur360 Inventory</p>
              </div>
            </div>
          </div>
        );
      }
    };

    // #83 — Export PDF des étiquettes (formats Avery, copies, positions vides).
    const PDF_FORMAT_MAP = { avery35520: 'avery5160', avery5160: 'avery5160', avery5163: 'avery5163', avery22806: 'avery22806', custom: 'avery5163' };
    const pdfFmtKey = PDF_FORMAT_MAP[labelFormat] || 'avery5160';
    const pdfFmt = LABEL_FORMATS[pdfFmtKey];
    const perPage = pdfFmt.cols * pdfFmt.rows;
    const toggleSkip = (idx) => setLabelSkip(prev => { const n = new Set(prev); n.has(idx) ? n.delete(idx) : n.add(idx); return n; });
    const exportLabelsPdf = async (mode = 'download') => { // 'download' | 'print' | 'preview'
      if (pdfBusy) return;
      setPdfBusy(true);
      try {
        let logoUrl = '/c-secur360-logo.png';
        try { const { data: cs } = await supabase.from('company_settings').select('logo_url').eq('tenant_id', tenantId).maybeSingle(); if (cs?.logo_url) logoUrl = cs.logo_url; } catch { /* défaut */ }
        const copies = Math.max(1, parseInt(labelCopies) || 1);
        const labels = [];
        itemsToPrint.forEach(it => {
          for (let c = 0; c < copies; c++) labels.push({
            name: it.name, code: it.code, min: it.minQuantity, max: it.maxQuantity,
            location: it.location || it.department || '', url: getScanUrl(it.id, it.code, it.departmentCode),
          });
        });
        if (!labels.length) { notify(language === 'fr' ? 'Aucune étiquette à générer.' : 'No label to generate.', 'error'); return; }
        await generateLabelsPdf(labels, { formatKey: pdfFmtKey, skipPositions: labelSkip, logoUrl, print: mode === 'print', preview: mode === 'preview', filename: `etiquettes-${tenantId}.pdf` });
      } catch (e) { notify((language === 'fr' ? 'Export PDF impossible : ' : 'PDF export failed: ') + (e?.message || e), 'error'); }
      finally { setPdfBusy(false); }
    };

    return (
      <Modal
        isOpen={showPrintModal}
        onClose={() => {
          setShowPrintModal(false);
          setItemToPrint(null);
        }}
        title={printMode === 'single' ? t('actions.printThisLabel') : t('actions.printLabels').replace('{count}', itemsToPrint.length)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowPrintModal(false)}>
              Annuler
            </Button>
            <Button variant="secondary" onClick={() => exportLabelsPdf('preview')} disabled={pdfBusy}>
              {pdfBusy ? '…' : (language === 'fr' ? 'Aperçu' : 'Preview')}
            </Button>
            <Button variant="secondary" onClick={() => exportLabelsPdf('download')} disabled={pdfBusy}>
              {pdfBusy ? '…' : (language === 'fr' ? 'Télécharger PDF' : 'Download PDF')}
            </Button>
            <Button variant="primary" icon={Printer} onClick={() => exportLabelsPdf('print')} disabled={pdfBusy}>
              {pdfBusy ? '…' : 'Imprimer'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Sélecteur de format d'étiquette */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              {t('common.labelFormat')}:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(labelFormats).map(([key, format]) => (
                <button
                  key={key}
                  onClick={() => setLabelFormat(key)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    labelFormat === key
                      ? 'border-slate-600 bg-slate-50 dark:bg-orange-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      checked={labelFormat === key}
                      onChange={() => setLabelFormat(key)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className={`font-semibold mb-1 ${
                        labelFormat === key
                          ? 'text-orange-700 dark:text-slate-400'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {format.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {format.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* #83 — Export PDF : copies + positions vides (feuille entamée) */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-semibold text-gray-900 dark:text-white">
                {language === 'fr' ? 'Copies par article (PDF)' : 'Copies per item (PDF)'}
              </label>
              <input
                type="number" min="1"
                className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-center"
                value={labelCopies}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setLabelCopies(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {language === 'fr'
                    ? `Feuille entamée ? Cliquez les cases déjà utilisées (elles seront sautées). ${pdfFmt.cols}×${pdfFmt.rows} = ${perPage}/page.`
                    : `Partial sheet? Click the cells already used (they will be skipped). ${pdfFmt.cols}×${pdfFmt.rows} = ${perPage}/page.`}
                </p>
                {labelSkip.size > 0 && (
                  <button onClick={() => setLabelSkip(new Set())} className="text-xs font-semibold text-blue-600 hover:underline">
                    {language === 'fr' ? 'Réinitialiser' : 'Reset'}
                  </button>
                )}
              </div>
              <div
                className="inline-grid gap-1 rounded-lg border border-gray-200 dark:border-gray-700 p-2 bg-white dark:bg-gray-800"
                style={{ gridTemplateColumns: `repeat(${pdfFmt.cols}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: perPage }).map((_, idx) => {
                  const used = labelSkip.has(idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleSkip(idx)}
                      title={`Position ${idx + 1}`}
                      className={`h-7 w-9 rounded text-[10px] font-semibold transition-colors ${
                        used
                          ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 line-through'
                          : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1 text-[11px] text-gray-400">
                {language === 'fr' ? 'Vert = libre · Gris = déjà utilisé (sauté).' : 'Green = free · Grey = used (skipped).'}
              </p>
            </div>
          </div>

          {/* Options d'impression en volume */}
          {printMode !== 'single' && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-4">
              {/* Toggle impression par emplacement */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    {language === 'fr' ? 'Impression en volume par emplacement' : 'Bulk print by location'}
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {language === 'fr'
                      ? 'Imprimer toutes les étiquettes d\'un emplacement spécifique'
                      : 'Print all labels for a specific location'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setBulkPrintByLocation(!bulkPrintByLocation);
                    if (!bulkPrintByLocation && uniqueLocations.length > 0) {
                      setSelectedLocation(uniqueLocations[0]);
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    bulkPrintByLocation ? 'bg-orange-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      bulkPrintByLocation ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Sélecteur d'emplacement */}
              {bulkPrintByLocation && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {language === 'fr' ? 'Sélectionner l\'emplacement' : 'Select location'}:
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full p-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">
                      {language === 'fr' ? '-- Choisir un emplacement --' : '-- Choose a location --'}
                    </option>
                    {uniqueLocations.map(location => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Position de départ pour feuille partielle */}
              {labelFormat !== 'custom' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {language === 'fr' ? 'Position de départ' : 'Starting position'}:
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      max={
                        labelFormat === 'avery35520' || labelFormat === 'avery5160' ? 30 :
                        labelFormat === 'avery5163' ? 10 :
                        labelFormat === 'avery22806' ? 12 : 1
                      }
                      value={startingPosition}
                      onChange={(e) => setStartingPosition(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-24 p-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {language === 'fr'
                        ? `Pour feuilles partiellement utilisées (max ${
                            labelFormat === 'avery35520' || labelFormat === 'avery5160' ? '30' :
                            labelFormat === 'avery5163' ? '10' :
                            labelFormat === 'avery22806' ? '12' : '1'
                          } positions)`
                        : `For partially used sheets (max ${
                            labelFormat === 'avery35520' || labelFormat === 'avery5160' ? '30' :
                            labelFormat === 'avery5163' ? '10' :
                            labelFormat === 'avery22806' ? '12' : '1'
                          } positions)`
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Aperçu des étiquettes */}
          <div className="print-area" ref={printRef}>
            <style>{getPrintCSS()}</style>

            <div className="label-container">
              {/* Étiquettes vides pour position de départ */}
              {labelFormat !== 'avery35520' && labelFormat !== 'custom' && startingPosition > 1 &&
                Array.from({ length: startingPosition - 1 }).map((_, index) => (
                  <div
                    key={`placeholder-${index}`}
                    className="print-label print-placeholder border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800"
                  >
                    <div className="flex items-center justify-center h-full opacity-50">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {language === 'fr' ? `Position ${index + 1}` : `Position ${index + 1}`}
                      </span>
                    </div>
                  </div>
                ))
              }
              {/* Étiquettes réelles */}
              {itemsToPrint.map(item => (
                <div
                  key={item.id}
                  className="print-label border border-gray-300 dark:border-gray-600 bg-white"
                >
                  {renderLabelContent(item)}
                </div>
              ))}
            </div>
          </div>

          {/* Informations d'impression */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-400">
              <strong>{t('articles.printPreview')}:</strong> {itemsToPrint.length} {t('articles.labels')} {t('articles.inFormat')} {currentFormat.name}.
              <br />
              {t('articles.printerSetup')}
            </p>
          </div>
        </div>
      </Modal>
    );
  };

  // ============== MODAL AJOUT ARTICLE ==============
  const handleSubmitNewItem = () => {
    // Si on édite un article existant
    if (editingItem) {
      // Calculer le prix de vente avec EBITDA cible
      const targetEbitdaVal = parseFloat(newItemData.targetEbitda !== undefined ? newItemData.targetEbitda : targetEbitda) || 0;
      const calculatedSalePrice = newItemData.costPrice && targetEbitdaVal > 0
        ? newItemData.costPrice * (1 + targetEbitdaVal / 100)
        : 0;

      const updatedData = {
        ...newItemData,
        costPrice: parseFloat(newItemData.costPrice) || 0,
        salePrice: parseFloat(calculatedSalePrice) || 0,
        baseEbitda: parseFloat(newItemData.baseEbitda !== undefined ? newItemData.baseEbitda : baseEbitda) || 0,
        targetEbitda: parseFloat(targetEbitdaVal) || 0
      };

      updateItem(editingItem.id, updatedData);
      setEditingItem(null);
      handleCloseAddModal();
      return;
    }

    // Validation du nom et de la catégorie (toujours obligatoires)
    if (!newItemData.name || !newItemData.category) {
      notify(t('messages.error.fillRequired'), 'error');
      return;
    }

    // Vérifier qu'au moins une succursale est sélectionnée
    if (!newItemData.locations || newItemData.locations.length === 0) {
      notify(t('messages.error.selectOneBranch'), 'error');
      return;
    }

    // Validation quantités & prix (PARITÉ avec l'import Excel) : empêche d'enregistrer des seuils
    // incohérents (min >= max) ou des valeurs négatives qui faussent le statut (low/optimal/surplus)
    // et la valorisation du stock. Auparavant ces controles n'existaient que dans l'import.
    if ((Number(newItemData.costPrice) || 0) < 0) {
      notify(language === 'fr' ? 'Le prix coûtant ne peut pas être négatif.' : 'Cost price cannot be negative.', 'error');
      return;
    }
    for (const loc of newItemData.locations) {
      const q = Number(loc.quantity) || 0, mn = Number(loc.minQuantity) || 0, mx = Number(loc.maxQuantity) || 0;
      if (q < 0 || mn < 0 || mx < 0) {
        notify((language === 'fr' ? 'Quantités négatives interdites' : 'Negative quantities not allowed') + ` (${loc.department || (language === 'fr' ? 'emplacement' : 'location')}).`, 'error');
        return;
      }
      if (mx > 0 && mn >= mx) {
        notify((language === 'fr' ? 'La quantité min doit être inférieure à la max' : 'Min quantity must be less than max') + ` (${loc.department || (language === 'fr' ? 'emplacement' : 'location')}).`, 'error');
        return;
      }
    }

    // Validation selon le type de code
    if (newItemData.differentCodes) {
      // Si codes différents: vérifier que chaque location a un code personnalisé
      const missingCodes = newItemData.locations.filter(loc => !loc.customCode || loc.customCode.trim() === '');
      if (missingCodes.length > 0) {
        notify(t('messages.error.customCodeRequired'), 'error');
        return;
      }
    } else {
      // Si code unique: vérifier que le code principal est rempli
      if (!newItemData.code || !newItemData.code.trim()) {
        notify(t('messages.error.codeRequired'), 'error');
        return;
      }
    }

    // Vérifier code unique (principal ou personnalisés)
    if (!newItemData.differentCodes) {
      if (items.find(item => item.code === newItemData.code)) {
        notify(t('messages.error.codeExists'), 'error');
        return;
      }
    } else {
      // Vérifier que les codes personnalisés ne sont pas déjà utilisés
      for (const loc of newItemData.locations) {
        if (items.find(item => item.code === loc.customCode)) {
          notify((language === 'fr' ? `Le code « ${loc.customCode} » existe déjà` : `Code "${loc.customCode}" already exists`), 'error');
          return;
        }
      }
    }

    // Calculer la date de prochaine révision des prix
    const interval = newItemData.priceUpdateInterval === 'custom'
      ? newItemData.customPriceInterval
      : parseInt(newItemData.priceUpdateInterval || '3');

    const today = new Date();
    const nextPriceUpdate = new Date(today);
    nextPriceUpdate.setMonth(nextPriceUpdate.getMonth() + interval);

    // Calculer le prix de vente avec EBITDA cible
    const targetEbitdaVal = parseFloat(newItemData.targetEbitda !== undefined ? newItemData.targetEbitda : targetEbitda) || 0;
    const calculatedSalePrice = newItemData.costPrice && targetEbitdaVal > 0
      ? newItemData.costPrice * (1 + targetEbitdaVal / 100)
      : 0;

    // Créer un seul article avec plusieurs localisations
    const newItem = {
      id: Date.now().toString(),
      // Si codes différents, utiliser le premier code personnalisé comme code principal, sinon utiliser le code unique
      code: newItemData.differentCodes
        ? newItemData.locations[0].customCode
        : newItemData.code,
      name: newItemData.name,
      category: newItemData.category,
      costPrice: parseFloat(newItemData.costPrice) || 0,
      salePrice: parseFloat(calculatedSalePrice) || 0,
      baseEbitda: parseFloat(newItemData.baseEbitda !== undefined ? newItemData.baseEbitda : baseEbitda) || 0,
      targetEbitda: parseFloat(targetEbitdaVal) || 0,
      unit: newItemData.unit,
      description: newItemData.description,
      supplier: newItemData.supplier,
      articleType: newItemData.articleType || 'sale',
      // Données de révision des prix
      priceUpdateInterval: newItemData.priceUpdateInterval || '3',
      customPriceInterval: newItemData.customPriceInterval,
      lastPriceUpdate: new Date().toISOString(),
      nextPriceUpdate: nextPriceUpdate.toISOString(),
      locations: newItemData.locations.map(loc => ({
        ...loc,
        // Utiliser le code personnalisé si "codes différents" est activé, sinon code principal + suffixe
        qrCode: newItemData.differentCodes
          ? loc.customCode
          : `${newItemData.code}-${loc.departmentCode}`
      })),
      differentCodes: newItemData.differentCodes || false,
      // Pour la compatibilité, garder le premier emplacement comme principal
      department: newItemData.locations[0].department,
      location: newItemData.locations[0].location,
      quantity: newItemData.locations.reduce((sum, loc) => sum + loc.quantity, 0), // Total global
      minQuantity: newItemData.locations[0].minQuantity,
      maxQuantity: newItemData.locations[0].maxQuantity,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.username || 'system',
      isMultiLocation: true // Flag pour identifier les articles multi-localisations
    };

    addItem(newItem);

    setShowItemForm(false);
    setNewItemData({
      code: '',
      name: '',
      category: '',
      locations: [],
      costPrice: 0,
      salePrice: 0,
      baseEbitda: baseEbitda,
      targetEbitda: targetEbitda,
      unit: 'Pièce',
      description: '',
      supplier: '',
      articleType: 'sale'
    });
    setAddItemMode('simple');

    notify(`${t('messages.success.articleCreated')} ${newItemData.locations.length} ${t('articles.branches')}`);
  };

  const handleCloseAddModal = () => {
    setShowItemForm(false);
    setEditingItem(null);
    setAddItemMode('simple');
    setImportStep('upload');
    setImportData([]);
    setImportErrors([]);
    // Réinitialiser le formulaire
    setNewItemData({
      code: '',
      name: '',
      category: '',
      department: '',
      location: '',
      quantity: 0,
      minQuantity: 0,
      maxQuantity: 0,
      costPrice: 0,
      salePrice: 0,
      baseEbitda: baseEbitda,
      targetEbitda: targetEbitda,
      unit: '',
      description: '',
      supplier: '',
      articleType: 'sale',
      differentCodes: false,
      locations: [],
      photos: [],
      colors: [],
      dimensions: { length: '', width: '', height: '', unit: 'cm' },
      weight: { value: '', unit: 'kg' },
      serialNumber: '',
      model: '',
      brand: '',
      condition: 'new',
      priceUpdateInterval: '3',
      customPriceInterval: 0,
      storageLocation: null
    });
  };

  const AddItemModal = () => (
      <Modal
        isOpen={showItemForm}
        onClose={() => {
          setShowItemForm(false);
          setAddItemMode('simple');
          setImportStep('upload');
          setImportData([]);
          setImportErrors([]);
        }}
        title={t('articles.addArticles')}
      >
        <div className="space-y-6">
          {/* Choix du mode */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setAddItemMode('simple')}
              className={`p-6 rounded-xl border-2 transition-all ${
                addItemMode === 'simple'
                  ? 'border-slate-600 bg-slate-50 dark:bg-orange-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-orange-300'
              }`}
            >
              <Package size={32} className={`mx-auto mb-3 ${addItemMode === 'simple' ? 'text-slate-600' : 'text-gray-400'}`} />
              <h3 className={`font-bold mb-1 ${addItemMode === 'simple' ? 'text-orange-700 dark:text-slate-400' : 'text-gray-700 dark:text-gray-300'}`}>
                {t('articles.simpleArticle')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('articles.addSingleManually')}
              </p>
            </button>

            <button
              onClick={() => setAddItemMode('excel')}
              className={`p-6 rounded-xl border-2 transition-all ${
                addItemMode === 'excel'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-green-300'
              }`}
            >
              <FileSpreadsheet size={32} className={`mx-auto mb-3 ${addItemMode === 'excel' ? 'text-green-600' : 'text-gray-400'}`} />
              <h3 className={`font-bold mb-1 ${addItemMode === 'excel' ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                {t('articles.existingList')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('articles.importMultipleExcel')}
              </p>
            </button>
          </div>

          {/* Formulaire article simple */}
          {addItemMode === 'simple' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {t('articles.code')} * <span className="text-red-500">●</span>
                  </label>
                  <input
                    key="item-code-input"
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                    value={newItemData.code}
                    onChange={(e) => handleNewItemChange('code', e.target.value)}
                    placeholder="EPI-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {t('articles.name')} * <span className="text-red-500">●</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                    value={newItemData.name}
                    onChange={(e) => handleNewItemChange('name', e.target.value)}
                    placeholder="Masque N95"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {t('articles.category')} * <span className="text-red-500">●</span>
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                    value={newItemData.category}
                    onChange={(e) => handleNewItemChange('category', e.target.value)}
                  >
                    <option value="">{t('actions.select')}...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {t('common.department')} * <span className="text-red-500">●</span>
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                    value={newItemData.department}
                    onChange={(e) => handleNewItemChange('department', e.target.value)}
                  >
                    <option value="">{t('actions.select')}...</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Localisation
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                  value={newItemData.location}
                  onChange={(e) => handleNewItemChange('location', e.target.value)}
                  placeholder={t('common.locationPlaceholder')}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {t('articles.quantity')}
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                    value={newItemData.quantity}
                    onChange={(e) => handleNewItemChange('quantity', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Qté Min
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                    value={newItemData.minQuantity}
                    onChange={(e) => handleNewItemChange('minQuantity', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Qté Max
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                    value={newItemData.maxQuantity}
                    onChange={(e) => handleNewItemChange('maxQuantity', parseInt(e.target.value) || 100)}
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {t('articles.costPriceShort')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                    value={newItemData.costPrice}
                    onChange={(e) => handleNewItemChange('costPrice', parseFloat(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Prix Vente ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                    value={newItemData.salePrice}
                    onChange={(e) => handleNewItemChange('salePrice', parseFloat(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    {t('articles.unit')}
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                    value={newItemData.unit}
                    onChange={(e) => handleNewItemChange('unit', e.target.value)}
                  >
                    <option>{t('articles.units.piece')}</option>
                    <option>{t('articles.units.box')}</option>
                    <option>{t('articles.units.pack')}</option>
                    <option>{t('articles.units.kg')}</option>
                    <option>{t('articles.units.l')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t('articles.description')}
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                  rows="3"
                  value={newItemData.description}
                  onChange={(e) => handleNewItemChange('description', e.target.value)}
                  placeholder={t('articles.description') + '...'}
                />
              </div>

              {/* Toggle pour champs avancés */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdvancedFields(!showAdvancedFields)}
                  className="flex items-center justify-between w-full px-4 py-3 bg-gradient-to-r from-orange-50 to-blue-50 dark:from-orange-900/20 dark:to-blue-900/20 rounded-lg hover:from-orange-100 hover:to-blue-100 dark:hover:from-orange-900/30 dark:hover:to-blue-900/30 transition-all"
                >
                  <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Package size={20} />
                    Informations avancées (Photos, Dimensions, etc.)
                  </span>
                  {showAdvancedFields ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>

              {/* Champs avancés */}
              {showAdvancedFields && (
                <div className="space-y-4 border-2 border-orange-200 dark:border-orange-800 rounded-lg p-4 bg-gradient-to-br from-orange-50/50 to-blue-50/50 dark:from-orange-900/10 dark:to-blue-900/10">
                  {/* Carrousel de photos */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <Camera size={18} />
                      Photos de l'article
                    </label>

                    {newItemData.photos.length > 0 ? (
                      <div className="relative">
                        {/* Image principale */}
                        <div className="relative h-64 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                          <img
                            src={newItemData.photos[currentPhotoIndex].url}
                            alt={`Photo ${currentPhotoIndex + 1}`}
                            className="w-full h-full object-contain"
                          />

                          {/* Boutons de navigation */}
                          {newItemData.photos.length > 1 && (
                            <>
                              <button
                                type="button"
                                onClick={prevPhoto}
                                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all"
                              >
                                <ChevronLeft size={24} />
                              </button>
                              <button
                                type="button"
                                onClick={nextPhoto}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all"
                              >
                                <ChevronRight size={24} />
                              </button>
                            </>
                          )}

                          {/* Bouton supprimer */}
                          <button
                            type="button"
                            onClick={() => removePhoto(currentPhotoIndex)}
                            className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-full text-white transition-all"
                          >
                            <X size={20} />
                          </button>

                          {/* Indicateur de position */}
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/70 text-white text-sm rounded-full">
                            {currentPhotoIndex + 1} / {newItemData.photos.length}
                          </div>
                        </div>

                        {/* Miniatures */}
                        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                          {newItemData.photos.map((photo, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setCurrentPhotoIndex(index)}
                              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                index === currentPhotoIndex
                                  ? 'border-slate-600 ring-2 ring-orange-300'
                                  : 'border-gray-300 dark:border-gray-600 hover:border-orange-300'
                              }`}
                            >
                              <img src={photo.url} alt={`Miniature ${index + 1}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                        <Camera size={48} className="mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Aucune photo ajoutée</p>
                      </div>
                    )}

                    {/* Bouton ajouter photos */}
                    <label className="mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-700 text-white rounded-lg cursor-pointer transition-all">
                      <Plus size={20} />
                      Ajouter des photos
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Couleurs */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Couleurs disponibles
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {newItemData.colors.map((color, index) => (
                        <span key={index} className="px-3 py-1 bg-slate-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full text-sm flex items-center gap-2">
                          {color}
                          <button type="button" onClick={() => removeColor(color)} className="hover:text-red-600">
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="colorInput"
                        placeholder="Ex: Rouge, Bleu..."
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addColor(e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('colorInput');
                          addColor(input.value);
                          input.value = '';
                        }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Dimensions */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Dimensions (L × l × H)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      <input
                        type="number"
                        placeholder="Longueur"
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                        value={newItemData.dimensions.length}
                        onChange={(e) => handleNewItemChange('dimensions', {...newItemData.dimensions, length: e.target.value})}
                      />
                      <input
                        type="number"
                        placeholder="Largeur"
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                        value={newItemData.dimensions.width}
                        onChange={(e) => handleNewItemChange('dimensions', {...newItemData.dimensions, width: e.target.value})}
                      />
                      <input
                        type="number"
                        placeholder="Hauteur"
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                        value={newItemData.dimensions.height}
                        onChange={(e) => handleNewItemChange('dimensions', {...newItemData.dimensions, height: e.target.value})}
                      />
                      <select
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                        value={newItemData.dimensions.unit}
                        onChange={(e) => handleNewItemChange('dimensions', {...newItemData.dimensions, unit: e.target.value})}
                      >
                        <option value="cm">cm</option>
                        <option value="m">m</option>
                        <option value="in">in</option>
                        <option value="ft">ft</option>
                      </select>
                    </div>
                  </div>

                  {/* Poids */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Poids
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                          value={newItemData.weight.value}
                          onChange={(e) => handleNewItemChange('weight', {...newItemData.weight, value: e.target.value})}
                        />
                        <select
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                          value={newItemData.weight.unit}
                          onChange={(e) => handleNewItemChange('weight', {...newItemData.weight, unit: e.target.value})}
                        >
                          <option value="g">g</option>
                          <option value="kg">kg</option>
                          <option value="lb">lb</option>
                          <option value="oz">oz</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        État
                      </label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                        value={newItemData.condition}
                        onChange={(e) => handleNewItemChange('condition', e.target.value)}
                      >
                        <option value="new">Neuf</option>
                        <option value="used">Utilisé</option>
                        <option value="refurbished">Reconditionné</option>
                      </select>
                    </div>
                  </div>

                  {/* Marque, Modèle, Numéro de série */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Marque
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Samsung"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                        value={newItemData.brand}
                        onChange={(e) => handleNewItemChange('brand', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Modèle
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Galaxy S24"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                        value={newItemData.model}
                        onChange={(e) => handleNewItemChange('model', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        N° de série
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: SN123456789"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                        value={newItemData.serialNumber}
                        onChange={(e) => handleNewItemChange('serialNumber', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Garantie */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Garantie
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 2 ans, 24 mois"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                      value={newItemData.warranty}
                      onChange={(e) => handleNewItemChange('warranty', e.target.value)}
                    />
                  </div>

                  {/* Prix de location (si article en location) */}
                  {(newItemData.articleType === 'rental' || newItemData.articleType === 'both') && (
                    <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div>
                        <label className="block text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                          Prix de location
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                          value={newItemData.rentalPrice}
                          onChange={(e) => handleNewItemChange('rentalPrice', parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                          Période
                        </label>
                        <select
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                          value={newItemData.rentalPeriod}
                          onChange={(e) => handleNewItemChange('rentalPeriod', e.target.value)}
                        >
                          <option value="hour">Par heure</option>
                          <option value="day">Par jour</option>
                          <option value="week">Par semaine</option>
                          <option value="month">Par mois</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button variant="secondary" onClick={() => setShowItemForm(false)}>
                  {t('actions.cancel')}
                </Button>
                <Button
                  variant="primary"
                  icon={editingItem ? null : Plus}
                  onClick={handleSubmitNewItem}
                  className="flex-1"
                >
                  {editingItem ? t('actions.save') : t('articles.addTheArticle')}
                </Button>
              </div>
            </div>
          )}

          {/* Import Excel */}
          {addItemMode === 'excel' && (
            <ImportExcelContent />
          )}
        </div>
      </Modal>
  );

  // Contenu import Excel (réutilisable)
  const ImportExcelContent = () => {
    return (
      <div className="space-y-6">
        {/* Étape 1: Upload */}
        {importStep === 'upload' && (
          <>
            {/* IMPORT IA — gabarit strict (SITE/DÉPARTEMENT/EMPLACEMENT obligatoires) */}
            <div className="rounded-xl border-2 border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 p-5">
              <div className="mb-1 flex items-center gap-2">
                <Zap size={18} className="text-purple-600 dark:text-purple-400" />
                <h3 className="font-bold text-purple-900 dark:text-purple-300">{language === 'fr' ? 'Import intelligent (IA)' : 'Smart import (AI)'}</h3>
              </div>
              <p className="mb-3 text-sm text-purple-800 dark:text-purple-300">
                {language === 'fr'
                  ? "Le fichier doit suivre le gabarit. Colonnes obligatoires : SITE, DÉPARTEMENT, EMPLACEMENT. Sinon la feuille est refusée. L'IA classe les autres colonnes au bon endroit."
                  : 'The file must follow the template. Required columns: SITE, DEPARTMENT, EMPLACEMENT. Otherwise the sheet is refused. The AI maps the other columns.'}
              </p>
              {aiRefusal && (
                <div className="mb-3 rounded-lg border-2 border-red-400 bg-red-50 p-3 text-sm dark:border-red-700 dark:bg-red-900/20">
                  <p className="font-bold text-red-700 dark:text-red-300">⛔ {language === 'fr' ? 'Feuille refusée — non conforme' : 'Sheet refused — not conforming'}</p>
                  <p className="mt-1 text-red-700 dark:text-red-300">{language === 'fr' ? 'Critère(s) minimum manquant(s) :' : 'Missing minimum criteria:'} <strong>{aiRefusal.missing.join(', ')}</strong></p>
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400">{language === 'fr'
                    ? 'Le tableau doit contenir des colonnes claires SITE, DÉPARTEMENT et EMPLACEMENT (au minimum). Colonnes complètes recommandées : EMPLACEMENT · TABLETTE · POSITION · INVENTAIRE · IDENTIFICATION · MIN · MAX · SITE · DÉPARTEMENT · FOURNISSEUR · CATÉGORIE · PRIX ($) · CODE ITEM.'
                    : 'The table must contain clear SITE, DEPARTMENT and EMPLACEMENT columns (minimum). Recommended full columns: EMPLACEMENT · TABLETTE · POSITION · INVENTAIRE · IDENTIFICATION · MIN · MAX · SITE · DEPARTMENT · FOURNISSEUR · CATEGORIE · PRIX ($) · CODE ITEM.'}</p>
                </div>
              )}
              <button
                onClick={() => aiFileInputRef.current?.click()}
                disabled={aiImporting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-base font-bold text-white shadow hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {aiImporting ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {aiProgress && aiProgress.total > 1
                      ? (language === 'fr' ? `Analyse IA… lot ${aiProgress.done}/${aiProgress.total}` : `AI analysis… batch ${aiProgress.done}/${aiProgress.total}`)
                      : (language === 'fr' ? 'Analyse IA…' : 'AI analysis…')}
                  </>
                ) : (language === 'fr' ? '✨ Importer via IA (Excel)' : '✨ Import via AI (Excel)')}
              </button>
              {aiImporting && (
                <button onClick={cancelAiImport} className="mt-2 w-full rounded-lg border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20">
                  {language === 'fr' ? "Annuler l'import" : 'Cancel import'}
                </button>
              )}
              <input
                ref={aiFileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAiFileUpload(f); e.currentTarget.value = ''; }}
              />
              <p className="mt-2 text-[11px] leading-relaxed text-purple-700 dark:text-purple-400">
                {language === 'fr'
                  ? "Aucune limite pratique sur le nombre total d'articles : les gros fichiers (plus de 1000) sont découpés automatiquement en lots de 40 lignes. Les catégories et départements absents sont créés au besoin. Rien n'est enregistré avant ta validation dans la prévisualisation."
                  : 'No practical limit on total articles: large files (1000+) are auto-split into batches of 40 rows. Missing categories and departments are created as needed. Nothing is saved until you confirm in the preview.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
              <span className="text-[11px] uppercase tracking-wide text-gray-400">{language === 'fr' ? 'ou import standard (modèle)' : 'or standard import (template)'}</span>
              <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            </div>

            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-green-500 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
                  setImportFile(file);
                  handleFileUpload(file);
                }
              }}
            >
              <FileSpreadsheet size={64} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('articles.excel.dragDrop')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {t('articles.excel.clickToSelect')}
              </p>
              <p className="text-xs text-gray-500">
                {t('articles.excel.acceptedFormats')}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setImportFile(file);
                    handleFileUpload(file);
                  }
                }}
              />
            </div>

            <div className="space-y-3">
              <Button variant="primary" icon={Download} onClick={downloadExcelTemplate} className="w-full">
                {t('articles.excel.downloadTemplateIcon')}
              </Button>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-400 mb-2">
                  {t('articles.excel.instructions')}
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>{t('articles.excel.step1')}</li>
                  <li>2. {t('articles.excelInstruction4')}</li>
                  <li>3. {t('articles.excelInstruction5')}</li>
                  <li>{t('articles.excel.step4')}</li>
                </ul>
              </div>
            </div>
          </>
        )}

        {/* Les étapes preview et complete restent les mêmes - on les copie du ImportExcelModal */}
        {importStep === 'preview' && <ImportPreviewContent />}
        {importStep === 'complete' && <ImportCompleteContent />}
      </div>
    );
  };

  // Composants pour les étapes d'import
  const ImportPreviewContent = () => (
    <>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={20} className="text-green-600" />
            <span className="font-semibold text-green-900 dark:text-green-400">{t('common.valid')}</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {importData.filter(item => item.errors.length === 0).length}
          </p>
        </div>

        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={20} className="text-red-600" />
            <span className="font-semibold text-red-900 dark:text-red-400">{t('common.errors')}</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{importErrors.length}</p>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <FileSpreadsheet size={20} className="text-blue-600" />
            <span className="font-semibold text-blue-900 dark:text-blue-400">{t('common.total')}</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{importData.length}</p>
        </div>
      </div>

      {importErrors.length > 0 && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-600 max-h-48 overflow-y-auto">
          <h4 className="font-semibold text-red-900 dark:text-red-400 mb-3 flex items-center gap-2">
            <AlertTriangle size={18} />
            {t('common.errorsDetected')}:
          </h4>
          <div className="space-y-2">
            {importErrors.map((error, index) => (
              <div key={index} className="text-sm text-red-800 dark:text-red-300">
                <strong>{t('common.lineNumber')} {error.line} ({error.code}):</strong> {error.errors.join(', ')}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold">{t('common.status')}</th>
              <th className="px-3 py-2 text-left text-xs font-semibold">{t('common.code')}</th>
              <th className="px-3 py-2 text-left text-xs font-semibold">{t('articles.name')}</th>
              <th className="px-3 py-2 text-left text-xs font-semibold">{t('common.qty')}</th>
              <th className="px-3 py-2 text-left text-xs font-semibold">{t('common.category')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {importData.map((item, index) => (
              <tr key={index} className={item.errors.length > 0 ? 'bg-red-50 dark:bg-red-900/10' : index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}>
                <td className="px-3 py-2">
                  {item.errors.length === 0 ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : (
                    <XCircle size={16} className="text-red-600" />
                  )}
                </td>
                <td className="px-3 py-2 font-mono text-xs">{item.code}</td>
                <td className="px-3 py-2">{item.name}</td>
                <td className="px-3 py-2">{item.quantity}</td>
                <td className="px-3 py-2 text-xs">{item.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => {setImportStep('upload'); setImportData([]); setImportErrors([]); setImportFile(null);}}>
          Retour
        </Button>
        <Button
          variant="success"
          icon={CheckSquare}
          onClick={() => {confirmImport(); setShowItemForm(false);}}
          disabled={importData.filter(item => item.errors.length === 0).length === 0}
          className="flex-1"
        >
          Importer {importData.filter(item => item.errors.length === 0).length} article(s)
        </Button>
      </div>
    </>
  );

  const ImportCompleteContent = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle size={32} className="text-green-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Import réussi!
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {importData.filter(item => item.errors.length === 0).length} article(s) ont été ajoutés
      </p>

      {importErrors.length > 0 && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-6">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            {importErrors.length} ligne(s) ignorées
          </p>
        </div>
      )}

      <Button variant="primary" onClick={() => {setShowItemForm(false); setImportStep('upload'); setImportData([]); setImportErrors([]); setView('articles');}}>
        {t('articles.viewArticles')}
      </Button>
    </div>
  );

  // ============== MODAL IMPORT EXCEL (STANDALONE) ==============
  const ImportExcelModal = () => {
    return (
      <Modal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setImportFile(null);
          setImportData([]);
          setImportErrors([]);
          setImportStep('upload');
        }}
        title={t('articles.importExcelInventory')}
      >
        <div className="space-y-6">
          {/* Étape 1: Upload */}
          {importStep === 'upload' && (
            <>
              {/* IMPORT IA — n'importe quelle feuille, colonnes detectees automatiquement */}
              <div className="rounded-xl border-2 border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 p-5">
                <div className="mb-1 flex items-center gap-2">
                  <Zap size={18} className="text-purple-600 dark:text-purple-400" />
                  <h3 className="font-bold text-purple-900 dark:text-purple-300">{language === 'fr' ? 'Import intelligent (IA)' : 'Smart import (AI)'}</h3>
                </div>
                <p className="mb-3 text-sm text-purple-800 dark:text-purple-300">
                  {language === 'fr'
                    ? "Le fichier doit suivre le gabarit. Colonnes obligatoires : SITE, DÉPARTEMENT, EMPLACEMENT. Sinon la feuille est refusée. L'IA classe les autres colonnes au bon endroit."
                    : 'The file must follow the template. Required columns: SITE, DEPARTMENT, EMPLACEMENT. Otherwise the sheet is refused. The AI maps the other columns.'}
                </p>
                {aiRefusal && (
                  <div className="mb-3 rounded-lg border-2 border-red-400 bg-red-50 p-3 text-sm dark:border-red-700 dark:bg-red-900/20">
                    <p className="font-bold text-red-700 dark:text-red-300">⛔ {language === 'fr' ? 'Feuille refusée — non conforme' : 'Sheet refused — not conforming'}</p>
                    <p className="mt-1 text-red-700 dark:text-red-300">{language === 'fr' ? 'Critère(s) minimum manquant(s) :' : 'Missing minimum criteria:'} <strong>{aiRefusal.missing.join(', ')}</strong></p>
                    <p className="mt-2 text-xs text-red-600 dark:text-red-400">{language === 'fr'
                      ? 'Colonnes recommandées : EMPLACEMENT · TABLETTE · POSITION · INVENTAIRE · IDENTIFICATION · MIN · MAX · SITE · DÉPARTEMENT · FOURNISSEUR · CATÉGORIE · PRIX ($) · CODE ITEM.'
                      : 'Recommended columns: EMPLACEMENT · TABLETTE · POSITION · INVENTAIRE · IDENTIFICATION · MIN · MAX · SITE · DEPARTMENT · FOURNISSEUR · CATEGORIE · PRIX ($) · CODE ITEM.'}</p>
                  </div>
                )}
                <button
                  onClick={() => aiFileInputRef.current?.click()}
                  disabled={aiImporting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-base font-bold text-white shadow hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {aiImporting ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      {aiProgress && aiProgress.total > 1
                        ? (language === 'fr' ? `Analyse IA… lot ${aiProgress.done}/${aiProgress.total}` : `AI analysis… batch ${aiProgress.done}/${aiProgress.total}`)
                        : (language === 'fr' ? 'Analyse IA…' : 'AI analysis…')}
                    </>
                  ) : (language === 'fr' ? '✨ Importer via IA (Excel)' : '✨ Import via AI (Excel)')}
                </button>
                {aiImporting && (
                  <button onClick={cancelAiImport} className="mt-2 w-full rounded-lg border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20">
                    {language === 'fr' ? "Annuler l'import" : 'Cancel import'}
                  </button>
                )}
                <input
                  ref={aiFileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAiFileUpload(f); e.currentTarget.value = ''; }}
                />
                <p className="mt-2 text-[11px] leading-relaxed text-purple-700 dark:text-purple-400">
                  {language === 'fr'
                    ? "Aucune limite pratique sur le nombre total d'articles : les gros fichiers (plus de 1000) sont découpés automatiquement en lots de 40 lignes. Les catégories et départements absents sont créés au besoin. Rien n'est enregistré avant ta validation dans la prévisualisation."
                    : 'No practical limit on total articles: large files (1000+) are auto-split into batches of 40 rows. Missing categories and departments are created as needed. Nothing is saved until you confirm in the preview.'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                <span className="text-[11px] uppercase tracking-wide text-gray-400">{language === 'fr' ? 'ou import standard (modèle)' : 'or standard import (template)'}</span>
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
              </div>

              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-slate-600 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
                    setImportFile(file);
                    handleFileUpload(file);
                  }
                }}
              >
                <FileSpreadsheet size={64} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('articles.excel.dragDrop')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {t('articles.excel.clickToSelect')}
                </p>
                <p className="text-xs text-gray-500">
                  {t('articles.excel.acceptedFormats')}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setImportFile(file);
                      handleFileUpload(file);
                    }
                  }}
                />
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-400 mb-2">
                  {t('articles.excel.beforeImporting')}
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• {t('articles.excel.instructionDownload')}</li>
                  <li>• {t('articles.excel.instructionStructure')}</li>
                  <li>• {t('articles.excel.instructionUniqueCodes')}</li>
                  <li>• {t('articles.excel.instructionCategories')}</li>
                </ul>
              </div>
            </>
          )}

          {/* Étape 2: Prévisualisation */}
          {importStep === 'preview' && (
            <>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={20} className="text-green-600" />
                    <span className="font-semibold text-green-900 dark:text-green-400">{t('common.valid')}</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {importData.filter(item => item.errors.length === 0).length}
                  </p>
                </div>

                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={20} className="text-red-600" />
                    <span className="font-semibold text-red-900 dark:text-red-400">{t('common.errors')}</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{importErrors.length}</p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <FileSpreadsheet size={20} className="text-blue-600" />
                    <span className="font-semibold text-blue-900 dark:text-blue-400">{t('common.total')}</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{importData.length}</p>
                </div>
              </div>

              {/* Liste des erreurs */}
              {importErrors.length > 0 && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-600 max-h-48 overflow-y-auto">
                  <h4 className="font-semibold text-red-900 dark:text-red-400 mb-3 flex items-center gap-2">
                    <AlertTriangle size={18} />
                    {t('common.errorsDetected')}:
                  </h4>
                  <div className="space-y-2">
                    {importErrors.map((error, index) => (
                      <div key={index} className="text-sm text-red-800 dark:text-red-300">
                        <strong>{t('common.lineNumber')} {error.line} ({error.code}):</strong>{' '}
                        {error.errors.join(', ')}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tableau de prévisualisation */}
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold">{t('common.status')}</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold">{t('common.code')}</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold">{t('articles.name')}</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold">{t('common.qty')}</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold">{t('common.category')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {importData.map((item, index) => (
                      <tr
                        key={index}
                        className={`${
                          item.errors.length > 0
                            ? 'bg-red-50 dark:bg-red-900/10'
                            : index % 2 === 0
                            ? 'bg-white dark:bg-gray-800'
                            : 'bg-gray-50 dark:bg-gray-900'
                        }`}
                      >
                        <td className="px-3 py-2">
                          {item.errors.length === 0 ? (
                            <CheckCircle size={16} className="text-green-600" />
                          ) : (
                            <XCircle size={16} className="text-red-600" />
                          )}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">{item.code}</td>
                        <td className="px-3 py-2">{item.name}</td>
                        <td className="px-3 py-2">{item.quantity}</td>
                        <td className="px-3 py-2 text-xs">{item.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setImportStep('upload');
                    setImportData([]);
                    setImportErrors([]);
                    setImportFile(null);
                  }}
                >
                  Retour
                </Button>
                <Button
                  variant="success"
                  icon={CheckSquare}
                  onClick={confirmImport}
                  disabled={importData.filter(item => item.errors.length === 0).length === 0}
                  className="flex-1"
                >
                  Importer {importData.filter(item => item.errors.length === 0).length} article(s)
                </Button>
              </div>
            </>
          )}

          {/* Étape 3: Résultat */}
          {importStep === 'complete' && (
            <>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Import réussi!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {importData.filter(item => item.errors.length === 0).length} article(s) ont été ajoutés à votre inventaire
                </p>

                {importErrors.length > 0 && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-6">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      {importErrors.length} ligne(s) ignorées en raison d'erreurs
                    </p>
                  </div>
                )}

                <Button
                  variant="primary"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportStep('upload');
                    setImportData([]);
                    setImportErrors([]);
                    setImportFile(null);
                    setView('articles');
                  }}
                >
                  {t('articles.viewArticles')}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    );
  };

  // ============== MODAL LOGIN ==============
  // LoginModal est désormais un composant de haut niveau (défini hors de AppContent) -> plus de remount.

  // ============== RENDU PRINCIPAL ==============
  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-100 dark:bg-gray-900">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-gray-300 border-t-transparent dark:border-gray-600 dark:border-t-transparent" aria-label={language === 'fr' ? 'Chargement' : 'Loading'} />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Navigation du module alignée sur les autres modules (PortalHeader unifié au-dessus) :
          barre d'onglets en pilules sur desktop + menu déroulant sur mobile (plus de sidebar verticale). */}
      <div className="w-full px-2 py-3 sm:px-3">
        {saveError && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
            <span>⚠️</span>
            <div className="flex-1">
              <b>{language === 'fr' ? 'Sauvegarde cloud échouée' : 'Cloud save failed'}</b> — {saveError}. {language === 'fr' ? 'Vos modifications ne sont pas encore enregistrées en ligne (réessai automatique à la prochaine modification).' : 'Your changes are not yet saved online (auto-retry on next change).'}
            </div>
            <button onClick={() => setSaveError(null)} className="text-red-500 hover:text-red-700">✕</button>
          </div>
        )}
        {(() => {
          const NAV_ITEMS = [
            { id: 'dashboard', icon: LayoutDashboard, label: t('nav.dashboard'), badge: null },
            { id: 'articles', icon: Package, label: t('nav.articles'), badge: stats.total || null },
            { id: 'scanner', icon: Camera, label: t('nav.scanner'), badge: null },
            { id: 'movements', icon: TrendingUp, label: t('nav.movements'), badge: movements.length || null },
            { id: 'analytics', icon: Layers, label: language === 'fr' ? 'Analytique' : 'Analytics', badge: inventoryAnalytics.reorder.length || null },
            { id: 'reports', icon: FileText, label: t('nav.reports'), badge: null },
            { id: 'admin', icon: Settings, label: t('nav.administration'), badge: stats.lowStock > 0 ? stats.lowStock : null },
          ];
          const activeNav = NAV_ITEMS.find(n => n.id === view) || NAV_ITEMS[0];
          return (
            <>
              {/* Mobile / demi-écran (<1024px) : menu déroulant */}
              <div className="mb-4 lg:hidden">
                <div className="relative">
                  <button onClick={() => setNavMenuOpen(o => !o)}
                    className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                    <span className="flex items-center gap-2">{React.createElement(activeNav.icon, { size: 16 })}{activeNav.label}</span>
                    <svg className={`h-5 w-5 text-gray-400 transition-transform ${navMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {navMenuOpen && (
                    <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
                      {NAV_ITEMS.map(it => { const Icon = it.icon; return (
                        <button key={it.id} onClick={() => { setView(it.id); setNavMenuOpen(false); }}
                          className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold transition ${view === it.id ? 'bg-slate-700 text-white' : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700'}`}>
                          <Icon size={15} /> <span className="flex-1 text-left">{it.label}</span>
                          {it.badge != null && <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${view === it.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>{it.badge}</span>}
                        </button>
                      ); })}
                    </div>
                  )}
                </div>
              </div>
              {/* Desktop (>=1024px) : barre d'onglets pilules */}
              <div className="mb-4 hidden gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:flex">
                {NAV_ITEMS.map(it => { const Icon = it.icon; const active = view === it.id; return (
                  <button key={it.id} onClick={() => setView(it.id)}
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${active ? 'bg-slate-700 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                    <Icon size={15} /> {it.label}
                    {it.badge != null && <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>{it.badge}</span>}
                  </button>
                ); })}
              </div>
            </>
          );
        })()}

        <main className="overflow-x-hidden" key={view}>
          {/* Le compteur de forfait IA n'est PLUS ici : il est app-wide, dans Administration → Abonnement. */}
          {view === 'dashboard' && <DashboardView
            key="dashboard-view"
            t={t}
            items={items}
            categories={categories}
            departments={departments}
            dashboardFilters={dashboardFilters}
            setDashboardFilters={setDashboardFilters}
            showDashboardFilters={showDashboardFilters}
            setShowDashboardFilters={setShowDashboardFilters}
            setShowItemForm={setShowItemForm}
            setView={setView}
            handleSort={handleSort}
            printCurrentView={printCurrentView}
            paginatedItems={paginatedItems}
            dashboardStats={dashboardStats}
            onSearchChange={setSearchTerm}
            setEditingItem={setEditingItem}
            deleteItem={deleteItem}
            setSelectedItemForView={setSelectedItemForView}
            sortedItems={sortedItems}
            totalPages={totalPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            filteredItems={filteredItems}
            setShowViewModal={setShowViewModal}
            setSelectedItemForShare={setSelectedItemForShare}
            setShowShareModal={setShowShareModal}
          />}
          {view === 'articles' && <ArticlesView
            key="articles-view"
            t={t}
            items={items}
            filteredItems={filteredItems}
            categories={categories}
            departments={departments}
            filters={filters}
            setFilters={setFilters}
            dashboardFilters={dashboardFilters}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            articleViewMode={articleViewMode}
            setArticleViewMode={setArticleViewMode}
            selectedItems={selectedItems}
            toggleItemSelection={toggleItemSelection}
            toggleAllItems={toggleAllItems}
            onSearchChange={setSearchTerm}
            handleSort={handleSort}
            setEditingItem={setEditingItem}
            deleteItem={deleteItem}
            deleteSelectedItems={deleteSelectedItems}
            onPriceAssistant={handlePriceAssistant}
            setSelectedItemForView={setSelectedItemForView}
            setShowShareModal={setShowShareModal}
            setSelectedItemForShare={setSelectedItemForShare}
            printCurrentView={printCurrentView}
            sortConfig={sortConfig}
            paginatedItems={paginatedItems}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            setShowItemForm={setShowItemForm}
            handlePrint={handlePrint}
            setShowViewModal={setShowViewModal}
            storageUnits={storageUnits}
            getScanUrl={getScanUrl}
            setSearchTerm={setSearchTerm}
            importFromCatalogue={importFromCatalogue}
          />}
          {view === 'alerts' && <AlertsView />}
          {view === 'scanner' && <ScannerView />}
          {view === 'movements' && <MovementsView />}
          {view === 'analytics' && <AnalyticsView />}
          {view === 'reports' && <ReportsView />}
          {view === 'admin' && <AdminView />}
        </main>
      </div>

      {/* Toasts (feedback non bloquant) */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-[60] flex max-w-[90vw] flex-col gap-2" role="status" aria-live="polite">
          {toasts.map(x => (
            <div key={x.id} className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm shadow-lg ${x.type === 'error' ? 'bg-red-600 text-white' : x.type === 'warning' ? 'bg-amber-500 text-white' : x.type === 'info' ? 'bg-slate-800 text-white' : 'bg-emerald-600 text-white'}`}>
              <span>{x.type === 'error' ? '⚠️' : x.type === 'warning' ? '⚠️' : x.type === 'info' ? 'ℹ️' : '✓'}</span>
              <span className="flex-1 whitespace-pre-line">{x.message}</span>
              <button aria-label="Fermer" className="opacity-70 hover:opacity-100" onClick={() => setToasts(prev => prev.filter(t => t.id !== x.id))}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Pastille flottante : la recherche de prix IA tourne EN ARRIÈRE-PLAN (on peut naviguer
          ailleurs et revenir). Cliquer rouvre la fenêtre pour voir/appliquer les prix. */}
      {!showPriceModal && (priceLoading || priceRows.length > 0) && (
        <button
          onClick={() => setShowPriceModal(true)}
          className="fixed bottom-4 left-4 z-40 inline-flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-purple-700"
        >
          {priceLoading
            ? <><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />{language === 'fr' ? `Prix IA… ${priceProgress ? `lot ${priceProgress.done}/${priceProgress.total}` : ''}` : `AI prices… ${priceProgress ? `${priceProgress.done}/${priceProgress.total}` : ''}`}</>
            : <><Zap size={16} />{language === 'fr' ? `${priceRows.filter(r => Number(r.webPrice) > 0).length} prix prêts — Voir` : `${priceRows.filter(r => Number(r.webPrice) > 0).length} prices ready — View`}</>}
        </button>
      )}

      {/* Assistant Prix IA — comparatif prix fournisseur (actuel) vs prix web (IA) */}
      {showPriceModal && (
        <Modal isOpen onClose={() => setShowPriceModal(false)} title={language === 'fr' ? '💡 Assistant prix (IA — recherche web)' : '💡 Price assistant (AI — web search)'}>
          <div className="p-2">
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
              {language === 'fr'
                ? "Le prix web est souvent du prix de détail (plus élevé que le coût fournisseur). Coche les lignes à appliquer, puis confirme — le tableau de bord s'ajuste automatiquement."
                : 'Web prices are often retail (higher than supplier cost). Tick the rows to apply, then confirm — the dashboard adjusts automatically.'}
            </p>
            {priceLoading && (
              <div className="mb-3 flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                {priceProgress && priceProgress.total > 1
                  ? (language === 'fr' ? `Recherche web… lot ${priceProgress.done}/${priceProgress.total}` : `Web search… batch ${priceProgress.done}/${priceProgress.total}`)
                  : (language === 'fr' ? 'Recherche web en cours…' : 'Searching the web…')}
              </div>
            )}
            <div className="max-h-[55vh] overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 text-left text-xs uppercase text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                  <tr>
                    <th className="px-2 py-2"><input type="checkbox" checked={priceRows.length > 0 && priceRows.every(r => r.apply)} onChange={(e) => setPriceRows(prev => prev.map(r => ({ ...r, apply: e.target.checked && Number(r.webPrice) > 0 })))} /></th>
                    <th className="px-2 py-2">{language === 'fr' ? 'Article' : 'Item'}</th>
                    <th className="px-2 py-2 text-right">{language === 'fr' ? 'Coût fournisseur' : 'Supplier cost'}</th>
                    <th className="px-2 py-2 text-right">{language === 'fr' ? 'Prix web (IA)' : 'Web price (AI)'}</th>
                    <th className="px-2 py-2">{language === 'fr' ? 'Source' : 'Source'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {priceRows.map(r => {
                    const web = Number(r.webPrice) || 0;
                    const higher = web > r.supplierCost;
                    return (
                      <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                        <td className="px-2 py-2"><input type="checkbox" disabled={web <= 0} checked={!!r.apply} onChange={(e) => setPriceRows(prev => prev.map(x => x.id === r.id ? { ...x, apply: e.target.checked } : x))} /></td>
                        <td className="px-2 py-2"><div className="truncate font-semibold text-gray-900 dark:text-white">{r.name}</div><div className="font-mono text-[11px] text-gray-400">{r.code}</div>{r.note && <div className="text-[11px] text-amber-600 dark:text-amber-400">{r.note}</div>}</td>
                        <td className="px-2 py-2 text-right text-gray-700 dark:text-gray-200">${r.supplierCost.toFixed(2)}</td>
                        <td className={`px-2 py-2 text-right font-bold ${web <= 0 ? 'text-gray-400' : higher ? 'text-red-600' : 'text-green-600'}`}>{priceLoading && r.webPrice === null ? '…' : (web > 0 ? `$${web.toFixed(2)}` : '—')}{r.confidence && <span className="ml-1 text-[10px] font-normal text-gray-400">({r.confidence})</span>}</td>
                        <td className="px-2 py-2 text-[11px] text-blue-600 dark:text-blue-400 truncate max-w-[140px]">{r.source}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button onClick={() => { if (!priceLoading) setPriceRows([]); setShowPriceModal(false); }} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200">
                {priceLoading ? (language === 'fr' ? 'Réduire (continue en arrière-plan)' : 'Minimize (keeps running)') : (language === 'fr' ? 'Garder le prix fournisseur' : 'Keep supplier price')}
              </button>
              <button onClick={applyPriceUpdates} disabled={priceLoading || !priceRows.some(r => r.apply)} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
                {language === 'fr' ? `Appliquer le prix IA (${priceRows.filter(r => r.apply).length})` : `Apply AI price (${priceRows.filter(r => r.apply).length})`}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Dialogue de confirmation in-app (remplace window.confirm, inopérant en PWA) */}
      {confirmState && (
        <Modal isOpen onClose={() => setConfirmState(null)} title={confirmState.title || (language === 'fr' ? 'Confirmer' : 'Confirm')}>
          <div className="p-2">
            <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line">{confirmState.message}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setConfirmState(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200">{language === 'fr' ? 'Annuler' : 'Cancel'}</button>
              <button onClick={() => { const cb = confirmState.onConfirm; setConfirmState(null); cb?.(); }} className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${confirmState.danger === false ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}>{confirmState.confirmLabel || (language === 'fr' ? 'Confirmer' : 'Confirm')}</button>
            </div>
          </div>
        </Modal>
      )}

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <PrintModal />
      <ScannedItemModal />
      <InstallPWA />
      <AddItemModalComponent
        isOpen={showItemForm}
        onClose={handleCloseAddModal}
        addItemMode={addItemMode}
        setAddItemMode={setAddItemMode}
        newItemData={newItemData}
        onFieldChange={handleNewItemChange}
        onLocationFieldChange={handleLocationFieldChange}
        categories={categories}
        departments={departments}
        storageUnits={storageUnits}
        onSubmit={handleSubmitNewItem}
        importStep={importStep}
        ImportExcelContentComponent={<ImportExcelContent />}
        t={t}
        showAdvancedFields={showAdvancedFields}
        setShowAdvancedFields={setShowAdvancedFields}
        editingItem={editingItem}
        setEditingItem={setEditingItem}
        baseEbitda={baseEbitda}
        targetEbitda={targetEbitda}
      />
      <ImportExcelModal />

      {/* Modal de visualisation de produit */}
      {showViewModal && selectedItemForView && (
        <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('articles.productDetails')}</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations principales */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('articles.code')}
                  </label>
                  <p className="text-lg font-mono font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded">
                    {selectedItemForView.code}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('articles.name')}
                  </label>
                  <p className="text-lg text-gray-900 dark:text-white">
                    {selectedItemForView.name}
                  </p>
                </div>

                {selectedItemForView.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('articles.description')}
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedItemForView.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('articles.category')}
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedItemForView.category}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('common.stock')}
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedItemForView.quantity}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('articles.costPrice')}
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${selectedItemForView.costPrice?.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('articles.salePrice')}
                    </label>
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                      ${selectedItemForView.salePrice?.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* EBITDA de base et cible */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('articles.baseEbitda')}
                    </label>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {selectedItemForView.baseEbitda !== undefined ? selectedItemForView.baseEbitda.toFixed(1) : '0.0'}%
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      ${selectedItemForView.costPrice && selectedItemForView.baseEbitda
                        ? (selectedItemForView.costPrice * (1 + selectedItemForView.baseEbitda / 100)).toFixed(2)
                        : '0.00'} / unité
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-2 border-green-200 dark:border-green-800">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('articles.targetEbitda')}
                    </label>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {selectedItemForView.targetEbitda !== undefined ? selectedItemForView.targetEbitda.toFixed(1) : '0.0'}%
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      ${selectedItemForView.costPrice && selectedItemForView.targetEbitda
                        ? (selectedItemForView.costPrice * (1 + selectedItemForView.targetEbitda / 100)).toFixed(2)
                        : '0.00'} / unité
                    </p>
                  </div>
                </div>

                {/* Valeurs totales selon inventaire */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border-2 border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-3">Valeurs totales (× {selectedItemForView.quantity})</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Coût Total</label>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        ${selectedItemForView.costPrice && selectedItemForView.quantity
                          ? (selectedItemForView.costPrice * selectedItemForView.quantity).toFixed(2)
                          : '0.00'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">EBITDA Base ({selectedItemForView.baseEbitda?.toFixed(1)}%)</label>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        ${selectedItemForView.costPrice && selectedItemForView.baseEbitda && selectedItemForView.quantity
                          ? (selectedItemForView.costPrice * (1 + selectedItemForView.baseEbitda / 100) * selectedItemForView.quantity).toFixed(2)
                          : '0.00'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">EBITDA Cible ({selectedItemForView.targetEbitda?.toFixed(1)}%)</label>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        ${selectedItemForView.costPrice && selectedItemForView.targetEbitda && selectedItemForView.quantity
                          ? (selectedItemForView.costPrice * (1 + selectedItemForView.targetEbitda / 100) * selectedItemForView.quantity).toFixed(2)
                          : '0.00'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Carte Code QR (style fiche Équipement) — QR vers la page PUBLIQUE (+ succursale) */}
              {(() => {
                const qrUrl = getScanUrl(selectedItemForView.id, selectedItemForView.code, selectedItemForView.departmentCode);
                return (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                    {/* Logo centré (façon fiche publique des autres modules) */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={companyLogo} alt="logo" className="mb-3 h-10 w-auto object-contain" onError={(e) => { e.currentTarget.src = '/c-secur360-logo.png'; }} />
                    <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-teal-700 dark:text-teal-400">
                      <QrCode size={15} /> {language === 'fr' ? "Code QR de l'article" : 'Item QR code'}
                    </div>
                    <p className="mb-3 max-w-xs text-center text-xs text-gray-500">
                      {language === 'fr'
                        ? "Imprimez ce code et collez-le sur l'article. Au scan (sans app), il ouvre la fiche publique (prix + quantité disponible)."
                        : 'Print and stick this code on the item. Scanning (no app) opens the public sheet (price + available stock).'}
                    </p>
                    <div className="rounded-2xl border-2 border-gray-200 bg-white p-4 shadow-sm">
                      <QRCodeSVG id="inv-qr-svg" value={qrUrl} size={200} level="M" includeMargin={false} />
                    </div>
                    <div className="mt-3 text-center">
                      <div className="text-base font-bold text-gray-900 dark:text-white">{selectedItemForView.name}</div>
                      <div className="text-xs text-gray-500">Code : {selectedItemForView.code}</div>
                      {selectedItemForView.location && <div className="text-xs text-gray-500">📍 {selectedItemForView.location}</div>}
                      {(selectedItemForView.minQuantity != null || selectedItemForView.maxQuantity != null) && (
                        <div className="mt-0.5 text-xs font-semibold text-blue-600">Min {selectedItemForView.minQuantity ?? '—'} · Max {selectedItemForView.maxQuantity ?? '—'}</div>
                      )}
                    </div>
                    {/* Lien du site public en dessous */}
                    <a href={qrUrl} target="_blank" rel="noopener noreferrer" className="mt-2 max-w-xs break-all text-center text-[11px] font-medium text-teal-600 underline decoration-dotted hover:text-teal-700">{qrUrl}</a>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => { try { navigator.clipboard.writeText(qrUrl); } catch { /* ignore */ } }}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200">
                        📋 {language === 'fr' ? 'Copier le lien' : 'Copy link'}
                      </button>
                      <button
                        onClick={() => {
                          const svg = document.getElementById('inv-qr-svg'); if (!svg) return;
                          const xml = new XMLSerializer().serializeToString(svg);
                          const blob = new Blob([xml], { type: 'image/svg+xml' });
                          const a = document.createElement('a');
                          a.href = URL.createObjectURL(blob);
                          a.download = `qr-${selectedItemForView.code || selectedItemForView.id}.svg`;
                          a.click(); URL.revokeObjectURL(a.href);
                        }}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200">
                        ⬇ {language === 'fr' ? 'Télécharger' : 'Download'}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="mt-6 flex gap-3 justify-end print:hidden">
              <Button
                variant="secondary"
                onClick={() => setShowViewModal(false)}
              >
                {t('actions.close')}
              </Button>
              <Button
                variant="ghost"
                icon={Printer}
                onClick={() => window.print()}
              >
                {t('actions.print')}
              </Button>
              <Button
                variant="primary"
                icon={Edit}
                onClick={() => {
                  setEditingItem(selectedItemForView);
                  setShowViewModal(false);
                  setShowItemForm(true);
                }}
              >
                {t('actions.edit')}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <ShareProductSheet
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        item={selectedItemForShare}
      />
    </div>
  );
}

// ============== DONNÉES PAR DÉFAUT ==============
function getDefaultDepartments() {
  return [
    { id: '1', name: 'Succursale A', code: 'SUC-A', locations: ['Allée 1', 'Allée 2', 'Entrepôt A', 'Bureau'] },
    { id: '2', name: 'Succursale B', code: 'SUC-B', locations: ['Zone 1', 'Zone 2', 'Stockage B'] },
    { id: '3', name: 'Entrepôt Principal', code: 'ENT-P', locations: ['Rack A', 'Rack B', 'Rack C', 'Zone Réception'] }
  ];
}

function getDefaultCategories() {
  return [
    { id: '1', name: 'EPI - Respiratoire', code: 'EPI-RESP', subcategories: ['Masques N95', 'Masques chirurgicaux', 'Respirateurs'] },
    { id: '2', name: 'EPI - Protection des mains', code: 'EPI-MAIN', subcategories: ['Gants latex', 'Gants nitrile', 'Gants cuir'] },
    { id: '3', name: 'EPI - Protection des yeux', code: 'EPI-YEUX', subcategories: ['Lunettes', 'Visières', 'Écrans faciaux'] },
    { id: '4', name: 'EPI - Protection auditive', code: 'EPI-AUDIT', subcategories: ['Bouchons', 'Casques antibruit'] },
    { id: '5', name: 'Consommables', code: 'CONSOM', subcategories: ['Fournitures', 'Produits nettoyage'] },
    { id: '6', name: 'Outils', code: 'OUTILS', subcategories: ['Outils manuels', 'Outils électriques'] }
  ];
}

function getDefaultItems() {
  return [
    {
      id: '1',
      code: 'MASK-N95-001',
      name: 'Masque N95 3M',
      description: 'Masque respiratoire N95 certifié',
      category: 'EPI - Respiratoire',
      department: 'Succursale A',
      location: 'Allée 1',
      quantity: 150,
      minQuantity: 100,
      maxQuantity: 500,
      unit: 'unités',
      costPrice: 2.50,
      salePrice: 4.99,
      createdAt: new Date().toISOString(),
      createdBy: 'system'
    },
    {
      id: '2',
      code: 'GLOVE-NIT-001',
      name: 'Gants nitrile bleus',
      description: 'Boîte de 100 gants nitrile',
      category: 'EPI - Protection des mains',
      department: 'Succursale A',
      location: 'Allée 2',
      quantity: 45,
      minQuantity: 50,
      maxQuantity: 200,
      unit: 'boîtes',
      costPrice: 8.99,
      salePrice: 15.99,
      createdAt: new Date().toISOString(),
      createdBy: 'system'
    },
    {
      id: '3',
      code: 'GLASS-SAFE-001',
      name: 'Lunettes de sécurité',
      description: 'Lunettes protection UV',
      category: 'EPI - Protection des yeux',
      department: 'Entrepôt Principal',
      location: 'Rack A',
      quantity: 200,
      minQuantity: 50,
      maxQuantity: 300,
      unit: 'unités',
      costPrice: 5.50,
      salePrice: 12.99,
      createdAt: new Date().toISOString(),
      createdBy: 'system'
    },
    {
      id: '4',
      code: 'EAR-PLUG-001',
      name: 'Bouchons d\'oreille',
      description: 'Paire de bouchons mousse',
      category: 'EPI - Protection auditive',
      department: 'Succursale B',
      location: 'Zone 1',
      quantity: 500,
      minQuantity: 200,
      maxQuantity: 1000,
      unit: 'paires',
      costPrice: 0.50,
      salePrice: 1.49,
      createdAt: new Date().toISOString(),
      createdBy: 'system'
    },
    {
      id: '5',
      code: 'CLEAN-DISINF-001',
      name: 'Désinfectant mains',
      description: 'Gel désinfectant 500ml',
      category: 'Consommables',
      department: 'Succursale A',
      location: 'Bureau',
      quantity: 75,
      minQuantity: 30,
      maxQuantity: 150,
      unit: 'bouteilles',
      costPrice: 3.25,
      salePrice: 6.99,
      createdAt: new Date().toISOString(),
      createdBy: 'system'
    }
  ];
}

// ============== APP AVEC PROVIDERS ==============
export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
