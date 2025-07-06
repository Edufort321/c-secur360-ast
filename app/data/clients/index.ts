// app/data/clients/index.ts
import { ClientConfiguration, clientTemplate, createNewClient } from './template';
import { demoClient, demoStats } from './demo';

// Export des types
export type { ClientConfiguration };

// Export des configurations
export { clientTemplate, createNewClient, demoClient, demoStats };

// Registry de tous les clients disponibles
export const clientsRegistry: Record<string, ClientConfiguration> = {
  demo: demoClient,
  // Ajouter ici les nouveaux clients au fur et à mesure
  // 'hydro-quebec': hydroQuebecClient,
  // 'energir': energirClient,
  // etc.
};

// Fonction pour obtenir un client par ID
export const getClientById = (clientId: string): ClientConfiguration | null => {
  return clientsRegistry[clientId] || null;
};

// Fonction pour obtenir tous les clients
export const getAllClients = (): ClientConfiguration[] => {
  return Object.values(clientsRegistry);
};

// Fonction pour ajouter un nouveau client
export const addClient = (client: ClientConfiguration): void => {
  clientsRegistry[client.id] = client;
};

// Liste des clients disponibles (pour les dropdowns)
export const availableClients = Object.keys(clientsRegistry).map(id => ({
  id,
  name: clientsRegistry[id].name,
  logo: clientsRegistry[id].logo
}));

// Export par défaut
export default {
  registry: clientsRegistry,
  getById: getClientById,
  getAll: getAllClients,
  add: addClient,
  available: availableClients,
  template: clientTemplate,
  demo: demoClient
};
