"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

// Create a dummy client if no URL is provided (for development without Convex)
const convex = convexUrl 
  ? new ConvexReactClient(convexUrl)
  : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    // Return children without Convex provider during setup
    // This allows the app to render while Convex is being configured
    return <>{children}</>;
  }
  
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
