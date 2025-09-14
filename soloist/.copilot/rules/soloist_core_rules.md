# Soloist Pro - Core Development Rules

## 🏗️ PROJECT OVERVIEW

Soloist is a dynamic personal analytics platform that transforms daily experiences into actionable insights through intelligent mood tracking and predictive analysis. This is the core architectural guide that complements the specialized rules files (convex_rules.md, authentication_rules.md, stripe_rules.md).

## 🎯 ARCHITECTURE PRINCIPLES

### Monorepo Structure
```
solopro/
├── convex/              # Backend (Convex serverless functions)
├── renderer/            # Desktop app frontend (Next.js)
├── website/             # Public website (Next.js)
├── electron/            # Desktop app wrapper (Electron)
└── docs/               # Documentation
```

### Core Tech Stack (NON-NEGOTIABLE)
- **Framework**: Next.js 15+ with App Router (NEVER Pages Router)
- **Language**: TypeScript with strict mode (NO JavaScript files)
- **Styling**: Tailwind CSS with CSS variables for theming
- **Components**: Shadcn/UI (built on Radix UI primitives)
- **Icons**: Lucide React + Radix Icons (consistent iconography)
- **State**: Zustand for client state, Convex reactive queries for server state
- **Forms**: React Hook Form with proper validation
- **Charts**: Recharts for data visualization
- **Dates**: date-fns (NOT moment.js or other libraries)
- **Backend**: Convex serverless (see convex_rules.md)
- **Auth**: Convex Auth (see authentication_rules.md)
- **Payments**: Stripe (see stripe_rules.md)

## 🎨 COMPONENT ARCHITECTURE

### Design System Requirements
- **Always use Shadcn/UI components** as the foundation
- Build custom components on Radix UI primitives
- Maintain consistent design system with CSS variables
- Use Lucide React icons for ALL iconography
- Support dark/light themes with smooth transitions

### Component File Structure
```typescript
// Component structure pattern
interface ComponentProps {
  // Always define proper TypeScript interfaces
}

export function ComponentName({ }: ComponentProps) {
  // Component implementation
}

// Export as default AND named export
export default ComponentName;
```

### Naming Conventions
- **Components**: PascalCase (e.g., `DailyLogForm.tsx`)
- **Files/folders**: camelCase (e.g., `useAppVersion.ts`)
- **Constants**: SCREAMING_SNAKE_CASE
- **CSS classes**: Tailwind utilities, custom classes in kebab-case
- **Database fields**: camelCase (e.g., `userId`, `createdAt`)

## 🗃️ DATABASE DESIGN PATTERNS

### Core Schema Principles
- Use Convex native types: `Id<"tableName">`, `v.string()`, `v.number()`
- Always include `userId: Id<"users">` for user-scoped data
- Include `createdAt: number` and `updatedAt: number` timestamps
- Use consistent field naming (camelCase)

### Primary Data Models
```typescript
// dailyLogs - Core user mood tracking data
{
  _id: Id<"dailyLogs">,
  userId: Id<"users">,           // Always scope to user
  date: string,                  // YYYY-MM-DD format
  score: number,                 // 0-100 mood score
  notes?: string,                // User notes
  tags?: string[],               // Activity tags
  media?: string[],              // Base64 encoded images
  createdAt: number,             // Unix timestamp
  updatedAt: number
}

// forecasts - AI-generated predictions
{
  _id: Id<"forecasts">,
  userId: Id<"users">,
  baseDate: string,              // Date forecast was generated from
  predictions: Array<{
    date: string,
    predictedScore: number,
    confidence: number,          // 0-100
    reasoning: string
  }>,
  trend: "up" | "down" | "stable",
  createdAt: number
}
```

### Query Patterns
```typescript
// Always use proper error handling
const data = useQuery(api.dailyLogs.getByDateRange, {
  userId: user?._id,
  startDate,
  endDate
});

// Handle loading and error states
if (data === undefined) return <LoadingSkeleton />;
if (data === null) return <NoDataState />;
```

## 🎛️ STATE MANAGEMENT

### Zustand Store Patterns
```typescript
interface StoreState {
  // Define clear state shape
  selectedDate: string;
  sidebarOpen: boolean;
  // Actions
  setSelectedDate: (date: string) => void;
  toggleSidebar: () => void;
}

const useStore = create<StoreState>((set, get) => ({
  selectedDate: new Date().toISOString().split('T')[0],
  sidebarOpen: true,
  setSelectedDate: (date) => set({ selectedDate: date }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen }))
}));
```

### Store Organization
- **feedStore**: Selected date, active tab, feed state
- **sidebarStore**: Navigation state, collapsed state
- **userStore**: User preferences, subscription status
- **TestingStore**: Playground-specific state

## 🎨 UI/UX DESIGN PRINCIPLES

### Mood Color System (6-tier)
```css
:root {
  --mood-struggling: 0 84.2% 60.2%;     /* Red */
  --mood-getting-by: 25 95% 53%;        /* Orange */
  --mood-doing-okay: 45 93% 47%;        /* Yellow */
  --mood-doing-well: 142 69% 58%;       /* Light Green */
  --mood-thriving: 142 76% 36%;         /* Green */
  --mood-excellent: 142 76% 26%;        /* Dark Green */
}
```

### Responsive Design Requirements
- **Mobile-first**: Design for mobile, enhance for desktop
- **Breakpoints**: Use Tailwind breakpoints (sm, md, lg, xl)
- **Touch-friendly**: Minimum 44px touch targets
- **Keyboard navigation**: Support for all interactive elements

### Loading States
```typescript
// Always provide proper loading states
const LoadingComponent = () => (
  <div className="space-y-4">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);
```

## 📊 DATA VISUALIZATION

### Chart Requirements
- **Library**: Recharts for ALL data visualization
- **Responsiveness**: Charts must adapt to container size
- **Theming**: Support dark/light themes
- **Accessibility**: Include proper ARIA labels and tooltips

### Heatmap Specifications
- **Layout**: 365-day grid for year view
- **Interaction**: Click-to-edit, hover for details
- **Color mapping**: Use mood color system
- **Performance**: Virtualization for large datasets

## 🤖 AI INTEGRATION PATTERNS

### OpenAI Integration
```typescript
// Proper AI integration with error handling
const generateAIInsight = async (data: UserData) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [...],
      temperature: 0.7,
      max_tokens: 500
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error("AI generation failed:", error);
    return "Unable to generate insight at this time.";
  }
};
```

### AI Feature Requirements
- **Forecasting**: 3-day mood predictions with confidence scores
- **Consultations**: Daily insights based on mood patterns
- **Weekly Analysis**: Pattern recognition and recommendations
- **Auto-summaries**: Generated summaries of daily entries

## 🔄 CROSS-PLATFORM CONSIDERATIONS

### Environment Detection
```typescript
// Detect platform context
const isElectron = typeof window !== 'undefined' && window.electronAPI;
const isBrowser = typeof window !== 'undefined' && !window.electronAPI;

// Use appropriate navigation patterns
const navigation = isElectron ? electronNavigation : browserNavigation;
```

### Platform-Specific Features
- **Desktop**: File system access, native notifications, menu bars
- **Web**: URL routing, PWA features, web sharing
- **Mobile**: Touch gestures, responsive layouts, mobile-first UX

## 🚀 PERFORMANCE OPTIMIZATION

### Code Splitting Strategy
```typescript
// Use dynamic imports for heavy components
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false
});

// Route-based splitting
const DashboardPage = lazy(() => import('./DashboardPage'));
```

### Image Optimization
- Use Next.js Image component for all images
- Implement proper lazy loading
- Optimize for multiple screen densities
- Support WebP format where possible

## 🔧 ERROR HANDLING

### Error Boundary Pattern
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
  // Error boundary implementation
}

// Usage
<ErrorBoundary fallback={ErrorFallback}>
  <SomeComponent />
</ErrorBoundary>
```

### User-Friendly Error Messages
- **Color-coded**: Red for critical, amber for warnings
- **Contextual**: Provide specific next steps
- **Recoverable**: Offer retry mechanisms where appropriate
- **Logging**: Log errors for debugging without exposing sensitive data

## 📱 RESPONSIVE DESIGN REQUIREMENTS

### Breakpoint Strategy
```css
/* Mobile First Approach */
.component {
  @apply w-full;                    /* Mobile default */
  @apply md:w-1/2;                 /* Tablet */
  @apply lg:w-1/3;                 /* Desktop */
  @apply xl:w-1/4;                 /* Large desktop */
}
```

### Component Adaptability
- **Navigation**: Sidebar on desktop, drawer on mobile
- **Tables**: Horizontal scroll on mobile, full layout on desktop
- **Forms**: Stacked on mobile, side-by-side on desktop
- **Charts**: Simplified on mobile, detailed on desktop

## 🎯 ACCESSIBILITY REQUIREMENTS

### WCAG Compliance
- **Keyboard navigation**: All interactive elements accessible via keyboard
- **Screen readers**: Proper ARIA labels and descriptions
- **Color contrast**: Meet WCAG AA standards
- **Focus management**: Visible focus indicators

### Implementation Patterns
```typescript
// Proper accessibility attributes
<button
  aria-label="Save daily log"
  aria-describedby="save-help-text"
  className="focus:ring-2 focus:ring-blue-500"
>
  Save
</button>

<div id="save-help-text" className="sr-only">
  Saves your mood score and notes for the selected date
</div>
```

## 🔐 SECURITY CONSIDERATIONS

### Data Protection
- **User data isolation**: Always filter by userId
- **Input validation**: Validate all user inputs
- **XSS prevention**: Sanitize user-generated content
- **Rate limiting**: Implement via Convex Auth

### Authentication Flow
- Required email verification for new users
- Strong password requirements (8+ chars, mixed case, numbers, symbols)
- Password reset via secure email OTP
- Session management via Convex Auth

## 📦 BUILD AND DEPLOYMENT

### Build Requirements
- All TypeScript errors must be resolved
- ESLint errors must be fixed
- Build optimization for production
- Cross-platform testing required

### Version Management
- Keep all package.json versions synchronized
- Use semantic versioning consistently
- Update version references across all platforms
- Maintain compatibility matrices

## 🎛️ FEATURE FLAGS AND GATING

### Subscription-Based Features
```typescript
const useFeatureAccess = () => {
  const subscription = useSubscription();
  
  return {
    canAccessAI: subscription?.status === "active",
    canExportData: subscription?.status === "active",
    canUseDesktopApp: subscription?.status === "active",
    maxHistoryDays: subscription?.status === "active" ? Infinity : 30
  };
};
```

### Progressive Enhancement
- Core features work without premium subscription
- Enhanced features unlock with subscription
- Graceful degradation for failed AI requests
- Offline-first where possible

---

## 🎯 DEVELOPMENT CHECKLIST

### Before Every Commit
- [ ] TypeScript compilation passes
- [ ] ESLint checks pass
- [ ] Components are responsive
- [ ] Authentication is properly handled
- [ ] Error states are implemented
- [ ] Loading states are provided
- [ ] Accessibility attributes are included
- [ ] Performance is optimized

### Code Review Standards
- [ ] Follows established patterns
- [ ] Proper TypeScript types
- [ ] Consistent naming conventions
- [ ] Error handling implemented
- [ ] Comments for complex logic
- [ ] No hardcoded values
- [ ] Responsive design tested
- [ ] Cross-platform compatibility

### Release Preparation
- [ ] All package versions updated
- [ ] Version history documented
- [ ] Download links updated
- [ ] Cross-platform builds tested
- [ ] Security review completed
- [ ] Performance benchmarks met

---

## 🎨 DESIGN PHILOSOPHY

**Simplicity**: Complex AI features hidden behind intuitive interfaces
**Empathy**: Supportive, non-judgmental tone throughout
**Privacy**: User control over data with clear privacy indicators
**Performance**: Fast, responsive, and reliable user experience
**Accessibility**: Inclusive design for all users
**Consistency**: Unified experience across all platforms

This codebase represents a sophisticated personal analytics platform with AI integration. Maintain the highest standards of code quality, user experience, and security in all implementations.
