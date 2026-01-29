require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
  connectionTimeoutMillis: 15000,
});

async function inspect() {
  let client;
  try {
    client = await pool.connect();
    console.log('Connected successfully.\n');

    const tables = await client.query(`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name
    `);
    console.log('=== TABLES ===');
    console.log(JSON.stringify(tables.rows, null, 2));

    for (const row of tables.rows) {
      const fullName = row.table_schema === 'public' ? row.table_name : `${row.table_schema}.${row.table_name}`;
      const cols = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = $1 AND table_name = $2
        ORDER BY ordinal_position
      `, [row.table_schema, row.table_name]);
      console.log(`\n=== COLUMNS: ${fullName} ===`);
      console.log(JSON.stringify(cols.rows, null, 2));
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

inspect();
