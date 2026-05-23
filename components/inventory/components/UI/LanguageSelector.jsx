// ============== SÉLECTEUR DE LANGUE ==============
// Composant pour basculer entre FR et EN

import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage, LANGUAGES } from '../../contexts/LanguageContext';

export function LanguageSelector({ showLabel = true, compact = false }) {
    const { language, changeLanguage } = useLanguage();

    const toggleLanguage = () => {
        const newLang = language === 'fr' ? 'en' : 'fr';
        changeLanguage(newLang);
    };

    const currentLang = LANGUAGES[language];

    return (
        <button
            onClick={toggleLanguage}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white transition-all duration-200 border border-gray-700 hover:border-gray-600 ${compact ? 'text-sm' : ''}`}
            title={currentLang.name}
        >
            {!compact && <Globe size={16} className="text-slate-400" />}
            <span className="font-medium">
                {currentLang.display}
            </span>
        </button>
    );
}

export default LanguageSelector;
