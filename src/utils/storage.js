// Service de gestion du stockage local pour MEETIZY

const STORAGE_KEYS = {
  SESSIONS: 'meetizy_sessions',
  SETTINGS: 'meetizy_settings',
  API_KEYS: 'meetizy_api_keys',
  TAGS: 'meetizy_tags',
  TEMPLATES: 'meetizy_templates',
  STATS: 'meetizy_stats',
};

class StorageService {
  // ==================== SESSIONS ====================
  
  saveSession(session) {
    const sessions = this.getAllSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = {
        ...sessions[existingIndex],
        ...session,
        updatedAt: Date.now()
      };
    } else {
      sessions.push({
        ...session,
        createdAt: session.startTime || session.createdAt || Date.now(),
        updatedAt: Date.now()
      });
    }
    
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    this.updateStats(session);
    return session;
  }
  
  getAllSessions() {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!data) return [];
    let sessions = JSON.parse(data);
    
    // Nettoyage global du transcript dans chaque session
    sessions.forEach(session => {
      if (Array.isArray(session.transcript)) {
        session.transcript = session.transcript.map(item => {
          if (typeof item === 'string') {
            return item.trim().replace(/\.0$/, '');
          } else if (item && typeof item.text === 'string') {
            return { ...item, text: item.text.trim().replace(/\.0$/, '') };
          }
          return item;
        });
      }
    });
    return sessions;
  }
  
  getSession(id) {
    const sessions = this.getAllSessions();
    return sessions.find(s => s.id === id);
  }
  
  deleteSession(id) {
    const sessions = this.getAllSessions();
    const filtered = sessions.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(filtered));
  }
  
  searchSessions(query) {
    const sessions = this.getAllSessions();
    const lowerQuery = query.toLowerCase();
    
    return sessions.filter(session => {
      return (
        session.title?.toLowerCase().includes(lowerQuery) ||
        session.transcript?.some(t => t.text.toLowerCase().includes(lowerQuery)) ||
        session.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    });
  }
  
  filterSessions(filters) {
    let sessions = this.getAllSessions();
    
    if (filters.dateFrom) {
      sessions = sessions.filter(s => s.createdAt >= filters.dateFrom);
    }
    
    if (filters.dateTo) {
      sessions = sessions.filter(s => s.createdAt <= filters.dateTo);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      sessions = sessions.filter(s => 
        s.tags?.some(tag => filters.tags.includes(tag))
      );
    }
    
    if (filters.platform) {
      sessions = sessions.filter(s => s.platform === filters.platform);
    }
    
    if (filters.language) {
      sessions = sessions.filter(s => s.language === filters.language);
    }
    
    return sessions;
  }
  
  // ==================== TAGS ====================
  
  getAllTags() {
    const data = localStorage.getItem(STORAGE_KEYS.TAGS);
    return data ? JSON.parse(data) : [
      { id: 'work', name: 'Travail', color: '#64748b' },
      { id: 'personal', name: 'Personnel', color: '#64748b' },
      { id: 'urgent', name: 'Urgent', color: '#64748b' },
      { id: 'meeting', name: 'Réunion', color: '#64748b' },
    ];
  }
  
  saveTag(tag) {
    const tags = this.getAllTags();
    const existingIndex = tags.findIndex(t => t.id === tag.id);
    
    if (existingIndex >= 0) {
      tags[existingIndex] = tag;
    } else {
      tags.push(tag);
    }
    
    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
    return tag;
  }
  
  deleteTag(tagId) {
    const tags = this.getAllTags();
    const filtered = tags.filter(t => t.id !== tagId);
    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(filtered));
  }
  
  // ==================== TEMPLATES ====================
  
  getAllTemplates() {
    const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    return data ? JSON.parse(data) : [
      {
        id: 'default',
        name: 'Standard',
        content: `# Compte-rendu de réunion
{{date}}

## Participants
{{participants}}

## Résumé
{{summary}}

## Actions
{{actions}}

## Décisions
{{decisions}}
`
      },
      {
        id: 'agile',
        name: 'Sprint Planning',
        content: `# Sprint Planning - {{title}}
Date: {{date}}

## Objectifs du Sprint
{{summary}}

## User Stories
{{actions}}

## Points d'Attention
{{notes}}
`
      }
    ];
  }
  
  saveTemplate(template) {
    const templates = this.getAllTemplates();
    const existingIndex = templates.findIndex(t => t.id === template.id);
    
    if (existingIndex >= 0) {
      templates[existingIndex] = template;
    } else {
      templates.push(template);
    }
    
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
    return template;
  }
  
  // ==================== SETTINGS ====================
  
  getSettings() {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      darkMode: false,
      language: 'fr',
      notifications: true,
      autoSave: true,
      defaultQuality: 'high',
      defaultExportFormat: 'markdown',
      shortcuts: true,
      onboardingCompleted: false,
    };
  }
  
  saveSettings(settings) {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }
  
  // ==================== STATISTICS ====================
  
  getStats() {
    const data = localStorage.getItem(STORAGE_KEYS.STATS);
    return data ? JSON.parse(data) : {
      totalSessions: 0,
      totalDuration: 0,
      totalWords: 0,
      averageDuration: 0,
      sessionsThisWeek: 0,
      sessionsThisMonth: 0,
      mostUsedTags: [],
      platformUsage: {},
    };
  }
  
  updateStats(session) {
    const stats = this.getStats();
    const sessions = this.getAllSessions();
    
    stats.totalSessions = sessions.length;
    stats.totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    stats.totalWords = sessions.reduce((sum, s) => 
      sum + (s.transcript?.reduce((w, t) => w + t.text.split(' ').length, 0) || 0), 0
    );
    stats.averageDuration = stats.totalDuration / stats.totalSessions || 0;
    
    const now = Date.now();
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const monthAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    stats.sessionsThisWeek = sessions.filter(s => s.createdAt >= weekAgo).length;
    stats.sessionsThisMonth = sessions.filter(s => s.createdAt >= monthAgo).length;
    
    // Plateformes les plus utilisées
    stats.platformUsage = sessions.reduce((acc, s) => {
      acc[s.platform || 'local'] = (acc[s.platform || 'local'] || 0) + 1;
      return acc;
    }, {});
    
    // Tags les plus utilisés
    const tagCounts = {};
    sessions.forEach(s => {
      s.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    stats.mostUsedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));
    
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    return stats;
  }
  
  // ==================== EXPORT / IMPORT ====================
  
  exportAllData() {
    return {
      version: '1.0',
      exportDate: Date.now(),
      sessions: this.getAllSessions(),
      tags: this.getAllTags(),
      templates: this.getAllTemplates(),
      settings: this.getSettings(),
      stats: this.getStats(),
    };
  }
  
  importData(data) {
    if (data.sessions) {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(data.sessions));
    }
    if (data.tags) {
      localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(data.tags));
    }
    if (data.templates) {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(data.templates));
    }
    if (data.settings) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
    }
    if (data.stats) {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(data.stats));
    }
    return true;
  }
  
  clearAllData() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
  
  // ==================== BACKUP ====================
  
  createBackup() {
    const data = this.exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cortexia-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  restoreBackup(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          this.importData(data);
          resolve(true);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
}

export default new StorageService();
