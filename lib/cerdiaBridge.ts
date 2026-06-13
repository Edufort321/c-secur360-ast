// Pont REMONTANT C-Secur360 -> CERDIA (CERDIA = agrégateur parent ; les données remontent, jamais
// l'inverse). Envoi best-effort, non bloquant. Authentifié par le secret de pont partagé.
// Config : CERDIA_COMMERCE_URL (ou NEXT_PUBLIC_CSECUR360_URL côté CERDIA) + CSECUR360_SYNC_SECRET.

const CERDIA_URL = process.env.CERDIA_COMMERCE_URL || process.env.NEXT_PUBLIC_CERDIA_URL;
const SECRET = process.env.CSECUR360_SYNC_SECRET;

function headers() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${SECRET}` };
}

/** Pousse un (ou plusieurs) module(s)/produit(s) vers CERDIA. No-op si non configuré. */
export async function pushModulesToCerdia(modules: any[]): Promise<void> {
  if (!CERDIA_URL || !SECRET || !modules?.length) return;
  try {
    await fetch(`${CERDIA_URL}/api/commerce/csecur360/modules`, {
      method: 'POST', headers: headers(), body: JSON.stringify({ modules }),
    });
  } catch { /* best-effort : la remontée ne doit jamais bloquer l'action locale */ }
}

/** Pousse un administrateur vers CERDIA (création du compte admin avec le MÊME mot de passe si fourni). */
export async function pushAdminToCerdia(admin: { email: string; name?: string; password?: string; role?: string }): Promise<void> {
  if (!CERDIA_URL || !SECRET || !admin?.email) return;
  try {
    await fetch(`${CERDIA_URL}/api/commerce/csecur360/admins`, {
      method: 'POST', headers: headers(), body: JSON.stringify(admin),
    });
  } catch { /* best-effort */ }
}
