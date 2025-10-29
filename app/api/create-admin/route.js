import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // التحقق من وجود مستخدم admin
    const checkResult = await query(
      'SELECT * FROM users WHERE username = $1',
      ['admin']
    );

    if (checkResult.rows.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Admin user already exists',
        note: 'Use existing credentials to login'
      });
    }

    // إنشاء المستخدم الجديد
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    await query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2)',
      ['admin', hashedPassword]
    );

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      credentials: {
        username: 'admin',
        password: 'admin123',
        note: 'Please change this password after first login'
      },
    });
  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
