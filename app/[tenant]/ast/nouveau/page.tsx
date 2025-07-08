'use client';

import { useState, useEffect } from 'react';
import ASTForm from '@/components/ASTForm';

export default function NouveauASTPage({ params }: { params: { tenant: string } }) {
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  
  // Récupérer la langue depuis localStorage ou préférences utilisateur
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('ast_language') as 'fr' | 'en';
      if (savedLang && (savedLang === 'fr' || savedLang === 'en')) {
        setLanguage(savedLang);
      }
    } catch (error) {
      // Fallback en cas d'erreur localStorage
      console.warn('Erreur lecture préférences langue:', error);
    }
  }, []);
  
  return <ASTForm tenant={params.tenant} language={language} />
}
