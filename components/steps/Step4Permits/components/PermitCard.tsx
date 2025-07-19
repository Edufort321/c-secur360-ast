// =================== COMPONENTS/PERMITCARD.TSX - CARTE PERMIS MOBILE-FIRST ===================
// Composant carte permis avec animations, touch gestures et optimisation mobile

"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Users, 
  Settings,
  Share2,
  Download,
  Eye,
  Edit3,
  Copy,
  Trash2,
  ExternalLink,
  MapPin,
  Calendar,
  Timer,
  Zap,
  Shield,
  HardHat,
  Wrench,
  Activity
} from 'lucide-react';
type PermitType = 'confined_space' | 'hot_work' | 'excavation' | 'lifting' | 'height_work' | 'electrical';

// Types temporaires pour éviter les erreurs
interface LegalPermit {
  id: string;
  type: string;
  name: string;
  location: string;
  status: string;
  priority: string;
  description?: string;
  progress?: number;
  dateCreation: string;
  dateExpiration: string;
  validationResults?: any;
}

interface PermitCardProps {
  permit: LegalPermit;
  language: 'fr' | 'en';
  touchOptimized?: boolean;
  compactMode?: boolean;
  onView: (permit: LegalPermit) => void;
  onEdit: (permit: LegalPermit) => void;
  onDuplicate: (permit: LegalPermit) => void;
  onDelete: (permit: LegalPermit) => void;
  onValidate: (permit: LegalPermit) => void;
  showValidationStatus?: boolean;
}

interface SwipeActionConfig {
  direction: SwipeDirection;
  threshold: number;
  icon: React.ReactNode;
  label: { fr: string; en: string };
  color: string;
  action: MobileCardAction;
  hapticPattern?: number[];
}

// =================== CONFIGURATION SWIPE ACTIONS MOBILE ===================
const SWIPE_ACTIONS: SwipeActionConfig[] = [
  {
    direction: 'right',
    threshold: 100,
    icon: <Eye size={20} />,
    label: { fr: 'Voir', en: 'View' },
    color: '#3B82F6',
    action: 'view',
    hapticPattern: [50]
  },
  {
    direction: 'left',
    threshold: 100,
    icon: <Edit3 size={20} />,
    label: { fr: 'Modifier', en: 'Edit' },
    color: '#10B981',
    action: 'edit',
    hapticPattern: [50, 25, 50]
  },
  {
    direction: 'left-extended',
    threshold: 200,
    icon: <Share2 size={20} />,
    label: { fr: 'Partager', en: 'Share' },
    color: '#8B5CF6',
    action: 'share',
    hapticPattern: [100, 50, 100]
  }
];

// =================== CONFIGURATION ICONS PAR TYPE ===================
const PERMIT_ICONS: Record<PermitType, React.ReactNode> = {
  'espace-clos': <Shield className="w-5 h-5" />,
  'travail-chaud': <Zap className="w-5 h-5" />,
  'excavation': <HardHat className="w-5 h-5" />,
  'levage': <Wrench className="w-5 h-5" />,
  'hauteur': <Activity className="w-5 h-5" />,
  'isolation-energetique': <Zap className="w-5 h-5" />,
  'pression': <Settings className="w-5 h-5" />,
  'radiographie': <AlertTriangle className="w-5 h-5" />,
  'toiture': <HardHat className="w-5 h-5" />,
  'demolition': <Wrench className="w-5 h-5" />
};

// =================== CONFIGURATION STATUS COULEURS ===================
const STATUS_CONFIG: Record<PermitStatus, {
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  label: { fr: string; en: string };
}> = {
  'active': {
    color: '#10B981',
    bgColor: '#D1FAE5',
    icon: <CheckCircle className="w-4 h-4" />,
    label: { fr: 'Actif', en: 'Active' }
  },
  'pending': {
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    icon: <Clock className="w-4 h-4" />,
    label: { fr: 'En attente', en: 'Pending' }
  },
  'expired': {
    color: '#EF4444',
    bgColor: '#FEE2E2',
    icon: <AlertTriangle className="w-4 h-4" />,
    label: { fr: 'Expiré', en: 'Expired' }
  },
  'suspended': {
    color: '#6B7280',
    bgColor: '#F3F4F6',
    icon: <AlertTriangle className="w-4 h-4" />,
    label: { fr: 'Suspendu', en: 'Suspended' }
  }
};

// =================== COMPOSANT PRINCIPAL CARTE MOBILE ===================
export const PermitCard: React.FC<MobileCardProps> = ({
  permit,
  touchOptimized = true,
  enableSwipeActions = true,
  enableHaptics = true,
  compactMode = false,
  language = 'fr',
  onView,
  onEdit,
  onDuplicate,
  onShare,
  onDelete,
  onQuickAction,
  ...props
}) => {
  // =================== STATE MANAGEMENT ===================
  const [isExpanded, setIsExpanded] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [activeSwipeAction, setActiveSwipeAction] = useState<SwipeActionConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // =================== SWIPE HANDLERS MOBILE ===================
  const swipeHandlers = useSwipeable({
    onSwipeStart: () => {
      if (enableHaptics && navigator.vibrate) {
        navigator.vibrate(25); // Feedback début swipe
      }
    },
    onSwiping: (eventData) => {
      if (!enableSwipeActions) return;
      
      const { deltaX } = eventData;
      const maxOffset = 200;
      const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, deltaX));
      
      setSwipeOffset(clampedOffset);
      
      // Détection action active selon direction et seuil
      const activeAction = SWIPE_ACTIONS.find(action => {
        if (action.direction === 'right' && clampedOffset > action.threshold) return true;
        if (action.direction === 'left' && clampedOffset < -action.threshold) return true;
        if (action.direction === 'left-extended' && clampedOffset < -action.threshold) return true;
        return false;
      });
      
      if (activeAction !== activeSwipeAction) {
        setActiveSwipeAction(activeAction || null);
        
        // Feedback haptic changement action
        if (activeAction && enableHaptics && navigator.vibrate) {
          navigator.vibrate(activeAction.hapticPattern || [50]);
        }
      }
    },
    onSwiped: () => {
      // Exécution action si seuil atteint
      if (activeSwipeAction && onQuickAction) {
        onQuickAction(activeSwipeAction.action, permit);
        
        // Feedback haptic succès
        if (enableHaptics && navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
      }
      
      // Reset état swipe
      setSwipeOffset(0);
      setActiveSwipeAction(null);
    },
    trackMouse: false, // Désactiver mouse events (mobile only)
    preventScrollOnSwipe: true,
    delta: 10 // Seuil minimum pour déclenchement
  });

  // =================== CALCULS TEMPS ET PROGRESSION ===================
  const timeInfo = useMemo(() => {
    const now = new Date();
    const created = new Date(permit.dateCreation);
    const expires = new Date(permit.dateExpiration);
    
    const totalDuration = expires.getTime() - created.getTime();
    const elapsed = now.getTime() - created.getTime();
    const remaining = expires.getTime() - now.getTime();
    
    const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    
    const formatTimeRemaining = (ms: number) => {
      const days = Math.floor(ms / (24 * 60 * 60 * 1000));
      const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      
      if (days > 0) {
        return language === 'fr' ? `${days}j ${hours}h` : `${days}d ${hours}h`;
      }
      return language === 'fr' ? `${hours}h` : `${hours}h`;
    };
    
    return {
      progress,
      remaining: remaining > 0 ? formatTimeRemaining(remaining) : '0h',
      isExpiring: remaining < 24 * 60 * 60 * 1000, // < 24h
      isCritical: remaining < 2 * 60 * 60 * 1000    // < 2h
    };
  }, [permit.dateCreation, permit.dateExpiration, language]);

  // =================== GESTION ACTIONS MOBILE ===================
  const handleCardTap = () => {
    if (touchOptimized) {
      // Feedback haptic tap
      if (enableHaptics && navigator.vibrate) {
        navigator.vibrate(25);
      }
      
      // Expansion/collapse carte
      setIsExpanded(!isExpanded);
    }
  };

  const handleQuickAction = async (action: MobileCardAction) => {
    setIsLoading(true);
    
    try {
      switch (action) {
        case 'view':
          onView?.(permit);
          break;
        case 'edit':
          onEdit?.(permit);
          break;
        case 'share':
          if (navigator.share) {
            await navigator.share({
              title: `Permis: ${permit.name}`,
              text: `Permis ${permit.type} - ${permit.status}`,
              url: `${window.location.origin}/permits/${permit.id}`
            });
          } else {
            onShare?.(permit);
          }
          break;
        case 'duplicate':
          onDuplicate?.(permit);
          break;
        case 'delete':
          if (confirm(language === 'fr' ? 'Supprimer ce permis?' : 'Delete this permit?')) {
            onDelete?.(permit);
          }
          break;
      }
      
      onQuickAction?.(action, permit);
    } catch (error) {
      console.error('Erreur action carte:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // =================== RENDU COMPOSANT ===================
  const statusConfig = STATUS_CONFIG[permit.status];
  const permitIcon = PERMIT_ICONS[permit.type];

  return (
    <motion.div
      ref={cardRef}
      {...(enableSwipeActions ? swipeHandlers : {})}
      className={`
        relative bg-white rounded-xl shadow-lg border border-gray-100
        ${touchOptimized ? 'touch-pan-y select-none' : ''}
        ${compactMode ? 'p-3' : 'p-4'}
        transition-all duration-200 ease-out
        active:scale-[0.98] active:shadow-md
      `}
      style={{
        transform: `translateX(${swipeOffset}px)`,
        transition: swipeOffset === 0 ? 'transform 0.3s ease-out' : 'none'
      }}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* =================== INDICATEUR SWIPE ACTION =================== */}
      <AnimatePresence>
        {activeSwipeAction && (
          <motion.div
            className="absolute inset-0 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${activeSwipeAction.color}20` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div 
              className="flex items-center gap-2 px-4 py-2 rounded-lg"
              style={{ backgroundColor: activeSwipeAction.color }}
            >
              <span className="text-white">{activeSwipeAction.icon}</span>
              <span className="text-white font-medium">
                {activeSwipeAction.label[language]}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =================== HEADER CARTE =================== */}
      <div 
        className="flex items-start justify-between mb-3 cursor-pointer"
        onClick={handleCardTap}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Icon type permis */}
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <span className="text-blue-600">{permitIcon}</span>
          </div>
          
          {/* Info principale */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate text-base">
              {permit.name}
            </h3>
            <p className="text-sm text-gray-600 truncate">
              {permit.location || permit.site}
            </p>
            
            {/* Status badge */}
            <div className="flex items-center gap-2 mt-1">
              <div 
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ 
                  color: statusConfig.color,
                  backgroundColor: statusConfig.bgColor 
                }}
              >
                {statusConfig.icon}
                <span>{statusConfig.label[language]}</span>
              </div>
              
              {/* Indicateur temps restant */}
              {timeInfo.isExpiring && (
                <div className={`
                  inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                  ${timeInfo.isCritical ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}
                `}>
                  <Timer className="w-3 h-3" />
                  <span>{timeInfo.remaining}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress circle */}
        <div className="flex-shrink-0 relative w-12 h-12">
          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="2"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={statusConfig.color}
              strokeWidth="2"
              strokeDasharray={`${timeInfo.progress}, 100`}
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-600">
              {Math.round(timeInfo.progress)}%
            </span>
          </div>
        </div>
      </div>

      {/* =================== DÉTAILS EXPANDABLES =================== */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 pt-3 space-y-3">
              {/* Informations détaillées */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-600">
                      {language === 'fr' ? 'Créé le' : 'Created'}
                    </p>
                    <p className="font-medium">
                      {new Date(permit.dateCreation).toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-CA')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-600">
                      {language === 'fr' ? 'Expire le' : 'Expires'}
                    </p>
                    <p className="font-medium">
                      {new Date(permit.dateExpiration).toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-CA')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-600">
                      {language === 'fr' ? 'Personnel' : 'Personnel'}
                    </p>
                    <p className="font-medium">
                      {permit.entrants?.length || 0} {language === 'fr' ? 'personnes' : 'people'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-600">
                      {language === 'fr' ? 'Secteur' : 'Area'}
                    </p>
                    <p className="font-medium truncate">
                      {permit.secteur || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions rapides mobile */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleQuickAction('view')}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-50 text-blue-600 rounded-lg font-medium text-sm transition-colors active:bg-blue-100"
                >
                  <Eye className="w-4 h-4" />
                  <span>{language === 'fr' ? 'Voir' : 'View'}</span>
                </button>
                
                <button
                  onClick={() => handleQuickAction('edit')}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-green-50 text-green-600 rounded-lg font-medium text-sm transition-colors active:bg-green-100"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{language === 'fr' ? 'Modifier' : 'Edit'}</span>
                </button>
                
                <button
                  onClick={() => handleQuickAction('share')}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-purple-50 text-purple-600 rounded-lg font-medium text-sm transition-colors active:bg-purple-100"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =================== INDICATEUR CHARGEMENT =================== */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 rounded-xl flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </motion.div>
  );
};

// =================== EXPORT DEFAULT ===================
export default PermitCard;
