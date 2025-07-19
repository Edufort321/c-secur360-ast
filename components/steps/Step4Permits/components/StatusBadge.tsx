// =================== COMPONENTS/STATUSBADGE.TSX - COMPOSANT STATUS VISUELS MOBILE-FIRST ===================
// Badge status avec animations, couleurs contextuelles et optimisation mobile

"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle,
  Pause,
  Eye,
  FileCheck,
  Zap,
  Timer,
  RefreshCw,
  Ban,
  AlertCircle
} from 'lucide-react';

// =================== TYPES ===================
export type PermitStatus = 
  | 'draft' 
  | 'pending' 
  | 'approved' 
  | 'active' 
  | 'completed' 
  | 'expired' 
  | 'suspended' 
  | 'cancelled'
  | 'under-review'
  | 'expiring-soon'
  | 'critical';

export type BadgeSize = 'sm' | 'md' | 'lg' | 'xl';
export type BadgeVariant = 'default' | 'pill' | 'square' | 'minimal' | 'outlined';

interface StatusBadgeProps {
  status: PermitStatus;
  language: 'fr' | 'en';
  size?: BadgeSize;
  variant?: BadgeVariant;
  showIcon?: boolean;
  showLabel?: boolean;
  showProgress?: boolean;
  progressValue?: number; // 0-100
  animate?: boolean;
  touchOptimized?: boolean;
  onClick?: () => void;
  className?: string;
  // Time-based props
  timeRemaining?: string;
  isExpiring?: boolean;
  isCritical?: boolean;
}

// =================== CONFIGURATION STATUS ===================
const STATUS_CONFIG: Record<PermitStatus, {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ElementType;
  label: { fr: string; en: string };
  description: { fr: string; en: string };
  priority: number; // 1 = highest priority
}> = {
  'critical': {
    color: '#DC2626',
    bgColor: '#FEE2E2',
    borderColor: '#F87171',
    icon: AlertCircle,
    label: { fr: 'Critique', en: 'Critical' },
    description: { fr: 'Intervention immédiate requise', en: 'Immediate intervention required' },
    priority: 1
  },
  'expiring-soon': {
    color: '#EA580C',
    bgColor: '#FED7AA',
    borderColor: '#FB923C',
    icon: Timer,
    label: { fr: 'Expire bientôt', en: 'Expiring soon' },
    description: { fr: 'Expire dans moins de 24h', en: 'Expires in less than 24h' },
    priority: 2
  },
  'expired': {
    color: '#EF4444',
    bgColor: '#FEE2E2',
    borderColor: '#F87171',
    icon: XCircle,
    label: { fr: 'Expiré', en: 'Expired' },
    description: { fr: 'Permis expiré - action requise', en: 'Permit expired - action required' },
    priority: 3
  },
  'suspended': {
    color: '#7C2D12',
    bgColor: '#FED7AA',
    borderColor: '#EA580C',
    icon: Pause,
    label: { fr: 'Suspendu', en: 'Suspended' },
    description: { fr: 'Travaux suspendus', en: 'Work suspended' },
    priority: 4
  },
  'cancelled': {
    color: '#6B7280',
    bgColor: '#F3F4F6',
    borderColor: '#9CA3AF',
    icon: Ban,
    label: { fr: 'Annulé', en: 'Cancelled' },
    description: { fr: 'Permis annulé', en: 'Permit cancelled' },
    priority: 5
  },
  'active': {
    color: '#059669',
    bgColor: '#D1FAE5',
    borderColor: '#34D399',
    icon: CheckCircle,
    label: { fr: 'Actif', en: 'Active' },
    description: { fr: 'Travaux en cours', en: 'Work in progress' },
    priority: 6
  },
  'completed': {
    color: '#10B981',
    bgColor: '#ECFDF5',
    borderColor: '#6EE7B7',
    icon: FileCheck,
    label: { fr: 'Complété', en: 'Completed' },
    description: { fr: 'Travaux terminés', en: 'Work completed' },
    priority: 7
  },
  'approved': {
    color: '#0891B2',
    bgColor: '#CFFAFE',
    borderColor: '#67E8F9',
    icon: CheckCircle,
    label: { fr: 'Approuvé', en: 'Approved' },
    description: { fr: 'Permis approuvé', en: 'Permit approved' },
    priority: 8
  },
  'under-review': {
    color: '#7C3AED',
    bgColor: '#EDE9FE',
    borderColor: '#C4B5FD',
    icon: Eye,
    label: { fr: 'En révision', en: 'Under review' },
    description: { fr: 'En cours d\'examen', en: 'Under examination' },
    priority: 9
  },
  'pending': {
    color: '#D97706',
    bgColor: '#FEF3C7',
    borderColor: '#FCD34D',
    icon: Clock,
    label: { fr: 'En attente', en: 'Pending' },
    description: { fr: 'En attente d\'approbation', en: 'Awaiting approval' },
    priority: 10
  },
  'draft': {
    color: '#6B7280',
    bgColor: '#F9FAFB',
    borderColor: '#D1D5DB',
    icon: RefreshCw,
    label: { fr: 'Brouillon', en: 'Draft' },
    description: { fr: 'En cours de rédaction', en: 'Being drafted' },
    priority: 11
  }
};

// =================== CONFIGURATION TAILLES ===================
const SIZE_CONFIG: Record<BadgeSize, {
  container: string;
  icon: string;
  text: string;
  padding: string;
  gap: string;
  minHeight: string;
}> = {
  'sm': {
    container: 'text-xs',
    icon: 'w-3 h-3',
    text: 'text-xs',
    padding: 'px-2 py-1',
    gap: 'gap-1',
    minHeight: 'min-h-[24px]'
  },
  'md': {
    container: 'text-sm',
    icon: 'w-4 h-4',
    text: 'text-sm',
    padding: 'px-3 py-1.5',
    gap: 'gap-1.5',
    minHeight: 'min-h-[32px]'
  },
  'lg': {
    container: 'text-base',
    icon: 'w-5 h-5',
    text: 'text-base',
    padding: 'px-4 py-2',
    gap: 'gap-2',
    minHeight: 'min-h-[40px]'
  },
  'xl': {
    container: 'text-lg',
    icon: 'w-6 h-6',
    text: 'text-lg',
    padding: 'px-5 py-2.5',
    gap: 'gap-2.5',
    minHeight: 'min-h-[48px]'
  }
};

// =================== CONFIGURATION VARIANTES ===================
const VARIANT_CONFIG: Record<BadgeVariant, {
  baseClasses: string;
  borderClasses: string;
}> = {
  'default': {
    baseClasses: 'rounded-lg',
    borderClasses: 'border border-opacity-50'
  },
  'pill': {
    baseClasses: 'rounded-full',
    borderClasses: 'border border-opacity-50'
  },
  'square': {
    baseClasses: 'rounded-md',
    borderClasses: 'border-2'
  },
  'minimal': {
    baseClasses: 'rounded-md',
    borderClasses: 'border-0'
  },
  'outlined': {
    baseClasses: 'rounded-lg bg-transparent',
    borderClasses: 'border-2'
  }
};

// =================== COMPOSANT PRINCIPAL ===================
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  language,
  size = 'md',
  variant = 'default',
  showIcon = true,
  showLabel = true,
  showProgress = false,
  progressValue = 0,
  animate = true,
  touchOptimized = true,
  onClick,
  className = '',
  timeRemaining,
  isExpiring = false,
  isCritical = false
}) => {
  // =================== CONFIGURATION ===================
  const config = STATUS_CONFIG[status];
  const sizeConfig = SIZE_CONFIG[size];
  const variantConfig = VARIANT_CONFIG[variant];
  const IconComponent = config.icon;

  // Détermination du status effectif basé sur les conditions temporelles
  const effectiveStatus = isCritical ? 'critical' : isExpiring ? 'expiring-soon' : status;
  const effectiveConfig = STATUS_CONFIG[effectiveStatus];

  // =================== STYLES DYNAMIQUES ===================
  const containerStyle = {
    color: variant === 'outlined' ? effectiveConfig.color : effectiveConfig.color,
    backgroundColor: variant === 'outlined' ? 'transparent' : effectiveConfig.bgColor,
    borderColor: effectiveConfig.borderColor
  };

  const progressStyle = {
    width: `${Math.min(100, Math.max(0, progressValue))}%`,
    backgroundColor: effectiveConfig.color
  };

  // =================== ANIMATION VARIANTS ===================
  const badgeVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: 'spring', 
        stiffness: 500, 
        damping: 30 
      }
    },
    hover: { 
      scale: 1.05,
      transition: { 
        type: 'spring', 
        stiffness: 400, 
        damping: 10 
      }
    },
    tap: { scale: 0.95 }
  };

  const iconVariants = {
    initial: { rotate: 0 },
    animate: {
      rotate: status === 'draft' || status === 'under-review' ? [0, 360] : 0,
      transition: {
        duration: status === 'draft' || status === 'under-review' ? 2 : 0,
        repeat: status === 'draft' || status === 'under-review' ? Infinity : 0,
        ease: 'linear'
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  // =================== CLASSES CSS ===================
  const containerClasses = [
    'inline-flex items-center justify-center font-medium transition-all duration-200',
    sizeConfig.container,
    sizeConfig.padding,
    sizeConfig.gap,
    sizeConfig.minHeight,
    variantConfig.baseClasses,
    variantConfig.borderClasses,
    touchOptimized && onClick ? 'touch-manipulation cursor-pointer select-none' : '',
    touchOptimized ? 'min-h-[44px] min-w-[44px]' : '',
    className
  ].filter(Boolean).join(' ');

  // =================== BADGE CONTENT ===================
  const badgeContent = (
    <>
      {/* Progress bar background (si activé) */}
      {showProgress && (
        <div className="absolute inset-0 overflow-hidden rounded-inherit">
          <motion.div
            className="h-full transition-all duration-500 ease-out opacity-20"
            style={progressStyle}
            initial={{ width: 0 }}
            animate={{ width: `${progressValue}%` }}
          />
        </div>
      )}

      {/* Contenu principal */}
      <div className="relative flex items-center gap-inherit">
        {/* Icon avec animation */}
        {showIcon && (
          <motion.div
            variants={animate ? iconVariants : {}}
            initial="initial"
            animate="animate"
            className={`flex-shrink-0 ${sizeConfig.icon}`}
          >
            <IconComponent className="w-full h-full" />
          </motion.div>
        )}

        {/* Label principal */}
        {showLabel && (
          <span className={`font-medium ${sizeConfig.text} whitespace-nowrap`}>
            {effectiveConfig.label[language]}
          </span>
        )}

        {/* Temps restant (si fourni) */}
        {timeRemaining && (
          <span className={`${sizeConfig.text} opacity-75 whitespace-nowrap`}>
            {timeRemaining}
          </span>
        )}
      </div>
    </>
  );

  // =================== RENDU PRINCIPAL ===================
  const badgeElement = (
    <motion.div
      className={containerClasses}
      style={containerStyle}
      variants={animate ? badgeVariants : {}}
      initial={animate ? 'initial' : false}
      animate={animate ? 'animate' : false}
      whileHover={onClick && animate ? 'hover' : undefined}
      whileTap={onClick && animate ? 'tap' : undefined}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {badgeContent}
    </motion.div>
  );

  // =================== WRAPPER AVEC PULSE (CONDITIONS CRITIQUES) ===================
  if ((isCritical || isExpiring) && animate) {
    return (
      <motion.div
        variants={pulseVariants}
        animate="animate"
        className="inline-block"
      >
        {badgeElement}
      </motion.div>
    );
  }

  return badgeElement;
};

// =================== COMPOSANT MULTI-STATUS ===================
interface MultiStatusBadgeProps {
  statuses: Array<{
    status: PermitStatus;
    count?: number;
    timeRemaining?: string;
  }>;
  language: 'fr' | 'en';
  size?: BadgeSize;
  maxVisible?: number;
  showCounts?: boolean;
  touchOptimized?: boolean;
  onStatusClick?: (status: PermitStatus) => void;
}

export const MultiStatusBadge: React.FC<MultiStatusBadgeProps> = ({
  statuses,
  language,
  size = 'md',
  maxVisible = 3,
  showCounts = true,
  touchOptimized = true,
  onStatusClick
}) => {
  // Tri par priorité
  const sortedStatuses = [...statuses].sort((a, b) => 
    STATUS_CONFIG[a.status].priority - STATUS_CONFIG[b.status].priority
  );

  const visibleStatuses = sortedStatuses.slice(0, maxVisible);
  const hiddenCount = Math.max(0, sortedStatuses.length - maxVisible);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {visibleStatuses.map(({ status, count, timeRemaining }, index) => (
        <div key={`${status}-${index}`} className="flex items-center gap-1">
          <StatusBadge
            status={status}
            language={language}
            size={size}
            timeRemaining={timeRemaining}
            touchOptimized={touchOptimized}
            onClick={() => onStatusClick?.(status)}
          />
          {showCounts && count && count > 1 && (
            <span className="text-xs text-gray-500 font-medium">
              ×{count}
            </span>
          )}
        </div>
      ))}
      
      {hiddenCount > 0 && (
        <div className="text-xs text-gray-500 font-medium px-2 py-1 bg-gray-100 rounded-md">
          +{hiddenCount}
        </div>
      )}
    </div>
  );
};

// =================== HOOK POUR STATUS INTELLIGENT ===================
export const useSmartStatus = (
  baseStatus: PermitStatus,
  expirationDate: Date,
  creationDate?: Date
) => {
  const now = new Date();
  const timeUntilExpiry = expirationDate.getTime() - now.getTime();
  const hoursUntilExpiry = timeUntilExpiry / (1000 * 60 * 60);
  
  // Détermination status intelligent
  let smartStatus = baseStatus;
  let isExpiring = false;
  let isCritical = false;
  
  if (baseStatus === 'active') {
    if (timeUntilExpiry <= 0) {
      smartStatus = 'expired';
    } else if (hoursUntilExpiry <= 2) {
      isCritical = true;
    } else if (hoursUntilExpiry <= 24) {
      isExpiring = true;
    }
  }
  
  // Calcul temps restant formaté
  const formatTimeRemaining = (ms: number) => {
    if (ms <= 0) return '0h';
    
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    
    if (days > 0) return `${days}j ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };
  
  const timeRemaining = formatTimeRemaining(timeUntilExpiry);
  
  // Calcul progression si date création fournie
  let progressValue = 0;
  if (creationDate) {
    const totalDuration = expirationDate.getTime() - creationDate.getTime();
    const elapsed = now.getTime() - creationDate.getTime();
    progressValue = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  }
  
  return {
    status: smartStatus,
    isExpiring,
    isCritical,
    timeRemaining,
    progressValue,
    hoursUntilExpiry
  };
};

// =================== EXPORTS ===================
export default StatusBadge;
