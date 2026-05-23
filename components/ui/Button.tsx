'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  rounded?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  rounded = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const getVariantClasses = () => {
    const variants = {
      primary: `
        bg-gradient-to-r from-primary to-primary-dark 
        text-white border-transparent
        hover:from-primary-dark hover:to-primary
        hover:shadow-lg hover:-translate-y-0.5
        focus:ring-2 focus:ring-primary focus:ring-opacity-50
        active:from-primary-dark active:to-primary-dark
      `,
      secondary: `
        bg-slate-700 text-white border-slate-600
        hover:bg-slate-600 hover:border-slate-500
        hover:shadow-md hover:-translate-y-0.5
        focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50
      `,
      success: `
        bg-gradient-to-r from-success to-success-dark
        text-white border-transparent
        hover:from-success-dark hover:to-success
        hover:shadow-lg hover:-translate-y-0.5
        focus:ring-2 focus:ring-success focus:ring-opacity-50
      `,
      warning: `
        bg-gradient-to-r from-warning to-warning-dark
        text-white border-transparent
        hover:from-warning-dark hover:to-warning
        hover:shadow-lg hover:-translate-y-0.5
        focus:ring-2 focus:ring-warning focus:ring-opacity-50
      `,
      danger: `
        bg-gradient-to-r from-danger to-danger-dark
        text-white border-transparent
        hover:from-danger-dark hover:to-danger
        hover:shadow-lg hover:-translate-y-0.5
        focus:ring-2 focus:ring-danger focus:ring-opacity-50
      `,
      info: `
        bg-gradient-to-r from-info to-info-dark
        text-white border-transparent
        hover:from-info-dark hover:to-info
        hover:shadow-lg hover:-translate-y-0.5
        focus:ring-2 focus:ring-info focus:ring-opacity-50
      `,
      outline: `
        bg-transparent text-primary border-primary
        hover:bg-primary hover:text-white
        hover:shadow-md hover:-translate-y-0.5
        focus:ring-2 focus:ring-primary focus:ring-opacity-50
      `,
      ghost: `
        bg-transparent text-slate-300 border-transparent
        hover:bg-slate-700 hover:text-white
        hover:shadow-sm
        focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50
      `
    };
    return variants[variant];
  };

  const getSizeClasses = () => {
    const sizes = {
      xs: 'px-2 py-1 text-xs font-medium',
      sm: 'px-3 py-1.5 text-sm font-medium',
      md: 'px-4 py-2 text-sm font-medium',
      lg: 'px-6 py-3 text-base font-semibold',
      xl: 'px-8 py-4 text-lg font-semibold'
    };
    return sizes[size];
  };

  const getIconSize = () => {
    const iconSizes = {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24
    };
    return iconSizes[size];
  };

  const baseClasses = `
    inline-flex items-center justify-center
    border font-medium
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-offset-2 focus:ring-offset-slate-900
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    disabled:hover:shadow-none disabled:hover:translate-y-0
  `;

  const roundedClass = rounded ? 'rounded-full' : 'rounded-lg';
  const widthClass = fullWidth ? 'w-full' : '';
  const gapClass = children && Icon ? 'gap-2' : '';

  return (
    <button
      className={`
        ${baseClasses} 
        ${getVariantClasses()} 
        ${getSizeClasses()} 
        ${roundedClass} 
        ${widthClass} 
        ${gapClass} 
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {Icon && !loading && iconPosition === 'left' && (
        <Icon size={getIconSize()} />
      )}

      {children}

      {Icon && !loading && iconPosition === 'right' && (
        <Icon size={getIconSize()} />
      )}
    </button>
  );
};

export default Button;