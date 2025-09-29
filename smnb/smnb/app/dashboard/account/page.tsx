"use client";

import { UserProfile } from "@clerk/nextjs";
import { useAuth } from "@/lib/hooks";

export default function AccountPage() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-full bg-black items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-neutral-400">Loading account...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-full bg-black items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Authentication Required</h2>
          <p className="text-sm text-neutral-400">Please sign in to access your account settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-black">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          <UserProfile 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-neutral-950 border border-neutral-800",
                headerTitle: "text-white",
                headerSubtitle: "text-neutral-400",
                socialButtonsBlockButton: "bg-neutral-900 border-neutral-700 text-white hover:bg-neutral-800",
                formButtonPrimary: "bg-cyan-400 hover:bg-cyan-500 text-black",
                formFieldInput: "bg-neutral-900 border-neutral-700 text-white",
                formFieldLabel: "text-neutral-300",
                identityPreviewText: "text-white",
                identityPreviewEditButton: "text-cyan-400 hover:text-cyan-300",
                profileSectionTitle: "text-white",
                profileSectionContent: "text-neutral-300",
                badge: "bg-neutral-900 text-neutral-300",
                menuButton: "text-neutral-300 hover:bg-neutral-800",
                menuList: "bg-neutral-900 border-neutral-700",
                menuItem: "text-neutral-300 hover:bg-neutral-800",
                pageScrollBox: "bg-black",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}