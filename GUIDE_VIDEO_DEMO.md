# 🎥 Guide de Remplacement de la Vidéo de Démo

## Emplacement
Le player vidéo se trouve dans : `src/components/Demo.jsx`

## Options d'intégration

### Option 1 : Vidéo YouTube (Actuellement active) ✅

1. Obtenez l'URL de votre vidéo YouTube (ex: `https://www.youtube.com/watch?v=VIDEO_ID`)
2. Récupérez uniquement l'ID de la vidéo (la partie après `v=`)
3. Dans `Demo.jsx`, remplacez l'ID dans l'iframe :

```jsx
<iframe 
  src="https://www.youtube.com/embed/VOTRE_VIDEO_ID?controls=1&modestbranding=1&rel=0"
  ...
></iframe>
```

**Paramètres YouTube disponibles :**
- `controls=1` : Affiche les contrôles du player
- `modestbranding=1` : Réduit le branding YouTube
- `rel=0` : N'affiche pas de vidéos suggérées à la fin
- `autoplay=1` : Démarre automatiquement (nécessite `mute=1`)

---

### Option 2 : Vidéo Locale (Fichier MP4/WEBM)

1. Placez votre fichier vidéo dans `src/assets/` (ex: `demo-video.mp4`)
2. Placez une image de miniature (optionnel) : `demo-thumbnail.jpg`
3. Dans `Demo.jsx`, **commentez l'iframe YouTube** et **décommentez** la section vidéo locale :

```jsx
{/* Décommentez ce bloc */}
<video 
  controls 
  poster="/src/assets/demo-thumbnail.jpg"
  style={{...}}
>
  <source src="/src/assets/demo-video.mp4" type="video/mp4" />
  Votre navigateur ne supporte pas la vidéo HTML5.
</video>
```

**Formats vidéo recommandés :**
- `.mp4` (H.264) - Le plus compatible
- `.webm` - Meilleure compression
- Résolution : 1920x1080 (Full HD)
- Durée recommandée : 1-3 minutes

---

### Option 3 : Vidéo Vimeo

Remplacez l'iframe YouTube par un iframe Vimeo :

```jsx
<iframe 
  src="https://player.vimeo.com/video/VOTRE_VIDEO_ID?title=0&byline=0&portrait=0"
  ...
></iframe>
```

---

### Option 4 : Loom, Wistia ou autre service

La plupart des services de vidéo proposent un code d'intégration (embed code). Copiez simplement l'iframe fourni et remplacez celui existant dans `Demo.jsx`.

---

## Personnalisation du Badge "2 min de démo"

Dans `Demo.jsx`, trouvez cette section :

```jsx
<div className="info-badge">
  ...
  <span>2 min de démo</span>  {/* Modifiez la durée ici */}
</div>
```

---

## 🎯 Conseils pour une bonne vidéo de démo

1. **Durée idéale** : 1-3 minutes maximum
2. **Contenu** :
   - Montrez le produit en action
   - Mettez en avant 2-3 fonctionnalités clés
   - Terminez par un call-to-action
3. **Qualité** :
   - Résolution minimale : 1280x720 (HD)
   - Son clair et audible
   - Sous-titres recommandés (accessibilité)
4. **Thumbnail** :
   - Image accrocheuse
   - Titre visible si possible
   - Bouton "Play" suggéré

---

## 🔗 Ressources utiles

- **Créer une vidéo** : Loom, OBS Studio, ScreenFlow
- **Héberger gratuitement** : YouTube (non répertorié), Vimeo (gratuit limité)
- **Compression vidéo** : HandBrake, Cloudinary

---

## ⚠️ Note importante

Si vous utilisez une **vidéo locale** (Option 2), vérifiez que :
- Le fichier n'est pas trop lourd (< 50 MB recommandé)
- Vous avez les droits d'utilisation de la vidéo
- Le format est compatible avec tous les navigateurs

Pour les **vidéos YouTube/Vimeo**, assurez-vous que :
- La vidéo est bien publique ou "non répertoriée" (pas privée)
- L'intégration est autorisée (pas de blocage par l'auteur)
