"use client";

import React from "react";

export default function AuthenticationPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold tracking-tight mb-4">Authentication System</h1>
        <p className="text-xl text-muted-foreground">
          Comprehensive guide to how Soloist handles user authentication, security, and session management
        </p>
      </div>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-4">Overview</h2>
        <p className="text-lg text-muted-foreground mb-4">
          Soloist uses <strong>@convex-dev/auth</strong>, a secure authentication library built specifically for Convex backends. This system provides email/password authentication with email verification, password reset capabilities, and robust session management.
        </p>
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-4">
          <h3 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">Key Features</h3>
          <ul className="list-disc list-inside space-y-2 text-blue-800 dark:text-blue-200">
            <li>Email/password authentication with customizable validation rules</li>
            <li>Email verification using one-time passwords (OTP)</li>
            <li>Password reset functionality via email</li>
            <li>Secure session management with JWT tokens</li>
            <li>Automatic user role assignment and management</li>
            <li>OAuth integration ready (GitHub OAuth configured)</li>
          </ul>
        </div>
      </section>

      {/* Authentication Architecture */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Architecture</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-semibold mb-3">Core Components</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-lg mb-2">Backend (Convex)</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">convex/auth.ts</code> - Auth configuration</li>
                  <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">convex/CustomPassword.ts</code> - Password provider</li>
                  <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">convex/ResendOTP.ts</code> - Email verification</li>
                  <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">convex/http.ts</code> - HTTP routes</li>
                  <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">convex/users.ts</code> - User management</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-lg mb-2">Frontend (Next.js)</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">app/api/auth/[...convex]/route.ts</code> - Auth proxy</li>
                  <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">auth/oauth/SignInWithGitHub.tsx</code> - Sign in UI</li>
                  <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">hooks/useConvexUser.ts</code> - Auth hook</li>
                  <li>• <code className="text-xs bg-muted px-1 py-0.5 rounded">ConvexClientProvider.tsx</code> - Context provider</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Authentication Flow */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Authentication Flow</h2>

        <div className="space-y-8">
          {/* Sign Up Flow */}
          <div>
            <h3 className="text-2xl font-semibold mb-4">Sign Up Flow</h3>
            <div className="bg-muted/50 border rounded-lg p-6 space-y-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">User Submits Registration Form</h4>
                  <p className="text-sm text-muted-foreground">User provides email and password through the registration interface. The frontend validates basic input requirements before submitting.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Password Validation</h4>
                  <p className="text-sm text-muted-foreground mb-2">The <code className="text-xs bg-background px-1 py-0.5 rounded">CustomPassword</code> provider enforces strict password requirements:</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                    <li>Minimum 8 characters long</li>
                    <li>At least one number (0-9)</li>
                    <li>At least one lowercase letter (a-z)</li>
                    <li>At least one uppercase letter (A-Z)</li>
                    <li>At least one special character (!@#$%^&amp;*...)</li>
                  </ul>
                  <div className="mt-2 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                      <strong>Security Note:</strong> If password validation fails, a <code className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded">ConvexError</code> is thrown with specific error messages. This prevents weak passwords from being stored.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Account Creation</h4>
                  <p className="text-sm text-muted-foreground mb-2">If validation passes:</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                    <li>Password is hashed using industry-standard bcrypt algorithm</li>
                    <li>User record is created in the <code className="text-xs bg-background px-1 py-0.5 rounded">users</code> table</li>
                    <li>Default role "user" is assigned via <code className="text-xs bg-background px-1 py-0.5 rounded">internal.admin.setDefaultRole</code></li>
                    <li>Auth ID is set via <code className="text-xs bg-background px-1 py-0.5 rounded">internal.users.setUserAuthId</code></li>
                  </ul>
                  <div className="mt-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded p-3">
                    <p className="text-xs text-green-800 dark:text-green-200">
                      <strong>Security:</strong> Passwords are never stored in plain text. The bcrypt algorithm adds computational cost to prevent brute-force attacks.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Email Verification Sent</h4>
                  <p className="text-sm text-muted-foreground mb-2">The <code className="text-xs bg-background px-1 py-0.5 rounded">ResendOTP</code> provider generates and sends a verification code:</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                    <li>8-digit numeric OTP generated using <code className="text-xs bg-background px-1 py-0.5 rounded">oslo/crypto</code></li>
                    <li>Email sent via Resend API with HTML and plain-text versions</li>
                    <li>Code expires after 15 minutes</li>
                    <li>Includes branding and clear instructions</li>
                  </ul>
                  <div className="mt-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded p-3">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      <strong>Implementation Detail:</strong> Emails are sent from msimon@acdc.digital (verified domain) to comply with Resend free tier restrictions. Production should use a dedicated sending domain.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">5</div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">User Verifies Email</h4>
                  <p className="text-sm text-muted-foreground">User enters the 8-digit code from their email. The system validates the code, marks the email as verified by setting <code className="text-xs bg-background px-1 py-0.5 rounded">emailVerificationTime</code>, and completes the registration process.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sign In Flow */}
          <div>
            <h3 className="text-2xl font-semibold mb-4">Sign In Flow</h3>
            <div className="bg-muted/50 border rounded-lg p-6 space-y-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Credentials Submitted</h4>
                  <p className="text-sm text-muted-foreground">User provides email and password through <code className="text-xs bg-background px-1 py-0.5 rounded">SignInWithGitHub</code> component or custom sign-in form. Request is sent to Convex Auth.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Credential Verification</h4>
                  <p className="text-sm text-muted-foreground mb-2">Convex Auth performs secure verification:</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                    <li>Looks up user by email in <code className="text-xs bg-background px-1 py-0.5 rounded">users</code> table</li>
                    <li>Compares provided password against stored bcrypt hash</li>
                    <li>Checks if email is verified (if required by configuration)</li>
                    <li>Verifies account is not locked or disabled</li>
                  </ul>
                  <div className="mt-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded p-3">
                    <p className="text-xs text-red-800 dark:text-red-200">
                      <strong>Security:</strong> Generic error messages like "Invalid credentials" prevent attackers from determining whether an email exists in the system.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Session Token Generated</h4>
                  <p className="text-sm text-muted-foreground mb-2">Upon successful authentication:</p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                    <li>JWT (JSON Web Token) is generated containing user identity</li>
                    <li>Token includes user ID, email, and other claims</li>
                    <li>Token is signed with secret key (not visible to client)</li>
                    <li>Expiration time is set (session duration)</li>
                  </ul>
                  <div className="mt-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded p-3">
                    <p className="text-xs text-green-800 dark:text-green-200">
                      <strong>Security:</strong> JWT tokens are cryptographically signed, making them tamper-proof. Any modification invalidates the signature.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">Token Stored Securely</h4>
                  <p className="text-sm text-muted-foreground">The JWT token is stored in the browser using httpOnly cookies (when possible) or secure localStorage. This token is automatically included in all subsequent requests to Convex.</p>
                  <div className="mt-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded p-3">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      <strong>HttpOnly Cookies:</strong> When available, httpOnly cookies prevent JavaScript from accessing the token, protecting against XSS attacks.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">5</div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">User Context Established</h4>
                  <p className="text-sm text-muted-foreground">The <code className="text-xs bg-background px-1 py-0.5 rounded">useConvexUser</code> hook queries <code className="text-xs bg-background px-1 py-0.5 rounded">api.auth.getUserId</code> to retrieve the authenticated user's ID. This ID is used throughout the application to fetch user-specific data.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Session Management */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Session Management</h2>
        
        <div className="space-y-6">
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">How Sessions Work</h3>
            <p className="text-muted-foreground mb-4">
              Every request to Convex includes the JWT token, which is validated on the server side. The <code className="text-xs bg-muted px-1 py-0.5 rounded">getAuthUserId(ctx)</code> function extracts and verifies the user ID from the token.
            </p>
            
            <div className="bg-muted/50 rounded-lg p-4 mb-4">
              <h4 className="font-medium mb-2">Token Validation Process:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Client sends request with JWT token in Authorization header or cookie</li>
                <li>Convex backend extracts token from request</li>
                <li>Token signature is verified using secret key</li>
                <li>Token expiration is checked</li>
                <li>User ID is extracted from valid token</li>
                <li>Request proceeds with authenticated user context</li>
              </ol>
            </div>

            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded p-4">
              <h4 className="font-semibold mb-2 text-green-900 dark:text-green-100">Security Best Practices Implemented:</h4>
              <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                <li>✓ <strong>Server-side validation:</strong> All tokens are validated on the backend</li>
                <li>✓ <strong>Short-lived tokens:</strong> Tokens expire, requiring periodic re-authentication</li>
                <li>✓ <strong>Automatic refresh:</strong> Convex handles token refresh transparently</li>
                <li>✓ <strong>Secure storage:</strong> Tokens stored in httpOnly cookies when possible</li>
                <li>✓ <strong>HTTPS only:</strong> Production tokens only transmitted over HTTPS</li>
              </ul>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">Authentication in Convex Functions</h3>
            <p className="text-muted-foreground mb-4">
              All protected Convex functions use a consistent pattern for authentication:
            </p>
            <pre className="bg-muted rounded-lg p-4 text-sm overflow-x-auto mb-4">
              <code>{`import { getAuthUserId } from "@convex-dev/auth/server";

export const myProtectedQuery = query({
  args: {},
  handler: async (ctx) => {
    // Get authenticated user ID
    const userId = await getAuthUserId(ctx);
    
    // If not authenticated, return null or throw error
    if (!userId) {
      return null; // or throw new ConvexError("Not authenticated")
    }
    
    // Proceed with authenticated logic
    const user = await ctx.db.get(userId);
    return user;
  },
});`}</code>
            </pre>
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded p-4">
              <h4 className="font-semibold mb-2 text-red-900 dark:text-red-100">Critical Security Rule:</h4>
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>NEVER use <code className="bg-red-100 dark:bg-red-900 px-1 rounded">ctx.auth.getUserIdentity().subject</code> directly.</strong> Always use <code className="bg-red-100 dark:bg-red-900 px-1 rounded">getAuthUserId(ctx)</code> which properly validates the token and returns the correct database user ID.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Password Reset Flow */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Password Reset Flow</h2>
        <div className="bg-muted/50 border rounded-lg p-6 space-y-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
            <div className="flex-1">
              <h4 className="font-semibold mb-2">User Requests Password Reset</h4>
              <p className="text-sm text-muted-foreground">User provides their email address through the "Forgot Password" form. The system looks up the account.</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
            <div className="flex-1">
              <h4 className="font-semibold mb-2">Reset Code Generated</h4>
              <p className="text-sm text-muted-foreground mb-2">The <code className="text-xs bg-background px-1 py-0.5 rounded">ResendOTPPasswordReset</code> provider:</p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                <li>Generates an 8-digit reset code using secure random generation</li>
                <li>Associates the code with the user's account</li>
                <li>Sets expiration time (15 minutes)</li>
                <li>Sends email with code via Resend API</li>
              </ul>
              <div className="mt-2 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  <strong>Security Note:</strong> The system does not reveal whether an email exists in the database. It always shows "Check your email" even for non-existent accounts, preventing account enumeration attacks.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
            <div className="flex-1">
              <h4 className="font-semibold mb-2">User Submits Reset Code</h4>
              <p className="text-sm text-muted-foreground">User enters the code from their email and provides a new password. Both are validated before processing.</p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
            <div className="flex-1">
              <h4 className="font-semibold mb-2">Password Updated</h4>
              <p className="text-sm text-muted-foreground mb-2">If code is valid and not expired:</p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-4">
                <li>New password is validated against strength requirements</li>
                <li>Password is hashed with bcrypt</li>
                <li>Old password hash is replaced with new one</li>
                <li>Reset code is invalidated</li>
                <li>User is notified of successful password change</li>
              </ul>
              <div className="mt-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded p-3">
                <p className="text-xs text-green-800 dark:text-green-200">
                  <strong>Security:</strong> After password change, all existing sessions could optionally be invalidated (not currently implemented) to force re-authentication on all devices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OAuth Integration */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">OAuth Integration (GitHub)</h2>
        <p className="text-muted-foreground mb-4">
          Soloist supports GitHub OAuth for authentication. This provides a streamlined sign-in experience using users' GitHub accounts.
        </p>

        <div className="border rounded-lg p-6 mb-4">
          <h3 className="text-xl font-semibold mb-3">OAuth Flow</h3>
          <ol className="space-y-3">
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 font-bold text-blue-600 dark:text-blue-400">1.</span>
              <div>
                <p className="font-medium">User Clicks "Sign in with GitHub"</p>
                <p className="text-sm text-muted-foreground">The <code className="text-xs bg-muted px-1 py-0.5 rounded">SignInWithGitHub</code> component calls <code className="text-xs bg-muted px-1 py-0.5 rounded">signIn("github", {})</code></p>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 font-bold text-blue-600 dark:text-blue-400">2.</span>
              <div>
                <p className="font-medium">Redirect to GitHub</p>
                <p className="text-sm text-muted-foreground">User is redirected to GitHub's OAuth authorization page to approve access</p>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 font-bold text-blue-600 dark:text-blue-400">3.</span>
              <div>
                <p className="font-medium">GitHub Callback</p>
                <p className="text-sm text-muted-foreground">GitHub redirects back to <code className="text-xs bg-muted px-1 py-0.5 rounded">/api/auth/callback/github</code> with authorization code</p>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 font-bold text-blue-600 dark:text-blue-400">4.</span>
              <div>
                <p className="font-medium">Token Exchange</p>
                <p className="text-sm text-muted-foreground">Convex exchanges the code for GitHub access token and retrieves user profile</p>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 font-bold text-blue-600 dark:text-blue-400">5.</span>
              <div>
                <p className="font-medium">Account Linking/Creation</p>
                <p className="text-sm text-muted-foreground">If user exists (by GitHub ID or email), they're signed in. Otherwise, new account is created with GitHub profile data</p>
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 font-bold text-blue-600 dark:text-blue-400">6.</span>
              <div>
                <p className="font-medium">Session Established</p>
                <p className="text-sm text-muted-foreground">JWT token is generated and user is authenticated</p>
              </div>
            </li>
          </ol>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded p-4">
          <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">OAuth Security Benefits:</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• No password storage required for OAuth users</li>
            <li>• Leverages GitHub's security infrastructure</li>
            <li>• Automatic access revocation when user removes app from GitHub</li>
            <li>• Reduces password reuse risks</li>
          </ul>
        </div>
      </section>

      {/* HTTP Routes and Proxy */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">HTTP Routes &amp; Authentication Proxy</h2>
        <p className="text-muted-foreground mb-4">
          Authentication requests are proxied through Next.js API routes to Convex's HTTP endpoints.
        </p>

        <div className="border rounded-lg p-6 mb-4">
          <h3 className="text-xl font-semibold mb-3">Route Structure</h3>
          <p className="text-sm text-muted-foreground mb-3">
            The route <code className="text-xs bg-muted px-1 py-0.5 rounded">app/api/auth/[...convex]/route.ts</code> acts as a catch-all proxy:
          </p>
          <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto mb-4">
            <code>{`// Extract path: /api/auth/signin/password → /signin/password
const pathSegments = url.pathname.split('/api/auth/').pop();

// Build Convex URL
const convexUrl = new URL(CONVEX_SITE_URL);
convexUrl.pathname = \`/\${pathSegments}\`;

// Forward request to Convex with proper headers
const response = await fetch(convexUrl.toString(), {
  method: req.method,
  headers,
  body,
  redirect: 'manual'
});`}</code>
          </pre>
          
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <h4 className="font-medium mb-2">Key Headers Forwarded:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <code className="text-xs bg-background px-1 py-0.5 rounded">content-type</code> - Request content type</li>
              <li>• <code className="text-xs bg-background px-1 py-0.5 rounded">authorization</code> - JWT token</li>
              <li>• <code className="text-xs bg-background px-1 py-0.5 rounded">cookie</code> - Session cookies</li>
              <li>• <code className="text-xs bg-background px-1 py-0.5 rounded">user-agent</code> - Client identification</li>
              <li>• <code className="text-xs bg-background px-1 py-0.5 rounded">origin</code> - Request origin for CORS</li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded p-4">
            <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Why Use a Proxy?</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Enables setting httpOnly cookies from same domain</li>
              <li>• Simplifies CORS configuration</li>
              <li>• Provides single authentication endpoint for frontend</li>
              <li>• Allows middleware injection for logging/monitoring</li>
              <li>• Supports manual redirect handling for OAuth flows</li>
            </ul>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-3">Convex HTTP Routes</h3>
          <p className="text-sm text-muted-foreground mb-3">
            In <code className="text-xs bg-muted px-1 py-0.5 rounded">convex/http.ts</code>, authentication routes are registered:
          </p>
          <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto">
            <code>{`import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

// Registers all auth routes automatically
auth.addHttpRoutes(http);

export default http;`}</code>
          </pre>
          <p className="text-xs text-muted-foreground mt-3">
            This automatically creates routes like <code className="bg-muted px-1 py-0.5 rounded">/signin</code>, <code className="bg-muted px-1 py-0.5 rounded">/signout</code>, <code className="bg-muted px-1 py-0.5 rounded">/callback/github</code>, etc.
          </p>
        </div>
      </section>

      {/* Database Schema */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Database Schema for Authentication</h2>
        <p className="text-muted-foreground mb-4">
          Convex Auth extends the standard users table with authentication-specific fields and supporting tables.
        </p>

        <div className="border rounded-lg p-6 mb-4">
          <h3 className="text-xl font-semibold mb-3">Users Table</h3>
          <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto">
            <code>{`users: defineTable({
  // Standard Convex Auth fields
  name: v.optional(v.string()),
  image: v.optional(v.string()),
  email: v.optional(v.string()),
  emailVerificationTime: v.optional(v.float64()),
  phone: v.optional(v.string()),
  phoneVerificationTime: v.optional(v.float64()),
  isAnonymous: v.optional(v.boolean()),
  
  // Custom application fields
  authId: v.optional(v.string()),
  githubId: v.optional(v.number()),
  role: v.optional(v.union(v.literal("user"), v.literal("admin"))),
})
.index("email", ["email"])
.index("byAuthId", ["authId"])
.index("byRole", ["role"])`}</code>
          </pre>
        </div>

        <div className="border rounded-lg p-6 mb-4">
          <h3 className="text-xl font-semibold mb-3">Auth Tables (from authTables)</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Convex Auth automatically creates several supporting tables:
          </p>
          <div className="space-y-3">
            <div className="bg-muted/50 rounded p-3">
              <h4 className="font-medium text-sm mb-1">authSessions</h4>
              <p className="text-xs text-muted-foreground">Stores active session tokens and their expiration times</p>
            </div>
            <div className="bg-muted/50 rounded p-3">
              <h4 className="font-medium text-sm mb-1">authAccounts</h4>
              <p className="text-xs text-muted-foreground">Links users to authentication providers (email/password, GitHub, etc.)</p>
            </div>
            <div className="bg-muted/50 rounded p-3">
              <h4 className="font-medium text-sm mb-1">authVerificationCodes</h4>
              <p className="text-xs text-muted-foreground">Stores pending verification codes for email verification and password reset</p>
            </div>
            <div className="bg-muted/50 rounded p-3">
              <h4 className="font-medium text-sm mb-1">authRefreshTokens</h4>
              <p className="text-xs text-muted-foreground">Manages refresh tokens for extending sessions without re-authentication</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded p-4">
          <h4 className="font-semibold mb-2 text-yellow-900 dark:text-yellow-100">Important Schema Note:</h4>
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            These auth tables are managed entirely by Convex Auth. Never modify them directly. Use the provided auth functions and callbacks to customize behavior.
          </p>
        </div>
      </section>

      {/* Security Analysis */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Security Analysis</h2>

        <div className="space-y-6">
          {/* Strengths */}
          <div className="border-l-4 border-green-500 bg-green-50 dark:bg-green-950/20 rounded-r-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-green-900 dark:text-green-100">✓ Security Strengths</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">Password Security</h4>
                <ul className="text-sm text-green-700 dark:text-green-300 list-disc list-inside space-y-1">
                  <li>Strong password requirements enforced</li>
                  <li>Bcrypt hashing with sufficient computational cost</li>
                  <li>No plain-text password storage anywhere</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">Token Management</h4>
                <ul className="text-sm text-green-700 dark:text-green-300 list-disc list-inside space-y-1">
                  <li>JWT tokens are cryptographically signed</li>
                  <li>Tokens have expiration times</li>
                  <li>Server-side validation on every request</li>
                  <li>HttpOnly cookies prevent XSS token theft (when available)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">API Security</h4>
                <ul className="text-sm text-green-700 dark:text-green-300 list-disc list-inside space-y-1">
                  <li>Consistent use of <code className="text-xs bg-green-100 dark:bg-green-900 px-1 rounded">getAuthUserId(ctx)</code></li>
                  <li>Internal functions inaccessible from client</li>
                  <li>User data access restricted to authenticated users</li>
                  <li>Permission checks before data access</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">Email Verification</h4>
                <ul className="text-sm text-green-700 dark:text-green-300 list-disc list-inside space-y-1">
                  <li>OTP codes generated with secure randomness</li>
                  <li>Time-limited verification codes (15 minutes)</li>
                  <li>Prevents email-based account hijacking</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Potential Issues */}
          <div className="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 rounded-r-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-yellow-900 dark:text-yellow-100">⚠ Potential Security Considerations</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">1. Session Invalidation After Password Change</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                  <strong>Issue:</strong> When a user changes their password, existing sessions on other devices remain valid.
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                  <strong>Risk:</strong> If an attacker has stolen a session token, changing the password won't immediately protect the account.
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>Recommendation:</strong> Implement session invalidation on password change. When password is updated, delete all authSessions records for that user, forcing re-authentication everywhere.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">2. Rate Limiting Not Evident</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                  <strong>Issue:</strong> No visible rate limiting on authentication endpoints.
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                  <strong>Risk:</strong> Attackers could attempt brute force attacks on passwords or OTP codes without being throttled.
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>Recommendation:</strong> Implement rate limiting on sign-in attempts, OTP verification, and password reset requests. Consider IP-based and email-based limits.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">3. Account Lockout Not Implemented</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                  <strong>Issue:</strong> No mechanism to temporarily lock accounts after repeated failed login attempts.
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                  <strong>Risk:</strong> Targeted account attacks could continue indefinitely without detection.
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>Recommendation:</strong> Add failed login attempt tracking. After 5-10 failed attempts, temporarily lock the account for 15-30 minutes and send notification email to user.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">4. Email Verification Not Required</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                  <strong>Issue:</strong> Code sends verification emails but may not prevent unverified users from accessing the app.
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                  <strong>Risk:</strong> Users could access the system with unverified emails, potentially creating accounts with fake or mistyped email addresses.
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>Recommendation:</strong> Enforce email verification before allowing full access. Check <code className="text-xs bg-yellow-100 dark:bg-yellow-900 px-1 rounded">emailVerificationTime</code> in protected queries and restrict unverified accounts.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">5. HTTPS Enforcement</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                  <strong>Issue:</strong> No visible HTTPS enforcement in code (though likely handled at deployment level).
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                  <strong>Risk:</strong> If HTTPS is not enforced, tokens and credentials could be intercepted in transit.
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>Recommendation:</strong> Ensure production deployment forces HTTPS. Add middleware to redirect HTTP to HTTPS if not already handled by hosting platform.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">6. Audit Logging</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                  <strong>Issue:</strong> No comprehensive audit logging for security events.
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                  <strong>Risk:</strong> Security incidents difficult to investigate without logs of authentication events.
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <strong>Recommendation:</strong> Log key events: sign-in attempts (success/failure), password changes, email changes, OTP requests, password resets. Include timestamp, IP address, and user agent.
                </p>
              </div>
            </div>
          </div>

          {/* Good Practices */}
          <div className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20 rounded-r-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-900 dark:text-blue-100">✓ Good Security Practices Observed</h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li>• Generic error messages that don't reveal whether accounts exist</li>
              <li>• Internal functions properly separated from public API</li>
              <li>• User ID validation before data access</li>
              <li>• Secure random generation for OTP codes</li>
              <li>• Proper use of Convex Auth's security features</li>
              <li>• Password complexity requirements</li>
              <li>• Time-limited verification codes</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Developer Reference */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Developer Reference</h2>

        <div className="space-y-6">
          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">Common Authentication Patterns</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Check if User is Authenticated</h4>
                <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto">
                  <code>{`import { useConvexUser } from "@/hooks/useConvexUser";

function MyComponent() {
  const { isAuthenticated, userId } = useConvexUser();
  
  if (!isAuthenticated) {
    return <SignInPrompt />;
  }
  
  return <AuthenticatedContent />;
}`}</code>
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-2">Protect a Convex Query</h4>
                <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto">
                  <code>{`import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMyData = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("Not authenticated");
    }
    
    return await ctx.db
      .query("myTable")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});`}</code>
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-2">Sign Out a User</h4>
                <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto">
                  <code>{`import { useAuthActions } from "@convex-dev/auth/react";

function SignOutButton() {
  const { signOut } = useAuthActions();
  
  const handleSignOut = async () => {
    await signOut();
    // User is now signed out, token cleared
  };
  
  return <button onClick={handleSignOut}>Sign Out</button>;
}`}</code>
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-2">Get Current User Profile</h4>
                <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto">
                  <code>{`import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function UserProfile() {
  const user = useQuery(api.users.viewer);
  
  if (!user) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}`}</code>
                </pre>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">Environment Variables Required</h3>
            <div className="bg-muted rounded-lg p-4">
              <pre className="text-xs overflow-x-auto">
                <code>{`# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Authentication
AUTH_RESEND_KEY=re_xxxxxxxxxxxxx  # Resend API key for emails

# OAuth (if using GitHub)
GITHUB_CLIENT_ID=xxxxxxxxxxxxx
GITHUB_CLIENT_SECRET=xxxxxxxxxxxxx

# Stripe (for payment processing)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Conclusion */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Conclusion</h2>
        <div className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20 rounded-r-lg p-6">
          <p className="text-blue-900 dark:text-blue-100 mb-4">
            Soloist's authentication system leverages Convex Auth to provide a solid foundation for user authentication and session management. The implementation follows many security best practices, including password hashing, token-based authentication, and email verification.
          </p>
          <p className="text-blue-900 dark:text-blue-100 mb-4">
            <strong>Current Security Posture:</strong> Good for development and early production. The core authentication mechanisms are sound, with proper password handling and token management.
          </p>
          <p className="text-blue-900 dark:text-blue-100">
            <strong>Recommended Enhancements:</strong> Before scaling to larger user bases, implement rate limiting, account lockout mechanisms, comprehensive audit logging, and enforce email verification. These additions would elevate the security posture from "good" to "excellent."
          </p>
        </div>
      </section>
    </div>
  );
}
