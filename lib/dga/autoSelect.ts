// Moteur d'AUTO-SÉLECTION DGA — arbre de décision déterministe (pas de LLM, 100% reproductible).
// Choisit la méthode PRIMAIRE par règles fixes selon le type de défaut (Triangle 1), agrège le consensus,
// expose les désaccords, et rend un verdict ferme + niveau de confiance + mention de validation.
// Triangle 4/5 et Pentagone sont appelés s'ils existent ; sinon ignorés proprement.
import { keyGasMethod, doernenburg, rogers, iec60599, co2coRatio, faultFamily, type DGAGases, type MethodResult } from './methods';
import { classifyTriangle1 } from './triangle1';

type OptionalClassifier = ((g: DGAGases) => MethodResult) | null;
const classifyTriangle4: OptionalClassifier = null;
const classifyTriangle5: OptionalClassifier = null;
const classifyPentagon1: OptionalClassifier = null;

export type AutoDiagnosis = {
  reliable: boolean; warning: string | null;
  transformerType: 'sealed' | 'free-breathing' | 'unknown';
  primaryMethod: string; primaryReason: string;
  verdict: { fault: string | null; family: string | null; label: string; confidence: 'élevée' | 'moyenne' | 'faible'; needsValidation: boolean };
  consensus: { agreement: number; dominantFamily: string | null; methods: MethodResult[]; disagreement: string[]; nonConclusive: string[] };
  optionalMethods: MethodResult[];
};

const IEEE_THRESHOLDS: Record<string, number> = { H2: 100, CH4: 120, C2H6: 65, C2H4: 50, C2H2: 1, CO: 350 };
const FAMILY_LABEL: Record<string, string> = {
  arc: 'Arc / décharge à haute énergie', thermique: 'Défaut thermique', pd: 'Décharges partielles',
  papier: 'Dégradation du papier (cellulose)', normal: 'Aucun défaut significatif', autre: 'Indéterminé',
};

export function autoDiagnose(g: DGAGases): AutoDiagnosis {
  const reliable = Object.entries(IEEE_THRESHOLDS).some(([gas, lim]) => ((g as any)[gas] ?? 0) >= lim);

  let transformerType: AutoDiagnosis['transformerType'] = 'unknown';
  if ((g as any).O2 != null && (g as any).N2 != null && (g as any).N2 > 0) {
    transformerType = (g as any).O2 / (g as any).N2 <= 0.2 ? 'sealed' : 'free-breathing';
  }

  const t1 = classifyTriangle1(g as any);
  const t1Family = faultFamily(t1?.fault ?? null);

  let primaryMethod = 'Duval Triangle 1';
  let primaryReason = 'Méthode générale par défaut.';
  let primaryResult: MethodResult = { method: 'Duval Triangle 1', fault: t1?.fault ?? null, label: t1?.label ?? 'n/a', valid: t1 != null, confidence: 'moyenne' };

  if (t1Family === 'arc') {
    if (classifyPentagon1) { const p = (classifyPentagon1 as any)(g); if (p.valid) { primaryMethod = 'Duval Pentagone 1'; primaryReason = 'Défaut électrique : pentagone 5 gaz plus discriminant.'; primaryResult = p; } }
    else primaryReason = "Défaut électrique (arc) : Triangle 1 fait foi (Triangles 4/5 ne traitent pas l'arc).";
  } else if (t1Family === 'thermique') {
    if ((t1?.fault === 'T2' || t1?.fault === 'T3') && classifyTriangle5) { const r = (classifyTriangle5 as any)(g); if (r.valid) { primaryMethod = 'Duval Triangle 5'; primaryReason = 'Défaut thermique haute T : Triangle 5 départage huile/papier.'; primaryResult = r; } }
    else if ((t1?.fault === 'T1' || t1?.fault === 'T2') && classifyTriangle4) { const r = (classifyTriangle4 as any)(g); if (r.valid) { primaryMethod = 'Duval Triangle 4'; primaryReason = 'Défaut thermique basse T : Triangle 4 précise le sous-type.'; primaryResult = r; } }
  } else if (t1Family === 'pd') {
    if (classifyTriangle4) { const r = (classifyTriangle4 as any)(g); if (r.valid) { primaryMethod = 'Duval Triangle 4'; primaryReason = 'Décharges partielles : Triangle 4 précise le sous-type.'; primaryResult = r; } }
  }

  const all: MethodResult[] = [primaryResult, keyGasMethod(g), doernenburg(g), rogers(g), iec60599(g), co2coRatio(g)];
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
    warning: reliable ? null : 'Gaz sous les seuils IEEE Table 1 — diagnostic non fiable, re-test recommandé.',
    transformerType, primaryMethod, primaryReason,
    verdict: { fault: verdictFault, family: verdictFamily, label: verdictFamily ? FAMILY_LABEL[verdictFamily] : 'Indéterminé', confidence, needsValidation: true },
    consensus: { agreement, dominantFamily, methods, disagreement, nonConclusive },
    optionalMethods: methods.filter(m => m.method !== primaryMethod),
  };
}
