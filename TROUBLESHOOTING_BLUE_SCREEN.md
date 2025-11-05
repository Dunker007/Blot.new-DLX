# 🔵 Troubleshooting Blue Screen Issue

## What is the "Blue Screen"?

The blue screen you're seeing is likely a **browser error page** (Edge/Chrome default error page) that shows when:
- Server is not running
- Server is running but not responding
- Connection refused or timeout

---

## ✅ Solution: Use Dev Server Instead

The **production server** (`npm run start:prod`) might have issues. Use the **dev server** instead:

```powershell
npm run dev
```

Then open: **http://localhost:5173**

The dev server:
- ✅ Easier to debug
- ✅ Shows errors in browser console
- ✅ Hot reload for changes
- ✅ Uses Vite (faster)

---

## 🔍 If Dev Server Also Shows Blue Screen

### 1. Check Browser Console
- Press **F12** (Developer Tools)
- Go to **Console** tab
- Look for **red error messages**
- Share those errors

### 2. Check Network Tab
- Press **F12** → **Network** tab
- Refresh the page
- Look for **failed requests** (red)
- Check what URLs are failing

### 3. Try Different Browser
- Try **Chrome** instead of Edge
- Or **Firefox**
- Sometimes browser cache causes issues

### 4. Clear Browser Cache
- Press **Ctrl + Shift + Delete**
- Clear cached images and files
- Or use **Ctrl + F5** to hard refresh

---

## 🔧 Alternative: Check Server Logs

If you started the server, check the terminal window for:
- Error messages
- Port conflicts
- Missing dependencies

---

## 📋 Quick Test

Run this to verify server is responding:

```powershell
# Test if server is running
curl http://localhost:5173
# or
curl http://localhost:3001
```

If you get HTML back, server is working - issue is browser-side.
If you get connection error, server isn't running.

---

## 🆘 Still Not Working?

Share:
1. What browser you're using
2. What you see in browser console (F12)
3. Any error messages from terminal
4. The exact URL you're trying to access

---

**Most Common Fix:** Use `npm run dev` and open `http://localhost:5173` ✅

