"use client";

import { TableOfContents } from "../_components/TableOfContents";
import Image from "next/image";

export default function BrandPage() {
  const sections = [
    { id: "philosophy", title: "Brand Philosophy", count: 4 },
    { id: "symbolism", title: "Brand Symbolism", count: 1 },
    { id: "logo-system", title: "Logo System", count: 6 },
    { id: "product-identity", title: "Product Identity", count: 3 },
    { id: "color-palette", title: "Color Palette", count: 5 },
    { id: "semantic-colors", title: "Semantic Colors", count: 4 },
    { id: "heatmap-spectrum", title: "Heatmap Spectrum", count: 10 },
    { id: "typography", title: "Typography", count: 4 },
    { id: "component-patterns", title: "Component Patterns", count: 6 },
    { id: "visual-treatments", title: "Visual Treatments", count: 5 },
    { id: "grid-structure", title: "Grid & Structure", count: 3 },
    { id: "spacing-system", title: "Spacing System", count: 4 },
    { id: "motion-identity", title: "Motion Identity", count: 5 },
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
                  &ldquo;One person navigating systems larger than themselves — struggling, growing, and defining their own rhythm.&rdquo;
                </p>
              </div>
              <p className="text-base leading-relaxed">
                This contrast — one small red dot within, against, or among larger circles — captures
                the Soloist story. It&apos;s a visual metaphor for the human experience of navigating complex
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
                      <td className="py-3 px-4">Simplified circle with one red dot — the brand&apos;s primary identity.</td>
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
                Soloist&apos;s palette is intentional — a dialogue between neutrality, clarity, and intensity.
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

                <div className="border rounded-lg overflow-hidden">
                  <div className="h-24 bg-[#f9f9f9]"></div>
                  <div className="p-4 bg-card">
                    <h4 className="font-semibold text-sm mb-1">Background Light</h4>
                    <p className="text-xs text-muted-foreground mb-2">#f9f9f9</p>
                    <p className="text-sm">Warm gray background. Soft, inviting foundation for light mode.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Product Identity */}
          <section id="product-identity" className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight">Product Identity System</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed">
                The Soloist ecosystem spans three distinct contexts, each with its own color identity derived from the brand mark. These colors create visual distinction across platforms while maintaining brand cohesion.
              </p>
              
              <div className="my-8 p-8 border rounded-lg bg-muted/30">
                <div className="flex items-center justify-center mb-6">
                  <Image
                    src="/BrowserLogos.svg"
                    alt="Soloist Product Icons"
                    width={300}
                    height={100}
                    className="object-contain"
                  />
                </div>
                <p className="text-center text-sm text-muted-foreground italic">
                  Three contexts, one system — Website, Application, and Marketing.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose mt-6">
                <div className="border rounded-lg overflow-hidden">
                  <div className="h-20 bg-[#171717] flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-white"></div>
                    </div>
                  </div>
                  <div className="p-4 bg-card">
                    <h4 className="font-semibold text-sm mb-1">Website</h4>
                    <p className="text-xs text-muted-foreground mb-2">#171717 (Black)</p>
                    <p className="text-sm">Primary marketing presence. Professional, grounded, authoritative.</p>
                  </div>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <div className="h-20 bg-[#0141E4] flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-white"></div>
                    </div>
                  </div>
                  <div className="p-4 bg-card">
                    <h4 className="font-semibold text-sm mb-1">Application</h4>
                    <p className="text-xs text-muted-foreground mb-2">#0141E4 (Blue)</p>
                    <p className="text-sm">The desktop app experience. Focused, productive, calm.</p>
                  </div>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <div className="h-20 bg-[#FF0000] flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-white"></div>
                    </div>
                  </div>
                  <div className="p-4 bg-card">
                    <h4 className="font-semibold text-sm mb-1">Marketing</h4>
                    <p className="text-xs text-muted-foreground mb-2">#FF0000 (Red)</p>
                    <p className="text-sm">Promotional campaigns. Bold, energetic, attention-grabbing.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Semantic Colors */}
          <section id="semantic-colors" className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight">Semantic Colors</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed mb-6">
                Beyond the core palette, Soloist uses semantic colors to communicate meaning, status, and action across the interface.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
                <div className="border rounded-lg overflow-hidden">
                  <div className="h-16 bg-emerald-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Success / Positive</span>
                  </div>
                  <div className="p-4 bg-card">
                    <p className="text-xs text-muted-foreground mb-2">emerald-600, green-500</p>
                    <p className="text-sm">Completed actions, positive trends, confirmation states.</p>
                  </div>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <div className="h-16 bg-amber-500 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Warning / Caution</span>
                  </div>
                  <div className="p-4 bg-card">
                    <p className="text-xs text-muted-foreground mb-2">amber-400, orange-400</p>
                    <p className="text-sm">Attention needed, neutral trends, pending states.</p>
                  </div>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <div className="h-16 bg-rose-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Error / Destructive</span>
                  </div>
                  <div className="p-4 bg-card">
                    <p className="text-xs text-muted-foreground mb-2">rose-500, red-600</p>
                    <p className="text-sm">Errors, negative trends, destructive actions.</p>
                  </div>
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <div className="h-16 bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Primary Action</span>
                  </div>
                  <div className="p-4 bg-card">
                    <p className="text-xs text-muted-foreground mb-2">blue-500, blue-600</p>
                    <p className="text-sm">Primary CTAs, interactive elements, links.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Heatmap Spectrum */}
          <section id="heatmap-spectrum" className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight">Heatmap Color Spectrum</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed mb-6">
                The signature Soloist heatmap uses a 10-tier color spectrum to visualize daily mood scores. This palette creates an intuitive visual language where cool colors represent high scores and warm colors indicate areas for attention.
              </p>
              
              <div className="not-prose">
                <div className="grid grid-cols-5 md:grid-cols-10 gap-1 mb-4">
                  <div className="aspect-square bg-indigo-400 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">90+</span>
                  </div>
                  <div className="aspect-square bg-blue-400 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">80</span>
                  </div>
                  <div className="aspect-square bg-sky-400 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">70</span>
                  </div>
                  <div className="aspect-square bg-teal-400 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">60</span>
                  </div>
                  <div className="aspect-square bg-green-400 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">50</span>
                  </div>
                  <div className="aspect-square bg-lime-400 rounded flex items-center justify-center">
                    <span className="text-zinc-800 text-xs font-bold">40</span>
                  </div>
                  <div className="aspect-square bg-yellow-400 rounded flex items-center justify-center">
                    <span className="text-zinc-800 text-xs font-bold">30</span>
                  </div>
                  <div className="aspect-square bg-amber-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">20</span>
                  </div>
                  <div className="aspect-square bg-orange-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">10</span>
                  </div>
                  <div className="aspect-square bg-rose-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">0</span>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg bg-card mt-6">
                  <h4 className="font-semibold text-sm mb-3">Score Ranges:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-indigo-400"></div>
                      <span>90-100: Excellent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-blue-400"></div>
                      <span>80-89: Great</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-sky-400"></div>
                      <span>70-79: Good</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-teal-400"></div>
                      <span>60-69: Above Avg</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-400"></div>
                      <span>50-59: Average</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-lime-400"></div>
                      <span>40-49: Below Avg</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-yellow-400"></div>
                      <span>30-39: Low</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-amber-500"></div>
                      <span>20-29: Very Low</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-orange-500"></div>
                      <span>10-19: Poor</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-rose-600"></div>
                      <span>0-9: Critical</span>
                    </div>
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
                Soloist typography expresses clarity, confidence, and warmth. The system balances professional structure with approachable personality.
              </p>
              
              <div className="my-6 space-y-4 not-prose">
                <div className="p-6 border rounded-lg bg-card">
                  <p className="text-sm text-muted-foreground mb-2">Primary Brand Font</p>
                  <p className="text-3xl font-semibold mb-1" style={{ fontFamily: 'var(--font-parkinsans), system-ui' }}>Parkinsans</p>
                  <p className="text-xs text-muted-foreground mb-3">Weights: 300 (Light), 400 (Normal), 600 (Semibold), 800 (Bold)</p>
                  <p className="text-sm text-muted-foreground">Used for headings, hero text, and brand moments. Character: Modern, geometric, confident.</p>
                </div>
                
                <div className="p-6 border rounded-lg bg-card">
                  <p className="text-sm text-muted-foreground mb-2">Body Font</p>
                  <p className="text-2xl font-medium mb-1" style={{ fontFamily: '"Architects Daughter", cursive' }}>Architects Daughter</p>
                  <p className="text-sm text-muted-foreground">Friendly, handwritten-style for body text. Creates approachability in a data-heavy product.</p>
                </div>

                <div className="p-6 border rounded-lg bg-card">
                  <p className="text-sm text-muted-foreground mb-2">UI / Navigation</p>
                  <p className="text-2xl font-medium mb-1" style={{ fontFamily: 'Inter, system-ui' }}>Inter / System</p>
                  <p className="text-sm text-muted-foreground">Clean, readable sans-serif for UI elements, navigation, and functional text.</p>
                </div>

                <div className="p-6 border rounded-lg bg-card">
                  <p className="text-sm text-muted-foreground mb-2">Fallback Stack</p>
                  <p className="text-lg font-mono mb-1">-apple-system, BlinkMacSystemFont, &quot;SF Pro Display&quot;, system-ui</p>
                  <p className="text-sm text-muted-foreground">Native system fonts for optimal performance and platform consistency.</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold mt-8 mb-4">Responsive Type Scale</h3>
              <div className="p-6 border rounded-lg bg-card not-prose">
                <div className="space-y-4">
                  <div className="flex items-baseline gap-4 border-b pb-3">
                    <span className="text-xs text-muted-foreground w-24">Hero</span>
                    <span className="text-3xl md:text-5xl font-bold">clamp(2.25rem, 8vw, 5.5rem)</span>
                  </div>
                  <div className="flex items-baseline gap-4 border-b pb-3">
                    <span className="text-xs text-muted-foreground w-24">Section</span>
                    <span className="text-2xl md:text-4xl font-semibold">clamp(1.5rem, 5vw, 3rem)</span>
                  </div>
                  <div className="flex items-baseline gap-4 border-b pb-3">
                    <span className="text-xs text-muted-foreground w-24">Subtitle</span>
                    <span className="text-lg md:text-xl">clamp(1.125rem, 3vw, 1.5rem)</span>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <span className="text-xs text-muted-foreground w-24">Body</span>
                    <span className="text-base">1rem (16px)</span>
                  </div>
                </div>
              </div>
              
              <p className="text-base leading-relaxed mt-6">
                Typography should emphasize calm structure — minimal uppercase, intentional hierarchy, 
                and generous breathing space. Use tracking of <code className="text-sm bg-muted px-1 rounded">-0.02em</code> for display text.
              </p>
            </div>
          </section>

          {/* Component Patterns */}
          <section id="component-patterns" className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight">Component Patterns</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed">
                Soloist components follow consistent patterns that create a cohesive interface language across the product ecosystem.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-4">Card Styles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
                <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <h4 className="text-white font-semibold text-sm mb-2">Dark Demo Cards</h4>
                  <p className="text-zinc-400 text-xs">bg-zinc-900 border-zinc-800 rounded-xl</p>
                  <p className="text-zinc-500 text-xs mt-2">Used for product demos and feature showcases</p>
                </div>
                
                <div className="p-6 bg-yellow-50/10 border border-border rounded-tl-none rounded-tr-xl rounded-b-xl">
                  <h4 className="font-semibold text-sm mb-2">Warm Content Cards</h4>
                  <p className="text-muted-foreground text-xs">bg-yellow-50/10 rounded-tl-none</p>
                  <p className="text-muted-foreground text-xs mt-2">Signature asymmetric corner treatment</p>
                </div>
              </div>

              <h3 className="text-xl font-semibold mt-8 mb-4">Button Hierarchy</h3>
              <div className="flex flex-wrap gap-3 not-prose my-4">
                <button className="px-4 py-2 bg-blue-500 border border-blue-900 text-white font-bold rounded-md text-sm">
                  Primary CTA
                </button>
                <button className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-md text-sm">
                  Action
                </button>
                <button className="px-4 py-2 border border-black bg-white font-medium rounded-md text-sm">
                  Outline
                </button>
                <button className="px-4 py-2 text-zinc-500 hover:text-zinc-700 font-medium text-sm">
                  Ghost
                </button>
              </div>

              <h3 className="text-xl font-semibold mt-8 mb-4">Pill / Choice Buttons</h3>
              <div className="flex flex-wrap gap-2 not-prose my-4">
                <span className="px-3 py-1.5 text-xs rounded-full border border-zinc-700 text-zinc-400">Unselected</span>
                <span className="px-3 py-1.5 text-xs rounded-full bg-zinc-100 text-zinc-900 border border-zinc-100">Selected</span>
                <span className="px-3 py-1.5 text-xs rounded-full border border-zinc-700 text-zinc-400">Option C</span>
              </div>

              <h3 className="text-xl font-semibold mt-8 mb-4">Input Fields</h3>
              <div className="not-prose my-4">
                <div className="relative max-w-md">
                  <input
                    type="text"
                    placeholder="Search or ask a question..."
                    className="w-full px-4 py-3 pr-12 rounded-full bg-background border border-border text-sm"
                    readOnly
                  />
                  <button className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-xs">→</span>
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Signature: Rounded-full inputs with embedded action buttons</p>
              </div>
            </div>
          </section>

          {/* Visual Treatments */}
          <section id="visual-treatments" className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight">Visual Treatments</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed">
                Distinctive visual effects that define the Soloist aesthetic.
              </p>

              <div className="my-6 space-y-4 not-prose">
                <div className="p-6 border rounded-lg bg-card">
                  <h4 className="font-semibold text-sm mb-3">Asymmetric Corners</h4>
                  <div className="flex gap-4">
                    <div className="w-24 h-16 bg-muted rounded-tl-none rounded-tr-xl rounded-b-xl border"></div>
                    <div className="flex-1">
                      <code className="text-xs bg-muted px-2 py-1 rounded">rounded-tl-none rounded-tr-xl rounded-b-xl</code>
                      <p className="text-sm text-muted-foreground mt-2">Signature tab aesthetic. Creates visual interest and suggests document/card metaphor.</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 border rounded-lg" style={{ backdropFilter: 'blur(16px) saturate(160%)', background: 'rgba(255, 255, 255, 0.85)' }}>
                  <h4 className="font-semibold text-sm mb-3">Glass Effects</h4>
                  <code className="text-xs bg-white/50 px-2 py-1 rounded">backdrop-filter: blur(16px) saturate(160%)</code>
                  <p className="text-sm text-muted-foreground mt-2">Premium glass morphism for navigation and elevated surfaces.</p>
                </div>

                <div className="p-6 border rounded-lg bg-card">
                  <h4 className="font-semibold text-sm mb-3">Warm Tints</h4>
                  <div className="flex gap-4">
                    <div className="w-24 h-16 bg-yellow-50/20 border rounded-lg"></div>
                    <div className="flex-1">
                      <code className="text-xs bg-muted px-2 py-1 rounded">bg-yellow-50/10</code>
                      <p className="text-sm text-muted-foreground mt-2">Subtle cream accent adds psychological warmth to content cards.</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 border rounded-lg bg-card">
                  <h4 className="font-semibold text-sm mb-3">Trend Badges</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-green-500 rounded-sm">
                        <span className="text-white text-xs">↑</span>
                      </span>
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-red-500 rounded-sm">
                        <span className="text-white text-xs">↓</span>
                      </span>
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-zinc-400 rounded-sm">
                        <span className="text-white text-xs">→</span>
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Compact trend indicators for score changes</p>
                  </div>
                </div>

                <div className="p-6 border rounded-lg bg-card">
                  <h4 className="font-semibold text-sm mb-3">Version Badges</h4>
                  <div className="flex items-center gap-4">
                    <span className="bg-red-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded shadow-sm">BETA</span>
                    <span className="bg-blue-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded shadow-sm">NEW</span>
                    <span className="bg-zinc-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded shadow-sm">v2.0</span>
                    <p className="text-sm text-muted-foreground">Small, bold badges for status indicators</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Grid & Structure */}
          <section id="grid-structure" className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight">Grid & Structure</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed">
                The grid is not decoration — it&apos;s part of the brand&apos;s identity. It symbolizes measurement,
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

          {/* Spacing System */}
          <section id="spacing-system" className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight">Spacing System</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed">
                Consistent spacing creates visual rhythm and hierarchy. Soloist uses a fluid spacing system that adapts across viewport sizes.
              </p>
              
              <div className="my-6 not-prose">
                <h4 className="font-semibold text-sm mb-4">Fluid Spacing Scale</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-3 border rounded-lg bg-card">
                    <div className="w-8 h-8 bg-blue-500 rounded"></div>
                    <div>
                      <code className="text-xs bg-muted px-2 py-1 rounded">spacing-fluid-sm</code>
                      <p className="text-xs text-muted-foreground mt-1">clamp(1rem, 3vw, 1.5rem) — Tight spacing</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 border rounded-lg bg-card">
                    <div className="w-12 h-12 bg-blue-500 rounded"></div>
                    <div>
                      <code className="text-xs bg-muted px-2 py-1 rounded">spacing-fluid-md</code>
                      <p className="text-xs text-muted-foreground mt-1">clamp(1.5rem, 4vw, 2rem) — Default spacing</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 border rounded-lg bg-card">
                    <div className="w-16 h-16 bg-blue-500 rounded"></div>
                    <div>
                      <code className="text-xs bg-muted px-2 py-1 rounded">spacing-fluid-lg</code>
                      <p className="text-xs text-muted-foreground mt-1">clamp(2rem, 5vw, 3rem) — Spacious</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="my-6 not-prose">
                <h4 className="font-semibold text-sm mb-4">Container Widths</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-3 border rounded-lg bg-card">
                    <span>Standard Content</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">max-w-4xl (56rem)</code>
                  </div>
                  <div className="flex justify-between p-3 border rounded-lg bg-card">
                    <span>Wide Content</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">max-w-[76rem]</code>
                  </div>
                  <div className="flex justify-between p-3 border rounded-lg bg-card">
                    <span>Full Width</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">max-w-[84rem]</code>
                  </div>
                </div>
              </div>

              <div className="my-6 not-prose">
                <h4 className="font-semibold text-sm mb-4">Common Gap Values</h4>
                <div className="flex flex-wrap gap-4">
                  <div className="text-center">
                    <div className="w-12 h-2 bg-zinc-300 rounded mb-2"></div>
                    <span className="text-xs text-muted-foreground">gap-2 (0.5rem)</span>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-2 bg-zinc-400 rounded mb-2"></div>
                    <span className="text-xs text-muted-foreground">gap-4 (1rem)</span>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-2 bg-zinc-500 rounded mb-2"></div>
                    <span className="text-xs text-muted-foreground">gap-6 (1.5rem)</span>
                  </div>
                  <div className="text-center">
                    <div className="w-24 h-2 bg-zinc-600 rounded mb-2"></div>
                    <span className="text-xs text-muted-foreground">gap-8 (2rem)</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Motion Identity */}
          <section id="motion-identity" className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight">Motion Identity</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed">
                Motion brings the Soloist to life. The small red dot should move as if it&apos;s bouncing
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
                      <p className="text-muted-foreground mt-1">&ldquo;Ease Out Back&rdquo; or &ldquo;Ease In-Out&rdquo; — natural, never mechanical</p>
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

                <div className="p-6 border rounded-lg bg-card">
                  <h4 className="font-semibold text-sm mb-3">Animation Library:</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                      <div>
                        <code className="text-xs bg-muted px-2 py-1 rounded">animate-float</code>
                        <span className="text-muted-foreground ml-2">6s ease-in-out infinite</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                      <div>
                        <code className="text-xs bg-muted px-2 py-1 rounded">animate-pulse-glow</code>
                        <span className="text-muted-foreground ml-2">2s ease-in-out infinite</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <div>
                        <code className="text-xs bg-muted px-2 py-1 rounded">animate-shimmer</code>
                        <span className="text-muted-foreground ml-2">2s ease-in-out infinite</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                      <div>
                        <code className="text-xs bg-muted px-2 py-1 rounded">animate-slide-in-left</code>
                        <span className="text-muted-foreground ml-2">0.8s ease-out forwards</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border rounded-lg bg-card">
                  <h4 className="font-semibold text-sm mb-3">Transition Defaults:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <code className="text-xs bg-muted px-2 py-1 rounded">transition-colors</code>
                      <p className="text-muted-foreground text-xs mt-1">Color changes</p>
                    </div>
                    <div>
                      <code className="text-xs bg-muted px-2 py-1 rounded">duration-200</code>
                      <p className="text-muted-foreground text-xs mt-1">Quick interactions</p>
                    </div>
                    <div>
                      <code className="text-xs bg-muted px-2 py-1 rounded">duration-300</code>
                      <p className="text-muted-foreground text-xs mt-1">Card hovers</p>
                    </div>
                    <div>
                      <code className="text-xs bg-muted px-2 py-1 rounded">hover:scale-105</code>
                      <p className="text-muted-foreground text-xs mt-1">Subtle lift effect</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-amber-50/50 border-amber-200">
                  <p className="text-sm"><strong>Accessibility Note:</strong> All animations respect <code className="text-xs bg-muted px-1 rounded">prefers-reduced-motion</code> media query.</p>
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
                <p className="text-lg italic">&ldquo;Every day is data. Every reflection is progress.&rdquo;</p>
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
                  <p className="text-xl font-semibold text-center">&ldquo;Progress has rhythm.&rdquo;</p>
                </div>
                <div className="p-6 border rounded-lg bg-gradient-to-br from-card to-muted">
                  <p className="text-xl font-semibold text-center">&ldquo;Your data, your rhythm.&rdquo;</p>
                </div>
              </div>
            </div>
          </section>

          {/* Usage Rules */}
          <section id="usage-rules" className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight">Usage Rules</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <div className="my-6 p-6 border rounded-lg bg-card space-y-3">
                <h4 className="font-semibold text-sm mb-4">Do&apos;s and Don&apos;ts:</h4>
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
                    <p className="text-xs font-semibold text-red-600 mb-3">✗ DON&apos;T</p>
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
                  Soloist is more than a product — it&apos;s a philosophy of measured progress.
                  Every motion, every mark, every red dot is a reminder that growth is not linear —
                  it&apos;s rhythmic, imperfect, and deeply human.
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
