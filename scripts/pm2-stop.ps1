# Stop all PM2 processes for DLX Studios Ultimate

Write-Host "🛑 Stopping DLX Studios Ultimate PM2 processes..." -ForegroundColor Cyan

# Check if PM2 is installed
try {
    pm2 --version | Out-Null
} catch {
    Write-Host "❌ PM2 not found" -ForegroundColor Red
    exit 1
}

# Stop processes
pm2 stop dlx-dev 2>$null
pm2 stop dlx-prod 2>$null

Write-Host "✅ PM2 processes stopped!" -ForegroundColor Green
Write-Host "📋 View status: pm2 list" -ForegroundColor Cyan
Write-Host ""

