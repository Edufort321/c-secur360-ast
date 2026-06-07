import { redirect } from 'next/navigation';

// Alias -> redirige vers la page canonique /confidentialite.
export default function PolitiqueConfidentialiteAlias() {
  redirect('/confidentialite');
}
