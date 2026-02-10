# 🎯 Meetizy Agent IA - Extension Chrome

Extension Chrome permettant d'intégrer l'intelligence artificielle Meetizy directement dans vos outils de visioconférence préférés.

## 🚀 Fonctionnalités

- ✅ **Transcription en temps réel** pendant vos réunions (Google Meet, Microsoft Teams, Zoom)
- ✅ **Widget flottant** pour contrôler la transcription sans quitter votre réunion
- ✅ **Synchronisation automatique** avec l'application Meetizy
- ✅ **Interface moderne** avec design NovaPulse
- ✅ **100% sécurisé** - Toutes les données restent locales jusqu'à la synchronisation

## 📦 Installation

### Méthode 1 : Via le site Meetizy (Recommandé)

1. Ouvrez l'application Meetizy
2. Cliquez sur le bouton **"Installer l'agent interactif IA"** dans la barre de navigation
3. Téléchargez le fichier manifest
4. Suivez les instructions à l'écran

### Méthode 2 : Installation manuelle

1. **Télécharger l'extension**
   - Clonez ce dossier `chrome-extension` sur votre ordinateur

2. **Ouvrir Chrome Extensions**
   - Allez à `chrome://extensions/` dans votre navigateur Chrome
   - Ou ouvrez le menu Chrome → Plus d'outils → Extensions

3. **Activer le Mode Développeur**
   - Activez le commutateur "Mode développeur" en haut à droite

4. **Charger l'extension**
   - Cliquez sur "Charger l'extension non empaquetée"
   - Sélectionnez le dossier `chrome-extension`

5. **Épingler l'extension**
   - Cliquez sur l'icône puzzle (extensions) dans la barre d'outils
   - Épinglez l'extension Meetizy pour un accès rapide

## 🎮 Utilisation

### Démarrer une transcription

1. Rejoignez une réunion sur **Google Meet**, **Microsoft Teams** ou **Zoom**
2. Cliquez sur l'icône Meetizy dans la barre d'outils Chrome
3. Cliquez sur **"▶ Démarrer la transcription"**
4. Un widget flottant apparaîtra dans le coin de votre écran
5. Parlez normalement - la transcription se fait automatiquement !

### Widget flottant

Le widget Meetizy affiche :
- **Statut de connexion** : Vérifie si l'application Meetizy est accessible
- **Plateforme détectée** : Affiche le nom de la plateforme de visioconférence
- **Transcription en temps réel** : Montre le texte transcrit en direct
- **Contrôles** : Démarrer/Arrêter la transcription

Vous pouvez **déplacer le widget** en le faisant glisser par l'en-tête.

### Synchronisation avec Meetizy

L'extension se synchronise automatiquement avec l'application Meetizy locale :
- **URL par défaut** : `http://localhost:5173`
- Les sessions sont sauvegardées localement et synchronisées à la fin
- Accédez au dashboard complet via le bouton "📊 Ouvrir Meetizy"

## 🔧 Configuration requise

- **Navigateur** : Chrome 88+ ou Edge 88+
- **Application Meetizy** : Doit être en cours d'exécution sur `localhost:5173`
- **Permissions** :
  - Accès aux onglets actifs
  - Stockage local
  - Accès à Google Meet, Teams, Zoom

## 🎨 Plateformes supportées

| Plateforme | Support | Statut |
|-----------|---------|--------|
| Google Meet | ✅ | Complet |
| Microsoft Teams | ✅ | Complet |
| Zoom | ✅ | Complet |

## 🔐 Sécurité & Confidentialité

- **Aucune donnée n'est envoyée** à des serveurs externes sans votre consentement
- **Stockage local** : Les transcriptions sont stockées localement dans votre navigateur
- **Synchronisation optionnelle** : Les données ne sont synchronisées avec Meetizy que si l'application est en cours d'exécution
- **RGPD conforme** : Respect total de vos données personnelles

## 🛠️ Développement

### Structure du projet

```
chrome-extension/
├── manifest.json       # Configuration de l'extension
├── popup.html          # Interface du popup
├── popup.js            # Logique du popup
├── background.js       # Service worker (gestion des sessions)
├── content.js          # Script injecté dans les pages
├── content.css         # Styles pour le widget
├── icons/              # Icônes de l'extension
└── README.md           # Ce fichier
```

### Technologies utilisées

- **Manifest V3** : Version moderne de l'API Chrome Extensions
- **Web Speech API** : Reconnaissance vocale native du navigateur
- **Chrome Storage API** : Stockage local des sessions
- **Service Workers** : Gestion des événements en arrière-plan

## 📝 Changelog

### Version 1.0.0 (Février 2026)
- 🎉 Version initiale
- ✅ Transcription temps réel (Google Meet, Teams, Zoom)
- ✅ Widget flottant déplaçable
- ✅ Synchronisation avec Meetizy
- ✅ Interface moderne NovaPulse

## 🐛 Problèmes connus

- La reconnaissance vocale nécessite une connexion Internet
- Sur certaines plateformes, le widget peut se superposer avec d'autres éléments

## 💡 Prochaines fonctionnalités

- [ ] Intégration ChatGPT-4 pour suggestions en temps réel
- [ ] Support multilingue (anglais, espagnol, allemand...)
- [ ] Analytics avancés
- [ ] Export direct vers PDF depuis l'extension
- [ ] Mode hors ligne avec synchronisation différée

## 📞 Support

Besoin d'aide ? Contactez-nous :
- 📧 Email : support@meetizy.com
- 💬 Discord : [Rejoindre la communauté](https://discord.gg/meetizy)
- 📖 Documentation : [docs.meetizy.com](https://docs.meetizy.com)

## 📄 Licence

© 2026 Meetizy. Tous droits réservés.

---

**Fait avec ❤️ par l'équipe Meetizy**
