'use strict';

const { pool } = require('../config/postgres');

const UserRepository = {
    async findByEmail(email) {
        const sql = `
            SELECT u.*, r.name AS role_name
            FROM users u
            JOIN roles r ON r.id = u.role_id
            WHERE u.email = $1 AND u.is_active = TRUE
        `;
        const client = await pool.connect();
        try {
            const { rows } = await client.query(sql, [email]);
            return rows[0] || null;
        } finally {
            client.release();
        }
    },

    async findById(id) {
        const sql = `
            SELECT u.id, u.full_name, u.email, u.is_active, u.created_at, r.name AS role_name
            FROM users u
            JOIN roles r ON r.id = u.role_id
            WHERE u.id = $1
        `;
        const client = await pool.connect();
        try {
            const { rows } = await client.query(sql, [id]);
            return rows[0] || null;
        } finally {
            client.release();
        }
    },

    async create({ fullName, email, passwordHash, roleId }) {
        const sql = `
            INSERT INTO users (full_name, email, password_hash, role_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id, full_name, email, role_id, created_at
        `;
        const client = await pool.connect();
        try {
            const { rows } = await client.query(sql, [fullName, email, passwordHash, roleId]);
            return rows[0];
        } finally {
            client.release();
        }
    },
};

module.exports = UserRepository;
