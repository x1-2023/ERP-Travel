import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    app: 'docs',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
