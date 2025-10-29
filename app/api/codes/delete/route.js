import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'معرف الكود مطلوب' },
        { status: 400 }
      );
    }

    // حذف الكود
    const result = await query(
      'DELETE FROM activation_codes WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'الكود غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'تم حذف الكود بنجاح',
      deletedCode: result.rows[0]
    });
  } catch (error) {
    console.error('Delete code error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
