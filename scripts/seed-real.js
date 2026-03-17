// ============================================================
// Clinical Management System - Seed Data Script (ESTRUCTURA REAL)
// Crea la estructura organizacional real de Riwi con validaciones anti-duplicación
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
        console.log('[seed] Creando estructura real de Riwi...');

        // 0. Demo user (idempotent)
        console.log('[seed] Creando usuario demo...');
        const demoHash = await bcrypt.hash('Interventor1234!', 12);
        await client.query(`
            INSERT INTO users (full_name, email, password_hash, role_id, is_active)
            VALUES ('Interventor Demo', 'interventor@clinica.com', $1,
                    (SELECT id FROM roles WHERE name = 'interventor'), true)
            ON CONFLICT (email) DO UPDATE
              SET password_hash = EXCLUDED.password_hash, is_active = true
        `, [demoHash]);
        console.log('[seed] [OK] Usuario demo: interventor@clinica.com / Interventor1234!');

        // 1. Staff users (con emails fijos para evitar duplicación)
        console.log('[seed] Creando usuarios staff...');
        let users = [];
        const staffUsers = [
            { fullName: 'Marlon', email: 'marlon@riwi.com' },
            { fullName: 'Lili', email: 'lili@riwi.com' },
            { fullName: 'Alejandra', email: 'alejandra@riwi.com' },
            { fullName: 'Jhon', email: 'jhon@riwi.com' }
        ];

        for (const staff of staffUsers) {
            const passwordHash = await bcrypt.hash('password123', 12);
            const result = await client.query(`
                INSERT INTO users (full_name, email, password_hash, role_id, is_active)
                VALUES ($1, $2, $3, (SELECT id FROM roles WHERE name = 'interventor'), true)
                ON CONFLICT (email) DO UPDATE
                  SET full_name = EXCLUDED.full_name, password_hash = EXCLUDED.password_hash, is_active = true
                RETURNING id
            `, [staff.fullName, staff.email, passwordHash]);
            if (result.rows.length > 0) {
                users.push({ id: result.rows[0].id, full_name: staff.fullName });
            } else {
                // Si ya existe, obtener su ID
                const existingUser = await client.query(
                    'SELECT id FROM users WHERE email = $1',
                    [staff.email]
                );
                if (existingUser.rows.length > 0) {
                    users.push({ id: existingUser.rows[0].id, full_name: staff.fullName });
                }
            }
        }
        const demoRow = await client.query(`SELECT id FROM users WHERE email = 'interventor@clinica.com'`);
        if (demoRow.rows.length > 0) users.push({ id: demoRow.rows[0].id, full_name: 'Interventor Demo' });
        console.log(`[seed] [OK] ${users.length} usuarios staff listos`);

        // 2. Sedes (solo 2: Medellin y Barranquilla)
        console.log('[seed] Creando sedes...');
        let sedes = [];
        const sedeDefs = [
            { name: 'Medellin' },
            { name: 'Barranquilla' }
        ];

        for (const s of sedeDefs) {
            const result = await client.query(`
                INSERT INTO sedes (name) VALUES ($1)
                ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
                RETURNING id
            `, [s.name]);
            if (result.rows.length > 0) sedes.push({ id: result.rows[0].id, name: s.name });
        }
        console.log(`[seed] [OK] ${sedes.length} sedes creadas`);

        // 3. Cohorts (6 total con IDs específicos)
        console.log('[seed] Creando cohorts con IDs correctos...');
        let cohorts = [];
        
        // Medellin: Cohorts 1, 2, 4, 6
        const medellinSede = sedes.find(s => s.name === 'Medellin');
        const barranquillaSede = sedes.find(s => s.name === 'Barranquilla');
        
        if (medellinSede) {
            // Cohort 1: Básico (terminado)
            const result1 = await client.query(`
                INSERT INTO cohorts (name, sede_id, route_id, is_active)
                VALUES ('Cohorte 1 - Básico', $1, (SELECT id FROM routes WHERE name = 'basica'), false)
                ON CONFLICT (name, sede_id) DO UPDATE SET route_id = EXCLUDED.route_id, is_active = EXCLUDED.is_active
                RETURNING id
            `, [medellinSede.id]);
            if (result1.rows.length > 0) cohorts.push({ id: result1.rows[0].id, name: 'Cohorte 1 - Básico', route: 'basica', sede_id: medellinSede.id, estado: 'terminado' });
            
            // Cohort 2: Básico (terminado)
            const result2 = await client.query(`
                INSERT INTO cohorts (name, sede_id, route_id, is_active)
                VALUES ('Cohorte 2 - Básico', $1, (SELECT id FROM routes WHERE name = 'basica'), false)
                ON CONFLICT (name, sede_id) DO UPDATE SET route_id = EXCLUDED.route_id, is_active = EXCLUDED.is_active
                RETURNING id
            `, [medellinSede.id]);
            if (result2.rows.length > 0) cohorts.push({ id: result2.rows[0].id, name: 'Cohorte 2 - Básico', route: 'basica', sede_id: medellinSede.id, estado: 'terminado' });
            
            // Cohort 4: Básico (terminado)
            const result4 = await client.query(`
                INSERT INTO cohorts (name, sede_id, route_id, is_active)
                VALUES ('Cohorte 4 - Básico', $1, (SELECT id FROM routes WHERE name = 'basica'), false)
                ON CONFLICT (name, sede_id) DO UPDATE SET route_id = EXCLUDED.route_id, is_active = EXCLUDED.is_active
                RETURNING id
            `, [medellinSede.id]);
            if (result4.rows.length > 0) cohorts.push({ id: result4.rows[0].id, name: 'Cohorte 4 - Básico', route: 'basica', sede_id: medellinSede.id, estado: 'terminado' });
            
            // Cohort 6: Avanzado (tu cohorte, mitad terminada)
            const result6 = await client.query(`
                INSERT INTO cohorts (name, sede_id, route_id, is_active)
                VALUES ('Cohorte 6 - Avanzado', $1, (SELECT id FROM routes WHERE name = 'avanzada'), true)
                ON CONFLICT (name, sede_id) DO UPDATE SET route_id = EXCLUDED.route_id, is_active = EXCLUDED.is_active
                RETURNING id
            `, [medellinSede.id]);
            if (result6.rows.length > 0) cohorts.push({ id: result6.rows[0].id, name: 'Cohorte 6 - Avanzado', route: 'avanzada', sede_id: medellinSede.id, estado: 'activo' });
        }
        
        // Barranquilla: Cohorts 3, 5
        if (barranquillaSede) {
            // Cohort 3: Básico
            const result3 = await client.query(`
                INSERT INTO cohorts (name, sede_id, route_id, is_active)
                VALUES ('Cohorte 3 - Básico', $1, (SELECT id FROM routes WHERE name = 'basica'), true)
                ON CONFLICT (name, sede_id) DO UPDATE SET route_id = EXCLUDED.route_id, is_active = EXCLUDED.is_active
                RETURNING id
            `, [barranquillaSede.id]);
            if (result3.rows.length > 0) cohorts.push({ id: result3.rows[0].id, name: 'Cohorte 3 - Básico', route: 'basica', sede_id: barranquillaSede.id, estado: 'activo' });
            
            // Cohort 5: Básico
            const result5 = await client.query(`
                INSERT INTO cohorts (name, sede_id, route_id, is_active)
                VALUES ('Cohorte 5 - Básico', $1, (SELECT id FROM routes WHERE name = 'basica'), true)
                ON CONFLICT (name, sede_id) DO UPDATE SET route_id = EXCLUDED.route_id, is_active = EXCLUDED.is_active
                RETURNING id
            `, [barranquillaSede.id]);
            if (result5.rows.length > 0) cohorts.push({ id: result5.rows[0].id, name: 'Cohorte 5 - Básico', route: 'basica', sede_id: barranquillaSede.id, estado: 'activo' });
        }
        
        console.log(`[seed] [OK] ${cohorts.length} cohorts creados`);

        // 4. Clanes (5 para básicos, 6 para avanzados)
        console.log('[seed] Creando clanes...');
        let clans = [];
        const tlNames = ['Marlon', 'Lili', 'Alejandra', 'Jhon'];
        
        // Lenguajes para clanes avanzados
        const lenguajes = ['JavaScript', 'Python', 'Java', 'C#', 'React', 'Node.js'];
        
        for (const cohort of cohorts) {
            if (cohort.route === 'basica') {
                // 5 clanes para cohorte básico: 2 mañana, 3 tarde
                const clanConfigs = [
                    { shift: 'morning', index: 1 },
                    { shift: 'morning', index: 2 },
                    { shift: 'afternoon', index: 3 },
                    { shift: 'afternoon', index: 4 },
                    { shift: 'afternoon', index: 5 }
                ];
                
                for (const config of clanConfigs) {
                    const clanName = `${cohort.name} - Clan ${config.shift === 'morning' ? 'AM' : 'PM'}-${config.index}`;
                    const tlName = tlNames[Math.floor(Math.random() * tlNames.length)];
                    const result = await client.query(`
                        INSERT INTO clans (name, cohort_id, shift, tl_name)
                        VALUES ($1, $2, $3, $4) 
                        ON CONFLICT (name, cohort_id) DO UPDATE SET shift = EXCLUDED.shift, tl_name = EXCLUDED.tl_name
                        RETURNING id
                    `, [clanName, cohort.id, config.shift, tlName]);
                    if (result.rows.length > 0) clans.push({ 
                        id: result.rows[0].id, 
                        name: clanName, 
                        cohort_id: cohort.id, 
                        shift: config.shift, 
                        tl_name: tlName,
                        route: 'basica'
                    });
                }
            } else {
                // 6 clanes para cohorte avanzado: 3 mañana, 3 tarde
                const clanConfigs = [
                    { shift: 'morning', index: 1, lenguaje: lenguajes[0] },
                    { shift: 'morning', index: 2, lenguaje: lenguajes[1] },
                    { shift: 'morning', index: 3, lenguaje: lenguajes[2] },
                    { shift: 'afternoon', index: 4, lenguaje: lenguajes[3] },
                    { shift: 'afternoon', index: 5, lenguaje: lenguajes[4] },
                    { shift: 'afternoon', index: 6, lenguaje: lenguajes[5] }
                ];
                
                for (const config of clanConfigs) {
                    const clanName = `${cohort.name} - Clan ${config.shift === 'morning' ? 'AM' : 'PM'}-${config.lenguaje}`;
                    const tlName = tlNames[Math.floor(Math.random() * tlNames.length)];
                    const result = await client.query(`
                        INSERT INTO clans (name, cohort_id, shift, tl_name)
                        VALUES ($1, $2, $3, $4) 
                        ON CONFLICT (name, cohort_id) DO UPDATE SET shift = EXCLUDED.shift, tl_name = EXCLUDED.tl_name
                        RETURNING id
                    `, [clanName, cohort.id, config.shift, tlName]);
                    if (result.rows.length > 0) clans.push({ 
                        id: result.rows[0].id, 
                        name: clanName, 
                        cohort_id: cohort.id, 
                        shift: config.shift, 
                        tl_name: tlName,
                        route: 'avanzada',
                        lenguaje: config.lenguaje
                    });
                }
            }
        }
        console.log(`[seed] [OK] ${clans.length} clanes creados`);

        // 5. Couders (solo si no hay suficientes)
        console.log('[seed] Creando couders...');
        let couders = [];
        const existingCoudersCount = await client.query('SELECT COUNT(*) as count FROM couders');
        const currentCouders = parseInt(existingCoudersCount.rows[0].count);
        
        if (currentCouders > 1000) {
            console.log(`[seed] [OK] Ya existen ${currentCouders} couders, omitiendo creación`);
            // Si ya existen suficientes couders, cargar los existentes
            const existingCouders = await client.query(`
                SELECT c.id, c.national_id, c.full_name, c.clan_id, c.status, c.average_score,
                       cl.name as clan_name
                FROM couders c
                JOIN clans cl ON c.clan_id = cl.id
                ORDER BY c.id
                LIMIT 2000
            `);
            couders = existingCouders.rows;
        } else {
            const statuses = ['active', 'active', 'active', 'withdrawn', 'completed'];

            for (const clan of clans) {
                let numCouders;
                if (clan.route === 'basica') {
                    // 35 couders por clan básico (175 total por cohorte)
                    numCouders = 35;
                } else {
                    // Distribución no equitativa para clanes avanzados
                    // Algunos clanes más populares que otros
                    const popularidad = Math.random();
                    if (popularidad < 0.2) {
                        numCouders = Math.floor(Math.random() * 10) + 25; // 25-35 (menos popular)
                    } else if (popularidad < 0.5) {
                        numCouders = Math.floor(Math.random() * 15) + 30; // 30-45 (popularidad media)
                    } else {
                        numCouders = Math.floor(Math.random() * 20) + 35; // 35-55 (muy popular)
                    }
                }
                
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
                        couders.push({ 
                            id: result.rows[0].id, 
                            national_id: nationalId, 
                            full_name: fullName, 
                            clan_id: clan.id, 
                            status, 
                            average_score: averageScore,
                            clan_name: clan.name
                        });
                    }
                }
            }
            console.log(`[seed] [OK] ${couders.length} couders creados`);
        }

        // 6. Interventions (solo si no hay suficientes)
        console.log('[seed] Creando intervenciones...');
        const existingInterventionsCount = await client.query('SELECT COUNT(*) as count FROM interventions');
        const currentInterventions = parseInt(existingInterventionsCount.rows[0].count);
        
        if (currentInterventions > 2500) {
            console.log(`[seed] [OK] Ya existen ${currentInterventions} intervenciones, omitiendo creación`);
        } else {
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
                            notes = `Evaluación inicial de ${couder.full_name}. Clan: ${couder.clan_name}. ${couder.lenguaje ? `Lenguaje: ${couder.lenguaje}.` : ''} Muestra buena disposición. Puntaje: ${couder.average_score}.`;
                            break;
                        case 'follow_up':
                            notes = `Seguimiento de ${couder.full_name}. Avance en actividades en ${couder.lenguaje || 'ruta básica'}. Estado: ${couder.status}.`;
                            break;
                        case 'risk_assessment':
                            notes = `Evaluación de riesgo para ${couder.full_name}. Se identifican áreas de oportunidad en ${couder.lenguaje || 'el programa'}.`;
                            break;
                        case 'closing':
                            notes = `Cierre de intervención para ${couder.full_name}. Puntaje final: ${couder.average_score}. ${couder.lenguaje ? `Proyectos completados en ${couder.lenguaje}.` : ''}`;
                            break;
                        default:
                            notes = `Intervención general con ${couder.full_name} (${couder.clan_name}). ${couder.lenguaje ? `Trabajando en ${couder.lenguaje}.` : ''} Se documentan observaciones para seguimiento.`;
                    }

                    await client.query(`
                        INSERT INTO interventions (couder_id, user_id, intervention_type_id, notes, session_date, session_time)
                        VALUES ($1, $2, (SELECT id FROM intervention_types WHERE name = $3), $4, $5, $6)
                    `, [couder.id, user.id, type, notes, sessionDate, sessionTime]);
                    ivCount++;
                }
            }
            console.log(`[seed] [OK] ${ivCount} intervenciones creadas`);
        }

        // 7. AI analyses (solo si no hay suficientes)
        console.log('[seed] Creando análisis IA...');
        const existingAiCount = await client.query('SELECT COUNT(*) as count FROM ai_analyses');
        const currentAiAnalyses = parseInt(existingAiCount.rows[0].count);
        
        if (currentAiAnalyses > 25) {
            console.log(`[seed] [OK] Ya existen ${currentAiAnalyses} análisis IA, omitiendo creación`);
        } else {
            let aiCount = 0;
            const activeCouders = couders.filter(c => c.status === 'active').slice(0, 30);

            for (const couder of activeCouders) {
                const summary = `Análisis de ${couder.full_name} del clan ${couder.clan_name}. ${couder.lenguaje ? `Especializado en ${couder.lenguaje}.` : 'Ruta básica.'} Puntaje promedio: ${couder.average_score}.`;
                const diagnosis = `${couder.full_name} presenta nivel de desarrollo adecuado. ${couder.lenguaje ? `Buena aptitud para ${couder.lenguaje}.` : 'Buen progreso en ruta básica.'} Fortalezas en comunicación y trabajo en equipo.`;
                const suggestions = couder.lenguaje 
                    ? `1) Continuar con proyectos en ${couder.lenguaje}. 2) Fortalecer liderazgo técnico. 3) Fomentar colaboración en ${couder.lenguaje}.`
                    : `1) Continuar plan actual. 2) Fortalecer liderazgo. 3) Fomentar proyectos colaborativos.`;
                await client.query(`
                    INSERT INTO ai_analyses (couder_id, period_label, summary, diagnosis, suggestions)
                    VALUES ($1, 'all', $2, $3, $4)
                `, [couder.id, summary, diagnosis, suggestions]);
                aiCount++;
            }
            console.log(`[seed] [OK] ${aiCount} análisis IA creados`);
        }

        await client.query('COMMIT');

        console.log('');
        console.log('[seed] ================================================');
        console.log('[seed] Estructura real de Riwi creada exitosamente!');
        console.log('[seed] ================================================');
        console.log('[seed] SEDES:');
        console.log('[seed]   Medellín: 4 cohorts');
        console.log('[seed]   Barranquilla: 2 cohorts');
        console.log('[seed] ');
        console.log('[seed] COHORTS:');
        cohorts.forEach(c => {
            const sede = sedes.find(s => s.id === c.sede_id);
            console.log(`[seed]   ${c.name} (${sede?.name}) - ${c.route} - ${c.estado}`);
        });
        console.log('[seed] ');
        console.log('[seed] ESTADÍSTICAS:');
        console.log('[seed]   Users:         ' + users.length);
        console.log('[seed]   Cohorts:       ' + cohorts.length);
        console.log('[seed]   Clans:         ' + clans.length);
        console.log('[seed]   Couders:       ' + couders.length);
        console.log('[seed]   Interventions: ' + (currentInterventions > 2500 ? currentInterventions : ivCount));
        console.log('[seed]   AI Analyses:   ' + (currentAiAnalyses > 25 ? currentAiAnalyses : aiCount));
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
