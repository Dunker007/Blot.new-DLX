# Hybrid Cloud Quick Start

## 🚀 5-Minute Setup

Get seamless **.diy + bolt.new sync**, **cloud backups**, and **multi-environment deployment**!

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

Now you have:
- ⚡ Requests go to YOUR local models
- 💰 Pay $0 for AI tokens
- 🔒 Code stays on your machine
- ☁️ Auto-fallback to cloud if local fails
- 🔄 Automatic project synchronization
- 💾 Cloud backup & restore
- 🚀 Multi-environment deployment

## 🧪 Quick Test

### Test 1: Local Connection
```bash
curl http://localhost:8000/providers
```
Should show: "connected" ✓

### Test 2: Sync Projects
1. Go to **Hybrid Mode Panel**
2. Click **Bi-Sync ⇄** button
3. Should show: "✓ Sync Complete!"

### Test 3: Discover Models
1. Go to **Settings → Providers & Models**
2. Click lightning bolt **⚡** icon
3. Should show: List of available models

## 🔄 Daily Workflow

### Morning
```
1. Start LM Studio/Ollama
2. npm run hybrid
3. Open DLX Studios
4. Click Bi-Sync ⇄
5. Start working!
```

### Evening
```
1. Click Bi-Sync ⇄
2. Verify "Sync Complete!"
3. Close everything
```

## 💡 How It Works

### Hybrid AI Routing
```
You type in bolt.new
      ↓
Proxy routes to localhost
      ↓
Your local AI responds
      ↓
Appears in bolt.new
```

### Project Synchronization
```
Local Changes ⇄ Cloud Storage
      ↓
Automatic Conflict Detection
      ↓
Smart Merge or Manual Resolution
      ↓
Always in Sync!
```

## 🎯 Key Features

### Project Sync
- **Upload ↑**: Push local changes to cloud
- **Download ↓**: Pull cloud changes to local
- **Bi-Sync ⇄**: Sync both directions automatically

### Cloud Backups
- Automatic snapshots before major operations
- One-click restore to any point in time
- Backup history with metadata

### Multi-Environment Deploy
- Local Development
- Development Server
- Staging
- Production

### Conflict Resolution
- Automatic detection
- Smart merging
- Manual resolution options

## 📖 More Info

- **Complete Guide**: [HYBRID_CLOUD_INTEGRATION.md](./HYBRID_CLOUD_INTEGRATION.md)
- **Original Hybrid Mode**: [HYBRID_MODE.md](./HYBRID_MODE.md)
- **AI Features**: [AI_FEATURES.md](./AI_FEATURES.md)

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
