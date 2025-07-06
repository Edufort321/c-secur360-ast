// app/data/clients/demo.ts
import { ClientConfiguration } from './template';

export const demoClient: ClientConfiguration = {
  id: 'demo',
  name: 'Client Démo C-Secur360',
  logo: '🎯',
  primaryColor: '#3b82f6',
  secondaryColor: '#1d4ed8',
  emergencyProtocol: {
    fr: "DÉMO - En situation réelle: Composez le 911 et contactez votre superviseur",
    en: "DEMO - In real situation: Call 911 and contact your supervisor"
  },
  requiredDocuments: [
    'formation-sst',
    'permis-travail',
    'analyse-risque'
  ],
  customHazards: [
    'electrical_shock',
    'arc_flash',
    'falls',
    'struck_by_objects',
    'gas_leak'
  ],
  contactInfo: {
    emergency: '911 (Urgence)',
    supervisor: 'Superviseur Démo',
    dispatch: 'Dispatch Centre Démo'
  },
  workTypes: [
    'electrical',
    'gas',
    'construction',
    'telecom',
    'maintenance',
    'height-work',
    'confined-space',
    'hot-work'
  ],
  logoUrl: '/logos/demo-client.png',
  certifications: [
    'Formation SST générale',
    'SIMDUT 2015',
    'Travail en hauteur',
    'Espaces confinés',
    'Cadenassage (LOTO)',
    'Premiers secours'
  ],
  specialProcedures: {
    lockout: true,
    hotWork: true,
    confinedSpace: true,
    heightWork: true
  }
};

// Données simulées pour la démo
export const demoStats = {
  totalAST: 347,
  astThisMonth: 28,
  astCompleted: 325,
  incidents: 2,
  nearMiss: 8,
  safetyRate: 99.8,
  lastUpdate: new Date().toISOString()
};
