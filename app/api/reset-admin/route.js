import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // حذف المستخدم القديم
    await sql`DELETE FROM users WHERE username = 'admin'`;

    // إنشاء مستخدم جديد
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    await sql`INSERT INTO users (username, password_hash) VALUES ('admin', ${hashedPassword})`;

    return NextResponse.json({
      success: true,
      message: 'Admin password reset successfully',
      credentials: {
        username: 'admin',
        password: 'admin123',
      },
    });
  } catch (error) {
    console.error('Reset admin error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
