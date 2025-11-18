# Quick Start: Canvas Component System

## Setup Steps

### 1. Start Convex Development Server

```bash
cd /Users/matthewsimon/Projects/acdc-digital/stdio
npx convex dev
```

This will:
- Generate TypeScript types in `convex/_generated/`
- Push the schema to Convex
- Watch for changes

**Important**: Keep this terminal running!

### 2. Start Next.js Development Server

In a new terminal:

```bash
cd /Users/matthewsimon/Projects/acdc-digital/stdio
npm run dev
```

The app will be available at `http://localhost:9998`

### 3. Access the Canvas

1. Open `http://localhost:9998` in your browser
2. The **Welcome** tab should now show the Canvas component
3. You'll see:
   - Left side: Code editor
   - Right side: Live preview with device mode controls
   - Bottom right: Saved components panel

## Testing the Canvas

### Try the Default Example

The canvas loads with a simple HTML example. Click around to test:

1. **Edit Code**: Modify the HTML in the left editor
2. **See Changes**: Preview updates automatically
3. **Device Modes**: Click desktop/tablet/mobile icons
4. **Save Component**: Click "Save" button in top right
5. **Load Saved**: Click any saved component in bottom panel

### Create a React Component

1. Change framework dropdown to "React"
2. Replace code with:

```jsx
function App() {
  const [count, setCount] = React.useState(0);
  
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ color: '#2563eb' }}>React Counter</h1>
      <p style={{ fontSize: '2rem', margin: '1rem 0' }}>{count}</p>
      <button 
        onClick={() => setCount(count + 1)}
        style={{
          padding: '0.5rem 1rem',
          background: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: 'pointer'
        }}
      >
        Increment
      </button>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
```

3. Save the component
4. Click to test the counter

## What Was Implemented

✅ **Convex Integration**
- ConvexClientProvider added to root layout
- Schema extended with `generatedComponents` table
- 5 backend functions for CRUD operations

✅ **Canvas Components**
- ComponentCanvas (main container)
- PreviewFrame (iframe renderer)
- CanvasControls (device modes, refresh)
- ComponentStorage (saved components list)

✅ **Security**
- Sandboxed iframes (`allow-scripts allow-same-origin`)
- CSP headers in preview HTML
- Data URL rendering (no CORS issues)
- 100KB code size limit

✅ **Editor Integration**
- Canvas renders in Welcome tab
- Tab system preserved
- VSCode theme styling maintained

## Files Created/Modified

### Created:
- `components/ConvexClientProvider.tsx`
- `app/_components/canvas/ComponentCanvas.tsx`
- `app/_components/canvas/PreviewFrame.tsx`
- `app/_components/canvas/CanvasControls.tsx`
- `app/_components/canvas/ComponentStorage.tsx`
- `app/_components/canvas/index.ts`
- `app/_components/canvas/README.md`
- `convex/components.ts`

### Modified:
- `app/layout.tsx` (added ConvexClientProvider)
- `convex/schema.ts` (added generatedComponents table)
- `app/_components/Editor.tsx` (integrated canvas)

## Next Steps

### Chat Integration (Future)
- Connect canvas to ChatPanel for AI generation
- Parse AI responses to extract component code
- Auto-save generated components
- Stream component updates in real-time

### Enhanced Features (Future)
- Tailwind CSS integration
- Multiple file support
- Component exports
- Version history
- Collaborative editing

## Troubleshooting

**TypeScript errors**: Run `npx convex dev` first to generate types

**Preview not loading**: Check browser console for errors

**Can't save components**: Ensure Convex dev server is running

**Port already in use**: stdio runs on port 9998 by default
