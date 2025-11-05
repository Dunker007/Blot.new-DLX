#!/bin/bash
# Create archive tags for repositories before deletion
# Run this BEFORE deleting repositories

echo "🏷️  Creating archive tags for repositories..."
echo ""

REPOS=(
    "Blot.new-DLX"
    "DLX-3.0"
    "DLX-Ultra"
    "DLX-Ultra-2"
    "DLX-Command-Center-LUX-2.0"
)

TAG_NAME="archive/$(date +%Y-%m-%d)-pre-consolidation"

for repo in "${REPOS[@]}"; do
    echo "Processing: $repo"
    cd "C:/Repos GIT/$repo" 2>/dev/null || {
        echo "  ⚠️  Repository not found: $repo"
        continue
    }
    
    # Create tag
    git tag "$TAG_NAME" 2>/dev/null && echo "  ✅ Tag created: $TAG_NAME" || echo "  ⚠️  Tag creation failed or already exists"
    
    # Push tag
    git push origin "$TAG_NAME" 2>/dev/null && echo "  ✅ Tag pushed" || echo "  ⚠️  Tag push failed (may need manual push)"
    
    echo ""
done

echo "✅ Archive tags created!"
echo ""
echo "Next steps:"
echo "  1. Archive repositories on GitHub (Settings → Archive)"
echo "  2. Run cleanup script to delete local repos"

