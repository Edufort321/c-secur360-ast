'use client';
import { useEffect, useRef } from 'react';

// ── Brouillons locaux (auto-save) ────────────────────────────────────────────
// Sauvegarde locale (localStorage) d'un formulaire EN COURS, pour ne rien perdre si on quitte la page
// avant d'avoir enregistré. Ne touche JAMAIS au serveur (aucune fuite réseau) et se purge à l'enregistrement.
// Toujours namespacé par tenant via la clé fournie (ex. `bc.<tenant>.<id|new>`).

const PREFIX = 'csecur360.draft.';
const k = (key: string) => `${PREFIX}${key}`;

export function readDraft<T = any>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try { const s = window.localStorage.getItem(k(key)); return s ? (JSON.parse(s) as T) : null; } catch { return null; }
}
export function writeDraft(key: string, value: any): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(k(key), JSON.stringify(value)); } catch { /* quota / privé */ }
}
export function clearDraft(key: string): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.removeItem(k(key)); } catch { /* noop */ }
}
export function hasDraft(key: string): boolean {
  if (typeof window === 'undefined') return false;
  try { return window.localStorage.getItem(k(key)) != null; } catch { return false; }
}

/**
 * Auto-sauvegarde `value` sous `key` (debouncé) tant que `enabled`. Ignore la 1re valeur (montage)
 * pour ne pas réécrire un brouillon vide par-dessus une restauration. Utiliser readDraft/clearDraft
 * pour proposer la restauration à l'ouverture et purger à l'enregistrement réel.
 */
export function useAutoDraft(key: string, value: any, enabled = true, debounceMs = 800): void {
  const skipFirst = useRef(true);
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    if (skipFirst.current) { skipFirst.current = false; return; }
    const id = setTimeout(() => writeDraft(key, value), debounceMs);
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, value, enabled]);
}
