# Icônes de modules au style noir et argent de la démo C-Secur360 (Eric 2026-11-16 : « plus de style aux couleurs noir et
# argent comme C-Secur360-demo », « les vrais logos qui sont dans IPS mais aux couleurs de l'app »).
# Source : pictogrammes IPS déjà recolorés de la démo (C-Secur360_Demo/assets/modules) ; sortie : public/modules/argent/<cle>.png (160 px).
# Usage : python scripts/icones_argent.py
import os
from PIL import Image

SOURCE = r"C:\Application\Rapport_IPS\C-Secur360_Demo\assets\modules"
SORTIE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "modules", "argent")
# clé du registre C-Secur360 -> pictogramme de la démo
CLES = {"admin": "adm", "projects": "projets", "planner": "planif", "ast": "ast", "hse": "protocole", "permits": "permis",
        "accidents": "accident", "inventory": "inventaire", "inspections": "inspection", "maintenance": "fpin", "dga": "dga",
        "timesheets": "rc", "conges": "prework", "todo": "equipe", "rapports": "rapport", "marketing": "formation",
        "contact": "contact", "facturation": "facturation", "thermographie": "thermo", "formation": "formation"}
os.makedirs(SORTIE, exist_ok=True)
for cle, nom in CLES.items():
    Image.open(os.path.join(SOURCE, f"{nom}.png")).convert("RGBA").resize((160, 160), Image.LANCZOS) \
        .save(os.path.join(SORTIE, f"{cle}.png"), optimize=True)
print("Icônes argent :", len(CLES))
