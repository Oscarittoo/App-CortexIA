# 🎨 CRÉATION DES ICÔNES CHROME EXTENSION

## Icônes manquantes:
- icon16.png (16x16)
- icon48.png (48x48)
- icon128.png (128x128)

## Solution temporaire:

Utiliser un service en ligne pour créer les icônes:
1. https://favicon.io/favicon-converter/
2. https://www.favicon-generator.org/

Ou avec PowerShell ImageMagick:
```powershell
# Si ImageMagick est installé
convert -size 16x16 xc:#38bdf8 -fill white -pointsize 12 -gravity center -annotate +0+0 "M" icon16.png
convert -size 48x48 xc:#38bdf8 -fill white -pointsize 36 -gravity center -annotate +0+0 "M" icon48.png
convert -size 128x128 xc:#38bdf8 -fill white -pointsize 96 -gravity center -annotate +0+0 "M" icon128.png
```

## Alternative: Utiliser le logo existant

Si vous avez le logo SVG, convertir avec:
```bash
npm install -g sharp-cli
sharp -i logo_meetizy.svg -o icons/icon16.png resize 16 16
sharp -i logo_meetizy.svg -o icons/icon48.png resize 48 48
sharp -i logo_meetizy.svg -o icons/icon128.png resize 128 128
```

## Placeholder temporaire

En attendant, créer des icônes simples de couleur:
- Fond: #38bdf8 (cyan Meetizy)
- Texte: blanc "M"

## Note:
L'extension ne se chargera pas dans Chrome sans ces icônes !
