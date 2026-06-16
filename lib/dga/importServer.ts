// Extraction + import DGA cote SERVEUR (service_role). Partage entre :
//  • la route /api/dga/extract (import manuel depuis le navigateur), et
//  • le webhook /api/dga/email-inbound (import automatique par courriel).
// On reprend FIDELEMENT la logique d'import du client (app/[tenant]/dga/page.tsx) :
// mapEquip (detection OLTC), mapMeasure (split qualite huile/furannes), diagnoseFull (IEEE/Duval),
// correspondance par n° de serie/nom + fusion + dedup des mesures par date.
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { recordAiUsage, aiCallCostCents } from '@/lib/aiBudget';
import { ANTI_INJECTION } from '@/lib/aiGuard';
import { diagnoseFull, type GasInput } from '@/lib/dga/diagnose';
import { OIL_FIELDS, FURAN_FIELDS } from '@/lib/dga/fields';

const num = (v: any) => (v == null || v === '' ? 0 : Number(v) || 0);
const normf = (s?: string) => (s || '').trim().toLowerCase();

// ───────────────────────── Extraction IA (PDF -> transformateurs) ─────────────────────────
const EQUIP_SCHEMA = "{company, contact, email, location, identification, serialNo, equipNo, apparatusType, description, kvClass, maxMVA, oilVolumeL, oilType, manufacturer, year, samplingPoint, isOltc:boolean, parentSerial}";
const MEAS_SCHEMA = "[{date:'YYYY-MM-DD', H2,C2H2,C2H6,C2H4,CH4,CO,CO2,N2,O2,TDCG, moisture,ift,acid,color,dielectric,dbd877,pf25,pf100,sg,dbp,dbpc,pcb, f_2fal,f_ffa,f_5hmf,f_2acf,f_5mef}]";
const PROMPT = `Tu es un extracteur de donnees pour rapports d'analyse d'huile de transformateur (DGA + qualite huile), tous fournisseurs confondus (InsideView/Morgan Schaffer ou autres labos).
Lis le PDF et retourne UNIQUEMENT un objet JSON valide, sans texte autour, sans backticks, avec cette forme exacte :
{"transformers": [{"equipment": ${EQUIP_SCHEMA}, "measurements": ${MEAS_SCHEMA}}]}
Regles :
- EXHAUSTIVITE ABSOLUE : parcours TOUTES les pages du document, du debut a la fin, sans en sauter une seule. N'arrete pas l'extraction avant la derniere page. Chaque page, chaque tableau, chaque feuille de resultats peut contenir un transformateur ou des mesures supplementaires : extrais-les TOUS. Ne resume pas, ne tronque pas, ne te limite pas aux premieres pages.
- IMPORTANT : un rapport peut contenir PLUSIEURS transformateurs (equipements distincts : N° de serie / N° d'equipement / identification differents). Retourne UN objet PAR transformateur dans "transformers", chacun avec SES propres mesures. S'il n'y a qu'un seul transformateur, "transformers" contient un seul objet.
- Regroupe les mesures par transformateur (ne melange pas les mesures de transformateurs differents).
- Pour CHAQUE transformateur, extrais TOUTES ses colonnes/lignes de mesures historiques (toutes les dates presentes), pas seulement la plus recente.
- Gaz dissous en ppm. Si une valeur est "<1" ou "< 0.5", mets la moitie du seuil (ex: 0.5).
- Une entree par colonne/ligne de date dans le tableau (mesures multiples = plusieurs objets dans measurements).
- Dates au format YYYY-MM-DD.
- Un gaz NON mesure / case vide / absent du tableau = null (ne mets PAS 0). 0 uniquement si le rapport indique reellement 0. Ne devine jamais une valeur.
- Champs absents = null. Ne devine pas.
- Reconnais les synonymes: Acetylene/Acetylene/C2H2, Hydrogene/Hydrogen/H2, etc.
- dielectric = rigidite D1816 ; dbd877 = rigidite D877.
- CHANGEUR DE PRISES EN CHARGE (OLTC) : un meme rapport peut contenir l'huile de la CUVE PRINCIPALE et celle du COMPARTIMENT DU CHANGEUR DE PRISES (souvent un n° de serie/equipement distinct). Mets isOltc=true si l'echantillon/equipement designe un changeur de prises (synonymes: changeur de prises, prise sous charge, OLTC, LTC, tap changer, selecteur, diverter, regleur en charge, commutateur de prises). Sinon isOltc=false. L'OLTC reste un transformer distinct dans "transformers".
- parentSerial : si le rapport relie le changeur a son transformateur (n° de serie/equipement du transformateur parent), mets-le ; sinon null.
- oilType : capte le type d'huile tel qu'ecrit (mineral, mineral inhibe, silicone, ester naturel/vegetal (FR3), ester synthetique (MIDEL), askarel/BPC, etc.) ; sinon null.
Retourne le JSON et rien d'autre.
${ANTI_INJECTION}`;

export class DgaExtractError extends Error {
  status: number; info?: string;
  constructor(message: string, status: number, info?: string) { super(message); this.status = status; this.info = info; }
}

// Appelle Anthropic (cle serveur) pour transformer un PDF (base64) en liste de transformateurs.
// Enregistre la consommation IA sur le tenant (best-effort). NE verifie PAS le budget (a la charge
// de l'appelant). Renvoie toujours un tableau "transformers" normalise.
export async function extractDgaFromPdf(pdfBase64: string, tenant: string): Promise<{ transformers: any[] }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new DgaExtractError('IA non configuree (ANTHROPIC_API_KEY absente).', 503);
  if (!pdfBase64) throw new DgaExtractError('pdfBase64 requis', 400);

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: (process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'),
      max_tokens: 16384, // marge suffisante pour un rapport multi-transformateurs (sinon JSON tronque = transfos perdus)
      messages: [{
        role: 'user',
        content: [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 } },
          { type: 'text', text: PROMPT },
        ],
      }],
    }),
  });
  if (!resp.ok) { const e = await resp.text(); throw new DgaExtractError(`Anthropic ${resp.status}: ${e.slice(0, 300)}`, 502); }
  const data = await resp.json();
  if (tenant) { try { const cost = aiCallCostCents((process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'), data?.usage); if (cost > 0) await recordAiUsage(tenant, 'dga', cost, { feature: 'extract' }); } catch { /* best-effort */ } }

  const text = (data?.content || []).map((b: any) => b?.text || '').join('').trim();
  const jsonStr = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  let parsed: any = null;
  try { parsed = JSON.parse(jsonStr); } catch {
    const m = jsonStr.match(/\{[\s\S]*\}/);
    if (m) { try { parsed = JSON.parse(m[0]); } catch { /* noop */ } }
  }
  if (!parsed) throw new DgaExtractError('Reponse IA non parsable', 422, text.slice(0, 500));

  let transformers: any[] = [];
  if (Array.isArray(parsed.transformers)) transformers = parsed.transformers;
  else if (parsed.equipment || parsed.measurements) transformers = [{ equipment: parsed.equipment || {}, measurements: parsed.measurements || [] }];
  transformers = transformers.filter((t: any) => t && (t.equipment || t.measurements));
  return { transformers };
}

// ───────────────────────── Mappage (identique au client) ─────────────────────────
function mapEquip(eq: any): Record<string, any> {
  const blob = `${eq.apparatusType || ''} ${eq.description || ''} ${eq.identification || ''} ${eq.samplingPoint || ''}`.toLowerCase();
  const isOltc = eq.isOltc === true || /\boltc\b|\bltc\b|changeur de prise|prise sous charge|tap[\s-]?changer|s[ée]lecteur|diverter|r[ée]gleur en charge|commutateur de prise/.test(blob);
  return {
    ident: eq.identification || eq.equipment || ('Import ' + new Date().toISOString().slice(0, 10)),
    client: eq.location || '', serie: eq.serialNo || '', company: eq.company || '', contact: eq.contact || '', email: eq.email || '',
    equip_no: eq.equipNo || '', apparatus: eq.apparatusType || '', description: eq.description || '',
    kv: eq.kvClass ? Number(eq.kvClass) : null, mva: eq.maxMVA ? Number(eq.maxMVA) : null, oil_vol: eq.oilVolumeL ? Number(eq.oilVolumeL) : null,
    oil_type: eq.oilType || '', manufacturer: eq.manufacturer || '', year: eq.year ? String(eq.year) : '', sample_point: eq.samplingPoint || '',
    extra: { ...(isOltc ? { is_oltc: true } : {}), ...(eq.parentSerial ? { parent_serie: String(eq.parentSerial) } : {}) },
  };
}
function mapMeasure(mm: any): Record<string, any> {
  const oil_quality: Record<string, any> = {};
  (OIL_FIELDS as any[]).forEach(f => { if (mm[f.key] != null) oil_quality[f.key] = f.text ? String(mm[f.key]) : Number(mm[f.key]); });
  (FURAN_FIELDS as any[]).forEach(f => { if (mm[f.key] != null) oil_quality[f.key] = Number(mm[f.key]); });
  // Gaz NON mesuré (absent du fichier) -> null (pas 0), pour ne pas fausser tendances/condition.
  const ng = (v: any) => (v == null || v === '' || isNaN(Number(v)) ? null : Number(v));
  return {
    sample_date: mm.date || null,
    h2: ng(mm.H2), ch4: ng(mm.CH4), c2h6: ng(mm.C2H6), c2h4: ng(mm.C2H4), c2h2: ng(mm.C2H2), co: ng(mm.CO), co2: ng(mm.CO2),
    o2: mm.O2 != null ? num(mm.O2) : null, n2: mm.N2 != null ? num(mm.N2) : null, oil_quality,
  };
}

export interface ImportResult { created: number; merged: number; measures: number; dossierIds: string[]; idents: string[]; }

// Importe une liste de transformateurs (sortie d'extractDgaFromPdf) dans Supabase via service_role.
// autoCreate=false : ne cree PAS de nouveau transformateur (n'ajoute des mesures qu'aux existants).
export async function importTransformers(tenant: string, transformers: any[], opts: { autoCreate?: boolean } = {}): Promise<ImportResult> {
  const autoCreate = opts.autoCreate !== false;
  const { data: existing } = await supabaseAdmin.from('dga_dossiers').select('id,ident,serie,updated_at,created_at').eq('tenant_id', tenant);
  const dossiers: any[] = existing || [];

  const ts = (d: any) => Date.parse(d?.updated_at || d?.created_at || '') || 0;
  const mostRecent = (list: any[]) => [...list].sort((a, b) => ts(b) - ts(a))[0];
  // Le N° DE SERIE fait foi : meme si le nom de la compagnie/identification change, on fusionne dans
  // la fiche existante du meme n° de serie — et s'il y en a plusieurs, dans la PLUS RECENTE.
  const match = (eq: any): any | null => {
    const serie = normf(eq.serialNo);
    if (serie) { const c = dossiers.filter(d => normf(d.serie) === serie); if (c.length) return mostRecent(c); }
    const name = normf(eq.identification || eq.equipment);
    if (name) { const c = dossiers.filter(d => normf(d.ident) === name); if (c.length) return mostRecent(c); }
    return null;
  };

  let created = 0, merged = 0, measures = 0; const dossierIds: string[] = []; const idents: string[] = [];
  for (const t of transformers) {
    const rawEq = t.equipment || {};
    const eq = mapEquip(rawEq);
    const measuresN = (t.measurements || []).map(mapMeasure);
    let m = match(rawEq);
    // GARDE ANTI-DOUBLON : si le cache en memoire ne trouve rien, on RE-VERIFIE en base juste avant
    // de creer. Capte un dossier cree par un POST/une relance precedente du MEME courriel -> on
    // fusionne au lieu de creer un doublon.
    if (!m && autoCreate) { const fresh = await findExistingDossier(tenant, rawEq); if (fresh) m = fresh; }
    let did: string;

    if (m?.id) {
      did = m.id;
      measures += await mergeIntoDossier(tenant, did, eq, measuresN);
      merged++;
    } else {
      if (!autoCreate) continue; // auto-creation desactivee : on ignore les transformateurs inconnus
      const ins: any = { ...eq, tenant_id: tenant, updated_at: new Date().toISOString() };
      const { data: row, error } = await supabaseAdmin.from('dga_dossiers').insert(ins).select('id,ident,serie').single();
      if (error || !row) throw new Error(error?.message || 'Echec creation du transformateur');
      did = row.id; dossiers.push(row); created++;
      measures += await insertMeasures(tenant, did, measuresN);
    }
    // Nouveaux résultats reçus par courriel -> « à traiter » (drapeau manuel persistant).
    // Best-effort : si la colonne `treated` n'existe pas encore (migration 154), l'erreur est ignorée.
    await supabaseAdmin.from('dga_dossiers').update({ treated: false }).eq('id', did);
    dossierIds.push(did); idents.push(eq.ident);
  }
  return { created, merged, measures, dossierIds, idents };
}

// Recherche FRAICHE en base d'un dossier correspondant (n° de serie d'abord, puis nom), insensible
// a la casse. Sert de garde anti-doublon au-dela du cache en memoire (POST/relances multiples).
async function findExistingDossier(tenant: string, rawEq: any): Promise<{ id: string } | null> {
  const esc = (s: string) => s.replace(/[%_]/g, '\\$&'); // neutralise les jokers ilike
  const serie = (rawEq.serialNo || '').toString().trim();
  if (serie) {
    const { data } = await supabaseAdmin.from('dga_dossiers').select('id').eq('tenant_id', tenant).ilike('serie', esc(serie)).order('updated_at', { ascending: false }).limit(1);
    if (data && data.length) return data[0] as any;
  }
  const name = (rawEq.identification || rawEq.equipment || '').toString().trim();
  if (name) {
    const { data } = await supabaseAdmin.from('dga_dossiers').select('id').eq('tenant_id', tenant).ilike('ident', esc(name)).order('updated_at', { ascending: false }).limit(1);
    if (data && data.length) return data[0] as any;
  }
  return null;
}

// Fusionne dans un dossier existant : complete les champs vides (jamais d'ecrasement) + ajoute les
// mesures dont la date n'existe pas deja. Renvoie le nombre de mesures ajoutees.
async function mergeIntoDossier(tenant: string, did: string, eq: any, measuresN: any[]): Promise<number> {
  const { data: full } = await supabaseAdmin.from('dga_dossiers').select('*').eq('id', did).maybeSingle();
  const patch: any = { ...(full || {}) };
  for (const k of Object.keys(eq)) { if (patch[k] == null || patch[k] === '') patch[k] = eq[k]; }
  delete patch.id; patch.updated_at = new Date().toISOString();
  await supabaseAdmin.from('dga_dossiers').update(patch).eq('id', did);
  const { data: exM } = await supabaseAdmin.from('dga_measures').select('sample_date').eq('tenant_id', tenant).eq('dossier_id', did);
  const seen = new Set((exM || []).map((x: any) => x.sample_date).filter(Boolean));
  const toAdd = measuresN.filter((mm: any) => !mm.sample_date || !seen.has(mm.sample_date));
  return insertMeasures(tenant, did, toAdd);
}

// Insere des mesures avec diagnostic IEEE/Duval calcule (source='email'). Renvoie le nombre insere.
async function insertMeasures(tenant: string, dossierId: string, measures: any[]): Promise<number> {
  let n = 0;
  for (const mm of measures) {
    const gas: GasInput = { h2: num(mm.h2), ch4: num(mm.ch4), c2h6: num(mm.c2h6), c2h4: num(mm.c2h4), c2h2: num(mm.c2h2), co: num(mm.co), co2: num(mm.co2) };
    const dg = diagnoseFull(gas);
    // seen=false : signale le resultat comme « nouveau » a valider par le tenant (badge sur la carte).
    const payload: any = { ...mm, tenant_id: tenant, dossier_id: dossierId, tdcg: dg.tdcg, condition: dg.condition, duval: dg.duval, fault: dg.fault.fr, methods: dg.methods, source: 'email', seen: false };
    delete payload.id;
    const { error } = await supabaseAdmin.from('dga_measures').insert(payload);
    if (!error) n++;
  }
  return n;
}
