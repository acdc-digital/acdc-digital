# Web Preview Component Documentation

## Overview

The Web Preview component provides a safe, interactive iframe-based preview system for embedding external websites, perfect for AI-generated UIs. Inspired by v0.dev's live viewer.

## Installation

The component is located at `components/ai/web-preview.tsx` and consists of four composable parts:

1. **WebPreview** - Container with context provider
2. **WebPreviewNavigation** - Navigation bar with controls
3. **WebPreviewUrl** - URL input field
4. **WebPreviewBody** - Iframe container

## Basic Usage

```tsx
import {
  WebPreview,
  WebPreviewNavigation,
  WebPreviewUrl,
  WebPreviewBody,
} from "@/components/ai/web-preview";

export default function MyPage() {
  return (
    <WebPreview defaultUrl="https://example.com" className="h-screen">
      <WebPreviewNavigation>
        <WebPreviewUrl />
      </WebPreviewNavigation>
      <WebPreviewBody />
    </WebPreview>
  );
}
```

## Advanced Usage

### Controlled State

```tsx
"use client";

import { useState } from "react";
import { WebPreview, WebPreviewNavigation, WebPreviewUrl, WebPreviewBody } from "@/components/ai/web-preview";

export default function ControlledPreview() {
  const [url, setUrl] = useState("https://example.com");

  return (
    <div>
      <button onClick={() => setUrl("https://vercel.com")}>
        Load Vercel
      </button>
      
      <WebPreview 
        defaultUrl={url} 
        onUrlChange={setUrl}
        className="h-[600px]"
      >
        <WebPreviewNavigation>
          <WebPreviewUrl />
        </WebPreviewNavigation>
        <WebPreviewBody />
      </WebPreview>
    </div>
  );
}
```

### Custom Loading Indicator

```tsx
<WebPreview defaultUrl="https://example.com">
  <WebPreviewNavigation>
    <WebPreviewUrl />
  </WebPreviewNavigation>
  <WebPreviewBody 
    loading={
      <div className="flex items-center gap-2">
        <Spinner />
        <span>Generating preview...</span>
      </div>
    }
  />
</WebPreview>
```

### AI Integration Example

```tsx
"use client";

import { useState } from "react";
import { WebPreview, WebPreviewNavigation, WebPreviewUrl, WebPreviewBody } from "@/components/ai/web-preview";

export default function AIGenerator() {
  const [previewUrl, setPreviewUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (prompt: string) => {
    setIsGenerating(true);
    
    try {
      const response = await fetch("/api/generate-ui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      setPreviewUrl(data.url);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-screen flex flex-col p-6">
      <div className="mb-4">
        <input 
          type="text" 
          placeholder="Describe the UI you want..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleGenerate(e.currentTarget.value);
            }
          }}
        />
      </div>

      {isGenerating ? (
        <div>Generating your UI...</div>
      ) : previewUrl ? (
        <WebPreview defaultUrl={previewUrl} className="flex-1">
          <WebPreviewNavigation>
            <WebPreviewUrl />
          </WebPreviewNavigation>
          <WebPreviewBody />
        </WebPreview>
      ) : (
        <div>Your generated UI will appear here</div>
      )}
    </div>
  );
}
```

## API Reference

### WebPreview Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultUrl` | `string` | `""` | Initial URL to load in the preview |
| `onUrlChange` | `(url: string) => void` | - | Callback fired when URL changes |
| `className` | `string` | - | Additional CSS classes for container |
| `children` | `ReactNode` | - | Child components (Navigation, Body, etc.) |

### WebPreviewNavigation Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | URL input and other controls |

### WebPreviewUrl Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | Controlled value (overrides context) |
| `onChange` | `ChangeEventHandler` | - | Change event handler |
| `className` | `string` | - | Additional CSS classes |

### WebPreviewBody Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string` | - | URL to load (overrides context) |
| `loading` | `ReactNode` | Default spinner | Custom loading indicator |
| `className` | `string` | - | Additional CSS classes |
| `sandbox` | `string` | See below | Iframe sandbox attributes |

**Default sandbox attributes:**
```
allow-scripts allow-same-origin allow-forms allow-popups allow-modals
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Navigate to URL in input field |
| `Tab` | Move between navigation controls |
| `Cmd/Ctrl + [` | Go back (via browser button) |
| `Cmd/Ctrl + ]` | Go forward (via browser button) |

## Security Considerations

### Sandbox Restrictions

The iframe uses strict sandboxing by default. Only add necessary permissions:

```tsx
<WebPreviewBody sandbox="allow-scripts" />  // Minimal - scripts only
<WebPreviewBody sandbox="allow-scripts allow-forms" />  // With forms
<WebPreviewBody sandbox="allow-scripts allow-same-origin" />  // With localStorage
```

⚠️ **Warning**: `allow-same-origin` combined with `allow-scripts` can allow the iframe to remove its own sandbox - only use for trusted content.

### CORS and X-Frame-Options

Some sites block iframe embedding with headers:
- `X-Frame-Options: DENY`
- `Content-Security-Policy: frame-ancestors 'none'`

For these sites, you'll need to:
1. Use a proxy server that strips headers
2. Cache HTML content as data URLs
3. Use screenshots/static previews as fallback

### Data URLs for Local Content

Preview local HTML without a server:

```tsx
const htmlContent = `
  <!DOCTYPE html>
  <html>
    <body>
      <h1>Hello World</h1>
    </body>
  </html>
`;

const dataUrl = `data:text/html;base64,${btoa(htmlContent)}`;

<WebPreview defaultUrl={dataUrl}>
  <WebPreviewNavigation>
    <WebPreviewUrl />
  </WebPreviewNavigation>
  <WebPreviewBody />
</WebPreview>
```

## Common Patterns

### Loading Multiple Previews

```tsx
const [previews, setPreviews] = useState<string[]>([]);

{previews.map((url, index) => (
  <WebPreview key={index} defaultUrl={url} className="h-96">
    <WebPreviewNavigation>
      <WebPreviewUrl />
    </WebPreviewNavigation>
    <WebPreviewBody />
  </WebPreview>
))}
```

### Side-by-Side Comparison

```tsx
<div className="grid grid-cols-2 gap-4">
  <WebPreview defaultUrl="https://old-version.com">
    <WebPreviewNavigation>
      <WebPreviewUrl />
    </WebPreviewNavigation>
    <WebPreviewBody />
  </WebPreview>

  <WebPreview defaultUrl="https://new-version.com">
    <WebPreviewNavigation>
      <WebPreviewUrl />
    </WebPreviewNavigation>
    <WebPreviewBody />
  </WebPreview>
</div>
```

### Responsive Testing

```tsx
const [width, setWidth] = useState("100%");

<div>
  <select onChange={(e) => setWidth(e.target.value)}>
    <option value="100%">Desktop</option>
    <option value="768px">Tablet</option>
    <option value="375px">Mobile</option>
  </select>

  <div style={{ width }}>
    <WebPreview defaultUrl="https://example.com">
      <WebPreviewNavigation>
        <WebPreviewUrl />
      </WebPreviewNavigation>
      <WebPreviewBody />
    </WebPreview>
  </div>
</div>
```

## Troubleshooting

### Preview shows blank page

1. Check browser console for CORS/X-Frame-Options errors
2. Verify the URL is accessible and allows iframe embedding
3. Check if the site requires authentication
4. Try opening the URL in a new tab to see if it loads

### Navigation doesn't work

1. Ensure you're pressing Enter after typing URL
2. Check that URL includes protocol (`https://`)
3. Verify the WebPreviewUrl component is inside WebPreviewNavigation

### History buttons disabled

History only works after navigating to a new URL. The initial URL doesn't create a history entry.

### Loading indicator stays forever

1. Check if the iframe `onLoad` event is firing
2. Some sites block loading in iframes - check console
3. Try a different URL to verify the component works

## Performance Tips

1. **Lazy load previews**: Don't render until needed
2. **Cleanup on unmount**: Component handles this automatically
3. **Limit simultaneous previews**: Each iframe consumes memory
4. **Use data URLs for static content**: Faster than fetching URLs
5. **Implement preview timeouts**: Abort loading after X seconds

## Design System Integration

This component follows the Modern Minimal theme:
- Subtle shadows for depth
- Strategic purple for primary actions
- Generous spacing (Swiss design)
- OKLCH colors for perceptual accuracy

See `.design/theme.instructions.md` for complete guidelines.
