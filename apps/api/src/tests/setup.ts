// Test setup and global mocks
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
// Must be at least 32 chars
process.env.JWT_SECRET = 'test-secret-key-do-not-use-in-production-at-all';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-very-long-enough-now';

// Run migrations before tests
import path from 'path';
import fs from 'fs';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

beforeAll(async () => {
  const client = await pool.connect();
  try {
    const migrationsDir = path.join(__dirname, '../../migrations');
    if (fs.existsSync(migrationsDir)) {
      const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

      for (const file of files) {
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        await client.query(sql);
      }
    }
  } catch (error) {
    console.error('Migration setup failed:', error);
  } finally {
    client.release();
  }
});

afterAll(async () => {
  await pool.end();
});
