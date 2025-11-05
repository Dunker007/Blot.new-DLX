# 🌐 DLX Studios Ultimate - Domain Setup Guide

Complete guide for configuring `dlxstudios.ai` to point to your LuxRig server.

---

## 📋 Current DNS Configuration

Based on your Spaceship DNS settings:

**Current Records:**
- **A Record:** `@` → `74.208.170.210` (Root domain)
- **CNAME:** `www` → `dlxstudios.ai` (WWW subdomain)

**Nameservers:**
- `launch1.spaceship.net`
- `launch2.spaceship.net`

---

## 🎯 LuxRig Deployment Setup

### Option 1: Point Domain to LuxRig's Public IP

If you want to expose LuxRig directly:

1. **Get LuxRig's Public IP:**
   ```powershell
   # Run on LuxRig
   (Invoke-WebRequest -Uri "https://api.ipify.org").Content
   ```

2. **Update DNS Records in Spaceship:**
   - **A Record:** `@` → `YOUR_PUBLIC_IP` (LuxRig's public IP)
   - **CNAME:** `www` → `dlxstudios.ai` (unchanged)
   - **TTL:** Set to `5 min` or `15 min` (1 min is too aggressive)

3. **Configure Router Port Forwarding:**
   - Forward external port `80` (HTTP) → LuxRig:3001
   - Forward external port `443` (HTTPS) → LuxRig:3001 (if using HTTPS)
   - Or use a custom port (e.g., 8080) and update A record with port in URL

4. **Update Server Configuration:**
   ```env
   # .env file
   PORT=3001
   NODE_ENV=production
   ```

### Option 2: Use Reverse Proxy (Recommended)

For better security and HTTPS:

1. **Set up Nginx/Reverse Proxy:**
   - Install Nginx on LuxRig or use Cloudflare Tunnel
   - Point domain to proxy server
   - Proxy forwards to `localhost:3001`

2. **Cloudflare Tunnel (Easiest):**
   ```powershell
   # Install cloudflared
   winget install Cloudflare.cloudflared
   
   # Create tunnel
   cloudflared tunnel create dlx-studios
   
   # Configure tunnel (creates config file)
   cloudflared tunnel route dns dlx-studios dlxstudios.ai
   ```

3. **Update DNS:**
   - Point `@` A record to Cloudflare IPs (if using Cloudflare DNS)
   - Or use Cloudflare's nameservers

---

## 🔒 HTTPS/SSL Setup

### Option 1: Cloudflare SSL (Easiest)

1. Add domain to Cloudflare
2. Change nameservers to Cloudflare
3. Enable "Full" SSL mode
4. Cloudflare handles SSL automatically

### Option 2: Let's Encrypt (Direct)

```powershell
# Install certbot
choco install certbot

# Generate certificate
certbot certonly --standalone -d dlxstudios.ai -d www.dlxstudios.ai

# Certificates saved to:
# C:\Certbot\live\dlxstudios.ai\fullchain.pem
# C:\Certbot\live\dlxstudios.ai\privkey.pem
```

Update server.js to use HTTPS:
```javascript
import https from 'https';
import fs from 'fs';

const options = {
  key: fs.readFileSync('C:/Certbot/live/dlxstudios.ai/privkey.pem'),
  cert: fs.readFileSync('C:/Certbot/live/dlxstudios.ai/fullchain.pem')
};

https.createServer(options, app).listen(443);
```

---

## 📝 Recommended DNS Records

For LuxRig deployment:

**A Records:**
```
@        A     YOUR_PUBLIC_IP      TTL: 300 (5 min)
www      CNAME dlxstudios.ai       TTL: 300 (5 min)
```

**Optional Subdomains:**
```
api      A     YOUR_PUBLIC_IP      TTL: 300 (for API endpoints)
admin    A     YOUR_PUBLIC_IP      TTL: 300 (for admin panel)
```

---

## 🚀 Quick Setup Steps

### Step 1: Get Public IP
```powershell
# On LuxRig
$publicIP = (Invoke-WebRequest -Uri "https://api.ipify.org").Content
Write-Host "Public IP: $publicIP"
```

### Step 2: Configure Router
- Log into router admin panel
- Port Forwarding:
  - **External Port:** 80 → **Internal IP:** LuxRig IP → **Internal Port:** 3001
  - **External Port:** 443 → **Internal IP:** LuxRig IP → **Internal Port:** 3001

### Step 3: Update DNS
1. Go to Spaceship DNS management
2. Edit A record for `@`:
   - **Value:** Your public IP
   - **TTL:** 300 (5 minutes)
3. Save changes

### Step 4: Verify
```powershell
# Wait 5-10 minutes for DNS propagation
# Then test:
curl http://dlxstudios.ai/health
```

---

## 🔍 DNS Propagation Check

After updating DNS, verify propagation:

```powershell
# Check DNS propagation
nslookup dlxstudios.ai

# Or use online tools:
# https://www.whatsmydns.net/#A/dlxstudios.ai
```

---

## ⚠️ Security Considerations

### Exposing Home Server Directly

**Risks:**
- Exposes your home IP
- DDoS attacks possible
- Need to manage firewall rules
- SSL certificate management

**Recommendations:**
1. Use Cloudflare (free SSL + DDoS protection)
2. Enable firewall on LuxRig
3. Use non-standard ports if possible
4. Monitor logs for suspicious activity
5. Consider VPN access instead of public exposure

### Alternative: Cloudflare Tunnel

**Benefits:**
- No port forwarding needed
- Free SSL certificate
- DDoS protection
- IP hidden behind Cloudflare

**Setup:**
```powershell
# Install cloudflared
winget install Cloudflare.cloudflared

# Login
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create dlx-studios

# Run tunnel (for testing)
cloudflared tunnel run dlx-studios

# Configure DNS route
cloudflared tunnel route dns dlx-studios dlxstudios.ai
```

---

## 📊 Current Configuration Notes

**Your Current Setup:**
- Domain: `dlxstudios.ai`
- DNS Provider: Spaceship
- Current A Record: `74.208.170.210`
- TTL: 1 minute (very low - consider increasing to 300)

**Next Steps:**
1. Determine if `74.208.170.210` is your LuxRig's public IP
2. If yes, ensure router port forwarding is configured
3. If no, update A record to correct IP
4. Increase TTL to 300 (5 minutes) for better performance
5. Consider HTTPS/SSL setup

---

## 🎯 Testing Checklist

After DNS update:

- [ ] DNS propagated (check with `nslookup`)
- [ ] Port forwarding configured
- [ ] Server running on LuxRig (port 3001)
- [ ] Firewall allows port 3001
- [ ] Can access `http://dlxstudios.ai` from external network
- [ ] Health check works: `http://dlxstudios.ai/health`
- [ ] SSL/HTTPS configured (if applicable)

---

## 🆘 Troubleshooting

### Domain Not Resolving

1. **Check DNS Propagation:**
   ```powershell
   nslookup dlxstudios.ai
   ```

2. **Verify A Record:**
   - Check Spaceship DNS panel
   - Ensure IP matches LuxRig's public IP

3. **Wait for Propagation:**
   - DNS changes can take 5 minutes to 48 hours
   - TTL affects propagation time

### Can't Access from External Network

1. **Check Port Forwarding:**
   - Verify router configuration
   - Test from external network (mobile data)

2. **Check Firewall:**
   ```powershell
   # Verify firewall rule exists
   Get-NetFirewallRule -DisplayName "DLX Studios Ultimate"
   ```

3. **Check Server:**
   ```powershell
   # Verify server is running
   netstat -ano | findstr :3001
   ```

### SSL Certificate Issues

1. **Cloudflare:** Use "Full" SSL mode
2. **Let's Encrypt:** Ensure port 80 is accessible for validation
3. **Self-Signed:** Not recommended for production

---

**Ready to configure?** Update your DNS records and test access! 🚀

