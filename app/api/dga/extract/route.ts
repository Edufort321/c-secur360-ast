import { NextRequest, NextResponse } from 'next/server';

// #DGA — Extraction IA d'un rapport PDF de labo (DGA + qualité huile) vers JSON structuré.
// Proxy SERVEUR de l'appel Anthropic : la clé (ANTHROPIC_API_KEY) reste côté serveur — jamais
// exposée au navigateur (contrairement à l'app HTML d'origine). Prompt/schéma repris fidèlement.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const EQUIP_SCHEMA = "{company, contact, email, location, identification, serialNo, equipNo, apparatusType, description, kvClass, maxMVA, oilVolumeL, oilType, manufacturer, year, samplingPoint}";
const MEAS_SCHEMA = "[{date:'YYYY-MM-DD', H2,C2H2,C2H6,C2H4,CH4,CO,CO2,N2,O2,TDCG, moisture,ift,acid,color,dielectric,dbd877,pf25,pf100,sg,dbp,dbpc,pcb, f_2fal,f_ffa,f_5hmf,f_2acf,f_5mef}]";

const PROMPT = `Tu es un extracteur de donnees pour rapports d'analyse d'huile de transformateur (DGA + qualite huile), tous fournisseurs confondus (InsideView/Morgan Schaffer ou autres labos).
Lis le PDF et retourne UNIQUEMENT un objet JSON valide, sans texte autour, sans backticks, avec cette forme exacte :
{"transformers": [{"equipment": ${EQUIP_SCHEMA}, "measurements": ${MEAS_SCHEMA}}]}
Regles :
- IMPORTANT : un rapport peut contenir PLUSIEURS transformateurs (equipements distincts : N° de serie / N° d'equipement / identification differents). Retourne UN objet PAR transformateur dans "transformers", chacun avec SES propres mesures. S'il n'y a qu'un seul transformateur, "transformers" contient un seul objet.
- Regroupe les mesures par transformateur (ne melange pas les mesures de transformateurs differents).
- Gaz dissous en ppm. Si une valeur est "<1" ou "< 0.5", mets la moitie du seuil (ex: 0.5).
- Une entree par colonne/ligne de date dans le tableau (mesures multiples = plusieurs objets dans measurements).
- Dates au format YYYY-MM-DD.
- Champs absents = null. Ne devine pas.
- Reconnais les synonymes: Acetylene/Acetylene/C2H2, Hydrogene/Hydrogen/H2, etc.
- dielectric = rigidite D1816 ; dbd877 = rigidite D877.
Retourne le JSON et rien d'autre.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'IA non configuree (ANTHROPIC_API_KEY absente).' }, { status: 503 });

  let body: any = {};
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const pdfBase64: string = body.pdfBase64 || '';
  if (!pdfBase64) return NextResponse.json({ error: 'pdfBase64 requis' }, { status: 400 });

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        messages: [{
          role: 'user',
          content: [
            { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 } },
            { type: 'text', text: PROMPT },
          ],
        }],
      }),
    });
    if (!resp.ok) {
      const e = await resp.text();
      return NextResponse.json({ error: `Anthropic ${resp.status}: ${e.slice(0, 300)}` }, { status: 502 });
    }
    const data = await resp.json();
    const text = (data?.content || []).map((b: any) => b?.text || '').join('').trim();
    // Le modele doit renvoyer du JSON pur ; on tolere un eventuel encadrement.
    const jsonStr = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    let parsed: any = null;
    try { parsed = JSON.parse(jsonStr); } catch {
      const m = jsonStr.match(/\{[\s\S]*\}/);
      if (m) { try { parsed = JSON.parse(m[0]); } catch { /* noop */ } }
    }
    if (!parsed) return NextResponse.json({ error: 'Reponse IA non parsable', raw: text.slice(0, 500) }, { status: 422 });
    // Normalisation : on renvoie toujours un tableau "transformers" (compat ancienne forme equipment/measurements).
    let transformers: any[] = [];
    if (Array.isArray(parsed.transformers)) transformers = parsed.transformers;
    else if (parsed.equipment || parsed.measurements) transformers = [{ equipment: parsed.equipment || {}, measurements: parsed.measurements || [] }];
    transformers = transformers.filter((t: any) => t && (t.equipment || t.measurements));
    return NextResponse.json({ ok: true, transformers, equipment: transformers[0]?.equipment, measurements: transformers[0]?.measurements });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur extraction' }, { status: 500 });
  }
}
