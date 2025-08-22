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
  logoSize = 'xl',
  actions,
  className = ''
}) => {
  return (
    <div className={`
      flex justify-between items-center w-full
      bg-gradient-to-r from-slate-800 via-slate-800 to-slate-900
      border-b border-slate-700
      px-6 py-4
      ${className}
    `}>
      <div className="flex items-center gap-8">
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
              <h1 className="text-3xl font-bold text-white mb-1
                bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400
                bg-clip-text text-transparent
              ">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-slate-400 text-lg">
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