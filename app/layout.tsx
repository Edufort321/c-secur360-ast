import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './styles/design-system.css'
import './styles/components.css'
const inter = Inter({ subsets: ['latin'] })

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  // Zoom autorisé (accessibilité WCAG 1.4.4) ; couleur de thème unifiée avec le manifest (#111827).
  maximumScale: 5,
  themeColor: '#111827',
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.c-secur360.ca';

// Description enrichie (17 modules réels, cible industrielle/SST au Canada) — réutilisée partout (meta, OG, Twitter, JSON-LD).
const SITE_DESCRIPTION = 'Plateforme SST tout-en-un pour les entreprises industrielles au Canada : AST, permis, registres & KPI (HSE), inspections, maintenance, diagnostic DGA, planificateur, feuilles de temps, rapports terrain et plus — 17 modules, conformité CNESST et provinciale.';
const SITE_TITLE = 'C-Secur360 — Plateforme SST tout-en-un';
const OG_IMAGE = '/c-secur360-logo.png';

// Données structurées (SEO) : logiciel SaaS + éditeur. Aucun prix codé en dur (tarifs dynamiques en base).
const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'C-Secur360',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, iOS, Android (PWA)',
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  inLanguage: ['fr-CA', 'en-CA'],
  offers: { '@type': 'Offer', priceCurrency: 'CAD', availability: 'https://schema.org/InStock' },
  provider: { '@type': 'Organization', name: 'Commerce CERDIA inc.', url: 'https://www.cerdia.ai' },
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: '%s — C-Secur360',
  },
  description: SITE_DESCRIPTION,
  applicationName: 'C-Secur360',
  manifest: '/manifest.json',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: 'C-Secur360',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: 'fr_CA',
    images: [{ url: OG_IMAGE, alt: 'C-Secur360 — plateforme SST tout-en-un' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
}

import { TwilioProvider } from '../contexts/TwilioContext'
import { Providers } from './providers'
import { SwRegister } from '@/components/SwRegister'
import { CookieConsent } from '@/components/CookieConsent'
import { SelectNumberOnFocus } from '@/components/SelectNumberOnFocus'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-pwa?size=180&v=2" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="C-Secur360" />
      </head>
      <body className={inter.className}>
        <Providers>
          <TwilioProvider>
            <SwRegister />
            <SelectNumberOnFocus />
            {children}
            <CookieConsent />
          </TwilioProvider>
        </Providers>
      </body>
    </html>
  )
}
