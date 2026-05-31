import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Securite/SEO (#25) : espace super-admin prive -> jamais indexe.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
