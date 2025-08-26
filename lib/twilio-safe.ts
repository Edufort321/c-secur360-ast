/**
 * Safe Twilio integration pour C-Secur360
 * Gère gracieusement l'absence de Twilio en mode développement
 */

import { auditHelpers } from './audit';

export interface TwilioClient {
  messages: {
    create(options: {
      body: string;
      from: string;
      to: string;
      messagingServiceSid?: string;
      statusCallback?: string;
    }): Promise<{ sid: string; status: string }>;
  };
  calls: {
    create(options: {
      url: string;
      from: string;
      to: string;
      statusCallback?: string;
    }): Promise<{ sid: string; status: string }>;
  };
}

export function createTwilioClient(accountSid: string, authToken: string): TwilioClient | null {
  try {
    // Vérification des credentials
    if (!accountSid || !authToken) {
      console.warn('⚠️ Credentials Twilio manquants');
      return null;
    }

    if (accountSid.includes('placeholder') || authToken.includes('placeholder')) {
      console.log('📝 Mode simulation - credentials placeholder détectés');
      return createMockTwilioClient();
    }

    // Import dynamique sécurisé de Twilio
    const twilio = require('twilio');
    const client = twilio(accountSid, authToken);
    
    console.log('✅ Client Twilio créé avec succès');
    return client;
    
  } catch (error) {
    console.warn('⚠️ Erreur création client Twilio:', error);
    console.log('📝 Basculement en mode simulation');
    return createMockTwilioClient();
  }
}

export function createMockTwilioClient(): TwilioClient {
  return {
    messages: {
      async create(options) {
        const mockSid = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        console.log('📝 SMS Simulation:', {
          to: options.to,
          body: options.body.substring(0, 50) + '...',
          sid: mockSid
        });

        // Log de simulation
        await auditHelpers.sms('send', {
          to: options.to,
          simulation: true,
          mockSid,
          messagingService: !!options.messagingServiceSid
        });

        return {
          sid: mockSid,
          status: 'sent'
        };
      }
    },
    calls: {
      async create(options) {
        const mockSid = `call_sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        console.log('📞 Call Simulation:', {
          to: options.to,
          from: options.from,
          url: options.url,
          sid: mockSid
        });

        await auditHelpers.voice('outbound', {
          to: options.to,
          from: options.from,
          simulation: true,
          mockSid
        });

        return {
          sid: mockSid,
          status: 'initiated'
        };
      }
    }
  };
}

export function isTwilioAvailable(): boolean {
  try {
    require('twilio');
    return true;
  } catch {
    return false;
  }
}

export function validateTwilioConfig(): {
  valid: boolean;
  missing: string[];
  mode: 'production' | 'simulation' | 'disabled';
} {
  const required = [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN', 
    'TWILIO_PHONE_NUMBER'
  ];

  const missing = required.filter(env => !process.env[env]);
  
  if (missing.length > 0) {
    return { valid: false, missing, mode: 'disabled' };
  }

  const hasPlaceholder = required.some(env => 
    process.env[env]?.includes('placeholder') || 
    process.env[env]?.includes('test') ||
    process.env[env]?.includes('example')
  );

  return {
    valid: true,
    missing: [],
    mode: hasPlaceholder ? 'simulation' : 'production'
  };
}