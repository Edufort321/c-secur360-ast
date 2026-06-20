// Moteur d'AUTO-SÉLECTION DGA — arbre de décision déterministe (pas de LLM, 100% reproductible). BILINGUE.
// Choisit la méthode PRIMAIRE par règles fixes selon le type de défaut (Triangle 1), agrège le consensus,
// expose les désaccords, et rend un verdict ferme + niveau de confiance + mention de validation.
// Triangle 4/5 et Pentagone sont appelés s'ils existent ; sinon ignorés proprement.
import { keyGasMethod, doernenburg, rogers, iec60599, co2coRatio, faultFamily, type DGAGases, type MethodResult, type Lang } from './methods';
import { classifyTriangle1 } from './triangle1';
import { classifyTriangle4 as rawT4, type Fault4 } from './triangle4';
import { classifyTriangle5 as rawT5, t5Validated, type Fault5 as RawT5Fault } from './triangle5';

type OptionalClassifier = ((g: DGAGases, lang: Lang) => MethodResult) | null;

// Triangle 4 (basse-T / PD) : on mappe le sous-type vers un code « famille » pour le consensus.
//   PD → pd · O (surchauffe) → thermique · C (carbonisation papier) → papier · S (gazage parasite) → bénin.
const T4_PROXY: Record<Fault4, string> = { PD: 'PD', O: 'T1', C: 'PAP', S: 'N' };
const classifyTriangle4: OptionalClassifier = (g, lang = 'fr') => {
  const r = rawT4(g as any);
  const method = 'Duval Triangle 4';
  if (!r) return { method, fault: null, label: 'n/a', valid: false };
  const validSuffix = r.placeholder ? (lang === 'en' ? ' (boundaries to validate)' : ' (frontières à valider)') : '';
  return {
    method, fault: T4_PROXY[r.fault], valid: true, confidence: 'moyenne',
    label: (lang === 'en' ? r.labelEn : r.label) + validSuffix,
    note: r.fault === 'S' ? (lang === 'en' ? 'Stray gassing of oil — not a true fault.' : "Gazage parasite de l'huile — pas un vrai défaut.") : undefined,
  };
};
// Triangle 5 (haute-T T2/T3) : routé mais DORMANT tant que les frontières ne sont pas validées
// (t5Validated=false → valid:false → n'entre pas dans le verdict). Mappe le sous-type vers une famille.
const T5_PROXY: Record<RawT5Fault, string> = { PD: 'PD', S: 'N', O: 'T1', C: 'PAP', T3: 'T3' };
const classifyTriangle5: OptionalClassifier = (g, lang = 'fr') => {
  const r = rawT5(g as any);
  const method = 'Duval Triangle 5';
  if (!r || !t5Validated()) return { method, fault: null, label: r ? (lang === 'en' ? r.labelEn : r.label) + ' (à valider)' : 'n/a', valid: false };
  return { method, fault: T5_PROXY[r.fault], valid: true, confidence: 'moyenne', label: lang === 'en' ? r.labelEn : r.label };
};
const classifyPentagon1: OptionalClassifier = null;

export type AutoDiagnosis = {
  reliable: boolean; warning: string | null;
  transformerType: 'sealed' | 'free-breathing' | 'unknown';
  primaryMethod: string; primaryReason: string;
  verdict: { fault: string | null; family: string | null; label: string; confidence: 'élevée' | 'moyenne' | 'faible'; needsValidation: boolean };
  consensus: { agreement: number; dominantFamily: string | null; methods: MethodResult[]; disagreement: string[]; nonConclusive: string[] };
  optionalMethods: MethodResult[];
};

const L = (lang: Lang, fr: string, en: string) => (lang === 'en' ? en : fr);
const IEEE_THRESHOLDS: Record<string, number> = { H2: 100, CH4: 120, C2H6: 65, C2H4: 50, C2H2: 1, CO: 350 };
const FAMILY_LABEL = (lang: Lang): Record<string, string> => ({
  arc: L(lang, 'Arc / décharge à haute énergie', 'Arc / high-energy discharge'),
  thermique: L(lang, 'Défaut thermique', 'Thermal fault'),
  pd: L(lang, 'Décharges partielles', 'Partial discharges'),
  papier: L(lang, 'Dégradation du papier (cellulose)', 'Paper degradation (cellulose)'),
  normal: L(lang, 'Aucun défaut significatif', 'No significant fault'),
  autre: L(lang, 'Indéterminé', 'Undetermined'),
});

export function autoDiagnose(g: DGAGases, lang: Lang = 'fr'): AutoDiagnosis {
  const reliable = Object.entries(IEEE_THRESHOLDS).some(([gas, lim]) => ((g as any)[gas] ?? 0) >= lim);

  let transformerType: AutoDiagnosis['transformerType'] = 'unknown';
  if ((g as any).O2 != null && (g as any).N2 != null && (g as any).N2 > 0) {
    transformerType = (g as any).O2 / (g as any).N2 <= 0.2 ? 'sealed' : 'free-breathing';
  }

  const t1 = classifyTriangle1(g as any);
  const t1Family = faultFamily(t1?.fault ?? null);

  let primaryMethod = L(lang, 'Duval Triangle 1', 'Duval Triangle 1');
  let primaryReason = L(lang, 'Méthode générale par défaut.', 'General default method.');
  let primaryResult: MethodResult = { method: primaryMethod, fault: t1?.fault ?? null, label: t1?.label ?? 'n/a', valid: t1 != null, confidence: 'moyenne' };

  if (t1Family === 'arc') {
    if (classifyPentagon1) { const p = (classifyPentagon1 as any)(g); if (p.valid) { primaryMethod = L(lang, 'Duval Pentagone 1', 'Duval Pentagon 1'); primaryReason = L(lang, 'Défaut électrique : pentagone 5 gaz plus discriminant.', 'Electrical fault: 5-gas pentagon is more discriminating.'); primaryResult = p; } }
    else primaryReason = L(lang, "Défaut électrique (arc) : Triangle 1 fait foi (Triangles 4/5 ne traitent pas l'arc).", 'Electrical fault (arc): Triangle 1 prevails (Triangles 4/5 do not handle arcing).');
  } else if (t1Family === 'thermique') {
    if ((t1?.fault === 'T2' || t1?.fault === 'T3') && classifyTriangle5) { const r = classifyTriangle5(g, lang); if (r.valid) { primaryMethod = L(lang, 'Duval Triangle 5', 'Duval Triangle 5'); primaryReason = L(lang, 'Défaut thermique haute T : Triangle 5 départage huile/papier.', 'High-T thermal fault: Triangle 5 separates oil/paper.'); primaryResult = r; } }
    else if ((t1?.fault === 'T1' || t1?.fault === 'T2') && classifyTriangle4) { const r = classifyTriangle4(g, lang); if (r.valid) { primaryMethod = L(lang, 'Duval Triangle 4', 'Duval Triangle 4'); primaryReason = L(lang, 'Défaut thermique basse T : Triangle 4 précise le sous-type.', 'Low-T thermal fault: Triangle 4 refines the subtype.'); primaryResult = r; } }
  } else if (t1Family === 'pd') {
    if (classifyTriangle4) { const r = classifyTriangle4(g, lang); if (r.valid) { primaryMethod = L(lang, 'Duval Triangle 4', 'Duval Triangle 4'); primaryReason = L(lang, 'Décharges partielles : Triangle 4 précise le sous-type.', 'Partial discharges: Triangle 4 refines the subtype.'); primaryResult = r; } }
  }

  const all: MethodResult[] = [primaryResult, keyGasMethod(g, lang), doernenburg(g, lang), rogers(g, lang), iec60599(g, lang), co2coRatio(g, lang)];
  const seen = new Set<string>();
  const methods = all.filter(m => { if (seen.has(m.method)) return false; seen.add(m.method); return true; });

  const valid = methods.filter(m => m.valid && m.fault);
  const votes: Record<string, number> = {};
  valid.forEach(m => { const f = faultFamily(m.fault)!; votes[f] = (votes[f] || 0) + 1; });
  const sorted = Object.entries(votes).sort((a, b) => b[1] - a[1]);
  const dominantFamily = sorted[0]?.[0] ?? null;
  const agreement = sorted[0] ? sorted[0][1] / valid.length : 0;

  const verdictFault = primaryResult.fault ?? null;
  const verdictFamily = faultFamily(verdictFault) ?? dominantFamily;

  let confidence: 'élevée' | 'moyenne' | 'faible';
  if (!reliable) confidence = 'faible';
  else if (agreement >= 0.7 && verdictFamily === dominantFamily) confidence = 'élevée';
  else if (agreement >= 0.5) confidence = 'moyenne';
  else confidence = 'faible';

  const disagreement = valid.filter(m => faultFamily(m.fault) !== verdictFamily).map(m => `${m.method} → ${m.fault}`);
  const nonConclusive = methods.filter(m => m.valid && !m.fault).map(m => m.method);

  return {
    reliable,
    warning: reliable ? null : L(lang, 'Gaz sous les seuils IEEE Table 1 — diagnostic non fiable, re-test recommandé.', 'Gases below IEEE Table 1 thresholds — unreliable diagnosis, re-test recommended.'),
    transformerType, primaryMethod, primaryReason,
    verdict: { fault: verdictFault, family: verdictFamily, label: verdictFamily ? FAMILY_LABEL(lang)[verdictFamily] : L(lang, 'Indéterminé', 'Undetermined'), confidence, needsValidation: true },
    consensus: { agreement, dominantFamily, methods, disagreement, nonConclusive },
    optionalMethods: methods.filter(m => m.method !== primaryMethod),
  };
}
