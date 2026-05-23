'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import Image from 'next/image';
import { 
  Sun, Moon, Menu, X, Home, FileText, Users, Settings, Shield, 
  BarChart3, Bell, Search, ChevronDown, LogOut, User
} from 'lucide-react';

// Context pour le mode sombre
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {}
});

export const useTheme = () => useContext(ThemeContext);

interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  currentPage?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  showSidebar = true,
  currentPage = 'dashboard'
}) => {
  const [isDark, setIsDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Persistance du thème
  useEffect(() => {
    const savedTheme = localStorage.getItem('c-secur360-theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    } else {
      // Détecter préférence système
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('c-secur360-theme', isDark ? 'dark' : 'light');
    
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.className = 'bg-gray-900 text-white';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-gray-50 text-gray-900';
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const navigation = [
    { name: 'Tableau de Bord', href: '/dashboard', icon: Home, current: currentPage === 'dashboard' },
    { name: 'AST', href: '/ast', icon: FileText, current: currentPage === 'ast' },
    { name: 'Équipes', href: '/teams', icon: Users, current: currentPage === 'teams' },
    { name: 'Rapports', href: '/reports', icon: BarChart3, current: currentPage === 'reports' },
    { name: 'Conformité', href: '/compliance', icon: Shield, current: currentPage === 'compliance' },
    { name: 'Paramètres', href: '/settings', icon: Settings, current: currentPage === 'settings' },
  ];

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <div className={`min-h-screen flex ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        {/* Sidebar */}
        {showSidebar && (
          <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border-r flex-shrink-0`}>
            <div className="flex flex-col h-full">
              {/* Logo et titre */}
              <div className="flex items-center h-10 px-4 border-b border-gray-200 dark:border-gray-700">
                <Image
                  src="/logo.png"
                  alt="C-SECUR360"
                  width={28}
                  height={28}
                  className="flex-shrink-0"
                />
                {sidebarOpen && (
                  <div className="ml-3">
                    <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      C-SECUR360
                    </h1>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Sécurité au travail
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${
                        item.current
                          ? isDark 
                            ? 'bg-blue-900 text-blue-100' 
                            : 'bg-blue-100 text-blue-700'
                          : isDark
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${sidebarOpen ? 'mr-3' : 'mx-auto'} flex-shrink-0`} />
                      {sidebarOpen && item.name}
                    </a>
                  );
                })}
              </nav>

              {/* Collapse button */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={`w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isDark
                      ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
            <div className="flex items-center justify-between">
              {/* Left side */}
              <div className="flex items-center space-x-4">
                {!showSidebar && (
                  <div className="flex items-center space-x-3">
                    <Image
                      src="/c-secur360-logo.png"
                      alt="C-SECUR360"
                      width={32}
                      height={32}
                    />
                    <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      C-SECUR360
                    </h1>
                  </div>
                )}
                
                {/* Search */}
                <div className="hidden md:block">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="text"
                      placeholder="Rechercher AST, utilisateurs..."
                      className={`pl-10 pr-4 py-2 w-80 rounded-lg text-sm transition-colors ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500'
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500'
                      } border focus:ring-2 focus:outline-none`}
                    />
                  </div>
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-4">
                {/* Theme toggle */}
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark
                      ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  title={isDark ? 'Mode clair' : 'Mode sombre'}
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Notifications */}
                <button className={`p-2 rounded-lg transition-colors relative ${
                  isDark
                    ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}>
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                      isDark
                        ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Admin
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* User dropdown */}
                  {userMenuOpen && (
                    <div className={`absolute right-0 mt-2 w-56 rounded-lg shadow-lg z-50 ${
                      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } border`}>
                      <div className="py-1">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Administrateur
                          </p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            admin@c-secur360.com
                          </p>
                        </div>
                        
                        <a
                          href="/profile"
                          className={`flex items-center px-4 py-2 text-sm transition-colors ${
                            isDark
                              ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <User className="w-4 h-4 mr-3" />
                          Mon profil
                        </a>
                        
                        <a
                          href="/settings"
                          className={`flex items-center px-4 py-2 text-sm transition-colors ${
                            isDark
                              ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          Paramètres
                        </a>
                        
                        <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                          <button
                            className={`flex items-center w-full px-4 py-2 text-sm transition-colors ${
                              isDark
                                ? 'text-red-400 hover:bg-gray-700'
                                : 'text-red-600 hover:bg-gray-100'
                            }`}
                          >
                            <LogOut className="w-4 h-4 mr-3" />
                            Se déconnecter
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Main content area */}
          <main className={`flex-1 overflow-auto ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {children}
          </main>
        </div>
      </div>
    </ThemeContext.Provider>
  );
};

export default AppLayout;