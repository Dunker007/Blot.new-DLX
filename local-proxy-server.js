#!/usr/bin/env node

const http = require('http');
const https = require('https');
const { URL } = require('url');

const PORT = process.env.PROXY_PORT || 8000;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info',
  'Access-Control-Max-Age': '86400',
};

const LOCAL_PROVIDERS = [
  { name: 'LM Studio', port: 1234, path: '/v1' },
  { name: 'Ollama', port: 11434, path: '/api' },
];

console.log('🚀 DLX Studios Hybrid Bridge Server');
console.log('=====================================');
console.log(`Listening on: http://localhost:${PORT}`);
console.log('');
console.log('Supported local providers:');
LOCAL_PROVIDERS.forEach(p => {
  console.log(`  • ${p.name}: http://localhost:${p.port}${p.path}`);
});
console.log('');

function detectProvider(targetPort) {
  const provider = LOCAL_PROVIDERS.find(p => p.port === targetPort);
  return provider || { name: 'Unknown', port: targetPort, path: '/v1' };
}

function proxyRequest(req, res, targetUrl) {
  const parsedUrl = new URL(targetUrl);
  const protocol = parsedUrl.protocol === 'https:' ? https : http;

  const proxyReq = protocol.request({
    hostname: parsedUrl.hostname,
    port: parsedUrl.port,
    path: parsedUrl.pathname + parsedUrl.search,
    method: req.method,
    headers: {
      ...req.headers,
      host: parsedUrl.host,
    },
  }, (proxyRes) => {
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (error) => {
    console.error(`❌ Proxy error: ${error.message}`);
    res.writeHead(502, {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    });
    res.end(JSON.stringify({
      error: 'Local provider not available',
      message: error.message,
    }));
  });

  req.pipe(proxyReq);
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, CORS_HEADERS);
    res.end();
    return;
  }

  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    });
    res.end(JSON.stringify({
      status: 'healthy',
      server: 'DLX Studios Hybrid Bridge',
      version: '1.0.0',
      providers: LOCAL_PROVIDERS.map(p => ({
        name: p.name,
        endpoint: `http://localhost:${p.port}${p.path}`,
      })),
    }));
    return;
  }

  if (req.url === '/providers') {
    Promise.all(
      LOCAL_PROVIDERS.map(async (provider) => {
        try {
          const testUrl = `http://localhost:${provider.port}${provider.path}/models`;
          const startTime = Date.now();

          return await new Promise((resolve) => {
            const testReq = http.get(testUrl, { timeout: 2000 }, (testRes) => {
              const latency = Date.now() - startTime;
              resolve({
                name: provider.name,
                endpoint: `http://localhost:${provider.port}${provider.path}`,
                status: testRes.statusCode === 200 ? 'connected' : 'error',
                latency,
              });
            });

            testReq.on('error', () => {
              resolve({
                name: provider.name,
                endpoint: `http://localhost:${provider.port}${provider.path}`,
                status: 'disconnected',
              });
            });
          });
        } catch {
          return {
            name: provider.name,
            endpoint: `http://localhost:${provider.port}${provider.path}`,
            status: 'error',
          };
        }
      })
    ).then((results) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
      });
      res.end(JSON.stringify({ providers: results }));
    });
    return;
  }

  const urlMatch = req.url.match(/^\/proxy\/(\d+)(\/.*)?$/);

  if (!urlMatch) {
    res.writeHead(404, {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    });
    res.end(JSON.stringify({
      error: 'Not Found',
      usage: 'Use /proxy/{port}/path to proxy to local providers',
      example: '/proxy/1234/v1/chat/completions',
    }));
    return;
  }

  const targetPort = parseInt(urlMatch[1]);
  const targetPath = urlMatch[2] || '/';
  const provider = detectProvider(targetPort);

  const targetUrl = `http://localhost:${targetPort}${targetPath}`;

  console.log(`🔄 ${req.method} ${targetUrl} (${provider.name})`);

  proxyRequest(req, res, targetUrl);
});

server.listen(PORT, () => {
  console.log('✅ Server ready!');
  console.log('');
  console.log('Usage from bolt.new:');
  console.log(`  fetch('http://localhost:${PORT}/proxy/1234/v1/chat/completions', { ... })`);
  console.log('');
  console.log('Test connection:');
  console.log(`  curl http://localhost:${PORT}/providers`);
  console.log('');
});

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});
