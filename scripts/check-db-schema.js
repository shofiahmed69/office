/**
 * Introspect PostgreSQL schema for scholarpass.
 * Run: node scripts/check-db-schema.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

async function run() {
  const client = await pool.connect();
  try {
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('Tables in public schema:', tables.rows.map(r => r.table_name).join(', ') || '(none)');

    for (const row of tables.rows) {
      const cols = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [row.table_name]);
      console.log('\n' + row.table_name + ':', cols.rows.map(c => c.column_name + ' (' + c.data_type + ')').join(', '));
    }
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => { console.error(err); process.exit(1); });
