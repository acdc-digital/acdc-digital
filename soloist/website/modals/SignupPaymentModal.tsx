"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { X, Lock, Check, Loader2, CreditCard, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { Badge } from "@/components/ui/badge";

// Stripe promise - only initialize if key is available
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!stripePublishableKey) {
  console.error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
}
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

// Price IDs for subscriptions (Stripe Test Mode)
const MONTHLY_PRICE_ID = "price_1SXB0ID6Nyv2PKYjXJo97d7n";
const YEARLY_PRICE_ID = "price_1SXB0ID6Nyv2PKYjWqoBzlO9";

// Pricing options
const PRICING = {
  monthly: {
    priceId: MONTHLY_PRICE_ID,
    amount: "$2.99",
    period: "/month",
    label: "Monthly",
  },
  yearly: {
    priceId: YEARLY_PRICE_ID,
    amount: "$30.49",
    period: "/year",
    label: "Yearly",
    savings: "Save 15%",
  },
} as const;

type BillingPeriod = keyof typeof PRICING;

interface SignupPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
}

// Password Requirements Component
const PasswordRequirements = ({ password, show }: { password: string; show: boolean }) => {
  const requirements = [
    { text: "8+ characters", test: (pwd: string) => pwd.length >= 8 },
    { text: "One number", test: (pwd: string) => /\d/.test(pwd) },
    { text: "Lowercase", test: (pwd: string) => /[a-z]/.test(pwd) },
    { text: "Uppercase", test: (pwd: string) => /[A-Z]/.test(pwd) },
    { text: "Special char", test: (pwd: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd) },
  ];

  if (!show) return null;

  return (
    <div className="mt-2 p-2.5 bg-muted/50 border border-border rounded-t-none rounded-b-lg">
      <div className="grid grid-cols-2 gap-1.5">
        {requirements.map((req, index) => {
          const isValid = req.test(password);
          return (
            <div key={index} className="flex items-center text-[11px]">
              {isValid ? (
                <Check className="w-3 h-3 text-green-600 mr-1.5 flex-shrink-0" />
              ) : (
                <X className="w-3 h-3 text-muted-foreground mr-1.5 flex-shrink-0" />
              )}
              <span className={isValid ? "text-foreground" : "text-muted-foreground"}>
                {req.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Google Icon Component
const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

// Apple Icon Component
const AppleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

// Auth Panel Component - Soloist Branded
function AuthPanel({
  isAuthenticated,
  userEmail,
  flow,
  setFlow,
  email,
  setEmail,
  password,
  setPassword,
  showPasswordRequirements,
  setShowPasswordRequirements,
  error,
  setError,
  isSubmitting,
  handleEmailPasswordSubmit,
  handleOAuthSignIn,
}: {
  isAuthenticated: boolean;
  userEmail: string | null;
  flow: "signIn" | "signUp";
  setFlow: (flow: "signIn" | "signUp") => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  showPasswordRequirements: boolean;
  setShowPasswordRequirements: (show: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  isSubmitting: boolean;
  handleEmailPasswordSubmit: (e: React.FormEvent) => void;
  handleOAuthSignIn: (provider: "google" | "apple") => void;
}) {
  if (isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-10">
        <div className="w-14 h-14 bg-green-600 rounded-t-none rounded-b-xl flex items-center justify-center mb-4">
          <CheckCircle2 className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-lg font-parkinsans-semibold text-foreground mb-1">
          Account Ready
        </h3>
        <p className="text-sm text-muted-foreground text-center">
          Signed in as<br />
          <span className="font-medium text-foreground">{userEmail || "User"}</span>
        </p>
        <div className="mt-5 flex items-center text-xs text-green-600 font-medium">
          <Check className="w-4 h-4 mr-1.5" />
          Ready to subscribe
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-xl font-parkinsans-semibold text-foreground tracking-tight">
          {flow === "signUp" ? "Create Account" : "Welcome Back"}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {flow === "signUp" ? "Start your journey with Soloist" : "Sign in to continue"}
        </p>
      </div>

      {/* OAuth Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => handleOAuthSignIn("google")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 border border-border bg-white dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-all text-sm font-medium rounded-t-none rounded-b-lg"
        >
          <GoogleIcon />
          <span className="hidden sm:inline">Google</span>
        </button>

        <button
          type="button"
          onClick={() => handleOAuthSignIn("apple")}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 border border-border bg-white dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-all text-sm font-medium rounded-t-none rounded-b-lg"
        >
          <AppleIcon />
          <span className="hidden sm:inline">Apple</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative flex py-3 items-center">
        <div className="flex-grow border-t border-border"></div>
        <span className="flex-shrink-0 mx-3 text-muted-foreground text-xs font-medium">or continue with email</span>
        <div className="flex-grow border-t border-border"></div>
      </div>

      {/* Email/Password Form */}
      <form className="space-y-3 flex-1" onSubmit={handleEmailPasswordSubmit}>
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm rounded-t-none rounded-b-lg transition-all"
            placeholder="Email address"
            required
          />
        </div>

        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => flow === "signUp" && setShowPasswordRequirements(true)}
            className="w-full px-3.5 py-2.5 border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm rounded-t-none rounded-b-lg transition-all"
            placeholder={flow === "signUp" ? "Create password" : "Password"}
            required
          />
          {flow === "signUp" && <PasswordRequirements password={password} show={showPasswordRequirements} />}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-2.5 bg-destructive/10 border border-destructive/20 rounded-t-none rounded-b-lg">
            <p className="text-xs text-destructive font-medium">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 text-zinc-100 dark:text-zinc-900 font-parkinsans-semibold text-sm transition-all rounded-t-none rounded-b-lg flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {flow === "signUp" ? "Creating..." : "Signing in..."}
            </>
          ) : (
            <>
              {flow === "signUp" ? "Create Account" : "Sign In"}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

// Billing Toggle Component
function BillingToggle({
  billingPeriod,
  setBillingPeriod
}: {
  billingPeriod: BillingPeriod;
  setBillingPeriod: (period: BillingPeriod) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span className={`text-sm transition-colors ${
        billingPeriod === "monthly" ? "text-foreground font-medium" : "text-muted-foreground"
      }`}>
        $2.99 Monthly
      </span>
      <button
        onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
        className="relative w-11 h-6 bg-zinc-200 dark:bg-zinc-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        aria-label="Toggle billing period"
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-zinc-900 dark:bg-white rounded-full transition-transform duration-200 ${
            billingPeriod === "yearly" ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      <span className={`text-sm transition-colors flex items-center gap-1.5 ${
        billingPeriod === "yearly" ? "text-foreground font-medium" : "text-muted-foreground"
      }`}>
        $30.49 Yearly
        <span className="text-[10px] text-green-600 font-medium">
          Save 15%
        </span>
      </span>
    </div>
  );
}

// Payment Panel Component - Soloist Branded
function PaymentPanel({
  isAuthenticated,
  isLoadingCheckout,
  clientSecret,
  onPaymentClick,
  hasActiveSubscription,
  billingPeriod,
  setBillingPeriod,
  onCheckoutComplete,
  isCheckoutComplete,
  redirectCountdown,
}: {
  isAuthenticated: boolean;
  isLoadingCheckout: boolean;
  clientSecret: string | null;
  onPaymentClick: () => void;
  hasActiveSubscription: boolean;
  billingPeriod: BillingPeriod;
  setBillingPeriod: (period: BillingPeriod) => void;
  onCheckoutComplete: () => void;
  isCheckoutComplete: boolean;
  redirectCountdown: number | null;
}) {
  const router = useRouter();
  const currentPricing = PRICING[billingPeriod];

  // If already subscribed, show success state
  if (hasActiveSubscription) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-10">
        <div className="w-14 h-14 bg-green-600 rounded-t-none rounded-b-xl flex items-center justify-center mb-4">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-lg font-parkinsans-semibold text-foreground mb-1">
          You&apos;re Subscribed!
        </h3>
        <p className="text-sm text-muted-foreground text-center mb-5">
          Your subscription is active
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-parkinsans-semibold text-sm transition-all rounded-t-none rounded-b-lg flex items-center gap-2"
        >
          Go to Dashboard
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // If we have a client secret, show embedded checkout
  if (clientSecret) {
    if (!stripePromise) {
      return (
        <div className="h-full min-h-[400px] flex items-center justify-center">
          <p className="text-destructive text-sm">Payment system not configured</p>
        </div>
      );
    }
    return (
      <div className="min-h-[400px]">
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{
            clientSecret,
            onComplete: onCheckoutComplete,
          }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
        
        {/* Redirect countdown after checkout complete */}
        {isCheckoutComplete && redirectCountdown !== null && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-b-lg">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                Redirecting to app in {redirectCountdown}s...
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Billing Period Toggle */}
      <div className="mb-4">
        <BillingToggle billingPeriod={billingPeriod} setBillingPeriod={setBillingPeriod} />
      </div>

      {/* Pricing Card - Matches Pricing.tsx style */}
      <div className={`flex-1 bg-zinc-900 text-zinc-200 rounded-b-xl pl-5 pr-5 pt-5 mb-4 transition-all ${
        isAuthenticated ? "ring-2 ring-primary" : ""
      }`}>
        {/* Badge */}
        {billingPeriod === "yearly" && (
          <div className="flex justify-end items-start mb-4">
            <Badge className="bg-green-600 text-white font-parkinsans text-xs px-2 py-1 rounded-t-none rounded-b-lg border-0">
              Best Value
            </Badge>
          </div>
        )}

        {/* Price */}
        <div className="mb-5">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-parkinsans-bold tracking-tight">{currentPricing.amount}</span>
            <span className="text-sm text-zinc-400">{currentPricing.period}</span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {billingPeriod === "yearly"
              ? "Billed annually • Save 15%"
              : "Cancel anytime • No commitment"}
          </p>
        </div>

        {/* Features */}
        <ul className="space-y-2 mb-5 border border-zinc-700 bg-zinc-800/60 rounded-lg p-3">
          {[
            "Unlimited mood tracking",
            "AI-powered insights",
            "Mood forecasting",
            "Personalized recommendations",
            "Data export anytime"
          ].map((feature, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <span className="text-sm text-zinc-300">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <button
          onClick={onPaymentClick}
          disabled={!isAuthenticated || isLoadingCheckout}
          className={`w-full py-3 px-4 font-parkinsans-semibold text-sm transition-all rounded-t-none rounded-b-lg flex items-center justify-center gap-2 ${
            isAuthenticated
              ? "bg-white text-zinc-900 hover:bg-zinc-100"
              : "bg-zinc-700 text-zinc-400 cursor-not-allowed"
          }`}
        >
          {isLoadingCheckout ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </>
          ) : isAuthenticated ? (
            <>
              Subscribe Now
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              Create account first
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function SignupPaymentModal({
  isOpen,
  onClose,
  productName = "Soloist"
}: SignupPaymentModalProps) {
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const router = useRouter();

  // Get user ID for checkout
  const userId = useQuery(api.auth.getUserId);

  // Get subscription status
  const subscriptionStatus = useQuery(
    api.users.getUserSubscriptionStatus,
    isAuthenticated ? {} : "skip"
  );

  const [flow, setFlow] = useState<"signIn" | "signUp">("signUp");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const [isCheckoutComplete, setIsCheckoutComplete] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  // Redirect URL - change this for production
  const REDIRECT_URL = "http://localhost:3002/";

  // Derived state
  const hasActiveSubscription = subscriptionStatus?.hasActiveSubscription ?? false;

  // Handle checkout completion and start countdown
  const handleCheckoutComplete = useCallback(() => {
    console.log('Checkout complete! Starting redirect countdown...');
    setIsCheckoutComplete(true);
    setRedirectCountdown(5);
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (redirectCountdown === null || redirectCountdown <= 0) return;

    const timer = setTimeout(() => {
      setRedirectCountdown(redirectCountdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [redirectCountdown]);

  // Redirect when countdown reaches 0
  useEffect(() => {
    if (redirectCountdown === 0) {
      console.log('Redirecting to:', REDIRECT_URL);
      window.location.href = REDIRECT_URL;
    }
  }, [redirectCountdown]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFlow("signUp");
      setEmail("");
      setPassword("");
      setError(null);
      setShowPasswordRequirements(false);
      setClientSecret(null);
      setIsCheckoutComplete(false);
      setRedirectCountdown(null);
    }
  }, [isOpen]);

  // Handle successful payment checkout
  const handlePaymentClick = useCallback(async () => {
    if (!isAuthenticated || !userId) return;

    const selectedPricing = PRICING[billingPeriod];
    
    setIsLoadingCheckout(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: selectedPricing.priceId,
          paymentMode: 'subscription',
          embeddedCheckout: true,
          userId: userId,
        }),
      });

      const data = await response.json();
      console.log('Checkout API response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.clientSecret) {
        console.log('Setting clientSecret, length:', data.clientSecret.length);
        setClientSecret(data.clientSecret);
      } else {
        console.error('No clientSecret in response:', data);
        throw new Error('No client secret received from server');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
    } finally {
      setIsLoadingCheckout(false);
    }
  }, [isAuthenticated, userId, billingPeriod]);

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("password", password);
      formData.set("flow", flow);

      await signIn("password", formData);
      // Auth success - the component will re-render with isAuthenticated = true
    } catch (err) {
      console.error("Auth error:", err);
      const errorMessage = err instanceof Error ? err.message : "Authentication failed";

      if (errorMessage.toLowerCase().includes("already exists") ||
          errorMessage.toLowerCase().includes("duplicate") ||
          (errorMessage.includes("[Request ID:") && flow === "signUp")) {
        setError("Account exists. Try signing in instead.");
      } else if (errorMessage.toLowerCase().includes("not found") ||
                 errorMessage.toLowerCase().includes("invalid") ||
                 (errorMessage.includes("[Request ID:") && flow === "signIn")) {
        setError("Invalid email or password.");
      } else if (errorMessage.includes("Password validation failed")) {
        setError("Password doesn't meet requirements.");
        setShowPasswordRequirements(true);
      } else {
        setError(errorMessage);
      }
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
      setError(`Failed to sign in with ${provider}.`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container - Sharp top, rounded bottom */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-zinc-900 border border-border rounded-t-none rounded-b-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header with brand - Fixed at top */}
        <div className="bg-zinc-900 dark:bg-zinc-950 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-parkinsans-semibold text-white tracking-tight">
              Soloist.
            </h2>
            <p className="text-sm text-zinc-400 mt-0.5">
              Take control of tomorrow, Today.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Two Column Layout - Left fixed, Right scrollable */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column - Auth (Fixed, no scroll) */}
          <div className="w-1/2 p-6 md:p-8 border-r border-border bg-zinc-50 dark:bg-zinc-800 flex flex-col">
            {/* Step indicator */}
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-7 h-7 rounded-t-none rounded-b-lg flex items-center justify-center text-xs font-parkinsans-bold ${
                isAuthenticated
                  ? "bg-green-600 text-white"
                  : "bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900"
              }`}>
                {isAuthenticated ? <Check className="w-4 h-4" /> : "1"}
              </div>
              <span className="text-sm font-parkinsans-semibold text-foreground">
                {isAuthenticated ? "Signed In" : "Account"}
              </span>
            </div>

            <AuthPanel
              isAuthenticated={isAuthenticated}
              userEmail={email || null}
              flow={flow}
              setFlow={setFlow}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              showPasswordRequirements={showPasswordRequirements}
              setShowPasswordRequirements={setShowPasswordRequirements}
              error={error}
              setError={setError}
              isSubmitting={isSubmitting}
              handleEmailPasswordSubmit={handleEmailPasswordSubmit}
              handleOAuthSignIn={handleOAuthSignIn}
            />

            {/* Left sub-footer - Toggle Sign In/Sign Up */}
            {!isAuthenticated && (
              <div className="mt-auto pt-4">
                <p className="text-center text-sm text-muted-foreground">
                  {flow === "signUp" ? "Already have an account? " : "Need an account? "}
                  <button
                    type="button"
                    className="text-foreground hover:underline font-medium"
                    onClick={() => {
                      setFlow(flow === "signUp" ? "signIn" : "signUp");
                      setError(null);
                      setShowPasswordRequirements(false);
                    }}
                  >
                    {flow === "signUp" ? "Sign in" : "Sign up"}
                  </button>
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Payment (Scrollable) */}
          <div className="w-1/2 flex flex-col overflow-hidden bg-white dark:bg-zinc-900">
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {/* Step indicator */}
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-7 h-7 rounded-t-none rounded-b-lg flex items-center justify-center text-xs font-parkinsans-bold ${
                  hasActiveSubscription
                    ? "bg-green-600 text-white"
                    : "bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900"
                } ${!isAuthenticated && !hasActiveSubscription ? "opacity-40" : ""}`}>
                  {hasActiveSubscription ? <Check className="w-4 h-4" /> : "2"}
                </div>
                <span className={`text-sm font-parkinsans-semibold ${
                  isAuthenticated ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {hasActiveSubscription ? "Subscribed" : "Subscribe"}
                </span>
              </div>

              <PaymentPanel
                isAuthenticated={isAuthenticated}
                isLoadingCheckout={isLoadingCheckout}
                clientSecret={clientSecret}
                onPaymentClick={handlePaymentClick}
                hasActiveSubscription={hasActiveSubscription}
                billingPeriod={billingPeriod}
                setBillingPeriod={setBillingPeriod}
                onCheckoutComplete={handleCheckoutComplete}
                isCheckoutComplete={isCheckoutComplete}
                redirectCountdown={redirectCountdown}
              />
            </div>

            {/* Right sub-footer - Secured by Stripe (only before checkout expands) */}
            {!clientSecret && (
              <div className="px-6 py-4 flex-shrink-0">
                <p className="text-center text-xs text-muted-foreground flex items-center justify-center">
                  <Lock className="w-3 h-3 mr-1.5" />
                  Secured by Stripe
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="px-6 py-4 bg-zinc-100 dark:bg-zinc-800 border-t border-border rounded-b-2xl flex-shrink-0">
          <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            Your data is secure and encrypted • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
