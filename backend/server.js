import dotenv from 'dotenv';

// Load environment variables FIRST before any other imports
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';

// Import routes (after dotenv is loaded)
import authRoutes from './routes/auth.js';
import aiRoutes from './routes/ai.js';
import sessionsRoutes from './routes/sessions.js';
import quotasRoutes from './routes/quotas.js';
import adminRoutes from './routes/admin.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:5173',
      'http://localhost:3000'
    ];
    
    // Allow chrome extensions and specified origins
    if (!origin || allowedOrigins.some(allowed => 
      origin.startsWith(allowed) || allowed.includes('chrome-extension')
    )) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Trop de requêtes, veuillez réessayer plus tard.'
});

app.use('/api/', limiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/quotas', quotasRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route non trouvée'
  });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  const useMock = process.env.MOCK_OPENAI === 'true';
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-votre-cle-openai-ici';
  const aiMode = useMock ? '🎭 Mock Mode' : (hasOpenAIKey ? '✅ OpenAI Real' : '❌ No API Key');
  
  console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   🎯 MEETIZY Backend API                      ║
║                                               ║
║   Status: ✅ Running                          ║
║   Port: ${PORT}                              ║
║   Environment: ${process.env.NODE_ENV || 'development'}       ║
║   AI Mode: ${aiMode}     ║
║                                               ║
║   📚 Documentation: http://localhost:${PORT}/api/health  ║
║                                               ║
╚═══════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    console.log('HTTP server closed');
  });
});

export default app;
