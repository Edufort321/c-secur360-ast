import { NextRequest, NextResponse } from 'next/server';
import { getAiBudget, recordAiUsage, aiCallCostCents } from '@/lib/aiBudget';
import { aiGuard } from '@/lib/aiGuard';

// Clients — Import IA d'une liste de clients depuis une feuille (Excel/CSV) à colonnes LIBRES.
// Calque sur /api/inventory/extract-articles : proxy SERVEUR de l'appel Anthropic (clé serveur).
// Le client lit le fichier (SheetJS) et envoie les lignes brutes ; l'IA détecte les colonnes
// (synonymes/accents/casse tolérés), refuse si le minimum (NOM + un moyen de contact) est absent.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

// Gabarit attendu (synonymes tolérés) :
//   NOM (raison sociale) · CONTACT · COURRIEL · TÉLÉPHONE · CELLULAIRE · ADRESSE · VILLE ·
//   PROVINCE · CODE POSTAL · NOTES
// Minimum OBLIGATOIRE : NOM + (COURRIEL OU TÉLÉPHONE). Sinon -> refus (conforme:false).
const CLIENT_SCHEMA =
  "{name, contact_name, contact_email, contact_phone, phone, email, address, city, province, postal_code, notes}";

const PROMPT = `Tu es un controleur+extracteur d'import de CLIENTS. On te donne les LIGNES BRUTES d'une feuille (tableau JSON, une entree par ligne, les cles = entetes de colonnes tels quels, langue/forme libres).

GABARIT des colonnes (synonymes/accents/casse toleres) :
- NOM (nom, raison sociale, client, entreprise, compagnie, company, name) -> name
- CONTACT (contact, personne ressource, responsable, attention, a/s) -> contact_name
- COURRIEL DU CONTACT (courriel contact, email contact) -> contact_email
- TELEPHONE DU CONTACT (tel contact, telephone contact) -> contact_phone
- TELEPHONE (telephone, tel, phone, no de telephone) -> phone
- COURRIEL (courriel, email, e-mail, courriel principal) -> email
- ADRESSE (adresse, address, rue, civic) -> address
- VILLE (ville, city, municipalite) -> city
- PROVINCE (province, prov, etat, state) -> province (code a 2 lettres si possible, ex. QC ; defaut "QC")
- CODE POSTAL (code postal, cp, postal code, zip) -> postal_code
- NOTES (notes, remarques, commentaire, memo) -> notes

REGLE DE CONFORMITE (ABSOLUE) : si tu ne peux PAS identifier de maniere fiable la colonne NOM,
NI aucun moyen de contact (COURRIEL ou TELEPHONE), retourne EXACTEMENT :
{"conforme": false, "missing": [<parmi "NOM","COURRIEL","TELEPHONE">]}
et RIEN d'autre.

Sinon, retourne EXACTEMENT :
{"conforme": true, "clients": [${CLIENT_SCHEMA}]}

Regles d'extraction (quand conforme) :
- Un objet par client (par ligne de donnees). Ignore lignes vides, entetes repetes, totaux, lignes d'instructions.
- DONNEES EN PLUS (colonnes hors gabarit) : ajoute-les UNIQUEMENT dans "notes" (ne perds aucune info utile). NE LES METS JAMAIS dans un autre champ.
- province : normalise en code a 2 lettres (Quebec->QC, Ontario->ON, etc.). Si absente/inconnue -> "QC".
- Champs texte absents = "" (chaine vide). Ne devine JAMAIS un courriel, un telephone ou une adresse non presents.
- name : ne doit JAMAIS etre vide ; si la ligne n'a pas de nom identifiable, ignore-la.
- telephone : garde les chiffres et la mise en forme lisible ; n'invente pas d'indicatif.
Retourne UNIQUEMENT le JSON, sans texte autour ni backticks.`;

export async function POST(req: NextRequest) {
  const guard = await aiGuard(req); if (guard.err) return guard.err; // auth + anti-abus
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'IA non configurée (ANTHROPIC_API_KEY absente).' }, { status: 503 });

  let body: any = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const rows: any[] = Array.isArray(body.rows) ? body.rows : [];
  const tenant = String((guard.user?.tenant_id) || body.tenant || '').trim();
  if (!rows.length) return NextResponse.json({ error: 'Aucune ligne à importer (feuille vide).' }, { status: 400 });
  if (rows.length > 600) return NextResponse.json({ error: `Lot trop grand (${rows.length} lignes). Maximum 600 par requête — découpez en lots plus petits.` }, { status: 400 });
  if (tenant) { const budget = await getAiBudget(tenant); if (budget.exhausted) return NextResponse.json({ error: 'Forfait IA épuisé — demandez un renouvellement.', exhausted: true }, { status: 402 }); }

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 8000,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: PROMPT },
            { type: 'text', text: 'LIGNES BRUTES (JSON) :\n' + JSON.stringify(rows).slice(0, 180000) },
          ],
        }],
      }),
    });
    if (!resp.ok) { await resp.text().catch(() => ''); return NextResponse.json({ error: `Appel IA échoué (${resp.status}).` }, { status: 502 }); }

    const data = await resp.json();
    if (tenant) { try { const cost = aiCallCostCents('claude-haiku-4-5-20251001', data?.usage); if (cost > 0) await recordAiUsage(tenant, 'clients', cost, { feature: 'import', rows: rows.length }); } catch { /* best-effort */ } }

    const text = (data?.content || []).map((b: any) => b?.text || '').join('').trim();
    const jsonStr = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    let parsed: any = null;
    try { parsed = JSON.parse(jsonStr); } catch {
      const m = jsonStr.match(/\{[\s\S]*\}/);
      if (m) { try { parsed = JSON.parse(m[0]); } catch { /* ignore */ } }
    }
    if (!parsed) return NextResponse.json({ error: 'Réponse IA non parsable' }, { status: 422 });

    if (parsed.conforme === false) {
      return NextResponse.json({ ok: true, conforme: false, missing: Array.isArray(parsed.missing) ? parsed.missing : ['NOM', 'COURRIEL', 'TELEPHONE'] });
    }
    let clients: any[] = Array.isArray(parsed.clients) ? parsed.clients : (Array.isArray(parsed) ? parsed : []);
    clients = clients.filter((c: any) => c && String(c.name || '').trim());
    return NextResponse.json({ ok: true, conforme: true, clients });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}
