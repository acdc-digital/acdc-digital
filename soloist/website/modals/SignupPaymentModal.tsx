"use client";

import { useState } from "react";
import { X, CreditCard, Lock, Check, Github } from "lucide-react";

interface SignupPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  price?: string;
}

export function SignupPaymentModal({
  isOpen,
  onClose,
  productName = "Pro Plan",
  price = "$29/month"
}: SignupPaymentModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Left Side: Account Creation */}
        <div className="w-full md:w-1/2 p-8 md:p-10 bg-gray-50 dark:bg-gray-800/50 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="max-w-sm mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create your account</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Start your journey with {productName} today.
              </p>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 font-medium text-sm"
              >
                <Github className="h-5 w-5 mr-2" />
                Sign up with GitHub
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase tracking-wider">Or with email</span>
                <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
              </div>

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label htmlFor="sp-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Email address
                  </label>
                  <input
                    id="sp-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="you@example.com"
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
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Create a secure password"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <Lock className="w-3 h-3 mr-1" />
                    Must be at least 8 characters
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Side: Payment Details */}
        <div className="w-full md:w-1/2 p-8 md:p-10 bg-white dark:bg-gray-900 overflow-y-auto">
          <div className="max-w-sm mx-auto h-full flex flex-col">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment details</h2>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{price}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">billed monthly</span>
              </div>
            </div>

            {/* Order Summary / Features */}
            <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/50">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3 uppercase tracking-wide">What&apos;s included</h3>
              <ul className="space-y-2">
                {[
                  "Unlimited AI generations",
                  "Advanced analytics dashboard",
                  "Priority support",
                  "Export to all formats"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start text-sm text-blue-800 dark:text-blue-200">
                    <Check className="w-4 h-4 mr-2 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Mock Payment Form */}
            <div className="space-y-4 flex-grow">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Card Information
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden shadow-sm">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none border-b border-gray-200 dark:border-gray-700"
                      placeholder="Card number"
                      readOnly
                    />
                  </div>
                  <div className="flex divide-x divide-gray-200 dark:divide-gray-700">
                    <input
                      type="text"
                      className="w-1/2 px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
                      placeholder="MM / YY"
                      readOnly
                    />
                    <input
                      type="text"
                      className="w-1/2 px-4 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
                      placeholder="CVC"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="cardholder" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Cardholder Name
                </label>
                <input
                  id="cardholder"
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Full name on card"
                  readOnly
                />
              </div>
            </div>

            <div className="mt-8">
              <button
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform active:scale-[0.98]"
                onClick={() => setIsSubmitting(true)}
              >
                {isSubmitting ? "Processing..." : `Pay ${price} & Get Started`}
              </button>
              <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
                <Lock className="w-3 h-3 mr-1" />
                Payments are secure and encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
