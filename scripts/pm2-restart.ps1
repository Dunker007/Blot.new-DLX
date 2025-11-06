# Restart PM2 processes for DLX Studios Ultimate

param(
    [string]$Process = "all"
)

Write-Host "🔄 Restarting DLX Studios Ultimate PM2 processes..." -ForegroundColor Cyan

# Check if PM2 is installed
try {
    pm2 --version | Out-Null
} catch {
    Write-Host "❌ PM2 not found. Please run: npm install -g pm2" -ForegroundColor Red
    exit 1
}

if ($Process -eq "all") {
    pm2 restart dlx-dev 2>$null
    pm2 restart dlx-prod 2>$null
    Write-Host "✅ All processes restarted!" -ForegroundColor Green
} elseif ($Process -eq "dev") {
    pm2 restart dlx-dev
    Write-Host "✅ Dev server restarted!" -ForegroundColor Green
} elseif ($Process -eq "prod") {
    pm2 restart dlx-prod
    Write-Host "✅ Production server restarted!" -ForegroundColor Green
} else {
    Write-Host "❌ Invalid process name. Use 'dev', 'prod', or 'all'" -ForegroundColor Red
    exit 1
}

Write-Host "📋 View logs: pm2 logs" -ForegroundColor Cyan
Write-Host ""

