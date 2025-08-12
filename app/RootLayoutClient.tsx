'use client'

import { ReactNode } from 'react'
import { LanguageProvider, useLanguage } from './LanguageContext'

interface Props {
  children: ReactNode
  className: string
}

export default function RootLayoutClient({ children, className }: Props) {
  return (
    <LanguageProvider>
      <InnerLayout className={className}>{children}</InnerLayout>
    </LanguageProvider>
  )
}

function InnerLayout({ children, className }: { children: ReactNode; className: string }) {
  const { language } = useLanguage()

  return (
    <html lang={language}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#3498db" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AST MDL" />
      </head>
      <body className={className}>{children}</body>
    </html>
  )
}

