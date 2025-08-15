'use client'

import { useLanguage } from '@/LanguageContext'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  const toggle = () => setLanguage(language === 'fr' ? 'en' : 'fr')

  return (
    <button
      onClick={toggle}
      className="px-2 py-1 text-xs border rounded"
    >
      {language === 'fr' ? 'EN' : 'FR'}
    </button>
  )
}

