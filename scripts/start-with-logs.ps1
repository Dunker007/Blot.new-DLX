# Start server with detailed error logging

$ErrorActionPreference = "Continue"

Write-Host "`n🚀 Starting DLX Studios Server...`n" -ForegroundColor Cyan

# Change to project directory
Set-Location $PSScriptRoot\..

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js not found!" -ForegroundColor Red
    Write-Host "   Install Node.js from: https://nodejs.org`n" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  Dependencies not installed. Installing..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ npm install failed!" -ForegroundColor Red
        exit 1
    }
}

if (-not (Test-Path "dist\index.html")) {
    Write-Host "⚠️  Frontend not built. Building..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
}

# Check if port is in use
$portCheck = netstat -ano | findstr ":3001.*LISTENING"
if ($portCheck) {
    Write-Host "⚠️  Port 3001 is in use!" -ForegroundColor Yellow
    $pid = ($portCheck -split '\s+')[-1]
    Write-Host "   Process ID: $pid" -ForegroundColor Gray
    $response = Read-Host "Kill process and continue? (Y/N)"
    if ($response -eq 'Y' -or $response -eq 'y') {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
        Write-Host "✅ Process killed`n" -ForegroundColor Green
    } else {
        Write-Host "Exiting. Free port 3001 first.`n" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "✅ Prerequisites OK`n" -ForegroundColor Green

# Start server
Write-Host "🚀 Starting server...`n" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""

try {
    # Run npm start:prod and capture output
    npm run start:prod
} catch {
    Write-Host "`n❌ Server failed to start!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "`nCheck the error above for details.`n" -ForegroundColor Yellow
    exit 1
}

