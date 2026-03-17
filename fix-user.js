const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function testUser() {
  try {
    // Crear hash de la contraseña
    const hash = await bcrypt.hash('Interventor1234!', 12);
    console.log('Hash generado:', hash);
    
    // Actualizar usuario demo con el hash correcto
    const res = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2',
      [hash, 'interventor@clinica.com']
    );
    
    console.log('Usuario actualizado:', res.rowCount, 'filas afectadas');
    
    // Verificar
    const user = await pool.query('SELECT email, full_name FROM users WHERE email = $1', ['interventor@clinica.com']);
    console.log('Usuario verificado:', user.rows[0]);
    
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

testUser();
