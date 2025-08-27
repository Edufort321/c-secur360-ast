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
        {/* Logo SVG intégré - toujours fiable */}
        <div className={`${getSizeClasses()} ${getVariantClasses()} flex items-center justify-center`}>
          <svg 
            viewBox="0 0 200 200" 
            className={`${getSizeClasses()}`}
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Cercle principal avec gradient */}
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor:'#3b82f6', stopOpacity:1}} />
                <stop offset="50%" style={{stopColor:'#8b5cf6', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:'#10b981', stopOpacity:1}} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/> 
                </feMerge>
              </filter>
            </defs>
            
            {/* Fond circulaire */}
            <circle cx="100" cy="100" r="95" fill="url(#logoGradient)" filter="url(#glow)" />
            
            {/* Lettre C */}
            <path d="M 140 60 A 40 40 0 1 0 140 140" stroke="white" strokeWidth="12" fill="none" strokeLinecap="round"/>
            
            {/* Chiffre 360 */}
            <text x="100" y="160" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold" fontFamily="Arial, sans-serif">
              360
            </text>
            
            {/* Point de sécurité */}
            <circle cx="160" cy="100" r="8" fill="#fbbf24" />
          </svg>
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