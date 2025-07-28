// =================== DÉTECTION MOBILE ET STYLES IDENTIQUES AU CODE ORIGINAL ===================
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

export const styles = {
  container: {
    maxWidth: '100%',
    margin: '0 auto',
    padding: isMobile ? '4px' : '24px',
    backgroundColor: '#111827',
    minHeight: '100vh',
    color: 'white',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    overflowX: 'hidden' as const
  },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: isMobile ? '8px' : '16px',
    padding: isMobile ? '12px' : '24px',
    border: '1px solid #374151',
    marginBottom: isMobile ? '12px' : '24px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    width: '100%',
    boxSizing: 'border-box' as const
  },
  input: {
    backgroundColor: '#374151',
    color: 'white',
    border: '1px solid #4b5563',
    borderRadius: isMobile ? '6px' : '8px',
    padding: isMobile ? '10px 12px' : '14px',
    width: '100%',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box' as const,
    WebkitAppearance: 'none' as const,
    MozAppearance: 'textfield' as const
  },
  button: {
    padding: isMobile ? '8px 12px' : '14px 24px',
    borderRadius: isMobile ? '6px' : '8px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '4px' : '8px',
    transition: 'all 0.2s ease',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    touchAction: 'manipulation' as const,
    minHeight: '44px',
    boxSizing: 'border-box' as const,
    width: '100%',
    justifyContent: 'center' as const
  },
  buttonPrimary: {
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
  },
  buttonSuccess: {
    background: 'linear-gradient(135deg, #059669, #047857)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
  },
  buttonDanger: {
    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
  },
  buttonSecondary: {
    backgroundColor: '#4b5563',
    color: 'white',
    border: '1px solid #6b7280'
  },
  tab: {
    padding: isMobile ? '10px 12px' : '12px 20px',
    borderRadius: '8px 8px 0 0',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '4px' : '8px',
    transition: 'all 0.2s ease',
    border: 'none',
    cursor: 'pointer',
    fontSize: isMobile ? '13px' : '14px',
    marginRight: isMobile ? '4px' : '8px',
    minWidth: isMobile ? '60px' : 'auto',
    textAlign: 'center' as const,
    touchAction: 'manipulation',
    whiteSpace: 'nowrap' as const
  },
  tabActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderBottom: '3px solid #60a5fa',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
  },
  tabInactive: {
    backgroundColor: '#374151',
    color: '#d1d5db',
    border: '1px solid #4b5563'
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: isMobile ? '8px' : '20px',
    width: '100%'
  },
  grid4: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
    gap: isMobile ? '8px' : '16px',
    width: '100%'
  },
  readingCard: {
    padding: isMobile ? '14px' : '18px',
    borderRadius: '12px',
    borderLeft: '4px solid',
    transition: 'all 0.2s ease'
  },
  readingSafe: {
    backgroundColor: 'rgba(5, 150, 105, 0.15)',
    borderLeftColor: '#10b981',
    border: '1px solid rgba(16, 185, 129, 0.3)'
  },
  readingWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderLeftColor: '#f59e0b',
    border: '1px solid rgba(245, 158, 11, 0.3)'
  },
  readingDanger: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderLeftColor: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.3)'
  },
  statusIndicator: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    marginRight: '8px',
    flexShrink: 0
  },
  statusSafe: {
    backgroundColor: '#10b981',
    boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)'
  },
  statusWarning: {
    backgroundColor: '#f59e0b',
    boxShadow: '0 0 8px rgba(245, 158, 11, 0.4)'
  },
  statusDanger: {
    backgroundColor: '#ef4444',
    animation: 'pulse 2s infinite',
    boxShadow: '0 0 12px rgba(239, 68, 68, 0.6)'
  },
  emergencyCard: {
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    border: '2px solid #ef4444',
    borderRadius: '16px',
    padding: isMobile ? '20px' : '28px',
    animation: 'pulse 2s infinite',
    boxShadow: '0 8px 32px rgba(220, 38, 38, 0.3)'
  },
  label: {
    display: 'block',
    color: '#9ca3af',
    fontSize: isMobile ? '13px' : '15px',
    fontWeight: '500',
    marginBottom: isMobile ? '4px' : '8px'
  },
  title: {
    fontSize: isMobile ? '20px' : '32px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: isMobile ? '4px' : '8px',
    lineHeight: 1.2
  },
  subtitle: {
    color: '#9ca3af',
    marginBottom: isMobile ? '8px' : '24px',
    fontSize: isMobile ? '12px' : '16px'
  },
  cardTitle: {
    fontSize: isMobile ? '16px' : '20px',
    fontWeight: '700',
    color: 'white',
    marginBottom: isMobile ? '12px' : '20px',
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '6px' : '12px'
  },
  mobileHeader: {
    position: 'sticky' as const,
    top: 0,
    backgroundColor: '#111827',
    zIndex: 100,
    paddingBottom: isMobile ? '8px' : '12px',
    borderBottom: '1px solid #374151',
    marginBottom: isMobile ? '8px' : '16px',
    width: '100%',
    boxSizing: 'border-box' as const
  },
  mobileButtonGrid: {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
    gap: isMobile ? '6px' : '16px',
    marginTop: isMobile ? '8px' : '16px',
    width: '100%'
  }
};

export { isMobile };
