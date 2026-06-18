// Gabarits de maintenance LÉGERS — un gabarit = un modèle réutilisable (genre « Rapport d'inspection »)
// fait de BLOCS simples (section / inspection / mesures / photos / note). Stockés dans la MÊME table que
// les gabarits Rapport terrain (`rapport_templates`, docType='maintenance') via la route serveur
// /api/rapports/data — ainsi l'import IA et le moteur complet restent compatibles, mais l'UI reste légère.

export type GBlockType = 'section' | 'inspect' | 'mesures' | 'photos' | 'note';
export type GBlock = { id: string; type: GBlockType; title: string; items?: string[] };
export type Gabarit = { id: string; name: string; num?: string | null; blocks: GBlock[] };

export const BLOCK_LABELS: Record<GBlockType, string> = {
  section: 'Champs (section)', inspect: 'Points d’inspection', mesures: 'Mesures', photos: 'Photos', note: 'Note / texte',
};
export const BLOCK_ICON: Record<GBlockType, string> = { section: '§', inspect: '☑', mesures: '📏', photos: '🖼', note: '¶' };

const newId = () => (globalThis.crypto?.randomUUID?.() || `g${Date.now()}${Math.round(Math.random() * 1e6)}`);

/** Modèle de départ « Rapport d'inspection » (équipement + photos + mesures + points d'inspection). */
export function starterInspection(): GBlock[] {
  return [
    { id: newId(), type: 'section', title: 'Équipement', items: ['Nom', '# série', 'Marque', 'Modèle'] },
    { id: newId(), type: 'photos', title: 'Photos terrain' },
    { id: newId(), type: 'mesures', title: 'Mesures', items: ['Heures', 'Pression', 'Température'] },
    { id: newId(), type: 'inspect', title: 'Points d’inspection', items: ['État général', 'Fuites', 'Sécurité', 'Niveaux / fluides'] },
  ];
}
export function newBlock(type: GBlockType): GBlock {
  return { id: newId(), type, title: BLOCK_LABELS[type], items: type === 'photos' || type === 'note' ? undefined : [''] };
}
export function blankGabarit(): Gabarit { return { id: newId(), name: '', blocks: starterInspection() }; }

function normalize(row: any): Gabarit {
  const blocks = Array.isArray(row?.blocks) ? row.blocks : [];
  return {
    id: row.id, name: row.name || 'Gabarit', num: row.num || null,
    blocks: blocks.map((b: any) => ({
      id: b.id || newId(), type: (['section', 'inspect', 'mesures', 'photos', 'note'].includes(b.type) ? b.type : 'section') as GBlockType,
      title: b.title || b.name || '', items: Array.isArray(b.items) ? b.items : (Array.isArray(b.fields) ? b.fields.map((f: any) => f?.label || String(f)) : undefined),
    })),
  };
}

export async function getGabarits(tenant: string): Promise<Gabarit[]> {
  try {
    const r = await fetch(`/api/rapports/data?kind=templates&docType=maintenance&tenant=${encodeURIComponent(tenant)}`, { credentials: 'include' });
    const j = await r.json().catch(() => ({}));
    return (Array.isArray(j.items) ? j.items : []).map(normalize);
  } catch { return []; }
}

export async function saveGabarit(tenant: string, g: Gabarit): Promise<{ error?: string }> {
  try {
    const r = await fetch('/api/rapports/data', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ kind: 'templates', docType: 'maintenance', tenant, item: { id: g.id, name: g.name, num: g.num || null, blocks: g.blocks } }),
    });
    const j = await r.json().catch(() => ({}));
    return r.ok ? {} : { error: j.error || `HTTP ${r.status}` };
  } catch (e: any) { return { error: e?.message || 'Erreur réseau' }; }
}

export async function deleteGabarit(tenant: string, id: string): Promise<{ error?: string }> {
  try {
    const r = await fetch(`/api/rapports/data?kind=templates&id=${encodeURIComponent(id)}&tenant=${encodeURIComponent(tenant)}`, { method: 'DELETE', credentials: 'include' });
    const j = await r.json().catch(() => ({}));
    return r.ok ? {} : { error: j.error || `HTTP ${r.status}` };
  } catch (e: any) { return { error: e?.message || 'Erreur réseau' }; }
}
