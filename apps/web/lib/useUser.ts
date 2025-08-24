// apps/web/lib/useUser.ts
export function useUser() {
  // Always use mock user since Clerk dependency was removed
  return { 
    isSignedIn: true,
    userId: "demo-user",
    user: { 
      id: "demo-user", 
      fullName: "Demo User", 
      primaryEmailAddress: { emailAddress: "demo@rhiz.local" } 
    } 
  };
}

// Mock auth functions for API routes
export async function requireUser() {
  // Mock authentication - in real implementation, verify JWT or session
  return {
    id: "demo-user",
    fullName: "Demo User",
    email: "demo@rhiz.local"
  };
}

export function getUserId(): string {
  return "demo-user";
}
