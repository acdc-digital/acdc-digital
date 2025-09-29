# Troubleshooting Guide

Common issues and solutions for the authentication system.

## Table of Contents
- [Authentication Issues](#authentication-issues)
- [Development Issues](#development-issues)
- [Production Issues](#production-issues)
- [Performance Issues](#performance-issues)
- [Integration Issues](#integration-issues)

## Authentication Issues

### Issue: "User not found" Error

**Symptoms:**
- Error: `User not found` in console
- Authentication seems successful but user data is null
- Components show unauthenticated state despite being signed in

**Causes & Solutions:**

1. **User not created in Convex database**
   ```typescript
   // Check if UserInitializer is running
   // In ConvexClientProvider.tsx, ensure:
   <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
     <UserInitializer />  {/* Make sure this is present */}
     {children}
   </ConvexProviderWithClerk>
   ```

2. **JWT token mismatch**
   ```bash
   # Check environment variables
   echo $CLERK_JWT_ISSUER_DOMAIN
   # Should match your Clerk domain exactly
   ```

3. **Database connection issues**
   ```typescript
   // Test user creation manually
   const createUser = useMutation(api.users.upsertCurrentUser);
   
   const testUserCreation = async () => {
     try {
       await createUser({
         name: "Test User",
         email: "test@example.com"
       });
     } catch (error) {
       console.error("User creation failed:", error);
     }
   };
   ```

**Debug Steps:**
1. Check Convex dashboard for user records
2. Verify JWT configuration in Convex
3. Test `api.users.getCurrentUser` query directly
4. Check browser network tab for authentication errors

### Issue: Authentication Loop

**Symptoms:**
- Infinite redirects between sign-in and app
- Authentication state constantly changing
- Browser console shows repeated auth attempts

**Solutions:**

1. **Remove conflicting auth wrappers**
   ```typescript
   // ❌ Don't use Convex auth wrappers with useAuth
   <Authenticated>
     <MyComponent />
   </Authenticated>
   
   // ✅ Use useAuth instead
   function MyComponent() {
     const { isAuthenticated } = useAuth();
     if (!isAuthenticated) return <SignIn />;
     return <Content />;
   }
   ```

2. **Check redirect URLs in Clerk**
   ```typescript
   // In Clerk Dashboard, ensure:
   // - Sign-in URL: /sign-in
   // - Sign-up URL: /sign-up  
   // - After sign-in URL: /dashboard (not /sign-in)
   // - After sign-up URL: /dashboard (not /sign-up)
   ```

3. **Fix middleware configuration**
   ```typescript
   // middleware.ts
   import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
   
   const isPublicRoute = createRouteMatcher(['/', '/sign-in', '/sign-up']);
   
   export default clerkMiddleware((auth, req) => {
     if (!isPublicRoute(req)) auth().protect();
   });
   ```

### Issue: "CLERK_JWT_ISSUER_DOMAIN not set"

**Symptoms:**
- Error message in Convex logs
- Authentication fails silently
- JWT validation errors

**Solution:**
1. **Set in Convex Dashboard:**
   ```
   Go to: https://dashboard.convex.dev/your-project/settings/environment-variables
   Add: CLERK_JWT_ISSUER_DOMAIN = https://your-domain.clerk.accounts.dev
   ```

2. **Find your domain:**
   ```typescript
   // Check Clerk Dashboard > Configure > Domains
   // Or in your .env.local, it's the domain part of:
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...@your-domain.clerk.accounts.dev
   ```

## Development Issues

### Issue: Hot Reload Authentication Loss

**Symptoms:**
- Authentication lost on code changes
- Need to sign in again after every reload
- Development workflow interrupted

**Solutions:**

1. **Check Clerk development settings**
   ```typescript
   // In development, ensure session persistence
   // Clerk handles this automatically, but check for:
   // - Correct domain configuration
   // - Browser not in incognito mode
   // - No browser extensions blocking cookies
   ```

2. **Stable development URLs**
   ```bash
   # Use consistent localhost port
   npm run dev # Should always use same port (usually 3000)
   
   # Configure in Clerk Dashboard:
   # Allowed redirect URLs: http://localhost:3000/dashboard
   ```

### Issue: TypeScript Errors with Authentication

**Common Errors:**

1. **"User might be null" errors**
   ```typescript
   // ❌ TypeScript complains about null
   const userName = user.name;
   
   // ✅ Handle null case
   const userName = user?.name;
   
   // ✅ Or use useRequireAuth for guaranteed user
   const user = useRequireAuth();
   const userName = user.name; // Safe!
   ```

2. **Import errors**
   ```typescript
   // ❌ Wrong import
   import { useAuth } from 'convex/react';
   
   // ✅ Correct import
   import { useAuth } from '@/lib/hooks';
   ```

3. **ID type mismatches**
   ```typescript
   // ❌ String vs ID type
   const userId: string = user.id;
   
   // ✅ Use proper types
   const userId: Id<"users"> = user.id;
   ```

### Issue: Convex Function Errors

**Symptoms:**
- Functions fail with authentication errors
- "Not authenticated" errors in working functions
- Inconsistent authentication state

**Debug Steps:**

1. **Check function authentication**
   ```typescript
   // Add debug logging
   export const debugAuth = query({
     handler: async (ctx) => {
       const identity = await ctx.auth.getUserIdentity();
       console.log("Identity:", identity);
       
       if (!identity) return { authenticated: false };
       
       const user = await ctx.db
         .query("users")
         .withIndex("by_token", q => q.eq("tokenIdentifier", identity.tokenIdentifier))
         .unique();
       
       console.log("User found:", !!user);
       return { authenticated: true, hasUser: !!user };
     },
   });
   ```

2. **Verify schema matches functions**
   ```typescript
   // Ensure schema and functions use same field names
   // Schema: userId: v.id("users")
   // Function: q.eq("userId", user._id) ✅
   ```

## Production Issues

### Issue: Authentication Fails in Production

**Symptoms:**
- Works in development, fails in production
- Users can't sign in on deployed site
- Authentication errors in production logs

**Checklist:**

1. **Environment Variables:**
   ```bash
   # Verify all variables are set in production
   # Vercel: Check dashboard environment variables
   # Other platforms: Check deployment configuration
   
   CLERK_SECRET_KEY=sk_live_... (not sk_test_...)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   CLERK_JWT_ISSUER_DOMAIN=https://your-domain.clerk.accounts.dev
   ```

2. **Clerk Production Configuration:**
   ```
   - Use separate Clerk application for production
   - Configure production redirect URLs (https://)
   - Update webhook endpoints
   - Verify domain configuration
   ```

3. **HTTPS Requirements:**
   ```
   - All URLs must use HTTPS in production
   - No mixed content (HTTP resources on HTTPS page)
   - Valid SSL certificate
   ```

### Issue: Users Can't Access Their Data

**Symptoms:**
- Users signed in but see empty state
- Data exists in database but not shown to user
- "No sessions found" despite having sessions

**Debug Process:**

1. **Check user ID consistency**
   ```typescript
   // Add debug component
   function UserDebug() {
     const { user } = useAuth();
     const sessions = useQuery(api.sessions.list);
     
     return (
       <div style={{position: 'fixed', top: 0, right: 0, background: 'white', padding: '1rem'}}>
         <p>User ID: {user?.id}</p>
         <p>Sessions: {sessions?.length || 0}</p>
       </div>
     );
   }
   ```

2. **Verify data ownership**
   ```typescript
   // Check session ownership in database
   export const debugSessions = query({
     handler: async (ctx) => {
       const user = await getCurrentUser(ctx);
       const allSessions = await ctx.db.query("sessions").collect();
       const userSessions = allSessions.filter(s => s.userId === user._id);
       
       return {
         totalSessions: allSessions.length,
         userSessions: userSessions.length,
         userId: user._id,
       };
     },
   });
   ```

## Performance Issues

### Issue: Slow Authentication Checks

**Symptoms:**
- Long loading times on authentication
- Multiple unnecessary re-renders
- Sluggish user interface

**Optimizations:**

1. **Memoize authentication state**
   ```typescript
   // In useAuth hook
   const authState = useMemo(() => ({
     isLoading,
     isAuthenticated,
     user,
     hasUser: !!user,
   }), [isLoading, isAuthenticated, user]);
   
   return {
     ...authState,
     signOut,
   };
   ```

2. **Optimize query dependencies**
   ```typescript
   // ❌ Query runs too often
   const sessions = useQuery(api.sessions.list, {});
   
   // ✅ Only query when authenticated
   const { isAuthenticated } = useAuth();
   const sessions = useQuery(
     api.sessions.list,
     isAuthenticated ? {} : "skip"
   );
   ```

3. **Reduce re-renders**
   ```typescript
   // ❌ Creates new object each render
   const authProps = { isLoading, isAuthenticated, user };
   
   // ✅ Stable reference
   const authProps = useMemo(
     () => ({ isLoading, isAuthenticated, user }),
     [isLoading, isAuthenticated, user]
   );
   ```

### Issue: Too Many Database Queries

**Symptoms:**
- High Convex usage
- Slow page loads
- Quota exceeded warnings

**Solutions:**

1. **Combine related queries**
   ```typescript
   // ❌ Multiple separate queries
   const user = useQuery(api.users.getCurrentUser);
   const sessions = useQuery(api.sessions.list);
   const messages = useQuery(api.messages.recent);
   
   // ✅ Single dashboard query
   const dashboard = useQuery(api.dashboard.getData);
   // Returns { user, sessions, messages } in one query
   ```

2. **Use pagination**
   ```typescript
   // ❌ Load all sessions
   const sessions = useQuery(api.sessions.list);
   
   // ✅ Paginate large datasets
   const { results, status, loadMore } = usePaginatedQuery(
     api.sessions.list,
     {},
     { initialNumItems: 20 }
   );
   ```

## Integration Issues

### Issue: Conflicts with Other Auth Libraries

**Symptoms:**
- Multiple authentication states
- Conflicting session management
- Unexpected sign-outs

**Solutions:**

1. **Remove conflicting libraries**
   ```bash
   # Remove other auth packages
   npm uninstall next-auth auth0 firebase-auth
   
   # Use only Clerk + our hooks
   ```

2. **Clean up existing auth code**
   ```typescript
   // Remove old auth patterns
   // - Remove auth context providers
   // - Remove manual token management
   // - Remove custom auth hooks
   
   // Use only:
   import { useAuth } from '@/lib/hooks';
   ```

### Issue: SSR/Hydration Mismatches

**Symptoms:**
- Hydration errors in console
- Flash of wrong content
- Authentication state mismatch between server/client

**Solutions:**

1. **Handle SSR properly**
   ```typescript
   // ❌ Don't render auth-dependent content on server
   function MyComponent() {
     const { isAuthenticated } = useAuth();
     return <div>{isAuthenticated ? "Signed In" : "Not Signed In"}</div>;
   }
   
   // ✅ Use client-only rendering for auth content
   function MyComponent() {
     const { isLoading, isAuthenticated } = useAuth();
     
     if (isLoading) return <div>Loading...</div>;
     return <div>{isAuthenticated ? "Signed In" : "Not Signed In"}</div>;
   }
   ```

2. **Use dynamic imports**
   ```typescript
   import dynamic from 'next/dynamic';
   
   const AuthenticatedContent = dynamic(
     () => import('./AuthenticatedContent'),
     { ssr: false }
   );
   ```

## Getting Help

### Debug Information to Collect

When reporting issues, include:

1. **Environment Information:**
   ```bash
   # Package versions
   npm ls @clerk/nextjs convex
   
   # Node version
   node --version
   
   # Next.js version
   npx next --version
   ```

2. **Error Messages:**
   - Full error text from console
   - Network tab errors
   - Convex function logs

3. **Reproduction Steps:**
   - Minimal code example
   - Steps to reproduce
   - Expected vs actual behavior

4. **Configuration:**
   - Environment variable names (not values!)
   - Clerk dashboard settings
   - Convex auth configuration

### Community Resources

- **Clerk Discord:** [discord.gg/clerk](https://discord.gg/clerk)
- **Convex Discord:** [discord.gg/convex](https://discord.gg/convex)  
- **GitHub Issues:** Create minimal reproduction
- **Stack Overflow:** Tag with `clerk` and `convex`

---

*If you encounter an issue not covered here, please contribute to this guide by documenting the solution.*