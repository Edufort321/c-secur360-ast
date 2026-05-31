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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://csecur360.ca';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'C-Secur360 — Sécurité Industrielle',
    template: '%s — C-Secur360',
  },
  description: 'Plateforme SaaS de sécurité industrielle — AST, permis, inspections, conformité provinciale.',
  applicationName: 'C-Secur360',
  manifest: '/manifest.json',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: 'C-Secur360',
    title: 'C-Secur360 — Sécurité Industrielle',
    description: 'Plateforme SaaS de sécurité industrielle — AST, permis, inspections, conformité provinciale.',
    url: SITE_URL,
    locale: 'fr_CA',
  },
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
