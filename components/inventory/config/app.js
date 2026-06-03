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

// Fonction helper pour générer les URLs de scan.
// Pointe vers la page inventaire du tenant (/<tenant>/inventory?id=...), qui rend la fiche produit
// en lecture seule (ScanPage) quand l'URL contient ?id=. Une caméra/stand ouvre donc la fiche ;
// dans l'app, on utilise le scanner intégré pour faire des mouvements.
export const getScanUrl = (itemId, itemCode, departmentCode = null) => {
  const origin = APP_CONFIG.APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  let tenant = 'cerdia';
  if (typeof window !== 'undefined') {
    const seg = window.location.pathname.split('/').filter(Boolean);
    if (seg.length) tenant = seg[0];
  }
  let url = `${origin}/${tenant}/inventory?id=${encodeURIComponent(itemId)}&code=${encodeURIComponent(itemCode || '')}`;
  if (departmentCode) url += `&dept=${encodeURIComponent(departmentCode)}`;
  return url;
};

export default APP_CONFIG;
