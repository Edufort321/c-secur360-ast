'use client';

import { useEffect } from 'react';

// UX globale : quand on clique/tabule dans un champ NUMÉRIQUE, on sélectionne tout son contenu
// pour pouvoir l'écraser directement (sans avoir à effacer le 0/la valeur). S'applique PARTOUT :
//   - <input type="number">
//   - inputmode="numeric" / "decimal"
//   - les champs marqués data-numeric (pour les inputs texte qui contiennent des chiffres)
// N'affecte PAS les champs texte normaux (noms, notes…), pour ne pas gêner l'édition.
export function SelectNumberOnFocus() {
  useEffect(() => {
    const isNumeric = (el: HTMLInputElement) => {
      const t = (el.type || '').toLowerCase();
      const im = (el.getAttribute('inputmode') || '').toLowerCase();
      return t === 'number' || im === 'numeric' || im === 'decimal' || el.hasAttribute('data-numeric');
    };
    const onFocusIn = (e: Event) => {
      const el = e.target as HTMLElement | null;
      if (!el || el.tagName !== 'INPUT') return;
      const inp = el as HTMLInputElement;
      if (inp.readOnly || inp.disabled || !isNumeric(inp)) return;
      // setTimeout 0 : laisse le navigateur placer le curseur, puis on sélectionne tout.
      setTimeout(() => { try { inp.select(); } catch { /* ignore */ } }, 0);
    };
    document.addEventListener('focusin', onFocusIn);
    return () => document.removeEventListener('focusin', onFocusIn);
  }, []);
  return null;
}

export default SelectNumberOnFocus;
