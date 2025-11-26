# Iframe Embedding Restrictions

## The Problem

Many popular websites block iframe embedding using security headers to prevent clickjacking attacks. When you try to load these sites in the Web Preview component, you'll see an error like:

```
Refused to display 'https://www.google.com/' in a frame because it set 'X-Frame-Options' to 'sameorigin'.
```

## Why Sites Block Iframes

**Security headers that block embedding:**

1. **X-Frame-Options** - Legacy header
   - `DENY` - Never allow embedding
   - `SAMEORIGIN` - Only allow same-domain embedding
   
2. **Content-Security-Policy** - Modern standard
   - `frame-ancestors 'none'` - Block all embedding
   - `frame-ancestors 'self'` - Only allow same-domain

## Sites That Block Embedding

These popular sites **will NOT work** in the Web Preview:

- ❌ Google (google.com, gmail.com, drive.google.com)
- ❌ Facebook (facebook.com)
- ❌ Twitter/X (twitter.com, x.com)
- ❌ GitHub (github.com) - blocks most pages
- ❌ Instagram (instagram.com)
- ❌ LinkedIn (linkedin.com)
- ❌ Netflix (netflix.com)
- ❌ Banking sites (for security reasons)
- ❌ Most social media platforms

## Sites That Allow Embedding

These sites **will work** in the Web Preview:

- ✅ **example.com** - Classic demo site
- ✅ **info.cern.ch** - First website ever, historical
- ✅ **en.wikipedia.org** - Most Wikipedia pages
- ✅ **developer.mozilla.org** - MDN documentation
- ✅ **codepen.io** - Code examples (embed mode)
- ✅ **youtube.com/embed/** - YouTube embed URLs
- ✅ **vimeo.com** - Video embeds
- ✅ Most documentation sites
- ✅ Your own websites (if you control headers)

## How to Check if a Site Allows Embedding

### Method 1: Browser DevTools

1. Open the site in a new tab
2. Open DevTools (F12)
3. Go to Network tab
4. Refresh the page
5. Click on the first request (usually the HTML document)
6. Check Response Headers for:
   - `x-frame-options`
   - `content-security-policy: frame-ancestors`

If either of these exist and restrict embedding, the site won't work.

### Method 2: Quick Test

Try this in browser console:
```javascript
fetch('https://example.com')
  .then(r => r.headers.get('x-frame-options'))
  .then(console.log)
```

## Solutions for AI-Generated Content

### Option 1: Use Data URLs (Recommended)

Instead of hosting, embed HTML directly:

```typescript
const html = `<!DOCTYPE html>
<html>
  <head><title>Generated UI</title></head>
  <body><h1>Hello World</h1></body>
</html>`;

const dataUrl = `data:text/html;base64,${btoa(html)}`;

<WebPreview defaultUrl={dataUrl}>
  <WebPreviewNavigation>
    <WebPreviewUrl />
  </WebPreviewNavigation>
  <WebPreviewBody />
</WebPreview>
```

**Pros:**
- No server needed
- Instant preview
- No CORS issues
- Works offline

**Cons:**
- URL bar shows long base64 string
- Limited to ~2MB in some browsers
- No external resources without absolute URLs

### Option 2: Proxy Server

Create a proxy that strips security headers:

```typescript
// app/api/proxy/route.ts
export async function GET(req: Request) {
  const url = new URL(req.url).searchParams.get('url');
  
  if (!url) {
    return new Response('Missing URL', { status: 400 });
  }

  const response = await fetch(url);
  const html = await response.text();

  // Return HTML without X-Frame-Options
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      // Explicitly omit X-Frame-Options
    },
  });
}
```

Then use: `https://yourdomain.com/api/proxy?url=https://blocked-site.com`

**Pros:**
- Can preview any site
- Normal URL in address bar

**Cons:**
- Violates site's security policy
- May violate terms of service
- Can break site functionality
- Ethical concerns

### Option 3: Screenshots/Static Preview

Use a service like Puppeteer to generate screenshots:

```typescript
// For sites that block embedding, show screenshot instead
<WebPreview defaultUrl={url}>
  <WebPreviewNavigation>
    <WebPreviewUrl />
  </WebPreviewNavigation>
  <WebPreviewBody
    loading={<ScreenshotGenerator url={url} />}
  />
</WebPreview>
```

**Pros:**
- Works with any site
- Fast to load
- Good for thumbnails

**Cons:**
- Not interactive
- Requires server-side rendering
- Additional service costs

### Option 4: Temporary Hosting (Best for AI)

Host AI-generated HTML on your own domain:

```typescript
// 1. AI generates HTML
const generatedHtml = await generateUI(prompt);

// 2. Save to temporary storage (expires in 24h)
const previewId = await savePreview(generatedHtml);

// 3. Preview at your own domain (no X-Frame-Options)
const previewUrl = `https://yourdomain.com/preview/${previewId}`;

<WebPreview defaultUrl={previewUrl}>
  <WebPreviewNavigation>
    <WebPreviewUrl />
  </WebPreviewNavigation>
  <WebPreviewBody />
</WebPreview>
```

**Pros:**
- Full interactivity
- Clean URLs
- Your site, your rules
- Professional appearance

**Cons:**
- Requires backend setup
- Storage management
- Cleanup needed

## Implementation in Grapes

The Web Preview component handles blocked sites gracefully:

1. **10-second timeout** - Detects stuck loads
2. **Error UI** - Shows friendly message explaining the issue
3. **Suggestions** - Lists working alternatives
4. **Open in tab** - Link to view blocked site directly

### Error Handling Flow

```
User enters URL
  ↓
Component loads iframe
  ↓
Wait 10 seconds
  ↓
Did it load? 
  ├─ Yes → Show preview ✅
  └─ No → Show error message with:
      • Explanation
      • Alternative sites
      • "Open in new tab" link
```

## Best Practices

### For Development
- Use `example.com` for demos
- Use `info.cern.ch` for retro vibes
- Use your own test pages

### For Production
- Generate HTML and use data URLs
- Host previews on your own domain
- Set up temporary storage with expiration
- Add cleanup jobs for old previews

### For AI Applications
```typescript
// Recommended: Generate + host on your domain
async function generateAndPreview(prompt: string) {
  // 1. Generate HTML with AI
  const html = await ai.generateUI(prompt);
  
  // 2. Host temporarily
  const previewId = crypto.randomUUID();
  await storage.set(`preview:${previewId}`, html, { ttl: 86400 }); // 24h
  
  // 3. Return preview URL (your domain, no X-Frame-Options)
  return `https://yourdomain.com/generated/${previewId}`;
}
```

## Testing

Test your iframe compatibility with this checklist:

- [ ] Works with `example.com`
- [ ] Shows error for `google.com`
- [ ] Shows error for `github.com`
- [ ] Works with data URLs
- [ ] Timeout triggers after 10 seconds
- [ ] Error message is helpful
- [ ] "Open in tab" link works

## References

- [MDN: X-Frame-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options)
- [MDN: CSP frame-ancestors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/frame-ancestors)
- [OWASP: Clickjacking](https://owasp.org/www-community/attacks/Clickjacking)
