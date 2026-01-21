// Service d'export de sessions

import storageService from './storage';

class ExportService {
  // ==================== MARKDOWN ====================
  exportMarkdown(session) {
    const tags = storageService.getAllTags();
    const sessionTags = session.tags?.map(tagId => 
      tags.find(t => t.id === tagId)?.name
    ).filter(Boolean).join(', ') || 'Aucun';

    let content = `# ${session.title || 'Session sans titre'}\n\n`;
    content += `**Date :** ${new Date(session.createdAt).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}\n\n`;
    content += `**Durée :** ${this.formatDuration(session.duration)}\n`;
    content += `**Plateforme :** ${this.getPlatformName(session.platform)}\n`;
    content += `**Langue :** ${session.language === 'fr' ? 'Français' : 'Anglais'}\n`;
    content += `**Tags :** ${sessionTags}\n\n`;
    content += `---\n\n`;
    
    content += `## 📝 Transcription\n\n`;
    
    session.transcript?.forEach(line => {
      if (line.isSystem) {
        content += `> *${line.text}*\n\n`;
      } else if (line.marked) {
        content += `**[${new Date(line.timestamp).toLocaleTimeString('fr-FR')}] ${line.speaker}:** ${line.text} 📌\n\n`;
      } else {
        content += `**[${new Date(line.timestamp).toLocaleTimeString('fr-FR')}] ${line.speaker}:** ${line.text}\n\n`;
      }
    });
    
    content += `\n---\n\n`;
    content += `*Généré par CORTEXIA - ${new Date().toLocaleDateString('fr-FR')}*\n`;
    
    this.download(content, `${session.title || 'session'}.md`, 'text/markdown');
  }

  // ==================== JSON ====================
  exportJSON(session) {
    const data = {
      meta: {
        id: session.id,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        duration: session.duration,
        platform: session.platform,
        language: session.language,
        tags: session.tags,
      },
      transcript: session.transcript,
      exportDate: Date.now(),
      version: '1.0'
    };
    
    const json = JSON.stringify(data, null, 2);
    this.download(json, `${session.title || 'session'}.json`, 'application/json');
  }

  // ==================== HTML ====================
  exportHTML(session) {
    const tags = storageService.getAllTags();
    const sessionTags = session.tags?.map(tagId => {
      const tag = tags.find(t => t.id === tagId);
      return tag ? `<span style="background: ${tag.color}; color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px;">${tag.name}</span>` : '';
    }).filter(Boolean).join(' ') || 'Aucun';

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${session.title || 'Session CORTEXIA'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f9fafb;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    h1 {
      font-size: 32px;
      margin-bottom: 20px;
      color: #0891d4;
    }
    .meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      padding: 20px;
      background: #f3f4f6;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
    }
    .meta-label {
      font-size: 12px;
      color: #6b7280;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .meta-value {
      font-size: 14px;
      color: #1f2937;
      font-weight: 500;
    }
    .transcript {
      margin-top: 30px;
    }
    .transcript-line {
      margin-bottom: 20px;
      padding: 12px;
      background: #f9fafb;
      border-left: 3px solid #0891d4;
      border-radius: 4px;
    }
    .transcript-line.marked {
      background: #f0f9ff;
      border-left-color: #f59e0b;
    }
    .line-meta {
      display: flex;
      gap: 12px;
      margin-bottom: 6px;
      font-size: 13px;
    }
    .timestamp {
      color: #6b7280;
      font-family: 'Courier New', monospace;
    }
    .speaker {
      color: #0891d4;
      font-weight: 600;
    }
    .line-text {
      color: #1f2937;
      font-size: 15px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 13px;
      color: #6b7280;
    }
    @media print {
      body { background: white; }
      .container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${session.title || 'Session sans titre'}</h1>
    
    <div class="meta">
      <div class="meta-item">
        <span class="meta-label">Date</span>
        <span class="meta-value">${new Date(session.createdAt).toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Durée</span>
        <span class="meta-value">${this.formatDuration(session.duration)}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Plateforme</span>
        <span class="meta-value">${this.getPlatformName(session.platform)}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Tags</span>
        <span class="meta-value">${sessionTags}</span>
      </div>
    </div>

    <h2>📝 Transcription</h2>
    <div class="transcript">
      ${session.transcript?.map(line => `
        <div class="transcript-line ${line.marked ? 'marked' : ''}">
          <div class="line-meta">
            <span class="timestamp">${new Date(line.timestamp).toLocaleTimeString('fr-FR')}</span>
            <span class="speaker">${line.speaker}</span>
            ${line.marked ? '<span style="color: #f59e0b;">📌</span>' : ''}
          </div>
          <div class="line-text">${line.text}</div>
        </div>
      `).join('') || '<p>Aucune transcription</p>'}
    </div>

    <div class="footer">
      <p>Généré par <strong>CORTEXIA</strong> - ${new Date().toLocaleDateString('fr-FR')}</p>
    </div>
  </div>
</body>
</html>`;

    this.download(html, `${session.title || 'session'}.html`, 'text/html');
  }

  // ==================== SRT (Subtitles) ====================
  exportSRT(session) {
    let srt = '';
    let index = 1;
    
    session.transcript?.forEach((line, i) => {
      if (line.isSystem || !line.text) return;
      
      const startTime = new Date(line.timestamp);
      const nextTime = session.transcript[i + 1]?.timestamp 
        ? new Date(session.transcript[i + 1].timestamp)
        : new Date(startTime.getTime() + 3000);
      
      srt += `${index}\n`;
      srt += `${this.formatSRTTime(startTime)} --> ${this.formatSRTTime(nextTime)}\n`;
      srt += `${line.speaker}: ${line.text}\n\n`;
      
      index++;
    });
    
    this.download(srt, `${session.title || 'session'}.srt`, 'text/plain');
  }

  formatSRTTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ms = String(date.getMilliseconds()).padStart(3, '0');
    return `${hours}:${minutes}:${seconds},${ms}`;
  }

  // ==================== TXT (Plain Text) ====================
  exportTXT(session) {
    let content = `${session.title || 'Session sans titre'}\n`;
    content += `Date: ${new Date(session.createdAt).toLocaleString('fr-FR')}\n`;
    content += `Durée: ${this.formatDuration(session.duration)}\n\n`;
    content += `${'='.repeat(60)}\n\n`;
    
    session.transcript?.forEach(line => {
      if (!line.isSystem) {
        content += `[${new Date(line.timestamp).toLocaleTimeString('fr-FR')}] ${line.speaker}: ${line.text}\n\n`;
      }
    });
    
    this.download(content, `${session.title || 'session'}.txt`, 'text/plain');
  }

  // ==================== CSV ====================
  exportCSV(session) {
    let csv = 'Timestamp,Speaker,Text,Marked\n';
    
    session.transcript?.forEach(line => {
      const time = new Date(line.timestamp).toISOString();
      const speaker = line.speaker || '';
      const text = `"${(line.text || '').replace(/"/g, '""')}"`;
      const marked = line.marked ? 'Yes' : 'No';
      
      csv += `${time},${speaker},${text},${marked}\n`;
    });
    
    this.download(csv, `${session.title || 'session'}.csv`, 'text/csv');
  }

  // ==================== HELPERS ====================
  formatDuration(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}h ${mins}min ${secs}s`;
    } else if (mins > 0) {
      return `${mins}min ${secs}s`;
    }
    return `${secs}s`;
  }

  getPlatformName(platform) {
    const names = {
      local: 'Local (Microphone)',
      zoom: 'Zoom',
      'google-meet': 'Google Meet',
      teams: 'Microsoft Teams',
      webex: 'Cisco Webex',
      slack: 'Slack Huddle',
      discord: 'Discord'
    };
    return names[platform] || platform;
  }

  download(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ==================== EXPORT ALL SESSIONS ====================
  exportAllSessions(format = 'json') {
    const sessions = storageService.getAllSessions();
    
    if (format === 'json') {
      const data = {
        exportDate: Date.now(),
        sessionsCount: sessions.length,
        sessions: sessions,
        version: '1.0'
      };
      
      const json = JSON.stringify(data, null, 2);
      this.download(json, `cortexia-all-sessions-${Date.now()}.json`, 'application/json');
    } else if (format === 'csv') {
      let csv = 'ID,Title,Date,Duration,Platform,Language,Transcript Length\n';
      
      sessions.forEach(session => {
        csv += `${session.id},"${session.title || ''}",${new Date(session.createdAt).toISOString()},${session.duration},${session.platform},${session.language},${session.transcript?.length || 0}\n`;
      });
      
      this.download(csv, `cortexia-sessions-index-${Date.now()}.csv`, 'text/csv');
    }
  }
}

export default new ExportService();
