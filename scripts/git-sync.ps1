# Git Sync Script - Review and Execute
# This script prepares all changes for commit and push

Write-Host "🔍 Pre-Commit Git Sync Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Error: Not in a git repository!" -ForegroundColor Red
    exit 1
}

# Show current status
Write-Host "📊 Current Git Status:" -ForegroundColor Yellow
Write-Host ""
git status --short
Write-Host ""

# Show branch info
Write-Host "🌿 Branch Information:" -ForegroundColor Yellow
$currentBranch = git branch --show-current
$remoteBranch = git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>$null
Write-Host "Current Branch: $currentBranch" -ForegroundColor White
if ($remoteBranch) {
    Write-Host "Tracking: $remoteBranch" -ForegroundColor White
    $ahead = git rev-list --count @{u}..HEAD 2>$null
    $behind = git rev-list --count HEAD..@{u} 2>$null
    if ($ahead -gt 0) {
        Write-Host "Ahead of remote: $ahead commits" -ForegroundColor Green
    }
    if ($behind -gt 0) {
        Write-Host "Behind remote: $behind commits" -ForegroundColor Yellow
    }
}
Write-Host ""

# Show recent commits
Write-Host "📜 Recent Commits:" -ForegroundColor Yellow
git log --oneline -5
Write-Host ""

# Show file statistics
Write-Host "📈 Change Statistics:" -ForegroundColor Yellow
git diff --stat
Write-Host ""

# Ask for confirmation
Write-Host "⚠️  READY TO COMMIT AND PUSH?" -ForegroundColor Yellow
Write-Host ""
Write-Host "This will:" -ForegroundColor White
Write-Host "  1. Stage all modified and new files" -ForegroundColor Gray
Write-Host "  2. Create a commit with descriptive message" -ForegroundColor Gray
Write-Host "  3. Push to origin/$currentBranch" -ForegroundColor Gray
Write-Host ""
$confirm = Read-Host "Continue? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "❌ Cancelled by user" -ForegroundColor Red
    exit 0
}

# Stage all changes
Write-Host ""
Write-Host "📦 Staging files..." -ForegroundColor Cyan
git add -A
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error staging files!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Files staged" -ForegroundColor Green

# Show what will be committed
Write-Host ""
Write-Host "📋 Files to be committed:" -ForegroundColor Yellow
git status --short
Write-Host ""

# Create commit message
$commitMessage = @"
feat: Complete Crypto Lab implementation with 24 components and 7 services

Major Features:
- Add comprehensive Crypto Lab with portfolio tracking, markets, bots, research
- Implement unified Project Flow system (Kanban board)
- Enhance Idea Lab with AI generation, voting, tags, priorities
- Add centralized API key management (site-wide sharing)
- Integrate PM2 for permanent server solution

Changes:
- Add 30+ new files (Crypto Lab components, services, Project Flow)
- Update 36 existing files (Idea Lab, API keys, navigation)
- Fix IndexedDB storage issues (business_models store)
- Update feature flags and labs config
- Add PM2 configuration and scripts

Statistics:
- ~4,308 lines added
- ~919 lines removed
- Net: +3,389 lines
"@

# Commit
Write-Host "💾 Creating commit..." -ForegroundColor Cyan
git commit -m $commitMessage
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error creating commit!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Commit created" -ForegroundColor Green

# Show commit
Write-Host ""
Write-Host "📝 Latest commit:" -ForegroundColor Yellow
git log -1 --stat
Write-Host ""

# Push to remote
Write-Host "🚀 Pushing to remote..." -ForegroundColor Cyan
git push origin $currentBranch
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error pushing to remote!" -ForegroundColor Red
    Write-Host "💡 You may need to pull first or resolve conflicts" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Pushed to origin/$currentBranch" -ForegroundColor Green

Write-Host ""
Write-Host "✅ Git sync complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Review changes on GitHub" -ForegroundColor White
Write-Host "  2. Create Pull Request if needed" -ForegroundColor White
Write-Host "  3. Have another agent inspect the code" -ForegroundColor White
Write-Host ""

