'use strict';
/**
 * seed.js — creates demo users, cohorts, clans and couders for development.
 * Run: node scripts/seed.js
 *
 * Demo credentials:
 *   admin@clinica.com  / Admin1234!   (role: admin)
 *   lider@clinica.com  / Lider1234!   (role: lider)
 *   mentor@clinica.com / Mentor1234!  (role: mentor)
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const SALT_ROUNDS = 12;

async function seed() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // ── Lookup IDs ──────────────────────────────────────────────
        const { rows: roleRows } = await client.query('SELECT id, name FROM roles');
        const roles = Object.fromEntries(roleRows.map(r => [r.name, r.id]));

        const { rows: sedeRows } = await client.query('SELECT id, name FROM sedes');
        const sedes = Object.fromEntries(sedeRows.map(s => [s.name, s.id]));

        const { rows: routeRows } = await client.query('SELECT id, name FROM routes');
        const routes = Object.fromEntries(routeRows.map(r => [r.name, r.id]));

        // ── Users ───────────────────────────────────────────────────
        const users = [
            { fullName: 'Marlon Admin',   email: 'admin@clinica.com',  password: 'Admin1234!',  role: 'admin' },
            { fullName: 'Lili Lider',     email: 'lider@clinica.com',  password: 'Lider1234!',  role: 'lider' },
            { fullName: 'Alejandra Mentor', email: 'mentor@clinica.com', password: 'Mentor1234!', role: 'mentor' },
            { fullName: 'Bybelas Coach',  email: 'bybelas@clinica.com', password: 'Byb1234!',   role: 'mentor' },
            { fullName: 'DataCore Interventor', email: 'interventor@clinica.com', password: 'Interventor1234!', role: 'interventor' },
        ];

        const userIds = {};
        for (const u of users) {
            const hash = await bcrypt.hash(u.password, SALT_ROUNDS);
            const { rows } = await client.query(`
                INSERT INTO users (full_name, email, password_hash, role_id)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
                RETURNING id
            `, [u.fullName, u.email, hash, roles[u.role]]);
            userIds[u.email] = rows[0].id;
            console.log(`User seeded: ${u.email}`);
        }

        // ── Cohorts (Cortes) ────────────────────────────────────────
        const cohortData = [
            { name: 'Corte 4', sede: 'Medellín',    route: 'basica' },
            { name: 'Corte 6', sede: 'Medellín',    route: 'avanzada' },
            { name: 'Corte 5', sede: 'Barranquilla', route: 'basica' },
            { name: 'Corte 7', sede: 'Barranquilla', route: 'avanzada' },
        ];

        const cohortIds = {};
        for (const co of cohortData) {
            const { rows } = await client.query(`
                INSERT INTO cohorts (name, sede_id, route_id)
                VALUES ($1, $2, $3)
                ON CONFLICT DO NOTHING
                RETURNING id
            `, [co.name, sedes[co.sede], routes[co.route]]);
            if (rows[0]) cohortIds[co.name] = rows[0].id;
            else {
                const { rows: existing } = await client.query(
                    'SELECT id FROM cohorts WHERE name=$1 AND sede_id=$2',
                    [co.name, sedes[co.sede]]
                );
                cohortIds[co.name] = existing[0].id;
            }
            console.log(`Cohort seeded: ${co.name}`);
        }

        // ── Clans ───────────────────────────────────────────────────
        const clanData = [
            // Medellín Corte 4 (Básica)
            { name: 'Clan A', cohort: 'Corte 4', shift: 'morning',   tl: 'Valentina Ríos' },
            { name: 'Clan B', cohort: 'Corte 4', shift: 'afternoon', tl: 'Carlos Mora' },
            { name: 'Clan C', cohort: 'Corte 4', shift: 'morning',   tl: 'Sofía Castro' },
            // Medellín Corte 6 (Avanzada)
            { name: 'Clan A', cohort: 'Corte 6', shift: 'morning',   tl: 'Daniel Pérez' },
            { name: 'Clan B', cohort: 'Corte 6', shift: 'afternoon', tl: 'Laura Gómez' },
            { name: 'Clan C', cohort: 'Corte 6', shift: 'morning',   tl: 'Miguel Ángel' },
            // Barranquilla Corte 5 (Básica)
            { name: 'Clan A', cohort: 'Corte 5', shift: 'morning',   tl: 'Miguel Torres' },
            { name: 'Clan B', cohort: 'Corte 5', shift: 'afternoon', tl: 'Isabela Vargas' },
            { name: 'Clan C', cohort: 'Corte 5', shift: 'morning',   tl: 'Andrés López' },
            { name: 'Clan D', cohort: 'Corte 5', shift: 'afternoon', tl: 'Camila Ruiz' },
            // Barranquilla Corte 7 (Avanzada)
            { name: 'Clan A', cohort: 'Corte 7', shift: 'morning',   tl: 'Felipe Díaz' },
            { name: 'Clan B', cohort: 'Corte 7', shift: 'afternoon', tl: 'Lucía Martínez' },
            { name: 'Clan C', cohort: 'Corte 7', shift: 'morning',   tl: 'Roberto Silva' },
        ];

        const clanIds = {};
        for (const cl of clanData) {
            const { rows } = await client.query(`
                INSERT INTO clans (name, cohort_id, shift, tl_name)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT DO NOTHING
                RETURNING id
            `, [cl.name, cohortIds[cl.cohort], cl.shift, cl.tl]);
            const key = `${cl.cohort}-${cl.name}`;
            if (rows[0]) clanIds[key] = rows[0].id;
            else {
                const { rows: existing } = await client.query(
                    'SELECT id FROM clans WHERE name=$1 AND cohort_id=$2',
                    [cl.name, cohortIds[cl.cohort]]
                );
                clanIds[key] = existing[0].id;
            }
        }
        console.log(`${Object.keys(clanIds).length} clans seeded`);

        // ── Couders ─────────────────────────────────────────────────
        const firstNames = ['Juan','María','Carlos','Ana','Luis','Sofía','Diego','Valentina',
                            'Andrés','Camila','Miguel','Laura','Felipe','Isabella','Sergio'];
        const lastNames  = ['Pérez','Gómez','Rodríguez','López','Martínez','García',
                            'Hernández','Díaz','Vargas','Torres','Mora','Castro','Ruiz','Ríos'];
        const statuses   = ['active','active','active','active','active','active','withdrawn','withdrawn'];

        const clanKeys = Object.keys(clanIds);
        let ccBase = 1001000000;
        let couderCount = 0;

        for (const key of clanKeys) {
            const clanId = clanIds[key];
            // ~20-27 couders per clan
            const count = 20 + Math.floor(Math.random() * 8);
            for (let i = 0; i < count; i++) {
                const fn  = firstNames[Math.floor(Math.random() * firstNames.length)];
                const ln  = lastNames[Math.floor(Math.random() * lastNames.length)];
                const cc  = String(ccBase++);
                const st  = statuses[Math.floor(Math.random() * statuses.length)];
                const avg = st === 'withdrawn' ? null : (3.5 + Math.random() * 2).toFixed(2);
                await client.query(`
                    INSERT INTO couders (national_id, full_name, clan_id, status, average_score)
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (national_id) DO NOTHING
                `, [cc, `${fn} ${ln}`, clanId, st, avg]);
                couderCount++;
            }
        }
        console.log(`${couderCount} couders seeded`);

        // ── Sample interventions for multiple couders ────────────────────
        const { rows: sampleCouders } = await client.query(
            'SELECT id FROM couders LIMIT 10'
        );
        const { rows: itRows } = await client.query('SELECT id FROM intervention_types ORDER BY id');
        const mentorId = userIds['mentor@clinica.com'];
        const liderId  = userIds['lider@clinica.com'];
        const interventorId = userIds['interventor@clinica.com'];

        const interventionNotes = [
            'Primera sesión. El couder muestra interés en el programa. Se observa motivación inicial alta.',
            'Seguimiento de avances. Se evidencia mejora en la participación. Se trabajaron estrategias de gestión del tiempo.',
            'El couder presenta avance notable en las competencias técnicas. Se recomienda refuerzo en trabajo en equipo.',
            'Sesión de evaluación. El couder reporta dificultades pero mantiene compromiso con el proceso.',
            'Entrevista de cierre. Se evalúan logros alcanzados y se definen próximos pasos.',
            'Sesión de apoyo. Se trabajan habilidades de comunicación y resolución de conflictos.',
            'Evaluación de progreso. El couder muestra buena adaptación al entorno formativo.',
            'Sesión motivacional. Se refuerzan logros y se establecen metas a corto plazo.'
        ];

        for (const couder of sampleCouders) {
            const cId = couder.id;
            const numInterventions = 2 + Math.floor(Math.random() * 4); // 2-5 interventions per couder
            
            for (let i = 0; i < numInterventions; i++) {
                const randomNote = interventionNotes[Math.floor(Math.random() * interventionNotes.length)];
                const randomType = itRows[Math.floor(Math.random() * itRows.length)].id;
                const randomUser = [mentorId, liderId, interventorId][Math.floor(Math.random() * 3)];
                const randomDate = new Date(2024, 0, 10 + i * 7); // Weekly intervals starting Jan 10
                const randomTime = ['09:00', '10:30', '11:00', '14:00', '15:30'][Math.floor(Math.random() * 5)];
                
                await client.query(`
                    INSERT INTO interventions
                        (couder_id, user_id, intervention_type_id, notes, session_date, session_time)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT DO NOTHING
                `, [cId, randomUser, randomType, randomNote, randomDate.toISOString().split('T')[0], randomTime]);
            }
        }
        console.log('Sample interventions seeded for multiple couders');

        // ── Sample AI analyses for first few couders ─────────────────────
        const { rows: aiCouders } = await client.query('SELECT id FROM couders LIMIT 5');
        
        const aiDiagnoses = [
            'El couder muestra un desenvolvimiento positivo dentro del proceso formativo. Presenta buena capacidad de adaptación y compromiso con las actividades propuestas.',
            'Se observan áreas de oportunidad en el trabajo colaborativo. El couder requiere apoyo adicional para desarrollar habilidades de comunicación efectiva.',
            'El couder demuestra alto potencial y excelente rendimiento académico. Se recomienda desafíos adicionales para maximizar su desarrollo.',
            'El couder muestra mejoría constante en su participación y engagement. Se evidencia progreso significativo en competencias técnicas.',
            'El couder requiere acompañamiento cercano para mantener la motivación. Se sugieren estrategias personalizadas de refuerzo positivo.'
        ];
        
        const aiSuggestions = [
            'Continuar con el plan actual de acompañamiento. Implementar sesiones semanales de seguimiento y reforzar logros alcanzados.',
            'Diseñar actividades grupales que fomenten el trabajo en equipo. Asignar mentoría individual para desarrollar habilidades sociales.',
            'Proponer proyectos avanzados que permitan aplicar conocimientos complejos. Considerar participación en competencias internas.',
            'Mantener estrategia actual de apoyo. Incrementar gradualmente la complejidad de las tareas asignadas.',
            'Implementar sistema de incentivos y reconocimiento. Programar reuniones individuales para identificar barreras específicas.'
        ];

        for (let i = 0; i < aiCouders.length; i++) {
            const couder = aiCouders[i];
            await client.query(`
                INSERT INTO ai_analyses (couder_id, period_label, summary, diagnosis, suggestions)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT DO NOTHING
            `, [
                couder.id,
                `Análisis ${i + 1}`,
                `Análisis comprehensivo del couder basado en intervenciones registradas durante el periodo formativo.`,
                aiDiagnoses[i],
                aiSuggestions[i]
            ]);
        }
        console.log('Sample AI analyses seeded');

        await client.query('COMMIT');
        console.log('\nSeed completed successfully');
        console.log('\nDemo credentials:');
        console.log('  admin@clinica.com      / Admin1234!');
        console.log('  lider@clinica.com      / Lider1234!');
        console.log('  mentor@clinica.com     / Mentor1234!');
        console.log('  bybelas@clinica.com    / Byb1234!');
        console.log('  interventor@clinica.com / Interventor1234!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Seed failed:', err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();
