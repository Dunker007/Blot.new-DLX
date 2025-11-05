# ✅ DLX Studios Ultimate - Deployment Checklist

Complete checklist to get `dlxstudios.ai` live and operational.

---

## 🎯 Pre-Deployment (Complete These First)

### ✅ Code Complete
- [x] Error boundaries integrated
- [x] LuxRig Settings panel
- [x] DNS Manager (Spaceship API)
- [x] Production deployment scripts
- [x] All documentation

### 📦 Build & Test

**Step 1: Test Production Build**
```powershell
cd "C:\Repos GIT\DLX-Studios-Ultimate"
npm run build
npm run start:prod
```

**Verify:**
- [ ] Build completes without errors
- [ ] Server starts on port 3001
- [ ] Can access `http://localhost:3001`
- [ ] All navigation routes work
- [ ] Settings → DNS Manager loads
- [ ] Settings → LuxRig panel works
- [ ] No console errors

---

## 🔑 Configuration

### Step 2: Get API Credentials

**Spaceship API (for DNS management):**
1. Go to: https://www.spaceship.com/application/api-manager/
2. Click "New API key"
3. Set permissions:
   - ✅ `dnsrecords:read`
   - ✅ `dnsrecords:write`
   - ✅ `domains:read`
4. Copy API Key and API Secret

**Gemini API (for AI features):**
- Already configured? ✅ Check Settings → Gemini API
- Need key? Get from: https://aistudio.google.com/app/apikey

### Step 3: Configure in App

1. **Start server:**
   ```powershell
   npm run start:prod
   ```

2. **Configure DNS Manager:**
   - Go to Settings → DNS Manager
   - Enter Spaceship API Key and Secret
   - Click "Save Credentials"
   - Verify connection works

3. **Verify LuxRig Settings:**
   - Go to Settings → LuxRig
   - Check server status
   - Verify LM Studio connection

---

## 🌐 DNS Configuration

### Step 4: Get Your Public IP

**Option A: Use DNS Manager**
- Go to Settings → DNS Manager
- Click the network icon next to IP field
- This auto-detects your public IP

**Option B: Manual**
```powershell
(Invoke-WebRequest -Uri "https://api.ipify.org?format=json").Content
```

### Step 5: Update DNS via UI

**Using DNS Manager (Recommended):**
1. Go to Settings → DNS Manager
2. Click "Refresh" to see current records
3. Enter your public IP in the "Update A Record" field
4. Click "Update DNS Record"
5. Wait for confirmation

**Or Manual (Spaceship Dashboard):**
1. Go to: https://spaceship.com/application/advanced-dns-application/manage/dlxstudios.ai/
2. Edit A record for `@`:
   - **Value:** Your public IP
   - **TTL:** Change to `300` (5 minutes)
3. Save

---

## 🔧 Server Setup

### Step 6: Run Production Setup

```powershell
# Run as Administrator
.\scripts\setup-production.ps1 -InstallService -ConfigureFirewall -CreateLogsDir
```

**This will:**
- ✅ Install dependencies
- ✅ Build frontend
- ✅ Configure firewall (port 3001)
- ✅ Install Windows service
- ✅ Create logs directory
- ✅ Setup environment file

**Verify:**
- [ ] Script completes successfully
- [ ] Service installed (check with `nssm status DLXStudiosUltimate` or `pm2 list`)
- [ ] Firewall rule added

### Step 7: Configure Environment

Edit `.env` file (created by setup script):

```env
PORT=3001
NODE_ENV=production
LM_STUDIO_URL=http://localhost:1234
GEMINI_API_KEY=your_actual_key_here
```

---

## 🚀 Router Configuration

### Step 8: Port Forwarding

**Log into Router Admin:**
- Usually `192.168.1.1` or `192.168.0.1`

**Add Port Forwarding Rules:**

| External Port | Protocol | Internal IP | Internal Port | Description |
|--------------|----------|-------------|---------------|-------------|
| 80 | TCP | LuxRig IP | 3001 | HTTP |
| 443 | TCP | LuxRig IP | 3001 | HTTPS (if using) |

**Or use custom ports** (e.g., 8080) and update DNS accordingly.

**Verify:**
- [ ] Port forwarding rules saved
- [ ] Router rebooted (if required)

---

## ✅ Testing

### Step 9: Test Locally

```powershell
# Test server health
curl http://localhost:3001/health

# Test LM Studio connection
curl http://localhost:3001/api/lm-studio/health

# Test in browser
start http://localhost:3001
```

**Check:**
- [ ] Health endpoint returns 200 OK
- [ ] Site loads correctly
- [ ] All features work
- [ ] DNS Manager connects to Spaceship API

### Step 10: Test DNS Propagation

**After updating DNS, wait 5-15 minutes, then:**

```powershell
# Check DNS propagation
nslookup dlxstudios.ai

# Or use online tool
start https://www.whatsmydns.net/#A/dlxstudios.ai
```

**Verify:**
- [ ] DNS resolves to your public IP
- [ ] Multiple DNS servers show correct IP

### Step 11: Test External Access

**From different network (mobile hotspot or different device):**

```powershell
# Test domain
curl http://dlxstudios.ai/health

# Or visit in browser
start http://dlxstudios.ai
```

**Check:**
- [ ] Domain resolves correctly
- [ ] Site loads
- [ ] All features work
- [ ] SSL/HTTPS works (if configured)

---

## 🔒 SSL/HTTPS Setup (Optional but Recommended)

### Option 1: Cloudflare (Easiest)

1. Add domain to Cloudflare
2. Change nameservers in Spaceship to Cloudflare
3. Enable "Full" SSL mode
4. Automatic HTTPS!

### Option 2: Let's Encrypt

```powershell
choco install certbot
certbot certonly --standalone -d dlxstudios.ai -d www.dlxstudios.ai
```

Then update server.js to use HTTPS certificates.

---

## 📊 Monitoring

### Step 12: Setup Monitoring

**Service Status:**
```powershell
# Check service status
nssm status DLXStudiosUltimate
# OR
pm2 status

# View logs
nssm get DLXStudiosUltimate AppStdout
# OR
pm2 logs dlx-studios
```

**Health Checks:**
- [ ] Server responds to health checks
- [ ] Logs show no errors
- [ ] Service auto-starts on boot

---

## 🎉 Go Live Checklist

Before going live, verify:

- [ ] Production build tested and working
- [ ] All API credentials configured
- [ ] DNS Manager working (can update records)
- [ ] DNS A record points to correct IP
- [ ] Port forwarding configured
- [ ] Firewall allows port 3001
- [ ] Windows service installed and running
- [ ] Service auto-starts on boot
- [ ] Health checks pass
- [ ] Can access from external network
- [ ] SSL/HTTPS configured (if using)
- [ ] Logs directory created
- [ ] Monitoring setup

---

## 🆘 Troubleshooting

### DNS Not Working
- Check DNS propagation: https://www.whatsmydns.net
- Verify A record matches public IP
- Check TTL (wait for propagation)

### Can't Access from External Network
- Verify port forwarding configured correctly
- Check firewall allows port 3001
- Test from mobile hotspot (different network)
- Verify public IP is correct

### Service Won't Start
- Check logs for errors
- Verify Node.js version (`node --version`)
- Check if port 3001 is in use: `netstat -ano | findstr :3001`
- Verify `.env` file exists and is configured

### DNS Manager Not Working
- Verify Spaceship API credentials are correct
- Check API permissions (dnsrecords:read, dnsrecords:write)
- Check browser console for errors
- Verify network connectivity

---

## 📚 Quick Reference

**Start Server:**
```powershell
npm run start:prod
# OR
nssm start DLXStudiosUltimate
# OR
pm2 start dlx-studios
```

**Check Status:**
```powershell
curl http://localhost:3001/health
curl http://dlxstudios.ai/health
```

**Update DNS:**
- Settings → DNS Manager → Update A Record

**View Logs:**
```powershell
pm2 logs dlx-studios
# OR check logs/ directory
```

---

**Ready to deploy?** Work through each step systematically! 🚀

