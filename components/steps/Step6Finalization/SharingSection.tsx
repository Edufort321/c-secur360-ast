'use client';

import React from 'react';
import { Share2, Mail, Smartphone, MessageSquare, Users, Hash, Share, QrCode } from 'lucide-react';
import type { FinalizationData, ShareMethod, Translations } from '../Step6Finalization';

interface SharingSectionProps {
  finalizationData: FinalizationData;
  selectedShareMethod: ShareMethod;
  onSelectMethod: (method: ShareMethod) => void;
  onShare: () => void;
  t: Translations;
  language: 'fr' | 'en';
  isMobile: boolean;
}

const SharingSection: React.FC<SharingSectionProps> = ({
  finalizationData,
  selectedShareMethod,
  onSelectMethod,
  onShare,
  t,
  language,
  isMobile,
}) => (
  <div>
    <div className="ast-section">
      <h2 className="section-title">
        <Share2 size={24} />
        {t.sharing}
      </h2>

      <div style={{ marginBottom: isMobile ? '16px' : '20px' }}>
        <h3
          style={{
            color: '#d1d5db',
            fontSize: isMobile ? '14px' : '16px',
            marginBottom: isMobile ? '12px' : '16px',
          }}
        >
          {language === 'fr' ? 'Méthodes de partage:' : 'Sharing methods:'}
        </h3>

        <div
          style={{
            display: 'flex',
            gap: isMobile ? '8px' : '12px',
            marginBottom: isMobile ? '16px' : '20px',
            flexWrap: 'wrap',
          }}
        >
          {(['email', 'sms', 'whatsapp', 'teams', 'slack'] as ShareMethod[]).map((method) => (
            <button
              key={method}
              onClick={() => onSelectMethod(method)}
              className={`ast-button ${selectedShareMethod === method ? 'button-primary' : 'button-secondary'}`}
              style={{ flex: isMobile ? '1' : 'none', minWidth: isMobile ? '0' : '120px' }}
            >
              {method === 'email' && <Mail size={16} />}
              {method === 'sms' && <Smartphone size={16} />}
              {method === 'whatsapp' && <MessageSquare size={16} />}
              {method === 'teams' && <Users size={16} />}
              {method === 'slack' && <Hash size={16} />}
              {method.charAt(0).toUpperCase() + method.slice(1)}
            </button>
          ))}
        </div>

        <button onClick={onShare} className="ast-button button-success" style={{ width: '100%' }}>
          <Share size={20} />
          {language === 'fr' ? 'Partager via' : 'Share via'} {selectedShareMethod.charAt(0).toUpperCase() + selectedShareMethod.slice(1)}
        </button>
      </div>

      <div
        style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: isMobile ? '8px' : '12px',
          padding: isMobile ? '12px' : '16px',
        }}
      >
        <h4
          style={{
            margin: '0 0 8px 0',
            color: '#60a5fa',
            fontSize: isMobile ? '12px' : '14px',
            fontWeight: '700',
          }}
        >
          {t.shareInstructions}
        </h4>
        <ul
          style={{
            margin: 0,
            paddingLeft: '20px',
            color: '#94a3b8',
            fontSize: isMobile ? '11px' : '13px',
          }}
        >
          {t.shareList.map((item, index) => (
            <li key={index} style={{ marginBottom: '4px' }}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>

    {finalizationData.qrCodeUrl && (
      <div className="ast-section">
        <h2 className="section-title">
          <QrCode size={24} />
          {language === 'fr' ? '📱 Code QR - Accès Mobile AST' : '📱 QR Code - Mobile JSA Access'}
        </h2>

        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-block',
              padding: isMobile ? '15px' : '20px',
              backgroundColor: 'white',
              borderRadius: isMobile ? '12px' : '16px',
              marginBottom: isMobile ? '12px' : '16px',
              border: '3px solid #f59e0b',
              boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)',
            }}
          >
            <img
              src={finalizationData.qrCodeUrl}
              alt="QR Code AST"
              style={{
                width: isMobile ? '180px' : '220px',
                height: isMobile ? '180px' : '220px',
                display: 'block',
              }}
            />
          </div>
          <p
            style={{
              color: '#d1d5db',
              fontSize: isMobile ? '12px' : '14px',
              lineHeight: 1.5,
            }}
          >
            {language === 'fr'
              ? "📱 Scannez ce code QR pour accéder à l'AST depuis un appareil mobile"
              : '📱 Scan this QR code to access the JSA from a mobile device'}
          </p>
        </div>
      </div>
    )}
  </div>
);

export default SharingSection;
