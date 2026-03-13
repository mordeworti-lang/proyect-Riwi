'use strict';

const { pool } = require('../config/postgres');

/**
 * AiAnalysisRepository — stores AI analyses in PostgreSQL (ai_analyses table).
 * MongoDB is NOT required for this feature.
 */
const AiAnalysisRepository = {
    async save({ couderId, periodLabel, summary, diagnosis, suggestions }) {
        // Normalise suggestions to a plain string (join array if needed)
        const suggestionsStr = Array.isArray(suggestions)
            ? suggestions.join('\n')
            : String(suggestions || '');

        const sql = `
            INSERT INTO ai_analyses (couder_id, period_label, summary, diagnosis, suggestions)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, couder_id AS "couderId", period_label AS "periodLabel",
                      summary, diagnosis, suggestions, created_at AS "createdAt"
        `;
        const { rows } = await pool.query(sql, [
            parseInt(couderId, 10),
            periodLabel || 'all',
            summary,
            diagnosis,
            suggestionsStr,
        ]);

        // Return in the same shape as before, with suggestions as array
        const row = rows[0];
        return {
            ...row,
            suggestions: row.suggestions ? row.suggestions.split('\n').filter(Boolean) : [],
        };
    },

    async findByCouderId(couderId) {
        const sql = `
            SELECT id, couder_id AS "couderId", period_label AS "periodLabel",
                   summary, diagnosis, suggestions, created_at AS "createdAt"
            FROM ai_analyses
            WHERE couder_id = $1
            ORDER BY created_at DESC
        `;
        const { rows } = await pool.query(sql, [parseInt(couderId, 10)]);
        return rows.map(r => ({
            ...r,
            suggestions: r.suggestions ? r.suggestions.split('\n').filter(Boolean) : [],
        }));
    },

    async findById(id) {
        const sql = `
            SELECT id, couder_id AS "couderId", period_label AS "periodLabel",
                   summary, diagnosis, suggestions, created_at AS "createdAt"
            FROM ai_analyses
            WHERE id = $1
        `;
        const { rows } = await pool.query(sql, [id]);
        if (!rows[0]) return null;
        const r = rows[0];
        return {
            ...r,
            suggestions: r.suggestions ? r.suggestions.split('\n').filter(Boolean) : [],
        };
    },
};

module.exports = AiAnalysisRepository;
