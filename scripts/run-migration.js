'use strict';
/**
 * run-migration.js — executes data/schema.sql against PostgreSQL.
 * Usage:
 *   npm run migrate           — create/update tables (idempotent)
 *   npm run migrate:clear     — DROP all tables then recreate
 */

require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runMigration() {
    const clear  = process.argv.includes('--clear');
    const client = await pool.connect();

    try {
        if (clear) {
            console.log('Dropping all tables...');
            await client.query(`
                DROP TABLE IF EXISTS
                    ai_analyses,
                    interventions,
                    couders,
                    clans,
                    cohorts,
                    users,
                    intervention_types,
                    sedes,
                    routes,
                    roles
                CASCADE;
            `);
            console.log('All tables dropped.');
        }

        const schemaPath = path.join(__dirname, '..', 'data', 'schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');
        await client.query(sql);
        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
