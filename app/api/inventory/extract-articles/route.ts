import { NextRequest, NextResponse } from 'next/server';

// #Inventaire — Import IA d'articles depuis une feuille Excel quelconque (colonnes libres).
// Calqué sur /api/dga/extract : proxy SERVEUR de l'appel Anthropic (la clé ANTHROPIC_API_KEY
// reste côté serveur, jamais exposée au navigateur). Le client lit le .xlsx (SheetJS) et nous
// envoie les lignes brutes en JSON ; l'IA détecte les colonnes et renvoie des articles normalisés.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const ARTICLE_SCHEMA =
  "{code, name, category, department, location, quantity:number, minQuantity:number, maxQuantity:number, costPrice:number, salePrice:number, unit, description}";

function buildPrompt(categories: string[], departments: string[]): string {
  return `Tu es un assistant d'import d'inventaire. On te donne les LIGNES BRUTES d'une feuille Excel (tableau JSON, une entree par ligne, les cles sont les en-tetes de colonnes tels quels). Les en-tetes peuvent etre dans n'importe quelle langue/forme.
Detecte a quelle information correspond chaque colonne, puis retourne UNIQUEMENT un objet JSON valide, sans texte autour, sans backticks, avec cette forme exacte :
{"articles": [${ARTICLE_SCHEMA}]}
Regles :
- Un objet par article (par ligne de donnees). Ignore les lignes vides, les lignes d'en-tete repetees, les lignes de total/sous-total et les lignes d'instructions.
- Reconnais les synonymes FR/EN des colonnes :
  - code : code, sku, reference, ref, no, numero, item code.
  - name : nom, designation, libelle, article, name, title, produit.
  - category : categorie, category, famille, type, classe.
  - department : departement, succursale, branch, site, magasin, entrepot, depot.
  - location : localisation, emplacement, allee, etagere, bin, location, lieu.
  - quantity : quantite, qte, qty, stock, quantity, en stock, on hand.
  - minQuantity : min, quantite min, seuil min, minimum, reorder, point de commande.
  - maxQuantity : max, quantite max, maximum, capacite.
  - costPrice : prix cout, cout, cost, prix d'achat, achat, cost price, pamp.
  - salePrice : prix vente, prix de vente, vente, sale price, prix, price, pvp.
  - unit : unite, unit, uom, mesure, conditionnement.
  - description : description, details, note, remarque, commentaire.
- Nombres : convertis en nombre (retire symboles monetaires, espaces, separateurs de milliers ; la virgule decimale devient un point). Si une valeur numerique est absente, mets 0 — SAUF maxQuantity : si absent, mets le plus grand entre (quantity) et (minQuantity*2) et au minimum 1.
- category et department : si la valeur de la ligne ressemble (insensible a la casse/aux accents) a une valeur de la liste fournie ci-dessous, RENVOIE EXACTEMENT la valeur de la liste. Sinon, renvoie la valeur brute telle quelle.
- code : si absent, fabrique un code court en MAJUSCULES a partir du nom (ex: "Masque N95" -> "MASQUE-N95"). Jamais vide.
- unit : si absent, mets "Piece".
- Champs texte absents = "" (chaine vide). Ne devine pas d'information non presente.

Categories existantes : ${categories.length ? categories.join(' | ') : '(aucune)'}
Departements existants : ${departments.length ? departments.join(' | ') : '(aucune)'}

Retourne le JSON et rien d'autre.`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'IA non configuree (ANTHROPIC_API_KEY absente).' }, { status: 503 });

  let body: any = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const rows: any[] = Array.isArray(body.rows) ? body.rows : [];
  const categories: string[] = Array.isArray(body.categories) ? body.categories.map(String) : [];
  const departments: string[] = Array.isArray(body.departments) ? body.departments.map(String) : [];
  if (!rows.length) return NextResponse.json({ error: 'Aucune ligne a importer (feuille vide).' }, { status: 400 });
  // Cap PAR REQUETE (le client decoupe les gros fichiers en lots) : borne de securite pour ne pas
  // depasser la fenetre de tokens de sortie du modele. Les imports >1000 articles passent par
  // plusieurs requetes (chunks) cote client.
  if (rows.length > 600) return NextResponse.json({ error: `Lot trop grand (${rows.length} lignes). Maximum 600 par requete — decoupez en lots plus petits.` }, { status: 400 });

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        // Haiku 4.5 : tres rapide et suffisant pour de la detection de colonnes / normalisation
        // structuree -> evite les timeouts (504) sur les gros imports (le client envoie de petits lots).
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 8000,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: buildPrompt(categories, departments) },
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
    const text = (data?.content || []).map((b: any) => b?.text || '').join('').trim();
    const jsonStr = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    let parsed: any = null;
    try { parsed = JSON.parse(jsonStr); } catch {
      const m = jsonStr.match(/\{[\s\S]*\}/);
      if (m) { try { parsed = JSON.parse(m[0]); } catch { /* noop */ } }
    }
    if (!parsed) return NextResponse.json({ error: 'Reponse IA non parsable', raw: text.slice(0, 500) }, { status: 422 });

    let articles: any[] = Array.isArray(parsed.articles) ? parsed.articles : (Array.isArray(parsed) ? parsed : []);
    articles = articles.filter((a: any) => a && (a.name || a.code));
    return NextResponse.json({ ok: true, articles });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}
