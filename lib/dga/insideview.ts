// #DGA — Parseur NATIF des exports InsideView / Morgan Schaffer (LIMS DataTemplate).
// Reference : C:\C-Secur360\DGA\template.ms — gabarit LIMS qui mappe chaque champ a un nom de colonne
// du fichier source (Excel/CSV). On lit donc directement ces colonnes -> aucune IA, deterministe,
// gratuit et 100% fidele. Sortie au MEME format que extractDgaFromPdf ({transformers:[{equipment,
// measurements}]}) pour reutiliser importTransformers tel quel.
import * as XLSX from 'xlsx';

// Colonnes LIMS (cote droit du template .ms) -> cle de mesure interne (gaz dissous, en ppm).
const GAS_MAP: Record<string, string> = {
  h2: 'H2', c2h2: 'C2H2', c2h4: 'C2H4', c2h6: 'C2H6', ch4: 'CH4', co: 'CO', co2: 'CO2', n2: 'N2', o2: 'O2', tdcg: 'TDCG',
};
// Au moins 2 de ces gaz presents => la ligne est consideree comme une mesure DGA.
const GAS_DETECT = ['h2', 'c2h2', 'c2h4', 'c2h6', 'ch4', 'co', 'co2'];

// Colonnes LIMS -> cle de qualite d'huile (oil_quality) interne (OIL_FIELDS / FURAN_FIELDS).
const OILQ_MAP: Record<string, string> = {
  water: 'moisture', d877: 'dbd877', acidnum: 'acid', ift: 'ift', pf25: 'pf25', pf100: 'pf100',
  color: 'color', visual: 'visual', d1816_2: 'dielectric', i_dbp: 'dbp', i_dbpc: 'dbpc', totalpcb: 'pcb',
  furfural: 'f_2fal', furfurylalc: 'f_ffa', hmfurfural: 'f_5hmf', acetylfuran: 'f_2acf', mfurfural: 'f_5mef',
};
const TEXT_OILQ = new Set(['visual', 'color']); // valeurs texte (pas de coercition numerique)

function numOrNull(raw: any): number | null {
  if (raw == null || raw === '') return null;
  const s = String(raw).trim();
  // "<1" / "< 0.5" -> moitie du seuil (meme regle que l'extraction IA).
  const lt = s.match(/^<\s*([\d.,]+)/); if (lt) { const v = Number(lt[1].replace(',', '.')); return isFinite(v) ? v / 2 : null; }
  const v = Number(s.replace(',', '.')); return isFinite(v) ? v : null;
}
function normDate(raw: any): string | null {
  if (raw == null || raw === '') return null;
  if (raw instanceof Date && !isNaN(raw.getTime())) return raw.toISOString().slice(0, 10);
  const s = String(raw).trim();
  const iso = s.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/); // yyyy-mm-dd / yyyy/mm/dd
  if (iso) return `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`;
  const d = new Date(s); return isNaN(d.getTime()) ? (s.slice(0, 10) || null) : d.toISOString().slice(0, 10);
}
// Cles de ligne normalisees (minuscule, sans espaces autour) -> valeur.
function normRow(r: any): Record<string, any> {
  const out: Record<string, any> = {};
  for (const k of Object.keys(r || {})) out[String(k).trim().toLowerCase()] = r[k];
  return out;
}

// Convertit des lignes LIMS (objets cle=colonne) en transformateurs groupes par AssetName.
// Renvoie null si rien ne ressemble a une mesure DGA (le fichier n'etait pas un export LIMS).
export function parseLimsRows(rows: any[]): { transformers: any[] } | null {
  if (!Array.isArray(rows) || !rows.length) return null;
  const groups = new Map<string, { equipment: any; measurements: any[] }>();
  let recognized = 0;
  for (const r0 of rows) {
    const r = normRow(r0);
    if (GAS_DETECT.filter(t => r[t] != null && r[t] !== '').length < 2) continue; // pas une ligne DGA
    recognized++;
    const asset = String(r['assetname'] ?? r['name'] ?? r['asset'] ?? '').trim() || `Import ${normDate(r['sampledate']) || ''}`.trim();
    const key = asset.toLowerCase();
    if (!groups.has(key)) groups.set(key, { equipment: { identification: asset, serialNo: String(r['serial'] ?? r['serialno'] ?? '').trim() || undefined, samplingPoint: String(r['tank'] ?? '').trim() || undefined }, measurements: [] });
    const m: any = { date: normDate(r['sampledate'] ?? r['sampleddate'] ?? r['date']) };
    for (const [tok, dst] of Object.entries(GAS_MAP)) if (r[tok] != null && r[tok] !== '') m[dst] = numOrNull(r[tok]);
    for (const [tok, dst] of Object.entries(OILQ_MAP)) if (r[tok] != null && r[tok] !== '') m[dst] = TEXT_OILQ.has(dst) ? String(r[tok]) : numOrNull(r[tok]);
    // D1816 : 2 mm de preference, repli sur 1 mm.
    if ((r['d1816_2'] == null || r['d1816_2'] === '') && r['d1816_1'] != null && r['d1816_1'] !== '') m['dielectric'] = numOrNull(r['d1816_1']);
    groups.get(key)!.measurements.push(m);
  }
  if (!recognized) return null;
  return { transformers: [...groups.values()].filter(g => g.measurements.length) };
}

// Parse un classeur Excel/CSV. Accepte un Uint8Array (Buffer Node en herite) -> fonctionne cote
// SERVEUR (webhook courriel) ET cote CLIENT (import manuel dans l'app). null si illisible/non LIMS.
export function parseLimsBuffer(buf: Uint8Array): { transformers: any[] } | null {
  let wb: XLSX.WorkBook;
  try { wb = XLSX.read(buf, { type: 'array', cellDates: true }); } catch { return null; }
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) return null;
  const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: false });
  return parseLimsRows(rows);
}

// Vrai si la piece jointe est un classeur (a router vers le parseur LIMS plutot que l'IA PDF).
export function isSpreadsheet(filename?: string, contentType?: string): boolean {
  return /\.(xlsx|xls|csv)$/i.test(filename || '') || /(spreadsheet|excel|sheet|csv|ms-excel)/i.test(contentType || '');
}
export function isPdf(filename?: string, contentType?: string): boolean {
  return /\.pdf$/i.test(filename || '') || /pdf/i.test(contentType || '');
}
