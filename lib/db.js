// lib/db.js
import { createClient } from '@vercel/postgres';

// للاستعلامات البسيطة
export async function query(text, params) {
  const client = createClient();
  await client.connect();
  
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    await client.end();
  }
}

// للحصول على client للاستعلامات المتقدمة
export async function getClient() {
  const client = createClient();
  await client.connect();
  return client;
}

// تهيئة قاعدة البيانات
export async function initDatabase() {
  const client = createClient();
  await client.connect();

  try {
    // جدول الأكواد
    await client.query(`
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

    // جدول المستخدم (للدخول)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Database initialized');
    return { success: true };
  } catch (error) {
    console.error('❌ Database init error:', error);
    throw error;
  } finally {
    await client.end();
  }
}
