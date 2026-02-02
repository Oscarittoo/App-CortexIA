# CORTEX AI - Professional Meeting Transcription & Analysis

## Professional Upgrade - Complete Feature Set

### Overview
CORTEX AI is a complete professional meeting transcription and analysis platform built with React, Electron, and modern web technologies. This latest version includes comprehensive professional features inspired by leading applications like Linear, Notion, and Slack.

---

## New Professional Features

### 1. Design System (Inspired by Linear, Notion, Slack)
- **Modern, clean design** with professional aesthetics
- **No emojis** in UI - pure professional interface
- **8px spacing grid** for consistent layout
- **Professional color palette** with semantic colors
- **Comprehensive component library** (buttons, inputs, cards, badges)
- **Dark mode support** with automatic theme switching
- **Smooth transitions** and animations throughout

### 2. Advanced Transcription System
- **Improved Web Speech API integration** with extensive debugging
- **Real-time transcription** with interim and final results
- **Confidence scores** for each transcript segment
- **Auto-restart** mechanism for continuous recording
- **Detailed status indicators** showing recognition lifecycle
- **Audio detection** alerts when no sound is detected
- **Microphone permission handling** with clear error messages

### 3. Professional Notifications System
- **Toast notifications** using react-hot-toast
- **Success, error, warning, and info** message types
- **Promise-based toasts** for async operations
- **Customizable duration** and positioning
- **Non-blocking** notification design
- **Professional styling** matching design system

### 4. PDF Export Service
- **Professional PDF generation** with jsPDF
- **Branded templates** with logo and company colors
- **Multi-section reports:**
  - Header with branding
  - Session metadata (date, duration, tags)
  - Summary section
  - Key points with bullet list
  - Action items table with columns (Action, Responsible, Priority, Deadline)
  - Decisions table with impact categorization
  - Participants list
  - Full transcript
  - Paginated footer with page numbers
- **Export single sessions** or batch export
- **Professional color schemes** and typography

### 5. Advanced Search & Filtering
- **Full-text search** across titles, transcripts, summaries, tags
- **Advanced filters:**
  - Date range (today, week, month, custom)
  - Minimum duration
  - Tag-based filtering (multi-select)
  - Content filters (has actions, has decisions)
- **Real-time search** results
- **Filter persistence** with clear all option
- **Search result count** and highlighting

### 6. Tag Management System
- **Tag creation and deletion**
- **Tag color customization** with predefined palette
- **Tag renaming** functionality
- **Tag-based organization** of sessions
- **Tag analytics** showing most used tags
- **Tag filtering** in search

### 7. Analytics Dashboard
- **Comprehensive statistics:**
  - Total sessions count
  - Total recording time
  - Average session duration
  - Total action items
  - Total decisions made
  - Sessions this week/month
- **Visual charts:**
  - Activity over time (bar chart - last 7 days)
  - Top tags distribution (pie chart)
  - Session trends
- **Recent activity feed** with quick access
- **Responsive design** adapting to screen size

### 8. Template System
- **Pre-built templates:**
  - Standard Meeting
  - Sprint Planning
  - One-on-One
  - Retrospective
  - Status Update
  - Brainstorming
- **Custom template creation**
- **Template variables** ({{title}}, {{date}}, etc.)
- **Automatic extraction** from transcripts:
  - User stories for sprint planning
  - Wins and challenges for 1-on-1s
  - What went well / to improve for retrospectives
  - Progress and blockers for status updates
  - Ideas for brainstorming sessions

### 9. Error Handling & Logging
- **Error Boundary** component catching React errors
- **Graceful error recovery** with reset option
- **Error logging** to localStorage (last 50 errors)
- **Detailed error information** for debugging
- **User-friendly error messages**
- **Automatic error reporting** with context

### 10. Professional Components
All UI components follow professional standards:
- **AdvancedSearch** - Multi-criteria search interface
- **TagManager** - Complete tag management UI
- **DashboardProfessional** - Analytics with charts
- **SessionsHistoryV2** - Grid layout with cards
- **ActiveSessionV2** - Improved recording interface
- **ErrorBoundary** - Global error handler
- **Toast** - Professional notifications

---

## Technical Architecture

### Frontend Stack
- **React 18.2.0** - Component framework
- **Vite 5.4.21** - Build tool and dev server
- **Electron 28.1.0** - Desktop application wrapper

### Key Libraries
- **jspdf** - PDF generation
- **jspdf-autotable** - PDF tables
- **react-hot-toast** - Notification system
- **date-fns** - Date formatting and manipulation
- **recharts** - Data visualization
- **lucide-react** - Professional icon set

### Services Architecture
```
src/
├── services/
│   ├── transcriptionService.js (Original - Web Speech API)
│   ├── transcriptionService.v2.js (New - Enhanced with debugging)
│   ├── pdfExportService.js (New - PDF generation)
│   ├── templateService.js (New - Template management)
│   ├── llmService.js (Existing - AI integration)
│   └── storage.js (Existing - localStorage wrapper)
├── components/
│   ├── ActiveSession.jsx (Original)
│   ├── ActiveSessionV2.jsx (New - Enhanced UI)
│   ├── SessionsHistory.jsx (Original)
│   ├── SessionsHistoryV2.jsx (New - With search)
│   ├── Dashboard.jsx (Original)
│   ├── DashboardProfessional.jsx (New - Advanced analytics)
│   ├── AdvancedSearch.jsx (New - Search UI)
│   ├── TagManager.jsx (New - Tag management)
│   ├── ErrorBoundary.jsx (New - Error handling)
│   └── Toast.jsx (New - Notifications)
├── hooks/
│   ├── useAnalytics.js (New - Analytics logic)
│   ├── useDarkMode.js (Existing)
│   └── useKeyboardShortcuts.js (Existing)
└── styles/
    ├── design-system.css (New - Base design system)
    └── [other style files]
```

---

## Usage Guide

### Starting a New Session
1. Click "Commencer" or "Nouvelle Session"
2. Configure:
   - Session title
   - Language (French/English)
   - Tags (optional)
   - Participants (optional)
3. Click "Démarrer" to begin recording
4. Speak into microphone - transcription appears in real-time
5. Pause/Resume as needed
6. Click "End Session" when finished

### Using Advanced Search
1. Navigate to "Historique"
2. Enter search query in search bar
3. Click "Filters" to open filter panel
4. Apply filters:
   - Select date range
   - Set minimum duration
   - Choose tags (multi-select)
   - Enable content filters
5. Click "Search" or press Enter
6. Clear filters with "Clear all filters"

### Exporting to PDF
**Single Session:**
1. Open session or view in history
2. Click "Export PDF" or download icon
3. PDF saved to Downloads folder

**Batch Export:**
1. In Sessions History, apply filters if needed
2. Click "Export All to PDF"
3. Summary PDF with all filtered sessions created

### Managing Tags
1. Go to Settings
2. Click "Manage Tags" section
3. Add new tags with "Add Tag" button
4. Edit tag names with edit icon
5. Delete unused tags with delete icon
6. Tags automatically color-coded

### Using Templates
1. Create new session
2. Select template from dropdown
3. Template auto-populates sections
4. Record session normally
5. Report generated with template format

### Viewing Analytics
1. Navigate to "Tableau de bord"
2. View statistics cards:
   - Total sessions
   - Total time
   - Action items
   - Decisions
   - Week/Month activity
3. Analyze charts:
   - Activity trends (last 7 days)
   - Tag distribution
4. Review recent sessions list

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + /` | Show shortcuts modal |
| `Ctrl + N` | New session |
| `Ctrl + H` | View history |
| `Ctrl + D` | View dashboard |
| `Ctrl + S` | Open settings |
| `Ctrl + P` | Pause/Resume recording |
| `Ctrl + E` | End session |

---

## Configuration

### Web Speech API
- **Browser Support:** Chrome, Edge, Safari (with limitations)
- **Network Required:** Yes (Google's speech recognition)
- **Languages:** French (fr-FR), English (en-US)
- **Continuous:** Yes, auto-restarts
- **Interim Results:** Yes

### Storage
- **Type:** localStorage (browser)
- **Limit:** ~5-10MB
- **Data:** Sessions, settings, tags, templates
- **Persistence:** Permanent until cleared
- **Future:** SQLite migration planned

### Electron Permissions
- **Microphone:** Auto-approved
- **Audio Capture:** Auto-approved
- **Media:** Auto-approved
- **Background Sync:** Denied (not needed)

---

## Development

### Running the Application
```bash
# Install dependencies
npm install

# Start development server
npm start

# This runs both:
# - Vite dev server (port 5173)
# - Electron app (loads from localhost:5173)
```

### Building for Production
```bash
# Build web assets
npm run build

# Package Electron app
npm run electron:build
```

### Project Structure
```
cortexa/
├── src/               # React source code
│   ├── components/    # React components
│   ├── services/      # Business logic
│   ├── hooks/         # Custom React hooks
│   ├── styles/        # CSS files
│   └── utils/         # Utility functions
├── electron/          # Electron main process
│   └── main.js        # Main process entry
├── public/            # Static assets
├── docs-pdf/          # Generated PDFs
├── package.json       # Dependencies
└── vite.config.js     # Vite configuration
```

---

## Troubleshooting

### Transcription Not Working
1. **Check browser:** Use Chrome or Edge
2. **Check internet:** Web Speech API requires connection
3. **Check microphone:** Allow permissions in browser
4. **Check console:** Look for error messages
5. **Restart app:** Close and reopen Electron

### PDF Export Failing
1. **Check session data:** Ensure session has content
2. **Check browser console:** Look for jsPDF errors
3. **Try single export:** Test with one session first
4. **Check disk space:** Ensure enough space for PDF

### Search Not Finding Results
1. **Check spelling:** Search is case-insensitive but exact
2. **Try fewer filters:** Remove some filters to broaden search
3. **Check date range:** Adjust date range if set
4. **Verify tags:** Ensure tagged sessions exist

### Charts Not Showing
1. **Check data:** Need at least one session
2. **Check browser:** Recharts requires modern browser
3. **Refresh page:** Try F5 to reload
4. **Clear cache:** Clear browser cache if persisted

---

## Future Enhancements

### Planned Features
- [ ] SQLite database migration
- [ ] Cloud sync (optional)
- [ ] Real-time collaboration
- [ ] Speaker identification
- [ ] Sentiment analysis
- [ ] Auto-summarization improvements
- [ ] Custom export templates
- [ ] Integration with calendar apps
- [ ] Mobile app (React Native)
- [ ] API for third-party integrations

---

## License & Credits

**CORTEX AI** - Professional Meeting Transcription & Analysis
Version 2.0 - Professional Edition

### Technologies Used
- React - https://react.dev
- Electron - https://electronjs.org
- Vite - https://vite.dev
- jsPDF - https://github.com/parallax/jsPDF
- Recharts - https://recharts.org
- Lucide Icons - https://lucide.dev

### Design Inspiration
- Linear - https://linear.app
- Notion - https://notion.so
- Slack - https://slack.com

---

## Support

For issues, questions, or feature requests:
1. Check console logs for errors
2. Review this documentation
3. Check GitHub issues (if applicable)
4. Contact development team

---

**Built with professional standards for professional users.**
