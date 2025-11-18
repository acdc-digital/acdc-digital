# Canvas Component System

Live component preview and generation system integrated into the stdio dashboard.

## Features

- **Live Preview**: Real-time iframe-based component rendering
- **Multi-Framework Support**: HTML, React, Vue, Svelte
- **Device Modes**: Desktop, tablet, and mobile preview modes
- **Component Storage**: Save and load components from Convex database
- **Secure Rendering**: Sandboxed iframes with CSP headers
- **Code Editor**: Built-in code editor with syntax highlighting

## Architecture

### Frontend Components

- **ComponentCanvas** (`app/_components/canvas/ComponentCanvas.tsx`)
  - Main container component
  - Code editor and preview split view
  - Component storage panel at bottom

- **PreviewFrame** (`app/_components/canvas/PreviewFrame.tsx`)
  - Sandboxed iframe renderer
  - Handles HTML, React (via Babel CDN) rendering
  - Error handling and loading states

- **CanvasControls** (`app/_components/canvas/CanvasControls.tsx`)
  - Device mode toggles (desktop/tablet/mobile)
  - Refresh button for preview

- **ComponentStorage** (`app/_components/canvas/ComponentStorage.tsx`)
  - List of saved components from Convex
  - Delete and load functionality

### Backend (Convex)

- **Schema** (`convex/schema.ts`)
  - `generatedComponents` table with indexes
  - Stores code, title, framework, timestamps

- **Functions** (`convex/components.ts`)
  - `listComponents` - Get all components
  - `getComponent` - Get specific component by ID
  - `saveComponent` - Save new component (100KB limit)
  - `updateComponent` - Update existing component
  - `deleteComponent` - Delete component
  - `listComponentsByFramework` - Filter by framework

## Security

### Iframe Sandbox
```html
sandbox="allow-scripts allow-same-origin"
```

Only allows scripts and same-origin access, blocking:
- Popups and modals
- Form submissions to external sites
- Downloads
- Top-level navigation

### Content Security Policy
Injected into preview HTML:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self' 'unsafe-inline' 'unsafe-eval' https:; 
               script-src 'unsafe-inline' 'unsafe-eval' https:; 
               style-src 'unsafe-inline' https:; 
               img-src 'self' data: https:; 
               font-src 'self' data: https:;">
```

### Data URL Rendering
Components rendered via data URLs to avoid CORS issues:
```typescript
const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
```

## Usage

### Integration

The canvas is integrated into the Editor component's Welcome tab:

```typescript
// In Editor.tsx
if (activeTab.type === "welcome") {
  return <ComponentCanvas />;
}
```

### Saving Components

```typescript
const saveComponent = useMutation(api.components.saveComponent);

await saveComponent({
  code: "<div>Hello World</div>",
  title: "My Component",
  framework: "html",
  description: "Optional description"
});
```

### Loading Components

Components are listed in the storage panel and can be clicked to load into the editor.

## Limitations

- **Code Size**: Maximum 100KB per component (enforced server-side)
- **Data URL Size**: ~2MB browser limit (sufficient for most components)
- **React Support**: Uses Babel standalone (slower than build tools)
- **External Resources**: Limited by CSP (CDN resources allowed via https:)

## Future Enhancements

- [ ] AI-powered component generation
- [ ] Component versioning
- [ ] Collaborative editing
- [ ] Export to file system
- [ ] Custom framework templates
- [ ] Tailwind CSS integration
- [ ] Component search and filtering
- [ ] Keyboard shortcuts
- [ ] Undo/redo functionality

## Development

### Setup Convex

```bash
cd stdio
npx convex dev
```

This generates TypeScript types in `convex/_generated/`.

### Run Development Server

```bash
npm run dev
```

Navigate to the Welcome tab to see the canvas.

## Troubleshooting

### TypeScript errors for `api.components`

Run `npx convex dev` to generate types from schema and functions.

### Preview not loading

Check browser console for CSP or iframe errors. Ensure code is valid HTML/JavaScript.

### Component not saving

Check code size (<100KB) and ensure Convex is running (`npx convex dev`).
