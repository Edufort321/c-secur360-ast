# 🎫 Accès démo limité + capture de lead (page publique)

> Objectif : un bouton « Démarrer maintenant » donne un accès démo temporaire après saisie Nom + courriel ;
> notification au propriétaire ; quotas de temps ; verrouillage puis réactivation à l'abonnement ; CTA forfaits.
> Capturé 2026-05-31. Design proposé ci-dessous (ouvert à ajustement).

## 🎯 Comportement demandé (synthèse)
- Bouton **« Démarrer maintenant »** sur la page publique → le visiteur entre **Nom + courriel**.
- M'envoie un **message sur mon courriel** (`eric.dufort@cerdia.ai`) : « [Nom] ([courriel]) s'est connecté à la démo » → je peux le relancer.
- **1 heure par session**. Après expiration : inactif, mais **2 tentatives reconnues** (par courriel) possibles.
- **4 heures d'utilisation au total** par courriel (timer cumulé). Au-delà → verrouillé.
- S'il **s'abonne**, son courriel **redevient actif** (accès réel).
- Le visiteur peut **tester / créer des choses** dans la démo, puis ça se termine → message **« Voir les forfaits d'abonnement »**.

## 🧠 Design proposé (mon « meilleure idée »)
- **Tenant `demo` = bac à sable partagé** (déjà public dans le middleware). Les données créées y sont **éphémères** (purge périodique). Aucune donnée réelle de client.
- **Capture + jeton** : `POST /api/demo/start { name, email }` →
  1. upsert un **lead** dans `demo_sessions` (name, email, first_seen, total_seconds, attempts, status).
  2. applique les quotas (1 h/session, 4 h total, 2 reprises après expiration).
  3. **notifie le propriétaire** (voir décision courriel).
  4. pose un **cookie httpOnly signé** `demo_token` (exp 1 h) + redirige vers `/demo` (ou `/demo/modules`).
- **Timer visible** : bandeau compte à rebours du temps restant de la session ; à 0 → écran « Démo terminée » + **CTA « Voir les forfaits »** + « S'abonner ».
- **Verrouillage** : si `total_seconds ≥ 4 h` OU `attempts > 2` → refus, écran forfaits (plus de reprise).
- **Réactivation à l'abonnement** : si le courriel correspond à un tenant abonné (table `tenants`/`users`), accès réel — pas besoin de la démo.
- **Anti-abus** : rate-limit IP sur `/api/demo/start` (réutiliser le pattern `public-guard`), 1 lead actif par courriel.

## 🗃️ Données (migration à créer)
`demo_sessions` : id, email (unique), name, first_seen, last_start, total_seconds (int), session_expires_at, attempts (int), status ('active'|'expired'|'locked'|'converted'), created_at, updated_at.

## ❓ DÉCISION CLÉ — comment t'envoyer la notification ?
1. **Courriel (demandé)** → nécessite un **fournisseur d'envoi** (Resend / SendGrid / SMTP). _Aucun n'est configuré actuellement dans C-Secur360._ → fournir une clé (ex. `RESEND_API_KEY`) + domaine d'envoi vérifié.
2. **SMS au propriétaire (alternative immédiate)** : Twilio **est déjà configuré** (`OWNER_MOBILE`, routes `/api/sms/*`). On pourrait t'envoyer un **SMS** « [Nom] ([courriel]) a démarré la démo » sans rien installer, en attendant l'email.
3. **Les deux** : SMS tout de suite + courriel quand le fournisseur est prêt.
→ **À confirmer.** (Recommandation : démarrer en **SMS** via l'infra Twilio existante, ajouter le courriel ensuite avec Resend.)

## ❓ Autres décisions
- Données démo : **bac à sable `demo` partagé** (simple) ou **tenant éphémère par courriel** (plus lourd) ? (reco : `demo` partagé + purge).
- Durées : 1 h/session, 4 h total, 2 reprises — confirmées telles quelles ?
- Forfaits : la page `/pricing` existe-t-elle déjà avec le contenu, ou afficher la grille de prix de l'accueil ?

## 📋 Phases proposées
- [ ] D1 — Migration `demo_sessions` + service (quotas 1 h/session, 4 h total, 2 reprises, statut).
- [ ] D2 — `POST /api/demo/start` (capture lead + quotas + cookie + notif propriétaire SMS/courriel).
- [ ] D3 — UI page publique : bouton **« Démarrer maintenant »** + modale Nom/courriel ; bandeau **compte à rebours** sur l'espace démo ; écran **« Démo terminée → Voir les forfaits »**.
- [ ] D4 — Verrouillage + réactivation à l'abonnement.
- [ ] D5 — Purge périodique des données du bac à sable `demo` (cron).
