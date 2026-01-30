const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err.message);
});

async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.LOG_LEVEL === 'debug') {
      console.debug('Query executed', { text: text.substring(0, 80), duration, rows: res.rowCount });
    }
    return res;
  } catch (err) {
    console.error('Database query error:', err.message);
    throw err;
  }
}

async function getClient() {
  return pool.connect();
}

module.exports = { query, getClient, pool };
