import React from 'react';
import { Copy, Check, Wifi, WifiOff, Shield, Bell, CheckCircle } from 'lucide-react';

interface HeaderProps {
  tenant: string;
  t: any;
  astNumber: string;
  copied: boolean;
  onCopy: () => void;
  currentLanguage: 'fr' | 'en';
  onLanguageChange: (lang: 'fr' | 'en') => void;
  isOnline: boolean;
  getStatusBadge: (mobile?: boolean) => React.ReactNode;
  isMobile: boolean;
  userRole?: string;
  changeStatus: (status: any) => void;
  currentStep: number;
  steps: Array<{ id: number; titleKey: string }>;
}

const LanguageToggle: React.FC<{
  currentLanguage: 'fr' | 'en';
  onChange: (lang: 'fr' | 'en') => void;
}> = ({ currentLanguage, onChange }) => (
  <div className="flex bg-slate-800/80 rounded-md p-1 gap-1">
    {(['fr', 'en'] as const).map((lang) => (
      <button
        key={lang}
        onClick={() => onChange(lang)}
        className={`px-2 py-1 text-xs font-semibold rounded ${
          currentLanguage === lang ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white' : 'text-slate-400'
        }`}
      >
        {lang.toUpperCase()}
      </button>
    ))}
  </div>
);

const Header: React.FC<HeaderProps> = ({
  tenant,
  t,
  astNumber,
  copied,
  onCopy,
  currentLanguage,
  onLanguageChange,
  isOnline,
  getStatusBadge,
  isMobile,
  userRole,
  changeStatus,
  currentStep,
  steps,
}) => {
  const statusBadge = getStatusBadge(isMobile);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-blue-500/30 bg-gradient-to-r from-black via-slate-800 to-black backdrop-blur ${
        isMobile ? 'p-3' : 'p-6'
      }`}
    >
      <div className={`${isMobile ? 'flex-col gap-2' : 'max-w-screen-lg mx-auto'} w-full flex items-center justify-between`}> 
        <div className="flex items-center gap-2">
          <Shield size={isMobile ? 20 : 28} className="text-blue-500" />
          <div>
            <h1 className={`${isMobile ? 'text-base' : 'text-2xl'} font-bold text-white leading-tight`}>🛡️ {tenant}-Secur360</h1>
            {!isMobile && (
              <p className="text-sm text-yellow-400">
                {t.subtitle} • {tenant.toUpperCase()}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap justify-end">
          {!isMobile && <LanguageToggle currentLanguage={currentLanguage} onChange={onLanguageChange} />}

          <div className="flex items-center gap-1 bg-slate-900/80 border border-blue-500/40 rounded-md px-2 py-1 text-xs text-white">
            {astNumber}
            <button onClick={onCopy} className="ml-1 text-blue-400">
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>

          <div className="flex items-center gap-1 text-xs">
            {isOnline ? <Wifi size={14} className="text-green-500" /> : <WifiOff size={14} className="text-red-500" />}
            <span className={isOnline ? 'text-green-500' : 'text-red-500'}>{isOnline ? t.online : t.offline}</span>
          </div>

          {statusBadge}

          {userRole && (userRole === 'supervisor' || userRole === 'manager') && !isMobile && (
            <div className="flex gap-2">
              <button
                onClick={() => changeStatus('pending_verification')}
                disabled={false}
                className="btn-premium flex items-center gap-1 px-3 py-1 text-xs"
              >
                <Bell size={12} />
                {t.submit}
              </button>
              <button
                onClick={() => changeStatus('approved')}
                disabled={false}
                className="btn-premium flex items-center gap-1 px-3 py-1 text-xs bg-gradient-to-br from-green-500 to-green-600"
              >
                <CheckCircle size={12} />
                {t.approve}
              </button>
            </div>
          )}

          {isMobile && <LanguageToggle currentLanguage={currentLanguage} onChange={onLanguageChange} />}
        </div>
      </div>
    </header>
  );
};

export default Header;

