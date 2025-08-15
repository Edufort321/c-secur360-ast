// styles.ts - Styles Unifiés pour ConfinedSpace Module
"use client";

// =================== DÉTECTION MOBILE RÉACTIVE ===================
const getIsMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

// Variable réactive pour mobile
export const isMobile = typeof window !== 'undefined' ? getIsMobile() : false;

// =================== TYPES POUR STYLES ===================
export interface StyleObject {
  [key: string]: string | number | object;
}

export interface ConfinedSpaceStyles {
  // Conteneurs de base
  container: StyleObject;
  card: StyleObject;
  emergencyCard: StyleObject;
  
  // NOUVEAUX STYLES POUR ENTRYREGISTRY
  statCard: StyleObject;
  personCard: StyleObject;
  personCardSurveillant: StyleObject;
  personCardEntrant: StyleObject;
  personCardInside: StyleObject;
  equipmentCard: StyleObject;
  equipmentAvailable: StyleObject;
  equipmentInUse: StyleObject;
  equipmentDanger: StyleObject;
  
  // Formulaires
  input: StyleObject;
  textarea: StyleObject;
  select: StyleObject;
  label: StyleObject;
  
  // Boutons
  button: StyleObject;
  buttonPrimary: StyleObject;
  buttonSuccess: StyleObject;
  buttonDanger: StyleObject;
  buttonSecondary: StyleObject;
  buttonWarning: StyleObject;
  buttonSmall: StyleObject;
  
  // Navigation
  tab: StyleObject;
  tabActive: StyleObject;
  tabInactive: StyleObject;
  
  // Layouts
  grid2: StyleObject;
  grid3: StyleObject;
  grid4: StyleObject;
  gridMobile: StyleObject;
  
  // Lectures atmosphériques
  readingCard: StyleObject;
  readingSafe: StyleObject;
  readingWarning: StyleObject;
  readingDanger: StyleObject;
  
  // Indicateurs de statut
  statusIndicator: StyleObject;
  statusSafe: StyleObject;
  statusWarning: StyleObject;
  statusDanger: StyleObject;
  
  // Typographie
  title: StyleObject;
  subtitle: StyleObject;
  cardTitle: StyleObject;
  sectionTitle: StyleObject;
  
  // Mobile spécifique
  mobileHeader: StyleObject;
  mobileButtonGrid: StyleObject;
  mobileTabContainer: StyleObject;
  
  // Validation et progression
  validationCard: StyleObject;
  progressBar: StyleObject;
  progressBarFill: StyleObject;
  
  // Alertes et notifications
  alertCard: StyleObject;
  alertInfo: StyleObject;
  alertWarning: StyleObject;
  alertDanger: StyleObject;
  
  // Photos et médias
  photoContainer: StyleObject;
  photoUploadArea: StyleObject;
  photoThumbnail: StyleObject;
}

// =================== STYLES PRINCIPAUX OPTIMISÉS ===================
export const styles: ConfinedSpaceStyles = {
  // ===== CONTENEURS DE BASE =====
  container: {
    maxWidth: '100%',
    margin: '0 auto',
    padding: isMobile ? '8px' : '24px',
    backgroundColor: '#111827',
    minHeight: '100vh',
    color: 'white',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    overflowX: 'hidden',
    position: 'relative'
  },

  card: {
    backgroundColor: '#1f2937',
    borderRadius: isMobile ? '12px' : '16px',
    padding: isMobile ? '16px' : '24px',
    border: '1px solid #374151',
    marginBottom: isMobile ? '16px' : '24px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease'
  },

  emergencyCard: {
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    border: '2px solid #ef4444',
    borderRadius: '16px',
    padding: isMobile ? '20px' : '28px',
    animation: 'pulse 2s infinite',
    boxShadow: '0 8px 32px rgba(220, 38, 38, 0.4)',
    position: 'relative'
  },

  // ===== NOUVEAUX STYLES POUR ENTRYREGISTRY =====
  statCard: {
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    borderRadius: '12px',
    padding: isMobile ? '16px' : '20px',
    border: '1px solid #4b5563',
    transition: 'all 0.2s ease',
    textAlign: 'center'
  },

  personCard: {
    padding: isMobile ? '14px' : '18px',
    borderRadius: '12px',
    borderLeft: '4px solid',
    transition: 'all 0.2s ease',
    marginBottom: '16px'
  },

  personCardSurveillant: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderLeftColor: '#3b82f6',
    border: '1px solid rgba(59, 130, 246, 0.3)'
  },

  personCardEntrant: {
    backgroundColor: 'rgba(107, 114, 128, 0.15)',
    borderLeftColor: '#6b7280',
    border: '1px solid rgba(107, 114, 128, 0.3)'
  },

  personCardInside: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderLeftColor: '#10b981',
    border: '1px solid rgba(16, 185, 129, 0.3)'
  },

  equipmentCard: {
    padding: isMobile ? '14px' : '18px',
    borderRadius: '12px',
    borderLeft: '4px solid',
    transition: 'all 0.2s ease',
    marginBottom: '16px'
  },

  equipmentAvailable: {
    backgroundColor: 'rgba(5, 150, 105, 0.15)',
    borderLeftColor: '#10b981',
    border: '1px solid rgba(16, 185, 129, 0.3)'
  },

  equipmentInUse: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderLeftColor: '#f59e0b',
    border: '1px solid rgba(245, 158, 11, 0.3)'
  },

  equipmentDanger: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderLeftColor: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.3)'
  },

  // ===== FORMULAIRES =====
  input: {
    backgroundColor: '#374151',
    color: 'white',
    border: '1px solid #4b5563',
    borderRadius: isMobile ? '8px' : '10px',
    padding: isMobile ? '12px 14px' : '16px',
    width: '100%',
    fontSize: isMobile ? '16px' : '16px',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    WebkitAppearance: 'none',
    MozAppearance: 'textfield',
    ':focus': {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
    }
  },

  textarea: {
    backgroundColor: '#374151',
    color: 'white',
    border: '1px solid #4b5563',
    borderRadius: isMobile ? '8px' : '10px',
    padding: isMobile ? '12px 14px' : '16px',
    width: '100%',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    resize: 'vertical',
    minHeight: isMobile ? '80px' : '100px'
  },

  select: {
    backgroundColor: '#374151',
    color: 'white',
    border: '1px solid #4b5563',
    borderRadius: isMobile ? '8px' : '10px',
    padding: isMobile ? '12px 14px' : '16px',
    width: '100%',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    cursor: 'pointer'
  },

  label: {
    display: 'block',
    color: '#d1d5db',
    fontSize: isMobile ? '14px' : '15px',
    fontWeight: '600',
    marginBottom: isMobile ? '6px' : '8px',
    lineHeight: 1.4
  },

  // ===== BOUTONS =====
  button: {
    padding: isMobile ? '12px 16px' : '16px 24px',
    borderRadius: isMobile ? '8px' : '10px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: isMobile ? '6px' : '8px',
    transition: 'all 0.2s ease',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    touchAction: 'manipulation',
    minHeight: '48px',
    boxSizing: 'border-box',
    width: '100%',
    outline: 'none'
  },

  buttonPrimary: {
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
    ':hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4)'
    }
  },

  buttonSuccess: {
    background: 'linear-gradient(135deg, #059669, #047857)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
    ':hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 6px 16px rgba(5, 150, 105, 0.4)'
    }
  },

  buttonDanger: {
    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
    ':hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 6px 16px rgba(220, 38, 38, 0.4)'
    }
  },

  buttonSecondary: {
    backgroundColor: '#4b5563',
    color: 'white',
    border: '1px solid #6b7280',
    ':hover': {
      backgroundColor: '#6b7280'
    }
  },

  buttonWarning: {
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
  },

  buttonSmall: {
    padding: isMobile ? '6px 10px' : '8px 12px',
    fontSize: isMobile ? '13px' : '14px',
    minHeight: 'auto',
    width: 'auto'
  },

  // ===== NAVIGATION =====
  tab: {
    padding: isMobile ? '12px 16px' : '14px 20px',
    borderRadius: '10px 10px 0 0',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '6px' : '8px',
    transition: 'all 0.2s ease',
    border: 'none',
    cursor: 'pointer',
    fontSize: isMobile ? '14px' : '15px',
    marginRight: isMobile ? '4px' : '8px',
    minWidth: isMobile ? '80px' : 'auto',
    textAlign: 'center',
    touchAction: 'manipulation',
    whiteSpace: 'nowrap'
  },

  tabActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderBottom: '3px solid #60a5fa',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
    zIndex: 1
  },

  tabInactive: {
    backgroundColor: '#374151',
    color: '#d1d5db',
    border: '1px solid #4b5563',
    ':hover': {
      backgroundColor: '#4b5563',
      color: 'white'
    }
  },

  // ===== LAYOUTS =====
  grid2: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: isMobile ? '12px' : '20px',
    width: '100%'
  },

  grid3: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
    gap: isMobile ? '12px' : '18px',
    width: '100%'
  },

  grid4: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
    gap: isMobile ? '10px' : '16px',
    width: '100%'
  },

  gridMobile: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: isMobile ? '12px' : '20px',
    width: '100%'
  },

  // ===== LECTURES ATMOSPHÉRIQUES =====
  readingCard: {
    padding: isMobile ? '16px' : '20px',
    borderRadius: '12px',
    borderLeft: '4px solid',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden'
  },

  readingSafe: {
    backgroundColor: 'rgba(5, 150, 105, 0.15)',
    borderLeftColor: '#10b981',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)'
  },

  readingWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderLeftColor: '#f59e0b',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.1)'
  },

  readingDanger: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderLeftColor: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.1)',
    animation: 'pulse 2s infinite'
  },

  // ===== INDICATEURS DE STATUT =====
  statusIndicator: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    marginRight: '10px',
    flexShrink: 0,
    transition: 'all 0.3s ease'
  },

  statusSafe: {
    backgroundColor: '#10b981',
    boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
  },

  statusWarning: {
    backgroundColor: '#f59e0b',
    boxShadow: '0 0 10px rgba(245, 158, 11, 0.5)'
  },

  statusDanger: {
    backgroundColor: '#ef4444',
    animation: 'pulse 1.5s infinite',
    boxShadow: '0 0 15px rgba(239, 68, 68, 0.7)'
  },

  // ===== TYPOGRAPHIE =====
  title: {
    fontSize: isMobile ? '24px' : '36px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: isMobile ? '8px' : '12px',
    lineHeight: 1.2
  },

  subtitle: {
    color: '#9ca3af',
    marginBottom: isMobile ? '12px' : '24px',
    fontSize: isMobile ? '14px' : '16px',
    lineHeight: 1.5
  },

  cardTitle: {
    fontSize: isMobile ? '18px' : '22px',
    fontWeight: '700',
    color: 'white',
    marginBottom: isMobile ? '16px' : '20px',
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '8px' : '12px'
  },

  sectionTitle: {
    fontSize: isMobile ? '16px' : '18px',
    fontWeight: '600',
    color: '#d1d5db',
    marginBottom: isMobile ? '12px' : '16px',
    borderBottom: '2px solid #374151',
    paddingBottom: '8px'
  },

  // ===== MOBILE SPÉCIFIQUE =====
  mobileHeader: {
    position: 'sticky',
    top: 0,
    backgroundColor: '#111827',
    zIndex: 100,
    paddingBottom: isMobile ? '12px' : '16px',
    borderBottom: '1px solid #374151',
    marginBottom: isMobile ? '12px' : '20px',
    width: '100%',
    boxSizing: 'border-box'
  },

  mobileButtonGrid: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
    gap: isMobile ? '8px' : '16px',
    marginTop: isMobile ? '12px' : '16px',
    width: '100%'
  },

  mobileTabContainer: {
    display: 'flex',
    overflowX: 'auto',
    paddingBottom: '8px',
    marginBottom: '16px',
    '::-webkit-scrollbar': {
      height: '4px'
    },
    '::-webkit-scrollbar-track': {
      background: '#374151'
    },
    '::-webkit-scrollbar-thumb': {
      background: '#6b7280',
      borderRadius: '2px'
    }
  },

  // ===== VALIDATION ET PROGRESSION =====
  validationCard: {
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '12px',
    padding: isMobile ? '16px' : '20px',
    marginBottom: '16px'
  },

  progressBar: {
    width: '100%',
    height: isMobile ? '8px' : '10px',
    backgroundColor: '#374151',
    borderRadius: '5px',
    overflow: 'hidden',
    marginBottom: '8px'
  },

  progressBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
    borderRadius: '5px',
    transition: 'width 0.5s ease',
    position: 'relative'
  },

  // ===== ALERTES ET NOTIFICATIONS =====
  alertCard: {
    padding: isMobile ? '14px' : '18px',
    borderRadius: '10px',
    marginBottom: '12px',
    border: '1px solid',
    position: 'relative'
  },

  alertInfo: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3b82f6',
    color: '#93c5fd'
  },

  alertWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: '#f59e0b',
    color: '#fbbf24'
  },

  alertDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#ef4444',
    color: '#fca5a5'
  },

  // ===== PHOTOS ET MÉDIAS =====
  photoContainer: {
    display: 'grid',
    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
    gap: isMobile ? '8px' : '12px',
    marginTop: '12px'
  },

  photoUploadArea: {
    border: '2px dashed #4b5563',
    borderRadius: '10px',
    padding: isMobile ? '20px' : '30px',
    textAlign: 'center',
    backgroundColor: '#374151',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    ':hover': {
      borderColor: '#3b82f6',
      backgroundColor: '#4b5563'
    }
  },

  photoThumbnail: {
    width: '100%',
    height: isMobile ? '80px' : '100px',
    objectFit: 'cover',
    borderRadius: '8px',
    border: '1px solid #4b5563'
  }
};

// =================== UTILITAIRES ET HELPERS ===================
export const getResponsiveValue = (mobileValue: any, desktopValue: any): any => {
  return isMobile ? mobileValue : desktopValue;
};

export const combineStyles = (...styleObjects: StyleObject[]): StyleObject => {
  return Object.assign({}, ...styleObjects);
};

// =================== ANIMATIONS CSS ===================
export const animations = `
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideIn {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }

  .fade-in {
    animation: fadeIn 0.3s ease-out;
  }

  .slide-in {
    animation: slideIn 0.3s ease-out;
  }
`;

// =================== EXPORT PAR DÉFAUT ===================
export default styles;
