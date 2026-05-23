'use client';

import { useState, useEffect } from 'react';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  QrCode, 
  Share, 
  X,
  Check,
  Copy
} from 'lucide-react';

interface PWAInstallerProps {
  clientName?: string;
  customDomain?: string;
}

export default function PWAInstaller({ clientName = 'demo', customDomain }: PWAInstallerProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeSVG, setQrCodeSVG] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const appUrl = customDomain ? `https://${customDomain}` : `https://csecur360.com/${clientName}`;

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Détecter l'installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Fallback pour navigateurs non-supportés
      if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
        alert('Pour installer l\'app sur iOS:\n1. Appuyez sur le bouton Partager\n2. Sélectionnez "Ajouter à l\'écran d\'accueil"');
      } else {
        alert('Installation PWA non disponible sur ce navigateur');
      }
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  const generateQRCode = async () => {
    try {
      const response = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: appUrl,
          clientName: clientName,
          size: 256
        })
      });

      const data = await response.json();
      if (data.success) {
        setQrCodeSVG(data.qrCode);
        setShowQRModal(true);
      }
    } catch (error) {
      console.error('Erreur génération QR:', error);
      alert('Erreur lors de la génération du code QR');
    }
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erreur copie URL:', error);
    }
  };

  const shareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'C-SECUR360 - Plateforme Sécurité',
          text: 'Accédez à votre portail sécurité personnalisé',
          url: appUrl
        });
      } catch (error) {
        console.error('Erreur partage:', error);
      }
    } else {
      copyUrl();
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {/* Bouton Installation PWA */}
      {isInstallable && !isInstalled && (
        <button
          onClick={handleInstall}
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 16px',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            animation: 'pulse 2s infinite'
          }}
          title="Installer l'application"
        >
          <Download size={18} />
          Installer App
        </button>
      )}

      {/* Indicateur App Installée */}
      {isInstalled && (
        <div style={{
          background: 'rgba(34, 197, 94, 0.9)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Check size={14} />
          App Installée
        </div>
      )}

      {/* Boutons Partage et QR */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={generateQRCode}
          style={{
            background: 'rgba(59, 130, 246, 0.9)',
            color: 'white',
            border: 'none',
            padding: '10px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Code QR"
        >
          <QrCode size={16} />
        </button>

        <button
          onClick={shareApp}
          style={{
            background: 'rgba(139, 92, 246, 0.9)',
            color: 'white',
            border: 'none',
            padding: '10px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Partager"
        >
          <Share size={16} />
        </button>
      </div>

      {/* Modal QR Code */}
      {showQRModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '16px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowQRModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ 
              margin: '0 0 16px 0', 
              color: '#1f2937',
              fontSize: '20px'
            }}>
              Code QR - Accès Mobile
            </h3>

            <p style={{ 
              margin: '0 0 24px 0', 
              color: '#6b7280',
              fontSize: '14px'
            }}>
              Scannez ce code avec votre téléphone pour accéder rapidement à votre portail
            </p>

            {qrCodeSVG && (
              <div 
                style={{ 
                  margin: '0 auto 24px auto',
                  display: 'inline-block'
                }}
                dangerouslySetInnerHTML={{ __html: qrCodeSVG }}
              />
            )}

            <div style={{
              background: '#f8fafc',
              padding: '12px',
              borderRadius: '8px',
              margin: '0 0 16px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: '#374151',
              wordBreak: 'break-all'
            }}>
              <span style={{ flex: 1 }}>{appUrl}</span>
              <button
                onClick={copyUrl}
                style={{
                  background: copied ? '#10b981' : '#6b7280',
                  color: 'white',
                  border: 'none',
                  padding: '4px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '12px' 
            }}>
              <div style={{
                padding: '12px',
                background: '#dbeafe',
                borderRadius: '8px',
                color: '#1e40af',
                fontSize: '12px'
              }}>
                <Smartphone size={16} style={{ margin: '0 auto 8px auto', display: 'block' }} />
                <div style={{ fontWeight: '600' }}>Mobile</div>
                <div>PWA Installable</div>
              </div>
              
              <div style={{
                padding: '12px',
                background: '#dcfce7',
                borderRadius: '8px',
                color: '#166534',
                fontSize: '12px'
              }}>
                <Monitor size={16} style={{ margin: '0 auto 8px auto', display: 'block' }} />
                <div style={{ fontWeight: '600' }}>Desktop</div>
                <div>Marque-page</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}