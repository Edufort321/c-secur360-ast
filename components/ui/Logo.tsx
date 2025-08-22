'use client';

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'glow' | 'minimal';
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'default', 
  className = '', 
  showText = true 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'h-8 w-auto';
      case 'md': return 'h-12 w-auto';
      case 'lg': return 'h-16 w-auto';
      case 'xl': return 'h-20 w-auto';
      default: return 'h-12 w-auto';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'glow': return 'logo-glow';
      case 'minimal': return 'opacity-90 hover:opacity-100 transition-opacity';
      default: return 'hover:scale-105 transition-transform duration-200';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm': return 'text-lg';
      case 'md': return 'text-xl';
      case 'lg': return 'text-2xl';
      case 'xl': return 'text-3xl';
      default: return 'text-xl';
    }
  };

  return (
    <>
      {/* Styles CSS pour l'effet glow */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .logo-glow {
            filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.6)) 
                    drop-shadow(0 0 16px rgba(139, 92, 246, 0.4));
            transition: filter 0.3s ease;
          }
          .logo-glow:hover {
            filter: drop-shadow(0 0 12px rgba(139, 92, 246, 0.8)) 
                    drop-shadow(0 0 24px rgba(139, 92, 246, 0.6));
          }
        `
      }} />

      <div className={`flex items-center gap-3 ${className}`}>
        <img 
          src="/c-secur360-logo.png" 
          alt="C-SECUR360"
          className={`${getSizeClasses()} ${getVariantClasses()}`}
        />
        {showText && (
          <div className="flex flex-col">
            <span className={`font-bold text-white ${getTextSize()}`}>
              C-SECUR360
            </span>
            {(size === 'lg' || size === 'xl') && (
              <span className="text-sm text-gray-300 -mt-1">
                Sécurité Industrielle
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Logo;