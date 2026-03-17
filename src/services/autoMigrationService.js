const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

// Datos de migración embebidos para evitar dependencias de archivos externos
// NOTA: Estos son datos de ejemplo para desarrollo - NO usar en producción
const MIGRATION_DATA = {
  users: [
    { id: 1, full_name: 'Interventor Demo', email: 'interventor@clinica.com', password: 'CHANGE_ME_IN_PRODUCTION', role_id: 1, is_active: true },
    { id: 2, full_name: 'Lili Martinez', email: 'lili.martinez@clinica.com', password: 'CHANGE_ME_IN_PRODUCTION', role_id: 1, is_active: true },
    { id: 3, full_name: 'Alejandra Rodriguez', email: 'alejandra.rodriguez@clinica.com', password: 'CHANGE_ME_IN_PRODUCTION', role_id: 1, is_active: true },
    { id: 4, full_name: 'Bybelas Gonzalez', email: 'bybelas.gonzalez@clinica.com', password: 'CHANGE_ME_IN_PRODUCTION', role_id: 1, is_active: true },
    { id: 5, full_name: 'Carlos Lopez', email: 'carlos.lopez@clinica.com', password: 'CHANGE_ME_IN_PRODUCTION', role_id: 1, is_active: true }
  ],
  couders: [
    { id: 1001, national_id: '123456789', full_name: 'Juan Perez Garcia', email: 'juan.perez@email.com', phone: '3001234567', clan_id: 57, status: 'active', average_score: 85.5 },
    { id: 1002, national_id: '987654321', full_name: 'Maria Rodriguez Lopez', email: 'maria.rodriguez@email.com', phone: '3102345678', clan_id: 57, status: 'active', average_score: 78.2 },
    { id: 1003, national_id: '456789123', full_name: 'Carlos Martinez Sanchez', email: 'carlos.martinez@email.com', phone: '3203456789', clan_id: 57, status: 'withdrawn', average_score: 92.1 },
    { id: 1004, national_id: '789123456', full_name: 'Ana Diaz Herrera', email: 'ana.diaz@email.com', phone: '3304567890', clan_id: 57, status: 'active', average_score: 88.7 },
    { id: 1005, national_id: '321654987', full_name: 'Luis Torres Ramirez', email: 'luis.torres@email.com', phone: '3405678901', clan_id: 57, status: 'active', average_score: 91.3 },
    { id: 1006, national_id: '654987321', full_name: 'Sofia Castro Morales', email: 'sofia.castro@email.com', phone: '3506789012', clan_id: 57, status: 'active', average_score: 87.9 },
    { id: 1007, national_id: '159753852', full_name: 'Pedro Guerrero Vargas', email: 'pedro.guerrero@email.com', phone: '3607890123', clan_id: 57, status: 'active', average_score: 89.4 },
    { id: 1008, national_id: '852741963', full_name: 'Laura Navarro Mendoza', email: 'laura.navarro@email.com', phone: '3708901234', clan_id: 57, status: 'completed', average_score: 94.2 },
    { id: 1009, national_id: '741852963', full_name: 'David Ortiz Silva', email: 'david.ortiz@email.com', phone: '3809012345', clan_id: 57, status: 'active', average_score: 86.8 },
    { id: 1010, national_id: '963258741', full_name: 'Elena Ruiz Torres', email: 'elena.ruiz@email.com', phone: '3900123456', clan_id: 57, status: 'active', average_score: 90.1 },
    { id: 1011, national_id: '147258369', full_name: 'Miguel Angel Jimenez', email: 'miguel.jimenez@email.com', phone: '3001234568', clan_id: 58, status: 'active', average_score: 82.3 },
    { id: 1012, national_id: '258369147', full_name: 'Carmen Lucia Diaz', email: 'carmen.diaz@email.com', phone: '3102345679', clan_id: 58, status: 'active', average_score: 79.6 },
    { id: 1013, national_id: '369147258', full_name: 'Roberto Carlos Sanchez', email: 'roberto.sanchez@email.com', phone: '3203456790', clan_id: 58, status: 'withdrawn', average_score: 88.4 },
    { id: 1014, national_id: '741852963', full_name: 'Patricia Maria Torres', email: 'patricia.torres@email.com', phone: '3304567891', clan_id: 58, status: 'active', average_score: 91.7 },
    { id: 1015, national_id: '852963741', full_name: 'Javier Fernando Lopez', email: 'javier.lopez@email.com', phone: '3405678902', clan_id: 58, status: 'active', average_score: 87.2 },
    { id: 1016, national_id: '963741852', full_name: 'Sandra Patricia Gomez', email: 'sandra.gomez@email.com', phone: '3506789013', clan_id: 58, status: 'active', average_score: 84.9 },
    { id: 1017, national_id: '159753852', full_name: 'Daniel Alejandro Castro', email: 'daniel.castro@email.com', phone: '3607890124', clan_id: 58, status: 'active', average_score: 89.6 },
    { id: 1018, national_id: '753951852', full_name: 'Maria Fernanda Vargas', email: 'maria.vargas@email.com', phone: '3708901235', clan_id: 58, status: 'completed', average_score: 93.8 },
    { id: 1019, national_id: '951753852', full_name: 'Andres Felipe Ortiz', email: 'andres.ortiz@email.com', phone: '3809012346', clan_id: 58, status: 'active', average_score: 86.1 },
    { id: 1020, national_id: '357159852', full_name: 'Laura Valentina Ruiz', email: 'laura.ruiz@email.com', phone: '3900123457', clan_id: 58, status: 'active', average_score: 90.4 },
    { id: 1021, national_id: '654321987', full_name: 'Esteban Jose Ramirez', email: 'esteban.ramirez@email.com', phone: '3001234569', clan_id: 59, status: 'active', average_score: 83.7 },
    { id: 1022, national_id: '321987654', full_name: 'Natalia Andrea Herrera', email: 'natalia.herrera@email.com', phone: '3102345680', clan_id: 59, status: 'active', average_score: 80.9 },
    { id: 1023, national_id: '987654321', full_name: 'Felipe Andres Morales', email: 'felipe.morales@email.com', phone: '3203456791', clan_id: 59, status: 'withdrawn', average_score: 89.2 },
    { id: 1024, national_id: '147258369', full_name: 'Diana Carolina Silva', email: 'diana.silva@email.com', phone: '3304567892', clan_id: 59, status: 'active', average_score: 92.5 },
    { id: 1025, national_id: '258369147', full_name: 'Carlos Eduardo Mendoza', email: 'carlos.mendoza@email.com', phone: '3405678903', clan_id: 59, status: 'active', average_score: 88.1 },
    { id: 1026, national_id: '369147258', full_name: 'Ana Maria Jimenez', email: 'ana.jimenez@email.com', phone: '3506789014', clan_id: 59, status: 'active', average_score: 85.8 },
    { id: 1027, national_id: '741852963', full_name: 'Luis Fernando Castro', email: 'luis.castro@email.com', phone: '3607890125', clan_id: 59, status: 'active', average_score: 90.7 },
    { id: 1028, national_id: '852963741', full_name: 'Sofia Alejandra Diaz', email: 'sofia.diaz@email.com', phone: '3708901236', clan_id: 59, status: 'completed', average_score: 94.1 },
    { id: 1029, national_id: '963741852', full_name: 'Ricardo Martin Torres', email: 'ricardo.torres@email.com', phone: '3809012347', clan_id: 59, status: 'active', average_score: 87.3 },
    { id: 1030, national_id: '159753852', full_name: 'Marcela Patricia Lopez', email: 'marcela.lopez@email.com', phone: '3900123458', clan_id: 59, status: 'active', average_score: 91.2 },
    { id: 1031, national_id: '753951468', full_name: 'Juan Carlos Sanchez', email: 'juan.sanchez@email.com', phone: '3001234570', clan_id: 60, status: 'active', average_score: 84.5 },
    { id: 1032, national_id: '951468753', full_name: 'Carmen Rosa Herrera', email: 'carmen.herrera@email.com', phone: '3102345681', clan_id: 60, status: 'active', average_score: 81.2 },
    { id: 1033, national_id: '468753951', full_name: 'Miguel Angel Ortiz', email: 'miguel.ortiz@email.com', phone: '3203456792', clan_id: 60, status: 'withdrawn', average_score: 90.3 },
    { id: 1034, national_id: '147852369', full_name: 'Patricia Elena Gomez', email: 'patricia.gomez@email.com', phone: '3304567893', clan_id: 60, status: 'active', average_score: 93.1 },
    { id: 1035, national_id: '852369741', full_name: 'Javier David Castro', email: 'javier.castro@email.com', phone: '3405678904', clan_id: 60, status: 'active', average_score: 89.8 },
    { id: 1036, national_id: '369741852', full_name: 'Sandra Milena Vargas', email: 'sandra.vargas@email.com', phone: '3506789015', clan_id: 60, status: 'active', average_score: 86.6 },
    { id: 1037, national_id: '741852963', full_name: 'Daniel Jose Ruiz', email: 'daniel.ruiz@email.com', phone: '3607890126', clan_id: 60, status: 'active', average_score: 91.5 },
    { id: 1038, national_id: '258147369', full_name: 'Maria Lucia Silva', email: 'maria.silva@email.com', phone: '3708901237', clan_id: 60, status: 'completed', average_score: 95.2 },
    { id: 1039, national_id: '147369258', full_name: 'Andres Mauricio Ramirez', email: 'andres.ramirez@email.com', phone: '3809012348', clan_id: 60, status: 'active', average_score: 88.4 },
    { id: 1040, national_id: '369258147', full_name: 'Laura Daniela Mendoza', email: 'laura.mendoza@email.com', phone: '3900123459', clan_id: 60, status: 'active', average_score: 92.8 }
  ],
  interventions: [
    { couder_id: 1001, user_id: 1, intervention_type_id: 1, notes: 'Evaluación inicial del aprendiz. Muestra buena actitud y disposición para aprender. Necesita apoyo en matemáticas básicas.', session_date: '2024-01-15', session_time: '09:00' },
    { couder_id: 1001, user_id: 2, intervention_type_id: 2, notes: 'Seguimiento: Ha mejorado significativamente en matemáticas. Participa activamente en clase. Recomiendo reforzamiento en comunicación.', session_date: '2024-01-22', session_time: '10:30' },
    { couder_id: 1001, user_id: 2, intervention_type_id: 2, notes: 'Seguimiento: Sigue con buen progreso. Presenta algunas dificultades en trabajo en equipo. Se trabajará en habilidades sociales.', session_date: '2024-01-29', session_time: '14:00' },
    { couder_id: 1002, user_id: 1, intervention_type_id: 1, notes: 'Evaluación inicial: Aprendiz con potencial alto. Requiere atención especial en lectura comprensiva. Buen comportamiento general.', session_date: '2024-01-16', session_time: '11:00' },
    { couder_id: 1002, user_id: 2, intervention_type_id: 2, notes: 'Seguimiento: Ha mostrado mejora notable en lectura. Participa más en actividades grupales. Continuar con apoyo actual.', session_date: '2024-01-23', session_time: '15:30' },
    { couder_id: 1003, user_id: 1, intervention_type_id: 1, notes: 'Evaluación inicial: Capacidades sobresalientes en lógica. Presenta resistencia a seguir instrucciones. Necesita trabajo en disciplina.', session_date: '2024-01-17', session_time: '08:30' },
    { couder_id: 1004, user_id: 1, intervention_type_id: 1, notes: 'Evaluación inicial: Excelente desempeño en áreas técnicas. Timidez en presentaciones orales. Fomentar participación.', session_date: '2024-01-18', session_time: '09:30' },
    { couder_id: 1005, user_id: 1, intervention_type_id: 1, notes: 'Evaluación inicial: Muy buen rendimiento académico. Lidera grupos de trabajo. Potencial para rol de liderazgo.', session_date: '2024-01-19', session_time: '10:00' },
    { couder_id: 1006, user_id: 1, intervention_type_id: 1, notes: 'Evaluación inicial: Creatividad destacada. Dificultades en organización del tiempo. Implementar técnicas de estudio.', session_date: '2024-01-20', session_time: '11:30' },
    { couder_id: 1007, user_id: 1, intervention_type_id: 1, notes: 'Evaluación inicial: Buen dominio de conceptos básicos. Necesita practicar más resolución de problemas.', session_date: '2024-01-21', session_time: '13:00' }
  ],
  ai_analyses: [
    {
      couder_id: 1001,
      period_label: '2024-Q1',
      summary: 'Juan muestra progreso académico constante con mejoras significativas en matemáticas y participación. Ha desarrollado habilidades sociales aunque necesita refuerzo en trabajo en equipo.',
      diagnosis: 'Aprendiz con alto potencial y buena actitud. Presenta fortalezas en áreas técnicas y capacidad de liderazgo emergente. Requiere apoyo continuo en matemáticas y desarrollo de habilidades sociales.',
      suggestions: JSON.stringify(["Continuar con tutoría de matemáticas", "Fomentar participación en proyectos grupales", "Desarrollar actividades de integración social", "Mantener apoyo actual en comunicación", "Considerar programa de liderazgo juvenil"])
    },
    {
      couder_id: 1002,
      period_label: '2024-Q1',
      summary: 'María ha mejorado notablemente en lectura comprensiva y participación grupal. Mantiene buen rendimiento académico general.',
      diagnosis: 'Estudiante con excelente potencial y actitud positiva. Demuestra capacidad de adaptación y mejora continua. Fortalezas en áreas técnicas y buena disposición para aprender.',
      suggestions: JSON.stringify(["Reforzar técnicas de estudio avanzadas", "Participar en club de lectura", "Continuar con apoyo actual", "Explorar programas de enriquecimiento", "Mantener hábitos de estudio actuales"])
    }
  ]
};

class AutoMigrationService {
  constructor(pool) {
    this.pool = pool;
    this.results = {
      users: { inserted: 0, errors: [] },
      couders: { inserted: 0, errors: [] },
      interventions: { inserted: 0, errors: [] },
      ai_analyses: { inserted: 0, errors: [] }
    };
  }

  async migrateAll() {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      console.log(' Iniciando migración automática de datos...');
      
      // 1. Migrar usuarios
      await this.migrateUsers(client);
      
      // 2. Migrar couders
      await this.migrateCouders(client);
      
      // 3. Migrar intervenciones
      await this.migrateInterventions(client);
      
      // 4. Migrar análisis de IA
      await this.migrateAiAnalyses(client);
      
      await client.query('COMMIT');
      
      console.log(' Migración completada exitosamente');
      return {
        success: true,
        results: this.results,
        summary: this.generateSummary()
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(' Error en migración:', error.message);
      return {
        success: false,
        error: error.message,
        results: this.results
      };
    } finally {
      client.release();
    }
  }

  async migrateUsers(client) {
    console.log(' Migrando usuarios...');
    
    for (const user of MIGRATION_DATA.users) {
      try {
        const passwordHash = await bcrypt.hash(user.password, SALT_ROUNDS);
        
        await client.query(
          `INSERT INTO users (id, full_name, email, password_hash, role_id, is_active, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())
           ON CONFLICT (id) DO UPDATE SET
           full_name = EXCLUDED.full_name,
           email = EXCLUDED.email,
           password_hash = EXCLUDED.password_hash,
           role_id = EXCLUDED.role_id,
           is_active = EXCLUDED.is_active
           RETURNING id`,
          [user.id, user.full_name, user.email, passwordHash, user.role_id, user.is_active]
        );
        
        this.results.users.inserted++;
      } catch (error) {
        this.results.users.errors.push({ user: user.email, error: error.message });
      }
    }
    
    console.log(` Usuarios migrados: ${this.results.users.inserted}`);
  }

  async migrateCouders(client) {
    console.log(' Migrando couders...');
    
    for (const couder of MIGRATION_DATA.couders) {
      try {
        await client.query(
          `INSERT INTO couders (id, national_id, full_name, email, phone, clan_id, status, average_score, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
           ON CONFLICT (id) DO UPDATE SET
           national_id = EXCLUDED.national_id,
           full_name = EXCLUDED.full_name,
           email = EXCLUDED.email,
           phone = EXCLUDED.phone,
           clan_id = EXCLUDED.clan_id,
           status = EXCLUDED.status,
           average_score = EXCLUDED.average_score
           RETURNING id`,
          [couder.id, couder.national_id, couder.full_name, couder.email, couder.phone, couder.clan_id, couder.status, couder.average_score]
        );
        
        this.results.couders.inserted++;
      } catch (error) {
        this.results.couders.errors.push({ couder: couder.national_id, error: error.message });
      }
    }
    
    console.log(` Couders migrados: ${this.results.couders.inserted}`);
  }

  async migrateInterventions(client) {
    console.log(' Migrando intervenciones...');
    
    for (const intervention of MIGRATION_DATA.interventions) {
      try {
        await client.query(
          `INSERT INTO interventions (couder_id, user_id, intervention_type_id, notes, session_date, session_time, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())
           ON CONFLICT DO NOTHING
           RETURNING id`,
          [intervention.couder_id, intervention.user_id, intervention.intervention_type_id, intervention.notes, intervention.session_date, intervention.session_time]
        );
        
        this.results.interventions.inserted++;
      } catch (error) {
        this.results.interventions.errors.push({ intervention: intervention.couder_id, error: error.message });
      }
    }
    
    console.log(` Intervenciones migradas: ${this.results.interventions.inserted}`);
  }

  async migrateAiAnalyses(client) {
    console.log(' Migrando análisis de IA...');
    
    for (const analysis of MIGRATION_DATA.ai_analyses) {
      try {
        await client.query(
          `INSERT INTO ai_analyses (couder_id, period_label, summary, diagnosis, suggestions, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())
           ON CONFLICT DO NOTHING
           RETURNING id`,
          [analysis.couder_id, analysis.period_label, analysis.summary, analysis.diagnosis, analysis.suggestions]
        );
        
        this.results.ai_analyses.inserted++;
      } catch (error) {
        this.results.ai_analyses.errors.push({ analysis: analysis.couder_id, error: error.message });
      }
    }
    
    console.log(` Análisis de IA migrados: ${this.results.ai_analyses.inserted}`);
  }

  generateSummary() {
    const totalInserted = 
      this.results.users.inserted +
      this.results.couders.inserted +
      this.results.interventions.inserted +
      this.results.ai_analyses.inserted;
    
    const totalErrors = 
      this.results.users.errors.length +
      this.results.couders.errors.length +
      this.results.interventions.errors.length +
      this.results.ai_analyses.errors.length;
    
    return {
      totalInserted,
      totalErrors,
      details: {
        users: this.results.users.inserted,
        couders: this.results.couders.inserted,
        interventions: this.results.interventions.inserted,
        ai_analyses: this.results.ai_analyses.inserted
      }
    };
  }
}

module.exports = AutoMigrationService;
