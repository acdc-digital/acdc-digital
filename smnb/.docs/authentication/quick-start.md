# Quick Start Guide

Get up and running with authentication in 5 minutes.

## 1. Prerequisites Check ✅

Make sure you have:
- [ ] Clerk account set up
- [ ] Convex project configured  
- [ ] Environment variables set
- [ ] Dependencies installed

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

## 2. Basic Usage

### Step 1: Import the Hook
```typescript
import { useAuth } from '@/lib/hooks';
```

### Step 2: Use in Your Component
```typescript
function MyComponent() {
  const { isLoading, isAuthenticated, user } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <div>Please sign in</div>;
  }
  
  return <div>Hello, {user?.name}!</div>;
}
```

That's it! 🎉

## 3. Common Patterns

### Protected Route
```typescript
import { useAuth } from '@/lib/hooks';
import { SignInButton } from '@clerk/nextjs';

function ProtectedPage() {
  const { isLoading, isAuthenticated, user } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 rounded-full border-t-transparent" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Sign in required</h1>
          <SignInButton mode="modal">
            <button className="bg-blue-500 text-white px-4 py-2 rounded">
              Sign In
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      {/* Your protected content here */}
    </div>
  );
}
```

### User Profile Display
```typescript
import { useAuth } from '@/lib/hooks';
import { UserButton } from '@clerk/nextjs';

function UserProfile() {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return null;
  
  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="font-medium">{user?.name}</p>
        <p className="text-sm text-gray-500">{user?.email}</p>
      </div>
      <UserButton afterSignOutUrl="/" />
    </div>
  );
}
```

### User-Scoped Data
```typescript
import { useQuery } from 'convex/react';
import { useUserId } from '@/lib/hooks';
import { api } from '@/convex/_generated/api';

function UserSessions() {
  const userId = useUserId();
  
  const sessions = useQuery(
    api.sessions.list,
    userId ? {} : "skip"  // Only query if user exists
  );
  
  if (!userId) {
    return <div>Please sign in to view sessions</div>;
  }
  
  return (
    <div>
      <h2>Your Sessions</h2>
      {sessions?.map(session => (
        <div key={session._id}>
          {session.name}
        </div>
      ))}
    </div>
  );
}
```

## 4. Error Handling

### Option 1: Conditional Rendering (Recommended)
```typescript
function MyComponent() {
  const { isLoading, isAuthenticated, user } = useAuth();
  
  // Handle each state explicitly
  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <SignInPrompt />;
  
  // TypeScript knows user is not null here
  return <div>Hello, {user.name}!</div>;
}
```

### Option 2: Error Boundaries
```typescript
import { useRequireAuth } from '@/lib/hooks';

function ProtectedComponent() {
  const user = useRequireAuth(); // Throws if not authenticated
  
  // User is guaranteed to exist here
  return <div>Hello, {user.name}!</div>;
}

// Wrap with error boundary
function App() {
  return (
    <ErrorBoundary fallback={<SignInPrompt />}>
      <ProtectedComponent />
    </ErrorBoundary>
  );
}
```

## 5. Testing Your Setup

### Test Authentication Flow
```typescript
import { useAuth } from '@/lib/hooks';

function AuthTest() {
  const { isLoading, isAuthenticated, user, signOut } = useAuth();
  
  return (
    <div className="p-4 border rounded">
      <h3>Authentication Status</h3>
      <p>Loading: {isLoading ? '✅' : '❌'}</p>
      <p>Authenticated: {isAuthenticated ? '✅' : '❌'}</p>
      <p>User ID: {user?.id || 'None'}</p>
      <p>User Name: {user?.name || 'None'}</p>
      
      {isAuthenticated && (
        <button 
          onClick={() => signOut()}
          className="mt-2 px-3 py-1 bg-red-500 text-white rounded"
        >
          Sign Out
        </button>
      )}
    </div>
  );
}
```

## 6. Next Steps

Now that you have basic authentication working:

1. **Add User Sessions** - [Session Management Guide](./session-management.md)
2. **Secure Your Routes** - [Authentication Patterns](./patterns.md)  
3. **Customize the UI** - [Component Integration Guide](./component-integration.md)
4. **Review Security** - [Security Best Practices](./security.md)

## 7. Troubleshooting

### Common Issues

#### "User not found" Error
```typescript
// ❌ Don't query immediately
const user = useQuery(api.users.getCurrentUser, {});

// ✅ Wait for authentication
const { isAuthenticated } = useAuth();
const user = useQuery(
  api.users.getCurrentUser, 
  isAuthenticated ? {} : "skip"
);
```

#### Authentication Loop
```typescript
// ❌ Don't use Convex auth wrappers with our hooks
<Authenticated>
  <MyComponent />
</Authenticated>

// ✅ Use conditional rendering
function MyComponent() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <SignInPrompt />;
  
  return <ProtectedContent />;
}
```

#### TypeScript Errors
```typescript
// ❌ User might be null
const userName = user.name;

// ✅ Check for null or use optional chaining  
const userName = user?.name;

// ✅ Or use useRequireAuth for guaranteed user
const user = useRequireAuth();
const userName = user.name; // Safe!
```

---

*Next: [API Reference](./api-reference.md)*