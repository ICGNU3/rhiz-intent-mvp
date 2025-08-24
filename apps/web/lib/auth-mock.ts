// Mock auth functions to replace @clerk/nextjs dependencies
export async function getUserId(): Promise<string | null> {
  // Return a mock user ID for development
  return 'demo-user-123';
}

export async function requireUser(): Promise<string> {
  const userId = await getUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }
  return userId;
}

export function authMiddleware() {
  return (req: any, res: any, next: any) => {
    // Mock middleware that does nothing
    next();
  };
}
