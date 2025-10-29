import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';

    let result;
    
    if (filter === 'used') {
      result = await sql`SELECT * FROM activation_codes WHERE is_used = true ORDER BY created_at DESC`;
    } else if (filter === 'unused') {
      result = await sql`SELECT * FROM activation_codes WHERE is_used = false ORDER BY created_at DESC`;
    } else {
      result = await sql`SELECT * FROM activation_codes ORDER BY created_at DESC`;
    }

    return NextResponse.json({ codes: result.rows });
  } catch (error) {
    console.error('List codes error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
