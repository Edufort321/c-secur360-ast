'use client';

// Point de montage du module Inventaire (lift-and-shift de l'app Vite), client-only (ssr:false).
// Les contextes Thème/Langue de l'inventaire sont SYNCHRONISÉS sur ceux de l'hôte (PortalHeader)
// → un seul toggle Jour/Nuit et FR/EN pour toute la plateforme.
import React, { useEffect } from 'react';
import App from './App';
import { ThemeProvider, useTheme as useInvTheme } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage as useInvLang } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { useTheme as useHostTheme } from '@/contexts/ThemeContext';
import { useLanguage as useHostLang } from '@/contexts/LanguageContext';

function SyncHostPrefs() {
  const host = useHostTheme();
  const hostLang = useHostLang();
  const inv = useInvTheme();
  const invLang = useInvLang();

  // Jour/Nuit : l'hôte pilote l'inventaire
  useEffect(() => {
    const dark = host?.theme === 'dark';
    if (inv && inv.isDarkMode !== dark && typeof inv.setTheme === 'function') inv.setTheme(dark);
  }, [host?.theme, inv?.isDarkMode]);

  // FR/EN : l'hôte pilote l'inventaire
  useEffect(() => {
    if (invLang && hostLang?.lang && invLang.language !== hostLang.lang && typeof invLang.setLanguage === 'function') {
      invLang.setLanguage(hostLang.lang);
    }
  }, [hostLang?.lang, invLang?.language]);

  return null;
}

export default function InventoryRoot() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <SyncHostPrefs />
          <div className="inventory-app">
            <App />
          </div>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
