'use client';

import { useState, useEffect, useCallback } from 'react';

interface DemoLimiterConfig {
  timeLimit: number; // en millisecondes (default: 5 minutes)
  onLimitReached: () => void;
  onSaveAttempt: () => void;
}

interface DemoLimiterReturn {
  isDemo: boolean;
  timeRemaining: number;
  isExpired: boolean;
  showContactModal: boolean;
  setShowContactModal: (show: boolean) => void;
  interceptSave: (originalAction: () => void | Promise<void>) => void;
  resetTimer: () => void;
}

const DEFAULT_DEMO_TIME = 5 * 60 * 1000; // 5 minutes

export const useDemoLimiter = (config?: Partial<DemoLimiterConfig>): DemoLimiterReturn => {
  const [startTime] = useState(() => Date.now());
  const [timeRemaining, setTimeRemaining] = useState(config?.timeLimit || DEFAULT_DEMO_TIME);
  const [isExpired, setIsExpired] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const isDemo = typeof window !== 'undefined' && 
    (window.location.pathname.startsWith('/demo') || 
     window.location.hostname.includes('demo') ||
     window.location.search.includes('demo=true'));

  // Timer countdown
  useEffect(() => {
    if (!isDemo) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = (config?.timeLimit || DEFAULT_DEMO_TIME) - elapsed;
      
      setTimeRemaining(remaining);
      
      if (remaining <= 0 && !isExpired) {
        setIsExpired(true);
        setShowContactModal(true);
        config?.onLimitReached?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, config?.timeLimit, config?.onLimitReached, isDemo, isExpired]);

  const interceptSave = useCallback((originalAction: () => void | Promise<void>) => {
    if (!isDemo) {
      // Mode production - exécuter l'action normalement
      return originalAction();
    }

    // Mode démo - afficher le modal de contact
    setShowContactModal(true);
    config?.onSaveAttempt?.();
  }, [isDemo, config?.onSaveAttempt]);

  const resetTimer = useCallback(() => {
    setTimeRemaining(config?.timeLimit || DEFAULT_DEMO_TIME);
    setIsExpired(false);
    setShowContactModal(false);
  }, [config?.timeLimit]);

  return {
    isDemo,
    timeRemaining,
    isExpired,
    showContactModal,
    setShowContactModal,
    interceptSave,
    resetTimer
  };
};