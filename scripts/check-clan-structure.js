const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkClanStructure() {
  try {
    console.log('📊 Estructura de clans por cohort:');
    const clansByCohort = await pool.query(`
      SELECT 
        co.name as cohort_name,
        s.name as sede_name,
        COUNT(c.id) as total_clans,
        COUNT(cou.id) as total_couders,
        ROUND(AVG(cou.average_score), 2) as avg_score
      FROM cohorts co
      JOIN sedes s ON co.sede_id = s.id
      LEFT JOIN clans c ON c.cohort_id = co.id
      LEFT JOIN couders cou ON cou.clan_id = c.id
      GROUP BY co.id, co.name, s.name
      ORDER BY s.name, co.name
    `);
    
    clansByCohort.rows.forEach(row => {
      console.log(`[${row.sede_name}] ${row.cohort_name}: ${row.total_clans} clans, ${row.total_couders} couders (avg: ${row.avg_score || 'N/A'})`);
    });
    
    console.log('\n📊 Verificación de estructura esperada:');
    const expectedStructure = [
      { sede: 'Medellin', cohort: 'Cohorte 1', expected_clans: 5 },
      { sede: 'Medellin', cohort: 'Cohorte 2', expected_clans: 5 },
      { sede: 'Medellin', cohort: 'Cohorte 3', expected_clans: 5 },
      { sede: 'Medellin', cohort: 'Cohorte 4', expected_clans: 5 },
      { sede: 'Barranquilla', cohort: 'Cohorte 5', expected_clans: 5 },
      { sede: 'Barranquilla', cohort: 'Cohorte 6', expected_clans: 5 }
    ];
    
    let totalExpectedClans = 0;
    expectedStructure.forEach(exp => {
      totalExpectedClans += exp.expected_clans;
      const found = clansByCohort.rows.find(row => 
        row.sede_name === exp.sede && row.cohort_name.includes(exp.cohort.replace('Cohorte ', ''))
      );
      if (found) {
        console.log(`✅ [${exp.sede}] ${exp.cohort}: ${found.total_clans}/${exp.expected_clans} clans`);
      } else {
        console.log(`❌ [${exp.sede}] ${exp.cohort}: 0/${exp.expected_clans} clans`);
      }
    });
    
    console.log(`\n📊 Resumen: Expected ${totalExpectedClans} clans, Found ${clansByCohort.rows.reduce((sum, row) => sum + row.total_clans, 0)} clans`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkClanStructure();
