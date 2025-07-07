// app/data/hazards/index.ts
// ⭐ IMPORT CORRIGÉ - Utilise les types depuis types/
import { Hazard } from '../../types/hazards';

// Imports de tous les dangers
import { biologicalHazards } from './biological';
import { chemicalHazards } from './chemical';
import { electricalHazards } from './electrical';
import { environmentalHazards } from './environmental';
import { ergonomicHazards } from './ergonomic';
import { gasHazards } from './gas';
import { mechanicalHazards } from './mechanical';
import { physicalHazards } from './physical';
import { workplaceHazards } from './workplace';

// =================== REGISTRY COMPLET DES DANGERS ===================
export const allHazards: Hazard[] = [
  ...biologicalHazards,
  ...chemicalHazards,
  ...electricalHazards,
  ...environmentalHazards,
  ...ergonomicHazards,
  ...gasHazards,
  ...mechanicalHazards,
  ...physicalHazards,
  ...workplaceHazards
];

// =================== REGISTRY PAR CATÉGORIE ===================
export const hazardsByCategory = {
  biological: biologicalHazards,
  chemical: chemicalHazards,
  electrical: electricalHazards,
  environmental: environmentalHazards,
  ergonomic: ergonomicHazards,
  gas: gasHazards,
  mechanical: mechanicalHazards,
  physical: physicalHazards,
  workplace: workplaceHazards
};

// =================== REGISTRY PAR ID ===================
export const hazardsById = allHazards.reduce((acc, hazard) => {
  acc[hazard.id] = hazard;
  return acc;
}, {} as Record<string, Hazard>);

// =================== FONCTIONS UTILITAIRES ===================
export const getHazardById = (id: string): Hazard | undefined => {
  return hazardsById[id];
};

export const getHazardsByCategory = (category: string): Hazard[] => {
  return allHazards.filter(hazard => hazard.category === category);
};

export const getHazardsByWorkType = (workTypeId: string): Hazard[] => {
  return allHazards.filter(hazard => 
    hazard.workTypes && hazard.workTypes.includes(workTypeId)
  );
};

export const getHazardsBySeverity = (severity: string): Hazard[] => {
  return allHazards.filter(hazard => hazard.severity === severity);
};

export const searchHazards = (query: string): Hazard[] => {
  const searchTerm = query.toLowerCase();
  return allHazards.filter(hazard => 
    hazard.name.toLowerCase().includes(searchTerm) ||
    hazard.description.toLowerCase().includes(searchTerm) ||
    hazard.category.toLowerCase().includes(searchTerm) ||
    hazard.subcategory?.toLowerCase().includes(searchTerm)
  );
};

// =================== STATISTIQUES ===================
export const getHazardStats = () => {
  const totalHazards = allHazards.length;
  const byCategory = Object.entries(hazardsByCategory).reduce((acc, [category, hazards]) => {
    acc[category] = hazards.length;
    return acc;
  }, {} as Record<string, number>);

  const activeCount = allHazards.filter(h => h.isActive).length;
  const inactiveCount = allHazards.filter(h => !h.isActive).length;

  return {
    total: totalHazards,
    active: activeCount,
    inactive: inactiveCount,
    byCategory,
    categories: Object.keys(hazardsByCategory)
  };
};

// =================== EXPORTS PAR DÉFAUT ===================
export default allHazards;

// Exports nommés pour compatibilité
export {
  biologicalHazards,
  chemicalHazards,
  electricalHazards,
  environmentalHazards,
  ergonomicHazards,
  gasHazards,
  mechanicalHazards,
  physicalHazards,
  workplaceHazards
};
