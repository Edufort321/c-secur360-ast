// ============== CONTEXTE THÈME DU PLANIFICATEUR ==============
// Le planner SUIT désormais le thème GLOBAL de l'app (un seul bouton Jour/Nuit
// dans le PortalHeader pilote tout). Avant, ce contexte avait sa propre détection
// « thème système » → sur un OS en mode sombre (fréquent sur mobile), il forçait
// `theme-nuit` indépendamment du bouton du header : impossible d'avoir le mode jour.
//
// Source de vérité = la classe `.dark` posée sur <html> par `contexts/ThemeContext.tsx`
// (clé localStorage `cs-theme`). On l'observe en direct et on applique
// `theme-nuit`/`theme-jour` sur le conteneur `.planner-app`.

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

const GLOBAL_KEY = 'cs-theme'; // clé du thème global (contexts/ThemeContext.tsx)

// Lit l'état sombre depuis le thème global (classe .dark sur <html>, repli localStorage).
function readGlobalDark() {
    if (typeof document === 'undefined') return false;
    if (document.documentElement.classList.contains('dark')) return true;
    try {
        return localStorage.getItem(GLOBAL_KEY) === 'dark';
    } catch {
        return false;
    }
}

export function ThemeProvider({ children }) {
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Préférences d'accessibilité (indépendantes du thème jour/nuit)
    const [userPreferences, setUserPreferences] = useState({
        reducedMotion: false,
        highContrast: false,
        compactMode: false
    });

    // Suit le thème global : lecture initiale + observation en direct de la classe .dark
    useEffect(() => {
        setIsDarkMode(readGlobalDark());

        const obs = new MutationObserver(() => setIsDarkMode(readGlobalDark()));
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        // Synchronisation inter-onglets (storage events) sur la clé globale
        const onStorage = (e) => { if (!e || e.key === GLOBAL_KEY) setIsDarkMode(readGlobalDark()); };
        window.addEventListener('storage', onStorage);

        // Préférences d'accessibilité persistées
        try {
            const saved = localStorage.getItem('c-secur360-theme-preferences');
            if (saved) setUserPreferences(prev => ({ ...prev, ...JSON.parse(saved) }));
        } catch { /* valeur corrompue, garder les défauts */ }

        return () => { obs.disconnect(); window.removeEventListener('storage', onStorage); };
    }, []);

    // Application au conteneur .planner-app uniquement (pas au <html> global)
    useEffect(() => {
        const root = document.querySelector('.planner-app') || document.documentElement;
        root.classList.toggle('theme-nuit', isDarkMode);
        root.classList.toggle('theme-jour', !isDarkMode);
        root.classList.toggle('reduced-motion', !!userPreferences.reducedMotion);
        root.classList.toggle('high-contrast', !!userPreferences.highContrast);
        root.classList.toggle('compact-mode', !!userPreferences.compactMode);
    }, [isDarkMode, userPreferences]);

    // Sauvegarde des préférences d'accessibilité
    useEffect(() => {
        try {
            localStorage.setItem('c-secur360-theme-preferences', JSON.stringify(userPreferences));
        } catch { /* ignore */ }
    }, [userPreferences]);

    // Bascule = pilote le thème GLOBAL (cohérent avec le bouton Jour/Nuit du header).
    const applyGlobal = useCallback((dark) => {
        try {
            const r = document.documentElement;
            r.classList.toggle('dark', dark);
            r.setAttribute('data-theme', dark ? 'dark' : 'light');
            localStorage.setItem(GLOBAL_KEY, dark ? 'dark' : 'light');
        } catch { /* ignore */ }
        setIsDarkMode(dark);
    }, []);

    const toggleTheme = useCallback(() => applyGlobal(!isDarkMode), [applyGlobal, isDarkMode]);
    const setTheme = useCallback((dark) => applyGlobal(dark), [applyGlobal]);
    const useSystemTheme = useCallback(() => {
        const prefersDark = typeof window !== 'undefined'
            && window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyGlobal(prefersDark);
    }, [applyGlobal]);

    const updatePreferences = useCallback((newPreferences) => {
        setUserPreferences(prev => ({ ...prev, ...newPreferences }));
    }, []);

    // Le planner suit le thème global → plus de mode « système » distinct.
    const getThemeName = () => (isDarkMode ? 'Nuit' : 'Jour');
    const getThemeIcon = () => (isDarkMode ? 'moon' : 'sun');

    const value = {
        // État
        isDarkMode,
        isSystemTheme: false,
        userPreferences,

        // Fonctions
        toggleTheme,
        setTheme,
        useSystemTheme,
        updatePreferences,

        // Utilitaires
        getThemeName,
        getThemeIcon,

        // Classes CSS
        themeClass: isDarkMode ? 'theme-nuit' : 'theme-jour'
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

// Hook pour utiliser le contexte
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme doit être utilisé dans un ThemeProvider');
    }
    return context;
}

export default ThemeContext;
