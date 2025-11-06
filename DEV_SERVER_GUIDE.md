# 🚀 Using the Dev Server

## ✅ Current Status

**Dev Server:** ✅ Working on `http://localhost:5173`  
**Production Server:** ⚠️ Needs troubleshooting (but not required for now)

---

## 🌐 Access Your Site

**URL:** http://localhost:5173

The dev server:
- ✅ Works perfectly for development and testing
- ✅ Hot reload (changes update automatically)
- ✅ Better error messages in browser console
- ✅ Easier debugging

---

## 📋 Next Steps

### 1. Test DNS Manager

1. Open: http://localhost:5173
2. Navigate to: **Settings → DNS Manager**
3. Your Spaceship API credentials should already be loaded (from localStorage)
4. Click **"Refresh"** to test the connection
5. If successful, you'll see your DNS records for `dlxstudios.ai`

### 2. Update DNS A Record

1. Get your public IP:
   - Click the network icon in DNS Manager (auto-detects)
   - OR run: `.\scripts\get-public-ip.ps1`
2. Enter your IP in the "Update A Record" field
3. Click **"Update DNS Record"**
4. Wait for confirmation

### 3. Configure Router

- Port forward: `80` → LuxRig IP → `5173` (or use 3001 once production server is fixed)
- Port forward: `443` → LuxRig IP → `5173`

---

## 🔧 Production Server (Later)

The production server (`npm run start:prod`) had issues, but:
- ✅ Dev server works perfectly for now
- ✅ You can test all features
- ✅ DNS Manager works the same way
- ⏭️ We'll fix production server later for deployment

---

## 💡 Dev Server Commands

**Start:**
```powershell
npm run dev
```

**Stop:**
- Press `Ctrl + C` in the terminal where it's running

**Restart:**
- Stop and start again

---

## 🎯 Current Focus

1. ✅ Site is working (dev server)
2. ✅ Brand new revenue features added!
3. ⏭️ Test new revenue features
4. ⏭️ Test DNS Manager (Settings → DNS Manager)
5. ⏭️ Update DNS A record
6. ⏭️ Configure router port forwarding
7. ⏭️ Test domain access

---

## 💰 New Revenue Features to Test

### Business Model Generator (Revenue → Business Generator)
- ✅ **Revenue Model Presets**: 4 presets (Content Crusher, Sales Genius, Code Wizard, Market Prophet)
- ✅ **ROI Calculator**: Shows projections per preset
- ✅ **PDF/Word Export**: Export business models for implementation
- ✅ **Dashboard Integration**: Add models to Revenue Streams Dashboard

### Auto-Affiliate Content Factory (Revenue → Affiliate Factory)
- ✅ **Smart Scheduling System**: Batch generation (5-10 articles/night), auto-publish to WordPress/Medium/Substack
- ✅ **Affiliate Link Manager**: Auto-inject tracking codes, A/B test placements, commission tracking
- ✅ **Content Refresh Automator**: Re-runs old articles through AI for updates
- ✅ **Performance Dashboard**: Track clicks, conversions, revenue per article

### Revenue Streams Dashboard (Home → AI Command Center)
- ✅ Real-time passive income tracking
- ✅ Automation health monitoring
- ✅ Opportunity scanner

---

**🚀 Ready to test! Start with the new revenue features!** 💰

