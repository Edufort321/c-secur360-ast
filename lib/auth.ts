// =====================================================
// AUTH — helpers d'authentification réelle
// Identité = table `users` (id texte). Sessions = table `auth_sessions`.
// Le middleware (middleware.ts) lit le cookie `auth_token` -> auth_sessions -> users.
// =====================================================
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';

export const AUTH_COOKIE = 'auth_token';
export const SESSION_TTL_SECONDS = 24 * 60 * 60; // 24 h

export interface SessionUser {
  id: string;
  email: string;
  role: string;
  tenantId: string | null;
}

/** Hash d'un mot de passe (bcrypt, compatible pgcrypto bf). */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

/** Vérifie un mot de passe contre un hash bcrypt. */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}

/** Génère un token de session opaque. */
export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

/** Crée une ligne auth_sessions et renvoie {token, expiresAt}. */
export async function createSession(userId: string, meta?: { ip?: string; userAgent?: string; ttlSeconds?: number }) {
  const token = generateToken();
  const ttl = meta?.ttlSeconds ?? SESSION_TTL_SECONDS;
  const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();
  const { error } = await supabase.from('auth_sessions').insert({
    token,
    user_id: userId,
    expires_at: expiresAt,
    ip_address: meta?.ip ?? null,
    user_agent: meta?.userAgent ?? null,
  });
  if (error) throw error;
  return { token, expiresAt };
}

/** Supprime une session (logout). */
export async function destroySession(token: string) {
  await supabase.from('auth_sessions').delete().eq('token', token);
}

/**
 * Utilisateur courant côté SERVEUR, depuis les en-têtes posés par le middleware.
 * À utiliser dans les Server Components / Route Handlers protégés.
 */
export function getCurrentUser(): SessionUser | null {
  const h = headers();
  const id = h.get('x-user-id');
  if (!id) return null;
  return {
    id,
    email: h.get('x-user-email') ?? '',
    role: h.get('x-user-role') ?? 'user',
    tenantId: h.get('x-user-tenant'),
  };
}
