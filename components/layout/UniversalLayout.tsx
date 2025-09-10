'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import UniversalHeader from './UniversalHeader';

// Context pour le thème global
interface ThemeContextType {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  language: 'fr' | 'en';
  setLanguage: (lang: 'fr' | 'en') => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  setIsDark: () => {},
  language: 'fr',
  setLanguage: () => {}
});

export const useTheme = () => useContext(ThemeContext);

interface UniversalLayoutProps {
  children: React.ReactNode;
  tenant?: string;
  user?: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  notifications?: number;
  isAdmin?: boolean;
  showHeader?: boolean;
  sidebar?: React.ReactNode;
  className?: string;
}

const UniversalLayout: React.FC<UniversalLayoutProps> = ({
  children,
  tenant,
  user,
  notifications = 0,
  isAdmin = false,
  showHeader = true,
  sidebar,
  className = ''
}) => {
  const [isDark, setIsDarkState] = useState(false);
  const [language, setLanguageState] = useState<'fr' | 'en'>('fr');

  // Chargement des préférences depuis localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('c-secur360-theme');
      const savedLanguage = localStorage.getItem('c-secur360-language');
      
      if (savedTheme) {
        setIsDarkState(savedTheme === 'dark');
      } else {
        // Détection automatique du thème système
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkState(prefersDark);
      }
      
      if (savedLanguage && (savedLanguage === 'fr' || savedLanguage === 'en')) {
        setLanguageState(savedLanguage as 'fr' | 'en');
      } else {
        // Détection automatique de la langue du navigateur
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith('fr')) {
          setLanguageState('fr');
        } else {
          setLanguageState('en');
        }
      }
    }
  }, []);

  // Application du thème sur le document
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.body.style.backgroundColor = '#0f172a';
        document.body.style.color = '#e2e8f0';
      } else {
        document.documentElement.classList.remove('dark');
        document.body.style.backgroundColor = '#ffffff';
        document.body.style.color = '#1e293b';
      }
      localStorage.setItem('c-secur360-theme', isDark ? 'dark' : 'light');
    }
  }, [isDark]);

  // Sauvegarde de la langue
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('c-secur360-language', language);
    }
  }, [language]);

  const setIsDark = (newIsDark: boolean) => {
    setIsDarkState(newIsDark);
  };

  const setLanguage = (newLanguage: 'fr' | 'en') => {
    setLanguageState(newLanguage);
  };

  const handleThemeToggle = () => {
    setIsDark(!isDark);
  };

  const handleLanguageChange = (lang: 'fr' | 'en') => {
    setLanguage(lang);
  };

  const themeContextValue: ThemeContextType = {
    isDark,
    setIsDark,
    language,
    setLanguage
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <div className={`min-h-screen transition-colors duration-200 ${
        isDark 
          ? 'bg-slate-900 text-slate-100' 
          : 'bg-gray-50 text-slate-900'
      }`}>
        
        {/* Header universel */}
        {showHeader && (
          <UniversalHeader
            tenant={tenant}
            user={user}
            language={language}
            onLanguageChange={handleLanguageChange}
            isDark={isDark}
            onThemeToggle={handleThemeToggle}
            notifications={notifications}
            isAdmin={isAdmin}
          />
        )}

        {/* Layout principal */}
        <div className={`${showHeader ? 'pt-24 md:pt-28' : ''} flex min-h-screen`}>
          
          {/* Sidebar (optionnelle) */}
          {sidebar && (
            <div className={`hidden lg:flex lg:flex-shrink-0 lg:w-64 ${
              isDark ? 'bg-slate-800' : 'bg-white'
            } border-r ${
              isDark ? 'border-slate-700' : 'border-slate-200'
            } transition-colors duration-200`}>
              <div className="flex-1 flex flex-col overflow-y-auto">
                {sidebar}
              </div>
            </div>
          )}

          {/* Contenu principal */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <main className={`flex-1 overflow-y-auto ${className}`}>
              {children}
            </main>
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  );
};

export default UniversalLayout;