# 🔧 Troubleshooting Guide

## Issue: Only Background Showing (Crosshatch Pattern)

If you're seeing only the background but no content, this usually means:

### Possible Causes:

1. **JavaScript files not loading** - Check browser console for 404 errors
2. **Old build files** - The dist folder has outdated files
3. **Asset path issues** - Server not serving assets correctly
4. **React not mounting** - JavaScript error preventing app from loading

### Solutions:

#### 1. Rebuild the Frontend

```powershell
cd "C:\Repos GIT\DLX-Studios-Ultimate"
npm run build
```

#### 2. Clear Browser Cache

- Press `Ctrl + Shift + Delete`
- Clear cached images and files
- Or use `Ctrl + F5` to hard refresh

#### 3. Check Browser Console

1. Open Developer Tools (`F12`)
2. Go to Console tab
3. Look for errors (red text)
4. Go to Network tab
5. Check if any files are failing to load (red status)

#### 4. Verify Server is Running

```powershell
# Check if server is running
curl http://localhost:3001/health

# Check if index.html is served
curl http://localhost:3001/

# Check if assets are accessible
curl http://localhost:3001/assets/index-CDY7XNEk.js
```

#### 5. Restart Server

```powershell
# Stop the server (Ctrl+C)
# Then restart
npm start
```

#### 6. Check Asset Paths

The `dist/index.html` should reference files like:
- `/assets/index-*.js`
- `/assets/index-*.css`

If paths are wrong, rebuild:
```powershell
npm run build
```

### Common Errors:

**404 on JS files:**
- Solution: Rebuild with `npm run build`
- Check that `dist/assets/` folder exists

**CORS errors:**
- Solution: Server CORS is configured, but check browser console
- Ensure server is running on correct port

**React root not found:**
- Check that `index.html` has `<div id="root"></div>`
- Verify `main.tsx` is mounting correctly

### Quick Fix:

```powershell
# Full reset
cd "C:\Repos GIT\DLX-Studios-Ultimate"
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
npm run build
npm start
```

Then open `http://localhost:3001` in a fresh browser window (or incognito).

