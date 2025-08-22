'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { 
  Bell, 
  Settings, 
  User, 
  Globe, 
  Moon, 
  Sun,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Shield
} from 'lucide-react';

interface UniversalHeaderProps {
  tenant?: string;
  user?: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  language: 'fr' | 'en';
  onLanguageChange: (lang: 'fr' | 'en') => void;
  isDark: boolean;
  onThemeToggle: () => void;
  notifications?: number;
  isAdmin?: boolean;
}

const UniversalHeader: React.FC<UniversalHeaderProps> = ({
  tenant,
  user,
  language,
  onLanguageChange,
  isDark,
  onThemeToggle,
  notifications = 0,
  isAdmin = false
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const translations = {
    fr: {
      dashboard: 'Tableau de bord',
      notifications: 'Notifications',
      settings: 'Paramètres',
      profile: 'Profil',
      logout: 'Déconnexion',
      admin: 'Administration',
      language: 'Langue',
      theme: 'Thème',
      darkMode: 'Mode sombre',
      lightMode: 'Mode clair'
    },
    en: {
      dashboard: 'Dashboard',
      notifications: 'Notifications',
      settings: 'Settings',
      profile: 'Profile',
      logout: 'Logout',
      admin: 'Administration',
      language: 'Language',
      theme: 'Theme',
      darkMode: 'Dark mode',
      lightMode: 'Light mode'
    }
  };

  const t = translations[language];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 ${
      isDark 
        ? 'bg-slate-900/95 border-slate-700' 
        : 'bg-white/95 border-slate-200'
    } backdrop-blur-lg border-b transition-colors duration-200 shadow-lg shadow-black/10`}>
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo et titre */}
          <div className="flex items-center space-x-4">
            <Link 
              href={tenant ? `/${tenant}/dashboard` : '/'}
              className="hover:opacity-80 transition-opacity"
            >
              <Logo 
                size="2xl" 
                variant="glow"
                showText={true}
              />
            </Link>
            {tenant && (
              <div className={`text-sm px-3 py-1 rounded-lg backdrop-blur-sm border shadow-md ${
                isDark 
                  ? 'bg-slate-800/60 text-slate-300 border-slate-600/30' 
                  : 'bg-white/80 text-slate-700 border-slate-300/30'
              }`}>
                {tenant.charAt(0).toUpperCase() + tenant.slice(1)}
              </div>
            )}
          </div>

          {/* Actions desktop */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Sélecteur de langue */}
            <div className="relative">
              <button
                onClick={() => onLanguageChange(language === 'fr' ? 'en' : 'fr')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors backdrop-blur-sm border shadow-md ${
                  isDark 
                    ? 'text-slate-300 hover:bg-slate-800 hover:text-white bg-slate-800/40 border-slate-600/30' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-white/60 border-slate-300/30'
                }`}
                title={t.language}
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">{language.toUpperCase()}</span>
              </button>
            </div>

            {/* Toggle thème */}
            <button
              onClick={onThemeToggle}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'text-slate-300 hover:bg-slate-800 hover:text-white' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title={isDark ? t.lightMode : t.darkMode}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <button
              className={`relative p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'text-slate-300 hover:bg-slate-800 hover:text-white' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title={t.notifications}
            >
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications > 9 ? '9+' : notifications}
                </span>
              )}
            </button>

            {/* Admin access */}
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-slate-300 hover:bg-slate-800 hover:text-white' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={t.admin}
              >
                <Shield className="w-4 h-4" />
                <span className="text-sm">{t.admin}</span>
              </Link>
            )}

            {/* Menu utilisateur */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isDark 
                      ? 'text-slate-300 hover:bg-slate-800 hover:text-white' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs opacity-75">{user.role}</p>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Dropdown menu utilisateur */}
                {isUserMenuOpen && (
                  <div className={`absolute right-0 mt-2 w-56 rounded-lg shadow-lg ${
                    isDark ? 'bg-slate-800' : 'bg-white'
                  } ring-1 ring-black ring-opacity-5 divide-y ${
                    isDark ? 'divide-slate-700' : 'divide-slate-100'
                  }`}>
                    <div className="px-4 py-3">
                      <p className={`text-sm font-medium ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        {user.name}
                      </p>
                      <p className={`text-sm ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {user.email}
                      </p>
                    </div>
                    <div className="py-1">
                      <button className={`flex items-center w-full px-4 py-2 text-sm ${
                        isDark 
                          ? 'text-slate-300 hover:bg-slate-700 hover:text-white' 
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}>
                        <User className="w-4 h-4 mr-3" />
                        {t.profile}
                      </button>
                      <button className={`flex items-center w-full px-4 py-2 text-sm ${
                        isDark 
                          ? 'text-slate-300 hover:bg-slate-700 hover:text-white' 
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}>
                        <Settings className="w-4 h-4 mr-3" />
                        {t.settings}
                      </button>
                    </div>
                    <div className="py-1">
                      <button className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <LogOut className="w-4 h-4 mr-3" />
                        {t.logout}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg ${
                isDark 
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className={`md:hidden py-4 border-t ${
            isDark ? 'border-slate-700' : 'border-slate-200'
          }`}>
            <div className="space-y-2">
              <button
                onClick={() => onLanguageChange(language === 'fr' ? 'en' : 'fr')}
                className={`flex items-center w-full px-3 py-2 rounded-lg text-left ${
                  isDark 
                    ? 'text-slate-300 hover:bg-slate-800 hover:text-white' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Globe className="w-5 h-5 mr-3" />
                {t.language} ({language.toUpperCase()})
              </button>
              
              <button
                onClick={onThemeToggle}
                className={`flex items-center w-full px-3 py-2 rounded-lg text-left ${
                  isDark 
                    ? 'text-slate-300 hover:bg-slate-800 hover:text-white' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {isDark ? <Sun className="w-5 h-5 mr-3" /> : <Moon className="w-5 h-5 mr-3" />}
                {isDark ? t.lightMode : t.darkMode}
              </button>

              <button
                className={`flex items-center w-full px-3 py-2 rounded-lg text-left ${
                  isDark 
                    ? 'text-slate-300 hover:bg-slate-800 hover:text-white' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Bell className="w-5 h-5 mr-3" />
                {t.notifications}
                {notifications > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications > 9 ? '9+' : notifications}
                  </span>
                )}
              </button>

              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className={`flex items-center w-full px-3 py-2 rounded-lg text-left ${
                    isDark 
                      ? 'text-slate-300 hover:bg-slate-800 hover:text-white' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Shield className="w-5 h-5 mr-3" />
                  {t.admin}
                </Link>
              )}

              {user && (
                <>
                  <div className={`px-3 py-2 border-t ${
                    isDark ? 'border-slate-700' : 'border-slate-200'
                  }`}>
                    <p className={`text-sm font-medium ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {user.name}
                    </p>
                    <p className={`text-sm ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {user.email}
                    </p>
                  </div>
                  
                  <button className={`flex items-center w-full px-3 py-2 rounded-lg text-left ${
                    isDark 
                      ? 'text-slate-300 hover:bg-slate-800 hover:text-white' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}>
                    <User className="w-5 h-5 mr-3" />
                    {t.profile}
                  </button>
                  
                  <button className={`flex items-center w-full px-3 py-2 rounded-lg text-left ${
                    isDark 
                      ? 'text-slate-300 hover:bg-slate-800 hover:text-white' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}>
                    <Settings className="w-5 h-5 mr-3" />
                    {t.settings}
                  </button>
                  
                  <button className="flex items-center w-full px-3 py-2 rounded-lg text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <LogOut className="w-5 h-5 mr-3" />
                    {t.logout}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default UniversalHeader;