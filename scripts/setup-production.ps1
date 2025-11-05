# DLX Studios Ultimate - Production Setup Script
# Run as Administrator for full setup

param(
    [switch]$InstallService,
    [switch]$ConfigureFirewall,
    [switch]$CreateLogsDir
)

$ErrorActionPreference = "Stop"

Write-Host "`n🚀 DLX Studios Ultimate - Production Setup`n" -ForegroundColor Cyan

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  Warning: Not running as Administrator. Some features may be limited." -ForegroundColor Yellow
}

# Check Node.js
Write-Host "📦 Checking Node.js..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    Write-Host "   ✓ Node.js $nodeVersion installed" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Node.js not found. Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Cyan
if (Test-Path "node_modules") {
    Write-Host "   ⚠️  node_modules exists, skipping npm install" -ForegroundColor Yellow
} else {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ✗ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "   ✓ Dependencies installed" -ForegroundColor Green
}

# Build frontend
Write-Host "`n🔨 Building frontend..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ Frontend built successfully" -ForegroundColor Green

# Create logs directory
if ($CreateLogsDir) {
    Write-Host "`n📁 Creating logs directory..." -ForegroundColor Cyan
    if (-not (Test-Path "logs")) {
        New-Item -ItemType Directory -Path "logs" | Out-Null
        Write-Host "   ✓ Logs directory created" -ForegroundColor Green
    } else {
        Write-Host "   ✓ Logs directory exists" -ForegroundColor Green
    }
}

# Configure firewall
if ($ConfigureFirewall -and $isAdmin) {
    Write-Host "`n🔥 Configuring Windows Firewall..." -ForegroundColor Cyan
    $port = 3001
    $ruleName = "DLX Studios Ultimate"
    
    # Remove existing rule if present
    $existingRule = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
    if ($existingRule) {
        Remove-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
    }
    
    # Add new rule
    New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -LocalPort $port -Protocol TCP -Action Allow | Out-Null
    Write-Host "   ✓ Firewall rule added for port $port" -ForegroundColor Green
} elseif ($ConfigureFirewall) {
    Write-Host "`n🔥 Skipping firewall configuration (requires Administrator)" -ForegroundColor Yellow
}

# Install Windows Service
if ($InstallService -and $isAdmin) {
    Write-Host "`n⚙️  Installing Windows Service..." -ForegroundColor Cyan
    
    # Check for NSSM
    if (Get-Command nssm -ErrorAction SilentlyContinue) {
        Write-Host "   ✓ NSSM found, installing service..." -ForegroundColor Green
        & "$PSScriptRoot\install-windows-service.ps1"
    } elseif (Get-Command pm2 -ErrorAction SilentlyContinue) {
        Write-Host "   ✓ PM2 found, configuring startup..." -ForegroundColor Green
        pm2 start server.js --name dlx-studios
        pm2 startup
        pm2 save
        Write-Host "   ✓ PM2 configured for auto-start" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  NSSM or PM2 not found. Installing via Task Scheduler..." -ForegroundColor Yellow
        Write-Host "   💡 For better service management, install:" -ForegroundColor Cyan
        Write-Host "      - NSSM: choco install nssm" -ForegroundColor White
        Write-Host "      - PM2: npm install -g pm2" -ForegroundColor White
    }
} elseif ($InstallService) {
    Write-Host "`n⚙️  Skipping service installation (requires Administrator)" -ForegroundColor Yellow
}

# Environment file check
Write-Host "`n📝 Checking environment configuration..." -ForegroundColor Cyan
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "   ✓ Created .env from .env.example" -ForegroundColor Green
        Write-Host "   ⚠️  Please edit .env with your configuration" -ForegroundColor Yellow
    } else {
        Write-Host "   ⚠️  .env.example not found" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✓ .env file exists" -ForegroundColor Green
}

# Summary
Write-Host "`n✅ Production setup complete!`n" -ForegroundColor Green
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Edit .env file with your configuration" -ForegroundColor White
Write-Host "   2. Start server: npm run start:prod" -ForegroundColor White
Write-Host "   3. Access at: http://localhost:3001" -ForegroundColor White
if (-not $InstallService) {
    Write-Host "   4. Install as service: .\scripts\setup-production.ps1 -InstallService" -ForegroundColor White
}
Write-Host ""

