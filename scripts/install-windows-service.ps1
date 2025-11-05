# DLX Studios Ultimate - Windows Service Installer
# Run as Administrator: PowerShell -ExecutionPolicy Bypass -File install-windows-service.ps1

$serviceName = "DLXStudiosUltimate"
$displayName = "DLX Studios Ultimate"
$description = "AI-powered development platform with LuxRig integration"
$nodePath = (Get-Command node).Source
$scriptPath = Join-Path $PSScriptRoot ".." "server.js"
$workingDir = Join-Path $PSScriptRoot ".."

Write-Host "Installing $displayName as Windows Service..." -ForegroundColor Cyan

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Check if node-windows or nssm is available
$useNSSM = $false
if (Get-Command nssm -ErrorAction SilentlyContinue) {
    $useNSSM = $true
    Write-Host "Using NSSM to install service..." -ForegroundColor Green
} else {
    Write-Host "NSSM not found. Installing via node-windows..." -ForegroundColor Yellow
    Write-Host "For better Windows service support, install NSSM:" -ForegroundColor Yellow
    Write-Host "  choco install nssm" -ForegroundColor Yellow
    Write-Host "  OR download from: https://nssm.cc/download" -ForegroundColor Yellow
}

if ($useNSSM) {
    # Remove existing service if it exists
    nssm stop $serviceName 2>$null
    nssm remove $serviceName confirm 2>$null
    
    # Install service
    nssm install $serviceName $nodePath "$scriptPath"
    nssm set $serviceName AppDirectory $workingDir
    nssm set $serviceName DisplayName $displayName
    nssm set $serviceName Description $description
    nssm set $serviceName Start SERVICE_AUTO_START
    nssm set $serviceName AppEnvironmentExtra "NODE_ENV=production"
    
    Write-Host "Service installed successfully!" -ForegroundColor Green
    Write-Host "To start: nssm start $serviceName" -ForegroundColor Cyan
    Write-Host "To stop: nssm stop $serviceName" -ForegroundColor Cyan
    Write-Host "To uninstall: nssm remove $serviceName confirm" -ForegroundColor Cyan
} else {
    # Alternative: Use pm2 or task scheduler
    Write-Host ""
    Write-Host "Alternative installation methods:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Using PM2 (recommended for Node.js):" -ForegroundColor Cyan
    Write-Host "   npm install -g pm2" -ForegroundColor White
    Write-Host "   pm2 start server.js --name dlx-studios" -ForegroundColor White
    Write-Host "   pm2 startup" -ForegroundColor White
    Write-Host "   pm2 save" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Using Task Scheduler:" -ForegroundColor Cyan
    Write-Host "   Create a scheduled task that runs:" -ForegroundColor White
    Write-Host "   $nodePath $scriptPath" -ForegroundColor White
    Write-Host "   Set it to run at startup and when user logs on" -ForegroundColor White
}

