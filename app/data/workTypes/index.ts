// app/data/workTypes/index.ts
import { WorkType, workTypeTemplate, createNewWorkType } from './template';
import { electricalWorkTypes } from './electrical';
import { gasWorkTypes } from './gas';

// Export des types
export type { WorkType };

// Export des templates et helpers
export { workTypeTemplate, createNewWorkType };

// Registry de tous les types de travaux disponibles
export const workTypesRegistry: Record<string, WorkType> = {
  // Types électriques
  ...electricalWorkTypes,
  
  // Types gaziers
  ...gasWorkTypes,
  
  // Types de base (à ajouter dans les prochains fichiers)
  // ...constructionWorkTypes,
  // ...telecomWorkTypes,
  // ...maintenanceWorkTypes,
};

// Fonction pour obtenir un type de travail par ID
export const getWorkTypeById = (workTypeId: string): WorkType | null => {
  return workTypesRegistry[workTypeId] || null;
};

// Fonction pour obtenir tous les types de travaux
export const getAllWorkTypes = (): WorkType[] => {
  return Object.values(workTypesRegistry);
};

// Fonction pour obtenir les types par catégorie
export const getWorkTypesByCategory = (category: string): WorkType[] => {
  return Object.values(workTypesRegistry).filter(wt => wt.category === category);
};

// Fonction pour ajouter un nouveau type de travail
export const addWorkType = (workType: WorkType): void => {
  workTypesRegistry[workType.id] = workType;
};

// Liste des catégories disponibles
export const availableCategories = Array.from(
  new Set(Object.values(workTypesRegistry).map(wt => wt.category))
);

// Liste des types pour les dropdowns
export const availableWorkTypes = Object.keys(workTypesRegistry).map(id => ({
  id,
  name: workTypesRegistry[id].name,
  category: workTypesRegistry[id].category,
  icon: workTypesRegistry[id].icon
}));

// Fonction pour obtenir les dangers de base par type de travail
export const getBaseHazardsByWorkType = (workTypeId: string): string[] => {
  const workType = getWorkTypeById(workTypeId);
  return workType?.baseHazards || [];
};

// Fonction pour obtenir les équipements requis par type de travail
export const getRequiredEquipmentByWorkType = (workTypeId: string): string[] => {
  const workType = getWorkTypeById(workTypeId);
  return workType?.requiredEquipment || [];
};

// Export par défaut
export default {
  registry: workTypesRegistry,
  getById: getWorkTypeById,
  getAll: getAllWorkTypes,
  getByCategory: getWorkTypesByCategory,
  add: addWorkType,
  categories: availableCategories,
  available: availableWorkTypes,
  getBaseHazards: getBaseHazardsByWorkType,
  getRequiredEquipment: getRequiredEquipmentByWorkType,
  template: workTypeTemplate
};
