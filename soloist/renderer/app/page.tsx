// LANDING PAGE
// /Users/matthewsimon/Documents/Github/solopro/renderer/src/app/page.tsx

'use client'

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import DraggableHeader from "./dashboard/_components/DraggableHeader";
import { BrowserNavbar } from "./dashboard/_components/BrowserNavbar";
import { BrowserFooter } from "./dashboard/_components/BrowserFooter";
import { useConvexUser } from "@/hooks/useConvexUser";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useBrowserEnvironment } from "@/utils/environment";
import { X } from "lucide-react";

/**
 * Landing Page Component for Electron Renderer
 * 
 * Following authentication rules:
 * - Uses useConvexUser() hook for consistent authentication state
 * - Checks authentication before rendering user-specific content
 * - Provides proper loading states and error handling
 * - Uses getAuthUserId pattern through the useConvexUser hook
 * - Redirects authenticated AND subscribed users to dashboard
 * - Opens subscription page in default browser for non-subscribed users
 */

// Helper function to open URL in default browser
const openInBrowser = (url: string) => {
  if (typeof window !== 'undefined' && (window as any).electron?.shell) {
    (window as any).electron.shell.openExternal(url);
  } else {
    // Fallback for development or if Electron APIs aren't available
    window.open(url, '_blank');
  }
};

// Password requirements component
function PasswordRequirements({ password, show }: { password: string; show: boolean }) {
  if (!show) return null;

  const requirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains number", met: /\d/.test(password) },
    { label: "Contains special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  return (
    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-xs space-y-1">
      {requirements.map((req, i) => (
        <div key={i} className={`flex items-center ${req.met ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}>
          <span className="mr-2">{req.met ? "✓" : "○"}</span>
          {req.label}
        </div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  // Always call all hooks first, regardless of state
  const { isAuthenticated, isLoading, userId } = useConvexUser();
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [step, setStep] = useState<"signIn" | "signUp" | "forgotPassword" | { email: string } | { resetEmail: string }>("signIn");
  const [error, setError] = useState<string | null>(null);
  const [errorInfo, setErrorInfo] = useState<{ type: string; showSwitchButton: boolean; suggestionAction: string | null } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [password, setPassword] = useState("");
  const isBrowser = useBrowserEnvironment();

  // Always call useQuery hook - use "skip" when not authenticated
  const hasActiveSubscription = useQuery(
    api.userSubscriptions.hasActiveSubscription,
    isAuthenticated && userId ? {} : "skip"
  );

  // Redirect logic for authenticated users (both browser and Electron mode)
  useEffect(() => {
    if (isAuthenticated && userId && !isLoading) {
      // Wait for subscription query to complete
      if (hasActiveSubscription === undefined) {
        console.log("Waiting for subscription status...");
        return;
      }

      // Always redirect authenticated users to dashboard (regardless of subscription status)
      console.log("User is authenticated, redirecting to dashboard");
      router.push("/dashboard");
    }
  }, [isAuthenticated, userId, isLoading, hasActiveSubscription, router]);

  // Handle authentication success
  const handleAuthSuccess = () => {
    router.refresh();
  };

  // Helper function to provide user-friendly error messages
  const getErrorMessage = (error: Error | unknown, currentStep: "signIn" | "signUp" | "forgotPassword" | { email: string } | { resetEmail: string }): {
    message: string;
    suggestionAction: string | null;
    showSwitchButton: boolean;
    type: string;
  } => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("Account not found")) {
      return {
        message: "No account found with this email.\nWould you like to create one?",
        suggestionAction: "switch-to-signup",
        showSwitchButton: true,
        type: "account"
      };
    }
    
    if (errorMessage.includes("Email already in use") || errorMessage.includes("already exists")) {
      return {
        message: "An account with this email already exists.\nWould you like to sign in instead?",
        suggestionAction: "switch-to-signin",
        showSwitchButton: true,
        type: "account"
      };
    }
    
    if (errorMessage.includes("Invalid password")) {
      return {
        message: "Incorrect password. Please try again or reset your password.",
        suggestionAction: null,
        showSwitchButton: false,
        type: "password"
      };
    }
    
    if (errorMessage.includes("Invalid verification code") || errorMessage.includes("Code")) {
      return {
        message: "The verification code is incorrect or has expired.\nPlease check your email and try again.",
        suggestionAction: null,
        showSwitchButton: false,
        type: "verification"
      };
    }

    if (errorMessage.includes("Password requirements")) {
      return {
        message: errorMessage,
        suggestionAction: null,
        showSwitchButton: false,
        type: "password"
      };
    }
    
    return {
      message: errorMessage || "An unexpected error occurred. Please try again.",
      suggestionAction: null,
      showSwitchButton: false,
      type: "general"
    };
  };

  // Determine what to render based on state
  let content;

  if (isLoading) {
    content = (
      <Card className="w-full max-w-md shadow-lg backdrop-blur-sm bg-white/80 dark:bg-zinc-900/80 border-zinc-200/50 dark:border-zinc-800/50">
        <CardContent className="flex justify-center p-8">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  } else if (isAuthenticated && userId) {
    if (hasActiveSubscription === undefined) {
      // Still waiting for subscription status
      content = (
        <Card className="w-full max-w-md shadow-lg backdrop-blur-sm bg-white/80 dark:bg-zinc-900/80 border-zinc-200/50 dark:border-zinc-800/50">
          <CardContent className="flex justify-center p-8">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
              <span className="text-sm text-muted-foreground">Checking subscription...</span>
            </div>
          </CardContent>
        </Card>
      );
    } else {
      // User is authenticated - redirect to dashboard
      content = (
        <Card className="w-full max-w-md shadow-lg backdrop-blur-sm bg-white/80 dark:bg-zinc-900/80 border-zinc-200/50 dark:border-zinc-800/50">
          <CardContent className="flex justify-center p-8">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              <span className="text-sm text-muted-foreground">Redirecting to dashboard...</span>
            </div>
          </CardContent>
        </Card>
      );
    }
  } else {
    // Not authenticated - show sign-in form directly
    content = (
      <div className="w-full max-w-md bg-white dark:bg-[#191919] overflow-hidden">
        <div className="p-10">
          <h2 className="text-2xl font-semibold mb-0 text-gray-900 dark:text-white">
            Take control of tomorrow, today.
          </h2>
          <p className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-6">
            Sign in to your Soloist account
          </p>

        {(step === "signIn" || step === "signUp") && (
          <>
            {/* OAuth Buttons - Google & Apple */}
            <div className="space-y-3 mb-6">
              {/* Google Sign In */}
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  setError(null);
                  setErrorInfo(null);
                  try {
                    await signIn("google");
                    handleAuthSuccess();
                  } catch (error) {
                    const errorDetails = getErrorMessage(error, step);
                    setError(errorDetails.message);
                    setErrorInfo(errorDetails);
                  }
                }}
                className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-750 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm font-medium"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Apple Sign In */}
              <button
                onClick={async (e) => {
                  e.preventDefault();
                  setError(null);
                  setErrorInfo(null);
                  try {
                    await signIn("apple");
                    handleAuthSuccess();
                  } catch (error) {
                    const errorDetails = getErrorMessage(error, step);
                    setError(errorDetails.message);
                    setErrorInfo(errorDetails);
                  }
                }}
                className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-750 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm font-medium"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <span>Continue with Apple</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-zinc-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white dark:bg-zinc-900 text-gray-500 dark:text-gray-400">
                  Or continue with email
                </span>
              </div>
            </div>
          </>
        )}

        {step === "signIn" || step === "signUp" ? (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setIsSubmitting(true);
              setError(null);
              setErrorInfo(null);

              const formData = new FormData(e.target as HTMLFormElement);
              formData.set("flow", step);

              void signIn("password", formData)
                .then((result) => {
                  if (step === "signUp" && result && !result.redirect) {
                    setStep({ email: formData.get("email") as string });
                  } else {
                    handleAuthSuccess();
                  }
                })
                .catch((error) => {
                  const errorDetails = getErrorMessage(error, step);
                  setError(errorDetails.message);
                  setErrorInfo(errorDetails);
                })
                .finally(() => {
                  setIsSubmitting(false);
                });
            }}
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email address
              </label>
              <input
                id="email"
                className="w-full px-3 py-1.5 border border-gray-600 dark:bg-[#191919] rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                type="email"
                name="email"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                className="w-full px-3 py-1.5 border border-gray-600 dark:bg-[#191919] rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                type="password"
                name="password"
                placeholder={step === "signUp" ? "Create a password" : "Enter your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => step === "signUp" && setShowPasswordRequirements(true)}
                required
              />
              {step === "signUp" && (
                <PasswordRequirements password={password} show={showPasswordRequirements} />
              )}
            </div>

            <button
              className="w-full py-2 px-4 bg-[#0085E9] hover:bg-[#0085E9]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-md shadow focus:outline-none focus:ring-2 focus:ring-[#0085E9] focus:ring-offset-2 transition-colors"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {step === "signIn" ? "Signing in..." : "Creating account..."}
                </span>
              ) : (
                step === "signIn" ? "Sign in" : "Sign up"
              )}
            </button>

            {error && (
              <div className={`p-4 rounded-lg border ${
                errorInfo?.type === "verification"
                  ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                  : errorInfo?.type === "password"
                  ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
              }`}>
                <div className="flex items-start">
                  <div className="flex-1">
                    <p className={`text-sm font-medium whitespace-pre-line ${
                      errorInfo?.type === "verification"
                        ? "text-amber-800 dark:text-amber-200"
                        : errorInfo?.type === "password"
                        ? "text-orange-800 dark:text-orange-200"
                        : "text-red-800 dark:text-red-300"
                    }`}>
                      {error}
                    </p>
                    {errorInfo?.showSwitchButton && (
                      <button
                        type="button"
                        onClick={() => {
                          if (errorInfo.suggestionAction === "switch-to-signup") {
                            setStep("signUp");
                          } else if (errorInfo.suggestionAction === "switch-to-signin") {
                            setStep("signIn");
                          }
                          setError(null);
                          setErrorInfo(null);
                        }}
                        className={`mt-2 px-3 py-1 text-xs font-medium rounded border transition-colors ${
                          errorInfo?.type === "verification"
                            ? "bg-amber-100 dark:bg-amber-800 hover:bg-amber-200 dark:hover:bg-amber-700 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-600"
                            : errorInfo?.type === "password"
                            ? "bg-orange-100 dark:bg-orange-800 hover:bg-orange-200 dark:hover:bg-orange-700 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-600"
                            : "bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 text-red-800 dark:text-red-200 border-red-300 dark:border-red-600"
                        }`}
                      >
                        {errorInfo.suggestionAction === "switch-to-signup" ? "Create Account" : "Sign In Instead"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
              {step === "signIn" ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                className="text-primary dark:text-primary hover:underline font-medium"
                onClick={() => {
                  setStep(step === "signIn" ? "signUp" : "signIn");
                  setError(null);
                  setErrorInfo(null);
                }}
              >
                {step === "signIn" ? "Sign up" : "Sign in"}
              </button>

              {step === "signIn" && (
                <>
                  {" • "}
                  <button
                    type="button"
                    className="text-primary dark:text-primary hover:underline font-medium"
                    onClick={() => {
                      setStep("forgotPassword");
                      setError(null);
                      setErrorInfo(null);
                    }}
                  >
                    Forgot password?
                  </button>
                </>
              )}
            </div>
          </form>
        ) : step === "forgotPassword" ? (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setIsSubmitting(true);
              setError(null);
              setErrorInfo(null);

              const formData = new FormData(e.target as HTMLFormElement);
              formData.set("flow", "reset");

              void signIn("password", formData)
                .then(() => {
                  setStep({ resetEmail: formData.get("email") as string });
                })
                .catch((error) => {
                  const errorDetails = getErrorMessage(error, step);
                  setError(errorDetails.message);
                  setErrorInfo(errorDetails);
                })
                .finally(() => {
                  setIsSubmitting(false);
                });
            }}
          >
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter your email address and we'll send you a code to reset your password.
              </p>
            </div>

            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email address
              </label>
              <input
                id="reset-email"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="email"
                name="email"
                placeholder="you@example.com"
                required
              />
            </div>

            <button
              className="w-full py-2 px-4 bg-[#0085E9] hover:bg-[#0085E9]/90focus:ring-2  disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-md shadow transition-colors"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending code..." : "Send reset code"}
            </button>

            {error && (
              <div className="p-4 rounded-lg border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
              </div>
            )}

            <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
              <button
                type="button"
                className="text-primary dark:text-primary hover:underline font-medium"
                onClick={() => {
                  setStep("signIn");
                  setError(null);
                  setErrorInfo(null);
                }}
              >
                Back to sign in
              </button>
            </div>
          </form>
        ) : typeof step === "object" && "resetEmail" in step ? (
          <form
            key={`reset-verification-${step.resetEmail}`}
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setIsSubmitting(true);
              setError(null);
              setErrorInfo(null);

              const formData = new FormData(e.target as HTMLFormElement);
              formData.set("flow", "reset-verification");
              formData.set("email", step.resetEmail);

              void signIn("password", formData)
                .then(() => {
                  handleAuthSuccess();
                })
                .catch((error) => {
                  const errorDetails = getErrorMessage(error, step);
                  setError(errorDetails.message);
                  setErrorInfo(errorDetails);
                })
                .finally(() => {
                  setIsSubmitting(false);
                });
            }}
          >
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We've sent a reset code to <strong>{step.resetEmail}</strong>
              </p>
            </div>

            <div>
              <label htmlFor="reset-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reset Code
              </label>
              <input
                id="reset-code"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-mono text-lg tracking-wider"
                type="text"
                name="code"
                placeholder="Enter your code..."
                maxLength={8}
                autoComplete="off"
                required
              />
            </div>

            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <input
                id="new-password"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="password"
                name="newPassword"
                placeholder="Create a new password"
                required
              />
            </div>

            <button
              className="w-full py-1.5 px-4 bg-[#0085E9] hover:bg-[#0085E9]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-sm shadow focus:outline-none transition-colors"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Resetting password..." : "Reset password"}
            </button>

            {error && (
              <div className="p-4 rounded-lg border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
              </div>
            )}

            <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
              <button
                type="button"
                className="text-primary dark:text-primary hover:underline font-medium"
                onClick={() => {
                  setStep("forgotPassword");
                  setError(null);
                  setErrorInfo(null);
                }}
              >
                Back to email entry
              </button>
            </div>
          </form>
        ) : (
          <form
            key={`verification-${step.email}`}
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setIsSubmitting(true);
              setError(null);
              setErrorInfo(null);

              const formData = new FormData(e.target as HTMLFormElement);
              formData.set("flow", "email-verification");
              formData.set("email", step.email);

              void signIn("password", formData)
                .then(() => {
                  handleAuthSuccess();
                })
                .catch((error) => {
                  const errorDetails = getErrorMessage(error, step);
                  setError(errorDetails.message);
                  setErrorInfo(errorDetails);
                })
                .finally(() => {
                  setIsSubmitting(false);
                });
            }}
          >
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We've sent a verification code to <strong>{step.email}</strong>
              </p>
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Verification Code
              </label>
              <input
                id="code"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-mono text-lg tracking-wider"
                type="text"
                name="code"
                placeholder="Enter your code..."
                maxLength={8}
                autoComplete="off"
                required
              />
            </div>

            <button
              className="w-full py-2 px-4 bg-[#0085E9] hover:bg-[#0085E9]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-md shadow focus:outline-none focus:ring-2 focus:ring-[#0085E9] focus:ring-offset-2 transition-colors"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Verifying..." : "Verify Email"}
            </button>

            {error && (
              <div className="p-4 rounded-lg border bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">{error}</p>
              </div>
            )}

            <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
              <button
                type="button"
                className="text-primary dark:text-primary hover:underline font-medium"
                onClick={() => {
                  setStep("signIn");
                  setError(null);
                  setErrorInfo(null);
                }}
              >
                Back to sign in
              </button>
            </div>
          </form>
        )}
        </div>
      </div>
    );
  }

    return (
    <div className="flex flex-col h-screen bg-[#191919] relative">
      {/* Show different headers based on environment */}
      {isBrowser === true ? (
        <div className="flex-shrink-0">
          <BrowserNavbar />
        </div>
      ) : isBrowser === false ? (
        <div className="absolute top-0 left-0 right-0 z-50">
          <DraggableHeader />
        </div>
      ) : null /* Show nothing during hydration */}
      
      {/* Add padding-top in Electron mode to account for header (h-9 = 36px + 1px border = 37px) */}
      <div className={`flex flex-1 flex-col items-center justify-center p-4 ${isBrowser === false ? 'pt-[49px]' : ''}`}>
        {content}
      </div>
      
      {/* Browser Footer - Only show when confirmed browser mode */}
      {isBrowser === true && (
        <div className="flex-shrink-0">
          <BrowserFooter />
        </div>
      )}
    </div>
  );
}