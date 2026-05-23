import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// Renvoie l'utilisateur courant (résolu par le middleware via les en-têtes x-user-*).
export async function GET() {
  const user = getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user });
}
