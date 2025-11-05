#!/usr/bin/env node

/**
 * LuxRig Bridge Server
 * 
 * Secure proxy between DLX Studios frontend and local LM Studio
 * Handles AI task routing, cost optimization, and security
 */

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.LUXRIG_PORT || 3002;
const LM_STUDIO_URL = 'http://localhost:1234';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow frontend connections
}));

// Rate limiting - prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// CORS for local development
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3001'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    luxrig: 'online'
  });
});

// LM Studio availability check
app.get('/api/lm-studio/health', async (req, res) => {
  try {
    const response = await fetch(`${LM_STUDIO_URL}/v1/models`);
    const models = await response.json();
    
    res.json({
      available: true,
      models: models.data?.length || 0,
      endpoint: LM_STUDIO_URL
    });
  } catch (error) {
    res.status(503).json({
      available: false,
      error: error.message
    });
  }
});

// Task complexity analyzer for routing decisions
function analyzeTaskComplexity(prompt) {
  const complexKeywords = [
    'analyze', 'complex', 'detailed', 'comprehensive', 'research',
    'strategy', 'business plan', 'architecture', 'design patterns'
  ];
  
  const simpleKeywords = [
    'hello', 'test', 'simple', 'quick', 'comment', 'explain',
    'summary', 'list', 'format', 'fix typo'
  ];
  
  const lowerPrompt = prompt.toLowerCase();
  const complexScore = complexKeywords.filter(word => lowerPrompt.includes(word)).length;
  const simpleScore = simpleKeywords.filter(word => lowerPrompt.includes(word)).length;
  
  if (simpleScore > complexScore) return 'simple';
  if (complexScore > 2) return 'complex';
  if (prompt.length > 500) return 'complex';
  
  return 'medium';
}

// AI task routing endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, model, max_tokens = 150, temperature = 0.7 } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }
    
    // Analyze task complexity for routing
    const lastMessage = messages[messages.length - 1];
    const complexity = analyzeTaskComplexity(lastMessage.content || '');
    
    console.log(`📊 Task Complexity: ${complexity} | Length: ${lastMessage.content?.length || 0}`);
    
    // Route to LM Studio for simple/medium tasks
    if (complexity === 'simple' || complexity === 'medium') {
      console.log('🏠 Routing to LuxRig LM Studio');
      
      const response = await fetch(`${LM_STUDIO_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model || 'qwen3-4b-claude-sonnet-4-reasoning-distill-safetensor', // Use first available model
          messages,
          max_tokens,
          temperature,
          stream: false
        })
      });
      
      if (!response.ok) {
        throw new Error(`LM Studio error: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Add routing metadata
      result.luxrig_metadata = {
        routed_to: 'local',
        complexity,
        cost_savings: 'estimated $0.02',
        response_time: Date.now()
      };
      
      return res.json(result);
    }
    
    // For complex tasks, return instructions to use cloud API
    res.json({
      choices: [{
        message: {
          role: 'assistant',
          content: `This looks like a complex task. For best results, this should be routed to a cloud AI provider. Task complexity: ${complexity}`
        }
      }],
      luxrig_metadata: {
        routed_to: 'cloud_recommended',
        complexity,
        reason: 'Task too complex for local processing'
      }
    });
    
  } catch (error) {
    console.error('❌ AI Chat Error:', error);
    res.status(500).json({
      error: 'AI processing failed',
      details: error.message,
      fallback: 'Try cloud provider'
    });
  }
});

// Usage statistics endpoint
app.get('/api/stats/usage', (req, res) => {
  // Mock usage stats - in production, this would come from a database
  res.json({
    total_requests: 42,
    local_requests: 28,
    cloud_requests: 14,
    cost_savings: '$5.60',
    avg_response_time: '1.2s',
    uptime: process.uptime(),
    last_updated: new Date().toISOString()
  });
});

// Proxy for direct LM Studio access (development only)
app.use('/lm-studio', createProxyMiddleware({
  target: LM_STUDIO_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/lm-studio': '', // Remove /lm-studio prefix
  },
  onError: (err, req, res) => {
    console.error('❌ Proxy Error:', err);
    res.status(503).json({
      error: 'LM Studio unavailable',
      message: 'Local AI service is not responding'
    });
  }
}));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'LuxRig bridge encountered an error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    available_endpoints: [
      '/health',
      '/api/lm-studio/health',
      '/api/ai/chat',
      '/api/stats/usage'
    ]
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 LuxRig Bridge Server Started
📍 Port: ${PORT}
🤖 LM Studio: ${LM_STUDIO_URL}
🔒 Security: Enabled
⚡ Ready for AI task routing!
  `);
}).on('error', (err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 LuxRig Bridge Server shutting down gracefully...');
  process.exit(0);
});