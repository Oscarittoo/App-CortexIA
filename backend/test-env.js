import dotenv from 'dotenv';
dotenv.config();

console.log('📌 Environment Variables:');
console.log('PORT:', process.env.PORT);
console.log('MOCK_OPENAI:', process.env.MOCK_OPENAI);
console.log('MOCK_OPENAI type:', typeof process.env.MOCK_OPENAI);
console.log('MOCK_OPENAI === "true":', process.env.MOCK_OPENAI === 'true');
console.log('OpenAI Key length:', process.env.OPENAI_API_KEY?.length);
