// app/data/clients/template.ts
export interface ClientConfiguration {
  id: string;
  name: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  emergencyProtocol: {
    fr: string;
    en: string;
  };
  requiredDocuments: string[];
  customHazards: string[];
  contactInfo: {
    emergency: string;
    supervisor: string;
    dispatch: string;
  };
  workTypes: string[]; // Types de travaux autorisés
  logoUrl?: string; // URL du logo si disponible
  certifications: string[]; // Certifications requises
  specialProcedures?: {
    lockout: boolean;
    hotWork: boolean;
    confinedSpace: boolean;
    heightWork: boolean;
  };
}

// Template de base pour créer un nouveau client
export const clientTemplate: ClientConfiguration = {
  id: 'nouveau-client',
  name: 'Nouveau Client',
  logo: '🏢',
  primaryColor: '#6b7280',
  secondaryColor: '#9ca3af',
  emergencyProtocol: {
    fr: "URGENCE - Composez le 911 et contactez le superviseur",
    en: "EMERGENCY - Call 911 and contact supervisor"
  },
  requiredDocuments: ['general'],
  customHazards: [],
  contactInfo: {
    emergency: '911',
    supervisor: 'À définir',
    dispatch: 'À définir'
  },
  workTypes: ['maintenance', 'construction'],
  certifications: ['Formation SST de base'],
  specialProcedures: {
    lockout: true,
    hotWork: false,
    confinedSpace: false,
    heightWork: false
  }
};

// Fonction helper pour créer un nouveau client
export const createNewClient = (overrides: Partial<ClientConfiguration>): ClientConfiguration => {
  return {
    ...clientTemplate,
    ...overrides
  };
};
