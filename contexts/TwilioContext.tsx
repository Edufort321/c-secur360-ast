"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TwilioConfig {
  enabled: boolean;
  mode: 'production' | 'simulation' | 'disabled';
  valid: boolean;
  phoneNumber?: string;
}

interface SMSOptions {
  astId?: string;
  type: 'lock_applied' | 'lock_removed' | 'general_alert' | 'emergency' | 'work_completion' | 'test';
  message: string;
  recipients: string[];
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

interface TwilioContextType {
  config: TwilioConfig;
  sendSMS: (options: SMSOptions) => Promise<{ success: boolean; message: string; details?: any }>;
  loading: boolean;
  refreshConfig: () => Promise<void>;
}

const TwilioContext = createContext<TwilioContextType | undefined>(undefined);

export function TwilioProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<TwilioConfig>({
    enabled: false,
    mode: 'disabled',
    valid: false
  });
  const [loading, setLoading] = useState(true);

  const refreshConfig = async () => {
    try {
      const response = await fetch('/api/admin/twilio-config');
      if (response.ok) {
        const data = await response.json();
        setConfig({
          enabled: data.valid && data.mode !== 'disabled',
          mode: data.mode,
          valid: data.valid,
          phoneNumber: data.phoneNumber
        });
      }
    } catch (error) {
      console.warn('Unable to fetch Twilio config:', error);
      setConfig({
        enabled: false,
        mode: 'disabled',
        valid: false
      });
    } finally {
      setLoading(false);
    }
  };

  const sendSMS = async (options: SMSOptions): Promise<{ success: boolean; message: string; details?: any }> => {
    if (!config.enabled || !config.valid) {
      return {
        success: false,
        message: 'Service SMS non configuré'
      };
    }

    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          astId: options.astId || 'manual',
          type: options.type,
          message: options.message,
          recipients: options.recipients,
          priority: options.priority || 'normal'
        })
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: result.success,
          message: result.message,
          details: result
        };
      } else {
        return {
          success: false,
          message: result.message || 'Erreur envoi SMS',
          details: result
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erreur réseau lors de l\'envoi SMS',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  };

  useEffect(() => {
    refreshConfig();
  }, []);

  const value: TwilioContextType = {
    config,
    sendSMS,
    loading,
    refreshConfig
  };

  return (
    <TwilioContext.Provider value={value}>
      {children}
    </TwilioContext.Provider>
  );
}

export function useTwilio() {
  const context = useContext(TwilioContext);
  if (context === undefined) {
    throw new Error('useTwilio must be used within a TwilioProvider');
  }
  return context;
}

export default TwilioContext;