const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkDataDuplication() {
    try {
        console.log('🔍 Verificando si hay duplicación en couders e intervenciones...');
        
        // 1. Verificar couders duplicados por national_id
        console.log('\n📊 1. Verificando couders duplicados por CC:');
        const coudersDup = await pool.query(`
            SELECT national_id, COUNT(*) as count, MIN(id) as first_id, MAX(id) as last_id
            FROM couders
            GROUP BY national_id
            HAVING COUNT(*) > 1
            ORDER BY count DESC
            LIMIT 10
        `);
        
        if (coudersDup.rows.length > 0) {
            console.log('⚠️  Couders duplicados encontrados:');
            coudersDup.rows.forEach(row => {
                console.log(`   CC: ${row.national_id} - ${row.count} veces (IDs: ${row.first_id} a ${row.last_id})`);
            });
        } else {
            console.log('✅ No hay couders duplicados por CC');
        }
        
        // 2. Verificar distribución de couders por clan
        console.log('\n📊 2. Distribución de couders por clan:');
        const coudersByClan = await pool.query(`
            SELECT 
                c.name as clan_name,
                co.name as cohort_name,
                s.name as sede_name,
                COUNT(cou.id) as couders_count,
                AVG(cou.average_score) as avg_score
            FROM clans c
            JOIN cohorts co ON c.cohort_id = co.id
            JOIN sedes s ON co.sede_id = s.id
            LEFT JOIN couders cou ON cou.clan_id = c.id
            GROUP BY c.id, c.name, co.name, s.name
            ORDER BY s.name, co.name, c.name
            LIMIT 20
        `);
        
        console.log('Muestra de distribución:');
        coudersByClan.rows.forEach(row => {
            const avgScore = row.avg_score ? parseFloat(row.avg_score).toFixed(2) : 'N/A';
            console.log(`   [${row.sede_name}] ${row.cohort_name} - ${row.clan_name}: ${row.couders_count} couders (avg: ${avgScore})`);
        });
        
        // 3. Verificar intervenciones duplicadas exactas
        console.log('\n📊 3. Verificando intervenciones duplicadas exactas:');
        const interventionsDup = await pool.query(`
            SELECT 
                couder_id, 
                user_id, 
                intervention_type_id, 
                session_date, 
                session_time, 
                notes,
                COUNT(*) as count
            FROM interventions
            GROUP BY couder_id, user_id, intervention_type_id, session_date, session_time, notes
            HAVING COUNT(*) > 1
            ORDER BY count DESC
            LIMIT 10
        `);
        
        if (interventionsDup.rows.length > 0) {
            console.log('⚠️  Intervenciones duplicadas exactas encontradas:');
            interventionsDup.rows.forEach(row => {
                console.log(`   Couder: ${row.couder_id}, User: ${row.user_id} - ${row.count} veces duplicadas`);
            });
        } else {
            console.log('✅ No hay intervenciones duplicadas exactas');
        }
        
        // 4. Verificar distribución de intervenciones por couder
        console.log('\n📊 4. Distribución de intervenciones por couder:');
        const interventionsByCouder = await pool.query(`
            SELECT 
                COUNT(*) as total_couders_with_interventions,
                AVG(intervention_count) as avg_interventions,
                MIN(intervention_count) as min_interventions,
                MAX(intervention_count) as max_interventions,
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY intervention_count) as median_interventions
            FROM (
                SELECT couder_id, COUNT(*) as intervention_count
                FROM interventions
                GROUP BY couder_id
            ) stats
        `);
        
        const stats = interventionsByCouder.rows[0];
        console.log('Estadísticas de intervenciones por couder:');
        console.log(`   Total couders con intervenciones: ${stats.total_couders_with_interventions}`);
        console.log(`   Promedio de intervenciones: ${stats.avg_interventions ? parseFloat(stats.avg_interventions).toFixed(2) : 'N/A'}`);
        console.log(`   Mediana de intervenciones: ${stats.median_interventions ? parseFloat(stats.median_interventions).toFixed(2) : 'N/A'}`);
        console.log(`   Mínimo de intervenciones: ${stats.min_interventions}`);
        console.log(`   Máximo de intervenciones: ${stats.max_interventions}`);
        
        // 5. Verificar si los números son razonables
        console.log('\n📊 5. Análisis de razonabilidad de datos:');
        
        const totalCouders = await pool.query('SELECT COUNT(*) as count FROM couders');
        const totalInterventions = await pool.query('SELECT COUNT(*) as count FROM interventions');
        const totalClans = await pool.query('SELECT COUNT(*) as count FROM clans');
        
        const coudersCount = parseInt(totalCouders.rows[0].count);
        const interventionsCount = parseInt(totalInterventions.rows[0].count);
        const clansCount = parseInt(totalClans.rows[0].count);
        
        const avgCoudersPerClan = (coudersCount / clansCount).toFixed(2);
        const avgInterventionsPerCouder = (interventionsCount / coudersCount).toFixed(2);
        
        console.log(`   Total couders: ${coudersCount}`);
        console.log(`   Total intervenciones: ${interventionsCount}`);
        console.log(`   Total clans: ${clansCount}`);
        console.log(`   Promedio couders por clan: ${avgCoudersPerClan}`);
        console.log(`   Promedio intervenciones por couder: ${avgInterventionsPerCouder}`);
        
        // 6. Verificar fechas de creación para detectar migraciones múltiples
        console.log('\n📊 6. Verificando fechas de creación:');
        const creationDates = await pool.query(`
            SELECT 
                DATE(created_at) as creation_date,
                COUNT(*) as new_couders
            FROM couders
            GROUP BY DATE(created_at)
            ORDER BY creation_date DESC
            LIMIT 10
        `);
        
        console.log('Couders creados por fecha:');
        creationDates.rows.forEach(row => {
            console.log(`   ${row.creation_date}: ${row.new_couders} couders nuevos`);
        });
        
        // 7. Verificar si hay patrones de duplicación
        console.log('\n📊 7. Análisis final:');
        if (coudersDup.rows.length === 0 && interventionsDup.rows.length === 0) {
            console.log('✅ NO HAY DUPLICACIÓN - Los datos parecen ser correctos');
            console.log(`   ${coudersCount} couders distribuidos en ${clansCount} clans (${avgCoudersPerClan} por clan)`);
            console.log(`   ${interventionsCount} intervenciones (${avgInterventionsPerCouder} por couder)`);
            console.log('   Estos números parecen razonables para un sistema clínico activo');
        } else {
            console.log('⚠️  SE DETECTÓ DUPLICACIÓN - Se necesita limpieza');
            console.log(`   ${coudersDup.rows.length} grupos de couders duplicados`);
            console.log(`   ${interventionsDup.rows.length} grupos de intervenciones duplicadas`);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

checkDataDuplication();
