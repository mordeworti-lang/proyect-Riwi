'use strict';

const { pool } = require('../config/postgres');

const ClanRepository = {
    async findById(id) {
        const sql = `
            SELECT cl.*, co.name AS cohort_name, s.name AS sede_name, r.name AS route_name
            FROM clans cl
            JOIN cohorts co ON co.id = cl.cohort_id
            JOIN sedes s ON s.id = co.sede_id
            JOIN routes r ON r.id = co.route_id
            WHERE cl.id = $1
        `;
        const { rows } = await pool.query(sql, [id]);
        return rows[0] || null;
    },

    async findByCohortId(cohortId) {
        const sql = `
            SELECT
                cl.*,
                co.name      AS cohort_name,
                co.sede_id,
                r.name       AS route_name,
                s.name       AS sede_name
            FROM clans cl
            JOIN cohorts co ON co.id = cl.cohort_id
            JOIN routes  r  ON r.id  = co.route_id
            JOIN sedes   s  ON s.id  = co.sede_id
            WHERE cl.cohort_id = $1
            ORDER BY cl.shift ASC, cl.name ASC
        `;
        const { rows } = await pool.query(sql, [cohortId]);
        return rows;
    },

    /** Average score per clan (from couders) */
    async averageScore(clanId) {
        const sql = `
            SELECT ROUND(AVG(average_score), 2) AS avg_score
            FROM couders
            WHERE clan_id = $1 AND average_score IS NOT NULL
        `;
        const { rows } = await pool.query(sql, [clanId]);
        return parseFloat(rows[0].avg_score) || 0;
    },
};

module.exports = ClanRepository;
