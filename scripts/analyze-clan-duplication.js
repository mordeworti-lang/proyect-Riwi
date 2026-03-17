const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function analyzeClanDuplication() {
  try {
    console.log('🔍 Analizando duplicación de clans...');
    
    // 1. Verificar nombres duplicados exactos
    console.log('\n📊 1. Clans con nombres duplicados:');
    const duplicateClans = await pool.query(`
      SELECT 
        name,
        cohort_id,
        COUNT(*) as count,
        MIN(id) as first_id,
        MAX(id) as last_id,
        STRING_AGG(id::text, ', ' ORDER BY id) as all_ids
      FROM clans
      GROUP BY name, cohort_id
      HAVING COUNT(*) > 1
      ORDER BY count DESC, name
      LIMIT 20
    `);
    
    if (duplicateClans.rows.length > 0) {
      console.log('⚠️  Clans duplicados encontrados:');
      duplicateClans.rows.forEach(row => {
        console.log(`   ${row.name}: ${row.count} veces (IDs: ${row.first_id} a ${row.last_id})`);
      });
    } else {
      console.log('✅ No hay clans con nombres duplicados');
    }
    
    // 2. Verificar estructura por cohort
    console.log('\n📊 2. Análisis por cohort:');
    const cohortAnalysis = await pool.query(`
      SELECT 
        co.name as cohort_name,
        s.name as sede_name,
        COUNT(DISTINCT c.id) as total_clan_records,
        COUNT(DISTINCT c.name) as unique_clan_names,
        COUNT(cou.id) as total_couders
      FROM cohorts co
      JOIN sedes s ON co.sede_id = s.id
      LEFT JOIN clans c ON c.cohort_id = co.id
      LEFT JOIN couders cou ON cou.clan_id = c.id
      GROUP BY co.id, co.name, s.name
      ORDER BY s.name, co.name
    `);
    
    cohortAnalysis.rows.forEach(row => {
      const duplication = row.total_clan_records / row.unique_clan_names;
      console.log(`[${row.sede_name}] ${row.cohort_name}:`);
      console.log(`   Registros: ${row.total_clan_records}, Únicos: ${row.unique_clan_names}, Couders: ${row.total_couders}`);
      console.log(`   Factor duplicación: ${duplication}x`);
    });
    
    // 3. Verificar couders por clan único
    console.log('\n📊 3. Couders por clan único (sin duplicación):');
    const uniqueClanAnalysis = await pool.query(`
      SELECT 
        c.name,
        co.name as cohort_name,
        s.name as sede_name,
        COUNT(cou.id) as couders_count,
        AVG(cou.average_score) as avg_score
      FROM clans c
      JOIN cohorts co ON c.cohort_id = co.id
      JOIN sedes s ON co.sede_id = s.id
      LEFT JOIN couders cou ON cou.clan_id = c.id
      WHERE c.id IN (
        SELECT MIN(id) FROM clans GROUP BY name, cohort_id
      )
      GROUP BY c.id, c.name, co.name, s.name
      ORDER BY s.name, co.name, c.name
      LIMIT 15
    `);
    
    uniqueClanAnalysis.rows.forEach(row => {
      const avgScore = row.avg_score ? parseFloat(row.avg_score).toFixed(2) : 'N/A';
      console.log(`   [${row.sede_name}] ${row.cohort_name} - ${row.name}: ${row.couders_count} couders (avg: ${avgScore})`);
    });
    
    // 4. Calcular impacto
    console.log('\n📊 4. Impacto de la duplicación:');
    const totalRecords = await pool.query('SELECT COUNT(*) as count FROM clans');
    const uniqueNames = await pool.query('SELECT COUNT(DISTINCT name) as count FROM clans');
    
    const total = parseInt(totalRecords.rows[0].count);
    const unique = parseInt(uniqueNames.rows[0].count);
    const duplicationFactor = total / unique;
    
    console.log(`   Total registros de clans: ${total}`);
    console.log(`   Nombres únicos de clans: ${unique}`);
    console.log(`   Factor de duplicación: ${duplicationFactor}x`);
    console.log(`   Registros duplicados: ${total - unique}`);
    
    // 5. Recomendación
    console.log('\n📊 5. Recomendación:');
    if (duplicationFactor > 1.5) {
      console.log('⚠️  SE DETECTÓ DUPLICACIÓN MASIVA - Se necesita limpieza urgente');
      console.log(`   Cada clan está duplicado ${duplicationFactor} veces en promedio`);
      console.log('   Esto afecta la integridad de los datos y el rendimiento');
      console.log('   Solución: Reasignar couders al clan original y eliminar duplicados');
    } else {
      console.log('✅ No hay duplicación significativa');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

analyzeClanDuplication();
