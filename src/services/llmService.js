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
      .filter(line => line.text && line.text.trim() && !line.isSystem)
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

      // Générer l'email avec l'IA aussi
      const email = await this.generateEmailWithAI(summary, actions, decisions, title, language, transcriptText);

      return {
        summary,
        actions,
        decisions,
        email
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
      ? `Tu es un expert en synthèse de réunions. Analyse cette transcription et génère un résumé PROFESSIONNEL, COHÉRENT et SANS RÉPÉTITIONS.

🎯 OBJECTIF:
Créer un résumé qui reflète fidèlement le contenu de la réunion, en identifiant les vrais sujets discutés (pas juste les mots fréquents).

📋 ÉTAPE 1 - ANALYSE DU CONTENU:
1. Identifie QUI parle (combien de personnes, rôles si mentionnés)
2. Repère les SUJETS RÉELS abordés (projets, problèmes, objectifs)
3. Extrais les mots-clés TECHNIQUES et SPÉCIFIQUES (évite: réunion, présentation, entreprise, équipe, etc.)
4. Note les décisions, actions, dates, chiffres importants

✍️ ÉTAPE 2 - RÉDACTION DU RÉSUMÉ:

**Contexte** (2-3 phrases max)
- Décris le contexte réel de la discussion
- Utilise les vrais sujets et termes techniques identifiés
- JAMAIS de formules génériques comme "Cette réunion a porté sur..."
- Évite absolument de répéter les mêmes mots

**Points Clés** (3-4 points avec -)
- Chaque point doit être unique et spécifique
- Utilise les termes exacts de la transcription
- Mentionne les décisions concrètes
- PAS de répétitions entre les points

**Conclusion** (1 phrase)
- Prochaines étapes ou orientations

⚠️ RÈGLES STRICTES:
- MAXIMUM 120 mots
- PAS de répétitions (varie le vocabulaire)
- PAS de mots génériques (réunion, présentation, entreprise)
- PAS de formules creuses
- Ton professionnel, phrases fluides
- Ignore les mots parasites (euh, donc, alors, voilà)

TRANSCRIPTION:
${transcriptText}

Réponds directement avec le résumé en Markdown (max 120 mots).`
      : `You are a meeting synthesis expert. Analyze this transcript and generate a PROFESSIONAL, COHERENT summary WITHOUT REPETITIONS.

🎯 OBJECTIVE:
Create a summary that faithfully reflects the meeting content, identifying real discussed topics (not just frequent words).

📋 STEP 1 - CONTENT ANALYSIS:
1. Identify WHO speaks (how many people, roles if mentioned)
2. Identify REAL topics discussed (projects, problems, objectives)
3. Extract TECHNICAL and SPECIFIC keywords (avoid: meeting, presentation, company, team, etc.)
4. Note decisions, actions, dates, important numbers

✍️ STEP 2 - WRITING THE SUMMARY:

**Context** (2-3 sentences max)
- Describe the real context of the discussion
- Use real topics and technical terms identified
- NEVER generic formulas like "This meeting focused on..."
- Absolutely avoid repeating the same words

**Key Points** (3-4 points with -)
- Each point must be unique and specific
- Use exact terms from transcript
- Mention concrete decisions
- NO repetitions between points

**Conclusion** (1 sentence)
- Next steps or directions

⚠️ STRICT RULES:
- MAXIMUM 120 words
- NO repetitions (vary vocabulary)
- NO generic words (meeting, presentation, company)
- NO hollow formulas
- Professional tone, fluid sentences
- Ignore filler words (uh, so, well, okay)

TRANSCRIPT:
${transcriptText}

Respond directly with the summary in Markdown (max 120 words).`;

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
      const keywordsSection = topKeywords.length > 0 ? `\n\n**Mots-clés** : ${topKeywords.join(', ')}` : '';
      const conclusionSection = conclusion ? `\n\n**Conclusion**\n\n${conclusion}` : '';
      
      return `**Contexte**\n\n${contextIntro}\n\n**Points Clés**\n\n${uniquePoints.map(s => `- ${s}`).join('\n')}${keywordsSection}${conclusionSection}`;
    } else {
      const keywordsSection = topKeywords.length > 0 ? `\n\n**Keywords**: ${topKeywords.join(', ')}` : '';
      const conclusionSection = conclusion ? `\n\n**Conclusion**\n\n${conclusion}` : '';
      
      return `**Context**\n\n${contextIntro}\n\n**Key Points**\n\n${uniquePoints.map(s => `- ${s}`).join('\n')}${keywordsSection}${conclusionSection}`;
    }
  }

  /**
   * Analyse la fréquence des mots pour identifier les mots-clés
   */
  analyzeKeywords(text, language = 'fr') {
    // Mots à ignorer (stop words + mots génériques sans valeur sémantique)
    const stopWords = language === 'fr'
      ? ['le', 'la', 'les', 'de', 'des', 'un', 'une', 'du', 'et', 'ou', 'mais', 'donc', 'or', 'ni', 'car', 'que', 'qui', 'quoi', 'dont', 'où', 'ce', 'cet', 'cette', 'ces', 'mon', 'ton', 'son', 'ma', 'ta', 'sa', 'mes', 'tes', 'ses', 'notre', 'votre', 'leur', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'on', 'se', 'me', 'te', 'lui', 'y', 'en', 'ne', 'pas', 'plus', 'très', 'bien', 'tout', 'tous', 'toute', 'toutes', 'si', 'oui', 'non', 'euh', 'hmm', 'ah', 'oh', 'alors', 'donc', 'voilà', 'ok', 'bon', 'ben', 'hein', 'quoi', 'là', 'ça', 'pour', 'avec', 'sans', 'dans', 'sur', 'sous', 'vers', 'par', 'entre', 'chez', 'être', 'avoir', 'faire', 'aller', 'vais', 'vas', 'va', 'allons', 'allez', 'vont', 'dire', 'voir', 'donner', 'prendre', 'pouvoir', 'vouloir', 'devoir', 'savoir', 'peut', 'peuvent', 'peux', 'comme', 'ensuite', 'après', 'avant', 'important', 'importante', 'importants', 'importantes', 'chose', 'choses', 'fait', 'faite', 'faits', 'faites', 'permet', 'permettre', 'aider', 'aide', 'aussi', 'même', 'vrai', 'vraiment', 'genre', 'truc', 'trucs', 'machin', 'trés', 'super', 'déjà', 'encore', 'toujours', 'jamais', 'rien', 'quelque', 'quelques', 'autre', 'autres', 'beaucoup', 'peu', 'moins', 'trop', 'assez', 'tant', 'autant', 'plusieurs', 'chaque', 'certain', 'certains', 'certaine', 'certaines', 'bonjour', 'aujourd\'hui', 'aujourdhui', 'bienvenue', 'nouveau', 'nouveaux', 'arrivant', 'arrivants', 'année', 'années', 'réunion', 'présentation', 'présenter', 'présente', 'présentons', 'présentant', 'présentations', 'entreprise', 'équipe', 'directeur', 'direction', 'tour', 'table', 'décision', 'décisions', 'bouton', 'boutons', 'amélioration', 'améliorations', 'problème', 'problèmes', 'question', 'questions', 'point', 'points', 'fois', 'temps', 'moment', 'moments', 'manière', 'façon', 'façons', 'niveau', 'niveaux', 'partie', 'parties', 'sujet', 'sujets', 'all', 'and', 'the', 'for', 'with', 'this', 'that', 'from', 'have', 'been', 'will', 'would', 'could', 'should', 'about', 'which', 'their', 'there', 'where', 'when', 'what', 'because']
      : ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'no', 'just', 'him', 'know', 'take', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'uh', 'um', 'ah', 'oh', 'okay', 'yeah', 'thing', 'things', 'stuff', 'something', 'important', 'really', 'very', 'much', 'many', 'more', 'less', 'too', 'button', 'buttons', 'decision', 'decisions', 'improvement', 'improvements', 'problem', 'problems', 'question', 'questions', 'point', 'points', 'time', 'times', 'moment', 'moments', 'presentation', 'presentations', 'meeting', 'company', 'team', 'welcome', 'today'];
   
    // Extraire et nettoyer les mots
    const normalizedText = text.replace(/\b([A-Z]{2,5})\1\b/g, '$1');
    const words = normalizedText.toLowerCase()
      .replace(/[^\w\sàâäéèêëïîôùûüÿæœç]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length > 4 &&  // Mots de 5 lettres minimum (plus spécifiques)
        !stopWords.includes(word) &&
        !word.match(/^0+$/) &&
        !word.match(/^\d+$/)
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
    
    // Trier par fréquence décroissante et ne garder que les mots apparaissant au moins 3 fois
    const keywords = Object.entries(frequency)
      .map(([word, count]) => ({ word, count }))
      .filter(item => item.count >= 3 || (acronymsSet.has(item.word) && item.count >= 2))
      .filter(item => item.word.length > 2 || acronymsSet.has(item.word))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
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
    
    return keywords.slice(0, 5);  // Maximum 5 mots-clés
  }

  /**
   * Génération simulée (fallback)
   */
  generateMockReport(transcript, sessionInfo) {
    const { language, title, duration } = sessionInfo;
    
    // Extraire le texte réel de la transcription
    const realText = transcript
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
      email: this.generateEmail(data.summary, data.actions, data.decisions, title, language)
    };
  }
}

// Singleton
const llmService = new LLMService();
export default llmService;
