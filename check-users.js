const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkUsers() {
  try {
    const res = await pool.query('SELECT email, full_name, is_active FROM users');
    console.log('Usuarios en BD:');
    res.rows.forEach(u => console.log(`- ${u.email} (${u.full_name}) active: ${u.is_active}`));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkUsers();
