import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import RootLayoutClient from './RootLayoutClient'
import { NEXT_PUBLIC_APP_NAME } from '@/lib/env.client'
const inter = Inter({ subsets: ['latin'] })

// ✅ VIEWPORT SÉPARÉ (obligatoire Next.js 14+)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
}

// ✅ METADATA SANS VIEWPORT
export const metadata: Metadata = {
  title: {
    default: NEXT_PUBLIC_APP_NAME,
    template: `%s - ${NEXT_PUBLIC_APP_NAME}`,
  },
  description: "Application d'analyse sécuritaire de tâches pour MDL",
  manifest: '/manifest.json',
  themeColor: '#3498db',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RootLayoutClient className={inter.className}>{children}</RootLayoutClient>
}
