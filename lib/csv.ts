// Export CSV unifié (#56) — un seul helper pour TOUS les modules, bien présenté pour Excel français.
// • BOM UTF-8 (accents corrects dans Excel) ; séparateur « ; » par défaut (Excel-FR) ;
// • échappement RFC 4180 (guillemets doublés, champ entre guillemets si séparateur/saut/guillemet) ;
// • formatage FR des nombres/dates optionnel via des colonnes typées.
// Usage simple : downloadCsv('clients.csv', rows, [{ key:'name', label:'Nom' }, ...]).

export type CsvColumn<T = any> = {
  key: keyof T | string;                 // clé dans la ligne
  label: string;                         // en-tête de colonne (déjà traduit)
  // Transformateur de valeur (sinon String(valeur)). Reçoit la valeur ET la ligne complète.
  map?: (value: any, row: T) => string | number | null | undefined;
  type?: 'text' | 'number' | 'money' | 'date';  // formatage FR pour number/money/date
};

const FR = 'fr-CA';

function fmtCell(raw: any, type?: CsvColumn['type']): string {
  if (raw == null || raw === '') return '';
  if (type === 'number') { const n = Number(raw); return isNaN(n) ? String(raw) : n.toLocaleString(FR); }
  if (type === 'money') { const n = Number(raw); return isNaN(n) ? String(raw) : n.toLocaleString(FR, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  if (type === 'date') {
    const d = new Date(raw); return isNaN(d.getTime()) ? String(raw) : d.toLocaleDateString(FR);
  }
  return String(raw);
}

// Échappe un champ selon le séparateur (RFC 4180).
function esc(field: string, sep: string): string {
  const s = String(field ?? '');
  return /["\n\r]/.test(s) || s.includes(sep) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

/** Construit le texte CSV (avec BOM) à partir de lignes + définition de colonnes. */
export function buildCsv<T = any>(rows: T[], columns: CsvColumn<T>[], sep = ';'): string {
  const head = columns.map(c => esc(c.label, sep)).join(sep);
  const body = (rows || []).map(row =>
    columns.map(c => {
      const v = c.map ? c.map((row as any)[c.key as any], row) : (row as any)[c.key as any];
      return esc(fmtCell(v, c.type), sep);
    }).join(sep)
  );
  return '﻿' + [head, ...body].join('\r\n');
}

/** Déclenche le téléchargement d'un CSV bien formaté (Excel-FR). */
export function downloadCsv<T = any>(filename: string, rows: T[], columns: CsvColumn<T>[], sep = ';'): void {
  const text = buildCsv(rows, columns, sep);
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.toLowerCase().endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Télécharge un CSV déjà construit (texte brut sans BOM ajouté par l'appelant). */
export function downloadCsvText(filename: string, csvText: string): void {
  const text = csvText.startsWith('﻿') ? csvText : '﻿' + csvText;
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename.toLowerCase().endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
