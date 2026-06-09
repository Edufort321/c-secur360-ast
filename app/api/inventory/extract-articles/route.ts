import { NextRequest, NextResponse } from 'next/server';
import { getAiBudget, recordAiUsage, aiCallCostCents } from '@/lib/aiBudget';
import { aiGuard } from '@/lib/aiGuard';

// #Inventaire — Import IA d'articles depuis une feuille Excel STRICTE (gabarit impose).
// Calque sur /api/dga/extract : proxy SERVEUR de l'appel Anthropic (cle ANTHROPIC_API_KEY cote
// serveur). Le client lit le .xlsx (SheetJS) et envoie les lignes brutes ; l'IA detecte les
// colonnes du gabarit, refuse si les 3 criteres minimum sont absents, et normalise.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

// Gabarit officiel attendu (entetes, tolerant aux synonymes/accents/casse) :
//   EMPLACEMENT · TABLETTE · POSITION · INVENTAIRE · IDENTIFICATION · MAX · MIN ·
//   SITE · DEPARTEMENT · FOURNISSEUR · CATEGORIE · PRIX ($) · CODE ITEM
// Minimum OBLIGATOIRE : SITE, DEPARTEMENT, EMPLACEMENT. Sinon -> refus (conforme:false).
const ARTICLE_SCHEMA =
  "{site, department, location, shelf, position, quantity:number, name, maxQuantity:number, minQuantity:number, supplier, category, costPrice:number, code, description}";

const PROMPT = `Tu es un controleur+extracteur d'import d'inventaire. On te donne les LIGNES BRUTES d'une feuille Excel (tableau JSON, une entree par ligne, les cles = entetes de colonnes tels quels, langue/forme libres).

GABARIT OFFICIEL des colonnes (synonymes/accents/casse toleres) :
- EMPLACEMENT (emplacement, allee, racking, rangee) -> location
- TABLETTE (tablette, etagere, shelf, niveau) -> shelf. Si ABSENTE ou non reconnue (ex. bac/bin dans un support sans tablette), mets shelf=0 et ajoute dans "description" la mention "tablette non reconnue".
- POSITION (position, pos, no, numero) -> position
- INVENTAIRE (inventaire, quantite, qte, stock, on hand) -> quantity
- IDENTIFICATION (identification, nom, designation, libelle, article, description courte) -> name
- MAX (max, quantite max, maximum) -> maxQuantity
- MIN (min, quantite min, minimum, seuil) -> minQuantity
- SITE (site, succursale, branch, etablissement) -> site
- DEPARTEMENT (departement, departement, dept, service) -> department
- FOURNISSEUR (fournisseur, supplier, vendor) -> supplier
- CATEGORIE (categorie, category, famille) -> category. STRICT : category = la valeur EXACTE de la colonne CATEGORIE, telle quelle (ne traduis pas, ne normalise pas, ne regroupe pas). Si AUCUNE colonne categorie claire -> category = "". N'INVENTE JAMAIS de categorie et ne deduis pas une categorie a partir du nom de l'article ou d'une autre colonne.
- PRIX (prix, prix $, cout, cost, prix unitaire) -> costPrice
- CODE ITEM (code item, code, sku, reference, ref) -> code

REGLE DE CONFORMITE (ABSOLUE) : si tu ne peux PAS identifier de maniere fiable les TROIS colonnes
minimum SITE, DEPARTEMENT et EMPLACEMENT, retourne EXACTEMENT :
{"conforme": false, "missing": [<noms des criteres minimum manquants parmi "SITE","DEPARTEMENT","EMPLACEMENT">]}
et RIEN d'autre.

Sinon (les 3 criteres minimum sont presents), retourne EXACTEMENT :
{"conforme": true, "articles": [${ARTICLE_SCHEMA}]}

Regles d'extraction (quand conforme) :
- Un objet par article (par ligne de donnees). Ignore lignes vides, entetes repetes, totaux/sous-totaux, lignes d'instructions.
- DONNEES EN PLUS (colonnes hors gabarit) : ajoute-les UNIQUEMENT dans "description". NE LES METS JAMAIS dans category, site, department, supplier ni code (ces champs ne viennent QUE de leur propre colonne). Ne perds aucune info utile.
- Nombres : convertis (retire symboles monetaires, espaces, separateurs de milliers ; virgule decimale -> point). TOUTE case vide ou absente = 0 (y compris quantity, minQuantity, maxQuantity, costPrice).
- PRIX (costPrice) : PETITE valeur monetaire unitaire (typiquement < 10000). N'utilise JAMAIS un code-barres/EAN/SKU/identifiant comme prix. En cas de doute (nombre a 6+ chiffres ou colonne qui ressemble a un code), mets 0.
- code : si absent, fabrique-le en MAJUSCULES a partir du nom. Jamais vide.
- Champs texte absents = "" (chaine vide). Ne devine pas d'info non presente.
Retourne UNIQUEMENT le JSON, sans texte autour ni backticks.`;

export async function POST(req: NextRequest) {
  const guard = await aiGuard(req); if (guard.err) return guard.err; // auth + anti-abus
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'IA non configuree (ANTHROPIC_API_KEY absente).' }, { status: 503 });

  let body: any = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const rows: any[] = Array.isArray(body.rows) ? body.rows : [];
  const tenant = String((guard.user?.tenant_id) || body.tenant || '').trim();
  if (!rows.length) return NextResponse.json({ error: 'Aucune ligne a importer (feuille vide).' }, { status: 400 });
  if (rows.length > 600) return NextResponse.json({ error: `Lot trop grand (${rows.length} lignes). Maximum 600 par requete — decoupez en lots plus petits.` }, { status: 400 });
  // Forfait IA : bloque si le budget du tenant est epuise (sauf "illimite" = pas de forfait).
  if (tenant) { const budget = await getAiBudget(tenant); if (budget.exhausted) return NextResponse.json({ error: 'Forfait IA épuisé — demandez un renouvellement.', exhausted: true }, { status: 402 }); }

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        // Haiku 4.5 : rapide et suffisant pour la detection de colonnes / normalisation structuree.
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

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      return NextResponse.json({ error: `Appel IA echoue (${resp.status}). ${errText.slice(0, 300)}` }, { status: 502 });
    }

    const data = await resp.json();
    // Decompte REEL par tenant : cout = tokens Anthropic (usage) au tarif du modele.
    if (tenant) { try { const cost = aiCallCostCents('claude-haiku-4-5-20251001', data?.usage); if (cost > 0) await recordAiUsage(tenant, 'inventaire', cost, { feature: 'import', rows: rows.length }); } catch { /* best-effort */ } }
    const text = (data?.content || []).map((b: any) => b?.text || '').join('').trim();
    const jsonStr = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    let parsed: any = null;
    try { parsed = JSON.parse(jsonStr); } catch {
      const m = jsonStr.match(/\{[\s\S]*\}/);
      if (m) { try { parsed = JSON.parse(m[0]); } catch { /* noop */ } }
    }
    if (!parsed) return NextResponse.json({ error: 'Reponse IA non parsable', raw: text.slice(0, 500) }, { status: 422 });

    // Refus de conformite : on remonte la liste des criteres minimum manquants.
    if (parsed.conforme === false) {
      return NextResponse.json({ ok: true, conforme: false, missing: Array.isArray(parsed.missing) ? parsed.missing : ['SITE', 'DEPARTEMENT', 'EMPLACEMENT'] });
    }

    let articles: any[] = Array.isArray(parsed.articles) ? parsed.articles : (Array.isArray(parsed) ? parsed : []);
    articles = articles.filter((a: any) => a && (a.name || a.code));
    return NextResponse.json({ ok: true, conforme: true, articles });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}
