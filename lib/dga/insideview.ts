// #DGA — Parseur des exports Excel/CSV de labo (InsideView / Morgan Schaffer LIMS et autres).
// Reference : C:\C-Secur360\DGA\template.ms (gabarit LIMS). Mais on NE se limite PAS aux noms de
// colonnes exacts du gabarit : on reconnait les entetes humaines (H2, Acetylene, No de serie...)
// via des ALIAS normalises (minuscule, sans accents, sans unites/parentheses). Groupement par
// **numero de serie** (puis nom, puis 1 ligne = 1 transformateur) -> ne fusionne jamais a tort.
// Sortie au MEME format que extractDgaFromPdf ({transformers:[{equipment, measurements}]}).
import * as XLSX from 'xlsx';

// Normalise un libelle d'entete : minuscule, sans accents, sans () , sans separateurs.
const nk = (s: any) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\([^)]*\)/g, ' ').replace(/[^a-z0-9]+/g, '');
const UNIT_RE = /(ppm|ppb|mgkg|mgl|mgkohg|mgkoh|percent|pourcent|vol|kv)$/; // unite collee a retirer

// Gaz dissous : cle interne -> alias normalises.
const GAS_ALIASES: Record<string, string[]> = {
  H2: ['h2', 'hydrogen', 'hydrogene'],
  C2H2: ['c2h2', 'acetylene'],
  C2H4: ['c2h4', 'ethylene', 'ethene'],
  C2H6: ['c2h6', 'ethane'],
  CH4: ['ch4', 'methane'],
  CO: ['co', 'carbonmonoxide', 'monoxydecarbone', 'monoxydedecarbone'],
  CO2: ['co2', 'carbondioxide', 'dioxydecarbone', 'dioxydedecarbone'],
  N2: ['n2', 'nitrogen', 'azote'],
  O2: ['o2', 'oxygen', 'oxygene'],
  TDCG: ['tdcg'],
};
// Qualite d'huile / furannes : cle oil_quality interne -> alias.
const OILQ_ALIASES: Record<string, string[]> = {
  moisture: ['water', 'moisture', 'eau', 'humidite', 'h2o', 'teneureneau'],
  dbd877: ['d877', 'dielectricstrength877', 'dielectric877', 'rigiditedielectrique877'],
  dielectric: ['d18162', 'd18161', 'd1816', 'dielectricstrength18162mm', 'dielectricstrength18161mm', 'dielectricstrength1816', 'rigiditedielectrique1816'],
  acid: ['acidnum', 'acidnumber', 'acidite', 'tan', 'neutralizationnumber', 'indiceacide'],
  ift: ['ift', 'interfacialtension', 'tensioninterfaciale'],
  pf25: ['pf25', 'pf25c', 'powerfactor25c', 'powerfactor25', 'dissipationfactor25', 'facteurpuissance25'],
  pf100: ['pf100', 'pf100c', 'powerfactor100c', 'powerfactor100', 'facteurpuissance100'],
  color: ['color', 'colornumber', 'couleur'],
  visual: ['visual', 'visualaspect', 'aspect', 'aspectvisuel'],
  dbp: ['idbp', 'dbp', 'oxidationinhibitordbp'],
  dbpc: ['idbpc', 'dbpc', 'oxidationinhibitordbpc'],
  pcb: ['totalpcb', 'pcbtotalaroclors', 'pcb', 'bpc'],
  f_2fal: ['furfural', '2fal', 'fal'],
  f_ffa: ['furfurylalc', 'furfurylalcohol', 'ffa'],
  f_5hmf: ['hmfurfural', '5hmf', 'hmf', 'hydroxymethylfurfural'],
  f_2acf: ['acetylfuran', '2acf', 'acf'],
  f_5mef: ['mfurfural', 'methulfurfural', 'methylfurfural', '5mef', 'mef'],
};
const SERIAL_ALIASES = ['serial', 'serialno', 'serialnumber', 'serie', 'serienumber', 'noserie', 'nserie', 'numeroserie', 'sn', 'nodeserie', 'noserieequipement'];
const ASSET_ALIASES = ['assetname', 'asset', 'name', 'equipment', 'equipement', 'identification', 'ident', 'nom', 'tag', 'transformer', 'transformateur', 'appareil'];
const DATE_ALIASES = ['sampledate', 'sampleddate', 'date', 'dateprelevement', 'datedeprelevement', 'samplingdate', 'dateechantillon', 'sampledon', 'datesample'];
const TEXT_KEYS = new Set(['visual', 'color']);

type Res = { kind: 'gas' | 'oil'; key: string } | { kind: 'serial' | 'asset' | 'date' } | null;
function resolveHeader(hn: string): Res {
  const test = (h: string): Res => {
    for (const [k, al] of Object.entries(GAS_ALIASES)) if (al.includes(h)) return { kind: 'gas', key: k };
    for (const [k, al] of Object.entries(OILQ_ALIASES)) if (al.includes(h)) return { kind: 'oil', key: k };
    if (SERIAL_ALIASES.includes(h)) return { kind: 'serial' };
    if (ASSET_ALIASES.includes(h)) return { kind: 'asset' };
    if (DATE_ALIASES.includes(h)) return { kind: 'date' };
    return null;
  };
  return test(hn) || test(hn.replace(UNIT_RE, '')) || null;
}

function numOrNull(raw: any): number | null {
  if (raw == null || raw === '') return null;
  const s = String(raw).trim();
  const lt = s.match(/^<\s*([\d.,]+)/); if (lt) { const v = Number(lt[1].replace(',', '.')); return isFinite(v) ? v / 2 : null; }
  const v = Number(s.replace(/\s/g, '').replace(',', '.')); return isFinite(v) ? v : null;
}
function normDate(raw: any): string | null {
  if (raw == null || raw === '') return null;
  if (raw instanceof Date && !isNaN(raw.getTime())) return raw.toISOString().slice(0, 10);
  const s = String(raw).trim();
  const iso = s.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/); if (iso) return `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`;
  const d = new Date(s); return isNaN(d.getTime()) ? (s.slice(0, 10) || null) : d.toISOString().slice(0, 10);
}

// Construit la table colonne(brute) -> resolution, a partir de TOUTES les cles vues.
function buildColmap(rows: any[]): Record<string, Exclude<Res, null>> {
  const colmap: Record<string, Exclude<Res, null>> = {};
  const seen = new Set<string>();
  for (const r of rows) for (const k of Object.keys(r || {})) seen.add(k);
  for (const raw of seen) { const res = resolveHeader(nk(raw)); if (res) colmap[raw] = res; }
  return colmap;
}

// Lignes (objets cle=entete) -> transformateurs groupes par n° de serie (puis nom, puis 1/ligne).
export function parseLimsRows(rows: any[]): { transformers: any[] } | null {
  if (!Array.isArray(rows) || !rows.length) return null;
  const colmap = buildColmap(rows);
  const gasCols = Object.values(colmap).filter(v => v.kind === 'gas').length;
  if (gasCols < 2) return null; // pas un fichier DGA reconnaissable (entetes de gaz introuvables)

  const groups = new Map<string, { equipment: any; measurements: any[] }>();
  rows.forEach((r0, i) => {
    let serial = '', asset = '', date: string | null = null, gasHits = 0;
    const m: any = {};
    for (const [raw, v] of Object.entries(colmap)) {
      const val = r0[raw]; if (val == null || val === '') continue;
      if (v.kind === 'serial') serial = String(val).trim();
      else if (v.kind === 'asset') asset = String(val).trim();
      else if (v.kind === 'date') date = normDate(val);
      else if (v.kind === 'gas') { const n = numOrNull(val); if (n != null) { m[(v as any).key] = n; gasHits++; } }
      else if (v.kind === 'oil') { const key = (v as any).key; m[key] = TEXT_KEYS.has(key) ? String(val) : numOrNull(val); }
    }
    if (gasHits < 1) return; // ligne sans aucune valeur de gaz -> ignoree
    m.date = date;
    // CLE DE GROUPE : n° de serie d'abord (chaque serie = un transformateur distinct), sinon nom,
    // sinon la LIGNE elle-meme (jamais tout fusionner par defaut).
    const key = serial ? 's:' + serial.toLowerCase() : asset ? 'a:' + asset.toLowerCase() : 'r:' + i;
    if (!groups.has(key)) groups.set(key, { equipment: { identification: asset || (serial ? `SN ${serial}` : `Import ${date || ''}`.trim()), serialNo: serial || undefined }, measurements: [] });
    const g = groups.get(key)!;
    if (!g.equipment.serialNo && serial) g.equipment.serialNo = serial;
    if ((!g.equipment.identification || /^Import|^SN /.test(g.equipment.identification)) && asset) g.equipment.identification = asset;
    g.measurements.push(m);
  });
  if (!groups.size) return null;
  return { transformers: [...groups.values()] };
}

// Parse un classeur Excel/CSV. Accepte Uint8Array (Buffer Node en herite) -> client ET serveur.
// Gere un PREAMBULE (lignes de titre avant les entetes) en cherchant la vraie ligne d'entete.
export function parseLimsBuffer(buf: Uint8Array): { transformers: any[] } | null {
  let wb: XLSX.WorkBook;
  try { wb = XLSX.read(buf, { type: 'array', cellDates: true }); } catch { return null; }
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) return null;

  // 1) Essai direct : 1re ligne = entetes.
  const direct = parseLimsRows(XLSX.utils.sheet_to_json(sheet, { defval: null, raw: false }));
  if (direct) return direct;

  // 2) Preambule possible : on cherche la ligne d'entete (>= 2 colonnes de gaz reconnues).
  const aoa: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: false });
  for (let i = 0; i < Math.min(aoa.length, 20); i++) {
    const hits = (aoa[i] || []).filter(c => { const r = resolveHeader(nk(c)); return r && r.kind === 'gas'; }).length;
    if (hits >= 2) {
      const headers = (aoa[i] || []).map(c => String(c ?? ''));
      const objs: any[] = [];
      for (let j = i + 1; j < aoa.length; j++) {
        const row = aoa[j]; if (!row || row.every(c => c == null || c === '')) continue;
        const o: any = {}; headers.forEach((h, k) => { o[h] = row[k]; }); objs.push(o);
      }
      const res = parseLimsRows(objs);
      if (res) return res;
    }
  }
  return null;
}

export function isSpreadsheet(filename?: string, contentType?: string): boolean {
  return /\.(xlsx|xls|csv)$/i.test(filename || '') || /(spreadsheet|excel|sheet|csv|ms-excel)/i.test(contentType || '');
}
export function isPdf(filename?: string, contentType?: string): boolean {
  return /\.pdf$/i.test(filename || '') || /pdf/i.test(contentType || '');
}
