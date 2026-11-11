// Seeds a default admin user into the database.
// Run with: npm run db:admin
//
// Credentials (change in production):
//   Email:    admin@zenvora.com
//   Password: Admin@1234
//
// If the admin already exists the script skips insertion safely.

require('dotenv').config();
const bcrypt = require('bcrypt');
const { pool } = require('./pool');

const ADMIN_NAME = 'Admin';
const ADMIN_EMAIL = 'admin@zenvora.com';
const ADMIN_PASSWORD = 'Admin@1234';
const SALT_ROUNDS = 12;

async function seedAdmin() {
  const client = await pool.connect();
  try {
    // Skip if already seeded
    const existing = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [ADMIN_EMAIL]
    );
    if (existing.rows.length > 0) {
      console.log('Admin user already exists — skipping seed.');
      return;
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);
    await client.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'admin')`,
      [ADMIN_NAME, ADMIN_EMAIL, passwordHash]
    );
    console.log('Admin user created successfully.');
    console.log(`  Email:    ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
  } finally {
    client.release();
  }
  await pool.end();
}

seedAdmin().catch((err) => {
  console.error('Admin seed error:', err.message);
  process.exit(1);
});
