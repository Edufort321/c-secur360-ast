// data/clients/index.ts
export interface Client {
  id: string;
  name: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  emergencyContact: string;
  emergencyProtocol: string;
  requiredDocuments: string[];
  contactInfo: {
    emergency: string;
    supervisor: string;
    dispatch: string;
  };
}

export const clientsDatabase: Client[] = [
  {
    id: 'electrique-abc',
    name: 'Électrique ABC',
    logo: '⚡',
    primaryColor: '#0066CC',
    secondaryColor: '#004499',
    emergencyContact: '1-800-123-4567',
    emergencyProtocol: 'Composez le 911 puis Électrique ABC au 1-800-123-4567',
    requiredDocuments: ['electrical', 'environmental', 'safety-plan'],
    contactInfo: {
      emergency: '1-800-123-4567',
      supervisor: '1-800-ABC-ELEC',
      dispatch: '1-800-463-9999'
    }
  },
  {
    id: 'gaz-xyz',
    name: 'Gaz XYZ',
    logo: '🔥',
    primaryColor: '#FF6600',
    secondaryColor: '#CC5500',
    emergencyContact: '1-800-361-8003',
    emergencyProtocol: 'Composez le 911 puis Gaz XYZ au 1-800-361-8003',
    requiredDocuments: ['gas', 'excavation', 'pipeline-clearance'],
    contactInfo: {
      emergency: '1-800-361-8003',
      supervisor: '1-800-XYZ-GAZ',
      dispatch: '1-888-463-7447'
    }
  },
  {
    id: 'telecom-def',
    name: 'Télécom DEF',
    logo: '📡',
    primaryColor: '#7c3aed',
    secondaryColor: '#5b21b6',
    emergencyContact: '1-800-667-0123',
    emergencyProtocol: 'Composez le 911 puis Télécom DEF au 1-800-667-0123',
    requiredDocuments: ['telecom', 'rf-safety', 'tower-access'],
    contactInfo: {
      emergency: '1-800-667-0123',
      supervisor: '1-800-DEF-TSI',
      dispatch: '1-888-DEF-HELP'
    }
  },
  {
    id: 'mobile-ghi',
    name: 'Mobile GHI',
    logo: '📱',
    primaryColor: '#dc2626',
    secondaryColor: '#991b1b',
    emergencyContact: '1-888-764-3771',
    emergencyProtocol: 'Composez le 911 puis Mobile GHI au 1-888-764-3771',
    requiredDocuments: ['telecom', 'antenna-clearance', 'rf-compliance'],
    contactInfo: {
      emergency: '1-888-764-3771',
      supervisor: '1-800-GHI-MOB',
      dispatch: '1-888-GHI-HELP'
    }
  },
  {
    id: 'cable-jkl',
    name: 'Câble JKL',
    logo: '📺',
    primaryColor: '#0066CC',
    secondaryColor: '#004499',
    emergencyContact: '1-888-433-6876',
    emergencyProtocol: 'Composez le 911 puis Câble JKL au 1-888-433-6876',
    requiredDocuments: ['telecom', 'cable-clearance'],
    contactInfo: {
      emergency: '1-888-433-6876',
      supervisor: '1-800-JKL-CABLE',
      dispatch: '1-888-JKL-HELP'
    }
  },
  {
    id: 'demo',
    name: 'Client Démo',
    logo: '🏢',
    primaryColor: '#6366f1',
    secondaryColor: '#4338ca',
    emergencyContact: '1-800-DEMO-911',
    emergencyProtocol: 'Composez le 911 puis votre superviseur',
    requiredDocuments: ['basic-safety'],
    contactInfo: {
      emergency: '1-800-DEMO-911',
      supervisor: '1-800-DEMO-SUP',
      dispatch: '1-800-DEMO-DIS'
    }
  }
];

// =================== EXPORTS ADDITIONNELS ===================

// Export pour compatibilité avec les imports existants
export const allClients = clientsDatabase;

// Fonctions utilitaires
export const getClientById = (id: string): Client | undefined => {
  return clientsDatabase.find(client => client.id === id);
};

export const getClientByName = (name: string): Client | undefined => {
  return clientsDatabase.find(client => 
    client.name.toLowerCase().includes(name.toLowerCase())
  );
};

export const getClientsForIndustry = (industry: string): Client[] => {
  const industryMapping: Record<string, string[]> = {
    'electrical': ['electrique-abc'],
    'gas': ['gaz-xyz'],
    'telecom': ['telecom-def', 'mobile-ghi', 'cable-jkl'],
    'demo': ['demo']
  };
  
  const clientIds = industryMapping[industry] || [];
  return clientsDatabase.filter(client => clientIds.includes(client.id));
};

export const getAllClientIds = (): string[] => {
  return clientsDatabase.map(client => client.id);
};

export const getAllClientNames = (): string[] => {
  return clientsDatabase.map(client => client.name);
};

// Export par défaut
export default clientsDatabase;
