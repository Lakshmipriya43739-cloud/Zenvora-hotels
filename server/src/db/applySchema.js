// Applies both hotels and users schema to the database.
// Run with: npm run db:schema

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./pool');

async function applySchema() {
  const hotelsSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const usersSQL = fs.readFileSync(path.join(__dirname, 'users.sql'), 'utf8');
  const membershipSQL = fs.readFileSync(path.join(__dirname, 'membership.sql'), 'utf8');

  const client = await pool.connect();
  try {
    await client.query(hotelsSQL);
    console.log('Schema applied: table "hotels" is ready.');
    await client.query(usersSQL);
    console.log('Schema applied: table "users" is ready.');
    await client.query(membershipSQL);
    console.log('Schema applied: table "memberships" is ready.');
  } finally {
    client.release();
  }
  await pool.end();
}

applySchema().catch((err) => {
  console.error('Schema error:', err.message);
  process.exit(1);
});
