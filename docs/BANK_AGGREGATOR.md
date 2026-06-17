# Connexion bancaire en temps réel (agrégateur) — plan d'intégration

> But : connecter le compte bancaire d'un tenant et **importer automatiquement** ses opérations
> dans le rapprochement (`bank_statement_lines`) → catégorisation IA → transactions. Plus aucun fichier à télécharger.

## 1. Choix de l'agrégateur (Canada)
| | **Flinks** (recommandé CA) | **Plaid** |
|---|---|---|
| Couverture banques CA | Excellente (Desjardins, Banque Nationale, BMO, RBC, TD, Tangerine…) | Bonne (s'améliore au CA) |
| Modèle | Widget « Connect » (iframe) → `LoginId` → API REST | Link (widget) → `access_token` → API |
| Coût | Abonnement + par connexion (devis) | Par item/mois |
| Données | Comptes + opérations + soldes + identité | Idem |

**Recommandation : Flinks** pour la meilleure couverture des banques canadiennes.

## 2. Ce qu'Eric doit faire (avant que je finalise le code)
1. **Créer un compte** Flinks (https://flinks.com) → environnement **Sandbox** d'abord.
2. Récupérer : **Customer ID**, **Instance** (sous-domaine), **clé API**.
3. Me les donner pour les variables d'env Vercel : `FLINKS_CUSTOMER_ID`, `FLINKS_INSTANCE`, `FLINKS_API_KEY` (jamais commit — comme Stripe).
4. (Prod) passer en environnement réel + activer les institutions voulues.

## 3. Ce que je construis (une fois le fournisseur choisi + creds sandbox)
- **Migration** : `bank_connections` (tenant_id, provider, login_id, institution, account_mask, status, last_sync_at) + lien optionnel vers un compte de trésorerie (`treasury_account_id`).
- **Widget de connexion** : page/onglet « Connecter ma banque » → iframe Flinks Connect → renvoie `LoginId` → `POST /api/bank/connect` (stocke la connexion).
- **Synchro** : `POST /api/bank/sync` (+ cron quotidien) → appelle Flinks `GetAccountsDetail` → mappe les opérations vers `bank_statement_lines` (dédoublonnage par identifiant d'opération de la banque) → réutilise le **rapprochement** + la **catégorisation IA** déjà en place.
- **Sécurité** : aucune donnée d'identifiant bancaire stockée (l'agrégateur gère l'auth) ; on ne garde que le `LoginId`/token serveur (service_role). Env-gated : rien ne s'active tant que les clés ne sont pas posées.

## 4. Architecture (réutilise l'existant)
`Flinks Connect (iframe)` → `bank_connections` → `cron/sync` → **`bank_statement_lines`** → (déjà construit) **rapprochement auto** + **« IA catégorise » → transactions** → GL.

→ La couche « relevé → transactions » existe déjà ; l'agrégateur ne fait que **remplacer le téléchargement de fichier** par une synchro automatique.

## 5. Décision en attente
- **Fournisseur** : Flinks (recommandé) ou Plaid ?
- **Quand** : je code l'intégration dès que tu as les **clés sandbox**. En attendant, l'import **CSV** (corrigé) couvre 100 % du besoin manuellement.
