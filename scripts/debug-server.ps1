# Comprehensive server debugging script

Write-Host "`n🔍 DLX Studios Server Debug`n" -ForegroundColor Cyan

$issues = @()

# Check Node.js
Write-Host "1. Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✅ $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Not found!" -ForegroundColor Red
    $issues += "Node.js not installed"
}

# Check dependencies
Write-Host "`n2. Dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✅ Installed" -ForegroundColor Green
} else {
    Write-Host "   ❌ Missing - run: npm install" -ForegroundColor Red
    $issues += "Dependencies not installed"
}

# Check dist folder
Write-Host "`n3. Build files..." -ForegroundColor Yellow
if (Test-Path "dist\index.html") {
    Write-Host "   ✅ Built" -ForegroundColor Green
    $assetCount = (Get-ChildItem "dist\assets" -ErrorAction SilentlyContinue).Count
    Write-Host "   ✅ Assets: $assetCount files" -ForegroundColor Green
} else {
    Write-Host "   ❌ Not built - run: npm run build" -ForegroundColor Red
    $issues += "Frontend not built"
}

# Check port
Write-Host "`n4. Port 3001..." -ForegroundColor Yellow
$portInUse = netstat -ano | findstr ":3001.*LISTENING"
if ($portInUse) {
    $pid = ($portInUse -split '\s+')[-1]
    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "   ⚠️  In use by: $($process.ProcessName) (PID: $pid)" -ForegroundColor Yellow
        Write-Host "   Kill it? Run: Stop-Process -Id $pid -Force" -ForegroundColor Gray
    }
} else {
    Write-Host "   ✅ Available" -ForegroundColor Green
}

# Test server
Write-Host "`n5. Server status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    Write-Host "   ✅ Running and responding" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Not responding" -ForegroundColor Red
    $issues += "Server not running"
}

# Summary
Write-Host "`n📋 Summary:" -ForegroundColor Cyan
if ($issues.Count -eq 0) {
    Write-Host "   ✅ Everything looks good!" -ForegroundColor Green
    Write-Host "   Try: npm run start:prod`n" -ForegroundColor White
} else {
    Write-Host "   ❌ Issues found:" -ForegroundColor Red
    foreach ($issue in $issues) {
        Write-Host "      • $issue" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "   🔧 Fix commands:" -ForegroundColor Cyan
    if ($issues -contains "Dependencies not installed") {
        Write-Host "      npm install" -ForegroundColor White
    }
    if ($issues -contains "Frontend not built") {
        Write-Host "      npm run build" -ForegroundColor White
    }
    if ($issues -contains "Server not running") {
        Write-Host "      npm run start:prod" -ForegroundColor White
    }
    Write-Host ""
}

