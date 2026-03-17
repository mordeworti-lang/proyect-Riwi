'use strict';

const AutoMigrationService = require('../services/autoMigrationService');
const postgres = require('../config/postgres-mock');
const pool = postgres.pool;

const MigrationController = {
  async runMigration(req, res, next) {
    try {
      console.log(' Ejecutando migración automática de datos de testing...');
      
      const migrationService = new AutoMigrationService(pool);
      const result = await migrationService.migrateAll();
      
      if (result.success) {
        console.log(' Migración completada exitosamente');
        res.status(200).json({
          ok: true,
          message: 'Migración de datos completada exitosamente',
          data: {
            summary: result.summary,
            details: result.results
          }
        });
      } else {
        console.log(' Error en migración:', result.error);
        res.status(500).json({
          ok: false,
          message: 'Error en migración de datos',
          error: result.error,
          details: result.results
        });
      }
    } catch (err) {
      console.error(' Error en controlador de migración:', err);
      next(err);
    }
  },

  async verifyMigration(req, res, next) {
    try {
      console.log(' Verificando datos migrados...');
      
      const client = await pool.connect();
      
      try {
        // Verificar conteos
        const counts = await client.query(`
          SELECT 
            (SELECT COUNT(*) FROM users) as users,
            (SELECT COUNT(*) FROM couders) as couders,
            (SELECT COUNT(*) FROM interventions) as interventions,
            (SELECT COUNT(*) FROM ai_analyses) as ai_analyses
        `);
        
        // Verificar sedes
        const sedes = await client.query('SELECT id, name FROM sedes ORDER BY id');
        
        // Verificar estructura
        const structure = await client.query(`
          SELECT 
            (SELECT COUNT(*) FROM cohorts) as cohorts,
            (SELECT COUNT(*) FROM clans) as clans
        `);
        
        res.status(200).json({
          ok: true,
          data: {
            counts: counts.rows[0],
            sedes: sedes.rows,
            structure: structure.rows[0],
            verified: true
          }
        });
      } finally {
        client.release();
      }
    } catch (err) {
      next(err);
    }
  }
};

module.exports = MigrationController;
