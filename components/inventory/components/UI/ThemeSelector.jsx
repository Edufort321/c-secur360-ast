// ============== SÉLECTEUR DE THÈME ==============
// Composant pour basculer entre thème jour/nuit/système

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

export function ThemeSelector({ showLabel = true, compact = false }) {
    const { isDarkMode, isSystemTheme, toggleTheme, setTheme, useSystemTheme } = useTheme();
    const { t } = useLanguage();

    const handleClick = () => {
        if (isSystemTheme) {
            setTheme(false); // Passer en mode jour
        } else if (!isDarkMode) {
            setTheme(true); // Passer en mode nuit
        } else {
            useSystemTheme(); // Revenir au système
        }
    };

    const getIcon = () => {
        if (isSystemTheme) {
            return <Monitor size={compact ? 16 : 20} className="theme-icon" />;
        }
        return isDarkMode ?
            <Moon size={compact ? 16 : 20} className="theme-icon" /> :
            <Sun size={compact ? 16 : 20} className="theme-icon" />;
    };

    const getLabel = () => {
        if (isSystemTheme) {
            return t('theme.system');
        }
        return isDarkMode ? t('theme.dark') : t('theme.light');
    };

    return (
        <button
            onClick={handleClick}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white transition-all duration-200 border border-gray-700 hover:border-gray-600 ${compact ? 'text-sm' : ''}`}
            title={getLabel()}
        >
            <span className="text-slate-400">{getIcon()}</span>
            {showLabel && !compact && <span className="font-medium">{getLabel()}</span>}
        </button>
    );
}

export default ThemeSelector;
