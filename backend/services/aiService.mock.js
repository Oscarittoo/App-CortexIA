// Mock OpenAI Service - Pour tester sans quota OpenAI
// Remplace les vrais appels OpenAI par des réponses simulées

export async function generateSummary(transcript) {
  // Simuler un délai réseau
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    summary: `## Points clés
- Discussion sur : ${transcript.substring(0, 50)}...
- Échanges constructifs entre les participants
- Objectifs clairement définis

## Décisions prises
- Validation du plan proposé
- Attribution des responsabilités

## Actions à faire
- **Équipe** : Finaliser les livrables cette semaine
- **Chef de projet** : Organiser le prochain point

## Sujets en suspens
- Budget à confirmer
- Date de livraison finale à valider`,
    usage: {
      prompt_tokens: 150,
      completion_tokens: 120,
      total_tokens: 270
    }
  };
}

export async function generateActionPlan(transcript, summary = null) {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    success: true,
    actions: [
      {
        title: "Finaliser le développement",
        description: "Compléter les fonctionnalités principales du projet",
        priority: "haute",
        assignee: "Équipe dev",
        deadline: "Vendredi prochain",
        category: "technique"
      },
      {
        title: "Préparer la documentation",
        description: "Rédiger la documentation utilisateur et technique",
        priority: "moyenne",
        assignee: "Non assigné",
        deadline: "À définir",
        category: "communication"
      },
      {
        title: "Organiser une réunion de suivi",
        description: "Point hebdomadaire sur l'avancement",
        priority: "basse",
        assignee: "Chef de projet",
        deadline: "Lundi prochain",
        category: "autre"
      }
    ],
    usage: {
      prompt_tokens: 180,
      completion_tokens: 100,
      total_tokens: 280
    }
  };
}

export async function getRealTimeSuggestion(recentTranscript, context = '') {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const suggestions = [
    "Pourriez-vous préciser les délais associés à cette tâche ?",
    "Il serait utile de définir qui sera responsable de ce point.",
    "Pensez à documenter cette décision pour référence future.",
    "Avez-vous considéré l'impact sur les autres équipes ?",
    "Suggestion : prévoir un point de suivi dans 2 semaines."
  ];
  
  return {
    success: true,
    suggestion: suggestions[Math.floor(Math.random() * suggestions.length)],
    usage: {
      prompt_tokens: 50,
      completion_tokens: 20,
      total_tokens: 70
    }
  };
}

export async function enrichTranscription(transcript) {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  return {
    success: true,
    enrichment: {
      topics: ["Gestion de projet", "Développement", "Planning", "Coordination"],
      sentiment: "positif",
      keywords: ["développement", "deadline", "équipe", "planning", "projet"],
      speakers_count: 3,
      estimated_duration: "15 minutes"
    },
    usage: {
      prompt_tokens: 100,
      completion_tokens: 50,
      total_tokens: 150
    }
  };
}
