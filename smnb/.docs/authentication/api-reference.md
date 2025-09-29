# API Reference

Complete reference for all authentication hooks and utilities.

## Core Hooks

### `useAuth()`

The primary authentication hook providing unified state and user information.

```typescript
function useAuth(): UseAuthReturn
```

#### Returns

```typescript
interface UseAuthReturn {
  // Authentication state
  isLoading: boolean;      // Auth status being determined
  isAuthenticated: boolean; // User is signed in and exists in Convex
  
  // User data
  user: AuthUser | null;   // Convex user data (application layer)
  clerkUser: ClerkUser | null; // Clerk user data (UI layer)
  
  // Actions
  signOut: () => Promise<void>; // Sign out function
  
  // Convenience
  hasUser: boolean;        // Same as !!user
}
```

#### User Types

```typescript
interface AuthUser {
  id: Id<"users">;        // Convex user document ID
  name: string;           // Display name
  email: string;          // Email address
  avatarUrl?: string;     // Profile picture URL
  createdAt: number;      // Account creation timestamp
  lastActiveAt: number;   // Last activity timestamp
}
```

#### Usage Example

```typescript
function MyComponent() {
  const { isLoading, isAuthenticated, user, signOut } = useAuth();
  
  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <SignIn />;
  
  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

### `useRequireAuth()`

For components that must have an authenticated user. Throws an error if not authenticated.

```typescript
function useRequireAuth(): AuthUser
```

#### Returns
- `AuthUser` - Guaranteed authenticated user
- **Throws** - Error if user not authenticated

#### Usage Example

```typescript
function ProtectedComponent() {
  try {
    const user = useRequireAuth();
    
    return <div>Hello, {user.name}!</div>;
  } catch (error) {
    return <div>Authentication required</div>;
  }
}

// Better with Error Boundary
function App() {
  return (
    <ErrorBoundary fallback={<SignIn />}>
      <ProtectedComponent />
    </ErrorBoundary>
  );
}
```

### `useUserId()`

Returns just the current user's ID for user-scoped queries.

```typescript
function useUserId(): Id<"users"> | null
```

#### Returns
- `Id<"users">` - Current user's Convex document ID
- `null` - No authenticated user

#### Usage Example

```typescript
function UserData() {
  const userId = useUserId();
  
  const userPosts = useQuery(
    api.posts.list,
    userId ? { userId } : "skip"
  );
  
  return (
    <div>
      {userPosts?.map(post => (
        <div key={post._id}>{post.title}</div>
      ))}
    </div>
  );
}
```

## Session Management Hooks

### `useSessions()`

Manages all sessions for the current user with CRUD operations.

```typescript
function useSessions(): UseSessionsReturn
```

#### Returns

```typescript
interface UseSessionsReturn {
  // Data
  sessions: Session[];     // User's sessions
  user: AuthUser | null;   // Current user
  isAuthenticated: boolean; // Auth status
  
  // Actions
  createSession: (name?: string) => Promise<Id<"sessions">>;
  updateSession: (id: Id<"sessions">, name: string) => Promise<void>;
  deleteSession: (id: Id<"sessions">) => Promise<void>;
  duplicateSession: (id: Id<"sessions">) => Promise<Id<"sessions">>;
  
  // State
  isLoading: boolean;      // Sessions being loaded
  hasError: boolean;       // Error loading sessions
}
```

#### Usage Example

```typescript
function SessionManager() {
  const { sessions, createSession, deleteSession } = useSessions();
  
  const handleCreate = async () => {
    const sessionId = await createSession("New Session");
    console.log("Created session:", sessionId);
  };
  
  return (
    <div>
      <button onClick={handleCreate}>New Session</button>
      {sessions.map(session => (
        <div key={session._id}>
          <span>{session.name}</span>
          <button onClick={() => deleteSession(session._id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
```

### `useSession(sessionId)`

Manages a specific session with messages and settings.

```typescript
function useSession(sessionId: Id<"sessions"> | null): UseSessionReturn
```

#### Parameters
- `sessionId` - The session ID to manage, or `null`

#### Returns

```typescript
interface UseSessionReturn {
  // Data
  session: Session | null;    // Session details
  messages: Message[];        // Session messages
  
  // Actions
  sendMessage: (content: string, role?: "user" | "assistant") => Promise<void>;
  updateSettings: (settings: SessionSettings) => Promise<void>;
  
  // State
  isLoading: boolean;         // Data being loaded
  hasError: boolean;          // Error loading data
  exists: boolean;            // Session exists and user has access
}
```

#### Usage Example

```typescript
function SessionChat({ sessionId }: { sessionId: Id<"sessions"> }) {
  const { session, messages, sendMessage, exists } = useSession(sessionId);
  
  if (!exists) {
    return <div>Session not found</div>;
  }
  
  const handleSend = async (content: string) => {
    await sendMessage(content, "user");
  };
  
  return (
    <div>
      <h2>{session?.name}</h2>
      <div>
        {messages.map(message => (
          <div key={message._id}>
            <strong>{message.role}:</strong> {message.content}
          </div>
        ))}
      </div>
      <MessageInput onSend={handleSend} />
    </div>
  );
}
```

## Type Definitions

### Core Types

```typescript
// User document from Convex
interface AuthUser {
  id: Id<"users">;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: number;
  lastActiveAt: number;
}

// Session document from Convex  
interface Session {
  _id: Id<"sessions">;
  userId: Id<"users">;
  name: string;
  status: "active" | "paused" | "archived";
  settings: SessionSettings;
  _creationTime: number;
}

// Session configuration
interface SessionSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  controlMode: "hands-free" | "balanced" | "full-control";
}

// Message document from Convex
interface Message {
  _id: Id<"messages">;
  sessionId: Id<"sessions">;
  content: string;
  role: "user" | "assistant";
  _creationTime: number;
}
```

### Hook Return Types

```typescript
interface UseAuthReturn {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  clerkUser: any; // Clerk user object
  signOut: () => Promise<void>;
  hasUser: boolean;
}

interface UseSessionsReturn {
  sessions: Session[];
  user: AuthUser | null;
  isAuthenticated: boolean;
  createSession: (name?: string) => Promise<Id<"sessions">>;
  updateSession: (id: Id<"sessions">, name: string) => Promise<void>;
  deleteSession: (id: Id<"sessions">) => Promise<void>;
  duplicateSession: (id: Id<"sessions">) => Promise<Id<"sessions">>;
  isLoading: boolean;
  hasError: boolean;
}

interface UseSessionReturn {
  session: Session | null;
  messages: Message[];
  sendMessage: (content: string, role?: "user" | "assistant") => Promise<void>;
  updateSettings: (settings: SessionSettings) => Promise<void>;
  isLoading: boolean;
  hasError: boolean;
  exists: boolean;
}
```

## Clerk Integration

### Available Clerk Components

```typescript
import { 
  SignInButton, 
  SignUpButton, 
  UserButton,
  SignIn,
  SignUp 
} from '@clerk/nextjs';
```

#### SignInButton
```typescript
<SignInButton mode="modal">
  <button>Sign In</button>
</SignInButton>
```

#### UserButton
```typescript
<UserButton 
  afterSignOutUrl="/"
  appearance={{
    elements: {
      avatarBox: "w-8 h-8"
    }
  }}
/>
```

### Clerk User Access

```typescript
function ProfileCard() {
  const { clerkUser } = useAuth();
  
  return (
    <div>
      <img src={clerkUser?.imageUrl} alt="Profile" />
      <h3>{clerkUser?.fullName}</h3>
      <p>{clerkUser?.primaryEmailAddress?.emailAddress}</p>
    </div>
  );
}
```

## Error Handling

### Error Types

```typescript
// Authentication errors
class AuthenticationError extends Error {
  name = "AuthenticationError";
}

// User not found errors  
class UserNotFoundError extends Error {
  name = "UserNotFoundError";
}

// Permission errors
class UnauthorizedError extends Error {
  name = "UnauthorizedError";  
}
```

### Error Boundaries

```typescript
import React from 'react';

class AuthErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      if (this.state.error?.name === 'AuthenticationError') {
        return <SignInPrompt />;
      }
      
      return <ErrorFallback error={this.state.error} />;
    }
    
    return this.props.children;
  }
}
```

---

*Next: [Authentication Patterns](./patterns.md)*