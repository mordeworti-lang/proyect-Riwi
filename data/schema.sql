-- ============================================================
-- Clinical Management System – PostgreSQL Schema (3NF)
-- ============================================================

-- 1. ROLES  (lookup)
CREATE TABLE IF NOT EXISTS roles (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE   -- 'interventor' (only role)
);

-- 2. SEDES  (locations)
CREATE TABLE IF NOT EXISTS sedes (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE
);

-- 3. ROUTES  (ruta: 'basica' | 'avanzada')
CREATE TABLE IF NOT EXISTS routes (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL UNIQUE
);

-- 4. COHORTS  (cortes)
CREATE TABLE IF NOT EXISTS cohorts (
    id          SERIAL  PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    sede_id     INT NOT NULL REFERENCES sedes(id)  ON DELETE RESTRICT,
    route_id    INT NOT NULL REFERENCES routes(id) ON DELETE RESTRICT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CLANS
CREATE TABLE IF NOT EXISTS clans (
    id          SERIAL  PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    cohort_id   INT NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
    shift       VARCHAR(10)  NOT NULL CHECK (shift IN ('morning', 'afternoon')),
    tl_name     VARCHAR(150),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. USERS  (staff: mentors / leaders / admins)
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL  PRIMARY KEY,
    full_name     VARCHAR(150) NOT NULL,
    email         VARCHAR(200) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id       INT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. COUDERS  (learners / participants)
CREATE TABLE IF NOT EXISTS couders (
    id              SERIAL  PRIMARY KEY,
    national_id     VARCHAR(30)  NOT NULL UNIQUE,   -- Cédula / CC
    full_name       VARCHAR(150) NOT NULL,
    email           VARCHAR(200),
    phone           VARCHAR(30),
    clan_id         INT NOT NULL REFERENCES clans(id) ON DELETE RESTRICT,
    status          VARCHAR(20) NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'withdrawn', 'completed')),
    average_score   NUMERIC(4,2),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. INTERVENTION_TYPES  (lookup: 'initial_evaluation', 'follow_up', 'closing', etc.)
CREATE TABLE IF NOT EXISTS intervention_types (
    id    SERIAL PRIMARY KEY,
    name  VARCHAR(100) NOT NULL UNIQUE
);

-- 9. INTERVENTIONS  (clinical notes by user for a couder)
CREATE TABLE IF NOT EXISTS interventions (
    id                  SERIAL  PRIMARY KEY,
    couder_id           INT NOT NULL REFERENCES couders(id) ON DELETE CASCADE,
    user_id             INT NOT NULL REFERENCES users(id)   ON DELETE RESTRICT,
    intervention_type_id INT NOT NULL REFERENCES intervention_types(id) ON DELETE RESTRICT,
    notes               TEXT NOT NULL,
    session_date        DATE        NOT NULL,
    session_time        TIME        NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. AI_ANALYSES  (stored AI results linked to an intervention set / couder)
CREATE TABLE IF NOT EXISTS ai_analyses (
    id              SERIAL  PRIMARY KEY,
    couder_id       INT NOT NULL REFERENCES couders(id) ON DELETE CASCADE,
    period_label    VARCHAR(100),           -- e.g. 'all', '2024-Q1'
    summary         TEXT NOT NULL,
    diagnosis       TEXT NOT NULL,
    suggestions     TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_couders_national_id   ON couders(national_id);
CREATE INDEX IF NOT EXISTS idx_couders_clan_id       ON couders(clan_id);
CREATE INDEX IF NOT EXISTS idx_couders_status        ON couders(status);
CREATE INDEX IF NOT EXISTS idx_interventions_couder  ON interventions(couder_id);
CREATE INDEX IF NOT EXISTS idx_interventions_user    ON interventions(user_id);
CREATE INDEX IF NOT EXISTS idx_interventions_date    ON interventions(session_date);
CREATE INDEX IF NOT EXISTS idx_clans_cohort          ON clans(cohort_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_clans_name_cohort ON clans(name, cohort_id);
CREATE INDEX IF NOT EXISTS idx_cohorts_sede          ON cohorts(sede_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cohorts_name_sede ON cohorts(name, sede_id);

-- ── Seed base data ────────────────────────────────────────────────────────────
INSERT INTO roles(name) VALUES ('admin'),('lider'),('mentor'),('interventor')
    ON CONFLICT (name) DO NOTHING;

INSERT INTO routes(name) VALUES ('basica'),('avanzada')
    ON CONFLICT (name) DO NOTHING;

INSERT INTO intervention_types(name)
    VALUES ('initial_evaluation'),('follow_up'),('risk_assessment'),('closing'),('other')
    ON CONFLICT (name) DO NOTHING;

INSERT INTO sedes(name) VALUES ('Medellin'),('Barranquilla')
    ON CONFLICT (name) DO NOTHING;
-- Note: run `npm run seed` to create demo users and sample data

