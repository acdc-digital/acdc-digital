"use client";

import { TableOfContents } from "../_components/TableOfContents";
import Image from "next/image";

export default function BrandPage() {
  const sections = [
    { id: "philosophy", title: "Brand Philosophy", count: 4 },
    { id: "symbolism", title: "Brand Symbolism", count: 1 },
    { id: "logo-system", title: "Logo System", count: 6 },
    { id: "color-palette", title: "Color Palette", count: 5 },
    { id: "typography", title: "Typography", count: 2 },
    { id: "grid-structure", title: "Grid & Structure", count: 3 },
    { id: "motion-identity", title: "Motion Identity", count: 3 },
    { id: "brand-voice", title: "Brand Voice", count: 4 },
    { id: "applications", title: "Applications", count: 4 },
    { id: "taglines", title: "Taglines", count: 2 },
    { id: "usage-rules", title: "Usage Rules", count: 8 },
    { id: "closing", title: "Closing Thought", count: 1 },
  ];

  return (
    <div className="flex gap-8 max-w-7xl mx-auto">
      {/* Main Content */}
      <div className="flex-1 max-w-4xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-4 border-b pb-6">
            <h1 className="text-4xl font-bold tracking-tight">Soloist Brand Guidelines</h1>
            <p className="text-lg text-muted-foreground">
              A comprehensive guide to the Soloist brand identity, philosophy, and visual system.
            </p>
          </div>

          {/* Brand Philosophy */}
          <section id="philosophy" className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight">Brand Philosophy</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed">
                Soloist represents the individual journey — the pursuit of progress, the rhythm of effort, 
                and the quiet rebellion of standing apart in a world that measures everything. At its core, 
                Soloist celebrates self-mastery through daily momentum, transforming personal data, 
                reflection, and self-discipline into visual rhythm.
              </p>
              <p className="text-base leading-relaxed mt-4">
                The Soloist identity is built on four fundamental pillars:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 not-prose">
                <div className="p-6 border rounded-lg bg-card">
                  <h3 className="text-lg font-semibold mb-2">Individuality</h3>
                  <p className="text-sm text-muted-foreground">The power of one. Celebrating the singular journey of self-discovery and personal growth.</p>
                </div>
                <div className="p-6 border rounded-lg bg-card">
                  <h3 className="text-lg font-semibold mb-2">Persistence</h3>
                  <p className="text-sm text-muted-foreground">Daily struggle toward progress. Honoring the consistent effort that builds mastery over time.</p>
                </div>
                <div className="p-6 border rounded-lg bg-card">
                  <h3 className="text-lg font-semibold mb-2">Contrast</h3>
                  <p className="text-sm text-muted-foreground">The beauty of standing out amid systems and structure. Finding your unique rhythm in a measured world.</p>
                </div>
                <div className="p-6 border rounded-lg bg-card">
                  <h3 className="text-lg font-semibold mb-2">Balance</h3>
                  <p className="text-sm text-muted-foreground">Between chaos and control, system and self. Navigating the tension between structure and spontaneity.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Brand Symbolism */}
          <section id="symbolism" className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight">Brand Symbolism</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed">
                At the heart of Soloist is the <strong>circle</strong> — a universal symbol of wholeness, 
                time, and repetition. Inside it lives the <strong className="text-[#EF4444]">Solo Dot</strong> — 
                the small, vibrant red circle representing the individual within their environment.
              </p>
              <div className="my-8 p-8 border rounded-lg bg-muted/30">
                <div className="flex items-center justify-center mb-6">
                  <Image
                    src="/SoloLogo.png"
                    alt="Soloist Logo"
                    width={200}
                    height={200}
                    className="object-contain"
                  />
                </div>
                <p className="text-center text-sm text-muted-foreground italic">
                  "One person navigating systems larger than themselves — struggling, growing, and defining their own rhythm."
                </p>
              </div>
              <p className="text-base leading-relaxed">
                This contrast — one small red dot within, against, or among larger circles — captures 
                the Soloist story. It's a visual metaphor for the human experience of navigating complex 
                systems while maintaining individual identity and purpose.
              </p>
            </div>
          </section>

          {/* Logo System */}
          <section id="logo-system" className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight">Logo System Overview</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed">
                The Soloist logo system is intentionally modular. Each version conveys a stage of the 
                Soloist journey and can be used contextually across brand materials.
              </p>
              
              <div className="my-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Variation</th>
                      <th className="text-left py-3 px-4 font-semibold">Description</th>
                      <th className="text-left py-3 px-4 font-semibold">Use Case</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Complex System</td>
                      <td className="py-3 px-4">Multiple circles in a boundary with a small red dot — represents complexity, chaos, and the starting point of self-awareness.</td>
                      <td className="py-3 px-4 text-muted-foreground">Conceptual illustrations, onboarding visuals, storytelling moments.</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Black Universe</td>
                      <td className="py-3 px-4">Solid dark circle with a contrasting white core — symbolizes the overwhelming world and the hidden potential within.</td>
                      <td className="py-3 px-4 text-muted-foreground">Dark-mode backgrounds, hero images, deep narrative visuals.</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Interconnected</td>
                      <td className="py-3 px-4">Overlapping transparent circles — represents systems, networks, and the harmony between competing influences.</td>
                      <td className="py-3 px-4 text-muted-foreground">Product illustrations, contextual visuals, data visualizations.</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Emerging Soloist</td>
                      <td className="py-3 px-4">Larger main boundary, clear red dot within — balance of order and rebellion.</td>
                      <td className="py-3 px-4 text-muted-foreground">Alternate mark, UI iconography, light-mode lockup.</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Minimal Mark</td>
                      <td className="py-3 px-4">Simplified circle with one red dot — the brand's primary identity.</td>
                      <td className="py-3 px-4 text-muted-foreground">Core logo for product, favicon, social avatars, app icon.</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Inverted Growth</td>
                      <td className="py-3 px-4">Inverse composition — red dominant, white secondary — representing transformation and mastery.</td>
                      <td className="py-3 px-4 text-muted-foreground">Achievement visuals, promotional material, milestone states.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Color Palette */}
          <section id="color-palette" className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight">Color Palette</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed mb-6">
                Soloist's palette is intentional — a dialogue between neutrality, clarity, and intensity.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
                <div className="border rounded-lg overflow-hidden">
                  <div className="h-24 bg-[#EF4444]"></div>
                  <div className="p-4 bg-card">
                    <h4 className="font-semibold text-sm mb-1">Solo Red</h4>
                    <p className="text-xs text-muted-foreground mb-2">#EF4444</p>
                    <p className="text-sm">Passion, focus, individuality. The heartbeat of the brand.</p>
                  </div>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <div className="h-24 bg-[#171717]"></div>
                  <div className="p-4 bg-card">
                    <h4 className="font-semibold text-sm mb-1">Neutral 900</h4>
                    <p className="text-xs text-muted-foreground mb-2">#171717</p>
                    <p className="text-sm">Structure, depth, and control. Used for dark mode and contrast.</p>
                  </div>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <div className="h-24 bg-[#262626]"></div>
                  <div className="p-4 bg-card">
                    <h4 className="font-semibold text-sm mb-1">Neutral 800</h4>
                    <p className="text-xs text-muted-foreground mb-2">#262626</p>
                    <p className="text-sm">Balance tone for UI surfaces and shadows.</p>
                  </div>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <div className="h-24 bg-[#404040]"></div>
                  <div className="p-4 bg-card">
                    <h4 className="font-semibold text-sm mb-1">Neutral 700</h4>
                    <p className="text-xs text-muted-foreground mb-2">#404040</p>
                    <p className="text-sm">Supporting tone for grid lines, borders, and secondary elements.</p>
                  </div>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <div className="h-24 bg-[#FFFFFF]"></div>
                  <div className="p-4 bg-card">
                    <h4 className="font-semibold text-sm mb-1">White</h4>
                    <p className="text-xs text-muted-foreground mb-2">#FFFFFF</p>
                    <p className="text-sm">Clarity, openness, and possibility.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Typography */}
          <section id="typography" className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight">Typography</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed">
                Soloist typography should express clarity and confidence. Use sans-serif typefaces 
                with clean geometry and open spacing.
              </p>
              
              <div className="my-6 space-y-4 not-prose">
                <div className="p-6 border rounded-lg bg-card">
                  <p className="text-sm text-muted-foreground mb-2">Primary Typeface</p>
                  <p className="text-2xl font-semibold mb-1">Inter / Satoshi</p>
                  <p className="text-sm text-muted-foreground">Used for headings, UI elements, and primary content</p>
                </div>
                
                <div className="p-6 border rounded-lg bg-card">
                  <p className="text-sm text-muted-foreground mb-2">Secondary / Accent</p>
                  <p className="text-2xl font-medium mb-1">DM Sans / Space Grotesk</p>
                  <p className="text-sm text-muted-foreground">Used for subheadings and emphasis</p>
                </div>
              </div>
              
              <p className="text-base leading-relaxed">
                Typography should emphasize calm structure — minimal uppercase, intentional hierarchy, 
                and generous breathing space.
              </p>
            </div>
          </section>

          {/* Grid & Structure */}
          <section id="grid-structure" className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight">Grid & Structure</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed">
                The grid is not decoration — it's part of the brand's identity. It symbolizes measurement, 
                reflection, and daily rhythm — echoing the Soloist Heatmap itself.
              </p>
              
              <div className="my-6 p-6 border rounded-lg bg-card space-y-3">
                <h4 className="font-semibold text-sm">Grid Principles:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-[#EF4444] mt-1">•</span>
                    <span>Maintain a visible grid (5–10% opacity) when referencing structure or process</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#EF4444] mt-1">•</span>
                    <span>Use neutral 700–800 lines for light mode, white 10% opacity lines for dark mode</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#EF4444] mt-1">•</span>
                    <span>The red dot should never align perfectly — its slight offset embodies persistence and imperfection</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Motion Identity */}
          <section id="motion-identity" className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight">Motion Identity</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed">
                Motion brings the Soloist to life. The small red dot should move as if it's bouncing 
                against constraints — a metaphor for effort, tension, and persistence.
              </p>
              
              <div className="my-6 space-y-4">
                <div className="p-6 border rounded-lg bg-card">
                  <h4 className="font-semibold text-sm mb-3">Motion Principles:</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <strong className="text-[#EF4444]">Movement:</strong>
                      <p className="text-muted-foreground mt-1">Asymmetric, rhythmic, persistent</p>
                    </div>
                    <div>
                      <strong className="text-[#EF4444]">Easing:</strong>
                      <p className="text-muted-foreground mt-1">"Ease Out Back" or "Ease In-Out" — natural, never mechanical</p>
                    </div>
                    <div>
                      <strong className="text-[#EF4444]">Behavior:</strong>
                      <p className="text-muted-foreground mt-1">The dot may struggle, bounce, or pulse — but it always continues</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 border rounded-lg bg-muted/30">
                  <p className="text-sm font-mono text-muted-foreground mb-2">Example Framer Motion behavior:</p>
                  <pre className="text-xs bg-background p-4 rounded overflow-x-auto">
{`// Small dot bounces irregularly within its boundary
scale: [1, 0.95, 1.05, 1]
// Stretching slightly upon impact
// Infinite loop with easing transitions
repeatType: "mirror"`}
                  </pre>
                </div>
              </div>
              
              <p className="text-base leading-relaxed">
                This conveys that Soloist is alive, resilient, and self-aware.
              </p>
            </div>
          </section>

          {/* Brand Voice */}
          <section id="brand-voice" className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight">Brand Voice</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed">
                Soloist speaks with clarity, empathy, and precision.
              </p>
              
              <div className="my-6 grid grid-cols-2 md:grid-cols-4 gap-4 not-prose">
                <div className="p-4 border rounded-lg text-center bg-card">
                  <p className="font-semibold text-sm">Reflective</p>
                </div>
                <div className="p-4 border rounded-lg text-center bg-card">
                  <p className="font-semibold text-sm">Empowering</p>
                </div>
                <div className="p-4 border rounded-lg text-center bg-card">
                  <p className="font-semibold text-sm">Data-aware</p>
                </div>
                <div className="p-4 border rounded-lg text-center bg-card">
                  <p className="font-semibold text-sm">Human</p>
                </div>
              </div>
              
              <div className="my-6 p-6 border rounded-lg bg-muted/30">
                <h4 className="font-semibold text-sm mb-3">Communication Guidelines:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-[#EF4444] mt-1">•</span>
                    <span>Focus on journey, progress, and awareness</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#EF4444] mt-1">•</span>
                    <span>Avoid over-promising results — instead, emphasize growth through understanding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#EF4444] mt-1">•</span>
                    <span>Speak to the individual, not the masses</span>
                  </li>
                </ul>
              </div>
              
              <div className="my-6 p-8 border-l-4 border-[#EF4444] bg-card">
                <p className="text-lg italic">"Every day is data. Every reflection is progress."</p>
              </div>
            </div>
          </section>

          {/* Application Examples */}
          <section id="applications" className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight">Application Examples</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <div className="my-6 space-y-3">
                <div className="p-4 border rounded-lg bg-card">
                  <strong className="text-sm">App Icon:</strong>
                  <p className="text-sm text-muted-foreground mt-1">Minimal mark variant with red dot offset</p>
                </div>
                <div className="p-4 border rounded-lg bg-card">
                  <strong className="text-sm">Splash Screen:</strong>
                  <p className="text-sm text-muted-foreground mt-1">Animated version with red dot bouncing</p>
                </div>
                <div className="p-4 border rounded-lg bg-card">
                  <strong className="text-sm">Marketing Assets:</strong>
                  <p className="text-sm text-muted-foreground mt-1">Complex System or Inverted Growth variants with subtle grid overlay</p>
                </div>
                <div className="p-4 border rounded-lg bg-card">
                  <strong className="text-sm">Data Visualizations:</strong>
                  <p className="text-sm text-muted-foreground mt-1">Use circular motifs and red accents to reflect rhythm and intensity</p>
                </div>
              </div>
            </div>
          </section>

          {/* Taglines */}
          <section id="taglines" className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight">Brand Taglines</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <div className="my-6 space-y-4">
                <div className="p-6 border rounded-lg bg-gradient-to-br from-muted to-card">
                  <p className="text-xl font-semibold text-center">"Progress has rhythm."</p>
                </div>
                <div className="p-6 border rounded-lg bg-gradient-to-br from-card to-muted">
                  <p className="text-xl font-semibold text-center">"Your data, your rhythm."</p>
                </div>
              </div>
            </div>
          </section>

          {/* Usage Rules */}
          <section id="usage-rules" className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight">Usage Rules</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <div className="my-6 p-6 border rounded-lg bg-card space-y-3">
                <h4 className="font-semibold text-sm mb-4">Do's and Don'ts:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold text-green-600 mb-3">✓ DO</p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">•</span>
                        <span>Maintain circle proportions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">•</span>
                        <span>Ensure red dot contrasts visibly</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">•</span>
                        <span>Respect negative space</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">•</span>
                        <span>Use flat, confident color planes</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-red-600 mb-3">✗ DON'T</p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-red-600">•</span>
                        <span>Distort circle proportions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600">•</span>
                        <span>Add drop shadows or gradients</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600">•</span>
                        <span>Add text within the circular logo</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600">•</span>
                        <span>Use low-contrast color combinations</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Closing Thought */}
          <section id="closing" className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight">Closing Thought</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <div className="my-6 p-8 border rounded-lg bg-gradient-to-br from-muted/50 to-card">
                <p className="text-base leading-relaxed">
                  Soloist is more than a product — it's a philosophy of measured progress. 
                  Every motion, every mark, every red dot is a reminder that growth is not linear — 
                  it's rhythmic, imperfect, and deeply human.
                </p>
              </div>
              <p className="text-base leading-relaxed mt-6">
                The Soloist brand exists to empower individuals on their journey of self-mastery. 
                Through thoughtful design, clear communication, and empathetic understanding, we create 
                tools that help people see themselves more clearly, track their progress authentically, 
                and embrace the beautiful complexity of their own rhythm.
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Right Sidebar - Table of Contents */}
      <TableOfContents sections={sections} />
    </div>
  );
}
