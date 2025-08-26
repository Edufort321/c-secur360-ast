#!/bin/bash
# 🔧 SCRIPT CORRECTION ROUTES DYNAMIQUES VERCEL
# Ajoute "export const dynamic = 'force-dynamic';" aux routes API problématiques

set -e

echo "🔧 Correction des routes dynamiques Vercel..."

# Liste des fichiers à corriger
ROUTES=(
  "app/api/billing/sync/route.ts"
  "app/api/rbac/permissions/route.ts"  
  "app/api/rbac/roles/route.ts"
  "app/api/sms/cleanup/route.ts"
  "app/api/gantt/resources/route.ts"
)

# Fonction pour ajouter dynamic = 'force-dynamic'
add_dynamic_export() {
  local file="$1"
  if [ -f "$file" ]; then
    # Vérifier si déjà présent
    if ! grep -q "export const dynamic" "$file"; then
      # Trouver la ligne après les imports
      local insert_line=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)
      if [ -n "$insert_line" ]; then
        insert_line=$((insert_line + 1))
        sed -i "${insert_line}i\\nexport const dynamic = 'force-dynamic';" "$file"
        echo "✅ Corrigé: $file"
      fi
    else
      echo "⏭️  Déjà corrigé: $file"
    fi
  else
    echo "⚠️  Fichier non trouvé: $file"
  fi
}

# Corriger chaque route
for route in "${ROUTES[@]}"; do
  add_dynamic_export "$route"
done

echo "🎉 Correction des routes dynamiques terminée!"