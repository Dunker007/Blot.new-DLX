# Kill process using a specific port
param(
    [Parameter(Mandatory=$true)]
    [int]$Port
)

Write-Host "`n🔍 Finding process using port $Port...`n" -ForegroundColor Cyan

try {
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    
    if ($connection) {
        $processId = $connection.OwningProcess | Select-Object -First 1
        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        
        if ($process) {
            Write-Host "Found process:" -ForegroundColor Yellow
            Write-Host "   PID: $($process.Id)" -ForegroundColor White
            Write-Host "   Name: $($process.ProcessName)" -ForegroundColor White
            Write-Host "   Path: $($process.Path)" -ForegroundColor White
            Write-Host ""
            
            $response = Read-Host "Kill this process? (Y/N)"
            if ($response -eq 'Y' -or $response -eq 'y') {
                Stop-Process -Id $processId -Force
                Write-Host "✅ Process killed!" -ForegroundColor Green
                Write-Host "   You can now start the server on port $Port`n" -ForegroundColor White
            } else {
                Write-Host "Process not killed. Exiting.`n" -ForegroundColor Yellow
            }
        } else {
            Write-Host "⚠️  Process not found (may have already exited)`n" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✅ Port $Port is not in use!`n" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)`n" -ForegroundColor Red
}

