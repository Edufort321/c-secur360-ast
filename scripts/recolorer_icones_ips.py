# Recolore les icônes de modules d'IPS C-360 aux couleurs de C-Secur360 (Eric 2026-11-14 : « au couleurs du site C-Secur360 »).
# Sarcelle IPS -> orange C-Secur360 (#F26522) ; cercle anthracite -> marine C-Secur360 (#0D1F3C) ; blancs et gris clairs inchangés.
# Usage : python scripts/recolorer_icones_ips.py
#   source : C:\Application\Rapport_IPS\Logo ; sortie : public/modules/icones/<cle du module>.png (160 px)
import colorsys, os
from PIL import Image

SOURCE = r"C:\Application\Rapport_IPS\Logo"
SORTIE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "modules", "icones")
ORANGE_H = 22 / 360          # teinte de #F26522
MARINE = (13, 31, 60)        # #0D1F3C
CLES = {"admin": "administration", "projects": "gantt", "planner": "planificateur", "ast": "ast", "hse": "gestion-sst",
        "permits": "permis", "inventory": "inventaire", "inspections": "inspection", "timesheets": "temps-couts",
        "todo": "equipe-taches", "dga": "dga", "rapports": "rapport", "contact": "contact", "facturation": "facturation",
        "formation": "portefeuille-formation", "thermographie": "thermographie"}

def marine(v: float, a: int):
    k = v / 0.13
    return (min(255, int(MARINE[0] * k)), min(255, int(MARINE[1] * k)), min(255, int(MARINE[2] * k)), a)

def recolorer(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA"); px = im.load()
    for y in range(im.size[1]):
        for x in range(im.size[0]):
            r, g, b, a = px[x, y]
            if a == 0: continue
            h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            if v < 0.30:                                           # cercle anthracite -> marine
                px[x, y] = marine(v, a)
            elif 0.40 < h < 0.62 and s > 0.08:                     # accents sarcelle -> orange (les teintes pâles restent pâles)
                rr, gg, bb = colorsys.hsv_to_rgb(ORANGE_H, min(1, s * 1.15) if s > 0.35 else s, min(1, v * 1.4))
                px[x, y] = (int(rr * 255), int(gg * 255), int(bb * 255), a)
    return im

os.makedirs(SORTIE, exist_ok=True)
for cle, nom in CLES.items():
    im = Image.open(os.path.join(SOURCE, f"{nom}-icone-1024.png")).convert("RGBA").resize((160, 160), Image.LANCZOS)
    recolorer(im).save(os.path.join(SORTIE, f"{cle}.png"), optimize=True)
print("Icônes recolorées :", len(CLES))
