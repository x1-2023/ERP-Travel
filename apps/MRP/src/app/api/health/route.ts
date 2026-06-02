import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    app: 'mrp',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
