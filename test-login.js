const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function testLogin() {
  try {
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    
    // 1. Verificar que el usuario existe
    const userResult = await pool.query(
      'SELECT id, email, full_name, password_hash, is_active FROM users WHERE email = $1',
      ['interventor@clinica.com']
    );
    
    if (userResult.rows.length === 0) {
      console.log('[ERROR] Usuario no encontrado');
      return;
    }
    
    const user = userResult.rows[0];
    console.log('[OK] Usuario encontrado:', user.email);
    console.log('[OK] Activo:', user.is_active);
    console.log('[OK] Password hash length:', user.password_hash.length);
    
    // 2. Verificar la contraseña
    const isValid = await bcrypt.compare('Interventor1234!', user.password_hash);
    console.log('[OK] Contraseña válida:', isValid);
    
    if (!isValid) {
      console.log('[FIX] Actualizando password hash...');
      const newHash = await bcrypt.hash('Interventor1234!', 12);
      await pool.query(
        'UPDATE users SET password_hash = $1 WHERE email = $2',
        [newHash, 'interventor@clinica.com']
      );
      console.log('[OK] Password actualizado');
      
      // Verificar de nuevo
      const newValid = await bcrypt.compare('Interventor1234!', newHash);
      console.log('[OK] Nueva contraseña válida:', newValid);
    }
    
    // 3. Verificar rol
    const roleResult = await pool.query(
      'SELECT r.name FROM roles r JOIN users u ON u.role_id = r.id WHERE u.email = $1',
      ['interventor@clinica.com']
    );
    
    console.log('[OK] Rol del usuario:', roleResult.rows[0]?.name);
    
  } catch (err) {
    console.error('[ERROR] Error:', err.message);
  } finally {
    await pool.end();
  }
}

testLogin();
