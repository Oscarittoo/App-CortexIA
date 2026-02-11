import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const anthropicKey = env.VITE_ANTHROPIC_API_KEY;

  const anthropicProxy = () => ({
    name: 'anthropic-proxy',
    configureServer(server) {
      server.middlewares.use('/api/anthropic', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        if (!anthropicKey || anthropicKey === 'your_anthropic_api_key_here') {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Anthropic API key not configured on server' }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': anthropicKey,
                'anthropic-version': '2023-06-01'
              },
              body
            });

            const text = await response.text();
            res.statusCode = response.status;
            res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
            res.end(text);
          } catch (error) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: error.message }));
          }
        });
      });
    }
  });

  return {
    plugins: [react(), anthropicProxy()],
    base: './',
    server: {
      port: 5173
    },
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || '')
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true
    }
  };
});
