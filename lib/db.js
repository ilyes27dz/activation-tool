// lib/db.js
import { createPool } from '@vercel/postgres';

// إنشاء Pool للاتصالات
const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
});

// وظيفة للاستعلامات
export async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// تهيئة قاعدة البيانات
export async function initDatabase() {
  try {
    // جدول الأكواد
    await query(`
      CREATE TABLE IF NOT EXISTS activation_codes (
        id SERIAL PRIMARY KEY,
        client_name VARCHAR(255) NOT NULL,
        client_phone VARCHAR(50) NOT NULL,
        machine_id VARCHAR(100) NOT NULL,
        activation_code VARCHAR(100) NOT NULL UNIQUE,
        type VARCHAR(20) NOT NULL,
        trial_days INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        expiry_date DATE,
        notes TEXT,
        is_used BOOLEAN DEFAULT FALSE,
        used_at TIMESTAMP
      );
    `);

    // جدول المستخدم
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Database initialized');
    return { success: true, message: 'Database initialized' };
  } catch (error) {
    console.error('❌ Database init error:', error);
    throw error;
  }
}
