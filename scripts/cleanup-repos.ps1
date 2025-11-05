# Repository Cleanup Script
# Run this AFTER testing all features and confirming everything works

Write-Host "`n🧹 DLX Repositories Cleanup Script`n" -ForegroundColor Cyan
Write-Host "⚠️  WARNING: This will DELETE local repositories!`n" -ForegroundColor Yellow
Write-Host "Before running, ensure:" -ForegroundColor Yellow
Write-Host "  1. All features are tested and working" -ForegroundColor Yellow
Write-Host "  2. Repositories are archived on GitHub" -ForegroundColor Yellow
Write-Host "  3. Archive tags are created (see consolidate-repos.md)`n" -ForegroundColor Yellow

$confirm = Read-Host "Type 'YES' to continue with cleanup"

if ($confirm -ne "YES") {
    Write-Host "`n❌ Cleanup cancelled.`n" -ForegroundColor Red
    exit
}

$reposToDelete = @(
    "DLX-Cognitive-Co-Pilot",
    "DLX-Cognitive-Co-Pilot-",
    "Dunkerlux-shell",
    "Blot.new-DLX",
    "DLX-3.0",
    "DLX-Ultra",
    "DLX-Ultra-2",
    "DLX-Command-Center-LUX-2.0"
)

$basePath = "C:\Repos GIT"

Write-Host "`n🗑️  Starting cleanup...`n" -ForegroundColor Cyan

foreach ($repo in $reposToDelete) {
    $repoPath = Join-Path $basePath $repo
    
    if (Test-Path $repoPath) {
        Write-Host "Deleting: $repo" -ForegroundColor Yellow
        try {
            Remove-Item -Recurse -Force $repoPath -ErrorAction Stop
            Write-Host "  ✅ Deleted successfully`n" -ForegroundColor Green
        } catch {
            Write-Host "  ❌ Error deleting: $_`n" -ForegroundColor Red
        }
    } else {
        Write-Host "  ⚠️  Not found: $repo`n" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ Cleanup complete!`n" -ForegroundColor Green
Write-Host "Remaining repositories:" -ForegroundColor Cyan
Get-ChildItem $basePath -Directory | ForEach-Object {
    Write-Host "  • $($_.Name)" -ForegroundColor White
}

