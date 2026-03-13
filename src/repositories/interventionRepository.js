'use strict';

const { pool } = require('../config/postgres');

const InterventionRepository = {
    async findByCouderId(couderId, periodFilter = null) {
        let sql = `
            SELECT
                i.id,
                i.notes,
                i.session_date,
                i.session_time,
                i.created_at,
                it.name AS intervention_type,
                u.full_name AS added_by
            FROM interventions i
            JOIN intervention_types it ON it.id = i.intervention_type_id
            JOIN users u ON u.id = i.user_id
            WHERE i.couder_id = $1
        `;
        const params = [couderId];

        if (periodFilter) {
            params.push(periodFilter.from, periodFilter.to);
            sql += ` AND i.session_date BETWEEN $2 AND $3`;
        }

        sql += ` ORDER BY i.session_date DESC, i.session_time DESC`;
        const { rows } = await pool.query(sql, params);
        return rows;
    },

    async create({ couderId, userId, interventionTypeId, notes, sessionDate, sessionTime }) {
        const sql = `
            WITH inserted AS (
                INSERT INTO interventions
                    (couder_id, user_id, intervention_type_id, notes, session_date, session_time)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            )
            SELECT
                ins.id,
                ins.couder_id,
                ins.user_id,
                ins.intervention_type_id,
                ins.notes,
                ins.session_date,
                ins.session_time,
                ins.created_at,
                it.name       AS intervention_type,
                u.full_name   AS added_by
            FROM inserted ins
            JOIN intervention_types it ON it.id = ins.intervention_type_id
            JOIN users              u  ON u.id  = ins.user_id
        `;
        const { rows } = await pool.query(sql, [
            couderId, userId, interventionTypeId, notes, sessionDate, sessionTime,
        ]);
        return rows[0];
    },

    async findById(id) {
        const sql = `
            SELECT
                i.id,
                i.couder_id,
                i.user_id,
                i.intervention_type_id,
                i.notes,
                i.session_date,
                i.session_time,
                i.created_at,
                it.name AS intervention_type,
                u.full_name AS added_by
            FROM interventions i
            JOIN intervention_types it ON it.id = i.intervention_type_id
            JOIN users u ON u.id = i.user_id
            WHERE i.id = $1
        `;
        const { rows } = await pool.query(sql, [id]);
        return rows[0] || null;
    },

    async update(id, { notes, sessionDate, sessionTime, interventionTypeId }) {
        const sql = `
            UPDATE interventions
            SET notes = $1, session_date = $2, session_time = $3, intervention_type_id = $4
            WHERE id = $5
            RETURNING *
        `;
        const { rows } = await pool.query(sql, [notes, sessionDate, sessionTime, interventionTypeId, id]);
        return rows[0] || null;
    },

    async delete(id) {
        const { rowCount } = await pool.query('DELETE FROM interventions WHERE id = $1', [id]);
        return rowCount > 0;
    },
};

module.exports = InterventionRepository;
