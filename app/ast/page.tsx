import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AST MDL - Analyse Sécuritaire de Tâches',
  description: 'Application d\'analyse sécuritaire de tâches pour MDL',
  manifest: '/manifest.json',
  themeColor: '#3498db',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    userScalable: false,
  },
}

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
        <meta name="apple-mobile-web-app-title" content="AST MDL" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
