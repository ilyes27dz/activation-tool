// app/api/init-db/route.js
import { initDatabase } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await initDatabase();
    return NextResponse.json({ success: true, message: 'Database initialized' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
