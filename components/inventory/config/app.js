// ============== CONFIGURATION APPLICATION ==============
// Configuration centralisée pour l'application

export const APP_CONFIG = {
  // URL de base de l'application (récupérée depuis les variables d'environnement)
  // En développement: http://localhost:3005
  // En production: https://votre-domaine.vercel.app
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : ''),

  // Configuration API (pour future intégration)
  API_URL: process.env.NEXT_PUBLIC_API_URL || '',

  // Autres configurations
  APP_NAME: 'C-Secur360 Inventaire',
  VERSION: '1.0.0'
};

// Fonction helper pour générer les URLs de scan
export const getScanUrl = (itemId, itemCode, departmentCode = null) => {
  const baseUrl = `${APP_CONFIG.APP_URL}/scan?id=${itemId}&code=${encodeURIComponent(itemCode)}`;
  // Si un code de département est fourni, l'ajouter pour identifier la succursale spécifique
  if (departmentCode) {
    return `${baseUrl}&dept=${encodeURIComponent(departmentCode)}`;
  }
  return baseUrl;
};

export default APP_CONFIG;
