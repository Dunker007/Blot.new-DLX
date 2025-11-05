# 🚀 DLX Studios Ultimate - LuxRig Deployment Guide

Complete guide for deploying DLX Studios Ultimate on your LuxRig Windows 11 home server.

## 📋 Prerequisites

- Windows 11
- Node.js 18+ installed
- LM Studio running on `http://localhost:1234`
- Administrator access (for Windows Service installation)

## 🚀 Quick Start

### 1. Install Dependencies

```powershell
cd "C:\Repos GIT\DLX-Studios-Ultimate"
npm install
```

### 2. Build Frontend

```powershell
npm run build
```

### 3. Start Server

**Option A: Direct Start (Development)**
```powershell
npm start
```

**Option B: Production Mode**
```powershell
npm run start:prod
```

**Option C: Using Windows Batch Script**
```powershell
.\scripts\start-server.bat
```

The server will start on `http://localhost:3001`

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
PORT=3001
LM_STUDIO_URL=http://localhost:1234
NODE_ENV=production
```

### LM Studio Setup

1. Start LM Studio
2. Load at least one model
3. Enable local server (default: `http://localhost:1234`)
4. Verify: `http://localhost:1234/v1/models`

## 🪟 Windows Service Installation

### Method 1: Using NSSM (Recommended)

1. Install NSSM:
   ```powershell
   choco install nssm
   # OR download from https://nssm.cc/download
   ```

2. Install service:
   ```powershell
   cd scripts
   PowerShell -ExecutionPolicy Bypass -File install-windows-service.ps1
   ```

3. Start service:
   ```powershell
   nssm start DLXStudiosUltimate
   ```

### Method 2: Using PM2 (Node.js Process Manager)

1. Install PM2:
   ```powershell
   npm install -g pm2
   ```

2. Start application:
   ```powershell
   pm2 start server.js --name dlx-studios
   ```

3. Setup auto-start:
   ```powershell
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

## 📊 Monitoring

### Health Check

```powershell
# Check server health
curl http://localhost:3001/health

# Check LM Studio connection
curl http://localhost:3001/api/lm-studio/health

# View usage statistics
curl http://localhost:3001/api/stats/usage
```

### Logs

**PM2:**
```powershell
pm2 logs dlx-studios
```

**NSSM:**
```powershell
nssm start DLXStudiosUltimate
# Logs are in: C:\nssm\logs\
```

**Direct:**
Logs are output to console/stdout

## 🔒 Firewall Configuration

Allow incoming connections on port 3001:

```powershell
New-NetFirewallRule -DisplayName "DLX Studios Ultimate" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```

## 🌐 Network Access

### Local Network Access

The server binds to `0.0.0.0`, so it's accessible from other devices on your network:

- Find LuxRig's IP: `ipconfig`
- Access from other devices: `http://LUXRIG_IP:3001`

### External Access (Optional)

For external access, configure port forwarding on your router:

1. Forward external port (e.g., 8080) to LuxRig:3000
2. Access via: `http://your-public-ip:8080`

**⚠️ Security Warning:** Expose only if you have proper security measures (HTTPS, authentication, etc.)

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

## 📦 Production Optimizations

### Performance Tuning

1. **Node.js Memory:**
   ```powershell
   $env:NODE_OPTIONS="--max-old-space-size=4096"
   node server.js
   ```

2. **PM2 Clustering:**
   ```powershell
   pm2 start server.js -i max --name dlx-studios
   ```

3. **Process Priority:**
   ```powershell
   # In Task Manager: Set priority to "High"
   ```

### Resource Monitoring

Monitor CPU, Memory, and Network usage:

```powershell
# PM2 Monitoring
pm2 monit

# Windows Performance Monitor
perfmon
```

## 🔐 Security Best Practices

1. **Firewall:** Only expose necessary ports
2. **Updates:** Keep Node.js and dependencies updated
3. **Environment:** Never commit `.env` file
4. **HTTPS:** Use reverse proxy (nginx) for HTTPS in production
5. **Authentication:** Add authentication for external access

## 📚 Additional Resources

- [LM Studio Documentation](https://lmstudio.ai/docs)
- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)

## ✅ Verification Checklist

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] Frontend built (`npm run build`)
- [ ] LM Studio running on port 1234
- [ ] Server starts successfully
- [ ] Health check returns 200 OK
- [ ] LM Studio health check passes
- [ ] Can access UI at `http://localhost:3001`
- [ ] Windows Service installed (optional)
- [ ] Firewall configured (if needed)

---

**Ready to deploy!** 🚀

For issues or questions, check the logs and verify each step above.

