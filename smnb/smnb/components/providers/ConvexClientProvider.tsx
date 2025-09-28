// CONVEX CLIENT PROVIDER
// /Users/matthewsimon/Projects/SMNB/smnb/components/providers/ConvexClientProvider.tsx

'use client';

import { ConvexProvider } from "convex/react";
import { ReactNode } from "react";
import convex from "@/lib/convex-client";

interface ConvexClientProviderProps {
  children: ReactNode;
}

export default function ConvexClientProvider({ children }: ConvexClientProviderProps) {
  try {
    return <ConvexProvider client={convex}>{children}</ConvexProvider>;
  } catch (error) {
    console.warn("Convex client not available, running in offline mode:", error);
    // Return children without Convex provider for development
    return <>{children}</>;
  }
}
