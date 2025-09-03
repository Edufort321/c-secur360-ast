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
  logoSize = 'sm',
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
      flex justify-between items-center w-full min-h-[60px]
      ${isDark 
        ? 'bg-gradient-to-r from-slate-800/95 via-slate-800/95 to-slate-900/95 border-b border-white/10' 
        : 'bg-gradient-to-r from-white/95 via-gray-50/95 to-white/95 border-b border-gray-200/50'
      }
      px-4 py-2
      backdrop-blur-lg
      shadow-lg ${isDark ? 'shadow-black/20' : 'shadow-gray-500/10'}
      ${className}
    `}>
      <div className="flex items-center gap-3">
        {showLogo && (
          <Logo 
            size={logoSize}
            variant="glow"
            showText={true}
          />
        )}
        
        {(title || subtitle) && (
          <div className="flex flex-col">
            {title && (
              <h1 className="text-lg font-bold mb-0 relative">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400
                               bg-clip-text text-transparent font-bold">
                  {title}
                </span>
                <span className={`absolute inset-0 rounded-lg -z-10 px-1 py-0 backdrop-blur-sm shadow-lg
                               ${isDark 
                                 ? 'bg-slate-800/80 border border-white/10' 
                                 : 'bg-white/80 border border-gray-200/30'
                               }`}></span>
              </h1>
            )}
            {subtitle && (
              <p className={`text-xs rounded-md px-1 py-0 backdrop-blur-sm inline-block shadow-md
                          ${isDark 
                            ? 'text-slate-300 bg-slate-800/60 border border-white/10' 
                            : 'text-gray-600 bg-white/60 border border-gray-200/30'
                          }`}>
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