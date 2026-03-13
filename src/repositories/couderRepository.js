'use strict';

const { pool } = require('../config/postgres');

/**
 * CouderRepository — all raw SQL for couders table.
 * No business logic here; that belongs in the service layer.
 */
const CouderRepository = {
    /**
     * Find a couder by national ID (CC).
     * Returns full couder info joined with clan, cohort, sede, route.
     */
    async findByNationalId(nationalId) {
        const sql = `
            SELECT
                c.id,
                c.national_id,
                c.full_name,
                c.email,
                c.phone,
                c.status,
                c.average_score,
                c.created_at,
                cl.id        AS clan_id,
                cl.name      AS clan_name,
                cl.shift     AS clan_shift,
                cl.tl_name,
                co.id        AS cohort_id,
                co.name      AS cohort_name,
                s.id         AS sede_id,
                s.name       AS sede_name,
                r.id         AS route_id,
                r.name       AS route_name
            FROM couders c
            JOIN clans   cl ON cl.id = c.clan_id
            JOIN cohorts co ON co.id = cl.cohort_id
            JOIN sedes   s  ON s.id  = co.sede_id
            JOIN routes  r  ON r.id  = co.route_id
            WHERE c.national_id = $1
        `;
        const { rows } = await pool.query(sql, [nationalId]);
        return rows[0] || null;
    },

    async findById(id) {
        const sql = `
            SELECT
                c.id, c.national_id, c.full_name, c.email, c.phone,
                c.status, c.average_score, c.created_at,
                cl.id AS clan_id, cl.name AS clan_name, cl.shift AS clan_shift, cl.tl_name,
                co.id AS cohort_id, co.name AS cohort_name,
                s.id AS sede_id, s.name AS sede_name,
                r.id AS route_id, r.name AS route_name
            FROM couders c
            JOIN clans cl ON cl.id = c.clan_id
            JOIN cohorts co ON co.id = cl.cohort_id
            JOIN sedes s ON s.id = co.sede_id
            JOIN routes r ON r.id = co.route_id
            WHERE c.id = $1
        `;
        const { rows } = await pool.query(sql, [id]);
        return rows[0] || null;
    },

    async findByClanId(clanId) {
        const sql = `
            SELECT id, national_id, full_name, email, status, average_score, created_at
            FROM couders
            WHERE clan_id = $1
            ORDER BY full_name ASC
        `;
        const { rows } = await pool.query(sql, [clanId]);
        return rows;
    },

    /** Dashboard stats per sede */
    async statsBySede(sedeId) {
        const sql = `
            SELECT
                COUNT(*)                                          AS total,
                COUNT(*) FILTER (WHERE c.status = 'active')      AS active,
                COUNT(*) FILTER (WHERE c.status = 'withdrawn')   AS withdrawn,
                COUNT(*) FILTER (WHERE c.status = 'completed')   AS completed
            FROM couders c
            JOIN clans cl   ON cl.id = c.clan_id
            JOIN cohorts co ON co.id = cl.cohort_id
            WHERE co.sede_id = $1
        `;
        const { rows } = await pool.query(sql, [sedeId]);
        return rows[0];
    },

    async statsByCohort(cohortId) {
        const sql = `
            SELECT
                COUNT(*)                                          AS total,
                COUNT(*) FILTER (WHERE c.status = 'active')      AS active,
                COUNT(*) FILTER (WHERE c.status = 'withdrawn')   AS withdrawn,
                COUNT(*) FILTER (WHERE c.status = 'completed')   AS completed
            FROM couders c
            JOIN clans cl ON cl.id = c.clan_id
            WHERE cl.cohort_id = $1
        `;
        const { rows } = await pool.query(sql, [cohortId]);
        return rows[0];
    },

    async statsByClan(clanId) {
        const sql = `
            SELECT
                COUNT(*)                                          AS total,
                COUNT(*) FILTER (WHERE status = 'active')        AS active,
                COUNT(*) FILTER (WHERE status = 'withdrawn')     AS withdrawn,
                COUNT(*) FILTER (WHERE status = 'completed')     AS completed
            FROM couders
            WHERE clan_id = $1
        `;
        const { rows } = await pool.query(sql, [clanId]);
        return rows[0];
    },

    /** Count couders that have at least one intervention (attended) per clan */
    async attendedCountByClan(clanId) {
        const sql = `
            SELECT COUNT(DISTINCT c.id) AS attended
            FROM couders c
            JOIN interventions i ON i.couder_id = c.id
            WHERE c.clan_id = $1
        `;
        const { rows } = await pool.query(sql, [clanId]);
        return parseInt(rows[0].attended, 10);
    },

    async attendedCountByCohort(cohortId) {
        const sql = `
            SELECT COUNT(DISTINCT c.id) AS attended
            FROM couders c
            JOIN clans cl ON cl.id = c.clan_id
            JOIN interventions i ON i.couder_id = c.id
            WHERE cl.cohort_id = $1
        `;
        const { rows } = await pool.query(sql, [cohortId]);
        return parseInt(rows[0].attended, 10);
    },

    async attendedCountBySede(sedeId) {
        const sql = `
            SELECT COUNT(DISTINCT c.id) AS attended
            FROM couders c
            JOIN clans cl ON cl.id = c.clan_id
            JOIN cohorts co ON co.id = cl.cohort_id
            JOIN interventions i ON i.couder_id = c.id
            WHERE co.sede_id = $1
        `;
        const { rows } = await pool.query(sql, [sedeId]);
        return parseInt(rows[0].attended, 10);
    },
};

module.exports = CouderRepository;
