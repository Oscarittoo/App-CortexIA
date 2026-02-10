import dotenv from 'dotenv';
dotenv.config();

console.log('🧪 Test Import Dynamique');
console.log('MOCK_OPENAI:', process.env.MOCK_OPENAI);
console.log('USE_MOCK:', process.env.MOCK_OPENAI === 'true');

const USE_MOCK = process.env.MOCK_OPENAI === 'true';
const aiService = USE_MOCK 
  ? await import('./services/aiService.mock.js')
  : await import('./services/aiService.js');

console.log('✅ Module chargé:', USE_MOCK ? 'MOCK' : 'REAL');
console.log('🔍 aiService keys:', Object.keys(aiService));
console.log('🔍 aiService.generateSummary type:', typeof aiService.generateSummary);

// Tester l'appel
try {
  const result = await aiService.generateSummary('Test de transcription pour vérifier que le mock fonctionne');
  console.log('✅ Test réussi!');
  console.log('Résultat:', result);
} catch (error) {
  console.error('❌ Erreur:', error.message);
}
