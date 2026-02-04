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
      ? `Analyse cette transcription de réunion et génère un résumé professionnel et structuré en français.

STRUCTURE ATTENDUE:
1. **Contexte** (2-3 phrases) - De quoi parlait cette réunion ?
2. **Points Clés** (3-5 points avec •) - Qu'est-ce qui a été discuté d'important ?
3. **Conclusions** (2-3 phrases) - Quelles sont les grandes décisions ou orientations ?

STYLE:
- Professionnel et concis
- Sans émoticônes
- Phrases complètes et claires
- Utilise les vrais noms et termes mentionnés

TRANSCRIPTION:
${transcriptText}

Réponds directement avec le résumé formaté en Markdown, sans préambule.`
      : `Analyze this meeting transcript and generate a professional structured summary in English.

EXPECTED STRUCTURE:
1. **Context** (2-3 sentences) - What was this meeting about?
2. **Key Points** (3-5 points with •) - What important topics were discussed?
3. **Conclusions** (2-3 sentences) - What are the main decisions or directions?

STYLE:
- Professional and concise
- No emojis
- Complete and clear sentences
- Use real names and terms mentioned

TRANSCRIPT:
${transcriptText}

Respond directly with the summary formatted in Markdown, no preamble.`;

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
      ? `Analyse cette transcription de réunion et extrais les actions concrètes mentionnées.

RÈGLES D'EXTRACTION:
- Cherche les phrases avec "doit", "va", "faut", "action", "faire", "préparer", "organiser", "planifier"
- Identifie qui est responsable (nom de personne ou équipe)
- Détecte les échéances mentionnées (dates, "demain", "la semaine prochaine", etc.)
- Évalue la priorité selon l'urgence exprimée

TRANSCRIPTION:
${transcriptText}

Retourne un JSON avec la structure suivante (s'il n'y a aucune action, retourne un array vide []):
{
  "actions": [
    {
      "task": "Description claire de l'action",
      "responsible": "Nom de la personne ou 'À définir'",
      "deadline": "Date ou description temporelle ou 'À définir'",
      "priority": "Haute" ou "Moyenne" ou "Basse"
    }
  ]
}

Réponds UNIQUEMENT avec le JSON, sans texte additionnel.`
      : `Analyze this meeting transcript and extract concrete action items.

EXTRACTION RULES:
- Look for phrases with "must", "should", "will", "need to", "action", "prepare", "organize", "plan"
- Identify who is responsible (person name or team)
- Detect mentioned deadlines (dates, "tomorrow", "next week", etc.)
- Assess priority based on expressed urgency

TRANSCRIPT:
${transcriptText}

Return JSON with this structure (if no actions, return empty array []):
{
  "actions": [
    {
      "task": "Clear action description",
      "responsible": "Person name or 'TBD'",
      "deadline": "Date or time description or 'TBD'",
      "priority": "High" or "Medium" or "Low"
    }
  ]
}

Respond ONLY with JSON, no additional text.`;

    try {
      const response = this.provider === 'openai'
        ? await this.callOpenAI(prompt, true)
        : await this.callClaude(prompt, true);

      const parsed = JSON.parse(response);
      const actions = parsed.actions || parsed;
      
      return Array.isArray(actions) ? actions.map((action, index) => ({
        id: index + 1,
        ...action
      })) : [];
    } catch (error) {
      console.error('Erreur parsing actions:', error);
      console.error('Réponse brute:', response);
      return [];
    }
  }

  /**
   * Extrait les décisions prises
   */
  async extractDecisions(transcriptText, language) {
    const prompt = language === 'fr'
      ? `Analyse cette transcription de réunion et extrais les décisions formelles prises.

RÈGLES D'EXTRACTION:
- Cherche les phrases avec "décidé", "décision", "on part sur", "validé", "approuvé", "on choisit", "accord"
- Évite les simples opinions ou suggestions
- Catégorise l'impact de chaque décision

TRANSCRIPTION:
${transcriptText}

CATÉGORies D'IMPACT:
- Technique: Architecture, technologie, infrastructure
- Sécurité: Protection des données, accès, conformité
- Fonctionnel: Features, produit, UX
- Stratégique: Vision, objectifs long terme
- Financier: Budget, coûts, investissements
- Légal: Contrats, RGPD, juridique

Retourne un JSON (s'il n'y a aucune décision, retourne un array vide []):
{
  "decisions": [
    {
      "text": "Description concise de la décision",
      "impact": "Catégorie parmi la liste ci-dessus"
    }
  ]
}

Réponds UNIQUEMENT avec le JSON, sans texte additionnel.`
      : `Analyze this meeting transcript and extract formal decisions made.

EXTRACTION RULES:
- Look for phrases with "decided", "decision", "going with", "approved", "validated", "chose", "agreed"
- Avoid simple opinions or suggestions
- Categorize the impact of each decision

TRANSCRIPT:
${transcriptText}

IMPACT CATEGORIES:
- Technical: Architecture, technology, infrastructure
- Security: Data protection, access, compliance
- Functional: Features, product, UX
- Strategic: Vision, long-term goals
- Financial: Budget, costs, investments
- Legal: Contracts, GDPR, juridical

Return JSON (if no decisions, return empty array []):
{
  "decisions": [
    {
      "text": "Concise decision description",
      "impact": "Category from list above"
    }
  ]
}

Respond ONLY with JSON, no additional text.`;

    try {
      const response = this.provider === 'openai'
        ? await this.callOpenAI(prompt, true)
        : await this.callClaude(prompt, true);

      const parsed = JSON.parse(response);
      const decisions = parsed.decisions || parsed;
      
      return Array.isArray(decisions) ? decisions.map((decision, index) => ({
        id: index + 1,
        ...decision
      })) : [];
    } catch (error) {
      console.error('Erreur parsing décisions:', error);
      console.error('Réponse brute:', response);
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
        model: 'gpt-4o',
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
        max_tokens: jsonMode ? 2000 : 1500,
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
