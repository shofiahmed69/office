const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://Alvee:sofimofasslerdhoncuse@ec2-16-16-143-59.eu-north-1.compute.amazonaws.com:5432/scholarpass',
  ssl: false,
});

async function runMigration() {
  const client = await pool.connect();
  try {
    const sqlFile = path.join(__dirname, 'migrations', '001_create_feature_tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('Running migration...');
    await client.query(sql);
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
