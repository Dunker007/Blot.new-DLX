# Test if server is running and serving files correctly

Write-Host "`n🔍 Testing Server Status...`n" -ForegroundColor Cyan

# Test health endpoint
Write-Host "1. Testing /health endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -ErrorAction Stop
    Write-Host "   ✅ Health check: $($health.StatusCode) OK" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test root endpoint
Write-Host "`n2. Testing root endpoint..." -ForegroundColor Yellow
try {
    $root = Invoke-WebRequest -Uri "http://localhost:3001/" -UseBasicParsing -ErrorAction Stop
    Write-Host "   ✅ Root: $($root.StatusCode) OK" -ForegroundColor Green
    if ($root.Content -match "index.html|DLXStudios|root") {
        Write-Host "   ✅ HTML content detected" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Unexpected content type" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Root failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test assets
Write-Host "`n3. Testing assets..." -ForegroundColor Yellow
$distPath = Join-Path $PSScriptRoot "..\dist"
if (Test-Path $distPath) {
    $assets = Get-ChildItem (Join-Path $distPath "assets") -File | Select-Object -First 1
    if ($assets) {
        $assetUrl = "http://localhost:3001/assets/$($assets.Name)"
        try {
            $asset = Invoke-WebRequest -Uri $assetUrl -UseBasicParsing -ErrorAction Stop
            Write-Host "   ✅ Asset test: $($asset.StatusCode) OK" -ForegroundColor Green
        } catch {
            Write-Host "   ❌ Asset failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "   ⚠️  dist folder not found" -ForegroundColor Yellow
}

Write-Host "`n💡 Open browser and check:" -ForegroundColor Cyan
Write-Host "   • URL: http://localhost:3001" -ForegroundColor White
Write-Host "   • Press F12 → Console tab for errors" -ForegroundColor White
Write-Host "   • Press F12 → Network tab to see loaded files`n" -ForegroundColor White

