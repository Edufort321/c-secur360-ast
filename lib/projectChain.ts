// Chaîne d'interconnexion SOUMISSION → PROJET → TEMPS RÉEL → FACTURATION.
// Pour une maintenance (ou tout projet), permet de « remonter à la soumission » et de comparer le
// TEMPS PRÉVU (soumission.total_hours) au TEMPS RÉEL fait (feuilles de temps via computeProjectActuals),
// puis au FACTURÉ. Répond à « voir si le temps était bon ». Lectures résilientes (best-effort).
import { supabase } from '@/lib/supabase';
import { computeProjectActuals, type ProjectActuals } from '@/lib/projectActuals';

export type ProjectLite = { id: string; number: string; title: string };

export type ProjectChain = {
  project: { id: string; number: string; title: string; poAmount: number } | null;
  soumission: { id: string; numero: string; estimatedHours: number; total: number } | null;
  actuals: ProjectActuals;
  actualHours: number;
  billed: number;                 // facturé à date (commerce_invoices sent/paid liées au projet)
  variance: {
    hoursEst: number; hoursActual: number; hoursDelta: number; hoursPct: number | null;
    onTime: boolean | null;       // réel ≤ prévu ?
  };
};

/** Liste légère des projets (pour rattacher une inspection à un projet/soumission). */
export async function getProjectsLite(tenant: string): Promise<ProjectLite[]> {
  const { data } = await supabase.from('projects').select('id, project_number, title').eq('tenant_id', tenant).order('project_number', { ascending: false }).limit(500);
  return ((data as any[]) || []).map(p => ({ id: p.id, number: p.project_number || '', title: p.title || '' }));
}

/** Soumission liée à un projet (par project_id, sinon par submission_number). */
async function getSoumissionForProject(tenant: string, projectId: string, submissionNumber?: string): Promise<ProjectChain['soumission']> {
  // total_hours = heures PRÉVUES (migration 138) ; total = montant.
  let row: any = null;
  try {
    const { data } = await supabase.from('soumissions').select('id, numero, total, total_hours').eq('tenant_id', tenant).eq('project_id', projectId).limit(1).maybeSingle();
    row = data;
  } catch { /* ignore */ }
  if (!row && submissionNumber) {
    try {
      const { data } = await supabase.from('soumissions').select('id, numero, total, total_hours').eq('tenant_id', tenant).eq('numero', submissionNumber).limit(1).maybeSingle();
      row = data;
    } catch { /* ignore */ }
  }
  if (!row) return null;
  return { id: row.id, numero: row.numero || '', estimatedHours: Number(row.total_hours) || 0, total: Number(row.total) || 0 };
}

/** Facturé à date pour un projet (factures envoyées/payées, migration 212). */
async function getBilledForProject(tenant: string, projectId: string): Promise<number> {
  try {
    const { data } = await supabase.from('commerce_invoices').select('subtotal, status, project_id').eq('tenant_id', tenant).eq('project_id', projectId).in('status', ['sent', 'paid']);
    return ((data as any[]) || []).reduce((s, iv) => s + (Number(iv.subtotal) || 0), 0);
  } catch { return 0; }
}

export async function getProjectChain(tenant: string, projectId: string): Promise<ProjectChain> {
  let project: ProjectChain['project'] = null; let submissionNumber = '';
  try {
    const { data: p } = await supabase.from('projects').select('id, project_number, title, po_amount, submission_number').eq('tenant_id', tenant).eq('id', projectId).maybeSingle();
    if (p) { project = { id: p.id, number: (p as any).project_number || '', title: (p as any).title || '', poAmount: Number((p as any).po_amount) || 0 }; submissionNumber = (p as any).submission_number || ''; }
  } catch { /* ignore */ }

  const [soumission, actuals, billed] = await Promise.all([
    getSoumissionForProject(tenant, projectId, submissionNumber),
    computeProjectActuals(tenant, projectId),
    getBilledForProject(tenant, projectId),
  ]);

  const actualHours = (actuals.hours.reg || 0) + (actuals.hours.supp || 0) + (actuals.hours.maj || 0);
  const hoursEst = soumission?.estimatedHours || 0;
  const hoursDelta = Math.round((actualHours - hoursEst) * 10) / 10;
  const hoursPct = hoursEst > 0 ? Math.round(((actualHours - hoursEst) / hoursEst) * 100) : null;
  const onTime = hoursEst > 0 ? actualHours <= hoursEst : null;

  return { project, soumission, actuals, actualHours, billed, variance: { hoursEst, hoursActual: actualHours, hoursDelta, hoursPct, onTime } };
}
