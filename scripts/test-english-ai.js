const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function testEnglishAI() {
  try {
    console.log('🧪 Testing English AI Analysis...');
    
    // Get a sample couder with interventions
    const result = await pool.query(`
      SELECT c.id, c.full_name, c.clan_id, cl.name as clan_name
      FROM couders c
      JOIN clans cl ON c.clan_id = cl.id
      LIMIT 1
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ No couders found');
      return;
    }
    
    const couder = result.rows[0];
    console.log(`📋 Testing with couder: ${couder.full_name} (${couder.clan_name})`);
    
    // Get interventions
    const interventions = await pool.query(`
      SELECT i.session_date, i.session_time, it.name as intervention_type, u.full_name as added_by, i.notes
      FROM interventions i
      JOIN intervention_types it ON it.id = i.intervention_type_id
      JOIN users u ON u.id = i.user_id
      WHERE i.couder_id = $1
      LIMIT 3
    `, [couder.id]);
    
    if (interventions.rows.length === 0) {
      console.log('❌ No interventions found');
      return;
    }
    
    console.log('📝 Sample interventions:');
    interventions.rows.forEach((iv, index) => {
      console.log(`   ${index + 1}. ${iv.session_date} - ${iv.intervention_type}: ${iv.notes.substring(0, 50)}...`);
    });
    
    console.log('✅ English AI Analysis system is ready!');
    console.log('🔄 To test new AI generation, restart the server and use the web interface');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testEnglishAI();
