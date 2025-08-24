// apps/web/lib/useUser.ts
export function useUser() {
  // Always use mock user since Clerk dependency was removed
  return { 
    isSignedIn: true,
    userId: "alice-user-id",
    user: { 
      id: "alice-user-id", 
      fullName: "Alice User", 
      primaryEmailAddress: { emailAddress: "alice@rhiz.local" } 
    } 
  };
}

// Mock auth functions for API routes
export async function requireUser() {
  // Mock authentication - in real implementation, verify JWT or session
  return {
    id: "alice-user-id",
    fullName: "Alice User",
    email: "alice@rhiz.local"
  };
}

export function getUserId(): string {
  return "alice-user-id";
}
