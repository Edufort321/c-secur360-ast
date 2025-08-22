'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  hoverable?: boolean;
  interactive?: boolean;
  gradient?: boolean;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
}

// Composant Card principal
const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  rounded = 'lg',
  hoverable = false,
  interactive = false,
  gradient = false,
  children,
  className = '',
  ...props
}) => {
  const getVariantClasses = () => {
    const variants = {
      default: `
        bg-slate-800 border border-slate-700
        backdrop-blur-sm
      `,
      bordered: `
        bg-slate-800/80 border-2 border-slate-600
        backdrop-blur-md
      `,
      elevated: `
        bg-slate-800 border border-slate-700
        shadow-xl shadow-black/20
        backdrop-blur-sm
      `,
      flat: `
        bg-slate-800/50 border-0
        backdrop-blur-sm
      `
    };
    return variants[variant];
  };

  const getPaddingClasses = () => {
    const paddings = {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8'
    };
    return paddings[padding];
  };

  const getRoundedClasses = () => {
    const roundedOptions = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full'
    };
    return roundedOptions[rounded];
  };

  const hoverableClasses = hoverable ? `
    hover:shadow-lg hover:shadow-black/25
    hover:-translate-y-1 hover:border-primary/50
    transition-all duration-200 ease-out
  ` : '';

  const interactiveClasses = interactive ? `
    cursor-pointer select-none
    active:scale-[0.98] active:shadow-md
  ` : '';

  const gradientClasses = gradient ? `
    bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900
    border-gradient
  ` : '';

  return (
    <div
      className={`
        ${getVariantClasses()}
        ${getPaddingClasses()}
        ${getRoundedClasses()}
        ${hoverableClasses}
        ${interactiveClasses}
        ${gradientClasses}
        ${className}
        transition-all duration-200 ease-out
      `}
      {...props}
    >
      {children}
    </div>
  );
};

// Sous-composant CardHeader
const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  actions,
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`
        flex items-start justify-between gap-4
        pb-4 mb-4
        border-b border-slate-700
        ${className}
      `}
      {...props}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {Icon && (
          <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Icon size={20} className="text-primary" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          {title && (
            <h3 className="text-lg font-semibold text-white truncate">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-slate-400 mt-1">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
      {actions && (
        <div className="flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

// Sous-composant CardBody
const CardBody: React.FC<CardBodyProps> = ({
  padding = 'none',
  children,
  className = '',
  ...props
}) => {
  const getPaddingClasses = () => {
    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8'
    };
    return paddings[padding];
  };

  return (
    <div
      className={`
        ${getPaddingClasses()}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

// Sous-composant CardFooter
const CardFooter: React.FC<CardFooterProps> = ({
  justify = 'between',
  children,
  className = '',
  ...props
}) => {
  const getJustifyClasses = () => {
    const justifyOptions = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around'
    };
    return justifyOptions[justify];
  };

  return (
    <div
      className={`
        flex items-center gap-3
        pt-4 mt-4
        border-t border-slate-700
        ${getJustifyClasses()}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

// Type avec sous-composants
interface CardComponent extends React.FC<CardProps> {
  Header: typeof CardHeader;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
}

// Export avec sous-composants attachés
const CardWithSubComponents = Card as CardComponent;
CardWithSubComponents.Header = CardHeader;
CardWithSubComponents.Body = CardBody;
CardWithSubComponents.Footer = CardFooter;

export default CardWithSubComponents;