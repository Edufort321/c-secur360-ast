'use client'

import { ReactNode } from 'react'
import { LanguageProvider, useLanguage } from './LanguageContext'
import { NEXT_PUBLIC_APP_NAME } from '@/lib/env.client'

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
        <link rel="icon" href="/c-secur360-logo.png" />
        <meta name="theme-color" content="#3498db" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={NEXT_PUBLIC_APP_NAME} />
      </head>
      <body className={className}>{children}</body>
    </html>
  )
}

