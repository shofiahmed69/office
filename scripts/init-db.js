/**
 * Run once to create the users table in the database.
 * Usage: node scripts/init-db.js
 */
require('dotenv').config();
const { initDb } = require('../db/init');

initDb()
  .then(() => {
    console.log('Done.');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
