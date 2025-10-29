import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    const result = await sql`SELECT * FROM users WHERE username = ${username}`;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'اسم المستخدم أو كلمة المرور خاطئة' },
        { status: 401 }
      );
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'اسم المستخدم أو كلمة المرور خاطئة' },
        { status: 401 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, username: user.username } 
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}
