import React from 'react';
import { Shield, Copy, Check } from 'lucide-react';

interface HeaderProps {
  isMobile: boolean;
  tenant: string;
  t: any;
  currentStep: number;
  steps: { id: number; titleKey: string; icon: React.ComponentType<any>; color: string; required: boolean }[];
  astNumber: string;
  onCopyAST: () => void;
  copied: boolean;
  currentLanguage: 'fr' | 'en';
  onLanguageChange: (lang: 'fr' | 'en') => void;
  getStatusBadge: () => JSX.Element;
}

const Header: React.FC<HeaderProps> = ({
  isMobile,
  tenant,
  t,
  currentStep,
  steps,
  astNumber,
  onCopyAST,
  copied,
  currentLanguage,
  onLanguageChange,
  getStatusBadge
}) => {
  const Title = (
    <>
      {tenant === 'demo' ? t.title : `🛡️ ${tenant.charAt(0).toUpperCase() + tenant.slice(1)}-Secur360`}
    </>
  );

  const LanguageSelector = (
    <div className="flex bg-slate-800/80 rounded-md p-1 gap-1">
      {['fr', 'en'].map((lng) => (
        <button
          key={lng}
          onClick={() => onLanguageChange(lng as 'fr' | 'en')}
          className={`px-2 py-1 rounded text-xs font-semibold ${currentLanguage === lng ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  );

  if (isMobile) {
    return (
      <header className="bg-gradient-to-br from-black/95 via-slate-800/95 to-black/95 backdrop-blur-xl p-4 sticky top-0 z-50 border-b border-blue-500/30">
        <div className="flex items-center justify-between mb-2">
          <img src="/c-secur360-logo.png" alt="C-Secur360" className="w-8 h-8" />
          <div className="flex-1 mx-3 min-w-0">
            <h1 className="text-white text-sm font-bold truncate">{Title}</h1>
            <div className="text-slate-400 text-[10px] truncate">AST #{astNumber.slice(-6)} • {tenant.toUpperCase()}</div>
          </div>
          {LanguageSelector}
        </div>
        <div className="flex items-center justify-between text-[10px] gap-2">
          <div className="flex items-center gap-1 bg-green-500/10 border border-green-500/30 px-2 py-0.5 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-500 font-semibold">{t.active}</span>
          </div>
          <div className="text-[10px]">{getStatusBadge()}</div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-gradient-to-br from-black/90 via-slate-800/90 to-black/90 backdrop-blur-xl border-b border-orange-300/30 shadow-lg px-5 py-6 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between flex-wrap gap-5">
        <div className="flex items-center gap-8">
          <img src="/c-secur360-logo.png" alt="C-Secur360" className="w-24 h-24" />
          <div>
            <h1 className="text-gradient text-4xl font-black leading-tight m-0">{Title}</h1>
            <p className="text-orange-300 text-xl font-semibold m-0">
              {t.subtitle} • {tenant.toUpperCase()}
            </p>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-500 text-base font-semibold">{t.systemOperational}</span>
              <p className="text-sm text-slate-400 m-0 font-medium">
                {t.astStep} {currentStep} {t.stepOf} {steps.length}
              </p>
              {getStatusBadge()}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {LanguageSelector}
          <div className="bg-slate-900/80 backdrop-blur-md border border-blue-500/30 rounded-xl px-4 py-3 flex items-center gap-2">
            <Shield size={16} className="text-blue-500" />
            <div>
              <div className="text-[10px] text-slate-400 mb-0.5">{t.astNumber}</div>
              <div className="text-sm font-semibold text-white font-mono flex items-center gap-1">
                {astNumber}
                <button onClick={onCopyAST} className="text-slate-400" aria-label="copy">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
