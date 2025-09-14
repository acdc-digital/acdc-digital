# GitHub Copilot Instructions for Donut Package

## Project Overview
This is the **Donut** package within the ACDC Digital monorepo workspace. It's a Next.js 15+ application focused on interactive data visualization using donut/pie charts with shadcn/ui components and recharts library.

## Technology Stack
- **Frontend**: Next.js 15+ with App Router, TypeScript, React 18+
- **Styling**: Tailwind CSS with shadcn/ui component system
- **Charts**: Recharts library for React-based data visualizations
- **Backend**: Convex (inherited from parent workspace but not actively used)
- **Language**: TypeScript throughout
- **Package Manager**: pnpm (workspace-level)

## Architecture & File Organization

### Component Structure
```
components/
├── donutChart.tsx               # Main composite component (chart + stats)
├── ui/
│   ├── donutChartPrimitive.tsx  # Low-level chart rendering
│   ├── card.tsx                 # shadcn Card variants
│   ├── button.tsx               # shadcn Button component
│   └── [other-ui-components]    # Future shadcn components
└── .github/
    └── copilot-instructions.md  # This file
```

### Data & Utilities
```
lib/
├── mockData.ts                  # Abstracted sample data (easily removable)
├── utils.ts                     # Utility functions (cn helper, etc.)
└── [other-utils]               # Future utility modules
```

## Core Coding Standards

### File Header Convention
All TypeScript/JSX files must include a standardized header at the very top:

```typescript
// [Descriptive Title]
// [Full Absolute File Path]

"use client" // (if applicable)
// ... rest of file content
```

**Examples:**
```typescript
// Donut Chart Component
// /Users/matthewsimon/Projects/acdc-digital/donut/components/donutChart.tsx

"use client"

import { DonutChart as DonutChartPrimitive } from "@/components/ui/donutChartPrimitive"
// ... rest of imports and code
```

```typescript
// Donut Chart Primitive - Low-level Chart Rendering
// /Users/matthewsimon/Projects/acdc-digital/donut/components/ui/donutChartPrimitive.tsx

"use client"

import * as React from "react"
// ... rest of imports and code
```

```typescript
// Browser Usage Mock Data
// /Users/matthewsimon/Projects/acdc-digital/donut/lib/mockData.ts

export const browserUsageData = [
// ... data content
```

**Header Rules:**
1. **Title Line**: Descriptive, human-readable component/file purpose
2. **Path Line**: Complete absolute file path from project root
3. **Spacing**: One blank line after header before any imports or directives
4. **Client Directive**: Place `"use client"` immediately after header (when needed)

### Component Development Guidelines
1. **Component Hierarchy**:
   - `donutChart.tsx` is the main exportable component
   - `ui/donutChartPrimitive.tsx` handles low-level chart rendering
   - Follow the pattern: composite component → primitive component

2. **Naming Conventions**:
   - Main components: `PascalCase` (e.g., `DonutChart`)
   - UI primitives: `PascalCase` with `Primitive` suffix in filename
   - Files: `camelCase.tsx` (e.g., `donutChartPrimitive.tsx`)

3. **Import/Export Patterns**:
```typescript
// ✅ Preferred - Clear aliasing for primitives
import { DonutChart as DonutChartPrimitive } from "@/components/ui/donutChartPrimitive"

// ✅ Main component export
export function DonutChart({ data }: DonutChartProps) { ... }
```

### TypeScript Guidelines
1. **Interface Definitions**:
```typescript
// ✅ Data structure for chart components
interface ChartDataItem {
  name: string
  value: number
  fill: string
}

interface DonutChartProps {
  data: Array<ChartDataItem>
  className?: string
}
```

2. **Props Patterns**:
   - Always define explicit interfaces for component props
   - Use `Array<Type>` syntax instead of `Type[]`
   - Include optional `className?: string` for styling flexibility

### Recharts Integration Standards
1. **Chart Configuration**:
```typescript
// ✅ Standard donut chart setup
<PieChart>
  <Pie
    data={data}
    cx="50%"
    cy="50%"
    innerRadius={60}
    outerRadius={100}
    dataKey="value"
    strokeWidth={5}
  >
    {data.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={entry.fill} />
    ))}
  </Pie>
</PieChart>
```

2. **Responsive Containers**:
   - Always wrap charts in `ResponsiveContainer`
   - Use consistent sizing: `w-full h-[400px]` for charts

### shadcn/ui Component Usage
1. **Card Components**:
   - Use `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
   - Maintain consistent structure across chart displays

2. **Layout Patterns**:
```typescript
// ✅ Two-column chart + statistics layout
<div className="grid gap-6 lg:grid-cols-2">
  <Card>{/* Chart */}</Card>
  <Card>{/* Statistics */}</Card>
</div>
```

### Data Management
1. **Mock Data Location**:
   - Store in `lib/mockData.ts` for easy removal
   - Export as named constants: `export const browserUsageData = [...]`

2. **Data Flow**:
   - Page imports data from `lib/mockData.ts`
   - Page passes data to main component
   - Main component passes data to primitive component

## Styling Guidelines

### Tailwind CSS Patterns
1. **Layout Classes**:
   - Container: `min-h-screen bg-background text-foreground`
   - Content wrapper: `container mx-auto px-4 py-8`
   - Card grids: `grid gap-6 lg:grid-cols-2`

2. **Typography**:
   - Main headings: `text-4xl font-bold mb-4`
   - Descriptions: `text-lg text-muted-foreground`
   - Stats labels: `text-sm font-medium`

3. **Color Indicators**:
   - Use `w-3 h-3 rounded-full` for color swatches
   - Apply colors via `style={{ backgroundColor: item.fill }}`

### shadcn Theme Integration
- Follow shadcn color variables: `bg-background`, `text-foreground`, `text-muted-foreground`
- Use chart color variables when available: `hsl(var(--chart-1))`, etc.

## Development Patterns

### Component Composition
1. **Main Component Structure**:
```typescript
export function DonutChart({ data }: DonutChartProps) {
  const totalUsers = data.reduce((sum, item) => sum + item.value, 0)
  
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Chart Card */}
      {/* Statistics Card */}
    </div>
  )
}
```

2. **Statistics Display**:
   - Map through data for individual stats
   - Calculate totals using `reduce`
   - Include color indicators and labels

### File Creation Guidelines
1. **New Components**:
   - Place composite components in `components/`
   - Place UI primitives in `components/ui/`
   - Follow existing naming patterns

2. **Data Files**:
   - Abstract mock/sample data to `lib/` folder
   - Use descriptive export names
   - Include TypeScript interfaces

## Performance Considerations
- Use `ResponsiveContainer` for chart responsiveness
- Implement proper `key` props in mapped elements
- Consider memoization for expensive calculations in larger datasets

## Code Quality Standards
- **No inline styles** - Use Tailwind classes or CSS variables
- **Proper TypeScript** - No `any` types, explicit interfaces
- **Accessible components** - Follow shadcn accessibility patterns
- **Clean imports** - Organize imports logically, avoid conflicts

## Common Patterns to Follow
1. **File headers** - Always include descriptive title and full path at top of files
2. **Data abstraction** - Keep mock data separate and easily removable
3. **Component composition** - Build complex components from simpler primitives
4. **Consistent styling** - Use established Tailwind and shadcn patterns
5. **Type safety** - Define clear interfaces for all data structures

## Testing Considerations
- Ensure components render with various data shapes
- Test responsive behavior across screen sizes
- Verify chart interactions and hover states
- Validate accessibility features

Remember: This package is designed for interactive data visualization with a focus on clean, reusable components and easy data management.