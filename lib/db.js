// lib/db.js - النسخة المحسّنة
import { sql } from '@vercel/postgres';

process.env.POSTGRES_URL = process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;

export async function initDatabase() {
  try {
    await sql`
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
        used_at TIMESTAMP,
        
        -- الحقول الجديدة
        status VARCHAR(20) DEFAULT 'active',
        computer_name TEXT,
        last_seen TIMESTAMP,
        deactivated_at TIMESTAMP,
        deactivated_by VARCHAR(100)
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS activation_logs (
        id SERIAL PRIMARY KEY,
        activation_code VARCHAR(100) NOT NULL,
        machine_id VARCHAR(100) NOT NULL,
        computer_name TEXT,
        action VARCHAR(50) NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW()
      );
    `;

    console.log('✅ Database initialized');
    return { success: true, message: 'Database initialized' };
  } catch (error) {
    console.error('❌ Database init error:', error);
    throw error;
  }
}

export { sql };
