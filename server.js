require('dotenv').config();
const app = require('./src/app');
const { pool } = require('./src/config/database');
const { getRedis } = require('./src/config/redis');

const PORT = process.env.PORT || 3001;

async function start() {
  pool.query('SELECT 1')
    .then(() => console.log('Database connected'))
    .catch((err) => console.warn('Database connection failed:', err.message));

  getRedis()
    .then(() => console.log('Redis connected'))
    .catch((err) => console.warn('Redis connection failed:', err.message));

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
}

start().catch((err) => {
  console.error('Startup error:', err);
  process.exit(1);
});
