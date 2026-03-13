'use strict';

const bcrypt = require('bcryptjs');
const UserRepository = require('../repositories/userRepository');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const UnauthorizedError = require('../exceptions/UnauthorizedError');
const ValidationError = require('../exceptions/ValidationError');

const SALT_ROUNDS = 12;

const AuthService = {
    async login(email, password) {
        if (!email || !password) throw new ValidationError('Email and password are required');

        const user = await UserRepository.findByEmail(email.trim().toLowerCase());
        if (!user) throw new UnauthorizedError('Invalid credentials');

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) throw new UnauthorizedError('Invalid credentials');

        const payload = { id: user.id, email: user.email, role: user.role_name };
        return {
            accessToken:  signAccessToken(payload),
            refreshToken: signRefreshToken(payload),
            user: { id: user.id, fullName: user.full_name, email: user.email, role: user.role_name },
        };
    },

    async refresh(token) {
        if (!token) throw new UnauthorizedError('Refresh token required');
        let decoded;
        try {
            decoded = verifyRefreshToken(token);
        } catch {
            throw new UnauthorizedError('Invalid or expired refresh token');
        }
        const user = await UserRepository.findById(decoded.id);
        if (!user) throw new UnauthorizedError('User no longer exists');

        const payload = { id: user.id, email: user.email, role: user.role_name };
        return { accessToken: signAccessToken(payload) };
    },

    async register({ fullName, email, password, roleId = 1 }) {
        if (!fullName || !email || !password) throw new ValidationError('All fields are required');

        const cleanEmail = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) throw new ValidationError('Invalid email format');

        if (password.length < 8) throw new ValidationError('Password must be at least 8 characters');

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        return UserRepository.create({ fullName: fullName.trim(), email: cleanEmail, passwordHash, roleId });
    },
};

module.exports = AuthService;
