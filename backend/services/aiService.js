import OpenAI from 'openai';
import dotenv from 'dotenv';

// S'assurer que les variables d'environnement sont chargées
dotenv.config();

// Initialiser le client OpenAI avec vérification
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey || apiKey === 'sk-votre-cle-openai-ici') {
  console.error('❌ ERREUR: Clé OpenAI manquante ou invalide dans .env');
  console.error('Veuillez configurer OPENAI_API_KEY dans backend/.env');
}

const openai = new OpenAI({
  apiKey: apiKey
});

const MODEL = 'gpt-4o';

/**
 * Générer une synthèse cognitive de la réunion
 */
export async function generateSummary(transcript) {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en analyse de réunions et en prise de notes structurées. Réponds toujours en français.'
        },
        {
          role: 'user',
          content: `Tu es un assistant IA spécialisé dans l'analyse de réunions. 
Voici la transcription d'une réunion :

${transcript}

Génère une synthèse structurée comprenant :
1. **Points clés** : Les éléments importants discutés
2. **Décisions prises** : Les décisions actées pendant la réunion
3. **Actions à faire** : Les tâches à accomplir avec les responsables si mentionnés
4. **Sujets en suspens** : Les points qui nécessitent un suivi

Format la réponse en Markdown avec des puces et des sections claires.`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    return {
      success: true,
      summary: response.choices[0].message.content,
      usage: response.usage
    };
  } catch (error) {
    console.error('Erreur OpenAI summary:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Générer un plan d'action
 */
export async function generateActionPlan(transcript, summary = null) {
  try {
    const context = summary
      ? `Voici le résumé de la réunion : ${summary}\n\nTranscription complète : ${transcript}`
      : `Voici la transcription de la réunion : ${transcript}`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en gestion de projet et en extraction d\'actions à partir de réunions. Réponds toujours en JSON valide.'
        },
        {
          role: 'user',
          content: `${context}

Génère un plan d'action détaillé au format JSON avec la structure suivante :
{
  "actions": [
    {
      "title": "Titre de l'action",
      "description": "Description détaillée",
      "priority": "haute|moyenne|basse",
      "assignee": "Nom du responsable ou 'Non assigné'",
      "deadline": "Date limite estimée ou 'À définir'",
      "category": "technique|business|communication|autre"
    }
  ]
}

Identifie toutes les tâches mentionnées explicitement ou implicitement dans la réunion.`
        }
      ],
      temperature: 0.3,
      max_tokens: 1500
    });

    const content = response.choices[0].message.content;
    const actions = JSON.parse(content);

    return {
      success: true,
      actions: actions.actions,
      usage: response.usage
    };
  } catch (error) {
    console.error('Erreur OpenAI action plan:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obtenir une suggestion en temps réel
 */
export async function getRealTimeSuggestion(recentTranscript, context = '') {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'Tu es un assistant IA qui aide en temps réel pendant les réunions avec des suggestions courtes et pertinentes. Réponds en français.'
        },
        {
          role: 'user',
          content: `Contexte de la réunion : ${context}

Dernières paroles échangées :
${recentTranscript}

En tant qu'assistant IA en temps réel, fournis une suggestion courte et pertinente qui pourrait aider les participants. 
Ce peut être :
- Une question à poser pour clarifier un point
- Un rappel d'un élément important
- Une suggestion de décision
- Un point d'attention

Réponds en 1-2 phrases maximum, de manière concise et actionnable.`
        }
      ],
      temperature: 0.7,
      max_tokens: 100
    });

    return {
      success: true,
      suggestion: response.choices[0].message.content,
      usage: response.usage
    };
  } catch (error) {
    console.error('Erreur OpenAI suggestion:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Enrichir une transcription avec analyse sémantique
 */
export async function enrichTranscription(transcript) {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en analyse sémantique de conversations professionnelles. Réponds toujours en JSON valide.'
        },
        {
          role: 'user',
          content: `Analyse cette transcription et fournis un enrichissement sémantique :

${transcript}

Retourne un JSON avec :
{
  "topics": ["Liste des sujets abordés"],
  "sentiment": "positif|neutre|négatif",
  "keywords": ["Mots-clés importants"],
  "speakers_count": nombre approximatif de participants,
  "estimated_duration": "durée estimée en minutes"
}`
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const enrichment = JSON.parse(response.choices[0].message.content);

    return {
      success: true,
      enrichment,
      usage: response.usage
    };
  } catch (error) {
    console.error('Erreur OpenAI enrich:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
