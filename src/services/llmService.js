/**
 * Service LLM pour génération de résumés, actions et décisions
 * Support GPT-4 (OpenAI) et Claude (Anthropic)
 */

class LLMService {
  constructor() {
    this.useProxy = Boolean(import.meta.env?.DEV);
    this.openaiKey = import.meta.env?.VITE_OPENAI_API_KEY;
    this.claudeKey = this.useProxy ? null : import.meta.env?.VITE_ANTHROPIC_API_KEY;
    this.provider = import.meta.env?.VITE_LLM_PROVIDER || 'openai'; // 'openai' ou 'claude'
    this.claudeModel = import.meta.env?.VITE_ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest';
  }

  /**
   * Génère un compte-rendu complet à partir de la transcription
   */
  async generateReport(transcript, sessionInfo) {
    const { language, title, duration } = sessionInfo;

    const normalizedTranscript = (transcript || [])
      .map(line => {
        if (typeof line === 'string') {
          return { text: line, speaker: 'Locuteur', isSystem: false };
        }
        return line;
      })
      .filter(line => line && typeof line.text === 'string');

    // Préparer le texte de la transcription avec nettoyage avancé
    const transcriptText = normalizedTranscript
      .filter(line => line.text && line.text.trim() && !line.isSystem)
      .map(line => {
        // Nettoyer chaque ligne de transcription
        const cleanText = line.text
          .replace(/\b(euh+|heu+|hmm+|hum+|ben|bah|bon|voilà|quoi|hein|genre|truc)\b/gi, '')
          .replace(/^(donc|alors|du coup|en fait|bon|bah|ben|ensuite)\s+/gi, '')
          .replace(/\b(\w+)\s+\1\b/gi, '$1')  // Supprimer mots répétés
          .replace(/\s{2,}/g, ' ')  // Espaces multiples
          .trim();
        return `[${line.speaker || 'Locuteur'}] ${cleanText}`;
      })
      .filter(line => line.length > 15)  // Ignorer lignes trop courtes (probablement parasites)
      .join('\n');

    // Vérifier si une API est configurée
    const hasOpenAi = this.openaiKey && this.openaiKey !== 'your_openai_api_key_here';
    const hasClaude = this.useProxy || (this.claudeKey && this.claudeKey !== 'your_anthropic_api_key_here');

    if ((this.provider === 'openai' && !hasOpenAi) || (this.provider === 'claude' && !hasClaude)) {
      console.warn('API LLM non configurée, génération simulée');
      return this.generateMockReport(normalizedTranscript, sessionInfo);
    }

    try {
      // Générer en parallèle le résumé, les actions et les décisions
      const [summary, actions, decisions] = await Promise.all([
        this.generateSummary(transcriptText, language),
        this.extractActions(transcriptText, language),
        this.extractDecisions(transcriptText, language)
      ]);

      // Générer l'email avec l'IA aussi
      const email = await this.generateEmailWithAI(summary, actions, decisions, title, language, transcriptText);

      return {
        summary,
        actions,
        decisions,
        email,
        meta: {
          provider: this.provider,
          model: this.provider === 'openai' ? 'gpt-4o' : this.claudeModel,
          source: 'llm'
        }
      };

    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      // Fallback sur génération simulée
      return this.generateMockReport(normalizedTranscript, sessionInfo);
    }
  }

  /**
   * Génère un résumé structuré
   */
  async generateSummary(transcriptText, language) {
    if (this.isLowQualityTranscript(transcriptText, language)) {
      return language === 'fr'
        ? `**Contexte**\n\nTranscription trop courte ou peu informative pour établir un contexte fiable.\n\n**Points clés**\n- Non mentionné\n- Non mentionné\n- Non mentionné\n\n**Mots-clés techniques**\n- Aucun mot-clé technique explicite\n\n**Conclusion**\n\nTranscription insuffisante pour produire une synthèse professionnelle.`
        : `**Context**\n\nTranscript too short or not informative enough to build a reliable context.\n\n**Key Points**\n- Not mentioned\n- Not mentioned\n- Not mentioned\n\n**Technical Keywords**\n- No explicit technical keyword\n\n**Conclusion**\n\nTranscript insufficient to produce a professional summary.`;
    }
    const prompt = language === 'fr'
      ? `Tu es un expert en compte-rendu. Réponds UNIQUEMENT avec un JSON valide.

RÈGLES STRICTES:
- N'invente rien. Utilise uniquement ce qui est dans la transcription.
- Si une info manque, mets "Non mentionné".
- Pas de phrases vagues (ex: "discussion centrée sur").
- Mots-clés techniques = technologies, standards, produits, noms propres métiers.
- Évite les mots génériques (mois, faut, application, réunion, équipe, projet, données si non qualifiées).

JSON ATTENDU:
{
  "context": "1-2 phrases sur le contexte réel",
  "key_points": ["point 1", "point 2", "point 3"],
  "technical_keywords": ["mot-clé 1", "mot-clé 2"],
  "conclusion": "1 phrase de synthèse des suites / orientations"
}

TRANSCRIPTION:
${transcriptText}
`
      : `You are a meeting report expert. Respond ONLY with valid JSON.

STRICT RULES:
- Do NOT invent. Use only what appears in the transcript.
- If info is missing, write "Not mentioned".
- Avoid vague phrasing.
- Technical keywords = technologies, standards, product names, domain proper nouns.
- Avoid generic words (month, must, application, meeting, team, project).

EXPECTED JSON:
{
  "context": "1-2 sentences of real context",
  "key_points": ["point 1", "point 2", "point 3"],
  "technical_keywords": ["keyword 1", "keyword 2"],
  "conclusion": "1 sentence of next steps / direction"
}

TRANSCRIPT:
${transcriptText}
`;

    const raw = this.provider === 'openai'
      ? await this.callOpenAI(prompt, true)
      : await this.callClaude(prompt, true);

    const cleaned = raw
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (error) {
      console.error('Erreur parsing résumé JSON:', error);
      console.error('Résumé brut:', raw);
      return raw;
    }

    const context = this.normalizeSentence(parsed.context, language);
    const keyPoints = this.normalizeList(parsed.key_points, 3, language);
    const keywords = this.normalizeKeywords(parsed.technical_keywords, language);
    const conclusion = this.normalizeSentence(parsed.conclusion, language);

    const keywordsSection = keywords.length > 0
      ? keywords.map(keyword => `- ${keyword}`).join('\n')
      : language === 'fr'
        ? '- Aucun mot-clé technique explicite'
        : '- No explicit technical keyword';

    return language === 'fr'
      ? `**Contexte**\n\n${context}\n\n**Points clés**\n${keyPoints.map(point => `- ${point}`).join('\n')}\n\n**Mots-clés techniques**\n${keywordsSection}\n\n**Conclusion**\n\n${conclusion}`
      : `**Context**\n\n${context}\n\n**Key Points**\n${keyPoints.map(point => `- ${point}`).join('\n')}\n\n**Technical Keywords**\n${keywordsSection}\n\n**Conclusion**\n\n${conclusion}`;
  }

  normalizeSentence(value, language) {
    if (!value || typeof value !== 'string') {
      return language === 'fr' ? 'Non mentionné' : 'Not mentioned';
    }

    const cleaned = value
      .replace(/^[-•\s]+/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    return cleaned || (language === 'fr' ? 'Non mentionné' : 'Not mentioned');
  }

  normalizeList(items, minItems, language) {
    if (!Array.isArray(items)) {
      return [this.normalizeSentence(items, language)];
    }

    const normalized = items
      .map(item => this.normalizeSentence(item, language))
      .filter(item => item && item !== (language === 'fr' ? 'Non mentionné' : 'Not mentioned'));

    const fallback = language === 'fr' ? 'Non mentionné' : 'Not mentioned';

    while (normalized.length < minItems) {
      normalized.push(fallback);
    }

    return normalized.slice(0, Math.max(minItems, normalized.length));
  }

  normalizeKeywords(items, language) {
    if (!Array.isArray(items)) {
      items = typeof items === 'string' ? [items] : [];
    }

    const forbidden = new Set([
      'mois', 'faut', 'doit', 'doivent', 'faire', 'fait', 'faits', 'faite', 'faites',
      'application', 'réunion', 'réunions', 'équipe', 'projet', 'discussion', 'présentation',
      'donnée', 'données', 'client', 'clients', 'objectif', 'objectifs', 'plan', 'plans'
    ]);

    const cleaned = items
      .map(item => (typeof item === 'string' ? item.trim() : ''))
      .filter(item => item.length > 0)
      .filter(item => {
        const lower = item.toLowerCase();
        if (forbidden.has(lower)) return false;
        if (lower.length < 3) return false;
        const tokens = lower.split(/[\s,/;-]+/).filter(Boolean);
        const meaningful = tokens.filter(token => token.length >= 4 && !forbidden.has(token));
        return meaningful.length > 0 || /[A-Z]{2,}/.test(item);
      })
      .map(item => item.replace(/^[-•\s]+/g, '').trim());

    const unique = [];
    const seen = new Set();
    cleaned.forEach(item => {
      const key = item.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    });

    return unique.slice(0, 6);
  }

  isLowQualityTranscript(text, language) {
    if (!text || typeof text !== 'string') return true;

    const cleaned = text
      .replace(/\[[^\]]+\]\s*/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    if (cleaned.length < 120) return true;

    const words = cleaned
      .toLowerCase()
      .match(/[a-zàâäéèêëïîôùûüÿæœç']{3,}/g) || [];

    if (words.length < 40) return true;

    const uniqueCount = new Set(words).size;
    const uniqueRatio = uniqueCount / words.length;

    if (uniqueRatio < 0.25) return true;

    return false;
  }

  /**
   * Extrait les actions à réaliser
   */
  async extractActions(transcriptText, language) {
    let response;
    const prompt = language === 'fr'
      ? `Analyse cette transcription et EXTRAIS UNIQUEMENT les actions explicites.

RÈGLES STRICTES:
- N'invente rien.
- Une action = verbe d'action + objet clair.
- **MAXIMUM 5-7 MOTS PAR ACTION** (format court et concis).
- Exemple: "Préparer présentation Q1" au lieu de "Il faudrait préparer une présentation détaillée pour le premier trimestre".
- Ne découpe pas une phrase en fragments.
- **RÈGLE ABSOLUE : N'extraire une action QUE si le verbe "faire", "fais", "faut", "falloir", "faudrait", "faudra" ou "fait" apparaît EXPLICITEMENT dans la même phrase ou la phrase immédiatement précédente.**
- Si le verbe "faire" (et ses variantes) n'est pas présent, ne pas extraire l'action.
- Si aucune action avec "faire" n'est trouvée, retourne {"actions": []}.

TRANSCRIPTION:
${transcriptText}

JSON ATTENDU:
{
  "actions": [
    {
      "task": "Action courte et claire (max 5-7 mots)",
      "responsible": "Nom/équipe ou 'À définir'",
      "deadline": "Date/repère temporel ou 'À définir'",
      "priority": "Haute" | "Moyenne" | "Basse"
    }
  ]
}

Réponds UNIQUEMENT avec le JSON.`
      : `Analyze this meeting transcript and extract concrete action items.

EXTRACTION RULES:
- **ACTION MUST BE SHORT: Maximum 5-7 words** (concise format)
- Example: "Prepare Q1 presentation" instead of "We need to prepare a detailed presentation for the first quarter"
- **MANDATORY RULE: Only extract an action if the word "do", "make", "need to do", "must do", or "have to do" (or French "faire", "faut", "falloir") appears EXPLICITLY in the same or immediately preceding sentence.**
- If no such trigger word is present, skip the action.
- Identify who is responsible (person name or team)
- Detect mentioned deadlines (dates, "tomorrow", "next week", etc.)
- Assess priority based on expressed urgency

TRANSCRIPT:
${transcriptText}

Return JSON with this structure (if no actions, return empty array []):
{
  "actions": [
    {
      "task": "Short clear action (max 5-7 words)",
      "responsible": "Person name or 'TBD'",
      "deadline": "Date or time description or 'TBD'",
      "priority": "High" or "Medium" or "Low"
    }
  ]
}

Respond ONLY with JSON, no additional text.`;

    try {
      response = this.provider === 'openai'
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
    let response;
    const prompt = language === 'fr'
      ? `Analyse cette transcription et EXTRAIS UNIQUEMENT les décisions FORMELLES.

RÈGLES STRICTES:
- N'invente rien.
- Une décision doit être actée/validée (pas une opinion).
- Si aucune décision formelle, retourne {"decisions": []}.

TRANSCRIPTION:
${transcriptText}

CATÉGORIES D'IMPACT:
- Technique
- Sécurité
- Fonctionnel
- Stratégique
- Financier
- Légal

JSON ATTENDU:
{
  "decisions": [
    {
      "text": "Décision concise",
      "impact": "Catégorie"
    }
  ]
}

Réponds UNIQUEMENT avec le JSON.`
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
- Legal: Contracts, RGPD, juridical

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
      response = this.provider === 'openai'
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
    const endpoint = this.useProxy ? '/api/anthropic' : 'https://api.anthropic.com/v1/messages';
    const headers = this.useProxy
      ? { 'Content-Type': 'application/json' }
      : {
          'Content-Type': 'application/json',
          'x-api-key': this.claudeKey,
          'anthropic-version': '2023-06-01'
        };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        system: 'You are an expert meeting analyst. Be precise, do not invent information, and follow the requested format strictly.',
        model: this.claudeModel,
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
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  /**
   * Génère un email de suivi avec l'IA
   */
  async generateEmailWithAI(summary, actions, decisions, title, language, transcriptText) {
    const prompt = language === 'fr'
      ? `Génère un email professionnel de compte-rendu de réunion en français.

CONTEXTE:
Titre: ${title}
Résumé: ${summary}

Actions: ${actions.map(a => a.task).join(', ')}
Décisions: ${decisions.map(d => d.text).join(', ')}

INSTRUCTIONS:
- Email professionnel et concis (maximum 250 mots)
- Structure: Objet, Salutation, Contexte bref (2-3 phrases), Points clés (actions et décisions), Formule de politesse
- Ton formel et direct
- Sans emoji
- Inclure seulement l'essentiel

Génère l'email complet avec l'objet.`
      : `Generate a professional meeting follow-up email in English.

CONTEXT:
Title: ${title}
Summary: ${summary}

Actions: ${actions.map(a => a.task).join(', ')}
Decisions: ${decisions.map(d => d.text).join(', ')}

INSTRUCTIONS:
- Professional and concise email (max 250 words)
- Structure: Subject, Greeting, Brief context (2-3 sentences), Key points (actions and decisions), Closing
- Formal and direct tone
- No emojis
- Include only essentials

Generate the complete email with subject line.`;

    try {
      const emailText = this.provider === 'openai'
        ? await this.callOpenAI(prompt)
        : await this.callClaude(prompt);
      
      return emailText;
    } catch (error) {
      console.error('Erreur génération email IA:', error);
      // Fallback sur génération manuelle
      return this.generateEmail(summary, actions, decisions, title, language);
    }
  }

  /**
   * Génère un email de suivi (fallback manuel)
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
   * Génère un résumé local intelligent basé sur la transcription
   */
  generateLocalSummary(text, title, duration, language = 'fr') {
    // Nettoyer le texte des artefacts et répétitions
    text = text.replace(/\.0+\s*$/g, '')
               .replace(/\s+0+\s*$/g, '')
               .replace(/\.0+(\s+|$)/g, '$1')
               .replace(/\b0+\b/g, '')
               .replace(/\b(\w+)\s+\1\b/gi, '$1')  // Supprimer répétitions de mots (ex: "peut peut" → "peut")
               .replace(/\b(\w+\s+\w+)\s+\1\b/gi, '$1') // Supprimer répétitions de 2 mots (ex: "nous allons" x2)
               .replace(/\b([A-Z]{2,5})\1\b/g, '$1') // Corriger acronymes doublés (ex: "RHRH" → "RH")
               .trim();
    
    // Analyser la fréquence des mots pour identifier les vrais sujets
    const wordFrequency = this.analyzeKeywords(text, language);
    const topKeywords = wordFrequency.length > 0 
      ? wordFrequency.slice(0, 3).map(w => w.word)
      : [];
    
    // Diviser en phrases significatives
    const sentences = text.split(/[.!?]+/)
      .map(s => s.trim())
      .map(s => s.replace(/^(donc|alors|bon|bah|ben|ensuite|voilà|du\s+coup|en\s+fait)\s+/i, '').trim())
      .filter(s => s.length > 20 && s.length < 300)
      .filter(s => !s.toLowerCase().includes('euh') && !s.toLowerCase().includes('hmm'))
      .filter(s => !s.match(/^0+$/))
      .filter(s => s.length > 0);
    
    if (sentences.length < 3) {
      const cleanPreview = text.substring(0, 350).replace(/\b0+\b/g, '').trim();
      return language === 'fr' 
        ? `**Contexte**\n\n${cleanPreview}${topKeywords.length > 0 ? '\n\n**Mots-clés identifiés** : ' + topKeywords.join(', ') : ''}`
        : `**Context**\n\n${cleanPreview}${topKeywords.length > 0 ? '\n\n**Keywords identified**: ' + topKeywords.join(', ') : ''}`;
    }
    
    // Identifier les speakers si présents dans le texte
    const speakerPattern = /\[(\w+)\]/g;
    const speakers = new Set();
    let match;
    while ((match = speakerPattern.exec(text)) !== null) {
      speakers.add(match[1]);
    }
    const speakerCount = speakers.size;
    
    // Sélectionner des phrases variées (début, milieu, fin)
    const intro = sentences.slice(0, 2).join('. ');
    const middleSentences = sentences.slice(2, Math.min(6, sentences.length - 1));
    const conclusion = sentences.length > 3 ? sentences.slice(-1)[0] : '';
    
    // Construire un contexte narratif intelligent (sans répéter les mêmes formules)
    let contextIntro = '';
    if (topKeywords.length >= 2) {
      // Utiliser les mots-clés dans une phrase naturelle
      const keywordPhrase = language === 'fr'
        ? `Discussion centrée sur ${topKeywords[0]}${topKeywords[1] ? ' et ' + topKeywords[1] : ''}`
        : `Discussion focused on ${topKeywords[0]}${topKeywords[1] ? ' and ' + topKeywords[1] : ''}`;
      
      if (speakerCount > 1) {
        contextIntro = language === 'fr'
          ? `Échange entre ${speakerCount} personnes. ${keywordPhrase}`
          : `Exchange between ${speakerCount} people. ${keywordPhrase}`;
      } else {
        contextIntro = keywordPhrase;
      }
    } else {
      // Utiliser le début de la transcription comme contexte
      contextIntro = intro;
    }
    
    // Sélectionner les points clés en évitant les redites
    const uniquePoints = [];
    const usedWords = new Set();
    
    for (const sentence of middleSentences) {
      const words = sentence.toLowerCase().split(/\s+/).filter(w => w.length > 5);
      const hasNewContent = words.some(w => !usedWords.has(w));
      
      if (hasNewContent && uniquePoints.length < 4) {
        uniquePoints.push(sentence);
        words.forEach(w => usedWords.add(w));
      }
    }
    
    if (language === 'fr') {
      const keywordsSection = topKeywords.length > 0 ? `\n\n**Mots-clés techniques** : ${topKeywords.join(' • ')}` : '';
      const conclusionSection = conclusion ? `\n\n**Conclusion**\n\n${conclusion}` : '';
      
      return `**Contexte**\n\n${contextIntro}\n\n**Points Clés**\n\n${uniquePoints.map(s => `- ${s}`).join('\n')}${keywordsSection}${conclusionSection}`;
    } else {
      const keywordsSection = topKeywords.length > 0 ? `\n\n**Technical Keywords**: ${topKeywords.join(' • ')}` : '';
      const conclusionSection = conclusion ? `\n\n**Conclusion**\n\n${conclusion}` : '';
      
      return `**Context**\n\n${contextIntro}\n\n**Key Points**\n\n${uniquePoints.map(s => `- ${s}`).join('\n')}${keywordsSection}${conclusionSection}`;
    }
  }

  /**
   * Analyse la fréquence des mots pour identifier les mots-clés
   */
  analyzeKeywords(text, language = 'fr') {
    // Mots à ignorer (stop words + mots génériques sans valeur sémantique) - ÉTENDU
    const stopWords = language === 'fr'
      ? ['le', 'la', 'les', 'de', 'des', 'un', 'une', 'du', 'et', 'ou', 'mais', 'donc', 'or', 'ni', 'car', 'que', 'qui', 'quoi', 'dont', 'où', 'ce', 'cet', 'cette', 'ces', 'mon', 'ton', 'son', 'ma', 'ta', 'sa', 'mes', 'tes', 'ses', 'notre', 'votre', 'leur', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'on', 'se', 'me', 'te', 'lui', 'y', 'en', 'ne', 'pas', 'plus', 'très', 'bien', 'tout', 'tous', 'toute', 'toutes', 'si', 'oui', 'non', 'euh', 'hmm', 'ah', 'oh', 'alors', 'donc', 'voilà', 'ok', 'bon', 'ben', 'hein', 'quoi', 'là', 'ça', 'pour', 'avec', 'sans', 'dans', 'sur', 'sous', 'vers', 'par', 'entre', 'chez', 'être', 'avoir', 'faire', 'aller', 'vais', 'vas', 'va', 'allons', 'allez', 'vont', 'dire', 'voir', 'donner', 'prendre', 'pouvoir', 'vouloir', 'devoir', 'savoir', 'peut', 'peuvent', 'peux', 'comme', 'ensuite', 'après', 'avant', 'important', 'importante', 'importants', 'importantes', 'chose', 'choses', 'fait', 'faite', 'faits', 'faites', 'permet', 'permettre', 'aider', 'aide', 'aussi', 'même', 'vrai', 'vraiment', 'genre', 'truc', 'trucs', 'machin', 'trés', 'super', 'déjà', 'encore', 'toujours', 'jamais', 'rien', 'quelque', 'quelques', 'autre', 'autres', 'beaucoup', 'peu', 'moins', 'trop', 'assez', 'tant', 'autant', 'plusieurs', 'chaque', 'certain', 'certains', 'certaine', 'certaines', 'bonjour', 'aujourd\'hui', 'aujourdhui', 'bienvenue', 'nouveau', 'nouveaux', 'arrivant', 'arrivants', 'année', 'années', 'réunion', 'présentation', 'présenter', 'présente', 'présentons', 'présentant', 'présentations', 'entreprise', 'équipe', 'directeur', 'direction', 'tour', 'table', 'décision', 'décisions', 'bouton', 'boutons', 'amélioration', 'améliorations', 'problème', 'problèmes', 'question', 'questions', 'point', 'points', 'fois', 'temps', 'moment', 'moments', 'manière', 'façon', 'façons', 'niveau', 'niveaux', 'partie', 'parties', 'sujet', 'sujets', 'compte', 'rendu', 'comptes', 'rendus', 'discuter', 'discussion', 'discussions', 'parler', 'parle', 'parlé', 'parlons', 'aborder', 'abordé', 'abordons', 'traiter', 'traité', 'traitons', 'concernant', 'concerné', 'concerne', 'rapport', 'rapports', 'all', 'and', 'the', 'for', 'with', 'this', 'that', 'from', 'have', 'been', 'will', 'would', 'could', 'should', 'about', 'which', 'their', 'there', 'where', 'when', 'what', 'because']
      : ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'no', 'just', 'him', 'know', 'take', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'uh', 'um', 'ah', 'oh', 'okay', 'yeah', 'thing', 'things', 'stuff', 'something', 'important', 'really', 'very', 'much', 'many', 'more', 'less', 'too', 'button', 'buttons', 'decision', 'decisions', 'improvement', 'improvements', 'problem', 'problems', 'question', 'questions', 'point', 'points', 'time', 'times', 'moment', 'moments', 'presentation', 'presentations', 'meeting', 'company', 'team', 'welcome', 'today', 'discuss', 'discussed', 'talking', 'talked', 'said', 'says', 'report', 'reports'];
   
    // Extraire et nettoyer les mots
    const normalizedText = text.replace(/\b([A-Z]{2,5})\1\b/g, '$1');
    const words = normalizedText.toLowerCase()
      .replace(/[^\w\sàâäéèêëïîôùûüÿæœç]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length >= 4 &&  // Mots de 4 lettres minimum (équilibre entre spécificité et rappel)
        !stopWords.includes(word) &&
        !word.match(/^0+$/) &&
        !word.match(/^\d+$/) &&
        !word.match(/^(euh+|heu+|hmm+|hum+|ben|bah)$/i)  // Double vérification des mots parasites
      );
    
    // Compter les fréquences
    const frequency = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    const acronyms = normalizedText.match(/\b[A-Z]{2,5}\b/g) || [];
    const acronymsSet = new Set();
    acronyms.forEach(acronym => {
      const lowerAcronym = acronym.toLowerCase();
      if (!stopWords.includes(lowerAcronym)) {
        acronymsSet.add(lowerAcronym);
        frequency[lowerAcronym] = (frequency[lowerAcronym] || 0) + 2;
      }
    });
    
    // Trier par fréquence décroissante et seuil adaptatif selon longueur texte
    const textLength = words.length;
    const minOccurrences = textLength > 100 ? 3 : textLength > 50 ? 2 : 1;  // Seuil adaptatif
    
    const keywords = Object.entries(frequency)
      .map(([word, count]) => ({ word, count }))
      .filter(item => item.count >= minOccurrences || (acronymsSet.has(item.word) && item.count >= 1))
      .filter(item => item.word.length >= 4 || acronymsSet.has(item.word))  // Vraie longueur minimale
      .filter(item => !item.word.match(/^(vraiment|finalement|notamment|simplement|exactement|justement|totalement|absolument)$/i))  // Adverbes sans valeur
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);  // Plus de mots potentiels avant filtrage final
    
    // Si pas assez de mots significatifs, chercher des noms propres (majuscules)
    if (keywords.length < 3) {
      const properNouns = text.match(/\b[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸ][a-zàâäéèêëïîôùûüÿæœç]+\b/g) || [];
      properNouns.forEach(noun => {
        const lowerNoun = noun.toLowerCase();
        if (!stopWords.includes(lowerNoun) && lowerNoun.length > 3 && !keywords.find(k => k.word === lowerNoun)) {
          keywords.push({ word: lowerNoun, count: 1 });
        }
      });
    }
    
    // Capitaliser les mots-clés pour meilleure lisibilité
    const finalKeywords = keywords
      .slice(0, 6)  // Maximum 6 vrais mots-clés techniques
      .map(item => ({
        word: acronymsSet.has(item.word) ? item.word.toUpperCase() : item.word.charAt(0).toUpperCase() + item.word.slice(1),
        count: item.count
      }));
    
    return finalKeywords;
  }

  /**
   * Génération simulée (fallback)
   */
  generateMockReport(transcript, sessionInfo) {
    const { language, title, duration } = sessionInfo;
    
    // Extraire le texte réel de la transcription
    const realText = (transcript || [])
      .filter(line => !line.isSystem && line.text)
      .map(line => line.text)
      .join(' ');
    
    // Générer un résumé basé sur la vraie transcription
    const textPreview = realText.length > 300 ? realText.substring(0, 300) + '...' : realText;
    
    // Extraire les actions mentionnées dans le texte
    const extractedActions = [];
    const actionPatterns = [
      /(?:faire|réaliser|préparer|organiser|valider|créer)\s+(?:le|la|les|l'|un|une|des)\s+([^.,!?]+)/gi,
      /(?:il faut|on doit|nous devons)\s+([^.,!?]+)/gi
    ];
    
    actionPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(realText)) !== null && extractedActions.length < 3) {
        extractedActions.push({
          id: extractedActions.length + 1,
          task: match[1].trim().substring(0, 80),
          responsible: 'Équipe',
          deadline: 'À définir',
          priority: 'Moyenne'
        });
      }
    });
    
    // Extraire les décisions mentionnées
    const extractedDecisions = [];
    const decisionPatterns = [
      /(?:décision|on décide|validation)\s+(?:de|d')\s+([^.,!?]+)/gi,
      /(?:adoption|mise en place)\s+(?:de|d'|du)\s+([^.,!?]+)/gi
    ];
    
    decisionPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(realText)) !== null && extractedDecisions.length < 3) {
        extractedDecisions.push({
          id: extractedDecisions.length + 1,
          text: match[0].trim().substring(0, 80),
          impact: 'Fonctionnel'
        });
      }
    });
    
    const mockData = {
      fr: {
        summary: realText.length > 50 
          ? this.generateLocalSummary(realText, title, duration)
          : `Cette réunion de ${Math.floor(duration / 60)} minutes a porté sur ${title}. Contenu de transcription insuffisant pour générer un résumé détaillé.`,
        actions: extractedActions.length > 0 ? extractedActions : [
          { id: 1, task: 'Définir les actions de suivi', responsible: 'Équipe', deadline: 'À définir', priority: 'Moyenne' }
        ],
        decisions: extractedDecisions.length > 0 ? extractedDecisions : [
          { id: 1, text: 'Aucune décision formelle détectée dans la transcription', impact: 'Aucun' }
        ]
      },
      en: {
        summary: realText.length > 50
          ? this.generateLocalSummary(realText, title, duration, 'en')
          : `This ${Math.floor(duration / 60)}-minute meeting focused on ${title}. Insufficient transcript content to generate detailed summary.`,
        actions: extractedActions.length > 0 ? extractedActions : [
          { id: 1, task: 'Define follow-up actions', responsible: 'Team', deadline: 'TBD', priority: 'Medium' }
        ],
        decisions: extractedDecisions.length > 0 ? extractedDecisions : [
          { id: 1, text: 'No formal decision detected in transcript', impact: 'None' }
        ]
      }
    };

    const data = mockData[language] || mockData.fr;
    
    return {
      ...data,
      email: this.generateEmail(data.summary, data.actions, data.decisions, title, language),
      meta: {
        provider: 'local',
        model: 'local-heuristics',
        source: 'fallback'
      }
    };
  }

  /**
   * Méthode de chat conversationnel avec l'IA
   * @param {string} userMessage - Message de l'utilisateur
   * @param {Array} conversationHistory - Historique des messages
   * @returns {Promise<string>} - Réponse de l'IA
   */
  async chat(userMessage, conversationHistory = []) {
    try {
      // Vérifier qu'une API est configurée
      const hasOpenAi = this.openaiKey && this.openaiKey !== 'your_openai_api_key_here';
      const hasClaude = this.useProxy || (this.claudeKey && this.claudeKey !== 'your_anthropic_api_key_here');

      if (!hasOpenAi && !hasClaude) {
        return "Je ne peux pas répondre car aucune clé API n'est configurée. Veuillez configurer vos clés API dans les paramètres.";
      }

      // Construire l'historique pour le contexte
      const messages = conversationHistory
        .slice(-10) // Garder seulement les 10 derniers messages pour limiter les tokens
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // Ajouter le message utilisateur
      messages.push({
        role: 'user',
        content: userMessage
      });

      // Appeler le provider configuré
      if (this.provider === 'claude' && hasClaude) {
        return await this.callClaudeChat(messages);
      } else if (hasOpenAi) {
        return await this.callOpenAIChat(messages);
      }

      return "Erreur: Aucun provider d'IA disponible.";

    } catch (error) {
      console.error('Erreur lors du chat:', error);
      throw error;
    }
  }

  /**
   * Appeler Claude pour le chat
   */
  async callClaudeChat(messages) {
    const endpoint = this.useProxy
      ? '/api/anthropic'
      : 'https://api.anthropic.com/v1/messages';

    const headers = {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    };

    if (!this.useProxy) {
      headers['x-api-key'] = this.claudeKey;
    }

    // Séparer le system message si présent
    const systemMessage = "Tu es un assistant IA professionnel et polyvalent de Meetizy. Tu peux aider sur tous types de sujets : réponses générales, programmation, rédaction, analyse, conseils, et bien sûr la prise de notes et l'analyse de réunions. Réponds de manière claire, concise et professionnelle en français.";
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: this.claudeModel,
        max_tokens: 2048,
        system: systemMessage,
        messages: messages.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        }))
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  /**
   * Appeler OpenAI pour le chat
   */
  async callOpenAIChat(messages) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: "Tu es un assistant IA professionnel et polyvalent de Meetizy. Tu peux aider sur tous types de sujets : réponses générales, programmation, rédaction, analyse, conseils, et bien sûr la prise de notes et l'analyse de réunions. Réponds de manière claire, concise et professionnelle en français."
          },
          ...messages
        ],
        max_tokens: 2048,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

// Singleton
const llmService = new LLMService();
export default llmService;
