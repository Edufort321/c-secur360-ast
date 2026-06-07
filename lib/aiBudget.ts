import { supabaseAdmin } from '@/lib/supabaseAdmin';

// ============== FORFAIT / BUDGET IA PAR TENANT ==============
// Modele (decide avec Eric) : le client achete un FORFAIT en $ (tier : 500/1000/1500). Le budget
// de COUT IA reel autorise = prix forfait x 70% (la marge de 30% est la difference). On suit le
// cout IA consomme (ai_used_cents) — UN budget partage par client, consommation tracee PAR MODULE.
//
// Tables dediees (voir migration 131) — AUCUNE dependance sur `tenants` (qui peut ne pas exister) :
//   ai_budgets (tenant_id PK, tier_cents, used_cents, period_start, assistants_enabled)
//   ai_usage   (tenant_id, module, cost_cents, meta, created_at) — detail par module.

export const AI_MARGIN = 0.30; // 30% de profit -> budget reel = prix x (1 - marge)

export type AiBudget = {
  tierCents: number;      // prix forfait paye (cents)
  budgetCents: number;    // cout IA autorise = tier x 70%
  usedCents: number;      // cout IA consomme (cents)
  remainingCents: number; // budget - used (>=0)
  exhausted: boolean;     // plus de budget
  unlimited: boolean;     // aucun forfait configure -> on NE bloque PAS (retro-compat avant migration)
};

// Taux par modele ($/1M tokens). Sert a estimer le cout d'un appel.
const RATES: Record<string, { in: number; out: number }> = {
  'claude-opus-4-8': { in: 5, out: 25 },
  'claude-sonnet-4-6': { in: 3, out: 15 },
  'claude-haiku-4-5-20251001': { in: 1, out: 5 },
  'claude-haiku-4-5': { in: 1, out: 5 },
};

// Cout d'un appel en CENTS a partir de l'usage Anthropic + nb de recherches web ($10/1000).
export function aiCallCostCents(model: string, usage: any, webSearches = 0): number {
  const r = RATES[model] || RATES['claude-sonnet-4-6'];
  const inTok = (usage?.input_tokens || 0) + (usage?.cache_read_input_tokens || 0) + (usage?.cache_creation_input_tokens || 0);
  const outTok = usage?.output_tokens || 0;
  const tokenCost = (inTok / 1e6) * r.in + (outTok / 1e6) * r.out; // $
  const searchCost = (webSearches || 0) * 0.01; // $10 / 1000 recherches
  return Math.ceil((tokenCost + searchCost) * 100);
}

// Lit l'etat du budget d'un tenant. unlimited=true si la colonne n'existe pas encore (avant migration)
// OU si aucun forfait n'est defini -> on ne bloque pas (retro-compat).
export async function getAiBudget(tenant: string): Promise<AiBudget> {
  try {
    const { data, error } = await supabaseAdmin
      .from('ai_budgets').select('tier_cents, used_cents').eq('tenant_id', tenant).maybeSingle();
    if (error || !data) {
      return { tierCents: 0, budgetCents: 0, usedCents: 0, remainingCents: 0, exhausted: false, unlimited: true };
    }
    const tierCents = Number(data.tier_cents) || 0;
    const usedCents = Number(data.used_cents) || 0;
    const budgetCents = Math.round(tierCents * (1 - AI_MARGIN));
    if (tierCents <= 0) {
      // Aucun forfait achete -> par defaut on NE bloque pas (le patron active les forfaits quand il veut).
      return { tierCents: 0, budgetCents: 0, usedCents, remainingCents: 0, exhausted: false, unlimited: true };
    }
    const remainingCents = Math.max(0, budgetCents - usedCents);
    return { tierCents, budgetCents, usedCents, remainingCents, exhausted: usedCents >= budgetCents, unlimited: false };
  } catch {
    return { tierCents: 0, budgetCents: 0, usedCents: 0, remainingCents: 0, exhausted: false, unlimited: true };
  }
}

// Enregistre le cout d'un appel : incremente tenants.ai_used_cents + insere une ligne ai_usage (par module).
export async function recordAiUsage(tenant: string, module: string, costCents: number, meta?: any): Promise<void> {
  if (!(costCents > 0)) return;
  try {
    // Increment best-effort (read-modify-write ; suffisant pour ce volume). Cree la ligne au besoin.
    const { data } = await supabaseAdmin.from('ai_budgets').select('used_cents').eq('tenant_id', tenant).maybeSingle();
    const cur = Number((data as any)?.used_cents) || 0;
    await supabaseAdmin.from('ai_budgets').upsert({ tenant_id: tenant, used_cents: cur + costCents, updated_at: new Date().toISOString() }, { onConflict: 'tenant_id' });
  } catch { /* table absente avant migration -> on ignore */ }
  try {
    await supabaseAdmin.from('ai_usage').insert({ tenant_id: tenant, module, cost_cents: costCents, meta: meta || null });
  } catch { /* table absente avant migration -> on ignore */ }
}
