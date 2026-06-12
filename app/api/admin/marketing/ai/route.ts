import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/apiAuth';
import { ANTI_INJECTION } from '@/lib/aiGuard';

// IA du Studio MARKETING (espace /admin, réservé super-admin). Clé Anthropic CÔTÉ SERVEUR, prompt
// construit ici (le client n'envoie que des paramètres). Le prompt IMPOSE les normes légales :
//   • Vidéo : aucune donnée client réelle ; toute allégation chiffrée doit être démontrable (LPC).
//   • Courriel : éléments LCAP obligatoires (identité, adresse, désabonnement) ; pas de promesse non prouvée.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const MODEL = 'claude-sonnet-4-20250514';

async function callClaude(apiKey: string, system: string, prompt: string, opts?: { tools?: any[]; maxTokens?: number }) {
  const payload: any = { model: MODEL, max_tokens: opts?.maxTokens || 2048, system, messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }] };
  if (opts?.tools) payload.tools = opts.tools;
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) { const e = await resp.text(); throw new Error(`Anthropic ${resp.status}: ${e.slice(0, 240)}`); }
  const data = await resp.json();
  const txt = (data?.content || []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n');
  const clean = txt.replace(/```json|```/g, '').trim();
  const m = clean.match(/\{[\s\S]*\}/);
  try { return JSON.parse(m ? m[0] : clean); } catch { throw new Error('Réponse IA illisible'); }
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin(req); if (!gate.ok) return gate.res;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'IA non configurée (ANTHROPIC_API_KEY absente).' }, { status: 503 });

  let body: any = {}; try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }); }
  const action = String(body.action || '');

  const system = [
    ANTI_INJECTION,
    "Tu es un directeur marketing B2B SaaS au Québec, expert en conformité LCAP/CASL, Loi 25 (RLRQ c P-39.1) et Loi sur la concurrence.",
    "Règles ABSOLUES, non négociables : (1) aucune donnée client réelle ou nominative ; utiliser des exemples fictifs crédibles. (2) Toute allégation chiffrée (« -70 % », « 3x plus vite ») n'est admise que si l'utilisateur fournit une source ; sinon la signaler comme NON DÉMONTRÉE. (3) Pour un courriel commercial : inclure systématiquement identité de l'expéditeur, adresse postale et mécanisme de désabonnement. (4) Ne jamais encourager le scraping ni l'envoi sans consentement.",
    // Cartographie MODULE -> PUBLIC CIBLE (persona/rôle). À RESPECTER pour cibler le bon décideur.
    "CIBLAGE PAR MODULE (cible le bon rôle, ne confonds pas les personas) :",
    "• AST (analyse sécuritaire de tâche), Permis (espaces clos / travail), Accidents, Presque-accidents → public SST/HSE : conseillers et agents de PRÉVENTION SST, responsables/coordonnateurs SST-HSE, superviseurs santé-sécurité, mutuelles de prévention.",
    "• Inspection d'équipement → TOUTE ENTREPRISE qui possède des équipements à inspecter avant usage : chariots élévateurs (lifts), nacelles/plateformes élévatrices, camions/véhicules de flotte, grues, échafaudages, etc. Cible le détenteur/gestionnaire d'équipement (chefs d'atelier, gestionnaires de flotte, responsables d'équipement, location d'équipement, construction, manufacturier) qui veut assurer le SUIVI DES INSPECTIONS PRÉ-UTILISATION pour être CONFORME À LA LOI (CNESST/règlements). Angle = conformité + traçabilité, pas seulement SST.",
    "• Rapports terrain → techniciens et INSPECTEURS TERRAIN, chargés de service, contremaîtres (ceux qui produisent les rapports sur le terrain) — PAS un agent de prévention SST.",
    "• DGA transformateurs → INGÉNIEURS et responsables d'actifs électriques, maintenance/fiabilité des transformateurs, services publics et industriels d'électricité (haute/moyenne tension).",
    "• Inventaire → responsables APPROVISIONNEMENT, magasiniers, gestion d'atelier/stock.",
    "• Feuilles de temps → PAIE, RH, administration, contrôle de projet.",
    "• Planificateur → COORDONNATEURS et chargés de projet, répartiteurs.",
    "Le terme « SST » ne désigne PAS automatiquement le public d'un module : n'associe le persona SST/prévention qu'aux modules de sécurité ci-dessus.",
    // Prononciation pour la VOIX OFF / AVATAR (synthèse vocale) : tout texte PRONONCÉ doit être facile à dire.
    "PRONONCIATION (voix off / avatar TTS) : pour tout texte destiné à être PRONONCÉ (champs voiceover, scripts d'avatar), écris-le de façon FACILE À DIRE par une synthèse vocale. Rends phonétiques les marques, acronymes, nombres et termes techniques. En particulier, écris le nom de marque « C-Secur360 » sous la forme « C Sécur 360 » (la lettre C, puis « Sécur », puis le nombre 360 en mots) — jamais « C-Secur360 » collé avec le trait d'union dans un texte parlé. ÉPELLE les acronymes dans le texte parlé : « AST » → « A S T », « DGA » → « D G A », « CNESST » → « C N E S S T » (lettres séparées par des espaces). Évite les traits d'union, symboles et anglicismes que la voix bute dessus.",
  ].join('\n');

  try {
    if (action === 'script') {
      const moduleName = String(body.module || 'Module C-Secur360').slice(0, 120);
      const duree = String(body.duree || '60 s').slice(0, 40);
      const ton = String(body.ton || 'Dynamique').slice(0, 40);
      const message = String(body.message || '').slice(0, 600);
      const prompt = `Écris le SCRIPT et le STORYBOARD d'une courte vidéo de démonstration produit pour le module « ${moduleName} » de la plateforme SST C-Secur360.
Durée cible : ${duree}. Ton : ${ton}. Message clé à démontrer À L'ÉCRAN : "${message}".
La vidéo est une capture d'écran d'un COMPTE DE DÉMONSTRATION à données fictives crédibles (ex. « Poste Bécancour T-4 »), jamais de vraies données client.
Découpe en 4 à 7 scènes. Pour chaque scène : un titre court, une durée en secondes, les effets (parmi: curseur, zoom, sous-titres) et une voix off d'une phrase.
Repère toute allégation chiffrée non démontrable dans le message et liste-la dans "warnings".
Retourne UNIQUEMENT ce JSON (sans texte autour) :
{"scenes":[{"title":"...","seconds":8,"fx":["zoom","curseur"],"voiceover":"..."}],"warnings":["allégation à sourcer ..."],"totalSeconds":60}`;
      const out = await callClaude(apiKey, system, prompt);
      return NextResponse.json({ ok: true, ...out });
    }

    if (action === 'studio-pack') {
      // « 1 brief -> N livrables » (état de l'art : Arcade Creator Studio, Opus Clip, HeyGen).
      // L'IA produit un PACK marketing complet et cohérent à partir d'un seul brief, adapté aux formats
      // choisis, avec sous-titres, post social, courriel de suivi (interconnecté à la prospection) et
      // miniature — dans la langue demandée. Respecte la conformité (allégations démontrables, démo fictive).
      const moduleName = String(body.module || 'Module C-Secur360').slice(0, 120);
      const audience = String(body.audience || 'responsables SST / maintenance').slice(0, 120);
      const message = String(body.message || '').slice(0, 700);
      const cta = String(body.cta || 'Réserver une démo').slice(0, 80);
      const formats: string[] = Array.isArray(body.formats) && body.formats.length ? body.formats.slice(0, 4) : ['16:9'];
      const lang = body.lang === 'en' ? 'English' : 'français';
      const prompt = `Tu produis un PACK MARKETING complet et cohérent pour une vidéo de démonstration du module « ${moduleName} » de la plateforme SST C-Secur360. Public cible : ${audience}. Message clé à démontrer à l'écran : "${message}". Appel à l'action : "${cta}". Formats demandés : ${formats.join(', ')}.
La vidéo = capture d'un compte de DÉMONSTRATION à données fictives crédibles (jamais de vraies données client). Toute allégation chiffrée non sourcée doit être listée dans "warnings".
Langue de TOUS les textes : ${lang}.
Retourne UNIQUEMENT ce JSON (sans texte autour) :
{
 "hooks": ["3 à 5 accroches « scroll-stopping » de 1 ligne"],
 "storyboard": [{"scene":"titre court","seconds":8,"shot":"écran|zoom|avatar|b-roll","onscreen_text":"texte à l'écran","voiceover":"1 phrase de narration","broll":"suggestion visuelle"}],
 "captions": "sous-titres prêts (par phrase, ton oral, max ~40 mots/ligne)",
 "formats": [{"ratio":"16:9|9:16|1:1","platform":"LinkedIn|YouTube|Reels/TikTok|Carré","duration_s":60,"edit_notes":"adaptation du montage pour ce format"}],
 "social_posts": [
   {"platform":"LinkedIn","caption":"post pro : accroche + valeur + CTA (peut être plus long)","hashtags":["#..."]},
   {"platform":"Facebook","caption":"ton conversationnel, accrocheur, lien démo","hashtags":["#..."]},
   {"platform":"Instagram","caption":"visuel-first, court, emojis pertinents","hashtags":["#..."]},
   {"platform":"TikTok","caption":"hook fort dès la 1re ligne, langage parlé, court","hashtags":["#..."]},
   {"platform":"X (Twitter)","caption":"≤ 280 caractères, percutant","hashtags":["#..."]},
   {"platform":"YouTube","caption":"description vidéo : résumé + chapitres + CTA + lien","hashtags":["#..."]}
 ],
 "follow_up_email": {"subject":"objet","body":"courriel de suivi court et conforme (sans promesse non prouvée)"},
 "thumbnail": "concept de miniature : texte d'accroche + visuel suggéré",
 "warnings": ["allégation à sourcer le cas échéant"]
}
RÈGLES : ne garde dans "formats" que les ratios demandés (${formats.join(', ')}). Sois concret, orienté bénéfice, crédible. Pas de superlatifs invérifiables.`;
      const out = await callClaude(apiKey, system, prompt, { maxTokens: 4096 });
      return NextResponse.json({ ok: true, pack: out });
    }

    if (action === 'capture-plan') {
      // Génère le SCÉNARIO DE CAPTURE : pour chaque scène, la page à visiter et les actions à filmer.
      // Exécuté ensuite par un robot Playwright connecté à un COMPTE DÉMO (données fictives) — la
      // sécurité/RLS de l'app est respectée (le robot ne voit que ce que ce compte voit).
      const storyboard = Array.isArray(body.storyboard) ? body.storyboard.slice(0, 12) : [];
      if (!storyboard.length) return NextResponse.json({ error: 'storyboard requis' }, { status: 400 });
      const ROUTES = 'Routes réelles de l\'app (après /{tenant}) : /modules, /projects, /planificateur, /ast, /permits, /accidents, /near-miss, /inventory, /inspections, /timesheets, /rapports, /dga, /admin.';
      const prompt = `Tu prépares un PLAN DE CAPTURE D'ÉCRAN pour filmer une démo du produit C-Secur360 à partir de ce storyboard. La capture sera faite par un robot connecté à un COMPTE DÉMO (données fictives uniquement). ${ROUTES}
Pour chaque scène, indique la page à montrer (route plausible parmi les routes réelles), des actions simples à filmer, un élément à surligner si pertinent, et un nom de fichier. Reste prudent : propose des sélecteurs GÉNÉRIQUES (texte de bouton, rôle) que l'humain affinera.
STORYBOARD : ${JSON.stringify(storyboard.map((s: any) => ({ scene: s.scene, voiceover: s.voiceover })))}
Retourne UNIQUEMENT ce JSON :
{"steps":[{"scene":"...","route":"/inspections","actions":[{"type":"click","selector":"texte ou sélecteur"},{"type":"wait","ms":600}],"highlight":"sélecteur ou null","filename":"01-xxx.png","full_page":false}],"note":"rappel : compte démo à données fictives, jamais de vraies données client"}`;
      const out = await callClaude(apiKey, system, prompt, { maxTokens: 3000 });
      return NextResponse.json({ ok: true, plan: out });
    }

    if (action === 'translate-pack') {
      // Traduction one-click du pack (multilingue, comme HeyGen/Synthesia) — FR <-> EN.
      const target = body.target === 'en' ? 'English' : 'français';
      const pack = body.pack || {};
      const prompt = `Traduis fidèlement en ${target} TOUS les textes de ce pack marketing (hooks, storyboard.onscreen_text/voiceover/broll, captions, formats.edit_notes, social_post, follow_up_email, thumbnail, warnings) en gardant EXACTEMENT la même structure JSON et les mêmes clés. Adapte le ton au marché (naturel, pas une traduction littérale). Retourne UNIQUEMENT le JSON traduit.
PACK : ${JSON.stringify(pack).slice(0, 6000)}`;
      const out = await callClaude(apiKey, system, prompt, { maxTokens: 4096 });
      return NextResponse.json({ ok: true, pack: out });
    }

    if (action === 'email') {
      const moduleName = String(body.module || 'Module C-Secur360').slice(0, 120);
      const segment = String(body.segment || 'PME').slice(0, 120);
      const angle = String(body.angle || '').slice(0, 600);
      const prompt = `Rédige un courriel de PROSPECTION B2B conforme LCAP pour promouvoir le module « ${moduleName} » de C-Secur360, destiné au segment « ${segment} ».
Angle d'accroche : "${angle}".
Le courriel s'adresse à des prospects DÉJÀ CONSENTANTS (exprès ou tacite valide). Pas de promesse chiffrée non prouvée.
Inclure OBLIGATOIREMENT, sous forme de champs distincts à insérer : un bloc identité expéditeur, l'adresse postale (placeholder « [Adresse postale C-Secur360] ») et une ligne de désabonnement (« [Lien de désabonnement] »).
Retourne UNIQUEMENT ce JSON (sans texte autour) :
{"subjectA":"...","subjectB":"...","body":"corps du courriel (tutoiement professionnel, court)","footer":"identité + [Adresse postale C-Secur360] + [Lien de désabonnement]","compliance":["rappel LCAP/Loi 25 pertinent"]}`;
      const out = await callClaude(apiKey, system, prompt);
      return NextResponse.json({ ok: true, ...out });
    }

    if (action === 'research') {
      // RECHERCHE DE PROSPECTION LÉGALE : l'IA fait une VRAIE recherche web et ne retient que des
      // adresses d'affaires PUBLIÉES PUBLIQUEMENT (base du consentement tacite CASL), avec l'URL source
      // comme preuve. Aucune adresse personnelle devinée, aucun scraping de masse.
      const region = body.region === 'Canada' ? 'tout le Canada' : 'la province de Québec';
      const sector = String(body.sector || 'sécurité industrielle / SST').slice(0, 160);
      const count = Math.max(3, Math.min(15, Number(body.count) || 8));
      const prompt = `Recherche sur le WEB des ENTREPRISES de ${region} dans le secteur « ${sector} » qui pourraient être intéressées par la plateforme SST C-Secur360 (rapports terrain, AST, permis espaces clos, DGA transformateurs, inventaire).
Pour CHAQUE entreprise, ne retiens une adresse courriel QUE si elle est une ADRESSE D'AFFAIRES PUBLIÉE PUBLIQUEMENT par l'entreprise sur son propre site (ex. info@, contact@, sst@), SANS mention « pas de sollicitation / no soliciting », et PERTINENTE à la fonction. Donne l'URL EXACTE où l'adresse est publiée (preuve du consentement tacite CASL). N'INVENTE JAMAIS d'adresse : si tu ne trouves pas d'adresse publiée vérifiable, mets email à null.
Vise ${count} entreprises. Retourne UNIQUEMENT ce JSON (sans texte autour) :
{"candidates":[{"company":"...","sector":"...","city":"...","region":"QC|CA","email":"adresse publiée ou null","website":"https://...","source_url":"URL exacte où l'adresse est publiée","no_solicitation":false,"relevance":"pourquoi cette entreprise est pertinente","consent_basis":"tacite — adresse d'affaires publiée à <source_url>"}],"note":"rappel légal"}`;
      const out = await callClaude(apiKey, system, prompt, {
        maxTokens: 4096,
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 6 }],
      });
      // Filtre serveur : on ne renvoie que des candidats avec email publié + source + sans no-solicitation.
      const candidates = (Array.isArray(out.candidates) ? out.candidates : []).filter((c: any) => c && c.email && c.source_url && !c.no_solicitation);
      return NextResponse.json({ ok: true, candidates, note: out.note || '' });
    }

    if (action === 'avatar-script') {
      // Rédige le texte que l'avatar prononcera, CALIBRÉ à une durée cible (≈ 2,5 mots/seconde).
      const ideas = String(body.ideas || '').slice(0, 800);
      const seconds = Math.max(5, Math.min(120, Number(body.seconds) || 30));
      const lang = body.lang === 'en' ? 'English' : 'français';
      const words = Math.round(seconds * 2.4);
      const prompt = `Rédige un texte de VOIX OFF pour un avatar présentateur de C-Secur360 (plateforme SST), à partir de ces idées : "${ideas}".
Durée cible : ${seconds} secondes — soit ENVIRON ${words} mots (une voix off dit ~2,4 mots/seconde). Respecte cette longueur d'assez près.
Ton : clair, oral, professionnel, orienté bénéfice. Pas d'allégation chiffrée non démontrable. Langue : ${lang}.
Retourne UNIQUEMENT ce JSON : {"text":"le texte à prononcer","words":<nombre de mots>,"seconds":${seconds}}`;
      const out = await callClaude(apiKey, system, prompt, { maxTokens: 800 });
      return NextResponse.json({ ok: true, ...out });
    }

    if (action === 'chat') {
      // Assistant conversationnel : stratège marketing & prospection. Échange libre pour cadrer les
      // pistes (segments, secteurs, angles, idées de contenu) avant de générer/rechercher/envoyer.
      const msgs = (Array.isArray(body.messages) ? body.messages : []).slice(-20)
        .map((m: any) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: [{ type: 'text', text: String(m.content || '').slice(0, 4000) }] }))
        .filter((m: any) => m.content[0].text);
      if (!msgs.length) return NextResponse.json({ error: 'messages requis' }, { status: 400 });
      const chatSystem = [
        ANTI_INJECTION,
        system,
        "Tu es un STRATÈGE marketing & prospection B2B pour C-Secur360, plateforme SST québécoise (modules : rapports terrain QR+IA, AST, permis espaces clos, DGA transformateurs, inventaire, feuilles de temps). Tu aides l'équipe à définir : segments et secteurs à prospecter (Québec puis Canada), angles d'accroche, idées de contenu et de vidéo, séquences de relance, positionnement.",
        "Tu rappelles la conformité quand c'est pertinent (LCAP/CASL : consentement ; Loi 25 : données personnelles ; Loi sur la concurrence : allégations démontrables). Tu poses 1-2 questions de clarification si nécessaire, puis tu proposes des pistes CONCRÈTES et actionnables. Réponses en français, concises, structurées en puces. Quand pertinent, suggère d'utiliser les outils du module (Recherche de prospects IA, Studio, génération de courriel).",
      ].join('\n');
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: MODEL, max_tokens: 1500, system: chatSystem, messages: msgs }),
      });
      if (!resp.ok) { const e = await resp.text(); return NextResponse.json({ error: `Anthropic ${resp.status}: ${e.slice(0, 200)}` }, { status: 502 }); }
      const data = await resp.json();
      const reply = (data?.content || []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\n').trim();
      return NextResponse.json({ ok: true, reply });
    }

    return NextResponse.json({ error: 'action inconnue (script|email|research|studio-pack|chat)' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erreur IA' }, { status: 502 });
  }
}
