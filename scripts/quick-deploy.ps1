# DLX Studios Ultimate - Quick Deploy Script
# One-command deployment for production

param(
    [switch]$SkipBuild,
    [switch]$SkipService,
    [switch]$SkipFirewall
)

$ErrorActionPreference = "Stop"

Write-Host "`n🚀 DLX Studios Ultimate - Quick Deploy`n" -ForegroundColor Cyan

# Check Node.js
Write-Host "📦 Checking prerequisites..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    Write-Host "   ✓ Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Node.js not found" -ForegroundColor Red
    exit 1
}

# Build
if (-not $SkipBuild) {
    Write-Host "`n🔨 Building frontend..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ✗ Build failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "   ✓ Build complete" -ForegroundColor Green
} else {
    Write-Host "`n⏭️  Skipping build..." -ForegroundColor Yellow
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "`n📝 Creating .env file..." -ForegroundColor Cyan
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "   ✓ Created .env from template" -ForegroundColor Green
        Write-Host "   ⚠️  Please edit .env with your configuration" -ForegroundColor Yellow
    }
}

# Check if dist exists
if (-not (Test-Path "dist")) {
    Write-Host "`n⚠️  Warning: dist folder not found. Run build first." -ForegroundColor Yellow
    exit 1
}

# Run full setup if not skipping
if (-not $SkipService -or -not $SkipFirewall) {
    Write-Host "`n⚙️  Running production setup..." -ForegroundColor Cyan
    $setupArgs = @()
    if (-not $SkipService) { $setupArgs += "-InstallService" }
    if (-not $SkipFirewall) { $setupArgs += "-ConfigureFirewall" }
    $setupArgs += "-CreateLogsDir"
    
    & "$PSScriptRoot\setup-production.ps1" @setupArgs
}

# Summary
Write-Host "`n✅ Quick Deploy Complete!`n" -ForegroundColor Green
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Configure .env file (if needed)" -ForegroundColor White
Write-Host "   2. Start server: npm run start:prod" -ForegroundColor White
Write-Host "   3. Configure DNS Manager in Settings" -ForegroundColor White
Write-Host "   4. Update DNS A record" -ForegroundColor White
Write-Host "   5. Configure router port forwarding`n" -ForegroundColor White
Write-Host "🌐 Access at: http://localhost:3001`n" -ForegroundColor Yellow

