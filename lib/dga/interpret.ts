// ============================================================================
// INTERPRÉTATION DGA + NOTE GLOBALE — repris À L'IDENTIQUE du prototype dga-oil-app.jsx
// (interpret ~l.412, globalAnalysis ~l.513). `lang` en paramètre ; clés de gaz en minuscules.
// AUCUNE phrase ni seuil modifié.
// ============================================================================

export interface Cur { c2h2?: number; co?: number; co2?: number; tdcg?: number; oil_quality?: any; }
export interface Zone { code: string; label: string; }
export interface InterpItem { lvl: 'crit' | 'warn' | 'info'; txt: string; }
export interface InterpReco { title: string; steps: string[]; }

export function interpret(cur: Cur, prev: Cur | null, zone: Zone, worst: number, lang: 'fr' | 'en' = 'fr', isOltc = false): { items: InterpItem[]; reco: InterpReco } {
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
