// ============================================================================
// INTERPRÉTATION DGA + NOTE GLOBALE — repris À L'IDENTIQUE du prototype dga-oil-app.jsx
// (interpret ~l.412, globalAnalysis ~l.513). `lang` en paramètre ; clés de gaz en minuscules.
// AUCUNE phrase ni seuil modifié.
// ============================================================================

import {
  transformerType, o2n2Ratio, threshold90, overThreshold, co2coRatio, co2coInterpretation,
  generationRatePerDay, canConcludeStabilized, STANDARD_EDITION, type SampleLite,
} from './severity2019';

export interface Cur { c2h2?: number; c2h4?: number; co?: number; co2?: number; tdcg?: number; o2?: number; n2?: number; sample_date?: string; oil_quality?: any; }
export interface Zone { code: string; label: string; }
export interface InterpItem { lvl: 'crit' | 'warn' | 'info'; txt: string; }
export interface InterpReco { title: string; steps: string[]; }

export function interpret(cur: Cur, prev: Cur | null, zone: Zone, worst: number, lang: 'fr' | 'en' = 'fr', isOltc = false, samples?: SampleLite[]): { items: InterpItem[]; reco: InterpReco } {
  const items: InterpItem[] = [];
  const EN = lang === 'en';
  const C2H2 = Number(cur.c2h2) || 0, CO = Number(cur.co) || 0, CO2 = Number(cur.co2) || 0, TDCG = Number(cur.tdcg) || 0;

  // ── CHANGEUR DE PRISES (OLTC) : grille C57.139 / CIGRE 443 — l'arc de commutation est NORMAL,
  //    on n'applique PAS les seuils de cuve. On juge par ratio C2H2/C2H4, profil thermique (coking) et tendance.
  if (isOltc) {
    const C2H4 = Number((cur as any).c2h4) || 0;
    const ratio = C2H4 > 0 ? C2H2 / C2H4 : null; // < ~0.3 = profil thermique dominant (échauffement/coking)
    items.push({ lvl: 'info', txt: EN
      ? 'OLTC compartment: switching-arc gases (C₂H₂, C₂H₄, H₂) are expected here. Interpreted per IEEE C57.139 / CIGRE 443 (ratios + trend per operations), NOT tank thresholds.'
      : "Compartiment OLTC : les gaz d'arc de commutation (C₂H₂, C₂H₄, H₂) sont attendus. Interprétation selon IEEE C57.139 / CIGRE 443 (ratios + tendance par opérations), PAS les seuils de cuve." });
    if (C2H4 > 0 && ratio != null && ratio < 0.3 && C2H4 > 100) items.push({ lvl: 'warn', txt: EN
      ? `Thermal profile dominant (C₂H₂/C₂H₄ ≈ ${ratio.toFixed(2)}, low): possible contact overheating / coking. Recommend internal inspection of contacts and dynamic resistance (DRM).`
      : `Profil thermique dominant (C₂H₂/C₂H₄ ≈ ${ratio.toFixed(2)}, bas) : possible échauffement / coking des contacts. Inspection interne des contacts et résistance dynamique (DRM) recommandées.` });
    if (prev) {
      const pC2H2 = Number(prev.c2h2) || 0, pC2H4 = Number((prev as any).c2h4) || 0;
      if ((C2H2 - pC2H2) > 200 || (C2H4 - pC2H4) > 200) items.push({ lvl: 'warn', txt: EN
        ? 'Sharp rise in switching gases beyond the usual per-operation trend — correlate with operation count; investigate if not explained by switching activity.'
        : "Hausse marquée des gaz de commutation au-delà de la tendance habituelle par opération — corréler au nombre d'opérations ; investiguer si non expliqué par l'activité de commutation." });
    }
    if (CO > 570 || CO2 > 4000) items.push({ lvl: 'info', txt: EN
      ? `CO/CO₂ present (${CO}/${CO2}) — minor cellulose in OLTC; usually less significant than in the tank.`
      : `CO/CO₂ présents (${CO}/${CO2}) — cellulose limitée dans l'OLTC ; généralement moins significatif que dans la cuve.` });
    const oltcReco: InterpReco = { title: EN ? 'OLTC — RECOMMENDED ACTION' : 'OLTC — ACTION RECOMMANDÉE', steps: EN ? [
      'Compare against operation count and the manufacturer maintenance schedule.',
      'On abnormal thermal/coking signature: internal inspection of selector/diverter contacts + dynamic contact resistance (DRM).',
      'Check the tank↔OLTC barrier/seal for cross-contamination.',
      'OLTC oil filtration/replacement and infrared thermography as warranted.'] : [
      'Comparer au nombre d\'opérations et au programme de maintenance du fabricant.',
      'Si signature thermique / coking anormale : inspection interne des contacts sélecteur/déviateur + résistance dynamique de contact (DRM).',
      'Vérifier le joint/barrière cuve↔OLTC (contamination croisée).',
      'Filtration/remplacement de l\'huile OLTC et thermographie infrarouge au besoin.'] };
    return { items, reco: oltcReco };
  }

  // ── Type de transfo (scellé/respirant) via O₂/N₂ → choix des SEUILS 2019 (étape AVANT l'évaluation).
  const ttype = transformerType(cur.o2, cur.n2);
  const ratioON = o2n2Ratio(cur.o2, cur.n2);
  if (ratioON != null) items.push({ lvl: 'info', txt: EN
    ? `Transformer type: ${ttype === 'sealed' ? 'sealed' : 'free-breathing'} (O₂/N₂ ≈ ${ratioON.toFixed(2)}). Severity thresholds per ${STANDARD_EDITION}.`
    : `Type : ${ttype === 'sealed' ? 'scellé' : 'respirant'} (O₂/N₂ ≈ ${ratioON.toFixed(2)}). Seuils de sévérité selon ${STANDARD_EDITION}.` });
  const c2h2Over = overThreshold(C2H2, 'c2h2', ttype);
  const c2h2Thr = threshold90('c2h2', ttype);
  if (c2h2Over != null && c2h2Over > 1) items.push({ lvl: c2h2Over >= 10 ? 'crit' : 'warn', txt: EN
    ? `Acetylene ${C2H2} ppm = ${Math.round(c2h2Over)}× the 90th-percentile threshold (${c2h2Thr} ppm, ${ttype}). High-energy fault (arc) signature.`
    : `Acétylène ${C2H2} ppm = ${Math.round(c2h2Over)}× le seuil 90e percentile (${c2h2Thr} ppm, ${ttype === 'sealed' ? 'scellé' : 'respirant'}). Signature d'un défaut à haute énergie (arc).` });
  else if (C2H2 > 9) items.push({ lvl: 'warn', txt: EN ? `Acetylene at ${C2H2} ppm: discharges present. Monitor.` : `Acétylène à ${C2H2} ppm : présence de décharges. À surveiller.` });
  if (['D1', 'D2', 'DT'].includes(zone.code)) items.push({ lvl: 'crit', txt: EN ? `Duval Triangle: zone ${zone.code} (${zone.label}). Consistent with an active or recurring internal arc.` : `Triangle de Duval : zone ${zone.code} (${zone.label}). Cohérent avec un arc interne actif ou récurrent.` });
  else if (['T2', 'T3'].includes(zone.code)) items.push({ lvl: 'warn', txt: EN ? `Duval: thermal fault (${zone.label}) — hot spot likely.` : `Duval : défaut thermique (${zone.label}) — point chaud probable.` });
  else if (zone.code === 'T1') items.push({ lvl: 'info', txt: EN ? `Duval: ${zone.label}. Moderate heating.` : `Duval : ${zone.label}. Échauffement modéré.` });
  else if (zone.code === 'PD') items.push({ lvl: 'warn', txt: EN ? `Duval: ${zone.label}. Check insulation.` : `Duval : ${zone.label}. Vérifier l'isolation.` });
  if (prev) {
    const pC2H2 = Number(prev.c2h2) || 0; const dC = C2H2 - pC2H2;
    // Taux de génération C₂H₂ (ppm/jour) — distingue défaut ACTIF d'un défaut historique.
    const rate = (cur.sample_date && prev.sample_date) ? generationRatePerDay(pC2H2, prev.sample_date, C2H2, cur.sample_date) : null;
    const rateTxt = rate != null ? (EN ? ` — ${rate.toFixed(1)} ppm/day` : ` — ${rate.toFixed(1)} ppm/jour`) : '';
    if (dC > 50) {
      // Hausse marquée : on NE conclut PAS « stabilisé ». Ré-échantillonnage requis (pas de point après le saut).
      items.push({ lvl: 'crit', txt: EN
        ? `Acetylene rising (+${dC.toFixed(0)} ppm${rateTxt}) — high-energy fault signature. With no measurement AFTER the jump, the recent trend cannot be established: immediate re-sampling required. Do NOT conclude stabilized.`
        : `Acétylène en hausse (+${dC.toFixed(0)} ppm${rateTxt}) — signature d'un défaut à haute énergie. Sans mesure APRÈS le saut, la tendance récente ne peut être établie : ré-échantillonnage immédiat requis. NE PAS conclure à une stabilisation.` });
    } else if (Math.abs(dC) < 30 && C2H2 > 100) {
      // « Stabilisé » UNIQUEMENT avec ≥ 2 points après le dernier saut (sinon non concluant → ré-échantillonner).
      if (samples && canConcludeStabilized(samples, 50)) {
        items.push({ lvl: 'info', txt: EN ? `Acetylene stable (${pC2H2} → ${C2H2} ppm) over ≥2 post-jump points: fault likely stabilized, high residual gas.` : `Acétylène stable (${pC2H2} → ${C2H2} ppm) sur ≥2 points après le saut : défaut probablement stabilisé, gaz résiduel élevé.` });
      } else {
        items.push({ lvl: 'warn', txt: EN ? `Acetylene high and flat (${pC2H2} → ${C2H2} ppm) but too few points after the jump to confirm stabilization — re-sample to confirm.` : `Acétylène élevé et plat (${pC2H2} → ${C2H2} ppm) mais trop peu de points après le saut pour confirmer une stabilisation — ré-échantillonner.` });
      }
    }
  }
  // CO₂/CO — implication du PAPIER (cellulose) selon le ratio (IEC 60599).
  const coR = co2coRatio(CO2, CO);
  if (coR != null && (CO > 570 || CO2 > 4000 || coR < 3 || coR > 11)) {
    const interp = co2coInterpretation(coR, lang);
    items.push({ lvl: (coR < 3 || coR > 11) ? 'warn' : 'info', txt: `CO₂/CO ≈ ${coR.toFixed(2)} — ${interp}.` });
  }
  if (TDCG > 4630) items.push({ lvl: 'crit', txt: EN ? `TDCG at ${TDCG} ppm: Condition 4. Risk of imminent failure.` : `TDCG à ${TDCG} ppm : Condition 4. Risque de défaillance imminente.` });
  else if (TDCG > 1920) items.push({ lvl: 'warn', txt: EN ? `TDCG at ${TDCG} ppm: Condition 3. Abnormal gas generation.` : `TDCG à ${TDCG} ppm : Condition 3. Génération de gaz anormale.` });
  if (items.length === 0) items.push({ lvl: 'info', txt: EN ? 'No significant DGA anomaly detected.' : 'Aucune anomalie DGA significative détectée.' });

  let reco: InterpReco;
  if (worst >= 3 || ['D1', 'D2'].includes(zone.code)) {
    reco = { title: EN ? 'RECOMMENDED ACTION — PRIORITY' : 'ACTION RECOMMANDÉE — PRIORITAIRE', steps: EN ? [
      'Monthly DGA sampling (ideally online monitoring).',
      'De-energized electrical tests: turns ratio, winding resistance, power factor / tan δ, FRA.',
      'Inspect the on-load tap changer (OLTC) — frequent C₂H₂ source.',
      'Consider a planned outage if the fault becomes active again.'] : [
      'Échantillonnage DGA mensuel (idéalement monitoring en ligne).',
      'Essais électriques hors tension : rapport de transformation, résistance d\'enroulement, facteur de puissance / tan δ, FRA.',
      'Inspecter le changeur de prises (OLTC) — cause fréquente de C₂H₂.',
      'Évaluer une mise hors service planifiée si le défaut redevient actif.'] };
  } else if (worst === 2 || ['T2', 'T3', 'DT', 'PD'].includes(zone.code)) {
    reco = { title: EN ? 'RECOMMENDED ACTION — CLOSE MONITORING' : 'ACTION RECOMMANDÉE — SURVEILLANCE RAPPROCHÉE', steps: EN ? [
      'DGA sampling every 1 to 3 months.', 'Check load and cooling.', 'Thermography of connections.'] : [
      'Échantillonnage DGA tous les 1 à 3 mois.', 'Vérifier charge et refroidissement.', 'Thermographie des connexions.'] };
  } else {
    reco = { title: EN ? 'RECOMMENDED ACTION — NORMAL FOLLOW-UP' : 'ACTION RECOMMANDÉE — SUIVI NORMAL', steps: EN ? [
      'Standard periodic sampling.', 'Confirm stability at next measurement.'] : [
      'Échantillonnage périodique standard.', 'Confirmer la stabilité à la prochaine mesure.'] };
  }
  return { items, reco };
}

export function globalAnalysis(cur: Cur, oilEval: { status: string }[], furan: any, worst: number, lang: 'fr' | 'en' = 'fr'): { main: string; anti: string | null } {
  const EN = lang === 'en';
  const C2H2 = Number(cur.c2h2) || 0;
  const oilBad = oilEval.filter(o => o.status === 'poor').length;
  const oilFair = oilEval.filter(o => o.status === 'fair').length;
  let main: string;
  if (worst >= 3 || C2H2 > 35) {
    main = EN ? 'Dissolved gases indicate an abnormal condition consistent with an internal fault. Further investigation is recommended.' : 'Les gaz dissous indiquent une condition anormale compatible avec un défaut interne. Une investigation complémentaire est recommandée.';
  } else if (worst === 2 || oilBad > 0) {
    main = EN ? 'Dissolved gases, water content and physical properties are within acceptable limits except for a few parameters to monitor.' : "Les gaz dissous, le contenu d'eau et les propriétés physiques sont à l'intérieur des limites acceptables à l'exception de quelques paramètres à surveiller.";
  } else {
    main = EN ? 'Dissolved gases, water content and physical properties are within acceptable limits.' : "Les gaz dissous, le contenu d'eau et les propriétés physiques sont à l'intérieur des limites acceptables.";
  }
  const reco = (worst >= 3 || C2H2 > 35)
    ? (EN ? 'We recommend repeating the analyses without delay.' : 'Nous vous recommandons de refaire les analyses sans délai.')
    : (EN ? 'We recommend repeating the analyses within one year.' : 'Nous vous recommandons de refaire les analyses dans un an.');
  let anti: string | null = null;
  const dbpc = cur.oil_quality?.dbpc;
  if (dbpc != null) {
    anti = Number(dbpc) >= 0.1
      ? (EN ? 'Antioxidant concentration is normal. We recommend repeating an analysis within five years.' : "La concentration d'antioxydant est normale. Nous vous recommandons de refaire une analyse dans cinq ans.")
      : (EN ? 'Antioxidant concentration is low; re-inhibition should be considered.' : "La concentration d'antioxydant est faible; une recharge devrait être envisagée.");
  }
  // oilFair référencé pour cohérence avec le prototype (pas de branche distincte ici).
  void oilFair;
  return { main: `${main} ${reco}`, anti };
}
