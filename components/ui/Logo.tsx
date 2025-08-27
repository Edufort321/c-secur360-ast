'use client';

import React from 'react';
import Image from 'next/image';

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
  const getSizeDimensions = () => {
    switch (size) {
      case 'sm': return { width: 100, height: 28 };
      case 'md': return { width: 120, height: 32 };
      case 'lg': return { width: 140, height: 40 };
      case 'xl': return { width: 160, height: 48 };
      case '2xl': return { width: 180, height: 56 };
      default: return { width: 120, height: 32 };
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
      case 'sm': return 'text-sm';
      case 'md': return 'text-base';
      case 'lg': return 'text-lg';
      case 'xl': return 'text-xl';
      case '2xl': return 'text-2xl';
      default: return 'text-base';
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
        <Image 
          src="/logo.png" 
          alt="C-SECUR360"
          width={getSizeDimensions().width}
          height={getSizeDimensions().height}
          priority
          className={getVariantClasses()}
          sizes="(max-width: 768px) 140px, 160px"
        />
        
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