# Tailwind Component Patterns

Reusable patterns for ACDC Digital projects.

## Buttons

### Primary Button
```tsx
<button className="
  px-6 py-3 
  bg-acdc-primary hover:bg-acdc-primary/90 
  text-white font-semibold 
  rounded-xl
  shadow-lg hover:shadow-xl
  transition-all duration-250
  hover:-translate-y-0.5 active:translate-y-0
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acdc-primary/50
">
  Primary Action
</button>
```

### Secondary Button
```tsx
<button className="
  px-6 py-3 
  bg-transparent 
  border-2 border-acdc-primary 
  text-acdc-primary 
  font-semibold 
  rounded-xl
  transition-all duration-250
  hover:bg-acdc-primary hover:text-white
  hover:-translate-y-0.5
">
  Secondary Action
</button>
```

### Ghost Button
```tsx
<button className="
  px-4 py-2 
  bg-transparent 
  text-neutral-600 dark:text-neutral-400
  font-medium 
  rounded-lg
  transition-all duration-200
  hover:bg-neutral-100 dark:hover:bg-neutral-800
  hover:text-acdc-primary
">
  Ghost Action
</button>
```

## Cards

### Base Card
```tsx
<div className="
  bg-white dark:bg-neutral-800
  border border-neutral-200 dark:border-neutral-700
  rounded-2xl
  p-6
  shadow-card
  transition-all duration-250
">
  {/* Content */}
</div>
```

### Interactive Card
```tsx
<div className="
  bg-white dark:bg-neutral-800
  border border-neutral-200 dark:border-neutral-700
  rounded-2xl
  p-6
  shadow-card
  transition-all duration-250
  cursor-pointer
  hover:-translate-y-1 hover:shadow-card-hover
">
  {/* Content */}
</div>
```

### Glass Card (SMNB-style)
```tsx
<div className="
  backdrop-blur-xl 
  bg-white/80 dark:bg-neutral-900/80
  border border-white/20 dark:border-neutral-700/50
  rounded-2xl
  p-6
  shadow-2xl
">
  {/* Content */}
</div>
```

## Form Inputs

### Text Input
```tsx
<input 
  type="text"
  className="
    w-full
    px-4 py-3
    bg-white dark:bg-neutral-800
    border-2 border-neutral-300 dark:border-neutral-600
    rounded-lg
    text-base
    placeholder:text-neutral-500
    transition-all duration-200
    focus:outline-none focus:border-acdc-primary
    focus:ring-2 focus:ring-acdc-primary/20
  "
  placeholder="Enter text..."
/>
```

### Form Label
```tsx
<label className="
  block
  text-sm font-medium
  text-neutral-700 dark:text-neutral-300
  mb-2
">
  Label Text
</label>
```

## Layout Patterns

### Page Container
```tsx
<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {/* Page content */}
</div>
```

### Responsive Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Grid items */}
</div>
```

### Centered Content
```tsx
<div className="max-w-content mx-auto">
  {/* Reading content */}
</div>
```

## Animation Patterns

### Fade In on Load
```tsx
<div className="animate-in fade-in duration-500">
  {/* Content */}
</div>
```

### Staggered List
```tsx
{items.map((item, i) => (
  <div 
    key={item.id}
    className="animate-in fade-in slide-in-from-bottom-4 duration-500"
    style={{ animationDelay: `${i * 100}ms` }}
  >
    {item.content}
  </div>
))}
```

### Hover Scale
```tsx
<div className="transition-transform duration-300 hover:scale-105">
  {/* Content */}
</div>
```

### Group Hover Effect
```tsx
<div className="group relative overflow-hidden rounded-2xl">
  <div className="
    absolute inset-0 
    bg-gradient-to-r from-acdc-primary/20 to-acdc-accent/20
    opacity-0 group-hover:opacity-100 
    transition-opacity duration-500
  " />
  <img className="transition-transform duration-500 group-hover:scale-105" />
</div>
```

## Status Indicators

### Live Dot
```tsx
<span className="
  inline-flex items-center gap-2
">
  <span className="
    w-2 h-2 
    bg-status-success 
    rounded-full 
    animate-pulse
  " />
  Live
</span>
```

### Badge
```tsx
<span className="
  inline-flex items-center
  px-2.5 py-0.5
  text-xs font-medium
  bg-acdc-primary/10 text-acdc-primary
  rounded-full
">
  Badge
</span>
```

## Dark Mode Toggle

```tsx
<button 
  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
  className="
    p-2 
    rounded-lg
    text-neutral-600 dark:text-neutral-400
    hover:bg-neutral-100 dark:hover:bg-neutral-800
    transition-colors
  "
>
  {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
</button>
```
