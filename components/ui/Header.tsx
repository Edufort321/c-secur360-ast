'use client';

import React from 'react';
import Logo from './Logo';
import { useTheme } from '../layout/UniversalLayout';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  logoSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  actions?: React.ReactNode;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showLogo = true,
  logoSize, // On va l'ignorer et utiliser la logique responsive
  actions,
  className = ''
}) => {
  // Utiliser le thème pour adapter les couleurs avec fallback
  let isDark = false;
  try {
    const theme = useTheme();
    isDark = theme?.isDark || false;
  } catch (e) {
    // Fallback si le hook n'est pas disponible
    isDark = false;
  }
  return (
    <div className={`
      flex justify-between items-center w-full
      /* Reduced height: Mobile 28px, Desktop 32px */
      min-h-[28px] md:min-h-[32px]
      /* Navy dark theme as original - always dark */
      bg-gradient-to-r from-slate-800/95 via-slate-800/95 to-slate-900/95 border-b border-white/10
      /* Compact padding for reduced height */
      px-4 py-1 md:px-6 md:py-1.5
      backdrop-blur-lg
      shadow-lg shadow-black/20
      ${className}
    `}>
      <div className="flex items-center gap-3 md:gap-4">
        {showLogo && (
          <div className="responsive-logo">
            {/* Logo 2025 standards: 2 tailles optimales */}
            <div className="block md:hidden">
              <Logo size="sm" variant="glow" showText={true} />
            </div>
            <div className="hidden md:block">
              <Logo size="md" variant="glow" showText={true} />
            </div>
          </div>
        )}
        
        {(title || subtitle) && (
          <div className="flex flex-col">
            {title && (
              <h1 className="text-sm md:text-base font-bold mb-0 relative">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400
                               bg-clip-text text-transparent font-bold">
                  {title}
                </span>
                <span className="absolute inset-0 rounded-lg -z-10 px-1 py-0 backdrop-blur-sm shadow-lg bg-slate-800/80 border border-white/10"></span>
              </h1>
            )}
            {subtitle && (
              <p className="text-xs md:text-sm rounded-md px-1 py-0 backdrop-blur-sm inline-block shadow-md text-slate-300 bg-slate-800/60 border border-white/10">
                {subtitle}
              </p>
            )}
          </div>
        )}
      </div>
      
      {actions && (
        <div className="flex items-center gap-4">
          {actions}
        </div>
      )}
    </div>
  );
};

export default Header;