class TemplateService {
  constructor() {
    this.defaultTemplates = [
      {
        id: 'standard',
        name: 'Standard Meeting',
        description: 'General meeting report template',
        sections: ['summary', 'keyPoints', 'actions', 'decisions', 'participants', 'transcript'],
        format: this.standardFormat,
      },
      {
        id: 'sprint-planning',
        name: 'Sprint Planning',
        description: 'Agile sprint planning template',
        sections: ['sprintGoal', 'userStories', 'tasks', 'estimates', 'risks'],
        format: this.sprintPlanningFormat,
      },
      {
        id: 'one-on-one',
        name: 'One-on-One',
        description: '1:1 meeting template',
        sections: ['wins', 'challenges', 'goals', 'feedback', 'actionItems'],
        format: this.oneOnOneFormat,
      },
      {
        id: 'retrospective',
        name: 'Retrospective',
        description: 'Sprint retrospective template',
        sections: ['wentWell', 'toImprove', 'actionItems', 'appreciation'],
        format: this.retrospectiveFormat,
      },
      {
        id: 'status-update',
        name: 'Status Update',
        description: 'Project status update template',
        sections: ['progress', 'blockers', 'nextSteps', 'metrics'],
        format: this.statusUpdateFormat,
      },
      {
        id: 'brainstorm',
        name: 'Brainstorming',
        description: 'Creative brainstorming session',
        sections: ['ideas', 'topIdeas', 'nextActions', 'resources'],
        format: this.brainstormFormat,
      },
    ];
    
    this.loadCustomTemplates();
  }

  loadCustomTemplates() {
    const stored = localStorage.getItem('cortexai_custom_templates');
    this.customTemplates = stored ? JSON.parse(stored) : [];
  }

  saveCustomTemplates() {
    localStorage.setItem('cortexai_custom_templates', JSON.stringify(this.customTemplates));
  }

  getAllTemplates() {
    return [...this.defaultTemplates, ...this.customTemplates];
  }

  getTemplate(id) {
    return this.getAllTemplates().find(t => t.id === id);
  }

  createCustomTemplate(template) {
    const newTemplate = {
      ...template,
      id: `custom-${Date.now()}`,
      isCustom: true,
    };
    this.customTemplates.push(newTemplate);
    this.saveCustomTemplates();
    return newTemplate;
  }

  updateCustomTemplate(id, updates) {
    const index = this.customTemplates.findIndex(t => t.id === id);
    if (index !== -1) {
      this.customTemplates[index] = { ...this.customTemplates[index], ...updates };
      this.saveCustomTemplates();
      return this.customTemplates[index];
    }
    return null;
  }

  deleteCustomTemplate(id) {
    this.customTemplates = this.customTemplates.filter(t => t.id !== id);
    this.saveCustomTemplates();
  }

  applyTemplate(templateId, sessionData) {
    const template = this.getTemplate(templateId);
    if (!template) return sessionData;

    return template.format ? template.format(sessionData) : sessionData;
  }

  standardFormat(data) {
    return {
      title: data.title || 'Meeting Report',
      date: new Date().toISOString(),
      summary: data.summary || this.generateSummary(data),
      keyPoints: data.keyPoints || [],
      actions: data.actions || [],
      decisions: data.decisions || [],
      participants: data.participants || [],
      transcript: data.transcript || [],
      tags: data.tags || [],
    };
  }

  sprintPlanningFormat(data) {
    return {
      title: `Sprint Planning - ${data.title || 'Sprint'}`,
      date: new Date().toISOString(),
      sprintGoal: data.sprintGoal || 'Define sprint goal',
      userStories: data.userStories || this.extractUserStories(data),
      tasks: data.tasks || this.extractTasks(data),
      estimates: data.estimates || {},
      risks: data.risks || this.extractRisks(data),
      teamCapacity: data.teamCapacity || '',
      sprintDuration: data.sprintDuration || '2 weeks',
    };
  }

  oneOnOneFormat(data) {
    return {
      title: `1:1 - ${data.title || 'Meeting'}`,
      date: new Date().toISOString(),
      participant: data.participant || '',
      wins: data.wins || this.extractWins(data),
      challenges: data.challenges || this.extractChallenges(data),
      goals: data.goals || [],
      feedback: data.feedback || '',
      actionItems: data.actions || [],
      nextMeeting: data.nextMeeting || '',
    };
  }

  retrospectiveFormat(data) {
    return {
      title: `Retrospective - ${data.title || 'Sprint'}`,
      date: new Date().toISOString(),
      wentWell: data.wentWell || this.extractPositives(data),
      toImprove: data.toImprove || this.extractImprovements(data),
      actionItems: data.actions || [],
      appreciation: data.appreciation || [],
      teamMood: data.teamMood || 'neutral',
    };
  }

  statusUpdateFormat(data) {
    return {
      title: `Status Update - ${data.title || 'Project'}`,
      date: new Date().toISOString(),
      progress: data.progress || this.extractProgress(data),
      completedTasks: data.completedTasks || [],
      blockers: data.blockers || this.extractBlockers(data),
      nextSteps: data.nextSteps || [],
      metrics: data.metrics || {},
      risks: data.risks || [],
    };
  }

  brainstormFormat(data) {
    return {
      title: `Brainstorming - ${data.title || 'Session'}`,
      date: new Date().toISOString(),
      objective: data.objective || '',
      ideas: data.ideas || this.extractIdeas(data),
      topIdeas: data.topIdeas || [],
      nextActions: data.nextActions || [],
      resources: data.resources || [],
      votingResults: data.votingResults || {},
    };
  }

  generateSummary(data) {
    if (!data.transcript || data.transcript.length === 0) {
      return 'No transcript available';
    }
    
    const text = data.transcript.map(t => typeof t === 'string' ? t : t.text).join(' ');
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    return sentences.slice(0, 3).join('. ') + '.';
  }

  extractUserStories(data) {
    const text = data.transcript?.map(t => typeof t === 'string' ? t : t.text).join(' ').toLowerCase() || '';
    const stories = [];
    
    const storyKeywords = ['user story', 'as a', 'i want', 'so that'];
    storyKeywords.forEach(keyword => {
      const regex = new RegExp(`${keyword}[^.!?]*`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        stories.push(...matches);
      }
    });
    
    return stories;
  }

  extractTasks(data) {
    const actions = data.actions || [];
    return actions.map(action => ({
      task: typeof action === 'string' ? action : action.action || action.text,
      assigned: action.responsible || '',
      estimate: action.estimate || '',
    }));
  }

  extractRisks(data) {
    const text = data.transcript?.map(t => typeof t === 'string' ? t : t.text).join(' ').toLowerCase() || '';
    const risks = [];
    
    const riskKeywords = ['risque', 'risk', 'problème', 'problem', 'bloqué', 'blocked'];
    riskKeywords.forEach(keyword => {
      const regex = new RegExp(`[^.!?]*${keyword}[^.!?]*`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        risks.push(...matches);
      }
    });
    
    return risks.slice(0, 5);
  }

  extractWins(data) {
    const text = data.transcript?.map(t => typeof t === 'string' ? t : t.text).join(' ').toLowerCase() || '';
    const wins = [];
    
    const winKeywords = ['réussi', 'success', 'bien passé', 'went well', 'fier', 'proud'];
    winKeywords.forEach(keyword => {
      const regex = new RegExp(`[^.!?]*${keyword}[^.!?]*`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        wins.push(...matches);
      }
    });
    
    return wins.slice(0, 5);
  }

  extractChallenges(data) {
    const text = data.transcript?.map(t => typeof t === 'string' ? t : t.text).join(' ').toLowerCase() || '';
    const challenges = [];
    
    const challengeKeywords = ['difficile', 'difficult', 'challenge', 'problème', 'problem', 'struggle'];
    challengeKeywords.forEach(keyword => {
      const regex = new RegExp(`[^.!?]*${keyword}[^.!?]*`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        challenges.push(...matches);
      }
    });
    
    return challenges.slice(0, 5);
  }

  extractPositives(data) {
    return this.extractWins(data);
  }

  extractImprovements(data) {
    const text = data.transcript?.map(t => typeof t === 'string' ? t : t.text).join(' ').toLowerCase() || '';
    const improvements = [];
    
    const keywords = ['améliorer', 'improve', 'mieux', 'better', 'devrait', 'should', 'pourrait', 'could'];
    keywords.forEach(keyword => {
      const regex = new RegExp(`[^.!?]*${keyword}[^.!?]*`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        improvements.push(...matches);
      }
    });
    
    return improvements.slice(0, 5);
  }

  extractProgress(data) {
    const text = data.transcript?.map(t => typeof t === 'string' ? t : t.text).join(' ') || '';
    const progressKeywords = ['terminé', 'completed', 'fini', 'done', '\\d+%'];
    
    const matches = progressKeywords.map(keyword => {
      const regex = new RegExp(`[^.!?]*${keyword}[^.!?]*`, 'gi');
      return text.match(regex) || [];
    }).flat();
    
    return matches.join(' ');
  }

  extractBlockers(data) {
    return this.extractRisks(data);
  }

  extractIdeas(data) {
    const text = data.transcript?.map(t => typeof t === 'string' ? t : t.text).join(' ').toLowerCase() || '';
    const ideas = [];
    
    const ideaKeywords = ['idée', 'idea', 'suggestion', 'proposer', 'propose', 'peut-être', 'maybe'];
    ideaKeywords.forEach(keyword => {
      const regex = new RegExp(`[^.!?]*${keyword}[^.!?]*`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        ideas.push(...matches);
      }
    });
    
    return ideas;
  }
}

const templateService = new TemplateService();
export default templateService;
