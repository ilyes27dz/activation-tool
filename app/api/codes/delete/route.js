import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    await query('DELETE FROM activation_codes WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete code error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
