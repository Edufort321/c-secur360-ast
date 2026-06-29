import React from 'react';
import {
  Plus,
  Filter,
  Printer,
  XCircle,
  Package,
  AlertCircle,
  Calendar,
  CheckCircle,
  DollarSign,
  AlertTriangle,
  ExternalLink,
  Settings,
  Tag,
  ArrowUpDown,
  Eye,
  Edit,
  Share,
  Trash2
} from 'lucide-react';
import SearchInput from '../components/SearchInput';
import { useLanguage } from '../contexts/LanguageContext';

// Composants UI importés depuis App.jsx
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
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick && onClick(e);
      }}
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
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2.5 sm:p-3 rounded-lg ${iconColors[color]} group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={22} />
          </div>
          {trend && (
            <span className={`text-sm font-semibold ${trend.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>
              {trend}
            </span>
          )}
        </div>
        <h3 className="truncate text-gray-600 dark:text-gray-400 text-sm font-medium mb-1" title={title}>{title}</h3>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>
        )}
      </div>
    </div>
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

const StatusBadge = ({ quantity, minQuantity, maxQuantity, t }) => {
  let variant = 'success';
  let label = t('status.optimal');

  if (quantity <= minQuantity) {
    variant = 'danger';
    label = t('status.low');
  } else if (quantity > maxQuantity) {
    variant = 'warning';
    label = t('status.surplus');
  }

  const variants = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {label}
    </span>
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

const DashboardView = React.memo(({
  t,
  items,
  categories,
  departments,
  dashboardFilters,
  setDashboardFilters,
  showDashboardFilters,
  setShowDashboardFilters,
  setShowItemForm,
  setView,
  handleSort,
  printCurrentView,
  paginatedItems,
  dashboardStats,
  onSearchChange,
  setEditingItem,
  deleteItem,
  setSelectedItemForView,
  setShowViewModal,
  setSelectedItemForShare,
  setShowShareModal,
  sortedItems,
  totalPages,
  currentPage,
  setCurrentPage,
  filteredItems
}) => {
  // PERFORMANCE — fenêtrage : on ne rend qu'un sous-ensemble de la liste (la table/les cartes
  // chargeaient TOUS les articles d'un coup → des milliers de lignes DOM = lent sur mobile). On rend
  // ~60 lignes puis on en ajoute au scroll (sans dépendance de virtualisation). Reset à chaque
  // changement de tri/filtre/recherche (identité de sortedItems).
  const STEP = 60;
  const [visibleCount, setVisibleCount] = React.useState(STEP);
  React.useEffect(() => { setVisibleCount(STEP); }, [sortedItems]);
  const visibleItems = React.useMemo(() => sortedItems.slice(0, visibleCount), [sortedItems, visibleCount]);
  const onListScroll = React.useCallback((e) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 500) {
      setVisibleCount(c => (c < sortedItems.length ? c + STEP : c));
    }
  }, [sortedItems.length]);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{t('dashboard.title')}</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">{t('dashboard.inventoryOverview')}</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setShowItemForm(true)} className="whitespace-nowrap">
          <span className="hidden sm:inline">{t('articles.addArticle')}</span>
          <span className="sm:hidden">{t('actions.add')}</span>
        </Button>
      </div>

      {/* Bouton Hamburger pour les filtres */}
      <div className="flex justify-end">
        <Button
          variant={showDashboardFilters ? "primary" : "secondary"}
          icon={Filter}
          onClick={() => setShowDashboardFilters(!showDashboardFilters)}
        >
          {t('actions.filters')} {(dashboardFilters.category || dashboardFilters.subcategory || dashboardFilters.department || dashboardFilters.status || dashboardFilters.location) && `(${[dashboardFilters.category, dashboardFilters.subcategory, dashboardFilters.department, dashboardFilters.status, dashboardFilters.location].filter(Boolean).length})`}
        </Button>
      </div>

      {/* Menu déroulant des filtres */}
      {showDashboardFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('articles.category')}
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                value={dashboardFilters.category}
                onChange={(e) => setDashboardFilters({...dashboardFilters, category: e.target.value, subcategory: ''})}
              >
                <option value="">{t('common.all')}</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Sous-catégorie - Visible seulement si une catégorie est sélectionnée */}
            {dashboardFilters.category && (() => {
              const selectedCategory = categories.find(cat => cat.name === dashboardFilters.category);
              const subcategories = selectedCategory?.subcategories || [];

              return subcategories.length > 0 ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('common.subcategory')}
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    value={dashboardFilters.subcategory || ''}
                    onChange={(e) => setDashboardFilters({...dashboardFilters, subcategory: e.target.value})}
                  >
                    <option value="">{t('common.allFeminine')}</option>
                    {subcategories.map((subcat, idx) => (
                      <option key={idx} value={subcat}>{subcat}</option>
                    ))}
                  </select>
                </div>
              ) : null;
            })()}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('articles.department')}
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                value={dashboardFilters.department}
                onChange={(e) => setDashboardFilters({...dashboardFilters, department: e.target.value})}
              >
                <option value="">{t('common.all')}</option>
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
                value={dashboardFilters.status}
                onChange={(e) => setDashboardFilters({...dashboardFilters, status: e.target.value})}
              >
                <option value="">{t('common.all')}</option>
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
                value={dashboardFilters.location}
                onChange={(e) => setDashboardFilters({...dashboardFilters, location: e.target.value})}
              >
                <option value="">{t('common.all')}</option>
                {[...new Set(items.map(item => item.location).filter(Boolean))].map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-between">
            <Button
              variant="primary"
              icon={Printer}
              onClick={printCurrentView}
            >
              {t('actions.print')}
            </Button>
            <Button
              variant="secondary"
              icon={XCircle}
              onClick={() => setDashboardFilters({ category: '', subcategory: '', department: '', status: '', location: '' })}
            >
              {t('actions.reset')}
            </Button>
          </div>
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={Package}
          title={t('dashboard.totalArticles')}
          value={dashboardStats.total}
          color="blue"
          subtitle={t('dashboard.articlesInInventory')}
        />
        <StatCard
          icon={AlertCircle}
          title={t('dashboard.lowStock')}
          value={dashboardStats.lowStock}
          color="red"
          trend={dashboardStats.lowStock > 0 ? `-${dashboardStats.lowStock}` : '0'}
          subtitle={t('dashboard.needsRestocking')}
        />
        {(() => {
          const now = new Date();
          const priceUpdatesNeeded = items.filter(item => {
            if (!item.nextPriceUpdate) return false;
            return new Date(item.nextPriceUpdate) <= now;
          }).length;

          return (
            <StatCard
              icon={Calendar}
              title={t('dashboard.priceReview')}
              value={priceUpdatesNeeded}
              color="yellow"
              trend={priceUpdatesNeeded > 0 ? `${priceUpdatesNeeded}` : '0'}
              subtitle={t('dashboard.updateRequired')}
            />
          );
        })()}
        <StatCard
          icon={CheckCircle}
          title={t('status.optimal')}
          value={dashboardStats.optimal}
          color="green"
          subtitle={t('dashboard.withinNorms')}
        />
      </div>

      {/* Alertes stock bas - Vue condensée */}
      {dashboardStats.lowStock > 0 && (
        <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-l-4 border-red-600 p-4 sm:p-6 rounded-xl shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
              <div className="flex-shrink-0 p-2.5 sm:p-3 bg-red-100 dark:bg-red-900/40 rounded-lg">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-xl font-bold text-red-900 dark:text-red-400 mb-1.5">
                  {t('dashboard.alerts')} {t('common.lowStock')}
                </h3>
                <p className="text-sm sm:text-base text-red-800 dark:text-red-300 mb-3 sm:mb-4">
                  {dashboardStats.lowStock} {t('common.article')}{dashboardStats.lowStock > 1 ? 's' : ''} {dashboardStats.lowStock > 1 ? t('common.requiresRestockingPlural') : t('common.requiresRestocking')}
                </p>

                {/* Alertes par département */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {departments
                    .filter(dept => !dashboardFilters.department || dept.name === dashboardFilters.department)
                    .map(dept => {
                      const deptAlerts = items.filter(item => {
                        // Appliquer tous les filtres dashboard
                        if (item.department !== dept.name) return false;
                        if (item.quantity > item.minQuantity) return false;
                        if (dashboardFilters.category && item.category !== dashboardFilters.category) return false;
                        if (dashboardFilters.status && dashboardFilters.status !== 'low') return false;
                        if (dashboardFilters.location && item.location !== dashboardFilters.location) return false;
                        return true;
                      }).length;

                      if (deptAlerts === 0) return null;

                      return (
                        <div key={dept.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-red-200 dark:border-red-800">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 dark:text-white">{dept.name}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{dept.code}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-red-600">{deptAlerts}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">alerte{deptAlerts > 1 ? 's' : ''}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Bouton pour ouvrir la vue complète — pleine largeur sur mobile (sinon il s'étire mal). */}
            <div className="flex-shrink-0">
              <Button
                variant="primary"
                icon={ExternalLink}
                onClick={() => setView('alerts')}
                className="w-full sm:w-auto justify-center whitespace-nowrap"
              >
                {t('alerts.manage')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bilan financier de l'inventaire */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <DollarSign size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('dashboard.inventoryFinancialReport')}
              </h3>
            </div>
          </div>
          <Button
            variant="ghost"
            icon={Printer}
            onClick={() => {
              window.print();
            }}
          >
            {t('actions.print')}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {(() => {
            // Vérifier si des filtres sont actifs
            const hasActiveFilters = dashboardFilters.category || dashboardFilters.subcategory ||
                                    dashboardFilters.department || dashboardFilters.status ||
                                    dashboardFilters.location;

            const categoriesToShow = categories.filter(category => !dashboardFilters.category || category.name === dashboardFilters.category);

            if (categoriesToShow.length === 0) {
              return (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {t('dashboard.noCategoriesFound')}
                </div>
              );
            }

            const categoriesWithItems = categoriesToShow.map(category => {
              const categoryItems = items.filter(item => {
                // Vérifier que l'item appartient à cette catégorie
                if (item.category !== category.name) return false;

                // Appliquer les filtres du dashboard
                if (dashboardFilters.subcategory && item.subcategory !== dashboardFilters.subcategory) return false;
                if (dashboardFilters.department && item.department !== dashboardFilters.department) return false;
                if (dashboardFilters.location && item.location !== dashboardFilters.location) return false;
                if (dashboardFilters.status) {
                  if (dashboardFilters.status === 'low' && item.quantity > item.minQuantity) return false;
                  if (dashboardFilters.status === 'over' && item.quantity <= item.maxQuantity) return false;
                  if (dashboardFilters.status === 'optimal' && (item.quantity <= item.minQuantity || item.quantity > item.maxQuantity)) return false;
                }
                return true;
              });

              return { category, categoryItems };
            });
            // Ne plus filtrer les catégories vides - les afficher avec $0.00

            // Calculer les totaux pour toutes les catégories
            let totalCost = 0;
            let totalSell = 0;

            const categoryRows = categoriesWithItems.map(({ category, categoryItems }) => {

            const costValue = categoryItems.reduce((sum, item) => {
              const cost = parseFloat(item.costPrice) || 0;
              const qty = parseFloat(item.quantity) || 0;
              return sum + (cost * qty);
            }, 0);

            // Calculer la valeur de vente (tous les articles)
            const sellValue = categoryItems.reduce((sum, item) => {
              const price = parseFloat(item.salePrice) || 0;
              const qty = parseFloat(item.quantity) || 0;
              return sum + (price * qty);
            }, 0);
            const ebitda = sellValue - costValue;
            const ebitdaPercent = costValue > 0 ? ((ebitda / costValue) * 100) : 0;

            // Ajouter aux totaux
            totalCost += costValue;
            totalSell += sellValue;

            return (
              <div key={category.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3 gap-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`shrink-0 w-3 h-3 rounded-full ${category.color || 'bg-gray-400'}`}></div>
                    <h4 className="truncate font-semibold text-gray-900 dark:text-white" title={category.name}>{category.name}</h4>
                    <span className="shrink-0 text-sm text-gray-500 dark:text-gray-400">({categoryItems.length} articles)</span>
                  </div>
                </div>

                {/* Affichage avec coût, vente et EBITDA pour tous les articles */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">{t('dashboard.costValue')}</p>
                    <p className="text-lg font-bold text-blue-900 dark:text-blue-300">${costValue.toFixed(2)}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">{t('dashboard.sellValue')}</p>
                    <p className="text-lg font-bold text-green-900 dark:text-green-300">${sellValue.toFixed(2)}</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">{t('dashboard.ebitda')}</p>
                    <p className="text-lg font-bold text-purple-900 dark:text-purple-300">
                      ${ebitda.toFixed(2)}
                      <span className="text-sm ml-1">({ebitdaPercent.toFixed(1)}%)</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          });

          const totalEbitda = totalSell - totalCost;
          const totalEbitdaPercent = totalCost > 0 ? ((totalEbitda / totalCost) * 100) : 0;

          // Retourner la ligne de total en haut + les lignes de catégories
          return (
            <>
              {/* Ligne de total */}
              <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                      {t('common.total')}
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="bg-blue-100 dark:bg-blue-900/40 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                    <p className="text-xs text-blue-700 dark:text-blue-400 font-bold mb-1 uppercase">{t('dashboard.costValue')}</p>
                    <p className="text-2xl font-black text-blue-900 dark:text-blue-200">${totalCost.toFixed(2)}</p>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/40 p-4 rounded-lg border-2 border-green-300 dark:border-green-700">
                    <p className="text-xs text-green-700 dark:text-green-400 font-bold mb-1 uppercase">{t('dashboard.sellValue')}</p>
                    <p className="text-2xl font-black text-green-900 dark:text-green-200">${totalSell.toFixed(2)}</p>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/40 p-4 rounded-lg border-2 border-purple-300 dark:border-purple-700">
                    <p className="text-xs text-purple-700 dark:text-purple-400 font-bold mb-1 uppercase">{t('dashboard.ebitda')}</p>
                    <p className="text-2xl font-black text-purple-900 dark:text-purple-200">
                      ${totalEbitda.toFixed(2)}
                      <span className="text-base ml-2">({totalEbitdaPercent.toFixed(1)}%)</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Lignes de catégories */}
              {categoryRows}
            </>
          );
          })()}
        </div>
      </div>

      {/* Alerte mise à jour des prix */}
      {(() => {
        const now = new Date();
        const itemsNeedingPriceUpdate = items.filter(item => {
          if (!item.nextPriceUpdate) return false;
          return new Date(item.nextPriceUpdate) <= now;
        });

        if (itemsNeedingPriceUpdate.length === 0) return null;

        return (
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-l-4 border-yellow-600 p-4 sm:p-6 rounded-xl shadow-lg">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="flex-shrink-0 p-2.5 sm:p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg">
                  <DollarSign size={24} className="text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-xl font-bold text-yellow-900 dark:text-yellow-400 mb-1.5">
                    Mise à jour des prix requise
                  </h3>
                  <p className="text-sm sm:text-base text-yellow-800 dark:text-yellow-300 mb-3">
                    {itemsNeedingPriceUpdate.length} article{itemsNeedingPriceUpdate.length > 1 ? 's' : ''} nécessite{itemsNeedingPriceUpdate.length > 1 ? 'nt' : ''} une révision des prix
                  </p>

                  <div className="space-y-2">
                    {itemsNeedingPriceUpdate.slice(0, 5).map(item => (
                      <div key={item.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-900 dark:text-white" title={item.name}>{item.name}</p>
                            <p className="truncate text-sm text-gray-600 dark:text-gray-400">
                              {t('administration.lastUpdate')}: {new Date(item.lastPriceUpdate).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded-full">
                            {item.priceUpdateInterval === 'custom' ? `${item.customPriceInterval} mois` : `${item.priceUpdateInterval} mois`}
                          </span>
                        </div>
                      </div>
                    ))}
                    {itemsNeedingPriceUpdate.length > 5 && (
                      <p className="text-sm text-yellow-700 dark:text-yellow-400 text-center">
                        +{itemsNeedingPriceUpdate.length - 5} autre{itemsNeedingPriceUpdate.length - 5 > 1 ? 's' : ''} article{itemsNeedingPriceUpdate.length - 5 > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <Button
                  variant="primary"
                  icon={Settings}
                  onClick={() => setView('admin')}
                  className="w-full sm:w-auto justify-center whitespace-nowrap"
                >
                  Gérer les prix
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Tableau professionnel */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{t('articles.articleList')}</h2>
          </div>

          <SearchInput
            key="dashboard-search-stable"
            placeholder={t('articles.searchArticles')}
            onSearchChange={onSearchChange}
            debounceMs={300}
          />
        </div>

        {/* MOBILE (< lg) : liste de cartes — le tableau à 8 colonnes est illisible sur petit écran.
            Un SEUL scroll vertical, pas de défilement horizontal. */}
        <div onScroll={onListScroll} className="lg:hidden max-h-[70vh] divide-y divide-gray-100 overflow-y-auto dark:divide-gray-700">
          {visibleItems.map((item) => (
            <div key={item.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-900 dark:text-white">{item.name}</p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-mono">{item.code}</span>{item.location ? ` · ${item.location}` : ''}
                  </p>
                </div>
                <StatusBadge quantity={item.quantity} minQuantity={item.minQuantity} maxQuantity={item.maxQuantity} t={t} />
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                <span className="inline-flex min-w-0 items-center gap-1"><Tag size={12} className="shrink-0" /><span className="truncate">{item.category || '—'}</span></span>
                {item.department && <span className="truncate">· {item.department}</span>}
              </div>
              <div className="mt-2 flex items-end justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <ProgressBar value={item.quantity} max={item.maxQuantity} showLabel={false} />
                  <p className="mt-1 font-mono text-xs text-gray-600 dark:text-gray-400">{item.quantity} / {item.maxQuantity} {item.unit}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-semibold text-green-600">${(item.salePrice * item.quantity).toFixed(2)}</p>
                  <p className="text-[11px] text-gray-500">${item.salePrice.toFixed(2)}/u</p>
                </div>
              </div>
              <div className="mt-1 flex justify-end">
                <ActionButtons
                  onEdit={() => { setEditingItem(item); setShowItemForm(true); }}
                  onDelete={() => deleteItem(item.id)}
                  onView={() => { setSelectedItemForView(item); setShowViewModal(true); }}
                  onShare={() => { setSelectedItemForShare(item); setShowShareModal(true); }}
                  t={t}
                />
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP (lg+) : tableau. `table-fixed` + largeurs de colonnes + troncature → les textes
            longs n'étirent plus les colonnes (plus de scroll horizontal). Un seul scroll vertical,
            en-têtes collantes. */}
        <div onScroll={onListScroll} className="hidden max-h-[70vh] overflow-y-auto lg:block">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-28" />
              <col />
              <col className="w-44" />
              <col className="w-36" />
              <col className="w-40" />
              <col className="w-32" />
              <col className="w-28" />
              <col className="w-24" />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-4 text-left">
                  <button
                    onClick={() => handleSort('code')}
                    className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white hover:text-slate-600 transition-colors"
                  >
                    Code
                    <ArrowUpDown size={14} className="shrink-0" />
                  </button>
                </th>
                <th className="px-4 py-4 text-left">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white hover:text-slate-600 transition-colors"
                  >
                    Article
                    <ArrowUpDown size={14} className="shrink-0" />
                  </button>
                </th>
                <th className="px-4 py-4 text-left font-semibold text-gray-900 dark:text-white">{t('common.category')}</th>
                <th className="px-4 py-4 text-left">
                  <button
                    onClick={() => handleSort('department')}
                    className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white hover:text-slate-600 transition-colors"
                  >
                    {t('common.department')}
                    <ArrowUpDown size={14} className="shrink-0" />
                  </button>
                </th>
                <th className="px-4 py-4 text-left font-semibold text-gray-900 dark:text-white">{t('common.stock')}</th>
                <th className="px-4 py-4 text-left">
                  <button
                    onClick={() => handleSort('salePrice')}
                    className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white hover:text-slate-600 transition-colors"
                  >
                    Valeur
                    <ArrowUpDown size={14} className="shrink-0" />
                  </button>
                </th>
                <th className="px-4 py-4 text-left font-semibold text-gray-900 dark:text-white">{t('common.status')}</th>
                <th className="px-4 py-4 text-center font-semibold text-gray-900 dark:text-white">{t('articles.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {visibleItems.map((item, index) => (
                <tr
                  key={item.id}
                  className={`
                    ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}
                    hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors
                  `}
                >
                  <td className="px-4 py-4">
                    <span className="block truncate font-mono text-sm text-gray-900 dark:text-white font-medium" title={item.code}>
                      {item.code}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900 dark:text-white" title={item.name}>{item.name}</p>
                      <p className="truncate text-sm text-gray-500 dark:text-gray-400" title={item.location}>{item.location}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="min-w-0 space-y-1">
                      <span className="flex min-w-0 items-center gap-1 text-sm text-gray-900 dark:text-white font-medium" title={item.category}>
                        <Tag size={14} className="shrink-0" />
                        <span className="truncate">{item.category}</span>
                      </span>
                      {item.subcategory && (
                        <p className="truncate pl-5 text-xs text-gray-500 dark:text-gray-400" title={item.subcategory}>
                          {item.subcategory}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="block truncate text-sm text-gray-900 dark:text-white font-medium" title={item.department || '-'}>
                      {item.department || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <ProgressBar value={item.quantity} max={item.maxQuantity} showLabel={false} />
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-mono">
                        {item.quantity} / {item.maxQuantity} {item.unit}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="truncate font-semibold text-green-600">${(item.salePrice * item.quantity).toFixed(2)}</p>
                    <p className="truncate text-xs text-gray-500">${item.salePrice.toFixed(2)} / unité</p>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge
                      quantity={item.quantity}
                      minQuantity={item.minQuantity}
                      maxQuantity={item.maxQuantity}
                      t={t}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center">
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Compteur : fenêtrage actif → on indique ce qui est affiché vs le total (le reste se charge au scroll). */}
        {sortedItems.length > 0 && (
          <div className="border-t border-gray-200 p-3 text-center text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
            {visibleCount < sortedItems.length
              ? `${Math.min(visibleCount, sortedItems.length)} / ${sortedItems.length} ${sortedItems.length > 1 ? 'articles' : 'article'} ${filteredItems.length !== items.length ? '(filtrés) ' : ''}· ${t('common.scrollForMore') || 'défilez pour voir plus'}`
              : `${sortedItems.length} ${sortedItems.length > 1 ? 'articles' : 'article'} ${filteredItems.length !== items.length ? '(filtrés)' : ''}`}
          </div>
        )}

        {filteredItems.length === 0 && (
          <EmptyState
            icon={Package}
            title={t('articles.noArticles')}
            message={t('articles.noArticlesFiltered')}
          />
        )}
      </div>
    </div>
  );
});

DashboardView.displayName = 'DashboardView';

export default DashboardView;
