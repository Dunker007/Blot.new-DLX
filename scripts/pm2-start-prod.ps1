# Start production server with PM2

Write-Host "🚀 Starting DLX Studios Ultimate production server with PM2..." -ForegroundColor Cyan

# Check if PM2 is installed
try {
    pm2 --version | Out-Null
} catch {
    Write-Host "❌ PM2 not found. Please run: npm install -g pm2" -ForegroundColor Red
    exit 1
}

# Check if build exists
if (-not (Test-Path "dist")) {
    Write-Host "⚠️  Build not found. Building..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed" -ForegroundColor Red
        exit 1
    }
}

# Check if already running
$existing = pm2 list | Select-String "dlx-prod"
if ($existing) {
    Write-Host "⚠️  Production server already running. Restarting..." -ForegroundColor Yellow
    pm2 restart dlx-prod
} else {
    Write-Host "📦 Starting production server..." -ForegroundColor Cyan
    pm2 start ecosystem.config.js --only dlx-prod
}

Write-Host "✅ Production server started!" -ForegroundColor Green
Write-Host "📋 View logs: pm2 logs dlx-prod" -ForegroundColor Cyan
Write-Host "📋 View status: pm2 list" -ForegroundColor Cyan
Write-Host ""

