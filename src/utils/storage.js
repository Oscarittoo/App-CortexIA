// Service de gestion du stockage local pour MEETIZY
import authService from '../services/authService';

const STORAGE_KEYS = {
  SESSIONS: 'meetizy_sessions',
  SETTINGS: 'meetizy_settings',
  API_KEYS: 'meetizy_api_keys',
  TAGS: 'meetizy_tags',
  TEMPLATES: 'meetizy_templates',
  STATS: 'meetizy_stats',
  CUSTOM_TEMPLATES: 'meetizy_custom_templates',
  SELECTED_TEMPLATE: 'meetizy_selected_template',
  ACTION_STATES: 'meetizy_action_states',
  DAILY_METRICS: 'meetizy_daily_metrics', // Nouvelles métriques quotidiennes
};

class StorageService {
  constructor() {
    this._currentUserId = null;
  }

  /**
   * Définit manuellement l'utilisateur actuel (appelé par App.jsx)
   */
  setCurrentUser(userId) {
    this._currentUserId = userId;
    console.log(`StorageService: Utilisateur défini -> ${userId}`);
  }

  /**
   * Récupère l'ID de l'utilisateur connecté
   */
  getCurrentUserId() {
    // Priorité 1: utiliser le userId défini manuellement
    if (this._currentUserId) {
      return this._currentUserId;
    }
    
    // Priorité 2: essayer de récupérer depuis authService
    const user = authService.currentUser;
    if (user?.id) {
      this._currentUserId = user.id;
      return user.id;
    }
    
    console.warn('Aucun utilisateur connecté détecté');
    return null;
  }

  // ==================== SESSIONS ====================
  
  saveSession(session) {
    const userId = this.getCurrentUserId();
    if (!userId) {
      console.warn('Impossible de sauvegarder la session : utilisateur non connecté');
      return session;
    }

    const allSessions = this._getAllSessionsRaw(); // Toutes les sessions (tous utilisateurs)
    const existingIndex = allSessions.findIndex(s => s.id === session.id && s.userId === userId);
    
    const sessionWithUser = {
      ...session,
      userId, // Associer la session à l'utilisateur
      updatedAt: Date.now()
    };

    if (existingIndex >= 0) {
      allSessions[existingIndex] = {
        ...allSessions[existingIndex],
        ...sessionWithUser
      };
    } else {
      allSessions.push({
        ...sessionWithUser,
        createdAt: session.startTime || session.createdAt || Date.now()
      });
    }
    
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(allSessions));
    } catch (e) {
      if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22)) {
        // Stockage plein : supprimer les 3 sessions les plus anciennes et réessayer
        const userId = this.getCurrentUserId();
        const toDelete = allSessions
          .filter(s => s.userId === userId)
          .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
          .slice(0, 3)
          .map(s => s.id);
        const trimmed = allSessions.filter(s => !toDelete.includes(s.id));
        try {
          localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(trimmed));
        } catch {
          throw new Error('Stockage local plein. Supprimez des anciennes sessions pour libérer de l\'espace.');
        }
      } else {
        throw e;
      }
    }
    this.updateStats(session);
    return sessionWithUser;
  }

  /**
   * Récupère TOUTES les sessions (tous utilisateurs) - méthode interne
   */
  _getAllSessionsRaw() {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!data) return [];
    return JSON.parse(data);
  }
  
  /**
   * Récupère uniquement les sessions de l'utilisateur connecté
   */
  getAllSessions() {
    const userId = this.getCurrentUserId();
    if (!userId) {
      console.warn('getAllSessions: Aucun utilisateur connecté - retour d\'un tableau vide');
      return [];
    }

    const allSessions = this._getAllSessionsRaw();
    console.log(`Total sessions en BDD: ${allSessions.length}`);
    
    // FILTRE STRICT : uniquement les sessions avec le bon userId
    let sessions = allSessions.filter(s => {
      const match = s.userId === userId;
      if (!s.userId) {
        console.log(`Session orpheline détectée: ${s.id} (${s.title || 'Sans titre'})`);
      }
      return match;
    });
    
    console.log(`Sessions pour l'utilisateur ${userId}: ${sessions.length}`);
    
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

  /**
   * [ADMIN] Récupère les sessions orphelines (sans userId)
   */
  getOrphanSessions() {
    const allSessions = this._getAllSessionsRaw();
    return allSessions.filter(s => !s.userId);
  }

  /**
   * [ADMIN] Réattribue les sessions orphelines à un utilisateur
   */
  assignOrphanSessions(targetUserId) {
    if (!targetUserId) return 0;

    const allSessions = this._getAllSessionsRaw();
    let count = 0;

    const updated = allSessions.map(session => {
      if (!session.userId) {
        count++;
        return { ...session, userId: targetUserId };
      }
      return session;
    });

    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
    console.log(`${count} sessions orphelines attribuées à ${targetUserId}`);
    return count;
  }

  /**
   * [ADMIN] Supprime toutes les sessions orphelines (sans userId)
   */
  deleteOrphanSessions() {
    const allSessions = this._getAllSessionsRaw();
    const orphans = allSessions.filter(s => !s.userId);
    const kept = allSessions.filter(s => s.userId);
    
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(kept));
    console.log(`${orphans.length} sessions orphelines supprimées`);
    return orphans.length;
  }
  
  getSession(id) {
    const sessions = this.getAllSessions(); // Déjà filtré par utilisateur
    return sessions.find(s => s.id === id);
  }
  
  deleteSession(id) {
    const userId = this.getCurrentUserId();
    if (!userId) return;

    const allSessions = this._getAllSessionsRaw();
    // Supprimer uniquement si la session appartient à l'utilisateur
    const filtered = allSessions.filter(s => !(s.id === id && s.userId === userId));
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(filtered));

    // Nettoyer les états d'actions associés à cette session
    const actionStates = this.getActionStates();
    const cleaned = Object.keys(actionStates).reduce((acc, key) => {
      if (!key.startsWith(`${id}-`)) {
        acc[key] = actionStates[key];
      }
      return acc;
    }, {});
    const actionKey = this._getActionStatesKey(userId);
    localStorage.setItem(actionKey, JSON.stringify(cleaned));
  }

  updateSession(id, updates) {
    const userId = this.getCurrentUserId();
    if (!userId) return null;

    const allSessions = this._getAllSessionsRaw();
    const index = allSessions.findIndex(s => s.id === id && s.userId === userId);
    if (index === -1) return null;

    const updatedSession = {
      ...allSessions[index],
      ...updates,
      updatedAt: Date.now()
    };

    allSessions[index] = updatedSession;
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(allSessions));
    return updatedSession;
  }
  
  searchSessions(query) {
    const sessions = this.getAllSessions();
    const lowerQuery = query.toLowerCase();
    
    return sessions.filter(session => {
      return (
        session.title?.toLowerCase().includes(lowerQuery) ||
        session.transcript?.some(t => {
          const text = typeof t === 'string' ? t : t?.text;
          return text?.toLowerCase().includes(lowerQuery);
        }) ||
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
  
  _getTagsKey(userId) {
    return `${STORAGE_KEYS.TAGS}_${userId}`;
  }

  getAllTags() {
    const userId = this.getCurrentUserId();
    if (!userId) {
      console.warn('getAllTags: Aucun utilisateur connecté');
      return [
        { id: 'work', name: 'Travail', color: '#64748b' },
        { id: 'personal', name: 'Personnel', color: '#64748b' },
        { id: 'urgent', name: 'Urgent', color: '#64748b' },
        { id: 'meeting', name: 'Réunion', color: '#64748b' },
      ];
    }

    const key = this._getTagsKey(userId);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [
      { id: 'work', name: 'Travail', color: '#64748b' },
      { id: 'personal', name: 'Personnel', color: '#64748b' },
      { id: 'urgent', name: 'Urgent', color: '#64748b' },
      { id: 'meeting', name: 'Réunion', color: '#64748b' },
    ];
  }
  
  saveTag(tag) {
    const userId = this.getCurrentUserId();
    if (!userId) {
      console.warn('saveTag: Impossible de sauvegarder sans utilisateur');
      return null;
    }

    const tags = this.getAllTags();
    const existingIndex = tags.findIndex(t => t.id === tag.id);
    
    if (existingIndex >= 0) {
      tags[existingIndex] = tag;
    } else {
      tags.push(tag);
    }
    
    const key = this._getTagsKey(userId);
    localStorage.setItem(key, JSON.stringify(tags));
    console.log(`Tag sauvegardé pour l'utilisateur ${userId}`);
    return tag;
  }
  
  deleteTag(tagId) {
    const userId = this.getCurrentUserId();
    if (!userId) return;

    const tags = this.getAllTags();
    const filtered = tags.filter(t => t.id !== tagId);
    const key = this._getTagsKey(userId);
    localStorage.setItem(key, JSON.stringify(filtered));
  }
  
  // ==================== TEMPLATES ====================
  
  _getTemplatesKey(userId) {
    return `${STORAGE_KEYS.TEMPLATES}_${userId}`;
  }

  _getCustomTemplatesKey(userId) {
    return `${STORAGE_KEYS.CUSTOM_TEMPLATES}_${userId}`;
  }

  _getSelectedTemplateKey(userId) {
    return `${STORAGE_KEYS.SELECTED_TEMPLATE}_${userId}`;
  }

  getAllTemplates() {
    const userId = this.getCurrentUserId();
    if (!userId) {
      console.warn('getAllTemplates: Aucun utilisateur connecté');
      return [
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

    const key = this._getTemplatesKey(userId);
    const data = localStorage.getItem(key);
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
    const userId = this.getCurrentUserId();
    if (!userId) {
      console.warn('saveTemplate: Impossible de sauvegarder sans utilisateur');
      return null;
    }

    const templates = this.getAllTemplates();
    const existingIndex = templates.findIndex(t => t.id === template.id);
    
    if (existingIndex >= 0) {
      templates[existingIndex] = template;
    } else {
      templates.push(template);
    }
    
    const key = this._getTemplatesKey(userId);
    localStorage.setItem(key, JSON.stringify(templates));
    console.log(`Template sauvegardé pour l'utilisateur ${userId}`);
    return template;
  }

  getCustomTemplates() {
    const userId = this.getCurrentUserId();
    if (!userId) return [];

    const key = this._getCustomTemplatesKey(userId);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  saveCustomTemplates(templates) {
    const userId = this.getCurrentUserId();
    if (!userId) return [];

    const key = this._getCustomTemplatesKey(userId);
    localStorage.setItem(key, JSON.stringify(templates));
    return templates;
  }

  getSelectedTemplate() {
    const userId = this.getCurrentUserId();
    if (!userId) return null;

    const key = this._getSelectedTemplateKey(userId);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  setSelectedTemplate(template) {
    const userId = this.getCurrentUserId();
    if (!userId) return null;

    const key = this._getSelectedTemplateKey(userId);
    localStorage.setItem(key, JSON.stringify(template));
    return template;
  }

  clearSelectedTemplate() {
    const userId = this.getCurrentUserId();
    if (!userId) return;

    const key = this._getSelectedTemplateKey(userId);
    localStorage.removeItem(key);
  }
  
  // ==================== SETTINGS ====================
  
  _getSettingsKey(userId) {
    return `${STORAGE_KEYS.SETTINGS}_${userId}`;
  }

  getSettings() {
    const userId = this.getCurrentUserId();
    if (!userId) {
      console.warn('getSettings: Aucun utilisateur connecté');
      return {
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

    const key = this._getSettingsKey(userId);
    const data = localStorage.getItem(key);
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
    const userId = this.getCurrentUserId();
    if (!userId) {
      console.warn('saveSettings: Impossible de sauvegarder sans utilisateur');
      return null;
    }

    const current = this.getSettings();
    const updated = { ...current, ...settings };
    const key = this._getSettingsKey(userId);
    localStorage.setItem(key, JSON.stringify(updated));
    console.log(`Paramètres sauvegardés pour l'utilisateur ${userId}`);
    return updated;
  }
  
  // ==================== STATISTICS ====================
  
  _getStatsKey(userId) {
    return `${STORAGE_KEYS.STATS}_${userId}`;
  }

  _getActionStatesKey(userId) {
    return `${STORAGE_KEYS.ACTION_STATES}_${userId}`;
  }

  getActionStates() {
    const userId = this.getCurrentUserId();
    if (!userId) return {};

    const key = this._getActionStatesKey(userId);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  }

  setActionState(actionKey, state) {
    const userId = this.getCurrentUserId();
    if (!userId) return null;

    const key = this._getActionStatesKey(userId);
    const existing = this.getActionStates();
    const updated = {
      ...existing,
      [actionKey]: {
        ...(existing[actionKey] || {}),
        ...state
      }
    };
    localStorage.setItem(key, JSON.stringify(updated));
    return updated[actionKey];
  }

  getStats() {
    const userId = this.getCurrentUserId();
    if (!userId) {
      console.warn('getStats: Aucun utilisateur connecté');
      return {
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

    const key = this._getStatsKey(userId);
    const data = localStorage.getItem(key);
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
    const userId = this.getCurrentUserId();
    if (!userId) {
      console.warn('updateStats: Impossible de mettre à jour sans utilisateur');
      return null;
    }

    const stats = this.getStats();
    const sessions = this.getAllSessions();
    
    stats.totalSessions = sessions.length;
    stats.totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    stats.totalWords = sessions.reduce((sum, s) => 
      sum + (s.transcript?.reduce((w, t) => {
        const text = typeof t === 'string' ? t : t?.text;
        return w + (text ? text.split(' ').length : 0);
      }, 0) || 0), 0
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
    
    const key = this._getStatsKey(userId);
    localStorage.setItem(key, JSON.stringify(stats));
    console.log(`Statistiques mises à jour pour l'utilisateur ${userId}`);
    return stats;
  }
  
  // ==================== EXPORT / IMPORT ====================
  
  exportAllData() {
    return {
      version: '1.0',
      exportDate: Date.now(),
      sessions: this.getAllSessions(), // Uniquement les sessions de l'utilisateur
      tags: this.getAllTags(),
      templates: this.getAllTemplates(),
      customTemplates: this.getCustomTemplates(),
      selectedTemplate: this.getSelectedTemplate(),
      settings: this.getSettings(),
      stats: this.getStats(),
      actionStates: this.getActionStates(),
    };
  }
  
  importData(data) {
    const userId = this.getCurrentUserId();
    if (!userId) {
      console.warn('Impossible d\'importer sans utilisateur connecté');
      return false;
    }

    if (data.sessions) {
      // Ajouter le userId à toutes les sessions importées
      const sessionsWithUserId = data.sessions.map(s => ({ ...s, userId }));
      const existingSessions = this._getAllSessionsRaw();
      const merged = [...existingSessions, ...sessionsWithUserId];
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(merged));
    }
    if (data.tags) {
      const key = this._getTagsKey(userId);
      localStorage.setItem(key, JSON.stringify(data.tags));
    }
    if (data.templates) {
      const key = this._getTemplatesKey(userId);
      localStorage.setItem(key, JSON.stringify(data.templates));
    }
    if (data.customTemplates) {
      this.saveCustomTemplates(data.customTemplates);
    }
    if (data.selectedTemplate) {
      this.setSelectedTemplate(data.selectedTemplate);
    }
    if (data.settings) {
      const key = this._getSettingsKey(userId);
      localStorage.setItem(key, JSON.stringify(data.settings));
    }
    if (data.stats) {
      const key = this._getStatsKey(userId);
      localStorage.setItem(key, JSON.stringify(data.stats));
    }
    if (data.actionStates) {
      const key = this._getActionStatesKey(userId);
      localStorage.setItem(key, JSON.stringify(data.actionStates));
    }
    console.log(`Données importées pour l'utilisateur ${userId}`);
    return true;
  }
  
  clearAllData() {
    const userId = this.getCurrentUserId();
    if (userId) {
      // Supprimer uniquement les données de l'utilisateur actuel
      const allSessions = this._getAllSessionsRaw();
      const otherUsersSessions = allSessions.filter(s => s.userId !== userId);
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(otherUsersSessions));
      
      // Supprimer les autres données de l'utilisateur
      localStorage.removeItem(this._getTagsKey(userId));
      localStorage.removeItem(this._getTemplatesKey(userId));
      localStorage.removeItem(this._getCustomTemplatesKey(userId));
      localStorage.removeItem(this._getSelectedTemplateKey(userId));
      localStorage.removeItem(this._getSettingsKey(userId));
      localStorage.removeItem(this._getStatsKey(userId));
      localStorage.removeItem(this._getActionStatesKey(userId));
      
      console.log(`Toutes les données de l'utilisateur ${userId} supprimées`);
    } else {
      // Si pas d'utilisateur connecté, nettoyage complet (cas d'école)
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    }
  }

  /**
   * Supprime uniquement les rapports IA (résumé/actions/décisions/email) pour l'utilisateur courant
   */
  clearAiReports() {
    const userId = this.getCurrentUserId();
    if (!userId) return 0;

    const allSessions = this._getAllSessionsRaw();
    let updatedCount = 0;

    const updatedSessions = allSessions.map(session => {
      if (session.userId !== userId) {
        return session;
      }

      const hasAiReport = session.summary || session.actions || session.decisions || session.email || session.aiGenerated;
      if (!hasAiReport) {
        return session;
      }

      updatedCount += 1;
      const cleaned = { ...session };
      delete cleaned.summary;
      delete cleaned.actions;
      delete cleaned.decisions;
      delete cleaned.email;
      delete cleaned.aiGenerated;
      delete cleaned.generatedAt;
      return cleaned;
    });

    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updatedSessions));
    console.log(`Rapports IA supprimés pour ${updatedCount} session(s)`);
    return updatedCount;
  }

  // ==================== MIGRATION & DETECTION ====================

  /**
   * Détecte les anciennes données (sans userId) qui peuvent être migrées
   */
  detectLegacyData() {
    const legacy = {
      hasTags: localStorage.getItem(STORAGE_KEYS.TAGS) !== null,
      hasTemplates: localStorage.getItem(STORAGE_KEYS.TEMPLATES) !== null,
      hasSettings: localStorage.getItem(STORAGE_KEYS.SETTINGS) !== null,
      hasStats: localStorage.getItem(STORAGE_KEYS.STATS) !== null,
      hasCustomTemplates: localStorage.getItem('customTemplates') !== null,
      hasSelectedTemplate: localStorage.getItem('selectedTemplate') !== null,
    };
    
    legacy.hasAny = Object.values(legacy).some(v => v === true);
    return legacy;
  }

  /**
   * Migre les anciennes données vers l'utilisateur actuel
   */
  migrateLegacyDataToCurrentUser() {
    const userId = this.getCurrentUserId();
    if (!userId) {
      console.warn('Impossible de migrer sans utilisateur connecté');
      return { success: false, count: 0 };
    }

    let count = 0;

    // Migrer les tags
    const oldTags = localStorage.getItem(STORAGE_KEYS.TAGS);
    if (oldTags) {
      const key = this._getTagsKey(userId);
      localStorage.setItem(key, oldTags);
      localStorage.removeItem(STORAGE_KEYS.TAGS);
      count++;
      console.log('Tags migrés');
    }

    // Migrer les templates
    const oldTemplates = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    if (oldTemplates) {
      const key = this._getTemplatesKey(userId);
      localStorage.setItem(key, oldTemplates);
      localStorage.removeItem(STORAGE_KEYS.TEMPLATES);
      count++;
      console.log('Templates migrés');
    }

    // Migrer les custom templates (ancienne clé)
    const oldCustomTemplates = localStorage.getItem('customTemplates');
    if (oldCustomTemplates) {
      const key = this._getCustomTemplatesKey(userId);
      localStorage.setItem(key, oldCustomTemplates);
      localStorage.removeItem('customTemplates');
      count++;
      console.log('Templates personnalisés migrés');
    }

    // Migrer le template sélectionné (ancienne clé)
    const oldSelectedTemplate = localStorage.getItem('selectedTemplate');
    if (oldSelectedTemplate) {
      const key = this._getSelectedTemplateKey(userId);
      localStorage.setItem(key, oldSelectedTemplate);
      localStorage.removeItem('selectedTemplate');
      count++;
      console.log('Template sélectionné migré');
    }

    // Migrer les settings
    const oldSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (oldSettings) {
      const key = this._getSettingsKey(userId);
      localStorage.setItem(key, oldSettings);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      count++;
      console.log('Paramètres migrés');
    }

    // Migrer les stats
    const oldStats = localStorage.getItem(STORAGE_KEYS.STATS);
    if (oldStats) {
      const key = this._getStatsKey(userId);
      localStorage.setItem(key, oldStats);
      localStorage.removeItem(STORAGE_KEYS.STATS);
      count++;
      console.log('Statistiques migrées');
    }

    console.log(`Migration terminée : ${count} type(s) de données migré(s) pour l'utilisateur ${userId}`);
    return { success: true, count };
  }

  /**
   * Supprime toutes les anciennes données (sans userId)
   */
  deleteLegacyData() {
    let count = 0;

    if (localStorage.getItem(STORAGE_KEYS.TAGS)) {
      localStorage.removeItem(STORAGE_KEYS.TAGS);
      count++;
    }
    if (localStorage.getItem(STORAGE_KEYS.TEMPLATES)) {
      localStorage.removeItem(STORAGE_KEYS.TEMPLATES);
      count++;
    }
    if (localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      count++;
    }
    if (localStorage.getItem(STORAGE_KEYS.STATS)) {
      localStorage.removeItem(STORAGE_KEYS.STATS);
      count++;
    }
    if (localStorage.getItem('customTemplates')) {
      localStorage.removeItem('customTemplates');
      count++;
    }
    if (localStorage.getItem('selectedTemplate')) {
      localStorage.removeItem('selectedTemplate');
      count++;
    }

    console.log(`${count} anciennes données supprimées`);
    return count;
  }
  
  // ==================== MÉTRIQUES QUOTIDIENNES ====================
  
  /**
   * Sauvegarde les métriques du jour actuel
   */
  saveDailyMetrics() {
    const userId = this.getCurrentUserId();
    if (!userId) return;

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const allMetrics = this.getDailyMetrics();
    
    // Calculer les métriques d'aujourd'hui
    const sessions = this.getAllSessions();
    const todaySessions = sessions.filter(s => {
      const sessionDate = new Date(s.createdAt).toISOString().split('T')[0];
      return sessionDate === today;
    });

    const todayMetric = {
      date: today,
      userId,
      sessionCount: todaySessions.length,
      totalDuration: todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0),
      platforms: todaySessions.reduce((acc, s) => {
        acc[s.platform || 'local'] = (acc[s.platform || 'local'] || 0) + 1;
        return acc;
      }, {}),
      transcribedWords: todaySessions.reduce((sum, s) => sum + (s.wordCount || 0), 0)
    };

    // Mettre à jour ou ajouter la métrique du jour
    const existingIndex = allMetrics.findIndex(m => m.date === today && m.userId === userId);
    if (existingIndex >= 0) {
      allMetrics[existingIndex] = todayMetric;
    } else {
      allMetrics.push(todayMetric);
    }

    // Garder seulement les 90 derniers jours
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const filtered = allMetrics.filter(m => new Date(m.date) >= ninetyDaysAgo);

    localStorage.setItem(STORAGE_KEYS.DAILY_METRICS, JSON.stringify(filtered));
  }

  /**
   * Récupère toutes les métriques quotidiennes
   */
  getDailyMetrics() {
    const data = localStorage.getItem(STORAGE_KEYS.DAILY_METRICS);
    if (!data) return [];
    
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  /**
   * Récupère les métriques des N derniers jours pour l'utilisateur connecté
   */
  getMetricsForLastDays(days = 7) {
    const userId = this.getCurrentUserId();
    if (!userId) return [];

    const allMetrics = this.getDailyMetrics();
    const userMetrics = allMetrics.filter(m => m.userId === userId);

    // Générer les N derniers jours
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const metric = userMetrics.find(m => m.date === dateStr) || {
        date: dateStr,
        userId,
        sessionCount: 0,
        totalDuration: 0,
        platforms: {},
        transcribedWords: 0
      };

      result.push(metric);
    }

    return result;
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
