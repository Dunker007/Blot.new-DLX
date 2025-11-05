# Repository Consolidation Script

## Quick Reference

### Repositories to Keep
1. **DLX-Studios-Ultimate** - Primary (keep & enhance)
2. **dlxstudios-ai** - Marketing site (keep separate)

### Repositories to Archive/Delete

#### Safe to Delete (Minimal/Template Code)
- `DLX-Cognitive-Co-Pilot` (0 MB - empty/template)
- `DLX-Cognitive-Co-Pilot-` (0.06 MB - template)
- `Dunkerlux-shell` (0.14 MB - check first)

#### Archive Then Delete (Superseded)
- `Blot.new-DLX` (186 MB - older version of Ultimate)
- `DLX-3.0` (0.28 MB - features being ported)
- `DLX-Ultra` (0.12 MB - features being ported)
- `DLX-Ultra-2` (0.1 MB - features being ported)
- `DLX-Command-Center-LUX-2.0` (0.08 MB - features being ported)

## Git Cleanup Commands

### Before Deleting - Create Archive Tags
```bash
cd "C:\Repos GIT\Blot.new-DLX"
git tag archive/2025-11-05-pre-consolidation
git push origin archive/2025-11-05-pre-consolidation

cd "C:\Repos GIT\DLX-3.0"
git tag archive/2025-11-05-pre-consolidation
git push origin archive/2025-11-05-pre-consolidation

# Repeat for DLX-Ultra, DLX-Ultra-2, DLX-Command-Center-LUX-2.0
```

### After Features Extracted - Delete Local Repos
```powershell
# Archive first, then delete locally
Remove-Item -Recurse -Force "C:\Repos GIT\DLX-Cognitive-Co-Pilot"
Remove-Item -Recurse -Force "C:\Repos GIT\DLX-Cognitive-Co-Pilot-"
Remove-Item -Recurse -Force "C:\Repos GIT\Dunkerlux-shell"  # After checking

# After archiving on GitHub
Remove-Item -Recurse -Force "C:\Repos GIT\Blot.new-DLX"
Remove-Item -Recurse -Force "C:\Repos GIT\DLX-3.0"
Remove-Item -Recurse -Force "C:\Repos GIT\DLX-Ultra"
Remove-Item -Recurse -Force "C:\Repos GIT\DLX-Ultra-2"
Remove-Item -Recurse -Force "C:\Repos GIT\DLX-Command-Center-LUX-2.0"
```

### GitHub Archive Instructions
1. Go to each repository on GitHub
2. Settings → Archive this repository
3. Add note: "Archived - Features consolidated into DLX-Studios-Ultimate"

