# 🌐 DNS Setup Steps - Quick Guide

## ✅ Current Status

- ✅ Site working on dev server: `http://localhost:5173`
- ✅ Spaceship API credentials configured
- ⏭️ Ready to update DNS records

---

## 📋 Step-by-Step DNS Configuration

### Step 1: Test DNS Manager Connection

1. Open: **http://localhost:5173**
2. Navigate to: **Settings → DNS Manager**
3. Your API credentials should already be loaded
4. Click **"Refresh"** button
5. **Expected:** You should see your DNS records for `dlxstudios.ai`
6. **If error:** Check API credentials are correct

---

### Step 2: Get Your Public IP Address

**Option A: Use DNS Manager UI**
- Click the **network icon** next to the IP field
- It will auto-detect your public IP

**Option B: PowerShell Script**
```powershell
.\scripts\get-public-ip.ps1
```

**Option C: Manual**
```powershell
(Invoke-WebRequest -Uri "https://api.ipify.org?format=json").Content
```

---

### Step 3: Update DNS A Record

1. In DNS Manager, enter your **public IP** in the "Update A Record" field
2. Click **"Update DNS Record"**
3. Wait for confirmation message
4. The DNS update will propagate in 5-15 minutes

**Current A Record:** Check what it shows in DNS Manager  
**New A Record:** Your public IP address

---

### Step 4: Configure Router Port Forwarding

**Access Router Admin:**
- Usually: `192.168.1.1` or `192.168.0.1`
- Check router label for admin URL

**Add Port Forwarding Rules:**

| External Port | Protocol | Internal IP (LuxRig) | Internal Port | Description |
|--------------|----------|---------------------|---------------|-------------|
| 80 | TCP | Your LuxRig IP | 5173 | HTTP (Dev Server) |
| 443 | TCP | Your LuxRig IP | 5173 | HTTPS (Dev Server) |

**Note:** For production, use port 3001 once production server is fixed.

**Find Your LuxRig Internal IP:**
```powershell
ipconfig | findstr IPv4
```

---

### Step 5: Test Domain Access

1. **Wait 5-15 minutes** for DNS propagation
2. Check DNS propagation: https://www.whatsmydns.net/#A/dlxstudios.ai
3. Test from external network (mobile hotspot):
   - Visit: `http://dlxstudios.ai`
   - Should load your site

---

## 🔍 Troubleshooting

### DNS Manager Not Connecting

**Check:**
- API credentials are saved (Settings → DNS Manager shows them)
- API key has correct permissions (`dnsrecords:read`, `dnsrecords:write`)
- Internet connection is working

**Fix:**
- Re-enter credentials in DNS Manager
- Check Spaceship API Manager: https://www.spaceship.com/application/api-manager/

### DNS Update Not Working

**Check:**
- IP address is correct (public IP, not local IP)
- DNS Manager shows success message
- Wait longer (DNS can take up to 15 minutes)

**Fix:**
- Verify IP with `.\scripts\get-public-ip.ps1`
- Try updating DNS record again
- Check DNS propagation status

### Domain Not Accessible

**Check:**
- DNS propagated (use whatsmydns.net)
- Router port forwarding configured correctly
- Firewall allows ports 80/443
- Server is running (`npm run dev`)

**Fix:**
- Verify port forwarding rules
- Check Windows Firewall settings
- Ensure dev server is running

---

## 📊 Current Configuration

**Dev Server:** `http://localhost:5173` ✅  
**Production Server:** `http://localhost:3001` ⚠️ (needs fix)  
**Domain:** `dlxstudios.ai`  
**DNS Provider:** Spaceship  
**API:** Configured ✅

---

## 🎯 Success Checklist

- [ ] DNS Manager connects successfully
- [ ] Can view DNS records
- [ ] Public IP obtained
- [ ] DNS A record updated
- [ ] Router port forwarding configured
- [ ] DNS propagated (checked on whatsmydns.net)
- [ ] Domain accessible from external network

---

**Ready to proceed?** Start with Step 1 - Test DNS Manager! 🚀

