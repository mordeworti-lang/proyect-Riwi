const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function detailedClanAnalysis() {
  try {
    console.log('🔍 Análisis detallado de clans y couders...');
    
    // 1. Verificar todos los clans con sus IDs
    console.log('\n📊 1. Todos los clans registrados:');
    const allClans = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.shift,
        c.tl_name,
        co.name as cohort_name,
        s.name as sede_name,
        COUNT(cou.id) as couders_count
      FROM clans c
      JOIN cohorts co ON c.cohort_id = co.id
      JOIN sedes s ON co.sede_id = s.id
      LEFT JOIN couders cou ON cou.clan_id = c.id
      GROUP BY c.id, c.name, c.shift, c.tl_name, co.name, s.name
      ORDER BY s.name, co.name, c.name
    `);
    
    console.log(`Total clans encontrados: ${allClans.rows.length}`);
    allClans.rows.forEach(row => {
      console.log(`   ID: ${row.id} | [${row.sede_name}] ${row.cohort_name} - ${row.name} (${row.shift}) | ${row.couders_count} couders`);
    });
    
    // 2. Verificar si hay nombres similares con pequeñas diferencias
    console.log('\n📊 2. Búsqueda de nombres similares:');
    const similarNames = await pool.query(`
      SELECT 
        name,
        cohort_id,
        COUNT(*) as count,
        STRING_AGG(id::text, ', ' ORDER BY id) as ids
      FROM clans
      GROUP BY name, cohort_id
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `);
    
    if (similarNames.rows.length > 0) {
      console.log('⚠️  Nombres exactos duplicados:');
      similarNames.rows.forEach(row => {
        console.log(`   ${row.name}: ${row.count} veces (IDs: ${row.ids})`);
      });
    } else {
      console.log('✅ No hay nombres exactos duplicados');
    }
    
    // 3. Verificar patrones de naming
    console.log('\n📊 3. Patrones de naming por cohort:');
    const namingPatterns = await pool.query(`
      SELECT 
        co.name as cohort_name,
        s.name as sede_name,
        COUNT(DISTINCT c.name) as unique_names,
        COUNT(c.id) as total_records,
        STRING_AGG(DISTINCT c.name, ' | ' ORDER BY c.name) as all_names
      FROM clans c
      JOIN cohorts co ON c.cohort_id = co.id
      JOIN sedes s ON co.sede_id = s.id
      GROUP BY co.id, co.name, s.name
      ORDER BY s.name, co.name
    `);
    
    namingPatterns.rows.forEach(row => {
      console.log(`\n[${row.sede_name}] ${row.cohort_name}:`);
      console.log(`   Nombres únicos: ${row.unique_names}`);
      console.log(`   Total registros: ${row.total_records}`);
      console.log(`   Nombres: ${row.all_names}`);
    });
    
    // 4. Verificar distribución de couders
    console.log('\n📊 4. Distribución de couders:');
    const coudersByClan = await pool.query(`
      SELECT 
        c.id,
        c.name,
        COUNT(cou.id) as couders_count,
        AVG(cou.average_score) as avg_score
      FROM clans c
      LEFT JOIN couders cou ON cou.clan_id = c.id
      GROUP BY c.id, c.name
      ORDER BY couders_count DESC, c.name
    `);
    
    console.log('Couders por clan:');
    coudersByClan.rows.forEach(row => {
      const avgScore = row.avg_score ? parseFloat(row.avg_score).toFixed(2) : 'N/A';
      console.log(`   ID ${row.id}: ${row.name} - ${row.couders_count} couders (avg: ${avgScore})`);
    });
    
    // 5. Verificar si hay inconsistencias
    console.log('\n📊 5. Verificación de consistencia:');
    const totalClans = allClans.rows.length;
    const expectedClans = 30; // 6 cohorts × 5 clans each
    const totalCouders = allClans.rows.reduce((sum, row) => sum + row.couders_count, 0);
    
    console.log(`Total clans: ${totalClans} (esperado: ${expectedClans})`);
    console.log(`Total couders: ${totalCouders}`);
    console.log(`Promedio couders por clan: ${(totalCouders / totalClans).toFixed(2)}`);
    
    if (totalClans > expectedClans) {
      console.log('⚠️  Hay más clans de los esperados');
    } else if (totalClans < expectedClans) {
      console.log('⚠️  Hay menos clans de los esperados');
    } else {
      console.log('✅ El número de clans es correcto');
    }
    
    // 6. Verificar cohorts faltantes
    console.log('\n📊 6. Cohorts y su estado:');
    const cohortStatus = await pool.query(`
      SELECT 
        co.name,
        s.name as sede_name,
        COUNT(c.id) as clans_count,
        COUNT(cou.id) as couders_count
      FROM cohorts co
      JOIN sedes s ON co.sede_id = s.id
      LEFT JOIN clans c ON c.cohort_id = co.id
      LEFT JOIN couders cou ON cou.clan_id = c.id
      GROUP BY co.id, co.name, s.name
      ORDER BY s.name, co.name
    `);
    
    console.log('Estado de cohorts:');
    cohortStatus.rows.forEach(row => {
      console.log(`   [${row.sede_name}] ${row.name}: ${row.clans_count} clans, ${row.couders_count} couders`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

detailedClanAnalysis();
