import { NextRequest, NextResponse } from 'next/server';
import { getAiBudget, recordAiUsage, aiCallCostCents } from '@/lib/aiBudget';
import { aiGuard } from '@/lib/aiGuard';
import { anthropicMessages } from '@/lib/anthropicModel';
import { extractJsonValue } from '@/lib/aiJson';

// Fournisseurs — Import IA d'une liste de fournisseurs depuis une feuille (Excel/CSV) à colonnes LIBRES.
// Calque sur /api/clients/extract : proxy SERVEUR de l'appel Anthropic (clé serveur). Le client lit le
// fichier (SheetJS) et envoie les lignes brutes ; l'IA détecte les colonnes (synonymes/accents/casse),
// refuse si le NOM est introuvable.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

// Gabarit (synonymes tolérés) :
//   NOM (raison sociale) · CONTACT · COURRIEL · TÉLÉPHONE · ADRESSE · VILLE · PROVINCE · CODE POSTAL ·
//   N° DE COMPTE · CONDITIONS DE PAIEMENT · NOTES
// Minimum OBLIGATOIRE : NOM. Sinon -> refus (conforme:false).
const SUPPLIER_SCHEMA =
  "{name, contact_name, email, phone, address, city, province, postal_code, account_no, payment_terms, notes}";

const PROMPT = `Tu es un controleur+extracteur d'import de FOURNISSEURS. On te donne les LIGNES BRUTES d'une feuille (tableau JSON, une entree par ligne, les cles = entetes de colonnes tels quels, langue/forme libres).

GABARIT des colonnes (synonymes/accents/casse toleres) :
- NOM (nom, raison sociale, fournisseur, supplier, vendor, entreprise, compagnie, company) -> name
- CONTACT (contact, personne ressource, responsable, representant, attention, a/s) -> contact_name
- COURRIEL (courriel, email, e-mail, courriel principal) -> email
- TELEPHONE (telephone, tel, phone, no de telephone) -> phone
- ADRESSE (adresse, address, rue, civic) -> address
- VILLE (ville, city, municipalite) -> city
- PROVINCE (province, prov, etat, state) -> province (code a 2 lettres, ex. QC ; defaut "QC")
- CODE POSTAL (code postal, cp, postal code, zip) -> postal_code
- NO DE COMPTE (no de compte, compte, account, account no, numero de client, no client) -> account_no
- CONDITIONS DE PAIEMENT (conditions, termes, terms, net 30, paiement) -> payment_terms
- NOTES (notes, remarques, commentaire, memo) -> notes

REGLE DE CONFORMITE (ABSOLUE) : si tu ne peux PAS identifier de maniere fiable la colonne NOM,
retourne EXACTEMENT : {"conforme": false, "missing": ["NOM"]} et RIEN d'autre.

Sinon, retourne EXACTEMENT : {"conforme": true, "suppliers": [${SUPPLIER_SCHEMA}]}

Regles d'extraction (quand conforme) :
- Un objet par fournisseur (par ligne de donnees). Ignore lignes vides, entetes repetes, totaux, lignes d'instructions.
- DONNEES EN PLUS (colonnes hors gabarit) : ajoute-les UNIQUEMENT dans "notes" (ne perds aucune info utile). NE LES METS JAMAIS dans un autre champ.
- province : normalise en code a 2 lettres (Quebec->QC, Ontario->ON, etc.). Si absente/inconnue -> "QC".
- Champs texte absents = "" (chaine vide). Ne devine JAMAIS un courriel, un telephone ou une adresse non presents.
- name : ne doit JAMAIS etre vide ; si la ligne n'a pas de nom identifiable, ignore-la.
Retourne UNIQUEMENT le JSON, sans texte autour ni backticks.`;

export async function POST(req: NextRequest) {
  const guard = await aiGuard(req); if (guard.err) return guard.err;
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
    const resp = await anthropicMessages(apiKey, {
      model: 'claude-haiku-4-5-20251001', // extraction = modèle économique (repli auto si indisponible)
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: PROMPT },
          { type: 'text', text: 'LIGNES BRUTES (JSON) :\n' + JSON.stringify(rows).slice(0, 180000) },
        ],
      }],
    });
    if (!resp.ok) { await resp.text().catch(() => ''); return NextResponse.json({ error: `Appel IA échoué (${resp.status}).` }, { status: 502 }); }

    const data = await resp.json();
    if (tenant) { try { const cost = aiCallCostCents('claude-haiku-4-5-20251001', data?.usage); if (cost > 0) await recordAiUsage(tenant, 'fournisseurs', cost, { feature: 'import', rows: rows.length }); } catch { /* best-effort */ } }

    const text = (data?.content || []).map((b: any) => b?.text || '').join('').trim();
    const parsed = extractJsonValue(text); // extraction robuste (objet/tableau, prose, fences, troncature)
    if (!parsed) return NextResponse.json({ error: 'Réponse IA non parsable' }, { status: 422 });

    if (parsed.conforme === false) {
      return NextResponse.json({ ok: true, conforme: false, missing: Array.isArray(parsed.missing) ? parsed.missing : ['NOM'] });
    }
    let suppliers: any[] = Array.isArray(parsed.suppliers) ? parsed.suppliers : (Array.isArray(parsed) ? parsed : []);
    suppliers = suppliers.filter((s: any) => s && String(s.name || '').trim());
    return NextResponse.json({ ok: true, conforme: true, suppliers });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}
