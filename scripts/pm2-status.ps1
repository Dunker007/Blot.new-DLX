# Check PM2 status for DLX Studios Ultimate

Write-Host "📊 DLX Studios Ultimate PM2 Status`n" -ForegroundColor Cyan

# Check if PM2 is installed
try {
    pm2 --version | Out-Null
} catch {
    Write-Host "❌ PM2 not found. Please run: npm install -g pm2" -ForegroundColor Red
    exit 1
}

# Show PM2 list
pm2 list

Write-Host "`n📋 Useful commands:" -ForegroundColor Cyan
Write-Host "   pm2 logs dlx-dev     - View dev server logs" -ForegroundColor White
Write-Host "   pm2 logs dlx-prod    - View production server logs" -ForegroundColor White
Write-Host "   pm2 monit            - Open monitoring dashboard" -ForegroundColor White
Write-Host ""

