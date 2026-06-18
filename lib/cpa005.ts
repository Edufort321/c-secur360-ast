// Générateur de fichier CPA-005 (Norme 005 — FTE/dépôt direct) pour Desjardins AccèsD Affaires (#52 phase 2).
// Enregistrements à largeur FIXE de 1464 caractères : A (en-tête), C (crédits = en-tête 24 + jusqu'à 6
// segments de 240), Z (contrôle). Montants en cents, dates juliennes 0AAJJJ. TOUS les paramètres
// d'expéditeur sont configurables (numéro client, centre de données, compte de retour) car ils viennent
// de l'enrôlement AccèsD Affaires. ⚠️ Format à VALIDER avec un fichier test Desjardins avant production.

export type Cpa005Originator = {
  originatorId: string;        // n° d'expéditeur / client Desjardins (10)
  shortName: string;           // nom court de l'expéditeur (≤15)
  longName: string;            // nom long de l'expéditeur (≤30)
  dataCentre: string;          // centre de traitement destinataire (5)
  fileCreationNumber: number;  // n° de création de fichier (séquentiel, 4 chiffres)
  returnInstitution: string;   // institution du compte de retour (3) — Desjardins = 815
  returnTransit: string;       // transit du compte de retour (5)
  returnAccount: string;       // compte de retour (≤12)
  transactionType?: string;    // code d'opération (défaut 200 = dépôt de paie)
};
export type Cpa005Payment = {
  name: string;                // bénéficiaire (≤30)
  institution: string;         // institution (3)
  transit: string;             // transit/succursale (5)
  account: string;             // compte (≤12)
  amountCents: number;         // montant en cents
  reference?: string;          // référence (≤19)
  dueDate?: string;            // AAAA-MM-JJ (défaut aujourd'hui)
};

const onlyDigits = (s: any) => String(s ?? '').replace(/\D/g, '');
// Numérique cadré à droite, rempli de zéros.
const num = (v: any, len: number) => onlyDigits(v).slice(0, len).padStart(len, '0');
// Alphanumérique cadré à gauche, rempli d'espaces (sans accents — ASCII).
const alpha = (v: any, len: number) => String(v ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\x20-\x7E]/g, ' ').slice(0, len).padEnd(len, ' ');
const blanks = (len: number) => ' '.repeat(len);

/** Date julienne CPA : 0AAJJJ (0 + année 2 chiffres + jour de l'année 3 chiffres). */
export function julian(d: Date): string {
  const start = new Date(d.getFullYear(), 0, 0);
  const day = Math.floor((d.getTime() - start.getTime()) / 86400000);
  return '0' + String(d.getFullYear()).slice(-2) + String(day).padStart(3, '0');
}

// ── Segment d'opération (240) ────────────────────────────────────────────────
function segment(o: Cpa005Originator, p: Cpa005Payment, today: Date): string {
  const due = p.dueDate ? new Date(p.dueDate + 'T00:00:00') : today;
  return (
    num(o.transactionType || '200', 3) +        // type d'opération
    num(p.amountCents, 10) +                     // montant (cents)
    julian(due) +                                // date des fonds (0AAJJJ)
    num(p.institution, 3) +                      // institution bénéficiaire
    num(p.transit, 5) +                          // transit bénéficiaire
    alpha(onlyDigits(p.account), 12) +           // compte bénéficiaire
    num(0, 22) +                                 // n° de trace (réservé)
    alpha(p.name, 30) +                          // nom du bénéficiaire
    alpha(o.shortName, 15) +                     // nom court expéditeur
    alpha(o.longName, 30) +                      // nom long expéditeur
    num(o.originatorId, 10) +                    // n° d'expéditeur
    alpha(p.reference || '', 19) +               // référence
    num(o.returnInstitution, 3) +                // institution de retour
    num(o.returnTransit, 5) +                    // transit de retour
    alpha(onlyDigits(o.returnAccount), 12) +     // compte de retour
    blanks(55)                                   // remplissage → 240
  );
}

function pad1464(s: string): string { return s.length >= 1464 ? s.slice(0, 1464) : s.padEnd(1464, ' '); }

/** Construit le fichier CPA-005 complet (enregistrements séparés par CRLF). */
export function buildCpa005(o: Cpa005Originator, payments: Cpa005Payment[], opts?: { creationDate?: Date }): { content: string; count: number; totalCents: number } {
  const today = opts?.creationDate || new Date();
  const valid = payments.filter(p => (Number(p.amountCents) || 0) > 0 && onlyDigits(p.institution) && onlyDigits(p.transit) && onlyDigits(p.account));
  const fcn = num(o.fileCreationNumber, 4);
  const oid = num(o.originatorId, 10);
  let rec = 1;

  // A — en-tête
  const A = pad1464('A' + num(rec, 9) + oid + fcn + julian(today) + num(o.dataCentre, 5));
  rec++;

  // C — crédits, 6 segments par enregistrement
  const cRecords: string[] = [];
  for (let i = 0; i < valid.length; i += 6) {
    const segs = valid.slice(i, i + 6).map(p => segment(o, p, today));
    while (segs.length < 6) segs.push(blanks(240));
    cRecords.push(pad1464('C' + num(rec, 9) + oid + fcn + segs.join('')));
    rec++;
  }

  // Z — contrôle (totaux des crédits)
  const totalCents = valid.reduce((s, p) => s + (Number(p.amountCents) || 0), 0);
  const Z = pad1464('Z' + num(rec, 9) + oid + fcn + num(totalCents, 14) + num(valid.length, 8) + num(0, 14) + num(0, 8));

  const content = [A, ...cRecords, Z].join('\r\n') + '\r\n';
  return { content, count: valid.length, totalCents };
}
