import { loadStripe, Stripe } from "@stripe/stripe-js";

// IMPORTANT: Don't cache the promise at module level when the key might not be available
// This allows retrying if the first attempt failed due to missing env vars
let stripePromise: Promise<Stripe | null> | null = null;
let lastKnownKey: string | undefined = undefined;

export const getStripePromise = (): Promise<Stripe | null> => {
  if (typeof window === 'undefined') {
    // Server-side - always return null promise
    return Promise.resolve(null);
  }
  
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  
  // If the key changed or we don't have a promise yet, create a new one
  // This handles the case where the first load had no key but now it's available
  if (!stripePromise || lastKnownKey !== key) {
    lastKnownKey = key;
    
    if (key) {
      stripePromise = loadStripe(key);
    } else {
      console.error("Stripe public key is missing! Please check your environment variables.");
      stripePromise = Promise.resolve(null);
    }
  }
  
  return stripePromise;
};

// Function to check if Stripe is properly configured
export const isStripeConfigured = (): boolean => {
  if (typeof window === 'undefined') {
    return false; // Server-side
  }
  
  return !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
};

// Function to reset the cached promise (useful for development/testing)
export const resetStripePromise = (): void => {
  stripePromise = null;
  lastKnownKey = undefined;
}; 