// Applique au PROFIL CLIENT les informations extraites d'un bon de commande (import IA). Politique
// « compléter sans écraser » : on remplit uniquement les champs VIDES du client, on ajoute l'adresse de
// facturation sur un site, et on ajoute les contacts MANQUANTS (par courriel/nom). Best-effort : une
// table/colonne absente n'interrompt jamais. Retourne l'id du client (créé si absent).
import { supabase } from '@/lib/supabase';

export type PoClientData = {
  address?: string; city?: string; province?: string; postal_code?: string;
  billing_address?: string; billing_city?: string; billing_province?: string; billing_postal_code?: string;
};
export type PoContact = { name?: string; title?: string; email?: string; phone?: string; mobile?: string };

const norm = (s?: string) => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export async function applyPoClientProfile(tenant: string, opts: {
  clientId?: string | null; clientName?: string | null; client?: PoClientData; contacts?: PoContact[];
}): Promise<{ clientId: string | null; created: boolean; contactsAdded: number; updated: boolean }> {
  const client = opts.client || {};
  const contacts = (opts.contacts || []).filter(c => c && (c.name || c.email || c.phone));
  let clientId = opts.clientId || null;
  let created = false, updated = false, contactsAdded = 0;

  try {
    // 1) Résoudre le client (par id, sinon par nom).
    let row: any = null;
    if (clientId) { const { data } = await supabase.from('clients').select('*').eq('tenant_id', tenant).eq('id', clientId).maybeSingle(); row = data; }
    if (!row && opts.clientName) {
      const { data } = await supabase.from('clients').select('*').eq('tenant_id', tenant).ilike('name', opts.clientName.trim()).limit(1);
      row = (data || [])[0] || null;
    }
    // 2) Créer si introuvable (et qu'on a au moins un nom).
    if (!row && opts.clientName) {
      const ins: any = { tenant_id: tenant, name: opts.clientName.trim(), address: client.address || '', city: client.city || '', province: client.province || 'QC', postal_code: client.postal_code || '', active: true };
      const { data } = await supabase.from('clients').insert(ins).select('*').single();
      row = data; created = !!data;
    }
    if (!row) return { clientId: null, created, contactsAdded, updated };
    clientId = String(row.id);

    // 3) Compléter les champs VIDES du client (ne jamais écraser une valeur existante).
    const patch: any = {};
    const fillIf = (col: string, val?: string) => { if (val && !String(row[col] || '').trim()) patch[col] = val; };
    fillIf('address', client.address); fillIf('city', client.city); fillIf('province', client.province); fillIf('postal_code', client.postal_code);
    if (Object.keys(patch).length) { const { error } = await supabase.from('clients').update(patch).eq('id', clientId).eq('tenant_id', tenant); if (!error) updated = true; }

    // 4) Adresse de FACTURATION -> sur un site du client (le 1er, ou un site « Facturation » créé).
    if (client.billing_address) {
      try {
        const { data: sites } = await supabase.from('client_sites').select('*').eq('tenant_id', tenant).eq('client_id', clientId).limit(1);
        const site = (sites || [])[0];
        const bill = { billing_address: client.billing_address, billing_city: client.billing_city || '', billing_province: client.billing_province || '', billing_postal_code: client.billing_postal_code || '' };
        if (site) {
          if (!String(site.billing_address || '').trim()) await supabase.from('client_sites').update(bill).eq('id', site.id);
        } else {
          await supabase.from('client_sites').insert({ tenant_id: tenant, client_id: clientId, name: 'Facturation', address: client.address || '', city: client.city || '', province: client.province || 'QC', postal_code: client.postal_code || '', ...bill, active: true });
        }
      } catch { /* table absente */ }
    }

    // 5) Contacts MANQUANTS (par courriel sinon nom).
    if (contacts.length) {
      try {
        const { data: existing } = await supabase.from('client_contacts').select('name, email').eq('tenant_id', tenant).eq('client_id', clientId);
        const haveEmail = new Set((existing || []).map((c: any) => norm(c.email)).filter(Boolean));
        const haveName = new Set((existing || []).map((c: any) => norm(c.name)).filter(Boolean));
        const toAdd = contacts.filter(c => {
          const e = norm(c.email), nm = norm(c.name);
          if (e && haveEmail.has(e)) return false;
          if (!e && nm && haveName.has(nm)) return false;
          return true;
        }).map(c => ({ tenant_id: tenant, client_id: clientId, site_id: null, name: c.name || '', title: c.title || '', email: c.email || '', phone: c.phone || '', mobile: c.mobile || '', is_primary: false, active: true }));
        if (toAdd.length) { const { error } = await supabase.from('client_contacts').insert(toAdd); if (!error) contactsAdded = toAdd.length; }
      } catch { /* table absente */ }
    }
  } catch { /* best-effort global */ }

  return { clientId, created, contactsAdded, updated };
}
