# 🚀 DLX Studios Ultimate - Deployment Guide

Complete guide for deploying DLX Studios Ultimate on LuxRig (Windows 11 home server).

---

## 📋 Prerequisites

- Windows 11
- Node.js 18+ installed
- Administrator access (for service installation)
- LM Studio running (optional, for local LLM)

---

## 🚀 Quick Deployment

### Option 1: Automated Setup (Recommended)

```powershell
# Run as Administrator
.\scripts\setup-production.ps1 -InstallService -ConfigureFirewall -CreateLogsDir
```

This script will:
- ✅ Install dependencies
- ✅ Build frontend
- ✅ Configure firewall
- ✅ Install Windows service
- ✅ Create logs directory
- ✅ Setup environment file

### Option 2: Manual Setup

```powershell
# 1. Install dependencies
npm install

# 2. Build frontend
npm run build

# 3. Configure environment
Copy .env.example to .env and edit

# 4. Start server
npm run start:prod
```

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file from `.env.example`:

```env
PORT=3001
NODE_ENV=production
LM_STUDIO_URL=http://localhost:1234
GEMINI_API_KEY=your_key_here
```

### Server Configuration

The server automatically:
- Serves static files from `dist/`
- Routes API requests to `/api/*`
- Provides health checks at `/health`
- Proxies LM Studio requests

---

## 🪟 Windows Service Installation

### Method 1: NSSM (Recommended)

```powershell
# Install NSSM
choco install nssm

# Install service
.\scripts\install-windows-service.ps1

# Start service
nssm start DLXStudiosUltimate
```

### Method 2: PM2

```powershell
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name dlx-studios

# Setup auto-start
pm2 startup
pm2 save
```

### Method 3: Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Trigger: "When the computer starts"
4. Action: Start a program
5. Program: `C:\Program Files\nodejs\node.exe`
6. Arguments: `C:\Repos GIT\DLX-Studios-Ultimate\server.js`
7. Start in: `C:\Repos GIT\DLX-Studios-Ultimate`

---

## 🔥 Firewall Configuration

Allow incoming connections on port 3001:

```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "DLX Studios Ultimate" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```

Or use the setup script:

```powershell
.\scripts\setup-production.ps1 -ConfigureFirewall
```

---

## 🌐 Network Access

### Local Network Access

The server binds to `0.0.0.0`, accessible from other devices:

1. Find LuxRig's IP: `ipconfig`
2. Access from other devices: `http://LUXRIG_IP:3001`

### External Access (Optional)

For external access:

1. Configure port forwarding on router
2. Forward external port → LuxRig:3001
3. Access via: `http://your-public-ip:port`

**⚠️ Security Warning:** Only expose if you have proper security (HTTPS, authentication).

---

## 📊 Monitoring

### Health Checks

```powershell
# Server health
curl http://localhost:3001/health

# LM Studio connection
curl http://localhost:3001/api/lm-studio/health

# Usage statistics
curl http://localhost:3001/api/stats/usage
```

### Logs

**PM2:**
```powershell
pm2 logs dlx-studios
```

**NSSM:**
Logs are in: `C:\nssm\logs\`

**Direct:**
Logs output to console/stdout

---

## 🔄 Updates

### Update Application

```powershell
# Pull latest changes
git pull

# Rebuild
npm run build

# Restart service
pm2 restart dlx-studios
# OR
nssm restart DLXStudiosUltimate
```

---

## 🐛 Troubleshooting

### Server Won't Start

1. Check if port 3001 is in use:
   ```powershell
   netstat -ano | findstr :3001
   ```

2. Check Node.js version:
   ```powershell
   node --version
   ```

3. Check logs for errors

### LM Studio Not Connecting

1. Verify LM Studio is running:
   ```powershell
   curl http://localhost:1234/v1/models
   ```

2. Check LM Studio server settings
3. Verify firewall isn't blocking

### Frontend Not Loading

1. Ensure build completed:
   ```powershell
   dir dist
   ```

2. Rebuild if needed:
   ```powershell
   npm run build
   ```

---

## ✅ Verification Checklist

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] Frontend built (`npm run build`)
- [ ] `.env` file configured
- [ ] Server starts successfully
- [ ] Health check returns 200 OK
- [ ] LM Studio health check passes (if using)
- [ ] Can access UI at `http://localhost:3001`
- [ ] Windows Service installed (optional)
- [ ] Firewall configured (if needed)
- [ ] Local network access working (optional)

---

## 📚 Additional Resources

- [LM Studio Documentation](https://lmstudio.ai/docs)
- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [NSSM Documentation](https://nssm.cc/usage)

---

**Ready to deploy!** 🚀

For issues or questions, check the logs and verify each step above.

