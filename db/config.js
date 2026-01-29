require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
});

pool.on('connect', () => {
  if (process.env.LOG_LEVEL === 'debug') {
    console.log('Database connection established');
  }
});

pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
});

module.exports = pool;
