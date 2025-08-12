'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { setLanguage as setGlobalLanguage, getCurrentLanguage } from '@/utils/translations'

export type Language = 'fr' | 'en'

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'fr',
  setLanguage: () => {},
})

const STORAGE_KEY = 'language'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr')

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    const initial = (stored === 'fr' || stored === 'en') ? (stored as Language) : getCurrentLanguage()
    setLanguageState(initial)
    setGlobalLanguage(initial)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang)
    }
    setGlobalLanguage(lang)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)

