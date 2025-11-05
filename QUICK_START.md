# ⚡ DLX Studios Ultimate - Quick Start

**Get up and running in 5 minutes!**

---

## 🚀 Fastest Path to Live

### 1. Build & Start (2 minutes)

```powershell
cd "C:\Repos GIT\DLX-Studios-Ultimate"
npm run build
npm run start:prod
```

Visit: `http://localhost:3001`

### 2. Configure DNS (2 minutes)

**Get Spaceship API Key:**
- https://www.spaceship.com/application/api-manager/
- Create key with `dnsrecords:read` and `dnsrecords:write`

**In DLX Studios:**
- Settings → DNS Manager
- Enter API credentials
- Click network icon (auto-detect IP)
- Click "Update DNS Record"

### 3. Configure Router (1 minute)

- Port forward: `80` → LuxRig IP → `3001`
- Port forward: `443` → LuxRig IP → `3001`

### 4. Test (1 minute)

Wait 5-15 minutes, then visit: `http://dlxstudios.ai`

---

## 🎯 One-Command Deploy

```powershell
# As Administrator
.\scripts\quick-deploy.ps1
```

This does everything automatically!

---

## 📋 What You Get

✅ **11 Specialized Labs** - AI-powered tools  
✅ **Revenue Features** - Business Generator, Affiliate Factory  
✅ **DNS Automation** - Manage DNS from UI  
✅ **LuxRig Integration** - Server monitoring  
✅ **Production Ready** - Error handling, optimization  

---

## 🆘 Need Help?

- **Full Guide:** `DEPLOYMENT_CHECKLIST.md`
- **DNS Setup:** `DOMAIN_SETUP.md`
- **Troubleshooting:** `TROUBLESHOOTING.md`

---

**Ready?** Run `npm run build && npm run start:prod` and you're live! 🚀

