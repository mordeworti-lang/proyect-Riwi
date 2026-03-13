// ============================================================
// Clinical Management System - Seed Data Script
// Creates realistic sample data following the system flow
// ============================================================

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const generateName = () => {
    const firstNames = ['Juan', 'Maria', 'Carlos', 'Ana', 'Luis', 'Sofia', 'Pedro', 'Laura', 'Miguel', 'Camila', 'Andres', 'Valentina', 'Diego', 'Isabella', 'Felipe', 'Daniela'];
    const lastNames = ['Garcia', 'Rodriguez', 'Martinez', 'Lopez', 'Gonzalez', 'Perez', 'Sanchez', 'Ramirez', 'Torres', 'Diaz'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

const generateEmail = (name) => {
    const domains = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'];
    const cleanName = name.toLowerCase().replace(/ /g, '.').replace(/[^a-z.]/g, '');
    return `${cleanName}.${Math.floor(Math.random() * 999)}@${domains[Math.floor(Math.random() * domains.length)]}`;
};

const generateCC = () => Math.floor(Math.random() * 90000000) + 10000000;
const generatePhone = () => `3${Math.floor(Math.random() * 900000000) + 100000000}`;
const generateScore = () => (Math.random() * 4 + 1).toFixed(2);

const generateSessionDate = () => {
    const start = new Date(2024, 0, 1);
    const end = new Date();
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
        .toISOString().split('T')[0];
};

const generateSessionTime = () => {
    const hours = Math.floor(Math.random() * 10) + 8;
    const minutes = Math.random() > 0.5 ? '00' : '30';
    return `${hours}:${minutes}`;
};

async function seedDatabase() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        console.log('[seed] Starting database seeding...');

        // 0. Demo user (idempotent)
        console.log('[seed] Creating demo user...');
        const demoHash = await bcrypt.hash('Interventor1234!', 12);
        await client.query(`
            INSERT INTO users (full_name, email, password_hash, role_id, is_active)
            VALUES ('Interventor Demo', 'interventor@clinica.com', $1,
                    (SELECT id FROM roles WHERE name = 'interventor'), true)
            ON CONFLICT (email) DO UPDATE
              SET password_hash = EXCLUDED.password_hash, is_active = true
        `, [demoHash]);
        console.log('[seed] [OK] Demo user: interventor@clinica.com / Interventor1234!');

        // 1. Staff users
        console.log('[seed] Creating staff users...');
        const users = [];
        const staffNames = ['Lili Martinez', 'Alejandra Rodriguez', 'Bybelas Gonzalez', 'Carlos Lopez', 'Maria Sanchez'];

        for (const fullName of staffNames) {
            const email = generateEmail(fullName);
            const passwordHash = await bcrypt.hash('password123', 12);
            const result = await client.query(`
                INSERT INTO users (full_name, email, password_hash, role_id, is_active)
                VALUES ($1, $2, $3, (SELECT id FROM roles WHERE name = 'interventor'), true)
                ON CONFLICT (email) DO NOTHING
                RETURNING id
            `, [fullName, email, passwordHash]);
            if (result.rows.length > 0) users.push({ id: result.rows[0].id, full_name: fullName });
        }
        const demoRow = await client.query(`SELECT id FROM users WHERE email = 'interventor@clinica.com'`);
        if (demoRow.rows.length > 0) users.push({ id: demoRow.rows[0].id, full_name: 'Interventor Demo' });
        console.log(`[seed] [OK] ${users.length} staff users ready`);

        // 1.5. Sedes
        console.log('[seed] Creating sedes...');
        const sedes = [];
        const sedeDefs = [
            { name: 'Medellin' },
            { name: 'Barranquilla' },
            { name: 'Bogota' },
            { name: 'Cali' }
        ];

        for (const s of sedeDefs) {
            const result = await client.query(`
                INSERT INTO sedes (name) VALUES ($1)
                ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
                RETURNING id
            `, [s.name]);
            if (result.rows.length > 0) sedes.push({ id: result.rows[0].id, name: s.name });
        }
        console.log(`[seed] [OK] ${sedes.length} sedes ready`);

        // 2. Cohorts
        console.log('[seed] Creating cohorts...');
        const cohorts = [];
        const cohortDefs = [];
        if (sedes.length >= 2) {
            cohortDefs.push(
                { name: 'Corte 2024-1',        route: 'basica',   sede: sedes[0].id },
                { name: 'Corte 2024-2',        route: 'basica',   sede: sedes[0].id },
                { name: 'Corte 2024-Avanzado', route: 'avanzada', sede: sedes[0].id },
                { name: 'Corte 2025-1',        route: 'basica',   sede: sedes[0].id },
                { name: 'Corte 2024-1',        route: 'basica',   sede: sedes[1].id },
                { name: 'Corte 2024-Avanzado', route: 'avanzada', sede: sedes[1].id }
            );
        }

        for (const c of cohortDefs) {
            const result = await client.query(`
                INSERT INTO cohorts (name, sede_id, route_id, is_active)
                VALUES ($1, $2, (SELECT id FROM routes WHERE name = $3), true)
                RETURNING id
            `, [c.name, c.sede, c.route]);
            cohorts.push({ id: result.rows[0].id, name: c.name, route: c.route, sede_id: c.sede });
        }
        console.log(`[seed] [OK] ${cohorts.length} cohorts`);

        // 3. Clans
        console.log('[seed] Creating clans...');
        const clans = [];
        const shifts = ['morning', 'afternoon'];
        const tlNames = ['Lili Martinez', 'Alejandra Rodriguez', 'Bybelas Gonzalez', 'Carlos Lopez', 'Maria Sanchez'];

        for (const cohort of cohorts) {
            const numClans = Math.floor(Math.random() * 2) + 2;
            for (let i = 0; i < numClans; i++) {
                const shift = shifts[i % 2];
                const clanName = `Clan ${shift === 'morning' ? 'AM' : 'PM'}-${i + 1}`;
                const tlName = tlNames[Math.floor(Math.random() * tlNames.length)];
                const result = await client.query(`
                    INSERT INTO clans (name, cohort_id, shift, tl_name)
                    VALUES ($1, $2, $3, $4) RETURNING id
                `, [clanName, cohort.id, shift, tlName]);
                clans.push({ id: result.rows[0].id, name: clanName, cohort_id: cohort.id, shift, tl_name: tlName });
            }
        }
        console.log(`[seed] [OK] ${clans.length} clans`);

        // 4. Couders
        console.log('[seed] Creating couders...');
        const couders = [];
        const statuses = ['active', 'active', 'active', 'withdrawn', 'completed'];

        for (const clan of clans) {
            const numCouders = Math.floor(Math.random() * 6) + 8;
            for (let i = 0; i < numCouders; i++) {
                const fullName = generateName();
                const nationalId = generateCC();
                const email = generateEmail(fullName);
                const phone = generatePhone();
                const status = statuses[Math.floor(Math.random() * statuses.length)];
                const averageScore = parseFloat(generateScore());

                const result = await client.query(`
                    INSERT INTO couders (national_id, full_name, email, phone, clan_id, status, average_score)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ON CONFLICT (national_id) DO NOTHING
                    RETURNING id
                `, [nationalId, fullName, email, phone, clan.id, status, averageScore]);

                if (result.rows.length > 0) {
                    couders.push({ id: result.rows[0].id, national_id: nationalId, full_name: fullName, clan_id: clan.id, status, average_score: averageScore });
                }
            }
        }
        console.log(`[seed] [OK] ${couders.length} couders`);

        // 5. Interventions
        console.log('[seed] Creating interventions...');
        const ivTypes = ['initial_evaluation', 'follow_up', 'risk_assessment', 'closing', 'other'];
        let ivCount = 0;

        for (const couder of couders) {
            const numIv = Math.floor(Math.random() * 4) + 1;
            for (let i = 0; i < numIv; i++) {
                const user = users[Math.floor(Math.random() * users.length)];
                const type = ivTypes[Math.floor(Math.random() * ivTypes.length)];
                const sessionDate = generateSessionDate();
                const sessionTime = generateSessionTime();

                let notes = '';
                switch (type) {
                    case 'initial_evaluation':
                        notes = `Evaluacion inicial de ${couder.full_name}. Muestra buena disposicion. Puntaje: ${couder.average_score}.`;
                        break;
                    case 'follow_up':
                        notes = `Seguimiento de ${couder.full_name}. Avance en actividades. Estado: ${couder.status}.`;
                        break;
                    case 'risk_assessment':
                        notes = `Evaluacion de riesgo para ${couder.full_name}. Se identifican areas de oportunidad.`;
                        break;
                    case 'closing':
                        notes = `Cierre de intervencion para ${couder.full_name}. Puntaje final: ${couder.average_score}.`;
                        break;
                    default:
                        notes = `Intervencion general con ${couder.full_name}. Se documentan observaciones para seguimiento.`;
                }

                await client.query(`
                    INSERT INTO interventions (couder_id, user_id, intervention_type_id, notes, session_date, session_time)
                    VALUES ($1, $2, (SELECT id FROM intervention_types WHERE name = $3), $4, $5, $6)
                `, [couder.id, user.id, type, notes, sessionDate, sessionTime]);
                ivCount++;
            }
        }
        console.log(`[seed] [OK] ${ivCount} interventions`);

        // 6. AI analyses (PostgreSQL)
        console.log('[seed] Creating AI analyses...');
        let aiCount = 0;
        const activeCouders = couders.filter(c => c.status === 'active').slice(0, 20);

        for (const couder of activeCouders) {
            const summary = `Analisis de ${couder.full_name}. Puntaje promedio: ${couder.average_score}. Buena adaptacion al programa.`;
            const diagnosis = `${couder.full_name} presenta nivel de desarrollo adecuado. Fortalezas en comunicacion y trabajo en equipo.`;
            const suggestions = `1) Continuar plan actual. 2) Fortalecer liderazgo. 3) Fomentar proyectos colaborativos.`;
            await client.query(`
                INSERT INTO ai_analyses (couder_id, period_label, summary, diagnosis, suggestions)
                VALUES ($1, 'all', $2, $3, $4)
            `, [couder.id, summary, diagnosis, suggestions]);
            aiCount++;
        }
        console.log(`[seed] [OK] ${aiCount} AI analyses`);

        await client.query('COMMIT');

        console.log('');
        console.log('[seed] ================================================');
        console.log('[seed] Seeding completed successfully!');
        console.log('[seed]   Users:         ' + users.length);
        console.log('[seed]   Cohorts:       ' + cohorts.length);
        console.log('[seed]   Clans:         ' + clans.length);
        console.log('[seed]   Couders:       ' + couders.length);
        console.log('[seed]   Interventions: ' + ivCount);
        console.log('[seed]   AI Analyses:   ' + aiCount);
        console.log('[seed] ================================================');
        console.log('[seed] Demo login:');
        console.log('[seed]   Email:    interventor@clinica.com');
        console.log('[seed]   Password: Interventor1234!');
        console.log('[seed] ================================================');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('[seed] ERROR:', error.message);
        throw error;
    } finally {
        client.release();
    }
}

if (require.main === module) {
    seedDatabase()
        .then(() => { console.log('[seed] Done.'); process.exit(0); })
        .catch((error) => { console.error('[seed] Failed:', error.message); process.exit(1); });
}

module.exports = { seedDatabase };
