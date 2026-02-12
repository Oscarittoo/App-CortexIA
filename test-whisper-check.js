import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

// Simulation simple pour tester l'environnement Node.js
const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("🎤 Test de configuration Whisper API (Node.js)");
console.log("-------------------------------------------");

// 1. Vérification de la clé API
// Note: En mode module, process.env n'est pas chargé automatiquement depuis .env
// Nous allons essayer de le lire manuellement
let apiKey = process.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
    try {
        const envPath = path.join(__dirname, '.env');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const match = envContent.match(/VITE_OPENAI_API_KEY=(sk-[a-zA-Z0-9]+)/);
            if (match) {
                apiKey = match[1];
                console.log("✅ Clé API trouvée dans .env");
            }
        }
    } catch (e) {
        console.error("Erreur lecture .env:", e.message);
    }
}

if (!apiKey) {
    console.warn("⚠️ Aucune clé API OpenAI trouvée (VITE_OPENAI_API_KEY).");
    console.warn("   Le test API ne peut pas être effectué, mais la transcription locale (WebSpeech) fonctionnera.");
} else {
    console.log(`🔑 Clé configurée: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}`);
    console.log("   Pour tester l'API, nous aurions besoin d'un fichier audio sample.");
}

console.log("\n📋 Options de test disponibles :");
console.log("1. Ouvrez 'test-webspeech.html' dans votre navigateur pour tester le microphone.");
console.log("2. Lancez l'application avec 'npm run dev' pour tester l'intégration complète.");
console.log("-------------------------------------------");
