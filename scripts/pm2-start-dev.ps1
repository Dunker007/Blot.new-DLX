# Start dev server with PM2

Write-Host "🚀 Starting DLX Studios Ultimate dev server with PM2..." -ForegroundColor Cyan

# Check if PM2 is installed
try {
    pm2 --version | Out-Null
} catch {
    Write-Host "❌ PM2 not found. Please run: npm install -g pm2" -ForegroundColor Red
    exit 1
}

# Check if already running
$existing = pm2 list | Select-String "dlx-dev"
if ($existing) {
    Write-Host "⚠️  Dev server already running. Restarting..." -ForegroundColor Yellow
    pm2 restart dlx-dev
} else {
    Write-Host "📦 Starting dev server..." -ForegroundColor Cyan
    pm2 start ecosystem.config.js --only dlx-dev
}

Write-Host "✅ Dev server started!" -ForegroundColor Green
Write-Host "📋 View logs: pm2 logs dlx-dev" -ForegroundColor Cyan
Write-Host "📋 View status: pm2 list" -ForegroundColor Cyan
Write-Host ""

