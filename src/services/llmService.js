/**
 * Service LLM pour génération de résumés, actions et décisions
 * Support GPT-4 (OpenAI) et Claude (Anthropic)
 */

class LLMService {
  constructor() {
    this.openaiKey = import.meta.env?.VITE_OPENAI_API_KEY;
    this.claudeKey = import.meta.env?.VITE_ANTHROPIC_API_KEY;
    this.provider = import.meta.env?.VITE_LLM_PROVIDER || 'openai'; // 'openai' ou 'claude'
  }

  /**
   * Génère un compte-rendu complet à partir de la transcription
   */
  async generateReport(transcript, sessionInfo) {
    const { language, title, duration } = sessionInfo;

    // Préparer le texte de la transcription
    const transcriptText = transcript
      .map(line => `[${line.speaker || 'Locuteur'}] ${line.text}`)
      .join('\n');

    // Vérifier si une API est configurée
    if (!this.openaiKey || this.openaiKey === 'your_openai_api_key_here') {
      console.warn('⚠️ API LLM non configurée, génération simulée');
      return this.generateMockReport(transcript, sessionInfo);
    }

    try {
      // Générer en parallèle le résumé, les actions et les décisions
      const [summary, actions, decisions] = await Promise.all([
        this.generateSummary(transcriptText, language),
        this.extractActions(transcriptText, language),
        this.extractDecisions(transcriptText, language)
      ]);

      return {
        summary,
        actions,
        decisions,
        email: this.generateEmail(summary, actions, decisions, title, language)
      };

    } catch (error) {
      console.error('❌ Erreur lors de la génération du rapport:', error);
      // Fallback sur génération simulée
      return this.generateMockReport(transcript, sessionInfo);
    }
  }

  /**
   * Génère un résumé structuré
   */
  async generateSummary(transcriptText, language) {
    const prompt = language === 'fr' 
      ? `Analyse cette transcription de réunion et génère un résumé structuré en français avec:

1. Un paragraphe de contexte (2-3 phrases)
2. Les points clés discutés (liste à puces)
3. Les conclusions principales

Transcription:
${transcriptText}

Réponds uniquement avec le résumé structuré, sans préambule.`
      : `Analyze this meeting transcript and generate a structured summary in English with:

1. A context paragraph (2-3 sentences)
2. Key points discussed (bullet list)
3. Main conclusions

Transcript:
${transcriptText}

Respond only with the structured summary, no preamble.`;

    if (this.provider === 'openai') {
      return await this.callOpenAI(prompt);
    } else {
      return await this.callClaude(prompt);
    }
  }

  /**
   * Extrait les actions à réaliser
   */
  async extractActions(transcriptText, language) {
    const prompt = language === 'fr'
      ? `Analyse cette transcription et extrais UNIQUEMENT les actions concrètes mentionnées.

Pour chaque action, retourne un JSON avec:
- task: La tâche à réaliser (max 100 caractères)
- responsible: Le responsable mentionné (ou "À définir")
- deadline: L'échéance mentionnée (ou "À définir")
- priority: "Haute", "Moyenne" ou "Basse"

Transcription:
${transcriptText}

Réponds UNIQUEMENT avec un array JSON d'actions, rien d'autre.
Format: [{"task": "...", "responsible": "...", "deadline": "...", "priority": "..."}]`
      : `Analyze this transcript and extract ONLY the concrete action items mentioned.

For each action, return a JSON with:
- task: The task to do (max 100 chars)
- responsible: The person responsible (or "TBD")
- deadline: The deadline mentioned (or "TBD")
- priority: "High", "Medium" or "Low"

Transcript:
${transcriptText}

Respond ONLY with a JSON array of actions, nothing else.
Format: [{"task": "...", "responsible": "...", "deadline": "...", "priority": "..."}]`;

    try {
      const response = this.provider === 'openai'
        ? await this.callOpenAI(prompt, true)
        : await this.callClaude(prompt, true);

      const actions = JSON.parse(response);
      return actions.map((action, index) => ({
        id: index + 1,
        ...action
      }));
    } catch (error) {
      console.error('Erreur parsing actions:', error);
      return [];
    }
  }

  /**
   * Extrait les décisions prises
   */
  async extractDecisions(transcriptText, language) {
    const prompt = language === 'fr'
      ? `Analyse cette transcription et extrais UNIQUEMENT les décisions formelles prises.

Pour chaque décision, retourne un JSON avec:
- text: La décision prise (max 150 caractères)
- impact: "Technique", "Sécurité", "Fonctionnel" ou "Légal"

Transcription:
${transcriptText}

Réponds UNIQUEMENT avec un array JSON de décisions, rien d'autre.
Format: [{"text": "...", "impact": "..."}]`
      : `Analyze this transcript and extract ONLY the formal decisions made.

For each decision, return a JSON with:
- text: The decision made (max 150 chars)
- impact: "Technical", "Security", "Functional" or "Legal"

Transcript:
${transcriptText}

Respond ONLY with a JSON array of decisions, nothing else.
Format: [{"text": "...", "impact": "..."}]`;

    try {
      const response = this.provider === 'openai'
        ? await this.callOpenAI(prompt, true)
        : await this.callClaude(prompt, true);

      const decisions = JSON.parse(response);
      return decisions.map((decision, index) => ({
        id: index + 1,
        ...decision
      }));
    } catch (error) {
      console.error('Erreur parsing décisions:', error);
      return [];
    }
  }

  /**
   * Appelle l'API OpenAI (GPT-4)
   */
  async callOpenAI(prompt, jsonMode = false) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'Tu es un assistant expert en analyse de réunions. Tu es précis, concis et structuré.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: jsonMode ? 2000 : 1000,
        response_format: jsonMode ? { type: 'json_object' } : undefined
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Appelle l'API Claude (Anthropic)
   */
  async callClaude(prompt, jsonMode = false) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.claudeKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: jsonMode ? 2000 : 1000,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  /**
   * Génère un email de suivi
   */
  generateEmail(summary, actions, decisions, title, language) {
    if (language === 'fr') {
      return `Objet: Compte-rendu - ${title}

Bonjour,

Voici le compte-rendu de notre réunion "${title}".

RÉSUMÉ
${summary.substring(0, 300)}...

DÉCISIONS PRISES
${decisions.slice(0, 3).map(d => `• ${d.text}`).join('\n')}

ACTIONS À SUIVRE
${actions.slice(0, 5).map(a => `• ${a.task} - ${a.responsible} (${a.deadline})`).join('\n')}

Le compte-rendu complet est disponible en pièce jointe.

Cordialement,
CORTEXIA`;
    } else {
      return `Subject: Meeting Report - ${title}

Hello,

Here is the report from our meeting "${title}".

SUMMARY
${summary.substring(0, 300)}...

DECISIONS MADE
${decisions.slice(0, 3).map(d => `• ${d.text}`).join('\n')}

ACTION ITEMS
${actions.slice(0, 5).map(a => `• ${a.task} - ${a.responsible} (${a.deadline})`).join('\n')}

The full report is attached.

Best regards,
CORTEXIA`;
    }
  }

  /**
   * Génération simulée (fallback)
   */
  generateMockReport(transcript, sessionInfo) {
    const { language, title, duration } = sessionInfo;
    
    const mockData = {
      fr: {
        summary: `Cette réunion de ${Math.floor(duration / 60)} minutes a porté sur ${title}. Les participants ont discuté des objectifs principaux, analysé les options disponibles et défini les prochaines étapes. Un consensus a été trouvé sur la direction à prendre pour les semaines à venir.`,
        actions: [
          { id: 1, task: 'Préparer le document de spécifications', responsible: 'Équipe Tech', deadline: 'Vendredi prochain', priority: 'Haute' },
          { id: 2, task: 'Organiser point de suivi', responsible: 'Project Manager', deadline: 'Dans 2 semaines', priority: 'Moyenne' },
          { id: 3, task: 'Valider le budget avec la direction', responsible: 'Finance', deadline: 'Fin du mois', priority: 'Haute' }
        ],
        decisions: [
          { id: 1, text: 'Adoption de la nouvelle architecture proposée', impact: 'Technique' },
          { id: 2, text: 'Validation du planning pour Q2 2026', impact: 'Fonctionnel' },
          { id: 3, text: 'Mise en place d\'un audit de sécurité', impact: 'Sécurité' }
        ]
      },
      en: {
        summary: `This ${Math.floor(duration / 60)}-minute meeting focused on ${title}. Participants discussed main objectives, analyzed available options, and defined next steps. Consensus was reached on the direction for the coming weeks.`,
        actions: [
          { id: 1, task: 'Prepare specification document', responsible: 'Tech Team', deadline: 'Next Friday', priority: 'High' },
          { id: 2, task: 'Schedule follow-up meeting', responsible: 'Project Manager', deadline: 'In 2 weeks', priority: 'Medium' },
          { id: 3, task: 'Validate budget with management', responsible: 'Finance', deadline: 'End of month', priority: 'High' }
        ],
        decisions: [
          { id: 1, text: 'Adoption of the proposed new architecture', impact: 'Technical' },
          { id: 2, text: 'Validation of Q2 2026 planning', impact: 'Functional' },
          { id: 3, text: 'Implementation of a security audit', impact: 'Security' }
        ]
      }
    };

    const data = mockData[language] || mockData.fr;
    
    return {
      ...data,
      email: this.generateEmail(data.summary, data.actions, data.decisions, title, language)
    };
  }
}

// Singleton
const llmService = new LLMService();
export default llmService;
