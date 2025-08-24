import { NextRequest, NextResponse } from 'next/server';
// import { db, referralEdge, referralCode } from '@rhiz/db';


export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ message: "Mock data - API not implemented yet" });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
