import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './styles/design-system.css'
import './styles/components.css'
const inter = Inter({ subsets: ['latin'] })

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
  themeColor: '#10b981',
}

export const metadata: Metadata = {
  title: 'C-Secur360 — Sécurité Industrielle',
  description: 'Plateforme SaaS de sécurité industrielle — AST, permis, inspections, conformité provinciale.',
  manifest: '/manifest.json',
}

import { TwilioProvider } from '../contexts/TwilioContext'
import { Providers } from './providers'
import { SwRegister } from '@/components/SwRegister'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#3498db" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="C-Secur360" />
      </head>
      <body className={inter.className}>
        <Providers>
          <TwilioProvider>
            <SwRegister />
            {children}
          </TwilioProvider>
        </Providers>
      </body>
    </html>
  )
}
