const path = require('path');
// Load .env from apps/api so DATABASE_URL is set
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { Pool } = require('pg');
const fs = require('fs');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL is not set. Create apps/api/.env with DATABASE_URL=postgresql://...');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function runAllMigrations() {
  const client = await pool.connect();
  try {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log('Found migrations:', files);

    for (const file of files) {
      console.log(`\n📝 Running migration: ${file}`);
      const sqlFile = path.join(migrationsDir, file);
      const sql = fs.readFileSync(sqlFile, 'utf8');
      
      await client.query(sql);
      console.log(`✅ ${file} completed successfully!`);
    }
    
    console.log('\n🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

runAllMigrations();
