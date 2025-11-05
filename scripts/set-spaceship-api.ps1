# Quick script to set Spaceship API credentials via browser localStorage
# Alternative method if server won't start

param(
    [Parameter(Mandatory=$false)]
    [string]$ApiKey = "",
    
    [Parameter(Mandatory=$false)]
    [string]$ApiSecret = ""
)

Write-Host "`n🔐 Spaceship API Configuration`n" -ForegroundColor Cyan

if ($ApiKey -and $ApiSecret) {
    Write-Host "⚠️  Note: This script opens a browser page for security." -ForegroundColor Yellow
    Write-Host "   Credentials cannot be set directly from PowerShell for security reasons.`n" -ForegroundColor Yellow
    
    # Create a temporary HTML file with pre-filled values
    $htmlPath = Join-Path $PSScriptRoot "configure-spaceship-api-temp.html"
    $html = @"
<!DOCTYPE html>
<html>
<head><title>Configure Spaceship API</title></head>
<body style="background:#0a0a0f;color:#fff;font-family:sans-serif;padding:20px">
<h1 style="color:#00ffff">🔐 Configure Spaceship API</h1>
<p>Your credentials have been pre-filled. Click 'Save Credentials' below.</p>
<form id="configForm">
<input type="text" id="apiKey" value="$ApiKey" style="display:none">
<input type="password" id="apiSecret" value="$ApiSecret" style="display:none">
<button type="submit" style="padding:10px 20px;background:#00ffff;border:none;border-radius:5px;cursor:pointer">Save Credentials</button>
</form>
<script>
document.getElementById('configForm').addEventListener('submit',(e)=>{
e.preventDefault();
localStorage.setItem('spaceship_api_key','$ApiKey');
localStorage.setItem('spaceship_api_secret','$ApiSecret');
alert('✅ Credentials saved!');
});
</script>
</body>
</html>
"@
    $html | Out-File -FilePath $htmlPath -Encoding UTF8
    
    Write-Host "📄 Opening configuration page..." -ForegroundColor Cyan
    Start-Process $htmlPath
    
    Write-Host "`n✅ Configuration page opened in browser." -ForegroundColor Green
    Write-Host "   Click 'Save Credentials' to store your API key.`n" -ForegroundColor White
    
    # Clean up after 5 seconds
    Start-Sleep -Seconds 5
    Remove-Item $htmlPath -ErrorAction SilentlyContinue
} else {
    Write-Host "📄 Opening configuration page..." -ForegroundColor Cyan
    $configPage = Join-Path $PSScriptRoot "configure-spaceship-api.html"
    
    if (Test-Path $configPage) {
        Start-Process $configPage
        Write-Host "`n✅ Configuration page opened in browser." -ForegroundColor Green
        Write-Host "   Enter your API credentials in the form.`n" -ForegroundColor White
    } else {
        Write-Host "❌ Configuration page not found at: $configPage" -ForegroundColor Red
        Write-Host "`nAlternative: Use browser console method:" -ForegroundColor Yellow
        Write-Host "   1. Open any page on localhost:3001" -ForegroundColor White
        Write-Host "   2. Press F12 (Developer Tools)" -ForegroundColor White
        Write-Host "   3. Go to Console tab" -ForegroundColor White
        Write-Host "   4. Paste this:" -ForegroundColor White
        Write-Host "`nlocalStorage.setItem('spaceship_api_key', 'YOUR_API_KEY');" -ForegroundColor Cyan
        Write-Host "localStorage.setItem('spaceship_api_secret', 'YOUR_API_SECRET');`n" -ForegroundColor Cyan
    }
}

Write-Host "💡 Get your API key from:" -ForegroundColor Cyan
Write-Host "   https://www.spaceship.com/application/api-manager/`n" -ForegroundColor White

