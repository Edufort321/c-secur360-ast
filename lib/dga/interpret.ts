// ============================================================================
// INTERPRÉTATION DGA + NOTE GLOBALE — repris À L'IDENTIQUE du prototype dga-oil-app.jsx
// (interpret ~l.412, globalAnalysis ~l.513). `lang` en paramètre ; clés de gaz en minuscules.
// AUCUNE phrase ni seuil modifié.
// ============================================================================

export interface Cur { c2h2?: number; co?: number; co2?: number; tdcg?: number; oil_quality?: any; }
export interface Zone { code: string; label: string; }
export interface InterpItem { lvl: 'crit' | 'warn' | 'info'; txt: string; }
export interface InterpReco { title: string; steps: string[]; }

export function interpret(cur: Cur, prev: Cur | null, zone: Zone, worst: number, lang: 'fr' | 'en' = 'fr'): { items: InterpItem[]; reco: InterpReco } {
  const items: InterpItem[] = [];
  const EN = lang === 'en';
  const C2H2 = Number(cur.c2h2) || 0, CO = Number(cur.co) || 0, CO2 = Number(cur.co2) || 0, TDCG = Number(cur.tdcg) || 0;

  if (C2H2 > 35) items.push({ lvl: 'crit', txt: EN ? `Acetylene at ${C2H2} ppm — beyond the IEEE critical limit (35 ppm). Signature of a high-energy fault (electrical arc). Dominant anomaly.` : `Acétylène à ${C2H2} ppm — au-delà du seuil critique IEEE (35 ppm). Signature d'un défaut à haute énergie (arc électrique). Anomalie dominante.` });
  else if (C2H2 > 9) items.push({ lvl: 'warn', txt: EN ? `Acetylene at ${C2H2} ppm: discharges present. Monitor.` : `Acétylène à ${C2H2} ppm : présence de décharges. À surveiller.` });
  if (['D1', 'D2', 'DT'].includes(zone.code)) items.push({ lvl: 'crit', txt: EN ? `Duval Triangle: zone ${zone.code} (${zone.label}). Consistent with an active or recurring internal arc.` : `Triangle de Duval : zone ${zone.code} (${zone.label}). Cohérent avec un arc interne actif ou récurrent.` });
  else if (['T2', 'T3'].includes(zone.code)) items.push({ lvl: 'warn', txt: EN ? `Duval: thermal fault (${zone.label}) — hot spot likely.` : `Duval : défaut thermique (${zone.label}) — point chaud probable.` });
  else if (zone.code === 'T1') items.push({ lvl: 'info', txt: EN ? `Duval: ${zone.label}. Moderate heating.` : `Duval : ${zone.label}. Échauffement modéré.` });
  else if (zone.code === 'PD') items.push({ lvl: 'warn', txt: EN ? `Duval: ${zone.label}. Check insulation.` : `Duval : ${zone.label}. Vérifier l'isolation.` });
  if (prev) {
    const pC2H2 = Number(prev.c2h2) || 0; const dC = C2H2 - pC2H2;
    if (Math.abs(dC) < 30 && C2H2 > 100) items.push({ lvl: 'info', txt: EN ? `Acetylene stable (${pC2H2} → ${C2H2} ppm): fault likely stabilized/extinguished, high residual gas.` : `Acétylène stable (${pC2H2} → ${C2H2} ppm) : défaut probablement stabilisé/éteint, gaz résiduel élevé.` });
    else if (dC > 50) items.push({ lvl: 'crit', txt: EN ? `Acetylene rising (+${dC.toFixed(0)} ppm) — fault STILL ACTIVE. Priority intervention.` : `Acétylène en hausse (+${dC.toFixed(0)} ppm) — défaut TOUJOURS ACTIF. Intervention prioritaire.` });
  }
  if (CO > 570 || CO2 > 4000) items.push({ lvl: 'warn', txt: EN ? `CO (${CO}) / CO₂ (${CO2}) high: possible cellulose degradation. CO₂/CO ≈ ${CO ? (CO2 / CO).toFixed(1) : '—'}.` : `CO (${CO}) / CO₂ (${CO2}) élevés : dégradation possible de la cellulose. Ratio CO₂/CO ≈ ${CO ? (CO2 / CO).toFixed(1) : '—'}.` });
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
