'use client';

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
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
      case '2xl': return 'h-24 w-auto';
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
      case '2xl': return 'text-4xl';
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
          src="/csecur360-logo-v2025.png" 
          alt="C-SECUR360 Logo"
          className={`${getSizeClasses()} ${getVariantClasses()}`}
          onError={(e) => {
            // Fallback si l'image ne charge pas
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            if (target.nextElementSibling) {
              (target.nextElementSibling as HTMLElement).style.display = 'block';
            }
          }}
        />
        {/* Fallback texte si l'image ne charge pas */}
        <div 
          className={`hidden items-center justify-center ${getSizeClasses()} ${getVariantClasses()}
                     bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-bold rounded-lg px-3`}
          style={{ display: 'none' }}
        >
          C360
        </div>
        
        {showText && (
          <div className="flex flex-col">
            <span className={`font-bold text-white ${getTextSize()}`}>
              C-SECUR360
            </span>
            {(size === 'lg' || size === 'xl' || size === '2xl') && (
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