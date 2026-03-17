'use strict';
/**
 * clean-bad-data.js — Limpia datos basura de migraciones anteriores
 * Borra todos los datos de prueba pero mantiene la estructura de tablas
 * 
 * Uso:
 *   node scripts/clean-bad-data.js     — Limpia todos los datos de prueba
 *   node scripts/clean-bad-data.js --keep-users  — Mantiene usuarios demo
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function cleanBadData() {
    const keepUsers = process.argv.includes('--keep-users');
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        console.log('🧹 Limpiando datos basura de migraciones anteriores...');

        // 1. Borrar análisis de IA (depende de couders)
        console.log('🗑️  Borrando ai_analyses...');
        const resultAi = await client.query('DELETE FROM ai_analyses');
        console.log(`   ✅ ${resultAi.rowCount} análisis de IA eliminados`);

        // 2. Borrar intervenciones (depende de couders y users)
        console.log('🗑️  Borrando interventions...');
        const resultIv = await client.query('DELETE FROM interventions');
        console.log(`   ✅ ${resultIv.rowCount} intervenciones eliminadas`);

        // 3. Borrar couders (aprendices)
        console.log('🗑️  Borrando couders...');
        const resultCouders = await client.query('DELETE FROM couders');
        console.log(`   ✅ ${resultCouders.rowCount} couders eliminados`);

        // 4. Borrar clans (grupos)
        console.log('🗑️  Borrando clans...');
        const resultClans = await client.query('DELETE FROM clans');
        console.log(`   ✅ ${resultClans.rowCount} clans eliminados`);

        // 5. Borrar cohorts (cortes)
        console.log('🗑️  Borrando cohorts...');
        const resultCohorts = await client.query('DELETE FROM cohorts');
        console.log(`   ✅ ${resultCohorts.rowCount} cohorts eliminados`);

        // 6. Opcional: mantener usuarios demo o borrar todos
        if (keepUsers) {
            console.log('🔒 Manteniendo usuarios demo (opción --keep-users)');
            // Borrar solo usuarios que no sean demo
            const resultUsers = await client.query(`
                DELETE FROM users 
                WHERE email NOT IN (
                    'interventor@clinica.com',
                    'admin@clinica.com', 
                    'lider@clinica.com',
                    'mentor@clinica.com',
                    'bybelas@clinica.com'
                )
            `);
            console.log(`   ✅ ${resultUsers.rowCount} usuarios no-demo eliminados`);
            console.log('   🔒 Usuarios demo conservados:');
            const demoUsers = await client.query(`
                SELECT email, full_name FROM users 
                WHERE email IN (
                    'interventor@clinica.com',
                    'admin@clinica.com', 
                    'lider@clinica.com',
                    'mentor@clinica.com',
                    'bybelas@clinica.com'
                )
            `);
            demoUsers.rows.forEach(u => console.log(`      - ${u.email} (${u.full_name})`));
        } else {
            console.log('🗑️  Borrando todos los users...');
            const resultUsers = await client.query('DELETE FROM users');
            console.log(`   ✅ ${resultUsers.rowCount} usuarios eliminados`);
        }

        // 7. NO borrar tablas de lookup (sedes, routes, roles, intervention_types)
        console.log('🔒 Manteniendo tablas de lookup (sedes, routes, roles, intervention_types)');

        await client.query('COMMIT');

        console.log('\n✨ Limpieza completada exitosamente!');
        console.log('📊 Estado de tablas de lookup:');
        
        const tables = ['sedes', 'routes', 'roles', 'intervention_types'];
        for (const table of tables) {
            const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
            console.log(`   ${table}: ${result.rows[0].count} registros`);
        }

        console.log('\n🔄 Para ejecutar la migración final:');
        console.log('   npm run migrate');
        console.log('   npm run seed');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error en limpieza:', err.message);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
}

// Función para verificar estado actual
async function checkDataStatus() {
    const client = await pool.connect();
    try {
        console.log('\n📊 Estado actual de datos:');
        
        const tables = [
            'ai_analyses', 'interventions', 'couders', 
            'clans', 'cohorts', 'users', 'sedes', 
            'routes', 'roles', 'intervention_types'
        ];

        for (const table of tables) {
            const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
            console.log(`   ${table.padEnd(20)}: ${result.rows[0].count} registros`);
        }

    } finally {
        client.release();
        await pool.end();
    }
}

// Ejecutar limpieza o solo verificar
if (process.argv.includes('--check')) {
    checkDataStatus();
} else {
    cleanBadData();
}
