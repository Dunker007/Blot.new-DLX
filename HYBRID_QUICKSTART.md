# Hybrid Mode Quick Start

## 🚀 5-Minute Setup

Want to use **bolt.new's interface** with **your local AI models**? Here's how:

### 1. Start Your Local AI

Pick one:

```bash
# Option A: LM Studio
# Download from lmstudio.ai, start local server on port 1234

# Option B: Ollama
ollama serve  # Runs on port 11434
```

### 2. Start the Proxy Bridge

In your DLX Studios folder:

```bash
npm run hybrid
```

You'll see:
```
🚀 DLX Studios Hybrid Bridge Server
✅ Server ready!
```

### 3. Enable in UI

Go to **Settings → Environment → Hybrid Mode** and toggle ON.

## ✅ That's It!

Now when you use bolt.new:
- Requests go to YOUR local models
- You pay $0 for AI tokens
- Your code stays on your machine
- Auto-fallback to cloud if local fails

## 🧪 Quick Test

```bash
# Check if it's working
curl http://localhost:8000/providers
```

Should show your providers as "connected" ✓

## 💡 How It Works

```
You type in bolt.new
      ↓
Proxy routes to localhost
      ↓
Your local AI responds
      ↓
Appears in bolt.new
```

## 🎯 Use Cases

- **Development**: $0 tokens while coding
- **Privacy**: Sensitive code never leaves your machine
- **Offline**: Keep working without internet
- **Speed**: Local = faster responses

## 📖 More Info

See [HYBRID_MODE.md](./HYBRID_MODE.md) for complete documentation.

## 🆘 Troubleshooting

**No providers detected?**
1. Is LM Studio/Ollama running?
2. Is the proxy server running?
3. Check: `curl http://localhost:1234/v1/models`

**CORS errors?**
- Make sure you're using the proxy URL
- Proxy server must be running

**Still stuck?**
- Check the full [Hybrid Mode Guide](./HYBRID_MODE.md)
- Review logs in proxy server terminal
