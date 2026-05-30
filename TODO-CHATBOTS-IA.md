# 🤖 TODO — 2 chatbots IA (Claude) pour C-Secur360

> Reproduire le système en prod sur CERDIA, adapté à la sécurité industrielle (AST, permis, inspections).
> Moteur : **Anthropic Claude `claude-haiku-4-5`** (économique). **Prompt caching** systématique sur le system prompt. `npm install @anthropic-ai/sdk`. Env : **`ANTHROPIC_API_KEY=sk-ant-...`** (vérifier qu'elle est dans Vercel C-Secur360).
> Capturé 2026-05-30.

## 🟢 A. Chatbot PUBLIC (marketing / page d'accueil) — visiteurs anonymes
**Objectif** : informer sur C-Secur360 (SaaS sécurité industrielle : AST, permis, inspections, conformité provinciale) et orienter vers **démo + contact**. Aucune auth.
- [ ] **`lib/assistant/public-knowledge.ts`** — base de connaissance + system prompt. Règles strictes : portée UNIQUEMENT C-Secur360 (refuser hors-sujet) ; pas d'explication technique/réglementaire détaillée (rester présentation, « conforme aux normes provinciales » sans détailler) ; réponses COURTES (2-4 phrases) ; orienter vers démo + courriel (seules portes de sortie) ; ne rien inventer (faits depuis la base).
- [ ] **`lib/assistant/public-guard.ts`** — anti-abus (CRITIQUE facture) : rate-limit par IP (~12 msg/h) + **plafond global quotidien** (~600 req/jour toutes IP) ; `getClientIp(headers)` (lit `x-forwarded-for`).
- [ ] **`app/api/assistant/public-chat/route.ts`** — POST : `checkPublicQuota(ip)` AVANT tout appel IA (sinon message statique, zéro appel facturé) ; `max_tokens: 350` ; historique borné (8 msg) + entrée ≤ 1000 chars ; system prompt en cache (`cache_control: ephemeral`) ; **jamais throw** → repli « écrivez-nous à [courriel] ».
- [ ] **`components/PublicChatWidget.tsx`** — bouton flottant + panneau ; ouverture auto après 2,5 s une fois/session (sessionStorage) ; 2 CTA permanents « Voir la démo » + « Nous écrire » (mailto) ; suggestions au démarrage ; disclaimer ; monté dans `app/page.tsx`.

## 🔵 B. Assistant TENANT (interne / dashboard) — utilisateurs connectés
**Objectif** : former/aider les utilisateurs connectés (fonctionnement plateforme, aide à remplir AST/permis/inspections). **Auth obligatoire + quota par utilisateur.**
**⚠️ Sécurité absolue (zéro fuite inter-tenant)** : l'assistant ne lit **AUCUNE donnée réelle** de tenant — uniquement une base de connaissance générique (fonctionnement + normes). Fuite impossible par construction. → **Ne PAS lui donner accès aux requêtes Supabase sur les données.**
- [ ] **`lib/assistant/knowledge-base.ts`** — structure plateforme, fonctionnement des modules (AST, permis espace clos, inspections équipement, timesheets…), normes génériques (CNESST…) sans données tenant, aide à la saisie (champs d'un AST/permis conforme). System prompt : informatif, n'invente rien, rappelle de valider avec un responsable HSE, ne voit aucune donnée réelle.
- [ ] **`lib/auth/ai-guard.ts`** — auth Bearer OBLIGATOIRE (token Supabase) ; rate-limit par **userId** (pas IP) ; tiers de quota (text: 20/min). `requireAIUser(request, 'text')`.
- [ ] **`app/api/assistant/chat/route.ts`** — POST : `requireAIUser(request, 'text')` en tête ; `max_tokens: 800` ; historique borné ; system prompt en cache.
- [ ] **`components/AssistantWidget.tsx`** — widget dashboard tenant ; envoie le token Bearer de session ; bouton flottant + chat ; disclaimer.

## 🔒 Règles NON négociables (les deux bots)
- Knowledge base = **seule source** (IA ne lit aucune donnée tenant → fuite impossible).
- Public : rate-limit IP **+ plafond global** (facture bornée). Tenant : auth Bearer **+ quota/user**.
- `max_tokens` court (coût borné par réponse). **Prompt caching** (coût tokens d'entrée réduit).
- **Jamais throw** vers le client (toujours un repli propre). **Portée stricte** dans le prompt.

## 📝 Notes d'implémentation (cohérence avec l'existant)
- Une route IA existe déjà : `app/api/chat/assistant/route.ts` (cf. audit #16 — sans rate-limit). À réconcilier/remplacer par les nouvelles routes ci-dessus (ou y appliquer les gardes).
- Réutiliser le helper d'auth serveur prévu pour la sécu (#1-4) pour `ai-guard` (token → session → user).
- Page publique = `app/page.tsx` ; dashboard tenant = espace `/[tenant]/...`.
