import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    await sql`DELETE FROM activation_codes WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete code error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
