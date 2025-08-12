export interface ConfinedSpaceDetails {
  // Informations principales
  projectNumber: string;
  workLocation: string;
  contractor: string;
  supervisor: string;
  entryDate: string;
  duration: string;
  workerCount: number;
  workDescription: string;

  // Identification de l'espace
  spaceType: string;
  csaClass: string;
  entryMethod: string;
  accessType: string;
  spaceLocation: string;
  spaceDescription: string;

  // Dimensions avec forme
  dimensions: {
    length: number;
    width: number;
    height: number;
    diameter: number;
    volume: number;
    spaceShape: 'rectangular' | 'cylindrical' | 'spherical' | 'irregular';
  };
  unitSystem: 'metric' | 'imperial';

  // Points d'entrée
  entryPoints: Array<{
    id: string;
    type: string;
    dimensions: string;
    location: string;
    condition: string;
    accessibility: string;
    photos: string[];
  }>;

  // Dangers
  atmosphericHazards: string[];
  physicalHazards: string[];

  // Conditions environnementales
  environmentalConditions: {
    ventilationRequired: boolean;
    ventilationType: string;
    lightingConditions: string;
    temperatureRange: string;
    moistureLevel: string;
    noiseLevel: string;
    weatherConditions: string;
  };

  // Contenu de l'espace
  spaceContent: {
    contents: string;
    residues: string;
    previousUse: string;
    lastEntry: string;
    cleaningStatus: string;
  };

  // Mesures de sécurité
  safetyMeasures: {
    emergencyEgress: string;
    communicationMethod: string;
    monitoringEquipment: string[];
    ventilationEquipment: string[];
    emergencyEquipment: string[];
  };

  // Photos de l'espace
  spacePhotos: Array<{
    id: string;
    url: string;
    category: string;
    caption: string;
    timestamp: string;
    location: string;
    measurements?: string;
    gpsCoords?: { lat: number; lng: number };
  }>;
}
