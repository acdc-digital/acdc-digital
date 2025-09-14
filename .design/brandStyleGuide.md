# ACDC Digital Brand Style Guide
## Comprehensive Design System for AI-Powered Development Platforms

*Version 1.0 | Last Updated: December 2024*

---

## Table of Contents

1. [Brand Overview & Core Identity](#1-brand-overview--core-identity)
2. [Logo Guidelines](#2-logo-guidelines)
3. [Color Palette System](#3-color-palette-system)
4. [Typography Guidelines](#4-typography-guidelines)
5. [Imagery & Visual Style](#5-imagery--visual-style)
6. [Voice & Tone](#6-voice--tone)
7. [Application Guidelines](#7-application-guidelines)
8. [Component Standards](#8-component-standards)
9. [Animation & Interaction Principles](#9-animation--interaction-principles)
10. [Legal & Usage Information](#10-legal--usage-information)

---

## 1. Brand Overview & Core Identity

### Brand Mission
ACDC Digital develops intelligent AI-powered platforms that democratize advanced technology for businesses and developers. We create tools that understand, automate, and enhance digital workflows through sophisticated AI integration.

### Brand Values
- **Innovation Through Intelligence**: Leading-edge AI integration in practical applications
- **Developer-First Approach**: Tools built by developers, for developers
- **Accessibility & Transparency**: Making complex AI understandable and affordable
- **Professional Excellence**: Enterprise-grade solutions with intuitive interfaces
- **Continuous Evolution**: Adaptive systems that grow with user needs

### Brand Personality
- **Technical**: Sophisticated yet approachable technological solutions
- **Intelligent**: AI-powered with visible, transparent intelligence
- **Professional**: Enterprise-ready with clean, minimal aesthetics
- **Innovative**: Cutting-edge features delivered through familiar interfaces
- **Reliable**: Consistent performance with predictable, intuitive behavior

### Target Audience
- **Primary**: Developers, technical teams, and AI-forward businesses
- **Secondary**: Content creators, social media managers, and digital professionals
- **Tertiary**: Enterprise clients seeking AI automation solutions

---

## 2. Logo Guidelines

### Primary Logo
**Text-based identity**: "ACDC Digital" or contextual application names

### Application Logos
- **SMNB**: AI brain icon representing intelligent news processing
- **AURA**: Agent-based iconography with console/terminal aesthetics
- **RUUF**: Clean, minimal geometric forms

### Logo Usage Rules
- **Minimum Size**: 24px height for digital, 0.5" for print
- **Clear Space**: Minimum 2x logo height on all sides
- **Backgrounds**: Ensure adequate contrast (4.5:1 minimum)
- **Variations**: Provide light/dark mode versions for all contexts

---

## 3. Color Palette System

### Primary Brand Colors

#### Core Technical Palette
```css
/* Professional Foundation */
--brand-primary: #007acc;      /* Primary Blue - Technical precision */
--brand-secondary: #1e1e1e;    /* Deep Black - Professional depth */
--brand-accent: #8b5cf6;       /* AI Purple - Intelligence indicator */

/* Grayscale Foundation */
--neutral-50: #ffffff;         /* Pure white */
--neutral-100: #f8f9fa;        /* Light gray */
--neutral-200: #e9ecef;        /* Border gray */
--neutral-300: #dee2e6;        /* Muted gray */
--neutral-400: #ced4da;        /* Text secondary */
--neutral-500: #6c757d;        /* Text muted */
--neutral-600: #495057;        /* Text dark */
--neutral-700: #343a40;        /* Card backgrounds */
--neutral-800: #212529;        /* Dark surfaces */
--neutral-900: #1e1e1e;        /* Deep black */
```

#### AI & Intelligence Colors
```css
/* AI Theme Colors */
--ai-blue: #3b82f6;           /* Electric Blue - Actions, CTAs */
--ai-purple: #8b5cf6;         /* AI Purple - Processing, intelligence */
--ai-cyan: #06b6d4;           /* Cyan - Data, analytics */
--neural-blue: #1a1a2e;       /* Deep Neural - Backgrounds */

/* Status & Feedback Colors */
--success: #10b981;           /* Green - Success, live states */
--warning: #f59e0b;           /* Amber - Warnings, pending */
--error: #ef4444;             /* Red - Errors, critical */
--info: #3b82f6;              /* Blue - Information, tips */
```

#### Application-Specific Palettes

**SMNB (News Intelligence)**
```css
--smnb-deep-space: #0f0f1e;      /* Foundation depth */
--smnb-midnight: #1a1a2e;         /* Primary backgrounds */
--smnb-electric: #3b82f6;         /* Actions, links */
--smnb-breaking: #ef4444;         /* Urgent news */
--smnb-developing: #f59e0b;       /* Evolving stories */
--smnb-analysis: #3b82f6;         /* Analysis content */
--smnb-human-interest: #10b981;   /* Community stories */
```

**AURA (Social Intelligence)**
```css
--aura-console: #1e1e1e;          /* Console background */
--aura-terminal: #252526;         /* Terminal surfaces */
--aura-accent: #007acc;           /* Primary actions */
--aura-success: #4ec9b0;          /* Agent success */
--aura-warning: #ce9178;          /* System warnings */
--aura-text-primary: #ffffff;     /* Primary text */
--aura-text-secondary: #cccccc;   /* Standard text */
```

### Color Usage Guidelines

#### Accessibility Requirements
- **Contrast Ratios**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Color Blindness**: Never rely on color alone to convey information
- **Dark Mode**: All applications support dark mode as primary interface

#### Color Hierarchy
1. **Primary Actions**: Use brand primary (#007acc) for main CTAs
2. **Secondary Actions**: Use neutral grays with subtle borders
3. **Status Indicators**: Use semantic colors (success, warning, error)
4. **AI Features**: Use purple/violet tones (#8b5cf6) for intelligence
5. **Data/Analytics**: Use cyan/blue variants for information display

---

## 4. Typography Guidelines

### Font System Hierarchy

#### Primary Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif;
```

#### Application-Specific Typography

**SMNB (News Platform)**
```css
/* Display & Headlines */
--font-display: 'Playfair Display', 'Libre Baskerville', serif;
--font-headline: 'Crimson Text', 'Source Serif 4', serif;
--font-body: 'Inter', 'Work Sans', sans-serif;
--font-mono: 'JetBrains Mono', 'Geist Mono', monospace;

/* Scale */
--text-hero: clamp(3rem, 8vw, 6rem);        /* News headlines */
--text-display: clamp(2rem, 5vw, 4rem);     /* Section titles */
--text-subtitle: clamp(1.25rem, 3vw, 1.5rem); /* Story subtitles */
```

**AURA (Console Interface)**
```css
/* Technical Interface */
--font-mono: 'Cascadia Code', 'JetBrains Mono', monospace;
--font-sans: 'Inter', system-ui, sans-serif;

/* Console Typography */
--console-header: 11px;          /* Uppercase headers */
--console-output: 12px;          /* Terminal text */
--console-timestamp: 11px;       /* Meta information */
```

**General Applications**
```css
/* Professional Typography */
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--font-mono: 'SF Mono', Monaco, 'Roboto Mono', monospace;
```

### Typography Scale
```css
/* Fluid Typography System */
--text-xs: clamp(0.75rem, 1vw, 0.8125rem);    /* 12-13px */
--text-sm: clamp(0.875rem, 1.25vw, 0.9375rem); /* 14-15px */
--text-base: clamp(1rem, 1.5vw, 1.125rem);     /* 16-18px */
--text-lg: clamp(1.125rem, 2vw, 1.25rem);      /* 18-20px */
--text-xl: clamp(1.25rem, 2.5vw, 1.5rem);      /* 20-24px */
--text-2xl: clamp(1.5rem, 3vw, 1.875rem);      /* 24-30px */
--text-3xl: clamp(1.875rem, 4vw, 2.25rem);     /* 30-36px */
--text-4xl: clamp(2.25rem, 5vw, 3rem);         /* 36-48px */
```

### Typography Usage Guidelines

#### Hierarchy Rules
1. **Headlines**: Use serif fonts (Playfair Display, Crimson Text) for editorial content
2. **UI Text**: Use system fonts (SF Pro, Inter) for interface elements
3. **Code/Data**: Use monospace fonts (JetBrains Mono, SF Mono) for technical content
4. **Body Text**: Optimize for readability with appropriate line height (1.6-1.8)

#### Weight & Style Standards
- **Display Text**: 700-900 (Bold to Black)
- **Headlines**: 600-700 (Semi-bold to Bold)
- **Body Text**: 400-500 (Regular to Medium)
- **Captions**: 400 (Regular)
- **Code**: 400-500 (Regular to Medium)

---

## 5. Imagery & Visual Style

### Photography Style
- **Mood**: Clean, modern, professional
- **Subjects**: Technology in use, developers working, AI/automation concepts
- **Lighting**: Bright, clear, minimal shadows
- **Composition**: Minimal, focused, purposeful

### Illustration Style
- **Technical Diagrams**: Clean line art, consistent stroke weight
- **Icons**: Simple, geometric, functional
- **AI Representations**: Abstract, non-anthropomorphic
- **Data Visualization**: Clear, accessible, professional

### Visual Effects

#### Glass Morphism (SMNB Application)
```css
.glass-subtle {
  backdrop-filter: blur(20px) saturate(180%);
  background: rgba(25, 25, 25, 0.95);
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.glass-card {
  backdrop-filter: blur(16px) saturate(160%);
  background: rgba(31, 31, 31, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.08);
}
```

#### Terminal/Console Aesthetics (AURA Application)
```css
.terminal-surface {
  background: var(--console-bg);
  font-family: var(--font-mono);
  border: 1px solid var(--terminal-border);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
}
```

### Iconography Standards
- **Style**: Line-based, minimal, consistent stroke weight
- **Size**: Multiple sizes (16px, 24px, 32px, 48px)
- **Context**: 
  - 🧠 AI/Intelligence features
  - 🔧 Tools and utilities
  - 📊 Analytics and data
  - ⚡ Performance and speed
  - 🎯 Targeting and precision

---

## 6. Voice & Tone

### Brand Voice Characteristics
- **Technical but Accessible**: Use precise terminology with clear explanations
- **Confident and Competent**: Express authority without arrogance
- **Innovative and Forward-thinking**: Emphasize cutting-edge capabilities
- **Professional and Reliable**: Maintain enterprise-grade communication
- **Human-centered**: Focus on solving real problems for real people

### Tone Variations by Context

#### Technical Documentation
- **Precise**: Use exact terminology
- **Instructional**: Clear, step-by-step guidance
- **Comprehensive**: Cover edge cases and variations

#### Marketing Communication
- **Inspiring**: Highlight possibilities and potential
- **Clear Value**: Focus on user benefits
- **Professional**: Maintain enterprise credibility

#### User Interface Text
- **Concise**: Every word serves a purpose
- **Actionable**: Clear next steps
- **Helpful**: Anticipate user needs

### Writing Guidelines
- **Sentence Length**: Prefer shorter sentences for clarity
- **Active Voice**: Use active construction when possible
- **Technical Terms**: Define or link to definitions on first use
- **Inclusive Language**: Use gender-neutral, accessible language

---

## 7. Application Guidelines

### Web Applications

#### Layout Principles
- **Information Hierarchy**: Clear visual hierarchy with consistent spacing
- **Responsive Design**: Mobile-first approach with graceful scaling
- **Accessibility**: WCAG 2.1 AA compliance minimum
- **Performance**: Optimize for speed and efficiency

#### Interface Patterns
```css
/* Consistent spacing system */
--space-xs: 0.25rem;    /* 4px */
--space-sm: 0.5rem;     /* 8px */
--space-md: 1rem;       /* 16px */
--space-lg: 1.5rem;     /* 24px */
--space-xl: 2rem;       /* 32px */
--space-2xl: 3rem;      /* 48px */

/* Border radius system */
--radius-sm: 0.125rem;  /* 2px */
--radius-md: 0.375rem;  /* 6px */
--radius-lg: 0.5rem;    /* 8px */
--radius-xl: 0.75rem;   /* 12px */
```

### Component Standards

#### Buttons
```css
/* Primary Button */
.btn-primary {
  background: var(--brand-primary);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: color-mix(in srgb, var(--brand-primary) 90%, black);
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: var(--brand-primary);
  border: 2px solid var(--brand-primary);
  border-radius: var(--radius-lg);
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: all 0.2s ease;
}
```

#### Cards
```css
.card {
  background: var(--neutral-50);
  border: 1px solid var(--neutral-200);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}
```

#### Forms
```css
.form-input {
  border: 2px solid var(--neutral-300);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
  font-size: var(--text-base);
  transition: border-color 0.2s ease;
}

.form-input:focus {
  border-color: var(--brand-primary);
  outline: 0;
  box-shadow: 0 0 0 3px rgba(0, 122, 204, 0.1);
}
```

---

## 8. Component Standards

### Interactive Elements

#### Status Indicators
```css
/* Live/Active Indicator */
.status-live {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: var(--success);
  animation: pulse 2s infinite;
  box-shadow: 0 0 0.5rem rgba(16, 185, 129, 0.5);
}

/* Processing Indicator */
.status-processing {
  background: var(--ai-purple);
  animation: pulse 1.5s infinite;
}
```

#### Navigation Elements
```css
.nav-item {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  color: var(--neutral-600);
  text-decoration: none;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: var(--neutral-100);
  color: var(--brand-primary);
}

.nav-item.active {
  background: var(--brand-primary);
  color: white;
}
```

### Layout Components

#### Container System
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

.container-fluid {
  width: 100%;
  padding: 0 var(--space-lg);
}

.container-narrow {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
}
```

#### Grid System
```css
.grid {
  display: grid;
  gap: var(--space-lg);
}

.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

/* Responsive variants */
@media (max-width: 768px) {
  .grid-cols-2,
  .grid-cols-3,
  .grid-cols-4 {
    grid-template-columns: 1fr;
  }
}
```

---

## 9. Animation & Interaction Principles

### Animation Guidelines

#### Timing & Easing
```css
/* Standard easing curves */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);

/* Duration standards */
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 350ms;
```

#### Interaction Animations
```css
/* Hover effects */
.interactive:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transition: all var(--duration-normal) var(--ease-out);
}

/* Button press */
.btn:active {
  transform: translateY(0);
  transition: all var(--duration-fast) var(--ease-in);
}

/* Loading states */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### Motion Principles
1. **Purposeful**: Every animation serves a functional purpose
2. **Subtle**: Enhance without distracting from content
3. **Consistent**: Use standard timing and easing throughout
4. **Performant**: Optimize for 60fps, use transforms and opacity
5. **Accessible**: Respect `prefers-reduced-motion` settings

---

## 10. Legal & Usage Information

### Brand Usage Rights
- **Internal Use**: All ACDC Digital employees and contractors
- **Partner Use**: Approved partners with written permission
- **Third-party Use**: Requires explicit written authorization

### Trademark Guidelines
- ACDC Digital® is a registered trademark
- Application names (SMNB, AURA, RUUF) are proprietary brands
- Use ® symbol on first mention in formal documents

### Attribution Requirements
- Credit ACDC Digital in derivative works
- Maintain copyright notices in code repositories
- Link back to official documentation when referencing guidelines

### Prohibited Uses
- Modification of logos or brand marks
- Use in competing products or services
- Misleading or unauthorized representations
- Violation of trademark or copyright laws

---

## Implementation Checklist

### For New Projects
- [ ] Choose appropriate application color palette
- [ ] Implement typography system with proper font loading
- [ ] Set up spacing and layout systems
- [ ] Configure component library with brand standards
- [ ] Test accessibility compliance (WCAG 2.1 AA)
- [ ] Implement dark mode support
- [ ] Add proper meta tags and branding

### For Existing Projects
- [ ] Audit current design against brand guidelines
- [ ] Update color variables to match brand palette
- [ ] Standardize typography implementation
- [ ] Review and update component styles
- [ ] Ensure accessibility compliance
- [ ] Test across all supported devices and browsers

---

*This brand style guide is a living document that evolves with our products and user needs. For questions or suggestions, contact the ACDC Digital design team.*

**Last Updated**: December 2024  
**Version**: 1.0  
**Next Review**: March 2025