#!/bin/bash

# GitHub Release Creation Script for Soloist Pro v2.0.0
# This script helps create a new GitHub release with the built files

VERSION="v2.0.0"
RELEASE_TITLE="SoloPro v2.0.0 - Major Release"
RELEASE_NOTES="## 🚀 SoloPro v2.0.0 - Major Release

### ✨ What's New
- ✅ **New Monorepo Structure** - Reorganized project under acdc-digital/acdc-digital
- ✅ **Enhanced Dashboard UI** - Reorganized dashboard with improved navigation
- ✅ **Full-Page Help System** - Comprehensive help documentation with table of contents
- ✅ **Integrated Feedback** - Embedded feedback form in the help section

### 🔧 Technical Improvements
- ✅ **Version 2.0.0** - Major version bump with updated repository structure
- ✅ **Updated Release Process** - GitHub Actions workflow for automated builds
- ✅ **Build Verification** - Ensure all platform builds are complete before release

### 📦 Downloads
Choose the right version for your platform:
- **Windows**: \`Soloist.Pro-Setup-2.0.0.exe\`
- **macOS Intel**: \`Soloist.Pro-2.0.0-x64.dmg\`
- **macOS Apple Silicon**: \`Soloist.Pro-2.0.0-arm64.dmg\`
- **Linux AppImage**: \`Soloist.Pro-2.0.0.AppImage\`
- **Ubuntu/Debian**: \`solopro-electron-2.0.0.deb\`

---

**Full Changelog**: https://github.com/acdc-digital/acdc-digital/compare/v1.6.6...v2.0.0"

echo "🚀 Creating GitHub Release for $VERSION"
echo ""

# Check if we have the built files
if [ ! -f "electron/dist/Soloist.Pro-2.0.0-x64.dmg" ]; then
    echo "❌ Intel DMG not found. Please build first with: cd electron && npm run build:mac"
    exit 1
fi

if [ ! -f "electron/dist/Soloist.Pro-2.0.0-arm64.dmg" ]; then
    echo "❌ Apple Silicon DMG not found. Please build first with: cd electron && npm run build:mac"
    exit 1
fi

echo "✅ Found required files:"
echo "  - Soloist.Pro-2.0.0-x64.dmg ($(du -h electron/dist/Soloist.Pro-2.0.0-x64.dmg | cut -f1))"
echo "  - Soloist.Pro-2.0.0-arm64.dmg ($(du -h electron/dist/Soloist.Pro-2.0.0-arm64.dmg | cut -f1))"
echo ""

echo "📋 Manual Steps to Complete:"
echo ""
echo "1. Go to: https://github.com/acdc-digital/acdc-digital/releases/new"
echo ""
echo "2. Fill in the form:"
echo "   - Tag version: $VERSION"
echo "   - Release title: $RELEASE_TITLE"
echo "   - Description: Copy the release notes below"
echo ""
echo "3. Upload these files:"
echo "   📁 Windows:"
echo "     - electron/dist/Soloist.Pro-Setup-2.0.0.exe"
echo "     - electron/dist/Soloist.Pro-Setup-2.0.0.exe.blockmap"
echo "   📁 macOS:"
echo "     - electron/dist/Soloist.Pro-2.0.0-x64.dmg"
echo "     - electron/dist/Soloist.Pro-2.0.0-arm64.dmg"
echo "     - electron/dist/Soloist.Pro-2.0.0-x64.dmg.blockmap"
echo "     - electron/dist/Soloist.Pro-2.0.0-arm64.dmg.blockmap"
echo "   📁 Linux:"
echo "     - electron/dist/Soloist.Pro-2.0.0.AppImage"
echo "     - electron/dist/solopro-electron-2.0.0.deb"
echo ""
echo "4. Click 'Publish release'"
echo ""
echo "📝 Release Notes (copy this):"
echo "================================"
echo "$RELEASE_NOTES"
echo "================================"
echo ""
echo "🌐 After publishing, your download links will work at:"
echo "   - https://github.com/acdc-digital/acdc-digital/releases/download/v2.0.0/Soloist.Pro-2.0.0-x64.dmg"
echo "   - https://github.com/acdc-digital/acdc-digital/releases/download/v2.0.0/Soloist.Pro-2.0.0-arm64.dmg"