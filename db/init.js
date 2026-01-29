const pool = require('./config');

const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`;

const createIndex = `
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`;

async function addOtpColumns(client) {
  try {
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS otp VARCHAR(10)');
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP WITH TIME ZONE');
  } catch (e) {
    if (e.code !== '42701') throw e;
  }
}

async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(createUsersTable);
    await client.query(createIndex);
    await addOtpColumns(client);
    console.log('Database schema initialized (users table + OTP columns ready)');
  } catch (err) {
    console.error('Database init error:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { initDb };
