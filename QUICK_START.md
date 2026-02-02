# CORTEX AI - Quick Start Guide

## Installation & Setup

### Prerequisites
- Node.js 18+ installed
- Chrome or Edge browser for Web Speech API
- Internet connection (required for Web Speech API)

### Quick Install
```bash
# Clone or download the project
cd cortexa

# Install dependencies
npm install

# Start the application
npm start
```

The application will:
1. Start Vite dev server on http://localhost:5173
2. Launch Electron app automatically
3. Open with microphone permissions pre-approved

---

## First Time Setup

### 1. Welcome Screen
- Click "Commencer" to start your first session
- Or explore the Dashboard to see the interface

### 2. Create First Session
1. Click "Nouvelle Session" in navigation
2. Fill in:
   - **Title:** e.g., "Team Standup"
   - **Language:** French or English
   - **Tags:** (optional) e.g., "development", "planning"
   - **Participants:** (optional) e.g., "John, Sarah, Mike"
3. Click "Démarrer l'enregistrement"

### 3. Recording Your First Session
- **Microphone access** dialog appears → Click "Allow"
- **Status indicator** shows "Listening... Speak now"
- **Speak clearly** into your microphone
- **Transcription appears** in real-time below
- **Pause/Resume** button if you need to pause
- **End Session** when meeting is complete

### 4. View Your Report
- Report auto-generates after ending session
- Shows:
  - Summary of discussion
  - Key points extracted
  - Action items identified
  - Decisions made
  - Full transcript
- **Export to PDF** with one click
- **Edit** to refine details
- **Save** to history automatically

---

## Using Professional Features

### Advanced Search
```
1. Go to "Historique" (History)
2. Enter search terms in search bar
3. Click "Filters" for advanced options:
   - Date range: Today, Week, Month, Custom
   - Duration: Minimum minutes
   - Tags: Select multiple
   - Content: Has actions, Has decisions
4. Click "Search" or press Enter
5. Results update instantly
```

### Export to PDF
**Single Session:**
```
History → Select session → Click PDF icon
```

**Multiple Sessions:**
```
History → Apply filters → Click "Export All to PDF"
```

### Tag Management
```
Settings → Manage Tags section
- Add Tag: Enter name → Click checkmark
- Edit Tag: Click edit icon → Change name → Save
- Delete Tag: Click trash icon → Confirm
```

### Analytics Dashboard
```
Click "Tableau de bord" in navigation

View:
- Total sessions, time, actions, decisions
- Activity chart (last 7 days)
- Top tags pie chart
- Recent sessions list
```

### Templates
```
New Session → Select template dropdown

Available templates:
- Standard Meeting (general)
- Sprint Planning (agile teams)
- One-on-One (1:1 meetings)
- Retrospective (sprint retros)
- Status Update (project status)
- Brainstorming (idea sessions)

Template auto-formats report sections
```

---

## Troubleshooting Common Issues

### "Microphone permission denied"
**Fix:**
1. Click lock icon in browser address bar
2. Set Microphone to "Allow"
3. Refresh page (F5)
4. Try recording again

### "No speech detected"
**Possible causes:**
- Microphone muted in OS
- Wrong microphone selected
- Speaking too quietly
- Microphone not plugged in

**Fix:**
1. Check Windows Sound Settings
2. Set correct default microphone
3. Test microphone in Sound Control Panel
4. Speak louder or closer to mic
5. Restart application

### "Transcription not working"
**Checklist:**
- [ ] Using Chrome or Edge browser
- [ ] Internet connection active
- [ ] Microphone permission granted
- [ ] Console shows no errors (F12 → Console tab)
- [ ] Try refreshing page (F5)
- [ ] Try closing and reopening app

### "PDF export failed"
**Fix:**
1. Ensure session has transcript data
2. Check browser console (F12) for errors
3. Try exporting single session first
4. Check Downloads folder for file
5. Clear browser cache (Ctrl+Shift+Delete)

### "Charts not displaying"
**Fix:**
1. Record at least one session first
2. Refresh Dashboard (click away and back)
3. Check console for errors
4. Clear localStorage: DevTools → Application → Local Storage → Clear All
5. Restart app

---

## Tips for Best Results

### Recording Quality
✅ **DO:**
- Use a good quality microphone
- Speak clearly and at normal pace
- Position mic 6-12 inches from mouth
- Record in quiet environment
- Pause when needed (use Pause button)
- End session properly (End Session button)

❌ **DON'T:**
- Speak too fast or mumble
- Record with background noise
- Use poor quality mic
- Let others speak over each other
- Forget to end session (data may be lost)

### Organizing Sessions
- **Use consistent tags:** "development", "planning", "client", etc.
- **Add participants:** Helps identify who was present
- **Edit titles:** Make them descriptive
- **Review reports:** Clean up any transcription errors
- **Export regularly:** Backup important sessions as PDF

### Search Efficiency
- **Use specific keywords:** Search for names, topics, dates
- **Combine filters:** Date range + Tags + Content filters
- **Save common searches:** Note down effective search patterns
- **Review regularly:** Check old sessions for action items

---

## Keyboard Shortcuts Reference

| Shortcut | Action |
|----------|--------|
| `Ctrl + /` | Show shortcuts |
| `Ctrl + N` | New session |
| `Ctrl + H` | View history |
| `Ctrl + D` | Dashboard |
| `Ctrl + S` | Settings |
| `Ctrl + P` | Pause/Resume |
| `Ctrl + E` | End session |
| `F5` | Refresh page |
| `F11` | Fullscreen |
| `F12` | Developer tools |

---

## Data & Privacy

### Where is data stored?
- **localStorage** (browser storage)
- **On your computer** only
- **Not sent to cloud** (except Web Speech API for transcription)
- **Automatically saved** after each session

### What data is collected?
- Session transcripts
- Session metadata (title, date, duration)
- Tags and participants
- Generated reports
- Error logs (stored locally)

### How to backup?
1. Export sessions to PDF regularly
2. Copy localStorage data:
   - F12 → Application → Local Storage
   - Copy all CORTEXIA keys
   - Save to text file
3. Future: SQLite backup feature

### How to clear data?
```javascript
// Open browser console (F12)
localStorage.clear();
location.reload();
```

---

## Getting Help

### Check Logs
```
Press F12 → Console tab
Look for red error messages
Copy error text for support
```

### Common Error Messages

**"Web Speech API not supported"**
→ Use Chrome or Edge browser

**"Network error - requires internet"**
→ Check your internet connection

**"Audio capture failed"**
→ Check microphone permissions

**"Recognition error: not-allowed"**
→ Grant microphone permission

---

## Next Steps

After your first session:

1. **Explore Dashboard** - See your statistics
2. **Try Search** - Find specific content
3. **Export PDF** - Create professional reports
4. **Create Tags** - Organize sessions
5. **Try Templates** - Use pre-built formats
6. **Review Analytics** - Track your progress

---

## Updates & Changelog

### Version 2.0 - Professional Edition
- ✨ Complete professional redesign
- ✨ Advanced search and filtering
- ✨ PDF export with beautiful templates
- ✨ Analytics dashboard with charts
- ✨ Tag management system
- ✨ Template library
- ✨ Error handling and logging
- ✨ Professional notifications
- 🐛 Fixed transcription reliability
- 🐛 Improved microphone permissions
- 🎨 Modern design inspired by Linear/Notion/Slack

---

**You're ready to start!** Click "Commencer" and record your first session.

For detailed documentation, see `PROFESSIONAL_FEATURES.md`
