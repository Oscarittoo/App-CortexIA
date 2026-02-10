// Test direct OpenAI sans passer par l'API
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

console.log('🔑 Clé OpenAI présente:', !!apiKey);
console.log('📏 Longueur:', apiKey?.length);

if (!apiKey || apiKey === 'sk-votre-cle-openai-ici') {
  console.error('❌ Clé invalide ou manquante!');
  process.exit(1);
}

const openai = new OpenAI({ apiKey });

async function testOpenAI() {
  try {
    console.log('\n🧪 Test appel OpenAI direct...\n');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Tu es un assistant utile.' },
        { role: 'user', content: 'Réponds juste "OK" si tu me comprends.' }
      ],
      max_tokens: 10
    });
    
    console.log('✅ Succès!');
    console.log('Réponse:', response.choices[0].message.content);
    console.log('Usage:', response.usage);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('Code:', error.code);
    console.error('Type:', error.type);
    console.error('Stack:', error.stack?.substring(0, 500));
  }
}

testOpenAI();
