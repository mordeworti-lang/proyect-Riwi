# DataCore - Mapa Completo de Base de Datos

**Esquema Relacional PostgreSQL 3NF con Detalles Técnicos**

---

## INDICE

1. [Visión General](#1-visión-general)
2. [Diagrama Entidad-Relación](#2-diagrama-entidad-relación)
3. [Tablas Detalladas](#3-tablas-detalles)
4. [Relaciones y Claves Foráneas](#4-relaciones-y-claves-foráneas)
5. [Índices y Optimización](#5-índices-y-optimización)
6. [Restricciones y Validaciones](#6-restricciones-y-validaciones)
7. [Consultas SQL Útiles](#7-consultas-sql-útiles)
8. [Migraciones y Versiones](#8-migraciones-y-versiones)

---

## 1. VISION GENERAL

### Principios de Diseño
- **Normalización 3NF**: Eliminación de redundancia y anomalías
- **Integridad Referencial**: Todas las relaciones con FKs y restricciones
- **Escalabilidad Horizontal**: Índices optimizados para consultas frecuentes
- **Auditoría Completa**: Timestamps en todas las tablas principales

### Estructura Jerárquica
```
Sedes (2) → Cohorts (7) → Clans (35) → Couders (N)
Users (Interventores) → Interventions → AI_Analyses
```

---

## 2. DIAGRAMA ENTIDAD-RELACION

### Representación Visual
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           DATACORE - CLINICAL SYSTEM                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐                 │
│  │  ROLES  │    │  USERS   │    │SEDES     │    │ ROUTES   │                 │
│  ├─────────┤    ├──────────┤    ├──────────┤    ├──────────┤                 │
│  │id PK    │    │id PK     │    │id PK     │    │id PK     │                 │
│  │name     │    │full_name │    │name      │    │name      │                 │
│  └─────────┘    │email     │    └──────────┘    └──────────┘                 │
│         │        │password │           │              │                      │
│         │        │role_id FK│           │              │                      │
│         │        └──────────┘           │              │                      │
│         │               │              │              │                      │
│         │               │              │              │                      │
│         │        ┌──────────┐    ┌──────────┐    ┌──────────┐                 │
│         │        │INTERVENTI│    │COHORTS   │    │INTERVENTI│                 │
│         │        │ON_TYPES  │    ├──────────┤    │ON_TYPES  │                 │
│         │        ├──────────┤    │id PK     │    ├──────────┤                 │
│         │        │id PK     │    │name      │    │id PK     │                 │
│         │        │name     │    │sede_id FK│    │name     │                 │
│         │        └──────────┘    │route_id FK│    └──────────┘                 │
│         │               │    │is_active │              │                      │
│         │               │    └──────────┘              │                      │
│         │               │           │                   │                      │
│         │               │           ▼                   ▼                      │
│         │               │    ┌──────────┐    ┌──────────┐                 │
│         │               │    │  CLANS   │    │   ROLES  │                 │
│         │               │    ├──────────┤    ├──────────┤                 │
│         │               │    │id PK     │    │id PK     │                 │
│         │               │    │name      │    │name     │                 │
│         │               │    │cohort_id  │    └──────────┘                 │
│         │               │    │shift     │              │                      │
│         │               │    │tl_name   │              │                      │
│         │               │    └──────────┘              │                      │
│         │               │           │                   │                      │
│         │               │           ▼                   ▼                      │
│         │               │    ┌──────────┐    ┌──────────┐                 │
│         │               │    │ COUDERS  │    │  USERS   │                 │
│         │               │    ├──────────┤    ├──────────┤                 │
│         │               │    │id PK     │    │id PK     │                 │
│         │               │    │national_│    │full_name │                 │
│         │               │    │id       │    │email     │                 │
│         │               │    │full_name│    │password │                 │
│         │               │    │clan_id FK│    │role_id FK│                 │
│         │               │    │status   │    └──────────┘                 │
│         │               │    │avg_score│              │                      │
│         │               │    └──────────┘              │                      │
│         │               │           │                   │                      │
│         │               │           ▼                   ▼                      │
│         │               │    ┌──────────┐    ┌──────────┐                 │
│         │               │    │INTERVENTI│    │INTERVENTI│                 │
│         │               │    │ONS       │    │IONS      │                 │
│         │               │    ├──────────┤    ├──────────┤                 │
│         │               │    │id PK     │    │id PK     │                 │
│         │               │    │couder_id │    │couder_id │                 │
│         │               │    │user_id   │    │user_id   │                 │
│         │               │    │type_id FK│    │type_id FK│                 │
│         │               │    │notes     │    │notes     │                 │
│         │               │    │date      │    │date      │                 │
│         │               │    │time      │    │time      │                 │
│         │               │    └──────────┘    └──────────┘                 │
│         │               │           │                   │                      │
│         │               │           ▼                   ▼                      │
│         │               │    ┌──────────┐    ┌──────────┐                 │
│         │               │    │AI_ANALYS │    │AI_ANALYS │                 │
│         │               │    │ES        │    │ES        │                 │
│         │               │    ├──────────┤    ├──────────┤                 │
│         │               │    │id PK     │    │id PK     │                 │
│         │               │    │couder_id │    │couder_id │                 │
│         │               │    │period    │    │period    │                 │
│         │               │    │summary   │    │summary   │                 │
│         │               │    │diagnosis │    │diagnosis │                 │
│         │               │    │suggest   │    │suggest   │                 │
│         │               │    └──────────┘    └──────────┘                 │
│         └─────────────────────────────────────────────────────────────────────┘
```

---

## 3. TABLAS DETALLADAS

### 3.1 Tablas de Lookup (Datos Maestros)

#### roles
**Propósito**: Definición de roles del sistema
```sql
CREATE TABLE roles (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE   -- 'admin', 'lider', 'mentor', 'interventor'
);
```

| Columna | Tipo | Restricciones | Descripción | Valores |
|---------|------|---------------|-------------|---------|
| id | SERIAL | PRIMARY KEY | Identificador único | Auto-incremental |
| name | VARCHAR(50) | NOT NULL, UNIQUE | Nombre del rol | admin, lider, mentor, interventor |

**Datos Iniciales**:
```sql
INSERT INTO roles(name) VALUES 
('admin'), ('lider'), ('mentor'), ('interventor');
```

---

#### sedes
**Propósito**: Ubicaciones geográficas del programa
```sql
CREATE TABLE sedes (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE   -- 'Medellín', 'Barranquilla'
);
```

| Columna | Tipo | Restricciones | Descripción | Valores |
|---------|------|---------------|-------------|---------|
| id | SERIAL | PRIMARY KEY | Identificador único | Auto-incremental |
| name | VARCHAR(100) | NOT NULL, UNIQUE | Nombre de la sede | Medellín, Barranquilla |

**Datos Iniciales**:
```sql
INSERT INTO sedes(name) VALUES ('Medellín'), ('Barranquilla');
```

---

#### routes
**Propósito**: Tipos de rutas formativas
```sql
CREATE TABLE routes (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE    -- 'basica', 'avanzada'
);
```

| Columna | Tipo | Restricciones | Descripción | Valores |
|---------|------|---------------|-------------|---------|
| id | SERIAL | PRIMARY KEY | Identificador único | Auto-incremental |
| name | VARCHAR(50) | NOT NULL, UNIQUE | Nombre de la ruta | basica, avanzada |

**Datos Iniciales**:
```sql
INSERT INTO routes(name) VALUES ('basica'), ('avanzada');
```

---

#### intervention_types
**Propósito**: Clasificación de intervenciones clínicas
```sql
CREATE TABLE intervention_types (
    id    SERIAL PRIMARY KEY,
    name  VARCHAR(100) NOT NULL UNIQUE
);
```

| Columna | Tipo | Restricciones | Descripción | Valores |
|---------|------|---------------|-------------|---------|
| id | SERIAL | PRIMARY KEY | Identificador único | Auto-incremental |
| name | VARCHAR(100) | NOT NULL, UNIQUE | Tipo de intervención | initial_evaluation, follow_up, risk_assessment, closing, other |

**Datos Iniciales**:
```sql
INSERT INTO intervention_types(name) VALUES 
('initial_evaluation'), ('follow_up'), ('risk_assessment'), ('closing'), ('other');
```

---

### 3.2 Tablas de Estructura Organizacional

#### cohorts
**Propósito**: Cortes formativos por sede y ruta
```sql
CREATE TABLE cohorts (
    id          SERIAL  PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    sede_id     INT NOT NULL REFERENCES sedes(id) ON DELETE RESTRICT,
    route_id    INT NOT NULL REFERENCES routes(id) ON DELETE RESTRICT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

| Columna | Tipo | Restricciones | FK | Descripción |
|---------|------|---------------|----|-------------|
| id | SERIAL | PRIMARY KEY | - | Identificador único |
| name | VARCHAR(100) | NOT NULL | - | Nombre del cohort |
| sede_id | INT | NOT NULL, FK | sedes.id | Sede asignada |
| route_id | INT | NOT NULL, FK | routes.id | Ruta formativa |
| is_active | BOOLEAN | NOT NULL | - | Estado del cohort |
| created_at | TIMESTAMPTZ | NOT NULL | - | Fecha de creación |

**Relaciones**:
- `sede_id` → `sedes(id)` (ON DELETE RESTRICT)
- `route_id` → `routes(id)` (ON DELETE RESTRICT)

---

#### clans
**Propósito**: Grupos dentro de cada cohort
```sql
CREATE TABLE clans (
    id          SERIAL  PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    cohort_id   INT NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
    shift       VARCHAR(10) NOT NULL CHECK (shift IN ('morning', 'afternoon')),
    tl_name     VARCHAR(150),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

| Columna | Tipo | Restricciones | FK | Descripción |
|---------|------|---------------|----|-------------|
| id | SERIAL | PRIMARY KEY | - | Identificador único |
| name | VARCHAR(100) | NOT NULL | - | Nombre del clan |
| cohort_id | INT | NOT NULL, FK | cohorts.id | Cohort padre |
| shift | VARCHAR(10) | NOT NULL, CHECK | - | Turno (morning/afternoon) |
| tl_name | VARCHAR(150) | NULL | - | Nombre del Team Leader |
| created_at | TIMESTAMPTZ | NOT NULL | - | Fecha de creación |

**Relaciones**:
- `cohort_id` → `cohorts(id)` (ON DELETE CASCADE)

**Restricciones CHECK**:
- `shift IN ('morning', 'afternoon')`

---

### 3.3 Tablas de Usuarios y Perfiles

#### users
**Propósito**: Interventores y staff del sistema
```sql
CREATE TABLE users (
    id            SERIAL  PRIMARY KEY,
    full_name     VARCHAR(150) NOT NULL,
    email         VARCHAR(200) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id       INT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

| Columna | Tipo | Restricciones | FK | Descripción |
|---------|------|---------------|----|-------------|
| id | SERIAL | PRIMARY KEY | - | Identificador único |
| full_name | VARCHAR(150) | NOT NULL | - | Nombre completo |
| email | VARCHAR(200) | NOT NULL, UNIQUE | - | Email único |
| password_hash | VARCHAR(255) | NOT NULL | - | Hash bcryptjs |
| role_id | INT | NOT NULL, FK | roles.id | Rol del usuario |
| is_active | BOOLEAN | NOT NULL | - | Estado del usuario |
| created_at | TIMESTAMPTZ | NOT NULL | - | Fecha de creación |

**Relaciones**:
- `role_id` → `roles(id)` (ON DELETE RESTRICT)

**Seguridad**:
- `password_hash`: Almacenado con bcryptjs (12 rounds)
- `email`: Único en toda la tabla

---

#### couders
**Propósito**: Aprendices/participantes del programa
```sql
CREATE TABLE couders (
    id              SERIAL  PRIMARY KEY,
    national_id     VARCHAR(30) NOT NULL UNIQUE,   -- Cédula
    full_name       VARCHAR(150) NOT NULL,
    email           VARCHAR(200),
    phone           VARCHAR(30),
    clan_id         INT NOT NULL REFERENCES clans(id) ON DELETE RESTRICT,
    status          VARCHAR(20) NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'withdrawn', 'completed')),
    average_score   NUMERIC(4,2),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

| Columna | Tipo | Restricciones | FK | Descripción |
|---------|------|---------------|----|-------------|
| id | SERIAL | PRIMARY KEY | - | Identificador único |
| national_id | VARCHAR(30) | NOT NULL, UNIQUE | - | Cédula única |
| full_name | VARCHAR(150) | NOT NULL | - | Nombre completo |
| email | VARCHAR(200) | NULL | - | Email personal |
| phone | VARCHAR(30) | NULL | - | Teléfono |
| clan_id | INT | NOT NULL, FK | clans.id | Clan asignado |
| status | VARCHAR(20) | NOT NULL, CHECK | - | Estado del couder |
| average_score | NUMERIC(4,2) | NULL | - | Promedio académico |
| created_at | TIMESTAMPTZ | NOT NULL | - | Fecha de creación |

**Relaciones**:
- `clan_id` → `clans(id)` (ON DELETE RESTRICT)

**Restricciones CHECK**:
- `status IN ('active', 'withdrawn', 'completed')`

**Índices Únicos**:
- `national_id`: Identificación única nacional

---

### 3.4 Tablas de Intervenciones y Análisis

#### interventions
**Propósito**: Registro de intervenciones clínicas
```sql
CREATE TABLE interventions (
    id                  SERIAL  PRIMARY KEY,
    couder_id           INT NOT NULL REFERENCES couders(id) ON DELETE CASCADE,
    user_id             INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    intervention_type_id INT NOT NULL REFERENCES intervention_types(id) ON DELETE RESTRICT,
    notes               TEXT NOT NULL,
    session_date        DATE NOT NULL,
    session_time        TIME NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

| Columna | Tipo | Restricciones | FK | Descripción |
|---------|------|---------------|----|-------------|
| id | SERIAL | PRIMARY KEY | - | Identificador único |
| couder_id | INT | NOT NULL, FK | couders.id | Couder intervenido |
| user_id | INT | NOT NULL, FK | users.id | Interventor |
| intervention_type_id | INT | NOT NULL, FK | intervention_types.id | Tipo de intervención |
| notes | TEXT | NOT NULL | - | Notas clínicas |
| session_date | DATE | NOT NULL | - | Fecha de sesión |
| session_time | TIME | NOT NULL | - | Hora de sesión |
| created_at | TIMESTAMPTZ | NOT NULL | - | Fecha de creación |

**Relaciones**:
- `couder_id` → `couders(id)` (ON DELETE CASCADE)
- `user_id` → `users(id)` (ON DELETE RESTRICT)
- `intervention_type_id` → `intervention_types(id)` (ON DELETE RESTRICT)

---

#### ai_analyses
**Propósito**: Análisis generados por IA
```sql
CREATE TABLE ai_analyses (
    id              SERIAL  PRIMARY KEY,
    couder_id       INT NOT NULL REFERENCES couders(id) ON DELETE CASCADE,
    period_label    VARCHAR(100),           -- e.g. 'all', '2024-Q1'
    summary         TEXT NOT NULL,
    diagnosis       TEXT NOT NULL,
    suggestions     TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

| Columna | Tipo | Restricciones | FK | Descripción |
|---------|------|---------------|----|-------------|
| id | SERIAL | PRIMARY KEY | - | Identificador único |
| couder_id | INT | NOT NULL, FK | couders.id | Couder analizado |
| period_label | VARCHAR(100) | NULL | - | Etiqueta del período |
| summary | TEXT | NOT NULL | - | Resumen del análisis |
| diagnosis | TEXT | NOT NULL | - | Diagnóstico |
| suggestions | TEXT | NOT NULL | - | Sugerencias |
| created_at | TIMESTAMPTZ | NOT NULL | - | Fecha de creación |

**Relaciones**:
- `couder_id` → `couders(id)` (ON DELETE CASCADE)

---

## 4. RELACIONES Y CLAVES FORÁNEAS

### 4.1 Mapa de Relaciones
```
sedes (1) ←→ (N) cohorts (1) ←→ (N) clans (1) ←→ (N) couders
  │              │              │              │
  │              │              │              └── (1) ←→ (N) interventions
  │              │              │              └── (1) ←→ (N) ai_analyses
  │              │              │
  │              │              └── (1) ←→ (N) couders
  │              │
  │              └── (1) ←→ (N) clans
  │
  └── (1) ←→ (N) cohorts

routes (1) ←→ (N) cohorts

roles (1) ←→ (N) users
  │
  └── (1) ←→ (N) users

intervention_types (1) ←→ (N) interventions

users (1) ←→ (N) interventions
```

### 4.2 Políticas de Eliminación
| Tabla | FK Referenciada | Política DELETE | Razón |
|-------|----------------|-----------------|-------|
| cohorts.sede_id | sedes.id | RESTRICT | Proteger cohorts al eliminar sede |
| cohorts.route_id | routes.id | RESTRICT | Proteger cohorts al eliminar ruta |
| clans.cohort_id | cohorts.id | CASCADE | Eliminar clans si se elimina cohort |
| couders.clan_id | clans.id | RESTRICT | Proteger couders al eliminar clan |
| users.role_id | roles.id | RESTRICT | Proteger usuarios al eliminar rol |
| interventions.couder_id | couders.id | CASCADE | Eliminar intervenciones si se elimina couder |
| interventions.user_id | users.id | RESTRICT | Proteger intervenciones al eliminar usuario |
| interventions.intervention_type_id | intervention_types.id | RESTRICT | Proteger intervenciones al eliminar tipo |
| ai_analyses.couder_id | couders.id | CASCADE | Eliminar análisis si se elimina couder |

---

## 5. ÍNDICES Y OPTIMIZACIÓN

### 5.1 Índices Primarios (Automáticos)
```sql
-- Índices de PK (creados automáticamente)
CREATE INDEX pk_roles ON roles(id);
CREATE INDEX pk_sedes ON sedes(id);
CREATE INDEX pk_routes ON routes(id);
CREATE INDEX pk_cohorts ON cohorts(id);
CREATE INDEX pk_clans ON clans(id);
CREATE INDEX pk_users ON users(id);
CREATE INDEX pk_couders ON couders(id);
CREATE INDEX pk_intervention_types ON intervention_types(id);
CREATE INDEX pk_interventions ON interventions(id);
CREATE INDEX pk_ai_analyses ON ai_analyses(id);
```

### 5.2 Índices Optimizados (Manuales)
```sql
-- Índices para búsquedas frecuentes
CREATE INDEX idx_couders_national_id   ON couders(national_id);     -- Búsqueda por CC
CREATE INDEX idx_couders_clan_id       ON couders(clan_id);         -- Listar por clan
CREATE INDEX idx_couders_status        ON couders(status);          -- Filtrar por estado
CREATE INDEX idx_interventions_couder  ON interventions(couder_id); -- Historial del couder
CREATE INDEX idx_interventions_user    ON interventions(user_id);    -- Intervenciones por usuario
CREATE INDEX idx_interventions_date    ON interventions(session_date); -- Por fecha
CREATE INDEX idx_clans_cohort          ON clans(cohort_id);         -- Clans por cohort
CREATE INDEX idx_cohorts_sede          ON cohorts(sede_id);         -- Cohorts por sede
CREATE INDEX idx_ai_analyses_couder    ON ai_analyses(couder_id);  -- Análisis por couder
CREATE INDEX idx_users_email           ON users(email);             -- Login por email
CREATE INDEX idx_interventions_type    ON interventions(intervention_type_id); -- Por tipo
```

### 5.3 Índices Compuestos (Para consultas complejas)
```sql
-- Para dashboard de cohortes
CREATE INDEX idx_cohorts_sede_active ON cohorts(sede_id, is_active);

-- Para historial de intervenciones ordenado
CREATE INDEX idx_interventions_couder_date ON interventions(couder_id, session_date DESC);

-- Para análisis de IA por período
CREATE INDEX idx_ai_analyses_couder_created ON ai_analyses(couder_id, created_at DESC);
```

---

## 6. RESTRICCIONES Y VALIDACIONES

### 6.1 Restricciones CHECK
```sql
-- Restricción de turnos en clans
ALTER TABLE clans ADD CONSTRAINT chk_shift 
    CHECK (shift IN ('morning', 'afternoon'));

-- Restricción de estados en couders
ALTER TABLE couders ADD CONSTRAINT chk_status 
    CHECK (status IN ('active', 'withdrawn', 'completed'));

-- Restricción de promedio en couders
ALTER TABLE couders ADD CONSTRAINT chk_average_score 
    CHECK (average_score >= 0.0 AND average_score <= 5.0);
```

### 6.2 Restricciones UNIQUE
```sql
-- Email único en users
ALTER TABLE users ADD CONSTRAINT uniq_email UNIQUE (email);

-- Cédula única en couders
ALTER TABLE couders ADD CONSTRAINT uniq_national_id UNIQUE (national_id);

-- Nombre único en sedes
ALTER TABLE sedes ADD CONSTRAINT uniq_sede_name UNIQUE (name);

-- Nombre único en roles
ALTER TABLE roles ADD CONSTRAINT uniq_role_name UNIQUE (name);
```

### 6.3 Triggers (Opcional)
```sql
-- Trigger para actualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para log de cambios en couders
CREATE OR REPLACE FUNCTION log_couder_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO couder_audit_log(couder_id, old_status, new_status, changed_by, changed_at)
        VALUES (NEW.id, OLD.status, NEW.status, current_user, NOW());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';
```

---

## 7. CONSULTAS SQL ÚTILES

### 7.1 Consultas de Dashboard
```sql
-- Métricas globales por sede
SELECT 
    s.name as sede_name,
    COUNT(DISTINCT c.id) as total_cohorts,
    COUNT(DISTINCT cl.id) as total_clans,
    COUNT(DISTINCT co.id) as total_couders,
    COUNT(DISTINCT CASE WHEN co.status = 'active' THEN co.id END) as active_couders,
    COUNT(DISTINCT CASE WHEN co.status = 'withdrawn' THEN co.id END) as withdrawn_couders,
    COUNT(DISTINCT CASE WHEN co.status = 'completed' THEN co.id END) as completed_couders,
    ROUND(AVG(co.average_score), 2) as avg_score
FROM sedes s
LEFT JOIN cohorts c ON s.id = c.sede_id AND c.is_active = true
LEFT JOIN clans cl ON c.id = cl.cohort_id
LEFT JOIN couders co ON cl.id = co.clan_id
GROUP BY s.id, s.name
ORDER BY s.name;

-- Intervenciones por período
SELECT 
    DATE_TRUNC('month', i.session_date) as month,
    COUNT(i.id) as total_interventions,
    COUNT(DISTINCT i.couder_id) as unique_couders,
    COUNT(DISTINCT i.user_id) as unique_interventors
FROM interventions i
WHERE i.session_date >= NOW() - INTERVAL '6 months'
GROUP BY DATE_TRUNC('month', i.session_date)
ORDER BY month DESC;
```

### 7.2 Consultas de Análisis
```sql
-- Couders con más intervenciones
SELECT 
    co.full_name,
    co.national_id,
    cl.name as clan_name,
    c.name as cohort_name,
    s.name as sede_name,
    COUNT(i.id) as intervention_count,
    MAX(i.session_date) as last_intervention
FROM couders co
JOIN clans cl ON co.clan_id = cl.id
JOIN cohorts c ON cl.cohort_id = c.id
JOIN sedes s ON c.sede_id = s.id
LEFT JOIN interventions i ON co.id = i.couder_id
GROUP BY co.id, co.full_name, co.national_id, cl.name, c.name, s.name
ORDER BY intervention_count DESC
LIMIT 10;

-- Interventores más activos
SELECT 
    u.full_name,
    u.email,
    COUNT(i.id) as total_interventions,
    COUNT(DISTINCT i.couder_id) as unique_couders,
    AVG(EXTRACT(EPOCH FROM (i.session_time)) / 3600) as avg_session_hour
FROM users u
JOIN interventions i ON u.id = i.user_id
WHERE u.role_id = (SELECT id FROM roles WHERE name = 'interventor')
GROUP BY u.id, u.full_name, u.email
ORDER BY total_interventions DESC;
```

### 7.3 Consultas de IA
```sql
-- Análisis recientes por couder
SELECT 
    co.full_name,
    aa.summary,
    aa.diagnosis,
    aa.suggestions,
    aa.created_at,
    COUNT(i.id) as interventions_since_analysis
FROM couders co
JOIN ai_analyses aa ON co.id = aa.couder_id
LEFT JOIN interventions i ON co.id = i.couder_id AND i.session_date > aa.created_at
GROUP BY co.id, co.full_name, aa.id, aa.summary, aa.diagnosis, aa.suggestions, aa.created_at
ORDER BY aa.created_at DESC;

-- Couders sin análisis reciente
SELECT 
    co.full_name,
    co.national_id,
    cl.name as clan_name,
    MAX(i.session_date) as last_intervention,
    MAX(aa.created_at) as last_analysis
FROM couders co
JOIN clans cl ON co.clan_id = cl.id
LEFT JOIN interventions i ON co.id = i.couder_id
LEFT JOIN ai_analyses aa ON co.id = aa.couder_id
WHERE aa.created_at IS NULL OR aa.created_at < NOW() - INTERVAL '30 days'
GROUP BY co.id, co.full_name, co.national_id, cl.name
HAVING COUNT(i.id) >= 3  -- Al menos 3 intervenciones
ORDER BY last_intervention DESC;
```

---

## 8. MIGRACIONES Y VERSIONES

### 8.1 Control de Versiones
```sql
-- Tabla de migraciones
CREATE TABLE schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Registro de migraciones aplicadas
INSERT INTO schema_migrations (version) VALUES 
('001_initial_schema'),
('002_add_indexes'),
('003_add_constraints'),
('004_add_audit_tables');
```

### 8.2 Script de Migración
```sql
-- migration_004_add_audit_tables.sql
CREATE TABLE couder_audit_log (
    id SERIAL PRIMARY KEY,
    couder_id INT NOT NULL REFERENCES couders(id),
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    changed_by VARCHAR(150),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_couder_audit_couder ON couder_audit_log(couder_id);
CREATE INDEX idx_couder_audit_date ON couder_audit_log(changed_at);

-- Registrar migración
INSERT INTO schema_migrations (version) VALUES ('004_add_audit_tables');
```

### 8.3 Validación de Schema
```sql
-- Función para validar integridad
CREATE OR REPLACE FUNCTION validate_schema()
RETURNS TABLE(table_name TEXT, issue TEXT) AS $$
BEGIN
    -- Verificar claves foráneas
    RETURN QUERY
    SELECT 'couders'::TEXT, 'Missing clan_id references'::TEXT
    FROM couders c
    LEFT JOIN clans cl ON c.clan_id = cl.id
    WHERE cl.id IS NULL
    LIMIT 1;
    
    -- Verificar unicidad
    RETURN QUERY
    SELECT 'users'::TEXT, 'Duplicate emails found'::TEXT
    FROM users
    GROUP BY email
    HAVING COUNT(*) > 1
    LIMIT 1;
    
    -- Más validaciones...
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- Ejecutar validación
SELECT * FROM validate_schema();
```

---

## ESTADISTICAS DE LA BASE DE DATOS

### Resumen de Tablas
| Tabla | Registros Estimados | Tamaño Promedio | Índices |
|-------|-------------------|------------------|---------|
| roles | 4 | 1 KB | 1 |
| sedes | 2 | 1 KB | 1 |
| routes | 2 | 1 KB | 1 |
| cohorts | 7 | 5 KB | 2 |
| clans | 35 | 10 KB | 2 |
| users | 26 | 50 KB | 2 |
| couders | 40+ | 100 KB | 4 |
| interventions | 45+ | 500 KB | 4 |
| ai_analyses | 4+ | 50 KB | 2 |
| intervention_types | 5 | 2 KB | 1 |

### Consultas Más Frecuentes
1. **Búsqueda de couders por CC** (idx_couders_national_id)
2. **Historial de intervenciones** (idx_interventions_couder_date)
3. **Dashboard por sede** (idx_cohorts_sede_active)
4. **Login de usuarios** (idx_users_email)
5. **Análisis de IA por couder** (idx_ai_analyses_couder_created)

---

**DataCore v1.0 - Base de Datos Optimizada y Escalable**

*Esquema actualizado: 2026-03-13*
