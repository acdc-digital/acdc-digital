// CONVEX CLIENT
// /Users/matthewsimon/Projects/SMNB/smnb/lib/convex-client.ts

import { ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

// Create a mock client if no URL is provided for development
const convex = convexUrl 
  ? new ConvexReactClient(convexUrl)
  : new ConvexReactClient("http://localhost:3210"); // Placeholder

export default convex;
