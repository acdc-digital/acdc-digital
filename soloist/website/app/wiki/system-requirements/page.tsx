"use client";

import React from "react";
import { Monitor, Apple, Package, HardDrive, Cpu, Download } from "lucide-react";

export default function SystemRequirementsPage() {
  return (
    <div className="max-w-4xl ml-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold tracking-tight mb-4">System Requirements</h1>
        <p className="text-xl text-muted-foreground">
          Desktop application requirements and download information
        </p>
      </div>

      {/* Introduction */}
      <section className="mb-16">
        <p className="text-lg text-foreground/80 mb-4 leading-relaxed">
          Soloist is available as a native desktop application for Windows, macOS, and Linux. 
          The desktop app provides the best experience with offline support, faster performance, 
          and system integration.
        </p>
        <p className="text-lg text-foreground/80 leading-relaxed">
          Before downloading, please ensure your system meets the minimum requirements below.
        </p>
      </section>

      {/* Windows Requirements */}
      <section id="windows" className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Monitor className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-3xl font-bold">Windows</h2>
        </div>

        <div className="space-y-6 ml-13">
          <div className="border-l-2 border-primary/20 pl-6 py-2">
            <h3 className="text-xl font-semibold mb-3">Minimum Requirements</h3>
            <ul className="space-y-2 text-foreground/80">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Operating System:</strong> Windows 10 or later (64-bit)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>RAM:</strong> 4GB minimum (8GB recommended)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Storage:</strong> 200MB available space</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Display:</strong> 1280x720 minimum resolution</span>
              </li>
            </ul>
          </div>

          <div className="border-l-2 border-primary/20 pl-6 py-2">
            <h3 className="text-xl font-semibold mb-3">Download</h3>
            <p className="text-foreground/80 mb-3 leading-relaxed">
              Download the Windows installer (.exe) from the download buttons on the homepage 
              (requires active subscription).
            </p>
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                <strong>File:</strong> Soloist.Pro-Setup-2.0.0.exe<br />
                <strong>Architecture:</strong> 64-bit (x64)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* macOS Requirements */}
      <section id="macos" className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Apple className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-3xl font-bold">macOS</h2>
        </div>

        <div className="space-y-6 ml-13">
          <div className="border-l-2 border-primary/20 pl-6 py-2">
            <h3 className="text-xl font-semibold mb-3">Minimum Requirements</h3>
            <ul className="space-y-2 text-foreground/80">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Operating System:</strong> macOS 10.15 (Catalina) or later</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Processor:</strong> Intel or Apple Silicon (M1/M2/M3)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>RAM:</strong> 4GB minimum (8GB recommended)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Storage:</strong> 200MB available space</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Display:</strong> 1280x720 minimum resolution</span>
              </li>
            </ul>
          </div>

          <div className="border-l-2 border-primary/20 pl-6 py-2">
            <h3 className="text-xl font-semibold mb-3">Download</h3>
            <p className="text-foreground/80 mb-3 leading-relaxed">
              Download the macOS disk image (.dmg) from the download buttons on the homepage 
              (requires active subscription).
            </p>
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                <strong>File:</strong> Soloist.Pro-2.0.0-x64.dmg<br />
                <strong>Compatibility:</strong> Universal (Intel & Apple Silicon)
              </p>
            </div>
          </div>

          <div className="border-l-2 border-primary/20 pl-6 py-2">
            <h3 className="text-xl font-semibold mb-3">Installation Notes</h3>
            <p className="text-foreground/80 leading-relaxed">
              On first launch, you may see a security warning because the app is not from the Mac App Store. 
              Right-click the app icon and select "Open" to bypass this. This is a standard security feature for 
              apps distributed outside the App Store.
            </p>
          </div>
        </div>
      </section>

      {/* Linux Requirements */}
      <section id="linux" className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-3xl font-bold">Linux</h2>
        </div>

        <div className="space-y-6 ml-13">
          <div className="border-l-2 border-primary/20 pl-6 py-2">
            <h3 className="text-xl font-semibold mb-3">Minimum Requirements</h3>
            <ul className="space-y-2 text-foreground/80">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Distribution:</strong> 64-bit distribution (Ubuntu, Fedora, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>RAM:</strong> 4GB minimum (8GB recommended)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Storage:</strong> 200MB available space</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Display:</strong> 1280x720 minimum resolution</span>
              </li>
            </ul>
          </div>

          <div className="border-l-2 border-primary/20 pl-6 py-2">
            <h3 className="text-xl font-semibold mb-3">Download</h3>
            <p className="text-foreground/80 mb-3 leading-relaxed">
              We provide an AppImage for Linux, which works on most distributions without installation.
            </p>
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                <strong>File:</strong> Soloist.Pro-2.0.0.AppImage<br />
                <strong>Architecture:</strong> 64-bit (x64)
              </p>
            </div>
          </div>

          <div className="border-l-2 border-primary/20 pl-6 py-2">
            <h3 className="text-xl font-semibold mb-3">Running the AppImage</h3>
            <ol className="space-y-2 text-foreground/80 list-decimal list-inside">
              <li>Download the .AppImage file</li>
              <li>Make it executable: <code className="bg-muted px-2 py-1 rounded text-sm">chmod +x Soloist.Pro-2.0.0.AppImage</code></li>
              <li>Run it: <code className="bg-muted px-2 py-1 rounded text-sm">./Soloist.Pro-2.0.0.AppImage</code></li>
            </ol>
          </div>
        </div>
      </section>

      {/* General Information */}
      <section id="general" className="mb-16">
        <h2 className="text-3xl font-bold mb-6">General Information</h2>

        <div className="space-y-6">
          <div className="border-l-2 border-primary/20 pl-6 py-2">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Subscription Required
            </h3>
            <p className="text-foreground/80 leading-relaxed">
              An active Soloist subscription is required to download and use the desktop application. 
              The download buttons on the homepage are enabled only for subscribed users.
            </p>
          </div>

          <div className="border-l-2 border-primary/20 pl-6 py-2">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" />
              Performance
            </h3>
            <p className="text-foreground/80 mb-3 leading-relaxed">
              While the minimum requirements above will run Soloist, we recommend:
            </p>
            <ul className="space-y-2 text-foreground/80">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>8GB RAM for optimal performance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>SSD storage for faster app launch and data access</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Stable internet connection for syncing and AI features</span>
              </li>
            </ul>
          </div>

          <div className="border-l-2 border-primary/20 pl-6 py-2">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-primary" />
              Web Version
            </h3>
            <p className="text-foreground/80 leading-relaxed">
              If your system doesn't meet the requirements or you prefer not to install software, 
              you can use the web version at{" "}
              <a 
                href="https://soloist-app.acdc.digital" 
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                soloist-app.acdc.digital
              </a>. 
              The web version offers most features with the added benefit of working on any modern browser.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="pt-8 border-t border-border mb-16">
        <p className="text-sm text-muted-foreground leading-relaxed">
          For questions about system compatibility or download issues, please contact support 
          or visit our GitHub repository for technical documentation.
        </p>
      </section>
    </div>
  );
}
