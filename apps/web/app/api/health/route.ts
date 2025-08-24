// apps/web/app/api/health/route.ts
export async function GET() {
  return Response.json({ 
    ok: true, 
    userId: 'demo-user-123', 
    mock: process.env.USE_MOCK_AUTH === "true" 
  });
}
