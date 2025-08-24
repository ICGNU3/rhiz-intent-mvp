// packages/shared/src/auth.ts
type User = { id: string; name?: string; email?: string };

const USE_MOCK = process.env.USE_MOCK_AUTH === "true";

let clerkAuth: any = null;
async function loadClerk() {
  if (clerkAuth) return clerkAuth;
  try {
    // Lazy import to avoid hard dependency during mock
    const mod = await import("@clerk/nextjs/server");
    clerkAuth = mod;
  } catch {
    clerkAuth = null;
  }
  return clerkAuth;
}

// Server-safe helper
export async function getUserId(): Promise<string | null> {
  if (USE_MOCK) return "demo-user";
  const clerk = await loadClerk();
  if (!clerk) return null;
  const { auth } = clerk;
  const { userId } = auth();
  return userId ?? null;
}

export async function requireUser(): Promise<string> {
  const uid = await getUserId();
  if (!uid) {
    const err: any = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }
  return uid;
}

export async function getUser(): Promise<User | null> {
  if (USE_MOCK) return { id: "demo-user", name: "Demo User", email: "demo@rhiz.local" };
  const clerk = await loadClerk();
  if (!clerk) return null;
  const { currentUser } = clerk;
  const u = await currentUser();
  if (!u) return null;
  return { id: u.id, name: [u.firstName, u.lastName].filter(Boolean).join(" "), email: u.emailAddresses?.[0]?.emailAddress };
}

// Simple client hook for components
export function useMockClientUser(): User {
  // For demo UI. Real Clerk hook will replace this when USE_MOCK_AUTH=false
  return { id: "demo-user", name: "Demo User", email: "demo@rhiz.local" };
}
