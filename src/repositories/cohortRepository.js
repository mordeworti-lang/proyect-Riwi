'use strict';

const { pool } = require('../config/postgres');

const CohortRepository = {
    async findAll() {
        const sql = `
            SELECT co.*, s.name AS sede_name, r.name AS route_name
            FROM cohorts co
            JOIN sedes s ON s.id = co.sede_id
            JOIN routes r ON r.id = co.route_id
            ORDER BY co.sede_id, co.name
        `;
        const { rows } = await pool.query(sql);
        return rows;
    },

    async findById(id) {
        const sql = `
            SELECT co.*, s.name AS sede_name, r.name AS route_name
            FROM cohorts co
            JOIN sedes s ON s.id = co.sede_id
            JOIN routes r ON r.id = co.route_id
            WHERE co.id = $1
        `;
        const { rows } = await pool.query(sql, [id]);
        return rows[0] || null;
    },

    async findBySedeId(sedeId) {
        const sql = `
            SELECT co.*, s.name AS sede_name, r.name AS route_name
            FROM cohorts co
            JOIN sedes s ON s.id = co.sede_id
            JOIN routes r ON r.id = co.route_id
            WHERE co.sede_id = $1
            ORDER BY co.name
        `;
        const { rows } = await pool.query(sql, [sedeId]);
        return rows;
    },
};

module.exports = CohortRepository;
