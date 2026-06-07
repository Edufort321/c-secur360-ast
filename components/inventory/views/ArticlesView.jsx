import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Printer,
  Filter,
  XCircle,
  Grid,
  List,
  Eye,
  Tag,
  Building,
  Box,
  MapPin,
  Layers,
  Edit,
  Trash2,
  Package,
  ArrowUpDown,
  Share,
  QrCode,
  ChevronDown,
  ChevronRight,
  FileText,
  Zap
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import SearchInput from '../components/SearchInput';
import { getScanUrl } from '../config/app';
import { useLanguage } from '../contexts/LanguageContext';

// ============== UI COMPONENTS ==============

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

const StatusBadge = ({ quantity, minQuantity, maxQuantity, t }) => {
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
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {label}
    </span>
  );
};

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

const ActionButtons = ({ onEdit, onDelete, onView, onShare, t }) => {
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

// ============== MAIN COMPONENT ==============

const ArticlesView = React.memo(({
  t,
  items,
  filteredItems,
  categories,
  departments,
  filters,
  setFilters,
  dashboardFilters,
  showFilters,
  setShowFilters,
  articleViewMode,
  setArticleViewMode,
  selectedItems,
  toggleItemSelection,
  toggleAllItems,
  setSearchTerm,
  handleSort,
  setShowItemForm,
  setEditingItem,
  deleteItem,
  deleteSelectedItems,
  onPriceAssistant,
  handlePrint,
  printCurrentView,
  setSelectedItemForView,
  setShowViewModal,
  setSelectedItemForShare,
  setShowShareModal,
  importFromCatalogue
}) => {
  const { language } = useLanguage();
  // État pour les lignes expandables
  const [expandedRows, setExpandedRows] = useState(new Set());

  // État pour le dropdown d'impression
  const [showPrintDropdown, setShowPrintDropdown] = useState(false);
  const printDropdownRef = useRef(null);

  // Compter le nombre de filtres actifs
  const activeFilterCount = Object.values(dashboardFilters).filter(Boolean).length;

  // Vérifier si le filtre département est actif
  const isDepartmentFiltered = !!(dashboardFilters.department || filters.department);

  const toggleRow = (itemId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedRows(newExpanded);
  };

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (printDropdownRef.current && !printDropdownRef.current.contains(event.target)) {
        setShowPrintDropdown(false);
      }
    };

    if (showPrintDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPrintDropdown]);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{t('articles.title')}</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Gérez votre catalogue d'articles
            {activeFilterCount > 0 && <span className="ml-2 text-slate-600 font-semibold hidden sm:inline">• {activeFilterCount} filtre{activeFilterCount > 1 ? 's' : ''} actif{activeFilterCount > 1 ? 's' : ''} (Dashboard)</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="relative" ref={printDropdownRef}>
            <button
              onClick={() => setShowPrintDropdown(!showPrintDropdown)}
              disabled={selectedItems.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-slate-700 hover:bg-slate-800 text-white shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:transform-none whitespace-nowrap"
            >
              <Printer size={16} />
              <span className="hidden sm:inline">
                {selectedItems.length > 0
                  ? `Imprimer sélection (${selectedItems.length})`
                  : 'Imprimer sélection'}
              </span>
              <span className="sm:hidden">
                {selectedItems.length > 0 ? `Imprimer (${selectedItems.length})` : 'Imprimer'}
              </span>
              <ChevronDown size={16} className={`transition-transform ${showPrintDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showPrintDropdown && selectedItems.length > 0 && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
                <button
                  onClick={() => {
                    printCurrentView();
                    setShowPrintDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left rounded-t-lg"
                >
                  <FileText size={18} className="text-blue-600" />
                  <div>
                    <div className="font-semibold">{t('actions.printCompleteSheets')}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Fiches détaillées</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    handlePrint();
                    setShowPrintDropdown(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left rounded-b-lg"
                >
                  <Tag size={18} className="text-orange-600" />
                  <div>
                    <div className="font-semibold">{t('actions.printLabels')}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Étiquettes avec QR codes</div>
                  </div>
                </button>
              </div>
            )}
          </div>
          {/* Assistant Prix IA (recherche web du prix coûtant) : sélection, ou TOUTE la liste filtrée */}
          {onPriceAssistant && (
            <button
              onClick={() => onPriceAssistant(selectedItems.length ? filteredItems.filter(it => selectedItems.includes(it.id)) : filteredItems)}
              disabled={filteredItems.length === 0}
              title={language === 'fr'
                ? (selectedItems.length ? 'Mettre à jour les prix de la sélection (IA web)' : 'Mettre à jour TOUTE la liste affichée (IA web)')
                : (selectedItems.length ? 'Update selected prices (AI web)' : 'Update the WHOLE displayed list (AI web)')}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
            >
              <Zap size={16} />
              <span className="hidden sm:inline">{selectedItems.length
                ? (language === 'fr' ? `Prix IA (${selectedItems.length})` : `AI price (${selectedItems.length})`)
                : (language === 'fr' ? 'Prix IA — tout' : 'AI price — all')}</span>
            </button>
          )}
          {/* Suppression EN MASSE des articles sélectionnés (nettoyage rapide d'un import) */}
          {deleteSelectedItems && (
            <button
              onClick={deleteSelectedItems}
              disabled={selectedItems.length === 0}
              title={selectedItems.length === 0 ? (t('actions.delete')) : `${t('actions.delete')} (${selectedItems.length})`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">{selectedItems.length > 0 ? `Supprimer (${selectedItems.length})` : 'Supprimer'}</span>
            </button>
          )}
          {importFromCatalogue && (
            <Button variant="secondary" icon={Layers} onClick={importFromCatalogue} className="whitespace-nowrap" title="Importer les articles du catalogue matériel standardisé">
              <span className="hidden sm:inline">Importer du catalogue</span>
              <span className="sm:hidden">Catalogue</span>
            </Button>
          )}
          <Button variant="primary" icon={Plus} onClick={() => setShowItemForm(true)} className="whitespace-nowrap">
            <span className="hidden sm:inline">{t('articles.addArticle')}</span>
            <span className="sm:hidden">{t('actions.add')}</span>
          </Button>
        </div>
      </div>

      {/* Barre de filtres et sélecteur de vue */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchInput
                key="articles-search-stable"
                placeholder={t('articles.searchArticles')}
                onSearchChange={setSearchTerm}
                debounceMs={300}
              />
            </div>

            {/* Sélecteur de vue : Galerie (cartes compactes) / Liste (tableau) — style AST */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
              <button
                onClick={() => setArticleViewMode('grid')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  articleViewMode !== 'list'
                    ? 'bg-white dark:bg-gray-800 text-slate-700 dark:text-white shadow-md'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title={t('articles.gridView')}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setArticleViewMode('list')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  articleViewMode === 'list'
                    ? 'bg-white dark:bg-gray-800 text-slate-700 dark:text-white shadow-md'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title={t('articles.listView')}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {/* Bouton Hamburger pour les filtres */}
          <div className="flex justify-end">
            <Button
              variant={showFilters ? "primary" : "secondary"}
              icon={Filter}
              onClick={() => setShowFilters(!showFilters)}
            >
              {t('actions.filters')} {(filters.category || filters.department || filters.status || filters.location) && `(${[filters.category, filters.department, filters.status, filters.location].filter(Boolean).length})`}
            </Button>
          </div>

          {/* Menu déroulant des filtres */}
          {showFilters && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('articles.category')}
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                  >
                    <option value="">Tous</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('articles.department')}
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    value={filters.department}
                    onChange={(e) => setFilters({...filters, department: e.target.value})}
                  >
                    <option value="">Tous</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('common.status')}
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                  >
                    <option value="">Tous</option>
                    <option value="low">{t('status.low')}</option>
                    <option value="optimal">{t('status.optimal')}</option>
                    <option value="surplus">{t('status.surplus')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('articles.location')}
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                  >
                    <option value="">Tous</option>
                    {[...new Set(items.map(item => item.location).filter(Boolean))].map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-between">
                <Button
                  variant="primary"
                  onClick={toggleAllItems}
                >
                  {selectedItems.length === filteredItems.length && filteredItems.length > 0
                    ? t('actions.deselectAll')
                    : t('actions.selectAll')}
                </Button>
                <Button
                  variant="secondary"
                  icon={XCircle}
                  onClick={() => {
                    setFilters({ category: '', department: '', status: '', location: '' });
                    setSearchTerm('');
                  }}
                >
                  {t('actions.reset')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Vue Grille */}
      {articleViewMode !== 'list' && (
        // GALERIE : cartes compactes à HAUTEUR FIXE, grille qui remplit la largeur (2 col mobile -> 5 desktop).
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {filteredItems.map(item => {
            const qty = item.quantity ?? 0;
            const low = item.minQuantity != null && qty <= item.minQuantity;
            const locTxt = item.isMultiLocation && item.locations
              ? `${item.locations.length} ${item.locations.length > 1 ? t('common.branches') : t('common.branch')}`
              : (item.location || '—');
            const photo = (item.photos && item.photos[0]) || item.photo || null;
            return (
              // Tuile galerie à HAUTEUR FIXE : photo (h fixe) + textes tronqués 1 ligne (h déterministe) + actions.
              <div key={item.id} className="flex h-56 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                <div className="relative h-24 shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-900">
                  {photo
                    ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={photo} alt={item.name} className="h-full w-full object-cover" />
                    : <div className="grid h-full place-items-center text-gray-300 dark:text-gray-600"><Package size={30} /></div>}
                  <input type="checkbox" checked={selectedItems.includes(item.id)} onChange={() => toggleItemSelection(item.id)} onClick={e => e.stopPropagation()} className="absolute left-2 top-2 h-4 w-4 rounded accent-slate-700" />
                  <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${low ? 'bg-red-600' : 'bg-emerald-600'}`}>{qty}{item.unit ? ' ' + item.unit : ''}</span>
                </div>
                <div className="flex min-h-0 flex-1 flex-col px-3 pt-2">
                  <h3 className="truncate text-sm font-bold leading-tight text-gray-900 dark:text-white">{item.name}</h3>
                  <p className="truncate font-mono text-[11px] text-gray-500 dark:text-gray-400">{item.code}</p>
                  <div className="flex items-center gap-1 truncate text-[11px] text-gray-500 dark:text-gray-400">
                    {item.isMultiLocation ? <Building size={11} className="shrink-0" /> : <MapPin size={11} className="shrink-0" />}
                    <span className="truncate">{locTxt}</span>
                  </div>
                  <div className="mt-auto flex items-center justify-between pb-1">
                    <span className="text-[10px] uppercase tracking-wide text-gray-400">{t('articles.salePrice')}</span>
                    <span className="text-sm font-bold text-green-600">${(item.salePrice || 0).toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center justify-end gap-0.5 border-t border-gray-100 px-2 py-1 dark:border-gray-700">
                  <button onClick={() => { setSelectedItemForView(item); setShowViewModal(true); }} className="rounded p-1 text-gray-400 transition hover:text-slate-600 dark:hover:text-white" title={t('actions.view')}><Eye size={15} /></button>
                  <button onClick={() => { setEditingItem(item); setShowItemForm(true); }} className="rounded p-1 text-gray-400 transition hover:text-slate-600 dark:hover:text-white" title={t('actions.edit')}><Edit size={15} /></button>
                  <button onClick={() => handlePrint(item)} className="rounded p-1 text-gray-400 transition hover:text-slate-600 dark:hover:text-white" title={t('actions.printLabel')}><Printer size={15} /></button>
                  <button onClick={() => deleteItem(item.id)} className="rounded p-1 text-gray-400 transition hover:text-red-600" title={t('actions.delete')}><Trash2 size={15} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Vue Liste */}
      {articleViewMode === 'list' && (() => {
        // UNE LIGNE PAR EMPLACEMENT : on aplatit les articles multi-emplacement -> chaque
        // succursale/département du même article devient sa propre ligne (avec SA quantité). On
        // peut ainsi voir d'un coup d'œil où il y a du stock (et la recherche par succursale aide).
        const flatRows = [];
        filteredItems.forEach(item => {
          const locs = (item.isMultiLocation && Array.isArray(item.locations) && item.locations.length) ? item.locations : null;
          if (locs) locs.forEach((loc, i) => flatRows.push({ item, loc, key: `${item.id}::${i}` }));
          else flatRows.push({ item, loc: null, key: item.id });
        });
        return (
        // LISTE compacte en lignes (responsive, mobile-friendly) — remplace le tableau large.
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3 border-b border-gray-100 px-3 py-2 dark:border-gray-700">
            <input type="checkbox" checked={selectedItems.length === filteredItems.length && filteredItems.length > 0} onChange={toggleAllItems} className="h-4 w-4 rounded accent-slate-700" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{flatRows.length} {flatRows.length > 1 ? 'lignes' : 'ligne'} · {filteredItems.length} {t('common.article')}</span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {flatRows.map(({ item, loc, key }) => {
              const lqty = (loc ? loc.quantity : item.quantity) ?? 0;
              const lmin = loc && loc.minQuantity != null ? loc.minQuantity : item.minQuantity;
              const llow = lmin != null && lqty <= lmin;
              const lloc = loc ? (loc.department || loc.location || '—') : (item.location || item.department || '—');
              return (
                <div key={key}>
                  <div className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-900/40">
                    <input type="checkbox" checked={selectedItems.includes(item.id)} onChange={() => toggleItemSelection(item.id)} className="h-4 w-4 shrink-0 rounded accent-slate-700" />
                    <button onClick={() => { setSelectedItemForView(item); setShowViewModal(true); }} className="min-w-0 flex-1 text-left">
                      <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">{item.name}</div>
                      <div className="flex items-center gap-1 truncate font-mono text-[11px] text-gray-400">
                        <span>{item.code}</span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-0.5 rounded bg-slate-100 px-1.5 py-0.5 font-sans font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-200"><MapPin size={10} /> {lloc}</span>
                      </div>
                    </button>
                    <div className="shrink-0 text-right">
                      <div className={`text-sm font-bold ${llow ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{lqty}<span className="text-[10px] font-normal text-gray-400"> {item.unit}</span></div>
                      <div className="text-[11px] font-semibold text-green-600">${(item.salePrice || 0).toFixed(2)}</div>
                    </div>
                    <div className="flex shrink-0 items-center">
                      <button onClick={() => { setEditingItem(item); setShowItemForm(true); }} className="rounded p-1.5 text-gray-400 hover:text-slate-600 dark:hover:text-white" title={t('actions.edit')}><Edit size={15} /></button>
                      <button onClick={() => handlePrint(item)} className="hidden rounded p-1.5 text-gray-400 hover:text-slate-600 dark:hover:text-white sm:inline-flex" title={t('actions.printLabel')}><Printer size={15} /></button>
                      <button onClick={() => deleteItem(item.id)} className="rounded p-1.5 text-gray-400 hover:text-red-600" title={t('actions.delete')}><Trash2 size={15} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        );
      })()}
      {false && articleViewMode === 'list' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                      onChange={toggleAllItems}
                      className="w-5 h-5 text-slate-600 rounded focus:ring-orange-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900 dark:text-white">{t('common.code')}</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900 dark:text-white">{t('common.article')}</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900 dark:text-white">{t('common.category')}</th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('department')}
                      className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white hover:text-slate-600 transition-colors"
                    >
                      {t('common.department')}
                      <ArrowUpDown size={14} />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900 dark:text-white">{t('common.stock')}</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900 dark:text-white">{t('common.status')}</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900 dark:text-white">{t('common.price')}</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-900 dark:text-white">{t('articles.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredItems.map((item, index) => {
                  const isMultiLocation = item.isMultiLocation && item.locations && item.locations.length > 1;
                  const isExpanded = expandedRows.has(item.id);
                  const activeDepartment = dashboardFilters.department || filters.department;

                  // Si filtre département actif OU pas multi-location: affichage normal
                  if (isDepartmentFiltered || !isMultiLocation) {
                    // Trouver les données spécifiques au département si filtré
                    const locationData = activeDepartment && item.locations
                      ? item.locations.find(loc => loc.department === activeDepartment)
                      : null;

                    return (
                      <tr key={item.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'} hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors`}>
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => toggleItemSelection(item.id)}
                            className="w-5 h-5 text-slate-600 rounded focus:ring-orange-500"
                          />
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-gray-900 dark:text-white">{item.code}</td>
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{item.name}</td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-900 dark:text-white font-medium">{item.category}</p>
                            {item.subcategory && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {item.subcategory}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900 dark:text-white font-medium">
                            {locationData ? locationData.department : (item.department || '-')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {locationData ? locationData.quantity : item.quantity}
                            </span>
                            <span className="text-sm text-gray-500">
                              / {locationData ? locationData.maxQuantity : item.maxQuantity}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge
                            quantity={locationData ? locationData.quantity : item.quantity}
                            minQuantity={locationData ? locationData.minQuantity : item.minQuantity}
                            maxQuantity={locationData ? locationData.maxQuantity : item.maxQuantity}
                            t={t}
                          />
                        </td>
                        <td className="px-6 py-4 font-semibold text-green-600">${item.salePrice.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handlePrint(item)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title={t('actions.printLabel')}
                            >
                              <Printer size={16} className="text-gray-600 dark:text-gray-400" />
                            </button>
                            <ActionButtons
                              onEdit={() => {
                                setEditingItem(item);
                                setShowItemForm(true);
                              }}
                              onDelete={() => deleteItem(item.id)}
                              onView={() => {
                                setSelectedItemForView(item);
                                setShowViewModal(true);
                              }}
                              onShare={() => {
                                setSelectedItemForShare(item);
                                setShowShareModal(true);
                              }}
                              t={t}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  // Affichage parent-enfant pour multi-location sans filtre département
                  return (
                    <React.Fragment key={item.id}>
                      {/* Ligne parent */}
                      <tr className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'} hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors`}>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleRow(item.id)}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown size={16} className="text-gray-600 dark:text-gray-400" />
                              ) : (
                                <ChevronRight size={16} className="text-gray-600 dark:text-gray-400" />
                              )}
                            </button>
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.id)}
                              onChange={() => toggleItemSelection(item.id)}
                              className="w-5 h-5 text-slate-600 rounded focus:ring-orange-500"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-gray-900 dark:text-white">{item.code}</td>
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{item.name}</td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-900 dark:text-white font-medium">{item.category}</p>
                            {item.subcategory && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {item.subcategory}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-lg text-xs font-semibold">
                            <Building size={12} />
                            {item.locations.length} succursales
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 dark:text-white">{item.quantity}</span>
                            <span className="text-xs text-gray-500">(total)</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge
                            quantity={item.quantity}
                            minQuantity={item.minQuantity}
                            maxQuantity={item.maxQuantity}
                            t={t}
                          />
                        </td>
                        <td className="px-6 py-4 font-semibold text-green-600">${item.salePrice.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handlePrint(item)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title={t('actions.printLabel')}
                            >
                              <Printer size={16} className="text-gray-600 dark:text-gray-400" />
                            </button>
                            <ActionButtons
                              onEdit={() => {
                                setEditingItem(item);
                                setShowItemForm(true);
                              }}
                              onDelete={() => deleteItem(item.id)}
                              onView={() => {
                                setSelectedItemForView(item);
                                setShowViewModal(true);
                              }}
                              onShare={() => {
                                setSelectedItemForShare(item);
                                setShowShareModal(true);
                              }}
                              t={t}
                            />
                          </div>
                        </td>
                      </tr>

                      {/* Lignes enfants (détails par succursale) */}
                      {isExpanded && item.locations.map((location, locIndex) => (
                        <tr key={`${item.id}-${locIndex}`} className="bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500">
                          <td className="px-4 py-3"></td>
                          <td className="px-6 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">
                            {location.customCode || location.qrCode || '-'}
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300 italic">
                            └─ {item.name}
                          </td>
                          <td className="px-6 py-3 text-xs text-gray-500 dark:text-gray-400">
                            {item.category}
                          </td>
                          <td className="px-6 py-3">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {location.department}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                                  {location.quantity}
                                </span>
                                <span className="text-xs text-gray-500">
                                  / {location.maxQuantity || item.maxQuantity}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                <MapPin size={10} className="inline" /> {location.location || '-'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <StatusBadge
                              quantity={location.quantity}
                              minQuantity={location.minQuantity || item.minQuantity}
                              maxQuantity={location.maxQuantity || item.maxQuantity}
                              t={t}
                            />
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                            ${item.salePrice.toFixed(2)}
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handlePrint(item)}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                title={t('actions.printLabel')}
                              >
                                <Printer size={14} className="text-gray-600 dark:text-gray-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vue Détaillée */}
      {articleViewMode === 'detailed' && (
        <div className="space-y-4">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-orange-500 to-orange-600"></div>
              <div className="p-6">
                <div className="flex items-start gap-6">
                  {/* Checkbox et QR Code */}
                  <div className="flex flex-col items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                      className="w-5 h-5 text-slate-600 rounded focus:ring-orange-500"
                    />
                    <div className="p-3 bg-white border-2 border-gray-200 rounded-lg">
                      <QRCodeSVG
                        value={getScanUrl(item.id, item.code)}
                        size={120}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Printer}
                      onClick={() => handlePrint(item)}
                    >
                      Imprimer
                    </Button>
                  </div>

                  {/* Informations détaillées */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{item.name}</h3>
                      <p className="text-lg font-mono text-gray-600 dark:text-gray-400 mb-4">{item.code}</p>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Tag size={18} className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('common.category')}</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{item.category}</p>
                            {item.subcategory && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {item.subcategory}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin size={18} className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('articles.location')}</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{item.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Layers size={18} className="text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('common.department')}</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{item.department}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('articles.stockLevel')}</span>
                          <StatusBadge
                            quantity={item.quantity}
                            minQuantity={item.minQuantity}
                            maxQuantity={item.maxQuantity}
                            t={t}
                          />
                        </div>
                        <ProgressBar value={item.quantity} max={item.maxQuantity} showLabel={true} />
                        <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <span>{t('articles.min')}: {item.minQuantity}</span>
                          <span className="font-bold text-gray-900 dark:text-white">{item.quantity} {item.unit}</span>
                          <span>{t('articles.max')}: {item.maxQuantity}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('articles.unitCost')}</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">${item.costPrice.toFixed(2)}</p>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('articles.salePrice')}</p>
                          <p className="text-xl font-bold text-green-600">${item.salePrice.toFixed(2)}</p>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('articles.stockValue')}</p>
                          <p className="text-xl font-bold text-blue-600">${(item.quantity * item.costPrice).toFixed(2)}</p>
                        </div>
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t('articles.margin')}</p>
                          <p className="text-xl font-bold text-purple-600">
                            {(((item.salePrice - item.costPrice) / item.costPrice) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          icon={Edit}
                          onClick={() => setEditingItem(item)}
                          className="flex-1"
                        >
                          Modifier
                        </Button>
                        <Button
                          variant="danger"
                          icon={Trash2}
                          onClick={() => deleteItem(item.id)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredItems.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <EmptyState
            icon={Package}
            title={t('articles.noArticles')}
            message={t('articles.noArticlesCriteria')}
          />
        </div>
      )}
    </div>
  );
});

ArticlesView.displayName = 'ArticlesView';

export default ArticlesView;
