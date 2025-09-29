# Authentication Patterns

Common implementation patterns for authentication in React components.

## Table of Contents
- [Basic Patterns](#basic-patterns)
- [Advanced Patterns](#advanced-patterns)  
- [Layout Patterns](#layout-patterns)
- [Data Fetching Patterns](#data-fetching-patterns)
- [Error Handling Patterns](#error-handling-patterns)

## Basic Patterns

### 1. Conditional Rendering Pattern

**Use Case:** Simple components that need authentication checks

```typescript
import { useAuth } from '@/lib/hooks';
import { SignInButton } from '@clerk/nextjs';

function Dashboard() {
  const { isLoading, isAuthenticated, user } = useAuth();
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }
  
  // Unauthenticated state
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to SMNB</h1>
          <p className="text-gray-600 mb-6">Sign in to access your dashboard</p>
          <SignInButton mode="modal">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
              Sign In
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }
  
  // Authenticated state - TypeScript knows user is not null
  return (
    <div>
      <h1>Welcome back, {user.name}!</h1>
      <DashboardContent />
    </div>
  );
}
```

### 2. Hook Composition Pattern

**Use Case:** Reusable authentication logic across components

```typescript
import { useAuth } from '@/lib/hooks';

// Custom hook for authentication requirements
function useRequireAuthentication() {
  const auth = useAuth();
  
  const isReady = !auth.isLoading;
  const needsAuth = isReady && !auth.isAuthenticated;
  const isAuthorized = isReady && auth.isAuthenticated;
  
  return {
    ...auth,
    isReady,
    needsAuth,
    isAuthorized,
  };
}

// Usage in components
function ProtectedComponent() {
  const { isReady, needsAuth, isAuthorized, user } = useRequireAuthentication();
  
  if (!isReady) return <LoadingSpinner />;
  if (needsAuth) return <SignInPrompt />;
  if (!isAuthorized) return <UnauthorizedMessage />;
  
  return <div>Hello, {user.name}!</div>;
}
```

### 3. Guard Component Pattern

**Use Case:** Wrapper component for protecting routes

```typescript
import { ReactNode } from 'react';
import { useAuth } from '@/lib/hooks';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
}

function AuthGuard({ 
  children, 
  fallback = <SignInPrompt />,
  requireAuth = true 
}: AuthGuardProps) {
  const { isLoading, isAuthenticated } = useAuth();
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

// Usage
function App() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  );
}
```

## Advanced Patterns

### 4. Role-Based Access Pattern

**Use Case:** Different access levels for different users

```typescript
import { useAuth } from '@/lib/hooks';

type UserRole = 'admin' | 'editor' | 'viewer';

function useUserRole(): UserRole | null {
  const { user } = useAuth();
  
  // Determine role from user data
  // This could come from user metadata, database lookup, etc.
  if (user?.email?.endsWith('@admin.com')) return 'admin';
  if (user?.email?.endsWith('@editor.com')) return 'editor';
  return 'viewer';
}

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { isAuthenticated } = useAuth();
  const userRole = useUserRole();
  
  if (!isAuthenticated) {
    return <SignInPrompt />;
  }
  
  if (userRole && !allowedRoles.includes(userRole)) {
    return fallback || <div>Access denied</div>;
  }
  
  return <>{children}</>;
}

// Usage
function AdminPanel() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <AdminDashboard />
    </RoleGuard>
  );
}
```

### 5. Optimistic Updates Pattern

**Use Case:** Immediate UI updates with authentication context

```typescript
import { useMutation } from 'convex/react';
import { useAuth } from '@/lib/hooks';
import { api } from '@/convex/_generated/api';

function useOptimisticProfile() {
  const { user } = useAuth();
  const updateProfile = useMutation(api.users.updateProfile);
  const [optimisticUser, setOptimisticUser] = useState(user);
  
  const updateUserName = async (newName: string) => {
    // Optimistic update
    setOptimisticUser(prev => prev ? { ...prev, name: newName } : prev);
    
    try {
      await updateProfile({ name: newName });
    } catch (error) {
      // Revert on error
      setOptimisticUser(user);
      throw error;
    }
  };
  
  // Sync with real user data
  useEffect(() => {
    setOptimisticUser(user);
  }, [user]);
  
  return {
    user: optimisticUser,
    updateUserName,
  };
}
```

### 6. Multi-Step Authentication Pattern

**Use Case:** Onboarding flow with authentication

```typescript
import { useAuth } from '@/lib/hooks';

type OnboardingStep = 'auth' | 'profile' | 'preferences' | 'complete';

function useOnboardingFlow() {
  const { isAuthenticated, user } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('auth');
  
  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentStep('auth');
    } else if (!user?.profileComplete) {
      setCurrentStep('profile');  
    } else if (!user?.preferencesSet) {
      setCurrentStep('preferences');
    } else {
      setCurrentStep('complete');
    }
  }, [isAuthenticated, user]);
  
  return {
    currentStep,
    isComplete: currentStep === 'complete',
    nextStep: () => {
      // Logic to advance to next step
    },
  };
}

function OnboardingFlow() {
  const { currentStep, isComplete } = useOnboardingFlow();
  
  if (isComplete) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <div>
      {currentStep === 'auth' && <AuthStep />}
      {currentStep === 'profile' && <ProfileStep />}
      {currentStep === 'preferences' && <PreferencesStep />}
    </div>
  );
}
```

## Layout Patterns

### 7. Authenticated Layout Pattern

**Use Case:** Layout that adapts based on authentication status

```typescript
import { useAuth } from '@/lib/hooks';
import { UserButton } from '@clerk/nextjs';

function AppLayout({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, user } = useAuth();
  
  if (isLoading) {
    return <FullPageLoader />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated ? (
        <>
          {/* Authenticated Layout */}
          <header className="bg-white shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
              <Logo />
              <div className="flex items-center gap-4">
                <span>Welcome, {user?.name}</span>
                <UserButton />
              </div>
            </div>
          </header>
          <main className="container mx-auto py-6">
            {children}
          </main>
        </>
      ) : (
        <>
          {/* Public Layout */}
          <header className="bg-white shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
              <Logo />
              <SignInButton />
            </div>
          </header>
          <main>
            {children}
          </main>
        </>
      )}
    </div>
  );
}
```

### 8. Sidebar Navigation Pattern

**Use Case:** Navigation that shows different options for authenticated users

```typescript
import { useAuth } from '@/lib/hooks';

function Sidebar() {
  const { isAuthenticated, user } = useAuth();
  
  const publicNavItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
  ];
  
  const authenticatedNavItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/sessions', label: 'Sessions' },
    { href: '/settings', label: 'Settings' },
  ];
  
  const navItems = isAuthenticated ? authenticatedNavItems : publicNavItems;
  
  return (
    <nav className="w-64 bg-gray-900 text-white">
      <div className="p-4">
        {isAuthenticated && (
          <div className="mb-6">
            <img 
              src={user?.avatarUrl} 
              alt="Profile"
              className="w-10 h-10 rounded-full mb-2"
            />
            <p className="font-semibold">{user?.name}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        )}
        
        <ul>
          {navItems.map(item => (
            <li key={item.href}>
              <Link 
                href={item.href}
                className="block py-2 px-4 hover:bg-gray-700 rounded"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
```

## Data Fetching Patterns

### 9. User-Scoped Queries Pattern

**Use Case:** Automatically scope queries to current user

```typescript
import { useQuery } from 'convex/react';
import { useUserId } from '@/lib/hooks';
import { api } from '@/convex/_generated/api';

function UserSessions() {
  const userId = useUserId();
  
  // Query automatically skips if no user
  const sessions = useQuery(
    api.sessions.list,
    userId ? {} : "skip"
  );
  
  const userProjects = useQuery(
    api.projects.getUserProjects,
    userId ? { userId } : "skip"
  );
  
  if (!userId) {
    return <div>Please sign in to view your data</div>;
  }
  
  return (
    <div>
      <h2>Your Sessions</h2>
      {sessions?.map(session => (
        <SessionCard key={session._id} session={session} />
      ))}
      
      <h2>Your Projects</h2>
      {userProjects?.map(project => (
        <ProjectCard key={project._id} project={project} />
      ))}
    </div>
  );
}
```

### 10. Paginated Data Pattern

**Use Case:** Paginated queries with authentication

```typescript
import { usePaginatedQuery } from 'convex/react';
import { useAuth } from '@/lib/hooks';
import { api } from '@/convex/_generated/api';

function UserMessages() {
  const { isAuthenticated } = useAuth();
  
  const { 
    results: messages, 
    status, 
    loadMore 
  } = usePaginatedQuery(
    api.messages.list,
    isAuthenticated ? {} : "skip",
    { initialNumItems: 20 }
  );
  
  if (!isAuthenticated) {
    return <SignInPrompt />;
  }
  
  return (
    <div>
      {messages.map(message => (
        <MessageCard key={message._id} message={message} />
      ))}
      
      {status === "CanLoadMore" && (
        <button onClick={() => loadMore(10)}>
          Load More
        </button>
      )}
    </div>
  );
}
```

## Error Handling Patterns

### 11. Error Boundary Pattern

**Use Case:** Graceful error handling with authentication context

```typescript
import React, { ErrorInfo, ReactNode } from 'react';
import { useAuth } from '@/lib/hooks';

interface AuthErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class AuthErrorBoundary extends React.Component<
  { children: ReactNode },
  AuthErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Auth Error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <AuthErrorFallback error={this.state.error} />;
    }
    
    return this.props.children;
  }
}

function AuthErrorFallback({ error }: { error?: Error }) {
  const { signOut } = useAuth();
  
  if (error?.message.includes('Authentication')) {
    return (
      <div className="text-center p-8">
        <h2>Authentication Error</h2>
        <p>Please sign in again</p>
        <button onClick={() => signOut()}>
          Sign Out
        </button>
      </div>
    );
  }
  
  return <GenericErrorFallback error={error} />;
}
```

### 12. Retry Pattern

**Use Case:** Automatic retry with authentication

```typescript
import { useAuth } from '@/lib/hooks';
import { useMutation } from 'convex/react';

function useRetryableMutation<T>(
  mutation: any,
  maxRetries = 3
) {
  const { isAuthenticated } = useAuth();
  const [retryCount, setRetryCount] = useState(0);
  const mutate = useMutation(mutation);
  
  const mutateWithRetry = async (args: T) => {
    if (!isAuthenticated) {
      throw new Error('Not authenticated');
    }
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await mutate(args);
        setRetryCount(0); // Reset on success
        return result;
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        setRetryCount(attempt + 1);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  };
  
  return { mutateWithRetry, retryCount };
}
```

## Best Practices Summary

1. **Always handle loading states** - Never assume authentication is ready
2. **Use TypeScript effectively** - Let the type system help with null checks
3. **Scope queries properly** - Use `"skip"` for unauthenticated queries  
4. **Handle errors gracefully** - Provide clear feedback to users
5. **Keep UI consistent** - Use the same loading/error patterns throughout
6. **Test edge cases** - Authentication failures, network issues, etc.

---

*Next: [Component Integration Guide](./component-integration.md)*