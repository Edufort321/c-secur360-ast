// components/steps/Step4Permits/components/base.tsx - Composants de base

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, Edit3, Copy, Trash2, CheckCircle, XCircle, Clock, 
  AlertTriangle, RefreshCw, X, Home, Flame, Construction, 
  Crane, Building, Zap, Users, FileText, Calendar
} from 'lucide-react';

// =================== PERMIT CARD ===================
interface PermitCardProps {
  permit: any;
  language: 'fr' | 'en';
  touchOptimized?: boolean;
  compactMode?: boolean;
  onView: (permit: any) => void;
  onEdit: (permit: any) => void;
  onDuplicate: (permit: any) => void;
  onDelete: (permit: any) => void;
  onValidate: (permit: any) => void;
  showValidationStatus?: boolean;
}

const PERMIT_ICONS = {
  'confined_space': Home,
  'hot_work': Flame,
  'excavation': Construction,
  'lifting': Crane,
  'height_work': Building,
  'electrical': Zap
};

const PERMIT_COLORS = {
  'confined_space': 'bg-red-50 border-red-200 text-red-700',
  'hot_work': 'bg-orange-50 border-orange-200 text-orange-700',
  'excavation': 'bg-yellow-50 border-yellow-200 text-yellow-700',
  'lifting': 'bg-green-50 border-green-200 text-green-700',
  'height_work': 'bg-purple-50 border-purple-200 text-purple-700',
  'electrical': 'bg-red-50 border-red-200 text-red-700'
};

const STATUS_COLORS = {
  'draft': 'bg-gray-100 text-gray-800',
  'pending': 'bg-yellow-100 text-yellow-800',
  'approved': 'bg-green-100 text-green-800',
  'active': 'bg-blue-100 text-blue-800',
  'completed': 'bg-green-100 text-green-800',
  'expired': 'bg-red-100 text-red-800',
  'suspended': 'bg-orange-100 text-orange-800',
  'cancelled': 'bg-gray-100 text-gray-800'
};

const PRIORITY_COLORS = {
  'low': 'bg-green-100 text-green-800',
  'medium': 'bg-yellow-100 text-yellow-800',
  'high': 'bg-orange-100 text-orange-800',
  'critical': 'bg-red-100 text-red-800'
};

export const PermitCard: React.FC<PermitCardProps> = ({
  permit,
  language,
  touchOptimized = false,
  compactMode = false,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onValidate,
  showValidationStatus = false
}) => {
  const PermitIcon = PERMIT_ICONS[permit.type] || FileText;
  const isValid = permit.validationResults?.overall?.isValid;

  return (
    <motion.div
      className={`bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-shadow ${
        PERMIT_COLORS[permit.type] || 'bg-gray-50 border-gray-200'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white shadow-sm">
              <PermitIcon size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 truncate">{permit.name}</h3>
              <p className="text-sm text-gray-600">{permit.location}</p>
            </div>
          </div>
          
          {showValidationStatus && (
            <div className="flex items-center gap-1">
              {isValid === true && <CheckCircle size={20} className="text-green-500" />}
              {isValid === false && <XCircle size={20} className="text-red-500" />}
              {isValid === undefined && <Clock size={20} className="text-yellow-500" />}
            </div>
          )}
        </div>

        {/* Status and Priority */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[permit.status]}`}>
            {permit.status}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[permit.priority]}`}>
            {permit.priority}
          </span>
        </div>

        {/* Description */}
        {permit.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{permit.description}</p>
        )}

        {/* Progress */}
        {permit.progress !== undefined && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">
                {language === 'fr' ? 'Progression' : 'Progress'}
              </span>
              <span className="font-medium">{permit.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${permit.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{new Date(permit.dateCreation).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{new Date(permit.dateExpiration).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(permit)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors ${
              touchOptimized ? 'min-h-[44px]' : 'min-h-[36px]'
            }`}
          >
            <Eye size={16} />
            <span className="text-sm font-medium">
              {language === 'fr' ? 'Voir' : 'View'}
            </span>
          </button>

          <button
            onClick={() => onEdit(permit)}
            className={`p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors ${
              touchOptimized ? 'min-h-[44px] min-w-[44px]' : 'min-h-[36px] min-w-[36px]'
            }`}
          >
            <Edit3 size={16} />
          </button>

          <button
            onClick={() => onDuplicate(permit)}
            className={`p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors ${
              touchOptimized ? 'min-h-[44px] min-w-[44px]' : 'min-h-[36px] min-w-[36px]'
            }`}
          >
            <Copy size={16} />
          </button>

          <button
            onClick={() => onDelete(permit)}
            className={`p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors ${
              touchOptimized ? 'min-h-[44px] min-w-[44px]' : 'min-h-[36px] min-w-[36px]'
            }`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// =================== STATUS BADGE ===================
interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'approved':
      case 'active':
      case 'completed':
        return <CheckCircle size={16} />;
      case 'pending':
        return <Clock size={16} />;
      case 'expired':
      case 'cancelled':
        return <XCircle size={16} />;
      case 'suspended':
        return <AlertTriangle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${
      STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'
    } ${sizeClasses[size]}`}>
      {showIcon && getStatusIcon()}
      <span>{status}</span>
    </span>
  );
};

// =================== TIMER SURVEILLANCE ===================
interface TimerSurveillanceProps {
  config: {
    permitId: string;
    permitType: string;
    workingTime: number;
    warningTime: number;
    criticalTime: number;
    checkInInterval: number;
    autoExtendEnabled: boolean;
    autoExtendDuration: number;
    emergencyContacts: any[];
  };
  language: 'fr' | 'en';
  isActive: boolean;
  onTimerExpired: () => void;
  touchOptimized?: boolean;
}

export const TimerSurveillance: React.FC<TimerSurveillanceProps> = ({
  config,
  language,
  isActive,
  onTimerExpired,
  touchOptimized = false
}) => {
  const [timeRemaining, setTimeRemaining] = React.useState(config.workingTime * 60);
  const [status, setStatus] = React.useState<'normal' | 'warning' | 'critical'>('normal');

  React.useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        
        if (newTime <= 0) {
          onTimerExpired();
          return 0;
        }
        
        if (newTime <= config.criticalTime * 60) {
          setStatus('critical');
        } else if (newTime <= config.warningTime * 60) {
          setStatus('warning');
        } else {
          setStatus('normal');
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, config, onTimerExpired]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'critical': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">
          {language === 'fr' ? 'Surveillance permis' : 'Permit monitoring'}
        </h3>
        <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
      </div>

      <div className="text-center mb-4">
        <div className={`text-4xl font-mono font-bold mb-2 ${
          status === 'critical' ? 'text-red-600' :
          status === 'warning' ? 'text-yellow-600' : 'text-green-600'
        }`}>
          {formatTime(timeRemaining)}
        </div>
        <p className="text-sm text-gray-600">
          {language === 'fr' ? 'Temps restant' : 'Time remaining'}
        </p>
      </div>

      <div className="flex gap-2">
        <button 
          className={`flex-1 py-2 px-4 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors ${
            touchOptimized ? 'min-h-[44px]' : 'min-h-[36px]'
          }`}
        >
          {language === 'fr' ? 'Check-in' : 'Check-in'}
        </button>
        <button 
          className={`flex-1 py-2 px-4 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors ${
            touchOptimized ? 'min-h-[44px]' : 'min-h-[36px]'
          }`}
        >
          {language === 'fr' ? 'Prolonger' : 'Extend'}
        </button>
      </div>
    </div>
  );
};

// =================== LOADING SPINNER ===================
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'text-blue-600'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center">
      <RefreshCw className={`animate-spin ${sizeClasses[size]} ${color}`} />
    </div>
  );
};

// =================== ERROR BOUNDARY ===================
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  return (
    <div>
      {children}
    </div>
  );
};

// =================== TOAST NOTIFICATION ===================
interface ToastNotificationProps {
  notification: {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: Date;
  };
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  notification,
  onClose
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success': return <CheckCircle className="text-green-500" size={20} />;
      case 'error': return <XCircle className="text-red-500" size={20} />;
      case 'warning': return <AlertTriangle className="text-yellow-500" size={20} />;
      default: return <Clock className="text-blue-500" size={20} />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <motion.div
      className={`flex items-center gap-3 p-4 rounded-lg border shadow-lg ${getBgColor()}`}
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
    >
      {getIcon()}
      <span className="flex-1 text-sm">{notification.message}</span>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

// =================== CONFIRM DIALOG ===================
interface ConfirmDialogProps {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  language: 'fr' | 'en';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  show,
  title,
  message,
  onConfirm,
  onCancel,
  language
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            {language === 'fr' ? 'Annuler' : 'Cancel'}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            {language === 'fr' ? 'Confirmer' : 'Confirm'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// =================== HELP TOOLTIP ===================
interface HelpTooltipProps {
  content: string;
  children: React.ReactNode;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ content, children }) => {
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
        {content}
      </div>
    </div>
  );
};

// =================== EXPORTS ===================
export default PermitCard;
