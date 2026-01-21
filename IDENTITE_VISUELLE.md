# 🧠 CORTEXIA - Identité Visuelle

## Logo

Le logo CORTEXIA représente un cerveau stylisé avec un design de circuit imprimé, symbolisant l'intelligence artificielle et la technologie de pointe.

### Caractéristiques du logo

- **Côté gauche (bleu/cyan)** : Représente l'analyse logique et la transcription technique
  - Gradient : du cyan clair (#1dd3f7) au bleu foncé (#0b5394)
  - Motifs de circuits électroniques avec nœuds et connexions

- **Côté droit (rose/violet)** : Représente la créativité et l'intelligence artificielle
  - Gradient : du rose vif (#e946ef) au violet foncé (#7b1fa2)
  - Connexions organiques avec effets pixelisés

### Fichiers disponibles

- `src/assets/logo.svg` - Logo vectoriel pour l'interface web
- Format responsive et optimisé pour tous les écrans

## Palette de couleurs

### Couleurs principales
- **Cyan** : #1dd3f7 → #0891d4 → #0b5394
- **Rose/Violet** : #e946ef → #b333ea → #7b1fa2
- **Blanc** : #ffffff (pour les circuits et textes sur fond sombre)

### Usage du gradient
Le header de l'application utilise un gradient combinant les deux hémisphères :
```css
background: linear-gradient(135deg, #0891d4 0%, #7b1fa2 100%);
```

## Typographie

- **Nom** : CORTEXIA (tout en majuscules)
- **Police** : Sans-serif moderne (System fonts)
- **Espacement** : letter-spacing: 1px pour le titre principal

## Application du logo

### Dans l'interface
Le logo est affiché avec une taille de 50x50px dans le header avec un effet d'ombre portée :
```css
.logo {
  width: 50px;
  height: 50px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}
```

### Positionnement
Le logo est aligné horizontalement avec le titre "CORTEXIA" avec un espace de 15px entre les deux.

## Signification

**CORTEXIA** = CORTEX (cerveau) + IA (Intelligence Artificielle)

Le nom évoque l'intelligence et la capacité cognitive tout en soulignant la dimension technologique de l'assistant de réunions.
