# Icônes de l'extension

Ce dossier doit contenir les icônes de l'extension aux dimensions suivantes :

- `icon16.png` - 16x16 pixels (icône dans la barre d'outils)
- `icon48.png` - 48x48 pixels (page de gestion des extensions)
- `icon128.png` - 128x128 pixels (Chrome Web Store)

## Comment générer les icônes

Vous pouvez utiliser le logo Meetizy existant dans `src/assets/logo_meetizy.png` ou `logo_meetizy.svg` comme base.

### Option 1 : Utiliser un outil en ligne
- [Favicon Generator](https://favicon.io/)
- [Icon Generator](https://www.icoconverter.com/)

### Option 2 : Utiliser Photoshop/GIMP
1. Ouvrir `src/assets/logo_meetizy.png`
2. Redimensionner aux tailles requises
3. Sauvegarder en PNG avec transparence

### Option 3 : Utiliser ImageMagick (ligne de commande)

```bash
# Depuis le dossier racine du projet
convert src/assets/logo_meetizy.png -resize 16x16 chrome-extension/icons/icon16.png
convert src/assets/logo_meetizy.png -resize 48x48 chrome-extension/icons/icon48.png
convert src/assets/logo_meetizy.png -resize 128x128 chrome-extension/icons/icon128.png
```

## Style recommandé

- Fond transparent
- Couleurs : Cyan (#38bdf8) sur fond sombre (#0f172a)
- Design simple et reconnaissable même en petit
- Cohérent avec l'identité visuelle Meetizy
