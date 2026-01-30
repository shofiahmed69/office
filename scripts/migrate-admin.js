/**
 * One-time migration: add lock_reason to app_users, create audit_logs.
 * Run: node scripts/migrate-admin.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { query } = require('../src/config/database');

async function run() {
  try {
    await query(`
      ALTER TABLE app_users
      ADD COLUMN IF NOT EXISTS lock_reason TEXT
    `);
    console.log('app_users.lock_reason: OK');

    await query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        action VARCHAR(100) NOT NULL,
        actor_user_id INTEGER,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('audit_logs table: OK');
    console.log('Migration done.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
  process.exit(0);
}

run();
