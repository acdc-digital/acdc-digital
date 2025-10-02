"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  WebPreview,
  WebPreviewNavigation,
  WebPreviewUrl,
  WebPreviewBody,
} from "@/components/ai/web-preview";
import { MapOverlay } from "@/components/ai/map-overlay";

export default function GrapesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-24">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-6xl font-bold">
            🍇 Grapes
          </h1>
          <p className="text-xl text-muted-foreground">
            Preview AI-generated websites like v0.dev's live viewer
          </p>
          <p className="text-muted-foreground">
            React iframe component with navigation controls, TypeScript, and shadcn/ui design.
            Built for Next.js applications with real-time preview capabilities.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/demo">
              <Button size="lg" className="gap-2">
                View Demo
                <span>→</span>
              </Button>
            </Link>
            <Button size="lg" variant="outline" asChild>
              <a 
                href="https://github.com/acdc-digital/acdc-digital/tree/main/grapes"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Code
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Example */}
      <div className="container mx-auto px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Interactive Preview
          </h2>
          <div className="mb-4 p-4 rounded-lg bg-muted/30 border border-border">
            <p className="text-sm text-muted-foreground mb-2">
              <strong>Note:</strong> Many sites (Google.com, Facebook, GitHub, etc.) block iframe embedding with X-Frame-Options.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>✅ Works:</strong> <code className="text-primary">example.com</code>, <code className="text-primary">wikipedia.org</code>, 
              and <strong>Google Maps embeds</strong> (use Share → Embed a map)
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              <strong>🎨 Try it:</strong> Click the Square or Circle buttons to draw shapes on the map!
            </p>
          </div>
          <MapOverlay className="h-[600px]">
            <WebPreview
              defaultUrl="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d37753152.88948594!2d-113.9330634!3d56.130366!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4b0d03d337cc6ad9%3A0x9968b72aa2438fa5!2sCanada!5e0!3m2!1sen!2sus!4v1696348800000!5m2!1sen!2sus"
              locked={true}
              className="h-full"
            >
              <WebPreviewNavigation>
                <WebPreviewUrl />
              </WebPreviewNavigation>
              <WebPreviewBody />
            </WebPreview>
          </MapOverlay>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold mb-8 text-center">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="text-4xl">🔒</div>
              <h3 className="text-lg font-semibold">Safe Sandboxing</h3>
              <p className="text-sm text-muted-foreground">
                Iframe-based preview with controlled sandbox permissions for secure embedding
              </p>
            </div>
            <div className="space-y-3">
              <div className="text-4xl">⌨️</div>
              <h3 className="text-lg font-semibold">Keyboard Navigation</h3>
              <p className="text-sm text-muted-foreground">
                Press Enter to navigate, Tab between controls, full keyboard support
              </p>
            </div>
            <div className="space-y-3">
              <div className="text-4xl">🎨</div>
              <h3 className="text-lg font-semibold">Modern Design</h3>
              <p className="text-sm text-muted-foreground">
                Built with shadcn/ui components and Modern Minimal theme
              </p>
            </div>
            <div className="space-y-3">
              <div className="text-4xl">🔄</div>
              <h3 className="text-lg font-semibold">History Support</h3>
              <p className="text-sm text-muted-foreground">
                Back/forward navigation with full history tracking
              </p>
            </div>
            <div className="space-y-3">
              <div className="text-4xl">⚡️</div>
              <h3 className="text-lg font-semibold">TypeScript First</h3>
              <p className="text-sm text-muted-foreground">
                Fully typed API with React context-based state management
              </p>
            </div>
            <div className="space-y-3">
              <div className="text-4xl">🤖</div>
              <h3 className="text-lg font-semibold">AI-Ready</h3>
              <p className="text-sm text-muted-foreground">
                Perfect for previewing AI-generated UIs from v0, Claude, or custom tools
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
