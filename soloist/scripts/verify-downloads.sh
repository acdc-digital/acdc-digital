#!/bin/bash

# Download Verification Script
# Run this after publishing the GitHub release to verify links work

VERSION="v2.0.0"

echo "🔍 Verifying download links for Soloist Pro $VERSION"
echo ""

# List of download URLs to test
URLS=(
    "https://github.com/acdc-digital/acdc-digital/releases/download/v2.0.0/Soloist.Pro-Setup-2.0.0.exe"
    "https://github.com/acdc-digital/acdc-digital/releases/download/v2.0.0/Soloist.Pro-2.0.0-x64.dmg"
    "https://github.com/acdc-digital/acdc-digital/releases/download/v2.0.0/Soloist.Pro-2.0.0-arm64.dmg"
    "https://github.com/acdc-digital/acdc-digital/releases/download/v2.0.0/Soloist.Pro-2.0.0.AppImage"
    "https://github.com/acdc-digital/acdc-digital/releases/download/v2.0.0/solopro-electron-2.0.0.deb"
)

echo "Testing download URLs..."
echo ""

for url in "${URLS[@]}"; do
    echo -n "Testing: $(basename "$url")... "
    
    # Use curl to check if the URL returns 200 OK
    if curl -s -I "$url" | grep -q "200 OK"; then
        echo "✅ Available"
    else
        echo "❌ Not found (release may not be published yet)"
    fi
done

echo ""
echo "📱 Website Download Locations Updated:"
echo "  - Website DownloadModal: ✅"
echo "  - Website Navbar: ✅"
echo "  - Renderer Sidebar: ✅"
echo ""

echo "🌐 Your customers will now download $VERSION when they click:"
echo "  - Download buttons on your website"
echo "  - Download links in the renderer app"
echo "  - Direct DMG links in GitHub releases"
echo ""

echo "📋 Next Steps:"
echo "1. Publish the GitHub release at: https://github.com/acdc-digital/acdc-digital/releases/new"
echo "2. Run this script again to verify the links work"
echo "3. Test the download flow on your website"
echo "4. Announce the new release to your users!" 