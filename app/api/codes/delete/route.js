// app/api/codes/delete/route.js
import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'معرف الكود مطلوب' 
      }, { status: 400 });
    }

    await sql`
      DELETE FROM activation_codes WHERE id = ${id}
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'تم حذف الكود بنجاح' 
    });

  } catch (error) {
    console.error('Delete code error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
