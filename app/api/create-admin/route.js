
// app/api/create-admin/route.js
import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // كلمة المرور الافتراضية: admin123
    const passwordHash = await bcrypt.hash('admin123', 10);

    await sql`
      INSERT INTO users (username, password_hash)
      VALUES ('admin', ${passwordHash})
      ON CONFLICT (username) DO NOTHING
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'Admin user created',
      credentials: { username: 'admin', password: 'admin123' }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
