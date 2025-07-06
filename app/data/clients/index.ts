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
    id: 'hydro-quebec',
    name: 'Hydro-Québec',
    logo: '⚡',
    primaryColor: '#0066CC',
    secondaryColor: '#004499',
    emergencyContact: '1-800-790-2424',
    emergencyProtocol: 'Composez le 911 puis Hydro-Québec au 1-800-790-2424',
    requiredDocuments: ['electrical', 'environmental', 'safety-plan'],
    contactInfo: {
      emergency: '1-800-790-2424',
      supervisor: '1-800-HYDRO-QC',
      dispatch: '1-800-463-9999'
    }
  },
  {
    id: 'energir',
    name: 'Énergir',
    logo: '🔥',
    primaryColor: '#FF6600',
    secondaryColor: '#CC5500',
    emergencyContact: '1-800-361-8003',
    emergencyProtocol: 'Composez le 911 puis Énergir au 1-800-361-8003',
    requiredDocuments: ['gas', 'excavation', 'pipeline-clearance'],
    contactInfo: {
      emergency: '1-800-361-8003',
      supervisor: '1-800-ENERGIR',
      dispatch: '1-888-463-7447'
    }
  },
  {
    id: 'bell',
    name: 'Bell Canada',
    logo: '📡',
    primaryColor: '#7c3aed',
    secondaryColor: '#5b21b6',
    emergencyContact: '1-800-667-0123',
    emergencyProtocol: 'Composez le 911 puis Bell au 1-800-667-0123',
    requiredDocuments: ['telecom', 'rf-safety', 'tower-access'],
    contactInfo: {
      emergency: '1-800-667-0123',
      supervisor: '1-800-BELL-TSI',
      dispatch: '1-888-BELL-HELP'
    }
  },
  {
    id: 'rogers',
    name: 'Rogers',
    logo: '📱',
    primaryColor: '#dc2626',
    secondaryColor: '#991b1b',
    emergencyContact: '1-888-764-3771',
    emergencyProtocol: 'Composez le 911 puis Rogers au 1-888-764-3771',
    requiredDocuments: ['telecom', 'antenna-clearance', 'rf-compliance'],
    contactInfo: {
      emergency: '1-888-764-3771',
      supervisor: '1-800-ROGERS-1',
      dispatch: '1-888-ROGERS-1'
    }
  },
  {
    id: 'videotron',
    name: 'Vidéotron',
    logo: '📺',
    primaryColor: '#0066CC',
    secondaryColor: '#004499',
    emergencyContact: '1-888-433-6876',
    emergencyProtocol: 'Composez le 911 puis Vidéotron au 1-888-433-6876',
    requiredDocuments: ['telecom', 'cable-clearance'],
    contactInfo: {
      emergency: '1-888-433-6876',
      supervisor: '1-800-VIDEOTRON',
      dispatch: '1-888-VIDEOTRON'
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

export default clientsDatabase;
