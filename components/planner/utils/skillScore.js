// ============== SCORE DE COMPETENCES (deterministe) ==============
// Replique fidele de computeSkillScore() de l'admin (app/[tenant]/admin/page.tsx),
// pour que l'optimiseur du planificateur (#34 R14) classe le personnel sur les
// VRAIES evaluations, sans LLM.
//
// skill_form (sur la grille poste_salary_grids) :
//   { types: [ { id, name, weight, mode: 'note'|'pct', max, skills: [{ id, name, weight }] } ] }
// skill_scores (sur planner_personnel) : { [skillId]: note }

// Note globale ponderee (0..100) a partir du formulaire de grille et des notes par competence.
export function computeSkillScore(form, scores) {
  const byType = {};
  const types = form && Array.isArray(form.types) ? form.types : [];
  let wSum = 0, wTot = 0;
  for (const t of types) {
    const sk = t.skills || [];
    if (sk.length === 0) { byType[t.id] = 0; continue; }
    let acc = 0, swTot = 0;
    for (const s of sk) {
      const v = Number((scores && scores[s.id]) || 0);
      const ratio = t.mode === 'pct'
        ? Math.min(v, 100) / 100
        : Math.min(v, t.max || 5) / (t.max || 5);
      const sw = Number(s.weight) > 0 ? Number(s.weight) : 1;
      acc += ratio * sw; swTot += sw;
    }
    const typeScore = swTot > 0 ? (acc / swTot) * 100 : 0; // 0..100
    byType[t.id] = typeScore;
    const w = Number(t.weight) > 0 ? Number(t.weight) : 1;
    wSum += typeScore * w; wTot += w;
  }
  return { global: wTot > 0 ? wSum / wTot : 0, byType };
}

// Score reel (0..100) d'un membre du personnel, deterministe, avec replis :
//   1. skill_scores (employe) ponderes par la skill_form de sa grille (current_grid_id)
//   2. skill_score d'employee_evaluations (deja pondere) si fourni
//   3. anciens champs generiques (niveau / evaluation / note / score / rating)
// Retourne { score, source } ou source = 'skills' | 'evaluation' | 'legacy' | 'none'.
export function personnelRealScore(person, opts = {}) {
  const skillFormByGrid = opts.skillFormByGrid || {};
  const evalScoreByPerson = opts.evalScoreByPerson || {};
  if (!person) return { score: 0, source: 'none' };

  const scores = person.skill_scores;
  const form = person.current_grid_id ? skillFormByGrid[person.current_grid_id] : null;
  if (form && scores && typeof scores === 'object' && !Array.isArray(scores) && Object.keys(scores).length > 0) {
    const { global } = computeSkillScore(form, scores);
    if (global > 0) return { score: global, source: 'skills' };
  }

  const ev = evalScoreByPerson[person.id];
  if (ev != null && !Number.isNaN(Number(ev))) {
    return { score: Number(ev), source: 'evaluation' };
  }

  const legacy = Number(
    person.niveau ?? person.evaluation ?? person.note ?? person.score ?? person.rating ?? 0
  ) || 0;
  return { score: legacy, source: legacy ? 'legacy' : 'none' };
}
