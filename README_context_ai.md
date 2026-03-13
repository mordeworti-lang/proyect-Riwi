# DataCore - Documentación Técnica Completa

**Sistema Clínico de Gestión de Intervenciones con IA**
**Fecha**: 2026-03-13  
**Versión**: 1.0  
**Estado**: 100% FUNCIONAL Y VERIFICADO

---

## INDICE

1. [Visión General](#1-visión-general)
2. [Arquitectura Técnica](#2-arquitectura-técnica)
3. [Base de Datos](#3-base-de-datos)
4. [API Endpoints](#4-api-endpoints)
5. [Integración IA](#5-integración-ia)
6. [Seguridad](#6-seguridad)
7. [Frontend](#7-frontend)
8. [Testing](#8-testing)
9. [Despliegue](#9-despliegue)
10. [Mantenimiento](#10-mantenimiento)

---

## 1. VISION GENERAL

### Propósito del Sistema
DataCore es un sistema clínico especializado diseñado **exclusivamente para interventores** que permite:
- Registro y seguimiento de intervenciones clínicas
- Gestión de aprendices (couders) en programa formativo
- Generación de análisis mediante IA (OpenAI gpt-3.5-turbo)
- Visualización de métricas organizacionales
- Búsqueda avanzada por número de cédula

### Estructura Organizacional
```
Sede (2: Medellín, Barranquilla)
└── Cohort/Corte (7 total: 4 Medellín, 3 Barranquilla)
    └── Clan (35 total: 5 por cohort)
        └── Couder (Aprendiz)
```

### Roles del Sistema
- **Solo existe el rol INTERVENTOR** (roleId = 1)
- No hay admin, mentor, ni leader roles
- Todos los usuarios tienen igual nivel de acceso

---

## 2. ARQUITECTURA TECNICA

### Stack Completo
| Capa | Tecnología | Versión | Propósito |
|------|------------|---------|----------|
| **Runtime** | Node.js | 18+ | Entorno de ejecución |
| **Servidor** | Express | 5.x | Framework web |
| **Base de Datos** | PostgreSQL | 14+ | Persistencia 3NF |
| **Autenticación** | JWT | - | Access + Refresh tokens |
| **Passwords** | bcryptjs | 2.4+ | Hash de contraseñas |
| **Frontend** | Vanilla JS | ES6+ | SPA sin frameworks |
| **CSS** | Tailwind CSS | 3.x | Estilos utilitarios |
| **IA** | OpenAI API | gpt-3.5-turbo | Análisis clínico |
| **Testing** | Jest | 29+ | Unit + Integration |

### Decisiones de Diseño Clave
- **bcryptjs** sobre bcrypt: Evita fallos nativos en Node 22
- **PostgreSQL exclusivo**: MongoDB eliminado completamente
- **OpenAI gpt-3.5-turbo**: Versión más económica del modelo
- **Single role**: Simplifica el modelo de autorización
- **Sin datos personales en prompts IA**: Protección de privacidad

### Estructura de Archivos
```
clinical-final/
├── __tests__/                  # Tests Jest
│   ├── setup.js               # Configuración de tests
│   └── *.test.js              # Suites de pruebas
├── data/
│   └── schema.sql              # DDL PostgreSQL
├── public/                     # Frontend SPA
│   ├── index.html
│   └── assets/
│       ├── css/main.css
│       └── js/
│           ├── api.js         # Cliente HTTP
│           ├── auth.js        # Gestión JWT
│           ├── router.js      # Navegación SPA
│           ├── main.js        # Entry point
│           └── views/          # Vistas modulares
├── scripts/                    # Utilidades
│   ├── migrate.js            # Migraciones DB
│   └── seed.js               # Datos demo
├── src/                        # Backend
│   ├── app.js                 # Config Express
│   ├── server.js              # Entry point
│   ├── config/                # Configuración
│   ├── controllers/           # Lógica de presentación
│   ├── middleware/            # Middleware Express
│   ├── repositories/          # Acceso a datos
│   ├── routes/                # Definición de rutas
│   ├── services/             # Lógica de negocio
│   └── utils/                 # Utilidades
└── .env                       # Variables de entorno
```

---

## 3. BASE DE DATOS

### Esquema Relacional (3NF)

#### Tablas Principales

**roles**
```sql
CREATE TABLE roles (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE   -- 'interventor'
);
```

**sedes**
```sql
CREATE TABLE sedes (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE   -- 'Medellín', 'Barranquilla'
);
```

**cohorts**
```sql
CREATE TABLE cohorts (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    sede_id     INT NOT NULL REFERENCES sedes(id),
    route_id    INT NOT NULL REFERENCES routes(id),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**clans**
```sql
CREATE TABLE clans (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    cohort_id   INT NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
    shift       VARCHAR(10) NOT NULL CHECK (shift IN ('morning', 'afternoon')),
    tl_name     VARCHAR(150),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**users**
```sql
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    full_name     VARCHAR(150) NOT NULL,
    email         VARCHAR(200) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id       INT NOT NULL REFERENCES roles(id),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**couders**
```sql
CREATE TABLE couders (
    id              SERIAL PRIMARY KEY,
    national_id     VARCHAR(30) NOT NULL UNIQUE,   -- Cédula
    full_name       VARCHAR(150) NOT NULL,
    email           VARCHAR(200),
    phone           VARCHAR(30),
    clan_id         INT NOT NULL REFERENCES clans(id),
    status          VARCHAR(20) NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'withdrawn', 'completed')),
    average_score   NUMERIC(4,2),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**interventions**
```sql
CREATE TABLE interventions (
    id                  SERIAL PRIMARY KEY,
    couder_id           INT NOT NULL REFERENCES couders(id) ON DELETE CASCADE,
    user_id             INT NOT NULL REFERENCES users(id),
    intervention_type_id INT NOT NULL REFERENCES intervention_types(id),
    notes               TEXT NOT NULL,
    session_date        DATE NOT NULL,
    session_time        TIME NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**ai_analyses**
```sql
CREATE TABLE ai_analyses (
    id              SERIAL PRIMARY KEY,
    couder_id       INT NOT NULL REFERENCES couders(id) ON DELETE CASCADE,
    period_label    VARCHAR(100),           -- e.g. 'all', '2024-Q1'
    summary         TEXT NOT NULL,
    diagnosis       TEXT NOT NULL,
    suggestions     TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Índices Optimizados
```sql
CREATE INDEX idx_couders_national_id   ON couders(national_id);
CREATE INDEX idx_couders_clan_id       ON couders(clan_id);
CREATE INDEX idx_interventions_couder  ON interventions(couder_id);
CREATE INDEX idx_interventions_user    ON interventions(user_id);
CREATE INDEX idx_interventions_date    ON interventions(session_date);
```

### Relaciones Entidad
```
sedes (1) ←→ (N) cohorts (1) ←→ (N) clans (1) ←→ (N) couders
users (1) ←→ (N) interventions (N) ←→ (1) couders
couders (1) ←→ (N) ai_analyses
roles (1) ←→ (N) users
```

---

## 4. API ENDPOINTS

### Autenticación
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Login con credenciales | No |
| POST | `/api/auth/refresh` | Renovar access token | Refresh token |
| POST | `/api/auth/register` | Registro nuevo interventor | No |

### Couders
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/api/couders/search?cc={cedula}` | Búsqueda por CC | Sí |
| GET | `/api/couders/{id}` | Detalle de couder | Sí |
| GET | `/api/couders/clan/{clanId}` | Listar por clan | Sí |
| POST | `/api/couders` | Crear nuevo couder | Sí |
| PUT | `/api/couders/{id}` | Actualizar couder | Sí |

### Intervenciones
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/api/couders/{id}/interventions` | Historial completo | Sí |
| POST | `/api/couders/{id}/interventions` | Crear intervención | Sí |
| PUT | `/api/interventions/{id}` | Actualizar intervención | Sí |
| DELETE | `/api/interventions/{id}` | Eliminar intervención | Sí |

### Análisis IA
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/api/couders/{id}/ai-analysis` | Listar análisis | Sí |
| POST | `/api/couders/{id}/ai-analysis` | Generar nuevo análisis | Sí |

### Dashboard
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/api/dashboard` | Métricas globales | Sí |
| GET | `/api/dashboard/sedes/{sedeId}` | Cohorts por sede | Sí |
| GET | `/api/dashboard/cohorts/{cohortId}` | Clans por cohort | Sí |
| GET | `/api/dashboard/clans/{clanId}` | Detalle clan | Sí |

### Health Check
| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/health` | Estado servidor | No |

---

## 5. INTEGRACION IA

### Configuración OpenAI
```javascript
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
```

### Prompt System
```javascript
const prompt = `Eres un experto en intervención clínica.
Analiza el siguiente historial de intervenciones y proporciona:

1. RESUMEN: Síntesis concisa (2-3 oraciones)
2. DIAGNÓSTICO: Evaluación actual (2-3 oraciones)
3. SUGERENCIAS: 3-5 recomendaciones específicas

Historial:
${interventions.map(iv => 
    `Fecha: ${iv.session_date} | Tipo: ${iv.type} | Notas: ${iv.notes}`
).join('\n')}

Responde sin emojis, en formato profesional.`;
```

### Respuesta Estructurada
```javascript
const response = {
    summary: "Resumen del progreso y patrones identificados",
    diagnosis: "Evaluación actual de la situación clínica",
    suggestions: [
        "Sugerencia específica 1",
        "Sugerencia específica 2",
        "Sugerencia específica 3"
    ]
};
```

### Seguridad en IA
- **Sin datos personales**: Nunca se envían nombres ni cédulas
- **Solo historial clínico**: Fechas, tipos, notas de intervenciones
- **API key segura**: Nunca expuesta al frontend
- **Logging completo**: Todas las llamadas registradas

---

## 6. SEGURIDAD

### Autenticación JWT
```javascript
// Access token: 15 minutos
const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
);

// Refresh token: 7 días
const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
);
```

### Headers de Seguridad
```javascript
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://cdn.tailwindcss.com"],
            connectSrc: ["'self'", "https://api.openai.com"],
        },
    },
}));
```

### Rate Limiting
```javascript
// General: 200 requests por 15 minutos
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: 'Too many requests'
});

// Auth: 10 requests por 15 minutos
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many auth attempts'
});
```

### Password Hashing
```javascript
const bcrypt = require('bcryptjs');
const saltRounds = 12;

const hashPassword = async (password) => {
    return await bcrypt.hash(password, saltRounds);
};
```

---

## 7. FRONTEND

### Arquitectura SPA
```javascript
// router.js - Sistema de rutas
const routes = {
    '': 'dashboard',
    'dashboard': 'dashboard',
    'search': 'search',
    'sede': 'sede',
    'cohort': 'cohort',
    'clan': 'clan',
    'couder': 'couder',
    'login': 'login'
};
```

### Gestión de Estado
```javascript
// Estado global por vista
const DashboardView = {
    _sedes: [],
    _globalStats: {},
    render: async () => { /* ... */ }
};

const CouderView = {
    _couder: null,
    _interventions: [],
    _aiAnalyses: [],
    _showAllAiAnalyses: false,
    _selectedAiAnalysisIndex: 0,
    render: async (id) => { /* ... */ }
};
```

### Event Listeners
```javascript
// Sistema de eventos unificado
function _setupEventListeners() {
    // Botones de acción
    const saveBtn = document.getElementById('btn-save-intervention');
    if (saveBtn) {
        saveBtn.addEventListener('click', _submitIntervention);
    }
    
    // Navegación
    const navButtons = document.querySelectorAll('nav button[onclick]');
    navButtons.forEach(btn => {
        btn.removeAttribute('onclick');
        btn.addEventListener('click', () => {
            const route = btn.dataset.route;
            Router.navigate(route);
        });
    });
}
```

### Tailwind CSS Configuration
```javascript
// tailwind.config.js
module.exports = {
    content: ["./public/**/*.{html,js}"],
    theme: {
        extend: {
            colors: {
                gray: {
                    800: '#1a1830',
                    700: '#2d2a4e',
                    600: '#3d3b65'
                }
            }
        }
    }
};
```

---

## 8. TESTING

### Suites de Pruebas
```bash
# Ejecutar todos los tests
npm test

# Coverage
npm run test:coverage

# Tests específicos
npm test -- --testNamePattern="Auth"
```

### Estructura de Tests
```javascript
// __tests__/auth.test.js
describe('Authentication', () => {
    test('should login with valid credentials', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'interventor@clinica.com',
                password: 'Interventor1234!'
            });
        
        expect(response.status).toBe(200);
        expect(response.body.data.accessToken).toBeDefined();
    });
});
```

### Mocks y Fixtures
```javascript
// __tests__/fixtures/users.js
export const mockUsers = [
    {
        id: 1,
        email: 'interventor@clinica.com',
        role: 'interventor'
    }
];

// __tests__/mocks/openai.js
jest.mock('openai', () => ({
    OpenAI: jest.fn().mockImplementation(() => ({
        chat: {
            completions: {
                create: jest.fn().mockResolvedValue({
                    choices: [{
                        message: {
                            content: JSON.stringify(mockAIResponse)
                        }
                    }]
                })
            }
        }
    }))
}));
```

---

## 9. DESPLIEGUE

### Variables de Entorno
```bash
# .env.production
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/clinical_system
JWT_SECRET=<64-character-secret>
JWT_REFRESH_SECRET=<64-character-secret>
OPENAI_API_KEY=<openai-key>
FRONTEND_URL=https://yourdomain.com
```

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/clinical_system
    depends_on:
      - db

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=clinical_system
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Proceso de Despliegue
```bash
# 1. Preparar base de datos
createdb clinical_system
psql -d clinical_system -f data/schema.sql
npm run seed

# 2. Construir y desplegar
docker-compose up -d

# 3. Verificar
curl https://yourdomain.com/health
```

---

## 10. MANTENIMIENTO

### Logs y Monitoreo
```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});
```

### Backups Automáticos
```bash
#!/bin/bash
# scripts/backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backups/clinical_system_$DATE.sql"

pg_dump -h localhost -U postgres clinical_system > $BACKUP_FILE

# Comprimir
gzip $BACKUP_FILE

# Liminar backups antiguos (más de 7 días)
find backups/ -name "*.sql.gz" -mtime +7 -delete
```

### Health Checks
```javascript
// health-check.js
const checkHealth = async () => {
    try {
        // Verificar base de datos
        await pool.query('SELECT 1');
        
        // Verificar API OpenAI
        await openai.models.list();
        
        // Verificar filesystem
        await fs.access('./public', fs.constants.R_OK);
        
        return { status: 'healthy', timestamp: new Date() };
    } catch (error) {
        return { status: 'unhealthy', error: error.message };
    }
};
```

### Actualizaciones
```bash
# Proceso de actualización segura
git pull origin main
npm ci
npm run migrate  # Migraciones pendientes
npm run test     # Verificar tests
pm2 reload app   # Reload sin downtime
```

---

## COMANDOS RAPIDOS

### Desarrollo
```bash
npm run dev          # Iniciar servidor desarrollo
npm test             # Ejecutar tests
npm run test:watch   # Tests en modo watch
npm run migrate      # Ejecutar migraciones
npm run seed         # Cargar datos demo
```

### Producción
```bash
npm start            # Iniciar servidor producción
npm run build        # Construir assets
npm run backup       # Backup base de datos
npm run restore      # Restaurar backup
```

### Verificación
```bash
curl http://localhost:3000/health
npm run verify       # Script completo de verificación
node scripts/check-deps.js  # Verificar dependencias
```

---

**DataCore v1.0 - Sistema Clínico Completo con IA Integrada**

*Documentación técnica actualizada: 2026-03-13*
