// ============================================================================
// QUALITÉ D'HUILE + FURANES + TENDANCE — logique reprise À L'IDENTIQUE du prototype
// dga-oil-app.jsx (voltageClass ~l.273, OIL_THRESHOLDS ~l.282 [IEEE C57.106-2015],
// evalOil ~l.338, furanInterpret ~l.394 [modèle Chendong], trendAnalysis ~l.549).
// Seule adaptation : `lang` passé en paramètre (au lieu du global LANG) et clés en minuscules.
// AUCUN seuil ni formule modifié.
// ============================================================================

export type OilStatus = 'good' | 'fair' | 'poor';
export interface OilFinding { status: OilStatus; txt: string; }
export interface OilInput { moisture?: number | null; ift?: number | null; acid?: number | null; dielectric?: number | null; dbd877?: number | null; pf25?: number | null; dbpc?: number | null; pcb?: number | null; }

export function voltageClass(kv: any, lang: 'fr' | 'en' = 'fr') {
  const v = parseFloat(kv);
  const L = (fr: string, en: string) => (lang === 'en' ? en : fr);
  if (!v || isNaN(v)) return { code: 'unk', label: L('classe inconnue', 'unknown class') };
  if (v <= 69) return { code: 'c1', label: L('≤ 69 kV', '≤ 69 kV') };
  if (v <= 230) return { code: 'c2', label: L('69–230 kV', '69–230 kV') };
  return { code: 'c3', label: L('> 230 kV', '> 230 kV') };
}

// IEEE C57.106-2015 — valeurs guides huile en service, par classe.
export const OIL_THRESHOLDS: Record<string, Record<string, [number, number]>> = {
  dielectric: { c1: [23, 28], c2: [28, 32], c3: [30, 35] },   // min : bon si >= fair
  dbd877: { c1: [26, 30], c2: [26, 30], c3: [26, 30] },
  moisture: { c1: [35, 40], c2: [25, 30], c3: [20, 25] },     // max : [good<=, fair<=]
  ift: { c1: [24, 28], c2: [26, 30], c3: [28, 32] },          // min : [poor<, fair<]
  acid: { c1: [0.10, 0.20], c2: [0.10, 0.15], c3: [0.05, 0.10] }, // max
  pf25: { c1: [0.10, 0.50], c2: [0.10, 0.50], c3: [0.05, 0.50] }, // max
};

export function evalOil(o: OilInput, kv: any, lang: 'fr' | 'en' = 'fr'): OilFinding[] {
  const out: OilFinding[] = [];
  const EN = lang === 'en';
  const push = (s: OilStatus, txt: string) => out.push({ status: s, txt });
  const vc = voltageClass(kv).code;
  const cl = vc === 'unk' ? 'c1' : vc;
  const T = (k: string) => OIL_THRESHOLDS[k][cl];

  if (o.moisture != null) {
    const [g, f] = T('moisture');
    if (o.moisture <= g) push('good', EN ? `Moisture ${o.moisture} ppm: acceptable for class ${voltageClass(kv, lang).label}.` : `Humidité ${o.moisture} ppm : acceptable pour la classe ${voltageClass(kv, lang).label}.`);
    else if (o.moisture <= f) push('fair', EN ? `Moisture ${o.moisture} ppm: moderate — monitor.` : `Humidité ${o.moisture} ppm : modérée — surveiller.`);
    else push('poor', EN ? `Moisture ${o.moisture} ppm: high — dielectric risk, consider oil treatment.` : `Humidité ${o.moisture} ppm : élevée — risque diélectrique, envisager un traitement de l'huile.`);
  }
  if (o.ift != null) {
    const [p, f] = T('ift');
    if (o.ift >= f) push('good', EN ? `Interfacial tension ${o.ift} mN/m: oil in good condition.` : `Tension interfaciale ${o.ift} mN/m : huile en bon état.`);
    else if (o.ift >= p) push('fair', EN ? `Interfacial tension ${o.ift} mN/m: early degradation / oxidation.` : `Tension interfaciale ${o.ift} mN/m : début de dégradation / oxydation.`);
    else push('poor', EN ? `Interfacial tension ${o.ift} mN/m: degraded oil (sludge likely).` : `Tension interfaciale ${o.ift} mN/m : huile dégradée (boues probables).`);
  }
  if (o.acid != null) {
    const [g, f] = T('acid');
    if (o.acid <= g) push('good', EN ? `Acid number ${o.acid} mg KOH/g: good condition.` : `Indice d'acidité ${o.acid} mg KOH/g : bon état.`);
    else if (o.acid <= f) push('fair', EN ? `Acid number ${o.acid}: moderate oxidation.` : `Indice d'acidité ${o.acid} : oxydation modérée.`);
    else push('poor', EN ? `Acid number ${o.acid}: advanced oxidation — reclamation recommended.` : `Indice d'acidité ${o.acid} : oxydation avancée — régénération recommandée.`);
  }
  if (o.dielectric != null) {
    const [p, f] = T('dielectric');
    if (o.dielectric >= f) push('good', EN ? `Dielectric breakdown (D1816) ${o.dielectric} kV: good.` : `Rigidité diélectrique (D1816) ${o.dielectric} kV : bonne tenue.`);
    else if (o.dielectric >= p) push('fair', EN ? `Dielectric breakdown ${o.dielectric} kV: marginal.` : `Rigidité diélectrique ${o.dielectric} kV : marginale.`);
    else push('poor', EN ? `Dielectric breakdown ${o.dielectric} kV: low — moisture/particles likely.` : `Rigidité diélectrique ${o.dielectric} kV : faible — humidité/particules probables.`);
  }
  if (o.dbd877 != null) {
    const [p, f] = T('dbd877');
    if (o.dbd877 >= f) push('good', EN ? `Dielectric breakdown (D877) ${o.dbd877} kV: compliant.` : `Rigidité diélectrique (D877) ${o.dbd877} kV : conforme.`);
    else if (o.dbd877 >= p) push('fair', EN ? `Breakdown (D877) ${o.dbd877} kV: marginal.` : `Rigidité (D877) ${o.dbd877} kV : marginale.`);
    else push('poor', EN ? `Breakdown (D877) ${o.dbd877} kV: low.` : `Rigidité (D877) ${o.dbd877} kV : faible.`);
  }
  if (o.pf25 != null) {
    const [g, f] = T('pf25');
    if (o.pf25 <= g) push('good', EN ? `Power factor @25°C ${o.pf25}%: good.` : `Facteur de puissance @25°C ${o.pf25}% : bon.`);
    else if (o.pf25 <= f) push('fair', EN ? `Power factor @25°C ${o.pf25}%: monitor.` : `Facteur de puissance @25°C ${o.pf25}% : à surveiller.`);
    else push('poor', EN ? `Power factor @25°C ${o.pf25}%: high — contamination/oxidation.` : `Facteur de puissance @25°C ${o.pf25}% : élevé — contamination/oxydation.`);
  }
  if (o.dbpc != null && o.dbpc < 0.1) push('fair', EN ? `Oxidation inhibitor DBPC ${o.dbpc}%: low — oil losing antioxidant protection (re-inhibition to consider).` : `Inhibiteur DBPC ${o.dbpc}% : faible — l'huile perd sa protection antioxydante (recharge à considérer).`);
  if (o.pcb != null && o.pcb >= 2) push('poor', EN ? `PCB ${o.pcb} ppm: ≥ 2 ppm — oil considered PCB-contaminated (regulated). Controlled handling/disposal.` : `PCB ${o.pcb} ppm : ≥ 2 ppm — huile considérée contaminée aux BPC (réglementation). Manipulation/élimination contrôlées.`);
  else if (o.pcb != null && o.pcb > 0) push('fair', EN ? `PCB ${o.pcb} ppm: traces detected.` : `PCB ${o.pcb} ppm : traces détectées.`);

  return out;
}

// Furanes → DP (modèle de Chendong). Note : `fal2` en ppm (champ 2-FAL de l'app ; le prototype
// stockait des ppb et divisait par 1000 — ici l'unité de saisie est déjà le ppm).
export function furanInterpret(fal2: number | null | undefined, lang: 'fr' | 'en' = 'fr') {
  const ppm = Number(fal2);
  if (!ppm || ppm <= 0) return null;
  const EN = lang === 'en';
  const dp = (1.51 - Math.log10(ppm)) / 0.0035;
  let state: string, lvl: OilStatus;
  if (dp >= 700) { state = EN ? 'New / healthy insulation' : 'Isolation neuve / saine'; lvl = 'good'; }
  else if (dp >= 450) { state = EN ? 'Normal aging' : 'Vieillissement normal'; lvl = 'good'; }
  else if (dp >= 300) { state = EN ? 'Appreciable aging' : 'Vieillissement appréciable'; lvl = 'fair'; }
  else if (dp >= 200) { state = EN ? 'Advanced aging — end of life approaching' : 'Vieillissement avancé — fin de vie qui approche'; lvl = 'poor'; }
  else { state = EN ? 'End-of-life insulation (brittle paper)' : 'Isolation en fin de vie (papier fragilisé)'; lvl = 'poor'; }
  return { dp: Math.round(dp), fal: ppm, state, lvl };
}

// Tendance (verdict défaut ponctuel/actif/dégradation/amélioration/stable). data = mesures chronologiques.
export interface TrendMeasure { date?: string | null; c2h2?: number; tdcg?: number; }
export function trendAnalysis(data: TrendMeasure[], lang: 'fr' | 'en' = 'fr') {
  const EN = lang === 'en';
  if (data.length < 2) return { verdict: EN ? 'Insufficient data' : 'Données insuffisantes', lvl: 'info' as const, txt: EN ? 'At least 2 samples required.' : 'Au moins 2 prélèvements requis.', detail: [] as string[], jumpDate: null as string | null, maxJump: 0 };

  const series = data.map(d => ({ date: d.date || '', c2h2: Number(d.c2h2) || 0, tdcg: Number(d.tdcg) || 0 }));
  const first = series[0], last = series[series.length - 1];

  let maxJump = 0, jumpIdx = -1;
  for (let i = 1; i < series.length; i++) { const j = series[i].c2h2 - series[i - 1].c2h2; if (j > maxJump) { maxJump = j; jumpIdx = i; } }
  let postStable = true, postRising = false;
  if (jumpIdx >= 0 && jumpIdx < series.length - 1) {
    const base = series[jumpIdx].c2h2 || 1;
    for (let i = jumpIdx + 1; i < series.length; i++) { const rel = (series[i].c2h2 - series[i - 1].c2h2) / base; if (rel > 0.15) postRising = true; if (Math.abs(rel) > 0.25) postStable = false; }
  }
  const n = series.length, xs = series.map((_, i) => i), ys = series.map(s => s.tdcg);
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0; xs.forEach((x, i) => { num += (x - mx) * (ys[i] - my); den += (x - mx) * (x - mx); });
  const slope = den ? num / den : 0;

  const detail = EN ? [
    `Period analyzed: ${first.date} → ${last.date} (${n} samples).`,
    `Acetylene: ${first.c2h2} → ${last.c2h2} ppm.`,
    `TDCG: ${first.tdcg} → ${last.tdcg} ppm (slope ≈ ${slope >= 0 ? '+' : ''}${slope.toFixed(0)} ppm/sample).`,
  ] : [
    `Période analysée : ${first.date} → ${last.date} (${n} prélèvements).`,
    `Acétylène : ${first.c2h2} → ${last.c2h2} ppm.`,
    `TDCG : ${first.tdcg} → ${last.tdcg} ppm (pente ≈ ${slope >= 0 ? '+' : ''}${slope.toFixed(0)} ppm/mesure).`,
  ];

  let verdict: string, lvl: 'good' | 'fair' | 'crit', txt: string;
  const bigJump = maxJump > 100;
  if (bigJump && jumpIdx >= 0 && postStable && !postRising) {
    verdict = EN ? 'One-off fault — now stabilized' : 'Défaut ponctuel — désormais stabilisé'; lvl = 'fair';
    txt = EN ? `An event generated a marked acetylene jump around ${series[jumpIdx].date} (+${maxJump.toFixed(0)} ppm), signature of a high-energy fault. Since then, concentrations are STABLE: no significant new gas generation. The fault has likely extinguished/resolved, but residual gas remains high.` : `Un évènement a généré un saut marqué d'acétylène autour du ${series[jumpIdx].date} (+${maxJump.toFixed(0)} ppm), signature d'un défaut à haute énergie. Depuis, les concentrations sont STABLES : pas de nouvelle génération significative de gaz. Le défaut s'est probablement éteint/résorbé, mais le gaz résiduel reste élevé.`;
  } else if (bigJump && postRising) {
    verdict = EN ? 'ACTIVE fault — continuous generation' : 'Défaut ACTIF — génération continue'; lvl = 'crit';
    txt = EN ? `Acetylene jump around ${series[jumpIdx].date}, AND later measurements keep rising. The fault is still active. Priority intervention required.` : `Saut d'acétylène autour du ${series[jumpIdx].date}, ET les mesures postérieures continuent de progresser. Le défaut est toujours actif. Intervention prioritaire requise.`;
  } else if (slope > 200) {
    verdict = EN ? 'Progressive degradation' : 'Dégradation progressive'; lvl = 'crit';
    txt = EN ? `TDCG rises steadily (≈ ${slope.toFixed(0)} ppm per sample) without a sharp jump — typical of a slowly developing thermal fault.` : `Le TDCG augmente de façon soutenue (≈ ${slope.toFixed(0)} ppm par prélèvement) sans saut brutal — évolution typique d'un défaut thermique qui se développe lentement.`;
  } else if (slope < -100) {
    verdict = EN ? 'Improvement / degassing' : 'Amélioration / dégazage'; lvl = 'good';
    txt = EN ? `TDCG decreases steadily. Either the oil was treated/degassed, or the gas source resolved. Confirm whether an intervention took place.` : `Le TDCG diminue régulièrement. Soit l'huile a été traitée/dégazée, soit la source de gaz s'est résorbée. Confirmer s'il y a eu une intervention.`;
  } else {
    verdict = EN ? 'Stable' : 'Stable'; lvl = 'good';
    txt = EN ? `No sharp variation or sustained trend. Concentrations are stable over the period.` : `Aucune variation brutale ni tendance soutenue. Les concentrations sont stables sur la période.`;
  }
  return { verdict, lvl, txt, detail, jumpDate: jumpIdx >= 0 ? series[jumpIdx].date : null, maxJump };
}
