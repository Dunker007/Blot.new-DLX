#!/usr/bin/env node

/**
 * DLX Studios Ultimate - Production Server
 * 
 * Unified server combining:
 * - Static file serving (React app)
 * - LuxRig bridge (AI routing)
 * - API endpoints (data management)
 * - Windows-optimized for LuxRig hosting
 */

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001; // Changed default to 3001 since 3000 is often used
const LUXRIG_PORT = process.env.LUXRIG_PORT || 3002;
const LM_STUDIO_URL = process.env.LM_STUDIO_URL || 'http://localhost:1234';
const NODE_ENV = process.env.NODE_ENV || 'production';

// ==================== Security Middleware ====================
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Higher limit for local server
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 AI requests per minute
  message: 'AI rate limit exceeded, please slow down.',
});

app.use('/api/', apiLimiter);
app.use('/api/ai/', aiLimiter);

// CORS configuration
const corsOptions = {
  origin: NODE_ENV === 'development' 
    ? ['http://localhost:5173', 'http://localhost:3001', 'http://localhost:3002']
    : true, // Allow all in production (local network)
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== Logging Middleware ====================
const logger = {
  info: (msg, ...args) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, ...args),
  error: (msg, ...args) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, ...args),
  warn: (msg, ...args) => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, ...args),
};

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ==================== Health & Status Endpoints ====================
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    luxrig: 'active',
    version: '1.0.0',
  });
});

app.get('/api/status', async (req, res) => {
  try {
    // Check LM Studio availability
    let lmStudioStatus = { available: false };
    try {
      const response = await fetch(`${LM_STUDIO_URL}/v1/models`, { 
        signal: AbortSignal.timeout(2000) 
      });
      if (response.ok) {
        const models = await response.json();
        lmStudioStatus = {
          available: true,
          models: models.data?.length || 0,
          endpoint: LM_STUDIO_URL,
        };
      }
    } catch (error) {
      logger.warn('LM Studio not available:', error.message);
    }

    res.json({
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        platform: process.platform,
      },
      lmStudio: lmStudioStatus,
      luxrig: {
        bridge: true,
        port: LUXRIG_PORT,
      },
    });
  } catch (error) {
    logger.error('Status check failed:', error);
    res.status(500).json({ error: 'Status check failed' });
  }
});

// ==================== LM Studio Health Check ====================
app.get('/api/lm-studio/health', async (req, res) => {
  try {
    const response = await fetch(`${LM_STUDIO_URL}/v1/models`, {
      signal: AbortSignal.timeout(3000),
    });
    
    if (!response.ok) {
      throw new Error(`LM Studio returned ${response.status}`);
    }

    const models = await response.json();
    res.json({
      available: true,
      models: models.data?.length || 0,
      endpoint: LM_STUDIO_URL,
      modelList: models.data?.map(m => ({
        id: m.id,
        name: m.id,
      })) || [],
    });
  } catch (error) {
    logger.warn('LM Studio health check failed:', error.message);
    res.status(503).json({
      available: false,
      error: error.message,
      suggestion: 'Ensure LM Studio is running on ' + LM_STUDIO_URL,
    });
  }
});

// ==================== Task Complexity Analyzer ====================
function analyzeTaskComplexity(prompt) {
  if (!prompt || typeof prompt !== 'string') return 'medium';
  
  const complexKeywords = [
    'analyze', 'complex', 'detailed', 'comprehensive', 'research',
    'strategy', 'business plan', 'architecture', 'design patterns',
    'generate code', 'write program', 'create function', 'implement',
  ];
  
  const simpleKeywords = [
    'hello', 'test', 'simple', 'quick', 'comment', 'explain briefly',
    'summary', 'list', 'format', 'fix typo', 'translate',
  ];
  
  const lowerPrompt = prompt.toLowerCase();
  const complexScore = complexKeywords.filter(word => lowerPrompt.includes(word)).length;
  const simpleScore = simpleKeywords.filter(word => lowerPrompt.includes(word)).length;
  
  if (simpleScore > complexScore) return 'simple';
  if (complexScore > 2) return 'complex';
  if (prompt.length > 500) return 'complex';
  if (prompt.length < 50) return 'simple';
  
  return 'medium';
}

// ==================== AI Chat Endpoint ====================
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, model, max_tokens = 2048, temperature = 0.7, stream = false } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }
    
    const lastMessage = messages[messages.length - 1];
    const complexity = analyzeTaskComplexity(lastMessage.content || '');
    
    logger.info(`AI Request - Complexity: ${complexity}, Length: ${lastMessage.content?.length || 0}`);
    
    // Route simple/medium tasks to LM Studio
    if (complexity === 'simple' || complexity === 'medium') {
      try {
        logger.info('Routing to LuxRig LM Studio');
        
        const response = await fetch(`${LM_STUDIO_URL}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // Prefer gemma-3n-e4b-it if available, otherwise auto-select
            model: model || 'gemma-3n-e4b-it', // User's preferred model
            messages,
            max_tokens,
            temperature,
            stream: false, // Disable streaming for bridge
          }),
          signal: AbortSignal.timeout(60000), // 60 second timeout
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`LM Studio error: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        
        // Add routing metadata
        result.luxrig_metadata = {
          routed_to: 'local',
          complexity,
          cost_savings: 'estimated $0.00 (local)',
          response_time: Date.now(),
          model_used: result.model || model,
        };
        
        return res.json(result);
      } catch (error) {
        logger.warn('LM Studio failed, falling back:', error.message);
        // Fall through to return error or cloud recommendation
      }
    }
    
    // For complex tasks or if LM Studio fails, recommend cloud
    if (complexity === 'complex') {
      return res.json({
        choices: [{
          message: {
            role: 'assistant',
            content: `This is a complex task (${complexity}) that would benefit from a cloud AI provider with larger context windows and more advanced capabilities. For best results, use OpenAI GPT-4, Claude, or Gemini.`,
          },
        }],
        luxrig_metadata: {
          routed_to: 'cloud_recommended',
          complexity,
          reason: 'Task too complex for local processing',
        },
      });
    }
    
    // Fallback error
    return res.status(503).json({
      error: 'AI processing unavailable',
      details: 'LM Studio is not responding. Please ensure it is running.',
      fallback: 'Try a cloud provider',
    });
    
  } catch (error) {
    logger.error('AI Chat Error:', error);
    res.status(500).json({
      error: 'AI processing failed',
      details: error.message,
    });
  }
});

// ==================== Usage Statistics ====================
let usageStats = {
  total_requests: 0,
  local_requests: 0,
  cloud_requests: 0,
  cloud_recommended: 0, // Requests recommended for cloud but not actually routed
  error_requests: 0, // Failed/error requests
  cost_savings: 0,
  start_time: Date.now(),
};

app.get('/api/stats/usage', (req, res) => {
  const uptimeHours = (Date.now() - usageStats.start_time) / (1000 * 60 * 60);
  res.json({
    ...usageStats,
    uptime_hours: uptimeHours.toFixed(2),
    avg_requests_per_hour: (usageStats.total_requests / Math.max(uptimeHours, 0.1)).toFixed(2),
    success_rate: usageStats.total_requests > 0 
      ? ((usageStats.local_requests + usageStats.cloud_requests + usageStats.cloud_recommended) / usageStats.total_requests * 100).toFixed(1) + '%'
      : '0%',
    last_updated: new Date().toISOString(),
  });
});

// Update stats on AI chat requests
app.use('/api/ai/chat', (req, res, next) => {
  const originalJson = res.json;
  const originalStatus = res.status.bind(res);
  
  // Track response status code
  let statusCode = 200;
  res.status = function(code) {
    statusCode = code;
    return originalStatus(code);
  };
  
  res.json = function(data) {
    usageStats.total_requests++;
    
    // Check if this is an error response
    const isError = statusCode >= 400 || data?.error !== undefined;
    
    if (isError) {
      // Track error requests separately
      usageStats.error_requests++;
    } else if (data?.luxrig_metadata) {
      // Only count successful requests with metadata
      const routedTo = data.luxrig_metadata.routed_to;
      
      if (routedTo === 'local') {
        usageStats.local_requests++;
      } else if (routedTo === 'cloud_recommended') {
        // Track cloud recommendations separately (these aren't actual cloud requests)
        usageStats.cloud_recommended++;
      } else {
        // Only count as cloud request if actually routed to cloud
        // (this would require actual cloud API integration)
        usageStats.cloud_requests++;
      }
    }
    // If no metadata and not an error, don't categorize (shouldn't happen)
    
    return originalJson.call(this, data);
  };
  next();
});

// ==================== Data API Endpoints ====================
// These endpoints allow the frontend to sync data with the server
// For now, they use in-memory storage (can be extended to SQLite/file storage)

const dataStore = {
  projects: [],
  providers: [],
  models: [],
  conversations: [],
};

app.get('/api/data/:type', (req, res) => {
  const { type } = req.params;
  if (dataStore[type]) {
    res.json({ data: dataStore[type], error: null });
  } else {
    res.status(404).json({ data: null, error: 'Data type not found' });
  }
});

app.post('/api/data/:type', (req, res) => {
  const { type } = req.params;
  if (!dataStore[type]) {
    return res.status(404).json({ data: null, error: 'Data type not found' });
  }
  
  const item = { ...req.body, id: req.body.id || `id_${Date.now()}_${Math.random()}` };
  dataStore[type].push(item);
  res.json({ data: item, error: null });
});

app.put('/api/data/:type/:id', (req, res) => {
  const { type, id } = req.params;
  if (!dataStore[type]) {
    return res.status(404).json({ data: null, error: 'Data type not found' });
  }
  
  const index = dataStore[type].findIndex(item => item.id === id);
  if (index === -1) {
    return res.status(404).json({ data: null, error: 'Item not found' });
  }
  
  dataStore[type][index] = { ...dataStore[type][index], ...req.body };
  res.json({ data: dataStore[type][index], error: null });
});

app.delete('/api/data/:type/:id', (req, res) => {
  const { type, id } = req.params;
  if (!dataStore[type]) {
    return res.status(404).json({ data: null, error: 'Data type not found' });
  }
  
  const index = dataStore[type].findIndex(item => item.id === id);
  if (index === -1) {
    return res.status(404).json({ data: null, error: 'Item not found' });
  }
  
  dataStore[type].splice(index, 1);
  res.json({ data: null, error: null });
});

// ==================== LM Studio Proxy ====================
app.use('/lm-studio', createProxyMiddleware({
  target: LM_STUDIO_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/lm-studio': '', // Remove /lm-studio prefix
  },
  onError: (err, req, res) => {
    logger.error('Proxy Error:', err.message);
    res.status(503).json({
      error: 'LM Studio unavailable',
      message: 'Local AI service is not responding',
      endpoint: LM_STUDIO_URL,
    });
  },
  onProxyReq: (proxyReq, req) => {
    logger.info(`Proxying to LM Studio: ${req.method} ${req.url}`);
  },
}));

// ==================== Static File Serving ====================
const distPath = join(__dirname, 'dist');
if (existsSync(distPath)) {
  // Serve static files from dist with proper MIME types
  app.use(express.static(distPath, {
    maxAge: NODE_ENV === 'production' ? '1y' : '0',
    etag: true,
    setHeaders: (res, path) => {
      // Ensure JS files are served with correct MIME type
      if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      }
      // Enable CORS for assets
      res.setHeader('Access-Control-Allow-Origin', '*');
    },
  }));
  
  // SPA fallback - serve index.html for all routes (Express 5 compatible)
  app.get(/^(?!\/api|\/lm-studio|\/health).*$/, (req, res, next) => {
    // Skip if it's a static asset file
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
      return next();
    }
    
    // For all other routes, serve index.html (SPA routing)
    const indexPath = join(distPath, 'index.html');
    if (existsSync(indexPath)) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(indexPath, (err) => {
        if (err) {
          logger.error('Error serving index.html:', err);
          next(err);
        }
      });
    } else {
      logger.error('index.html not found at:', indexPath);
      next();
    }
  });
} else {
  logger.warn('Dist folder not found. Run "npm run build" first.');
  app.get(/.*/, (req, res) => {
    res.status(503).json({
      error: 'Frontend not built',
      message: 'Please run "npm run build" to build the frontend',
    });
  });
}

// ==================== Error Handling ====================
app.use((err, req, res, next) => {
  logger.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: NODE_ENV === 'development' ? err.message : 'An error occurred',
  });
});

// 404 handler - catch any remaining unmatched routes
app.use((req, res) => {
  // Don't handle API routes here - they should have been handled above
  if (req.path.startsWith('/api/') || req.path.startsWith('/lm-studio')) {
    res.status(404).json({
      error: 'Not Found',
      path: req.path,
      available_endpoints: [
        '/health',
        '/api/status',
        '/api/lm-studio/health',
        '/api/ai/chat',
        '/api/stats/usage',
        '/api/data/:type',
      ],
    });
  } else {
    // For non-API routes, this shouldn't be reached if dist folder exists
    // But handle it gracefully
    res.status(404).json({
      error: 'Not Found',
      path: req.path,
      message: 'Route not found',
    });
  }
});

// ==================== Server Startup ====================
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`
╔════════════════════════════════════════════════════════╗
║   🚀 DLX Studios Ultimate - Production Server         ║
╚════════════════════════════════════════════════════════╝

📍 Server:     http://localhost:${PORT} (Default: 3001)
🤖 LM Studio:   ${LM_STUDIO_URL}
🌉 LuxRig:      Active
🌍 Environment: ${NODE_ENV}
📦 Version:     1.0.0

✅ Server ready!
   Open http://localhost:${PORT} in your browser
  `);
}).on('error', (err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

// Graceful shutdown
const shutdown = (signal) => {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Windows-specific handling
if (process.platform === 'win32') {
  // Handle Windows service stop
  process.on('SIGBREAK', () => shutdown('SIGBREAK'));
}

export default app;

