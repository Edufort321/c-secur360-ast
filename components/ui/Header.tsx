'use client';

import React from 'react';
import Logo from './Logo';

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
  logoSize = 'md',
  actions,
  className = ''
}) => {
  return (
    <div className={`
      flex justify-between items-center w-full
      bg-gradient-to-r from-slate-800/95 via-slate-800/95 to-slate-900/95
      border-b border-white/10
      px-4 py-2
      backdrop-blur-lg
      shadow-lg shadow-black/20
      ${className}
    `}>
      <div className="flex items-center gap-4">
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
              <h1 className="text-xl font-bold mb-1 relative">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400
                               bg-clip-text text-transparent font-bold">
                  {title}
                </span>
                <span className="absolute inset-0 bg-slate-800/80 rounded-lg -z-10 px-2 py-0.5
                               backdrop-blur-sm border border-white/10 shadow-lg"></span>
              </h1>
            )}
            {subtitle && (
              <p className="text-slate-300 text-sm bg-slate-800/60 rounded-md px-2 py-0.5
                          backdrop-blur-sm border border-white/10 inline-block shadow-md">
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