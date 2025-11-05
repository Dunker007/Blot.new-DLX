# Quick script to get your public IP address for DNS configuration

Write-Host "`n🌐 Getting your public IP address...`n" -ForegroundColor Cyan

try {
    $ipResponse = Invoke-RestMethod -Uri "https://api.ipify.org?format=json" -Method Get
    $publicIP = $ipResponse.ip
    
    Write-Host "✅ Your Public IP Address:" -ForegroundColor Green
    Write-Host "   $publicIP`n" -ForegroundColor White
    
    Write-Host "📋 Use this IP in DNS Manager:" -ForegroundColor Cyan
    Write-Host "   1. Start DLX Studios server" -ForegroundColor White
    Write-Host "   2. Go to Settings → DNS Manager" -ForegroundColor White
    Write-Host "   3. Paste this IP: $publicIP" -ForegroundColor White
    Write-Host "   4. Click 'Update DNS Record'`n" -ForegroundColor White
    
    # Copy to clipboard if available
    try {
        Set-Clipboard -Value $publicIP
        Write-Host "✅ IP address copied to clipboard!`n" -ForegroundColor Green
    } catch {
        # Clipboard not available, that's okay
    }
    
} catch {
    Write-Host "❌ Failed to get public IP address" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)`n" -ForegroundColor Yellow
    
    Write-Host "Alternative methods:" -ForegroundColor Cyan
    Write-Host "   • Visit: https://api.ipify.org" -ForegroundColor White
    Write-Host "   • Or check your router admin panel`n" -ForegroundColor White
}

