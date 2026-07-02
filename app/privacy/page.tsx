import { redirect } from 'next/navigation';

// Alias historique en anglais -> redirige vers la page canonique /confidentialite (FR, Loi 25 / RGPD).
export default function PrivacyAlias() {
  redirect('/confidentialite');
}
