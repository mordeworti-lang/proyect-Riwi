'use strict';

class MockPostgres {
    constructor() {
        this.data = {
            roles: [
                { id: 1, name: 'admin' },
                { id: 2, name: 'lider' },
                { id: 3, name: 'mentor' },
                { id: 4, name: 'interventor' }
            ],
            sedes: [
                { id: 1, name: 'Medellín' },
                { id: 2, name: 'Barranquilla' }
            ],
            routes: [
                { id: 1, name: 'basica' },
                { id: 2, name: 'avanzada' }
            ],
            intervention_types: [
                { id: 1, name: 'initial_evaluation' },
                { id: 2, name: 'follow_up' },
                { id: 3, name: 'risk_assessment' },
                { id: 4, name: 'closing' },
                { id: 5, name: 'other' }
            ],
            users: [
                {
                    id: 1,
                    full_name: 'Interventor Demo',
                    email: 'interventor@clinica.com',
                    password_hash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5e', // Interventor1234!
                    role_id: 4,
                    is_active: true,
                    created_at: new Date()
                }
            ],
            cohorts: [],
            clans: [],
            couders: [],
            interventions: [],
            ai_analyses: []
        };
        
        this.nextIds = {
            roles: 5,
            sedes: 3,
            routes: 3,
            intervention_types: 6,
            users: 1,
            cohorts: 1,
            clans: 1,
            couders: 1,
            interventions: 1,
            ai_analyses: 1
        };
    }
    
    async query(text, params = []) {
        console.log('[MockDB] Query:', text.substring(0, 100) + '...');
        
        // Simular SELECT NOW()
        if (text.includes('SELECT NOW()')) {
            return { rows: [{ now: new Date() }] };
        }
        
        // Simular consultas básicas
        if (text.includes('SELECT')) {
            const tableName = this.extractTableName(text);
            if (this.data[tableName]) {
                let rows = this.data[tableName];
                
                // Manejar JOIN con roles para usuarios
                if (text.includes('users u') && text.includes('JOIN roles r')) {
                    rows = this.data.users.map(user => {
                        const role = this.data.roles.find(r => r.id === user.role_id);
                        return {
                            ...user,
                            role_name: role ? role.name : null
                        };
                    });
                    
                    // Filtrar por email si hay WHERE
                    if (text.includes('WHERE u.email =')) {
                        const email = params[0];
                        rows = rows.filter(user => user.email === email);
                    }
                    
                    // Filtrar por activo
                    if (text.includes('u.is_active = TRUE')) {
                        rows = rows.filter(user => user.is_active === true);
                    }
                }
                
                return { rows };
            }
        }
        
        // Simular INSERT INTO users (registro)
        if (text.includes('INSERT INTO users') && params.length > 0) {
            const newUser = {
                id: this.nextIds.users++,
                full_name: params[0],
                email: params[1],
                password_hash: params[2],
                role_id: params[3],
                is_active: params[4] || true,
                created_at: new Date()
            };
            this.data.users.push(newUser);
            return { rows: [newUser] };
        }
        
        // Simular INSERT
        if (text.includes('INSERT')) {
            const tableName = this.extractTableName(text);
            if (tableName && this.data[tableName]) {
                const newId = this.nextIds[tableName]++;
                const newItem = { id: newId, created_at: new Date() };
                this.data[tableName].push(newItem);
                return { rows: [newItem] };
            }
        }
        
        return { rows: [] };
    }
    
    extractTableName(query) {
        const patterns = {
            'roles': /FROM\s+roles|INTO\s+roles/i,
            'sedes': /FROM\s+sedes|INTO\s+sedes/i,
            'routes': /FROM\s+routes|INTO\s+routes/i,
            'intervention_types': /FROM\s+intervention_types|INTO\s+intervention_types/i,
            'users': /FROM\s+users|INTO\s+users/i,
            'cohorts': /FROM\s+cohorts|INTO\s+cohorts/i,
            'clans': /FROM\s+clans|INTO\s+clans/i,
            'couders': /FROM\s+couders|INTO\s+couders/i,
            'interventions': /FROM\s+interventions|INTO\s+interventions/i,
            'ai_analyses': /FROM\s+ai_analyses|INTO\s+ai_analyses/i
        };
        
        for (const [table, pattern] of Object.entries(patterns)) {
            if (pattern.test(query)) return table;
        }
        return null;
    }
    
    async release() {
        console.log('[MockDB] Connection released');
    }
}

const mockPool = {
    connect: async () => new MockPostgres(),
    on: (event, callback) => {
        if (event === 'error') {
            // No-op para mock
        }
    }
};

async function connectPostgres() {
    const client = await mockPool.connect();
    try {
        await client.query('SELECT NOW()');
        console.info('[postgres] Connected successfully (mock mode)');
    } finally {
        client.release();
    }
}

module.exports = connectPostgres;
module.exports.pool = mockPool;
