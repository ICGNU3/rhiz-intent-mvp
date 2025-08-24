import { NextRequest, NextResponse } from 'next/server';
// import { db } from '@rhiz/db';

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json({ message: "Mock data - API not implemented yet" });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
