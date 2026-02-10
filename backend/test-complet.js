import dotenv from 'dotenv';
dotenv.config();

const API_URL = 'http://localhost:3001/api';
let authToken = '';
let userId = '';
let sessionId = '';
let testResults = [];

function logTest(category, name, success, details = '') {
  const status = success ? '✅' : '❌';
  console.log(`${status} ${category} - ${name}${details ? ': ' + details : ''}`);
  testResults.push({ category, name, success, details });
}

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { response, data, error: null };
  } catch (error) {
    return { response: null, data: null, error: error.message };
  }
}

async function testAuth() {
  console.log('\n═══════════════════════════════════════');
  console.log('🔐 TESTS AUTHENTIFICATION');
  console.log('═══════════════════════════════════════\n');

  // Test 1: Inscription
  try {
    const timestamp = Date.now();
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test${timestamp}@meetizy.com`,
        password: 'TestPassword123!',
        name: 'Test User'
      })
    });
    const data = await response.json();
    
    if (data.success && data.data.token) {
      authToken = data.data.token;
      userId = data.data.user.id;
      logTest('Auth', 'Inscription', true, `User ID: ${userId}`);
    } else {
      logTest('Auth', 'Inscription', false, data.error);
    }
  } catch (error) {
    logTest('Auth', 'Inscription', false, error.message);
  }

  // Test 2: Connexion
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    const data = await response.json();
    logTest('Auth', 'Connexion (échec attendu)', !data.success, 'Utilisateur inexistant');
  } catch (error) {
    logTest('Auth', 'Connexion', false, error.message);
  }

  // Test 3: Profil utilisateur
  try {
    const { data, error } = await makeRequest(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (error) {
      logTest('Auth', 'Récupération profil', false, error);
    } else {
      logTest('Auth', 'Récupération profil', data.success, data.success ? '' : data.error);
    }
  } catch (error) {
    logTest('Auth', 'Récupération profil', false, error.message);
  }
}

async function testAI() {
  console.log('\n═══════════════════════════════════════');
  console.log('🤖 TESTS IA (MODE MOCK)');
  console.log('═══════════════════════════════════════\n');

  const transcript = "Bonjour à tous. Nous nous réunissons aujourd'hui pour discuter du projet Meetizy. L'objectif est de créer une solution complète pour la transcription et l'analyse de réunions.";

  // Test 1: Synthèse
  try {
    const response = await fetch(`${API_URL}/ai/summary`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ transcript })
    });
    const data = await response.json();
    logTest('IA', 'Génération synthèse', data.success, data.success ? `${data.data.summary.substring(0, 50)}...` : data.error);
  } catch (error) {
    logTest('IA', 'Génération synthèse', false, error.message);
  }

  // Test 2: Plan d'action
  try {
    const { data, error } = await makeRequest(`${API_URL}/ai/action-plan`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        transcript,
        summary: "Résumé de la réunion"
      })
    });
    if (error) {
      logTest('IA', 'Génération plan d\'action', false, error);
    } else {
      logTest('IA', 'Génération plan d\'action', data.success, 
        data.success ? `${data.data.actionPlan.length} actions` : data.error);
    }
  } catch (error) {
    logTest('IA', 'Génération plan d\'action', false, error.message);
  }

  // Test 3: Suggestion temps réel
  try {
    const response = await fetch(`${API_URL}/ai/suggestion`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        recentTranscript: transcript.substring(0, 100),
        context: "Réunion de projet"
      })
    });
    const data = await response.json();
    logTest('IA', 'Suggestion temps réel', data.success, data.success ? data.data.suggestion : data.error);
  } catch (error) {
    logTest('IA', 'Suggestion temps réel', false, error.message);
  }

  // Test 4: Enrichissement
  try {
    const { data, error } = await makeRequest(`${API_URL}/ai/enrich`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ transcript })
    });
    if (error) {
      logTest('IA', 'Enrichissement transcription', false, error);
    } else {
      logTest('IA', 'Enrichissement transcription', data.success, data.success ? '' : data.error);
    }
  } catch (error) {
    logTest('IA', 'Enrichissement transcription', false, error.message);
  }

  // Test 5: Analyse complète (batch)
  try {
    const { data, error } = await makeRequest(`${API_URL}/ai/analyze-batch`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ transcript })
    });
    if (error) {
      logTest('IA', 'Analyse batch complète', false, error);
    } else {
      logTest('IA', 'Analyse batch complète', data.success, data.success ? '' : data.error);
    }
  } catch (error) {
    logTest('IA', 'Analyse batch complète', false, error.message);
  }
}

async function testSessions() {
  console.log('\n═══════════════════════════════════════');
  console.log('📅 TESTS SESSIONS');
  console.log('═══════════════════════════════════════\n');

  // Test 1: Créer session
  try {
    const { data, error } = await makeRequest(`${API_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Session de test',
        transcript: 'Contenu de la transcription test'
      })
    });
    if (error) {
      logTest('Sessions', 'Création session', false, error);
    } else if (data.success && data.data.sessionId) {
      sessionId = data.data.sessionId;
      logTest('Sessions', 'Création session', true, `Session ID: ${sessionId}`);
    } else {
      logTest('Sessions', 'Création session', false, data.error);
    }
  } catch (error) {
    logTest('Sessions', 'Création session', false, error.message);
  }

  // Test 2: Lister sessions
  try {
    const response = await fetch(`${API_URL}/sessions`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await response.json();
    logTest('Sessions', 'Liste sessions', data.success, data.success ? `${data.data.sessions.length} sessions` : data.error);
  } catch (error) {
    logTest('Sessions', 'Liste sessions', false, error.message);
  }

  // Test 3: Récupérer session
  if (sessionId) {
    try {
      const response = await fetch(`${API_URL}/sessions/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await response.json();
      logTest('Sessions', 'Récupération session', data.success);
    } catch (error) {
      logTest('Sessions', 'Récupération session', false, error.message);
    }

    // Test 4: Modifier session
    try {
      const response = await fetch(`${API_URL}/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Session modifiée',
          tags: ['test', 'modified']
        })
      });
      const data = await response.json();
      logTest('Sessions', 'Modification session', data.success);
    } catch (error) {
      logTest('Sessions', 'Modification session', false, error.message);
    }

    // Test 5: Exporter session
    try {
      const response = await fetch(`${API_URL}/sessions/${sessionId}/export`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await response.json();
      logTest('Sessions', 'Export session', data.success);
    } catch (error) {
      logTest('Sessions', 'Export session', false, error.message);
    }

    // Test 6: Supprimer session
    try {
      const response = await fetch(`${API_URL}/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await response.json();
      logTest('Sessions', 'Suppression session', data.success);
    } catch (error) {
      logTest('Sessions', 'Suppression session', false, error.message);
    }
  }
}

async function testQuotas() {
  console.log('\n═══════════════════════════════════════');
  console.log('📊 TESTS QUOTAS');
  console.log('═══════════════════════════════════════\n');

  // Test 1: Récupérer quotas
  try {
    const response = await fetch(`${API_URL}/quotas`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await response.json();
    logTest('Quotas', 'Récupération quotas', data.success, data.success ? `Plan: ${data.data.plan}` : data.error);
  } catch (error) {
    logTest('Quotas', 'Récupération quotas', false, error.message);
  }

  // Test 2: Réinitialiser quotas
  try {
    const { data, error } = await makeRequest(`${API_URL}/quotas/reset`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (error) {
      logTest('Quotas', 'Réinitialisation quotas', false, error);
    } else {
      logTest('Quotas', 'Réinitialisation quotas', data.success, data.success ? '' : data.error);
    }
  } catch (error) {
    logTest('Quotas', 'Réinitialisation quotas', false, error.message);
  }
}

async function testAdmin() {
  console.log('\n═══════════════════════════════════════');
  console.log('👑 TESTS ADMIN (échecs attendus)');
  console.log('═══════════════════════════════════════\n');

  // Test 1: Liste utilisateurs (doit échouer, pas admin)
  try {
    const response = await fetch(`${API_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await response.json();
    logTest('Admin', 'Liste utilisateurs', !data.success, 'Accès refusé (normal)');
  } catch (error) {
    logTest('Admin', 'Liste utilisateurs', true, 'Erreur attendue');
  }
}

async function generateReport() {
  console.log('\n\n═══════════════════════════════════════');
  console.log('📋 RAPPORT DE TEST COMPLET');
  console.log('═══════════════════════════════════════\n');

  const total = testResults.length;
  const passed = testResults.filter(t => t.success).length;
  const failed = testResults.filter(t => !t.success).length;
  const successRate = ((passed / total) * 100).toFixed(1);

  console.log(`Total tests: ${total}`);
  console.log(`✅ Réussis: ${passed}`);
  console.log(`❌ Échoués: ${failed}`);
  console.log(`📊 Taux de réussite: ${successRate}%\n`);

  // Résumé par catégorie
  const categories = [...new Set(testResults.map(t => t.category))];
  categories.forEach(cat => {
    const catTests = testResults.filter(t => t.category === cat);
    const catPassed = catTests.filter(t => t.success).length;
    console.log(`${cat}: ${catPassed}/${catTests.length} réussis`);
  });

  // Tests échoués détaillés
  if (failed > 0) {
    console.log('\n❌ TESTS ÉCHOUÉS:');
    testResults.filter(t => !t.success).forEach(t => {
      console.log(`   - ${t.category} / ${t.name}: ${t.details}`);
    });
  }

  console.log('\n═══════════════════════════════════════\n');
}

// Exécution des tests
async function runAllTests() {
  console.log('\n🧪 DÉBUT DES TESTS COMPLETS - BACKEND API');
  console.log('Backend: http://localhost:3001');
  console.log('Mode: MOCK (MOCK_OPENAI=true)\n');

  try {
    await testAuth();
    await testAI();
    await testSessions();
    await testQuotas();
    await testAdmin();
    await generateReport();
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
  }
}

runAllTests();
