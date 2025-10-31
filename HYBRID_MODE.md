# Hybrid Mode: bolt.new + .diy Integration

## 🎯 What is Hybrid Mode?

Hybrid Mode lets you use **bolt.new's cloud interface** while routing AI requests to your **local providers** (LM Studio, Ollama) running on your machine. You get:

- ✅ bolt.new's beautiful UI and features
- ✅ **$0 cost** for AI tokens (using local models)
- ✅ Full privacy (your code never leaves your machine)
- ✅ Automatic fallback to cloud if local fails
- ✅ No context switching between interfaces

## 🏗️ Architecture

```
┌─────────────────────┐
│   bolt.new (Cloud)  │  ← You work here
│   Browser UI        │
└──────────┬──────────┘
           │ HTTP/Fetch
           ↓
┌─────────────────────┐
│  Local Proxy Server │  ← localhost:8000
│  (CORS Bridge)      │
└──────────┬──────────┘
           │
      ┌────┴─────┐
      ↓          ↓
┌──────────┐  ┌──────────┐
│LM Studio │  │ Ollama   │
│:1234     │  │ :11434   │
└──────────┘  └──────────┘
```

## 🚀 Quick Start

### Step 1: Install Local Provider

Choose one or both:

**Option A: LM Studio**
1. Download from [lmstudio.ai](https://lmstudio.ai)
2. Launch LM Studio
3. Go to Local Server tab
4. Click "Start Server" (default: port 1234)

**Option B: Ollama**
1. Download from [ollama.ai](https://ollama.ai)
2. Install and run: `ollama serve`
3. Default port: 11434

### Step 2: Start the Proxy Server

The proxy server handles CORS and routes requests from bolt.new to your local providers.

```bash
# In your DLX Studios directory
node local-proxy-server.js

# Or specify a custom port
PROXY_PORT=8000 node local-proxy-server.js
```

You should see:
```
🚀 DLX Studios Hybrid Bridge Server
=====================================
Listening on: http://localhost:8000

Supported local providers:
  • LM Studio: http://localhost:1234/v1
  • Ollama: http://localhost:11434/api

✅ Server ready!
```

### Step 3: Enable Hybrid Mode

#### In bolt.new (Cloud):
1. Open DLX Studios on bolt.new
2. Go to **Settings → Environment**
3. Scroll to **"Hybrid Mode"** section
4. Click the toggle to enable

#### In .diy (Local):
1. Open your local DLX Studios
2. Go to **Settings → Environment**
3. Hybrid mode auto-enables when local providers detected

### Step 4: Start Coding!

That's it! Requests now route to your local providers automatically.

## 🔧 Configuration

### Proxy Server Options

```bash
# Custom port
PROXY_PORT=9000 node local-proxy-server.js

# Check server health
curl http://localhost:8000/health

# Check provider status
curl http://localhost:8000/providers
```

### API Usage

The proxy server exposes these endpoints:

```bash
# Health check
GET http://localhost:8000/health

# Provider status
GET http://localhost:8000/providers

# Proxy to LM Studio
POST http://localhost:8000/proxy/1234/v1/chat/completions

# Proxy to Ollama
POST http://localhost:8000/proxy/11434/api/generate
```

## 🧪 Testing Hybrid Mode

### Test 1: Check Proxy Server

```bash
curl http://localhost:8000/providers
```

Should return:
```json
{
  "providers": [
    {
      "name": "LM Studio",
      "endpoint": "http://localhost:1234/v1",
      "status": "connected",
      "latency": 45
    }
  ]
}
```

### Test 2: Send a Test Request

```bash
curl -X POST http://localhost:8000/proxy/1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "local-model",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### Test 3: Check in UI

1. Go to Settings → Environment → Hybrid Mode
2. Should show green "Connected" status
3. Latency should be <100ms for local

## 🔍 How It Works

### 1. **Auto-Detection**

The hybrid bridge automatically checks for:
- LM Studio at `localhost:1234`
- Ollama at `localhost:11434`
- Custom endpoints you configure

### 2. **Smart Routing**

When you send a prompt:
1. Check if hybrid mode is enabled
2. Check if local providers are available
3. Route to fastest available local provider
4. Fallback to cloud if local fails

### 3. **CORS Handling**

The proxy server adds proper CORS headers so bolt.new can communicate with localhost:

```javascript
'Access-Control-Allow-Origin': '*'
'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
'Access-Control-Allow-Headers': 'Content-Type, Authorization'
```

## 💡 Use Cases

### Use Case 1: Zero-Cost Development

```
Scenario: You're prototyping a new feature
Solution: Use hybrid mode with local models
Result: $0 spent on AI tokens
```

### Use Case 2: Privacy-Sensitive Code

```
Scenario: Working on proprietary/sensitive code
Solution: Route to local providers
Result: Code never leaves your machine
```

### Use Case 3: Offline Development

```
Scenario: No internet or rate limits
Solution: Use local models exclusively
Result: Keep coding without interruption
```

### Use Case 4: Cost Optimization

```
Scenario: Heavy AI usage for repetitive tasks
Solution: Local for routine, cloud for complex
Result: Optimal cost/performance balance
```

## 🐛 Troubleshooting

### Issue: "No local providers detected"

**Solutions:**
1. Make sure LM Studio or Ollama is running
2. Check if server is on correct port (1234 or 11434)
3. Verify proxy server is running
4. Check firewall isn't blocking localhost connections

```bash
# Test LM Studio directly
curl http://localhost:1234/v1/models

# Test Ollama directly
curl http://localhost:11434/api/tags
```

### Issue: "CORS error in console"

**Solutions:**
1. Make sure proxy server is running
2. Use proxy URL, not direct provider URL
3. Check browser console for specific error

### Issue: "Requests timing out"

**Solutions:**
1. Check provider is responding:
   ```bash
   curl http://localhost:8000/providers
   ```
2. Increase timeout in hybrid bridge settings
3. Check if model is loaded in LM Studio

### Issue: "Proxy server won't start"

**Solutions:**
1. Check if port 8000 is already in use:
   ```bash
   lsof -i :8000  # macOS/Linux
   netstat -ano | findstr :8000  # Windows
   ```
2. Use different port:
   ```bash
   PROXY_PORT=9000 node local-proxy-server.js
   ```
3. Check Node.js is installed: `node --version`

## 📊 Performance Tips

### Latency Optimization

Local providers should have <100ms latency:
- ✅ Good: 10-50ms
- ⚠️ Okay: 50-100ms
- ❌ Slow: >100ms (check system resources)

### Model Selection

Choose model size based on task:
- **7B models**: Fast, good for simple tasks
- **13B models**: Balanced performance
- **70B+ models**: Slower, best quality

### System Requirements

For smooth hybrid mode:
- **RAM**: 16GB minimum (32GB recommended)
- **GPU**: Recommended for speed (not required)
- **CPU**: Modern multi-core processor

## 🔐 Security Considerations

### Local Only

- Proxy server only accepts connections from localhost
- No external network access required
- Data stays on your machine

### Cloud Fallback

When falling back to cloud:
- Standard HTTPS encryption
- Cloud provider's security policies apply
- Consider data sensitivity before fallback

## 🎓 Advanced Usage

### Custom Endpoints

Add custom providers in code:

```typescript
await hybridBridge.initialize([
  'http://localhost:1234',
  'http://192.168.1.100:1234',  // Another machine on LAN
  'http://localhost:5000',       // Custom provider
]);
```

### Load Balancing

Route different tasks to different providers:
- Simple tasks → Smaller local models
- Complex tasks → Larger models or cloud
- Code generation → Specialized coding models

### Monitoring

Check hybrid mode status programmatically:

```typescript
const status = hybridBridge.getStatus();
console.log(`Connected providers: ${status.connectedProviders}`);
console.log(`Should use local: ${hybridBridge.shouldUseLocal()}`);
```

## 📚 Additional Resources

- [LM Studio Documentation](https://lmstudio.ai/docs)
- [Ollama Documentation](https://ollama.ai/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [DLX Studios Main README](./README.md)

## 🆘 Need Help?

- Check the [main documentation](./README.md)
- Review [deployment guide](./DEPLOYMENT.md)
- Open an issue on GitHub
- Join our Discord community

---

**Pro Tip:** Keep the proxy server running in a separate terminal window. It automatically reconnects to providers and handles all the complexity for you!
