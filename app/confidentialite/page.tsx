import type { Metadata } from 'next';
import { PrivacyPolicy } from '@/components/legal/PrivacyPolicy';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Politique de confidentialité de C-Secur360 (Loi 25 / RGPD).',
  alternates: { canonical: '/confidentialite' },
};

export default function ConfidentialitePage() {
  return <PrivacyPolicy />;
}
