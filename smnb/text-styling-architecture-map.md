# SMNB Editor Agent Text Styling Architecture Map

## 📍 Complete File Structure for Text Styling

Based on your request to dive deeper into the styling system for the Editor Agent, here's a comprehensive map of where all text styling files are stored and how they work together:

---

## 🎨 **Core Styling Configuration**

### 1. **Global CSS Foundation**
```
📁 /smnb/app/globals.css
```
- **Purpose**: Root styling definitions and TipTap editor styles
- **Key Features**:
  - CSS custom properties and theme variables
  - ProseMirror editor styling (`.ProseMirror` classes)
  - Newsletter-specific header hierarchy styles
  - Dark/Light mode theme support
  - Editor highlight and placeholder styles

```css
/* Key TipTap Editor Styles */
.ProseMirror h1 { @apply text-4xl; }
.ProseMirror h2 { @apply text-2xl text-blue-600 dark:text-white; }
.ProseMirror h3 { @apply text-xl text-red-600 dark:text-white; }
.ProseMirror p { @apply text-foreground mb-4 leading-relaxed; }
.ProseMirror blockquote { @apply border-l-4 border-gray-300 pl-4 py-2 bg-gray-50 text-gray-700 italic my-6; }
```

### 2. **Tailwind Configuration**
```
📁 /smnb/tailwind.config.ts
```
- **Purpose**: Tailwind CSS configuration with custom typography
- **Key Features**:
  - Font family definitions (Geist Sans, Geist Mono, Libre Baskerville, Work Sans)
  - Custom animations and keyframes
  - Extended color system
  - Typography plugin integration

```typescript
fontFamily: {
  'sans': ['-apple-system', 'SF Pro Display', 'SF Pro Text', 'system-ui', 'sans-serif'],
  'libre-baskerville': ['Libre Baskerville', 'serif'],
  'work-sans': ['Work Sans', 'sans-serif'],
}
```

### 3. **Typography Test Component**
```
📁 /smnb/components/test/TypographyTest.tsx
📁 /smnb/app/typography-test/page.tsx
```
- **Purpose**: Testing and validation of typography styles
- **Access**: Visit `/typography-test` route to see styling in action

---

## 🔧 **Editor-Specific Styling Components**

### 4. **Main TipTap Editor Component**
```
📁 /smnb/components/editor/TipTapEditor.tsx
```
- **Purpose**: Rich text editor with comprehensive newsletter typography
- **Key Styling Features**:
  - Prose styling with custom typography classes
  - Newsletter header hierarchy (H1-H6 with distinct colors)
  - Enhanced blockquote, list, and link styles
  - AI processing visual feedback
  - Streaming content animation styles

```tsx
// Newsletter Header Hierarchy Styles - Consistent white text in dark mode
'prose-h1:text-4xl prose-h1:mb-6 prose-h1:text-gray-900 dark:prose-h1:text-white',
'prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-blue-600 dark:prose-h2:text-white',
'prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-red-600 dark:prose-h3:text-white',
```

### 5. **AI Formatting Tools Service**
```
📁 /smnb/lib/services/aiFormattingTools.ts
```
- **Purpose**: Programmatic text formatting and styling tools for AI
- **Key Features**:
  - Heading creation and formatting tools
  - Text styling manipulation (bold, italic, colors)
  - Structured content formatting (callouts, metrics boxes)
  - Newsletter-specific formatting functions

---

## 🎭 **Theme and Font System**

### 6. **Root Layout with Font Loading**
```
📁 /smnb/app/layout.tsx
```
- **Purpose**: Font loading and theme provider setup
- **Fonts Loaded**:
  - **Geist Sans** (`--font-geist-sans`): Primary interface font
  - **Geist Mono** (`--font-geist-mono`): Code and technical text
  - **Libre Baskerville** (`--font-libre-baskerville`): Serif for elegant content
  - **Work Sans** (`--font-work-sans`): Alternative sans-serif

```tsx
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const libreBaskerville = Libre_Baskerville({ 
  variable: "--font-libre-baskerville", 
  subsets: ["latin"], 
  weight: ["400", "700"] 
});
```

### 7. **Theme Provider Integration**
```
📁 /smnb/components/providers/ThemeProvider.tsx
```
- **Purpose**: Dark/Light mode theme management
- **Integration**: Works with CSS custom properties in globals.css

---

## 🏠 **Application-Level Styling**

### 8. **Homepage Typography Examples** 
```
📁 /smnb/app/page.tsx
```
- **Purpose**: Premium typography system demonstration
- **Key Features**:
  - Custom typography scale (`.text-hero`, `.text-display`, `.text-subtitle`)
  - Glass morphism effects
  - San Francisco Pro font integration
  - Visual hierarchy examples

```tsx
/* Premium Typography Scale Examples */
.text-hero { font-size: clamp(3rem, 8vw, 6rem); line-height: 0.85; font-weight: 900; }
.text-display { font-size: clamp(2rem, 5vw, 4rem); line-height: 0.9; font-weight: 800; }
```

### 9. **Utility and Helper Functions**
```
📁 /smnb/lib/utils/storyUtils.ts
```
- **Purpose**: Styling utility functions for dynamic content
- **Key Features**:
  - Sentiment color mapping
  - Tone color classification
  - Priority level styling
  - Tailwind class generation for content types

```typescript
getSentimentColor: (sentiment) => {
  const sentimentMap = {
    'positive': 'bg-green-400/20 text-green-300 border border-green-400/40',
    'negative': 'bg-red-400/20 text-red-300 border border-red-400/40',
    'neutral': 'bg-blue-400/20 text-blue-300 border border-blue-400/40'
  };
  return sentimentMap[sentiment || 'neutral'];
}
```

---

## 🎪 **Specialized Styling Components**

### 10. **Host Component Styling**
```
📁 /smnb/components/host/WaterfallNarration.module.css
```
- **Purpose**: CSS Modules for waterfall narration component
- **Features**: Custom animations, gradient effects, status indicators

### 11. **AI Response Styling**
```
📁 /smnb/components/ai/response.tsx
```
- **Purpose**: Markdown rendering with prose styling
- **Features**: ReactMarkdown integration with Tailwind Typography

---

## 🛠 **Editor Store Integration**

### 12. **Editor State Management**
```
📁 /smnb/lib/stores/editorStore.ts
```
- **Purpose**: State management for editor styling and themes
- **Key Features**:
  - Theme configuration (`theme: 'auto'`)
  - Status color management
  - Visual feedback state
  - Change tracking with styling metadata

---

## 📦 **Dependencies & Extensions**

### 13. **TipTap Extensions for Styling**
```json
// package.json dependencies
"@tiptap/extension-color": "^3.4.2"
"@tiptap/extension-font-family": "^3.4.2" 
"@tiptap/extension-highlight": "^3.4.2"
"@tiptap/extension-text-align": "^3.4.2"
"@tiptap/extension-text-style": "^3.4.2"
"@tiptap/extension-typography": "^3.4.2"
"@tailwindcss/typography": "^0.5.16"
```

### 14. **Styling Utilities**
```
📁 /smnb/lib/utils.ts
```
- **Purpose**: Tailwind class merging and conditional styling
- **Key Function**: `cn()` utility for dynamic class combinations

---

## 🚀 **How It All Works Together**

### **Text Styling Workflow:**

1. **Base Styles** → `globals.css` provides foundation
2. **Font Loading** → `layout.tsx` loads Google Fonts 
3. **Tailwind Config** → `tailwind.config.ts` defines typography system
4. **Editor Component** → `TipTapEditor.tsx` applies prose classes
5. **AI Tools** → `aiFormattingTools.ts` programmatically styles content
6. **Theme System** → `ThemeProvider.tsx` manages dark/light modes
7. **Utilities** → `storyUtils.ts` provides dynamic styling functions

### **Key Style Classes Used:**

- **Newsletter Headers**: `prose-h1`, `prose-h2`, `prose-h3` with color variations
- **Content Body**: `prose-p`, `prose-strong`, `prose-em` with spacing
- **Interactive Elements**: `prose-a`, `prose-blockquote` with hover states
- **Typography Scale**: `text-hero`, `text-display`, `text-subtitle` for hierarchy

This architecture creates a comprehensive, maintainable styling system that supports both manual editing and AI-generated content with consistent visual hierarchy and branding.