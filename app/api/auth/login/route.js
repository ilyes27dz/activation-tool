// app/api/auth/login/route.js
import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // جلب المستخدم
    const result = await sql`
      SELECT * FROM users WHERE username = ${username} LIMIT 1
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'اسم المستخدم غير صحيح' }, { status: 401 });
    }

    const user = result.rows[0];

    // التحقق من كلمة المرور
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return NextResponse.json({ success: false, error: 'كلمة المرور غير صحيحة' }, { status: 401 });
    }

    return NextResponse.json({ success: true, user: { id: user.id, username: user.username } });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 });
  }
}
