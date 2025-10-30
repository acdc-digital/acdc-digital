// Demo mode: No Convex auth
// import { useConvexAuth } from "convex/react"
// import { useQuery } from "convex/react"
// import { api } from "@/convex/_generated/api"

// Define the user type
export type User = {
  id: string
  name: string | null
  email: string | null
  imageUrl: string | null
}

export function useAuth() {
  // Demo mode: Return mock authenticated user
  const demoUser: User = {
    id: "demo-user",
    name: "Demo User",
    email: "demo@example.com",
    imageUrl: null,
  };

  return {
    isAuthenticated: true,
    isLoading: false,
    user: demoUser,
  }
}