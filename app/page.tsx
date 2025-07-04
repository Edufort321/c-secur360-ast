import { redirect } from 'next/navigation'

export default function HomePage() {
  // Rediriger vers le tenant démo par défaut
  redirect('/demo/dashboard')
}
