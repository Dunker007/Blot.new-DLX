# DLX Studios Ultimate - PM2 Setup Script
# Installs and configures PM2 for permanent server management

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "PM2 Setup for DLX Studios Ultimate" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Cyan
$nodeCheck = Get-Command node -ErrorAction SilentlyContinue
if ($nodeCheck) {
    $nodeVersion = node --version
    Write-Host "  [OK] Node.js $nodeVersion installed" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Node.js not found. Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check if PM2 is installed
Write-Host ""
Write-Host "Checking PM2 installation..." -ForegroundColor Cyan
$pm2Check = Get-Command pm2 -ErrorAction SilentlyContinue
if ($pm2Check) {
    $pm2Version = pm2 --version
    Write-Host "  [OK] PM2 $pm2Version already installed" -ForegroundColor Green
    $pm2Installed = $true
} else {
    Write-Host "  [WARN] PM2 not found, will install..." -ForegroundColor Yellow
    $pm2Installed = $false
}

# Install PM2 if needed
if (-not $pm2Installed) {
    Write-Host ""
    Write-Host "Installing PM2 globally..." -ForegroundColor Cyan
    npm install -g pm2
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERROR] Failed to install PM2" -ForegroundColor Red
        exit 1
    }
    Write-Host "  [OK] PM2 installed successfully" -ForegroundColor Green
}

# Create logs directory
Write-Host ""
Write-Host "Creating logs directory..." -ForegroundColor Cyan
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
    Write-Host "  [OK] Logs directory created" -ForegroundColor Green
} else {
    Write-Host "  [OK] Logs directory exists" -ForegroundColor Green
}

# Check if ecosystem.config.js exists
Write-Host ""
Write-Host "Checking PM2 configuration..." -ForegroundColor Cyan
if (-not (Test-Path "ecosystem.config.js")) {
    Write-Host "  [WARN] ecosystem.config.js not found" -ForegroundColor Yellow
} else {
    Write-Host "  [OK] ecosystem.config.js exists" -ForegroundColor Green
}

# Setup PM2 startup (requires admin)
if ($isAdmin) {
    Write-Host ""
    Write-Host "Configuring PM2 startup..." -ForegroundColor Cyan
    $startupOutput = pm2 startup 2>&1
    Write-Host "  [OK] PM2 startup configured" -ForegroundColor Green
    Write-Host "  [INFO] Please run the command shown above if needed" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "Skipping startup configuration (requires Administrator)" -ForegroundColor Yellow
    Write-Host "  [INFO] Run as Administrator to enable auto-start on boot" -ForegroundColor Cyan
}

# Summary
Write-Host ""
Write-Host "PM2 setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Available commands:" -ForegroundColor Cyan
Write-Host "  npm run pm2:dev      - Start dev server with PM2" -ForegroundColor White
Write-Host "  npm run pm2:prod     - Start production server with PM2" -ForegroundColor White
Write-Host "  npm run pm2:stop     - Stop all PM2 processes" -ForegroundColor White
Write-Host "  npm run pm2:logs     - View PM2 logs" -ForegroundColor White
Write-Host "  npm run pm2:monit    - Open PM2 monitoring dashboard" -ForegroundColor White
Write-Host "  npm run pm2:status   - Check PM2 status" -ForegroundColor White
Write-Host ""
Write-Host "Direct PM2 commands:" -ForegroundColor Cyan
Write-Host "  pm2 list             - List all processes" -ForegroundColor White
Write-Host "  pm2 logs dlx-dev     - View dev server logs" -ForegroundColor White
Write-Host "  pm2 restart dlx-dev  - Restart dev server" -ForegroundColor White
Write-Host "  pm2 stop dlx-dev     - Stop dev server" -ForegroundColor White
Write-Host "  pm2 delete dlx-dev   - Remove dev server from PM2" -ForegroundColor White
Write-Host ""
