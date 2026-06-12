# Composeur vidéo C-Secur360 (Remotion)

Assemble une **vidéo finale .mp4** : tes **slides** (captures d'écran / images) en arrière-plan + l'**avatar** (vidéo D-ID, avec sa voix) incrusté qui se « tasse » dans un coin pour présenter chaque slide.

C'est un **outil local** (le rendu vidéo est trop lourd pour Vercel), comme le robot de capture.

## Installation (une fois)
```bash
cd remotion
npm install
npx remotion browser ensure   # télécharge le navigateur de rendu
```

## Utilisation
1. Dans le **Studio → Avatar → Composer la vidéo**, construis ta composition (slides + durées + position de l'avatar + vidéo d'avatar) et clique **« Télécharger composition.json »**.
2. Place `composition.json` dans ce dossier `remotion/`.
3. Lance le rendu :
```bash
cd remotion
npm run render        # -> out.mp4
```
Aperçu interactif (facultatif) : `npm run studio`.

## Format de composition.json
```json
{
  "avatarUrl": "https://.../avatar.mp4",
  "corner": "br",
  "slides": [
    { "url": "https://.../slide1.png", "seconds": 6, "avatar": "center" },
    { "url": "https://.../slide2.png", "seconds": 8, "avatar": "corner" },
    { "url": "https://.../slide3.png", "seconds": 6, "avatar": "corner" }
  ]
}
```
- `avatar` : `center` (gros, intro), `corner` (petit, dans le coin), `hidden` (hors champ, la voix continue).
- `corner` : `br` | `bl` | `tr` | `tl` (coin où se place l'avatar).
- La durée totale = somme des `seconds`. Cale-la sur la longueur de la narration de l'avatar.
- Les URLs doivent être **publiques** (bucket `marketing` public, ou autre URL accessible).
