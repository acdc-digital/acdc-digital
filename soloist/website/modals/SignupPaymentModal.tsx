"use client";

import { useState, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { X, Lock, Check, Mail, Loader2 } from "lucide-react";

interface SignupPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
}

// Password Requirements Component
const PasswordRequirements = ({ password, show }: { password: string; show: boolean }) => {
  const requirements = [
    { text: "At least 8 characters long", test: (pwd: string) => pwd.length >= 8 },
    { text: "Contains at least one number", test: (pwd: string) => /\d/.test(pwd) },
    { text: "Contains at least one lowercase letter", test: (pwd: string) => /[a-z]/.test(pwd) },
    { text: "Contains at least one uppercase letter", test: (pwd: string) => /[A-Z]/.test(pwd) },
    { text: "Contains at least one special character", test: (pwd: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd) },
  ];

  if (!show) return null;

  return (
    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Password requirements:</p>
      {requirements.map((req, index) => {
        const isValid = req.test(password);
        return (
          <div key={index} className="flex items-center text-xs mb-1">
            {isValid ? (
              <Check className="w-3.5 h-3.5 text-green-500 mr-2 flex-shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-red-400 mr-2 flex-shrink-0" />
            )}
            <span className={isValid ? "text-green-700 dark:text-green-300" : "text-gray-500 dark:text-gray-400"}>
              {req.text}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Google Icon Component
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

// Apple Icon Component
const AppleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

export function SignupPaymentModal({
  isOpen,
  onClose,
  productName = "Soloist"
}: SignupPaymentModalProps) {
  const { signIn } = useAuthActions();
  const router = useRouter();
  
  const [step, setStep] = useState<"auth" | "verify">("auth");
  const [flow, setFlow] = useState<"signIn" | "signUp">("signUp");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep("auth");
      setFlow("signUp");
      setEmail("");
      setPassword("");
      setVerificationCode("");
      setError(null);
      setShowPasswordRequirements(false);
    }
  }, [isOpen]);

  const handleAuthSuccess = () => {
    onClose();
    router.refresh();
  };

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("password", password);
      formData.set("flow", flow);

      const result = await signIn("password", formData);
      
      // For sign-up, we need email verification
      if (flow === "signUp" && result && !result.redirect) {
        setStep("verify");
      } else {
        handleAuthSuccess();
      }
    } catch (err) {
      console.error("Auth error:", err);
      const errorMessage = err instanceof Error ? err.message : "Authentication failed";
      
      // Handle common error cases
      if (errorMessage.toLowerCase().includes("already exists") || 
          errorMessage.toLowerCase().includes("duplicate") ||
          errorMessage.includes("[Request ID:") && flow === "signUp") {
        setError("An account with this email already exists. Try signing in instead.");
      } else if (errorMessage.toLowerCase().includes("not found") ||
                 errorMessage.toLowerCase().includes("invalid") ||
                 errorMessage.includes("[Request ID:") && flow === "signIn") {
        setError("Invalid email or password. Please try again.");
      } else if (errorMessage.includes("Password validation failed")) {
        setError("Password doesn't meet requirements. Please check the requirements below.");
        setShowPasswordRequirements(true);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("code", verificationCode);
      formData.set("flow", "email-verification");

      await signIn("password", formData);
      handleAuthSuccess();
    } catch (err) {
      console.error("Verification error:", err);
      setError("Invalid or expired verification code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "apple") => {
    setError(null);
    try {
      await signIn(provider, { redirectTo: "/" });
    } catch (err) {
      console.error(`${provider} auth error:`, err);
      setError(`Failed to sign in with ${provider}. Please try again.`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="p-8 md:p-10">
          {step === "auth" ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {flow === "signUp" ? "Get started with Soloist" : "Welcome back"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {flow === "signUp" 
                    ? "Create your account to start tracking your mood" 
                    : "Sign in to continue your journey"}
                </p>
              </div>

              {/* OAuth Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn("google")}
                  className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-medium text-sm"
                >
                  <GoogleIcon />
                  Continue with Google
                </button>

                <button
                  type="button"
                  onClick={() => handleOAuthSignIn("apple")}
                  className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-medium text-sm"
                >
                  <AppleIcon />
                  Continue with Apple
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex py-4 items-center">
                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase tracking-wider">Or with email</span>
                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
              </div>

              {/* Email/Password Form */}
              <form className="space-y-4" onSubmit={handleEmailPasswordSubmit}>
                <div>
                  <label htmlFor="sp-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Email address
                  </label>
                  <input
                    id="sp-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="sp-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Password
                  </label>
                  <input
                    id="sp-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => flow === "signUp" && setShowPasswordRequirements(true)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder={flow === "signUp" ? "Create a secure password" : "Enter your password"}
                    required
                  />
                  {flow === "signUp" && (
                    <PasswordRequirements password={password} show={showPasswordRequirements} />
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {flow === "signUp" ? "Creating account..." : "Signing in..."}
                    </span>
                  ) : (
                    flow === "signUp" ? "Create Account" : "Sign In"
                  )}
                </button>
              </form>

              {/* Toggle Sign In/Sign Up */}
              <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
                {flow === "signUp" ? "Already have an account? " : "Don't have an account? "}
                <button
                  type="button"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  onClick={() => {
                    setFlow(flow === "signUp" ? "signIn" : "signUp");
                    setError(null);
                    setShowPasswordRequirements(false);
                  }}
                >
                  {flow === "signUp" ? "Sign in" : "Sign up"}
                </button>
              </div>

              {/* Features List */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">What you&apos;ll get with {productName}</h3>
                <ul className="space-y-2">
                  {[
                    "Daily mood tracking with AI insights",
                    "Personalized recommendations",
                    "Private and secure data",
                    "Export your data anytime"
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <Check className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            /* Email Verification Step */
            <>
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Check your email
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  We&apos;ve sent a verification code to<br />
                  <strong className="text-gray-900 dark:text-white">{email}</strong>
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleVerificationSubmit}>
                <div>
                  <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Verification Code
                  </label>
                  <input
                    id="verification-code"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg tracking-widest font-mono"
                    placeholder="Enter code"
                    maxLength={8}
                    autoComplete="off"
                    required
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    "Verify Email"
                  )}
                </button>
              </form>

              <div className="text-center mt-6">
                <button
                  type="button"
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => {
                    setStep("auth");
                    setVerificationCode("");
                    setError(null);
                  }}
                >
                  ← Back to sign up
                </button>
              </div>
            </>
          )}

          {/* Security Note */}
          <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
            <Lock className="w-3 h-3 mr-1" />
            Your data is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
}
