# 🤖 TODO — 2 chatbots IA (Claude) pour C-Secur360

> Reproduire le système en prod sur CERDIA, adapté à la sécurité industrielle (AST, permis, inspections).
> Moteur : **Anthropic Claude `claude-haiku-4-5`** (économique). **Prompt caching** systématique sur le system prompt. `npm install @anthropic-ai/sdk`. Env : **`ANTHROPIC_API_KEY=sk-ant-...`** (vérifier qu'elle est dans Vercel C-Secur360).
> Capturé 2026-05-30.

## 🟢 A. Chatbot PUBLIC (marketing / page d'accueil) — visiteurs anonymes
**Objectif** : informer sur C-Secur360 (SaaS sécurité industrielle : AST, permis, inspections, conformité provinciale) et orienter vers **démo + contact**. Aucune auth.
- [x] **`lib/assistant/public-knowledge.ts`** — base de connaissance + system prompt (portée stricte, réponses courtes, oriente démo/contact). FAIT.
- [x] **`lib/assistant/public-guard.ts`** — rate-limit IP (12/h) + plafond global (600/j) + `getClientIp`. FAIT.
- [x] **`app/api/assistant/public-chat/route.ts`** — quota avant appel, claude-haiku-4-5, max_tokens 350, prompt caching, historique borné, jamais throw. FAIT (requiert `ANTHROPIC_API_KEY`).
- [ ] **`components/PublicChatWidget.tsx`** — bouton flottant + panneau ; ouverture auto 2,5 s/session ; CTA « Démo » + « Nous écrire » ; suggestions ; disclaimer ; monté dans `app/page.tsx`. **RESTE À FAIRE.**

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
