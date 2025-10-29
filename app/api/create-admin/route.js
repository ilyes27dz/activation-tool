import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const checkResult = await sql`SELECT * FROM users WHERE username = 'admin'`;

    if (checkResult.rows.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Admin user already exists',
      });
    }

    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    await sql`INSERT INTO users (username, password_hash) VALUES ('admin', ${hashedPassword})`;

    return NextResponse.json({
      success: true,
      message: 'Admin user created',
      credentials: {
        username: 'admin',
        password: 'admin123',
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
