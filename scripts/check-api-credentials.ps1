# Check if Spaceship API credentials are saved in browser localStorage
# Note: This requires browser console access

Write-Host "`n🔍 Checking Spaceship API Credentials`n" -ForegroundColor Cyan

Write-Host "📋 To check credentials in browser:" -ForegroundColor Yellow
Write-Host "   1. Open DLX Studios: http://localhost:5173" -ForegroundColor White
Write-Host "   2. Press F12 (Developer Tools)" -ForegroundColor White
Write-Host "   3. Go to Console tab" -ForegroundColor White
Write-Host "   4. Run these commands:`n" -ForegroundColor White

Write-Host "   localStorage.getItem('spaceship_api_key')" -ForegroundColor Cyan
Write-Host "   localStorage.getItem('spaceship_api_secret')`n" -ForegroundColor Cyan

Write-Host "📝 If they return 'null', you need to:" -ForegroundColor Yellow
Write-Host "   1. Go to Settings → DNS Manager" -ForegroundColor White
Write-Host "   2. Enter API Key: lrezT2g5Rn5zzKBxZ4XN" -ForegroundColor White
Write-Host "   3. Enter API Secret (from Spaceship)" -ForegroundColor White
Write-Host "   4. Click 'Save Credentials'`n" -ForegroundColor White

Write-Host "🔗 Get API Secret from:" -ForegroundColor Cyan
Write-Host "   https://www.spaceship.com/application/api-manager/`n" -ForegroundColor White

