// Test rapide de l'API - Inscription + Connexion + Appel IA
const API_URL = 'http://localhost:3001/api';

async function testFlow() {
  try {
    console.log('🔷 Test 1: Inscription...');
    
    // 1. Inscription
    const registerResponse = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: `test${Date.now()}@meetizy.com`,
        password: 'Test123456'
      })
    });
    
    const registerData = await registerResponse.json();
    
    if (!registerResponse.ok) {
      throw new Error(`Inscription échouée: ${registerData.message}`);
    }
    
    console.log('✅ Inscription réussie!');
    console.log('   Données:', JSON.stringify(registerData, null, 2));
    
    if (!registerData.data || !registerData.data.user || !registerData.data.token) {
      throw new Error('Format de réponse invalide');
    }
    
    const user = registerData.data.user;
    const token = registerData.data.token;
    
    console.log(`   User: ${user.name} (${user.email})`);
    console.log(`   Plan: ${user.plan.toUpperCase()}`);
    
    // 2. Test appel IA - Synthèse
    console.log('\n🔷 Test 2: Génération de synthèse IA...');
    
    const transcript = `Bonjour à tous. Réunion de lancement du projet Meetizy.
Alice: Le backend est prêt à 90%, livraison vendredi.
Bob: Le frontend est terminé, besoin d'aide pour les tests.
Alice: Je peux aider Bob cette semaine.
Décision: Mise en production lundi prochain.`;
    
    const aiResponse = await fetch(`${API_URL}/ai/summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ transcript })
    });
    
    const aiData = await aiResponse.json();
    
    console.log('   Réponse IA:', JSON.stringify(aiData, null, 2));
    
    if (!aiResponse.ok) {
      throw new Error(`Appel IA échoué: ${aiData.message || JSON.stringify(aiData)}`);
    }
    
    console.log('✅ Synthèse IA générée avec succès!');
    console.log('\n📝 SYNTHÈSE:');
    console.log(aiData.summary);
    console.log('\n📊 Usage OpenAI:', aiData.usage);
    
    // 3. Vérifier les quotas
    console.log('\n🔷 Test 3: Vérification des quotas...');
    
    const quotasResponse = await fetch(`${API_URL}/quotas`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const quotasData = await quotasResponse.json();
    
    console.log('✅ Quotas récupérés:');
    console.log(`   Réunions IA: ${quotasData.quotas.aiMeetings.used} / ${quotasData.quotas.aiMeetings.limit}`);
    console.log(`   Transcription: ${quotasData.quotas.transcriptionMinutes.used} / ${quotasData.quotas.transcriptionMinutes.limit} min`);
    
    console.log('\n🎉 Tous les tests sont passés! Le backend fonctionne parfaitement.');
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    process.exit(1);
  }
}

testFlow();
