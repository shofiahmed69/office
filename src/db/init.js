const { pool } = require('./pool');
const fs = require('fs');
const path = require('path');

async function init() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schemaSql);
    console.log('Database schema initialized.');

    const migrationsDir = path.join(__dirname, 'migrations');
    if (fs.existsSync(migrationsDir)) {
      const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
      for (const file of files) {
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        await pool.query(sql);
        console.log('Migration applied:', file);
      }
    }
  } catch (err) {
    console.error('Init error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

init();
