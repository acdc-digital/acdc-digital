# Security Best Practices

Essential security considerations for production deployments.

## Table of Contents
- [Authentication Security](#authentication-security)
- [Data Protection](#data-protection)
- [API Security](#api-security)
- [Frontend Security](#frontend-security)
- [Deployment Security](#deployment-security)

## Authentication Security

### 1. JWT Configuration

Ensure proper JWT configuration in your Convex auth config:

```typescript
// convex/auth.config.js
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
```

**Security Requirements:**
- ✅ Use HTTPS-only domains for JWT issuer
- ✅ Set proper JWT expiration times (recommended: 1 hour)
- ✅ Configure JWT audience validation
- ✅ Use strong signing algorithms (RS256 recommended)

### 2. Environment Variables Security

**Production Environment Variables:**

```bash
# Required - Keep these secret!
CLERK_SECRET_KEY=sk_live_...              # Server-side only
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_... # Public safe
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Convex Dashboard Variables
CLERK_JWT_ISSUER_DOMAIN=https://your-domain.clerk.accounts.dev
```

**Security Checklist:**
- ✅ Never commit secrets to version control
- ✅ Use different keys for development/production
- ✅ Rotate keys regularly (quarterly recommended)
- ✅ Use environment-specific Clerk applications
- ✅ Monitor key usage in Clerk dashboard

### 3. Authentication Flow Security

```typescript
// ✅ Secure authentication check
function SecureComponent() {
  const { isLoading, isAuthenticated, user } = useAuth();
  
  // Always handle loading state
  if (isLoading) {
    return <LoadingSkeleton />; // Don't expose sensitive UI during loading
  }
  
  // Explicit authentication check
  if (!isAuthenticated) {
    return <RedirectToSignIn />;
  }
  
  // User is guaranteed to exist here
  return <SensitiveContent user={user} />;
}

// ❌ Insecure - don't do this
function InsecureComponent() {
  const { user } = useAuth();
  
  // Dangerous: might render sensitive content before auth check
  return (
    <div>
      {user && <SensitiveContent user={user} />}
    </div>
  );
}
```

## Data Protection

### 1. User Data Isolation

**Convex Function Security:**

```typescript
// ✅ Secure: Automatic user scoping
export const getUserSessions = query({
  args: {},
  returns: v.array(sessionValidator),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    
    if (!user) {
      throw new Error("User not found");
    }

    // Data automatically scoped to this user
    return await ctx.db
      .query("sessions")
      .withIndex("by_userId", q => q.eq("userId", user._id))
      .collect();
  },
});

// ❌ Insecure: Don't accept user ID from client
export const getSessionsInsecure = query({
  args: { userId: v.id("users") }, // ❌ Client can specify any user ID
  handler: async (ctx, args) => {
    // ❌ No authentication check
    return await ctx.db.query("sessions")
      .withIndex("by_userId", q => q.eq("userId", args.userId))
      .collect();
  },
});
```

### 2. Input Validation

**Always validate inputs with Convex validators:**

```typescript
// ✅ Secure input validation
export const createSession = mutation({
  args: {
    name: v.string(),
    settings: v.object({
      model: v.union(
        v.literal("claude-3-sonnet"),
        v.literal("claude-3-haiku"), 
        v.literal("gpt-4")
      ), // Whitelist allowed values
      temperature: v.number(), // Will be validated as number
      maxTokens: v.number(),
    }),
  },
  returns: v.id("sessions"),
  handler: async (ctx, args) => {
    // Validate temperature range
    if (args.settings.temperature < 0 || args.settings.temperature > 2) {
      throw new Error("Invalid temperature range");
    }
    
    // Validate token limits
    if (args.settings.maxTokens < 1 || args.settings.maxTokens > 4096) {
      throw new Error("Invalid token limit");
    }
    
    // Sanitize name
    const sanitizedName = args.name.trim().substring(0, 100);
    
    // ... rest of function
  },
});
```

### 3. Data Sanitization

```typescript
// Utility for sanitizing user input
function sanitizeUserInput(input: string): string {
  return input
    .trim()
    .replace(/[<>'"]/g, '') // Remove potential XSS characters
    .substring(0, 1000); // Limit length
}

// Use in mutations
export const updateProfile = mutation({
  args: {
    name: v.string(),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    await ctx.db.patch(user._id, {
      name: sanitizeUserInput(args.name),
      bio: args.bio ? sanitizeUserInput(args.bio) : undefined,
    });
  },
});
```

## API Security

### 1. Rate Limiting

Implement rate limiting for sensitive operations:

```typescript
// Rate limiting helper
const rateLimiter = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string, limit: number, windowMs: number) {
  const now = Date.now();
  const userLimit = rateLimiter.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimiter.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (userLimit.count >= limit) {
    throw new Error(`Rate limit exceeded. Try again in ${Math.ceil((userLimit.resetTime - now) / 1000)} seconds`);
  }
  
  userLimit.count++;
  return true;
}

// Use in sensitive mutations
export const createSession = mutation({
  // ... args
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    // Limit to 10 sessions per hour per user
    checkRateLimit(user._id, 10, 60 * 60 * 1000);
    
    // ... create session
  },
});
```

### 2. Input Size Limits

```typescript
// Prevent DoS attacks with large inputs
export const sendMessage = mutation({
  args: {
    sessionId: v.id("sessions"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate message size
    if (args.content.length > 10000) {
      throw new Error("Message too long");
    }
    
    // Check for binary content
    if (!/^[\x20-\x7E\s]*$/.test(args.content)) {
      throw new Error("Invalid message content");
    }
    
    // ... send message
  },
});
```

### 3. Database Query Security

```typescript
// ✅ Secure: Use proper indexes and limits
export const searchSessions = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    
    // Sanitize search query
    const searchQuery = args.query.trim().substring(0, 100);
    const limit = Math.min(args.limit || 20, 100); // Cap at 100
    
    // Use proper indexing for performance
    return await ctx.db
      .query("sessions")
      .withIndex("by_userId", q => q.eq("userId", user._id))
      .filter(q => q.field("name").includes(searchQuery))
      .take(limit);
  },
});

// ❌ Insecure: Unbounded queries
export const searchSessionsInsecure = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    // ❌ No user scoping, no limits
    return await ctx.db
      .query("sessions")
      .filter(q => q.field("name").includes(args.query))
      .collect(); // ❌ Could return entire database
  },
});
```

## Frontend Security

### 1. Prevent XSS Attacks

```typescript
// ✅ Safe: Use React's built-in XSS protection
function MessageDisplay({ message }: { message: string }) {
  return <div>{message}</div>; // React automatically escapes content
}

// ✅ Safe: Sanitize HTML if needed
import DOMPurify from 'isomorphic-dompurify';

function RichMessageDisplay({ htmlContent }: { htmlContent: string }) {
  const sanitizedHTML = DOMPurify.sanitize(htmlContent);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />;
}

// ❌ Dangerous: Never do this
function UnsafeDisplay({ htmlContent }: { htmlContent: string }) {
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />; // ❌ XSS vulnerability
}
```

### 2. Secure Data Handling

```typescript
// ✅ Safe: Don't log sensitive data
function UserProfile() {
  const { user } = useAuth();
  
  // ✅ Safe logging
  console.log('User profile loaded:', { userId: user?.id });
  
  // ❌ Don't log sensitive data
  // console.log('User data:', user); // ❌ Could expose sensitive info
  
  return <div>Welcome, {user?.name}</div>;
}

// ✅ Safe: Clear sensitive data on unmount
function SensitiveComponent() {
  const [sensitiveData, setSensitiveData] = useState<string>('');
  
  useEffect(() => {
    return () => {
      // Clear sensitive data on unmount
      setSensitiveData('');
    };
  }, []);
  
  return <ProtectedContent data={sensitiveData} />;
}
```

### 3. Content Security Policy

Add to your `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "connect-src 'self' https://*.convex.cloud https://*.clerk.accounts.dev",
              "frame-src https://*.clerk.accounts.dev",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

## Deployment Security

### 1. Environment Configuration

**Production Checklist:**

```bash
# Vercel deployment
vercel env add CLERK_SECRET_KEY
vercel env add CLERK_JWT_ISSUER_DOMAIN
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env add NEXT_PUBLIC_CONVEX_URL

# Ensure production environment in Clerk
# - Use separate Clerk application for production
# - Configure production redirect URLs
# - Enable appropriate authentication methods
# - Set up proper webhook endpoints
```

### 2. HTTPS Configuration

**Required for production:**
- ✅ All traffic over HTTPS
- ✅ HSTS headers configured  
- ✅ Secure cookies only
- ✅ No mixed content warnings

**Clerk Configuration:**
```typescript
// Ensure production URLs use HTTPS
const clerkConfig = {
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  signInUrl: '/sign-in', // Use relative URLs
  signUpUrl: '/sign-up',
  afterSignInUrl: '/dashboard',
  afterSignUpUrl: '/dashboard',
};
```

### 3. Monitoring and Logging

**Security Monitoring:**

```typescript
// Log authentication events
export const trackAuthEvent = internalMutation({
  args: {
    userId: v.id("users"),
    event: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("auth_logs", {
      userId: args.userId,
      event: args.event,
      metadata: args.metadata,
      timestamp: Date.now(),
      ipAddress: ctx.request?.headers?.['x-forwarded-for'], // If available
    });
  },
});

// Monitor failed authentication attempts
export const handleAuthFailure = mutation({
  handler: async (ctx) => {
    // Log failed attempts for monitoring
    await ctx.runMutation(internal.auth.trackAuthEvent, {
      userId: "system",
      event: "auth_failure",
      metadata: { timestamp: Date.now() },
    });
  },
});
```

### 4. Regular Security Audits

**Monthly Security Checklist:**
- [ ] Review authentication logs for anomalies
- [ ] Update dependencies (npm audit)
- [ ] Rotate API keys and secrets
- [ ] Review user access patterns
- [ ] Check for unusual data access
- [ ] Update security headers
- [ ] Review CORS settings
- [ ] Test authentication flows

**Automated Security Tools:**
```bash
# Add to package.json scripts
{
  "scripts": {
    "security:audit": "npm audit --audit-level moderate",
    "security:check": "npx @clerk/security-check",
    "security:deps": "npx depcheck"
  }
}
```

## Security Incident Response

### 1. Immediate Response Plan

If security breach suspected:

1. **Isolate** - Disable affected user accounts
2. **Assess** - Determine scope of breach  
3. **Rotate** - Change all API keys and secrets
4. **Patch** - Fix vulnerability immediately
5. **Monitor** - Watch for continued attacks
6. **Report** - Document incident for review

### 2. User Notification

```typescript
// Notify users of security events
export const notifySecurityEvent = internalMutation({
  args: {
    userId: v.id("users"),
    eventType: v.string(),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  },
  handler: async (ctx, args) => {
    // Log security event
    await ctx.db.insert("security_events", {
      userId: args.userId,
      eventType: args.eventType,
      severity: args.severity,
      timestamp: Date.now(),
    });
    
    // Send notification if high severity
    if (args.severity === "high") {
      await ctx.runMutation(internal.notifications.sendSecurityAlert, {
        userId: args.userId,
        message: `Security alert: ${args.eventType}`,
      });
    }
  },
});
```

---

*This completes our comprehensive security guide. Always stay updated with the latest security practices and monitor your application regularly.*